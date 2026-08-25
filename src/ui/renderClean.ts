import { drawMap as baseDrawMap, screenToTile } from './render2';
import type { Enemy, EnemyKind, GameState, GroundItem, ItemKind, Tile } from '../game/types';

const TS=32;
const ACTIONABLE=new Set<NonNullable<Tile['fixture']>>([
  'sealed-cache','lever','brass-gate','boiler','ward-pylon','incinerator','valve','reagent-pump',
  'bell','transmuter','crucible','furnace','silver-mirror','archive-desk','fountain','retort'
]);

function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){
  c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1;
}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){
  c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1;
}
function rr(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,col:string,a=1){
  c.globalAlpha=a;c.fillStyle=col;c.beginPath();c.roundRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h),r);c.fill();c.globalAlpha=1;
}
function visibleTile(s:GameState,x:number,y:number){return s.tiles[y*s.width+x]?.visible===true}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}
function open(t:Tile|undefined){return !!t&&t.kind!=='wall'}

function backgroundVeil(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible)continue;
    const X=x*TS,Y=y*TS;
    px(c,X,Y,TS,TS,'#11140f',t.kind==='wall'?.34:.28);
  }
}

function quietArchitecture(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible)continue;
    const X=x*TS,Y=y*TS;
    if(t.kind==='floor'&&!t.fixture&&!occupied(s,x,y)){
      const alt=((x+y)&1)===0;
      px(c,X+1,Y+1,30,30,alt?'#22251f':'#20231e',.78);
      px(c,X+2,Y+2,28,1,'#9c9279',.055);
      px(c,X+2,Y+30,28,1,'#050705',.20);
      if((x%3===0)&&(y%2===0))px(c,X+7,Y+19,13,3,'#2d3028',.32);
    }
    if(t.kind==='wall'){
      px(c,X+1,Y+2,30,23,'#292a24',.90);
      px(c,X+2,Y+3,28,2,'#77725f',.22);
      px(c,X+2,Y+8,28,1,'#11130f',.30);
      px(c,X+2,Y+16,28,1,'#11130f',.24);
      const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;
      if(open(south)&&south?.visible){
        px(c,X,Y+23,32,3,'#8c836b',.33);
        px(c,X,Y+26,32,6,'#090b08',.78);
        px(c,X+2,Y+23,28,1,'#c4ab77',.16);
      }
      const east=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;
      const west=x>0?s.tiles[y*s.width+x-1]:undefined;
      if(open(east)&&east?.visible)px(c,X+28,Y+4,4,25,'#080a08',.52);
      if(open(west)&&west?.visible)px(c,X,Y+4,3,25,'#080a08',.42);
    }
  }
}

function muteScenery(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||!t.fixture||ACTIONABLE.has(t.fixture))continue;
    const X=x*TS,Y=y*TS;
    px(c,X+2,Y+2,28,28,'#151813',.26);
  }
}

function hazard(c:CanvasRenderingContext2D,x:number,y:number,t:Tile){
  const X=x*TS,Y=y*TS;
  switch(t.kind){
    case'water':case'brine':{
      const col=t.kind==='water'?'#3e7277':'#497f80';
      px(c,X+2,Y+15,28,15,col,.88);px(c,X+4,Y+18,20,2,'#9bc4bf',.52);ln(c,X+8,Y+25,X+27,Y+25,'#80aaa8',1,.55);break;
    }
    case'acid':
      px(c,X+2,Y+14,28,16,'#667f31',.96);px(c,X+4,Y+17,24,11,'#89a43f',.78);
      for(const [dx,dy] of[[7,20],[13,25],[20,18],[25,23]] as const){px(c,X+dx,Y+dy,4,3,'#d9ea62');px(c,X+dx+1,Y+dy-2,2,2,'#f0f79a')}
      break;
    case'oil':
      px(c,X+2,Y+15,28,15,'#181419',.98);rr(c,X+5,Y+20,21,7,4,'#3b2f42',.88);ln(c,X+7,Y+19,X+25,Y+25,'#a88b74',2,.54);break;
    case'sludge':
      px(c,X+2,Y+14,28,16,'#4f5b35',.96);rr(c,X+5,Y+18,22,9,5,'#6c7a43',.82);px(c,X+8,Y+20,6,3,'#a8b36c');px(c,X+20,Y+23,4,3,'#929d5c');break;
    case'glass':
      px(c,X+2,Y+3,28,27,'#1c2c2d',.72);
      for(const [a,b,d,e] of[[5,26,12,11],[11,28,17,7],[18,27,27,15],[4,18,13,24],[19,12,26,21]] as const){ln(c,X+a,Y+b,X+d,Y+e,'#d9f4ee',2,.92);ln(c,X+a+2,Y+b,X+d+1,Y+e,'#79b4b0',1,.68)}
      break;
    case'steam':case'miasma':{
      const col=t.kind==='steam'?'#d2d8d0':'#b0a766';
      px(c,X+2,Y+3,28,27,t.kind==='steam'?'#26302c':'#35331f',.42);
      for(const [dx,dy] of[[4,20],[10,10],[17,17],[22,7]] as const)rr(c,X+dx,Y+dy,11,7,4,col,t.kind==='steam'?.28:.31);
      break;
    }
    case'rune':
      px(c,X+3,Y+3,26,26,'#2a2419',.56);c.strokeStyle='#e5c777';c.lineWidth=2;c.beginPath();c.arc(X+16,Y+16,11,0,Math.PI*2);c.stroke();
      ln(c,X+9,Y+16,X+23,Y+16,'#f0d58a',2,.88);ln(c,X+16,Y+9,X+16,Y+23,'#f0d58a',2,.88);break;
    case'embers':case'fire':
      px(c,X+2,Y+16,28,14,'#44251b',.94);
      if(t.kind==='fire'){px(c,X+8,Y+14,7,14,'#d75d28');px(c,X+17,Y+11,7,17,'#f18432');px(c,X+12,Y+8,5,16,'#ffd069')}
      else for(const [dx,dy] of[[6,23],[11,18],[17,25],[22,19],[26,24]] as const){px(c,X+dx,Y+dy,4,3,'#ee8137');px(c,X+dx+1,Y+dy-2,2,2,'#ffd16d')}
      break;
    case'crystal':
      px(c,X+2,Y+3,28,27,'#162629',.66);for(const [dx,h] of[[5,12],[10,18],[16,14],[22,20]] as const){px(c,X+dx,Y+28-h,5,h,'#6ea9aa');px(c,X+dx+1,Y+28-h,2,h-3,'#d8f4ed')}
      break;
  }
}
function hazards(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(t?.visible&&t.kind!=='wall'&&t.kind!=='floor'&&t.kind!=='door'&&t.kind!=='stairs')hazard(c,x,y,t)}
}

