import { describe, expect, it } from 'vitest';
import { assertGameInvariants, createNewGame, dispatchAction } from '../src/core/game';
import { tileAt } from '../src/world/generation';
import type { Point } from '../src/core/types';

function openNeighbor(state: ReturnType<typeof createNewGame>['state']): Point {
  const candidates = [
    { x: state.player.x + 1, y: state.player.y },
    { x: state.player.x - 1, y: state.player.y },
    { x: state.player.x, y: state.player.y + 1 },
    { x: state.player.x, y: state.player.y - 1 },
  ];
  const found = candidates.find((point) => tileAt(state.floor, point.x, point.y)?.walkable);
  if (!found) throw new Error('test seed has no walkable neighbor');
  return found;
}

describe('canonical gameplay pipeline', () => {
  it('preserves item identity when ground loot enters inventory', () => {
    const { state } = createNewGame('identity-pickup');
    state.monsters = [];
    const target = openNeighbor(state);
    state.items = [{ id: 'ground-identity', defId: 'rust-knife', ...target }];
    const result = dispatchAction(state, { type: 'move', dx: target.x - state.player.x, dy: target.y - state.player.y });
    expect(result.accepted).toBe(true);
    expect(state.player.inventory).toContainEqual({ id: 'ground-identity', defId: 'rust-knife' });
    expect(state.items).toHaveLength(0);
    expect(() => assertGameInvariants(state)).not.toThrow();
  });

  it('equips through the same action path and spends a turn', () => {
    const { state } = createNewGame('equip-action');
    state.monsters = [];
    state.player.inventory.push({ id: 'weapon-1', defId: 'rust-knife' });
    const result = dispatchAction(state, { type: 'use-item', itemId: 'weapon-1' });
    expect(result.accepted).toBe(true);
    expect(state.player.equippedWeaponId).toBe('weapon-1');
    expect(state.turn).toBe(1);
    expect(() => assertGameInvariants(state)).not.toThrow();
  });

  it('does not consume an offensive item when there is no valid target', () => {
    const { state } = createNewGame('target-policy');
    state.monsters = [];
    state.player.inventory.push({ id: 'bottle-1', defId: 'storm-bottle' });
    const result = dispatchAction(state, { type: 'use-item', itemId: 'bottle-1' });
    expect(result.accepted).toBe(false);
    expect(state.player.inventory.some((item) => item.id === 'bottle-1')).toBe(true);
    expect(state.turn).toBe(0);
  });

  it('ticks reusable status definitions rather than monster-specific branches', () => {
    const { state } = createNewGame('status-tick');
    state.monsters = [];
    state.player.statuses.push({ id: 'poisoned', duration: 3, magnitude: 1 });
    const hp = state.player.hp;
    dispatchAction(state, { type: 'wait' });
    expect(state.player.hp).toBe(hp - 1);
    expect(state.player.statuses.find((status) => status.id === 'poisoned')?.duration).toBe(2);
  });

  it('keeps fog-of-war bounded and survives a deterministic abuse sequence', () => {
    const { state } = createNewGame('long-run-invariants');
    expect(state.visible.length).toBeGreaterThan(0);
    expect(state.visible.length).toBeLessThan(state.floor.width * state.floor.height);
    const actions = [
      { type: 'move', dx: 1, dy: 0 },
      { type: 'move', dx: 0, dy: 1 },
      { type: 'move', dx: -1, dy: 0 },
      { type: 'wait' },
      { type: 'move', dx: 0, dy: -1 },
    ] as const;
    for (let i = 0; i < 250 && !state.gameOver; i += 1) {
      dispatchAction(state, actions[i % actions.length]!);
      expect(() => assertGameInvariants(state)).not.toThrow();
    }
  });
});
