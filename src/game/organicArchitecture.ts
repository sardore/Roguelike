import { Rng } from './rng';
import type { GameState, Point, Tile } from './types';
import { updateVisibility } from './world';

const DIRS=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}] as const;
const CARDINAL=[[1,0],[-1,0],[0,1],[0,-1]] as const;
const idx=(s:GameState,x:number,y:number)=>y*s.width+x;
const inside=(s:GameState,x:number,y:number)=>x>0&&y>0&&x<s.width-1&&y<s.height-1;
const walkable=(t?:Tile)=>!!t&&t.kind!=='wall';

function protectedCells(s:GameState){
  const out=new Set<number>();
  const protect=(p:Point,r=0)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(Math.abs(dx)+Math.abs(dy)<=r&&inside(s,p.x+dx,p.y+dy))out.add(idx(s,p.x+dx,p.y+dy))};
  protect(s.player,1);
  for(const e of s.enemies)protect(e,1);
  for(const i of s.items)protect(i,1);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[idx(s,x,y)];if(!t)continue;
    if(t.kind==='stairs'||t.kind==='door'||t.fixture)protect({x,y},t.kind==='stairs'||t.kind==='door'?1:0);
  }
  return out;
}

function flood(s:GameState){
  const start=idx(s,s.player.x,s.player.y),seen=new Uint8Array(s.tiles.length),q=[start];seen[start]=1;
  for(let h=0;h<q.length;h++){
    const i=q[h]!,x=i%s.width,y=Math.floor(i/s.width);
    for(const d of DIRS){const nx=x+d.dx,ny=y+d.dy;if(nx<0||ny<0||nx>=s.width||ny>=s.height)continue;const ni=idx(s,nx,ny);if(seen[ni]||s.tiles[ni]?.kind==='wall')continue;seen[ni]=1;q.push(ni)}
  }
  return{seen,count:q.length};
}
function routeOpen(s:GameState){const goal=s.tiles.findIndex(t=>t.kind==='stairs');if(goal<0)return true;return !!flood(s).seen[goal]}
function openAround(s:GameState,x:number,y:number,r=1){let n=0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx===0&&dy===0)continue;const t=s.tiles[idx(s,x+dx,y+dy)];if(walkable(t))n++}return n}
function wallishAround(s:GameState,x:number,y:number){let wall=0,open=0;for(const [dx,dy] of CARDINAL){const t=s.tiles[idx(s,x+dx,y+dy)];if(!t||t.kind==='wall')wall++;else open++}return{wall,open}}
function roomBase(room?:string){if(!room)return'';return room.replace(/-(wall|door|divider|organic-wall)$/,'')}
function plainFloor(t?:Tile){return !!t&&t.kind==='floor'&&!t.fixture}
function wallTile(room:string,variant:number):Tile{return{kind:'wall',variant,room:`${room}-organic-wall`,discovered:false,visible:false}}
function floorTile(room:string,variant:number):Tile{return{kind:'floor',variant,room,discovered:false,visible:false}}
function tryWall(s:GameState,x:number,y:number,room:string,variant:number){
  const k=idx(s,x,y),old=s.tiles[k];if(!old||!plainFloor(old))return false;
  const before=flood(s),goalWas=routeOpen(s);s.tiles[k]=wallTile(room,variant);const after=flood(s),goalNow=routeOpen(s);
  // Removing one floor cell is okay; splitting a whole reachable wing is not.
  if(after.count>=before.count-1&&(!goalWas||goalNow))return true;
  s.tiles[k]=old;return false;
}

function groups(s:GameState){
  const m=new Map<string,Point[]>();
  for(let y=1;y<s.height-1;y++)for(let x=1;x<s.width-1;x++){
    const t=s.tiles[idx(s,x,y)];if(!t||t.kind==='wall'||!t.room)continue;const r=roomBase(t.room);if(!r||r.includes('door')||r.includes('divider'))continue;
    const a=m.get(r)??[];a.push({x,y});m.set(r,a);
  }
  return [...m.entries()].map(([room,cells])=>({room,cells}));
}
function edgeCandidates(s:GameState,cells:Point[]){
  const set=new Set(cells.map(p=>idx(s,p.x,p.y))),out:Array<{p:Point;d:{dx:number;dy:number}}>=[];
  for(const p of cells){const t=s.tiles[idx(s,p.x,p.y)];if(!plainFloor(t))continue;for(const d of DIRS){const nx=p.x+d.dx,ny=p.y+d.dy;if(!inside(s,nx,ny)||set.has(idx(s,nx,ny)))continue;const q=s.tiles[idx(s,nx,ny)];if(q?.kind==='wall')out.push({p,d})}}
  return out;
}

function carvePocket(s:GameState,room:string,start:Point,d:{dx:number;dy:number},rng:Rng,protectedSet:Set<number>){
  const side={dx:-d.dy,dy:d.dx};
  const cells:Point[]=[{x:start.x+d.dx,y:start.y+d.dy},{x:start.x+d.dx*2,y:start.y+d.dy*2},{x:start.x+d.dx*3,y:start.y+d.dy*3},{x:start.x+d.dx*3+side.dx,y:start.y+d.dy*3+side.dy},{x:start.x+d.dx*3-side.dx,y:start.y+d.dy*3-side.dy},{x:start.x+d.dx*2+side.dx,y:start.y+d.dy*2+side.dy}];
  if(cells.some(p=>!inside(s,p.x,p.y)||protectedSet.has(idx(s,p.x,p.y))))return 0;
  for(let i=0;i<cells.length;i++){const p=cells[i]!,t=s.tiles[idx(s,p.x,p.y)];if(!t||t.kind!=='wall')return 0;const n=wallishAround(s,p.x,p.y);if(i>0&&n.open>1)return 0}
  for(const p of cells)s.tiles[idx(s,p.x,p.y)]=floorTile(room,rng.int(0,15));
  return cells.length;
}

