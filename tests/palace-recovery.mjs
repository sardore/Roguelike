import assert from 'node:assert/strict';
import path from 'node:path';
import { launch, openSession, startRun } from './harness.mjs';

const browser = await launch();
const root = path.resolve('dist-qa');
async function submit(session, code) {
  await session.page.locator('.giftBox input').fill(code);
  await session.page.locator('.giftBox button').click();
  await session.page.locator('.giftBox button:disabled').waitFor({ state: 'hidden' });
}
async function openRecords(session) {
  await session.page.evaluate(() => __MANRU_QA_STATS__.api.open());
  await session.page.locator('[data-stats-tab="rows"]').click();
}
async function checkRoute(session, level, count) {
  const result = await session.page.evaluate(({ level, count }) => {
    const state = () => __MANRU_QA_UI__.state();
    const release = __MANRU_RELEASE__, travel = __MANRU_QA_SEALING__.branch;
    const st = state(), p = st.player;
    const up = st.branchPortals105.find(portal => portal.id === 'up');
    if (st.floor !== 9 || st.branchContext105?.id !== 'palace' || st.branchContext105.level !== 2 ||
        !up || Math.max(Math.abs(p.x - up.x), Math.abs(p.y - up.y)) !== 1) throw Error('missing 2F entry landing');
    if (p.level !== level || p.hp !== p.maxHp || p.focus !== p.maxFocus ||
        p.inventory.filter(item => item.potionKind === 'heal_small').reduce((sum, item) => sum + item.count, 0) !== count) throw Error('ghost body lost');
    if (!release.load()) throw Error('recovered run was not saved');
    const transition = destination => {
      const portal = state().branchPortals105.find(candidate => candidate.to === destination);
      if (!portal || !travel(portal)) throw Error('broken route to ' + destination);
      const run = state();
      return run.branchContext105 ? run.branchContext105.id + ':' + run.branchContext105.level : 'main:' + run.floor;
    };
    return [transition('palace:1'), transition('main:9'), transition('palace:1'), transition('palace:2')];
  }, { level, count });
  assert.deepEqual(result, ['palace:1', 'main:9', 'palace:1', 'palace:2']);
  assert.deepEqual(session.errors, []);
}
try {
  const local = await openSession(browser, root, { seed: 4249 });
  try {
    await startRun(local, 'wanderer');
    await openRecords(local);
    await submit(local, '19721');
    assert.match(await local.page.locator('.giftNote').textContent(), /이어갈 탐사/);
    await local.page.locator('#statsClose').click();
    await local.page.evaluate(() => {
      const p = __MANRU_QA_UI__.state().player;
      p.level = 8;
      p.inventory = JSON.parse(__MANRU_QA_DUEL__.ghostOf(p.classId, 3)).inventory;
      p.focus = 1;
      if (!__MANRU_QA_DUEL__.killSelf()) throw Error('death fixture failed');
    });
    await openRecords(local);
    await submit(local, '19720');
    assert.match(await local.page.locator('.giftNote').textContent(), /알 수 없는 코드/);
    await submit(local, '19721');
    await checkRoute(local, 8, 3);
  } finally { await local.close(); }

  const legacy = await openSession(browser, root, { seed: 4952 });
  try {
    const ghost = await legacy.page.evaluate(() => {
      const body = JSON.parse(__MANRU_QA_DUEL__.ghostOf('wanderer', 3));
      body.inventory.push({ ...body.inventory[0], count: 2 });
      body.level = 11;
      const A = __MANRU_QA_STATS__.api;
      A.rememberRun({ id: 'older-death', cause: '함정' });
      A.rememberRun({ id: 'newest-death', cause: '취객' });
      A.rememberRun({ id: 'later-clear', cause: 'End' });
      document.querySelector('meta[name="manru-stats"]').content = location.origin + '/ghost-fixture';
      return JSON.stringify(body);
    });
    const requested = [];
    await legacy.page.route('**/ghost-fixture?*', async route => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('view') !== 'ghost') return route.fulfill({ json: {} });
      requested.push(url.searchParams.get('id'));
      await route.fulfill({ json: { ok: true, body: ghost } });
    });
    const title = legacy.page.locator('#card h1').first();
    for (let tap = 0; tap < 7; tap++) await title.dispatchEvent('pointerdown', { button: 0 });
    await legacy.page.locator('[data-stats-tab="rows"]').click();
    await submit(legacy, '19721');
    await checkRoute(legacy, 11, 5);
    assert.deepEqual(requested, ['newest-death']);
  } finally { await legacy.close(); }
  console.log('PASS: recovery code, latest local and archived ghosts, save/load, palace 2F ↔ 1F ↔ main 9F');
} finally { await browser.close(); }
