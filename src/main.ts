import './readability.css';
import './style.css';
import { Game, type RunKit } from './game/engine';
import { ITEMS } from './game/content';
import { findPath, visibleThreatIds } from './game/path';
import { inspectAt, isAimedItem } from './game/systems';
import { drawMap, screenToTile } from './ui/renderGame';
import type { ItemKind, Point } from './game/types';

const app=document.querySelector<HTMLDivElement>('#app')!;
const game=new Game();
type Mode='title'|'guide'|'game';
let mode:Mode='title',selectedKit:RunKit='apothecary',inspect='',aimIndex:number|null=null,walkToken=0,introOpen=false,lastDepth='',bagOpen=false,menuOpen=false,inspectMode=false;

const DISTRICTS=[['01','APOTHECARIES’ ROW'],['02','TINCTURE BAZAAR'],['03','CRUCIBLE WARD'],['04','VITREOUS CATACOMBS'],['05','GRAND ALEMBIC']] as const;
const DISTRICT_COPY=[
  'Medicinal shops, drains and narrow still-houses crowd the old street.',
  'Tinctures, dyes and sealed exchanges sit half-drowned beneath the market.',
  'Hot stone, assay rooms and furnaces turn the lower city into a working machine.',
  'Glass masonry and preservation rooms make distance and reflection unreliable.',
  'Every pipe and reagent route converges on the mechanism at the city’s core.'
] as const;
const ROOM_LABELS:Record<string,string>={'apothecaries-row':'APOTHECARIES’ ROW',herbalist:'HERBALIST',distillery:'DISTILLERY','north-alley':'SERVICE ALLEY',glassworks:'GLASSWORKS',courtyard:'PHYSIC COURT','service-passage':'BACK PASSAGE',underworks:'UNDERWORKS','sealed-shop':'SEALED APOTHECARY','tincture-bazaar':'TINCTURE BAZAAR','spice-arcade':'SPICE ARCADE','dye-vats':'DYE VATS','counting-house':'COUNTING HOUSE','black-market':'BLACK MARKET',cistern:'CISTERN','market-passages':'MARKET PASSAGES',wayhouse:'WAYHOUSE','old-exchange':'OLD EXCHANGE','crucible-ward':'CRUCIBLE WARD','furnace-court':'FURNACE COURT','assay-lab':'ASSAY LAB','kiln-hall':'KILN HALL','old-mint':'OLD MINT','ash-gallery':'ASH GALLERY','cooling-vault':'COOLING VAULT','master-lab':'MASTER LAB','final-vault':'FINAL VAULT','vitreous-catacombs':'VITREOUS CATACOMBS','mirror-ossuary':'MIRROR OSSUARY','crystal-vault':'CRYSTAL VAULT','preservation-hall':'PRESERVATION HALL','drain-chapel':'DRAIN CHAPEL','specimen-crypt':'SPECIMEN CRYPT','sealed-archive':'SEALED ARCHIVE','catacomb-passages':'CATACOMB PASSAGES','grand-alembic':'GRAND ALEMBIC','reaction-gallery':'REACTION GALLERY','furnace-nave':'FURNACE NAVE','catalyst-library':'CATALYST LIBRARY','cooling-core':'COOLING CORE','master-vault':'MASTER VAULT','central-lab':'CENTRAL LAB','condenser-hall':'CONDENSER HALL','final-sanctum':'FINAL SANCTUM'};
const STATUS_LABELS:Record<string,string>={marked:'SCENT',bleeding:'BLEED',poisoned:'POISON',sluggish:'SLOW',warded:'WARD'};
const KITS:Record<RunKit,{name:string,tag:string,desc:string,items:string,glyph:string}>={
  apothecary:{name:'APOTHECARY',tag:'CONTROL',desc:'22 HP · healing + neutralization',items:'PHIAL · TONIC · NEUTRALIZER',glyph:'⚗'},
  surveyor:{name:'SURVEYOR',tag:'UTILITY',desc:'20 HP · route control + scouting',items:'CHALK · SMOKE · FROST',glyph:'◇'},
  breaker:{name:'BREAKER',tag:'DIRECT',desc:'26 HP · guard + forced entry',items:'SALT · SOLVENT · KEY',glyph:'◆'}
};
const shortName=(name:string)=>name.replace(' Phial','').replace(' Bomb','').replace(' Tonic','').replace('White ','').replace(' Ampoule','').replace(' Flask','').replace(' Elixir','');
const itemIcon=(kind:ItemKind)=>`<span class="item-icon icon-${kind}" aria-hidden="true"><i></i></span>`;
const depthNumber=()=>((game.state.districtStage-1)*2+(game.state.floorInDistrict??1));
const depthKey=()=>`${game.state.districtStage}-${game.state.floorInDistrict??1}`;
const districtBossAlive=()=>game.state.enemies.some(e=>e.id.startsWith('district-boss-'));
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
function cancelWalk(){walkToken++}

