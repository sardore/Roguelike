// 수몰 회색 도성(23층) 전용 그림. drownedcity.js의 의미 지도(구역·높이·소유 건물·다리)를 읽어서 그린다:
// 칸마다 이웃을 추측하지 않고, 집·다리·둑길은 한 덩어리 그림으로 미리 그려 칸마다 잘라 쓴다(천면경탑의 탑 몸체와 같은 방식).
// 높이 차이는 낮은 칸 위쪽에 높은 칸의 단면(석축·계단·대리석 벽)을 그려 보인다.
const CITY_CACHE=new Map();
function cityOn(){return state?.floor===23&&!state.branchContext105&&!state.duel&&!!state.floor23?.city}
function cityCanvas(key,w,h,paint){let c=CITY_CACHE.get(key);if(c)return c;c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d');q.imageSmoothingEnabled=false;paint(q);CITY_CACHE.set(key,c);return c}
const CITY_INDEX=new WeakMap();
function cityPlan(){const c=state.floor23.city;if(!CITY_INDEX.has(c))CITY_INDEX.set(c,{buildings:new Map(c.buildings.map(b=>[b.id,b])),bridges:new Map(c.bridges.map(b=>[b.id,b]))});return c}
function cityIndex(){cityPlan();return CITY_INDEX.get(state.floor23.city)}
function cityZone(x,y){return cityPlan().zone[y]?.[x]??'X'}
function cityHeight(x,y){const z=cityZone(x,y);return z==='H'?(cityBuilding(x,y)?.kind==='palace'?3:1):CITY23_HEIGHT[z]??0}
function cityBuilding(x,y){const p=cityPlan(),id=p.owner[y]?.[x];return id?cityIndex().buildings.get(id)||null:null}
function cityBridge(x,y){const p=cityPlan(),id=p.owner[y]?.[x];return id?cityIndex().bridges.get(id)||null:null}
function cityShade(hex,amt){const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v+amt)));return'#'+[n>>16,n>>8&255,n&255].map(v=>c(v).toString(16).padStart(2,'0')).join('')}

