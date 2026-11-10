import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import {launch,openSession,startRun,dismissModals} from './harness.mjs';
const args=process.argv.slice(2),root=path.resolve(args.includes('--root')?args[args.indexOf('--root')+1]:'dist-qa'),reference=args.includes('--reference');
const benchmarkOnly=args.includes('--benchmark-only'),metrics={};
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
  await travel('main:9');await s.tick(1200);
  const legend=await s.page.evaluate(()=>{
   const api=__MANRU_LEGEND47__;for(const def of api.defs()){if(def.id==='water_crossbow')continue;const portal=api.forcePortal(def.id);if(portal)return{ok:api.enter(portal.id),id:portal.id};}throw Error('no available real legendary portal');
  });assert.equal(legend.ok,true,'legendary entry');await check('legendary entry');await s.tick(1200);
  assert.equal(await s.page.evaluate(()=>__MANRU_LEGEND47__.restore()),true,'legendary return');await check('legendary return');
  console.log(JSON.stringify({seed,mode,legend:legend.id,legendRoundTrip:true}));
  if(mode==='none'){
   for(const held of [false,true]){
    if(held){await s.page.evaluate(()=>{const A=__MANRU_QA_BROOD__,st=__MANRU_QA_UI__.state(),book=A.book(),name='객잔 쥐';book.summonElement105='fire';book.summonPictures105={[name]:{count:1,portrait:structuredClone(A.definitions.find(d=>d.name===name))}};st.player.inventory.push(book);A.summoning();});await s.tick(1200);}
    await s.page.evaluate(()=>__MANRU_QA_BROOD__.cleanup());const times=[];
    for(let trial=0;trial<3;trial++){const start=process.hrtime.bigint();await s.page.evaluate(()=>{for(let i=0;i<20;i++)__MANRU_QA_BROOD__.cleanup();});times.push(Number(process.hrtime.bigint()-start)/1e6);}
    times.sort((a,b)=>a-b);metrics[held?'book':'empty']={milliseconds:times[1],iterations:20};
   }
   console.log('BRANCH_CLEANUP_BENCHMARK='+JSON.stringify(metrics));
  }
 }finally{await s.close();}
}
try{
 for(const mode of reference?['root']:benchmarkOnly?['none']:['none','root','children'])await scenario(9045,mode);
 console.log(reference?'REFERENCE: reproduced missing follower contract':'PASS: palace entry, both levels, return, revisit and save preserve all book families');
 if(args.includes('--bench-json'))fs.writeFileSync(args[args.indexOf('--bench-json')+1],JSON.stringify(metrics));
}finally{await browser.close();}
