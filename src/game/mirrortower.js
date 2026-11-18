/* 천면경탑: the cluster of mirror towers under main floor 14 that holds the legendary 천면경 검.
   One plan per run (branchWorld105.mirror105): seven towers of different heights placed at random on a mirror lake.
   Floor 1 is the lake itself; every tower stands there. Each floor above keeps only the towers tall enough to reach it,
   joined by bridges over the void, and the shorter towers show as roofs far below. A tower's stairs lead to the same
   tower one floor up, so the climb follows real towers. Interiors are furnished at random by purpose with the main
   dungeon's shared furniture; walls and floors take one of several existing room styles per tower.
   Ferries (rafts) cross the lake's deep strait on floor 1 and a broken bridge on each floor above (platforms over the void).
   Towers are drawn by the main dungeon renderer; drawTowerStructures adds their height: a roof and a front face while the
   player is outside, which fade when the player steps in, and wall blocks rising above the back wall that always remain. */
const MIRROR_KEEPER=Object.freeze({name:'거울지기',concept57:'천 개의 거울 속에서 손님의 얼굴을 가장 먼저 훔쳐 가던 파경대의 문지기.',hp:150,atk:13,def:6,eva:6,xp:0,boss:true,kind:'spirit',shape:'human',color:'#b4c1c7',bossPattern:'mirrorKeeper105',mirrorKeeper105:true,summonsVanish:true,legendDungeon47:'mirror_blade',legendMob47:true});
// Existing room styles: wall palette key (subthemeWalls970) and floor style key (floorStyle980).
const MIRROR_TOWER_STYLES=Object.freeze([
 Object.freeze({wall:'rumor_moon',floor:'f13_mirror'}),
 Object.freeze({wall:'r5_sanctum',floor:'r5_sanctum'}),
 Object.freeze({wall:'rumor_silk',floor:'r3_silk'}),
 Object.freeze({wall:'r4_storage',floor:'r4_storage'}),
 Object.freeze({wall:'haz_mercury',floor:'f20_hall'})
]);
const MIRROR_TOWER_PURPOSES=Object.freeze(['gallery','library','dressing','shrine','store','bedchamber']);
const MIRROR_TOWER_HEIGHTS=Object.freeze([3,3,2,2,2,1,1]);
const MIRROR_TOWER_FADE=new Map();
function mirrorTowerPlan(){
 const world=state.branchWorld105||(state.branchWorld105={version:1,pages:{}});if(world.mirror105)return world.mirror105;
 const rng=RngService.shop(`${state.runId984||state.runId}|mirror-tower-v2`),ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),W=96,H=72;let towers=[];
 // Place the seven towers apart from each other; start the layout over if one cannot be placed.
 for(let layout=0;layout<400&&towers.length<MIRROR_TOWER_HEIGHTS.length;layout++){
  towers=[];
  for(let tries=0;towers.length<MIRROR_TOWER_HEIGHTS.length&&tries<600;tries++){
   const id=towers.length,keeper=id===0,rx=keeper?11:ri(6,9),ry=keeper?8:ri(5,7),cx=ri(rx+4,W-rx-5),cy=ri(ry+8,H-ry-12);
   if(towers.some(t=>Math.abs(t.cx-cx)<t.rx+rx+6&&Math.abs(t.cy-cy)<t.ry+ry+7))continue;
   towers.push({id,cx,cy,rx,ry,shape:keeper?'oct':['oct','rect','round'][ri(0,2)],height:MIRROR_TOWER_HEIGHTS[id],style:ri(0,MIRROR_TOWER_STYLES.length-1),purpose:MIRROR_TOWER_PURPOSES[ri(0,MIRROR_TOWER_PURPOSES.length-1)],inner:ri(0,3)});
  }
 }
 if(towers.length<MIRROR_TOWER_HEIGHTS.length)throw Error('Mirror tower plan could not place every tower');
 const reach=h=>towers.filter(t=>t.height>=h&&t.id!==0),pick=list=>list[ri(0,list.length-1)];
 world.mirror105={version:2,size:[W,H],towers,stairs:{1:pick(reach(2)).id,2:pick(reach(3)).id}};
 return world.mirror105;
}
function mirrorTowerContains(t,x,y,inset=0){
 const dx=Math.abs(x-t.cx),dy=Math.abs(y-t.cy),rx=t.rx-inset,ry=t.ry-inset;if(dx>rx||dy>ry)return false;
 if(t.shape==='rect')return true;if(t.shape==='round')return (dx/(rx+.5))**2+(dy/(ry+.5))**2<=1;
 return dx/(rx+.5)+dy/(ry+.5)<=1.5;
}
function buildMirrorTower(level){
 const plan=mirrorTowerPlan(),ter=state.branchTerrain105,m=state.map,def=BRANCH_DEFS105.mirror,[W,H]=plan.size;
 if(COLS!==W||ROWS!==H)throw Error('Mirror tower map size');
 state.keyPlan96=null;state.floor2Choice63=null;state.generationInProgress57=true;state.rafts=[];
 state.subthemeWalls970={};state.floorStyle980={};const stairs=ter.towerStairs105={};
 const standing=plan.towers.filter(t=>t.height>=level),ground=level===1?TT.SHALLOW_WATER:TT.VOID;
 const put=(x,y,t)=>{if(x<1||y<1||x>=W-1||y>=H-1)return false;setTerrainTile58(m,x,y,t);return true};
 const inTower=(x,y)=>standing.some(t=>mirrorTowerContains(t,x,y));
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)put(x,y,ground);
 // ---- towers: wall ring, floor and room style
 for(const t of standing){
  const style=MIRROR_TOWER_STYLES[t.style];
  for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++){
   if(!mirrorTowerContains(t,x,y))continue;const key=k(x,y);
   if(mirrorTowerContains(t,x,y,1)){put(x,y,TT.FLOOR);state.floorStyle980[key]=style.floor}else{put(x,y,TT.WALL);state.subthemeWalls970[key]=style.wall}
  }
 }
 const ports=t=>[{x:t.cx,y:t.cy-t.ry,dx:0,dy:-1},{x:t.cx,y:t.cy+t.ry,dx:0,dy:1},{x:t.cx-t.rx,y:t.cy,dx:-1,dy:0},{x:t.cx+t.rx,y:t.cy,dx:1,dy:0}];
 const tracks=new Set(),doors=new Set(),lamps=[];
 // ---- causeways over the lake (floor 1) or bridges over the void (above): a spanning tree plus one loop
 // A route that runs into another tower goes through it: its centre lane opens a door in that tower's ring.
 const lay=(x,y,centre=true)=>{const t=standing.find(t=>mirrorTowerContains(t,x,y));if(!t){put(x,y,TT.STONE_PATH);return}if(centre&&!mirrorTowerContains(t,x,y,1))doors.add(k(x,y))};
 const link=(a,b)=>{
  let best=null;for(const p of ports(a))for(const q of ports(b)){const d=Math.abs(p.x+p.dx-q.x-q.dx)+Math.abs(p.y+p.dy-q.y-q.dy);if(!best||d<best.d)best={p,q,d}}
  const{p,q}=best;doors.add(k(p.x,p.y));doors.add(k(q.x,q.y));
  let x=p.x+p.dx,y=p.y+p.dy;const tx=q.x+q.dx,ty=q.y+q.dy,cells=[{x,y}],step=(nx,ny)=>{x=nx;y=ny;cells.push({x,y})};
  if(p.dx!==0){while(x!==tx)step(x+Math.sign(tx-x),y);while(y!==ty)step(x,y+Math.sign(ty-y))}else{while(y!==ty)step(x,y+Math.sign(ty-y));while(x!==tx)step(x+Math.sign(tx-x),y)}
  // three cells wide, corners included
  for(const c of cells)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)lay(c.x+dx,c.y+dy,!dx&&!dy);
  // lanterns stand on the outer lane of straight runs only
  for(let i=3;i<cells.length-3;i+=7){const c=cells[i],o=cells[i-1],n=cells[i+1],vertical=n.x===c.x;if((o.x===c.x)!==vertical)continue;const side=(i/7|0)%2?1:-1,x=vertical?c.x+side:c.x,y=vertical?c.y:c.y+side;if(m[y]?.[x]===TT.STONE_PATH)lamps.push({x,y})}
  return cells;
 };
 const edges=[],joined=[standing[0]],rest=standing.slice(1);
 while(rest.length){let best=null;for(const a of joined)for(const b of rest){const d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(!best||d<best.d)best={a,b,d}}edges.push([best.a,best.b]);joined.push(best.b);rest.splice(rest.indexOf(best.b),1)}
 if(standing.length>3){let extra=null;for(let i=0;i<standing.length;i++)for(let j=i+1;j<standing.length;j++){const a=standing[i],b=standing[j];if(edges.some(e=>e.includes(a)&&e.includes(b)))continue;const d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(!extra||d<extra.d)extra={a,b,d}}if(extra)edges.push([extra.a,extra.b])}
 const routes=edges.map(([a,b])=>link(a,b));
 // ---- entry pier and the lake strait (floor 1), or a broken bridge (above)
 let up,down=null,bossAt=null;
 if(level===1){
  up={x:W>>1,y:H-4};for(let y=H-6;y<=H-2;y++)for(let x=up.x-2;x<=up.x+2;x++)put(x,y,TT.STONE_PATH);
  let near=null;for(const t of standing){const d=Math.abs(t.cx-up.x)+Math.abs(t.cy+t.ry-up.y);if(!near||d<near.d)near={t,d}}
  const p=ports(near.t)[1];doors.add(k(p.x,p.y));let x=up.x,y=up.y-3;while(y>p.y+1){for(let j=-1;j<=1;j++)lay(x+j,y,!j);y--}while(x!==p.x){x+=Math.sign(p.x-x);for(let j=-1;j<=1;j++)lay(x,y+j,!j)}lay(x,y,true)
  // a deep strait splits the lake; ferries carry walkers across, causeways and towers standing in it are dry crossings
  const sy=Math.floor(H*.5)+(plan.towers[0].cy<H/2?6:-6);
  for(let yy=sy;yy<=sy+3;yy++)for(let xx=1;xx<W-1;xx++)if(!inTower(xx,yy)&&m[yy][xx]!==TT.STONE_PATH)put(xx,yy,TT.WATER);
  for(const fx of [Math.floor(W*.2),Math.floor(W*.5),Math.floor(W*.8)]){if(inTower(fx,sy)||inTower(fx,sy+3))continue;put(fx,sy,TT.RAFT);state.rafts.push({x:fx,y:sy,min:sy,max:sy+3,dir:1,axis:'y',mirrorRaft105:true});for(let yy=sy;yy<=sy+3;yy++)tracks.add(k(fx,yy))}
  // lake life: reeds and lotus on the shallows
  for(let yy=2;yy<H-2;yy++)for(let xx=2;xx<W-2;xx++){if(m[yy][xx]!==TT.SHALLOW_WATER)continue;const h=hash2(xx,yy,9105);if(h<.035)setTerrainTile58(m,xx,yy,TT.REED);else if(h<.05)setTerrainTile58(m,xx,yy,TT.LOTUS_FLOWER)}
 }else{
  // one bridge per floor is broken: a mirror platform shuttles over the gap
  // the gap is the middle of the longest straight run of any bridge, well away from its corners
  let run=[];for(const route of routes){let start=0;for(let i=1;i<=route.length;i++){const straight=i<route.length&&(i-start<2||(route[i].x===route[start].x)===(route[start+1].x===route[start].x)&&(route[i].x===route[start].x||route[i].y===route[start].y));if(!straight){if(i-start>run.length)run=route.slice(start,i);start=i-1}}}
  const seg=run.length>=11?run.slice((run.length>>1)-2,(run.length>>1)+3):[];
  const vertical=seg.length===5&&seg.every(c=>c.x===seg[0].x),horizontal=seg.length===5&&seg.every(c=>c.y===seg[0].y);
  if(vertical||horizontal){
   for(const c of seg)for(let j=-1;j<=1;j++){const x=vertical?c.x+j:c.x,y=vertical?c.y:c.y+j;if(!inTower(x,y))put(x,y,TT.VOID)}
   const a=seg[0],b=seg.at(-1),min=vertical?Math.min(a.y,b.y):Math.min(a.x,b.x),max=vertical?Math.max(a.y,b.y):Math.max(a.x,b.x);
   put(a.x,a.y,TT.RAFT);state.rafts.push({x:a.x,y:a.y,min,max,dir:(vertical?a.y:a.x)===min?1:-1,axis:vertical?'y':'x',under:TT.VOID,mirrorRaft105:true});for(const c of seg)tracks.add(k(c.x,c.y));
  }
  const from=plan.towers.find(t=>t.id===plan.stairs[level-1]);up={x:from.cx,y:from.cy};
 }
 if(level<def.count){const to=plan.towers.find(t=>t.id===plan.stairs[level]);down={x:to.cx+(up.x===to.cx&&up.y===to.cy?2:0),y:to.cy}}
 else bossAt={x:plan.towers[0].cx,y:plan.towers[0].cy};
 for(const key of doors){const[x,y]=key.split(',').map(Number);if(m[y][x]===TT.WALL)put(x,y,TT.DOOR)}
 for(const l of lamps)if(m[l.y][l.x]===TT.STONE_PATH&&!tracks.has(k(l.x,l.y)))setTerrainTile58(m,l.x,l.y,TT.LANTERN_POST);
 // ---- interiors
 const style=t=>MIRROR_TOWER_STYLES[t.style];
 const nearDoor=(x,y)=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(doors.has(k(x+dx,y+dy)))return true;return false};
 const prop=(x,y,t)=>{if(m[y]?.[x]===TT.FLOOR&&!nearDoor(x,y))setTerrainTile58(m,x,y,t)};
 const furnish={
  gallery:i=>i%3?TT.MIRROR:TT.STATUE,
  library:i=>i%3===2?TT.TABLE:TT.BOOK_STACK,
  dressing:i=>[TT.MIRROR,TT.SCREEN,TT.BED,TT.JAR][i%4],
  shrine:i=>[TT.INCENSE_STAND,TT.STATUE,TT.BASIN][i%3],
  store:i=>[TT.RACK,TT.CRATE,TT.JAR][i%3],
  bedchamber:i=>[TT.BED,TT.SCREEN,TT.TABLE,TT.BENCH][i%4]
 };
 for(const t of standing){
  if(t.id===0&&level===def.count){
   // the Keeper's crown: a three-step dais under a ring of columns and mirrors
   for(let y=t.cy-t.ry+1;y<t.cy+t.ry;y++)for(let x=t.cx-t.rx+1;x<t.cx+t.rx;x++){if(m[y][x]!==TT.FLOOR)continue;const d=Math.hypot((x-t.cx)/1.4,y-t.cy);ter.heights[y][x]=d<=2.6?2:d<=5.2?1:0;if(d<=2.6)setTerrainTile58(m,x,y,TT.GILDED_FLOOR)}
   for(let y=t.cy-t.ry+1;y<t.cy+t.ry;y++)if(ter.heights[y][t.cx]>(ter.heights[y+1]?.[t.cx]??0))for(let x=t.cx-1;x<=t.cx+1;x++)stairs[k(x,y)]=true;
   for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=Math.round(t.cx+Math.cos(a)*(t.rx-3)),y=Math.round(t.cy+Math.sin(a)*(t.ry-2.5));prop(x,y,i%2?TT.MIRROR:TT.STONE_PILLAR)}
   for(const[dx,dy]of[[-4,-3],[4,-3],[-4,3],[4,3]])prop(t.cx+dx,t.cy+dy,TT.GOLD_LAMP);
   continue;
  }
  // larger towers get an inner chamber (wall at inset 4, one doorway); the two-lane ambulatory round it carries mirrors and lanterns
  const big=t.rx>=8&&t.ry>=6;
  if(big){
   for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++)if(mirrorTowerContains(t,x,y,4)&&!mirrorTowerContains(t,x,y,5)){put(x,y,TT.WALL);state.subthemeWalls970[k(x,y)]=style(t).wall}
   const[dx,dy]=[[0,-1],[0,1],[-1,0],[1,0]][t.inner];let gx=t.cx,gy=t.cy;while(m[gy+dy]?.[gx+dx]!==TT.WALL&&mirrorTowerContains(t,gx+dx,gy+dy,4))gx+=dx,gy+=dy;gx+=dx;gy+=dy;
   for(let j=-1;j<=1;j++){const x=dy?gx+j:gx,y=dy?gy:gy+j;if(m[y]?.[x]===TT.WALL){put(x,y,j?TT.FLOOR:TT.DOOR);state.floorStyle980[k(x,y)]=style(t).floor}}doors.add(k(gx,gy));
  }
  let i=0;
  for(let y=t.cy-t.ry+2;y<=t.cy+t.ry-2;y++)for(let x=t.cx-t.rx+2;x<=t.cx+t.rx-2;x++){
   if(!mirrorTowerContains(t,x,y,2)||Math.abs(x-t.cx)<=1&&Math.abs(y-t.cy)<=1)continue;
   if(big&&mirrorTowerContains(t,x,y,6)){if((x+y)%2===0&&hash2(x,y,t.id)<.55)prop(x,y,furnish[t.purpose](i++))}
   else if(big&&mirrorTowerContains(t,x,y,3)&&!mirrorTowerContains(t,x,y,4)&&(x+y)%3===0)prop(x,y,hash2(x,y,t.id+7)<.5?TT.MIRROR:TT.LANTERN_POST);
   else if(!big&&mirrorTowerContains(t,x,y,3)&&(x+y)%2===0&&hash2(x,y,t.id)<.4)prop(x,y,furnish[t.purpose](i++));
  }
 }
 // ---- portals, kept clear of furniture
 const portal=(id,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);state.branchPortals105.push({id,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`mirror:${level-1}`,level===1?'mirror':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(down)portal('down',down,`mirror:${level+1}`,'up',`${def.name} ${level+1}층`);
 for(const p of [up,down,bossAt].filter(Boolean))for(const[dx,dy]of DIRS8){const t=m[p.y+dy]?.[p.x+dx];if(t!=null&&t!==TT.WALL&&t!==TT.DOOR&&t!==TT.PORTAL&&tileBlocks(t))setTerrainTile58(m,p.x+dx,p.y+dy,TT.FLOOR)}
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit=down||bossAt;state.stairs={...state.fixedExit};
 // ---- every standing tower, the stairs and the Keeper must be reachable (a ferry's track counts as a crossing)
 const pass=(x,y)=>{const t=m[y]?.[x];return t!=null&&(tracks.has(k(x,y))||!tileBlocks(t)&&![TT.WATER,TT.VOID,TT.LAVA].includes(t))};
 const reach=new Set([k(up.x,up.y)]),queue=[up];for(let q=0;q<queue.length;q++){const p=queue[q];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(reach.has(k(x,y))||!pass(x,y))continue;reach.add(k(x,y));queue.push({x,y})}}
 for(const p of [down,bossAt].filter(Boolean))if(!reach.has(k(p.x,p.y)))throw Error('Mirror tower stairs unreachable');
 for(const t of standing)if(!reach.has(k(t.cx,t.cy+(t.id===0&&level===def.count?0:-1)))&&!reach.has(k(t.cx,t.cy)))throw Error('Mirror tower unreachable '+t.id);
 // ---- population and loot
 const spawn=(name,p)=>{const mon=spawnNamed(name,p,{placementMode:'exact',provenance:'subbranch-random-v3',legendDungeon47:'mirror_blade'});if(mon)mon.branch105='mirror';return mon};
 const pool=['파편 망령','거울 시녀','반영 검객'],free=[];for(const key of reach){const[x,y]=key.split(',').map(Number);if([TT.FLOOR,TT.STONE_PATH,TT.SHALLOW_WATER].includes(m[y][x]))free.push({x,y})}
 const far=p=>Math.hypot(p.x-up.x,p.y-up.y)>8&&(!bossAt||Math.hypot(p.x-bossAt.x,p.y-bossAt.y)>5),take=list=>list.splice(rand(0,list.length-1),1)[0];
 for(const t of standing){if(t.id===0&&level===def.count)continue;const cells=free.filter(p=>mirrorTowerContains(t,p.x,p.y,1)&&far(p));for(let n=0;n<2+(t.rx>=8?1:0)&&cells.length;n++)spawn(pool[rand(0,2)],take(cells));if(cells.length){const p=take(cells);if(t.id%2)dropFloorLoot(p);else PlacementService.placeItem({...clone(naturalFoodPick()),count:1},p,{requireReachable:false})}}
 const outside=free.filter(p=>!inTower(p.x,p.y)&&far(p));for(let n=0;n<3+level&&outside.length;n++)spawn(pool[rand(0,2)],take(outside));
 if(bossAt){const boss=scaledMonster(MIRROR_KEEPER,branchCombatFloor());Object.assign(boss,{x:bossAt.x,y:bossAt.y,guardHome57:{...bossAt},alerted:false});OccupancyService.addMonster(boss)}
}
// Blocks a standing tower rises above this floor (its remaining floors plus the roof storey).
function mirrorTowerRise(t,level=state.branchContext105.level){return Math.max(1,t.height-level+1)+1}
function drawTowerStructures(b,now){
 const plan=state?.branchContext105?.id==='mirror'&&state.branchWorld105?.mirror105;if(!plan)return;
 const level=state.branchContext105.level;
 if(level>1)drawMirrorLakeBelow(b,now,level);
 const p=state.player,dt=Math.min(100,now-(MIRROR_TOWER_FADE.get('t')??now));MIRROR_TOWER_FADE.set('t',now);
 for(const t of plan.towers){
  const standing=t.height>=level,P=SUBTHEME_WALL_COLORS[MIRROR_TOWER_STYLES[t.style].wall],wall=P[0],dark=P[1],cap=colorShift(wall,70);
  if(t.cx+t.rx<b.x0-2||t.cx-t.rx>b.x1+2||t.cy+t.ry<b.y0-2||t.cy-t.ry-6>b.y1+2)continue;
  const cols=[];for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++){let top=null,bottom=null;for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)if(mirrorTowerContains(t,x,y)){top??=y;bottom=y}if(top!=null)cols.push({x,top,bottom})}
  const seen=(x,y)=>state.seen.has(k(x,y)),west=cols[0].x,east=cols.at(-1).x;
  if(!standing){
   // a shorter tower ends below this floor: only its roof shows, far down in the void
   const depth=Math.min(.7,.28*(level-t.height));
   for(const c of cols)for(let y=c.top;y<=c.bottom;y++){if(!seen(c.x,y))continue;drawTowerRoofCell(c.x*TILE,y*TILE,c.x,y,t,wall,dark,cap,y===c.top);X.fillStyle=`rgba(4,6,12,${depth})`;X.fillRect(c.x*TILE,y*TILE,TILE,TILE)}
   continue;
  }
  const rise=mirrorTowerRise(t,level),target=mirrorTowerContains(t,p.x,p.y)?0:1;
  let alpha=MIRROR_TOWER_FADE.get(t.id);alpha=alpha==null?target:alpha+(target-alpha)*Math.min(1,dt/140);MIRROR_TOWER_FADE.set(t.id,alpha);
  // wall blocks rising above the north ring: kept while the roof fades, so the room still reads as tall inside
  for(const c of cols){if(!seen(c.x,c.top))continue;for(let j=1;j<=rise;j++)drawTowerFaceCell(c.x*TILE,(c.top-j)*TILE,c.x,c.top-j,t,wall,dark,cap,j/rise,j===rise,c.x===west,c.x===east,false)}
  if(alpha<=.02)continue;
  X.save();X.globalAlpha=alpha;
  for(const c of cols){
   if(!seen(c.x,c.bottom)&&!seen(c.x,c.top))continue;
   const faceTop=Math.max(c.top,c.bottom-rise+1);
   for(let y=c.top-rise;y<faceTop;y++)drawTowerRoofCell(c.x*TILE,y*TILE,c.x,y,t,wall,dark,cap,y===c.top-rise);
   for(let y=faceTop;y<=c.bottom;y++)drawTowerFaceCell(c.x*TILE,y*TILE,c.x,y,t,wall,dark,cap,(y-faceTop+1)/(c.bottom-faceTop+1),false,c.x===west,c.x===east,y===c.bottom&&state.map[y]?.[c.x]===TT.DOOR);
  }
  X.restore();
 }
}
// Through the void of an upper floor the mirror lake shows far below: dim water with slow ripples, darker the higher the floor.
function drawMirrorLakeBelow(b,now,level){
 for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){
  if(state.map[y]?.[x]!==TT.VOID||!state.seen.has(k(x,y)))continue;const px=x*TILE,py=y*TILE;
  X.fillStyle=`rgba(18,52,60,${.62-.12*level})`;X.fillRect(px,py,32,32);
  const phase=((now/90+x*7+y*13)%64)/64,h=hash2(x,y,4401);
  if(h<.35){X.fillStyle=`rgba(150,205,214,${.10*(1-Math.abs(phase*2-1))})`;X.fillRect(px+4+(h*40|0)%16,py+8+(phase*16|0),10,1)}
 }
}
function drawTowerRoofCell(px,py,x,y,t,wall,dark,cap,ridge){
 X.fillStyle=colorShift(dark,12);X.fillRect(px,py,32,32);
 X.fillStyle=colorShift(wall,-14);for(let i=0;i<32;i+=8)X.fillRect(px,py+i+(x%2?4:0),32,3);
 X.fillStyle='rgba(255,255,255,.05)';X.fillRect(px,py,32,1);
 if(ridge){X.fillStyle=cap;X.fillRect(px,py,32,3)}
 if(x===t.cx&&y===t.cy-t.ry-mirrorTowerRise(t)+Math.max(1,t.ry-1)){X.fillStyle=cap;X.fillRect(px+12,py+4,8,22);X.fillStyle='#e9f4ff';X.fillRect(px+14,py+7,4,11)}
}
function drawTowerFaceCell(px,py,x,y,t,wall,dark,cap,depth,top,west,east,door){
 // the tower's face: courses of its wall colour, bright at the top and darker towards the ground; the side columns a shade darker
 const g=X.createLinearGradient(0,py,0,py+32);g.addColorStop(0,colorShift(wall,Math.round(18-28*depth)));g.addColorStop(1,colorShift(wall,Math.round(4-40*depth)));X.fillStyle=g;X.fillRect(px,py,32,32);
 X.fillStyle=colorShift(dark,-6);for(let yy=7;yy<32;yy+=8)X.fillRect(px,py+yy,32,1);for(let yy=0;yy<32;yy+=8){const off=((yy>>3)+y)%2?0:16;X.fillRect(px+off,py+yy,1,7)}
 if(west||east){X.fillStyle='rgba(0,0,0,.22)';X.fillRect(px,py,32,32);X.fillStyle=cap;X.fillRect(east?px+30:px,py,2,32)}
 if(top){X.fillStyle=cap;X.fillRect(px,py,32,4);X.fillStyle=colorShift(dark,-20);X.fillRect(px,py+4,32,2)}
 else if(!door&&(x+t.id)%3===0&&depth<.85){X.fillStyle='#0d1218';X.beginPath();X.roundRect(px+11,py+6,10,18,[5,5,0,0]);X.fill();X.fillStyle='rgba(233,244,255,.35)';X.fillRect(px+13,py+10,6,12)}
 if(door){X.fillStyle='#0b0f14';X.beginPath();X.roundRect(px+4,py+4,24,28,[11,11,0,0]);X.fill();X.fillStyle=cap;X.fillRect(px+3,py+3,26,2)}
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
