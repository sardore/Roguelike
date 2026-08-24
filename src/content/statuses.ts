export interface StatusDefinition {
  id: string;
  name: string;
  harmful?: boolean;
  periodicDamage?: number;
  attackDelta?: number;
  defenseDelta?: number;
  movementBlocked?: boolean;
  confused?: boolean;
  visionDelta?: number;
  tickEvery?: number;
}

const defs: StatusDefinition[] = [
  { id: 'poisoned', name: 'Poisoned', harmful: true, periodicDamage: 1, tickEvery: 1 },
  { id: 'burning', name: 'Burning', harmful: true, periodicDamage: 2, tickEvery: 1 },
  { id: 'chilled', name: 'Chilled', harmful: true, attackDelta: -1 },
  { id: 'slowed', name: 'Slowed', harmful: true },
  { id: 'dazed', name: 'Dazed', harmful: true, attackDelta: -1 },
  { id: 'confused', name: 'Confused', harmful: true, confused: true },
  { id: 'pinned', name: 'Pinned', harmful: true, movementBlocked: true },
  { id: 'blinded', name: 'Blinded', harmful: true, visionDelta: -4 },
  { id: 'unmoored', name: 'Unmoored', harmful: true, defenseDelta: -2 },
  { id: 'armor', name: 'Armored', defenseDelta: 1 },
  { id: 'armor-break', name: 'Armor Broken', harmful: true, defenseDelta: -1 },
  { id: 'guarding', name: 'Guarding', defenseDelta: 4 },
  { id: 'charging', name: 'Charging' },
  { id: 'winding', name: 'Winding Up' },
  { id: 'hasted', name: 'Hasted' },
  { id: 'fire-brand', name: 'Fire Brand' },
  { id: 'water-step', name: 'Water Step' },
  { id: 'spore-ward', name: 'Spore Ward' },
  { id: 'beam-ward', name: 'Beam Ward' },
  { id: 'poison-ward', name: 'Poison Ward' },
  { id: 'fire-ward', name: 'Fire Ward' },
  { id: 'cold-ward', name: 'Cold Ward' },
  { id: 'spore-sight', name: 'Spore Sight', visionDelta: 2 },
  { id: 'antivenom', name: 'Antivenom' },
  { id: 'lucid', name: 'Lucid' },
  { id: 'cleansed', name: 'Cleansed' },
];

const byId = new Map(defs.map((def) => [def.id, def]));
export const STATUSES = defs;
export function statusById(id: string): StatusDefinition {
  return byId.get(id) ?? { id, name: id.replaceAll('-', ' ') };
}
