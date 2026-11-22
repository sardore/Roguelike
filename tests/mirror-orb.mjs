// Run after npm run build:qa. 천면경 검: 최대 사거리로 공격하면 그 적 자리에 천명탄이 터져 성광 피해를 주고 8방향 5칸에 파편 장판이 깔린다. 가까운 공격에는 터지지 않는다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.mo={state:()=>state,TT,tile:setTerrainTile58,occ:OccupancyService,weapon:()=>({...clone(adef46('mirror_blade')),count:1}),range:weaponRange,
 spawn:(n,p)=>spawnNamed(n,p,{placementMode:'exact',legendDungeon47:'mirror_blade'}),atk:m=>attackPlayer(m,0),view:resetVisualState,vis:()=>VisibilityService.compute()};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 31 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => {
  const st = mo.state();
  for (const m of [...st.monsters]) mo.occ.removeMonster(m);
  const cx = Math.floor(st.map[0].length / 2), cy = Math.floor(st.map.length / 2);
  for (let dy = -9; dy <= 9; dy++) for (let dx = -9; dx <= 9; dx++) mo.tile(st.map, cx + dx, cy + dy, mo.TT.FLOOR);
  Object.assign(st.player, { x: cx, y: cy, hp: 999, maxHp: 999, weapon: mo.weapon() }); st.player.weapon.range = 2; mo.view(); mo.vis();
  const r = { range: mo.range() };
  const fieldCells = () => (st.tempFields || []).filter(f => f.kind === 'mirrorShards' && f.ttl > 0).flatMap(f => f.cells.map(c => c.x + ',' + c.y));
  const place = (dx, dy) => { const m = mo.spawn('거울 시녀', { x: cx + dx, y: cy + dy }); m.hp = m.maxHp = 500; m.def = 0; m.eva = 0; return m };
  // 1) adjacent: no orb
  let m = place(1, 0); mo.atk(m); r.closeField = fieldCells().length; mo.occ.removeMonster(m);
  // 2) at the longest reach (2 cells): orb, shards along eight rays to five cells
  m = place(2, 0); const hp0 = m.hp; mo.atk(m); const cells = new Set(fieldCells());
  r.farDamage = hp0 - m.hp; r.farField = cells.size;
  r.rays = { east: [1, 2, 3, 4, 5].every(i => cells.has((cx + 2 + i) + ',' + cy)), north: [1, 2, 3, 4, 5].every(i => cells.has((cx + 2) + ',' + (cy - i))), diag: [1, 2, 3, 4, 5].every(i => cells.has((cx + 2 + i) + ',' + (cy + i))), reach6: cells.has((cx + 2 + 6) + ',' + cy) };
  r.playerSafe = st.player.hp === 999;
  return { r };
});
console.log(JSON.stringify(out));
const o = out.r;
assert.equal(o.range, 2, JSON.stringify(o));
assert.equal(o.closeField, 0, '가까운 공격에는 천명탄이 없어야 한다 ' + JSON.stringify(o));
assert.ok(o.farField >= 8 * 3, '파편 장판이 깔리지 않았다 ' + JSON.stringify(o));
assert.ok(o.rays.east && o.rays.north && o.rays.diag, '8방향 5칸 파편이 아니다 ' + JSON.stringify(o.rays));
assert.equal(o.rays.reach6, false, '6칸째에는 깔리면 안 된다');
assert.ok(o.farDamage > 0, '피해가 없다');
assert.ok(o.playerSafe, '내가 맞았다');
assert.deepEqual(errors, []);
await browser.close();
console.log('mirror-orb: ok');
process.exit(0);
