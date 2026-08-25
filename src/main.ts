import './style.css';
import { BAND_NAMES, FLOOR_NAMES, bandFor, createRun, labelEnemy, labelItem, moveHero, type HeroClass, type ItemKind, type TowerState, useItem, waitTurn } from './tower';

const app=document.querySelector<HTMLDivElement>('#app')!;
let state:TowerState|null=null;
let selected:HeroClass='vanguard';
let canvas:HTMLCanvasElement|null=null;
let autoTimer:number|undefined;

const classInfo:Record<HeroClass,{name:string;tag:string;desc:string;glyph:string}>={
  vanguard:{name:'VANGUARD',tag:'ARMOR · FORCE',desc:'High vitality. Breaks through bad positions.',glyph:'◆'},
  ranger:{name:'RANGER',tag:'MOBILITY · TOOLS',desc:'Lean and quick. Starts with a cinder bomb.',glyph:'➶'},
  arcanist:{name:'ARCANIST',tag:'POWER · WARDS',desc:'Fragile, but every clean hit matters.',glyph:'✦'}
};

function towerMark(){return `<div class="tower-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><b></b></div>`}

function showTitle(){
  stopAuto();state=null;
  app.innerHTML=`<main class="title-screen">
    <div class="title-fog fog-a"></div><div class="title-fog fog-b"></div>
    <section class="title-copy">
      <div class="eyebrow">A TURN-BASED ROGUELIKE</div>
      <h1>TOWER OF<br><span>THE FIRST KING</span></h1>
      <p class="title-line">Twenty floors. Five forgotten ages. One open sky.</p>
    </section>
    ${towerMark()}
    <section class="start-panel">
      <div class="class-strip">
        ${(Object.keys(classInfo) as HeroClass[]).map(k=>{const v=classInfo[k];return `<button class="class-card ${k===selected?'selected':''}" data-class="${k}"><strong>${v.glyph}</strong><span>${v.name}</span><small>${v.tag}</small></button>`}).join('')}
      </div>
      <p id="classDesc" class="class-desc">${classInfo[selected].desc}</p>
      <button id="newRun" class="new-run"><span>ENTER THE TOWER</span><b>↑</b></button>
      <div class="title-foot"><span>tap to move · tap enemies to strike</span><span>v0.1 — new foundation</span></div>
    </section>
  </main>`;
  app.querySelectorAll<HTMLButtonElement>('[data-class]').forEach(btn=>btn.onclick=()=>{selected=btn.dataset.class as HeroClass;showTitle()});
  document.querySelector<HTMLButtonElement>('#newRun')!.onclick=()=>startRun(selected);
}

function startRun(cls:HeroClass){state=createRun(`first-king-${Date.now()}`,cls);showGame()}

function showGame(){
  app.innerHTML=`<main class="game-shell">
    <canvas id="game"></canvas>
    <div class="vignette"></div>
    <header class="hud-top">
      <div class="hero-badge"><div class="portrait" id="portrait"></div><div class="hero-bars"><div class="hp-row"><b id="hpText">0/0</b><span id="guardText"></span></div><div class="hp-track"><i id="hpFill"></i></div></div></div>
      <div class="floor-card"><small id="bandName"></small><strong id="floorName"></strong><span id="floorNo"></span></div>
      <button id="menuBtn" class="round-btn" aria-label="menu">☰</button>
    </header>
    <div id="bossBanner" class="boss-banner"></div>
    <div id="message" class="message"></div>
    <footer class="quickbar">
      <button class="wait-btn" id="waitBtn"><span>◌</span><small>WAIT</small></button>
      <div id="items" class="item-slots"></div>
      <button class="bag-btn" id="bagBtn"><span>▣</span><small>PACK</small></button>
    </footer>
    <div id="overlay" class="overlay hidden"></div>
  </main>`;
  canvas=document.querySelector<HTMLCanvasElement>('#game')!;
  resize();window.onresize=resize;
  canvas.addEventListener('pointerdown',onMapTap);
  document.querySelector<HTMLButtonElement>('#waitBtn')!.onclick=()=>{if(state){stopAuto();waitTurn(state);afterAction()}};
  document.querySelector<HTMLButtonElement>('#bagBtn')!.onclick=showPack;
  document.querySelector<HTMLButtonElement>('#menuBtn')!.onclick=showMenu;
  window.onkeydown=e=>{if(!state)return;const k=e.key.toLowerCase();if(['arrowup','w'].includes(k))moveBy(0,-1);if(['arrowdown','s'].includes(k))moveBy(0,1);if(['arrowleft','a'].includes(k))moveBy(-1,0);if(['arrowright','d'].includes(k))moveBy(1,0);if(k===' '){waitTurn(state);afterAction()}};
  render();updateHud();
}

