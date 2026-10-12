/* Floor layout: room and hall shaping, sculpted features, profile rooms, corridors, purpose rooms and vaults, decor
   placement and the repair passes the generation pipeline registers. Generation base: mapgen.js; special floors: special.js. */
  const put=(r,x,y,t)=>{if(!interior(r,x,y))return false;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return false;setTerrainTile58(state.map,x,y,t);return true};
  const clear=(r)=>{for(let y=r.y+2;y<=r.y+r.h-3;y++)for(let x=r.x+2;x<=r.x+r.w-3;x++)put(r,x,y,TT.FLOOR)};
  const hline=(r,y,x0,x1,t)=>{for(let x=x0;x<=x1;x++)put(r,x,y,t)};
  const vline=(r,x,y0,y1,t)=>{for(let y=y0;y<=y1;y++)put(r,x,y,t)};
  const tag=(x,y,label)=>{state.routeTags=state.routeTags||[];state.routeTags.push({x,y,label})};
  function sculptFeature(r){
    if(r.w<9||r.h<8)return;
    const cx=r.x+Math.floor(r.w/2),cy=r.y+Math.floor(r.h/2);clear(r);
    if(r.name==='연금술방'){
      for(let y=r.y+2;y<=cy-2;y++){put(r,cx-4,y,TT.WALL);put(r,cx+4,y,TT.WALL)}
      put(r,cx-4,cy-2,TT.DOOR);put(r,cx+4,cy-2,TT.DOOR);hline(r,cy-2,cx-3,cx+3,TT.TABLE);put(r,cx,cy-2,TT.COOKPOT);
      for(const [x,y] of [[cx-3,cy+1],[cx+3,cy+1],[cx-2,r.y+3],[cx+2,r.y+3]])put(r,x,y,TT.JAR);
      put(r,cx,cy+2,TT.FLOOR);put(r,cx-2,cy+2,TT.BRAZIER);put(r,cx+2,cy+2,TT.CACHE);tag(cx,cy+2,'연금술방');
    }else if(r.name==='주방'){
      hline(r,r.y+2,r.x+2,r.x+r.w-3,TT.TABLE);vline(r,r.x+2,r.y+3,r.y+r.h-4,TT.TABLE);vline(r,r.x+r.w-3,r.y+3,r.y+r.h-4,TT.TABLE);
      put(r,cx,r.y+2,TT.COOKPOT);put(r,cx-2,cy,TT.JAR);put(r,cx+2,cy,TT.JAR);put(r,cx,cy,TT.FLOOR);tag(cx,cy,'주방');
    }else if(r.name==='사당'){
      for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(x===cx||y===cy)put(r,x,y,TT.GOLD);
      hline(r,r.y+2,cx-3,cx+3,TT.SCREEN);put(r,cx,r.y+2,TT.FLOOR);put(r,cx,cy,TT.ALTAR);for(const [x,y] of [[cx-2,cy-2],[cx+2,cy-2],[cx-2,cy+2],[cx+2,cy+2]])put(r,x,y,TT.BRAZIER);put(r,cx,cy+3,TT.FLOOR);tag(cx,cy+3,'사당');
    }else if(r.name==='무기고'){
      for(let y=r.y+2;y<=r.y+r.h-3;y++){if(y===cy)continue;put(r,cx-3,y,TT.SCREEN);put(r,cx+3,y,TT.SCREEN)}put(r,cx-3,cy,TT.DOOR);put(r,cx+3,cy,TT.DOOR);
      vline(r,cx-1,r.y+3,r.y+r.h-4,TT.TABLE);vline(r,cx+1,r.y+3,r.y+r.h-4,TT.TABLE);put(r,cx,cy,TT.ARMORY);put(r,cx-4,cy,TT.CACHE);put(r,cx+4,cy,TT.CACHE);put(r,cx,r.y+r.h-3,TT.FLOOR);tag(cx,r.y+r.h-3,'무기고');
    }else if(r.name==='서고'){
      let flip=false;for(let y=r.y+3;y<=r.y+r.h-4;y+=2){for(let x=r.x+2;x<=r.x+r.w-3;x++){const gap=flip?r.x+3:r.x+r.w-4;if(Math.abs(x-gap)<=1)continue;put(r,x,y,TT.SCREEN)}flip=!flip}put(r,cx,cy,TT.RUMOR);put(r,cx-2,cy,TT.TABLE);put(r,cx+2,cy,TT.MIRROR);put(r,r.x+2,r.y+2,TT.FLOOR);tag(r.x+2,r.y+2,'서고');
    }else if(r.name==='감방'){
      const lx=cx-2,rx=cx+2;vline(r,lx,r.y+2,r.y+r.h-3,TT.WALL);vline(r,rx,r.y+2,r.y+r.h-3,TT.WALL);for(const yy of [cy-2,cy+2]){put(r,lx,yy,TT.DOOR);put(r,rx,yy,TT.DOOR)}put(r,cx,cy,TT.FLOOR);put(r,cx-4,cy-2,TT.SNARE);put(r,cx+4,cy+2,TT.JAR);put(r,cx-4,cy+2,TT.CACHE);tag(cx,cy,'감방');
    }
  }
  function reshapeRooms(){
    if(!state||state.specialFloor)return;
    const protectedRooms=new Set((state.featureRooms||[]).map(f=>`${f.x},${f.y},${f.w},${f.h}`));
    for(const r of state.rooms||[]){
      if(r.w<8||r.h<7||protectedRooms.has(`${r.x},${r.y},${r.w},${r.h}`))continue;
      if(state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h)continue;
      if(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h)continue;
      const mode=Math.floor(hash2(r.x,r.y,7100+state.floor*31)*5);
      if(mode===0){for(const [x,y] of [[r.x+1,r.y+1],[r.x+2,r.y+1],[r.x+1,r.y+2],[r.x+r.w-2,r.y+1],[r.x+r.w-3,r.y+1],[r.x+r.w-2,r.y+2]])setTerrainTile58(state.map,x,y,TT.WALL)}
      else if(mode===1&&r.w>=10){for(let y=r.y+2;y<r.y+r.h-2;y++){if(Math.abs(y-r.cy)<=1)continue;setTerrainTile58(state.map,r.cx-3,y,TT.WALL);setTerrainTile58(state.map,r.cx+3,y,TT.WALL)}}
      else if(mode===2&&r.h>=9){for(let x=r.x+2;x<r.x+r.w-2;x++){if(Math.abs(x-r.cx)<=2)continue;if((x-r.x)%2===0)setTerrainTile58(state.map,x,r.y+2,TT.WALL)}}
    }
  }
  const put43=(r,x,y,t)=>{if(!inside43(r,x,y))return false;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return false;setTerrainTile58(state.map,x,y,t);return true};
  const clear43=r=>{for(let y=r.y+1;y<=r.y+r.h-2;y++)for(let x=r.x+1;x<=r.x+r.w-2;x++)put43(r,x,y,TT.FLOOR)};
  const h43=(r,y,a,b,t)=>{for(let x=a;x<=b;x++)put43(r,x,y,t)};
  const v43=(r,x,a,b,t)=>{for(let y=a;y<=b;y++)put43(r,x,y,t)};
  function sculptSmallFeature43(r){
    if(r.w<7||r.h<7)return;
    const cx=r.x+Math.floor(r.w/2),cy=r.y+Math.floor(r.h/2),left=r.x+2,right=r.x+r.w-3,top=r.y+2,bottom=r.y+r.h-3;
    clear43(r);
    if(r.name==='연금술방'){
      // central mixing bar, reagent alcoves and ritual ring
      h43(r,cy-1,left,right,TT.TABLE);put43(r,cx,cy-1,TT.COOKPOT);
      if(r.w>=8){v43(r,left,top,cy-2,TT.WALL);v43(r,right,top,cy-2,TT.WALL);put43(r,left,cy-2,TT.DOOR);put43(r,right,cy-2,TT.DOOR)}
      put43(r,left,cy+1,TT.JAR);put43(r,right,cy+1,TT.JAR);put43(r,cx-1,bottom,TT.BRAZIER);put43(r,cx+1,bottom,TT.CACHE);put43(r,cx,cy+1,TT.FLOOR);
    }else if(r.name==='주방'){
      h43(r,top,left,right,TT.TABLE);v43(r,left,top+1,bottom,TT.TABLE);v43(r,right,top+1,bottom,TT.TABLE);put43(r,cx,top,TT.COOKPOT);put43(r,cx-1,cy,TT.JAR);put43(r,cx+1,cy,TT.JAR);put43(r,cx,bottom,TT.FLOOR);
    }else if(r.name==='사당'){
      for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(inside43(r,x,y)&&(x===cx||y===cy))put43(r,x,y,TT.GOLD);
      h43(r,top,Math.max(left,cx-2),Math.min(right,cx+2),TT.SCREEN);put43(r,cx,top,TT.FLOOR);put43(r,cx,cy,TT.ALTAR);for(const [x,y] of [[cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1],[cx+1,cy+1]])put43(r,x,y,TT.BRAZIER);put43(r,cx,bottom,TT.FLOOR);
    }else if(r.name==='무기고'){
      v43(r,left,top,bottom,TT.SCREEN);v43(r,right,top,bottom,TT.SCREEN);put43(r,left,cy,TT.DOOR);put43(r,right,cy,TT.DOOR);if(cx-1>left)v43(r,cx-1,top+1,bottom-1,TT.TABLE);if(cx+1<right)v43(r,cx+1,top+1,bottom-1,TT.TABLE);put43(r,cx,cy,TT.ARMORY);put43(r,cx,bottom,TT.FLOOR);
    }else if(r.name==='서고'){
      let flip=0;for(let y=top;y<=bottom;y+=2){const gap=flip?left:right;for(let x=left;x<=right;x++)if(Math.abs(x-gap)>1)put43(r,x,y,TT.SCREEN);flip^=1}put43(r,cx,cy,TT.RUMOR);put43(r,cx-1,cy,TT.TABLE);put43(r,cx+1,cy,TT.MIRROR);put43(r,left,top,TT.FLOOR);
    }else if(r.name==='감방'){
      const lx=Math.max(left,cx-2),rx=Math.min(right,cx+2);v43(r,lx,top,bottom,TT.WALL);v43(r,rx,top,bottom,TT.WALL);for(const yy of [cy-1,cy+1]){put43(r,lx,yy,TT.DOOR);put43(r,rx,yy,TT.DOOR)}put43(r,cx,cy,TT.FLOOR);if(left<lx)put43(r,left,cy-1,TT.SNARE);if(right>rx)put43(r,right,cy+1,TT.JAR);
    }
  }
  function repair43(){
    for(const it of state.items||[])if(tileBlocks(state.map[it.y]?.[it.x])){const p=PlacementService.randomFloor(0);it.x=p.x;it.y=p.y}
    for(const mon of state.monsters||[])if(mon.hp>0&&!PlacementService.monsterCanStand(mon,mon.x,mon.y)){const p=PlacementService.randomMonsterCell(mon)||PlacementService.randomFloor(0);mon.x=p.x;mon.y=p.y}
    ensureNormalConnectivity();VisibilityService.compute();vfBuildDecor();
  }
