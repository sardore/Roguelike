import { contextSystem, hasIntrinsic, hungerAttackPenalty, populateNethackFloor, preMoveSystem, searchSystem, syncNethack, systemBlocksPath, systemMessage, systemOpaque } from './nethack';

export type TileKind='void'|'floor'|'wall'|'door'|'stairs'|'water'|'grass'|'lava'|'books'|'gear'|'pillar'|'rubble'|'trap'|'chasm';
export type HeroClass='vanguard'|'ranger'|'arcanist';
export type ItemKind='potion'|'bomb'|'ration'|'ward'|'smoke'|'knife';
export type EnemyKind='rat'|'guard'|'archer'|'hound'|'slime'|'cultist'|'golem'|'wisp'|'knight'|'seer'|'boss';
export type IntentKind='charge'|'shot'|'curse'|'smash'|'starfire';

export interface Tile{kind:TileKind;seen:boolean;visible:boolean;variant:number}
export interface Unit{x:number;y:number;hp:number;maxHp:number;kind:EnemyKind;cooldown:number;elite?:boolean;armor?:number;intent?:IntentKind;intentX?:number;intentY?:number;bossBand?:number}
export interface Drop{x:number;y:number;kind:ItemKind}
export interface Hero{x:number;y:number;hp:number;maxHp:number;guard:number;power:number;cls:HeroClass;bag:ItemKind[];skillCooldown:number}
export interface TowerState{w:number;h:number;tiles:Tile[];hero:Hero;enemies:Unit[];drops:Drop[];floor:number;turn:number;seed:number;won:boolean;dead:boolean;messages:string[]}

const W=43,H=43;
const I=(x:number,y:number)=>y*W+x;
const D4=[[1,0],[-1,0],[0,1],[0,-1]] as const;
const inside=(x:number,y:number)=>x>0&&y>0&&x<W-1&&y<H-1;
class RNG{constructor(public s:number){}next(){let x=this.s|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.s=x|0;return(x>>>0)/4294967296}int(a:number,b:number){return a+Math.floor(this.next()*(b-a+1))}chance(p:number){return this.next()<p}pick<T>(a:readonly T[]):T{return a[Math.min(a.length-1,Math.floor(this.next()*a.length))]!}}
export function hash(text:string){let h=2166136261>>>0;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
export function bandFor(floor:number){return Math.min(5,Math.max(1,Math.ceil(floor/4)))}
export const BAND_NAMES=['','LOWER WARD','KNIGHTS’ QUARTERS','HANGING GARDENS','FORBIDDEN ARCHIVE','ASTRARIUM CROWN'];
export const FLOOR_NAMES=['','Gatehouse','Servants’ Hall','Old Kitchens','Warden’s Court','Armory','Training Hall','Chapel of Shields','Captain’s Keep','Root Gallery','Rain Court','Glasshouse','Verdant Throne','Scriptorium','Index Hall','Sealed Stacks','Curator’s Vault','Clock Gallery','Star Bridge','Observatory','First King’s Crown'];
export const SKILL_NAMES:Record<HeroClass,string>={vanguard:'SHIELD BASH',ranger:'LONGSHOT',arcanist:'ARC BOLT'};

function tile(kind:TileKind='void',variant=0):Tile{return{kind,variant,seen:false,visible:false}}
function set(s:TowerState,x:number,y:number,kind:TileKind,v=0){if(x>=0&&y>=0&&x<W&&y<H)s.tiles[I(x,y)]=tile(kind,v)}
function get(s:TowerState,x:number,y:number){return x>=0&&y>=0&&x<W&&y<H?s.tiles[I(x,y)]:undefined}
function carve(s:TowerState,x:number,y:number,kind:TileKind='floor',v=0){if(inside(x,y))set(s,x,y,kind,v)}
function rect(s:TowerState,x:number,y:number,w:number,h:number,kind:TileKind='floor',v=0){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)carve(s,xx,yy,kind,v)}
function ellipse(s:TowerState,cx:number,cy:number,rx:number,ry:number,kind:TileKind='floor',v=0){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const dx=(x-cx)/Math.max(1,rx),dy=(y-cy)/Math.max(1,ry);if(dx*dx+dy*dy<=1)carve(s,x,y,kind,v)}}
function corridor(s:TowerState,a:{x:number;y:number},b:{x:number;y:number},width=1){let x=a.x,y=a.y;const horizontalFirst=Math.abs(b.x-x)>Math.abs(b.y-y);const digX=()=>{while(x!==b.x){for(let k=-Math.floor(width/2);k<=Math.floor(width/2);k++)carve(s,x,y+k);x+=Math.sign(b.x-x)}};const digY=()=>{while(y!==b.y){for(let k=-Math.floor(width/2);k<=Math.floor(width/2);k++)carve(s,x+k,y);y+=Math.sign(b.y-y)}};if(horizontalFirst){digX();digY()}else{digY();digX()}carve(s,b.x,b.y)}
function wallify(s:TowerState){const copy=s.tiles.map(t=>t.kind);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(copy[I(x,y)]!=='void')continue;let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(copy[I(x+dx,y+dy)]!=='void'&&copy[I(x+dx,y+dy)]!=='wall')near=true;if(near)set(s,x,y,'wall',(x*7+y*11+s.floor)%8)}}
function floorCells(s:TowerState){const out:number[]=[];for(let i=0;i<s.tiles.length;i++)if(s.tiles[i]?.kind==='floor')out.push(i);return out}
function doorAtNarrowPoints(s:TowerState,r:RNG){for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){if(get(s,x,y)?.kind!=='floor'||!r.chance(.025))continue;const l=get(s,x-1,y)?.kind,rk=get(s,x+1,y)?.kind,u=get(s,x,y-1)?.kind,d=get(s,x,y+1)?.kind;const vertical=(l==='wall'||l==='void')&&(rk==='wall'||rk==='void')&&u!=='wall'&&u!=='void'&&d!=='wall'&&d!=='void';const horizontal=(u==='wall'||u==='void')&&(d==='wall'||d==='void')&&l!=='wall'&&l!=='void'&&rk!=='wall'&&rk!=='void';if(vertical||horizontal)set(s,x,y,'door',r.int(0,3))}}

