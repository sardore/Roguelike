// Run after npm run build:qa. 만루보주: 섬광탄(3줄 설치 후 차례 폭발, 3단계 속성), 구조 재편(벽·지형 생성), 약해진 소환.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.mb={
 arena:()=>{state.debugBattle57=true;state.monsters=[];state.tempFields=[];state.tempTerrain74=[];state.items=[];state.rumorSpaces1030=[];for(let y=4;y<27;y++)for(let x=4;x<40;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);state.player.hp=state.player.maxHp=900000;state.status={}},
 boss:(x,y,stage)=>{const m={...clone(BOSSES[25]),boss:true,x,y,alerted:true,hp:240,maxHp:240,coreStage54:stage};OccupancyService.addMonster(m);return m},
 flash:(stage)=>{mb.arena();const m=mb.boss(21,15,stage);OccupancyService.move(state.player,14,15);
  const dirOk={0:(dx,dy)=>dx&&dy&&Math.abs(dx)===Math.abs(dy),1:(dx,dy)=>!dx||!dy,2:(dx,dy)=>!dx||!dy||Math.abs(dx)===Math.abs(dy)}[stage];
  const out={},max=state.player.maxHp;FX.flashRays=[];FX.flashBlasts=[];
  out.began=beginFlashSequence(m,state.player);const I=m.intent54;if(!out.began||!I)return{noPlan:true};
  const bombsNow=()=>state.monsters.filter(q=>q.combatFixture54==='flashBomb'&&q.hp>0);
  out.name=bombsNow()[0]?.name;out.first=bombsNow().length;out.isMonster=bombsNow().every(q=>q.fixed&&q.hp===4&&!q.boss);
  out.counts=[out.first];let lost=0;const log=[];let execs=0;
  while(execs<10&&(execs<2||bombsNow().length)){state.turn+=1;state.floorTurn+=1;const live=bombsNow(),before=state.player.hp;if(m.intent54)executeBossIntent(m);for(const b of live)if(state.monsters.includes(b))tickBossFixture(b);execs++;const dmg=before-state.player.hp;lost+=dmg;log.push([execs,dmg,!!m.intent54,bombsNow().length,live.map(q=>q.hp).sort().join('')]);state.player.hp=max}
  out.execs=execs;out.lost=lost;out.cleared=!m.intent54;out.log=log;out.leftover=bombsNow().length;
  out.shape=null;out.rays=FX.flashRays.length;out.blasts=FX.flashBlasts.length;
  out.rayShape=FX.flashRays.every(q=>dirOk(q.dx,q.dy)&&q.len>=1&&q.len<=8);
  out.status={poison:state.status.poison||0,weaken:state.status.weaken||0,skillSeal:state.status.skillSeal||0,bleed:state.status.bleed||0,blind:state.status.blind||0};return out},
 // 섬광탄을 부수면 그 자리에서 먼저 터진다.
 early:()=>{mb.arena();const m=mb.boss(21,15,1);OccupancyService.move(state.player,14,15);state.player.hp=state.player.maxHp=900000;FX.flashRays=[];FX.flashBlasts=[];
  beginFlashSequence(m,state.player);const bombs=state.monsters.filter(q=>q.combatFixture54==='flashBomb'&&q.hp>0);const target=bombs[0];const before=state.player.hp;
  // 표적을 폭탄의 광선 위에 세운다
  const ray=flashBombRays(target,8,flashRayDirs('orth'))[0];const c=ray.cells[1]||ray.cells[0];OccupancyService.move(state.player,c.x,c.y);
  target.hp=0;killMonster(target);
  return{removed:!state.monsters.includes(target),hurt:before-state.player.hp>0,blasts:FX.flashBlasts.length,intentAlive:!!m.intent54,others:state.monsters.filter(q=>q.combatFixture54==='flashBomb'&&q.hp>0).length}},
 // 폭탄 중에 사념체가 서면(예고가 끊기면) 남은 폭탄은 사라진다.
 disarm:()=>{mb.arena();const m=mb.boss(21,15,0);OccupancyService.move(state.player,14,15);beginFlashSequence(m,state.player);const n=state.monsters.filter(q=>q.combatFixture54==='flashBomb').length;clearIntent(m);return{n,after:state.monsters.filter(q=>q.combatFixture54==='flashBomb').length}},
 // 사념체가 살아 있는 동안에는 섬광탄을 쓰지 않는다.
 core:()=>{mb.arena();const m=mb.boss(21,15,1);OccupancyService.move(state.player,14,15);const core={name:'핵',hp:10,maxHp:10,atk:0,def:0,x:30,y:15,combatFixture54:'core',coreStage54:1,fixed:true,statusImmune:true};adoptBossChild57(core,m);OccupancyService.addMonster(core);
  state.floorTurn=100;m.nextFlash54=0;m.nextWeave54=9999;m.nextShot54=9999;m.nextAction54=0;handleBossPattern(m,7,state.player);return{used:m.intent54?.type||null}},
 wall:()=>{mb.arena();const m=mb.boss(21,15,0);OccupancyService.move(state.player,14,15);for(let y=10;y<=20;y++)setTerrainTile58(state.map,16,y,TT.WALL);
  const plan=planFlashSequence(m,state.player);if(!plan)return{blocked:true};
  const ok=plan.waves.every(w=>w.cells.every(c=>!(c.x>16&&c.x<24&&w.bombs.every(b=>b.x<16&&b.y===c.y&&Math.abs(c.x-b.x)>2))));return{blocked:ok}},
 weave:()=>{mb.arena();const m=mb.boss(21,15,0);OccupancyService.move(state.player,14,15);const plan=planWallWeave(m,state.player);const out={planned:!!plan,n:plan?.cells.length||0};
  setBossIntent(m,'wallweave',plan.cells,'t',{tiles:plan.tiles});state.turn+=1;executeBossIntent(m);
  out.walls=plan.cells.filter(c=>state.map[c.y][c.x]!==TT.FLOOR).length;out.temp=(state.tempTerrain74||[]).filter(t=>t.kind==='bossWeave').length;
  out.reachable=!masterWallBlocked(m,state.player,[]);out.ttl=(state.tempTerrain74||[]).find(t=>t.kind==='bossWeave')?.ttl;return out},
 visualSetup:()=>{mb.arena();const m=mb.boss(26,15,2);OccupancyService.move(state.player,15,15);state.visible=new Set();for(let y=4;y<27;y++)for(let x=4;x<40;x++)state.visible.add(k(x,y));state.seen=new Set(state.visible);beginFlashSequence(m,state.player);for(let n=0;n<2;n++){state.turn++;executeBossIntent(m)}mb.m=m},
 visualBoom:()=>{const bomb=state.monsters.find(q=>q.combatFixture54==='flashBomb');bomb.hp=1;tickBossFixture(bomb)},
 water:()=>{mb.arena();const m=mb.boss(30,15,0);for(let y=8;y<=22;y++){setTerrainTile58(state.map,16,y,TT.WATER);setTerrainTile58(state.map,17,y,TT.LAVA);setTerrainTile58(state.map,18,y,TT.VOID)}setTerrainTile58(state.map,22,15,TT.STONE_PILLAR);
  const rays=flashBombRays({x:12,y:15},8,flashRayDirs('orth')),east=rays.find(q=>q.dx===1&&q.dy===0);return{eastLen:east?east.cells.length:0,reachesPastWater:!!east&&east.cells.some(c=>c.x===19),stopsAtPillar:!!east&&east.cells.every(c=>c.x<22)}},
 rules:()=>BOSS_ARENA_RULES.master.cores.map(c=>[c.interval,c.batch,c.cap])};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
  const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
  const errors = []; s.page.on('pageerror', e => errors.push(e.message));
  await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
  const out = await s.page.evaluate(() => { const o = { rules: mb.rules() }; for (const [n, f] of [['f0', () => mb.flash(0)], ['f1', () => mb.flash(1)], ['f2', () => mb.flash(2)], ['early', () => mb.early()], ['disarm', () => mb.disarm()], ['core', () => mb.core()], ['wall', () => mb.wall()], ['weave', () => mb.weave()], ['water', () => mb.water()]]) { try { o[n] = f(); } catch (e) { o[n] = { error: String(e && e.stack || e).slice(0, 500) }; } } return o; });
  console.log(JSON.stringify(out));
  assert.deepEqual(out.rules, [[4, 2, 4], [5, 1, 3]], '소환 증원이 약해지지 않았다');
  const expect = [['f0', '풀 섬광탄', 5, { poison: 1 }], ['f1', '대지 섬광탄', 5, { weaken: 1, skillSeal: 1 }], ['f2', '얼음 섬광탄', 4, { bleed: 1, skillSeal: 1, blind: 1 }]];
  for (const [key, name, per, statuses] of expect) {
    const f = out[key]; assert.ok(!f.error && !f.noPlan, `${key} ${JSON.stringify(f)}`);
    assert.equal(f.name, name, `${key} 폭탄 이름`);
    assert.ok(f.isMonster, `${key} 폭탄이 몹이 아니다`);
    assert.equal(f.first, per, `${key} 첫 줄 폭탄 수 ${f.first}`);
    assert.equal(f.execs, 6, `${key} 4턴 만에 첫 줄, 이후 한 줄씩 터져 6턴에 끝나야 한다 ${f.execs}`);
    assert.ok(f.cleared && f.leftover === 0, `${key} 끝난 뒤에도 폭탄/예고가 남았다`);
    assert.deepEqual(f.log.map(l => l[3]), [per * 2, per * 3, per * 3, per * 2, per, 0], `${key} 턴마다 줄어 먼저 깐 줄부터 터져야 한다 ${JSON.stringify(f.log)}`);
    assert.ok(f.log.slice(0, 3).every(l => l[1] === 0), `${key} 터지기 전에 피해가 들어갔다`);
    assert.ok(f.log.slice(3).some(l => l[1] > 0), `${key} 폭발이 피해를 주지 못했다`);
    assert.ok(f.log[0][4] === '3'.repeat(per) && f.log[1][4].includes('2') && f.log[1][4].includes('3') && f.log[2][4].includes('1'), `${key} 턴마다 체력이 1씩 줄지 않았다 ${JSON.stringify(f.log.map(l => l[4]))}`);
    assert.ok(f.rays >= per * 3 * 2 && f.blasts === per * 3, `${key} 폭발 연출이 없다 rays ${f.rays} blasts ${f.blasts}`);
    assert.ok(f.rayShape, `${key} 폭발 방향/거리가 단계 규칙을 벗어났다`);
    for (const st of Object.keys(statuses)) assert.ok(f.status[st] > 0, `${key} 상태 ${st} ${JSON.stringify(f.status)}`);
  }
  assert.ok(out.f2.lost > out.f0.lost, `피해가 단계마다 커져야 한다 ${out.f0.lost}/${out.f1.lost}/${out.f2.lost}`);
  assert.ok(out.early.removed && out.early.hurt && out.early.blasts === 1 && out.early.intentAlive, `부수면 먼저 터져야 한다 ${JSON.stringify(out.early)}`);
  assert.ok(out.disarm.n > 0 && out.disarm.after === 0, `예고가 끊겨도 폭탄이 남았다 ${JSON.stringify(out.disarm)}`);
  assert.ok(out.core.used !== 'flashblast', '사념체 중에 섬광탄을 썼다');
  assert.ok(out.wall.blocked !== false, '벽 너머로 빛이 샜다');
  assert.ok(out.water.reachesPastWater && out.water.stopsAtPillar, `빛줄기가 물·용암·허공에 막혔거나 기둥을 뚫었다 ${JSON.stringify(out.water)}`);
  const w = out.weave; assert.ok(!w.error, JSON.stringify(w));
  assert.ok(w.planned && w.n > 0 && w.walls > 0 && w.temp > 0, '벽·지형이 세워지지 않았다');
  assert.ok(w.reachable, '구조 재편이 길을 완전히 막았다');
  // 폭탄·폭발 그리기가 프레임마다 예외 없이 도는지 본다.
  await s.page.evaluate(() => mb.visualSetup());
  await s.page.waitForTimeout(500);
  await s.page.evaluate(() => mb.visualBoom());
  await s.page.waitForTimeout(600);
  assert.equal(errors.length, 0, errors.join('|'));
  console.log('master-skills: ok');
} finally { await browser.close(); }
