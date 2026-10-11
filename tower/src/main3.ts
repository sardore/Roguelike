import './game3.css';
import { BAND_NAMES,FLOOR_NAMES,SKILL_NAMES,bandFor,createRun,moveHero,systemTurn,type HeroClass,type ItemKind,type TowerState,type Unit,useItem,useSkill,waitTurn } from './tower';
import { getItemDisplayName,getRogueStatus,isItemIdentified,populateNethackFloor,visibleSystemObjects } from './nethack';
import { calcView,renderScene } from './renderScene';
import { reshapeTowerFloor } from './towerMap';

const app=document.querySelector<HTMLDivElement>('#app')!;
let state:TowerState|null=null;
let selected:HeroClass='vanguard';
let canvas:HTMLCanvasElement|null=null;
let titleCanvas:HTMLCanvasElement|null=null;
let autoTimer:number|undefined;
let targeting=false;
let lastFloor=1;

const CLASS_INFO:Record<HeroClass,{name:string;tag:string;desc:string}>={
  vanguard:{name:'VANGUARD',tag:'GUARD / FORCE',desc:'Own doorways, survive bad trades, and physically reshape close fights.'},
  ranger:{name:'RANGER',tag:'SEARCH / RANGE',desc:'Reads hidden architecture faster and turns long sight-lines into damage.'},
  arcanist:{name:'ARCANIST',tag:'BURST / CHAINS',desc:'Low margin for error, but clustered enemies become fuel for chained attacks.'}
};

function title(){
  stopAuto();state=null;targeting=false;
  app.innerHTML=`<main class="title-screen">
    <canvas id="titleCanvas"></canvas>
    <div class="title-vignette"></div>
    <section class="logo"><small>THE DEAD KING BUILT UPWARD</small><h1>TOWER</h1><h2>OF THE FIRST KING</h2><p>Every floor remembers a different purpose.</p></section>
    <section class="start-card">
      <div class="classes">${(Object.keys(CLASS_INFO) as HeroClass[]).map(k=>`<button data-class="${k}" class="class ${selected===k?'selected':''}"><i class="crest ${k}"></i><strong>${CLASS_INFO[k].name}</strong><small>${CLASS_INFO[k].tag}</small></button>`).join('')}</div>
      <p id="classDesc">${CLASS_INFO[selected].desc}</p>
      <button id="start" class="enter">ENTER THE TOWER</button>
      <footer><span>20 FLOORS</span><span>TURN-BASED</span><span>PERMADEATH</span></footer>
    </section>
  </main>`;
  titleCanvas=document.querySelector<HTMLCanvasElement>('#titleCanvas')!;drawTitle();window.onresize=drawTitle;
  app.querySelectorAll<HTMLButtonElement>('[data-class]').forEach(b=>b.onclick=()=>{selected=b.dataset.class as HeroClass;title()});
  document.querySelector<HTMLButtonElement>('#start')!.onclick=()=>start(selected);
}
function start(cls:HeroClass){
  state=createRun(`first-king-${Date.now()}`,cls);lastFloor=state.floor;reshapeTowerFloor(state);populateNethackFloor(state);refreshVisibility(state);game();
}

