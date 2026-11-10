import assert from 'node:assert/strict';
import path from 'node:path';
import {launch,openSession,startRun,dismissModals} from './harness.mjs';
const args=process.argv.slice(2),root=path.resolve(args.includes('--root')?args[args.indexOf('--root')+1]:'dist-qa'),reference=args.includes('--reference');
const browser=await launch();
async function scenario(seed,mode){
 const s=await openSession(browser,root,{seed}),diagnostics=[];
 s.page.on('console',msg=>{if(msg.type()==='error')diagnostics.push(msg.text());});
 try{
  await startRun(s,'wanderer');await dismissModals(s);await s.tick(1200);
  await s.page.evaluate(()=>{
   const st=__MANRU_QA_UI__.state();st.player.hp=st.player.maxHp=st.player.baseMaxHpPermanent=100000;st.player.inventory=[];st.status={};
   __MANRU_RELEASE__.regen(9);st.monsters=[];__MANRU_QA_BROOD__.occupancy.endShared();
  });
  await s.tick(1200);
  await s.page.evaluate(mode=>{
   const A=__MANRU_QA_BROOD__,st=__MANRU_QA_UI__.state();
   if(mode==='none')return[];
   const book=A.book(),name=mode==='children'?'어미거미':'객잔 쥐';book.upgrade=2;book.summonElement105='fire';book.summonPictures105={[name]:{count:1,portrait:structuredClone(A.definitions.find(d=>d.name===name))}};st.player.inventory.push(book);A.summoning();
   if(!A.summon(name,book.summonBookId105))throw Error('book cast failed');
   return A.all().map(m=>({id:m.allyId53,contract:m.summonContract105,root:m.summonRoot105}));
  },mode);
  await s.tick(1200);
  const ids=await s.page.evaluate(mode=>{
   const A=__MANRU_QA_BROOD__;if(mode==='children'){const m=A.all()[0];m.hp=0;A.kill(m);A.cleanup();}
   return A.all().map(m=>({id:m.allyId53,contract:m.summonContract105,root:m.summonRoot105}));
  },mode);
  assert.equal(ids.length,mode==='none'?0:mode==='children'?3:1);
  const entry=await s.page.evaluate(()=>{
   const st=__MANRU_QA_UI__.state(),portal=st.branchPortals105.find(p=>p.id==='palace');if(!portal)throw Error('missing real floor 9 palace entrance');
   const ok=__MANRU_QA_SEALING__.branch(portal);return{ok,context:__MANRU_QA_UI__.state().branchContext105,toast:document.getElementById('toast')?.textContent};
  });
  console.log(JSON.stringify({seed,mode,entry,errors:s.errors,diagnostics}));
  if(reference&&mode!=='none'){
   assert.equal(entry.ok,false);assert.match(diagnostics.join('\n'),/추종 소환체 계약 불일치/);return;
  }
  assert.equal(entry.ok,true,JSON.stringify({entry,errors:s.errors}));
  assert.equal(entry.context.id,'palace');assert.equal(entry.context.level,1);
  const check=async(label)=>{
   const result=await s.page.evaluate(()=>{
    const A=__MANRU_QA_BROOD__,st=__MANRU_QA_UI__.state();A.cleanup();
    return{family:A.all().map(m=>({id:m.allyId53,contract:m.summonContract105,root:m.summonRoot105})),valid:A.all().every(m=>A.admit(m,{existing:true})),unique:new Set(A.all().map(m=>m.x+','+m.y)).size===A.all().length};
   });
   assert.deepEqual(result.family,ids,label);assert.ok(result.valid&&result.unique,label);
  };
  await check('entry');
  const travel=async(to)=>{
   await s.tick(1200);const r=await s.page.evaluate(to=>{
    const st=__MANRU_QA_UI__.state(),portal=st.branchPortals105.find(p=>p.to===to);if(!portal)throw Error('missing actual portal to '+to);
    return __MANRU_QA_SEALING__.branch(portal);
   },to);assert.equal(r,true,'travel to '+to);await check(to);
  };
  await travel('palace:2');await travel('palace:1');await travel('main:9');await travel('palace:1');
  const loaded=await s.page.evaluate(()=>__MANRU_RELEASE__.save().ok&&__MANRU_RELEASE__.load());assert.ok(loaded);await check('saved palace family');
  assert.deepEqual(s.errors,[]);
  console.log(JSON.stringify({seed,mode,roundTrip:true,saved:true,family:ids.length}));
 }finally{await s.close();}
}
try{
 for(const mode of reference?['root']:['none','root','children'])await scenario(9045,mode);
 console.log(reference?'REFERENCE: reproduced missing follower contract':'PASS: palace entry, both levels, return, revisit and save preserve all book families');
}finally{await browser.close();}
