import { DeterministicRng, deriveSeed } from '../core/rng';
import type { ArchetypeId, FloorExit, FloorMap, Point, Tile, TileKind, ThemeContext, WorldCoord } from '../core/types';

const WALL: Tile = { kind: 'wall', glyph: '#', walkable: false, transparent: false };
const FLOOR: Tile = { kind: 'floor', glyph: '.', walkable: true, transparent: true };
const WATER: Tile = { kind: 'water', glyph: '~', walkable: true, transparent: true };
const BRIDGE: Tile = { kind: 'bridge', glyph: '=', walkable: true, transparent: true };
const RUBBLE: Tile = { kind: 'rubble', glyph: ':', walkable: true, transparent: true };

export const MAP_WIDTH = 57;
export const MAP_HEIGHT = 31;
const MIN_WALKABLE_RATIO = 0.25;
const MAX_WALKABLE_RATIO = 0.49;
const MAX_GENERATION_ATTEMPTS = 18;

interface Rect { x: number; y: number; w: number; h: number; }

class GridBuilder {
  readonly tiles: Tile[];
  constructor(readonly width: number, readonly height: number) { this.tiles = Array.from({ length: width * height }, () => ({ ...WALL })); }
  index(x: number, y: number): number { return y * this.width + x; }
  inBounds(x: number, y: number, margin = 0): boolean { return x >= margin && y >= margin && x < this.width - margin && y < this.height - margin; }
  get(x: number, y: number): Tile { return this.tiles[this.index(x, y)]!; }
  set(x: number, y: number, tile: Tile): void { if (this.inBounds(x, y)) this.tiles[this.index(x, y)] = { ...tile }; }
  setKind(x: number, y: number, kind: TileKind): void { const tile = kind === 'floor' ? FLOOR : kind === 'water' ? WATER : kind === 'bridge' ? BRIDGE : kind === 'rubble' ? RUBBLE : WALL; this.set(x, y, tile); }
  carveRect(rect: Rect, tile: Tile = FLOOR): void { for (let y = rect.y; y < rect.y + rect.h; y += 1) for (let x = rect.x; x < rect.x + rect.w; x += 1) this.set(x, y, tile); }
  carveLine(a: Point, b: Point, tile: Tile = FLOOR): void { let x = a.x, y = a.y; const dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y); while (x !== b.x) { this.set(x, y, tile); x += dx; } while (y !== b.y) { this.set(x, y, tile); y += dy; } this.set(x, y, tile); }
  carveBent(a: Point, b: Point, horizontalFirst: boolean): void { const pivot = horizontalFirst ? { x: b.x, y: a.y } : { x: a.x, y: b.y }; this.carveLine(a, pivot); this.carveLine(pivot, b); }
}

function center(rect: Rect): Point { return { x: Math.floor(rect.x + rect.w / 2), y: Math.floor(rect.y + rect.h / 2) }; }

function roomsBent(builder: GridBuilder, rng: DeterministicRng): void {
  const rooms: Rect[] = [];
  for (let i = 0; i < rng.int(28, 42); i += 1) {
    const w = rng.int(4, 10), h = rng.int(3, 7);
    const rect = { x: rng.int(2, builder.width - w - 3), y: rng.int(2, builder.height - h - 3), w, h };
    if (rooms.some((o) => rect.x - 1 < o.x + o.w && rect.x + rect.w + 1 > o.x && rect.y - 1 < o.y + o.h && rect.y + rect.h + 1 > o.y)) continue;
    builder.carveRect(rect);
    if (rooms.length) builder.carveBent(center(rooms.at(-1)!), center(rect), rng.chance(0.5));
    rooms.push(rect);
    if (rooms.length >= rng.int(8, 13)) break;
  }
}

