import { describe, expect, it } from 'vitest';
import { ITEMS, itemById } from '../src/content/items';
import { MONSTERS, monsterById } from '../src/content/monsters';
import { THEMES } from '../src/world/themes';
import { createNewGame, dispatchAction } from '../src/core/game';
import { displayItemName, identifyItem } from '../src/core/item-knowledge';
import { monsterDamageMultiplier, playerDamageMultiplier } from '../src/core/combat-rules';
import { tileAt } from '../src/world/generation';
import type { Point } from '../src/core/types';

function safeNeighbor(state: ReturnType<typeof createNewGame>['state']): Point {
  const exits = new Set(state.floor.exits.map((exit) => `${exit.x},${exit.y}`));
  const candidates = [
    { x: state.player.x + 1, y: state.player.y },
    { x: state.player.x - 1, y: state.player.y },
    { x: state.player.x, y: state.player.y + 1 },
    { x: state.player.x, y: state.player.y - 1 },
  ];
  const found = candidates.find((point) => tileAt(state.floor, point.x, point.y)?.walkable && !exits.has(`${point.x},${point.y}`));
  if (!found) throw new Error('test seed has no safe walkable neighbor');
  return found;
}

describe('deep systems volume gates', () => {
  it('ships a materially larger content catalog', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(125);
    expect(MONSTERS.length).toBeGreaterThanOrEqual(90);
    for (const theme of THEMES) {
      const direct = MONSTERS.filter((monster) => monster.tags.includes(`theme:${theme.id}`));
      expect(direct.length, theme.id).toBeGreaterThanOrEqual(5);
    }
    expect(MONSTERS.filter((monster) => monster.tags.includes('theme:abyss')).length).toBeGreaterThanOrEqual(6);
  });

  it('generates systemic dungeon features on every fresh floor', () => {
    const { state } = createNewGame('feature-volume');
    expect(state.schemaVersion).toBe(4);
    expect(state.features.length).toBeGreaterThanOrEqual(4);
    expect(state.features.length).toBeLessThanOrEqual(7);
    for (const feature of state.features) expect(tileAt(state.floor, feature.x, feature.y)?.walkable).toBe(true);
  });

  it('uses run-specific unidentified appearances until an item is learned', () => {
    const { state } = createNewGame('knowledge-a');
    const def = itemById('red-tonic');
    const unknown = displayItemName(state, def);
    expect(unknown).not.toBe(def.name);
    expect(identifyItem(state, def)).toBe(true);
    expect(displayItemName(state, def)).toBe(def.name);
    expect(identifyItem(state, def)).toBe(false);
  });

  it('turns visible dungeon features into actual tactical resources and hazards', () => {
    const { state } = createNewGame('feature-resolution');
    state.monsters = [];
    state.features = [{ id: 'spring-test', kind: 'healing-spring', x: state.player.x, y: state.player.y, revealed: true, spent: false }];
    state.player.hp = 10;
    dispatchAction(state, { type: 'wait' });
    expect(state.player.hp).toBeGreaterThan(10);
    expect(state.features[0]?.spent).toBe(true);

    const target = safeNeighbor(state);
    state.features = [{ id: 'spike-test', kind: 'spike-trap', ...target, revealed: false, spent: false }];
    const hp = state.player.hp;
    dispatchAction(state, { type: 'move', dx: target.x - state.player.x, dy: target.y - state.player.y });
    expect(state.player.hp).toBeLessThan(hp);
    expect(state.features[0]?.revealed).toBe(true);
  });

  it('makes damage type and equipment choice matter', () => {
    const fireCreature = monsterById('ember-mine-furnace-ogre');
    expect(monsterDamageMultiplier(fireCreature, 'fire')).toBeLessThan(1);
    expect(monsterDamageMultiplier(fireCreature, 'shock')).toBeGreaterThanOrEqual(1);

    const { state } = createNewGame('ward-armor');
    state.monsters = [];
    state.player.inventory.push({ id: 'armor-test', defId: 'ash-vestment' });
    dispatchAction(state, { type: 'use-item', itemId: 'armor-test' });
    expect(state.player.equippedArmorId).toBe('armor-test');
    expect(playerDamageMultiplier(state, 'fire')).toBeLessThan(1);
  });
});
