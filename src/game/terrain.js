/* ===== Grand terrain: one landscape-sized room on an ordinary floor =====
   While the rooms of an ordinary floor are placed (placeRooms93) one oversized room is reserved, so the room graph links it like
   any other room. When the graph exists (graphOrganic93) the room is sculpted into a landscape inside its own walls: a pond
   garden, a river or lava ravine, a colonnade, a hedge maze, a lantern courtyard, a cave, a bamboo grove or a ruin; or a whole
   compound of rooms and wide halls (lodge, cloister, temple, bazaar, archive, barracks) whose rooms join the floor's room list so
   monsters and loot come to them like to any other room. Its doors and the cells behind them
   are never blocked, every entrance is joined by a causeway if the paint cut it off, and what the paint left unreachable is
   filled in, so the floor stays one connected map. The room is then retired from the room lists: the passes that furnish
   ordinary rooms (feature rooms, modules, vault rewards, decor) leave a landscape alone. */
const GRAND_TERRAIN_FLOORS=new Set([3,7,9,12,14,17,19]);
const GRAND_TERRAIN_WALK=new Set([TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.CARPET,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.PETAL_MAT,TT.SHALLOW_WATER,TT.PAPER_BRIDGE,TT.LOTUS_FLOWER,TT.ICE,TT.STEPPING_STONE,TT.REED,TT.MOON_GATE,TT.DOOR,TT.OPEN_DOOR]);
const GRAND_TERRAIN_ROOM_FLOOR=[TT.WOOD_FLOOR,TT.WOOD_FLOOR,TT.CARPET,TT.DARK_WOOD,TT.GILDED_FLOOR];
// The ground of each region (inn, garden, inner chambers, storage, heart).
const GRAND_TERRAIN_GROUND=[TT.WOOD_FLOOR,TT.LIGHT_GRASS,TT.CARPET,TT.STONE_PATH,TT.MOON_STONE];
const GRAND_TERRAIN_MAZE_WALL=[TT.HEDGE,TT.BAMBOO,TT.SCREEN,TT.CRATE,TT.ROCK];

const GRAND_TERRAINS=[
  {id:'pond',name:'연못 정원',minRegion:0,w:[19,23],h:[11,13],paint:paintGrandPond},
  {id:'ravine',name:'협곡',minRegion:0,w:[19,23],h:[11,13],paint:paintGrandRavine},
  {id:'colonnade',name:'열주 대회랑',minRegion:0,w:[19,23],h:[11,13],paint:paintGrandColonnade},
  {id:'maze',name:'정원 미로',minRegion:0,w:[17,21],h:[11,13],paint:paintGrandMaze},
  {id:'courtyard',name:'등롱 안뜰',minRegion:0,w:[19,23],h:[11,13],paint:paintGrandCourtyard},
  {id:'cave',name:'석굴',minRegion:1,w:[19,23],h:[11,13],paint:paintGrandCave},
  {id:'grove',name:'대숲 오솔길',minRegion:0,w:[19,23],h:[11,13],paint:paintGrandGrove},
  {id:'ruins',name:'무너진 전각 터',minRegion:1,w:[19,23],h:[11,13],paint:paintGrandRuins},
  {id:'lodge',name:'객사동',minRegion:0,compound:true,w:[29,33],h:[17,19],paint:paintGrandLodge},
  {id:'cloister',name:'회랑 정원',minRegion:0,compound:true,w:[27,31],h:[17,19],paint:paintGrandCloister},
  {id:'temple',name:'사원 단지',minRegion:0,compound:true,w:[31,35],h:[17,19],paint:paintGrandTemple},
  {id:'bazaar',name:'저잣거리',minRegion:0,compound:true,w:[29,33],h:[17,19],paint:paintGrandBazaar},
  {id:'archive',name:'서고 단지',minRegion:1,compound:true,w:[27,31],h:[17,19],paint:paintGrandArchive},
  {id:'barracks',name:'연무 단지',minRegion:2,compound:true,w:[29,33],h:[17,19],paint:paintGrandBarracks},
  {id:'voidgarden',name:'허공 정원',minRegion:0,w:[27,31],h:[15,17],paint:paintGrandVoidGarden},
  {id:'watertown',name:'수향 마을',minRegion:0,compound:true,w:[29,33],h:[17,19],paint:paintGrandWaterTown},
  {id:'spiral',name:'나선 회랑',minRegion:0,compound:true,w:[27,31],h:[17,19],paint:paintGrandSpiral},
  {id:'moat',name:'해자 성채',minRegion:1,compound:true,w:[29,33],h:[17,19],paint:paintGrandMoat},
  ...GRAND_VAULTS.map(v=>({id:v.id,name:v.name,minRegion:v.minRegion,maxRegion:v.maxRegion,compound:true,vault:v,paint:paintGrandVault}))
];

function reserveGrandTerrain(m,rooms){
  state.grandTerrain93=null;
  if(state.floor===1||state.specialFloor||!GRAND_TERRAIN_FLOORS.has(state.floor)||globalThis.__MANRU_RANDOM57__()>.88)return null;
  // kinds the earlier floors of the run had; the floor's own earlier tries do not count, so a retry keeps its kind
  const region=regionIndex(),seen=(state.grandTerrainLog93||[]).filter(e=>e.floor!==state.floor).map(e=>e.kind),pool=GRAND_TERRAINS.filter(t=>region>=t.minRegion&&region<=(t.maxRegion??9)),fresh=pool.filter(t=>!seen.includes(t.id)),first=choice(fresh.length?fresh:pool);
  // a compound that does not fit is replaced by a landscape, which is smaller
  for(const kind of [first,...pool.filter(t=>!t.compound&&t!==first)]){
    for(let t=0;t<(kind===first?90:40);t++){
      // a vault is flipped and may lie on its side; its room is the drawing plus a walkway round it
      const tf=kind.vault?{flipX:globalThis.__MANRU_RANDOM57__()<.5,flipY:globalThis.__MANRU_RANDOM57__()<.5,rot:kind.vault.rotate!==false&&globalThis.__MANRU_RANDOM57__()<.4}:null;
      const vw=kind.vault?kind.vault.rows[0].length:0,vh=kind.vault?kind.vault.rows.length:0;
      const w=kind.vault?(tf.rot?vh:vw)+4:rand(kind.w[0],kind.w[1]),h=kind.vault?(tf.rot?vw:vh)+4:rand(kind.h[0],kind.h[1]),x=rand(3,COLS-w-4),y=rand(3,ROWS-h-4);
      if(!canPlace93(x,y,w,h,2))continue;
      const room=addCompact93(m,x,y,w,h,'terrain','rect','hall');
      room.terrain93=kind.id;room.vaultTf93=tf;rooms.push(room);state.grandTerrain93={kind:kind.id,name:kind.name,x,y,w,h};
      return room;
    }
  }
  return null;
}

// The context a painter works in: the interior of the room, its entrances and the cells that must stay open.
function grandTerrainZone(room){
  const x0=room.x+1,y0=room.y+1,x1=room.x+room.w-2,y1=room.y+room.h-2,z={source:room,room,x0,y0,x1,y1,iw:x1-x0+1,ih:y1-y0+1,cx:room.cx,cy:room.cy,region:regionIndex(),entries:[],keep:new Set()};
  const ring=[];
  for(let x=room.x;x<room.x+room.w;x++)ring.push([x,room.y,0,1],[x,room.y+room.h-1,0,-1]);
  for(let y=room.y+1;y<room.y+room.h-1;y++)ring.push([room.x,y,1,0],[room.x+room.w-1,y,-1,0]);
  for(const [x,y,dx,dy] of ring){
    if(state.map[y][x]===TT.WALL)continue;
    z.entries.push({x:clamp(x+dx,x0,x1),y:clamp(y+dy,y0,y1)});
  }
  const keep=(x,y)=>z.keep.add(y*COLS+x);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)keep(z.cx+dx,z.cy+dy);
  for(const e of z.entries){keep(e.x,e.y);for(const [dx,dy] of DIRS4)if(e.x+dx>=x0&&e.x+dx<=x1&&e.y+dy>=y0&&e.y+dy<=y1)keep(e.x+dx,e.y+dy)}
  return z;
}

