/* World state: terrain layers and surfaces, tile changes and underlays, placement, visibility, landing and forced
   movement, pushable structures and platforms, terrain descriptions. Element reactions: elements.js; floor layout: layout.js. */
const PlacementService=Object.freeze({
moveItem(item,x,y){if(!state?.items?.includes(item))return false;OccupancyService.move(item,x,y);return true},
placeItem(item,origin={x:item?.x,y:item?.y},opts={}){
  if(!state||!item)return false;
  const branch=state.floor===2&&state.floor2Choice63;
  if(branch&&state.generationInProgress57){const prior=opts.restrict,route=branch.branches?.find(r=>r.id===item.floor2Bonus66);opts={...opts,restrict:p=>(!prior||prior(p))&&(route?route.cells.includes(k(p.x,p.y)):branch.commonZones.some(r=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h))}}
  const existing=state.items.includes(item),point=PlacementService.findItemCell(origin,{...opts,allowPlayer:opts.allowPlayer!==false,allowItems:true,preferEmpty:opts.preferEmpty??(!existing&&!state.generationInProgress57&&opts.requireReachable!==false),requireReachable:!state.generationInProgress57&&opts.requireReachable!==false});
  if(existing)return point?PlacementService.moveItem(item,point.x,point.y):false;
  if(point){const moved=transferItemQuantity(item,null,state.items,itemQuantity(item),{position:point});if(!moved.remaining){if(state.pendingGroundItems57)state.pendingGroundItems57=state.pendingGroundItems57.filter(q=>q.item!==item);return true}}
  state.pendingGroundItems57=state.pendingGroundItems57||[];
  if(!state.pendingGroundItems57.some(q=>q.item===item))state.pendingGroundItems57.push({item,origin:{...origin}});
  return false
},
validateItems(opts={}){let moved=0,bad=0;for(const it of state.items||[]){const x=it.x,y=it.y;if(!PlacementService.placeItem(it,{x,y},opts))bad++;else if(it.x!==x||it.y!==y)moved++}return{moved,bad}},
flushPendingItems(){
  if(!state?.pendingGroundItems57?.length){PlacementService.reconcileBossDrop();return}const pending=state.pendingGroundItems57,reachable=ReachabilityService.lootCells();state.pendingGroundItems57=[];for(const q of pending)PlacementService.placeItem(q.item,q.origin,{reachable});PlacementService.reconcileBossDrop()
},
terrainStandable(entity,tile){
  if(tile==null)return false;if(tile===TT.PALACE_ROCK)return false;if(state?.debugBattle57&&state.debugBattleIgnoreTerrain57&&terrainSurface58(tile))return true;if(tile===TT.RAFT)return true;
  const hazardKind=globalThis.__MANRU_HAZARD_CORE__?.kind?.(tile);if(hazardKind)return !!globalThis.__MANRU_HAZARD_CORE__?.adapted?.(entity,hazardKind);
  if(tile>=500&&tile<660&&tileBlocks(tile))return false;
  return entity?.flying?!FLYING_BLOCKING_TILES57.has(tile):entity?.aquatic&&!entity.amphibious57?AQUATIC_STAND_TILES57.has(tile):entity?.lava?(tile===TT.LAVA||!tileBlocks(tile)):!tileBlocks(tile)
},
canPlaceEntity(entity,x,y,opts={}){
  const ignored=opts.ignore||new Set([entity]);for(const cell of entityFootprintCells57(entity,x,y)){if(entity?.territory105&&!state.debugBattle57){const b=entity.territory105;if(cell.x<b.x||cell.y<b.y||cell.x>=b.x+b.w||cell.y>=b.y+b.h)return false;}
    if(cell.x<1||cell.y<1||cell.x>=COLS-1||cell.y>=ROWS-1)return false;if(entity!==state.player&&inTutorialEntry(cell.x,cell.y))return false;
    const tile=opts.tiles?.get(k(cell.x,cell.y))??state.map[cell.y][cell.x];if(!PlacementService.terrainStandable(entity,tile))return false;
    if(OccupancyService.blocksEntityCell(cell.x,cell.y,ignored))return false;
  }return true
},
findMonster(mon,opts={}){
  const mode=opts.placementMode||'floor',origin=opts.origin||state.player,radius=opts.radius??2,cells=[],reachable=opts.reachable?ReachabilityService.distances(origin):null;
  if(mode==='exact')return state.map?.[origin.y]?.[origin.x]!==TT.STAIR&&(!opts.restrict||opts.restrict(origin))&&PlacementService.canPlaceEntity(mon,origin.x,origin.y)?{x:origin.x,y:origin.y}:null;
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){const d=Math.max(Math.abs(x-origin.x),Math.abs(y-origin.y));if(mode==='local'&&d>radius)continue;if(state.map[y][x]===TT.STAIR)continue;if(opts.restrict&&!opts.restrict({x,y}))continue;if(reachable&&!reachable.has(k(x,y)))continue;if(opts.safe!==false&&!PlacementService.canPlaceEntity(mon,x,y))continue;cells.push({x,y,d})}
  const preferred=mon?.grassHide57?cells.filter(c=>monsterAmbushCanHide(mon,c.x,c.y)):cells,pool=preferred.length?preferred:cells;if(mode==='local')pool.sort((a,b)=>a.d-b.d);return pool.length?(mode==='local'?pool[0]:choice(pool)):null
},
monsterCanStand(mon,x,y,spawnCtx57=null,opts={}){
  if(state.generationInProgress57&&state.floor===2&&state.floor2Choice63?.safeCells.includes(k(x,y)))return false;
  if(entityFootprintCells57(mon,x,y).some(p=>inTutorialEntry(p.x,p.y)))return false;
  if(mon?.waterOnly57){if(x<1||y<1||x>=COLS-1||y>=ROWS-1||state.map[y][x]!==TT.WATER||OccupancyService.isOccupied(x,y,mon)||(x===state.player.x&&y===state.player.y))return false;return true}
  if(!spawnCtx57)return PlacementService.canPlaceEntity(mon,x,y,opts);
  for(const q of entityFootprintCells57(mon,x,y))if(q.x<1||q.y<1||q.x>=COLS-1||q.y>=ROWS-1||!PlacementService.terrainStandable(mon,state.map[q.y][q.x])||spawnCtx57.occupied.has(q.y*COLS+q.x)||(q.x===state.player.x&&q.y===state.player.y))return false;return true
},
randomFloor(minRoomIndex=0,opts={}){const start=Math.max(0,Math.floor(Number(minRoomIndex)||0)),rooms=start>0?(state.rooms||[]).slice(start).filter(r=>r&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&r.w>0&&r.h>0):[],insideAllowed=(x,y)=>!rooms.length||rooms.some(r=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h),spots=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(insideAllowed(x,y)&&ReachabilityService.terrainPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!OccupancyService.isOccupied(x,y)&&!(x===state.player.x&&y===state.player.y))spots.push({x,y});if(spots.length)return choice(spots);if(start>0&&rooms.length){for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(ReachabilityService.terrainPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!OccupancyService.isOccupied(x,y)&&!(x===state.player.x&&y===state.player.y))spots.push({x,y})}return spots.length?choice(spots):{x:state.player.x,y:state.player.y}},
randomMonsterCell(mon){const spots=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(PlacementService.monsterCanStand(mon,x,y)&&state.map[y][x]!==TT.STAIR)spots.push({x,y});return spots.length?choice(spots):null},
registerGenerationMonster(ctx,mon){
  if(!ctx||!mon||mon.hp<=0)return;
  for(const[ox,oy]of footprintOffsets(mon)){
    const x=mon.x+ox,y=mon.y+oy;if(x>=0&&y>=0&&x<COLS&&y<ROWS)ctx.occupied.add(y*COLS+x)
  }
  const x0=Math.max(1,mon.x-8),x1=Math.min(COLS-2,mon.x+8),y0=Math.max(1,mon.y-8),y1=Math.min(ROWS-2,mon.y+8);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const d=Math.max(Math.abs(mon.x-x),Math.abs(mon.y-y)),idx=y*COLS+x;
    if(d<=4)ctx.local[idx]++;if(d<=8)ctx.wide[idx]++
  }
},
generationContext(dist,safe,groupSize=1){
  const size=COLS*ROWS,ctx={groupSize,occupied:new Set(),local:new Uint16Array(size),wide:new Uint16Array(size),candidates:[]},roomMeta=new Array(size);
  for(const r of state.rooms||[]){
    const key=`${r.x},${r.y},${r.w},${r.h}`,area=r.w*r.h,cap=(state.floor===20&&state.specialFloor)?12:(area>320?Math.max(2,Math.min(5,Math.floor(area/260))):(state.specialFloor?2:1));
    const y0=Math.max(1,r.y),y1=Math.min(ROWS-1,r.y+r.h),x0=Math.max(1,r.x),x1=Math.min(COLS-1,r.x+r.w);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const idx=y*COLS+x;if(roomMeta[idx]===undefined)roomMeta[idx]={key,cap}}
  }
  for(const m of state.monsters||[])PlacementService.registerGenerationMonster(ctx,m);
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
    if(state.map[y][x]===TT.STAIR||state.visible.has(k(x,y)))continue;
    const d=dist.get(k(x,y));if(Number.isFinite(d)&&d<safe)continue;
    const meta=roomMeta[y*COLS+x];ctx.candidates.push({x,y,key:meta?.key||null,cap:meta?.cap??Infinity})
  }
  return ctx
},
reconcileBossDrop(){
  if(!state?.bossDrop55||state.bossDrop55.granted)return state?.bossDrop55||null;
  const requested=Math.max(0,Math.floor(Number(state.bossDrop55.requested)||0));if(!requested)return state.bossDrop55;
  const world=(state.items||[]).filter(i=>i?.bossDrop55).reduce((n,i)=>n+itemQuantity(i),0),pending=(state.pendingGroundItems57||[]).filter(q=>q?.item?.bossDrop55).reduce((n,q)=>n+itemQuantity(q.item),0);
  state.bossDrop55.count=world;state.bossDrop55.pendingCount=pending;state.bossDrop55.pending=pending>0;
  if(world===requested&&pending===0){const expanded=[],seen=new Set();for(const item of state.items||[]){if(!item?.bossDrop55)continue;for(let n=0;n<itemQuantity(item);n++){const key=k(item.x,item.y),stacked=seen.has(key);seen.add(key);expanded.push({name:item.name,type:item.type,potionKind:item.potionKind||null,talismanKind:item.talismanKind||null,x:item.x,y:item.y,stacked})}}state.bossDrop55.granted=true;state.bossDrop55.pending=false;state.bossDrop55.pendingCount=0;state.bossDrop55.healCount=expanded.filter(v=>['heal_small','heal_medium','heal_large'].includes(v.potionKind)).length;state.bossDrop55.stackedFallbacks=expanded.filter(v=>v.stacked).length;state.bossDrop55.items=expanded;addLog(`보스 전리품 ${world}개를 주변 바닥에 놓았다.`)}
  return state.bossDrop55
},
findItemCell(origin,opt={}){
  if(!state?.player||!origin)return null;
  const reachable=opt.reachable||(opt.requireReachable===false?null:ReachabilityService.lootCells()),sx=Math.max(1,Math.min(COLS-2,Number.isFinite(origin.x)?Math.floor(origin.x):state.player.x)),sy=Math.max(1,Math.min(ROWS-2,Number.isFinite(origin.y)?Math.floor(origin.y):state.player.y));
  const itemCells=new Set((state.items||[]).map(it=>k(it.x,it.y))),occupiedCells=new Set();
  for(const mon of state.monsters||[])if(mon.hp>0)for(const [ox,oy]of footprintOffsets(mon))occupiedCells.add(k(mon.x+ox,mon.y+oy));
  function legal(x,y,allowItems){return (!Number.isFinite(opt.radius)||Math.max(Math.abs(x-sx),Math.abs(y-sy))<=Math.max(0,opt.radius))&&safeLootGround42(x,y)&&(!opt.restrict||opt.restrict({x,y}))&&(!reachable||reachable.has(k(x,y)))&&(opt.allowPlayer||x!==state.player.x||y!==state.player.y)&&(state.stairs?.x!==x||state.stairs?.y!==y)&&!occupiedCells.has(k(x,y))&&(allowItems||!itemCells.has(k(x,y)))}
  // Runtime drops use the player's reachable safe ground, not a land path starting
  // at the corpse: fish, flying enemies and hazard deaths can originate off land.
  // Stable distance ordering also serves boss reservations and stacked fallback.
  if(reachable){
    let best=null,bestRank=Infinity,bestDistance=Infinity,bestManhattan=Infinity;
    for(const key of reachable){const [x,y]=key.split(',').map(Number);if(!legal(x,y,!!opt.allowItems))continue;const rank=opt.preferEmpty&&itemCells.has(key)?1:0,distance=Math.max(Math.abs(x-sx),Math.abs(y-sy)),manhattan=Math.abs(x-sx)+Math.abs(y-sy);
      if(rank<bestRank||rank===bestRank&&(distance<bestDistance||distance===bestDistance&&(manhattan<bestManhattan||manhattan===bestManhattan&&(!best||y<best.y||y===best.y&&x<best.x)))){best={x,y};bestRank=rank;bestDistance=distance;bestManhattan=manhattan}
    }return best;
  }
  // Generation and legacy ground normalization retain local, non-hazard transit.
  function transit(x,y){if(x<1||y<1||x>=COLS-1||y>=ROWS-1)return false;const t=state.map?.[y]?.[x];return t===TT.DOOR||t===TT.OPEN_DOOR||safeLootGround42(x,y)}
  if(legal(sx,sy,!!opt.allowItems))return{x:sx,y:sy};
  return ReachabilityService.localPlacement({sx,sy,opt,transit,legal})
}
});
function entityTerrainEntry105(entity,x,y,ox,oy){
 if(state?.generationInProgress57||!entity||entity.hp<=0)return;
 mineEntityEntry(entity,x,y);if(entity.hp<=0)return;
 if(entity!==state.player&&!entity.flying){
  const previous=new Set(entityFootprintCells57({...entity,x:ox,y:oy}).map(q=>k(q.x,q.y)));
  for(const q of entityFootprintCells57(entity))if(!previous.has(k(q.x,q.y))){const t=state.map[q.y]?.[q.x];if(t===TT.TRAP)trapEvent(q.x,q.y,entity);else if(t===TT.SNARE)snareEvent(q.x,q.y,false,entity);else if(t===TT.CRUMBLE)globalThis.__MANRU_HAZARD_CORE__?.armFragile(q.x,q.y,t,{cause:'monster-step',entity});if(entity.hp<=0)break}
  const current=new Set(entityFootprintCells57(entity).map(q=>k(q.x,q.y)));for(const q of entityFootprintCells57(entity,ox,oy))if(!current.has(k(q.x,q.y))&&state.map[q.y]?.[q.x]===TT.CRUMBLE)globalThis.__MANRU_HAZARD_CORE__?.collapseAt(q.x,q.y,'crumble');
 }
 environmentStanding105(entity);if(entity!==state.player&&entity.hp>0)resolveSilkCrossing54({x:ox,y:oy},'walk',entity);
}
function pushableAt105(x,y){if(protectedProp105(x,y))return null;const cart=state.branchTerrain105?.mine105?.carts?.find(c=>c.alive&&c.x===x&&c.y===y);return cart?{x,y,cart}:state.map[y]?.[x]===TT.CRATE?{x,y,tile:TT.CRATE}:null}
function pushStructure105(obj,actor=state.player){
 if(!obj||Math.abs(obj.x-actor.x)+Math.abs(obj.y-actor.y)!==1)return false;const dx=obj.x-actor.x,dy=obj.y-actor.y,x=obj.x+dx,y=obj.y+dy,t=state.map[y]?.[x];
 // Do not seal exits, doors, one-cell junctions, items or living occupants.
 if(!(terrainSurface58(t)||t===TT.TRAP||t===TT.SNARE)||t===TT.ICE||protectedProp105(x,y)||state.stairs?.x===x&&state.stairs?.y===y||runtimeTerrainOccupants57(x,y).length||state.items.some(i=>i.x===x&&i.y===y)||pushableAt105(x,y))return false;
 const current=pushableAt105(obj.x,obj.y);if(!current||!!current.cart!==!!obj.cart||obj.cart&&current.cart!==obj.cart)return false;
 const oldBase=furnitureFloor57(obj.x,obj.y),mine=state.branchTerrain105?.mine105;
 if(ShopMapBuilder.groundAt(x,y)||!obj.cart&&(mine?.buttons||[]).some(b=>b.x===x&&b.y===y))return false;
 const risingGates=new Set((mine?.walls||[]).filter(w=>w.open&&!w.persistent105).flatMap(w=>w.cells.map(q=>k(q.x,q.y))));
 const unstable=new Set((mine?.walls||[]).flatMap(w=>w.cells.map(q=>k(q.x,q.y))).filter(key=>!risingGates.has(key)));
 const unsafe=t=>t===undefined||tileBlocks(t)||[TT.ICE,TT.PAPER_BRIDGE,TT.CRUMBLE,TT.RAFT,TT.DRAWBRIDGE_DOWN,TT.DRAWBRIDGE_UP,TT.WATER,TT.LAVA,TT.MERCURY,TT.VOID].includes(t);
 for(const r of state.tempTerrain74||[])if(unsafe(r.old)||unsafe(r.tile))unstable.add(k(r.x,r.y));
 // Objects must not outlive unstable floor support. An open timed grate crushes its obstruction on ascent.
 if(unstable.has(k(obj.x,obj.y))||unstable.has(k(x,y)))return false;
 const carts=new Set((mine?.carts||[]).filter(c=>c.alive&&c!==obj.cart).map(c=>k(c.x,c.y)));
 const pass=(xx,yy,after)=>{
  if(xx<1||yy<1||xx>=COLS-1||yy>=ROWS-1||unstable.has(k(xx,yy))||carts.has(k(xx,yy)))return false;
  if(after&&xx===x&&yy===y||!after&&xx===obj.x&&yy===obj.y)return false;
  return !unsafe(after&&xx===obj.x&&yy===obj.y?oldBase:state.map[yy]?.[xx]);
 };
 const flood=after=>{const seen=new Set([k(actor.x,actor.y)]),queue=[{x:actor.x,y:actor.y}];for(let i=0;i<queue.length;i++)for(const[dx,dy]of DIRS4){const xx=queue[i].x+dx,yy=queue[i].y+dy,key=k(xx,yy);if(!seen.has(key)&&pass(xx,yy,after)){seen.add(key);queue.push({x:xx,y:yy})}}return seen};
 // Timed rising gates own obstruction destruction; a push here cannot seal a route permanently.
 if(!risingGates.has(k(x,y))){
 const before=flood(false),after=flood(true);
 // Keep every previously accessible permanent square; also keep all sides of
 // the landing square connected, including the newly vacated crate square.
 for(const key of before)if(key!==k(x,y)&&!after.has(key))return false;
 for(const[dx,dy]of DIRS4)if(pass(x+dx,y+dy,true)&&!after.has(k(x+dx,y+dy)))return false;
 const access=(set,xx,yy)=>set.has(k(xx,yy))||DIRS4.some(([dx,dy])=>set.has(k(xx+dx,yy+dy)));
 // Gates/fixtures can be blocking tiles: preserving floor connectivity alone
 // does not preserve their only interaction square.
 for(let yy=1;yy<ROWS-1;yy++)for(let xx=1;xx<COLS-1;xx++){
  if(xx===obj.x&&yy===obj.y||xx===x&&yy===y)continue;
  const tile=state.map[yy][xx];if(tile===TT.WALL||terrainSurface58(tile)||[TT.WATER,TT.LAVA,TT.MERCURY,TT.VOID].includes(tile))continue;
  if(access(before,xx,yy)&&!access(after,xx,yy))return false;
 }
 }
 if([TT.TRAP,TT.SNARE].includes(t))triggerPressureTile(x,y,null,'structure');
 if(obj.cart){beginStructureMotion105(obj.cart,obj.cart,obj,x,y);obj.cart.x=x;obj.cart.y=y;}else{
  const carriedBurn=terrainReactions105().burning[k(obj.x,obj.y)];const r=RuntimeTerrainOwner.mutate(obj.x,obj.y,oldBase,{source:'crate-push'});if(!r.ok)return false;releaseTerrainUnderlay58(obj.x,obj.y,oldBase);RuntimeTerrainOwner.mutate(x,y,TT.CRATE,{source:'crate-push'});
  const reactions=terrainReactions105(),burn=carriedBurn;if(burn){delete reactions.burning[k(obj.x,obj.y)];reactions.burning[k(x,y)]={...burn,x,y}}if(state.branchTerrain105?.props){const prop=state.branchTerrain105.props[k(obj.x,obj.y)];delete state.branchTerrain105.props[k(obj.x,obj.y)];if(prop)state.branchTerrain105.props[k(x,y)]=prop}touchElementTerrain105(obj.x,obj.y);touchElementTerrain105(x,y);beginStructureMotion105(k(obj.x,obj.y),k(x,y),obj,x,y);
 }
 if(![TT.TRAP,TT.SNARE].includes(t))triggerPressureTile(x,y,null,'structure');alertNearby(x,y,4,'impact');VisibilityService.compute();return true;
}
function movePlatform57(platform,dx,dy){
  if(!state||!platform||(!dx&&!dy))return{ok:false,reason:'inactive'};
  const oldCells=entityFootprintCells57(platform),newCells=entityFootprintCells57(platform,platform.x+dx,platform.y+dy),oldKeys=new Set(oldCells.map(q=>k(q.x,q.y))),newKeys=new Set(newCells.map(q=>k(q.x,q.y)));
  const riders=OccupancyService.occupants(oldCells),riderSet=new Set(riders),tiles=new Map();
  for(const q of oldCells){if(state.map[q.y]?.[q.x]!==TT.RAFT)return{ok:false,reason:'missing-platform'};tiles.set(k(q.x,q.y),TT.WATER)}
  for(const q of newCells){const tile=state.map[q.y]?.[q.x];if(q.x<1||q.y<1||q.x>=COLS-1||q.y>=ROWS-1||(!oldKeys.has(k(q.x,q.y))&&tile!==TT.WATER))return{ok:false,reason:'destination-terrain'};tiles.set(k(q.x,q.y),TT.RAFT)}
  for(const entity of OccupancyService.occupants(newCells))if(!riderSet.has(entity))return{ok:false,reason:'destination-occupied'};
  for(const entity of riders){
    if(state.items.includes(entity)){for(const q of entityFootprintCells57(entity,entity.x+dx,entity.y+dy)){const tile=tiles.get(k(q.x,q.y))??state.map[q.y]?.[q.x];if(tile==null||dangerousLootTerrain42(tile)||tileBlocks(tile))return{ok:false,reason:'item-destination'}}}
    else if(!PlacementService.canPlaceEntity(entity,entity.x+dx,entity.y+dy,{ignore:riderSet,tiles}))return{ok:false,reason:'rider-destination'};
  }
  // Geometry and every rider are validated before the first write. No callbacks run mid-transfer.
  state.terrainMutationVersion57=state.terrainMutationVersion57||{};
  for(const [key,tile]of tiles){const [x,y]=key.split(',').map(Number);setTerrainTile58(state.map,x,y,tile);state.terrainMutationSeq57=(state.terrainMutationSeq57||0)+1;state.terrainMutationVersion57[key]=state.terrainMutationSeq57}
  platform.x+=dx;platform.y+=dy;
  for(const entity of riders){if(state.items.includes(entity))PlacementService.moveItem(entity,entity.x+dx,entity.y+dy);else OccupancyService.move(entity,entity.x+dx,entity.y+dy)}
  for(const entity of riders)if(!state.items.includes(entity))globalThis.__MANRU_HAZARD_CORE__?.standing?.(entity,'platform');
  if(riderSet.has(state.player)){resolvePlayerLanding57(state.player.x,state.player.y,{cause:'platform',hazard:false,resetVisual:true});addLog(state.branchContext105?.id==='palace'?'뗏목이 용궁 수원 사이로 미끄러진다.':'뗏목이 향수강을 따라 미끄러진다.')}
  return{ok:true,riders:riders.length,oldCells,newCells}
}
const TERRAIN_SURFACE_KEYS58=Object.freeze(['SHALLOW_WATER','PALACE_LOW','PALACE_MID','PALACE_UPPER','PALACE_HIGH','ICE','FLOOR','GRASS','LIGHT_GRASS','WOOD_FLOOR','MOON_STONE','DARK_WOOD','GILDED_FLOOR','STONE_PATH','CARPET']);
const TERRAIN_OVERLAY_KEYS58=Object.freeze(['PALACE_WALL_LAMP','TABLE','SCREEN','JAR','CRATE','BENCH','RACK','LOW_FENCE','FLOWERBED','STONE_PILLAR','LANTERN_POST','WALL_BANNER','WINDOW','ROCK','STATUE','PAPER_CRANE','LOTUS_FLOWER','INCENSE_STAND','IRON_HOOK','GOLD_LAMP','PETAL_MAT','GARDEN_TREE','PEACH_TREE','RUMOR_BED','RUMOR_MED_CABINET','RUMOR_GAS_PIPE','RUMOR_FLOOD_GRATE','RUMOR_ARCHIVE_PILE','RUMOR_WEAPON_RACK','RUMOR_SILK_DIVAN','RUMOR_RITUAL_OBELISK','RUMOR_CHARRED_COUNTER','RUMOR_INVESTIGATION_BOARD','RUMOR_SMUGGLER_BUNDLE','RUMOR_GREENHOUSE_FRAME','BED','BOOK_STACK']);
const TERRAIN_WALL_OVERLAY_KEYS58=Object.freeze(['WALL_BANNER','WINDOW','PALACE_WALL_LAMP']);
let TERRAIN_LAYER_CACHE58=null;
function terrainLayerCatalog58(){
  if(TERRAIN_LAYER_CACHE58)return TERRAIN_LAYER_CACHE58;
  const values=keys=>new Set(keys.map(name=>TT[name]).filter(Number.isFinite));
  TERRAIN_LAYER_CACHE58={surfaces:values(TERRAIN_SURFACE_KEYS58),overlays:values(TERRAIN_OVERLAY_KEYS58),wallOverlays:values(TERRAIN_WALL_OVERLAY_KEYS58)};return TERRAIN_LAYER_CACHE58
}
// Tile writes own the exact substrate at placement time, including writes on a map
// being assembled before it is installed in state. No generation snapshots infer it.
const TERRAIN_MAP_LAYERS58=new WeakMap();
function terrainMapLayers58(map){
  if(map===state?.map){
    if(!state.terrainUnderlay58||typeof state.terrainUnderlay58!=='object')state.terrainUnderlay58={};
    if(!state.terrainAttachment58||typeof state.terrainAttachment58!=='object')state.terrainAttachment58={};
    const pending=TERRAIN_MAP_LAYERS58.get(map);
    if(pending&&pending.underlay===state.terrainUnderlay58&&pending.attachment===state.terrainAttachment58)return pending;
    if(pending?.pending){state.terrainUnderlay58=pending.underlay;state.terrainAttachment58=pending.attachment}
    const layers={underlay:state.terrainUnderlay58,attachment:state.terrainAttachment58};TERRAIN_MAP_LAYERS58.set(map,layers);return layers;
  }
  let layers=TERRAIN_MAP_LAYERS58.get(map);if(!layers){layers={underlay:{},attachment:{},pending:true};TERRAIN_MAP_LAYERS58.set(map,layers)}return layers;
}
function terrainCellPlacement58(map,x,y){const layers=terrainMapLayers58(map),key=k(x,y);return{base:layers.underlay[key]??map[y][x],attachment:layers.attachment[key]}}
function terrainSurface58(tile){return terrainLayerCatalog58().surfaces.has(tile)||(Number.isInteger(tile)&&tile>=500&&tile<660&&[0,1,2,3,7].includes((tile-500)%16))}
function setTerrainTile58(map,x,y,tile,placement={}){
  const old=map[y][x];if(map===state?.map&&[TT.DOOR,TT.OPEN_DOOR].includes(old)&&[TT.DOOR,TT.OPEN_DOOR].includes(tile)&&state.terrainReactions105?.burning?.[k(x,y)])state.terrainReactions105.burning[k(x,y)].tile=tile;if(map===state?.map&&state.generationInProgress57&&inTutorialEntry(x,y))return old;if(!Number.isInteger(tile))throw new Error('invalid terrain tile');
  const cat=terrainLayerCatalog58(),layers=terrainMapLayers58(map),key=k(x,y);
  if(cat.overlays.has(tile)){
    const base=placement.base??(cat.overlays.has(old)?layers.underlay[key]:old);
    if(tile===TT.WALL_BANNER&&base!==TT.WALL)return old;
    const attachment=tile===TT.WALL_BANNER?'wall':placement.attachment||(cat.wallOverlays.has(tile)&&base===TT.WALL?'wall':'standing');
    if(attachment==='wall'&&!cat.wallOverlays.has(tile))throw new Error('invalid wall attachment');
    if(attachment==='secret-wall'&&![TT.SCREEN,TT.RACK,TT.WINDOW].includes(tile))throw new Error('invalid concealed entrance');
    if(attachment==='wall'||attachment==='secret-wall'){
      if(base!==TT.WALL)throw new Error('wall attachment requires wall');
    }else if(!terrainSurface58(base)&&!(placement.fluidSurface&&base===TT.WATER)){
      // A floor prop cannot implicitly excavate a wall/hazard. Its producer must
      // first carve an explicit surface. Rejected decorations leave topology intact.
      return old;
    }
    layers.underlay[key]=base;layers.attachment[key]=attachment;
  }else{delete layers.underlay[key];delete layers.attachment[key]}
  if(map===state?.map&&old!==tile&&state.terrainReactions105){const r=state.terrainReactions105,key=k(x,y);if(!([TT.DOOR,TT.OPEN_DOOR].includes(old)&&[TT.DOOR,TT.OPEN_DOOR].includes(tile)))delete r.burning[key];if(!lightAt(x,y)&&!elementMaterial105(tile,'light'))delete r.unlit[key];if(r.char)delete r.char[key];r.revision=(r.revision||0)+1}map[y][x]=tile;if(old!==tile)TERRAIN_RENDER_REV.set(map,(TERRAIN_RENDER_REV.get(map)||0)+1);branchInvalidateTerrain(map,x,y);if(map===state?.map&&!state.generationInProgress57&&old===TT.DOOR&&tile===TT.OPEN_DOOR)branchWarningDoor(x,y);if(map===state?.map&&noiseBudget)noiseBudget.fields.clear();return tile;
}
// Surface changes use the same terrain owner as prop placement, including authored-area protection.
function setTerrainSurface65(map,x,y,surface){
 if(!terrainSurface58(surface)&&surface!==TT.WATER)throw new Error('invalid terrain surface');
 const top=map[y][x],layers=terrainMapLayers58(map),key=k(x,y);
 return setTerrainTile58(map,x,y,terrainLayerCatalog58().overlays.has(top)?top:surface,{base:surface,attachment:layers.attachment[key],fluidSurface:surface===TT.WATER});
}
function terrainUnderlayState58(){return state?.map?terrainMapLayers58(state.map).underlay:null}
function terrainUnderlayAt58(x,y){const v=terrainUnderlayState58()?.[k(x,y)];return Number.isInteger(v)?v:null}
const FLYING_BLOCKING_TILES57=new Set([TT.WALL,TT.LOCKED_GATE,TT.SECRET_DOOR]);
const AQUATIC_STAND_TILES57=new Set([TT.SHALLOW_WATER,TT.ICE,TT.PAPER_BRIDGE,TT.DRAWBRIDGE_DOWN,TT.RAFT]);
const VisibilityService=Object.freeze({
isVisible(x,y){return state.visible.has(k(x,y))},
isSeen(x,y){return state.seen.has(k(x,y))},
lineClear(x0,y0,x1,y1){return combatLineCheckR8(x0,y0,x1,y1,{units:false}).ok},
reset(){if(!state)return false;state.visible=new Set();state.seen=new Set();return true},
rememberKey(key){if(!state||mineHidden(...key.split(',').map(Number)))return false;state.seen.add(key);return true},
remember(x,y){return VisibilityService.rememberKey(k(x,y))},
addVisibleKey(key){if(!state)return false;state.visible.add(key);return true},
revealAll(){if(!state)return false;state.seen=new Set();state.visible=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){state.seen.add(k(x,y));state.visible.add(k(x,y))}return true},
compute(){
  if(state?.debugBattle57)return VisibilityService.revealAll();
  state.visible=new Set();
  const p=state.player,nightmare=globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('nightmare')||0,vision=Math.max(nightmare>0?1:3,getStats().vision-(state.visionPenalty||0));
  const inVision=(x,y)=>Math.hypot(x-p.x,y-p.y)<=vision+.35;
  for(let y=Math.max(0,p.y-vision);y<=Math.min(ROWS-1,p.y+vision);y++)for(let x=Math.max(0,p.x-vision);x<=Math.min(COLS-1,p.x+vision);x++){
    if(inVision(x,y)&&VisibilityService.lineClear(p.x,p.y,x,y)){VisibilityService.addVisibleKey(k(x,y));if(!state.generationInProgress57)VisibilityService.rememberKey(k(x,y))}
  }
  // Boundary walls belong to the currently visible room/corridor even when the ray terminates on the adjacent floor.
  // Reveal only the first opaque skin next to an actually visible non-opaque cell; never leak rooms behind walls.
  const edge=[];
  for(let y=Math.max(0,p.y-vision-1);y<=Math.min(ROWS-1,p.y+vision+1);y++)for(let x=Math.max(0,p.x-vision-1);x<=Math.min(COLS-1,p.x+vision+1);x++){
    if(!inVision(x,y)||!tileBlocksSight(state.map[y]?.[x])||state.visible.has(k(x,y)))continue;
    if(DIRS8.some(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)return false;return state.visible.has(k(nx,ny))&&!tileBlocksSight(state.map[ny][nx])}))edge.push([x,y]);
  }
  for(const[x,y]of edge){VisibilityService.addVisibleKey(k(x,y));if(!state.generationInProgress57)VisibilityService.rememberKey(k(x,y))}
  mineVisibility();
  recordPlayerSight105();
}
});
const PLAYER_ENTRY_PICKUP_FIRST57=new Set([TT.BRAZIER,TT.COOKPOT,TT.ARMORY,TT.FOUNTAIN,TT.ALTAR,TT.VAULT,TT.CACHE,TT.JAR,TT.SWITCH].filter(v=>Number.isFinite(v)));
function resolvePlayerLanding57(x,y,opts={}){
  if(!state?.player||x<0||y<0||x>=COLS||y>=ROWS)return{ok:false,moved:false,reason:'bounds'};
  if(neutralInteractableAt58(x,y))return{ok:false,moved:false,reason:'neutral-occupant'};
  const p=state.player,origin=opts.origin||{x:p.x,y:p.y},cause=opts.cause||'walk',policy=playerTransferPolicy57(cause);
  if(policy){const validation=validatePlayerTransfer57(x,y,{cause,policy});if(!validation.ok)return{ok:false,moved:false,reason:validation.reason,cause,x:p.x,y:p.y}}
  const discovery=opts.discovery105||captureMovementDiscovery105();
  const tile=state.map?.[y]?.[x],haz=globalThis.__MANRU_HAZARD_CORE__,kind=opts.hazard===false?null:haz?.kind?.(tile);
  let hazardResult=null;
  if(kind)hazardResult=haz.resolve(p,tile,x,y,origin,{consumeTurn:false,forced:cause==='forced-push'||cause==='forced-pull',landingCause57:cause});
  else{OccupancyService.move(p,x,y)}
  if(['blink','talisman-blink','fusion-blink','holy-blink'].includes(cause)&&(p.x!==origin.x||p.y!==origin.y))markCombatBlink57(p);
  if(p.classState?.aimPower>0&&(p.x!==origin.x||p.y!==origin.y)){
    const agency=(state.playerAgencyTurns57||0)+(state._turnPipelineActive57?Number(!!state._turnAgencyWillCount57&&!state._turnAgencyCounted57):1);
    if(p.classState.aimMoveAgency!==agency){p.classState.aimMoveAgency=agency;setAimPower(p.classState.aimPower-1)}
  }
  finishMovementDiscovery105(discovery,!state._turnPipelineActive57&&['walk','blink','ally-swap','talisman-blink','fusion-blink','holy-blink','portal'].includes(cause));
  martialLanding(origin);applyJarGasEffects57();if(state.floor>=11&&(p.x!==origin.x||p.y!==origin.y)){state.recentPlayerCells57=(state.recentPlayerCells57||[]).filter(c=>(state.playerAgencyTurns57||0)-c.agency<26);state.recentPlayerCells57.push({x:p.x,y:p.y,agency:state.playerAgencyTurns57||0});if(state.recentPlayerCells57.length>64)state.recentPlayerCells57.shift()}
  if(kind){resolveSilkCrossing54(origin,cause);return{ok:!!hazardResult,moved:p.x!==origin.x||p.y!==origin.y,cause,hazard:kind,result:hazardResult,x:p.x,y:p.y}}
  if(opts.resetVisual)resetVisualState();
  if(state.shopIntermission?.active){const stock=ShopMapBuilder.groundAt(x,y);if(stock)openShop(stock);return{ok:true,moved:p.x!==origin.x||p.y!==origin.y,cause,entry:!!stock,x,y}}
  const activeInteraction=opts.activeInteraction??cause==='walk';
  if(activeInteraction&&PLAYER_ENTRY_PICKUP_FIRST57.has(tile)){
    let guard=0;while(guard++<12&&(state.items||[]).some(it=>it.x===x&&it.y===y)){
      const before=state.items.length;if(!pickup()||state.items.length>=before)break;
    }
  }
  resolveSilkCrossing54(origin,cause);
  const entry=opts.entry===false?false:bumpTileAction(x,y,{cause,activeInteraction});return{ok:true,moved:p.x!==origin.x||p.y!==origin.y,cause,entry,x:p.x,y:p.y}
}
function terrainHasPendingRecovery57(x,y){
  // Authored future drainage preserves submerged loot in place. Terminal floods
  // have no such recovery path and must retain loot on reachable ground.
  const safe=t=>Number.isFinite(t)&&!dangerousLootTerrain42(t)&&!tileBlocks(t)&&![TT.STAIR,TT.KEY_TILE,TT.PORTAL,TT.DOOR].includes(t);
  const pending=(state.floor23?.controls||[]).filter(c=>!c.activated&&!(state.switches||[]).find(sw=>sw.id===c.switchId)?.used);
  if(pending.some(c=>(c.changes||[]).some(q=>q.x===x&&q.y===y&&safe(q.after))))return ReachabilityService.lootCells({futureOnly:true}).has(k(x,y));
  const reveal=state.floor23?.reveal;if(reveal&&!reveal.used&&(reveal.cells||[]).some(q=>q.x===x&&q.y===y&&safe(q.t)))return ReachabilityService.lootCells({futureOnly:true,includeReveal:true}).has(k(x,y));
  return false;
}
function resolveForcedMovement57(entity,source,steps=1,opts={}){
  if(!state||!entity||!source||steps<=0)return{moved:0,resisted:false};
  if(forcedMovementResisted57(entity,opts))return{moved:0,resisted:true};
  if(entity!==state.player&&!MON_VIS.has(entity))MON_VIS.set(entity,{x:entity.x,y:entity.y,last:performance.now()});
  let moved=0,interrupted=false,collision=null,broken=0,slid=false;let limit=steps;const player=entity===state.player,haz=globalThis.__MANRU_HAZARD_CORE__,visualSteps=[];
  const rememberVisualStep=q=>{if(entity.x!==q.x||entity.y!==q.y)return;const prev=visualSteps[visualSteps.length-1];if(!prev||prev.x!==q.x||prev.y!==q.y)visualSteps.push({x:q.x,y:q.y})};
  for(let i=0;i<limit;i++){
    if(!slid&&!entity.flying&&state.map[entity.y]?.[entity.x]===TT.ICE){slid=true;limit++;floatText(entity.x,entity.y,'미끄러짐','#88bdce',9)}
    const dx=Math.sign(opts.mode==='pull'?source.x-entity.x:entity.x-source.x),dy=Math.sign(opts.mode==='pull'?source.y-entity.y:entity.y-source.y);if(!dx&&!dy)break;
    let candidates;
    if(opts.orthogonal&&dx&&dy){const ax=Math.abs(source.x-entity.x),ay=Math.abs(source.y-entity.y);candidates=ax>=ay?[{x:entity.x+dx,y:entity.y},{x:entity.x,y:entity.y+dy}]:[{x:entity.x,y:entity.y+dy},{x:entity.x+dx,y:entity.y}]}
    else candidates=[{x:entity.x+dx,y:entity.y+dy}];
    let advanced=false;
    for(const q of candidates){
      if(q.x<0||q.y<0||q.x>=COLS||q.y>=ROWS)continue;
      let t=state.map?.[q.y]?.[q.x];const before={x:entity.x,y:entity.y};
      if(opts.mode!=='pull'&&!broken&&[TT.TABLE,TT.SCREEN,TT.BENCH,TT.CRATE,TT.BAMBOO,TT.LOW_FENCE].includes(t)&&!protectedProp105(q.x,q.y)&&!runtimeTerrainOccupants57(q.x,q.y).length){
       const base=furnitureFloor57(q.x,q.y),rr=RuntimeTerrainOwner.mutate(q.x,q.y,base,{source:'forced-furniture-collision'});if(rr.ok){releaseTerrainUnderlay58(q.x,q.y,base);delete terrainReactions105().burning[k(q.x,q.y)];if(state.branchTerrain105?.props)delete state.branchTerrain105.props[k(q.x,q.y)];touchElementTerrain105(q.x,q.y);elementBreakFx105(q.x,q.y,'wood');burst(q.x,q.y,'#b88a53',12,.7);alertNearby(q.x,q.y,6);broken++;if(player)applyHostileStatus('stun',1,1,{stagger:true});else setMonsterStatus(entity,'stunned',(entity.stunned||0)+1);t=base}
      }
      const kind=haz?.kind?.(t);
      if(player){
        if(OccupancyService.isOccupied(q.x,q.y))continue;
        if(kind||ReachabilityService.playerPassable(q.x,q.y)){
          const out=resolvePlayerLanding57(q.x,q.y,{cause:opts.mode==='pull'?'forced-pull':'forced-push',origin:before});
          if(out.ok){
            if(entity.x!==before.x||entity.y!==before.y){moved++;rememberVisualStep(q)}
            // Rescue, a ward activation, or a portal ends this displacement impulse.
            interrupted=!!(out.hazard&&out.result!=='adapted')||entity!==state.player||entity.x!==q.x||entity.y!==q.y;
            advanced=true;break;
          }
        }
      }else{
        if(kind&&!OccupancyService.isOccupied(q.x,q.y,entity)&&(q.x!==state.player.x||q.y!==state.player.y)){
          const out=haz.resolve?.(entity,t,q.x,q.y,before,{consumeTurn:false,forced:true,creditPlayer:opts.creditPlayer!==false});
          if(out){if(entity.x!==before.x||entity.y!==before.y){moved++;rememberVisualStep(q)}interrupted=out!=='adapted';advanced=true;break}
        }
        if(PlacementService.monsterCanStand(entity,q.x,q.y)){OccupancyService.move(entity,q.x,q.y);moved++;rememberVisualStep(q);advanced=true;break}
      }
    }
    if(advanced&&!slid&&!entity.flying&&state.map[entity.y]?.[entity.x]===TT.ICE){slid=true;limit++;floatText(entity.x,entity.y,'미끄러짐','#88bdce',9)}
    if(!advanced){const q=candidates[0],t=state.map?.[q.y]?.[q.x];if(t==null||runtimeTerrainSolid57(t))collision=q}
    if(!advanced||interrupted||entity.hp<=0||state.dead)break;
  }
  if(moved&&visualSteps.length)beginForcedMotion(entity,visualSteps);
  if(moved&&opts.log)addLog(opts.log);return{moved,resisted:false,collision,broken,slid}
}
function dangerousLootTerrain42(t){
  if(t==null)return true;
  const haz=globalThis.__MANRU_HAZARD_CORE__,kind=haz?.kind?.(t);
  if(kind)return true;
  return [TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY,TT.DRAWBRIDGE_UP,TT.TRAP,TT.SNARE,TT.CRUMBLE].filter(v=>v!=null).includes(t);
}
function pickup(...args){
  const action=playerAction57('pickup');if(!action.ok)return !!action.consumed;
  const ctx={args,ground:state?.items?.find(i=>i.x===state?.player?.x&&i.y===state?.player?.y)||null};
  for(let i=MANRU_PICKUP_PIPELINE_R25.handlers.length-1;i>=0;i--){const out=MANRU_PICKUP_PIPELINE_R25.handlers[i].fn(ctx);if(out?.handled)return out.result}
  for(let i=MANRU_PICKUP_PIPELINE_R25.stages.length-1;i>=0;i--)MANRU_PICKUP_PIPELINE_R25.stages[i].pre?.(ctx);
  const r=pickupBaseR25(...args);ctx.result=r;
  for(const st of MANRU_PICKUP_PIPELINE_R25.stages)st.post?.(ctx);
  return r;
}
  function terrainKey(tile,region,variant,frame,extra=''){return `${tile}:${region}:${variant}:${frame}:${extra}`}
  const TERRAIN986=new Map([
    [TT.PALACE_ROCK,{...palaceInspect(TT.PALACE_ROCK),inspectPriority57:'terrain'}],
    [TT.WALL,{desc:'두꺼운 내벽. 층을 거듭 증축하면서 오래된 벽 위에 새 벽을 덧댄 흔적이 남아 있다.'}],
    [TT.FLOOR,{desc:'수많은 발자국에 닳은 객주 바닥. 얼룩과 긁힌 자국이 지나간 사람들의 흔적을 남긴다.'}],
    [TT.STAIR,{desc:'더 깊은 층으로 내려가는 계단. 아래에서 올라오는 공기는 층이 바뀔 때마다 냄새부터 달라진다.',hint:'계단 위에서 내려가면 다음 층으로 진행한다.'}],
    [TT.DOOR,{desc:'두 공간을 가르는 무거운 문. 닫힌 문 너머의 시야와 동선을 끊는다.',hint:'가까이 다가가 열 수 있으며, 문 여는 소리는 주변의 주의를 끌 수 있다.'}],
    [TT.OPEN_DOOR,{desc:'열린 문. 오래된 경첩이 버티고 있지만 다시 닫힐 여지는 남아 있다.'}],
    [TT.RUMOR,{desc:'손때 묻은 종이와 낙서가 모인 기록판. 사실과 헛소문이 뒤섞여 있지만 만루를 먼저 지난 이들의 흔적이다.',hint:'조사하면 이 층이나 주변 구조에 관한 단서를 얻을 수 있다.'}],
    [TT.BRAZIER,{desc:'기름과 숯을 태우던 화로. 꺼진 뒤에도 금속에는 열과 그을음이 배어 있다.',hint:'불과 관련된 효과나 위험의 단서가 될 수 있다.'}],
    [TT.TRAP,{desc:'바닥 무늬 사이에 숨겨진 작동 장치. 밟는 순간에야 제대로 된 구조를 드러낸다.',hint:'밟으면 함정이 작동한다.'}],
    [TT.ARMORY,{desc:'병장기를 보관하던 자리. 벽과 바닥에는 날붙이를 걸어 두었던 홈이 남아 있다.',hint:'전투용 물품과 관련된 장소다.'}],
    [TT.WATER,{desc:'만루 안쪽을 흐르는 차가운 물. 바깥 수로와 이어진다는 말은 있지만 정확한 물길을 아는 사람은 없다.'}],
    [TT.FOUNTAIN,{desc:'오래된 정화수 샘. 맑은 물이 고여 있는데도 바닥에는 먼지가 거의 내려앉지 않는다.',hint:'접촉하면 몸을 추스르거나 상태를 정리하는 데 도움이 된다.'}],
    [TT.MIRROR,{desc:'사람의 얼굴보다 방 안의 빈 공간을 더 또렷하게 비추는 거울. 시선을 오래 두면 반사가 한 박자 늦는다.',hint:'거울과 관련된 기믹은 보이는 모습만 믿지 않는 편이 좋다.'}],
    [TT.ALTAR,{desc:'짙은 향과 오래된 핏자국이 남은 제단. 누가 무엇을 바쳤는지는 기록에서 지워져 있다.',hint:'공격·의지 상승 확률은 1 / (1 + 지금까지 제단에서 힘을 얻은 횟수). 실패하면 피를 바치거나 요괴가 나타난다.'}],
    [TT.VAULT,{desc:'두꺼운 장석과 자물쇠로 막은 금고. 귀중품을 지키려 만든 흔적이 지나치게 많다.',hint:'열 수 있다면 일반적인 방보다 좋은 보상을 기대할 수 있다.'}],
    [TT.SNARE,{desc:'바닥에 눌러 새긴 구속진. 선을 밟으면 기운이 엉켜 움직임을 방해하도록 짜여 있다.',hint:'발을 들이면 이동을 방해하는 효과가 생길 수 있다.'}],
    [TT.CACHE,{desc:'급히 숨겨 둔 보급함. 규격이 제각각이라 정식 창고 물건이라기보다 생존자들의 비축품에 가깝다.',hint:'조사하면 보급품을 얻을 수 있다.'}],
    [TT.COOKPOT,{desc:'그을음이 겹겹이 밴 큰 솥. 한때는 손님 수십 명의 식사를 동시에 끓였던 물건이다.',hint:'재료가 있다면 음식을 다루는 데 사용할 수 있다.'}],
    [TT.PAPER_BRIDGE,{desc:'물과 공허 위에 임시로 얹은 좁은 다리. 재료는 약해 보여도 발을 디딜 부분만큼은 치밀하게 겹쳐 놓았다.'}],
    [TT.JAR,{desc:'향신료와 장류를 저장하던 큰 장독. 봉인을 뜯은 흔적과 다시 덮은 흔적이 여러 겹 남아 있다.',hint:'깨뜨리거나 조사했을 때 안의 내용물이 드러날 수 있다.'}],
    [TT.LAVA,{desc:'성채 아래에서 끓는 용암. 돌벽을 오래 달군 탓에 가까이 가기만 해도 공기가 메마르다.',hint:'직접 밟는 것은 치명적이다. 안전한 구조물이나 다른 이동 수단을 찾아야 한다.'}],
    [TT.DRAWBRIDGE_DOWN,{desc:'무거운 사슬로 내린 도개교. 해자와 단절된 공간을 잇기 위한 성채의 통로다.'}],
    [TT.VOID,{desc:'바닥도 벽도 없는 검은 틈. 빛을 비추면 가장자리만 보이고 깊이는 끝내 드러나지 않는다.',hint:'걸어서 건널 수 없다. 점멸이나 연결 구조가 필요하다.'}],
    [TT.GOLD,{desc:'바닥 틈에서 새어 나오는 금빛 잔광. 금속 그 자체보다 오래된 술식의 잔재에 가깝다.'}],
    [TT.MERCURY,{desc:'거울처럼 빛나는 수은 웅덩이. 표면은 잔잔하지만 주변 공기에는 차갑고 금속성인 냄새가 맴돈다.',hint:'빠지면 가까운 뭍을 붙잡아도 HP 1만 남는다. 붙잡을 곳이 없으면 빠져나올 수 없다.'}],
    [TT.SWITCH,{desc:'벽과 바닥의 다른 장치에 이어진 기계식 조작부. 닳은 부분을 보면 여러 번 사용된 흔적이 있다.',hint:'작동시키면 연결된 구조물의 상태가 바뀔 수 있다.'}],
    [TT.DRAWBRIDGE_UP,{desc:'위로 들려 올라간 도개교. 반대편은 보이지만 현재 상태로는 통로 역할을 하지 못한다.',hint:'연결된 장치를 찾아 내려야 건널 수 있다.'}],
    [TT.BAMBOO,{desc:'빛을 삼키듯 빽빽하게 자란 대나무. 바람이 없는데도 잎끼리 스치는 소리가 끊이지 않는다.',hint:'길을 막고 있다면 베어 통로를 낼 수 있지만 소리가 날 수 있다.'}],
    [TT.TABLE,{desc:'손님을 받던 연회상. 표면에는 술잔 자국과 칼자국, 급하게 밀어낸 그릇의 흔적이 겹쳐 있다.',hint:'길을 막고 있다면 치우거나 부술 수 있다.'}],
    [TT.SCREEN,{desc:'방 안의 시선을 끊는 비단 병풍. 천은 낡았지만 안쪽 그림만 이상하리만큼 선명하다.',hint:'부수거나 치우면 뒤쪽 공간이 드러날 수 있다.'}],
    [TT.GRASS,{desc:'실내라고 믿기 어려울 만큼 짙게 자란 풀. 수묵원에서는 벽보다 이 풀이 공간의 경계를 더 흐리게 만든다.'}],
    [TT.HEDGE,{desc:'사람 키 가까이 자란 생울타리. 가지를 얽어 일부러 길을 막은 흔적이 있다.',hint:'베어 통로를 만들 수 있지만 주변 적이 소리를 들을 수 있다.'}],
    [TT.RAFT,{desc:'강을 건너기 위해 묶어 만든 나무 뗏목. 물살에 맞춰 움직이도록 밑바닥의 결속이 독특하게 짜여 있다.',hint:'향수강에서는 강을 실제로 건너는 주 이동 수단이다.'}],
    [TT.FAKE_DOOR,{desc:'문처럼 꾸민 가짜 출입구. 손잡이와 경첩은 있지만 벽 뒤로 이어지는 공간은 없다.',hint:'진짜 문과 같은 방식으로 믿고 움직이면 시간을 낭비할 수 있다.'}],
    [TT.LOCKED_GATE,{desc:'두꺼운 철판과 잠금쇠로 닫힌 격벽. 힘으로 밀기보다 정해진 해제 절차를 요구하는 구조다.',hint:'해당 층의 열쇠나 장치를 찾아야 열린다.'}],
    [TT.KEY_TILE,{desc:'창고와 격벽의 잠금장치에 맞는 작은 열쇠. 관리자가 구역별로 나눠 보관했던 물건이다.',hint:'해당 층의 잠긴 구조를 여는 데 사용된다.'}],
    [TT.STAMINA_PAD,{desc:'바닥에 새긴 기 회복진. 선을 따라 미세한 열이 돌며 잠시 호흡을 고르게 만든다.',hint:'발판 위에서는 점멸에 필요한 기를 회복하는 데 도움이 된다.'}],
    [TT.PEACH_TREE,{desc:'지하 깊은 곳에서도 꽃과 열매를 맺는 복숭아나무. 뿌리가 어느 흙에 닿아 있는지는 알 수 없다.',hint:'길을 막은 나무는 베어낼 수 있다.'}],
    [TT.SECRET_DOOR,{desc:'벽과 거의 같은 재료로 숨긴 비밀문. 틈과 먼지의 방향을 자세히 보면 일반 벽과 조금 다르다.',hint:'조사하거나 가까이 다가가면 숨은 통로를 찾을 수 있다.'}],
    [TT.PAVILION,{desc:'물과 정원 사이에 세운 작은 정자. 휴식용 건축물인데도 깊은 층의 것들은 마치 누군가를 기다리는 자리처럼 배치돼 있다.'}],
    [TT.HIDDEN_BRIDGE,{desc:'주변 바닥과 물결이 아주 미세하게 어긋나는 지점. 무언가가 아래에 숨겨져 있는 듯하다.',hint:'세심하게 조사하면 숨은 통로의 정체가 드러날 수 있다.'}],
    [TT.HIDDEN_WALL,{desc:'주변 벽과 결이 조금 다른 구조물. 먼지와 균열이 한쪽으로만 끊겨 있다.',hint:'숨은 문이나 샛길일 가능성이 있다.'}],
    [TT.CRUMBLE,{desc:'금이 간 불안정한 발판. 무게를 받은 뒤에도 그대로 버틴다는 보장은 없다.',hint:'한 번 지나간 뒤 무너질 수 있으므로 퇴로를 생각해야 한다.'}],
    [TT.LIGHT_GRASS,{desc:'유난히 밝은 연두빛 풀. 만루의 조명보다 스스로 가진 빛에 가까운 색을 띤다.'}],
    [TT.STONE_PILLAR,{desc:'천장과 회랑을 받치는 석주. 표면의 마모가 심해 오래전부터 길의 경계와 엄폐물 역할을 해 왔다.'}],
    [TT.LANTERN_POST,{desc:'객주식 등롱을 매단 기둥. 기름은 거의 남지 않았는데도 심지 주변에는 최근의 그을음이 보인다.'}],
    [TT.WALL_BANNER,{desc:'벽을 길게 덮은 장식 깃발. 층마다 문양과 천의 색이 달라 한때 구역을 구분하는 표식으로 쓰였음을 알 수 있다.'}],
    [TT.CRATE,{desc:'운반용 목상자. 못을 여러 번 뽑고 다시 박은 흔적이 있어 같은 상자가 오랫동안 재사용된 듯하다.'}],
    [TT.BENCH,{desc:'긴 목제 의자. 손님과 일꾼이 잠깐 쉬던 자리지만 지금은 먼지와 긁힌 자국만 남았다.'}],
    [TT.FLOWERBED,{desc:'정원 안쪽의 작은 화단. 계절도 햇빛도 없는 곳에서 꽃의 종류만 계속 바뀌어 왔다.'}],
    [TT.ROCK,{desc:'수묵원의 흐름을 잡기 위해 놓은 정원석. 자연석처럼 보이지만 바닥 깊숙이 고정되어 있다.'}],
    [TT.STATUE,{desc:'이름이 지워진 인물을 새긴 석상. 얼굴 부분만 유독 많이 닳아 누군가 반복해서 손을 댄 듯하다.'}],
    [TT.RACK,{desc:'도구와 병기를 걸어 두는 진열 선반. 빈 칸의 모양으로 무엇이 사라졌는지만 짐작할 수 있다.'}],
    [TT.LOW_FENCE,{desc:'구역을 느슨하게 나누는 낮은 목책. 침입을 막기보다는 사람의 동선을 유도하기 위한 구조다.'}],
    [TT.CARPET,{desc:'회랑을 따라 깔린 두꺼운 융단. 발소리를 죽이고 바닥의 오래된 균열을 감춘다.'}],
    [TT.STONE_PATH,{desc:'정원과 강가에 이어진 석판길. 반복된 물기와 발자국 때문에 돌의 가장자리만 둥글게 닳았다.'}],
    [TT.WINDOW,{desc:'얇은 창호와 격자로 만든 창문. 바깥을 향해야 할 구조인데 대부분 다른 방이나 어둠만 비춘다. 몸은 지나가지 못하지만, 시야와 일부 사격물은 창 틈 사이로 오갈 수 있다.'}],
    [TT.WOOD_FLOOR,{desc:'밝은 황목으로 짠 마루. 습한 구역에서도 썩지 않아 수상 건물과 찻집에 주로 쓰였다.'}],
    [TT.MOON_STONE,{desc:'달빛 같은 회색빛을 띠는 석판. 차가운 표면이 주변의 소리와 열을 조금씩 삼키는 듯하다.'}],
    [TT.DARK_WOOD,{desc:'검게 기름먹인 목재 바닥. 무대와 창고처럼 발소리를 감춰야 하는 곳에 주로 깔려 있다.'}],
    [TT.GILDED_FLOOR,{desc:'금선을 박아 문양을 만든 바닥. 실제 금보다 의식용 경계선을 강조하기 위한 장식에 가깝다.'}],
    [TT.PAPER_CRANE,{desc:'색종이를 정교하게 접어 만든 종이학. 습한 공기 속에서도 접힌 선이 흐트러지지 않는다.'}],
    [TT.LOTUS_FLOWER,{desc:'얕은 물과 정원 가장자리에 피어난 연꽃. 뿌리가 닿을 흙이 없는 자리에서도 멀쩡히 자란다.'}],
    [TT.INCENSE_STAND,{desc:'향을 여러 자루 피우는 낮은 향대. 남은 재의 향이 층마다 조금씩 다른 냄새를 품고 있다.'}],
    [TT.IRON_HOOK,{desc:'천장과 벽에 박은 두꺼운 철제 걸이. 짐을 달기엔 지나치게 튼튼하고, 표면에는 오래된 마찰 자국이 남아 있다.'}],
    [TT.GOLD_LAMP,{desc:'금빛 갓을 씌운 등불. 불꽃이 작아도 주변의 금선과 수은 표면에 빛이 멀리 번진다.'}],
    [TT.PETAL_MAT,{desc:'말린 꽃잎을 엮어 만든 깔개. 밟으면 바스러질 것 같지만 새 꽃잎이 계속 섞여 들어간다.'}],
    [TT.GARDEN_TREE,{desc:'수목원 안에 뿌리내린 큰 나무. 가지가 천장을 피해 휘어진 모양으로 보아 오랫동안 이곳에서 자랐다.'}],
    [TT.RUMOR_BED,{desc:'숨은 치료실과 숙영실에 남겨진 낡은 침상. 얇은 매트와 목제 틀에는 오래 누워 있던 사람의 자국과 급하게 비운 흔적이 함께 남아 있다.',hint:'통로를 막는 고정 가구다. 침상 자체에서 보상이 나오지는 않는다.'}],
    [TT.RUMOR_MED_CABINET,{desc:'약병과 붕대, 치료 도구를 분류하던 약품 찬장. 비어 있는 칸과 남은 얼룩으로 보아 필요한 약부터 누군가 가져간 듯하다.',hint:'치료실의 용도를 보여 주는 전용 장식이다.'}],
    [TT.RUMOR_GAS_PIPE,{desc:'독가스 밀폐실 벽을 따라 이어진 굵은 가스관. 밸브는 봉인되어 있지만 이음새 주변에는 녹색 변색과 부식 흔적이 남아 있다.',hint:'독가스 방의 위험을 예고하는 구조물이다. 주변 가스 필드를 주의해야 한다.'}],
    [TT.RUMOR_FLOOD_GRATE,{desc:'침수 저장고의 물을 빼기 위해 만든 낮은 배수격자. 녹과 이끼가 끼어 있어 제 기능을 잃은 지 오래다.',hint:'통행은 가능하지만 침수 구역의 물길과 경계를 읽는 표식으로 쓰인다.'}],
    [TT.RUMOR_ARCHIVE_PILE,{desc:'무너진 서가에서 쏟아진 장부와 기록철 더미. 종이는 눅눅하게 들러붙었고 일부 페이지는 의도적으로 찢겨 있다.',hint:'서고의 붕괴 흔적을 보여 주는 전용 장애물이다.'}],
    [TT.RUMOR_WEAPON_RACK,{desc:'경비대가 창과 칼을 세워 두던 무기걸이. 비어 있는 홈의 수가 많아 이 방이 실제 보급 거점으로 쓰였음을 보여 준다.',hint:'경비·보급 계열 숨은방의 전용 장식이다.'}],
    [TT.RUMOR_SILK_DIVAN,{desc:'비단 내실에서 손님이나 관리자가 기대어 앉던 낮은 좌상. 천은 화려하지만 손잡이와 모서리만 유난히 닳아 있다.',hint:'비단 계열 숨은방의 분위기를 구분하는 고정 가구다.'}],
    [TT.RUMOR_RITUAL_OBELISK,{desc:'금빛 제례실에 세운 좁고 높은 석주. 면마다 서로 다른 봉인 문양이 새겨져 있고 바닥의 금선이 이 석주를 중심으로 갈라진다.',hint:'제례·심장부 계열 숨은방의 전용 구조물이다.'}],
    [TT.RUMOR_CHARRED_COUNTER,{desc:'폐주방에 남은 조리대. 칼자국보다 불에 갈라진 자국이 더 많고, 한쪽은 화재 당시의 열로 검게 휘어 있다.',hint:'불타버린 주방의 전용 장애물이다.'}],
    [TT.RUMOR_INVESTIGATION_BOARD,{desc:'조사관들이 허가도면과 현장 구조를 대조하던 대형 도면판. 붉은 실과 표시가 여러 숨은 구획을 가리키지만 일부 표식은 뜯겨 나갔다.',hint:'조사관 임시본부의 세계관 단서이자 시야를 일부 가리는 고정 장식이다.'}],
    [TT.RUMOR_SMUGGLER_BUNDLE,{desc:'밀수품을 천과 끈으로 급하게 묶어 둔 포대. 식량과 잡화 냄새가 섞여 나며 겉면에는 정식 창고 표식이 없다.',hint:'밀수 은닉처의 전용 장애물이다.'}],
    [TT.RUMOR_GREENHOUSE_FRAME,{desc:'유리온실을 떠받치던 금속·목재 골조. 유리는 대부분 사라졌지만 프레임에는 습기와 덩굴이 깊게 들러붙어 있다.',hint:'온실의 높이와 구획을 드러내는 전용 구조물이며 시야를 일부 가린다.'}],
    [TT.PORTAL,{desc:'공간을 접어 다른 방과 맞붙이는 무명 포탈. 표면에는 목적지를 나타내는 글자나 문양이 없다.',hint:'들어가기 전에는 어느 방으로 이어질지 지형만으로 확정하기 어렵다.'}]
  ]);
  function terrainInfo986(t,x,y){
    const definition=TERRAIN986.get(t);if(definition?.inspectPriority57==='terrain')return{name:terrainName(t),...definition};
    const world=terrainReactions105(),steam=state.tempFields?.find(f=>f.kind==='steam'&&f.x===x&&f.y===y&&f.ttl>0),spill=world.spills?.[k(x,y)],clue=world.clues?.[k(x,y)];
    if(steam)return{name:'증기',desc:`${steam.ttl}턴 동안 시야와 사선을 가린다.`,hint:'통행 가능. 피해·중독·경직이 없으며 소리는 통과한다.'};
    if(clue)return{name:terrainName(t)+' · 틈새 흔적',desc:clue.elem==='water'?'물이 벽 틈으로 스며들어 문처럼 생긴 윤곽을 남겼다.':'벽 틈으로 연기가 새어 나온다.',hint:'이 근처의 벽을 조사하거나 상호작용해 보자.'};
    if(spill)return{name:({water:'얕은 물자국',oil:'기름 웅덩이',poison:'독액',wine:'쏟아진 술'})[spill.kind],desc:`남은 ${spill.ttl}턴. `+({water:'몸의 불을 끈다.',oil:'불에 닿으면 화염이 생기며 개체의 연소가 5턴으로 늘어난다.',poison:'밟으면 중독된다.',wine:'밟으면 취기·약화, 불에 닿으면 점화된다.'})[spill.kind],hint:'물속성으로 기름·독·술을 씻어낼 수 있다.'};
    if([TT.DOOR,TT.OPEN_DOOR].includes(t)&&!protectedProp105(x,y)&&!world.burning[k(x,y)])return{name:terrainName(t),desc:'일반 목제문. 불에 닿으면 3턴간 타고 무너지며 검게 탄 숯을 남긴다.',hint:'문을 열거나 닫아도 연소는 이어진다. 물로 끌 수 있다.'};
    if(t===TT.JAR){const contents=jarContents105(x,y);return{name:'장독',desc:({water:'물',oil:'기름',poison:'독액',wine:'술'})[contents]+'이 담겨 있다. '+(contents==='poison'?'깨지면 독가스가 점차 퍼진 뒤 옅어진다.':'깨지면 주변 바닥에 5턴간 쏟아진다.'),hint:'일반 공격·사격·강제 파괴로 깨진다. 공격 한 번으로 깨며 그 칸으로 이동하지 않는다.'};}
    if(t===TT.MIRROR)return{name:'천면경',desc:'차가운 유리면이 광선과 시선 공격을 발원자에게 되돌린다.',hint:'공격 경로 위의 거울만 반사한다. 화살·투척물·폭발은 반사하지 않는다.'};
    if(t===TT.PAPER_BRIDGE&&!world.burning[k(x,y)])return{name:'종이다리',desc:'플레이어가 밟거나 물속성이 닿으면 붕괴를 예고한다. 몬스터의 보행만으로는 무너지지 않는다.',hint:'불이 붙으면 3턴간 화염 접촉 지대가 되고, 다 타면 물로 무너진다.'};
    if(t===TT.CRATE&&!world.burning[k(x,y)])return{name:'목상자',desc:'불에 타고, 강하게 밀린 개체와 충돌하면 부서진다.',hint:'바로 앞에서 바라보고 상호작용(F)하면 1칸 민다. 통로를 봉쇄하는 밀기는 불가.'};

    if(t===TT.ICE){const left=state.tempTerrain74?.find(q=>q.x===x&&q.y===y&&q.kind==='frozen-water105')?.ttl;return{name:'얼어붙은 물',desc:`냉기에 얼어 잠시 건널 수 있다. ${left??'?'}턴 뒤 물로 돌아간다.`,hint:'냉기를 다시 가하면 5턴으로 연장된다. 불·대지에 닿으면 즉시 깨진다. 강제이동은 1칸 더 미끄러진다. 해빙 시 물의 위험 판정이 적용된다.'};}
    const burn=state.terrainReactions105?.burning?.[k(x,y)];if(burn&&t===TT.PAPER_BRIDGE)return{name:'종이다리 · 연소 중',desc:`${Math.max(0,3-burn.age)}턴 뒤 타서 무너진다.`,hint:'진입하거나 머무는 개체에게 불이 붙는다. 물로 소화해도 젖은 다리의 붕괴 예고는 남는다.'};if(burn)return{name:terrainName(t)+' · 연소 중',desc:`목재가 타고 있다. ${Math.max(0,3-burn.age)}턴 뒤 검은 숯으로 무너진다.`,hint:'상하좌우의 가연물로 매 턴 번진다. 물속성으로 끌 수 있다.'};if(terrainUnlit105(x,y)&&lightAt(x,y))return{name:terrainName(t)+' · 꺼짐',desc:'물기운에 불씨가 꺼졌다.',hint:'불속성으로 다시 지필 수 있다. 꺼진 조리기구는 사용할 수 없다.'};
    if(state.branchTerrain105?.mountainVersion105){const s=state.branchTerrain105.surfaces[k(x,y)],prop=state.branchTerrain105.props[k(x,y)];if(s==='cliff')return{name:'등고선 절벽벽',desc:'산비탈의 단차가 드러난 암벽. 실제 벽으로 이동과 시야를 막는다.',hint:'열린 산길로 돌아가야 한다. 검은 낭떠러지와는 다르다.'};if(prop==='deadTree')return mountainDeadTreeInfo();}
    const mineInfo=mineInspect(t,x,y);if(mineInfo)return mineInfo;
    const branchInfo=branchTerrainInfo(t,x,y);if(branchInfo)return branchInfo;
    const bp=state.branchPortals105?.find(p=>p.x===x&&p.y===y);if(bp)return branchPortalInfo(bp);
    if(state.branchContext105&&state.branchTerrain105?.surfaces[k(x,y)]==='stairs')return{name:'산채 돌계단',desc:'절벽벽의 열린 틈을 잇는 산길. 나무와 절벽벽 사이를 따라 오른다.',hint:'실제 절벽벽과 나무가 이동·시야를 막는다.'};
    if(t===TT.ALTAR){const gains=Math.max(0,Math.floor(Number(state.player.bloodAltarGains105)||0));return{name:'혈흔 제단',desc:TERRAIN986.get(t).desc,hint:`지금까지 힘을 얻은 횟수 ${gains}회 · 다음 공격·의지 상승 확률 ${Number((50/(1+gains)).toFixed(1))}%. 실패하면 피를 바치거나 요괴가 나타난다.`};}
    const base=TERRAIN986.get(t)||{desc:'만루를 이루는 이름 없는 구조물. 오래된 생활 흔적과 뒤늦게 덧붙은 증축의 흔적이 함께 남아 있다.'};
    const style=state?.floorStyle980?.[k(x,y)]||state?.subthemeFloors972?.[k(x,y)]||state?.wallStyle980?.[k(x,y)]||state?.subthemeWalls970?.[k(x,y)];
    const room=(state?.featureRooms||[]).find(r=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h);
    const tag=routeTagAt(x,y),extra=STYLE_LORE[style]||'';
    let desc=base.desc;
    if(extra&&!desc.includes(extra))desc+=` ${extra}`;
    else if(room?.name&&!/바닥|벽|문/.test(terrainName(t)))desc+=` ${room.name}에 놓인 구조물이다.`;
    const name=t===TT.PORTAL?(state?.portalLinks981?.[k(x,y)]?'접힌 문':state?.artifactPortal46?.x===x&&state?.artifactPortal46?.y===y?'전설무기 던전 입구':state?.artifactExit46?.x===x&&state?.artifactExit46?.y===y?'전설무기 던전 귀환문':terrainName(t)):terrainName(t);
    const legendHint=legendTerrainHint(t,x,y);
    const materialHint=elementMaterial105(t,'wood',x,y)?'불속성이 닿으면 3턴간 타며 인접 가연물로 번진다. 물속성으로 끌 수 있다.':elementMaterial105(t,'stone')?'땅속성이 닿으면 돌가루와 파편을 튀기며 부서진다.':lightAt(x,y)?'물속성으로 끄고 불속성으로 다시 지필 수 있다.':'';return{name,desc,hint:[legendHint||base.hint||'',materialHint].filter(Boolean).join(' ')};
  }
