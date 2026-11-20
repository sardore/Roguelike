// Run after npm run build:qa. 흑성채 1층: 유물 잔향이 닿지 않은 식당·취사실 두 곳(서로 다른 탑, 가장 멀리)에 큰 솥이 놓이고,
// 곁에서 상호작용하면 허기가 가득 차며 한 곳에서(솥 세 개 어느 쪽이든) 합쳐 최대 5번까지 쓴다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = 'globalThis.cf={state:()=>state,TT,build:buildBranch,bump:bumpTileAction,towers:CITADEL_TOWERS,use:citadelFeedUse,at:citadelFeedAt,inspect:citadelInspect,max:()=>BALANCE.hungerMax};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const out = await s.page.evaluate(() => {
  const r = { runs: [] };
  for (let i = 0; i < 6; i++) {
    const st = cf.state(); st.tutorialEntry60 = { completed: true }; st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'feed-' + i;
    cf.build('citadel', 1);
    const cur = cf.state(), d = cur.branchTerrain105.citadel105, st2 = d.feedStations105 || [];
    const rooms = st2.map(f => ({ tower: f.tower105, district: cf.towers[f.tower105].district105, influenced: !!d.towers.find(t => t.id === f.tower105).relicInfluence105, theme: d.rooms.find(q => q.citadelTower105 === f.tower105 && ['kitchen', 'mess'].includes(q.theme105))?.theme105 }));
    const tiles = st2.map(f => [cf.TT.COOKPOT === cur.map[f.y][f.x - 1], cf.TT.COOKPOT === cur.map[f.y][f.x], cf.TT.COOKPOT === cur.map[f.y][f.x + 1], cf.TT.BRAZIER === cur.map[f.y][f.x - 2], cf.TT.BRAZIER === cur.map[f.y][f.x + 2], [-2, -1, 0, 1, 2].every(dx => cf.TT.JAR === cur.map[f.y - 1][f.x + dx]), f.cells.length === 3 && f.cells.every(c => d.features105.some(q => q.x === c.x && q.y === c.y && q.theme === 'feed'))]);
    r.runs.push({ n: st2.length, rooms, tiles, apart: st2.length === 2 ? Math.abs(st2[0].x - st2[1].x) + Math.abs(st2[0].y - st2[1].y) : 0 });
  }
  // interaction on the last build: walk into the pot (a bump), eight times
  const cur = cf.state(), p = cur.player, f = cur.branchTerrain105.citadel105.feedStations105[0], u = []; r.stations = cur.branchTerrain105.citadel105.feedStations105.length; if (!f) return r;
  Object.assign(p, { x: f.x, y: f.y + 1 }); cur.monsters = []; p.hp = p.maxHp;
  r.inspect = cf.inspect(cur.map[f.y][f.x], f.x, f.y)?.hint;
  p.hunger = cf.max(); cf.bump(f.x, f.y, { active: true }); r.fullNoUse = f.left; const side = f.cells[2];
  for (let i = 0; i < 8; i++) { p.hunger = 5; const c = f.cells[i % 3]; cf.bump(c.x, c.y, { active: true }); u.push([p.hunger, f.left]) }
  r.uses = u; r.max = cf.max();
  return r;
});
console.log('citadel-feed', JSON.stringify(out));
for (const run of out.runs) {
  assert.equal(run.n, 2, '큰 솥은 두 곳');
  assert.ok(run.rooms.every(x => x.district === 'commons' && !x.influenced), '유물 잔향이 닿지 않은 곳');
  assert.notEqual(run.rooms[0].tower, run.rooms[1].tower, '서로 다른 탑');
  assert.ok(run.tiles.every(t => t.every(Boolean)), '솥 세 개·양끝 화로·뒤쪽 항아리 줄이 놓인다');
  assert.ok(run.apart >= 40, '멀리 떨어져 있다: ' + run.apart);
}
assert.equal(out.fullNoUse, 5, '배가 부르면 횟수를 쓰지 않는다');
assert.deepEqual(out.uses.map(x => x[1]), [4, 3, 2, 1, 0, 0, 0, 0], '최대 5번');
assert.ok(out.uses.slice(0, 5).every(x => x[0] === out.max), '허기가 가득 찬다');
assert.ok(out.uses.slice(5).every(x => x[0] === 5), '다 쓴 솥은 허기를 채우지 않는다');
assert.deepEqual(errors, []);
console.log('citadel-feed: ok');
await browser.close(); process.exit(0);