function titleMarkup(){
  const kit=KITS[selectedKit];
  return `<main class="title-screen">
    <div class="title-world" aria-hidden="true"><div class="arch a1"></div><div class="arch a2"></div><div class="arch a3"></div><div class="tower t1"></div><div class="tower t2"></div><div class="copper-line l1"></div><div class="copper-line l2"></div></div>
    <section class="title-panel">
      <div class="title-mark"><span>A</span></div>
      <div class="eyebrow">A TURN-BASED ALCHEMICAL ROGUELIKE</div>
      <h1>ALCHEMY <span>CITY</span></h1>
      <p class="title-copy">Ten hostile depths. Five districts. One persistent inventory.</p>
      <div class="kit-heading"><b>CHOOSE YOUR FIELD KIT</b><span>${kit.tag}</span></div>
      <div class="kit-select">${(Object.keys(KITS) as RunKit[]).map(k=>{const q=KITS[k];return `<button class="kit-card ${selectedKit===k?'selected':''}" data-kit="${k}"><span class="kit-glyph">${q.glyph}</span><strong>${q.name}</strong><small>${q.desc}</small><em>${q.items}</em></button>`}).join('')}</div>
      <button id="begin" class="begin">ENTER THE CITY</button>
      <button id="guide" class="text-button">FIELD MANUAL</button>
    </section>
  </main>`
}

function guideMarkup(){return `<main class="guide-screen"><section class="guide-card"><div class="eyebrow">FIELD MANUAL</div><h1>HOW TO READ THE CITY</h1><div class="guide-grid"><article><b>MOVE / ATTACK</b><p>Tap a visible floor tile to walk there. Tap an adjacent enemy to attack. Auto-walk stops when danger appears.</p></article><article><b>QUICKSLOTS</b><p>The four large slots are your immediate tools. Tap the satchel to reach the rest of your inventory.</p></article><article><b>LOOK</b><p>Tap LOOK, then any visible tile, monster or fixture. LOOK never spends a turn.</p></article><article><b>CHEMISTRY</b><p>Fire spreads through oil. Salt suppresses volatile terrain. Frost, solvent and catalyst can alter the battlefield.</p></article><article><b>DISTRICT MASTERS</b><p>Every second depth has a master that pressure-locks the exit. Kill it before trying to descend.</p></article><article><b>SURVIVAL</b><p>HP and carried reagents persist between depths. There is no free reset between floors.</p></article></div><button id="back-title" class="begin secondary">BACK</button></section></main>`}

function startRun(){mode='game';introOpen=true;lastDepth='';inspect='';aimIndex=null;bagOpen=false;menuOpen=false;inspectMode=false;cancelWalk();game.start(selectedKit,`alchemy-${Date.now()}`)}
function titleHandlers(){app.querySelectorAll<HTMLButtonElement>('[data-kit]').forEach(b=>b.onclick=()=>{selectedKit=b.dataset.kit as RunKit;render()});app.querySelector<HTMLButtonElement>('#begin')!.onclick=startRun;app.querySelector<HTMLButtonElement>('#guide')!.onclick=()=>{mode='guide';render()}}
function guideHandlers(){app.querySelector<HTMLButtonElement>('#back-title')!.onclick=()=>{mode='title';render()}}