// ---------------- ground ----------------
const CITY_STONE=Object.freeze({quay:['#5d666b','#646d72','#565f64','#6a7378'],alley:['#4b5257','#51585d','#464d52','#555c61'],plaza:['#6b7175','#72787c','#666c70'],terrace:['#8a8f8c','#939893','#848985'],core:['#b9b8ae','#c3c1b6','#b1b0a6']});
function cityPaveSprite(kind,x,y){
  // world-aligned slab courses: each course is 16px tall, joints stagger by course, so slabs run across cell borders
  const course=kind==='quay'?16:kind==='alley'?8:kind==='core'?16:kind==='terrace'?16:10,len=kind==='quay'?40:kind==='alley'?12:kind==='core'?32:kind==='terrace'?24:20;
  const gx=(x*32)%(len*course),gy=(y*32)%(course*4);
  return cityCanvas(`pave|${kind}|${gx}|${gy}`,32,32,q=>{
    const tones=CITY_STONE[kind];q.fillStyle=tones[0];q.fillRect(0,0,32,32);
    for(let yy=-course;yy<32+course;yy+=course){const row=Math.floor((gy+yy)/course),off=(row*len*.5)%len;
      for(let xx=-len;xx<32+len;xx+=len){const sx=xx-((gx+off)%len),col=Math.floor((gx+off+sx)/len),h=hash2(col,row,733+kind.length);
        q.fillStyle=tones[Math.floor(h*tones.length)];q.fillRect(sx+1,yy+1,len-1,course-1);
        q.fillStyle='rgba(255,255,255,.07)';q.fillRect(sx+1,yy+1,len-1,1);q.fillStyle='rgba(0,0,0,.16)';q.fillRect(sx+1,yy+course-1,len-1,1);
        if(kind!=='core'&&h>.86){q.fillStyle='rgba(28,32,34,.45)';q.fillRect(sx+4+Math.floor(h*9),yy+3,1,Math.min(course-5,6))}
        if(kind==='alley'&&h<.08){q.fillStyle='rgba(74,104,80,.5)';q.fillRect(sx+2,yy+course-3,4,2)}}
      q.fillStyle=kind==='core'?'rgba(176,140,62,.55)':'rgba(24,28,31,.55)';q.fillRect(0,yy,32,1)}
    if(kind==='core'){q.fillStyle='rgba(255,255,240,.05)';q.fillRect(0,0,32,32)}
  });
}
function cityPlanks(x,y,gilded){
  const gy=(y*32)%40;
  return cityCanvas(`planks|${gilded?1:0}|${x%5}|${gy}`,32,32,q=>{
    const base=gilded?'#7d5f35':'#5a4a3a';q.fillStyle=base;q.fillRect(0,0,32,32);
    for(let yy=-8;yy<40;yy+=8){const row=Math.floor((gy+yy)/8),h=hash2(row,3,741);q.fillStyle=cityShade(base,(h-.5)*22);q.fillRect(0,yy+1,32,7);q.fillStyle='rgba(255,236,200,.08)';q.fillRect(0,yy+1,32,1);q.fillStyle='rgba(20,14,8,.55)';q.fillRect(0,yy,32,1);
      const joint=Math.floor(((row*53)%160+160)%160)-(x%5)*32;if(joint>=0&&joint<32){q.fillStyle='rgba(20,14,8,.5)';q.fillRect(joint,yy+1,1,7)}}
    if(gilded){q.fillStyle='rgba(240,200,110,.10)';q.fillRect(0,0,32,32)}
  });
}
function cityWaterBase(x,y,mercury){
  const v=(x*7+y*3)%4;
  return cityCanvas(`water|${mercury?1:0}|${v}`,32,32,q=>{
    const g=q.createLinearGradient(0,0,0,32);if(mercury){g.addColorStop(0,'#7f8a8c');g.addColorStop(1,'#646f72')}else{g.addColorStop(0,'#21383f');g.addColorStop(1,'#1a2e34')}
    q.fillStyle=g;q.fillRect(0,0,32,32);q.fillStyle=mercury?'rgba(230,240,238,.16)':'rgba(120,170,176,.08)';
    for(let i=0;i<3;i++)q.fillRect((i*11+v*7)%22,5+i*10,7+i*2,1);
  });
}
function cityCanalBed(x,y){
  const v=(x*5+y*11)%4;
  return cityCanvas(`bed|${v}`,32,32,q=>{
    q.fillStyle='#363d3f';q.fillRect(0,0,32,32);
    for(let row=0;row<4;row++)for(let c=-1;c<3;c++){const h=hash2(c+v,row,745);q.fillStyle=h<.5?'#3d4547':'#323a3c';q.fillRect(c*14+(row%2?7:0)+1,row*8+1,13,7)}
    q.fillStyle='rgba(28,46,50,.85)';q.beginPath();q.ellipse(10+v*4,20,7,3,0,0,Math.PI*2);q.fill();q.fillStyle='rgba(120,160,164,.25)';q.fillRect(6+v*4,19,6,1);
    q.fillStyle='rgba(78,104,82,.4)';q.fillRect(3,4+v,5,2);
  });
}

// ---------------- elevation: the face of the higher cell to the north, drawn across the top of this lower cell ----------------
function cityRiser(kind,drop,water,stairs,x){
  const h=Math.min(26,8+drop*7);
  return cityCanvas(`riser|${kind}|${drop}|${water?1:0}|${stairs?1:0}|${x%3}`,32,32,q=>{
    if(stairs){ // broad steps up to a raised court
      for(let i=0;i<3;i++){const y0=i*Math.floor(h/3);q.fillStyle=i%2?'#7d827f':'#878c88';q.fillRect(0,y0,32,Math.floor(h/3));q.fillStyle='rgba(255,255,255,.12)';q.fillRect(0,y0,32,1);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(0,y0+Math.floor(h/3)-1,32,1)}
      return;
    }
    const stone=kind==='core'?['#a9a79c','#b3b1a5','#9f9d93']:kind==='terrace'?['#7a7f7c','#838884','#727774']:['#4f585e','#586168','#4a5359'];
    for(let row=0;row*6<h;row++){const off=(row+x)%2?8:0;for(let c=-1;c<3;c++){const t=hash2(c+x*2,row,751);q.fillStyle=stone[Math.floor(t*3)];q.fillRect(c*16+off+1,row*6+1,15,5)}q.fillStyle='rgba(12,16,18,.55)';q.fillRect(0,row*6,32,1)}
    q.fillStyle='rgba(255,255,255,.10)';q.fillRect(0,0,32,1);
    if(kind==='core'){q.fillStyle='#b58f45';q.fillRect(0,2,32,2)}
    if(water){const g=q.createLinearGradient(0,h-8,0,h+3);g.addColorStop(0,'rgba(20,40,44,0)');g.addColorStop(1,'rgba(20,40,44,.85)');q.fillStyle=g;q.fillRect(0,h-8,32,11);q.fillStyle='rgba(70,104,80,.55)';q.fillRect(0,h-4,32,2);q.fillStyle='rgba(190,220,220,.25)';q.fillRect(0,h,32,1)}
    else{q.fillStyle='rgba(0,0,0,.35)';q.fillRect(0,h,32,3)}
  });
}
function drawCityRelief(px,py,x,y){
  const here=cityHeight(x,y),zone=cityZone(x,y),north=cityZone(x,y-1),hn=cityHeight(x,y-1);
  if(hn>here&&north!=='H'&&north!=='b'&&north!=='d'){
    const kind=north==='c'?'core':north==='t'?'terrace':'quay',water=zone==='w'||zone==='m';
    const stairs=north==='t'&&!water&&cityZone(x-1,y-1)==='t'&&cityZone(x+1,y-1)==='t';
    X.drawImage(cityRiser(kind,hn-here,water&&(state.map[y][x]===TT.WATER||state.map[y][x]===TT.MERCURY),stairs,x),px,py);
  }
  // side shade where a higher neighbour stands to the west or east
  for(const [dx,side] of [[-1,0],[1,28]]){if(cityHeight(x+dx,y)>here&&cityZone(x+dx,y)!=='H'){X.fillStyle='rgba(6,10,12,.28)';X.fillRect(px+side,py,4,32)}}
}

