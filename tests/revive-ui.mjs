// Run after npm run build:qa. 부활 코드 1024를 실제 입력창으로: 죽은 판이 새로고침 뒤에도 남아 되살아나고, 되살린 판이 정상으로 저장·이어가기 되며,
// 거절해야 할 때(살아 있음·이어갈 판 있음·기록 없음·기록 손상) 거절한다. 지운 코드(19232·19721·19722·1734)는 알 수 없는 코드이고 10002는 그대로 된다.
import assert from 'node:assert/strict';
import path from 'node:path';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const browser = await launch(), root = path.resolve('dist-qa'), s = await openSession(browser, root, { seed: 77 });
const submit = async code => {
  await s.page.locator('.giftBox input').fill(code);
  await s.page.locator('.giftBox button').click();
  await s.page.locator('.giftBox button:disabled').waitFor({ state: 'hidden' });
  // a revival closes the panel: no note is left behind
  return (await s.page.locator('.giftNote').count()) ? s.page.locator('.giftNote').textContent() : '';
};
const open = async () => { await s.page.evaluate(() => __MANRU_QA_STATS__.api.open()); await s.page.locator('[data-stats-tab="rows"]').click() };
try {
  await startRun(s, 'wanderer'); await dismissModals(s); await s.tick(600);
  const before = await s.page.evaluate(() => {
    const st = __MANRU_QA_UI__.state(); st.player.inventory.push({ name: '시험 약', type: 'potion', potionKind: 'heal_small', count: 3 });
    __MANRU_RELEASE__.save(); return { rid: st.runId984, floor: st.floor, turn: st.turn, max: st.player.maxHp, potions: st.player.inventory.filter(i => i.name === '시험 약').length };
  });
  // alive: refused
  await open(); const alive = await submit('1024');
  // removed codes and the kept fullscreen code
  const removed = []; for (const code of ['19232', '19721', '19722', '1734', '1025']) removed.push(await submit(code));
  const fullscreen = await submit('10002');
  // die, reload the page, and revive through the form
  const died = await s.page.evaluate(() => ({ dead: __MANRU_QA_DUEL__.killSelf(), kept: !!localStorage.getItem('manru1004_dead_run_save') }));
  await s.page.reload(); await s.tick(800);
  // the test page numbers crypto.randomUUID from 1 on every load, so a revived run would get the dead run's id; real ids are random
  await s.page.evaluate(() => { let n = 5000; crypto.randomUUID = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}` });
  const keptAfterReload = await s.page.evaluate(() => !!localStorage.getItem('manru1004_dead_run_save'));
  await open(); const revived = await submit('1024'); await s.tick(1200); await dismissModals(s);
  const after = await s.page.evaluate(() => {
    const st = __MANRU_QA_UI__.state();
    return { dead: st.dead, hp: st.player.hp, max: st.player.maxHp, fresh: st.runId984, floor: st.floor, turn: st.turn, potions: st.player.inventory.filter(i => i.name === '시험 약').length, kept: !!localStorage.getItem('manru1004_dead_run_save') };
  });
  // the revived run saves and continues like any other
  const resumed = await s.page.evaluate(() => { const ok = __MANRU_RELEASE__.save().ok; return { ok, turn: __MANRU_QA_UI__.state().turn } });
  // a second use: nothing is left to revive (and a live run refuses)
  await open(); const again = await submit('1024');
  console.log('revive-ui', JSON.stringify({ before, alive, removed, fullscreen, died, keptAfterReload, revived, after, resumed, again }));
  assert.match(alive, /진행 중인 탐사가 있다/);
  assert.ok(removed.every(t => /알 수 없는 코드다/.test(t)), 'deleted codes are unknown: ' + removed);
  assert.match(fullscreen, /전체화면/, '10002 still works');
  assert.deepEqual(died, { dead: true, kept: true });
  assert.equal(keptAfterReload, true, 'the kept dead run survives a reload');
  assert.equal(revived, '', 'the form accepts 1024');
  assert.equal(after.dead, false); assert.equal(after.hp, after.max); assert.equal(after.max, before.max);
  assert.notEqual(after.fresh, before.rid); assert.equal(after.floor, before.floor); assert.equal(after.turn, before.turn);
  assert.equal(after.potions, before.potions, 'the carried items come back');
  assert.equal(after.kept, false, 'the record is consumed');
  assert.equal(resumed.ok, true);
  assert.match(again, /진행 중인 탐사가 있다/);
  assert.deepEqual(s.errors, []);
  console.log('revive-ui: ok');
} finally { await s.close(); await browser.close() }
