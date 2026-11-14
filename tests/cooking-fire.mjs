import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assembleGame, QA_MARKER} from '../tools/lib/game.mjs';
import {launch, openSession, startRun} from './harness.mjs';

const bridge = `globalThis.checkCookingFire = () => {
  regenerateFloor(7);
  const tiles=[TT.BRAZIER,TT.COOKPOT], results=[];
  for(const tile of tiles){
    const {x,y}=state.player, station={x:x+1,y}, neighbour={x:x-1,y};
    for(const cell of [station,neighbour]){
      setTerrainTile58(state.map,cell.x,cell.y,TT.FLOOR);
      setTerrainTile58(state.map,cell.x,cell.y,tile);
    }
    const interact=()=>bumpTileAction(station.x,station.y,{cause:'interact',activeInteraction:true});
    emitElementContact105('water',[station]);
    interact();
    const coldBlocked=!V57.cookOpen&&!terrainUnlit105(neighbour.x,neighbour.y);
    emitElementContact105('fire',[station]);
    interact();
    const litOpened=V57.cookOpen;
    const item={...clone(foodDef('말린 육포')),count:1};
    V57.selected.add(state.player.inventory.push(item)-1);
    emitElementContact105('water',[station]);
    const before=state.turn;
    const coldCommitBlocked=cookSelected()===false&&state.turn===before&&state.player.inventory.includes(item);
    emitElementContact105('fire',[station]);
    const litCommit=cookSelected()===true&&!state.player.inventory.includes(item);
    results.push({coldBlocked,litOpened,coldCommitBlocked,litCommit});
  }
  return results;
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try{
  await startRun(session,'wanderer');
  const expected={coldBlocked:true,litOpened:true,coldCommitBlocked:true,litCommit:true};
  assert.deepEqual(await session.page.evaluate(()=>checkCookingFire()),[expected,expected]);
  assert.deepEqual(session.errors,[]);
}finally{
  await session.close();
  await context.close();
  await browser.close();
}
