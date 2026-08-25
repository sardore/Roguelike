import { drawMap as baseDrawMap, screenToTile } from './renderClean';
import type { GameState, Tile } from '../game/types';

const TS=32;
const ACTIONABLE=new Set<NonNullable<Tile['fixture']>>([
  'sealed-cache','lever','brass-gate','boiler','ward-pylon','incinerator','valve','reagent-pump',
  'bell','transmuter','crucible','furnace','silver-mirror','archive-desk','fountain','retort'
]);
const BLOCK_SCENERY=new Set<NonNullable<Tile['fixture']>>([
  'shelf','still','crate','planter','boards','counter','vat','table','barrel','cart','cabinet','cage','stall','rubble'
]);
const PAL={
  1:{floor:'#20231d',wall:'#292b24',face:'#24261f',edge:'#827760',wood:'#6c4d33'},
  2:{floor:'#242019',wall:'#302a21',face:'#29231c',edge:'#866f56',wood:'#755038'},
  3:{floor:'#211d18',wall:'#302720',face:'#29201b',edge:'#8d6649',wood:'#71462e'},
  4:{floor:'#1a2222',wall:'#253031',face:'#20292a',edge:'#687f7d',wood:'#5a4b3d'},
  5:{floor:'#201b18',wall:'#2c241f',face:'#251e1a',edge:'#87694f',wood:'#70452d'}
} as const;
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}
function open(t:Tile|undefined){return !!t&&t.kind!=='wall'}
function palette(s:GameState){return PAL[Math.max(1,Math.min(5,s.districtStage)) as keyof typeof PAL]}

// Older renderer layers intentionally drew little bricks past exposed wall edges. Those look lively at 1:1,
// but at phone scale they become high-frequency noise and can leak into unexplored black. Erase only the
// spill that lands in truly undiscovered space; FOV/discovered information stays untouched.
function trimUnexploredSpill(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind!=='wall')continue;
    const X=x*TS,Y=y*TS;
    const w=x>0?s.tiles[y*s.width+x-1]:undefined,e=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;
    if(w&&!w.discovered)px(c,X-7,Y,7,TS,'#050705',1);
    if(e&&!e.discovered)px(c,X+TS,Y,7,TS,'#050705',1);
  }
}

function quietFixture(c:CanvasRenderingContext2D,s:GameState,x:number,y:number,t:Tile){
  if(!t.fixture||ACTIONABLE.has(t.fixture))return;
  const p=palette(s),X=x*TS,Y=y*TS,k=t.fixture;
  // Non-blocking dressing is deliberately tiny: it is mood, never a gameplay focal point.
  if(!t.blocks){
    if(k==='lamp'){px(c,X+15,Y+7,2,18,'#514936',.72);px(c,X+12,Y+6,8,5,'#6f5a38',.66);px(c,X+14,Y+7,4,2,'#b98b4b',.42)}
    else if(k==='pipe'){px(c,X+6,Y+14,20,3,'#604737',.55);px(c,X+23,Y+14,3,10,'#604737',.55)}
    else if(k==='grate'){for(let i=0;i<4;i++)px(c,X+7+i*5,Y+20,2,7,'#484b40',.62)}
    else if(k==='sign'){px(c,X+9,Y+7,14,10,'#514032',.58);px(c,X+15,Y+17,2,8,'#3b342b',.68)}
    return;
  }
  // Blocking scenery keeps a readable silhouette but loses bottles, bolts, labels and other tiny highlights.
  const metal=k==='still'||k==='vat'||k==='cage';
  const stone=k==='rubble';
  const body=stone?'#4b4c42':metal?'#4d4638':p.wood;
  const hi=stone?'#68695b':metal?'#75674d':'#8a6240';
  px(c,X+5,Y+26,22,3,'#070907',.72);
  if(k==='barrel'){
    px(c,X+8,Y+9,16,18,body,.88);px(c,X+6,Y+12,20,3,'#5c513e',.72);px(c,X+6,Y+22,20,3,'#5c513e',.72);px(c,X+11,Y+10,3,15,hi,.28);return;
  }
  if(k==='cart'){
    px(c,X+4,Y+12,24,12,body,.86);px(c,X+7,Y+14,18,3,hi,.45);px(c,X+6,Y+24,6,5,'#1b1d19',.9);px(c,X+21,Y+24,6,5,'#1b1d19',.9);return;
  }
  if(k==='cage'){
    px(c,X+6,Y+7,20,20,'#252821',.72);for(let i=0;i<4;i++)px(c,X+8+i*5,Y+8,2,18,'#68614f',.68);return;
  }
  if(k==='rubble'){
    px(c,X+5,Y+20,9,7,body,.78);px(c,X+13,Y+16,8,11,hi,.68);px(c,X+21,Y+21,7,6,body,.82);return;
  }
  px(c,X+5,Y+11,22,16,body,.82);px(c,X+7,Y+12,18,3,hi,.38);
  if(BLOCK_SCENERY.has(k)&&['crate','cabinet','boards'].includes(k)){ln(c,X+8,Y+15,X+24,Y+25,'#3a2c21',2,.55)}
}

