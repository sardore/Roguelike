import type { EnemyKind, ItemKind, TowerState, Unit } from './tower';

export type FeatureKind='door'|'secret-door'|'trap'|'fountain'|'altar'|'boulder'|'pit'|'chest'|'merchant'|'engraving'|'gold';
export type IntrinsicKind='fire-resist'|'acid-resist'|'shock-resist'|'keen-sense'|'regeneration';
export interface DungeonFeature{
  id:string;kind:FeatureKind;x:number;y:number;revealed:boolean;open?:boolean;locked?:boolean;spent?:boolean;
  stock?:ItemKind[];price?:number;uses?:number;note?:string;
}
export interface Corpse{x:number;y:number;kind:EnemyKind;age:number}
export interface RogueStatus{nutrition:number;maxNutrition:number;foodState:'SATIATED'|'OK'|'HUNGRY'|'WEAK'|'STARVING';gold:number;piety:number;intrinsics:Partial<Record<IntrinsicKind,number>>}
export interface SystemMoveResult{flow:'continue'|'spent'|'blocked';message?:string}

interface Meta{
  nutrition:number;maxNutrition:number;gold:number;piety:number;prayerCooldown:number;
  intrinsics:Partial<Record<IntrinsicKind,number>>;
  features:DungeonFeature[];corpses:Corpse[];
  lastFloor:number;lastTurn:number;lastEnemies:Unit[];lastX:number;lastY:number;lastBag:ItemKind[];
  warnedFood:string;
}

const META=new WeakMap<TowerState,Meta>();
const D4=[[1,0],[-1,0],[0,1],[0,-1]] as const;

function hashMix(seed:number,...values:number[]){let h=(seed^0x9e3779b9)>>>0;for(const v of values){h^=Math.imul(v+0x7ed55d16,0x85ebca6b);h=Math.imul(h^(h>>>16),0xc2b2ae35)>>>0}return h>>>0}
function rand(seed:number){let x=seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}
function roll(s:TowerState,salt:number){return rand(hashMix(s.seed,s.floor,s.turn,salt))}
function meta(s:TowerState){let m=META.get(s);if(!m){m=makeMeta(s);META.set(s,m)}return m}
function makeMeta(s:TowerState):Meta{return{nutrition:820,maxNutrition:1000,gold:18,piety:0,prayerCooldown:0,intrinsics:{},features:[],corpses:[],lastFloor:s.floor,lastTurn:s.turn,lastEnemies:[...s.enemies],lastX:s.hero.x,lastY:s.hero.y,lastBag:[...s.hero.bag],warnedFood:'OK'}}
function at(s:TowerState,x:number,y:number){return s.tiles[y*s.w+x]}
function inside(s:TowerState,x:number,y:number){return x>0&&y>0&&x<s.w-1&&y<s.h-1}
function walkable(s:TowerState,x:number,y:number){const t=at(s,x,y);return !!t&&!['void','wall','chasm','books','pillar'].includes(t.kind)}
function blockedByEnemy(s:TowerState,x:number,y:number){return s.enemies.some(e=>e.x===x&&e.y===y)}
function featureAt(s:TowerState,x:number,y:number,k?:FeatureKind){return meta(s).features.find(f=>f.x===x&&f.y===y&&(!k||f.kind===k))}
function log(s:TowerState,msg:string){s.messages.push(msg);if(s.messages.length>7)s.messages.shift()}
export function systemMessage(s:TowerState,msg:string){log(s,msg)}

function candidateCells(s:TowerState,minHero=4){const out:Array<{x:number;y:number}>=[];for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++){const t=at(s,x,y);if(!t||!walkable(s,x,y)||t.kind==='stairs'||t.kind==='door')continue;if(Math.abs(x-s.hero.x)+Math.abs(y-s.hero.y)<minHero)continue;if(blockedByEnemy(s,x,y))continue;out.push({x,y})}return out}
function pickCell(s:TowerState,cells:Array<{x:number;y:number}>,salt:number){if(!cells.length)return undefined;const i=Math.min(cells.length-1,Math.floor(roll(s,salt)*cells.length));return cells.splice(i,1)[0]}
function id(s:TowerState,k:string,n:number){return`${s.floor}:${k}:${n}:${hashMix(s.seed,s.floor,n)}`}
function addFeature(s:TowerState,f:DungeonFeature){meta(s).features.push(f)}

