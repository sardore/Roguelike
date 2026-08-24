import type { FloorMap, Point, ThemeDefinition, TileKind, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';
import { terrainTile } from './terrain-rules';

type StructureKind =
  | 'grove' | 'ruined-court' | 'reed-basin' | 'crystal-garden' | 'ossuary-aisle'
  | 'fungal-grove' | 'ice-gallery' | 'forge-trench' | 'void-scar' | 'shrine-yard';

export interface StructureStamp { kind: StructureKind; center: Point; radius: number; }

function key(point: Point): string { return `${point.x},${point.y}`; }
function manhattan(a: Point, b: Point): number { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
function inBounds(floor: FloorMap, x: number, y: number, margin = 1): boolean { return x >= margin && y >= margin && x < floor.width - margin && y < floor.height - margin; }
function index(floor: FloorMap, x: number, y: number): number { return y * floor.width + x; }
function isBaseWalkable(floor: FloorMap, x: number, y: number): boolean {
  const tile = floor.tiles[index(floor, x, y)];
  return Boolean(tile?.walkable && tile.kind !== 'lava' && tile.kind !== 'void-rift');
}
function setKind(floor: FloorMap, x: number, y: number, kind: TileKind, reserved: Set<string>): void {
  if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`)) return;
  const current = floor.tiles[index(floor, x, y)];
  if (!current?.walkable && current?.kind !== 'wall') return;
  floor.tiles[index(floor, x, y)] = terrainTile(kind);
}
function carveSafeCross(floor: FloorMap, center: Point, radius: number, reserved: Set<string>): void {
  for (let d = -radius; d <= radius; d += 1) {
    for (const p of [{ x: center.x + d, y: center.y }, { x: center.x, y: center.y + d }]) {
      if (!inBounds(floor, p.x, p.y) || reserved.has(key(p))) continue;
      floor.tiles[index(floor, p.x, p.y)] = terrainTile('floor');
    }
  }
}

function stampGrove(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  for (let y = center.y - radius; y <= center.y + radius; y += 1) for (let x = center.x - radius; x <= center.x + radius; x += 1) {
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    const d = Math.hypot(x - center.x, y - center.y);
    if (d > radius + rng.float() * .6) continue;
    if (d > radius * .52 && rng.chance(.46)) setKind(floor, x, y, 'tree', reserved);
    else if (rng.chance(.78)) setKind(floor, x, y, 'grass', reserved);
  }
  carveSafeCross(floor, center, Math.max(1, radius - 1), reserved);
}

function stampRuinedCourt(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  const w = radius * 2 + 1, h = Math.max(5, radius * 2 - 1);
  for (let y = center.y - Math.floor(h / 2); y <= center.y + Math.floor(h / 2); y += 1) for (let x = center.x - Math.floor(w / 2); x <= center.x + Math.floor(w / 2); x += 1) {
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    const edge = x === center.x - Math.floor(w / 2) || x === center.x + Math.floor(w / 2) || y === center.y - Math.floor(h / 2) || y === center.y + Math.floor(h / 2);
    if (edge && rng.chance(.42)) setKind(floor, x, y, 'pillar', reserved);
    else if (rng.chance(.24)) setKind(floor, x, y, 'rubble', reserved);
    else if (rng.chance(.28)) setKind(floor, x, y, 'grass', reserved);
  }
  carveSafeCross(floor, center, radius, reserved);
}

function stampReedBasin(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  for (let y = center.y - radius; y <= center.y + radius; y += 1) for (let x = center.x - radius; x <= center.x + radius; x += 1) {
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    const d = Math.hypot((x - center.x) * .8, y - center.y);
    if (d > radius) continue;
    if (d < radius * .46 && rng.chance(.72)) setKind(floor, x, y, 'water', reserved);
    else if (rng.chance(.62)) setKind(floor, x, y, 'reed', reserved);
  }
  for (let x = center.x - radius; x <= center.x + radius; x += 1) if (inBounds(floor, x, center.y)) setKind(floor, x, center.y, 'bridge', reserved);
}

function stampCrystalGarden(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  for (let y = center.y - radius; y <= center.y + radius; y += 1) for (let x = center.x - radius; x <= center.x + radius; x += 1) {
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    const d = Math.hypot(x - center.x, y - center.y); if (d > radius) continue;
    if ((x + y) % 2 === 0 && d > 1.5 && rng.chance(.42)) setKind(floor, x, y, 'crystal', reserved);
    else if (rng.chance(.34)) setKind(floor, x, y, 'ice', reserved);
  }
  carveSafeCross(floor, center, radius, reserved);
}

function stampOssuaryAisle(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  const horizontal = rng.chance(.5);
  for (let lane = -2; lane <= 2; lane += 2) for (let d = -radius; d <= radius; d += 1) {
    const x = center.x + (horizontal ? d : lane), y = center.y + (horizontal ? lane : d);
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    if (lane === 0) setKind(floor, x, y, rng.chance(.72) ? 'bones' : 'floor', reserved);
    else if (d % 3 === 0 && rng.chance(.72)) setKind(floor, x, y, 'pillar', reserved);
    else if (rng.chance(.58)) setKind(floor, x, y, 'bones', reserved);
  }
  carveSafeCross(floor, center, 1, reserved);
}

function stampFungalGrove(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  for (let y = center.y - radius; y <= center.y + radius; y += 1) for (let x = center.x - radius; x <= center.x + radius; x += 1) {
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    if (Math.hypot(x - center.x, y - center.y) > radius) continue;
    const roll = rng.float();
    if (roll < .2) setKind(floor, x, y, 'miasma', reserved);
    else if (roll < .76) setKind(floor, x, y, 'fungus', reserved);
    else if (roll < .86) setKind(floor, x, y, 'tree', reserved);
  }
  carveSafeCross(floor, center, 1, reserved);
}

function stampIceGallery(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  for (let y = center.y - radius; y <= center.y + radius; y += 1) for (let x = center.x - radius; x <= center.x + radius; x += 1) {
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    if (Math.abs(x - center.x) + Math.abs(y - center.y) > radius * 1.45) continue;
    setKind(floor, x, y, rng.chance(.12) && Math.abs(x - center.x) > 1 ? 'crystal' : 'ice', reserved);
  }
  carveSafeCross(floor, center, radius, reserved);
}

function stampForgeTrench(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  const horizontal = rng.chance(.5);
  for (let d = -radius; d <= radius; d += 1) {
    for (let width = -1; width <= 1; width += 1) {
      const x = center.x + (horizontal ? d : width), y = center.y + (horizontal ? width : d);
      if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
      setKind(floor, x, y, width === 0 ? 'lava' : (rng.chance(.55) ? 'oil' : 'rubble'), reserved);
    }
  }
  for (const d of [-Math.floor(radius / 2), Math.floor(radius / 2)]) {
    for (let w = -1; w <= 1; w += 1) {
      const x = center.x + (horizontal ? d : w), y = center.y + (horizontal ? w : d);
      setKind(floor, x, y, 'bridge', reserved);
    }
  }
}

function stampVoidScar(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  let cursor = { ...center };
  for (let i = 0; i < radius * 5; i += 1) {
    if (isBaseWalkable(floor, cursor.x, cursor.y) && rng.chance(.78)) setKind(floor, cursor.x, cursor.y, 'void-rift', reserved);
    for (const side of rng.shuffle([{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]).slice(0, 2)) {
      if (rng.chance(.28)) setKind(floor, cursor.x + side.x, cursor.y + side.y, 'rubble', reserved);
    }
    const dir = rng.pick([{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]);
    cursor = { x: Math.max(2, Math.min(floor.width - 3, cursor.x + dir.x)), y: Math.max(2, Math.min(floor.height - 3, cursor.y + dir.y)) };
  }
}

function stampShrineYard(floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>): void {
  for (let y = center.y - radius; y <= center.y + radius; y += 1) for (let x = center.x - radius; x <= center.x + radius; x += 1) {
    if (!inBounds(floor, x, y) || reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    const edge = Math.abs(x - center.x) === radius || Math.abs(y - center.y) === radius;
    if (edge && (x + y) % 2 === 0 && rng.chance(.58)) setKind(floor, x, y, 'pillar', reserved);
    else if (rng.chance(.68)) setKind(floor, x, y, 'holy', reserved);
  }
  carveSafeCross(floor, center, radius, reserved);
}

const STAMPERS: Record<StructureKind, (floor: FloorMap, center: Point, radius: number, rng: DeterministicRng, reserved: Set<string>) => void> = {
  grove: stampGrove,
  'ruined-court': stampRuinedCourt,
  'reed-basin': stampReedBasin,
  'crystal-garden': stampCrystalGarden,
  'ossuary-aisle': stampOssuaryAisle,
  'fungal-grove': stampFungalGrove,
  'ice-gallery': stampIceGallery,
  'forge-trench': stampForgeTrench,
  'void-scar': stampVoidScar,
  'shrine-yard': stampShrineYard,
};

function structurePool(theme: ThemeDefinition): Array<{ value: StructureKind; weight: number }> {
  const tags = new Set(theme.monsterTags), out: Array<{ value: StructureKind; weight: number }> = [];
  const add = (value: StructureKind, weight: number) => out.push({ value, weight });
  add('ruined-court', 1.4);
  if (tags.has('plant')) add('grove', 6);
  if (tags.has('aquatic')) add('reed-basin', 5);
  if (tags.has('crystal')) add('crystal-garden', 6);
  if (tags.has('undead') || tags.has('bone')) add('ossuary-aisle', 5);
  if (tags.has('fungal')) add('fungal-grove', 7);
  if (tags.has('ice')) add('ice-gallery', 7);
  if (tags.has('fire') || tags.has('construct')) add('forge-trench', 4);
  if (tags.has('void') || tags.has('aberrant')) add('void-scar', 6);
  if (tags.has('spirit') || tags.has('royal') || tags.has('humanoid')) add('shrine-yard', 2.2);
  if (tags.has('venom')) { add('reed-basin', 2.2); add('fungal-grove', 1.8); }
  return out;
}

function candidateCenters(floor: FloorMap, reserved: Set<string>): Point[] {
  const out: Point[] = [];
  for (let y = 5; y < floor.height - 5; y += 1) for (let x = 6; x < floor.width - 6; x += 1) {
    if (reserved.has(`${x},${y}`) || !isBaseWalkable(floor, x, y)) continue;
    const point = { x, y };
    if (floor.exits.some((exit) => manhattan(exit, point) < 5) || manhattan(floor.spawn, point) < 6) continue;
    let open = 0;
    for (let dy = -3; dy <= 3; dy += 1) for (let dx = -4; dx <= 4; dx += 1) if (inBounds(floor, x + dx, y + dy) && isBaseWalkable(floor, x + dx, y + dy)) open += 1;
    if (open >= 25) out.push(point);
  }
  return out;
}

export function applyMapStructures(floor: FloorMap, theme: ThemeDefinition, coord: WorldCoord, rng: DeterministicRng, extraReserved: Point[] = []): StructureStamp[] {
  const reserved = new Set<string>([key(floor.spawn), ...floor.exits.map(key), ...extraReserved.map(key)]);
  const centers = rng.shuffle(candidateCenters(floor, reserved));
  const pool = structurePool(theme);
  const target = Math.min(5, 2 + (coord.depth > 18 ? 1 : 0) + (coord.depth > 60 ? 1 : 0) + (rng.chance(.42) ? 1 : 0));
  const stamps: StructureStamp[] = [];
  for (let i = 0; i < target && centers.length; i += 1) {
    const center = centers.shift()!;
    if (stamps.some((stamp) => manhattan(stamp.center, center) < stamp.radius + 6)) { i -= 1; continue; }
    const kind = rng.weighted(pool), radius = rng.int(3, kind === 'void-scar' || kind === 'forge-trench' ? 5 : 6);
    STAMPERS[kind](floor, center, radius, rng.fork(`${kind}-${i}`), reserved);
    stamps.push({ kind, center, radius });
  }
  return stamps;
}