// The brush: every painter draws through it, so nothing can block a kept cell or leave the room.
function grandTerrainBrush(z,m){
  const inside=(x,y)=>x>=z.x0&&x<=z.x1&&y>=z.y0&&y<=z.y1;
  return{
    ...z,inside,
    at:(x,y)=>inside(x,y)?m[y][x]:null,
    // a prop needs a surface to stand on: stepping stones in deep water stand on shallows; the terrain owner may still refuse, then the cell stays as it was
    set(x,y,t){if(!inside(x,y))return false;if(z.keep.has(y*COLS+x)&&tileBlocks(t))return false;if(t===TT.STEPPING_STONE&&m[y][x]===TT.WATER)setTerrainTile58(m,x,y,TT.SHALLOW_WATER);setTerrainTile58(m,x,y,t);return m[y][x]===t},
    fill(t){for(let y=z.y0;y<=z.y1;y++)for(let x=z.x0;x<=z.x1;x++)setTerrainTile58(m,x,y,t)},
    near(x,y,r,pred){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(inside(x+dx,y+dy)&&pred(m[y+dy][x+dx]))return true;return false},
    kept:(x,y)=>z.keep.has(y*COLS+x),
    rnd:()=>globalThis.__MANRU_RANDOM57__(),
    // compound building: raw floor/wall carving (the entrances stay joined by the walkway), rooms that join the floor's room list,
    // and furniture along a room's walls, never in front of its doors
    carve(x,y,w,h,t){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(inside(xx,yy))setTerrainTile58(m,xx,yy,t)},
    room(x,y,w,h,floor,doors){
      for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w-1;xx++)if(inside(xx,yy))setTerrainTile58(m,xx,yy,floor);
      for(const [dx,dy] of doors||[])if(inside(dx,dy))setTerrainTile58(m,dx,dy,TT.DOOR);
      const r=roomRect(x,y,w,h);state.rooms.push(r);return r;
    },
    furnish(r,tiles){
      const doors=[];for(let yy=r.y;yy<r.y+r.h;yy++)for(let xx=r.x;xx<r.x+r.w;xx++)if(inside(xx,yy)&&(m[yy][xx]===TT.DOOR||m[yy][xx]===TT.OPEN_DOOR))doors.push([xx,yy]);
      const cand=[];
      for(let yy=r.y+1;yy<r.y+r.h-1;yy++)for(let xx=r.x+1;xx<r.x+r.w-1;xx++){
        if(!(xx===r.x+1||xx===r.x+r.w-2||yy===r.y+1||yy===r.y+r.h-2)||!GRAND_TERRAIN_WALK.has(m[yy][xx])||doors.some(([a,c])=>Math.abs(a-xx)<=1&&Math.abs(c-yy)<=1))continue;
        cand.push([xx,yy]);
      }
      for(let i=cand.length-1;i>0;i--){const j=Math.floor(globalThis.__MANRU_RANDOM57__()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]]}
      for(const t of tiles){const c=cand.pop();if(c)this.set(c[0],c[1],t)}
    }
  };
}

// Join every entrance to the centre: a cheapest causeway across whatever the paint blocked, then fill what is still cut off.
function linkGrandTerrain(z,m,bridgeOf,fillerOf){
  const inside=(x,y)=>x>=z.x0&&x<=z.x1&&y>=z.y0&&y<=z.y1,walk=(x,y)=>GRAND_TERRAIN_WALK.has(m[y][x]);
  if(!walk(z.cx,z.cy))setTerrainTile58(m,z.cx,z.cy,GRAND_TERRAIN_GROUND[z.region]);
  const flood=()=>{
    const seen=new Set([z.cy*COLS+z.cx]),stack=[[z.cx,z.cy]];
    while(stack.length){const [x,y]=stack.pop();for(const [dx,dy] of DIRS4){const nx=x+dx,ny=y+dy,kk=ny*COLS+nx;if(!inside(nx,ny)||seen.has(kk)||!walk(nx,ny))continue;seen.add(kk);stack.push([nx,ny])}}
    return seen;
  };
  let reach=flood();
  for(const e of z.entries){
    if(reach.has(e.y*COLS+e.x))continue;
    const dist=new Map(),prev=new Map(),open=new Set();
    for(const kk of reach){dist.set(kk,0);open.add(kk)}
    let goal=e.y*COLS+e.x;
    while(open.size){
      let best=-1,bd=1e9;for(const kk of open){const d=dist.get(kk);if(d<bd){bd=d;best=kk}}
      open.delete(best);if(best===goal)break;
      const bx=best%COLS,by=(best-bx)/COLS;
      for(const [dx,dy] of DIRS4){const nx=bx+dx,ny=by+dy,nk=ny*COLS+nx;if(!inside(nx,ny))continue;const nd=bd+(walk(nx,ny)?1:5);if(!dist.has(nk)||nd<dist.get(nk)){dist.set(nk,nd);prev.set(nk,best);open.add(nk)}}
    }
    for(let c=goal;prev.has(c);c=prev.get(c)){const x=c%COLS,y=(c-x)/COLS;if(walk(x,y))continue;const over=bridgeOf(m[y][x]);if(over===TT.STEPPING_STONE&&m[y][x]===TT.WATER)setTerrainTile58(m,x,y,TT.SHALLOW_WATER);setTerrainTile58(m,x,y,over)}
    reach=flood();
  }
  for(let y=z.y0;y<=z.y1;y++)for(let x=z.x0;x<=z.x1;x++)if(walk(x,y)&&!reach.has(y*COLS+x))setTerrainTile58(m,x,y,fillerOf(x,y));
}

function sculptGrandTerrain(m,room,rooms){
  const kind=GRAND_TERRAINS.find(t=>t.id===room.terrain93),z=grandTerrainZone(room),brush=grandTerrainBrush(z,m);
  const ground=GRAND_TERRAIN_GROUND[z.region],liquid=z.region<=2?TT.WATER:TT.LAVA;
  kind.paint(brush);
  const filler=brush.filler??(kind.id==='pond'?TT.WATER:kind.id==='ravine'?liquid:TT.ROCK);
  linkGrandTerrain(z,m,tile=>tile===TT.WATER?TT.STEPPING_STONE:tile===TT.LAVA||tile===TT.VOID?TT.STONE_PATH:ground,()=>filler);
  // retire the room: ordinary-room passes must not furnish a landscape
  const same=r=>r&&r.x===room.x&&r.y===room.y&&r.w===room.w&&r.h===room.h;
  const drop=list=>Array.isArray(list)?list.filter(r=>!same(r)):list;
  rooms.splice(rooms.findIndex(same),1);
  state.rooms=drop(state.rooms);state.mainRooms90=drop(state.mainRooms90);state.mainPathRooms92=drop(state.mainPathRooms92);state.branchRooms92=drop(state.branchRooms92);state.branchLeaves92=drop(state.branchLeaves92);
  state.itemBiasZones94=state.itemBiasZones94||[];state.itemBiasZones94.push({x:room.x,y:room.y,w:room.w,h:room.h,name:state.grandTerrain93.name});
  state.grandTerrainLog93=[...(state.grandTerrainLog93||[]).filter(e=>e.floor!==state.floor),{floor:state.floor,kind:kind.id}];
}

