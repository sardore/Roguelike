import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/content/items';
import { MONSTERS } from '../src/content/monsters';
import { THEMES, validateThemeCatalog } from '../src/world/themes';
describe('content volume gates',()=>{it('ships at least 15 themes and 8 archetypes per theme',()=>{expect(THEMES.length).toBeGreaterThanOrEqual(15);expect(validateThemeCatalog()).toEqual([]);});it('ships a large tactical content catalog',()=>{expect(MONSTERS.length).toBeGreaterThanOrEqual(90);expect(ITEMS.length).toBeGreaterThanOrEqual(125);});});
