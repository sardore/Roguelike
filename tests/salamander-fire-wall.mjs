import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun } from './harness.mjs';

const bridge = `globalThis.checkFireWall = () => {
  regenerateFloor(7);
  state.debugBattle57=true;
  state.monsters=[];state.tempFields=[];state.tempTerrain74=[];
  for(let y=4;y<25;y++)for(let x=4;x<35;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);
  OccupancyService.move(state.player,8,8);
  const mon={...scaledMonster(mobDefs47('lava_bow').find(d=>d.legendSkill47==='fireWall')),x:20,y:14,alerted:true};
  const foe={name:'시험 대상',x:21,y:14,hp:999,maxHp:999,faction57:'player',kind:'human'};
  OccupancyService.addMonster(mon);OccupancyService.addMonster(foe);
  mon.hp=mon.maxHp-20;
  const used=enemySpecial47(mon,foe),healed=mon.hp>mon.maxHp-20;
  const warnings=state.tempFields.map(f=>f.cells.length);
  const advance=()=>{
    state.turn++;tickCombatFields57();expireCombatFields();
    if(foe.stunned>0)foe.stunned--;
    RuntimeTerrainOwner.tick();
  };
  const walls=()=>state.tempTerrain74.filter(w=>w.rootWall105?.element==='fire');
  advance();
  const inner=walls().length,stunned=foe.stunned===1;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=48;
  const ctx=canvas.getContext('2d');ctx.translate(8,8);
  drawPalaceRock(ctx,1,'fire',false);
  const dark=ctx.getImageData(0,0,48,48).data;
  ctx.clearRect(-8,-8,48,48);drawPalaceRock(ctx,1,'fire',true);
  const bright=ctx.getImageData(0,0,48,48).data;
  const glow=bright.some((value,index)=>index%4===3&&value>12&&dark[index]===0);
  advance();
  const outer=walls().length,center=state.map[14][20],corner=state.map[12][18];
  const perWall=walls()[0].rootWall105.damage;
  const hp=foe.hp;
  advance();
  const fires=state.tempFields.filter(f=>f.kind==='fire');
  return {used,healed,warnings,inner,stunned,glow,outer,centerFloor:center===TT.FLOOR,cornerFloor:corner===TT.FLOOR,
    lower:perWall<mon.atk,hit:foe.hp<hp,restored:walls().length===0&&state.map[14][21]===TT.FLOOR,
    fire:fires.length===1&&fires[0].ttl===3&&fires[0].cells.some(c=>c.x===21&&c.y===14)};
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try {
  await startRun(session,'wanderer');
  const result=await session.page.evaluate(()=>checkFireWall());
  assert.deepEqual(result,{used:true,healed:true,warnings:[8,12],inner:8,stunned:true,glow:true,outer:20,centerFloor:true,cornerFloor:true,lower:true,hit:true,restored:true,fire:true});
  assert.deepEqual(session.errors,[]);
} finally {
  await session.close();
  await context.close();
  await browser.close();
}