function game(){
  app.innerHTML=`<main class="game-screen">
    <canvas id="game"></canvas>
    <header class="topbar">
      <section class="hero-hud"><div class="portrait ${state!.hero.cls}"></div><div class="bars"><div><b id="hp"></b><span id="guard"></span></div><div class="hp-track"><i id="hpFill"></i></div><small><span id="food"></span><span id="gold"></span></small></div></section>
      <section class="floor-hud"><small id="band"></small><b id="floor"></b><span id="floorNo"></span></section>
      <button id="menu" class="round">☰</button>
    </header>
    <div id="boss" class="boss"></div>
    <div id="message" class="message"></div>
    <div id="targetHint" class="target-hint hidden">TAP A VISIBLE ENEMY</div>
    <footer class="dock">
      <button id="skill" class="skill"><i></i><b id="skillName"></b><small id="skillCd"></small></button>
      <div id="items" class="quick"></div>
      <button id="system" class="sys"><span>⌕</span><small id="sysLabel">SEARCH</small></button>
      <button id="wait" class="wait"><span>·</span><small>WAIT</small></button>
      <button id="pack" class="pack"><span>▣</span><small>BAG</small></button>
    </footer>
    <div id="overlay" class="overlay hidden"></div>
  </main>`;
  canvas=document.querySelector<HTMLCanvasElement>('#game')!;resize();window.onresize=resize;canvas.onpointerdown=mapTap;
  document.querySelector<HTMLButtonElement>('#skill')!.onclick=toggleTarget;
  document.querySelector<HTMLButtonElement>('#system')!.onclick=()=>{if(!state)return;cancelTarget();stopAuto();systemTurn(state);afterAction()};
  document.querySelector<HTMLButtonElement>('#wait')!.onclick=()=>{if(!state)return;cancelTarget();stopAuto();waitTurn(state);afterAction()};
  document.querySelector<HTMLButtonElement>('#pack')!.onclick=showPack;
  document.querySelector<HTMLButtonElement>('#menu')!.onclick=showMenu;
  window.onkeydown=e=>{if(!state)return;const k=e.key.toLowerCase();if(['arrowup','w'].includes(k))moveBy(0,-1);else if(['arrowdown','s'].includes(k))moveBy(0,1);else if(['arrowleft','a'].includes(k))moveBy(-1,0);else if(['arrowright','d'].includes(k))moveBy(1,0);else if(k==='e'||k===' '){systemTurn(state);afterAction()}else if(k==='.'||k==='5'){waitTurn(state);afterAction()}else if(k==='q')toggleTarget()};
  updateHud();render();
}
function resize(){if(!canvas)return;const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.floor(innerWidth*dpr);canvas.height=Math.floor(innerHeight*dpr);canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;render()}
function moveBy(dx:number,dy:number){if(!state)return;cancelTarget();stopAuto();moveHero(state,dx,dy);afterAction()}
function afterAction(){
  if(!state)return;
  if(state.floor!==lastFloor){lastFloor=state.floor;reshapeTowerFloor(state);populateNethackFloor(state);refreshVisibility(state);state.messages.push(`Floor ${state.floor}: ${FLOOR_NAMES[state.floor]??'Unknown floor'}.`)}
  updateHud();render();if(state.dead||state.won)setTimeout(endScreen,240);
}
function render(){if(state&&canvas)renderScene(canvas,state,targeting)}

function toggleTarget(){if(!state||state.hero.skillCooldown>0)return;targeting=!targeting;stopAuto();document.querySelector('#targetHint')?.classList.toggle('hidden',!targeting);document.querySelector('#skill')?.classList.toggle('armed',targeting);render()}
function cancelTarget(){targeting=false;document.querySelector('#targetHint')?.classList.add('hidden');document.querySelector('#skill')?.classList.remove('armed')}

