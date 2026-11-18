// Run after npm run build:qa. 천면경탑 3개 층이 생성되고 층끼리 이어지며 3층에 천면경 검이 놓인다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.mirrorTest={state:()=>state,go:branchTransition,blocks:tileBlocks,move:(dx,dy)=>ActionDispatcher.dispatch({type:"MOVE",args:[dx,dy]}),wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:"t"}),kill:killMonster,vis:()=>VisibilityService.compute()};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(1000);
const floors = [];
for (const level of [1, 2, 3]) {
  const info = await s.page.evaluate(level => {
    const ok = mirrorTest.go({ id: 'qa-mirror', to: `mirror:${level}`, arrival: 'up' });
    const st = mirrorTest.state();
    return { ok, id: st.branchContext105?.id, level: st.branchContext105?.level, mobs: st.monsters.length,
      portals: st.branchPortals105.map(p => p.id + '>' + p.to),
      weapon: st.items.filter(i => i.artifactId46 === 'mirror_blade').length,
      title: st.layoutName };
  }, level);
  floors.push(info);
  assert.ok(info.ok !== false && info.id === 'mirror' && info.level === level, JSON.stringify(info));
  assert.ok(info.mobs > 0, '몬스터가 없다');
  assert.equal(info.weapon, 0, '천면경 검은 거울지기를 쓰러뜨리기 전에는 없다');
}
// 2층: 발판에 올라타면 발판과 함께 한 칸씩 움직인다.
const ride = await s.page.evaluate(() => {
  mirrorTest.go({ id: 'qa-mirror', to: 'mirror:2', arrival: 'up' });
  const st = mirrorTest.state(); st.monsters = []; st.player.hp = st.player.maxHp = 999;
  const raft = st.rafts.find(r => r.axis === 'x' && r.dir === 1 && r.x === r.min && !mirrorTest.blocks(st.map[r.y + 1][r.x]));
  st.player.x = raft.x; st.player.y = raft.y + 1; mirrorTest.vis();
  mirrorTest.move(0, -1);
  const boarded = { x: st.player.x, y: st.player.y, raft: { x: raft.x, y: raft.y } };
  const track = [];
  for (let i = 0; i < 3; i++) { mirrorTest.wait(); track.push([st.player.x, st.player.y, raft.x]); }
  return { boarded, track, dir: raft.dir, tile: st.map[raft.y][raft.x] };
});
console.log('ride', JSON.stringify(ride));
assert.equal(ride.boarded.y, ride.boarded.raft.y, '발판에 올라타지 못했다');
assert.deepEqual(ride.track.map(t => t[0]), ride.track.map(t => t[2]), '플레이어가 발판과 함께 움직이지 않는다');
assert.ok(ride.track[2][0] !== ride.track[0][0], '발판이 움직이지 않는다');
const boss = await s.page.evaluate(() => {
  mirrorTest.go({ id: 'qa-mirror', to: 'mirror:3', arrival: 'up' });
  const st = mirrorTest.state(), b = st.monsters.find(m => m.mirrorKeeper105);
  const before = st.monsters.length;
  b.hp = Math.floor(b.maxHp * .6); mirrorTest.wait();
  const afterPhase1 = st.monsters.filter(m => m.bossOwnerId57).length;
  b.hp = Math.floor(b.maxHp * .3); mirrorTest.wait();
  const afterPhase2 = st.monsters.filter(m => m.bossOwnerId57).length;
  mirrorTest.kill(b);
  return { has: !!b, before, afterPhase1, afterPhase2, weapon: st.items.filter(i => i.artifactId46 === 'mirror_blade').length,
    leftover: st.monsters.filter(m => m.bossOwnerId57 && m.hp > 0).length };
});
console.log('boss', JSON.stringify(boss));
assert.ok(boss.has); assert.ok(boss.afterPhase1 >= 1, '1페이즈 거울상이 없다'); assert.ok(boss.afterPhase2 > boss.afterPhase1, '2페이즈 거울상이 없다');
assert.equal(boss.weapon, 1, '거울지기를 쓰러뜨리면 천면경 검이 떨어져야 한다'); assert.equal(boss.leftover, 0, '거울상이 흩어지지 않았다');
console.log('mirror tower ok', JSON.stringify(floors));
await browser.close(); process.exit(0);
