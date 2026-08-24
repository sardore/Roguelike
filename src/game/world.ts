import { Rng } from './rng';
import type { Enemy, GameState, GroundItem, Point, Tile, TileKind } from './types';

const W=51,H=33;
const idx=(x:number,y:number)=>y*W+x;
function tile(kind:TileKind,variant=0,room?:string):Tile{return{kind,variant,room,discovered:false,visible:false}}
function fillRect(tiles:Tile[],x:number,y:number,w:number,h:number,kind:TileKind,room:string,rng:Rng){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)tiles[idx(xx,yy)]=tile(kind,rng.int(0,15),room)}
function wallRect(tiles:Tile[],x:number,y:number,w:number,h:number,room:string,rng:Rng){for(let xx=x;xx<x+w;xx++){tiles[idx(xx,y)]=tile('wall',rng.int(0,15),room);tiles[idx(xx,y+h-1)]=tile('wall',rng.int(0,15),room)}for(let yy=y;yy<y+h;yy++){tiles[idx(x,yy)]=tile('wall',rng.int(0,15),room);tiles[idx(x+w-1,yy)]=tile('wall',rng.int(0,15),room)}}
function set(tiles:Tile[],x:number,y:number,kind:TileKind,room?:string,v=0){tiles[idx(x,y)]=tile(kind,v,room)}
function fixture(tiles:Tile[],x:number,y:number,name:Tile['fixture'],blocks=true,state=0){const t=tiles[idx(x,y)];if(!t)return;t.fixture=name;t.blocks=blocks;t.state=state}
function enemy(kind:Enemy['kind'],id:string,x:number,y:number,hp:number,cooldown=0):Enemy{return{id,kind,x,y,hp,cooldown}}
function item(kind:GroundItem['kind'],id:string,x:number,y:number):GroundItem{return{id,kind,x,y}}

