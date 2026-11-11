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
async function checkRoute(session, level, count, turns, potionMap, talismanMap) {
  const result = await session.page.evaluate(({ level, count, turns, potionMap, talismanMap }) => {
    const state = () => __MANRU_QA_UI__.state();
    const release = __MANRU_RELEASE__, travel = __MANRU_QA_SEALING__.branch;
    const st = state(), p = st.player;
    const up = st.branchPortals105.find(portal => portal.id === 'up');
    if (st.floor !== 9 || st.branchContext105?.id !== 'palace' || st.branchContext105.level !== 2 ||
        !up || Math.max(Math.abs(p.x - up.x), Math.abs(p.y - up.y)) !== 1) throw Error('missing 2F entry landing');
    if (p.level !== level || p.hp !== p.maxHp || p.focus !== p.maxFocus ||
        p.inventory.filter(item => item.potionKind === 'heal_small').reduce((sum, item) => sum + item.count, 0) !== count) throw Error('ghost body lost');
    const checkContinuity = () => {
      const run = state(), map = run.knowledge56.potionMap;
      for (const [kind, appearance] of Object.entries(talismanMap)) {
        if (run.knowledge56.talismanMap[kind] !== appearance) throw Error('talisman map changed for ' + kind);
      }
      if (turns === 1380 && !run.knowledge56.talismanKnown.elem_fire) throw Error('talisman identification lost');
      if (turns === 1380 && !run.knowledge56.potionKnown.focus) throw Error('potion identification lost');
      if (run.turn !== turns) throw Error('turn count changed: ' + run.turn);
      for (const [kind, appearance] of Object.entries(potionMap)) {
        if (map[kind] !== appearance) throw Error('potion map changed for ' + kind);
      }
      for (const item of [...run.player.inventory, ...run.items]) {
        if (item.type === 'potion' && !item.mineItem105 && map[item.potionKind] && (item.appearance56 || map[item.potionKind]) !== map[item.potionKind]) {
          throw Error('bottle colour mismatch for ' + JSON.stringify([run.branchContext105?.level, item.potionKind, item.appearance56, map[item.potionKind]]));
        }
      }
    };
    checkContinuity();
    if (!release.load()) throw Error('recovered run was not saved');
    checkContinuity();
    const transition = destination => {
      const portal = state().branchPortals105.find(candidate => candidate.to === destination);
      if (!portal || !travel(portal)) throw Error('broken route to ' + destination);
      checkContinuity();
      const run = state();
      return run.branchContext105 ? run.branchContext105.id + ':' + run.branchContext105.level : 'main:' + run.floor;
    };
    return [transition('palace:1'), transition('main:9'), transition('palace:1'), transition('palace:2')];
  }, { level, count, turns, potionMap, talismanMap });
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
    const { potionMap, talismanMap } = await local.page.evaluate(() => {
      const run = __MANRU_QA_UI__.state(), p = run.player;
      run.turn = 1380;
      const map = { ...run.knowledge56.potionMap };
      run.knowledge56.talismanKnown.elem_fire = true;
      run.knowledge56.potionKnown.focus = true;
      p.level = 8;
      p.inventory = JSON.parse(__MANRU_QA_DUEL__.ghostOf(p.classId, 3)).inventory;
      p.inventory[0].appearance56 = map.heal_small;
      p.focus = 1;
      if (!__MANRU_QA_DUEL__.killSelf()) throw Error('death fixture failed');
      return { potionMap: map, talismanMap: { ...run.knowledge56.talismanMap } };
    });
    await openRecords(local);
    await submit(local, '19720');
    assert.match(await local.page.locator('.giftNote').textContent(), /알 수 없는 코드/);
    await submit(local, '19721');
    await checkRoute(local, 8, 3, 1380, potionMap, talismanMap);
  } finally { await local.close(); }

  const legacy = await openSession(browser, root, { seed: 4952 });
  try {
    const ghost = await legacy.page.evaluate(() => {
      const body = JSON.parse(__MANRU_QA_DUEL__.ghostOf('wanderer', 3));
      body.inventory[0].appearance56 = 'azure';
      body.inventory.push({ ...body.inventory[0], count: 2 });
      body.inventory.push({ ...window.MANRU_TALISMANS.find(item => item.talismanKind === 'elem_fire'), appearance56: 'jadepaper', count: 1 });
      body.level = 11;
      const A = __MANRU_QA_STATS__.api;
      A.rememberRun({ id: 'older-death', cause: '함정' });
      A.rememberRun({ id: 'newest-death', cause: '취객', turns: 2084 });
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
    await legacy.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), map = st.knowledge56.talismanMap;
      delete st.branchWorld105.recoveryTalismans;
      [map.elem_fire, map.elem_water] = [map.elem_water, map.elem_fire];
      if (!__MANRU_RELEASE__.save().ok) throw Error('could not create pre-update continuation fixture');
    });
    await legacy.page.reload();
    await legacy.page.locator('#continueBtn').click();
    await checkRoute(legacy, 11, 5, 2084, { heal_small: 'azure' }, { elem_fire: 'jadepaper' });
    assert.deepEqual(requested, ['newest-death']);
  } finally { await legacy.close(); }
  console.log('PASS: recovery code, latest local and archived ghosts, save/load, palace 2F ↔ 1F ↔ main 9F');
} finally { await browser.close(); }