// ---------------- buildings: one picture per building, sliced per cell ----------------
const CITY_ROOF=Object.freeze([['#3d474d','#4a555c','#2b3337'],['#3b4a47','#475752','#29332f'],['#44474c','#53565b','#2f3236'],['#4a4540','#58524b','#332f2b']]);
function cityBuildingSprite(b){
  return cityCanvas(`bld|${state.floor23.city.zone[0].length}|${b.id}|${b.x},${b.y}`,b.w*32,b.h*32,q=>{
    const W=b.w*32,H=b.h*32,R=CITY_ROOF[b.tone%CITY_ROOF.length];
    if(b.kind==='house'){
      const roofH=H-22,facadeY=roofH-4;
      // facade: stone plinth, whitewashed wall between timber posts, lattice windows and a shuttered door
      q.fillStyle='#22292d';q.fillRect(0,facadeY,W,H-facadeY);
      q.fillStyle='#b6b6ac';q.fillRect(0,facadeY,W,16);
      for(let i=0;i<b.w;i++){const h=hash2(b.id,i,761);q.fillStyle='rgba(120,112,96,.12)';q.fillRect(i*32+4+Math.floor(h*14),facadeY+3,3,10);
        if(h<.42){q.fillStyle='#283034';q.fillRect(i*32+9,facadeY+3,14,9);q.strokeStyle='#d4cdb6';q.lineWidth=1;q.strokeRect(i*32+9.5,facadeY+3.5,13,8);q.beginPath();q.moveTo(i*32+16,facadeY+4);q.lineTo(i*32+16,facadeY+11);q.moveTo(i*32+10,facadeY+7.5);q.lineTo(i*32+22,facadeY+7.5);q.stroke();if(h<.12){q.fillStyle='rgba(255,196,110,.35)';q.fillRect(i*32+10,facadeY+4,12,7)}}
        else if(h>.86){q.fillStyle='#4a3a2a';q.fillRect(i*32+10,facadeY+2,12,14);q.fillStyle='#2e241a';q.fillRect(i*32+15,facadeY+2,1,14)}}
      q.fillStyle='#3a2e24';for(let i=0;i<=b.w;i++)q.fillRect(Math.min(W-3,i*32),facadeY,3,16);q.fillRect(0,facadeY,W,2);
      for(let i=0;i*10<W;i++){const h=hash2(b.id,i,763);q.fillStyle=h<.5?'#545d62':'#4b5459';q.fillRect(i*10+1,facadeY+16,9,5)}q.fillStyle='#1e2427';q.fillRect(0,H-1,W,1);
      // roof: two slopes and hipped ends, ribbed tile courses, a heavy ridge with upturned ends, round tile ends along the eave
      const ridgeEW=b.w>=b.h;q.fillStyle=R[0];q.fillRect(0,0,W,roofH);
      if(ridgeEW){const ry=Math.floor(roofH*.42);
        q.fillStyle=R[2];q.fillRect(0,0,W,ry);q.fillStyle=R[1];q.fillRect(0,ry,W,roofH-ry);
        for(let xx=2;xx<W-2;xx+=5){q.fillStyle='rgba(0,0,0,.30)';q.fillRect(xx,0,1,roofH);q.fillStyle='rgba(255,255,255,.07)';q.fillRect(xx+1,ry,1,roofH-ry)}
        for(let yy=ry+5;yy<roofH;yy+=6){q.fillStyle='rgba(0,0,0,.18)';q.fillRect(0,yy,W,1)}
        // hipped ends
        q.fillStyle=cityShade(R[0],-10);q.beginPath();q.moveTo(0,0);q.lineTo(Math.min(W/3,roofH*.55),ry);q.lineTo(0,roofH);q.closePath();q.fill();q.beginPath();q.moveTo(W,0);q.lineTo(W-Math.min(W/3,roofH*.55),ry);q.lineTo(W,roofH);q.closePath();q.fill();
        const inset=Math.min(W/3,roofH*.55);q.fillStyle='#1f2629';q.fillRect(inset,ry-2,W-inset*2,4);q.fillStyle=cityShade(R[1],18);q.fillRect(inset,ry-2,W-inset*2,1);
        for(const ex of [inset-2,W-inset-3]){q.fillStyle='#1f2629';q.fillRect(ex,ry-5,5,4);q.fillRect(ex+(ex<W/2?-2:4),ry-7,3,3)}
      }else{const rx=Math.floor(W/2);
        q.fillStyle=R[2];q.fillRect(0,0,rx,roofH);q.fillStyle=R[1];q.fillRect(rx,0,W-rx,roofH);
        for(let yy=2;yy<roofH;yy+=5){q.fillStyle='rgba(0,0,0,.28)';q.fillRect(0,yy,W,1)}
        for(let xx=3;xx<W;xx+=6){q.fillStyle='rgba(0,0,0,.14)';q.fillRect(xx,0,1,roofH)}
        q.fillStyle='#1f2629';q.fillRect(rx-2,4,4,roofH-10);q.fillStyle=cityShade(R[1],18);q.fillRect(rx+1,4,1,roofH-10);
        q.fillStyle=cityShade(R[0],-10);q.beginPath();q.moveTo(0,roofH);q.lineTo(rx,roofH-Math.min(roofH/3,W*.4));q.lineTo(W,roofH);q.closePath();q.fill();
      }
      // eave: shadow line and round tile ends
      q.fillStyle='rgba(0,0,0,.45)';q.fillRect(0,roofH-3,W,3);for(let xx=1;xx<W;xx+=5){q.fillStyle='#596469';q.beginPath();q.arc(xx+2,roofH-2,2,0,Math.PI*2);q.fill()}
      q.fillStyle='rgba(0,0,0,.35)';q.fillRect(0,roofH,W,3);
      return;
    }
    // halls and the palace are cut open: their wall ring is drawn here, the floor inside belongs to the ground pass
    const palace=b.kind==='palace',wall=palace?'#8c3a2e':'#b3b1a6',post=palace?'#5e2018':'#3a2e24',cap=palace?['#3b3a3a','#6d5a35']:[R[2],R[1]];
    for(let cy=0;cy<b.h;cy++)for(let cx=0;cx<b.w;cx++){
      if(cx>0&&cx<b.w-1&&cy>0&&cy<b.h-1)continue;
      const X0=cx*32,Y0=cy*32,front=cy===b.h-1;
      if(front){q.fillStyle='#22292d';q.fillRect(X0,Y0,32,32);q.fillStyle=wall;q.fillRect(X0,Y0+4,32,18);q.fillStyle=post;q.fillRect(X0,Y0+4,3,18);q.fillRect(X0,Y0+4,32,2);
        if(palace){q.fillStyle='#c79a46';q.fillRect(X0,Y0+20,32,2)}
        for(let i=0;i<3;i++){q.fillStyle=i%2?'#555e63':'#4c5559';q.fillRect(X0+i*11,Y0+22,10,6)}
        q.fillStyle=cap[0];q.fillRect(X0,Y0,32,4);q.fillStyle=cap[1];q.fillRect(X0,Y0+3,32,1)}
      else{ // the top of a wall: a narrow tiled coping seen from above
        q.fillStyle=cap[0];q.fillRect(X0,Y0,32,32);for(let i=0;i<8;i++){q.fillStyle=i%2?cap[1]:cityShade(cap[1],-12);q.fillRect(X0+(cx===0||cx===b.w-1?8:0),Y0+i*4,cx===0||cx===b.w-1?16:32,3)}
        if(cy===0){q.fillStyle='rgba(0,0,0,.35)';q.fillRect(X0,Y0+28,32,4)}if(cx===0){q.fillStyle='rgba(0,0,0,.35)';q.fillRect(X0+24,Y0,4,32)}if(cx===b.w-1){q.fillStyle='rgba(0,0,0,.35)';q.fillRect(X0+4,Y0,4,32)}}
    }
  });
}

