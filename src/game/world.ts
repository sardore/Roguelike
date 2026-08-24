import { Rng } from './rng';
import type { GameState, Point, Tile, TileKind } from './types';

const W = 37;
const H = 25;
const idx = (x:number,y:number) => y * W + x;

function tile(kind:TileKind, variant=0, room?:string):Tile {
  return { kind, variant, room, discovered:false, visible:false };
}
function fillRect(tiles:Tile[], x:number,y:number,w:number,h:number,kind:TileKind,room:string,rng:Rng){
  for(let yy=y; yy<y+h; yy++) for(let xx=x; xx<x+w; xx++) tiles[idx(xx,yy)] = tile(kind,rng.int(0,15),room);
}
function wallRect(tiles:Tile[], x:number,y:number,w:number,h:number,room:string,rng:Rng){
  for(let xx=x; xx<x+w; xx++){
    tiles[idx(xx,y)] = tile('wall',rng.int(0,15),room);
    tiles[idx(xx,y+h-1)] = tile('wall',rng.int(0,15),room);
  }
  for(let yy=y; yy<y+h; yy++){
    tiles[idx(x,yy)] = tile('wall',rng.int(0,15),room);
    tiles[idx(x+w-1,yy)] = tile('wall',rng.int(0,15),room);
  }
}
function set(tiles:Tile[],x:number,y:number,kind:TileKind,room?:string,v=0){ tiles[idx(x,y)] = tile(kind,v,room); }
function fixture(tiles:Tile[],x:number,y:number,name:Tile['fixture'],blocks=true){
  const t = tiles[idx(x,y)]; if(!t) return; t.fixture=name; t.blocks=blocks;
}

