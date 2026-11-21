// 수은도시(23층): a grey, flooded, East-Asian river city. Platforms stand on stone quays above dark canals, buildings are whitewashed
// plaster with timber beams and grey tiled roofs, and the movable bridges are plank decks with rails. Static pieces are cached
// 32x32 canvases; only ripples and the sheen are drawn live. Everything here is for floor 23 on the main line.
const CITY_CACHE=new Map();
function cityOn(){return state?.floor===23&&!state.branchContext105&&!state.duel&&!!state.floor23}
function cityCanvas(key,paint){let c=CITY_CACHE.get(key);if(c)return c;c=document.createElement('canvas');c.width=c.height=32;paint(c.getContext('2d'));CITY_CACHE.set(key,c);return c}
const cityLiquid=t=>t===TT.MERCURY||t===TT.WATER||t===TT.SHALLOW_WATER;
const cityGround=t=>t!=null&&!cityLiquid(t)&&t!==TT.WALL&&t!==TT.VOID&&t!==TT.DRAWBRIDGE_DOWN;
const cityTile=(x,y)=>state.map[y]?.[x];

// ---- paving: large grey slabs in a half-offset bond, brighter lip where the platform meets water
function drawCityPaving(px,py,x,y,tile){
  const t=tile??cityTile(x,y);if(t===TT.WOOD_FLOOR||t===TT.DARK_WOOD)return drawCityDeck(px,py,x,y);if(t!==TT.FLOOR&&t!==TT.STONE_PATH&&t!==TT.GILDED_FLOOR)return false;
  const lip=(cityLiquid(cityTile(x,y-1))?1:0)|(cityLiquid(cityTile(x+1,y))?2:0)|(cityLiquid(cityTile(x,y+1))?4:0)|(cityLiquid(cityTile(x-1,y))?8:0),v=(x*7+y*13)%4;
  X.drawImage(cityCanvas(`pave|${t}|${v}|${lip}`,q=>{
    const base=t===TT.STONE_PATH?'#626c70':'#566067';q.fillStyle=base;q.fillRect(0,0,32,32);
    for(let row=0;row<2;row++){const off=(row+v)%2?8:0;for(let c=-1;c<3;c++){const sx=c*16+off,sy=row*16,h=hash2(c+v*3,row+7,611);q.fillStyle=glassMix(base,h<.5?'#6b767b':'#4a545b',.25+h*.2);q.fillRect(sx+1,sy+1,15,15);q.fillStyle='rgba(255,255,255,.07)';q.fillRect(sx+1,sy+1,15,1);q.fillRect(sx+1,sy+1,1,15);q.fillStyle='rgba(0,0,0,.22)';q.fillRect(sx+1,sy+15,15,1);q.fillRect(sx+15,sy+1,1,15)}}
    q.fillStyle=t===TT.GILDED_FLOOR?'#a98440':'#262e34';for(let row=0;row<2;row++){const off=(row+v)%2?8:0;q.fillRect(0,row*16,32,1);for(let c=-1;c<3;c++)q.fillRect(c*16+off,row*16,1,16)}
    if(v===1){q.strokeStyle='rgba(20,26,30,.5)';q.beginPath();q.moveTo(5,6);q.lineTo(11,13);q.lineTo(9,19);q.stroke()}
    if(v===2){q.fillStyle='rgba(84,116,94,.35)';q.fillRect(21,22,5,2);q.fillRect(23,20,3,2)}
    const edge=(c,a,b,w,h)=>{q.fillStyle=c;q.fillRect(a,b,w,h)};
    if(lip&1){edge('#8d989c',0,0,32,2);edge('#3a454b',0,2,32,1)}if(lip&2){edge('#8d989c',30,0,2,32);edge('#3a454b',29,0,1,32)}
    if(lip&4){edge('#8d989c',0,30,32,2);edge('#2a343a',0,29,32,1)}if(lip&8){edge('#8d989c',0,0,2,32);edge('#3a454b',2,0,1,32)}
  }),px,py);
  return true;
}


// weathered grey-brown boards inside the timber halls (the old bright orange planks read as a different building)
function drawCityDeck(px,py,x,y){
  const v=(x*3+y*5)%3;
  X.drawImage(cityCanvas(`deck|${v}`,q=>{q.fillStyle='#4d4237';q.fillRect(0,0,32,32);for(let i=0;i<4;i++){const h=hash2(i,v,623);q.fillStyle=glassMix('#675848',h<.5?'#73644f':'#5a4c3e',.4);q.fillRect(0,i*8,32,7);q.fillStyle='rgba(255,236,200,.08)';q.fillRect(0,i*8,32,1);q.fillStyle='#2e271f';q.fillRect(0,i*8+7,32,1);if(h>.45){q.fillStyle='#2e271f';q.fillRect(6+Math.floor(h*18),i*8,1,7)}}}),px,py);
  return true;
}

