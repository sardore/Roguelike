// Run after npm run build:qa. 23층(수은도시)은 회색 석축 도시 그림을 쓴다: 포장·판자 바닥, 회벽 정면·기와지붕, 석축 위 물길, 판자 다리. 다른 층에는 쓰지 않는다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.ca={state:()=>state,on:()=>cityOn(),go:f=>{while(state.floor<f){resetFloorScopedState57();state.floor++;NormalFloorGenerator.generate()}},see:()=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)state.seen.add(x+","+y);updateAll()}};';
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
  for (const f of [22, 23, 24]) {
    out[name][f] = await s.page.evaluate(f => { ca.go(f); ca.see(); return ca.on() }, f);
    await s.tick(700);
  }
  out[name].errors = errors;
  await ctx.close();
}
console.log(JSON.stringify(out));
for (const name of ['desktop', 'mobile']) {
  assert.deepEqual([22, 23, 24].map(f => out[name][f]), [false, true, false]);
  assert.deepEqual(out[name].errors, [], name + ' 그리기 오류');
}
await browser.close();
console.log('city-art: ok');
process.exit(0);
