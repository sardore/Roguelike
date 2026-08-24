import type { ItemDefinition } from '../core/types';

const i=(id:string,name:string,glyph:string,color:string,category:ItemDefinition['category'],rarity:number,tags:string[],effects:ItemDefinition['effects']):ItemDefinition=>({id,name,glyph,color,category,rarity,tags,effects});

export const CLASSIC_ITEMS:ItemDefinition[]=[
  i('hooked-pike','Hooked Pike',')','#b69b7b','weapon',2,['polearm','hook'],[{op:'damage',amount:5},{op:'push',distance:1}]),
  i('butchers-cleaver','Butcher’s Cleaver',')','#b57a6d','weapon',2,['blade','meat'],[{op:'damage',amount:6}]),
  i('pilgrim-mace','Pilgrim Mace',')','#c7b798','weapon',2,['blunt','holy'],[{op:'damage',amount:5},{op:'status',id:'dazed',duration:1}]),
  i('glass-needle','Glass Needle',')','#b7cae8','weapon',3,['blade','crystal'],[{op:'damage',amount:6},{op:'status',id:'armor-break',duration:2,magnitude:1}]),
  i('grave-spade','Grave Spade',')','#a99984','weapon',3,['blunt','undead'],[{op:'damage',amount:7},{op:'push',distance:1}]),
  i('coil-sabre','Coil Sabre',')','#a8b7d9','weapon',3,['blade','shock'],[{op:'damage',amount:7,damageType:'shock'}]),
  i('winter-halberd','Winter Halberd',')','#bddbe6','weapon',4,['polearm','ice'],[{op:'damage',amount:8,damageType:'cold'},{op:'status',id:'chilled',duration:2}]),
  i('void-cudgel','Void Cudgel',')','#a887c4','weapon',4,['blunt','void'],[{op:'damage',amount:9,damageType:'void'},{op:'push',distance:1}]),
  i('cinder-longbow','Cinder Longbow',')','#cd8e62','weapon',4,['ranged','range:10','fire'],[{op:'damage',amount:9,damageType:'fire'}]),
  i('whisper-crossbow','Whisper Crossbow',')','#a89bc4','weapon',4,['ranged','range:10','dream'],[{op:'damage',amount:8},{op:'status',id:'confused',duration:1}]),

  i('delvers-mail','Delver’s Mail','[','#9a9c91','armor',2,['medium','survival'],[{op:'status',id:'armor',duration:999,magnitude:3}]),
  i('pilgrim-robe','Pilgrim Robe','[','#c8bda2','armor',2,['light','holy'],[{op:'status',id:'focused',duration:999}]),
  i('storm-hide','Storm Hide','[','#9fb0ca','armor',3,['medium','shock','resist:shock'],[{op:'status',id:'armor',duration:999,magnitude:3}]),
  i('bog-walker-mail','Bog-Walker Mail','[','#899c67','armor',3,['medium','venom','resist:poison'],[{op:'status',id:'poison-ward',duration:999}]),
  i('emberglass-plate','Emberglass Plate','[','#b89782','armor',4,['heavy','fire','resist:fire'],[{op:'status',id:'armor',duration:999,magnitude:6}]),
  i('nightweave','Nightweave','[','#9a87b4','armor',4,['light','void','resist:void'],[{op:'status',id:'lucid',duration:999}]),

  i('scroll-of-flight','Glyph of Passage','?','#d6cfae','consumable',2,['scroll','escape'],[{op:'teleport',radius:7}]),
  i('scroll-of-mapping','Glyph of Deep Mapping','?','#cfc6a4','consumable',2,['scroll','mapping'],[{op:'reveal',radius:30}]),
  i('scroll-of-stillness','Glyph of Stillness','?','#c2c9d8','consumable',3,['scroll','control'],[{op:'status',id:'stasis',duration:2}]),
  i('scroll-of-ruin','Glyph of Ruin','?','#d6a07f','consumable',3,['scroll','offense'],[{op:'damage',amount:13,damageType:'physical'},{op:'status',id:'armor-break',duration:4,magnitude:2}]),
  i('scroll-of-cinders','Glyph of Cinders','?','#d88e61','consumable',3,['scroll','fire'],[{op:'damage',amount:12,damageType:'fire'}]),
  i('scroll-of-rime','Glyph of Rime','?','#bddde9','consumable',3,['scroll','ice'],[{op:'damage',amount:10,damageType:'cold'},{op:'status',id:'chilled',duration:4}]),
  i('scroll-of-thunder','Glyph of Thunder','?','#aebee5','consumable',4,['scroll','shock'],[{op:'damage',amount:14,damageType:'shock'}]),
  i('scroll-of-the-edge','Glyph of the Edge','?','#b796d1','consumable',4,['scroll','void'],[{op:'damage',amount:14,damageType:'void'},{op:'teleport',radius:4}]),

  i('iron-skin-draught','Iron-Skin Draught','!','#a6a9a5','consumable',2,['potion','defense'],[{op:'status',id:'guarding',duration:8,magnitude:2}]),
  i('hunters-draught','Hunter’s Draught','!','#b49a72','consumable',2,['potion','focus'],[{op:'status',id:'focused',duration:14},{op:'ammo',amount:4}]),
  i('deep-breath-tonic','Deep-Breath Tonic','!','#84adb3','consumable',2,['potion','survival'],[{op:'heal',amount:7},{op:'nutrition',amount:260}]),
  i('whitefire-tonic','Whitefire Tonic','!','#dfb07d','consumable',3,['potion','fire'],[{op:'status',id:'fire-ward',duration:14},{op:'status',id:'hasted',duration:3}]),
  i('rimeblood-tonic','Rimeblood Tonic','!','#bad7e1','consumable',3,['potion','ice'],[{op:'status',id:'cold-ward',duration:14},{op:'heal',amount:5}]),
  i('clear-mind-tonic','Clear-Mind Tonic','!','#c6b8db','consumable',3,['potion','dream'],[{op:'status',id:'lucid',duration:18},{op:'status',id:'focused',duration:8}]),
  i('venom-eater-tonic','Venom-Eater Tonic','!','#9eb56c','consumable',3,['potion','venom'],[{op:'status',id:'antivenom',duration:28},{op:'heal',amount:5}]),
  i('last-chance-phial','Last-Chance Phial','!','#d48f94','consumable',4,['potion','medicine'],[{op:'heal',amount:24},{op:'teleport',radius:5}]),

  i('lantern-of-sighs','Lantern of Sighs','"','#c9bc93','relic',4,['light','spirit'],[{op:'reveal',radius:22},{op:'status',id:'focused',duration:8}]),
  i('stone-saints-tooth','Stone Saint’s Tooth','"','#c5c0ac','relic',4,['holy','defense'],[{op:'status',id:'guarding',duration:6,magnitude:2}]),
  i('serpent-knot','Serpent Knot','"','#91ae67','relic',4,['venom'],[{op:'status',id:'antivenom',duration:20},{op:'heal',amount:4}]),
  i('storm-prayer-wheel','Storm Prayer Wheel','"','#aabce3','relic',4,['shock'],[{op:'damage',amount:10,damageType:'shock'},{op:'status',id:'focused',duration:5}]),
  i('mirror-of-false-doors','Mirror of False Doors','"','#b9c8e1','relic',5,['crystal','escape'],[{op:'teleport',radius:9},{op:'reveal',radius:12}]),
  i('black-pilgrim-bell','Black Pilgrim Bell','"','#a28ab8','relic',5,['void','spirit'],[{op:'damage',amount:12,damageType:'void'},{op:'status',id:'lucid',duration:8}]),
  i('crownless-seal','Crownless Seal','"','#c6a87c','relic',5,['royal','defense'],[{op:'status',id:'guarding',duration:10,magnitude:2},{op:'heal',amount:6}]),
  i('starved-star','The Starved Star','"','#e2ba67','relic',5,['star','fire'],[{op:'damage',amount:16,damageType:'fire'},{op:'nutrition',amount:180}])
];
