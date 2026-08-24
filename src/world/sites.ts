import type { FloorMap, NonCombatSite, Point, SiteKind, SiteServiceKind, ThemeDefinition, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';
import { ITEMS } from '../content/items';

export interface SiteDefinition {
  kind: SiteKind;
  glyph: string;
  color: string;
  services: SiteServiceKind[];
  settlementWeight: number;
  roadsideWeight: number;
}

const SITE_DEFS: SiteDefinition[] = [
  { kind: 'town-square', glyph: 'T', color: '#d5c59b', services: ['rumor'], settlementWeight: 1, roadsideWeight: 0 },
  { kind: 'merchant', glyph: '$', color: '#e3c36f', services: ['buy', 'sell'], settlementWeight: 6, roadsideWeight: 2 },
  { kind: 'healer', glyph: '+', color: '#8fc5a0', services: ['heal', 'cleanse'], settlementWeight: 4, roadsideWeight: 1 },
  { kind: 'appraiser', glyph: '?', color: '#b9a5d6', services: ['identify'], settlementWeight: 4, roadsideWeight: 1 },
  { kind: 'cartographer', glyph: '%', color: '#8db7cc', services: ['map'], settlementWeight: 3, roadsideWeight: 1 },
  { kind: 'shrine', glyph: '_', color: '#d7cfaf', services: ['bless'], settlementWeight: 3, roadsideWeight: 2 },
  { kind: 'camp', glyph: 'c', color: '#c49974', services: ['rest'], settlementWeight: 3, roadsideWeight: 3 },
];

const byKind = new Map(SITE_DEFS.map((def) => [def.kind, def]));
export const SITE_DEFINITIONS = SITE_DEFS;
export function siteDefinition(kind: SiteKind): SiteDefinition {
  const found = byKind.get(kind);
  if (!found) throw new Error(`unknown site kind: ${kind}`);
  return found;
}

function pointKey(point: Point): string { return `${point.x},${point.y}`; }
function manhattan(a: Point, b: Point): number { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

function itemPrice(defId: string): number {
  const def = ITEMS.find((item) => item.id === defId);
  if (!def) return 8;
  const category = def.category === 'relic' ? 18 : def.category === 'weapon' || def.category === 'armor' ? 9 : def.category === 'tool' ? 7 : 5;
  return category + def.rarity * 7 + Math.max(0, def.effects.length - 1) * 3;
}
export function buyPrice(defId: string): number { return itemPrice(defId); }
export function sellPrice(defId: string): number { return Math.max(2, Math.floor(itemPrice(defId) * 0.42)); }

export function servicePrice(service: SiteServiceKind): number {
  if (service === 'heal') return 8;
  if (service === 'cleanse') return 10;
  if (service === 'identify') return 6;
  if (service === 'map') return 7;
  if (service === 'bless') return 9;
  if (service === 'rest') return 4;
  return 0;
}

function weightedStock(theme: ThemeDefinition, rng: DeterministicRng) {
  return rng.weighted(ITEMS.filter((def) => def.category !== 'relic' || def.rarity <= 4).map((def) => {
    let weight = 1 / Math.max(1, def.rarity);
    if (def.tags.some((tag) => theme.monsterTags.includes(tag))) weight *= 2.3;
    if (def.category === 'consumable' || def.category === 'tool') weight *= 1.25;
    return { value: def, weight };
  }));
}

function stockFor(theme: ThemeDefinition, rng: DeterministicRng) {
  const seen = new Set<string>();
  const stock: NonCombatSite['stock'] = [];
  for (let attempts = 0; attempts < 40 && stock.length < rng.int(5, 8); attempts += 1) {
    const def = weightedStock(theme, rng);
    if (seen.has(def.id)) continue;
    seen.add(def.id);
    stock.push({ id: `shop-${rng.nextU32().toString(36)}-${stock.length}`, defId: def.id, price: buyPrice(def.id) });
  }
  return stock;
}

const SETTLEMENT_NAMES: Record<string, string[]> = {
  'moss-cistern': ['Mossward', 'Green Valve', 'Cistern Row'],
  'drowned-aqueduct': ['Lockside', 'Silt Market', 'Floodgate Ward'],
  'ember-mine': ['Cinderpick', 'Lampdeep', 'Blackvein Camp'],
  'fungal-vault': ['Sporerest', 'Shelf Hollow', 'Mushroom Court'],
  'ossuary-terraces': ['Bone Ledger', 'Pale Terrace', 'Charnel Rest'],
  ironwarren: ['Rivet Row', 'Chainmarket', 'Hammer Ward'],
  'crystal-hollows': ['Prism Rest', 'Glass Quarter', 'Facet Camp'],
  'venom-fen': ['Reedhook', 'Fenpost', 'Bitterbank'],
  'storm-archive': ['Index Court', 'Copper Desk', 'Archive Annex'],
  'ash-cathedral': ['Cinder Parish', 'Ash Steps', 'Bell Ward'],
  'flesh-cloister': ['Red Cloister', 'Pulse Yard', 'Vein Rest'],
  'clockwork-necropolis': ['Last Gear Row', 'Pendulum Market', 'Mortuary Yard'],
  'frozen-observatory': ['Rime Station', 'Lens Camp', 'Northwatch'],
  'sunken-palace': ['Pearl Arcade', 'Tide Court', 'Drowned Bazaar'],
  'void-garden': ['Quiet Hedge', 'Star Orchard', 'Night Plot'],
  'royal-chasm': ['Crown Refuge', 'Banner Row', 'Lion Gate'],
  'dream-prison': ['Waking Yard', 'Door Market', 'Sleepless Rest'],
  'star-forge': ['Spark Quarter', 'Anvil Camp', 'Core Bazaar'],
};
function settlementName(theme: ThemeDefinition, rng: DeterministicRng): string {
  return rng.pick(SETTLEMENT_NAMES[theme.id] ?? ['Deep Refuge', 'Wayfarer Row', 'Stone Market']);
}

function availablePoints(floor: FloorMap): Point[] {
  const reserved = new Set([pointKey(floor.spawn), ...floor.exits.map(pointKey)]);
  const out: Point[] = [];
  for (let index = 0; index < floor.tiles.length; index += 1) {
    const tile = floor.tiles[index]!;
    if (!tile.walkable || tile.kind === 'water' || tile.kind === 'lava') continue;
    const point = { x: index % floor.width, y: Math.floor(index / floor.width) };
    if (reserved.has(pointKey(point)) || manhattan(point, floor.spawn) < 6 || floor.exits.some((exit) => manhattan(point, exit) < 4)) continue;
    out.push(point);
  }
  return out;
}

function chooseTownCluster(floor: FloorMap, rng: DeterministicRng): Point[] {
  const points = availablePoints(floor);
  const pointSet = new Set(points.map(pointKey));
  const centers = rng.shuffle(points).filter((center) => {
    let count = 0;
    for (let y = center.y - 3; y <= center.y + 3; y += 1) for (let x = center.x - 3; x <= center.x + 3; x += 1) {
      if (Math.abs(x - center.x) + Math.abs(y - center.y) <= 3 && pointSet.has(`${x},${y}`)) count += 1;
    }
    return count >= 12;
  });
  const center = centers[0];
  if (!center) return [];
  const nearby = points.filter((point) => manhattan(point, center) <= 3 && pointKey(point) !== pointKey(center));
  return [center, ...rng.shuffle(nearby)];
}

function pickSettlementKinds(rng: DeterministicRng, count: number): SiteKind[] {
  const out: SiteKind[] = ['town-square', 'merchant'];
  const candidates = SITE_DEFS.filter((def) => !out.includes(def.kind) && def.settlementWeight > 0);
  while (out.length < count && candidates.length) {
    const picked = rng.weighted(candidates.map((def) => ({ value: def, weight: def.settlementWeight })));
    out.push(picked.kind);
    candidates.splice(candidates.indexOf(picked), 1);
  }
  return out;
}

function civilizationAffinity(theme: ThemeDefinition): number {
  let affinity = 0;
  if (theme.monsterTags.includes('humanoid')) affinity += 1;
  if (theme.monsterTags.includes('construct')) affinity += 1;
  if (theme.monsterTags.includes('undead')) affinity += 0.25;
  if (theme.monsterTags.includes('aberrant') || theme.monsterTags.includes('void')) affinity -= 0.7;
  return affinity;
}
function settlementChance(theme: ThemeDefinition, coord: WorldCoord): number {
  const affinity = civilizationAffinity(theme);
  let chance = 0.10 + Math.max(0, affinity) * 0.08;
  if (theme.monsterTags.includes('plant') || theme.monsterTags.includes('fungal') || theme.monsterTags.includes('aquatic')) chance += 0.04;
  if (coord.depth % 12 === 0) chance += 0.10;
  chance -= Math.max(0, -affinity) * 0.06;
  return Math.max(0.04, Math.min(0.42, chance));
}
function isHubDepth(theme: ThemeDefinition, coord: WorldCoord): boolean {
  return coord.depth % 15 === 6 && civilizationAffinity(theme) >= 1;
}

export function generateSites(floor: FloorMap, theme: ThemeDefinition, coord: WorldCoord, rng: DeterministicRng): NonCombatSite[] {
  if (theme.id === 'abyss') return [];
  const out: NonCombatSite[] = [];
  const used = new Set<string>();
  const shouldHaveSettlement = isHubDepth(theme, coord) || rng.chance(settlementChance(theme, coord));
  const cluster = shouldHaveSettlement ? chooseTownCluster(floor, rng) : [];
  if (cluster.length >= 4) {
    const settlementId = `settlement-${coord.depth}-${coord.lane}-${rng.nextU32().toString(36)}`;
    const name = settlementName(theme, rng);
    const count = Math.min(cluster.length, rng.int(4, 6));
    const kinds = pickSettlementKinds(rng, count);
    for (let i = 0; i < kinds.length; i += 1) {
      const point = cluster[i]!;
      const kind = kinds[i]!;
      used.add(pointKey(point));
      out.push({ id: `site-${rng.nextU32().toString(36)}-${i}`, kind, ...point, settlementId, settlementName: name, stock: kind === 'merchant' ? stockFor(theme, rng.fork(`shop-${i}`)) : [], usedServices: [] });
    }
  }

  if (rng.chance(0.32)) {
    const candidates = rng.shuffle(availablePoints(floor)).filter((point) => !used.has(pointKey(point)) && out.every((site) => manhattan(site, point) > 5));
    const count = rng.chance(0.25) ? 2 : 1;
    for (let i = 0; i < count; i += 1) {
      const point = candidates.shift();
      if (!point) break;
      const def = rng.weighted(SITE_DEFS.filter((entry) => entry.roadsideWeight > 0).map((entry) => ({ value: entry, weight: entry.roadsideWeight })));
      out.push({ id: `road-${rng.nextU32().toString(36)}-${i}`, kind: def.kind, ...point, stock: def.kind === 'merchant' ? stockFor(theme, rng.fork(`road-shop-${i}`)) : [], usedServices: [] });
    }
  }
  return out;
}

export function siteAt(sites: NonCombatSite[], x: number, y: number): NonCombatSite | undefined {
  return sites.find((site) => site.x === x && site.y === y);
}