function finalBackgroundPass(c:CanvasRenderingContext2D,s:GameState){
  const p=palette(s);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS,Y=y*TS;
    if(t.kind==='wall'){
      // One broad material mass plus one face edge. No per-tile brickwork.
      px(c,X,Y,32,32,'#121510',.96);px(c,X+2,Y+3,28,21,p.wall,.98);px(c,X+3,Y+4,26,2,'#a69b7e',.08);
      const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;
      if(open(south)&&south?.visible){px(c,X+1,Y+22,30,5,p.face,.98);px(c,X+1,Y+22,30,2,p.edge,.32);px(c,X+1,Y+27,30,5,'#070907',.82)}
      const east=x+1<s.width?s.tiles[y*s.width+x+1]:undefined,west=x>0?s.tiles[y*s.width+x-1]:undefined;
      if(open(east)&&east?.visible)px(c,X+28,Y+5,4,23,'#080a08',.58);
      if(open(west)&&west?.visible)px(c,X,Y+5,3,23,'#080a08',.50);
      continue;
    }
    if(t.kind==='floor'&&!occupied(s,x,y)){
      // Large 2x2 paving rhythm: enough texture to feel hand-built, quiet enough to read actors instantly.
      px(c,X,Y,32,32,p.floor,.93);
      if(x%2===0)px(c,X,Y+2,1,28,'#948b72',.055);
      if(y%2===0)px(c,X+2,Y,28,1,'#948b72',.05);
      px(c,X+2,Y+30,28,1,'#060806',.20);
      if(t.fixture&&!ACTIONABLE.has(t.fixture))quietFixture(c,s,x,y,t);
    }
  }
}

function doorsAndStairs(c:CanvasRenderingContext2D,s:GameState){
  const p=palette(s);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS,Y=y*TS;
    if(t.kind==='door'){
      px(c,X+4,Y+4,24,26,'#17140f',.95);px(c,X+7,Y+6,18,23,p.wood,.98);px(c,X+9,Y+8,14,3,'#9b7047',.48);px(c,X+9,Y+13,14,12,'#5a3f2c',.95);px(c,X+21,Y+18,3,3,'#d0aa61',.90);px(c,X+5,Y+3,22,2,p.edge,.40);
    }else if(t.kind==='stairs'){
      px(c,X+3,Y+4,26,25,'#151813',.88);for(let i=0;i<5;i++){px(c,X+6+i*2,Y+8+i*4,20-i*4,3,'#8b805f',.84);px(c,X+7+i*2,Y+8+i*4,18-i*4,1,'#d2bb77',.46)}
    }
  }
}

function interactivePriority(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||!t.fixture||!ACTIONABLE.has(t.fixture))continue;
    const X=x*TS,Y=y*TS;let col='#e0bd67';
    if(t.fixture==='valve'||t.fixture==='reagent-pump'||t.fixture==='fountain')col='#83c1bc';
    if(t.fixture==='furnace'||t.fixture==='incinerator'||t.fixture==='boiler'||t.fixture==='crucible')col='#ec8d48';
    if(t.fixture==='silver-mirror'||t.fixture==='transmuter')col='#b8d8d3';
    // A quiet dark base separates the object from floor texture; the material-colored cap is the interaction cue.
    px(c,X+4,Y+26,24,3,'#050705',.78);px(c,X+7,Y+5,18,3,col,.76);
    ln(c,X+5,Y+6,X+5,Y+24,col,2,.48);ln(c,X+27,Y+6,X+27,Y+24,col,2,.48);
  }
}

function telegraphTargets(c:CanvasRenderingContext2D,s:GameState){
  for(const e of s.enemies){
    const q=e.telegraph;if(!q)continue;const t=s.tiles[q.y*s.width+q.x];if(!t?.visible)continue;
    const X=q.x*TS,Y=q.y*TS,col='#ff9a50';
    px(c,X+2,Y+2,28,28,'#4a2117',.18);
    for(const [x1,y1,x2,y2] of [[4,4,13,4],[4,4,4,13],[28,4,19,4],[28,4,28,13],[4,28,13,28],[4,28,4,19],[28,28,19,28],[28,28,28,19]] as const)ln(c,X+x1,Y+y1,X+x2,Y+y2,col,2,.96);
    ln(c,X+12,Y+12,X+20,Y+20,'#ffd076',2,.75);ln(c,X+20,Y+12,X+12,Y+20,'#ffd076',2,.75);
  }
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  baseDrawMap(canvas,s);
  const c=canvas.getContext('2d')!;
  trimUnexploredSpill(c,s);
  finalBackgroundPass(c,s);
  doorsAndStairs(c,s);
  interactivePriority(c,s);
  telegraphTargets(c,s);
}
export { screenToTile };
