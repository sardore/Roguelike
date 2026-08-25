import { Rng } from './rng';
import type { GameState, Point, Tile } from './types';
import { updateVisibility } from './world';

const DIRS=[[1,0],[-1,0],[0,1],[0,-1]] as const;
const idx=(s:GameState,x:number,y:number)=>y*s.width+x;
const roomBase=(r?:string)=>(r??'').replace(/-(wall|door|divider|organic-wall)$/,'');
const plain=(t?:Tile)=>!!t&&t.kind==='floor'&&!t.fixture;

function protectedSet(s:GameState){
  const out=new Set<number>(),add=(p:Point,r=1)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(Math.abs(dx)+Math.abs(dy)<=r){const x=p.x+dx,y=p.y+dy;if(x>=0&&y>=0&&x<s.width&&y<s.height)out.add(idx(s,x,y))}};
  add(s.player,2);for(const e of s.enemies)add(e,1);for(const i of s.items)add(i,1);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[idx(s,x,y)];if(t?.fixture||t?.kind==='stairs'||t?.kind==='door')add({x,y},1)}
  return out;
}
function flood(s:GameState){const start=idx(s,s.player.x,s.player.y),seen=new Uint8Array(s.tiles.length),q=[start];seen[start]=1;for(let h=0;h<q.length;h++){const i=q[h]!,x=i%s.width,y=Math.floor(i/s.width);for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.width||ny>=s.height)continue;const ni=idx(s,nx,ny);if(seen[ni]||s.tiles[ni]?.kind==='wall')continue;seen[ni]=1;q.push(ni)}}return{seen,count:q.length}}
function safeWall(s:GameState,x:number,y:number,room:string,variant:number){const k=idx(s,x,y),old=s.tiles[k];if(!plain(old)||roomBase(old?.room)!==room)return false;const before=flood(s),goal=s.tiles.findIndex(t=>t.kind==='stairs'),goalWas=goal>=0&&!!before.seen[goal];s.tiles[k]={kind:'wall',variant,room:`${room}-organic-wall`,discovered:false,visible:false};const after=flood(s),goalNow=goal>=0&&!!after.seen[goal];if(after.count>=before.count-1&&(!goalWas||goalNow))return true;s.tiles[k]=old!;return false}

function grouped(s:GameState){const m=new Map<string,Point[]>();for(let y=1;y<s.height-1;y++)for(let x=1;x<s.width-1;x++){const t=s.tiles[idx(s,x,y)];if(!plain(t)||!t?.room)continue;const r=roomBase(t.room);const a=m.get(r)??[];a.push({x,y});m.set(r,a)}return m}

export function sculptFlowGeometry(s:GameState){
  const rng=new Rng((s.seed^0x73a91e57^Math.imul(s.districtStage,0x27d4eb2d)^Math.imul(s.floorInDistrict??1,0x165667b1))>>>0),protect=protectedSet(s);let changed=0;
  for(const [room,cells] of grouped(s)){
    if(cells.length<28)continue;const xs=cells.map(p=>p.x),ys=cells.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=maxX-minX+1,h=maxY-minY+1;
    if(w>=h*1.9&&h>=6){
      let fromTop=rng.chance(.5);
      for(let x=minX+4;x<=maxX-4;x+=5+rng.int(0,2)){
        const span=rng.chance(.55)?3:2,depth=h>=7&&rng.chance(.72)?2:1;
        for(let sx=0;sx<span;sx++)for(let d=0;d<depth;d++){
          const xx=x+sx,column=cells.filter(p=>p.x===xx);if(!column.length)continue;const cy=column.map(p=>p.y),edge=fromTop?Math.min(...cy):Math.max(...cy),yy=edge+(fromTop?d:-d),k=idx(s,xx,yy);
          if(protect.has(k))continue;if(safeWall(s,xx,yy,room,rng.int(0,15)))changed++;
        }
        fromTop=!fromTop;
      }
    }else if(h>=w*1.9&&w>=6){
      let fromLeft=rng.chance(.5);
      for(let y=minY+4;y<=maxY-4;y+=5+rng.int(0,2)){
        const span=rng.chance(.55)?3:2,depth=w>=7&&rng.chance(.72)?2:1;
        for(let sy=0;sy<span;sy++)for(let d=0;d<depth;d++){
          const yy=y+sy,row=cells.filter(p=>p.y===yy);if(!row.length)continue;const cx=row.map(p=>p.x),edge=fromLeft?Math.min(...cx):Math.max(...cx),xx=edge+(fromLeft?d:-d),k=idx(s,xx,yy);
          if(protect.has(k))continue;if(safeWall(s,xx,yy,room,rng.int(0,15)))changed++;
        }
        fromLeft=!fromLeft;
      }
    }
  }
  s.expansionFlags??=[];s.expansionFlags=s.expansionFlags.filter(f=>!f.startsWith('flow-geometry:'));s.expansionFlags.push(`flow-geometry:${changed}`);updateVisibility(s);return changed;
}
