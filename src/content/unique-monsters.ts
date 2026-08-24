import type { MonsterDefinition } from '../core/types';

const u=(theme:string,id:string,name:string,glyph:string,color:string,hp:number,attack:number,defense:number,ai:MonsterDefinition['ai'],minDepth:number,tags:string[],ability:MonsterDefinition['abilities'][number]):MonsterDefinition=>({
  id:`unique-${theme}-${id}`,name,glyph,color,maxHp:hp,attack,defense,ai,minDepth,
  tags:[...tags,'unique',`theme:${theme}`],abilities:[ability]
});

export const UNIQUE_MONSTERS:MonsterDefinition[]=[
  u('moss-cistern','old-valve-king','The Old Valve King','K','#b7c486',38,8,4,'guard',1,['humanoid','plant'],{op:'status',id:'pinned',duration:2}),
  u('drowned-aqueduct','mother-nine-gills','Mother Nine-Gills','M','#7eb5bd',44,9,3,'skirmisher',1,['aquatic','beast'],{op:'push',distance:2}),
  u('ember-mine','foreman-vask','Foreman Vask','V','#d49362',52,11,6,'brute',1,['humanoid','fire'],{op:'damage',amount:8,damageType:'fire'}),
  u('fungal-vault','saint-mycel','Saint Mycel','Y','#c6bd70',58,12,5,'caster',21,['fungal','caster'],{op:'status',id:'confused',duration:3}),
  u('ossuary-terraces','ledger-of-the-dead','The Dead Ledger','L','#d4cab3',60,12,7,'guard',21,['undead','spirit'],{op:'summon',tag:'undead',count:2}),
  u('ironwarren','nine-rivet-queen','Nine-Rivet Queen','Q','#b19a74',66,13,8,'guard',21,['construct','humanoid'],{op:'push',distance:3}),
  u('crystal-hollows','choir-of-one','Choir-of-One','C','#c2cdf1',62,14,5,'caster',41,['crystal','spirit'],{op:'damage',amount:10,damageType:'shock'}),
  u('venom-fen','reed-father','The Reed Father','F','#9caf68',72,15,6,'stalker',41,['venom','plant','resist:poison'],{op:'status',id:'poisoned',duration:5,magnitude:2}),
  u('storm-archive','index-zero','Index Zero','0','#b6c1e2',70,15,7,'caster',41,['construct','caster','shock'],{op:'damage',amount:11,damageType:'shock'}),
  u('ash-cathedral','bell-without-rope','The Bell Without a Rope','B','#c69b82',78,16,8,'guard',61,['undead','fire'],{op:'status',id:'blinded',duration:4}),
  u('flesh-cloister','red-prioress','The Red Prioress','P','#d88490',74,17,5,'caster',61,['flesh','humanoid','caster'],{op:'status',id:'slowed',duration:4}),
  u('clockwork-necropolis','last-undertaker','The Last Undertaker','U','#c2a66f',84,17,9,'brute',61,['construct','undead'],{op:'summon',tag:'construct',count:2}),
  u('frozen-observatory','astronomer-white','Astronomer White','A','#d2e9f0',80,18,6,'caster',81,['ice','caster','resist:cold'],{op:'damage',amount:12,damageType:'cold'}),
  u('sunken-palace','pearl-regent','The Pearl Regent','R','#91c1bb',90,18,9,'guard',81,['aquatic','royal'],{op:'push',distance:3}),
  u('void-garden','gardener-at-night','The Gardener at Night','G','#b58dca',86,19,6,'caster',81,['void','plant','caster'],{op:'teleport',radius:6}),
  u('royal-chasm','king-below','The King Below','K','#d1ad78',98,21,10,'brute',101,['royal','humanoid'],{op:'status',id:'armor-break',duration:5,magnitude:3}),
  u('dream-prison','warden-who-sleeps','The Warden Who Sleeps','W','#b397ca',92,20,8,'caster',101,['dream','aberrant','caster'],{op:'status',id:'confused',duration:4}),
  u('star-forge','smith-of-last-light','Smith of the Last Light','S','#efc46e',112,23,11,'brute',101,['star','fire','construct'],{op:'damage',amount:15,damageType:'fire'}),
  u('abyss','fold-at-the-end','The Fold at the End','@','#d58be2',130,25,9,'caster',1,['void','aberrant','resist:void'],{op:'damage',amount:16,damageType:'void'})
];
