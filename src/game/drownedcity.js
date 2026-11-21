// 23층 · 수몰 회색 도성. Eight walled districts on stone embankments ring a mercury lake with the palace island in its middle.
// The route is a single loop: each district opens only into the next, alternately through a covered bridge-house and over a
// drawbridge that the previous district's sluice lowers, and the fourth sluice opens the causeway gate to the palace.
// Like the mirror tower, the builder writes a plan (zone per cell, owner per cell, buildings and bridges as whole objects with
// their own height) and cityart.js draws only from that plan. Closed buildings carry a roof that lifts when the player enters.
//
// Zones: X edge · w canal · m mercury lake · r embankment parapet · q quay street · a alley · p plaza/yard · k market square
//        g garden · u ruin · t raised court · H building wall/body · i building interior · W compound wall
//        b covered bridge deck · d drawbridge · s causeway · c palace island
const CITY23=Object.freeze({
  size:[119,83],district:[35,23],xs:[3,42,81],ys:[3,30,57],
  lake:{x:38,y:26,w:43,h:31},core:{x:50,y:33,w:19,h:16},
  // the loop, clockwise from the harbour in the south-west
  route:[[0,2],[0,1],[0,0],[1,0],[2,0],[2,1],[2,2],[1,2]],
  themes:['harbour','sluice','market','shrine','office','watch','ruins','avenue'],
  names:['포구','서수문','저잣거리','사당 언덕','관아','망루 수문','무너진 골목','대로 수문']
});
const CITY23_HEIGHT=Object.freeze({X:0,w:0,m:0,r:1,q:1,a:1,p:1,k:1,g:1,u:1,t:2,H:1,i:1,W:1,b:1,d:1,s:1,c:3});

