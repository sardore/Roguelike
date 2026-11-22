/* 천면경탑: the cluster of glass towers under main floor 14 that holds the legendary 천면경 검.
   One plan per run (branchWorld105.mirror105): seven towers of different heights. Floor 1 is a lake with a dock where
   every tower stands; floor 2 keeps the five taller towers joined by bridges over the clouds with side balconies;
   floor 3 keeps the three tallest, the Mirror Keeper's summit among them. A tower's stairs lead to the same tower one
   floor up. Each tower is carved into a central hall, radial corridors from every entrance (and a ring corridor in the
   large ones), and side rooms cut from what is left, so a tower can be crossed from one bridge to another and its rooms
   are detours. The way on is lit by lamps and an inlaid line; side rooms and balconies hold the loot.
   Layout data for the art (zones, owners, furniture, lights, stairs) is kept in branchTerrain105.mirror105;
   mirrorart.js draws all of it. */
const MIRROR_KEEPER=Object.freeze({name:'거울지기',concept57:'천 개의 거울 속에서 손님의 얼굴을 가장 먼저 훔쳐 가던 파경대의 문지기.',hp:231,fixedHp:true,balanceVersion57:1,atk:12,def:6,eva:6,xp:0,boss:true,kind:'spirit',shape:'human',spriteScale:1.30,color:'#b4c1c7',bossPattern:'mirrorKeeper105',lightningRodProfile:{bonus:3,scale:1.15,stun:1,stunOnFinal:true},mirrorKeeper105:true,summonsVanish:true,legendDungeon47:'mirror_blade',legendMob47:true});
const MIRROR_TOWER_HEIGHTS=Object.freeze([3,3,3,2,2,1,1]);
const MIRROR_TOWER_PURPOSES=Object.freeze(['observatory','display','library']);
const MIRROR_TOWER_WINDOWS=Object.freeze(['arch','round','slit','diamond']);
const MIRROR_TOWER_MOTIFS=Object.freeze(['rings','lattice','stars','waves']);
// Enemies by floor. Names found in MIRROR_ROSTER_DUNGEON come from that legend dungeon's list, the rest from the main dungeon's.
const MIRROR_ROSTERS=Object.freeze([
 Object.freeze(['거울 시녀','반영 검객','윈도','윈도']),
 Object.freeze(['거울 시녀','반영 검객','파편 망령','공허 가오리']),
 Object.freeze(['거울 시녀','반영 검객','파편 망령','혼백 사냥꾼'])
]);
const MIRROR_ROSTER_DUNGEON=Object.freeze({'거울 시녀':'mirror_blade','반영 검객':'mirror_blade','파편 망령':'mirror_blade','혼백 사냥꾼':'curse_spear'});
const MIRROR_TOWER_SIZE=Object.freeze([100,80]);
function mirrorTowerPlan(){
 const world=state.branchWorld105||(state.branchWorld105={version:1,pages:{}});if(world.mirror105?.version===3)return world.mirror105;
 // Lay the towers out again until both flights of stairs are at least two towers from where the climber arrives.
 let best=null;
 for(let attempt=0;attempt<120;attempt++){
  const plan=mirrorTowerLayout(attempt);if(!best||Math.min(plan.hops[1],plan.hops[2])>Math.min(best.hops[1],best.hops[2]))best=plan;
  if(Math.min(plan.hops[1],plan.hops[2])>=2)break;
 }
 world.mirror105=best;return best;
}
function mirrorTowerLayout(attempt){
 const rng=RngService.shop(`${state.runId984||state.runId}|mirror-tower-v3|${attempt}`),ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),pick=list=>list[ri(0,list.length-1)],[W,H]=MIRROR_TOWER_SIZE;
 let towers=[];
 for(let layout=0;layout<400&&towers.length<MIRROR_TOWER_HEIGHTS.length;layout++){
  towers=[];
  for(let tries=0;towers.length<MIRROR_TOWER_HEIGHTS.length&&tries<700;tries++){
   const id=towers.length,keeper=id===0,rx=keeper?12:ri(7,10),ry=keeper?9:ri(6,8),cx=ri(rx+4,W-rx-5),cy=ri(ry+10,H-ry-17);
   if(towers.some(t=>Math.abs(t.cx-cx)<t.rx+rx+7&&Math.abs(t.cy-cy)<t.ry+ry+8))continue;
   towers.push({id,cx,cy,rx,ry,shape:keeper?'oct':pick(['oct','rect','round']),height:MIRROR_TOWER_HEIGHTS[id],purpose:keeper?'summit':MIRROR_TOWER_PURPOSES[id%3],
    layout:rx>=9?'ring':'radial',mix:keeper?.55:Math.round(rng()*100)/100,window:pick(MIRROR_TOWER_WINDOWS),motif:pick(MIRROR_TOWER_MOTIFS),closed:keeper||rx>=8});
  }
 }
 if(towers.length<MIRROR_TOWER_HEIGHTS.length)throw Error('Mirror tower plan could not place every tower');
 // The stairs stand as many towers away from where the climber arrives as the bridges allow, so the way up is a journey.
 const farthest=(candidates,hops)=>{const best=Math.max(...candidates.map(t=>hops.get(t.id)??0)),far=candidates.filter(t=>(hops.get(t.id)??0)===best);return far[ri(0,far.length-1)]};
 const dock={x:W>>1,y:H-10},arrival=towers.reduce((a,b)=>Math.abs(a.cx-dock.x)+Math.abs(a.cy+a.ry-dock.y)<=Math.abs(b.cx-dock.x)+Math.abs(b.cy+b.ry-dock.y)?a:b);
 const low=towers.filter(t=>t.height>=1),mid=towers.filter(t=>t.height>=2);
 const first=farthest(mid.filter(t=>t.id!==0&&t.id!==arrival.id),mirrorTowerHops(mirrorTowerEdges(low,1),arrival.id));
 const second=farthest(towers.filter(t=>t.height>=3&&t.id!==0&&t.id!==first.id),mirrorTowerHops(mirrorTowerEdges(mid,2),first.id));
 return {version:3,size:[W,H],towers,stairs:{1:first.id,2:second.id},hops:{1:mirrorTowerHops(mirrorTowerEdges(low,1),arrival.id).get(first.id),2:mirrorTowerHops(mirrorTowerEdges(mid,2),first.id).get(second.id)}};
}
// The bridge graph of the towers standing on a floor: nearest-first spanning tree, then the shortest unlinked pairs as loops.
// Pure geometry, so the plan can ask the same question the builder answers.
function mirrorTowerEdges(standing,level){
 const edges=[],joined=[standing[0]],rest=standing.slice(1),dist=(a,b)=>Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);
 while(rest.length){let best=null;for(const a of joined)for(const b of rest)if(!best||dist(a,b)<best.d)best={a,b,d:dist(a,b)};edges.push([best.a,best.b]);joined.push(best.b);rest.splice(rest.indexOf(best.b),1)}
 const loops=level===3?3:1,extra=[];for(let i=0;i<standing.length;i++)for(let j=i+1;j<standing.length;j++){const a=standing[i],b=standing[j];if(!edges.some(e=>e.includes(a)&&e.includes(b)))extra.push({a,b,d:dist(a,b)})}
 extra.sort((u,v)=>u.d-v.d);for(const e of extra.slice(0,standing.length>2?loops:0))edges.push([e.a,e.b]);
 return edges;
}
// Towers crossed to get from one tower to another along those bridges.
function mirrorTowerHops(edges,fromId){
 const hops=new Map([[fromId,0]]),queue=[fromId];
 for(let i=0;i<queue.length;i++)for(const[a,b]of edges){const other=a.id===queue[i]?b.id:b.id===queue[i]?a.id:null;if(other==null||hops.has(other))continue;hops.set(other,hops.get(queue[i])+1);queue.push(other)}
 return hops;
}
// Moving platforms are decks of one cell up to a dozen: each has a footprint, a design and furniture that rides on it.
// `cargo` entries are [kind, along, across]: `across` names the outermost lane the piece stands in and it extends inwards;
// the middle lane is always left clear so the deck can be boarded from the bridge.
// Furniture on a moving deck stands as a standalone solid tile (a prop needs dry floor under it, a deck has none).
const MIRROR_CARGO_TILE=LEGEND_TILES49.mirror_blade.solid;
const MIRROR_PLATFORMS=Object.freeze([
 Object.freeze({id:'slab',name:'유리 발판',across:3,len:2,shape:'rect',cargo:[]}),
 Object.freeze({id:'slab3',name:'넓은 유리 발판',across:3,len:3,shape:'rect',cargo:[['pedestal',1,-1]]}),
 Object.freeze({id:'barge',name:'유리 유람선',across:3,len:4,shape:'rect',cargo:[['lamp',0,-1],['lamp',0,1],['lamp',3,-1],['lamp',3,1]]}),
 Object.freeze({id:'terrace',name:'유리 테라스',across:5,len:3,shape:'rect',cargo:[['bench',0,2],['lectern',2,-2],['pedestal',0,-2],['lamp',2,2]]}),
 Object.freeze({id:'deck',name:'관측 갑판',across:5,len:4,shape:'rect',cargo:[['orrery',1,2],['column',0,-2],['column',3,-2],['lamp',1,-2]]}),
 Object.freeze({id:'plus',name:'꽃잎 발판',across:3,len:3,shape:'plus',cargo:[]}),
 Object.freeze({id:'wide',name:'진열 갑판',across:5,len:3,shape:'rect',cargo:[['cabinet',0,-2],['showcase',1,2],['pedestal',0,-1]]})
]);
function mirrorPlatform(design,axis,x,y,lo,hi,dir,under){
 const half=(design.across-1)/2,cells=[];
 for(let a=0;a<design.len;a++)for(let c=-half;c<=half;c++){if(design.shape==='plus'&&c!==0&&a!==design.len>>1)continue;cells.push(axis==='x'?[a,c]:[c,a])}
 const has=(dx,dy)=>cells.some(o=>o[0]===dx&&o[1]===dy),cargo=[],objects=[];
 for(const[kind,a,c]of design.cargo){
  const s=GLASS_FURNITURE[kind],along=axis==='x'?s.w:s.h,across=axis==='x'?s.h:s.w,cmin=c>0?c-across+1:c,dx0=axis==='x'?a:cmin,dy0=axis==='x'?cmin:a,mine=[];
  let ok=true;for(let i=0;i<s.w;i++)for(let j=0;j<s.h;j++){const cc=axis==='x'?dy0+j:dx0+i;if(!has(dx0+i,dy0+j)||cc===0||cargo.some(q=>q.dx===dx0+i&&q.dy===dy0+j))ok=false;mine.push({dx:dx0+i,dy:dy0+j,tile:MIRROR_CARGO_TILE})}
  if(ok){cargo.push(...mine);objects.push({kind,dx:dx0,dy:dy0,w:s.w,h:s.h})}
 }
 return{x,y,min:lo,max:hi,dir,axis,under,mirrorRaft105:true,design:design.id,across:design.across,len:design.len,footprintCells57:cells,cargo,objects};
}
function mirrorTowerContains(t,x,y,inset=0){
 const dx=Math.abs(x-t.cx),dy=Math.abs(y-t.cy),rx=t.rx-inset,ry=t.ry-inset;if(dx>rx||dy>ry)return false;
 if(t.shape==='rect')return true;if(t.shape==='round')return (dx/(rx+.5))**2+(dy/(ry+.5))**2<=1;
 return dx/(rx+.5)+dy/(ry+.5)<=1.5;
}
// Height of a standing tower above the floor being walked, in wall courses: the same number sets the length of its
// outer face and the courses stacked above its back wall inside.
function mirrorTowerRise(t,level=state.branchContext105.level){return 2+2*Math.max(0,t.height-level)}
function buildMirrorTower(level){
 const plan=mirrorTowerPlan(),ter=state.branchTerrain105,m=state.map,def=BRANCH_DEFS105.mirror,[W,H]=plan.size;
 if(COLS!==W||ROWS!==H)throw Error('Mirror tower map size');
 state.keyPlan96=null;state.floor2Choice63=null;state.generationInProgress57=true;state.rafts=[];
 const zone=Array.from({length:H},()=>Array(W).fill('.')),owner=Array.from({length:H},()=>Array(W).fill('.'));
 const standing=plan.towers.filter(t=>t.height>=level),ground=level===1?TT.WATER:TT.VOID,summit=level===def.count;
 const put=(x,y,t,z)=>{if(x<1||y<1||x>=W-1||y>=H-1)return false;setTerrainTile58(m,x,y,t);if(z)zone[y][x]=z;return true};
 const towerAt=(x,y)=>standing.find(t=>mirrorTowerContains(t,x,y));
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)put(x,y,ground,'.');
 // ---- tower shells
 for(const t of standing)for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++){
  if(!mirrorTowerContains(t,x,y))continue;owner[y][x]=String(t.id);
  if(mirrorTowerContains(t,x,y,1))put(x,y,TT.FLOOR,'r');else put(x,y,TT.WALL,'o');
 }
 const doors=new Set(),tracks=new Set();
 const ports=t=>[{x:t.cx,y:t.cy-t.ry,dx:0,dy:-1},{x:t.cx,y:t.cy+t.ry,dx:0,dy:1},{x:t.cx-t.rx,y:t.cy,dx:-1,dy:0},{x:t.cx+t.rx,y:t.cy,dx:1,dy:0}];
 // ---- bridges (causeways over the lake on floor 1): three cells wide, corners filled; through another tower they open its wall
 const lay=(x,y,z,centre)=>{const t=towerAt(x,y);if(!t){if(m[y]?.[x]===ground||zone[y]?.[x]==='b')put(x,y,TT.FLOOR,z);return}if(centre&&!mirrorTowerContains(t,x,y,1))doors.add(k(x,y))};
 const brush=(cells,z)=>{for(const c of cells)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)lay(c.x+dx,c.y+dy,z,!dx&&!dy)};
 const walk=(sx,sy,tx,ty,xFirst)=>{let x=sx,y=sy;const cells=[{x,y}],step=(nx,ny)=>{x=nx;y=ny;cells.push({x,y})};if(xFirst){while(x!==tx)step(x+Math.sign(tx-x),y);while(y!==ty)step(x,y+Math.sign(ty-y))}else{while(y!==ty)step(x,y+Math.sign(ty-y));while(x!==tx)step(x+Math.sign(tx-x),y)}return cells};
 const link=(a,b)=>{
  let best=null;for(const p of ports(a))for(const q of ports(b)){const d=Math.abs(p.x+p.dx-q.x-q.dx)+Math.abs(p.y+p.dy-q.y-q.dy);if(!best||d<best.d)best={p,q,d}}
  const{p,q}=best;doors.add(k(p.x,p.y));doors.add(k(q.x,q.y));
  const sx=p.x+p.dx,sy=p.y+p.dy,tx=q.x+q.dx,ty=q.y+q.dy;let cells=walk(sx,sy,tx,ty,p.dx!==0);
  if(level===3&&Math.abs(tx-sx)+Math.abs(ty-sy)>14){
   // the summit bridges wind: a jog sideways at each third of the way
   const jog=rand(0,1)?4:-4,horizontal=Math.abs(tx-sx)>=Math.abs(ty-sy),a={x:Math.round(sx+(tx-sx)/3)+(horizontal?0:jog),y:Math.round(sy+(ty-sy)/3)+(horizontal?jog:0)},b={x:Math.round(sx+2*(tx-sx)/3)-(horizontal?0:jog),y:Math.round(sy+2*(ty-sy)/3)-(horizontal?jog:0)};
   const clamp=c=>({x:Math.max(3,Math.min(W-4,c.x)),y:Math.max(3,Math.min(H-4,c.y))}),A=clamp(a),B=clamp(b);
   cells=[...walk(sx,sy,A.x,A.y,horizontal),...walk(A.x,A.y,B.x,B.y,!horizontal).slice(1),...walk(B.x,B.y,tx,ty,horizontal).slice(1)];
  }
  brush(cells,'b');return cells;
 };

 const planLeafPavilion=()=>{
  // Starting points: a tower's spare doorway, or the edge of an existing causeway, each looking straight out into open void.
  const cand=standing.filter(t=>t.id!==0),sources=[];
  for(const t of cand)for(const p of ports(t))if(!doors.has(k(p.x,p.y)))sources.push({...p,door:true});
  for(let y=4;y<H-4;y++)for(let x=4;x<W-4;x++)if(zone[y][x]==='b'&&m[y][x]===TT.FLOOR)for(const[dx,dy]of DIRS4){
   const bx=x-dx,by=y-dy,ox=x+dx,oy=y+dy;if(zone[by]?.[bx]==='b'&&m[oy]?.[ox]===ground&&zone[oy][ox]==='.')sources.push({x,y,dx,dy,door:false});
  }
  sources.sort(()=>rand(-1,1));
  const at=(p,u,v)=>p.dx?{x:p.x+p.dx*u,y:p.y+v}:{x:p.x+v,y:p.y+p.dy*u};
  const span=(a,b)=>{const out=[];for(let u=a;u<=b;u++)for(let v=-1;v<=1;v++)out.push([u,v]);return out};
  const leafCells=[];for(let u=9;u<=11;u++)leafCells.push([u,0]);
  for(let v=-3;v<=3;v++)leafCells.push([12,v]);
  for(const v of[-3,3])for(let u=13;u<=15;u++)leafCells.push([u,v]);
  // behind the pillar the two arcs never meet: each ends in its own arm, with its prize at the corner and its own way out to the ledge
  for(const v of[-3,-2,-1,1,2,3])leafCells.push([16,v]);
  leafCells.push([17,-1],[17,1]);
  const items=[[16,-3],[16,3]],pillar=[];for(let u=13;u<=15;u++)for(let v=-2;v<=2;v++)pillar.push([u,v]);
  const inside=(x,y)=>x>=3&&y>=3&&x<W-3&&y<H-3,free=(x,y)=>inside(x,y)&&m[y][x]===ground&&zone[y][x]==='.'&&!towerAt(x,y);
  const joins=(x,y)=>zone[y]?.[x]==='b'&&m[y]?.[x]===TT.FLOOR;
  for(const p of sources){
   const claim=new Map();let bad=false;
   const add=(x,y,kind)=>{const key=k(x,y);if(bad)return;if(!free(x,y)||claim.has(key)){bad=true;return}claim.set(key,kind)};
   for(const[u,v]of span(1,5)){const c=at(p,u,v);add(c.x,c.y,'b')}
   for(const[u,v]of span(6,8)){const c=at(p,u,v);add(c.x,c.y,'p')}
   for(const[u,v]of leafCells){const c=at(p,u,v);add(c.x,c.y,'leaf')}
   for(const[u,v]of pillar){const c=at(p,u,v);add(c.x,c.y,'pillar')}
   for(const[u,v]of span(18,20)){const c=at(p,u,v);add(c.x,c.y,'p')}
   if(bad)continue;
   // the way out: a three-wide causeway from the far ledge to the nearest existing causeway cell, straight then sideways
   let exit=null;{
    const starts=[at(p,21,0),at(p,19,2),at(p,19,-2)],bridges=[];for(let y=4;y<H-4;y++)for(let x=4;x<W-4;x++)if(joins(x,y))bridges.push({x,y});
    search:for(const end of starts){
     const near=bridges.map(b=>({...b,d:Math.abs(b.x-end.x)+Math.abs(b.y-end.y)})).sort((a,b)=>a.d-b.d).slice(0,120);
     for(const target of near)for(const xFirst of[true,false]){
      const cells=walk(end.x,end.y,target.x,target.y,xFirst),spur=[];let fail=false;
      for(const c of cells){for(let dy=-1;dy<=1&&!fail;dy++)for(let dx=-1;dx<=1;dx++){const x=c.x+dx,y=c.y+dy;if(joins(x,y)||claim.get(k(x,y))==='p')continue;if(claim.has(k(x,y))||!free(x,y)){fail=true;break}spur.push({x,y})}if(fail)break}
      if(!fail&&spur.length){exit=spur;break search}
     }
    }
   }
   if(!exit)continue;
   // nothing else may brush against the leaves, or the fork would have a back door
   const mine=new Set([...claim.keys(),...exit.map(c=>k(c.x,c.y))]);
   const near=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const key=k(x+dx,y+dy);if(!mine.has(key)&&(m[y+dy]?.[x+dx]!==ground||zone[y+dy]?.[x+dx]!=='.'))return true}return false};
   if(leafCells.some(([u,v])=>{const c=at(p,u,v);return near(c.x,c.y)}))continue;
   for(const[key,kind]of claim){const[x,y]=key.split(',').map(Number);
    if(kind==='b'||kind==='p')put(x,y,TT.FLOOR,kind);else if(kind==='pillar')put(x,y,TT.WALL,'i');else{put(x,y,TT.PAPER_BRIDGE,'p');ter.leaves=ter.leaves||{};ter.leafBase=ter.leafBase||{};ter.leaves[key]=true;ter.leafBase[key]=TT.VOID}}
   for(const c of exit)put(c.x,c.y,TT.FLOOR,'b');
   if(p.door)doors.add(k(p.x,p.y));
   return{reward:items.map(([u,v])=>at(p,u,v)),ledges:[at(p,7,0),at(p,19,0)]};
  }
  return null;
 };
 const edges=mirrorTowerEdges(standing,level);

 const routes=edges.map(([a,b])=>link(a,b));
 // ---- arrival: the dock on floor 1, the stair tower above
 let up,down=null,bossAt=null;
 if(level===1){
  const cx=W>>1;for(let y=H-10;y<=H-4;y++)for(let x=cx-6;x<=cx+6;x++)put(x,y,TT.FLOOR,'d');up={x:cx,y:H-6};
  let near=null;for(const t of standing){const d=Math.abs(t.cx-cx)+Math.abs(t.cy+t.ry-(H-10));if(!near||d<near.d)near={t,d}}
  const p=ports(near.t)[1];doors.add(k(p.x,p.y));const cells=walk(cx,H-11,p.x,p.y+1,false);brush(cells,'b');routes.push(cells);
 }else{const from=plan.towers.find(t=>t.id===plan.stairs[level-1]);up={x:from.cx,y:from.cy}}
 if(!summit){const to=plan.towers.find(t=>t.id===plan.stairs[level]);down={x:to.cx+(up.x===to.cx&&up.y===to.cy?2:0),y:to.cy}}
 else bossAt={x:plan.towers[0].cx,y:plan.towers[0].cy};
 // ---- straight runs: broken spans with a ferry or floating platform, and side spurs to balconies
 const runs=[],dir=(a,b)=>a.x===b.x?'v':'h';for(const route of routes){let s=0;for(let i=2;i<=route.length;i++){if(i===route.length||dir(route[i-1],route[i])!==dir(route[s],route[s+1])){if(i-s>=9)runs.push(route.slice(s,i));s=i-1}}}
 runs.sort((a,b)=>b.length-a.length);
 const free=(x,y)=>m[y]?.[x]===ground&&!towerAt(x,y)&&zone[y][x]==='.';
 const breaks=level===1?2:1;let broken=0;
 for(const run of runs){
  if(broken>=breaks)continue;
  const options=MIRROR_PLATFORMS.filter(d=>run.length>=d.len+10).sort(()=>rand(-1,1));
  for(const design of options){
   const G=design.len+4,half=(design.across-1)/2,m0=(run.length-G)>>1,seg=run.slice(m0,m0+G),vertical=seg[0].x===seg[1].x;
   // every cell the platform will ever cover must be open sky or lake, or this very bridge
   let ok=true;for(const c of seg)for(let j=-half;j<=half&&ok;j++){const x=vertical?c.x+j:c.x,y=vertical?c.y:c.y+j,mine=Math.abs(j)<=1&&zone[y][x]==='b';if(towerAt(x,y)||!(mine||(m[y][x]===ground&&zone[y][x]==='.')))ok=false}
   if(!ok)continue;
   for(const c of seg)for(let j=-half;j<=half;j++){const x=vertical?c.x+j:c.x,y=vertical?c.y:c.y+j;put(x,y,ground,'.');tracks.add(k(x,y))}
   const coord=c=>vertical?c.y:c.x,lo=Math.min(...seg.map(coord)),hi=Math.max(...seg.map(coord)),lane=vertical?seg[0].x:seg[0].y,max=hi-(design.len-1),atMin=rand(0,1)===0;
   state.rafts.push(mirrorPlatform(design,vertical?'y':'x',vertical?lane:atMin?lo:max,vertical?(atMin?lo:max):lane,lo,max,atMin?1:-1,ground));
   const raft=state.rafts.at(-1);for(const o of raft.footprintCells57){const cargo=raft.cargo.find(c=>c.dx===o[0]&&c.dy===o[1]);setTerrainTile58(m,raft.x+o[0],raft.y+o[1],cargo?cargo.tile:TT.RAFT)}
   run.broken=true;broken++;break;
  }
 }
 const balconies=[],spurs=level===1?2:level===2?3:1;
 for(const run of runs){
  if(balconies.length>=spurs||run.broken)continue;const c=run[run.length>>1],vertical=run[0].x===run[1].x;
  for(const side of rand(0,1)?[1,-1]:[-1,1]){
   const dx=vertical?side:0,dy=vertical?0:side,len=5,bx=c.x+dx*(len+3),by=c.y+dy*(len+3);let ok=m[c.y+dy]?.[c.x+dx]===TT.FLOOR&&!tracks.has(k(c.x,c.y));
   for(let j=-2;j<=2&&ok;j++){const x=c.x+(vertical?0:j),y=c.y+(vertical?j:0);if(tracks.has(k(x,y)))ok=false}
   for(let i=2;i<=len&&ok;i++)for(let j=-1;j<=1;j++){const x=c.x+dx*i+(vertical?0:j),y=c.y+dy*i+(vertical?j:0);if(!free(x,y))ok=false}
   for(let y=by-2;y<=by+2&&ok;y++)for(let x=bx-2;x<=bx+2;x++)if(!free(x,y))ok=false;
   if(!ok)continue;
   for(let i=2;i<=len;i++)for(let j=-1;j<=1;j++)put(c.x+dx*i+(vertical?0:j),c.y+dy*i+(vertical?j:0),TT.FLOOR,'b');
   for(let y=by-2;y<=by+2;y++)for(let x=bx-2;x<=bx+2;x++)put(x,y,TT.FLOOR,'p');
   balconies.push({x:bx,y:by});break;
  }
 }
 // ---- floor 3: the leaf pavilion. A pillar stands between two sheets of void; leaf bridges wind round it and end in a fork, so the
 // reward on one leaf is paid for with the other. Planned after the ferry gaps so it never joins a causeway that is about to be cut.
 const pavilion=level===3?planLeafPavilion():null;
 // ---- tower interiors
 const rooms=[],halls=[],mazes=[];
 for(const t of standing){
  const keeperTop=t.id===0&&summit,inner=(x,y)=>mirrorTowerContains(t,x,y,1)&&m[y][x]!==TT.WALL;
  if(level===3&&!keeperTop){mazes.push(mirrorTowerMaze(t,m,zone,owner,doors,put));continue}
  const hx=Math.max(2,Math.round(t.rx*(keeperTop?.62:.42))),hy=Math.max(2,Math.round(t.ry*(keeperTop?.62:.42)));
  const inHall=(x,y)=>{const dx=Math.abs(x-t.cx),dy=Math.abs(y-t.cy);return t.shape==='rect'?dx<=hx&&dy<=hy:(dx/(hx+.5))**2+(dy/(hy+.5))**2<=1};
  const corridor=keeperTop?'a':'c';
  for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++){if(!inner(x,y))continue;if(inHall(x,y))zone[y][x]='h';else if(t.layout==='ring'&&!mirrorTowerContains(t,x,y,3))zone[y][x]=corridor}
  // a corridor from every entrance to the hall
  const entrances=[...doors].map(key=>key.split(',').map(Number)).filter(([x,y])=>owner[y][x]===String(t.id));
  for(const[x0,y0]of entrances){
   const[dx,dy]=[[0,1],[0,-1],[1,0],[-1,0]].find(([dx,dy])=>inner(x0+dx,y0+dy))||[0,0];if(!dx&&!dy)continue;
   let x=x0+dx,y=y0+dy;for(let n=0;n<40&&inner(x,y)&&zone[y][x]!=='h';n++){for(let j=-1;j<=1;j++){const xx=dy?x+j:x,yy=dy?y:y+j;if(inner(xx,yy)&&zone[yy][xx]!=='h')zone[yy][xx]=corridor}x+=dx;y+=dy}
  }
  halls.push({t,hx,hy});
  // what is left becomes side rooms: walled where they meet a corridor or the hall, one doorway (two for large rooms)
  const seen=new Set();
  for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++){
   if(!inner(x,y)||zone[y][x]!=='r'||seen.has(k(x,y)))continue;
   const comp=[],stack=[[x,y]];seen.add(k(x,y));
   while(stack.length){const[cx,cy]=stack.pop();comp.push({x:cx,y:cy});for(const[ex,ey]of DIRS4){const nx=cx+ex,ny=cy+ey;if(seen.has(k(nx,ny))||!inner(nx,ny)||zone[ny][nx]!=='r')continue;seen.add(k(nx,ny));stack.push([nx,ny])}}
   const inComp=new Set(comp.map(c=>k(c.x,c.y))),edge=comp.filter(c=>DIRS4.some(([ex,ey])=>inner(c.x+ex,c.y+ey)&&!inComp.has(k(c.x+ex,c.y+ey))));
   const core=comp.filter(c=>!edge.includes(c));
   if(comp.length<16||core.length<6){for(const c of comp)zone[c.y][c.x]=corridor;continue}
   for(const c of edge)put(c.x,c.y,TT.WALL,'i');
   const coreSet=new Set(core.map(c=>k(c.x,c.y))),openings=edge.filter(c=>DIRS4.some(([ex,ey])=>coreSet.has(k(c.x+ex,c.y+ey))&&inner(c.x-ex,c.y-ey)&&zone[c.y-ey][c.x-ex]!=='r'&&m[c.y-ey][c.x-ex]!==TT.WALL));
   if(!openings.length){for(const c of comp){put(c.x,c.y,TT.FLOOR,corridor)}continue}
   const cmx=core.reduce((s,c)=>s+c.x,0)/core.length,cmy=core.reduce((s,c)=>s+c.y,0)/core.length;
   openings.sort((a,b)=>Math.hypot(a.x-cmx,a.y-cmy)-Math.hypot(b.x-cmx,b.y-cmy));
   const opened=[openings[0]];if(core.length>40){const far=openings.reduce((a,b)=>Math.hypot(b.x-openings[0].x,b.y-openings[0].y)>Math.hypot(a.x-openings[0].x,a.y-openings[0].y)?b:a);if(Math.hypot(far.x-openings[0].x,far.y-openings[0].y)>5)opened.push(far)}
   for(const o of opened){put(o.x,o.y,TT.DOOR,'c');doors.add(k(o.x,o.y))}
   rooms.push({t,cells:core,doors:opened});
  }
  if(keeperTop){
   // the summit: a three-step dais under the crown mirror, reached by stairs from the south
   for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++){if(zone[y][x]!=='h')continue;const d=Math.hypot((x-t.cx)/1.4,y-t.cy);ter.heights[y][x]=d<=2.6?2:d<=5.2?1:0}
   const stairs={};for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)if(ter.heights[y][t.cx]>(ter.heights[y+1]?.[t.cx]??0))for(let x=t.cx-1;x<=t.cx+1;x++)stairs[k(x,y)]=true;
   t.stairsAtSummit=stairs;
  }
 }
 // ---- floor 2: the treasure vault is the largest side room
 let vault=null;
 if(level===2){const big=rooms.filter(r=>r.cells.length>=14).sort((a,b)=>b.cells.length-a.cells.length)[0];if(big){vault=big;rooms.splice(rooms.indexOf(big),1);for(const c of big.cells)zone[c.y][c.x]='v'}}
 for(const key of doors){const[x,y]=key.split(',').map(Number);if(m[y][x]===TT.WALL)put(x,y,TT.DOOR,zone[y][x]==='i'?'c':zone[y][x])}
 // ---- portals
 const portal=(id,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);state.branchPortals105.push({id,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`mirror:${level-1}`,level===1?'mirror':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(down)portal('down',down,`mirror:${level+1}`,'up',`${def.name} ${level+1}층`);
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit=down||bossAt;state.stairs={...state.fixedExit};
 // ---- the way on: shortest walk from arrival to the stairs or the Keeper, inlaid and lit
 const walkOptions={directions:DIRS4,tileAt:(x,y)=>{
  if(tracks.has(k(x,y)))return TT.RAFT;
  const tile=m[y]?.[x];
  if(tile===TT.PAPER_BRIDGE)return TT.WALL;
  return [TT.WATER,TT.VOID,TT.LAVA].includes(tile)?TT.WALL:tile;
 }};
 const target=down||bossAt;
 const route=ReachabilityService.playerPath(ReachabilityService.playerSearch(up,{...walkOptions,goal:target}),target);
 if(!route)throw Error('Mirror tower: the way on is cut');
 const path=[up,...route].map(p=>k(p.x,p.y));
 const onPath=new Set(path);
 for(const key of path){const[x,y]=key.split(',').map(Number);if('chbda'.includes(zone[y][x])&&m[y][x]===TT.FLOOR)zone[y][x]='P'}
 // ---- furniture
 const objects=[],lights=[],taken=new Set();
 const nearAny=(x,y,r,set)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(set.has(k(x+dx,y+dy)))return true;return false};
 const portalCells=new Set([up,down,bossAt].filter(Boolean).map(p=>k(p.x,p.y)));
 const fits=(kind,x,y,againstWall)=>{const s=GLASS_FURNITURE[kind];
  for(let dy=0;dy<s.h;dy++)for(let dx=0;dx<s.w;dx++){const cx=x+dx,cy=y+dy;if(m[cy]?.[cx]!==TT.FLOOR||!'rhcpav'.includes(zone[cy][cx])||onPath.has(k(cx,cy))||tracks.has(k(cx,cy))||nearAny(cx,cy,2,doors)||nearAny(cx,cy,2,portalCells)||nearAny(cx,cy,1,taken))return false}
  if(againstWall)for(let dx=0;dx<s.w;dx++)if(m[y-1]?.[x+dx]!==TT.WALL)return false;
  return true};
 const place=(kind,x,y,t,againstWall=false)=>{if(!fits(kind,x,y,againstWall))return false;const s=GLASS_FURNITURE[kind];for(let dy=0;dy<s.h;dy++)for(let dx=0;dx<s.w;dx++){setTerrainTile58(m,x+dx,y+dy,TT.STONE_PILLAR);taken.add(k(x+dx,y+dy))}objects.push({kind,x,y,w:s.w,h:s.h,tower:t?t.id:null});return true};
 const scatter=(cells,kind,t,n,againstWall)=>{const pool=cells.slice();let placed=0;while(pool.length&&placed<n){const c=pool.splice(rand(0,pool.length-1),1)[0];if(place(kind,c.x,c.y,t,againstWall))placed++}return placed};
 const SETS={observatory:{hall:[['orrery',1],['telescope',1],['star_table',1]],wall:['cabinet'],room:['telescope','star_table']},
  display:{hall:[['pedestal',4],['showcase',2]],wall:['cabinet','cabinet'],room:['pedestal','showcase']},
  library:{hall:[['reading_table',2],['lectern',2]],wall:['shelf','shelf'],room:['lectern','reading_table']}};
 for(const{t,hx,hy}of halls){
  const hallCells=[];for(let y=t.cy-hy;y<=t.cy+hy;y++)for(let x=t.cx-hx;x<=t.cx+hx;x++)if(zone[y]?.[x]==='h')hallCells.push({x,y});
  if(t.id===0&&summit){
   place('crown_mirror',t.cx-1,t.cy-hy+1,t);
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,x=Math.round(t.cx+Math.cos(a)*(hx-1)),y=Math.round(t.cy+Math.sin(a)*(hy-1));place(i%2?'lamp':'column',x,y,t)}
   continue;
  }
  for(const[dx,dy]of[[-hx+1,-hy+1],[hx-1,-hy+1],[-hx+1,hy-1],[hx-1,hy-1]])place('column',t.cx+dx,t.cy+dy,t);
  for(const[kind,n]of(SETS[t.purpose]||SETS.display).hall)scatter(hallCells,kind,t,n);
 }
 for(const r of rooms){
  const set=SETS[r.t.purpose]||SETS.display;
  const wallCells=r.cells.filter(c=>m[c.y-1]?.[c.x]===TT.WALL);
  for(const kind of set.wall)scatter(wallCells,kind,r.t,2,true);
  scatter(r.cells,set.room[rand(0,set.room.length-1)],r.t,1);
 }
 for(const b of balconies){place(rand(0,1)?'telescope':'bench',b.x-1,b.y-1,null);place('lamp',b.x+2,b.y-2,null)}
 for(const mz of mazes){
  for(const[x,y]of mz.plaza)if(Math.abs(x-mz.t.cx)===1&&Math.abs(y-mz.t.cy)===1)place('column',x,y,mz.t);
  mz.dead.forEach((d,i)=>{if(i%3===0)place('pedestal',d.x,d.y,mz.t);else if(i%3===1)place('lamp',d.x,d.y,mz.t)});
  for(const c of mz.bends.filter((_,i)=>i%4===0))place('lamp',c.x,c.y,mz.t);
 }
 // lamps along the way on, every few steps, beside the inlaid line
 for(let i=4;i<path.length;i+=6){const[x,y]=path[i].split(',').map(Number);for(const[dx,dy]of DIRS4){const lx=x+dx,ly=y+dy;if(onPath.has(k(lx,ly)))continue;if(place('lamp',lx,ly,mirrorTowerAt(lx,ly,standing))){lights.push({x:lx,y:ly,color:['#bff4ff','#ffd6ec','#ffe8a0'][level-1],r:3.6,power:.26});break}}}
 for(const o of objects)if(o.kind==='lamp'&&!lights.some(l=>l.x===o.x&&l.y===o.y))lights.push({x:o.x,y:o.y,color:['#d9c8ff','#f4b4dc','#c8f0b0'][level-1],r:3.2,power:.22});
 // ---- everything that matters must still be reachable
 const reach=ReachabilityService.playerSearch(up,walkOptions).cells;
 if(!reach.has(k(target.x,target.y)))throw Error('Mirror tower: the way on is blocked');
 // the leaves are not part of any way: once they fall, both ledges of the pavilion must still be on the same network as the stairs
 if(pavilion)for(const c of pavilion.ledges)if(!reach.has(k(c.x,c.y)))throw Error('Mirror tower: the leaf pavilion is cut off once its leaves fall');
 for(const r of rooms)if(!r.cells.some(c=>reach.has(k(c.x,c.y))))throw Error('Mirror tower: a side room is sealed');
 for(const b of balconies){let ok=false;for(let y=b.y-2;y<=b.y+2&&!ok;y++)for(let x=b.x-2;x<=b.x+2;x++)if(reach.has(k(x,y))){ok=true;break}if(!ok)throw Error('Mirror tower: a balcony is cut off')}
 ter.mirror105={version:1,zones:zone.map(r=>r.join('')),owner:owner.map(r=>r.join('')),objects,lights,stairs:standing.find(t=>t.stairsAtSummit)?.stairsAtSummit||{}};
 for(const t of standing)delete t.stairsAtSummit;
 // ---- population and loot: rooms and balconies off the way on carry the rewards
 // Which enemies a floor brings: 윈도 haunts the lake floor, 파편 망령 and 공허 가오리 join above it, 혼백 사냥꾼 hunts the summit floor.
 const spawn=(name,p)=>{const dungeon=MIRROR_ROSTER_DUNGEON[name],mon=spawnNamed(name,p,dungeon?{placementMode:'exact',provenance:'subbranch-random-v3',legendDungeon47:dungeon}:{placementMode:'exact',provenance:'subbranch-random-v3'});if(mon)mon.branch105='mirror';return mon};
 const roster=MIRROR_ROSTERS[level-1],pickEnemy=()=>roster[rand(0,roster.length-1)],far=p=>Math.hypot(p.x-up.x,p.y-up.y)>8&&(!bossAt||Math.hypot(p.x-bossAt.x,p.y-bossAt.y)>5);
 const open=c=>m[c.y][c.x]===TT.FLOOR&&reach.has(k(c.x,c.y))&&far(c),take=list=>list.splice(rand(0,list.length-1),1)[0];
 for(const r of rooms){const cells=r.cells.filter(open);if(!cells.length)continue;const p=take(cells);if(onPath.has(k(p.x,p.y)))continue;if(rand(0,1))dropFloorLoot(p);else PlacementService.placeItem({...clone(naturalFoodPick()),count:rand(1,2)},p,{requireReachable:false});if(cells.length&&rand(0,1))spawn(pickEnemy(),take(cells))}
 // the treasure vault: one exclusive fixed piece and two premium randarts on the gilded floor, watched by two of the floor's own
 if(vault){
  const cells=vault.cells.filter(c=>open(c)&&!onPath.has(k(c.x,c.y))),cx=vault.cells.reduce((n,c)=>n+c.x,0)/vault.cells.length,cy=vault.cells.reduce((n,c)=>n+c.y,0)/vault.cells.length;
  const spots=[];for(const c of cells.slice().sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy)))if(spots.length<3&&spots.every(s=>Math.hypot(s.x-c.x,s.y-c.y)>=2.5))spots.push(c);
  const owned=new Set([...state.player.inventory,state.player.relic,state.player.trinket].filter(Boolean).map(x=>x.name)),exclusive=[...RELICS,...TRINKETS].filter(x=>x.vaultOnly&&!owned.has(x.name)),prizes=[];
  if(exclusive.length)prizes.push({...clone(exclusive[rand(0,exclusive.length-1)])});
  while(prizes.length<3)prizes.push(makeRandart(prizes.length%2?'trinket':'relic',5,{premium:true}));
  spots.forEach((c,i)=>{const item={...prizes[i],count:1,identified:true,curseImmune991:true};PlacementService.placeItem(item,c,{requireReachable:false})});
  const guards=cells.filter(c=>!spots.some(s=>Math.hypot(s.x-c.x,s.y-c.y)<2));for(let n=0;n<2&&guards.length;n++)spawn(pickEnemy(),take(guards));
 }
 if(pavilion){
  const prizes=[makeRandart('relic',5,{premium:true}),makeRandart('trinket',5,{premium:true})];
  pavilion.reward.forEach((c,i)=>PlacementService.placeItem({...prizes[i],count:1,identified:true,curseImmune991:true,choiceGroup:'mirror-leaf'},c,{requireReachable:false}));
 }
 for(const mz of mazes)for(const d of mz.dead.filter((_,i)=>i%3===2)){if(open(d)&&!onPath.has(k(d.x,d.y)))dropFloorLoot(d)}
 for(const mz of mazes){const cells=mz.cells.filter(c=>open(c)&&!onPath.has(k(c.x,c.y)));for(let n=0;n<3&&cells.length;n++)spawn(pickEnemy(),take(cells))}
 for(const b of balconies){const cells=[];for(let y=b.y-2;y<=b.y+2;y++)for(let x=b.x-2;x<=b.x+2;x++)if(open({x,y}))cells.push({x,y});if(cells.length){const p=take(cells);dropFloorLoot(p);if(cells.length)PlacementService.placeItem({...clone(naturalFoodPick()),count:1},take(cells),{requireReachable:false})}}
 for(const{t,hx,hy}of halls){if(t.id===0&&summit)continue;const cells=[];for(let y=t.cy-hy;y<=t.cy+hy;y++)for(let x=t.cx-hx;x<=t.cx+hx;x++)if(zone[y]?.[x]==='h'||zone[y]?.[x]==='P')cells.push({x,y});const ok=cells.filter(open);for(let n=0;n<2+(t.rx>=9?1:0)&&ok.length;n++)spawn(pickEnemy(),take(ok))}
 const bridge=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(zone[y][x]==='b'||zone[y][x]==='P'&&owner[y][x]==='.')bridge.push({x,y});const ob=bridge.filter(open);for(let n=0;n<3+level&&ob.length;n++)spawn(pickEnemy(),take(ob));
 if(bossAt){const boss=scaledMonster(MIRROR_KEEPER,branchCombatFloor());Object.assign(boss,{x:bossAt.x,y:bossAt.y,guardHome57:{...bossAt},alerted:false});OccupancyService.addMonster(boss)}
 state.generationInProgress57=false;
}
// A floor-3 tower carved as a maze: one-cell glass corridors on a two-cell lattice (a few walls knocked through for loops),
// a small plaza at the centre for the stairs, every entrance tunnelled in to the nearest corridor.
function mirrorTowerMaze(t,m,zone,owner,doors,put){
 const inner=(x,y)=>mirrorTowerContains(t,x,y,1),node=(x,y)=>mirrorTowerContains(t,x,y,2)&&(x-t.cx)%2===0&&(y-t.cy)%2===0,cells=[];
 for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++)if(inner(x,y))put(x,y,TT.WALL,'i');
 const carve=(x,y,z='a')=>{put(x,y,TT.FLOOR,z);cells.push({x,y})};
 const start={x:t.cx,y:t.cy},seen=new Set([k(start.x,start.y)]),stack=[start];carve(start.x,start.y);
 const links=[];
 while(stack.length){const c=stack.at(-1),next=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>node(c.x+dx,c.y+dy)&&!seen.has(k(c.x+dx,c.y+dy)));
  if(!next.length){stack.pop();continue}const[dx,dy]=next[rand(0,next.length-1)],n={x:c.x+dx,y:c.y+dy};carve(c.x+dx/2,c.y+dy/2);carve(n.x,n.y);seen.add(k(n.x,n.y));stack.push(n);links.push(k(c.x+dx/2,c.y+dy/2))}
 // a few loops so the maze is not a single tree
 for(const k0 of seen){const[x,y]=k0.split(',').map(Number);for(const[dx,dy]of[[2,0],[0,2]])if(seen.has(k(x+dx,y+dy))&&m[y+dy/2][x+dx/2]===TT.WALL&&rand(0,6)===0)carve(x+dx/2,y+dy/2)}
 const plaza=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){carve(t.cx+dx,t.cy+dy,'h');plaza.push([t.cx+dx,t.cy+dy])}
 for(const key of doors){const[x0,y0]=key.split(',').map(Number);if(owner[y0]?.[x0]!==String(t.id))continue;
  const[dx,dy]=[[0,1],[0,-1],[1,0],[-1,0]].find(([dx,dy])=>inner(x0+dx,y0+dy))||[0,0];if(!dx&&!dy)continue;
  let x=x0+dx,y=y0+dy;for(let n=0;n<30&&inner(x,y);n++){const was=m[y][x];if(was!==TT.WALL)break;carve(x,y);x+=dx;y+=dy}}
 const open=(x,y)=>m[y]?.[x]!=null&&m[y][x]!==TT.WALL,deg=(x,y)=>DIRS4.filter(([dx,dy])=>open(x+dx,y+dy)).length;
 const dead=cells.filter(c=>deg(c.x,c.y)===1&&!(Math.abs(c.x-t.cx)<=1&&Math.abs(c.y-t.cy)<=1)),bends=cells.filter(c=>deg(c.x,c.y)===2&&!(open(c.x-1,c.y)&&open(c.x+1,c.y))&&!(open(c.x,c.y-1)&&open(c.x,c.y+1)));
 return{t,cells,dead,bends,plaza};
}
function mirrorTowerAt(x,y,list){return list.find(t=>mirrorTowerContains(t,x,y))||null}
// Inspect text for the tower's own pieces.
function mirrorTowerInfo(t,x,y){
 const layout=state?.branchTerrain105?.mirror105;if(!layout)return null;
 const o=layout.objects.find(o=>x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h);if(o){const s=GLASS_FURNITURE[o.kind];return{name:s.name,desc:s.desc,hint:''}}
 const deck=glassPlatformAt(x,y);
 if(deck){const piece=(deck.objects||[]).find(o=>x>=deck.x+o.dx&&x<deck.x+o.dx+o.w&&y>=deck.y+o.dy&&y<deck.y+o.dy+o.h);if(piece){const s=GLASS_FURNITURE[piece.kind];return{name:s.name,desc:s.desc+' 발판 위에 놓여 함께 움직인다.',hint:''}}
  const d=MIRROR_PLATFORMS.find(q=>q.id===deck.design);return{name:d?d.name:'유리 발판',desc:'은테를 두른 유리 갑판이 정해진 길을 따라 한 칸씩 오간다. 위에 서 있으면 함께 실려 간다.'+((deck.objects||[]).length?' 위에는 가구가 놓여 있다.':''),hint:'끊긴 다리나 물길을 건널 때 쓴다. 가운데 줄은 늘 비어 있다.'}}
 if(t===TT.WATER)return{name:'천면 호수',desc:'하늘빛을 그대로 비추는 깊은 호수. 빠지면 익사한다.',hint:'둑길과 발판으로만 건널 수 있다.'};
 if(t===TT.VOID)return{name:'구름 아래 허공',desc:'다리 난간 너머로 구름이 몇 겹이나 깔려 있다. 그 아래로 낮은 탑들의 지붕이 흐릿하게 보인다.',hint:'걸어서 건널 수 없다.'};
 return null;
}
const MIRROR_KEEPER_SKILLS=Object.freeze({
 orb:Object.freeze({range:8,hp:6,shock:9,ice:9,shardTurns:3,shardDamage:2,shardChance:.25}),
 sanctuary:Object.freeze({radius:2,turns:6,heal:4,blind:2,weaken:2}),
 blink:Object.freeze({distance:30,cooldown:14})
});
// Each entry is [skill, minimum enemy rounds before the next cast]. An unresolved intent always goes first.
const MIRROR_KEEPER_CYCLES=Object.freeze([
 [['orb',3],['bell',2],['copy',3],['rod',5],['sanctuary',4]],
 [['copy',2],['orb',3],['rod',5],['bell',2],['orb',3],['sanctuary',4]],
 [['rod',5],['orb',3],['sanctuary',4],['orb',3],['copy',2],['bell',2]],
 [['orb',4],['bell',3],['rod',5],['sanctuary',4]]
]);
// The keeper marks the one it has found, and the mark holds until the keeper falls. A marked target that runs thirty cells
// or more away is followed: the keeper shows where it will appear next to them, then goes there.
function mirrorKeeperBlink(mon,target){
 const turn=state.floorTurn;if(turn<(mon.mirrorBlinkNext??0))return false;
 const pos=PlacementService.findMonster(mon,{placementMode:'local',origin:target,radius:5,reachable:true,restrict:c=>Math.max(Math.abs(c.x-target.x),Math.abs(c.y-target.y))>=2});
 if(!pos||!setBossIntent(mon,'mirrorBlink',intentCells(pos.x,pos.y,1),'추적 순간이동 · 표식을 쫓아 거울지기가 이곳에 나타난다',{x:pos.x,y:pos.y}))return false;
 mon.mirrorBlinkNext=turn+MIRROR_KEEPER_SKILLS.blink.cooldown;return true;
}
function mirrorKeeperTurn(mon,target,d){
 const real=!mon.mirrorCopy105&&target===state.player;
 if(real&&targetMarkHeldBy(mon)&&d>=MIRROR_KEEPER_SKILLS.blink.distance&&mirrorKeeperBlink(mon,target))return true;
 if(d>MIRROR_KEEPER_SKILLS.orb.range||!actorDetectedTarget57(mon,target,MIRROR_KEEPER_SKILLS.orb.range))return false;
 if(real&&!targetMarkHeld()){holdTargetMark(mon);floatText(target.x,target.y,'표식','#ff9a8a',12);addLog('거울지기가 당신에게 표식을 새겼다. 거울지기가 쓰러질 때까지 풀리지 않는다.')}
 const ratio=mon.hp/mon.maxHp,phase=mon.mirrorCopy105?3:ratio<=.35?2:ratio<=.70?1:0;
 const cycle=MIRROR_KEEPER_CYCLES[phase],turn=state.floorTurn;
 if(turn<(mon.mirrorNextCast??0))return false;
 if(mon.mirrorCyclePhase!==phase){mon.mirrorCyclePhase=phase;mon.mirrorCycleStep=0;}
 const [skill,delay]=cycle[mon.mirrorCycleStep];
 let cast=false;
 if(skill==='orb'){
  const aim=entityClosestCellTo57(target,mon)||target;
  const path=combatLineCellsR8(mon.x,mon.y,aim.x,aim.y).map(({x,y})=>({x,y}));
  if(path.length)cast=setBossIntent(mon,'mirrorOrb',path,'천명탄 · 구체의 진행 경로에서 벗어나라',{path});
 }else if(skill==='rod'){
  cast=startLightningRod(mon,target);
  if(!cast)return false; // The shared warning budget can delay the cast without reordering the cycle.
 }else if(skill==='bell'){
  soundAlarmBell(mon,combatDepth(mon));cast=true;
 }else if(skill==='copy'){
  cast=spawnMirrorKeeperCopy(mon);
 }else if(skill==='sanctuary'&&!state.tempFields.some(f=>f.kind==='mirrorSanctuary'&&f.ttl>0&&
  f.sourceFaction===entityFaction(mon)&&combatEffectActor(f)?.hp>0)){
  const cells=intentCells(mon.x,mon.y,MIRROR_KEEPER_SKILLS.sanctuary.radius).filter(c=>
   !tileBlocks(state.map[c.y]?.[c.x])&&combatLineCheckR8(mon.x,mon.y,c.x,c.y,{units:false}).ok);
  cast=setBossIntent(mon,'mirrorSanctuary',cells,'빛의 성역 · 빛의 경계 밖으로 이동하라',{x:mon.x,y:mon.y});
 }
 mon.mirrorCycleStep=(mon.mirrorCycleStep+1)%cycle.length;
 if(cast)mon.mirrorNextCast=turn+delay;
 return cast;
}
function spawnMirrorKeeperCopy(mon){
 if(state.monsters.some(m=>m.mirrorCopy105&&m.hp>0&&bossChildOf(m,mon)))return false;
 const copy=scaledMonster({...MIRROR_KEEPER,boss:false,mirrorKeeper105:false,summonsVanish:false},combatDepth(mon));
 const pos=PlacementService.findMonster(copy,{placementMode:'local',origin:mon,radius:2,reachable:true});
 if(!pos)return false;
 Object.assign(copy,pos,{name:'거울지기의 복사본',hp:1,maxHp:1,mirrorCopy105:true,mirrorNextCast:state.floorTurn+3,
  spawnProvenance57:'boss-add',alerted:true});
 adoptBossChild57(copy,mon);
 if(!OccupancyService.addMonster(copy))return false;
 playSummonArrival(mon,copy);addLog('거울지기가 거울에서 자신의 복사본을 불러냈다.');return true;
}
function resolveMirrorKeeperIntent(mon,intent){
 if(intent.type==='mirrorBlink'){
  let {x,y}=intent.data;
  if(!PlacementService.canPlaceEntity(mon,x,y)||OccupancyService.isOccupied(x,y)){const q=PlacementService.findMonster(mon,{placementMode:'local',origin:{x,y},radius:3,reachable:true});if(!q)return;x=q.x;y=q.y}
  impact(mon.x,mon.y,'#fff2c6',5);OccupancyService.move(mon,x,y);impact(x,y,'#fff2c6',6);addLog('거울지기가 표식을 쫓아 순간이동했다.');
  return;
 }
 if(intent.type==='mirrorSanctuary'){
  const {x,y}=intent.data,rule=MIRROR_KEEPER_SKILLS.sanctuary;
  addField('mirrorSanctuary',x,y,rule.turns,intent.cells,{...effectSource57(mon),bornTurn:state.turn});
  impact(x,y,'#fff2c6',5);addLog(`빛의 성역 · ${rule.turns}턴. 적은 회복이 막히고 실명·쇠약에 걸린다.`);
  return;
 }
 const rule=MIRROR_KEEPER_SKILLS.orb,owner=mon.mirrorCopy105?bossOwner(mon,'mirrorKeeper105')||mon:mon;
 const orb={x:mon.x,y:mon.y,name:'천명탄',hp:rule.hp,maxHp:rule.hp,atk:0,def:0,eva:0,xp:0,color:'#b8bcff',
  kind:'construct',shape:'orb',fixed:true,statusImmune:true,combatFixture54:'mirrorOrb',
  mirrorOrbPath:intent.data.path.slice(1),spawnProvenance57:'boss-fixture',rewardPolicy57:{xp:false,drops:false,kills:false}};
 adoptBossChild57(orb,owner);
 const first=intent.data.path[0];
 if(!mirrorOrbCanEnter(orb,first)){explodeMirrorOrb(orb,owner);return;}
 Object.assign(orb,first);
 if(!OccupancyService.addMonster(orb)){explodeMirrorOrb(orb,owner);return;}
 beginForcedMotion(orb,[{x:mon.x,y:mon.y},first]);
}
function mirrorOrbCanEnter(orb,point){
 return !!(point&&cell54(point.x,point.y)&&combatLineCheckR8(orb.x,orb.y,point.x,point.y,{units:false}).ok
  &&PlacementService.monsterCanStand(orb,point.x,point.y));
}
function tickMirrorOrb(orb){
 const next=orb.mirrorOrbPath.shift();
 if(!mirrorOrbCanEnter(orb,next)){orb.hp=0;killMonster(orb);return;}
 const from={x:orb.x,y:orb.y};
 beginForcedMotion(orb,[from,next]);
 if(!OccupancyService.move(orb,next.x,next.y)){orb.hp=0;killMonster(orb);}
}
function explodeMirrorOrb(orb,owner){
 if(!owner)return;
 const {x,y}=orb,rule=MIRROR_KEEPER_SKILLS.orb,cells=[{x,y},...DIRS8.map(([dx,dy])=>({x:x+dx,y:y+dy})).filter(c=>
  cell54(c.x,c.y)&&!tileBlocks(state.map[c.y]?.[c.x])&&combatLineCheckR8(x,y,c.x,c.y,{units:false}).ok)];
 const effect=effectSource57(owner);
 impact(x,y,'#c8bcff',7);burst(x,y,'#e6fdff',22,1.1);
 for(const element of ['shock','ice'])elementAttackFx105(element,cells,orb);
 for(const target of bossAreaTargets(owner,cells)){
  resolveElementDamage57(target,'shock',rule.shock,{effect,contactHandled105:true,source:'천명탄 전격',color:'#a9b6ff'});
  if(target.hp>0)resolveElementDamage57(target,'ice',rule.ice,{effect,contactHandled105:true,source:'천명탄 빙결',color:'#b6f3ff'});
  if(state.dead)break;
 }
 const shards=cells.slice(1);
 if(shards.length)addField('mirrorShards',x,y,rule.shardTurns,shards,{...effect,bornTurn:state.turn});
}
// 천면경 검의 천명탄: a swing at the weapon's longest reach bursts the orb on the target's cell at once. The blast is holy;
// the shards it leaves lie in all eight directions out to five cells (stopped by walls) and use the same field as the Keeper's.
function mirrorBladeOrb(pos){
 const w=state.player.weapon,effect=effectSource57(state.player),rule=MIRROR_KEEPER_SKILLS.orb;
 const blast=[{x:pos.x,y:pos.y},...DIRS8.map(([dx,dy])=>({x:pos.x+dx,y:pos.y+dy})).filter(c=>cell54(c.x,c.y)&&!tileBlocks(state.map[c.y]?.[c.x]))];
 const shards=[];for(const[dx,dy]of DIRS8)for(let i=1;i<=5;i++){const x=pos.x+dx*i,y=pos.y+dy*i;if(!cell54(x,y)||tileBlocks(state.map[y]?.[x])||!combatLineCheckR8(pos.x,pos.y,x,y,{units:false}).ok)break;shards.push({x,y})}
 impact(pos.x,pos.y,'#fff2c2',7);burst(pos.x,pos.y,'#fff6d8',22,1.1);floatText(pos.x,pos.y,'천명탄','#f3dc9a',10);
 elementAttackFx105('holy',blast,state.player);
 for(const target of [...state.monsters].filter(t=>t.hp>0&&effectCanAffect57(effect,t)&&entityFootprintCells57(t).some(c=>blast.some(b=>b.x===c.x&&b.y===c.y)))){
  resolveElementDamage57(target,'holy',Math.max(6,Math.round((w?.atk||9)*1.1)),{effect,contactHandled105:true,source:'천명탄',color:ELEMENT_FX_COLORS105.holy});
  if(state.dead)break;
 }
 if(shards.length)addField('mirrorShards',pos.x,pos.y,rule.shardTurns,shards,{...effect,bornTurn:state.turn});
}
function tickMirrorField(field){
 const owner=combatEffectActor(field);
 if(!(owner?.hp>0))return;
 if(field.kind==='mirrorSanctuary'){
  const rule=MIRROR_KEEPER_SKILLS.sanctuary;
  for(const actor of [state.player,...state.monsters]){
   if(actor.hp<=0||actor.combatFixture54||!field.cells.some(c=>monCovers(actor,c.x,c.y)))continue;
   if(entitiesAllied57(actor,owner)){
    const gain=recoverCombatHealth(actor,rule.heal);
    if(gain)floatText(actor.x,actor.y,'+'+gain,'#f7eead',10);
   }else if(combatTargetValid57(owner,actor)){
    applyCombatStatus(actor,'blind',rule.blind,1,{source:owner});
    applyCombatStatus(actor,'weaken',rule.weaken,1,{source:owner});
   }
  }
  return;
 }
 const rule=MIRROR_KEEPER_SKILLS.orb;
 applyElementField57(field,'holy',rule.shardDamage,{source:'빛 파편',color:'#ddd2ff',onDamage:target=>{
  if(target.hp<=0)return;
  for(const [key,turns] of [['stun',1],['blind',2],['skillSeal',2]])applyCombatStatus(target,key,turns,rule.shardChance,{source:owner});
 }});
}
function mirrorKeeperInventory(mon){
 if(Array.isArray(mon.inventory))return;
 const weapon=adef46('mirror_blade');
 mon.inventory=possesses47('mirror_blade')||claimed47('mirror_blade')?[]:[{...clone(weapon),count:1}];
 mon.inventory.push(...fusionRewardItems('elem_ice',3),{...clone(POTION_BY_KIND.get('heal_small')),count:1});
}
