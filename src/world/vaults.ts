import type { FloorMap, Point, ThemeDefinition, TileKind, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';
import { terrainTile } from './terrain-rules';

export interface VaultStamp { id:string; family:string; center:Point; }

interface VaultDefinition {
  id:string;
  family:string;
  weight:number;
  minDepth:number;
  tags:string[];
  rows:string[];
  rotate?:boolean;
  reflect?:boolean;
}

const LEGEND:Record<string,TileKind>={
  '#':'wall','.':'floor','+':'door','~':'water','=':'bridge','T':'tree','g':'grass','P':'pillar','b':'bones','c':'crystal','m':'miasma','o':'oil','_':'holy',':':'rubble','i':'ice','v':'void-rift',
};

const VAULTS:VaultDefinition[]=[
  {id:'broken-gate',family:'fort',weight:8,minDepth:1,tags:['humanoid','construct'],rotate:true,reflect:true,rows:[
    '  ##+##  ',
    '###...###',
    '+..P.P..+',
    '###...###',
    '  ##+##  ',
  ]},
  {id:'split-watch',family:'fort',weight:6,minDepth:4,tags:['humanoid','royal','construct'],rotate:true,reflect:true,rows:[
    '###+###',
    '#.....#',
    '+.###.+',
    '#..P..#',
    '###.###',
  ]},
  {id:'flooded-crossing',family:'water',weight:8,minDepth:1,tags:['aquatic','venom'],rotate:true,reflect:true,rows:[
    '~~~=~~~',
    '~~.=.~~',
    '...=...',
    '~~.=.~~',
    '~~~=~~~',
  ]},
  {id:'reed-islets',family:'water',weight:6,minDepth:5,tags:['aquatic','venom','plant'],rotate:true,reflect:true,rows:[
    ' ~~.~~ ',
    '~gg.gg~',
    '.g...g.',
    '~gg.gg~',
    ' ~~.~~ ',
  ]},
  {id:'ossuary-gate',family:'crypt',weight:8,minDepth:4,tags:['undead','spirit'],rotate:true,reflect:true,rows:[
    '###+###',
    '#b.b.b#',
    '+.P.P.+',
    '#b.b.b#',
    '###.###',
  ]},
  {id:'bone-cells',family:'crypt',weight:5,minDepth:10,tags:['undead','spirit'],rotate:true,reflect:true,rows:[
    '###+###',
    '#b#.#b#',
    '+.#.#.+',
    '#b#.#b#',
    '###+###',
  ]},
  {id:'fungal-pocket',family:'wild',weight:8,minDepth:3,tags:['fungal','plant','beast'],rotate:true,reflect:true,rows:[
    ' TgggT ',
    'Tgmmm gT',
    'gmm.mm g',
    'Tg mmmgT',
    ' TgggT ',
  ]},
  {id:'woodland-fork',family:'wild',weight:7,minDepth:1,tags:['plant','beast','fungal'],rotate:true,reflect:true,rows:[
    'TT...TT',
    'Tg...gT',
    '..TTT..',
    'Tg...gT',
    'TT...TT',
  ]},
  {id:'crystal-prism',family:'arcane',weight:7,minDepth:8,tags:['crystal','ice','caster'],rotate:true,reflect:true,rows:[
    ' cc.cc ',
    'c.i.i.c',
    '.i...i.',
    'c.i.i.c',
    ' cc.cc ',
  ]},
  {id:'shrine-walk',family:'arcane',weight:6,minDepth:7,tags:['spirit','caster','royal'],rotate:true,reflect:true,rows:[
    'P.._..P',
    '.##.##.',
    '_.._.._',
    '.##.##.',
    'P.._..P',
  ]},
  {id:'forge-yard',family:'works',weight:7,minDepth:6,tags:['construct','fire'],rotate:true,reflect:true,rows:[
    '###+###',
    '#o...o#',
    '+.=~=.+',
    '#o...o#',
    '###.###',
  ]},
  {id:'collapsed-workshop',family:'works',weight:5,minDepth:12,tags:['construct','fire','humanoid'],rotate:true,reflect:true,rows:[
    '##:+:##',
    '#::..:#',
    '+.P.P.+',
    '#:..::#',
    '##:+:##',
  ]},
  {id:'void-lens',family:'rift',weight:7,minDepth:16,tags:['void','aberrant'],rotate:true,reflect:true,rows:[
    '  v.v  ',
    ' v...v ',
    'v..P..v',
    ' v...v ',
    '  v.v  ',
  ]},
  {id:'broken-ring',family:'rift',weight:5,minDepth:20,tags:['void','aberrant','spirit'],rotate:true,reflect:true,rows:[
    'vv...vv',
    'v.###.v',
    '.#...#.',
    'v.###.v',
    'vv...vv',
  ]},
];

function idx(floor:FloorMap,x:number,y:number):number{return y*floor.width+x;}
function key(p:Point):string{return `${p.x},${p.y}`;}
function manhattan(a:Point,b:Point):number{return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
function inBounds(floor:FloorMap,x:number,y:number):boolean{return x>=1&&y>=1&&x<floor.width-1&&y<floor.height-1;}
function rotateRows(rows:string[]):string[]{const h=rows.length,w=Math.max(...rows.map((row)=>row.length));const padded=rows.map((row)=>row.padEnd(w,' '));const out:string[]=[];for(let x=0;x<w;x+=1){let row='';for(let y=h-1;y>=0;y-=1)row+=padded[y]![x]??' ';out.push(row);}return out;}
function reflectRows(rows:string[]):string[]{return rows.map((row)=>[...row].reverse().join(''));}
function transformed(def:VaultDefinition,rng:DeterministicRng):string[]{let rows=[...def.rows];if(def.rotate){for(let i=0,n=rng.int(0,3);i<n;i+=1)rows=rotateRows(rows);}if(def.reflect&&rng.chance(.5))rows=reflectRows(rows);return rows;}
function eligible(theme:ThemeDefinition,coord:WorldCoord):Array<{value:VaultDefinition;weight:number}>{
  const themeTags=new Set(theme.monsterTags);return VAULTS.filter((def)=>coord.depth>=def.minDepth).map((def)=>{const matches=def.tags.filter((tag)=>themeTags.has(tag)).length;return{value:def,weight:def.weight*(matches?1+matches*1.8:.18)};});
}
function occupiedNear(point:Point,reserved:Set<string>,floor:FloorMap):boolean{
  if(reserved.has(key(point))||manhattan(point,floor.spawn)<7||floor.exits.some((exit)=>manhattan(point,exit)<5))return true;return false;
}
function fitScore(floor:FloorMap,rows:string[],left:number,top:number,reserved:Set<string>):number{
  let used=0,compatible=0;for(let y=0;y<rows.length;y+=1)for(let x=0;x<rows[y]!.length;x+=1){const ch=rows[y]![x]!;if(ch===' ')continue;used+=1;const wx=left+x,wy=top+y;if(!inBounds(floor,wx,wy)||occupiedNear({x:wx,y:wy},reserved,floor))continue;const tile=floor.tiles[idx(floor,wx,wy)];if(tile&&(tile.walkable||tile.kind==='wall'))compatible+=1;}return used?compatible/used:0;
}
function candidatePlacements(floor:FloorMap,rows:string[],rng:DeterministicRng,reserved:Set<string>):Array<{left:number;top:number;center:Point;score:number}>{
  const h=rows.length,w=Math.max(...rows.map((row)=>row.length)),out:Array<{left:number;top:number;center:Point;score:number}>=[];
  for(let attempt=0;attempt<80;attempt+=1){const left=rng.int(2,Math.max(2,floor.width-w-3)),top=rng.int(2,Math.max(2,floor.height-h-3)),center={x:left+Math.floor(w/2),y:top+Math.floor(h/2)};if(occupiedNear(center,reserved,floor))continue;const score=fitScore(floor,rows,left,top,reserved);if(score>=.86)out.push({left,top,center,score});}
  return out.sort((a,b)=>b.score-a.score);
}
function stamp(floor:FloorMap,rows:string[],left:number,top:number,reserved:Set<string>):void{
  for(let y=0;y<rows.length;y+=1)for(let x=0;x<rows[y]!.length;x+=1){const ch=rows[y]![x]!,kind=LEGEND[ch];if(!kind)continue;const wx=left+x,wy=top+y;if(!inBounds(floor,wx,wy)||reserved.has(`${wx},${wy}`))continue;floor.tiles[idx(floor,wx,wy)]=terrainTile(kind);}
}
function carveLine(floor:FloorMap,a:Point,b:Point):void{let x=a.x,y=a.y;while(x!==b.x){if(inBounds(floor,x,y))floor.tiles[idx(floor,x,y)]=terrainTile('floor');x+=Math.sign(b.x-x);}while(y!==b.y){if(inBounds(floor,x,y))floor.tiles[idx(floor,x,y)]=terrainTile('floor');y+=Math.sign(b.y-y);}if(inBounds(floor,x,y))floor.tiles[idx(floor,x,y)]=terrainTile('floor');}
function reachable(floor:FloorMap):Set<string>{const seen=new Set<string>(),queue:Point[]=[floor.spawn];for(let i=0;i<queue.length;i+=1){const p=queue[i]!,k=key(p);if(seen.has(k)||!floor.tiles[idx(floor,p.x,p.y)]?.walkable)continue;seen.add(k);for(const d of [[1,0],[-1,0],[0,1],[0,-1]] as const){const n={x:p.x+d[0],y:p.y+d[1]};if(inBounds(floor,n.x,n.y)&&!seen.has(key(n)))queue.push(n);}}return seen;}
function repairConnectivity(floor:FloorMap):void{let open=reachable(floor);for(const exit of floor.exits){if(open.has(key(exit)))continue;const pivot={x:exit.x,y:floor.spawn.y};carveLine(floor,floor.spawn,pivot);carveLine(floor,pivot,exit);open=reachable(floor);}}

function placeOne(floor:FloorMap,def:VaultDefinition,rng:DeterministicRng,reserved:Set<string>,stamps:VaultStamp[]):boolean{
  const rows=transformed(def,rng),placements=candidatePlacements(floor,rows,rng,reserved).filter((candidate)=>stamps.every((stamp)=>manhattan(stamp.center,candidate.center)>=8));const chosen=placements[0];if(!chosen)return false;stamp(floor,rows,chosen.left,chosen.top,reserved);stamps.push({id:def.id,family:def.family,center:chosen.center});return true;
}

export function applyVaultLayer(floor:FloorMap,theme:ThemeDefinition,coord:WorldCoord,rng:DeterministicRng,extraReserved:Point[]=[]):VaultStamp[]{
  const reserved=new Set([key(floor.spawn),...floor.exits.map(key),...extraReserved.map(key)]),choices=eligible(theme,coord),stamps:VaultStamp[]=[];if(!choices.length)return stamps;
  const baseCount=coord.depth<6?1:rng.int(1,3);for(let i=0;i<baseCount;i+=1){const def=rng.weighted(choices);placeOne(floor,def,rng.fork(`vault:${i}:${def.id}`),reserved,stamps);}
  if(coord.depth>=5&&rng.chance(.48)){
    const familySeed=rng.weighted(choices).family,family=choices.filter((entry)=>entry.value.family===familySeed);const serialCount=rng.int(2,3);
    for(let i=0;i<serialCount&&family.length;i+=1){const def=rng.weighted(family);placeOne(floor,def,rng.fork(`serial:${familySeed}:${i}:${def.id}`),reserved,stamps);}
  }
  repairConnectivity(floor);return stamps;
}

export function vaultCatalogSize():number{return VAULTS.length;}