// ---------------- bridges and the causeway: one picture per span ----------------
function cityBridgeSprite(br,lowered){
  const xs=br.cells.map(c=>c.x),ys=br.cells.map(c=>c.y),x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0+1,h=Math.max(...ys)-y0+1;
  return{x0,y0,canvas:cityCanvas(`br|${br.id}|${br.kind}|${lowered?1:0}|${x0},${y0}`,w*32,h*32,q=>{
    const W=w*32,H=h*32,ew=br.axis==='ew';
    // draw along a canonical east-west span, then rotate for north-south spans
    q.save();if(!ew){q.translate(W,0);q.rotate(Math.PI/2)}
    const L=ew?W:H,D=ew?H:W;
    if(br.kind==='arch'){
      q.fillStyle='rgba(4,10,12,.45)';q.fillRect(0,D-4,L,6);
      q.fillStyle='#6b7276';q.fillRect(0,4,L,D-8);
      for(let xx=0;xx<L;xx+=8){q.fillStyle=(xx/8)%2?'#737a7e':'#676e72';q.fillRect(xx,5,7,D-10);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(xx+7,5,1,D-10)}
      // the deck humps toward the middle: lighter crown, darker ends
      const g=q.createLinearGradient(0,0,L,0);g.addColorStop(0,'rgba(0,0,0,.18)');g.addColorStop(.5,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.18)');q.fillStyle=g;q.fillRect(0,4,L,D-8);
      for(const py of [0,D-5]){q.fillStyle='#4f575c';q.fillRect(0,py,L,5);q.fillStyle='#8d9498';q.fillRect(0,py,L,1);for(let xx=6;xx<L-4;xx+=Math.max(14,Math.floor(L/4))){q.fillStyle='#3b4246';q.fillRect(xx,py-2,4,7);q.fillStyle='#a2a8ab';q.fillRect(xx,py-2,4,1)}}
    }else if(br.kind==='draw'){
      if(lowered){q.fillStyle='rgba(4,10,12,.45)';q.fillRect(0,D-4,L,6);q.fillStyle='#5b4632';q.fillRect(0,3,L,D-6);
        for(let xx=0;xx<L;xx+=6){q.fillStyle=(xx/6)%2?'#6a523a':'#614a34';q.fillRect(xx,4,5,D-8);q.fillStyle='rgba(20,12,6,.5)';q.fillRect(xx+5,4,1,D-8)}
        for(const bx of [6,L-10]){q.fillStyle='#2b2b2b';q.fillRect(bx,3,3,D-6);q.fillStyle='#777';q.fillRect(bx,3,3,1)}
        for(const py of [1,D-3]){q.fillStyle='#3a3a3a';q.fillRect(0,py,L,2)}}
      else{ // raised: the leaf stands up on the near bank; only its foot and chains show over the water
        for(const [ex,dir] of [[0,1],[L-10,-1]]){q.fillStyle='#4a3a2a';q.fillRect(ex,2,10,D-4);q.fillStyle='#6a523a';q.fillRect(ex+(dir>0?0:6),2,4,D-4);q.strokeStyle='#8a8a86';q.lineWidth=1;q.beginPath();q.moveTo(ex+5,2);q.lineTo(ex+5+dir*14,D/2);q.stroke()}}
    }else{ // causeway: stone deck with low parapets along both sides
      q.fillStyle='#5d6569';q.fillRect(0,0,L,D);for(let xx=0;xx<L;xx+=16)for(let yy=4;yy<D-4;yy+=12){q.fillStyle=((xx+yy)/4)%2?'#646c70':'#596165';q.fillRect(xx+1,yy+1,15,11)}
      for(const py of [0,D-5]){q.fillStyle='#454d52';q.fillRect(0,py,L,5);q.fillStyle='#8c9397';q.fillRect(0,py,L,1)}
    }
    q.restore();
  })};
}
function drawCitySpan(px,py,x,y,br,lowered){
  const s=cityBridgeSprite(br,lowered);X.drawImage(s.canvas,(x-s.x0)*32,(y-s.y0)*32,32,32,px,py,32,32);
}

