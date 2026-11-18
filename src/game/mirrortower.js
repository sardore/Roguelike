/* 천면경탑: the three-floor tower under main floor 14 that holds the legendary 천면경 검.
   Each floor is a hand-drawn glyph map laid by the grand-terrain stamper (stampGrandGlyphs), so every piece of furniture is
   the main dungeon's own (mirrors, statues, colonnades, lanterns, incense, screens, beds, shelves, basins) and the whole
   tower is drawn by the main dungeon renderer of floor 14 (BRANCH_DEFS105.mirror.mainRender).
   Tower glyphs on top of the shared legend: < up portal, > down portal, K the Keeper, d/D dais of height 1/2 (gilded floor),
   ^ stairs down from a dais, % a mirror ferry on the water, 1 a guard, $ loot.
   Floor 1 crosses its nave pool on a vertical ferry; floor 2 is a hall of four lanes of opposed ferries; floor 3 is a ferry
   band and the Keeper's tiered arena. */
const MIRROR_KEEPER=Object.freeze({name:'거울지기',concept57:'천 개의 거울 속에서 손님의 얼굴을 가장 먼저 훔쳐 가던 파경대의 문지기.',hp:150,atk:13,def:6,eva:6,xp:0,boss:true,kind:'spirit',shape:'human',color:'#b4c1c7',bossPattern:'mirrorKeeper105',mirrorKeeper105:true,summonsVanish:true,legendDungeon47:'mirror_blade',legendMob47:true});
const MIRROR_TOWER_PLANS=Object.freeze([
 Object.freeze({ground:TT.MOON_STONE,room:TT.CARPET,dais:'.',rows:["#################################################","#################################################","#################################################","#################################################","#RRRXRRRXRRj#L..G.X...........X.G..L#jRRXRRRXRRR#","#RBRRRRRRRRR#.S.dXddDDDD>DDDDddXd.S.#RRRRRRRRRBR#","#RRRRRoRRRRR#...ddddDDD^^^DDDdddd...#RRRRRoRRRRR#","#RRRRRRRRtRR+X..dddGdddddddddGddd..X+RRtRRRRRRRR#","#RBRR1RRRbRR#...didddd^^^^^ddddid...#RRbRRR1RRBR#","#RRRRRoRRRRR#..j.................j..#RRRRRoRRRRR#","#RRRRRRRRRRR#.S...i..G.....G..i...S.#RRRRRRRRRRR#","#jRRRRRRRR$R#.......................#R$RRRRRRRRj#","##+################L.........L################+##","#RRRR##############~~~~~%~~~~~##############RRRR#","#kRRL##############~~~~~~~~~~~##############LRRk#","#RRRR##############~~~~~~~~~~~##############RRRR#","#kRtR##############~~~~~~~~~~~##############RtRk#","#RRbR##############L.........L##############RbRR#","#kRRR#................ccccc................#RRRk#","#R1RR#.L.P...P...P..S.ccccc.S..P...P...P.L.#RR1R#","#kRRR#X....b...b.....iccccci.....b...b....X#RRRk#","#RRRR#....1...........ccccc...........1....#RRRR#","#kRtR#...P...P...P..G.ccccc.G..P...P...P...#RtRk#","#RRbR#..o.........o...ccccc...o.........o..#RbRR#","#kRRR#X...............ccccc...............X#RRRk#","#RRRR+...P.W.P.i.P..1.ccccc.1..P.i.P.W.P...+RRRR#","#kRRR#................ccccc................#RRRk#","#RRRR#..o.........o...ccccc...o.........o..#RRRR#","#kRtR#X..P...P...P..G.ccccc.G..P...P...P..X#RtRk#","#RRbR#..........1.....ccccc.....1..........#RbRR#","#k$RR#.....b...b.....iccccci.....b...b.....#RR$k#","#RRRR#.L.P...P...P..S.ccccc.S..P...P...P.L.#RRRR#","#RRRR#................ccccc................#RRRR#","##+##################ccccccc##################+##","#RSRRRSRRRSR#...L.....ccccc.....L...#RSRRRSRRRSR#","#RRRRR1RRRRR#.S.......ccccc.......S.#RRRRR1RRRRR#","#RRRiRRRiRRR+.........ccccc.........+RRRiRRRiRRR#","#RRRRRWRRRRR#.....1...ccccc...1.....#RRRRRWRRRRR#","#RRRRRRRRRRR#X........ccccc........X#RRRRRRRRRRR#","######+######.........ccccc.........######+######","#aRaRaRaRaRa#.........cc<cc.........#aRaRaRaRaRa#","#RRRRRRRRR$R#.S....i..ccccc..i....S.#R$RRRRRRRRR#","#RnRjRRRnRRR#...L.....ccccc.....L...#RRRnRRRjRnR#","#################################################"]}),
 Object.freeze({ground:TT.WOOD_FLOOR,room:TT.DARK_WOOD,dais:'.',rows:["#################################################","#################################################","#################################################","#################################################","#XRBRRBRj#.S..X.ddddDDDD>DDDDdddd.X..S.#jRBRRBRX#","#RRRRRRRR#......ddddDDD^^^DDDdddd......#RRRRRRRR#","#R1RRRRRR#......ddddddddddddddddd......#RRRRRR1R#","#oRRRRRRR+...i..dddddd^^^^^dddddd..i...+RRRRRRRo#","#RRRtRRRR#.............................#RRRRtRRR#","#RRRbRRRR#.S...1..G...........G..1...S.#RRRRbRRR#","#RRRRRR$R#.............................#R$RRRRRR#","#####################ccccccc#####################","####.L.....S.....L..XcccccccX..L.....S.....L.####","####....1............ccccccc............1....####","####....F.....b......ccccccc......b.....F....####","####~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~####","####...............ff.......ff...............####","####..L...F...X...1...b...b...1...X...F...L..####","####.........................................####","####~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~####","####.........................................####","#RR#.X..bff.1.F..L...i..G..i...L..F.1.ffb..X.#RR#","#kR#.........................................#Rk#","#RR#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#RR#","#kR#.........................................#Rk#","#R1#.F.f..b..L..1..X.ff.S.ff.X..1..L..b..f.F.#1R#","#kR#.........................................#Rk#","#RR#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#RR#","#kR#.................ccccccc.................#Rk#","#RR#........$.F......ccccccc......F.$........#RR#","#kR#..t...t........S.ccccccc.S........t...t..#Rk#","#RR#..b...b......o...ccccccc...o......b...b..#RR#","#kR+....1............ccccccc............1....+Rk#","#RR#..........i......ccccccc......i..........#RR#","#Rj#.L..F........L...ccccccc...L........F..L.#jR#","##############.......ccccccc.......##############","#aRaRaRRRRRRR#S......ccccccc......S#RRRRRRRaRaRa#","#RRRRRRRRRiRR#.......ccccccc.......#RRiRRRRRRRRR#","#RRRRRRRRRRRR#.X.....ccccccc.....X.#RRRRRRRRRRRR#","#RRRRRRWRRRRR+....1..ccccccc..1....+RRRRRWRRRRRR#","#RRRRRRRRRRRR#.......ccc<ccc.......#RRRRRRRRRRRR#","#RRRRR1RRRRRR#S......ccccccc......S#RRRRRR1RRRRR#","#nRnRRRRRRR$R#..L....ccccccc....L..#R$RRRRRRRnRn#","#################################################"]}),
 Object.freeze({ground:TT.DARK_WOOD,room:TT.MOON_STONE,dais:'R',rows:["#################################################","#################################################","#################################################","#################################################","################.....G.....G.....################","##############....X...........X....##############","############...i.................i...############","###########..G...X......d......X...G..###########","#########..b.......ddddddddddd.......b..#########","#RRR####.........diGdddddddddGid.........####RRR#","#SRR####..1P...ddddddddddddddddddd...P1..####RRS#","#RRR###..L....ddddddddddddddddddddd....L..###RRR#","#iRR###.......diddddddDDDDDddddddid.......###RRi#","#RRR###......ddddddddDDDDDDDdddddddd......###RRR#","#R1R+...SX...dXdddddDDDDKDDDDdddddXd...XS...+R1R#","#RRR###......ddddddddDDDDDDDdddddddd......###RRR#","#WRR###.......diddddddDDDDDddddddid.......###RRW#","#RRR###..L....ddddddddd^^^ddddddddd....L..###RRR#","#RRj####..1P...ddddddddddddddddddd...P1..####jRR#","#RRR####.........diGdddddddddGid.........####RRR#","#########..b.......ddd^^^^^ddd.......b..#########","###########..G...X......d......X...G..###########","############.........................############","##############.....................##############","################.....ccccccc.....################","#####################ccccccc#####################","####.L.......S.....................S.......L.####","####..............1.X.......X.1..............####","####.........................................####","####~~~~%~~~~~~~~~~~~~~~%~~~~~~~~~~~~~~~%~~~~####","####~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~####","####~~~~~~~~~~~~%~~~~~~~~~~~~~~~%~~~~~~~~~~~~####","####.................ccccccc.................####","####........1........ccccccc........1........####","####.L....$..........ccccccc..........$....L.####","#############........ccccccc........#############","#aRaRRRRRRRR#.S......ccccccc......S.#RRRRRRRRaRa#","#RRRRRRRRRRR#........ccccccc........#RRRRRRRRRRR#","#RRRRRRRRtRR#.....1..ccccccc..1.....#RRtRRRRRRRR#","#RRRRRRRRbRR+........ccccccc........+RRbRRRRRRRR#","#RRRRR1RRRRR#........ccc<ccc........#RRRRR1RRRRR#","#RRRRRRRRRRR#.S......ccccccc......S.#RRRRRRRRRRR#","#nRRRjRRRR$R#...L....ccccccc....L...#R$RRRRjRRRn#","#################################################"]})
]);
const MIRROR_TOWER_LANES=Object.freeze([[4,12],[13,21],[22,26],[27,35],[36,44]]);
function buildMirrorTower(level){
 const plan=MIRROR_TOWER_PLANS[level-1],ter=state.branchTerrain105,m=state.map,def=BRANCH_DEFS105.mirror;
 state.keyPlan96=null;state.floor2Choice63=null;state.generationInProgress57=true;state.rafts=[];
 const heights=ter.heights,stairs=ter.towerStairs105={},marks={spawns:[],loot:[],ferries:[]};let up=null,down=null,bossAt=null;
 // Read the tower glyphs, then hand the shared legend to the stamper.
 const rows=plan.rows.map((row,y)=>[...row].map((ch,x)=>{
  if(ch==='<'){up={x,y};return 'c'}
  if(ch==='>'){down={x,y};heights[y][x]=2;return 'g'}
  if(ch==='K'){bossAt={x,y};heights[y][x]=2;return 'g'}
  if(ch==='d'||ch==='D'){heights[y][x]=ch==='d'?1:2;return ch==='d'?plan.dais:'g'}
  if(ch==='^'){stairs[k(x,y)]=true;return plan.rows[y-1][x]==='d'?plan.dais:'g'}
  if(ch==='%'){marks.ferries.push({x,y});return '~'}
  if(ch==='1'){marks.spawns.push({x,y});return '.'}
  if(ch==='$'){marks.loot.push({x,y});return '.'}
  return ch;
 }).join(''));
 for(const key of Object.keys(stairs)){const[x,y]=key.split(',').map(Number);heights[y][x]=heights[y-1][x]}
 plan.rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(GRAND_VAULT_PROP[ch]===undefined)return;heights[y][x]=Math.min(...DIRS4.map(([dx,dy])=>heights[y+dy]?.[x+dx]??0))}));
 stampGrandGlyphs(rows,0,0,plan.ground,plan.room);
 // Mirror ferries: vertical ones span their water column; floor 2 runs one per lane segment, neighbours opposed.
 for(const p of marks.ferries){let min=p.y,max=p.y;while(m[min-1]?.[p.x]===TT.WATER)min--;while(m[max+1]?.[p.x]===TT.WATER)max++;setTerrainTile58(m,p.x,p.y,TT.RAFT);state.rafts.push({x:p.x,y:p.y,min,max,dir:p.y===min?1:-1,axis:'y',mirrorRaft105:true})}
 if(level===2)for(let y=1,lane=0;y<ROWS-1;y++){
  if(!MIRROR_TOWER_LANES.every(([a,b])=>m[y][a]===TT.WATER&&m[y][b]===TT.WATER))continue;
  MIRROR_TOWER_LANES.forEach(([min,max],i)=>{const dir=(lane%2?-1:1)*(i%2?-1:1),x=dir>0?min:max;setTerrainTile58(m,x,y,TT.RAFT);state.rafts.push({x,y,min,max,dir,axis:'x',mirrorRaft105:true})});lane++;
 }
 grandVaultRooms(1,1,COLS-2,ROWS-2);
 const portal=(id,p,to,arrival,label)=>{setTerrainTile58(m,p.x,p.y,TT.PORTAL);state.branchPortals105.push({id,kind:'branch',...p,to,arrival,label})};
 portal('up',up,level===1?`main:${def.parent}`:`mirror:${level-1}`,level===1?'mirror':'down',level===1?`만루 ${def.parent}층으로`:`${def.name} ${level-1}층으로`);
 if(down)portal('down',down,`mirror:${level+1}`,'up',`${def.name} ${level+1}층`);
 Object.assign(state.player,up);state.fixedStart={...up};state.fixedExit=down||bossAt;state.stairs={...state.fixedExit};
 // Every room, portal and guard post must be reachable, counting a ferry's water as a crossing.
 const track=new Set();for(const r of state.rafts)for(let i=r.min;i<=r.max;i++)track.add(r.axis==='x'?k(i,r.y):k(r.x,i));
 const pass=(x,y)=>{const t=m[y]?.[x];return t!=null&&(track.has(k(x,y))||!tileBlocks(t)&&![TT.WATER,TT.VOID,TT.LAVA].includes(t))};
 const reach=new Set([k(up.x,up.y)]),queue=[up];for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of DIRS4){const x=p.x+dx,y=p.y+dy;if(reach.has(k(x,y))||!pass(x,y))continue;reach.add(k(x,y));queue.push({x,y})}}
 for(const p of [...marks.spawns,...marks.loot,down,bossAt].filter(Boolean))if(!reach.has(k(p.x,p.y)))throw Error('Mirror tower cell unreachable '+p.x+','+p.y);
 const spawn=(name,p)=>{const mon=spawnNamed(name,p,{placementMode:'exact',provenance:'subbranch-random-v3',legendDungeon47:'mirror_blade'});if(!mon)throw Error('Mirror tower spawn rejected '+name);mon.branch105='mirror';return mon};
 const pool=['파편 망령','거울 시녀','반영 검객'];marks.spawns.forEach((p,i)=>spawn(pool[(i+level)%pool.length],p));
 if(bossAt){const boss=scaledMonster(MIRROR_KEEPER,branchCombatFloor());Object.assign(boss,{x:bossAt.x,y:bossAt.y,guardHome57:{...bossAt},alerted:false});OccupancyService.addMonster(boss)}
 marks.loot.forEach((p,i)=>{if(i%2)PlacementService.placeItem({...clone(naturalFoodPick()),count:1},p,{requireReachable:false});else dropFloorLoot(p)});
}
// Back walls of the tower rise above the room: how many blocks this wall cell sits above a visible wall face (0 = none).
function towerWallStack(x,y){
 const b=state?.branchContext105,H=b&&BRANCH_DEFS105[b.id]?.towerHeight?.[b.level-1];if(!H)return 0;
 if(state.map[y]?.[x-1]!==TT.WALL||state.map[y]?.[x+1]!==TT.WALL)return 0;
 for(let j=1;j<H;j++){if(state.map[y+j]?.[x]!==TT.WALL)return 0;if(wallFaceOpen(x,y+j,0,1))return j}
 return 0;
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
