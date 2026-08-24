import { DeterministicRng, deriveSeed, hashString32 } from './rng';
import type {
  ActionResult,
  EffectSpec,
  GameAction,
  GameState,
  GroundItem,
  InventoryItem,
  MonsterEntity,
  Point,
  StatusInstance,
  StoryEvent,
  Tile,
  TileKind,
  WorldCoord,
} from './types';
import { generateFloor, exitAt, tileAt } from '../world/generation';
import { resolveThemeContext } from '../world/themes';
import { MONSTERS, monsterById, monstersForTheme } from '../content/monsters';
import { ITEMS, itemById } from '../content/items';
import { statusById } from '../content/statuses';
import { milestoneEvent, themeDiscoveryEvent } from './story';

const MAX_MESSAGES = 9;
const BASE_VISION = 9;

function id(prefix: string, rng: DeterministicRng): string {
  return `${prefix}-${rng.nextU32().toString(36)}-${rng.nextU32().toString(36)}`;
}
function pushMessage(state: GameState, message: string): void {
  state.messages.push(message);
  if (state.messages.length > MAX_MESSAGES) state.messages.splice(0, state.messages.length - MAX_MESSAGES);
}
function pointKey(point: Point): string { return `${point.x},${point.y}`; }
function manhattan(a: Point, b: Point): number { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
function samePoint(a: Point, b: Point): boolean { return a.x === b.x && a.y === b.y; }

function lineBetween(a: Point, b: Point): Point[] {
  const out: Point[] = [];
  let x0 = a.x, y0 = a.y;
  const x1 = b.x, y1 = b.y;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    out.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
  return out;
}
function hasLineOfSight(state: GameState, a: Point, b: Point): boolean {
  const line = lineBetween(a, b);
  for (let i = 1; i < line.length - 1; i += 1) {
    const point = line[i]!;
    if (!tileAt(state.floor, point.x, point.y)?.transparent) return false;
  }
  return true;
}
function statusMagnitude(statuses: StatusInstance[], field: 'attackDelta' | 'defenseDelta' | 'visionDelta'): number {
  return statuses.reduce((sum, status) => sum + (statusById(status.id)[field] ?? 0) * status.magnitude, 0);
}
function hasStatus(state: GameState, idValue: string): boolean {
  return state.player.statuses.some((status) => status.id === idValue && status.duration > 0);
}
function refreshVisibility(state: GameState): void {
  const radius = Math.max(3, BASE_VISION + statusMagnitude(state.player.statuses, 'visionDelta'));
  const visible = new Set<string>();
  for (let y = Math.max(0, state.player.y - radius); y <= Math.min(state.floor.height - 1, state.player.y + radius); y += 1) {
    for (let x = Math.max(0, state.player.x - radius); x <= Math.min(state.floor.width - 1, state.player.x + radius); x += 1) {
      const dx = x - state.player.x, dy = y - state.player.y;
      if (dx * dx + dy * dy > radius * radius) continue;
      const point = { x, y };
      if (hasLineOfSight(state, state.player, point)) visible.add(pointKey(point));
    }
  }
  state.visible = [...visible];
  const explored = new Set(state.explored);
  for (const key of visible) explored.add(key);
  state.explored = [...explored];
}

function walkableFreePoints(state: GameState): Point[] {
  const occupied = new Set<string>([pointKey(state.player), ...state.floor.exits.map(pointKey)]);
  return state.floor.tiles.flatMap((tile, index) => {
    if (!tile.walkable) return [];
    const point = { x: index % state.floor.width, y: Math.floor(index / state.floor.width) };
    return occupied.has(pointKey(point)) ? [] : [point];
  });
}
function monsterPower(state: GameState): number {
  const base = 1 + Math.floor(Math.max(0, state.coord.depth - 1) / 30);
  if (Math.abs(state.coord.lane) < 4) return base;
  return base + Math.max(1, Math.abs(state.coord.lane) - 3) + Math.floor(state.coord.depth / 20);
}
function weightedItem(state: GameState, rng: DeterministicRng) {
  const context = resolveThemeContext(state.coord);
  return rng.weighted(ITEMS.map((def) => {
    const primaryAffinity = def.tags.some((tag) => context.primary.monsterTags.includes(tag)) ? 1.8 : 1;
    const blendAffinity = context.blend && def.tags.some((tag) => context.blend!.target.monsterTags.includes(tag)) ? 1 + context.blend.weight : 1;
    return { value: def, weight: primaryAffinity * blendAffinity / Math.max(1, def.rarity) };
  }));
}
function chooseMonsterForContext(state: GameState, rng: DeterministicRng) {
  const context = resolveThemeContext(state.coord);
  if (context.blend && rng.chance(context.blend.weight)) {
    return rng.pick(monstersForTheme(context.blend.target, state.coord.depth));
  }
  return rng.pick(monstersForTheme(context.primary, state.coord.depth));
}
function populateFloor(state: GameState, rng: DeterministicRng): void {
  const points = rng.shuffle(walkableFreePoints(state));
  const extraAbyss = Math.abs(state.coord.lane) >= 4 ? Math.min(8, Math.floor(state.coord.depth / 12)) : 0;
  const monsterCount = Math.min(points.length, rng.int(7, 12) + Math.floor(state.coord.depth / 22) + extraAbyss);
  const power = monsterPower(state);
  state.monsters = [];
  for (let i = 0; i < monsterCount; i += 1) {
    const def = chooseMonsterForContext(state, rng), point = points.pop();
    if (!point) break;
    const hpScale = 1 + Math.max(0, power - 1) * 0.14;
    state.monsters.push({ id: id('m', rng), defId: def.id, hp: Math.max(1, Math.round(def.maxHp * hpScale)), statuses: [], power, abilityCooldown: 0, ...point });
  }
  state.items = [];
  for (let i = 0; i < rng.int(3, 6); i += 1) {
    const def = weightedItem(state, rng), point = points.pop();
    if (!point) break;
    state.items.push({ id: id('i', rng), defId: def.id, ...point });
  }
}
function createFloorState(state: GameState): void {
  const context = resolveThemeContext(state.coord);
  state.themeId = context.primary.id;
  state.floor = generateFloor(state.runSeed, state.coord, context);
  state.player.x = state.floor.spawn.x;
  state.player.y = state.floor.spawn.y;
  state.temporaryTerrain = [];
  state.explored = [];
  state.visible = [];
  populateFloor(state, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'population')));
  refreshVisibility(state);
}
export function createNewGame(seedText: string): { state: GameState; event: StoryEvent | null } {
  const runSeed = hashString32(seedText.trim() || `${Date.now()}`), runRng = new DeterministicRng(deriveSeed(runSeed, 'run'));
  const coord: WorldCoord = { depth: 1, lane: 0 }, context = resolveThemeContext(coord), floor = generateFloor(runSeed, coord, context);
  const state: GameState = {
    schemaVersion: 2,
    runId: `run-${runSeed.toString(16)}-${runRng.nextU32().toString(36)}`,
    runSeed,
    turn: 0,
    rngState: runRng.state,
    coord,
    themeId: context.primary.id,
    discoveredThemes: [],
    seenStoryEvents: [],
    floor,
    player: { id: 'player', x: floor.spawn.x, y: floor.spawn.y, hp: 34, maxHp: 34, attack: 5, defense: 1, inventory: [], statuses: [] },
    monsters: [],
    items: [],
    explored: [],
    visible: [],
    temporaryTerrain: [],
    messages: ['You descend beneath the cistern.'],
    gameOver: false,
  };
  populateFloor(state, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'population')));
  refreshVisibility(state);
  const event = themeDiscoveryEvent(state, context.primary);
  if (event) applyStoryEvent(state, event);
  return { state, event };
}
function applyStoryEvent(state: GameState, event: StoryEvent): void {
  if (!state.seenStoryEvents.includes(event.id)) state.seenStoryEvents.push(event.id);
  if (event.id.startsWith('theme:')) {
    const themeId = event.id.slice('theme:'.length);
    if (!state.discoveredThemes.includes(themeId)) state.discoveredThemes.push(themeId);
  }
  if (event.id === 'enter-abyss' && !state.discoveredThemes.includes('abyss')) state.discoveredThemes.push('abyss');
}
function transition(state: GameState, kind: 'down' | 'drift-left' | 'drift-right'): StoryEvent | null {
  state.coord.depth += 1;
  if (kind === 'drift-left') state.coord.lane -= 1;
  if (kind === 'drift-right') state.coord.lane += 1;
  const previousTheme = state.themeId;
  createFloorState(state);
  pushMessage(state, kind === 'down' ? 'You descend.' : kind === 'drift-left' ? 'You take the western descent.' : 'You take the eastern descent.');
  const context = resolveThemeContext(state.coord), themeEvent = context.primary.id !== previousTheme ? themeDiscoveryEvent(state, context.primary) : null;
  const event = themeEvent ?? milestoneEvent(state);
  if (event) applyStoryEvent(state, event);
  return event;
}

