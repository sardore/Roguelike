import { describe,expect,it } from 'vitest';
import { createNewGame,dispatchAction,assertGameInvariants } from '../src/core/game';
import { ITEMS } from '../src/content/items';
import { MONSTERS } from '../src/content/monsters';
import { SPELLS } from '../src/content/spells';
import { PATRONS } from '../src/content/patrons';
import { createContract,recordMonsterKill } from '../src/core/quests';

describe('grand traditional roguelike depth pass',()=>{
  it('ships the larger systemic catalogue',()=>{expect(ITEMS.length).toBeGreaterThanOrEqual(270);expect(MONSTERS.length).toBeGreaterThanOrEqual(160);expect(SPELLS.length).toBeGreaterThanOrEqual(16);expect(PATRONS.length).toBeGreaterThanOrEqual(4);});
  it('casts known spells through the canonical action path',()=>{const{state}=createNewGame('spell-pass','warden');state.monsters=[];const before=state.player.mana;expect(dispatchAction(state,{type:'cast-spell',spellId:'stone-ward'}).accepted).toBe(true);expect(state.player.mana).toBeLessThan(before);expect(state.player.statuses.some((status)=>status.id==='guarding')).toBe(true);expect(()=>assertGameInvariants(state)).not.toThrow();});
  it('equips accessory slots through item actions',()=>{const{state}=createNewGame('ring-pass');state.monsters=[];state.player.inventory.push({id:'ring-test',defId:'ring-of-stone'});expect(dispatchAction(state,{type:'use-item',itemId:'ring-test'}).accepted).toBe(true);expect(state.player.equippedRingIds).toContain('ring-test');});
  it('tracks reusable contracts without special combat paths',()=>{const{state}=createNewGame('quest-pass');const quest=createContract(state,'guild-test','hunt');expect(quest).not.toBeNull();state.quests.push(quest!);for(let i=0;i<quest!.goal;i++)recordMonsterKill(state,false);expect(state.quests[0]!.status).toBe('complete');});
  it('corpses are explicit interactions rather than step auto-consumption',()=>{const{state}=createNewGame('corpse-pass');state.monsters=[];state.player.hunger=300;state.features.push({id:'corpse-test',kind:'corpse',x:state.player.x,y:state.player.y,revealed:true,spent:false,sourceDefId:MONSTERS.find((entry)=>!entry.tags.includes('construct')&&!entry.tags.includes('spirit'))!.id});const before=state.player.hunger;expect(dispatchAction(state,{type:'interact'}).accepted).toBe(true);expect(state.player.hunger).toBeGreaterThan(before);});
});
