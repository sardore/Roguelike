import type { MonsterDefinition } from '../core/types';

const m = (
  id: string,
  name: string,
  glyph: string,
  color: string,
  maxHp: number,
  attack: number,
  defense: number,
  ai: MonsterDefinition['ai'],
  theme: string,
  minDepth: number,
  tags: string[],
  abilities: MonsterDefinition['abilities'] = [],
): MonsterDefinition => ({ id, name, glyph, color, maxHp, attack, defense, ai, minDepth, tags: [...tags, `theme:${theme}`], abilities });

export const EXTRA_MONSTERS: MonsterDefinition[] = [
  m('moss-cistern-rust-centipede','Rust Centipede','c','#a58f67',10,4,1,'skirmisher','moss-cistern',1,['vermin','resist:poison'],[{op:'status',id:'bleeding',duration:2}]),
  m('moss-cistern-mire-bull','Mire Bull','B','#788d69',21,6,2,'brute','moss-cistern',1,['beast'],[{op:'push',distance:2}]),
  m('drowned-aqueduct-brine-priest','Brine Priest','p','#79aeb6',18,6,2,'caster','drowned-aqueduct',1,['aquatic','caster','resist:shock'],[{op:'status',id:'slowed',duration:2}]),
  m('drowned-aqueduct-drowned-hulk','Drowned Hulk','H','#667f86',27,7,4,'brute','drowned-aqueduct',1,['undead','aquatic','resist:cold'],[{op:'push',distance:2}]),
  m('ember-mine-slag-sprinter','Slag Sprinter','s','#d08b54',15,7,1,'skirmisher','ember-mine',1,['fire','construct','resist:fire','vuln:shock'],[{op:'damage',amount:4,damageType:'fire'}]),
  m('ember-mine-furnace-ogre','Furnace Ogre','O','#c9784f',29,8,3,'brute','ember-mine',1,['humanoid','fire','resist:fire'],[{op:'status',id:'burning',duration:3}]),

  m('fungal-vault-rot-cap','Rot Cap','F','#a7a45f',18,6,2,'guard','fungal-vault',21,['fungal','resist:poison'],[{op:'status',id:'poisoned',duration:4}]),
  m('fungal-vault-spore-herald','Spore Herald','h','#c4b878',20,7,2,'caster','fungal-vault',21,['fungal','caster'],[{op:'summon',tag:'fungal',count:2}]),
  m('ossuary-terraces-marrow-hound','Marrow Hound','h','#b9ad95',20,7,2,'stalker','ossuary-terraces',21,['undead','beast','resist:cold'],[{op:'status',id:'bleeding',duration:3}]),
  m('ossuary-terraces-crypt-bell','Crypt Bell','b','#cec4ad',24,6,5,'caster','ossuary-terraces',21,['undead','spirit'],[{op:'status',id:'dazed',duration:2}]),
  m('ironwarren-chain-marshal','Chain Marshal','M','#9f8c70',26,8,5,'guard','ironwarren',21,['construct','humanoid','resist:poison','vuln:shock'],[{op:'status',id:'pinned',duration:2}]),
  m('ironwarren-spark-thief','Spark Thief','t','#b0a17d',18,8,2,'skirmisher','ironwarren',21,['humanoid','shock'],[{op:'damage',amount:5,damageType:'shock'}]),

  m('crystal-hollows-refraction-worm','Refraction Worm','w','#a8bee8',22,8,2,'stalker','crystal-hollows',41,['crystal','beast','resist:shock'],[{op:'teleport',radius:3}]),
  m('crystal-hollows-facet-magus','Facet Magus','m','#c5bce9',24,9,3,'caster','crystal-hollows',41,['crystal','caster'],[{op:'damage',amount:6,damageType:'shock'}]),
  m('venom-fen-thorn-mother','Thorn Mother','T','#91aa5d',30,9,4,'guard','venom-fen',41,['plant','venom','resist:poison','vuln:fire'],[{op:'status',id:'pinned',duration:2}]),
  m('venom-fen-gas-heron','Gas Heron','H','#aec873',20,9,1,'skirmisher','venom-fen',41,['beast','venom','resist:poison'],[{op:'status',id:'poisoned',duration:5,magnitude:2}]),
  m('storm-archive-arc-librarian','Arc Librarian','L','#b7c3e7',29,10,4,'caster','storm-archive',41,['humanoid','caster','shock','resist:shock'],[{op:'damage',amount:7,damageType:'shock'}]),
  m('storm-archive-silent-index','Silent Index','X','#949fbf',34,10,6,'guard','storm-archive',41,['construct','resist:shock','vuln:fire'],[{op:'status',id:'blinded',duration:2}]),

  m('ash-cathedral-cinder-monk','Cinder Monk','m','#c09178',28,11,3,'skirmisher','ash-cathedral',61,['humanoid','fire','resist:fire'],[{op:'status',id:'burning',duration:3}]),
  m('ash-cathedral-bell-titan','Bell Titan','T','#9b8679',44,12,7,'brute','ash-cathedral',61,['construct','fire','resist:fire','vuln:shock'],[{op:'push',distance:3}]),
  m('flesh-cloister-suture-knight','Suture Knight','K','#c17f87',37,12,5,'guard','flesh-cloister',61,['flesh','humanoid'],[{op:'status',id:'bleeding',duration:4,magnitude:2}]),
  m('flesh-cloister-marrow-oracle','Marrow Oracle','O','#d99da3',29,11,3,'caster','flesh-cloister',61,['flesh','caster','aberrant'],[{op:'status',id:'confused',duration:3}]),
  m('clockwork-necropolis-hour-reaper','Hour Reaper','R','#b49c6d',36,13,5,'skirmisher','clockwork-necropolis',61,['construct','undead','vuln:shock'],[{op:'status',id:'slowed',duration:3}]),
  m('clockwork-necropolis-coffin-factory','Coffin Factory','F','#a98e64',48,11,8,'guard','clockwork-necropolis',61,['construct','undead','resist:poison','vuln:shock'],[{op:'summon',tag:'undead',count:2}]),

  m('frozen-observatory-glass-wolf','Glass Wolf','w','#b5d4e0',31,12,3,'stalker','frozen-observatory',81,['ice','beast','resist:cold','vuln:fire'],[{op:'status',id:'chilled',duration:4}]),
  m('frozen-observatory-polar-seer','Polar Seer','P','#d3e9f0',28,12,3,'caster','frozen-observatory',81,['ice','caster','resist:cold','vuln:fire'],[{op:'status',id:'blinded',duration:3}]),
  m('sunken-palace-reef-duelist','Reef Duelist','D','#8eb9b5',35,13,4,'skirmisher','sunken-palace',81,['aquatic','humanoid','resist:shock'],[{op:'push',distance:2}]),
  m('sunken-palace-abyssal-courtier','Abyssal Courtier','A','#86aeb5',39,12,5,'caster','sunken-palace',81,['aquatic','undead','void'],[{op:'damage',amount:8,damageType:'void'}]),
  m('void-garden-null-bee','Null Bee','b','#a991c6',24,12,1,'swarm','void-garden',81,['void','vermin','resist:void'],[{op:'status',id:'unmoored',duration:2}]),
  m('void-garden-root-of-night','Root of Night','R','#9f83bb',43,13,6,'guard','void-garden',81,['plant','void','resist:void','vuln:fire'],[{op:'summon',tag:'plant',count:2}]),

  m('royal-chasm-oathbreaker','Oathbreaker','O','#c1a17a',44,15,6,'stalker','royal-chasm',101,['humanoid','undead'],[{op:'status',id:'armor-break',duration:5,magnitude:2}]),
  m('royal-chasm-crown-engine','Crown Engine','E','#b99a6b',52,14,9,'guard','royal-chasm',101,['construct','royal','vuln:shock'],[{op:'push',distance:3}]),
  m('dream-prison-night-bailiff','Night Bailiff','B','#aa93c2',41,14,5,'stalker','dream-prison',101,['spirit','aberrant','resist:void'],[{op:'status',id:'confused',duration:4}]),
  m('dream-prison-sleep-prosecutor','Sleep Prosecutor','P','#c0a2d4',36,14,4,'caster','dream-prison',101,['spirit','caster','aberrant'],[{op:'status',id:'pinned',duration:2}]),
  m('star-forge-molten-archon','Molten Archon','A','#e8b267',48,16,6,'caster','star-forge',101,['fire','construct','resist:fire','vuln:shock'],[{op:'damage',amount:10,damageType:'fire'}]),
  m('star-forge-gravity-smith','Gravity Smith','G','#d5a25f',58,17,8,'brute','star-forge',101,['construct','humanoid','star'],[{op:'push',distance:3}]),

  m('abyss-memory-thief','Memory Thief','M','#b785d4',46,16,4,'skirmisher','abyss',1,['void','aberrant','resist:void'],[{op:'status',id:'confused',duration:4}]),
  m('abyss-unfixed-saint','Unfixed Saint','S','#d998dc',60,18,7,'caster','abyss',1,['void','spirit','resist:void'],[{op:'summon',tag:'void',count:2}]),
  m('abyss-horizon-maw','Horizon Maw','M','#ef709f',76,21,8,'brute','abyss',1,['void','aberrant','resist:void'],[{op:'damage',amount:12,damageType:'void'}]),
];
