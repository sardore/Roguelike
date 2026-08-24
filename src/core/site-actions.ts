import type { GameAction, GameState, InventoryItem, SiteServiceKind } from './types';
import { itemById } from '../content/items';
import { identifyItem } from './item-knowledge';
import { statusById } from '../content/statuses';
import { sellPrice, servicePrice, siteDefinition } from '../world/sites';

function inventoryEntry(state:GameState,itemId:string):InventoryItem|undefined{return state.player.inventory.find((entry)=>entry.id===itemId);}
function pushMessage(state:GameState,message:string):void{state.messages.push(message);if(state.messages.length>9)state.messages.splice(0,state.messages.length-9);}
function pay(state:GameState,amount:number):boolean{if(state.player.gold<amount){pushMessage(state,'You do not have enough gold.');return false;}state.player.gold-=amount;return true;}
function addStatus(state:GameState,id:string,duration:number,magnitude=1,sourceId?:string):void{const existing=state.player.statuses.find((status)=>status.id===id);if(existing){existing.duration=Math.max(existing.duration,duration);existing.magnitude=Math.max(existing.magnitude,magnitude);if(sourceId)existing.sourceId=sourceId;}else state.player.statuses.push({id,duration,magnitude,...(sourceId?{sourceId}:{})});}
function revealWholeFloor(state:GameState):void{const explored=new Set(state.explored);for(let y=0;y<state.floor.height;y+=1)for(let x=0;x<state.floor.width;x+=1)if(state.floor.tiles[y*state.floor.width+x]!.walkable)explored.add(`${x},${y}`);for(const exit of state.floor.exits)explored.add(`${exit.x},${exit.y}`);state.explored=[...explored];}
function revealExitRumors(state:GameState):void{const explored=new Set(state.explored);for(const exit of state.floor.exits){for(let y=Math.max(0,exit.y-2);y<=Math.min(state.floor.height-1,exit.y+2);y+=1)for(let x=Math.max(0,exit.x-2);x<=Math.min(state.floor.width-1,exit.x+2);x+=1)explored.add(`${x},${y}`);}state.explored=[...explored];}
function markUsed(state:GameState,siteId:string,service:SiteServiceKind):void{const site=state.sites.find((entry)=>entry.id===siteId);if(site&&!site.usedServices.includes(service))site.usedServices.push(service);}

export function resolveSiteService(state:GameState,action:Extract<GameAction,{type:'site-service'}>):boolean{
  const site=state.sites.find((entry)=>entry.id===action.siteId);if(!site||site.x!==state.player.x||site.y!==state.player.y)return false;
  const def=siteDefinition(site.kind);if(!def.services.includes(action.service))return false;
  const singleUse=action.service==='rumor'||action.service==='map'||action.service==='bless'||action.service==='rest';
  if(singleUse&&site.usedServices.includes(action.service)){pushMessage(state,'That service has already been used here.');return false;}
  if(action.service==='buy'){
    const offer=site.stock.find((entry)=>entry.id===action.offerId);if(!offer||!pay(state,offer.price))return false;
    state.player.inventory.push({id:offer.id,defId:offer.defId});site.stock=site.stock.filter((entry)=>entry.id!==offer.id);pushMessage(state,`You buy ${itemById(offer.defId).name} for ${offer.price} gold.`);return true;
  }
  if(action.service==='sell'){
    const entry=action.itemId?inventoryEntry(state,action.itemId):undefined;if(!entry)return false;
    if(state.player.equippedWeaponId===entry.id)state.player.equippedWeaponId=undefined;if(state.player.equippedArmorId===entry.id)state.player.equippedArmorId=undefined;
    const price=sellPrice(entry.defId);state.player.inventory=state.player.inventory.filter((item)=>item.id!==entry.id);state.player.gold+=price;pushMessage(state,`You sell ${itemById(entry.defId).name} for ${price} gold.`);return true;
  }
  const price=servicePrice(action.service);if(price&&!pay(state,price))return false;
  if(action.service==='heal'){
    if(state.player.hp>=state.player.maxHp){state.player.gold+=price;pushMessage(state,'You are already fully healed.');return false;}
    state.player.hp=state.player.maxHp;pushMessage(state,'The healer restores you completely.');return true;
  }
  if(action.service==='cleanse'){
    const before=state.player.statuses.length;state.player.statuses=state.player.statuses.filter((status)=>!statusById(status.id).harmful);
    if(before===state.player.statuses.length){state.player.gold+=price;pushMessage(state,'There is nothing harmful to cleanse.');return false;}
    pushMessage(state,'The healer clears your afflictions.');return true;
  }
  if(action.service==='identify'){
    const entry=action.itemId?inventoryEntry(state,action.itemId):undefined;if(!entry){state.player.gold+=price;return false;}
    const item=itemById(entry.defId);if(!identifyItem(state,item)){state.player.gold+=price;pushMessage(state,`${item.name} is already understood.`);return false;}
    pushMessage(state,`The appraiser identifies ${item.name}.`);return true;
  }
  if(action.service==='map'){revealWholeFloor(state);markUsed(state,site.id,'map');pushMessage(state,'The cartographer marks the entire reachable level.');return true;}
  if(action.service==='bless'){addStatus(state,'focused',28,1,site.id);addStatus(state,'guarding',5,1,site.id);markUsed(state,site.id,'bless');pushMessage(state,'The shrine grants a long blessing.');return true;}
  if(action.service==='rest'){const amount=Math.max(6,Math.floor(state.player.maxHp*.35));state.player.hp=Math.min(state.player.maxHp,state.player.hp+amount);markUsed(state,site.id,'rest');pushMessage(state,`You rest and recover ${amount} HP.`);return true;}
  if(action.service==='rumor'){revealExitRumors(state);markUsed(state,site.id,'rumor');pushMessage(state,'Locals mark the known descents and warn that deeper side routes become unstable.');return true;}
  return false;
}
