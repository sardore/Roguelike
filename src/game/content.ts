import type { EnemyKind, ItemKind } from './types';
export const ENEMIES: Record<EnemyKind,{name:string;hp:number;damage:number;glyph:string;note:string}> = {
  'glass-mite': { name:'Glass Mite', hp:5, damage:2, glyph:'✦', note:'Cracks under impact. Its death scatters cutting glass.' },
  'distiller-rat': { name:'Distiller Rat', hp:9, damage:3, glyph:'r', note:'Drags bottles and retreats from open flame.' },
  'vapor-hound': { name:'Vapor Hound', hp:13, damage:5, glyph:'h', note:'Marks a tile, then exhales corrosive vapor there.' }
};
export const ITEMS: Record<ItemKind,{name:string;desc:string;glyph:string}> = {
  'red-phial': { name:'Red Phial', desc:'Throw. Ignites the target tile and volatile liquid beside it.', glyph:'!' },
  'salt-bomb': { name:'Salt Bomb', desc:'Throw. Bursts for 4 damage and suppresses acid/fire on impact.', glyph:'*' },
  'blue-tonic': { name:'Blue Tonic', desc:'Drink. Recover 6 HP, but leaves a medicinal scent.', glyph:'!' },
  'chalk': { name:'White Chalk', desc:'Use. Mark the floor. Some things dislike crossing a fresh line.', glyph:'/' }
};
