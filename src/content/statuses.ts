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
  { id: 'bleeding', name: 'Bleeding', harmful: true, periodicDamage: 1, defenseDelta: -1, tickEvery: 1 },
  { id: 'burning', name: 'Burning', harmful: true, periodicDamage: 2, defenseDelta: -1, tickEvery: 1 },
  { id: 'spored', name: 'Spored', harmful: true, periodicDamage: 1, visionDelta: -1, tickEvery: 2 },
  { id: 'chilled', name: 'Chilled', harmful: true, attackDelta: -2, defenseDelta: -1 },
  { id: 'slowed', name: 'Slowed', harmful: true, defenseDelta: -1 },
  { id: 'dazed', name: 'Dazed', harmful: true, attackDelta: -2, defenseDelta: -1 },
  { id: 'confused', name: 'Confused', harmful: true, confused: true, defenseDelta: -1 },
  { id: 'pinned', name: 'Pinned', harmful: true, movementBlocked: true, defenseDelta: -1 },
  { id: 'blinded', name: 'Blinded', harmful: true, visionDelta: -4 },
  { id: 'unmoored', name: 'Unmoored', harmful: true, defenseDelta: -3, visionDelta: -1 },
  { id: 'armor-break', name: 'Armor Broken', harmful: true, defenseDelta: -2 },
  { id: 'marked', name: 'Marked', harmful: true, defenseDelta: -2 },
  { id: 'stasis', name: 'Stasis', harmful: true, movementBlocked: true, defenseDelta: -2 },
  { id: 'linked', name: 'Linked', harmful: true, defenseDelta: -1 },

  { id: 'armor', name: 'Armored', defenseDelta: 1 },
  { id: 'guarding', name: 'Guarding', defenseDelta: 4 },
  { id: 'focused', name: 'Focused', attackDelta: 2, visionDelta: 1 },
  { id: 'hasted', name: 'Hasted', attackDelta: 1, defenseDelta: 1 },
  { id: 'berserk', name: 'Berserk', attackDelta: 4, defenseDelta: -2 },
  { id: 'fire-brand', name: 'Fire Brand', attackDelta: 2 },
  { id: 'heat-shield', name: 'Heat Shield', defenseDelta: 2 },
  { id: 'water-step', name: 'Water Step' },
  { id: 'spore-ward', name: 'Spore Ward', defenseDelta: 1 },
  { id: 'beam-ward', name: 'Beam Ward', defenseDelta: 1 },
  { id: 'poison-ward', name: 'Poison Ward' },
  { id: 'fire-ward', name: 'Fire Ward' },
  { id: 'cold-ward', name: 'Cold Ward' },
  { id: 'spore-sight', name: 'Spore Sight', visionDelta: 3 },
  { id: 'antivenom', name: 'Antivenom' },
  { id: 'lucid', name: 'Lucid', visionDelta: 1 },
  { id: 'cleansed', name: 'Cleansed' },

  { id: 'charging', name: 'Charging' },
  { id: 'winding', name: 'Winding Up' },
];

const byId = new Map(defs.map((def) => [def.id, def]));
export const STATUSES = defs;
export function statusById(id: string): StatusDefinition {
  return byId.get(id) ?? { id, name: id.replaceAll('-', ' ') };
}
