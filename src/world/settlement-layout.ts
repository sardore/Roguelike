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
function carveRect(floor:FloorMap,rect:Rect,kind:Parameters<typeof terrainTile>[0]='floor'):void{for(let y=rect.y;y<rect.y+rect.h;y+=1)for(let x=rect.x;x<rect.x+rect.w;x+=1)set(floor,x,y,kind);}
function roomCenter(rect:Rect):Point{return{x:rect.x+Math.floor(rect.w/2),y:rect.y+Math.floor(rect.h/2)};}
function stampRoom(floor:FloorMap,rect:Rect,door:Point):Point{
  for(let y=rect.y;y<rect.y+rect.h;y+=1)for(let x=rect.x;x<rect.x+rect.w;x+=1){
    const edge=x===rect.x||y===rect.y||x===rect.x+rect.w-1||y===rect.y+rect.h-1;
    set(floor,x,y,edge?'wall':'floor');
  }
  set(floor,door.x,door.y,'door');
  return roomCenter(rect);
}
function plaza(floor:FloorMap,center:Point,rng:DeterministicRng):void{
  for(let y=center.y-2;y<=center.y+2;y+=1)for(let x=center.x-2;x<=center.x+2;x+=1){
    if(Math.abs(x-center.x)===2&&Math.abs(y-center.y)===2)set(floor,x,y,rng.chance(.5)?'tree':'pillar');
    else set(floor,x,y,rng.chance(.28)?'grass':'floor');
  }
  set(floor,center.x,center.y,'holy');
}
function decorateStreet(floor:FloorMap,points:Point[],rng:DeterministicRng):void{
  for(const point of points){
    for(const side of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){
      if(!rng.chance(.16))continue;const x=point.x+side.x*2,y=point.y+side.y*2;
      const tile=floor.tiles[index(floor,x,y)];if(tile?.kind==='floor')set(floor,x,y,rng.chance(.65)?'grass':'bones');
    }
  }
}
function candidateCenters(floor:FloorMap):Point[]{
  const out:Point[]=[];
  for(let y=8;y<floor.height-8;y+=1)for(let x=12;x<floor.width-12;x+=1){
    const tile=floor.tiles[index(floor,x,y)];if(!tile?.walkable)continue;
    const point={x,y};if(manhattan(point,floor.spawn)<9||floor.exits.some((exit)=>manhattan(point,exit)<8))continue;
    out.push(point);
  }
  return out;
}

function streetPlan(floor:FloorMap,center:Point,count:number,rng:DeterministicRng):SettlementPlan{
  const horizontal=rng.chance(.5),points:Point[]=[];
  const halfLong=10,halfShort=6;
  if(horizontal){
    for(let x=center.x-halfLong;x<=center.x+halfLong;x+=1){set(floor,x,center.y,'floor');if(rng.chance(.25))set(floor,x,center.y+1,'grass');}
    for(let y=center.y-halfShort;y<=center.y+halfShort;y+=1)set(floor,center.x,y,'floor');
    const slots=[-8,-4,0,4,8];
    for(const offset of slots){
      for(const side of [-1,1]){
        if(points.length>=count)break;
        const w=rng.int(5,6),h=rng.int(4,5),x=center.x+offset-Math.floor(w/2),y=side<0?center.y-h-1:center.y+2;
        const door={x:center.x+offset,y:side<0?y+h-1:y};points.push(stampRoom(floor,{x,y,w,h},door));
      }
    }
  }else{
    for(let y=center.y-halfLong;y<=center.y+halfLong;y+=1){set(floor,center.x,y,'floor');if(rng.chance(.25))set(floor,center.x+1,y,'grass');}
    for(let x=center.x-halfShort;x<=center.x+halfShort;x+=1)set(floor,x,center.y,'floor');
    const slots=[-8,-4,0,4,8];
    for(const offset of slots){
      for(const side of [-1,1]){
        if(points.length>=count)break;
        const w=rng.int(5,6),h=rng.int(4,5),x=side<0?center.x-w-1:center.x+2,y=center.y+offset-Math.floor(h/2);
        const door={x:side<0?x+w-1:x,y:center.y+offset};points.push(stampRoom(floor,{x,y,w,h},door));
      }
    }
  }
  plaza(floor,center,rng.fork('plaza'));decorateStreet(floor,points,rng.fork('decor'));
  return{style:'street',points,square:center,bounds:horizontal?{minX:center.x-halfLong-1,minY:center.y-halfShort-1,maxX:center.x+halfLong+1,maxY:center.y+halfShort+1}:{minX:center.x-halfShort-1,minY:center.y-halfLong-1,maxX:center.x+halfShort+1,maxY:center.y+halfLong+1}};
}

