import { drawMap as baseDrawMap, screenToTile } from './renderExpansion';
import { ENEMIES } from '../game/content';
import type { GameState, TileKind } from '../game/types';

const TS=32;
const HAZARD=new Set<TileKind>(['water','brine','acid','oil','sludge','glass','steam','miasma','rune','embers','fire','crystal']);
const EDGE:Partial<Record<TileKind,string>>={water:'#6ea3a4',brine:'#74abaa',acid:'#bdd85d',oil:'#8b6d7e',sludge:'#92a35d',glass:'#bde6df',steam:'#c1cbc4',miasma:'#c5b75f',rune:'#dfc477',embers:'#da6c32',fire:'#f59a46',crystal:'#9ad0cb'};
function line(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}

function hazardContours(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||!HAZARD.has(t.kind)||occupied(s,x,y))continue;
    const col=EDGE[t.kind]??'#aaa',X=x*TS,Y=y*TS;
    const n=y>0?s.tiles[(y-1)*s.width+x]:undefined,e=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;
    const so=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined,w=x>0?s.tiles[y*s.width+x-1]:undefined;
    if(!n?.visible||n.kind!==t.kind)line(c,X+3,Y+3,X+29,Y+3,col,2,.34);
    if(!so?.visible||so.kind!==t.kind)line(c,X+3,Y+29,X+29,Y+29,col,2,.34);
    if(!w?.visible||w.kind!==t.kind)line(c,X+3,Y+3,X+3,Y+29,col,2,.28);
    if(!e?.visible||e.kind!==t.kind)line(c,X+29,Y+3,X+29,Y+29,col,2,.28);
  }
}

function actorReadability(c:CanvasRenderingContext2D,s:GameState){
  for(const e of s.enemies){
    const t=s.tiles[e.y*s.width+e.x];if(!t?.visible)continue;const X=e.x*TS,Y=e.y*TS,max=ENEMIES[e.kind].hp+(e.elite?6:0),ratio=Math.max(0,Math.min(1,e.hp/Math.max(1,max)));
    if(e.elite||e.hp<ENEMIES[e.kind].hp){px(c,X+5,Y+2,22,3,'#070807',.88);px(c,X+6,Y+3,Math.max(1,20*ratio),1,e.elite?'#e0b45f':'#b75745',.96)}
    if(e.elite){
      const col=e.elite==='mirror-hunter'?'#9fd5cf':e.elite==='furnace-heart'?'#e98a43':e.elite==='embalmer'?'#c0b367':e.elite==='acid-seer'?'#a8cf55':e.elite==='brass-executor'?'#e0b45f':'#84b6b3';
      px(c,X+14,Y+5,4,4,col,.92);px(c,X+12,Y+7,8,2,col,.72);
    }
  }
  const X=s.player.x*TS,Y=s.player.y*TS,col='#e9dfbd';
  line(c,X+5,Y+5,X+11,Y+5,col,2,.48);line(c,X+5,Y+5,X+5,Y+11,col,2,.48);
  line(c,X+27,Y+5,X+21,Y+5,col,2,.48);line(c,X+27,Y+5,X+27,Y+11,col,2,.48);
  line(c,X+5,Y+27,X+11,Y+27,col,2,.40);line(c,X+5,Y+27,X+5,Y+21,col,2,.40);
  line(c,X+27,Y+27,X+21,Y+27,col,2,.40);line(c,X+27,Y+27,X+27,Y+21,col,2,.40);
}

function itemGleam(c:CanvasRenderingContext2D,s:GameState){
  for(const i of s.items){const t=s.tiles[i.y*s.width+i.x];if(!t?.visible)continue;const X=i.x*TS,Y=i.y*TS;px(c,X+25,Y+6,2,2,'#f1e7c4',.72);px(c,X+26,Y+4,1,6,'#f1e7c4',.36);px(c,X+24,Y+7,6,1,'#f1e7c4',.34)}
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;
  hazardContours(c,s);itemGleam(c,s);actorReadability(c,s);
}
export { screenToTile };