/* ---------- painters (each draws through the brush; coordinates are map cells) ---------- */

function paintGrandPond(b){
  const ground=b.region<=1?TT.GRASS:GRAND_TERRAIN_GROUND[b.region];b.fill(ground);
  const pcx=b.cx+Math.round((b.rnd()-.5)*b.iw*.16),pcy=b.cy+Math.round((b.rnd()-.5)*b.ih*.1),rx=b.iw*(.29+b.rnd()*.05),ry=b.ih*(.33+b.rnd()*.05),p1=b.rnd()*6.28,p2=b.rnd()*6.28;
  const shape=(x,y)=>{const dx=(x-pcx)/rx,dy=(y-pcy)/ry,a=Math.atan2(dy,dx);return Math.hypot(dx,dy)/(1+.17*Math.sin(3*a+p1)+.1*Math.sin(5*a+p2))};
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){const d=shape(x,y);if(d<.78)b.set(x,y,TT.WATER);else if(d<1.02)b.set(x,y,TT.SHALLOW_WATER)}
  // a stone islet with a basin of lanterns, and a winding trail of stepping stones from shore to shore through it
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)b.set(pcx+dx,pcy+dy,TT.STONE_PATH);
  b.set(pcx-1,pcy-1,TT.LANTERN_POST);b.set(pcx+1,pcy+1,TT.LANTERN_POST);b.set(pcx+1,pcy-1,TT.STATUE);
  const hop=(x,y)=>{const t=b.at(x,y);if(t===TT.WATER||t===TT.SHALLOW_WATER)b.set(x,y,TT.STEPPING_STONE)};
  const bendL=pcy+(b.rnd()<.5?-2:2),bendR=pcy+(b.rnd()<.5?-2:2),xl=Math.round(pcx-rx*.62),xr=Math.round(pcx+rx*.62);
  for(let x=b.x0;x<=b.x1;x++){const y=x<xl?bendL:x>xr?bendR:pcy;if(x<pcx-1||x>pcx+1)hop(x,y)}
  for(let y=Math.min(bendL,pcy);y<=Math.max(bendL,pcy);y++)hop(xl,y);
  for(let y=Math.min(bendR,pcy);y<=Math.max(bendR,pcy);y++)hop(xr,y);
  // shore life: reeds and lotus in the shallows, trees, rocks and flowerbeds on the bank
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){
    const t=b.at(x,y);
    if(t===TT.SHALLOW_WATER){const r=b.rnd();if(r<.22)b.set(x,y,TT.REED);else if(r<.42)b.set(x,y,TT.LOTUS_FLOWER)}
    else if(t===ground&&b.near(x,y,2,v=>v===TT.WATER||v===TT.SHALLOW_WATER)&&!b.near(x,y,1,v=>v===TT.STEPPING_STONE)&&b.rnd()<.2){const r=b.rnd();b.set(x,y,r<.45?TT.GARDEN_TREE:r<.75?TT.ROCK:TT.FLOWERBED)}
    else if(t===ground&&b.rnd()<.045)b.set(x,y,TT.FLOWERBED);
  }
}

function paintGrandRavine(b){
  const rift=b.region>=1&&b.rnd()<.3,lava=!rift&&b.region>=3,liquid=rift?TT.VOID:lava?TT.LAVA:TT.WATER,deck=lava||rift?TT.STONE_PATH:TT.STEPPING_STONE,ground=b.region<=1?TT.STONE_PATH:GRAND_TERRAIN_GROUND[b.region];
  b.filler=liquid;
  b.fill(ground);
  const amp=b.iw*.09,freq=.55+b.rnd()*.3,ph=b.rnd()*6.28,mid=b.cx,half=y=>1+((y*7+b.x0)%3===0?1:0)+(Math.sin(y*.8+ph)>.4?1:0);
  const bank=new Map();
  for(let y=b.y0;y<=b.y1;y++){
    const c=Math.round(mid+amp*Math.sin(y*freq+ph)),w=half(y);bank.set(y,[c-w,c+w]);
    for(let x=c-w;x<=c+w;x++)b.set(x,y,liquid);
  }
  // two crossings, apart from each other, each with a post on both banks
  const rows=[b.y0+1+Math.floor(b.rnd()*2),b.y1-1-Math.floor(b.rnd()*2)];
  for(const y of rows){const [l,r]=bank.get(y);for(let x=l-1;x<=r+1;x++)b.set(x,y,deck);b.set(l-1,y,deck);const post=lava||rift?TT.STONE_PILLAR:TT.LANTERN_POST;b.set(l-1,y-1,post);b.set(r+1,y+1,post)}
  // rock outcrops on the banks
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){
    if(b.at(x,y)!==ground||b.near(x,y,1,v=>v===deck))continue;
    const [l,r]=bank.get(y);if(x>l-2&&x<r+2)continue;
    if(b.rnd()<.07){b.set(x,y,TT.ROCK);if(b.rnd()<.5)b.set(x+(b.rnd()<.5?1:-1),y,TT.ROCK)}
    else if(!lava&&b.region<=1&&b.rnd()<.04)b.set(x,y,TT.GARDEN_TREE);
  }
}

function paintGrandColonnade(b){
  const ground=GRAND_TERRAIN_GROUND[b.region],alt=b.region===4?TT.GILDED_FLOOR:TT.MOON_STONE;
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)b.set(x,y,((x>>1)+(y>>1))&1?ground:alt);
  const ay=b.cy,ax=b.cx;
  // a long runway, a cross hall, and two rows of columns along the runway
  for(let x=b.x0;x<=b.x1;x++)for(let dy=-1;dy<=1;dy++)b.set(x,ay+dy,TT.CARPET);
  for(let y=b.y0;y<=b.y1;y++)for(let dx=-1;dx<=1;dx++)b.set(ax+dx,y,TT.CARPET);
  for(let x=b.x0+1;x<=b.x1-1;x+=3){if(Math.abs(x-ax)<=2)continue;b.set(x,ay-2,TT.STONE_PILLAR);b.set(x,ay+2,TT.STONE_PILLAR)}
  for(let y=b.y0+1;y<=b.y1-1;y+=3){if(Math.abs(y-ay)<=2)continue;b.set(ax-2,y,TT.STONE_PILLAR);b.set(ax+2,y,TT.STONE_PILLAR)}
  // lantern bays between the columns and the outer wall, banners along the north wall
  for(let x=b.x0+2;x<=b.x1-1;x+=6){if(Math.abs(x-ax)>3){b.set(x,b.y0+1,TT.LANTERN_POST);b.set(x,b.y1-1,TT.LANTERN_POST)}}
  for(let x=b.x0;x<=b.x1;x+=3)if(Math.abs(x-ax)>1)b.set(x,b.y0,TT.WALL_BANNER);
  b.set(b.x0,ay,TT.STATUE);b.set(b.x1,ay,TT.STATUE);b.set(ax,b.y0,TT.STATUE);b.set(ax,b.y1,TT.STATUE);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)b.set(ax+dx,ay+dy,(dx||dy)?TT.GILDED_FLOOR:TT.CARPET);
  for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])b.set(ax+dx,ay+dy,TT.INCENSE_STAND);
}

