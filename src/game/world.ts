import { Rng } from './rng';
import type { GameState, Point, Tile, TileKind } from './types';

const W=33,H=23;
const idx=(x:number,y:number)=>y*W+x;
function tile(kind:TileKind,variant=0,room?:string):Tile { return {kind,variant,room,discovered:false,visible:false}; }
function carveRect(tiles:Tile[],x:number,y:number,w:number,h:number,room:string,rng:Rng){
  for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) tiles[idx(xx,yy)]=tile('floor',rng.int(0,7),room);
}
function wallRect(tiles:Tile[],x:number,y:number,w:number,h:number,room:string,rng:Rng){
  for(let xx=x;xx<x+w;xx++){tiles[idx(xx,y)]=tile('wall',rng.int(0,5),room);tiles[idx(xx,y+h-1)]=tile('wall',rng.int(0,5),room);}
  for(let yy=y;yy<y+h;yy++){tiles[idx(x,yy)]=tile('wall',rng.int(0,5),room);tiles[idx(x+w-1,yy)]=tile('wall',rng.int(0,5),room);}
}
function set(tiles:Tile[],x:number,y:number,kind:TileKind,room?:string,v=0){tiles[idx(x,y)]=tile(kind,v,room);}
export function createWorld(seed:number):GameState{
  const rng=new Rng(seed); const tiles=Array.from({length:W*H},()=>tile('wall',rng.int(0,5),'stone'));
  carveRect(tiles,2,8,29,7,'apothecaries-row',rng);
  carveRect(tiles,3,3,9,6,'herbalist',rng); wallRect(tiles,2,2,11,8,'herbalist',rng);
  carveRect(tiles,15,2,8,7,'distillery',rng); wallRect(tiles,14,1,10,9,'distillery',rng);
  carveRect(tiles,24,11,7,9,'sealed-shop',rng); wallRect(tiles,23,10,9,11,'sealed-shop',rng);
  carveRect(tiles,3,14,10,6,'courtyard',rng); wallRect(tiles,2,13,12,8,'courtyard',rng);
  for(const [x,y] of [[7,9],[19,9],[27,10],[12,16],[23,14]] as const) set(tiles,x,y,'door','door');
  for(let x=4;x<=28;x+=6) set(tiles,x,13,'water','street-drain',x%3);
  for(const p of [[18,5],[19,5],[20,5],[20,6],[26,16],[27,16]] as const) set(tiles,p[0],p[1],'acid','spill',rng.int(0,3));
  set(tiles,29,17,'stairs','sealed-shop');
  const state:GameState={width:W,height:H,tiles,player:{x:4,y:11,hp:20,maxHp:20,guard:0,inventory:['red-phial','salt-bomb'],statuses:[]},
    enemies:[
      {id:'mite-a',kind:'glass-mite',x:10,y:5,hp:5,cooldown:0},
      {id:'rat-a',kind:'distiller-rat',x:20,y:4,hp:9,cooldown:0},
      {id:'hound-a',kind:'vapor-hound',x:27,y:15,hp:13,cooldown:1}
    ],
    items:[{id:'tonic-a',kind:'blue-tonic',x:6,y:5},{id:'chalk-a',kind:'chalk',x:18,y:6},{id:'salt-b',kind:'salt-bomb',x:28,y:12}],
    turn:0,messages:[{text:'Apothecaries’ Row is quiet. Copper pipes click somewhere behind the walls.',tone:'odd'}],seed,over:false,won:false,noise:[]};
  updateVisibility(state); return state;
}
export function at(state:GameState,p:Point):Tile|undefined{return state.tiles[p.y*state.width+p.x];}
export function updateVisibility(state:GameState){
  for(const t of state.tiles)t.visible=false;
  const r=7; for(let y=Math.max(0,state.player.y-r);y<=Math.min(state.height-1,state.player.y+r);y++) for(let x=Math.max(0,state.player.x-r);x<=Math.min(state.width-1,state.player.x+r);x++){
    const d=Math.abs(x-state.player.x)+Math.abs(y-state.player.y); if(d>r+2)continue;
    const t=state.tiles[y*state.width+x]; if(t){t.visible=true;t.discovered=true;}
  }
}