function crossroadsPlan(floor:FloorMap,center:Point,count:number,rng:DeterministicRng):SettlementPlan{
  for(let d=-9;d<=9;d+=1){set(floor,center.x+d,center.y,'floor');set(floor,center.x,center.y+d,'floor');}
  plaza(floor,center,rng.fork('plaza'));
  const rects:Rect[]=[
    {x:center.x-10,y:center.y-7,w:6,h:5},{x:center.x+5,y:center.y-7,w:6,h:5},
    {x:center.x-10,y:center.y+3,w:6,h:5},{x:center.x+5,y:center.y+3,w:6,h:5},
    {x:center.x-3,y:center.y-8,w:6,h:4},{x:center.x-3,y:center.y+5,w:6,h:4},
  ];
  const points:Point[]=[];
  for(const rect of rects.slice(0,count)){
    const c=roomCenter(rect),dx=Math.sign(center.x-c.x),dy=Math.sign(center.y-c.y),door={x:dx?rect.x+(dx>0?rect.w-1:0):c.x,y:dy?rect.y+(dy>0?rect.h-1:0):c.y};
    points.push(stampRoom(floor,rect,door));
  }
  decorateStreet(floor,points,rng.fork('decor'));
  return{style:'crossroads',points,square:center,bounds:{minX:center.x-11,minY:center.y-9,maxX:center.x+11,maxY:center.y+9}};
}

function courtyardPlan(floor:FloorMap,center:Point,count:number,rng:DeterministicRng):SettlementPlan{
  carveRect(floor,{x:center.x-5,y:center.y-3,w:11,h:7},'grass');
  for(let x=center.x-5;x<=center.x+5;x+=1){set(floor,x,center.y-3,'floor');set(floor,x,center.y+3,'floor');}
  for(let y=center.y-3;y<=center.y+3;y+=1){set(floor,center.x-5,y,'floor');set(floor,center.x+5,y,'floor');}
  plaza(floor,center,rng.fork('plaza'));
  const rects:Rect[]=[
    {x:center.x-10,y:center.y-7,w:6,h:5},{x:center.x-2,y:center.y-8,w:5,h:5},{x:center.x+5,y:center.y-7,w:6,h:5},
    {x:center.x-10,y:center.y+3,w:6,h:5},{x:center.x-2,y:center.y+4,w:5,h:5},{x:center.x+5,y:center.y+3,w:6,h:5},
    {x:center.x+7,y:center.y-1,w:5,h:4},
  ];
  const points:Point[]=[];
  for(const rect of rects.slice(0,count)){
    const c=roomCenter(rect),dx=Math.sign(center.x-c.x),dy=Math.sign(center.y-c.y),door={x:dx?rect.x+(dx>0?rect.w-1:0):c.x,y:dy?rect.y+(dy>0?rect.h-1:0):c.y};
    points.push(stampRoom(floor,rect,door));
  }
  decorateStreet(floor,points,rng.fork('decor'));
  return{style:'courtyard',points,square:center,bounds:{minX:center.x-11,minY:center.y-9,maxX:center.x+12,maxY:center.y+9}};
}

export function stampSettlement(floor:FloorMap,theme:ThemeDefinition,coord:WorldCoord,rng:DeterministicRng,count:number):SettlementPlan|null{
  const candidates=rng.shuffle(candidateCenters(floor));if(!candidates.length)return null;
  const center=candidates[0]!;
  const styles:SettlementLayoutStyle[]=['street','crossroads','courtyard'];
  const style=styles[(coord.depth+Math.abs(coord.lane)+rng.int(0,styles.length-1))%styles.length]!;
  const safeCount=Math.max(4,Math.min(7,count));
  if(style==='crossroads')return crossroadsPlan(floor,center,safeCount,rng.fork(`${theme.id}-cross`));
  if(style==='courtyard')return courtyardPlan(floor,center,safeCount,rng.fork(`${theme.id}-court`));
  return streetPlan(floor,center,safeCount,rng.fork(`${theme.id}-street`));
}
