import { drawMap as baseDrawMap, screenToTile } from './renderPolish';
import type { GameState } from '../game/types';

const TS=32;
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function line(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}

function raisedArchitecture(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind!=='wall')continue;const X=x*TS,Y=y*TS;
    const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;
    const east=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;
    const west=x>0?s.tiles[y*s.width+x-1]:undefined;
    px(c,X+1,Y+1,30,2,'#a17d54',.24);px(c,X+2,Y+3,28,1,'#493725',.72);
    if(east?.kind!=='wall')px(c,X+29,Y+5,3,23,'#020302',.58);
    if(west?.kind!=='wall')px(c,X,Y+5,2,23,'#786047',.14);
    if(south?.visible&&south.kind!=='wall'){
      px(c,X,Y+24,TS,2,'#9a724a',.34);px(c,X,Y+26,TS,5,'#030403',.70);
      if(south.kind==='floor'&&!south.fixture&&!occupied(s,x,y+1)){
        px(c,X,Y+32,TS,4,'#020302',.42);px(c,X+3,Y+36,26,2,'#060806',.18);
      }
    }
  }
}

function doorReadability(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind!=='door')continue;const X=x*TS,Y=y*TS;
    px(c,X+4,Y+1,24,3,'#17130e',.85);px(c,X+6,Y+4,20,2,'#8e6b43',.45);
    px(c,X+5,Y+29,22,2,'#020302',.72);line(c,X+8,Y+7,X+8,Y+27,'#b07a45',1,.28);
  }
}

function subtleTileDepth(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind!=='floor'||t.fixture||occupied(s,x,y))continue;const X=x*TS,Y=y*TS;
    if(((x*11+y*7+s.seed)&15)===0){line(c,X+5,Y+26,X+13,Y+24,'#171b17',1,.24);line(c,X+13,Y+24,X+17,Y+25,'#8b8069',1,.10)}
  }
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;
  subtleTileDepth(c,s);raisedArchitecture(c,s);doorReadability(c,s);
}
export { screenToTile };