export function createWorld(seed:number):GameState {
  const rng = new Rng(seed);
  const tiles = Array.from({length:W*H},()=>tile('wall',rng.int(0,15),'old-city'));

  // Main street: intentionally irregular, with storefront recesses and a slight dogleg.
  for(let x=1;x<=35;x++){
    const top = x<7?9:x<15?8:x<24?9:x<31?8:10;
    const bottom = x<9?15:x<18?16:x<28?15:16;
    for(let y=top;y<=bottom;y++) set(tiles,x,y,'floor','apothecaries-row',rng.int(0,15));
  }
  for(const [x,y] of [[4,8],[5,8],[13,7],[14,7],[15,8],[24,7],[25,7],[30,9],[31,9],[18,16],[19,16],[28,16]] as const)
    set(tiles,x,y,'floor','apothecaries-row',rng.int(0,15));

  // Narrow service lane behind the central shops.
  fillRect(tiles,11,4,4,5,'floor','north-alley',rng);
  fillRect(tiles,14,6,4,3,'floor','north-alley',rng);
  fillRect(tiles,12,3,2,2,'floor','north-alley',rng);

  // Herbalist: front shop + smaller preparation room divided by a counter wall.
  fillRect(tiles,2,2,9,7,'floor','herbalist',rng);
  wallRect(tiles,1,1,11,9,'herbalist-wall',rng);
  for(let x=2;x<=10;x++) set(tiles,x,5,'wall','herbalist-divider',rng.int(0,15));
  set(tiles,6,5,'door','herbalist-door',2);
  set(tiles,7,9,'door','herbalist-door',1);

  // Distillery: broader industrial room with a rear hot-work alcove.
  fillRect(tiles,17,2,11,7,'floor','distillery',rng);
  wallRect(tiles,16,1,13,9,'distillery-wall',rng);
  fillRect(tiles,19,1,5,2,'floor','distillery',rng);
  set(tiles,22,9,'door','distillery-door',3);

  // Courtyard and physic garden.
  fillRect(tiles,3,16,12,7,'floor','courtyard',rng);
  wallRect(tiles,2,15,14,9,'courtyard-wall',rng);
  fillRect(tiles,15,18,3,4,'floor','courtyard',rng);
  set(tiles,14,18,'door','courtyard-door',1);
  set(tiles,8,15,'door','courtyard-door',2);

  // Boarded shop and narrow service passage to it.
  fillRect(tiles,27,11,8,11,'floor','sealed-shop',rng);
  wallRect(tiles,26,10,10,13,'sealed-shop-wall',rng);
  fillRect(tiles,24,14,3,4,'floor','service-passage',rng);
  set(tiles,26,15,'door','sealed-door',5);
  set(tiles,30,10,'door','sealed-door',5);

  // Street drains, wet gutters and alchemical spill.
  for(const [x,y] of [[4,14],[10,15],[17,15],[24,14],[33,15]] as const)
    set(tiles,x,y,'water','street-drain',rng.int(0,4));
  for(const [x,y] of [[19,4],[20,4],[21,4],[21,5],[31,17],[32,17],[31,18]] as const)
    set(tiles,x,y,'acid','spill',rng.int(0,3));
  set(tiles,33,20,'stairs','sealed-shop',0);

  // Herbalist visual grammar: shelves along walls, preparation counter, hanging plants.
  fixture(tiles,3,3,'shelf'); fixture(tiles,8,3,'shelf');
  fixture(tiles,3,6,'cabinet'); fixture(tiles,9,6,'herbs',false);
  fixture(tiles,5,7,'counter'); fixture(tiles,6,7,'counter');
  fixture(tiles,9,7,'table');

  // Distillery visual grammar: copper machinery, vats, pipe runs, barrels.
  fixture(tiles,18,3,'still'); fixture(tiles,23,3,'still');
  fixture(tiles,26,3,'vat'); fixture(tiles,18,6,'barrel');
  fixture(tiles,24,6,'crate'); fixture(tiles,26,6,'pipe',false);
  fixture(tiles,20,7,'table');

  // Courtyard: useful breathing space with a small medicinal garden, not an empty rectangle.
  fixture(tiles,5,18,'planter'); fixture(tiles,9,18,'planter');
  fixture(tiles,6,21,'planter'); fixture(tiles,11,21,'crate');
  fixture(tiles,11,18,'fountain'); fixture(tiles,4,21,'barrel');

  // Sealed shop: visually dense, obstructed and suspicious.
  fixture(tiles,29,12,'crate'); fixture(tiles,33,13,'shelf');
  fixture(tiles,28,16,'boards'); fixture(tiles,32,19,'cabinet');
  fixture(tiles,34,12,'crate'); fixture(tiles,29,19,'rubble',false);

  // Street furniture and shopfront identity.
  fixture(tiles,2,12,'cart'); fixture(tiles,6,10,'awning',false);
  fixture(tiles,8,10,'sign',false); fixture(tiles,15,12,'crate');
  fixture(tiles,18,10,'awning',false); fixture(tiles,21,10,'sign',false);
  fixture(tiles,29,14,'lamp',false); fixture(tiles,12,12,'lamp',false);
  fixture(tiles,20,11,'lamp',false); fixture(tiles,34,12,'barrel');
  fixture(tiles,9,13,'grate',false); fixture(tiles,18,13,'grate',false); fixture(tiles,26,12,'grate',false);
  fixture(tiles,24,16,'pipe',false); fixture(tiles,32,14,'pipe',false);

  const state:GameState = {
    width:W, height:H, tiles,
    player:{x:13,y:12,hp:20,maxHp:20,guard:0,inventory:['red-phial','salt-bomb'],statuses:[]},
    enemies:[
      {id:'mite-a',kind:'glass-mite',x:9,y:3,hp:5,cooldown:0},
      {id:'rat-a',kind:'distiller-rat',x:24,y:4,hp:9,cooldown:0},
      {id:'hound-a',kind:'vapor-hound',x:32,y:19,hp:13,cooldown:1}
    ],
    items:[
      {id:'tonic-a',kind:'blue-tonic',x:4,y:3},
      {id:'chalk-a',kind:'chalk',x:18,y:6},
      {id:'salt-b',kind:'salt-bomb',x:31,y:13}
    ],
    turn:0,
    messages:[{text:'Apothecaries’ Row is quiet. Copper pipes click somewhere behind the walls.',tone:'odd'}],
    seed, over:false, won:false, noise:[]
  };
  updateVisibility(state);
  return state;
}

export function at(state:GameState,p:Point):Tile|undefined {
  if(p.x<0||p.y<0||p.x>=state.width||p.y>=state.height) return undefined;
  return state.tiles[p.y*state.width+p.x];
}

function canSee(state:GameState,x0:number,y0:number,x1:number,y1:number):boolean {
  let x=x0, y=y0;
  const dx=Math.abs(x1-x0), sx=x0<x1?1:-1;
  const dy=-Math.abs(y1-y0), sy=y0<y1?1:-1;
  let err=dx+dy;
  while(!(x===x1&&y===y1)){
    const e2=2*err;
    if(e2>=dy){err+=dy;x+=sx;}
    if(e2<=dx){err+=dx;y+=sy;}
    if(x===x1&&y===y1) return true;
    const t=at(state,{x,y});
    if(!t||t.kind==='wall') return false;
  }
  return true;
}

export function updateVisibility(state:GameState){
  for(const t of state.tiles) t.visible=false;
  const r=9, r2=r*r;
  for(let y=Math.max(0,state.player.y-r);y<=Math.min(state.height-1,state.player.y+r);y++){
    for(let x=Math.max(0,state.player.x-r);x<=Math.min(state.width-1,state.player.x+r);x++){
      const dx=x-state.player.x,dy=y-state.player.y;
      if(dx*dx+dy*dy>r2) continue;
      if(!canSee(state,state.player.x,state.player.y,x,y)) continue;
      const t=state.tiles[y*state.width+x];
      if(t){t.visible=true;t.discovered=true;}
    }
  }
}