/* ===== MANRU v4.4 stronger 2.5D architecture + room structure pass ===== */
const inRoom44=(r,x,y)=>x>=r.x+1&&y>=r.y+1&&x<=r.x+r.w-2&&y<=r.y+r.h-2;
  const v44=(r,x,a,b,t)=>{for(let y=a;y<=b;y++)safePut44(r,x,y,t)};
  function structuralOrdinaryRooms44(){
    if(!state||state.specialFloor)return;
    const featureKeys=new Set((state.featureRooms||[]).map(r=>`${r.x},${r.y},${r.w},${r.h}`));
    for(const r of state.rooms||[]){
      if(r.w<7||r.h<7||featureKeys.has(`${r.x},${r.y},${r.w},${r.h}`)) continue;
      if((state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h)||(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h)) continue;
      const cx=r.x+Math.floor(r.w/2), cy=r.y+Math.floor(r.h/2);
      const mode=Math.floor(hash2(r.x*3,r.y*5,9900+state.floor*17)*6);
      if(mode===0){ // four corner buttresses -> hall feel
        for(const [x,y] of [[r.x+1,r.y+1],[r.x+r.w-2,r.y+1],[r.x+1,r.y+r.h-2],[r.x+r.w-2,r.y+r.h-2]]) setTerrainTile58(state.map,x,y,TT.WALL);
        if(r.w>=10){setTerrainTile58(state.map,r.x+2,cy,TT.WALL);setTerrainTile58(state.map,r.x+r.w-3,cy,TT.WALL);}
      }else if(mode===1 && r.w>=9){ // side alcove pair
        const y1=r.y+2,y2=r.y+r.h-3;
        for(let x=r.x+2;x<=r.x+r.w-3;x++) if(Math.abs(x-cx)>1){setTerrainTile58(state.map,x,y1,TT.WALL); if(r.h>=9) setTerrainTile58(state.map,x,y2,TT.WALL);}
        setTerrainTile58(state.map,cx,y1,TT.DOOR); if(r.h>=9) setTerrainTile58(state.map,cx,y2,TT.DOOR);
      }else if(mode===2 && r.h>=9){ // split room with crossing doorway
        v44(r,cx,r.y+2,r.y+r.h-3,TT.WALL); setTerrainTile58(state.map,cx,cy,TT.DOOR);
        if(r.w>=10){setTerrainTile58(state.map,cx-2,cy-2,TT.WALL);setTerrainTile58(state.map,cx+2,cy+2,TT.WALL);}
      }else if(mode===3 && r.w>=10 && r.h>=8){ // shallow stage or dais
        const y=r.y+2; for(let x=r.x+2;x<=r.x+r.w-3;x++) if(Math.abs(x-cx)>2) setTerrainTile58(state.map,x,y,TT.WALL); 
        if(r.h>=9){ setTerrainTile58(state.map,cx-1,y+1,TT.GOLD); setTerrainTile58(state.map,cx,y+1,TT.GOLD); setTerrainTile58(state.map,cx+1,y+1,TT.GOLD); }
      }else if(mode===4 && r.w>=9){ // twin aisle pillars
        for(let y=r.y+2;y<=r.y+r.h-3;y+=2){ setTerrainTile58(state.map,cx-2,y,TT.WALL); setTerrainTile58(state.map,cx+2,y,TT.WALL); }
      }else if(mode===5 && r.w>=9 && r.h>=8){ // skewed nook / service corridor
        for(let y=r.y+2;y<=r.y+r.h-4;y++) setTerrainTile58(state.map,r.x+2,y,TT.WALL);
        setTerrainTile58(state.map,r.x+2,cy,TT.DOOR); if(r.w>=11) for(let x=cx+1;x<=r.x+r.w-3;x++) setTerrainTile58(state.map,x,r.y+2,TT.WALL);
      }
    }
  }
  function repair44(){
    for(const it of state.items||[]) if(tileBlocks(state.map[it.y]?.[it.x])){ const p=PlacementService.randomFloor(0); it.x=p.x; it.y=p.y; }
    for(const mon of state.monsters||[]) if(mon.hp>0 && !PlacementService.monsterCanStand(mon,mon.x,mon.y)){ const p=PlacementService.randomMonsterCell(mon)||PlacementService.randomFloor(0); mon.x=p.x; mon.y=p.y; }
    ensureNormalConnectivity(); VisibilityService.compute(); vfBuildDecor();
  }
  // ---- kitchen should be uncommon, not every other floor
  function clearKitchen58(fr){
    const repl=['서고','사당','무기고','감방'][Math.floor(globalThis.__MANRU_RANDOM57__()*4)];
    const x0=fr.x+1,y0=fr.y+1,x1=fr.x+fr.w-2,y1=fr.y+fr.h-2,cx=fr.x+Math.floor(fr.w/2),cy=fr.y+Math.floor(fr.h/2);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const t=state.map[y]?.[x];
      if([TT.TABLE,TT.JAR,TT.COOKPOT,TT.FLOOR,TT.SCREEN,TT.SNARE,TT.ALTAR,TT.ARMORY,TT.BRAZIER].includes(t))setTerrainTile58(state.map,x,y,TT.FLOOR);
    }
    state.routeTags=(state.routeTags||[]).filter(t=>!(t.x>=fr.x&&t.x<fr.x+fr.w&&t.y>=fr.y&&t.y<fr.y+fr.h&&t.label==='주방'));
    fr.name=repl;
    if(repl==='서고'){
      for(let y=y0+1;y<=y1-1;y+=2)for(let x=x0+1;x<=x1-1;x++)if(x!==((y&2)?x1-1:x0+1))setTerrainTile58(state.map,x,y,TT.SCREEN);
      setTerrainTile58(state.map,cx,cy,TT.RUMOR);
    }else if(repl==='사당'){
      setTerrainTile58(state.map,cx,cy,TT.ALTAR);
      for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])if(state.map[cy+dy]?.[cx+dx]===TT.FLOOR)setTerrainTile58(state.map,cx+dx,cy+dy,TT.BRAZIER);
    }else if(repl==='무기고'){
      setTerrainTile58(state.map,cx,cy,TT.ARMORY);
      for(let y=y0+1;y<=y1-1;y+=2){if(state.map[y]?.[x0+1]===TT.FLOOR)setTerrainTile58(state.map,x0+1,y,TT.TABLE);if(state.map[y]?.[x1-1]===TT.FLOOR)setTerrainTile58(state.map,x1-1,y,TT.TABLE)}
    }else{
      const lx=Math.max(x0+1,cx-2),rx=Math.min(x1-1,cx+2);
      for(let y=y0+1;y<=y1-1;y++){if(y!==cy){setTerrainTile58(state.map,lx,y,TT.SCREEN);setTerrainTile58(state.map,rx,y,TT.SCREEN)}}
      setTerrainTile58(state.map,lx,cy,TT.DOOR);setTerrainTile58(state.map,rx,cy,TT.DOOR);
    }
  }
  function normalizeKitchens58(){
    if(!state?.featureRooms?.length)return;
    for(const fr of state.featureRooms){
      if(fr.name!=='주방')continue;
      const consecutive=(state.lastKitchenFloor58||0)===state.floor-1;
      const allow=!consecutive&&globalThis.__MANRU_RANDOM57__()<.18;
      if(allow)state.lastKitchenFloor58=state.floor;
      else clearKitchen58(fr);
    }
  }
  /* ---------- risk/reward pockets behind doors, DCSS-style minivault idea ---------- */
  function safeRoom59(r){
    const basic=!(state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h) &&
           !(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h);
    if(!basic)return false;
    return !(state.featureRooms||[]).some(f=>!(r.x+r.w<=f.x||f.x+f.w<=r.x||r.y+r.h<=f.y||f.y+f.h<=r.y));
  }
  function stampMiniVault59(r,seed){
    const cx=r.cx,cy=r.cy,mode=seed%4;
    const put=(x,y,t)=>{if(x<=r.x||y<=r.y||x>=r.x+r.w-1||y>=r.y+r.h-1)return;if((x===state.player.x&&y===state.player.y)||(x===state.stairs.x&&y===state.stairs.y))return;setTerrainTile58(state.map,x,y,t)};
    if(mode===0){
      // cross-pillar treasure: four hard corners around a readable center
      for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])put(cx+dx,cy+dy,TT.WALL);
      put(cx,cy,TT.CACHE);put(cx-2,cy,TT.TRAP);put(cx+2,cy,TT.TRAP);
    }else if(mode===1){
      // trap gallery: a visible lane with reward past it
      for(let x=Math.max(r.x+2,cx-3);x<=Math.min(r.x+r.w-3,cx+3);x++)if(x!==cx)put(x,cy,((x-cx)&1)?TT.TRAP:TT.FLOOR);
      put(cx,cy,TT.FLOOR);put(Math.min(r.x+r.w-2,cx+3),Math.min(r.y+r.h-2,cy+2),TT.CACHE);
    }else if(mode===2){
      // screened cells: two pockets and a narrow central line
      if(r.w>=8){for(let y=r.y+2;y<=r.y+r.h-3;y++){if(y!==cy){put(cx-2,y,TT.SCREEN);put(cx+2,y,TT.SCREEN)}}put(cx-2,cy,TT.DOOR);put(cx+2,cy,TT.DOOR)}
      put(cx,cy,TT.RUMOR);
    }else{
      // shrine pocket: obvious sanctuary shape but guarded approach
      put(cx,cy,TT.ALTAR);for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]])put(cx+dx,cy+dy,TT.BRAZIER);
      put(cx-1,cy+2,TT.TRAP);put(cx+1,cy+2,TT.CACHE);
    }
  }
  function guardedRooms59(){
    if(state.specialFloor||!state.rooms?.length)return;
    const rooms=state.rooms.filter(r=>safeRoom59(r)&&r.w>=7&&r.h>=6);
    if(!rooms.length)return;
    state.guardRooms59=[];
    const count=Math.min(state.floor>=11?2:1,rooms.length);
    for(let i=0;i<count;i++){
      const r=rooms.splice(rand(0,rooms.length-1),1)[0];if(!r)break;
      const vaultMode=Math.floor(hash2(r.x,r.y,5900+state.floor*31)*4)%4;
      stampMiniVault59(r,vaultMode);
      state.guardRooms59.push({x:r.x,y:r.y,w:r.w,h:r.h,name:['십자 보관실','함정 화랑','병풍 감실','소형 사당'][vaultMode]});
      const movable=state.monsters.filter(m=>!m.boss&&!m.fixed&&!m.aquatic);
      for(let n=0;n<Math.min(2,movable.length);n++){
        const mon=movable[(i*2+n)%movable.length],q=randomInside59(r);
        if(mon&&q&&!OccupancyService.isOccupied(q.x,q.y,mon)){mon.x=q.x;mon.y=q.y}
      }
    }
    ensureNormalConnectivity();
  }
  function relocatePool60(){
    const cap=Math.max(0,(COLS-2)*(ROWS-2)),cells=new Int32Array(cap);let n=0;
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)cells[n++]=y*COLS+x;
    return{cells,count:n};
  }
  function trimDecor61(){if(!state?.decor||state.decor.length<=120)return;const src=state.decor,keep=[],step=src.length/120;for(let i=0;i<120;i++)keep.push(src[Math.floor(i*step)]);state.decor=keep}
  function overlapRoom62(a,b){return !(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y)}
  function repairMonsters70(){
    if(!state?.monsters?.length)return 0;let moved=0;
    for(let pass=0;pass<2;pass++){
      for(const m of state.monsters){
        if(m.hp<=0||m.boss)continue;
        if(PlacementService.monsterCanStand(m,m.x,m.y))continue;
        const p=PlacementService.randomMonsterCell(m);
        if(p){m.x=p.x;m.y=p.y;moved++}
      }
    }
    return moved;
  }
  function repairEntities71(){
    if(!state?.monsters)return 0;let moved=0;
    for(const m of state.monsters){
      if(m.hp<=0||m.boss)continue;
      if(PlacementService.monsterCanStand(m,m.x,m.y))continue;
      let q=PlacementService.randomMonsterCell(m);
      if(!q&&m.aquatic){
        // Rare fallback: preserve an aquatic enemy by creating a small water trough in a safe large room.
        const rs=[...(state.rooms||[])].filter(r=>r.w>=7&&r.h>=5&&!roomHasEndpoint(r));
        for(const r of rs){
          const x=r.cx,y=r.cy;if([[-0,-1],[0,0],[0,1]].every(([dx,dy])=>canEdit(x+dx,y+dy,[TT.FLOOR,TT.GRASS]))){
            for(const dy of [-1,0,1])setTerrainTile58(state.map,x,y+dy,TT.WATER);
            if(PlacementService.monsterCanStand(m,x,y)){q={x,y};break}
          }
        }
      }
      if(q){m.x=q.x;m.y=q.y;moved++}
    }
    state.repairedEntities71=moved;return moved;
  }
