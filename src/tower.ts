export type TileKind='void'|'floor'|'wall'|'door'|'stairs'|'water'|'grass'|'lava'|'books'|'gear';
export type HeroClass='vanguard'|'ranger'|'arcanist';
export type ItemKind='potion'|'bomb'|'ration'|'ward';
export type EnemyKind='rat'|'guard'|'archer'|'hound'|'slime'|'cultist'|'golem'|'wisp'|'knight'|'seer'|'boss';

export interface Tile{kind:TileKind;seen:boolean;visible:boolean;variant:number}
export interface Unit{x:number;y:number;hp:number;maxHp:number;kind:EnemyKind;cooldown:number;elite?:boolean}
export interface Drop{x:number;y:number;kind:ItemKind}
export interface Hero{x:number;y:number;hp:number;maxHp:number;guard:number;power:number;cls:HeroClass;bag:ItemKind[]}
export interface TowerState{w:number;h:number;tiles:Tile[];hero:Hero;enemies:Unit[];drops:Drop[];floor:number;turn:number;seed:number;won:boolean;dead:boolean;messages:string[]}

const W=37,H=37;
const I=(x:number,y:number)=>y*W+x;
const D4=[[1,0],[-1,0],[0,1],[0,-1]] as const;
const inside=(x:number,y:number)=>x>0&&y>0&&x<W-1&&y<H-1;

class RNG{constructor(public s:number){} next(){let x=this.s|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.s=x|0;return(x>>>0)/4294967296} int(a:number,b:number){return a+Math.floor(this.next()*(b-a+1))} chance(p:number){return this.next()<p} pick<T>(a:readonly T[]):T{return a[Math.min(a.length-1,Math.floor(this.next()*a.length))]!}}
export function hash(text:string){let h=2166136261>>>0;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

export function bandFor(floor:number){return Math.min(5,Math.max(1,Math.ceil(floor/4)))}
export const BAND_NAMES=['','LOWER WARD','KNIGHTS’ QUARTERS','HANGING GARDENS','FORBIDDEN ARCHIVE','ASTRARIUM CROWN'];
export const FLOOR_NAMES=['','Gatehouse','Servants’ Hall','Old Kitchens','Warden’s Court','Armory','Training Hall','Chapel of Shields','Captain’s Keep','Root Gallery','Rain Court','Glasshouse','Verdant Throne','Scriptorium','Index Hall','Sealed Stacks','Curator’s Vault','Clock Gallery','Star Bridge','Observatory','First King’s Crown'];

function tile(kind:TileKind='void',variant=0):Tile{return{kind,variant,seen:false,visible:false}}
function set(s:TowerState,x:number,y:number,kind:TileKind,v=0){if(x>=0&&y>=0&&x<W&&y<H)s.tiles[I(x,y)]=tile(kind,v)}
function get(s:TowerState,x:number,y:number){return x>=0&&y>=0&&x<W&&y<H?s.tiles[I(x,y)]:undefined}
function carve(s:TowerState,x:number,y:number,kind:TileKind='floor',v=0){if(inside(x,y))set(s,x,y,kind,v)}
function rect(s:TowerState,x:number,y:number,w:number,h:number,kind:TileKind='floor',v=0){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)carve(s,xx,yy,kind,v)}
function ellipse(s:TowerState,cx:number,cy:number,rx:number,ry:number,kind:TileKind='floor',v=0){for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const dx=(x-cx)/Math.max(1,rx),dy=(y-cy)/Math.max(1,ry);if(dx*dx+dy*dy<=1)carve(s,x,y,kind,v)}}
function corridor(s:TowerState,a:{x:number;y:number},b:{x:number;y:number},width=2){let x=a.x,y=a.y;while(x!==b.x){for(let k=-Math.floor(width/2);k<=Math.floor(width/2);k++)carve(s,x,y+k);x+=Math.sign(b.x-x)}while(y!==b.y){for(let k=-Math.floor(width/2);k<=Math.floor(width/2);k++)carve(s,x+k,y);y+=Math.sign(b.y-y)}carve(s,b.x,b.y)}
function wallify(s:TowerState){const copy=s.tiles.map(t=>t.kind);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(copy[I(x,y)]!=='void')continue;let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(copy[I(x+dx,y+dy)]!=='void')near=true;if(near)set(s,x,y,'wall',(x*7+y*11+s.floor)%8)}}

