import { ENEMIES } from './content';
import { Rng } from './rng';
import { move as spendTurn, push } from './systems';
import type { EliteKind, Enemy, EnemyKind, GameState, ItemKind, Point, Tile } from './types';
import { at, updateVisibility } from './world';

const DIRS=[[1,0],[-1,0],[0,1],[0,-1]] as const;
const RARE:ItemKind[]=['amber-elixir','black-catalyst','frost-salts','solvent','neutralizer','smoke-ampoule'];
const ELITE_LABELS:Record<EliteKind,string>={
  'acid-seer':'Acid Seer','mirror-hunter':'Mirror Hunter','furnace-heart':'Furnace Heart',
  embalmer:'Preservation Embalmer','brass-executor':'Brass Executor','salt-abbot':'Salt Abbot'
};
export const eliteName=(e:Enemy)=>e.elite?ELITE_LABELS[e.elite]:undefined;

function d(a:Point,b:Point){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function clear(s:GameState,p:Point){const t=at(s,p);return !!t&&t.kind==='floor'&&!t.fixture&&!t.blocks&&!s.enemies.some(e=>e.x===p.x&&e.y===p.y)&&!s.items.some(i=>i.x===p.x&&i.y===p.y)&&!(s.player.x===p.x&&s.player.y===p.y)}
function fixture(s:GameState,p:Point,k:NonNullable<Tile['fixture']>,blocks=true,state=0){const t=at(s,p);if(!t||t.kind==='wall'||t.fixture)return false;t.fixture=k;t.blocks=blocks;t.state=state;return true}
function terrain(s:GameState,p:Point,k:Tile['kind'],variant=2){const t=at(s,p);if(!t||t.kind==='wall'||t.fixture||t.kind==='stairs')return false;t.kind=k;t.variant=variant;return true}
function ring(s:GameState,c:Point,k:Tile['kind']){for(const [dx,dy] of DIRS)terrain(s,{x:c.x+dx,y:c.y+dy},k,k==='steam'||k==='miasma'?3:2)}
function drop(s:GameState,c:Point,kind:ItemKind,id:string){for(let r=1;r<=3;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)+Math.abs(dy)!==r)continue;const p={x:c.x+dx,y:c.y+dy};if(clear(s,p)){s.items.push({id,kind,x:p.x,y:p.y});return}}}
function spawn(s:GameState,c:Point,kind:EnemyKind,id:string,elite?:EliteKind){for(let r=1;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)+Math.abs(dy)!==r)continue;const p={x:c.x+dx,y:c.y+dy};if(!clear(s,p))continue;const bonus=elite?(elite==='brass-executor'?12:elite==='mirror-hunter'?7:5):0;s.enemies.push({id,kind,x:p.x,y:p.y,hp:ENEMIES[kind].hp+bonus,cooldown:1,elite});return}}
function stairPoint(s:GameState){const i=s.tiles.findIndex(t=>t.kind==='stairs');return i<0?undefined:{x:i%s.width,y:Math.floor(i/s.width)}}
function centerCandidates(s:GameState){const stair=stairPoint(s),out:Point[]=[];for(let y=2;y<s.height-2;y++)for(let x=2;x<s.width-2;x++){const p={x,y},t=at(s,p);if(!clear(s,p)||d(p,s.player)<8||stair&&d(p,stair)<5)continue;const room=t?.room??'';if(room.includes('passage')||room.includes('alley')||room.includes('row')||room.includes('bazaar')||room.includes('ward')||room.includes('catacombs')||room.includes('alembic'))continue;let open=0;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)if(at(s,{x:x+xx,y:y+yy})?.kind!=='wall')open++;if(open>=8)out.push(p)}return out}
function chooseCenters(s:GameState,rng:Rng,count=2){const pool=centerCandidates(s),out:Point[]=[];while(pool.length&&out.length<count){const i=rng.int(0,pool.length-1),p=pool.splice(i,1)[0]!;if(out.every(q=>d(p,q)>=9))out.push(p)}return out}
function mark(s:GameState,key:string){s.expansionFlags??=[];if(!s.expansionFlags.includes(key))s.expansionFlags.push(key)}

