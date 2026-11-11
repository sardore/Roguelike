import { describe, expect, it } from 'vitest';
import { assertGameInvariants, createNewGame, dispatchAction } from '../src/core/game';
import { encumbranceStage, hungerPercent, inventoryWeight } from '../src/core/foundations';
import { ORIGINS } from '../src/content/origins';

describe('live-run smoke coverage', () => {
  it('can render derived HUD state and accept a first turn across many seeds and origins', () => {
    for (const origin of ORIGINS) {
      for (let seed = 0; seed < 160; seed += 1) {
        const seedText = `runtime-${origin.id}-${seed}`;
        const { state } = createNewGame(seedText, origin.id);
        for (const site of state.sites) {
          const tile = state.floor.tiles[site.y * state.floor.width + site.x];
          expect(tile?.walkable, `${seedText}: ${site.id}/${site.kind} at ${site.x},${site.y} is ${tile?.kind ?? 'missing'}`).toBe(true);
        }
        assertGameInvariants(state);
        expect(() => inventoryWeight(state)).not.toThrow();
        expect(() => encumbranceStage(state)).not.toThrow();
        expect(hungerPercent(state)).toBeGreaterThanOrEqual(0);
        const result = dispatchAction(state, { type: 'wait' });
        expect(result.accepted).toBe(true);
        assertGameInvariants(state);
      }
    }
  });

  it('does not strand the player at generation time', () => {
    for (let seed = 0; seed < 500; seed += 1) {
      const { state } = createNewGame(`mobility-${seed}`, 'delver');
      const legal = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => {
        const x = state.player.x + dx;
        const y = state.player.y + dy;
        const tile = state.floor.tiles[y * state.floor.width + x];
        return Boolean(tile?.walkable);
      });
      expect(legal.length, `seed mobility-${seed} has no adjacent walkable tile`).toBeGreaterThan(0);
    }
  });
});