// ---- water: dark jade-grey canal, a silver sheen for the mercury, quay faces under platforms, reflections under walls
function drawCityWater(tile,px,py,x,y,now){
  const north=cityTile(x,y-1),south=cityTile(x,y+1),west=cityTile(x-1,y),east=cityTile(x+1,y),quay=cityGround(north)?1:0,wallN=north===TT.WALL?1:0,bridgeN=north===TT.DRAWBRIDGE_DOWN?1:0,
    sideW=cityGround(west)?1:0,sideE=cityGround(east)?1:0,mask=quay|(wallN<<1)|(bridgeN<<2)|(sideW<<3)|(sideE<<4),v=(x*5+y*3)%3;
  X.drawImage(cityCanvas(`water|${mask}|${v}`,q=>{
    const g=q.createLinearGradient(0,0,0,32);g.addColorStop(0,'#2a424a');g.addColorStop(1,'#1d3238');q.fillStyle=g;q.fillRect(0,0,32,32);
    q.fillStyle='rgba(120,160,168,.10)';for(let i=0;i<3;i++)q.fillRect(3+((i*11+v*7)%20),6+i*9,8+i*2,1);
    if(quay){ // retaining wall of the platform to the north: ashlar courses sinking into the water
      q.fillStyle='#4d575e';q.fillRect(0,0,32,15);for(let row=0;row<3;row++){const off=row%2?7:0;for(let c=-1;c<3;c++){const h=hash2(c+x*3,row+y,613);q.fillStyle=glassMix('#56616a',h<.5?'#6a757b':'#444e55',.3+h*.2);q.fillRect(c*14+off+1,row*5+1,13,4)}}
      q.fillStyle='#2b353b';for(let row=0;row<3;row++)q.fillRect(0,row*5,32,1);q.fillStyle='rgba(255,255,255,.08)';q.fillRect(0,0,32,1);
      const gw=q.createLinearGradient(0,10,0,22);gw.addColorStop(0,'rgba(18,34,38,0)');gw.addColorStop(1,'rgba(18,34,38,.75)');q.fillStyle=gw;q.fillRect(0,10,32,12);q.fillStyle='rgba(88,124,104,.45)';q.fillRect(0,13,32,2);
    }
    if(wallN){ // reflection of the building standing at the canal edge
      const g2=q.createLinearGradient(0,0,0,18);g2.addColorStop(0,'rgba(170,176,168,.34)');g2.addColorStop(1,'rgba(170,176,168,0)');q.fillStyle=g2;q.fillRect(0,0,32,18);q.fillStyle='rgba(18,28,32,.22)';for(let i=0;i<4;i++)q.fillRect(0,4+i*4,32,1);
    }
    if(bridgeN){q.fillStyle='rgba(8,14,18,.45)';q.fillRect(0,0,32,12)}
    if(sideW){q.fillStyle='#4d575e';q.fillRect(0,0,4,32);q.fillStyle='#8d989c';q.fillRect(3,0,1,32)}if(sideE){q.fillStyle='#4d575e';q.fillRect(28,0,4,32);q.fillStyle='#8d989c';q.fillRect(28,0,1,32)}
    if(cityGround(south)){q.fillStyle='#8d989c';q.fillRect(0,30,32,2);q.fillStyle='rgba(8,14,18,.35)';q.fillRect(0,26,32,4)}
  }),px,py);
  // moving surface: ripples and the mercury's silver sheen
  const wave=((now/420+x*2+y)%12)|0,sheen=.10+.08*Math.sin(now/700+x*.9+y*.6);
  X.fillStyle=`rgba(196,214,214,${sheen})`;X.fillRect(px+3+wave,py+(quay?19:9),9,1);X.fillRect(px+19-(wave>>1),py+(quay?26:21),8,1);
  if(tile===TT.MERCURY){X.fillStyle=`rgba(226,236,232,${.05+.05*Math.sin(now/520+x+y*1.3)})`;X.fillRect(px,py+(quay?16:4),32,2)}
  const hm=state.floor23?.hydraulicCellMeta?.[k(x,y)];
  if(hm){const dir=hm.type==='diversion'||hm.type==='spillway'?1:-1,shift=((now/180+x+y)%12)|0;X.strokeStyle='rgba(235,252,250,.34)';X.beginPath();X.moveTo(px+(dir>0?3+shift:29-shift),py+14);X.lineTo(px+(dir>0?10+shift:22-shift),py+14);X.stroke()}
}