function actionableFixtures(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||!t.fixture||!ACTIONABLE.has(t.fixture))continue;
    const X=x*TS,Y=y*TS;
    let col='#d8b65f';
    if(t.fixture==='valve'||t.fixture==='reagent-pump'||t.fixture==='fountain')col='#79b7b2';
    if(t.fixture==='silver-mirror'||t.fixture==='transmuter')col='#b9d7d4';
    if(t.fixture==='boiler'||t.fixture==='furnace'||t.fixture==='incinerator'||t.fixture==='crucible')col='#e28443';
    px(c,X+4,Y+26,24,3,'#050705',.72);
    ln(c,X+5,Y+5,X+27,Y+5,col,2,.82);ln(c,X+5,Y+5,X+5,Y+25,col,2,.55);ln(c,X+27,Y+5,X+27,Y+25,col,2,.55);
    px(c,X+9,Y+8,14,3,col,.20);
  }
}

function glow(c:CanvasRenderingContext2D,x:number,y:number,r:number,inner:string){
  const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
}
function lights(c:CanvasRenderingContext2D,s:GameState){
  c.save();c.globalCompositeOperation='screen';
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS+16,Y=y*TS+16;
    if(t.kind==='fire'||t.kind==='embers'||t.fixture==='furnace'||t.fixture==='incinerator')glow(c,X,Y,46,'rgba(240,111,45,.17)');
    else if(t.fixture==='lamp')glow(c,X,Y,42,'rgba(221,163,78,.10)');
    else if(t.kind==='crystal')glow(c,X,Y,36,'rgba(76,165,166,.10)');
  }
  c.restore();
}