/* ===== MANRU v7.8: FULL-MAP DENSITY / LANDMARK POLISH ===== */
function imp78(x,y){if(!state)return true;if(x<=1||y<=1||x>=COLS-2||y>=ROWS-2)return true;if(state.player?.x===x&&state.player?.y===y)return true;if(state.stairs?.x===x&&state.stairs?.y===y)return true;if((state.items||[]).some(i=>i.x===x&&i.y===y))return true;if((state.monsters||[]).some(m=>m.hp>0&&typeof monCovers==='function'&&monCovers(m,x,y)))return true;return false}
  /* ---------------- multi-tile connected decorative layer ---------------- */
  const ConnectedDecor81=(function(){
    const PREFIX='c81:';
    const FLOORISH=new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.GOLD,TT.FLOOR]);
    const TREEISH=new Set([TT.PEACH_TREE,TT.HEDGE,TT.BAMBOO]);
    let seq=0,building=false;
    const palettes=[
      {a:'#6f2e25',b:'#b65e3d',line:'#e0a360'},
      {a:'#214f3d',b:'#4f8a59',line:'#96c978'},
      {a:'#603257',b:'#aa5f8e',line:'#df9fc4'},
      {a:'#374047',b:'#6a7377',line:'#bb8b61'},
      {a:'#66501d',b:'#b89635',line:'#efd36d'}
    ];
    function kk(x,y){return x+','+y}
    function important(x,y){
      if(x<=1||y<=1||x>=COLS-2||y>=ROWS-2)return true;
      if(state.player?.x===x&&state.player?.y===y)return true;
      if(state.stairs?.x===x&&state.stairs?.y===y)return true;
      if((state.items||[]).some(i=>i.x===x&&i.y===y))return true;
      if((state.monsters||[]).some(m=>m.hp>0&&monCovers(m,x,y)))return true;
      return false;
    }
    function free(x,y){return x>1&&y>1&&x<COLS-2&&y<ROWS-2&&!important(x,y)&&FLOORISH.has(state.map[y]?.[x])}
    function hash(x,y,s=0){return hash2(x,y,8100+state.floor*97+s)}
    function unique(cells){const out=[],seen=new Set();for(const c of cells){if(!c||!free(c.x,c.y))continue;const q=kk(c.x,c.y);if(seen.has(q))continue;seen.add(q);out.push(c)}return out}
    function addGroup(kind,cells,layer='ground',alpha=.72){
      cells=unique(cells);if(cells.length<2)return 0;
      const id='g'+(++seq),set=new Set(cells.map(c=>kk(c.x,c.y))),region=regionIndex();
      for(const c of cells){let mask=0;if(set.has(kk(c.x,c.y-1)))mask|=1;if(set.has(kk(c.x+1,c.y)))mask|=2;if(set.has(kk(c.x,c.y+1)))mask|=4;if(set.has(kk(c.x-1,c.y)))mask|=8;state.decor.push({x:c.x,y:c.y,kind:PREFIX+kind,layer,alpha,region,connected81:true,group81:id,mask81:mask,seed81:Math.floor(hash(c.x,c.y,31)*9999)})}
      return cells.length;
    }
    function addCanopyGroup(cells){
      cells=[...new Map(cells.filter(c=>c&&c.x>0&&c.y>0&&c.x<COLS-1&&c.y<ROWS-1).map(c=>[kk(c.x,c.y),c])).values()];
      if(cells.length<2)return 0;
      const id='g'+(++seq),set=new Set(cells.map(c=>kk(c.x,c.y))),region=regionIndex();
      for(const c of cells){let mask=0;if(set.has(kk(c.x,c.y-1)))mask|=1;if(set.has(kk(c.x+1,c.y)))mask|=2;if(set.has(kk(c.x,c.y+1)))mask|=4;if(set.has(kk(c.x-1,c.y)))mask|=8;state.decor.push({x:c.x,y:c.y,kind:PREFIX+'canopy',layer:'object',alpha:.88,region,connected81:true,group81:id,mask81:mask,seed81:Math.floor(hash(c.x,c.y,37)*9999)})}
      return cells.length;
    }
    function lineCells(r,horizontal,len=6,width=2){
      const cells=[],cx=Math.round(r.cx),cy=Math.round(r.cy),half=Math.floor(len/2);
      for(let a=-half;a<=half;a++)for(let b=0;b<width;b++)cells.push(horizontal?{x:cx+a,y:cy+b-Math.floor(width/2)}:{x:cx+b-Math.floor(width/2),y:cy+a});
      return cells;
    }
    function walkCells(r,count=9,seed=0){
      let x=Math.round(r.cx),y=Math.round(r.cy),out=[{x,y}],last=-1;
      for(let i=1;i<count;i++){
        const dirs=[[1,0],[0,1],[-1,0],[0,-1]],start=Math.floor(hash(x+i,y-i,seed+i)*4);let moved=false;
        for(let j=0;j<4;j++){const d=(start+j)%4;if((d+2)%4===last&&j<3)continue;const nx=x+dirs[d][0],ny=y+dirs[d][1];if(nx<=r.x+1||ny<=r.y+1||nx>=r.x+r.w-2||ny>=r.y+r.h-2||!free(nx,ny))continue;x=nx;y=ny;last=d;out.push({x,y});moved=true;break}
        if(!moved)break;
      }
      return out;
    }
    function lCells(r){
      const out=[],cx=Math.round(r.cx),cy=Math.round(r.cy),rx=Math.min(4,Math.max(2,Math.floor(r.w/3))),ry=Math.min(4,Math.max(2,Math.floor(r.h/3)));
      for(let x=cx-rx;x<=cx+rx;x++)out.push({x,y:cy});for(let y=cy;y<=cy+ry;y++)out.push({x:cx+rx,y});return out;
    }
    
    function build(){
      if(!state||building)return;building=true;
      try{
        state.decor=(state.decor||[]).filter(d=>!d.connected81);seq=0;
        let cells=0,groups=0;const rooms=[...(state.rooms||[])].filter(r=>r.w>=6&&r.h>=6).sort((a,b)=>(b.w*b.h)-(a.w*a.h));
        const maxGroups=state.specialFloor?6:Math.min(6,Math.max(3,Math.floor(rooms.length/3)+2));
        for(let i=0;i<Math.min(maxGroups,rooms.length);i++){
          const r=rooms[(i*3+state.floor)%rooms.length],z=regionIndex(),horizontal=r.w>=r.h;let kind,shape,layer='ground',alpha=.7;
          if(z===0){kind='runner';shape=lineCells(r,horizontal,Math.min(8,(horizontal?r.w:r.h)-3),Math.min(2,(horizontal?r.h:r.w)-3));alpha=.58}
          else if(z===1){kind='roots';shape=walkCells(r,10,101+i);alpha=.56}
          else if(z===2){kind='silk';shape=lineCells(r,!horizontal,Math.min(7,(!horizontal?r.w:r.h)-3),2);alpha=.54}
          else if(z===3){kind='chain';shape=lCells(r);alpha=.55}
          else{kind='vein';shape=walkCells(r,11,301+i);alpha=.64}
          const n=addGroup(kind,shape,layer,alpha);if(n){cells+=n;groups++}
          if(cells>58)break;
        }
        if(regionIndex()===1){
          for(const comp of ReachabilityService.forestComponents({kk,TREEISH},Math.max(0,64-cells)).slice(0,4)){const n=addCanopyGroup(comp);if(n){cells+=n;groups++}}
        }
        // Every floor gets at least one genuinely connected formation. Random room geometry
        // can occasionally reject all planned shapes, so fall back to a local organic chain.
        if(!groups){
          let fallback=null;
          outer:for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++){
            if(!free(x,y))continue;
            const options=[[1,0],[0,1],[-1,0],[0,-1]].map(([dx,dy])=>({x:x+dx,y:y+dy})).filter(q=>free(q.x,q.y));
            if(!options.length)continue;
            const n=options[Math.floor(hash(x,y,909)*options.length)],shape=[{x,y},n];
            const bend=[[-(n.y-y),n.x-x],[n.y-y,-(n.x-x)]].map(([dx,dy])=>({x:n.x+dx,y:n.y+dy})).find(q=>free(q.x,q.y));
            if(bend)shape.push(bend);fallback=shape;break outer;
          }
          if(fallback){const kinds=['runner','roots','silk','chain','vein'],n=addGroup(kinds[regionIndex()]||'runner',fallback,'ground',.62);if(n){cells+=n;groups++}}
          if(!groups){const comp=ReachabilityService.forestComponents({kk,TREEISH},12).find(c=>c.length>=2);if(comp){const n=addCanopyGroup(comp);if(n){cells+=n;groups++}}}
        }
        state.connectedDecor81={groups,cells,maxGroup:Math.max(0,...Object.values((state.decor||[]).filter(d=>d.connected81).reduce((a,d)=>(a[d.group81]=(a[d.group81]||0)+1,a),{}))),total:state.decor.length};
      }finally{building=false}
    }
    function draw(e,fogHandled58=false){
      if(!e?.connected81)return false;
      if(!state.seen.has(kk(e.x,e.y)))return true;
      const vis=state.visible.has(kk(e.x,e.y)),p=palettes[e.region??regionIndex()]||palettes[0],px=e.x*TILE,py=e.y*TILE,m=e.mask81||0,a=(fogHandled58||vis?1:.46)*(e.alpha??1),kind=String(e.kind).slice(PREFIX.length);
      X.save();X.globalAlpha*=a;X.lineCap='round';X.lineJoin='round';
      const ext={l:(m&8)?0:5,r:(m&2)?32:27,t:(m&1)?0:5,b:(m&4)?32:27};
      if(kind==='runner'||kind==='silk'){
        X.fillStyle=kind==='runner'?p.a:p.b;X.fillRect(px+ext.l,py+ext.t,ext.r-ext.l,ext.b-ext.t);
        X.strokeStyle=p.line;X.lineWidth=1;
        if(!(m&1)){X.beginPath();X.moveTo(px+ext.l,py+ext.t+.5);X.lineTo(px+ext.r,py+ext.t+.5);X.stroke()}
        if(!(m&4)){X.beginPath();X.moveTo(px+ext.l,py+ext.b-.5);X.lineTo(px+ext.r,py+ext.b-.5);X.stroke()}
        if(!(m&8)){X.beginPath();X.moveTo(px+ext.l+.5,py+ext.t);X.lineTo(px+ext.l+.5,py+ext.b);X.stroke()}
        if(!(m&2)){X.beginPath();X.moveTo(px+ext.r-.5,py+ext.t);X.lineTo(px+ext.r-.5,py+ext.b);X.stroke()}
        X.globalAlpha*=.38;X.fillStyle=p.line;if(kind==='runner'){X.fillRect(px+9,py+14,14,3);X.fillRect(px+14,py+9,3,14)}else{for(let q=7;q<28;q+=7)X.fillRect(px+q,py+6,1,20)}
      }else if(kind==='roots'||kind==='vein'||kind==='chain'){
        const cx=px+16,cy=py+16,targets=[];if(m&1)targets.push([px+16,py]);if(m&2)targets.push([px+32,py+16]);if(m&4)targets.push([px+16,py+32]);if(m&8)targets.push([px,py+16]);
        X.strokeStyle=kind==='roots'?'#665139':kind==='chain'?'#7e8588':p.line;X.lineWidth=kind==='chain'?3:kind==='roots'?4:2;
        X.beginPath();for(const[tX,tY]of targets){X.moveTo(cx,cy);X.quadraticCurveTo(cx+((e.seed81%7)-3),cy+(((e.seed81>>3)%7)-3),tX,tY)}X.stroke();
        X.fillStyle=kind==='roots'?'#8a7048':kind==='chain'?'#b5a07c':p.line;X.beginPath();X.arc(cx,cy,kind==='chain'?3:2.5,0,Math.PI*2);X.fill();
        if(kind==='chain'){X.strokeStyle='#d1b889';X.lineWidth=1;for(let q=5;q<28;q+=8){X.beginPath();X.arc(px+q,py+16,2.5,0,Math.PI*2);X.stroke()}}
      }else if(kind==='canopy'){
        const tile=state.map[e.y]?.[e.x];
        if(tile===TT.PEACH_TREE||tile===TT.BAMBOO){X.fillStyle='#5a3c27';X.fillRect(px+14,py+15,4,17);X.fillStyle='#8b6740';X.fillRect(px+15,py+15,1,16)}
        X.fillStyle='#214b34';X.fillRect(px+ext.l,py+ext.t,ext.r-ext.l,Math.max(12,ext.b-ext.t-7));
        const blobs=[[7,11,8],[15,7,9],[24,12,8],[12,18,7],[22,19,7]];for(const[bX,bY,r]of blobs){X.fillStyle=((bX+bY+e.seed81)&1)?'#356b45':'#2a5b3b';X.beginPath();X.arc(px+bX+((e.seed81%3)-1),py+bY,r,0,Math.PI*2);X.fill()}
        X.globalAlpha*=.55;X.fillStyle='#78a45b';for(let q=0;q<4;q++)X.fillRect(px+5+((e.seed81+q*7)%22),py+5+((e.seed81+q*11)%14),2,3);
      }
      X.restore();return true;
    }
    return{build,draw,stats:()=>state?.connectedDecor81||{groups:0,cells:0,maxGroup:0,total:state?.decor?.length||0}};
  })();
  function room88(m,x,y,w,h,shape='rect'){
    x=Math.max(1,Math.min(COLS-w-2,x));y=Math.max(1,Math.min(ROWS-h-2,y));
    const r=roomRect(x,y,w,h);r.shape88=shape;state.rooms.push(r);const x0=x+1,y0=y+1,x1=x+w-2,y1=y+h-2;
    if(shape==='serpentine'||shape==='rturn'){
      const ys=[y0,y0+1,r.cy-1,r.cy,y1-1,y1];for(const yy of ys)for(let xx=x0;xx<=x1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      for(let yy=y0;yy<=r.cy;yy++)for(let xx=x1-1;xx<=x1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      for(let yy=r.cy;yy<=y1;yy++)for(let xx=x0;xx<=x0+1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      if(shape==='rturn')for(let yy=y0;yy<=r.cy;yy++)for(let xx=x0;xx<=x0+1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
    }else if(shape==='cross'){
      const armX=Math.max(2,Math.floor((w-2)/3)),armY=Math.max(2,Math.floor((h-2)/3));
      for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)if(Math.abs(xx-r.cx)<=Math.floor(armX/2)||Math.abs(yy-r.cy)<=Math.floor(armY/2))setTerrainTile58(m,xx,yy,TT.FLOOR);
    }else{
      for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)setTerrainTile58(m,xx,yy,TT.FLOOR);
      if(shape==='chamfer'&&w>=7&&h>=7)for(const [xx,yy] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]])setTerrainTile58(m,xx,yy,TT.WALL);
      else if(shape==='pillars'&&w>=9&&h>=8)for(const [xx,yy] of [[x0+1,y0+1],[x1-1,y0+1],[x0+1,y1-1],[x1-1,y1-1]])setTerrainTile58(m,xx,yy,TT.STONE_PILLAR);
    }
    setTerrainTile58(m,r.cx,r.cy,TT.FLOOR);return r;
  }
  function doorPoint88(r,target){if(['serpentine','rturn'].includes(r.shape88)){const south=(target.cy??target.y)>r.cy,y=south?r.y+r.h-1:r.y,x=r.cx;return{x,y,ox:x,oy:y+(south?1:-1)}}const dx=target.x-r.cx,dy=target.y-r.cy;if(Math.abs(dx)>=Math.abs(dy)){const east=dx>=0,x=east?r.x+r.w-1:r.x,y=Math.max(r.y+2,Math.min(r.y+r.h-3,target.y));return{x,y,ox:x+(east?1:-1),oy:y}}const south=dy>=0,y=south?r.y+r.h-1:r.y,x=Math.max(r.x+2,Math.min(r.x+r.w-3,target.x));return{x,y,ox:x,oy:y+(south?1:-1)}}
  function manhattan88(m,a,b,style='L'){
    let x=a.x,y=a.y,guard=0;corridorCell(m,x,y);if(style==='diag'){stairPath88(m,a,b);return}
    const hf=style==='H'||(style==='L'&&globalThis.__MANRU_RANDOM57__()<.5);
    if(style==='Z'){
      if(globalThis.__MANRU_RANDOM57__()<.5){const mx=Math.round((a.x+b.x)/2);while(x!==mx&&guard++<500){x+=Math.sign(mx-x);corridorCell(m,x,y)}while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}}
      else{const my=Math.round((a.y+b.y)/2);while(y!==my&&guard++<500){y+=Math.sign(my-y);corridorCell(m,x,y)}while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}}return;
    }
    if(hf){while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}}else{while(y!==b.y&&guard++<500){y+=Math.sign(b.y-y);corridorCell(m,x,y)}while(x!==b.x&&guard++<500){x+=Math.sign(b.x-x);corridorCell(m,x,y)}}
  }
  function connect88(m,a,b,style='L'){const da=doorPoint88(a,b),db=doorPoint88(b,a);setTerrainTile58(m,da.x,da.y,TT.DOOR);setTerrainTile58(m,db.x,db.y,TT.DOOR);carveInterior(m,da.ox,da.oy);carveInterior(m,db.ox,db.oy);manhattan88(m,{x:da.ox,y:da.oy},{x:db.ox,y:db.oy},style)}
  function add89(m,x,y,w,h,kind='room',shape='rect'){
    const r=room88(m,x,y,w,h,shape);r.kind89=kind;return r;
  }
  function corridor89(m,a,b,style='L'){connect88(m,a,b,style)}
  function splitRoom89(m,r,axis='v',doors=1){
    if(!r||r.w<9||r.h<8)return false;
    if(axis==='v'){
      const x=r.cx;for(let y=r.y+1;y<r.y+r.h-1;y++)if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL);
      const ys=doors>1?[r.cy-2,r.cy+2]:[r.cy];for(const y of ys)if(y>r.y&&y<r.y+r.h-1)setTerrainTile58(m,x,y,TT.DOOR);
    }else{
      const y=r.cy;for(let x=r.x+1;x<r.x+r.w-1;x++)if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL);
      const xs=doors>1?[r.cx-2,r.cx+2]:[r.cx];for(const x of xs)if(x>r.x&&x<r.x+r.w-1)setTerrainTile58(m,x,y,TT.DOOR);
    }
    return true;
  }
  function roomFreeCells90(r){const a=[];for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)if(floorOnly88(x,y))a.push({x,y});return a}
  function purposeTile90(type,z){
    if(type==='supply')return TT.CACHE;if(type==='armory')return TT.ARMORY;if(type==='shrine')return z===4?TT.ALTAR:TT.BRAZIER;if(type==='kitchen')return TT.COOKPOT;if(type==='archive')return z===2?TT.MIRROR:TT.RUMOR;if(type==='medic')return TT.FOUNTAIN;return TT.CACHE;
  }
  function reset91(m){clear88(m);state.rooms=[];state.featureRooms=[];state.routeTags=[];state.grandRoom89=null;state.focalRooms89=[];state.purposeRooms90=[];state.mainRooms90=[];}
  function roomOverlap91(x,y,w,h,pad=2){return (state.rooms||[]).some(r=>x<r.x+r.w+pad&&x+w+pad>r.x&&y<r.y+r.h+pad&&y+h+pad>r.y)}
  function canPlace93(x,y,w,h,pad=1){return x>=2&&y>=(state.floor===1?17:2)&&x+w<COLS-2&&y+h<ROWS-2&&!roomOverlap91(x,y,w,h,pad)}
  function addCompact93(m,x,y,w,h,kind='room',shape='rect',role='room'){const r=add89(m,x,y,w,h,kind,shape);r.node93=state.rooms.length-1;r.role93=role;state.mainRooms90.push(r);return r}
  function pathPoints93(a,b,style='L'){let x=a.x,y=a.y;const out=[];if(style==='Z'){if(globalThis.__MANRU_RANDOM57__()<.5){const mx=Math.round((a.x+b.x)/2);({x,y}=segment93(out,x,y,mx,y));({x,y}=segment93(out,x,y,x,b.y));({x,y}=segment93(out,x,y,b.x,b.y));}else{const my=Math.round((a.y+b.y)/2);({x,y}=segment93(out,x,y,x,my));({x,y}=segment93(out,x,y,b.x,y));({x,y}=segment93(out,x,y,b.x,b.y));}}else if(style==='diag'){while(x!==b.x||y!==b.y){const px=x,py=y;if(x!==b.x&&y!==b.y){if(globalThis.__MANRU_RANDOM57__()<.5)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y)}else if(x!==b.x)x+=Math.sign(b.x-x);else y+=Math.sign(b.y-y);out.push({x,y,dir:x!==px?'h':'v'})}}else if(style==='H'||(style==='L'&&globalThis.__MANRU_RANDOM57__()<.5)){({x,y}=segment93(out,x,y,b.x,y));({x,y}=segment93(out,x,y,b.x,b.y));}else{({x,y}=segment93(out,x,y,x,b.y));({x,y}=segment93(out,x,y,b.x,b.y));}return out}
