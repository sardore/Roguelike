import type { GameAction, GameState, ItemDefinition, MonsterDefinition, Point } from './types';
import { tileAt } from '../world/generation';
import { itemById } from '../content/items';

export type HungerStage = 'sated' | 'fed' | 'hungry' | 'weak' | 'starving';
export type EncumbranceStage = 'light' | 'burdened' | 'overloaded';
export const DEFAULT_MAX_HUNGER = 2400;
export const DEFAULT_AMMO = 8;
export const MAX_AMMO = 60;

export function itemWeight(def:ItemDefinition):number{
  const explicit=def.tags.find((tag)=>tag.startsWith('weight:'));
  if(explicit){const parsed=Number(explicit.slice(7));if(Number.isFinite(parsed)&&parsed>0)return parsed;}
  if(def.category==='armor'){if(def.tags.includes('heavy'))return 8;if(def.tags.includes('medium'))return 5;return 3;}
  if(def.category==='weapon')return 4+(def.tags.includes('polearm')||def.tags.includes('blunt')?1:0);
  if(def.category==='relic')return 2;
  if(def.category==='tool')return 2;
  return 1;
}
export function inventoryWeight(state:Pick<GameState,'player'>):number{return state.player.inventory.reduce((sum,entry)=>sum+itemWeight(itemById(entry.defId)),0);}
export function carryCapacity(state:Pick<GameState,'player'>):number{return 24+state.player.level*2+Math.floor(state.player.maxHp/12);}
export function hardCarryLimit(state:Pick<GameState,'player'>):number{return Math.floor(carryCapacity(state)*1.5);}
export function encumbranceStage(state:Pick<GameState,'player'>):EncumbranceStage{const load=inventoryWeight(state),cap=carryCapacity(state);if(load<=cap)return 'light';if(load<=Math.floor(cap*1.25))return 'burdened';return 'overloaded';}
export function canCarryDefinition(state:Pick<GameState,'player'>,def:ItemDefinition):boolean{return inventoryWeight(state)+itemWeight(def)<=hardCarryLimit(state);}
export function encumbranceDefensePenalty(state:Pick<GameState,'player'>):number{return encumbranceStage(state)==='overloaded'?1:0;}
export function encumbranceMetabolismSurcharge(state:Pick<GameState,'player'>,action:GameAction):number{const stage=encumbranceStage(state);if(stage==='light')return 0;const active=action.type==='move'||action.type==='explore'||action.type==='fire'||action.type==='rest';if(!active)return stage==='overloaded'?1:0;return stage==='burdened'?1:3;}

export function hungerStage(hunger:number,maxHunger:number):HungerStage{
  const ratio=maxHunger<=0?0:hunger/maxHunger;
  if(ratio>.78)return 'sated';
  if(ratio>.42)return 'fed';
  if(ratio>.2)return 'hungry';
  if(ratio>.07)return 'weak';
  return 'starving';
}

export function hungerPercent(state:Pick<GameState,'player'>):number{
  return Math.max(0,Math.min(100,Math.round(state.player.hunger/state.player.maxHunger*100)));
}

export function metabolismCost(action:GameAction):number{
  if(action.type==='rest')return 7;
  if(action.type==='fire')return 5;
  if(action.type==='search')return 4;
  if(action.type==='move'||action.type==='explore')return 3;
  if(action.type==='use-item')return 2;
  if(action.type==='wait')return 2;
  return 1;
}

export function applyMetabolism(state:GameState,action:GameAction,push:(message:string)=>void):void{
  const before=hungerStage(state.player.hunger,state.player.maxHunger);
  state.player.hunger=Math.max(0,state.player.hunger-metabolismCost(action)-encumbranceMetabolismSurcharge(state,action));
  const after=hungerStage(state.player.hunger,state.player.maxHunger);
  if(before!==after){
    if(after==='hungry')push('You are getting hungry.');
    else if(after==='weak')push('Hunger is making you weak.');
    else if(after==='starving')push('You are starving.');
  }
  if(state.player.hunger===0&&state.turn%4===0){
    const damage=Math.max(1,Math.floor(state.player.maxHp/18));
    state.player.hp=Math.max(0,state.player.hp-damage);
    push(`Starvation drains ${damage} HP.`);
    if(state.player.hp<=0){state.gameOver=true;push('You die of starvation beneath the world.');}
  }
}

export function feedPlayer(state:GameState,amount:number):number{
  const before=state.player.hunger;
  state.player.hunger=Math.min(state.player.maxHunger+Math.floor(state.player.maxHunger*.2),state.player.hunger+Math.max(0,amount));
  return state.player.hunger-before;
}

