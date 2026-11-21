// 23층 · 수몰 회색 도성. The floor is a grey river city sunk to its quays: fourteen stone islands in a grid of canals around a
// mercury basin, the palace island in its middle. Like the mirror tower, the builder writes a semantic plan (zone, height,
// owner per cell; buildings and bridges as whole objects) and cityart.js draws from that plan, never from tile guessing.
//
// Zones: X edge · w canal · m mercury basin · q quay street · a alley · p plaza · t terrace (raised court) · H house/hall wall
//        i hall interior · b bridge (fixed) · d drawbridge (lowered by a sluice switch) · g causeway · c palace island
// Heights: canal/basin 0 · streets, alleys, plazas, halls 1 · terraces 2 · palace island 3.
const CITY23=Object.freeze({
  cols:[[2,14],[19,14],[36,23],[62,14],[79,14]],
  rows:[[2,17],[22,19],[44,17]],
  basin:{x:33,y:19,w:29,h:25},
  core:{x:40,y:25,w:15,h:13},
  // the four sluice houses sit on the corner islands; each one lowers a drawbridge and drains a stretch of canal
  sluices:[[0,0],[4,0],[0,1],[4,2]],
  start:[0,2]
});
const CITY23_HEIGHT=Object.freeze({X:0,w:0,m:0,q:1,a:1,p:1,i:1,H:1,b:1,d:1,g:1,t:2,c:3});

