import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {assembleGame,QA_MARKER} from '../tools/lib/game.mjs';
import {launch,openSession,startRun,dismissModals} from './harness.mjs';
const repo=path.resolve('.'),art=path.join(repo,'tests/artifacts/imugi');fs.mkdirSync(art,{recursive:true});
const bridge=`globalThis.imugiTest={state:()=>state,TT,monsters:monsterTurn,allies:alliesTurn,schedule:monsterActionSchedule,step:moveMonsterToward,path:monsterPathStep,can:canMonsterStep,place:PlacementService,occupancy:OccupancyService,scale:scaledMonster,summon:tryMonsterSummon,engage:updateSummonerEngagement,fields:combatFieldBlocks57,skills:monsterSkills,art:monsterCanvas,cache:ACTOR_CACHE,debug:DEBUG_BATTLE57,round:debugBattleRound57,update:updateAll,fx:FX,configure:configureMonsterTraits,id:combatantId,project:()=>GameState.project(state),load:loadGame};`;
const runtime=assembleGame(path.join(repo,'src')).text.replace(QA_MARKER,fs.readFileSync(path.join(repo,'src/qa/qa.js'),'utf8')+'\n'+bridge);
const browser=await launch(),ctx=await browser.newContext({viewport:{width:1280,height:800}});await ctx.route('**/scripts/10-runtime.js',r=>r.fulfill({contentType:'text/javascript',body:runtime}));
const s=await openSession(browser,path.join(repo,'dist-qa'),{context:ctx,seed:9045}),ev=(fn,arg)=>s.page.evaluate(fn,arg);s.page.on('console',msg=>{if(msg.type()==='error')console.error('BROWSER: '+msg.text());});
const setup=async(debug=false)=>{await dismissModals(s);await s.tick(1000);await ev(debug=>{
 const Q=imugiTest,st=Q.state(),p=st.player,T=Q.TT;
 st.monsters=[];st.items=[];st.decor=[];st.decals=[];st.tempFields=[];st.tempTerrain74=[];st.jarGasFields57=[];st.elementFields74=[];st.status={};st.terrainUnderlay58={};st.terrainAttachment58={};st.terrainMutationVersion57={};delete st.terrainReactions105;st.branchContext105=null;st.branchTerrain105=null;st.branchWorld105={version:1,pages:{}};st.artifactDungeon46=null;st.artifactReturn46=null;st.shopIntermission=null;st.debugBattle57=debug;st.dead=false;st.victory=false;st.runState57='playing';st.turn=100;st.floorTurn=100;st.playerAgencyTurns57=100;st.enemyEnergy=0;st.floor=11;delete st._movementDiscovery105;st.tutorialEntry60={completed:true};
 p.x=34;p.y=30;p.hp=p.maxHp=p.baseMaxHpPermanent=100000;p.hunger=100;p.inventory=[];delete p.summoning105;
 st.visible=new Set();st.seen=new Set();for(let y=1;y<st.map.length-1;y++)for(let x=1;x<st.map[y].length-1;x++){st.map[y][x]=T.FLOOR;st.visible.add(x+','+y);st.seen.add(x+','+y);}
 for(const key of ['particles','floats','slashes','rings','projectiles','doors'])Q.fx[key]=[];Q.occupancy.endShared();if(debug){Q.debug.winner=null;Q.debug.round=0;}
},debug);};
const failures=[];async function check(name,body){try{await body();console.log('PASS_GROUP='+name);}catch(error){failures.push(name+': '+error.stack);console.error('FAIL_GROUP='+name+' '+error.stack);}}
try{
 await startRun(s,'wanderer');
 await check('generation',async()=>{
 const generated=[];
 for(const seed of [9045,71,319,12016]){
  await setup();await ev(seed=>{const st=imugiTest.state();st.runId984='imugi-generation-'+seed;__reseed(seed);__MANRU_RELEASE__.regen(9);st.monsters=[];imugiTest.occupancy.endShared();},seed);await s.tick(1000);
  assert.equal(await ev(()=>{const st=imugiTest.state();return __MANRU_QA_SEALING__.branch(st.branchPortals105.find(p=>p.id==='palace'));}),true,'outer palace generation');await dismissModals(s);
  for(const level of [1,2]){
   if(level===2){await s.tick(1000);assert.equal(await ev(()=>__MANRU_QA_SEALING__.branch(imugiTest.state().branchPortals105.find(p=>p.to==='palace:2'))),true,'inner palace generation');await dismissModals(s);}
   const row=await ev(()=>{const Q=imugiTest,st=Q.state(),d=st.branchTerrain105.palace105,regular=st.monsters.filter(m=>m.palaceLotus105||m.legendDungeon47==='water_crossbow'),imugi=st.monsters.filter(m=>m.name==='이무기'),food=st.items.filter(i=>i.foodKind==='jerky'&&!d.switchMaze105?.rewards.some(r=>r.x===i.x&&r.y===i.y)).reduce((s,i)=>s+(i.count||1),0);return{level:st.branchContext105.level,regular:regular.length,population:d.population105,imugi:imugi.length,imugiStages:imugi.map(m=>d.generation105.spiral105.stageCells[m.x+','+m.y]??0),gardeners:st.monsters.filter(m=>m.palaceActor105==='gardener').length,gardenerCap:d.gardenerLimit105,food,all:st.monsters.length,valid:imugi.every(m=>m.actionSpeed===2&&!m.fast&&m.summonName57==='식인 물고기'&&m.sealingWard?.radius===2&&Q.place.canPlaceEntity(m,m.x,m.y))};});
   assert.equal(row.population.multiplier,level===2?10:5);assert.equal(row.regular,row.population.baseRegular*row.population.multiplier);assert.equal(row.food,level===2?18:9);assert.ok(row.valid);assert.ok(level===2?row.imugi>=3&&row.imugi<=7:row.imugi===0);if(level===2){assert.equal(row.gardenerCap,7,'old gardener limit unchanged');assert.ok(row.gardeners<=7,'existing seven-gardener cap');assert.ok(row.imugiStages.filter(stage=>stage>=12).length>=Math.ceil(row.imugi/2),'imugi favor the inner spiral');}generated.push({seed,...row});
   if(level===1){const snapshot=await ev(()=>{const st=imugiTest.state();return{level:st.branchContext105.level,regular:st.monsters.length,innerUnvisited:!st.branchWorld105.pages['palace:2'],down:st.branchPortals105.some(p=>p.to==='palace:2')};});assert.equal(await ev(()=>__MANRU_RELEASE__.save().ok&&__MANRU_RELEASE__.load()),true,'save/load while still on palace floor 1');assert.deepEqual(await ev(()=>{const st=imugiTest.state();return{level:st.branchContext105.level,regular:st.monsters.length,innerUnvisited:!st.branchWorld105.pages['palace:2'],down:st.branchPortals105.some(p=>p.to==='palace:2')};}),snapshot,'floor-1 save restores without pre-generating floor 2');}
  }
  if(seed===9045){await ev(()=>{const Q=imugiTest,st=Q.state(),m=st.monsters.find(m=>m.name==='이무기'),spots=[];for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))<2)continue;const x=m.x+dx,y=m.y+dy;if(Q.place.canPlaceEntity(st.player,x,y))spots.push({x,y});}if(!spots.length)throw Error('no safe palace sprite review position');Q.occupancy.move(st.player,spots[0].x,spots[0].y);__MANRU_QA_VIS__.compute();Q.update();});await s.tick(1200);await s.page.screenshot({path:path.join(art,'inner-palace-imugi.png')});}
  const before=await ev(()=>imugiTest.state().monsters.filter(m=>m.name==='이무기').map(m=>({hp:m.hp,x:m.x,y:m.y,speed:m.actionSpeed})));
  assert.equal(await ev(()=>__MANRU_RELEASE__.save().ok&&__MANRU_RELEASE__.load()),true);assert.deepEqual(await ev(()=>imugiTest.state().monsters.filter(m=>m.name==='이무기').map(m=>({hp:m.hp,x:m.x,y:m.y,speed:m.actionSpeed}))),before,'saved inner palace must not duplicate or reset imugi');
 }
 console.log('GENERATION='+JSON.stringify(generated));
 });
 await check('actions',async()=>{
 // Compare one rapid hostile decision phase against two ordinary phases with identical RNG and bodies.
 const trial=async(speed,rounds,mode='hostile',near=true,oldAttack=false)=>{await setup();return ev(({speed,rounds,mode,near,oldAttack})=>{
  const Q=imugiTest,st=Q.state(),A=__MANRU_QA_SEALING__,m=A.place('이무기',{x:30,y:30});m.actionSpeed=speed;if(oldAttack)m.atk=19;m.skillSeal105=100;m.summoner=false;m.alerted=true;m.hasSeenPlayer105=true;Q.occupancy.move(st.player,near?32:34,30);
  let target=st.player;if(mode==='ally'){Q.occupancy.move(st.player,40,40);target=A.place('객잔 쥐',{x:near?32:34,y:30});target.hp=target.maxHp=100000;target.def=0;target.eva=0;__MANRU_COMBATANTS57__.setFaction(m,'player');}
  const hp=target.hp;__reseed(42);for(let i=0;i<rounds;i++){st.turn++;st.floorTurn++;if(mode==='ally')Q.allies();else Q.monsters();}
  return{damage:hp-target.hp,x:m.x,y:m.y,schedule:Q.schedule(m),skills:Q.skills(m).map(s=>s.id)};
 },{speed,rounds,mode,near,oldAttack});};
 const attacks={};for(const mode of ['hostile','ally']){const rapid=await trial(2,1,mode),normalTwo=await trial(1,2,mode),normalOne=await trial(1,1,mode),oldThreat=await trial(2,1,mode,true,true);assert.ok(rapid.damage<=oldThreat.damage*.6,mode+' two-action damage must be substantially reduced');console.log('ATTACK_TRIAL='+JSON.stringify({mode,rapid,normalTwo,normalOne,oldThreat}));assert.equal(rapid.damage,normalTwo.damage,mode+' two complete attacks');assert.ok(rapid.damage>normalOne.damage&&normalOne.damage>0,mode+' attack speed boost: '+JSON.stringify({rapid,normalTwo,normalOne}));attacks[mode]={rapid,normalTwo,normalOne,oldThreat};}
 const rapidMove=await trial(2,1,'hostile',false),normalMove=await trial(1,1,'hostile',false);assert.equal(rapidMove.x,32);assert.equal(normalMove.x,31);console.log('ACTION_SPEED='+JSON.stringify({attacks,rapidMove,normalMove}));
 });
 await check('balance and legacy saves',async()=>{
  await setup();const migration=await ev(()=>{
   const Q=imugiTest,st=Q.state(),m=__MANRU_QA_SEALING__.place('이무기',{x:30,y:30}),id=Q.id(m);Object.assign(m,{balanceVersion57:0,hp:45,maxHp:90,atk:19,def:9,eva:8,nextSummonTurn57:102,nextSealingWardTurn:102,sealingWard:{species:'이무기',radius:2,duration:4,cooldown:5,range:8}});delete m.summonWarmup;delete m.summonCooldown;
   const cells=[];for(let y=28;y<=32;y++)for(let x=32;x<=36;x++)cells.push({x,y});st.tempFields.push({kind:'sealingWard',x:34,y:30,ttl:4,cells,sourceFaction:'hostile',targetId:'player',ownerId:id,bornTurn:100});
   if(!Q.load({state:Q.project(),label:'legacy-imugi-balance'}))throw Error('legacy balance restore failed');const loaded=Q.state(),unit=loaded.monsters.find(m=>m.combatantId54===id),read=()=>({hp:unit.hp,maxHp:unit.maxHp,atk:unit.atk,def:unit.def,eva:unit.eva,speed:unit.actionSpeed,warmup:unit.summonWarmup,cooldown:unit.summonCooldown,ward:unit.sealingWard.duration,wardCooldown:unit.sealingWard.cooldown,summonAt:unit.nextSummonTurn57,wardAt:unit.nextSealingWardTurn,field:loaded.tempFields.find(f=>f.ownerId===id)?.ttl});const out=read();Q.configure(unit);if(JSON.stringify(read())!==JSON.stringify(out))throw Error('balance migration must be idempotent');return out;
  });assert.deepEqual(migration,{hp:45,maxHp:90,atk:9,def:5,eva:5,speed:2,warmup:6,cooldown:8,ward:9,wardCooldown:12,summonAt:108,wardAt:102,field:4});console.log('BALANCE_SAVE='+JSON.stringify(migration));
  await setup();const cadence=await ev(()=>{const Q=imugiTest,st=Q.state(),m=__MANRU_QA_SEALING__.place('이무기',{x:30,y:30});st.map[29][29]=Q.TT.WATER;Q.engage(m,true);const first=m.nextSummonTurn57;st.floorTurn=105;const early=!!Q.summon(m);st.floorTurn=106;const ready=!!Q.summon(m);return{first,early,ready,next:m.nextSummonTurn57};});assert.deepEqual(cadence,{first:106,early:false,ready:true,next:114});console.log('SUMMON_CADENCE='+JSON.stringify(cadence));
 });
 await check('ward',async()=>{
 // A fast warning cannot resolve in the second slot of the same player turn.
 await setup();const ward=await ev(()=>{const Q=imugiTest,st=Q.state(),m=__MANRU_QA_SEALING__.place('이무기',{x:30,y:30});m.summoner=false;m.alerted=true;Q.monsters();const warned=m.intent61?.type==='sealingWard',cells=m.intent61?.cells.length,early=st.tempFields.some(f=>f.kind==='sealingWard');st.turn++;st.floorTurn++;Q.monsters();const field=st.tempFields.find(f=>f.kind==='sealingWard'),p=st.player,blocked=Q.fields(p.x+3,p.y,{actor:p}),moved=Q.occupancy.move(p,p.x+3,p.y);return{warned,cells,early,raised:!!field,duration:field?.ttl,blocked,moved};});assert.deepEqual(ward,{warned:true,cells:25,early:false,raised:true,duration:9,blocked:true,moved:false});console.log('WARD='+JSON.stringify(ward));
 });
 await check('summoning',async()=>{
 // Native fish are water-only and cap at three per summoner; the existing book cap still wins.
 for(const bookUpgrade of [null,0,2]){
  await setup();const row=await ev(bookUpgrade=>{
   const Q=imugiTest,st=Q.state(),A=__MANRU_QA_BROOD__,T=Q.TT;let m;
   if(bookUpgrade==null)m=__MANRU_QA_SEALING__.place('이무기',{x:30,y:30});
   else{const book=A.book(),def=A.definitions.find(d=>d.name==='이무기');book.upgrade=bookUpgrade;book.summonElement105='water';book.summonPictures105={'이무기':{count:1,portrait:structuredClone(def)}};st.player.inventory.push(book);A.summoning();if(!A.summon('이무기',book.summonBookId105))throw Error('imugi book cast');m=st.monsters.find(m=>m.name==='이무기');Q.occupancy.move(m,30,30);}
   for(let y=26;y<=34;y++)for(let x=26;x<=34;x++)if(!(x===st.player.x&&y===st.player.y))st.map[y][x]=T.WATER;Q.occupancy.endShared();
   m.summonActivated57=true;m.summoner=true;m.skillSeal105=0;for(let i=0;i<5;i++){m.nextSummonTurn57=st.floorTurn;Q.summon(m);}
   const fish=st.monsters.filter(a=>a.name==='식인 물고기'),inWater=fish.every(a=>st.map[a.y][a.x]===T.WATER),dry=fish[0]&&Q.place.terrainStandable(fish[0],T.FLOOR),speed=m.actionSpeed;return{upgrade:bookUpgrade,count:fish.length,inWater,dry,speed,cap:fish.every(a=>a.bossOwnerId57),immobile:fish.some(a=>a.fixed)};
  },bookUpgrade);assert.equal(row.count,bookUpgrade===0?1:3);assert.equal(row.inWater,true);assert.equal(row.dry,bookUpgrade!==null);assert.equal(row.immobile,false);assert.equal(row.speed,2);assert.equal(row.cap,true);console.log('FISH_SUMMON='+JSON.stringify(row));
 }
 });
 await check('pursuit',async()=>{
 // An unreachable land target still draws aquatic hunters through a connected water detour.
 await setup();const pursuit=await ev(()=>{
  const Q=imugiTest,st=Q.state(),T=Q.TT;st.player.x=36;st.player.y=32;
  const cells=[[30,30],[30,29],[30,28],[31,28],[32,28],[33,28],[34,28],[35,28],[36,28]];for(const[x,y]of cells)st.map[y][x]=T.WATER;
  const fish=__MANRU_QA_SEALING__.place('식인 물고기',{x:30,y:30}),positions=[];for(let i=0;i<12;i++){Q.step(fish,st.player);positions.push([fish.x,fish.y]);}const final=Math.max(Math.abs(fish.x-36),Math.abs(fish.y-32));fish.fixed=true;Q.configure(fish);
  const native={waterOnly:positions.every(([x,y])=>st.map[y][x]===T.WATER),detour:positions.some(([x,y])=>y<30),distance:final,mobile:!fish.fixed};
  const book=__MANRU_QA_BROOD__.book(),A=__MANRU_QA_BROOD__;book.summonElement105='water';book.summonPictures105={'식인 물고기':{count:1,portrait:structuredClone(A.definitions.find(d=>d.name==='식인 물고기'))}};st.player.inventory.push(book);A.summoning();if(!A.summon('식인 물고기',book.summonBookId105))throw Error('fish book cast');const owned=st.monsters.find(m=>m.summonOwner105==='player');return{native,bookDry:Q.place.terrainStandable(owned,T.FLOOR),bookMoves:Q.step(owned,{x:40,y:32})};
 });assert.deepEqual(pursuit.native,{waterOnly:true,detour:true,distance:4,mobile:true});assert.equal(pursuit.bookDry,true);assert.equal(pursuit.bookMoves,true);console.log('PURSUIT='+JSON.stringify(pursuit));
 });
 await check('debug',async()=>{
 // Real debug placement retains the new art/traits and executes two attacks as well.
 await ev(()=>__MANRU_QA_DEBUGBATTLE__.open());await s.tick(800);
 await s.page.evaluate(()=>{const input=document.getElementById('battleSearch57');input.value='이무기';input.dispatchEvent(new Event('input',{bubbles:true}));const sel=document.getElementById('battleMonster57'),option=[...sel.options].find(o=>o.textContent.split(' · ')[0]==='이무기');if(!option)throw Error('imugi missing from debug catalog');sel.value=option.value;sel.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('battleCount57').value='1';});await s.page.click('#battleAddA57');await s.tick(500);
 const debugCombat=await ev(()=>{const Q=imugiTest,st=Q.state(),m=st.monsters.find(m=>m.name==='이무기');for(let y=25;y<=36;y++)for(let x=25;x<=36;x++)st.map[y][x]=Q.TT.FLOOR;Q.occupancy.endShared();Q.occupancy.move(m,30,30);const target=__MANRU_QA_SEALING__.place('객잔 쥐',{x:32,y:30});__MANRU_COMBATANTS57__.setFaction(target,'hostile');target.fixed=true;target.skillSeal105=99;target.eva=0;target.def=0;target.hp=target.maxHp=100000;m.summoner=false;m.skillSeal105=99;
  const run=(speed,rounds)=>{target.hp=100000;m.actionSpeed=speed;Q.debug.round=0;Q.debug.winner=null;st.turn=st.floorTurn=100;__reseed(42);for(let i=0;i<rounds;i++)Q.round();return 100000-target.hp;};const normal=run(1,2),rapid=run(2,1);return{normal,rapid};});assert.ok(debugCombat.normal>0);assert.equal(debugCombat.normal,debugCombat.rapid,'debug battle uses full rapid action slots');console.log('DEBUG_COMBAT='+JSON.stringify(debugCombat));
 const debug=await ev(()=>{const Q=imugiTest,st=Q.state(),m=st.monsters.find(a=>a.name==='이무기'),def=__MANRU_QA_BROOD__.definitions.find(d=>d.name==='이무기');if(!m)throw Error('debug imugi missing');const native=Q.scale(def,11,{inventory:false});Q.cache.clear();const a=Q.art(native,0).toDataURL();Q.cache.clear();const b=Q.art(m,0).toDataURL();return{speed:m.actionSpeed,ward:m.sealingWard.radius,summon:m.summonName57,pixels:a===b,size:[Q.art(m,0).width,Q.art(m,0).height],poses:Q.art(m,0).toDataURL()!==Q.art(m,1).toDataURL(),aquatic:m.aquatic,amphibious:m.amphibious57};});assert.deepEqual(debug,{speed:2,ward:2,summon:'식인 물고기',pixels:true,size:[32,36],poses:true,aquatic:true,amphibious:true});await s.page.screenshot({path:path.join(art,'debug-imugi.png')});
 // Render the actual full sprite, enlarged only for review.
 const sprite=await ev(()=>{const Q=imugiTest,m=Q.state().monsters.find(m=>m.name==='이무기');return Q.art(m,0).toDataURL().split(',')[1];});fs.writeFileSync(path.join(art,'imugi-sprite.png'),Buffer.from(sprite,'base64'));
 });
 assert.deepEqual(s.errors,[]);if(failures.length)throw new Error(failures.join('\n'));console.log('PASS: imugi population/food, full action speed, warnings, fish caps and water pursuit, book compatibility, saves and real debug art');
}finally{await s.close();await ctx.close();await browser.close();}