function decorateBand(s:TowerState,r:RNG){const band=bandFor(s.floor);for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const t=get(s,x,y);if(!t||t.kind!=='floor')continue;const roll=r.next();if(band===1&&roll<.035)t.variant=8+r.int(0,2);if(band===2&&roll<.04)t.variant=12+r.int(0,2);if(band===3&&roll<.09&&r.chance(.6))t.kind='grass';if(band===4&&roll<.07)t.kind='books';if(band===5&&roll<.065)t.kind='gear'}}
function hazards(s:TowerState,r:RNG){const band=bandFor(s.floor);const floorCells:number[]=[];for(let i=0;i<s.tiles.length;i++)if(s.tiles[i]?.kind==='floor')floorCells.push(i);for(let n=0;n<3+band;n++){const i=r.pick(floorCells),x=i%W,y=Math.floor(i/W);if(Math.abs(x-s.hero.x)+Math.abs(y-s.hero.y)<5)continue;if(band===3)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx*dx+dy*dy<=2&&get(s,x+dx,y+dy)?.kind==='floor')set(s,x+dx,y+dy,'water',r.int(0,3));if(band===5&&s.floor>=19)for(let dx=-1;dx<=1;dx++)if(get(s,x+dx,y)?.kind==='floor')set(s,x+dx,y,'lava',r.int(0,3))}}

function makeLayout(s:TowerState,r:RNG){
  // Floor is a chain of distinct architectural nodes, not a rectangle soup.
  const nodes:{x:number;y:number;rx:number;ry:number}[]=[];
  const start={x:18+r.int(-2,2),y:31};nodes.push({x:start.x,y:start.y,rx:4,ry:3});
  let cx=start.x,cy=start.y;
  for(let n=0;n<5;n++){
    cy-=r.int(4,6);cx=Math.max(7,Math.min(29,cx+r.int(-7,7)));
    nodes.push({x:cx,y:cy,rx:r.int(3,6),ry:r.int(3,5)});
  }
  nodes.push({x:18+r.int(-3,3),y:5,rx:5,ry:3});
  for(let n=0;n<nodes.length;n++){
    const q=nodes[n]!;if(n%3===0)ellipse(s,q.x,q.y,q.rx,q.ry);else if(n%3===1){ellipse(s,q.x,q.y,q.rx,q.ry);rect(s,q.x-q.rx,q.y-1,q.rx*2+1,3)}else{rect(s,q.x-q.rx,q.y-q.ry,q.rx*2+1,q.ry*2+1);ellipse(s,q.x,q.y,q.rx+1,Math.max(2,q.ry-1))}
    if(n>0)corridor(s,nodes[n-1]!,q,r.chance(.35)?3:2);
  }
  // Secondary loop path to make route choice matter.
  if(r.chance(.85)){const a=nodes[2]!,b=nodes[4]!,side=r.chance(.5)?1:-1,turn={x:Math.max(4,Math.min(32,(a.x+b.x)/2+side*r.int(6,9))),y:Math.floor((a.y+b.y)/2)};corridor(s,a,turn,2);corridor(s,turn,b,2)}
  s.hero.x=start.x;s.hero.y=start.y;
  const top=nodes[nodes.length-1]!;set(s,top.x,top.y,'stairs',0);
  decorateBand(s,r);hazards(s,r);wallify(s);
}

