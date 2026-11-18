// Revive code 1024: a death keeps the run's last save, a new run discards it, and the code puts it back (full health, fresh run id).
// Run: MANRU_CHROMIUM=... node tests/revive-code.mjs   (needs dist-qa/, `npm run build:qa`)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assembleGame,QA_MARKER} from '../tools/lib/game.mjs';
import {launch,openSession,startRun,dismissModals} from './harness.mjs';
const bridge=`globalThis.probeRevive=async()=>{
 const out={},ls=k=>localStorage.getItem(k);
 SaveService.commit('probe');
 const rid=state.runId984,turn=state.turn,floor=state.floor,max=state.player.maxHp;
 state.player.hp=0;die('시험');
 out.dead={dead:state.dead,kept:!!ls('manru1004_dead_run_save'),activeCleared:!ls('manru1004_active_run')&&!ls('manru1004_active_run_shadow'),canContinue:!!SaveService.recover().candidate};
 out.wrong=await PlayStats.redeemRecoveryCode('1025');
 out.revive=await PlayStats.redeemRecoveryCode('1024');
 out.after={dead:state.dead,hp:state.player.hp,max:state.player.maxHp===max,freshRunId:state.runId984!==rid,floor:state.floor===floor,turn:state.turn===turn,keptLeft:!!ls('manru1004_dead_run_save')};
 out.whileAlive=await PlayStats.redeemRecoveryCode('1024');
 state.player.hp=0;die('시험2');out.deadAgain={kept:!!ls('manru1004_dead_run_save')};
 newGame(CLASSES.find(c=>c.id==='wanderer'));
 out.newRun={kept:!!ls('manru1004_dead_run_save'),alive:!state.dead};
 return {out,max};
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const b=await launch(),c=await b.newContext({viewport:{width:1514,height:1080}});
await c.route('**/scripts/10-runtime.js',r=>r.fulfill({contentType:'text/javascript',body:runtime}));
const s=await openSession(b,new URL('../dist-qa',import.meta.url).pathname,{context:c,seed:77});
try{
  await startRun(s,'wanderer');await dismissModals(s);await s.tick(800);
  const {out,max}=await s.page.evaluate(()=>probeRevive());
  assert.deepEqual(out.dead,{dead:true,kept:true,activeCleared:true,canContinue:false},'death keeps the run but keeps 이어하기 closed');
  assert.equal(out.wrong,'알 수 없는 코드다.');
  assert.equal(out.revive,'','1024 revives');
  assert.deepEqual(out.after,{dead:false,hp:max,max:true,freshRunId:true,floor:true,turn:true,keptLeft:false},'revived at full health, same floor and turn, new run id, record consumed');
  assert.equal(out.whileAlive,'진행 중인 탐사가 있다.');
  assert.equal(out.deadAgain.kept,true);
  assert.deepEqual(out.newRun,{kept:false,alive:true},'a new run discards the kept record');
  assert.deepEqual(s.errors,[]);
  console.log('revive-code: ok');
}finally{await s.close();await b.close()}
