import { Rng } from './rng';
import type { GameState, Point, Tile, TileKind } from './types';

const W=49,H=31;
const idx=(x:number,y:number)=>y*W+x;

function tile(kind:TileKind,variant=0,room?:string):Tile{return{kind,variant,room,discovered:false,visible:false}}
function fillRect(tiles:Tile[],x:number,y:number,w:number,h:number,kind:TileKind,room:string,rng:Rng){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)tiles[idx(xx,yy)]=tile(kind,rng.int(0,15),room)}
function wallRect(tiles:Tile[],x:number,y:number,w:number,h:number,room:string,rng:Rng){for(let xx=x;xx<x+w;xx++){tiles[idx(xx,y)]=tile('wall',rng.int(0,15),room);tiles[idx(xx,y+h-1)]=tile('wall',rng.int(0,15),room)}for(let yy=y;yy<y+h;yy++){tiles[idx(x,yy)]=tile('wall',rng.int(0,15),room);tiles[idx(x+w-1,yy)]=tile('wall',rng.int(0,15),room)}}
function set(tiles:Tile[],x:number,y:number,kind:TileKind,room?:string,v=0){tiles[idx(x,y)]=tile(kind,v,room)}
function fixture(tiles:Tile[],x:number,y:number,name:Tile['fixture'],blocks=true,state=0){const t=tiles[idx(x,y)];if(!t)return;t.fixture=name;t.blocks=blocks;t.state=state}

