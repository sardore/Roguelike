// Run after npm run build:qa. 적연 용암궁의 삼족오(20턴 뒤 추적·괴력 99턴)와 불사조(1회 부활, 관통 돌진과 화염 폭발).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.lb={
 names:()=>mobDefs47('lava_bow').map(d=>d.name),
 arena:()=>{state.debugBattle57=true;state.monsters=[];state.tempFields=[];state.tempTerrain74=[];state.items=[];for(let y=4;y<25;y++)for(let x=4;x<35;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);OccupancyService.move(state.player,6,6);state.player.hp=state.player.maxHp=9999},
 spawn:(name,x,y)=>{const d=mobDefs47('lava_bow').find(q=>q.name===name),m={...scaledMonster(clone(d),20),x,y,alerted:true};OccupancyService.addMonster(m);return m},
 crow:()=>{lb.arena();const m=lb.spawn('삼족오',20,14);const out={kiteBefore:!!m.kite105,ranged:m.ranged};state.turn=100;crowFuryTick(m,true);out.early=!!m.furyStarted105;state.turn=119;crowFuryTick(m,true);out.at19=!!m.furyStarted105;state.turn=120;crowFuryTick(m,true);
  // 불꽃탄: 살라맨더와 같은 화염 포병 예고
  m.x=12;m.y=8;OccupancyService.move(m,12,8);const period=combatDepth(m)>=16?5:6,phase=(m.x*3+m.y*5)%7;state.floorTurn=phase%period+period*10;m.intent61=null;out.shell=!!globalThis.__MANRU_AI61__.artillery(m,state.player)&&m.intent61?.type==='fire';m.intent61=null;
  Object.assign(out,{started:!!m.furyStarted105,power:m.power61?.turns,track:m.trackUntil105-state.turn,kiteAfter:!!m.kite105,rangedAfter:m.ranged,quake:m.legendSkill47,role:m.role61});return out},
 revive:()=>{lb.arena();const m=lb.spawn('불사조',20,14);const out={lives:m.livesRemaining57,baseAtk:m.atk,baseDef:m.def};
  m.hp=0;out.began=beginMonsterRevival(m);out.phase=m.revivePhase57;state.floorTurn=1000;for(let i=0;i<6;i++){state.floorTurn+=3;advanceMonsterRevival(m)}
  Object.assign(out,{phaseAfter:m.revivePhase57,atkAfter:m.atk,defAfter:m.def,hp:m.hp,max:m.maxHp,livesAfter:m.livesRemaining57,again:beginMonsterRevival(m)});return out},
 // 디버그 전장(debugBattleRound57)은 자기 라운드 루프를 쓰므로 삼족오의 20턴 판정도 그 루프에서 돌아야 한다.
 debugCrow:()=>{lb.arena();DEBUG_BATTLE57.open=true;DEBUG_BATTLE57.winner=null;DEBUG_BATTLE57.round=0;state.monsters=[];
  const crow=lb.spawn('삼족오',8,14),foe={name:'시험 대상',x:36,y:14,hp:99999,maxHp:99999,atk:0,def:99,faction57:'player',kind:'human',alerted:true,debugSide57:'A',fixed:true};crow.debugSide57='B';OccupancyService.addMonster(foe);
  const out={before:false,at:null};for(let i=1;i<=40;i++){debugBattleRound57();if(!crow.furyStarted105)continue;out.at=i;break}
  Object.assign(out,{started:!!crow.furyStarted105,power:crow.power61?.turns,kite:!!crow.kite105});return out},
 // 플레이어 편 동료(alliesTurn)도 같은 공용 행동 함수를 거치므로 20턴 판정이 돌아야 한다.
 allyCrow:()=>{lb.arena();state.monsters=[];const crow=lb.spawn('삼족오',8,14);setEntityFaction57(crow,'player');
  const foe={name:'시험 대상',x:18,y:14,hp:99999,maxHp:99999,atk:0,def:99,faction57:'hostile',kind:'human',alerted:true,fixed:true};OccupancyService.addMonster(foe);
  const out={at:null};for(let i=1;i<=40;i++){state.turn++;state.floorTurn++;alliesTurn();if(!crow.furyStarted105)continue;out.at=i;break}
  Object.assign(out,{ally:isPlayerAlly57(crow),started:!!crow.furyStarted105,power:crow.power61?.turns,kite:!!crow.kite105});return out},
 // 불사조: 살라맨더와 같은 화염 착탄(fireArtillery)을 쓰고, 미니보스라 층에 한 마리만 놓인다.
 phoenixShell:()=>{lb.arena();const m=lb.spawn('불사조',12,8);m.x=12;m.y=8;OccupancyService.move(m,12,8);const period=combatDepth(m)>=16?5:6,phase=(m.x*3+m.y*5)%7;state.floorTurn=phase%period+period*10;m.intent61=null;
  const out={role:m.role61,mini:!!m.miniBoss,hp:m.maxHp>0,dash:!!m.phoenixDash105};out.shell=!!globalThis.__MANRU_AI61__.artillery(m,state.player)&&m.intent61?.type==='fire';return out},
 spawnOnce:()=>{lb.arena();state.monsters=[];const rs=[];for(let k=0;k<6;k++){const x=5+k*5;rs.push({x,y:9,w:5,h:9,cx:x+2,cy:13})}
  try{spawnDungeon46('lava_bow',rs)}catch(e){return{error:String(e&&e.message||e)}}
  const names=state.monsters.map(q=>q.name.replace(' · 문지기',''));const count=n=>names.filter(x=>x===n).length;
  return{phoenix:count('불사조'),crow:count('삼족오'),salamander:count('용암 살라맨더'),total:names.length,phoenixMini:state.monsters.filter(q=>q.name==='불사조').every(q=>q.miniBoss)}},
 dash:()=>{lb.arena();const m=lb.spawn('불사조',10,14),foe={name:'시험 대상',x:14,y:14,hp:999,maxHp:999,faction57:'player',kind:'human',alerted:true};OccupancyService.addMonster(foe);
  const started=startPhoenixDash(m,foe,4),I=m.intent61;const out={started,type:I?.type,cells:I?.cells?.length};state.turn+=1;executeMonsterIntent(m);
  Object.assign(out,{foeHurt:foe.hp<999,moved:m.x>14,fire:(state.tempFields||[]).filter(f=>f.kind==='fire').length,cooling:m.nextPhoenixDashTurn>state.turn});return out}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => ({ names: lb.names(), crow: lb.crow(), revive: lb.revive(), dash: lb.dash(), debugCrow: lb.debugCrow(), allyCrow: lb.allyCrow(), phoenixShell: lb.phoenixShell(), spawnOnce: lb.spawnOnce() }));