function meanderLongRoom(s:GameState,room:string,cells:Point[],w:number,h:number,rng:Rng,protectedSet:Set<number>){
  let cuts=0;
  if(w>=h*2.1&&h>=5){
    const xs=cells.map(p=>p.x),minX=Math.min(...xs),maxX=Math.max(...xs);let top=rng.chance(.5);
    for(let x=minX+3;x<=maxX-3;x+=4+rng.int(0,2)){
      const span=rng.chance(.45)?2:1;
      for(let j=0;j<span;j++){
        const xx=x+j,column=cells.filter(p=>p.x===xx);if(!column.length)continue;const ys=column.map(p=>p.y),y=top?Math.min(...ys):Math.max(...ys),k=idx(s,xx,y),t=s.tiles[k];
        if(protectedSet.has(k)||!plainFloor(t)||roomBase(t.room)!==room||openAround(s,xx,y,1)<5)continue;
        if(tryWall(s,xx,y,room,rng.int(0,15)))cuts++;
      }
      top=!top;
    }
  }else if(h>=w*2.1&&w>=5){
    const ys=cells.map(p=>p.y),minY=Math.min(...ys),maxY=Math.max(...ys);let left=rng.chance(.5);
    for(let y=minY+3;y<=maxY-3;y+=4+rng.int(0,2)){
      const span=rng.chance(.45)?2:1;
      for(let j=0;j<span;j++){
        const yy=y+j,row=cells.filter(p=>p.y===yy);if(!row.length)continue;const xs=row.map(p=>p.x),x=left?Math.min(...xs):Math.max(...xs),k=idx(s,x,yy),t=s.tiles[k];
        if(protectedSet.has(k)||!plainFloor(t)||roomBase(t.room)!==room||openAround(s,x,yy,1)<5)continue;
        if(tryWall(s,x,yy,room,rng.int(0,15)))cuts++;
      }
      left=!left;
    }
  }
  return cuts;
}

function softenRoom(s:GameState,room:string,cells:Point[],rng:Rng,protectedSet:Set<number>){
  let cuts=0,carved=0;const xs=cells.map(p=>p.x),ys=cells.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=maxX-minX+1,h=maxY-minY+1;
  if(w<5||h<5||cells.length<24)return{cuts,carved};
  cuts+=meanderLongRoom(s,room,cells,w,h,rng,protectedSet);
  const corners=[{x:minX,y:minY,sx:1,sy:1},{x:maxX,y:minY,sx:-1,sy:1},{x:minX,y:maxY,sx:1,sy:-1},{x:maxX,y:maxY,sx:-1,sy:-1}];
  for(const c of corners){
    if(!rng.chance(.72))continue;const shape:ReadonlyArray<readonly [number,number]>=rng.chance(.48)?[[0,0],[1,0],[0,1]]:[[0,0],[1,0]];
    for(const [ox,oy] of shape){const x=c.x+ox*c.sx,y=c.y+oy*c.sy,k=idx(s,x,y),t=s.tiles[k];if(protectedSet.has(k)||!plainFloor(t)||openAround(s,x,y,1)<4)continue;if(tryWall(s,x,y,room,rng.int(0,15)))cuts++}
  }
  const edges=edgeCandidates(s,cells).filter(q=>{const {x,y}=q.p,k=idx(s,x,y);if(protectedSet.has(k)||openAround(s,x,y,1)<5)return false;const marginX=Math.min(Math.abs(x-minX),Math.abs(maxX-x)),marginY=Math.min(Math.abs(y-minY),Math.abs(maxY-y));return Math.max(marginX,marginY)>=2});
  for(let n=0;n<Math.min(2,Math.floor((w+h)/18));n++){if(!edges.length)break;const q=edges.splice(rng.int(0,edges.length-1),1)[0]!,k=idx(s,q.p.x,q.p.y),t=s.tiles[k];if(plainFloor(t)&&!protectedSet.has(k)&&tryWall(s,q.p.x,q.p.y,room,rng.int(0,15)))cuts++}
  const pocketEdges=edgeCandidates(s,cells).filter(q=>{const x=q.p.x+q.d.dx,y=q.p.y+q.d.dy;return inside(s,x,y)&&s.tiles[idx(s,x,y)]?.kind==='wall'&&!protectedSet.has(idx(s,q.p.x,q.p.y))});
  if(pocketEdges.length&&rng.chance(.86)){for(let tries=0;tries<Math.min(14,pocketEdges.length);tries++){const q=pocketEdges[rng.int(0,pocketEdges.length-1)]!,made=carvePocket(s,room,q.p,q.d,rng,protectedSet);if(made){carved+=made;break}}}
  return{cuts,carved};
}

export function applyOrganicArchitecture(s:GameState){
  const rng=new Rng((s.seed^Math.imul(s.districtStage,0x45d9f3b)^Math.imul(s.floorInDistrict??1,0x27d4eb2d)^0x51a7c0de)>>>0),protectedSet=protectedCells(s);let cuts=0,carved=0,rooms=0;
  for(const g of groups(s)){const r=softenRoom(s,g.room,g.cells,rng,protectedSet);if(r.cuts||r.carved)rooms++;cuts+=r.cuts;carved+=r.carved}
  s.expansionFlags??=[];s.expansionFlags=s.expansionFlags.filter(f=>!f.startsWith('organic-geometry:'));s.expansionFlags.push(`organic-geometry:${rooms}:${cuts}:${carved}`);updateVisibility(s);return{rooms,cuts,carved};
}
