import { Rng } from './rng';
import type { Enemy, GameState, GroundItem, Tile, TileKind } from './types';
import { updateVisibility } from './world';

const W=51,H=33,idx=(x:number,y:number)=>y*W+x;
function tile(kind:TileKind,variant=0,room?:string):Tile{return{kind,variant,room,discovered:false,visible:false}}
function fillRect(tiles:Tile[],x:number,y:number,w:number,h:number,kind:TileKind,room:string,rng:Rng){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)tiles[idx(xx,yy)]=tile(kind,rng.int(0,15),room)}
function wallRect(tiles:Tile[],x:number,y:number,w:number,h:number,room:string,rng:Rng){for(let xx=x;xx<x+w;xx++){tiles[idx(xx,y)]=tile('wall',rng.int(0,15),room);tiles[idx(xx,y+h-1)]=tile('wall',rng.int(0,15),room)}for(let yy=y;yy<y+h;yy++){tiles[idx(x,yy)]=tile('wall',rng.int(0,15),room);tiles[idx(x+w-1,yy)]=tile('wall',rng.int(0,15),room)}}
function set(tiles:Tile[],x:number,y:number,kind:TileKind,room?:string,v=0){tiles[idx(x,y)]=tile(kind,v,room)}
function fixture(tiles:Tile[],x:number,y:number,name:Tile['fixture'],blocks=true,state=0){const t=tiles[idx(x,y)];if(!t)return;t.fixture=name;t.blocks=blocks;t.state=state}
function enemy(kind:Enemy['kind'],id:string,x:number,y:number,hp:number,cooldown=0):Enemy{return{id,kind,x,y,hp,cooldown}}
function item(kind:GroundItem['kind'],id:string,x:number,y:number):GroundItem{return{id,kind,x,y}}

