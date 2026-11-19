/* 천면경탑 art: everything the tower draws is its own. Sky-blue and lilac glass, silver structure, deep blue-violet shade.
   Tiles are painted once into small canvases (GLASS_ART) keyed by everything they depend on, then stamped per cell.
   - floors: wide glass panels with thin silver seams, a slanted gleam and the structure faintly seen under the glass;
     the pattern density follows the zone (room, corridor, hall, antechamber, path, bridge, dock, balcony)
   - walls: thick glass in section with a lit edge; outer walls carry deep windows and silver piers, inner walls are
     lighter framed panes, bridges show a rail and the slab's thickness over the drop
   - furniture: multi-tile sprites with a cast shadow and a faint reflection on the glass, drawn in one pass above the floor
   - sky: the same three parallax cloud layers on every floor, with the lower towers' roofs visible from above
   - tower bodies: a roof and a long front face (sky blue fading to blue-violet) while the player is outside, faded on
     entry; wall courses stacked above the back wall that remain inside. Heights come from mirrorTowerRise.
   Drawing goes to the context it is given; callers on the screen pass X. */
const GLASS_ART=new Map();
// One palette per floor: floor 1 sky blue and lilac on silver, floor 2 pink, floor 3 green glass with gold structure.
const GLASS_PALS=Object.freeze([
 Object.freeze({sky:'#cfe8ff',skyMid:'#a9cdf4',skyLow:'#8fa9e6',lilac:'#c8b4f4',lilacDeep:'#9a86de',lilacHi:'#f1e8ff',lilacGlass:'#6650b8',
  glass:'#86bdf0',glassHi:'#e2f3ff',glassMid:'#6f9edf',glassDeep:'#4d68c2',violet:'#3a2f7a',violetDeep:'#241c52',violetInk:'#16113a',
  silver:'#e6edf6',silverMid:'#b3c0d6',silverDark:'#7482a3',white:'#ffffff',floor:['#3e5aa4','#57479e'],floorAlt:['#4865b0','#6252aa'],seam:['#b9cbe8','#d3c6f2'],
  lamp:'#bff4ff',gem:['#f6c8ff','#bff4ff','#ffffff','#c8b4f4']}),
 Object.freeze({sky:'#ffe6f3',skyMid:'#f6c3de',skyLow:'#d99ccd',lilac:'#f4b4dc',lilacDeep:'#d77fb6',lilacHi:'#fff0f8',lilacGlass:'#b0508e',
  glass:'#f2a9d0',glassHi:'#ffeaf6',glassMid:'#dc84b8',glassDeep:'#ad5292',violet:'#5c2552',violetDeep:'#3c1838',violetInk:'#260d24',
  silver:'#f6eef4',silverMid:'#d8bfd0',silverDark:'#9c7590',white:'#ffffff',floor:['#8c4479','#7c4290'],floorAlt:['#9a4f87','#8a4c9e'],seam:['#f6cce2','#ecc8f2'],
  lamp:'#ffd6ec',gem:['#ffffff','#ffd0e8','#f8a8d4','#e8c6ff']}),
 Object.freeze({sky:'#dcf8e8',skyMid:'#b6e8cf',skyLow:'#8fcfb2',lilac:'#ead78c',lilacDeep:'#c9a94c',lilacHi:'#fff6d4',lilacGlass:'#8a7a2e',
  glass:'#84d8b2',glassHi:'#e4fff1',glassMid:'#52b08c',glassDeep:'#2f7f68',violet:'#1f413b',violetDeep:'#132b28',violetInk:'#0b1d1a',
  silver:'#fbe7a4',silverMid:'#e2c374',silverDark:'#a9853f',white:'#fffbe8',floor:['#2f6c5d','#4a6b3c'],floorAlt:['#367868','#577845'],seam:['#f2de90','#ece2a4'],
  lamp:'#ffe8a0',gem:['#fff3c0','#a8f0cc','#ffffff','#f2d470']})
]);
function glassPal(){return GLASS_PALS[Math.max(0,Math.min(2,(state?.branchContext105?.level||1)-1))]}
function glassMix(a,b,t){const p=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function glassRGBA(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function glassCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d');q.imageSmoothingEnabled=false;return[c,q]}
function glassCached(key,w,h,paint){if(!key.startsWith('sky|'))key=(state?.branchContext105?.level||1)+'|'+key;let c=GLASS_ART.get(key);if(!c){const[cv,q]=glassCanvas(w,h);paint(q);GLASS_ART.set(key,cv);c=cv}return c}
// A tower's tint: how much lilac it carries, from its plan (0 = all sky blue).
function glassTint(t){const m=t?.mix??.3,P=glassPal();return{
 glass:glassMix(P.glass,P.lilac,m),glassHi:glassMix(P.glassHi,P.lilacHi,m),glassMid:glassMix(P.glassMid,P.lilacDeep,m),
 glassDeep:glassMix(P.glassDeep,P.lilacGlass,m),floor:glassMix(P.floor[0],P.floor[1],m),floorAlt:glassMix(P.floorAlt[0],P.floorAlt[1],m),seam:glassMix(P.seam[0],P.seam[1],m)}}
// Fill a cell on the device pixel grid. At a fractional zoom an ordinary fillRect leaves anti-aliased edges, and the sky shows through
// them as a faint grid; neighbouring cells snapped to the same rounded edges meet exactly.
function glassFillCell(ctx,px,py,style){
 const m=ctx.getTransform(),x0=Math.round(m.a*px+m.e),y0=Math.round(m.d*py+m.f),x1=Math.round(m.a*(px+32)+m.e),y1=Math.round(m.d*(py+32)+m.f);
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=typeof style==='function'?style(x0,y0,x1,y1):style;ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.restore();
}
function mirrorLayout(){return state?.branchTerrain105?.mirror105||null}
function mirrorZone(x,y){return mirrorLayout()?.zones?.[y]?.[x]||'.'}
function mirrorOwner(x,y){const c=mirrorLayout()?.owner?.[y]?.[x];return c&&c!=='.'?state.branchWorld105?.mirror105?.towers?.[+c]||null:null}
/* ------------------------------------------------------------------ floors */
// zones: r room · c corridor · h hall · a antechamber · P main path · b bridge/causeway · p balcony · d dock · v treasure vault
function glassFloorTile(zone,x,y,t){
 const tint=glassTint(t),motif=t?.motif||'rings',px=x&1,py=y&1,v=hash2(x>>1,y>>1,733)>.62?1:0;
 const key=`f|${zone}|${px}${py}|${v}|${t?.id??'-'}|${motif}`;
 return glassCached(key,32,32,q=>{
  const R=(c,a,b,w,h)=>{q.fillStyle=c;q.fillRect(a,b,w,h)};
  const bridge=zone==='b'||zone==='p'||zone==='d';
  R(zone==='v'?glassMix(v?tint.floorAlt:tint.floor,'#d8b865',.34):bridge?glassMix(tint.floor,'#6c7fb8',.35):v?tint.floorAlt:tint.floor,0,0,32,32);
  // structure under the glass: dark beams every other panel, faint
  q.fillStyle=glassRGBA(glassPal().violetInk,.22);if(px===0)q.fillRect(14,0,4,32);if(py===0)q.fillRect(0,14,32,4);
  q.fillStyle=glassRGBA(glassPal().violetInk,.12);q.fillRect(0,30,32,2);
  // panel seams: two-cell panels in rooms and halls, one-cell in corridors, long planks on bridges and the dock
  const seam=(a,b,w,h)=>{q.fillStyle=glassRGBA(tint.seam,.55);q.fillRect(a,b,w,h);q.fillStyle=glassRGBA(glassPal().violetInk,.35);q.fillRect(a+(w===1?1:0),b+(h===1?1:0),w,h)};
  if(bridge){seam(0,0,32,1);if(zone==='d'){seam(0,16,32,1);q.fillStyle=glassRGBA(glassPal().silverMid,.35);q.fillRect(3,6,2,2);q.fillRect(27,22,2,2)}}
  else if(zone==='c'||zone==='P'){seam(0,0,32,1);seam(0,0,1,32)}
  else{if(py===0)seam(0,0,32,1);if(px===0)seam(0,0,1,32)}
  // the slanted gleam across each panel
  q.fillStyle=glassRGBA(glassPal().glassHi,zone==='r'?.07:.10);
  const off=(px*32+py*32)%64;for(let i=0;i<32;i++){const gx=(i+off)%64-16;if(gx>=0&&gx<32){q.fillRect(gx,31-i,2,1);if(gx+6<32)q.fillRect(gx+6,31-i,1,1)}}
  // zone ornament
  if(zone==='h'&&motif==='stars'&&v){q.fillStyle=glassRGBA(glassPal().glassHi,.35);q.fillRect(15,6,2,2);q.fillRect(6,20,1,1);q.fillRect(25,14,1,1)}
  else if(zone==='a'){q.strokeStyle=glassRGBA(tint.seam,.30);q.lineWidth=1;q.beginPath();q.moveTo(0,16);q.lineTo(16,0);q.lineTo(32,16);q.lineTo(16,32);q.closePath();q.stroke();q.beginPath();q.moveTo(8,16);q.lineTo(16,8);q.lineTo(24,16);q.lineTo(16,24);q.closePath();q.stroke();q.fillStyle=glassRGBA(glassPal().lilac,.25);q.fillRect(15,15,2,2)}
  else if(zone==='r'&&motif==='lattice'&&v){q.fillStyle=glassRGBA(tint.seam,.16);q.fillRect(8,8,16,1);q.fillRect(8,23,16,1);q.fillRect(8,8,1,16);q.fillRect(23,8,1,16)}
  else if(zone==='r'&&motif==='waves'&&v){q.fillStyle=glassRGBA(tint.seam,.16);for(let i=0;i<32;i+=4)q.fillRect(i,18+((i>>2)%2),3,1)}
  if(zone==='v'){q.strokeStyle=glassRGBA('#f2dc9a',.50);q.lineWidth=1;q.strokeRect(5.5,5.5,21,21);q.beginPath();q.moveTo(16,6);q.lineTo(26,16);q.lineTo(16,26);q.lineTo(6,16);q.closePath();q.stroke();q.fillStyle=glassRGBA('#fff2c4',.55);q.fillRect(15,15,2,2)}
  if(zone==='P'){q.fillStyle=glassRGBA(glassPal().lamp,.30);q.fillRect(14,0,4,32);q.fillRect(0,14,32,4);q.fillStyle=glassRGBA('#ffffff',.45);q.fillRect(15,14,2,4);q.fillRect(14,15,4,2)}
 });
}
// The lake under floor 1: deep blue-violet water with the sky's light on it.
function drawGlassLake(ctx,px,py,x,y,now){
 // The lake is real water: the 창해용궁 water, with no tint laid over it.
 glassFillCell(ctx,px,py,'#0d4d6b');
 drawPalaceWater(ctx,px,py,x,y,true,now);
 const shore=(dx,dy)=>{const v=state.map[y+dy]?.[x+dx];return v!=null&&v!==TT.WATER&&v!==TT.RAFT};
 if(shore(0,-1)){const g=ctx.createLinearGradient(0,py,0,py+8);g.addColorStop(0,glassRGBA(glassPal().violetInk,.6));g.addColorStop(1,glassRGBA(glassPal().violetInk,0));ctx.fillStyle=g;ctx.fillRect(px,py,32,8)}
}
/* ------------------------------------------------------------------ walls */
function glassWallFront(kind,x,t,win){
 const tint=glassTint(t),window=t?.window||'arch',pier=kind==='o'&&x%3===0,hasWin=kind==='o'&&win&&x%3===1;
 const key=`w|${kind}|${pier?1:0}|${hasWin?window:'-'}|${t?.id??'-'}`;
 return glassCached(key,32,32,q=>{
  const R=(c,a,b,w,h)=>{q.fillStyle=c;q.fillRect(a,b,w,h)};
  if(kind==='o'){
   // thick glass in section: bright sky-blue at the cap, deepening to blue-violet at the foot
   const g=q.createLinearGradient(0,0,0,32);g.addColorStop(0,tint.glassHi);g.addColorStop(.35,tint.glass);g.addColorStop(1,glassPal().violet);R(g,0,0,32,32);
   R(glassPal().silver,0,0,32,3);R(glassPal().silverDark,0,3,32,1);R(glassRGBA(glassPal().white,.35),0,4,32,1);
   for(let i=8;i<30;i+=7){R(glassRGBA(glassPal().violetInk,.16),0,i,32,1)}
   if(pier){R(glassPal().silverDark,11,3,10,29);R(glassPal().silverMid,12,3,7,29);R(glassPal().silver,12,3,2,29);R(glassPal().silver,9,4,14,2);R(glassRGBA(glassPal().violetInk,.35),19,6,2,26)}
   if(hasWin){
    R(glassPal().silverMid,8,7,16,20);
    q.fillStyle=glassPal().violetInk;q.beginPath();
    if(window==='arch'){q.moveTo(10,26);q.lineTo(10,15);q.arc(16,15,6,Math.PI,0);q.lineTo(22,26)}
    else if(window==='round'){q.arc(16,17,7,0,Math.PI*2)}
    else if(window==='diamond'){q.moveTo(16,8);q.lineTo(23,17);q.lineTo(16,26);q.lineTo(9,17)}
    else{q.rect(13,8,6,18)}
    q.closePath();q.fill();
    q.fillStyle=glassRGBA(glassPal().sky,.55);q.fillRect(window==='slit'?14:12,12,2,9);q.fillStyle=glassRGBA(glassPal().lilac,.35);q.fillRect(window==='slit'?16:18,18,2,6);
   }
   R(glassRGBA(glassPal().violetInk,.6),0,29,32,3);
  }else{
   // an inner wall: lighter framed panes, a slim cap, no windows
   const g=q.createLinearGradient(0,0,0,32);g.addColorStop(0,glassMix(tint.glassMid,glassPal().lilac,.25));g.addColorStop(1,glassMix(tint.glassDeep,glassPal().violet,.45));R(g,0,0,32,32);
   R(glassPal().silverMid,0,0,32,2);R(glassPal().silver,0,0,32,1);
   R(glassRGBA(glassPal().silverMid,.8),0,14,32,1);R(glassRGBA(glassPal().silverMid,.8),x%2?31:0,2,1,28);
   R(glassRGBA(glassPal().white,.18),3,4,2,8);R(glassRGBA(glassPal().white,.10),6,4,1,8);R(glassRGBA(glassPal().white,.10),4,17,2,8);
   R(glassRGBA(glassPal().violetInk,.5),0,29,32,3);
  }
 });
}
// The top of a wall seen from above: a dark glass core with lit edges where it meets open floor.
function drawGlassWallTop(ctx,px,py,x,y,kind,t){
 const tint=glassTint(t),open=(dx,dy)=>{const v=state.map[y+dy]?.[x+dx];return v!=null&&v!==TT.WALL&&state.seen.has(k(x+dx,y+dy))};
 ctx.fillStyle=kind==='o'?glassPal().violetDeep:glassMix(glassPal().violet,tint.glassDeep,.4);ctx.fillRect(px,py,32,32);
 ctx.fillStyle=glassRGBA(tint.glass,kind==='o'?.10:.16);ctx.fillRect(px+4,py+4,24,24);
 const e=kind==='o'?3:2;ctx.fillStyle=tint.glassHi;
 if(open(0,-1))ctx.fillRect(px,py,32,e);if(open(-1,0))ctx.fillRect(px,py,e,32);if(open(1,0))ctx.fillRect(px+32-e,py,e,32);
 ctx.fillStyle=glassPal().silverMid;if(open(-1,0))ctx.fillRect(px+e,py,1,32);if(open(1,0))ctx.fillRect(px+31-e,py,1,32);if(open(0,-1))ctx.fillRect(px,py+e,32,1);
}
function drawGlassDoor(ctx,px,py,x,y,open,t){
 const tint=glassTint(t);
 ctx.drawImage(glassFloorTile('c',x,y,t),px,py);
 const vertical=state.map[y-1]?.[x]===TT.WALL&&state.map[y+1]?.[x]===TT.WALL;
 ctx.fillStyle=glassPal().silverDark;
 if(vertical){ctx.fillRect(px+13,py,6,32);if(!open){ctx.fillStyle=glassRGBA(tint.glass,.75);ctx.fillRect(px+14,py+2,4,28);ctx.fillStyle=glassPal().glassHi;ctx.fillRect(px+14,py+3,1,12)}else{ctx.fillStyle=glassPal().violetInk;ctx.fillRect(px+14,py+2,4,28)}return}
 ctx.fillStyle=glassPal().silver;ctx.fillRect(px+1,py+2,4,30);ctx.fillRect(px+27,py+2,4,30);ctx.fillRect(px+1,py,30,4);
 if(open){ctx.fillStyle=glassRGBA(glassPal().violetInk,.75);ctx.fillRect(px+5,py+4,22,28)}
 else{const g=ctx.createLinearGradient(px,py+4,px,py+32);g.addColorStop(0,tint.glassHi);g.addColorStop(1,tint.glassDeep);ctx.fillStyle=g;ctx.fillRect(px+5,py+4,22,28);ctx.fillStyle=glassPal().silverMid;ctx.fillRect(px+15,py+4,2,28);ctx.fillStyle=glassRGBA(glassPal().white,.45);ctx.fillRect(px+7,py+6,2,12);ctx.fillRect(px+19,py+6,2,12)}
}
// A bridge or balcony slab: rails along the drop and the slab's own thickness on its south edge.
function drawGlassBridgeEdges(ctx,px,py,x,y){
 const drop=(dx,dy)=>{const v=state.map[y+dy]?.[x+dx];return v===TT.VOID||v===TT.WATER};
 if(drop(0,1)){const g=ctx.createLinearGradient(0,py+24,0,py+32);g.addColorStop(0,glassPal().silverMid);g.addColorStop(1,glassPal().violet);ctx.fillStyle=g;ctx.fillRect(px,py+25,32,7);ctx.fillStyle=glassPal().silver;ctx.fillRect(px,py+24,32,1)}
 for(const[dx,dy,side]of[[0,-1,'n'],[-1,0,'w'],[1,0,'e'],[0,1,'s']]){
  if(!drop(dx,dy))continue;ctx.fillStyle=glassPal().silverDark;
  if(side==='n'){ctx.fillRect(px,py+1,32,2);ctx.fillStyle=glassPal().silver;ctx.fillRect(px,py,32,1);for(let i=4;i<32;i+=12){ctx.fillStyle=glassPal().silverMid;ctx.fillRect(px+i,py,3,6)}}
  else if(side==='s'){ctx.fillStyle=glassPal().silverMid;for(let i=4;i<32;i+=12)ctx.fillRect(px+i,py+16,3,8);ctx.fillStyle=glassPal().silver;ctx.fillRect(px,py+16,32,2)}
  else{const a=side==='w'?px:px+29;ctx.fillRect(a,py,3,32);ctx.fillStyle=glassPal().silver;ctx.fillRect(side==='w'?a:a+2,py,1,32);for(let i=6;i<32;i+=12){ctx.fillStyle=glassPal().silverMid;ctx.fillRect(a-1,py+i,5,3)}}
 }
}
// The moving platform (state.rafts entry) that covers a cell, if any. Its footprint cells are offsets from its anchor.
function glassPlatformAt(x,y){
 for(const r of state.rafts||[]){if(!r.mirrorRaft105||Math.abs(x-r.x)>6||Math.abs(y-r.y)>6)continue;const dx=x-r.x,dy=y-r.y;if(r.footprintCells57.some(o=>o[0]===dx&&o[1]===dy))return r}
 return null;
}
// One cell of a moving platform. Its own edges get a rim, its south edge the deck's thickness, its inner seams stay thin, so
// the cells read as one slab. The design sets the inlay: rings (slab), a runner and prows (barge), checkers (terrace),
// a star disc (deck), petals (plus), panels (wide).
function drawGlassPlatformCell(ctx,px,py,x,y,r){
 const P=glassPal(),rx=x-r.x,ry=y-r.y,has=(dx,dy)=>r.footprintCells57.some(o=>o[0]===rx+dx&&o[1]===ry+dy);
 const n=has(0,-1),s=has(0,1),w=has(-1,0),e=has(1,0),cells=r.footprintCells57,cx=cells.reduce((a,o)=>a+o[0],0)/cells.length,cy=cells.reduce((a,o)=>a+o[1],0)/cells.length;
 const hue={slab:[P.glassHi,P.glass],slab3:[P.glassHi,P.glassMid],barge:[P.glassMid,P.glassDeep],terrace:[P.lilacHi,P.lilac],deck:[P.glass,P.glassDeep],plus:[P.lilacHi,P.lilacDeep],wide:[P.glassHi,P.lilac]}[r.design]||[P.glassHi,P.glass];
 const g=ctx.createLinearGradient(px,py,px+32,py+32);g.addColorStop(0,hue[0]);g.addColorStop(1,hue[1]);ctx.fillStyle=g;ctx.fillRect(px,py,32,32);
 ctx.fillStyle=glassRGBA(P.white,.14);ctx.fillRect(px+((x*5)%18),py+3,9,1);
 // inlay
 ctx.save();ctx.beginPath();ctx.rect(px,py,32,32);ctx.clip();
 const ox=(cx-rx)*32+16,oy=(cy-ry)*32+16;ctx.lineWidth=1;
 if(r.design==='slab'||r.design==='slab3'||r.design==='deck'||r.design==='plus'){
  for(const[rad,a]of[[30,.5],[20,.4],[10,.3]]){ctx.strokeStyle=glassRGBA(P.silver,a);ctx.beginPath();ctx.arc(px+ox,py+oy,rad,0,Math.PI*2);ctx.stroke()}
  if(r.design==='deck'||r.design==='plus'){ctx.strokeStyle=glassRGBA(P.silver,.3);ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.moveTo(px+ox+Math.cos(a)*10,py+oy+Math.sin(a)*10);ctx.lineTo(px+ox+Math.cos(a)*34,py+oy+Math.sin(a)*34)}ctx.stroke()}
 }else if(r.design==='barge'){
  const lane=r.axis==='x'?ry===0:rx===0;if(lane){ctx.fillStyle=glassRGBA(P.violet,.45);ctx.fillRect(px,py,32,32);ctx.fillStyle=glassRGBA(P.lamp,.5);if(r.axis==='x'){ctx.fillRect(px,py+14,32,2)}else ctx.fillRect(px+14,py,2,32)}
 }else if(r.design==='terrace'||r.design==='wide'){
  if((rx+ry)%2===0){ctx.fillStyle=glassRGBA(P.white,.18);ctx.fillRect(px,py,32,32)}ctx.strokeStyle=glassRGBA(P.silverMid,.5);ctx.strokeRect(px+.5,py+.5,31,31);
 }
 ctx.restore();
 // thin seams towards neighbours of the same deck
 ctx.fillStyle=glassRGBA(P.silverMid,.28);if(n)ctx.fillRect(px,py,32,1);if(w)ctx.fillRect(px,py,1,32);
 // rim on every outer side, thickness under the south edge, rail posts on the barge and the terraces
 ctx.fillStyle=P.silver;if(!n)ctx.fillRect(px,py,32,3);if(!w)ctx.fillRect(px,py,3,32);if(!e)ctx.fillRect(px+29,py,3,32);
 ctx.fillStyle=glassRGBA(P.white,.6);if(!n)ctx.fillRect(px,py,32,1);
 if(!s){const u=ctx.createLinearGradient(0,py+22,0,py+32);u.addColorStop(0,P.silverMid);u.addColorStop(1,P.violet);ctx.fillStyle=u;ctx.fillRect(px,py+22,32,10);ctx.fillStyle=P.silver;ctx.fillRect(px,py+22,32,2);ctx.fillStyle=glassRGBA(P.violetInk,.45);for(let i=4;i<32;i+=8)ctx.fillRect(px+i,py+25,2,5)}
 if(r.design==='barge'||r.design==='terrace'||r.design==='deck'){ctx.fillStyle=P.silverDark;if(!n)for(let i=3;i<32;i+=10)ctx.fillRect(px+i,py+3,3,6);if(!w)for(let i=4;i<24;i+=10)ctx.fillRect(px+3,py+i,5,3);if(!e)for(let i=4;i<24;i+=10)ctx.fillRect(px+24,py+i,5,3)}
 // prows: the ends of a barge along its travel come to a point
 if(r.design==='barge'){const ends=r.axis==='x'?(!w||!e):(!n||!s);if(ends){ctx.fillStyle=glassRGBA(P.lamp,.6);ctx.beginPath();if(r.axis==='x'){ctx.moveTo(px+(!w?4:28),py+16);ctx.lineTo(px+(!w?12:20),py+10);ctx.lineTo(px+(!w?12:20),py+22)}else{ctx.moveTo(px+16,py+(!n?4:20));ctx.lineTo(px+10,py+(!n?12:12));ctx.lineTo(px+22,py+(!n?12:12))}ctx.closePath();ctx.fill()}}
}
// Cell painter, called for every seen cell of the tower floors.
// A leaf over the void: lily-pad green against the pink sky, notched, veined, with a faint shadow far below it.
function drawGlassLeaf(ctx,px,py,x,y,now){
 const h=hash2(x,y,771),bob=Math.sin(now/700+x*1.7+y*.9)*1.1,armed=!!hz()?.armed?.[k(x,y)],rot=(h-.5)*1.2;
 ctx.save();ctx.fillStyle=glassRGBA(glassPal().violetInk,.20);ctx.beginPath();ctx.ellipse(px+17,py+27,11,3,0,0,Math.PI*2);ctx.fill();
 ctx.translate(px+16,py+16+bob);ctx.rotate(rot);
 const g=ctx.createRadialGradient(-3,-3,2,0,0,14);g.addColorStop(0,armed?'#d9c27a':'#b4d28f');g.addColorStop(.55,armed?'#a89458':'#6f9e6a');g.addColorStop(1,armed?'#6b5a35':'#3d6149');
 ctx.fillStyle='#233a31';ctx.beginPath();ctx.ellipse(0,0,14.5,11.5,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,13.2,10.3,0,.22,Math.PI*2-.22);ctx.lineTo(0,0);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(222,240,186,.65)';ctx.lineWidth=1;for(let i=0;i<6;i++){const a=.6+i*1.0;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*11.5,Math.sin(a)*8.8);ctx.stroke()}
 ctx.fillStyle='rgba(255,255,255,.30)';ctx.beginPath();ctx.ellipse(-4,-4,5,2.2,-.5,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
// Height: under every tower (never under a bridge, ledge or leaf) the sky thickens into a murky, fading haze that thins out with the drop.
const GLASS_HAZE_DEPTH=14;
function drawGlassAltitudeHaze(ctx,px,py,x,y){
 // how far this cell hangs below a tower, straight down its own column; bridges, ledges and leaves cut the column, and nothing spreads sideways
 let d=0,tower=null;
 for(let i=1;i<=GLASS_HAZE_DEPTH;i++){
  const v=state.map[y-i]?.[x];if(v==null)break;if(v===TT.VOID||v===TT.WATER)continue;
  const t=mirrorOwner(x,y-i);if(t){d=i;tower=t}
  break;
 }
 if(!d||d>GLASS_HAZE_DEPTH)return;
 // The tower's own glass carries on downward: the wall foot's deep violet, then the tower's tint, then the floor's low sky, thinning to nothing.
 const P=glassPal(),tint=glassTint(tower),t=n=>Math.max(0,Math.min(1,n/GLASS_HAZE_DEPTH));
 const tone=n=>{const u=t(n);return u<.3?glassMix(P.violet,tint.glassDeep,u/.3):u<.65?glassMix(tint.glassDeep,glassMix(tint.glassMid,P.skyLow,.5),(u-.3)/.35):glassMix(glassMix(tint.glassMid,P.skyLow,.5),P.sky,(u-.65)/.35)};
 const f=n=>Math.pow(1-t(n),1.2)*.88;
 glassFillCell(ctx,px,py,(x0,y0,x1,y1)=>{const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,glassRGBA(tone(d-1),f(d-1)));g.addColorStop(1,glassRGBA(tone(d),f(d)));return g});
 // the wall's piers and window glints continue as faint pale shafts straight below the tower
 if(x%3===0){ctx.fillStyle=glassRGBA(P.silverMid,.30*(1-t(d))**2);ctx.fillRect(px+12,py,7,32);ctx.fillStyle=glassRGBA(P.silver,.35*(1-t(d))**2);ctx.fillRect(px+12,py,2,32)}
 // thin streaks of mist, sparser the further down
 const h=hash2(x,y,913);if(h>.55){ctx.fillStyle=glassRGBA(P.glassHi,.22*(1-t(d)));ctx.fillRect(px+Math.floor(h*13),py+8+Math.floor(h*9),14+Math.floor(h*10),1)}
}
function drawGlassTowerCell(t,px,py,x,y){
 const layout=mirrorLayout();if(!layout)return false;
 const ctx=X,tower=mirrorOwner(x,y),zone=mirrorZone(x,y),now=FX.frameNow||performance.now();
 // the lake carries the same altitude haze under a tower as the open sky does on the floors above
 if(t===TT.VOID||t===TT.WATER){if(t===TT.WATER||state.branchContext105.level===1)drawGlassLake(ctx,px,py,x,y,now);drawGlassAltitudeHaze(ctx,px,py,x,y);return true}
 const deck=(t===TT.RAFT||t===MIRROR_CARGO_TILE)?glassPlatformAt(x,y):null;
 if(deck){if(deck.under!==TT.VOID)drawGlassLake(ctx,px,py,x,y,now);drawGlassPlatformCell(ctx,px,py,x,y,deck);return true}
 if(t===TT.WALL){
  const kind=zone==='i'?'i':'o',below=state.map[y+1]?.[x];
  if(below!=null&&below!==TT.WALL&&state.seen.has(k(x,y+1))){ctx.drawImage(glassWallFront(kind,x,tower,true),px,py);const open=dx=>{const v=state.map[y]?.[x+dx];return v!=null&&v!==TT.WALL};ctx.fillStyle=glassPal().silver;if(open(-1))ctx.fillRect(px,py,2,32);if(open(1))ctx.fillRect(px+30,py,2,32)}
  else drawGlassWallTop(ctx,px,py,x,y,kind,tower);
  return true;
 }
 if(t===TT.DOOR||t===TT.OPEN_DOOR){drawGlassDoor(ctx,px,py,x,y,t===TT.OPEN_DOOR,tower);return true}
 if(t===TT.PAPER_BRIDGE&&branchLeafAt(x,y)){drawGlassLeaf(ctx,px,py,x,y,now);return true}
 ctx.drawImage(glassFloorTile(zone==='.'?'r':zone,x,y,tower),px,py);
 if((zone==='h'||zone==='P')&&tower&&mirrorTowerContains(tower,x,y,2))drawGlassMedallion(ctx,px,py,tower);
 if(zone==='b'||zone==='p'||zone==='d')drawGlassBridgeEdges(ctx,px,py,x,y);
 drawGlassRiser(ctx,px,py,x,y,tower);
 // shadow cast by a wall standing to the north
 if(state.map[y-1]?.[x]===TT.WALL){const g=ctx.createLinearGradient(0,py,0,py+10);g.addColorStop(0,glassRGBA(glassPal().violetInk,.45));g.addColorStop(1,glassRGBA(glassPal().violetInk,0));ctx.fillStyle=g;ctx.fillRect(px,py,32,10)}
 if(t===TT.FLOOR||t===TT.STONE_PILLAR)return true;
 // portals and other interactive tiles keep their own drawing on the glass floor
 drawSpecialTerrain(t,px,py,x,y,now);
 return true;
}
// The hall medallion: concentric silver rings and rays centred on the tower, continuous across tiles.
function drawGlassMedallion(ctx,px,py,t){
 const cx=t.cx*32+16,cy=t.cy*32+16,tint=glassTint(t);
 ctx.save();ctx.beginPath();ctx.rect(px,py,32,32);ctx.clip();ctx.lineWidth=1;
 for(const[r,a]of[[40,.42],[72,.30],[104,.22]]){ctx.strokeStyle=glassRGBA(tint.seam,a);ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}
 ctx.strokeStyle=glassRGBA(tint.seam,.18);ctx.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.moveTo(cx+Math.cos(a)*40,cy+Math.sin(a)*40);ctx.lineTo(cx+Math.cos(a)*104,cy+Math.sin(a)*104)}ctx.stroke();
 const g=ctx.createRadialGradient(cx,cy,4,cx,cy,40);g.addColorStop(0,glassRGBA(glassPal().glassHi,.22));g.addColorStop(1,glassRGBA(glassPal().glassHi,0));ctx.fillStyle=g;ctx.fillRect(px,py,32,32);
 ctx.restore();
}
// A raised dais (branchTerrain105.heights): glass riser on its south face, silver-nosed steps where the plan puts stairs.
function drawGlassRiser(ctx,px,py,x,y,t){
 const ter=state.branchTerrain105,h=ter.heights?.[y]?.[x]??0,south=ter.heights?.[y+1]?.[x]??0;if(h<=south)return;
 const tint=glassTint(t),rise=Math.min(22,(h-south)*12),top=py+32-rise;
 if(ter.mirror105?.stairs?.[k(x,y)]){const n=Math.max(2,Math.round(rise/5));for(let i=0;i<n;i++){const a=top+Math.floor(i*rise/n),b=top+Math.floor((i+1)*rise/n);ctx.fillStyle=glassPal().silver;ctx.fillRect(px,a,32,1);ctx.fillStyle=i%2?tint.glassMid:tint.glass;ctx.fillRect(px,a+1,32,b-a-1)}return}
 const g=ctx.createLinearGradient(0,top,0,py+32);g.addColorStop(0,tint.glassHi);g.addColorStop(1,glassPal().violet);ctx.fillStyle=g;ctx.fillRect(px,top,32,rise);
 ctx.fillStyle=glassPal().silver;ctx.fillRect(px,top,32,2);ctx.fillStyle=glassRGBA(glassPal().violetInk,.35);for(let i=7;i<32;i+=8)ctx.fillRect(px+i,top+3,1,rise-3);
}
/* ------------------------------------------------------------------ furniture */
const GLASS_FURNITURE=Object.freeze({
 orrery:{w:2,h:2,up:30,name:'회전 거울',desc:'은테 위에 큰 타원 거울이 천천히 돈다. 비친 하늘이 실제보다 한 박자 늦게 지나간다.'},
 telescope:{w:2,h:2,up:22,name:'관측기',desc:'은빛 삼각대 위의 긴 망원 관. 경통 끝에 낀 렌즈가 구름 너머를 향해 있다.'},
 star_table:{w:2,h:1,up:8,name:'성도 탁자',desc:'유리판 아래에 별자리 지도가 끼워져 있다. 탑의 위치가 은침으로 표시되어 있다.'},
 cabinet:{w:1,h:1,up:34,name:'유리 장식장',desc:'은테 유리문 너머로 크고 작은 결정과 거울 조각이 진열되어 있다.'},
 pedestal:{w:1,h:1,up:20,name:'진열 받침대',desc:'층층이 깎은 은 받침 위에 맑은 결정 하나가 떠 있다.'},
 showcase:{w:2,h:1,up:12,name:'진열장',desc:'낮은 유리 상자 안에 깨진 거울 파편들이 이름표와 함께 놓여 있다.'},
 shelf:{w:2,h:1,up:36,name:'은테 서가',desc:'은테를 두른 유리 선반에 푸른 표지의 책들이 빽빽이 꽂혀 있다.'},
 lectern:{w:1,h:1,up:16,name:'열람대',desc:'펼쳐진 책 위에 빛이 고여 있다. 글자가 거울처럼 뒤집혀 있다.'},
 reading_table:{w:2,h:1,up:10,name:'열람 탁자',desc:'유리 상판의 긴 탁자. 책 더미와 작은 등이 놓여 있다.'},
 column:{w:1,h:1,up:30,name:'유리 기둥',desc:'은빛 주두와 받침 사이를 두꺼운 유리 원기둥이 잇는다. 안쪽으로 빛이 흐른다.'},
 lamp:{w:1,h:1,up:24,name:'유리 등',desc:'은 기둥 끝의 유리 등. 길을 따라 하나씩 불이 켜져 있다.'},
 bench:{w:2,h:1,up:6,name:'유리 벤치',desc:'구름을 내다보도록 놓인 긴 의자.'},
 crown_mirror:{w:3,h:1,up:46,name:'천면경 틀',desc:'정상에 세운 거대한 거울 틀. 천 개의 조각이 저마다 다른 하늘을 비춘다.'}
});
function glassFurnitureSprite(kind,t,frame=0){
 const spec=GLASS_FURNITURE[kind],W=spec.w*32,H=spec.h*32+spec.up,tint=glassTint(t);
 return glassCached(`o|${kind}|${t?.id??'-'}|${frame}`,W,H+8,q=>{
  const R=(c,a,b,w,h)=>{q.fillStyle=c;q.fillRect(a,b,w,h)},base=H;
  // cast shadow on the glass floor
  q.fillStyle=glassRGBA(glassPal().violetInk,.38);q.beginPath();q.ellipse(W/2+3,base-5,W/2-3,6,0,0,Math.PI*2);q.fill();
  const S=glassPal().silver,SM=glassPal().silverMid,SD=glassPal().silverDark,G=tint.glass,GH=tint.glassHi,GD=tint.glassDeep,I=glassPal().violetInk;
  if(kind==='column'){R(SD,6,base-8,20,6);R(S,7,base-8,18,2);R(SD,9,6,14,base-14);const g=q.createLinearGradient(9,0,23,0);g.addColorStop(0,GH);g.addColorStop(.5,G);g.addColorStop(1,GD);R(g,10,8,12,base-16);R(glassRGBA(glassPal().white,.55),12,10,2,base-22);R(SD,6,2,20,6);R(S,7,2,18,2);R(SM,8,6,16,2)}
  else if(kind==='lamp'){R(SD,14,10,4,base-14);R(S,14,10,1,base-14);R(SD,9,base-6,14,4);R(S,10,base-6,12,1);R(SM,8,8,16,3);q.fillStyle=glassRGBA(glassPal().lamp,.9);q.beginPath();q.moveTo(10,8);q.lineTo(16,0);q.lineTo(22,8);q.closePath();q.fill();R(glassPal().white,15,3,2,4)}
  else if(kind==='cabinet'){R(SD,2,4,28,base-6);R(S,3,4,26,2);const g=q.createLinearGradient(0,6,0,base-4);g.addColorStop(0,GH);g.addColorStop(1,GD);R(g,4,7,24,base-12);for(const yy of[16,29,42,55].filter(v=>v<base-6)){R(SM,4,yy,24,2);R(glassPal().gem[(yy>>3)%4],8+(yy%3)*5,yy-6,4,6);R(glassRGBA(glassPal().white,.6),18,yy-4,3,4)}R(SM,15,7,2,base-12);R(glassRGBA(glassPal().white,.35),6,9,2,base-18);R(S,0,1,32,4);R(SD,0,5,32,1)}
  else if(kind==='pedestal'){R(SD,6,base-8,20,6);R(S,7,base-8,18,1);R(SM,9,base-16,14,8);R(S,9,base-16,14,1);R(SD,11,base-22,10,6);const glow=q.createRadialGradient(16,6,1,16,6,9);glow.addColorStop(0,glassRGBA('#ffffff',.9));glow.addColorStop(1,glassRGBA(glassPal().lilac,0));q.fillStyle=glow;q.fillRect(5,0,22,14);q.fillStyle='#e8d8ff';q.beginPath();q.moveTo(16,1+frame);q.lineTo(21,7+frame);q.lineTo(16,13+frame);q.lineTo(11,7+frame);q.closePath();q.fill();R(glassPal().white,14,4+frame,2,4)}
  else if(kind==='showcase'){R(SD,2,base-22,W-4,20);R(S,2,base-22,W-4,2);const g=q.createLinearGradient(0,base-20,0,base-4);g.addColorStop(0,GH);g.addColorStop(1,G);R(g,4,base-19,W-8,14);for(let i=0;i<4;i++){R(glassPal().gem[i],10+i*13,base-12,6,3);R(SD,9+i*13,base-9,8,1)}R(glassRGBA(glassPal().white,.45),6,base-18,W-14,1);R(SD,4,base-4,4,4);R(SD,W-8,base-4,4,4)}
  else if(kind==='shelf'){R(SD,1,2,W-2,base-4);R(S,1,2,W-2,2);R(I,3,6,W-6,base-12);const P=glassPal(),cols=[P.glass,P.lilac,P.silver,P.glassMid,P.lilacDeep,P.lamp];for(const yy of[8,20,32].filter(v=>v<base-10)){let xx=4;let i=(yy+xx)%6;while(xx<W-6){const w=2+((xx*7+yy)%3);R(cols[i%6],xx,yy,w,10);R(glassRGBA(glassPal().white,.25),xx,yy+1,1,8);xx+=w+1;i++}R(SM,3,yy+10,W-6,2)}R(S,0,0,W,3);R(SD,0,3,W,1);R(SM,W/2-1,4,2,base-8)}
  else if(kind==='lectern'){R(SD,14,base-18,4,14);R(SD,8,base-6,16,3);R(S,9,base-6,14,1);q.fillStyle=SM;q.beginPath();q.moveTo(4,base-16);q.lineTo(28,base-16);q.lineTo(25,base-24);q.lineTo(7,base-24);q.closePath();q.fill();R('#f3efff',7,base-23,8,6);R('#f3efff',17,base-23,8,6);R(SD,16,base-23,1,6);R(glassRGBA('#bff4ff',.65),9,base-21,5,1);R(glassRGBA('#bff4ff',.65),18,base-20,5,1)}
  else if(kind==='reading_table'||kind==='star_table'||kind==='bench'){const top=kind==='bench'?base-12:base-18;R(SD,4,top+4,4,base-top-6);R(SD,W-8,top+4,4,base-top-6);const g=q.createLinearGradient(0,top-2,0,top+6);g.addColorStop(0,GH);g.addColorStop(1,G);R(S,1,top-2,W-2,2);R(g,1,top,W-2,6);R(SD,1,top+6,W-2,1);
   if(kind==='star_table'){R(I,6,top+1,W-12,4);for(let i=0;i<9;i++)R(i%3?'#e8f4ff':'#f6c8ff',8+(i*11)%(W-16),top+1+(i%3),1,1);R(S,W/2,top+2,1,1)}
   else if(kind==='reading_table'){R(glassPal().lilacDeep,8,top-6,8,4);R(glassPal().glass,9,top-9,7,3);R(glassPal().silver,W-20,top-4,10,2);R(SD,W-14,top-12,2,8);q.fillStyle=glassRGBA('#bff4ff',.85);q.fillRect(W-17,top-15,8,4)}}
  else if(kind==='telescope'){
   // a brass-and-silver telescope on a splayed tripod: legs from a hub plate, a yoke, a tube in telescoping sections aimed up
   const hx=30,hy=base-34,P=glassPal();
   const leg=(x1,y1,w)=>{q.strokeStyle=SD;q.lineWidth=w+1;q.lineCap='round';q.beginPath();q.moveTo(hx,hy);q.lineTo(x1,y1);q.stroke();q.strokeStyle=SM;q.lineWidth=w-1;q.beginPath();q.moveTo(hx-1,hy);q.lineTo(x1-1,y1);q.stroke();q.strokeStyle=S;q.lineWidth=1;q.beginPath();q.moveTo(hx-2,hy);q.lineTo(x1-2,y1);q.stroke()};
   leg(10,base-4,3);leg(50,base-6,3);leg(33,base-1,3);
   for(const[fx,fy]of[[10,base-4],[50,base-6],[33,base-1]]){R(SD,fx-2,fy,5,2)}
   R(SD,hx-9,hy-3,18,6);R(SM,hx-9,hy-3,18,2);R(S,hx-9,hy-3,18,1);R(SD,hx-3,hy+3,6,3);
   // yoke
   R(SD,hx-6,hy-12,3,10);R(SD,hx+4,hy-12,3,10);R(SM,hx-6,hy-12,1,10);
   q.save();q.translate(hx,hy-10);q.rotate(-.62);
   const seg=(x0,x1,h)=>{const g=q.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,S);g.addColorStop(.35,SM);g.addColorStop(1,SD);q.fillStyle=g;q.fillRect(x0,-h/2,x1-x0,h);q.fillStyle=glassRGBA(P.white,.5);q.fillRect(x0,-h/2,x1-x0,1)};
   seg(-15,-6,5);seg(-6,8,8);seg(8,24,11);seg(24,40,14);
   // rings between the sections and a brass rim round the objective
   for(const x of[-6,8,24]){q.fillStyle=glassPal().lilacDeep;q.fillRect(x-1,-8,2,16)}
   q.fillStyle=P.silverDark;q.fillRect(40,-9,4,18);q.fillStyle=P.silver;q.fillRect(40,-9,4,2);
   const lens=q.createLinearGradient(44,-7,47,7);lens.addColorStop(0,P.glassHi);lens.addColorStop(1,P.glass);q.fillStyle=lens;q.fillRect(44,-7,3,14);
   // eyepiece cap and a small finder scope riding on the tube
   q.fillStyle=P.silverDark;q.fillRect(-18,-3,3,6);q.fillStyle=P.violetInk;q.fillRect(-19,-2,1,4);
   q.fillStyle=P.silverDark;q.fillRect(12,-12,2,5);q.fillRect(26,-12,2,5);q.translate(0,-15);seg(8,32,4);q.restore();
   // a glint on the objective
   R(glassRGBA(P.white,.9),hx+Math.round(Math.cos(-.62)*45)-1,hy-10+Math.round(Math.sin(-.62)*45)-3,2,2);
  }
  else if(kind==='orrery'){R(SD,8,base-12,W-16,8);R(S,9,base-12,W-18,2);R(SM,14,base-20,W-28,8);R(SD,10,base-60,3,48);R(SD,W-13,base-60,3,48);R(S,10,base-60,1,48);const sw=Math.max(4,Math.round(Math.abs(Math.cos(frame*Math.PI/6))*20));q.fillStyle=SD;q.beginPath();q.ellipse(W/2,base-40,sw+3,20,0,0,Math.PI*2);q.fill();const g=q.createLinearGradient(W/2-sw,base-60,W/2+sw,base-20);g.addColorStop(0,glassPal().sky);g.addColorStop(.5,GH);g.addColorStop(1,glassPal().lilac);q.fillStyle=g;q.beginPath();q.ellipse(W/2,base-40,sw,17,0,0,Math.PI*2);q.fill();R(glassRGBA(glassPal().white,.7),W/2-Math.round(sw/2),base-52,2,10)}
  else if(kind==='crown_mirror'){R(SD,4,6,W-8,base-10);R(S,4,6,W-8,3);const g=q.createLinearGradient(0,10,0,base-6);g.addColorStop(0,glassPal().sky);g.addColorStop(.6,glassPal().lilac);g.addColorStop(1,GD);R(g,8,10,W-16,base-18);q.strokeStyle=glassRGBA(glassPal().white,.7);q.lineWidth=1;q.beginPath();for(const[a,b,c,d]of[[30,12,46,40],[46,40,28,70],[46,40,70,30],[46,40,62,74],[20,40,46,40]]){q.moveTo(a,b);q.lineTo(c,d)}q.stroke();R(S,0,0,W,6);R(SM,W/2-6,0,12,10);R('#f6c8ff',W/2-2,1,4,4)}
 });
}
function drawGlassFurniture(b,now){
 const layout=mirrorLayout();if(!layout)return;
 const carried=[];for(const r of state.rafts||[])for(const o of r.objects||[])carried.push({kind:o.kind,x:r.x+o.dx,y:r.y+o.dy,w:o.w,h:o.h,tower:null});
 for(const o of [...(layout.objects||[]),...carried]){
  if(o.x+o.w<b.x0-1||o.x>b.x1+1||o.y<b.y0-1||o.y-2>b.y1+1)continue;
  let seen=false;for(let dy=0;dy<o.h&&!seen;dy++)for(let dx=0;dx<o.w;dx++)if(state.seen.has(k(o.x+dx,o.y+dy))){seen=true;break}if(!seen)continue;
  const spec=GLASS_FURNITURE[o.kind],t=state.branchWorld105?.mirror105?.towers?.[o.tower]??null,frame=o.kind==='orrery'?Math.floor(now/180)%12:o.kind==='pedestal'?Math.floor(now/400)%2:0;
  const art=glassFurnitureSprite(o.kind,t,frame),vis=state.visible.has(k(o.x,o.y+o.h-1));
  const baseY=(o.y+o.h)*TILE,ox=o.x*TILE,sh=art.height-8;
  X.save();if(!vis)X.globalAlpha=.55;X.drawImage(art,ox,baseY-sh);
  // a faint reflection of the piece on the glass in front of it
  X.globalAlpha*=.13;X.translate(0,baseY*2);X.scale(1,-1);X.drawImage(art,0,sh-16,art.width,16,ox,baseY-16,art.width,16);X.restore();
 }
}
/* ------------------------------------------------------------------ sky */
function glassCloudTile(layer){
 return glassCached('sky|'+(state?.branchContext105?.level||1)+'|'+layer,512,256,q=>{
  const P=glassPal(),tones=layer===0?[glassMix(P.sky,'#ffffff',.3),P.sky,P.skyMid]:layer===1?[glassMix(P.sky,'#ffffff',.7),glassMix(P.sky,'#ffffff',.2),glassMix(P.skyMid,P.skyLow,.4)]:['#ffffff',glassMix(P.sky,'#ffffff',.5),P.skyLow];
  const n=layer===0?7:layer===1?5:3,size=layer===0?[22,40]:layer===1?[26,46]:[30,54];
  for(let i=0;i<n;i++){
   const cx=hash2(i,layer,511)*512,cy=40+hash2(layer,i,512)*170,r=size[0]+hash2(i,i+layer,513)*(size[1]-size[0]);
   const puffs=[];for(let j=0;j<6;j++)puffs.push([cx+(j-2.5)*r*.55,cy+Math.sin(j*1.7+i)*r*.22,r*(.55+hash2(i,j,514)*.4)]);
   for(const[dx,shade]of[[0,2],[0,1],[0,0]]){q.fillStyle=tones[shade];for(const[px,py,pr]of puffs)for(const wrap of[-512,0,512]){q.beginPath();q.arc(Math.round(px+wrap+dx),Math.round(py+(shade===2?pr*.35:shade===1?pr*.12:-pr*.08)),Math.round(pr*(shade===0?.82:1)),0,Math.PI*2);q.fill()}}
  }
 });
}
// The common sky sits behind the terrain and fog on every floor.
function drawGlassSky(cam,now){
 const level=state?.branchContext105?.level||1;
 const P=glassPal(),W=VIEW.w,H=VIEW.h,g=X.createLinearGradient(0,0,0,H);
 g.addColorStop(0,P.sky);g.addColorStop(.55,P.skyMid);g.addColorStop(1,P.skyLow);X.fillStyle=g;X.fillRect(0,0,W,H);
 const layers=[[0,.18,.004,.55],[1,.38,.010,.62],[2,.62,.018,.72]];
 const drawLayer=([layer,par,drift,alpha])=>{const tile=glassCloudTile(layer),ox=((cam.x*par+now*drift)%512+512)%512,oy=((cam.y*par)%256+256)%256;X.save();X.globalAlpha=alpha;for(let y=-oy-256;y<H;y+=256)for(let x=-ox-512;x<W;x+=512)X.drawImage(tile,Math.round(x),Math.round(y));X.restore()};
 drawLayer(layers[0]);
 // lower towers: smaller, bluer and softer the further below they stand
 const plan=state.branchWorld105?.mirror105;
 for(const t of plan?.towers||[]){if(t.height>=level)continue;const depth=level-t.height,scale=depth===1?.36:.24,par=depth===1?.55:.4,z=cam.zoom||1;
  // a point far below drifts towards the screen centre: its offset from the centre shrinks with depth
  const sx=W/2+(cam.x+(t.cx*TILE+16)*z-W/2)*par,sy=H/2+(cam.y+(t.cy*TILE+16)*z-H/2)*par,rw=t.rx*TILE*z*scale,rh=t.ry*TILE*z*scale;
  X.save();X.globalAlpha=depth===1?.95:.75;const tint=glassTint(t),haze=.35+depth*.15;
  // the body falling away below the roof, then the roof: rim, glass sectors, ribs and a silver crown
  const body=X.createLinearGradient(0,sy,0,sy+rh*2.2);body.addColorStop(0,glassMix(tint.glassMid,glassPal().skyLow,haze));body.addColorStop(1,'rgba(143,169,230,0)');X.fillStyle=body;X.fillRect(sx-rw,sy,rw*2,rh*2.2);
  X.fillStyle=glassMix(glassPal().silverMid,glassPal().skyMid,haze);X.beginPath();X.ellipse(sx,sy,rw+2,rh+2,0,0,Math.PI*2);X.fill();
  for(let i=0;i<8;i++){X.fillStyle=glassMix(i%2?tint.glassHi:tint.glass,glassPal().skyMid,haze);X.beginPath();X.moveTo(sx,sy);X.ellipse(sx,sy,rw,rh,0,i*Math.PI/4,(i+1)*Math.PI/4);X.closePath();X.fill()}
  X.fillStyle=glassMix(glassPal().silver,glassPal().sky,haze);X.fillRect(sx-2,sy-rh*.9,4,rh*.9);X.beginPath();X.arc(sx,sy-rh*.9,3,0,Math.PI*2);X.fill();
  X.restore();
}
 drawLayer(layers[1]);drawLayer(layers[2]);
}
/* ------------------------------------------------------------------ tower bodies */
function glassTowerColumns(t){const cols=[];for(let x=t.cx-t.rx;x<=t.cx+t.rx;x++){let top=null,bottom=null;for(let y=t.cy-t.ry;y<=t.cy+t.ry;y++)if(mirrorTowerContains(t,x,y)){top??=y;bottom=y}if(top!=null)cols.push({x,top,bottom})}return cols}
// One course of a tower's outer face. The face is read as storeys: a window course and a band course alternate, silver
// piers run down every fourth column, and the glass fades from sky blue at the top to blue-violet at the foot.
function glassFaceColour(t,d){const tint=glassTint(t);return d<.5?glassMix(tint.glassHi,tint.glass,d*2):glassMix(tint.glass,glassPal().violet,(d-.5)*2*.9)}
function drawGlassFaceCell(ctx,px,py,x,t,d0,d1,row,top,side,door){
 const g=ctx.createLinearGradient(0,py,0,py+32);g.addColorStop(0,glassFaceColour(t,d0));g.addColorStop(1,glassFaceColour(t,d1));ctx.fillStyle=g;ctx.fillRect(px,py,32,32);
 // a long slanted reflection crossing the whole face
 const diag=((x*32-row*32)%160+160)%160;if(diag<40){ctx.fillStyle=glassRGBA(glassPal().white,.07);ctx.beginPath();ctx.moveTo(px+diag-8,py+32);ctx.lineTo(px+diag+8,py);ctx.lineTo(px+diag+16,py);ctx.lineTo(px+diag,py+32);ctx.closePath();ctx.fill()}
 const window=t.window,winRow=row%2===0&&!top&&!door,pier=x%4===0;
 if(!winRow&&!top){ctx.fillStyle=glassRGBA(glassPal().silverMid,.75);ctx.fillRect(px,py+14,32,2);ctx.fillStyle=glassRGBA(glassPal().white,.35);ctx.fillRect(px,py+14,32,1);ctx.fillStyle=glassRGBA(glassPal().violetInk,.25);ctx.fillRect(px,py+16,32,1)}
 if(winRow&&x%4===2){
  ctx.fillStyle=glassPal().silverDark;ctx.fillRect(px+6,py+3,20,27);ctx.fillStyle=glassPal().silverMid;ctx.fillRect(px+7,py+3,18,25);
  ctx.fillStyle=glassPal().violetInk;ctx.beginPath();
  if(window==='round')ctx.arc(px+16,py+15,8,0,Math.PI*2);else if(window==='diamond'){ctx.moveTo(px+16,py+5);ctx.lineTo(px+24,py+16);ctx.lineTo(px+16,py+27);ctx.lineTo(px+8,py+16)}else if(window==='slit')ctx.rect(px+13,py+5,6,22);else{ctx.moveTo(px+9,py+27);ctx.lineTo(px+9,py+13);ctx.arc(px+16,py+13,7,Math.PI,0);ctx.lineTo(px+23,py+27)}
  ctx.closePath();ctx.fill();
  ctx.fillStyle=glassRGBA(glassPal().sky,.55-d0*.3);ctx.fillRect(px+12,py+10,2,11);ctx.fillStyle=glassRGBA(glassPal().lilac,.35);ctx.fillRect(px+18,py+16,2,7);
  ctx.fillStyle=glassPal().silver;ctx.fillRect(px+6,py+28,20,2);
 }
 if(pier){ctx.fillStyle=glassPal().silverDark;ctx.fillRect(px+12,py,8,32);ctx.fillStyle=glassPal().silverMid;ctx.fillRect(px+13,py,5,32);ctx.fillStyle=glassRGBA(glassPal().white,.65);ctx.fillRect(px+13,py,1,32);ctx.fillStyle=glassRGBA(glassPal().violetInk,.3);ctx.fillRect(px+18,py,2,32)}
 if(side){ctx.fillStyle=glassRGBA(glassPal().violetInk,.30);ctx.fillRect(px,py,32,32);ctx.fillStyle=glassPal().silver;ctx.fillRect(side<0?px:px+29,py,3,32);ctx.fillStyle=glassPal().silverDark;ctx.fillRect(side<0?px+3:px+28,py,1,32)}
 if(top){ctx.fillStyle=glassPal().silver;ctx.fillRect(px,py,32,5);ctx.fillStyle=glassPal().silverDark;ctx.fillRect(px,py+5,32,2);ctx.fillStyle=glassRGBA(glassPal().white,.6);ctx.fillRect(px,py,32,1);for(let i=2;i<32;i+=8){ctx.fillStyle=glassPal().silverMid;ctx.fillRect(px+i,py+7,3,3)}}
 if(door){ctx.fillStyle=glassPal().silver;ctx.fillRect(px+2,py+1,28,31);ctx.fillStyle=glassPal().violetInk;ctx.beginPath();ctx.moveTo(px+6,py+32);ctx.lineTo(px+6,py+14);ctx.arc(px+16,py+14,10,Math.PI,0);ctx.lineTo(px+26,py+32);ctx.closePath();ctx.fill();ctx.fillStyle=glassRGBA('#bff4ff',.4);ctx.fillRect(px+14,py+8,4,4)}
}
// The roof of a tower seen from above: bright glass reflecting the sky, ribs running to a silver crown, a lit rim.
function drawGlassRoofCell(ctx,px,py,x,y,t,rim,cx,cy){
 const tint=glassTint(t),a=Math.atan2(y-cy,x-cx),sector=Math.floor((a+Math.PI)/(Math.PI/4))%2,d=Math.hypot(x-cx,(y-cy)*1.2);
 ctx.fillStyle=glassMix(sector?tint.glassHi:tint.glass,tint.glassMid,Math.min(.6,d/18));ctx.fillRect(px,py,32,32);
 ctx.fillStyle=glassRGBA(glassPal().white,.10);ctx.fillRect(px+((x*5)%20),py+((y*7)%20),9,1);
 if(Math.abs(x-cx)<=0||Math.abs(y-cy)<=0){ctx.fillStyle=glassPal().silverMid;if(x===cx)ctx.fillRect(px+15,py,2,32);if(y===cy)ctx.fillRect(px,py+15,32,2)}
 if(Math.abs(Math.abs(x-cx)-Math.abs(y-cy))<=0){ctx.fillStyle=glassRGBA(glassPal().silverMid,.7);ctx.fillRect(px+14,py+14,4,4)}
 if(rim){ctx.fillStyle=glassPal().silver;ctx.fillRect(px,py,32,4);ctx.fillStyle=glassPal().silverDark;ctx.fillRect(px,py+4,32,1)}
 if(x===cx&&y===cy){ctx.fillStyle=glassPal().silverDark;ctx.fillRect(px+9,py+8,14,22);ctx.fillStyle=glassPal().silver;ctx.fillRect(px+11,py+6,10,22);ctx.fillStyle='#f6eaff';ctx.beginPath();ctx.moveTo(px+16,py-16);ctx.lineTo(px+23,py+6);ctx.lineTo(px+9,py+6);ctx.closePath();ctx.fill();ctx.fillStyle=glassPal().white;ctx.fillRect(px+15,py-8,2,9)}
}
const GLASS_FADE=new Map();
// Drawn after the scenery fog: a building seen from outside is scenery the player knows, even though its rooms are unseen.
// Parts of a tower's body fade out as the player comes within two or three cells of them, so a door, bridge or
// stair under a roof or face is always readable when it matters: fully clear at two cells, solid again past three and a half.
function glassNear(x,y){const p=state.player;return Math.min(1,Math.max(0,(Math.hypot(x-p.x,y-p.y)-2)/1.5))}
function drawGlassTowerBodies(b,now){
 const plan=state?.branchContext105?.id==='mirror'&&state.branchWorld105?.mirror105;if(!plan)return;
 const level=state.branchContext105.level,p=state.player,dt=Math.min(100,now-(GLASS_FADE.get('t')??now));GLASS_FADE.set('t',now);
 for(const t of plan.towers){
  if(t.height<level)continue;const rise=mirrorTowerRise(t,level);
  if(t.cx+t.rx<b.x0-2||t.cx-t.rx>b.x1+2||t.cy+t.ry<b.y0-2||t.cy-t.ry-rise-2>b.y1+2)continue;
  const cols=glassTowerColumns(t),west=cols[0].x,east=cols.at(-1).x,seen=(x,y)=>state.seen.has(k(x,y));
  const lit=cols.some(c=>state.visible.has(k(c.x,c.bottom))||state.visible.has(k(c.x,c.top))||state.visible.has(k(c.x,c.bottom+1)));
  const base=lit?1:.6;X.save();
  // wall courses rising above the back wall: kept inside and out, so the room's ceiling reads high
  for(const c of cols){if(!seen(c.x,c.top))continue;for(let j=1;j<=rise;j++){const row=rise-j,a=base*glassNear(c.x,c.top-j);if(a<=.02)continue;X.globalAlpha=a;drawGlassFaceCell(X,c.x*TILE,(c.top-j)*TILE,c.x,t,row/(rise+1),(row+1)/(rise+1),row,j===rise,c.x===west?-1:c.x===east?1:0,false)}}
  if(!t.closed){X.restore();continue}
  const target=mirrorTowerContains(t,p.x,p.y)?0:1;let alpha=GLASS_FADE.get(t.id);alpha=alpha==null?target:alpha+(target-alpha)*Math.min(1,dt/120);GLASS_FADE.set(t.id,alpha);
  if(alpha<=.02){X.restore();continue}
  const cy=t.cy-rise;
  for(const c of cols){
   if(!seen(c.x,c.bottom)&&!seen(c.x,c.top))continue;
   const faceTop=Math.max(c.top,c.bottom-rise+1);
   for(let y=c.top-rise;y<faceTop;y++){const a=base*alpha*glassNear(c.x,y);if(a<=.02)continue;X.globalAlpha=a;drawGlassRoofCell(X,c.x*TILE,y*TILE,c.x,y,t,y===c.top-rise,t.cx,cy)}
   const n=c.bottom-faceTop+1;for(let y=faceTop;y<=c.bottom;y++){const row=y-faceTop,a=base*alpha*glassNear(c.x,y);if(a<=.02)continue;X.globalAlpha=a;drawGlassFaceCell(X,c.x*TILE,y*TILE,c.x,t,row/n,(row+1)/n,row,row===0,c.x===west?-1:c.x===east?1:0,y===c.bottom&&(state.map[y]?.[c.x]===TT.DOOR||state.map[y]?.[c.x]===TT.OPEN_DOOR))}
  }
  X.restore();
 }
}