function paintGrandMaze(b){
  const wall=GRAND_TERRAIN_MAZE_WALL[b.region],ground=b.region<=1?TT.GRASS:GRAND_TERRAIN_GROUND[b.region];
  b.fill(ground);
  // the maze lives inside a walkable border strip, so every entrance already joins its outside
  const ix0=b.x0+1,iy0=b.y0+1,ix1=b.x1-1,iy1=b.y1-1;
  for(let y=iy0;y<=iy1;y++)for(let x=ix0;x<=ix1;x++)b.set(x,y,wall);
  const cols=Math.floor((ix1-ix0)/2)+1,rows=Math.floor((iy1-iy0)/2)+1,seen=new Set(),open=(i,j)=>{const x=ix0+i*2,y=iy0+j*2;setTerrainTile58(state.map,x,y,ground);return[x,y]};
  const stack=[[Math.floor(cols/2),Math.floor(rows/2)]];seen.add(stack[0][1]*cols+stack[0][0]);open(...stack[0]);
  while(stack.length){
    const [i,j]=stack[stack.length-1],next=DIRS4.map(([dx,dy])=>[i+dx,j+dy]).filter(([a,c])=>a>=0&&c>=0&&a<cols&&c<rows&&!seen.has(c*cols+a));
    if(!next.length){stack.pop();continue}
    const [ni,nj]=choice(next);seen.add(nj*cols+ni);const [x,y]=open(ni,nj);setTerrainTile58(state.map,x+(i-ni),y+(j-nj),ground);stack.push([ni,nj]);
  }
  // loops (a perfect maze has only dead ends), gaps from the border strip, and a hall in the middle
  for(let n=0;n<Math.floor(cols*rows*.18);n++){const i=rand(0,cols-2),j=rand(0,rows-2),horizontal=b.rnd()<.5,x=ix0+i*2+(horizontal?1:0),y=iy0+j*2+(horizontal?0:1);if(b.at(x,y)===wall)setTerrainTile58(state.map,x,y,ground)}
  for(let n=0;n<4;n++){const side=rand(0,3),i=rand(0,cols-1),j=rand(0,rows-1);if(side===0)setTerrainTile58(state.map,ix0-0,iy0+j*2,ground);else if(side===1)setTerrainTile58(state.map,ix1-((ix1-ix0)%2),iy0+j*2,ground);else if(side===2)setTerrainTile58(state.map,ix0+i*2,iy0,ground);else setTerrainTile58(state.map,ix0+i*2,iy1-((iy1-iy0)%2),ground)}
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)setTerrainTile58(state.map,b.cx+dx,b.cy+dy,ground);
  for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])b.set(b.cx+dx,b.cy+dy,TT.LANTERN_POST);
  b.set(b.cx,b.cy,TT.STONE_PATH);
}

function paintGrandCourtyard(b){
  const plaza=b.region<=1?TT.STONE_PATH:GRAND_TERRAIN_GROUND[b.region];b.fill(plaza);
  const avenue=(x,y)=>Math.abs(x-b.cx)<=1||Math.abs(y-b.cy)<=1,rim=(x,y)=>x===b.x0||x===b.x1||y===b.y0||y===b.y1;
  const quadrants=[[b.x0+1,b.y0+1,b.cx-2,b.cy-2],[b.cx+2,b.y0+1,b.x1-1,b.cy-2],[b.x0+1,b.cy+2,b.cx-2,b.y1-1],[b.cx+2,b.cy+2,b.x1-1,b.y1-1]];
  for(const [qx0,qy0,qx1,qy1] of quadrants){
    if(qx1-qx0<2||qy1-qy0<2)continue;
    for(let y=qy0;y<=qy1;y++)for(let x=qx0;x<=qx1;x++){
      const edge=x===qx0||x===qx1||y===qy0||y===qy1;
      if(!edge){b.set(x,y,TT.GRASS);continue}
      // a low fence round the garden, open where the avenue touches its middle
      const gap=(x===qx0||x===qx1)&&Math.abs(y-(qy0+qy1)/2)<1.2||(y===qy0||y===qy1)&&Math.abs(x-(qx0+qx1)/2)<1.2;
      b.set(x,y,gap?plaza:TT.LOW_FENCE);
    }
    const mx=Math.floor((qx0+qx1)/2),my=Math.floor((qy0+qy1)/2);
    b.set(mx,my,b.rnd()<.5?TT.GARDEN_TREE:TT.STATUE);
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])if(b.at(mx+dx,my+dy)===TT.GRASS)b.set(mx+dx,my+dy,b.rnd()<.7?TT.FLOWERBED:TT.GRASS);
    b.set(qx0+1,qy0+1,TT.BENCH);
  }
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)b.set(b.cx+dx,b.cy+dy,(dx||dy)?TT.GILDED_FLOOR:TT.STONE_PATH);
  for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]])b.set(b.cx+dx,b.cy+dy,TT.LANTERN_POST);
  b.set(b.cx,b.cy-1,TT.BASIN);b.set(b.cx,b.cy+1,TT.BASIN);
  for(const [gx,gy] of [[b.cx,b.y0+1],[b.cx,b.y1-1],[b.x0+1,b.cy],[b.x1-1,b.cy]])if(!b.kept(gx,gy))b.set(gx,gy,TT.MOON_GATE);
  for(let x=b.x0;x<=b.x1;x+=4)if(avenue(x,b.cy+2)&&rim(x,b.y0)&&b.at(x,b.y0)===plaza)b.set(x,b.y0,TT.WALL_BANNER);
}

function paintGrandCave(b){
  const ground=b.region>=3?TT.MOON_STONE:TT.STONE_PATH;b.fill(ground);
  let rock=new Set();
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)if(!b.kept(x,y)&&b.rnd()<.44)rock.add(y*COLS+x);
  for(let step=0;step<4;step++){
    const next=new Set();
    for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){
      if(b.kept(x,y))continue;
      let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(!b.inside(nx,ny)||rock.has(ny*COLS+nx))n++}
      if(n>=5||(rock.has(y*COLS+x)&&n>=4&&b.rnd()<.5))next.add(y*COLS+x);
    }
    rock=next;
  }
  for(const kk of rock){const x=kk%COLS,y=(kk-x)/COLS;b.set(x,y,TT.ROCK)}
  // frost on the floor in the colder regions, and a few standing stones
  if(b.region>=2)for(let n=0;n<3;n++){const px=rand(b.x0+2,b.x1-2),py=rand(b.y0+2,b.y1-2);for(let y=py-2;y<=py+2;y++)for(let x=px-2;x<=px+2;x++)if(b.at(x,y)===ground&&Math.hypot(x-px,y-py)<=2.2&&!b.kept(x,y)&&!b.near(x,y,1,v=>v===TT.WALL))b.set(x,y,TT.ICE)}
  for(let n=0;n<9;n++){const x=rand(b.x0+1,b.x1-1),y=rand(b.y0+1,b.y1-1);if(b.at(x,y)===ground&&b.near(x,y,1,v=>v===TT.ROCK))b.set(x,y,b.rnd()<.7?TT.CRYSTAL:TT.STATUE)}
}

/* ---------- landscapes, continued ---------- */

function paintGrandGrove(b){
  const ground=b.region<=1?TT.GRASS:GRAND_TERRAIN_GROUND[b.region],path=TT.STONE_PATH;b.fill(ground);
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)if(!b.kept(x,y)&&b.rnd()<.62)b.set(x,y,TT.BAMBOO);
  // winding paths from every entrance to the middle, and two clearings with a bench and a lantern
  const wind=(sx,sy)=>{let x=sx,y=sy;for(let n=0;n<80&&(x!==b.cx||y!==b.cy);n++){setTerrainTile58(state.map,x,y,path);const dx=Math.sign(b.cx-x),dy=Math.sign(b.cy-y),horizontal=Math.abs(b.cx-x)>=Math.abs(b.cy-y);if(b.rnd()<.28){const side=b.rnd()<.5?1:-1;if(horizontal)y=clamp(y+side,b.y0,b.y1);else x=clamp(x+side,b.x0,b.x1)}else if(horizontal&&dx)x+=dx;else if(dy)y+=dy;else x+=dx}};
  for(const e of b.entries)wind(e.x,e.y);
  for(let n=0;n<2;n++){const px=rand(b.x0+3,b.x1-3),py=rand(b.y0+2,b.y1-2);b.carve(px-1,py-1,3,3,path);b.set(px-1,py,TT.BENCH);b.set(px+1,py-1,TT.LANTERN_POST)}
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)if(b.at(x,y)===ground&&b.rnd()<.12)b.set(x,y,TT.LIGHT_GRASS);
  for(let n=0;n<5;n++){const x=rand(b.x0+1,b.x1-1),y=rand(b.y0+1,b.y1-1);if(b.at(x,y)===ground)b.set(x,y,TT.ROCK)}
}