// ---------------- moving water ----------------
function drawCityWaterSurface(px,py,x,y,now,mercury){
  const wave=((now/(mercury?520:420)+x*2+y)%12)|0,a=mercury?.20+.10*Math.sin(now/600+x*.7+y*.5):.10+.06*Math.sin(now/700+x*.9+y*.6);
  X.fillStyle=mercury?`rgba(240,246,244,${a})`:`rgba(170,206,210,${a})`;X.fillRect(px+3+wave,py+12,9,1);X.fillRect(px+19-(wave>>1),py+24,8,1);
  const north=cityZone(x,y-1);
  if(north==='H'||north==='b'||north==='d'||north==='g'){const g=X.createLinearGradient(0,py,0,py+14);g.addColorStop(0,'rgba(4,10,14,.55)');g.addColorStop(1,'rgba(4,10,14,0)');X.fillStyle=g;X.fillRect(px,py,32,14)}
}

// ---------------- the one entry the main renderer calls for every cell on floor 23 ----------------
function drawCityTile(base,t,px,py,x,y,time,props){
  const zone=cityZone(x,y),now=FX.frameNow||performance.now(),tile=state.map[y][x];
  if(zone==='X'){X.fillStyle='#0b1013';X.fillRect(px,py,32,32);return true}
  if(zone==='H'){
    const b=cityBuilding(x,y);
    if(b){X.drawImage(cityBuildingSprite(b),(x-b.x)*32,(y-b.y)*32,32,32,px,py,32,32);if(tile===TT.DOOR||tile===TT.OPEN_DOOR)drawSpecialTerrain(tile,px,py,x,y,time);return true}
  }
  if(zone==='w'||zone==='m'||zone==='b'||zone==='d'||zone==='g'){
    const liquid=tile===TT.WATER||tile===TT.MERCURY||zone==='b'||zone==='d'||zone==='g';
    if(liquid){X.drawImage(cityWaterBase(x,y,zone==='m'||zone==='g'||tile===TT.MERCURY),px,py);drawCityWaterSurface(px,py,x,y,now,zone==='m'||zone==='g'||tile===TT.MERCURY)}
    else X.drawImage(cityCanalBed(x,y),px,py);
    drawCityRelief(px,py,x,y);
    if(zone==='b'||zone==='d'){const br=cityBridge(x,y);if(br)drawCitySpan(px,py,x,y,br,tile===TT.DRAWBRIDGE_DOWN)}
    if(zone==='g'){const p=cityPlan();if(tile===TT.WALL){drawCitySpan(px,py,x,y,{id:'causeway',kind:'causeway',axis:'ns',cells:p.causeway},true);X.fillStyle='#22262a';X.fillRect(px,py+4,32,24);for(let i=0;i<5;i++){X.fillStyle='#6c6e70';X.fillRect(px+3+i*6,py+4,2,24)}X.fillStyle='#8a8c8e';X.fillRect(px,py+8,32,2);X.fillRect(px,py+20,32,2)}
      else drawCitySpan(px,py,x,y,{id:'causeway',kind:'causeway',axis:'ns',cells:p.causeway},true)}
    return true;
  }
  // grounds
  if(zone==='i')X.drawImage(cityPlanks(x,y,tile===TT.GILDED_FLOOR||cityBuilding(x,y)?.kind==='palace'),px,py);
  else X.drawImage(cityPaveSprite(zone==='q'?'quay':zone==='a'?'alley':zone==='p'?'plaza':zone==='t'?'terrace':zone==='c'?'core':'quay',x,y),px,py);
  drawCityRelief(px,py,x,y);
  if(![TT.FLOOR,TT.STONE_PATH,TT.MOON_STONE,TT.WOOD_FLOOR,TT.GILDED_FLOOR].includes(base)){if(!drawSpecialTerrain(base,px,py,x,y,time))drawInteractiveTerrain(base,px,py,x,y,time)}
  if(t!==base&&t!==TT.FLOOR&&t!==TT.WALL)props.push({t,px,py,x,y});
  return true;
}
