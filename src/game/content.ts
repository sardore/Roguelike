import type { EnemyKind, ItemKind } from './types';

export const ENEMIES:Record<EnemyKind,{name:string;hp:number;damage:number;glyph:string;note:string}>={
  'glass-mite':{name:'Glass Mite',hp:5,damage:2,glyph:'✦',note:'Brittle. Its death throws cutting glass into adjacent tiles.'},
  'distiller-rat':{name:'Distiller Rat',hp:9,damage:3,glyph:'r',note:'Carries stolen reagents and flees open flame.'},
  'vapor-hound':{name:'Vapor Hound',hp:13,damage:5,glyph:'h',note:'Marks a tile, then exhales corrosive vapor there.'},
  'retort-leech':{name:'Retort Leech',hp:8,damage:2,glyph:'l',note:'Feeds on standing chemicals. Acid heals it; salt hurts it badly.'},
  'soot-sprite':{name:'Soot Sprite',hp:6,damage:2,glyph:'s',note:'Drifts through steam and ignites oil when cornered.'},
  'brine-warden':{name:'Brine Warden',hp:16,damage:4,glyph:'W',note:'Slow armored custodian. Braces near grates and hates fire.'},
  'gutter-alchemist':{name:'Gutter Alchemist',hp:10,damage:3,glyph:'a',note:'Throws unstable mixtures, creating temporary hazard tiles.'}
};

export const ITEMS:Record<ItemKind,{name:string;desc:string;glyph:string}>={
  'red-phial':{name:'Red Phial',desc:'Throw. Ignites a tile. Oil and volatile fixtures may chain-react.',glyph:'!'},
  'salt-bomb':{name:'Salt Bomb',desc:'Throw. Deals damage and suppresses acid, steam and fire.',glyph:'*'},
  'blue-tonic':{name:'Blue Tonic',desc:'Drink. Recover 6 HP, but medicinal scent makes you easier to track.',glyph:'!'},
  'chalk':{name:'White Chalk',desc:'Use. Draw a ward line that several creatures avoid.',glyph:'/'},
  'smoke-ampoule':{name:'Smoke Ampoule',desc:'Throw. Creates a cold steam cloud and interrupts telegraphed attacks.',glyph:'o'},
  'neutralizer':{name:'Neutralizer',desc:'Drink or throw. Clears poison and turns nearby acid into harmless sludge.',glyph:'+'},
  'copper-key':{name:'Copper Key',desc:'Use near a sealed brass gate or cache.',glyph:'k'},
  'black-catalyst':{name:'Black Catalyst',desc:'Throw. Violently reacts with fire, acid or oil. The label has been scraped off.',glyph:'◆'}
};