function buildDrownedCity(m){
  const R=()=>globalThis.__MANRU_RANDOM57__(),ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)];
  const W=COLS,H=ROWS,zone=Array.from({length:H},()=>Array(W).fill('w')),owner=Array.from({length:H},()=>Array(W).fill(0));
  const put=(x,y,z,t)=>{if(x<1||y<1||x>=W-1||y>=H-1)return;zone[y][x]=z;setTerrainTile58(m,x,y,t)};
  const rect=(x,y,w,h,z,t)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,z,t)};
  state.rooms=[];state.routeTags=[];state.switches=[];state.featureRooms=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const edge=x===0||y===0||x===W-1||y===H-1;zone[y][x]=edge?'X':'w';setTerrainTile58(m,x,y,edge?TT.WALL:TT.WATER)}
  const L=CITY23.lake,C=CITY23.core,[DW,DH]=CITY23.district;
  rect(L.x,L.y,L.w,L.h,'m',TT.MERCURY);

  const buildings=[],bridges=[],encounters=[],loot=[],wallStyleByCell={};let nextId=1;
  // a building: footprint cells owned by it; closed ones are a wall ring with an interior and a door, solid ones are all body
  const building=(x,y,w,h,kind,opts={})=>{
    const id=nextId++,b={id,x,y,w,h,kind,closed:!!opts.closed,rise:opts.rise??(opts.closed?2:1),tone:ri(0,3),door:null,...opts.extra};buildings.push(b);
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const ring=!b.closed||xx===x||yy===y||xx===x+w-1||yy===y+h-1;put(xx,yy,ring?'H':'i',ring?TT.WALL:(opts.floor||TT.WOOD_FLOOR));owner[yy][xx]=id;if(ring)wallStyleByCell[k(xx,yy)]=opts.timber===false?'stone':'timber'}
    if(b.closed&&opts.door!==false){const d=opts.door||{x:x+Math.floor(w/2),y:y+h-1};put(d.x,d.y,'H',TT.DOOR);b.door={...d}}
    return b;
  };

  // ---- districts: parapet ring, quay street inside it, then a 3×2 grid of blocks separated by alleys
  const districts=CITY23.route.map(([c,r],i)=>({i,c,r,x:CITY23.xs[c],y:CITY23.ys[r],w:DW,h:DH,theme:CITY23.themes[i],name:CITY23.names[i]}));
  for(const d of districts){
    rect(d.x,d.y,d.w,d.h,'r',TT.WALL);rect(d.x+1,d.y+1,d.w-2,d.h-2,'q',TT.STONE_PATH);rect(d.x+3,d.y+3,d.w-6,d.h-6,'a',TT.FLOOR);
    for(let yy=d.y;yy<d.y+d.h;yy++)for(let xx=d.x;xx<d.x+d.w;xx++)if(zone[yy][xx]==='r')wallStyleByCell[k(xx,yy)]='stone';
    const ix=d.x+3,iy=d.y+3;d.blocks=[];for(const [by,bh] of [[iy,8],[iy+9,8]])for(const bx of [ix,ix+10,ix+20])d.blocks.push({x:bx,y:by,w:9,h:bh});
    for(const [dx,dy] of [[1,1],[d.w-2,1],[1,d.h-2],[d.w-2,d.h-2]])put(d.x+dx,d.y+dy,'q',TT.LANTERN_POST);
  }
  const merge=(a,b)=>({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.max(a.x+a.w,b.x+b.w)-Math.min(a.x,b.x),h:Math.max(a.y+a.h,b.y+b.h)-Math.min(a.y,b.y)});
  const houses=(blk)=>{
    // two or three roofed houses with a lane between
    if(R()<.5){const a=ri(3,5);building(blk.x,blk.y,a,blk.h,'house');building(blk.x+a+1,blk.y,blk.w-a-1,blk.h,'house');rect(blk.x+a,blk.y,1,blk.h,'a',TT.FLOOR)}
    else{const a=ri(3,4);building(blk.x,blk.y,blk.w,a,'house');rect(blk.x,blk.y+a,blk.w,1,'a',TT.FLOOR);const rest=blk.h-a-1;
      if(rest>=4&&R()<.6){const c=ri(3,5);building(blk.x,blk.y+a+1,c,rest,'house');rect(blk.x+c,blk.y+a+1,1,rest,'a',TT.FLOOR);building(blk.x+c+1,blk.y+a+1,blk.w-c-1,rest,'house')}
      else building(blk.x,blk.y+a+1,blk.w,rest,'house')}
  };
  const plaza=(blk,feature)=>{rect(blk.x,blk.y,blk.w,blk.h,'p',TT.FLOOR);const cx=blk.x+Math.floor(blk.w/2),cy=blk.y+Math.floor(blk.h/2);put(cx,cy,'p',feature||TT.FOUNTAIN);for(const [dx,dy] of [[-3,-2],[3,-2],[-3,2],[3,2]])if(R()<.6)put(cx+dx,cy+dy,'p',pick([TT.BENCH,TT.GARDEN_TREE,TT.LANTERN_POST]))};
  const garden=(blk)=>{rect(blk.x,blk.y,blk.w,blk.h,'g',TT.GRASS);rect(blk.x+3,blk.y+3,blk.w-6,blk.h-6,'w',TT.WATER);for(let i=0;i<4;i++)put(blk.x+ri(0,blk.w-1),pick([blk.y,blk.y+blk.h-1]),'g',TT.GARDEN_TREE)};
  const ruin=(blk)=>{
    // collapsed houses half under water: rubble floor, broken wall stubs, a flooded hollow, and something waiting in it
    rect(blk.x,blk.y,blk.w,blk.h,'u',TT.FLOOR);const pool={x:blk.x+ri(1,3),y:blk.y+ri(1,2),w:ri(3,4),h:ri(3,4)};rect(pool.x,pool.y,pool.w,pool.h,'w',TT.WATER);
    for(let i=0;i<6;i++){const x=blk.x+ri(0,blk.w-1),y=blk.y+ri(0,blk.h-1);if(zone[y][x]==='u')building(x,y,1,1,'stub',{rise:0})}
    encounters.push({name:'공허 가오리',x:pool.x+1,y:pool.y+1,r:3});
  };
  const hall=(blk,kind,opts={})=>building(blk.x,blk.y,blk.w,blk.h,kind,{closed:true,...opts});
  const market=(blk)=>{
    rect(blk.x,blk.y,blk.w,blk.h,'k',TT.FLOOR);
    for(let row=blk.y+1;row<blk.y+blk.h-1;row+=3)for(let x=blk.x+1;x<blk.x+blk.w-1;x++)if((x-blk.x)%5!==0)put(x,row,'k',(x+row)%4===0?TT.JAR:TT.TABLE);
    for(let i=0;i<3;i++)loot.push({x:blk.x+ri(1,blk.w-2),y:blk.y+2+3*ri(0,1),kind:'food'});
  };
  const sluices=[];
  const sluice=(d,blk)=>{const b=hall(blk,'sluice',{rise:2});const sx=b.x+Math.floor(b.w/2),sy=b.y+2;put(sx,sy,'i',TT.SWITCH);sluices.push({d,b,x:sx,y:sy});return b};

  for(const d of districts){
    const B=d.blocks;
    if(d.theme==='harbour'){
      const wh=hall(merge(B[0],B[1]),'warehouse',{rise:2,extra:{ambush:true}});
      for(let i=0;i<3;i++)encounters.push({name:pick(['차원 포식자','공허 가오리']),x:wh.x+3+i*5,y:wh.y+3,r:2});
      for(let i=0;i<4;i++)put(wh.x+2+ri(0,wh.w-5),wh.y+1+ri(0,wh.h-4),'i',pick([TT.CRATE,TT.JAR]));
      houses(B[2]);plaza(B[3]);houses(B[4]);houses(B[5]);
    }else if(d.theme==='sluice'){sluice(d,B[0]);houses(B[1]);garden(B[2]);plaza(B[3]);houses(B[4]);houses(B[5])}
    else if(d.theme==='market'){
      const mh=hall(B[1],'marketHall',{rise:2});for(let i=0;i<3;i++)put(mh.x+2+i*2,mh.y+2,'i',TT.TABLE);loot.push({x:mh.x+3,y:mh.y+4,kind:'food'},{x:mh.x+5,y:mh.y+4,kind:'potion'});
      houses(B[0]);houses(B[2]);market(merge(B[3],B[4]));plaza(B[5],TT.GARDEN_TREE);
    }else if(d.theme==='shrine'){
      // a raised court across the middle column; the shrine stands on it and its priest waits inside
      const court=merge(B[1],B[4]);rect(court.x,court.y,court.w,court.h,'t',TT.MOON_STONE);
      const sh=building(court.x+1,court.y+1,court.w-2,7,'shrine',{closed:true,rise:2,floor:TT.MOON_STONE});put(sh.x+Math.floor(sh.w/2),sh.y+2,'i',TT.ALTAR);
      for(const [dx,dy] of [[0,9],[court.w-1,9],[0,court.h-1],[court.w-1,court.h-1]])put(court.x+dx,court.y+dy,'t',TT.STONE_PILLAR);put(court.x+Math.floor(court.w/2),court.y+12,'t',TT.INCENSE_STAND);
      encounters.push({name:'신전 사제 망령',x:sh.x+Math.floor(sh.w/2),y:sh.y+4,r:2});
      sluice(d,B[0]);houses(B[2]);houses(B[3]);houses(B[5]);
    }else if(d.theme==='office'){
      // the magistrate's compound: a walled yard with a gate, trees, and the main hall at its back
      const yard=merge(merge(B[0],B[1]),merge(B[3],B[4]));
      for(let yy=yard.y;yy<yard.y+yard.h;yy++)for(let xx=yard.x;xx<yard.x+yard.w;xx++){const ring=xx===yard.x||yy===yard.y||xx===yard.x+yard.w-1||yy===yard.y+yard.h-1;put(xx,yy,ring?'W':'p',ring?TT.WALL:TT.STONE_PATH);if(ring)wallStyleByCell[k(xx,yy)]='stone'}
      const gate={x:yard.x+Math.floor(yard.w/2),y:yard.y+yard.h-1};for(const dx of [-1,0,1])put(gate.x+dx,gate.y,'p',TT.STONE_PATH);
      const main=building(yard.x+3,yard.y+1,yard.w-6,7,'office',{closed:true,rise:2});
      for(const [dx,dy] of [[2,10],[yard.w-3,10],[2,yard.h-3],[yard.w-3,yard.h-3]])put(yard.x+dx,yard.y+dy,'p',TT.GARDEN_TREE);
      for(let i=0;i<2;i++)encounters.push({name:'보주의 파수꾼',x:gate.x+(i?3:-3),y:gate.y-2,r:2});
      loot.push({x:main.x+2,y:main.y+3,kind:'gear'});
      houses(B[2]);houses(B[5]);
    }else if(d.theme==='watch'){
      // a three-storey watchtower in a yard; something with a long reach keeps its top floor
      rect(B[1].x,B[1].y,B[1].w,B[1].h,'p',TT.STONE_PATH);const tw=building(B[1].x+2,B[1].y+1,5,5,'tower',{closed:true,rise:3,door:{x:B[1].x+4,y:B[1].y+5}});
      encounters.push({name:'금령',x:tw.x+2,y:tw.y+2,r:1});
      sluice(d,B[0]);houses(B[2]);ruin(B[3]);plaza(B[4]);houses(B[5]);
    }else if(d.theme==='ruins'){ruin(B[0]);houses(B[1]);ruin(B[2]);garden(B[3]);houses(B[4]);ruin(B[5])}
    else if(d.theme==='avenue'){
      // a broad avenue runs north through the middle to the causeway; the last sluice house stands on its west side
      const ave={x:B[1].x,y:B[1].y,w:9,h:17};rect(ave.x,ave.y,ave.w,ave.h,'p',TT.STONE_PATH);for(let y=ave.y+1;y<ave.y+ave.h;y+=4)for(const x of [ave.x,ave.x+ave.w-1])put(x,y,'p',TT.LANTERN_POST);
      sluice(d,B[0]);houses(B[2]);houses(B[3]);houses(B[5]);
    }
  }

  // ---- connections along the loop: covered bridge-houses and sluice drawbridges, alternating
  const opening=(x,y)=>put(x,y,'q',TT.STONE_PATH),links=[];
  for(let i=0;i<districts.length-1;i++){
    const a=districts[i],b=districts[i+1],kind=i%2===0?'covered':'draw',cells=[];let axis,span;
    if(a.c===b.c){axis='ns';const top=a.r<b.r?a:b,bot=a.r<b.r?b:a,x0=a.x+Math.floor(DW/2)-1;span={x:x0,y:top.y+DH,w:3,h:bot.y-(top.y+DH)};for(let q=0;q<3;q++){opening(x0+q,top.y+DH-1);opening(x0+q,bot.y)}}
    else{axis='ew';const left=a.c<b.c?a:b,right=a.c<b.c?b:a,y0=a.y+Math.floor(DH/2)-1;span={x:left.x+DW,y:y0,w:right.x-(left.x+DW),h:3};for(let q=0;q<3;q++){opening(left.x+DW-1,y0+q);opening(right.x,y0+q)}}
    for(let y=span.y;y<span.y+span.h;y++)for(let x=span.x;x<span.x+span.w;x++)cells.push({x,y});
    const br={id:bridges.length+1,axis,kind,cells,from:a.i,to:b.i};bridges.push(br);links.push(br);
    for(const c of cells){put(c.x,c.y,kind==='draw'?'d':'b',kind==='draw'?TT.DRAWBRIDGE_UP:TT.DRAWBRIDGE_DOWN);owner[c.y][c.x]=-br.id}
    if(kind==='covered'){
      // a roofed bridge-house: low walls along both sides of the deck, open at the ends; its roof lifts when walked under
      const hb={id:nextId++,kind:'bridgehouse',closed:true,rise:1,tone:ri(0,3),axis,bridge:br.id,
        x:axis==='ns'?span.x-1:span.x,y:axis==='ew'?span.y-1:span.y,w:axis==='ns'?span.w+2:span.w,h:axis==='ew'?span.h+2:span.h};buildings.push(hb);br.house=hb.id;
      for(let y=hb.y;y<hb.y+hb.h;y++)for(let x=hb.x;x<hb.x+hb.w;x++){const wall=axis==='ns'?(x===hb.x||x===hb.x+hb.w-1):(y===hb.y||y===hb.y+hb.h-1);if(wall){put(x,y,'H',TT.WALL);wallStyleByCell[k(x,y)]='timber';owner[y][x]=hb.id}}
    }
  }
  // the causeway from the avenue to the palace island; its first three cells are the gate
  const av=districts[7],cx0=C.x+Math.floor(C.w/2)-1,causeway=[];
  for(let y=C.y+C.h;y<av.y;y++)for(let q=0;q<3;q++)causeway.push({x:cx0+q,y});
  for(const c of causeway)put(c.x,c.y,'s',TT.DRAWBRIDGE_DOWN);for(let q=0;q<3;q++)opening(cx0+q,av.y);
  const gateCells=[0,1,2].map(q=>({x:cx0+q,y:C.y+C.h}));for(const g of gateCells)setTerrainTile58(m,g.x,g.y,TT.WALL);

  // ---- the palace island: marble three steps up, the throne hall behind a forecourt holds the stairs
  rect(C.x,C.y,C.w,C.h,'c',TT.MOON_STONE);
  const palace=building(C.x+3,C.y+1,C.w-6,7,'palace',{closed:true,rise:3,floor:TT.GILDED_FLOOR,timber:false});
  for(const [dx,dy] of [[1,9],[C.w-2,9],[1,C.h-2],[C.w-2,C.h-2],[4,12],[C.w-5,12]])put(C.x+dx,C.y+dy,'c',TT.STONE_PILLAR);
  for(const dx of [-2,2])put(palace.door.x+dx,palace.door.y+1,'c',TT.GOLD_LAMP);
  const exit={x:palace.door.x,y:palace.y+2};
  // the dragon is aquatic: it waits in the mercury just west of the palace island, within reach of its shore
  const centerEntry={x:cx0+1,y:C.y+C.h-1},bossSpawn={x:C.x-3,y:C.y+Math.floor(C.h/2)};

  // ---- sluices: each lowers the drawbridge out of its district and drains the canal outside its house
  const controls=[],switchIds=[],hydraulicCellMeta={};
  sluices.forEach((s,i)=>{
    const id=`f23-sw-${i+1}`;switchIds.push(id);state.switches.push({id,kind:'f23-center',x:s.x,y:s.y,used:false});
    const br=links.find(l=>l.kind==='draw'&&l.from===s.d.i),changes=[];
    if(br)for(const c of br.cells)changes.push({x:c.x,y:c.y,before:TT.DRAWBRIDGE_UP,after:TT.DRAWBRIDGE_DOWN});
    const d=s.d,dry=[];
    for(let x=s.b.x-1;x<=s.b.x+s.b.w;x++)for(const y of [d.y-1,d.y-2,d.y+d.h,d.y+d.h+1])if(zone[y]?.[x]==='w'&&m[y][x]===TT.WATER)dry.push({x,y});
    for(let y=s.b.y-1;y<=s.b.y+s.b.h;y++)for(const x of [d.x-1,d.x-2,d.x+d.w,d.x+d.w+1])if(zone[y]?.[x]==='w'&&m[y][x]===TT.WATER)dry.push({x,y});
    for(const c of dry)changes.push({x:c.x,y:c.y,before:TT.WATER,after:TT.STONE_PATH});
    const control={switchId:id,type:['diversion','spillway','sluice-reverse','pressure-release'][i],label:`${s.d.name} 수문`,changes,activated:false,
      hydraulic:{drain:changes.filter(ch=>ch.before===TT.WATER).length,flood:0,bridge:changes.filter(ch=>ch.after===TT.DRAWBRIDGE_DOWN).length}};
    controls.push(control);for(const ch of changes)hydraulicCellMeta[k(ch.x,ch.y)]={control:i,type:control.type,before:ch.before,after:ch.after};
    state.featureRooms.push({name:`${s.d.name} 수문관`,x:s.b.x,y:s.b.y,w:s.b.w,h:s.b.h,kind60:'f23-sluice'});
  });

  // ---- loot on market tables and in the magistrate's hall; start on the harbour quay
  for(const l of loot){const item=l.kind==='food'?naturalFoodPick():l.kind==='potion'?choice(ordinaryPotionPool(false,23)):choice(ordinaryGearPool(tierForFloor(23),23));if(item)PlacementService.placeItem({...clone(item),count:1},{x:l.x,y:l.y},{requireReachable:false})}
  const d0=districts[0],start={x:d0.x+2,y:d0.y+d0.h-2};
  setEnds(start,exit);zone[exit.y][exit.x]='i';
  for(const d of districts){state.rooms.push(roomRect(d.x,d.y,d.w,d.h));state.featureRooms.push({name:`수몰 도성 · ${d.name}`,x:d.x,y:d.y,w:d.w,h:d.h,kind60:'f23-district'})}
  state.featureRooms.push({name:'중앙 수은호',x:L.x,y:L.y,w:L.w,h:L.h,kind60:'mercury-core'},{name:'수몰 왕궁',x:C.x,y:C.y,w:C.w,h:C.h,kind60:'mercury-platform'});
  state.floor23={version:21,artVersion:21,preserveAuthoredGeometry:true,centerUnlocked:false,thresholdTriggered:false,keyAcquired:false,
    routeCheckpoints:[start,...sluices.map(s=>({x:s.x,y:s.y})),centerEntry].map(q=>({...q})),
    gateCells,centerEntry,bossSpawn,centerBounds:{...L},switchIds,controls,hydraulicCellMeta,reveal:null,wallStyleByCell,
    districts:districts.map(d=>({id:d.i+1,x:d.x,y:d.y,w:d.w,h:d.h,theme:d.theme,name:d.name})),innerDistrictBounds:[],transitBuildings:[],
    city:{zone:zone.map(r=>r.join('')),owner,buildings,bridges,causeway,encounters,lake:{...L},core:{...C}}};
  state.layoutName='수몰 회색 도성 · 여덟 구역 고리길 / 다리집과 수문 가동교 / 수은호 둑길 / 수몰 왕궁';
}

