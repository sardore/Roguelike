import { drawMap as baseDrawMap, screenToTile } from './renderExpansion';
import { ENEMIES } from '../game/content';
import type { GameState, TileKind } from '../game/types';

const TS=32;
const HAZARD=new Set<TileKind>(['water','brine','acid','oil','sludge','glass','steam','miasma','rune','embers','fire','crystal']);
const EDGE:Partial<Record<TileKind,string>>={water:'#6ea3a4',brine:'#74abaa',acid:'#bdd85d',oil:'#8b6d7e',sludge:'#92a35d',glass:'#bde6df',steam:'#c1cbc4',miasma:'#c5b75f',rune:'#dfc477',embers:'#da6c32',fire:'#f59a46',crystal:'#9ad0cb'};
const FLOOR_PLANE=[null,{base:'#46514c',seam:'#2f3935',edge:'#738079'},{base:'#4b4940',seam:'#35332d',edge:'#7a7465'},{base:'#47433d',seam:'#302d29',edge:'#786a59'},{base:'#39494a',seam:'#263638',edge:'#647b7a'},{base:'#443d38',seam:'#302a27',edge:'#745f50'}] as const;
function line(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}
function open(s:GameState,x:number,y:number){if(x<0||y<0||x>=s.width||y>=s.height)return false;return s.tiles[y*s.width+x]?.kind!=='wall'}
function roomHash(room=''){let n=0;for(let i=0;i<room.length;i++)n=(Math.imul(n,33)+room.charCodeAt(i))>>>0;return n}

function wallFloorHierarchy(c:CanvasRenderingContext2D,s:GameState){
  const fp=FLOOR_PLANE[Math.max(1,Math.min(5,s.districtStage))]!;
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS,Y=y*TS;
    if(t.kind==='wall'){
      // Keep the old brickwork, but push the whole structural mass darker/warmer than the walkable plane.
      px(c,X,Y,TS,TS,'#17130f',.28);
      px(c,X+1,Y+1,30,4,'#3b3024',.64);                 // top cap
      px(c,X+2,Y+5,28,1,'#9b7853',.15);
      px(c,X+1,Y+22,30,8,'#120f0c',.40);                // vertical face depth
      const south=open(s,x,y+1),east=open(s,x+1,y),west=open(s,x-1,y);
      if(south){
        px(c,X,Y+23,TS,2,'#9a7148',.46);                 // foot/cap lip
        px(c,X,Y+25,TS,4,'#090a07',.72);                 // drop shadow
        px(c,X,Y+29,TS,3,'#020302',.94);                 // contact line
      }
      if(east)px(c,X+28,Y+4,4,24,'#040504',.66);
      if(west)px(c,X,Y+4,4,24,'#040504',.54);
    }else if(t.kind==='floor'&&!t.fixture&&!occupied(s,x,y)){
      // Repaint only the walking plane into broad stone slabs. Underlying old detail survives faintly,
      // but the small wall-like brick rhythm no longer dominates the floor.
      px(c,X,Y,TS,TS,fp.base,.58);
      const stagger=(y&1)?8:0;
      line(c,X,Y+16,X+32,Y+16,fp.seam,1,.52);
      line(c,X+16+stagger-16,Y,X+16+stagger-16,Y+16,fp.seam,1,.40);
      line(c,X+16+stagger,Y+16,X+16+stagger,Y+32,fp.seam,1,.40);
      px(c,X+1,Y+1,30,1,fp.edge,.12);
      px(c,X+1,Y+30,30,2,'#101410',.30);
      if(((x*17+y*29+s.districtStage*13)&15)===0){px(c,X+7,Y+23,12,2,'#1c211e',.34);px(c,X+8,Y+22,7,1,fp.edge,.14)}
    }
  }
}

function facadeWindows(c:CanvasRenderingContext2D,s:GameState){
  // Restore windows as architecture, not noise: coherent south-facing facade points only.
  for(let y=0;y<s.height-1;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x],south=s.tiles[(y+1)*s.width+x];
    if(!t?.visible||t.kind!=='wall'||!south?.visible||south.kind==='wall')continue;
    const room=t.room??'';
    if(room.includes('passage')||room.includes('underworks')||room.includes('catacomb')||room.includes('drain')||room.includes('crypt'))continue;
    if((x+roomHash(room)+s.districtStage*2)%5!==1)continue;
    const X=x*TS,Y=y*TS;
    const glass=room.includes('glass')||room.includes('assay')||room.includes('master')||s.districtStage===4?'#4d7772':room.includes('sealed')||room.includes('black-market')?'#57434c':room.includes('furnace')||room.includes('kiln')?'#665342':'#52655c';
    px(c,X+5,Y+7,22,15,'#080b09',.96);                 // recess
    px(c,X+7,Y+9,18,11,glass,.90);
    px(c,X+7,Y+9,18,2,'#9eb1a6',.22);
    px(c,X+15,Y+9,2,11,'#25231d',.92);                 // mullions
    px(c,X+7,Y+14,18,2,'#25231d',.92);
    px(c,X+5,Y+6,22,2,'#765a3e',.78);                  // lintel
    px(c,X+5,Y+22,22,2,'#2f261d',.90);                 // sill
    px(c,X+9,Y+10,5,2,'#e0ece4',.18);
    if((x+roomHash(room))%2===0&&(room.includes('distill')||room.includes('furnace')||room.includes('kiln'))){
      px(c,X+3,Y+8,3,15,'#794a31',.84);px(c,X+4,Y+8,1,15,'#c57a49',.58);px(c,X+2,Y+18,5,3,'#8d6b45',.72);
    }
  }
}