function lowerWard(s:TowerState,r:RNG){
  const start={x:21+r.int(-2,2),y:37};ellipse(s,start.x,start.y,5,3);const gate={x:21,y:30};rect(s,15,27,13,7);corridor(s,start,gate,3);
  const left={x:10+r.int(-1,1),y:21},right={x:32+r.int(-1,1),y:21},mid={x:21+r.int(-2,2),y:18};rect(s,left.x-5,left.y-4,11,9);rect(s,right.x-5,right.y-4,11,9);ellipse(s,mid.x,mid.y,6,4);corridor(s,gate,left,2);corridor(s,gate,right,2);corridor(s,left,mid,1);corridor(s,right,mid,1);
  const top={x:21+r.int(-2,2),y:7};rect(s,15,4,13,7);corridor(s,mid,top,2);set(s,top.x,top.y,'stairs');
  for(const [x,y] of [[17,29],[25,29],[8,21],[12,21],[30,21],[34,21],[18,18],[24,18]] as const)if(get(s,x,y)?.kind==='floor')set(s,x,y,'pillar',r.int(0,3));
  if(s.floor===3){for(let x=17;x<=25;x+=2)if(get(s,x,12)?.kind==='floor')set(s,x,12,'rubble',r.int(0,3))}
  s.hero.x=start.x;s.hero.y=start.y;
}
function knights(s:TowerState,r:RNG){
  const start={x:21,y:37};rect(s,17,34,9,5);const court={x:21,y:24};rect(s,12,17,19,15);corridor(s,start,court,3);
  const west={x:7,y:23},east={x:35,y:23},chapel={x:21,y:9};rect(s,3,18,9,11);rect(s,31,18,9,11);ellipse(s,chapel.x,chapel.y,7,5);corridor(s,court,west,2);corridor(s,court,east,2);corridor(s,court,chapel,2);
  for(let y=19;y<=29;y+=5)for(const x of [14,28])if(get(s,x,y)?.kind==='floor')set(s,x,y,'pillar',1);
  for(let x=16;x<=26;x+=2)if(get(s,x,28)?.kind==='floor')set(s,x,28,'gear',r.int(0,3));set(s,chapel.x,chapel.y,'stairs');s.hero.x=start.x;s.hero.y=start.y;
}
function gardens(s:TowerState,r:RNG){
  const start={x:21,y:37};ellipse(s,start.x,start.y,5,3);const nodes=[{x:12,y:29,rx:6,ry:5},{x:30,y:27,rx:7,ry:5},{x:18,y:20,rx:8,ry:6},{x:31,y:14,rx:6,ry:5},{x:20,y:7,rx:7,ry:4}];let prev=start;for(const n of nodes){ellipse(s,n.x+r.int(-1,1),n.y+r.int(-1,1),n.rx,n.ry);corridor(s,prev,n,r.chance(.45)?2:1);prev=n}
  for(const i of floorCells(s)){const x=i%W,y=Math.floor(i/W),roll=r.next();if(roll<.13)set(s,x,y,'grass',r.int(0,3));else if(roll<.165)set(s,x,y,'water',r.int(0,3))}for(let n=0;n<14;n++){const i=r.pick(floorCells(s)),x=i%W,y=Math.floor(i/W);if(get(s,x,y)?.kind==='floor')set(s,x,y,'pillar',r.int(0,3))}set(s,nodes[nodes.length-1]!.x,nodes[nodes.length-1]!.y,'stairs');s.hero.x=start.x;s.hero.y=start.y;
}
function archive(s:TowerState,r:RNG){
  const start={x:21,y:37};rect(s,17,34,9,5);const hall={x:21,y:23};rect(s,6,14,31,18);corridor(s,start,hall,2);const top={x:21,y:6};rect(s,14,3,15,8);corridor(s,hall,top,2);
  for(let y=17;y<=29;y+=4)for(let x=9;x<=33;x++){if(x===20||x===21||x===22||x%7===0)continue;if(get(s,x,y)?.kind==='floor')set(s,x,y,'books',r.int(0,3))}for(const [x,y] of [[8,16],[34,16],[8,30],[34,30],[16,8],[26,8]] as const)if(get(s,x,y)?.kind==='floor')set(s,x,y,'pillar',2);set(s,top.x,top.y,'stairs');s.hero.x=start.x;s.hero.y=start.y;
}
function crown(s:TowerState,r:RNG){
  const start={x:21,y:37};ellipse(s,start.x,start.y,5,3);const p1={x:10,y:29},p2={x:31,y:27},p3={x:13,y:18},p4={x:30,y:14},top={x:21,y:6};for(const p of [p1,p2,p3,p4,top])ellipse(s,p.x,p.y,p===top?6:5,p===top?4:4);corridor(s,start,p1,1);corridor(s,p1,p2,1);corridor(s,p2,p3,1);corridor(s,p3,p4,1);corridor(s,p4,top,1);
  wallify(s);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const t=get(s,x,y);if(t?.kind==='wall'&&r.chance(.72))set(s,x,y,'chasm',r.int(0,3))}for(const i of floorCells(s)){const x=i%W,y=Math.floor(i/W);if(r.chance(.045))set(s,x,y,'gear',r.int(0,3));else if(s.floor>=19&&r.chance(.035))set(s,x,y,'lava',r.int(0,3))}set(s,top.x,top.y,'stairs');s.hero.x=start.x;s.hero.y=start.y;
}
function decorate(s:TowerState,r:RNG){const band=bandFor(s.floor);if(band!==5)wallify(s);doorAtNarrowPoints(s,r);for(const i of floorCells(s)){const x=i%W,y=Math.floor(i/W);if(Math.abs(x-s.hero.x)+Math.abs(y-s.hero.y)<4)continue;if(band===1&&r.chance(.018))set(s,x,y,'trap',r.int(0,3));if(band===2&&r.chance(.025))set(s,x,y,'rubble',r.int(0,3));if(band===4&&r.chance(.014))set(s,x,y,'gear',r.int(0,3))}}
function makeLayout(s:TowerState,r:RNG){const b=bandFor(s.floor);if(b===1)lowerWard(s,r);else if(b===2)knights(s,r);else if(b===3)gardens(s,r);else if(b===4)archive(s,r);else crown(s,r);decorate(s,r)}