console.log(JSON.stringify(out));
assert.ok(out.names.includes('삼족오') && out.names.includes('불사조'), '용암궁 몹 목록에 없다');
const c = out.crow;
assert.ok(c.kiteBefore && c.ranged, '삼족오가 처음엔 유격으로 움직이지 않는다');
assert.ok(!c.early && !c.at19, '20턴 전에 발동했다');
assert.ok(c.started && c.power === 99 && c.track === 99, `20턴 뒤 괴력/추적 99턴 ${JSON.stringify(c)}`);
assert.ok(!c.kiteAfter && !c.rangedAfter, '발동 뒤에도 거리를 잰다');
assert.ok(c.shell, '삼족오가 불꽃탄 예고를 못 한다');
assert.equal(c.quake, 'earthQuake'); assert.equal(c.role, 'fireArtillery');
const r = out.revive;
assert.equal(r.lives, 2); assert.ok(r.began && r.phase === 'corpse', '쓰러져도 시체로 안 남는다');
assert.equal(r.phaseAfter, 'full'); assert.ok(r.atkAfter > r.baseAtk && r.defAfter > r.baseDef, '부활 뒤 스펙이 안 오른다');
assert.equal(r.livesAfter, 1); assert.equal(r.again, false, '두 번 부활한다');
const d = out.dash;
assert.ok(d.started && d.type === 'phoenixDash' && d.cells >= 4, '돌진 예고가 안 선다');
assert.ok(d.foeHurt && d.moved && d.fire >= 1 && d.cooling, `관통 돌진 결과 ${JSON.stringify(d)}`);
const dc = out.debugCrow;
assert.ok(dc.started && dc.at >= 20 && dc.at <= 22 && dc.power === 99 && !dc.kite, `디버그 전장에서 삼족오 20턴 발동 ${JSON.stringify(dc)}`);
const ac = out.allyCrow;
assert.ok(ac.ally && ac.started && ac.at >= 20 && ac.at <= 22 && ac.power === 99 && !ac.kite, `플레이어 편 삼족오 20턴 발동 ${JSON.stringify(ac)}`);
const ps = out.phoenixShell;
assert.ok(ps.role === 'fireArtillery' && ps.mini && ps.dash, `불사조 역할/미니보스 ${JSON.stringify(ps)}`);
assert.ok(ps.shell, `불사조가 화염 착탄 예고를 못 한다 ${JSON.stringify(ps)}`);
const so = out.spawnOnce;
assert.ok(!so.error, `용암궁 몹 배치 오류 ${JSON.stringify(so)}`);
assert.equal(so.phoenix, 1, `불사조는 층에 한 마리 ${JSON.stringify(so)}`); assert.ok(so.phoenixMini && so.crow >= 1 && so.salamander >= 1, `다른 몹은 그대로 나와야 한다 ${JSON.stringify(so)}`);
assert.deepEqual(errors, []);
await browser.close();
console.log('lava-birds: ok');
process.exit(0);