function buildDrownedCity(m){
  const R=()=>globalThis.__MANRU_RANDOM57__(),ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=COLS,H=ROWS,zone=Array.from({length:H},()=>Array(W).fill('w')),owner=Array.from({length:H},()=>Array(W).fill(0));
  const put=(x,y,z,t)=>{if(x<1||y<1||x>=W-1||y>=H-1)return;zone[y][x]=z;setTerrainTile58(m,x,y,t)};
  const rect=(x,y,w,h,z,t)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,z,t)};
  state.rooms=[];state.routeTags=[];state.switches=[];state.featureRooms=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const edge=x===0||y===0||x===W-1||y===H-1;zone[y][x]=edge?'X':'w';setTerrainTile58(m,x,y,edge?TT.WALL:TT.WATER)}
  const B=CITY23.basin,C=CITY23.core;
  rect(B.x,B.y,B.w,B.h,'m',TT.MERCURY);

  const buildings=[],bridges=[],islands=[],wallStyleByCell={};let nextId=1;
  const house=(x,y,w,h,kind)=>{const id=nextId++,b={id,x,y,w,h,kind,roof:w>=h?'ew':'ns',tone:ri(0,3)};buildings.push(b);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){put(xx,yy,'H',TT.WALL);owner[yy][xx]=id;wallStyleByCell[k(xx,yy)]=kind==='hall'?'timber':'plaster'}return b};

  // ---- islands: a quay ring, then lots split by alleys; each lot becomes a roofed house, a plaza, a raised court or a hall
  const lotsOf=(x,y,w,h,depth=0)=>{
    const minLot=3,split=w>h?'v':'h',long=split==='v'?w:h;
    if(long<minLot*2+1||depth>3&&R()<.5||w*h<=26)return[{x,y,w,h}];
    const cut=ri(minLot,long-minLot-1);
    if(split==='v')return[...lotsOf(x,y,cut,h,depth+1),...lotsOf(x+cut+1,y,w-cut-1,h,depth+1)];
    return[...lotsOf(x,y,w,cut,depth+1),...lotsOf(x,y+cut+1,w,h-cut-1,depth+1)];
  };
  for(let r=0;r<3;r++)for(let c=0;c<5;c++){
    if(r===1&&c===2)continue;
    const [x,cw]=CITY23.cols[c],[y,rh]=CITY23.rows[r],isl={id:islands.length,c,r,x,y,w:cw,h:rh,lots:[]};islands.push(isl);
    rect(x,y,cw,rh,'q',TT.STONE_PATH);
    const ix=x+2,iy=y+2,iw=cw-4,ih=rh-4;rect(ix,iy,iw,ih,'a',TT.FLOOR);
    const sluice=CITY23.sluices.some(([sc,sr])=>sc===c&&sr===r),start=CITY23.start[0]===c&&CITY23.start[1]===r;
    // a sluice island reserves its hall along the top of the inner block first; the rest is split into lots below an alley
    const reserved=sluice?{x:ix,y:iy,w:Math.min(8,iw),h:6}:null;
    const lots=(reserved?[reserved,...lotsOf(ix,iy+7,iw,ih-7)]:lotsOf(ix,iy,iw,ih).sort((a,b)=>b.w*b.h-a.w*a.h));isl.lots=lots;
    lots.forEach((lot,i)=>{
      if(i===0&&(sluice||R()<.35)&&lot.w>=5&&lot.h>=5){
        // an enterable hall: wall ring, timber floor inside, one door onto the street side
        const b=house(lot.x,lot.y,lot.w,lot.h,sluice?'sluice':'hall');
        rect(lot.x+1,lot.y+1,lot.w-2,lot.h-2,'i',TT.WOOD_FLOOR);for(let yy=lot.y+1;yy<lot.y+lot.h-1;yy++)for(let xx=lot.x+1;xx<lot.x+lot.w-1;xx++)owner[yy][xx]=b.id;
        const door={x:lot.x+Math.floor(lot.w/2),y:lot.y+lot.h-1};put(door.x,door.y,'H',TT.DOOR);b.door=door;isl.hall=b;
        if(lot.w>=6)for(const dx of [1,lot.w-2])put(lot.x+dx,lot.y+1,'i',TT.GOLD_LAMP);
        return;
      }
      if(!isl.plaza&&lot.w>=3&&lot.h>=3&&(i===1||i===lots.length-1)){isl.plaza=lot;rect(lot.x,lot.y,lot.w,lot.h,'p',TT.FLOOR);put(lot.x+Math.floor(lot.w/2),lot.y+Math.floor(lot.h/2),'p',R()<.5?TT.FOUNTAIN:TT.GARDEN_TREE);return}
      if(!isl.terrace&&!start&&lot.w>=5&&lot.h>=4&&R()<.55){
        // a raised court two steps above the street, steps on its south side
        isl.terrace=lot;rect(lot.x,lot.y,lot.w,lot.h,'t',TT.MOON_STONE);
        for(const [dx,dy] of [[0,0],[lot.w-1,0]])put(lot.x+dx,lot.y+dy,'t',TT.STONE_PILLAR);
        put(lot.x+Math.floor(lot.w/2),lot.y+1,'t',TT.INCENSE_STAND);return;
      }
      // a plain house: the whole lot is one roofed block, a little inset where the lot is large so the alleys widen
      const inset=lot.w>=6&&lot.h>=5&&R()<.5?1:0;
      if(inset)rect(lot.x,lot.y,lot.w,lot.h,'a',TT.FLOOR);
      house(lot.x+inset,lot.y+inset,lot.w-inset*2,lot.h-inset*2,'house');
    });
    // lanterns stand at the quay corners
    for(const [dx,dy] of [[0,0],[cw-1,0],[0,rh-1],[cw-1,rh-1]])put(x+dx,y+dy,'q',TT.LANTERN_POST);
  }

  // ---- bridges between neighbouring islands: one fixed stone bridge per neighbour pair, 2 wide, in the middle of the overlap
  const isl=(c,r)=>islands.find(v=>v.c===c&&v.r===r);
  const bridge=(cells,axis,kind)=>{const b={id:bridges.length+1,axis,kind,cells:cells.map(c=>({...c}))};bridges.push(b);for(const c of cells){put(c.x,c.y,kind==='draw'?'d':'b',kind==='draw'?TT.DRAWBRIDGE_UP:TT.DRAWBRIDGE_DOWN);owner[c.y][c.x]=b.id}return b};
  const span=(a,b,axis,at,width,kind)=>{const cells=[];if(axis==='ew'){for(let x=a.x+a.w;x<b.x;x++)for(let q=0;q<width;q++)cells.push({x,y:at+q})}else{for(let y=a.y+a.h;y<b.y;y++)for(let q=0;q<width;q++)cells.push({x:at+q,y})}return bridge(cells,axis,kind)};
  const pairs=[];
  for(const a of islands){const e=isl(a.c+1,a.r),s=isl(a.c,a.r+1);if(e)pairs.push([a,e,'ew']);if(s)pairs.push([a,s,'ns'])}
  for(const [a,b,axis] of pairs){
    if(axis==='ew'){const lo=Math.max(a.y,b.y)+2,hi=Math.min(a.y+a.h,b.y+b.h)-4;span(a,b,'ew',ri(lo,hi),2,'arch')}
    else{const lo=Math.max(a.x,b.x)+2,hi=Math.min(a.x+a.w,b.x+b.w)-4;span(a,b,'ns',ri(lo,hi),2,'arch')}
  }
  // the islands next to the basin reach it only through the causeway: their basin-side quays stay bare

  // ---- the palace island: marble ground three steps up, the throne hall to the north holds the stairs
  rect(C.x,C.y,C.w,C.h,'c',TT.MOON_STONE);
  const palace={x:C.x+3,y:C.y,w:C.w-6,h:6};const hall=house(palace.x,palace.y,palace.w,palace.h,'palace');
  rect(palace.x+1,palace.y+1,palace.w-2,palace.h-2,'i',TT.GILDED_FLOOR);for(let yy=palace.y+1;yy<palace.y+palace.h-1;yy++)for(let xx=palace.x+1;xx<palace.x+palace.w-1;xx++)owner[yy][xx]=hall.id;
  const hallDoor={x:C.x+Math.floor(C.w/2),y:palace.y+palace.h-1};put(hallDoor.x,hallDoor.y,'H',TT.DOOR);hall.door=hallDoor;
  for(const [dx,dy] of [[1,7],[C.w-2,7],[1,C.h-2],[C.w-2,C.h-2]])put(C.x+dx,C.y+dy,'c',TT.STONE_PILLAR);
  for(const dx of [-2,2])put(hallDoor.x+dx,hallDoor.y+1,'c',TT.GOLD_LAMP);
  const exit={x:hallDoor.x,y:palace.y+2};

  // ---- the causeway: from the south-middle island straight north over the basin; its last three cells are the gate
  const south=isl(2,2),cx0=C.x+Math.floor(C.w/2)-1,causeway=[];
  for(let y=C.y+C.h;y<south.y;y++)for(let q=0;q<3;q++)causeway.push({x:cx0+q,y});
  for(const c of causeway){put(c.x,c.y,'g',TT.DRAWBRIDGE_DOWN)}
  const gateCells=[0,1,2].map(q=>({x:cx0+q,y:C.y+C.h}));for(const g of gateCells)setTerrainTile58(m,g.x,g.y,TT.WALL);
  // the dragon is aquatic: it waits in the mercury just west of the palace island, within reach of its shore
  const centerEntry={x:cx0+1,y:C.y+C.h-1},bossSpawn={x:C.x-3,y:C.y+Math.floor(C.h/2)};

  // ---- sluice switches and their waterworks
  const controls=[],switchIds=[],hydraulicCellMeta={};
  const nearestCanal=(isle,side)=>{
    // a straight run of canal along one side of the island, inside the canal channel next to it
    const cells=[];if(side==='e'){const x=isle.x+isle.w+1;for(let y=isle.y+2;y<isle.y+isle.h-2;y++)if(zone[y]?.[x]==='w')cells.push({x,y})}
    else if(side==='w'){const x=isle.x-2;for(let y=isle.y+2;y<isle.y+isle.h-2;y++)if(zone[y]?.[x]==='w')cells.push({x,y})}
    else if(side==='n'){const y=isle.y-2;for(let x=isle.x+2;x<isle.x+isle.w-2;x++)if(zone[y]?.[x]==='w')cells.push({x,y})}
    else{const y=isle.y+isle.h+1;for(let x=isle.x+2;x<isle.x+isle.w-2;x++)if(zone[y]?.[x]==='w')cells.push({x,y})}
    return cells;
  };
  CITY23.sluices.forEach(([c,r],i)=>{
    const isle=isl(c,r),b=isle.hall,id=`f23-sw-${i+1}`;switchIds.push(id);
    const sx=b.x+Math.floor(b.w/2),sy=b.y+1;setTerrainTile58(m,sx,sy,TT.SWITCH);zone[sy][sx]='i';
    state.switches.push({id,kind:'f23-center',x:sx,y:sy,used:false});
    // drawbridge: a second crossing toward the basin side of this island, raised until the sluice turns
    const toward=c<2?'e':'w',far=toward==='e'?isl(c+1,r):isl(c-1,r),side=r===0?'s':r===2?'n':null,changes=[];
    const drawCells=[];if(far){
      const a=toward==='e'?isle:far,bb=toward==='e'?far:isle,lo=Math.max(a.y,bb.y)+2,hi=Math.min(a.y+a.h,bb.y+bb.h)-4;
      // the raised span keeps three rows clear of the fixed bridge over the same canal
      const taken=bridges.filter(v=>v.axis==='ew'&&v.cells.some(q=>q.x===a.x+a.w)).flatMap(v=>v.cells.map(q=>q.y));
      const rows=[];for(let y=lo;y<=hi;y++)if(taken.every(t=>Math.abs(t-y)>=3&&Math.abs(t-(y+1))>=3))rows.push(y);
      const at=rows.length?rows[Math.floor(rows.length/2)]:null;if(at!=null)for(let x=a.x+a.w;x<bb.x;x++)for(let q=0;q<2;q++)drawCells.push({x,y:at+q});
    }
    const dr=drawCells.length?bridge(drawCells,'ew','draw'):null;if(dr)for(const q of dr.cells)changes.push({x:q.x,y:q.y,before:TT.DRAWBRIDGE_UP,after:TT.DRAWBRIDGE_DOWN});
    // drain: the canal run on the island's outer side empties to its stone bed
    const outer=c===0?'w':c===4?'e':r===0?'n':'s';
    for(const q of nearestCanal(isle,outer).concat(side?nearestCanal(isle,side==='s'?'s':'n').slice(0,6):[]))changes.push({x:q.x,y:q.y,before:TT.WATER,after:TT.STONE_PATH});
    const control={switchId:id,type:['diversion','spillway','sluice-reverse','pressure-release'][i],label:`제${i+1} 수문`,changes,activated:false,
      hydraulic:{drain:changes.filter(ch=>ch.before===TT.WATER).length,flood:0,bridge:changes.filter(ch=>ch.after===TT.DRAWBRIDGE_DOWN).length}};
    controls.push(control);for(const ch of changes)hydraulicCellMeta[k(ch.x,ch.y)]={control:i,type:control.type,before:ch.before,after:ch.after};
    state.featureRooms.push({name:`제${i+1} 수문관`,x:b.x,y:b.y,w:b.w,h:b.h,kind60:'f23-sluice'});
  });

  // ---- start and finish
  const s=isl(...CITY23.start),start={x:s.x+1,y:s.y+s.h-2};setTerrainTile58(m,start.x,start.y,TT.STONE_PATH);
  setEnds(start,exit);zone[exit.y][exit.x]='i';
  for(const v of islands){state.rooms.push(roomRect(v.x,v.y,v.w,v.h));state.featureRooms.push({name:`수몰 도성 제 ${v.id+1}구역`,x:v.x,y:v.y,w:v.w,h:v.h,kind60:'f23-district'})}
  state.featureRooms.push({name:'중앙 수은호',x:B.x,y:B.y,w:B.w,h:B.h,kind60:'mercury-core'},{name:'수몰 왕궁',x:C.x,y:C.y,w:C.w,h:C.h,kind60:'mercury-platform'});

  state.floor23={version:20,artVersion:20,preserveAuthoredGeometry:true,centerUnlocked:false,thresholdTriggered:false,keyAcquired:false,
    routeCheckpoints:[start,...switchIds.map(id=>{const sw=state.switches.find(v=>v.id===id);return{x:sw.x,y:sw.y}}),centerEntry].map(q=>({...q})),
    gateCells,centerEntry,bossSpawn,centerBounds:{...B},switchIds,controls,hydraulicCellMeta,reveal:null,wallStyleByCell,
    districts:islands.map(v=>({id:v.id+1,x:v.x,y:v.y,w:v.w,h:v.h})),innerDistrictBounds:[],transitBuildings:[],
    city:{zone:zone.map(r=>r.join('')),owner,buildings,bridges,causeway:causeway.map(q=>({...q})),basin:{...B},core:{...C}}};
  state.layoutName='수몰 회색 도성 · 열네 섬과 석교 / 네 수문관 / 수은호 위 둑길 / 수몰 왕궁';
}