const ENEMY_POOL:Record<number,readonly EnemyKind[]>={1:['rat','guard','hound'],2:['guard','archer','knight'],3:['slime','hound','wisp'],4:['cultist','seer','wisp'],5:['knight','golem','seer']};
function isWalk(k:TileKind){return k!=='void'&&k!=='wall'&&k!=='chasm'&&k!=='books'&&k!=='pillar'}
function emptyCell(s:TowerState,r:RNG,minDistance=7){for(let tries=0;tries<1600;tries++){const x=r.int(2,W-3),y=r.int(2,H-3),t=get(s,x,y);if(!t||!isWalk(t.kind)||t.kind==='stairs'||t.kind==='door')continue;if(Math.abs(x-s.hero.x)+Math.abs(y-s.hero.y)<minDistance)continue;if(s.enemies.some(e=>e.x===x&&e.y===y))continue;return{x,y}}return{x:21,y:21}}
function hpFor(kind:EnemyKind,floor:number){const base=kind==='rat'?6:kind==='hound'?9:kind==='archer'?9:kind==='guard'?12:kind==='slime'?12:kind==='wisp'?10:kind==='cultist'?13:kind==='seer'?14:kind==='knight'?18:kind==='golem'?22:34;return base+Math.floor(floor*.7)}
function spawn(s:TowerState,r:RNG){const band=bandFor(s.floor),count=4+band+Math.floor(s.floor/5);for(let n=0;n<count;n++){const p=emptyCell(s,r),kind=r.pick(ENEMY_POOL[band]!),hp=hpFor(kind,s.floor);s.enemies.push({x:p.x,y:p.y,hp,maxHp:hp,kind,cooldown:r.int(0,1),elite:r.chance(.06+.008*s.floor),armor:kind==='knight'?1:0})}if(s.floor%4===0){const p=emptyCell(s,r,11),hp=38+s.floor*5;s.enemies.push({x:p.x,y:p.y,hp,maxHp:hp,kind:'boss',cooldown:0,elite:true,bossBand:band})}const drops=2+r.int(0,2);for(let n=0;n<drops;n++){const p=emptyCell(s,r,5),pool:readonly ItemKind[]=['potion','bomb','ration','ward','smoke','knife'];s.drops.push({x:p.x,y:p.y,kind:r.pick(pool)})}}

