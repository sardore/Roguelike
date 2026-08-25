import { bandFor,type Tile,type TileKind,type TowerState } from './tower';

type P={x:number;y:number};
type Room={x:number;y:number;w:number;h:number;cx:number;cy:number;shape:'rect'|'oval'};

class Rng{constructor(private s:number){}next(){let x=this.s|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.s=x|0;return(x>>>0)/4294967296}int(a:number,b:number){return a+Math.floor(this.next()*(b-a+1))}chance(p:number){return this.next()<p}}
const tile=(kind:TileKind='void',variant=0):Tile=>({kind,variant,seen:false,visible:false});
const id=(s:TowerState,x:number,y:number)=>y*s.w+x;
const inside=(s:TowerState,x:number,y:number)=>x>0&&y>0&&x<s.w-1&&y<s.h-1;
const get=(s:TowerState,x:number,y:number)=>inside(s,x,y)?s.tiles[id(s,x,y)]:undefined;
const set=(s:TowerState,x:number,y:number,k:TileKind,v=0)=>{if(x>=0&&y>=0&&x<s.w&&y<s.h)s.tiles[id(s,x,y)]=tile(k,v)};
const openKind=(k:TileKind)=>!['void','wall','chasm','books','pillar'].includes(k);
const overlaps=(a:Room,b:Room,m=2)=>a.x-m<b.x+b.w&&a.x+a.w+m>b.x&&a.y-m<b.y+b.h&&a.y+a.h+m>b.y;