// The floor's own audit: switches and stairs, the closed and opened centre, the key drop and the dragon.
function validateDrownedCity(){
  const q=state.floor23;if(state.floor!==23||!q?.city)return{ok:false,reason:'missing-drowned-city'};
  const closed=floodSpecial60(state.player,{centerOpen:false}),opened=floodSpecial60(state.player,{centerOpen:true}),has=p=>closed.has(k(p.x,p.y)),hasOpen=p=>opened.has(k(p.x,p.y));
  const switches=(q.switchIds||[]).map(id=>state.switches?.find(v=>v.id===id)),controls=q.controls||[];
  const switchReach=switches.every((sw,i)=>controls[i]?.activated||(sw&&state.map[sw.y]?.[sw.x]===TT.SWITCH&&has(sw)));
  const centerClosed=q.centerUnlocked||(!has(q.centerEntry)&&!has(q.bossSpawn)&&!has(state.stairs)),centerOpen=hasOpen(q.centerEntry)&&hasOpen(state.stairs);
  const inCore=(x,y)=>x>=q.centerBounds.x&&x<q.centerBounds.x+q.centerBounds.w&&y>=q.centerBounds.y&&y<q.centerBounds.y+q.centerBounds.h;
  const safeDrop=[...opened.keys()].some(kk=>{const[x,y]=kk.split(',').map(Number),t=state.map[y]?.[x];return inCore(x,y)&&!tileBlocks(t)&&![TT.MERCURY,TT.VOID,TT.WATER,TT.LAVA,TT.TRAP,TT.SNARE].includes(t)});
  const dragon=(state.monsters||[]).find(m=>m.name==='여의 수룡'&&m.hpThreshold57?.event==='f23-progress-key');
  const dragonReady=!dragon||inCore(dragon.x,dragon.y)&&[...opened.keys()].some(kk=>{const[x,y]=kk.split(',').map(Number);return Math.max(Math.abs(x-dragon.x),Math.abs(y-dragon.y))<=Math.max(1,dragon.reach||1)});
  const exitClear=!(state.monsters||[]).some(m=>m.hp>0&&m.x===state.stairs.x&&m.y===state.stairs.y);
  return{floor:23,switchReach,centerClosed,centerOpen,safeDrop,dragonReady,exitClear,gateCells:q.gateCells.length,buildings:q.city.buildings.length,bridges:q.city.bridges.length,
    ok:switchReach&&centerClosed&&centerOpen&&safeDrop&&dragonReady&&exitClear&&q.gateCells.length===3};
}
