import { drawMap as baseDrawMap, screenToTile } from './render2';
import type { EliteKind, GameState, Tile } from '../game/types';

const TS=32;
const SPECIAL=new Set<NonNullable<Tile['fixture']>>([
  'relic-pedestal','pressure-console','scent-burner','field-kit','glass-organ',
  'sealed-urn','chain-hoist','observation-desk','resonator'
]);
const ELITE_COL:Record<EliteKind,string>={
  'acid-seer':'#d7ea65','mirror-hunter':'#b8ece5','furnace-heart':'#f29a45',
  embalmer:'#c9bd72','brass-executor':'#f0bd67','salt-abbot':'#b8d7cf'
};
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function rr(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.beginPath();c.roundRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h),r);c.fill();c.globalAlpha=1}

function specialFixture(c:CanvasRenderingContext2D,x:number,y:number,t:Tile){
  if(!t.fixture||!SPECIAL.has(t.fixture))return;const X=x*TS,Y=y*TS,k=t.fixture;
  px(c,X+4,Y+27,24,3,'#050705',.80);
  if(k==='relic-pedestal'){
    px(c,X+8,Y+19,16,8,'#42382a');px(c,X+10,Y+15,12,5,'#706044');px(c,X+13,Y+8,6,8,'#b9934f');px(c,X+14,Y+6,4,3,'#e0c274');
    if((t.state??0)===0){c.strokeStyle='#dfc56e';c.lineWidth=1;c.beginPath();c.arc(X+16,Y+11,7,0,Math.PI*2);c.stroke()}
  }else if(k==='pressure-console'){
    px(c,X+5,Y+10,22,17,'#30352f');px(c,X+7,Y+12,18,5,'#4f5d58');px(c,X+8,Y+20,6,4,'#6aa39d');px(c,X+17,Y+20,7,4,'#a87445');c.strokeStyle='#c3a96c';c.lineWidth=2;c.beginPath();c.arc(X+16,Y+15,5,Math.PI,Math.PI*2);c.stroke();
  }else if(k==='scent-burner'){
    px(c,X+9,Y+19,14,8,'#5c4934');px(c,X+7,Y+17,18,4,'#90724a');px(c,X+13,Y+10,6,8,'#393d2d');ln(c,X+14,Y+12,X+11,Y+8,'#9fa77a',2,.45);ln(c,X+18,Y+12,X+21,Y+7,'#b8b17a',2,.38);
  }else if(k==='field-kit'){
    rr(c,X+5,Y+12,22,15,3,'#6a5a43');px(c,X+7,Y+14,18,4,'#9b835b');px(c,X+14,Y+9,5,5,'#3d3529');px(c,X+14,Y+19,5,5,'#d3c6a5');px(c,X+11,Y+21,11,2,'#d3c6a5');
  }else if(k==='glass-organ'){
    px(c,X+4,Y+25,24,3,'#3a3025');for(const [dx,h] of[[6,11],[10,17],[14,21],[18,16],[22,12]] as const){px(c,X+dx,Y+25-h,3,h,'#5c9894');px(c,X+dx+1,Y+25-h,1,h-2,'#d7f0e8',.72)}
  }else if(k==='sealed-urn'){
    px(c,X+12,Y+7,8,4,'#b18a55');rr(c,X+8,Y+11,16,16,6,'#4b3d34');rr(c,X+10,Y+13,12,12,5,'#72584a');px(c,X+14,Y+14,4,7,'#9ab0a0',.42);
  }else if(k==='chain-hoist'){
    c.strokeStyle='#8d7550';c.lineWidth=1;for(let i=0;i<5;i++)c.strokeRect(X+14,Y+4+i*5,4,5);px(c,X+7,Y+23,18,4,'#5b4c37');ln(c,X+10,Y+25,X+7,Y+20,'#9a7a4c',2,.7);ln(c,X+22,Y+25,X+25,Y+20,'#9a7a4c',2,.7);
  }else if(k==='observation-desk'){
    px(c,X+4,Y+15,24,11,'#5a422f');px(c,X+6,Y+17,20,4,'#8a6543');px(c,X+8,Y+9,16,8,'#c1b58e');ln(c,X+10,Y+12,X+21,Y+12,'#71684f',1,.75);ln(c,X+10,Y+15,X+18,Y+15,'#71684f',1,.65);
  }else if(k==='resonator'){
    px(c,X+5,Y+24,22,4,'#4b3b2d');c.strokeStyle='#b99b58';c.lineWidth=3;c.beginPath();c.arc(X+16,Y+16,9,0,Math.PI*2);c.stroke();c.strokeStyle='#8cc2bd';c.lineWidth=2;c.beginPath();c.arc(X+16,Y+16,5,0,Math.PI*2);c.stroke();px(c,X+15,Y+7,2,18,'#d7c270',.55);
  }
  const col=k==='glass-organ'||k==='resonator'?'#8ec8c1':k==='pressure-console'?'#7eb5ae':'#d0ad64';
  px(c,X+7,Y+5,18,2,col,.58);
}
function specialFixtures(c:CanvasRenderingContext2D,s:GameState){for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(t?.visible)specialFixture(c,x,y,t)}}

function eliteMarks(c:CanvasRenderingContext2D,s:GameState){for(const e of s.enemies){if(!e.elite||!s.tiles[e.y*s.width+e.x]?.visible)continue;const X=e.x*TS,Y=e.y*TS,col=ELITE_COL[e.elite];px(c,X+8,Y+29,16,2,'#050705',.80);px(c,X+10,Y+29,12,2,col,.72);px(c,X+14,Y+2,4,3,col,.88);px(c,X+12,Y+4,8,2,'#090b08',.86);ln(c,X+12,Y+4,X+16,Y+7,col,1,.65);ln(c,X+20,Y+4,X+16,Y+7,col,1,.65)}}

function roomMass(c:CanvasRenderingContext2D,s:GameState){
  // Keep the old material-rich base. This is only a sparse, low-alpha room tint so gameplay overlays stay legible.
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind!=='floor'||t.fixture)continue;if(((x>>1)+(y>>1)+s.districtStage)%13!==0)continue;const X=x*TS,Y=y*TS;px(c,X+4,Y+23,24,3,s.districtStage===4?'#4d6865':s.districtStage===3||s.districtStage===5?'#6b4d35':'#4f5342',.07)}
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;roomMass(c,s);specialFixtures(c,s);eliteMarks(c,s)}
export { screenToTile };