function placeClosedDoors(s:TowerState){let n=0;for(let y=1;y<s.h-1;y++)for(let x=1;x<s.w-1;x++){const t=at(s,x,y);if(t?.kind!=='door')continue;const r=roll(s,1000+x*31+y*17);if(r<.72)addFeature(s,{id:id(s,'door',n++),kind:'door',x,y,revealed:true,open:false,locked:r<.23})}}
function placeSecretDoors(s:TowerState){let n=0;const candidates:Array<{x:number;y:number}>=[];for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++){const t=at(s,x,y);if(t?.kind!=='wall')continue;const lr=walkable(s,x-1,y)&&walkable(s,x+1,y),ud=walkable(s,x,y-1)&&walkable(s,x,y+1);if(lr||ud)candidates.push({x,y})}const count=Math.min(candidates.length,1+(s.floor%3===0?1:0));for(let i=0;i<count;i++){const p=pickCell(s,candidates,2100+i*13);if(!p)break;addFeature(s,{id:id(s,'secret',n++),kind:'secret-door',x:p.x,y:p.y,revealed:false,open:false,locked:roll(s,2150+i)<.35})}}
function placeGeneralFeatures(s:TowerState){const cells=candidateCells(s,5);let n=0;const add=(kind:FeatureKind,salt:number,extra:Partial<DungeonFeature>={})=>{const p=pickCell(s,cells,salt);if(p)addFeature(s,{id:id(s,kind,n++),kind,x:p.x,y:p.y,revealed:kind!=='trap',...extra})};
  add('trap',3001);add('trap',3002);if(s.floor>=5)add('trap',3003);
  if(s.floor%2===1)add('fountain',3010,{uses:0});
  if(s.floor%4===2||s.floor%4===3)add('altar',3020,{uses:0});
  add('chest',3030,{spent:false});
  if([2,6,10,14,18].includes(s.floor)){const pools:ItemKind[][]=[['potion','ration'],['knife','smoke'],['ward','bomb'],['potion','ward'],['bomb','smoke']];const stock=pools[Math.min(pools.length-1,Math.floor((s.floor-2)/4))]??['potion'];add('merchant',3040,{stock:[...stock],price:14+Math.floor(s.floor*.8)})}
  if(s.floor%3===0)add('engraving',3050,{note:engravingText(s.floor)});
  add('gold',3060,{uses:5+Math.floor(roll(s,3061)*13)});
  if(s.floor>=3){add('pit',3070);add('boulder',3071)}
}
function engravingText(floor:number){const texts=['THE FIRST KING ASCENDED ALONE.','DOORS REMEMBER WHO KICKED THEM.','THE GARDEN EATS WHAT THE KITCHEN THROWS AWAY.','NOT EVERY WALL WAS BUILT TO REMAIN A WALL.','WHEN THE BELLS STOP, SEARCH.'];return texts[floor%texts.length]??'THE STONE HAS BEEN SCRATCHED CLEAN.'}

export function initNethackRun(s:TowerState){META.set(s,makeMeta(s));populateNethackFloor(s);snapshot(s)}
export function populateNethackFloor(s:TowerState){const m=meta(s);m.features=[];m.corpses=[];placeClosedDoors(s);placeSecretDoors(s);placeGeneralFeatures(s);m.lastFloor=s.floor;m.lastX=s.hero.x;m.lastY=s.hero.y;m.lastEnemies=[...s.enemies]}

function foodState(m:Meta):RogueStatus['foodState']{if(m.nutrition>850)return'SATIATED';if(m.nutrition>420)return'OK';if(m.nutrition>190)return'HUNGRY';if(m.nutrition>0)return'WEAK';return'STARVING'}
export function getRogueStatus(s:TowerState):RogueStatus{const m=meta(s);return{nutrition:m.nutrition,maxNutrition:m.maxNutrition,foodState:foodState(m),gold:m.gold,piety:m.piety,intrinsics:{...m.intrinsics}}}
export function visibleSystemObjects(s:TowerState){const m=meta(s);const features=m.features.filter(f=>{if(!f.revealed)return false;const t=at(s,f.x,f.y);return !!t?.visible&&!f.spent});const corpses=m.corpses.filter(c=>at(s,c.x,c.y)?.visible);return{features,corpses}}
export function systemBlocksPath(s:TowerState,x:number,y:number){const f=featureAt(s,x,y);return !!f&&(f.kind==='boulder'||(f.kind==='door'&&!f.open));}

