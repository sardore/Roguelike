// Run after npm run build:qa. 확정 회피(처음 나를 발견하는 적의 첫 공격 회피): 문을 열고 들어서 대포가 처음 나를 보게 되는 걸음에 걸린다.
// 그 사이에 다른 몬스터가 서 있어도 시야는 막히지 않는다(벽과 문만 막는다). 이미 나를 본 적이 있는 대포나 비자발 이동에는 걸리지 않는다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.cg={state:()=>state,TT,drop:m=>OccupancyService.removeMonster(m),vis:()=>VisibilityService.compute(),
 cannon:(x,y,seen)=>{const m=scaledMonster(MONSTERS.find(d=>d.name==='대포'),14);m.x=x;m.y=y;configureMonsterTraits(m);m.hasSeenPlayer105=!!seen;OccupancyService.addMonster(m);return m},
 blocker:(x,y)=>{const m=scaledMonster(MONSTERS.find(d=>d.name==='객잔 쥐'),14);m.x=x;m.y=y;OccupancyService.addMonster(m);return m},
 // one walk from (bx,by) to (nx,ny) as the engine does it: capture, optionally open a door, land, finish
 step:(m,bx,by,nx,ny,voluntary,door)=>{const p=state.player;p.x=bx;p.y=by;delete state._movementDiscovery105;const d=captureMovementDiscovery105();if(door)setTerrainTile58(state.map,door.x,door.y,TT.OPEN_DOOR);p.x=nx;p.y=ny;finishMovementDiscovery105(d,voluntary);return movementDiscoveryEvades105(m,{delivery:'area',discoveryEvade:true})}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const st = cg.state(), p = st.player, { x: cx, y: cy } = p, T = cg.TT, r = {};
  const arena = () => { for (let y = cy - 8; y <= cy + 8; y++) for (let x = cx - 8; x <= cx + 10; x++) if (st.map[y]?.[x] != null) st.map[y][x] = T.FLOOR; for (const m of [...st.monsters]) cg.drop(m) };
  const wall = open => { for (let y = cy - 3; y <= cy + 3; y++) st.map[y][cx + 1] = y === cy ? (open ? T.OPEN_DOOR : T.DOOR) : T.WALL };
  // a closed door shuts the sight line: opening it by walking in is the discovery
  arena(); wall(false);
  let m = cg.cannon(cx + 6, cy);
  r.door = cg.step(m, cx, cy, cx + 1, cy, true, { x: cx + 1, y: cy });
  // another monster standing in the line does not hide the player
  arena(); wall(false);
  m = cg.cannon(cx + 6, cy); cg.blocker(cx + 3, cy);
  r.doorWithMonsterBetween = cg.step(m, cx, cy, cx + 1, cy, true, { x: cx + 1, y: cy });
  // not a walk, or a cannon that has already seen the player
  arena(); wall(false);
  m = cg.cannon(cx + 6, cy);
  r.forced = cg.step(m, cx, cy, cx + 1, cy, false, { x: cx + 1, y: cy });
  arena(); wall(false);
  m = cg.cannon(cx + 6, cy, true);
  r.alreadySeen = cg.step(m, cx, cy, cx + 1, cy, true, { x: cx + 1, y: cy });
  return r;
});
console.log(JSON.stringify(out));
assert.deepEqual(out, { door: true, doorWithMonsterBetween: true, forced: false, alreadySeen: false });
assert.deepEqual(errors, []);
await browser.close();
console.log('cannon-grace: ok');
process.exit(0);