const ENEMY_COL:Record<EnemyKind,[string,string,string]>={
  'glass-mite':['#d7f3ed','#69aaa7','#17292a'],
  'distiller-rat':['#e1a25f','#a05a38','#241916'],
  'vapor-hound':['#c9d9a8','#7f9d65','#1e271d'],
  'retort-leech':['#d7df66','#8e9b35','#202413'],
  'soot-sprite':['#ffd06b','#d66a30','#211713'],
  'brine-warden':['#b7e1dc','#4f9b98','#172828'],
  'gutter-alchemist':['#e29ac4','#8f4d77','#241722'],
  homunculus:['#bde0a7','#5d9c69','#19271d'],
  'glass-sentinel':['#e0faf4','#62b9b6','#17292b'],
  'miasma-moth':['#efe08b','#a89c4d','#292515'],
  'crucible-knight':['#ffd074','#c85a2d','#2b1712']
};
function outlinedBody(c:CanvasRenderingContext2D,X:number,Y:number,w:number,h:number,lo:string,mid:string,hi:string){
  rr(c,X,Y,w,h,3,'#090b08',.98);rr(c,X+2,Y+2,w-4,h-4,2,lo);rr(c,X+4,Y+4,w-8,h-7,2,mid);px(c,X+5,Y+4,Math.max(4,w-10),3,hi,.82);
}
function enemy(c:CanvasRenderingContext2D,e:Enemy){
  const [hi,mid,lo]=ENEMY_COL[e.kind],X=e.x*TS,Y=e.y*TS;
  px(c,X+5,Y+28,22,3,'#050705',.82);
  if(e.kind==='glass-mite'){outlinedBody(c,X+7,Y+13,18,12,lo,mid,hi);for(const dx of[5,9,23,27])ln(c,X+16,Y+19,X+dx,Y+27,hi,2,.78)}
  else if(e.kind==='distiller-rat'){outlinedBody(c,X+6,Y+15,21,12,lo,mid,hi);rr(c,X+20,Y+11,8,9,2,'#090b08');rr(c,X+22,Y+13,5,5,2,mid);ln(c,X+7,Y+21,X+2,Y+17,hi,2,.7)}
  else if(e.kind==='miasma-moth'){rr(c,X+3,Y+10,11,12,5,'#090b08');rr(c,X+18,Y+10,11,12,5,'#090b08');rr(c,X+5,Y+12,8,8,4,mid);rr(c,X+19,Y+12,8,8,4,mid);outlinedBody(c,X+11,Y+8,10,18,lo,mid,hi)}
  else if(e.kind==='retort-leech'){rr(c,X+4,Y+16,24,11,5,'#090b08');rr(c,X+6,Y+18,20,7,4,mid);px(c,X+9,Y+18,12,3,hi,.75)}
  else if(e.kind==='vapor-hound'){outlinedBody(c,X+5,Y+14,21,14,lo,mid,hi);outlinedBody(c,X+19,Y+10,9,11,lo,mid,hi);px(c,X+23,Y+13,3,3,hi)}
  else if(e.kind==='brine-warden'||e.kind==='glass-sentinel'||e.kind==='crucible-knight'){outlinedBody(c,X+6,Y+7,21,22,lo,mid,hi);px(c,X+10,Y+12,13,4,'#111712',.72);if(e.kind==='crucible-knight')px(c,X+13,Y+18,7,6,'#f17731')}
  else{outlinedBody(c,X+7,Y+8,19,21,lo,mid,hi);px(c,X+11,Y+13,3,3,'#f4e9b9');px(c,X+19,Y+13,3,3,'#f4e9b9');if(e.kind==='gutter-alchemist')px(c,X+22,Y+18,6,8,'#86b86e')}
  if(e.telegraph){ln(c,X+4,Y+4,X+28,Y+4,'#ff9a52',3,.98);px(c,X+14,Y+1,5,4,'#ffd277')}
}
function player(c:CanvasRenderingContext2D,s:GameState){
  const X=s.player.x*TS,Y=s.player.y*TS;px(c,X+5,Y+29,22,3,'#050705',.86);
  rr(c,X+7,Y+11,19,18,3,'#090b08');rr(c,X+9,Y+13,15,14,2,'#2e6f66');
  px(c,X+11,Y+14,3,12,'#e0b65f');px(c,X+19,Y+14,3,12,'#e0b65f');
  rr(c,X+8,Y+4,17,12,5,'#090b08');rr(c,X+10,Y+6,13,8,4,'#eadfbe');
  px(c,X+12,Y+9,2,2,'#2c2923');px(c,X+19,Y+9,2,2,'#2c2923');px(c,X+14,Y+3,4,4,'#f0e6ca');px(c,X+19,Y+3,4,4,'#f0e6ca');
}

const ITEM_COL:Record<ItemKind,string>={
  'red-phial':'#ef6a4f','salt-bomb':'#efe7c7','blue-tonic':'#67b8d2',chalk:'#eee7cf','smoke-ampoule':'#c7d2c6',neutralizer:'#a9d677','copper-key':'#e49a4e','black-catalyst':'#a67bb4','frost-salts':'#c9f1ec',solvent:'#d6cb85','amber-elixir':'#f2a83f'
};
function item(c:CanvasRenderingContext2D,i:GroundItem){
  const X=i.x*TS,Y=i.y*TS,col=ITEM_COL[i.kind];px(c,X+8,Y+27,16,3,'#050705',.76);
  if(i.kind==='copper-key'){ln(c,X+8,Y+18,X+22,Y+18,col,4,.96);c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.arc(X+24,Y+18,5,0,Math.PI*2);c.stroke();return}
  if(i.kind==='chalk'){ln(c,X+8,Y+24,X+24,Y+12,col,5,.95);return}
  if(i.kind==='salt-bomb'||i.kind==='frost-salts'||i.kind==='black-catalyst'){rr(c,X+8,Y+11,17,15,3,'#090b08');rr(c,X+10,Y+13,13,11,2,col,.94);px(c,X+14,Y+7,5,6,'#b28b54');return}
  rr(c,X+9,Y+9,15,18,3,'#090b08');rr(c,X+11,Y+11,11,14,2,'#2b3732');px(c,X+13,Y+15,7,8,col);px(c,X+14,Y+6,5,6,'#b99459');px(c,X+13,Y+12,2,7,'#f5fff9',.35);
}
function entities(c:CanvasRenderingContext2D,s:GameState){
  for(const i of s.items)if(visibleTile(s,i.x,i.y))item(c,i);
  for(const e of s.enemies)if(visibleTile(s,e.x,e.y))enemy(c,e);
  player(c,s);
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  baseDrawMap(canvas,s);
  const c=canvas.getContext('2d')!;
  backgroundVeil(c,s);
  quietArchitecture(c,s);
  muteScenery(c,s);
  hazards(c,s);
  actionableFixtures(c,s);
  lights(c,s);
  entities(c,s);
}
export { screenToTile };
