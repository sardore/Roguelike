import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun } from './harness.mjs';

const bridge = `globalThis.checkLateMonsters = () => {
  regenerateFloor(14);
  state.monsters=[];state.items=[];state.tempFields=[];state.jarGasFields57=[];state.status={};
  for(let y=6;y<25;y++)for(let x=6;x<30;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);
  const p=state.player;
  p.hp=p.maxHp=999;
  OccupancyService.move(p,16,16);
  const spawn=(name,x,y)=> {
    const mon=scaledMonster(MONSTERS.find(d=>d.name===name)||CITADEL_ENEMIES105.find(d=>d.name===name));
    Object.assign(mon,{x,y,alerted:true});
    OccupancyService.addMonster(mon);
    return mon;
  };
  const remove=mon=>OccupancyService.removeMonster(mon);
  const mapAt=(x,y)=>state.map[y][x];
  const wall=(x,y)=>setTerrainTile58(state.map,x,y,TT.WALL);
  const floorList={};
  for(const floor of [12,13,14,15,19,20,21,25]) {
    state.floor=floor; floorList[floor]=floorEnemyDefinitions().map(def=>def.name);
  }
  state.floor=14;
  const breach=spawn('파성 갑병',14,16);
  wall(15,16);wall(15,17);
  VisibilityService.compute();
  const before=p.hp;
  const key=state.turn;
  state._movementDiscovery105={map:state.map,monsters:new Set([breach])};
  const breached=specialTurn(breach,null,p)&&mapAt(15,16)===TT.FLOOR&&mapAt(15,17)===TT.FLOOR&&!breach.intent61;
  const firstDodge=p.hp===before&&!state.status.weaken;
  delete state._movementDiscovery105;
  state.turn=key+5;window.__reseed(351);
  const breachHit=specialTurn(breach,null,p)|| (OccupancyService.move(breach,15,16),specialTurn(breach,null,p));
  const breachWeaken=p.hp<before&&state.status.weaken===4;
  const shockwave=FX.projectiles.find(v=>v.kind==='breach-shockwave');
  remove(breach);
  OccupancyService.move(p,19,16);wall(17,16);VisibilityService.compute();
  const ambusher=spawn('파성 갑병',14,16);
  ambusher.alerted=false;ambusher.hasSeenPlayer105=false;
  const beforeApproach=p.hp;
  resolvePlayerLanding57(18,16);
  state.turn++;monsterTurn();
  const movementGrace=mapAt(17,16)===TT.FLOOR&&p.hp===beforeApproach;
  delete state._movementDiscovery105;
  remove(ambusher);OccupancyService.move(p,16,16);
  const thunder=spawn('피뢰 갑병',12,16);
  window.__reseed(351);
  const armed=specialTurn(thunder,null,p)&&thunder.intent61.cells.length===1;
  const initialThunder=FX.projectiles.filter(v=>v.kind==='thunder-strike').length;
  const landed=[];
  for(let i=1;i<=3;i++){
    OccupancyService.move(p,16,16+i);
    VisibilityService.compute();state.turn++;
    tickThunderStrikes();
    const fx=FX.projectiles.filter(v=>v.kind==='thunder-strike').at(-1);
    landed.push(fx?.y1/TILE-.5);
  }
  const bolts=FX.projectiles.filter(v=>v.kind==='thunder-strike');
  const thunderEnd=!thunder.intent61&&bolts.length-initialThunder===3;
  const stun=state.status.stun;
  remove(thunder);
  state.status={};state.turn+=20;
  const fairy=spawn('향기요정',13,16),ally=spawn('반영 검객',18,19);
  const original=combatEntityStats(ally);
  OccupancyService.move(p,16,16);
  const alarm=specialTurn(fairy,null,p)&&bodyPowerActive(ally);
  const power=combatEntityStats(ally);
  const powerActions=[monsterActionSchedule(ally).actions,monsterActionSchedule(ally).actions];
  const powerTurns=combatStatusRows(ally).find(r=>r.key==='bodyPower').turns;
  for(let i=0;i<14;i++)advanceBodyPower(ally,++state.turn);
  const exhausted=!bodyPowerActive(ally)&&combatStatusTurns(ally,'blind')===14&&combatStatusTurns(ally,'upset')===14;
  OccupancyService.move(ally,17,17);
  const guard=specialTurn(ally,null,p)&&ally.guardCharges1005===2;
  remove(fairy);remove(ally);
  const watcher=spawn('성채 비행 감시자',14,16),bell=spawn('종루 파수령',15,20),far=spawn('반영 검객',22,21);
  wall(21,21);wall(21,20);
  const marked=specialTurn(watcher,null,p)&&playerTargetMarkTurns()===6&&playerDetectedBy(far);
  state.turn+=6;
  const expired=!playerTargetMarked();
  OccupancyService.move(bell,16,19);
  const bellMarked=specialTurn(bell,null,p)&&playerTargetMarked();
  remove(watcher);remove(bell);remove(far);
  const maid=spawn('악몽 시녀',18,16);
  updateSummonerEngagement(maid,true);state.floorTurn+=2;
  state.floor=15;const bossBound=!tryMonsterSummon(maid);
  state.floor=14;const summoned=tryMonsterSummon(maid);
  const brood=state.monsters.filter(x=>bossChildOf(x,maid));
  const phases=brood.every(x=>x.fast&&x.kind==='undead'&&x.eva>=15&&PlacementService.terrainStandable(x,TT.WALL));
  const distinct=new Set(brood.map(x=>x.name)).size;
  const portraits=[maid,...brood].map(x=>monsterCanvas(x,1).toDataURL());
  maid.hp=0;killMonster(maid);
  const dismissed=brood.every(x=>!state.monsters.includes(x));
  const dragon=spawn('흑룡',17,16);
  VisibilityService.compute();window.__reseed(351);
  const dragonBefore=p.hp;
  state._movementDiscovery105={map:state.map,monsters:new Set([dragon])};
  const beforeEvasions=FX.floats.filter(f=>f.text==='회피').length;
  monsterTurn();
  const repeatGrace=p.hp===dragonBefore&&!state.status.illness&&FX.floats.filter(f=>f.text==='회피').length-beforeEvasions===2;
  delete state._movementDiscovery105;
  const attack=monsterAttacksTarget(dragon,0,{target:p,delivery:'melee',range:1});
  const gas=attack.damage>0&&state.jarGasFields57.some(f=>f.status57==='illness')&&state.status.illness===27;
  const canvas=document.createElement('canvas');canvas.width=COLS*TILE;canvas.height=ROWS*TILE;
  const ctx=canvas.getContext('2d');drawCombatProjectile(ctx,shockwave,shockwave.start+160);
  const impactDrawn=ctx.getImageData(Math.floor(shockwave.x1)-48,Math.floor(shockwave.y1)-48,96,96).data.some((v,i)=>i%4===3&&v>0);
  drawCombatProjectile(ctx,bolts.at(-1),bolts.at(-1).start+170);
  portraits.push(monsterCanvas(dragon,1).toDataURL());
  const flail={type:'weapon',name:'편곤',atk:9,upgrade:3};p.inventory.push(flail);normalizeItemContainers57();normalizeItemContainers57();
  return {floorList,breached,firstDodge,movementGrace,breachHit,breachWeaken,armed,landed,thunderEnd,stun,alarm,
    powerDelta:[power.atk-original.atk,power.def-original.def],powerActions,powerTurns,exhausted,guard,marked,expired,bellMarked,
    bossBound,summoned,phases,distinct,dismissed,repeatGrace,gas,impactDrawn,portraits:new Set(portraits).size,flail:flail.atk};
};`;

const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try{
  await startRun(session,'wanderer');
  const {floorList,...result}=await session.page.evaluate(()=>checkLateMonsters());
  for(const [name,min,max] of [['반영 검객',13,15],['악몽 시녀',14,15],['흑룡',14,20],['피뢰 갑병',14,20],['파성 갑병',19,25]]){
    for(const [floor,roster] of Object.entries(floorList))assert.equal(roster.includes(name),floor>=min&&floor<=max,`${name} ${floor}F`);
  }
  assert.deepEqual(result,{breached:true,firstDodge:true,movementGrace:true,breachHit:true,breachWeaken:true,armed:true,landed:[17,18,19],
    thunderEnd:true,stun:3,alarm:true,powerDelta:[2,7],powerActions:[1,2],powerTurns:14,exhausted:true,guard:true,
    marked:true,expired:true,bellMarked:true,bossBound:true,summoned:true,phases:true,distinct:3,dismissed:true,repeatGrace:true,gas:true,impactDrawn:true,portraits:5,flail:7});
  assert.deepEqual(session.errors,[]);
}finally{
  await session.close();
  await context.close();
  await browser.close();
}
