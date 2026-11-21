// Run after npm run build:qa. 5테마(21~25층)는 층마다 자기 공기 연출(별빛·빛줄기·수은 반짝임·꽃잎·불씨)을 갖는다. 20층 이하와 분기 던전은 해당 없음.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.t5a={state:()=>state,air:()=>theme5Air(),go:f=>{while(state.floor<f){resetFloorScopedState57();state.floor++;NormalFloorGenerator.generate()}}};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const out = {};
for (const [name, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 780 }]]) {
  const ctx = await browser.newContext({ viewport, isMobile: name === 'mobile', hasTouch: name === 'mobile' });
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
  const errors = []; s.page.on('pageerror', e => errors.push(e.message));
  await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(200);
  out[name] = {};
  for (const f of [20, 21, 22, 23, 24, 25]) {
    out[name][f] = await s.page.evaluate(f => { t5a.go(f); const a = t5a.air(); return a ? a.kind : null }, f);
    await s.tick(500);
  }
  out[name].errors = errors;
  await ctx.close();
}
console.log(JSON.stringify(out));
for (const name of ['desktop', 'mobile']) {
  const o = out[name];
  assert.equal(o[20], null);
  assert.deepEqual([21, 22, 23, 24, 25].map(f => o[f]), ['stars', 'shafts', 'shimmer', 'petals', 'embers']);
  assert.deepEqual(o.errors, [], name + ' 그리기 오류');
}
await browser.close();
console.log('theme5-air: ok');
process.exit(0);