// Environmental reactions share contact, occupancy and temporary-field owners.
function protectedProp105(x,y,world=state){
 return world.terrainAttachment58?.[k(x,y)]==='secret-wall'||world.map[y]?.[x]===TT.SECRET_DOOR||world.map[y]?.[x]===TT.LOCKED_GATE||world.branchPortals105?.some(q=>q.x===x&&q.y===y)||world.keyPlan96?.groups?.some(g=>(g.doors||[]).some(q=>q.x===x&&q.y===y))||(world===state&&globalThis.__MANRU_RUMOR_SPACES1030__?.mutationLocked?.(x,y));
}
const MANRU_PICKUP_PIPELINE_R25={stages:[],handlers:[]};
function environmentStanding105(entity){
 if(!entity||entity.hp<=0)return;
 const r=terrainReactions105(),cells=entityFootprintCells57(entity);
 for(const q of cells){const t=state.map[q.y]?.[q.x],spill=r.spills?.[k(q.x,q.y)];
  if(isWaterTile105(t)||(!entity.flying&&spill?.kind==='water')){combustionContact105(entity,'water');continue;}
  if(!entity.flying){
   const fields=[...(state.tempFields||[]).filter(f=>f.kind==='fire').map(f=>({...f,cells:tempFieldCells57(f),damage:3})),...(state.elementFields74||[]).filter(f=>f.kind==='fire').map(f=>({...f,cells:f.cells??elementCells105(f.x,f.y,1)})),...(state.legendFireFields47||[]).map(f=>({...f,cells:f.cells??[{x:f.x,y:f.y}],damage:3}))].filter(f=>f.ttl>0&&f.cells.some(c=>c.x===q.x&&c.y===q.y));
   const field=fields.sort((a,b)=>(b.damage||3)-(a.damage||3))[0],burn=r.burning[k(q.x,q.y)];
   if(field||burn)combustionContact105(entity,'fire',field?fieldProvenance57(field):burn.source||{},{floorDamage:field?Math.max(3,field.damage||3):0});
  }
  if(!entity.flying&&spill&&spill.lastHit?.[entity===state.player?'player':entity.id57||entity.name+':'+entity.x+','+entity.y]!==state.turn){
   const id=entity===state.player?'player':entity.id57||entity.name+':'+entity.x+','+entity.y;spill.lastHit||={};spill.lastHit[id]=state.turn;
   if(spill.kind==='poison')applyCombatStatus(entity,'poison',3);
   if(spill.kind==='wine')applyCombatStatus(entity,'drunk',2);
  }
 }
}
function hz(){return state?state.hazard1005:null}
