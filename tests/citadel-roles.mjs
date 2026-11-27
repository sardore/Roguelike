// Run after npm run build:qa. 흑성채 방향별 몹 가중치, 층별 위험 방향, 흑관 장의사의 관(냉기 폭발과 약해진 철갑시체)을 본다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.cr={state:()=>state,TT,go:l=>{state.branchWorld105={version:1,pages:{}};state.branchContext105={id:'citadel',level:l};buildBranch('citadel',l)},
 corners:t=>citadelCorners(t),
 coffin:()=>{
  state.debugBattle57=true;state.monsters=[];state.tempFields=[];state.tempTerrain74=[];state.items=[];
  for(let y=4;y<25;y++)for(let x=4;x<35;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);
  OccupancyService.move(state.player,18,14);state.player.hp=state.player.maxHp=9999;
  const def=CITADEL_ENEMIES105.find(d=>d.citadelActor105==='coffin');
  const mon={...scaledMonster(clone(def),20),x:22,y:14,alerted:true,citadelDepth105:20};OccupancyService.addMonster(mon);
  const started=startCoffinWall(mon,state.player),field=state.tempFields.find(f=>f.rootWall105?.element==='coffin');
  const planned=field?.cells.length||0;
  const advance=()=>{state.turn++;tickCombatFields57();expireCombatFields();RuntimeTerrainOwner.tick()};
  advance();const walls=state.tempTerrain74.filter(w=>w.rootWall105?.element==='coffin').length;
  advance();advance();
  const corpses=state.monsters.filter(m=>m.coffinOwner105);
  const out={started,planned,walls,corpses:corpses.length,weak:corpses.every(m=>m.hp<=Math.round(m.maxHp)),names:[...new Set(corpses.map(m=>m.name))],again:startCoffinWall(mon,state.player)};
  // 장의사를 먼저 쓰러뜨리면 빈 관이 된다
  state.monsters=state.monsters.filter(m=>!m.coffinOwner105);state.tempFields=[];state.tempTerrain74=[];
  mon.nextCoffinTurn=0;startCoffinWall(mon,state.player);advance();mon.hp=0;state.monsters=state.monsters.filter(m=>m!==mon);advance();advance();
  out.emptyWhenKilled=state.monsters.filter(m=>m.coffinOwner105).length===0;
  return out;
 }};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => {
  const r = { levels: {} };
  for (const lv of [1, 2, 3, 4]) {
    cr.go(lv);
    const st = cr.state(), towers = st.branchTerrain105.citadel105.towers, byCorner = {}, depthByCorner = {};
    for (const m of st.monsters) {
      const tw = towers.find(t => Math.abs(m.x - t.x) <= t.r && Math.abs(m.y - t.y) <= t.r); if (!tw) continue;
      const cs = cr.corners(tw); if (cs.length !== 1) continue;
      const c = cs[0]; (byCorner[c] ||= {}); byCorner[c][m.name] = (byCorner[c][m.name] || 0) + 1;
      (depthByCorner[c] ||= []).push(m.citadelDepth105 || 0);
    }
    r.levels[lv] = { byCorner, depth: Object.fromEntries(Object.entries(depthByCorner).map(([c, a]) => [c, Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10])) };
  }
  r.coffin = cr.coffin();
  return r;
});
console.log(JSON.stringify(out));
const base = ['흑철 창위병', '철쇄 집행관', '흑성 노수', '종루 파수령', '납골 철갑시체', '흑요 날개상', '흑관 장의사'];
const share = (lv, corner, names) => { const o = out.levels[lv].byCorner[corner] || {}, tot = base.reduce((a, n) => a + (o[n] || 0), 0) || 1; return names.reduce((a, n) => a + (o[n] || 0), 0) / tot; };
const names = { guard: ['흑철 창위병', '흑성 노수'], air: ['흑요 날개상', '종루 파수령'] };
const avg = (corner, list) => [1, 2, 3, 4].reduce((a, lv) => a + share(lv, corner, list), 0) / 4;
assert.ok(avg('NW', names.guard) > avg('NE', names.guard) + .1, '북서가 북동보다 창위병·노수가 많지 않다');
assert.ok(avg('NE', names.air) > avg('NW', names.air) + .1, '북동이 북서보다 날개상·파수령이 많지 않다');
assert.ok(!Object.values(out.levels[1].byCorner).some(o => o['흑관 장의사']), '1층에 장의사가 있다');
assert.ok(out.levels[1].depth.NE > out.levels[1].depth.SW, '1층 위험 방향(북동)이 더 강하지 않다');
assert.ok(out.levels[2].depth.NW > out.levels[2].depth.SW, '2층 위험 방향(북서)이 더 강하지 않다');
const c = out.coffin;
assert.ok(c.started && c.planned >= 1 && c.planned <= 5, '관 수 ' + c.planned);
assert.equal(c.walls, c.planned, '관이 한꺼번에 솟지 않았다');
assert.ok(c.corpses >= 1 && c.corpses <= 5, '철갑시체 수 ' + c.corpses);
assert.deepEqual(c.names, ['납골 철갑시체']);
assert.equal(c.again, false, '재사용 대기를 무시했다');
assert.ok(c.emptyWhenKilled, '장의사가 죽었는데 시체가 깨어났다');
assert.deepEqual(errors, []);
await browser.close();
console.log('citadel-roles: ok');
process.exit(0);