function paintGrandRuins(b){
  const ground=GRAND_TERRAIN_GROUND[b.region];b.fill(ground);
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)if(b.rnd()<.2)b.set(x,y,TT.GRASS);
  // the footprints of fallen halls: a broken outline of wall around each, rubble inside
  for(let n=0;n<rand(4,6);n++){
    const w=rand(5,8),h=rand(4,6),x=rand(b.x0,b.x1-w),y=rand(b.y0,b.y1-h);
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
      const edge=xx===x||xx===x+w-1||yy===y||yy===y+h-1;
      if(edge&&b.rnd()<.55&&!b.kept(xx,yy))setTerrainTile58(state.map,xx,yy,TT.WALL);
      else if(!edge&&b.rnd()<.14)b.set(xx,yy,TT.ROCK);
    }
    if(b.rnd()<.6)b.set(x+(w>>1),y+(h>>1),b.rnd()<.5?TT.STATUE:TT.STONE_PILLAR);
  }
  for(let n=0;n<6;n++){const x=rand(b.x0,b.x1),y=rand(b.y0,b.y1);if(b.at(x,y)!==TT.WALL)b.set(x,y,TT.ROCK)}
}

/* ---------- compounds: rooms and wide halls ---------- */

// Walls everywhere, with a one-wide walkway round the inside of the outer wall that every entrance opens onto.
function compoundShell(b){
  const g=GRAND_TERRAIN_GROUND[b.region];
  b.carve(b.x0,b.y0,b.iw,b.ih,TT.WALL);
  b.carve(b.x0,b.y0,b.iw,1,g);b.carve(b.x0,b.y1,b.iw,1,g);b.carve(b.x0,b.y0,1,b.ih,g);b.carve(b.x1,b.y0,1,b.ih,g);
  return g;
}
function compoundProps(b,pool,count){const out=[];for(let i=0;i<count;i++)out.push(pool[Math.floor(b.rnd()*pool.length)]);return out}

function paintGrandLodge(b){
  const g=compoundShell(b),rf=GRAND_TERRAIN_ROOM_FLOOR[b.region],cy=b.cy,ix=b.x0+1,iw=b.iw-2,n=Math.max(3,Math.floor(iw/6.5)),cols=[];
  // a three-wide spine from end to end, a carpet down its middle
  b.carve(b.x0,cy-1,b.iw,3,g);b.carve(b.x0,cy,b.iw,1,TT.CARPET);
  for(let i=0;i<=n;i++)cols.push(ix+Math.round(i*(iw-1)/n));
  for(const top of [true,false]){
    const y0=top?b.y0+1:cy+2,y1=top?cy-2:b.y1-1,doorY=top?y1:y0;
    for(let i=0;i<n;i++){
      const x=cols[i],w=cols[i+1]-x+1,door=[x+(w>>1),doorY],r=b.room(x,y0,w,y1-y0+1,rf,[door]);
      b.furnish(r,compoundProps(b,[TT.BED,TT.BED,TT.TABLE,TT.BENCH,TT.JAR,TT.SCREEN,TT.RACK],rand(3,4)));
    }
  }
  for(const x of cols.slice(1,-1)){b.set(x,cy-1,TT.LANTERN_POST);b.set(x,cy+1,TT.LANTERN_POST)}
}

function paintGrandCloister(b){
  const g=compoundShell(b),gx0=b.x0+2,gy0=b.y0+2,gx1=b.x1-2,gy1=b.y1-2,hx0=gx0+3,hy0=gy0+3,hx1=gx1-3,hy1=gy1-3;
  // a three-wide gallery all the way round, a garden inside it, four wide gaps to the walkway
  b.carve(gx0,gy0,gx1-gx0+1,gy1-gy0+1,TT.CARPET);
  b.carve(hx0,hy0,hx1-hx0+1,hy1-hy0+1,TT.GRASS);
  for(const [x,y,w,h] of [[b.cx-1,b.y0+1,3,1],[b.cx-1,b.y1-1,3,1],[b.x0+1,b.cy-1,1,3],[b.x1-1,b.cy-1,1,3]])b.carve(x,y,w,h,g);
  const gap=(x,y)=>Math.abs(x-b.cx)<=1||Math.abs(y-b.cy)<=1;
  for(let x=hx0-1;x<=hx1+1;x+=2)for(const y of [hy0-1,hy1+1])if(!gap(x,y))b.set(x,y,TT.STONE_PILLAR);
  for(let y=hy0-1;y<=hy1+1;y+=2)for(const x of [hx0-1,hx1+1])if(!gap(x,y))b.set(x,y,TT.STONE_PILLAR);
  // the garden: a small pond with an islet at its heart, trees, benches by the gaps
  for(let y=hy0;y<=hy1;y++)for(let x=hx0;x<=hx1;x++){const d=Math.hypot((x-b.cx)/(b.iw*.17),(y-b.cy)/(b.ih*.2));if(d<.8)b.set(x,y,TT.WATER);else if(d<1)b.set(x,y,TT.SHALLOW_WATER)}
  for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,0],[1,0],[-1,0],[0,1],[0,-1]])setTerrainTile58(state.map,b.cx+dx,b.cy+dy,TT.STONE_PATH);
  b.set(b.cx-1,b.cy-1,TT.LANTERN_POST);b.set(b.cx+1,b.cy+1,TT.LANTERN_POST);
  for(const [x,y] of [[hx0,hy0],[hx1,hy0],[hx0,hy1],[hx1,hy1]]){b.set(x,y,TT.GARDEN_TREE);b.set(x+(x<b.cx?1:-1),y,TT.FLOWERBED)}
  b.set(b.cx-4,hy0,TT.BENCH);b.set(b.cx+4,hy1,TT.BENCH);
  for(let x=gx0+1;x<=gx1-1;x+=5)if(!gap(x,gy0)){b.set(x,gy0,TT.LANTERN_POST);b.set(x,gy1,TT.LANTERN_POST)}
}

