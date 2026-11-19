// Run after npm run build:qa. 천면경탑 3개 층이 생성되고 층끼리 이어지며 3층에 천면경 검이 놓인다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `
globalThis.mirrorTest={
 state:()=>state,go:branchTransition,blocks:tileBlocks,
 move:(dx,dy)=>ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}),
 wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:'t'}),
 kill:killMonster,detect:playerDetectedBy,cargoTile:MIRROR_CARGO_TILE,raftTile:TT.RAFT,build:buildBranch,
 vis:()=>VisibilityService.compute(),draw:drawFast,skyTile:glassCloudTile,skills:monsterSkills,
 damage:damageEntity,recover:recoverCombatHealth,status:applyCombatStatus,expire:expireCombatFields,
 fieldTick:tickCombatFields57,fixtureTick:tickBossFixture,turn:handleBossPattern,
 iceFusions:()=>globalThis.__MANRU_TALISMAN74_ACTIONS__.shopCandidates('elem_ice').map(i=>i.talismanKind),
 prepare(){
   const boss=state.monsters.find(m=>m.mirrorKeeper105);
   for(const mon of [...state.monsters])if(mon!==boss)OccupancyService.removeMonster(mon);
   const {x,y}=boss;
   for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)setTerrainTile58(state.map,x+dx,y+dy,TT.FLOOR);
   Object.assign(state.player,{x:x-3,y,hp:100,maxHp:120});
   state.tempFields=[];state.status={};state.intentBudget61=10;state.player.stealthBornAgency1005=null;
   resetVisualState();VisibilityService.compute();return boss;
 }
};`;
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
// 1층: 끊긴 둑길의 유리 발판에 올라타면 발판과 함께 한 칸씩 움직인다.
const ride = await s.page.evaluate(() => {
  mirrorTest.go({ id: 'qa-mirror', to: 'mirror:1', arrival: 'up' });
  const st = mirrorTest.state(); st.monsters = []; st.player.hp = st.player.maxHp = 999;
  const raft = st.rafts[0], v = raft.axis === 'y', pos = () => (v ? raft.y : raft.x);
  // park the raft at the start of its track and stand on the bank just before it
  while (pos() !== raft.min) mirrorTest.wait();
  raft.dir = 1;
  st.player.x = v ? raft.x : raft.x - 1; st.player.y = v ? raft.y - 1 : raft.y; mirrorTest.vis();
  mirrorTest.move(v ? 0 : 1, v ? 1 : 0);
  const boarded = { on: st.player.x === raft.x && st.player.y === raft.y };
  const track = [];
  for (let i = 0; i < 3; i++) { mirrorTest.wait(); track.push([v ? st.player.y : st.player.x, pos()]); }
  return { boarded, track, rafts: st.rafts.length, towers: st.branchWorld105.mirror105.towers.length };
});
console.log('ride', JSON.stringify(ride));
assert.ok(ride.boarded.on, '발판에 올라타지 못했다');
assert.deepEqual(ride.track.map(t => t[0]), ride.track.map(t => t[1]), '플레이어가 발판과 함께 움직이지 않는다');
assert.ok(ride.track[2][1] !== ride.track[0][1] || ride.track[1][1] !== ride.track[0][1], '발판이 움직이지 않는다');
// 큰 발판과 그 위의 가구: 왕복 내내 가구 칸은 가구 타일, 나머지 갑판 칸은 발판 타일로 함께 움직인다.
const deck = await s.page.evaluate(() => {
  for (let i = 0; i < 60; i++) {
    const st = mirrorTest.state(); st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'deck-' + i;
    for (const L of [1, 2, 3]) {
      mirrorTest.go({ id: 'qa-mirror', to: 'mirror:' + L, arrival: 'up' });
      const s2 = mirrorTest.state(), r = s2.rafts.find(q => q.cargo.length && q.footprintCells57.length >= 8);
      if (!r) continue;
      s2.monsters = [];
      let bad = 0, moved = new Set();
      for (let n = 0; n < 24; n++) {
        mirrorTest.wait(); moved.add(r.x + ',' + r.y);
        for (const o of r.footprintCells57) {
          const isCargo = r.cargo.some(c => c.dx === o[0] && c.dy === o[1]), have = s2.map[r.y + o[1]][r.x + o[0]];
          if (have !== (isCargo ? mirrorTest.cargoTile : mirrorTest.raftTile)) bad++;
        }
      }
      return { design: r.design, cells: r.footprintCells57.length, cargo: r.cargo.length, positions: moved.size, bad };
    }
  }
  return null;
});
console.log('deck', JSON.stringify(deck));
assert.ok(deck, '가구를 실은 큰 발판이 생성되지 않았다');
assert.ok(deck.positions > 1, '큰 발판이 움직이지 않는다');
assert.equal(deck.bad, 0, '발판 이동 중 가구 칸이나 갑판 칸이 어긋났다');
// 층별 출현 적: 1층 윈도, 2층 공허 가오리·파편 망령, 3층 혼백 사냥꾼(1층엔 파편 망령이 없다).
const roster = await s.page.evaluate(() => {
  const out = {};
  for (const L of [1, 2, 3]) {
    const names = new Set();
    for (let i = 0; i < 25; i++) {
      const st = mirrorTest.state(); st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'roster-' + L + '-' + i;
      mirrorTest.build('mirror', L);
      for (const m of mirrorTest.state().monsters) names.add(m.name);
    }
    out[L] = [...names].sort();
  }
  return out;
});
console.log('roster', JSON.stringify(roster));
assert.ok(roster[1].includes('윈도') && !roster[1].includes('파편 망령') && !roster[1].includes('공허 가오리') && !roster[1].includes('혼백 사냥꾼'), '1층 적 구성이 다르다');
assert.ok(roster[2].includes('공허 가오리') && roster[2].includes('파편 망령') && !roster[2].includes('윈도') && !roster[2].includes('혼백 사냥꾼'), '2층 적 구성이 다르다');
assert.ok(roster[3].includes('혼백 사냥꾼') && roster[3].includes('파편 망령') && !roster[3].includes('공허 가오리'), '3층 적 구성이 다르다');
// 혼백 사냥꾼은 은신한 플레이어도 감지하고, 반영 검객은 놓친다.
const sense = await s.page.evaluate(() => {
  for (let i = 0; i < 40; i++) {
    const st = mirrorTest.state(); st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'sense-' + i;
    mirrorTest.build('mirror', 3);
    const s2 = mirrorTest.state(), h = s2.monsters.find(m => m.name === '혼백 사냥꾼'), d = s2.monsters.find(m => m.name === '반영 검객');
    if (!h || !d) continue;
    s2.player.x = h.x + 1; s2.player.y = h.y; d.x = h.x + 1; d.y = h.y + 1; s2.status.stealth = 20;
    return { hunter: mirrorTest.detect(h), duelist: mirrorTest.detect(d) };
  }
  return null;
});
console.log('sense', JSON.stringify(sense));
assert.ok(sense, '3층에서 혼백 사냥꾼을 찾지 못했다');
assert.equal(sense.hunter, true, '혼백 사냥꾼이 은신한 플레이어를 감지하지 못했다');
assert.equal(sense.duelist, false, '반영 검객이 은신한 플레이어를 감지했다');
const cloud = await s.page.evaluate(() => {
  const tiles = [], fresh = [];
  for (const level of [1, 2, 3]) {
    mirrorTest.go({ id: 'qa-mirror', to: 'mirror:' + level, arrival: 'up' });
    const st = mirrorTest.state();
    st.seen.clear(); st.visible.clear();
    tiles.push([0, 1, 2].map(mirrorTest.skyTile));
    fresh.push(st.seen.size === 0 && mirrorTest.draw(true));
  }
  const again = [1, 2, 3].map(level => { mirrorTest.go({ id: 'qa-mirror', to: 'mirror:' + level, arrival: 'up' }); return [0, 1, 2].map(mirrorTest.skyTile); });
  return { shared: tiles.every((t, li) => t.every((tile, i) => tile === again[li][i])) && tiles[0][0] !== tiles[1][0] && tiles[1][0] !== tiles[2][0] && tiles[0][0] !== tiles[2][0], fresh };
});
assert.equal(cloud.shared, true, '구름 텍스처는 층마다 팔레트가 다르고 같은 층에서는 재사용되어야 한다');
assert.deepEqual(cloud.fresh, [true, true, true], '아무것도 발견하지 않은 층을 그리지 못했다');

const encounter = () => {
  const phases = [];
  mirrorTest.go({ id: 'qa-mirror', to: 'mirror:3', arrival: 'up' });
  const boss = mirrorTest.prepare(), st = mirrorTest.state(), p = st.player;
  const advance = (turns = 1) => { st.turn += turns; st.floorTurn += turns; };
  const activate = b => mirrorTest.turn(b, Math.max(Math.abs(b.x-st.player.x),Math.abs(b.y-st.player.y)), st.player);
  const maxHp = boss.maxHp, skillNames = mirrorTest.skills(boss).map(s => s.name);
  activate(boss);
  phases.push(boss.intent54?.type);
  activate(boss);
  const waitsForTurn = !st.monsters.some(m => m.combatFixture54 === 'mirrorOrb');
  advance(); activate(boss);
  const orb = st.monsters.find(m => m.combatFixture54 === 'mirrorOrb');
  const first = orb.x;
  mirrorTest.fixtureTick(orb);
  const singleStep = orb.x === first - 1;
  mirrorTest.damage(orb, orb.hp, p);
  mirrorTest.kill(orb);
  const impact = 100 - p.hp;
  const shard = st.tempFields.find(f => f.kind === 'mirrorShards');
  const shards = shard?.cells.length;
  const beforeShard = p.hp; advance(); mirrorTest.fieldTick();
  const shardDamage = beforeShard - p.hp;

  advance(2); activate(boss);
  const bell = st.log.some(row => JSON.stringify(row).includes('경종을 울렸다'));
  boss.hp = Math.floor(boss.maxHp * .6);
  advance(2); activate(boss);
  const copy = st.monsters.find(m => m.mirrorCopy105);
  phases.push(copy ? 'mirrorCopy' : '');
  const copyInfo = copy && {hp:copy.hp, copiedSkill:mirrorTest.skills(copy).some(s => s.name === '거울 복사')};

  boss.hp = Math.floor(boss.maxHp * .3);
  advance(2); activate(boss);
  phases.push(boss.intent61?.type);
  const strikes = [];
  for (let i = 0; i < 3; i++) {
    advance();
    p.y += i === 0 ? 1 : i === 1 ? -2 : 0;
    activate(boss);
    strikes.push(boss.rodLeft61);
  }
  // Late phase: rod -> orb -> sanctuary. The warning is fixed to the original coordinates.
  advance(2); activate(boss);
  advance(); activate(boss);
  advance(2); activate(boss);
  const sanctuaryWarning = boss.intent54?.type;
  p.x = boss.x-1; p.y = boss.y;
  advance(); activate(boss);
  const sanctuary = st.tempFields.find(f => f.kind === 'mirrorSanctuary');
  st.tempFields = st.tempFields.filter(f => f === sanctuary);
  const duration = sanctuary.ttl, blockedHeal = mirrorTest.recover(p, 5);
  const blockedStatus = !mirrorTest.status(boss, 'blind', 2, 1, {source:p});
  const before = boss.hp;
  for (let i = 0; i < 6; i++) { advance(); mirrorTest.fieldTick(); mirrorTest.expire(); }
  const sanctuaryHeal = boss.hp - before;
  const {blind,weaken} = st.status;
  const releasedHeal = mirrorTest.recover(p, 5);
  const lootBefore = new Set(st.items), carried = boss.inventory.map(i=>i.name).sort();
  mirrorTest.kill(boss);
  mirrorTest.kill(boss);
  const loot = st.items.filter(i=>!lootBefore.has(i));
  return {maxHp,phases,skillNames,waitsForTurn,singleStep,impact,shards,shardDamage,bell,copyInfo,strikes,
    sanctuaryWarning,duration,blockedHeal,blockedStatus,sanctuaryHeal,blind,weaken,releasedHeal,
    weapon:loot.filter(i=>i.artifactId46==='mirror_blade').length,
    small:loot.filter(i=>i.potionKind==='heal_small').reduce((sum,i)=>sum+i.count,0),
    fusions:loot.filter(i=>i.fusion74&&mirrorTest.iceFusions().includes(i.talismanKind)).map(i=>i.talismanKind),
    carried, dropped:loot.map(i=>i.name).sort(),
    leftover:st.monsters.filter(m=>m.bossOwnerId57&&m.hp>0).length};
};
const boss = await s.page.evaluate(encounter);
console.log('boss', JSON.stringify(boss));
assert.equal(boss.maxHp, 231);
assert.deepEqual(boss.phases, ['mirrorOrb', 'mirrorCopy', 'rod']);
assert.deepEqual(boss.skillNames, ['천명탄', '피뢰침', '경종', '거울 복사', '빛의 성역']);
assert.ok(boss.waitsForTurn && boss.singleStep);
assert.equal(boss.impact, 18);
assert.equal(boss.shards, 8);
assert.equal(boss.shardDamage, 2);
assert.ok(boss.bell);
assert.deepEqual(boss.copyInfo, {hp:1,copiedSkill:false});
assert.deepEqual(boss.strikes, [2,1,0]);
assert.equal(boss.sanctuaryWarning, 'mirrorSanctuary');
assert.equal(boss.blockedHeal, 0);
assert.ok(boss.blockedStatus);
assert.equal(boss.duration, 6);
assert.equal(boss.sanctuaryHeal, 24);
assert.ok(boss.blind > 0 && boss.weaken > 0 && boss.releasedHeal === 5);
assert.equal(boss.weapon, 1, '거울지기를 쓰러뜨리면 천면경 검이 떨어져야 한다');
assert.equal(boss.small, 1);
assert.equal(new Set(boss.fusions).size, 3);
assert.deepEqual(boss.dropped, boss.carried);
assert.equal(boss.dropped.length, 5);
assert.equal(boss.leftover, 0, '거울상이 흩어지지 않았다');
assert.deepEqual(s.errors, []);
console.log('mirror tower ok', JSON.stringify(floors));
await browser.close(); process.exit(0);
