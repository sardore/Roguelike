import { drawMap as baseDrawMap, screenToTile } from './render6';
import type { GameState, Tile } from '../game/types';

const TS=32;
const macro=(x:number,y:number,v=0)=>{let n=Math.imul(x*17+y*41+v*113,0x27d4eb2d);n=(n^(n>>>15))>>>0;return n/4294967296};
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}
function wash(room=''){
  if(room.includes('herbal')||room.includes('spice')||room.includes('courtyard'))return'#202319';
  if(room.includes('distill')||room.includes('kiln')||room.includes('furnace')||room.includes('alembic')||room.includes('reaction'))return'#242019';
  if(room.includes('glass')||room.includes('assay')||room.includes('crystal')||room.includes('mirror')||room.includes('master'))return'#18211f';
  if(room.includes('cistern')||room.includes('cooling')||room.includes('drain')||room.includes('condenser'))return'#172224';
  if(room.includes('sealed')||room.includes('black-market')||room.includes('sanctum')||room.includes('crypt')||room.includes('ossuary'))return'#201a1d';
  if(room.includes('ash')||room.includes('under')||room.includes('passage'))return'#1b1e19';
  return'#1d2019';
}
function quietGround(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t:Tile|undefined=s.tiles[y*s.width+x];
    if(!t?.visible||t.kind!=='floor'||t.fixture||occupied(s,x,y))continue;
    const X=x*TS,Y=y*TS,r=macro(Math.floor(x/2),Math.floor(y/2),t.variant);
    px(c,X+1,Y+1,30,30,wash(t.room),.52);
    if(x%2===0)ln(c,X+1,Y+2,X+1,Y+30,'#9b8965',1,.10);
    if(y%2===0)ln(c,X+2,Y+1,X+30,Y+1,'#a3916b',1,.10);
    if(x%2===1)ln(c,X+30,Y+4,X+30,Y+28,'#050705',1,.17);
    if(y%2===1)ln(c,X+4,Y+30,X+28,Y+30,'#050705',1,.17);
    if(r>.82){const xx=X+5+Math.floor(r*9),yy=Y+19-Math.floor(r*7);px(c,xx,yy,13,4,'#0f120e',.25);px(c,xx+2,yy,8,1,'#89704d',.16)}
    else if(r<.12){px(c,X+7,Y+8,17,5,'#313326',.20);px(c,X+9,Y+9,12,1,'#928268',.12)}
  }
}
function wallQuiet(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind!=='wall')continue;
    const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;
    if(!south?.visible||south.kind==='wall')continue;
    const X=x*TS,Y=y*TS;
    px(c,X+4,Y+6,24,15,'#171914',.16);
    px(c,X+3,Y+22,26,2,'#b1a077',.08);
  }
}
export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  baseDrawMap(canvas,s);
  const c=canvas.getContext('2d')!;
  quietGround(c,s);
  wallQuiet(c,s);
}
export { screenToTile };