async function walkTo(target:Point){
  cancelWalk();const token=walkToken;inspect='';
  if(visibleThreatIds(game.state).size){inspect='Enemy in sight — move manually.';render();return}
  let known=visibleThreatIds(game.state);
  while(token===walkToken&&!game.state.over&&mode==='game'&&!introOpen&&!bagOpen&&!menuOpen){
    const path=findPath(game.state,target);if(path.length<2)break;const next=path[1]!,hp=game.state.player.hp,inv=game.state.player.inventory.length,stage=game.state.districtStage,floor=game.state.floorInDistrict;
    game.move(next.x-game.state.player.x,next.y-game.state.player.y);await sleep(55);
    if(token!==walkToken||game.state.over||game.state.districtStage!==stage||game.state.floorInDistrict!==floor)break;
    if(game.state.player.hp!==hp||game.state.player.inventory.length!==inv)break;
    const threats=visibleThreatIds(game.state);if([...threats].some(id=>!known.has(id)))break;known=threats;
    if(game.state.player.x===target.x&&game.state.player.y===target.y)break;
  }
}

function quickSlots(){const inv=game.state.player.inventory;return Array.from({length:4},(_,i)=>{const k=inv[i];return k?`<button class="quickslot item ${aimIndex===i?'aiming':''}" data-item="${i}" aria-label="${ITEMS[k].name}">${itemIcon(k)}<span>${shortName(ITEMS[k].name)}</span></button>`:`<div class="quickslot empty"><i></i></div>`}).join('')}
function bagMarkup(){const s=game.state;if(!bagOpen)return'';return `<div class="sheet-backdrop" id="bag-close"><section class="bag-sheet" onclick="event.stopPropagation()"><header><div><small>INVENTORY</small><b>FIELD SATCHEL</b></div><span>${s.player.inventory.length} ITEMS</span></header><div class="bag-grid">${s.player.inventory.length?s.player.inventory.map((k,i)=>`<button class="bag-item item ${aimIndex===i?'aiming':''}" data-item="${i}">${itemIcon(k)}<strong>${ITEMS[k].name}</strong><small>${ITEMS[k].desc}</small></button>`).join(''):'<p class="empty-bag">The satchel is empty.</p>'}</div><button id="bag-done" class="sheet-done">CLOSE</button></section></div>`}
function menuMarkup(){if(!menuOpen)return'';return `<div class="sheet-backdrop"><section class="pause-sheet"><div class="eyebrow">PAUSED</div><h2>ALCHEMY CITY</h2><button id="resume" class="begin">CONTINUE</button><button id="manual" class="sheet-row">FIELD MANUAL</button><button id="to-title" class="sheet-row danger-row">RETURN TO TITLE</button></section></div>`}