function relicAlcove(s:GameState,c:Point,rng:Rng){fixture(s,c,'relic-pedestal',true,0);ring(s,c,'rune');drop(s,c,RARE[rng.int(0,RARE.length-1)]!,`relic-gift-${s.districtStage}`);spawn(s,c,s.districtStage>=4?'glass-sentinel':'brine-warden',`relic-guard-${s.districtStage}`,s.districtStage>=4?'mirror-hunter':'salt-abbot')}
function pressureAnnex(s:GameState,c:Point,rng:Rng){fixture(s,c,'pressure-console',true,0);for(const [dx,dy] of DIRS)terrain(s,{x:c.x+dx,y:c.y+dy},rng.chance(.5)?'steam':'brine',3);drop(s,c,'frost-salts',`pressure-salts-${s.districtStage}`);spawn(s,c,'vapor-hound',`pressure-hound-${s.districtStage}`)}
function preservationBay(s:GameState,c:Point,rng:Rng){fixture(s,c,'scent-burner',true,0);ring(s,c,'miasma');drop(s,c,'neutralizer',`bay-neutralizer-${s.districtStage}`);spawn(s,c,'miasma-moth',`bay-moth-${s.districtStage}`,'embalmer');if(rng.chance(.5))fixture(s,{x:c.x+1,y:c.y+1},'sealed-urn',true,0)}
function fieldStation(s:GameState,c:Point,rng:Rng){fixture(s,c,'field-kit',true,0);for(const [dx,dy] of DIRS)terrain(s,{x:c.x+dx,y:c.y+dy},rng.chance(.5)?'glass':'brine',2);drop(s,c,'blue-tonic',`field-tonic-${s.districtStage}`);spawn(s,c,'distiller-rat',`field-rat-${s.districtStage}`)}
function resonantGallery(s:GameState,c:Point,rng:Rng){fixture(s,c,'glass-organ',true,0);for(const [dx,dy] of DIRS)terrain(s,{x:c.x+dx,y:c.y+dy},rng.chance(.65)?'crystal':'glass',2);drop(s,c,'solvent',`gallery-solvent-${s.districtStage}`);spawn(s,c,'glass-sentinel',`gallery-sentinel-${s.districtStage}`,'mirror-hunter')}
function hoistShaft(s:GameState,c:Point,rng:Rng){fixture(s,c,'chain-hoist',true,0);fixture(s,{x:c.x+1,y:c.y},rng.chance(.5)?'rubble':'boards',true,0);terrain(s,{x:c.x-1,y:c.y},rng.chance(.5)?'oil':'sludge',2);drop(s,c,'smoke-ampoule',`hoist-smoke-${s.districtStage}`);spawn(s,c,'soot-sprite',`hoist-soot-${s.districtStage}`,'furnace-heart')}
function observerCell(s:GameState,c:Point,rng:Rng){fixture(s,c,'observation-desk',true,0);fixture(s,{x:c.x+1,y:c.y},'silver-mirror',true,0);ring(s,c,rng.chance(.5)?'rune':'glass');drop(s,c,'chalk',`observer-chalk-${s.districtStage}`);spawn(s,c,'gutter-alchemist',`observer-alch-${s.districtStage}`,'acid-seer')}
function reagentVault(s:GameState,c:Point,rng:Rng){fixture(s,c,'resonator',true,0);fixture(s,{x:c.x-1,y:c.y},'sealed-urn',true,0);for(const [dx,dy] of DIRS)terrain(s,{x:c.x+dx,y:c.y+dy},rng.chance(.5)?'acid':'crystal',2);drop(s,c,'black-catalyst',`vault-black-${s.districtStage}`);spawn(s,c,s.districtStage===5?'crucible-knight':'retort-leech',`vault-elite-${s.districtStage}`,s.districtStage===5?'brass-executor':'acid-seer')}
const TEMPLATES=[relicAlcove,pressureAnnex,preservationBay,fieldStation,resonantGallery,hoistShaft,observerCell,reagentVault] as const;

export function applyExpansionContent(s:GameState){
  if(s.expansionFlags?.includes(`decorated-${s.districtStage}`))return;
  const rng=new Rng((s.seed^Math.imul(s.districtStage,0x51f15e5d)^0x7f4a7c15)>>>0);
  const centers=chooseCenters(s,rng,s.districtStage>=4?3:2);
  centers.forEach((c,i)=>TEMPLATES[(rng.int(0,TEMPLATES.length-1)+s.districtStage+i)%TEMPLATES.length]!(s,c,rng));
  // One roaming elite per floor turns familiar base monsters into a new tactical problem without palette spam.
  const elitePool:ReadonlyArray<[EnemyKind,EliteKind]>=s.districtStage===1?
    [['gutter-alchemist','acid-seer'],['brine-warden','salt-abbot']]:s.districtStage===2?
    [['miasma-moth','embalmer'],['glass-sentinel','mirror-hunter']]:s.districtStage===3?
    [['soot-sprite','furnace-heart'],['gutter-alchemist','acid-seer']]:s.districtStage===4?
    [['glass-sentinel','mirror-hunter'],['miasma-moth','embalmer']]:
    [['crucible-knight','brass-executor'],['brine-warden','salt-abbot']];
  const roaming=chooseCenters(s,rng,1)[0];if(roaming){const pick=elitePool[rng.int(0,elitePool.length-1)]!;spawn(s,roaming,pick[0],`roaming-elite-${s.districtStage}`,pick[1])}
  mark(s,`decorated-${s.districtStage}`);updateVisibility(s);
}

