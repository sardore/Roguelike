import type { GameAction, GameState, InventoryItem, SiteServiceKind } from './types';
import { itemById } from '../content/items';
import { identifyItem } from './item-knowledge';
import { statusById } from '../content/statuses';
import { sellPrice, servicePrice, siteDefinition } from '../world/sites';
import { canCarryDefinition } from './foundations';
import { feedPlayer } from './foundations';
import { PATRONS, patronById } from '../content/patrons';
import { addEnchantment, equippedItemIds, sanctityFor, setSanctity } from './item-state';
import { claimContract, createContract } from './quests';

function inventoryEntry(state:GameState,itemId:string):InventoryItem|undefined{return state.player.inventory.find((entry)=>entry.id===itemId);}
function pushMessage(state:GameState,message:string):void{state.messages.push(message);if(state.messages.length>9)state.messages.splice(0,state.messages.length-9);}
function pay(state:GameState,amount:number):boolean{if(state.player.gold<amount){pushMessage(state,'You do not have enough gold.');return false;}state.player.gold-=amount;return true;}
function addStatus(state:GameState,id:string,duration:number,magnitude=1,sourceId?:string):void{const existing=state.player.statuses.find((status)=>status.id===id);if(existing){existing.duration=Math.max(existing.duration,duration);existing.magnitude=Math.max(existing.magnitude,magnitude);if(sourceId)existing.sourceId=sourceId;}else state.player.statuses.push({id,duration,magnitude,...(sourceId?{sourceId}:{})});}
function revealWholeFloor(state:GameState):void{const explored=new Set(state.explored);for(let y=0;y<state.floor.height;y+=1)for(let x=0;x<state.floor.width;x+=1)if(state.floor.tiles[y*state.floor.width+x]!.walkable)explored.add(`${x},${y}`);for(const exit of state.floor.exits)explored.add(`${exit.x},${exit.y}`);state.explored=[...explored];}
function revealExitRumors(state:GameState):void{const explored=new Set(state.explored);for(const exit of state.floor.exits){for(let y=Math.max(0,exit.y-2);y<=Math.min(state.floor.height-1,exit.y+2);y+=1)for(let x=Math.max(0,exit.x-2);x<=Math.min(state.floor.width-1,exit.x+2);x+=1)explored.add(`${x},${y}`);}state.explored=[...explored];}
function markUsed(state:GameState,siteId:string,service:SiteServiceKind):void{const site=state.sites.find((entry)=>entry.id===siteId);if(site&&!site.usedServices.includes(service))site.usedServices.push(service);}
function refund(state:GameState,amount:number):false{state.player.gold+=amount;return false;}