export function createWorld(seed:number):GameState{
  const rng=new Rng(seed);
  const tiles=Array.from({length:W*H},()=>tile('wall',rng.int(0,15),'old-city'));
  fillRect(tiles,1,12,47,6,'floor','apothecaries-row',rng);
  fillRect(tiles,1,11,5,1,'floor','apothecaries-row',rng);
  fillRect(tiles,44,11,4,1,'floor','apothecaries-row',rng);
  fillRect(tiles,2,2,10,9,'floor','herbalist',rng);wallRect(tiles,1,1,12,11,'herbalist-wall',rng);
  for(let x=2;x<=11;x++)set(tiles,x,6,'wall','herbalist-divider',rng.int(0,15));
  set(tiles,6,6,'door','herbalist-door',2);set(tiles,7,11,'door','herbalist-door',1);
  fillRect(tiles,13,2,3,10,'floor','north-alley',rng);fixture(tiles,14,4,'barrel');fixture(tiles,14,8,'pipe',false);
  fillRect(tiles,17,2,14,9,'floor','distillery',rng);wallRect(tiles,16,1,16,11,'distillery-wall',rng);set(tiles,24,11,'door','distillery-door',3);
  fillRect(tiles,33,2,14,9,'floor','glassworks',rng);wallRect(tiles,32,1,16,11,'glassworks-wall',rng);set(tiles,39,11,'door','glassworks-door',3);
  for(const [x,y] of [[35,4],[36,4],[37,4],[41,5],[42,5],[43,5],[36,8],[42,8]] as const)set(tiles,x,y,'glass','glassworks',rng.int(0,3));
  fillRect(tiles,3,20,13,9,'floor','courtyard',rng);wallRect(tiles,2,19,15,11,'courtyard-wall',rng);set(tiles,8,19,'door','courtyard-door',2);set(tiles,16,24,'door','courtyard-door',1);
  fillRect(tiles,17,21,5,6,'floor','service-passage',rng);fillRect(tiles,20,17,2,5,'floor','service-passage',rng);
  fillRect(tiles,23,20,10,9,'floor','underworks',rng);wallRect(tiles,22,19,12,11,'underworks-wall',rng);set(tiles,27,19,'door','underworks-door',2);set(tiles,33,24,'door','underworks-door',1);
  fillRect(tiles,35,20,12,9,'floor','sealed-shop',rng);wallRect(tiles,34,19,14,11,'sealed-shop-wall',rng);set(tiles,39,19,'door','sealed-door',5);set(tiles,34,24,'floor','sealed-shop',0);fixture(tiles,34,24,'brass-gate',true,0);set(tiles,45,27,'stairs','sealed-shop',0);
  for(const [x,y] of [[5,16],[12,17],[19,16],[28,17],[37,16],[45,17]] as const)set(tiles,x,y,'water','street-drain',rng.int(0,4));
  for(const [x,y] of [[29,13],[30,13],[31,13],[30,14],[40,15]] as const)set(tiles,x,y,'oil','apothecaries-row',rng.int(0,3));
  for(const [x,y] of [[20,4],[21,4],[22,4],[22,5],[27,8]] as const)set(tiles,x,y,'acid','distillery',rng.int(0,3));
  for(const [x,y] of [[25,24],[26,24],[27,24],[25,25],[26,25],[29,26]] as const)set(tiles,x,y,'sludge','underworks',rng.int(0,3));
  for(const [x,y] of [[30,22],[30,23],[29,23]] as const)set(tiles,x,y,'steam','underworks',3);
  for(const [x,y] of [[38,23],[39,23],[40,23],[39,24]] as const)set(tiles,x,y,'rune','sealed-shop',rng.int(0,3));
  fixture(tiles,3,3,'shelf');fixture(tiles,9,3,'shelf');fixture(tiles,3,7,'cabinet');fixture(tiles,10,7,'herbs',false);
  fixture(tiles,5,9,'counter');fixture(tiles,6,9,'counter');fixture(tiles,10,9,'table');fixture(tiles,4,4,'sealed-cache',true,0);
  fixture(tiles,18,3,'still');fixture(tiles,24,3,'still');fixture(tiles,29,3,'vat');fixture(tiles,18,7,'barrel');fixture(tiles,25,7,'crate');fixture(tiles,29,7,'pipe',false);
  fixture(tiles,22,9,'retort',true,0);fixture(tiles,27,9,'table');
  fixture(tiles,34,3,'shelf');fixture(tiles,38,3,'cage');fixture(tiles,45,3,'incinerator',true,0);fixture(tiles,34,8,'crate');fixture(tiles,45,8,'sealed-cache',true,0);
  fixture(tiles,5,21,'planter');fixture(tiles,10,21,'planter');fixture(tiles,5,27,'planter');fixture(tiles,13,27,'crate');fixture(tiles,11,24,'fountain',true,1);fixture(tiles,4,27,'barrel');
  fixture(tiles,24,21,'boiler',true,0);fixture(tiles,31,21,'pipe',false);fixture(tiles,28,27,'lever',true,0);fixture(tiles,24,27,'grate',false);fixture(tiles,31,27,'grate',false);
  fixture(tiles,36,21,'cabinet');fixture(tiles,44,21,'shelf');fixture(tiles,37,27,'boards');fixture(tiles,43,26,'ward-pylon',true,0);fixture(tiles,45,24,'sealed-cache',true,0);
  fixture(tiles,3,15,'cart');fixture(tiles,7,12,'awning',false);fixture(tiles,10,12,'sign',false);fixture(tiles,21,12,'awning',false);fixture(tiles,25,12,'sign',false);fixture(tiles,38,12,'awning',false);
  fixture(tiles,5,13,'lamp',false);fixture(tiles,16,14,'lamp',false);fixture(tiles,34,14,'lamp',false);fixture(tiles,47,14,'lamp',false);
  fixture(tiles,15,16,'crate');fixture(tiles,47,16,'barrel');fixture(tiles,10,16,'grate',false);fixture(tiles,20,16,'grate',false);fixture(tiles,35,16,'grate',false);
  const incident=rng.int(0,2);
  if(incident===0){set(tiles,18,14,'steam','apothecaries-row',2);set(tiles,19,14,'steam','apothecaries-row',2)}
  if(incident===1){set(tiles,42,14,'glass','apothecaries-row',2);set(tiles,43,14,'glass','apothecaries-row',1)}
  if(incident===2){set(tiles,11,14,'sludge','apothecaries-row',1);set(tiles,12,14,'sludge','apothecaries-row',1)}
  const state:GameState={width:W,height:H,tiles,player:{x:24,y:14,hp:22,maxHp:22,guard:0,inventory:['red-phial','salt-bomb'],statuses:[]},enemies:[{id:'mite-a',kind:'glass-mite',x:9,y:4,hp:5,cooldown:0},{id:'rat-a',kind:'distiller-rat',x:26,y:5,hp:9,cooldown:0},{id:'leech-a',kind:'retort-leech',x:21,y:8,hp:8,cooldown:0},{id:'sprite-a',kind:'soot-sprite',x:43,y:6,hp:6,cooldown:0},{id:'warden-a',kind:'brine-warden',x:29,y:25,hp:16,cooldown:0},{id:'alchemist-a',kind:'gutter-alchemist',x:41,y:14,hp:10,cooldown:2},{id:'hound-a',kind:'vapor-hound',x:42,y:25,hp:13,cooldown:1}],items:[{id:'tonic-a',kind:'blue-tonic',x:8,y:8},{id:'chalk-a',kind:'chalk',x:18,y:8},{id:'smoke-a',kind:'smoke-ampoule',x:36,y:8},{id:'neutralizer-a',kind:'neutralizer',x:13,y:25},{id:'key-a',kind:'copper-key',x:30,y:27},{id:'catalyst-a',kind:'black-catalyst',x:44,y:26}],turn:0,messages:[{text:'Apothecaries’ Row is quiet. Copper pipes click somewhere behind the shutters.',tone:'odd'}],seed,over:false,won:false,noise:[],enteredRooms:['apothecaries-row'],districtStage:1};
  updateVisibility(state);return state;
}
export function at(state:GameState,p:Point):Tile|undefined{if(p.x<0||p.y<0||p.x>=state.width||p.y>=state.height)return undefined;return state.tiles[p.y*state.width+p.x]}
function canSee(state:GameState,x0:number,y0:number,x1:number,y1:number):boolean{let x=x0,y=y0;const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;while(!(x===x1&&y===y1)){const e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}if(x===x1&&y===y1)return true;const t=at(state,{x,y});if(!t||t.kind==='wall'||t.kind==='steam')return false}return true}
function isSurfaceWall(state:GameState,x:number,y:number,t:Tile):boolean{if(t.kind!=='wall'||t.room!=='old-city')return true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){const n=at(state,{x:x+dx,y:y+dy});if(n&&n.kind!=='wall')return true}return false}
export function updateVisibility(state:GameState){for(const t of state.tiles)t.visible=false;const r=10,r2=r*r;for(let y=Math.max(0,state.player.y-r);y<=Math.min(state.height-1,state.player.y+r);y++)for(let x=Math.max(0,state.player.x-r);x<=Math.min(state.width-1,state.player.x+r);x++){const dx=x-state.player.x,dy=y-state.player.y;if(dx*dx+dy*dy>r2)continue;const t=state.tiles[y*state.width+x];if(!t||!isSurfaceWall(state,x,y,t))continue;if(!canSee(state,state.player.x,state.player.y,x,y))continue;t.visible=true;t.discovered=true}}