function spend(s:GameState){const before=s.messages.length;spendTurn(s,0,0);if(s.messages.length>before&&s.messages[s.messages.length-1]?.text==='Picked up .')s.messages.pop()}
function within(s:GameState,c:Point,r=4){const out:Array<{p:Point,t:Tile}>=[];for(let y=Math.max(0,c.y-r);y<=Math.min(s.height-1,c.y+r);y++)for(let x=Math.max(0,c.x-r);x<=Math.min(s.width-1,c.x+r);x++){const p={x,y},t=at(s,p);if(t&&d(c,p)<=r)out.push({p,t})}return out}
function randomReward(s:GameState,p:Point){const rng=new Rng((s.seed^s.turn^Math.imul(p.x+1,31337)^Math.imul(p.y+1,7919))>>>0);return RARE[rng.int(0,RARE.length-1)]!}

export function handleExpansionInteract(s:GameState,p:Point){
  if(s.over||d(s.player,p)!==1)return false;const t=at(s,p);if(!t?.fixture)return false;let handled=true;
  if(t.fixture==='relic-pedestal'){
    if((t.state??0)>0){push(s,'The pedestal is cold now.');return true}t.state=1;s.player.maxHp+=2;s.player.hp=Math.min(s.player.maxHp,s.player.hp+2);push(s,'A dull brass seal warms in your palm. Your pulse steadies permanently.','good');
  }else if(t.fixture==='pressure-console'){
    t.state=(t.state??0)?0:1;let changed=0;for(const {t:q} of within(s,p,5)){if(t.state&&q.kind==='steam'){q.kind='brine';q.variant=2;changed++}else if(!t.state&&q.kind==='brine'){q.kind='steam';q.variant=3;changed++}if(t.state&&q.fixture==='brass-gate'&&q.blocks){q.fixture=undefined;q.blocks=false;changed++}}push(s,changed?'Pressure routes through another set of pipes.':'The gauges move, but the room does not.','odd');
  }else if(t.fixture==='scent-burner'){
    if((t.state??0)>0){push(s,'Only bitter ash remains.');return true}t.state=1;s.player.statuses=s.player.statuses.filter(st=>st.id!=='marked');let cleared=0;for(const {t:q} of within(s,p,3))if(q.kind==='miasma'){q.kind='floor';q.variant=0;cleared++}push(s,cleared?'The burner eats the sweet chemical smell and your own trail with it.':'The burner strips the medicinal smell from your clothes.','good');
  }else if(t.fixture==='field-kit'){
    if((t.state??0)>0){push(s,'The field kit has been picked clean.');return true}t.state=1;s.player.hp=Math.min(s.player.maxHp,s.player.hp+5);s.player.statuses=s.player.statuses.filter(st=>st.id!=='bleeding'&&st.id!=='poisoned');push(s,'You spend the sealed bandages and the last clean ampoule.','good');
  }else if(t.fixture==='glass-organ'){
    if((t.state??0)>0){push(s,'The glass keys are already fractured.');return true}t.state=1;let broken=0;for(const {p:q,t:u} of within(s,p,4)){if(u.kind==='crystal'){u.kind='glass';u.variant=2;broken++}const e=s.enemies.find(e=>e.x===q.x&&e.y===q.y&&e.kind==='glass-sentinel');if(e)e.hp-=4}s.enemies=s.enemies.filter(e=>e.hp>0);s.noise.push({x:p.x,y:p.y});push(s,`The organ answers with one impossible chord. ${broken} crystal seams burst.`,'odd');
  }else if(t.fixture==='sealed-urn'){
    if((t.state??0)>0){push(s,'The urn is empty.');return true}t.state=1;const reward=randomReward(s,p);s.player.inventory.push(reward);for(const [dx,dy] of DIRS)terrain(s,{x:p.x+dx,y:p.y+dy},'miasma',3);push(s,'The urn gives up a preserved reagent. The preservative does not stay inside.','odd');
  }else if(t.fixture==='chain-hoist'){
    if((t.state??0)>0){push(s,'The chain has no more slack.');return true}t.state=1;let cleared=0;for(const {t:q} of within(s,p,3))if(q.fixture==='rubble'||q.fixture==='boards'||q.fixture==='cage'){q.fixture=undefined;q.blocks=false;cleared++}s.noise.push({x:p.x,y:p.y});push(s,cleared?'The hoist tears old obstructions out of the floor. The whole shaft hears it.':'The chain bangs uselessly against the ceiling.','odd');
  }else if(t.fixture==='observation-desk'){
    if((t.state??0)>0){push(s,'You already copied the useful marks.');return true}t.state=1;const stair=stairPoint(s);if(stair)for(let y=Math.max(0,stair.y-3);y<=Math.min(s.height-1,stair.y+3);y++)for(let x=Math.max(0,stair.x-3);x<=Math.min(s.width-1,stair.x+3);x++){const q=at(s,{x,y});if(q)q.discovered=true}push(s,'A route diagram marks the stair, but several corridors have been redrawn by hand.','good');
  }else if(t.fixture==='resonator'){
    t.state=(t.state??0)+1;let changed=0;for(const {t:q} of within(s,p,3)){if(q.kind==='rune'){q.kind='crystal';q.variant=2;changed++}else if(q.kind==='crystal'&&t.state%2===0){q.kind='glass';q.variant=2;changed++}}s.noise.push({x:p.x,y:p.y});for(const e of s.enemies)if(d(e,p)<=9)e.alert={x:p.x,y:p.y};push(s,changed?'The resonator changes the room before the note finishes.':'A clear note carries much farther than it should.','odd');
  }else handled=false;
  if(handled&&!s.over)spend(s);updateVisibility(s);return handled;
}

