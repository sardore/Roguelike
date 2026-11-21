// 수몰 회색 도성(23층) 전용 그림. drownedcity.js의 의미 지도(구역·소유 건물·다리)만 읽어서 그린다.
// - 바닥 패스(drawCityTile): 칸마다 구역의 재질(부두 석판·골목 돌·광장·장터 벽돌·뜰·폐허·왕궁 대리석·건물 안 마루)을 그리고,
//   높이가 다르면 낮은 칸 위쪽에 높은 칸의 단면(석축·계단·대리석 벽)을 그린다. 닫힌 건물의 벽 고리는 안에서 본 벽으로 그린다.
// - 몸체 패스(drawCityBodies): 건물마다 지붕과 정면을 한 장으로 미리 그려 발자국보다 높이(rise)만큼 위로 올려 덮는다(천면경탑의 탑 몸체와 같은 방식).
//   닫힌 건물은 플레이어가 들어가면 지붕이 걷히고, 플레이어와 보이는 몬스터 곁에서는 비쳐 보인다.
const CITY_CACHE=new Map();
function cityOn(){return state?.floor===23&&!state.branchContext105&&!state.duel&&!!state.floor23?.city}
function cityCanvas(key,w,h,paint){let c=CITY_CACHE.get(key);if(c)return c;c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d');q.imageSmoothingEnabled=false;paint(q);CITY_CACHE.set(key,c);return c}
const CITY_INDEX=new WeakMap();
function cityPlan(){const c=state.floor23.city;if(!CITY_INDEX.has(c))CITY_INDEX.set(c,{buildings:new Map(c.buildings.map(b=>[b.id,b])),bridges:new Map(c.bridges.map(b=>[b.id,b])),decor:new Map((c.decor||[]).map(d=>[k(d.x,d.y),d]))});return c}
function cityIndex(){cityPlan();return CITY_INDEX.get(state.floor23.city)}
function cityZone(x,y){return cityPlan().zone[y]?.[x]??'X'}
function cityHeight(x,y){return CITY23_HEIGHT[cityZone(x,y)]??0}
function cityBuilding(x,y){const id=cityPlan().owner[y]?.[x];return id>0?cityIndex().buildings.get(id)||null:null}
function cityBridge(x,y){const id=cityPlan().owner[y]?.[x];return id<0?cityIndex().bridges.get(-id)||null:null}
function cityMix(a,b,u){const p=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*u).toString(16).padStart(2,'0')).join('')}
function cityShade(hex,amt){const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v+amt)));return'#'+[n>>16,n>>8&255,n&255].map(v=>c(v).toString(16).padStart(2,'0')).join('')}

