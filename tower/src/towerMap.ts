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
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const dx=(x-cx)/Math.max(1,rx),dy=(y-cy)/Math.max(1,ry);if(dx*dx+dy*dy<=1)set(s,x,y,band===3&&rng.chance(.07)?'grass':'floor',rng.int(0,7))}
  }else for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)set(s,x,y,'floor',rng.int(0,7));
}
function carveLine(s:TowerState,a:P,b:P,width:number,rng:Rng){
  let x=a.x,y=a.y;const horizFirst=rng.chance(.5);
  const dig=(xx:number,yy:number)=>{const half=Math.floor(width/2);for(let o=-half;o<=half;o++){set(s,xx,yy+o,'floor',rng.int(0,7));if(width>1)set(s,xx+o,yy,'floor',rng.int(0,7))}};
  const hx=()=>{while(x!==b.x){dig(x,y);x+=Math.sign(b.x-x)}dig(x,y)},hy=()=>{while(y!==b.y){dig(x,y);y+=Math.sign(b.y-y)}dig(x,y)};if(horizFirst){hx();hy()}else{hy();hx()}
}
function centerDistance(a:Room,b:Room){return Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy)}
function connectRooms(s:TowerState,rooms:Room[],band:number,rng:Rng){
  const connected=new Set<number>([0]),edges:Array<[number,number]>=[];
  while(connected.size<rooms.length){let best:[number,number]|undefined,bestD=1e9;for(const i of connected)for(let j=0;j<rooms.length;j++){if(connected.has(j))continue;const d=centerDistance(rooms[i]!,rooms[j]!);if(d<bestD){bestD=d;best=[i,j]}}if(!best)break;edges.push(best);connected.add(best[1])}
  const extra=Math.max(2,Math.floor(rooms.length/3));for(let n=0;n<extra;n++){let a=rng.int(0,rooms.length-1),b=rng.int(0,rooms.length-1);if(a===b)b=(b+1)%rooms.length;edges.push([a,b])}
  for(const [ai,bi] of edges){const a=rooms[ai]!,b=rooms[bi]!;carveLine(s,{x:a.cx,y:a.cy},{x:b.cx,y:b.cy},band===1&&rng.chance(.16)?2:1,rng)}
}
function wallify(s:TowerState,band:number,rng:Rng){const before=s.tiles.map(t=>t.kind);for(let y=1;y<s.h-1;y++)for(let x=1;x<s.w-1;x++){if(before[id(s,x,y)]!=='void')continue;let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const k=before[id(s,x+dx,y+dy)];if(k&&k!=='void'&&k!=='wall'&&k!=='chasm')near=true}if(near)set(s,x,y,band===5&&rng.chance(.58)?'chasm':'wall',rng.int(0,7))}}
function doorify(s:TowerState,band:number,rng:Rng){if(band===3||band===5)return;for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++){if(get(s,x,y)?.kind!=='floor')continue;const l=get(s,x-1,y)?.kind,r=get(s,x+1,y)?.kind,u=get(s,x,y-1)?.kind,d=get(s,x,y+1)?.kind;const vert=(l==='wall'||l==='void')&&(r==='wall'||r==='void')&&u==='floor'&&d==='floor',hor=(u==='wall'||u==='void')&&(d==='wall'||d==='void')&&l==='floor'&&r==='floor';if((vert||hor)&&rng.chance(.58))set(s,x,y,'door',rng.int(0,3))}}
function decorateBand(s:TowerState,rooms:Room[],band:number,rng:Rng,start:P,stairs:P){
  const floors:P[]=[];for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++)if(get(s,x,y)?.kind==='floor')floors.push({x,y});const safe=(p:P)=>Math.abs(p.x-start.x)+Math.abs(p.y-start.y)>3&&Math.abs(p.x-stairs.x)+Math.abs(p.y-stairs.y)>2;
  for(const p of floors){if(!safe(p))continue;const q=rng.next();if(band===1){if(q<.022)set(s,p.x,p.y,'rubble',rng.int(0,3));else if(q<.032)set(s,p.x,p.y,'trap',rng.int(0,3))}else if(band===2){if(q<.028)set(s,p.x,p.y,'pillar',rng.int(0,3));else if(q<.048)set(s,p.x,p.y,'gear',rng.int(0,3));else if(q<.060)set(s,p.x,p.y,'rubble',rng.int(0,3))}else if(band===3){if(q<.14)set(s,p.x,p.y,'grass',rng.int(0,3));else if(q<.19)set(s,p.x,p.y,'water',rng.int(0,3));else if(q<.205)set(s,p.x,p.y,'pillar',rng.int(0,3))}else if(band===4){if(q<.04)set(s,p.x,p.y,'gear',rng.int(0,3));else if(q<.052)set(s,p.x,p.y,'trap',rng.int(0,3))}else{if(q<.048)set(s,p.x,p.y,'gear',rng.int(0,3));else if(q<.074)set(s,p.x,p.y,'lava',rng.int(0,3))}}
  if(band===4)for(const room of rooms){if(room.w<6||room.h<5)continue;for(let y=room.y+1;y<room.y+room.h-1;y+=3)for(let x=room.x+1;x<room.x+room.w-1;x++){if(Math.abs(x-room.cx)<=1)continue;if(get(s,x,y)?.kind==='floor'&&rng.chance(.68))set(s,x,y,'books',rng.int(0,3))}}
  if(band===2)for(const room of rooms.slice(1,5))for(const p of [{x:room.x+1,y:room.y+1},{x:room.x+room.w-2,y:room.y+1},{x:room.x+1,y:room.y+room.h-2},{x:room.x+room.w-2,y:room.y+room.h-2}])if(get(s,p.x,p.y)?.kind==='floor'&&rng.chance(.62))set(s,p.x,p.y,'pillar',1);
}
function startRoomDetail(s:TowerState,startRoom:Room,band:number,rng:Rng,start:P){
  const candidates:P[]=[];for(let y=startRoom.y;y<startRoom.y+startRoom.h;y++)for(let x=startRoom.x;x<startRoom.x+startRoom.w;x++){const t=get(s,x,y),d=Math.abs(x-start.x)+Math.abs(y-start.y);if(t?.kind==='floor'&&d>=2&&d<=4)candidates.push({x,y})}
  const count=Math.min(3,candidates.length);for(let n=0;n<count;n++){const i=rng.int(0,candidates.length-1),p=candidates.splice(i,1)[0]!;if(band===1)set(s,p.x,p.y,'rubble',rng.int(0,3));else if(band===2)set(s,p.x,p.y,n===0?'gear':'rubble',rng.int(0,3));else if(band===3)set(s,p.x,p.y,n===0?'water':'grass',rng.int(0,3));else if(band===4)set(s,p.x,p.y,n===0?'books':'gear',rng.int(0,3));else set(s,p.x,p.y,n===0?'gear':'lava',rng.int(0,3))}
}
function roomPlan(s:TowerState,band:number,rng:Rng){
  const rooms:Room[]=[];const target=band===1?15:band===2?13:band===3?12:band===4?13:10;let tries=0;
  while(rooms.length<target&&tries++<900){let w:number,h:number;if(band===1){w=rng.int(4,7);h=rng.int(4,6)}else if(band===2){w=rng.int(5,8);h=rng.int(5,7)}else if(band===3){w=rng.int(5,8);h=rng.int(5,8)}else if(band===4){w=rng.int(5,8);h=rng.int(5,7)}else{w=rng.int(4,7);h=rng.int(4,7)}const oval=band===3||band===5||rng.chance(.12),x=rng.int(2,s.w-w-3),y=rng.int(2,s.h-h-3),room:Room={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2),shape:oval?'oval':'rect'};if(rooms.some(o=>overlaps(room,o,band===5?2:1)))continue;rooms.push(room)}
  if(rooms.length<7){rooms.length=0;for(const [x,y] of [[3,33],[14,31],[27,32],[5,22],[18,21],[30,20],[8,10],[22,9],[31,4]])rooms.push({x,y,w:6,h:5,cx:x+3,cy:y+2,shape:band===3||band===5?'oval':'rect'})}
  return rooms;
}
function chooseEndpoints(rooms:Room[]){const startRoom=[...rooms].sort((a,b)=>b.cy-a.cy)[0]!,stairsRoom=[...rooms].sort((a,b)=>a.cy-b.cy)[0]!;return{startRoom,stairsRoom,start:{x:startRoom.cx,y:startRoom.cy},stairs:{x:stairsRoom.cx,y:stairsRoom.cy}}}
function openCells(s:TowerState){const out:P[]=[];for(let y=1;y<s.h-1;y++)for(let x=1;x<s.w-1;x++){const t=get(s,x,y);if(t&&openKind(t.kind)&&t.kind!=='stairs'&&t.kind!=='door')out.push({x,y})}return out}
function pathDistance(s:TowerState,start:P){const dist=new Int16Array(s.w*s.h);dist.fill(-1);const q=[id(s,start.x,start.y)];dist[q[0]!] = 0;for(let h=0;h<q.length;h++){const cur=q[h]!,x=cur%s.w,y=Math.floor(cur/s.w);for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]] as const){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h)continue;const ni=id(s,nx,ny),t=s.tiles[ni];if(dist[ni]>=0||!t||!openKind(t.kind))continue;dist[ni]=dist[cur]!+1;q.push(ni)}}return dist}
function repositionActors(s:TowerState,rng:Rng,start:P,stairs:P){
  const cells=openCells(s),taken=new Set<string>([`${start.x},${start.y}`,`${stairs.x},${stairs.y}`]),steps=pathDistance(s,start);const pick=(min:number,max=999)=>{const preferred=cells.filter(p=>!taken.has(`${p.x},${p.y}`)&&steps[id(s,p.x,p.y)]>=min&&steps[id(s,p.x,p.y)]<=max);const pool=preferred.length?preferred:cells.filter(p=>!taken.has(`${p.x},${p.y}`)&&Math.abs(p.x-start.x)+Math.abs(p.y-start.y)>=min);const p=pool[rng.int(0,Math.max(0,pool.length-1))]??start;taken.add(`${p.x},${p.y}`);return p};
  for(let i=0;i<s.enemies.length;i++){const e=s.enemies[i]!,p=i===0&&s.floor===1?pick(5,7):pick(7);e.x=p.x;e.y=p.y;e.intent=undefined;e.intentX=undefined;e.intentY=undefined}
  for(const d of s.drops){const p=pick(4);d.x=p.x;d.y=p.y}
}
export function reshapeTowerFloor(s:TowerState){
  const band=bandFor(s.floor),rng=new Rng((s.seed^Math.imul(s.floor,0x9e3779b1)^0x51f15e7)>>>0);s.tiles=Array.from({length:s.w*s.h},()=>tile());const rooms=roomPlan(s,band,rng);for(const room of rooms)carveRoom(s,room,band,rng);connectRooms(s,rooms,band,rng);wallify(s,band,rng);doorify(s,band,rng);const {startRoom,start,stairs}=chooseEndpoints(rooms);s.hero.x=start.x;s.hero.y=start.y;set(s,stairs.x,stairs.y,'stairs',0);decorateBand(s,rooms,band,rng,start,stairs);startRoomDetail(s,startRoom,band,rng,start);set(s,start.x,start.y,'floor',0);set(s,stairs.x,stairs.y,'stairs',0);if(!debugConnected(s)){carveLine(s,start,stairs,1,rng);wallify(s,band,rng);doorify(s,band,rng);set(s,start.x,start.y,'floor',0);set(s,stairs.x,stairs.y,'stairs',0)}repositionActors(s,rng,start,stairs);return{rooms:rooms.length,start,stairs};
}
export function debugConnected(s:TowerState){const start=id(s,s.hero.x,s.hero.y),goal=s.tiles.findIndex(t=>t.kind==='stairs');if(goal<0)return false;const q=[start],seen=new Set<number>(q);while(q.length){const cur=q.shift()!,x=cur%s.w,y=Math.floor(cur/s.w);if(cur===goal)return true;for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]] as const){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h)continue;const ni=id(s,nx,ny),t=s.tiles[ni];if(seen.has(ni)||!t||!openKind(t.kind))continue;seen.add(ni);q.push(ni)}}return false}
