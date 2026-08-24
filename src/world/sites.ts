import type { FloorMap, NonCombatSite, Point, SiteKind, SiteServiceKind, ThemeDefinition, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';
import { ITEMS } from '../content/items';
import { stampSettlement } from './settlement-layout';

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
  { kind: 'provisioner', glyph: '%', color: '#d5aa72', services: ['buy', 'sell', 'meal'], settlementWeight: 5, roadsideWeight: 2 },
  { kind: 'healer', glyph: '+', color: '#8fc5a0', services: ['heal', 'cleanse'], settlementWeight: 4, roadsideWeight: 1 },
  { kind: 'appraiser', glyph: '?', color: '#b9a5d6', services: ['identify'], settlementWeight: 4, roadsideWeight: 1 },
  { kind: 'cartographer', glyph: '¶', color: '#8db7cc', services: ['map'], settlementWeight: 3, roadsideWeight: 1 },
  { kind: 'shrine', glyph: '_', color: '#d7cfaf', services: ['bless','devote','invoke'], settlementWeight: 3, roadsideWeight: 2 },
  { kind: 'camp', glyph: 'c', color: '#c49974', services: ['rest'], settlementWeight: 3, roadsideWeight: 3 },
  { kind: 'trainer', glyph: '&', color: '#cb9470', services: ['train-attack','train-defense','train-vigor'], settlementWeight: 3, roadsideWeight: 0 },
  { kind: 'inn', glyph: 'I', color: '#d2b18a', services: ['inn-rest','meal'], settlementWeight: 4, roadsideWeight: 1 },
  { kind: 'guildhall', glyph: 'G', color: '#9fb6d6', services: ['contract','claim-contract'], settlementWeight: 3, roadsideWeight: 0 },
  { kind: 'smithy', glyph: 'F', color: '#d49a70', services: ['temper-weapon','temper-armor','uncurse'], settlementWeight: 3, roadsideWeight: 0 },
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
  if (def.tags.includes('food')) return 3 + def.rarity * 3;
  if (def.tags.includes('ammo')) return 4 + def.rarity * 4;
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
  if (service === 'meal') return 5;
  if (service === 'inn-rest') return 12;
  if (service === 'train-attack' || service === 'train-defense') return 45;
  if (service === 'train-vigor') return 40;
  if (service === 'temper-weapon' || service === 'temper-armor') return 28;
  if (service === 'uncurse') return 18;
  return 0;
}

function weightedStock(theme: ThemeDefinition, rng: DeterministicRng, mode:'general'|'food'='general') {
  let pool=ITEMS.filter((def) => def.category !== 'relic' || def.rarity <= 4);
  if(mode==='food') pool=pool.filter((def)=>def.tags.includes('food')||def.tags.includes('ammo')||def.tags.includes('medicine'));
  else pool=pool.filter((def)=>!def.tags.includes('food')||def.rarity>=3);
  return rng.weighted(pool.map((def) => {
    let weight = 1 / Math.max(1, def.rarity);
    if (def.tags.some((tag) => theme.monsterTags.includes(tag))) weight *= 2.3;
    if (def.category === 'consumable' || def.category === 'tool') weight *= 1.25;
    if(mode==='food'&&def.tags.includes('food'))weight*=2.2;
    return { value: def, weight };
  }));
}