function resize(){if(!canvas)return;const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.floor(innerWidth*dpr);canvas.height=Math.floor(innerHeight*dpr);canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;render()}
function moveBy(dx:number,dy:number){if(!state)return;stopAuto();moveHero(state,dx,dy);afterAction()}
function afterAction(){render();updateHud();if(!state)return;if(state.dead||state.won)window.setTimeout(showEnd,350)}

function showEnd(){if(!state)return;const o=document.querySelector<HTMLDivElement>('#overlay')!;o.classList.remove('hidden');o.innerHTML=`<section class="end-card"><small>${state.won?'THE CROWN':'THE TOWER REMAINS'}</small><h2>${state.won?'THE SKY IS OPEN':'YOU FELL ON FLOOR '+state.floor}</h2><p>${state.won?'The First King left no throne above the clouds—only a door.':'The stair keeps climbing without you.'}</p><button id="again">BEGIN ANOTHER ASCENT</button><button id="titleReturn" class="ghost">RETURN TO TITLE</button></section>`;document.querySelector<HTMLButtonElement>('#again')!.onclick=()=>startRun(selected);document.querySelector<HTMLButtonElement>('#titleReturn')!.onclick=showTitle}
function showMenu(){const o=document.querySelector<HTMLDivElement>('#overlay')!;o.classList.remove('hidden');o.innerHTML=`<section class="menu-card"><small>PAUSED</small><h2>${state?FLOOR_NAMES[state.floor]:''}</h2><button id="resume">RESUME</button><button id="restart" class="ghost">ABANDON RUN</button></section>`;document.querySelector<HTMLButtonElement>('#resume')!.onclick=()=>o.classList.add('hidden');document.querySelector<HTMLButtonElement>('#restart')!.onclick=showTitle}
function showPack(){if(!state)return;const o=document.querySelector<HTMLDivElement>('#overlay')!;o.classList.remove('hidden');o.innerHTML=`<section class="pack-card"><header><div><small>TRAVEL PACK</small><h2>${state.hero.bag.length} ITEMS</h2></div><button id="closePack">×</button></header><div class="pack-grid">${state.hero.bag.length?state.hero.bag.map((k,i)=>itemCard(k,i)).join(''):'<p class="empty-pack">Nothing but dust and spare cloth.</p>'}</div></section>`;document.querySelector<HTMLButtonElement>('#closePack')!.onclick=()=>o.classList.add('hidden');o.querySelectorAll<HTMLButtonElement>('[data-use]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.use);useItem(state!,i);o.classList.add('hidden');afterAction()})}
function itemCard(k:ItemKind,i:number){const icon=k==='potion'?'♥':k==='bomb'?'✹':k==='ration'?'◒':'◇';const sub=k==='potion'?'+12 HP':k==='bomb'?'10 DMG · R2':k==='ration'?'+6 HP · +1 GUARD':'+5 GUARD';return `<button class="pack-item" data-use="${i}"><b class="item-icon ${k}">${icon}</b><span><strong>${labelItem(k)}</strong><small>${sub}</small></span><i>USE</i></button>`}

function updateHud(){if(!state)return;const hp=document.querySelector<HTMLElement>('#hpText')!,guard=document.querySelector<HTMLElement>('#guardText')!,fill=document.querySelector<HTMLElement>('#hpFill')!;hp.textContent=`${state.hero.hp}/${state.hero.maxHp}`;guard.textContent=state.hero.guard?`◆ ${state.hero.guard}`:'';fill.style.width=`${Math.max(0,state.hero.hp/state.hero.maxHp*100)}%`;document.querySelector<HTMLElement>('#bandName')!.textContent=BAND_NAMES[bandFor(state.floor)]!;document.querySelector<HTMLElement>('#floorName')!.textContent=FLOOR_NAMES[state.floor]!;document.querySelector<HTMLElement>('#floorNo')!.textContent=`FLOOR ${String(state.floor).padStart(2,'0')} / 20`;document.querySelector<HTMLElement>('#portrait')!.dataset.cls=state.hero.cls;const latest=state.messages[state.messages.length-1]??'';document.querySelector<HTMLElement>('#message')!.textContent=latest;const boss=state.enemies.find(e=>e.kind==='boss');const banner=document.querySelector<HTMLElement>('#bossBanner')!;if(boss){banner.innerHTML=`<span>FLOOR GUARDIAN</span><div><i style="width:${Math.max(0,boss.hp/boss.maxHp*100)}%"></i></div><b>${boss.hp}</b>`;banner.classList.add('show')}else banner.classList.remove('show');const items=document.querySelector<HTMLDivElement>('#items')!;items.innerHTML='';for(let i=0;i<4;i++){const k=state.hero.bag[i];const b=document.createElement('button');b.className='slot'+(k?' filled':'');b.innerHTML=k?`<b class="slot-icon ${k}">${k==='potion'?'♥':k==='bomb'?'✹':k==='ration'?'◒':'◇'}</b><small>${labelItem(k).split(' ')[0]}</small>`:`<b>·</b><small>EMPTY</small>`;if(k)b.onclick=()=>{useItem(state!,i);afterAction()};items.appendChild(b)}}

function onMapTap(ev:PointerEvent){if(!state||!canvas)return;const p=screenToWorld(ev.clientX,ev.clientY);if(!p)return;const enemy=state.enemies.find(e=>e.x===p.x&&e.y===p.y);if(enemy&&Math.abs(enemy.x-state.hero.x)+Math.abs(enemy.y-state.hero.y)===1){moveHero(state,enemy.x-state.hero.x,enemy.y-state.hero.y);afterAction();return}autoWalk(p.x,p.y)}
function screenToWorld(sx:number,sy:number){if(!state||!canvas)return null;const dpr=canvas.width/innerWidth,view=calcView(canvas,state),x=(sx*dpr-view.ox)/view.ts+state.hero.x,y=(sy*dpr-view.oy)/view.ts+state.hero.y;return{x:Math.floor(x),y:Math.floor(y)}}
function calcView(c:HTMLCanvasElement,s:TowerState){const ts=Math.max(36,Math.min(58,Math.floor(Math.min(c.width/12,c.height/18))));return{ts,ox:c.width/2-ts*.5,oy:c.height*.51-ts*.5}}

function pathStep(tx:number,ty:number){if(!state)return null;const s=state;if(tx<0||ty<0||tx>=s.w||ty>=s.h)return null;const goal=ty*s.w+tx,start=s.hero.y*s.w+s.hero.x,prev=new Int32Array(s.w*s.h);prev.fill(-2);prev[start]=-1;const q=[start];for(let h=0;h<q.length;h++){const cur=q[h]!;if(cur===goal)break;const x=cur%s.w,y=Math.floor(cur/s.w);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h)continue;const ni=ny*s.w+nx;if(prev[ni]!==-2)continue;const t=s.tiles[ni];if(!t||t.kind==='wall'||t.kind==='void')continue;if(s.enemies.some(e=>e.x===nx&&e.y===ny)&&ni!==goal)continue;prev[ni]=cur;q.push(ni)}}if(prev[goal]===-2)return null;let cur=goal;while(prev[cur]!==start&&prev[cur]>=0)cur=prev[cur]!;if(prev[cur]===-2)return null;return{x:cur%s.w,y:Math.floor(cur/s.w)}}
function threatNear(){if(!state)return false;return state.enemies.some(e=>Math.abs(e.x-state!.hero.x)+Math.abs(e.y-state!.hero.y)<=3)}
function autoWalk(tx:number,ty:number){if(!state)return;stopAuto();const startFloor=state.floor;const tick=()=>{if(!state||state.dead||state.won||state.floor!==startFloor){stopAuto();return}const step=pathStep(tx,ty);if(!step){stopAuto();return}moveHero(state,step.x-state.hero.x,step.y-state.hero.y);afterAction();if((state.hero.x===tx&&state.hero.y===ty)||threatNear()){stopAuto();return}autoTimer=window.setTimeout(tick,95)};tick()}
function stopAuto(){if(autoTimer!==undefined){clearTimeout(autoTimer);autoTimer=undefined}}

