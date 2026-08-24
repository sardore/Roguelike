import type { FloorMap, Point, ThemeDefinition, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';
import { terrainTile } from './terrain-rules';

export type SettlementLayoutStyle='street'|'crossroads'|'courtyard';
export interface SettlementPlan{style:SettlementLayoutStyle;points:Point[];square:Point;bounds:{minX:number;minY:number;maxX:number;maxY:number};}
interface Rect{x:number;y:number;w:number;h:number;}

function index(floor:FloorMap,x:number,y:number):number{return y*floor.width+x;}
function inBounds(floor:FloorMap,x:number,y:number,margin=1):boolean{return x>=margin&&y>=margin&&x<floor.width-margin&&y<floor.height-margin;}
function manhattan(a:Point,b:Point):number{return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
function set(floor:FloorMap,x:number,y:number,kind:Parameters<typeof terrainTile>[0]):void{if(inBounds(floor,x,y))floor.tiles[index(floor,x,y)]=terrainTile(kind);}
function roomCenter(rect:Rect):Point{return{x:rect.x+Math.floor(rect.w/2),y:rect.y+Math.floor(rect.h/2)};}
function stampRoom(floor:FloorMap,rect:Rect,door:Point):Point{
  for(let y=rect.y;y<rect.y+rect.h;y+=1)for(let x=rect.x;x<rect.x+rect.w;x+=1){const edge=x===rect.x||y===rect.y||x===rect.x+rect.w-1||y===rect.y+rect.h-1;set(floor,x,y,edge?'wall':'floor');}
  set(floor,door.x,door.y,'door');return roomCenter(rect);
}
function clearSquare(floor:FloorMap,center:Point):void{
  for(let y=center.y-2;y<=center.y+2;y+=1)for(let x=center.x-2;x<=center.x+2;x+=1)set(floor,x,y,'floor');
  for(const p of [{x:center.x-2,y:center.y-2},{x:center.x+2,y:center.y-2},{x:center.x-2,y:center.y+2},{x:center.x+2,y:center.y+2}])set(floor,p.x,p.y,'pillar');
}
function candidateCenters(floor:FloorMap):Point[]{
  const out:Point[]=[];for(let y=8;y<floor.height-8;y+=1)for(let x=12;x<floor.width-12;x+=1){const tile=floor.tiles[index(floor,x,y)];if(!tile?.walkable)continue;const p={x,y};if(manhattan(p,floor.spawn)<9||floor.exits.some((exit)=>manhattan(p,exit)<8))continue;out.push(p);}return out;
}
function doorToward(rect:Rect,target:Point):Point{const c=roomCenter(rect),dx=Math.sign(target.x-c.x),dy=Math.sign(target.y-c.y);return{x:dx?rect.x+(dx>0?rect.w-1:0):c.x,y:dy?rect.y+(dy>0?rect.h-1:0):c.y};}
function roadH(floor:FloorMap,x1:number,x2:number,y:number):void{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x+=1)set(floor,x,y,'floor');}
function roadV(floor:FloorMap,y1:number,y2:number,x:number):void{for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y+=1)set(floor,x,y,'floor');}