function stockFor(theme: ThemeDefinition, rng: DeterministicRng, mode:'general'|'food'='general') {
  const seen = new Set<string>();
  const stock: NonCombatSite['stock'] = [];
  const target=rng.int(mode==='food'?6:5,mode==='food'?10:8);
  for (let attempts = 0; attempts < 60 && stock.length < target; attempts += 1) {
    const def = weightedStock(theme, rng, mode);
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
function settlementName(theme: ThemeDefinition, rng: DeterministicRng): string { return rng.pick(SETTLEMENT_NAMES[theme.id] ?? ['Deep Refuge', 'Wayfarer Row', 'Stone Market']); }

function availablePoints(floor: FloorMap): Point[] {
  const reserved = new Set([pointKey(floor.spawn), ...floor.exits.map(pointKey)]);
  const out: Point[] = [];
  for (let index = 0; index < floor.tiles.length; index += 1) {
    const tile = floor.tiles[index]!;
    if (!tile.walkable || ['water','lava','miasma','void-rift','bramble'].includes(tile.kind)) continue;
    const point = { x: index % floor.width, y: Math.floor(index / floor.width) };
    if (reserved.has(pointKey(point)) || manhattan(point, floor.spawn) < 6 || floor.exits.some((exit) => manhattan(point, exit) < 4)) continue;
    out.push(point);
  }
  return out;
}

function pickSettlementKinds(rng: DeterministicRng, count: number): SiteKind[] {
  const out: SiteKind[] = ['merchant'];
  if(count>=4&&rng.chance(.8))out.push('provisioner');
  const candidates = SITE_DEFS.filter((def) => def.kind!=='town-square'&&!out.includes(def.kind) && def.settlementWeight > 0);
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
  let chance = 0.12 + Math.max(0, affinity) * 0.08;
  if (theme.monsterTags.includes('plant') || theme.monsterTags.includes('fungal') || theme.monsterTags.includes('aquatic')) chance += 0.04;
  if (coord.depth % 10 === 0) chance += 0.13;
  chance -= Math.max(0, -affinity) * 0.06;
  return Math.max(0.05, Math.min(0.46, chance));
}
function isHubDepth(theme: ThemeDefinition, coord: WorldCoord): boolean { return coord.depth % 15 === 6 && civilizationAffinity(theme) >= 1; }

function makeSite(kind:SiteKind,point:Point,id:string,name:string|undefined,settlementId:string|undefined,theme:ThemeDefinition,rng:DeterministicRng):NonCombatSite{
  const stock=kind==='merchant'?stockFor(theme,rng.fork(`${id}-stock`),'general'):kind==='provisioner'?stockFor(theme,rng.fork(`${id}-food`),'food'):[];
  return{id,kind,...point,...(settlementId?{settlementId}:{}),...(name?{settlementName:name}:{}),stock,usedServices:[]};
}

export function generateSites(floor: FloorMap, theme: ThemeDefinition, coord: WorldCoord, rng: DeterministicRng): NonCombatSite[] {
  if (theme.id === 'abyss') return [];
  const out: NonCombatSite[] = [];
  const used = new Set<string>();
  const shouldHaveSettlement = isHubDepth(theme, coord) || rng.chance(settlementChance(theme, coord));
  if (shouldHaveSettlement) {
    const totalSites=rng.int(5,8);
    const plan=stampSettlement(floor,theme,coord,rng.fork('layout'),totalSites-1);
    if(plan&&plan.points.length>=4){
      const settlementId = `settlement-${coord.depth}-${coord.lane}-${rng.nextU32().toString(36)}`;
      const name = settlementName(theme, rng);
      out.push(makeSite('town-square',plan.square,`square-${rng.nextU32().toString(36)}`,name,settlementId,theme,rng));
      used.add(pointKey(plan.square));
      const kinds=pickSettlementKinds(rng,Math.min(plan.points.length,totalSites-1));
      for(let index=0;index<kinds.length;index+=1){
        const point=plan.points[index]!;const kind=kinds[index]!;used.add(pointKey(point));
        out.push(makeSite(kind,point,`site-${rng.nextU32().toString(36)}-${index}`,name,settlementId,theme,rng));
      }
    }
  }
  if (rng.chance(0.4)) {
    const candidates = rng.shuffle(availablePoints(floor)).filter((point) => !used.has(pointKey(point)) && out.every((site) => manhattan(site, point) > 5));
    const count = rng.chance(0.3) ? 2 : 1;
    for (let index = 0; index < count; index += 1) {
      const point = candidates.shift(); if (!point) break;
      const def = rng.weighted(SITE_DEFS.filter((entry) => entry.roadsideWeight > 0).map((entry) => ({ value: entry, weight: entry.roadsideWeight })));
      out.push(makeSite(def.kind,point,`road-${rng.nextU32().toString(36)}-${index}`,undefined,undefined,theme,rng));
    }
  }
  return out;
}

export function siteAt(sites: NonCombatSite[], x: number, y: number): NonCombatSite | undefined { return sites.find((site) => site.x === x && site.y === y); }