function canPushTo(s:TowerState,x:number,y:number){if(!inside(s,x,y)||!walkable(s,x,y)||blockedByEnemy(s,x,y))return false;const f=featureAt(s,x,y);return !f||f.kind==='pit'}
export function preMoveSystem(s:TowerState,x:number,y:number,dx:number,dy:number):SystemMoveResult{
  const m=meta(s),f=featureAt(s,x,y);if(!f)return{flow:'continue'};
  if(f.kind==='door'&&!f.open){if(f.locked)return{flow:'spent',message:'The door is locked. Use ACT to force or pick it.'};f.open=true;return{flow:'spent',message:'You open the door.'}}
  if(f.kind==='boulder'){
    const nx=x+dx,ny=y+dy;if(!canPushTo(s,nx,ny))return{flow:'spent',message:'The boulder will not move.'};const pit=featureAt(s,nx,ny,'pit');if(pit){m.features=m.features.filter(q=>q!==f&&q!==pit);return{flow:'continue',message:'The boulder crashes into the pit and plugs it.'}}f.x=nx;f.y=ny;return{flow:'continue',message:'You shoulder the boulder forward.'}
  }
  return{flow:'continue'}
}

export function searchSystem(s:TowerState){const m=meta(s);let found=0;for(const f of m.features){if(f.revealed)continue;const d=Math.abs(f.x-s.hero.x)+Math.abs(f.y-s.hero.y);if(d>2)continue;const bonus=s.hero.cls==='ranger'?.28:.08;if(roll(s,4100+f.x*17+f.y*29)<.46+bonus){f.revealed=true;found++;if(f.kind==='secret-door'){const t=at(s,f.x,f.y);if(t){t.kind='door';t.seen=true}f.kind='door'}}}
  if(found)return`You search carefully and uncover ${found} hidden ${found===1?'thing':'things'}.`;
  return'You search the nearby stonework. Nothing gives itself away.'
}

