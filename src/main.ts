import './style.css';
import './readability.css';
import { Game, type RunKit } from './game/engine';
import { ITEMS } from './game/content';
import { findPath, visibleThreatIds } from './game/path';
import { inspectAt, isAimedItem } from './game/systems';
import { drawMap, screenToTile } from './ui/renderPolish';
import type { ItemKind, Point } from './game/types';

const app=document.querySelector<HTMLDivElement>('#app')!;
const game=new Game();
type Mode='title'|'guide'|'game';
let mode:Mode='title',selectedKit:RunKit='apothecary',inspect='',aimIndex:number|null=null,walkToken=0,introOpen=false,lastDepth='';

const DISTRICTS=[['01','APOTHECARIES’ ROW'],['02','TINCTURE BAZAAR'],['03','CRUCIBLE WARD'],['04','VITREOUS CATACOMBS'],['05','GRAND ALEMBIC']] as const;
const DISTRICT_COPY=[
  'A ruined medicinal street where shopfronts, drains and small stills share the same narrow stone.',
  'A drowned market of tinctures, dyes and sealed exchanges. Useful stock remains, but so do its keepers.',
  'Industrial lower works: hot stone, furnaces, assay rooms and machinery that still remembers a shift schedule.',
  'Older glass masonry beneath the city. Reflections, crystal growth and preservation rooms break ordinary navigation.',
  'The city’s working core. Every pipe, furnace and reagent route converges on the final mechanism.'
] as const;
const ROOM_LABELS:Record<string,string>={'apothecaries-row':'APOTHECARIES’ ROW',herbalist:'HERBALIST',distillery:'DISTILLERY','north-alley':'SERVICE ALLEY',glassworks:'GLASSWORKS',courtyard:'PHYSIC COURT','service-passage':'BACK PASSAGE',underworks:'UNDERWORKS','sealed-shop':'SEALED APOTHECARY','tincture-bazaar':'TINCTURE BAZAAR','spice-arcade':'SPICE ARCADE','dye-vats':'DYE VATS','counting-house':'COUNTING HOUSE','black-market':'BLACK MARKET',cistern:'CISTERN','market-passages':'MARKET PASSAGES',wayhouse:'WAYHOUSE','old-exchange':'OLD EXCHANGE','crucible-ward':'CRUCIBLE WARD','furnace-court':'FURNACE COURT','assay-lab':'ASSAY LAB','kiln-hall':'KILN HALL','old-mint':'OLD MINT','ash-gallery':'ASH GALLERY','cooling-vault':'COOLING VAULT','master-lab':'MASTER LAB','final-vault':'FINAL VAULT','vitreous-catacombs':'VITREOUS CATACOMBS','mirror-ossuary':'MIRROR OSSUARY','crystal-vault':'CRYSTAL VAULT','preservation-hall':'PRESERVATION HALL','drain-chapel':'DRAIN CHAPEL','specimen-crypt':'SPECIMEN CRYPT','sealed-archive':'SEALED ARCHIVE','catacomb-passages':'CATACOMB PASSAGES','grand-alembic':'GRAND ALEMBIC','reaction-gallery':'REACTION GALLERY','furnace-nave':'FURNACE NAVE','catalyst-library':'CATALYST LIBRARY','cooling-core':'COOLING CORE','master-vault':'MASTER VAULT','central-lab':'CENTRAL LAB','condenser-hall':'CONDENSER HALL','final-sanctum':'FINAL SANCTUM'};
const STATUS_LABELS:Record<string,string>={marked:'SCENTED',bleeding:'BLEEDING',poisoned:'POISONED',sluggish:'SLUGGISH',warded:'WARDED'};
const FLOOR_LABELS=['STREET LEVEL','MARKET FLOOR','LOWER WORKS','GLASS LEVEL','CORE LEVEL'] as const;
const KITS:Record<RunKit,{name:string,tag:string,desc:string,items:string}>={
  apothecary:{name:'FIELD APOTHECARY',tag:'CONTROL',desc:'22 HP. Starts with a red phial, tonic and neutralizer. Best at turning bad terrain into an advantage.',items:'PHIAL · TONIC · NEUTRALIZER'},
  surveyor:{name:'CITY SURVEYOR',tag:'UTILITY',desc:'20 HP + 1 guard. Chalk, smoke and frost salts reward scouting, route control and prepared retreats.',items:'CHALK · SMOKE · FROST SALTS'},
  breaker:{name:'LOCK BREAKER',tag:'DIRECT',desc:'26 HP + 2 guard. Salt bomb, solvent and a key. Strongest opening body, weakest emergency healing.',items:'SALT · SOLVENT · KEY'}
};
const shortName=(name:string)=>name.replace(' Phial','').replace(' Bomb','').replace(' Tonic','').replace('White ','').replace(' Ampoule','').replace(' Flask','').replace(' Elixir','');
const itemIcon=(kind:ItemKind)=>`<span class="item-icon icon-${kind}" aria-hidden="true"><i></i></span>`;
const depthNumber=()=>((game.state.districtStage-1)*2+(game.state.floorInDistrict??1));
const depthKey=()=>`${game.state.districtStage}-${game.state.floorInDistrict??1}`;
const districtBossAlive=()=>game.state.enemies.some(e=>e.id.startsWith('district-boss-'));
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
function cancelWalk(){walkToken++}