function monsterAt(state: GameState, x: number, y: number): MonsterEntity | undefined {
  return state.monsters.find((monster) => monster.x === x && monster.y === y);
}
function itemAt(state: GameState, x: number, y: number): GroundItem | undefined {
  return state.items.find((item) => item.x === x && item.y === y);
}
function inventoryEntry(state: GameState, itemId: string): InventoryItem | undefined {
  return state.player.inventory.find((entry) => entry.id === itemId);
}
function addStatus(statuses: StatusInstance[], spec: Extract<EffectSpec, { op: 'status' }>, sourceId?: string): void {
  const existing = statuses.find((status) => status.id === spec.id);
  if (existing) {
    existing.duration = Math.max(existing.duration, spec.duration);
    existing.magnitude = Math.max(existing.magnitude, spec.magnitude ?? 1);
    if (sourceId) existing.sourceId = sourceId;
    return;
  }
  statuses.push({ id: spec.id, duration: spec.duration, magnitude: spec.magnitude ?? 1, ...(sourceId ? { sourceId } : {}) });
}
function equippedWeapon(state: GameState) {
  const entry = state.player.inventory.find((item) => item.id === state.player.equippedWeaponId);
  return entry ? itemById(entry.defId) : null;
}
function equippedArmor(state: GameState) {
  const entry = state.player.inventory.find((item) => item.id === state.player.equippedArmorId);
  return entry ? itemById(entry.defId) : null;
}
function playerAttackPower(state: GameState): number {
  const weapon = equippedWeapon(state);
  const weaponDamage = weapon?.effects.filter((effect): effect is Extract<EffectSpec, { op: 'damage' }> => effect.op === 'damage').reduce((sum, effect) => sum + effect.amount, 0) ?? 0;
  return Math.max(1, state.player.attack + weaponDamage + statusMagnitude(state.player.statuses, 'attackDelta'));
}
function playerDefense(state: GameState): number {
  const armor = equippedArmor(state);
  const armorBonus = armor?.effects.filter((effect): effect is Extract<EffectSpec, { op: 'status' }> => effect.op === 'status' && effect.id === 'armor').reduce((sum, effect) => sum + (effect.magnitude ?? 1), 0) ?? 0;
  return Math.max(0, state.player.defense + armorBonus + statusMagnitude(state.player.statuses, 'defenseDelta'));
}
function monsterDefense(monster: MonsterEntity): number {
  const def = monsterById(monster.defId);
  return Math.max(0, def.defense + Math.floor(Math.max(0, monster.power - 1) / 2) + statusMagnitude(monster.statuses, 'defenseDelta'));
}
function monsterAttack(monster: MonsterEntity): number {
  const def = monsterById(monster.defId);
  return Math.max(1, def.attack + Math.max(0, monster.power - 1) + statusMagnitude(monster.statuses, 'attackDelta'));
}
function killMonsterIfNeeded(state: GameState, monster: MonsterEntity): boolean {
  if (monster.hp > 0) return false;
  const def = monsterById(monster.defId);
  state.monsters = state.monsters.filter((entry) => entry.id !== monster.id);
  pushMessage(state, `${def.name} dies.`);
  return true;
}
function damagePlayer(state: GameState, amount: number, message?: string): void {
  state.player.hp = Math.max(0, state.player.hp - Math.max(0, amount));
  if (message) pushMessage(state, message);
  if (state.player.hp <= 0) {
    state.gameOver = true;
    pushMessage(state, 'You die beneath the world.');
  }
}
function tileForKind(kind: TileKind): Tile {
  switch (kind) {
    case 'wall': return { kind, glyph: '#', walkable: false, transparent: false };
    case 'water': return { kind, glyph: '~', walkable: true, transparent: true };
    case 'lava': return { kind, glyph: '~', walkable: true, transparent: true };
    case 'bridge': return { kind, glyph: '=', walkable: true, transparent: true };
    case 'rubble': return { kind, glyph: ':', walkable: true, transparent: true };
    default: return { kind: 'floor', glyph: '.', walkable: true, transparent: true };
  }
}
function nearbyFreePoint(state: GameState, center: Point, radius: number, rng: DeterministicRng): Point | null {
  const occupied = new Set(state.monsters.map(pointKey));
  occupied.add(pointKey(state.player));
  const options: Point[] = [];
  for (let y = Math.max(0, center.y - radius); y <= Math.min(state.floor.height - 1, center.y + radius); y += 1) {
    for (let x = Math.max(0, center.x - radius); x <= Math.min(state.floor.width - 1, center.x + radius); x += 1) {
      const point = { x, y };
      if (manhattan(point, center) > radius || occupied.has(pointKey(point))) continue;
      if (tileAt(state.floor, x, y)?.walkable) options.push(point);
    }
  }
  return options.length ? rng.pick(options) : null;
}
function pushEntity(state: GameState, target: 'player' | MonsterEntity, source: Point, distance: number): void {
  const entity = target === 'player' ? state.player : target;
  const dx = Math.sign(entity.x - source.x), dy = Math.sign(entity.y - source.y);
  if (dx === 0 && dy === 0) return;
  for (let step = 0; step < distance; step += 1) {
    const next = { x: entity.x + dx, y: entity.y + dy };
    if (!tileAt(state.floor, next.x, next.y)?.walkable) break;
    if (target === 'player' ? monsterAt(state, next.x, next.y) : (samePoint(state.player, next) || state.monsters.some((other) => other.id !== entity.id && samePoint(other, next)))) break;
    entity.x = next.x; entity.y = next.y;
  }
}
function teleportEntity(state: GameState, target: 'player' | MonsterEntity, radius: number, rng: DeterministicRng): void {
  const entity = target === 'player' ? state.player : target;
  const point = nearbyFreePoint(state, entity, radius, rng);
  if (point) { entity.x = point.x; entity.y = point.y; }
}
function spawnTerrain(state: GameState, center: Point, kind: TileKind, radius: number, duration: number, rng: DeterministicRng): void {
  const points: Array<Point & { original: TileKind }> = [];
  for (let y = Math.max(0, center.y - radius); y <= Math.min(state.floor.height - 1, center.y + radius); y += 1) {
    for (let x = Math.max(0, center.x - radius); x <= Math.min(state.floor.width - 1, center.x + radius); x += 1) {
      if (Math.abs(x - center.x) + Math.abs(y - center.y) > radius) continue;
      const index = y * state.floor.width + x, tile = state.floor.tiles[index]!;
      if (!tile.walkable || state.floor.exits.some((exit) => exit.x === x && exit.y === y)) continue;
      points.push({ x, y, original: tile.kind });
      state.floor.tiles[index] = tileForKind(kind);
    }
  }
  if (points.length) state.temporaryTerrain.push({ id: id('terrain', rng), points, replacement: kind, expiresTurn: state.turn + Math.max(1, duration) });
}
function summonNear(state: GameState, source: Point, tag: string, count: number, rng: DeterministicRng): void {
  const candidates = MONSTERS.filter((def) => def.tags.includes(tag));
  if (!candidates.length) return;
  for (let i = 0; i < count; i += 1) {
    const point = nearbyFreePoint(state, source, 3, rng);
    if (!point) return;
    const def = rng.pick(candidates), power = monsterPower(state);
    state.monsters.push({ id: id('m', rng), defId: def.id, hp: Math.round(def.maxHp * (1 + Math.max(0, power - 1) * 0.14)), statuses: [], power, abilityCooldown: 2, ...point });
  }
}
function applyEffect(state: GameState, effect: EffectSpec, source: Point & { id: string }, target: 'player' | MonsterEntity, rng: DeterministicRng): void {
  const targetEntity = target === 'player' ? state.player : target;
  switch (effect.op) {
    case 'damage': {
      if (target === 'player') {
        const reduced = Math.max(1, effect.amount - Math.floor(playerDefense(state) / 3));
        damagePlayer(state, reduced, `${source.id === 'player' ? 'The effect' : 'A hostile effect'} hits you for ${reduced}.`);
      } else {
        const damage = Math.max(1, effect.amount - Math.floor(monsterDefense(target) / 3));
        target.hp -= damage;
        pushMessage(state, `${monsterById(target.defId).name} takes ${damage}.`);
        killMonsterIfNeeded(state, target);
      }
      break;
    }
    case 'heal':
      if (target === 'player') state.player.hp = Math.min(state.player.maxHp, state.player.hp + effect.amount);
      else target.hp += effect.amount;
      break;
    case 'status':
      addStatus(target === 'player' ? state.player.statuses : target.statuses, effect, source.id);
      break;
    case 'push':
      pushEntity(state, target, source, effect.distance);
      break;
    case 'teleport':
      teleportEntity(state, target, effect.radius, rng);
      break;
    case 'reveal':
      if (target === 'player') {
        const explored = new Set(state.explored);
        for (let y = Math.max(0, state.player.y - effect.radius); y <= Math.min(state.floor.height - 1, state.player.y + effect.radius); y += 1) {
          for (let x = Math.max(0, state.player.x - effect.radius); x <= Math.min(state.floor.width - 1, state.player.x + effect.radius); x += 1) {
            if (manhattan(state.player, { x, y }) <= effect.radius) explored.add(`${x},${y}`);
          }
        }
        state.explored = [...explored];
      }
      break;
    case 'spawn-terrain':
      spawnTerrain(state, targetEntity, effect.tile, effect.radius, effect.duration ?? 4, rng);
      break;
    case 'summon':
      summonNear(state, source, effect.tag, effect.count, rng);
      break;
  }
}
function attackMonster(state: GameState, monster: MonsterEntity, rng: DeterministicRng): void {
  const def = monsterById(monster.defId), damage = Math.max(1, playerAttackPower(state) + rng.int(-1, 2) - monsterDefense(monster));
  monster.hp -= damage;
  pushMessage(state, `You hit ${def.name} for ${damage}.`);
  const weapon = equippedWeapon(state);
  if (!killMonsterIfNeeded(state, monster) && weapon) {
    for (const effect of weapon.effects) if (effect.op === 'status' || effect.op === 'push') applyEffect(state, effect, state.player, monster, rng);
  }
}
function meleePlayer(state: GameState, monster: MonsterEntity, rng: DeterministicRng): void {
  const def = monsterById(monster.defId), damage = Math.max(1, monsterAttack(monster) + rng.int(-1, 1) - playerDefense(state));
  damagePlayer(state, damage, `${def.name} hits you for ${damage}.`);
}
function tryMoveMonster(state: GameState, monster: MonsterEntity, target: Point): boolean {
  if (!tileAt(state.floor, target.x, target.y)?.walkable) return false;
  if (samePoint(state.player, target)) return false;
  if (state.monsters.some((other) => other.id !== monster.id && samePoint(other, target))) return false;
  monster.x = target.x; monster.y = target.y;
  return true;
}
function chaseOptions(monster: MonsterEntity, destination: Point, rng: DeterministicRng): Point[] {
  const dx = Math.sign(destination.x - monster.x), dy = Math.sign(destination.y - monster.y);
  const cardinal = [{ x: monster.x + dx, y: monster.y }, { x: monster.x, y: monster.y + dy }].filter((point) => !samePoint(point, monster));
  return rng.chance(.5) ? cardinal : cardinal.reverse();
}
function retreatOptions(monster: MonsterEntity, from: Point, rng: DeterministicRng): Point[] {
  const dx = Math.sign(monster.x - from.x), dy = Math.sign(monster.y - from.y);
  const options = [{ x: monster.x + dx, y: monster.y }, { x: monster.x, y: monster.y + dy }].filter((point) => !samePoint(point, monster));
  return rng.chance(.5) ? options : options.reverse();
}
function randomMoveOptions(monster: MonsterEntity, rng: DeterministicRng): Point[] {
  return rng.shuffle([{ x: monster.x + 1, y: monster.y }, { x: monster.x - 1, y: monster.y }, { x: monster.x, y: monster.y + 1 }, { x: monster.x, y: monster.y - 1 }]);
}
function executeMonsterAbility(state: GameState, monster: MonsterEntity, rng: DeterministicRng): boolean {
  const def = monsterById(monster.defId), effect = def.abilities[0];
  if (!effect || monster.abilityCooldown > 0) return false;
  if (!hasLineOfSight(state, monster, state.player) && effect.op !== 'summon' && effect.op !== 'teleport') return false;
  if (effect.op === 'teleport' || effect.op === 'summon') applyEffect(state, effect, monster, monster, rng);
  else applyEffect(state, effect, monster, 'player', rng);
  monster.abilityCooldown = 3 + (def.ai === 'caster' ? 0 : 1);
  pushMessage(state, `${def.name} invokes ${effect.op.replaceAll('-', ' ')}.`);
  return true;
}
function monsterTurn(state: GameState, monster: MonsterEntity, rng: DeterministicRng): void {
  if (state.gameOver || !state.monsters.some((entry) => entry.id === monster.id)) return;
  const def = monsterById(monster.defId), distance = manhattan(monster, state.player);
  if (distance === 1) { meleePlayer(state, monster, rng); return; }
  const confused = monster.statuses.some((status) => statusById(status.id).confused);
  const movementBlocked = monster.statuses.some((status) => statusById(status.id).movementBlocked);
  if (confused && !movementBlocked) {
    for (const point of randomMoveOptions(monster, rng)) if (tryMoveMonster(state, monster, point)) return;
    return;
  }
  if (def.ai === 'caster' && distance >= 2 && distance <= 7 && executeMonsterAbility(state, monster, rng)) return;
  if (def.ai === 'skirmisher' && distance >= 2 && distance <= 5 && executeMonsterAbility(state, monster, rng)) return;
  if (def.ai === 'guard' && distance > 7) return;
  if (distance > (def.ai === 'stalker' ? 16 : 11)) return;
  if (movementBlocked) return;
  const movingAway = def.ai === 'skirmisher' && distance <= 2;
  const options = movingAway ? retreatOptions(monster, state.player, rng) : chaseOptions(monster, state.player, rng);
  for (const point of options) if (tryMoveMonster(state, monster, point)) break;
  if (def.ai === 'swarm' && state.turn % 2 === 0 && manhattan(monster, state.player) > 1) {
    for (const point of chaseOptions(monster, state.player, rng)) if (tryMoveMonster(state, monster, point)) break;
  }
}
function moveMonsters(state: GameState, rng: DeterministicRng): void {
  for (const monster of [...state.monsters]) {
    monster.abilityCooldown = Math.max(0, monster.abilityCooldown - 1);
    monsterTurn(state, monster, rng);
    if (state.gameOver) return;
  }
}
function tickStatuses(state: GameState): void {
  const tickList = (statuses: StatusInstance[], damage: (amount: number, label: string) => void) => {
    for (const status of statuses) {
      const def = statusById(status.id);
      if (def.periodicDamage && state.turn % (def.tickEvery ?? 1) === 0) damage(def.periodicDamage * status.magnitude, def.name);
      status.duration -= 1;
    }
    return statuses.filter((status) => status.duration > 0);
  };
  state.player.statuses = tickList(state.player.statuses, (amount, label) => damagePlayer(state, amount, `${label} deals ${amount} damage.`));
  for (const monster of [...state.monsters]) {
    monster.statuses = tickList(monster.statuses, (amount) => { monster.hp -= amount; });
    killMonsterIfNeeded(state, monster);
  }
}
function expireTerrain(state: GameState): void {
  const remaining = [] as GameState['temporaryTerrain'];
  for (const effect of state.temporaryTerrain) {
    if (state.turn < effect.expiresTurn) { remaining.push(effect); continue; }
    for (const point of effect.points) {
      const index = point.y * state.floor.width + point.x;
      if (state.floor.tiles[index]?.kind === effect.replacement) state.floor.tiles[index] = tileForKind(point.original);
    }
  }
  state.temporaryTerrain = remaining;
}
function applyStandingTerrain(state: GameState): void {
  const tile = tileAt(state.floor, state.player.x, state.player.y);
  if (tile?.kind === 'lava' && !hasStatus(state, 'fire-ward')) damagePlayer(state, 3, 'The lava burns you for 3.');
}
function endAcceptedTurn(state: GameState, rng: DeterministicRng): void {
  state.turn += 1;
  expireTerrain(state);
  applyStandingTerrain(state);
  if (!state.gameOver) moveMonsters(state, rng);
  if (!state.gameOver) tickStatuses(state);
  refreshVisibility(state);
  state.rngState = rng.state;
}
function movementBlocked(state: GameState): boolean {
  return state.player.statuses.some((status) => statusById(status.id).movementBlocked);
}
function harmfulItemEffect(effect: EffectSpec): boolean {
  if (effect.op === 'damage' || effect.op === 'push') return true;
  return effect.op === 'status' && Boolean(statusById(effect.id).harmful);
}
function nearestVisibleMonster(state: GameState, range: number): MonsterEntity | null {
  const visible = new Set(state.visible);
  const candidates = state.monsters.filter((monster) => manhattan(state.player, monster) <= range && visible.has(pointKey(monster)) && hasLineOfSight(state, state.player, monster));
  candidates.sort((a, b) => manhattan(state.player, a) - manhattan(state.player, b) || a.id.localeCompare(b.id));
  return candidates[0] ?? null;
}
function useInventoryItem(state: GameState, itemId: string, rng: DeterministicRng): boolean {
  const entry = inventoryEntry(state, itemId);
  if (!entry) return false;
  const def = itemById(entry.defId);
  if (def.category === 'weapon') {
    state.player.equippedWeaponId = state.player.equippedWeaponId === itemId ? undefined : itemId;
    pushMessage(state, state.player.equippedWeaponId === itemId ? `You ready ${def.name}.` : `You lower ${def.name}.`);
    return true;
  }
  if (def.category === 'armor') {
    state.player.equippedArmorId = state.player.equippedArmorId === itemId ? undefined : itemId;
    pushMessage(state, state.player.equippedArmorId === itemId ? `You wear ${def.name}.` : `You remove ${def.name}.`);
    return true;
  }
  const needsHostile = def.effects.some(harmfulItemEffect), hostile = needsHostile ? nearestVisibleMonster(state, 7) : null;
  if (needsHostile && !hostile) { pushMessage(state, `${def.name} has no valid target.`); return false; }
  for (const effect of def.effects) {
    const target: 'player' | MonsterEntity = harmfulItemEffect(effect) ? hostile! : 'player';
    applyEffect(state, effect, state.player, target, rng);
  }
  if (def.category === 'consumable') {
    state.player.inventory = state.player.inventory.filter((item) => item.id !== itemId);
    pushMessage(state, `You use ${def.name}.`);
  } else pushMessage(state, `You activate ${def.name}.`);
  return true;
}
function dropInventoryItem(state: GameState, itemId: string): boolean {
  const entry = inventoryEntry(state, itemId);
  if (!entry) return false;
  if (state.player.equippedWeaponId === itemId) state.player.equippedWeaponId = undefined;
  if (state.player.equippedArmorId === itemId) state.player.equippedArmorId = undefined;
  state.player.inventory = state.player.inventory.filter((item) => item.id !== itemId);
  state.items.push({ id: entry.id, defId: entry.defId, x: state.player.x, y: state.player.y });
  pushMessage(state, `You drop ${itemById(entry.defId).name}.`);
  return true;
}

