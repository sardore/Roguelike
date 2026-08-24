import type { EntityId, GameState, ItemDefinition } from './types';
import { hashString32 } from './rng';
import { itemById } from '../content/items';

export type Sanctity='cursed'|'mundane'|'blessed';

export function sanctityFor(state:GameState,itemId:EntityId):Sanctity{
  const override=state.itemSanctityOverrides[itemId];if(override)return override;
  if(itemId.startsWith('start-'))return 'mundane';
  const roll=hashString32(`${state.runSeed}:${itemId}:sanctity`)%100;
  return roll<10?'cursed':roll>=94?'blessed':'mundane';
}
export function setSanctity(state:GameState,itemId:EntityId,value:Sanctity):void{state.itemSanctityOverrides[itemId]=value;}
export function enchantmentFor(state:GameState,itemId:EntityId):number{return state.itemEnchantments[itemId]??0;}
export function addEnchantment(state:GameState,itemId:EntityId,delta:number,max=5):number{const next=Math.max(-3,Math.min(max,enchantmentFor(state,itemId)+delta));state.itemEnchantments[itemId]=next;return next;}

export function equippedItemIds(state:GameState):EntityId[]{return [state.player.equippedWeaponId,state.player.equippedArmorId,state.player.equippedAmuletId,...state.player.equippedRingIds].filter((id):id is EntityId=>Boolean(id));}
export function isEquipped(state:GameState,itemId:EntityId):boolean{return equippedItemIds(state).includes(itemId);}
export function equippedDefinitions(state:GameState):Array<{id:EntityId;def:ItemDefinition}>{const set=new Set(equippedItemIds(state));return state.player.inventory.filter((entry)=>set.has(entry.id)).map((entry)=>({id:entry.id,def:itemById(entry.defId)}));}

function numericTag(def:ItemDefinition,prefix:string):number{return def.tags.reduce((sum,tag)=>tag.startsWith(prefix)?sum+(Number(tag.slice(prefix.length))||0):sum,0);}
export function passiveAttackBonus(state:GameState):number{return equippedDefinitions(state).reduce((sum,entry)=>sum+numericTag(entry.def,'passive:attack:')+enchantmentFor(state,entry.id)+(sanctityFor(state,entry.id)==='blessed'?1:sanctityFor(state,entry.id)==='cursed'?-1:0),0);}
export function passiveDefenseBonus(state:GameState):number{return equippedDefinitions(state).reduce((sum,entry)=>sum+numericTag(entry.def,'passive:defense:')+(entry.def.category==='armor'?enchantmentFor(state,entry.id):0)+(sanctityFor(state,entry.id)==='blessed'?1:sanctityFor(state,entry.id)==='cursed'?-1:0),0);}
export function passiveManaBonus(state:GameState):number{return equippedDefinitions(state).reduce((sum,entry)=>sum+numericTag(entry.def,'passive:mana:'),0);}
export function equippedTags(state:GameState):string[]{return equippedDefinitions(state).flatMap((entry)=>entry.def.tags);}

export function canUnequip(state:GameState,itemId:EntityId):boolean{return sanctityFor(state,itemId)!=='cursed';}
export function equipAccessory(state:GameState,itemId:EntityId,def:ItemDefinition):'equipped'|'unequipped'|'blocked'|'unsupported'{
  if(def.tags.includes('slot:ring')){
    const index=state.player.equippedRingIds.indexOf(itemId);
    if(index>=0){if(!canUnequip(state,itemId))return'blocked';state.player.equippedRingIds.splice(index,1);return'unequipped';}
    if(state.player.equippedRingIds.length>=2){const oldest=state.player.equippedRingIds[0]!;if(!canUnequip(state,oldest))return'blocked';state.player.equippedRingIds.shift();}
    state.player.equippedRingIds.push(itemId);return'equipped';
  }
  if(def.tags.includes('slot:amulet')){
    if(state.player.equippedAmuletId===itemId){if(!canUnequip(state,itemId))return'blocked';state.player.equippedAmuletId=undefined;return'unequipped';}
    if(state.player.equippedAmuletId&&!canUnequip(state,state.player.equippedAmuletId))return'blocked';state.player.equippedAmuletId=itemId;return'equipped';
  }
  return'unsupported';
}