function forceDoor(s:TowerState,f:DungeonFeature){const chance=s.hero.cls==='vanguard'?.82:s.hero.cls==='ranger'?.68:.58;const r=roll(s,4300+f.x*11+f.y*7);if(r<chance){f.locked=false;f.open=true;if(s.hero.cls==='vanguard')return'You kick the lock apart.';if(s.hero.cls==='ranger')return'You work the lock until the bolt slips.';return'A pulse of force knocks the latch free.'}return'The lock holds.'}
function eatCorpse(s:TowerState,c:Corpse){const m=meta(s);m.corpses=m.corpses.filter(q=>q!==c);const stale=c.age>26;const nutrition=c.kind==='rat'?90:c.kind==='hound'?150:c.kind==='slime'?120:c.kind==='wisp'?70:c.kind==='boss'?260:180;m.nutrition=Math.min(m.maxNutrition,m.nutrition+(stale?Math.floor(nutrition*.45):nutrition));if(stale){s.hero.hp=Math.max(1,s.hero.hp-3);return`The ${corpseName(c.kind)} is rank. You keep it down, barely.`}if(c.kind==='slime'){grantIntrinsic(m,'acid-resist',70);return'You eat the strange remains. Your skin tingles with acid resistance.'}if(c.kind==='wisp'){grantIntrinsic(m,'shock-resist',80);return'Cold light settles behind your eyes. You feel insulated from shock.'}if(c.kind==='hound'){grantIntrinsic(m,'keen-sense',90);return'You eat the hound meat. Every scrape in the dark sounds closer now.'}if(c.kind==='cultist'||c.kind==='seer'){grantIntrinsic(m,'regeneration',55);return'You eat the uncanny flesh. Wounds begin knitting with a faint ache.'}return`You eat the ${corpseName(c.kind)} and feel less hollow.`}
function corpseName(k:EnemyKind){return k==='rat'?'rat corpse':k==='hound'?'hound corpse':k==='slime'?'slime mass':k==='wisp'?'wisp residue':k==='cultist'?'curator corpse':k==='seer'?'seer corpse':k==='boss'?'guardian remains':`${k} corpse`}
function grantIntrinsic(m:Meta,k:IntrinsicKind,turns:number){m.intrinsics[k]=(m.intrinsics[k]??0)+turns}
function fountainAction(s:TowerState,f:DungeonFeature){f.uses=(f.uses??0)+1;const r=roll(s,4400+(f.uses??0)*19+f.x);if((f.uses??0)>=3)f.spent=true;if(r<.45){s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+7);return'You drink from the fountain. The water closes small wounds.'}if(r<.72){meta(s).nutrition=Math.min(meta(s).maxNutrition,meta(s).nutrition+110);return'The fountain water is metallic but filling.'}if(r<.88){grantIntrinsic(meta(s),'keen-sense',35);return'The water tastes like rain on stone. Hidden edges seem sharper.'}s.hero.hp=Math.max(1,s.hero.hp-4);return'The fountain is fouled. Your stomach twists.'}
function altarAction(s:TowerState,f:DungeonFeature){const m=meta(s);if(m.prayerCooldown>0){m.piety=Math.max(-3,m.piety-1);s.hero.guard=0;s.hero.hp=Math.max(1,s.hero.hp-3);return'The altar answers your impatience with a cold rebuke.'}m.prayerCooldown=55;m.piety=Math.min(5,m.piety+1);f.uses=(f.uses??0)+1;const hungry=m.nutrition<260;if(hungry)m.nutrition=Math.min(m.maxNutrition,m.nutrition+260);s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+8);s.hero.guard=Math.min(7,s.hero.guard+2);return hungry?'You pray. The ache of hunger recedes and your wounds ease.':'You pray. For a moment, the tower feels less hostile.'}
function chestAction(s:TowerState,f:DungeonFeature){if(f.spent)return'The chest is empty.';f.spent=true;const m=meta(s),r=roll(s,4500+f.x*7+f.y*13);if(r<.16){s.hero.hp=Math.max(1,s.hero.hp-4);m.gold+=8;return'A needle trap snaps from the chest. Beneath it: 8 gold.'}const pool:ItemKind[]=['potion','ration','ward','smoke','knife','bomb'];const item=pool[Math.min(pool.length-1,Math.floor(roll(s,4501+f.x)*pool.length))]??'ration';s.hero.bag.push(item);m.gold+=4+Math.floor(roll(s,4502+f.y)*8);return`The chest yields ${itemLabel(item)} and a handful of old coin.`}
function merchantAction(s:TowerState,f:DungeonFeature){const m=meta(s),stock=f.stock??[];if(!stock.length)return'The merchant has packed away the last useful thing.';const item=stock[0]!;const price=(f.price??16)+(item==='bomb'||item==='ward'?4:0);if(m.gold<price)return`The merchant taps ${price}g into the dust. You only have ${m.gold}g.`;m.gold-=price;s.hero.bag.push(item);stock.shift();f.stock=stock;return`You buy ${itemLabel(item)} for ${price}g.`}
function itemLabel(k:ItemKind){return k==='potion'?'a red draught':k==='bomb'?'a cinder bomb':k==='ration'?'a field ration':k==='ward'?'a stone ward':k==='smoke'?'a smoke phial':'a throwing knife'}

export function contextSystem(s:TowerState){const m=meta(s);const corpse=m.corpses.find(c=>c.x===s.hero.x&&c.y===s.hero.y);if(corpse)return eatCorpse(s,corpse);const here=featureAt(s,s.hero.x,s.hero.y);if(here){if(here.kind==='fountain')return fountainAction(s,here);if(here.kind==='altar')return altarAction(s,here);if(here.kind==='chest')return chestAction(s,here);if(here.kind==='merchant')return merchantAction(s,here);if(here.kind==='engraving'){here.spent=true;return`The engraving reads: “${here.note??'...'}”`}if(here.kind==='gold'){m.gold+=here.uses??6;here.spent=true;return`You gather ${here.uses??6} old gold coins.`}if(here.kind==='pit')return'You peer into the pit. A boulder could make this route safe.'}
  for(const[dx,dy]of D4){const f=featureAt(s,s.hero.x+dx,s.hero.y+dy,'door');if(f&&f.locked&&!f.open)return forceDoor(s,f)}return'There is nothing here that needs your hands.'
}