function heroFor(cls:HeroClass):Hero{if(cls==='vanguard')return{x:0,y:0,hp:36,maxHp:36,guard:3,power:6,cls,bag:['potion','ration','ward'],skillCooldown:0};if(cls==='ranger')return{x:0,y:0,hp:29,maxHp:29,guard:1,power:5,cls,bag:['knife','bomb','ration'],skillCooldown:0};return{x:0,y:0,hp:25,maxHp:25,guard:0,power:7,cls,bag:['potion','smoke','ward'],skillCooldown:0}}
export function createRun(seedText:string,cls:HeroClass='vanguard'):TowerState{const seed=hash(seedText),s:TowerState={w:W,h:H,tiles:Array.from({length:W*H},()=>tile()),hero:heroFor(cls),enemies:[],drops:[],floor:1,turn:0,seed,won:false,dead:false,messages:['The outer gate seals behind you.']};generateFloor(s);return s}
function generateFloor(s:TowerState){s.tiles=Array.from({length:W*H},()=>tile());s.enemies=[];s.drops=[];const r=new RNG((s.seed^Math.imul(s.floor,0x9e3779b1))>>>0);makeLayout(s,r);spawn(s,r);populateNethackFloor(s);updateVisibility(s)}
function enemyAt(s:TowerState,x:number,y:number){return s.enemies.find(e=>e.x===x&&e.y===y)}
function log(s:TowerState,m:string){s.messages.push(m);if(s.messages.length>7)s.messages.shift()}
function dist(a:{x:number;y:number},b:{x:number;y:number}){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function damageHero(s:TowerState,n:number){const blocked=Math.min(s.hero.guard,n);s.hero.guard-=blocked;n-=blocked;if(n>0)s.hero.hp-=n;if(s.hero.hp<=0){s.hero.hp=0;s.dead=true;log(s,'You fall. The tower keeps its crown.')}}
function kill(s:TowerState,e:Unit){s.enemies=s.enemies.filter(x=>x!==e);if(e.kind==='boss')log(s,'The guardian collapses. The upward seal breaks.');else if(e.elite)log(s,`${labelEnemy(e.kind)} falls.`)}
function attack(s:TowerState,e:Unit,bonus=0){let dmg=s.hero.power+bonus-hungerAttackPenalty(s)-(e.armor??0);if(e.elite)dmg=Math.max(1,dmg-1);dmg=Math.max(1,dmg);e.hp-=dmg;log(s,`You hit ${labelEnemy(e.kind)} for ${dmg}.`);if(e.hp<=0)kill(s,e)}
function canStand(s:TowerState,x:number,y:number){const t=get(s,x,y);return !!t&&isWalk(t.kind)&&!systemBlocksPath(s,x,y)&&!enemyAt(s,x,y)&&!(s.hero.x===x&&s.hero.y===y)}
function stepToward(s:TowerState,e:Unit,away=false){let best={x:e.x,y:e.y,d:dist(e,s.hero)};for(const[dx,dy]of D4){const x=e.x+dx,y=e.y+dy;if(!canStand(s,x,y))continue;const nd=Math.abs(x-s.hero.x)+Math.abs(y-s.hero.y);if((!away&&nd<best.d)||(away&&nd>best.d))best={x,y,d:nd}}e.x=best.x;e.y=best.y}
function lineClear(s:TowerState,a:{x:number;y:number},b:{x:number;y:number}){let x=a.x,y=a.y,dx=Math.abs(b.x-x),sx=x<b.x?1:-1,dy=-Math.abs(b.y-y),sy=y<b.y?1:-1,err=dx+dy;while(!(x===b.x&&y===b.y)){const e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}if(x===b.x&&y===b.y)return true;const t=get(s,x,y);if(!t||t.kind==='wall'||t.kind==='books'||t.kind==='pillar'||systemOpaque(s,x,y))return false}return true}
function rangedHit(s:TowerState,e:Unit,n:number,msg:string){damageHero(s,n);log(s,msg.replace('{n}',String(n)));e.cooldown=1}
function resolveIntent(s:TowerState,e:Unit){if(!e.intent)return false;const intent=e.intent;e.intent=undefined;const tx=e.intentX??s.hero.x,ty=e.intentY??s.hero.y;if(intent==='charge'){
    if(e.x===tx){const dy=Math.sign(ty-e.y);for(let k=0;k<3;k++){const ny=e.y+dy;if(s.hero.x===e.x&&s.hero.y===ny){damageHero(s,e.kind==='boss'?7:5);log(s,'A charging impact throws you off balance.');break}if(!canStand(s,e.x,ny))break;e.y=ny}}
    else if(e.y===ty){const dx=Math.sign(tx-e.x);for(let k=0;k<3;k++){const nx=e.x+dx;if(s.hero.x===nx&&s.hero.y===e.y){damageHero(s,e.kind==='boss'?7:5);log(s,'A charging impact throws you off balance.');break}if(!canStand(s,nx,e.y))break;e.x=nx}}e.cooldown=1;return true}
  if(intent==='shot'){if(s.hero.x===tx&&s.hero.y===ty&&lineClear(s,e,s.hero))rangedHit(s,e,e.kind==='boss'?6:4,'The shot lands for {n}.');return true}
  if(intent==='curse'){if(Math.abs(s.hero.x-tx)+Math.abs(s.hero.y-ty)<=1)rangedHit(s,e,e.kind==='boss'?6:4,'The sigil erupts for {n}.');return true}
  if(intent==='smash'){if(dist(e,s.hero)<=2){damageHero(s,e.kind==='boss'?8:6);log(s,'Stone shock tears through the floor.')}e.cooldown=2;return true}
  if(intent==='starfire'){if(Math.abs(s.hero.x-tx)+Math.abs(s.hero.y-ty)<=1){damageHero(s,8);log(s,'Starfire detonates beneath you.')}e.cooldown=1;return true}return false}
