/* 적연협곡 (적연 용암궁) — four floors under 22F. Height is scenery only: every VOID cell looks down into the canyon
   (drawCanyonDepths), while walking, sight and fights use ordinary tiles. Blink gaps over the drop are optional:
   the way on is always walkable.
   1: rock-island mazes (the fights) joined by long wooden bridges over the canyon (the view), a broken shortcut bridge
   2: forts without roofs on round mesas, rope bridges over basalt spires, lava pools in the yards
   3: a tall, narrow descent: dark lava tunnels and outside cliff ledges in turn; moving platforms cross the drop
   4: an ordinary closed dungeon, crowded and hard, with 적연 지룡 at the far end */
const CANYON_SIZES=Object.freeze([[112,72],[112,76],[60,104],[96,72]]);
// New enemies of the canyon. The art map in render.js names their drawing.
const CANYON_NEW_ENEMIES=Object.freeze([
 Object.freeze({name:'삼족오',concept57:'해를 품고 나는 세 발 까마귀. 날개 끝의 불씨가 상처를 지진다. 피해의 절반은 화염이다.',hp:30,atk:12,def:3,eva:7,xp:14,color:'#2a1c12',shape:'angel',kind:'beast',flying:true,fast:true,attackElement105:'fire',attackElementShare105:.5,resist:{fire:1},spriteScale:1.15}),
 Object.freeze({name:'불씨 망령',concept57:'협곡 바닥에서 피어오른 불씨가 망자의 모양을 이룬다. 멀리서 불덩이를 던지고, 맞은 자리는 잠시 타오른다.',hp:34,atk:13,def:3,eva:5,xp:16,color:'#8a3a20',shape:'angel',kind:'spirit',flying:true,ranged:true,range:6,attackElement105:'fire',attackElementShare105:.75,projectileImpact57:{element:'fire',radius:1,turns:2},resist:{fire:2}}),
 Object.freeze({name:'흑요 수호상',concept57:'굳은 용암을 깎아 세운 수호상. 느리지만 한 번 내리치면 무겁다.',hp:78,atk:17,def:12,eva:0,xp:30,color:'#2a2530',shape:'armor',kind:'construct',heavyHit57:true,resist:{fire:2}})
]);
const CANYON_WYRM=Object.freeze({name:'적연 지룡',concept57:'협곡 바닥의 분화구에 몸을 감은 지룡. 지나간 자리마다 불길이 남는다.',hp:300,fixedHp:true,atk:19,def:9,eva:2,xp:0,color:'#7a2a1a',shape:'void',kind:'beast',footprint:'dragon',reach:3,fireTrail:true,lava:true,resist:{fire:2},miniBoss:true,legendDungeon47:'lava_bow',legendMob47:true});
// Enemies by floor, with weights. 월화 궁수, 재의 감시자, 용암 살라맨더 are the common ones; 월화 궁수 from floor 2.
const CANYON_ROSTERS=Object.freeze([
 [['재의 감시자',3],['용암 살라맨더',3],['삼족오',2],['녹아내린 슬라임',1],['해자 잠복꾼',1],['금령',1]],
 [['월화 궁수',3],['재의 감시자',3],['용암 살라맨더',3],['삼족오',2],['불씨 망령',1],['녹아내린 슬라임',1]],
 [['월화 궁수',3],['재의 감시자',2],['용암 살라맨더',3],['삼족오',2],['공허 가오리',2],['불씨 망령',2]],
 [['월화 궁수',3],['재의 감시자',2],['용암 살라맨더',3],['삼족오',2],['천수 아수라',2],['차원 포식자',2],['흑요 수호상',2]]
]);
const CANYON_LEGEND_NAMES=Object.freeze(['월화 궁수','재의 감시자','용암 살라맨더']);
function canyonDef(name){
 if(CANYON_LEGEND_NAMES.includes(name))return globalThis.__MANRU_LEGEND47__.enemyDefinitions('lava_bow').find(d=>d.name===name)||null;
 return CANYON_NEW_ENEMIES.find(d=>d.name===name)||MONSTERS.find(d=>d.name===name)||null;
}
function canyonSpawn(name,p){
 const def=canyonDef(name);if(!def)return null;
 if(CANYON_LEGEND_NAMES.includes(name)||MONSTERS.some(d=>d.name===name)){const mon=spawnNamed(name,p,CANYON_LEGEND_NAMES.includes(name)?{placementMode:'exact',provenance:'subbranch-random-v3',legendDungeon47:'lava_bow'}:{placementMode:'exact',provenance:'subbranch-random-v3'});if(mon)mon.branch105='canyon';return mon}
 if(OccupancyService.isOccupied(p.x,p.y))return null;
 const mon=scaledMonster(def,branchCombatFloor());Object.assign(mon,{x:p.x,y:p.y,spawnProvenance57:'subbranch-random-v3',branch105:'canyon'});OccupancyService.addMonster(mon);return mon;
}
function canyonPick(level){const list=CANYON_ROSTERS[level-1],total=list.reduce((n,e)=>n+e[1],0);let r=globalThis.__MANRU_RANDOM57__()*total;for(const[name,w]of list){r-=w;if(r<0)return name}return list[0][0]}
function canyonWyrmInventory(mon){
 const weapon=adef46('lava_bow');mon.inventory=possesses47('lava_bow')||claimed47('lava_bow')?[]:[{...clone(weapon),count:1}];
 mon.inventory.push({...clone(POTION_BY_KIND.get('heal_small')),count:2});
}
/* ---------------------------------------------------------------- shared pieces */
function canyonRand(){return globalThis.__MANRU_RANDOM57__()}
// A maze on a two-cell lattice inside a rectangle, limited to the cells `open` accepts; a few extra links make loops.
function canyonMaze(m,x0,y0,x1,y1,open,loops=.12){
 const nodes=[];for(let y=y0+1;y<=y1-1;y+=2)for(let x=x0+1;x<=x1-1;x+=2)if(open(x,y))nodes.push([x,y]);
 const cells=[];if(!nodes.length)return{cells,dead:[]};
 const S=new Set(nodes.map(n=>k(n[0],n[1]))),seen=new Set(),carve=(x,y)=>{setTerrainTile58(m,x,y,TT.FLOOR);cells.push({x,y})};
 const first=nodes[rand(0,nodes.length-1)],stack=[first];carve(...first);seen.add(k(...first));
 while(stack.length){const[cx,cy]=stack[stack.length-1],nb=[[2,0],[-2,0],[0,2],[0,-2]].map(([dx,dy])=>[cx+dx,cy+dy,dx,dy]).filter(([x,y])=>S.has(k(x,y))&&!seen.has(k(x,y)));
  if(!nb.length){stack.pop();continue}const[nx,ny,dx,dy]=nb[rand(0,nb.length-1)];carve(cx+dx/2,cy+dy/2);carve(nx,ny);seen.add(k(nx,ny));stack.push([nx,ny])}
 for(const[x,y]of nodes)for(const[dx,dy]of[[2,0],[0,2]])if(seen.has(k(x,y))&&seen.has(k(x+dx,y+dy))&&m[y+dy/2][x+dx/2]!==TT.FLOOR&&canyonRand()<loops)carve(x+dx/2,y+dy/2);
 const dead=nodes.filter(([x,y])=>seen.has(k(x,y))&&DIRS4.filter(([dx,dy])=>m[y+dy]?.[x+dx]===TT.FLOOR).length===1).map(([x,y])=>({x,y}));
 return{cells,dead};
}
// Tunnel straight from (x,y) in direction (dx,dy) until it meets open floor.
function canyonTunnel(m,x,y,dx,dy,max=30){for(let i=0;i<max;i++){const t=m[y]?.[x];if(t==null)return false;if(i>0&&t===TT.FLOOR)return true;if(t===TT.WALL||t===TT.VOID)setTerrainTile58(m,x,y,TT.FLOOR);x+=dx;y+=dy}return false}
/* ---------------------------------------------------------------- floor builders */
function buildCanyon(level){
 const m=state.map,W=COLS,H=ROWS,ter=state.branchTerrain105,def=BRANCH_DEFS105.canyon;
 state.keyPlan96=null;state.floor2Choice63=null;state.generationInProgress57=true;state.rafts=[];
 const put=(x,y,t)=>{if(x<1||y<1||x>=W-1||y>=H-1)return false;setTerrainTile58(m,x,y,t);return true};
 const fill=(x0,y0,x1,y1,t)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(x,y,t)};
 const tracks=new Set(),deadEnds=[],islets=[],yards=[];
 const built=level===1?canyonIslands(m,W,H,put,fill,deadEnds,islets):level===2?canyonForts(m,W,H,put,fill,deadEnds,islets,yards):level===3?canyonDescent(m,W,H,put,fill,deadEnds,islets,tracks):canyonDepths(m,W,H,put,fill,deadEnds,yards);
 let{up,down,bossAt}=built;
 // ---- portals
 const portal=(id,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);state.branchPortals105.push({id,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`canyon:${level-1}`,level===1?'canyon':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(down)portal('down',down,`canyon:${level+1}`,'up',`${def.name} ${level+1}층`);
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit=down||bossAt;state.stairs={...state.fixedExit};
 // ---- the way on must be walkable (moving platforms count, blink does not)
 const walkOptions={directions:DIRS4,tileAt:(x,y)=>{if(tracks.has(k(x,y)))return TT.RAFT;const t=m[y]?.[x];return [TT.WATER,TT.VOID,TT.LAVA].includes(t)?TT.WALL:t}};
 const target=state.fixedExit,route=ReachabilityService.playerPath(ReachabilityService.playerSearch(up,{...walkOptions,goal:target}),target);
 if(!route)throw Error('Canyon: the way on is cut');
 const onPath=new Set([up,...route].map(p=>k(p.x,p.y))),reach=ReachabilityService.playerSearch(up,walkOptions).cells;
 // ---- furniture: braziers and jars in dead ends and yards, kept off the way on
 const near=(x,y,r,set)=>[...set].some(key=>{const[a,b]=key.split(',').map(Number);return Math.abs(a-x)<=r&&Math.abs(b-y)<=r});
 const portals=new Set([up,down,bossAt].filter(Boolean).map(p=>k(p.x,p.y)));
 const deco=(x,y,t)=>{if(m[y]?.[x]!==TT.FLOOR||onPath.has(k(x,y))||near(x,y,1,portals))return false;const open=DIRS4.filter(([dx,dy])=>m[y+dy]?.[x+dx]===TT.FLOOR).length;if(open>2)return false;setTerrainTile58(m,x,y,t);return true};
 deadEnds.forEach((d,i)=>{if(i%4===1)deco(d.x,d.y,TT.BRAZIER);else if(i%4===3)deco(d.x,d.y,TT.JAR)});
 for(const y of yards)for(const[x,yy,t]of y)deco(x,yy,t);
 // ---- loot: dead ends, blink islets
 const open=c=>m[c.y]?.[c.x]===TT.FLOOR&&!OccupancyService.isOccupied(c.x,c.y),far=c=>Math.hypot(c.x-up.x,c.y-up.y)>8&&(!bossAt||Math.hypot(c.x-bossAt.x,c.y-bossAt.y)>5);
 deadEnds.forEach((d,i)=>{if(i%3===0&&open(d)&&!onPath.has(k(d.x,d.y)))dropFloorLoot(d)});
 for(const isle of islets){const cells=isle.filter(open);for(let n=0;n<2&&cells.length;n++)dropFloorLoot(cells.splice(rand(0,cells.length-1),1)[0]);if(cells.length)PlacementService.placeItem({...clone(naturalFoodPick()),count:1},cells[0],{requireReachable:false})}
 // ---- enemies: spread over everything reachable, packed tighter on the last floor
 const pool=[];for(const key of reach){const[x,y]=key.split(',').map(Number);const c={x,y};if(m[y][x]===TT.FLOOR&&far(c)&&!tracks.has(key))pool.push(c)}
 const want=[24,28,24,46][level-1];for(let n=0,tries=0;n<want&&pool.length&&tries<want*4;tries++){const c=pool.splice(rand(0,pool.length-1),1)[0];if(canyonSpawn(canyonPick(level),c))n++}
 if(bossAt){const boss=scaledMonster(CANYON_WYRM,branchCombatFloor());Object.assign(boss,{x:bossAt.x,y:bossAt.y,guardHome57:{...bossAt},alerted:false,branch105:'canyon',canyonWyrm105:true,spawnProvenance57:'subbranch-random-v3'});canyonWyrmInventory(boss);OccupancyService.addMonster(boss)}
 ter.canyon105={version:1,level};
 state.generationInProgress57=false;
}
// Floor 1: six rock islands carved into mazes, chained by long bridges; a seventh bridge (the shortcut) is broken.
function canyonIslands(m,W,H,put,fill,deadEnds,islets){
 const isles=[[4,4,26,26],[44,3,68,24],[86,6,108,30],[80,44,104,68],[42,46,66,68],[4,44,28,68]].map(([x0,y0,x1,y1],i)=>{const j=i?rand(-2,2):0;return{x0:x0+j,y0:y0+j,x1:x1+j,y1:y1+j,i}});
 const inside=(t,x,y,inset=0)=>{if(x<t.x0+inset||x>t.x1-inset||y<t.y0+inset||y>t.y1-inset)return false;const r=4,cx=Math.max(t.x0+r,Math.min(t.x1-r,x)),cy=Math.max(t.y0+r,Math.min(t.y1-r,y));return Math.hypot(x-cx,y-cy)<=r-inset+.4};
 for(const t of isles){for(let y=t.y0;y<=t.y1;y++)for(let x=t.x0;x<=t.x1;x++)if(inside(t,x,y))put(x,y,TT.WALL);
  const mz=canyonMaze(m,t.x0+1,t.y0+1,t.x1-1,t.y1-1,(x,y)=>inside(t,x,y,2),.14);deadEnds.push(...mz.dead);
  // two open chambers in each maze
  for(let n=0;n<2;n++){const cx=rand(t.x0+5,t.x1-5),cy=rand(t.y0+5,t.y1-5);for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(inside(t,x,y,2))put(x,y,TT.FLOOR)}}
 const centre=t=>{let best=null;const cx=(t.x0+t.x1)/2,cy=(t.y0+t.y1)/2;for(let y=t.y0;y<=t.y1;y++)for(let x=t.x0;x<=t.x1;x++)if(m[y][x]===TT.FLOOR){const d=Math.hypot(x-cx,y-cy);if(!best||d<best.d)best={x,y,d}}return{x:best.x,y:best.y}};
 // a bridge three cells wide between two islands, doors tunnelled into each maze; `gap` leaves a hole in the middle
 const bridge=(a,b,gap=0)=>{
  const horiz=a.x1<b.x0||b.x1<a.x0;
  if(horiz){const L=a.x1<b.x0?a:b,R=L===a?b:a,lo=Math.max(L.y0,R.y0)+5,hi=Math.min(L.y1,R.y1)-5,y=rand(lo,hi);let xa=L.x1;while(m[y][xa]!==TT.WALL)xa--;let xb=R.x0;while(m[y][xb]!==TT.WALL)xb++;
   for(let x=xa+1;x<xb;x++)for(let d=-1;d<=1;d++)if(m[y+d][x]===TT.VOID)put(x,y+d,TT.WOOD_FLOOR);
   if(gap){const mid=(xa+xb)>>1;for(let x=mid-1;x<mid-1+gap;x++)for(let d=-1;d<=1;d++)put(x,y+d,TT.VOID)}
   canyonTunnel(m,xa,y,-1,0);canyonTunnel(m,xb,y,1,0);
  }else{const T=a.y1<b.y0?a:b,B=T===a?b:a,lo=Math.max(T.x0,B.x0)+5,hi=Math.min(T.x1,B.x1)-5,x=rand(lo,hi);let ya=T.y1;while(m[ya][x]!==TT.WALL)ya--;let yb=B.y0;while(m[yb][x]!==TT.WALL)yb++;
   for(let y=ya+1;y<yb;y++)for(let d=-1;d<=1;d++)if(m[y][x+d]===TT.VOID)put(x+d,y,TT.WOOD_FLOOR);
   if(gap){const mid=(ya+yb)>>1;for(let y=mid-1;y<mid-1+gap;y++)for(let d=-1;d<=1;d++)put(x+d,y,TT.VOID)}
   canyonTunnel(m,x,ya,0,-1);canyonTunnel(m,x,yb,0,1);
  }};
 for(let i=0;i<5;i++)bridge(isles[i],isles[i+1]);
 bridge(isles[5],isles[0],3);
 // islets in the open drop, three cells from the nearest bridge or island: reached only by blinking
 const freeVoid=(x,y,r)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(m[y+dy]?.[x+dx]!==TT.VOID)return false;return true};
 const nearWalk=(x,y)=>{for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const t=m[y+dy]?.[x+dx];if(t===TT.WOOD_FLOOR)return true}return false};
 for(let n=0,tries=0;n<4&&tries<400;tries++){const x=rand(6,W-7),y=rand(6,H-7);if(!freeVoid(x,y,4)||!nearWalk(x,y))continue;const cells=[];for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++){put(xx,yy,TT.FLOOR);cells.push({x:xx,y:yy})}islets.push(cells);n++}
 return{up:centre(isles[0]),down:centre(isles[5])};
}
// Floor 2: round mesas with roofless forts (a curtain wall, gates, an inner ward), spires joined by rope bridges.
function canyonForts(m,W,H,put,fill,deadEnds,islets,yards){
 const mesas=[{x:16,y:58,r:12},{x:48,y:40,r:13},{x:90,y:18,r:11},{x:92,y:58,r:12}].map(q=>({...q,x:q.x+rand(-2,2),y:q.y+rand(-2,2)}));
 const spires=[{x:64,y:28,r:2},{x:74,y:22,r:2}];
 const disc=(c,x,y,inset=0)=>Math.hypot(x-c.x,y-c.y)<=c.r-inset+(vnoise(x*.4,y*.4)-.5)*1.6;
 for(const c of[...mesas,...spires])for(let y=c.y-c.r-2;y<=c.y+c.r+2;y++)for(let x=c.x-c.r-2;x<=c.x+c.r+2;x++)if(disc(c,x,y))put(x,y,TT.FLOOR);
 // bridges: wide planks between mesas, one-cell rope bridges on the spire chain
 const span=(a,b,width,gap=0)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)),cells=[];let px=null,py=null;for(let i=0;i<=n;i++){const x=Math.round(a.x+(b.x-a.x)*i/n),y=Math.round(a.y+(b.y-a.y)*i/n);if(px!==null&&x!==px&&y!==py)cells.push({x,y:py,i});cells.push({x,y,i});px=x;py=y}
  const mid=n>>1;for(const c of cells){if(gap&&c.i>=mid-1&&c.i<mid-1+gap)continue;for(let dy=-width;dy<=width;dy++)for(let dx=-width;dx<=width;dx++){if(Math.abs(dx)+Math.abs(dy)>width)continue;if(m[c.y+dy]?.[c.x+dx]===TT.VOID)put(c.x+dx,c.y+dy,TT.WOOD_FLOOR)}}};
 span(mesas[0],mesas[1],1);span(mesas[1],spires[0],0);span(spires[0],spires[1],0);span(spires[1],mesas[2],0);span(mesas[2],mesas[3],1);span(mesas[1],mesas[3],1,3);
 // forts: a curtain wall a few cells in from the rim, opened wherever a bridge comes in; an inner ward with its own gate
 for(const c of mesas){const ring=[],R=c.r-3;
  for(let y=c.y-R-1;y<=c.y+R+1;y++)for(let x=c.x-R-1;x<=c.x+R+1;x++){const d=Math.hypot(x-c.x,y-c.y);if(d>R-.5&&d<=R+.5&&m[y][x]===TT.FLOOR)ring.push({x,y})}
  for(const q of ring){let gate=false;for(let dy=-3;dy<=3&&!gate;dy++)for(let dx=-3;dx<=3;dx++){const t=m[q.y+dy]?.[q.x+dx];if(t===TT.WOOD_FLOOR){gate=true;break}}
   const ang=Math.atan2(q.y-c.y,q.x-c.x);if(!gate&&Math.abs(Math.sin(ang*2))>.12)put(q.x,q.y,TT.WALL)}
  // inner ward: a square ring with one gate, braziers in its corners, racks and tables along its walls
  const s=Math.max(3,Math.floor(R*.45)),gx=rand(0,3);
  for(let y=c.y-s;y<=c.y+s;y++)for(let x=c.x-s;x<=c.x+s;x++){if(x!==c.x-s&&x!==c.x+s&&y!==c.y-s&&y!==c.y+s)continue;const gate=(gx===0&&y===c.y-s&&Math.abs(x-c.x)<=1)||(gx===1&&y===c.y+s&&Math.abs(x-c.x)<=1)||(gx===2&&x===c.x-s&&Math.abs(y-c.y)<=1)||(gx===3&&x===c.x+s&&Math.abs(y-c.y)<=1);if(!gate)put(x,y,TT.WALL)}
  const yard=[];for(const[dx,dy]of[[1,1],[-1,1],[1,-1],[-1,-1]])yard.push([c.x+dx*(s-1),c.y+dy*(s-1),TT.BRAZIER]);
  for(let i=-s+2;i<=s-2;i+=2){yard.push([c.x+i,c.y-s+1,i%4?TT.RACK:TT.TABLE]);yard.push([c.x-s+1,c.y+i,TT.JAR])}
  // a lava pool between the walls, away from the gates
  const a=canyonRand()*Math.PI*2,px=Math.round(c.x+Math.cos(a)*(R-1.5)),py=Math.round(c.y+Math.sin(a)*(R-1.5));for(let y=py-1;y<=py+1;y++)for(let x=px-1;x<=px+1;x++)if(m[y]?.[x]===TT.FLOOR&&Math.hypot(x-px,y-py)<1.3)yard.push([x,y,TT.LAVA]);
  for(let i=0;i<6;i++){const b=canyonRand()*Math.PI*2,rr=R+1.5,x=Math.round(c.x+Math.cos(b)*rr),y=Math.round(c.y+Math.sin(b)*rr);yard.push([x,y,i%2?TT.ROCK:TT.LANTERN_POST])}
  yards.push(yard);
 }
 // side spires off the rope bridges, three cells out: blink islets
 for(const sp of spires){const x=sp.x+(rand(0,1)?6:-6),y=sp.y+rand(-1,1)*5;let ok=true;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(m[y+dy]?.[x+dx]!==TT.VOID)ok=false;if(!ok)continue;const cells=[];for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++){put(xx,yy,TT.FLOOR);cells.push({x:xx,y:yy})}islets.push(cells)}
 const spot=c=>{for(let r=0;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=c.x+dx,y=c.y+dy;if(m[y]?.[x]===TT.FLOOR&&Math.hypot(dx,dy)>3)return{x,y}}return{x:c.x,y:c.y}};
 return{up:spot(mesas[0]),down:spot(mesas[3])};
}
// Floor 3: a vertical descent. Tunnel bands (mazes in the rock, lava seeping into the dead ends) alternate with cliff bands
// (ledges on both canyon walls, the drop between). Each cliff band is crossed by a moving platform or a narrow arch.
function canyonDescent(m,W,H,put,fill,deadEnds,islets,tracks){
 const bands=[['t',1,14],['c',15,26],['t',27,44],['c',45,56],['t',57,74],['c',75,86],['t',87,H-2]];
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(x<=5||x>=W-6)put(x,y,TT.WALL);
 const tunnels=[],sideOf=i=>i%2?'R':'L';
 bands.forEach(([kind,y0,y1],i)=>{
  if(kind==='t'){fill(1,y0,W-2,y1,TT.WALL);const mz=canyonMaze(m,2,y0,W-3,y1,()=>true,.10);deadEnds.push(...mz.dead);
   // lava seeps into a third of the dead ends and into walls beside long corridors
   mz.dead.forEach((d,j)=>{if(j%3===2)put(d.x,d.y,TT.LAVA)});
   for(const c of mz.cells)if(canyonRand()<.05)for(const[dx,dy]of DIRS4){const x=c.x+dx,y=c.y+dy;if(m[y]?.[x]===TT.WALL&&x>2&&x<W-3&&y>y0&&y<y1){put(x,y,TT.LAVA);break}}
   tunnels.push({y0,y1});
  }else{
   // ledges two cells wide on both walls
   for(let y=y0;y<=y1;y++){put(6,y,TT.FLOOR);put(7,y,TT.FLOOR);put(W-8,y,TT.FLOOR);put(W-7,y,TT.FLOOR)}
   const ly=y0+5+rand(-1,1);
   if(i===3){// a narrow stone arch stepping across
    let x=8,y=ly;while(x<W-8){put(x,y,TT.STONE_PATH);if(canyonRand()<.3&&y<y1-1&&y>y0+1){y+=rand(0,1)?1:-1;put(x,y,TT.STONE_PATH)}x++}
   }else{// a moving platform over the drop
    const lo=8,hi=W-9;for(let x=lo;x<=hi;x++)for(let d=-1;d<=1;d++)tracks.add(k(x,ly+d));
    const cells=[];for(let a=0;a<2;a++)for(let c=-1;c<=1;c++)cells.push([a,c]);
    const atMin=rand(0,1)===0,raft={x:atMin?lo:hi-1,y:ly,min:lo,max:hi-1,dir:atMin?1:-1,axis:'x',under:TT.VOID,design:'slab',across:3,len:2,footprintCells57:cells,cargo:[],objects:[],canyonRaft105:true};
    state.rafts.push(raft);for(const[dx,dy]of cells)setTerrainTile58(m,raft.x+dx,raft.y+dy,TT.RAFT);
   }
   // blink islet hanging in the drop, off the crossing
   const iy=ly+(ly-y0>5?-4:4),ix=(W>>1)+rand(-4,4);const cells=[];for(let yy=iy-1;yy<=iy;yy++)for(let xx=ix-1;xx<=ix+1;xx++){if(m[yy]?.[xx]===TT.VOID&&!tracks.has(k(xx,yy))){put(xx,yy,TT.FLOOR);cells.push({x:xx,y:yy})}}if(cells.length)islets.push(cells);
  }
 });
 // joints: every tunnel is entered from the right-hand ledge above and left by the left-hand ledge below, so each cliff band must be crossed
 bands.forEach(([kind,y0,y1],i)=>{
  if(kind!=='t')return;
  if(i>0){canyonTunnel(m,W-8,y0,0,1);canyonTunnel(m,W-7,y0,0,1)}
  if(i<bands.length-1){canyonTunnel(m,6,y1,0,-1);canyonTunnel(m,7,y1,0,-1)}
 });
 const near=(y,side)=>{for(let r=0;r<10;r++)for(const dy of[r,-r])for(let x=side==='L'?2:W-3;side==='L'?x<W-2:x>1;x+=side==='L'?1:-1){if(m[y+dy]?.[x]===TT.FLOOR)return{x,y:y+dy}}return null};
 return{up:near(3,'L')||{x:3,y:3},down:near(H-4,'R')||{x:W-4,y:H-4}};
}
// Floor 4: a closed dungeon of rooms and corridors, crowded; 적연 지룡 waits in the largest room at the far end.
function canyonDepths(m,W,H,put,fill,deadEnds,yards){
 fill(1,1,W-2,H-2,TT.WALL);
 const rooms=[];for(let tries=0;tries<600&&rooms.length<18;tries++){const w=rand(6,12),h=rand(5,9),x=rand(2,W-w-3),y=rand(2,H-h-3);if(rooms.some(r=>x<r.x+r.w+2&&r.x<x+w+2&&y<r.y+r.h+2&&r.y<y+h+2))continue;rooms.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)})}
 // a large hall for the wyrm, farthest to the right
 {const w=16,h=12,x=W-w-3,y=(H-h)>>1;for(let i=rooms.length-1;i>=0;i--){const r=rooms[i];if(x<r.x+r.w+2&&r.x<x+w+2&&y<r.y+r.h+2&&r.y<y+h+2)rooms.splice(i,1)}rooms.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1),hall:true})}
 for(const r of rooms)fill(r.x,r.y,r.x+r.w-1,r.y+r.h-1,TT.FLOOR);
 rooms.sort((a,b)=>a.cx-b.cx);
 const dig=(a,b)=>{let x=a.cx,y=a.cy;const xf=canyonRand()<.5;const step=(nx,ny)=>{x=nx;y=ny;if(m[y][x]===TT.WALL)put(x,y,TT.FLOOR)};if(xf){while(x!==b.cx)step(x+Math.sign(b.cx-x),y);while(y!==b.cy)step(x,y+Math.sign(b.cy-y))}else{while(y!==b.cy)step(x,y+Math.sign(b.cy-y));while(x!==b.cx)step(x+Math.sign(b.cx-x),y)}};
 // a spanning chain by nearest neighbour, then a few loops
 const linked=[rooms[0]],rest=rooms.slice(1);while(rest.length){let best=null;for(const a of linked)for(const b of rest){const d=Math.abs(a.cx-b.cx)+Math.abs(a.cy-b.cy);if(!best||d<best.d)best={a,b,d}}dig(best.a,best.b);linked.push(best.b);rest.splice(rest.indexOf(best.b),1)}
 for(let n=0;n<4;n++){const a=rooms[rand(0,rooms.length-1)],b=rooms[rand(0,rooms.length-1)];if(a!==b&&!a.hall&&!b.hall)dig(a,b)}
 // lava pools in some rooms, braziers and jars along walls
 for(const r of rooms){if(r.hall||r===rooms[0])continue;const yard=[];if(canyonRand()<.4&&r.w>=8&&r.h>=7)for(let y=r.cy-1;y<=r.cy+1;y++)for(let x=r.cx-1;x<=r.cx+1;x++)yard.push([x,y,TT.LAVA]);
  yard.push([r.x,r.y,TT.BRAZIER],[r.x+r.w-1,r.y,TT.BRAZIER],[r.x,r.y+r.h-1,TT.JAR]);yards.push(yard);
  for(const[x,y]of[[r.x+1,r.y+1],[r.x+r.w-2,r.y+r.h-2]])deadEnds.push({x,y})}
 const hall=rooms.find(r=>r.hall);for(const[dx,dy]of[[2,2],[-2,2],[2,-2],[-2,-2]]){const x=dx>0?hall.x+dx:hall.x+hall.w-1+dx,y=dy>0?hall.y+dy:hall.y+hall.h-1+dy;yards.push([[x,y,TT.BRAZIER]])}
 const first=rooms[0];
 return{up:{x:first.cx,y:first.cy},down:null,bossAt:{x:hall.cx+2,y:hall.cy}};
}
// value noise for mesa rims
function vnoise(x,y){const h=(a,b)=>{let n=(a*374761393+b*668265263)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296};const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,s=t=>t*t*(3-2*t);const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*s(fx)+(c-a)*s(fy)+(a-b-c+d)*s(fx)*s(fy)}
/* ---------------------------------------------------------------- the view down: drawn under every VOID cell */
let CANYON_DEPTH_TILE=null;
function canyonDepthTile(){
 if(CANYON_DEPTH_TILE)return CANYON_DEPTH_TILE;const S=512,c=document.createElement('canvas');c.width=c.height=S;const q=c.getContext('2d');
 const g=q.createLinearGradient(0,0,0,S);g.addColorStop(0,'#2a0d09');g.addColorStop(1,'#1a0806');q.fillStyle=g;q.fillRect(0,0,S,S);
 // terraces of rock falling away: dark bands with lit lips
 for(let i=0;i<14;i++){const y=(i*37+((i*53)%19))%S,h=10+(i*7)%14;q.fillStyle=i%2?'rgba(70,34,26,.55)':'rgba(40,18,14,.6)';q.beginPath();q.moveTo(0,y);for(let x=0;x<=S;x+=16)q.lineTo(x,y+Math.sin(x/S*Math.PI*2*3+i)*6);q.lineTo(S,y+h);q.lineTo(0,y+h);q.closePath();q.fill();q.strokeStyle='rgba(220,120,70,.18)';q.lineWidth=1;q.beginPath();q.moveTo(0,y);for(let x=0;x<=S;x+=16)q.lineTo(x,y+Math.sin(x/S*Math.PI*2*3+i)*6);q.stroke()}
 // the lava river winding through the bottom, with a glow
 q.save();q.globalCompositeOperation='lighter';q.lineCap='round';for(const[w,col]of[[34,'rgba(255,90,30,.07)'],[14,'rgba(255,110,40,.22)'],[5,'rgba(255,190,110,.45)']]){q.strokeStyle=col;q.lineWidth=w;q.beginPath();for(let y=-20;y<=S+20;y+=8){const a=y/S*Math.PI*2,x=S*.5+Math.sin(a*2)*110+Math.sin(a*6)*20;y<0?q.moveTo(x,y):q.lineTo(x,y)}q.stroke()}q.restore();
 // basalt specks
 for(let i=0;i<260;i++){const x=(i*97)%S,y=(i*61+((i*i)%37))%S;q.fillStyle=i%3?'rgba(20,10,8,.5)':'rgba(140,70,40,.35)';q.fillRect(x,y,2+(i%3),2)}
 CANYON_DEPTH_TILE=c;return c;
}
function drawCanyonDepths(cam,now){
 const tile=canyonDepthTile(),W=VIEW.w,H=VIEW.h,z=cam.zoom||1;
 // far below: the canyon floor drifts slowly against the bridges (parallax), then red haze between
 X.save();const s=.7,ox=((cam.x*.35)%(512*s)+512*s)%(512*s),oy=((cam.y*.35)%(512*s)+512*s)%(512*s);
 for(let y=-oy-512*s;y<H;y+=512*s)for(let x=-ox-512*s;x<W;x+=512*s)X.drawImage(tile,Math.round(x),Math.round(y),Math.round(512*s)+1,Math.round(512*s)+1);
 const g=X.createRadialGradient(W/2,H/2,H*.1,W/2,H/2,H*.9);g.addColorStop(0,'rgba(120,30,18,.18)');g.addColorStop(1,'rgba(10,3,2,.55)');X.fillStyle=g;X.fillRect(0,0,W,H);
 X.globalCompositeOperation='lighter';for(let i=0;i<60;i++){const x=((i*131+now*.02*(1+i%3))%W+W)%W,y=H-((i*71+now*.03*(1+i%2))%H);X.fillStyle=`rgba(255,${140+(i*7)%90},60,${.25+(i%4)*.1})`;X.fillRect(x,y,2,i%3?2:3)}
 X.restore();
}
// The rim of a ledge over the drop: a lit lip on the edge and a short dark face falling into the canyon.
function drawCanyonCell(t,px,py,x,y){
 if(t===TT.VOID){const above=state.map[y-1]?.[x];if(above!=null&&above!==TT.VOID&&above!==TT.RAFT){const g=X.createLinearGradient(0,py,0,py+22);g.addColorStop(0,'rgba(60,30,22,.95)');g.addColorStop(1,'rgba(20,8,6,0)');X.fillStyle=g;X.fillRect(px,py,32,22)}return true}
 return false;
}
