import { describe, expect, it } from 'vitest';
import { createNewGame, dispatchAction, assertGameInvariants } from '../src/core/game';
import { itemTooltip } from '../src/i18n';
import { itemById } from '../src/content/items';
import { generateFloor } from '../src/world/generation';
import { resolveThemeContext } from '../src/world/themes';
import { generateSites, servicePrice } from '../src/world/sites';
import { DeterministicRng, deriveSeed } from '../src/core/rng';
import type { NonCombatSite, WorldCoord } from '../src/core/types';

function merchantAtPlayer(state: ReturnType<typeof createNewGame>['state']): NonCombatSite {
  return {
    id: 'test-merchant',
    kind: 'merchant',
    x: state.player.x,
    y: state.player.y,
    settlementId: 'test-town',
    settlementName: 'Test Market',
    stock: [{ id: 'shop-identity', defId: 'rust-knife', price: 11 }],
    usedServices: [],
  };
}

describe('non-combat world systems', () => {
  it('can generate a real multi-service mining settlement in the same floor framework', () => {
    const coord: WorldCoord = { depth: 6, lane: 2 };
    const context = resolveThemeContext(coord);
    expect(context.primary.id).toBe('ember-mine');
    const runSeed = 424242;
    const floor = generateFloor(runSeed, coord, context);
    const sites = generateSites(floor, context.primary, coord, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'sites')));
    const settlement = sites.filter((site) => site.settlementId);
    expect(settlement.length).toBeGreaterThanOrEqual(4);
    expect(settlement.some((site) => site.kind === 'town-square')).toBe(true);
    expect(settlement.some((site) => site.kind === 'merchant')).toBe(true);
    expect(new Set(settlement.map((site) => site.settlementId)).size).toBe(1);
  });

  it('moves the same shop stock identity into inventory through the canonical action path', () => {
    const { state } = createNewGame('trade-identity');
    state.monsters = [];
    state.features = [];
    state.sites = [merchantAtPlayer(state)];
    state.player.gold = 30;
    const beforeTurn = state.turn;
    const result = dispatchAction(state, { type: 'site-service', siteId: 'test-merchant', service: 'buy', offerId: 'shop-identity' });
    expect(result.accepted).toBe(true);
    expect(state.player.gold).toBe(19);
    expect(state.player.inventory).toContainEqual({ id: 'shop-identity', defId: 'rust-knife' });
    expect(state.sites[0]?.stock).toHaveLength(0);
    expect(state.turn).toBe(beforeTurn + 1);
    expect(() => assertGameInvariants(state)).not.toThrow();
  });

  it('charges for healing and never allows negative gold', () => {
    const { state } = createNewGame('healer-service');
    state.monsters = [];
    state.features = [];
    state.player.hp = 9;
    state.player.gold = servicePrice('heal');
    state.sites = [{ id: 'healer', kind: 'healer', x: state.player.x, y: state.player.y, stock: [], usedServices: [] }];
    expect(dispatchAction(state, { type: 'site-service', siteId: 'healer', service: 'heal' }).accepted).toBe(true);
    expect(state.player.hp).toBe(state.player.maxHp);
    expect(state.player.gold).toBe(0);
    expect(() => assertGameInvariants(state)).not.toThrow();
  });

  it('provides Korean item tooltips without leaking an unidentified mystery effect', () => {
    const { state } = createNewGame('tooltip-ko');
    const known = itemTooltip(state, itemById('rust-knife'), 'ko');
    expect(known.name).toBe('녹슨 단검');
    expect(known.category).toBe('무기');
    expect(known.effects.join(' ')).toContain('피해');

    const mystery = itemById('murky-restorative');
    const unknown = itemTooltip(state, mystery, 'ko');
    expect(unknown.unknown).toBe(true);
    expect(unknown.effects.join(' ')).not.toContain('8');
  });
});
