import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun } from './harness.mjs';

const bridge = `globalThis.rapidFireTest = {
  offer() {
    const manual = makeMartialManual({kind:'test'}, 'rapid-fire-test');
    state.player.inventory.unshift(manual);
    if(!rollMartialChoices1005(state.player,()=>.9999).some(c=>c.id==='rapidFire'&&c.form==='learn'))throw Error('missing offer');
    state.pendingMartialManualChoice={manualId:manual.manualId,choices:[{id:'rapidFire',form:'learn'}]};
    if(!showMartialManual(manual))throw Error('manual did not open');
  },
  stats() {
    const p=state.player;
    return {level:p.martial.rapidFire, bow:attackTurnCost(p.weapon), melee:attackTurnCost({kind:'sword',speed:1}), focus:p.focus};
  },
  upgrade() {
    state.player.skillPoints=1;
    upgradeMartial('rapidFire');
    return document.querySelector('[data-martial-inspect="rapidFire"]').textContent;
  },
  legacy() {
    const snapshot=GameState.project(state);delete snapshot.player.martial.rapidFire;
    return migrateGameState(snapshot).player.martial.rapidFire;
  },
  saved() {return migrateGameState(GameState.project(state)).player.martial.rapidFire;},
  otherClass() {return martialIds({classId:'wanderer'}).includes('rapidFire');}
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try {
  await startRun(session,'archer');
  const before=await session.page.evaluate(()=>rapidFireTest.stats());
  assert.equal(before.level,0);
  await session.page.evaluate(()=>rapidFireTest.offer());
  await session.page.locator('[data-manual-skill="rapidFire"]').click();
  const learned=await session.page.evaluate(()=>rapidFireTest.stats());
  assert.equal(learned.level,1);
  assert.ok(Math.abs(before.bow / learned.bow - 1.08)<1e-8);
  const description=await session.page.evaluate(()=>rapidFireTest.upgrade());
  assert.match(description,/16%/);
  const upgraded=await session.page.evaluate(()=>rapidFireTest.stats());
  assert.equal(upgraded.level,2);
  assert.ok(Math.abs(before.bow / upgraded.bow - 1.16)<1e-8);
  assert.equal(upgraded.melee,before.melee);
  assert.deepEqual(await session.page.evaluate(()=>[rapidFireTest.saved(),rapidFireTest.legacy(),rapidFireTest.otherClass()]),[2,0,false]);
  assert.deepEqual(session.errors,[]);
} finally {
  await session.close();
  await context.close();
  await browser.close();
}