function updateHud(){
  if(!state)return;const rs=getRogueStatus(state);const hp=document.querySelector<HTMLElement>('#hp')!,fill=document.querySelector<HTMLElement>('#hpFill')!;hp.textContent=`${state.hero.hp}/${state.hero.maxHp}`;fill.style.width=`${Math.max(0,state.hero.hp/state.hero.maxHp*100)}%`;document.querySelector<HTMLElement>('#guard')!.textContent=state.hero.guard?`GUARD ${state.hero.guard}`:'';
  const food=document.querySelector<HTMLElement>('#food')!;food.textContent=rs.foodState;food.dataset.state=rs.foodState;document.querySelector<HTMLElement>('#gold')!.textContent=`${rs.gold}g`;
  document.querySelector<HTMLElement>('#band')!.textContent=BAND_NAMES[bandFor(state.floor)]??'';document.querySelector<HTMLElement>('#floor')!.textContent=FLOOR_NAMES[state.floor]??'UNKNOWN';document.querySelector<HTMLElement>('#floorNo')!.textContent=`${state.floor} / 20`;document.querySelector<HTMLElement>('#message')!.textContent=state.messages[state.messages.length-1]??'';
  const boss=state.enemies.find(e=>e.kind==='boss'),be=document.querySelector<HTMLElement>('#boss')!;if(boss){be.innerHTML=`<span>${bossName(boss)}</span><div><i style="width:${Math.max(0,boss.hp/boss.maxHp*100)}%"></i></div>`;be.classList.add('show')}else be.classList.remove('show');
  const skill=document.querySelector<HTMLButtonElement>('#skill')!;document.querySelector<HTMLElement>('#skillName')!.textContent=SKILL_NAMES[state.hero.cls];document.querySelector<HTMLElement>('#skillCd')!.textContent=state.hero.skillCooldown?`${state.hero.skillCooldown}T`:'READY';skill.classList.toggle('ready',state.hero.skillCooldown===0);
  const objs=visibleSystemObjects(state),act=objs.corpses.some(c=>c.x===state!.hero.x&&c.y===state!.hero.y)||objs.features.some(f=>f.x===state!.hero.x&&f.y===state!.hero.y&&f.kind!=='door')||objs.features.some(f=>f.kind==='door'&&f.locked&&!f.open&&Math.abs(f.x-state!.hero.x)+Math.abs(f.y-state!.hero.y)===1);document.querySelector<HTMLElement>('#sysLabel')!.textContent=act?'ACT':'SEARCH';document.querySelector('#system')?.classList.toggle('context',act);
  const quick=document.querySelector<HTMLElement>('#items')!;quick.innerHTML='';for(let i=0;i<4;i++){const k=state.hero.bag[i],b=document.createElement('button');b.className='qslot';b.innerHTML=k?`<i class="item ${k}"></i><small>${shortItem(k)}</small>`:`<i class="empty"></i>`;if(k)b.onclick=()=>{if(!state)return;cancelTarget();stopAuto();useItem(state,i);afterAction()};quick.appendChild(b)}
}
function shortItem(k:ItemKind){const n=getItemDisplayName(state!,k);return n.split(' ')[0]!.slice(0,7)}
function bossName(e:Unit){const b=e.bossBand??bandFor(state?.floor??1);return b===1?'WARDEN OF THE GATE':b===2?'THE IRON CAPTAIN':b===3?'THE VERDANT THRONE':b===4?'THE CURATOR':'ECHO OF THE FIRST KING'}

function showPack(){if(!state)return;cancelTarget();const o=document.querySelector<HTMLElement>('#overlay')!;o.classList.remove('hidden');o.innerHTML=`<section class="sheet"><header><div><small>TRAVEL PACK</small><h2>${state.hero.bag.length} items</h2></div><button id="close">×</button></header><div class="inventory">${state.hero.bag.length?state.hero.bag.map((k,i)=>`<button data-use="${i}" class="inv"><i class="item ${k}"></i><span><b>${getItemDisplayName(state!,k)}</b><small>${itemSub(k)}</small></span><em>USE</em></button>`).join(''):'<p>Nothing but lint and bad decisions.</p>'}</div></section>`;document.querySelector<HTMLButtonElement>('#close')!.onclick=()=>o.classList.add('hidden');o.querySelectorAll<HTMLButtonElement>('[data-use]').forEach(b=>b.onclick=()=>{if(!state)return;useItem(state,Number(b.dataset.use));o.classList.add('hidden');afterAction()})}
function itemSub(k:ItemKind){if(!state||!isItemIdentified(state,k))return'unknown effect';return k==='potion'?'+13 HP':k==='bomb'?'blast nearby':k==='ration'?'food + recovery':k==='ward'?'+5 guard':k==='smoke'?'disrupt nearby enemies':'7 ranged damage'}
function showMenu(){cancelTarget();const o=document.querySelector<HTMLElement>('#overlay')!;o.classList.remove('hidden');o.innerHTML=`<section class="sheet menu-sheet"><small>PAUSED</small><h2>${state?FLOOR_NAMES[state.floor]:''}</h2><p>SEARCH exposes hidden architecture and traps. ACT uses whatever is under your feet.</p><button id="resume" class="primary">RESUME</button><button id="quit" class="secondary">ABANDON RUN</button></section>`;document.querySelector<HTMLButtonElement>('#resume')!.onclick=()=>o.classList.add('hidden');document.querySelector<HTMLButtonElement>('#quit')!.onclick=title}
function endScreen(){if(!state)return;const o=document.querySelector<HTMLElement>('#overlay')!;o.classList.remove('hidden');o.innerHTML=`<section class="sheet menu-sheet"><small>${state.won?'THE CROWN OPENS':'ASCENT ENDED'}</small><h2>${state.won?'DAYLIGHT':'Floor '+state.floor}</h2><p>${state.won?'The tower finally runs out of ceiling.':'The tower keeps the rest.'}</p><button id="again" class="primary">ASCEND AGAIN</button><button id="back" class="secondary">TITLE</button></section>`;document.querySelector<HTMLButtonElement>('#again')!.onclick=()=>start(selected);document.querySelector<HTMLButtonElement>('#back')!.onclick=title}

