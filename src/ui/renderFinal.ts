import { drawMap as baseDrawMap, screenToTile } from './renderClean';
import type { GameState, Tile } from '../game/types';

const TS=32;
const ACTIONABLE=new Set<NonNullable<Tile['fixture']>>([
  'sealed-cache','lever','brass-gate','boiler','ward-pylon','incinerator','valve','reagent-pump',
  'bell','transmuter','crucible','furnace','silver-mirror','archive-desk','fountain','retort'
]);
const PAL={
  1:{floor:'#20231d',wall:'#292b24',edge:'#847a62'},
  2:{floor:'#252119',wall:'#302a21',edge:'#8b7458'},
  3:{floor:'#221e19',wall:'#302720',edge:'#95694a'},
  4:{floor:'#1b2323',wall:'#263031',edge:'#6f8785'},
  5:{floor:'#211c19',wall:'#2d2520',edge:'#907054'}
} as const;
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}
function open(t:Tile|undefined){return !!t&&t.kind!=='wall'}
function palette(s:GameState){return PAL[Math.max(1,Math.min(5,s.districtStage)) as keyof typeof PAL]}

function finalBackgroundPass(c:CanvasRenderingContext2D,s:GameState){
  const p=palette(s);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS,Y=y*TS;
    if(t.kind==='wall'){
      px(c,X+1,Y+2,30,23,p.wall,.74);
      px(c,X+2,Y+3,28,2,'#aca083',.09);
      px(c,X+2,Y+14,28,1,'#090b08',.24);
      const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;
      if(open(south)&&south?.visible){px(c,X,Y+23,32,3,p.edge,.30);px(c,X,Y+26,32,6,'#080a08',.76)}
      continue;
    }
    if(t.kind!=='floor'||occupied(s,x,y)||t.fixture&&ACTIONABLE.has(t.fixture))continue;
    const hasFixture=!!t.fixture;
    const alpha=hasFixture?(t.blocks?.38:.64):.52;
    px(c,X+1,Y+1,30,30,p.floor,alpha);
    if(!hasFixture){
      if(((Math.floor(x/2)+Math.floor(y/2))&1)===0)px(c,X+2,Y+2,28,1,'#a99a78',.035);
      px(c,X+2,Y+30,28,1,'#050705',.16);
    }else if(t.blocks){
      ln(c,X+6,Y+27,X+26,Y+27,'#8f856d',1,.20);
    }
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

function interactivePriority(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||!t.fixture||!ACTIONABLE.has(t.fixture))continue;
    const X=x*TS,Y=y*TS;let col='#e0bd67';
    if(t.fixture==='valve'||t.fixture==='reagent-pump'||t.fixture==='fountain')col='#83c1bc';
    if(t.fixture==='furnace'||t.fixture==='incinerator'||t.fixture==='boiler'||t.fixture==='crucible')col='#ec8d48';
    ln(c,X+5,Y+5,X+27,Y+5,col,2,.86);ln(c,X+5,Y+5,X+5,Y+25,col,2,.58);ln(c,X+27,Y+5,X+27,Y+25,col,2,.58);
  }
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  baseDrawMap(canvas,s);
  const c=canvas.getContext('2d')!;
  finalBackgroundPass(c,s);
  interactivePriority(c,s);
  telegraphTargets(c,s);
}
export { screenToTile };
