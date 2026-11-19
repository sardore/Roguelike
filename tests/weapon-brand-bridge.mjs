// Run after npm run build:qa. 속성 각인 무기(철두창 등)로 종이다리 위의 대상을 쳐도 종이다리가 붕괴 예고되지 않는다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.brandTest={state:()=>state,TT,brand:applyWeaponBrandHit};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 5 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(500);
const res = await s.page.evaluate(() => {
  const st = brandTest.state(), T = brandTest.TT, out = {};
  for (const elem of ['water', 'fire', 'ice', 'shock', 'earth', 'grass', 'holy']) {
    const x = st.player.x + 2, y = st.player.y;
    for (let dx = -3; dx <= 3; dx++) for (let dy = -2; dy <= 2; dy++) st.map[y + dy][x + dx] = T.WATER;
    st.map[y][x] = T.PAPER_BRIDGE; st.monsters = [];
    const mon = { name: '시험체', x, y, hp: 500, maxHp: 500, atk: 0, def: 0, eva: 0, kind: 'human', shape: 'human', combatantId54: 't' + elem };
    st.monsters.push(mon);
    st.player.weapon = { name: '철두창', type: 'weapon', kind: 'spear', range: 4, elementBrand74: elem, atk: 2 };
    st.hazard1005 = st.hazard1005 || { armed: {}, collapsed: {}, lastWarn: {} }; st.hazard1005.armed = {};
    brandTest.brand(st.player, mon, 5);
    out[elem] = { armed: Object.keys(st.hazard1005.armed || {}).length, bridge: st.map[y][x] === T.PAPER_BRIDGE };
  }
  return out;
});
console.log('brand bridge', JSON.stringify(res));
for (const [elem, r] of Object.entries(res)) { assert.equal(r.armed, 0, elem + ' 각인 무기가 종이다리를 붕괴 예고했다'); assert.ok(r.bridge, elem + ' 각인 무기가 종이다리를 없앴다'); }
console.log('weapon-brand-bridge: ok');
await browser.close(); process.exit(0);
