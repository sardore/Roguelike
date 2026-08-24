import { ENEMIES, ITEMS } from '../game/content';
import type { GameState, Point, Tile } from '../game/types';
const TS=32;
function rand2(x:number,y:number,v:number){let n=Math.imul(x+31*y+v*131,0x45d9f3b);n=(n^(n>>>16))>>>0;return n/4294967296;}
function px(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string){ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));}
function drawFloor(ctx:CanvasRenderingContext2D,x:number,y:number,t:Tile){
  const X=x*TS,Y=y*TS,r=rand2(x,y,t.variant);px(ctx,X,Y,TS,TS,t.room==='distillery'?'#302d25':'#342f27');
  px(ctx,X,Y+31,TS,1,'#1c1a16'); px(ctx,X+((t.variant*7)%22)+3,Y+5+Math.floor(r*16),6,1,'#51483a');
  if(r>.45)px(ctx,X+5+Math.floor(r*12),Y+20,2,2,'#62533f'); if(t.variant===15){px(ctx,X+2,Y+15,28,2,'#c9c4a5');px(ctx,X+7,Y+13,7,1,'#e5e0c1');}
  if(t.room==='apothecaries-row'&&r>.6){px(ctx,X+2,Y+3,4,2,'#203d37');px(ctx,X+6,Y+4,6,1,'#527064');}
}
function drawWall(ctx:CanvasRenderingContext2D,x:number,y:number,t:Tile){const X=x*TS,Y=y*TS;px(ctx,X,Y,TS,TS,'#191915');px(ctx,X,Y+5,TS,25,'#4a4638');px(ctx,X,Y+5,TS,3,'#77705a');px(ctx,X,Y+16,TS,2,'#2b2921');for(let i=0;i<3;i++){const ox=(t.variant*11+i*13)%29;px(ctx,X+ox,Y+9+i*7,7,1,i===1?'#655e4b':'#3b382e');}px(ctx,X,Y+29,TS,3,'#11120f');}
function drawLiquid(ctx:CanvasRenderingContext2D,x:number,y:number,kind:'water'|'acid'|'fire',v:number){const X=x*TS,Y=y*TS;drawFloor(ctx,x,y,{kind:'floor',variant:v,room:'street',discovered:true,visible:true});if(kind==='water'){px(ctx,X+3,Y+20,26,8,'#24464a');px(ctx,X+8,Y+21,12,2,'#4d7270');}else if(kind==='acid'){px(ctx,X+2,Y+18,28,11,'#51602d');px(ctx,X+6,Y+20,5,3,'#9a9d4b');px(ctx,X+20,Y+24,3,2,'#b8ad5a');}else{px(ctx,X+5,Y+16,22,12,'#6d3424');px(ctx,X+9,Y+11,6,14,'#ad5930');px(ctx,X+17,Y+14,7,12,'#d58a3d');px(ctx,X+13,Y+8,4,16,'#e5c46b');}}
function drawDoor(ctx:CanvasRenderingContext2D,x:number,y:number){const X=x*TS,Y=y*TS;px(ctx,X,Y,TS,TS,'#171713');px(ctx,X+5,Y+2,22,30,'#5b4a36');px(ctx,X+7,Y+4,18,26,'#2d2b25');px(ctx,X+9,Y+6,14,22,'#594938');px(ctx,X+20,Y+16,2,2,'#b6a16d');}
function drawStairs(ctx:CanvasRenderingContext2D,x:number,y:number){drawFloor(ctx,x,y,{kind:'floor',variant:2,room:'sealed-shop',discovered:true,visible:true});const X=x*TS,Y=y*TS;for(let i=0;i<5;i++)px(ctx,X+6+i*2,Y+22-i*3,20-i*4,3,'#75674f');}
export function drawMap(canvas:HTMLCanvasElement,s:GameState){const ctx=canvas.getContext('2d')!;canvas.width=s.width*TS;canvas.height=s.height*TS;ctx.imageSmoothingEnabled=false;ctx.fillStyle='#070806';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x]!;if(!t.discovered)continue;if(t.kind==='wall')drawWall(ctx,x,y,t);else if(t.kind==='floor')drawFloor(ctx,x,y,t);else if(t.kind==='door')drawDoor(ctx,x,y);else if(t.kind==='water'||t.kind==='acid'||t.kind==='fire')drawLiquid(ctx,x,y,t.kind,t.variant);else drawStairs(ctx,x,y);if(!t.visible){ctx.fillStyle='rgba(4,5,4,.62)';ctx.fillRect(x*TS,y*TS,TS,TS);}}
  for(const i of s.items){const t=s.tiles[i.y*s.width+i.x];if(!t?.visible)continue;ctx.font='bold 20px ui-monospace,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=i.kind==='red-phial'?'#ce765e':i.kind==='blue-tonic'?'#7aa0b1':'#d7d0aa';ctx.fillText(ITEMS[i.kind].glyph,i.x*TS+16,i.y*TS+17);}
  for(const e of s.enemies){const t=s.tiles[e.y*s.width+e.x];if(!t?.visible)continue;ctx.font='bold 19px ui-monospace,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=e.kind==='vapor-hound'?'#b9b07d':e.kind==='glass-mite'?'#b8c8c0':'#a8886c';ctx.fillText(ENEMIES[e.kind].glyph,e.x*TS+16,e.y*TS+17);if(e.telegraph){ctx.strokeStyle='#aa704d';ctx.lineWidth=2;ctx.strokeRect(e.telegraph.x*TS+4,e.telegraph.y*TS+4,24,24);}}
  ctx.fillStyle='#d8d1b6';ctx.beginPath();ctx.arc(s.player.x*TS+16,s.player.y*TS+16,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2c342f';ctx.fillRect(s.player.x*TS+13,s.player.y*TS+13,3,3);ctx.fillRect(s.player.x*TS+18,s.player.y*TS+13,3,3);ctx.fillStyle='#111';ctx.fillRect(s.player.x*TS+12,s.player.y*TS+21,8,2);
}
export function screenToTile(canvas:HTMLCanvasElement,clientX:number,clientY:number):Point{const r=canvas.getBoundingClientRect(),sx=canvas.width/r.width,sy=canvas.height/r.height;return{x:Math.floor((clientX-r.left)*sx/TS),y:Math.floor((clientY-r.top)*sy/TS)};}
