/* ===== 가시숲 art =====
   The forest is drawn the way 산채 2층 draws its pines: tile canvases hold only the ground, and every tree, bush and
   standing piece is a sprite stood on its own base point and sorted by that point, in one foreground pass (drawThornForest).
   Five zones change ground, trees and clutter: 0 thorn (violet-black), 1 rot (olive mud, dead grey trees), 2 fungus (teal
   glow, giant caps), 3 web (ash and silk), 4 blood (crimson clay and red thorns). Textures run on across tiles through
   world-space noise; decals are drawn shapes (leaves, roots, stones, boards with grain), not rectangles. */
const THORN_CANVAS=new Map(),THORN_SPRITES=new Map(),THORN_PROPS=new Map();let THORN_RENDER_MAP=null;
const THORN_COL=Object.freeze({
 ink:'#0d0912',leaf:['#17301f','#1f3d2b','#2d5a3b','#3f7a4a'],violet:['#2d1c42','#3d2a57','#5b3a82','#7d57ad'],spike:'#cbb9e0',spikeDim:'#8f7fa8',
 moss:['#2e5a38','#3f7a4a','#244a2e'],plankGap:'#171310',nail:'#8c7f6e',red:['#2a0510','#5a0a1f','#8a0f2e','#b3123a'],redHot:'#ff4d6d',redTip:'#ff9aae'
});
// zone palettes: ground ramp (dark to light), forest-floor ramp, litter colours, accent, shore/mud colour
const THORN_ZONES=Object.freeze([
 {name:'thorn',ground:[[.30,'#1a1423'],[.48,'#211a2b'],[.64,'#282033'],[.80,'#30263c'],[1,'#3a2e47']],deep:[[.4,'#0b0711'],[.7,'#110b19'],[1,'#170f22']],litter:['#4a2f6b','#2d5a3b','#3a2848','#6a4a8a'],accent:'#7d57ad',moss:'#2d5a3b',mud:'#1a1320'},
 {name:'rot',ground:[[.30,'#171a12'],[.48,'#1e2217'],[.64,'#262b1c'],[.80,'#2f3522'],[1,'#3a422a']],deep:[[.4,'#090b07'],[.7,'#0f120b'],[1,'#151a0e']],litter:['#4a4a22','#5c5a2a','#2e3a1c','#6e6a38'],accent:'#8aa860',moss:'#4a5e2a',mud:'#14170d'},
 {name:'fungus',ground:[[.30,'#10161c'],[.48,'#151d24'],[.64,'#1b252d'],[.80,'#222f38'],[1,'#2b3b46']],deep:[[.4,'#06090d'],[.7,'#0a1015'],[1,'#0e161d']],litter:['#2a5a6a','#3a3a6a','#1f3a44','#4a8a9a'],accent:'#7fd6ff',moss:'#2a5a5a',mud:'#0e151a'},
 {name:'web',ground:[[.30,'#1d1c22'],[.48,'#25242c'],[.64,'#2d2c36'],[.80,'#363440'],[1,'#42404e']],deep:[[.4,'#0c0b10'],[.7,'#121118'],[1,'#18171f']],litter:['#6a6878','#4a4858','#85839a','#3a384a'],accent:'#d8d4ea',moss:'#4a5a54',mud:'#15141a'},
 {name:'blood',ground:[[.30,'#1f1015'],[.48,'#27141a'],[.64,'#301820'],[.80,'#3a1e28'],[1,'#472634']],deep:[[.4,'#0d0508'],[.7,'#14070c'],[1,'#1c0a10']],litter:['#6a1a2a','#8a1a30','#3a1018','#a02840'],accent:'#ff6d86',moss:'#3a2a30',mud:'#1a0b10'}
]);
function thornZoneOf(x,y){const T=state.branchTerrain105?.thorn105;return T?thornZoneAt(x,y,T):0}
function thornLeaf(q,x,y,len,ang,col){q.fillStyle=col;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+Math.cos(ang-.5)*len*.6,y+Math.sin(ang-.5)*len*.6,x+Math.cos(ang)*len,y+Math.sin(ang)*len);q.quadraticCurveTo(x+Math.cos(ang+.5)*len*.6,y+Math.sin(ang+.5)*len*.6,x,y);q.fill()}
function thornRootStroke(q,x0,y0,x1,y1,w,dark,light){const mx=(x0+x1)/2+(y1-y0)*.25,my=(y0+y1)/2-(x1-x0)*.25;q.strokeStyle=dark;q.lineWidth=w;q.lineCap='round';q.beginPath();q.moveTo(x0,y0);q.quadraticCurveTo(mx,my,x1,y1);q.stroke();q.strokeStyle=light;q.lineWidth=Math.max(.5,w*.35);q.beginPath();q.moveTo(x0,y0-w*.25);q.quadraticCurveTo(mx,my-w*.25,x1,y1-w*.25);q.stroke()}
function thornStone(q,x,y,rx,ry,base,hi){thornBlob(q,x+.6,y+.8,rx,ry,'rgba(0,0,0,.45)');thornBlob(q,x,y,rx,ry,base);q.fillStyle=hi;q.beginPath();q.ellipse(x-rx*.25,y-ry*.35,rx*.55,ry*.4,-.3,0,Math.PI*2);q.fill()}
function thornFern(q,x,y,len,ang,col,hi){q.strokeStyle=col;q.lineWidth=1;q.lineCap='round';q.beginPath();q.moveTo(x,y);const ex=x+Math.cos(ang)*len,ey=y+Math.sin(ang)*len;q.quadraticCurveTo(x+Math.cos(ang)*len*.5,y+Math.sin(ang)*len*.5-len*.18,ex,ey);q.stroke();for(let i=1;i<=6;i++){const t=i/7,px=x+(ex-x)*t,py=y+(ey-y)*t-Math.sin(t*3.14)*len*.1,l=len*.32*(1-t*.6);for(const sd of[-1,1]){q.strokeStyle=i%2?col:hi;q.beginPath();q.moveTo(px,py);q.lineTo(px+Math.cos(ang+sd*1.1)*l,py+Math.sin(ang+sd*1.1)*l);q.stroke()}}}
// ---- ground
function thornFringe(q,x,y,nb,zone){
 // where the trail meets the forest: one continuous outline so the wall reads as a wall. A dark band whose width wanders with world-space
 // noise (so it runs on across tiles), a thin lit rim on its inner edge, short thorn teeth that bite into the trail, and a soft shadow.
 const Z=THORN_ZONES[zone||0],sides=[[0,1,0],[1,-1,0],[2,0,1],[3,0,-1]],rim=Z.accent;
 const band=(dx,dy,t,wx,wy)=>2.6+thornNoise(wx,wy,6,19)*2.6+(hash2(wx,wy,23)>.82?1:0);
 for(const[i,dx,dy]of sides){if(nb[i]!=='w')continue;
  const g=dx?q.createLinearGradient(dx>0?31:0,0,dx>0?17:14,0):q.createLinearGradient(0,dy>0?31:0,0,dy>0?17:14);g.addColorStop(0,'rgba(2,1,5,.5)');g.addColorStop(1,'rgba(2,1,5,0)');q.fillStyle=g;q.fillRect(0,0,32,32);
  for(let t=0;t<32;t++){const wx=dx?x*32+(dx>0?31:0):x*32+t,wy=dy?y*32+(dy>0?31:0):y*32+t,w=band(dx,dy,t,wx,wy),h=Math.floor(w);
   const px=dx>0?32-h:dx<0?0:t,py=dy>0?32-h:dy<0?0:t,sw=dx?h:1,sh=dy?h:1;
   q.fillStyle='#07040b';q.fillRect(px,py,sw,sh);
   // the lit rim
   q.fillStyle=rim+'55';if(dx)q.fillRect(dx>0?32-h-1:h,t,1,1);else q.fillRect(t,dy>0?32-h-1:h,1,1);
   // a thorn tooth now and then, always pointing out of the forest
   if(hash2(Math.floor(wx/3),Math.floor(wy/3),29)>.8&&t%3===1){const len=3+hash2(wx,wy,31)*3;q.fillStyle='#07040b';q.beginPath();if(dx){const bx=dx>0?32-h:h;q.moveTo(bx,t-1);q.lineTo(bx-dx*len,t+.5);q.lineTo(bx,t+2)}else{const by=dy>0?32-h:h;q.moveTo(t-1,by);q.lineTo(t+.5,by-dy*len);q.lineTo(t+2,by)}q.closePath();q.fill()}
  }
 }
 // convex corners: where the forest only touches diagonally, close the outline with a small rounded cap
 for(const[i,dx,dy,cx,cy]of[[4,1,1,32,32],[5,1,-1,32,0],[6,-1,1,0,32],[7,-1,-1,0,0]]){if(nb[i]!=='w'||nb[dx>0?0:1]==='w'||nb[dy>0?2:3]==='w')continue;q.fillStyle='#07040b';q.beginPath();q.arc(cx,cy,4.4,0,6.28);q.fill();q.strokeStyle=rim+'66';q.lineWidth=1;q.beginPath();q.arc(cx,cy,5.2,dx>0?(dy>0?3.14:3.14+1.57):(dy>0?1.57:0),dx>0?(dy>0?4.71:6.28):(dy>0?3.14:1.57));q.stroke()}
}
function thornGround(q,x,y,s,nb,zone,bridge){
 const Z=THORN_ZONES[zone];
 if(s==='thornMoss'){
  thornField(q,x,y,[[.34,'#10241a'],[.5,'#163020'],[.64,'#1d3b29'],[.78,'#254a32'],[1,'#2f5b3d']],22,9,3);
  for(let i=0;i<4;i++)thornLeaf(q,hash2(x*5+i,y,14)*30+1,hash2(x,y*5+i,15)*30+1,2.4+hash2(x+i,y,16)*2,hash2(x,y+i,17)*6.28,i%2?'#3f7a4a':Z.accent+'88');
  thornFringe(q,x,y,nb,zone);return;
 }
 thornField(q,x,y,Z.ground,26,10,5+zone*9);
 // rare, unique details only: a stone, a few leaves, a puddle, a twig
 const r=hash2(x,y,25);
 if(r<.07)thornStone(q,hash2(x,y,29)*22+5,hash2(x,y,30)*20+7,3+hash2(x,y,31)*2,2+hash2(x,y,32),'#3f3a4a','#6a6478');
 else if(r<.15){for(let i=0;i<4;i++)thornLeaf(q,hash2(x*7+i,y,21)*28+2,hash2(x,y*7+i,22)*28+2,3+hash2(x+i,y,23)*2,hash2(x,y+i,24)*6.28,Z.litter[i%4]+'cc')}
 else if(r<.20&&zone===1){const px=hash2(x,y,34)*16+8,py=hash2(x,y,35)*14+10;thornBlob(q,px,py,7,3.4,'#0a0c07');thornBlob(q,px,py,6,2.6,'#1d2415');q.strokeStyle='rgba(170,200,140,.3)';q.lineWidth=1;q.beginPath();q.ellipse(px-1,py-.6,3.4,1.1,0,0,Math.PI);q.stroke()}
 else if(r<.20&&zone===4){q.strokeStyle='rgba(8,2,4,.8)';q.lineWidth=1;let cx=hash2(x,y,45)*20+6,cy=hash2(x,y,46)*20+6;q.beginPath();q.moveTo(cx,cy);for(let n=0;n<4;n++){cx+=(hash2(x,y+n,47)-.5)*9;cy+=(hash2(x+n,y,48)-.3)*7;q.lineTo(cx,cy)}q.stroke();q.strokeStyle='rgba(255,90,120,.22)';q.beginPath();q.moveTo(cx,cy);q.lineTo(cx-2,cy+3);q.stroke()}
 else if(r<.20&&zone===3){const sx=hash2(x,y,42)*14+8,sy=hash2(x,y,43)*14+8;q.strokeStyle='rgba(225,225,240,.35)';q.lineWidth=1;for(let n=0;n<5;n++){q.beginPath();q.moveTo(sx,sy);q.lineTo(sx+Math.cos(n*.9)*9,sy+Math.sin(n*.9)*9);q.stroke()}for(const rr of[4,8]){q.beginPath();q.arc(sx,sy,rr,0,6.28);q.stroke()}}
 else if(r<.20&&zone===2){for(let i=0;i<4;i++){const sx=hash2(x*3+i,y,39)*28+2,sy=hash2(x,y*3+i,40)*28+2;q.fillStyle='rgba(127,214,255,.8)';q.fillRect(sx,sy,1,1);q.fillStyle='rgba(127,214,255,.22)';q.fillRect(sx-1,sy,3,1);q.fillRect(sx,sy-1,1,3)}}
 thornFringe(q,x,y,nb,zone);
}
function thornForestFloor(q,x,y,zone){
 // the forest floor under the trees: dark and quiet, so the trees and the trail stand out
 const Z=THORN_ZONES[zone];thornField(q,x,y,Z.deep,22,9,3+zone);
 if(hash2(x,y,25)>.82)for(let i=0;i<3;i++)thornLeaf(q,hash2(x*7+i,y,21)*28+2,hash2(x,y*7+i,22)*28+2,3,hash2(x,y+i,24)*6.28,Z.litter[i%4]+'44');
}
// ---- rotten wood: boards with grain, warps, knots, cracks, nail heads, wet stains, moss and fungus in the gaps
function thornPlanks(q,x,y,vertical){
 q.save();if(vertical){q.translate(32,0);q.rotate(Math.PI/2)}
 const R=(i,n)=>hash2(x*17+i,y*13+n,611+(vertical?1:0));
 for(let b=0;b<4;b++){
  const by=b*8,warp=Math.round((R(b,1)-.5)*2),shade=R(b,2),base=shade<.33?['#5a4d3d','#3e342a']:shade<.66?['#4d4435','#352d24']:['#443c30','#2c261e'];
  const g=q.createLinearGradient(0,by,0,by+7);g.addColorStop(0,base[0]);g.addColorStop(1,base[1]);q.fillStyle=g;q.fillRect(0,by+warp,32,7);
  q.fillStyle='rgba(255,236,200,.10)';q.fillRect(0,by+warp,32,1);
  // grain: long thin curves, a few darker
  for(let i=0;i<4;i++){q.strokeStyle=i%2?'rgba(20,14,10,.55)':'rgba(170,150,120,.22)';q.lineWidth=.8;const gy=by+warp+1.3+i*1.4+R(b,3+i)*.6;q.beginPath();q.moveTo(0,gy);q.bezierCurveTo(10,gy+(R(b,9+i)-.5)*2,22,gy+(R(b,13+i)-.5)*2,32,gy);q.stroke()}
  // the gap between boards: dark, with moss creeping out of it and now and then a toadstool
  q.fillStyle='#0c0907';q.fillRect(0,by+7+warp,32,1);if(R(b,20)>.5){q.fillStyle='rgba(70,120,70,.55)';for(let i=0;i<6;i++)q.fillRect(R(b,21+i)*30,by+6+warp,2+(i%3),1)}
  // joint, knot, nails, crack
  const jx=Math.round(R(b,30)*22)+5;q.strokeStyle='rgba(14,9,6,.7)';q.lineWidth=1;q.beginPath();q.moveTo(jx,by+warp+.5);q.lineTo(jx+1,by+warp+3);q.lineTo(jx,by+warp+6.5);q.stroke();q.strokeStyle='rgba(255,230,190,.12)';q.beginPath();q.moveTo(jx+1.5,by+warp+.5);q.lineTo(jx+2.5,by+warp+3);q.lineTo(jx+1.5,by+warp+6.5);q.stroke();
  for(const nx of[jx+4,jx-4]){q.fillStyle='rgba(20,13,9,.7)';q.beginPath();q.arc(nx+.5,by+warp+3.5,1.4,0,6.28);q.fill();q.fillStyle='#a89a84';q.fillRect(nx,by+warp+3,1,1)}
  if(R(b,31)>.55){const kx=R(b,32)*20+6;q.strokeStyle='rgba(20,14,10,.8)';q.lineWidth=1;q.beginPath();q.ellipse(kx,by+warp+3.5,2.4,1.6,0,0,6.28);q.stroke();q.beginPath();q.ellipse(kx,by+warp+3.5,1,.6,0,0,6.28);q.stroke()}
  if(R(b,33)>.62){q.strokeStyle='rgba(8,5,4,.85)';q.lineWidth=1;const cx=R(b,34)*22+4;q.beginPath();q.moveTo(cx,by+warp+1);q.lineTo(cx+3,by+warp+3);q.lineTo(cx+1,by+warp+5);q.lineTo(cx+4,by+warp+7);q.stroke()}
 }
 for(let i=0;i<3;i++){const wx=R(i,40)*28,wy=R(i,41)*28;thornBlob(q,wx,wy,4+R(i,42)*4,2+R(i,43)*2,'rgba(8,6,10,.28)',R(i,44)*3)}
 for(let i=0;i<2;i++)if(R(i,45)>.5){const mx=R(i,46)*26+2,my=R(i,47)*26+2;thornBlob(q,mx,my,3.4,2,'rgba(80,130,80,.5)');for(let s=0;s<5;s++){q.strokeStyle='rgba(120,180,110,.55)';q.lineWidth=.8;q.beginPath();q.moveTo(mx-3+s*1.5,my+1);q.lineTo(mx-3+s*1.5,my-1-(s%2))}}
 q.restore();
}
// ---- cabin walls: stacked logs with round ends and bark, moss on top, a sagging shingle roof edge on the north side
function thornCabinWall(q,x,y,cw){
 const R=(i,n)=>hash2(x*19+i,y*11+n,733),north=!cw(0,-1),south=!cw(0,1),west=!cw(-1,0),east=!cw(1,0);
 q.fillStyle='#2b2219';q.fillRect(0,0,32,32);
 for(let r=0;r<4;r++){
  const ry=r*8,g=q.createLinearGradient(0,ry,0,ry+8);g.addColorStop(0,'#6b5a44');g.addColorStop(.35,'#4d3f2f');g.addColorStop(.8,'#352a1f');g.addColorStop(1,'#1c150f');q.fillStyle=g;
  q.beginPath();q.moveTo(west?2:0,ry+1);q.lineTo(east?30:32,ry+1);q.quadraticCurveTo(east?32:32,ry+4,east?30:32,ry+7.5);q.lineTo(west?2:0,ry+7.5);q.quadraticCurveTo(west?0:0,ry+4,west?2:0,ry+1);q.fill();
  q.strokeStyle='rgba(15,10,6,.7)';q.lineWidth=.9;for(let i=0;i<4;i++){const gy=ry+2+i*1.5;q.beginPath();q.moveTo(0,gy);q.bezierCurveTo(9,gy+(R(r,i)-.5)*2,22,gy+(R(r,i+5)-.5)*2,32,gy);q.stroke()}
  q.strokeStyle='rgba(200,180,140,.18)';q.beginPath();q.moveTo(0,ry+1.3);q.lineTo(32,ry+1.3);q.stroke();
  if(R(r,12)>.55){const kx=R(r,13)*24+4;q.strokeStyle='rgba(10,6,4,.9)';q.beginPath();q.ellipse(kx,ry+4.5,2.3,1.7,0,0,6.28);q.stroke();q.beginPath();q.ellipse(kx,ry+4.5,.9,.6,0,0,6.28);q.stroke()}
  if(R(r,14)>.6){q.strokeStyle='rgba(6,4,3,.9)';const cx=R(r,15)*24+3;q.beginPath();q.moveTo(cx,ry+1);q.lineTo(cx+2,ry+4);q.lineTo(cx,ry+7);q.stroke()}
  if(R(r,16)>.5)thornBlob(q,R(r,17)*28+2,ry+5.5,5,1.8,'rgba(70,120,70,.4)',0);
  q.fillStyle='rgba(0,0,0,.45)';q.fillRect(0,ry+7,32,1);
 }
 // rot: dark wet streaks run down from the top, moss and drip stains
 for(let i=0;i<3;i++){const sx=R(i,20)*28+2,len=10+R(i,21)*18,sg=q.createLinearGradient(0,0,0,len);sg.addColorStop(0,'rgba(8,12,8,.34)');sg.addColorStop(1,'rgba(8,12,8,0)');q.fillStyle=sg;q.beginPath();q.moveTo(sx,0);q.lineTo(sx+2.4,0);q.quadraticCurveTo(sx+3,len*.6,sx+1.2,len);q.quadraticCurveTo(sx-.6,len*.6,sx,0);q.fill();thornBlob(q,sx+1,12+R(i,22)*14,2,3,'rgba(60,100,60,.3)')}
 if(north){ // the roof eave: overlapping shingles, a few gone, moss along the edge
  q.fillStyle='#2c2724';q.fillRect(0,0,32,13);
  for(let r=0;r<3;r++)for(let c=-1;c<6;c++){const sx=c*7+(r%2)*3.5-1,sy=r*4;if(R(c+3,r+30)>.88)continue;const sg=q.createLinearGradient(0,sy,0,sy+5);sg.addColorStop(0,R(c,r+40)>.5?'#4a4a42':'#3e3e38');sg.addColorStop(1,'#1d1d1a');q.fillStyle=sg;q.beginPath();q.moveTo(sx,sy);q.lineTo(sx+7,sy);q.lineTo(sx+7,sy+3.5);q.quadraticCurveTo(sx+3.5,sy+6,sx,sy+3.5);q.fill();q.fillStyle='rgba(255,255,255,.07)';q.fillRect(sx,sy,7,1);if(R(c,r+50)>.7)thornBlob(q,sx+3,sy+4,3,1.2,'rgba(80,130,80,.55)')}
  {const eg=q.createLinearGradient(0,11,0,16);eg.addColorStop(0,'rgba(0,0,0,.5)');eg.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=eg;q.fillRect(0,11,32,5)}for(let i=0;i<5;i++){const mx=R(i,60)*30;q.fillStyle='rgba(95,150,90,.6)';q.fillRect(mx,11,2,2+(i%3))}
 }
 if(south){const g=q.createLinearGradient(0,24,0,32);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');q.fillStyle=g;q.fillRect(0,24,32,8)}
}
// ---- water: dark swamp water, duckweed, lily pads, reeds along the bank, ripples drawn each frame
function thornWaterBase(q,x,y,nb,zone){
 const pal=zone===2?[[.4,'#08171c'],[.7,'#0d2229'],[1,'#143038']]:zone===1?[[.4,'#0b1409'],[.7,'#111d0d'],[1,'#182714']]:zone===4?[[.4,'#150810'],[.7,'#1f0c18'],[1,'#2a1120']]:[[.4,'#0c0818'],[.7,'#150f2a'],[1,'#1e1640']];
 thornField(q,x,y,pal,18,7,77);
 for(let i=0;i<3;i++)if(hash2(x+i,y,81)>.45){const px=hash2(x,y+i,82)*26+3,py=hash2(x+i,y,83)*26+3;thornBlob(q,px,py,3.2,2.2,'#21482a');thornBlob(q,px-.6,py-.5,2.2,1.4,'#2f6a3a');q.strokeStyle='#0c2010';q.lineWidth=.8;q.beginPath();q.moveTo(px,py);q.lineTo(px+3,py-1);q.stroke();if(hash2(x,y+i,84)>.75){q.fillStyle='#e6d2fa';q.fillRect(px,py-1,1,1)}}
 for(let i=0;i<10;i++){q.fillStyle='rgba(90,160,90,.5)';q.fillRect(hash2(x*3+i,y,85)*30,hash2(x,y*3+i,86)*30,1+(i%2),1)}
 // the bank: mud rim and reeds
 const sides=[[0,1,0],[1,-1,0],[2,0,1],[3,0,-1]];for(const[i,dx,dy]of sides){if(nb[i]==='~')continue;
  const g=dx?q.createLinearGradient(dx>0?31:0,0,dx>0?22:9,0):q.createLinearGradient(0,dy>0?31:0,0,dy>0?22:9);g.addColorStop(0,'rgba(8,4,10,.85)');g.addColorStop(1,'rgba(8,4,10,0)');q.fillStyle=g;q.fillRect(0,0,32,32);
  for(let n=0;n<3;n++){const t=hash2(x*5+n,y*3+i,87)*24+4,ex=dx>0?30:dx<0?1:t,ey=dy>0?30:dy<0?1:t;q.strokeStyle=n%2?'#3a5a2a':'#2a4220';q.lineWidth=1.1;for(let b=-1;b<=1;b++){q.beginPath();q.moveTo(ex+(dy?b*1.6:0),ey+(dx?b*1.6:0));q.quadraticCurveTo(ex+(dy?b*2.4:0)-dx*5,ey+(dx?b*2.4:0)-dy*5,ex+(dy?b*3.2:0)-dx*9,ey+(dx?b*3.2:0)-dy*9-3);q.stroke()}
   if(n===1){const tx=ex-dx*8,ty=ey-dy*8-5;q.fillStyle='#5a3a22';q.fillRect(tx-1,ty-1,2,5);q.fillStyle='#8a5a32';q.fillRect(tx-1,ty-1,1,5)}}}
}
// ---- the trees: one sprite per (zone, size class, variant), painted in a 96x144 unit space and drawn sorted by base point
const THORN_TREE_DIM=Object.freeze([[1,1.2],[2,3],[2.75,4.1],[4,6]]);
// every tree canvas is this much wider and taller than its nominal box, with the base kept at the bottom centre
const THORN_SPRITE_PAD=Object.freeze([1.9,1.2]);
function thornUnderSprite(theme,v,key){
 const c=document.createElement('canvas');c.width=Math.round(32*THORN_SPRITE_PAD[0]);c.height=Math.round(38*THORN_SPRITE_PAD[1]);const q=c.getContext('2d'),R=i=>hash2(v*313+i*19,theme*57+3,909);q.translate((c.width-32)/2,c.height-38);
 q.fillStyle='rgba(0,0,0,.4)';q.beginPath();q.ellipse(16,34,11,3.2,0,0,6.28);q.fill();
 const Z=THORN_ZONES[theme],kind=v%5;
 if(kind===1){ // rock cluster with lichen
  for(const[sx,sy,rx,ry]of[[12,30,7,5],[22,31,5,3.6],[17,26,4.6,3.4]])thornStone(q,sx,sy,rx,ry,theme===4?'#3a2a30':theme===2?'#2f4048':theme===3?'#4a4858':'#3f3a4a',theme===4?'#6a4a52':theme===2?'#5a7a88':theme===3?'#8a88a0':'#6a6478');
  thornBlob(q,11,26.5,3.4,1.2,Z.moss);thornBlob(q,21,28,2.4,.9,Z.accent+'88');for(let i=0;i<3;i++)thornFern(q,8+R(i)*16,33,5+R(i+4)*3,-1.57+(R(i+8)-.5)*1.6,Z.moss,Z.accent+'88')
 }else if(kind===2){ // tall grass and reeds
  for(let i=0;i<11;i++){const sx=6+R(i)*20,tipx=sx+(R(i+11)-.5)*12,tipy=8+R(i+22)*14;q.strokeStyle=i%3===0?Z.accent+'cc':Z.moss;q.lineWidth=1.3;q.lineCap='round';q.beginPath();q.moveTo(sx,34);q.quadraticCurveTo(sx+(tipx-sx)*.3,22,tipx,tipy);q.stroke()}
  if(theme===1){q.fillStyle='#5a3a22';q.fillRect(10,10,2,8);q.fillRect(21,14,2,8)}
 }else if(kind===3){ // fallen branches and litter
  for(let i=0;i<3;i++){const x0=5+R(i)*8,y0=30+R(i+3)*4,x1=22+R(i+6)*8,y1=22+R(i+9)*8;q.strokeStyle=theme===3?'#6a6878':'#241a2b';q.lineWidth=2.4;q.lineCap='round';q.beginPath();q.moveTo(x0,y0);q.lineTo(x1,y1);q.stroke();q.strokeStyle='rgba(255,255,255,.12)';q.lineWidth=.9;q.beginPath();q.moveTo(x0,y0-1);q.lineTo(x1,y1-1);q.stroke();thornSpike(q,(x0+x1)/2,(y0+y1)/2,(x0+x1)/2+3,(y0+y1)/2-5,1,theme===4?THORN_COL.red[3]:THORN_COL.spikeDim)}
  for(let i=0;i<5;i++)thornLeaf(q,6+R(i+20)*20,28+R(i+30)*6,3,R(i+40)*6.28,Z.litter[i%4]+'cc')
 }else if(kind===4){ // a rotten stump with a mushroom and moss
  q.fillStyle='#120b16';q.beginPath();q.moveTo(8,34);q.quadraticCurveTo(9,24,11,20);q.lineTo(21,20);q.quadraticCurveTo(23,24,24,34);q.closePath();q.fill();q.fillStyle=theme===3?'#6a6878':theme===2?'#4a5a6a':'#35273d';q.fillRect(11,22,2,12);thornBlob(q,16,20,6,2.6,theme===3?'#8a88a0':'#4a3a52');thornBlob(q,16,20,4,1.6,theme===3?'#a8a6bc':'#5d4a66');q.strokeStyle='rgba(20,12,24,.8)';q.beginPath();q.ellipse(16,20,2.4,1,0,0,6.28);q.stroke();thornBlob(q,12,19,3,1,Z.moss);q.fillStyle='#d8cfe0';q.fillRect(21,17,1,3);thornBlob(q,21.5,17,2.4,1.5,theme===4?'#ff6d86':theme===2?'#7fd6ff':'#9a72cc')
 }else if(theme===0||theme===4){const ramp=theme?['#2a050c','#5a0a1a','#8a1030']:(v%2?['#0e0818','#1c1030','#2d1c4a']:['#0d1a13','#17301f','#27502f']);for(let i=0;i<7;i++){const a=-2.9+i*.45+(R(i)-.5)*.3,len=11+R(i+10)*8,sx=16+(R(i+20)-.5)*8,ex=sx+Math.cos(a)*len,ey=34+Math.sin(a)*len;q.strokeStyle=ramp[i%3];q.lineWidth=2.2;q.lineCap='round';q.beginPath();q.moveTo(sx,34);q.quadraticCurveTo((sx+ex)/2,(34+ey)/2-3,ex,ey);q.stroke();thornSpike(q,(sx+ex)/2,(34+ey)/2,(sx+ex)/2+(i%2?4:-4),(34+ey)/2-3,1,theme?THORN_COL.red[3]:THORN_COL.spikeDim);thornLeaf(q,ex,ey,5,a,ramp[(i+1)%3])}for(let i=0;i<2;i++)thornBlob(q,10+R(i+30)*12,18+R(i+40)*8,1.5,1.3,theme?'#ff6d86':'#b08be0')}
 else if(kind===0&&theme===1){for(let i=0;i<6;i++){const sx=8+R(i)*16;q.strokeStyle=i%2?'#4a5e2a':'#2e3a1c';q.lineWidth=1.3;q.beginPath();q.moveTo(sx,34);q.quadraticCurveTo(sx+(R(i+9)-.5)*10,22,sx+(R(i+18)-.5)*14,10+R(i+27)*8);q.stroke()}q.fillStyle='#b8a070';q.beginPath();q.ellipse(22,30,4,2,0,Math.PI,6.28);q.fill();q.fillStyle='#14100a';q.fillRect(21,30,2,4)}
 else if(kind===0&&theme===2){for(let i=0;i<4;i++){const mx=8+R(i)*16,my=24+R(i+5)*8,r=3+R(i+10)*3;q.fillStyle='#8aa0b0';q.fillRect(mx-.7,my,1.5,8);const cg=q.createLinearGradient(0,my-r,0,my);cg.addColorStop(0,'#5ac8d8');cg.addColorStop(1,'#3a2a7a');q.fillStyle=cg;q.beginPath();q.ellipse(mx,my,r,r*.6,0,Math.PI,6.28);q.fill();q.fillStyle='rgba(220,250,255,.8)';q.fillRect(mx-1,my-r*.5,1,1)}const gl=q.createRadialGradient(16,28,1,16,28,16);gl.addColorStop(0,'rgba(127,214,255,.3)');gl.addColorStop(1,'rgba(127,214,255,0)');q.fillStyle=gl;q.fillRect(0,10,32,28)}
 else if(kind===0){for(let i=0;i<5;i++){const a=-2.8+i*.55,len=10+R(i)*7;q.strokeStyle='rgba(225,223,238,.65)';q.lineWidth=1;q.beginPath();q.moveTo(16,34);q.quadraticCurveTo(16+Math.cos(a)*len*.5,34+Math.sin(a)*len*.5-3,16+Math.cos(a)*len,34+Math.sin(a)*len);q.stroke()}const cg=q.createLinearGradient(12,0,20,0);cg.addColorStop(0,'#e8e6f0');cg.addColorStop(1,'#8a8696');q.fillStyle=cg;q.beginPath();q.ellipse(16,24,4,8,0,0,6.28);q.fill();q.strokeStyle='rgba(60,58,72,.6)';for(const yy of[19,23,27]){q.beginPath();q.ellipse(16,yy,4,1.3,0,0,Math.PI);q.stroke()}}
 THORN_SPRITES.set(key,c);return c;
}
function thornTreeSprite(theme,cls,v){
 const key=theme+':'+cls+':'+v,hit=THORN_SPRITES.get(key);if(hit)return hit;if(cls===0)return thornUnderSprite(theme,v,key);
 const [tw,th]=THORN_TREE_DIM[cls],W=Math.round(tw*32),H=Math.round(th*32),c=document.createElement('canvas');c.width=Math.round(W*THORN_SPRITE_PAD[0]);c.height=Math.round(H*THORN_SPRITE_PAD[1]);const q=c.getContext('2d'),u=W/96;q.translate((c.width-W)/2,c.height-H);q.scale(u,u);
 const R=(i)=>hash2(v*977+i*13,theme*131+cls*7,303),lean=(R(1)-.5)*10,bx=48,by=140,ct=v&3,wb=(cls===3?16:12)*(.85+R(311)*.45),wt=(cls===3?7:5)*(.85+R(313)*.5),ht=(cls===1?74:cls===2?86:94)*(.86+R(312)*.26),YS=[1,1.5,.72,1][ct],XS=[1,.68,1.4,1.12][ct];
 const P=[[['#523a62','#2b1d33','#0e0812'],'#150e19','#cbb9e0'],[['#7a7a62','#44442f','#14140c'],'#0e0e08','#d2c9a2'],[['#a8bccc','#5e6e7e','#222c38'],'#141a22','#bcd8e6'],[['#9a96a4','#5a5662','#1c1a22'],'#121016','#e8e6f0'],[['#7a2236','#3a0e1a','#12040a'],'#0a0206','#ff6d86']][theme];
 const[trunkCols,rootCol,thornCol]=P;
 // contact shadow and roots
 const sh=q.createRadialGradient(bx,by,2,bx,by,wb*2.6);sh.addColorStop(0,'rgba(0,0,0,.5)');sh.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=sh;q.fillRect(bx-wb*3,by-wb,wb*6,wb*2.4);
 q.fillStyle=rootCol;for(let i=0;i<5;i++){const a=(i-2)*.55+(R(2+i)-.5)*.3,len=wb*(1.3+R(7+i)*.9);q.beginPath();q.moveTo(bx+Math.sin(a)*wb*.4,by-wb*.8);q.quadraticCurveTo(bx+Math.sin(a)*len*.55,by-wb*.2,bx+Math.sin(a)*len,by+1);q.lineTo(bx+Math.sin(a)*len*.6,by-1);q.quadraticCurveTo(bx+Math.sin(a)*len*.3,by-wb*.9,bx+Math.sin(a)*wb*.1,by-wb*1.4);q.closePath();q.fill()}
 // trunk
 const tg=q.createLinearGradient(bx-wb,0,bx+wb,0);tg.addColorStop(0,trunkCols[0]);tg.addColorStop(.3,trunkCols[1]);tg.addColorStop(1,trunkCols[2]);q.fillStyle=tg;
 const tx=bx+lean;q.beginPath();q.moveTo(bx-wb,by);q.quadraticCurveTo(bx-wb*.5+lean*.2,by-ht*.5,tx-wt,by-ht);q.lineTo(tx+wt,by-ht);q.quadraticCurveTo(bx+wb*.5+lean*.2,by-ht*.5,bx+wb,by);q.closePath();q.fill();
 q.strokeStyle='rgba(6,3,9,.7)';q.lineWidth=1.2;for(let i=0;i<7;i++){const f=(i+.5)/7,x0=bx-wb+f*wb*2,x1=tx-wt+f*wt*2;q.beginPath();q.moveTo(x0,by-2);q.quadraticCurveTo((x0+x1)/2+(R(20+i)-.5)*4,by-ht*.5,x1,by-ht+2);q.stroke()}
 q.strokeStyle='rgba(255,255,255,.14)';q.lineWidth=1;q.beginPath();q.moveTo(bx-wb*.75,by-2);q.quadraticCurveTo(bx-wb*.35+lean*.2,by-ht*.5,tx-wt*.7,by-ht+2);q.stroke();
 if(cls>=1&&R(30)>.4){const ky=by-ht*(.3+R(31)*.3);q.fillStyle='#07040a';q.beginPath();q.ellipse(bx+lean*.3+(R(32)-.5)*3,ky,2.6,4,0,0,6.28);q.fill();if(theme===1){q.fillStyle='rgba(120,255,150,.3)';q.beginPath();q.ellipse(bx+lean*.3,ky+1,1.2,2.4,0,0,6.28);q.fill()}}
 if(cls>=1&&R(310)>.7){const sd=R(314)>.5?1:-1,fx=bx+sd*wb*1.1,ft=ht*.78;const fg=q.createLinearGradient(fx-wb,0,fx+wb,0);fg.addColorStop(0,trunkCols[0]);fg.addColorStop(.3,trunkCols[1]);fg.addColorStop(1,trunkCols[2]);q.fillStyle=fg;q.beginPath();q.moveTo(fx-wb*.7,by);q.quadraticCurveTo(fx+sd*wb*.6,by-ft*.5,fx+sd*wb*1.6-wt*.7,by-ft);q.lineTo(fx+sd*wb*1.6+wt*.7,by-ft);q.quadraticCurveTo(fx+sd*wb*.9,by-ft*.5,fx+wb*.7,by);q.closePath();q.fill()}
 // thorns along the trunk
 const nThorn=cls===0?4:cls===1?7:9;for(let i=0;i<nThorn;i++){const f=(i+1)/(nThorn+1),sd=i%2?1:-1,yy=by-ht*f,xx=bx+lean*f+sd*(wb-(wb-wt)*f)*.9;thornSpike(q,xx,yy,xx+sd*(7+R(40+i)*5),yy-3-R(50+i)*2,1.5,i%2?thornCol:THORN_COL.spikeDim);}
 // branches
 const nb=cls===0?3:cls===1?4:5,tips=[];for(let i=0;i<nb;i++){const f=.45+i/nb*.5,sd=i%2?1:-1,sx=bx+lean*f,sy=by-ht*f,len=(cls===0?16:cls===1?24:cls===2?32:42)*(.8+R(60+i)*.5),ex=sx+sd*len,ey=sy-len*(.35+R(70+i)*.4);
  q.strokeStyle=rootCol;q.lineWidth=Math.max(1.6,wb*.34*(1-f*.5));q.lineCap='round';q.beginPath();q.moveTo(sx,sy);q.quadraticCurveTo(sx+sd*len*.5,sy-len*.1,ex,ey);q.stroke();q.strokeStyle='rgba(255,255,255,.12)';q.lineWidth=1;q.beginPath();q.moveTo(sx,sy-1);q.quadraticCurveTo(sx+sd*len*.5,sy-len*.1-1,ex,ey-1);q.stroke();tips.push({x:ex,y:ey})}
 tips.push({x:tx,y:by-ht});
 if(ct===1)tips.forEach((t,i)=>{t.x=tx+(i%2?7:-7)*(.5+i*.2);t.y=by-ht*(.5+i*.11)});if(ct===2)tips.forEach(t=>{t.x=bx+(t.x-bx)*1.35;t.y=t.y+ht*.06});
 const blob=(x,y,rx,ry,col)=>thornBlob(q,x,y,rx,ry,col);
 if(theme===0||theme===4){
  const greens=['#070c09','#0f1a14','#18301f','#244a30'],violets=['#0e0818','#1c1030','#2d1c4a','#43306a'],bloom=theme===0?['#7d57ad','#b08be0']:['#ff6d86','#ffc0cc'];
  tips.forEach((t,ti)=>{const ramp=theme===4?['#2a050c','#5a0a1a','#8a1030','#c0204a']:ti%2?violets:greens,r=(cls===1?14:cls===2?19:26)*XS;blob(t.x,t.y+2,r,r*.62*YS,ramp[0]);blob(t.x-1,t.y,r*.8,r*.5*YS,ramp[1]);blob(t.x-2,t.y-r*.14,r*.55,r*.34*YS,ramp[2]);blob(t.x-r*.3,t.y-r*.3*YS,r*.26,r*.16*YS,theme===4?ramp[3]:ramp[3]+'aa')});
  for(let i=0;i<(cls+1)*3;i++){const t=tips[i%tips.length];blob(t.x+(R(80+i)-.5)*18,t.y+(R(90+i)-.5)*10,1.6,1.3,bloom[i%2])}
  for(let i=0;i<(cls+1)*(ct===3?4:1);i++){const t=tips[i%tips.length],sx=t.x+(R(100+i)-.5)*22,sy=t.y+5;q.strokeStyle=theme?'rgba(190,40,70,.6)':'rgba(40,80,52,.7)';q.lineWidth=1;q.beginPath();q.moveTo(sx,sy);q.quadraticCurveTo(sx+(i%2?2:-2),sy+5,sx+(i%2?1:-1),sy+8+R(110+i)*6);q.stroke();thornSpike(q,sx+(i%2?1:-1),sy+7,sx+(i%2?1:-1),sy+11+R(110+i)*6,.8,theme?thornCol:THORN_COL.spikeDim)}
 }else if(theme===1){
  for(const t of tips){for(let i=0;i<(ct===3?5:ct===0?1:2);i++){const ax=t.x+(R(120+i)-.5)*14,ay=t.y+3;q.strokeStyle='rgba(140,170,96,.8)';q.lineWidth=1.1;q.beginPath();q.moveTo(ax,ay);q.bezierCurveTo(ax+2,ay+8,ax-2,ay+16,ax+(i%2?3:-3),ay+22+R(130+i)*10);q.stroke()}
   for(let i=0;i<3;i++)thornLeaf(q,t.x+(R(140+i)-.5)*12,t.y+(R(150+i)-.5)*6,5+cls*1.6,R(160+i)*6.28,i%2?'#5a6a2a':'#3c4a1c')}
  for(let i=0;i<(cls+1)*2;i++){const f=.2+R(170+i)*.6,sd=i%2?1:-1,yy=by-ht*f,xx=bx+lean*f+sd*wb*(1-f*.4);q.fillStyle='#14100a';q.beginPath();q.ellipse(xx+sd*2,yy+1,5,2.6,0,0,6.28);q.fill();q.fillStyle='#b8a070';q.beginPath();q.ellipse(xx+sd*2,yy,5,2.2,0,Math.PI,6.28);q.fill();q.fillStyle='#d8c490';q.fillRect(xx+sd*2-3,yy-1,3,1)}
 }else if(theme===2){
  for(const t of tips){const r=cls===0?10:cls===1?15:cls===2?20:28,stalkH=r*.5;q.fillStyle='#8aa0b0';q.fillRect(t.x-1.5,t.y,3,stalkH);
   const cg=q.createLinearGradient(t.x,t.y-r*.6,t.x,t.y+r*.2);cg.addColorStop(0,'#5ac8d8');cg.addColorStop(.5,'#2a6a8a');cg.addColorStop(1,'#3a2a7a');q.fillStyle=cg;q.beginPath();q.ellipse(t.x,t.y,r,r*.55,0,Math.PI,6.28);q.lineTo(t.x+r,t.y);q.quadraticCurveTo(t.x,t.y+r*.28,t.x-r,t.y);q.fill();
   q.strokeStyle='rgba(200,245,255,.5)';q.lineWidth=1;for(let g=-3;g<=3;g++){q.beginPath();q.moveTo(t.x+g*r*.28,t.y+1);q.lineTo(t.x+g*r*.18,t.y+r*.2)}q.stroke();
   q.fillStyle='rgba(220,250,255,.85)';for(let i=0;i<4;i++)thornBlob(q,t.x+(R(180+i)-.5)*r*1.3,t.y-r*(.1+R(190+i)*.35),1.3+R(200+i),1,'rgba(220,250,255,.85)');
   const gl=q.createRadialGradient(t.x,t.y+4,1,t.x,t.y+4,r*1.1);gl.addColorStop(0,'rgba(127,214,255,.38)');gl.addColorStop(1,'rgba(127,214,255,0)');q.fillStyle=gl;q.fillRect(t.x-r*1.2,t.y-r*.4,r*2.4,r*1.5)}
  for(let i=0;i<10;i++){q.fillStyle='rgba(180,240,255,.8)';q.fillRect(20+R(210+i)*56,by-ht-14+R(220+i)*70,1,1)}
 }else{
  for(const t of tips){q.strokeStyle='rgba(235,233,245,.6)';q.lineWidth=.9;const r=cls===0?10:cls===1?14:cls===2?19:26;for(let i=0;i<7;i++){const a=3.5+i*.42;q.beginPath();q.moveTo(t.x,t.y);q.lineTo(t.x+Math.cos(a)*r,t.y+Math.sin(a)*r*.6+r*.4);q.stroke()}for(const rr of[.4,.7,1]){q.beginPath();q.arc(t.x,t.y+r*.15,r*rr,3.4,6.0);q.stroke()}
   for(let i=0;i<2;i++)thornLeaf(q,t.x+(R(230+i)-.5)*14,t.y+(R(240+i)-.5)*5,6+cls*1.6,R(250+i)*6.28,'#4a4858')}
  for(let i=0;i<(cls?3:1);i++){const t=tips[i%tips.length],cx=t.x+(R(260+i)-.5)*10,cy=t.y+10+R(270+i)*10;q.strokeStyle='rgba(235,233,245,.55)';q.lineWidth=1;q.beginPath();q.moveTo(cx,t.y);q.lineTo(cx,cy);q.stroke();const cg=q.createLinearGradient(cx-4,0,cx+4,0);cg.addColorStop(0,'#e8e6f0');cg.addColorStop(1,'#8a8696');q.fillStyle=cg;q.beginPath();q.ellipse(cx,cy+7,4,8,0,0,6.28);q.fill();q.strokeStyle='rgba(60,58,72,.6)';for(const yy of[3,7,11]){q.beginPath();q.ellipse(cx,cy+yy,4,1.4,0,0,Math.PI);q.stroke()}}
  for(let i=0;i<(cls+1)*2;i++){const f=.15+R(280+i)*.7,yy=by-ht*f;q.strokeStyle='rgba(235,233,245,.5)';q.lineWidth=1.4;q.beginPath();q.moveTo(bx-wb*(1-f*.5),yy+4);q.lineTo(bx+wb*(1-f*.5),yy-4);q.stroke()}
 }
 THORN_SPRITES.set(key,c);return c;
}
// ---- bushes: tangles of curved canes with thorns, drawn as a sprite that spills past its tile (the red ones glow and bleed outwards)
function thornBushSprite(kind,v){
 const key='bush:'+kind+':'+v,hit=THORN_SPRITES.get(key);if(hit)return hit;
 const W=72,H=56,c=document.createElement('canvas');c.width=W;c.height=H;const q=c.getContext('2d'),red=kind==='red',R=i=>hash2(v*811+i*17,red?9:3,404);
 const ramp=red?[THORN_COL.red[0],THORN_COL.red[1],THORN_COL.red[2],THORN_COL.red[3]]:['#0d1a13','#17301f','#27502f','#3b7a4a'];
 if(red){const g=q.createRadialGradient(36,38,4,36,38,34);g.addColorStop(0,'rgba(190,20,60,.5)');g.addColorStop(1,'rgba(190,20,60,0)');q.fillStyle=g;q.fillRect(0,0,W,H)}
 q.fillStyle='rgba(0,0,0,.42)';q.beginPath();q.ellipse(36,47,20,5,0,0,6.28);q.fill();
 for(let layer=0;layer<3;layer++){const n=layer===0?10:layer===1?9:7;for(let i=0;i<n;i++){const a=-3.05+(i/(n-1))*2.97+(R(i+layer*20)-.5)*.25,len=(layer===0?22:layer===1?18:13)*(.8+R(i+50+layer*20)*.45),sx=36+(R(i+90)-.5)*14,sy=46-layer*2,ex=sx+Math.cos(a)*len,ey=sy+Math.sin(a)*len*.9,cx=(sx+ex)/2+(R(i+130)-.5)*10,cy=(sy+ey)/2-4-R(i+140)*5;
   q.lineCap='round';q.strokeStyle=ramp[Math.min(3,layer+(red?1:0))];q.lineWidth=layer===0?2.8:layer===1?2.2:1.6;q.beginPath();q.moveTo(sx,sy);q.quadraticCurveTo(cx,cy,ex,ey);q.stroke();
   q.strokeStyle=red?'rgba(255,120,150,.35)':'rgba(150,230,160,.3)';q.lineWidth=.8;q.beginPath();q.moveTo(sx,sy-1);q.quadraticCurveTo(cx,cy-1,ex,ey-1);q.stroke();
   for(let t=1;t<=3;t++){const f=t/4,px=(1-f)*(1-f)*sx+2*f*(1-f)*cx+f*f*ex,py=(1-f)*(1-f)*sy+2*f*(1-f)*cy+f*f*ey,sd=(t+i)%2?1:-1;thornSpike(q,px,py,px+sd*4,py-3.5,1.1,red?(t%2?THORN_COL.redHot:THORN_COL.red[3]):(t%2?THORN_COL.spike:THORN_COL.spikeDim))}
   if(!red&&layer>0&&i%2===0){thornLeaf(q,ex,ey,5,a,'#2d5a3b');thornLeaf(q,ex,ey,4,a+.7,'#3f7a4a')}if(red&&i%2===0){q.fillStyle=THORN_COL.redTip;q.fillRect(ex-1,ey-1,2,2);q.fillStyle='rgba(255,90,120,.35)';q.fillRect(ex-2,ey-2,4,4)}}}
 for(let i=0;i<6;i++){const bx=22+R(i+160)*28,by=24+R(i+170)*16;q.fillStyle=red?'#ffd0d9':'#b08be0';q.fillRect(bx,by,2,2);q.fillStyle=red?'rgba(255,120,150,.4)':'rgba(176,139,224,.4)';q.fillRect(bx-1,by-1,4,4)}
 THORN_SPRITES.set(key,c);return c;
}
// ---- standing pieces get a dark outline and a contact shadow so they sit in the scene like the trees do
function thornPropSprite(kind){
 const hit=THORN_PROPS.get(kind);if(hit)return hit;
 const raw=document.createElement('canvas');raw.width=raw.height=32;thornProp(raw.getContext('2d'),kind,5,7);
 const c=document.createElement('canvas');c.width=c.height=34;const q=c.getContext('2d');
 for(const[dx,dy]of[[0,1],[2,1],[1,0],[1,2],[0,0],[2,2],[0,2],[2,0]]){q.globalAlpha=.9;q.drawImage(raw,dx,dy)}
 q.globalCompositeOperation='source-in';q.fillStyle='#07040a';q.fillRect(0,0,34,34);q.globalCompositeOperation='source-over';q.globalAlpha=1;q.drawImage(raw,1,1);
 THORN_PROPS.set(kind,c);return c;
}

function thornNoise(wx,wy,sc,seed){const gx=wx/sc,gy=wy/sc,ix=Math.floor(gx),iy=Math.floor(gy),fx=gx-ix,fy=gy-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=hash2(ix,iy,seed),b=hash2(ix+1,iy,seed),c=hash2(ix,iy+1,seed),d=hash2(ix+1,iy+1,seed);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function thornField(q,x,y,ramp,sc1,sc2,seed,step=2){for(let by=0;by<32;by+=step)for(let bx=0;bx<32;bx+=step){const wx=x*32+bx,wy=y*32+by,n=thornNoise(wx,wy,sc1,seed)*.62+thornNoise(wx,wy,sc2,seed+7)*.38;let col=ramp[ramp.length-1][1];for(const[lim,c]of ramp)if(n<lim){col=c;break}q.fillStyle=col;q.fillRect(bx,by,step,step)}}
function thornSpecks(q,x,y,cols,n,salt){for(let i=0;i<n;i++){q.fillStyle=cols[i%cols.length];q.fillRect((hash2(x*13+i,y,salt)*30)|0,(hash2(x,y*17+i,salt+1)*30)|0,1+(i%3===0),1)}}
function thornBlob(q,cx,cy,rx,ry,col,rot=0){q.fillStyle=col;q.beginPath();q.ellipse(cx,cy,rx,ry,rot,0,Math.PI*2);q.fill()}
function thornSpike(q,x0,y0,x1,y1,w,col){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l*w,ny=dx/l*w;q.fillStyle=col;q.beginPath();q.moveTo(x0+nx,y0+ny);q.lineTo(x1,y1);q.lineTo(x0-nx,y0-ny);q.closePath();q.fill()}

// ---- furniture, lanterns and clutter. Each is painted on top of the floor of its own cell.
const THORN_INFO=Object.freeze({
 lanternPaper:['보라 종이등롱','휘어진 말뚝에 걸린 보랏빛 종이등롱. 안에서 약한 불빛이 흔들린다.'],
 lanternFirefly:['반딧불 병등','갈고리에 매단 유리병 속에서 반딧불이 맴돈다. 연한 초록 불빛이 번진다.'],
 lanternSkull:['해골 등롱','말뚝 끝에 꽂힌 해골의 눈구멍에서 호박색 불이 새어 나온다.'],
 lanternIron:['쇠 새장등','가시덩굴이 감긴 교수대 팔에 걸린 쇠 새장 속에서 불이 탄다.'],
 barrel:['썩은 통','통널이 벌어져 초록 진물이 흘러나온다.'],
 cart:['부서진 수레','바퀴가 빠지고 짐이 쏟아진 수레. 가시덩굴이 휘감았다.'],
 bed:['곰팡이 핀 침상','푸른 곰팡이가 슨 이불이 덮인 낡은 침상.'],
 table:['삐뚤어진 탁자','양초 토막과 깨진 그릇이 놓인 탁자.'],
 cauldron:['끓는 솥','초록 액체가 끓는 쇠솥. 매캐한 김이 오른다.'],
 stump:['썩은 그루터기','속이 물러 앉은 그루터기. 보랏빛 버섯이 돋아 있다.'],
 log:['쓰러진 고목','이끼와 가시가 덮인 채 누운 썩은 통나무.'],
 signpost:['낡은 이정표','가시덩굴에 묶인 이정표. 글씨는 지워져 읽을 수 없다.'],
 grave:['덩굴 감긴 무덤','가시덩굴에 반쯤 삼켜진 낮은 비석. 보랏빛 꽃이 피어 있다.'],
 cocoon:['거미줄 고치','희뿌연 실로 칭칭 감긴 고치가 매달려 있다. 안에서 무언가 꿈틀거리는 듯하다.'],
 hive:['버려진 벌집','종이 같은 껍질이 겹겹이 쌓인 벌집. 어두운 구멍이 숭숭 뚫려 있다.'],
 scarecrow:['가시 허수아비','넝마를 걸친 허수아비. 가시덩굴이 몸통을 파고들었다.'],
 cage:['걸린 새장','해골이 갇힌 새장이 가지에 매달려 삐걱거린다.'],
 well:['썩은 우물','이끼 낀 돌 두렁에 썩은 도르래가 걸려 있다. 물빛이 탁한 보라색이다.'],
 firepit:['식은 모닥불 터','돌로 두른 재투성이 모닥불 터.'],
 web:['거미줄','구석에 쳐진 거미줄.'],mushrooms:['발광 버섯','푸른 빛을 내는 버섯 무리.'],bones:['뼈 무더기','누군가 남기고 간 뼈.'],ferns:['고사리','어두운 습지에서 자란 고사리.'],
 flowers:['보라 방울꽃','가시 사이에서 핀 보랏빛 방울꽃.'],puddle:['검은 웅덩이','고인 물이 보랏빛으로 탁하다.'],roots:['드러난 뿌리','땅 위로 불거진 뿌리.']
});
function thornTerrainInfo(t,x,y){
 const T=state?.branchTerrain105?.thorn105;if(!T)return null;const key=k(x,y);
 if(T.props[key]&&t===TT.STONE_PILLAR){const i=THORN_INFO[T.props[key]];return i?{name:i[0],desc:i[1],hint:''}:null}
 if(T.deco[key]&&t===TT.FLOOR){const i=THORN_INFO[T.deco[key]];return i?{name:i[0],desc:i[1],hint:''}:null}
 if(t===TT.HEDGE)return T.bushes[key]==='red'?{name:'붉은 가시덤불',desc:'핏빛 가시가 칸 밖으로까지 뻗어 있다. 가까이 가기만 해도 찔린다.',hint:'공격하면 부술 수 있지만 피와 상처를 각오해야 한다.'}:{name:'가시덤불',desc:'빽빽하게 엉킨 보랏빛 가시덤불. 길을 막고 있다.',hint:'공격하면 부술 수 있다.'};
 if(t===TT.GARDEN_TREE)return{name:'가시나무 덤불',desc:'가시 돋은 어린 나무와 덤불이 길 옆을 막고 있다. 사이로 안쪽이 들여다보인다.',hint:''};
 if(t===TT.WALL){if(state.branchTerrain105.surfaces[key]==='rotWall')return{name:'썩은 통나무벽',desc:'이끼가 낀 채 삭아 가는 오두막 벽.',hint:''};return{name:'가시나무 숲',desc:'가시와 덩굴이 빽빽이 얽힌 숲. 지나갈 수 없다.',hint:''}}
 if(T.bridges[key])return{name:'썩은 판자 다리',desc:'곰팡이가 슨 판자를 이어 놓았다. 아직은 사람이 건널 만하다.',hint:''};
 if(t===TT.WATER)return{name:'가시숲 개울',desc:'검보랏빛으로 탁한 개울. 빠지면 익사한다.',hint:'판자 다리로만 건널 수 있다.'};
 return null;
}
function thornShadow(q){q.fillStyle='rgba(0,0,0,.34)';q.beginPath();q.ellipse(16,29,10,3,0,0,Math.PI*2);q.fill()}
function thornGlow(q,x,y,r,rgb,a){const g=q.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);q.fillStyle=g;q.fillRect(0,0,32,32)}
function thornPole(q,x,top,lean=0,w=3){q.fillStyle='#1c1320';q.beginPath();q.moveTo(x-w/2,31);q.lineTo(x-w/2+lean,top);q.lineTo(x+w/2+lean,top);q.lineTo(x+w/2,31);q.closePath();q.fill();q.fillStyle='#35273d';q.fillRect(x-w/2+(lean?lean*.4:0),top+3,1,26-(top-3)>0?26:20)}
function thornVine(q,x0,y0,x1,y1,col='#2d5a3b'){q.strokeStyle=col;q.lineWidth=1;q.beginPath();q.moveTo(x0,y0);q.quadraticCurveTo((x0+x1)/2+3,(y0+y1)/2-2,x1,y1);q.stroke();thornSpike(q,(x0+x1)/2,(y0+y1)/2,(x0+x1)/2+2,(y0+y1)/2-3,.8,THORN_COL.spike)}
function thornBox(q,x,y,w,h,d,top,front,side){q.fillStyle=front;q.fillRect(x,y+d,w,h-d);q.fillStyle=top;q.fillRect(x,y,w,d);q.fillStyle=side;q.fillRect(x+w-2,y+d,2,h-d);q.fillStyle='rgba(255,255,255,.14)';q.fillRect(x,y,w,1);q.fillStyle='rgba(255,255,255,.07)';q.fillRect(x,y+d,1,h-d);q.fillStyle='rgba(0,0,0,.4)';q.fillRect(x,y+h-1,w,1)}
function thornProp(q,kind,x,y){
 thornShadow(q);const hh=n=>hash2(x,y,n);
 switch(kind){
  case'lanternPaper':{thornPole(q,16,6,1);q.fillStyle='#1c1320';q.fillRect(10,7,13,2);thornGlow(q,16,15,15,'200,150,255',.4);
   q.fillStyle='#2a1c3a';q.fillRect(14,9,4,2);thornBlob(q,16,16,5.5,7,'#7a4cc4');thornBlob(q,16,16,4,6,'#c9a0ff');thornBlob(q,16,16,2.2,3.5,'#f4e6ff');
   q.strokeStyle='#4a2c7a';q.lineWidth=1;for(const dy of[-3,0,3]){q.beginPath();q.ellipse(16,16+dy,5.5,1.2,0,0,Math.PI);q.stroke()}
   q.fillStyle='#2a1c3a';q.fillRect(13,22,6,1);q.fillStyle='#d9b8ff';q.fillRect(16,23,1,4);thornVine(q,16,30,12,20)}break;
  case'lanternFirefly':{thornPole(q,16,5,-1);q.strokeStyle='#1c1320';q.lineWidth=2;q.beginPath();q.moveTo(15,7);q.lineTo(23,7);q.lineTo(23,10);q.stroke();thornGlow(q,23,16,14,'150,230,120',.38);
   q.fillStyle='rgba(180,230,170,.5)';q.fillRect(19,11,8,11);q.fillStyle='#2a3a2a';q.fillRect(19,10,8,2);q.fillRect(19,22,8,1);q.fillStyle='rgba(255,255,255,.25)';q.fillRect(20,12,1,9);
   for(const[fx,fy]of[[21,14],[24,17],[22,19],[25,13]]){q.fillStyle='#e8ff9a';q.fillRect(fx,fy,1,1);q.fillStyle='rgba(216,255,138,.5)';q.fillRect(fx-1,fy,3,1)}}break;
  case'lanternSkull':{thornPole(q,16,12,0);thornGlow(q,16,10,14,'255,170,80',.38);q.fillStyle='#d8cdb4';q.beginPath();q.ellipse(16,9,6,5.5,0,0,Math.PI*2);q.fill();q.fillRect(12,12,8,4);q.fillStyle='#a89d86';q.fillRect(12,15,8,1);
   q.fillStyle='#1a1118';q.fillRect(12,8,3,3);q.fillRect(17,8,3,3);q.fillStyle='#ffb15a';q.fillRect(13,9,1,1);q.fillRect(18,9,1,1);q.fillStyle='#fff0c8';q.fillRect(13,9,1,1);q.fillStyle='#1a1118';q.fillRect(15,11,2,2);for(let i=0;i<4;i++)q.fillRect(13+i*2,14,1,2);
   thornSpike(q,16,4,16,0,1.3,'#ffb15a');thornVine(q,16,28,20,18)}break;
  case'lanternIron':{thornPole(q,10,4,0,4);q.fillStyle='#1c1320';q.fillRect(10,4,13,2);q.fillRect(21,5,2,3);thornGlow(q,22,15,15,'255,140,70',.4);
   q.strokeStyle='#14101a';q.lineWidth=1.5;q.beginPath();q.moveTo(22,8);q.lineTo(22,10);q.stroke();q.fillStyle='#14101a';q.fillRect(18,10,8,2);q.fillRect(18,22,8,2);for(const cx of[18,21,24])q.fillRect(cx,12,1,10);
   q.fillStyle='#ff8a4a';q.beginPath();q.moveTo(22,13);q.lineTo(25,19);q.lineTo(22,21);q.lineTo(19,19);q.closePath();q.fill();q.fillStyle='#ffe0a0';q.fillRect(21,17,2,3);thornVine(q,10,29,15,12);thornSpike(q,12,16,16,14,1,THORN_COL.spike)}break;
  case'bed':{thornBox(q,3,8,26,3,3,'#5a4632','#3b2f22','#2a2018');q.fillStyle='#1c1320';q.fillRect(3,6,26,3);q.fillStyle='#4a3a28';q.fillRect(3,5,26,1);
   thornBox(q,4,11,24,17,5,'#6a7f60','#44604a','#2f4636');
   for(const[fx,fy,fw]of[[7,17,6],[16,20,8],[10,24,9],[22,16,4]]){q.fillStyle='rgba(140,200,150,.38)';q.fillRect(fx,fy,fw,2)}
   q.fillStyle='rgba(0,0,0,.22)';q.fillRect(5,19,22,1);q.fillRect(5,23,22,1);thornBlob(q,12,22,3.2,2,'rgba(30,50,36,.55)');
   thornBox(q,6,11,10,5,2,'#b4aeca','#8a84a2','#6a6482');q.fillStyle='#d6d0ea';q.fillRect(7,12,5,1);
   q.fillStyle='#14101a';q.fillRect(3,27,3,3);q.fillRect(26,27,3,3);q.fillStyle='#4a3a28';q.fillRect(3,27,3,1);q.fillRect(26,27,3,1);q.fillStyle='#e8f0d8';q.fillRect(22,17,2,1)}break;
  case'table':{q.fillStyle='#14101a';q.fillRect(6,16,3,13);q.fillRect(23,16,3,13);q.fillStyle='#3a2c20';q.fillRect(6,16,1,13);
   thornBox(q,3,10,26,8,5,'#7a6244','#4a3a28','#33271b');q.fillStyle='#14101a';for(const jx of[10,17,23])q.fillRect(jx,10,1,5);q.fillStyle='rgba(120,200,120,.25)';q.fillRect(4,12,6,2);
   thornGlow(q,10,7,10,'255,170,80',.3);q.fillStyle='#e6dcc4';q.fillRect(8,3,4,8);q.fillStyle='#fff0d0';q.fillRect(8,3,1,8);q.fillStyle='#14101a';q.fillRect(10,2,1,2);thornBlob(q,10,1.5,1.6,2.4,'#ffb15a');thornBlob(q,10,2,.8,1.4,'#fff3c0');q.fillStyle='rgba(230,220,196,.8)';q.fillRect(7,11,6,1);
   thornBlob(q,21,11,4.2,1.8,'#14101a');thornBlob(q,21,10.6,3.4,1.2,'#8a7a62');q.fillStyle='#14101a';q.fillRect(20,10,1,1);q.fillStyle='#cfc6ae';q.fillRect(26,11,2,2);q.fillRect(14,12,3,1)}break;
  case'cauldron':{thornGlow(q,16,22,15,'255,130,60',.22);thornGlow(q,16,11,13,'120,224,120',.3);
   thornBlob(q,16,28,9,2.4,'rgba(255,120,40,.35)');for(const fx of[11,16,21]){q.fillStyle='#ff9a4a';q.beginPath();q.moveTo(fx-2,29);q.lineTo(fx,24);q.lineTo(fx+2,29);q.fill();q.fillStyle='#ffe0a0';q.fillRect(fx,26,1,3)}
   q.fillStyle='#14101a';q.fillRect(8,22,3,7);q.fillRect(21,22,3,7);thornBlob(q,16,18,11,8.5,'#14101a');
   const body=q.createLinearGradient(5,0,27,0);body.addColorStop(0,'#4a4458');body.addColorStop(.35,'#2e2a38');body.addColorStop(1,'#14101a');q.fillStyle=body;q.beginPath();q.ellipse(16,18,10,7.8,0,0,Math.PI*2);q.fill();
   thornBlob(q,16,12,9.4,3.2,'#1c1822');thornBlob(q,16,12,8.2,2.5,'#2e2a38');thornBlob(q,16,12.2,7,2,'#5fd070');thornBlob(q,13.5,11.8,3,.9,'#c8ffc0');
   for(const[bx,by]of[[13,9],[19,8],[16,6],[21,10]]){q.fillStyle='rgba(190,255,180,.7)';q.beginPath();q.arc(bx,by,1.4,0,6.28);q.fill()}
   q.fillStyle='rgba(210,235,210,.22)';q.beginPath();q.ellipse(16,4,3,4,0,0,6.28);q.fill();q.strokeStyle='#14101a';q.lineWidth=1.4;q.beginPath();q.moveTo(24,4);q.lineTo(19,11);q.stroke();q.fillStyle='#14101a';q.fillRect(23,3,3,2);q.fillStyle='rgba(255,255,255,.14)';q.fillRect(8,15,1,6)}break;
  case'barrel':{q.fillStyle='rgba(0,0,0,.25)';q.fillRect(8,27,17,2);const g=q.createLinearGradient(8,0,25,0);g.addColorStop(0,'#5a4630');g.addColorStop(.3,'#6b5640');g.addColorStop(.7,'#3f3022');g.addColorStop(1,'#241a12');q.fillStyle=g;q.beginPath();q.moveTo(9,28);q.quadraticCurveTo(5,19,9,9);q.lineTo(23,9);q.quadraticCurveTo(27,19,23,28);q.closePath();q.fill();
   q.fillStyle='#14101a';for(const sx of[12,15,18,21])q.fillRect(sx,10,1,18);q.fillStyle='#2a2f2c';for(const hy of[12,19,25]){q.beginPath();q.moveTo(8+(hy===19?-1:0),hy);q.lineTo(24+(hy===19?1:0),hy);q.lineTo(24,hy+2);q.lineTo(8,hy+2);q.fill();q.fillStyle='rgba(180,190,200,.25)';q.fillRect(9,hy,5,1);q.fillStyle='#2a2f2c'}
   thornBlob(q,16,9,7.4,2.6,'#241a12');thornBlob(q,16,9,6,1.8,'#5a4630');thornBlob(q,16,9.2,4.6,1.2,'#5fa050');q.fillStyle='#5fa050';q.fillRect(11,12,2,11);q.fillRect(19,15,1,9);thornBlob(q,13,29,4.4,1.6,'rgba(95,160,80,.7)');q.fillStyle='#0a0710';q.fillRect(17,16,2,7);q.fillStyle='rgba(120,200,110,.4)';q.fillRect(18,15,1,2)}break;
  case'cart':{q.fillStyle='rgba(0,0,0,.28)';q.fillRect(3,27,26,2);thornBox(q,4,10,23,13,4,'#6a5238','#44341f','#2d2314');q.fillStyle='#14101a';for(const jx of[9,15,21])q.fillRect(jx,10,1,13);q.fillStyle='#14101a';q.fillRect(4,16,23,1);q.fillStyle='rgba(120,200,120,.22)';q.fillRect(5,12,8,2);
   q.fillStyle='#2e2418';q.fillRect(26,19,5,2);q.fillRect(28,17,2,6);q.strokeStyle='#14101a';q.lineWidth=2.4;q.beginPath();q.arc(10,25,5.2,0,Math.PI*2);q.stroke();q.strokeStyle='#4a3a28';q.lineWidth=1;q.beginPath();q.arc(10,25,5.2,0,Math.PI*2);q.stroke();q.strokeStyle='#14101a';for(let i=0;i<6;i++){q.beginPath();q.moveTo(10,25);q.lineTo(10+Math.cos(i*1.05)*5,25+Math.sin(i*1.05)*5);q.stroke()}
   q.fillStyle='#14101a';q.fillRect(21,24,4,5);q.fillStyle='#4a3a28';q.fillRect(21,24,4,1);thornBlob(q,20,9,5.5,3.4,'#8a7a62');thornBlob(q,23,8,3.4,2.4,'#a89a80');q.fillStyle='#5a4a38';q.fillRect(18,8,5,1);thornBlob(q,6,29,3,1.2,'#8a7a62');thornVine(q,4,27,27,16)}break;
  case'stump':{q.fillStyle='#1c1320';q.beginPath();q.moveTo(7,28);q.quadraticCurveTo(8,18,10,15);q.lineTo(22,15);q.quadraticCurveTo(24,18,25,28);q.closePath();q.fill();q.fillStyle='#2e2236';q.fillRect(11,17,2,11);thornBlob(q,16,15,7.5,3.4,'#4a3a52');thornBlob(q,16,15,5,2.2,'#5d4a66');q.strokeStyle='#3a2c42';q.beginPath();q.ellipse(16,15,3,1.2,0,0,Math.PI*2);q.stroke();
   for(const[mx,my,c]of[[10,14,'#7d57ad'],[22,16,'#5b3a82'],[19,13,'#9a72cc']]){q.fillStyle='#d8cfe0';q.fillRect(mx,my,1,3);thornBlob(q,mx+.5,my,2.4,1.5,c)}thornBlob(q,12,13,3,1.2,'#3f7a4a')}break;
  case'log':{q.fillStyle='#1c1320';q.beginPath();q.moveTo(2,22);q.lineTo(2,15);q.quadraticCurveTo(16,11,30,15);q.lineTo(30,22);q.quadraticCurveTo(16,27,2,22);q.closePath();q.fill();q.fillStyle='#35273d';q.fillRect(4,16,22,2);thornBlob(q,4,18.5,2.2,3.8,'#5d4a66');q.strokeStyle='#2e2236';q.beginPath();q.ellipse(4,18.5,1,2,0,0,Math.PI*2);q.stroke();
   thornBlob(q,16,14,8,2,THORN_COL.moss[1]);thornBlob(q,24,15,4,1.6,THORN_COL.moss[0]);for(let i=0;i<4;i++)thornSpike(q,10+i*5,15,11+i*5,11,.9,THORN_COL.spike)}break;
  case'signpost':{thornPole(q,16,4,0);q.fillStyle='#3b2f24';q.beginPath();q.moveTo(6,8);q.lineTo(20,8);q.lineTo(24,11);q.lineTo(20,14);q.lineTo(6,14);q.closePath();q.fill();q.beginPath();q.moveTo(26,16);q.lineTo(12,16);q.lineTo(8,19);q.lineTo(12,22);q.lineTo(26,22);q.closePath();q.fill();
   q.fillStyle='#6b5a44';q.fillRect(8,10,10,1);q.fillRect(11,18,12,1);q.fillStyle='#14101a';q.fillRect(9,12,6,1);q.fillRect(14,20,8,1);thornVine(q,16,28,16,6,'#3f7a4a');thornSpike(q,14,12,10,9,.9,THORN_COL.spike);thornSpike(q,18,20,23,23,.9,THORN_COL.spike)}break;
  case'grave':{q.fillStyle='#1c1722';q.beginPath();q.moveTo(8,28);q.lineTo(8,13);q.quadraticCurveTo(16,3,24,13);q.lineTo(24,28);q.closePath();q.fill();q.fillStyle='#4a4457';q.beginPath();q.moveTo(10,28);q.lineTo(10,14);q.quadraticCurveTo(16,6,22,14);q.lineTo(22,28);q.closePath();q.fill();q.fillStyle='#625b72';q.fillRect(10,14,2,14);
   q.strokeStyle='#201a28';q.lineWidth=1;q.beginPath();q.moveTo(15,10);q.lineTo(17,16);q.lineTo(14,20);q.stroke();q.fillStyle='#2a2433';q.fillRect(14,13,4,1);q.fillRect(15,11,2,5);thornVine(q,9,28,22,12,'#3f7a4a');thornVine(q,22,28,12,18,'#2d5a3b');
   for(const[fx,fy]of[[10,26],[21,25],[16,27]]){q.fillStyle='#7d57ad';q.fillRect(fx,fy,2,2);q.fillStyle='#e1cdf6';q.fillRect(fx,fy,1,1)}}break;
  case'cocoon':{q.strokeStyle='rgba(220,220,235,.5)';q.lineWidth=1;q.beginPath();q.moveTo(16,0);q.lineTo(16,7);q.stroke();q.beginPath();q.moveTo(0,2);q.lineTo(16,6);q.lineTo(32,2);q.moveTo(0,10);q.lineTo(16,10);q.lineTo(32,9);q.stroke();thornGlow(q,16,17,13,'160,210,170',.18);
   thornBlob(q,16,17,6.5,10,'#8c8a96');thornBlob(q,16,17,5,9,'#bab8c6');thornBlob(q,14,15,2.2,6,'#dedcea');q.strokeStyle='#6a6874';for(const by of[12,16,20,24]){q.beginPath();q.ellipse(16,by,6,1.5,0,0,Math.PI);q.stroke()}thornBlob(q,16,20,2.4,2.8,'rgba(120,190,140,.5)');thornBlob(q,16,27,3,1,'rgba(0,0,0,.35)')}break;
  case'hive':{q.fillStyle='#1c1320';q.fillRect(11,22,10,7);thornBlob(q,16,15,10,11,'#5a4a36');thornBlob(q,16,15,8.5,9.5,'#8a7656');thornBlob(q,13,12,5,6,'#a89470');q.strokeStyle='#5a4a36';q.lineWidth=1;for(const by of[9,13,17,21]){q.beginPath();q.ellipse(16,by,8-Math.abs(by-15)*.4,2.2,0,0,Math.PI);q.stroke()}
   for(const[hx,hy]of[[13,18],[19,14],[15,11],[20,20]]){q.fillStyle='#14101a';q.beginPath();q.ellipse(hx,hy,1.8,2.2,0,0,Math.PI*2);q.fill()}q.fillStyle='#e8c040';for(const[wx,wy]of[[9,9],[24,18],[22,8]]){q.fillRect(wx,wy,2,1);q.fillStyle='#14101a';q.fillRect(wx,wy,1,1);q.fillStyle='#e8c040'}}break;
  case'scarecrow':{thornPole(q,16,4,0,3);q.fillStyle='#1c1320';q.fillRect(5,10,22,3);q.fillStyle='#35273d';q.fillRect(5,10,22,1);thornBlob(q,16,8,4.5,4.5,'#8a7656');q.fillStyle='#14101a';q.fillRect(14,7,1,2);q.fillRect(18,7,1,2);q.fillRect(15,10,3,1);q.strokeStyle='#4a3a28';q.lineWidth=1;q.beginPath();q.moveTo(12,5);q.lineTo(20,11);q.moveTo(20,5);q.lineTo(12,11);q.stroke();
   q.fillStyle='#4a3a5a';q.beginPath();q.moveTo(10,13);q.lineTo(22,13);q.lineTo(24,26);q.lineTo(20,23);q.lineTo(17,28);q.lineTo(14,23);q.lineTo(8,26);q.closePath();q.fill();q.fillStyle='#35294a';q.fillRect(12,15,2,9);thornVine(q,16,28,16,12,'#3f7a4a');for(let i=0;i<4;i++)thornSpike(q,12+i*3,17+(i%2)*4,12+i*3+(i%2?3:-3),15+(i%2)*4,.8,THORN_COL.spike)}break;
  case'cage':{q.strokeStyle='#14101a';q.lineWidth=2;q.beginPath();q.moveTo(16,0);q.lineTo(16,6);q.stroke();q.lineWidth=1.5;q.beginPath();q.arc(16,13,6,3.14,6.28);q.stroke();q.fillStyle='#14101a';q.fillRect(8,13,16,2);q.fillRect(8,25,16,2);for(const cx of[9,12,16,20,23])q.fillRect(cx,13,1,13);
   q.fillStyle='#d8cdb4';q.beginPath();q.ellipse(16,18,3,2.6,0,0,Math.PI*2);q.fill();q.fillStyle='#14101a';q.fillRect(14,17,1,1);q.fillRect(17,17,1,1);q.fillStyle='#d8cdb4';q.fillRect(14,21,5,1);q.fillRect(15,23,3,1);q.fillRect(12,22,2,1);q.fillRect(19,22,2,1);thornBlob(q,16,29,5,1.4,'rgba(0,0,0,.4)')}break;
  case'well':{thornBlob(q,16,22,12,7,'#1c1722');thornBlob(q,16,21,10.5,5.5,'#4a4457');thornBlob(q,16,20,8,3.8,'#0e0a16');thornBlob(q,16,20,6.5,2.8,'#3a2a5a');q.fillStyle='rgba(200,160,255,.5)';q.fillRect(12,19,3,1);
   q.fillStyle='#1c1320';q.fillRect(6,5,2,18);q.fillRect(24,5,2,18);q.fillRect(5,5,22,3);q.fillStyle='#35273d';q.fillRect(5,5,22,1);q.fillStyle='#2d2218';q.fillRect(14,8,4,3);q.strokeStyle='#8a7656';q.beginPath();q.moveTo(16,11);q.lineTo(16,17);q.stroke();for(const bx of[10,14,18,22]){q.fillStyle='#625b72';q.fillRect(bx,18,3,3)}thornVine(q,6,23,10,9,'#3f7a4a');thornSpike(q,26,10,30,8,1,THORN_COL.spike)}break;
 }
}
function thornDeco(q,kind,x,y,nb){
 const hh=n=>hash2(x,y,n);
 switch(kind){
  case'web':{const sx=nb[0]==='w'?31:0,sy=nb[3]==='w'?0:31;q.strokeStyle='rgba(225,225,240,.55)';q.lineWidth=1;for(let i=0;i<5;i++){const a=i*.35+(sx?1.7:0)+(sy?0:1.5);q.beginPath();q.moveTo(sx,sy);q.lineTo(sx+Math.cos(a)*(sx?-1:1)*14,sy+Math.sin(a)*(sy?-1:1)*14);q.stroke()}for(const r of[5,9,13]){q.beginPath();q.arc(sx,sy,r,sx?1.57:0,sx?3.14:1.57);q.stroke()}}break;
  case'mushrooms':{thornGlow(q,16,20,12,'120,210,255',.16);for(let i=0;i<4;i++){const mx=8+i*5+(hh(i)*3|0),my=18+(i%2)*6,c=i%2?'#7fd6ff':'#b58cff';q.fillStyle='#d8cfe0';q.fillRect(mx,my,1,3);thornBlob(q,mx+.5,my,2.8,1.8,c);q.fillStyle='rgba(255,255,255,.7)';q.fillRect(mx-1,my-1,1,1)}}break;
  case'bones':{q.fillStyle='#d8cdb4';q.fillRect(8,20,10,2);q.fillRect(7,19,2,1);q.fillRect(7,22,2,1);q.fillRect(17,19,2,1);q.fillRect(17,22,2,1);thornBlob(q,22,17,3.6,3,'#d8cdb4');q.fillStyle='#14101a';q.fillRect(20,16,1,2);q.fillRect(23,16,1,2);q.fillRect(11,24,8,1);q.fillStyle='#d8cdb4';q.fillRect(12,25,1,2);q.fillRect(15,25,1,2)}break;
  case'ferns':{for(let i=0;i<5;i++){const a=-1.9+i*.5,bx=16,by=28;q.strokeStyle=i%2?'#2d5a3b':'#3f7a4a';q.lineWidth=1.3;q.beginPath();q.moveTo(bx,by);q.quadraticCurveTo(bx+Math.cos(a)*10,by+Math.sin(a)*10-4,bx+Math.cos(a)*15,by+Math.sin(a)*16);q.stroke()}}break;
  case'flowers':{for(let i=0;i<4;i++){const fx=7+i*6+(hh(i+3)*3|0),fy=17+(i%2)*6;q.strokeStyle='#2d5a3b';q.lineWidth=1;q.beginPath();q.moveTo(fx,fy+5);q.lineTo(fx,fy);q.stroke();q.fillStyle='#7d57ad';q.beginPath();q.moveTo(fx-2,fy);q.lineTo(fx+2,fy);q.lineTo(fx,fy+3);q.closePath();q.fill();q.fillStyle='#e1cdf6';q.fillRect(fx,fy,1,1)}}break;
  case'puddle':{thornBlob(q,16,20,10,5,'#0e0a16');thornBlob(q,16,20,8.5,4,'#241a3a');q.strokeStyle='rgba(190,150,255,.35)';q.beginPath();q.ellipse(14,19,4,1.6,0,0,Math.PI*2);q.stroke();q.fillStyle='rgba(255,255,255,.2)';q.fillRect(19,18,3,1)}break;
  case'firepit':{thornBlob(q,16,21,11,6,'#14101a');thornBlob(q,16,21,9,4.6,'#2a2430');for(let i=0;i<8;i++){const a=i*.785;q.fillStyle=i%2?'#625b72':'#4a4457';q.fillRect(16+Math.cos(a)*9-1.5,21+Math.sin(a)*5-1,3,2)}thornBlob(q,16,21,6,3,'#3a3640');q.fillStyle='#14101a';q.fillRect(11,19,10,2);q.fillRect(13,22,8,2);q.fillStyle='#6a6070';q.fillRect(12,23,4,1)}break;
 }
}


// ---- map cells: ground only. Trees, bushes and standing pieces are sprites in drawThornForest.
function thornRedGlow(q,x,y,nb){
 const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 dirs.forEach(([dx,dy],i)=>{if(nb[i]!=='R')return;const cx=16+dx*32,cy=16+dy*32,g=q.createRadialGradient(cx,cy,6,cx,cy,54);g.addColorStop(0,'rgba(170,16,52,.36)');g.addColorStop(1,'rgba(170,16,52,0)');q.fillStyle=g;q.fillRect(0,0,32,32);
  const ax=dx>0?31:dx<0?0:16,ay=dy>0?31:dy<0?0:16;for(let n=0;n<3;n++){const j=(hash2(x*3+n,y*5+i,66)-.5)*(dx&&dy?5:20),px=dx?ax:ax+j,py=dy?ay:ay+j,len=5+hash2(x+n,y+i,67)*6;thornSpike(q,px,py,px-dx*len,py-dy*len,1.3,THORN_COL.red[3]);thornSpike(q,px-dx*len*.55,py-dy*len*.55,px-dx*len,py-dy*len,.55,THORN_COL.redTip)}});
}
function drawThornCell(t,px,py,x,y,foreground=null){
 const ter=state.branchTerrain105,T=ter?.thorn105;if(!T)return false;
 if(THORN_RENDER_MAP!==state.map){THORN_RENDER_MAP=state.map;THORN_CANVAS.clear()}
 const key=k(x,y),s=ter.surfaces[key]||'thornTrail',zone=thornZoneAt(x,y,T),surf=(dx,dy)=>ter.surfaces[k(x+dx,y+dy)],at=(dx,dy)=>state.map[y+dy]?.[x+dx],
  nb=DIRS8.map(([dx,dy])=>{const a=at(dx,dy);return a===TT.GARDEN_TREE?'w':a===TT.WALL?(surf(dx,dy)==='rotWall'?'c':'w'):a===TT.WATER?'~':a===TT.HEDGE&&T.bushes[k(x+dx,y+dy)]==='red'?'R':a===TT.HEDGE?'h':'.'}),
  isBridge=!!T.bridges[key],deco=t===TT.FLOOR&&!isBridge?T.deco[key]||'':'';
 const stamp=key+':'+t+':'+s+':'+zone+':'+nb.join('')+':'+deco+':'+(isBridge?1:0);
 let c=THORN_CANVAS.get(stamp);
 if(!c){
  c=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d');
  if(t===TT.WATER)thornWaterBase(q,x,y,nb,zone);
  else if(t===TT.WALL||t===TT.GARDEN_TREE){if(s==='rotWall'&&t===TT.WALL)thornCabinWall(q,x,y,(dx,dy)=>surf(dx,dy)==='rotWall'&&at(dx,dy)===TT.WALL);else thornForestFloor(q,x,y,zone)}
  else{
   if(s==='rotPlank')thornPlanks(q,x,y,isBridge);else thornGround(q,x,y,s,nb,zone,isBridge);
   if(isBridge){for(const[i,top]of[[3,true],[2,false]]){if(nb[i]!=='~')continue;const ry=top?0:25;q.fillStyle='rgba(0,0,0,.45)';q.fillRect(0,top?5:22,32,2);q.fillStyle='#120d0a';q.fillRect(0,ry,32,7);q.fillStyle='#4a3e30';q.fillRect(0,ry+(top?4:0),32,2);for(let p=0;p<4;p++){q.fillStyle='#241c14';q.fillRect(p*9+2,ry,4,7);q.fillStyle='#5a4c3a';q.fillRect(p*9+2,ry,1,7)}q.strokeStyle='#8a7656';q.lineWidth=1;q.beginPath();q.moveTo(0,ry+(top?5:2));q.quadraticCurveTo(16,ry+(top?7:4),32,ry+(top?5:2));q.stroke()}}
   if(deco)thornDeco(q,deco,x,y,nb);
   thornRedGlow(q,x,y,nb);
  }
  THORN_CANVAS.set(stamp,c);
 }
 X.drawImage(c,px,py);
 if(t===TT.WATER){
  const now=FX.frameNow||performance.now();X.save();X.lineWidth=1;
  for(let i=0;i<2;i++){X.strokeStyle=`rgba(190,170,255,${.12+.08*Math.sin(now*.002+x+i)})`;X.beginPath();X.ellipse(px+16+Math.sin(now*.0007+x*1.3+i*2.1)*9,py+14+i*7+Math.cos(now*.0009+y+i)*3,5+i*3,1.8,0,0,Math.PI);X.stroke()}
  const gl=Math.sin(now*.003+x*2.1+y*1.7);if(gl>.82){X.fillStyle='rgba(230,215,255,.7)';X.fillRect(px+((x*7+y*3)%24)+4,py+((x*5+y*11)%24)+4,2,1)}X.restore();return true;
 }
 if(t===TT.PORTAL){const portal=state.branchPortals105.find(p=>p.x===x&&p.y===y);if(portal)drawBranchDoor(px,py,portal);return true}
 if(![TT.WALL,TT.FLOOR,TT.HEDGE,TT.PORTAL,TT.STONE_PILLAR,TT.GARDEN_TREE].includes(t)||t===TT.STONE_PILLAR&&!T.props[key]){X.save();if(!drawSpecialTerrain(t,px,py,x,y,performance.now()))drawInteractiveTerrain(t,px,py,x,y,performance.now());X.restore()}
 return true;
}
// ---- the foreground pass: trees, bushes and standing pieces, sorted by their base point, drawn after the ground like 산채 2층 pines
function drawThornForest(b){
 const T=state.branchTerrain105?.thorn105;if(!T||state.branchContext105?.id!=='thorn')return;
 const items=[],y0=b.y0-1,y1=b.y1+7,x0=b.x0-3,x1=b.x1+3,forest=T.forest;
 let lo=0,hi=forest.length;while(lo<hi){const mid=(lo+hi)>>1;if(forest[mid].y<y0)lo=mid+1;else hi=mid}
 for(let i=lo;i<forest.length;i++){const t=forest[i];if(t.y>y1)break;const tk=k(Math.floor(t.x),Math.floor(t.y-.1));if(t.x<x0||t.x>x1||!state.seen.has(tk))continue;items.push({y:t.y,t,vis:state.visible.has(tk)})}
 for(let y=Math.max(1,b.y0-1);y<=Math.min(ROWS-2,b.y1+1);y++)for(let x=Math.max(1,b.x0-2);x<=Math.min(COLS-2,b.x1+2);x++){const key=k(x,y);if(!state.seen.has(key))continue;
  const tile=state.map[y][x];const vis=state.visible.has(key);if(tile===TT.HEDGE&&T.bushes[key])items.push({y:y+.93,vis,bush:{x,y,kind:T.bushes[key]}});else if(tile===TT.STONE_PILLAR&&T.props[key])items.push({y:y+.85,vis,prop:{x,y,kind:T.props[key]}})}
 items.sort((a,c)=>a.y-c.y);
 X.save();X.imageSmoothingEnabled=false;
 for(const it of items){
  X.globalAlpha=it.vis?1:.42;
  if(it.t){const t=it.t,dim=THORN_TREE_DIM[t.c],sc=t.s||1,w=Math.round(dim[0]*TILE*sc*THORN_SPRITE_PAD[0]),h=Math.round(dim[1]*TILE*sc*THORN_SPRITE_PAD[1]);X.save();X.translate(Math.round(t.x*TILE),Math.round(t.y*TILE));if(t.f)X.scale(-1,1);X.drawImage(thornTreeSprite(t.t,t.c,t.v),-Math.round(w/2),-h,w,h);X.restore()}
  else if(it.bush){const{x,y,kind}=it.bush;X.drawImage(thornBushSprite(kind,Math.floor(hash2(x,y,515)*4)),x*TILE+TILE/2-36,y*TILE+Math.round(TILE*.93)-46)}
  else{const{x,y,kind}=it.prop;X.drawImage(thornPropSprite(kind),x*TILE-1,y*TILE-1)}
 }
 X.globalAlpha=1;X.restore();
}