function bspTight(builder: GridBuilder, rng: DeterministicRng): void {
  const leaves: Rect[] = [{ x: 1, y: 1, w: builder.width - 2, h: builder.height - 2 }];
  for (let pass = 0; pass < 4; pass += 1) {
    const next: Rect[] = [];
    for (const leaf of leaves) {
      const vertical = leaf.w / leaf.h > 1.25 ? true : leaf.h / leaf.w > 1.25 ? false : rng.chance(0.5);
      if (vertical && leaf.w >= 15) { const cut = rng.int(6, leaf.w - 6); next.push({ ...leaf, w: cut }, { x: leaf.x + cut, y: leaf.y, w: leaf.w - cut, h: leaf.h }); }
      else if (!vertical && leaf.h >= 11) { const cut = rng.int(5, leaf.h - 5); next.push({ ...leaf, h: cut }, { x: leaf.x, y: leaf.y + cut, w: leaf.w, h: leaf.h - cut }); }
      else next.push(leaf);
    }
    leaves.splice(0, leaves.length, ...next);
  }
  const rooms = leaves.map((leaf) => {
    const insetX = rng.int(2, Math.max(2, Math.min(4, Math.floor((leaf.w - 4) / 2))));
    const insetY = rng.int(2, Math.max(2, Math.min(3, Math.floor((leaf.h - 3) / 2))));
    const room = { x: leaf.x + insetX, y: leaf.y + insetY, w: Math.max(3, leaf.w - insetX * 2), h: Math.max(3, leaf.h - insetY * 2) };
    builder.carveRect(room); return room;
  });
  const ordered = rng.shuffle(rooms);
  for (let i = 1; i < ordered.length; i += 1) builder.carveBent(center(ordered[i - 1]!), center(ordered[i]!), rng.chance(0.5));
}

function cavernDense(builder: GridBuilder, rng: DeterministicRng): void {
  const open = Array.from({ length: builder.width * builder.height }, () => false);
  for (let y = 1; y < builder.height - 1; y += 1) for (let x = 1; x < builder.width - 1; x += 1) open[y * builder.width + x] = rng.float() > 0.595;
  for (let iteration = 0; iteration < 5; iteration += 1) {
    const next = [...open];
    for (let y = 1; y < builder.height - 1; y += 1) for (let x = 1; x < builder.width - 1; x += 1) {
      let walls = 0;
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) if ((dx || dy) && !open[(y + dy) * builder.width + (x + dx)]) walls += 1;
      next[y * builder.width + x] = walls <= 4;
    }
    open.splice(0, open.length, ...next);
  }
  for (let y = 1; y < builder.height - 1; y += 1) for (let x = 1; x < builder.width - 1; x += 1) if (open[y * builder.width + x]) builder.set(x, y, FLOOR);
  const hubs: Point[] = [];
  for (let i = 0; i < rng.int(5, 8); i += 1) {
    const hub = { x: rng.int(6, builder.width - 7), y: rng.int(5, builder.height - 6) }, rx = rng.int(3, 6), ry = rng.int(2, 4);
    for (let y = hub.y - ry; y <= hub.y + ry; y += 1) for (let x = hub.x - rx; x <= hub.x + rx; x += 1) {
      const normalized = ((x - hub.x) ** 2) / (rx ** 2) + ((y - hub.y) ** 2) / (ry ** 2);
      if (normalized <= 1 + rng.float() * 0.18) builder.set(x, y, FLOOR);
    }
    if (hubs.length) builder.carveBent(hubs.at(-1)!, hub, rng.chance(0.5));
    hubs.push(hub);
  }
}

function mazeChambers(builder: GridBuilder, rng: DeterministicRng): void {
  const start = { x: rng.int(2, Math.floor((builder.width - 5) / 2)) * 2 - 1, y: rng.int(2, Math.floor((builder.height - 5) / 2)) * 2 - 1 };
  const stack = [start], dirs = [{ x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: -2 }]; builder.set(start.x, start.y, FLOOR);
  while (stack.length) {
    const here = stack.at(-1)!;
    const options = rng.shuffle(dirs).filter((d) => builder.inBounds(here.x + d.x, here.y + d.y, 3) && builder.get(here.x + d.x, here.y + d.y).kind === 'wall');
    if (!options.length) { stack.pop(); continue; }
    const d = options[0]!; builder.set(here.x + d.x / 2, here.y + d.y / 2, FLOOR); const next = { x: here.x + d.x, y: here.y + d.y }; builder.set(next.x, next.y, FLOOR); stack.push(next);
  }
  for (let i = 0; i < rng.int(4, 7); i += 1) { const w = rng.int(4, 8), h = rng.int(3, 6); builder.carveRect({ x: rng.int(2, builder.width - w - 3), y: rng.int(2, builder.height - h - 3), w, h }); }
}

