// 23층 · 수몰 회색 도성. Irregular stone islands crowd a canal maze around a mercury lake; the palace island stands in its middle.
// The route is one chain: eight major islands (harbour → sluice → market → shrine hill → office → watch → ruins → avenue) joined
// through smaller stepping islands by covered bridge-houses and sluice drawbridges; the fourth sluice opens the causeway gate.
// Off the chain hang dead-end islands, each carrying one huge building (pagoda, granary, bell hall) with something inside.
// Like the mirror tower, the builder writes a plan (zone, height and owner per cell; buildings and bridges as whole objects)
// and cityart.js draws only from that plan. Closed buildings carry a roof that lifts when the player enters.
//
// Zones: X edge · w canal · m mercury lake · r parapet · q quay · a alley · p plaza/yard · k market square · g garden
//        u ruin · t hill terrace · H building wall/body · i interior · W compound wall · b covered bridge · d drawbridge
//        s causeway · c palace island
// Heights: canal/lake 0 · ground 1 · hill terrace 2 · palace island 3
const CITY23=Object.freeze({
  size:[139,99],lake:{x:52,y:34,w:35,h:30},core:{x:60,y:42,w:19,h:14},
  majors:[[19,78,14,'harbour'],[14,47,12,'sluice'],[21,15,14,'market'],[68,12,14,'shrine'],[114,15,16,'office'],[123,48,12,'watch'],[116,79,13,'ruins'],[69,79,13,'avenue']],
  minors:[[97,62,6],[42,24,6],[88,36,5]],
  chain:[['M',0],['M',1],['M',2],['M',3],['M',4],['M',5],['M',6],['M',7]],
  satellites:[{at:[39,40,8],kind:'pagoda'},{at:[103,40,10],kind:'granary'},{at:[40,66,8],kind:'belltower'}],
  names:['포구','서수문','저잣거리','사당 언덕','관아','망루 수문','무너진 골목','대로 수문']
});
const CITY23_HEIGHT=Object.freeze({X:0,w:0,m:0,r:1,q:1,a:1,p:1,k:1,g:1,u:1,t:2,H:1,i:1,W:1,b:1,d:1,s:1,c:3});
const CITY23_WALK=new Set(['q','a','p','k','g','u','t','c','b','d','s']);