function render(){if(!state||!canvas)return;const c=canvas.getContext('2d')!;const dpr=canvas.width/innerWidth;c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);const view=calcView(canvas,state),band=bandFor(state.floor);drawBackdrop(c,canvas.width,canvas.height,band);for(let y=0;y<state.h;y++)for(let x=0;x<state.w;x++){const t=state.tiles[y*state.w+x];if(!t?.seen)continue;const sx=view.ox+(x-state.hero.x)*view.ts,sy=view.oy+(y-state.hero.y)*view.ts;if(sx<-view.ts||sy<-view.ts||sx>canvas.width||sy>canvas.height)continue;drawTile(c,sx,sy,view.ts,t.kind,t.variant,band,t.visible)}for(const d of state.drops){const t=state.tiles[d.y*state.w+d.x];if(t?.visible)drawDrop(c,view.ox+(d.x-state.hero.x)*view.ts,view.oy+(d.y-state.hero.y)*view.ts,view.ts,d.kind)}for(const e of state.enemies){const t=state.tiles[e.y*state.w+e.x];if(t?.visible)drawEnemy(c,view.ox+(e.x-state.hero.x)*view.ts,view.oy+(e.y-state.hero.y)*view.ts,view.ts,e.kind,e.elite??false,e.hp/e.maxHp)}drawHero(c,view.ox,view.oy,view.ts,state.hero.cls);drawFogEdge(c,canvas.width,canvas.height);void dpr}
function drawBackdrop(c:CanvasRenderingContext2D,w:number,h:number,band:number){const bg=['','#080a0b','#0a0908','#07100d','#08090f','#09080d'][band]!;c.fillStyle=bg;c.fillRect(0,0,w,h);const g=c.createRadialGradient(w*.5,h*.52,0,w*.5,h*.52,Math.max(w,h)*.62);g.addColorStop(0,'rgba(150,145,120,.055)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h)}

function palette(band:number){if(band===1)return{floor:'#47433b',floor2:'#585145',wall:'#252623',wall2:'#373832',edge:'#817664',accent:'#b89b6b'};if(band===2)return{floor:'#393934',floor2:'#4b4a42',wall:'#20211f',wall2:'#30312e',edge:'#7c7467',accent:'#b09363'};if(band===3)return{floor:'#303b32',floor2:'#3d4d3e',wall:'#1c2823',wall2:'#2b3930',edge:'#6f8a74',accent:'#d1b36d'};if(band===4)return{floor:'#303039',floor2:'#3e3d49',wall:'#1e1e27',wall2:'#2e2c39',edge:'#74728d',accent:'#b8996b'};return{floor:'#302d35',floor2:'#403a45',wall:'#1b1920',wall2:'#2b2731',edge:'#7d6e88',accent:'#d0a55e'}}
function drawTile(c:CanvasRenderingContext2D,x:number,y:number,s:number,kind:string,v:number,band:number,visible:boolean){const p=palette(band),dim=visible?1:.30;c.save();c.globalAlpha=dim;if(kind==='void'){c.restore();return}if(kind==='wall'){c.fillStyle='#0b0c0b';c.fillRect(x,y,s,s);c.fillStyle=p.wall;c.fillRect(x+1,y+2,s-2,s-2);c.fillStyle=p.wall2;c.fillRect(x+2,y+3,s-4,s*.22);c.fillStyle=p.edge;c.globalAlpha=dim*.45;c.fillRect(x+2,y+2,s-4,Math.max(2,s*.05));c.globalAlpha=dim*.36;c.strokeStyle=p.edge;c.lineWidth=Math.max(1,s*.025);const rows=3;for(let r=1;r<rows;r++){const yy=y+r*s/rows;c.beginPath();c.moveTo(x+2,yy);c.lineTo(x+s-2,yy);c.stroke()}for(let r=0;r<rows;r++){const yy=y+r*s/rows,off=((r+v)%2)*s*.22;for(let xx=x+off;xx<x+s;xx+=s*.46){c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,Math.min(y+s,yy+s/rows));c.stroke()}}c.globalAlpha=dim*.7;c.fillStyle='#050605';c.fillRect(x,y+s*.82,s,s*.18);c.restore();return}
  c.fillStyle=p.floor;c.fillRect(x,y,s,s);c.fillStyle=p.floor2;c.globalAlpha=dim*.28;c.fillRect(x+1,y+1,s-2,s-2);c.globalAlpha=dim*.18;c.strokeStyle=p.edge;c.lineWidth=1;c.strokeRect(x+1.5,y+1.5,s-3,s-3);
  if(kind==='door'){c.globalAlpha=dim;c.fillStyle='#3a2b1d';c.fillRect(x+s*.18,y+s*.08,s*.64,s*.84);c.fillStyle='#6d4a2d';c.fillRect(x+s*.23,y+s*.13,s*.54,s*.73);c.fillStyle=p.accent;c.fillRect(x+s*.68,y+s*.47,s*.08,s*.08)}
  if(kind==='stairs'){c.globalAlpha=dim;c.fillStyle='#171817';for(let i=0;i<5;i++)c.fillRect(x+s*(.18+i*.065),y+s*(.68-i*.11),s*(.64-i*.13),s*.08);c.fillStyle=p.accent;c.globalAlpha=dim*.65;c.fillRect(x+s*.24,y+s*.18,s*.52,s*.05)}
  if(kind==='water'){c.globalAlpha=dim*.85;c.fillStyle='#203e48';c.fillRect(x+1,y+1,s-2,s-2);c.strokeStyle='#5b8790';c.lineWidth=Math.max(1,s*.035);for(let i=0;i<2;i++){c.beginPath();c.moveTo(x+s*.12,y+s*(.36+i*.28));c.quadraticCurveTo(x+s*.35,y+s*(.28+i*.28),x+s*.58,y+s*(.36+i*.28));c.quadraticCurveTo(x+s*.75,y+s*(.43+i*.28),x+s*.9,y+s*(.36+i*.28));c.stroke()}}
  if(kind==='grass'){c.globalAlpha=dim;c.fillStyle='#344a36';c.fillRect(x+1,y+1,s-2,s-2);c.strokeStyle='#73945f';c.lineWidth=Math.max(1,s*.025);for(let i=0;i<4;i++){const xx=x+s*(.2+i*.18);c.beginPath();c.moveTo(xx,y+s*.78);c.lineTo(xx+s*.08*((i%2)?1:-1),y+s*.46);c.stroke()}}
  if(kind==='books'){c.globalAlpha=dim*.8;for(let i=0;i<3;i++){c.fillStyle=['#694438','#4c5a58','#765d36'][(i+v)%3]!;c.fillRect(x+s*(.14+i*.23),y+s*.16,s*.17,s*.68)}}
  if(kind==='gear'){c.globalAlpha=dim*.75;c.strokeStyle='#8b795f';c.lineWidth=s*.08;c.beginPath();c.arc(x+s*.5,y+s*.5,s*.25,0,Math.PI*2);c.stroke();c.fillStyle='#25252b';c.beginPath();c.arc(x+s*.5,y+s*.5,s*.08,0,Math.PI*2);c.fill()}
  if(kind==='lava'){c.globalAlpha=dim;c.fillStyle='#5c281c';c.fillRect(x+1,y+1,s-2,s-2);c.strokeStyle='#df7441';c.lineWidth=s*.05;c.beginPath();c.moveTo(x+s*.05,y+s*.7);c.bezierCurveTo(x+s*.3,y+s*.35,x+s*.55,y+s*.85,x+s*.95,y+s*.4);c.stroke()}
  c.restore()}

function drawHero(c:CanvasRenderingContext2D,x:number,y:number,s:number,cls:HeroClass){c.save();const cx=x+s*.5,cy=y+s*.52;c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.ellipse(cx, y+s*.82,s*.27,s*.09,0,0,Math.PI*2);c.fill();c.fillStyle='#111514';c.fillRect(x+s*.29,y+s*.26,s*.42,s*.48);c.fillStyle=cls==='vanguard'?'#b8c0b6':cls==='ranger'?'#7ea788':'#9b8eb8';c.fillRect(x+s*.34,y+s*.3,s*.32,s*.4);c.fillStyle='#d3b993';c.fillRect(x+s*.39,y+s*.17,s*.22,s*.18);c.fillStyle=cls==='vanguard'?'#d3b66f':cls==='ranger'?'#a6c97c':'#c8a6e0';c.fillRect(x+s*.29,y+s*.47,s*.42,s*.09);c.fillStyle='#101313';c.fillRect(x+s*.31,y+s*.7,s*.14,s*.15);c.fillRect(x+s*.55,y+s*.7,s*.14,s*.15);c.fillStyle='#eef0de';c.fillRect(x+s*.62,y+s*.28,s*.05,s*.16);c.restore()}
function enemyColor(k:string){if(k==='rat')return'#9d7757';if(k==='guard')return'#8e8e89';if(k==='archer')return'#9c865e';if(k==='hound')return'#7b746a';if(k==='slime')return'#6a9b6f';if(k==='cultist')return'#806a8e';if(k==='golem')return'#9a8266';if(k==='wisp')return'#91b7c8';if(k==='knight')return'#656978';if(k==='seer')return'#aa86a0';return'#c05f50'}
function drawEnemy(c:CanvasRenderingContext2D,x:number,y:number,s:number,k:string,elite:boolean,hp:number){c.save();c.fillStyle='rgba(0,0,0,.6)';c.beginPath();c.ellipse(x+s*.5,y+s*.82,s*.27,s*.09,0,0,Math.PI*2);c.fill();c.strokeStyle='#111';c.lineWidth=s*.08;c.fillStyle=enemyColor(k);if(k==='rat'||k==='hound'){c.beginPath();c.ellipse(x+s*.52,y+s*.56,s*.28,s*.2,0,0,Math.PI*2);c.fill();c.stroke();c.fillRect(x+s*.69,y+s*.45,s*.15,s*.12)}else if(k==='wisp'){c.beginPath();c.arc(x+s*.5,y+s*.48,s*.22,0,Math.PI*2);c.fill();c.stroke();c.globalAlpha=.5;c.beginPath();c.arc(x+s*.5,y+s*.48,s*.34,0,Math.PI*2);c.stroke()}else{c.fillRect(x+s*.3,y+s*.28,s*.4,s*.5);c.strokeRect(x+s*.3,y+s*.28,s*.4,s*.5);c.fillRect(x+s*.38,y+s*.14,s*.24,s*.2)}if(elite){c.fillStyle='#d6ad5f';c.beginPath();c.moveTo(x+s*.35,y+s*.12);c.lineTo(x+s*.43,y+s*.03);c.lineTo(x+s*.5,y+s*.12);c.lineTo(x+s*.58,y+s*.03);c.lineTo(x+s*.66,y+s*.12);c.closePath();c.fill()}if(hp<1){c.fillStyle='#251511';c.fillRect(x+s*.2,y+s*.9,s*.6,s*.05);c.fillStyle='#bb5d4f';c.fillRect(x+s*.2,y+s*.9,s*.6*Math.max(0,hp),s*.05)}c.restore()}
function drawDrop(c:CanvasRenderingContext2D,x:number,y:number,s:number,k:ItemKind){c.save();const col=k==='potion'?'#d45a58':k==='bomb'?'#cf8b44':k==='ration'?'#b49a68':'#b7c9d2';c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(x+s*.5,y+s*.72,s*.18,s*.06,0,0,Math.PI*2);c.fill();c.fillStyle=col;if(k==='potion'){c.fillRect(x+s*.4,y+s*.32,s*.2,s*.3);c.fillRect(x+s*.44,y+s*.25,s*.12,s*.09)}else if(k==='bomb'){c.beginPath();c.arc(x+s*.5,y+s*.5,s*.16,0,Math.PI*2);c.fill();c.strokeStyle='#e8c18b';c.lineWidth=2;c.beginPath();c.moveTo(x+s*.57,y+s*.35);c.quadraticCurveTo(x+s*.7,y+s*.25,x+s*.68,y+s*.17);c.stroke()}else if(k==='ration'){c.beginPath();c.ellipse(x+s*.5,y+s*.52,s*.22,s*.14,-.3,0,Math.PI*2);c.fill()}else{c.strokeStyle=col;c.lineWidth=s*.08;c.strokeRect(x+s*.38,y+s*.36,s*.24,s*.28)}c.restore()}
function drawFogEdge(c:CanvasRenderingContext2D,w:number,h:number){const g=c.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.28,w*.5,h*.5,Math.max(w,h)*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.72,'rgba(0,0,0,.06)');g.addColorStop(1,'rgba(0,0,0,.8)');c.fillStyle=g;c.fillRect(0,0,w,h)}

showTitle();