function paintGrandTemple(b){
  const g=compoundShell(b),rf=GRAND_TERRAIN_ROOM_FLOOR[b.region],cy=b.cy,ix0=b.x0+1,ix1=b.x1-1,iw=ix1-ix0+1,courtW=Math.floor(iw*.27),hallW=Math.floor(iw*.4);
  const wallA=ix0+courtW,hallStart=wallA+1,wallB=hallStart+hallW,sanStart=wallB+1;
  // gate court: open paving between two gatehouses
  b.carve(ix0,b.y0+1,courtW,b.ih-2,TT.STONE_PATH);
  for(const top of [true,false]){const y=top?b.y0+1:b.y1-5,r=b.room(ix0,y,courtW,5,rf,[[ix0+(courtW>>1),top?y+4:y]]);b.furnish(r,compoundProps(b,[TT.RACK,TT.BENCH,TT.JAR,TT.TABLE],3))}
  // great hall with a processional runway and two ranks of columns
  b.carve(hallStart,b.y0+1,hallW,b.ih-2,TT.MOON_STONE);b.carve(hallStart,cy-1,hallW,3,TT.CARPET);
  b.carve(wallA,cy-1,1,3,TT.CARPET);b.carve(wallB,cy-1,1,3,TT.CARPET);
  for(let x=hallStart+1;x<wallB;x+=3)for(const y of [cy-3,cy+3])b.set(x,y,TT.STONE_PILLAR);
  for(let x=hallStart+2;x<wallB;x+=6)for(const y of [b.y0+1,b.y1-1])b.set(x,y,TT.LANTERN_POST);
  // sanctum: a dais of gilded floor, statues and incense
  b.carve(sanStart,b.y0+1,ix1-sanStart+1,b.ih-2,rf);
  b.carve(sanStart+1,cy-2,ix1-sanStart-1,5,TT.GILDED_FLOOR);
  const ex=ix1-1;
  for(const dy of [-2,0,2])b.set(ex,cy+dy,TT.STATUE);
  for(const dy of [-3,3]){b.set(ex-2,cy+dy,TT.INCENSE_STAND);b.set(sanStart+1,cy+dy,TT.LANTERN_POST)}
  for(let x=b.x0;x<=b.x1;x+=4)if(b.at(x,b.y0)===g&&Math.abs(x-wallA)>1&&Math.abs(x-wallB)>1)b.set(x,b.y0,TT.WALL_BANNER);
}

function paintGrandBazaar(b){
  const g=compoundShell(b),rf=GRAND_TERRAIN_ROOM_FLOOR[b.region],cy=b.cy,v1=b.x0+Math.floor(b.iw/3),v2=b.x0+Math.floor(b.iw*2/3);
  b.carve(b.x0,cy-1,b.iw,3,TT.STONE_PATH);
  for(const v of [v1,v2])b.carve(v-1,b.y0,3,b.ih,TT.STONE_PATH);
  const edges=[b.x0+1,v1-2,v1+2,v2-2,v2+2,b.x1-1];
  for(let c=0;c<3;c++){
    const x=edges[c*2],w=edges[c*2+1]-x+1;
    for(const top of [true,false]){
      const y0=top?b.y0+1:cy+2,y1=top?cy-2:b.y1-1,h=y1-y0+1,door=[x+(w>>1),top?y1:y0],r=b.room(x,y0,w,h,rf,[door]);
      b.furnish(r,compoundProps(b,[TT.TABLE,TT.RACK,TT.JAR,TT.CRATE,TT.BENCH,TT.SCREEN],rand(3,5)));
    }
  }
  // stalls' lanterns along the streets, a well in the square where the streets cross
  for(let x=b.x0+2;x<=b.x1-2;x+=6)if(Math.abs(x-v1)>2&&Math.abs(x-v2)>2){b.set(x,cy-1,TT.LANTERN_POST);b.set(x,cy+1,TT.LANTERN_POST)}
  b.set(v1,cy,TT.BASIN);
}

function paintGrandArchive(b){
  const g=GRAND_TERRAIN_ROOM_FLOOR[3];compoundShell(b);
  b.carve(b.x0+1,b.y0+1,b.iw-2,b.ih-2,g);
  // stacks of shelves in long rows with gaps, a cross aisle, and a reading hall in the middle
  for(let x=b.x0+3;x<=b.x1-3;x+=4){
    for(let y=b.y0+2;y<=b.y1-2;y++){
      if(Math.abs(y-b.cy)<=1||(y-b.y0)%6===0)continue;
      if(Math.abs(x-b.cx)<=4&&Math.abs(y-b.cy)<=3)continue;
      b.set(x,y,TT.BOOK_STACK);
    }
  }
  for(let dy=-2;dy<=2;dy++)for(let dx=-4;dx<=4;dx++)setTerrainTile58(state.map,b.cx+dx,b.cy+dy,TT.CARPET);
  for(const [dx,dy] of [[-3,-2],[0,-2],[3,-2],[-3,2],[0,2],[3,2]])b.set(b.cx+dx,b.cy+dy,TT.TABLE);
  for(const [dx,dy] of [[-4,0],[4,0]])b.set(b.cx+dx,b.cy+dy,TT.INCENSE_STAND);
  for(let x=b.x0+2;x<=b.x1-2;x+=8){b.set(x,b.y0+1,TT.LANTERN_POST);b.set(x,b.y1-1,TT.LANTERN_POST)}
}

function paintGrandBarracks(b){
  const g=compoundShell(b),rf=GRAND_TERRAIN_ROOM_FLOOR[b.region],iw=b.iw-2,n=Math.max(3,Math.floor(iw/7)),cols=[];
  for(let i=0;i<=n;i++)cols.push(b.x0+1+Math.round(i*(iw-1)/n));
  for(const top of [true,false]){
    const y=top?b.y0+1:b.y1-5;
    for(let i=0;i<n;i++){const x=cols[i],w=cols[i+1]-x+1,r=b.room(x,y,w,5,rf,[[x+(w>>1),top?y+4:y]]);b.furnish(r,[TT.BED,TT.BED,TT.BED,TT.RACK].slice(0,rand(3,4)))}
  }
  // the drill yard between the barracks: paved, weapon racks and statues round its edge, wide openings to the walkway
  const yy0=b.y0+6,yy1=b.y1-6;
  b.carve(b.x0+1,yy0,iw,yy1-yy0+1,TT.STONE_PATH);
  for(let x=b.x0+3;x<=b.x1-3;x+=4){if(Math.abs(x-b.cx)>1){b.set(x,yy0,TT.RACK);b.set(x,yy1,TT.RACK)}}
  b.set(b.x0+2,b.cy,TT.STATUE);b.set(b.x1-2,b.cy,TT.STATUE);
  for(const [dx,dy] of [[-3,0],[3,0]])b.set(b.cx+dx,b.cy+dy,TT.LANTERN_POST);
}

/* ---------- strange structures ---------- */

function paintGrandVoidGarden(b){
  const ground=GRAND_TERRAIN_GROUND[b.region];b.filler=TT.VOID;
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++)setTerrainTile58(state.map,x,y,b.kept(x,y)?ground:TT.VOID);
  // a great island in the middle, six smaller ones round it, a bridge between neighbours with a moon gate halfway
  const isles=[{x:b.cx,y:b.cy,r:3.3}];
  for(let i=0;i<6;i++){const a=i*Math.PI/3+.4*(b.rnd()-.5),r=2+b.rnd()*.7;isles.push({x:Math.round(b.cx+Math.cos(a)*b.iw*.36),y:Math.round(b.cy+Math.sin(a)*b.ih*.36),r})}
  for(const it of isles)for(let y=Math.floor(it.y-it.r-1);y<=Math.ceil(it.y+it.r+1);y++)for(let x=Math.floor(it.x-it.r-1);x<=Math.ceil(it.x+it.r+1);x++)if(b.inside(x,y)&&Math.hypot(x-it.x,y-it.y)<=it.r+(((x*7+y*3)%3)-1)*.35)setTerrainTile58(state.map,x,y,ground);
  const lay=(a,c)=>{let x=a.x,y=a.y,n=0;const gate=Math.round(Math.hypot(c.x-a.x,c.y-a.y)/2);while((x!==c.x||y!==c.y)&&n<80){if(Math.abs(c.x-x)>=Math.abs(c.y-y))x+=Math.sign(c.x-x);else y+=Math.sign(c.y-y);if(b.at(x,y)===TT.VOID)setTerrainTile58(state.map,x,y,TT.STONE_PATH);if(++n===gate&&b.at(x,y)===TT.STONE_PATH)b.set(x,y,TT.MOON_GATE)}};
  for(let i=1;i<isles.length;i++){lay(isles[0],isles[i]);lay(isles[i],isles[i===6?1:i+1])}
  const props=[TT.GARDEN_TREE,TT.CRYSTAL,TT.STATUE,TT.ROCK,TT.LANTERN_POST,TT.BASIN];
  isles.forEach((it,i)=>{if(i===0){b.set(it.x-2,it.y,TT.STATUE);b.set(it.x+2,it.y,TT.STATUE);b.set(it.x,it.y-2,TT.LANTERN_POST);b.set(it.x,it.y+2,TT.LANTERN_POST)}else{b.set(it.x,it.y-1,props[i%props.length]);if(b.rnd()<.5)b.set(it.x+1,it.y+1,TT.LANTERN_POST)}});
}

