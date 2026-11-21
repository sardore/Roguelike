// 수몰 회색 도성(23층) 전용 그림. drownedcity.js의 의미 지도(구역·소유 건물·다리)만 읽어서 그린다.
// - 바닥 패스(drawCityTile): 칸마다 구역의 재질(부두 석판·골목 돌·광장·장터 벽돌·뜰·폐허·왕궁 대리석·건물 안 마루)을 그리고,
//   높이가 다르면 낮은 칸 위쪽에 높은 칸의 단면(석축·계단·대리석 벽)을 그린다. 닫힌 건물의 벽 고리는 안에서 본 벽으로 그린다.
// - 몸체 패스(drawCityBodies): 건물마다 지붕과 정면을 한 장으로 미리 그려 발자국보다 높이(rise)만큼 위로 올려 덮는다(천면경탑의 탑 몸체와 같은 방식).
//   닫힌 건물은 플레이어가 들어가면 지붕이 걷히고, 플레이어와 보이는 몬스터 곁에서는 비쳐 보인다.
const CITY_CACHE=new Map();
function cityOn(){return state?.floor===23&&!state.branchContext105&&!state.duel&&!!state.floor23?.city}
function cityCanvas(key,w,h,paint){let c=CITY_CACHE.get(key);if(c)return c;c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d');q.imageSmoothingEnabled=false;paint(q);CITY_CACHE.set(key,c);return c}
const CITY_INDEX=new WeakMap();
function cityPlan(){const c=state.floor23.city;if(!CITY_INDEX.has(c))CITY_INDEX.set(c,{buildings:new Map(c.buildings.map(b=>[b.id,b])),bridges:new Map(c.bridges.map(b=>[b.id,b]))});return c}
function cityIndex(){cityPlan();return CITY_INDEX.get(state.floor23.city)}
function cityZone(x,y){return cityPlan().zone[y]?.[x]??'X'}
function cityHeight(x,y){return CITY23_HEIGHT[cityZone(x,y)]??0}
function cityBuilding(x,y){const id=cityPlan().owner[y]?.[x];return id>0?cityIndex().buildings.get(id)||null:null}
function cityBridge(x,y){const id=cityPlan().owner[y]?.[x];return id<0?cityIndex().bridges.get(-id)||null:null}
function cityShade(hex,amt){const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v+amt)));return'#'+[n>>16,n>>8&255,n&255].map(v=>c(v).toString(16).padStart(2,'0')).join('')}

