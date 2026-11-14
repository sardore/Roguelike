import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun } from './harness.mjs';

const bridge = `globalThis.checkSmoke = () => {
  state.monsters=[];
  for(let y=4;y<=18;y++)for(let x=4;x<=20;x++)setTerrainTile58(state.map,x,y,TT.FLOOR);
  const p=state.player;
  OccupancyService.move(p,8,8);
  const steam=(x,y=8,ttl=2)=>({kind:'steam',x,y,cells:[{x,y}],ttl});
  const smoke=(x,y=8)=>({kind:'smoke',x,y,cells:[{x,y}],ttl:3});
  const ray=(x,y=8)=>combatLineCheckR8(8,8,x,y,{units:false}).ok;
  state.tempFields=[smoke(9),steam(9),steam(10,8,0)];
  VisibilityService.compute();
  const single=[ray(11),state.visible.has(k(11,8))];
  state.tempFields.push(steam(10));
  VisibilityService.compute();
  const mixed=[ray(10),ray(11),state.visible.has(k(10,8)),state.visible.has(k(11,8)),
    combatLineCheckR8(11,8,8,8,{units:false}).ok];
  state.tempFields=[smoke(9,9),steam(10,10)];
  const diagonal=[ray(10,10),ray(11,11)];
  state.tempFields=[smoke(8),steam(9)];
  const inside=ray(11);
  const results=[];
  const target={...scaledMonster(MONSTERS[0]),x:12,y:8,hp:100,maxHp:100};
  OccupancyService.addMonster(target);
  for(const [form,level] of [[null,1],['cloud',2],['burst',5]]){
    p.martial.roar=level;
    p.martialForm={roar:form};
    p.focus=20;
    target.hp=100;
    state.tempFields=[];
    const center=form==='cloud'?p:target;
    const cast=executeMartialActor(p,'roar',center);
    const field=state.tempFields[0];
    const startDamage=100-target.hp;
    let movedSize=null,burstDamage=null;
    if(form==='cloud'){
      const origin={x:p.x,y:p.y};
      OccupancyService.move(p,p.x+1,p.y);
      martialLanding(origin);
      movedSize=field.x===p.x?field.cells.length:0;
    }
    if(form==='burst'){
      field.ttl=1;
      VisibilityService.compute();
      drawMap(true);
      const before=target.hp;
      expireCombatFields();
      burstDamage=before-target.hp;
    }
    results.push({cast,cells:field.cells.length,damage:field.castDamage,startDamage,movedSize,burstDamage});
  }
  state.tempFields=[smoke(p.x+1),steam(p.x+2),
    {...smoke(p.x+1,9),martialSmoke:true,smokeForm:'burst',ttl:1}];
  VisibilityService.compute();
  return {single,mixed,diagonal,inside,results};
};`;
const runtime=assembleGame('src').text.replace(QA_MARKER,fs.readFileSync('src/qa/qa.js','utf8')+'\n'+bridge);
const browser=await launch();
const context=await browser.newContext();
await context.route('**/scripts/10-runtime.js',route=>route.fulfill({contentType:'text/javascript',body:runtime}));
const session=await openSession(browser,new URL('../dist-qa',import.meta.url).pathname,{context,seed:77});
try {
  await startRun(session,'infiltrator');
  const result=await session.page.evaluate(()=>window.checkSmoke());
  assert.deepEqual(result,{
    single:[true,true],mixed:[true,false,true,false,false],diagonal:[true,false],inside:true,
    results:[
      {cast:true,cells:4,damage:4,startDamage:4,movedSize:null,burstDamage:null},
      {cast:true,cells:9,damage:8,startDamage:0,movedSize:9,burstDamage:null},
      {cast:true,cells:36,damage:20,startDamage:20,movedSize:null,burstDamage:20}
    ]
  });
  await session.page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.deepEqual(session.errors,[]);
  console.log('Smoke, steam and infiltrator martial checks passed');
} finally {
  await session.close();
  await context.close();
  await browser.close();
}