export function addAmmo(state:GameState,amount:number):number{
  const before=state.player.ammo;
  state.player.ammo=Math.max(0,Math.min(MAX_AMMO,state.player.ammo+amount));
  return state.player.ammo-before;
}

export function hungerAttackPenalty(state:GameState):number{
  const stage=hungerStage(state.player.hunger,state.player.maxHunger);
  return stage==='starving'?3:stage==='weak'?1:0;
}
export function hungerDefensePenalty(state:GameState):number{
  return hungerStage(state.player.hunger,state.player.maxHunger)==='starving'?1:0;
}

export function xpThreshold(level:number):number{return 24+level*level*8;}
export function xpForMonster(def:MonsterDefinition,power:number):number{
  return Math.max(3,Math.round((def.maxHp+def.attack*3+def.defense*2)/5*Math.max(1,power)));
}
export function grantKillProgress(state:GameState,def:MonsterDefinition,power:number,push:(message:string)=>void):void{
  state.player.kills+=1;
  state.player.xp+=xpForMonster(def,power);
  while(state.player.level<27&&state.player.xp>=state.player.xpToNext){
    state.player.xp-=state.player.xpToNext;
    state.player.level+=1;
    state.player.xpToNext=xpThreshold(state.player.level);
    const hpGain=3+(state.player.level%4===0?1:0);
    state.player.maxHp+=hpGain;
    state.player.hp=Math.min(state.player.maxHp,state.player.hp+hpGain+2);
    if(state.player.level%2===0)state.player.attack+=1;
    if(state.player.level%3===0)state.player.defense+=1;
    push(`You reach level ${state.player.level}.`);
  }
}

function pointKey(point:Point):string{return `${point.x},${point.y}`;}
function neighbors(point:Point):Point[]{return[{x:point.x+1,y:point.y},{x:point.x-1,y:point.y},{x:point.x,y:point.y+1},{x:point.x,y:point.y-1}];}

export function autoExploreStep(state:GameState):{dx:number;dy:number}|null{
  const visible=new Set(state.visible);
  if(state.monsters.some((monster)=>visible.has(pointKey(monster))))return null;
  const explored=new Set(state.explored);
  const start={x:state.player.x,y:state.player.y};
  const queue:Point[]=[start];
  const previous=new Map<string,Point|null>([[pointKey(start),null]]);
  let target:Point|null=null;
  for(let cursor=0;cursor<queue.length;cursor+=1){
    const here=queue[cursor]!;
    if(!explored.has(pointKey(here))&&tileAt(state.floor,here.x,here.y)?.walkable){target=here;break;}
    for(const next of neighbors(here)){
      const key=pointKey(next);
      if(previous.has(key))continue;
      const tile=tileAt(state.floor,next.x,next.y);
      if(!tile?.walkable)continue;
      if(state.monsters.some((monster)=>monster.x===next.x&&monster.y===next.y))continue;
      const knownTrap=state.features.some((feature)=>feature.x===next.x&&feature.y===next.y&&feature.revealed&&!feature.spent&&feature.kind.includes('trap'));
      if(knownTrap)continue;
      previous.set(key,here);queue.push(next);
    }
  }
  if(!target)return null;
  let step=target;
  let parent=previous.get(pointKey(step))??null;
  while(parent&&!(parent.x===start.x&&parent.y===start.y)){step=parent;parent=previous.get(pointKey(step))??null;}
  return{dx:step.x-start.x,dy:step.y-start.y};
}

export function isRangedWeapon(def:ItemDefinition|null|undefined):boolean{return Boolean(def?.tags.includes('ranged'));}
export function weaponRange(def:ItemDefinition|null|undefined):number{
  if(!def)return 0;
  const tag=def.tags.find((entry)=>entry.startsWith('range:'));
  const parsed=tag?Number(tag.slice('range:'.length)):0;
  return Number.isFinite(parsed)&&parsed>0?Math.floor(parsed):def.tags.includes('ranged')?6:0;
}
export function rangedBaseDamage(def:ItemDefinition):number{
  return def.effects.filter((effect):effect is Extract<ItemDefinition['effects'][number],{op:'damage'}>=>effect.op==='damage').reduce((sum,effect)=>sum+effect.amount,0);
}

export function canRestSafely(state:GameState):boolean{
  const visible=new Set(state.visible);
  return !state.monsters.some((monster)=>visible.has(pointKey(monster)));
}
