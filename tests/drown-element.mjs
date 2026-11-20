// Run after npm run build:qa. 물에 빠져 뭍을 붙잡을 때 깎이는 체력은 수속성 피해다: 저항 단계만큼 줄고, 4단계는 깎이지 않는다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.dz={state:()=>state,TT,fall:(e,x,y,o)=>resolveEntityHazard1005(e,TT.WATER,x,y,o,{consumeTurn:false})};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const st = dz.state(), p = st.player, r = [];
  const { x, y } = p;
  for (const lvl of [0, 1, 2, 3, 4]) {
    p.armor = { name: 't', resist: lvl ? { water: lvl } : {} };
    p.x = x; p.y = y; p.hp = p.maxHp = 100;
    dz.fall(p, x + 1, y, { x, y });
    r.push(p.hp);
  }
  return r;
});
assert.deepEqual(out, [50, 65, 75, 88, 100], JSON.stringify(out));
assert.deepEqual(errors, []);
console.log('drown-element', JSON.stringify(out));
await browser.close();
console.log('drown-element: ok');
process.exit(0);
