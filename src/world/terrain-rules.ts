import type { FloorMap, Point, ThemeDefinition, Tile, TileKind, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';

export interface TerrainDefinition {
  kind:TileKind;
  glyph:string;
  walkable:boolean;
  transparent:boolean;
  damageType?:string;
  damage?:number;
  statusId?:string;
  statusDuration?:number;
  monsterImmuneTags?:string[];
  manaPulse?:number;
  movementTax?:number;
}

export const TERRAIN_DEFS:Record<TileKind,TerrainDefinition>={
  wall:{kind:'wall',glyph:'#',walkable:false,transparent:false},
  floor:{kind:'floor',glyph:'.',walkable:true,transparent:true},
  water:{kind:'water',glyph:'~',walkable:true,transparent:true,movementTax:1},
  lava:{kind:'lava',glyph:'~',walkable:true,transparent:true,damageType:'fire',damage:3,monsterImmuneTags:['fire']},
  bridge:{kind:'bridge',glyph:'=',walkable:true,transparent:true},
  rubble:{kind:'rubble',glyph:':',walkable:true,transparent:true,movementTax:1},
  ice:{kind:'ice',glyph:'_',walkable:true,transparent:true,movementTax:0},
  miasma:{kind:'miasma',glyph:'≈',walkable:true,transparent:true,damageType:'poison',damage:2,statusId:'poisoned',statusDuration:2,monsterImmuneTags:['undead','construct','venom']},
  bramble:{kind:'bramble',glyph:'"',walkable:true,transparent:true,damageType:'physical',damage:1,statusId:'pinned',statusDuration:1,monsterImmuneTags:['plant']},
  'void-rift':{kind:'void-rift',glyph:'¤',walkable:true,transparent:true,damageType:'void',damage:2,monsterImmuneTags:['void']},
  oil:{kind:'oil',glyph:'~',walkable:true,transparent:true,movementTax:0},
  holy:{kind:'holy',glyph:'·',walkable:true,transparent:true,manaPulse:1,monsterImmuneTags:['holy']},
  tree:{kind:'tree',glyph:'T',walkable:false,transparent:false},
  grass:{kind:'grass',glyph:'"',walkable:true,transparent:true},
  reed:{kind:'reed',glyph:'|',walkable:true,transparent:true,movementTax:1},
  fungus:{kind:'fungus',glyph:';',walkable:true,transparent:true},
  crystal:{kind:'crystal',glyph:'*',walkable:false,transparent:true},
  bones:{kind:'bones',glyph:'%',walkable:true,transparent:true},
  pillar:{kind:'pillar',glyph:'O',walkable:false,transparent:false},
  door:{kind:'door',glyph:'+',walkable:true,transparent:true},
};

export function terrainDefinition(kind:TileKind):TerrainDefinition{return TERRAIN_DEFS[kind];}
export function terrainTile(kind:TileKind):Tile{const def=terrainDefinition(kind);return{kind,glyph:def.glyph,walkable:def.walkable,transparent:def.transparent};}

function key(point:Point):string{return `${point.x},${point.y}`;}
function manhattan(a:Point,b:Point):number{return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
function terrainPool(theme:ThemeDefinition):Array<{value:TileKind;weight:number}>{
  const tags=new Set(theme.monsterTags),out:Array<{value:TileKind;weight:number}>=[];
  const add=(value:TileKind,weight:number)=>out.push({value,weight});
  if(tags.has('aquatic')){add('water',5);add('reed',2);add('ice',.6);}
  if(tags.has('fire')){add('lava',4);add('oil',3);add('rubble',1);}
  if(tags.has('ice')){add('ice',6);add('water',1.5);}
  if(tags.has('venom')){add('miasma',5);add('bramble',2);add('reed',1.5);}
  if(tags.has('fungal')){add('fungus',5);add('miasma',2);add('bramble',1.5);}
  if(tags.has('plant')){add('bramble',3);add('grass',4);}
  if(tags.has('flesh')){add('miasma',3);add('bramble',2);}
  if(tags.has('void')||tags.has('aberrant'))add('void-rift',6);
  if(tags.has('spirit')){add('void-rift',1.5);add('holy',1);}
  if(tags.has('royal')||tags.has('humanoid')){add('holy',1);add('rubble',1.5);}
  if(tags.has('construct')){add('oil',2);add('rubble',2);}
  if(!out.length){add('rubble',2);add('water',1);add('grass',1);}
  return out;
}

function paintPatch(floor:FloorMap,kind:TileKind,seed:Point,radius:number,steps:number,rng:DeterministicRng,reserved:Set<string>,nearReserved:(point:Point)=>boolean):void{
  let cursor={...seed};
  for(let step=0;step<steps;step+=1){
    for(let y=Math.max(1,cursor.y-radius);y<Math.min(floor.height-1,cursor.y+radius+1);y+=1)for(let x=Math.max(1,cursor.x-radius);x<Math.min(floor.width-1,cursor.x+radius+1);x+=1){
      const point={x,y};if(manhattan(point,cursor)>radius||reserved.has(key(point))||nearReserved(point))continue;
      const index=y*floor.width+x,tile=floor.tiles[index]!;if(tile.kind!=='floor'&&tile.kind!=='rubble'&&tile.kind!=='grass')continue;
      if(rng.chance(.44))floor.tiles[index]=terrainTile(kind);
    }
    const dir=rng.pick([[1,0],[-1,0],[0,1],[0,-1]] as const);cursor={x:Math.max(1,Math.min(floor.width-2,cursor.x+dir[0])),y:Math.max(1,Math.min(floor.height-2,cursor.y+dir[1]))};
  }
}

export function applyThemedTerrain(floor:FloorMap,theme:ThemeDefinition,coord:WorldCoord,rng:DeterministicRng,extraReserved:Point[]=[]):void{
  if(theme.id==='abyss'&&rng.chance(.7))theme={...theme,monsterTags:[...theme.monsterTags,'void','aberrant']};
  const reservedPoints=[floor.spawn,...floor.exits,...extraReserved],reserved=new Set<string>(reservedPoints.map(key));
  const nearReserved=(point:Point)=>reservedPoints.some((entry)=>manhattan(entry,point)<=2),candidates:Point[]=[];
  for(let i=0;i<floor.tiles.length;i+=1){const tile=floor.tiles[i]!;if(tile.kind!=='floor'&&tile.kind!=='rubble'&&tile.kind!=='grass')continue;const point={x:i%floor.width,y:Math.floor(i/floor.width)};if(reserved.has(key(point))||nearReserved(point)||manhattan(point,floor.spawn)<5||floor.exits.some((exit)=>manhattan(point,exit)<3))continue;candidates.push(point);}
  if(!candidates.length)return;
  const pool=terrainPool(theme),primary=rng.weighted(pool),secondaryPool=pool.filter((entry)=>entry.value!==primary),secondary=secondaryPool.length&&rng.chance(theme.id==='abyss'?.65:.28)?rng.weighted(secondaryPool):null;
  const patches=theme.id==='abyss'?rng.int(4,6):Math.min(4,2+Math.floor(coord.depth/50)+rng.int(0,1));
  for(let patch=0;patch<patches;patch+=1){const kind=secondary&&patch===patches-1?secondary:primary,seed=rng.pick(candidates),radius=rng.int(1,2)+(theme.id==='abyss'?1:0),steps=rng.int(5,8)+radius*2;paintPatch(floor,kind,seed,radius,steps,rng.fork(`patch:${patch}:${kind}`),reserved,nearReserved);}
}