function backgroundCeiling(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||t.fixture||occupied(s,x,y))continue;const X=x*TS,Y=y*TS;
    if(t.kind==='wall')px(c,X,Y,TS,TS,'#10110e',.018);
    else if(t.kind==='floor')px(c,X,Y,TS,TS,'#151813',.010);
  }
}

function hazardContours(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.visible||!HAZARD.has(t.kind)||occupied(s,x,y))continue;
    const col=EDGE[t.kind]??'#aaa',X=x*TS,Y=y*TS;
    const n=y>0?s.tiles[(y-1)*s.width+x]:undefined,e=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;
    const so=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined,w=x>0?s.tiles[y*s.width+x-1]:undefined;
    if(!n?.visible||n.kind!==t.kind)line(c,X+3,Y+3,X+29,Y+3,col,2,.44);
    if(!so?.visible||so.kind!==t.kind)line(c,X+3,Y+29,X+29,Y+29,col,2,.44);
    if(!w?.visible||w.kind!==t.kind)line(c,X+3,Y+3,X+3,Y+29,col,2,.36);
    if(!e?.visible||e.kind!==t.kind)line(c,X+29,Y+3,X+29,Y+29,col,2,.36);
  }
}

function actorReadability(c:CanvasRenderingContext2D,s:GameState){
  for(const e of s.enemies){
    const t=s.tiles[e.y*s.width+e.x];if(!t?.visible)continue;const X=e.x*TS,Y=e.y*TS,max=ENEMIES[e.kind].hp+(e.elite?6:0),ratio=Math.max(0,Math.min(1,e.hp/Math.max(1,max)));
    px(c,X+5,Y+28,22,3,'#020302',.92);px(c,X+6,Y+10,2,15,'#050605',.72);px(c,X+24,Y+10,2,15,'#050605',.62);
    if(e.elite||e.hp<ENEMIES[e.kind].hp){px(c,X+5,Y+2,22,3,'#070807',.88);px(c,X+6,Y+3,Math.max(1,20*ratio),1,e.elite?'#e0b45f':'#b75745',.96)}
    if(e.elite){const col=e.elite==='mirror-hunter'?'#9fd5cf':e.elite==='furnace-heart'?'#e98a43':e.elite==='embalmer'?'#c0b367':e.elite==='acid-seer'?'#a8cf55':e.elite==='brass-executor'?'#e0b45f':'#84b6b3';px(c,X+14,Y+5,4,4,col,.92);px(c,X+12,Y+7,8,2,col,.72)}
  }
  const X=s.player.x*TS,Y=s.player.y*TS,col='#f4e8c5';px(c,X+7,Y+28,18,3,'#020302',.94);
  line(c,X+5,Y+5,X+11,Y+5,col,2,.66);line(c,X+5,Y+5,X+5,Y+11,col,2,.66);line(c,X+27,Y+5,X+21,Y+5,col,2,.66);line(c,X+27,Y+5,X+27,Y+11,col,2,.66);
  line(c,X+5,Y+27,X+11,Y+27,col,2,.56);line(c,X+5,Y+27,X+5,Y+21,col,2,.56);line(c,X+27,Y+27,X+21,Y+27,col,2,.56);line(c,X+27,Y+27,X+27,Y+21,col,2,.56);
}

function itemGleam(c:CanvasRenderingContext2D,s:GameState){for(const i of s.items){const t=s.tiles[i.y*s.width+i.x];if(!t?.visible)continue;const X=i.x*TS,Y=i.y*TS;px(c,X+25,Y+6,2,2,'#f1e7c4',.80);px(c,X+26,Y+4,1,6,'#f1e7c4',.42);px(c,X+24,Y+7,6,1,'#f1e7c4',.40)}}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;wallFloorHierarchy(c,s);facadeWindows(c,s);backgroundCeiling(c,s);hazardContours(c,s);itemGleam(c,s);actorReadability(c,s)}
export { screenToTile };