function enemyTurn(s:TowerState){for(const e of [...s.enemies]){if(s.dead)return;if(resolveIntent(s,e))continue;if(e.cooldown>0){e.cooldown--;continue}const d=dist(e,s.hero),visible=lineClear(s,e,s.hero);
    if(e.kind==='rat'){if(d===1)rangedHit(s,e,2,'The rat bites for {n}.');else if(d<=6)stepToward(s,e);continue}
    if(e.kind==='guard'){if(d===1)rangedHit(s,e,3,'The guard strikes for {n}.');else if(d<=7)stepToward(s,e);continue}
    if(e.kind==='archer'){if(d>=3&&d<=7&&visible){e.intent='shot';e.intentX=s.hero.x;e.intentY=s.hero.y;log(s,'An archer draws a bead on your position.')}else if(d<=2)stepToward(s,e,true);else if(d<=9)stepToward(s,e);continue}
    if(e.kind==='hound'){if(d===1)rangedHit(s,e,3,'The hound tears into you for {n}.');else if((e.x===s.hero.x||e.y===s.hero.y)&&d<=5&&visible){e.intent='charge';e.intentX=s.hero.x;e.intentY=s.hero.y;log(s,'The hound lowers its body to charge.')}else if(d<=8)stepToward(s,e);continue}
    if(e.kind==='slime'){if(d===1){const dmg=hasIntrinsic(s,'acid-resist')?1:3;rangedHit(s,e,dmg,'Caustic slime burns for {n}.');const t=get(s,e.x,e.y);if(t?.kind==='floor')t.kind='water'}else if(d<=6)stepToward(s,e);continue}
    if(e.kind==='cultist'){if(d<=5&&visible){e.intent='curse';e.intentX=s.hero.x;e.intentY=s.hero.y;log(s,'A black sigil forms under your feet.')}else if(d<=8)stepToward(s,e);continue}
    if(e.kind==='golem'){if(d<=2){e.intent='smash';log(s,'The golem raises both fists.')}else if(d<=7)stepToward(s,e);continue}
    if(e.kind==='wisp'){if(d===1)rangedHit(s,e,hasIntrinsic(s,'shock-resist')?1:3,'Cold light sears for {n}.');else if(d<=6&&visible&&Math.random()<.35){for(let k=0;k<12;k++){const nx=s.hero.x+(Math.floor(Math.random()*7)-3),ny=s.hero.y+(Math.floor(Math.random()*7)-3);if(canStand(s,nx,ny)){e.x=nx;e.y=ny;break}}}else if(d<=8)stepToward(s,e);continue}
    if(e.kind==='knight'){if(d===1)rangedHit(s,e,5,'The knight cleaves for {n}.');else if(d<=7)stepToward(s,e);continue}
    if(e.kind==='seer'){if(d>=2&&d<=6&&visible){e.intent='shot';e.intentX=s.hero.x;e.intentY=s.hero.y;log(s,'The seer fixes a pale ray on you.')}else if(d===1)stepToward(s,e,true);else if(d<=8)stepToward(s,e);continue}
    if(e.kind==='boss'){const b=e.bossBand??bandFor(s.floor);if(b===1&&d>1&&(e.x===s.hero.x||e.y===s.hero.y)&&d<=6){e.intent='charge';e.intentX=s.hero.x;e.intentY=s.hero.y;log(s,'The Warden plants a boot and prepares to rush.')}else if(b===3&&d<=3){e.intent='smash';log(s,'Roots knot beneath the guardian.')}else if(b>=4&&d<=7&&visible){e.intent=b===5?'starfire':'curse';e.intentX=s.hero.x;e.intentY=s.hero.y;log(s,b===5?'A star-mark burns into the floor.':'The guardian marks the floor with a seal.')}else if(d===1)rangedHit(s,e,7,'The guardian hits for {n}.');else if(d<=9)stepToward(s,e)}
  }}