function paintGrandWaterTown(b){
  const g=GRAND_TERRAIN_GROUND[b.region],rf=GRAND_TERRAIN_ROOM_FLOOR[b.region],px=10,py=8;
  b.filler=TT.WATER;
  // canals two cells wide between blocks of land; the outer rim is a dry walkway the entrances open onto
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){
    const rim=x===b.x0||x===b.x1||y===b.y0||y===b.y1,cx=(x-b.x0-1+px)%px,cy=(y-b.y0-1+py)%py,canal=cx>=px-2||cy>=py-2;
    setTerrainTile58(state.map,x,y,rim||b.kept(x,y)?g:canal?TT.WATER:g);
  }
  const bridgeCell=(x,y)=>{if(b.at(x,y)===TT.WATER)b.set(x,y,TT.STEPPING_STONE)};
  for(let by=0;by*py<b.ih-2;by++)for(let bx=0;bx*px<b.iw-2;bx++){
    const x=b.x0+1+bx*px,y=b.y0+1+by*py,w=px-2,h=py-2;
    if(x+w>b.x1||y+h>b.y1)continue;
    // bridges across the canal to the right and below, a gap in the rim of water to the walkway where the block touches it
    if(b.rnd()<.85)for(let dx=0;dx<2;dx++)bridgeCell(x+w+dx,y+(h>>1));
    if(b.rnd()<.85)for(let dy=0;dy<2;dy++)bridgeCell(x+(w>>1),y+h+dy);
    if(bx===0)for(let dy=0;dy<2;dy++)bridgeCell(x-1,y+(h>>1));
    if(by===0)bridgeCell(x+(w>>1),y-1);
    if(b.rnd()<.55){const r=b.room(x,y,w,h,rf,[[x+(w>>1),y+h-1]]);b.furnish(r,compoundProps(b,[TT.TABLE,TT.BED,TT.JAR,TT.BENCH,TT.RACK],rand(2,3)))}
    else{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(b.at(xx,yy)===g&&b.rnd()<.2)b.set(xx,yy,TT.GRASS);b.set(x+(w>>1),y+(h>>1),b.rnd()<.5?TT.GARDEN_TREE:TT.LANTERN_POST);b.set(x+1,y+1,TT.REED)}
  }
}

function paintGrandSpiral(b){
  const g=compoundShell(b),rf=GRAND_TERRAIN_ROOM_FLOOR[b.region];
  // nested walkways two wide, each walled off from the next with one gap, the gaps turning round like a spiral
  let inset=1,turn=0;const rings=[];
  while(b.x1-inset-3>=b.x0+inset+9&&b.y1-inset-3>=b.y0+inset+5){rings.push(inset);inset+=3}
  for(const k of rings){
    const x=b.x0+k,y=b.y0+k,w=b.iw-2*k,h=b.ih-2*k;
    b.carve(x,y,w,2,g);b.carve(x,y+h-2,w,2,g);b.carve(x,y,2,h,g);b.carve(x+w-2,y,2,h,g);
  }
  rings.forEach((k,i)=>{
    // the opening to the next ring inward, then the doorway out to the walkway for the first one
    const x=b.x0+k,y=b.y0+k,w=b.iw-2*k,h=b.ih-2*k,side=i%4;
    if(side===0)b.carve(x+(w>>1)-1,y+2,2,1,g);else if(side===1)b.carve(x+w-3,y+(h>>1)-1,1,2,g);else if(side===2)b.carve(x+(w>>1)-1,y+h-3,2,1,g);else b.carve(x+2,y+(h>>1)-1,1,2,g);
    if(i===0){b.carve(b.x0+1,b.cy-1,1,2,g);b.carve(b.x1-1,b.cy-1,1,2,g)}
    turn++;
  });
  const k=rings.length?rings[rings.length-1]+3:2,cx0=b.x0+k,cy0=b.y0+k,cw=b.iw-2*k,ch=b.ih-2*k;
  if(cw>=5&&ch>=3){
    const r=b.room(cx0-1,cy0-1,cw+2,ch+2,TT.GILDED_FLOOR,[]);
    // the heart of the spiral: a dais with statues and incense, its door facing the last opening
    b.carve(cx0,cy0,cw,ch,TT.GILDED_FLOOR);
    b.set(b.cx-2,b.cy,TT.STATUE);b.set(b.cx+2,b.cy,TT.STATUE);b.set(b.cx,b.cy-1,TT.INCENSE_STAND);b.set(b.cx,b.cy+1,TT.INCENSE_STAND);
    const side=(rings.length-1)%4,dx=side===0?cx0+(cw>>1):side===1?cx0+cw:side===2?cx0+(cw>>1):cx0-1,dy=side===0?cy0-1:side===1?cy0+(ch>>1):side===2?cy0+ch:cy0+(ch>>1);
    setTerrainTile58(state.map,dx,dy,TT.DOOR);setTerrainTile58(state.map,dx+(side===1?1:side===3?-1:0),dy+(side===0?-1:side===2?1:0),g);
    void r;
  }
  for(const k2 of rings)for(let x=b.x0+k2+3;x<b.x1-k2-3;x+=7)if(b.at(x,b.y0+k2)===g)b.set(x,b.y0+k2,TT.LANTERN_POST);
}

function paintGrandMoat(b){
  const g=compoundShell(b),rf=GRAND_TERRAIN_ROOM_FLOOR[b.region];b.filler=TT.WATER;
  // a moat three wide round the walkway, a wall inside it, gates facing the four directions with stepping stones across the water
  b.carve(b.x0+1,b.y0+1,b.iw-2,b.ih-2,TT.WATER);
  const wx0=b.x0+4,wy0=b.y0+4,wx1=b.x1-4,wy1=b.y1-4;
  b.carve(wx0,wy0,wx1-wx0+1,wy1-wy0+1,TT.WALL);
  b.carve(wx0+1,wy0+1,wx1-wx0-1,wy1-wy0-1,g);
  const cross=(x,y)=>{if(b.at(x,y)===TT.WATER){setTerrainTile58(state.map,x,y,TT.SHALLOW_WATER);setTerrainTile58(state.map,x,y,TT.STEPPING_STONE)}};
  for(const [gx,gy,dx,dy] of [[b.cx,wy0,0,-1],[b.cx,wy1,0,1],[wx0,b.cy,-1,0],[wx1,b.cy,1,0]]){
    setTerrainTile58(state.map,gx,gy,TT.DOOR);
    for(let n=1;n<=3;n++)cross(gx+dx*n,gy+dy*n);
    b.set(gx+dy*2,gy+dx*2,TT.LANTERN_POST);b.set(gx-dy*2,gy-dx*2,TT.LANTERN_POST);
  }
  // inside: four corner towers and a keep, a paved yard between them
  for(const [tx,ty,door] of [[wx0+1,wy0+1,[wx0+3,wy0+5]],[wx1-6,wy0+1,[wx1-4,wy0+5]],[wx0+1,wy1-5,[wx0+3,wy1-5]],[wx1-6,wy1-5,[wx1-4,wy1-5]]]){const r=b.room(tx,ty,6,5,rf,[door]);b.furnish(r,compoundProps(b,[TT.RACK,TT.BED,TT.JAR],2))}
  const kw=11,kh=5,r=b.room(b.cx-(kw>>1),b.cy-(kh>>1),kw,kh,TT.GILDED_FLOOR,[[b.cx,b.cy+(kh>>1)],[b.cx,b.cy-(kh>>1)]]);
  b.furnish(r,[TT.STATUE,TT.STATUE,TT.INCENSE_STAND,TT.INCENSE_STAND,TT.BOOK_STACK]);
  for(const [dx,dy] of [[-5,-3],[5,-3],[-5,3],[5,3]])b.set(b.cx+dx,b.cy+dy,TT.LANTERN_POST);
}