function titleMarkup(){const kit=KITS[selectedKit];return `<main class="title-screen"><div class="title-fog"></div><div class="city-silhouette"><i></i><i></i><i></i><i></i><i></i></div><section class="title-panel"><div class="title-seal">A</div><div class="eyebrow">A TRADITIONAL ALCHEMICAL ROGUELIKE</div><h1>ALCHEMY<br><span>CITY</span></h1><p class="title-copy">Descend through ten hostile depths. Read the city, preserve scarce tools, and survive rooms whose chemistry matters as much as their monsters.</p><div class="title-stats"><span>10 DEPTHS</span><span>5 DISTRICTS</span><span>SEEDED RUNS</span></div><div class="kit-select"><div class="kit-heading"><b>CHOOSE A FIELD KIT</b><span>${kit.tag}</span></div>${(Object.keys(KITS) as RunKit[]).map(k=>{const q=KITS[k];return `<button class="kit-card ${selectedKit===k?'selected':''}" data-kit="${k}"><strong>${q.name}</strong><small>${q.desc}</small><em>${q.items}</em></button>`}).join('')}</div><button id="begin" class="begin">DESCEND</button><div class="title-links"><button id="guide">FIELD MANUAL</button><span>•</span><small>RUNS ARE NOT SAVED YET</small></div></section></main>`}

function guideMarkup(){return `<main class="guide-screen"><section class="guide-card"><div class="eyebrow">FIELD MANUAL</div><h1>READ THE ROOM,<br>NOT JUST THE ENEMY.</h1><div class="guide-grid"><article><b>TURN ECONOMY</b><p>Movement, waiting, attacks, item use and most interactions spend turns. Telegraphs are promises: move, block the route, or change the target tile before they resolve.</p></article><article><b>CHEMISTRY</b><p>Fire spreads through oil. Salt neutralizes volatile terrain. Frost salts extinguish heat and transform liquids. Solvent removes glass and sludge. The floor is part of your inventory.</p></article><article><b>NOISE & SCENT</b><p>Some machines and reactions make noise. Marked scent lets enemies track farther than sight. Breaking line of sight is not always enough.</p></article><article><b>DISTRICT MASTERS</b><p>Every second floor contains a stronger master. The brass stair remains pressure-locked until it dies. Each district therefore ends in a deliberate confrontation, not a free exit sprint.</p></article><article><b>EXPLORATION</b><p>Special rooms are seeded from a deck of hazards, utility stations, caches and elite encounters. Unexplored space stays black; information is earned by moving through the city.</p></article><article><b>SURVIVAL</b><p>There is no full heal between floors. HP and carried reagents persist across all ten depths, so spending a strong consumable now changes the rest of the run.</p></article></div><button id="back-title" class="begin secondary">BACK TO TITLE</button></section></main>`}

function startRun(){mode='game';introOpen=true;lastDepth='';inspect='';aimIndex=null;cancelWalk();game.start(selectedKit,`alchemy-${Date.now()}`)}
function titleHandlers(){app.querySelectorAll<HTMLButtonElement>('[data-kit]').forEach(b=>b.onclick=()=>{selectedKit=b.dataset.kit as RunKit;render()});app.querySelector<HTMLButtonElement>('#begin')!.onclick=startRun;app.querySelector<HTMLButtonElement>('#guide')!.onclick=()=>{mode='guide';render()}}
function guideHandlers(){app.querySelector<HTMLButtonElement>('#back-title')!.onclick=()=>{mode='title';render()}}

