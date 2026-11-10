import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {assembleGame,QA_MARKER} from '../tools/lib/game.mjs';
import {launch,openSession,startRun,dismissModals} from './harness.mjs';

const root=path.resolve('.');
const bridge=`globalThis.palaceOddity={state:()=>state,TT,material:oddityMaterialOf,objects:oddityObjects,piece:oddityPieceSprite,detach:oddityDetach,art:drawPalaceProp,water:palaceWaterTile,project:()=>GameState.project(state),load:loadGame,update:updateAll,visibility:()=>VisibilityService.compute(),fields:()=>ODDITY_FX};`;
const runtime=assembleGame(path.join(root,'src')).text.replace(QA_MARKER,fs.readFileSync(path.join(root,'src/qa/qa.js'),'utf8')+'\n'+bridge);
const browser=await launch(),context=await browser.newContext({viewport:{width:1280,height:800}});
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const s=await openSession(browser,path.join(root,'dist-qa'),{context,seed:9045});
const ev=(fn,arg)=>s.page.evaluate(fn,arg);
try{
 await startRun(s,'summoner');
 await ev(()=>__MANRU_RELEASE__.regen(9));await s.tick(1000);await dismissModals(s);
 assert.equal(await ev(()=>{const st=palaceOddity.state();return __MANRU_QA_SEALING__.branch(st.branchPortals105.find(p=>p.id==='palace'));}),true);
 await dismissModals(s);await s.tick(1000);
 for(const floor of [1,2]){
  if(floor===2){assert.equal(await ev(()=>__MANRU_QA_SEALING__.branch(palaceOddity.state().branchPortals105.find(p=>p.to==='palace:2'))),true);await dismissModals(s);await s.tick(1000);}
  const actual=await ev(()=>{const Q=palaceOddity,st=Q.state(),d=st.branchTerrain105.palace105;return Object.entries(d.props).filter(([key,p])=>{const[x,y]=key.split(',').map(Number);return st.map[y][x]===p.tile;}).map(([key,p])=>{const[x,y]=key.split(',').map(Number);return{style:p.style,material:Q.material(p.tile,4,x,y)?.id??null};});});
  assert.ok(actual.length>30);for(const p of actual)assert.ok(p.style==='handle'?p.material===null:p.material!==null,JSON.stringify(p));
  assert.equal(await ev(()=>__MANRU_RELEASE__.save().ok&&__MANRU_RELEASE__.load()),true);
  console.log('GENERATED_FURNITURE='+JSON.stringify({floor,count:actual.length,styles:[...new Set(actual.map(p=>p.style))]}));
 }
 const snapshot=await ev(()=>palaceOddity.project());
 for(const form of [null,'psychic','anomaly']){
  await ev(snapshot=>palaceOddity.load({state:snapshot}),snapshot);await dismissModals(s);await s.tick(1000);
  const setup=await ev(form=>{
   const Q=palaceOddity,A=__MANRU_QA_ODDITY__,result=A.setup({lv:4,form,tiles:['TABLE','BENCH','RACK']}),st=Q.state(),d=st.branchTerrain105.palace105,p=st.player;
   d.props={};d.lights=[];st.status={};st.tempFields=[];st.elementFields74=[];st.jarGasFields57=[];st.tempTerrain74=[];
   for(let y=p.y-8;y<=p.y+8;y++)for(let x=p.x-9;x<=p.x+9;x++){st.map[y][x]=Q.TT.PALACE_HIGH;d.floors[x+','+y]=3;delete d.materials[x+','+y];delete d.permanentWater[x+','+y];delete st.terrainUnderlay58?.[x+','+y];}
   for(const c of result.pieces){const key=c.x+','+c.y;d.props[key]={name:'용궁 연회상',style:'banquet',tile:Q.TT.PALACE_HIGH};}
   const mon=st.monsters[0];mon.fixed=true;mon.skillSeal105=100;mon.atk=0;Q.visibility();
   const chosen=Q.objects(p,4,form,mon),piece=chosen[0],sprite=Q.piece(piece.tile,piece.x,piece.y,piece.prop),expected=document.createElement('canvas');expected.width=expected.height=96;const q=expected.getContext('2d');q.scale(3,3);Q.art(q,piece.prop);
   if(sprite.toDataURL()!==expected.toDataURL())throw Error('flight must retain the actual palace furniture art');
   const before=mon.hp,turn=st.turn,cast=A.cast();return{...cast,before,turn,pieces:result.pieces,piece:{x:piece.x,y:piece.y},selected:chosen.length};
  },form);
  assert.equal(setup.ok,true);assert.equal(setup.dealtAtCast,0);assert.equal(setup.turnAtCast,0);
  await s.tick(2300);
  const result=await ev(({pieces,before,turn})=>{const Q=palaceOddity,st=Q.state(),m=st.monsters[0],d=st.branchTerrain105.palace105;return{damage:before-m.hp,turns:st.turn-turn,remaining:pieces.filter(c=>d.props[c.x+','+c.y]).length,tiles:pieces.map(c=>st.map[c.y][c.x]),pos:{x:m.x,y:m.y}};},setup);
  assert.ok(result.damage>0);assert.ok(result.turns>=1);assert.equal(result.remaining,form==='anomaly'?0:2);const high=await ev(()=>palaceOddity.TT.PALACE_HIGH);assert.ok(result.tiles.every(t=>t===high));
  if(form==='psychic')assert.deepEqual(result.pos,setup.piece);
  console.log('PALACE_CAST='+JSON.stringify({form,result}));
 }
 await ev(snapshot=>palaceOddity.load({state:snapshot}),snapshot);await dismissModals(s);await s.tick(1000);
 const removal=await ev(()=>{
  const Q=palaceOddity,st=Q.state(),d=st.branchTerrain105.palace105,checks=[];
  for(const style of ['banquet','basin','stone-lamp','planter','handle']){
   const pair=Object.entries(d.props).find(([key,p])=>p.style===style&&st.map[+key.split(',')[1]][+key.split(',')[0]]===p.tile);if(!pair)throw Error('missing native '+style);
   const[key,p]=pair,[x,y]=key.split(',').map(Number),mat=Q.material(p.tile,4,x,y);
   if(style==='handle'){checks.push({style,locked:!mat});continue;}
   const need={banquet:1,basin:2,'stone-lamp':3,planter:4}[style];if(Q.material(p.tile,need-1,x,y))throw Error('material unlocked early '+style);
   const expected=Q.water(x,y);if(!Q.detach(x,y))throw Error('cannot detach '+style);checks.push({style,material:mat.id,restored:st.map[y][x]===expected,removed:!d.props[key]});
  }
  // A flooded surface prop restores water instead of a guessed neighboring floor.
  const key=Object.keys(d.floors).find(key=>{const[x,y]=key.split(',').map(Number);return !d.props[key]&&st.map[y][x]===Q.TT.PALACE_HIGH;});const[x,y]=key.split(',').map(Number);d.props[key]={style:'banquet',tile:st.map[y][x]};d.permanentWater[key]=true;Q.detach(x,y);checks.push({style:'flooded',water:st.map[y][x]===Q.TT.WATER});
  return checks;
 });
 assert.ok(removal.every(r=>r.locked||r.water||r.restored&&r.removed));console.log('PALACE_REMOVAL='+JSON.stringify(removal));assert.deepEqual(s.errors,[]);
 console.log('PASS: native and saved palace furniture, material ranks, actual flight art, all oddity forms, tide substrate and controls');
}finally{await s.close();await context.close();await browser.close();}