function stageFour(tiles:Tile[],rng:Rng){
  fillRect(tiles,2,14,47,5,'floor','vitreous-catacombs',rng);fillRect(tiles,14,18,4,9,'floor','catacomb-passages',rng);fillRect(tiles,34,18,4,9,'floor','catacomb-passages',rng);
  fillRect(tiles,2,2,13,10,'floor','mirror-ossuary',rng);wallRect(tiles,1,1,15,12,'mirror-ossuary-wall',rng);set(tiles,8,12,'door','mirror-ossuary-door',2);
  fillRect(tiles,19,2,14,10,'floor','crystal-vault',rng);wallRect(tiles,18,1,16,12,'crystal-vault-wall',rng);set(tiles,26,12,'door','crystal-vault-door',2);
  fillRect(tiles,37,2,12,10,'floor','preservation-hall',rng);wallRect(tiles,36,1,14,12,'preservation-hall-wall',rng);set(tiles,43,12,'door','preservation-hall-door',2);
  fillRect(tiles,2,21,11,9,'floor','drain-chapel',rng);wallRect(tiles,1,20,13,11,'drain-chapel-wall',rng);set(tiles,7,20,'door','drain-chapel-door',2);
  fillRect(tiles,18,21,15,9,'floor','specimen-crypt',rng);wallRect(tiles,17,20,17,11,'specimen-crypt-wall',rng);set(tiles,25,20,'door','specimen-crypt-door',2);
  fillRect(tiles,39,21,10,9,'floor','sealed-archive',rng);wallRect(tiles,38,20,12,11,'sealed-archive-wall',rng);set(tiles,44,20,'door','sealed-archive-door',3);fixture(tiles,44,20,'brass-gate',true,0);set(tiles,47,28,'stairs','sealed-archive',0);
  for(const [x,y] of [[4,4],[5,4],[6,5],[10,7],[11,8],[22,4],[23,4],[24,5],[29,7],[30,8]] as const)set(tiles,x,y,'crystal',x<16?'mirror-ossuary':'crystal-vault',rng.int(0,3));
  for(const [x,y] of [[39,4],[40,4],[41,4],[46,7]] as const)set(tiles,x,y,'miasma','preservation-hall',3);
  for(const [x,y] of [[3,24],[4,24],[5,24],[6,24],[3,25],[6,25],[3,26],[4,26],[5,26],[6,26]] as const)set(tiles,x,y,'brine','drain-chapel',2);
  for(const [x,y] of [[20,24],[21,24],[22,24],[28,25],[29,25]] as const)set(tiles,x,y,'glass','specimen-crypt',2);
  for(const [x,y] of [[40,24],[41,24],[42,24],[45,26]] as const)set(tiles,x,y,'rune','sealed-archive',2);
  fixture(tiles,4,3,'silver-mirror',true,0);fixture(tiles,11,3,'archive-desk',true,0);fixture(tiles,22,3,'transmuter',true,0);fixture(tiles,30,3,'sealed-cache',true,0);fixture(tiles,39,3,'cage',true,0);fixture(tiles,47,3,'ward-pylon',true,0);
  fixture(tiles,4,23,'fountain',true,1);fixture(tiles,10,27,'valve',true,0);fixture(tiles,20,23,'cage',true,0);fixture(tiles,29,27,'sealed-cache',true,0);fixture(tiles,41,23,'archive-desk',true,0);fixture(tiles,47,27,'lever',true,0);
  for(const [x,y] of [[18,15],[23,17],[30,15],[35,17]] as const)fixture(tiles,x,y,'lamp',false);fixture(tiles,26,16,'cart',true);fixture(tiles,32,16,'barrel',true);
  return {start:{x:25,y:16},enemies:[enemy('glass-sentinel','sent-d1',10,7,18),enemy('glass-sentinel','sent-d2',27,6,18),enemy('miasma-moth','moth-d1',42,6,7),enemy('homunculus','hom-d1',23,25,9),enemy('brine-warden','warden-d1',8,27,16),enemy('vapor-hound','hound-d1',45,25,13,1),enemy('gutter-alchemist','alch-d1',34,16,10,1),enemy('soot-sprite','sprite-d1',18,16,6)],items:[item('frost-salts','frost-d1',24,6),item('solvent','solvent-d1',28,25),item('amber-elixir','amber-d1',41,7),item('copper-key','key-d1',9,25),item('neutralizer','neutralizer-d1',20,26),item('black-catalyst','black-d1',46,26)]};
}