async function walkTo(target:Point){cancelWalk();const token=walkToken;inspect='';if(visibleThreatIds(game.state).size){inspect='Threat in sight — manual movement only.';render();return}let known=visibleThreatIds(game.state);while(token===walkToken&&!game.state.over&&mode==='game'&&!introOpen){const path=findPath(game.state,target);if(path.length<2)break;const next=path[1]!,hp=game.state.player.hp,inv=game.state.player.inventory.length,stage=game.state.districtStage,floor=game.state.floorInDistrict;game.move(next.x-game.state.player.x,next.y-game.state.player.y);await sleep(60);if(token!==walkToken||game.state.over||game.state.districtStage!==stage||game.state.floorInDistrict!==floor)break;if(game.state.player.hp!==hp||game.state.player.inventory.length!==inv)break;const threats=visibleThreatIds(game.state);if([...threats].some(id=>!known.has(id)))break;known=threats;if(game.state.player.x===target.x&&game.state.player.y===target.y)break}}

function gameMarkup(){
  const s=game.state,here=s.tiles[s.player.y*s.width+s.player.x],room=ROOM_LABELS[here?.room??'']??'OLD CITY',threats=visibleThreatIds(s).size,district=DISTRICTS[Math.max(0,Math.min(4,s.districtStage-1))]!,floor=s.floorInDistrict??1,statuses=s.player.statuses.map(st=>`<span class="status ${st.id}">${STATUS_LABELS[st.id]??st.id} ${st.turns}</span>`).join(''),boss=districtBossAlive();
  const objective=boss?'DISTRICT MASTER ACTIVE':s.districtStage===5&&floor===2?'ESCAPE THE FINAL SANCTUM':'FIND THE BRASS STAIR',districtFloor=FLOOR_LABELS[Math.max(0,Math.min(4,s.districtStage-1))]!,sceneTitle=room===district[1]?districtFloor:room,depth=depthNumber();
  const intro=introOpen?`<div class="depth-intro"><div class="depth-no">DEPTH ${String(depth).padStart(2,'0')} / 10</div><small>DISTRICT ${district[0]} · ${floor===1?'UPPER':'LOWER'} LEVEL</small><h2>${district[1]}</h2><p>${DISTRICT_COPY[s.districtStage-1]}</p>${floor===2?'<b>THE DISTRICT MASTER CONTROLS THE EXIT.</b>':''}<button id="enter-depth">ENTER</button></div>`:'';
  const ending=s.over?`<div class="overlay"><div class="card"><em>ALCHEMY CITY · DEPTH ${depth}</em><h2>${s.won?'The city releases you':'Run ended'}</h2><p>${s.won?'Cold air arrives from somewhere that should be sealed.':'The city keeps what it is given.'}</p><button id="return-title">Return to title</button></div></div>`:'';
  return `<main class="shell"><header class="top"><div class="sigil">A</div><div class="brand"><div class="title">ALCHEMY CITY</div><div class="district"><span>${district[0]}-${floor}</span> ${district[1]}</div></div><div class="depth-chip">${String(depth).padStart(2,'0')}/10</div><div class="hp"><div class="hptext"><b>${s.player.hp}</b><small>/${s.player.maxHp}</small></div><span class="bar"><i style="width:${Math.max(0,s.player.hp/s.player.maxHp*100)}%"></i></span></div></header><section class="game"><div class="camera"><canvas class="map"></canvas></div><div class="scene-label ${threats||boss?'danger':''}"><b>${sceneTitle}</b><span>${boss?'MASTER LOCK':threats?`${threats} THREAT${threats===1?'':'S'} IN SIGHT`:objective}</span></div><div class="status-row">${statuses}</div><div class="inventory">${s.player.inventory.map((k,i)=>`<button class="item ${aimIndex===i?'aiming':''}" data-item="${i}" title="${ITEMS[k].desc}" aria-label="${ITEMS[k].name}">${itemIcon(k)}<span class="item-name">${shortName(ITEMS[k].name)}</span></button>`).join('')}</div>${inspect?`<div class="inspect">${inspect}</div>`:''}<div class="turn">T${String(s.turn).padStart(3,'0')}</div>${intro}${ending}</section><footer class="hud"><div class="log"><div class="loghead">FIELD NOTES · ${KITS[selectedKit].name}</div>${s.messages.slice(-3).map(m=>`<div class="${m.tone??''}">${m.text}</div>`).join('')}</div><div class="controls"><i></i><button data-m="0,-1" aria-label="up">▲</button><i></i><button data-m="-1,0" aria-label="left">◀</button><button id="wait" class="wait" aria-label="wait">•</button><button data-m="1,0" aria-label="right">▶</button><i></i><button data-m="0,1" aria-label="down">▼</button><i></i></div></footer></main>`
}