function removedItem(before:ItemKind[],after:ItemKind[]){const counts=new Map<ItemKind,number>();for(const k of after)counts.set(k,(counts.get(k)??0)+1);for(const k of before){const n=counts.get(k)??0;if(n>0)counts.set(k,n-1);else return k}return undefined}
function snapshot(s:TowerState){const m=meta(s);m.lastFloor=s.floor;m.lastTurn=s.turn;m.lastEnemies=[...s.enemies];m.lastX=s.hero.x;m.lastY=s.hero.y;m.lastBag=[...s.hero.bag]}
function awardKill(s:TowerState,e:Unit){const m=meta(s);const chance=e.kind==='rat'?.2:e.kind==='boss'?1:.52;if(roll(s,5000+e.x*19+e.y*23)<chance)m.gold+=e.kind==='boss'?22:2+Math.floor(roll(s,5001+e.x)*7);if(e.kind!=='wisp'&&roll(s,5002+e.y)<.78)m.corpses.push({x:e.x,y:e.y,kind:e.kind,age:0})}
function tickFood(s:TowerState,turns:number){const m=meta(s);if(turns<=0)return;m.nutrition-=turns*3;for(const c of m.corpses)c.age+=turns;if(m.prayerCooldown>0)m.prayerCooldown=Math.max(0,m.prayerCooldown-turns);for(const k of Object.keys(m.intrinsics) as IntrinsicKind[]){const v=m.intrinsics[k]??0;m.intrinsics[k]=Math.max(0,v-turns);if((m.intrinsics[k]??0)<=0)delete m.intrinsics[k]}
  if((m.intrinsics['regeneration']??0)>0&&s.turn%5===0)s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+1);
  const st=foodState(m);if(st!==m.warnedFood){m.warnedFood=st;if(st==='HUNGRY')log(s,'You are getting hungry.');else if(st==='WEAK')log(s,'Hunger is making your hands unsteady.');else if(st==='STARVING')log(s,'You are starving.')}if(st==='STARVING'){s.hero.hp-=Math.max(1,turns);if(s.hero.hp<=0){s.hero.hp=0;s.dead=true;log(s,'You collapse from starvation.')}}}
function enteredFeature(s:TowerState){const m=meta(s),f=featureAt(s,s.hero.x,s.hero.y);if(!f)return;if(f.kind==='trap'){f.revealed=true;const d=3+Math.floor(roll(s,5200+f.x*3+f.y)*4);s.hero.guard=0;s.hero.hp-=d;log(s,`A hidden floor trap snaps shut for ${d}. SEARCH can reveal these before you step on them.`);if(s.hero.hp<=0){s.hero.hp=0;s.dead=true}}else if(f.kind==='pit'){s.hero.hp=Math.max(1,s.hero.hp-3);log(s,'You stumble into a shallow pit. A boulder could plug it.')}else if(f.kind==='fountain')log(s,'Water murmurs here. ACT to drink.');else if(f.kind==='altar')log(s,'An old altar waits in the dust. ACT to pray.');else if(f.kind==='chest'&&!f.spent)log(s,'A travel chest sits here. ACT to open it.');else if(f.kind==='merchant')log(s,'A silent merchant watches you. ACT to trade.');else if(f.kind==='engraving'&&!f.spent)log(s,'Something is engraved underfoot. ACT to read it.');else if(f.kind==='gold'&&!f.spent)log(s,'Old coin glints under the dust. ACT to gather it.')}
export function syncNethack(s:TowerState){const m=meta(s);if(s.floor!==m.lastFloor){populateNethackFloor(s);m.lastTurn=s.turn;m.lastBag=[...s.hero.bag];snapshot(s);return}
  const current=new Set(s.enemies);for(const e of m.lastEnemies)if(!current.has(e))awardKill(s,e);
  const used=removedItem(m.lastBag,s.hero.bag);if(used==='ration')m.nutrition=Math.min(m.maxNutrition,m.nutrition+260);
  const delta=Math.max(0,s.turn-m.lastTurn);tickFood(s,delta);
  if(s.hero.x!==m.lastX||s.hero.y!==m.lastY)enteredFeature(s);
  snapshot(s)
}

export function hasIntrinsic(s:TowerState,k:IntrinsicKind){return(meta(s).intrinsics[k]??0)>0}
export function debugFeatureCounts(s:TowerState){const m=meta(s);return m.features.reduce<Record<string,number>>((a,f)=>{a[f.kind]=(a[f.kind]??0)+1;return a},{})}