function mapTap(ev:PointerEvent){if(!state||!canvas)return;const p=screenToWorld(ev.clientX,ev.clientY);if(!p)return;const enemy=state.enemies.find(e=>e.x===p.x&&e.y===p.y);if(targeting){if(enemy&&useSkill(state,p.x,p.y)){cancelTarget();afterAction()}return}if(enemy&&Math.abs(enemy.x-state.hero.x)+Math.abs(enemy.y-state.hero.y)===1){stopAuto();moveHero(state,enemy.x-state.hero.x,enemy.y-state.hero.y);afterAction();return}autoWalk(p.x,p.y)}
function screenToWorld(sx:number,sy:number){if(!state||!canvas)return null;const dpr=canvas.width/innerWidth,v=calcView(canvas);return{x:Math.floor((sx*dpr-v.ox)/v.ts+state.hero.x),y:Math.floor((sy*dpr-v.oy)/v.ts+state.hero.y)}}
function pathStep(tx:number,ty:number){if(!state)return null;const s=state;if(tx<0||ty<0||tx>=s.w||ty>=s.h)return null;const obs=visibleSystemObjects(s).features,blocked=(x:number,y:number)=>obs.some(f=>f.x===x&&f.y===y&&(f.kind==='boulder'||(f.kind==='door'&&f.locked&&!f.open)));const start=s.hero.y*s.w+s.hero.x,goal=ty*s.w+tx,prev=new Int32Array(s.w*s.h);prev.fill(-2);prev[start]=-1;const q=[start];for(let h=0;h<q.length;h++){const cur=q[h]!;if(cur===goal)break;const x=cur%s.w,y=Math.floor(cur/s.w);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h)continue;const ni=ny*s.w+nx;if(prev[ni]!==-2||blocked(nx,ny))continue;const t=s.tiles[ni];if(!t||['wall','void','chasm','books','pillar'].includes(t.kind))continue;if(s.enemies.some(e=>e.x===nx&&e.y===ny)&&ni!==goal)continue;prev[ni]=cur;q.push(ni)}}if(prev[goal]===-2)return null;let cur=goal;while(prev[cur]!==start&&prev[cur]>=0)cur=prev[cur]!;return{x:cur%s.w,y:Math.floor(cur/s.w)}}
function threatNear(){return!!state&&state.enemies.some(e=>Math.abs(e.x-state!.hero.x)+Math.abs(e.y-state!.hero.y)<=3)}
function autoWalk(tx:number,ty:number){if(!state)return;stopAuto();const floor=state.floor;const tick=()=>{if(!state||state.dead||state.won||state.floor!==floor){stopAuto();return}const p=pathStep(tx,ty);if(!p){stopAuto();return}const bx=state.hero.x,by=state.hero.y;moveHero(state,p.x-state.hero.x,p.y-state.hero.y);afterAction();if((state.hero.x===tx&&state.hero.y===ty)||threatNear()){stopAuto();return}if(state.hero.x===bx&&state.hero.y===by&&!state.messages[state.messages.length-1]?.includes('open the door')){stopAuto();return}autoTimer=window.setTimeout(tick,72)};tick()}
function stopAuto(){if(autoTimer!==undefined){clearTimeout(autoTimer);autoTimer=undefined}}

