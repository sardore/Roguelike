// Exercise real book casting, movement owners, save hydration and the palace renderer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {assembleGame,QA_MARKER} from '../tools/lib/game.mjs';
import {launch,openSession,startRun,dismissModals} from './harness.mjs';
const mobile=process.argv.includes('--mobile'),repo=path.resolve('.'),art=path.join(repo,'tests/artifacts/palace-water');fs.mkdirSync(art,{recursive:true});
const bridge=`globalThis.waterTest={state:()=>state,TT,escort:summonEscortTurn,step:moveMonsterToward,swap:occupancySwapAllowed57,body:configureSummonBody105,art:monsterCanvas,actorCache:ACTOR_CACHE,water:drawPalaceWater,atlas:palaceWaterSprite,cache:PALACE_WATER_ART,floor:drawPalaceFloorMaterial,base:terrainBaseTile58,info:terrainInfo986,lotus:PALACE_LOTUS105,paints:()=>RC.perf.frames,active:active70,screen:(x,y)=>{const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),p=globalThis.__MANRU_CAMERA_PROJECTION12__.tileCenter(x,y,cam);return{x:Math.round((p.x-p.s/2+2)*VIEW.dpr),y:Math.round((p.y-p.s/2+2)*VIEW.dpr),size:Math.round((p.s-4)*VIEW.dpr)};},pixels:r=>Array.from(X.getImageData(r.x,r.y,r.size,r.size).data),draw:drawMap,update:updateAll};`;
const runtime=assembleGame(path.join(repo,'src')).text.replace(QA_MARKER,fs.readFileSync(path.join(repo,'src/qa/qa.js'),'utf8')+'\n'+bridge);
const browser=await launch(),ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
await ctx.route('**/scripts/10-runtime.js',r=>r.fulfill({contentType:'text/javascript',body:runtime}));
const s=await openSession(browser,path.join(repo,'dist-qa'),{context:ctx,seed:9045});
try{
 await startRun(s,'wanderer');await dismissModals(s);await s.tick(1200);
 for(const [name,element,fixed] of [['식인 물고기','water',true],['환각의 향로','shock',true],['화염 가고일','shock',true],['대포','shock',true],['독꽃','grass',false],['벌집나무','grass',false],['고목 목매','grass',false],['벌떼','fire',false],['객잔 쥐','fire',false],['어미거미','fire',false]]){
  const result=await s.page.evaluate(({name,element})=>{
   const A=__MANRU_QA_BROOD__,Q=waterTest,st=Q.state(),p=st.player;
   st.floor=16;st.turn=st.floorTurn=20;st.playerAgencyTurns57=20;st.enemyEnergy=0;st.monsters=[];st.items=[];st.status={};st.jarGasFields57=[];st.tempFields=[];st.tempTerrain74=[];st.elementFields74=[];st.branchContext105=null;st.branchTerrain105=null;st.branchWorld105={version:1,pages:{}};st.artifactReturn46=null;st.shopIntermission=null;st.terrainUnderlay58={};st.terrainAttachment58={};st.terrainMutationVersion57={};st.tutorialEntry60={completed:true};
   p.x=30;p.y=30;p.hp=p.maxHp=p.baseMaxHpPermanent=100000;p.inventory=[];delete p.summoning105;
   for(let y=1;y<st.map.length-1;y++)for(let x=1;x<st.map[y].length-1;x++)st.map[y][x]=Q.TT.FLOOR;
   const def=A.definitions.find(d=>d.name===name),book=A.book();book.summonElement105=element;book.summonPictures105={[name]:{count:1,portrait:structuredClone(def)}};p.inventory.push(book);A.summoning();A.occupancy.endShared();__MANRU_QA_VIS__.compute();
   if(!A.summon(name,book.summonBookId105))throw Error('book cast failed: '+name);
   const m=st.monsters.find(m=>m.summonOwner105==='player'),before={x:m.x,y:m.y};
   const originalFixed=!!m.fixed,form=m.summonForm105,traits=['hiveTree105','hpThreshold57','sting','deathBrood','crossfire','gasStatus57','shape','kind'].every(k=>def[k]==null||JSON.stringify(m[k])===JSON.stringify(def[k]));
   A.occupancy.move(p,36,36);st.turn++;delete st.lastSummonEscortTurn105;Q.escort();const escorted=m.x!==before.x||m.y!==before.y;
   const pos={x:m.x,y:m.y},pursued=Q.step(m,{x:40,y:40}),moved=m.x!==pos.x||m.y!==pos.y,swappable=Q.swap(p,m);
   // The same species body must keep its actual rendered pixels and authored traits.
   const native=__MANRU_QA_SEALING__.scale(def,16,{inventory:false});native.x=m.x;native.y=m.y;if(native.treeMimic105)native.mimicDormant105=false;Q.actorCache.clear();const normalPixels=Q.art(native,0).toDataURL();Q.actorCache.clear();const bodyPixels=Q.art(m,0).toDataURL();
   if(def.fixed){m.fixed=def.kind==='plant';m.summonForm105=m.fixed?'fixed':'mobile';}
   if(!__MANRU_RELEASE__.save().ok||!__MANRU_RELEASE__.load())throw Error('save/load failed');
   const loaded=Q.state().monsters.find(a=>a.allyId53===m.allyId53);
   return{name,fixed:originalFixed,form,escorted,pursued,moved,swappable,traits,pixels:normalPixels===bodyPixels,loadedFixed:!!loaded.fixed,loadedForm:loaded.summonForm105};
  },{name,element});
  console.log(JSON.stringify(result));assert.equal(result.fixed,fixed,name);assert.equal(result.loadedFixed,fixed,name+' legacy hydration');assert.equal(result.traits,true,name+' traits');assert.equal(result.pixels,true,name+' actual sprite');
  if(fixed){assert.equal(result.form,'fixed');assert.equal(result.loadedForm,'fixed');assert.equal(result.escorted,false);assert.equal(result.moved,false);assert.equal(result.swappable,false);}else{assert.equal(result.form,'mobile');assert.equal(result.loadedForm,'mobile');assert.equal(result.escorted,true,name+' mobile escort');assert.equal(result.moved,true,name+' mobile pursuit');}
 }
 // A fixed ranged summon retains its combat ability; native mobile children stay mobile.
 const combat=await s.page.evaluate(()=>{
  const Q=waterTest,A=__MANRU_QA_BROOD__,S=__MANRU_QA_SEALING__,st=Q.state();st.monsters=[];A.occupancy.endShared();
  const gun=S.place('대포',{x:30,y:30}),enemy=S.place('객잔 쥐',{x:34,y:30});gun.summonOwner105='player';gun.faction57='player';gun.friendly47=true;Q.body(gun);enemy.hp=enemy.maxHp=1000;const before=S.fx.projectiles.length;st.intentBudget61=Infinity;__MANRU_AI61__.artillery(gun,enemy);
  const lotus=structuredClone(Q.lotus);Q.body(lotus);if(lotus.fixed||!lotus.immobile105)throw Error('plant movement must preserve native immobility trait');
  const child=__MANRU_QA_SEALING__.scale(A.definitions.find(d=>d.name==='벌떼'),16,{inventory:false});Q.body(child);
  return{fired:S.fx.projectiles.length>before,damage:enemy.hp<1000,fixed:gun.fixed,childMobile:!child.fixed};
 });assert.deepEqual(combat,{fired:true,damage:true,fixed:true,childMobile:true});console.log(JSON.stringify(combat));
 await s.page.evaluate(()=>{const st=waterTest.state();st.player.inventory=[];delete st.player.summoning105;st.monsters=[];st.player.hp=st.player.maxHp=100000;__MANRU_RELEASE__.regen(9);st.monsters=[];__MANRU_QA_BROOD__.occupancy.endShared();});await s.tick(1200);
 assert.equal(await s.page.evaluate(()=>{const st=waterTest.state();return __MANRU_QA_SEALING__.branch(st.branchPortals105.find(p=>p.id==='palace'));}),true);await dismissModals(s);await s.tick(1200);
 const focus=await s.page.evaluate(()=>{
  const Q=waterTest,st=Q.state(),d=st.branchTerrain105.palace105;st.monsters=[];__MANRU_QA_BROOD__.occupancy.endShared();
  const water=Object.keys(d.floors).filter(key=>{const[x,y]=key.split(',').map(Number);return Q.base(x,y)===Q.TT.WATER;});
  const ranked=water.map(key=>{const[x,y]=key.split(',').map(Number);let n=0;for(let yy=y-5;yy<=y+5;yy++)for(let xx=x-7;xx<=x+7;xx++)if(Q.base(xx,yy)===Q.TT.WATER)n++;return{x,y,n};}).sort((a,b)=>b.n-a.n);
  const spot=ranked[0];if(!spot)throw Error('no actual palace water');st.player.x=spot.x;st.player.y=spot.y;
  for(let y=0;y<st.map.length;y++)for(let x=0;x<st.map[y].length;x++){st.visible.add(x+','+y);st.seen.add(x+','+y);}Q.update();return spot;
 });console.log('actual palace water focus '+JSON.stringify(focus));await s.tick(1000);
 await s.page.screenshot({path:path.join(art,mobile?'palace-mobile.png':'palace-game.png')});
 // No manual draw or game action: observe the real idle visual loop on the main canvas.
 await s.tick(3000);
 const probe=await s.page.evaluate(()=>{const Q=waterTest,st=Q.state(),p=st.player;const tile=[[2,0],[-2,0],[0,2],[0,-2]].map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).find(c=>Q.base(c.x,c.y)===Q.TT.WATER);if(!tile)throw Error('missing visible water probe');return{rect:Q.screen(tile.x,tile.y),paint:Q.paints(),active:Q.active(),turn:st.turn};});
 assert.equal(probe.active,false,'probe must exercise idle rendering');
 const frames=[],pixels=[];
 for(let i=0;i<8;i++){await s.tick(150);pixels.push(await s.page.evaluate(r=>waterTest.pixels(r),probe.rect));frames.push(await s.page.screenshot({clip:{x:probe.rect.x,y:probe.rect.y,width:probe.rect.size,height:probe.rect.size}}));}
 const idle=await s.page.evaluate(()=>({paints:waterTest.paints(),turn:waterTest.state().turn}));
 const changed=pixels.slice(1).map((p,i)=>{let changed=0;for(let j=0;j<p.length;j+=4)if(Math.abs(p[j]-pixels[i][j])+Math.abs(p[j+1]-pixels[i][j+1])+Math.abs(p[j+2]-pixels[i][j+2])>=12)changed++;return changed/(p.length/4);});
 const unique=new Set(pixels.map(p=>JSON.stringify(p))).size,paints=idle.paints-probe.paint;
 assert.ok(paints>=(mobile?8:11),'idle water paint cadence: '+paints);assert.ok(unique>=7,'idle water must keep moving');assert.ok(changed.reduce((a,b)=>a+b,0)/changed.length>.15,'water motion must cover a visible part of the tile');assert.equal(idle.turn,probe.turn,'water animation cannot spend turns');
 for(let i=0;i<frames.length;i++)fs.writeFileSync(path.join(art,`motion-${mobile?'mobile':'pc'}-${i}.png`),frames[i]);console.log('IDLE_WATER='+JSON.stringify({mobile,paints,unique,changed,turns:idle.turn-probe.turn}));
 const inspected=await s.page.evaluate(()=>{
  const Q=waterTest,st=Q.state(),d=st.branchTerrain105.palace105,T=Q.TT;
  const key=Object.keys(d.floors).find(key=>{const[x,y]=key.split(',').map(Number),t=st.map[y][x];return t>=T.PALACE_LOW&&t<=T.PALACE_HIGH&&!d.props[key]&&!d.arches?.[key]&&!d.handles.some(h=>h.x===x&&h.y===y)&&!d.permanentWater[key];});
  if(!key)throw Error('missing real palace floor');const[x,y]=key.split(',').map(Number),level=st.branchContext105.level,rows=[];st.items=[];st.decor=[];delete d.materials[key];
  const expected=[['남청색 물결 바닥','청록색 조개 바닥','밝은 옥색 비늘 바닥','상아색 금테 석단'],['청보라 물결 바닥','푸른 보라 조개 바닥','진주빛 청보라 비늘 바닥','상아색 금테 석단']];
  for(let lv=1;lv<=2;lv++)for(let h=0;h<4;h++){
   st.branchContext105.level=lv;d.floors[key]=h;st.map[y][x]=T.PALACE_LOW+h;const info=Q.info(st.map[y][x],x,y);__MANRU_INSPECT984__({x,y});
   const title=document.getElementById('inspectTitle').textContent;if(info.name!==expected[lv-1][h]||title!==info.name)throw Error('palace floor inspection: '+JSON.stringify({lv,h,info,title}));rows.push({lv,h,title});
  }
  st.branchContext105.level=level;
  for(const[t,name]of [[T.SHALLOW_WATER,'얕은 물'],[T.WATER,'깊은 물']]){st.map[y][x]=t;const info=Q.info(t,x,y);if(info.name!==name)throw Error('water tile title');rows.push({water:name});}
  d.permanentWater[key]=true;st.map[y][x]=T.WATER;if(Q.info(T.WATER,x,y).name!=='깊은 물')throw Error('permanent water returned region name');delete d.permanentWater[key];
  st.map[y][x]=d.materials[key]=T.WOOD_FLOOR;const wood=Q.info(T.WOOD_FLOOR,x,y);if(!wood.name.includes('마루')&&!wood.name.includes('목재'))throw Error('native material title: '+wood.name);rows.push({wood:wood.name});
  delete d.materials[key];st.map[y][x]=T.PORTAL;if(Q.info(T.PORTAL,x,y).name.includes('높이'))throw Error('floor swallowed portal title');
  return rows;
 });console.log('PALACE_INSPECT='+JSON.stringify(inspected));await dismissModals(s);
 const rendering=await s.page.evaluate(()=>{
  const Q=waterTest,st=Q.state(),d=st.branchTerrain105.palace105,T=Q.TT;
  // Controlled 4x4 patches use the actual terrain renderer, with no seams/shore inside.
  for(let y=8;y<16;y++)for(let x=8;x<20;x++){st.map[y][x]=T.SHALLOW_WATER;st.visible.add(x+','+y);delete st.terrainUnderlay58[x+','+y];delete d.permanentWater[x+','+y];}
  const c=document.createElement('canvas');c.width=640;c.height=288;c.id='water-sample';const q=c.getContext('2d');q.imageSmoothingEnabled=false;q.fillStyle='#101d2c';q.fillRect(0,0,c.width,c.height);
  for(const [offset,deep] of [[32,false],[352,true]]){
   for(let y=0;y<6;y++)for(let x=0;x<8;x++){const wx=x+9,wy=y+9;q.save();q.translate(offset+x*32,32+y*32);Q.floor(q,deep?0:1,wx,wy,d);q.restore();Q.water(q,offset+x*32,32+y*32,wx,wy,deep,720);}
  }
  // Upload a magnified pixel view without introducing smoothing.
  const big=document.createElement('canvas');big.id='water-zoom';big.width=1280;big.height=576;big.getContext('2d').imageSmoothingEnabled=false;big.getContext('2d').drawImage(c,0,0,1280,576);Object.assign(big.style,{position:'fixed',left:'0',top:'0',zIndex:'999999'});document.body.append(big);
  const tile=document.createElement('canvas');tile.width=tile.height=32;const t=tile.getContext('2d'),sample=time=>{t.clearRect(0,0,32,32);Q.water(t,0,0,10,10,false,time);return tile.toDataURL();};
  const a=sample(0),b=sample(720);st.visible.delete('10,10');const hiddenA=sample(0),hiddenB=sample(720);st.visible.add('10,10');
  for(let f=0;f<16;f++)for(const deep of[false,true])Q.atlas(f,deep);
  return{animated:a!==b,hiddenFrozen:hiddenA===hiddenB,cache:Q.cache.size,bytes:[...Q.cache.values()].reduce((s,c)=>s+c.width*c.height*4,0)};
 });assert.deepEqual(rendering,{animated:true,hiddenFrozen:true,cache:32,bytes:2097152});console.log(JSON.stringify(rendering));
 await s.page.locator('#water-zoom').screenshot({path:path.join(art,'water-detail.png')});
 await s.page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await s.page.evaluate(()=>{const Q=waterTest,c=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d'),sample=t=>{q.clearRect(0,0,32,32);Q.water(q,0,0,10,10,false,t);return c.toDataURL();};return sample(0)===sample(720);}),true,'reduced motion freezes water');
 const start=process.hrtime.bigint();await s.page.evaluate(()=>{const Q=waterTest,c=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d');for(let n=0;n<10000;n++)Q.water(q,0,0,10+n%4,10,false,n*120);if(Q.cache.size!==32)throw Error('unbounded water cache');});console.log('warm 10000 tile draws including browser roundtrip: '+Number(process.hrtime.bigint()-start)/1e6+'ms');
 assert.deepEqual(s.errors,[]);console.log('PASS: only plant book bodies move, legacy saves, native art/traits, floor inspection, ranged combat and bounded palace water rendering');
}finally{await s.close();await ctx.close();await browser.close();}
