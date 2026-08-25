import { drawMap as baseDrawMap, screenToTile } from './renderGame';
import type { GameState, Point, Tile } from '../game/types';

const TS=32;
const idx=(s:GameState,x:number,y:number)=>y*s.width+x;
function roomBase(room?:string){return (room??'').replace(/-(wall|door|divider|organic-wall)$/,'')}
function hash(x:number,y:number,seed:number){let n=(Math.imul(x+17,73856093)^Math.imul(y+31,19349663)^Math.imul(seed+7,83492791))>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296}
function roomGroups(s:GameState){
  const m=new Map<string,Point[]>();
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[idx(s,x,y)];if(!t||t.kind==='wall'||!t.room)continue;const r=roomBase(t.room);if(!r)continue;const a=m.get(r)??[];a.push({x,y});m.set(r,a)
  }
  return m;
}
function clipVisibleWalkable(c:CanvasRenderingContext2D,s:GameState){
  c.beginPath();for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[idx(s,x,y)];if(t?.visible&&t.kind!=='wall')c.rect(x*TS,y*TS,TS,TS)}c.clip();
}
function bounds(ps:Point[]){const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y);return{minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)}}
function smoothPath(c:CanvasRenderingContext2D,pts:Array<{x:number;y:number}>){if(pts.length<2)return;c.beginPath();c.moveTo(pts[0]!.x,pts[0]!.y);for(let i=1;i<pts.length-1;i++){const p=pts[i]!,n=pts[i+1]!,mx=(p.x+n.x)/2,my=(p.y+n.y)/2;c.quadraticCurveTo(p.x,p.y,mx,my)}c.lineTo(pts[pts.length-1]!.x,pts[pts.length-1]!.y)}
function roomCenter(ps:Point[]){const b=bounds(ps);return{x:(b.minX+b.maxX+1)*TS/2,y:(b.minY+b.maxY+1)*TS/2,w:(b.maxX-b.minX+1)*TS,h:(b.maxY-b.minY+1)*TS}}