function cityRoofSprite(style,covered,v){
  return cityCanvas(`wr|${covered?1:0}|${style==='ruin'?1:0}|${v}`,q=>{
    const base=style==='ruin'?'#3f4b46':'#3c474d';q.fillStyle=base;q.fillRect(0,0,32,32);
    // half-round tiles: ribs run down the slope, each course overlaps the one below and drops a short shadow
    for(let row=0;row<4;row++){const y0=row*8,off=(row+v)%2?2:0;
      for(let c=-1;c<9;c++){const sx=c*4+off,tone=(c+row+v)%3;q.fillStyle=tone===0?'#566269':tone===1?'#4c585f':'#53606a';q.fillRect(sx,y0,3,7);q.fillStyle='rgba(255,255,255,.12)';q.fillRect(sx,y0,1,7);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(sx+2,y0,1,7)}
      q.fillStyle='#232c31';q.fillRect(0,y0+7,32,1);q.fillStyle='rgba(0,0,0,.28)';q.fillRect(0,y0+6,32,1);
      q.fillStyle='#69767c';for(let c=-1;c<9;c++)q.fillRect(c*4+off,y0+5,3,1)}
    if(style==='ruin'){q.fillStyle='rgba(14,20,18,.65)';q.fillRect(7+v*5,9,6,5);q.fillRect(21,19,5,6);q.fillStyle='rgba(88,120,92,.35)';q.fillRect(4,24,9,2)}
    if(!covered){q.fillStyle='#1d2529';q.fillRect(0,0,32,4);q.fillStyle='#7a888e';q.fillRect(0,4,32,1);q.fillStyle='rgba(0,0,0,.35)';q.fillRect(0,5,32,2)}
  });
}

// ---- buildings: plinth, whitewashed plaster, timber beam, lattice windows; roofs are grey tile
function drawCityWallCell(px,py,x,y){
  const style=state.floor23?.wallStyleByCell?.[k(x,y)]||'stone',south=cityTile(x,y+1),north=cityTile(x,y-1),front=south!=null&&south!==TT.WALL;
  const body={timber:'#8c7c68',plaster:'#bcbdb4',depot:'#6f7a80',ruin:'#7d8078'}[style]||'#8a9096',win=hash2(x,y,617)<.34&&style!=='ruin',v=(x*3+y)%3;
  if(front){
    X.drawImage(cityCanvas(`wf|${style}|${win?1:0}|${v}`,q=>{
      q.fillStyle='#1f262b';q.fillRect(0,0,32,32);
      q.fillStyle=body;q.fillRect(0,3,32,20);
      q.fillStyle='rgba(255,255,255,.10)';q.fillRect(0,4,32,3);for(let i=0;i<5;i++){q.fillStyle='rgba(30,36,38,.10)';q.fillRect((i*13+v*9)%28,8+(i*7)%12,2,9)}
      q.fillStyle='#2f2a26';q.fillRect(0,2,32,4);q.fillStyle='#4a423a';q.fillRect(0,2,32,1);q.fillStyle='#2f2a26';q.fillRect(0,22,32,2);
      q.fillStyle='#2f2a26';q.fillRect(0,6,2,17);q.fillRect(30,6,2,17);
      if(win){q.fillStyle='#232a2e';q.fillRect(8,9,16,11);q.strokeStyle='#cfc8b4';q.lineWidth=1;q.strokeRect(8.5,9.5,15,10);for(const gx of [13.5,18.5]){q.beginPath();q.moveTo(gx,10);q.lineTo(gx,19);q.stroke()}q.beginPath();q.moveTo(9,14.5);q.lineTo(23,14.5);q.stroke();q.fillStyle='rgba(255,208,128,.20)';q.fillRect(9,10,14,9)}
      for(let row=0;row<2;row++){const off=row?7:0;for(let c=-1;c<3;c++){const h=hash2(c+v,row,619);q.fillStyle=glassMix('#555f66',h<.5?'#6a757b':'#464f56',.3+h*.2);q.fillRect(c*14+off+1,24+row*4+1,13,3)}}q.fillStyle='#2a3238';q.fillRect(0,24,32,1);q.fillRect(0,28,32,1);
      q.fillStyle='rgba(0,0,0,.28)';q.fillRect(0,31,32,1);
    }),px,py);
    return true;
  }
  // roof: curved tile courses with the lighter lip of each course, eave overhang on the north edge
  X.drawImage(cityRoofSprite(style,north===TT.WALL,v),px,py);
  return true;
}

