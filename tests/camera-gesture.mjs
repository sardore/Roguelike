import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun } from './harness.mjs';

const bridge = `globalThis.cameraGestureTest = {
  start(){
    regenerateFloor(7);
    for(let y=8;y<33;y++)for(let x=8;x<40;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);
    for(const mon of [...state.monsters])OccupancyService.removeMonster(mon);
    OccupancyService.move(state.player,20,20);
    resetVisualState();VisibilityService.compute();updateAll();
    Auto81.startPath(Array.from({length:12},(_,i)=>({x:21+i,y:20})));
  },
  status(){return {active:Auto81.active,mode:CameraState.snapshot().mode,moves:Runtime81.qa.mapTaps,turn:state.turn,x:state.player.x,y:state.player.y}},
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try{
  await startRun(session,'wanderer');
  const box=await session.page.locator('#runtimeInput81').boundingBox();
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await session.page.mouse.move(x,y);
  await session.page.mouse.down();
  await session.page.evaluate(()=>cameraGestureTest.start());
  const status=()=>session.page.evaluate(()=>cameraGestureTest.status());
  assert.equal((await status()).active,true);
  await session.page.mouse.move(x+100,y);
  const dragged=await status();
  assert.equal(dragged.active,false);
  assert.equal(dragged.mode,'free');
  await session.page.mouse.up();
  await session.tick(350);
  assert.deepEqual(await status(),dragged);
  await session.page.keyboard.press('ArrowRight');
  await session.tick(300);
  assert.equal((await status()).mode,'follow');
  assert.ok((await status()).x>dragged.x);
  assert.deepEqual(session.errors,[]);
}finally{
  await session.close();
  await context.close();
  await browser.close();
}