function stageFive(tiles:Tile[],rng:Rng){
  fillRect(tiles,2,14,47,5,'floor','grand-alembic',rng);fillRect(tiles,21,8,9,6,'floor','reaction-gallery',rng);fillRect(tiles,12,19,27,4,'floor','condenser-hall',rng);
  fillRect(tiles,2,2,13,10,'floor','furnace-nave',rng);wallRect(tiles,1,1,15,12,'furnace-nave-wall',rng);set(tiles,8,12,'door','furnace-nave-door',2);
  fillRect(tiles,18,2,15,6,'floor','catalyst-library',rng);wallRect(tiles,17,1,17,8,'catalyst-library-wall',rng);set(tiles,25,8,'door','catalyst-library-door',2);
  fillRect(tiles,36,2,13,10,'floor','cooling-core',rng);wallRect(tiles,35,1,15,12,'cooling-core-wall',rng);set(tiles,42,12,'door','cooling-core-door',2);
  fillRect(tiles,2,23,13,7,'floor','master-vault',rng);wallRect(tiles,1,22,15,9,'master-vault-wall',rng);set(tiles,8,22,'door','master-vault-door',2);
  fillRect(tiles,18,23,15,7,'floor','central-lab',rng);wallRect(tiles,17,22,17,9,'central-lab-wall',rng);set(tiles,25,22,'door','central-lab-door',2);
  fillRect(tiles,37,23,12,7,'floor','final-sanctum',rng);wallRect(tiles,36,22,14,9,'final-sanctum-wall',rng);set(tiles,43,22,'door','final-sanctum-door',4);fixture(tiles,43,22,'brass-gate',true,0);set(tiles,47,28,'stairs','final-sanctum',0);
  for(const [x,y] of [[4,4],[5,4],[6,4],[10,7],[11,7],[20,4],[21,4],[28,5]] as const)set(tiles,x,y,'embers',x<16?'furnace-nave':'catalyst-library',4);
  for(const [x,y] of [[38,4],[39,4],[40,4],[45,7],[46,7]] as const)set(tiles,x,y,'brine','cooling-core',2);
  for(const [x,y] of [[39,8],[40,8],[41,8]] as const)set(tiles,x,y,'steam','cooling-core',3);
  for(const [x,y] of [[4,25],[5,25],[6,25],[11,27]] as const)set(tiles,x,y,'rune','master-vault',2);
  for(const [x,y] of [[20,25],[21,25],[22,25],[28,27],[29,27]] as const)set(tiles,x,y,'acid','central-lab',2);
  for(const [x,y] of [[39,25],[40,25],[41,25],[46,27]] as const)set(tiles,x,y,'crystal','final-sanctum',2);
  for(const [x,y] of [[14,20],[17,20],[34,20],[37,20]] as const)set(tiles,x,y,'oil','condenser-hall',2);
  fixture(tiles,4,3,'furnace',true,1);fixture(tiles,11,3,'incinerator',true,0);fixture(tiles,20,3,'archive-desk',true,0);fixture(tiles,30,3,'transmuter',true,0);fixture(tiles,38,3,'valve',true,0);fixture(tiles,47,3,'reagent-pump',true,0);
  fixture(tiles,23,10,'boiler',true,0);fixture(tiles,28,10,'crucible',true,0);fixture(tiles,4,25,'silver-mirror',true,0);fixture(tiles,12,28,'sealed-cache',true,0);fixture(tiles,20,25,'retort',true,0);fixture(tiles,30,28,'ward-pylon',true,0);fixture(tiles,39,25,'crucible',true,0);fixture(tiles,47,25,'lever',true,0);
  for(const [x,y] of [[18,15],[24,17],[31,15],[36,17]] as const)fixture(tiles,x,y,'lamp',false);fixture(tiles,26,16,'cart',true);fixture(tiles,33,16,'barrel',true);
  return {start:{x:25,y:16},enemies:[enemy('crucible-knight','knight-final',27,11,28,1),enemy('glass-sentinel','sent-e1',10,7,18),enemy('glass-sentinel','sent-e2',42,26,18),enemy('gutter-alchemist','alch-e1',34,16,10,1),enemy('vapor-hound','hound-e1',45,25,13,1),enemy('soot-sprite','sprite-e1',21,5,6),enemy('brine-warden','warden-e1',41,7,16),enemy('miasma-moth','moth-e1',15,20,7),enemy('homunculus','hom-e1',24,26,9)],items:[item('amber-elixir','amber-e1',7,27),item('frost-salts','frost-e1',40,7),item('solvent','solvent-e1',28,26),item('neutralizer','neutralizer-e1',20,26),item('black-catalyst','black-e1',30,6),item('copper-key','key-e1',11,27)]};
}

export function createLateWorld(seed:number,stage:number):GameState{const actual=stage<=4?4:5;const rng=new Rng((seed^Math.imul(actual,0x9e3779b1)^0x4a71c5)>>>0);const tiles=Array.from({length:W*H},()=>tile('wall',rng.int(0,15),'old-city'));const spec=actual===4?stageFour(tiles,rng):stageFive(tiles,rng);const state:GameState={width:W,height:H,tiles,player:{x:spec.start.x,y:spec.start.y,hp:22,maxHp:22,guard:0,inventory:['red-phial','salt-bomb'],statuses:[]},enemies:spec.enemies,items:spec.items,turn:0,messages:[{text:actual===4?'The glass below the city has been cut into rooms, not mined.':'The Grand Alembic is running without operators.',tone:'odd'}],seed,over:false,won:false,noise:[],enteredRooms:[],districtStage:actual};const start=state.tiles[state.player.y*state.width+state.player.x];if(start?.room)state.enteredRooms.push(start.room);updateVisibility(state);return state}
