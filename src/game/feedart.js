/* 흑성채 큰 솥 art: the great cooking range of the citadel's mess halls (see citadelPlaceFeedStations in branches.js).
   The station's cells keep their pot, brazier and jar tiles for blocking and lighting; the range is drawn over them as one
   piece, five cells wide and two deep: a masonry hearth with three arched fireboxes, three iron cauldrons of porridge
   with steam, a stack of split logs at each end, and ladles hanging from a rail along the back. */
function drawFeedRange(b,now){
 const stations=state?.branchContext105?.id==='citadel'?state.branchTerrain105?.citadel105?.feedStations105:null;if(!stations?.length)return;
 for(const st of stations){
  const x0=(st.x-2)*TILE,y0=(st.y-1)*TILE,w=5*TILE,h=2*TILE;
  if(st.x+3<b.x0||st.x-3>b.x1||st.y+2<b.y0||st.y-3>b.y1)continue;
  const keys=[-2,-1,0,1,2].flatMap(dx=>[k(st.x+dx,st.y),k(st.x+dx,st.y-1)]);
  const seen=keys.some(q=>state.seen.has(q));if(!seen)continue;
  const vis=keys.some(q=>state.visible.has(q)),empty=st.left<=0,t=now/1000;
  X.save();X.globalAlpha=vis?1:.5;
  const R=(c,x,y,ww,hh)=>{X.fillStyle=c;X.fillRect(x0+x,y0+y,ww,hh)};
  // the hearth: masonry in courses, a darker plinth and a lit top edge
  R('#2a2420',0,6,w,h-6);
  for(let row=0;row<5;row++){const yy=14+row*10,off=(row%2)*14;for(let cx=-14+off;cx<w;cx+=28){const xx=Math.max(0,cx),ww=Math.min(w,cx+27)-xx;if(ww<=0)continue;const tone=hash2(cx+row*7,row,9501);R(tone>.6?'#5b5047':tone>.25?'#4f463e':'#463e37',xx+1,yy+1,ww-1,9);R('rgba(255,236,200,.08)',xx+1,yy+1,ww-1,1)}}
  R('#6a5d51',0,6,w,3);R('#8a7a69',0,6,w,1);R('#201a17',0,h-5,w,5);
  // three arched fireboxes along the front
  for(let i=0;i<3;i++){
   const cx=x0+TILE*(1.5+i)+0,bx=cx-13,by=y0+h-30;
   X.fillStyle='#120d0a';X.beginPath();X.moveTo(bx,by+26);X.lineTo(bx,by+10);X.quadraticCurveTo(bx,by,cx,by);X.quadraticCurveTo(bx+26,by,bx+26,by+10);X.lineTo(bx+26,by+26);X.closePath();X.fill();
   X.strokeStyle='#756556';X.lineWidth=2;X.stroke();
   if(!empty){
    const fl=.75+.25*Math.sin(t*7+i*2.1),g=X.createRadialGradient(cx,by+24,2,cx,by+22,16);g.addColorStop(0,`rgba(255,226,140,${.95*fl})`);g.addColorStop(.45,`rgba(240,120,40,${.7*fl})`);g.addColorStop(1,'rgba(120,30,10,0)');
    X.fillStyle=g;X.fillRect(bx+1,by+2,24,24);
    X.fillStyle='#4a3524';X.fillRect(bx+3,by+22,20,3);X.fillStyle='#6b4a30';X.fillRect(bx+5,by+20,16,3);
    for(let f=0;f<3;f++){const fx=cx-6+f*6,fh=7+4*Math.sin(t*9+i+f*1.7);X.fillStyle=f===1?'#ffe9a0':'#ff9a3a';X.beginPath();X.moveTo(fx-3,by+24);X.quadraticCurveTo(fx-1,by+24-fh,fx,by+24-fh-3);X.quadraticCurveTo(fx+1,by+24-fh,fx+3,by+24);X.closePath();X.fill()}
   }else{X.fillStyle='#2b2724';X.fillRect(bx+3,by+22,20,3)}
  }
  // iron cauldrons on the top plate
  for(let i=0;i<3;i++){
   const cx=x0+TILE*(1.5+i),cy=y0+4,rx=19,ry=6;
   X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(cx+2,cy+18,rx+2,6,0,0,Math.PI*2);X.fill();
   const body=X.createLinearGradient(cx-rx,0,cx+rx,0);body.addColorStop(0,'#17191b');body.addColorStop(.35,'#3f4448');body.addColorStop(.6,'#2a2e31');body.addColorStop(1,'#101214');
   X.fillStyle=body;X.beginPath();X.moveTo(cx-rx,cy);X.quadraticCurveTo(cx-rx-3,cy+20,cx-rx+6,cy+22);X.lineTo(cx+rx-6,cy+22);X.quadraticCurveTo(cx+rx+3,cy+20,cx+rx,cy);X.closePath();X.fill();
   X.fillStyle='#6a7075';X.fillRect(cx-rx+2,cy+8,rx*2-4,1.5);X.fillStyle='rgba(255,255,255,.1)';X.fillRect(cx-rx+5,cy+3,2,14);
   X.fillStyle='#53585c';X.beginPath();X.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);X.fill();
   X.fillStyle=empty?'#1a1816':'#a3763f';X.beginPath();X.ellipse(cx,cy+1,rx-3,ry-2,0,0,Math.PI*2);X.fill();
   if(!empty){
    X.fillStyle='#c79a58';for(let j=0;j<7;j++){const a=hash2(i*9+j,3,9502)*6.28,rr=hash2(i,j,9503)*(rx-8);X.fillRect(cx+Math.cos(a)*rr,cy+1+Math.sin(a)*rr*.3,2,1)}
    X.fillStyle='rgba(255,232,170,.35)';X.beginPath();X.ellipse(cx-5,cy-.5,6,1.6,0,0,Math.PI*2);X.fill();
    // steam, three curls rising and thinning
    for(let j=0;j<3;j++){const ph=(t*.5+i*.37+j*.33)%1,sx=cx-7+j*7+Math.sin(t*1.6+j+i)*2.5,sy=cy-6-ph*20;X.fillStyle=`rgba(236,232,222,${.34*(1-ph)})`;X.beginPath();X.ellipse(sx,sy,3+ph*4,2+ph*3,0,0,Math.PI*2);X.fill()}
   }
   X.strokeStyle='#8b9196';X.lineWidth=1.4;X.beginPath();X.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);X.stroke();
   X.fillStyle='#8b9196';X.fillRect(cx-rx-3,cy-1,4,3);X.fillRect(cx+rx-1,cy-1,4,3);
  }
  // split logs stacked at both ends of the plate
  for(const side of[0,1]){
   const lx=side?w-26:2;for(let r=0;r<3;r++)for(let c=0;c<3-(r>1?1:0);c++){const xx=lx+c*8+(r%2)*4,yy=h-18-r*7;R(hash2(c,r+side,9504)>.5?'#7a5632':'#8b6740',xx,yy,8,7);R('#d9b98a',xx+6,yy+1,2,5);R('rgba(0,0,0,.3)',xx,yy+6,8,1)}
  }
  // a rail along the top with ladles and a skimmer
  X.fillStyle='#3a342f';X.fillRect(x0+6,y0-12,w-12,2);
  for(const [lx,len] of [[.12,16],[.3,20],[.5,18],[.72,22],[.88,15]]){const hx=x0+w*lx;X.fillStyle='#5d6266';X.fillRect(hx,y0-10,1.5,len);X.fillStyle='#868c91';X.beginPath();X.ellipse(hx+.7,y0-10+len+2,4,3,0,0,Math.PI*2);X.fill();X.fillStyle='#2d3033';X.beginPath();X.ellipse(hx+.7,y0-10+len+1.5,3,1.6,0,0,Math.PI*2);X.fill()}
  X.restore();
 }
}