// Profiles parameterize the canonical room/edge producer. Room shells are immutable
// routing obstacles: widening can never cut a jamb or create a freestanding door.
function placeProfileRooms105(m,p){
 const out=[],{columns,rows,cellW,cellH,x0,y0}=p;
 const landmarkRows=p.id==='canal'?[1,2]:[2,4],catalog=Object.keys(INDOOR_LANDMARKS[p.id]).filter(kind=>p.id!=='granary'||p.level>=2||kind!=='rats'),chosen=[];
 p.landmarkSlots={};for(const row of landmarkRows){const options=catalog.filter(v=>!chosen.includes(v)),kind=choice(options);chosen.push(kind);p.landmarkSlots[row*columns+rand(0,columns-1)]=kind;}
 p.rowOffsets=[];let cursor=y0;for(let j=0;j<rows;j++){p.rowOffsets.push(cursor);cursor+=cellH+(p.id==='granary'&&landmarkRows.includes(j)?10:0);}p.routeMaxY=cursor-1;
 p.dangerIndices=p.id==='granary'&&p.level===2?choice([[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]).map((c,i)=>(1+i*2)*3+c):[];
 for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
  const landmark=p.landmarkSlots[out.length],district=landmark?INDOOR_LANDMARKS[p.id][landmark].palette:(i+Math.floor(j/2)+p.variant)%4, special=p.id==='canal'&&district===1;
  const shape=special?(j%2?'rturn':'serpentine'):district===2?'chamfer':'rect';
  const w=landmark?(p.id==='canal'?19:18):special?15:p.id==='granary'&&district===1?rand(11,14):rand(...p.roomW),h=landmark?(p.id==='canal'?16:19):special?13:p.id==='granary'&&district===1?6:rand(...p.roomH);
  const x=x0+i*cellW+rand(0,Math.max(0,cellW-w-4)),y=p.rowOffsets[j]+rand(0,Math.max(0,cellH+(landmark&&p.id==='granary'?10:0)-h-4));
  const r=addCompact93(m,x,y,w,h,'room',landmark?'rect':shape,landmark?'hall':special?'hall':'room');r.district105=district;r.index105=out.length;r.ports105=[];if(landmark){r.landmark105=landmark;buildIndoorLandmark105(m,r,p.id);}out.push(r);
 }
 p.rooms=out;return out;
}
function connectProfileRooms105(m,a,b,width,p){
 const rooms=p.rooms,kk=(x,y)=>x+','+y;
 const protectedCell=(x,y)=>rooms.some(r=>x>=r.x-1&&x<=r.x+r.w&&y>=r.y-1&&y<=r.y+r.h);
 const ports=(r,target)=>{
  const list=[];
  for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]])for(let off=2;off<(dx?r.h:r.w)-2;off++){
   const x=dx?(dx<0?r.x:r.x+r.w-1):r.x+off,y=dy?(dy<0?r.y:r.y+r.h-1):r.y+off;
   if(m[y-dy]?.[x-dx]!==TT.FLOOR)continue;
   if(m[y+dx]?.[x-dy]!==TT.WALL||m[y-dx]?.[x+dy]!==TT.WALL)continue;
   if(r.ports105.some(q=>Math.max(Math.abs(q.x-x),Math.abs(q.y-y))<3&&!(q.x===x&&q.y===y)))continue;
   list.push({x,y,dx,dy,ox:x+dx*2,oy:y+dy*2,score:Math.abs(x+dx*3-target.cx)+Math.abs(y+dy*3-target.cy)});
  }
  return list.sort((a,b)=>a.score-b.score);
 };
 const aa=ports(a,b),bb=ports(b,a);let result;
 for(const pa of aa.slice(0,8)){for(const pb of bb.slice(0,8)){
  const from=kk(pa.ox,pa.oy),to=kk(pb.ox,pb.oy),queue=[{x:pa.ox,y:pa.oy}],prev=new Map([[from,null]]);let end=null;
  for(let i=0;i<queue.length;i++){const q=queue[i],key=kk(q.x,q.y);if(key===to){end=q;break}
   const dirs=[[0,-1],[1,0],[0,1],[-1,0]].sort((u,v)=>Math.abs(q.x+u[0]-pb.ox)+Math.abs(q.y+u[1]-pb.oy)-Math.abs(q.x+v[0]-pb.ox)-Math.abs(q.y+v[1]-pb.oy));
   for(const[dx,dy]of dirs){const x=q.x+dx,y=q.y+dy,key=kk(x,y);if(x<2||y<2||x>p.x0+p.columns*p.cellW-1||y>p.routeMaxY||protectedCell(x,y)||prev.has(key))continue;prev.set(key,q);queue.push({x,y})}
  }
  if(end){const route=[];for(let q=end;q;q=prev.get(kk(q.x,q.y)))route.push(q);route.reverse();result={pa,pb,route};break}
 }if(result)break}
 if(!result)throw Error('Profile corridor cannot connect '+a.index105+' / '+b.index105);
 const{pa,pb,route}=result;
 for(let i=0;i<route.length;i++){
  const q=route[i],next=route[Math.min(i+1,route.length-1)],before=route[Math.max(0,i-1)];q.dir=(next.x!==q.x||before.x!==q.x)?'h':'v';
  for(let o=0;o<width;o++){const x=q.x+(q.dir==='v'?o:0),y=q.y+(q.dir==='h'?o:0);if(!protectedCell(x,y))setTerrainTile58(m,x,y,TT.FLOOR)}
 }
 for(const[r,d]of[[a,pa],[b,pb]]){setTerrainTile58(m,d.x+d.dx,d.y+d.dy,TT.FLOOR);setTerrainTile58(m,d.x,d.y,TT.DOOR);if(!r.ports105.some(q=>q.x===d.x&&q.y===d.y))r.ports105.push({...d});}
 return route;
}
  // F2 carpet is a narrow ceremonial runner; the stage uses a bordered platform instead of a giant rug block.
  function refineF2Floor96(){if(state.floor!==2)return;const cx=Math.floor(COLS/2);for(let y=3;y<=9;y++)for(let x=cx-10;x<=cx+10;x++)if(state.map[y]?.[x]===TT.CARPET)setTerrainTile58(state.map,x,y,TT.FLOOR);for(let y=4;y<=8;y++)for(let x=cx-4;x<=cx+4;x++)if(in85(x,y)&&state.map[y][x]===TT.FLOOR)setTerrainTile58(state.map,x,y,TT.CARPET);for(let y=10;y<ROWS-5;y++){for(let x=cx-1;x<=cx+1;x++)if(in85(x,y)&&[TT.FLOOR,TT.CARPET].includes(state.map[y][x]))setTerrainTile58(state.map,x,y,TT.CARPET)}}
  // Special maps that were visually too open receive structural partitions, not prop scatter.
  function densifySpecial96(){
    if(!state.specialFloor||[23,24].includes(state.floor))return;const m=state.map,cx=Math.floor(COLS/2),cy=Math.floor(ROWS/2);
    if(state.floor===16){
      // Outer approach gets two compact guard compounds so the field reads as a fortress approach, not a huge lawn.
      const fieldEnd=Math.floor(COLS*.27),specs=[[5,8,9,8],[Math.max(14,fieldEnd-11),ROWS-17,9,8]];for(const [x0,y0,w,h] of specs){if(x0+w>=fieldEnd)continue;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(in85(x,y))setTerrainTile58(m,x,y,(x===x0||x===x0+w-1||y===y0||y===y0+h-1)?TT.WALL:TT.GRASS);const dx=x0+Math.floor(w/2);setTerrainTile58(m,dx,y0+h-1,TT.DOOR);if(in85(dx,y0+2))setTerrainTile58(m,dx,y0+2,TT.CACHE);state.rooms.push({x:x0,y:y0,w,h,cx:x0+Math.floor(w/2),cy:y0+Math.floor(h/2)})}
      // Staggered outer defensive walls create multiple approach lanes instead of one huge open field.
      for(const x of [Math.floor(fieldEnd*.42),Math.floor(fieldEnd*.70)]){for(let y=5;y<ROWS-6;y++){if(y%13>=4&&y%13<=7)continue;if(in85(x,y)&&m[y][x]===TT.GRASS)setTerrainTile58(m,x,y,TT.WALL)}for(const y of [13,26,39,52])if(in85(x,y)&&m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.DOOR)}
      state.featureRooms.push({name:'외곽 경비초소',x:3,y:5,w:fieldEnd-5,h:ROWS-10});
    }
    if(state.floor===18){
      // The post-warehouse zone becomes three linked chambers rather than one empty rectangle.
      const gateX=COLS-13,rightL=gateX+1;for(const y of [cy-10,cy+10]){for(let x=rightL;x<COLS-2;x++)if(m[y][x]!==TT.STAIR)setTerrainTile58(m,x,y,TT.WALL);const dx=COLS-8;setTerrainTile58(m,dx,y,TT.DOOR)}for(const x of [rightL+4,rightL+9]){if(x>=COLS-3)continue;for(let y=4;y<ROWS-5;y++){if(Math.abs(y-cy)<3||y%12<3)continue;if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL)}for(const y of [cy-15,cy,cy+15])if(in85(x,y)&&m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.DOOR)}state.featureRooms.push({name:'후면 삼연 창고',x:rightL,y:2,w:COLS-rightL-2,h:ROWS-4});
    }
    if(state.floor===22){
      // Split the nave into central aisle + side ambulatories with repeated arches.
      const nave=(state.rooms||[]).filter(r=>r.x<=cx&&cx<r.x+r.w&&r.y<=cy&&cy<r.y+r.h).sort((a,b)=>a.w*a.h-b.w*b.h)[0];if(nave){for(const x of [cx-4,cx+4])for(let y=nave.y+2;y<nave.y+nave.h-2;y++){if((y-nave.y)%8<3){if(m[y][x]===TT.WALL)setTerrainTile58(m,x,y,TT.FLOOR);continue}if(m[y][x]===TT.FLOOR||m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL)}for(let y=nave.y+6;y<nave.y+nave.h-5;y+=8){for(const x of [cx-4,cx+4]){setTerrainTile58(m,x,y,TT.DOOR);if(in85(x,y-1))setTerrainTile58(m,x,y-1,TT.FLOOR);if(in85(x,y+1))setTerrainTile58(m,x,y+1,TT.FLOOR)}}state.featureRooms.push({name:'삼랑 신전 회랑',x:nave.x,y:nave.y,w:nave.w,h:nave.h})}
      // Two additional side partitions articulate the wider transept.
      for(const x of [Math.floor(COLS*.30),Math.floor(COLS*.70)]){for(let y=8;y<ROWS-9;y++){if(Math.abs(y-cy)<4)continue;if(m[y][x]===TT.FLOOR)setTerrainTile58(m,x,y,TT.WALL)}for(const y of [cy-10,cy+10])if(in85(x,y)){setTerrainTile58(m,x,y,TT.DOOR);if(in85(x-1,y))setTerrainTile58(m,x-1,y,TT.FLOOR);if(in85(x+1,y))setTerrainTile58(m,x+1,y,TT.FLOOR)}}
    }
  }
  const DECOR986=new Map([
    ['trim',{name:'바닥 테두리',desc:'방과 회랑의 경계를 따라 이어지는 낮은 마감재. 같은 건물 안에서도 구획마다 재료와 문양이 조금씩 달라진다.'}],
    ['scroll',{name:'벽걸이 두루마리',desc:'벽에 걸린 오래된 두루마리. 글씨는 습기와 그을음에 번졌지만 방의 용도와 주인의 격식을 짐작하게 한다.'}],
    ['vines',{name:'벽덩굴',desc:'갈라진 벽 틈을 타고 자란 덩굴. 햇빛이 닿지 않는데도 끝이 늘 밝은 쪽을 향해 뻗는다.'}],
    ['roots',{name:'드러난 뿌리',desc:'바닥과 벽을 밀어 올리며 자란 굵은 뿌리. 수목원의 나무들이 보이는 것보다 훨씬 넓게 서로 얽혀 있음을 보여 준다.'}],
    ['silk',{name:'비단 장막',desc:'빛을 받으면 결이 달라 보이는 얇은 비단. 시선을 끌어 방의 깊이와 출입구를 교묘하게 감춘다.'}],
    ['chains',{name:'매달린 쇠사슬',desc:'천장과 기둥 사이에 걸린 무거운 쇠사슬. 운반용인지 구속용인지 알 수 없을 만큼 여러 높이에 고리가 달려 있다.'}],
    ['relief',{name:'벽면 부조',desc:'벽을 얕게 파내 만든 부조. 가까이 보면 인물과 짐승의 형상이 여러 차례 덧깎여 서로 다른 시대의 흔적이 겹쳐 있다.'}],
    ['rug',{name:'긴 깔개',desc:'사람이 걷는 축을 따라 깔린 두꺼운 직물. 닳은 부분이 자연스럽게 방의 주 통행로를 드러낸다.'}],
    ['papers',{name:'흩어진 문서',desc:'찢긴 장부와 메모 조각. 글자는 대부분 이어지지 않지만 같은 인장과 날짜가 반복해서 나타난다.'}],
    ['rubble',{name:'무너진 잔해',desc:'벽돌과 나무 조각이 섞인 작은 잔해. 오래된 붕괴 흔적 위에 비교적 새 파편이 다시 얹혀 있다.'}],
    ['bones',{name:'마른 뼛조각',desc:'오래전에 남겨진 마른 뼈. 일부는 가지런히 모여 있고 일부는 끌려간 듯 흩어져 있다.'}],
    ['c81:runner',{name:'이어진 회랑 깔개',desc:'여러 칸을 하나의 길처럼 묶는 긴 깔개. 장식이라기보다 사람의 동선을 눈에 보이게 만드는 건축 요소다.'}],
    ['c81:roots',{name:'이어진 뿌리망',desc:'여러 바닥 칸을 가로질러 이어지는 뿌리. 한 줄을 따라가면 같은 수목 군락의 다른 줄기와 다시 만난다.'}],
    ['c81:silk',{name:'이어진 비단길',desc:'바닥을 가로질러 연속으로 펼쳐진 비단 띠. 내실의 방들을 하나의 의식 동선처럼 이어 놓았다.'}],
    ['c81:chain',{name:'연결 쇠사슬',desc:'바닥과 기둥 사이를 연속으로 잇는 굵은 쇠사슬. 장고의 구획을 임시로 묶거나 물건을 고정하는 데 쓰였던 듯하다.'}],
    ['c81:vein',{name:'빛나는 맥',desc:'바닥 아래에서 이어지는 희미한 광맥 같은 선. 만루 심부의 재료가 한 덩어리처럼 연결되어 있음을 암시한다.'}],
    ['c81:canopy',{name:'이어진 수관',desc:'여러 나무의 가지와 잎이 한 덩어리처럼 포개진 수관. 아래에서는 서로 다른 줄기의 경계를 구분하기 어렵다.'}]
  ]);
  const DECOR_INSPECT_SURFACES986=new Set([TT.FLOOR,TT.GRASS,TT.GOLD,TT.FLOOR,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.LIGHT_GRASS].filter(Number.isFinite));
  function validWallDecor986(d){return !!(d&&d.layer==='wall'&&state?.map?.[d.y]?.[d.x]===TT.WALL&&state?.map?.[d.y+1]?.[d.x]!==TT.WALL)}
  function decorAt986(x,y){
    if(!state||x<0||y<0||x>=COLS||y>=ROWS||!DECOR_INSPECT_SURFACES986.has(state.map?.[y]?.[x]))return null;
    const exact=(state.decor||[]).filter(d=>d.layer!=='wall'&&d.x===x&&d.y===y),projected=(state.decor||[]).filter(d=>validWallDecor986(d)&&d.x===x&&d.y+1===y),list=[...exact,...projected];if(!list.length)return null;
    const score=d=>d.layer==='object'?40:d.layer==='wall'?30:d.connected81?24:(d.kind==='trim'?5:18);
    return list.sort((a,b)=>score(b)-score(a))[0]||null;
  }