function stageOne(tiles:Tile[],rng:Rng){
  fillRect(tiles,1,13,49,6,'floor','apothecaries-row',rng);fillRect(tiles,1,12,5,1,'floor','apothecaries-row',rng);fillRect(tiles,46,12,4,1,'floor','apothecaries-row',rng);
  fillRect(tiles,2,2,10,10,'floor','herbalist',rng);wallRect(tiles,1,1,12,12,'herbalist-wall',rng);for(let x=2;x<=11;x++)set(tiles,x,7,'wall','herbalist-divider',rng.int(0,15));set(tiles,6,7,'door','herbalist-door',2);set(tiles,7,12,'door','herbalist-door',1);
  fillRect(tiles,13,2,3,11,'floor','north-alley',rng);fixture(tiles,14,4,'barrel');fixture(tiles,14,9,'pipe',false);
  fillRect(tiles,17,2,14,10,'floor','distillery',rng);wallRect(tiles,16,1,16,12,'distillery-wall',rng);set(tiles,24,12,'door','distillery-door',3);
  fillRect(tiles,33,2,16,10,'floor','glassworks',rng);wallRect(tiles,32,1,18,12,'glassworks-wall',rng);set(tiles,40,12,'door','glassworks-door',3);
  for(const [x,y] of [[35,4],[36,4],[37,4],[43,5],[44,5],[45,5],[36,9],[43,9]] as const)set(tiles,x,y,'glass','glassworks',rng.int(0,3));
  fillRect(tiles,3,21,14,9,'floor','courtyard',rng);wallRect(tiles,2,20,16,11,'courtyard-wall',rng);set(tiles,9,20,'door','courtyard-door',2);set(tiles,17,25,'door','courtyard-door',1);
  fillRect(tiles,18,22,5,6,'floor','service-passage',rng);fillRect(tiles,21,18,2,5,'floor','service-passage',rng);
  fillRect(tiles,24,21,10,9,'floor','underworks',rng);wallRect(tiles,23,20,12,11,'underworks-wall',rng);set(tiles,28,20,'door','underworks-door',2);set(tiles,34,25,'door','underworks-door',1);
  fillRect(tiles,36,21,13,9,'floor','sealed-shop',rng);wallRect(tiles,35,20,15,11,'sealed-shop-wall',rng);set(tiles,40,20,'door','sealed-door',5);set(tiles,35,25,'floor','sealed-shop',0);fixture(tiles,35,25,'brass-gate',true,0);set(tiles,47,28,'stairs','sealed-shop',0);
  for(const [x,y] of [[5,17],[12,18],[19,17],[28,18],[38,17],[47,18]] as const)set(tiles,x,y,'water','street-drain',rng.int(0,4));
  for(const [x,y] of [[30,14],[31,14],[32,14],[31,15],[41,16]] as const)set(tiles,x,y,'oil','apothecaries-row',rng.int(0,3));
  for(const [x,y] of [[20,4],[21,4],[22,4],[22,5],[27,9]] as const)set(tiles,x,y,'acid','distillery',rng.int(0,3));
  for(const [x,y] of [[26,25],[27,25],[28,25],[26,26],[27,26],[30,27]] as const)set(tiles,x,y,'sludge','underworks',rng.int(0,3));
  for(const [x,y] of [[31,23],[31,24],[30,24]] as const)set(tiles,x,y,'steam','underworks',3);
  for(const [x,y] of [[39,24],[40,24],[41,24],[40,25]] as const)set(tiles,x,y,'rune','sealed-shop',rng.int(0,3));
  fixture(tiles,3,3,'shelf');fixture(tiles,9,3,'shelf');fixture(tiles,3,8,'cabinet');fixture(tiles,10,8,'herbs',false);fixture(tiles,5,10,'counter');fixture(tiles,6,10,'counter');fixture(tiles,10,10,'table');fixture(tiles,4,4,'sealed-cache',true,0);
  fixture(tiles,18,3,'still');fixture(tiles,24,3,'still');fixture(tiles,29,3,'vat');fixture(tiles,18,8,'barrel');fixture(tiles,25,8,'crate');fixture(tiles,29,8,'pipe',false);fixture(tiles,22,10,'retort',true,0);fixture(tiles,27,10,'table');
  fixture(tiles,34,3,'shelf');fixture(tiles,39,3,'cage');fixture(tiles,47,3,'incinerator',true,0);fixture(tiles,34,9,'crate');fixture(tiles,47,9,'sealed-cache',true,0);
  fixture(tiles,5,22,'planter');fixture(tiles,10,22,'planter');fixture(tiles,5,28,'planter');fixture(tiles,14,28,'crate');fixture(tiles,11,25,'fountain',true,1);fixture(tiles,4,28,'barrel');
  fixture(tiles,25,22,'boiler',true,0);fixture(tiles,32,22,'pipe',false);fixture(tiles,29,28,'lever',true,0);fixture(tiles,25,28,'grate',false);fixture(tiles,32,28,'grate',false);
  fixture(tiles,37,22,'cabinet');fixture(tiles,46,22,'shelf');fixture(tiles,38,28,'boards');fixture(tiles,44,27,'ward-pylon',true,0);fixture(tiles,47,25,'sealed-cache',true,0);
  fixture(tiles,3,16,'cart');fixture(tiles,7,13,'awning',false);fixture(tiles,10,13,'sign',false);fixture(tiles,21,13,'awning',false);fixture(tiles,25,13,'sign',false);fixture(tiles,39,13,'awning',false);fixture(tiles,5,14,'lamp',false);fixture(tiles,16,15,'lamp',false);fixture(tiles,35,15,'lamp',false);fixture(tiles,49,15,'lamp',false);fixture(tiles,15,17,'crate');fixture(tiles,49,17,'barrel');fixture(tiles,10,17,'grate',false);fixture(tiles,20,17,'grate',false);fixture(tiles,36,17,'grate',false);
  const incident=rng.int(0,2);if(incident===0){set(tiles,18,15,'steam','apothecaries-row',2);set(tiles,19,15,'steam','apothecaries-row',2)}if(incident===1){set(tiles,43,15,'glass','apothecaries-row',2);set(tiles,44,15,'glass','apothecaries-row',1)}if(incident===2){set(tiles,11,15,'sludge','apothecaries-row',1);set(tiles,12,15,'sludge','apothecaries-row',1)}
  return {start:{x:24,y:15},enemies:[enemy('glass-mite','mite-a',9,4,5),enemy('distiller-rat','rat-a',26,5,9),enemy('retort-leech','leech-a',21,9,8),enemy('soot-sprite','sprite-a',44,6,6),enemy('brine-warden','warden-a',30,26,16),enemy('gutter-alchemist','alchemist-a',42,15,10,2),enemy('vapor-hound','hound-a',43,26,13,1)],items:[item('blue-tonic','tonic-a',8,9),item('chalk','chalk-a',18,9),item('smoke-ampoule','smoke-a',36,9),item('neutralizer','neutralizer-a',14,26),item('copper-key','key-a',31,28),item('black-catalyst','catalyst-a',46,27)]};
}

