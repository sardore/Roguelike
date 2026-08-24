import { Rng } from './rng';
import type { GameState, Point, Tile, TileKind } from './types';

const W = 37;
const H = 25;
const idx = (x:number,y:number) => y * W + x;

function tile(kind:TileKind, variant=0, room?:string):Tile { return { kind, variant, room, discovered:false, visible:false }; }
function fillRect(tiles:Tile[], x:number,y:number,w:number,h:number,kind:TileKind,room:string,rng:Rng){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)tiles[idx(xx,yy)]=tile(kind,rng.int(0,15),room);}
function wallRect(tiles:Tile[],x:number,y:number,w:number,h:number,room:string,rng:Rng){for(let xx=x;xx<x+w;xx++){tiles[idx(xx,y)]=tile('wall',rng.int(0,15),room);tiles[idx(xx,y+h-1)]=tile('wall',rng.int(0,15),room);}for(let yy=y;yy<y+h;yy++){tiles[idx(x,yy)]=tile('wall',rng.int(0,15),room);tiles[idx(x+w-1,yy)]=tile('wall',rng.int(0,15),room);}}
function set(tiles:Tile[],x:number,y:number,kind:TileKind,room?:string,v=0){tiles[idx(x,y)]=tile(kind,v,room);}
function fixture(tiles:Tile[],x:number,y:number,name:Tile['fixture'],blocks=true){const t=tiles[idx(x,y)];if(!t)return;t.fixture=name;t.blocks=blocks;}