function mineTunnels(builder: GridBuilder, rng: DeterministicRng): void {
  const hubs: Point[] = [{ x: Math.floor(builder.width / 2), y: Math.floor(builder.height / 2) }]; builder.carveRect({ x: hubs[0]!.x - 2, y: hubs[0]!.y - 2, w: 5, h: 5 });
  for (let branch = 0; branch < rng.int(13, 18); branch += 1) {
    let cursor = { ...rng.pick(hubs) }; const target = { x: rng.int(3, builder.width - 4), y: rng.int(3, builder.height - 4) };
    for (let step = 0; step < 80 && (cursor.x !== target.x || cursor.y !== target.y); step += 1) {
      const dx = Math.sign(target.x - cursor.x), dy = Math.sign(target.y - cursor.y); if ((rng.chance(0.55) && dx !== 0) || dy === 0) cursor.x += dx; else cursor.y += dy; builder.set(cursor.x, cursor.y, FLOOR);
      if (rng.chance(0.34)) { if (builder.inBounds(cursor.x + 1, cursor.y, 1)) builder.set(cursor.x + 1, cursor.y, FLOOR); if (builder.inBounds(cursor.x - 1, cursor.y, 1)) builder.set(cursor.x - 1, cursor.y, FLOOR); }
    }
    builder.carveRect({ x: cursor.x - 1, y: cursor.y - 1, w: 3, h: 3 }); hubs.push({ ...cursor });
  }
}

function catacomb(builder: GridBuilder, rng: DeterministicRng): void {
  const cells: Point[] = []; const startX = rng.int(2, 4), startY = rng.int(2, 4);
  for (let y = startY; y < builder.height - 5; y += 6) for (let x = startX; x < builder.width - 7; x += 9) if (rng.chance(0.82)) { const w = rng.int(4, 6), h = rng.int(3, 4); builder.carveRect({ x, y, w, h }); cells.push({ x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) }); }
  const shuffled = rng.shuffle(cells); for (let i = 1; i < shuffled.length; i += 1) builder.carveBent(shuffled[i - 1]!, shuffled[i]!, rng.chance(0.5));
}

function riverCut(builder: GridBuilder, rng: DeterministicRng): void {
  roomsBent(builder, rng.fork('rooms')); const vertical = rng.chance(0.5); let cursor = vertical ? rng.int(12, builder.width - 13) : rng.int(8, builder.height - 9); const bridges: Point[] = []; const length = vertical ? builder.height - 2 : builder.width - 2;
  for (let i = 1; i < length; i += 1) { cursor += rng.int(-1, 1); cursor = vertical ? Math.max(4, Math.min(builder.width - 5, cursor)) : Math.max(4, Math.min(builder.height - 5, cursor)); for (let width = -1; width <= 1; width += 1) builder.set(vertical ? cursor + width : i, vertical ? i : cursor + width, WATER); if (i % rng.int(8, 13) === 0) bridges.push(vertical ? { x: cursor, y: i } : { x: i, y: cursor }); }
  for (const bridge of bridges.slice(0, 3)) if (vertical) for (let dx = -2; dx <= 2; dx += 1) builder.set(bridge.x + dx, bridge.y, BRIDGE); else for (let dy = -2; dy <= 2; dy += 1) builder.set(bridge.x, bridge.y + dy, BRIDGE);
}

