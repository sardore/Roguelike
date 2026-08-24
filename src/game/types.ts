export type Point = { x: number; y: number };
export type TileKind = 'wall' | 'floor' | 'door' | 'water' | 'acid' | 'fire' | 'stairs';
export type Tile = { kind: TileKind; room?: string; variant: number; discovered: boolean; visible: boolean };
export type EnemyKind = 'glass-mite' | 'distiller-rat' | 'vapor-hound';
export type Enemy = { id: string; kind: EnemyKind; x: number; y: number; hp: number; telegraph?: Point; cooldown: number };
export type ItemKind = 'red-phial' | 'salt-bomb' | 'blue-tonic' | 'chalk';
export type GroundItem = { id: string; kind: ItemKind; x: number; y: number };
export type Status = 'bleeding' | 'poisoned' | 'marked';
export type Player = { x: number; y: number; hp: number; maxHp: number; guard: number; inventory: ItemKind[]; statuses: Array<{ id: Status; turns: number }> };
export type Message = { text: string; tone?: 'good' | 'bad' | 'odd' };
export type GameState = {
  width: number; height: number; tiles: Tile[]; player: Player; enemies: Enemy[]; items: GroundItem[];
  turn: number; messages: Message[]; seed: number; over: boolean; won: boolean; noise: Point[];
};
