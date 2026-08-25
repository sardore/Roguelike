import { ENEMIES } from './content';
import { Rng } from './rng';
import type { EliteKind, EnemyKind, GameState, ItemKind, Point, Tile } from './types';
import { at, updateVisibility } from './world';

const DIRS=[[1,0],[-1,0],[0,1],[0,-1]] as const;
const RARE:ItemKind[]=['amber-elixir','black-catalyst','frost-salts','solvent','neutralizer','smoke-ampoule'];

function d(a:Point,b:Point){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function free(s:GameState,p:Point){const t=at(s,p);return !!t&&t.kind==='floor'&&!t.fixture&&!t.blocks&&!s.items.some(i=>i.x===p.x&&i.y===p.y)&&!s.enemies.some(e=>e.x===p.x&&e.y===p.y)&&!(s.player.x===p.x&&s.player.y===p.y)}
function stair(s:GameState){const i=s.tiles.findIndex(t=>t.kind==='stairs');return i<0?undefined:{x:i%s.width,y:Math.floor(i/s.width)}}
function roomy(s:GameState,p:Point){if(!free(s,p)||d(p,s.player)<9)return false;const exit=stair(s);if(exit&&d(p,exit)<6)return false;let open=0,fixtures=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const t=at(s,{x:p.x+dx,y:p.y+dy});if(t&&t.kind!=='wall')open++;if(t?.fixture)fixtures++}return open>=21&&fixtures<=2}
function choose(s:GameState,rng:Rng){const pool:Point[]=[];for(let y=3;y<s.height-3;y++)for(let x=3;x<s.width-3;x++){const p={x,y};if(roomy(s,p))pool.push(p)}return pool.length?pool[rng.int(0,pool.length-1)]:undefined}
function terrain(s:GameState,p:Point,k:Tile['kind'],variant=2){const t=at(s,p);if(!t||t.kind==='wall'||t.kind==='stairs'||t.fixture)return false;t.kind=k;t.variant=variant;return true}
function fixture(s:GameState,p:Point,k:NonNullable<Tile['fixture']>,blocks=true,state=0){const t=at(s,p);if(!t||t.kind==='wall'||t.kind==='stairs'||t.fixture)return false;t.fixture=k;t.blocks=blocks;t.state=state;return true}
function drop(s:GameState,c:Point,kind:ItemKind,id:string){for(let r=1;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)+Math.abs(dy)!==r)continue;const p={x:c.x+dx,y:c.y+dy};if(free(s,p)){s.items.push({id,kind,x:p.x,y:p.y});return}}}
function spawn(s:GameState,c:Point,kind:EnemyKind,id:string,elite?:EliteKind,hpBonus=0){for(let r=1;r<=5;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)+Math.abs(dy)!==r)continue;const p={x:c.x+dx,y:c.y+dy};if(!free(s,p))continue;s.enemies.push({id,kind,x:p.x,y:p.y,hp:ENEMIES[kind].hp+hpBonus,cooldown:1,elite});return}}
function cross(s:GameState,c:Point,k:Tile['kind'],variant=2){terrain(s,c,k,variant);for(const [dx,dy] of DIRS)terrain(s,{x:c.x+dx,y:c.y+dy},k,variant)}
function corners(s:GameState,c:Point,k:Tile['kind'],variant=2){for(const [dx,dy] of [[-2,-2],[2,-2],[-2,2],[2,2]] as const)terrain(s,{x:c.x+dx,y:c.y+dy},k,variant)}
function line(s:GameState,c:Point,k:Tile['kind'],horizontal=true){for(let i=-3;i<=3;i++)terrain(s,{x:c.x+(horizontal?i:0),y:c.y+(horizontal?0:i)},k,k==='steam'||k==='miasma'?3:2)}