// ---------------- ground ----------------
const CITY_STONE=Object.freeze({quay:['#5d666b','#646d72','#565f64','#6a7378'],alley:['#4b5257','#51585d','#464d52','#555c61'],plaza:['#6b7175','#72787c','#666c70'],terrace:['#8a8f8c','#939893','#848985'],core:['#b9b8ae','#c3c1b6','#b1b0a6'],market:['#6e5b4c','#77634f','#665446','#7d6a58'],ruin:['#4a4f50','#3f4546','#555a5a','#45494a']});
function cityPaveSprite(kind,x,y){
  // world-aligned slab courses: each course is 16px tall, joints stagger by course, so slabs run across cell borders
  const course={quay:16,alley:8,core:16,terrace:16,market:8,ruin:8}[kind]??10,len={quay:40,alley:12,core:32,terrace:24,market:16,ruin:10}[kind]??20;
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

// ---------------- building bodies: roof and front face as one picture, raised by the building's height ----------------
const CITY_ROOF=Object.freeze([['#3d474d','#4a555c','#2b3337'],['#3b4a47','#475752','#29332f'],['#44474c','#53565b','#2f3236'],['#4a4540','#58524b','#332f2b']]);
const CITY_STYLE=Object.freeze({
  house:{wall:'#b6b6ac',post:'#3a2e24',plinth:'#4f585d'},
  warehouse:{wall:'#5c4b3b',post:'#2e241b',plinth:'#4a5257',roof:['#33393d','#3d4448','#262b2e']},
  sluice:{wall:'#7b8286',post:'#3a2e24',plinth:'#566066',roof:['#3a4448','#46525a','#2a3236']},
  marketHall:{wall:'#c2bba8',post:'#5a3a26',plinth:'#5a5f60',roof:['#4a4038','#5a4e44','#342c26']},
  shrine:{wall:'#c9c2ae',post:'#8c2f25',plinth:'#7a7f7c',roof:['#2f514c','#3c645d','#213a36'],band:'#2f6f6a',gold:'#c9a14a'},
  office:{wall:'#c4c0b2',post:'#7a2a20',plinth:'#5f666a',roof:['#3a4247','#485257','#2a3135'],band:'#355a63',gold:'#c9a14a'},
  tower:{wall:'#a9a293',post:'#3a2e24',plinth:'#5a6266',roof:['#3a4448','#46525a','#2a3236']},
  palace:{wall:'#8c3a2e',post:'#5e2018',plinth:'#b1b0a6',roof:['#2e3437','#3d454a','#1f2427'],band:'#2f6f6a',gold:'#d8ac52'},
  bridgehouse:{wall:'#6a523a',post:'#3a2a1c',plinth:'#4f585d',roof:['#3a3f43','#474d52','#2a2e31']}
});
// a hipped roof over a W×H area, ridge along the long side, ribbed tile courses, upturned ridge ends and round eave tiles
function cityRoof(q,x0,y0,W,H,R,opts={}){
  const ew=W>=H;q.fillStyle=R[0];q.fillRect(x0,y0,W,H);
  if(ew){const ry=y0+Math.floor(H*.42),inset=Math.min(W/3,H*.6);
    q.fillStyle=R[2];q.fillRect(x0,y0,W,ry-y0);q.fillStyle=R[1];q.fillRect(x0,ry,W,y0+H-ry);
    for(let xx=x0+2;xx<x0+W-2;xx+=5){q.fillStyle='rgba(0,0,0,.30)';q.fillRect(xx,y0,1,H);q.fillStyle='rgba(255,255,255,.07)';q.fillRect(xx+1,ry,1,y0+H-ry)}
    for(let yy=ry+5;yy<y0+H;yy+=6){q.fillStyle='rgba(0,0,0,.18)';q.fillRect(x0,yy,W,1)}
    q.fillStyle=cityShade(R[0],-12);q.beginPath();q.moveTo(x0,y0);q.lineTo(x0+inset,ry);q.lineTo(x0,y0+H);q.closePath();q.fill();q.beginPath();q.moveTo(x0+W,y0);q.lineTo(x0+W-inset,ry);q.lineTo(x0+W,y0+H);q.closePath();q.fill();
    q.fillStyle='#1d2427';q.fillRect(x0+inset,ry-2,W-inset*2,4);q.fillStyle=opts.gold||cityShade(R[1],18);q.fillRect(x0+inset,ry-2,W-inset*2,1);
    for(const ex of [x0+inset-3,x0+W-inset-2]){q.fillStyle=opts.gold||'#1d2427';q.fillRect(ex,ry-5,5,4);q.fillRect(ex+(ex<x0+W/2?-2:4),ry-8,3,4)}
  }else{const rx=x0+Math.floor(W/2),inset=Math.min(H/3,W*.6);
    q.fillStyle=R[2];q.fillRect(x0,y0,rx-x0,H);q.fillStyle=R[1];q.fillRect(rx,y0,x0+W-rx,H);
    for(let yy=y0+2;yy<y0+H;yy+=5){q.fillStyle='rgba(0,0,0,.28)';q.fillRect(x0,yy,W,1)}for(let xx=x0+3;xx<x0+W;xx+=6){q.fillStyle='rgba(0,0,0,.14)';q.fillRect(xx,y0,1,H)}
    q.fillStyle=cityShade(R[0],-12);q.beginPath();q.moveTo(x0,y0+H);q.lineTo(rx,y0+H-inset);q.lineTo(x0+W,y0+H);q.closePath();q.fill();q.beginPath();q.moveTo(x0,y0);q.lineTo(rx,y0+inset);q.lineTo(x0+W,y0);q.closePath();q.fill();
    q.fillStyle='#1d2427';q.fillRect(rx-2,y0+inset,4,H-inset*2);q.fillStyle=opts.gold||cityShade(R[1],18);q.fillRect(rx+1,y0+inset,1,H-inset*2);
  }
  q.fillStyle='rgba(0,0,0,.45)';q.fillRect(x0,y0+H-3,W,3);for(let xx=x0+1;xx<x0+W;xx+=5){q.fillStyle=opts.gold&&xx%15===1?opts.gold:'#5d686d';q.beginPath();q.arc(xx+2,y0+H-2,2,0,Math.PI*2);q.fill()}
}
// one storey of front face: plinth or floor beam, wall between posts, windows; the ground storey carries the door
function cityStorey(q,y0,W,b,S,ground,storey){
  q.fillStyle='#22292d';q.fillRect(0,y0,W,32);q.fillStyle=S.wall;q.fillRect(0,y0+2,W,ground?22:28);
  const cols=Math.round(W/32),door=b.door&&ground?b.door.x-b.x:-1;
  for(let i=0;i<cols;i++){const X0=i*32,h=hash2(b.id,i+storey*7,761);
    if(i===door){q.fillStyle='#1b1410';q.fillRect(X0+6,y0+4,20,20);q.fillStyle=S.post;q.fillRect(X0+4,y0+3,24,3);q.fillRect(X0+4,y0+3,3,21);q.fillRect(X0+25,y0+3,3,21);continue}
    if(b.kind==='warehouse'){q.fillStyle='rgba(0,0,0,.25)';for(let xx=X0+3;xx<X0+32;xx+=6)q.fillRect(xx,y0+2,1,22);continue}
    if(b.kind==='marketHall'&&ground){for(let s=0;s<4;s++){q.fillStyle=s%2?'#b8452e':'#e3d6b8';q.fillRect(X0+s*8,y0+2,8,7)}q.fillStyle='rgba(0,0,0,.3)';q.fillRect(X0,y0+9,32,2);continue}
    if(h<.55){q.fillStyle='#283034';q.fillRect(X0+9,y0+6,14,11);q.strokeStyle='#d4cdb6';q.lineWidth=1;q.strokeRect(X0+9.5,y0+6.5,13,10);q.beginPath();q.moveTo(X0+16,y0+7);q.lineTo(X0+16,y0+16);q.moveTo(X0+10,y0+11.5);q.lineTo(X0+22,y0+11.5);q.stroke();if(h<.2||b.kind==='palace'){q.fillStyle='rgba(255,196,110,.35)';q.fillRect(X0+10,y0+7,12,9)}}
  }
  q.fillStyle=S.post;for(let i=0;i<=cols;i++)q.fillRect(Math.min(W-3,i*32),y0+2,3,ground?22:28);q.fillRect(0,y0+2,W,2);
  if(S.band){q.fillStyle=S.band;q.fillRect(0,y0+2,W,3);q.fillStyle=S.gold;for(let xx=4;xx<W;xx+=12)q.fillRect(xx,y0+3,4,1)}
  if(ground){for(let i=0;i*10<W;i++){q.fillStyle=hash2(b.id,i,763)<.5?S.plinth:cityShade(S.plinth,-8);q.fillRect(i*10+1,y0+24,9,7)}q.fillStyle='#1e2427';q.fillRect(0,y0+31,W,1)}
  else{q.fillStyle='#262b2e';q.fillRect(0,y0+28,W,4);for(let xx=2;xx<W;xx+=5){q.fillStyle='#5d686d';q.fillRect(xx,y0+29,3,2)}} // a small eave between storeys
}
function cityBodySprite(b){
  const S=CITY_STYLE[b.kind]||CITY_STYLE.house,R=S.roof||CITY_ROOF[b.tone%CITY_ROOF.length],W=b.w*32,F=b.rise*32,Rh=b.h*32;
  return cityCanvas(`body|${b.id}|${b.x},${b.y},${b.w},${b.h},${b.rise}`,W,Rh+F,q=>{
    if(b.kind==='bridgehouse'&&b.axis==='ns'){
      // seen from the south the bridge-house is a gable end over the deck: a dark archway between timber posts
      cityRoof(q,0,0,W,Rh,R);q.fillStyle='#22292d';q.fillRect(0,Rh,W,F);q.fillStyle=S.wall;q.fillRect(0,Rh+2,W,26);q.fillStyle='#120e0b';q.fillRect(32,Rh+6,W-64,26);q.fillStyle=S.post;q.fillRect(26,Rh+2,6,30);q.fillRect(W-32,Rh+2,6,30);
      q.beginPath();q.fillStyle='#120e0b';q.ellipse(W/2,Rh+8,W/2-32,6,0,Math.PI,0);q.fill();return;
    }
    cityRoof(q,0,0,W,Rh,R,{gold:S.gold&&(b.kind==='palace'||b.kind==='shrine')?S.gold:null});
    if(b.kind==='palace'||b.kind==='office'){const ix=Math.floor(W*.18),iw=W-ix*2,ih=Math.floor(Rh*.55);cityRoof(q,ix,Math.floor(Rh*.08),iw,ih,R,{gold:S.gold})} // a second, upper roof
    if(b.kind==='warehouse'){q.fillStyle='#1e2326';q.fillRect(Math.floor(W/2)-10,Math.floor(Rh*.55),20,10);q.fillStyle='rgba(255,220,160,.25)';q.fillRect(Math.floor(W/2)-8,Math.floor(Rh*.55)+2,16,6)} // a loading hatch
    for(let s=b.rise-1;s>=0;s--)cityStorey(q,Rh+(b.rise-1-s)*32,W,b,S,s===0,s);
    if(b.kind==='tower')for(let s=1;s<b.rise;s++){q.fillStyle='#2a3236';q.fillRect(-2,Rh+(b.rise-1-s)*32+26,W+4,6);for(let xx=0;xx<W;xx+=5){q.fillStyle='#56626a';q.fillRect(xx,Rh+(b.rise-1-s)*32+27,3,3)}}
    if(b.kind==='sluice'){const wx=W-24,wy=Rh+F-20;q.strokeStyle='#4a3a2a';q.lineWidth=3;q.beginPath();q.arc(wx,wy,16,0,Math.PI*2);q.stroke();q.lineWidth=2;for(let i=0;i<8;i++){const a=i*Math.PI/4;q.beginPath();q.moveTo(wx,wy);q.lineTo(wx+Math.cos(a)*16,wy+Math.sin(a)*16);q.stroke()}q.fillStyle='#2a2018';q.beginPath();q.arc(wx,wy,4,0,Math.PI*2);q.fill()} // the waterwheel
    if(b.kind==='office'||b.kind==='palace'){const px=Math.floor(W/2)-18;q.fillStyle='#1d1d1d';q.fillRect(px,Rh+(b.rise-1)*32+4,36,10);q.fillStyle=S.gold;q.fillRect(px+3,Rh+(b.rise-1)*32+6,30,6)} // name board
  });
}

// ---------------- ground for the building footprint, parapets and compound walls ----------------
function cityWallInside(x,y,b){
  // from inside a closed building: the back wall shows its timber face, the side and front walls show their top
  const southInside=cityZone(x,y+1)==='i'&&cityBuilding(x,y+1)===b;
  return cityCanvas(`wallin|${b.kind}|${southInside?1:0}`,32,32,q=>{
    const S=CITY_STYLE[b.kind]||CITY_STYLE.house;q.fillStyle='#1c2124';q.fillRect(0,0,32,32);
    if(southInside){q.fillStyle=S.wall;q.fillRect(0,8,32,22);q.fillStyle=S.post;q.fillRect(0,8,32,3);q.fillRect(0,8,3,22);q.fillStyle='rgba(0,0,0,.3)';q.fillRect(0,28,32,4)}
    else{q.fillStyle=cityShade(S.post,10);q.fillRect(6,0,20,32);q.fillStyle='rgba(255,255,255,.08)';q.fillRect(6,0,2,32)}
  });
}
function cityParapet(x,y,compound){
  const eq=(dx,dy)=>cityZone(x+dx,y+dy)===(compound?'W':'r');
  const mask=(eq(0,-1)?1:0)|(eq(1,0)?2:0)|(eq(0,1)?4:0)|(eq(-1,0)?8:0);
  return cityCanvas(`par|${compound?1:0}|${mask}|${(x+y)%2}`,32,32,q=>{
    q.fillStyle=compound?'#3e4549':'#59626a';q.fillRect(0,0,32,32);
    const band=compound?14:10,c0=16-band/2,col=compound?'#262e33':'#7c858b',hi=compound?'#5a666c':'#a0a8ac';
    q.fillStyle=col;q.fillRect(c0,c0,band,band);
    if(mask&1)q.fillRect(c0,0,band,c0);if(mask&4)q.fillRect(c0,c0+band,band,32-c0-band);if(mask&8)q.fillRect(0,c0,c0,band);if(mask&2)q.fillRect(c0+band,c0,32-c0-band,band);
    q.fillStyle=hi;if(mask&10||!(mask&5))q.fillRect(mask&8?0:c0,c0,(mask&2?32:c0+band)-(mask&8?0:c0),1);else q.fillRect(c0,mask&1?0:c0,1,(mask&4?32:c0+band)-(mask&1?0:c0));
    if(compound){q.fillStyle='rgba(255,255,255,.10)';for(let i=2;i<32;i+=4)if(mask&10)q.fillRect(i,c0+2,2,band-4);else q.fillRect(c0+2,i,band-4,2)}
    else if((x+y)%2===0){q.fillStyle='#4b545a';q.fillRect(12,12,8,8);q.fillStyle=hi;q.fillRect(12,12,8,1)} // a post every other cell
  });
}
function cityGrass(x,y){const v=(x*3+y*7)%4;return cityCanvas(`grass|${v}`,32,32,q=>{q.fillStyle='#3d5a3a';q.fillRect(0,0,32,32);for(let i=0;i<14;i++){const h=hash2(i,v,771);q.fillStyle=h<.5?'#4d6e46':'#35503a';q.fillRect(Math.floor(h*29),Math.floor(hash2(v,i,772)*29),2,3)}})}
function cityRubble(x,y){const v=(x*5+y*3)%4;return cityCanvas(`rubble|${v}`,32,32,q=>{for(let i=0;i<6;i++){const h=hash2(i,v,781);q.fillStyle=h<.5?'#5d6466':'#4a5052';q.fillRect(4+Math.floor(h*20),4+Math.floor(hash2(v,i,782)*20),5+i%3,4)}q.fillStyle='rgba(70,96,74,.45)';q.fillRect(2+v*5,24,7,3)})}

// ---------------- bridges and the causeway ----------------
function cityBridgeSprite(br,lowered){
  const xs=br.cells.map(c=>c.x),ys=br.cells.map(c=>c.y),x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0+1,h=Math.max(...ys)-y0+1;
  return{x0,y0,canvas:cityCanvas(`br|${br.id}|${br.kind}|${lowered?1:0}|${x0},${y0}`,w*32,h*32,q=>{
    const W=w*32,H=h*32,ew=br.axis==='ew';q.save();if(!ew){q.translate(W,0);q.rotate(Math.PI/2)}
    const L=ew?W:H,D=ew?H:W;
    if(br.kind==='covered'){q.fillStyle='#5a4a3a';q.fillRect(0,0,L,D);for(let xx=0;xx<L;xx+=6){q.fillStyle=(xx/6)%2?'#6a573f':'#604e39';q.fillRect(xx,1,5,D-2);q.fillStyle='rgba(20,12,6,.5)';q.fillRect(xx+5,1,1,D-2)}}
    else if(br.kind==='draw'){
      if(lowered){q.fillStyle='rgba(4,10,12,.45)';q.fillRect(0,D-4,L,6);q.fillStyle='#5b4632';q.fillRect(0,3,L,D-6);
        for(let xx=0;xx<L;xx+=6){q.fillStyle=(xx/6)%2?'#6a523a':'#614a34';q.fillRect(xx,4,5,D-8);q.fillStyle='rgba(20,12,6,.5)';q.fillRect(xx+5,4,1,D-8)}
        for(const bx of [6,L-10]){q.fillStyle='#2b2b2b';q.fillRect(bx,3,3,D-6);q.fillStyle='#777';q.fillRect(bx,3,3,1)}for(const py of [1,D-3]){q.fillStyle='#3a3a3a';q.fillRect(0,py,L,2)}}
      else for(const [ex,dir] of [[0,1],[L-10,-1]]){q.fillStyle='#4a3a2a';q.fillRect(ex,2,10,D-4);q.fillStyle='#6a523a';q.fillRect(ex+(dir>0?0:6),2,4,D-4);q.strokeStyle='#8a8a86';q.lineWidth=1;q.beginPath();q.moveTo(ex+5,2);q.lineTo(ex+5+dir*18,D/2);q.stroke()}
    }else{q.fillStyle='#5d6569';q.fillRect(0,0,L,D);for(let xx=0;xx<L;xx+=16)for(let yy=4;yy<D-4;yy+=12){q.fillStyle=((xx+yy)/4)%2?'#646c70':'#596165';q.fillRect(xx+1,yy+1,15,11)}
      for(const py of [0,D-5]){q.fillStyle='#454d52';q.fillRect(0,py,L,5);q.fillStyle='#8c9397';q.fillRect(0,py,L,1)}}
    q.restore();
  })};
}
function drawCitySpan(px,py,x,y,br,lowered){const s=cityBridgeSprite(br,lowered);X.drawImage(s.canvas,(x-s.x0)*32,(y-s.y0)*32,32,32,px,py,32,32)}
function drawCityWaterSurface(px,py,x,y,now,mercury){
  const wave=((now/(mercury?520:420)+x*2+y)%12)|0,a=mercury?.20+.10*Math.sin(now/600+x*.7+y*.5):.10+.06*Math.sin(now/700+x*.9+y*.6);
  X.fillStyle=mercury?`rgba(240,246,244,${a})`:`rgba(170,206,210,${a})`;X.fillRect(px+3+wave,py+12,9,1);X.fillRect(px+19-(wave>>1),py+24,8,1);
  const north=cityZone(x,y-1);if(north==='b'||north==='d'||north==='s'||north==='H'){const g=X.createLinearGradient(0,py,0,py+14);g.addColorStop(0,'rgba(4,10,14,.55)');g.addColorStop(1,'rgba(4,10,14,0)');X.fillStyle=g;X.fillRect(px,py,32,14)}
}

// ---------------- the ground pass: the renderer calls this for every cell on floor 23 ----------------
const CITY_GROUND=Object.freeze({q:'quay',a:'alley',p:'plaza',k:'market',t:'terrace',c:'core',u:'ruin'});
function drawCityTile(base,t,px,py,x,y,time,props){
  const zone=cityZone(x,y),now=FX.frameNow||performance.now(),tile=state.map[y][x];
  if(zone==='X'){X.fillStyle='#0b1013';X.fillRect(px,py,32,32);return true}
  if(zone==='r'||zone==='W'){X.drawImage(cityParapet(x,y,zone==='W'),px,py);drawCityRelief(px,py,x,y);return true}
  if(zone==='H'){
    const b=cityBuilding(x,y);
    if(b?.kind==='bridgehouse'){const br=cityIndex().bridges.get(b.bridge);X.drawImage(cityWaterBase(x,y,false),px,py);X.fillStyle='#3a2a1c';if(b.axis==='ns')X.fillRect(px+10,py,12,32);else X.fillRect(px,py+10,32,12);X.fillStyle='#6a523a';if(b.axis==='ns')X.fillRect(px+12,py,3,32);else X.fillRect(px,py+12,32,3);return true}
    if(b?.closed){X.drawImage(cityWallInside(x,y,b),px,py);if(tile===TT.DOOR||tile===TT.OPEN_DOOR)drawSpecialTerrain(tile,px,py,x,y,time);return true}
    // a solid building's base, seen only where its body turns see-through, or a ruin's broken stub
    X.drawImage(cityPaveSprite(b?.kind==='stub'?'ruin':'alley',x,y),px,py);X.fillStyle=b?.kind==='stub'?'#555c5e':'#3b4246';X.fillRect(px+3,py+(b?.kind==='stub'?10:3),26,b?.kind==='stub'?18:26);
    if(b?.kind==='stub'){X.fillStyle='#737a7c';X.fillRect(px+3,py+10,26,3);X.fillStyle='#2b3133';X.fillRect(px+3,py+26,26,2)}return true;
  }
  if(zone==='w'||zone==='m'||zone==='b'||zone==='d'||zone==='s'){
    const mercury=zone==='m'||zone==='s'||tile===TT.MERCURY,wet=tile===TT.WATER||tile===TT.MERCURY||zone!=='w';
    if(wet){X.drawImage(cityWaterBase(x,y,mercury),px,py);drawCityWaterSurface(px,py,x,y,now,mercury)}else X.drawImage(cityCanalBed(x,y),px,py);
    drawCityRelief(px,py,x,y);
    if(zone==='b'||zone==='d'){const br=cityBridge(x,y);if(br)drawCitySpan(px,py,x,y,br,tile===TT.DRAWBRIDGE_DOWN)}
    if(zone==='s'){const span={id:'causeway',kind:'causeway',axis:'ns',cells:cityPlan().causeway};drawCitySpan(px,py,x,y,span,true);
      if(tile===TT.WALL){X.fillStyle='#22262a';X.fillRect(px,py+4,32,24);for(let i=0;i<5;i++){X.fillStyle='#6c6e70';X.fillRect(px+3+i*6,py+4,2,24)}X.fillStyle='#8a8c8e';X.fillRect(px,py+8,32,2);X.fillRect(px,py+20,32,2)}}
    return true;
  }
  if(zone==='i'){const b=cityBuilding(x,y);X.drawImage(tile===TT.MOON_STONE?cityPaveSprite('terrace',x,y):cityPlanks(x,y,tile===TT.GILDED_FLOOR||b?.kind==='palace'),px,py)}
  else if(zone==='g')X.drawImage(cityGrass(x,y),px,py);
  else{X.drawImage(cityPaveSprite(CITY_GROUND[zone]||'quay',x,y),px,py);if(zone==='u')X.drawImage(cityRubble(x,y),px,py)}
  drawCityRelief(px,py,x,y);
  if(![TT.FLOOR,TT.STONE_PATH,TT.MOON_STONE,TT.WOOD_FLOOR,TT.GILDED_FLOOR,TT.GRASS].includes(base)){if(!drawSpecialTerrain(base,px,py,x,y,time))drawInteractiveTerrain(base,px,py,x,y,time)}
  if(t!==base&&t!==TT.FLOOR&&t!==TT.WALL)props.push({t,px,py,x,y});
  return true;
}

// ---------------- the body pass: roofs and front faces over the scene ----------------
const CITY_FADE=new Map();
// a body goes see-through near the player and near every monster the player can see, so nothing hides behind a roof
function cityNear(x,y){
  const p=state.player;let d=Math.hypot(x-p.x,y-p.y);
  if(d>2)for(const m of state.monsters){if(m.hp<=0||!state.visible.has(k(m.x,m.y)))continue;const md=Math.hypot(x-m.x,y-m.y);if(md<d)d=md;if(d<=2)break}
  return Math.min(1,Math.max(0,(d-1.5)/1.5));
}
function drawCityBodies(b,now){
  if(!cityOn())return;const p=state.player,dt=Math.min(100,now-(CITY_FADE.get('t')??now));CITY_FADE.set('t',now);
  for(const bd of cityPlan().buildings){
    if(!(bd.rise>0)||bd.x+bd.w<b.x0-1||bd.x>b.x1+1||bd.y+bd.h<b.y0-1||bd.y-bd.rise>b.y1+1)continue;
    let seen=false,lit=false;for(let y=bd.y;y<bd.y+bd.h&&!lit;y++)for(let x=bd.x;x<bd.x+bd.w;x++){const kk=k(x,y);if(state.seen.has(kk))seen=true;if(state.visible.has(kk)){lit=true;break}}
    if(!seen)continue;
    const inside=bd.closed&&p.x>=bd.x&&p.x<bd.x+bd.w&&p.y>=bd.y&&p.y<bd.y+bd.h;let alpha=CITY_FADE.get(bd.id);const target=inside?0:1;
    alpha=alpha==null?target:alpha+(target-alpha)*Math.min(1,dt/120);CITY_FADE.set(bd.id,alpha);if(alpha<=.02)continue;
    const sprite=cityBodySprite(bd),base=(lit?1:.62)*alpha;X.save();
    for(let cy=0;cy<bd.h+bd.rise;cy++)for(let cx=0;cx<bd.w;cx++){const wx=bd.x+cx,wy=bd.y-bd.rise+cy,a=base*cityNear(wx,wy);if(a<=.02)continue;X.globalAlpha=a;X.drawImage(sprite,cx*32,cy*32,32,32,wx*32,wy*32,32,32)}
    X.restore();
  }
}
