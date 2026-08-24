import type { DungeonFeature, DungeonFeatureKind, FloorMap, Point, ThemeDefinition } from '../core/types';
import { DeterministicRng } from '../core/rng';

export interface FeatureDefinition {
  kind: DungeonFeatureKind;
  glyph: string;
  color: string;
  hidden: boolean;
  repeatable: boolean;
  label: string;
  tags: string[];
}

const defs: FeatureDefinition[] = [
  { kind: 'spike-trap', glyph: '^', color: '#b77f75', hidden: true, repeatable: true, label: 'spike trap', tags: ['trap','physical'] },
  { kind: 'snare-rune', glyph: '^', color: '#aaa07c', hidden: true, repeatable: false, label: 'snare rune', tags: ['trap','control'] },
  { kind: 'teleport-rune', glyph: '^', color: '#a78ac7', hidden: true, repeatable: true, label: 'teleport rune', tags: ['trap','void'] },
  { kind: 'alarm-rune', glyph: '^', color: '#c58b72', hidden: true, repeatable: false, label: 'alarm rune', tags: ['trap','summon'] },
  { kind: 'healing-spring', glyph: '{', color: '#74b8b4', hidden: false, repeatable: false, label: 'healing spring', tags: ['boon','water'] },
  { kind: 'warding-altar', glyph: '_', color: '#d0c79f', hidden: false, repeatable: false, label: 'warding altar', tags: ['boon','ward'] },
  { kind: 'unstable-cache', glyph: '&', color: '#c8a76d', hidden: false, repeatable: false, label: 'unstable cache', tags: ['loot'] },
];

const byKind = new Map(defs.map((def) => [def.kind, def]));
export const FEATURE_DEFS = defs;
export function featureDefinition(kind: DungeonFeatureKind): FeatureDefinition {
  const found = byKind.get(kind);
  if (!found) throw new Error(`unknown feature: ${kind}`);
  return found;
}

function pointKey(point: Point): string { return `${point.x},${point.y}`; }

function weightedKinds(theme: ThemeDefinition): Array<{ value: DungeonFeatureKind; weight: number }> {
  const tags = new Set(theme.monsterTags);
  return defs.map((def) => {
    let weight = def.hidden ? 3 : 1.2;
    if (def.kind === 'healing-spring' && (tags.has('aquatic') || tags.has('plant') || tags.has('fungal'))) weight *= 1.8;
    if (def.kind === 'teleport-rune' && (tags.has('spirit') || tags.has('aberrant') || tags.has('caster'))) weight *= 1.7;
    if (def.kind === 'alarm-rune' && (tags.has('undead') || tags.has('construct'))) weight *= 1.5;
    if (def.kind === 'snare-rune' && (tags.has('plant') || tags.has('venom'))) weight *= 1.6;
    if (def.kind === 'unstable-cache' && tags.has('humanoid')) weight *= 1.4;
    return { value: def.kind, weight };
  });
}

export function generateFeatures(floor: FloorMap, theme: ThemeDefinition, rng: DeterministicRng): DungeonFeature[] {
  const reserved = new Set<string>([pointKey(floor.spawn), ...floor.exits.map(pointKey)]);
  const candidates: Point[] = [];
  for (let index = 0; index < floor.tiles.length; index += 1) {
    const tile = floor.tiles[index]!;
    if (!tile.walkable || tile.kind === 'lava') continue;
    const point = { x: index % floor.width, y: Math.floor(index / floor.width) };
    if (reserved.has(pointKey(point))) continue;
    const spawnDistance = Math.abs(point.x - floor.spawn.x) + Math.abs(point.y - floor.spawn.y);
    if (spawnDistance < 5) continue;
    candidates.push(point);
  }
  const shuffled = rng.shuffle(candidates);
  const targetCount = Math.min(shuffled.length, rng.int(4, 7));
  const out: DungeonFeature[] = [];
  const weights = weightedKinds(theme);
  for (let i = 0; i < targetCount; i += 1) {
    const point = shuffled.pop();
    if (!point) break;
    const kind = rng.weighted(weights);
    const def = featureDefinition(kind);
    out.push({ id: `f-${rng.nextU32().toString(36)}-${i}`, kind, ...point, revealed: !def.hidden, spent: false });
  }
  return out;
}

export function featureAt(features: DungeonFeature[], x: number, y: number): DungeonFeature | undefined {
  return features.find((feature) => feature.x === x && feature.y === y && !feature.spent);
}
