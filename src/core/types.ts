export type EntityId = string;
export type ThemeId = string;
export type ArchetypeId = string;
export type Locale = 'en' | 'ko';
export interface Point { x: number; y: number; }
export type TileKind = 'wall' | 'floor' | 'water' | 'lava' | 'bridge' | 'rubble';
export interface Tile { kind: TileKind; glyph: string; walkable: boolean; transparent: boolean; }
export type ExitKind = 'down' | 'drift-left' | 'drift-right';
export interface FloorExit extends Point { kind: ExitKind; glyph: string; }
export interface FloorMap { width: number; height: number; tiles: Tile[]; spawn: Point; exits: FloorExit[]; generation: { seed: number; archetypeId: ArchetypeId; attempt: number; walkableRatio: number; }; }
export interface WorldCoord { depth: number; lane: number; }
export interface ThemePalette { wall: string; floor: string; accent: string; danger: string; water: string; }
export interface ThemeDefinition { id: ThemeId; name: string; stage: number; lane: 'left' | 'main' | 'right'; palette: ThemePalette; ambience: string; monsterTags: string[]; archetypeIds: ArchetypeId[]; }
export interface ThemeContext { primary: ThemeDefinition; blend?: { target: ThemeDefinition; weight: number; }; isAbyss: boolean; }
export type AiProfile = 'stalker' | 'brute' | 'skirmisher' | 'guard' | 'swarm' | 'caster';
export interface MonsterDefinition { id: string; name: string; glyph: string; color: string; maxHp: number; attack: number; defense: number; ai: AiProfile; tags: string[]; minDepth: number; abilities: EffectSpec[]; }
export interface StatusInstance { id: string; duration: number; magnitude: number; sourceId?: EntityId; }
export interface MonsterEntity extends Point { id: EntityId; defId: string; hp: number; statuses: StatusInstance[]; power: number; abilityCooldown: number; }
export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'tool' | 'relic';
export interface ItemDefinition { id: string; name: string; glyph: string; color: string; category: ItemCategory; rarity: number; tags: string[]; effects: EffectSpec[]; }
export interface GroundItem extends Point { id: EntityId; defId: string; }
export interface InventoryItem { id: EntityId; defId: string; }
export type EffectSpec =
  | { op: 'damage'; amount: number; damageType?: string }
  | { op: 'heal'; amount: number }
  | { op: 'status'; id: string; duration: number; magnitude?: number }
  | { op: 'push'; distance: number }
  | { op: 'teleport'; radius: number }
  | { op: 'reveal'; radius: number }
  | { op: 'spawn-terrain'; tile: TileKind; radius: number; duration?: number }
  | { op: 'summon'; tag: string; count: number }
  | { op: 'nutrition'; amount: number }
  | { op: 'ammo'; amount: number };
export interface PlayerState extends Point {
  id: EntityId;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number;
  level: number;
  xp: number;
  xpToNext: number;
  hunger: number;
  maxHunger: number;
  ammo: number;
  kills: number;
  floorsVisited: number;
  inventory: InventoryItem[];
  statuses: StatusInstance[];
  equippedWeaponId?: EntityId | undefined;
  equippedArmorId?: EntityId | undefined;
}
export interface TemporaryTerrain { id: EntityId; points: Array<Point & { original: TileKind }>; replacement: TileKind; expiresTurn: number; }
export type DungeonFeatureKind =
  | 'spike-trap' | 'snare-rune' | 'teleport-rune' | 'alarm-rune'
  | 'healing-spring' | 'warding-altar' | 'unstable-cache'
  | 'food-cache' | 'ammo-crate' | 'ancient-grave' | 'bookshelf'
  | 'forge-anvil' | 'mushroom-patch' | 'memory-stone' | 'blood-well';
export interface DungeonFeature extends Point { id: EntityId; kind: DungeonFeatureKind; revealed: boolean; spent: boolean; }

export type SiteKind = 'town-square' | 'merchant' | 'healer' | 'appraiser' | 'cartographer' | 'shrine' | 'camp' | 'provisioner' | 'trainer' | 'inn';
export type SiteServiceKind = 'rumor' | 'buy' | 'sell' | 'heal' | 'cleanse' | 'identify' | 'map' | 'bless' | 'rest' | 'meal' | 'train-attack' | 'train-defense' | 'train-vigor' | 'inn-rest';
export interface SiteStockEntry { id: EntityId; defId: string; price: number; }
export interface NonCombatSite extends Point {
  id: EntityId;
  kind: SiteKind;
  settlementId?: string;
  settlementName?: string;
  stock: SiteStockEntry[];
  usedServices: SiteServiceKind[];
}

export interface StoryEvent { id: string; title: string; body: string; severity: 'major'; }
export interface GameState {
  schemaVersion: 5;
  runId: string;
  runSeed: number;
  turn: number;
  rngState: number;
  coord: WorldCoord;
  themeId: ThemeId;
  discoveredThemes: ThemeId[];
  seenStoryEvents: string[];
  identifiedItemDefs: string[];
  floor: FloorMap;
  player: PlayerState;
  monsters: MonsterEntity[];
  items: GroundItem[];
  features: DungeonFeature[];
  sites: NonCombatSite[];
  explored: string[];
  visible: string[];
  temporaryTerrain: TemporaryTerrain[];
  messages: string[];
  gameOver: boolean;
}
export type GameAction =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'wait' }
  | { type: 'search' }
  | { type: 'rest' }
  | { type: 'explore' }
  | { type: 'fire' }
  | { type: 'use-item'; itemId: EntityId }
  | { type: 'drop-item'; itemId: EntityId }
  | { type: 'site-service'; siteId: EntityId; service: SiteServiceKind; itemId?: EntityId; offerId?: EntityId };
export interface ActionResult { accepted: boolean; event: StoryEvent | null; }