/* ---------- vaults: drawings that are stamped, flipped and furnished by substitution ---------- */

// What each character of a template stands for. Surfaces are laid first; props (blocking or not) stand on the surface round them.
const GRAND_VAULT_SURFACE={'#':TT.WALL,'+':TT.DOOR,'~':TT.WATER,':':TT.SHALLOW_WATER,'v':TT.VOID,'l':TT.LAVA,',':TT.GRASS,'s':TT.STONE_PATH,'c':TT.CARPET,'g':TT.GILDED_FLOOR,'I':TT.ICE,'h':TT.HEDGE,'m':TT.BAMBOO,w:TT.WINDOW};
const GRAND_VAULT_PROP={T:TT.GARDEN_TREE,r:TT.ROCK,P:TT.STONE_PILLAR,L:TT.LANTERN_POST,S:TT.STATUE,B:TT.BED,t:TT.TABLE,k:TT.BOOK_STACK,b:TT.BENCH,i:TT.INCENSE_STAND,C:TT.CRYSTAL,F:TT.FLOWERBED,W:TT.BASIN,M:TT.MOON_GATE,j:TT.JAR,a:TT.RACK,n:TT.CRATE,o:TT.SCREEN,f:TT.LOW_FENCE,e:TT.REED,'*':TT.LOTUS_FLOWER,'=':TT.STEPPING_STONE};
const GRAND_VAULT_WATER_PROPS=new Set(['e','*','=']);

function grandVaultRows(vault,tf){
  let g=vault.rows.map(r=>[...r]);
  if(tf?.rot)g=Array.from({length:g[0].length},(_,x)=>g.map(r=>r[x]));
  if(tf?.flipY)g.reverse();
  if(tf?.flipX)g=g.map(r=>[...r].reverse());
  // substitution: each cell of a listed character becomes one of its weighted alternatives
  return g.map(r=>r.map(ch=>{
    const alt=vault.subst[ch];if(!alt)return ch;
    let roll=globalThis.__MANRU_RANDOM57__()*alt.reduce((n,a)=>n+a[1],0);
    for(const [to,weight] of alt){roll-=weight;if(roll<=0)return to}
    return alt[0][0];
  }));
}

// Lays a drawing (rows of glyphs) on the map with its top-left cell at (x0,y0): surfaces first, then props standing on the floor round them.
// '.' is the ground of the place and 'R' the floor of its rooms. Used by the vaults of the grand terrain and by the tiles of the second floor.
function stampGrandGlyphs(rows,x0,y0,ground,roomFloor){
  const m=state.map,props=[];
  rows.forEach((row,j)=>[...row].forEach((ch,i)=>{
    const x=x0+i,y=y0+j;
    if(ch==='.')setTerrainTile58(m,x,y,ground);
    else if(ch==='R')setTerrainTile58(m,x,y,roomFloor);
    else if(GRAND_VAULT_SURFACE[ch]!==undefined)setTerrainTile58(m,x,y,GRAND_VAULT_SURFACE[ch]);
    else if(GRAND_VAULT_PROP[ch]!==undefined){setTerrainTile58(m,x,y,GRAND_VAULT_WATER_PROPS.has(ch)?TT.SHALLOW_WATER:ground);props.push([x,y,ch])}
    else setTerrainTile58(m,x,y,ground);
  }));
  // a prop stands on the floor of its surroundings (a bed on the room floor, a statue on carpet)
  for(const [x,y,ch] of props){
    if(GRAND_VAULT_WATER_PROPS.has(ch)){setTerrainTile58(m,x,y,GRAND_VAULT_PROP[ch]);continue}
    const count=new Map();
    for(const [dx,dy] of DIRS8){const t=m[y+dy]?.[x+dx];if(t!==undefined&&GRAND_TERRAIN_WALK.has(t)&&t!==TT.DOOR&&t!==TT.OPEN_DOOR&&t!==TT.STEPPING_STONE&&t!==TT.REED&&t!==TT.LOTUS_FLOWER&&t!==TT.MOON_GATE)count.set(t,(count.get(t)||0)+1)}
    let base=ground,best=0;for(const [t,n] of count)if(n>best){best=n;base=t}
    setTerrainTile58(m,x,y,base);setTerrainTile58(m,x,y,GRAND_VAULT_PROP[ch]);
  }
}

function paintGrandVault(b){
  const vault=GRAND_VAULTS.find(v=>v.id===b.source.terrain93),rows=grandVaultRows(vault,b.source.vaultTf93),h=rows.length,w=rows[0].length,x0=b.x0+1,y0=b.y0+1;
  b.filler=vault.id==='foundry'?TT.LAVA:TT.ROCK;
  b.carve(b.x0,b.y0,b.iw,b.ih,GRAND_TERRAIN_GROUND[b.region]);
  stampGrandGlyphs(rows.map(r=>r.join('')),x0,y0,GRAND_TERRAIN_GROUND[b.region],GRAND_TERRAIN_ROOM_FLOOR[b.region]);
  grandVaultRooms(x0,y0,w,h);
}

// Walled spaces of a stamped vault join the floor's room list, so monsters and loot come to them like to any room.
function grandVaultRooms(x0,y0,w,h){
  const m=state.map,seen=new Set(),open=(x,y)=>{const t=m[y][x];return t!==TT.WALL&&t!==TT.DOOR&&t!==TT.OPEN_DOOR&&t!==TT.WATER&&t!==TT.VOID&&t!==TT.LAVA&&t!==TT.SHALLOW_WATER};
  for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){
    if(seen.has(y*COLS+x)||!open(x,y))continue;
    const stack=[[x,y]],comp=[];seen.add(y*COLS+x);let touchesEdge=false,bx0=x,bx1=x,by0=y,by1=y;
    while(stack.length){
      const [cx,cy]=stack.pop();comp.push([cx,cy]);
      bx0=Math.min(bx0,cx);bx1=Math.max(bx1,cx);by0=Math.min(by0,cy);by1=Math.max(by1,cy);
      if(cx===x0||cy===y0||cx===x0+w-1||cy===y0+h-1)touchesEdge=true;
      for(const [dx,dy] of DIRS4){const nx=cx+dx,ny=cy+dy;if(nx<x0||ny<y0||nx>=x0+w||ny>=y0+h||seen.has(ny*COLS+nx)||!open(nx,ny))continue;seen.add(ny*COLS+nx);stack.push([nx,ny])}
    }
    const bw=bx1-bx0+1,bh=by1-by0+1;
    if(!touchesEdge&&comp.length>=6&&comp.length<=70&&bw>=3&&bh>=2)state.rooms.push(roomRect(bx0-1,by0-1,bw+2,bh+2));
  }
}