// ---------------- island colours: each island's stone is tinted toward its scheme; its houses take the scheme's roofs ----------------
const CITY_PALETTES=Object.freeze({
  grey:{tint:null,u:0,roofs:[['#3d474d','#4a555c','#2b3337'],['#44474c','#53565b','#2f3236'],['#3b4a47','#475752','#29332f']]},
  gold:{tint:'#a88a48',u:.42,parapet:['#8f7a46','#b49a58','#e0c27a'],roofs:[['#7a5f26','#a7842f','#553f18'],['#8a6a2c','#b8913a','#5e4719'],['#94742e','#c49c40','#64491a']]},
  jade:{tint:'#5d7a6c',u:.34,parapet:['#55695f','#71877b','#a4b8a8'],roofs:[['#2f514c','#3c645d','#213a36'],['#35574f','#43695f','#25403a']]},
  vermilion:{tint:'#7c4a3e',u:.3,parapet:['#6a4038','#865246','#b98870'],roofs:[['#44474c','#53565b','#2f3236'],['#3d3436','#4b4043','#2b2426']]},
  marble:{tint:'#b5b2a8',u:.4,parapet:['#8e8c86','#aeaca4','#d6d3c8'],roofs:[['#3b4a57','#475a68','#2a353f'],['#3d474d','#4a555c','#2b3337']]}
});
function cityPaletteAt(x,y){const id=cityPlan().isle?.[y]?.[x];return id>=0?cityPlan().islands[id]?.palette||'grey':'grey'}
// ---------------- ground ----------------
const CITY_STONE=Object.freeze({quay:['#5d666b','#646d72','#565f64','#6a7378'],alley:['#4b5257','#51585d','#464d52','#555c61'],plaza:['#6b7175','#72787c','#666c70'],terrace:['#8a8f8c','#939893','#848985'],core:['#b9b8ae','#c3c1b6','#b1b0a6'],market:['#6e5b4c','#77634f','#665446','#7d6a58'],ruin:['#4a4f50','#3f4546','#555a5a','#45494a']});
function cityPaveSprite(kind,x,y,pal='grey'){
  // world-aligned slab courses: each course is 16px tall, joints stagger by course, so slabs run across cell borders
  const course={quay:16,alley:8,core:16,terrace:16,market:8,ruin:8}[kind]??10,len={quay:40,alley:12,core:32,terrace:24,market:16,ruin:10}[kind]??20;
  const gx=(x*32)%(len*course),gy=(y*32)%(course*4);
  return cityCanvas(`pave|${kind}|${gx}|${gy}|${pal}`,32,32,q=>{
    const P=CITY_PALETTES[pal]||CITY_PALETTES.grey,tones=P.tint?CITY_STONE[kind].map(c=>cityMix(c,P.tint,P.u)):CITY_STONE[kind];q.fillStyle=tones[0];q.fillRect(0,0,32,32);
    for(let yy=-course;yy<32+course;yy+=course){const row=Math.floor((gy+yy)/course),off=(row*len*.5)%len;
      for(let xx=-len;xx<32+len;xx+=len){const sx=xx-((gx+off)%len),col=Math.floor((gx+off+sx)/len),h=hash2(col,row,733+kind.length);
        q.fillStyle=tones[Math.floor(h*tones.length)];q.fillRect(sx+1,yy+1,len-1,course-1);
        q.fillStyle='rgba(255,255,255,.07)';q.fillRect(sx+1,yy+1,len-1,1);q.fillStyle='rgba(0,0,0,.16)';q.fillRect(sx+1,yy+course-1,len-1,1);
        if(kind!=='core'&&h>.86){q.fillStyle='rgba(28,32,34,.45)';q.fillRect(sx+4+Math.floor(h*9),yy+3,1,Math.min(course-5,6))}
        if(kind==='alley'&&h<.08){q.fillStyle='rgba(74,104,80,.5)';q.fillRect(sx+2,yy+course-3,4,2)}}
      q.fillStyle=kind==='core'?'rgba(210,168,74,.8)':(kind==='plaza'||kind==='terrace')&&row%4===0?'rgba(210,168,74,.4)':'rgba(24,28,31,.55)';q.fillRect(0,yy,32,1)}
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
  // the tone follows a slow field across the whole canal so the water reads as one sheet, not as tiles; near the palace the
  // mercury catches its gold
  const v=(x*7+y*3)%4,f=.5+.25*Math.sin(x*.31+y*.17)+.25*Math.sin(y*.37-x*.11),t=Math.max(0,Math.min(3,Math.floor(f*4)));
  const core=state.floor23?.city?.core,gap=core?Math.max(core.x-x,x-(core.x+core.w-1),core.y-y,y-(core.y+core.h-1),0):99,near=0;
  return cityCanvas(`water|${mercury?1:0}|${t}|${v}|${near}`,32,32,q=>{
    q.fillStyle=mercury?cityMix(['#4c575d','#505b61','#545f64','#586368'][t],['#6e6448','#74694b','#7a6e4e','#807351'][t],near/3):['#1b3138','#1c333a','#1e353c','#1f373e'][t];q.fillRect(0,0,32,32);
    q.fillStyle=mercury?'rgba(236,242,240,.18)':'rgba(120,170,176,.08)';for(let i=0;i<3;i++)q.fillRect((i*11+v*7)%22,5+i*10,7+i*2,1);
    if(mercury){q.fillStyle=near?`rgba(240,206,120,${.08+near*.06})`:'rgba(255,255,255,.07)';q.fillRect((v*9)%20,(v*13)%26,10,2);q.fillStyle='rgba(30,36,40,.12)';q.fillRect(((v+2)*7)%24,((v+1)*11)%28,8,1)}
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
const CITY_GOLD='#d2a84a';
const CITY_ROOF=Object.freeze([['#7a5f26','#a7842f','#553f18'],['#8a6a2c','#b8913a','#5e4719'],['#3b4a47','#475752','#29332f'],['#44474c','#53565b','#2f3236'],['#4a4540','#58524b','#332f2b']]);
const CITY_STYLE=Object.freeze({
  house:{wall:'#b6b6ac',post:'#3a2e24',plinth:'#4f585d'},
  warehouse:{wall:'#5c4b3b',post:'#2e241b',plinth:'#4a5257',roof:['#33393d','#3d4448','#262b2e']},
  sluice:{wall:'#7b8286',post:'#3a2e24',plinth:'#566066',roof:['#3a4448','#46525a','#2a3236']},
  marketHall:{wall:'#c2bba8',post:'#5a3a26',plinth:'#5a5f60',roof:['#4a4038','#5a4e44','#342c26']},
  shrine:{wall:'#c9c2ae',post:'#8c2f25',plinth:'#7a7f7c',roof:['#8a6a28','#b8923a','#5e4619'],band:'#2f6f6a',gold:'#f0cf7a'},
  office:{wall:'#c4c0b2',post:'#7a2a20',plinth:'#5f666a',roof:['#7e6226','#ad8a33','#58421a'],band:'#7a2a20',gold:'#f0cf7a'},
  tower:{wall:'#a9a293',post:'#3a2e24',plinth:'#5a6266',roof:['#3a4448','#46525a','#2a3236']},
  palace:{wall:'#8c3a2e',post:'#5e2018',plinth:'#b1b0a6',roof:['#9a7a2c','#d0a844','#6a501c'],band:'#8c3a2e',gold:'#ffe08a'},
  pagoda:{wall:'#bdb6a2',post:'#7a2a20',plinth:'#6a7074',roof:['#8a6a28','#b8923a','#5e4619'],band:'#7a2a20',gold:'#f0cf7a'},
  belltower:{wall:'#9c978a',post:'#3a2e24',plinth:'#5a6266',roof:['#7e6226','#ad8a33','#58421a'],band:'#5a3a26',gold:'#f0cf7a'},
  granary:{wall:'#8a735a',post:'#2e241b',plinth:'#4a5257',roof:['#3d474d','#4a555c','#2b3337']},
  pavilion:{wall:'#c9c2ae',post:'#8c2f25',plinth:'#7a7f7c',roof:['#2f514c','#3c645d','#213a36']},
  bridgehouse:{wall:'#6a523a',post:'#3a2a1c',plinth:'#4f585d',roof:['#5e4a22','#7f652c','#3f3116']}
});
// a hipped roof over a W×H area, ridge along the long side, ribbed tile courses, upturned ridge ends and round eave tiles
function cityRoof(q,x0,y0,W,H,R,opts={}){
  const ew=W>=H;q.fillStyle=R[0];q.fillRect(x0,y0,W,H);
  if(ew){const ry=y0+Math.floor(H*.42),inset=Math.min(W/3,H*.6);
    q.fillStyle=R[2];q.fillRect(x0,y0,W,ry-y0);q.fillStyle=R[1];q.fillRect(x0,ry,W,y0+H-ry);
    for(let xx=x0+2;xx<x0+W-2;xx+=5){q.fillStyle='rgba(0,0,0,.30)';q.fillRect(xx,y0,1,H);q.fillStyle='rgba(255,255,255,.07)';q.fillRect(xx+1,ry,1,y0+H-ry)}
    for(let yy=ry+5;yy<y0+H;yy+=6){q.fillStyle='rgba(0,0,0,.18)';q.fillRect(x0,yy,W,1)}
    q.fillStyle=cityShade(R[0],-12);q.beginPath();q.moveTo(x0,y0);q.lineTo(x0+inset,ry);q.lineTo(x0,y0+H);q.closePath();q.fill();q.beginPath();q.moveTo(x0+W,y0);q.lineTo(x0+W-inset,ry);q.lineTo(x0+W,y0+H);q.closePath();q.fill();
    q.fillStyle='#1d2427';q.fillRect(x0+inset,ry-2,W-inset*2,4);q.fillStyle=opts.gold||CITY_GOLD;q.fillRect(x0+inset,ry-2,W-inset*2,2);
    for(const ex of [x0+inset-3,x0+W-inset-2]){q.fillStyle=opts.gold||CITY_GOLD;q.fillRect(ex,ry-5,5,4);q.fillRect(ex+(ex<x0+W/2?-2:4),ry-8,3,4)}
  }else{const rx=x0+Math.floor(W/2),inset=Math.min(H/3,W*.6);
    q.fillStyle=R[2];q.fillRect(x0,y0,rx-x0,H);q.fillStyle=R[1];q.fillRect(rx,y0,x0+W-rx,H);
    for(let yy=y0+2;yy<y0+H;yy+=5){q.fillStyle='rgba(0,0,0,.28)';q.fillRect(x0,yy,W,1)}for(let xx=x0+3;xx<x0+W;xx+=6){q.fillStyle='rgba(0,0,0,.14)';q.fillRect(xx,y0,1,H)}
    q.fillStyle=cityShade(R[0],-12);q.beginPath();q.moveTo(x0,y0+H);q.lineTo(rx,y0+H-inset);q.lineTo(x0+W,y0+H);q.closePath();q.fill();q.beginPath();q.moveTo(x0,y0);q.lineTo(rx,y0+inset);q.lineTo(x0+W,y0);q.closePath();q.fill();
    q.fillStyle='#1d2427';q.fillRect(rx-2,y0+inset,4,H-inset*2);q.fillStyle=opts.gold||CITY_GOLD;q.fillRect(rx,y0+inset,2,H-inset*2);
  }
  const G=opts.gold||CITY_GOLD;
  if(ew){const ry=y0+Math.floor(H*.42),inset=Math.min(W/3,H*.6);q.strokeStyle=G;q.lineWidth=1.5;q.beginPath();q.moveTo(x0+1,y0+1);q.lineTo(x0+inset,ry);q.lineTo(x0+1,y0+H-2);q.moveTo(x0+W-1,y0+1);q.lineTo(x0+W-inset,ry);q.lineTo(x0+W-1,y0+H-2);q.stroke();
    if(W>=192)for(let xx=x0+128;xx<x0+W-96;xx+=128){q.fillStyle='rgba(0,0,0,.35)';q.fillRect(xx-1,y0,3,H);q.fillStyle='rgba(255,230,160,.12)';q.fillRect(xx+2,y0,1,H);q.fillStyle=G;q.fillRect(xx-3,ry-6,7,5);q.fillStyle='#fff0b8';q.fillRect(xx-1,ry-6,2,1)}}
  else{const rx=x0+Math.floor(W/2),inset=Math.min(H/3,W*.6);q.strokeStyle=G;q.lineWidth=1.5;q.beginPath();q.moveTo(x0+1,y0+1);q.lineTo(rx,y0+inset);q.lineTo(x0+W-1,y0+1);q.moveTo(x0+1,y0+H-1);q.lineTo(rx,y0+H-inset);q.lineTo(x0+W-1,y0+H-1);q.stroke();
    if(H>=192)for(let yy=y0+128;yy<y0+H-96;yy+=128){q.fillStyle='rgba(0,0,0,.35)';q.fillRect(x0,yy-1,W,3);q.fillStyle='rgba(255,230,160,.12)';q.fillRect(x0,yy+2,W,1);q.fillStyle=G;q.fillRect(rx-3,yy-3,7,7);q.fillStyle='#fff0b8';q.fillRect(rx-1,yy-3,2,1)}}
  q.fillStyle='rgba(0,0,0,.45)';q.fillRect(x0,y0+H-3,W,3);for(let xx=x0+1;xx<x0+W;xx+=5){q.fillStyle=xx%10===1?(opts.gold||CITY_GOLD):'#a98a45';q.beginPath();q.arc(xx+2,y0+H-2,2,0,Math.PI*2);q.fill()}
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
  q.fillStyle=S.post;for(let i=0;i<=cols;i++)q.fillRect(Math.min(W-3,i*32),y0+2,3,ground?22:28);q.fillRect(0,y0+2,W,2);q.fillStyle=CITY_GOLD;q.fillRect(0,y0+4,W,1);for(let i=0;i<=cols;i++)q.fillRect(Math.min(W-3,i*32),y0+2,3,1);
  if(S.band){q.fillStyle=S.band;q.fillRect(0,y0+2,W,3);q.fillStyle=S.gold;for(let xx=4;xx<W;xx+=12)q.fillRect(xx,y0+3,4,1)}
  if(ground){for(let i=0;i*10<W;i++){q.fillStyle=hash2(b.id,i,763)<.5?S.plinth:cityShade(S.plinth,-8);q.fillRect(i*10+1,y0+24,9,7)}q.fillStyle='#1e2427';q.fillRect(0,y0+31,W,1)}
  else{q.fillStyle='#262b2e';q.fillRect(0,y0+28,W,4);q.fillStyle=CITY_GOLD;q.fillRect(0,y0+28,W,1);for(let xx=2;xx<W;xx+=5){q.fillStyle='#a98a45';q.fillRect(xx,y0+29,3,2)}} // a small eave between storeys
}
function cityBodySprite(b){
  const S=CITY_STYLE[b.kind]||CITY_STYLE.house,PR=CITY_PALETTES[b.palette]?.roofs,R=S.roof||(PR?PR[b.tone%PR.length]:CITY_ROOF[b.tone%CITY_ROOF.length]),W=b.w*32,F=b.rise*32,Rh=b.h*32;
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
// the walls of a closed building are the shared timber-and-plaster wall; red beams, gold fittings
const CITY_WALL=Object.freeze({...DOJO_PALETTES[2],metal:CITY_GOLD});
const CITY_PALACE_WALL=Object.freeze({...DOJO_PALETTES[2],wall:'#9a4a36',cap:'#e6bf62',beam:'#5e2018',dark:'#2a1410',grain:'#b8873e',metal:'#ffe08a'});
function cityParapet(x,y,compound,pal='grey'){
  const eq=(dx,dy)=>cityZone(x+dx,y+dy)===(compound?'W':'r');
  const mask=(eq(0,-1)?1:0)|(eq(1,0)?2:0)|(eq(0,1)?4:0)|(eq(-1,0)?8:0);
  return cityCanvas(`par|${compound?1:0}|${mask}|${(x+y)%2}|${pal}`,32,32,q=>{
    const PP=CITY_PALETTES[pal]?.parapet||['#59626a','#7c858b','#a0a8ac'];
    q.fillStyle=compound?'#6e2a20':PP[0];q.fillRect(0,0,32,32);
    const band=compound?14:10,c0=16-band/2,col=compound?'#2e3437':PP[1],hi=compound?CITY_GOLD:PP[2];
    q.fillStyle=col;q.fillRect(c0,c0,band,band);
    if(mask&1)q.fillRect(c0,0,band,c0);if(mask&4)q.fillRect(c0,c0+band,band,32-c0-band);if(mask&8)q.fillRect(0,c0,c0,band);if(mask&2)q.fillRect(c0+band,c0,32-c0-band,band);
    q.fillStyle=hi;if(mask&10||!(mask&5))q.fillRect(mask&8?0:c0,c0,(mask&2?32:c0+band)-(mask&8?0:c0),1);else q.fillRect(c0,mask&1?0:c0,1,(mask&4?32:c0+band)-(mask&1?0:c0));
    if(compound){q.fillStyle='rgba(255,255,255,.10)';for(let i=2;i<32;i+=4)if(mask&10)q.fillRect(i,c0+2,2,band-4);else q.fillRect(c0+2,i,band-4,2)}
    else if((x+y)%2===0){q.fillStyle='#8a6a28';q.fillRect(12,12,8,8);q.fillStyle=CITY_GOLD;q.fillRect(12,12,8,2);q.fillRect(15,9,2,3)}else{q.fillStyle=CITY_GOLD;q.fillRect(c0,c0,band,1)} // a post every other cell
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
    if(br.kind==='covered'){q.fillStyle='#5a4a3a';q.fillRect(0,0,L,D);for(let xx=0;xx<L;xx+=6){q.fillStyle=(xx/6)%2?'#6a573f':'#604e39';q.fillRect(xx,1,5,D-2);q.fillStyle='rgba(20,12,6,.5)';q.fillRect(xx+5,1,1,D-2)}q.fillStyle='#8a6a28';q.fillRect(0,0,L,2);q.fillRect(0,D-2,L,2);q.fillStyle=CITY_GOLD;q.fillRect(0,0,L,1);q.fillRect(0,D-2,L,1)}
    else if(br.kind==='draw'){
      if(lowered){q.fillStyle='rgba(4,10,12,.45)';q.fillRect(0,D-4,L,6);q.fillStyle='#5b4632';q.fillRect(0,3,L,D-6);
        for(let xx=0;xx<L;xx+=6){q.fillStyle=(xx/6)%2?'#6a523a':'#614a34';q.fillRect(xx,4,5,D-8);q.fillStyle='rgba(20,12,6,.5)';q.fillRect(xx+5,4,1,D-8)}
        for(const bx of [6,L-10]){q.fillStyle='#2b2b2b';q.fillRect(bx,3,3,D-6);q.fillStyle='#777';q.fillRect(bx,3,3,1)}for(const py of [1,D-3]){q.fillStyle='#3a3a3a';q.fillRect(0,py,L,2);q.fillStyle=CITY_GOLD;q.fillRect(0,py,L,1);for(let xx=4;xx<L;xx+=16)q.fillRect(xx,py-1,3,3)}}
      else for(const [ex,dir] of [[0,1],[L-10,-1]]){q.fillStyle='#4a3a2a';q.fillRect(ex,2,10,D-4);q.fillStyle='#6a523a';q.fillRect(ex+(dir>0?0:6),2,4,D-4);q.strokeStyle='#8a8a86';q.lineWidth=1;q.beginPath();q.moveTo(ex+5,2);q.lineTo(ex+5+dir*18,D/2);q.stroke()}
    }else{q.fillStyle='#5d6569';q.fillRect(0,0,L,D);for(let xx=0;xx<L;xx+=16)for(let yy=4;yy<D-4;yy+=12){q.fillStyle=((xx+yy)/4)%2?'#646c70':'#596165';q.fillRect(xx+1,yy+1,15,11)}
      for(const py of [0,D-5]){q.fillStyle='#454d52';q.fillRect(0,py,L,5);q.fillStyle=CITY_GOLD;q.fillRect(0,py,L,1);for(let xx=6;xx<L;xx+=24){q.fillStyle='#8a6a28';q.fillRect(xx,py,6,5);q.fillStyle=CITY_GOLD;q.fillRect(xx,py,6,2)}}}
    q.restore();
  })};
}
function drawCitySpan(px,py,x,y,br,lowered){const s=cityBridgeSprite(br,lowered);X.drawImage(s.canvas,(x-s.x0)*32,(y-s.y0)*32,32,32,px,py,32,32)}
function drawCityWaterSurface(px,py,x,y,now,mercury){
  const wave=((now/(mercury?520:420)+x*2+y)%12)|0,a=mercury?.20+.10*Math.sin(now/600+x*.7+y*.5):.10+.06*Math.sin(now/700+x*.9+y*.6);
  X.fillStyle=mercury?`rgba(240,246,244,${a})`:`rgba(170,206,210,${a})`;X.fillRect(px+3+wave,py+12,9,1);X.fillRect(px+19-(wave>>1),py+24,8,1);
  if(!mercury&&(x*7+y*13)%3===0){const g=.18+.14*Math.sin(now/500+x+y*1.7);X.fillStyle=`rgba(240,200,100,${g})`;X.fillRect(px+8+(wave>>1),py+17,6,1);X.fillRect(px+20-(wave>>1),py+7,3,1)}
  const north=cityZone(x,y-1);if(north==='b'||north==='d'||north==='s'||north==='H'){const g=X.createLinearGradient(0,py,0,py+14);g.addColorStop(0,'rgba(4,10,14,.55)');g.addColorStop(1,'rgba(4,10,14,0)');X.fillStyle=g;X.fillRect(px,py,32,14)}
}


// a solid building's footprint where its body turns see-through: the stone plinth it stands on, edged where the footprint ends
function cityPlinth(x,y,b){
  const same=(dx,dy)=>cityPlan().owner[y+dy]?.[x+dx]===b?.id,mask=(same(0,-1)?1:0)|(same(1,0)?2:0)|(same(0,1)?4:0)|(same(-1,0)?8:0);
  return cityCanvas(`plinth|${mask}|${(x+y)&1}`,32,32,q=>{
    q.fillStyle='#3e464a';q.fillRect(0,0,32,32);for(let yy=0;yy<32;yy+=8){q.fillStyle=(yy/8+(x+y))%2?'#434b50':'#3a4246';q.fillRect(0,yy,32,7)}
    q.fillStyle='rgba(0,0,0,.18)';for(let yy=7;yy<32;yy+=8)q.fillRect(0,yy,32,1);
    q.fillStyle='#6b7378';if(!(mask&1))q.fillRect(0,0,32,3);if(!(mask&8))q.fillRect(0,0,3,32);q.fillStyle='#262c30';if(!(mask&4))q.fillRect(0,28,32,4);if(!(mask&2))q.fillRect(29,0,3,32);
    q.fillStyle=CITY_GOLD;if(!(mask&1))q.fillRect(0,3,32,1);if(!(mask&4))q.fillRect(0,27,32,1)});
}
// the rim of the mercury basin: dressed stone a third of a cell wide with a gold inlay, on every side that meets the canal
function cityKerb(mask){
  return cityCanvas(`kerb|${mask}`,32,32,q=>{
    const side=(on,x,y,w,h,ix,iy,iw,ih)=>{if(!on)return;q.fillStyle='#8f989c';q.fillRect(x,y,w,h);q.fillStyle='#6b7478';for(let i=0;i<Math.max(w,h);i+=8)w>h?q.fillRect(x+i,y,1,h):q.fillRect(x,y+i,w,1);q.fillStyle=CITY_GOLD;q.fillRect(ix,iy,iw,ih)};
    side(mask&1,0,0,32,9,0,6,32,2);side(mask&4,0,23,32,9,0,24,32,2);side(mask&8,0,0,9,32,6,0,2,32);side(mask&2,23,0,9,32,24,0,2,32);
    q.fillStyle='rgba(0,0,0,.28)';if(mask&1)q.fillRect(0,9,32,3);if(mask&8)q.fillRect(9,0,3,32);if(mask&2)q.fillRect(20,0,3,32);if(mask&4)q.fillRect(0,20,32,3);
    q.fillStyle='#e8c46a';for(const [m,x,y] of [[9,1,1],[3,25,1],[12,1,25],[6,25,25]])if((mask&m)===m)q.fillRect(x,y,6,6); // gilded corner bosses
  });
}
// the side wall of a bridge-house, seen from above where its roof turns see-through: a timber balustrade over the water
function cityBalustrade(axis){
  return cityCanvas(`balus|${axis}`,32,32,q=>{if(axis==='ns'){q.translate(32,0);q.rotate(Math.PI/2)}
    q.fillStyle='rgba(4,10,12,.4)';q.fillRect(0,19,32,5);q.fillStyle='#2e2116';q.fillRect(0,9,32,11);q.fillStyle='#5b432c';q.fillRect(0,10,32,3);q.fillStyle='#4a3624';q.fillRect(0,15,32,3);
    for(const xx of [2,18]){q.fillStyle='#3a2a1c';q.fillRect(xx,7,6,14);q.fillStyle='#6a4e33';q.fillRect(xx+1,8,2,12);q.fillStyle=CITY_GOLD;q.fillRect(xx,6,6,3);q.fillStyle='#fff0b8';q.fillRect(xx+1,6,2,1)}
    q.fillStyle=CITY_GOLD;q.fillRect(0,10,32,1)});
}
// ---------------- the harbour on the water: sampans, mooring piles, nets, floating lanterns (lotus and reeds are the shared plants) ----------------
function cityBoatSprite(axis,tone){
  return cityCanvas(`boat|${axis}|${tone}`,axis==='ew'?64:32,axis==='ew'?32:64,q=>{
    if(axis==='ns'){q.translate(32,0);q.rotate(Math.PI/2)}
    const hull=['#4a3424','#3f3a34','#5a3a28'][tone||0],hullHi=cityShade(hull,26),hullDk=cityShade(hull,-22);
    q.fillStyle='rgba(4,12,16,.38)';q.beginPath();q.ellipse(32,22,29,7,0,0,Math.PI*2);q.fill(); // shadow on the water
    q.fillStyle=hullDk;q.beginPath();q.moveTo(2,15);q.quadraticCurveTo(8,26,18,26);q.lineTo(46,26);q.quadraticCurveTo(56,26,62,15);q.lineTo(56,14);q.lineTo(8,14);q.closePath();q.fill();
    q.fillStyle=hull;q.beginPath();q.moveTo(5,15);q.quadraticCurveTo(10,23,18,23);q.lineTo(46,23);q.quadraticCurveTo(54,23,59,15);q.closePath();q.fill();
    for(let yy=17;yy<23;yy+=3){q.fillStyle='rgba(0,0,0,.22)';q.fillRect(10,yy,44,1)}
    q.fillStyle=CITY_GOLD;q.fillRect(6,14,52,2);q.fillStyle='rgba(255,236,170,.55)';q.fillRect(10,14,40,1); // the gilded gunwale
    q.fillStyle=hullHi;q.fillRect(4,12,4,3);q.fillRect(56,12,4,3);q.fillStyle=CITY_GOLD;q.fillRect(2,11,3,2);q.fillRect(59,11,3,2); // raised prow and stern
    // a woven canopy amidships with a gold ridge
    q.fillStyle='#2b2620';q.fillRect(21,7,22,8);q.fillStyle='#6d5a3e';q.beginPath();q.moveTo(20,14);q.quadraticCurveTo(32,1,44,14);q.closePath();q.fill();
    for(let xx=23;xx<42;xx+=3){q.fillStyle='rgba(0,0,0,.25)';q.fillRect(xx,6,1,8)}q.fillStyle=CITY_GOLD;q.fillRect(26,5,12,2);q.fillStyle='#c84a2e';q.fillRect(31,8,2,3); // a red charm on the canopy
    q.fillStyle='#e8c46a';q.fillRect(12,17,2,2);q.fillRect(50,17,2,2); // gold studs
  });
}
function drawCityDecor(d,px,py,x,y,now){
  const bob=Math.round(Math.sin(now/700+x*.9+y*.4));
  if(d.kind==='lotus'){drawBotanical(X,TT.LOTUS_FLOWER,px,py+bob,x,y,regionIndex());return}
  if(d.kind==='reed'){drawSharedProp(X,TT.REED,px,py,regionIndex(),(x*3+y)&3,now,true);return}
  if(d.kind==='boat'){const head=d.part===0?d:cityIndex().decor.get(d.axis==='ew'?k(x-1,y):k(x,y-1));const s=cityBoatSprite(d.axis,head?.tone||0);
    X.drawImage(s,d.axis==='ew'?d.part*32:0,d.axis==='ns'?d.part*32:0,32,32,px,py+bob,32,32);return}
  if(d.kind==='pile'){
    X.strokeStyle='rgba(200,224,226,.25)';X.lineWidth=1;X.beginPath();X.ellipse(px+16,py+27,7+((now/300+x)%3),2,0,0,Math.PI*2);X.stroke();
    X.fillStyle='#2a1d14';X.fillRect(px+13,py+4,7,24);X.fillStyle='#5b412c';X.fillRect(px+14,py+4,4,24);X.fillStyle='#7a5a3c';X.fillRect(px+14,py+4,1,24);
    X.fillStyle='#3d2b1d';X.fillRect(px+13,py+16,7,2);X.fillRect(px+13,py+19,7,1); // rope
    X.fillStyle=CITY_GOLD;X.fillRect(px+12,py+2,9,3);X.fillStyle='#fff0b8';X.fillRect(px+14,py+2,3,1);return} // gilded cap
  if(d.kind==='net'){const ew=d.axis==='ew';
    X.fillStyle='#2a1d14';if(ew){X.fillRect(px+3,py+3,3,26);X.fillRect(px+26,py+3,3,26)}else{X.fillRect(px+14,py+1,3,8);X.fillRect(px+14,py+23,3,8)}
    X.strokeStyle='rgba(206,196,160,.55)';X.lineWidth=1;X.beginPath();
    if(ew){for(let i=0;i<=5;i++){X.moveTo(px+6+i*4,py+6);X.quadraticCurveTo(px+6+i*4,py+16,px+6+i*4,py+24)}for(let j=0;j<4;j++){X.moveTo(px+6,py+7+j*5);X.quadraticCurveTo(px+16,py+10+j*5,px+26,py+7+j*5)}}
    else{for(let i=0;i<=4;i++){X.moveTo(px+9+i*3,py+9);X.lineTo(px+9+i*3,py+23)}for(let j=0;j<=4;j++){X.moveTo(px+8,py+9+j*3.5);X.lineTo(px+23,py+9+j*3.5)}}
    X.stroke();X.fillStyle=CITY_GOLD;if(ew)for(let i=0;i<4;i++)X.fillRect(px+8+i*6,py+25,3,2);else for(let j=0;j<3;j++)X.fillRect(px+24,py+11+j*5,2,3);return}
  if(d.kind==='lantern'){const a=.28+.12*Math.sin(now/520+x*1.3+y);
    const g=X.createRadialGradient(px+16,py+18,1,px+16,py+18,16);g.addColorStop(0,`rgba(255,206,110,${a})`);g.addColorStop(1,'rgba(255,206,110,0)');X.fillStyle=g;X.fillRect(px,py+2,32,30);
    X.fillStyle=`rgba(255,214,120,${a*.8})`;X.fillRect(px+14,py+24+bob,4,1);X.fillRect(px+12,py+27,8,1); // its light on the water
    X.fillStyle='#3a5a3a';X.beginPath();X.ellipse(px+16,py+21+bob,8,3,0,0,Math.PI*2);X.fill(); // a lotus leaf it floats on
    X.fillStyle='#8a2a1e';X.fillRect(px+12,py+11+bob,8,9);X.fillStyle='#ffcf6e';X.fillRect(px+13,py+12+bob,6,7);X.fillStyle='#fff2c0';X.fillRect(px+15,py+13+bob,2,4);
    X.fillStyle=CITY_GOLD;X.fillRect(px+11,py+10+bob,10,2);X.fillRect(px+11,py+19+bob,10,2);X.fillRect(px+15,py+8+bob,2,2);return}
}

// ---------------- the ground pass: the renderer calls this for every cell on floor 23 ----------------
const CITY_GROUND=Object.freeze({q:'quay',a:'alley',p:'plaza',k:'market',t:'terrace',c:'core',u:'ruin'});
function drawCityTile(base,t,px,py,x,y,time,props){
  const zone=cityZone(x,y),now=FX.frameNow||performance.now(),tile=state.map[y][x];
  if(zone==='X'){X.fillStyle='#0b1013';X.fillRect(px,py,32,32);return true}
  if(zone==='r'||zone==='W'){X.drawImage(cityParapet(x,y,zone==='W',cityPaletteAt(x,y)),px,py);drawCityRelief(px,py,x,y);return true}
  if(zone==='H'){
    const b=cityBuilding(x,y);
    if(b?.kind==='bridgehouse'){X.drawImage(cityWaterBase(x,y,false),px,py);drawCityWaterSurface(px,py,x,y,now,false);X.drawImage(cityBalustrade(b.axis),px,py);return true}
    if(b?.closed){drawMainWall(px,py,x,y,b.kind==='palace'?CITY_PALACE_WALL:CITY_WALL);if(tile===TT.DOOR||tile===TT.OPEN_DOOR)drawSpecialTerrain(tile,px,py,x,y,time);return true}
    // a solid building's base, seen only where its body turns see-through, or a ruin's broken stub
    if(b?.kind==='stub'){X.drawImage(cityPaveSprite('ruin',x,y,cityPaletteAt(x,y)),px,py);X.drawImage(cityRubble(x,y),px,py);drawSharedProp(X,TT.ROCK,px,py,regionIndex(),(x+y)&3,now,true);return true}
    X.drawImage(cityPlinth(x,y,b),px,py);return true;
  }
  if(zone==='w'||zone==='m'||zone==='b'||zone==='d'||zone==='s'){
    const mercury=zone==='m'||zone==='s'||tile===TT.MERCURY,wet=tile===TT.WATER||tile===TT.MERCURY||zone!=='w';
    if(wet){X.drawImage(cityWaterBase(x,y,mercury),px,py);drawCityWaterSurface(px,py,x,y,now,mercury)}else X.drawImage(cityCanalBed(x,y),px,py);
    drawCityRelief(px,py,x,y);
    if(zone==='w'&&tile===TT.WATER){const d=cityIndex().decor.get(k(x,y));if(d)drawCityDecor(d,px,py,x,y,now)}
    if(zone==='m'){const c=cityPlan().core,d=Math.hypot(x+.5-(c.x+c.w/2),(y+.5-(c.y+c.h/2))*1.25),glow=Math.max(0,1-d/21);if(glow>0){X.fillStyle=`rgba(240,192,90,${(glow*.5).toFixed(3)})`;X.fillRect(px,py,32,32)}const edge=(dx,dy)=>!'mcs'.includes(cityZone(x+dx,y+dy)),mask=(edge(0,-1)?1:0)|(edge(1,0)?2:0)|(edge(0,1)?4:0)|(edge(-1,0)?8:0);if(mask)X.drawImage(cityKerb(mask),px,py)}
    if(zone==='b'||zone==='d'){const br=cityBridge(x,y);if(br)drawCitySpan(px,py,x,y,br,tile===TT.DRAWBRIDGE_DOWN)}
    if(zone==='s'){const span={id:'causeway',kind:'causeway',axis:'ns',cells:cityPlan().causeway};drawCitySpan(px,py,x,y,span,true);
      if(tile===TT.WALL){X.fillStyle='#22262a';X.fillRect(px,py+4,32,24);for(let i=0;i<5;i++){X.fillStyle='#6c6e70';X.fillRect(px+3+i*6,py+4,2,24)}X.fillStyle='#8a8c8e';X.fillRect(px,py+8,32,2);X.fillRect(px,py+20,32,2)}}
    return true;
  }
  if(zone==='i'){const b=cityBuilding(x,y);if(b?.kind==='palace')drawInnFloor(X,px,py,x,y,{floor:'#6a5222',floorAlt:'#5e481c'},{accent:'#f0cf7a'},'slabs');else X.drawImage(tile===TT.MOON_STONE?cityPaveSprite('terrace',x,y):cityPlanks(x,y,tile===TT.GILDED_FLOOR),px,py)}
  else if(zone==='g')X.drawImage(cityGrass(x,y),px,py);
  else{X.drawImage(cityPaveSprite(CITY_GROUND[zone]||'quay',x,y,zone==='c'?'grey':cityPaletteAt(x,y)),px,py);if(zone==='u')X.drawImage(cityRubble(x,y),px,py)}
  drawCityRelief(px,py,x,y);
  if(base===TT.CARPET)drawInnRunner(X,px,py,x,y);
  if(![TT.FLOOR,TT.CARPET,TT.STONE_PATH,TT.MOON_STONE,TT.WOOD_FLOOR,TT.GILDED_FLOOR,TT.GRASS].includes(base)){if(!drawSpecialTerrain(base,px,py,x,y,time))drawInteractiveTerrain(base,px,py,x,y,time)}
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
// An item lying where a building's roof and front face are drawn over the ground (its footprint and the cells its height
// reaches up over) is behind that building: drawn after the bodies it would sit on the wall, so it is left out while the
// body there is shown, and appears again once the body turns see-through (the player beside it, or inside a closed building).
function cityHidesItem(x,y){
  if(!cityOn())return false;
  for(const bd of cityPlan().buildings){if(!(bd.rise>0)||x<bd.x||x>=bd.x+bd.w||y<bd.y-bd.rise||y>=bd.y+bd.h)continue;
    const p=state.player;if(bd.closed&&p.x>=bd.x&&p.x<bd.x+bd.w&&p.y>=bd.y&&p.y<bd.y+bd.h)continue;
    if((CITY_FADE.get(bd.id)??1)*cityNear(x,y)>.5)return true}
  return false;
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