/* Natural grass: no neon tile noise. Small old LIGHT_GRASS patches become decorative tufts; actual lawns become one GRASS material with a blurred tile-by-tile tone field. */
const GRASS_PAL1020=[['#384631','#45543a','#566646'],['#2d4a34','#3a5b3e','#4f6f4c'],['#3b4736','#4a5740','#5d6a4d'],['#33463a','#405749','#53695a'],['#38472f','#47593a','#5b7049']];
/* 5 theme carpet/floor variants + wider water/land and floor/floor blending. Pure rendering; no collision change. */
const CARPET1020=[['#63271d','#d19a58','#3b130e'],['#394d34','#9b8c54','#1e2d22'],['#59264d','#d08ead','#2d1328'],['#3c3734','#9b6849','#201c1a'],['#322b21','#d0ae52','#15120c']];
function floorOverlay1020(px,py,x,y,colors,vis){if(!state||!inside1020(x,y))return;const t=terrainBaseTile58(x,y),z=regionOfFloor();X.save();
  if(z===4&&t===TT.FLOOR&&!state.artifactDungeon46){const h=hash1022(`${x>>1}:${y>>1}:slate51`);X.fillStyle=['#343a40','#383e43','#30383e','#3b4145'][h%4];X.fillRect(px,py,32,32);X.fillStyle='#252c31';if(x%2===0)X.fillRect(px,py,1,32);if(y%2===0)X.fillRect(px,py,32,1);X.fillStyle='#515956';if(y%2===0)X.fillRect(px+2,py+2,28,1);if(x%2===0)X.fillRect(px+2,py+3,1,26);X.fillStyle='rgba(174,166,134,.16)';for(let i=0;i<3;i++)X.fillRect(px+4+(h>>i*3)%23,py+5+(h>>i*4)%22,2+(i%2),1);if(h%9===0){X.strokeStyle='#272f34';X.lineWidth=1;X.beginPath();X.moveTo(px+20,py+3);X.lineTo(px+17,py+12);X.lineTo(px+21,py+18);X.stroke()}}
  // Theme 3–5 authored surface materials; render-only, deterministic, save-compatible.
  if(z>=2&&!state.artifactDungeon46&&[TT.FLOOR,TT.WOOD_FLOOR,TT.DARK_WOOD,TT.STONE_PATH,TT.MOON_STONE].includes(t)){
    const h=hash1022(`${state.floor}:${x}:${y}:material`),moon=t===TT.MOON_STONE||/moon|mirror|gallery/.test(state.floorStyle980?.[K1020(x,y)]||'');
    if(z===2&&!moon){
      X.fillStyle=['#422d3c','#48303f','#3d2938','#4b3342'][h%4];X.fillRect(px,py,32,32);
      for(let row=0;row<4;row++){const yy=py+row*8;X.fillStyle='#241b25';X.fillRect(px,yy+7,32,1);X.fillStyle='rgba(206,150,159,.16)';X.fillRect(px+1,yy+1,30,1);const seam=((x+row+y)%3)*10+3;X.fillStyle='#2f202d';X.fillRect(px+seam,yy+2,1,5);X.fillStyle='rgba(170,104,128,.16)';X.fillRect(px+3+(h>>row*3)%9,yy+4,12,1)}
      if((x+y)%4===0){X.strokeStyle='#97756e';X.globalAlpha=.38;X.beginPath();X.moveTo(px+8,py+16);X.quadraticCurveTo(px+16,py+5,px+24,py+16);X.quadraticCurveTo(px+16,py+27,px+8,py+16);X.stroke();X.globalAlpha=1;}
    }else if(z===3){
      const wood=t===TT.WOOD_FLOOR||t===TT.DARK_WOOD||/storage/.test(state.floorStyle980?.[K1020(x,y)]||'');
      X.fillStyle=wood?['#46382d','#503d2e','#40352c'][h%3]:['#424b4c','#485151','#3a4447'][h%3];X.fillRect(px,py,32,32);
      X.fillStyle=wood?'#756047':'#687271';X.fillRect(px+1,py+1,30,1);X.fillRect(px+1,py+2,1,28);X.fillStyle='#232c2d';X.fillRect(px,py+30,32,2);X.fillRect(px+30,py,2,32);
      if(wood){for(let yy=8;yy<32;yy+=8){X.fillStyle='#2c2521';X.fillRect(px,py+yy,32,1);X.fillStyle='rgba(167,131,83,.2)';X.fillRect(px+4,py+yy+3,19,1)}}
      if((x%3===0&&wood)||(!wood&&y%4===0)){X.fillStyle='#242e31';X.fillRect(px,py+12,32,5);X.fillStyle='#737672';X.fillRect(px,py+12,32,1);for(const dx of [4,26]){X.fillStyle='#a89470';X.fillRect(px+dx,py+14,2,1)}}
      if(h%5===0){X.strokeStyle='rgba(22,30,31,.55)';X.beginPath();X.moveTo(px+22,py+3);X.lineTo(px+18,py+10);X.lineTo(px+22,py+17);X.lineTo(px+19,py+24);X.stroke()}
    }else{
      const garden=state.floor===24,stone=moon||state.floor===23;
      X.fillStyle=garden?['#3d4d43','#455347','#394b43'][h%3]:stone?['#45545e','#4c5b64','#3f4f5a'][h%3]:['#2e3949','#354052','#303d4c'][h%3];X.fillRect(px,py,32,32);
      X.fillStyle=garden?'#697561':stone?'#75858a':'#586879';X.fillRect(px+2,py+2,28,1);X.fillRect(px+2,py+3,1,26);X.fillStyle='#202a34';X.fillRect(px,py+30,32,2);X.fillRect(px+30,py,2,32);
      X.strokeStyle=garden?'rgba(185,176,127,.24)':'rgba(188,161,93,.38)';X.lineWidth=1;
      if((x+y)%3===0){X.beginPath();X.moveTo(px+7,py+13);X.lineTo(px+7,py+7);X.lineTo(px+13,py+7);X.moveTo(px+19,py+25);X.lineTo(px+25,py+25);X.lineTo(px+25,py+19);X.stroke()}
      if(h%7===0){X.strokeStyle='rgba(150,173,182,.2)';X.beginPath();X.moveTo(px+4,py+23);X.lineTo(px+13,py+19);X.lineTo(px+19,py+20);X.lineTo(px+28,py+13);X.stroke()}
    }
    // Contact shading follows actual walls, without changing vision or terrain.
    X.fillStyle='rgba(8,10,16,.24)';if(state.map[y-1]?.[x]===TT.WALL)X.fillRect(px,py,32,4);if(state.map[y]?.[x-1]===TT.WALL)X.fillRect(px,py,3,32);
  }
  if(t===TT.GRASS){const q=state.grassTone1020?.[K1020(x,y)]??.5,p=GRASS_PAL1020[z],c=q<.5?mix1020(p[0],p[1],q*2):mix1020(p[1],p[2],(q-.5)*2);X.globalAlpha=.58;X.fillStyle=c;X.fillRect(px,py,32,32);X.globalAlpha=1;if(state.grassTufts1020?.has(K1020(x,y))){X.strokeStyle='#68805a';X.lineWidth=1.6;for(const ox of [12,16,20]){X.beginPath();X.moveTo(px+ox,py+25);X.lineTo(px+ox+(ox===16?0:ox<16?-3:3),py+15);X.stroke()}}}
  if(t===TT.CARPET){const [b,l,d]=CARPET1020[z];X.globalAlpha=.72;X.fillStyle=b;X.fillRect(px+1,py+1,30,30);X.strokeStyle=l;X.lineWidth=1;X.strokeRect(px+4.5,py+4.5,23,23);if(z===2||z===4){X.beginPath();X.moveTo(px+16,py+7);X.lineTo(px+25,py+16);X.lineTo(px+16,py+25);X.lineTo(px+7,py+16);X.closePath();X.stroke()}else{for(let i=7;i<27;i+=6){X.beginPath();X.moveTo(px+5,py+i);X.lineTo(px+27,py+i);X.stroke()}}X.fillStyle=d;X.fillRect(px+6,py+6,2,2);X.fillRect(px+24,py+24,2,2)}
  if(t===TT.GILDED_FLOOR&&(state.floor===22||state.floor===23||state.floor===24)){X.fillStyle='rgba(210,174,70,.13)';X.fillRect(px,py,32,32);X.strokeStyle='rgba(239,205,102,.34)';X.strokeRect(px+4.5,py+4.5,23,23);X.beginPath();X.moveTo(px+16,py+5);X.lineTo(px+27,py+16);X.lineTo(px+16,py+27);X.lineTo(px+5,py+16);X.closePath();X.stroke()}
  floorSurfaceBlend1025(px,py,x,y);
  const ad=state.archDecor1020?.[K1020(x,y)];if(ad){X.globalAlpha=.8;if(ad==='goldSeal'){X.strokeStyle='rgba(225,190,83,.58)';X.lineWidth=1;X.strokeRect(px+10.5,py+10.5,11,11);X.beginPath();X.moveTo(px+16,py+8);X.lineTo(px+24,py+16);X.lineTo(px+16,py+24);X.lineTo(px+8,py+16);X.closePath();X.stroke()}X.globalAlpha=1}
  X.restore();}