function buildDrownedCity(m){
  const R=()=>globalThis.__MANRU_RANDOM57__(),ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)];
  const W=COLS,H=ROWS,zone=Array.from({length:H},()=>Array(W).fill('w')),owner=Array.from({length:H},()=>Array(W).fill(0)),isle=Array.from({length:H},()=>Array(W).fill(-1));
  const inside=(x,y)=>x>1&&y>1&&x<W-2&&y<H-2;
  const put=(x,y,z,t)=>{if(x<1||y<1||x>=W-1||y>=H-1)return;zone[y][x]=z;setTerrainTile58(m,x,y,t)};
  const rect=(x,y,w,h,z,t)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,z,t)};
  state.rooms=[];state.routeTags=[];state.switches=[];state.featureRooms=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const edge=x===0||y===0||x===W-1||y===H-1;zone[y][x]=edge?'X':'w';setTerrainTile58(m,x,y,edge?TT.WALL:TT.WATER)}
  const L=CITY23.lake,C=CITY23.core;
  rect(L.x,L.y,L.w,L.h,'m',TT.MERCURY);

  const buildings=[],bridges=[],encounters=[],loot=[],wallStyleByCell={};let nextId=1;
  const building=(x,y,w,h,kind,opts={})=>{
    const id=nextId++,b={id,x,y,w,h,kind,closed:!!opts.closed,rise:opts.rise??(opts.closed?2:1),tone:ri(0,3),door:null,...opts.extra};buildings.push(b);
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const ring=!b.closed||xx===x||yy===y||xx===x+w-1||yy===y+h-1;put(xx,yy,ring?'H':'i',ring?TT.WALL:(opts.floor||TT.WOOD_FLOOR));owner[yy][xx]=id;if(ring)wallStyleByCell[k(xx,yy)]=opts.timber===false?'stone':'timber'}
    if(b.closed&&opts.door!==false){const d=opts.door||{x:x+Math.floor(w/2),y:y+h-1};put(d.x,d.y,'H',TT.DOOR);b.door={...d}}
    return b;
  };

  // ---- islands: a noisy blob, a parapet ring on the shore, one quay ring inside it
  const islands=[];
  const island=(cx0,cy0,r,kind,extra={})=>{
    const id=islands.length,p=[R()*6.28,R()*6.28,R()*6.28],asp=.82+R()*.45;
    const shape=(cx,cy)=>{const cells=[];
      for(let y=Math.floor(cy-r*1.6);y<=Math.ceil(cy+r*1.6);y++)for(let x=Math.floor(cx-r*1.6);x<=Math.ceil(cx+r*1.6);x++){
        if(!inside(x,y))continue;const dx=(x-cx)/asp,dy=(y-cy)*asp,d=Math.hypot(dx,dy),th=Math.atan2(dy,dx),rr=r*(.8+.17*Math.sin(2*th+p[0])+.11*Math.sin(3*th+p[1])+.07*Math.sin(5*th+p[2]));
        if(d<=rr)cells.push({x,y})}return cells};
    // an island keeps three cells of open water from every other island and two from the lake; nudged outward until it fits
    const gp=extra.scatter?2:3,clear=(cells)=>cells.length>12&&cells.every(c=>{for(let dy=-gp;dy<=gp;dy++)for(let dx=-gp;dx<=gp;dx++){const z=zone[c.y+dy]?.[c.x+dx];if(isle[c.y+dy]?.[c.x+dx]>=0||z==='b'||z==='d'||z==='H')return false}return !(c.x>=L.x-2&&c.x<L.x+L.w+2&&c.y>=L.y-2&&c.y<L.y+L.h+2)});
    let cx=cx0,cy=cy0,cells=shape(cx,cy);
    for(let t=0;t<(extra.scatter?0:60)&&!clear(cells);t++){const a=t*2.4+R(),rad=2+t*.7;cx=Math.round(cx0+Math.cos(a)*rad);cy=Math.round(cy0+Math.sin(a)*rad);cells=shape(cx,cy)}
    if(!clear(cells)){if(extra.satellite||extra.extra)return null;}
    const isl={id,cx,cy,r,kind,cells,set:new Set(cells.map(c=>k(c.x,c.y))),landings:[],...extra};islands.push(isl);
    for(const c of cells){isle[c.y][c.x]=id;put(c.x,c.y,'a',TT.FLOOR)}
    return isl;
  };
  const majors=CITY23.majors.map(([x,y,r,theme],i)=>island(x,y,r,theme,{major:true,index:i,name:CITY23.names[i]}));
  const palaceIsle={id:-2,cx:C.x+C.w/2,cy:C.y+C.h/2,r:9,kind:'palace',cells:[],set:new Set(),landings:[]};

  // ---- bridges: straight, three wide, between the facing edges of two islands
  const links=[];
  const span=(A,B,width=3)=>{
    // try an east-west span then a north-south one; pick the shortest clear corridor
    let best=null;
    const rowsOf=(isl,axis)=>{const m1=new Map();for(const c of isl.cells){const key=axis==='ew'?c.y:c.x,v=axis==='ew'?c.x:c.y,cur=m1.get(key);if(!cur)m1.set(key,{min:v,max:v});else{cur.min=Math.min(cur.min,v);cur.max=Math.max(cur.max,v)}}return m1};
    for(const axis of ['ew','ns']){
      const ra=rowsOf(A,axis),rb=rowsOf(B,axis);
      for(const [key] of ra){
        const rows=Array.from({length:width},(_,i)=>key+i);if(!rows.every(r=>ra.has(r)&&rb.has(r)))continue;
        const aFirst=A[axis==='ew'?'cx':'cy']<B[axis==='ew'?'cx':'cy'];
        const ea=aFirst?Math.max(...rows.map(r=>ra.get(r).max)):Math.min(...rows.map(r=>ra.get(r).min));
        const sb=aFirst?Math.min(...rows.map(r=>rb.get(r).min)):Math.max(...rows.map(r=>rb.get(r).max));
        const gap=aFirst?sb-ea-1:ea-sb-1;if(gap<2||gap>40)continue;
        const lo=aFirst?ea+1:sb+1,hi=aFirst?sb-1:ea-1;let clear=true;
        for(const r of rows){for(let v=lo;v<=hi;v++){const x=axis==='ew'?v:r,y=axis==='ew'?r:v;if(isle[y]?.[x]!==-1||zone[y][x]==='X'){clear=false;break}}if(!clear)break}
        if(!clear)continue;
        const score=gap+Math.abs(key+width/2-(axis==='ew'?(A.cy+B.cy)/2:(A.cx+B.cx)/2))*.4;
        if(!best||score<best.score)best={axis,key,rows,lo,hi,ea,sb,aFirst,score,ra,rb}
      }
    }
    return best;
  };
  const link=(A,B,kind,width=3)=>{
    const s=span(A,B,width);if(!s)throw new Error(`F23 no bridge ${A.kind}(${A.cx},${A.cy},${A.cells.length})->${B.kind}(${B.cx},${B.cy},${B.cells.length})`);
    const cells=[];
    for(const r of s.rows)for(let v=s.lo;v<=s.hi;v++){const x=s.axis==='ew'?v:r,y=s.axis==='ew'?r:v;cells.push({x,y})}
    // ragged shores are filled out so both ends of the span meet the island on every row
    const grow=(isl,r,from,to)=>{const step=from<=to?1:-1;for(let v=from;step>0?v<=to:v>=to;v+=step){const x=s.axis==='ew'?v:r,y=s.axis==='ew'?r:v;if(isle[y][x]===-1&&zone[y][x]==='w'){isle[y][x]=isl.id;isl.cells.push({x,y});isl.set.add(k(x,y));put(x,y,'a',TT.FLOOR)}}};
    for(const r of s.rows){
      if(s.aFirst){grow(A,r,s.ra.get(r).max+1,s.ea);grow(B,r,s.rb.get(r).min-1,s.sb)}
      else{grow(A,r,s.ra.get(r).min-1,s.ea);grow(B,r,s.rb.get(r).max+1,s.sb)}
    }
    const br={id:bridges.length+1,axis:s.axis,kind,cells,from:A.id,to:B.id,landA:[],landB:[]};bridges.push(br);
    for(const c of cells){put(c.x,c.y,kind==='draw'?'d':'b',kind==='draw'?TT.DRAWBRIDGE_UP:TT.DRAWBRIDGE_DOWN);owner[c.y][c.x]=-br.id}
    // the shore cells in front of each end become walkable landings (the parapet is cut there)
    for(const r of s.rows){
      const ex=s.axis==='ew'?(s.aFirst?s.lo-1:s.hi+1):r,ey=s.axis==='ew'?r:(s.aFirst?s.lo-1:s.hi+1),sx=s.axis==='ew'?(s.aFirst?s.hi+1:s.lo-1):r,sy=s.axis==='ew'?r:(s.aFirst?s.hi+1:s.lo-1);
      A.landings.push({x:ex,y:ey});B.landings.push({x:sx,y:sy});br.landA.push({x:ex,y:ey});br.landB.push({x:sx,y:sy});
    }
    if(kind==='covered'){
      const x0=Math.min(...cells.map(c=>c.x)),y0=Math.min(...cells.map(c=>c.y)),w=Math.max(...cells.map(c=>c.x))-x0+1,h=Math.max(...cells.map(c=>c.y))-y0+1;
      const hb={id:nextId++,kind:'bridgehouse',closed:true,rise:1,tone:ri(0,3),axis:s.axis,bridge:br.id,x:s.axis==='ns'?x0-1:x0,y:s.axis==='ew'?y0-1:y0,w:s.axis==='ns'?w+2:w,h:s.axis==='ew'?h+2:h};buildings.push(hb);br.house=hb.id;
      for(let y=hb.y;y<hb.y+hb.h;y++)for(let x=hb.x;x<hb.x+hb.w;x++){const wall=s.axis==='ns'?(x===hb.x||x===hb.x+hb.w-1):(y===hb.y||y===hb.y+hb.h-1);if(wall&&zone[y][x]==='w'){put(x,y,'H',TT.WALL);wallStyleByCell[k(x,y)]='timber';owner[y][x]=hb.id}}
    }
    links.push(br);return br;
  };
  const chainIsles=CITY23.chain.map(([t,i])=>t==='M'?majors[i]:minors[i]);
  const sluiceMajors=new Set([1,3,5,7]);
  for(let i=0;i<chainIsles.length-1;i++){const a=chainIsles[i],b=chainIsles[i+1];link(a,b,a.major&&sluiceMajors.has(a.index)&&a.index!==7?'draw':'covered');a.next=b}
  // dead-end islands are set down after the chain, clear of its bridges, and hang off whichever neighbour a straight bridge reaches;
  // then rocky outcrops are scattered over the open water, bridged where a span reaches and left as bare rock where it does not
  const minors=CITY23.minors.map(([x,y,r],i)=>island(x,y,r,'stepping',{index:i,extra:true})).filter(Boolean);
  const sats=CITY23.satellites.map(s=>island(s.at[0],s.at[1],s.at[2],s.kind,{satellite:true})).filter(Boolean);
  const scatter=[];
  for(let n=0;n<900&&scatter.length<26;n++){
    const x=ri(8,W-9),y=ri(8,H-9);if(x>=L.x-6&&x<L.x+L.w+6&&y>=L.y-6&&y<L.y+L.h+6)continue;
    const r=ri(4,8),before=islands.length,isl=island(x,y,r,'islet',{extra:true,scatter:true});
    if(!isl||isl.cells.length<40||Math.hypot(isl.cx-x,isl.cy-y)>2){if(isl&&isl.cells.length<40){for(const c of isl.cells){isle[c.y][c.x]=-1;put(c.x,c.y,'w',TT.WATER)}islands.pop()}else if(isl)islands.pop();continue}
    scatter.push(isl);
  }
  const bridged=new Set(),hostable=()=>islands.filter(i=>i.major||i.satellite||(i.extra&&bridged.has(i.id)));
  for(const s of [...sats,...minors,...scatter]){
    const hosts=hostable().filter(i=>i!==s).sort((a,b)=>Math.hypot(a.cx-s.cx,a.cy-s.cy)-Math.hypot(b.cx-s.cx,b.cy-s.cy));
    let done=false;for(const h of hosts){if(span(h,s,2)){link(h,s,'covered',2);done=true;bridged.add(s.id);break}}
    if(!done&&s.satellite)throw new Error(`F23 dead-end island ${s.kind} cannot be bridged`);
    if(!done)s.bare=true;
  }

  // ---- shoreline: parapet where the ground meets water, a quay ring behind it, alleys inside; cut the parapet at bridge landings
  const landingKeys=new Set(islands.flatMap(i=>i.landings.map(l=>k(l.x,l.y))));
  for(const isl of islands){
    const dist=new Map(),queue=[];
    for(const c of isl.cells){let shore=false;for(const [dx,dy] of DIRS4){const nz=zone[c.y+dy]?.[c.x+dx];if(isle[c.y+dy]?.[c.x+dx]!==isl.id&&nz!=='b'&&nz!=='d'&&nz!=='H')shore=true}if(shore){dist.set(k(c.x,c.y),1);queue.push(c)}}
    for(let i=0;i<queue.length;i++){const c=queue[i],d=dist.get(k(c.x,c.y));for(const [dx,dy] of DIRS4){const kk=k(c.x+dx,c.y+dy);if(isle[c.y+dy]?.[c.x+dx]===isl.id&&!dist.has(kk)){dist.set(kk,d+1);queue.push({x:c.x+dx,y:c.y+dy})}}}
    for(const c of isl.cells){if(owner[c.y][c.x]<0)continue;const d=dist.get(k(c.x,c.y))||9,land=landingKeys.has(k(c.x,c.y));
      if(d===1&&!land){put(c.x,c.y,'r',TT.WALL);wallStyleByCell[k(c.x,c.y)]='stone'}else if(d<=2||land)put(c.x,c.y,'q',TT.STONE_PATH);else put(c.x,c.y,'a',TT.FLOOR)}
    // thin necks that the parapet closes off leave pockets with no way in: they become wall
    const walk=isl.cells.filter(c=>CITY23_WALK.has(zone[c.y][c.x])),comp=new Map();let best=null;
    for(const c of walk){const kk=k(c.x,c.y);if(comp.has(kk))continue;const list=[c],id=comp.size+1;comp.set(kk,id);for(let i=0;i<list.length;i++){const a=list[i];for(const [dx,dy] of DIRS4){const nk=k(a.x+dx,a.y+dy),nc={x:a.x+dx,y:a.y+dy};if(!comp.has(nk)&&isle[nc.y]?.[nc.x]===isl.id&&CITY23_WALK.has(zone[nc.y][nc.x])){comp.set(nk,id);list.push(nc)}}}
      const hasLanding=list.some(c=>landingKeys.has(k(c.x,c.y)));if(!best||(hasLanding&&!best.hasLanding)||(hasLanding===best.hasLanding&&list.length>best.list.length))best={list,hasLanding,id}}
    if(best)for(const c of walk)if(comp.get(k(c.x,c.y))!==best.id){put(c.x,c.y,'r',TT.WALL);wallStyleByCell[k(c.x,c.y)]='stone'}
    // lanterns on the quay ring
    let n=0;for(const c of isl.cells)if(zone[c.y][c.x]==='q'&&(c.x*7+c.y*3)%11===0&&n++<12)put(c.x,c.y,'q',TT.LANTERN_POST);
  }
  // ---- helpers for filling an island
  const walkable=(x,y)=>CITY23_WALK.has(zone[y]?.[x]);
  const isleCells=(isl)=>isl.cells.filter(c=>isle[c.y][c.x]===isl.id);
  const connected=(isl)=>{
    const cells=isleCells(isl).filter(c=>walkable(c.x,c.y));if(!cells.length)return true;
    const seen=new Set([k(cells[0].x,cells[0].y)]),q=[cells[0]];
    for(let i=0;i<q.length;i++){const c=q[i];for(const [dx,dy] of DIRS4){const x=c.x+dx,y=c.y+dy,kk=k(x,y);if(seen.has(kk)||!walkable(x,y)||isle[y][x]!==isl.id)continue;seen.add(kk);q.push({x,y})}}
    // bridges leave the island: a landing on the far side is part of the same walk
    return cells.every(c=>seen.has(k(c.x,c.y)));
  };
  const freeRect=(isl,x,y,w,h,margin=1,allow=['a'])=>{
    for(let yy=y-margin;yy<y+h+margin;yy++)for(let xx=x-margin;xx<x+w+margin;xx++){
      const z=zone[yy]?.[xx];const core=xx>=x&&xx<x+w&&yy>=y&&yy<y+h;
      if(isle[yy]?.[xx]!==isl.id)return false;
      if(core){if(!allow.includes(z))return false}else if(z==='H'||z==='W'||z==='i'||z==='r')return false}
    return true;
  };
  const findSpots=(isl,w,h,near,{allow=['a'],margin=1,tries=400,limit=1}={})=>{
    const cands=[];for(const c of isl.cells)if(c.x+w<W&&c.y+h<H)cands.push({x:c.x,y:c.y,d:Math.hypot(c.x+w/2-near.x,c.y+h/2-near.y)+R()*1.5});
    cands.sort((a,b)=>a.d-b.d);const out=[];let n=0;for(const c of cands){if(n++>tries||out.length>=limit)break;if(freeRect(isl,c.x,c.y,w,h,margin,allow))out.push({x:c.x,y:c.y})}return out;
  };
  const findSpot=(isl,w,h,near,opts={})=>findSpots(isl,w,h,near,{...opts,limit:1})[0]||null;
  // a building that keeps the island walkable: undone when it would cut the alleys in two
  const place=(isl,x,y,w,h,kind,opts)=>{
    const snapshot=[];for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)snapshot.push([xx,yy,zone[yy][xx]]);
    const b=building(x,y,w,h,kind,opts);
    if(!connected(isl)||(b.door&&!doorOpens(b))){buildings.pop();nextId--;for(const [xx,yy,z] of snapshot){zone[yy][xx]=z;owner[yy][xx]=0;setTerrainTile58(m,xx,yy,z==='a'?TT.FLOOR:z==='q'?TT.STONE_PATH:TT.FLOOR);delete wallStyleByCell[k(xx,yy)]}return null}
    return b;
  };
  const doorOpens=(b)=>{const o=[{x:b.door.x,y:b.door.y+1},{x:b.door.x,y:b.door.y-1},{x:b.door.x+1,y:b.door.y},{x:b.door.x-1,y:b.door.y}];return o.some(c=>walkable(c.x,c.y))};
  // a door on the side of the footprint that faces open ground
  const doorFor=(isl,x,y,w,h)=>{
    const sides=[{x:x+Math.floor(w/2),y:y+h-1,o:{x:x+Math.floor(w/2),y:y+h}},{x:x+Math.floor(w/2),y:y,o:{x:x+Math.floor(w/2),y:y-1}},{x:x,y:y+Math.floor(h/2),o:{x:x-1,y:y+Math.floor(h/2)}},{x:x+w-1,y:y+Math.floor(h/2),o:{x:x+w,y:y+Math.floor(h/2)}}];
    for(const s of sides)if(isle[s.o.y]?.[s.o.x]===isl.id&&walkable(s.o.x,s.o.y)&&zone[s.o.y][s.o.x]!=='q')return{x:s.x,y:s.y};
    for(const s of sides)if(isle[s.o.y]?.[s.o.x]===isl.id&&walkable(s.o.x,s.o.y))return{x:s.x,y:s.y};
    return null;
  };
  // the first spot near the target where the building leaves the island walkable; closed halls open their door onto open ground
  const hall=(isl,w,h,near,kind,opts={})=>{
    for(const spot of findSpots(isl,w,h,near,{allow:['a','p','q'],margin:0,tries:900,limit:40})){
      const door=doorFor(isl,spot.x,spot.y,w,h);if(!door)continue;
      const b=place(isl,spot.x,spot.y,w,h,kind,{closed:true,door,...opts});if(b)return b;
    }
    return null;
  };
  const sluice=(isl,near)=>{
    const b=hall(isl,7,5,near,'sluice',{rise:2});if(!b)throw new Error('F23 no room for a sluice house');
    const sx=b.x+Math.floor(b.w/2),sy=b.y+2;put(sx,sy,'i',TT.SWITCH);sluices.push({isl,b,x:sx,y:sy});return b;
  };
  const sluices=[];
  const plazaAt=(isl,w,h,near,feature)=>{
    const spot=findSpot(isl,w,h,near,{allow:['a'],margin:0});if(!spot)return null;rect(spot.x,spot.y,w,h,'p',TT.FLOOR);
    const cx=spot.x+Math.floor(w/2),cy=spot.y+Math.floor(h/2);if(feature!==null)put(cx,cy,'p',feature||TT.FOUNTAIN);
    for(const [dx,dy] of [[-2,-1],[2,-1],[-2,1],[2,1]])if(R()<.55&&zone[cy+dy]?.[cx+dx]==='p')put(cx+dx,cy+dy,'p',pick([TT.BENCH,TT.GARDEN_TREE,TT.LANTERN_POST,TT.JAR]));
    return spot;
  };
  const gardenAt=(isl,w,h,near)=>{const spot=findSpot(isl,w,h,near,{allow:['a'],margin:0});if(!spot)return null;rect(spot.x,spot.y,w,h,'g',TT.GRASS);for(let i=0;i<Math.floor(w*h/7);i++)put(spot.x+ri(0,w-1),spot.y+ri(0,h-1),'g',pick([TT.GARDEN_TREE,TT.GARDEN_TREE,TT.BENCH]));return spot};
  const ruinAt=(isl,w,h,near)=>{
    const spot=findSpot(isl,w,h,near,{allow:['a'],margin:0});if(!spot)return null;rect(spot.x,spot.y,w,h,'u',TT.FLOOR);
    const pw=Math.max(2,Math.floor(w/2)),ph=Math.max(2,Math.floor(h/2)),px=spot.x+ri(1,Math.max(1,w-pw-1)),py=spot.y+ri(1,Math.max(1,h-ph-1));rect(px,py,pw,ph,'w',TT.WATER);
    for(let i=0;i<w*h/4;i++){const x=spot.x+ri(0,w-1),y=spot.y+ri(0,h-1);if(zone[y][x]==='u'){const b=building(x,y,1,1,'stub',{rise:0});if(!connected(isl)){buildings.pop();nextId--;zone[y][x]='u';owner[y][x]=0;setTerrainTile58(m,x,y,TT.FLOOR)}}}
    encounters.push({name:'공허 가오리',x:px,y:py,r:3});return spot;
  };
  const marketAt=(isl,w,h,near)=>{
    const spot=findSpot(isl,w,h,near,{allow:['a'],margin:0});if(!spot)return null;rect(spot.x,spot.y,w,h,'k',TT.FLOOR);
    for(let row=spot.y+1;row<spot.y+h-1;row+=3)for(let x=spot.x+1;x<spot.x+w-1;x++)if((x-spot.x)%5!==0)put(x,row,'k',(x+row)%4===0?TT.JAR:TT.TABLE);
    for(let i=0;i<3;i++)loot.push({x:spot.x+ri(1,w-2),y:spot.y+(h>4?2:1)+3*ri(0,Math.max(0,Math.floor((h-4)/3))),kind:'food'});return spot;
  };

  // ---- the major islands: one themed centrepiece each, then houses packed round it
  const center=isl=>({x:isl.cx,y:isl.cy});
  for(const isl of majors){
    const c=center(isl);
    if(isl.kind==='harbour'){
      const wh=hall(isl,12,7,{x:c.x+1,y:c.y-2},'warehouse',{rise:2,extra:{ambush:true}});
      if(wh){for(let i=0;i<3;i++)encounters.push({name:pick(['차원 포식자','공허 가오리']),x:wh.x+3+i*4,y:wh.y+3,r:2});for(let i=0;i<7;i++)put(wh.x+2+ri(0,wh.w-5),wh.y+1+ri(0,wh.h-4),'i',pick([TT.CRATE,TT.JAR]))}
      plazaAt(isl,7,5,{x:c.x-4,y:c.y+4})
    }else if(isl.kind==='sluice'){sluice(isl,c);gardenAt(isl,7,6,{x:c.x+3,y:c.y+3});plazaAt(isl,5,5,{x:c.x-3,y:c.y-3})}
    else if(isl.kind==='market'){
      const mh=hall(isl,10,6,{x:c.x+3,y:c.y-3},'marketHall',{rise:2});
      if(mh){for(let i=0;i<4;i++)put(mh.x+2+i*2,mh.y+2,'i',TT.TABLE);loot.push({x:mh.x+3,y:mh.y+4,kind:'food'},{x:mh.x+6,y:mh.y+4,kind:'potion'})}
      marketAt(isl,16,7,{x:c.x-2,y:c.y+3});plazaAt(isl,6,5,{x:c.x+5,y:c.y+5},TT.GARDEN_TREE)
    }else if(isl.kind==='shrine'){
      // a hill terrace in the middle; the shrine stands on it behind a flight of steps, its priest waits inside
      for(const spot of findSpots(isl,11,10,c,{allow:['a','q'],margin:0,tries:900,limit:40})){
        const saved=[];for(let yy=spot.y;yy<spot.y+10;yy++)for(let xx=spot.x;xx<spot.x+11;xx++)saved.push([xx,yy,zone[yy][xx],m[yy][xx]]);
        rect(spot.x,spot.y,11,10,'t',TT.MOON_STONE);
        const sh=building(spot.x+1,spot.y+1,9,5,'shrine',{closed:true,rise:3,floor:TT.MOON_STONE,door:{x:spot.x+5,y:spot.y+5}});
        if(!connected(isl)){buildings.pop();nextId--;for(const [xx,yy,z,t] of saved){zone[yy][xx]=z;owner[yy][xx]=0;setTerrainTile58(m,xx,yy,t)}continue}
        put(sh.x+4,sh.y+2,'i',TT.ALTAR);
        for(const [dx,dy] of [[0,7],[10,7],[0,9],[10,9]])put(spot.x+dx,spot.y+dy,'t',TT.STONE_PILLAR);put(spot.x+5,spot.y+7,'t',TT.INCENSE_STAND);
        encounters.push({name:'신전 사제 망령',x:sh.x+4,y:sh.y+3,r:2});break}
      sluice(isl,{x:c.x-7,y:c.y+4});
      gardenAt(isl,6,5,{x:c.x+6,y:c.y+4})
    }else if(isl.kind==='office'){
      // a walled compound: gate, yard with trees, the main hall at its back
      // the compound goes where its gate opens onto open ground and the island stays in one piece
      for(const spot of findSpots(isl,15,11,c,{allow:['a','q'],margin:0,tries:900,limit:40})){
        const out={x:spot.x+7,y:spot.y+11};if(isle[out.y]?.[out.x]!==isl.id||!walkable(out.x,out.y))continue;
        const saved=[];for(let yy=spot.y;yy<spot.y+11;yy++)for(let xx=spot.x;xx<spot.x+15;xx++)saved.push([xx,yy,zone[yy][xx],m[yy][xx]]);
        for(let yy=spot.y;yy<spot.y+11;yy++)for(let xx=spot.x;xx<spot.x+15;xx++){const ring=xx===spot.x||yy===spot.y||xx===spot.x+14||yy===spot.y+10;put(xx,yy,ring?'W':'p',ring?TT.WALL:TT.STONE_PATH);if(ring)wallStyleByCell[k(xx,yy)]='stone'}
        const gate={x:spot.x+7,y:spot.y+10};for(const dx of [-1,0,1])put(gate.x+dx,gate.y,'p',TT.STONE_PATH);
        const main=building(spot.x+2,spot.y+1,11,4,'office',{closed:true,rise:3,door:{x:spot.x+7,y:spot.y+4}});
        if(!connected(isl)){buildings.pop();nextId--;for(const [xx,yy,z,t] of saved){zone[yy][xx]=z;owner[yy][xx]=0;setTerrainTile58(m,xx,yy,t);delete wallStyleByCell[k(xx,yy)]}continue}
        for(const [dx,dy] of [[2,7],[12,7],[2,9],[12,9]])put(spot.x+dx,spot.y+dy,'p',TT.GARDEN_TREE);
        for(let i=0;i<2;i++)encounters.push({name:'보주의 파수꾼',x:gate.x+(i?3:-3),y:gate.y-2,r:2});loot.push({x:main.x+3,y:main.y+3,kind:'gear'});break}
      if(!buildings.some(b=>b.kind==='office'))throw new Error('F23 no room for the office compound');
      gardenAt(isl,6,5,{x:c.x-9,y:c.y+5})
    }else if(isl.kind==='watch'){
      sluice(isl,{x:c.x-4,y:c.y+4});
      const tw=hall(isl,5,5,{x:c.x+3,y:c.y-2},'tower',{rise:4});if(tw)encounters.push({name:'금령',x:tw.x+2,y:tw.y+2,r:1});
      ruinAt(isl,6,5,{x:c.x+4,y:c.y-4})
    }else if(isl.kind==='ruins'){ruinAt(isl,7,6,{x:c.x-4,y:c.y-3});ruinAt(isl,6,5,{x:c.x+4,y:c.y+2});gardenAt(isl,5,5,{x:c.x+3,y:c.y-4})}
    else if(isl.kind==='avenue'){
      // a broad avenue north through the middle to the causeway, lanterns down both sides
      const ave={x:Math.floor(c.x)-4,y:isl.cy-11,w:9,h:22};for(let yy=ave.y;yy<ave.y+ave.h;yy++)for(let xx=ave.x;xx<ave.x+ave.w;xx++)if(isle[yy]?.[xx]===isl.id&&zone[yy][xx]==='a')put(xx,yy,'p',TT.STONE_PATH);
      for(let yy=ave.y+1;yy<ave.y+ave.h;yy+=4)for(const xx of [ave.x,ave.x+ave.w-1])if(zone[yy]?.[xx]==='p')put(xx,yy,'p',TT.LANTERN_POST);
      sluice(isl,{x:c.x-8,y:c.y});
    }
  }
  // stepping islands: a shrine-sized pavilion or a plaza, never empty
  for(const isl of minors){const c=center(isl);if(R()<.5)plazaAt(isl,3,3,c);else{const b=hall(isl,4,4,c,'pavilion',{rise:2});if(b&&R()<.5)loot.push({x:b.x+1,y:b.y+1,kind:'food'})}}
  // dead-end islands: one huge building each, something waiting inside
  for(const isl of sats){const c=center(isl);
    if(isl.kind==='pagoda'){const b=hall(isl,5,5,c,'pagoda',{rise:5})||hall(isl,4,4,c,'pagoda',{rise:5});if(b){encounters.push({name:'신전 사제 망령',x:b.x+2,y:b.y+2,r:1},{name:'금령',x:b.x+1,y:b.y+1,r:1});loot.push({x:b.x+2,y:b.y+3,kind:'gear'})}}
    else if(isl.kind==='granary'){const b=hall(isl,10,6,c,'granary',{rise:3})||hall(isl,8,5,c,'granary',{rise:3});if(b){for(let i=0;i<10;i++)put(b.x+1+ri(0,b.w-3),b.y+1+ri(0,b.h-3),'i',pick([TT.CRATE,TT.JAR,TT.CRATE]));for(let i=0;i<3;i++)encounters.push({name:pick(['차원 포식자','공허 가오리']),x:b.x+2+i*3,y:b.y+2,r:2});loot.push({x:b.x+5,y:b.y+2,kind:'potion'},{x:b.x+7,y:b.y+3,kind:'food'})}}
    else{const b=hall(isl,7,7,c,'belltower',{rise:4})||hall(isl,6,6,c,'belltower',{rise:4})||hall(isl,5,5,c,'belltower',{rise:4});if(b){encounters.push({name:'보주의 파수꾼',x:b.x+4,y:b.y+4,r:2});loot.push({x:b.x+3,y:b.y+3,kind:'gear'})}}
  }

  // ---- pack the rest: crowded houses, some of them enterable shops, some with a second storey; leftovers become yards and ponds
  for(const isl of islands){
    let fails=0,placed=0;const inner=isleCells(isl).filter(c=>zone[c.y][c.x]==='a');
    for(let n=0;n<1600&&fails<500&&inner.length;n++){
      const w=ri(3,7),h=ri(3,5),pt=pick(inner),spot=findSpot(isl,w,h,{x:pt.x,y:pt.y},{allow:['a','q'],margin:1,tries:60});
      if(!spot){fails++;continue}
      const enter=w>=5&&h>=4&&R()<.25,door=enter?doorFor(isl,spot.x,spot.y,w,h):null;
      const b=place(isl,spot.x,spot.y,w,h,enter&&door?'shop':'house',enter&&door?{closed:true,door,rise:2}:{rise:ri(1,3)});
      if(!b){fails++;continue}placed++;
      if(b.kind==='shop'){for(let i=0;i<2;i++)put(b.x+1+ri(0,b.w-3),b.y+1+ri(0,b.h-3),'i',pick([TT.TABLE,TT.JAR,TT.CRATE,TT.BENCH]));if(R()<.4)encounters.push({name:pick(['공허 가오리','차원 포식자','금령']),x:b.x+Math.floor(b.w/2),y:b.y+Math.floor(b.h/2),r:1});else if(R()<.5)loot.push({x:b.x+1,y:b.y+1,kind:R()<.5?'food':'potion'})}
    }
    // open pockets that are still bare: a tree-and-bench yard or a small pond
    for(let n=0;n<8;n++){const w=ri(3,4),h=ri(3,4),spot=findSpot(isl,w,h,pick(inner)||{x:isl.cx,y:isl.cy},{allow:['a'],margin:0,tries:40});if(!spot)continue;
      if(R()<.45){rect(spot.x,spot.y,w,h,'w',TT.WATER);if(!connected(isl)){rect(spot.x,spot.y,w,h,'a',TT.FLOOR)}}else{rect(spot.x,spot.y,w,h,'g',TT.GRASS);for(let i=0;i<3;i++)put(spot.x+ri(0,w-1),spot.y+ri(0,h-1),'g',pick([TT.GARDEN_TREE,TT.BENCH]))}}
    // clutter along the alleys and quays
    for(const c of isl.cells)if(zone[c.y][c.x]==='a'&&R()<.07)put(c.x,c.y,'a',pick([TT.JAR,TT.CRATE,TT.BENCH,TT.GARDEN_TREE,TT.LANTERN_POST,TT.JAR]));
    if(!connected(isl))throw new Error(`F23 island ${isl.kind} fell apart`);
  }

  // ---- causeway from the avenue to the palace island: its first three cells are the gate
  const av=majors[7],cx0=C.x+Math.floor(C.w/2)-1,causeway=[];
  let topY=H;for(const c of av.cells)if(c.x>=cx0&&c.x<=cx0+2)topY=Math.min(topY,c.y);
  for(let y=C.y+C.h;y<topY;y++)for(let q=0;q<3;q++)causeway.push({x:cx0+q,y});
  for(const c of causeway)put(c.x,c.y,'s',TT.DRAWBRIDGE_DOWN);
  for(let y=topY;y<topY+3;y++)for(let q=0;q<3;q++)if(isle[y]?.[cx0+q]===av.id){if(zone[y][cx0+q]==='H'||zone[y][cx0+q]==='i'){}else put(cx0+q,y,'q',TT.STONE_PATH)}
  const gateCells=[0,1,2].map(q=>({x:cx0+q,y:C.y+C.h}));for(const g of gateCells)setTerrainTile58(m,g.x,g.y,TT.WALL);

  // ---- the palace island: marble three steps up, the throne hall behind a forecourt holds the stairs
  rect(C.x,C.y,C.w,C.h,'c',TT.MOON_STONE);
  const palace=building(C.x+3,C.y+1,C.w-6,7,'palace',{closed:true,rise:4,floor:TT.GILDED_FLOOR,timber:false});
  for(const [dx,dy] of [[1,9],[C.w-2,9],[1,C.h-2],[C.w-2,C.h-2],[4,12],[C.w-5,12]])put(C.x+dx,C.y+dy,'c',TT.STONE_PILLAR);
  for(const dx of [-2,2])put(palace.door.x+dx,palace.door.y+1,'c',TT.GOLD_LAMP);
  const exit={x:palace.door.x,y:palace.y+2};
  const centerEntry={x:cx0+1,y:C.y+C.h-1},bossSpawn={x:C.x-3,y:C.y+Math.floor(C.h/2)};

  // ---- sluices: each lowers the drawbridge leaving its island and drains the canal beside its house
  const controls=[],switchIds=[],hydraulicCellMeta={};
  sluices.forEach((s,i)=>{
    const id=`f23-sw-${i+1}`;switchIds.push(id);state.switches.push({id,kind:'f23-center',x:s.x,y:s.y,used:false});
    const br=links.find(l=>l.kind==='draw'&&l.from===s.isl.id),changes=[];
    if(br)for(const c of br.cells)changes.push({x:c.x,y:c.y,before:TT.DRAWBRIDGE_UP,after:TT.DRAWBRIDGE_DOWN});
    const dry=[];for(let y=s.b.y-8;y<=s.b.y+s.b.h+8;y++)for(let x=s.b.x-8;x<=s.b.x+s.b.w+8;x++)if(zone[y]?.[x]==='w'&&m[y][x]===TT.WATER&&DIRS8.some(([dx,dy])=>isle[y+dy]?.[x+dx]===s.isl.id))dry.push({x,y,d:Math.hypot(x-s.x,y-s.y)});
    dry.sort((a,b)=>a.d-b.d);for(const c of dry.slice(0,36))changes.push({x:c.x,y:c.y,before:TT.WATER,after:TT.STONE_PATH});
    const control={switchId:id,type:['diversion','spillway','sluice-reverse','pressure-release'][i],label:`${s.isl.name} 수문`,changes,activated:false,
      hydraulic:{drain:changes.filter(ch=>ch.before===TT.WATER).length,flood:0,bridge:changes.filter(ch=>ch.after===TT.DRAWBRIDGE_DOWN).length}};
    controls.push(control);for(const ch of changes)hydraulicCellMeta[k(ch.x,ch.y)]={control:i,type:control.type,before:ch.before,after:ch.after};
    state.featureRooms.push({name:`${s.isl.name} 수문관`,x:s.b.x,y:s.b.y,w:s.b.w,h:s.b.h,kind60:'f23-sluice'});
  });

  // ---- ordinary wanderers, loot, start on the harbour quay
  for(const isl of majors)for(let i=0;i<3;i++){const cs=isleCells(isl).filter(c=>zone[c.y][c.x]==='a'||zone[c.y][c.x]==='p');if(cs.length){const c=pick(cs);encounters.push({name:pick(['공허 가오리','차원 포식자','금령','보주의 파수꾼']),x:c.x,y:c.y,r:2})}}
  for(const l of loot){const item=l.kind==='food'?naturalFoodPick():l.kind==='potion'?choice(ordinaryPotionPool(false,23)):choice(ordinaryGearPool(tierForFloor(23),23));if(item)PlacementService.placeItem({...clone(item),count:1},{x:l.x,y:l.y},{requireReachable:false})}
  const h0=majors[0],sq=isleCells(h0).filter(c=>zone[c.y][c.x]==='q'&&m[c.y][c.x]===TT.STONE_PATH).sort((a,b)=>(b.y-b.x)-(a.y-a.x))[0];
  const start={x:sq.x,y:sq.y};setEnds(start,exit);zone[exit.y][exit.x]='i';
  for(const isl of islands)state.rooms.push(roomRect(Math.max(1,isl.cx-isl.r),Math.max(1,isl.cy-isl.r),Math.floor(isl.r*2),Math.floor(isl.r*2)));
  for(const isl of majors)state.featureRooms.push({name:`수몰 도성 · ${isl.name}`,x:isl.cx-isl.r,y:isl.cy-isl.r,w:isl.r*2,h:isl.r*2,kind60:'f23-district'});
  state.featureRooms.push({name:'중앙 수은호',x:L.x,y:L.y,w:L.w,h:L.h,kind60:'mercury-core'},{name:'수몰 왕궁',x:C.x,y:C.y,w:C.w,h:C.h,kind60:'mercury-platform'});
  const height=zone.map(r=>r.map(z=>CITY23_HEIGHT[z]??0));
  state.floor23={version:22,artVersion:22,preserveAuthoredGeometry:true,centerUnlocked:false,thresholdTriggered:false,keyAcquired:false,
    routeCheckpoints:[start,...sluices.map(s=>({x:s.x,y:s.y})),centerEntry].map(q=>({...q})),
    gateCells,centerEntry,bossSpawn,centerBounds:{...L},switchIds,controls,hydraulicCellMeta,reveal:null,wallStyleByCell,
    districts:majors.map(d=>({id:d.id+1,x:d.cx-d.r,y:d.cy-d.r,w:d.r*2,h:d.r*2,theme:d.kind,name:d.name})),innerDistrictBounds:[],transitBuildings:[],
    city:{zone:zone.map(r=>r.join('')),height,owner,buildings,bridges,causeway,encounters,islands:islands.map(i=>({kind:i.kind,cx:i.cx,cy:i.cy,r:i.r,cells:i.cells.length})),lake:{...L},core:{...C}}};
  state.layoutName='수몰 회색 도성 · 불규칙한 섬들과 운하 미로 / 다리집과 수문 가동교 / 거대 건물 외딴섬 / 수은호 둑길 / 수몰 왕궁';
}

// The floor's own audit. The route is a chain: with n sluices turned the player reaches sluice n+1 and not sluice n+2,
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