function cityRunoff(c:CanvasRenderingContext2D,s:GameState,groups:Map<string,Point[]>){
  const ps=groups.get('apothecaries-row');if(!ps?.length)return;const b=bounds(ps),mid=(b.minY+b.maxY+1)*TS/2,pts=[] as Array<{x:number;y:number}>;
  for(let i=0;i<6;i++){const t=i/5,x=(b.minX+(b.maxX-b.minX)*t+.5)*TS,y=mid+Math.sin(i*1.37+s.seed*.0001)*TS*.34;pts.push({x,y})}
  c.save();clipVisibleWalkable(c,s);c.lineCap='round';c.lineJoin='round';
  c.strokeStyle='rgba(9,14,12,.70)';c.lineWidth=7;smoothPath(c,pts);c.stroke();
  c.strokeStyle='rgba(73,116,107,.52)';c.lineWidth=3;smoothPath(c,pts);c.stroke();
  c.setLineDash([7,13]);c.lineDashOffset=-(s.turn%20);c.strokeStyle='rgba(132,174,154,.28)';c.lineWidth=1;smoothPath(c,pts);c.stroke();c.setLineDash([]);c.restore();
}
function apothecaryMotifs(c:CanvasRenderingContext2D,s:GameState,groups:Map<string,Point[]>){
  for(const name of ['herbalist','distillery','glassworks','courtyard']){const ps=groups.get(name);if(!ps?.length)continue;const q=roomCenter(ps),r=Math.min(q.w,q.h)*.18;if(r<18)continue;c.save();clipVisibleWalkable(c,s);c.translate(q.x,q.y);c.strokeStyle='rgba(117,87,54,.30)';c.lineWidth=3;c.beginPath();c.ellipse(0,0,r*1.4,r*.72,(hash(Math.floor(q.x),Math.floor(q.y),s.seed)-.5)*.7,0,Math.PI*2);c.stroke();if(name==='distillery'){c.strokeStyle='rgba(170,104,55,.40)';c.lineWidth=2;for(let k=0;k<3;k++){c.beginPath();c.arc(0,0,r*(.42+k*.25),0,Math.PI*1.7);c.stroke()}}else if(name==='herbalist'){for(let k=0;k<5;k++){const a=k/5*Math.PI*2;c.strokeStyle='rgba(103,130,73,.34)';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a+.25)*r*.7,Math.sin(a+.25)*r*.5,Math.cos(a)*r,Math.sin(a)*r*.65);c.stroke()}}else if(name==='glassworks'){c.strokeStyle='rgba(151,206,196,.28)';for(let k=0;k<5;k++){const a=k/5*Math.PI*2;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*r*1.1,Math.sin(a)*r*.7);c.stroke()}}c.restore()}
}
function bazaarMotifs(c:CanvasRenderingContext2D,s:GameState,groups:Map<string,Point[]>){
  for(const [name,ps] of groups){if(!['tincture-bazaar','spice-arcade','dye-vats','counting-house','black-market'].includes(name)||ps.length<10)continue;const q=roomCenter(ps),r=Math.min(q.w,q.h)*.16;if(r<15)continue;c.save();clipVisibleWalkable(c,s);c.translate(q.x,q.y);c.rotate((hash(name.length,s.districtStage,s.seed)-.5)*.5);for(let k=0;k<3;k++){c.strokeStyle=k===0?'rgba(129,95,61,.34)':k===1?'rgba(84,126,118,.22)':'rgba(156,112,74,.18)';c.lineWidth=k===0?3:2;c.beginPath();c.ellipse(0,0,r*(1.25-k*.23),r*(.78-k*.11),0,0,Math.PI*2);c.stroke()}for(let k=0;k<6;k++){const a=k/6*Math.PI*2;c.strokeStyle='rgba(139,116,76,.18)';c.beginPath();c.moveTo(Math.cos(a)*r*.28,Math.sin(a)*r*.18);c.lineTo(Math.cos(a)*r*1.12,Math.sin(a)*r*.70);c.stroke()}c.restore()}
}
function crucibleMotifs(c:CanvasRenderingContext2D,s:GameState,groups:Map<string,Point[]>){
  for(const name of ['furnace-court','kiln-hall','old-mint','crucible-ward']){const ps=groups.get(name);if(!ps?.length)continue;const q=roomCenter(ps),r=Math.min(q.w,q.h)*.20;if(r<17)continue;c.save();clipVisibleWalkable(c,s);c.translate(q.x,q.y);c.strokeStyle='rgba(126,64,35,.38)';c.lineWidth=5;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();c.strokeStyle='rgba(224,121,57,.25)';c.lineWidth=2;c.beginPath();c.arc(0,0,r*.67,0,Math.PI*2);c.stroke();for(let k=0;k<7;k++){const a=k/7*Math.PI*2;c.strokeStyle=k%2?'rgba(95,57,37,.30)':'rgba(191,96,45,.28)';c.lineWidth=k%2?2:3;c.beginPath();c.moveTo(Math.cos(a)*r*.58,Math.sin(a)*r*.58);c.quadraticCurveTo(Math.cos(a+.12)*r*.88,Math.sin(a+.12)*r*.88,Math.cos(a)*r*1.34,Math.sin(a)*r*1.34);c.stroke()}c.restore()}
}
function glassMotifs(c:CanvasRenderingContext2D,s:GameState,groups:Map<string,Point[]>){
  for(const [name,ps] of groups){if(!['vitreous-catacombs','mirror-ossuary','crystal-vault','preservation-hall','drain-chapel'].includes(name)||ps.length<8)continue;const q=roomCenter(ps),r=Math.min(q.w,q.h)*.22;if(r<16)continue;c.save();clipVisibleWalkable(c,s);c.translate(q.x,q.y);c.strokeStyle='rgba(126,195,188,.27)';c.lineWidth=2;for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3,b=(k+2)/6*Math.PI*2+.1;c.beginPath();c.moveTo(Math.cos(a)*r*.18,Math.sin(a)*r*.18);c.bezierCurveTo(Math.cos(a+.3)*r*.75,Math.sin(a+.3)*r*.50,Math.cos(b-.3)*r*.82,Math.sin(b-.3)*r*.62,Math.cos(b)*r*1.28,Math.sin(b)*r*.88);c.stroke()}c.strokeStyle='rgba(218,237,223,.16)';c.beginPath();c.ellipse(0,0,r*.82,r*.52,.35,0,Math.PI*2);c.stroke();c.restore()}
}
function alembicMotifs(c:CanvasRenderingContext2D,s:GameState,groups:Map<string,Point[]>){
  for(const name of ['grand-alembic','central-lab','reaction-gallery','condenser-hall','final-sanctum']){const ps=groups.get(name);if(!ps?.length)continue;const q=roomCenter(ps),r=Math.min(q.w,q.h)*.20;if(r<17)continue;c.save();clipVisibleWalkable(c,s);c.translate(q.x,q.y);for(const [rr,w,a] of [[1.0,5,.26],[.72,2,.34],[.42,2,.22]] as const){c.strokeStyle=`rgba(185,113,57,${a})`;c.lineWidth=w;c.beginPath();c.ellipse(0,0,r*rr,r*rr*.72,.15,0,Math.PI*2);c.stroke()}for(let k=0;k<4;k++){const a=Math.PI*.25+k*Math.PI*.5;c.strokeStyle='rgba(94,142,130,.22)';c.lineWidth=4;c.beginPath();c.moveTo(Math.cos(a)*r*.35,Math.sin(a)*r*.25);c.bezierCurveTo(Math.cos(a+.3)*r*.8,Math.sin(a+.3)*r*.55,Math.cos(a-.15)*r,Math.sin(a-.15)*r*.7,Math.cos(a)*r*1.45,Math.sin(a)*r*1.05);c.stroke()}c.restore()}
function organicFloorLanguage(c:CanvasRenderingContext2D,s:GameState){const groups=roomGroups(s);if(s.districtStage===1){cityRunoff(c,s,groups);apothecaryMotifs(c,s,groups)}else if(s.districtStage===2)bazaarMotifs(c,s,groups);else if(s.districtStage===3)crucibleMotifs(c,s,groups);else if(s.districtStage===4)glassMotifs(c,s,groups);else alembicMotifs(c,s,groups)}

function irregularWallShoulders(c:CanvasRenderingContext2D,s:GameState){
  // Diagonal masonry shoulders visually break the checkerboard silhouette while keeping the whole wall solid.
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[idx(s,x,y)];if(!t?.visible||t.kind!=='wall')continue;const X=x*TS,Y=y*TS;
    const n=y>0?s.tiles[idx(s,x,y-1)]:undefined,e=x+1<s.width?s.tiles[idx(s,x+1,y)]:undefined,so=y+1<s.height?s.tiles[idx(s,x,y+1)]:undefined,w=x>0?s.tiles[idx(s,x-1,y)]:undefined;
    const openN=n?.visible&&n.kind!=='wall',openE=e?.visible&&e.kind!=='wall',openS=so?.visible&&so.kind!=='wall',openW=w?.visible&&w.kind!=='wall';
    if(!(openN&&openE||openE&&openS||openS&&openW||openW&&openN))continue;
    c.save();c.strokeStyle='rgba(145,105,67,.34)';c.lineWidth=3;c.lineCap='round';c.beginPath();
    if(openN&&openE){c.moveTo(X+19,Y+2);c.quadraticCurveTo(X+30,Y+3,X+30,Y+14)}
    if(openE&&openS){c.moveTo(X+30,Y+18);c.quadraticCurveTo(X+29,Y+29,X+18,Y+30)}
    if(openS&&openW){c.moveTo(X+14,Y+30);c.quadraticCurveTo(X+3,Y+29,X+2,Y+18)}
    if(openW&&openN){c.moveTo(X+2,Y+14);c.quadraticCurveTo(X+3,Y+3,X+14,Y+2)}
    c.stroke();c.restore();
  }
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;organicFloorLanguage(c,s);irregularWallShoulders(c,s)}
export { screenToTile };
