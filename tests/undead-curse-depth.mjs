// Run after npm run build:qa. 망자계 저주는 16층 이상에서만 걸린다. 소문 공간에서 시대가 어긋나게 나온 망자도 현재 층 기준을 따른다.
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import { fileURLToPath } from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const { assembleGame, QA_MARKER } = await import(repo+'/tools/lib/game.mjs');
const { launch, openSession, startRun, dismissModals } = await import(repo+'/tests/harness.mjs');
const bridge=`globalThis.gh={state:()=>state,MONSTERS,TT,scaled:scaledMonster,hit:(m,ctx)=>monsterAttacksTarget(m,0,ctx),add:m=>OccupancyService.addMonster(m)};`;
const runtime=assembleGame(path.join(repo,'src')).text.replace(QA_MARKER,fs.readFileSync(path.join(repo,'src/qa/qa.js'),'utf8')+'\n'+bridge);
const browser=await launch();const ctx=await browser.newContext({viewport:{width:1280,height:800}});await ctx.route('**/scripts/10-runtime.js',r=>r.fulfill({contentType:'text/javascript',body:runtime}));
const s=await openSession(browser,path.join(repo,'dist-qa'),{context:ctx,seed:5});await startRun(s,'swordsman');await dismissModals(s);await s.tick(500);
const out=await s.page.evaluate(()=>{const T=gh,st=T.state(),p=st.player,r={};globalThis.__MANRU_RANDOM57__=()=>.5;st.tutorialEntry60={completed:true};st.monsters=[];st.items=[];st.playerAgencyTurns57=10;
for(let x=p.x-2;x<=p.x+9;x++)for(let dy=-3;dy<=3;dy++)st.map[p.y+dy][x]=T.TT.FLOOR;
const undead=T.MONSTERS.filter(d=>d.kind==='undead'&&!d.boss&&!d.miniBoss).map(d=>d.name);
for(const fl of [8,15,16,20]){let curses=0;for(const name of undead.slice(0,6)){st.floor=fl;const def=T.MONSTERS.find(m=>m.name===name);
 p.baseMaxHpPermanent=9999;p.hp=p.maxHp=9999;p.weapon={name:'w',type:'weapon',atk:1,identified:false};p.armor=null;p.inventory=[{name:'a',type:'armor',def:1,identified:false}];p.itemCurseChance991=1;
 const m=T.scaled(JSON.parse(JSON.stringify(def)),fl);m.rumorEraOverride1030=true;m.spawnProvenance57='rumor-space';Object.assign(m,{x:p.x+1,y:p.y,hp:9999,maxHp:9999,alerted:true});st.monsters=[];T.add(m);
 const hr=T.hit(m,{target:p,delivery:"melee"});(r.dbg=r.dbg||[]).push([fl,name,JSON.stringify(hr).slice(0,80),p.weapon.curse991,p.inventory[0]?.curse991,p.itemCurseChance991]);if([p.weapon,...p.inventory].some(i=>i?.curse991))curses++}
 r[fl]={curses,tested:Math.min(6,undead.length)}}
r.undead=undead;delete r.dbg;return r});
console.log(JSON.stringify(out));for(const fl of [8,15])assert.equal(out[fl].curses,0,fl+'층 망자가 저주를 건다');for(const fl of [16,20])assert.equal(out[fl].curses,out[fl].tested,fl+'층 망자가 저주를 못 건다');await browser.close();console.log('undead-curse-depth: ok');process.exit(0);