function streetPlan(floor:FloorMap,center:Point,count:number,rng:DeterministicRng):SettlementPlan{
  const horizontal=rng.chance(.5),points:Point[]=[];const slots=[-8,-4,0,4,8];
  if(horizontal){roadH(floor,center.x-11,center.x+11,center.y);roadV(floor,center.y-5,center.y+5,center.x);for(const offset of slots)for(const side of [-1,1]){if(points.length>=count)break;const w=rng.int(5,6),h=rng.int(4,5),x=center.x+offset-Math.floor(w/2),y=side<0?center.y-h-1:center.y+2;const rect={x,y,w,h};points.push(stampRoom(floor,rect,{x:center.x+offset,y:side<0?y+h-1:y}));}}
  else{roadV(floor,center.y-11,center.y+11,center.x);roadH(floor,center.x-6,center.x+6,center.y);for(const offset of slots)for(const side of [-1,1]){if(points.length>=count)break;const w=rng.int(5,6),h=rng.int(4,5),x=side<0?center.x-w-1:center.x+2,y=center.y+offset-Math.floor(h/2);const rect={x,y,w,h};points.push(stampRoom(floor,rect,{x:side<0?x+w-1:x,y:center.y+offset}));}}
  clearSquare(floor,center);return{style:'street',points,square:center,bounds:horizontal?{minX:center.x-12,minY:center.y-7,maxX:center.x+12,maxY:center.y+7}:{minX:center.x-8,minY:center.y-12,maxX:center.x+8,maxY:center.y+12}};
}
function crossroadsPlan(floor:FloorMap,center:Point,count:number,rng:DeterministicRng):SettlementPlan{
  roadH(floor,center.x-10,center.x+10,center.y);roadV(floor,center.y-9,center.y+9,center.x);clearSquare(floor,center);
  const rects:Rect[]=[{x:center.x-10,y:center.y-7,w:6,h:5},{x:center.x+5,y:center.y-7,w:6,h:5},{x:center.x-10,y:center.y+3,w:6,h:5},{x:center.x+5,y:center.y+3,w:6,h:5},{x:center.x-3,y:center.y-8,w:6,h:4},{x:center.x-3,y:center.y+5,w:6,h:4}];
  const points:Point[]=[];for(const rect of rng.shuffle(rects).slice(0,count))points.push(stampRoom(floor,rect,doorToward(rect,center)));return{style:'crossroads',points,square:center,bounds:{minX:center.x-11,minY:center.y-9,maxX:center.x+11,maxY:center.y+9}};
}
function courtyardPlan(floor:FloorMap,center:Point,count:number,rng:DeterministicRng):SettlementPlan{
  for(let y=center.y-3;y<=center.y+3;y+=1)for(let x=center.x-5;x<=center.x+5;x+=1)set(floor,x,y,'floor');for(let x=center.x-5;x<=center.x+5;x+=1){set(floor,x,center.y-3,'floor');set(floor,x,center.y+3,'floor');}for(let y=center.y-3;y<=center.y+3;y+=1){set(floor,center.x-5,y,'floor');set(floor,center.x+5,y,'floor');}clearSquare(floor,center);
  const rects:Rect[]=[{x:center.x-10,y:center.y-7,w:6,h:5},{x:center.x-2,y:center.y-8,w:5,h:5},{x:center.x+5,y:center.y-7,w:6,h:5},{x:center.x-10,y:center.y+3,w:6,h:5},{x:center.x-2,y:center.y+4,w:5,h:5},{x:center.x+5,y:center.y+3,w:6,h:5}];
  const points:Point[]=[];for(const rect of rng.shuffle(rects).slice(0,count))points.push(stampRoom(floor,rect,doorToward(rect,center)));return{style:'courtyard',points,square:center,bounds:{minX:center.x-11,minY:center.y-9,maxX:center.x+11,maxY:center.y+9}};
}
export function stampSettlement(floor:FloorMap,theme:ThemeDefinition,coord:WorldCoord,rng:DeterministicRng,count:number):SettlementPlan|null{
  const candidates=rng.shuffle(candidateCenters(floor));if(!candidates.length)return null;const center=candidates[0]!,styles:SettlementLayoutStyle[]=['street','crossroads','courtyard'],style=styles[(coord.depth+Math.abs(coord.lane)+rng.int(0,styles.length-1))%styles.length]!,safeCount=Math.max(4,Math.min(7,count));
  if(style==='crossroads')return crossroadsPlan(floor,center,safeCount,rng.fork(`${theme.id}-cross`));if(style==='courtyard')return courtyardPlan(floor,center,safeCount,rng.fork(`${theme.id}-court`));return streetPlan(floor,center,safeCount,rng.fork(`${theme.id}-street`));
}