export function dispatchAction(state: GameState, action: GameAction): ActionResult {
  if (state.gameOver) return { accepted: false, event: null };
  const rng = new DeterministicRng(state.rngState);
  let accepted = false;
  let pendingExit: ReturnType<typeof exitAt> = undefined;
  if (action.type === 'move') {
    if (Math.abs(action.dx) + Math.abs(action.dy) !== 1) throw new Error('movement must be cardinal and one tile');
    if (movementBlocked(state)) { pushMessage(state, 'You are pinned in place.'); return { accepted: false, event: null }; }
    let dx = action.dx, dy = action.dy;
    if (state.player.statuses.some((status) => statusById(status.id).confused) && rng.chance(.35)) {
      const random = rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]] as const); dx = random[0]; dy = random[1];
    }
    const target = { x: state.player.x + dx, y: state.player.y + dy }, tile = tileAt(state.floor, target.x, target.y);
    if (!tile?.walkable) return { accepted: false, event: null };
    const monster = monsterAt(state, target.x, target.y);
    if (monster) attackMonster(state, monster, rng);
    else {
      state.player.x = target.x; state.player.y = target.y;
      const item = itemAt(state, target.x, target.y);
      if (item) {
        state.player.inventory.push({ id: item.id, defId: item.defId });
        state.items = state.items.filter((entry) => entry.id !== item.id);
        pushMessage(state, `You pick up ${itemById(item.defId).name}.`);
      }
      pendingExit = exitAt(state.floor, state.player.x, state.player.y);
    }
    accepted = true;
  } else if (action.type === 'wait') accepted = true;
  else if (action.type === 'use-item') accepted = useInventoryItem(state, action.itemId, rng);
  else if (action.type === 'drop-item') accepted = dropInventoryItem(state, action.itemId);
  if (!accepted) return { accepted: false, event: null };
  endAcceptedTurn(state, rng);
  if (state.gameOver) return { accepted: true, event: null };
  const event = pendingExit ? transition(state, pendingExit.kind) : null;
  return { accepted: true, event };
}
export function actMove(state: GameState, dx: number, dy: number): StoryEvent | null { return dispatchAction(state, { type: 'move', dx, dy }).event; }
export function actWait(state: GameState): StoryEvent | null { return dispatchAction(state, { type: 'wait' }).event; }
export function actUseInventory(state: GameState, itemId: string): StoryEvent | null { return dispatchAction(state, { type: 'use-item', itemId }).event; }
export function actDropInventory(state: GameState, itemId: string): StoryEvent | null { return dispatchAction(state, { type: 'drop-item', itemId }).event; }