function canOccupy(s:GameState,p:Point,e:Enemy){const t=at(s,p);return !!t&&t.kind!=='wall'&&!t.blocks&&!(s.player.x===p.x&&s.player.y===p.y)&&!s.enemies.some(o=>o!==e&&o.x===p.x&&o.y===p.y)}
function seen(s:GameState,e:Enemy){return at(s,e)?.visible===true}
function elitePulse(s:GameState,e:Enemy){if(!e.elite||s.over)return;const player=s.player;
  if(e.elite==='acid-seer'&&s.turn%4===0&&d(e,player)<=7){for(const [dx,dy] of DIRS){const p={x:player.x+dx,y:player.y+dy};const t=at(s,p);if(t&&t.kind==='floor'){t.kind='acid';t.variant=2;break}}if(seen(s,e))push(s,'The Acid Seer stains an escape tile green.','bad')}
  else if(e.elite==='mirror-hunter'&&s.turn%5===0&&d(e,player)>=3&&d(e,player)<=9){const candidates:Point[]=[];for(let r=2;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)+Math.abs(dy)!==r)continue;const p={x:player.x+dx,y:player.y+dy};if(canOccupy(s,p,e))candidates.push(p)}candidates.sort((a,b)=>d(a,e)-d(b,e));const q=candidates[0];if(q){e.x=q.x;e.y=q.y;if(seen(s,e))push(s,'The Mirror Hunter is suddenly standing in the wrong reflection.','bad')}}
  else if(e.elite==='furnace-heart'&&s.turn%3===0){const t=at(s,e);if(t&&t.kind==='floor'){t.kind='embers';t.variant=4}for(const [dx,dy] of DIRS){const q=at(s,{x:e.x+dx,y:e.y+dy});if(q?.kind==='oil'){q.kind='fire';q.variant=4;break}}}
  else if(e.elite==='embalmer'&&s.turn%4===0){for(const [dx,dy] of DIRS){const q=at(s,{x:e.x+dx,y:e.y+dy});if(q?.kind==='floor'){q.kind='miasma';q.variant=3}}if(seen(s,e))push(s,'Preservative dust spreads around the Embalmer.','bad')}
  else if(e.elite==='brass-executor'&&s.turn%3===0&&d(e,player)<=6){for(const [dx,dy] of DIRS){const q=at(s,{x:e.x+dx,y:e.y+dy});if(q?.kind==='floor'){q.kind='embers';q.variant=3}}}
  else if(e.elite==='salt-abbot'&&s.turn%4===0){for(const [dx,dy] of DIRS){const q=at(s,{x:e.x+dx,y:e.y+dy});if(q&&(q.kind==='acid'||q.kind==='fire'||q.kind==='miasma')){q.kind='brine';q.variant=2}}}
}

export function runExpansionTick(s:GameState){if(s.over)return;for(const e of [...s.enemies])elitePulse(s,e);updateVisibility(s)}