// ---- movable bridges: plank decks with rails and stone footings, lit by a lantern post every third plank
function drawCityBridge(px,py,x,y,now){
  const at=(dx,dy)=>cityTile(x+dx,y+dy),br=t=>t===TT.DRAWBRIDGE_DOWN,ew=br(at(-1,0))||br(at(1,0)),ns=br(at(0,-1))||br(at(0,1)),
    horizontal=ew&&!ns||!ns&&!ew&&(cityLiquid(at(0,-1))||cityLiquid(at(0,1))),endA=horizontal?!br(at(-1,0)):!br(at(0,-1)),endB=horizontal?!br(at(1,0)):!br(at(0,1)),lamp=(horizontal?x:y)%3===0;
  drawCityWater(TT.MERCURY,px,py,x,y,now);
  X.drawImage(cityCanvas(`bridge|${horizontal?1:0}|${endA?1:0}|${endB?1:0}|${lamp?1:0}|${(x+y)%2}`,q=>{
    q.save();if(!horizontal){q.translate(32,0);q.rotate(Math.PI/2)}
    q.fillStyle='rgba(6,12,16,.55)';q.fillRect(0,25,32,5);
    for(let i=0;i<6;i++){const yy=i*5+1,h=hash2(i,x*3+y,621);q.fillStyle=h<.4?'#6e5640':'#85694c';q.fillRect(0,yy+2,32,4);q.fillStyle='rgba(255,230,190,.22)';q.fillRect(0,yy+2,32,1);q.fillStyle='#3d2f23';q.fillRect(0,yy+6,32,1)}
    q.fillStyle='#2e2822';q.fillRect(0,7,32,2);q.fillRect(0,23,32,2);
    for(const rail of [4,25]){q.fillStyle='#2b2520';q.fillRect(0,rail,32,3);q.fillStyle='#8a7455';q.fillRect(0,rail,32,1);for(const a of [2,29]){q.fillStyle='#2b2520';q.fillRect(a,rail-3,3,8);q.fillStyle='#a28c68';q.fillRect(a,rail-3,3,2)}}
    if(endA||endB){for(const [on,a] of [[endA,0],[endB,26]])if(on){q.fillStyle='#4d575e';q.fillRect(a,2,6,28);q.fillStyle='#7d898e';q.fillRect(a,2,6,2);q.fillStyle='#2b353b';q.fillRect(a+5,2,1,28)}}
    if(lamp){for(const rail of [4,25]){q.fillStyle='#2b2520';q.fillRect(14,rail-6,4,6);q.fillStyle='#f4c06c';q.fillRect(15,rail-5,2,3)}}
    q.restore();
  }),px,py);
  if(lamp){const g=X.createRadialGradient(px+16,py+16,2,px+16,py+16,22);g.addColorStop(0,`rgba(255,196,110,${.14+.03*Math.sin(now/300+x)})`);g.addColorStop(1,'rgba(255,196,110,0)');X.fillStyle=g;X.fillRect(px-6,py-6,44,44)}
}

// One entry for the whole floor: the renderer asks here for every cell on floor 23 so old and new materials never mix.
function drawCityTile(base,t,px,py,x,y,time,props){
  if(base===TT.WALL){drawCityWallCell(px,py,x,y);return true}
  if(cityLiquid(base)){drawCityWater(base,px,py,x,y,FX.frameNow||performance.now());return true}
  if(base===TT.DRAWBRIDGE_DOWN){drawCityBridge(px,py,x,y,FX.frameNow||performance.now());return true}
  if(!drawCityPaving(px,py,x,y,base)&&!drawCityDeck(px,py,x,y,base))drawCityPaving(px,py,x,y,TT.FLOOR);
  if(base!==TT.FLOOR&&base!==TT.GRASS&&!(base===TT.STONE_PATH||base===TT.WOOD_FLOOR||base===TT.DARK_WOOD||base===TT.GILDED_FLOOR)){if(!drawSpecialTerrain(base,px,py,x,y,time))drawInteractiveTerrain(base,px,py,x,y,time)}
  if(t!==base&&t!==TT.FLOOR&&t!==TT.GRASS&&t!==TT.WALL)props.push({t,px,py,x,y});
  return true;
}