function gameMarkup(){
  const s=game.state,here=s.tiles[s.player.y*s.width+s.player.x],room=ROOM_LABELS[here?.room??'']??'OLD CITY',threats=visibleThreatIds(s).size,district=DISTRICTS[Math.max(0,Math.min(4,s.districtStage-1))]!,floor=s.floorInDistrict??1,statuses=s.player.statuses.map(st=>`<span class="status ${st.id}">${STATUS_LABELS[st.id]??st.id} ${st.turns}</span>`).join(''),boss=districtBossAlive(),depth=depthNumber();
  const objective=boss?'MASTER LOCK':s.districtStage===5&&floor===2?'FINAL EXIT':'FIND STAIR';
  const latest=s.messages.slice(-2);
  const intro=introOpen?`<div class="depth-intro"><div class="depth-no">DEPTH ${String(depth).padStart(2,'0')} / 10</div><small>${district[1]} · ${floor===1?'UPPER':'LOWER'} LEVEL</small><h2>${district[1]}</h2><p>${DISTRICT_COPY[s.districtStage-1]}</p>${floor===2?'<b>THE DISTRICT MASTER CONTROLS THE EXIT.</b>':''}<button id="enter-depth">ENTER</button></div>`:'';
  const ending=s.over?`<div class="overlay"><div class="card"><em>DEPTH ${depth}</em><h2>${s.won?'The city releases you':'Run ended'}</h2><p>${s.won?'Cold air arrives from somewhere that should be sealed.':'The city keeps what it is given.'}</p><button id="return-title">RETURN TO TITLE</button></div></div>`:'';
  return `<main class="shell">
    <section class="game"><div class="camera"><canvas class="map"></canvas></div>
      <div class="hero-hud"><button class="portrait" id="hero-info" aria-label="hero status"><i class="head"></i><i class="coat"></i></button><div class="hero-bars"><div class="hp-line"><b>${s.player.hp}</b><span>/${s.player.maxHp}</span>${s.player.guard?`<em>+${s.player.guard}</em>`:''}</div><div class="hp-bar"><i style="width:${Math.max(0,s.player.hp/s.player.maxHp*100)}%"></i></div><div class="status-row">${statuses}</div></div></div>
      <div class="location-hud"><small>DEPTH ${String(depth).padStart(2,'0')}</small><b>${room}</b><span class="${boss||threats?'danger':''}">${boss?objective:threats?`${threats} THREAT${threats===1?'':'S'}`:objective}</span></div>
      <div class="utility-rail"><button id="inspect-toggle" class="utility ${inspectMode?'active':''}"><i class="look-icon"></i><span>LOOK</span></button><button id="wait" class="utility"><i class="wait-icon"></i><span>WAIT</span></button><button id="menu" class="utility"><i class="menu-icon"></i><span>MENU</span></button></div>
      <div class="message-toast">${latest.map(m=>`<div class="${m.tone??''}">${m.text}</div>`).join('')}</div>
      ${inspect?`<div class="inspect-card">${inspect}</div>`:''}
      ${aimIndex!==null?`<div class="aim-banner">SELECT A TARGET TILE</div>`:''}
      <div class="quickbar"><div class="quickslots">${quickSlots()}</div><button id="bag" class="bag-button"><i class="bag-icon"></i><span>${s.player.inventory.length}</span></button></div>
      <div class="tap-hint">TAP FLOOR TO MOVE · TAP ADJACENT ENEMY TO ATTACK</div>
      ${intro}${ending}${bagMarkup()}${menuMarkup()}
    </section>
  </main>`
}

