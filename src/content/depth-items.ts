import type { ItemDefinition } from '../core/types';

const i=(id:string,name:string,glyph:string,color:string,category:ItemDefinition['category'],rarity:number,tags:string[],effects:ItemDefinition['effects']):ItemDefinition=>({id,name,glyph,color,category,rarity,tags,effects});

export const DEPTH_ITEMS:ItemDefinition[]=[
  i('ring-of-thorns','Ring of Thorns','=','#87a46a','relic',2,['slot:ring','passive:attack:1','plant'],[]),
  i('ring-of-stone','Ring of Stone','=','#b2a58f','relic',2,['slot:ring','passive:defense:1','earth'],[]),
  i('ring-of-cinders','Ring of Cinders','=','#d58b5e','relic',3,['slot:ring','resist:fire','fire'],[]),
  i('ring-of-rime','Ring of Rime','=','#badde8','relic',3,['slot:ring','resist:cold','ice'],[]),
  i('ring-of-grounding','Ring of Grounding','=','#a9b8c7','relic',3,['slot:ring','resist:shock','construct'],[]),
  i('ring-of-antivenom','Ring of Antivenom','=','#9eb669','relic',3,['slot:ring','resist:poison','venom'],[]),
  i('ring-of-the-edge','Ring of the Edge','=','#b58bd1','relic',4,['slot:ring','resist:void','passive:mana:2','void'],[]),
  i('ring-of-fury','Ring of Fury','=','#cf7770','relic',4,['slot:ring','passive:attack:2','vuln:cold'],[]),
  i('ring-of-the-wall','Ring of the Wall','=','#a6a8aa','relic',4,['slot:ring','passive:defense:2','weight:3'],[]),
  i('ring-of-quick-study','Ring of Quick Study','=','#c7bd98','relic',4,['slot:ring','passive:mana:3','knowledge'],[]),

  i('lantern-amulet','Lantern Amulet','"','#dec980','relic',2,['slot:amulet','passive:mana:2','light'],[{op:'reveal',radius:8}]),
  i('warding-amulet','Warding Amulet','"','#d3caa5','relic',3,['slot:amulet','passive:defense:1','holy'],[{op:'status',id:'guarding',duration:4,magnitude:1}]),
  i('blood-knot-amulet','Blood-Knot Amulet','"','#ca737b','relic',3,['slot:amulet','passive:attack:1','flesh'],[{op:'heal',amount:4}]),
  i('tide-amulet','Tide Amulet','"','#85b8b5','relic',3,['slot:amulet','aquatic','resist:shock'],[{op:'status',id:'water-step',duration:10}]),
  i('grave-amulet','Grave Amulet','"','#c2b59d','relic',4,['slot:amulet','resist:poison','undead'],[{op:'status',id:'lucid',duration:6}]),
  i('prism-amulet','Prism Amulet','"','#b8c8ed','relic',4,['slot:amulet','passive:mana:4','crystal'],[]),
  i('crown-fragment','Crown Fragment','"','#d7b274','relic',5,['slot:amulet','passive:attack:1','passive:defense:1','passive:mana:2','royal'],[]),
  i('null-medallion','Null Medallion','"','#a986bf','relic',5,['slot:amulet','resist:void','passive:mana:5','void'],[]),

  i('grimoire-ember','Ash-Script Primer','+','#d99262','consumable',2,['grimoire','teaches:ember-dart'],[]),
  i('grimoire-rime','Rime Margin Notes','+','#bddfe9','consumable',2,['grimoire','teaches:rime-lance'],[]),
  i('grimoire-static','Copper Arc Manual','+','#b5c3e4','consumable',2,['grimoire','teaches:static-arc'],[]),
  i('grimoire-venom','Fen Apothegm','+','#a8bd6e','consumable',2,['grimoire','teaches:venom-mote'],[]),
  i('grimoire-force','Book of Pressure','+','#ced4dc','consumable',3,['grimoire','teaches:force-pulse'],[]),
  i('grimoire-blink','Folded Page','+','#c2a2db','consumable',3,['grimoire','teaches:blink'],[]),
  i('grimoire-ward','Stone Litany','+','#c0b19c','consumable',3,['grimoire','teaches:stone-ward'],[]),
  i('grimoire-sight','Surveyor Codex','+','#d6cfad','consumable',3,['grimoire','teaches:clear-sight'],[]),
  i('grimoire-miasma','Green Vapour Folio','+','#9eb66a','consumable',4,['grimoire','teaches:miasma-cloud'],[]),
  i('grimoire-bramble','Root-Bound Folio','+','#839f65','consumable',4,['grimoire','teaches:bramble-knot'],[]),
  i('grimoire-oil','Black Lamp Formula','+','#9b805d','consumable',3,['grimoire','teaches:oil-sigil'],[]),
  i('grimoire-void','Margin Beyond Margin','+','#b98bd2','consumable',5,['grimoire','teaches:void-mark'],[]),
  i('grimoire-sanctuary','Consecration Tablet','+','#ddd4ae','consumable',5,['grimoire','teaches:sanctuary'],[]),
  i('grimoire-ash-ring','Circular Ash Rite','+','#d5885e','consumable',5,['grimoire','teaches:ash-ring'],[]),
  i('grimoire-recall','Breath Ledger','+','#b7d5c0','consumable',5,['grimoire','teaches:recall-breath'],[]),
  i('grimoire-abyss','Unbordered Page','+','#b38bd0','consumable',5,['grimoire','teaches:abyss-step'],[]),

  i('holy-water','Holy Water','!','#dfe0c4','consumable',3,['holy','sanctify'],[{op:'heal',amount:5},{op:'status',id:'cleansed',duration:1}]),
  i('black-wax','Black Wax','!','#695d72','consumable',3,['curse','ritual'],[{op:'status',id:'focused',duration:14,magnitude:2}]),
  i('smiths-stone','Smiths Stone','?','#b49b7d','tool',4,['craft','enchant'],[]),
  i('pilgrim-bell','Pilgrim Bell','?','#d0c19a','tool',4,['holy','ritual'],[{op:'status',id:'guarding',duration:7,magnitude:1}]),
  i('grave-salt','Grave Salt','!','#c6bda9','consumable',2,['corpse','holy'],[{op:'status',id:'lucid',duration:7,magnitude:1}]),
  i('terrain-flare','Terrain Flare','?','#d49a69','tool',3,['mapping','terrain'],[{op:'reveal',radius:18}]),
];