function stageTwo(tiles:Tile[],rng:Rng){
  fillRect(tiles,2,14,47,5,'floor','tincture-bazaar',rng);fillRect(tiles,8,8,35,6,'floor','spice-arcade',rng);fillRect(tiles,12,19,4,9,'floor','market-passages',rng);fillRect(tiles,35,19,4,9,'floor','market-passages',rng);
  fillRect(tiles,2,2,12,10,'floor','dye-vats',rng);wallRect(tiles,1,1,14,12,'dye-vats-wall',rng);set(tiles,8,12,'door','dye-vats-door',2);
  fillRect(tiles,18,2,15,10,'floor','counting-house',rng);wallRect(tiles,17,1,17,12,'counting-house-wall',rng);set(tiles,25,12,'door','counting-house-door',2);
  fillRect(tiles,37,2,12,10,'floor','black-market',rng);wallRect(tiles,36,1,14,12,'black-market-wall',rng);set(tiles,42,12,'door','black-market-door',4);
  fillRect(tiles,2,21,10,9,'floor','cistern',rng);wallRect(tiles,1,20,12,11,'cistern-wall',rng);set(tiles,7,20,'door','cistern-door',2);
  fillRect(tiles,17,21,15,9,'floor','wayhouse',rng);wallRect(tiles,16,20,17,11,'wayhouse-wall',rng);set(tiles,24,20,'door','wayhouse-door',2);
  fillRect(tiles,40,21,9,9,'floor','old-exchange',rng);wallRect(tiles,39,20,11,11,'old-exchange-wall',rng);set(tiles,44,20,'door','old-exchange-door',3);fixture(tiles,44,20,'brass-gate',true,0);set(tiles,47,28,'stairs','old-exchange',0);
  for(let x=9;x<=41;x+=4){fixture(tiles,x,9,'stall',true,(x/4)|0);fixture(tiles,x,12,'stall',true,((x+2)/4)|0)}
  for(const [x,y] of [[4,4],[5,4],[6,4],[4,5],[10,7],[11,7]] as const)set(tiles,x,y,'miasma','dye-vats',3);
  for(const [x,y] of [[3,24],[4,24],[5,24],[6,24],[3,25],[6,25],[3,26],[4,26],[5,26],[6,26]] as const)set(tiles,x,y,'brine','cistern',rng.int(0,3));
  for(const [x,y] of [[20,5],[21,5],[22,5],[28,7]] as const)set(tiles,x,y,'crystal','counting-house',rng.int(0,3));
  for(const [x,y] of [[40,5],[41,5],[42,5],[46,8]] as const)set(tiles,x,y,'oil','black-market',rng.int(0,3));
  for(const [x,y] of [[14,22],[14,23],[36,23],[36,24]] as const)set(tiles,x,y,'sludge','market-passages',1);
  fixture(tiles,4,3,'vat');fixture(tiles,12,9,'bell',true,0);fixture(tiles,27,8,'transmuter',true,0);fixture(tiles,31,10,'silver-mirror',true,0);fixture(tiles,39,4,'sealed-cache',true,0);fixture(tiles,47,4,'cage');
  fixture(tiles,5,22,'valve',true,0);fixture(tiles,10,25,'reagent-pump',true,0);fixture(tiles,9,27,'fountain',true,1);fixture(tiles,20,22,'archive-desk',true,0);fixture(tiles,27,22,'cabinet');fixture(tiles,30,27,'sealed-cache',true,0);fixture(tiles,37,27,'lever',true,0);fixture(tiles,46,27,'ward-pylon',true,0);
  return {start:{x:25,y:16},enemies:[enemy('homunculus','hom-a',11,10,9),enemy('miasma-moth','moth-a',7,5,7),enemy('gutter-alchemist','alch-b',31,16,10,1),enemy('glass-sentinel','sent-a',25,6,18),enemy('retort-leech','leech-b',5,25,8),enemy('brine-warden','warden-b',10,27,16),enemy('vapor-hound','hound-b',45,24,13,1),enemy('distiller-rat','rat-b',43,7,9)],items:[item('frost-salts','frost-a',21,6),item('solvent','solvent-a',30,24),item('blue-tonic','tonic-b',21,24),item('copper-key','key-b',8,10),item('smoke-ampoule','smoke-b',44,7),item('amber-elixir','amber-a',47,8)]};
}

