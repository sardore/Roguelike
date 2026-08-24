import type { FloorMap, Point, ThemeDefinition, TileKind, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';
import { terrainTile } from './terrain-rules';

export type StructureKind =
  | 'woodland-lanes'
  | 'canal-quarter'
  | 'ruined-blocks'
  | 'burial-terraces'
  | 'mine-spine'
  | 'fungal-zone'
  | 'crystal-gallery'
  | 'shrine-axis'
  | 'fracture-scar';

export interface StructureStamp { kind: StructureKind; center: Point; radius: number; }

interface Rect { x:number; y:number; w:number; h:number; }

function key(p:Point):string{return `${p.x},${p.y}`;}
function idx(floor:FloorMap,x:number,y:number):number{return y*floor.width+x;}
function inBounds(floor:FloorMap,x:number,y:number,margin=1):boolean{return x>=margin&&y>=margin&&x<floor.width-margin&&y<floor.height-margin;}
function manhattan(a:Point,b:Point):number{return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
function current(floor:FloorMap,x:number,y:number){return floor.tiles[idx(floor,x,y)];}
function reservedSet(floor:FloorMap,extra:Point[]):Set<string>{return new Set([key(floor.spawn),...floor.exits.map(key),...extra.map(key)]);}
function canPaint(floor:FloorMap,x:number,y:number,reserved:Set<string>):boolean{
  if(!inBounds(floor,x,y)||reserved.has(`${x},${y}`))return false;
  const tile=current(floor,x,y);return Boolean(tile&&(tile.walkable||tile.kind==='wall'));
}
function set(floor:FloorMap,x:number,y:number,kind:TileKind,reserved:Set<string>):void{if(canPaint(floor,x,y,reserved))floor.tiles[idx(floor,x,y)]=terrainTile(kind);}
function carve(floor:FloorMap,a:Point,b:Point,reserved:Set<string>,kind:TileKind='floor'):void{
  let x=a.x,y=a.y;while(x!==b.x){set(floor,x,y,kind,reserved);x+=Math.sign(b.x-x);}while(y!==b.y){set(floor,x,y,kind,reserved);y+=Math.sign(b.y-y);}set(floor,x,y,kind,reserved);
}
function carveRect(floor:FloorMap,rect:Rect,reserved:Set<string>,kind:TileKind='floor'):void{for(let y=rect.y;y<rect.y+rect.h;y+=1)for(let x=rect.x;x<rect.x+rect.w;x+=1)set(floor,x,y,kind,reserved);}
function center(rect:Rect):Point{return{x:rect.x+Math.floor(rect.w/2),y:rect.y+Math.floor(rect.h/2)};}
function safeCenter(floor:FloorMap,rng:DeterministicRng):Point{return{x:rng.int(10,floor.width-11),y:rng.int(7,floor.height-8)};}

function preserveBackbone(floor:FloorMap,reserved:Set<string>):void{
  for(const exit of floor.exits){
    const pivot={x:exit.x,y:floor.spawn.y};
    carve(floor,floor.spawn,pivot,reserved,'floor');carve(floor,pivot,exit,reserved,'floor');
  }
  for(const point of [floor.spawn,...floor.exits]){
    for(let dy=-1;dy<=1;dy+=1)for(let dx=-1;dx<=1;dx+=1)if(Math.abs(dx)+Math.abs(dy)<=1)set(floor,point.x+dx,point.y+dy,'floor',new Set());
  }
}

function woodlandLanes(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const horizontal=rng.chance(.5),c=safeCenter(floor,rng),half=rng.int(6,9);
  const rect:Rect=horizontal?{x:2,y:c.y-half,w:floor.width-4,h:half*2+1}:{x:c.x-half,y:2,w:half*2+1,h:floor.height-4};
  for(let y=rect.y;y<rect.y+rect.h;y+=1)for(let x=rect.x;x<rect.x+rect.w;x+=1){if(!current(floor,x,y)?.walkable)continue;const edge=horizontal?Math.abs(y-c.y):Math.abs(x-c.x);const roll=rng.float();if(edge>half*.55&&roll<.50)set(floor,x,y,'tree',reserved);else if(roll<.78)set(floor,x,y,'grass',reserved);}
  const laneA=horizontal?{x:2,y:c.y-2}:{x:c.x-2,y:2},laneB=horizontal?{x:floor.width-3,y:c.y-2}:{x:c.x-2,y:floor.height-3};carve(floor,laneA,laneB,reserved);
  const laneC=horizontal?{x:2,y:c.y+2}:{x:c.x+2,y:2},laneD=horizontal?{x:floor.width-3,y:c.y+2}:{x:c.x+2,y:floor.height-3};carve(floor,laneC,laneD,reserved);
  return{kind:'woodland-lanes',center:c,radius:half};
}

function canalQuarter(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const vertical=rng.chance(.5),c=safeCenter(floor,rng),width=rng.int(2,3);let drift=0;
  const length=vertical?floor.height-4:floor.width-4;
  for(let i=2;i<length+2;i+=1){if(i%4===0)drift=Math.max(-3,Math.min(3,drift+rng.int(-1,1)));for(let w=-width;w<=width;w+=1){const x=vertical?c.x+drift+w:i,y=vertical?i:c.y+drift+w;set(floor,x,y,'water',reserved);}}
  const crossings=[.23,.5,.77];for(const t of crossings){const i=Math.round(2+(length-1)*t);for(let w=-(width+1);w<=width+1;w+=1){const x=vertical?c.x+drift+w:i,y=vertical?i:c.y+drift+w;set(floor,x,y,'bridge',reserved);}}
  return{kind:'canal-quarter',center:c,radius:width+4};
}

function ruinedBlocks(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const c=safeCenter(floor,rng),blocks:Rect[]=[];const horizontal=rng.chance(.5);
  for(let i=-1;i<=1;i+=1){const w=rng.int(6,9),h=rng.int(5,7);const rect=horizontal?{x:c.x+i*12-Math.floor(w/2),y:c.y+rng.int(-3,3)-Math.floor(h/2),w,h}:{x:c.x+rng.int(-4,4)-Math.floor(w/2),y:c.y+i*9-Math.floor(h/2),w,h};blocks.push(rect);}
  for(const rect of blocks){for(let y=rect.y;y<rect.y+rect.h;y+=1)for(let x=rect.x;x<rect.x+rect.w;x+=1){const edge=x===rect.x||y===rect.y||x===rect.x+rect.w-1||y===rect.y+rect.h-1;if(edge)set(floor,x,y,rng.chance(.18)?'rubble':'wall',reserved);else set(floor,x,y,rng.chance(.12)?'rubble':'floor',reserved);}const door=center(rect);if(horizontal)set(floor,door.x,rect.y+rect.h-1,'door',reserved);else set(floor,rect.x+rect.w-1,door.y,'door',reserved);}
  for(let i=1;i<blocks.length;i+=1)carve(floor,center(blocks[i-1]!),center(blocks[i]!),reserved);
  return{kind:'ruined-blocks',center:c,radius:12};
}

function burialTerraces(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const c=safeCenter(floor,rng),horizontal=rng.chance(.5),span=rng.int(8,11);
  for(let lane=-4;lane<=4;lane+=2)for(let d=-span;d<=span;d+=1){const x=horizontal?c.x+d:c.x+lane,y=horizontal?c.y+lane:c.y+d;if(lane===0)set(floor,x,y,d%3===0?'bones':'floor',reserved);else if(d%3===0)set(floor,x,y,'pillar',reserved);else if(rng.chance(.5))set(floor,x,y,'bones',reserved);}
  carve(floor,horizontal?{x:c.x-span,y:c.y}:{x:c.x,y:c.y-span},horizontal?{x:c.x+span,y:c.y}:{x:c.x,y:c.y+span},reserved);
  return{kind:'burial-terraces',center:c,radius:span};
}

function mineSpine(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const c=safeCenter(floor,rng),horizontal=rng.chance(.5),start=horizontal?{x:2,y:c.y}:{x:c.x,y:2},end=horizontal?{x:floor.width-3,y:c.y}:{x:c.x,y:floor.height-3};carve(floor,start,end,reserved);
  for(let i=-2;i<=2;i+=1){if(i===0)continue;const anchor=horizontal?{x:c.x+i*7,y:c.y}:{x:c.x,y:c.y+i*5},side=horizontal?{x:anchor.x,y:anchor.y+(i%2===0?6:-6)}:{x:anchor.x+(i%2===0?8:-8),y:anchor.y};carve(floor,anchor,side,reserved);carveRect(floor,{x:side.x-2,y:side.y-2,w:5,h:5},reserved,rng.chance(.22)?'rubble':'floor');}
  return{kind:'mine-spine',center:c,radius:10};
}

function fungalZone(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const c=safeCenter(floor,rng),rx=rng.int(7,10),ry=rng.int(4,6);for(let y=c.y-ry;y<=c.y+ry;y+=1)for(let x=c.x-rx;x<=c.x+rx;x+=1){if(((x-c.x)**2)/(rx*rx)+((y-c.y)**2)/(ry*ry)>1)continue;if(!current(floor,x,y)?.walkable)continue;const r=rng.float();if(r<.1)set(floor,x,y,'miasma',reserved);else if(r<.7)set(floor,x,y,'fungus',reserved);else if(r<.82)set(floor,x,y,'tree',reserved);}carve(floor,{x:c.x-rx,y:c.y},{x:c.x+rx,y:c.y},reserved);return{kind:'fungal-zone',center:c,radius:rx};
}
function crystalGallery(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const c=safeCenter(floor,rng),span=rng.int(8,11),vertical=rng.chance(.5);for(let d=-span;d<=span;d+=1)for(let w=-3;w<=3;w+=1){const x=vertical?c.x+w:c.x+d,y=vertical?c.y+d:c.y+w;if(Math.abs(w)===3&&d%2===0)set(floor,x,y,'crystal',reserved);else if(Math.abs(w)<=1&&rng.chance(.55))set(floor,x,y,'ice',reserved);}carve(floor,vertical?{x:c.x,y:c.y-span}:{x:c.x-span,y:c.y},vertical?{x:c.x,y:c.y+span}:{x:c.x+span,y:c.y},reserved);return{kind:'crystal-gallery',center:c,radius:span};
}
function shrineAxis(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  const c=safeCenter(floor,rng),span=rng.int(6,9);for(let d=-span;d<=span;d+=1){set(floor,c.x+d,c.y,'holy',reserved);if(d%3===0){set(floor,c.x+d,c.y-2,'pillar',reserved);set(floor,c.x+d,c.y+2,'pillar',reserved);}}carve(floor,{x:c.x-span,y:c.y},{x:c.x+span,y:c.y},reserved);return{kind:'shrine-axis',center:c,radius:span};
}
function fractureScar(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>):StructureStamp{
  let c=safeCenter(floor,rng),cursor={...c};const steps=rng.int(18,28);for(let i=0;i<steps;i+=1){set(floor,cursor.x,cursor.y,'void-rift',reserved);for(const side of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}])if(rng.chance(.18))set(floor,cursor.x+side.x,cursor.y+side.y,'rubble',reserved);const d=rng.pick([{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]);cursor={x:Math.max(2,Math.min(floor.width-3,cursor.x+d.x)),y:Math.max(2,Math.min(floor.height-3,cursor.y+d.y))};}return{kind:'fracture-scar',center:c,radius:6};
}

const BUILDERS:Record<StructureKind,(floor:FloorMap,rng:DeterministicRng,reserved:Set<string>)=>StructureStamp>={
  'woodland-lanes':woodlandLanes,'canal-quarter':canalQuarter,'ruined-blocks':ruinedBlocks,'burial-terraces':burialTerraces,'mine-spine':mineSpine,'fungal-zone':fungalZone,'crystal-gallery':crystalGallery,'shrine-axis':shrineAxis,'fracture-scar':fractureScar,
};
function pool(theme:ThemeDefinition):Array<{value:StructureKind;weight:number}>{
  const tags=new Set(theme.monsterTags),out:Array<{value:StructureKind;weight:number}>=[{value:'ruined-blocks',weight:1.1},{value:'mine-spine',weight:.8}];const add=(value:StructureKind,weight:number)=>out.push({value,weight});
  if(tags.has('plant')||tags.has('beast'))add('woodland-lanes',4.5);if(tags.has('aquatic')||tags.has('venom'))add('canal-quarter',4.2);if(tags.has('undead')||tags.has('spirit'))add('burial-terraces',4.3);if(tags.has('construct')||tags.has('fire'))add('mine-spine',3.7);if(tags.has('fungal'))add('fungal-zone',6);if(tags.has('crystal')||tags.has('ice'))add('crystal-gallery',5.5);if(tags.has('humanoid')||tags.has('royal')||tags.has('spirit'))add('shrine-axis',2.5);if(tags.has('void')||tags.has('aberrant'))add('fracture-scar',5.8);return out;
}

export function applyFloorBlueprint(floor:FloorMap,theme:ThemeDefinition,coord:WorldCoord,rng:DeterministicRng,extraReserved:Point[]=[]):StructureStamp[]{
  const reserved=reservedSet(floor,extraReserved),choices=pool(theme),used=new Set<StructureKind>(),stamps:StructureStamp[]=[];
  const primary=rng.weighted(choices);used.add(primary);stamps.push(BUILDERS[primary](floor,rng.fork(`primary:${primary}`),reserved));
  const secondaryChance=coord.depth>=10?.72:.48;if(rng.chance(secondaryChance)){const remaining=choices.filter((entry)=>!used.has(entry.value));if(remaining.length){const secondary=rng.weighted(remaining);stamps.push(BUILDERS[secondary](floor,rng.fork(`secondary:${secondary}`),reserved));}}
  preserveBackbone(floor,reserved);return stamps;
}