function gameHandlers(){
  const s=game.state,canvas=app.querySelector<HTMLCanvasElement>('canvas')!;drawMap(canvas,s);const cam=canvas.parentElement!,fit=Math.min(cam.clientWidth/canvas.width,cam.clientHeight/canvas.height),scale=fit*(cam.clientWidth<700?4.5:3.0);canvas.style.width=`${canvas.width*scale}px`;canvas.style.height=`${canvas.height*scale}px`;canvas.style.transform=`translate(${(s.width/2-s.player.x)*32*scale}px,${(s.height/2-s.player.y)*32*scale-cam.clientHeight*.01}px)`;
  app.querySelector<HTMLButtonElement>('#enter-depth')?.addEventListener('click',()=>{introOpen=false;render()});app.querySelector<HTMLButtonElement>('#return-title')?.addEventListener('click',()=>{mode='title';introOpen=false;render()});
  app.querySelectorAll<HTMLButtonElement>('[data-m]').forEach(b=>b.onclick=()=>{if(introOpen)return;cancelWalk();aimIndex=null;inspect='';const [dx,dy]=b.dataset.m!.split(',').map(Number);game.move(dx!,dy!)});app.querySelector<HTMLButtonElement>('#wait')!.onclick=()=>{if(introOpen)return;cancelWalk();aimIndex=null;inspect='';game.wait()};
  app.querySelectorAll<HTMLButtonElement>('[data-item]').forEach(b=>b.onclick=()=>{if(introOpen)return;cancelWalk();const i=Number(b.dataset.item),kind=s.player.inventory[i];if(!kind)return;if(isAimedItem(kind)){aimIndex=aimIndex===i?null:i;inspect=aimIndex===null?'':`Aiming ${ITEMS[kind].name} — tap a visible tile.`;render()}else{aimIndex=null;game.use(i)}});
  canvas.onpointerdown=e=>{if(introOpen)return;const p=screenToTile(canvas,e.clientX,e.clientY);if(p.x<0||p.y<0||p.x>=s.width||p.y>=s.height)return;if(aimIndex!==null){cancelWalk();const i=aimIndex;aimIndex=null;inspect='';game.use(i,p);return}const dx=p.x-s.player.x,dy=p.y-s.player.y,t=s.tiles[p.y*s.width+p.x];if(Math.abs(dx)+Math.abs(dy)===1){cancelWalk();inspect='';if(t?.fixture&&t.blocks){game.interact(p);return}game.move(Math.sign(dx),Math.sign(dy));return}const occupied=s.enemies.some(enemy=>enemy.x===p.x&&enemy.y===p.y);if(t?.discovered&&t.kind!=='wall'&&!t.blocks&&!occupied){void walkTo(p);return}cancelWalk();inspect=inspectAt(s,p);render()}
}

function render(){
  if(mode==='title'){app.innerHTML=titleMarkup();titleHandlers();return}
  if(mode==='guide'){app.innerHTML=guideMarkup();guideHandlers();return}
  const key=depthKey();if(key!==lastDepth){lastDepth=key;introOpen=true}app.innerHTML=gameMarkup();gameHandlers()
}

game.sub(render);
window.addEventListener('keydown',e=>{if(mode!=='game'||introOpen||game.state.over)return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','.',' '].includes(k))cancelWalk();if(k==='arrowup'||k==='w')game.move(0,-1);if(k==='arrowdown'||k==='s')game.move(0,1);if(k==='arrowleft'||k==='a')game.move(-1,0);if(k==='arrowright'||k==='d')game.move(1,0);if(k==='.'||k===' ')game.wait()});
window.addEventListener('resize',()=>{if(mode==='game')render()});
render();
