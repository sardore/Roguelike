import { describe,expect,it } from 'vitest';
import { ITEMS } from '../src/content/items';
import { MONSTERS, monstersForTheme, uniqueMonstersForTheme } from '../src/content/monsters';
import { ORIGINS } from '../src/content/origins';
import { THEMES } from '../src/world/themes';
import { createNewGame } from '../src/core/game';

describe('classic depth expansion',()=>{
  it('raises the material content baseline',()=>{expect(ITEMS.length).toBeGreaterThanOrEqual(230);expect(MONSTERS.length).toBeGreaterThanOrEqual(160);expect(MONSTERS.filter((entry)=>entry.tags.includes('unique')).length).toBeGreaterThanOrEqual(19);});
  it('keeps named uniques out of ordinary ecology pools',()=>{for(const theme of THEMES){expect(monstersForTheme(theme,120).every((entry)=>!entry.tags.includes('unique'))).toBe(true);if(theme.id!=='abyss')expect(uniqueMonstersForTheme(theme,120).length).toBeGreaterThanOrEqual(1);}});
  it('offers distinct traditional starting origins through the same player state',()=>{expect(ORIGINS.length).toBeGreaterThanOrEqual(5);const scout=createNewGame('origin-a','scout').state;const warden=createNewGame('origin-b','warden').state;expect(scout.player.ammo).toBeGreaterThan(warden.player.ammo);expect(warden.player.maxHp).toBeGreaterThan(scout.player.maxHp);expect(scout.player.inventory.some((entry)=>entry.defId==='short-bow')).toBe(true);});
});
