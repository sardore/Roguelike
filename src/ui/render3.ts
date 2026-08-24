import { drawMap as baseDrawMap, screenToTile } from './render2';
import type { GameState, Tile } from '../game/types';

const TS=32;
const hash=(x:number,y:number,v=0)=>{let n=Math.imul(x+31*y+v*131,0x45d9f3b);n=(n^(n>>>16))>>>0;return n/4294967296};
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function openTile(t:Tile|undefined){return !!t&&t.kind!=='wall'}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}
function floorDetail(c:CanvasRenderingContext2D,s:GameState,x:number,y:number,t:Tile){if(!t.visible||t.kind==='wall'||occupied(s,x,y))return;const X=x*TS,Y=y*TS,r=hash(x,y,t.variant),room=t.room??'';
  if(room.includes('distill')||room.includes('kiln')||room.includes('furnace')||room.includes('underworks')){ln(c,X+2,Y+16,X+30,Y+16,'#171914',1,.45);if((x+y)%2===0)ln(c,X+16,Y+2,X+16,Y+30,'#171914',1,.35)}
  else if(room.includes('glass')||room.includes('assay')||room.includes('master')||room.includes('counting')||room.includes('mint')){for(const v of[8,16,24]){ln(c,X+v,Y+2,X+v,Y+30,'#17201d',1,.25);ln(c,X+2,Y+v,X+30,Y+v,'#17201d',1,.25)}}
  else if(room.includes('street')||room.includes('row')||room.includes('bazaar')||room.includes('arcade')||room.includes('ward')){if((x+t.variant)%4===0){ln(c,X+3,Y+5,X+9,Y+3,'#a28c69',1,.34);ln(c,X+23,Y+25,X+29,Y+23,'#1c211b',1,.46)}}
  if(room.includes('ash')||room.includes('black-market'))for(let i=0;i<3;i++){const q=hash(x+i*7,y,t.variant);px(c,X+5+Math.floor(q*21),Y+7+Math.floor((1-q)*18),2,2,'#11130f',.38)}
  if((room.includes('herbal')||room.includes('spice')||room.includes('courtyard'))&&r>.68){px(c,X+6,Y+22,3,4,'#6f824d',.7);px(c,X+8,Y+20,3,3,'#a2b973',.55)}
}
function facade(c:CanvasRenderingContext2D,s:GameState,x:number,y:number,t:Tile){if(!t.visible||t.kind!=='wall')return;const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;if(!openTile(south))return;const X=x*TS,Y=y*TS,room=t.room??'',motif=(x+t.variant)%6;
  if(motif===1||motif===4){px(c,X+5,Y+8,22,14,'#151b18');px(c,X+7,Y+9,18,11,room.includes('glass')?'#587a74':room.includes('sealed')?'#58444d':'#566b61');px(c,X+15,Y+9,2,11,'#b48b4d',.88);px(c,X+7,Y+14,18,2,'#b48b4d',.72);px(c,X+9,Y+10,5,2,'#e4f2dd',.23)}
  if((room.includes('distill')||room.includes('kiln')||room.includes('furnace'))&&motif===2){px(c,X+4,Y+7,5,18,'#9f5a34');px(c,X+5,Y+7,2,18,'#db8b50');px(c,X+2,Y+8,10,3,'#a98248');px(c,X+2,Y+22,10,3,'#a98248')}
  if((room.includes('bazaar')||room.includes('market')||room.includes('row'))&&motif===3){px(c,X+4,Y+7,24,7,'#45392b');px(c,X+6,Y+9,20,3,'#c39d5c');px(c,X+14,Y+14,4,10,'#6a482f')}
}
function clutter(c:CanvasRenderingContext2D,s:GameState,x:number,y:number,t:Tile){if(!t.visible||t.kind!=='floor'||t.fixture||occupied(s,x,y))return;const r=hash(x,y,t.variant),X=x*TS,Y=y*TS,room=t.room??'';if(r<.86)return;
  if(room.includes('row')||room.includes('bazaar')||room.includes('arcade')){px(c,X+4,Y+20,8,5,'#4a3426');px(c,X+5,Y+19,6,2,'#956b44');px(c,X+21,Y+22,3,5,'#38655e');px(c,X+22,Y+20,2,3,'#a7c3b7',.55)}
  else if(room.includes('distill')||room.includes('assay')||room.includes('master')){px(c,X+22,Y+18,5,7,'#355d59');px(c,X+23,Y+16,3,3,'#c09a55');px(c,X+8,Y+23,10,2,'#9d673e')}
  else if(room.includes('ash')||room.includes('under')){px(c,X+7,Y+21,15,2,'#11130f',.65);px(c,X+12,Y+17,2,5,'#65584a',.55)}
}
function glow(c:CanvasRenderingContext2D,x:number,y:number,r:number,inner:string,outer:string){const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function lighting(c:CanvasRenderingContext2D,s:GameState){c.save();c.globalCompositeOperation='screen';for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS+16,Y=y*TS+16;if(t.fixture==='lamp')glow(c,X,Y,58,'rgba(235,179,92,.20)','rgba(235,179,92,0)');if(t.kind==='fire'||t.kind==='embers')glow(c,X,Y,64,'rgba(255,132,54,.24)','rgba(255,132,54,0)');if(t.kind==='rune')glow(c,X,Y,46,'rgba(189,160,97,.13)','rgba(189,160,97,0)');if(t.kind==='crystal')glow(c,X,Y,40,'rgba(119,190,185,.10)','rgba(119,190,185,0)')}glow(c,s.player.x*TS+16,s.player.y*TS+16,48,'rgba(224,213,177,.055)','rgba(224,213,177,0)');c.restore()}
function silhouettes(c:CanvasRenderingContext2D,s:GameState){for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind==='wall')continue;const X=x*TS,Y=y*TS,n=y>0?s.tiles[(y-1)*s.width+x]:undefined,w=x>0?s.tiles[y*s.width+x-1]:undefined;if(n?.kind==='wall'){px(c,X,Y,TS,4,'#050705',.46);px(c,X,Y+4,TS,1,'#b19866',.18)}if(w?.kind==='wall')px(c,X,Y,3,TS,'#050705',.28)}}
export function drawMap(canvas:HTMLCanvasElement,s:GameState){baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x]!;facade(c,s,x,y,t);floorDetail(c,s,x,y,t);clutter(c,s,x,y,t)}silhouettes(c,s);lighting(c,s)}
export { screenToTile };
