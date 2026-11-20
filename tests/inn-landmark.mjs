// Run after npm run build:qa. 청풍루 지형방: 1층은 등롱 안뜰·열주 대회랑·연못 정원 중 하나(시작 정원 옆에 들어갈 때),
// 3층은 그 셋에 객사동·회랑 정원·저잣거리를 더한 것 중 하나가 늘 놓인다. 실제 층 이동 순서로 만들고,
// 게임의 최종 연결 감사와 1층 시작 구역 감사가 통과해야 한다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.lmk={state:()=>state,ng:()=>newGame(CLASSES[0]),adv:()=>{resetFloorScopedState57();state.floor++;NormalFloorGenerator.generate()},tutorial:()=>tutorialEntryAudit()};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 21 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const T = lmk, r = { kinds: { 1: {}, 3: {} }, none: { 1: 0, 3: 0 }, bad: [] };
  for (let i = 0; i < 14; i++) {
    T.ng();
    for (const f of [1, 3]) {
      if (f === 3) { T.adv(); T.adv(); }
      const st = T.state(), g = st.grandTerrain93, c = st.finalConnectivity51;
      if (g) r.kinds[f][g.kind] = (r.kinds[f][g.kind] || 0) + 1; else r.none[f]++;
      if (st.floor !== f) r.bad.push('floor ' + st.floor + ' expected ' + f);
      if (c && c.ok === false) r.bad.push('connectivity f' + f + ' run ' + i);
      if (f === 1) { const t = T.tutorial(); if (t && t.ok === false) r.bad.push('tutorial run ' + i) }
    }
  }
  return r;
});
console.log('inn-landmark', JSON.stringify(out));
const one = ['courtyard', 'colonnade', 'pond'], three = ['lodge', 'cloister', 'bazaar', 'courtyard', 'colonnade', 'pond'];
assert.deepEqual(out.bad, []);
assert.ok(Object.keys(out.kinds[1]).every(k => one.includes(k)), 'floor 1 landmarks come from the inn set');
assert.ok(Object.keys(out.kinds[3]).every(k => three.includes(k)), 'floor 3 landmarks come from the inn set');
assert.equal(out.none[3], 0, 'floor 3 always has a landmark');
assert.ok(out.none[1] <= 4, 'floor 1 usually fits one: ' + out.none[1]);
assert.ok(Object.keys(out.kinds[3]).length >= 3, 'floor 3 varies: ' + Object.keys(out.kinds[3]));
assert.deepEqual(errors, []);
console.log('inn-landmark: ok');
await browser.close(); process.exit(0);