function roomProbe1026(r){
  if(!r)return null;
  const edgeRatio=(outside=false)=>{let edge=0,blocked=0;const y0=outside?r.y-1:r.y,y1=outside?r.y+r.h:r.y+r.h-1,x0=outside?r.x-1:r.x,x1=outside?r.x+r.w:r.x+r.w-1;
    for(let x=r.x;x<r.x+r.w;x++)for(const y of [y0,y1]){if(!inside1020(x,y))continue;edge++;const t=state.map[y]?.[x];if(tileBlocks(t)||t===TT.WINDOW||doorTileSet().has(t))blocked++}
    for(let y=r.y;y<r.y+r.h;y++)for(const x of [x0,x1]){if(!inside1020(x,y))continue;edge++;const t=state.map[y]?.[x];if(tileBlocks(t)||t===TT.WINDOW||doorTileSet().has(t))blocked++}
    return edge?blocked/edge:0};
  let inner=0,open=0,blocked=0,special=0,indoorMat=0;const x0=r.w>=5?r.x+1:r.x,x1=r.w>=5?r.x+r.w-1:r.x+r.w,y0=r.h>=5?r.y+1:r.y,y1=r.h>=5?r.y+r.h-1:r.y+r.h;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const t=state.map[y]?.[x];inner++;if(basicFloor1022(t)||t===TT.FLOOR||t===TT.WOOD_FLOOR||t===TT.GILDED_FLOOR||t===TT.CARPET||t===TT.STONE_PATH||t===TT.MOON_STONE||t===TT.DARK_WOOD)open++;else if(tileBlocks(t))blocked++;else special++;if([TT.WOOD_FLOOR,TT.DARK_WOOD,TT.CARPET,TT.GILDED_FLOOR,TT.MOON_STONE].includes(t))indoorMat++}
  return{area:r.w*r.h,inner,currentEdge:edgeRatio(false),outerEdge:edgeRatio(true),enclosure:Math.max(edgeRatio(false),edgeRatio(true)),openRatio:inner?open/inner:0,wallRatio:inner?blocked/inner:0,specialRatio:inner?special/inner:0,indoorRatio:inner?indoorMat/inner:0};
}
function sameRoom1027(a,b){return a&&b&&a.x===b.x&&a.y===b.y&&a.w===b.w&&a.h===b.h}
const RETIRED_DECOR64=new Set(["lantern","banner","statue","cabinet","shelf","jars","planter","basin","cushion","screen","crate","rack","weaponrack","altar","brazier","incense","tea","bench","pillar","lampstand"]);
const PHYSICAL_DECOR_BLOCKERS1029=new Set([TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.WINDOW,TT.GARDEN_TREE,TT.SCREEN,TT.INCENSE_STAND].filter(v=>v!=null));
/* ===== MANRU r43: floor 22 encounter budgeting on the FINAL expanded geometry ===== */
const F22_BUDGET43={lower:16,central:11,upper:16};
function floor22Zone43(y){const mid=Math.floor((ROWS-1)/2);if(y<mid-14)return'upper';if(y>mid+14)return'lower';return'central'}
function floor22CellOk43(m,x,y,zone){
  if(!inside1020(x,y)||floor22Zone43(y)!==zone)return false;
  if(Math.abs(x-state.player.x)+Math.abs(y-state.player.y)<10)return false;
  if(Math.abs(x-state.stairs.x)+Math.abs(y-state.stairs.y)<5)return false;
  const t=state.map[y]?.[x];if(!safeFloorTile1020(t)||HAZ1020().has(t)||t===TT.WATER||t===TT.MERCURY||t===TT.LAVA||t===TT.VOID)return false;
  return PlacementService.monsterCanStand(m,x,y);
}
function floor22Density43(x,y,r=4){let n=0;for(const m of state.monsters||[])if(m.hp>0&&Math.max(Math.abs(m.x-x),Math.abs(m.y-y))<=r)n++;return n}
function room47(m,q,index){let[x,y,w,h,kind]=q;const t=LEGEND_TILES49[state.legendTheme47];
 // Variation is bounded within each authored footprint, never within a locked shell.
 if(w>=12&&h>=10){const j=Math.floor(rng49()*2);x+=j;w-=j;if(rng49()<.5)h--}
 const r={x,y,w,h,cx:x+Math.floor(w/2),cy:y+Math.floor(h/2),kind,index,ports:[]};
 for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const edge=xx===x||yy===y||xx===x+w-1||yy===y+h-1;setTerrainTile58(m,xx,yy,edge?t.walls[(Math.floor(xx/3)+Math.floor(yy/4))%3]:t.base+(kind==='court'?3:((index%3))));state.legendRegion49[yy*COLS+xx]=index;}
 return r;
}
function hall47(m,a,b,unused,w=2){
 const t=LEGEND_TILES49[state.legendTheme47],ports=r=>[{x:r.cx,y:r.y,dx:0,dy:-1},{x:r.cx,y:r.y+r.h-1,dx:0,dy:1},{x:r.x,y:r.cy,dx:-1,dy:0},{x:r.x+r.w-1,y:r.cy,dx:1,dy:0}];
 const choices=[];for(const u of ports(a))for(const v of ports(b))choices.push({u,v,d:Math.abs(u.x-v.x)+Math.abs(u.y-v.y)});choices.sort((u,v)=>u.d-v.d);
 const allowed=(x,y)=>x>1&&y>1&&x<COLS-2&&y<ROWS-2&&state.legendRegion49[y*COLS+x]<0;
 let route=null,pa,pb;
 for(const c of choices){const sx=c.u.x+c.u.dx,sy=c.u.y+c.u.dy,tx=c.v.x+c.v.dx,ty=c.v.y+c.v.dy;if(!allowed(sx,sy)||!allowed(tx,ty))continue;
  const q=[{x:sx,y:sy}],prev=new Int32Array(COLS*ROWS);prev.fill(-2);prev[sy*COLS+sx]=-1;let found=false;
  for(let i=0;i<q.length;i++){const p=q[i];if(p.x===tx&&p.y===ty){found=true;break}const dirs=[...DIRS4].sort((u,v)=>(Math.abs(p.x+u[0]-tx)+Math.abs(p.y+u[1]-ty))-(Math.abs(p.x+v[0]-tx)+Math.abs(p.y+v[1]-ty)));for(const[dx,dy]of dirs){const x=p.x+dx,y=p.y+dy,n=y*COLS+x;if(!allowed(x,y)||prev[n]!==-2)continue;prev[n]=p.y*COLS+p.x;q.push({x,y})}}
  if(!found)continue;route=[];let n=ty*COLS+tx;while(n>=0){route.push({x:n%COLS,y:Math.floor(n/COLS)});n=prev[n]}route.reverse();pa=c.u;pb=c.v;break;
 }
 if(!route)throw new Error('corridor routing '+a.index+' → '+b.index);
 const pathTile=(x,y)=>{const old=m[y][x];return old===TT.WATER||old===TT.LAVA||old===TT.VOID?t.bridge:t.base+3};
 for(let i=0;i<route.length;i++){const p=route[i];setTerrainTile58(m,p.x,p.y,pathTile(p.x,p.y));if(i<2||i>route.length-3)continue;const before=route[i-1],dx=p.y!==before.y?1:0,dy=dx?0:1;for(let d=1;d<w;d++){const side=d===1?1:-1,x=p.x+dx*side,y=p.y+dy*side;if(!allowed(x,y))continue;const nearRoom=DIRS4.some(([ox,oy])=>state.legendRegion49[(y+oy)*COLS+x+ox]>=0);if(!nearRoom)setTerrainTile58(m,x,y,pathTile(x,y))}}
 for(const [r,p] of [[a,pa],[b,pb]]){setTerrainTile58(m,p.x,p.y,TT.DOOR);if(!r.ports.some(z=>z.x===p.x&&z.y===p.y))r.ports.push({...p});}
 state.legendPaths49.push({from:a.index,to:b.index,width:w,cells:route});
}
function addDecor47(x,y,kind,label,opts={}){if(!insideMapInterior(x,y))return;const d={x,y,kind,label,...opts};state.legendDecor47.push(d);state.legendDecorGrid47[key46(x,y)]=d;return d}
function markRooms47(rs){state.legendPattern47={};for(const r of rs)for(let y=r.y+1;y<r.y+r.h-1;y++)for(let x=r.x+1;x<r.x+r.w-1;x++)state.legendPattern47[key46(x,y)]=r.index%4}
function stamp49(x,y,w,h,kind,label,solid=true){const t=LEGEND_TILES49[state.legendTheme47],object={x,y,w,h,kind,label,solid,theme:state.legendTheme47};state.legendObjects49.push(object);for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){if(!insideMapInterior(x+dx,y+dy))continue;if(solid)setTerrainTile58(state.map,x+dx,y+dy,t.solid);addDecor47(x+dx,y+dy,kind,label,{object49:object,dx,dy,w,h})}return object}
function architecture47(a,rs){const t=LEGEND_TILES49[a.id],spec=LEGEND_DUNGEON_LAYOUTS[a.id];
 for(const r of rs){const{ x,y,w,h,cx,cy,index:i,kind}=r;
  // Keep a two-cell perimeter aisle and all thresholds; fixtures occupy planned bays.
  const bayW=Math.max(1,Math.min(3,w-6)),bayH=Math.max(1,Math.min(3,h-6));
  if(kind==='grand'){
   const left=x+3,right=x+w-6,top=y+3;stamp49(left,top,3,3,'monumentA',LEGEND_THEMES47[a.id].landmarks[0]);stamp49(right,top,3,3,'monumentB',LEGEND_THEMES47[a.id].landmarks[1]);
   if(h>=14){for(const xx of [x+3,x+w-4])for(let yy=y+8;yy<y+h-3;yy+=4)stamp49(xx,yy,1,2,'column','대성소 기둥');}
   state.legendLandmark47={x:cx,y:cy,r:3,style:LEGEND_THEMES47[a.id].style,id:a.id};
   for(let yy=cy;yy<Math.min(y+h-2,cy+4);yy++)for(let xx=cx-2;xx<=cx+2;xx++)if(!tileBlocks(state.map[yy][xx])){setTerrainTile58(state.map,xx,yy,t.base+1);addDecor47(xx,yy,'mosaic','성소 모자이크',{dx:xx-cx+2,dy:yy-cy,w:5,h:4})}
  }else if(kind==='court'&&w>=11&&h>=8){
   // Outdoor cloister around an actual roofless building with two offset entries.
   const bx=x+3,by=y+3,bw=Math.min(7,w-6),bh=Math.min(6,h-4);
   if(bw>=5&&bh>=4){for(let yy=by;yy<by+bh;yy++)for(let xx=bx;xx<bx+bw;xx++)setTerrainTile58(state.map,xx,yy,(xx===bx||xx===bx+bw-1||yy===by||yy===by+bh-1)?t.walls[1]:t.base+2);
    setTerrainTile58(state.map,bx,by+1,TT.DOOR);setTerrainTile58(state.map,bx+bw-1,by+bh-2,TT.DOOR);state.legendBuildings49.push({x:bx,y:by,w:bw,h:bh});addDecor47(bx+2,by,'lintel','정자 지붕받침');}
  }else if(kind!=='entry'&&kind!=='vault'&&w>=10&&h>=9){stamp49(x+3,y+3,bayW,i%2?Math.min(2,bayH):bayH,i%2?'workset':'shrine',LEGEND_THEMES47[a.id].props[i%4]);}
  if(kind==='grand'&&h>=13){
   // Offset screens split the ceremonial floor into connected aisles and chambers.
   const wallY=y+Math.floor(h*.52);
   if(a.id==='water_crossbow'){
    for(let yy=y+2;yy<y+h-2;yy++)for(const xx of[cx-3,cx-2])if(!state.legendDecorGrid47[key46(xx,yy)]?.object49)setTerrainTile58(state.map,xx,yy,TT.WATER);
    for(const yy of[cy,y+h-3])for(const xx of[cx-3,cx-2])setTerrainTile58(state.map,xx,yy,t.bridge);
    for(let xx=x+2;xx<x+w-2;xx++)if(xx<cx-5||xx>cx+3)setTerrainTile58(state.map,xx,wallY,t.walls[1]);
    setTerrainTile58(state.map,x+4,wallY,TT.DOOR);setTerrainTile58(state.map,x+w-5,wallY,TT.DOOR);
   }else if(a.id==='curse_blade'||a.id==='ward_hammer'){
    for(let xx=x+2;xx<x+w-2;xx++)setTerrainTile58(state.map,xx,wallY,t.walls[1]);
    for(const xx of[x+4,cx+2,x+w-5])setTerrainTile58(state.map,xx,wallY,TT.DOOR);
    for(let yy=wallY+1;yy<y+h-2;yy++)setTerrainTile58(state.map,cx-3,yy,t.walls[0]);setTerrainTile58(state.map,cx-3,y+h-3,TT.DOOR);
   }else if(a.id==='mirror_blade'){
    for(let yy=y+7;yy<y+h-2;yy++)for(const xx of[cx-5,cx+5])setTerrainTile58(state.map,xx,yy,t.walls[1]);
    setTerrainTile58(state.map,cx-5,y+h-3,TT.DOOR);setTerrainTile58(state.map,cx+5,y+8,TT.DOOR);
   }else if(a.id==='chain_sickle'){
    for(let xx=x+2;xx<x+w-2;xx+=5){for(let yy=y+8;yy<y+h-1;yy++)setTerrainTile58(state.map,xx,yy,t.walls[1]);setTerrainTile58(state.map,xx,y+h-3,TT.DOOR);}
   }else if(a.id==='ember_axe'){
    for(let yy=y+8;yy<y+h-3;yy++)for(const xx of[cx-4,cx+4])setTerrainTile58(state.map,xx,yy,TT.LAVA);
    for(const xx of[cx-4,cx+4])setTerrainTile58(state.map,xx,cy+1,t.bridge);
    for(let xx=x+2;xx<cx-5;xx++)setTerrainTile58(state.map,xx,wallY,t.walls[0]);
   }else{
    for(let xx=x+2;xx<x+w-2;xx++)if(Math.abs(xx-cx)>2)setTerrainTile58(state.map,xx,wallY,t.walls[1]);
    setTerrainTile58(state.map,x+4,wallY,TT.DOOR);setTerrainTile58(state.map,x+w-5,wallY,TT.DOOR);
   }
  }
  // Carved side chambers, colonnades and service galleries preserve the perimeter route.
  if(kind==='grand'){
   const splitXs=a.id==='curse_spear'?[x+8,x+w-9]:a.id==='ward_hammer'?[x+9,x+w-10]:[];
   for(const xx of splitXs){for(let yy=y+1;yy<y+h-1;yy++)if(!state.legendDecorGrid47[key46(xx,yy)]?.object49)setTerrainTile58(state.map,xx,yy,t.walls[1]);for(const yy of[y+2,y+h-3])setTerrainTile58(state.map,xx,yy,TT.DOOR);}
   for(let xx=x+7;xx<x+w-6;xx+=5)for(const yy of[y+2,y+h-3])if(Math.abs(xx-cx)>2&&!DIRS8.some(([dx,dy])=>state.map[yy+dy]?.[xx+dx]===TT.DOOR)&&!state.legendDecorGrid47[key46(xx,yy)]&&state.map[yy][xx]>=t.base&&state.map[yy][xx]<t.base+4)stamp49(xx,yy,1,1,'column','측랑 열주');
  }
  if(kind==='court'&&w>=19){
   const bx=x+w-7,by=y+2,bw=5,bh=Math.min(h-4,6);
   if(bh>=4){for(let yy=by;yy<by+bh;yy++)for(let xx=bx;xx<bx+bw;xx++)setTerrainTile58(state.map,xx,yy,(xx===bx||xx===bx+bw-1||yy===by||yy===by+bh-1)?t.walls[0]:t.base);setTerrainTile58(state.map,bx,by+1,TT.DOOR);setTerrainTile58(state.map,bx+bw-1,by+bh-2,TT.DOOR);state.legendBuildings49.push({x:bx,y:by,w:bw,h:bh});}
  }
  if(kind==='work'&&w>=12&&h>=10){
   const yy=y+h-4;for(let xx=x+2;xx<x+w-6;xx++)if(!state.legendDecorGrid47[key46(xx,yy)]?.object49)setTerrainTile58(state.map,xx,yy,t.walls[1]);setTerrainTile58(state.map,x+3,yy,TT.DOOR);
   if(a.id==='chain_sickle'||a.id==='curse_spear')for(let xx=x+5;xx<x+w-6;xx+=4)stamp49(xx,y+2,2,2,'shrine',LEGEND_THEMES47[a.id].props[2]);
  }
  // Architectural floor bands distinguish circulation from occupied bays in the same room.
  for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++){
   const tile=state.map[yy][xx];if(tile<t.base||tile>t.base+3)continue;
   const perimeter=xx===x+1||xx===x+w-2||yy===y+1||yy===y+h-2;
   const aisle=Math.abs(xx-cx)<=1;
   if(perimeter)setTerrainTile58(state.map,xx,yy,t.base+2);
   else if(aisle&&kind!=='court')setTerrainTile58(state.map,xx,yy,t.base+1);
   else if(kind==='grand'&&yy>cy+1&&xx>cx+2)setTerrainTile58(state.map,xx,yy,t.base);
  }
  if(kind==='tower'){
   // Chamfered tower corners and an interior ring aisle, unlike rectangular workshops.
   for(const[dx,dy]of[[1,1],[-1,1],[1,-1],[-1,-1]]){const xx=dx>0?x+1:x+w-2,yy=dy>0?y+1:y+h-2;setTerrainTile58(state.map,xx,yy,t.walls[2]);}
   if(w>=12&&h>=11){stamp49(cx-1,cy-1,2,2,'shrine','절연 탑심');}
  }
  // Distinct narrow antechambers divide long halls without making an empty cross.
  if((kind==='hall'||kind==='work')&&w>=14&&h>=9){const xx=x+w-5;for(let yy=y+1;yy<y+h-1;yy++)setTerrainTile58(state.map,xx,yy,t.walls[0]);setTerrainTile58(state.map,xx,y+h-3,TT.DOOR);}
  for(let xx=x+2;xx<x+w-2;xx+=3){if(tileBlocks(state.map[y][xx]))addDecor47(xx,y,'wall'+((xx+i)%4),LEGEND_THEMES47[a.id].walls[(xx+i)%4]);}
  for(let yy=y+2;yy<y+h-2;yy+=3){if(tileBlocks(state.map[yy][x]))addDecor47(x,yy,'wall'+((yy+i)%4),LEGEND_THEMES47[a.id].walls[(yy+i)%4]);}
  for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++){if(tileBlocks(state.map[yy][xx])||state.map[yy][xx]===TT.DOOR)continue;const h0=(xx*17+yy*23+i*7)%29;if(h0<4)addDecor47(xx,yy,'floor'+h0,LEGEND_THEMES47[a.id].floordecor[h0]);}
  for(const[xx,yy]of[[x+1,y+1],[x+w-2,y+h-2]]){addDecor47(xx,yy,'light','전용 조명');state.legendLights49.push({x:xx,y:yy,color:i%2?LEGEND_THEMES47[a.id].light:LEGEND_THEMES47[a.id].warm,r:3.2,power:.28});}
 }
 // Water is physically connected outside the masonry buildings; other hazards occupy courtyards, never necessary routes.
 if(a.id==='water_crossbow')for(const r of rs.filter(r=>r.kind==='court')){for(let yy=r.y+1;yy<r.y+r.h-1;yy++)if(yy!==r.cy)setTerrainTile58(state.map,r.x+1,yy,TT.WATER);for(const p of r.ports){setTerrainTile58(state.map,p.x-p.dx,p.y-p.dy,t.bridge)}addDecor47(r.x+1,r.y+1,'waterfall','삼단 낙수 수문');state.legendLights49.push({x:r.x+1,y:r.y+2,color:'#72b8af',r:4,power:.22})}
 for(const p of state.legendPaths49){for(let i=3;i<p.cells.length-3;i+=7){const q=p.cells[i];addDecor47(q.x,q.y,'route','회랑 인레이');}}
 for(const i of spec.bonus){const r=rs[i],x=r.x+2,y=r.y+r.h-2;PlacementService.placeItem({...clone(CONSUMABLES.find(v=>v.type==='potion')||CONSUMABLES[0]),x,y,count:1});}
}
function guard47(elem){return elem==='fire'&&possesses47('ember_axe')}
function buildIndoorLandmark105(map,r,id){
 const w=r.w,h=r.h,cx=r.cx-r.x,cy=r.cy-r.y,kind=r.landmark105,flip=rand(0,1);r.landmarkFlip105=flip;
 const coord=(x,y)=>({x:r.x+(flip?w-1-x:x),y:r.y+y});
 const raw=(x,y,t)=>{const q=coord(x,y);setTerrainTile58(map,q.x,q.y,t);return q};
 // A dry perimeter and central crossing keep every potential graph port connected.
 const put=(x,y,t)=>{if(x<=1||y<=1||x>=w-2||y>=h-2||x===(flip?w-1-cx:cx)||y===cy)return;return raw(x,y,t)};
 const fill=(x,y,ww,hh,t)=>{for(let dy=0;dy<hh;dy++)for(let dx=0;dx<ww;dx++)put(x+dx,y+dy,t)};
 if(id==='canal'){
  if(kind==='split'){
   for(const y of [3,6,h-5]){for(let dy=0;dy<2;dy++)for(let x=2;x<w-2;x++)if(x!==4&&x!==w-5)put(x,y+dy,TT.WATER);}for(const x of [6,w-7]){put(x,5,TT.WALL);put(x,h-3,TT.RUMOR_GAS_PIPE);}
   for(const x of [4,w-5])for(const y of [4,h-4])put(x,y,TT.STONE_PILLAR);
   for(const [x,y]of[[2,5],[w-3,h-4]])put(x,y,TT.RUMOR_FLOOD_GRATE);
  }else if(kind==='settling'){
   fill(2,3,6,3,TT.WATER);fill(w-8,3,6,6,TT.WATER);fill(3,h-6,5,4,TT.WATER);fill(w-7,h-5,4,2,TT.WATER);
   for(const [x,y]of[[2,7],[w-3,10],[10,h-3]])put(x,y,TT.RUMOR_FLOOD_GRATE);
   for(const [x,y]of[[6,7],[w-6,h-4]])put(x,y,TT.STONE_PILLAR);
  }else if(kind==='drowned'){
   const cells=[];for(let y=3;y<=6;y++)for(let x=3;x<=7;x++){const q=raw(x,y,TT.WATER),t=x===5&&y!==5?TT.WALL:x===7&&y===3?TT.CRATE:TT.FLOOR;cells.push({...q,t,...(t===TT.CRATE?{underlay:TT.FLOOR}:{})});}
   r.landmarkReveal105={cells,switch:coord(3,2)};
   for(const x of [w-6,w-4]){fill(x,3,1,3,TT.WALL);put(x,h-4,TT.RUMOR_GAS_PIPE);}put(4,h-4,TT.RACK);
  }else if(kind==='moss'){
   for(let y=3;y<h-3;y++){put(3+(y>cy?1:0),y,TT.WATER);put(w-4-(y<cy?1:0),y,TT.WATER);}
   for(const [gx,gy]of[[5,3],[w-8,3],[5,h-6],[w-8,h-6]]){fill(gx,gy,3,3,TT.LIGHT_GRASS);for(const [dx,dy]of[[0,0],[2,2]])put(gx+dx,gy+dy,TT.HEDGE);put(gx+1,gy+1,TT.GARDEN_TREE);}
   for(const y of [3,h-5]){fill(2,y,2,2,TT.WATER);fill(w-4,y,2,2,TT.WATER);}

   put(2,h-4,TT.BENCH);put(w-3,3,TT.STONE_PILLAR);
  }else if(kind==='pump'){
   for(const x of [4,7,w-8,w-5])for(let y=3;y<h-3;y++)if(y!==(x===7?4:h-5))put(x,y,TT.WALL);
   for(let y=2;y<h-2;y++)put(cx+2,y,TT.WATER);
   for(const [x,y]of[[3,4],[6,h-4],[w-4,5]])put(x,y,TT.RUMOR_GAS_PIPE);
  }
 }else{
  if(kind==='stacks'){
   for(const x of [4,7,w-8,w-5])for(let y=3;y<h-3;y++)if(y!==(x===7?5:h-5))put(x,y,TT.WALL);
   for(const [x,y]of[[3,4],[6,h-4],[w-4,4],[w-4,h-4]])put(x,y,TT.RUMOR_SMUGGLER_BUNDLE);
   put(6,3,TT.CRATE);put(w-4,7,TT.CRATE);
  }else if(kind==='kitchen'){
   for(const [bx,by]of[[3,3],[w-7,4],[3,h-7],[w-7,h-6]]){for(let dx=0;dx<4;dx++)put(bx+dx,by,TT.WALL);for(let dy=1;dy<=2;dy++){put(bx,by+dy,TT.RUMOR_CHARRED_COUNTER);put(bx+3,by+dy,TT.RUMOR_CHARRED_COUNTER);}put(bx+1,by+1,TT.COOKPOT);}
   for(const x of [4,w-5])put(x,cy+1,TT.BENCH);
   for(const [x,y]of[[3,3],[w-4,6],[3,h-4]])put(x,y,TT.COOKPOT);
   put(w-4,h-4,TT.CRATE);put(6,h-4,TT.JAR);
  }else if(kind==='cold'){
   for(const x of [2,w-5])for(let y=3;y<h-3;y++)if(y!==5&&y!==h-6)for(let dx=0;dx<2;dx++)put(x+dx,y,TT.WATER);for(const y of [3,h-4])for(let x=5;x<w-5;x++)put(x,y,TT.WATER);
   for(const y of [4,7,h-5])for(const x of [6,w-7])put(x,y,TT.JAR);
   for(const [x,y]of[[7,5],[w-8,h-5],[6,h-4]])put(x,y,TT.STONE_PILLAR);
  }else if(kind==='tally'){
   for(const y of [5,h-6])for(let x=3;x<w-3;x++)if(x!==4&&x!==w-5)put(x,y,TT.WALL);
   for(const [bx,by]of[[3,3],[w-7,3],[3,h-4],[w-7,h-4]]){put(bx,by,TT.RUMOR_ARCHIVE_PILE);put(bx+1,by,TT.RUMOR_ARCHIVE_PILE);put(bx+2,by,TT.RACK);}
   for(const [x,y]of[[4,7],[w-5,7],[4,h-8],[w-5,h-8]])put(x,y,TT.RUMOR_CHARRED_COUNTER);
   put(w-4,3,TT.RUMOR_INVESTIGATION_BOARD);put(3,h-4,TT.RACK);put(w-4,7,TT.CRATE);
  }else if(kind==='rats'){
   const bx=w-8,by=3;for(let y=by;y<by+5;y++)for(let x=bx;x<bx+5;x++)raw(x,y,(x===bx||x===bx+4||y===by||y===by+4)?TT.WALL:TT.FLOOR);
   const qa=coord(bx,by),qb=coord(bx+4,by+4);r.landmarkRatBounds105={x:Math.min(qa.x,qb.x),y:by+r.y,w:5,h:5};r.landmarkRatDoor105=raw(bx+2,by+4,TT.DOOR);r.landmarkRatCells105=[coord(bx+1,by+2),coord(bx+3,by+2)];r.landmarkRatReward105=coord(bx+2,by+1);
   for(const y of [h-6,h-4])for(const x of [3,6,w-5])put(x,y,x===6?TT.WALL:TT.RUMOR_SMUGGLER_BUNDLE);
   for(let y=3;y<cy-1;y++)put(4,y,TT.CRATE);
  }
 }
 // The room centre is the existing generator's navigation anchor.
 setTerrainTile58(map,r.cx,r.cy,TT.FLOOR);
}
