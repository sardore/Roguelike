import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun } from './harness.mjs';

const bridge = `globalThis.checkWillResistance = () => {
  const player=state.player;
  const target={name:'시험 적',x:player.x+1,y:player.y,hp:100,maxHp:100,will:6};
  const timing=hostileStatusChance(1,6);
  const original=globalThis.__MANRU_RANDOM57__;
  try{
    globalThis.__MANRU_RANDOM57__=()=>.99;
    const resisted=!applyCombatStatus(target,'weaken',2,1)&&!target.weakened;
    const playerResisted=!applyHostileStatus('stun',1,1)&&!state.status.stun;
    globalThis.__MANRU_RANDOM57__=()=>.25;
    player.weapon={...player.weapon,elementBrand74:'water'};
    applyWeaponBrandHit(player,target,1);
    const waterTurns=target.weakened;
    target.weakened=0;
    globalThis.__MANRU_RANDOM57__=()=>.35;
    applyWeaponBrandHit(player,target,1);
    return {timing,resisted,playerResisted,waterTurns,waterResisted:!target.weakened};
  }finally{globalThis.__MANRU_RANDOM57__=original;}
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js', route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try{
  await startRun(session,'wanderer');
  assert.deepEqual(await session.page.evaluate(()=>checkWillResistance()),
    {timing:.5,resisted:true,playerResisted:true,waterTurns:4,waterResisted:true});
  assert.deepEqual(session.errors,[]);
}finally{
  await session.close();
  await context.close();
  await browser.close();
}
