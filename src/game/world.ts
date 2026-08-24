import { Rng } from './rng';
import type { GameState, Point, Tile, TileKind } from './types';
const W=37,H=25;
const idx=(x:number,y:number)=>y*W+x;
function tile(kind:TileKind,variant=0,room?:string):Tile{return{kind,variant,room,discovered:false,visible:false}}
function fillRect(tiles:Tile[],x:number,y:number,w:number,h:number,kind:TileKind,room:string,rng:Rng){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)tiles[idx(xx,yy)]=tile(kind,rng.int(0,15),room)}
function wallRect(tiles:Tile[],x:number,y:number,w:number,h:number,room:string,rng:Rng){for(let xx=x;xx<x+w;xx++){tiles[idx(xx,y)]=tile('wall',rng.int(0,15),room);tiles[idx(xx,y+h-1)]=tile('wall',rng.int(0,15),room)}for(let yy=y;yy<y+h;yy++){tiles[idx(x,yy)]=tile('wall',rng.int(0,15),room);tiles[idx(x+w-1,yy)]=tile('wall',rng.int(0,15),room)}}
function set(tiles:Tile[],x:number,y:number,kind:TileKind,room?:string,v=0){tiles[idx(x,y)]=tile(kind,v,room)}
function fixture(tiles:Tile[],x:number,y:number,name:Tile['fixture'],blocks=true){const t=tiles[idx(x,y)];if(!t)return;t.fixture=name;t.blocks=blocks}
export function createWorld(seed:number):GameState{
 const rng=new Rng(seed);const tiles=Array.from({length:W*H},()=>tile('wall',rng.int(0,15),'old-city'));
 for(let x=1;x<=35;x++){const top=x<10?9:x<21?8:x<29?9:10;const bottom=x<8?15:x<18?16:x<30?15:16;for(let y=top;y<=bottom;y++)set(tiles,x,y,'floor','apothecaries-row',rng.int(0,15))}
 fillRect(tiles,11,4,4,6,'floor','north-alley',rng);fillRect(tiles,14,6,4,4,'floor','north-alley',rng);
 fillRect(tiles,2,2,9,7,'floor','herbalist',rng);wallRect(tiles,1,1,11,9,'herbalist-wall',rng);for(let x=2;x<=10;x++)set(tiles,x,5,'wall','herbalist-divider',rng.int(0,15));set(tiles,6,5,'door','herbalist-door',2);set(tiles,7,9,'door','herbalist-door',1);
 fillRect(tiles,17,2,11,7,'floor','distillery',rng);wallRect(tiles,16,1,13,9,'distillery-wall',rng);set(tiles,22,9,'door','distillery-door',3);
 fillRect(tiles,3,16,12,7,'floor','courtyard',rng);wallRect(tiles,2,15,14,9,'courtyard-wall',rng);fillRect(tiles,15,18,3,4,'floor','courtyard',rng);set(tiles,14,18,'door','courtyard-door',1);set(tiles,8,15,'door','courtyard-door',2);
 fillRect(tiles,27,11,8,11,'floor','sealed-shop',rng);wallRect(tiles,26,10,10,13,'sealed-shop-wall',rng);fillRect(tiles,24,14,3,4,'floor','service-passage',rng);set(tiles,26,15,'door','sealed-door',4);set(tiles,30,10,'door','sealed-door',5);
 for(const [x,y] of [[4,14],[10,15],[17,15],[24,14],[33,15]] as const)set(tiles,x,y,'water','street-drain',rng.int(0,4));
 for(const p of [[19,4],[20,4],[21,4],[21,5],[31,17],[32,17],[31,18]] as const)set(tiles,p[0],p[1],'acid','spill',rng.int(0,3));
 set(tiles,33,20,'stairs','sealed-shop',0);
 for(const [x,y,name] of [[3,3,'shelf'],[8,3,'shelf'],[4,6,'shelf'],[9,6,'herbs'],[18,3,'still'],[23,3,'still'],[26,6,'crate'],[6,18,'planter'],[11,20,'crate'],[29,12,'crate'],[33,13,'shelf'],[28,16,'boards'],[2,12,'crate'],[15,13,'crate'],[34,12,'crate'],[12,12,'lamp'],[20,11,'lamp'],[29,14,'lamp']] as const)fixture(tiles,x,y,name,true);
 for(const [x,y] of [[9,13],[18,13],[26,12]] as const)fixture(tiles,x,y,'grate',false);
 const state:GameState={width:W,height:H,tiles,player:{x:5,y:12,hp:20,maxHp:20,guard:0,inventory:['red-phial','salt-bomb'],statuses:[]},enemies:[{id:'mite-a',kind:'glass-mite',x:9,y:3,hp:5,cooldown:0},{id:'rat-a',kind:'distiller-rat',x:24,y:4,hp:9,cooldown:0},{id:'hound-a',kind:'vapor-hound',x:32,y:19,hp:13,cooldown:1}],items:[{id:'tonic-a',kind:'blue-tonic',x:4,y:3},{id:'chalk-a',kind:'chalk',x:18,y:6},{id:'salt-b',kind:'salt-bomb',x:31,y:13}],turn:0,messages:[{text:'Apothecaries’ Row is quiet. Copper pipes click somewhere behind the walls.',tone:'odd'}],seed,over:false,won:false,noise:[]};updateVisibility(state);return state
}
export function at(state:GameState,p:Point):Tile|undefined{return state.tiles[p.y*state.width+p.x]}
export function updateVisibility(state:GameState){for(const t of state.tiles)t.visible=false;const r=8;for(let y=Math.max(0,state.player.y-r);y<=Math.min(state.height-1,state.player.y+r);y++)for(let x=Math.max(0,state.player.x-r);x<=Math.min(state.width-1,state.player.x+r);x++){const d=Math.abs(x-state.player.x)+Math.abs(y-state.player.y);if(d>r+2)continue;const t=state.tiles[y*state.width+x];if(t){t.visible=true;t.discovered=true}}}
