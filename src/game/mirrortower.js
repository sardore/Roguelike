/* 천면경탑: the cluster of glass towers under main floor 14 that holds the legendary 천면경 검.
   One plan per run (branchWorld105.mirror105): seven towers of different heights. Floor 1 is a lake with a dock where
   every tower stands; floor 2 keeps the five taller towers joined by bridges over the clouds with side balconies;
   floor 3 keeps the three tallest, the Mirror Keeper's summit among them. A tower's stairs lead to the same tower one
   floor up. Each tower is carved into a central hall, radial corridors from every entrance (and a ring corridor in the
   large ones), and side rooms cut from what is left, so a tower can be crossed from one bridge to another and its rooms
   are detours. The way on is lit by lamps and an inlaid line; side rooms and balconies hold the loot.
   Layout data for the art (zones, owners, furniture, lights, stairs) is kept in branchTerrain105.mirror105;
   mirrorart.js draws all of it. */
const MIRROR_KEEPER=Object.freeze({name:'거울지기',concept57:'천 개의 거울 속에서 손님의 얼굴을 가장 먼저 훔쳐 가던 파경대의 문지기.',hp:150,atk:13,def:6,eva:6,xp:0,boss:true,kind:'spirit',shape:'human',color:'#b4c1c7',bossPattern:'mirrorKeeper105',mirrorKeeper105:true,summonsVanish:true,legendDungeon47:'mirror_blade',legendMob47:true});
const MIRROR_TOWER_HEIGHTS=Object.freeze([3,3,3,2,2,1,1]);
const MIRROR_TOWER_PURPOSES=Object.freeze(['observatory','display','library']);
const MIRROR_TOWER_WINDOWS=Object.freeze(['arch','round','slit','diamond']);
const MIRROR_TOWER_MOTIFS=Object.freeze(['rings','lattice','stars','waves']);
const MIRROR_TOWER_SIZE=Object.freeze([100,80]);
function mirrorTowerPlan(){
 const world=state.branchWorld105||(state.branchWorld105={version:1,pages:{}});if(world.mirror105?.version===3)return world.mirror105;
 const rng=RngService.shop(`${state.runId984||state.runId}|mirror-tower-v3`),ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),pick=list=>list[ri(0,list.length-1)],[W,H]=MIRROR_TOWER_SIZE;
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
 const reach=h=>towers.filter(t=>t.height>=h&&t.id!==0);
 world.mirror105={version:3,size:[W,H],towers,stairs:{1:pick(reach(2)).id,2:pick(reach(3)).id}};
 return world.mirror105;
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
 const edges=[],joined=[standing[0]],rest=standing.slice(1),dist=(a,b)=>Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);
 while(rest.length){let best=null;for(const a of joined)for(const b of rest)if(!best||dist(a,b)<best.d)best={a,b,d:dist(a,b)};edges.push([best.a,best.b]);joined.push(best.b);rest.splice(rest.indexOf(best.b),1)}
 const loops=level===2?2:level===3?3:1,extra=[];for(let i=0;i<standing.length;i++)for(let j=i+1;j<standing.length;j++){const a=standing[i],b=standing[j];if(!edges.some(e=>e.includes(a)&&e.includes(b)))extra.push({a,b,d:dist(a,b)})}
 extra.sort((u,v)=>u.d-v.d);for(const e of extra.slice(0,standing.length>2?loops:0))edges.push([e.a,e.b]);
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
  if(broken>=breaks||run.length<11)continue;const mid=run.length>>1,seg=run.slice(mid-2,mid+3),vertical=seg[0].x===seg[1].x;
  for(const c of seg)for(let j=-1;j<=1;j++){const x=vertical?c.x+j:c.x,y=vertical?c.y:c.y+j;if(!towerAt(x,y))put(x,y,ground,'.')}
  const a=seg[0],b=seg.at(-1),min=vertical?Math.min(a.y,b.y):Math.min(a.x,b.x),max=vertical?Math.max(a.y,b.y):Math.max(a.x,b.x);
  put(a.x,a.y,TT.RAFT);state.rafts.push({x:a.x,y:a.y,min,max,dir:(vertical?a.y:a.x)===min?1:-1,axis:vertical?'y':'x',under:ground,mirrorRaft105:true});for(const c of seg)tracks.add(k(c.x,c.y));
  run.broken=true;broken++;
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
 for(const key of doors){const[x,y]=key.split(',').map(Number);if(m[y][x]===TT.WALL)put(x,y,TT.DOOR,zone[y][x]==='i'?'c':zone[y][x])}
 // ---- portals
 const portal=(id,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);state.branchPortals105.push({id,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`mirror:${level-1}`,level===1?'mirror':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(down)portal('down',down,`mirror:${level+1}`,'up',`${def.name} ${level+1}층`);
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit=down||bossAt;state.stairs={...state.fixedExit};
 // ---- the way on: shortest walk from arrival to the stairs or the Keeper, inlaid and lit
 const pass=(x,y)=>{const t=m[y]?.[x];return t!=null&&(tracks.has(k(x,y))||!tileBlocks(t)&&![TT.WATER,TT.VOID,TT.LAVA].includes(t))};
 const target=down||bossAt,prev=new Map([[k(up.x,up.y),null]]),queue=[up];
 for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(prev.has(k(x,y))||!pass(x,y))continue;prev.set(k(x,y),k(p.x,p.y));queue.push({x,y})}}
 if(!prev.has(k(target.x,target.y)))throw Error('Mirror tower: the way on is cut');
 const path=[];for(let key=k(target.x,target.y);key;key=prev.get(key))path.unshift(key);
 const onPath=new Set(path);
 for(const key of path){const[x,y]=key.split(',').map(Number);if('chbda'.includes(zone[y][x])&&m[y][x]===TT.FLOOR)zone[y][x]='P'}
 // ---- furniture
 const objects=[],lights=[],taken=new Set();
 const nearAny=(x,y,r,set)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(set.has(k(x+dx,y+dy)))return true;return false};
 const portalCells=new Set([up,down,bossAt].filter(Boolean).map(p=>k(p.x,p.y)));
 const fits=(kind,x,y,againstWall)=>{const s=GLASS_FURNITURE[kind];
  for(let dy=0;dy<s.h;dy++)for(let dx=0;dx<s.w;dx++){const cx=x+dx,cy=y+dy;if(m[cy]?.[cx]!==TT.FLOOR||!'rhcpa'.includes(zone[cy][cx])||onPath.has(k(cx,cy))||tracks.has(k(cx,cy))||nearAny(cx,cy,2,doors)||nearAny(cx,cy,2,portalCells)||nearAny(cx,cy,1,taken))return false}
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
 const reach=new Set([k(up.x,up.y)]),q2=[up];for(let i=0;i<q2.length;i++){const p=q2[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(reach.has(k(x,y))||!pass(x,y))continue;reach.add(k(x,y));q2.push({x,y})}}
 if(!reach.has(k(target.x,target.y)))throw Error('Mirror tower: the way on is blocked');
 for(const r of rooms)if(!r.cells.some(c=>reach.has(k(c.x,c.y))))throw Error('Mirror tower: a side room is sealed');
 for(const b of balconies){let ok=false;for(let y=b.y-2;y<=b.y+2&&!ok;y++)for(let x=b.x-2;x<=b.x+2;x++)if(reach.has(k(x,y))){ok=true;break}if(!ok)throw Error('Mirror tower: a balcony is cut off')}
 ter.mirror105={version:1,zones:zone.map(r=>r.join('')),owner:owner.map(r=>r.join('')),objects,lights,stairs:standing.find(t=>t.stairsAtSummit)?.stairsAtSummit||{}};
 for(const t of standing)delete t.stairsAtSummit;
 // ---- population and loot: rooms and balconies off the way on carry the rewards
 const spawn=(name,p)=>{const mon=spawnNamed(name,p,{placementMode:'exact',provenance:'subbranch-random-v3',legendDungeon47:'mirror_blade'});if(mon)mon.branch105='mirror';return mon};
 const pool=['파편 망령','거울 시녀','반영 검객'],far=p=>Math.hypot(p.x-up.x,p.y-up.y)>8&&(!bossAt||Math.hypot(p.x-bossAt.x,p.y-bossAt.y)>5);
 const open=c=>m[c.y][c.x]===TT.FLOOR&&reach.has(k(c.x,c.y))&&far(c),take=list=>list.splice(rand(0,list.length-1),1)[0];
 for(const r of rooms){const cells=r.cells.filter(open);if(!cells.length)continue;const p=take(cells);if(onPath.has(k(p.x,p.y)))continue;if(rand(0,2))dropFloorLoot(p);else PlacementService.placeItem({...clone(naturalFoodPick()),count:1},p,{requireReachable:false});if(cells.length&&rand(0,1))spawn(pool[rand(0,2)],take(cells))}
 for(const mz of mazes)for(const d of mz.dead.filter((_,i)=>i%3===2)){if(open(d)&&!onPath.has(k(d.x,d.y)))dropFloorLoot(d)}
 for(const mz of mazes){const cells=mz.cells.filter(c=>open(c)&&!onPath.has(k(c.x,c.y)));for(let n=0;n<2&&cells.length;n++)spawn(pool[rand(0,2)],take(cells))}
 for(const b of balconies){const cells=[];for(let y=b.y-2;y<=b.y+2;y++)for(let x=b.x-2;x<=b.x+2;x++)if(open({x,y}))cells.push({x,y});if(cells.length)dropFloorLoot(take(cells))}
 for(const{t,hx,hy}of halls){if(t.id===0&&summit)continue;const cells=[];for(let y=t.cy-hy;y<=t.cy+hy;y++)for(let x=t.cx-hx;x<=t.cx+hx;x++)if(zone[y]?.[x]==='h'||zone[y]?.[x]==='P')cells.push({x,y});const ok=cells.filter(open);for(let n=0;n<1+(t.rx>=9?1:0)&&ok.length;n++)spawn(pool[rand(0,2)],take(ok))}
 const bridge=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(zone[y][x]==='b'||zone[y][x]==='P'&&owner[y][x]==='.')bridge.push({x,y});const ob=bridge.filter(open);for(let n=0;n<2+level&&ob.length;n++)spawn(pool[rand(0,2)],take(ob));
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
 if(t===TT.RAFT)return{name:'유리 발판',desc:'은테를 두른 유리판이 정해진 길을 따라 한 칸씩 오간다. 위에 서 있으면 함께 실려 간다.',hint:'끊긴 다리나 물길을 건널 때 쓴다.'};
 if(t===TT.WATER)return{name:'천면 호수',desc:'하늘빛을 그대로 비추는 깊은 호수. 빠지면 익사한다.',hint:'둑길과 발판으로만 건널 수 있다.'};
 if(t===TT.VOID)return{name:'구름 아래 허공',desc:'다리 난간 너머로 구름이 몇 겹이나 깔려 있다. 그 아래로 낮은 탑들의 지붕이 흐릿하게 보인다.',hint:'걸어서 건널 수 없다.'};
 return null;
}
function mirrorTowerTick(){
 if(state?.branchContext105?.id!=='mirror')return;
 const boss=(state.monsters||[]).find(mon=>mon.mirrorKeeper105&&mon.hp>0);if(!boss)return;
 const ratio=boss.hp/Math.max(1,boss.maxHp),phase=ratio<=.34?2:ratio<=.67?1:0;
 while((boss.mirrorPhase105||0)<phase){
  boss.mirrorPhase105=(boss.mirrorPhase105||0)+1;let born=0;
  for(let i=0;i<2;i++){
   const child=scaledMonster(MIRROR_DUELIST,branchCombatFloor());child.hp=child.maxHp=Math.max(8,Math.round(child.maxHp*.6));
   const q=PlacementService.findMonster(child,{placementMode:'local',origin:boss,radius:5});if(!q)continue;
   Object.assign(child,{x:q.x,y:q.y,bossOwnerId57:combatantId(boss),spawnProvenance57:'summon',branch105:'mirror'});inheritCombatFaction57(child,boss);if(OccupancyService.addMonster(child))born++;
  }
  if(born)addLog(`거울지기의 거울상 ${born}이 거울 속에서 걸어 나왔다.`);
 }
}
function mirrorKeeperDefeated(mon,reward){
 if(!mon.mirrorKeeper105||!reward?.kills||state.branchContext105?.id!=='mirror')return;
 const legend=globalThis.__MANRU_LEGEND47__.defs().find(w=>w.id==='mirror_blade');if(!legend||state.player.weapon?.artifactId46==='mirror_blade')return;
 PlacementService.placeItem({...clone(legend),type:'weapon',artifactId46:'mirror_blade',legendaryWeapon47:true,artifactWeapon46:true,identified:true,count:1},{x:mon.x,y:mon.y});
 addLog('거울지기가 깨어지며 바닥에 천면경 검이 떨어졌다.');
}