// The floor's own audit. The loop is linear: with n sluices turned the player reaches sluice n+1 and not sluice n+2,
// the palace stays shut until all four have turned, and then the stairs are reachable.
function validateDrownedCity(){
  const q=state.floor23;if(state.floor!==23||!q?.city)return{ok:false,reason:'missing-drowned-city'};
  const controls=q.controls||[],switches=(q.switchIds||[]).map(id=>state.switches?.find(v=>v.id===id));
  const reachWith=(n,open)=>{const saved=[];for(let i=0;i<n;i++)for(const ch of controls[i].changes)if(ch.after===TT.DRAWBRIDGE_DOWN&&state.map[ch.y][ch.x]!==ch.after){saved.push([ch.x,ch.y,state.map[ch.y][ch.x]]);state.map[ch.y][ch.x]=ch.after}
    const r=floodSpecial60(state.player,{centerOpen:open});for(const [x,y,t] of saved)state.map[y][x]=t;return r};
  const pristine=controls.every(c=>!c.activated)&&!q.centerUnlocked,at=p=>k(p.x,p.y);let linear=true;
  if(pristine)for(let n=0;n<switches.length;n++){const r=reachWith(n,false);if(!switches[n]||!r.has(at(switches[n])))linear=false;if(n+1<switches.length&&r.has(at(switches[n+1])))linear=false}
  const closedAll=pristine?reachWith(controls.length,false):floodSpecial60(state.player,{centerOpen:false}),openAll=pristine?reachWith(controls.length,true):floodSpecial60(state.player,{centerOpen:true});
  const centerClosed=q.centerUnlocked||(!closedAll.has(at(q.centerEntry))&&!closedAll.has(at(state.stairs))),centerOpen=openAll.has(at(q.centerEntry))&&openAll.has(at(state.stairs));
  const inLake=(x,y)=>x>=q.centerBounds.x&&x<q.centerBounds.x+q.centerBounds.w&&y>=q.centerBounds.y&&y<q.centerBounds.y+q.centerBounds.h;
  const dragon=(state.monsters||[]).find(m=>m.name==='여의 수룡'&&m.hpThreshold57?.event==='f23-progress-key');
  const dragonReady=!dragon||inLake(dragon.x,dragon.y);
  const exitClear=!(state.monsters||[]).some(m=>m.hp>0&&m.x===state.stairs.x&&m.y===state.stairs.y);
  return{floor:23,linear,centerClosed,centerOpen,dragonReady,exitClear,gateCells:q.gateCells.length,buildings:q.city.buildings.length,bridges:q.city.bridges.length,
    ok:linear&&centerClosed&&centerOpen&&dragonReady&&exitClear&&q.gateCells.length===3};
}