function stageThree(tiles:Tile[],rng:Rng){
  fillRect(tiles,2,14,47,5,'floor','crucible-ward',rng);fillRect(tiles,21,8,9,6,'floor','furnace-court',rng);fillRect(tiles,12,19,27,4,'floor','ash-gallery',rng);
  fillRect(tiles,2,2,13,10,'floor','assay-lab',rng);wallRect(tiles,1,1,15,12,'assay-lab-wall',rng);set(tiles,8,12,'door','assay-lab-door',2);
  fillRect(tiles,18,2,14,6,'floor','kiln-hall',rng);wallRect(tiles,17,1,16,8,'kiln-hall-wall',rng);set(tiles,25,8,'door','kiln-hall-door',2);
  fillRect(tiles,36,2,13,10,'floor','old-mint',rng);wallRect(tiles,35,1,15,12,'old-mint-wall',rng);set(tiles,42,12,'door','old-mint-door',3);
  fillRect(tiles,2,24,12,7,'floor','cooling-vault',rng);wallRect(tiles,1,23,14,9,'cooling-vault-wall',rng);set(tiles,8,23,'door','cooling-vault-door',2);
  fillRect(tiles,18,24,15,7,'floor','master-lab',rng);wallRect(tiles,17,23,17,9,'master-lab-wall',rng);set(tiles,25,23,'door','master-lab-door',2);
  fillRect(tiles,37,24,12,7,'floor','final-vault',rng);wallRect(tiles,36,23,14,9,'final-vault-wall',rng);set(tiles,42,23,'door','final-vault-door',5);fixture(tiles,42,23,'brass-gate',true,0);set(tiles,47,28,'stairs','final-vault',0);
  for(const [x,y] of [[22,10],[23,10],[27,10],[28,10],[24,11],[26,11]] as const)set(tiles,x,y,'embers','furnace-court',3);
  for(const [x,y] of [[20,4],[21,4],[22,4],[29,5]] as const)set(tiles,x,y,'oil','kiln-hall',2);
  for(const [x,y] of [[5,26],[6,26],[7,26],[8,26],[5,27],[8,27]] as const)set(tiles,x,y,'brine','cooling-vault',2);
  for(const [x,y] of [[21,26],[22,26],[28,27],[29,27]] as const)set(tiles,x,y,'crystal','master-lab',2);
  for(const [x,y] of [[39,26],[40,26],[41,26],[44,27]] as const)set(tiles,x,y,'rune','final-vault',2);
  for(const [x,y] of [[13,20],[16,20],[35,20],[38,20]] as const)set(tiles,x,y,'miasma','ash-gallery',2);
  fixture(tiles,4,3,'archive-desk');fixture(tiles,11,3,'transmuter',true,0);fixture(tiles,4,9,'retort');fixture(tiles,12,9,'sealed-cache',true,0);
  fixture(tiles,20,3,'furnace',true,0);fixture(tiles,25,3,'crucible',true,0);fixture(tiles,30,3,'valve',true,0);fixture(tiles,23,10,'boiler',true,0);fixture(tiles,28,10,'boiler',true,0);
  fixture(tiles,38,3,'silver-mirror',true,0);fixture(tiles,46,3,'sealed-cache',true,0);fixture(tiles,39,9,'ward-pylon',true,0);fixture(tiles,47,9,'cage');
  fixture(tiles,4,25,'valve',true,0);fixture(tiles,11,28,'fountain',true,1);fixture(tiles,20,25,'transmuter',true,0);fixture(tiles,31,28,'lever',true,0);fixture(tiles,46,25,'ward-pylon',true,0);fixture(tiles,43,29,'incinerator',true,0);
  return {start:{x:25,y:16},enemies:[enemy('glass-sentinel','sent-c',10,7,18),enemy('soot-sprite','sprite-c',23,5,6),enemy('miasma-moth','moth-c',15,20,7),enemy('gutter-alchemist','alch-c',35,16,10,1),enemy('brine-warden','warden-c',9,28,16),enemy('homunculus','hom-c',24,27,9),enemy('vapor-hound','hound-c',43,27,13,1),enemy('crucible-knight','knight-c',27,11,28,1)],items:[item('frost-salts','frost-c',7,27),item('solvent','solvent-c',13,10),item('neutralizer','neutralizer-c',22,27),item('amber-elixir','amber-c',47,4),item('black-catalyst','catalyst-c',31,6),item('copper-key','key-c',40,9)]};
}