const ENEMY_POOL:Record<number,readonly EnemyKind[]>={1:['rat','guard','hound'],2:['guard','archer','knight'],3:['slime','hound','wisp'],4:['cultist','seer','wisp'],5:['knight','golem','seer']};
function isWalk(k:TileKind){return k!=='void'&&k!=='wall'}
function emptyCell(s:TowerState,r:RNG,minDistance=7){for(let tries=0;tries<1000;tries++){const x=r.int(2,W-3),y=r.int(2,H-3),t=get(s,x,y);if(!t||!isWalk(t.kind)||t.kind==='stairs')continue;if(Math.abs(x-s.hero.x)+Math.abs(y-s.hero.y)<minDistance)continue;if(s.enemies.some(e=>e.x===x&&e.y===y))continue;return{x,y}}return{x:18,y:18}}
function spawn(s:TowerState,r:RNG){const band=bandFor(s.floor),count=5+band+Math.floor(s.floor/4);for(let n=0;n<count;n++){const p=emptyCell(s,r),kind=r.pick(ENEMY_POOL[band]!),base=kind==='rat'?5:kind==='hound'?8:kind==='archer'?8:kind==='guard'?10:kind==='slime'?11:kind==='wisp'?9:kind==='cultist'?12:kind==='seer'?13:kind==='knight'?16:18;const scale=Math.floor(s.floor*.65);s.enemies.push({x:p.x,y:p.y,hp:base+scale,maxHp:base+scale,kind,cooldown:r.int(0,1),elite:r.chance(.08+.01*s.floor)})}
  if(s.floor%4===0){const p=emptyCell(s,r,12),hp=30+s.floor*5;s.enemies.push({x:p.x,y:p.y,hp,maxHp:hp,kind:'boss',cooldown:0,elite:true})}
  const drops=3+r.int(0,2);for(let n=0;n<drops;n++){const p=emptyCell(s,r,5),pool:readonly ItemKind[]=['potion','bomb','ration','ward'];s.drops.push({x:p.x,y:p.y,kind:r.pick(pool)})}
}

function heroFor(cls:HeroClass):Hero{if(cls==='vanguard')return{x:0,y:0,hp:34,maxHp:34,guard:2,power:6,cls,bag:['potion','ration']};if(cls==='ranger')return{x:0,y:0,hp:27,maxHp:27,guard:1,power:5,cls,bag:['bomb','ration']};return{x:0,y:0,hp:24,maxHp:24,guard:0,power:7,cls,bag:['potion','ward']}}
export function createRun(seedText:string,cls:HeroClass='vanguard'):TowerState{const seed=hash(seedText),s:TowerState={w:W,h:H,tiles:Array.from({length:W*H},()=>tile()),hero:heroFor(cls),enemies:[],drops:[],floor:1,turn:0,seed,won:false,dead:false,messages:['The tower doors close behind you.']};generateFloor(s);return s}
function generateFloor(s:TowerState){s.tiles=Array.from({length:W*H},()=>tile());s.enemies=[];s.drops=[];const r=new RNG((s.seed^Math.imul(s.floor,0x9e3779b1))>>>0);makeLayout(s,r);spawn(s,r);updateVisibility(s)}

function enemyAt(s:TowerState,x:number,y:number){return s.enemies.find(e=>e.x===x&&e.y===y)}
function log(s:TowerState,m:string){s.messages.push(m);if(s.messages.length>5)s.messages.shift()}
function dist(a:{x:number;y:number},b:{x:number;y:number}){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function damageHero(s:TowerState,n:number){const blocked=Math.min(s.hero.guard,n);s.hero.guard-=blocked;n-=blocked;if(n>0)s.hero.hp-=n;if(s.hero.hp<=0){s.hero.hp=0;s.dead=true;log(s,'You fall beneath the tower’s crown.') }}
function attack(s:TowerState,e:Unit){let dmg=s.hero.power+(s.hero.cls==='ranger'&&dist(s.hero,e)>1?1:0);if(e.elite)dmg=Math.max(1,dmg-1);e.hp-=dmg;log(s,`You strike ${labelEnemy(e.kind)} for ${dmg}.`);if(e.hp<=0){s.enemies=s.enemies.filter(x=>x!==e);if(e.kind==='boss')log(s,'The floor guardian falls. The stair answers.')}}

function enemyTurn(s:TowerState){for(const e of [...s.enemies]){if(e.cooldown>0){e.cooldown--;continue}const d=dist(e,s.hero);if(d===1){const dmg=e.kind==='boss'?7:e.kind==='knight'||e.kind==='golem'?5:e.kind==='seer'||e.kind==='cultist'?4:3;damageHero(s,dmg);if(s.dead)return;continue}if(d>9)continue;let best={x:e.x,y:e.y,d};for(const [dx,dy] of D4){const x=e.x+dx,y=e.y+dy,t=get(s,x,y);if(!t||!isWalk(t.kind)||enemyAt(s,x,y)||s.hero.x===x&&s.hero.y===y)continue;const nd=Math.abs(x-s.hero.x)+Math.abs(y-s.hero.y);if(nd<best.d)best={x,y,d:nd}}e.x=best.x;e.y=best.y}}
function pickup(s:TowerState){const d=s.drops.find(x=>x.x===s.hero.x&&x.y===s.hero.y);if(!d)return;s.hero.bag.push(d.kind);s.drops=s.drops.filter(x=>x!==d);log(s,`Picked up ${labelItem(d.kind)}.`)}
function stepHazard(s:TowerState){const t=get(s,s.hero.x,s.hero.y);if(t?.kind==='lava'){damageHero(s,5);log(s,'The crown-fire burns through your boots.')}else if(t?.kind==='water'&&s.hero.cls!=='ranger'){log(s,'Deep water slows your footing.')}}
function floorBossAlive(s:TowerState){return s.floor%4===0&&s.enemies.some(e=>e.kind==='boss')}

export function moveHero(s:TowerState,dx:number,dy:number){if(s.dead||s.won)return;const x=s.hero.x+dx,y=s.hero.y+dy,t=get(s,x,y);if(!t||!isWalk(t.kind))return;const e=enemyAt(s,x,y);if(e){attack(s,e);endTurn(s);return}s.hero.x=x;s.hero.y=y;pickup(s);stepHazard(s);if(t.kind==='stairs'){if(floorBossAlive(s)){log(s,'The stair is sealed by the floor guardian.')}else ascend(s)}endTurn(s)}
export function waitTurn(s:TowerState){if(s.dead||s.won)return;s.hero.guard=Math.min(4,s.hero.guard+1);endTurn(s)}
function endTurn(s:TowerState){s.turn++;enemyTurn(s);updateVisibility(s)}
function ascend(s:TowerState){if(s.floor===20){s.won=true;log(s,'You reach the First King’s Crown. The sky is open.');return}s.floor++;s.hero.guard=Math.min(3,s.hero.guard+1);s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+3);generateFloor(s);log(s,`Floor ${s.floor}: ${FLOOR_NAMES[s.floor]}.`)}

