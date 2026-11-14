import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun } from './harness.mjs';

const bridge = `globalThis.checkGumimyoSight = () => {
  regenerateFloor(7);
  state.debugBattle57=true;
  state.monsters=[];
  for(let y=2;y<26;y++)for(let x=2;x<38;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);
  OccupancyService.move(state.player,4,4);
  const add=(name,x,y,team)=> {
    const mon={...scaledMonster(MONSTERS.find(def=>def.name===name)),x,y,dormant57:false,debugSide57:team,faction57:team};
    OccupancyService.addMonster(mon);
    return mon;
  };
  const cat=add('구미묘',20,14,'hostile'), target=add('금령',24,14,'player');
  cat.fixed=true;
  const childCount=()=>state.monsters.filter(mon=>mon.spawnProvenance57==='los-lost-summon').length;
  const action=opponent=>resolveMonsterTargetTurn57(cat,opponent,{act:true,steps:0});
  cat.gaze=true;cat.gazeCount=4;
  configureMonsterTraits(cat);
  for(let turn=0;turn<6;turn++)action(target);
  const before={gaze:!!cat.gaze,stun:target.stunned||0,children:childCount(),tracked:cat.losOpponentId105===target.combatantId54&&!!target.combatantId54};
  setTerrainTile58(state.map,22,14,TT.WALL);
  action(null);
  const after=childCount();
  action(null);
  const repeated=childCount();
  const fox=add('구미호',20,19,'hostile'), other=add('금령',24,19,'player');
  for(let turn=0;turn<5;turn++)evaluateMonsterSpecials(fox,true,4,other);
  return {before,after,repeated,foxStun:other.stunned||0};
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try {
  await startRun(session,'wanderer');
  const result=await session.page.evaluate(()=>window.checkGumimyoSight());
  assert.deepEqual(result,{before:{gaze:false,stun:0,children:0,tracked:true},after:1,repeated:1,foxStun:2});
  assert.deepEqual(session.errors,[]);
} catch (error) {
  console.error(session.errors);
  throw error;
} finally {
  await session.close();
  await context.close();
  await browser.close();
}
