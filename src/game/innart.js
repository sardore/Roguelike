/* 청풍루 art: the inn's five floors in the main dungeon (render.js innFloorArt decides when it applies).
   - floors: each floor has one material for its rooms and one for the passages between them. Colours come from the
     floor's entry in ART60, so the same drawing reads as that floor's own wood, stone, lacquer or mat.
   - contact shadows where the floor meets a wall: deep under a wall to the north, a sliver beside one to the west or east.
     This is what lifts the walls off the floor.
   - the inn's timber on the wall faces: a row of roof tiles along the top with the eave's shadow under it, lacquered
     posts and lintels, and paper lattice windows lit from behind.
   Floors are painted into the cached substrate pages (drawRegionFloor); wall fittings are drawn with the wall (drawDojoWall). */
const INN_MATERIALS=Object.freeze({1:['planks','flags'],2:['lacquer','runner'],3:['mats','boards'],4:['tiles','earth'],5:['slabs','lacquer']});
// Timber and roof tile per floor: post, roof, paper (lit window) and how many wall cells carry a window.
const INN_TIMBER=Object.freeze({
 1:{post:'#6b4426',roof:'#3b4046',paper:'255,214,150',windows:.45},
 2:{post:'#7c2619',roof:'#2f2a2b',paper:'255,200,120',windows:.55},
 3:{post:'#5b2f3b',roof:'#36303b',paper:'255,214,196',windows:.5},
 4:{post:'#3f3629',roof:'#30312d',paper:'236,214,160',windows:.22},
 5:{post:'#8d2617',roof:'#3a2a25',paper:'255,190,110',windows:.4}
});
const INN_ROOMS=new WeakMap();
function innRoomCell(x,y){
 let grid=INN_ROOMS.get(state.map);
 if(!grid){grid=new Uint8Array(COLS*ROWS);for(const r of state.rooms||[])for(let yy=r.y;yy<r.y+r.h;yy++)for(let xx=r.x;xx<r.x+r.w;xx++)if(xx>=0&&yy>=0&&xx<COLS&&yy<ROWS)grid[yy*COLS+xx]=1;INN_ROOMS.set(state.map,grid)}
 return grid[y*COLS+x]===1;
}
function innWallAt(x,y){return state.map[y]?.[x]===TT.WALL}
function drawInnFloor(q,px,py,x,y,colors,art){
 const kind=INN_MATERIALS[state.floor]?.[innRoomCell(x,y)?0:1]||'planks',base=colors.floor,alt=colors.floorAlt;
 const R=(c,xx,yy,w,hh)=>{q.fillStyle=c;q.fillRect(px+xx,py+yy,w,hh)},H=(i,s)=>hash2(x*7+i,y*13+i*3,s);
 const lo=colorShift(base,-12),lo2=colorShift(base,-24),hi=colorShift(base,12),hi2=colorShift(base,24),acc=art.accent;
 const accA=a=>{const n=parseInt(acc.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`};
 if(kind==='planks'){
  // honey boards running east-west, four to a cell, with staggered butt joints every few cells
  for(let j=0;j<4;j++){const yy=j*8,tone=[base,alt,colorShift(base,5),colorShift(alt,-4)][Math.floor(hash2(x>>2,y*4+j,4411)*4)];R(tone,0,yy,32,8);R(lo2,0,yy,32,1);R('rgba(255,236,200,.05)',0,yy+1,32,1);
   const joint=Math.floor(hash2(Math.floor((x+j)/3),y*4+j,4412)*3);if((x+j)%3===joint){const bx=4+Math.floor(H(j,4413)*24);R(lo2,bx,yy+1,1,7);R('rgba(255,236,200,.06)',bx+1,yy+1,1,7)}
   if(H(j,4414)>.55){const gx=2+Math.floor(H(j,4415)*18);R('rgba(40,24,14,.16)',gx,yy+4,6+Math.floor(H(j,4416)*8),1)}}
 }else if(kind==='flags'){
  // a lane of worn flagstones in running bond, mortar lines and a little moss in the joints
  R(lo,0,0,32,32);
  for(let j=0;j<2;j++){const row=y*2+j,off=(row%2)*8;for(let i=-1;i<3;i++){const sx=i*16+off,tone=[base,alt,hi,colorShift(alt,6)][Math.floor(hash2((x*2+i+(row%2))|0,row,4421)*4)];const x0=Math.max(0,sx+1),x1=Math.min(32,sx+16);if(x1<=x0)continue;R(tone,x0,j*16+1,x1-x0,15);R('rgba(255,240,215,.06)',x0,j*16+1,x1-x0,1);R('rgba(0,0,0,.12)',x0,j*16+15,x1-x0,1)}}
  if(H(0,4422)>.72)R('rgba(96,122,72,.32)',3+Math.floor(H(1,4423)*24),15+Math.floor(H(2,4424)*2)*0,3,1);
  if(H(3,4425)>.85){const cx=6+Math.floor(H(4,4426)*18),cy=4+Math.floor(H(5,4427)*20);R('rgba(20,14,10,.25)',cx,cy,1,4);R('rgba(20,14,10,.25)',cx+1,cy+3,3,1)}
 }else if(kind==='lacquer'){
  // dark lacquered boards running north-south with a soft sheen; a gold inlay line follows the walls of the room
  for(let i=0;i<4;i++){const xx=i*8,tone=hash2(x*4+i,y>>1,4431)>.5?base:alt;R(tone,xx,0,8,32);R(lo2,xx,0,1,32);R('rgba(255,226,180,.05)',xx+1,0,2,32);
   if(hash2(x*4+i,Math.floor(y/3),4432)>.8){const jy=Math.floor(hash2(x*4+i,y,4433)*28)+2;R(lo2,xx+1,jy,7,1)}}
  const sheen=((x+y)%7)/7;R(`rgba(255,232,190,${(.02+.03*Math.sin(sheen*Math.PI)).toFixed(3)})`,0,0,32,32);
  if(innRoomCell(x,y)){if(innWallAt(x,y-1)){R(accA(.55),2,3,28,1);R(accA(.25),2,5,28,1)}if(innWallAt(x-1,y)){R(accA(.55),3,2,1,28);R(accA(.25),5,2,1,28)}if(innWallAt(x+1,y)){R(accA(.55),28,2,1,28);R(accA(.25),26,2,1,28)}if(innWallAt(x,y+1)){R(accA(.55),2,28,28,1);R(accA(.25),2,26,28,1)}}
 }else if(kind==='runner'){
  // passages carry a crimson runner with a gold border, laid along the passage
  for(let i=0;i<4;i++)R(i%2?alt:base,i*8,0,8,32);
  const open=(dx,dy)=>{const t=state.map[y+dy]?.[x+dx];return t!=null&&t!==TT.WALL},horiz=(open(-1,0)||open(1,0))&&!(open(0,-1)&&open(0,1)&&!open(-1,0));
  q.save();q.translate(px+16,py+16);if(!horiz)q.rotate(Math.PI/2);q.translate(-16,-16);
  const C=(c,xx,yy,w,hh)=>{q.fillStyle=c;q.fillRect(xx,yy,w,hh)};
  C('#5c1c16',0,5,32,22);C('#7a2519',0,7,32,18);C(accA(.7),0,8,32,1);C(accA(.7),0,23,32,1);C(accA(.35),0,10,32,1);C(accA(.35),0,21,32,1);
  C(accA(.55),15,14,2,4);C(accA(.55),13,15,6,2);C('rgba(0,0,0,.25)',0,27,32,1);q.restore();
 }else if(kind==='mats'){
  // guest-room mats: two cells long, laid in a pinwheel; woven lines and a dark cloth border on the edges of each mat
  const vertical=((x>>1)+(y>>1))%2===1;R(colorShift(base,14),0,0,32,32);
  for(let j=2;j<32;j+=3)vertical?R('rgba(30,14,20,.06)',j,0,1,32):R('rgba(30,14,20,.06)',0,j,32,1);
  const band=colorShift(base,-6),bandHi=accA(.18);
  if(vertical){R(band,0,0,2,32);R(band,30,0,2,32);R(bandHi,1,0,1,32);R(bandHi,30,0,1,32);R('rgba(20,8,12,.18)',0,y%2===0?0:31,32,1)}
  else{R(band,0,0,32,2);R(band,0,30,32,2);R(bandHi,0,1,32,1);R(bandHi,0,30,32,1);R('rgba(20,8,12,.18)',x%2===0?0:31,0,1,32)}
  R('rgba(255,236,214,.035)',0,0,32,16);
 }else if(kind==='boards'){
  // narrow polished corridor boards running across the passage
  for(let i=0;i<4;i++){const xx=i*8,tone=hash2(x*4+i,y>>2,4441)>.5?colorShift(base,8):base;R(tone,xx,0,8,32);R('rgba(20,8,12,.22)',xx,0,1,32);R('rgba(255,232,206,.04)',xx+1,0,1,32)}
  if(H(0,4442)>.7)R('rgba(20,8,12,.22)',1+Math.floor(H(1,4443)*28),Math.floor(H(2,4444)*30),5,1);
 }else if(kind==='tiles'){
  // kitchen floor: square fired tiles, grout, the odd crack and soot near the hearths
  R(lo2,0,0,32,32);
  for(let j=0;j<2;j++)for(let i=0;i<2;i++){const t=hash2(x*2+i,y*2+j,4451),tone=t>.66?colorShift(base,10):t>.33?alt:base;R(tone,i*16+1,j*16+1,15,15);R('rgba(176,96,62,.13)',i*16+1,j*16+1,15,15);R('rgba(255,236,206,.07)',i*16+1,j*16+1,15,1);
   if(hash2(x*2+i,y*2+j,4452)>.9){const cx=i*16+4+Math.floor(hash2(x,y+j,4453)*6);R('rgba(10,8,6,.35)',cx,j*16+4,1,5);R('rgba(10,8,6,.35)',cx+1,j*16+8,4,1)}}
  if(H(0,4454)>.82){const sx=4+Math.floor(H(1,4455)*16),sy=4+Math.floor(H(2,4456)*16);R('rgba(12,10,8,.18)',sx,sy,10,7);R('rgba(12,10,8,.14)',sx+2,sy-2,6,11)}
 }else if(kind==='earth'){
  // service passages: packed earth with pebbles and scattered straw
  R(base,0,0,32,32);R(alt,0,0,32,16);
  for(let i=0;i<6;i++){const xx=1+Math.floor(H(i,4461)*29),yy=1+Math.floor(H(i,4462)*29),s=1+Math.floor(H(i,4463)*2);R(H(i,4464)>.5?hi2:lo2,xx,yy,s,s)}
  for(let i=0;i<3;i++){const xx=2+Math.floor(H(i+9,4465)*24),yy=2+Math.floor(H(i+9,4466)*26);R('rgba(214,188,118,.18)',xx,yy,4,1)}
 }else if(kind==='slabs'){
  // the great hall: polished slabs two cells square with gold-filled joints and a soft reflection across each slab
  R(base,0,0,32,32);const sx=x%2,sy=y%2;R(sx^sy?alt:base,0,0,32,32);
  const g=q.createLinearGradient(px-sx*32,py-sy*32,px+64-sx*32,py+64-sy*32);g.addColorStop(0,'rgba(255,226,180,.07)');g.addColorStop(.5,'rgba(255,226,180,0)');g.addColorStop(1,'rgba(0,0,0,.08)');q.fillStyle=g;q.fillRect(px,py,32,32);
  if(sx===0){R(lo2,0,0,1,32);R(accA(.4),1,0,1,32)}if(sy===0){R(lo2,0,0,32,1);R(accA(.4),0,1,32,1)}
  if(sx===0&&sy===0){R(accA(.6),0,0,3,3)}
 }
 // contact shadows: the wall north of a cell shades it deeply, walls beside it a little
 if(innWallAt(x,y-1)){const g=q.createLinearGradient(0,py,0,py+13);g.addColorStop(0,'rgba(8,4,2,.48)');g.addColorStop(1,'rgba(8,4,2,0)');q.fillStyle=g;q.fillRect(px,py,32,13)}
 if(innWallAt(x-1,y)){const g=q.createLinearGradient(px,0,px+6,0);g.addColorStop(0,'rgba(8,4,2,.32)');g.addColorStop(1,'rgba(8,4,2,0)');q.fillStyle=g;q.fillRect(px,py,6,32)}
 if(innWallAt(x+1,y)){const g=q.createLinearGradient(px+32,0,px+27,0);g.addColorStop(0,'rgba(8,4,2,.24)');g.addColorStop(1,'rgba(8,4,2,0)');q.fillStyle=g;q.fillRect(px+27,py,5,32)}
 if(innWallAt(x-1,y-1)&&!innWallAt(x-1,y)&&!innWallAt(x,y-1)){q.fillStyle='rgba(8,4,2,.25)';q.fillRect(px,py,4,4)}
}
// The inn's timber on a wall's front face, laid over the shared wall drawing: roof tiles and the eave's shadow, a lintel,
// lacquered posts at the ends of a run and every third cell, and now and then a paper lattice window lit from behind.
function drawInnWallFace(q,r,x,y,west,east){
 const T=INN_TIMBER[state.floor];if(!T)return;
 const post=T.post,postHi=colorShift(post,34),postDk=colorShift(post,-28),roof=T.roof,roofHi=colorShift(roof,34),roofDk=colorShift(roof,-16);
 // roof tiles: channel rows with rounded ends hanging over the top of the face
 r(roofDk,0,0,32,7);r(roof,0,0,32,5);for(let i=0;i<8;i++){r(i%2?roofHi:roof,i*4,0,2,5);r('rgba(0,0,0,.25)',i*4+3,0,1,5)}
 for(let i=0;i<8;i++){q.fillStyle=i%2?roofHi:colorShift(roof,18);q.beginPath();q.arc(i*4+2,5.5,2,0,Math.PI);q.fill()}
 r('rgba(255,255,255,.10)',0,0,32,1);
 const eave=q.createLinearGradient(0,7,0,12);eave.addColorStop(0,'rgba(0,0,0,.45)');eave.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=eave;q.fillRect(0,7,32,5);
 // lintel and sill
 r(postDk,0,9,32,3);r(post,0,9,32,2);r(postHi,0,9,32,1);r(postDk,0,25,32,2);r(post,0,25,32,1);
 // a lit paper window between posts
 const pane=x%3!==0&&west&&east&&hash2(x,y,6011)<T.windows;
 if(pane){
  r(postDk,7,12,18,12);const glow=q.createRadialGradient(16,18,1,16,18,11);glow.addColorStop(0,`rgba(${T.paper},.85)`);glow.addColorStop(1,`rgba(${T.paper},.45)`);q.fillStyle=glow;q.fillRect(8,13,16,10);
  for(let i=12;i<24;i+=4)r(post,i,13,1,10);for(let j=16;j<23;j+=3)r(post,8,j,16,1);r(postHi,8,13,16,1);
 }
 // posts: the ends of a run and every third cell
 const postAt=xx=>{r(postDk,xx,7,4,21);r(post,xx,7,3,21);r(postHi,xx,7,1,21);r(postDk,xx-1,26,6,2)};
 if(x%3===0||!west)postAt(0);if(!east)postAt(28);
}
