export type EntityId = string;
export type ThemeId = string;
export type ArchetypeId = string;
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
export interface MonsterEntity extends Point { id: EntityId; defId: string; hp: number; }
export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'tool' | 'relic';
export interface ItemDefinition { id: string; name: string; glyph: string; color: string; category: ItemCategory; rarity: number; tags: string[]; effects: EffectSpec[]; }
export interface GroundItem extends Point { id: EntityId; defId: string; }
export type EffectSpec =
  | { op: 'damage'; amount: number; damageType?: string }
  | { op: 'heal'; amount: number }
  | { op: 'status'; id: string; duration: number; magnitude?: number }
  | { op: 'push'; distance: number }
  | { op: 'teleport'; radius: number }
  | { op: 'reveal'; radius: number }
  | { op: 'spawn-terrain'; tile: TileKind; radius: number; duration?: number }
  | { op: 'summon'; tag: string; count: number };
export interface PlayerState extends Point { id: EntityId; hp: number; maxHp: number; attack: number; defense: number; inventory: string[]; }
export interface StoryEvent { id: string; title: string; body: string; severity: 'major'; }
export interface GameState { schemaVersion: 1; runId: string; runSeed: number; turn: number; rngState: number; coord: WorldCoord; themeId: ThemeId; discoveredThemes: ThemeId[]; seenStoryEvents: string[]; floor: FloorMap; player: PlayerState; monsters: MonsterEntity[]; items: GroundItem[]; messages: string[]; gameOver: boolean; }
