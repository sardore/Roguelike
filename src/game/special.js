function buildMercuryLake(m){
    carveRect(m,1,1,COLS-2,ROWS-2,TT.FLOOR);state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];state.layoutName='수은 연못 · 대용잠';setFixedEnds({x:3,y:ROWS-4},{x:COLS-4,y:3});const cy=Math.floor(ROWS/2),lx=Math.floor(COLS*.18),lw=Math.floor(COLS*.64),ly=Math.floor(ROWS*.18),lh=Math.floor(ROWS*.62);carveRect(m,lx,ly,lw,lh,TT.MERCURY);for(let x=lx;x<lx+lw;x++)setTerrainTile58(m,x,cy,TT.DRAWBRIDGE_DOWN);carveRect(m,Math.floor(COLS*.41),Math.floor(ROWS*.36),Math.floor(COLS*.18),Math.floor(ROWS*.27),TT.FLOOR);setTerrainTile58(m,Math.floor(COLS/2),cy,TT.PAVILION);setTerrainTile58(m,Math.floor(COLS/2),ly+3,TT.CACHE);setTerrainTile58(m,lx+4,ly+lh-3,TT.RUMOR);
  }
function buildPeachGarden(m){
    carveRect(m,1,1,COLS-2,ROWS-2,TT.GRASS);state.rooms=[roomRect(1,1,COLS-2,ROWS-2)];state.layoutName='만루보주의 정원 · 대선도원';const cy=Math.floor(ROWS/2);setFixedEnds({x:3,y:ROWS-4},{x:COLS-4,y:3});for(let x=2;x<COLS-2;x++)setTerrainTile58(m,x,cy,TT.WATER);for(const ratio of [.18,.40,.62,.83])setTerrainTile58(m,Math.floor(COLS*ratio),cy,TT.DRAWBRIDGE_DOWN);for(let y=6;y<ROWS-5;y+=8)for(let x=6;x<COLS-5;x+=9)if(Math.abs(y-cy)>3)setTerrainTile58(m,x,y,peachTerrain());setTerrainTile58(m,Math.floor(COLS/2),ROWS-6,TT.COOKPOT);setTerrainTile58(m,Math.floor(COLS/2),5,TT.BRAZIER);setTerrainTile58(m,4,9,TT.RUMOR);
  }
function generateBossFloor(){const m=makeEmptyMap();state.rooms=[];state.items=[];state.monsters=[];state.decals=[];state.switches=[];state.rafts=[];state.routeTags=[];state.floorKeys=0;state.floorKeysRequired=0;state.cipher=null;state.visionPenalty=0;state.specialFloor=true;state.floorTurn=0;state.alert=0;state.bossDefeated=false;const f=state.floor,cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);
 if(f===5){addRoom(m,4,3,COLS-8,ROWS-6);for(let y=8;y<ROWS-7;y+=5)for(let x=8;x<COLS-7;x+=6)setTerrainTile58(m,x,y,TT.TABLE);for(const [x,y] of [[6,5],[COLS-7,5],[6,ROWS-6],[COLS-7,ROWS-6],[cx,cy]])setTerrainTile58(m,x,y,TT.BRAZIER);state.layoutName='청풍루 대연회장 · 폐연';}
 else if(f===10){addRoom(m,3,3,COLS-6,ROWS-6);carveRect(m,8,6,COLS-16,ROWS-12,TT.WATER);carveRect(m,cx-5,cy-4,11,9,TT.FLOOR);for(let x=8;x<COLS-8;x++)setTerrainTile58(m,x,cy,TT.PAPER_BRIDGE);for(let y=6;y<ROWS-6;y++)setTerrainTile58(m,cx,y,TT.PAPER_BRIDGE);setTerrainTile58(m,cx,cy,TT.PAVILION);state.layoutName='화공의 수묵화폭';}
 else if(f===15){addRoom(m,3,3,COLS-6,ROWS-6);for(let y=6;y<ROWS-5;y+=5)for(let x=7;x<COLS-6;x+=6)setTerrainTile58(m,x,y,TT.MIRROR);for(let x=7;x<COLS-7;x+=7)setTerrainTile58(m,x,cy,TT.SCREEN);state.layoutName='천면 비단극장';}
 else if(f===20){addRoom(m,3,3,COLS-6,ROWS-6);for(let y=6;y<ROWS-5;y+=6)for(let x=7;x<COLS-6;x+=6)setTerrainTile58(m,x,y,TT.JAR);for(let x=7;x<COLS-7;x++){if(x!==cx)setTerrainTile58(m,x,9,TT.SCREEN);if(x%5!==0)setTerrainTile58(m,x,ROWS-10,TT.TABLE)}setTerrainTile58(m,cx,5,TT.ARMORY);setTerrainTile58(m,cx,ROWS-6,TT.COOKPOT);state.layoutName='장고 심부 · 거대 형틀';}
 else{addRoom(m,3,3,COLS-6,ROWS-6);for(let y=5;y<ROWS-5;y++)for(let x=5;x<COLS-5;x++){if((x<14||x>COLS-15)&&(y>8&&y<ROWS-8))setTerrainTile58(m,x,y,TT.VOID)}carveRect(m,cx-6,6,13,8,TT.MERCURY);for(let x=cx-6;x<=cx+6;x++)setTerrainTile58(m,x,13,TT.DRAWBRIDGE_DOWN);for(let y=ROWS-11;y<ROWS-5;y++)for(let x=cx-8;x<=cx+8;x++)if((x+y)%3===0)setTerrainTile58(m,x,y,TT.GOLD);state.layoutName='만루의 심장 · 천실핵';}
 state.map=m;state.player.x=cx;state.player.y=ROWS-4;state.stairs={x:cx,y:ROWS-5};setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.STAIR);const bp={x:cx,y:f===25?6:7};OccupancyService.addMonster(makeBoss(BOSSES[f],bp));state.visible=new Set();state.seen=new Set();VisibilityService.compute()}
const ShopMapBuilder=Object.freeze({
groundAt(x,y){return state?.shopIntermission?.active?state.shopIntermission.stock.find(r=>!r.soldOut&&r.x===x&&r.y===y)||null:null},
saleValue(item){
 if(!item||!['relic','sealed'].includes(item.rarity)||!['weapon','armor','cloak','relic','trinket','potion','talisman','food'].includes(item.type))return 0;
 if(item.artifactWeapon46||item.legendaryWeapon47||item.artifactId46||item.storyId||item.storyItem||item.debug||item.debugOnly||item.keyId||item.foodKind==='coin_candy'||item.curse991||item.cursed)return 0;
 if(['weapon','armor','cloak','relic','trinket'].some(slot=>state.player[slot]===item))return 0;
 return item.rarity==='sealed'?2:1;
},
build(){
 const shop=state.shopIntermission,theme=shop.theme,rule=SHOP_RULES58[theme],merchant=shop.merchant;
 merchant.x=rule.merchant[0];merchant.y=rule.merchant[1];
 COLS=rule.size[0];ROWS=rule.size[1];
 Object.assign(state,{terrainReactions105:newTerrainReactions105(),map:makeEmptyMap(),terrainUnderlay58:{},terrainAttachment58:{},neutralInteractables58:[merchant],rooms:[],items:[],monsters:[],decals:[],decor:[],switches:[],rafts:[],routeTags:[],featureRooms:[],restaurantRooms42:[],rumorSpaces1030:[],hiddenGroups60:[],hiddenLookup60:{},hiddenBase60:{},hiddenReplacement60:{},keyPlan96:null,typedKeys96:null,artifactDungeon46:null,artifactPortal46:null,artifactReturn46:null,legendDecor47:[],legendObjects49:[],legendLights49:[],legendBuildings49:[],legendPaths49:[],legendDecorGrid47:{},portalLinks981:{},portalRooms981:[],floorStyle980:{},floorPattern1022:{},rugPattern1022:{},specialPlaces52:null,libraryRooms1022:[],subthemeWalls970:{},archDecor1020:{},archDecor1023:{},outerWall94:{},tempFields:[],tempTerrain74:[],elementFields74:[],legendFireFields47:[],legendTerrain47:[],legendSkyAxes47:[],artifactFields46:[],jarGasFields57:[],gazeBursts57:[],pendingGroundItems57:[],specialFloor:false,layoutName:rule.room,seen:new Set(),visible:new Set(),visionPenalty:0,requiresBlink:false,cipher:null,grassTufts1020:new Set(),floorKeys:0,floorKeysRequired:0});
 const cx=Math.floor(COLS/2),base=[TT.WOOD_FLOOR,TT.STONE_PATH,TT.DARK_WOOD,TT.STONE_PATH][theme],wallLight=['lantern','lampstand','lantern','lantern'][theme];
 carveRect(state.map,2,2,COLS-4,9,base);
 carveRect(state.map,cx-3,12,6,ROWS-13,base);
 // Two adjacent door leaves mark the end of the light-lined approach.
 for(const x of[cx-1,cx])setTerrainTile58(state.map,x,11,TT.DOOR);
 // Recessed wall lights leave six clear walking columns; paired alcoves widen only to eight.
 for(let y=14;y<ROWS-2;y+=3)for(const x of[cx-3,cx+2])setTerrainTile58(state.map,x,y,TT.GOLD_LAMP);
 for(const x of[4,COLS-5])setTerrainTile58(state.map,x,2,TT.GOLD_LAMP);
 if(theme===0){for(const x of[3,COLS-4])setTerrainTile58(state.map,x,3,TT.RACK);for(let x=6;x<=12;x++)if(x!==9)setTerrainTile58(state.map,x,5,TT.CRATE);setTerrainTile58(state.map,6,4,TT.CRATE);setTerrainTile58(state.map,12,4,TT.CRATE);setTerrainTile58(state.map,9,1,TT.WALL_BANNER)}
 if(theme===1){carveRect(state.map,2,2,7,7,TT.GRASS);carveRect(state.map,11,2,8,7,TT.WOOD_FLOOR);for(const[x,y,t]of[[5,3,TT.LOTUS_FLOWER],[3,6,TT.GARDEN_TREE],[7,5,TT.ROCK],[8,3,TT.SCREEN],[11,5,TT.CRATE],[12,6,TT.CRATE],[13,6,TT.CRATE],[15,6,TT.CRATE],[16,6,TT.CRATE],[17,5,TT.CRATE]])setTerrainTile58(state.map,x,y,t)}
 if(theme===2){for(const x of[3,17]){setTerrainTile58(state.map,x,6,TT.SCREEN);setTerrainTile58(state.map,x,8,TT.INCENSE_STAND)}for(const x of[7,8,9,11,12,13])setTerrainTile58(state.map,x,5,TT.CRATE);setTerrainTile58(state.map,6,3,TT.RUMOR_SILK_DIVAN);setTerrainTile58(state.map,14,3,TT.RUMOR_SILK_DIVAN);setTerrainTile58(state.map,10,1,TT.WALL_BANNER)}
 if(theme===3){carveRect(state.map,10,2,3,9,TT.WOOD_FLOOR);for(const x of[3,5,7])for(const y of[5,7])setTerrainTile58(state.map,x,y,(x+y)%4?TT.JAR:TT.CRATE);for(const[x,y,t]of[[14,3,TT.CRATE],[14,4,TT.CRATE],[14,5,TT.CRATE],[15,6,TT.CRATE],[17,6,TT.CRATE],[18,5,TT.CRATE],[19,3,TT.IRON_HOOK],[6,2,TT.RACK]])setTerrainTile58(state.map,x,y,t)}
 const positions=theme===0?[[5,8],[7,8],[9,8],[11,8],[13,8]]:theme===1?[[10,8],[12,8],[14,8],[16,8],[18,8]]:theme===2?[[6,8],[8,8],[10,8],[12,8],[14,8]]:[[10,8],[12,8],[14,8],[16,8],[18,8]];
 shop.stock.forEach((row,i)=>{const p=positions[i];row.x=p[0];row.y=p[1]});
 state.player.x=rule.entry[0];state.player.y=rule.entry[1];state.stairs={x:rule.exit[0],y:rule.exit[1]};setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.STAIR);state.fixedStart={x:state.player.x,y:state.player.y};state.fixedExit={...state.stairs};state.rooms=[roomRect(2,2,COLS-4,9),roomRect(cx-3,12,6,ROWS-13)];
 validateTerrainUnderlays();
},
stock(runSeed,afterFloor){
 const theme=afterFloor/5-1,rule=SHOP_RULES58[theme];if(!rule)return[];const rng=RngService.shop(String(runSeed)+'|shop|'+afterFloor),pool=shopCandidates58(afterFloor,theme),stock=[];
 const choose=predicate=>{const eligible=pool.filter(predicate);let total=eligible.reduce((n,i)=>n+(rule.weights[i.type]||1),0),r=rng()*total;for(const it of eligible){r-=rule.weights[it.type]||1;if(r<0)return it}return eligible.at(-1)};
 const add=p=>{if(!p)return;const item=structuredClone(p);item.count=1;if(['weapon','armor','cloak','relic','trinket'].includes(item.type)){item.identified=false;item.curseRoll991=true;item.curse991=null}stock.push({id:`${afterFloor}:${stock.length}`,item,price:shopPrice58(item),soldOut:false});const index=pool.findIndex(q=>q.type===p.type&&q.name===p.name);if(index>=0)pool.splice(index,1)};
 add(choose(i=>i.rarity==='relic'));if(theme>=2)add(choose(i=>i.rarity==='sealed'));
 const fusion=globalThis.__MANRU_TALISMAN74_ACTIONS__?.shopCandidates?.()||[];
 if(rng()<rule.fusionChance){const eligible=fusion.filter(i=>shopEligible58(i,afterFloor,theme));if(eligible.length)add(eligible[Math.floor(rng()*eligible.length)])}
 while(stock.length<5&&pool.length)add(choose(()=>true));return stock;
},
enter(){
 const afterFloor=state.floor,theme=afterFloor/5-1,rule=SHOP_RULES58[theme];if(!rule||state.shopIntermission?.active||!state.bossDefeated)return false;
 closeGameplayInteractionState57();const followers=summonFollowers();for(const mon of followers)OccupancyService.removeMonster(mon);const outer=captureGenerationSnapshot();outer.state.seen=[...outer.state.seen];outer.state.visible=[...outer.state.visible];outer.state.grassTufts1020=[...(outer.state.grassTufts1020||[])];
 const seed=String(state.runId984||state.runId||'legacy')+'|shop|'+afterFloor,merchant={id:'merchant-'+afterFloor,kind:'merchant',faction57:'neutral',name:rule.name,x:rule.merchant[0],y:rule.merchant[1],theme};
 state.shopIntermission={version:3,purchaseId:null,active:true,afterFloor,nextFloor:afterFloor+1,theme,seed,stock:ShopMapBuilder.stock(state.runId984||state.runId||'legacy',afterFloor),merchant,outer};
 ShopMapBuilder.build();summonPlaceFollowers105(followers);resetVisualState();VisibilityService.compute();updateAll();addLog(`${rule.room} · 상인에게는 물건을 팔고, 바닥의 진열품은 값을 치르고 살 수 있다.`);globalThis.__MANRU_SAVE1004__?.write?.();return true;
},
restore(){
 const s=state.shopIntermission,carry={};for(const key of ['player','status','turn','playerAgencyTurns57','lastDamageAgencyTurn57','passiveRecoveryUnlocked57','earlyRecoveryProgress58','makgeolliRecoveryTurns57','makgeolliHealHundredths57','drunkBornTurn57','enemyEnergy','dead','victory','runState57','knowledge56','holy991','story992','log','saveSeq1004','saveWrittenAt1004'])if(key in state)carry[key]=state[key];
 const outer=s.outer;state=structuredClone(outer.state);state.seen=new Set(state.seen||[]);state.visible=new Set(state.visible||[]);state.grassTufts1020=new Set(state.grassTufts1020||[]);Object.assign(state,carry);COLS=outer.cols;ROWS=outer.rows;state.shopIntermission=null;state.neutralInteractables58=[];
}
});
  function addCanal(m,d,stage,protectedCells){
    if(stage<=0)return;const innerSide=d.id===2?'south':d.id===3?'west':d.id===6?'west':d.id===9?'north':d.id===8?'north':d.id===7?'east':'east';
    const width=stage>=4?4:stage>=2?3:2;const cells=[];if(innerSide==='south'||innerSide==='north'){const y0=innerSide==='south'?d.y+d.h-width:d.y;for(let y=y0;y<y0+width;y++)for(let x=d.x+2;x<d.x+d.w-2;x++)cells.push({x,y})}else{const x0=innerSide==='east'?d.x+d.w-width:d.x;for(let x=x0;x<x0+width;x++)for(let y=d.y+2;y<d.y+d.h-2;y++)cells.push({x,y})}
    for(const c of cells)if(in60(c.x,c.y)&&!protectedCells.has(k(c.x,c.y))&&[TT.MOON_STONE,TT.STONE_PATH].includes(m[c.y][c.x])&&hash2(c.x,c.y,2300+d.id)<(.63+.07*stage))setTerrainTile58(m,c.x,c.y,TT.MERCURY);
    // Flooded courtyards/low spots are contiguous civic lowlands, not random speckles.
    const pools=stage>=3?2:1;for(let i=0;i<pools;i++){const pcx=clamp(d.cx+(i?5:-5),d.x+3,d.x+d.w-4),pcy=clamp(d.cy+(i?3:-3),d.y+3,d.y+d.h-4),rx=2+Math.min(3,stage),ry=2+Math.min(2,Math.floor(stage/2));for(let y=pcy-ry;y<=pcy+ry;y++)for(let x=pcx-rx;x<=pcx+rx;x++){if(!in60(x,y)||protectedCells.has(k(x,y))||m[y][x]!==TT.MOON_STONE)continue;const nx=(x-pcx)/rx,ny=(y-pcy)/ry;if(nx*nx+ny*ny<=1.05)setTerrainTile58(m,x,y,TT.MERCURY)}}
    // High-seep districts have a second, broad flooded yard aligned to the central-facing edge.
    // It only consumes civic MOON_STONE, so authored buildings and the protected arterial stay intact.
    if(stage>=3){const horizontal=innerSide==='north'||innerSide==='south',depth=stage>=4?6:4,spanScale=stage>=4?.80:.62;if(horizontal){const fy=innerSide==='north'?d.y+width+2:d.y+d.h-width-depth-2,cx=d.cx,rx=Math.max(4,Math.floor((d.w-4)*spanScale/2)),ry=Math.max(2,Math.floor(depth/2));for(let y=fy-ry;y<=fy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){if(!in60(x,y)||protectedCells.has(k(x,y))||m[y][x]!==TT.MOON_STONE)continue;const nx=(x-cx)/Math.max(1,rx),ny=(y-fy)/Math.max(1,ry);if(nx*nx+ny*ny<=1.08)setTerrainTile58(m,x,y,TT.MERCURY)}}else{const fx=innerSide==='west'?d.x+width+2:d.x+d.w-width-depth-2,cy=d.cy,rx=Math.max(2,Math.floor(depth/2)),ry=Math.max(4,Math.floor((d.h-4)*spanScale/2));for(let y=cy-ry;y<=cy+ry;y++)for(let x=fx-rx;x<=fx+rx;x++){if(!in60(x,y)||protectedCells.has(k(x,y))||m[y][x]!==TT.MOON_STONE)continue;const nx=(x-fx)/Math.max(1,rx),ny=(y-cy)/Math.max(1,ry);if(nx*nx+ny*ny<=1.08)setTerrainTile58(m,x,y,TT.MERCURY)}}}
    // In the innermost blocks mercury advances as a single flood-front from the central side.
    // The sinusoidal edge avoids a ruler-straight strip while remaining one readable inundation mass.
    if(stage>=3){const reach=stage>=4?.52:.34;for(let y=d.y+1;y<d.y+d.h-1;y++)for(let x=d.x+1;x<d.x+d.w-1;x++){if(protectedCells.has(k(x,y))||m[y][x]!==TT.MOON_STONE)continue;let depthNorm=1;if(innerSide==='north')depthNorm=(y-d.y)/Math.max(1,d.h-1);else if(innerSide==='south')depthNorm=(d.y+d.h-1-y)/Math.max(1,d.h-1);else if(innerSide==='west')depthNorm=(x-d.x)/Math.max(1,d.w-1);else depthNorm=(d.x+d.w-1-x)/Math.max(1,d.w-1);const lateral=innerSide==='north'||innerSide==='south'?x:y,edge=reach+.055*Math.sin((lateral+d.id*3)*.72)+.025*Math.sin((lateral+d.id)*1.41);if(depthNorm<=edge)setTerrainTile58(m,x,y,TT.MERCURY)}}
  }
  function bPassable(m,b){if(!b)return false;for(let y=b.y+1;y<b.y+b.h-1;y++)for(let x=b.x+1;x<b.x+b.w-1;x++)if(!tileBlocks(m[y]?.[x]))return true;return false}
    function buildMercury(m){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];state.switches=[];state.featureRooms=[];
    const wallStyleByCell={},protectedCells=new Set(),districts=[
      {id:1,x:3,y:3,w:24,h:15,cx:15,cy:10,seep:0},{id:4,x:3,y:20,w:24,h:17,cx:15,cy:28,seep:1},{id:7,x:3,y:40,w:24,h:20,cx:15,cy:49,seep:2},{id:8,x:30,y:40,w:18,h:20,cx:39,cy:49,seep:3},{id:9,x:51,y:40,w:39,h:20,cx:70,cy:49,seep:4},{id:6,x:68,y:20,w:22,h:17,cx:79,cy:28,seep:4},{id:3,x:68,y:3,w:22,h:15,cx:79,cy:10,seep:3},{id:2,x:30,y:3,w:35,h:15,cx:47,cy:10,seep:4}
    ],byId=new Map();
    for(const d of districts)byId.set(d.id,{d,buildings:buildUrbanDistrict(m,d,wallStyleByCell)});

    const sidePoint=(r,side)=>side==='north'?{x:r.cx,y:r.y}:side==='south'?{x:r.cx,y:r.y+r.h-1}:side==='west'?{x:r.x,y:r.cy}:{x:r.x+r.w-1,y:r.cy};
    const outside=(p,side)=>({x:p.x+(side==='west'?-1:side==='east'?1:0),y:p.y+(side==='north'?-1:side==='south'?1:0)});
    const transitBuilding=(cfg)=>{
      const floor=cfg.floor||TT.WOOD_FLOOR,r=walledBox(m,cfg.x,cfg.y,cfg.w,cfg.h,floor,true),variant=cfg.variant||0;markWallMaterial23(m,wallStyleByCell,r,cfg.material||'plaster');
      const entry=sidePoint(r,cfg.entry),exit=sidePoint(r,cfg.exit);setTerrainTile58(m,entry.x,entry.y,TT.DOOR);setTerrainTile58(m,exit.x,exit.y,TT.DOOR);const chokes=[{...entry},{...exit}],routeDoors=[],door=(x,y)=>{if(in60(x,y)){setTerrainTile58(m,x,y,TT.DOOR);chokes.push({x,y});routeDoors.push({x,y})}},wallH=(y,x1=r.x+1,x2=r.x+r.w-2)=>{for(let x=x1;x<=x2;x++)setTerrainTile58(m,x,y,TT.WALL)},wallV=(x,y1=r.y+1,y2=r.y+r.h-2)=>{for(let y=y1;y<=y2;y++)setTerrainTile58(m,x,y,TT.WALL)};
      const ns=(cfg.entry==='north'&&cfg.exit==='south')||(cfg.entry==='south'&&cfg.exit==='north');
      if(ns){
        const yA=r.y+Math.max(3,Math.floor(r.h*.32)),yB=r.y+Math.min(r.h-4,Math.floor(r.h*.68)),xM=r.x+Math.floor(r.w*(variant%2?.58:.44)),left=r.x+2,right=r.x+r.w-3;
        if(variant%3===0){wallH(yA);door(variant%2?right:left,yA);wallV(xM,yA+1,yB-1);door(xM,r.y+Math.floor(r.h*.52));wallH(yB);door(variant%2?left:right,yB)}
        else if(variant%3===1){wallV(xM,r.y+1,yA);door(xM,r.y+2);wallH(yA);door(variant%2?left:right,yA);wallH(yB);door(variant%2?right:left,yB);wallV(r.x+Math.floor(r.w*.70),yB,r.y+r.h-2);door(r.x+Math.floor(r.w*.70),r.y+r.h-3);openRect(m,r.x+Math.floor(r.w*.36),r.y+Math.floor(r.h*.42),Math.max(3,Math.floor(r.w*.26)),Math.max(3,Math.floor(r.h*.22)),TT.MOON_STONE)}
        else{wallH(yA,r.x+1,r.x+Math.floor(r.w*.68));door(r.x+Math.floor(r.w*.26),yA);wallV(r.x+Math.floor(r.w*.68),yA,r.y+r.h-2);door(r.x+Math.floor(r.w*.68),r.y+Math.floor(r.h*.48));wallH(yB,r.x+Math.floor(r.w*.32),r.x+r.w-2);door(r.x+Math.floor(r.w*.78),yB)}
      }else{
        const xA=r.x+Math.max(3,Math.floor(r.w*.32)),xB=r.x+Math.min(r.w-4,Math.floor(r.w*.68)),yM=r.y+Math.floor(r.h*(variant%2?.58:.44)),top=r.y+2,bottom=r.y+r.h-3;
        if(variant%3===0){wallV(xA);door(xA,variant%2?bottom:top);wallH(yM,xA+1,xB-1);door(r.x+Math.floor(r.w*.52),yM);wallV(xB);door(xB,variant%2?top:bottom)}
        else if(variant%3===1){wallH(yM,r.x+1,xA);door(r.x+2,yM);wallV(xA);door(xA,variant%2?top:bottom);wallV(xB);door(xB,variant%2?bottom:top);wallH(r.y+Math.floor(r.h*.70),xB,r.x+r.w-2);door(r.x+r.w-3,r.y+Math.floor(r.h*.70));openRect(m,r.x+Math.floor(r.w*.42),r.y+Math.floor(r.h*.36),Math.max(3,Math.floor(r.w*.22)),Math.max(3,Math.floor(r.h*.26)),TT.MOON_STONE)}
        else{wallV(xA,r.y+1,r.y+Math.floor(r.h*.68));door(xA,r.y+Math.floor(r.h*.26));wallH(r.y+Math.floor(r.h*.68),xA,r.x+r.w-2);door(r.x+Math.floor(r.w*.48),r.y+Math.floor(r.h*.68));wallV(xB,r.y+Math.floor(r.h*.32),r.y+r.h-2);door(xB,r.y+Math.floor(r.h*.78))}
      }
      // Author the mandatory walk line as part of the building itself. Partitions still control the turns,
      // but every internal door belongs to one continuous route from exterior entry to exterior exit.
      const transitRoute=[entry,...routeDoors,exit];for(let ri=1;ri<transitRoute.length;ri++){const a=transitRoute[ri-1],b=transitRoute[ri];if(a.x!==b.x&&a.y!==b.y){const mid=((ri+variant)&1)?{x:b.x,y:a.y}:{x:a.x,y:b.y};carveLine(m,a.x,a.y,mid.x,mid.y,floor,1);carveLine(m,mid.x,mid.y,b.x,b.y,floor,1)}else carveLine(m,a.x,a.y,b.x,b.y,floor,1)}for(const c of [entry,...routeDoors,exit])setTerrainTile58(m,c.x,c.y,TT.DOOR);
      // Recessed mercury bites break the silhouette into L/U-like civic masses without opening an exterior bypass.
      const bites=variant%2?[[r.x+1,r.y+1],[r.x+r.w-3,r.y+r.h-3]]:[[r.x+r.w-3,r.y+1],[r.x+1,r.y+r.h-3]];for(const [bx,by]of bites)for(let yy=by;yy<by+2;yy++)for(let xx=bx;xx<bx+2;xx++)if(in60(xx,yy)&&!chokes.some(c=>c.x===xx&&c.y===yy))setTerrainTile58(m,xx,yy,TT.MERCURY);
      // Side rooms and civic props give each crossing a remembered function instead of a bare tunnel.
      const alcoves=ns?[[r.x+2,r.y+Math.floor(r.h*.48),3,3],[r.x+r.w-5,r.y+Math.floor(r.h*.22),3,3]]:[[r.x+Math.floor(r.w*.20),r.y+2,3,3],[r.x+Math.floor(r.w*.60),r.y+r.h-5,3,3]];for(const [ax,ay,aw,ah]of alcoves){for(let yy=ay;yy<ay+ah;yy++)for(let xx=ax;xx<ax+aw;xx++)if(in60(xx,yy)&&m[yy][xx]===floor)setTerrainTile58(m,xx,yy,variant%2?TT.DARK_WOOD:TT.FLOOR)}
      const props=[[r.x+2,r.y+2,TT.INCENSE_STAND],[r.x+r.w-3,r.y+r.h-3,TT.GOLD_LAMP],[r.cx,r.cy,TT.GOLD_LAMP]];for(const [x,y,t]of props)if(in60(x,y)&&!tileBlocks(m[y][x])&&!chokes.some(c=>c.x===x&&c.y===y))setTerrainTile58(m,x,y,t);
      // Transit halls are raised civic structures: later canal/flood producers must never re-submerge their walkable interior.
      for(let yy=r.y;yy<r.y+r.h;yy++)for(let xx=r.x;xx<r.x+r.w;xx++)if(in60(xx,yy)&&!tileBlocks(m[yy][xx]))protectedCells.add(k(xx,yy));
      registerBuilding(r,cfg.name,`gatehouse-${variant+1}`,cfg.material||'plaster');state.featureRooms.push({name:cfg.name+' 내부통과 복합동',x:r.x,y:r.y,w:r.w,h:r.h,kind60:'f23-transit',variant23:variant});
      return{...r,entry,exit,entryOutside:outside(entry,cfg.entry),exitOutside:outside(exit,cfg.exit),chokes,name:cfg.name,variant};
    };
    const floodBarrier=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(in60(xx,yy))setTerrainTile58(m,xx,yy,TT.MERCURY)};
    // Block-to-block seams are mercury basins. The only dry crossing at each seam is an authored management building.
    floodBarrier(2,17,27,4);floodBarrier(2,36,27,5);floodBarrier(26,39,5,22);floodBarrier(47,39,5,22);floodBarrier(67,36,23,5);floodBarrier(67,17,23,4);floodBarrier(64,2,5,17);
    const transits=[
      transitBuilding({x:7,y:13,w:15,h:12,entry:'north',exit:'south',name:'제1 수위 관문청',material:'plaster',variant:0}),
      transitBuilding({x:10,y:32,w:15,h:13,entry:'north',exit:'south',name:'제2 범람 관리동',material:'timber',variant:1}),
      transitBuilding({x:22,y:44,w:14,h:15,entry:'west',exit:'east',name:'서측 수은 관통창고',material:'depot',variant:2}),
      transitBuilding({x:43,y:41,w:15,h:15,entry:'west',exit:'east',name:'중앙 저지대 통과원',material:'ruin',variant:3}),
      transitBuilding({x:72,y:33,w:15,h:13,entry:'south',exit:'north',name:'동남 수문 계측소',material:'depot',variant:4}),
      transitBuilding({x:69,y:13,w:16,h:12,entry:'south',exit:'north',name:'동북 회벽 관제동',material:'plaster',variant:5}),
      transitBuilding({x:61,y:4,w:13,h:13,entry:'east',exit:'west',name:'북측 목조 검문동',material:'timber',variant:6})
    ];

    const street=(a,b,w=1)=>{if(a.x!==b.x&&a.y!==b.y){const horizontalFirst=((a.x*3+a.y+b.x+b.y)&1)===0,mid=horizontalFirst?{x:b.x,y:a.y}:{x:a.x,y:b.y};carveLine(m,a.x,a.y,mid.x,mid.y,TT.STONE_PATH,w);carveLine(m,mid.x,mid.y,b.x,b.y,TT.STONE_PATH,w)}else carveLine(m,a.x,a.y,b.x,b.y,TT.STONE_PATH,w);const pad=Math.floor(w/2)+1;for(let y=Math.min(a.y,b.y)-pad;y<=Math.max(a.y,b.y)+pad;y++)for(let x=Math.min(a.x,b.x)-pad;x<=Math.max(a.x,b.x)+pad;x++)if(in60(x,y)&&m[y][x]===TT.STONE_PATH)protectedCells.add(k(x,y))};
    const start={x:15,y:8};
    street(start,transits[0].entryOutside,1);
    street(transits[0].exitOutside,transits[1].entryOutside,1);
    street(transits[1].exitOutside,transits[2].entryOutside,1);
    street(transits[2].exitOutside,transits[3].entryOutside,1);
    street(transits[3].exitOutside,transits[4].entryOutside,1);
    street(transits[4].exitOutside,transits[5].entryOutside,1);
    street(transits[5].exitOutside,transits[6].entryOutside,1);
    const finalApproach={x:48,y:17};street(transits[6].exitOutside,{x:47,y:10},1);street({x:47,y:10},finalApproach,1);

    // Keep the older block language, but make local streets secondary to the forced building-through route.
    for(const d of districts)addCanal(m,d,d.seep,protectedCells);
    for(const [x0,y0,x1,y1,w]of[[28,21,28,35,2],[28,45,28,58,2],[49,43,49,59,2],[66,23,66,35,2],[66,5,66,16,2],[31,18,63,18,2]])for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)for(let q=0;q<w;q++){const xx=x+(x0===x1?q:0),yy=y+(y0===y1?q:0);if(in60(xx,yy)&&!protectedCells.has(k(xx,yy))&&m[yy][xx]===TT.WALL)setTerrainTile58(m,xx,yy,TT.MERCURY)}

    // Keep district massing authored in buildUrbanDistrict23. Do not place late buildings here:
    // late footprints used to overwrite the already-authored mandatory route at the 1→4 and 4→7 seams.

    const switchInterior23=(b)=>{const vx=b.approach.x-b.door.x,vy=b.approach.y-b.door.y,start={x:b.door.x-vx,y:b.door.y-vy};if(!in60(start.x,start.y)||tileBlocks(m[start.y][start.x]))return null;const qq=[start],seen=new Set([k(start.x,start.y)]),prev=new Map(),cand=[];for(let qi=0;qi<qq.length;qi++){const a=qq[qi];if(a.x>b.x&&a.x<b.x+b.w-1&&a.y>b.y&&a.y<b.y+b.h-1)cand.push(a);for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(x<=b.x||x>=b.x+b.w-1||y<=b.y||y>=b.y+b.h-1||seen.has(kk)||tileBlocks(m[y]?.[x]))continue;seen.add(kk);prev.set(kk,{x:a.x,y:a.y});qq.push({x,y})}}cand.sort((a,c)=>(Math.abs(c.x-b.door.x)+Math.abs(c.y-b.door.y))-(Math.abs(a.x-b.door.x)+Math.abs(a.y-b.door.y)));const spot=cand[0]||start,path=[{...spot}];let cur={...spot};while(cur.x!==start.x||cur.y!==start.y){const p=prev.get(k(cur.x,cur.y));if(!p)break;path.push({...p});cur=p}return{spot,path}};
    const switchDistricts=[4,7,6,2],switchIds=[];for(let i=0;i<switchDistricts.length;i++){const list=byId.get(switchDistricts[i])?.buildings||[],b=list.find(v=>v&&bPassable(m,v))||list[0];if(!b)throw new Error(`F23 switch building missing ${switchDistricts[i]}`);const id=`f23-sw-${i+1}`;switchIds.push(id);const access=switchInterior23(b);if(!access)throw new Error(`F23 switch interior unreachable ${switchDistricts[i]}`);const sx=access.spot.x,sy=access.spot.y,d=byId.get(switchDistricts[i]).d;street(b.approach,{x:d.cx,y:d.cy},1);setTerrainTile58(m,sx,sy,TT.SWITCH);for(const c of access.path)protectedCells.add(k(c.x,c.y));protectedCells.add(k(b.door.x,b.door.y));protectedCells.add(k(b.approach.x,b.approach.y));protectedCells.add(k(sx,sy));for(const [ox,oy,t]of[[2,0,TT.GOLD_LAMP],[-2,0,TT.GOLD_LAMP],[0,2,TT.INCENSE_STAND]]){const xx=sx+ox,yy=sy+oy;if(in60(xx,yy)&&!tileBlocks(m[yy][xx])&&!protectedCells.has(k(xx,yy)))setTerrainTile58(m,xx,yy,t)}state.switches.push({id,kind:'f23-center',x:sx,y:sy,used:false});state.featureRooms.push({name:`수은 압력 관리소 ${i+1}`,x:b.x,y:b.y,w:b.w,h:b.h,kind60:'switch-facility'})}

    const center=walledBox(m,29,18,39,23,TT.MOON_STONE,true),gateCells=[{x:47,y:18},{x:48,y:18},{x:49,y:18}];markWallMaterial23(m,wallStyleByCell,center,'plaster');
    for(let y=20;y<=38;y++)for(let x=32;x<=65;x++){const nx=(x-48.5)/16.2,ny=(y-29)/8.9,rag=(hash2(x,y,2399)-.5)*.26;if(nx*nx+ny*ny+rag<=1.03)setTerrainTile58(m,x,y,TT.MERCURY)}
    openRect(m,42,25,12,8,TT.GILDED_FLOOR);carveLine(m,48,19,48,37,TT.DRAWBRIDGE_DOWN,3);openRect(m,59,26,5,7,TT.GILDED_FLOOR);carveLine(m,37,23,42,27,TT.DRAWBRIDGE_DOWN,1);openRect(m,34,21,5,5,TT.MOON_STONE);
    // The boss-side service span is authored as mercury first, then promoted to an UP bridge by control #4.
    // This makes the final pressure-release switch operate a real 2×5 crossing instead of coordinates on the north wall.
    for(let yy=28;yy<=29;yy++)for(let xx=54;xx<=58;xx++)setTerrainTile58(m,xx,yy,TT.MERCURY);
    for(const [x,y]of[[42,25],[53,25],[42,32],[53,32],[59,26],[63,32],[34,21],[38,25]])setTerrainTile58(m,x,y,TT.STONE_PILLAR);
    for(const d of districts.filter(v=>[2,3,6,8,9].includes(v.id)))for(let y=d.y+1;y<d.y+d.h-1;y++)for(let x=d.x+1;x<d.x+d.w-1;x++){if(protectedCells.has(k(x,y))||m[y][x]!==TT.MOON_STONE)continue;const dist=Math.abs(x-48)+Math.abs(y-29),p=d.seep>=4?.38:.22;if(dist<44&&hash2(x,y,2480+d.id)<p)setTerrainTile58(m,x,y,TT.MERCURY)}
    street(finalApproach,{x:48,y:17},1);for(const c of gateCells)setTerrainTile58(m,c.x,c.y,TT.WALL);

    const controls=[];
    const hydraulicSurface23=new Set([TT.MOON_STONE,TT.STONE_PATH,TT.FLOOR,TT.WOOD_FLOOR,TT.DARK_WOOD,TT.GILDED_FLOOR]);
    const rectCells23=(x,y,w,h,pred=()=>true)=>{const out=[];for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(in60(xx,yy)&&!protectedCells.has(k(xx,yy))&&pred(xx,yy,m[yy][xx]))out.push({x:xx,y:yy});return out};
    const prime23=(cells,tile)=>{const out=[];for(const c of cells){const t=m[c.y]?.[c.x];if(t==null||t===TT.SWITCH||t===TT.STAIR||tileBlocks(t))continue;if(tile===TT.MERCURY&&!hydraulicSurface23.has(t)&&t!==TT.MERCURY)continue;setTerrainTile58(m,c.x,c.y,tile);out.push(c)}return out};
    const drainField23=(rects)=>{const cells=[];for(const r of rects)cells.push(...prime23(rectCells23(...r,(x,y,t)=>hydraulicSurface23.has(t)||t===TT.MERCURY),TT.MERCURY));return cells};
    const floodField23=(rects)=>{const cells=[];for(const r of rects)cells.push(...prime23(rectCells23(...r,(x,y,t)=>hydraulicSurface23.has(t)||t===TT.MERCURY),TT.MOON_STONE));return cells};
    const prepareBridge=(cells)=>{const out=[];for(const c of cells)if(in60(c.x,c.y)&&!protectedCells.has(k(c.x,c.y))&&[TT.MERCURY,TT.MOON_STONE,TT.STONE_PATH].includes(m[c.y][c.x])){setTerrainTile58(m,c.x,c.y,TT.DRAWBRIDGE_UP);out.push(c)}return out};
    const hydraulicControl=(switchId,type,label,groups)=>{const changes=[];for(const g of groups)for(const c of g.cells||[]){if(!in60(c.x,c.y))continue;const before=m[c.y][c.x],after=g.after;if(before===after)continue;changes.push({x:c.x,y:c.y,before,after})}const drain=changes.filter(ch=>ch.before===TT.MERCURY&&ch.after!==TT.MERCURY).length,flood=changes.filter(ch=>ch.before!==TT.MERCURY&&ch.after===TT.MERCURY).length,bridge=changes.filter(ch=>ch.after===TT.DRAWBRIDGE_DOWN).length;return{switchId,type,label,activated:false,changes,hydraulic:{drain,flood,bridge,total:changes.length}}};

    // Four coherent waterworks. Each control changes a visible canal/low yard as a single hydraulic mass,
    // rather than selecting unrelated mercury cells by scan order.
    const westDrain=drainField23([[4,27,8,8],[15,42,8,6]]),westOverflow=floodField23([[4,22,7,4],[18,31,7,4]]),westBridge=prepareBridge([{x:5,y:37},{x:6,y:37},{x:7,y:37},{x:8,y:37},{x:5,y:38},{x:6,y:38},{x:7,y:38},{x:8,y:38}]);
    controls.push(hydraulicControl(switchIds[0],'diversion','제1 서측 배수로 전환·범람마당 폐쇄',[{cells:westDrain,after:TT.MOON_STONE},{cells:westOverflow,after:TT.MERCURY},{cells:westBridge,after:TT.DRAWBRIDGE_DOWN}]));

    const southDrain=drainField23([[31,43,8,7],[39,51,7,6]]),southOverflow=floodField23([[16,52,8,5],[5,50,7,5]]),southBridge=prepareBridge([{x:27,y:42},{x:28,y:42},{x:29,y:42},{x:30,y:42},{x:27,y:43},{x:28,y:43},{x:29,y:43},{x:30,y:43}]);
    controls.push(hydraulicControl(switchIds[1],'spillway','제2 남부 배수문 개방·서측 저지대 역범람',[{cells:southDrain,after:TT.MOON_STONE},{cells:southOverflow,after:TT.MERCURY},{cells:southBridge,after:TT.DRAWBRIDGE_DOWN}]));

    const eastDrain=drainField23([[77,5,10,7],[81,25,7,8]]),eastOverflow=floodField23([[69,25,7,6],[72,30,8,4]]),eastBridge=prepareBridge([{x:86,y:17},{x:87,y:17},{x:88,y:17},{x:89,y:17},{x:86,y:18},{x:87,y:18},{x:88,y:18},{x:89,y:18}]);
    controls.push(hydraulicControl(switchIds[2],'sluice-reverse','제3 동측 역수문 차단·북행 수로 배수',[{cells:eastDrain,after:TT.MOON_STONE},{cells:eastOverflow,after:TT.MERCURY},{cells:eastBridge,after:TT.DRAWBRIDGE_DOWN}]));

    const centerDrain=drainField23([[38,9,19,6],[55,11,8,5]]),centerOverflow=floodField23([[57,5,6,5],[35,5,7,4]]),centerService=prepareBridge(Array.from({length:10},(_,i)=>({x:54+(i%5),y:28+Math.floor(i/5)})));
    controls.push(hydraulicControl(switchIds[3],'pressure-release','제4 중앙 감압수문 개방·전면 수로 배수',[{cells:centerDrain,after:TT.MOON_STONE},{cells:centerOverflow,after:TT.MERCURY},{cells:centerService,after:TT.DRAWBRIDGE_DOWN}]));

    const revealCandidateIds23=[1,4,6,7,8,9],forcedReveal23=Number(globalThis.__MANRU_F23_REVEAL_FORCE60),forcedValid23=revealCandidateIds23.includes(forcedReveal23),seedReveal23=forcedValid23?forcedReveal23:revealCandidateIds23[Math.floor(globalThis.__MANRU_RANDOM57__()*revealCandidateIds23.length)],revealOrder23=forcedValid23?[forcedReveal23]:[seedReveal23,...revealCandidateIds23.filter(id=>id!==seedReveal23)];
    const revealForbidden23=new Set(protectedCells);for(const c of gateCells)revealForbidden23.add(k(c.x,c.y));for(const c of controls.flatMap(v=>v.changes||[]))revealForbidden23.add(k(c.x,c.y));for(const sw of state.switches||[])revealForbidden23.add(k(sw.x,sw.y));for(const tr of transits)for(let yy=tr.y;yy<tr.y+tr.h;yy++)for(let xx=tr.x;xx<tr.x+tr.w;xx++)revealForbidden23.add(k(xx,yy));for(let yy=center.y;yy<center.y+center.h;yy++)for(let xx=center.x;xx<center.x+center.w;xx++)revealForbidden23.add(k(xx,yy));
    const controlCellStates23=new Map();for(let ci=0;ci<controls.length;ci++)for(const ch of controls[ci].changes||[]){const kk=k(ch.x,ch.y),a=controlCellStates23.get(kk)||[];a.push({ci,after:ch.after});controlCellStates23.set(kk,a)}
    const dryReach23=(blocked=new Set(),controlMask=0)=>{const qq=[{...start}],seen=new Set([k(start.x,start.y)]);for(let i=0;i<qq.length;i++){const a=qq[i];for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=k(x,y);if(x<1||y<1||x>=COLS-1||y>=ROWS-1||seen.has(kk)||blocked.has(kk))continue;let t=m[y]?.[x];for(const q of controlCellStates23.get(kk)||[])if(controlMask&(1<<q.ci))t=q.after;if(t===TT.DOOR)t=TT.OPEN_DOOR;if(tileBlocks(t)||[TT.MERCURY,TT.WATER,TT.LAVA,TT.VOID].includes(t))continue;seen.add(kk);qq.push({x,y})}}return seen};
    const stableReach23=(blocked=new Set())=>{const sets=[];for(let mask=0;mask<(1<<controls.length);mask++)sets.push(dryReach23(blocked,mask));const common=new Set;for(const kk of sets[0]||[])if(sets.every(v=>v.has(kk)))common.add(kk);return{sets,common}};
    const normalSwitches23=state.switches.filter(v=>v.kind==='f23-center'),mandatoryReveal23=[...normalSwitches23.map(v=>({x:v.x,y:v.y})),finalApproach,...transits.map(t=>({...t.exitOutside}))],baseStableReach23=stableReach23().common;
    const revealStateValid23=(blocked,switchPos)=>{for(let mask=0;mask<(1<<controls.length);mask++){const reach=dryReach23(blocked,mask);if(!reach.has(k(switchPos.x,switchPos.y)))return false;for(let ci=0;ci<controls.length;ci++){if(mask&(1<<ci))continue;const sw=state.switches.find(v=>v.id===controls[ci].switchId);if(!sw||!reach.has(k(sw.x,sw.y)))return false}if(mask===(1<<controls.length)-1&&!reach.has(k(finalApproach.x,finalApproach.y)))return false}return true};
    const pickRevealSwitch23=(blocked,preferred)=>{const cand=[];for(const kk of baseStableReach23){if(blocked.has(kk)||revealForbidden23.has(kk))continue;const[x,y]=kk.split(',').map(Number),t=m[y]?.[x];if(tileBlocks(t)||[TT.MERCURY,TT.WATER,TT.LAVA,TT.VOID,TT.STAIR,TT.DOOR,TT.OPEN_DOOR,TT.SWITCH].includes(t))continue;cand.push({x,y,score:Math.abs(x-preferred.x)+Math.abs(y-preferred.y)+.08*(Math.abs(x-start.x)+Math.abs(y-start.y))})}cand.sort((a,b)=>a.score-b.score);for(const c of cand)if(revealStateValid23(blocked,c))return{x:c.x,y:c.y};return null};let reveal23=null;
    for(const districtId of revealOrder23){const entry=byId.get(districtId),buildings=[...(entry?.buildings||[])].reverse().sort((a,b)=>a.w*a.h-b.w*b.h);for(const b of buildings){const cells=[];let invalid=false,wallCount=0,floorCount=0,doorCount=0;for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){const kk=k(x,y),t=m[y]?.[x];if(revealForbidden23.has(kk)||[TT.MERCURY,TT.WATER,TT.LAVA,TT.VOID,TT.STAIR,TT.SWITCH].includes(t)){invalid=true;break}const layer=terrainMapLayers58(m),under=layer.underlay[kk],attachment=layer.attachment[kk];cells.push({x,y,t,...(Number.isInteger(under)?{underlay:under}:{}),...(attachment?{attachment}:{})});if(t===TT.WALL||t===TT.WINDOW)wallCount++;else if(t===TT.DOOR||t===TT.OPEN_DOOR)doorCount++;else if(!tileBlocks(t))floorCount++}if(invalid||cells.length<24||wallCount<5||floorCount<8)continue;const blocked=new Set(cells.map(c=>k(c.x,c.y))),reach=dryReach23(blocked,0);if(!mandatoryReveal23.every(p=>reach.has(k(p.x,p.y))))continue;const switchPos=pickRevealSwitch23(blocked,b.approach);if(!switchPos)continue;reveal23={districtId,switchId:'f23-reveal-1',rect:{x:b.x,y:b.y,w:b.w,h:b.h},cells,wallCount,floorCount,doorCount,switchPos,materialized:false,used:false,initiallySubmerged:true,spawnBatches:0,spawnedIds:[],monsterNames:['공허 가오리','신전 사제 망령','차원 포식자']};break}if(reveal23)break}
    if(!reveal23){
      // Every numbered QA candidate must be authorable. When no existing building can be submerged whole,
      // author a compact optional service annex in that exact district, snapshot its real geometry, then
      // store only authoritative mercury in the live map until the one-shot reveal switch is used.
      const synthForbidden23=new Set(),synthTransit23=new Set();for(const c of gateCells)synthForbidden23.add(k(c.x,c.y));for(const c of controls.flatMap(v=>v.changes||[]))synthForbidden23.add(k(c.x,c.y));for(const sw of state.switches||[])synthForbidden23.add(k(sw.x,sw.y));for(const tr of transits)for(let yy=tr.y;yy<tr.y+tr.h;yy++)for(let xx=tr.x;xx<tr.x+tr.w;xx++){const kk=k(xx,yy);synthForbidden23.add(kk);synthTransit23.add(kk)}for(let yy=center.y;yy<center.y+center.h;yy++)for(let xx=center.x;xx<center.x+center.w;xx++)synthForbidden23.add(k(xx,yy));for(const p of [start,finalApproach,...mandatoryReveal23])if(p)for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)synthForbidden23.add(k(p.x+ox,p.y+oy));
      const synthPlan23=(districtId)=>{
        const d=byId.get(districtId)?.d;if(!d)return null;
        const sizes=[[9,7],[8,7],[10,7],[9,6],[8,6],[7,6],[6,6],[7,5],[6,5],[5,6],[5,5],[6,4],[4,6],[5,4],[4,5],[4,4],[3,6],[6,3],[3,5],[5,3],[3,4],[4,3]];
        for(const [w,h] of sizes)for(let y=d.y;y<=d.y+d.h-h;y++)for(let x=d.x;x<=d.x+d.w-w;x++){
          const rect=[];let forbidden=false;for(let yy=y;yy<y+h&&!forbidden;yy++)for(let xx=x;xx<x+w;xx++){const kk=k(xx,yy);if(synthForbidden23.has(kk)){forbidden=true;break}rect.push({x:xx,y:yy})}
          if(forbidden)continue;const blocked=new Set(rect.map(c=>k(c.x,c.y))),reach=dryReach23(blocked,0);if(!mandatoryReveal23.every(p=>reach.has(k(p.x,p.y))))continue;
          const sides=[
            {side:'north',door:{x:x+Math.floor(w/2),y},outside:{x:x+Math.floor(w/2),y:y-1}},
            {side:'south',door:{x:x+Math.floor(w/2),y:y+h-1},outside:{x:x+Math.floor(w/2),y:y+h}},
            {side:'west',door:{x,y:y+Math.floor(h/2)},outside:{x:x-1,y:y+Math.floor(h/2)}},
            {side:'east',door:{x:x+w-1,y:y+Math.floor(h/2)},outside:{x:x+w,y:y+Math.floor(h/2)}}
          ];
          for(const side of sides){
            const o=side.outside,okey=k(o.x,o.y),ot=m[o.y]?.[o.x];if(!in60(o.x,o.y)||blocked.has(okey)||(synthForbidden23.has(okey)&&!synthTransit23.has(okey))||!reach.has(okey)||tileBlocks(ot)||[TT.MERCURY,TT.WATER,TT.LAVA,TT.VOID,TT.STAIR].includes(ot))continue;
            const switchPos=pickRevealSwitch23(blocked,o);if(!switchPos)continue;
            const cells=[];let wallCount=0,floorCount=0,doorCount=0;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
              const border=xx===x||xx===x+w-1||yy===y||yy===y+h-1,isDoor=xx===side.door.x&&yy===side.door.y;let t=isDoor?TT.DOOR:border?TT.WALL:TT.WOOD_FLOOR;
              if(!border&&w>=5&&h>=5){const lx=xx-x,ly=yy-y;if((lx===2&&ly===2)||(lx===w-3&&ly===h-3))t=TT.GOLD_LAMP;else if(lx===Math.floor(w/2)&&ly===Math.floor(h/2))t=TT.TABLE;else if(lx===Math.floor(w/2)-1&&ly===Math.floor(h/2))t=TT.BENCH;else if(lx===w-3&&ly===2)t=TT.INCENSE_STAND}
              if(t===TT.WALL){wallCount++;wallStyleByCell[k(xx,yy)]='timber'}else if(t===TT.DOOR)doorCount++;else if(!tileBlocks(t))floorCount++;const overlay=terrainLayerCatalog58().overlays.has(t);cells.push({x:xx,y:yy,t,...(overlay?{underlay:TT.WOOD_FLOOR,attachment:'standing'}:{})});
            }
            return{districtId,switchId:'f23-reveal-1',rect:{x,y,w,h},cells,wallCount,floorCount,doorCount,switchPos,materialized:false,used:false,initiallySubmerged:true,spawnBatches:0,spawnedIds:[],monsterNames:['공허 가오리','신전 사제 망령','차원 포식자'],synthetic:true};
          }
        }
        return null;
      };
      for(const districtId of revealOrder23){reveal23=synthPlan23(districtId);if(reveal23)break}
    }
    if(!reveal23)throw new Error('F23 optional reveal subdistrict could not be authored without progression overlap');for(const c of reveal23.cells)setTerrainTile58(m,c.x,c.y,TT.MERCURY);setTerrainTile58(m,reveal23.switchPos.x,reveal23.switchPos.y,TT.SWITCH);state.switches.push({id:reveal23.switchId,kind:'f23-reveal',x:reveal23.switchPos.x,y:reveal23.switchPos.y,used:false,disabled:false});state.featureRooms.push({name:`수은 잠복구역 · 제 ${reveal23.districtId}구역`,x:reveal23.rect.x,y:reveal23.rect.y,w:reveal23.rect.w,h:reveal23.rect.h,kind60:'f23-reveal-subdistrict',districtId23:reveal23.districtId});

    const bossSpawn={x:61,y:29},exit={x:48,y:37},route=[start,...transits.map(t=>({...t.exitOutside})),finalApproach];setEnds(start,exit);const innerDistrictBounds=[2,3,6,8,9].map(id=>({...byId.get(id).d}));
    const hydraulicCellMeta={};for(let ci=0;ci<controls.length;ci++)for(const ch of controls[ci].changes||[])hydraulicCellMeta[k(ch.x,ch.y)]={control:ci,type:controls[ci].type,before:ch.before,after:ch.after};state.floor23={version:10,artVersion:3,preserveAuthoredGeometry:true,centerUnlocked:false,thresholdTriggered:false,keyAcquired:false,routeCheckpoints:route.map(q=>({...q})),gateCells:gateCells.map(q=>({...q})),centerEntry:{x:48,y:19},bossSpawn:{...bossSpawn},switchIds:[...switchIds],controls,hydraulicCellMeta,reveal:{districtId:reveal23.districtId,switchId:reveal23.switchId,rect:{...reveal23.rect},cells:reveal23.cells.map(c=>({...c})),wallCount:reveal23.wallCount,floorCount:reveal23.floorCount,doorCount:reveal23.doorCount,switchPos:{...reveal23.switchPos},materialized:false,used:false,initiallySubmerged:true,spawnBatches:0,spawnedIds:[],monsterNames:[...reveal23.monsterNames]},centerBounds:{x:center.x,y:center.y,w:center.w,h:center.h},districtOrder:[1,4,7,8,9,6,3,2],districts:districts.map(d=>({...d})),innerDistrictBounds,wallStyleByCell,transitBuildings:transits.map(t=>({name:t.name,x:t.x,y:t.y,w:t.w,h:t.h,chokes:t.chokes.map(c=>({...c})),after:{...t.exitOutside}}))};
    state.featureRooms.push({name:'중앙 대형 수은연못',x:center.x,y:center.y,w:center.w,h:center.h,kind60:'mercury-core'},{name:'중앙 수은 관리 플랫폼',x:42,y:25,w:22,h:8,kind60:'mercury-platform'});state.layoutName='수은도시 · 7개 관리동 관통 / 4단 대수로 배수·역범람 / 가동교 우회로 / 중앙 대형 수은호';
  }
  /* ---------- 24F: premium timber estate, single grand entrance, layered chase loops ---------- */
  function carveDoorway(m,x,y,axis='h',span=1,t=TT.WOOD_FLOOR){for(let i=-Math.floor(span/2);i<=Math.floor(span/2);i++){const xx=axis==='h'?x+i:x,yy=axis==='h'?y:y+i;if(in60(xx,yy))setTerrainTile58(m,xx,yy,span===1?TT.DOOR:t)}}
  function estateLink(m,a,b,w=1,t=TT.WOOD_FLOOR){if(a.x!==b.x&&a.y!==b.y){const mid=Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?{x:b.x,y:a.y}:{x:a.x,y:b.y};carveLine(m,a.x,a.y,mid.x,mid.y,t,w);carveLine(m,mid.x,mid.y,b.x,b.y,t,w)}else carveLine(m,a.x,a.y,b.x,b.y,t,w)}
  function markWallStyle(m,styleMap,r,style){for(let x=r.x;x<r.x+r.w;x++)for(const y of [r.y,r.y+r.h-1])if(m[y]?.[x]===TT.WALL)styleMap[k(x,y)]=style;for(let y=r.y+1;y<r.y+r.h-1;y++)for(const x of [r.x,r.x+r.w-1])if(m[y]?.[x]===TT.WALL)styleMap[k(x,y)]=style}
  function zoneRoom(m,styleMap,zoneMap,x,y,w,h,floor,name,kind,style='estate-inner'){
    const r=walledBox(m,x,y,w,h,floor,true);markWallStyle(m,styleMap,r,style);for(let yy=r.y+1;yy<r.y+r.h-1;yy++)for(let xx=r.x+1;xx<r.x+r.w-1;xx++)zoneMap[k(xx,yy)]=kind;state.featureRooms.push({name,x:r.x,y:r.y,w:r.w,h:r.h,kind60:kind,estate24:true});return r
  }
  function addPartitionWall(m,r,axis,pos,doors=[]){if(axis==='v'){const x=clamp(pos,r.x+2,r.x+r.w-3);for(let y=r.y+1;y<r.y+r.h-1;y++)setTerrainTile58(m,x,y,TT.WALL);for(const y of doors)setTerrainTile58(m,x,clamp(y,r.y+1,r.y+r.h-2),TT.DOOR)}else{const y=clamp(pos,r.y+2,r.y+r.h-3);for(let x=r.x+1;x<r.x+r.w-1;x++)setTerrainTile58(m,x,y,TT.WALL);for(const x of doors)setTerrainTile58(m,clamp(x,r.x+1,r.x+r.w-2),y,TT.DOOR)}}
  function addWindowsAlongSide(m,r,side,count=3){
    const out=[], horizontal=side==='north'||side==='south', fixed=horizontal?(side==='north'?r.y:r.y+r.h-1):(side==='west'?r.x:r.x+r.w-1);
    const span=(horizontal?r.w:r.h)-2, wanted=Math.max(1,count|0), groups=wanted>=5?[2,wanted-2]:wanted===4?[2,2]:wanted===3?[2,1]:[wanted];
    const seed=hash2(r.cx,r.cy,24017), anchors=groups.length===1?[Math.round(span*.50)]:[Math.round(span*(.28+(seed-.5)*.08)),Math.round(span*(.70+(seed-.5)*.08))];
    const put=(along)=>{const x=horizontal?r.x+along:fixed,y=horizontal?fixed:r.y+along;if(in60(x,y)&&m[y][x]===TT.WALL){setTerrainTile58(m,x,y,TT.WINDOW);out.push({x,y})}};
    for(let gi=0;gi<groups.length;gi++){
      const n=groups[gi],center=clamp(anchors[gi],2,span-1),start=center-Math.floor((n-1)/2);
      for(let j=0;j<n;j++)put(clamp(start+j,2,span-1));
    }
    return out
  }
  function wallBannerAnchor(m,x,y,r=null){
    const candidates=[];for(let yy=r?r.y:Math.max(1,y-8);yy<=(r?r.y+r.h-1:Math.min(ROWS-2,y+8));yy++)for(let xx=r?r.x:Math.max(1,x-8);xx<=(r?r.x+r.w-1:Math.min(COLS-2,x+8));xx++)if(m[yy]?.[xx]===TT.WALL&&DIRS4.some(([dx,dy])=>m[yy+dy]?.[xx+dx]!=null&&!tileBlocks(m[yy+dy][xx+dx])))candidates.push({x:xx,y:yy,d:Math.abs(xx-x)+Math.abs(yy-y)});
    candidates.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);return candidates[0]||{x,y};
  }
  function estateDecor(m,r,kind,roomId='',audit=null){
    const pts=[],roomKey=roomId||kind;
    const stat=()=>{if(!audit)return null;audit.byRoom=audit.byRoom||{};return audit.byRoom[roomKey]||(audit.byRoom[roomKey]={attempted:0,placed:0,failed:[]})};
    const put=(x,y,t)=>{if(t===TT.WALL_BANNER)({x,y}=wallBannerAnchor(m,x,y,r));const rs=stat();if(audit)audit.attempted++;if(rs)rs.attempted++;const valid=in60(x,y)&&Number.isFinite(t)&&(t===TT.WALL_BANNER?m[y][x]===TT.WALL:!tileBlocks(m[y][x]))&&m[y][x]!==TT.STAIR&&m[y][x]!==TT.KEY_TILE;if(valid){setTerrainTile58(m,x,y,t);pts.push({x,y,t});if(audit)audit.placed++;if(rs)rs.placed++;return true}const fail={room:roomKey,kind,x,y,t,actual:in60(x,y)?m[y]?.[x]:null};if(audit)audit.failed.push(fail);if(rs)rs.failed.push(fail);return false};
    const line=(x1,y1,x2,y2,t,step=1)=>{if(x1===x2){for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y+=step)put(x1,y,t)}else{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x+=step)put(x,y1,t)}};
    if(kind==='grand-entrance'){
      for(const x of [r.x+3,r.x+r.w-4]){put(x,r.y+2,TT.STONE_PILLAR);put(x,r.y+r.h-3,TT.GOLD_LAMP)}
      put(r.cx,r.y+2,TT.WALL_BANNER);put(r.cx-4,r.cy,TT.BENCH);put(r.cx+4,r.cy,TT.BENCH);
    }else if(kind==='great-hall'){
      for(const x of [r.x+3,r.x+8,r.x+r.w-9,r.x+r.w-4])put(x,r.y+2,TT.STONE_PILLAR);
      line(r.cx-8,r.cy,r.cx-5,r.cy,TT.TABLE);line(r.cx+4,r.cy,r.cx+7,r.cy,TT.TABLE);line(r.cx-4,r.y+2,r.cx+4,r.y+2,TT.SCREEN,2);
      put(r.cx,r.y+3,TT.WALL_BANNER);put(r.cx-9,r.cy+2,TT.BENCH);put(r.cx+11,r.cy+2,TT.BENCH);
    }else if(kind==='courtyard'){
      put(r.x+2,r.cy-2,TT.PAVILION);for(const [dx,dy,t]of[[-8,-2,TT.ROCK],[7,2,TT.FLOWERBED],[-7,2,TT.GARDEN_TREE],[12,-2,TT.LOTUS_FLOWER],[-11,2,TT.LOW_FENCE]])put(r.cx+dx,r.cy+dy,t)
    }else if(kind==='library'){
      for(const y of [r.y+2,r.y+4,r.y+7,r.y+r.h-3])put(r.x+2,y,TT.RACK);
      for(const y of [r.y+2,r.y+4,r.y+6,r.y+r.h-3])put(r.x+r.w-3,y,TT.RACK);
      for(const x of [r.x+5,r.x+10])put(x,r.y+2,TT.RACK);
      put(r.cx-2,r.cy+2,TT.TABLE);put(r.cx+2,r.cy+2,TT.TABLE);put(r.cx+1,r.cy+4,TT.BENCH);
      put(r.cx-4,r.cy+3,TT.BOOK_STACK);put(r.cx+5,r.cy+4,TT.INCENSE_STAND);put(r.cx,r.y+r.h-3,TT.WALL_BANNER);
    }else if(kind==='inner-wing'){
      for(const y of [r.y+2,r.y+5])put(r.x+2,y,TT.RACK);put(r.x+r.w-3,r.y+2,TT.SCREEN);put(r.x+r.w-2,r.y+3,TT.SCREEN);
      put(r.x+4,r.y+1,TT.BED);put(r.x+r.w-5,r.y+2,TT.BED);put(r.x+5,r.y+r.h-3,TT.RUMOR_SILK_DIVAN);put(r.x+r.w-6,r.y+r.h-2,TT.BENCH);
      put(r.x+3,r.y+r.h-3,TT.INCENSE_STAND);put(r.x+r.w-5,r.y+3,TT.GOLD_LAMP);
    }else if(kind==='annex'){
      put(r.x+2,r.y+2,TT.RACK);put(r.x+r.w-3,r.y+2,TT.SCREEN);put(r.cx-2,r.cy,TT.TABLE);put(r.cx+2,r.cy,TT.BENCH);put(r.cx,r.y+r.h-3,TT.GOLD_LAMP);put(r.x+3,r.y+r.h-3,TT.WALL_BANNER);
    }else if(kind==='sarangchae'){
      put(r.cx+3,r.cy,TT.TABLE);put(r.cx+3,r.cy+3,TT.BENCH);put(r.x+2,r.y+2,TT.SCREEN);put(r.x+r.w-3,r.y+2,TT.WALL_BANNER);
      put(r.x+5,r.y+r.h-3,TT.RUMOR_SILK_DIVAN);put(r.cx+5,r.y+2,TT.INCENSE_STAND);put(r.x+r.w-4,r.cy+3,TT.GOLD_LAMP);
    }else if(kind==='tea-room'){
      put(r.cx,r.cy,TT.TABLE);put(r.x+2,r.cy,TT.RUMOR_SILK_DIVAN);put(r.x+r.w-3,r.cy,TT.RUMOR_SILK_DIVAN);
      put(r.cx,r.y+2,TT.INCENSE_STAND);put(r.cx,r.y+r.h-3,TT.GOLD_LAMP);put(r.x+2,r.y+2,TT.PAPER_CRANE);
    }else if(kind==='gallery'){
      for(let y=r.y+2;y<r.y+r.h-2;y+=4){put(r.cx,y,TT.LANTERN_POST);if(r.w>=9)put(r.x+2,y,TT.BENCH)}
    }else if(kind==='haengrang'){
      for(const x of [r.x+2,r.x+5,r.x+r.w-4])put(x,r.y+2,TT.RACK);
      put(r.x+3,r.cy-2,TT.COOKPOT);put(r.x+r.w-3,r.cy+1,TT.CRATE);put(r.cx-2,r.y+r.h-3,TT.TABLE);put(r.x+r.w-3,r.y+r.h-3,TT.CRATE);
    }else if(kind==='rear-garden'){
      put(r.x+1,r.cy-2,TT.BENCH);put(r.cx-7,r.cy,TT.ROCK);put(r.x+1,r.cy+2,TT.GARDEN_TREE);put(r.x+4,r.y+1,TT.LOTUS_FLOWER);put(r.cx-5,r.cy+3,TT.FLOWERBED);
      put(r.x+2,r.cy,TT.STONE_PILLAR);put(r.x+1,r.y+r.h-2,TT.STONE_PILLAR);
    }
    return pts
  }
  function orchardCluster(m,cx,cy,rx,ry,salt,protectedCells){for(let y=Math.max(2,cy-ry);y<=Math.min(ROWS-3,cy+ry);y++)for(let x=Math.max(2,cx-rx);x<=Math.min(COLS-3,cx+rx);x++){if(protectedCells.has(k(x,y))||m[y][x]!==TT.LIGHT_GRASS)continue;const nx=(x-cx)/rx,ny=(y-cy)/ry,d=nx*nx+ny*ny;if(d>1)continue;const h=hash2(x,y,2410+salt),noise=.14+.20*(1-d)+.07*Math.sin((x+y+salt)*.7);if(h<noise)setTerrainTile58(m,x,y,h<noise*.48?TT.PEACH_TREE:TT.GARDEN_TREE)}}
  function outerGardenDetails(m,protectedCells){
    const out=[],structuralBase=new Set([TT.LIGHT_GRASS,TT.PEACH_TREE,TT.GARDEN_TREE,TT.FLOWERBED,TT.ROCK,TT.STONE_PATH,TT.LOW_FENCE]);
    const paint=(x,y,t,structural=false)=>{if(!in60(x,y)||protectedCells.has(k(x,y)))return false;const cur=m[y][x];if(structural?!structuralBase.has(cur):cur!==TT.LIGHT_GRASS)return false;setTerrainTile58(m,x,y,t);out.push({x,y,t,structural:!!structural});return true};
    const path=(x1,y1,x2,y2)=>{if(x1===x2){for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)paint(x1,y,TT.STONE_PATH,true)}else{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)paint(x,y1,TT.STONE_PATH,true)}};
    const fence=(x1,y1,x2,y2,gaps=[])=>{const skip=new Set(gaps.map(p=>k(p.x,p.y)));if(x1===x2){for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)if(!skip.has(k(x1,y)))paint(x1,y,TT.LOW_FENCE,true)}else{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)if(!skip.has(k(x,y1)))paint(x,y1,TT.LOW_FENCE,true)}};
    const posts=(a,b)=>{paint(a.x,a.y,TT.STONE_PILLAR,true);paint(b.x,b.y,TT.STONE_PILLAR,true)};

    // West orchard is divided into two walled garden rooms instead of one open grass field.
    path(3,18,14,18);path(14,18,14,28);path(4,28,14,28);path(5,23,14,23);
    fence(16,9,16,32,[{x:16,y:18},{x:16,y:28}]);
    fence(3,14,13,14,[{x:8,y:14},{x:9,y:14}]);
    fence(3,32,14,32,[{x:9,y:32},{x:10,y:32}]);
    posts({x:16,y:17},{x:16,y:19});posts({x:16,y:27},{x:16,y:29});
    posts({x:7,y:14},{x:10,y:14});posts({x:8,y:32},{x:11,y:32});
    for(const [x,y,t] of [[4,16,TT.FLOWERBED],[9,16,TT.ROCK],[12,20,TT.FLOWERBED],[6,21,TT.GARDEN_TREE],[5,25,TT.FLOWERBED],[11,25,TT.ROCK],[6,30,TT.FLOWERBED],[13,30,TT.GARDEN_TREE]])paint(x,y,t);

    // South-east garden becomes a small enclosed terrace garden with two gates and a central stone walk.
    path(67,54,86,54);path(67,54,67,59);path(75,59,86,59);path(76,56,84,56);path(80,56,80,59);
    fence(68,52,87,52,[{x:76,y:52},{x:77,y:52}]);fence(72,61,87,61,[{x:80,y:61},{x:81,y:61}]);fence(88,53,88,60,[{x:88,y:56}]);
    posts({x:75,y:52},{x:78,y:52});posts({x:79,y:61},{x:82,y:61});posts({x:88,y:55},{x:88,y:57});
    for(const [x,y,t] of [[69,53,TT.FLOWERBED],[73,53,TT.ROCK],[82,53,TT.FLOWERBED],[86,53,TT.GARDEN_TREE],[70,57,TT.FLOWERBED],[73,58,TT.ROCK],[84,57,TT.FLOWERBED],[86,58,TT.GARDEN_TREE],[76,60,TT.FLOWERBED],[85,60,TT.ROCK]])paint(x,y,t);
    return out
  }
  function protectReinforcementCells(m,building,gateCells,stairs,start){
    const gateSet=new Set(gateCells.map(c=>k(c.x,c.y))),protectedSet=new Set(),walkable=(x,y,removed=null)=>{if(x<1||y<1||x>=COLS-1||y>=ROWS-1||removed===k(x,y))return false;let t=m[y]?.[x];if(gateSet.has(k(x,y)))t=TT.OPEN_DOOR;return !tileBlocks(t)&&![TT.WATER,TT.MERCURY,TT.VOID,TT.LAVA].includes(t)};
    const addRadius=(p,r)=>{for(let y=p.y-r;y<=p.y+r;y++)for(let x=p.x-r;x<=p.x+r;x++)if(in60(x,y)&&walkable(x,y))protectedSet.add(k(x,y))};for(const g of gateCells)addRadius(g,2);addRadius(stairs,2);
    const neighbors=(x,y,removed=null)=>DIRS4.map(([dx,dy])=>({x:x+dx,y:y+dy})).filter(p=>walkable(p.x,p.y,removed));
    for(let y=building.y+1;y<building.y+building.h-1;y++)for(let x=building.x+1;x<building.x+building.w-1;x++)if(m[y][x]===TT.DOOR&&neighbors(x,y).length<=3)addRadius({x,y},1);
    const path=(()=>{const q=[start],seen=new Set([k(start.x,start.y)]),prev=new Map();for(let i=0;i<q.length;i++){const a=q[i];if(a.x===stairs.x&&a.y===stairs.y){const out=[];let cur=k(a.x,a.y);while(cur){const[x,y]=cur.split(',').map(Number);out.push({x,y});cur=prev.get(cur)||null}return out.reverse()}for(const n of neighbors(a.x,a.y)){const kk=k(n.x,n.y);if(seen.has(kk))continue;seen.add(kk);prev.set(kk,k(a.x,a.y));q.push(n)}}return[]})();
    const stillConnectedWithout=(removed)=>{const q=[start],seen=new Set([k(start.x,start.y)]);for(let i=0;i<q.length;i++){const a=q[i];if(a.x===stairs.x&&a.y===stairs.y)return true;for(const n of neighbors(a.x,a.y,removed)){const kk=k(n.x,n.y);if(seen.has(kk))continue;seen.add(kk);q.push(n)}}return false};let articulationCount=0;
    for(const c of path.slice(1,-1)){const kk=k(c.x,c.y);if(protectedSet.has(kk)||neighbors(c.x,c.y).length>3)continue;if(!stillConnectedWithout(kk)){protectedSet.add(kk);articulationCount++}}
    const cells=[...protectedSet].map(id=>{const[x,y]=id.split(',').map(Number);return{x,y}});return{cells,articulationCount,pathLength:path.length,gateProtected:gateCells.every(g=>protectedSet.has(k(g.x,g.y))),stairsProtected:protectedSet.has(k(stairs.x,stairs.y))}
  }
  function buildPeach(m){
    fillMap(m,TT.WALL);openRect(m,1,1,COLS-2,ROWS-2,TT.LIGHT_GRASS);state.rooms=[];state.routeTags=[];state.featureRooms=[];
    const building={x:18,y:2,w:72,h:49},wallStyleByCell={},zoneByCell={},windows=[],decorCells=[],edges=[];for(let y=building.y;y<building.y+building.h;y++)for(let x=building.x;x<building.x+building.w;x++){setTerrainTile58(m,x,y,TT.WALL);wallStyleByCell[k(x,y)]='estate-mass'}
    const rooms={};
    rooms.entrance=zoneRoom(m,wallStyleByCell,zoneByCell,47,43,19,7,TT.GILDED_FLOOR,'비대칭 대형 현관홀','grand-entrance','estate-outer');
    rooms.hall=zoneRoom(m,wallStyleByCell,zoneByCell,38,34,29,8,TT.WOOD_FLOOR,'대청과 접객마루','great-hall','estate-inner');
    rooms.servants=zoneRoom(m,wallStyleByCell,zoneByCell,21,39,15,11,TT.DARK_WOOD,'행랑채와 부엌마루','haengrang','service');
    rooms.library=zoneRoom(m,wallStyleByCell,zoneByCell,70,37,17,12,TT.DARK_WOOD,'동측 서고와 장식장실','library','private');
    rooms.westGallery=zoneRoom(m,wallStyleByCell,zoneByCell,24,24,11,14,TT.DARK_WOOD,'서측 꺾임회랑','gallery','gallery');
    rooms.court=zoneRoom(m,wallStyleByCell,zoneByCell,47,24,27,9,TT.LIGHT_GRASS,'비정형 중정','courtyard','courtyard-wall');
    rooms.tea=zoneRoom(m,wallStyleByCell,zoneByCell,37,24,8,8,TT.WOOD_FLOOR,'차실과 작은 마루','tea-room','private');
    rooms.sarang=zoneRoom(m,wallStyleByCell,zoneByCell,21,13,22,9,TT.WOOD_FLOOR,'ㄱ자 사랑채','sarangchae','estate-inner');
    rooms.inner=zoneRoom(m,wallStyleByCell,zoneByCell,62,16,24,8,TT.DARK_WOOD,'내실과 침방군','inner-wing','private');
    rooms.northGallery=zoneRoom(m,wallStyleByCell,zoneByCell,46,17,13,6,TT.DARK_WOOD,'북측 창호 회랑','gallery','gallery');
    rooms.annex=zoneRoom(m,wallStyleByCell,zoneByCell,72,6,15,9,TT.WOOD_FLOOR,'동북 별당','annex','estate-inner');
    rooms.rear=zoneRoom(m,wallStyleByCell,zoneByCell,34,5,25,10,TT.LIGHT_GRASS,'후원과 월대 정자','rear-garden','rear');
    rooms.rearPassage=zoneRoom(m,wallStyleByCell,zoneByCell,60,5,10,9,TT.DARK_WOOD,'후면 굽은 통로','gallery','gallery');
    rooms.exitHouse=zoneRoom(m,wallStyleByCell,zoneByCell,20,5,11,7,TT.WOOD_FLOOR,'북서 문루와 탈출계단','exit-house','estate-outer');

    addPartitionWall(m,rooms.servants,'h',44,[24,33]);addPartitionWall(m,rooms.servants,'v',29,[41,47]);
    addPartitionWall(m,rooms.library,'v',78,[40,46]);addPartitionWall(m,rooms.library,'h',43,[73,84]);
    addPartitionWall(m,rooms.sarang,'v',31,[16,20]);addPartitionWall(m,rooms.sarang,'h',18,[24,38]);
    addPartitionWall(m,rooms.inner,'v',72,[18,22]);addPartitionWall(m,rooms.inner,'h',20,[65,82]);
    addPartitionWall(m,rooms.annex,'v',80,[9,13]);addPartitionWall(m,rooms.hall,'v',48,[36,40]);addPartitionWall(m,rooms.hall,'v',60,[35,39]);
    addPartitionWall(m,rooms.entrance,'v',53,[45,48]);
    const estateWall24=(x1,y1,x2,y2,doors=[])=>{if(x1===x2){for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)setTerrainTile58(m,x1,y,TT.WALL)}else{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)setTerrainTile58(m,x,y1,TT.WALL)}for(const p of doors)if(in60(p.x,p.y))setTerrainTile58(m,p.x,p.y,TT.DOOR)};
    // Offset room-within-room walls make the estate legible as nested hanok quarters rather than open rectangles.
    estateWall24(40,37,46,37,[{x:44,y:37}]);estateWall24(51,39,57,39,[{x:54,y:39}]);estateWall24(61,35,61,40,[{x:61,y:38}]);
    estateWall24(23,43,27,43,[{x:25,y:43}]);estateWall24(31,46,34,46,[{x:33,y:46}]);estateWall24(73,42,77,42,[{x:75,y:42}]);estateWall24(82,39,82,45,[{x:82,y:43}]);
    estateWall24(23,16,29,16,[{x:27,y:16}]);estateWall24(34,19,40,19,[{x:37,y:19}]);estateWall24(65,18,70,18,[{x:68,y:18}]);estateWall24(76,21,84,21,[{x:81,y:21}]);
    estateWall24(74,9,78,9,[{x:76,y:9}]);estateWall24(82,12,85,12,[{x:84,y:12}]);

    const connect=(a,b,p1,p2,w=1,t=TT.WOOD_FLOOR)=>{estateLink(m,p1,p2,w,t);edges.push([a,b])};
    // Entry splits immediately, then both branches snake through different wings before recombining at the offset courtyard.
    carveDoorway(m,56,43,'h',3,TT.GILDED_FLOOR);connect('entrance','hall',{x:56,y:42},{x:56,y:43},3,TT.GILDED_FLOOR);
    connect('entrance','servants',{x:47,y:46},{x:35,y:46},1,TT.WOOD_FLOOR);connect('entrance','library',{x:65,y:46},{x:70,y:46},1,TT.DARK_WOOD);
    connect('hall','servants',{x:38,y:38},{x:35,y:42},1,TT.WOOD_FLOOR);connect('hall','library',{x:66,y:38},{x:70,y:40},1,TT.DARK_WOOD);
    connect('servants','westGallery',{x:27,y:39},{x:29,y:37},1,TT.DARK_WOOD);connect('westGallery','sarang',{x:29,y:24},{x:29,y:21},1,TT.WOOD_FLOOR);
    connect('westGallery','tea',{x:34,y:29},{x:37,y:29},1,TT.WOOD_FLOOR);connect('tea','court',{x:44,y:27},{x:47,y:27},1,TT.WOOD_FLOOR);
    connect('sarang','northGallery',{x:42,y:18},{x:46,y:20},1,TT.WOOD_FLOOR);connect('northGallery','court',{x:52,y:22},{x:52,y:24},1,TT.DARK_WOOD);
    connect('library','inner',{x:80,y:37},{x:80,y:23},1,TT.DARK_WOOD);connect('inner','court',{x:62,y:21},{x:70,y:24},1,TT.DARK_WOOD);
    connect('inner','annex',{x:82,y:16},{x:82,y:14},1,TT.WOOD_FLOOR);connect('annex','rearPassage',{x:72,y:10},{x:69,y:10},1,TT.DARK_WOOD);
    connect('rearPassage','rear',{x:60,y:9},{x:58,y:10},1,TT.DARK_WOOD);connect('rear','northGallery',{x:50,y:14},{x:52,y:17},1,TT.WOOD_FLOOR);
    // Additional loops are short and local; none creates a straight south-north escape.
    connect('court','inner',{x:73,y:29},{x:75,y:23},1,TT.WOOD_FLOOR);connect('sarang','rear',{x:38,y:13},{x:40,y:14},1,TT.DARK_WOOD);connect('hall','westGallery',{x:42,y:34},{x:34,y:34},1,TT.DARK_WOOD);connect('court','library',{x:73,y:30},{x:75,y:37},1,TT.DARK_WOOD);

    // Final escape route: irregular eaves runs with two widened window bays. Segment lengths deliberately vary so the route reads as an old hanok gallery, not a generated sawtooth.
    const northEavesRoute=[{x:84,y:8},{x:87,y:8},{x:87,y:4},{x:82,y:4},{x:82,y:3},{x:74,y:3},{x:74,y:4},{x:68,y:4},{x:68,y:3},{x:61,y:3},{x:61,y:4},{x:54,y:4},{x:54,y:3},{x:49,y:3},{x:49,y:4},{x:41,y:4},{x:41,y:3},{x:35,y:3},{x:35,y:4},{x:29,y:4},{x:29,y:3},{x:25,y:3},{x:25,y:5}];
    for(let i=1;i<northEavesRoute.length;i++)estateLink(m,northEavesRoute[i-1],northEavesRoute[i],1,TT.DARK_WOOD);
    const northEavesBays=[{x:57,y:3,w:5,h:2,name:'북측 창호 쉼칸'},{x:37,y:3,w:4,h:2,name:'북측 작은 전실'}];for(const bay of northEavesBays)openRect(m,bay.x,bay.y,bay.w,bay.h,TT.DARK_WOOD);
    for(let i=1;i<northEavesRoute.length;i++){const a=northEavesRoute[i-1],b=northEavesRoute[i];if(a.x===b.x){for(let y=Math.min(a.y,b.y);y<=Math.max(a.y,b.y);y++)zoneByCell[k(a.x,y)]='north-eaves'}else{for(let x=Math.min(a.x,b.x);x<=Math.max(a.x,b.x);x++)zoneByCell[k(x,a.y)]='north-eaves'}}
    for(const bay of northEavesBays)for(let y=bay.y;y<bay.y+bay.h;y++)for(let x=bay.x;x<bay.x+bay.w;x++)zoneByCell[k(x,y)]='north-eaves';
    edges.push(['annex','north-eaves'],['north-eaves','exitHouse']);
    const northEavesFeatures=[];for(let i=1;i<northEavesRoute.length;i++){const a=northEavesRoute[i-1],b=northEavesRoute[i],x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(a.x-b.x)+1,h=Math.abs(a.y-b.y)+1,f={name:'북측 비정형 창호 추격회랑',x,y,w,h,kind60:'north-eaves',estate24:true,featureSegment24:true,segmentIndex24:i-1};northEavesFeatures.push(f);state.featureRooms.push(f)}for(let i=0;i<northEavesBays.length;i++){const bay=northEavesBays[i],f={name:bay.name,x:bay.x,y:bay.y,w:bay.w,h:bay.h,kind60:'north-eaves',estate24:true,featureSegment24:true,segmentIndex24:northEavesRoute.length+i,bay24:true};northEavesFeatures.push(f);state.featureRooms.push(f)}

    // Courtyard/rear garden follow an offset stepping path around asymmetric ponds; no centered cross-axis remains.
    carveLine(m,48,27,56,27,TT.STONE_PATH,1);carveLine(m,56,27,56,30,TT.STONE_PATH,1);carveLine(m,56,30,66,30,TT.STONE_PATH,1);carveLine(m,66,30,70,27,TT.STONE_PATH,1);setTerrainTile58(m,57,30,TT.PAVILION);
    carveLine(m,38,11,45,11,TT.STONE_PATH,1);carveLine(m,45,11,45,8,TT.STONE_PATH,1);carveLine(m,45,8,53,8,TT.STONE_PATH,1);carveLine(m,53,8,56,11,TT.STONE_PATH,1);setTerrainTile58(m,44,11,TT.PAVILION);
    for(let y=25;y<=31;y++)for(let x=51;x<=70;x++){if(m[y][x]!==TT.LIGHT_GRASS)continue;const nx=(x-62)/9.5,ny=(y-27.7)/3.9,edge=.94+.09*Math.sin(x*.83+y*.37);if(nx*nx+ny*ny<edge)setTerrainTile58(m,x,y,TT.WATER)}
    for(let y=6;y<=13;y++)for(let x=37;x<=57;x++){if(m[y][x]!==TT.LIGHT_GRASS)continue;const nx=(x-49)/10.2,ny=(y-10.4)/3.8,edge=.82+.12*Math.sin(x*.61-y*.53);if(nx*nx+ny*ny<edge)setTerrainTile58(m,x,y,TT.WATER)}
    for(const [x,y,t]of[[49,25,TT.ROCK],[70,25,TT.FLOWERBED],[51,31,TT.GARDEN_TREE],[68,31,TT.LOTUS_FLOWER],[38,7,TT.GARDEN_TREE],[56,6,TT.ROCK],[39,13,TT.FLOWERBED],[55,13,TT.LOTUS_FLOWER],[47,26,TT.LOW_FENCE],[71,29,TT.LOW_FENCE],[41,12,TT.LOW_FENCE],[54,7,TT.LOW_FENCE],[64,26,TT.ROCK],[52,29,TT.FLOWERBED]])if(in60(x,y)&&!tileBlocks(m[y][x]))setTerrainTile58(m,x,y,t);

    windows.push(...addWindowsAlongSide(m,rooms.hall,'north',5),...addWindowsAlongSide(m,rooms.servants,'west',4),...addWindowsAlongSide(m,rooms.library,'east',5),...addWindowsAlongSide(m,rooms.westGallery,'east',5),...addWindowsAlongSide(m,rooms.sarang,'south',4),...addWindowsAlongSide(m,rooms.inner,'south',5),...addWindowsAlongSide(m,rooms.northGallery,'south',4),...addWindowsAlongSide(m,rooms.annex,'south',4),...addWindowsAlongSide(m,rooms.rear,'south',5),...addWindowsAlongSide(m,rooms.entrance,'south',4));
    for(const x of [33,34,41,42,43,55,56,67,68,69,79,80])if(m[2]?.[x]===TT.WALL){setTerrainTile58(m,x,2,TT.WINDOW);windows.push({x,y:2})}
    const decorAudit24={attempted:0,placed:0,failed:[],byRoom:{}};
    const decorKind={entrance:'grand-entrance',hall:'great-hall',servants:'haengrang',library:'library',westGallery:'gallery',court:'courtyard',tea:'tea-room',sarang:'sarangchae',inner:'inner-wing',northGallery:'gallery',annex:'annex',rear:'rear-garden',rearPassage:'gallery',exitHouse:'grand-entrance'};
    for(const [name,r]of Object.entries(rooms))decorCells.push(...estateDecor(m,r,decorKind[name]||'annex',name,decorAudit24));
    // Extra premium details copied from the visual language of real hanok: low furniture against walls, lantern rhythm, and garden-facing lattice bays.
    const extraStat=decorAudit24.byRoom['premium-extra']={attempted:0,placed:0,failed:[]};for(let [x,y,t]of[[41,35,TT.SCREEN],[64,36,TT.WALL_BANNER],[24,42,TT.COOKPOT],[32,48,TT.RACK],[73,40,TT.RACK],[83,46,TT.SCREEN],[67,17,TT.BENCH],[78,8,TT.GOLD_LAMP],[64,8,TT.INCENSE_STAND],[24,8,TT.WALL_BANNER],[45,35,TT.BENCH],[57,36,TT.GOLD_LAMP],[75,45,TT.SCREEN],[27,46,TT.CRATE],[36,20,TT.INCENSE_STAND],[69,22,TT.WALL_BANNER],[84,18,TT.RACK],[76,12,TT.TABLE]]){if(t===TT.WALL_BANNER)({x,y}=wallBannerAnchor(m,x,y));decorAudit24.attempted++;extraStat.attempted++;if(in60(x,y)&&(t===TT.WALL_BANNER?m[y][x]===TT.WALL:!tileBlocks(m[y][x]))&&m[y][x]!==TT.STAIR&&m[y][x]!==TT.KEY_TILE){setTerrainTile58(m,x,y,t);decorCells.push({x,y,t});decorAudit24.placed++;extraStat.placed++}else{const fail={room:'premium-extra',kind:'premium-extra',x,y,t,actual:in60(x,y)?m[y]?.[x]:null};decorAudit24.failed.push(fail);extraStat.failed.push(fail)}}

    const gateCells=[{x:55,y:50},{x:56,y:50},{x:57,y:50}];for(const c of gateCells)setTerrainTile58(m,c.x,c.y,TT.LOCKED_GATE);carveLine(m,55,49,57,49,TT.GILDED_FLOOR,1);for(const x of [51,61])setTerrainTile58(m,x,48,TT.STONE_PILLAR);
    const exit={x:25,y:7};setEnds({x:8,y:59},exit);const protectedCells=new Set(),extPath=(a,b,w=3)=>{estateLink(m,a,b,w,TT.STONE_PATH);for(let y=Math.min(a.y,b.y)-2;y<=Math.max(a.y,b.y)+2;y++)for(let x=Math.min(a.x,b.x)-2;x<=Math.max(a.x,b.x)+2;x++)if(in60(x,y)&&m[y][x]===TT.STONE_PATH)protectedCells.add(k(x,y))};extPath({x:8,y:59},{x:20,y:58},3);extPath({x:20,y:58},{x:35,y:56},3);extPath({x:35,y:56},{x:48,y:54},3);extPath({x:48,y:54},{x:56,y:51},3);for(const c of gateCells)protectedCells.add(k(c.x,c.y));
    const shed=walledBox(m,5,34,12,10,TT.WOOD_FLOOR,true);setTerrainTile58(m,shed.cx,shed.y+shed.h-1,TT.DOOR);estateLink(m,{x:8,y:59},{x:9,y:44},2,TT.STONE_PATH);const keyPos={x:shed.cx,y:shed.cy,keyId:'brass',floorTile:TT.WOOD_FLOOR};setTerrainTile58(m,keyPos.x,keyPos.y,TT.KEY_TILE);setTerrainTile58(m,shed.cx-3,shed.cy,TT.CACHE);
    // Keep the orchard boundary walk and rear pond edges continuous by construction.
    carveLine(m,17,18,17,32,TT.STONE_PATH,1);for(const [x,y]of[[42,13],[56,13],[57,13]])setTerrainTile58(m,x,y,TT.WATER);
    for(const [cx,cy,rx,ry,salt]of[[8,12,6,8,1],[11,27,7,8,2],[10,49,7,6,3],[27,57,10,4,4],[44,58,8,4,5],[72,57,10,4,6],[87,56,5,6,7],[62,57,7,3,8]])orchardCluster(m,cx,cy,rx,ry,salt,protectedCells);const gardenDetailCells24=outerGardenDetails(m,protectedCells);

    // F24 furniture now uses only the ordinary terrain-decor vocabulary placed above.
    const roomAnchor24=(r,prefer=null)=>{const cand=[];if(prefer)cand.push(prefer);cand.push({x:r.cx,y:r.cy});for(let rad=0;rad<Math.max(r.w,r.h);rad++)for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(Math.abs(x-r.cx)+Math.abs(y-r.cy)===rad)cand.push({x,y});for(const p of cand)if(in60(p.x,p.y)&&!tileBlocks(m[p.y][p.x])&&m[p.y][p.x]!==TT.KEY_TILE&&m[p.y][p.x]!==TT.STAIR)return{x:p.x,y:p.y};throw new Error('F24 zone has no walk anchor')};
    const anchors={entrance:roomAnchor24(rooms.entrance,{x:56,y:46}),hall:roomAnchor24(rooms.hall,{x:55,y:38}),servants:roomAnchor24(rooms.servants,{x:27,y:45}),library:roomAnchor24(rooms.library,{x:82,y:44}),westGallery:roomAnchor24(rooms.westGallery,{x:29,y:31}),court:roomAnchor24(rooms.court,{x:58,y:28}),tea:roomAnchor24(rooms.tea,{x:40,y:28}),sarang:roomAnchor24(rooms.sarang,{x:35,y:17}),inner:roomAnchor24(rooms.inner,{x:76,y:20}),northGallery:roomAnchor24(rooms.northGallery,{x:52,y:20}),annex:roomAnchor24(rooms.annex,{x:82,y:10}),rear:roomAnchor24(rooms.rear,{x:47,y:10}),rearPassage:roomAnchor24(rooms.rearPassage,{x:65,y:9}),exitHouse:roomAnchor24(rooms.exitHouse,{x:25,y:8})};
    const gridDistance=(a,b)=>{const qq=[{x:a.x,y:a.y,d:0}],seen=new Set([k(a.x,a.y)]);for(let i=0;i<qq.length;i++){const q=qq[i];if(q.x===b.x&&q.y===b.y)return q.d;for(const[dx,dy]of DIRS4){const x=q.x+dx,y=q.y+dy,kk=k(x,y);if(x<1||y<1||x>=COLS-1||y>=ROWS-1||seen.has(kk))continue;let t=m[y][x];if(gateCells.some(c=>c.x===x&&c.y===y))t=TT.OPEN_DOOR;if(tileBlocks(t))continue;seen.add(kk);qq.push({x,y,d:q.d+1})}}return Infinity};
    const entranceToExitDistance=gridDistance({x:56,y:49},exit),reinforcementProtection=protectReinforcementCells(m,building,gateCells,exit,anchors.entrance);
    state.floor24={version:14,artVersion:8,preserveAuthoredGeometry:true,building:{...building},entranceGateCells:gateCells.map(q=>({...q})),entranceKey:{...keyPos},interiorAnchor:{...anchors.entrance},gumimyoSpawn:{x:80,y:20},chaseStarted:false,majorAnchors:Object.values(anchors),majorAnchorNames:Object.keys(anchors),connectionGraph:{nodes:[...Object.keys(anchors),'north-eaves'],edges:edges.map(e=>[...e])},wallStyleByCell,zoneByCell,northEavesCells:Object.entries(zoneByCell).filter(([,v])=>v==='north-eaves').map(([kk])=>{const[x,y]=kk.split(',').map(Number);return{x,y}}),windowCells:windows.map(v=>({...v})),decorCells:decorCells.map(v=>({x:v.x,y:v.y,t:v.t})),decorAudit:{attempted:decorAudit24.attempted,placed:decorAudit24.placed,failed:decorAudit24.failed.map(v=>({...v})),byRoom:Object.fromEntries(Object.entries(decorAudit24.byRoom).map(([id,v])=>[id,{attempted:v.attempted,placed:v.placed,failed:v.failed.map(q=>({...q}))}]))},gardenDetailCells:gardenDetailCells24.map(v=>({...v})),reinforcementCap57:3,reinforcementProtectedCells:reinforcementProtection.cells.map(c=>({...c})),reinforcementProtectionAudit:{articulationCount:reinforcementProtection.articulationCount,pathLength:reinforcementProtection.pathLength,gateProtected:reinforcementProtection.gateProtected,stairsProtected:reinforcementProtection.stairsProtected,count:reinforcementProtection.cells.length},entranceToExitDistance};state.layoutName='황금 과수원 비대칭 고급 목조 저택 · 중첩 내실벽 / 구획 정원 / 비정형 창호 추격회랑';
  }
  /* ---------- boss arenas ---------- */
  function buildBossArena(f,m,boss){
    fillMap(m,TT.WALL);state.rooms=[];state.routeTags=[];const cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);let start={x:cx,y:ROWS-4},exit={x:cx,y:ROWS-5},bp={x:cx,y:6};
    if(f===5){
      const hall=addBoxRoom(m,3,2,COLS-6,ROWS-4);openRect(m,cx-10,3,21,6,TT.GOLD);setTerrainTile58(m,cx,8,TT.DOOR);
      for(const y of [13,22,31]){for(let x=8;x<=cx-5;x+=2)setTerrainTile58(m,x,y,TT.TABLE);for(let x=cx+5;x<COLS-8;x+=2)setTerrainTile58(m,x,y,TT.TABLE)}
      for(let y=10;y<ROWS-6;y+=6){setTerrainTile58(m,6,y,TT.BRAZIER);setTerrainTile58(m,COLS-7,y,TT.BRAZIER)}for(const x of [12,22,COLS-23,COLS-13])setTerrainTile58(m,x,cy,TT.WALL);
      state.layoutName='청풍루 보스 · 대연회장 무대 / 파괴 가능한 상열';bp={x:cx,y:6};
    }else if(f===10){
      addBoxRoom(m,2,2,COLS-4,ROWS-4);for(let y=6;y<ROWS-6;y++)for(let x=7;x<COLS-7;x++)setTerrainTile58(m,x,y,TT.WATER);const main=carveBlob(m,cx,cy,6,5,TT.FLOOR);const side=[[cx-17,cy],[cx+17,cy],[cx,cy-12],[cx,cy+12]].map(([x,y])=>carveBlob(m,x,y,3,3,TT.FLOOR));for(const s of side)carveBridge(m,{x:main.cx,y:main.cy},{x:s.cx,y:s.cy},TT.PAPER_BRIDGE);setTerrainTile58(m,cx,cy,TT.PAVILION);for(const s of side)setTerrainTile58(m,s.cx,s.cy,TT.FLOOR);
      state.layoutName='수묵원 보스 · 오방 화폭 / 먹물 수로 / 종이 섬';bp={x:cx,y:cy-2};start={x:cx,y:cy+11};exit={x:cx,y:cy+13};
    }else if(f===15){
      addBoxRoom(m,2,2,COLS-4,ROWS-4);openRect(m,cx-4,4,9,ROWS-8,TT.GOLD);for(let y=7;y<ROWS-6;y+=6){for(let x=7;x<COLS-7;x+=7)setTerrainTile58(m,x,y,TT.MIRROR)}for(let y=10;y<ROWS-8;y+=9){for(let x=5;x<COLS-5;x++)if(Math.abs(x-cx)>4)setTerrainTile58(m,x,y,TT.SCREEN);setTerrainTile58(m,cx-4,y,TT.DOOR);setTerrainTile58(m,cx+4,y,TT.DOOR)}
      state.layoutName='내실 보스 · 천면 비단극장 / 중앙 활주로 / 거울 객석';bp={x:cx,y:7};
    }else if(f===20){
      addBoxRoom(m,2,2,COLS-4,ROWS-4);for(const x of [10,COLS-11]){for(let y=6;y<ROWS-6;y++)if(y%5!==0)setTerrainTile58(m,x,y,TT.SCREEN);for(const y of [10,20,30].filter(v=>v<ROWS-5))setTerrainTile58(m,x,y,TT.DOOR)}
      for(let y=7;y<ROWS-7;y+=6){for(let x=16;x<COLS-16;x+=6)setTerrainTile58(m,x,y,TT.JAR)}for(let x=16;x<COLS-16;x++)if(x%5!==0)setTerrainTile58(m,x,cy+7,TT.TABLE);setTerrainTile58(m,cx,5,TT.ARMORY);setTerrainTile58(m,cx,ROWS-7,TT.COOKPOT);
      state.layoutName='장고 보스 · 중앙 형틀로 / 양측 감방 / 쇠사슬 닻';bp={x:cx,y:7};
    }else{
      fillMap(m,TT.VOID);state.rooms=[];const center=carveBlob(m,cx,cy-5,5,5,TT.MERCURY),south=carveBlob(m,cx,ROWS-7,4,3,TT.FLOOR),north=carveBlob(m,cx,7,4,3,TT.GOLD),left=carveBlob(m,cx-17,cy-5,3,3,TT.FLOOR),right=carveBlob(m,cx+17,cy-5,3,3,TT.FLOOR),nw=carveBlob(m,cx-17,8,2,2,TT.FLOOR),se=carveBlob(m,cx+17,ROWS-9,2,2,TT.FLOOR);
      carveBridge(m,{x:center.cx,y:center.cy},{x:north.cx,y:north.cy},TT.DRAWBRIDGE_DOWN);carveBridge(m,{x:center.cx,y:center.cy},{x:south.cx,y:south.cy},TT.DRAWBRIDGE_DOWN);setTerrainTile58(m,center.cx,center.cy,TT.GOLD);setTerrainTile58(m,left.cx,left.cy,TT.STAMINA_PAD);setTerrainTile58(m,right.cx,right.cy,TT.STAMINA_PAD);setTerrainTile58(m,nw.cx,nw.cy,TT.CACHE);setTerrainTile58(m,se.cx,se.cy,TT.CRUMBLE);state.crumbleBase60[k(se.cx,se.cy)]=TT.VOID;
      const hidden=[];for(let x=left.cx+3;x<center.cx-5;x++)hidden.push({x,y:left.cy});registerHidden(hidden,TT.HIDDEN_BRIDGE,TT.PAPER_BRIDGE,'최종전의 숨은 위상선',TT.VOID);
      state.layoutName='만루보주 보스 · 천실핵 / 오방 부유섬 / 붕괴 외곽';bp={x:center.cx,y:center.cy};start={x:south.cx,y:south.cy};exit={x:north.cx,y:north.cy};
    }
    state.player.x=start.x;state.player.y=start.y;state.stairs={...exit};setTerrainTile58(state.map,exit.x,exit.y,TT.STAIR);boss.x=bp.x;boss.y=bp.y;state.monsters=[boss];state.bossPos60=bp;
  }
  const FLOOR_FEELINGS=[
    {id:'supply',name:'보급',glyph:'량',desc:'회복 자원이 풍부한 층. 여유가 생길 때 다음 전투를 준비하기 좋다.'},
    {id:'war',name:'경계',glyph:'병',desc:'적이 많고 장비 보상이 좋은 층. 전투를 피할지 밀어붙일지 판단해야 한다.'},
    {id:'traps',name:'불온',glyph:'위',desc:'함정과 전술 물품이 늘어난 층. 소모품을 아끼기보다 지형을 읽는 편이 낫다.'},
    {id:'secrets',name:'비밀',glyph:'은',desc:'숨은 보급과 유물 가능성이 높은 층. 벽과 막다른 길을 의심할 가치가 있다.'}
  ];
  function isMajor(){return !!(state?.specialFloor||[5,10,15,20,25].includes(state?.floor))}
  function chooseFeeling(){
    if(isMajor()||state.floor<=1){state.floorFeeling62=null;return null}
    const n=state.floorTrait47?.[0]||null;
    const map={보급:'supply',경계:'war',불온:'traps',비밀:'secrets'};
    const f=FLOOR_FEELINGS.find(x=>x.id===map[n])||FLOOR_FEELINGS[Math.floor(hash2(state.floor,state.rooms?.length||0,6201)*FLOOR_FEELINGS.length)%FLOOR_FEELINGS.length];
    state.floorFeeling62={...f};V62.lastFeeling=f.id;return state.floorFeeling62
  }
  function applyFeeling(){return chooseFeeling()}
  function installKeyTrial(){return false}
  const LOCK_SPECIAL=new Map([[2,2],[4,1],[18,1],[24,1]]);
  const LOCK_NORMAL=new Map([[14,2],[19,2]]);
  // F20 owns an authored three-stage boss seal in the architecture pass; keep it out of generic lock placement,
  // but make the canonical lock/surface auditors enforce its exact key and gate count.
  const LOCK_CUSTOM=new Map([[20,3]]);
  const expectedLockCount=(floor=state?.floor)=>+floor===2&&state?.floor2Choice63?.version>=5?6:LOCK_CUSTOM.get(+floor)||LOCK_SPECIAL.get(+floor)||LOCK_NORMAL.get(+floor)||0;
  const KEY_TYPES=[
    {id:'iron',name:'철제 열쇠',color:'#c1aa7b',dark:'#55462e'},
    {id:'jade',name:'청옥 열쇠',color:'#7ac0a1',dark:'#25493a'},
    {id:'brass',name:'황동 열쇠',color:'#d6a94f',dark:'#5d421b'},
    {id:'choice-copper',name:'동제 갈림열쇠',color:'#e29c65',dark:'#63341e'},
    {id:'choice-silver',name:'은제 갈림열쇠',color:'#b9d2e4',dark:'#34475f'},
    {id:'f2-danger-exit',name:'혈문 출구열쇠',color:'#d88069',dark:'#613329'},
    {id:'f2-east-safe-exit',name:'동쪽 회랑 출구열쇠',color:'#d7c084',dark:'#625538'},
    {id:'f2-west-safe-exit',name:'서쪽 회랑 출구열쇠',color:'#99caba',dark:'#375f53'},
    {id:'f2-unknown-exit',name:'암실 출구열쇠',color:'#c3a6d1',dark:'#56405d'}
  ];
  function clearLegacyTrial(){
    state.keyTrial94=null;
    if(state.floor===18){for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){if(state.map[y][x]===TT.KEY_TILE)setTerrainTile58(state.map,x,y,TT.FLOOR);else if(state.map[y][x]===TT.LOCKED_GATE)setTerrainTile58(state.map,x,y,TT.DOOR)}}
    state.floorKeys=0;state.floorKeysRequired=0;if(state.floor===18)state.layoutName=(state.layoutName||'').replace(' / 삼중 열쇠','');
  }
  function corridorDoorCandidate(p){
    if(!p||!in85(p.x,p.y))return false;const t=state.map[p.y][p.x];if(![TT.DOOR,TT.OPEN_DOOR,TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.CARPET].includes(t)||OccupancyService.isOccupied(p.x,p.y))return false;
    const l=!tileBlocks(state.map[p.y][p.x-1]),r=!tileBlocks(state.map[p.y][p.x+1]),u=!tileBlocks(state.map[p.y-1][p.x]),d=!tileBlocks(state.map[p.y+1][p.x]);
    return (l&&r&&!u&&!d)||(u&&d&&!l&&!r);
  }
  function placeKeyInReach(keyId,openedIds,preferZone=null){
    const {q}=ReachabilityService.keyDoorWalk({key85,in85,doorPos96},true,new Set(openedIds));let cells=q.filter(p=>p.d>6&&[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.CARPET].includes(state.map[p.y][p.x])&&!OccupancyService.isOccupied(p.x,p.y)&&!(state.items||[]).some(i=>i.x===p.x&&i.y===p.y));
    if(preferZone){const inZone=cells.filter(p=>p.x>=preferZone.x&&p.x<preferZone.x+preferZone.w&&p.y>=preferZone.y&&p.y<preferZone.y+preferZone.h);if(inZone.length)cells=inZone}
    cells.sort((a,b)=>b.d-a.d);const prior=state.keyPlan96.keys||[];let p=cells.find(c=>prior.every(k=>Math.abs(k.x-c.x)+Math.abs(k.y-c.y)>8));if(!p)p=cells.find(c=>prior.every(k=>Math.abs(k.x-c.x)+Math.abs(k.y-c.y)>3));if(!p){const all=ReachabilityService.keyDoorWalk({key85,in85,doorPos96},true,new Set(openedIds)).q.filter(c=>c.d>2&&[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.CARPET].includes(state.map[c.y][c.x])&&!OccupancyService.isOccupied(c.x,c.y)&&!(state.items||[]).some(i=>i.x===c.x&&i.y===c.y));all.sort((a,b)=>b.d-a.d);p=all[0]}if(!p)return null;setTerrainTile58(state.map,p.x,p.y,TT.KEY_TILE);const meta={x:p.x,y:p.y,keyId,active:true};state.keyPlan96.keys.push(meta);return meta;
  }
  function forcePathGate(keyId,groupIndex,fraction=.72){
    const path=ReachabilityService.architectureMainPath({key85,in85});if(!path?.length)return null;const target=Math.floor(path.length*fraction),order=[...Array(path.length).keys()].filter(i=>i>5&&i<path.length-5).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));
    for(const i of order.slice(0,24)){const p=path[i],a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];if(!p||OccupancyService.isOccupied(p.x,p.y))continue;const horiz=Math.abs(b.x-a.x)>=Math.abs(b.y-a.y);for(const span of [7,11,15,21,31]){
        const changed=[];const half=Math.floor(span/2);for(let o=-half;o<=half;o++){const x=horiz?p.x:p.x+o,y=horiz?p.y+o:p.y;if(!in85(x,y)||x===state.player.x&&y===state.player.y||x===state.stairs.x&&y===state.stairs.y)continue;const old=state.map[y][x];if(old===TT.STAIR||old===TT.VAULT||old===TT.ALTAR||old===TT.CACHE||old===TT.KEY_TILE)continue;changed.push({x,y,old});setTerrainTile58(state.map,x,y,(o===0)?TT.LOCKED_GATE:TT.WALL)}
        if(state.map[p.y][p.x]!==TT.LOCKED_GATE){for(const c of changed)setTerrainTile58(state.map,c.x,c.y,c.old);continue}
        const d={x:p.x,y:p.y,keyId,group:groupIndex,open:false,forced:true};const q=[{x:state.player.x,y:state.player.y}],seen=new Set([key85(state.player.x,state.player.y)]);for(let n=0;n<q.length;n++){const c=q[n];for(const[dx,dy]of DIRS4){const x=c.x+dx,y=c.y+dy,kk=key85(x,y);if(!in85(x,y)||seen.has(kk)||x===d.x&&y===d.y||tileBlocks(state.map[y][x]))continue;seen.add(kk);q.push({x,y})}}
        if(!seen.has(key85(state.stairs.x,state.stairs.y)))return d;for(const c of changed)setTerrainTile58(state.map,c.x,c.y,c.old);
      }
    }return null;
  }
  function auditKeyPlanLocks(plan=state.keyPlan96){
    if(!plan||!plan.groups?.length)return null;
    if(plan.kind==='f2-choice')return auditChoiceLocks(plan);
    const expected=expectedLockCount(),ids=(plan.groups||[]).map(g=>g.keyId),unique=[...new Set(ids)],stages=[];
    const finalTarget=plan.finalTarget&&in85(plan.finalTarget.x,plan.finalTarget.y)?plan.finalTarget:state.stairs,finalTargetLabel=plan.finalTargetLabel||'stairs';
    const keyFor=id=>(plan.keys||[]).find(k=>k.keyId===id&&k.active!==false)||(plan.keys||[]).find(k=>k.keyId===id)||null;
    const duplicateTypes=unique.length!==ids.length;
    for(let i=0;i<ids.length;i++){
      const id=ids[i],before=ReachabilityService.keyDoorWalk({key85,in85,doorPos96},true,new Set(ids.slice(0,i))).seen,after=ReachabilityService.keyDoorWalk({key85,in85,doorPos96},true,new Set(ids.slice(0,i+1))).seen;
      const key=keyFor(id),last=i===ids.length-1,nextKey=last?null:keyFor(ids[i+1]),target=last?finalTarget:nextKey;
      const futureBefore=ids.slice(i+1).filter(fid=>{const q=keyFor(fid);return !!q&&before.has(key85(q.x,q.y))});
      const deeperAfter=ids.slice(i+2).filter(fid=>{const q=keyFor(fid);return !!q&&after.has(key85(q.x,q.y))});
      const keyReachable=!!key&&before.has(key85(key.x,key.y));
      const targetBefore=!!target&&before.has(key85(target.x,target.y));
      const targetAfter=!!target&&after.has(key85(target.x,target.y));
      const exitBefore=!!finalTarget&&before.has(key85(finalTarget.x,finalTarget.y)),exitAfter=!!finalTarget&&after.has(key85(finalTarget.x,finalTarget.y));
      let gainedCells=0;for(const kk of after)if(!before.has(kk))gainedCells++;
      const doorChecks=(plan.groups[i]?.doors||[]).map(d=>{let near=0,far=0;for(const[dx,dy]of DIRS4){const x=d.x+dx,y=d.y+dy;if(!in85(x,y))continue;const kk=key85(x,y);if(before.has(kk))near++;if(after.has(kk)&&!before.has(kk))far++}return{x:d.x,y:d.y,nearSide:near,farSide:far,cuts:near>0&&far>0}});
      const allDoorsCut=doorChecks.length>0&&doorChecks.every(d=>d.cuts);
      const stageOk=keyReachable&&!targetBefore&&targetAfter&&!futureBefore.length&&!deeperAfter.length&&gainedCells>0&&allDoorsCut&&(last?exitAfter:!exitAfter);
      stages.push({index:i,keyId:id,keyType:id,keyReachable,target:last?finalTargetLabel:ids[i+1],targetBefore,targetAfter,futureKeysBefore:futureBefore,deeperKeysAfter:deeperAfter,exitBefore,exitAfter,gainedCells,doors:(plan.groups[i]?.doors||[]).length,doorChecks,allDoorsCut,ok:stageOk});
    }
    const exitAfterAll=!!finalTarget&&ReachabilityService.keyDoorWalk({key85,in85,doorPos96},true,new Set(ids)).seen.has(key85(finalTarget.x,finalTarget.y));
    const typeSeparated=!duplicateTypes&&ids.every((id,i)=>plan.groups[i]?.keyId===id&&!!keyFor(id));
    const countMatch=!expected||(plan.groups.length===expected&&plan.keys.length===expected);
    const ok=!!exitAfterAll&&typeSeparated&&countMatch&&plan.groups.length===plan.keys.length&&stages.length===plan.groups.length&&stages.every(s=>s.ok);
    return{kind:plan.kind,expected,groups:plan.groups.length,doors:(plan.doors||[]).length,keys:(plan.keys||[]).length,countMatch,keyTypes:[...ids],typeSeparated,duplicateTypes,stages,finalTarget:{x:finalTarget?.x,y:finalTarget?.y,label:finalTargetLabel},exitAfterAll,ok};
  }
  function validLockPlan(plan=state.keyPlan96){return !!auditKeyPlanLocks(plan)?.ok}
  function exitVestibule(count,baseMap){
    if(baseMap)state.map=cloneTerrainMap58(baseMap);state.keyPlan96={doors:[],keys:[],ring:{},groups:[],kind:'exit-vestibule'};
    const s=state.stairs,px=state.player.x,py=state.player.y,maxR=Math.min(s.x-2,COLS-3-s.x,s.y-2,ROWS-3-s.y);if(maxR<3)return false;
    const radii=count>=2&&maxR>=4?[4,2]:[Math.min(3,maxR)];if(count>radii.length)return false;
    // Pick a gate side that already faces reachable unlocked floor whenever possible.
    const unlocked=(()=>{const q=[{x:px,y:py}],seen=new Set([key85(px,py)]);for(let i=0;i<q.length;i++){const a=q[i];for(const[dx,dy]of DIRS4){const x=a.x+dx,y=a.y+dy,kk=key85(x,y);if(!in85(x,y)||seen.has(kk)||tileBlocks(state.map[y][x]))continue;seen.add(kk);q.push({x,y})}}return seen})();
    const outer=radii[0],sides=[{dx:-1,dy:0},{dx:1,dy:0},{dx:0,dy:-1},{dx:0,dy:1}].filter(v=>in85(s.x+v.dx*(outer+1),s.y+v.dy*(outer+1))).sort((a,b)=>{
      const ax=s.x+a.dx*(outer+1),ay=s.y+a.dy*(outer+1),bx=s.x+b.dx*(outer+1),by=s.y+b.dy*(outer+1),ar=unlocked.has(key85(ax,ay))?0:1000,br=unlocked.has(key85(bx,by))?0:1000;return ar+Math.abs(ax-px)+Math.abs(ay-py)-(br+Math.abs(bx-px)+Math.abs(by-py))});
    const side=sides[0]||{dx:Math.abs(px-s.x)>=Math.abs(py-s.y)?Math.sign(px-s.x)||-1:0,dy:Math.abs(py-s.y)>Math.abs(px-s.x)?Math.sign(py-s.y)||-1:0};
    // Clear the chamber interiors and build nested architectural wall rings.
    for(let yy=s.y-outer;yy<=s.y+outer;yy++)for(let xx=s.x-outer;xx<=s.x+outer;xx++)if(in85(xx,yy)&&!(xx===s.x&&yy===s.y))setTerrainTile58(state.map,xx,yy,TT.FLOOR);
    for(let gi=0;gi<count;gi++){
      const r=radii[gi],id=KEY_TYPES[gi].id;for(let yy=s.y-r;yy<=s.y+r;yy++)for(let xx=s.x-r;xx<=s.x+r;xx++)if(in85(xx,yy)&&(xx===s.x-r||xx===s.x+r||yy===s.y-r||yy===s.y+r))setTerrainTile58(state.map,xx,yy,TT.WALL);
      const gx=s.x+side.dx*r,gy=s.y+side.dy*r;setTerrainTile58(state.map,gx,gy,TT.LOCKED_GATE);const d={x:gx,y:gy,keyId:id,group:gi,open:false,vestibule:true};state.keyPlan96.doors.push(d);state.keyPlan96.groups.push({keyId:id,doors:[d]});
      // Make a short, readable approach throat toward the next ring/outside.
      for(let q=1;q<=2;q++){const x=gx+side.dx*q,y=gy+side.dy*q;if(in85(x,y)&&state.map[y][x]===TT.WALL)setTerrainTile58(state.map,x,y,TT.FLOOR)}
    }
    setTerrainTile58(state.map,s.x,s.y,TT.STAIR);
    const opened=[];for(let gi=0;gi<count;gi++){const id=KEY_TYPES[gi].id,key=placeKeyInReach(id,opened);if(!key)return false;opened.push(id)}
    if(!validLockPlan())return false;state.layoutName+=' / 잠긴 전실';return true;
  }
  function stagedGateCandidate(path,keyId,groupIndex,fraction,openedIds){
    const target=Math.floor(path.length*fraction),order=[...Array(path.length).keys()].filter(i=>i>6&&i<path.length-6).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));
    for(const i of order){const p=path[i];if(!p||OccupancyService.isOccupied(p.x,p.y)||!corridorDoorCandidate(p))continue;const old=state.map[p.y][p.x];setTerrainTile58(state.map,p.x,p.y,TT.LOCKED_GATE);const d={x:p.x,y:p.y,keyId,group:groupIndex,open:false,staged:true};state.keyPlan96.doors.push(d);state.keyPlan96.groups.push({keyId,doors:[d]});const closed=ReachabilityService.keyDoorWalk({key85,in85,doorPos96},true,new Set(openedIds)).seen,opened=ReachabilityService.keyDoorWalk({key85,in85,doorPos96},true,new Set([...openedIds,keyId])).seen;const good=!closed.has(key85(state.stairs.x,state.stairs.y))&&opened.has(key85(state.stairs.x,state.stairs.y));if(good)return d;state.keyPlan96.groups.pop();state.keyPlan96.doors.pop();setTerrainTile58(state.map,p.x,p.y,old)}
    return null;
  }
  function installGenericLocks(count){
    const path=ReachabilityService.architectureMainPath({key85,in85});if(!path?.length||path.length<12)return false;const baseMap=cloneTerrainMap58(state.map);state.keyPlan96={doors:[],keys:[],ring:{},groups:[],kind:'sequential-path'};const opened=[];
    // First try real corridor/room doors along the critical route. Every stage is validated with earlier keys considered open.
    for(let gi=0;gi<count;gi++){
      const id=KEY_TYPES[gi].id,fraction=count===1?.72:(gi===0?.40:.72);let d=stagedGateCandidate(path,id,gi,fraction,opened);
      if(!d){state.map=cloneTerrainMap58(baseMap);state.keyPlan96=null;return exitVestibule(count,baseMap)}
      const key=placeKeyInReach(id,opened);if(!key){state.map=cloneTerrainMap58(baseMap);state.keyPlan96=null;return exitVestibule(count,baseMap)}opened.push(id);
    }
    if(!validLockPlan()){state.map=cloneTerrainMap58(baseMap);state.keyPlan96=null;return exitVestibule(count,baseMap)}
    state.layoutName+=' / 잠긴 문';return true;
  }
  function installF2Locks(){
    const authored=state.floor2Choice63;if(!authored)return false;
    const plan=state.keyPlan96={doors:[],keys:[],ring:{},groups:[],kind:'f2-choice',exitSeals68:authored.version>=5};
    for(const [group,stage]of authored.stages.entries()){
      const doors=stage.doors.map(d=>({...d,keyId:stage.keyId,group,open:false}));
      plan.doors.push(...doors);plan.groups.push({keyId:stage.keyId,mode:'single-choice',doors});plan.keys.push({...stage.key,keyId:stage.keyId,active:true});plan.ring[stage.keyId]=0;
      for(const d of doors)setTerrainTile58(state.map,d.x,d.y,TT.LOCKED_GATE);setTerrainTile58(state.map,stage.key.x,stage.key.y,TT.KEY_TILE);
    }
    if(plan.exitSeals68)for(const branch of authored.branches){const q=branch.exitSeal,group=plan.groups.length,d={...q.wall,keyId:q.keyId,group,branch:branch.id,exitSeal68:true,open:false};
      plan.doors.push(d);plan.groups.push({keyId:q.keyId,mode:'route-exit',branch:branch.id,doors:[d]});plan.keys.push({...q.key,keyId:q.keyId,branch:branch.id,active:true,floorTile49:branch.kind==='danger'?TT.CARPET:branch.kind==='safe'?TT.STONE_PATH:TT.FLOOR});plan.ring[q.keyId]=0;
      setTerrainTile58(state.map,d.x,d.y,TT.LOCKED_GATE);setTerrainTile58(state.map,q.key.x,q.key.y,TT.KEY_TILE);
    }
    return true;
  }
  function auditChoiceLocks(plan){
    const walk=(open)=>{const q=[state.fixedStart||state.player],seen=new Set([key85(q[0].x,q[0].y)]),doors=new Map(plan.doors.map(d=>[key85(d.x,d.y),d]));for(let i=0;i<q.length;i++)for(const[dx,dy]of DIRS4){const x=q[i].x+dx,y=q[i].y+dy,kk=key85(x,y);if(!in85(x,y)||seen.has(kk))continue;const d=doors.get(kk),t=state.map[y][x];if(d?!open.has(kk):tileBlocks(t)&&![TT.DOOR,TT.KEY_TILE].includes(t))continue;seen.add(kk);q.push({x,y})}return seen};
    const keys=plan.keys,groups=plan.groups.filter(g=>g.mode==='single-choice'),has=(set,p)=>!!p&&set.has(key85(p.x,p.y)),initial=walk(new Set()),runs=[];
    const stageKeys=groups.map(g=>keys.find(q=>q.keyId===g.keyId));
    if(groups.length===2&&groups.every(g=>g.doors.length===2))for(const a of groups[0].doors)for(const b of groups[1].doors){
      const opened=new Set([key85(a.x,a.y)]),beforeFirstExit=walk(opened);let first=beforeFirstExit,second=null,last=null,exitKeys=true,reverseBlocked=true,unselectedReachable=0;
      if(plan.exitSeals68){
        const firstSeal=plan.doors.find(d=>d.exitSeal68&&d.branch===a.branch),secondSeal=plan.doors.find(d=>d.exitSeal68&&d.branch===b.branch),firstKey=keys.find(q=>q.keyId===firstSeal?.keyId),secondKey=keys.find(q=>q.keyId===secondSeal?.keyId);
        if(!firstSeal||!secondSeal){runs.push({ok:false,reason:'missing-exit-seal'});continue}
        exitKeys=has(beforeFirstExit,firstKey)&&!has(beforeFirstExit,stageKeys[1]);opened.add(key85(firstSeal.x,firstSeal.y));first=walk(opened);opened.add(key85(b.x,b.y));second=walk(opened);
        exitKeys=exitKeys&&has(second,secondKey)&&!has(second,state.stairs);opened.add(key85(secondSeal.x,secondSeal.y));last=walk(opened);
        for(const branch of state.floor2Choice63.branches.filter(q=>q.id!==a.branch&&q.id!==b.branch))for(const kk of branch.cells){const[x,y]=kk.split(',').map(Number);if(y>=(branch.id<2?23:8)&&y<=(branch.id<2?33:18)&&last.has(kk))unselectedReachable++}
        reverseBlocked=unselectedReachable===0;
      }else{opened.add(key85(b.x,b.y));last=walk(opened)}
      const requiredLoot=(state.items||[]).filter(it=>!plan.exitSeals68||!Number.isInteger(it.floor2Bonus66)||it.floor2Bonus66===a.branch||it.floor2Bonus66===b.branch);
      const r={choices:[a.label,b.label],branches:[a.branch,b.branch],firstKey:has(initial,stageKeys[0]),secondKey:has(first,stageKeys[1]),noEarlyExit:!has(first,state.stairs),exit:has(last,state.stairs),allLoot:requiredLoot.every(it=>has(last,it)),exitKeys,reverseBlocked,unselectedReachable};r.ok=r.firstKey&&r.secondKey&&r.noEarlyExit&&r.exit&&r.allLoot&&r.exitKeys&&r.reverseBlocked;runs.push(r);
    }
    const expected=plan.exitSeals68?6:2,countMatch=keys.length===expected&&plan.groups.length===expected&&plan.doors.length===(plan.exitSeals68?8:4),typeSeparated=new Set(keys.map(q=>q.keyId)).size===keys.length,ok=countMatch&&typeSeparated&&runs.length===4&&!has(initial,stageKeys[1])&&!has(initial,state.stairs)&&runs.every(r=>r.ok);
    return{kind:plan.kind,expected,groups:plan.groups.length,doors:plan.doors.length,keys:keys.length,keyTypes:keys.map(q=>q.keyId),countMatch,typeSeparated,stages:runs,exitAfterAll:runs.every(r=>r.exit),ok};
  }
  function guaranteedSingleLock(baseMap){
    if(baseMap)state.map=cloneTerrainMap58(baseMap);state.keyPlan96={doors:[],keys:[],ring:{},groups:[],kind:'forced-single'};const id='iron',d=forcePathGate(id,0,.76);if(!d){state.keyPlan96=null;return false}state.keyPlan96.doors=[d];state.keyPlan96.groups=[{keyId:id,doors:[d]}];const key=placeKeyInReach(id,[]);if(!key||!validLockPlan()){state.map=cloneTerrainMap58(baseMap);state.keyPlan96=null;return false}state.layoutName+=' / 잠긴 문';return true;
  }
function installFloor24GrandEntrance(){
    const q=state.floor24;if(state.floor!==24||!q?.entranceGateCells?.length||!q.entranceKey)return false;const id='brass',doors=q.entranceGateCells.map(c=>({x:c.x,y:c.y,keyId:id,group:0,open:false,grandEntrance:true})),key={...q.entranceKey,keyId:id,active:true};state.keyPlan96={doors,keys:[key],ring:{brass:0},groups:[{keyId:id,doors}],kind:'f24-grand-entrance',finalTarget:{...state.stairs},finalTargetLabel:'stairs'};for(const d of doors)setTerrainTile58(state.map,d.x,d.y,TT.LOCKED_GATE);setTerrainTile58(state.map,key.x,key.y,TT.KEY_TILE);return validLockPlan()
  }
  function installLockPlan(){
    if(!state)return false;clearLegacyTrial();state.keyPlan96=null;if(state.floor===24)return installFloor24GrandEntrance();const n=LOCK_SPECIAL.get(state.floor)||LOCK_NORMAL.get(state.floor)||0;if(!n)return false;const base=cloneTerrainMap58(state.map);
    if(state.floor===2)return installF2Locks()&&validLockPlan();
    let ok=installGenericLocks(n);if(ok&&validLockPlan())return true;
    state.map=cloneTerrainMap58(base);state.keyPlan96=null;ok=exitVestibule(Math.min(n,2),base);if(ok&&validLockPlan())return true;
    state.map=cloneTerrainMap58(base);state.keyPlan96=null;return guaranteedSingleLock(base);
  }
const regionOfFloor=()=>Math.max(0,Math.min(4,Math.floor(((state?.floor||1)-1)/5)));
function roomObj(x,y,w,h,name='후첨 구획'){return{x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2),name,append1020:true}}
function archSetTile(x,y,t,force=false){if(!inside1020(x,y))return false;const old=state.map[y][x],activeExit=!!state?.stairs&&state.stairs.x===x&&state.stairs.y===y;if((old===TT.STAIR||activeExit)&&t!==TT.STAIR)return false;if(!force&&PROTECTED().has(old))return false;setTerrainTile58(state.map,x,y,t);return true}
function archLine(x0,y0,x1,y1,t=TT.FLOOR,width=1,force=false){
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.sign(x1-x0),dy=Math.sign(y1-y0);let x=x0,y=y0,guard=0;
  while(guard++<COLS+ROWS+200){for(let oy=-Math.floor((width-1)/2);oy<=Math.floor(width/2);oy++)for(let ox=-Math.floor((width-1)/2);ox<=Math.floor(width/2);ox++)archSetTile(x+ox,y+oy,t,force);if(x===x1&&y===y1)break;if(x!==x1)x+=dx;else if(y!==y1)y+=dy}
}
function archRect(x,y,w,h,t=TT.FLOOR,force=false){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)archSetTile(xx,yy,t,force)}
function archBox(x,y,w,h,floor=TT.FLOOR,wall=TT.WALL,force=false){
  archRect(x,y,w,h,wall,force);if(w>2&&h>2)archRect(x+1,y+1,w-2,h-2,floor,force);return appendRoomOnce(roomObj(x,y,w,h));
}
function archDoor(x,y){return archSetTile(x,y,TT.DOOR,true)}
function archWindow(x,y){return archSetTile(x,y,TT.WINDOW,true)}
function archRouteTag(x,y,label){state.routeTags=state.routeTags||[];state.routeTags.push({x,y,label,append1020:true})}
function archDecor(x,y,kind){if(!inside1020(x,y))return;state.archDecor1020=state.archDecor1020||{};state.archDecor1020[K1020(x,y)]=kind}
function occupiedFinal(x,y){return (state.items||[]).some(i=>i.x===x&&i.y===y)||(state.monsters||[]).some(m=>monCovers(m,x,y)&&m.hp>0)||(state.player?.x===x&&state.player?.y===y)||(state.stairs?.x===x&&state.stairs?.y===y)}
function clearOldKeyTiles(){
  const plan=state.keyPlan96;if(!plan)return;for(const q of plan.keys||[])if(state.map?.[q.y]?.[q.x]===TT.KEY_TILE)setTerrainTile58(state.map,q.x,q.y,TT.FLOOR);
  for(const d of plan.doors||[])if(state.map?.[d.y]?.[d.x]===TT.LOCKED_GATE)setTerrainTile58(state.map,d.x,d.y,TT.FLOOR);state.keyPlan96=null;
}
function moveStair(x,y){if(state.stairs&&inside1020(state.stairs.x,state.stairs.y)&&state.map[state.stairs.y][state.stairs.x]===TT.STAIR)setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.FLOOR);state.stairs={x,y};setTerrainTile58(state.map,x,y,TT.STAIR);state.fixedExit={x,y}}
function archMovePlayer(x,y){state.player.x=x;state.player.y=y;state.fixedStart={x,y}}
/* F04: preserve the central diamond and carve four symmetric archival/service wings out of the unused wall mass. */
function build4_(){
  const cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2),rw=15,rh=9,dx=26,dy=17;
  const specs=[[cx-dx-rw/2,cy-dy-rh/2],[cx+dx-rw/2,cy-dy-rh/2],[cx-dx-rw/2,cy+dy-rh/2],[cx+dx-rw/2,cy+dy-rh/2]].map(([x,y])=>[Math.round(x),Math.round(y)]);
  specs.forEach(([x,y],i)=>{
    const r=archBox(x,y,rw,rh,i<2?TT.WOOD_FLOOR:TT.FLOOR,TT.WALL,true),leftSide=r.cx<cx,towardX=leftSide?r.x+r.w-1:r.x,towardY=r.cy;
    // central archival aisle + two true side rooms; no empty rectangle.
    for(let yy=r.y+1;yy<r.y+r.h-1;yy++)setTerrainTile58(state.map,r.cx,yy,TT.WALL);archDoor(r.cx,r.cy);
    const sy=r.cy;for(let xx=r.x+1;xx<r.x+r.w-1;xx++)if(Math.abs(xx-r.cx)>1)setTerrainTile58(state.map,xx,sy,TT.WALL);archDoor(r.x+3,sy);archDoor(r.x+r.w-4,sy);
    archDoor(towardX,towardY);const tx=leftSide?cx-12:cx+12;archLine(towardX,towardY,tx,towardY,TT.FLOOR,2,true);archLine(tx,towardY,tx,cy+(r.cy<cy?-8:8),TT.FLOOR,2,true);
    for(let yy=r.y+2;yy<r.y+r.h-2;yy+=3){const wx=leftSide?r.x:r.x+r.w-1;archWindow(wx,yy)}
    archRouteTag(r.cx,r.cy,`청풍루 ${i<2?'상층':'하층'} 부속 기록실`)
  });
  state.layoutName=(state.layoutName||'청풍루')+' · 사방 부속기록실 / 분할 서고·회랑 증축';
}
function buildBossMazeCommon(style){
  const cx=Math.floor(COLS/2),startY=ROWS-5,boss=state.monsters?.find(m=>m.boss),bossY=Math.max(7,Math.round(ROWS*.17));
  const stageTop=Math.round(ROWS*.18),stageBottom=ROWS-4,wall=TT.WALL,floor=style===15?TT.CARPET:style===20?TT.STONE_PATH:TT.FLOOR;
  // keep original arena shell; impose three symmetric cloister stages inside the lower 2/3.
  const bands=style===20?[Math.round(ROWS*.76),Math.round(ROWS*.55),Math.round(ROWS*.34)]:[Math.round(ROWS*.72),Math.round(ROWS*.55),Math.round(ROWS*.38)];
  for(let bi=0;bi<bands.length;bi++){
    const y=bands[bi],span=style===20?Math.round(COLS*(.26+bi*.025)):Math.round(COLS*(.30+bi*.025)),lx=cx-span,rx=cx+span;
    // paired chamber blocks
    const h=style===20?13:7,w=style===20?Math.max(23,(Math.round(COLS*.20)|1)):Math.max(11,Math.round(COLS*.16));
    const ly=y-Math.floor(h/2),leftX=style===20?Math.max(3,lx-w+5):lx-w+5,left=archBox(leftX,ly,w,h,floor,wall,true),right=archBox(style===20?COLS-leftX-w:rx-5,ly,w,h,floor,wall,true),routeW=style===20?3:2;
    // side loop corridor and paired doors. F20 uses odd-width centered corridors so the collision map itself is mirror-exact.
    const sideY=bi%2?y-1:y+1;archDoor(left.x+left.w-1,sideY);archDoor(right.x,sideY);
    archLine(left.x+left.w-1,sideY,cx-6,sideY,floor,routeW,true);archLine(right.x,sideY,cx+6,sideY,floor,routeW,true);
    // central barricade means you must enter one of the two architectural loops before continuing upward
    archRect(cx-5,y-2,11,5,wall,true);
    const upperY=y-5;archLine(cx-6,sideY,cx-6,upperY,floor,routeW,true);archLine(cx+6,sideY,cx+6,upperY,floor,routeW,true);archLine(cx-6,upperY,cx+6,upperY,floor,routeW,true);
    if(style===15){for(let x=left.x+2;x<left.x+left.w-2;x+=3)setTerrainTile58(state.map,x,left.cy,TT.CARPET);for(let x=right.x+2;x<right.x+right.w-2;x+=3)setTerrainTile58(state.map,x,right.cy,TT.CARPET)}
    if(style===20){for(const r of [left,right]){setTerrainTile58(state.map,r.cx,r.cy,TT.RACK);setTerrainTile58(state.map,r.cx+(r===left?2:-2),r.cy,TT.CRATE)}}
  }
  // starting vestibule to the first loop
  archLine(cx,startY,cx,bands[0]+4,floor,style===20?3:2,true);
  // boss hall: broad but bounded; the exit stair is inside the arena. Boss rewards are direct drops.
  const bw=Math.round(COLS*(style===20?.62:.46)),bh=style===20?17:12,bx=cx-Math.floor(bw/2),by=4;archBox(bx,by,bw,bh,style===15?TT.CARPET:style===20?TT.GILDED_FLOOR:TT.WOOD_FLOOR,wall,true);
  const entranceY=by+bh-1;archDoor(cx,entranceY);archLine(cx,bands[2]-6,cx,entranceY,floor,style===20?3:2,true);
  const stairY=by+2;state.bossExitGate1020=null;moveStair(cx,stairY);archRouteTag(cx,stairY,'보스실 내부 하행계단');
  if(boss){boss.x=cx;boss.y=by+Math.floor(bh*.58)}
  state.layoutName=(state.layoutName||`F${style} 보스층`)+` · 전미궁 ${style===5?'회랑연회관':style===15?'거울비단원':'봉쇄감방군'} / 후면 보스실`;
  archRouteTag(cx,bands[1],`보스 전미궁 · 제2 회랑`);archRouteTag(cx,by+bh-3,'후면 독립 보스실');
}
function build5_(){
  buildBossMazeCommon(5);
  const cx=Math.floor(COLS/2),top=Math.round(ROWS*.34),bottom=ROWS-7;
  // The inn boss floor needs a genuine front labyrinth, not a big empty hall with decorative room outlines.
  // Three symmetric cross-walls have alternating paired gates; the player must weave left/right while retaining loops.
  const bands=[bottom-2,bottom-9,bottom-16].filter(y=>y>top+2),gaps=[[cx-15,cx+15],[cx-8,cx+8],[cx-17,cx+17]];
  bands.forEach((y,i)=>{for(let x=7;x<COLS-7;x++)setTerrainTile58(state.map,x,y,TT.WALL);for(const gx of gaps[i])archRect(gx-1,y,3,1,TT.FLOOR,true);const vy=y-5;if(vy>top){for(const vx of [cx-22,cx+22,cx-4,cx+4])for(let yy=vy;yy<y;yy++)if(inside1020(vx,yy))setTerrainTile58(state.map,vx,yy,TT.WALL);for(const vx of [cx-22,cx+22])archDoor(vx,y-3)}});
  // paired guest/service rooms between the maze bands; all doors face the circulating route.
  const roomYs=[bottom-6,bottom-13];for(const yy of roomYs){for(const side of [-1,1]){const rx=side<0?8:COLS-19,r=archBox(rx,yy-3,11,6,TT.WOOD_FLOOR,TT.WALL,true);archDoor(side<0?r.x+r.w-1:r.x,r.cy);if(r.w>=9){for(let xx=r.x+2;xx<r.x+r.w-2;xx+=3)archWindow(xx,side<0?r.y:r.y+r.h-1)}}}
  // guarantee a 2-wide central start approach, but it terminates at the first band rather than becoming an answer corridor.
  archLine(cx,ROWS-5,cx,bands[0]+2,TT.FLOOR,2,true);
  state.layoutName=(state.layoutName||'청풍루 보스층')+' · 대칭 객실미궁 / 교대문 회랑 / 후면 보스실';
}
function build15_(){
  buildBossMazeCommon(15);
  const cx=Math.floor(COLS/2),F=TT.CARPET,keepTop=17;
  // bossMazeCommon leaves metadata for rooms that we are about to replace. Keep only real top/boss rooms; stale lower rooms must not survive as fake unreachable chambers.
  state.rooms=(state.rooms||[]).filter(r=>r&&Number.isFinite(r.cy)&&r.cy<keepTop&&safeFloorTile1020(state.map[r.cy]?.[r.cx]));
  for(let y=keepTop;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++)setTerrainTile58(state.map,x,y,TT.WALL);
  archMovePlayer(cx,ROWS-5);
  const rooms=[];
  const mk=(cx0,cy0,w,h,name)=>{const r=archBox(Math.round(cx0-w/2),Math.round(cy0-h/2),w,h,F,TT.WALL,true);rooms.push(r);archRouteTag(r.cx,r.cy,name);return r};
  const connect=(a,b,phase=0)=>{
    const horiz=Math.abs(a.cx-b.cx)>=Math.abs(a.cy-b.cy),sgnX=Math.sign(b.cx-a.cx)||1,sgnY=Math.sign(b.cy-a.cy)||-1;
    let ax=horiz?(sgnX>0?a.x+a.w-1:a.x):a.cx, ay=horiz?a.cy:(sgnY>0?a.y+a.h-1:a.y);
    let bx=horiz?(sgnX>0?b.x:b.x+b.w-1):b.cx, by=horiz?b.cy:(sgnY>0?b.y:b.y+b.h-1);
    archDoor(ax,ay);archDoor(bx,by);
    if(horiz){const bend=Math.round((ax+bx)/2)+(phase%2?2:-2);archLine(ax,ay,bend,ay,F,2,true);archLine(bend,ay,bend,by,F,2,true);archLine(bend,by,bx,by,F,2,true)}
    else{const bend=Math.round((ay+by)/2)+(phase%2?2:-2);archLine(ax,ay,ax,bend,F,2,true);archLine(ax,bend,bx,bend,F,2,true);archLine(bx,bend,bx,by,F,2,true)}
  };
  const start=mk(cx,ROWS-6,11,5,'침모전 진입전실');
  // Staggered sizes/y positions make the plan feel architectural rather than a room-grid.
  const A=[mk(cx-24,43,9,6,'서 비단응접실'),mk(cx-7,40,11,7,'서 거울실'),mk(cx+8,40,11,7,'동 거울실'),mk(cx+25,43,9,6,'동 비단응접실')];
  const B=[mk(cx-30,33,8,6,'서 향실'),mk(cx-15,31,10,6,'서 자수실'),mk(cx,34,9,7,'중앙 경대실'),mk(cx+15,31,10,6,'동 자수실'),mk(cx+30,33,8,6,'동 향실')];
  const C=[mk(cx-24,23,10,6,'서 환영실'),mk(cx-7,25,9,6,'서 비밀내실'),mk(cx+8,25,9,6,'동 비밀내실'),mk(cx+25,23,10,6,'동 환영실')];
  connect(start,A[1],0);connect(start,A[2],1);connect(start,A[0],0);connect(start,A[3],1);
  connect(A[0],A[1],0);connect(A[1],A[2],1);connect(A[2],A[3],0);
  connect(A[0],B[0],0);connect(A[0],B[1],1);connect(A[1],B[1],0);connect(A[1],B[2],1);connect(A[2],B[2],0);connect(A[2],B[3],1);connect(A[3],B[3],0);connect(A[3],B[4],1);
  connect(B[0],B[1],1);connect(B[1],B[2],0);connect(B[2],B[3],1);connect(B[3],B[4],0);
  connect(B[0],C[0],0);connect(B[1],C[0],1);connect(B[1],C[1],0);connect(B[2],C[1],1);connect(B[2],C[2],0);connect(B[3],C[2],1);connect(B[3],C[3],0);connect(B[4],C[3],1);
  connect(C[0],C[1],0);connect(C[1],C[2],1);connect(C[2],C[3],0);
  // Two boss-threshold approaches; either choice rejoins immediately at the threshold instead of forcing a floor-wide return.
  const L={x:cx-8,y:15,w:5,h:3,cx:cx-6,cy:16},R={x:cx+4,y:15,w:5,h:3,cx:cx+6,cy:16};archRect(L.x,L.y,L.w,L.h,F,true);archRect(R.x,R.y,R.w,R.h,F,true);
  connect(C[0],L,0);connect(C[1],L,1);connect(C[2],R,0);connect(C[3],R,1);archRect(cx-7,15,15,3,F,true);archLine(cx,17,cx,15,F,2,true);
  // Paired short reward salons remain loops, never dead inaccessible rectangles.
  const RL=mk(8,36,7,5,'서 유희실'),RR=mk(COLS-9,36,7,5,'동 유희실');connect(RL,A[0],0);connect(RL,B[0],1);connect(RR,A[3],0);connect(RR,B[4],1);
  const all=[...rooms];all.forEach((r,i)=>{;if(i%2===0){;;}});
  // Last-resort geometric check: connect any accidentally severed chamber to its nearest reachable corridor, never leave decorative unreachable rooms.
  let reach=reachableSet1020({unlock:true,openBoss:true});for(const r of all){if(reach.has(K1020(r.cx,r.cy)))continue;let best=null,bd=1e9;for(const kk of reach){const[x,y]=kk.split(',').map(Number),d=Math.abs(x-r.cx)+Math.abs(y-r.cy);if(d<bd){bd=d;best={x,y}}}if(best){archLine(r.cx,r.cy,best.x,r.cy,F,2,true);archLine(best.x,r.cy,best.x,best.y,F,2,true);reach=reachableSet1020({unlock:true,openBoss:true})}}
  // The original boss theatre leaves two ornate side galleries at y≈10. They are real rooms, not scenery: give each a short mirrored door/corridor into the boss-side hall so no decorative chamber is unreachable.
  const galleryY=10;archDoor(20,galleryY);archLine(20,galleryY,26,galleryY,F,1,true);archDoor(54,galleryY);archLine(48,galleryY,54,galleryY,F,1,true);
  state.layoutName=(state.layoutName||'유혹의 내실')+' · 교차 비단살롱 / 짧은 재합류 / 쌍환 동선 / 후면 침모실';
}
function build20_(){
  const cx=Math.floor(COLS/2),floor=TT.STONE_PATH,wall=TT.WALL,bands=[Math.round(ROWS*.76),Math.round(ROWS*.55),Math.round(ROWS*.34)];
  // F20 owns one coherent fortress map. Keep the old bilateral composition and lava identity, but use the
  // extra map volume for real rooms and traversal instead of a bigger empty shell.
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)setTerrainTile58(state.map,x,y,wall);
  state.rooms=[];state.routeTags=[];state.featureRooms=[];state.f20RewardSpots1020=[];state.f20Chambers1020=[];state.f20Furnaces1020=[];
  state.f20MazeZones1020=[];state.f20WoodWings1020=[];state.f20KeyDepth1020=[];state.f20BossLock1020=null;
  buildBossMazeCommon(20);
  const appended=(state.rooms||[]).filter(r=>r?.append1020),bossHall=appended.at(-1),chambers=appended.slice(0,6);
  const sideY=bands.map((y,i)=>i%2?y-1:y+1),upperY=bands.map(y=>y-5),mirrorX=x=>COLS-1-x;

  // Route contract: the central spine only connects authored stage loops. Keys live deep in side architecture,
  // so the shortest valid route must leave the spine three separate times.
  const startHall=archBox(cx-10,ROWS-11,21,9,floor,wall,true);startHall.name='하부 출입 검문전실';
  archDoor(cx,startHall.y);archLine(cx,startHall.y,cx,bands[0]+4,floor,1,true);
  for(const sx of [cx-6,cx+6]){archLine(cx,bands[0]+4,sx,bands[0]+4,floor,1,true);archLine(sx,bands[0]+4,sx,sideY[0],floor,1,true)}

  // Optional paired timber barracks make the arrival quarter a real occupied complex rather than a single stem.
  const buildBottomBarrackPair=()=>{
    const w=19,h=9,y=ROWS-12,lx=cx-35,rx=COLS-lx-w;
    const carve=(x,flip=false)=>{
      const r=archBox(x,y,w,h,TT.WOOD_FLOOR,wall,true);r.name='하부 판자 경비숙소';
      const vx=flip?r.x+r.w-7:r.x+6;for(let yy=r.y+1;yy<r.y+r.h-1;yy++)if(yy!==r.cy)archSetTile(vx,yy,wall,true);archDoor(vx,r.cy);
      const gx=flip?r.x:r.x+r.w-1;archDoor(gx,r.cy);archLine(gx,r.cy,flip?startHall.x+startHall.w-1:startHall.x,r.cy,TT.WOOD_FLOOR,1,true);
      for(const qx of [r.x+3,r.x+r.w-4])for(const qy of [r.y+2,r.y+r.h-3])if(safeFloorTile1020(state.map[qy]?.[qx]))setTerrainTile58(state.map,qx,qy,(qx+r.cy)%2?TT.CRATE:TT.RACK);
      const jx=flip?r.x+r.w-5:r.x+4,jy=r.y+r.h-3;if(safeFloorTile1020(state.map[jy]?.[jx]))setTerrainTile58(state.map,jx,jy,TT.JAR);
      state.f20WoodWings1020.push({x:r.x,y:r.y,w:r.w,h:r.h,name:r.name});archRouteTag(r.cx,r.cy,r.name);return r
    };
    const left=carve(lx,false),right=carve(rx,true);return[left,right]
  };
  buildBottomBarrackPair();

  const checkpoint=(gateY,lowerY,upperRouteY,label)=>{
    archRect(cx-5,gateY-2,11,5,wall,true);archLine(cx,lowerY,cx,upperRouteY,floor,1,true);
    for(const sx of [cx-6,cx+6])archLine(cx,upperRouteY,sx,upperRouteY,floor,1,true);
    archSetTile(cx,gateY,floor,true);archRouteTag(cx,gateY,label);return{x:cx,y:gateY}
  };
  const gate1=checkpoint(bands[1]+2,upperY[0],sideY[1],'제1 검문소 · 철제 봉쇄');
  const gate2=checkpoint(bands[2]+3,upperY[1],sideY[2],'제2 검문소 · 청옥 봉쇄');

  // The brass seal is the single mouth of the enlarged boss hall.
  const bossGate={x:cx,y:bossHall?bossHall.y+bossHall.h-1:20};
  for(let x=cx-6;x<=cx+6;x++)archSetTile(x,bossGate.y,wall,true);
  for(let y=upperY[2];y>=bossGate.y;y--){archSetTile(cx,y,floor,true);if(y<upperY[2]){archSetTile(cx-1,y,wall,true);archSetTile(cx+1,y,wall,true)}}
  archRouteTag(cx,bossGate.y,'최종 봉쇄문 · 황동 삼중잠금');

  // Expanded paired furnace halls preserve F20's lava language. Their safe catwalk remains the only non-lava
  // straight crossing through each furnace bed.
  const forgeHall=(stage,side)=>{
    const cy=sideY[stage],w=15,h=9,leftX=cx-27,x=side<0?leftX:COLS-leftX-w,y=cy-Math.floor(h/2);
    archRect(x,y,w,h,wall,true);archRect(x+1,y+1,w-2,h-2,TT.LAVA,true);
    archLine(x,cy,x+w-1,cy,TT.DRAWBRIDGE_DOWN,1,true);archSetTile(x,cy,floor,true);archSetTile(x+w-1,cy,floor,true);
    for(const qx of [x+2,x+w-3])for(const qy of [y+1,y+h-2])if(qy!==cy)archSetTile(qx,qy,TT.LAVA,true);
    const r=appendRoomOnce(roomObj(x,y,w,h,`제${stage+1} 대형 용광 압착실`));state.f20Furnaces1020.push({x,y,w,h,cx:r.cx,cy,stage,side});
    archRouteTag(r.cx,cy,`제${stage+1} 대형 용광 압착실`);return r
  };
  for(let stage=0;stage<3;stage++)for(const side of [-1,1])forgeHall(stage,side);

  // Local perfect-maze generator. It owns only the inside of an already-authored chamber; the right chamber is
  // copied as a true mirror, so randomness changes route texture without sacrificing the floor's bilateral identity.
  const mazePair=(left,right,seed,tile,label)=>{
    let n=(seed>>>0)||1;const rnd=()=>{n=(Math.imul(n^(n>>>15),2246822519)+3266489917)>>>0;return n/4294967296};
    archRect(left.x+1,left.y+1,left.w-2,left.h-2,wall,true);
    const xs=[],ys=[];for(let x=left.x+1;x<=left.x+left.w-2;x+=2)xs.push(x);for(let y=left.y+1;y<=left.y+left.h-2;y+=2)ys.push(y);
    const cw=xs.length,ch=ys.length,sy=ys.reduce((bi,v,i)=>Math.abs(v-left.cy)<Math.abs(ys[bi]-left.cy)?i:bi,0),sx=cw-1,vis=Array.from({length:ch},()=>Array(cw).fill(false)),stack=[[sx,sy]];
    const carve=(gx,gy)=>archSetTile(xs[gx],ys[gy],tile,true);vis[sy][sx]=true;carve(sx,sy);
    while(stack.length){
      const [gx,gy]=stack[stack.length-1],dirs=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>gx+dx>=0&&gy+dy>=0&&gx+dx<cw&&gy+dy<ch&&!vis[gy+dy][gx+dx]);
      if(!dirs.length){stack.pop();continue}
      const [dx,dy]=dirs[Math.floor(rnd()*dirs.length)],nx=gx+dx,ny=gy+dy;vis[ny][nx]=true;carve(nx,ny);
      archSetTile(Math.floor((xs[gx]+xs[nx])/2),Math.floor((ys[gy]+ys[ny])/2),tile,true);stack.push([nx,ny]);
    }
    const leftEntry={x:left.x+left.w-1,y:left.cy};archDoor(leftEntry.x,leftEntry.y);archLine(leftEntry.x-1,leftEntry.y,xs[sx],ys[sy],tile,1,true);
    // Copy complete chamber pixels, including its inner maze and door, to the opposite side.
    for(let y=left.y;y<left.y+left.h;y++)for(let x=left.x;x<left.x+left.w;x++){const mx=mirrorX(x);if(inside1020(mx,y))setTerrainTile58(state.map,mx,y,state.map[y][x])}
    const rightEntry={x:mirrorX(leftEntry.x),y:leftEntry.y};
    
    const farL=ReachabilityService.bossRoomFarthest({cx,K1020,HAZ1020},left,leftEntry),farR={x:mirrorX(farL.x),y:farL.y,d:farL.d};
    left.name=label;right.name=label;state.f20MazeZones1020.push({x:left.x,y:left.y,w:left.w,h:left.h,side:'left',stage:label,entry:leftEntry,far:farL},{x:right.x,y:right.y,w:right.w,h:right.h,side:'right',stage:label,entry:rightEntry,far:farR});
    archRouteTag(left.cx,left.cy,label+' · 좌측');archRouteTag(right.cx,right.cy,label+' · 우측');return{left:farL,right:farR}
  };

  const plankPair=(left,right,label)=>{
    archRect(left.x+1,left.y+1,left.w-2,left.h-2,TT.WOOD_FLOOR,true);
    const cuts=[left.x+7,left.x+15].filter(x=>x<left.x+left.w-1),doors=[left.cy-3,left.cy+3];
    cuts.forEach((vx,i)=>{for(let y=left.y+1;y<left.y+left.h-1;y++)if(y!==doors[i])archSetTile(vx,y,wall,true);archDoor(vx,doors[i])});
    const hy=left.cy;for(let x=left.x+1;x<Math.min(left.x+7,left.x+left.w-1);x++)if(x!==left.x+4)archSetTile(x,hy,wall,true);archDoor(left.x+4,hy);
    const entry={x:left.x+left.w-1,y:left.cy};archDoor(entry.x,entry.y);archSetTile(entry.x-1,entry.y,TT.WOOD_FLOOR,true);
    for(let y=left.y;y<left.y+left.h;y++)for(let x=left.x;x<left.x+left.w;x++){const mx=mirrorX(x);if(inside1020(mx,y))setTerrainTile58(state.map,mx,y,state.map[y][x])}
    const farL={x:left.x+2,y:left.y+2},farR={x:mirrorX(farL.x),y:farL.y};archSetTile(farL.x,farL.y,TT.WOOD_FLOOR,true);archSetTile(farR.x,farR.y,TT.WOOD_FLOOR,true);
    left.name=label;right.name=label;state.f20WoodWings1020.push({x:left.x,y:left.y,w:left.w,h:left.h,name:label},{x:right.x,y:right.y,w:right.w,h:right.h,name:label});
    archRouteTag(left.cx,left.cy,label+' · 좌측');archRouteTag(right.cx,right.cy,label+' · 우측');return{left:farL,right:farR}
  };

  const seedA=((globalThis.__MANRU_RANDOM57__()*0xffffffff)>>>0)||0x20a11,seedB=((globalThis.__MANRU_RANDOM57__()*0xffffffff)>>>0)||0x20b22;
  const lowerMaze=mazePair(chambers[0],chambers[1],seedA,TT.WOOD_FLOOR,'하층 판자 적재미로');
  const middleMaze=mazePair(chambers[2],chambers[3],seedB,TT.STONE_PATH,'중층 환기·철망미로');
  const upperPlank=plankPair(chambers[4],chambers[5],'상층 판자 수용동');

  // Record all six main chambers after their real internal topology exists.
  chambers.forEach((r,i)=>{if(r)state.f20Chambers1020.push({x:r.x,y:r.y,w:r.w,h:r.h,cx:r.cx,cy:r.cy,stage:Math.floor(i/2),side:i%2?'right':'left',name:r.name||'감방'})});

  const rewardPlan=[
    {pos:{x:lowerMaze.right.x,y:lowerMaze.right.y},tile:TT.CACHE,label:'하층 반대편 보급 압수함'},
    {pos:{x:middleMaze.left.x,y:middleMaze.left.y},tile:TT.ARMORY,label:'중층 반대편 병기 압수고'},
    {pos:{x:upperPlank.right.x,y:upperPlank.right.y},tile:TT.VAULT,label:'상층 반대편 간수 금고'}
  ];
  for(const q of rewardPlan){const {x,y}=q.pos;setTerrainTile58(state.map,x,y,q.tile);state.f20RewardSpots1020.push({x,y,tile:q.tile,label:q.label});archRouteTag(x,y,q.label)}

  // Furniture is paired and kept off key/door cells; it adds occupation without turning visual props into topology.
  for(const [stage,y] of sideY.entries())for(const side of [-1,1]){
    const x=cx+side*8;if(inside1020(x,y)&&safeFloorTile1020(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.LANTERN_POST);
    const x2=cx+side*9;if(inside1020(x2,y)&&safeFloorTile1020(state.map[y][x2]))setTerrainTile58(state.map,x2,y,TT.STONE_PILLAR);
  }
  if(bossHall){
    for(const x of [bossHall.x+5,bossHall.x+bossHall.w-6])for(const y of [bossHall.y+4,bossHall.y+bossHall.h-5])if(safeFloorTile1020(state.map[y]?.[x]))setTerrainTile58(state.map,x,y,TT.RACK);
    for(const x of [cx-14,cx+14])if(safeFloorTile1020(state.map[bossHall.y+5]?.[x]))setTerrainTile58(state.map,x,bossHall.y+5,TT.BRAZIER);
  }

  // Keys are selected from the deepest actual 8-way reachable cell of their authored side-zone.
  // Manual movement and autowalk both allow diagonals, so using a 4-way metric here would overestimate maze depth.
  const f20Gates=[gate1,gate2,bossGate];
  function keyFloor1020(t){return [TT.FLOOR,TT.STONE_PATH,TT.WOOD_FLOOR,TT.GILDED_FLOOR,TT.CARPET,TT.GRASS,TT.LIGHT_GRASS,TT.KEY_TILE].filter(v=>v!=null).includes(t)}
  ;
  function deepestZoneCell1020(room,openedCount,fallback,keyId,label){
    const dist=ReachabilityService.bossStageDistances({f20Gates,K1020,inside1020,HAZ1020},openedCount),cand=[];for(let y=room.y+1;y<room.y+room.h-1;y++)for(let x=room.x+1;x<room.x+room.w-1;x++){const d=dist.get(K1020(x,y)),t=state.map[y]?.[x];if(d==null||!keyFloor1020(t))continue;cand.push({x,y,d})}
    cand.sort((a,b)=>b.d-a.d||Math.max(Math.abs(b.x-room.cx),Math.abs(b.y-room.cy))-Math.max(Math.abs(a.x-room.cx),Math.abs(a.y-room.cy))||a.y-b.y||a.x-b.x);
    const p=cand[0]||{...fallback,d:dist.get(K1020(fallback.x,fallback.y))??-1};state.f20KeyDepth1020.push({keyId,label,openedCount,zone:{x:room.x,y:room.y,w:room.w,h:room.h,name:room.name||label},x:p.x,y:p.y,distance:p.d,maxDistance:cand[0]?.d??p.d,candidates:cand.length,diagonal:true});return{x:p.x,y:p.y}
  };
  const keySpecs=[
    {keyId:'iron', chamber:0, pos:deepestZoneCell1020(chambers[0],0,lowerMaze.left,'iron','하층 판자 적재미로 · 철제 열쇠'),label:'하층 판자 적재미로 최심부 · 철제 열쇠'},
    {keyId:'jade', chamber:3, pos:deepestZoneCell1020(chambers[3],1,middleMaze.right,'jade','중층 환기미로 · 청옥 열쇠'),label:'중층 환기미로 최심부 · 청옥 열쇠'},
    {keyId:'brass',chamber:4, pos:deepestZoneCell1020(chambers[4],2,upperPlank.left,'brass','상층 판자 수용동 · 황동 열쇠'),label:'상층 판자 수용동 최심부 · 황동 열쇠'}
  ];
  for(const q of keySpecs){archSetTile(q.pos.x,q.pos.y,floor,true);archRouteTag(q.pos.x,q.pos.y,q.label)}

  state.f20BossLock1020={
    kind:'f20-triple-boss-seal',
    gates:[{...gate1,keyId:'iron'},{...gate2,keyId:'jade'},{...bossGate,keyId:'brass'}],
    keys:keySpecs.map(q=>({x:q.pos.x,y:q.pos.y,keyId:q.keyId,label:q.label})),
    keyDepth:state.f20KeyDepth1020.map(q=>structuredClone(q)),
    finalTarget:{x:cx,y:bossGate.y-1},
    finalTargetLabel:'20F 최종 보스실'
  };
  state.routeDesign1005='20F 대확장 삼중 봉쇄성 · 교대 열쇠 수색 / 판자 적재미로 / 환기미로 / 상층 수용동 / 육대 대형 용광로';
  state.layoutName='장고 심부 · 대확장 대칭 삼중봉쇄성 / 하층 판자 적재미로 / 중층 환기철망미로 / 상층 판자 수용동 / 육대 대형 용광 압착실 / 분산 압수보상고 / 대형 후면 보스실';
}
/* F06: a substantial stilt manor around the existing descent, with one front gate, 2-wide hall, side rooms and windows. */
function build6_(){
  const s={...state.stairs},w=31,h=21,cx=clamp1020(s.x,17,COLS-18),cy=clamp1020(s.y,12,ROWS-13),x=cx-Math.floor(w/2),y=cy-Math.floor(h/2);
  const horizontal=Math.abs(state.player.x-cx)>Math.abs(state.player.y-cy),fromLeft=state.player.x<cx,fromTop=state.player.y<cy;
  archRect(x,y,w,h,TT.WALL,true);archRect(x+1,y+1,w-2,h-2,TT.WOOD_FLOOR,true);
  // broad exterior veranda: an uninterrupted circulating ring just inside the outer wall.
  archRing(x+2,y+2,w-4,h-4,TT.WOOD_FLOOR);archRing(x+3,y+3,w-6,h-6,TT.WOOD_FLOOR);
  // inner residential block. Two staggered corridors interlock instead of a single answer hallway.
  archRect(x+5,y+5,w-10,h-10,TT.WALL,true);archRect(x+6,y+6,w-12,h-12,TT.WOOD_FLOOR,true);
  const ix=x+6,iy=y+6,iw=w-12,ih=h-12;
  const vx=[ix+6,ix+13],hy=[iy+4,iy+9];
  for(const xx of vx)for(let yy=iy;yy<iy+ih;yy++)setTerrainTile58(state.map,xx,yy,TT.WALL);
  for(const yy of hy)for(let xx=ix;xx<ix+iw;xx++)setTerrainTile58(state.map,xx,yy,TT.WALL);
  // Doors are deliberately offset, so adjacent rooms connect to each other as well as to the veranda.
  const ds=[[vx[0],iy+2],[vx[0],iy+7],[vx[0],iy+ih-2],[vx[1],iy+1],[vx[1],iy+6],[vx[1],iy+ih-3],
            [ix+3,hy[0]],[ix+10,hy[0]],[ix+iw-3,hy[0]],[ix+1,hy[1]],[ix+8,hy[1]],[ix+iw-5,hy[1]]];
  ds.forEach(([dx,dy])=>archDoor(dx,dy));
  // Four access doors connect the inner rooms to the circulating veranda, creating a true loop around the house.
  archDoor(cx,y+5);archDoor(cx,y+h-6);archDoor(x+5,cy);archDoor(x+w-6,cy);
  archLine(cx,y+3,cx,y+5,TT.WOOD_FLOOR,2,true);archLine(cx,y+h-6,cx,y+h-4,TT.WOOD_FLOOR,2,true);
  // One main exterior gate only, facing the existing approach.
  const gate=horizontal?{x:fromLeft?x:x+w-1,y:cy}:{x:cx,y:fromTop?y:y+h-1};archDoor(gate.x,gate.y);
  const dir=horizontal?{x:fromLeft?-1:1,y:0}:{x:0,y:fromTop?-1:1};let ax=gate.x+dir.x,ay=gate.y+dir.y;
  for(let i=0;i<18&&inside1020(ax,ay);i++,ax+=dir.x,ay+=dir.y){if(i>1&&pass1020(state.map[ay][ax]))break;setTerrainTile58(state.map,ax,ay,TT.WOOD_FLOOR)}
  // Exterior windows are regular; inner rooms remain visually legible from outside.
  for(let xx=x+4;xx<x+w-4;xx+=4){if(xx!==cx)archWindow(xx,y);if(xx!==cx)archWindow(xx,y+h-1)}
  for(let yy=y+4;yy<y+h-4;yy+=4){if(yy!==cy)archWindow(x,yy);if(yy!==cy)archWindow(x+w-1,yy)}
  // Keep the original stair in the deepest interior. Guarded prize sits in the room opposite the main gate.
  setTerrainTile58(state.map,s.x,s.y,TT.STAIR);state.stairs=s;state.fixedExit={...s};
  const tx=horizontal?(fromLeft?x+w-9:x+8):cx,ty=horizontal?cy:(fromTop?y+h-8:y+7);
  state.f6Elite1023={x:clamp1020(tx,ix+1,ix+iw-2),y:clamp1020(ty,iy+1,iy+ih-2)};
  state.f6Prize1023={x:clamp1020(state.f6Elite1023.x+(horizontal?0:2),ix+1,ix+iw-2),y:clamp1020(state.f6Elite1023.y+(horizontal?2:0),iy+1,iy+ih-2)};
  appendRoomOnce(roomObj(x,y,w,h,'수상 관리가옥 · 외부 회랑'));archRouteTag(cx,cy,'수상 관리가옥 · 순환 외부복도 / 얽힌 측실군 / 경비 보물실');
  state.layoutName=(state.layoutName||'수목원')+' · 대형 수상관리관 / 순환 외부회랑 / 얽힌 생활실';
}
function chooseOpenSites(w,h){
  const forbid=new Set();for(const p of walkPath())for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)forbid.add(K1020(p.x+dx,p.y+dy));
  const sites=[];for(let y=3;y<=ROWS-h-3;y+=2)for(let x=3;x<=COLS-w-3;x+=2){let open=0,bad=0,pathHit=0;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const t=state.map[yy][xx];if(forbid.has(K1020(xx,yy)))pathHit++;if(safeFloorTile1020(t))open++;else if(HAZ1020().has(t)||PROTECTED().has(t))bad+=4;else bad++}const d=Math.min(Math.abs(x+w/2-state.player.x)+Math.abs(y+h/2-state.player.y),Math.abs(x+w/2-state.stairs.x)+Math.abs(y+h/2-state.stairs.y));const score=open*1.2-bad*2.8-pathHit*80+d*.08;sites.push({x,y,score,pathHit})}return sites.sort((a,b)=>(a.pathHit-b.pathHit)||(b.score-a.score))}
function build8_(){
  const w=23,h=17,baseMap=cloneTerrainMap58(state.map),baseRooms=[...(state.rooms||[])],baseTags=[...(state.routeTags||[])];const sites=chooseOpenSites(w,h).slice(0,40);
  for(const site of sites){state.map=cloneTerrainMap58(baseMap);state.rooms=[...baseRooms];state.routeTags=[...baseTags];const x=site.x,y=site.y,cx=x+Math.floor(w/2),gateY=y+h-1;
    archRect(x,y,w,h,TT.WALL,true);archRect(x+1,y+1,w-2,h-2,TT.WOOD_FLOOR,true);archDoor(cx,gateY);archRect(cx-1,y+1,2,h-2,TT.WOOD_FLOOR,true);
    const cuts=[y+5,y+10];for(const yy of cuts)for(let xx=x+1;xx<x+w-1;xx++)setTerrainTile58(state.map,xx,yy,TT.WALL);for(const yy of cuts){archDoor(cx-1,yy);archDoor(cx,yy)}
    for(const yy of [y+3,y+7,y+13]){archDoor(cx-2,yy);archDoor(cx+1,yy)}for(let yy=y+1;yy<y+h-1;yy++){if([y+3,y+7,y+13].includes(yy))continue;setTerrainTile58(state.map,cx-2,yy,TT.WALL);setTerrainTile58(state.map,cx+1,yy,TT.WALL)}
    for(let xx=x+3;xx<x+w-3;xx+=4)archWindow(xx,y);for(const yy of [y+3,y+8,y+13]){archWindow(x,yy);archWindow(x+w-1,yy)}archRect(cx-1,gateY+1,2,3,TT.WOOD_FLOOR,true);appendRoomOnce(roomObj(x,y,w,h,'대나무숲 객실형 오두막'));archRouteTag(cx,y+8,'객실형 오두막 · 2폭 복도 / 6측실');
    if(reach1020(state.stairs,{unlock:true})){state.layoutName=(state.layoutName||'대나무 미로')+' · 객실형 장옥 추가';return}
  }
  state.map=baseMap;state.rooms=baseRooms;state.routeTags=baseTags;state.layoutName=(state.layoutName||'대나무 미로')+' · 장옥 후보 보류(주동선 보존)';
}
/* F11: original v10.0.4 already has a validated mandatory raft crossing. Preserve it and remove any late-added land bypass if it appears. */
function build11_(){
  const snap=cloneTerrainMap58(state.map),styles=state.floorStyle980||{},rafts=state.rafts||[];
  const protected11=(x,y)=>{if(Math.abs(x-state.player.x)+Math.abs(y-state.player.y)<=7)return true;if(Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)<=7)return true;const st=String(styles[K1020(x,y)]||'');if(/f11_(dock|blinkpost|cliff_marker)/.test(st))return true;if(state.map[y]?.[x]===TT.RAFT)return true;for(const r of rafts)if(Math.abs(x-r.x)<=4&&(Math.abs(y-(r.min-1))<=3||Math.abs(y-(r.max+1))<=3))return true;return false};
  const flood=[];
  for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++){const t=state.map[y][x];if(!safeFloorTile1020(t)||protected11(x,y))continue;const bottom=y>=ROWS-13,side=(x<=8||x>=COLS-9)&&y>8&&y<ROWS-8;let nw=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(state.map[y+dy]?.[x+dx]===TT.WATER)nw++;if(bottom||side||nw>=5)flood.push({x,y})}
  for(const p of flood)setTerrainTile58(state.map,p.x,p.y,TT.WATER);
  // The old bottom shelf visually read as a deliberate bypass even when disconnected. Remove it almost entirely.
  for(let yy=ROWS-9;yy<ROWS-2;yy++)for(let xx=12;xx<COLS-12;xx++){const t=state.map[yy][xx];if(tileBlocks(t)||HAZ1020().has(t)||PROTECTED().has(t))continue;if((state.rafts||[]).some(r=>Math.abs(xx-r.x)<=3&&Math.abs(yy-r.y)<=4))continue;setTerrainTile58(state.map,xx,yy,TT.WATER)}
  // Explicitly destroy every remaining pure-walk solution one cell at a time, choosing cells far from docks/endpoints.
  for(let cut=0;cut<40;cut++){const pth=walkPath();if(!pth.length)break;const cands=pth.slice(5,-5).filter(p=>!protected11(p.x,p.y)&&safeFloorTile1020(state.map[p.y][p.x]));if(!cands.length)break;cands.sort((a,b)=>Math.abs(a.y-ROWS/2)-Math.abs(b.y-ROWS/2));setTerrainTile58(state.map,cands[0].x,cands[0].y,TT.WATER)}
  let a=raftAudit981();
  if(!(a&&a.valid&&!a.pureWalk&&a.pureRaft&&a.exitWithRaft))state.map=snap;
  else state.layoutName=(state.layoutName||'향수강')+' · 육상 샛길 완전수몰 / 필수 뗏목 도하 / 희소 점멸 비상석';
}
/* F16: preserve field + lava moat + castle shell, subdivide the interior into actual living/service quarters and streets. */
function build16_(){
  const x0=Math.round(COLS*.43),x1=COLS-4,y0=4,y1=ROWS-4,cx=Math.floor((x0+x1)/2),w=x1-x0;
  // Close the previously open south edge and make the keep a real bounded structure. Protected bridge/switch tiles are untouched.
  for(let x=x0;x<=x1;x++){if(!PROTECTED().has(state.map[y0]?.[x]))setTerrainTile58(state.map,x,y0,TT.WALL);if(!PROTECTED().has(state.map[y1]?.[x]))setTerrainTile58(state.map,x,y1,TT.WALL)}
  for(let y=y0;y<=y1;y++){if(!PROTECTED().has(state.map[y]?.[x0]))setTerrainTile58(state.map,x0,y,TT.WALL);if(!PROTECTED().has(state.map[y]?.[x1]))setTerrainTile58(state.map,x1,y,TT.WALL)}
  // Re-open exactly one inner gate aligned to the real drawbridge; closing the southern shell must never sever the cipher bridge.
  const br=[];for(let yy=1;yy<ROWS-1;yy++)for(let xx=1;xx<COLS-1;xx++)if(state.map[yy][xx]===TT.DRAWBRIDGE_UP||state.map[yy][xx]===TT.DRAWBRIDGE_DOWN)br.push({x:xx,y:yy});
  const bridgeY=br.length?Math.round(br.reduce((a,b)=>a+b.y,0)/br.length):Math.round(ROWS*.50);archRect(x0-1,bridgeY-1,4,3,TT.STONE_PATH,true);
  const bands=[Math.round(ROWS*.29),Math.round(ROWS*.49),Math.round(ROWS*.69)],gates=[cx-12,cx+11,cx-5];
  bands.forEach((yy,i)=>{wallBand(x0+1,x1-1,yy,[[gates[i]-1,gates[i]+1]]);archRect(gates[i]-1,yy-1,3,3,TT.STONE_PATH,true)});
  archLine(x0+1,bridgeY,gates[0],bridgeY,TT.STONE_PATH,2,true);archLine(gates[0],bridgeY,gates[0],bands[0]-1,TT.STONE_PATH,2,true);
  // Alternating longitudinal walls make each ward turn before the next gate rather than exposing the whole keep.
  const vwalls=[cx-18,cx+18,cx-8,cx+8];for(let i=0;i<vwalls.length;i++){const xx=vwalls[i],ya=i<2?y0+2:bands[0]+1,yb=i<2?bands[1]-1:y1-2;for(let y=ya;y<=yb;y++)if(!PROTECTED().has(state.map[y]?.[xx]))setTerrainTile58(state.map,xx,y,TT.WALL);for(const yy of [Math.round((ya+yb)*.36),Math.round((ya+yb)*.72)])if(inside1020(xx,yy))archDoor(xx,yy)}
  // Functional rooms line the wards; doors face the internal streets, windows face courtyards.
  const specs=[[x0+3,y0+3,13,9,'외성 경비막사'],[cx+3,y0+3,14,9,'장교 숙소'],[x0+4,bands[0]+3,12,8,'취사장'],[cx+4,bands[0]+3,14,8,'무기고'],[x0+3,bands[1]+3,14,9,'병사 숙소'],[cx+3,bands[1]+3,13,9,'의무실'],[x0+4,bands[2]+3,12,8,'세탁·창고'],[cx+4,bands[2]+3,14,8,'후방 보급실']];
  for(const [x,y,w,h,n] of specs){if(x+w>=x1||y+h>=y1)continue;const r=archBox(x,y,w,h,TT.FLOOR,TT.WALL,true);const side=r.cx<cx?r.x+r.w-1:r.x;archDoor(side,r.cy);for(let xx=r.x+3;xx<r.x+r.w-3;xx+=4)archWindow(xx,r.y);if(/취사|창고|보급/.test(n)){const jx=r.cx<cx?r.x+2:r.x+r.w-3,jy=r.y+r.h-3;if(safeFloorTile1020(state.map[jy]?.[jx]))setTerrainTile58(state.map,jx,jy,TT.JAR)}archRouteTag(r.cx,r.cy,n)}
  // Grouped courtyard fixtures.
  for(const yy of [bands[0]-5,bands[1]-5,bands[2]-5])for(const dx of [-5,5])if(inside1020(cx+dx,yy)&&safeFloorTile1020(state.map[yy][cx+dx]))setTerrainTile58(state.map,cx+dx,yy,dx<0?TT.BENCH:TT.RACK);
  // Safety only: if the real stair is not reachable with the bridge considered open, connect it through the nearest ward, never through the outer field.
  if(!reach1020(state.stairs,{unlock:true})){const r=reachableSet1020({unlock:true}),cand=[];for(const kk of r){const[x,y]=kk.split(',').map(Number);if(x<=x0||x>=x1)continue;cand.push({x,y,d:Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)})}cand.sort((a,b)=>a.d-b.d);if(cand[0]){archLine(cand[0].x,cand[0].y,state.stairs.x,cand[0].y,TT.STONE_PATH,2,true);archLine(state.stairs.x,cand[0].y,state.stairs.x,state.stairs.y,TT.STONE_PATH,2,true);setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.STAIR)}}
  state.layoutName=(state.layoutName||'회색돌 성채')+' · 폐쇄 성곽 / 삼중 생활구획 / 교대 관문 / 병영·무기고·의무실';
}
/* F18: warehouse density via ordered storage bays and inspection corridors, preserving the existing lock plan after reinstallation. */
function build18_(){
  const x0=5,x1=COLS-6,y1=ROWS-6,cx=Math.floor(COLS/2);for(const yy of [Math.round(ROWS*.31),Math.round(ROWS*.57),Math.round(ROWS*.78)])archRect(x0,yy-1,x1-x0,2,TT.STONE_PATH,true);
  const cols=[8,27,50,70],rows=[8,Math.round(ROWS*.36),Math.round(ROWS*.62)];let idx=0;
  for(const y of rows)for(const x of cols){const w=(idx%3===0)?14:12,h=(idx%2===0)?9:8;if(x+w>=COLS-3||y+h>=ROWS-3){idx++;continue}const r=archBox(x,y,w,h,idx%4===0?TT.WOOD_FLOOR:TT.FLOOR,TT.WALL,true);const toCenter=r.cx<cx?r.x+r.w-1:r.x;archDoor(toCenter,r.cy);archLine(toCenter,r.cy,cx,r.cy,TT.STONE_PATH,2,true);if(idx%3===0){setTerrainTile58(state.map,r.cx,r.cy,TT.RACK);setTerrainTile58(state.map,r.cx+1,r.cy,TT.CRATE)}if(idx%3===1){const jx=r.cx<cx?r.x+2:r.x+r.w-3,jy=r.y+2;if(safeFloorTile1020(state.map[jy]?.[jx]))setTerrainTile58(state.map,jx,jy,TT.JAR)}archRouteTag(r.cx,r.cy,`분류 보관동 ${++idx}`)}
  // The lock belongs to the final map subdivision, not to a later item pass: make a single real vestibule around the original stair.
  const st={...state.stairs},gx=clamp1020(st.x,4,COLS-5),gy=clamp1020(st.y,4,ROWS-5),pc=state.player;
  archRect(gx-3,gy-3,7,7,TT.WALL,true);archRect(gx-2,gy-2,5,5,TT.STONE_PATH,true);setTerrainTile58(state.map,gx,gy,TT.STAIR);state.stairs={x:gx,y:gy};state.fixedExit={x:gx,y:gy};
  const dx=Math.abs(gx-pc.x)>Math.abs(gy-pc.y)?Math.sign(pc.x-gx):0,dy=dx?0:Math.sign(pc.y-gy),gate={x:gx+dx*3,y:gy+dy*3};
  // Join the vestibule to the nearest existing route without opening a second side.
  let ax=gate.x+dx,ay=gate.y+dy;for(let n=0;n<20&&inside1020(ax,ay);n++,ax+=dx,ay+=dy){if(n>1&&pass1020(state.map[ay][ax]))break;setTerrainTile58(state.map,ax,ay,TT.STONE_PATH)}
  state.ironGate18_1020=gate;state.layoutName=(state.layoutName||'철판 창고')+' · 검수회랑 / 분류 보관동 / 적재 베이 / 후면 철제 검문전실';
}
function installCustomKeyPlan(keyId,keyPos,gatePos,kind='staged-gate'){
  clearOldKeyTiles();setTerrainTile58(state.map,keyPos.x,keyPos.y,TT.KEY_TILE);setTerrainTile58(state.map,gatePos.x,gatePos.y,TT.LOCKED_GATE);
  const d={x:gatePos.x,y:gatePos.y,keyId,group:0,open:false,staged:true},q={x:keyPos.x,y:keyPos.y,keyId,active:true};
  state.keyPlan96={doors:[d],keys:[q],ring:{},groups:[{keyId,doors:[d]}],kind};return state.keyPlan96;
}
function installFloor20BossKeys(){
  const spec=state.floor===20?state.f20BossLock1020:null;if(!spec?.gates?.length||!spec?.keys?.length)return null;
  const same=state.keyPlan96?.kind===spec.kind&&spec.gates.every(g=>(state.keyPlan96.doors||[]).some(d=>d.x===g.x&&d.y===g.y&&d.keyId===g.keyId))&&spec.keys.every(k0=>(state.keyPlan96.keys||[]).some(q=>q.x===k0.x&&q.y===k0.y&&q.keyId===k0.keyId));
  if(same){globalThis.__MANRU_TYPED_KEYS__?.restoreSurfaces?.();return state.keyPlan96}
  clearOldKeyTiles();
  const doors=spec.gates.map((g,i)=>({x:g.x,y:g.y,keyId:g.keyId,group:i,open:false,staged:true,f20BossSeal1020:true}));
  const keys=spec.keys.map(q=>({x:q.x,y:q.y,keyId:q.keyId,active:true,floorTile49:TT.STONE_PATH,f20BossSeal1020:true}));
  const groups=doors.map((d,i)=>({keyId:d.keyId,doors:[d],stage:i}));
  state.keyPlan96={doors,keys,ring:{iron:0,jade:0,brass:0},groups,kind:spec.kind,finalTarget:{...spec.finalTarget},finalTargetLabel:spec.finalTargetLabel};
  for(const q of keys)setTerrainTile58(state.map,q.x,q.y,TT.KEY_TILE);for(const d of doors)setTerrainTile58(state.map,d.x,d.y,TT.LOCKED_GATE);
  globalThis.__MANRU_TYPED_KEYS__?.hydrate?.();return state.keyPlan96
}
function farthestReachableKeyCell(reach,filter=()=>true,origin=state.player){
  let out=null,best=-1;for(const kk of reach){const [x,y]=kk.split(',').map(Number);if(!inside1020(x,y)||!safeFloorTile1020(state.map[y][x])||!filter({x,y}))continue;const d=Math.abs(x-origin.x)+Math.abs(y-origin.y);if(d>best){best=d;out={x,y}}}return out;
}
/* F22: height x2. Upper half keeps the old golden temple DNA; lower half is a seeded mirrored labyrinth. One middle convergence throat. */
function build22_(){
  clearOldKeyTiles();const oldR=ROWS,targetH=Math.max(119,oldR*2-1),cx=Math.floor(COLS/2);ROWS=targetH;
  state.map=Array.from({length:ROWS},()=>Array(COLS).fill(TT.WALL));state.rooms=[];state.f22HolyCells1023=[];state.archDecor1023=state.archDecor1023||{};
  const G=TT.GILDED_FLOOR,S=TT.MOON_STONE,W=TT.WATER,WOOD=TT.WOOD_FLOOR,mid=Math.floor((ROWS-1)/2),bot=ROWS-6;

  // r44: the pilgrimage is owned by one guaranteed three-tile-wide serpentine spine.  Chambers are built first;
  // the spine is carved LAST through them, so later room walls can never sever the mandatory route.
  const route=[
    {x:cx,y:bot},{x:18,y:bot},{x:18,y:bot-10},{x:76,y:bot-10},{x:76,y:bot-21},
    {x:22,y:bot-21},{x:22,y:bot-32},{x:72,y:bot-32},{x:72,y:bot-43},{x:cx,y:bot-43},
    {x:30,y:bot-43},{x:30,y:mid+5},{x:66,y:mid+5},{x:66,y:mid-6},{x:28,y:mid-6},
    {x:28,y:mid-17},{x:cx,y:mid-17},{x:cx,y:42},{x:22,y:42},{x:22,y:34},
    {x:72,y:34},{x:72,y:26},{x:26,y:26},{x:26,y:18},{x:68,y:18},{x:68,y:10},
    {x:cx,y:10},{x:cx,y:3}
  ];
  const matForY=y=>y>mid+14?S:(y<mid-14?G:(y<mid?WOOD:S));
  const carveSeg=(a,b)=>{const t=matForY(Math.floor((a.y+b.y)/2));if(a.y===b.y)archRect(Math.min(a.x,b.x),a.y-1,Math.abs(a.x-b.x)+1,3,t,true);else if(a.x===b.x)archRect(a.x-1,Math.min(a.y,b.y),3,Math.abs(a.y-b.y)+1,t,true);else{archRect(Math.min(a.x,b.x),a.y-1,Math.abs(a.x-b.x)+1,3,t,true);archRect(b.x-1,Math.min(a.y,b.y),3,Math.abs(a.y-b.y)+1,t,true)}};

  // South gate / lower water cloisters.  Each arena lies on a different leg of the switchback.
  archBox(cx-7,bot-3,15,7,S,TT.WALL,true);archRouteTag(cx,bot,'수로원 남문');
  const lowerRooms=[
    archBox(10,bot-14,17,9,S,TT.WALL,true),archBox(67,bot-25,18,9,S,TT.WALL,true),
    archBox(13,bot-36,18,9,S,TT.WALL,true),archBox(63,bot-47,18,9,S,TT.WALL,true)
  ];
  lowerRooms.forEach((r,i)=>{
    archRect(r.x+4,r.y+2,r.w-8,r.h-4,W,true);archRect(r.cx-2,r.y+2,5,r.h-4,S,true);
    for(const ox of [-5,5])if(inside1020(r.cx+ox,r.cy));
    archRouteTag(r.cx,r.cy,['침수 수문청','월광 수로회랑','은빛 배수정','수로원 회귀청'][i]);
  });
  // Optional holy side cells are dead-end rewards, not route shortcuts.
  const holyA=archBox(3,bot-29,11,7,S,TT.WALL,true),holyB=archBox(COLS-14,bot-51,11,7,S,TT.WALL,true);
  state.f22HolyCells1023.push({x:holyA.cx,y:holyA.cy},{x:holyB.cx,y:holyB.cy});
  archLine(holyA.x+holyA.w-1,holyA.cy,22,holyA.cy,S,2,true);archDoor(holyA.x+holyA.w-1,holyA.cy);
  archLine(holyB.x,holyB.cy,72,holyB.cy,S,2,true);archDoor(holyB.x,holyB.cy);
  for(const r of [holyA,holyB]){archDecor(r.cx,r.y+1,'holyIcon1023');;;archRouteTag(r.cx,r.cy,'은빛 종교실 · 성부 봉안')}

  // Central three-stage ceremonial sequence.  The route changes flank between every hall.
  const central=[
    archBox(24,mid+1,22,9,S,TT.WALL,true),
    archBox(55,mid-10,22,9,WOOD,TT.WALL,true),
    archBox(20,mid-21,24,9,S,TT.WALL,true)
  ];
  central.forEach((r,i)=>{
    archRect(r.x+3,r.cy-1,r.w-6,3,W,true);archRect(r.cx-2,r.cy-1,5,3,i===1?WOOD:S,true);
    for(const ox of [-7,7])if(inside1020(r.cx+ox,r.cy-3))setTerrainTile58(state.map,r.cx+ox,r.cy-3,TT.STATUE);
    archRouteTag(r.cx,r.cy,['하부 은빛 접견전','중앙 수문 의장실','상부 회귀 제전'][i]);
  });
  const holyC=archBox(COLS-15,mid-20,12,7,S,TT.WALL,true);archDoor(holyC.x,holyC.cy);archLine(holyC.x,holyC.cy,cx,holyC.cy,S,2,true);state.f22HolyCells1023.push({x:holyC.cx,y:holyC.cy});archDecor(holyC.cx,holyC.y+1,'holyIcon1023');archRouteTag(holyC.cx,holyC.cy,'은빛 종교실 · 성부 봉안');

  // Upper golden pilgrimage.  Four broad halls alternate sides; small treasury alcoves branch outward only.
  const upperRooms=[
    archBox(13,37,20,9,G,TT.WALL,true),archBox(62,29,20,9,TT.CARPET,TT.WALL,true),
    archBox(17,21,20,9,G,TT.WALL,true),archBox(58,13,20,9,TT.CARPET,TT.WALL,true)
  ];
  upperRooms.forEach((r,i)=>{;for(const ox of [-6,6])if(inside1020(r.cx+ox,r.cy-2));archRouteTag(r.cx,r.cy,`금빛 순례궁 ${i+1}`)});
  for(const p of [{x:22,y:34},{x:72,y:26},{x:26,y:18}]){;archRouteTag(p.x,p.y,'금빛 공양벽감')}
  archBox(cx-8,1,17,9,G,TT.WALL,true);archRouteTag(cx,4,'만루의 심장 · 최종 신궁');

  // Mandatory spine LAST.  This owns connectivity and also cuts walkable bridges through lower water rooms.
  for(let i=0;i<route.length-1;i++)carveSeg(route[i],route[i+1]);
  // Re-emphasise several water crossings without covering the carved three-wide bridge.
  for(const [x0,y0,w,h] of [[35,bot-12,25,5],[35,bot-34,25,5],[36,mid+1,23,5]]){
    for(let yy=y0;yy<y0+h;yy++)for(let xx=x0;xx<x0+w;xx++)if(inside1020(xx,yy)&&Math.abs(xx-cx)>3&&state.map[yy][xx]===TT.WALL)setTerrainTile58(state.map,xx,yy,W);
  }
  // Distinct bend markers make the long route readable instead of visually monotonous.
  route.slice(1,-1).forEach((p,i)=>{if(i%3===0){;archRouteTag(p.x,p.y,i<9?'수로 순례 전환점':(i<17?'은빛 의장 전환점':'금빛 회귀 전환점'))}});

  archMovePlayer(route[0].x,route[0].y);moveStair(route.at(-1).x,route.at(-1).y);setTerrainTile58(state.map,state.stairs.x,state.stairs.y,TT.STAIR);
  clearOldKeyTiles();state.keyPlan96=null;state.midGate22_1020=null;state.midKey22_1020=null;state.goldIndoor1020=true;
  state.floor22RouteR44={points:route.map(p=>({...p})),nominalLength:route.slice(1).reduce((n,p,i)=>n+Math.abs(p.x-route[i].x)+Math.abs(p.y-route[i].y),0),width:3};
  state.layoutName='만루의 심장 · 대회귀 수로순례 / 삼중 은빛 의장로 / 사궁 금빛 회귀미궁 / 최종 신궁';
}
/* F23: keep the mercury/bridge network, enlarge selected existing stone nodes into major islands and add gold-floored buildings. */
function build23_(){
  const centers=[];for(let y=6;y<ROWS-6;y+=10)for(let x=8;x<COLS-8;x+=12){let score=0;for(let yy=y-3;yy<=y+3;yy++)for(let xx=x-4;xx<=x+4;xx++){const t=state.map[yy]?.[xx];if(t===TT.MOON_STONE||t===TT.STONE_PATH||t===TT.WOOD_FLOOR||t===TT.DRAWBRIDGE_DOWN)score++}if(score>=5)centers.push({x,y,score})}centers.sort((a,b)=>b.score-a.score);const chosen=[];for(const p of centers){if(chosen.every(q=>Math.abs(q.x-p.x)+Math.abs(q.y-p.y)>18))chosen.push(p);if(chosen.length>=6)break}
  for(const [i,p] of chosen.entries()){
    const iw=i%2?15:13,ih=i%3?11:9,x=clamp1020(p.x-Math.floor(iw/2),2,COLS-iw-2),y=clamp1020(p.y-Math.floor(ih/2),2,ROWS-ih-2);
    archRect(x,y,iw,ih,TT.MOON_STONE,true);const bw=iw-4,bh=ih-4,bx=x+2,by=y+2;archBox(bx,by,bw,bh,TT.GILDED_FLOOR,TT.WALL,true);const side=i%4,dx=side===0?-1:side===1?1:0,dy=side===2?-1:side===3?1:0;let gx=side===0?bx:side===1?bx+bw-1:bx+Math.floor(bw/2),gy=side===2?by:side===3?by+bh-1:by+Math.floor(bh/2);archDoor(gx,gy);
    // short bridge from the new island edge until it meets existing passable network
    let sx=gx+dx,sy=gy+dy;for(let n=0;n<8&&inside1020(sx,sy);n++,sx+=dx,sy+=dy){if(pass1020(state.map[sy][sx]))break;setTerrainTile58(state.map,sx,sy,TT.WOOD_FLOOR)}
    for(let xx=bx+2;xx<bx+bw-2;xx+=3){if(by>1)archWindow(xx,by);if(by+bh-1<ROWS-1)archWindow(xx,by+bh-1)}archRouteTag(p.x,p.y,`수은섬 금빛 객전 ${i+1}`)
  }
  state.goldIndoor1020=true;state.layoutName=(state.layoutName||'수은 연못')+' · 대형 건물섬 / 금빛 실내 객전';
}
/* F24: append one genuinely large building. Deepest chamber holds the brass key; an outdoor gate guards the stair. */
function installCustomBrassPlan24_(keyPos,gatePos){
  // Generation installs the plan once. Load/final-repair must preserve an already collected key or opened gate.
  const plan=state?.keyPlan96,brassKey=plan?.keys?.find(q=>q.keyId==='brass'&&q.x===keyPos.x&&q.y===keyPos.y),brassDoor=plan?.doors?.find(d=>d.keyId==='brass'&&d.x===gatePos.x&&d.y===gatePos.y),same=plan?.kind==='exit-vestibule'&&brassKey&&brassDoor;
  if(!same)return installCustomKeyPlan('brass',keyPos,gatePos,'exit-vestibule');
  plan.ring=plan.ring&&typeof plan.ring==='object'?plan.ring:{};plan.ring.brass=Math.max(0,+plan.ring.brass||0);
  for(const q of plan.keys||[])if(q.keyId==='brass'){if(q.active===false){if(state.map?.[q.y]?.[q.x]===TT.KEY_TILE)setTerrainTile58(state.map,q.x,q.y,TT.FLOOR)}else setTerrainTile58(state.map,q.x,q.y,TT.KEY_TILE)}
  for(const d of plan.doors||[])if(d.keyId==='brass')setTerrainTile58(state.map,d.x,d.y,d.open===true?TT.OPEN_DOOR:TT.LOCKED_GATE);
  for(const g of plan.groups||[])if(g.keyId==='brass')for(const d of g.doors||[]){const hit=(plan.doors||[]).find(q=>q.x===d.x&&q.y===d.y&&q.keyId==='brass');d.open=hit?.open===true}
  return plan;
}
function build24_(){
  const cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2),w=33,h=23,x=cx-Math.floor(w/2),y=cy-Math.floor(h/2);archRect(x,y,w,h,TT.WALL,true);archRect(x+1,y+1,w-2,h-2,TT.GILDED_FLOOR,true);archRect(cx-1,y+1,2,h-2,TT.GILDED_FLOOR,true);
  for(const yy of [y+6,y+12,y+17]){for(let xx=x+1;xx<x+w-1;xx++)setTerrainTile58(state.map,xx,yy,TT.WALL);archDoor(cx-1,yy);archDoor(cx,yy);for(const dx of [-10,10])archDoor(cx+dx,yy)}for(const xx of [x+8,x+16,x+24]){for(let yy=y+1;yy<y+h-1;yy++)if(Math.abs(xx-cx)>2)setTerrainTile58(state.map,xx,yy,TT.WALL);for(const yy of [y+3,y+9,y+15,y+20])if(inside1020(xx,yy))archDoor(xx,yy)}
  // choose the outer entrance facing the player and extend a neutral stone approach until it meets the original outdoor network.
  const dxp=state.player.x-cx,dyp=state.player.y-cy;let gate,dir;if(Math.abs(dxp)>Math.abs(dyp)){if(dxp<0){gate={x,y:cy};dir={x:-1,y:0}}else{gate={x:x+w-1,y:cy};dir={x:1,y:0}}}else{if(dyp<0){gate={x:cx,y};dir={x:0,y:-1}}else{gate={x:cx,y:y+h-1};dir={x:0,y:1}}}archDoor(gate.x,gate.y);let ax=gate.x+dir.x,ay=gate.y+dir.y;for(let n=0;n<24&&inside1020(ax,ay);n++,ax+=dir.x,ay+=dir.y){const old=state.map[ay][ax];if(n>2&&safeFloorTile1020(old))break;setTerrainTile58(state.map,ax,ay,TT.STONE_PATH)}
  for(let xx=x+3;xx<x+w-3;xx+=4){if(!(gate.y===y&&xx===gate.x))archWindow(xx,y);if(!(gate.y===y+h-1&&xx===gate.x))archWindow(xx,y+h-1)}
  // deepest reachable room is opposite the entrance. Because the hall is connected, this is deliberately reachable before the stair gate.
  const keyPos={x:cx-dir.x*0,y:cy-dir.y*0};let kp={x:cx,y:cy};const cells=reachableSet1020({unlock:true});let best=-1;for(const kk of cells){const [xx,yy]=kk.split(',').map(Number);if(xx<=x+1||xx>=x+w-2||yy<=y+1||yy>=y+h-2||!safeFloorTile1020(state.map[yy][xx]))continue;const dist=Math.abs(xx-gate.x)+Math.abs(yy-gate.y);if(dist>best){best=dist;kp={x:xx,y:yy}}}
  const s=state.stairs,gx=clamp1020(s.x,3,COLS-4),gy=clamp1020(s.y,3,ROWS-4);archRect(gx-3,gy-3,7,7,TT.WALL,true);archRect(gx-2,gy-2,5,5,TT.STONE_PATH,true);setTerrainTile58(state.map,gx,gy,TT.STAIR);state.stairs={x:gx,y:gy};
  // one approach gate on the stair vestibule, facing the map center.
  const ddx=Math.abs(gx-cx)>Math.abs(gy-cy)?Math.sign(cx-gx):0,ddy=ddx?0:Math.sign(cy-gy),gatePos={x:gx+ddx*3,y:gy+ddy*3};archLine(gatePos.x+ddx,gatePos.y+ddy,cx,cy,TT.STONE_PATH,1,false);installCustomBrassPlan24_(kp,gatePos);
  state.goldIndoor1020=true;state.deepKey24_1020=kp;state.outdoorGate24_1020=gatePos;state.layoutName=(state.layoutName||'만루보주의 정원')+' · 대형 금빛 원관 / 최심부 황동열쇠 / 야외 계단문';archRouteTag(kp.x,kp.y,'대형 원관 최심부 · 황동열쇠');
}
function archRing(x,y,w,h,t=TT.WOOD_FLOOR){
  for(let xx=x;xx<x+w;xx++){archSetTile(xx,y,t,true);archSetTile(xx,y+h-1,t,true)}
  for(let yy=y;yy<y+h;yy++){archSetTile(x,yy,t,true);archSetTile(x+w-1,yy,t,true)}
}
function wallBand(x0,x1,y,gaps=[]){for(let x=x0;x<=x1;x++){if(gaps.some(g=>x>=g[0]&&x<=g[1]))continue;if(!PROTECTED().has(state.map[y]?.[x]))setTerrainTile58(state.map,x,y,TT.WALL)}}
function buildArchitecture(){const fn={4:build4_,5:build5_,6:build6_,8:build8_,11:build11_,15:build15_,16:build16_,18:build18_,20:build20_,22:build22_,23:build23_,24:build24_}[state.floor];if(fn)fn()}
function installNestedFallback(count=2){
  clearOldKeyTiles();const st={...state.stairs},maxR=Math.min(st.x-2,COLS-3-st.x,st.y-2,ROWS-3-st.y);if(maxR<4)return null;
  // Snapshot the real outside component before the fallback vestibule is built. The outer gate is then aimed at
  // that component, so the fallback cannot create a pretty but sealed ring around the stair.
  const outside0=reachableSet1020({start:state.player,unlock:true,openBoss:true}),ids=count>=2?['iron','jade']:['iron'],radii=count>=2?[4,2]:[3],outer=radii[0];
  const dirs=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}],options=[];
  for(const d of dirs){const gate={x:st.x+d.x*outer,y:st.y+d.y*outer},out={x:gate.x+d.x,y:gate.y+d.y};let target=null,bd=1e9;for(const kk of outside0){const [x,y]=kk.split(',').map(Number);if(Math.max(Math.abs(x-st.x),Math.abs(y-st.y))<=outer)continue;if(d.x>0&&x<=gate.x)continue;if(d.x<0&&x>=gate.x)continue;if(d.y>0&&y<=gate.y)continue;if(d.y<0&&y>=gate.y)continue;const dd=Math.abs(x-out.x)+Math.abs(y-out.y);if(dd<bd){bd=dd;target={x,y}}}if(target)options.push({d,gate,out,target,bd})}
  options.sort((a,b)=>a.bd-b.bd);const pick=options[0]||{d:{x:Math.sign(state.player.x-st.x)||0,y:0},target:{x:state.player.x,y:state.player.y}};if(!pick.d.x&&!pick.d.y)pick.d={x:0,y:Math.sign(state.player.y-st.y)||-1};const dx=pick.d.x,dy=pick.d.y;
  for(let yy=st.y-outer;yy<=st.y+outer;yy++)for(let xx=st.x-outer;xx<=st.x+outer;xx++)if(inside1020(xx,yy)&&!(xx===st.x&&yy===st.y))setTerrainTile58(state.map,xx,yy,TT.FLOOR);
  const plan={doors:[],keys:[],ring:{},groups:[],kind:'append-nested-fallback'};
  for(let i=0;i<radii.length;i++){
    const r=radii[i],id=ids[i];for(let yy=st.y-r;yy<=st.y+r;yy++)for(let xx=st.x-r;xx<=st.x+r;xx++)if(inside1020(xx,yy)&&(xx===st.x-r||xx===st.x+r||yy===st.y-r||yy===st.y+r))setTerrainTile58(state.map,xx,yy,TT.WALL);
    const g={x:st.x+dx*r,y:st.y+dy*r};setTerrainTile58(state.map,g.x,g.y,TT.LOCKED_GATE);const d0={x:g.x,y:g.y,keyId:id,group:i,open:false,vestibule:true,staged:true};plan.doors.push(d0);plan.groups.push({keyId:id,doors:[d0]});
  }
  // Join only the outward side of the outer gate to the already reachable map. This is a rescue vestibule, not a shortcut.
  const og=plan.doors[0],out={x:og.x+dx,y:og.y+dy},target=pick.target||{x:state.player.x,y:state.player.y};if(inside1020(out.x,out.y)){archLine(out.x,out.y,target.x,out.y,TT.FLOOR,1,true);archLine(target.x,out.y,target.x,target.y,TT.FLOOR,1,true)}
  setTerrainTile58(state.map,st.x,st.y,TT.STAIR);state.keyPlan96=plan;
  let before=reachableSet1020({start:state.player}),q1=farthestReachableKeyCell(before,p=>Math.max(Math.abs(p.x-st.x),Math.abs(p.y-st.y))>outer+1,state.player);if(!q1){clearOldKeyTiles();return null}plan.keys.push({x:q1.x,y:q1.y,keyId:'iron',active:true});setTerrainTile58(state.map,q1.x,q1.y,TT.KEY_TILE);
  if(count>=2){
    const r0=radii[0],r1=radii[1];let q2=null,best=-1;for(let yy=st.y-r0+1;yy<=st.y+r0-1;yy++)for(let xx=st.x-r0+1;xx<=st.x+r0-1;xx++){
      if(Math.max(Math.abs(xx-st.x),Math.abs(yy-st.y))<=r1||!safeFloorTile1020(state.map[yy]?.[xx]))continue;const dd=Math.abs(xx-(st.x+dx*r0))+Math.abs(yy-(st.y+dy*r0));if(dd>best){best=dd;q2={x:xx,y:yy}}
    }
    if(!q2){clearOldKeyTiles();return null}plan.keys.push({x:q2.x,y:q2.y,keyId:'jade',active:true});setTerrainTile58(state.map,q2.x,q2.y,TT.KEY_TILE);
  }
  return lockAudit96()||null
}
function roomHas1022(r,x,y,pad=0){return r&&x>=r.x+pad&&y>=r.y+pad&&x<r.x+r.w-pad&&y<r.y+r.h-pad}
function visualFree1022(x,y){return inside1020(x,y)&&basicFloor1022(state.map[y][x])&&!occupiedFinal(x,y)}
/* Bookshelf-wall library: reference principle from Pixel Dungeon/DCSS — shelves ARE wall faces, not loose furniture. */
const LIB_SCROLLS=[
 {name:'도서관 지도첩',type:'scroll',rarity:'rare',libraryScroll1022:true,libraryKind1022:'mapping',count:1,desc:'서고의 층별 동선을 겹쳐 그린 지도첩. 사용하면 현재 층 전체와 숨은 문을 드러낸다.'},
 {name:'도서관 감식록',type:'scroll',rarity:'rare',libraryScroll1022:true,libraryKind1022:'identify',count:1,desc:'물품의 결·냄새·봉인을 대조한 감식 기록. 미감정 물품을 최대 3개 감정한다.'},
 {name:'도서관 수호장',type:'scroll',rarity:'relic',libraryScroll1022:true,libraryKind1022:'ward',count:1,desc:'오래된 서고를 지키던 진언. 해로운 상태를 씻고 10턴 동안 수호막을 두른다.'}
];
function libraryTarget(){if(!state)return false;const f=state.floor,s=state.runId984||state.runId||'run';if(f===1||f===2)return f===(1+(hash1022(`${s}:lib12`)&1));if(f===3||f===4)return f===(3+(hash1022(`${s}:lib34`)&1));if(f===13)return hash1022(`${s}:lib13`)%4===0;return false}
function criticalLibraryRoom(r){if(roomHas1022(r,state.player.x,state.player.y,2)||roomHas1022(r,state.stairs.x,state.stairs.y,2)||(state.monsters||[]).some(m=>m.boss&&roomHas1022(r,m.x,m.y,1)))return true;for(let y=Math.max(1,r.y);y<Math.min(ROWS-1,r.y+r.h);y++)for(let x=Math.max(1,r.x);x<Math.min(COLS-1,r.x+r.w);x++)if([TT.STAIR,TT.LOCKED_GATE,TT.KEY_TILE,TT.PORTAL,TT.SWITCH,TT.DRAWBRIDGE_UP].filter(v=>v!=null).includes(state.map[y][x]))return true;return false}
function wallRuns(r){const out=[];const scan=(side,cells,ix,iy)=>{let run=[];const flush=()=>{if(run.length>=4)out.push({side,cells:[...run],ix,iy});run=[]};for(const p of cells){const nx=p.x+ix,ny=p.y+iy;if(inside1020(p.x,p.y)&&state.map[p.y][p.x]===TT.WALL&&inside1020(nx,ny)&&basicFloor1022(state.map[ny][nx]))run.push(p);else flush()}flush()};scan('top',Array.from({length:Math.max(0,r.w-4)},(_,i)=>({x:r.x+2+i,y:r.y})),0,1);scan('bottom',Array.from({length:Math.max(0,r.w-4)},(_,i)=>({x:r.x+2+i,y:r.y+r.h-1})),0,-1);scan('left',Array.from({length:Math.max(0,r.h-4)},(_,i)=>({x:r.x,y:r.y+2+i})),1,0);scan('right',Array.from({length:Math.max(0,r.h-4)},(_,i)=>({x:r.x+r.w-1,y:r.y+2+i})),-1,0);return out}
function applyLibrary(){if(state.floor===6&&state.floor6GrandLibraryR8){state.bookWalls1022=state.bookWalls1022||[];state.libraryZones1022=state.libraryZones1022||[];state.libraryScrolls1022=state.libraryScrolls1022||[];return true}state.bookWalls1022=[];state.libraryZones1022=[];state.libraryScrolls1022=[];if(!libraryTarget())return false;const candidates=[];for(const r of state.rooms||[]){if(!r||r.w<7||r.h<7||r.w>34||r.h>25||criticalLibraryRoom(r))continue;const runs=wallRuns(r);if(runs.length)candidates.push({r,runs,score:Math.max(...runs.map(v=>v.cells.length))*20+r.w*r.h})}candidates.sort((a,b)=>b.score-a.score);if(!candidates.length)return false;const r=candidates[0].r,run0=candidates[0].runs.sort((a,b)=>b.cells.length-a.cells.length)[0],len=Math.min(state.floor===13?6:9,run0.cells.length),start=Math.max(0,Math.floor((run0.cells.length-len)/2)),run={...run0,cells:run0.cells.slice(start,start+len)};for(const p of run.cells)state.bookWalls1022.push(K1020(p.x,p.y));const depth=3,wood=state.floor===13?(TT.DARK_WOOD??TT.WOOD_FLOOR??TT.FLOOR):(TT.WOOD_FLOOR??TT.FLOOR);for(const p of run.cells)for(let d=1;d<=depth;d++){const x=p.x+run.ix*d,y=p.y+run.iy*d;if(inside1020(x,y)&&basicFloor1022(state.map[y][x])&&!occupiedFinal(x,y))setTerrainTile58(state.map,x,y,wood)}const zone={...r,side:run.side,name:'벽면서고'};state.libraryZones1022.push(zone);state.featureRooms=state.featureRooms||[];state.featureRooms.push({name:'벽면서고',...r});let q=ReachabilityService.libraryScrollCell({reachableSet1020,K1020,roomHas1022,visualFree1022,inside1020,HAZ1020},r,run);if(!q){const reach=reachableSet1020({unlock:true,openBoss:true});let best=null,bd=1e9;for(const kk of reach){const [xx,yy]=kk.split(',').map(Number);if(!inside1020(xx,yy)||!basicFloor1022(state.map[yy][xx])||occupiedFinal(xx,yy))continue;const d=Math.abs(xx-r.cx)+Math.abs(yy-r.cy);if(d<bd){bd=d;best={x:xx,y:yy}}}q=best}if(q){const def=LIB_SCROLLS[hash1022(floorSeedKey('scroll'))%LIB_SCROLLS.length],it={...structuredClone(def),x:q.x,y:q.y};PlacementService.placeItem(it);state.libraryScrolls1022.push({name:it.name,x:q.x,y:q.y})}return true}
function restaurantSeed(){return state?.runId984||window.__MANRU_RUN_SEED984||state?.runId||'run'}
function restaurantEligibleFloor(f=state?.floor){return [1,2,3,4,16,17,18,19].includes(+f)}
function restaurantTargetFloor(){
  if(!state||!restaurantEligibleFloor())return false;
  const f=state.floor,s=restaurantSeed();
  if(f===1||f===2)return f===(1+(hash1022(`${s}:restaurant12`)&1));
  if(f===3||f===4)return f===(3+(hash1022(`${s}:restaurant34`)&1));
  if(f===16||f===17)return f===(16+(hash1022(`${s}:restaurant1617`)&1));
  if(f===18||f===19)return f===(18+(hash1022(`${s}:restaurant1819`)&1));
  return false;
}
function restaurantVariant(force=null){if(force&&RESTAURANT_VARIANTS42.includes(force))return force;const s=restaurantSeed();return RESTAURANT_VARIANTS42[hash1022(`${s}:restaurant:${state.floor}:variant`)%RESTAURANT_VARIANTS42.length]}
function restaurantCriticalTile(t){return [TT.STAIR,TT.KEY_TILE,TT.LOCKED_GATE,TT.SECRET_DOOR,TT.PORTAL,TT.SWITCH,TT.DRAWBRIDGE_UP,TT.DRAWBRIDGE_DOWN].filter(v=>v!=null).includes(t)}
function restaurantRoomCritical(r){
  if(!r||r.w<5||r.h<5||r.w>42||r.h>32)return true;
  if((state.monsters||[]).some(m=>m.boss&&roomHas1022(r,m.x,m.y,1)))return true;
  return false;
}
function restaurantPlansFinal(r){
  const out=[],theme4=regionOfFloor()===3,w=theme4?8:7,h=7;
  const add=(side,x,y,ww,hh,door,shared,inside)=>{const a={side,x,y,w:ww,h:hh,door,shared,hostInside:inside};if(x>=1&&y>=1&&x+ww<COLS-1&&y+hh<ROWS-1)out.push(a)};
  const xStarts=[];if(r.w>=w){xStarts.push(r.x,Math.round(r.x+(r.w-w)/2),r.x+r.w-w)}
  for(const x of [...new Set(xStarts)]){
    const dx=clamp1020(Math.round(x+w/2),r.x+1,r.x+r.w-2);
    add('top',x,r.y-h+1,w,h,{x:dx,y:r.y},{axis:'y',value:r.y},{x:dx,y:r.y+1});
    add('bottom',x,r.y+r.h-1,w,h,{x:dx,y:r.y+r.h-1},{axis:'y',value:r.y+r.h-1},{x:dx,y:r.y+r.h-2});
  }
  const yStarts=[];if(r.h>=h){yStarts.push(r.y,Math.round(r.y+(r.h-h)/2),r.y+r.h-h)}
  for(const y of [...new Set(yStarts)]){
    const dy=clamp1020(Math.round(y+h/2),r.y+1,r.y+r.h-2);
    add('left',r.x-w+1,y,w,h,{x:r.x,y:dy},{axis:'x',value:r.x},{x:r.x+1,y:dy});
    add('right',r.x+r.w-1,y,w,h,{x:r.x+r.w-1,y:dy},{axis:'x',value:r.x+r.w-1},{x:r.x+r.w-2,y:dy});
  }
  // Deterministically rotate candidate order so restaurants do not always attach to the same side.
  if(!out.length)return out;const off=hash1022(`${restaurantSeed()}:${state.floor}:${r.x},${r.y}:restaurant-plan`)%out.length;return out.slice(off).concat(out.slice(0,off));
}
function restaurantInsetPlans(r){
  const out=[],theme4=regionOfFloor()===3,w=theme4?8:7,h=7;
  // Keep a meaningful remainder of the host room: this is a partitioned annex,
  // never a conversion of the whole room into a restaurant.
  if(r.w<w+4||r.h<h+2)return out;
  const add=(side,x,y,door,inside)=>{
    const a={side,x,y,w,h,door,hostInside:inside,inset42:true};
    if(x>=r.x&&y>=r.y&&x+w<=r.x+r.w&&y+h<=r.y+r.h)out.push(a);
  };
  const midYTop=r.y+Math.floor(h/2),midYBottom=r.y+r.h-h+Math.floor(h/2);
  add('inset-tl',r.x,r.y,{x:r.x+w-1,y:midYTop},{x:r.x+w,y:midYTop});
  add('inset-bl',r.x,r.y+r.h-h,{x:r.x+w-1,y:midYBottom},{x:r.x+w,y:midYBottom});
  add('inset-tr',r.x+r.w-w,r.y,{x:r.x+r.w-w,y:midYTop},{x:r.x+r.w-w-1,y:midYTop});
  add('inset-br',r.x+r.w-w,r.y+r.h-h,{x:r.x+r.w-w,y:midYBottom},{x:r.x+r.w-w-1,y:midYBottom});
  if(!out.length)return out;
  const off=hash1022(`${restaurantSeed()}:${state.floor}:${r.x},${r.y}:restaurant-inset`)%out.length;
  return out.slice(off).concat(out.slice(0,off));
}
function restaurantBroadHost(r){
  if(!r||r.w<14||r.h<12||!(r.w>42||r.h>32))return false;
  if((state.monsters||[]).some(m=>m.boss&&roomHas1022(r,m.x,m.y,1)))return false;
  return true;
}
function restaurantBroadInsetClear(a,r,reach){
  if(!a||!r||!a.broad42||!reach?.has(K1020(a.hostInside.x,a.hostInside.y)))return false;
  if(a.x<r.x+1||a.y<r.y+1||a.x+a.w>r.x+r.w-1||a.y+a.h>r.y+r.h-1)return false;
  if((state.libraryZones1022||[]).some(z=>rectOverlap42(a,z,0)))return false;
  // A broad zone is only a container for this fallback. Never erase a normal
  // room or a compact named feature that already owns this slice of the map.
  if((state.rooms||[]).some(z=>z&&z!==r&&z.w<=42&&z.h<=32&&rectOverlap42(a,z,0)))return false;
  if((state.featureRooms||[]).some(z=>{
    if(!z||z.restaurant42||![z.x,z.y,z.w,z.h].every(Number.isFinite)||!rectOverlap42(a,z,0))return false;
    return (z.w*z.h)<700;
  }))return false;
  const hi=a.hostInside,tHi=state.map[hi.y]?.[hi.x];
  if(!inside1020(hi.x,hi.y)||tileBlocks(tHi)||HAZ1020().has(tHi)||occupiedFinal(hi.x,hi.y))return false;
  for(let y=a.y;y<a.y+a.h;y++)for(let x=a.x;x<a.x+a.w;x++){
    const t=state.map[y]?.[x];
    if(restaurantCriticalTile(t)||HAZ1020().has(t)||(state.player.x===x&&state.player.y===y)||(state.stairs.x===x&&state.stairs.y===y))return false;
    if((state.items||[]).some(i=>i.x===x&&i.y===y))return false;
    if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return false;
    if(tileBlocks(t)&&t!==TT.WALL&&t!==TT.WINDOW&&!restaurantReplaceableInsetDecor(t))return false;
  }
  return true;
}
function restaurantBroadInsetPlans(r,reach){
  const out=[],theme4=regionOfFloor()===3,w=theme4?8:7,h=7;
  if(!restaurantBroadHost(r))return out;
  const add=(side,x,y,door,inside)=>{
    const a={side,x,y,w,h,door,hostInside:inside,inset42:true,broad42:true};
    if(!inside||!reach.has(K1020(inside.x,inside.y))||!restaurantBroadInsetClear(a,r,reach))return;
    let traffic=0,wallish=0;
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
      if(reach.has(K1020(xx,yy)))traffic++;
      const t=state.map[yy]?.[xx];if(t===TT.WALL||t===TT.WINDOW)wallish++;
    }
    // Prefer a quiet perimeter pocket so the partition does not consume a
    // busy hall/corridor; final topology is still re-audited after painting.
    out.push({a,score:5000-traffic*24+wallish*5});
  };
  for(let y=r.y+1;y<=r.y+r.h-h-1;y+=2)for(let x=r.x+1;x<=r.x+r.w-w-1;x+=2){
    const mx=x+Math.floor(w/2),my=y+Math.floor(h/2);
    add('broad-top',x,y,{x:mx,y},{x:mx,y:y-1});
    add('broad-bottom',x,y,{x:mx,y:y+h-1},{x:mx,y:y+h});
    add('broad-left',x,y,{x,y:my},{x:x-1,y:my});
    add('broad-right',x,y,{x:x+w-1,y:my},{x:x+w,y:my});
  }
  const off=out.length?hash1022(`${restaurantSeed()}:${state.floor}:${r.x},${r.y}:restaurant-broad`)%out.length:0;
  return out.slice(off).concat(out.slice(0,off));
}
function restaurantReplaceableInsetDecor(t){
  return [TT.TABLE,TT.SCREEN,TT.JAR,TT.BRAZIER,TT.COOKPOT,TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.IRON_HOOK].filter(Number.isFinite).includes(t);
}
function restaurantInsetClear(a,r){
  if(!a||!r||!a.inset42)return false;
  if(a.x<r.x||a.y<r.y||a.x+a.w>r.x+r.w||a.y+a.h>r.y+r.h)return false;
  if((state.libraryZones1022||[]).some(z=>rectOverlap42(a,z,0)))return false;
  const featureBlocks=(z)=>{
    if(!z||z===r||z.restaurant42||![z.x,z.y,z.w,z.h].every(Number.isFinite)||!rectOverlap42(a,z,0))return false;
    const containsHost=z.x<=r.x&&z.y<=r.y&&z.x+z.w>=r.x+r.w&&z.y+z.h>=r.y+r.h;
    const containerLike=containsHost&&(z.w*z.h)>=Math.max(1,r.w*r.h)*1.4;
    return !containerLike;
  };
  if((state.featureRooms||[]).some(featureBlocks))return false;
  const hi=a.hostInside;
  if(!hi||!inside1020(hi.x,hi.y)||tileBlocks(state.map[hi.y]?.[hi.x])||HAZ1020().has(state.map[hi.y]?.[hi.x])||occupiedFinal(hi.x,hi.y))return false;
  for(let y=a.y;y<a.y+a.h;y++)for(let x=a.x;x<a.x+a.w;x++){
    const t=state.map[y]?.[x];
    if(restaurantCriticalTile(t)||HAZ1020().has(t)||(state.player.x===x&&state.player.y===y)||(state.stairs.x===x&&state.stairs.y===y))return false;
    if((state.items||[]).some(i=>i.x===x&&i.y===y))return false;
    if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return false;
    // Existing room floor/window/wall is fine; physical props or gates are not
    // silently erased just to make the fallback fit.
    if(tileBlocks(t)&&t!==TT.WALL&&t!==TT.WINDOW&&!restaurantReplaceableInsetDecor(t))return false;
  }
  return true;
}
function restaurantSharedCell(a,x,y){return a.shared?.axis==='x'?x===a.shared.value:y===a.shared?.value}
function importantRestaurantItem(it){
  if(!it)return false;
  return !!(it.libraryScroll1022||it.rescueRelic1005||it.storyItem992||it.quest||it.bossReward||it.keyId||it.unique||it.sealedObjective)||(it.type==='key');
}
function restaurantPlanClear(a){
  if(!a||a.x<1||a.y<1||a.x+a.w>=COLS-1||a.y+a.h>=ROWS-1)return false;
  if((state.libraryZones1022||[]).some(z=>rectOverlap42(a,z,0)))return false;
  // The host-side cell behind the new door must already belong to a usable room.
  const hi=a.hostInside;if(!hi||!inside1020(hi.x,hi.y)||tileBlocks(state.map[hi.y]?.[hi.x])||HAZ1020().has(state.map[hi.y]?.[hi.x]))return false;
  if(occupiedFinal(hi.x,hi.y))return false;
  for(let y=a.y;y<a.y+a.h;y++)for(let x=a.x;x<a.x+a.w;x++){
    const t=state.map[y]?.[x],shared=restaurantSharedCell(a,x,y);
    if(restaurantCriticalTile(t)||HAZ1020().has(t)||(state.player.x===x&&state.player.y===y)||(state.stairs.x===x&&state.stairs.y===y))return false;
    if((state.monsters||[]).some(m=>m.hp>0&&m.boss&&monCovers(m,x,y)))return false;
    if((state.items||[]).some(i=>i.x===x&&i.y===y&&importantRestaurantItem(i)))return false;
    // A true annex is carved only through unused wall mass. The shared strip is
    // the host room wall; every other cell must likewise still be wall/window,
    // so we never erase a corridor, room, reward, or existing feature.
    if(t!==TT.WALL&&t!==TT.WINDOW)return false;
    if(!shared&&((state.items||[]).some(i=>i.x===x&&i.y===y)||(state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y))))return false;
  }
  return true;
}
function restaurantDoor(a){return{x:a.door.x,y:a.door.y}}
function restaurantInside(fr,x,y,pad=0){return x>=fr.x+pad&&y>=fr.y+pad&&x<fr.x+fr.w-pad&&y<fr.y+fr.h-pad}
function restaurantReachSet(){
  try{const r=reachableCells({unlock:true,rafts:true,portals:true,blinkRange:0});if(r instanceof Set)return r}catch(error){ignoreError('reachability helper failed; the generic walk below is used',error)}
  return reachableSet1020({unlock:true,openBoss:true,diagonal:true});
}
function restaurantTileFree(fr,x,y){
  if(!restaurantInside(fr,x,y,1)||tileBlocks(state.map[y]?.[x])||HAZ1020().has(state.map[y]?.[x]))return false;
  if((state.items||[]).some(i=>i.x===x&&i.y===y)||(state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return false;
  if((state.player.x===x&&state.player.y===y)||(state.stairs.x===x&&state.stairs.y===y))return false;
  return true;
}
function restaurantFreeCells(fr){const a=[];for(let y=fr.y+1;y<fr.y+fr.h-1;y++)for(let x=fr.x+1;x<fr.x+fr.w-1;x++)if(restaurantTileFree(fr,x,y))a.push({x,y});return a}
function restaurantPut(fr,x,y,t){
  if(!restaurantInside(fr,x,y,1)||fr.cookCluster42?.some(q=>q.x===x&&q.y===y)||Math.abs(x-fr.door42.x)+Math.abs(y-fr.door42.y)<=1)return false;
  setTerrainTile58(state.map,x,y,t);return true;
}
function restaurantCluster(fr){
  const n=2+(hash1022(`${restaurantSeed()}:${state.floor}:${fr.x}:${fr.y}:cook`)%3),tile=fr.theme42===3?TT.COOKPOT:TT.BRAZIER,c=[];
  // The cooking line is intentionally a contiguous 2-4 tile work-bank, never scattered singles.
  const y=fr.y+1;let sx=fr.x+1;if(fr.door42.y===y&&fr.door42.x<=sx+n)sx=Math.min(fr.x+fr.w-n-1,sx+2);
  for(let i=0;i<n;i++)c.push({x:sx+i,y});
  for(const q of c)setTerrainTile58(state.map,q.x,q.y,tile);
  fr.cookCluster42=c;fr.cookTile42=tile;return c;
}
function restaurantFurniture(fr){
  const l=fr.x+1,r=fr.x+fr.w-2,t=fr.y+1,b=fr.y+fr.h-2,cx=fr.x+Math.floor(fr.w/2),cy=fr.y+Math.floor(fr.h/2),BEN=TT.BENCH??TT.TABLE,RACK=TT.RACK??TT.SCREEN,CR=TT.CRATE??TT.JAR;
  if(fr.name==='객잔 식당'){
    for(const [x,y] of [[l+1,cy-1],[r-2,cy+1]]){restaurantPut(fr,x,y,TT.TABLE);restaurantPut(fr,x,y+1,BEN);restaurantPut(fr,x+1,y,BEN)}restaurantPut(fr,r,t+1,TT.JAR);restaurantPut(fr,l,b-1,RACK);
  }else if(fr.name==='작은 주방'){
    restaurantPut(fr,cx,cy,TT.TABLE);restaurantPut(fr,r,cy,RACK);restaurantPut(fr,l,b-1,CR);restaurantPut(fr,r,b-1,TT.JAR);restaurantPut(fr,cx-1,b-1,TT.JAR);
  }else if(fr.name==='배식실'){
    for(let x=l+1;x<=r-1;x++)if(Math.abs(x-fr.door42.x)>1)restaurantPut(fr,x,cy,TT.TABLE);restaurantPut(fr,l,cy-1,RACK);restaurantPut(fr,r,cy+1,CR);
  }else if(fr.name==='술상방'){
    restaurantPut(fr,l+1,cy,TT.TABLE);restaurantPut(fr,r-1,cy,TT.TABLE);restaurantPut(fr,l+1,cy+1,BEN);restaurantPut(fr,r-1,cy-1,BEN);restaurantPut(fr,l,t+2,TT.JAR);restaurantPut(fr,l,t+3,TT.JAR);restaurantPut(fr,r,b-1,TT.JAR);
  }else{
    for(const [x,y] of [[l,t+2],[l,b-1],[r,t+2],[r,b-1]])restaurantPut(fr,x,y,((x+y)&1)?RACK:CR);restaurantPut(fr,l+1,b-1,TT.JAR);restaurantPut(fr,r-1,b-1,TT.JAR);
  }
}
function restaurantRewardSpot(fr,salt=0){const a=restaurantFreeCells(fr);if(!a.length)return null;return a[hash1022(`${state.floor}:${fr.x},${fr.y}:reward:${salt}`)%a.length]}
function restaurantMonsterSpot(fr,salt=0){const a=restaurantFreeCells(fr);if(!a.length)return null;return a[hash1022(`${fr.x},${fr.y}:mon:${salt}`)%a.length]}
function restaurantSnapshot(a){
  state.subthemeWalls970=state.subthemeWalls970||{};state.subthemeFloors972=state.subthemeFloors972||{};const snap=[];
  for(let y=a.y;y<a.y+a.h;y++)for(let x=a.x;x<a.x+a.w;x++){const kk=K1020(x,y);snap.push({x,y,t:state.map[y][x],...terrainCellPlacement58(state.map,x,y),wallHad:Object.prototype.hasOwnProperty.call(state.subthemeWalls970,kk),wall:state.subthemeWalls970[kk],floorHad:Object.prototype.hasOwnProperty.call(state.subthemeFloors972,kk),floor:state.subthemeFloors972[kk]})}
  return snap;
}
function installPendingCustomLocks(){
  if(state.floor===18&&state.ironGate18_1020){
    // Gate first; then choose a key from the player-side component so there is never a key-behind-its-own-door bug.
    const g=state.ironGate18_1020;setTerrainTile58(state.map,g.x,g.y,TT.LOCKED_GATE);const reach=reachableSet1020({start:state.player});const q=farthestReachableKeyCell(reach,p=>Math.abs(p.x-g.x)+Math.abs(p.y-g.y)>8,state.player);if(q)installCustomKeyPlan('iron',q,g,'warehouse-exit-vestibule');
  }else if(state.floor===22&&state.midGate22_1020&&state.midKey22_1020){installCustomKeyPlan('jade',state.midKey22_1020,state.midGate22_1020,'midpoint-convergence')}
}
function encloseEntryDocumentRoom(g,z){
 const r=z,x0=r.x-1,x1=r.x+r.w,y0=r.y-1,y1=r.y+r.h,entry={x:r.cx<COLS/2?x1:x0,y:r.y+3},entries=[];
 for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){
  if(xx!==x0&&xx!==x1&&yy!==y0&&yy!==y1)continue;
  const t=state.map[yy]?.[xx],dx=xx===x0?-1:xx===x1?1:0,dy=yy===y0?-1:yy===y1?1:0;
  const crossing=(xx!==entry.x||yy===entry.y)&&basicFloor1022(t)&&!tileBlocks(state.map[yy+dy]?.[xx+dx])&&!tileBlocks(state.map[yy-dy]?.[xx-dx]);
  const occupied=(state.player.x===xx&&state.player.y===yy)||(state.items||[]).some(it=>it.x===xx&&it.y===yy)||(state.monsters||[]).some(m=>monCovers(m,xx,yy));
  if((xx===entry.x&&yy===entry.y)||crossing||occupied){setTerrainTile58(state.map,xx,yy,occupied?TT.OPEN_DOOR:TT.DOOR);entries.push({x:xx,y:yy})}
  else if(basicFloor1022(t)||t===TT.DOOR||t===TT.OPEN_DOOR)setTerrainTile58(state.map,xx,yy,TT.WALL);
  if(state.map[yy]?.[xx]===TT.WALL)g.walls[K1020(xx,yy)]={zone:z.index,u:xx-r.x,v:yy-r.y};
 }
 z.enclosure67={x0,x1,y0,y1,entry,entries};
}
function buildSpecialPlaces(){
 state.specialPlaces52=null;if(state.artifactDungeon46)return;
 // F20 owns a strict mirrored fortress topology with staged boss seals. Generic one-sided room subdivision would
 // invalidate those authored door throats, so keep its richness in the dedicated F20 geometry/decor passes.
 if(state.floor===20)return;
 const d=SPECIAL_PLACES52[state.floor];if(!d)return;
 const g={floor:state.floor,name:d[0],zones:[],geometry:[],cells:{},walls:{},landmarks:[],fixtures:[]};state.specialPlaces52=g;
 const library=state.floor===6?state.floor6GrandLibraryR8:null;
 const candidates=library?(state.libraryZones1022||[]):(state.rooms||[]).filter(r=>r&&r.w>=9&&r.h>=7&&r.w<=38&&r.h<=28&&(!roomTouchesProtected(r)||(state.floor===25&&Math.abs((r.cx||r.x+r.w/2)-COLS/2)+Math.abs((r.cy||r.y+r.h/2)-ROWS/2)>13))).sort((a,b)=>b.w*b.h-a.w*a.h);
 const overlaps=r=>g.zones.some(z=>r.x<z.x+z.w&&r.x+r.w>z.x&&r.y<z.y+z.h&&r.y+r.h>z.y);
 for(const r of candidates){if(g.zones.length>=(library?9:4))break;if(!library&&overlaps(r))continue;let open=0;for(let yy=r.y+1;yy<r.y+r.h-1;yy++)for(let xx=r.x+1;xx<r.x+r.w-1;xx++)if(basicFloor1022(state.map[yy]?.[xx]))open++;if(open<12)continue;
  const z={...r,name:library?r.name:`${d[0]} · ${['전실','본관','측랑','보존실'][g.zones.length]}`,index:g.zones.length};g.zones.push(z);
  const set=(xx,yy)=>{if(inside1020(xx,yy)&&basicFloor1022(state.map[yy]?.[xx])&&![state.player,state.stairs,state.f6LibraryGateR8,state.f6LibraryKeyR8,state.ironGate18_1020,state.outdoorGate24_1020,state.deepKey24_1020].filter(Boolean).some(a=>Math.abs(a.x-xx)+Math.abs(a.y-yy)<3)){setTerrainTile58(state.map,xx,yy,TT.WALL);return true}return false};
  const door=(xx,yy)=>{if(state.map[yy]?.[xx]===TT.WALL){setTerrainTile58(state.map,xx,yy,TT.DOOR);return true}return false};
  let walls=0,doors=0;const mx=r.x+Math.floor(r.w/2),my=r.y+Math.floor(r.h/2),mode=(d[4]+z.index)%6;
  if(!library&&open>(r.w-2)*(r.h-2)*.58){
   if(mode===0||mode===3){const xx=r.x+Math.max(3,Math.floor(r.w*(mode===0?.38:.62)));for(let yy=r.y+1;yy<r.y+r.h-1;yy++)walls+=+set(xx,yy);for(const yy of [r.y+2,r.y+r.h-3])doors+=+door(xx,yy);if(mode===3)for(let x0=r.x+1;x0<xx;x0++)walls+=+set(x0,my);doors+=+door(xx-2,my)}
   else if(mode===1||mode===4){const yy=r.y+Math.max(3,Math.floor(r.h*.45));for(let xx=r.x+1;xx<r.x+r.w-1;xx++)walls+=+set(xx,yy);doors+=+door(r.x+2,yy);doors+=+door(r.x+r.w-3,yy);if(mode===4)for(let y0=yy+2;y0<r.y+r.h-2;y0++)walls+=+set(mx,y0)}
   else if(mode===2){for(const xx of [r.x+3,r.x+r.w-4])for(const yy of [r.y+2,r.y+r.h-3]){walls+=+set(xx,yy);if(r.h>=10)walls+=+set(xx,yy+(yy<my?1:-1))}}
   else{for(let xx=r.x+2;xx<mx;xx++)walls+=+set(xx,my-1);for(let xx=mx+1;xx<r.x+r.w-2;xx++)walls+=+set(xx,my+1);walls+=+set(mx+1,my);doors+=+door(mx+1,my+1)}
  }
  // Enclose the original olive document rooms at the entry, retaining their floor and landmarks.
  // The two rooms keep their authored foyer-side entrance; no new garden is generated.
  if(state.floor===2&&r.y===40&&r.w===11&&r.h===8){
   encloseEntryDocumentRoom(g,z);
  }
  g.geometry.push({zone:z.name,mode,walls,doors});
  for(let yy=r.y;yy<r.y+r.h;yy++)for(let xx=r.x;xx<r.x+r.w;xx++)if(inside1020(xx,yy)){const kk=K1020(xx,yy);if(basicFloor1022(state.map[yy][xx]))g.cells[kk]={zone:z.index,u:xx-r.x,v:yy-r.y,mode:(z.index+d[4])%4};else if(state.map[yy][xx]===TT.WALL)g.walls[kk]={zone:z.index,u:xx-r.x,v:yy-r.y}}
  // A full 3×3 seal/map/machine pad, selected only on existing continuous floor. No loot is hidden behind it.
  outer:for(let yy=r.y+2;yy<r.y+r.h-3;yy++)for(let xx=r.x+2;xx<r.x+r.w-3;xx++){let ok=true;for(let dy=0;dy<3;dy++)for(let dx=0;dx<3;dx++)if(!basicFloor1022(state.map[yy+dy]?.[xx+dx]))ok=false;if(!ok)continue;const lm={x:xx,y:yy,w:3,h:3,kind:(d[4]+z.index)%6,name:z.name};g.landmarks.push(lm);for(let dy=0;dy<3;dy++)for(let dx=0;dx<3;dx++){const kk=K1020(xx+dx,yy+dy);g.cells[kk]={...(g.cells[kk]||{}),landmark:{u:dx,v:dy,kind:lm.kind}}}break outer}
  if(!g.landmarks.some(l=>l.name===z.name)){outer2:for(let yy=r.y+1;yy<r.y+r.h-2;yy++)for(let xx=r.x+1;xx<r.x+r.w-2;xx++){if(![0,1].every(dy=>[0,1].every(dx=>basicFloor1022(state.map[yy+dy]?.[xx+dx]))))continue;const lm={x:xx,y:yy,w:2,h:2,kind:(d[4]+z.index)%6,name:z.name};g.landmarks.push(lm);for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const kk=K1020(xx+dx,yy+dy);g.cells[kk]={...(g.cells[kk]||{}),landmark:{u:dx,v:dy,kind:lm.kind,w:2,h:2}}}break outer2}}
  for(let yy=r.y;yy<r.y+r.h;yy++)for(let xx=r.x;xx<r.x+r.w;xx++)if(g.walls[K1020(xx,yy)]&&(xx+yy+d[4])%7===0&&DIRS4.some(([dx,dy])=>basicFloor1022(state.map[yy+dy]?.[xx+dx]))){g.walls[K1020(xx,yy)].fixture=true;g.fixtures.push({x:xx,y:yy})}
 }
 state.featureRooms=state.featureRooms||[];for(const z of g.zones)if(!library){state.featureRooms.push({...z});archRouteTag(z.cx||z.x+2,z.cy||z.y+2,z.name)}
}
/* R8 F06 GRAND LIBRARY — coexists with the arboretum, underwater pavilions and the stair manor. */
function buildFloor6GrandLibraryR(){
 if(state.floor!==6)return false;
 const W=43,H=35,p=state.player,st=state.stairs;
 const cand=[[3,3],[COLS-W-3,3],[3,ROWS-H-3],[COLS-W-3,ROWS-H-3]].filter(([x,y])=>x>=2&&y>=2&&x+W<COLS-2&&y+H<ROWS-2);
 const dist=([x,y],q)=>Math.abs(q.x-clamp1020(q.x,x,x+W-1))+Math.abs(q.y-clamp1020(q.y,y,y+H-1));
 cand.sort((a,b)=>Math.min(dist(b,p),dist(b,st))-Math.min(dist(a,p),dist(a,st)));
 const [x,y]=cand[0]||[3,3],cx=x+21,cy=y+20,old=cloneTerrainMap58(state.map);
 archRect(x,y,W,H,TT.WALL,true);
 const zones=[],room=(rx,ry,w,h,name,t=TT.WOOD_FLOOR)=>{archRect(x+rx,y+ry,w,h,t,true);const z={x:x+rx,y:y+ry,w,h,cx:x+rx+Math.floor(w/2),cy:y+ry+Math.floor(h/2),name};zones.push(z);return z},floor=(rx,ry,w,h,t=TT.WOOD_FLOOR)=>archRect(x+rx,y+ry,w,h,t,true),door=(rx,ry)=>{setTerrainTile58(state.map,x+rx,y+ry,TT.DOOR)},wall=(rx,ry,w,h)=>floor(rx,ry,w,h,TT.WALL);
 const archive=room(16,1,11,7,'봉인 고문서고',TT.DARK_WOOD);
 room(1,1,11,11,'고지도 보존·평행 서가');room(31,1,11,10,'단상 기록보관실',TT.STONE_PATH);
 room(1,15,10,7,'사서 집무실',TT.CARPET);room(31,15,11,9,'곡절 수문·식생 서가');
 room(1,26,10,7,'수변 오두막 대출소');room(31,27,11,6,'정자 연결 열람별실',TT.MOON_STONE);
 room(16,14,11,14,'중앙 대열람실',TT.CARPET);room(18,10,7,3,'자료실 전실',TT.STONE_PATH);
 // Separate wings share a loop with two- and three-cell galleries, rather than repeated switchback strips.
 floor(13,2,2,31,TT.STONE_PATH);floor(28,2,2,31,TT.STONE_PATH);floor(12,12,19,2,TT.STONE_PATH);floor(11,24,21,2,TT.STONE_PATH);floor(11,30,21,3,TT.STONE_PATH);floor(20,28,3,7,TT.STONE_PATH);
 door(12,8);door(30,7);door(11,18);floor(12,18,1,1);door(30,19);door(11,29);floor(12,29,1,1);door(30,29);
 door(15,18);door(27,23);door(21,13);door(21,28);
 // Distinct shelf geometry: paired long stacks, inset archive bays and a dogleg collection.
 for(const yy of [4,8])wall(3,yy,7,1);
 for(const xx of [33,37])wall(xx,3,1,5);
 wall(33,17,6,1);wall(38,18,1,4);wall(33,21,3,1);
 for(const xx of [17,25])for(const yy of [16,24])wall(xx,yy,1,2);
 state.libraryDesks52={};for(const [dx,dy]of [[18,18],[23,18],[18,23],[23,23]])for(let v=0;v<3;v++)for(let u=0;u<2;u++){setTerrainTile58(state.map,x+dx+u,y+dy+v,TT.TABLE);state.libraryDesks52[K1020(x+dx+u,y+dy+v)]={u,v}}
 // Raised archivist dais: material and transverse stair nosings, not a false impassable elevation.
 floor(31,1,11,2,TT.DARK_WOOD);floor(18,2,7,2,TT.MOON_STONE);
 const archiveGate={x:cx,y:y+8};setTerrainTile58(state.map,archiveGate.x,archiveGate.y,TT.LOCKED_GATE);floor(21,9,1,1,TT.STONE_PATH);
 const archiveKey={x:x+6,y:y+18};setTerrainTile58(state.map,archiveKey.x,archiveKey.y,TT.KEY_TILE);
 state.f6LibraryGateR8={...archiveGate};state.f6LibraryKeyR8={...archiveKey};state.floorKeysRequired=Math.max(state.floorKeysRequired||0,1);archRouteTag(archiveKey.x,archiveKey.y,'봉인 고문서고 열쇠');
 const gx=cx,gy=y+H-1;door(21,H-1);let joined=false;
 // Seek the nearest original land from the entrance, with a bounded outside elbow.
 const candidates=[];for(let yy=2;yy<ROWS-2;yy++)for(let xx=2;xx<COLS-2;xx++)if((xx<x||xx>=x+W||yy<y||yy>=y+H)&&!tileBlocks(old[yy][xx])&&!HAZ1020().has(old[yy][xx]))candidates.push({x:xx,y:yy,d:Math.abs(xx-gx)+Math.abs(yy-gy)});
 candidates.sort((a,b)=>a.d-b.d);const q=candidates.find(q=>q.y>=gy)||candidates[0];if(q){archLine(gx,gy+1,q.x,gy+1,TT.WOOD_FLOOR,1,true);archLine(q.x,gy+1,q.x,q.y,TT.WOOD_FLOOR,1,true);joined=true}
 // Do not bury an original progression anchor even on an unusually constrained generator seed.
 for(const q of [p,st])if(q.x>=x&&q.x<x+W&&q.y>=y&&q.y<y+H){archLine(q.x,q.y,x+14,q.y,TT.WOOD_FLOOR,1,true);setTerrainTile58(state.map,q.x,q.y,q===st?TT.STAIR:TT.WOOD_FLOOR)}
 state.bookWalls1022=[];for(let yy=y;yy<y+H;yy++)for(let xx=x;xx<x+W;xx++)if(state.map[yy][xx]===TT.WALL&&((xx+yy)%2===0)&&DIRS4.some(([dx,dy])=>basicFloor1022(state.map[yy+dy]?.[xx+dx])))state.bookWalls1022.push(K1020(xx,yy));
 state.libraryZones1022=zones;state.libraryScrolls1022=[];state.featureRooms=state.featureRooms||[];for(const z of zones){state.featureRooms.push({...z});archRouteTag(z.cx,z.cy,z.name)}
 state.f6LibraryPrizeR8={x:archive.cx,y:archive.cy};state.floor6GrandLibraryR8={x,y,w:W,h:H,cx,cy,gate:{x:gx,y:gy},archiveGate,archiveKey,joined,serpentine:false,design:'central-reading-hall-with-looped-wings',zones:zones.length,landmarks:[{x:cx-2,y:cy-1,w:5,h:3,kind:'대형 열람탁자·천문지도'},{x:x+33,y:y+2,w:5,h:2,kind:'단상 기록대'}],dividerGaps:[]};
 appendRoomOnce(roomObj(x,y,W,H,'수중 대도서관'));state.layoutName=(state.layoutName||'수목원')+' · 수중 대도서관 / 중앙 대열람실 / 기록단상 / 봉인 고문서고';return true
}
/* R36 BUILDING INTERIORS — large enclosed rooms are subdivided into real chambers, never left as one open plate. */
function roomTouchesProtected(r){
  if(!r)return true;
  const pts=[state.player,state.stairs,state.f6LibraryGateR8,state.f6LibraryKeyR8,state.deepKey24_1020,state.outdoorGate24_1020,state.midGate22_1020,state.midKey22_1020].filter(Boolean);
  if(pts.some(p=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h))return true;
  if(state.floor===6&&state.floor6GrandLibraryR8){const g=state.floor6GrandLibraryR8;if(!(r.x+r.w<=g.x||r.x>=g.x+g.w||r.y+r.h<=g.y||r.y>=g.y+g.h))return true}
  // Boss/final/ritual set-pieces are authored encounter rooms, not generic buildings to cut apart.
  for(const f of state.featureRooms||[]){if(!f||!/보스|최종|봉인|심부|수문장|제단|고문서고|성소|포탈 중심|왕좌|핵/.test(f.name||''))continue;const ix=Math.max(r.x,f.x),iy=Math.max(r.y,f.y),ax=Math.min(r.x+r.w,f.x+f.w),ay=Math.min(r.y+r.h,f.y+f.h);if(ax>ix&&ay>iy)return true}
  return false;
}
const RUMOR_SPACE_BOSS_FLOORS=new Set([5,10,15,20,25]);
const RUMOR_SPACE_PROTECTED_TILES=()=>new Set([TT.STAIR,TT.PORTAL,TT.KEY_TILE,TT.LOCKED_GATE,TT.SWITCH,TT.DRAWBRIDGE_UP,TT.DRAWBRIDGE_DOWN,TT.SECRET_DOOR].filter(Number.isFinite));
const RUMOR_SPACE_CLUE_TILES=()=>new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].filter(Number.isFinite));
const RUMOR_SPACE_TYPES=[
 {id:'closed_garden',name:'폐쇄 수목원',hudName:'폐쇄 수목원',regions:[0],preview:true,shape:'court',floor:'garden',risk:0,reward:'nature',rumor:'청풍루 관리인이 손님에게 공개하지 않는 정원이 있다더라.'},
 {id:'glasshouse',name:'유리온실',hudName:'유리온실',regions:[0],preview:true,shape:'lane',floor:'garden',risk:0,reward:'nature',rumor:'비가 오지 않는 날에도 유리 너머에서 물방울 소리가 난다는 온실이 있다.'},
 {id:'service_passage',name:'관리 통로',hudName:'관리 통로',regions:[0,1,2],shape:'service',floor:'wood',risk:1,reward:'supply',rumor:'관리인만 아는 통로가 벽 사이로 이어져 있다더라.'},
 {id:'guard_supply',name:'경비 비밀보급실',hudName:'비밀 보급실',regions:[0,1,2,3],shape:'supply',floor:'wood',risk:2,reward:'supply',rumor:'압수품과 보급품을 남몰래 쌓아둔 경비병이 있다더라.'},
 {id:'thief_stash',name:'도둑 은닉고',hudName:'도둑 은닉고',regions:[0,1,2],shape:'stash',floor:'dark',risk:2,reward:'mixed',rumor:'도둑들이 벽 뒤에 도망길과 전리품을 함께 숨겨 두었다는 말이 있다.'},
 {id:'crossfire',name:'십자 사격실',regions:[0,1,2,3,4],shape:'cross',floor:'stone',risk:3,reward:'combat',rumor:'사방에서 화살이 날아오는 십자형 밀실이 있다는 소문이 있다.'},
 {id:'grid_store',name:'격자창고',hudName:'격자창고',regions:[0,1,2,3],shape:'grid',floor:'wood',risk:2,reward:'supply',rumor:'선반이 격자처럼 얽힌 창고가 벽 안쪽에 하나 더 있다더라.'},
 {id:'duel_ring',name:'원형 결투장',hudName:'원형 결투장',regions:[0,1,2,3,4],shape:'ring',floor:'stone',risk:3,reward:'combat',rumor:'사람 하나를 가둬 놓고 싸움을 시켰던 둥근 방이 아직 남아 있다.'},
 {id:'double_maze',name:'이중벽 미로',hudName:'이중벽 미로',regions:[0,1,2,3,4],shape:'maze',floor:'dark',risk:1,reward:'mixed',rumor:'지나온 방의 벽 뒤를 다시 걷게 되는 이중벽 통로가 있다더라.'},
 {id:'honeycomb',name:'벌집형 밀실',hudName:'벌집 밀실',regions:[0,1,2,3,4],shape:'honey',floor:'carpet',risk:1,reward:'scattered',rumor:'작은 방 여러 개가 벌집처럼 붙은 비밀 구획이 있다는 기록이 있다.'},
 {id:'spiral',name:'나선형 방',hudName:'나선형 방',regions:[1,2,3,4],shape:'spiral',floor:'moon',risk:2,reward:'mixed',rumor:'벽이 안쪽으로 말려 들어가는 방에서 발소리가 한참 뒤에 돌아온다고 한다.'},
 {id:'flooded_store',name:'침수 저장고',hudName:'침수 저장고',regions:[1,2,3],shape:'flood',floor:'stone',risk:2,reward:'supply',rumor:'벽 너머에 물이 고인 창고가 있다는 말이 있다.'},
 {id:'gas_chamber',name:'독가스 밀폐실',hudName:'독가스실',regions:[1,2,3],shape:'gas',floor:'dark',risk:3,reward:'hazard',rumor:'가스가 샌다는 이유로 봉해둔 공간이 있다더라.'},
 {id:'collapsed_archive',name:'무너진 서고',hudName:'무너진 서고',regions:[1,2,3],shape:'archive',floor:'carpet',risk:1,reward:'mixed',rumor:'한 번 닫힌 뒤 길이 바뀌었다는 서고가 벽 뒤에 남아 있다.'},
 {id:'burnt_kitchen',name:'불타버린 폐주방',hudName:'폐주방',regions:[0,1,2,3],shape:'kitchen',floor:'wood',risk:2,reward:'food',rumor:'불을 끈 뒤에도 연기 냄새가 새어 나오는 폐주방이 있다더라.'},
 {id:'guard_quarters',name:'실종 경비병 숙소',hudName:'경비병 숙소',regions:[0,1,2,3],shape:'quarters',floor:'wood',risk:0,reward:'gear',rumor:'사슬 소리가 벽 안쪽 숙소에서 들린다는 소문이 있다.'},
 {id:'investigator_base',name:'조사관 임시본부',hudName:'조사관 본부',regions:[0,1,2,3,4],shape:'office',floor:'carpet',risk:0,reward:'supply',rumor:'연락이 끊긴 조사관들이 벽 속 임시본부를 썼다는 기록이 남아 있다.'},
 {id:'smuggler_cache',name:'밀수꾼 은닉처',hudName:'밀수 은닉처',regions:[0,1,2,3],shape:'camp',floor:'wood',risk:1,reward:'mixed',rumor:'밀수꾼들이 식량과 잡동사니를 벽 안에 감춰뒀다는 말이 있다.'},
 {id:'abandoned_clinic',name:'버려진 치료실',hudName:'폐치료실',regions:[0,1,2,3],shape:'clinic',floor:'moon',risk:1,reward:'medical',rumor:'약품 냄새가 새어 나오는 폐쇄된 방이 있다더라.'},
 {id:'silk_preview',name:'비단 예비내실',hudName:'비단 예비실',regions:[1],preview:true,shape:'silk',floor:'carpet',risk:1,reward:'mixed',rumor:'수묵원 끝에 비단과 거울로 막아둔 객실이 있다는 기록이 있다.'},
 {id:'storage_preview',name:'봉인 장독 전실',hudName:'장독 전실',regions:[2],preview:true,shape:'jars',floor:'dark',risk:2,reward:'supply',rumor:'내실 뒤편에서 오래된 장독 냄새가 새어 나온다는 소문이 있다.'},
 {id:'heart_preview',name:'금빛 제례 전실',hudName:'금빛 제례실',regions:[3],preview:true,shape:'shrine',floor:'gilded',risk:2,reward:'mixed',rumor:'장고 가장 깊은 곳에 금빛 바닥을 숨겨둔 작은 제례실이 있다더라.'}
];
function rumorSpaceEligible(){if(!state||state.artifactDungeon46||state.specialFloor||RUMOR_SPACE_BOSS_FLOORS.has(state.floor)||state.storyMap992||state.storyMode992)return false;return !(state.monsters||[]).some(m=>m.boss)}
function rumorSpaceKey1030(x,y){return `${x},${y}`}
function rumorSpaceByEntry(x,y){return(state?.rumorSpaces1030||[]).find(r=>r.revealed&&r.entry?.x===x&&r.entry?.y===y)||null}
function rumorSpaceByInterior(x,y){return(state?.rumorSpaces1030||[]).find(r=>!r.revealed&&(r.cells||[]).some(q=>q.x===x&&q.y===y))||null}
function rumorSpaceMutationLocked(x,y){return(state?.rumorSpaces1030||[]).some(r=>!r.revealed&&x>=r.rect.x1-1&&x<=r.rect.x2+1&&y>=r.rect.y1-1&&y<=r.rect.y2+1)}
function rumorSpaceProtected(x,y){if(!state||x<=1||y<=1||x>=COLS-2||y>=ROWS-2)return true;const t=state.map[y]?.[x];if(RUMOR_SPACE_PROTECTED_TILES().has(t))return true;if(state.stairs?.x===x&&state.stairs?.y===y)return true;if(state.bossExitGate1020?.x===x&&state.bossExitGate1020?.y===y)return true;for(const q of [...(state.keyPlan96?.keys||[]),...(state.keyPlan96?.doors||[])])if(q.x===x&&q.y===y)return true;return false}
function rumorFloorTile(kind){if(kind==='garden')return TT.STONE_PATH;if(kind==='wood')return TT.WOOD_FLOOR;if(kind==='dark')return TT.DARK_WOOD;if(kind==='carpet')return TT.CARPET;if(kind==='moon')return TT.MOON_STONE;if(kind==='gilded')return TT.GILDED_FLOOR;return TT.STONE_PATH}
function rumorSpaceRect(door,dir,span,depth){const half=Math.floor(span/2);let x1,y1,x2,y2;if(dir.x>0){x1=door.x+1;x2=x1+depth-1;y1=door.y-half;y2=y1+span-1}else if(dir.x<0){x2=door.x-1;x1=x2-depth+1;y1=door.y-half;y2=y1+span-1}else if(dir.y>0){y1=door.y+1;y2=y1+depth-1;x1=door.x-half;x2=x1+span-1}else{y2=door.y-1;y1=y2-depth+1;x1=door.x-half;x2=x1+span-1}return{x1,y1,x2,y2,w:x2-x1+1,h:y2-y1+1}}
function rumorCandidateValid(out,door,dir,rect,used){if(rumorSpaceProtected(door.x,door.y)||state.map[door.y]?.[door.x]!==TT.WALL)return false;const {x1,y1,x2,y2}=rect;if(x1<=2||y1<=2||x2>=COLS-3||y2>=ROWS-3)return false;for(let y=y1-1;y<=y2+1;y++)for(let x=x1-1;x<=x2+1;x++){const boundary=x===x1-1||x===x2+1||y===y1-1||y===y2+1,kk=rumorSpaceKey1030(x,y);if(used.has(kk)||rumorSpaceProtected(x,y))return false;if(state.map[y]?.[x]!==TT.WALL)return false;if(!boundary&&state.items?.some(i=>i.x===x&&i.y===y))return false;if(!boundary&&state.monsters?.some(m=>monCovers(m,x,y)))return false}const expected={x:door.x-dir.x,y:door.y-dir.y};if(expected.x!==out.x||expected.y!==out.y)return false;return true}
function rumorCandidates(span,depth,used){const reach=finalReachSet1029(),out=[];for(const kk of reach){const [x,y]=kk.split(',').map(Number);if(!safeFloorTile1020(state.map[y]?.[x]))continue;if(Math.abs(x-state.player.x)+Math.abs(y-state.player.y)<7||Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)<6)continue;for(const [dx,dy] of DIRS4){const door={x:x+dx,y:y+dy},rect=rumorSpaceRect(door,{x:dx,y:dy},span,depth);if(rumorCandidateValid({x,y},door,{x:dx,y:dy},rect,used))out.push({out:{x,y},door,dir:{x:dx,y:dy},rect})}}return out}
function rumorPickCandidate(used,large=true){const sizes=large?[[9,13],[13,9],[7,13],[13,7],[9,11],[11,9],[7,11],[11,7],[5,11],[11,5],[7,9],[9,7],[5,9],[9,5],[5,7],[7,5]]:[[7,11],[11,7],[5,11],[11,5],[7,9],[9,7],[5,9],[9,5],[5,7],[7,5]];for(const [span,depth] of sizes){const c=rumorCandidates(span,depth,used);if(c.length)return choice(c)}return null}
function rumorTypePool(forceType=null){const z=regionIndex(),within=(state.floor-1)%5,pool=[];for(const t of RUMOR_SPACE_TYPES){if(forceType&&t.id!==forceType)continue;if(!t.regions.includes(z))continue;let w=t.preview?(within>=2?5:1):3;if(t.id==='guard_supply'&&state.floor<=3)w+=2;if(t.id==='investigator_base')w=1;if(t.risk>=3&&state.floor<=2)w=1;for(let i=0;i<w;i++)pool.push(t)}return pool}
function rumorPaint(r,x,y,tile){if(x>=r.rect.x1&&x<=r.rect.x2&&y>=r.rect.y1&&y<=r.rect.y2)setTerrainTile58(state.map,x,y,tile)}
function rumorLine(r,x0,y0,x1,y1,tile){let x=x0,y=y0,g=0;while(g++<300){rumorPaint(r,x,y,tile);if(x===x1&&y===y1)break;if(x!==x1)x+=Math.sign(x1-x);else y+=Math.sign(y1-y)}}
function rumorCarveBase(r){const f=rumorFloorTile(r.type.floor);r.floorTile=f;for(let y=r.rect.y1;y<=r.rect.y2;y++)for(let x=r.rect.x1;x<=r.rect.x2;x++)setTerrainTile58(state.map,x,y,f);const ex=r.entry.x+r.dir.x,ey=r.entry.y+r.dir.y;r.innerEntry={x:ex,y:ey};return f}
function rumorBuildShape(r){const t=r.type,box=r.rect,f=rumorCarveBase(r),cx=Math.floor((box.x1+box.x2)/2),cy=Math.floor((box.y1+box.y2)/2),put=(x,y,v)=>rumorPaint(r,x,y,v),wall=TT.WALL;
 const inb=(x,y)=>x>=box.x1&&x<=box.x2&&y>=box.y1&&y<=box.y2,maybe=(x,y,v)=>{if(inb(x,y))put(x,y,v)},fillRect=(x1,y1,x2,y2,v)=>{for(let y=Math.max(box.y1,y1);y<=Math.min(box.y2,y2);y++)for(let x=Math.max(box.x1,x1);x<=Math.min(box.x2,x2);x++)put(x,y,v)},ringRect=(x1,y1,x2,y2,v)=>{for(let x=x1;x<=x2;x++){maybe(x,y1,v);maybe(x,y2,v)}for(let y=y1;y<=y2;y++){maybe(x1,y,v);maybe(x2,y,v)}},plusPath=(x1,y1,x2,y2)=>{rumorLine(r,x1,y1,x2,y1,f);rumorLine(r,x2,y1,x2,y2,f)},dirH=!!r.dir.x,dirSign=dirH?r.dir.x:r.dir.y;
 const wallRect=(x1,y1,x2,y2)=>fillRect(x1,y1,x2,y2,wall),dropDecor=(pts,tile)=>{for(const[qx,qy]of pts)if(inb(qx,qy)&&state.map[qy]?.[qx]===f)setTerrainTile58(state.map,qx,qy,tile)};
 if(t.shape==='court'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.GRASS);
  ringRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.STONE_PATH);
  ringRect(box.x1+2,box.y1+2,box.x2-2,box.y2-2,TT.STONE_PATH);
  rumorLine(r,box.x1+1,cy,box.x2-1,cy,TT.STONE_PATH);rumorLine(r,cx,box.y1+1,cx,box.y2-1,TT.STONE_PATH);
  for(const q of [[box.x1+1,box.y1+1],[box.x2-1,box.y1+1],[box.x1+1,box.y2-1],[box.x2-1,box.y2-1]])put(q[0],q[1],TT.FLOWERBED);
  for(const q of [[cx-2,cy-2],[cx+2,cy-2],[cx-2,cy+2],[cx+2,cy+2]])maybe(q[0],q[1],TT.GARDEN_TREE);
  maybe(cx,cy,TT.LOTUS_FLOWER||TT.FLOWERBED);maybe(cx-3,cy,TT.BENCH);maybe(cx+3,cy,TT.BENCH);maybe(cx,cy-3,TT.PAPER_CRANE);maybe(cx,cy+3,TT.PAPER_CRANE);maybe(box.x1+2,cy-2,TT.RUMOR_GREENHOUSE_FRAME);maybe(box.x2-2,cy+2,TT.RUMOR_GREENHOUSE_FRAME);
 }
 else if(t.shape==='lane'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.DARK_WOOD);
  if(dirH){for(let y=box.y1+1;y<=box.y2-1;y++)for(let x=box.x1+1;x<=box.x2-1;x++)if(Math.abs(y-cy)>=2&&(x+y)%2===0)put(x,y,TT.FLOWERBED);rumorLine(r,box.x1+1,cy,box.x2-1,cy,TT.STONE_PATH);for(const x of [box.x1+2,cx,box.x2-2])for(let dy=-1;dy<=1;dy++)maybe(x,cy+dy,TT.STONE_PATH)}
  else{for(let y=box.y1+1;y<=box.y2-1;y++)for(let x=box.x1+1;x<=box.x2-1;x++)if(Math.abs(x-cx)>=2&&(x+y)%2===0)put(x,y,TT.FLOWERBED);rumorLine(r,cx,box.y1+1,cx,box.y2-1,TT.STONE_PATH);for(const y of [box.y1+2,cy,box.y2-2])for(let dx=-1;dx<=1;dx++)maybe(cx+dx,y,TT.STONE_PATH)}
  for(const q of [[box.x1+1,box.y1+1],[box.x2-1,box.y1+1],[box.x1+1,box.y2-1],[box.x2-1,box.y2-1]])maybe(q[0],q[1],TT.GARDEN_TREE);maybe(cx-2,cy,TT.RUMOR_GREENHOUSE_FRAME);maybe(cx+2,cy,TT.RUMOR_GREENHOUSE_FRAME);
 }
 else if(t.shape==='service'){
  fillRect(box.x1,box.y1,box.x2,box.y2,wall);
  const bend1={x:dirH?cx:r.innerEntry.x,y:dirH?r.innerEntry.y:cy},bend2={x:cx,y:cy};
  plusPath(r.innerEntry.x,r.innerEntry.y,bend1.x,bend1.y);plusPath(bend1.x,bend1.y,bend2.x,bend2.y);
  if(dirH){plusPath(cx,cy,box.x1+1,cy-2);plusPath(cx,cy,box.x2-1,cy+2)}else{plusPath(cx,cy,cx-2,box.y1+1);plusPath(cx,cy,cx+2,box.y2-1)}
  for(const q of [[cx,cy],[cx-2,cy],[cx+2,cy],[cx,cy-2],[cx,cy+2]])maybe(q[0],q[1],TT.CRATE);
  maybe(cx,cy,TT.RACK);
 }
 else if(t.shape==='supply'||t.shape==='stash'||t.shape==='quarters'||t.shape==='office'||t.shape==='clinic'||t.shape==='kitchen'||t.shape==='jars'||t.shape==='shrine'){
  const v=r.variant1030||0;
  if(t.shape==='supply'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);for(let y=box.y1+2;y<=box.y2-2;y++)if(Math.abs(y-cy)>=1){maybe(cx-2,y,wall);maybe(cx+2,y,wall)}
   rumorLine(r,box.x1+1,cy,box.x2-1,cy,TT.WOOD_FLOOR);rumorLine(r,cx,box.y1+1,cx,box.y2-1,TT.WOOD_FLOOR);
   for(const q of [[box.x1+1,box.y1+1],[box.x2-1,box.y1+1],[box.x1+1,box.y2-1],[box.x2-1,box.y2-1],[cx-3,cy],[cx+3,cy]])maybe(q[0],q[1],TT.CRATE);
   for(const q of [[cx-1,box.y1+2],[cx+1,box.y2-2],[cx-3,cy-2],[cx+3,cy+2]])maybe(q[0],q[1],TT.RACK);maybe(cx-3,cy+2,TT.RUMOR_WEAPON_RACK);maybe(cx+3,cy-2,TT.RUMOR_WEAPON_RACK);
  } else if(t.shape==='stash'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.DARK_WOOD);const flip=v===1?-1:1;for(let x=box.x1+2;x<=box.x2-2;x++)if(x!==cx)maybe(x,cy-flip,wall);for(let y=box.y1+2;y<=box.y2-2;y++)if(y!==cy+flip)maybe(cx+flip,y,wall);
   maybe(cx,cy,TT.RACK);for(const q of [[box.x1+1,box.y1+1],[box.x2-1,box.y2-1],[box.x1+1,box.y2-1],[box.x2-1,box.y1+1]])maybe(q[0],q[1],TT.CRATE);maybe(cx+2,cy+2,TT.RUMOR_SMUGGLER_BUNDLE);
  } else if(t.shape==='quarters'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);for(let x=box.x1+1;x<=box.x2-1;x++)if(x!==cx)maybe(x,cy,wall);
   for(const y of [box.y1+1,box.y2-1])for(let x=box.x1+1;x<=box.x2-1;x+=2)maybe(x,y,TT.BENCH);maybe(cx,cy-2,TT.WALL_BANNER);maybe(cx,cy+2,TT.CRATE);maybe(cx-2,box.y1+2,TT.RUMOR_BED);maybe(cx+2,box.y2-2,TT.RUMOR_BED);
  } else if(t.shape==='office'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.CARPET);ringRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);
   for(const q of [[cx-2,cy-1],[cx+2,cy-1],[cx-2,cy+1],[cx+2,cy+1]])maybe(q[0],q[1],TT.TABLE);maybe(cx,cy,TT.RUMOR);maybe(cx,box.y1+2,TT.RACK);maybe(cx,box.y2-2,TT.RACK);maybe(box.x1+1,cy,TT.RUMOR_INVESTIGATION_BOARD);
  } else if(t.shape==='clinic'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.MOON_STONE);for(const x of [cx-2,cx+2])for(let y=box.y1+2;y<=box.y2-2;y++)if(y!==cy)maybe(x,y,TT.SCREEN);
   maybe(cx,cy,TT.FOUNTAIN);maybe(box.x1+1,cy-2,TT.RUMOR_BED);maybe(box.x1+1,cy+2,TT.RUMOR_BED);maybe(box.x2-1,cy-2,TT.RUMOR_BED);maybe(box.x2-1,cy+2,TT.RUMOR_MED_CABINET);
  } else if(t.shape==='kitchen'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);for(const y of [box.y1+1,box.y2-1])for(let x=box.x1+2;x<=box.x2-2;x++)if((x+y)%2===0)maybe(x,y,TT.TABLE);
   rumorLine(r,r.innerEntry.x,r.innerEntry.y,cx,cy,TT.WOOD_FLOOR);maybe(cx,cy,TT.COOKPOT);maybe(box.x1+1,cy,TT.CRATE);maybe(box.x2-1,cy,TT.CRATE);maybe(cx-2,cy+2,TT.RUMOR_CHARRED_COUNTER);maybe(cx+2,cy-2,TT.RUMOR_CHARRED_COUNTER);
  } else if(t.shape==='jars'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.DARK_WOOD);for(let x=box.x1+1;x<=box.x2-1;x+=2)for(let y=box.y1+1;y<=box.y2-1;y+=2)maybe(x,y,TT.JAR);
   rumorLine(r,r.innerEntry.x,r.innerEntry.y,cx,cy,TT.DARK_WOOD);rumorLine(r,cx,cy,box.x2-1,cy,TT.DARK_WOOD);
  } else if(t.shape==='shrine'){
   fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.GILDED_FLOOR);ringRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.MOON_STONE);
   fillRect(cx-1,cy-1,cx+1,cy+1,TT.ALTAR);for(const q of [[cx-3,cy],[cx+3,cy],[cx,cy-3],[cx,cy+3]])maybe(q[0],q[1],TT.GOLD_LAMP);maybe(cx,cy+3,TT.INCENSE_STAND);maybe(cx,box.y1+2,TT.RUMOR_RITUAL_OBELISK);
  }
 }
 else if(t.shape==='camp'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);for(const q of [[box.x1+1,box.y1+1],[box.x2-1,box.y2-1],[box.x2-1,box.y1+1],[box.x1+1,box.y2-1]])maybe(q[0],q[1],TT.CRATE);
  maybe(cx,cy,TT.BENCH);maybe(cx+2,cy-1,TT.COOKPOT);maybe(cx-2,cy+1,TT.RACK);maybe(cx+2,cy+2,TT.RUMOR_SMUGGLER_BUNDLE);
 }
 else if(t.shape==='cross'){
  fillRect(box.x1,box.y1,box.x2,box.y2,wall);fillRect(cx-1,box.y1+1,cx+1,box.y2-1,f);fillRect(box.x1+1,cy-1,box.x2-1,cy+1,f);
  for(const q of [[cx,box.y1+1],[cx,box.y2-1],[box.x1+1,cy],[box.x2-1,cy]])maybe(q[0],q[1],TT.BRAZIER);for(const q of [[cx-2,cy-2],[cx+2,cy-2],[cx-2,cy+2],[cx+2,cy+2]])maybe(q[0],q[1],TT.CRATE);
 }
 else if(t.shape==='grid'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);for(let x=box.x1+2;x<=box.x2-2;x+=2)for(let y=box.y1+2;y<=box.y2-2;y++)if((x+y)%4!==0)maybe(x,y,wall);
  for(let y=box.y1+2;y<=box.y2-2;y+=2)for(let x=box.x1+2;x<=box.x2-2;x++)if((x+y)%4!==1)maybe(x,y,wall);dropDecor([[box.x1+1,box.y1+1],[box.x2-1,box.y2-1],[box.x1+1,box.y2-1]],TT.CRATE);
 }
 else if(t.shape==='ring'){
  fillRect(box.x1,box.y1,box.x2,box.y2,wall);ringRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,f);ringRect(box.x1+2,box.y1+2,box.x2-2,box.y2-2,f);fillRect(cx-1,cy-1,cx+1,cy+1,wall);dropDecor([[cx-3,cy],[cx+3,cy],[cx,cy-3],[cx,cy+3]],TT.BRAZIER);
 }
 else if(t.shape==='maze'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,wall);for(let y=box.y1+1;y<=box.y2-1;y++)for(let x=box.x1+1;x<=box.x2-1;x++)if(x===box.x1+1||y===box.y1+1||x===box.x2-1||y===box.y2-1||x===cx||y===cy)put(x,y,TT.DARK_WOOD);plusPath(r.innerEntry.x,r.innerEntry.y,cx,cy);dropDecor([[cx,cy],[box.x1+2,box.y2-2],[box.x2-2,box.y1+2]],TT.RACK);
 }
 else if(t.shape==='honey'){
  fillRect(box.x1,box.y1,box.x2,box.y2,wall);
  const cells=[[cx-2,cy-2],[cx+2,cy-2],[cx-2,cy+2],[cx+2,cy+2],[cx,cy]];for(const [mx,my] of cells)fillRect(mx-1,my-1,mx+1,my+1,TT.CARPET);
  for(const [ax,ay,bx,by] of [[cx-2,cy-2,cx,cy],[cx+2,cy-2,cx,cy],[cx-2,cy+2,cx,cy],[cx+2,cy+2,cx,cy]])plusPath(ax,ay,bx,by);dropDecor([[cx-2,cy-2],[cx+2,cy+2]],TT.INCENSE_STAND);
 }
 else if(t.shape==='spiral'){
  fillRect(box.x1,box.y1,box.x2,box.y2,wall);for(let layer=0;layer<3;layer++){const x1=box.x1+1+layer,y1=box.y1+1+layer,x2=box.x2-1-layer,y2=box.y2-1-layer;for(let x=x1;x<=x2;x++)maybe(x,y1,TT.MOON_STONE);for(let y=y1;y<=y2;y++)maybe(x2,y,TT.MOON_STONE);for(let x=x2;x>=x1+(layer<2?1:0);x--)maybe(x,y2,TT.MOON_STONE);if(layer<2)for(let y=y2;y>=y1+2;y--)maybe(x1,y,TT.MOON_STONE)}
  plusPath(r.innerEntry.x,r.innerEntry.y,cx,cy);maybe(cx,cy,TT.PETAL_MAT);
 }
 else if(t.shape==='flood'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WATER);ringRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);
  rumorLine(r,r.innerEntry.x,r.innerEntry.y,cx,cy,TT.WOOD_FLOOR);rumorLine(r,cx,cy,box.x2-1,cy,TT.WOOD_FLOOR);
  for(const q of [[cx-2,cy-2],[cx+2,cy+2],[cx-2,cy+2],[cx+2,cy-2]])fillRect(q[0],q[1],q[0]+1,q[1]+1,TT.MOON_STONE);for(const q of [[box.x1+1,cy],[box.x2-2,cy],[cx,box.y1+1],[cx,box.y2-1]])maybe(q[0],q[1],TT.WOOD_FLOOR);
  dropDecor([[cx-3,cy-2],[cx+3,cy+2]],TT.LOTUS_FLOWER);maybe(cx,cy+2,TT.RUMOR_FLOOD_GRATE);
 }
 else if(t.shape==='gas'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.DARK_WOOD);ringRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.WOOD_FLOOR);
  fillRect(cx-2,cy-1,cx+2,cy+1,TT.FLOOR);for(const q of [[cx-3,cy],[cx+3,cy],[cx,cy-2],[cx,cy+2]])maybe(q[0],q[1],TT.JAR);for(const q of [[box.x1+1,box.y1+1],[box.x2-1,box.y1+1],[box.x1+1,box.y2-1],[box.x2-1,box.y2-1]])maybe(q[0],q[1],TT.IRON_HOOK);dropDecor([[cx-2,cy-2],[cx+2,cy+2]],TT.INCENSE_STAND);maybe(cx-3,cy-2,TT.RUMOR_GAS_PIPE);maybe(cx+3,cy+2,TT.RUMOR_GAS_PIPE);r.hazard1030='gas'
 }
 else if(t.shape==='archive'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.CARPET);for(let y=box.y1+1;y<=box.y2-1;y+=2){for(let x=box.x1+1;x<=box.x2-1;x++)if(x!==cx&&((x+y)%4!==0))maybe(x,y,TT.RACK)}
  rumorLine(r,box.x1+1,cy,box.x2-1,cy,TT.WOOD_FLOOR);maybe(cx,cy,TT.RUMOR);maybe(cx,box.y1+1,TT.TABLE);maybe(cx,box.y2-1,TT.TABLE);maybe(cx-2,cy+2,TT.RUMOR_ARCHIVE_PILE);maybe(cx+2,cy-2,TT.RUMOR_ARCHIVE_PILE)
 }
 else if(t.shape==='silk'){
  fillRect(box.x1+1,box.y1+1,box.x2-1,box.y2-1,TT.CARPET);for(const x of [box.x1+2,cx,box.x2-2])for(let y=box.y1+1;y<box.y2;y++)if(y!==cy)maybe(x,y,TT.SCREEN);
  rumorLine(r,r.innerEntry.x,r.innerEntry.y,cx,cy,TT.CARPET);maybe(cx,cy,TT.MIRROR);for(const q of [[cx-2,cy],[cx+2,cy],[cx,cy-2],[cx,cy+2]])maybe(q[0],q[1],q[0]===cx?TT.PAPER_CRANE:TT.INCENSE_STAND);maybe(cx+2,cy+2,TT.RUMOR_SILK_DIVAN)
 }
 // Reject the old square-box silhouette: carve permanent architectural recesses into the bounding frame.
 const vv0=r.variant1030||0,nearMouth=(x,y)=>Math.abs(x-r.innerEntry.x)+Math.abs(y-r.innerEntry.y)<=2,nearCore=(x,y)=>Math.abs(x-cx)+Math.abs(y-cy)<=1;
 const cut=(x1,y1,x2,y2)=>{for(let y=Math.max(box.y1,y1);y<=Math.min(box.y2,y2);y++)for(let x=Math.max(box.x1,x1);x<=Math.min(box.x2,x2);x++){if(nearMouth(x,y)||nearCore(x,y))continue;setTerrainTile58(state.map,x,y,wall)}};
 const carve=(x1,y1,x2,y2,v=f)=>{for(let y=Math.max(box.y1,y1);y<=Math.min(box.y2,y2);y++)for(let x=Math.max(box.x1,x1);x<=Math.min(box.x2,x2);x++){if(nearMouth(x,y)&&v===wall)continue;setTerrainTile58(state.map,x,y,v)}};
 if(box.w>=7&&box.h>=7){
   const family=t.shape;
   if(['court','supply','office','clinic','shrine'].includes(family)){
     const d=vv0===2?3:2;cut(box.x1,box.y1,box.x1+d-1,box.y1+1);cut(box.x2-d+1,box.y2-1,box.x2,box.y2);
     if(vv0!==1){cut(box.x2-1,box.y1,box.x2,box.y1+d-1);cut(box.x1,box.y2-d+1,box.x1+1,box.y2)}
   }else if(['stash','quarters','camp','kitchen','jars','archive'].includes(family)){
     if(vv0===0){cut(box.x1,box.y1,box.x1+2,cy-2);cut(box.x2-1,cy+2,box.x2,box.y2)}
     else if(vv0===1){cut(box.x2-2,box.y1,box.x2,cy-2);cut(box.x1,cy+2,box.x1+1,box.y2)}
     else{cut(box.x1,box.y1,box.x1+1,box.y1+2);cut(box.x2-1,box.y1,box.x2,box.y1+2);cut(box.x1,box.y2-1,box.x1+2,box.y2)}
   }else if(['cross','grid','maze','honey','spiral'].includes(family)){
     const top=vv0===0?box.x1+1:cx+1,bottom=vv0===1?box.x2-1:cx-1;cut(top,box.y1,Math.min(box.x2,top+2),box.y1+1);cut(Math.max(box.x1,bottom-2),box.y2-1,bottom,box.y2);
     if(family!=='cross'){cut(box.x1,cy-1,box.x1+1,cy+1);cut(box.x2-1,cy-2,box.x2,cy)}
   }else if(['lane','flood','gas','silk'].includes(family)){
     if(dirH){cut(box.x1,box.y1,box.x1+2,box.y1+1);cut(box.x2-2,box.y2-1,box.x2,box.y2);if(vv0===2)cut(cx-1,box.y1,cx+1,box.y1+1)}
     else{cut(box.x1,box.y1,box.x1+1,box.y1+2);cut(box.x2-1,box.y2-2,box.x2,box.y2);if(vv0===2)cut(box.x1,cy-1,box.x1+1,cy+1)}
   }
   if(vv0===3){
     if(['supply','office','clinic','kitchen','archive','jars','gas','flood','silk','shrine','court'].includes(family)){
       if(dirH){wallRect(cx-1,box.y1+1,cx+1,box.y2-3);carve(cx,box.y2-2,cx,box.y2-2)}
       else{wallRect(box.x1+1,cy-1,box.x2-3,cy+1);carve(box.x2-2,cy,box.x2-2,cy)}
     }else if(['ring','maze','grid','cross','honey','spiral'].includes(family)){
       wallRect(cx-1,box.y1+2,cx+1,cy-1);wallRect(cx-1,cy+1,cx+1,box.y2-2);carve(cx,cy-2,cx,cy+2);
     }
   }else if(vv0===4){
     if(dirH){wallRect(box.x1+2,cy-1,cx-1,cy+1);wallRect(cx+1,box.y1+2,box.x2-2,cy-1);carve(cx-1,cy,cx+1,cy)}
     else{wallRect(cx-1,box.y1+2,cx+1,cy-1);wallRect(box.x1+2,cy+1,cx-1,box.y2-2);carve(cx,cy-1,cx,cy+1)}
   }
 }
 r.center={x:cx,y:cy};
 const vv=r.variant1030||0,accent=t.floor==='garden'?TT.LOTUS_FLOWER:t.floor==='gilded'?TT.GOLD_LAMP:t.floor==='carpet'?TT.INCENSE_STAND:t.floor==='moon'?TT.PETAL_MAT:t.floor==='wood'?TT.PAPER_CRANE:t.floor==='dark'?TT.IRON_HOOK:TT.PAPER_CRANE;
 const vp=vv===0?[[box.x1+1,cy],[box.x2-1,cy],[cx,box.y1+1]]:vv===1?[[cx,box.y1+1],[cx,box.y2-1],[box.x1+1,cy]]:vv===2?[[box.x1+1,box.y1+1],[box.x2-1,box.y2-1],[box.x1+1,box.y2-1]]:vv===3?[[box.x1+2,box.y2-2],[cx,box.y2-2],[box.x2-2,box.y2-2]]:[[box.x1+2,box.y1+2],[cx,cy],[box.x2-2,box.y1+2]];for(const [vx,vy]of vp)if(state.map[vy]?.[vx]===f&&!(vx===r.innerEntry.x&&vy===r.innerEntry.y)&&!(vx===cx&&vy===cy))setTerrainTile58(state.map,vx,vy,accent);
 let mx=r.innerEntry.x,my=r.innerEntry.y;for(let step=0;step<6;step++){if(mx<box.x1||mx>box.x2||my<box.y1||my>box.y2)break;const mt=state.map[my]?.[mx];if(!tileBlocks(mt)&&!globalThis.__MANRU_HAZARD_CORE__?.kind?.(mt))break;setTerrainTile58(state.map,mx,my,f);mx+=r.dir.x;my+=r.dir.y}
}
function rumorInteriorSafeCells(r){const out=[];for(let y=r.rect.y1;y<=r.rect.y2;y++)for(let x=r.rect.x1;x<=r.rect.x2;x++){const t=state.map[y]?.[x];if(!tileBlocks(t)&&!globalThis.__MANRU_HAZARD_CORE__?.kind?.(t))out.push({x,y})}return out}
function rumorConnectInterior(r){for(let guard=0;guard<12;guard++){const reach=ReachabilityService.rumorRoomReach({rumorSpaceKey1030},r),safe=rumorInteriorSafeCells(r),missing=safe.filter(q=>!reach.has(rumorSpaceKey1030(q.x,q.y)));if(!missing.length)return true;if(!reach.size)return false;let best=null,bd=Infinity;for(const kk of reach){const [ax,ay]=kk.split(',').map(Number);for(const b of missing){const d=Math.abs(ax-b.x)+Math.abs(ay-b.y);if(d<bd){bd=d;best={ax,ay,bx:b.x,by:b.y}}}}if(!best)return false;let x=best.ax,y=best.ay;const carve=(cx,cy)=>{if(cx<r.rect.x1||cx>r.rect.x2||cy<r.rect.y1||cy>r.rect.y2)return;const t=state.map[cy]?.[cx];if(tileBlocks(t)||globalThis.__MANRU_HAZARD_CORE__?.kind?.(t))setTerrainTile58(state.map,cx,cy,r.floorTile)};const horizontalFirst=((r.variant1030||0)+guard)%2===0;if(horizontalFirst){while(x!==best.bx){x+=Math.sign(best.bx-x);carve(x,y)}while(y!==best.by){y+=Math.sign(best.by-y);carve(x,y)}}else{while(y!==best.by){y+=Math.sign(best.by-y);carve(x,y)}while(x!==best.bx){x+=Math.sign(best.bx-x);carve(x,y)}}}return false}
function rumorValidateShape(r){rumorConnectInterior(r);let reach=ReachabilityService.rumorRoomReach({rumorSpaceKey1030},r),safe=rumorInteriorSafeCells(r),target=r.type.shape==='service'?5:Math.max(5,Math.floor(r.rect.w*r.rect.h*.22));if(reach.size>=target&&reach.size===safe.length)return true;rumorLine(r,r.innerEntry.x,r.innerEntry.y,r.center.x,r.innerEntry.y,r.floorTile);rumorLine(r,r.center.x,r.innerEntry.y,r.center.x,r.center.y,r.floorTile);rumorConnectInterior(r);reach=ReachabilityService.rumorRoomReach({rumorSpaceKey1030},r);safe=rumorInteriorSafeCells(r);return reach.size>=Math.min(target,7)&&reach.size===safe.length}
function rumorEntranceStyle(){return choice(['crack','secret','screen','rack','window'])}
function rumorRegisterCells(r,used){r.cells=[];for(let y=r.rect.y1;y<=r.rect.y2;y++)for(let x=r.rect.x1;x<=r.rect.x2;x++){const kk=rumorSpaceKey1030(x,y);r.cells.push({x,y});used.add(kk);state.seen?.delete?.(kk);state.visible?.delete?.(kk)}for(let y=r.rect.y1-1;y<=r.rect.y2+1;y++)for(let x=r.rect.x1-1;x<=r.rect.x2+1;x++)used.add(rumorSpaceKey1030(x,y));used.add(rumorSpaceKey1030(r.entry.x,r.entry.y))}
function rumorPlaceClue(existing){const reach=finalReachSet1029(),cells=[];for(const kk of reach){const[x,y]=kk.split(',').map(Number),t=state.map[y]?.[x];if(!RUMOR_SPACE_CLUE_TILES().has(t)||Math.abs(x-state.player.x)+Math.abs(y-state.player.y)<8||Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)<5||state.items.some(i=>i.x===x&&i.y===y)||state.monsters.some(m=>monCovers(m,x,y)))continue;if(existing.some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<10))continue;cells.push({x,y})}if(!cells.length)return null;const q=choice(cells);setTerrainTile58(state.map,q.x,q.y,TT.RUMOR);return q}
function rumorRewardProto(kind){const floor=state.floor,food=(CONSUMABLES||[]).filter(i=>i.type==='food'&&!i.craftedOnly57&&!i.naturalOnly57&&(i.minFloor||1)<=floor&&!['신선로','신선도'].includes(i.name)),potion=(window.MANRU_POTIONS||[]).filter(i=>(i.minFloor||1)<=floor),ammo=(window.MANRU_AMMO||[]),tal=(window.MANRU_TALISMANS||[]).filter(i=>(i.minFloor||1)<=floor&&!i.fusion74&&!['upgrade','holy'].includes(i.talismanKind));if(kind==='food')return foodOccurrencePick(food.length?food:potion);if(kind==='medical')return foodOccurrencePick(potion.filter(i=>['heal_small','heal_medium','makgeolli','cleanse','focus'].includes(i.potionKind)).length?potion.filter(i=>['heal_small','heal_medium','makgeolli','cleanse','focus'].includes(i.potionKind)):food);if(kind==='nature')return foodOccurrencePick([...food,...potion.filter(i=>['cleanse','focus'].includes(i.potionKind))]);if(kind==='supply')return foodOccurrencePick([...food,...potion,...ammo]);if(kind==='hazard')return foodOccurrencePick([...potion,...tal]);if(kind==='gear'){const tier=Math.max(1,Math.min(4,Math.ceil(floor/5))),pool=[...WEAPONS.map(x=>({...x,type:'weapon'})),...ARMORS.map(x=>({...x,type:'armor'})),...CLOAKS.map(x=>({...x,type:'cloak'}))].filter(i=>(i.tier||1)<=tier);return foodOccurrencePick(pool)}if(kind==='combat')return foodOccurrencePick([...potion,...ammo,...tal,...food]);if(kind==='scattered')return foodOccurrencePick([...food,...potion,...ammo]);return foodOccurrencePick([...food,...potion,...ammo,...tal])}
function rumorPlaceReward(r,proto,index=0){if(!proto)return false;const reach=ReachabilityService.rumorRoomReach({rumorSpaceKey1030},r),cells=[...reach].map(kk=>{const[x,y]=kk.split(',').map(Number);return{x,y}}).filter(q=>safeFloorTile1020(state.map[q.y]?.[q.x])&&!state.items.some(i=>i.x===q.x&&i.y===q.y)&&!state.monsters.some(m=>monCovers(m,q.x,q.y))&&Math.abs(q.x-r.innerEntry.x)+Math.abs(q.y-r.innerEntry.y)>=2);if(!cells.length)return false;cells.sort((a,b)=>Math.abs(b.x-r.innerEntry.x)+Math.abs(b.y-r.innerEntry.y)-Math.abs(a.x-r.innerEntry.x)-Math.abs(a.y-r.innerEntry.y));const q=cells[Math.min(index,cells.length-1)],it=clone(proto);it.count=it.count||1;it.x=q.x;it.y=q.y;it.rumorSpaceId1030=r.id;if(['weapon','armor','cloak','relic','trinket'].includes(it.type))globalThis.__MANRU_ITEM_IDENTITY991__?.markGear?.(it);return !!PlacementService.placeItem(it,q,{requireReachable:false,restrict:p=>p.x>=r.rect.x1&&p.x<=r.rect.x2&&p.y>=r.rect.y1&&p.y<=r.rect.y2})}
function rumorEnemyDefs(r,ranged=false,elite=false){const floor=state.floor,maxEarly=floor+2,id=r?.type?.id||'',allowed=d=>!d.miniBoss&&!d.summonOnly57&&(!ranged||d.ranged);const ordinary=MONSTERS.filter(d=>allowed(d)&&d.min<=maxEarly&&d.max>=floor);const prefNames=({guard_supply:['수비병','강철이','살라맨더','경비 인형 - 보병','경비 인형 - 포병','성채 비행 감시자','해자 잠복꾼','화염 가고일','녹아내린 슬라임'],crossfire:['수비병','경비 인형 - 포병','성채 비행 감시자','살라맨더','비단 술래','구미호','신전 사제 망령'],duel_ring:['강철이','경비 인형 - 보병','강시','식귀','살라맨더','천수 아수라'],grid_store:['수비병','경비 인형 - 포병','성채 비행 감시자'],guard_quarters:['수비병','경비 인형 - 보병'],gas_chamber:['녹아내린 슬라임','화염 가고일','환각의 향로','살라맨더'],flooded_store:['악어','해자 잠복꾼']})[id]||[];if(!prefNames.length)return ordinary;/* Rumor spaces are deliberate anomalies/previews: their curated residents bypass the ordinary floor-era min/max gate. Only safety exclusions (boss/summon-only) and requested ranged role still apply. */const preferred=MONSTERS.filter(d=>allowed(d)&&prefNames.includes(d.name));if(!preferred.length)return ordinary;const ordinaryUnique=ordinary.filter(d=>!prefNames.includes(d.name)),out=[];const prefWeight=id==='guard_supply'||id==='crossfire'||elite?6:4;for(const d of preferred)for(let i=0;i<prefWeight;i++)out.push(d);for(const d of ordinaryUnique)out.push(d);return out}
function rumorSpawnEnemy(r,ranged=false,elite=false){const defs=rumorEnemyDefs(r,ranged,elite);if(!defs.length)return null;const bag=[...defs],order=[];while(bag.length){const d=bag.splice(Math.floor(globalThis.__MANRU_RANDOM57__()*bag.length),1)[0];if(!order.some(q=>q.name===d.name))order.push(d)}for(const d of order){const m=scaledMonster(d),eraMismatch=d.min>state.floor||d.max<state.floor;if(eraMismatch){m.rumorEraOverride1030=true;m.rumorNativeFloor1030={min:d.min,max:d.max}}if(elite){m.hp=m.maxHp=Math.round(m.maxHp*1.12);m.atk+=1}const all=[...ReachabilityService.rumorRoomReach({rumorSpaceKey1030},r)].map(kk=>{const[x,y]=kk.split(',').map(Number);return{x,y,dist:Math.abs(x-r.innerEntry.x)+Math.abs(y-r.innerEntry.y)}}).filter(q=>PlacementService.canPlaceEntity(m,q.x,q.y));if(!all.length)continue;const far=all.filter(q=>q.dist>=3),pool=(far.length?far:all).sort((a,b)=>b.dist-a.dist),cap=Math.max(1,Math.ceil(pool.length*.35)),q=choice(pool.slice(0,cap));m.x=q.x;m.y=q.y;m.alerted=false;m.spawnProvenance57='rumor-space';m.rumorSpaceId1030=r.id;OccupancyService.addMonster(m);return m}return null}
function rumorPopulate(r){if(r.populated)return;r.populated=true;if(r.type.id==='guard_supply'){rumorSpawnEnemy(r,false,true)}else if(r.type.id==='crossfire'){rumorSpawnEnemy(r,true,false);rumorSpawnEnemy(r,true,false)}else if(r.type.id==='duel_ring'){rumorSpawnEnemy(r,false,true)}else if(r.type.risk>=2){rumorSpawnEnemy(r,false,false)}const n=r.type.reward==='scattered'?4:r.type.risk>=3?choice([2,2,3]):choice([1,2,2,3]);for(let i=0;i<n;i++)rumorPlaceReward(r,rumorRewardProto(r.type.reward),i);if(r.hazard1030==='gas'){const air=[...ReachabilityService.rumorRoomReach({rumorSpaceKey1030},r)].map(kk=>{const[x,y]=kk.split(',').map(Number);return{x,y,d:Math.abs(x-r.center.x)+Math.abs(y-r.center.y)}}).filter(q=>jarGasAirPassable(q.x,q.y)).sort((a,b)=>a.d-b.d);for(const q of air.slice(0,2))spawnJarGasField57(q.x,q.y,{forced:true})}}
function rumorDirection(r){const dx=r.entry.x-state.player.x,dy=r.entry.y-state.player.y,ax=Math.abs(dx),ay=Math.abs(dy);if(ax<=Math.max(1,ay*.45))return dy<0?'북쪽':'남쪽';if(ay<=Math.max(1,ax*.45))return dx<0?'서쪽':'동쪽';return(dy<0?'북':'남')+(dx<0?'서쪽':'동쪽')}
function rumorDistanceBand(r){const d=Math.abs(r.entry.x-state.player.x)+Math.abs(r.entry.y-state.player.y);return d<=10?'가까운 거리':d<=20?'중간 거리':'먼 거리'}
function rumorEntranceClue(style){return({crack:'금이 번진 벽',secret:'희미한 문양이 떠오른 수상한 벽',screen:'뒤쪽에서 빈 울림이 나는 병풍',rack:'벽에서 살짝 들뜬 진열 선반',window:'틀이 미세하게 흔들리는 창호'})[style]||'결이 다른 벽'}
function revealRumorSpace(r){if(!r||r.revealed)return null;r.revealed=true;r.revealedTurn=state.turn||0;r.entry.style=rumorEntranceStyle();const style=r.entry.style;if(style==='secret')setTerrainTile58(state.map,r.entry.x,r.entry.y,TT.SECRET_DOOR);else if(style==='screen'||style==='rack'||style==='window'){setTerrainTile58(state.map,r.entry.x,r.entry.y,style==='screen'?TT.SCREEN:style==='rack'?TT.RACK:TT.WINDOW,{base:TT.WALL,attachment:'secret-wall'})}else setTerrainTile58(state.map,r.entry.x,r.entry.y,TT.WALL);rumorPopulate(r);specialTerrainGrandDress();const dir=rumorDirection(r),band=rumorDistanceBand(r),clue=rumorEntranceClue(style);addLog(`소문 확인 · ${r.type.name} — ${r.type.rumor}`);addLog(`숨은 입구 단서 · 현재 위치 기준 ${dir}, ${band}. ${withJosa57(clue,'을/를')} 찾아 조사하면 입구를 열 수 있다.`);toast(`숨은 공간 단서 · ${r.type.name} · ${dir}의 ${clue}`);rumorNotice(r);burst(state.player.x,state.player.y,'#e1bd73',22,1.02);floatText(state.player.x,state.player.y,'숨은 공간 단서','#f0cf8a',12);flash('#d8b36a',160);vfVibrate(HAPTIC_PATTERN57.toggle);globalThis.__MANRU_SFX54__?.play?.('pickup');if(state.visible.has(K1020(r.entry.x,r.entry.y))){burst(r.entry.x,r.entry.y,'#efd38c',26,1.05);impact(r.entry.x,r.entry.y,'#d8b56f',2.2)}VisibilityService.compute();updateAll();return r}
function rumorRevealNext(){const hidden=(state?.rumorSpaces1030||[]).filter(r=>!r.revealed);if(!hidden.length)return null;return revealRumorSpace(choice(hidden))}
function rumorOpenEntranceAt(x,y,t,act){const r=rumorSpaceByEntry(x,y);if(!r||r.opened)return null;const style=r.entry.style;if(style==='crack'&&t!==TT.WALL)return null;if(style==='secret'&&t!==TT.SECRET_DOOR)return null;if(style==='screen'&&t!==TT.SCREEN)return null;if(style==='rack'&&t!==TT.RACK)return null;if(style==='window'&&t!==TT.WINDOW)return null;r.opened=true;r.openedTurn=state.turn||0;if(style==='screen'||style==='rack'||style==='window')releaseTerrainUnderlay58(x,y,style==='screen'?r.floorTile:TT.WALL);setTerrainTile58(state.map,x,y,style==='screen'?r.floorTile:TT.OPEN_DOOR);doorFX(x,y);burst(x,y,style==='screen'?'#c86e59':'#d7b66e',16,.8);const msg=style==='rack'?'기울어진 선반을 밀자 뒤의 통로가 열렸다.':style==='window'?'창호 틀을 밀어 숨은 틈을 열었다.':style==='screen'?'병풍을 젖히자 벽 뒤의 공간이 이어졌다.':style==='crack'?'금 간 벽을 밀자 얇은 벽체가 안쪽으로 무너졌다.':'벽 문양이 갈라지며 숨은 문이 열렸다.';addLog(`${r.type.name} · ${msg}`);toast(`${r.type.name} 입구 개방`);globalThis.__MANRU_SFX54__?.play?.('door');commitPlayerAction57(act,1);VisibilityService.compute();updateAll();return{handled:true,result:true,room:r}}
function rumorDrawEntranceOverlay(ctx,tile,px,py,x,y,now){const r=rumorSpaceByEntry(x,y);if(!r||r.opened||!state.seen.has(rumorSpaceKey1030(x,y)))return false;ctx.save();const pulse=.5+.5*Math.sin(now/330+x*.7+y*.9),a=.74+.20*pulse;ctx.globalAlpha=a;ctx.lineWidth=2;ctx.strokeStyle='#edc777';ctx.fillStyle=`rgba(220,171,86,${.08+.08*pulse})`;ctx.fillRect(px+3,py+3,26,26);ctx.strokeRect(px+3.5,py+3.5,25,25);ctx.strokeStyle='rgba(255,229,154,.92)';ctx.lineWidth=2.2;const c=7;ctx.beginPath();ctx.moveTo(px+c,py+3);ctx.lineTo(px+3,py+3);ctx.lineTo(px+3,py+c);ctx.moveTo(px+32-c,py+3);ctx.lineTo(px+29,py+3);ctx.lineTo(px+29,py+c);ctx.moveTo(px+3,py+32-c);ctx.lineTo(px+3,py+29);ctx.lineTo(px+c,py+29);ctx.moveTo(px+32-c,py+29);ctx.lineTo(px+29,py+29);ctx.lineTo(px+29,py+32-c);ctx.stroke();ctx.fillStyle=`rgba(255,215,126,${.38+.22*pulse})`;ctx.beginPath();ctx.moveTo(px+16,py+9);ctx.lineTo(px+21,py+16);ctx.lineTo(px+16,py+23);ctx.lineTo(px+11,py+16);ctx.closePath();ctx.fill();ctx.strokeStyle='#f2d18a';ctx.lineWidth=1.4;if(r.entry.style==='crack'){ctx.beginPath();ctx.moveTo(px+8,py+5);ctx.lineTo(px+15,py+12);ctx.lineTo(px+12,py+18);ctx.lineTo(px+22,py+27);ctx.moveTo(px+15,py+12);ctx.lineTo(px+24,py+8);ctx.stroke()}else if(r.entry.style==='rack'){for(const yy of[9,14,19,24]){ctx.beginPath();ctx.moveTo(px+8,py+yy);ctx.lineTo(px+24,py+yy);ctx.stroke()}}else if(r.entry.style==='window'){ctx.strokeRect(px+9.5,py+8.5,13,16);ctx.beginPath();ctx.moveTo(px+16,py+9);ctx.lineTo(px+16,py+24);ctx.moveTo(px+10,py+16);ctx.lineTo(px+22,py+16);ctx.stroke()}else if(r.entry.style==='screen'){ctx.beginPath();ctx.moveTo(px+10,py+7);ctx.lineTo(px+10,py+25);ctx.moveTo(px+16,py+7);ctx.lineTo(px+16,py+25);ctx.moveTo(px+22,py+7);ctx.lineTo(px+22,py+25);ctx.stroke()}ctx.restore();return true}
function generateRumorSpaces(opts={}){state.rumorSpaces1030=[];state.rumorSpaceClues1030=[];state.rumorSpaceAudit1030={eligible:rumorSpaceEligible(),rolled:false,requested:0,built:0};if(!rumorSpaceEligible())return state.rumorSpaceAudit1030;const forced=!!opts.force,roll=forced||globalThis.__MANRU_RANDOM57__()<.35;if(!roll)return state.rumorSpaceAudit1030;let count=opts.count??(1+(globalThis.__MANRU_RANDOM57__()<.12?1:0));count=Math.max(1,Math.min(2,count));state.rumorSpaceAudit1030.rolled=true;state.rumorSpaceAudit1030.requested=count;const used=new Set();for(let i=0;i<count;i++){const rejected=new Set(used);let built=false;for(let attempt=0;attempt<18&&!built;attempt++){const typePool=rumorTypePool(opts.forceType&&i===0?opts.forceType:null);if(!typePool.length)break;const cand=rumorPickCandidate(rejected,i===0);if(!cand)break;const type=choice(typePool),r={id:`rumor-${state.floor}-${i}-${Math.floor(globalThis.__MANRU_RANDOM57__()*1e9)}`,typeId:type.id,type,rect:cand.rect,entry:{x:cand.door.x,y:cand.door.y,outX:cand.out.x,outY:cand.out.y,style:null},dir:cand.dir,variant1030:Math.floor(globalThis.__MANRU_RANDOM57__()*5),revealed:false,opened:false,populated:false,cells:[]};rumorBuildShape(r);if(!rumorValidateShape(r)){for(let y=r.rect.y1;y<=r.rect.y2;y++)for(let x=r.rect.x1;x<=r.rect.x2;x++)setTerrainTile58(state.map,x,y,TT.WALL);for(let y=r.rect.y1-1;y<=r.rect.y2+1;y++)for(let x=r.rect.x1-1;x<=r.rect.x2+1;x++)rejected.add(rumorSpaceKey1030(x,y));rejected.add(rumorSpaceKey1030(r.entry.x,r.entry.y));continue}rumorRegisterCells(r,used);state.rumorSpaces1030.push(r);built=true}}for(let i=0;i<state.rumorSpaces1030.length;i++){const q=rumorPlaceClue(state.rumorSpaceClues1030);if(q)state.rumorSpaceClues1030.push(q)}state.rumorSpaceAudit1030.built=state.rumorSpaces1030.length;state.rumorSpaceAudit1030.types=state.rumorSpaces1030.map(r=>r.typeId);state.rumorSpaceAudit1030.clues=state.rumorSpaceClues1030.length;return state.rumorSpaceAudit1030}
function rumorAudit(){if(!state)return{ok:false,reason:'no-state'};const spaces=state.rumorSpaces1030||[],ordinary=rumorSpaceEligible(),problems=[],worldReach=finalReachSet1029(),rooms=[];for(const r of spaces){if(!ordinary)problems.push(`${r.id}:non-ordinary`);if(state.map[r.entry.y]?.[r.entry.x]!==TT.WALL&&!r.revealed)problems.push(`${r.id}:leaked-entry`);const local=ReachabilityService.rumorRoomReach({rumorSpaceKey1030},r);if(local.size<3)problems.push(`${r.id}:bad-interior`);if(!r.revealed&&(r.cells||[]).some(q=>state.seen?.has(rumorSpaceKey1030(q.x,q.y))))problems.push(`${r.id}:seen-before-reveal`);if(!r.revealed&&(r.cells||[]).some(q=>state.visible?.has(rumorSpaceKey1030(q.x,q.y))))problems.push(`${r.id}:visible-before-reveal`);for(const it of state.items||[])if(it.rumorSpaceId1030===r.id&&!r.revealed)problems.push(`${r.id}:content-before-reveal`);for(const m of state.monsters||[])if(m.rumorSpaceId1030===r.id&&!r.revealed)problems.push(`${r.id}:monster-before-reveal`);rooms.push({id:r.id,type:r.typeId,variant:r.variant1030??0,revealed:!!r.revealed,opened:!!r.opened,entry:{...r.entry},rect:{...r.rect},inner:{...r.innerEntry},center:{...r.center},entryTile:state.map[r.entry.y]?.[r.entry.x],centerReach:worldReach.has(rumorSpaceKey1030(r.center.x,r.center.y)),items:(state.items||[]).filter(i=>i.rumorSpaceId1030===r.id).map(i=>i.name),monsters:(state.monsters||[]).filter(m=>m.rumorSpaceId1030===r.id).map(m=>m.name),innerEntryReach:worldReach.has(rumorSpaceKey1030(r.innerEntry.x,r.innerEntry.y)),worldInteriorReach:(r.cells||[]).filter(q=>worldReach.has(rumorSpaceKey1030(q.x,q.y))).length,itemsReachable:(state.items||[]).filter(i=>i.rumorSpaceId1030===r.id).every(i=>worldReach.has(rumorSpaceKey1030(i.x,i.y))),seenInterior:(r.cells||[]).filter(q=>state.seen?.has(rumorSpaceKey1030(q.x,q.y))).length,visibleInterior:(r.cells||[]).filter(q=>state.visible?.has(rumorSpaceKey1030(q.x,q.y))).length,localReach:local.size})}return{ok:!problems.length,eligible:ordinary,count:spaces.length,hidden:spaces.filter(r=>!r.revealed).length,revealed:spaces.filter(r=>r.revealed).length,opened:spaces.filter(r=>r.opened).length,types:spaces.map(r=>r.typeId),clues:(state.rumorSpaceClues1030||[]).length,rooms,problems}}
function rumorQAGenerate(floor=1,type=null,count=1){state.floor=Math.max(1,Math.min(25,Math.floor(floor)));NormalFloorGenerator.generate();const before=structuredClone(state.rumorSpaceAudit1030||{});if(!rumorSpaceEligible())return{before,audit:rumorAudit()};if(!state.rumorSpaces1030?.length||type){/* QA only: rebuild the extension on the current finalized ordinary map. */for(const r of state.rumorSpaces1030||[])for(const q of r.cells||[])if(state.map[q.y]?.[q.x]!==TT.WALL)setTerrainTile58(state.map,q.x,q.y,TT.WALL);generateRumorSpaces({force:true,count,forceType:type});specialTerrainGrandDress()}return{before,audit:rumorAudit(),spaces:(state.rumorSpaces1030||[]).map(r=>({id:r.id,type:r.typeId,name:r.type.name,entry:r.entry,rect:r.rect,revealed:r.revealed}))}}
function specialTerrainGrandDress(){if(!state||!state.map)return{ok:false,reason:'no-state'};state.subthemeWalls970=state.subthemeWalls970||{};const key=(x,y)=>`${x},${y}`,floorish=t=>[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR].includes(t),quiet=(x,y)=>!(state.items||[]).some(i=>i.x===x&&i.y===y)&&!(state.monsters||[]).some(m=>monCovers(m,x,y))&&!(state.player?.x===x&&state.player?.y===y)&&!(state.stairs?.x===x&&state.stairs?.y===y),setWall=(x,y,style)=>{if(x>0&&y>0&&x<COLS-1&&y<ROWS-1&&state.map[y]?.[x]===TT.WALL)state.subthemeWalls970[key(x,y)]=style},setDecor=(x,y,t)=>{if(x>0&&y>0&&x<COLS-1&&y<ROWS-1&&floorish(state.map[y]?.[x])&&quiet(x,y)){const base=state.map[y][x];rememberTerrainUnderlay58(x,y,base);setTerrainTile58(state.map,x,y,t)}};const markRumor=(r,style)=>{if(!r||!style)return;for(let y=r.rect.y1-1;y<=r.rect.y2+1;y++)for(let x=r.rect.x1-1;x<=r.rect.x2+1;x++)if(x<r.rect.x1||x>r.rect.x2||y<r.rect.y1||y>r.rect.y2)setWall(x,y,style)};for(const r of state.rumorSpaces1030||[]){if(!r.revealed)continue;const style=r.hazard1030==='gas'?'rumor_gas':r.type.shape==='flood'?'rumor_flood':r.type.shape==='silk'?'rumor_silk':r.type.shape==='shrine'?'rumor_shrine':r.type.floor==='garden'?'rumor_garden':r.type.floor==='moon'?'rumor_moon':r.type.floor==='wood'?'rumor_store':'rumor_archive';markRumor(r,style)}const defs=[{tile:TT.WATER,style:'haz_water',decor:[TT.LOTUS_FLOWER,TT.PETAL_MAT]},{tile:TT.LAVA,style:'haz_lava',decor:[TT.GOLD_LAMP,TT.IRON_HOOK]},{tile:TT.MERCURY,style:'haz_mercury',decor:[TT.PAPER_CRANE,TT.INCENSE_STAND]},{tile:TT.VOID,style:'haz_void',decor:[TT.INCENSE_STAND,TT.PAPER_CRANE]}];for(const def of defs){const spots=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y]?.[x]===def.tile){for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)setWall(x+ox,y+oy,def.style);for(const[dx,dy]of DIRS4){const qx=x+dx,qy=y+dy;if(floorish(state.map[qy]?.[qx])&&quiet(qx,qy))spots.push({x:qx,y:qy})}}const seen=new Set();for(const s of spots){const kk=key(s.x,s.y);if(seen.has(kk))continue;seen.add(kk);if((s.x+s.y)%3===0)setDecor(s.x,s.y,def.decor[(s.x+s.y)&1])}}return{ok:true,wallThemes:Object.keys(state.subthemeWalls970||{}).length}}
function cloneTerrainMap58(map){
 const copy=map.map(row=>row.slice()),layers=terrainMapLayers58(map);
 TERRAIN_MAP_LAYERS58.set(copy,{underlay:{...layers.underlay},attachment:{...layers.attachment},pending:true});return copy;
}
const SHOP_RULES58=Object.freeze([
 {name:'장부지기',room:'장부방',tierCap:2,size:[19,23],merchant:[9,3],entry:[9,21],exit:[15,4],weights:{weapon:3,armor:4,cloak:2,relic:2,trinket:1,potion:5,talisman:4,food:1},fusionChance:.06},
 {name:'장물아비',room:'은밀한 노점',tierCap:3,size:[21,23],merchant:[14,4],entry:[10,21],exit:[3,3],weights:{weapon:5,armor:2,cloak:3,relic:4,trinket:2,potion:2,talisman:3,food:1},fusionChance:.12},
 {name:'구미호',room:'비단 객실',tierCap:4,size:[21,25],merchant:[10,3],entry:[10,23],exit:[17,4],weights:{weapon:1,armor:1,cloak:3,relic:2,trinket:2,potion:5,talisman:8,food:1},fusionChance:.16},
 {name:'도깨비 보부상',room:'밀거래 창고',tierCap:4,size:[23,23],merchant:[16,4],entry:[11,21],exit:[4,3],weights:{weapon:6,armor:4,cloak:3,relic:3,trinket:1,potion:3,talisman:5,food:1},fusionChance:.10}
]);
function shopEligible58(item,afterFloor,theme){
 const rule=SHOP_RULES58[theme];if(!rule||afterFloor!==(theme+1)*5||!item)return false;
 if(!['weapon','armor','cloak','relic','trinket','potion','talisman','food'].includes(item.type))return false;
 if(item.jarOnly57||item.artifactWeapon46||item.legendaryWeapon47||item.artifactId46||item.storyId||item.storyItem||item.debug||item.debugOnly||item.keyId||item.foodKind==='coin_candy'||item.cookingOnly57)return false;
 if(item.fusion74&&!(globalThis.__MANRU_TALISMAN74_ACTIONS__?.shopCandidates?.()||[]).some(i=>i.talismanKind===item.talismanKind))return false;
 if(!['common','rare','relic','sealed'].includes(item.rarity)||/(?:열쇠|디버그)/.test(item.name||''))return false;
 if((item.minFloor||1)>afterFloor+1||(item.maxFloor&&item.maxFloor<afterFloor))return false;
 if(['weapon','armor','cloak'].includes(item.type)&&((item.tier||1)>rule.tierCap||(item.rarity==='sealed'&&theme<2)))return false;
 if(item.rarity==='sealed'&&theme===0)return false;
 return true;
}
  /* ---------- geometry ---------- */
  const in60=(x,y)=>x>0&&y>0&&x<COLS-1&&y<ROWS-1;
  const in85=(x,y)=>x>0&&y>0&&x<COLS-1&&y<ROWS-1;
  const key85=(x,y)=>`${x},${y}`;
  function keyMeta96(id){return KEY_TYPES.find(k=>k.id===id)||KEY_TYPES[0]}
  function doorPos96(x,y){return state?.keyPlan96?.doors?.find(d=>d.x===x&&d.y===y&&d.open!==true)||null}
  function ensureStrictLocks96(opts={}){
    const count=LOCK_SPECIAL.get(state?.floor)||LOCK_NORMAL.get(state?.floor)||0;
    if(!state||!count)return{floor:state?.floor||0,required:false,ok:true};
    const existing=auditKeyPlanLocks(state.keyPlan96),progressed=lockPlanProgressed96(state.keyPlan96);
    if(progressed&&!opts.force)return{...(existing||{}),floor:state.floor,required:true,progressed:true,skipped:true,ok:true};
    if(existing?.ok){state.strictLockAudit1004={...existing,floor:state.floor,required:true,repaired:false};return state.strictLockAudit1004}
    if(state.floor===24){state.strictLockAudit1004={...(existing||{}),floor:24,required:true,repaired:false};return state.strictLockAudit1004}
    stripLockPlan96(state.keyPlan96);
    const base=cloneTerrainMap58(state.map),layout=state.layoutName||'';let audit=null,ok=false,attempts=0;
    for(let i=0;i<6&&!ok;i++){
      attempts=i+1;state.map=cloneTerrainMap58(base);state.layoutName=layout;state.keyPlan96=null;
      try{installLockPlan()}catch(_){state.keyPlan96=null}
      audit=auditKeyPlanLocks(state.keyPlan96);ok=!!audit?.ok;
    }
    if(!ok&&state.floor===2){state.map=cloneTerrainMap58(base);state.keyPlan96=null;return{floor:2,required:true,ok:false,reason:'authored-choice-layout-rejected',audit}}
    if(!ok){state.map=cloneTerrainMap58(base);state.layoutName=layout;state.keyPlan96=null;try{exitVestibule(Math.min(count,KEY_TYPES.length),base)}catch(error){ignoreError('exit vestibule repair failed; the lock audit that follows reports the result',error)}audit=auditKeyPlanLocks(state.keyPlan96);ok=!!audit?.ok}
    state.strictLockAudit1004={...(audit||{}),floor:state.floor,required:true,progressed:false,repaired:true,repairAttempts:attempts,ok};
    try{VisibilityService.compute()}catch(error){ignoreError('visibility recompute after the repair attempt',error)}
    return state.strictLockAudit1004;
  }
const clamp1020=(v,a,b)=>Math.max(a,Math.min(b,v));
const inside1020=(x,y)=>x>0&&y>0&&x<COLS-1&&y<ROWS-1;
const HAZ1020=()=>new Set([TT.WATER,TT.MERCURY,TT.LAVA,TT.VOID,TT.DRAWBRIDGE_UP].filter(v=>v!=null));
function reachableSet1020(opts={}){return ReachabilityService.playerSearch(opts.start||state.player,opts).cells}
function reach1020(p,opts={}){return !!p&&reachableSet1020(opts).has(K1020(p.x,p.y))}
function specialBlendOverlay1020(tile,px,py,x,y,now,r){if(!state)return;if((tile===TT.WATER||tile===TT.MERCURY)&&inside1020(x,y)){X.save();for(const[dx,dy,d]of[[-1,0,'L'],[1,0,'R'],[0,-1,'U'],[0,1,'D']]){const n=state.map[y+dy]?.[x+dx];if(GRAD_TERRAIN1025.has(n)&&!objectAt1025(x+dx,y+dy)){const col=state.branchContext105?branchDistrictAt(x+dx,y+dy).floor:regionOfFloor()===1?'#4d6848':regionOfFloor()===4?'#756d3c':'#655646',C=rgb1020(col);let g;if(d==='L')g=X.createLinearGradient(px,py,px+20,py);else if(d==='R')g=X.createLinearGradient(px+32,py,px+12,py);else if(d==='U')g=X.createLinearGradient(px,py,px,py+20);else g=X.createLinearGradient(px,py+32,px,py+12);g.addColorStop(0,`rgba(${C[0]},${C[1]},${C[2]},.32)`);g.addColorStop(1,`rgba(${C[0]},${C[1]},${C[2]},0)`);X.fillStyle=g;if(d==='L')X.fillRect(px,py,20,32);else if(d==='R')X.fillRect(px+12,py,20,32);else if(d==='U')X.fillRect(px,py,32,20);else X.fillRect(px,py+12,32,20)}}X.restore()}}
function hash1022(v=''){let h=2166136261>>>0;for(const ch of String(v)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h>>>0}
function themePatternPass1022(){
  state.floorPattern1022={};state.rugPattern1022={};const z=regionOfFloor(),kind=['inn','garden','silk','store','gold'][z],symCritical=new Set([4,5,15,20,22,24]).has(state.floor);
  const rooms=(state.rooms||[]).filter(r=>r&&r.w>=8&&r.h>=7&&Number.isFinite(r.x)&&!roomHas1022(r,state.player.x,state.player.y,2)&&!roomHas1022(r,state.stairs.x,state.stairs.y,2));
  let n=0;for(const r of rooms.sort((a,b)=>(b.w*b.h)-(a.w*a.h))){if(n>=6)break;if((hash1022(floorSeedKey(`motif:${r.x},${r.y}`))%100)<36)continue;for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(inside1020(x,y)&&basicFloor1022(state.map[y][x]))state.floorPattern1022[K1020(x,y)]={kind,rx:x-r.x,ry:y-r.y,w:r.w,h:r.h,phase:n};
    // Every theme can own a carpet/rug variant even when the structural floor tile itself is not CARPET.
    if(!symCritical&&r.w>=11&&r.h>=9){const rw=Math.min(9,r.w-4),rh=Math.min(5,r.h-4),x0=r.cx-Math.floor(rw/2),y0=r.cy-Math.floor(rh/2);for(let y=y0;y<y0+rh;y++)for(let x=x0;x<x0+rw;x++)if(inside1020(x,y)&&basicFloor1022(state.map[y][x]))state.rugPattern1022[K1020(x,y)]={kind,rx:x-x0,ry:y-y0,w:rw,h:rh}}
    n++;
  }state.themeMotifCount1022=n;
}
/* r42: final-pipeline restaurant annexes. This lives beside the canonical wall-library pass so later
   region architecture cannot erase it. It deliberately subdivides only a corner/side slice of a normal
   room; it never replaces the full room and never runs on boss/special floors. */
const RESTAURANT_VARIANTS42=['객잔 식당','작은 주방','배식실','술상방','찬방'];
function rectOverlap42(a,b,pad=0){return !(a.x+a.w+pad<=b.x||b.x+b.w+pad<=a.x||a.y+a.h+pad<=b.y||b.y+b.h+pad<=a.y)}
function placeRestaurantRewards42(fr){
  const put=(salt)=>{const q=restaurantRewardSpot(fr,salt);if(!q)return false;const name=foodOccurrencePick(RESTAURANT_FOODS,hash1022(`${restaurantSeed()}:${state.floor}:food:${salt}`)/4294967296),def=CONSUMABLES.find(v=>v.name===name);if(!def)return false;PlacementService.placeItem({...structuredClone(def),x:q.x,y:q.y,count:1,restaurantReward42:true,restaurantId42:fr.restaurantId42});return true};
  if(!put(0))return false;fr.rewardCount42=1;if(hash1022(`${restaurantSeed()}:${state.floor}:food2`)%100<28&&put(1))fr.rewardCount42=2;return true;
}
function spawnRestaurantMonsters42(fr){
  if(fr.theme42!==0)return 0;const h=hash1022(`${restaurantSeed()}:${state.floor}:restaurant-mon`)%100;if(h<65)return 0;const names=[...RESTAURANT_MONSTERS42],n=h>=90?2:1;let made=0;
  for(let i=0;i<n;i++){const q=restaurantMonsterSpot(fr,i);if(!q)break;const name=names[hash1022(`${state.floor}:${fr.x}:${i}:restaurant-name`)%names.length],m=spawnNamed(name,q);if(m){m.restaurant42=true;made++}}
  return made;
}
function makeRestaurant42({force=false,variant=null}={}){
  state.restaurantRooms42=[];if(!restaurantEligibleFloor()||(!force&&!restaurantTargetFloor()))return false;
  const external=[],inset=[],broad=[];
  const preReach=restaurantReachSet();
  for(const r of state.rooms||[]){
    if(!restaurantRoomCritical(r)){
      for(const a of restaurantPlansFinal(r))if(restaurantPlanClear(a))external.push({r,a,score:10000+(a.w*a.h)+Math.min(r.w,r.h)});
      for(const a of restaurantInsetPlans(r))if(restaurantInsetClear(a,r))inset.push({r,a,score:(r.w*r.h)-(a.w*a.h)});
    }else if(restaurantBroadHost(r)){
      for(const q of restaurantBroadInsetPlans(r,preReach))broad.push({r,a:q.a,score:q.score});
    }
  }
  // Try the tiers in order rather than discarding later fallbacks merely
  // because an earlier tier had candidates that fail the final reach audit.
  const candidates=[
    ...external.sort((a,b)=>b.score-a.score).slice(0,12),
    ...inset.sort((a,b)=>b.score-a.score).slice(0,12),
    ...broad.sort((a,b)=>b.score-a.score).slice(0,12)
  ];
  for(const c of candidates){
    const a=c.a,snap=restaurantSnapshot(a),fr={name:restaurantVariant(variant),restaurant42:true,restaurantId42:`${state.floor}:${a.x},${a.y}`,x:a.x,y:a.y,w:a.w,h:a.h,cx:a.x+Math.floor(a.w/2),cy:a.y+Math.floor(a.h/2),side42:a.side,inset42:!!a.inset42,theme42:regionOfFloor(),host42:{x:c.r.x,y:c.r.y,w:c.r.w,h:c.r.h},door42:restaurantDoor(a),snapshot42:snap};
    paintRestaurantFinal(fr);
    const reach=restaurantReachSet(),insideReach=[...reach].some(kk=>{const[x,y]=kk.split(',').map(Number);return restaurantInside(fr,x,y,1)});
    if(!reach.has(K1020(state.stairs.x,state.stairs.y))||!insideReach||fr.cookCluster42.length<2||!ReachabilityService.finalComponents({finalReachSet1029,inside1020,HAZ1020,K1020,stairMarkerState1029,finalExitReach1029}).ok||(state.keyPlan96&&lockAudit96()?.ok===false)){restoreRestaurantSnapshot42(snap);continue}
    state.restaurantRooms42=[fr];state.featureRooms=state.featureRooms||[];state.featureRooms.push(fr);
    if(!placeRestaurantRewards42(fr)){removeRestaurant42();continue}
    spawnRestaurantMonsters42(fr);sanitizeRestaurantMonsters42();return true;
  }
  return false;
}
function wallLibraryOverlay1022(px,py,x,y,colors){
 if(state&&!state.artifactDungeon46&&(regionOfFloor()===1||state.floor===24)){
  X.save();X.fillStyle='#1d2c26';X.fillRect(px,py,32,32);
  for(let row=0;row<3;row++){const yy=row*10+2,offset=((y*3+row)%2)*16;for(let bx=-offset;bx<32;bx+=32){const left=Math.max(0,bx+1),right=Math.min(32,bx+31),h=hash1022(`${x*32+bx}:${y*3+row}:brick51`);X.fillStyle=['#42574b','#4b5e50','#536252','#3e5147','#4b5a4b'][h%5];X.fillRect(px+left,py+yy,right-left,8);X.fillStyle='#6b7b65';X.fillRect(px+left,py+yy,right-left,1);X.fillStyle='#293c31';X.fillRect(px+left,py+yy+7,right-left,1);if(right-left>10){X.fillStyle='rgba(162,160,125,.20)';X.fillRect(px+left+3,py+yy+3,3,1);if(h%4===0){X.fillStyle='#324c35';X.fillRect(px+left+5,py+yy+6,6,2)}}}}
  const wall=(a,b)=>state.map[b]?.[a]===TT.WALL;
  if(!wall(x,y-1)){X.fillStyle='#75806c';X.fillRect(px,py,32,3);X.fillStyle='#364b3f';X.fillRect(px,py+3,32,2)}
  if(!wall(x-1,y)){X.fillStyle='#74836c';X.fillRect(px,py+4,2,27)}
  if(!wall(x+1,y)){X.fillStyle='#1b2a23';X.fillRect(px+30,py+4,2,28)}
  if(!wall(x,y+1)){X.fillStyle='#1a2822';X.fillRect(px,py+29,32,3)}X.restore();
 }
 drawSpecialMaterial(px,py,x,y,true);
 if(!state||!Array.isArray(state.bookWalls1022)||!state.bookWalls1022.includes(K1020(x,y)))return;const h=hash1022(`${state.floor}:${x}:${y}`),z=regionOfFloor(),woods=['#603b22','#47543a','#5b354a','#4a4039','#5c4826'],wood=woods[z];X.save();X.imageSmoothingEnabled=false;X.fillStyle='#160d08';X.fillRect(px+2,py+3,28,28);X.fillStyle=wood;X.fillRect(px+4,py+4,24,24);X.fillStyle=z===4?'#b08a3c':'#9a6736';for(const yy of [5,13,21,28])X.fillRect(px+5,py+yy,22,2);const cols=z===1?['#365c50','#8b6b39','#594a31','#6d7a4e','#3b555c']:z===2?['#713f63','#9b5e68','#4e5268','#8e743d','#573f60']:z===3?['#6d4c35','#4e5558','#8c673c','#3e474a','#7c493c']:z===4?['#765126','#a28137','#504027','#8e6931','#65471f']:['#7d2f2d','#345d63','#8b6a30','#5d3b67','#47643e'];for(let row=0;row<3;row++){let xx=6,idx=(h+row*7)%cols.length;while(xx<27){const bw=2+((h+xx+row)%3),bh=4+((h+row*13+xx)%3);X.fillStyle='#110b07';X.fillRect(px+xx-1,py+8+row*8+(6-bh),bw+1,bh+1);X.fillStyle=cols[idx%cols.length];X.fillRect(px+xx,py+8+row*8+(6-bh),bw,bh);xx+=bw+1;idx++}}X.fillStyle='rgba(255,218,145,.16)';X.fillRect(px+5,py+4,1,24);X.fillStyle='rgba(0,0,0,.42)';X.fillRect(px+3,py+29,27,3);X.restore();}
function applyArchitecture1020(){if(state?.specialFloor&&[23,24].includes(state.floor)){try{vfBuildDecor?.()}catch(error){ignoreError('special-floor decor rebuild failed; decor stays as generated',error)}VisibilityService.compute();const specialProgression=globalThis.__MANRU_SPECIAL_FLOORS60__?.validate?.()||null,stateLock=state.floor===24?lockAudit96()||null:null;state.architecture1020={build:BUILD1020,assets:BUILD1022,lock:stateLock,topology:{ok:specialProgression?.ok!==false,specialProgression57:specialProgression},rumorSpaces:null,floor21BlinkChoice:null};return true}
  if(!state)return false;
  // Per-floor append metadata must never leak across descents.  A stale boss/key gate from the previous floor can
  // otherwise turn an unrelated tile into a wall on the next floor.
  state.restaurantRooms42=[];state.bossExitGate1020=null;state.f20RewardSpots1020=null;state.f20Chambers1020=null;state.f20Furnaces1020=null;state.f20MazeZones1020=null;state.f20WoodWings1020=null;state.f20KeyDepth1020=null;state.f20BossLock1020=null;state.f20Content1020=null;state.ironGate18_1020=null;state.midGate22_1020=null;state.midKey22_1020=null;state.deepKey24_1020=null;state.outdoorGate24_1020=null;state.goldIndoor1020=false;state.archDecor1020={};state.archDecor1023={};state.f6Elite1023=null;state.f6Prize1023=null;state.f6LibraryPrizeR8=null;state.f6LibraryGateR8=null;state.f6LibraryKeyR8=null;state.floor6GrandLibraryR8=null;state.libraryDesks52=null;state.floor6WaterBalanceR8=null;state.f22HolyCells1023=[];state.theme2RoomIdentity1027=null;state.theme2Symmetry1027=null;state.floor8GardenCourts1028=null;state.buildingPartition1026=null;state.monsterCrowding1027=null;state.formalSymmetry1029=null;state.decorCanonical1029=null;state.decorRouteRepair1029=null;state.rumorSpaces1030=[];state.rumorSpaceClues1030=[];state.rumorSpaceAudit1030=null;state.stairMarkerAudit1029=null;
  const saved=snapshotEntities1020();clearEntities1020();if([18,20,22,24].includes(state.floor))clearOldKeyTiles();
  // GEOMETRY FIRST: all wall carving, rooms, corridors and stairs are final before any key/item/monster placement.
  buildArchitecture();if(state.floor===6){buildFloor6GrandLibraryR();rebalanceFloor6WaterR8(.27)}if(state.floor===8)shapeFloor8Garden1028();refineTheme2Rooms1027();buildSpecialPlaces();subdivideOpenBuildings1026();normalizeGrass1020();semanticDoorCleanup();repairBlockingPhysicalDecor1029();pruneOrphanDoors();if(![4,5,6,8,11,15,16,18,20,22,23,24].includes(state.floor)){window.__MANRU_RUNTIME81__?.Integrity81?.repair?.();}semanticDoorCleanup();pruneOrphanDoors();
  connectArchitectureRooms51();finishEntryDocumentDoors67();
  // LOCK PLAN SECOND: key doors are part of map subdivision, not a late decoration pass.
  let lock=null;if(state.floor===18)installPendingCustomLocks();else if(state.floor===20){installFloor20BossKeys();lock=lockAudit96()||null}else if(state.floor===22){clearOldKeyTiles();state.keyPlan96=null}else if(strictLockFloors().includes(state.floor)&&state.floor!==24)lock=strictKeys1020();else if(state.floor===24)lock=lockAudit96()||null;
  // ENTITIES LAST: only now can loot, relics and monsters be restored/repaired against final geometry.
  restoreEntities1020(saved);specialEntityPass1023();repairLateItems();if(state.floor===6)placeFloor6LibraryRewardR8();applyLibrary();postEntitySanity1020();
  // Reassert custom plans because item-repair helpers are allowed to move loot, never to redefine geometry or key doors.
  if(state.floor===18&&state.ironGate18_1020){const plan=state.keyPlan96;if(!plan?.keys?.length)installPendingCustomLocks()}
  if(state.floor===20&&state.f20BossLock1020)restoreFloor20BossKeys1020();
  if(state.floor===22){clearOldKeyTiles();state.keyPlan96=null}
  if(state.floor===24&&state.deepKey24_1020&&state.outdoorGate24_1020)installCustomBrassPlan24_(state.deepKey24_1020,state.outdoorGate24_1020);
  lock=state.keyPlan96?.groups?.length?lockAudit96()||null:lock;postEntitySanity1020();
  if(state.bossExitGate1020)setTerrainTile58(state.map,state.bossExitGate1020.x,state.bossExitGate1020.y,state.bossDefeated?TT.OPEN_DOOR:TT.WALL);
  // Surface decoration never creates furniture or changes collision geometry.
  try{vfBuildDecor?.()}catch(error){ignoreError('special-floor decor rebuild failed; decor stays as generated',error)}themePatternPass1022();repairBlockingPhysicalDecor1029();if(state.floor===21)repairFloor21Blink();const topology=stabilizeFinalTopology1029();makeRestaurant42();postEntitySanity1020();finalEntitySweep1020();rebalanceMonsterCrowding1027();if(state.floor===22)spreadFloor22R43();repairRestaurantRewards42();sanitizeRestaurantMonsters42();if(state.floor===6){const prize=state.items.find(it=>it.r8LibraryPrize);if(prize)state.f6LibraryPrizeR8={x:prize.x,y:prize.y}}budgetPeaches52();sanitizeWallDecor1029();if(state.floor===20)auditFloor20Content();generateRumorSpaces();specialTerrainGrandDress();if(state.floor===23)repairFloor23MercuryConnectivity1029();if(state.floor===21){repairBlockingPhysicalDecor1029();repairFloor21Blink();state.floor21FinalBlinkChoiceAuditR46=blinkChoiceReach({unlock:true,openBoss:true,rafts:true,portals:true,blinkRange:4})||null}finishEntryDocumentDoors67();VisibilityService.compute();state.architecture1020={build:BUILD1020,assets:BUILD1022,lock:topology.lock||lock,topology,rumorSpaces:state.rumorSpaceAudit1030,floor21BlinkChoice:state.floor===21?state.floor21FinalBlinkChoiceAuditR46:null};return true
}