export function useItem(s:TowerState,index:number){if(s.dead||s.won)return;const k=s.hero.bag[index];if(!k)return;s.hero.bag.splice(index,1);if(k==='potion'){s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+12);log(s,'Crimson draught restores 12 HP.')}else if(k==='ration'){s.hero.hp=Math.min(s.hero.maxHp,s.hero.hp+6);s.hero.guard=Math.min(4,s.hero.guard+1);log(s,'You eat and steady your stance.')}else if(k==='ward'){s.hero.guard=Math.min(8,s.hero.guard+5);log(s,'A silver ward locks into place.')}else{let hit=0;for(const e of s.enemies)if(dist(s.hero,e)<=2){e.hp-=10;hit++}s.enemies=s.enemies.filter(e=>e.hp>0);log(s,hit?`Bomb catches ${hit} foe${hit>1?'s':''}.`:'The bomb bursts against empty stone.')}endTurn(s)}

export function labelItem(k:ItemKind){return k==='potion'?'Crimson Draught':k==='bomb'?'Cinder Bomb':k==='ration'?'Travel Ration':'Silver Ward'}
export function labelEnemy(k:EnemyKind){return k==='rat'?'tower rat':k==='guard'?'hollow guard':k==='archer'?'watch archer':k==='hound'?'stone hound':k==='slime'?'garden ooze':k==='cultist'?'archive cultist':k==='golem'?'clockwork golem':k==='wisp'?'star wisp':k==='knight'?'black knight':k==='seer'?'blind seer':'floor guardian'}

function los(s:TowerState,x0:number,y0:number,x1:number,y1:number){let x=x0,y=y0,dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;while(!(x===x1&&y===y1)){const e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}if(x===x1&&y===y1)return true;const t=get(s,x,y);if(!t||t.kind==='wall'||t.kind==='void')return false}return true}
export function updateVisibility(s:TowerState){for(const t of s.tiles)t.visible=false;const r=9;for(let y=Math.max(0,s.hero.y-r);y<=Math.min(H-1,s.hero.y+r);y++)for(let x=Math.max(0,s.hero.x-r);x<=Math.min(W-1,s.hero.x+r);x++){const dx=x-s.hero.x,dy=y-s.hero.y;if(dx*dx+dy*dy>r*r)continue;if(!los(s,s.hero.x,s.hero.y,x,y))continue;const t=get(s,x,y);if(t){t.visible=true;t.seen=true}}}