export function assertGameInvariants(state: GameState): void {
  if (!tileAt(state.floor, state.player.x, state.player.y)?.walkable) throw new Error('invariant: player must stand on walkable tile');
  const ids = new Set<string>();
  const inventoryIds = state.player.inventory.map((entry) => entry.id);
  for (const entity of [state.player, ...state.monsters, ...state.items, ...state.player.inventory]) {
    if (ids.has(entity.id)) throw new Error(`invariant: duplicate entity id ${entity.id}`);
    ids.add(entity.id);
  }
  if (state.player.equippedWeaponId && !inventoryIds.includes(state.player.equippedWeaponId)) throw new Error('invariant: equipped weapon not in inventory');
  if (state.player.equippedArmorId && !inventoryIds.includes(state.player.equippedArmorId)) throw new Error('invariant: equipped armor not in inventory');
  for (const monster of state.monsters) {
    if (monster.hp <= 0) throw new Error(`invariant: dead monster retained ${monster.id}`);
    if (!tileAt(state.floor, monster.x, monster.y)?.walkable) throw new Error(`invariant: monster in wall ${monster.id}`);
    if (samePoint(monster, state.player)) throw new Error(`invariant: monster overlaps player ${monster.id}`);
  }
  const occupied = new Set<string>();
  for (const monster of state.monsters) {
    const key = pointKey(monster);
    if (occupied.has(key)) throw new Error(`invariant: monsters overlap at ${key}`);
    occupied.add(key);
  }
}