function pickup(s:TowerState){const d=s.drops.find(x=>x.x===s.hero.x&&x.y===s.hero.y);if(!d)return;s.hero.bag.push(d.kind);s.drops=s.drops.filter(x=>x!==d);log(s,`Picked up ${labelItem(d.kind)}.`)}
function stepHazard(s:TowerState){const t=get(s,s.hero.x,s.hero.y);if(t?.kind==='lava'){const dmg=hasIntrinsic(s,'fire-resist')?2:5;damageHero(s,dmg);log(s,`Crown-fire burns for ${dmg}.`)}else if(t?.kind==='trap'){damageHero(s,4);t.kind='floor';log(s,'A hidden spike snaps upward for 4.')}}
function floorBossAlive(s:TowerState){return s.floor%4===0&&s.enemies.some(e=>e.kind==='boss')}
function endTurn(s:TowerState){s.turn++;if(s.hero.skillCooldown>0)s.hero.skillCooldown--;enemyTurn(s);syncNethack(s);updateVisibility(s)}
function ascend(s:TowerState){if(s.floor===20){s.won=true;log(s,'The final stair opens onto daylight.');return}s.floor++;s.hero.guard=Math.min(4,s.hero.guard+1);s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+2);generateFloor(s);log(s,`Floor ${s.floor}: ${FLOOR_NAMES[s.floor]}.`)}
export function moveHero(s:TowerState,dx:number,dy:number){if(s.dead||s.won)return;const x=s.hero.x+dx,y=s.hero.y+dy;const sys=preMoveSystem(s,x,y,dx,dy);if(sys.flow!=='continue'){if(sys.message)systemMessage(s,sys.message);endTurn(s);return}const t=get(s,x,y);if(!t||!isWalk(t.kind))return;const e=enemyAt(s,x,y);if(e){attack(s,e);endTurn(s);return}s.hero.x=x;s.hero.y=y;pickup(s);stepHazard(s);if(t.kind==='stairs'){if(floorBossAlive(s))log(s,'The stair is sealed by the floor guardian.');else ascend(s)}if(sys.message)systemMessage(s,sys.message);endTurn(s)}
export function waitTurn(s:TowerState){if(s.dead||s.won)return;s.hero.guard=Math.min(s.hero.cls==='vanguard'?6:4,s.hero.guard+1);log(s,'You wait and listen.');endTurn(s)}
export function systemTurn(s:TowerState){if(s.dead||s.won)return;const act=contextSystem(s);if(act==='There is nothing here that needs your hands.')systemMessage(s,searchSystem(s));else systemMessage(s,act);endTurn(s)}
export function useSkill(s:TowerState,x:number,y:number){if(s.dead||s.won||s.hero.skillCooldown>0)return false;const e=enemyAt(s,x,y);if(!e)return false;const d=dist(s.hero,e);if(s.hero.cls==='vanguard'){if(d!==1)return false;attack(s,e,-1);if(e.hp>0){const dx=Math.sign(e.x-s.hero.x),dy=Math.sign(e.y-s.hero.y),nx=e.x+dx,ny=e.y+dy;if(canStand(s,nx,ny)){e.x=nx;e.y=ny}}s.hero.guard=Math.min(6,s.hero.guard+2);s.hero.skillCooldown=4;log(s,'Shield Bash drives the enemy back.');endTurn(s);return true}if(s.hero.cls==='ranger'){if(d>6||!lineClear(s,s.hero,e))return false;attack(s,e,d>=4?3:1);s.hero.skillCooldown=3;log(s,'Longshot finds a clean line.');endTurn(s);return true}if(d>5||!lineClear(s,s.hero,e))return false;attack(s,e,2);const chain=s.enemies.find(o=>o!==e&&o.hp>0&&dist(o,e)<=2);if(chain){chain.hp-=3;log(s,'Arc Bolt chains for 3.');if(chain.hp<=0)kill(s,chain)}s.hero.skillCooldown=4;endTurn(s);return true}
export function useItem(s:TowerState,index:number){if(s.dead||s.won)return;const k=s.hero.bag[index];if(!k)return;s.hero.bag.splice(index,1);if(k==='potion'){s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+13);log(s,'Red draught restores 13 HP.')}else if(k==='ration'){s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+6);s.hero.guard=Math.min(5,s.hero.guard+1);log(s,'You recover 6 HP and steady yourself.')}else if(k==='ward'){s.hero.guard=Math.min(8,s.hero.guard+5);log(s,'A ward hardens around you.')}else if(k==='smoke'){for(const e of s.enemies)if(dist(e,s.hero)<=3)e.cooldown=Math.max(e.cooldown,2);log(s,'Smoke breaks every nearby enemy’s tempo.')}else if(k==='knife'){const e=[...s.enemies].filter(e=>dist(e,s.hero)<=4&&lineClear(s,s.hero,e)).sort((a,b)=>dist(a,s.hero)-dist(b,s.hero))[0];if(e){e.hp-=7;log(s,'Throwing knife hits for 7.');if(e.hp<=0)kill(s,e)}else log(s,'No clear target.')}else{for(const e of [...s.enemies])if(dist(e,s.hero)<=2){e.hp-=9;if(e.hp<=0)kill(s,e)}log(s,'Cinder bomb blasts the nearby floor.')}endTurn(s)}

