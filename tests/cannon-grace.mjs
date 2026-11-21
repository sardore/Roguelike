// Run after npm run build:qa. 대포(십자 감시 포대)의 사선에 걸어 들어가는 첫 걸음은 확정 회피다(이미 그 대포가 나를 본 적이 있어도).
// 사선 밖에서 걸어 들어오지 않았거나(제자리·이미 사선 안), 자발적 이동이 아니면 확정 회피가 없다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.cg={state:()=>state,TT,drop:m=>OccupancyService.removeMonster(m),vis:()=>VisibilityService.compute(),
 cannon:(x,y)=>{const m=scaledMonster(MONSTERS.find(d=>d.name==='대포'),14);m.x=x;m.y=y;configureMonsterTraits(m);m.hasSeenPlayer105=true;OccupancyService.addMonster(m);return m},
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
  arena();
  let m = cg.cannon(cx + 4, cy);
  r.stepIn = cg.step(m, cx + 3, cy - 1, cx + 3, cy, true);        // from off the line onto the row
  r.alreadyOnLine = cg.step(m, cx + 2, cy, cx + 3, cy, true);     // slid along the row it was already on
  r.stayed = cg.step(m, cx + 3, cy, cx + 3, cy, true);            // did not move
  r.forced = cg.step(m, cx + 3, cy - 1, cx + 3, cy, false);       // pushed, not a walk
  r.offLine = cg.step(m, cx + 2, cy - 1, cx + 3, cy - 1, true);   // stayed off the line
  // a closed door shuts the line; opening it by walking in is the discovery, even with another monster standing in the way
  arena();
  for (let y = cy - 3; y <= cy + 3; y++) st.map[y][cx + 1] = y === cy ? T.DOOR : T.WALL;
  m = cg.cannon(cx + 6, cy); cg.blocker(cx + 3, cy);
  r.doorOpen = cg.step(m, cx, cy, cx + 1, cy, true, { x: cx + 1, y: cy });
  arena(); for (let y = cy - 3; y <= cy + 3; y++) st.map[y][cx + 1] = y === cy ? T.OPEN_DOOR : T.WALL;
  m = cg.cannon(cx + 6, cy);
  r.doorAlreadyOpen = cg.step(m, cx, cy, cx + 1, cy, true);        // the door was open and the player already stood on the line
  return r;
});
console.log(JSON.stringify(out));
assert.deepEqual(out, { stepIn: true, alreadyOnLine: false, stayed: false, forced: false, offLine: false, doorOpen: true, doorAlreadyOpen: false });
assert.deepEqual(errors, []);
await browser.close();
console.log('cannon-grace: ok');
process.exit(0);