function gameHandlers(){
  const s=game.state,canvas=app.querySelector<HTMLCanvasElement>('canvas')!;drawMap(canvas,s);const cam=canvas.parentElement!,fit=Math.min(cam.clientWidth/canvas.width,cam.clientHeight/canvas.height),scale=fit*(cam.clientWidth<700?5.15:3.25);canvas.style.width=`${canvas.width*scale}px`;canvas.style.height=`${canvas.height*scale}px`;canvas.style.transform=`translate(${(s.width/2-s.player.x)*32*scale}px,${(s.height/2-s.player.y)*32*scale-cam.clientHeight*.015}px)`;
  app.querySelector<HTMLButtonElement>('#enter-depth')?.addEventListener('click',()=>{introOpen=false;render()});
  app.querySelector<HTMLButtonElement>('#return-title')?.addEventListener('click',()=>{mode='title';introOpen=false;render()});
  app.querySelector<HTMLButtonElement>('#inspect-toggle')?.addEventListener('click',()=>{if(introOpen)return;inspectMode=!inspectMode;inspect=inspectMode?'LOOK: tap any visible tile.':'';render()});
  app.querySelector<HTMLButtonElement>('#wait')?.addEventListener('click',()=>{if(introOpen||bagOpen||menuOpen)return;cancelWalk();aimIndex=null;inspect='';inspectMode=false;game.wait()});
  app.querySelector<HTMLButtonElement>('#menu')?.addEventListener('click',()=>{if(introOpen)return;menuOpen=true;cancelWalk();render()});
  app.querySelector<HTMLButtonElement>('#resume')?.addEventListener('click',()=>{menuOpen=false;render()});
  app.querySelector<HTMLButtonElement>('#manual')?.addEventListener('click',()=>{menuOpen=false;mode='guide';render()});
  app.querySelector<HTMLButtonElement>('#to-title')?.addEventListener('click',()=>{menuOpen=false;mode='title';introOpen=false;render()});
  app.querySelector<HTMLButtonElement>('#bag')?.addEventListener('click',()=>{if(introOpen)return;bagOpen=true;cancelWalk();render()});
  app.querySelector<HTMLDivElement>('#bag-close')?.addEventListener('click',()=>{bagOpen=false;render()});
  app.querySelector<HTMLButtonElement>('#bag-done')?.addEventListener('click',()=>{bagOpen=false;render()});
  app.querySelectorAll<HTMLButtonElement>('[data-item]').forEach(b=>b.onclick=()=>{if(introOpen||menuOpen)return;cancelWalk();const i=Number(b.dataset.item),kind=s.player.inventory[i];if(!kind)return;bagOpen=false;inspectMode=false;if(isAimedItem(kind)){aimIndex=aimIndex===i?null:i;inspect=aimIndex===null?'':`${ITEMS[kind].name}: tap a visible target tile.`;render()}else{aimIndex=null;inspect='';game.use(i)}});
  canvas.onpointerdown=e=>{if(introOpen||bagOpen||menuOpen)return;const p=screenToTile(canvas,e.clientX,e.clientY);if(p.x<0||p.y<0||p.x>=s.width||p.y>=s.height)return;
    if(inspectMode){cancelWalk();inspect=inspectAt(s,p);render();return}
    if(aimIndex!==null){cancelWalk();const i=aimIndex;aimIndex=null;inspect='';game.use(i,p);return}
    const dx=p.x-s.player.x,dy=p.y-s.player.y,t=s.tiles[p.y*s.width+p.x],enemy=s.enemies.find(e2=>e2.x===p.x&&e2.y===p.y);
    if(Math.abs(dx)+Math.abs(dy)===1){cancelWalk();inspect='';if(t?.fixture&&t.blocks){game.interact(p);return}game.move(Math.sign(dx),Math.sign(dy));return}
    if(enemy){cancelWalk();inspect=`${enemy.id.includes('boss')?'DISTRICT MASTER · ':''}${enemy.kind.replaceAll('-',' ').toUpperCase()} · HP ${enemy.hp}`;render();return}
    const occupied=s.enemies.some(e2=>e2.x===p.x&&e2.y===p.y);if(t?.discovered&&t.kind!=='wall'&&!t.blocks&&!occupied){void walkTo(p);return}
    cancelWalk();inspect=inspectAt(s,p);render()
  }
}

function render(){
  if(mode==='title'){app.innerHTML=titleMarkup();titleHandlers();return}
  if(mode==='guide'){app.innerHTML=guideMarkup();guideHandlers();return}
  const key=depthKey();if(key!==lastDepth){lastDepth=key;introOpen=true}app.innerHTML=gameMarkup();gameHandlers()
}

game.sub(render);
window.addEventListener('keydown',e=>{if(mode!=='game'||introOpen||bagOpen||menuOpen||game.state.over)return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','.',' '].includes(k))cancelWalk();if(k==='arrowup'||k==='w')game.move(0,-1);if(k==='arrowdown'||k==='s')game.move(0,1);if(k==='arrowleft'||k==='a')game.move(-1,0);if(k==='arrowright'||k==='d')game.move(1,0);if(k==='.'||k===' ')game.wait();if(k==='x'){inspectMode=!inspectMode;render()}});
window.addEventListener('resize',()=>{if(mode==='game')render()});
render();