function opaque(s:TowerState,x:number,y:number){const t=get(s,x,y);return !t||t.kind==='wall'||t.kind==='books'||t.kind==='pillar'||systemOpaque(s,x,y)}
function canSee(s:TowerState,x0:number,y0:number,x1:number,y1:number){let x=x0,y=y0,dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;while(!(x===x1&&y===y1)){const e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}if(x===x1&&y===y1)return true;if(opaque(s,x,y))return false}return true}
export function updateVisibility(s:TowerState){for(const t of s.tiles)t.visible=false;const r=8;for(let y=Math.max(0,s.hero.y-r);y<=Math.min(H-1,s.hero.y+r);y++)for(let x=Math.max(0,s.hero.x-r);x<=Math.min(W-1,s.hero.x+r);x++){const dx=x-s.hero.x,dy=y-s.hero.y;if(dx*dx+dy*dy>r*r)continue;const t=get(s,x,y);if(!t)continue;if(canSee(s,s.hero.x,s.hero.y,x,y)){t.visible=true;t.seen=true}}}
export function labelEnemy(k:EnemyKind){return k==='rat'?'Tower Rat':k==='guard'?'Ward Guard':k==='archer'?'Gallery Archer':k==='hound'?'Hunting Hound':k==='slime'?'Garden Slime':k==='cultist'?'Veiled Curator':k==='golem'?'Bronze Golem':k==='wisp'?'Star Wisp':k==='knight'?'Tower Knight':k==='seer'?'Pale Seer':'Floor Guardian'}
export function labelItem(k:ItemKind){return k==='potion'?'Red Draught':k==='bomb'?'Cinder Bomb':k==='ration'?'Field Ration':k==='ward'?'Stone Ward':k==='smoke'?'Smoke Phial':'Throwing Knife'}