export function resolveSiteService(state:GameState,action:Extract<GameAction,{type:'site-service'}>):boolean{
  const site=state.sites.find((entry)=>entry.id===action.siteId);if(!site||site.x!==state.player.x||site.y!==state.player.y)return false;
  const def=siteDefinition(site.kind);if(!def.services.includes(action.service))return false;
  const singleUse=['rumor','map','bless','rest','train-attack','train-defense','train-vigor','inn-rest'].includes(action.service);
  if(singleUse&&site.usedServices.includes(action.service)){pushMessage(state,'That service has already been used here.');return false;}
  if(action.service==='buy'){
    const offer=site.stock.find((entry)=>entry.id===action.offerId);if(!offer)return false;const def=itemById(offer.defId);if(!canCarryDefinition(state,def)){pushMessage(state,`Your pack cannot carry ${def.name}.`);return false;}if(!pay(state,offer.price))return false;
    state.player.inventory.push({id:offer.id,defId:offer.defId});site.stock=site.stock.filter((entry)=>entry.id!==offer.id);pushMessage(state,`You buy ${def.name} for ${offer.price} gold.`);return true;
  }
  if(action.service==='sell'){
    const entry=action.itemId?inventoryEntry(state,action.itemId):undefined;if(!entry)return false;
    if(equippedItemIds(state).includes(entry.id)&&sanctityFor(state,entry.id)==='cursed'){pushMessage(state,'The cursed item will not leave you.');return false;}
    if(state.player.equippedWeaponId===entry.id)state.player.equippedWeaponId=undefined;if(state.player.equippedArmorId===entry.id)state.player.equippedArmorId=undefined;state.player.equippedRingIds=state.player.equippedRingIds.filter((id)=>id!==entry.id);if(state.player.equippedAmuletId===entry.id)state.player.equippedAmuletId=undefined;
    const price=sellPrice(entry.defId);state.player.inventory=state.player.inventory.filter((item)=>item.id!==entry.id);state.player.gold+=price;pushMessage(state,`You sell ${itemById(entry.defId).name} for ${price} gold.`);return true;
  }
  if(action.service==='devote'){
    const patron=action.offerId?PATRONS.find((entry)=>entry.id===action.offerId):undefined;if(!patron)return false;
    state.player.patronId=patron.id;state.player.piety=Math.max(3,state.player.piety);pushMessage(state,`You devote yourself to ${patron.name}.`);return true;
  }
  if(action.service==='invoke'){
    if(!state.player.patronId){pushMessage(state,'You have sworn to no patron.');return false;}const patron=patronById(state.player.patronId);if(state.player.piety<patron.invokeCost){pushMessage(state,'Your piety is too weak for an invocation.');return false;}state.player.piety-=patron.invokeCost;
    if(patron.invoke.heal)state.player.hp=Math.min(state.player.maxHp,state.player.hp+patron.invoke.heal);if(patron.invoke.mana)state.player.mana=Math.min(state.player.maxMana,state.player.mana+patron.invoke.mana);if(patron.invoke.nutrition)feedPlayer(state,patron.invoke.nutrition);for(const status of patron.invoke.statuses)addStatus(state,status.id,status.duration,status.magnitude,site.id);pushMessage(state,`${patron.name} answers your invocation.`);return true;
  }
  if(action.service==='contract'){
    const kind=action.offerId as 'hunt'|'delve'|'unique'|undefined;if(!kind)return false;const quest=createContract(state,site.id,kind);if(!quest){pushMessage(state,'You already carry a similar contract.');return false;}state.quests.push(quest);pushMessage(state,`You accept a ${kind} contract.`);return true;
  }
  if(action.service==='claim-contract'){
    if(!action.offerId)return false;const quest=claimContract(state,action.offerId);if(!quest){pushMessage(state,'That contract is not ready to claim.');return false;}state.player.gold+=quest.rewardGold;if(state.player.patronId)state.player.piety+=2;pushMessage(state,`The guild pays ${quest.rewardGold} gold for the completed contract.`);return true;
  }
  const price=servicePrice(action.service);if(price&&!pay(state,price))return false;
  if(action.service==='temper-weapon'||action.service==='temper-armor'){
    const itemId=action.service==='temper-weapon'?state.player.equippedWeaponId:state.player.equippedArmorId;if(!itemId){pushMessage(state,'You have nothing suitable equipped.');return refund(state,price);}const next=addEnchantment(state,itemId,1);pushMessage(state,`The smith tempers your equipment to +${next}.`);return true;
  }
  if(action.service==='uncurse'){
    const target=equippedItemIds(state).find((id)=>sanctityFor(state,id)==='cursed');if(!target){pushMessage(state,'No equipped item is cursed.');return refund(state,price);}setSanctity(state,target,'mundane');pushMessage(state,'The binding curse breaks with a metallic sigh.');return true;
  }
  if(action.service==='heal'){
    if(state.player.hp>=state.player.maxHp){pushMessage(state,'You are already fully healed.');return refund(state,price);}
    state.player.hp=state.player.maxHp;pushMessage(state,'The healer restores you completely.');return true;
  }
  if(action.service==='cleanse'){
    const before=state.player.statuses.length;state.player.statuses=state.player.statuses.filter((status)=>!statusById(status.id).harmful);
    if(before===state.player.statuses.length){pushMessage(state,'There is nothing harmful to cleanse.');return refund(state,price);}
    pushMessage(state,'The healer clears your afflictions.');return true;
  }
  if(action.service==='identify'){
    const entry=action.itemId?inventoryEntry(state,action.itemId):undefined;if(!entry)return refund(state,price);
    const item=itemById(entry.defId);if(!identifyItem(state,item)){pushMessage(state,`${item.name} is already understood.`);return refund(state,price);}
    pushMessage(state,`The appraiser identifies ${item.name}.`);return true;
  }
  if(action.service==='map'){revealWholeFloor(state);markUsed(state,site.id,'map');pushMessage(state,'The cartographer marks the entire reachable level.');return true;}
  if(action.service==='bless'){addStatus(state,'focused',28,1,site.id);addStatus(state,'guarding',5,1,site.id);const target=equippedItemIds(state)[0];if(target)setSanctity(state,target,'blessed');markUsed(state,site.id,'bless');pushMessage(state,'The shrine grants a long blessing and sanctifies your readied gear.');return true;}
  if(action.service==='rest'){const amount=Math.max(6,Math.floor(state.player.maxHp*.35));state.player.hp=Math.min(state.player.maxHp,state.player.hp+amount);markUsed(state,site.id,'rest');pushMessage(state,`You rest and recover ${amount} HP.`);return true;}
  if(action.service==='meal'){const restored=feedPlayer(state,Math.floor(state.player.maxHunger*.42));state.player.hp=Math.min(state.player.maxHp,state.player.hp+2);pushMessage(state,`A hot meal restores ${restored} nutrition.`);return true;}
  if(action.service==='inn-rest'){state.player.hp=state.player.maxHp;state.player.mana=state.player.maxMana;feedPlayer(state,Math.floor(state.player.maxHunger*.7));state.player.statuses=state.player.statuses.filter((status)=>!statusById(status.id).harmful);markUsed(state,site.id,'inn-rest');pushMessage(state,'You sleep safely, eat well, and wake restored.');return true;}
  if(action.service==='train-attack'){state.player.attack+=1;markUsed(state,site.id,'train-attack');pushMessage(state,'Training permanently improves your attack.');return true;}
  if(action.service==='train-defense'){state.player.defense+=1;markUsed(state,site.id,'train-defense');pushMessage(state,'Training permanently improves your defense.');return true;}
  if(action.service==='train-vigor'){state.player.maxHp+=5;state.player.hp=Math.min(state.player.maxHp,state.player.hp+5);markUsed(state,site.id,'train-vigor');pushMessage(state,'Training permanently improves your vigor.');return true;}
  if(action.service==='rumor'){revealExitRumors(state);markUsed(state,site.id,'rumor');pushMessage(state,'Locals mark the known descents and warn that deeper side routes become unstable.');return true;}
  return false;
}