function refreshVisibility(s:TowerState){for(const t of s.tiles)t.visible=false;const opaque=(x:number,y:number)=>{const t=s.tiles[y*s.w+x];return !t||['wall','books','pillar'].includes(t.kind)};const los=(x0:number,y0:number,x1:number,y1:number)=>{let x=x0,y=y0,dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;while(!(x===x1&&y===y1)){const e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}if(x===x1&&y===y1)return true;if(opaque(x,y))return false}return true};const r=9;for(let y=Math.max(0,s.hero.y-r);y<=Math.min(s.h-1,s.hero.y+r);y++)for(let x=Math.max(0,s.hero.x-r);x<=Math.min(s.w-1,s.hero.x+r);x++){const dx=x-s.hero.x,dy=y-s.hero.y;if(dx*dx+dy*dy>r*r)continue;const t=s.tiles[y*s.w+x];if(t&&los(s.hero.x,s.hero.y,x,y)){t.visible=true;t.seen=true}}}

function drawTitle(){if(!titleCanvas)return;const dpr=Math.min(2,devicePixelRatio||1),w=Math.floor(innerWidth*dpr),h=Math.floor(innerHeight*dpr);titleCanvas.width=w;titleCanvas.height=h;const c=titleCanvas.getContext('2d')!;const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#1d2128');sky.addColorStop(.38,'#0f1318');sky.addColorStop(1,'#050607');c.fillStyle=sky;c.fillRect(0,0,w,h);const moon=c.createRadialGradient(w*.72,h*.18,0,w*.72,h*.18,w*.23);moon.addColorStop(0,'rgba(228,220,192,.25)');moon.addColorStop(.25,'rgba(177,170,147,.08)');moon.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=moon;c.fillRect(0,0,w,h);for(let i=0;i<56;i++){const x=((i*83)%101)/101*w,y=((i*47)%43)/100*h*.65;c.fillStyle=`rgba(225,224,210,${.04+(i%4)*.025})`;c.fillRect(x,y,Math.max(1,dpr),Math.max(1,dpr))}
  const cx=w*.5,base=h*.78;for(let level=0;level<7;level++){const width=w*(.64-level*.072),height=h*(.095+level*.004),y=base-level*h*.082,x=cx-width/2;c.fillStyle=level%2?'#14171a':'#101316';c.fillRect(x,y-height,width,height+2);c.fillStyle='rgba(163,147,111,.13)';c.fillRect(x+width*.07,y-height+6*dpr,width*.86,2*dpr);const batt=7-level;for(let k=0;k<batt;k++){const bx=x+width*(.10+k*(.8/Math.max(1,batt-1)));c.fillStyle=k%3===1?'rgba(213,170,91,.22)':'rgba(142,148,143,.09)';c.fillRect(bx,y-height*.62,3*dpr,8*dpr)}if(level===2||level===4){c.fillStyle='#0a0d0d';c.fillRect(x-width*.05,y-height*.5,width*.05,height*.38);c.fillRect(x+width,y-height*.5,width*.05,height*.38)}}c.fillStyle='#0b0d10';c.beginPath();c.moveTo(cx-w*.055,base-7*h*.082-h*.11);c.lineTo(cx-w*.025,base-7*h*.082-h*.11);c.lineTo(cx,base-7*h*.082-h*.155);c.lineTo(cx+w*.025,base-7*h*.082-h*.11);c.lineTo(cx+w*.055,base-7*h*.082-h*.11);c.lineTo(cx+w*.045,base-7*h*.082);c.lineTo(cx-w*.045,base-7*h*.082);c.closePath();c.fill();const mist=c.createLinearGradient(0,h*.56,0,h);mist.addColorStop(0,'rgba(170,180,178,0)');mist.addColorStop(.45,'rgba(150,160,158,.06)');mist.addColorStop(1,'rgba(2,3,4,.86)');c.fillStyle=mist;c.fillRect(0,h*.5,w,h*.5)}

title();