export function createWorld(seed:number):GameState {
  const rng=new Rng(seed);const tiles=Array.from({length:W*H},()=>tile('wall',rng.int(0,15),'old-city'));
  fillRect(tiles,1,10,35,6,'floor','apothecaries-row',rng);
  fillRect(tiles,12,8,4,2,'floor','north-alley',rng);fillRect(tiles,1,9,4,1,'floor','apothecaries-row',rng);fillRect(tiles,32,9,4,1,'floor','apothecaries-row',rng);

  fillRect(tiles,2,2,9,7,'floor','herbalist',rng);wallRect(tiles,1,1,11,9,'herbalist-wall',rng);for(let x=2;x<=10;x++)set(tiles,x,5,'wall','herbalist-divider',rng.int(0,15));set(tiles,6,5,'door','herbalist-door',2);set(tiles,7,9,'door','herbalist-door',1);
  fillRect(tiles,12,2,4,8,'floor','north-alley',rng);fixture(tiles,13,4,'barrel');fixture(tiles,14,7,'pipe',false);
  fillRect(tiles,17,2,11,7,'floor','distillery',rng);wallRect(tiles,16,1,13,9,'distillery-wall',rng);set(tiles,22,9,'door','distillery-door',3);

  fillRect(tiles,3,17,12,6,'floor','courtyard',rng);wallRect(tiles,2,16,14,8,'courtyard-wall',rng);set(tiles,8,16,'door','courtyard-door',2);set(tiles,15,19,'door','courtyard-door',1);fillRect(tiles,16,18,3,4,'floor','service-passage',rng);
  fillRect(tiles,28,17,7,7,'floor','sealed-shop',rng);wallRect(tiles,27,16,9,9,'sealed-shop-wall',rng);set(tiles,31,16,'door','sealed-door',5);set(tiles,27,20,'door','sealed-door',5);fillRect(tiles,23,15,4,6,'floor','service-passage',rng);set(tiles,33,22,'stairs','sealed-shop',0);

  for(const [x,y] of [[4,14],[10,15],[17,14],[24,15],[33,14]] as const)set(tiles,x,y,'water','street-drain',rng.int(0,4));
  for(const [x,y] of [[19,4],[20,4],[21,4],[21,5],[31,19],[32,19],[31,20]] as const)set(tiles,x,y,'acid','spill',rng.int(0,3));

  fixture(tiles,3,3,'shelf');fixture(tiles,8,3,'shelf');fixture(tiles,3,6,'cabinet');fixture(tiles,9,6,'herbs',false);fixture(tiles,5,7,'counter');fixture(tiles,6,7,'counter');fixture(tiles,9,7,'table');
  fixture(tiles,18,3,'still');fixture(tiles,23,3,'still');fixture(tiles,26,3,'vat');fixture(tiles,18,6,'barrel');fixture(tiles,24,6,'crate');fixture(tiles,26,6,'pipe',false);fixture(tiles,21,7,'table');
  fixture(tiles,5,18,'planter');fixture(tiles,9,18,'planter');fixture(tiles,5,21,'planter');fixture(tiles,12,21,'crate');fixture(tiles,11,18,'fountain');fixture(tiles,4,21,'barrel');
  fixture(tiles,29,18,'crate');fixture(tiles,33,18,'shelf');fixture(tiles,28,20,'boards');fixture(tiles,33,20,'cabinet');fixture(tiles,34,21,'crate');fixture(tiles,29,22,'rubble',false);

  fixture(tiles,2,13,'cart');fixture(tiles,6,10,'awning',false);fixture(tiles,9,10,'sign',false);fixture(tiles,20,10,'awning',false);fixture(tiles,24,10,'sign',false);
  fixture(tiles,4,11,'lamp',false);fixture(tiles,15,11,'lamp',false);fixture(tiles,28,12,'lamp',false);fixture(tiles,14,13,'crate');fixture(tiles,34,13,'barrel');
  fixture(tiles,9,14,'grate',false);fixture(tiles,18,14,'grate',false);fixture(tiles,26,13,'grate',false);fixture(tiles,24,17,'pipe',false);fixture(tiles,26,18,'pipe',false);

  const state:GameState={
    width:W,height:H,tiles,
    player:{x:18,y:12,hp:20,maxHp:20,guard:0,inventory:['red-phial','salt-bomb'],statuses:[]},
    enemies:[{id:'mite-a',kind:'glass-mite',x:9,y:4,hp:5,cooldown:0},{id:'rat-a',kind:'distiller-rat',x:24,y:4,hp:9,cooldown:0},{id:'hound-a',kind:'vapor-hound',x:31,y:21,hp:13,cooldown:1}],
    items:[{id:'tonic-a',kind:'blue-tonic',x:4,y:4},{id:'chalk-a',kind:'chalk',x:18,y:6},{id:'salt-b',kind:'salt-bomb',x:31,y:18}],
    turn:0,messages:[{text:'Apothecaries’ Row is quiet. Copper pipes click somewhere behind the shutters.',tone:'odd'}],seed,over:false,won:false,noise:[]
  };
  updateVisibility(state);return state;
}
export function at(state:GameState,p:Point):Tile|undefined{if(p.x<0||p.y<0||p.x>=state.width||p.y>=state.height)return undefined;return state.tiles[p.y*state.width+p.x];}
function canSee(state:GameState,x0:number,y0:number,x1:number,y1:number):boolean{let x=x0,y=y0;const dx=Math.abs(x1-x0),sx=x0<x1?1:-1;const dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;while(!(x===x1&&y===y1)){const e2=2*err;if(e2>=dy){err+=dy;x+=sx;}if(e2<=dx){err+=dx;y+=sy;}if(x===x1&&y===y1)return true;const t=at(state,{x,y});if(!t||t.kind==='wall')return false;}return true;}
function isSurfaceWall(state:GameState,x:number,y:number,t:Tile):boolean{if(t.kind!=='wall'||t.room!=='old-city')return true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){const n=at(state,{x:x+dx,y:y+dy});if(n&&n.kind!=='wall')return true;}return false;}
export function updateVisibility(state:GameState){for(const t of state.tiles)t.visible=false;const r=9,r2=r*r;for(let y=Math.max(0,state.player.y-r);y<=Math.min(state.height-1,state.player.y+r);y++)for(let x=Math.max(0,state.player.x-r);x<=Math.min(state.width-1,state.player.x+r);x++){const dx=x-state.player.x,dy=y-state.player.y;if(dx*dx+dy*dy>r2)continue;const t=state.tiles[y*state.width+x];if(!t||!isSurfaceWall(state,x,y,t))continue;if(!canSee(state,state.player.x,state.player.y,x,y))continue;t.visible=true;t.discovered=true;}}