function stage1(s:GameState,c:Point,rng:Rng){
  fixture(s,c,'pressure-console',true,0);line(s,c,'brine',rng.chance(.5));corners(s,c,'glass');
  fixture(s,{x:c.x-2,y:c.y},'barrel',true,1);fixture(s,{x:c.x+2,y:c.y},'sealed-cache',true,0);
  spawn(s,c,'brine-warden','setpiece-warden','salt-abbot',7);spawn(s,c,'distiller-rat','setpiece-rat');drop(s,c,'frost-salts','setpiece-frost');
}
function stage2(s:GameState,c:Point,rng:Rng){
  fixture(s,c,'scent-burner',true,0);cross(s,c,'miasma',3);corners(s,c,'sludge');
  fixture(s,{x:c.x-2,y:c.y},'sealed-urn',true,0);fixture(s,{x:c.x+2,y:c.y},'field-kit',true,0);
  spawn(s,c,'miasma-moth','setpiece-moth','embalmer',5);spawn(s,c,'homunculus','setpiece-hom');drop(s,c,rng.chance(.5)?'neutralizer':'smoke-ampoule','setpiece-cleaner');
}
function stage3(s:GameState,c:Point,rng:Rng){
  fixture(s,c,'glass-organ',true,0);line(s,c,'oil',rng.chance(.5));corners(s,c,'embers',4);
  fixture(s,{x:c.x-2,y:c.y},'furnace',true,0);fixture(s,{x:c.x+2,y:c.y},'crucible',true,0);
  spawn(s,c,'soot-sprite','setpiece-heart','furnace-heart',8);spawn(s,c,'gutter-alchemist','setpiece-alch');drop(s,c,'amber-elixir','setpiece-amber');
}
function stage4(s:GameState,c:Point,rng:Rng){
  fixture(s,c,'observation-desk',true,0);cross(s,c,'crystal');corners(s,c,'glass');
  fixture(s,{x:c.x-2,y:c.y},'silver-mirror',true,0);fixture(s,{x:c.x+2,y:c.y},'resonator',true,0);
  spawn(s,c,'glass-sentinel','setpiece-mirror','mirror-hunter',10);spawn(s,c,'miasma-moth','setpiece-moth4');drop(s,c,rng.chance(.5)?'solvent':'black-catalyst','setpiece-glass-tool');
}
function stage5(s:GameState,c:Point,rng:Rng){
  fixture(s,c,'resonator',true,0);cross(s,c,'rune');line(s,c,rng.chance(.5)?'embers':'acid',false);
  fixture(s,{x:c.x-2,y:c.y},'relic-pedestal',true,0);fixture(s,{x:c.x+2,y:c.y},'sealed-urn',true,0);
  spawn(s,c,'crucible-knight','setpiece-executor','brass-executor',16);spawn(s,c,'vapor-hound','setpiece-hound',undefined,4);drop(s,c,RARE[rng.int(0,RARE.length-1)]!,'setpiece-final-reward');
}

export function applyDistrictSetpiece(s:GameState){
  const key=`setpiece-${s.districtStage}`;s.expansionFlags??=[];if(s.expansionFlags.includes(key))return;
  const rng=new Rng((s.seed^Math.imul(s.districtStage,0x27d4eb2d)^0x9e3779b9)>>>0),c=choose(s,rng);if(!c)return;
  if(s.districtStage===1)stage1(s,c,rng);else if(s.districtStage===2)stage2(s,c,rng);else if(s.districtStage===3)stage3(s,c,rng);else if(s.districtStage===4)stage4(s,c,rng);else stage5(s,c,rng);
  s.expansionFlags.push(key);updateVisibility(s);
}

export function setpieceSignature(s:GameState){
  const elites=s.enemies.filter(e=>e.id.startsWith('setpiece-')&&e.elite).map(e=>e.elite).sort();
  const fixtures=s.tiles.filter(t=>['pressure-console','scent-burner','glass-organ','observation-desk','resonator'].includes(t.fixture??'')).map(t=>t.fixture).sort();
  return `${fixtures.join(',')}|${elites.join(',')}`;
}
