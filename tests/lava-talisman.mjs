// Run after npm run build:qa. 용암부적은 물·용궁 바닥 같은 길 종류와 상관없이 십자 5칸에 용암을 깐다. 보스가 선 칸만 비운다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.lv={state:()=>state,TT,A:()=>globalThis.__MANRU_TALISMAN74_ACTIONS__,mon:()=>scaledMonster(MONSTERS.find(m=>m.name==="객잔 쥐"),5)};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const st = lv.state(), p = st.player, T = lv.TT;
  const cx = p.x, cy = p.y, tx = cx + 2, ty = cy;
  const cells = { c: [tx, ty], l: [tx - 1, ty], r: [tx + 1, ty], u: [tx, ty - 1], d: [tx, ty + 1] };
  st.monsters = [];
  const tiles = { c: T.GILDED_FLOOR, l: T.WATER, r: T.WOOD_FLOOR, u: 500, d: T.FLOOR };
  for (const [n, [x, y]] of Object.entries(cells)) { st.map[y][x] = tiles[n]; st.seen.add(x + ',' + y) }
  const boss = lv.mon(); boss.boss = true; boss.x = cells.d[0]; boss.y = cells.d[1]; boss.hp = boss.maxHp = 999; st.monsters.push(boss);
  lv.A().dispatch({ type: 'talisman', name: '용암부적', talismanKind: 'f_lava', fusion74: true, fusionMode74: 'target', fusionEffect74: 'lava', targetRange: 5, count: 1 });
  const cast = lv.A().castTarget(tx, ty);
  const r = { cast }; for (const [n, [x, y]] of Object.entries(cells)) r[n] = st.map[y][x] === T.LAVA;
  return r;
});
assert.deepEqual(out, { cast: true, c: true, l: true, r: true, u: true, d: false }, JSON.stringify(out));
assert.deepEqual(errors, []);
console.log('lava-talisman', JSON.stringify(out));
await browser.close();
console.log('lava-talisman: ok');
process.exit(0);