function ringSanctum(builder: GridBuilder, rng: DeterministicRng): void {
  const cx = Math.floor(builder.width / 2) + rng.int(-3, 3), cy = Math.floor(builder.height / 2) + rng.int(-2, 2);
  for (const radius of [5, 9, 13]) for (let y = 1; y < builder.height - 1; y += 1) for (let x = 1; x < builder.width - 1; x += 1) if (Math.abs(Math.hypot((x - cx) * 0.72, y - cy) - radius) < 1) builder.set(x, y, FLOOR);
  builder.carveRect({ x: cx - 3, y: cy - 2, w: 7, h: 5 });
  for (const d of rng.shuffle([{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]).slice(0, 3)) { let x = cx, y = cy; for (let step = 0; step < 16; step += 1) { builder.set(x, y, FLOOR); x += d.x; y += d.y; if (!builder.inBounds(x, y, 1)) break; } }
  for (let i = 0; i < 5; i += 1) { const w = rng.int(4, 7), h = rng.int(3, 5); builder.carveRect({ x: rng.int(2, builder.width - w - 3), y: rng.int(2, builder.height - h - 3), w, h }); }
}

function fractured(builder: GridBuilder, rng: DeterministicRng): void {
  const hubs: Point[] = [{ x: Math.floor(builder.width / 2), y: Math.floor(builder.height / 2) }]; builder.carveRect({ x: hubs[0]!.x - 2, y: hubs[0]!.y - 1, w: 5, h: 3 });
  for (let i = 0; i < rng.int(12, 16); i += 1) {
    let cursor = { ...rng.pick(hubs) }; const target = { x: rng.int(3, builder.width - 4), y: rng.int(3, builder.height - 4) }, bias = rng.pick([-1, 1]);
    for (let step = 0; step < 70 && (cursor.x !== target.x || cursor.y !== target.y); step += 1) {
      builder.set(cursor.x, cursor.y, FLOOR); if (rng.chance(0.65)) builder.set(cursor.x + bias, cursor.y, FLOOR); if (rng.chance(0.42)) builder.set(cursor.x, cursor.y + bias, FLOOR);
      const dx = Math.sign(target.x - cursor.x), dy = Math.sign(target.y - cursor.y); if (dx && dy) { if (rng.chance(0.5)) cursor.x += dx; else cursor.y += dy; } else if (dx) cursor.x += dx; else if (dy) cursor.y += dy;
      if (rng.chance(0.2)) { cursor.x += rng.int(-1, 1); cursor.y += rng.int(-1, 1); }
      cursor.x = Math.max(2, Math.min(builder.width - 3, cursor.x)); cursor.y = Math.max(2, Math.min(builder.height - 3, cursor.y));
    }
    builder.carveRect({ x: cursor.x - 1, y: cursor.y - 1, w: 3, h: 3 }); hubs.push({ ...cursor });
  }
  for (let i = 0; i < rng.int(7, 11); i += 1) { const origin = rng.pick(hubs), w = rng.int(3, 6), h = rng.int(3, 5); const rect = { x: Math.max(2, Math.min(builder.width - w - 2, origin.x + rng.int(-5, 5))), y: Math.max(2, Math.min(builder.height - h - 2, origin.y + rng.int(-4, 4))), w, h }; builder.carveRect(rect); builder.carveBent(origin, center(rect), rng.chance(0.5)); }
}

const GENERATORS: Record<ArchetypeId, (builder: GridBuilder, rng: DeterministicRng) => void> = { 'rooms-bent': roomsBent, 'bsp-tight': bspTight, 'cavern-dense': cavernDense, 'maze-chambers': mazeChambers, 'mine-tunnels': mineTunnels, catacomb, 'river-cut': riverCut, 'ring-sanctum': ringSanctum, fractured };
function sealBorder(builder: GridBuilder): void { for (let x = 0; x < builder.width; x += 1) { builder.set(x, 0, WALL); builder.set(x, builder.height - 1, WALL); } for (let y = 0; y < builder.height; y += 1) { builder.set(0, y, WALL); builder.set(builder.width - 1, y, WALL); } }
function walkablePoints(builder: GridBuilder): Point[] { const out: Point[] = []; for (let y = 1; y < builder.height - 1; y += 1) for (let x = 1; x < builder.width - 1; x += 1) if (builder.get(x, y).walkable) out.push({ x, y }); return out; }
function connectedFrom(builder: GridBuilder, start: Point): Set<number> { const seen = new Set<number>([builder.index(start.x, start.y)]), queue = [start]; let head = 0; while (head < queue.length) { const p = queue[head++]!; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]] as const) { const x = p.x + dx, y = p.y + dy; if (!builder.inBounds(x, y, 1) || !builder.get(x, y).walkable) continue; const index = builder.index(x, y); if (!seen.has(index)) { seen.add(index); queue.push({ x, y }); } } } return seen; }
function keepLargestComponent(builder: GridBuilder): Point[] { const points = walkablePoints(builder), unvisited = new Set(points.map((p) => builder.index(p.x, p.y))); let largest = new Set<number>(); for (const p of points) { const index = builder.index(p.x, p.y); if (!unvisited.has(index)) continue; const component = connectedFrom(builder, p); for (const member of component) unvisited.delete(member); if (component.size > largest.size) largest = component; } for (const p of points) if (!largest.has(builder.index(p.x, p.y))) builder.set(p.x, p.y, WALL); return walkablePoints(builder); }
function manhattan(a: Point, b: Point): number { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
function farthestPoint(points: Point[], from: Point, excluded: Point[] = []): Point { return points.filter((p) => excluded.every((o) => manhattan(p, o) >= 8)).sort((a,b) => manhattan(b,from)-manhattan(a,from))[0] ?? points[0]!; }
function addRubble(builder: GridBuilder, rng: DeterministicRng): void { for (const p of walkablePoints(builder)) if (rng.chance(0.025)) builder.set(p.x, p.y, RUBBLE); }
function glyphForExit(kind: FloorExit['kind']): string { return kind === 'down' ? '>' : kind === 'drift-left' ? '[' : ']'; }

export function generateFloor(runSeed: number, coord: WorldCoord, themeContext: ThemeContext): FloorMap {
  const archetypes = themeContext.primary.archetypeIds; if (!archetypes.length) throw new Error(`theme ${themeContext.primary.id} has no archetypes`); const baseSeed = deriveSeed(runSeed, coord.depth, coord.lane, themeContext.primary.id);
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const rng = new DeterministicRng(deriveSeed(baseSeed, attempt)), archetypeId = rng.pick(archetypes), generator = GENERATORS[archetypeId]; if (!generator) throw new Error(`unknown archetype: ${archetypeId}`);
    const builder = new GridBuilder(MAP_WIDTH, MAP_HEIGHT); generator(builder, rng.fork('layout')); sealBorder(builder); const connected = keepLargestComponent(builder); if (connected.length < 90) continue; addRubble(builder, rng.fork('detail'));
    const walkableRatio = connected.length / ((MAP_WIDTH - 2) * (MAP_HEIGHT - 2)); if (walkableRatio < MIN_WALKABLE_RATIO || walkableRatio > MAX_WALKABLE_RATIO) continue;
    const spawn = rng.pick(connected), down = farthestPoint(connected, spawn), left = farthestPoint(connected, down, [spawn]), right = farthestPoint(connected, left, [spawn, down]);
    const exits: FloorExit[] = [{ ...down, kind:'down', glyph:glyphForExit('down') },{ ...left, kind:'drift-left', glyph:glyphForExit('drift-left') },{ ...right, kind:'drift-right', glyph:glyphForExit('drift-right') }];
    return { width: MAP_WIDTH, height: MAP_HEIGHT, tiles: builder.tiles.map((tile) => ({ ...tile })), spawn, exits, generation: { seed: baseSeed, archetypeId, attempt, walkableRatio } };
  }
  throw new Error(`unable to generate valid floor for depth=${coord.depth} lane=${coord.lane}`);
}
export function tileAt(map: FloorMap, x: number, y: number): Tile | undefined { if (x < 0 || y < 0 || x >= map.width || y >= map.height) return undefined; return map.tiles[y * map.width + x]; }
export function exitAt(map: FloorMap, x: number, y: number): FloorExit | undefined { return map.exits.find((exit) => exit.x === x && exit.y === y); }
export function floodReachableCount(map: FloorMap): number { const builder = new GridBuilder(map.width, map.height); for (let i = 0; i < map.tiles.length; i += 1) builder.tiles[i] = { ...map.tiles[i]! }; return connectedFrom(builder, map.spawn).size; }
