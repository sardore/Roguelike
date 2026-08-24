import './style.css';
import { Game } from './game/engine';
import { ITEMS } from './game/content';
import { findPath, visibleThreatIds } from './game/path';
import { inspectAt } from './game/systems';
import { drawMap, screenToTile } from './ui/render';
import type { Point } from './game/types';

const app=document.querySelector<HTMLDivElement>('#app')!;
const game=new Game();
let inspect='';
let aimIndex:number|null=null;
let walkToken=0;

const shortName=(name:string)=>name.replace(' Phial','').replace(' Bomb','').replace(' Tonic','').replace('White ','');
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
function cancelWalk(){walkToken++;}

async function walkTo(target:Point){
  cancelWalk();
  const token=walkToken;
  inspect='';
  if(visibleThreatIds(game.state).size){inspect='A threat is visible. Move one turn at a time.';render();return;}
  let knownThreats=visibleThreatIds(game.state);
  while(token===walkToken&&!game.state.over){
    const path=findPath(game.state,target);
    if(path.length<2)break;
    const next=path[1]!;
    const beforeHp=game.state.player.hp;
    const beforeInventory=game.state.player.inventory.length;
    const dx=next.x-game.state.player.x,dy=next.y-game.state.player.y;
    game.move(dx,dy);
    await sleep(82);
    if(token!==walkToken||game.state.over)break;
    if(game.state.player.hp!==beforeHp||game.state.player.inventory.length!==beforeInventory)break;
    const threats=visibleThreatIds(game.state);
    if([...threats].some(id=>!knownThreats.has(id)))break;
    knownThreats=threats;
    if(game.state.player.x===target.x&&game.state.player.y===target.y)break;
  }
}

function render(){
  const s=game.state;
  app.innerHTML=`<main class="shell"><header class="top"><div class="sigil">A</div><div class="brand"><div class="title">ALCHEMY CITY</div><div class="district"><span>01</span> APOTHECARIES’ ROW</div></div><div class="hp"><div class="hptext"><b>${s.player.hp}</b><small>/${s.player.maxHp}</small></div><span class="bar"><i style="width:${Math.max(0,s.player.hp/s.player.maxHp*100)}%"></i></span></div></header><section class="game"><div class="camera"><canvas class="map"></canvas></div><div class="inventory">${s.player.inventory.map((k,i)=>`<button class="item ${aimIndex===i?'aiming':''}" data-item="${i}" title="${ITEMS[k].desc}"><b>${ITEMS[k].glyph}</b><span>${shortName(ITEMS[k].name)}</span></button>`).join('')}</div>${inspect?`<div class="inspect">${inspect}</div>`:''}<div class="turn">TURN ${String(s.turn).padStart(3,'0')}</div>${s.over?`<div class="overlay"><div class="card"><em>ALCHEMY CITY</em><h2>${s.won?'The stair opens':'Run ended'}</h2><p>${s.won?'Something below smells faintly of cloves and hot copper.':'The city keeps what it is given.'}</p><button id="restart">New run</button></div></div>`:''}</section><footer class="hud"><div class="log"><div class="loghead">FIELD NOTES</div>${s.messages.slice(-4).map(m=>`<div class="${m.tone??''}">${m.text}</div>`).join('')}</div><div class="controls"><i></i><button data-m="0,-1" aria-label="up">▲</button><i></i><button data-m="-1,0" aria-label="left">◀</button><button id="wait" class="wait" aria-label="wait">•</button><button data-m="1,0" aria-label="right">▶</button><i></i><button data-m="0,1" aria-label="down">▼</button><i></i></div></footer></main>`;

  const canvas=app.querySelector<HTMLCanvasElement>('canvas')!;
  drawMap(canvas,s);
  const cam=canvas.parentElement!;
  const scale=Math.min(cam.clientWidth/canvas.width,cam.clientHeight/canvas.height)*2.25;
  canvas.style.width=`${canvas.width*scale}px`;
  canvas.style.height=`${canvas.height*scale}px`;
  canvas.style.transform=`translate(${(s.width/2-s.player.x)*32*scale}px,${(s.height/2-s.player.y)*32*scale}px)`;

  app.querySelectorAll<HTMLButtonElement>('[data-m]').forEach(b=>b.onclick=()=>{
    cancelWalk();aimIndex=null;inspect='';
    const [dx,dy]=b.dataset.m!.split(',').map(Number);game.move(dx!,dy!);
  });
  app.querySelector<HTMLButtonElement>('#wait')!.onclick=()=>{cancelWalk();aimIndex=null;inspect='';game.wait();};
  app.querySelectorAll<HTMLButtonElement>('[data-item]').forEach(b=>b.onclick=()=>{
    cancelWalk();
    const i=Number(b.dataset.item),kind=s.player.inventory[i];
    if(kind==='red-phial'||kind==='salt-bomb'){
      aimIndex=aimIndex===i?null:i;inspect=aimIndex===null?'':`Aiming ${ITEMS[kind].name}: tap a tile.`;render();
    }else{aimIndex=null;game.use(i);}
  });
  canvas.onpointerdown=e=>{
    const p=screenToTile(canvas,e.clientX,e.clientY);
    if(aimIndex!==null){cancelWalk();const i=aimIndex;aimIndex=null;inspect='';game.use(i,p);return;}
    const dx=p.x-s.player.x,dy=p.y-s.player.y;
    if(Math.abs(dx)+Math.abs(dy)===1){cancelWalk();inspect='';game.move(Math.sign(dx),Math.sign(dy));return;}
    const t=s.tiles[p.y*s.width+p.x];
    const occupied=s.enemies.some(enemy=>enemy.x===p.x&&enemy.y===p.y);
    if(t?.discovered&&t.kind!=='wall'&&!t.blocks&&!occupied){void walkTo(p);return;}
    cancelWalk();inspect=inspectAt(s,p);render();
  };
  app.querySelector<HTMLButtonElement>('#restart')?.addEventListener('click',()=>{cancelWalk();aimIndex=null;inspect='';game.restart();});
}

game.sub(render);
window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','.',' '].includes(k))cancelWalk();
  if(k==='arrowup'||k==='w')game.move(0,-1);
  if(k==='arrowdown'||k==='s')game.move(0,1);
  if(k==='arrowleft'||k==='a')game.move(-1,0);
  if(k==='arrowright'||k==='d')game.move(1,0);
  if(k==='.'||k===' ')game.wait();
});
window.addEventListener('resize',render);
render();