export function createWorld(seed:number,stage=1):GameState{const rng=new Rng((seed^Math.imul(stage,0x9e3779b1))>>>0);const tiles=Array.from({length:W*H},()=>tile('wall',rng.int(0,15),'old-city'));const spec=stage===1?stageOne(tiles,rng):stage===2?stageTwo(tiles,rng):stageThree(tiles,rng);const state:GameState={width:W,height:H,tiles,player:{x:spec.start.x,y:spec.start.y,hp:22,maxHp:22,guard:0,inventory:['red-phial','salt-bomb'],statuses:[]},enemies:spec.enemies,items:spec.items,turn:0,messages:[{text:stage===1?'Apothecaries’ Row is quiet. Copper pipes click somewhere behind the shutters.':stage===2?'The bazaar smells of wet paper, cloves, and old dye.':'The Crucible Ward is warmer than the streets above it.',tone:'odd'}],seed,over:false,won:false,noise:[],enteredRooms:[],districtStage:stage};const room=at(state,state.player)?.room;if(room)state.enteredRooms.push(room);updateVisibility(state);return state}
export function at(state:GameState,p:Point):Tile|undefined{if(p.x<0||p.y<0||p.x>=state.width||p.y>=state.height)return undefined;return state.tiles[p.y*state.width+p.x]}
function canSee(state:GameState,x0:number,y0:number,x1:number,y1:number):boolean{let x=x0,y=y0;const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;while(!(x===x1&&y===y1)){const e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}if(x===x1&&y===y1)return true;const t=at(state,{x,y});if(!t||t.kind==='wall'||t.kind==='steam'||t.kind==='miasma')return false}return true}
function isSurfaceWall(state:GameState,x:number,y:number,t:Tile):boolean{if(t.kind!=='wall'||t.room!=='old-city')return true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const){const n=at(state,{x:x+dx,y:y+dy});if(n&&n.kind!=='wall')return true}return false}
export function updateVisibility(state:GameState){for(const t of state.tiles)t.visible=false;const r=10,r2=r*r;for(let y=Math.max(0,state.player.y-r);y<=Math.min(state.height-1,state.player.y+r);y++)for(let x=Math.max(0,state.player.x-r);x<=Math.min(state.width-1,state.player.x+r);x++){const dx=x-state.player.x,dy=y-state.player.y;if(dx*dx+dy*dy>r2)continue;const t=state.tiles[y*state.width+x];if(!t||!isSurfaceWall(state,x,y,t))continue;if(!canSee(state,state.player.x,state.player.y,x,y))continue;t.visible=true;t.discovered=true}}
