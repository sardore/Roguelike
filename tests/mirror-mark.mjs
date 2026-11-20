// Run after npm run build:qa. 거울지기의 표식: 처음 발견한 대상에게 걸려 거울지기가 쓰러질 때까지 풀리지 않고,
// 표식이 걸린 대상이 30칸 이상 멀어지면 거울지기가 예고 뒤 그 곁으로 순간이동한다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.mk={state:()=>state,go:branchTransition,wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:'t'}),
 vis:()=>VisibilityService.compute(),kill:killMonster,rows:playerDebuffRows,held:targetMarkHeld,dist:entityDistance57,cleanse:cleanseStatuses,
 turn:handleBossPattern,occ:OccupancyService,find:(m,o)=>PlacementService.findMonster(m,o),blinkTry:mirrorKeeperBlink,tickD:tickMonsterDurations,conceal:playerConcealed58,view:resetVisualState,tile:setTerrainTile58,TT,rows2:()=>0,passable:(x,y)=>ReachabilityService.playerPassable(x,y),size:()=>[COLS,ROWS],clearField:()=>{state.tempFields=[];state.status={};state.intentBudget61=10}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(1000);
const out = await s.page.evaluate(() => {
  const r = {};
  mk.go({ id: 'qa-mirror', to: 'mirror:3', arrival: 'up' });
  const st = mk.state(), boss = st.monsters.find(m => m.mirrorKeeper105);
  for (const m of [...st.monsters]) if (m !== boss) mk.occ.removeMonster(m);
  mk.clearField(); st.player.hp = st.player.maxHp = 999;
  // a flat patch round the keeper: the player starts four cells away, in sight
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) mk.tile(st.map, boss.x + dx, boss.y + dy, mk.TT.FLOOR);
  Object.assign(st.player, { x: boss.x - 4, y: boss.y }); mk.view(); mk.vis();
  r.before = st.targetMark61 || 0;
  boss.mirrorNextCast = st.floorTurn + 50; // keep the keeper's own skills out of the way
  mk.turn(boss, mk.dist(boss, st.player), st.player);
  r.marked = mk.held(); r.by = st.targetMarkBy105 === boss.combatantId54;
  r.row = mk.rows().find(x => x.key === 'targetMark');
  for (let i = 0; i < 40; i++) { st.turn += 1; st.floorTurn += 1; mk.tickD(); }
  r.after40 = { held: mk.held(), value: st.targetMark61 };
  mk.cleanse(st.status, 99); r.afterCleanse = mk.held();
  // the player is far away: only the marked target is followed
  const far = []; for (let y = 2; y < mk.size()[1] - 2; y++) for (let x = 2; x < mk.size()[0] - 2; x++) if (Math.max(Math.abs(x - boss.x), Math.abs(y - boss.y)) >= 36 && mk.passable(x, y)) far.push({ x, y });
  const p = far[0]; Object.assign(st.player, { x: p.x, y: p.y }); mk.view(); mk.vis();
  boss.mirrorBlinkNext = 0; boss.mirrorNextCast = st.floorTurn + 50;
  r.farDist = mk.dist(boss, st.player);
  mk.turn(boss, r.farDist, st.player);
  r.intent = boss.intent54?.type; r.land = boss.intent54?.data;
  const from = { x: boss.x, y: boss.y };
  for (let i = 0; i < 3 && boss.intent54; i++) { st.turn += 1; st.floorTurn += 1; mk.turn(boss, mk.dist(boss, st.player), st.player); }
  r.moved = mk.dist(boss, st.player); r.landedAtPlan = !!r.land && (Math.max(Math.abs(boss.x - r.land.x), Math.abs(boss.y - r.land.y)) <= 3);
  r.cooldown = boss.mirrorBlinkNext > st.floorTurn;
  // a copy never marks and never blinks
  mk.kill(boss); mk.kill(boss);
  r.afterDeath = { held: mk.held(), value: st.targetMark61 || 0, row: mk.rows().some(x => x.key === 'targetMark') };
  return r;
});
console.log('mirror-mark', JSON.stringify(out));
assert.equal(out.before, 0);
assert.ok(out.marked && out.by, '거울지기가 처음 발견한 대상에게 표식을 건다');
assert.equal(out.row.label, '표식');
assert.ok(out.after40.held && out.after40.value > 0, '40턴이 지나도 표식이 풀리지 않는다');
assert.ok(out.afterCleanse, '정화로도 풀리지 않는다');
assert.ok(out.farDist >= 30);
assert.equal(out.intent, 'mirrorBlink', '30칸 이상 멀어지면 순간이동을 예고한다');
assert.ok(out.landedAtPlan && out.moved < out.farDist, '예고한 자리로 순간이동한다');
assert.ok(out.cooldown);
assert.ok(!out.afterDeath.held && out.afterDeath.value === 0 && !out.afterDeath.row, '거울지기가 쓰러지면 표식이 사라진다');
assert.deepEqual(errors, []);
console.log('mirror-mark: ok');
await browser.close(); process.exit(0);