function carveRoom(s:TowerState,r:Room,band:number,rng:Rng){
  if(r.shape==='oval'){
    const rx=r.w/2,ry=r.h/2,cx=r.x+rx-.5,cy=r.y+ry-.5;
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const dx=(x-cx)/Math.max(1,rx),dy=(y-cy)/Math.max(1,ry);if(dx*dx+dy*dy<=1)set(s,x,y,band===3&&rng.chance(.08)?'grass':'floor',rng.int(0,7))}
  }else{
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)set(s,x,y,'floor',rng.int(0,7));
  }
}
function carveLine(s:TowerState,a:P,b:P,width:number,rng:Rng){
  let x=a.x,y=a.y;const horizFirst=rng.chance(.5);
  const dig=(xx:number,yy:number)=>{const half=Math.floor(width/2);for(let o=-half;o<=half;o++){set(s,xx,yy+o,'floor',rng.int(0,7));if(width>1)set(s,xx+o,yy,'floor',rng.int(0,7))}};
  const hx=()=>{while(x!==b.x){dig(x,y);x+=Math.sign(b.x-x)}dig(x,y)};
  const hy=()=>{while(y!==b.y){dig(x,y);y+=Math.sign(b.y-y)}dig(x,y)};
  if(horizFirst){hx();hy()}else{hy();hx()}
}
function centerDistance(a:Room,b:Room){return Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy)}
function connectRooms(s:TowerState,rooms:Room[],band:number,rng:Rng){
  const connected=new Set<number>([0]),edges:Array<[number,number]>=[];
  while(connected.size<rooms.length){let best:[number,number]|undefined,bestD=1e9;for(const i of connected)for(let j=0;j<rooms.length;j++){if(connected.has(j))continue;const d=centerDistance(rooms[i]!,rooms[j]!);if(d<bestD){bestD=d;best=[i,j]}}if(!best)break;edges.push(best);connected.add(best[1])}
  const extra=Math.max(1,Math.floor(rooms.length/4));for(let n=0;n<extra;n++){let a=rng.int(0,rooms.length-1),b=rng.int(0,rooms.length-1);if(a===b)b=(b+1)%rooms.length;edges.push([a,b])}
  for(const [ai,bi] of edges){const a=rooms[ai]!,b=rooms[bi]!;carveLine(s,{x:a.cx,y:a.cy},{x:b.cx,y:b.cy},band===1&&rng.chance(.25)?2:1,rng)}
}
function wallify(s:TowerState,band:number,rng:Rng){
  const before=s.tiles.map(t=>t.kind);for(let y=1;y<s.h-1;y++)for(let x=1;x<s.w-1;x++){if(before[id(s,x,y)]!=='void')continue;let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const k=before[id(s,x+dx,y+dy)];if(k&&k!=='void'&&k!=='wall'&&k!=='chasm')near=true}if(near)set(s,x,y,band===5&&rng.chance(.55)?'chasm':'wall',rng.int(0,7))}
}
function doorify(s:TowerState,band:number,rng:Rng){
  if(band===3||band===5)return;for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++){if(get(s,x,y)?.kind!=='floor')continue;const l=get(s,x-1,y)?.kind,r=get(s,x+1,y)?.kind,u=get(s,x,y-1)?.kind,d=get(s,x,y+1)?.kind;const vert=(l==='wall'||l==='void')&&(r==='wall'||r==='void')&&u==='floor'&&d==='floor';const hor=(u==='wall'||u==='void')&&(d==='wall'||d==='void')&&l==='floor'&&r==='floor';if((vert||hor)&&rng.chance(.48))set(s,x,y,'door',rng.int(0,3))}
}
function decorateBand(s:TowerState,rooms:Room[],band:number,rng:Rng,start:P,stairs:P){
  const floors: P[]=[];for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++)if(get(s,x,y)?.kind==='floor')floors.push({x,y});
  const safe=(p:P)=>Math.abs(p.x-start.x)+Math.abs(p.y-start.y)>4&&Math.abs(p.x-stairs.x)+Math.abs(p.y-stairs.y)>2;
  for(const p of floors){if(!safe(p))continue;const q=rng.next();if(band===1){if(q<.015)set(s,p.x,p.y,'rubble',rng.int(0,3));else if(q<.024)set(s,p.x,p.y,'trap',rng.int(0,3))}
    else if(band===2){if(q<.025)set(s,p.x,p.y,'pillar',rng.int(0,3));else if(q<.040)set(s,p.x,p.y,'gear',rng.int(0,3));else if(q<.050)set(s,p.x,p.y,'rubble',rng.int(0,3))}
    else if(band===3){if(q<.11)set(s,p.x,p.y,'grass',rng.int(0,3));else if(q<.145)set(s,p.x,p.y,'water',rng.int(0,3));else if(q<.160)set(s,p.x,p.y,'pillar',rng.int(0,3))}
    else if(band===4){if(q<.035)set(s,p.x,p.y,'gear',rng.int(0,3));else if(q<.045)set(s,p.x,p.y,'trap',rng.int(0,3))}
    else {if(q<.035)set(s,p.x,p.y,'gear',rng.int(0,3));else if(q<.055)set(s,p.x,p.y,'lava',rng.int(0,3))}}
  if(band===4){for(const room of rooms){if(room.w<7||room.h<6)continue;for(let y=room.y+2;y<room.y+room.h-2;y+=3)for(let x=room.x+1;x<room.x+room.w-1;x++){if(Math.abs(x-room.cx)<=1)continue;if(get(s,x,y)?.kind==='floor'&&rng.chance(.76))set(s,x,y,'books',rng.int(0,3))}}}
  if(band===2){for(const room of rooms.slice(1,4)){for(const p of [{x:room.x+1,y:room.y+1},{x:room.x+room.w-2,y:room.y+1},{x:room.x+1,y:room.y+room.h-2},{x:room.x+room.w-2,y:room.y+room.h-2}])if(get(s,p.x,p.y)?.kind==='floor')set(s,p.x,p.y,'pillar',1)}}
}
function roomPlan(s:TowerState,band:number,rng:Rng){
  const rooms:Room[]=[];const target=band===5?9:10+band;let tries=0;
  while(rooms.length<target&&tries++<600){const oval=band===3||band===5||rng.chance(.18);const w=band===5?rng.int(5,8):rng.int(5,10),h=band===5?rng.int(5,8):rng.int(5,9),x=rng.int(2,s.w-w-3),y=rng.int(2,s.h-h-3);const room:Room={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2),shape:oval?'oval':'rect'};if(rooms.some(o=>overlaps(room,o,band===5?2:1)))continue;rooms.push(room)}
  if(rooms.length<6){rooms.length=0;for(const [x,y] of [[4,31],[17,31],[30,29],[6,17],[20,18],[31,13],[17,4]])rooms.push({x,y,w:8,h:7,cx:x+4,cy:y+3,shape:band===3||band===5?'oval':'rect'})}
  return rooms;
}
function chooseEndpoints(rooms:Room[]){const start=[...rooms].sort((a,b)=>b.cy-a.cy)[0]!,stairs=[...rooms].sort((a,b)=>a.cy-b.cy)[0]!;return{start:{x:start.cx,y:start.cy},stairs:{x:stairs.cx,y:stairs.cy}}}
function openCells(s:TowerState){const out:P[]=[];for(let y=1;y<s.h-1;y++)for(let x=1;x<s.w-1;x++){const t=get(s,x,y);if(t&&openKind(t.kind)&&t.kind!=='stairs'&&t.kind!=='door')out.push({x,y})}return out}
function repositionActors(s:TowerState,rng:Rng,start:P,stairs:P){
  const cells=openCells(s),taken=new Set<string>([`${start.x},${start.y}`,`${stairs.x},${stairs.y}`]);const pick=(min:number)=>{for(let n=0;n<800;n++){const p=cells[rng.int(0,cells.length-1)]!;if(!p||taken.has(`${p.x},${p.y}`)||Math.abs(p.x-start.x)+Math.abs(p.y-start.y)<min)continue;taken.add(`${p.x},${p.y}`);return p}return cells.find(p=>!taken.has(`${p.x},${p.y}`))??start};
  for(const e of s.enemies){const p=pick(7);e.x=p.x;e.y=p.y;e.intent=undefined;e.intentX=undefined;e.intentY=undefined}
  for(const d of s.drops){const p=pick(4);d.x=p.x;d.y=p.y}
}
export function reshapeTowerFloor(s:TowerState){
  const band=bandFor(s.floor),rng=new Rng((s.seed^Math.imul(s.floor,0x9e3779b1)^0x51f15e7)>>>0);s.tiles=Array.from({length:s.w*s.h},()=>tile());const rooms=roomPlan(s,band,rng);for(const room of rooms)carveRoom(s,room,band,rng);connectRooms(s,rooms,band,rng);wallify(s,band,rng);doorify(s,band,rng);const {start,stairs}=chooseEndpoints(rooms);s.hero.x=start.x;s.hero.y=start.y;set(s,stairs.x,stairs.y,'stairs',0);decorateBand(s,rooms,band,rng,start,stairs);set(s,start.x,start.y,'floor',0);set(s,stairs.x,stairs.y,'stairs',0);repositionActors(s,rng,start,stairs);return{rooms:rooms.length,start,stairs};
}

export function debugConnected(s:TowerState){const start=id(s,s.hero.x,s.hero.y),goal=s.tiles.findIndex(t=>t.kind==='stairs');if(goal<0)return false;const q=[start],seen=new Set<number>(q);while(q.length){const cur=q.shift()!,x=cur%s.w,y=Math.floor(cur/s.w);if(cur===goal)return true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h)continue;const ni=id(s,nx,ny),t=s.tiles[ni];if(seen.has(ni)||!t||!openKind(t.kind))continue;seen.add(ni);q.push(ni)}}return false}
