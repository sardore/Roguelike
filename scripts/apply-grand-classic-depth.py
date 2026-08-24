from pathlib import Path
import re


def patch(path, old, new, label):
    p=Path(path); s=p.read_text()
    if new in s:
        return
    if old not in s:
        raise RuntimeError(f'missing anchor {label} in {path}')
    p.write_text(s.replace(old,new,1))

# ---------- types / save ----------
patch('src/core/types.ts',
"export type TileKind = 'wall' | 'floor' | 'water' | 'lava' | 'bridge' | 'rubble';",
"export type TileKind = 'wall' | 'floor' | 'water' | 'lava' | 'bridge' | 'rubble' | 'ice' | 'miasma' | 'bramble' | 'void-rift' | 'oil' | 'holy';",
'extended tile kinds')
patch('src/core/types.ts',
"  ammo: number;\n  kills: number;",
"  ammo: number;\n  mana: number;\n  maxMana: number;\n  knownSpells: string[];\n  preparedSpellId?: string | undefined;\n  kills: number;",
'player mana')
patch('src/core/types.ts',
"  equippedWeaponId?: EntityId | undefined;\n  equippedArmorId?: EntityId | undefined;",
"  equippedWeaponId?: EntityId | undefined;\n  equippedArmorId?: EntityId | undefined;\n  equippedRingIds: EntityId[];\n  equippedAmuletId?: EntityId | undefined;\n  patronId?: string | undefined;\n  piety: number;",
'equipment and patron')
patch('src/core/types.ts',
"  | 'forge-anvil' | 'mushroom-patch' | 'memory-stone' | 'blood-well';\nexport interface DungeonFeature extends Point { id: EntityId; kind: DungeonFeatureKind; revealed: boolean; spent: boolean; }",
"  | 'forge-anvil' | 'mushroom-patch' | 'memory-stone' | 'blood-well' | 'corpse';\nexport interface DungeonFeature extends Point { id: EntityId; kind: DungeonFeatureKind; revealed: boolean; spent: boolean; sourceDefId?: string; }",
'corpse feature')
patch('src/core/types.ts',
"export type SiteKind = 'town-square' | 'merchant' | 'healer' | 'appraiser' | 'cartographer' | 'shrine' | 'camp' | 'provisioner' | 'trainer' | 'inn';\nexport type SiteServiceKind = 'rumor' | 'buy' | 'sell' | 'heal' | 'cleanse' | 'identify' | 'map' | 'bless' | 'rest' | 'meal' | 'train-attack' | 'train-defense' | 'train-vigor' | 'inn-rest';",
"export type SiteKind = 'town-square' | 'merchant' | 'healer' | 'appraiser' | 'cartographer' | 'shrine' | 'camp' | 'provisioner' | 'trainer' | 'inn' | 'guildhall' | 'smithy';\nexport type SiteServiceKind = 'rumor' | 'buy' | 'sell' | 'heal' | 'cleanse' | 'identify' | 'map' | 'bless' | 'rest' | 'meal' | 'train-attack' | 'train-defense' | 'train-vigor' | 'inn-rest' | 'devote' | 'invoke' | 'contract' | 'claim-contract' | 'temper-weapon' | 'temper-armor' | 'uncurse';",
'site expansion')
patch('src/core/types.ts',
"export interface StoryEvent { id: string; title: string; body: string; severity: 'major'; }\nexport interface GameState {\n  schemaVersion: 5;",
"export type QuestKind = 'hunt' | 'delve' | 'unique';\nexport interface QuestState { id:string; kind:QuestKind; status:'active'|'complete'|'claimed'; progress:number; goal:number; rewardGold:number; sourceSiteId:string; startDepth?:number; }\nexport interface StoryEvent { id: string; title: string; body: string; severity: 'major'; }\nexport interface GameState {\n  schemaVersion: 6;",
'quest types and schema')
patch('src/core/types.ts',
"  identifiedItemDefs: string[];\n  floor: FloorMap;",
"  identifiedItemDefs: string[];\n  itemSanctityOverrides: Record<EntityId,'cursed'|'mundane'|'blessed'>;\n  itemEnchantments: Record<EntityId,number>;\n  quests: QuestState[];\n  floor: FloorMap;",
'item state and quests')
patch('src/core/types.ts',
"  | { type: 'fire' }\n  | { type: 'use-item'; itemId: EntityId }",
"  | { type: 'fire' }\n  | { type: 'interact' }\n  | { type: 'cast-spell'; spellId: string }\n  | { type: 'use-item'; itemId: EntityId }",
'new actions')

p=Path('src/core/save.ts'); s=p.read_text();
s=s.replace('interface SaveEnvelope { version:5;', 'interface SaveEnvelope { version:6;').replace('interface SaveLedger { version:5;', 'interface SaveLedger { version:6;')
s=s.replace("const SAVE_KEY='abyssal-roguelike:save:v5', LEDGER_KEY='abyssal-roguelike:ledger:v5';", "const SAVE_KEY='abyssal-roguelike:save:v6', LEDGER_KEY='abyssal-roguelike:ledger:v6';")
s=s.replace("const LEGACY_SAVE_KEYS=['abyssal-roguelike:save:v4'", "const LEGACY_SAVE_KEYS=['abyssal-roguelike:save:v5','abyssal-roguelike:save:v4'")
s=s.replace('e.version!==5||e.state.schemaVersion!==5','e.version!==6||e.state.schemaVersion!==6').replace('envelope.version!==5||envelope.state.schemaVersion!==5','envelope.version!==6||envelope.state.schemaVersion!==6')
s=s.replace('{version:5,runId:', '{version:6,runId:').replace('{version:5,runId:', '{version:6,runId:')
p.write_text(s)

# ---------- origins / content ----------
patch('src/content/origins.ts',
"  ammo:number;\n  inventory:string[];",
"  ammo:number;\n  mana:number;\n  spells:string[];\n  inventory:string[];",
'origin spell fields')
for anchor,repl in [
("hp:34,attack:5,defense:1,gold:22,ammo:5,", "hp:34,attack:5,defense:1,gold:22,ammo:5,mana:8,spells:['clear-sight'],"),
("hp:40,attack:5,defense:2,gold:15,ammo:0,", "hp:40,attack:5,defense:2,gold:15,ammo:0,mana:5,spells:['stone-ward'],"),
("hp:29,attack:4,defense:1,gold:18,ammo:15,", "hp:29,attack:4,defense:1,gold:18,ammo:15,mana:6,spells:['blink'],"),
("hp:35,attack:5,defense:1,gold:34,ammo:8,", "hp:35,attack:5,defense:1,gold:34,ammo:8,mana:6,spells:['force-pulse'],"),
("hp:32,attack:4,defense:2,gold:8,ammo:2,", "hp:32,attack:4,defense:2,gold:8,ammo:2,mana:11,spells:['ember-dart','sanctuary'],"),
]: patch('src/content/origins.ts',anchor,repl,'origin stats')
patch('src/content/items.ts',
"import { FOUNDATION_ITEMS } from './foundation-items';",
"import { FOUNDATION_ITEMS } from './foundation-items';\nimport { DEPTH_ITEMS } from './depth-items';",
'depth item import')
patch('src/content/items.ts',
'ITEMS.push(...EXTRA_ITEMS,...FOUNDATION_ITEMS,...CLASSIC_ITEMS);',
'ITEMS.push(...EXTRA_ITEMS,...FOUNDATION_ITEMS,...CLASSIC_ITEMS,...DEPTH_ITEMS);',
'depth item append')

# ---------- features ----------
p=Path('src/world/features.ts'); s=p.read_text()
s=s.replace("  tags: string[];\n}", "  tags: string[];\n  trigger: 'step' | 'interact';\n}",1)
start=s.index('const defs: FeatureDefinition[] = [')
end=s.index('];',start)+2
new_defs="""const defs: FeatureDefinition[] = [
  { kind: 'spike-trap', glyph: '^', color: '#b77f75', hidden: true, repeatable: true, label: 'spike trap', tags: ['trap','physical'], trigger:'step' },
  { kind: 'snare-rune', glyph: '^', color: '#aaa07c', hidden: true, repeatable: false, label: 'snare rune', tags: ['trap','control'], trigger:'step' },
  { kind: 'teleport-rune', glyph: '^', color: '#a78ac7', hidden: true, repeatable: true, label: 'teleport rune', tags: ['trap','void'], trigger:'step' },
  { kind: 'alarm-rune', glyph: '^', color: '#c58b72', hidden: true, repeatable: false, label: 'alarm rune', tags: ['trap','summon'], trigger:'step' },
  { kind: 'healing-spring', glyph: '{', color: '#74b8b4', hidden: false, repeatable: false, label: 'healing spring', tags: ['boon','water'], trigger:'interact' },
  { kind: 'warding-altar', glyph: '_', color: '#d0c79f', hidden: false, repeatable: false, label: 'warding altar', tags: ['boon','ward'], trigger:'interact' },
  { kind: 'unstable-cache', glyph: '&', color: '#c8a76d', hidden: false, repeatable: false, label: 'unstable cache', tags: ['loot'], trigger:'interact' },
  { kind: 'food-cache', glyph: '%', color: '#d3ab73', hidden: false, repeatable: false, label: 'provision cache', tags: ['loot','food'], trigger:'interact' },
  { kind: 'ammo-crate', glyph: ';', color: '#a9a49c', hidden: false, repeatable: false, label: 'ammunition crate', tags: ['loot','ammo'], trigger:'interact' },
  { kind: 'ancient-grave', glyph: '†', color: '#bdb29d', hidden: false, repeatable: false, label: 'ancient grave', tags: ['lore','undead','risk'], trigger:'interact' },
  { kind: 'bookshelf', glyph: '≡', color: '#bba985', hidden: false, repeatable: false, label: 'sealed bookshelf', tags: ['lore','knowledge'], trigger:'interact' },
  { kind: 'forge-anvil', glyph: '∩', color: '#cb966a', hidden: false, repeatable: false, label: 'field anvil', tags: ['craft','fire','construct'], trigger:'interact' },
  { kind: 'mushroom-patch', glyph: ';', color: '#a8a564', hidden: false, repeatable: false, label: 'mushroom patch', tags: ['food','fungal','risk'], trigger:'interact' },
  { kind: 'memory-stone', glyph: '♦', color: '#a4a7d1', hidden: false, repeatable: false, label: 'memory stone', tags: ['lore','spirit'], trigger:'interact' },
  { kind: 'blood-well', glyph: '{', color: '#bb6872', hidden: false, repeatable: false, label: 'blood well', tags: ['boon','flesh','risk'], trigger:'interact' },
  { kind: 'corpse', glyph: '%', color: '#9a776b', hidden: false, repeatable: false, label: 'corpse', tags: ['corpse','food','risk'], trigger:'interact' },
];"""
s=s[:start]+new_defs+s[end:]
s=s.replace('  return defs.map((def) => {','  return defs.filter((def)=>def.kind!==\'corpse\').map((def) => {',1)
p.write_text(s)

# ---------- sites ----------
patch('src/world/sites.ts',
"  { kind: 'shrine', glyph: '_', color: '#d7cfaf', services: ['bless'], settlementWeight: 3, roadsideWeight: 2 },",
"  { kind: 'shrine', glyph: '_', color: '#d7cfaf', services: ['bless','devote','invoke'], settlementWeight: 3, roadsideWeight: 2 },",
'shrine patron services')
patch('src/world/sites.ts',
"  { kind: 'inn', glyph: 'I', color: '#d2b18a', services: ['inn-rest','meal'], settlementWeight: 4, roadsideWeight: 1 },\n];",
"  { kind: 'inn', glyph: 'I', color: '#d2b18a', services: ['inn-rest','meal'], settlementWeight: 4, roadsideWeight: 1 },\n  { kind: 'guildhall', glyph: 'G', color: '#9fb6d6', services: ['contract','claim-contract'], settlementWeight: 3, roadsideWeight: 0 },\n  { kind: 'smithy', glyph: 'F', color: '#d49a70', services: ['temper-weapon','temper-armor','uncurse'], settlementWeight: 3, roadsideWeight: 0 },\n];",
'new site defs')
patch('src/world/sites.ts',
"  if (service === 'train-vigor') return 40;\n  return 0;",
"  if (service === 'train-vigor') return 40;\n  if (service === 'temper-weapon' || service === 'temper-armor') return 28;\n  if (service === 'uncurse') return 18;\n  return 0;",
'new service prices')
patch('src/world/sites.ts',
"    if (!tile.walkable || tile.kind === 'water' || tile.kind === 'lava') continue;",
"    if (!tile.walkable || !['floor','bridge','rubble','holy'].includes(tile.kind)) continue;",
'site hazard avoidance')

# ---------- combat equipment tags ----------
p=Path('src/core/combat-rules.ts'); s=p.read_text()
s=s.replace("import { itemById } from '../content/items';", "import { equippedDefinitions } from './item-state';")
old=s[s.index('function equippedArmor'):s.index('export function weaponDamageType')]
new="""function equippedGear(state: GameState): ItemDefinition[] { return equippedDefinitions(state).map((entry)=>entry.def); }
function equipmentGrants(gear: ItemDefinition[], statusId: string): boolean { return gear.some((def)=>def.effects.some((effect)=>effect.op==='status'&&effect.id===statusId)); }
function playerHas(state: GameState, gear: ItemDefinition[], statusId: string): boolean { return state.player.statuses.some((status)=>status.id===statusId&&status.duration>0)||equipmentGrants(gear,statusId); }
export function playerDamageMultiplier(state: GameState, damageType: DamageType): number {
  const gear=equippedGear(state),tags=gear.flatMap((def)=>def.tags);
  const explicit = explicitMultiplier(tags, damageType);
  if (explicit !== null) return explicit;
  if (damageType === 'fire' && playerHas(state, gear, 'fire-ward')) return 0.5;
  if (damageType === 'cold' && playerHas(state, gear, 'cold-ward')) return 0.5;
  if (damageType === 'poison' && (playerHas(state, gear, 'poison-ward') || playerHas(state, gear, 'antivenom'))) return 0.35;
  if (damageType === 'shock' && tags.includes('aquatic')) return 1.25;
  if (damageType === 'void' && playerHas(state, gear, 'lucid')) return 0.7;
  return 1;
}

"""
s=s.replace(old,new)
p.write_text(s)

# ---------- site actions ----------
patch('src/core/site-actions.ts',
"import { feedPlayer } from './foundations';",
"import { feedPlayer } from './foundations';\nimport { PATRONS, patronById } from '../content/patrons';\nimport { addEnchantment, equippedItemIds, sanctityFor, setSanctity } from './item-state';\nimport { claimContract, createContract } from './quests';",
'site action imports')
patch('src/core/site-actions.ts',
"    if(state.player.equippedWeaponId===entry.id)state.player.equippedWeaponId=undefined;if(state.player.equippedArmorId===entry.id)state.player.equippedArmorId=undefined;\n    const price=sellPrice(entry.defId);",
"    if(equippedItemIds(state).includes(entry.id)&&sanctityFor(state,entry.id)==='cursed'){pushMessage(state,'The cursed item will not leave you.');return false;}\n    if(state.player.equippedWeaponId===entry.id)state.player.equippedWeaponId=undefined;if(state.player.equippedArmorId===entry.id)state.player.equippedArmorId=undefined;state.player.equippedRingIds=state.player.equippedRingIds.filter((id)=>id!==entry.id);if(state.player.equippedAmuletId===entry.id)state.player.equippedAmuletId=undefined;\n    const price=sellPrice(entry.defId);",
'cursed selling')
insert_anchor="  const price=servicePrice(action.service);if(price&&!pay(state,price))return false;\n"
insert_code="""  if(action.service==='devote'){
    const patron=action.offerId?PATRONS.find((entry)=>entry.id===action.offerId):undefined;if(!patron)return false;
    state.player.patronId=patron.id;state.player.piety=Math.max(3,state.player.piety);pushMessage(state,`You devote yourself to ${patron.name}.`);return true;
  }
  if(action.service==='invoke'){
    if(!state.player.patronId){pushMessage(state,'You have sworn to no patron.');return false;}const patron=patronById(state.player.patronId);if(state.player.piety<patron.invokeCost){pushMessage(state,'Your piety is too weak for an invocation.');return false;}state.player.piety-=patron.invokeCost;
    if(patron.invoke.heal)state.player.hp=Math.min(state.player.maxHp,state.player.hp+patron.invoke.heal);if(patron.invoke.mana)state.player.mana=Math.min(state.player.maxMana,state.player.mana+patron.invoke.mana);if(patron.invoke.nutrition)feedPlayer(state,patron.invoke.nutrition);for(const status of patron.invoke.statuses)addStatus(state,status.id,status.duration,status.magnitude,site.id);pushMessage(state,`${patron.name} answers your invocation.`);return true;
  }
  if(action.service==='contract'){
    const kind=action.offerId as 'hunt'|'delve'|'unique'|undefined;if(!kind)return false;const quest=createContract(state,site.id,kind);if(!quest){pushMessage(state,'You already carry a similar contract.');return false;}state.quests.push(quest);pushMessage(state,`You accept a ${kind} contract.`);return true;
  }
  if(action.service==='claim-contract'){
    if(!action.offerId)return false;const quest=claimContract(state,action.offerId);if(!quest){pushMessage(state,'That contract is not ready to claim.');return false;}state.player.gold+=quest.rewardGold;if(state.player.patronId)state.player.piety+=2;pushMessage(state,`The guild pays ${quest.rewardGold} gold for the completed contract.`);return true;
  }
  const price=servicePrice(action.service);if(price&&!pay(state,price))return false;
  if(action.service==='temper-weapon'||action.service==='temper-armor'){
    const itemId=action.service==='temper-weapon'?state.player.equippedWeaponId:state.player.equippedArmorId;if(!itemId){pushMessage(state,'You have nothing suitable equipped.');return refund(state,price);}const next=addEnchantment(state,itemId,1);pushMessage(state,`The smith tempers your equipment to +${next}.`);return true;
  }
  if(action.service==='uncurse'){
    const target=equippedItemIds(state).find((id)=>sanctityFor(state,id)==='cursed');if(!target){pushMessage(state,'No equipped item is cursed.');return refund(state,price);}setSanctity(state,target,'mundane');pushMessage(state,'The binding curse breaks with a metallic sigh.');return true;
  }
"""
patch('src/core/site-actions.ts',insert_anchor,insert_code,'expanded site actions')
patch('src/core/site-actions.ts',
"  if(action.service==='bless'){addStatus(state,'focused',28,1,site.id);addStatus(state,'guarding',5,1,site.id);markUsed(state,site.id,'bless');pushMessage(state,'The shrine grants a long blessing.');return true;}",
"  if(action.service==='bless'){addStatus(state,'focused',28,1,site.id);addStatus(state,'guarding',5,1,site.id);const target=equippedItemIds(state)[0];if(target)setSanctity(state,target,'blessed');markUsed(state,site.id,'bless');pushMessage(state,'The shrine grants a long blessing and sanctifies your readied gear.');return true;}",
'bless gear')
patch('src/core/site-actions.ts',
"  if(action.service==='inn-rest'){state.player.hp=state.player.maxHp;feedPlayer(state,Math.floor(state.player.maxHunger*.7));state.player.statuses=state.player.statuses.filter((status)=>!statusById(status.id).harmful);markUsed(state,site.id,'inn-rest');pushMessage(state,'You sleep safely, eat well, and wake restored.');return true;}",
"  if(action.service==='inn-rest'){state.player.hp=state.player.maxHp;state.player.mana=state.player.maxMana;feedPlayer(state,Math.floor(state.player.maxHunger*.7));state.player.statuses=state.player.statuses.filter((status)=>!statusById(status.id).harmful);markUsed(state,site.id,'inn-rest');pushMessage(state,'You sleep safely, eat well, and wake restored.');return true;}",
'inn mana')

# ---------- game core ----------
patch('src/core/game.ts',
"import { DEFAULT_AMMO, DEFAULT_MAX_HUNGER, addAmmo, applyMetabolism, autoExploreStep, canCarryDefinition, canRestSafely, encumbranceDefensePenalty, feedPlayer, grantKillProgress, hardCarryLimit, hungerAttackPenalty, hungerDefensePenalty, inventoryWeight, isRangedWeapon, weaponRange, xpThreshold } from './foundations';",
"import { DEFAULT_AMMO, DEFAULT_MAX_HUNGER, addAmmo, applyMetabolism, autoExploreStep, canCarryDefinition, canRestSafely, encumbranceDefensePenalty, feedPlayer, grantKillProgress, hardCarryLimit, hungerAttackPenalty, hungerDefensePenalty, inventoryWeight, isRangedWeapon, weaponRange, xpThreshold } from './foundations';\nimport { SPELLS, spellById } from '../content/spells';\nimport { applyThemedTerrain, terrainDefinition, terrainTile } from '../world/terrain-rules';\nimport { canUnequip, equipAccessory, isEquipped, passiveAttackBonus, passiveDefenseBonus, sanctityFor } from './item-state';\nimport { recordDescent, recordMonsterKill } from './quests';",
'game grand imports')
patch('src/core/game.ts',
"  state.features = generateFeatures(state.floor, context.primary, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'features')), state.sites);\n  populateFloor(state, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'population')));",
"  state.features = generateFeatures(state.floor, context.primary, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'features')), state.sites);\n  applyThemedTerrain(state.floor,context.primary,state.coord,new DeterministicRng(deriveSeed(state.runSeed,state.coord.depth,state.coord.lane,'terrain')),[...state.sites,...state.features]);\n  populateFloor(state, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'population')));",
'theme terrain floor transition')
patch('src/core/game.ts',
"    schemaVersion: 5,",
"    schemaVersion: 6,",
'game schema')
patch('src/core/game.ts',
"    identifiedItemDefs: [],\n    floor,",
"    identifiedItemDefs: [],\n    itemSanctityOverrides: {},\n    itemEnchantments: {},\n    quests: [],\n    floor,",
'game item state')
old_player="    player: { id: 'player', x: floor.spawn.x, y: floor.spawn.y, hp: origin.hp, maxHp: origin.hp, attack: origin.attack, defense: origin.defense, gold: origin.gold, level: 1, xp: 0, xpToNext: xpThreshold(1), hunger: DEFAULT_MAX_HUNGER, maxHunger: DEFAULT_MAX_HUNGER, ammo: origin.ammo ?? DEFAULT_AMMO, kills: 0, floorsVisited: 1, inventory: startInventory, statuses: [], ...(weaponEntry?{equippedWeaponId:weaponEntry.id}:{}), ...(armorEntry?{equippedArmorId:armorEntry.id}:{}) },"
new_player="    player: { id: 'player', x: floor.spawn.x, y: floor.spawn.y, hp: origin.hp, maxHp: origin.hp, attack: origin.attack, defense: origin.defense, gold: origin.gold, level: 1, xp: 0, xpToNext: xpThreshold(1), hunger: DEFAULT_MAX_HUNGER, maxHunger: DEFAULT_MAX_HUNGER, ammo: origin.ammo ?? DEFAULT_AMMO, mana: origin.mana, maxMana: origin.mana, knownSpells:[...origin.spells], preparedSpellId:origin.spells[0], kills: 0, floorsVisited: 1, inventory: startInventory, statuses: [], equippedRingIds:[], piety:0, ...(weaponEntry?{equippedWeaponId:weaponEntry.id}:{}), ...(armorEntry?{equippedArmorId:armorEntry.id}:{}) },"
patch('src/core/game.ts',old_player,new_player,'player grand state')
patch('src/core/game.ts',
"  state.features = generateFeatures(floor, context.primary, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'features')), state.sites);\n  populateFloor(state, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'population')));",
"  state.features = generateFeatures(floor, context.primary, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'features')), state.sites);\n  applyThemedTerrain(floor,context.primary,coord,new DeterministicRng(deriveSeed(runSeed,coord.depth,coord.lane,'terrain')),[...state.sites,...state.features]);\n  populateFloor(state, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'population')));",
'initial theme terrain')
patch('src/core/game.ts',
"  state.player.floorsVisited += 1;\n  pushMessage(state, kind === 'down' ? 'You descend.'",
"  state.player.floorsVisited += 1;\n  recordDescent(state);\n  pushMessage(state, kind === 'down' ? 'You descend.'",
'quest descent')
patch('src/core/game.ts',
"  grantKillProgress(state,def,monster.power,(message)=>pushMessage(state,message));\n  const isUnique=def.tags.includes('unique');",
"  grantKillProgress(state,def,monster.power,(message)=>pushMessage(state,message));\n  const isUnique=def.tags.includes('unique');\n  recordMonsterKill(state,isUnique);\n  if(state.player.patronId&&isUnique)state.player.piety+=3;\n  if(!def.tags.some((tag)=>['construct','spirit','ooze'].includes(tag))&&!state.features.some((feature)=>feature.x===monster.x&&feature.y===monster.y)&&!state.sites.some((site)=>site.x===monster.x&&site.y===monster.y))state.features.push({id:`corpse-${monster.id}`,kind:'corpse',x:monster.x,y:monster.y,revealed:true,spent:false,sourceDefId:def.id});",
'corpse quest piety kill')
patch('src/core/game.ts',
"  return Math.max(1, state.player.attack + bonus + statusMagnitude(state.player.statuses, 'attackDelta') - hungerAttackPenalty(state));",
"  return Math.max(1, state.player.attack + bonus + passiveAttackBonus(state) + statusMagnitude(state.player.statuses, 'attackDelta') - hungerAttackPenalty(state));",
'passive attack')
patch('src/core/game.ts',
"  return Math.max(0, state.player.defense + armorBonus + statusMagnitude(state.player.statuses, 'defenseDelta') - hungerDefensePenalty(state) - encumbranceDefensePenalty(state));",
"  return Math.max(0, state.player.defense + armorBonus + passiveDefenseBonus(state) + statusMagnitude(state.player.statuses, 'defenseDelta') - hungerDefensePenalty(state) - encumbranceDefensePenalty(state));",
'passive defense')
# replace tileForKind body
p=Path('src/core/game.ts'); s=p.read_text()
s=re.sub(r"function tileForKind\(kind: TileKind\): Tile \{.*?\n\}", "function tileForKind(kind: TileKind): Tile { return terrainTile(kind); }", s, count=1, flags=re.S)
p.write_text(s)

# feature interaction gating + corpse
patch('src/core/game.ts',
"function resolveFeatureAtPlayer(state: GameState, rng: DeterministicRng): void {\n  const feature = featureAt(state.features, state.player.x, state.player.y);\n  if (!feature) return;\n  const def = featureDefinition(feature.kind);",
"function resolveFeatureAtPlayer(state: GameState, rng: DeterministicRng, forceInteract=false): void {\n  const feature = featureAt(state.features, state.player.x, state.player.y);\n  if (!feature) return;\n  const def = featureDefinition(feature.kind);\n  if(def.trigger==='interact'&&!forceInteract)return;",
'feature interaction gate')
patch('src/core/game.ts',
"  else if(feature.kind==='blood-well'){const before=state.player.hp;state.player.hp=Math.min(state.player.maxHp,state.player.hp+14);state.player.hunger=Math.max(0,state.player.hunger-80);pushMessage(state,`The blood well restores ${state.player.hp-before} HP, but leaves you hollow.`);}\n  if (!def.repeatable) feature.spent = true;",
"  else if(feature.kind==='blood-well'){const before=state.player.hp;state.player.hp=Math.min(state.player.maxHp,state.player.hp+14);state.player.hunger=Math.max(0,state.player.hunger-80);pushMessage(state,`The blood well restores ${state.player.hp-before} HP, but leaves you hollow.`);}\n  else if(feature.kind==='corpse'){const source=feature.sourceDefId?monsterById(feature.sourceDefId):null;if(!source){pushMessage(state,'The remains have spoiled beyond use.');}else{const nutrition=Math.max(90,Math.min(520,source.maxHp*11));feedPlayer(state,nutrition);if(source.tags.includes('venom')||source.tags.includes('fungal'))addStatus(state.player.statuses,{op:'status',id:'poisoned',duration:3,magnitude:1},feature.id);pushMessage(state,`You butcher the ${source.name} corpse and recover ${nutrition} nutrition.`);}}\n  if (!def.repeatable) feature.spent = true;",
'corpse interaction')
# generic standing terrain
p=Path('src/core/game.ts'); s=p.read_text(); a=s.index('function applyStandingTerrain(state: GameState): void {'); b=s.index('function searchNearbyFeatures',a)
new_standing="""function applyStandingTerrain(state: GameState): void {
  const applyPlayer=(kind:TileKind)=>{const rule=terrainDefinition(kind);if(rule.damage&&rule.damageType){const damage=scaleTypedDamage(rule.damage,playerDamageMultiplier(state,rule.damageType));if(damage>0)damagePlayer(state,damage,`The ${kind} harms you for ${damage} ${rule.damageType}.`);}if(rule.statusId)addStatus(state.player.statuses,{op:'status',id:rule.statusId,duration:rule.statusDuration??1,magnitude:1},`terrain:${kind}`);if(rule.manaPulse&&state.turn%3===0)state.player.mana=Math.min(state.player.maxMana,state.player.mana+rule.manaPulse);};
  const playerTile=tileAt(state.floor,state.player.x,state.player.y);if(playerTile)applyPlayer(playerTile.kind);
  for(const monster of [...state.monsters]){const tile=tileAt(state.floor,monster.x,monster.y);if(!tile)continue;const rule=terrainDefinition(tile.kind),def=monsterById(monster.defId);if(tile.kind==='holy'&&def.tags.includes('undead')){monster.hp-=2;if(!killMonsterIfNeeded(state,monster))pushMessage(state,`${def.name} recoils from consecrated ground.`);continue;}if(!rule.damage||!rule.damageType||rule.monsterImmuneTags?.some((tag)=>def.tags.includes(tag)))continue;const damage=scaleTypedDamage(rule.damage,monsterDamageMultiplier(def,rule.damageType));monster.hp-=damage;if(!killMonsterIfNeeded(state,monster))pushMessage(state,`${def.name} suffers ${damage} ${rule.damageType} from ${tile.kind}.`);}
}
"""
s=s[:a]+new_standing+s[b:]; p.write_text(s)

# spell casting/rest/item equipment
patch('src/core/game.ts',
"function fireRanged(state:GameState,rng:DeterministicRng):boolean{const weapon=equippedWeapon(state);",
"function castSpell(state:GameState,spellId:string,rng:DeterministicRng):boolean{if(!state.player.knownSpells.includes(spellId)){pushMessage(state,'You do not know that spell.');return false;}const spell=spellById(spellId);if(state.player.mana<spell.mana){pushMessage(state,'You do not have enough mana.');return false;}const target=spell.target==='enemy'?nearestVisibleMonster(state,spell.range):'player';if(spell.target==='enemy'&&!target){pushMessage(state,`${spell.name} has no visible target.`);return false;}state.player.mana-=spell.mana;state.player.preparedSpellId=spell.id;for(const effect of spell.effects)applyEffect(state,effect,state.player,spell.target==='enemy'?target as MonsterEntity:'player',rng);pushMessage(state,`You cast ${spell.name}.`);return true;}\nfunction fireRanged(state:GameState,rng:DeterministicRng):boolean{const weapon=equippedWeapon(state);",
'cast spell function')
patch('src/core/game.ts',
"function restTurn(state:GameState):boolean{if(!canRestSafely(state)){pushMessage(state,'Enemies are too close to rest.');return false;}if(state.player.hp>=state.player.maxHp){pushMessage(state,'You are already fully rested.');return false;}const recovered=Math.max(1,Math.floor(state.player.maxHp/24));state.player.hp=Math.min(state.player.maxHp,state.player.hp+recovered);pushMessage(state,`You rest and recover ${recovered} HP.`);return true;}",
"function restTurn(state:GameState):boolean{if(!canRestSafely(state)){pushMessage(state,'Enemies are too close to rest.');return false;}if(state.player.hp>=state.player.maxHp&&state.player.mana>=state.player.maxMana){pushMessage(state,'You are already fully rested.');return false;}const recovered=Math.max(1,Math.floor(state.player.maxHp/24)),manaRecovered=Math.min(2,state.player.maxMana-state.player.mana);state.player.hp=Math.min(state.player.maxHp,state.player.hp+recovered);state.player.mana=Math.min(state.player.maxMana,state.player.mana+Math.max(0,manaRecovered));pushMessage(state,`You rest and recover ${recovered} HP${manaRecovered>0?` and ${manaRecovered} mana`:''}.`);return true;}",
'rest mana')
# replace equipment beginning of useInventoryItem
patch('src/core/game.ts',
"  if (def.category === 'weapon') { state.player.equippedWeaponId = state.player.equippedWeaponId === itemId ? undefined : itemId; pushMessage(state, state.player.equippedWeaponId === itemId ? `You ready ${def.name}.` : `You lower ${def.name}.`); return true; }\n  if (def.category === 'armor') { state.player.equippedArmorId = state.player.equippedArmorId === itemId ? undefined : itemId; pushMessage(state, state.player.equippedArmorId === itemId ? `You wear ${def.name}.` : `You remove ${def.name}.`); return true; }",
"  if (def.category === 'weapon') { if(state.player.equippedWeaponId===itemId){if(!canUnequip(state,itemId)){pushMessage(state,'The cursed weapon will not leave your hand.');return false;}state.player.equippedWeaponId=undefined;}else{if(state.player.equippedWeaponId&&!canUnequip(state,state.player.equippedWeaponId)){pushMessage(state,'Your cursed weapon refuses to be replaced.');return false;}state.player.equippedWeaponId=itemId;}pushMessage(state,state.player.equippedWeaponId===itemId?`You ready ${def.name}${sanctityFor(state,itemId)==='cursed'?'—and feel it bind to you.':''}.`:`You lower ${def.name}.`);return true;}\n  if (def.category === 'armor') { if(state.player.equippedArmorId===itemId){if(!canUnequip(state,itemId)){pushMessage(state,'The cursed armor clings to you.');return false;}state.player.equippedArmorId=undefined;}else{if(state.player.equippedArmorId&&!canUnequip(state,state.player.equippedArmorId)){pushMessage(state,'Your cursed armor refuses to be replaced.');return false;}state.player.equippedArmorId=itemId;}pushMessage(state,state.player.equippedArmorId===itemId?`You wear ${def.name}${sanctityFor(state,itemId)==='cursed'?'—and the straps tighten by themselves.':''}.`:`You remove ${def.name}.`);return true;}\n  if(def.tags.includes('slot:ring')||def.tags.includes('slot:amulet')){const result=equipAccessory(state,itemId,def);if(result==='blocked'){pushMessage(state,'A cursed accessory refuses to come free.');return false;}pushMessage(state,result==='equipped'?`You equip ${def.name}.`:`You remove ${def.name}.`);return result!=='unsupported';}\n  const teaches=def.tags.find((tag)=>tag.startsWith('teaches:'));if(teaches){const spellId=teaches.slice(8);spellById(spellId);if(!state.player.knownSpells.includes(spellId))state.player.knownSpells.push(spellId);state.player.preparedSpellId=spellId;state.player.inventory=state.player.inventory.filter((item)=>item.id!==itemId);pushMessage(state,`You study ${def.name} and learn ${spellById(spellId).name}.`);return true;}",
'equipment curse accessory grimoire')
patch('src/core/game.ts',
"  if (state.player.equippedWeaponId === itemId) state.player.equippedWeaponId = undefined;\n  if (state.player.equippedArmorId === itemId) state.player.equippedArmorId = undefined;",
"  if(isEquipped(state,itemId)&&!canUnequip(state,itemId)){pushMessage(state,'The cursed item refuses to be discarded.');return false;}\n  if (state.player.equippedWeaponId === itemId) state.player.equippedWeaponId = undefined;\n  if (state.player.equippedArmorId === itemId) state.player.equippedArmorId = undefined;\n  state.player.equippedRingIds=state.player.equippedRingIds.filter((id)=>id!==itemId);if(state.player.equippedAmuletId===itemId)state.player.equippedAmuletId=undefined;",
'cursed drop accessories')
patch('src/core/game.ts',
"  } else if(action.type==='rest'){accepted=restTurn(state);\n  } else if(action.type==='fire'){accepted=fireRanged(state,rng);",
"  } else if(action.type==='rest'){accepted=restTurn(state);\n  } else if(action.type==='fire'){accepted=fireRanged(state,rng);\n  } else if(action.type==='interact'){resolveFeatureAtPlayer(state,rng,true);accepted=true;\n  } else if(action.type==='cast-spell'){accepted=castSpell(state,action.spellId,rng);",
'dispatch new actions')
# wait/search should not auto-consume interactables
patch('src/core/game.ts',
"    resolveFeatureAtPlayer(state, rng);pushMessage(state, 'You brace for the next exchange.'); accepted = true;\n  } else if(action.type==='search'){searchNearbyFeatures(state,rng);resolveFeatureAtPlayer(state,rng);pushMessage(state,'You carefully search nearby terrain.');accepted=true;",
"    pushMessage(state, 'You brace for the next exchange.'); accepted = true;\n  } else if(action.type==='search'){searchNearbyFeatures(state,rng);pushMessage(state,'You carefully search nearby terrain.');accepted=true;",
'no accidental feature consumption')
# invariants
patch('src/core/game.ts',
"  if(state.player.ammo<0)throw new Error('invariant: negative ammunition');",
"  if(state.player.ammo<0)throw new Error('invariant: negative ammunition');\n  if(state.player.mana<0||state.player.mana>state.player.maxMana||state.player.maxMana<0)throw new Error('invariant: invalid mana');\n  if(state.player.equippedRingIds.length>2)throw new Error('invariant: too many rings equipped');\n  for(const spellId of state.player.knownSpells)if(!SPELLS.some((spell)=>spell.id===spellId))throw new Error(`invariant: unknown known spell ${spellId}`);",
'grand invariants')
patch('src/core/game.ts',
"  if (state.player.equippedArmorId && !inventoryIds.includes(state.player.equippedArmorId)) throw new Error('invariant: equipped armor not in inventory');",
"  if (state.player.equippedArmorId && !inventoryIds.includes(state.player.equippedArmorId)) throw new Error('invariant: equipped armor not in inventory');\n  if (state.player.equippedAmuletId && !inventoryIds.includes(state.player.equippedAmuletId)) throw new Error('invariant: equipped amulet not in inventory');\n  for(const ringId of state.player.equippedRingIds)if(!inventoryIds.includes(ringId))throw new Error('invariant: equipped ring not in inventory');",
'accessory invariants')

# ---------- i18n ----------
patch('src/i18n.ts',
"trainAttack:'Train ATK',trainDefense:'Train DEF',trainVigor:'Train Vigor'",
"trainAttack:'Train ATK',trainDefense:'Train DEF',trainVigor:'Train Vigor',spell:'Spell',mana:'Mana',interact:'Use',patron:'Patron',quests:'Contracts',piety:'Piety',temperWeapon:'Temper weapon',temperArmor:'Temper armor',uncurse:'Remove curse',devote:'Devote',invoke:'Invoke'",
'i18n en new keys')
patch('src/i18n.ts',
"trainAttack:'공격 훈련',trainDefense:'방어 훈련',trainVigor:'체력 훈련'",
"trainAttack:'공격 훈련',trainDefense:'방어 훈련',trainVigor:'체력 훈련',spell:'주문',mana:'마나',interact:'사용',patron:'수호신',quests:'계약',piety:'신앙',temperWeapon:'무기 단련',temperArmor:'방어구 단련',uncurse:'저주 해제',devote:'귀의',invoke:'권능 요청'",
'i18n ko new keys')
patch('src/i18n.ts',
"trainer:'훈련소',inn:'여관'",
"trainer:'훈련소',inn:'여관',guildhall:'길드홀',smithy:'대장간'",
'i18n ko site')
patch('src/i18n.ts',
"trainer:'Trainer',inn:'Inn'",
"trainer:'Trainer',inn:'Inn',guildhall:'Guildhall',smithy:'Smithy'",
'i18n en site')
patch('src/i18n.ts',
"'inn-rest':'Sleep safely'};",
"'inn-rest':'Sleep safely',devote:'Devote',invoke:'Invoke patron',contract:'Take contract','claim-contract':'Claim contract','temper-weapon':'Temper weapon','temper-armor':'Temper armor',uncurse:'Remove curse'};",
'i18n en services')
patch('src/i18n.ts',
"'inn-rest':'안전한 숙박'};",
"'inn-rest':'안전한 숙박',devote:'귀의',invoke:'권능 요청',contract:'계약 수락','claim-contract':'계약 보상','temper-weapon':'무기 단련','temper-armor':'방어구 단련',uncurse:'저주 해제'};",
'i18n ko services')

# ---------- UI main ----------
patch('src/main.ts',
"import './noncombat.css';",
"import './noncombat.css';\nimport './fx.css';",
'fx css import')
patch('src/main.ts',
"import { ORIGINS } from './content/origins';",
"import { ORIGINS } from './content/origins';\nimport { SPELLS, spellById, spellDescription, spellName } from './content/spells';\nimport { PATRONS, patronById } from './content/patrons';\nimport { featureAt, featureDefinition } from './world/features';\nimport { isEquipped, sanctityFor, enchantmentFor } from './core/item-state';\nimport { questLabel } from './core/quests';\nimport { captureFx, playActionFx } from './ui/fx';",
'ui grand imports')
patch('src/main.ts',
"let openSheet: 'bag' | 'menu' | 'site' | null = null;",
"let openSheet: 'bag' | 'menu' | 'site' | 'spells' | null = null;",
'spell sheet type')
# map/message/action markup
patch('src/main.ts',
"      <div class=\"map-wrap\"><canvas id=\"game-canvas\"></canvas></div>\n\n      <button class=\"message-strip\" id=\"message-button\" aria-label=\"recent messages\">\n        <span id=\"message-text\"></span>\n      </button>",
"      <div class=\"map-wrap\"><canvas id=\"game-canvas\"></canvas><div class=\"message-strip\" aria-live=\"polite\"><span id=\"message-text\"></span></div><div id=\"context-slot\" class=\"context-slot context-float\"></div></div>",
'nonclickable log overlay')
patch('src/main.ts',
"          <button data-command=\"fire\" id=\"fire-button\"><strong>›</strong><small>${tr(locale,'fire')}</small></button>\n          <button class=\"brace-action\" data-wait><strong>•</strong><small>${tr(locale,'brace')}</small></button>\n          <div id=\"context-slot\" class=\"context-slot\"></div>",
"          <button data-command=\"fire\" id=\"fire-button\"><strong>›</strong><small>${tr(locale,'fire')}</small></button>\n          <button id=\"spell-button\"><strong>✦</strong><small>${tr(locale,'spell')}</small></button>\n          <button class=\"brace-action\" data-wait><strong>•</strong><small>${tr(locale,'brace')}</small></button>",
'spell command deck')
patch('src/main.ts',
"  document.querySelector<HTMLButtonElement>('#menu-button')?.addEventListener('click', () => toggleSheet('menu'));\n  document.querySelector<HTMLButtonElement>('#message-button')?.addEventListener('click', () => toggleSheet('menu'));",
"  document.querySelector<HTMLButtonElement>('#menu-button')?.addEventListener('click', () => toggleSheet('menu'));\n  document.querySelector<HTMLButtonElement>('#spell-button')?.addEventListener('click', () => toggleSheet('spells'));",
'log safety spell button')
# doAction FX
patch('src/main.ts',
"  const result = dispatchAction(state, action);\n  assertGameInvariants(state);",
"  const beforeFx=captureFx(state);\n  const result = dispatchAction(state, action);\n  assertGameInvariants(state);",
'capture fx')
patch('src/main.ts',
"  redraw();\n  if (state.gameOver) {",
"  redraw();\n  if(result.accepted){const shell=document.querySelector<HTMLElement>('.game-shell');if(shell)playActionFx(shell,action,beforeFx,state);}\n  if (state.gameOver) {",
'play fx')
# inventory equipped info
patch('src/main.ts',
"    const equipped = current.player.equippedWeaponId === entry.id || current.player.equippedArmorId === entry.id;",
"    const equipped = isEquipped(current,entry.id);const sanctity=sanctityFor(current,entry.id),enchant=enchantmentFor(current,entry.id);",
'accessory inventory state')
patch('src/main.ts',
"          <span class=\"item-name\"><strong>${name}</strong><small>${equipped ? `${tr(locale,'equipped')} · ` : ''}${categoryName(def.category,locale)}</small></span>",
"          <span class=\"item-name\"><strong>${name}${enchant?` ${enchant>0?'+':''}${enchant}`:''}</strong><small>${equipped ? `${tr(locale,'equipped')} · ${sanctity} · ` : ''}${categoryName(def.category,locale)}</small></span>",
'inventory enchant sanctity')
# toggleSheet type
patch('src/main.ts',"function toggleSheet(kind: 'bag' | 'menu' | 'site'): void {","function toggleSheet(kind: 'bag' | 'menu' | 'site' | 'spells'): void {",'toggle spell sheet')
# render sheet spells branch
patch('src/main.ts',
"  } else if(openSheet==='site'){",
"  } else if(openSheet==='spells'){\n    const known=state.player.knownSpells.map(spellById);\n    layer.innerHTML=`<div class=\"sheet-backdrop\" data-close-sheet></div><section class=\"bottom-sheet spell-sheet\"><div class=\"sheet-handle\"></div><header class=\"sheet-header\"><strong>✦ ${tr(locale,'spell')}</strong><span>MP ${state.player.mana}/${state.player.maxMana}</span><button data-close-sheet>${tr(locale,'done')}</button></header><div class=\"spell-list\">${known.map((spell)=>`<button class=\"spell-row\" data-spell-id=\"${spell.id}\" ${state.player.mana<spell.mana?'disabled':''}><span style=\"color:${spell.color}\">${spell.glyph}</span><strong>${spellName(spell,locale)}</strong><small>${spellDescription(spell,locale)}</small><b>${spell.mana} MP</b></button>`).join('')}</div></section>`;\n  } else if(openSheet==='site'){",
'spell sheet markup')
patch('src/main.ts',
"  layer.querySelector<HTMLButtonElement>('#language-menu')?.addEventListener('click',toggleLocale);\n  bindItemInfo(layer);",
"  layer.querySelector<HTMLButtonElement>('#language-menu')?.addEventListener('click',toggleLocale);\n  layer.querySelectorAll<HTMLButtonElement>('[data-spell-id]').forEach((button)=>button.addEventListener('click',()=>{const spellId=button.dataset.spellId;if(!spellId)return;closeSheet();doAction({type:'cast-spell',spellId});}));\n  bindItemInfo(layer);",
'spell sheet handlers')
# site markup expansions
patch('src/main.ts',
"  if(site.kind==='shrine')return serviceButton(site,'bless');",
"  if(site.kind==='shrine'){const patron=current.player.patronId?patronById(current.player.patronId):null;return `${serviceButton(site,'bless')}<h3>${tr(locale,'patron')}</h3>${patron?`<p class=\"site-copy\"><strong style=\"color:${patron.color}\">${locale==='ko'?patron.nameKo:patron.name}</strong> · ${tr(locale,'piety')} ${current.player.piety}</p><button class=\"site-action\" data-site-service=\"invoke\"><span>${tr(locale,'invoke')}</span><b>${patron.invokeCost}</b></button>`:PATRONS.map((entry)=>`<button class=\"site-action\" data-site-service=\"devote\" data-offer-id=\"${entry.id}\"><span style=\"color:${entry.color}\">${locale==='ko'?entry.nameKo:entry.name}</span></button>`).join('')}`;}",
'shrine patron UI')
patch('src/main.ts',
"  if(site.kind==='inn')return `${serviceButton(site,'inn-rest')}${serviceButton(site,'meal')}`;\n  return serviceButton(site,'rumor');",
"  if(site.kind==='inn')return `${serviceButton(site,'inn-rest')}${serviceButton(site,'meal')}`;\n  if(site.kind==='guildhall'){const active=current.quests.filter((quest)=>quest.status!=='claimed');return `<h3>${tr(locale,'quests')}</h3>${active.map((quest)=>`<div class=\"contract-row\"><span>${questLabel(quest,locale)}</span>${quest.status==='complete'?`<button data-site-service=\"claim-contract\" data-offer-id=\"${quest.id}\">+${quest.rewardGold}g</button>`:`<b>${quest.rewardGold}g</b>`}</div>`).join('')||'<p class=\"site-copy\">No active contracts.</p>'}<h3>New</h3>${(['hunt','delve','unique'] as const).map((kind)=>`<button class=\"site-action\" data-site-service=\"contract\" data-offer-id=\"${kind}\"><span>${kind}</span></button>`).join('')}`;}\n  if(site.kind==='smithy')return `${serviceButton(site,'temper-weapon')}${serviceButton(site,'temper-armor')}${serviceButton(site,'uncurse')}`;\n  return serviceButton(site,'rumor');",
'guild smith ui')
# resource text mana/ammo
patch('src/main.ts',
"  if(ammoText)ammoText.textContent=`${tr(locale,'ammo')} ${state.player.ammo}`;",
"  if(ammoText)ammoText.textContent=`MP ${state.player.mana}/${state.player.maxMana} · ${tr(locale,'ammo')} ${state.player.ammo}`;",
'mana hud')
# context slot site/feature
patch('src/main.ts',
"  if(contextSlot){const site=currentSite(state);if(site){const def=siteDefinition(site.kind);contextSlot.innerHTML=`<button class=\"site-dock-button\" id=\"site-button\"><span style=\"color:${def.color}\">${def.glyph}</span><small>${siteKindName(site.kind,locale)}</small></button>`;contextSlot.querySelector('#site-button')?.addEventListener('click',()=>toggleSheet('site'));}else contextSlot.innerHTML='';}",
"  if(contextSlot){const site=currentSite(state),feature=featureAt(state.features,state.player.x,state.player.y);if(site){const def=siteDefinition(site.kind);contextSlot.innerHTML=`<button class=\"site-dock-button\" id=\"site-button\"><span style=\"color:${def.color}\">${def.glyph}</span><small>${siteKindName(site.kind,locale)}</small></button>`;contextSlot.querySelector('#site-button')?.addEventListener('click',()=>toggleSheet('site'));}else if(feature&&featureDefinition(feature.kind).trigger==='interact'){const def=featureDefinition(feature.kind);contextSlot.innerHTML=`<button class=\"site-dock-button\" id=\"interact-button\"><span style=\"color:${def.color}\">${def.glyph}</span><small>${tr(locale,'interact')}</small></button>`;contextSlot.querySelector('#interact-button')?.addEventListener('click',()=>doAction({type:'interact'}));}else contextSlot.innerHTML='';}",
'contextual interact')
# menu status
patch('src/main.ts',
"        <div class=\"recent-messages\">${recentMessagesMarkup(state)}</div>",
"        <div class=\"run-summary\">${state.player.patronId?`<span>${tr(locale,'patron')}: ${locale==='ko'?patronById(state.player.patronId).nameKo:patronById(state.player.patronId).name} · ${tr(locale,'piety')} ${state.player.piety}</span>`:''}${state.quests.filter((quest)=>quest.status!=='claimed').map((quest)=>`<span>${questLabel(quest,locale)}</span>`).join('')}</div><div class=\"recent-messages\">${recentMessagesMarkup(state)}</div>",
'menu quest patron summary')

# ---------- renderer ----------
patch('src/ui/render.ts',
"import { localizedThemeName } from '../i18n';",
"import { localizedThemeName } from '../i18n';\nimport { terrainDefinition } from '../world/terrain-rules';",
'render terrain import')
# replace color calculation snippet
patch('src/ui/render.ts',
"    let fg=exit?palette.accent:tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:tile.kind==='rubble'?blendHex(palette.wall,palette.floor,.55):palette.floor;\n    const tileBase=tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:palette.floor;",
"    const specialColor=tile.kind==='ice'?blendHex(palette.water,'#e7f6ff',.52):tile.kind==='miasma'?blendHex(palette.danger,'#8da55c',.48):tile.kind==='bramble'?blendHex(palette.accent,'#6f9257',.55):tile.kind==='void-rift'?'#b184d2':tile.kind==='oil'?'#76634b':tile.kind==='holy'?'#d8cf9f':null;\n    let fg=exit?palette.accent:specialColor??(tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:tile.kind==='rubble'?blendHex(palette.wall,palette.floor,.55):palette.floor);\n    const tileBase=specialColor??(tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:palette.floor);",
'special terrain colors')
patch('src/ui/render.ts',
"    if(tile.kind==='lava'&&isVisible){ctx.shadowColor=palette.danger;ctx.shadowBlur=view.cell*.42;}\n    if(exit&&isVisible)",
"    if(tile.kind==='lava'&&isVisible){ctx.shadowColor=palette.danger;ctx.shadowBlur=view.cell*.42;}\n    if(tile.kind==='miasma'&&isVisible){ctx.fillStyle=rgba('#91a75e',.07+.035*Math.sin((state.turn+x*2+y)*.38));ctx.fillRect(sx*view.cell,sy*view.cell,view.cell,view.cell);ctx.shadowColor='#9dbd67';ctx.shadowBlur=4;}\n    if(tile.kind==='void-rift'&&isVisible){ctx.fillStyle=rgba('#b184d2',.1+.04*Math.sin((state.turn+x+y)*.44));ctx.fillRect(sx*view.cell+1,sy*view.cell+1,view.cell-2,view.cell-2);ctx.shadowColor='#bd8fe3';ctx.shadowBlur=8;}\n    if(tile.kind==='holy'&&isVisible){ctx.fillStyle=rgba('#e6dcae',.08);ctx.fillRect(sx*view.cell+2,sy*view.cell+2,view.cell-4,view.cell-4);ctx.shadowColor='#e8dca6';ctx.shadowBlur=5;}\n    if(tile.kind==='ice'&&isVisible&&((x+y+state.turn)%5===0)){ctx.fillStyle='#eefaff';ctx.fillText('·',sx*view.cell+view.cell*.72,sy*view.cell+view.cell*.28);}\n    if(exit&&isVisible)",
'special terrain effects')
# unique render aura
patch('src/ui/render.ts',
"  for(const monster of state.monsters){if(!visible.has(`${monster.x},${monster.y}`)||!inView(monster,view))continue;const def=monsterById(monster.defId),p=screen(monster.x,monster.y);if(monster.power>1){ctx.fillStyle=rgba(def.color,.09);ctx.fillRect(p.x+2,p.y+2,view.cell-4,view.cell-4);}ctx.shadowColor=def.color;ctx.shadowBlur=monster.power>2?6:2;ctx.fillStyle=def.color;ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);ctx.shadowBlur=0;}",
"  for(const monster of state.monsters){if(!visible.has(`${monster.x},${monster.y}`)||!inView(monster,view))continue;const def=monsterById(monster.defId),p=screen(monster.x,monster.y),unique=def.tags.includes('unique');if(monster.power>1||unique){ctx.fillStyle=rgba(def.color,unique?.18:.09);ctx.beginPath();ctx.arc(p.x+view.cell/2,p.y+view.cell/2,view.cell*(unique?.62:.46),0,Math.PI*2);ctx.fill();}if(unique){ctx.strokeStyle=rgba(def.color,.6);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p.x+view.cell/2,p.y+view.cell/2,view.cell*.68,0,Math.PI*2);ctx.stroke();}ctx.shadowColor=def.color;ctx.shadowBlur=unique?11:monster.power>2?6:2;ctx.fillStyle=def.color;ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);ctx.shadowBlur=0;}",
'unique visual aura')

# ---------- CSS full rewrite ----------
Path('src/tactical.css').write_text(r'''/* Full-screen traditional roguelike mobile surface. */
:root{--panel:#080c12;--panel2:#0c121a;--line:#202a36;--text:#e9ece8;--muted:#788695;--hp:#d4666e;--food:#c8a45e;--mana:#7ea7d9}
.game-shell{width:100%;max-width:none!important;background:radial-gradient(circle at 50% 20%,#101823 0,#06090e 52%,#030508 100%);grid-template-rows:58px minmax(0,1fr) auto!important;box-shadow:0 0 90px #000 inset}
.hud{height:58px;grid-template-columns:minmax(0,1fr) 154px 42px;gap:9px;padding:7px 10px;background:linear-gradient(180deg,#0c1118f7,#080c12f0);border-bottom:1px solid #1c2631;box-shadow:0 8px 24px #0007;z-index:12}.place-block strong{font-size:14px;color:#f1f2ee;text-shadow:0 1px 8px #000}.place-block span{font-size:9px;color:#82909f;letter-spacing:.05em;text-transform:none}.vitals-block{width:154px;display:grid;gap:3px}.vital-labels,.hunger-line{display:flex;justify-content:space-between;align-items:center;font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#d3d7dc}.vital-labels b{color:#d8c58e}.hunger-line{color:#b09a6a}.hunger-line small{font-size:8px;color:#8fa5bc}.hp-track,.hunger-track{height:5px;background:#202832;border-radius:6px;overflow:hidden;box-shadow:inset 0 1px 2px #000}.hp-track i,.hunger-track i{display:block;height:100%;border-radius:inherit;transition:width .12s linear}.hp-track i{background:linear-gradient(90deg,#a9434c,#e17a7d);box-shadow:0 0 8px #c5535b99}.hunger-track i{background:linear-gradient(90deg,#8f713e,#d4b367);box-shadow:0 0 7px #b28d4c77}.icon-button{width:40px;height:40px;border-color:#27313e;background:#0e141d;color:#bbc4cd}
.map-wrap{position:relative;min-height:0;display:block;overflow:hidden;background:radial-gradient(circle,#0b1118 0,#05080c 74%);border-bottom:1px solid #141d27;touch-action:none}.map-wrap:before{content:"";position:absolute;z-index:4;inset:0;pointer-events:none;box-shadow:inset 0 0 52px #000b,inset 0 0 2px #52698622}.game-canvas,#game-canvas{display:block;width:100%!important;height:100%!important;max-width:none;max-height:none;filter:contrast(1.1) saturate(1.12)}
.message-strip{position:absolute;z-index:6;left:8px;right:8px;top:8px;min-height:28px;padding:5px 9px;border:1px solid #263241aa;border-radius:8px;background:linear-gradient(90deg,#080d14e6,#080d1496 72%,#080d1400);color:#c1c9d0;text-align:left;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;pointer-events:none;box-shadow:0 4px 18px #0006}.message-strip span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.context-float{position:absolute;z-index:7;left:9px;bottom:10px;width:auto!important;height:auto!important}.context-float:empty{display:none}.context-float>.site-dock-button{height:42px;min-width:92px;padding:4px 10px;border-radius:12px;border:1px solid #3b4a5d;background:#101923e8;display:flex;gap:7px;align-items:center;box-shadow:0 5px 18px #0009,0 0 16px #6f8baa22;backdrop-filter:blur(6px)}.context-float>.site-dock-button span{font-size:18px}.context-float>.site-dock-button small{font-size:9px;color:#b9c5d0}
.mobile-dock{min-height:176px;display:grid;grid-template-columns:58px minmax(124px,1fr) 166px;gap:7px;align-items:center;padding:8px 8px max(9px,env(safe-area-inset-bottom));border-top:1px solid #222d39;background:linear-gradient(180deg,#0d131bf7,#070b10fc);box-shadow:0 -12px 32px #000a;z-index:10}.utility-dock{align-self:stretch;display:flex;align-items:center}.bag-button{width:54px;height:68px;border:1px solid #2c3948;background:linear-gradient(180deg,#151e29,#0e141c);border-radius:14px;color:#cad1d8;box-shadow:0 5px 14px #0007,inset 0 1px #ffffff0a}.bag-button .bag-glyph{font-size:22px}.bag-button b{background:#374453;color:#f4f2eb}
.action-pad{justify-self:center;width:100%;max-width:150px;display:grid;grid-template-columns:repeat(2,minmax(52px,1fr));grid-template-rows:repeat(3,45px);gap:6px}.action-pad>button{min-width:0;height:45px;padding:2px 5px;display:grid;grid-template-columns:auto 1fr;place-items:center;gap:4px;border-radius:12px;border:1px solid #2b3949;background:linear-gradient(180deg,#17222e,#101720);box-shadow:0 4px 11px #0006,inset 0 1px #ffffff0b;touch-action:manipulation}.action-pad strong{font:800 16px ui-monospace,monospace;color:#e0e5e9}.action-pad small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;color:#a1adb9}.action-pad .brace-action{border-color:#41495b;background:linear-gradient(180deg,#1b2230,#121722)}.action-pad button:disabled{opacity:.3;filter:saturate(.3)}
.controls{justify-self:end;display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(3,52px);gap:5px}.controls>button{width:52px;height:52px;aspect-ratio:1;padding:0;border-radius:16px;border:1px solid #3a4a5d;background:linear-gradient(180deg,#1d2a38,#111a25);color:#edf0f2;font-size:20px;font-weight:900;box-shadow:0 5px 13px #0008,inset 0 1px #ffffff10;touch-action:manipulation}.controls>button:active,.action-pad>button:active{transform:translateY(1px) scale(.96);box-shadow:0 1px 4px #0009}.controls .dpad-core{display:grid;place-items:center;color:#495868;font-size:13px;pointer-events:none}
.origin-picker{margin:12px 0}.origin-heading{margin-bottom:7px;color:#8e98a3;font-size:11px;font-weight:700}.origin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.origin-chip{min-height:38px;padding:6px 8px;background:#10151d;border-color:#262f3b;color:#aeb7c0;font-size:11px}.origin-chip.selected{border-color:#8895a4;background:#18212b;color:#f0f1ed;box-shadow:0 0 0 1px #8895a430 inset}.origin-description{min-height:34px;margin:7px 2px 0;color:#7f8994;font-size:11px;line-height:1.45}
.spell-list{display:grid;gap:5px;padding:6px 0 14px;overflow:auto}.spell-row{min-height:58px;display:grid;grid-template-columns:28px minmax(0,1fr) auto;grid-template-areas:'glyph name cost' 'glyph desc cost';gap:2px 8px;align-items:center;padding:7px 9px;text-align:left;background:#101720;border-color:#273443}.spell-row>span{grid-area:glyph;text-align:center;font-size:21px}.spell-row>strong{grid-area:name;font-size:13px}.spell-row>small{grid-area:desc;color:#7f8d9b;font-size:9px;line-height:1.25}.spell-row>b{grid-area:cost;color:#8eb5e3;font:800 10px ui-monospace,monospace}.site-copy{padding:6px 2px;color:#9ba5af;font-size:11px}.contract-row{min-height:40px;display:flex;gap:8px;align-items:center;border-bottom:1px solid #202833;color:#aeb7c0;font-size:11px}.contract-row span{flex:1}.contract-row b{color:#d4bd7a}.contract-row button{padding:5px 8px}.run-summary{display:grid;gap:3px;padding:7px 5px 10px;border-top:1px solid #232934;color:#98a6b3;font-size:10px}
@media(min-width:700px){.mobile-dock{grid-template-columns:64px minmax(160px,1fr) 184px}.action-pad{max-width:180px;grid-template-columns:repeat(2,86px);grid-template-rows:repeat(3,48px)}.action-pad>button{height:48px}.controls{grid-template-columns:repeat(3,56px);grid-template-rows:repeat(3,56px)}.controls>button{width:56px;height:56px}.hud{grid-template-columns:minmax(0,1fr) 178px 42px}.vitals-block{width:178px}}
@media(max-width:380px){.mobile-dock{grid-template-columns:50px minmax(108px,1fr) 148px;gap:5px;padding-left:5px;padding-right:5px}.bag-button{width:48px;height:62px}.controls{grid-template-columns:repeat(3,46px);grid-template-rows:repeat(3,46px);gap:4px}.controls>button{width:46px;height:46px;border-radius:14px}.action-pad{max-width:124px;grid-template-columns:repeat(2,minmax(48px,1fr));grid-template-rows:repeat(3,42px);gap:4px}.action-pad>button{height:42px}.action-pad small{font-size:7px}.hud{grid-template-columns:minmax(0,1fr) 142px 38px}.vitals-block{width:142px}.icon-button{width:36px;height:36px}}
@media(max-height:720px){.game-shell{grid-template-rows:54px minmax(0,1fr) auto!important}.hud{height:54px}.mobile-dock{min-height:160px;padding-top:5px}.controls{grid-template-columns:repeat(3,48px);grid-template-rows:repeat(3,48px)}.controls>button{width:48px;height:48px}.action-pad{grid-template-rows:repeat(3,41px)}.action-pad>button{height:41px}.bag-button{height:58px}}
''')

# ---------- docs ----------
p=Path('README.md'); s=p.read_text()
s=s.replace('- 160+ monsters, including named unique encounters layered over each theme', '- 160+ monsters, including named unique encounters layered over each theme')
s=s.replace('- 230+ items across weapons, armor, food, ammunition, consumables, tools, relics, and classic utility archetypes', '- 270+ items across weapons, armor, food, ammunition, consumables, tools, relics, jewelry, grimoires, and ritual utility')
s=s.replace('- five starting origins with genuinely different opening kits and stat profiles', '- five starting origins with genuinely different opening kits, stat profiles, mana pools, and opening spells\n- 16 reusable spells with mana, targeting, terrain creation, control, escape, healing, and elemental interactions\n- rings + amulets, deterministic curse/blessing, equipment enchantment, smithing, and curse removal\n- four patron factions with devotion, piety, and reusable invocation boons\n- guild contracts with hunt, descent, and named-foe objectives\n- edible corpses and explicit interactable dungeon features instead of accidental auto-consumption')
s=s.replace('- deterministic procedural floors with connectivity/open-area validation', '- deterministic procedural floors with connectivity/open-area validation\n- systemic special terrain patches: ice, miasma, bramble, void rifts, oil, holy ground, water, lava, bridges, and rubble')
s=s.replace('- full-bleed mobile viewport: the ASCII dungeon fills the available play surface instead of sitting in a small centered rectangle', '- full-bleed mobile viewport: the ASCII dungeon fills the available play surface instead of sitting in a small centered rectangle\n- non-clickable in-map combat log overlay, square right-side d-pad, context interaction button, and high-feedback combat/spell/level visual effects')
p.write_text(s)
p=Path('ARCHITECTURE.md'); s=p.read_text();
s=s.replace('- at least 145 monsters overall\n- at least 195 items overall\n- at least 15 reusable dungeon feature kinds', '- at least 160 monsters overall\n- at least 270 items overall\n- at least 16 reusable spells\n- at least 15 reusable dungeon feature kinds\n- special terrain, sanctity/enchantment, patrons, contracts, and equipment slots remain reusable systems rather than content-specific executors')
s += '\n\n## Presentation-effects rule\n\nCombat shake, flashes, particles, floating text, log placement, and other spectacle are presentation-only projections. They may inspect action results and state deltas but never mutate simulation state or decide outcomes.\n\n## Interactive-world rule\n\nVisible boons, corpses, graves, caches, altars, and similar features use an explicit reusable interact action. Hidden traps remain step-triggered. This prevents accidental consumption while keeping all feature resolution inside the canonical dispatcher.\n'
p.write_text(s)

# ---------- tests ----------
Path('tests/grand-depth.test.ts').write_text("""import { describe,expect,it } from 'vitest';
import { createNewGame,dispatchAction,assertGameInvariants } from '../src/core/game';
import { ITEMS } from '../src/content/items';
import { MONSTERS } from '../src/content/monsters';
import { SPELLS } from '../src/content/spells';
import { PATRONS } from '../src/content/patrons';
import { createContract,recordMonsterKill } from '../src/core/quests';

describe('grand traditional roguelike depth pass',()=>{
  it('ships the larger systemic catalogue',()=>{expect(ITEMS.length).toBeGreaterThanOrEqual(270);expect(MONSTERS.length).toBeGreaterThanOrEqual(160);expect(SPELLS.length).toBeGreaterThanOrEqual(16);expect(PATRONS.length).toBeGreaterThanOrEqual(4);});
  it('casts known spells through the canonical action path',()=>{const{state}=createNewGame('spell-pass','warden');state.monsters=[];const before=state.player.mana;expect(dispatchAction(state,{type:'cast-spell',spellId:'stone-ward'}).accepted).toBe(true);expect(state.player.mana).toBeLessThan(before);expect(state.player.statuses.some((status)=>status.id==='guarding')).toBe(true);expect(()=>assertGameInvariants(state)).not.toThrow();});
  it('equips accessory slots through item actions',()=>{const{state}=createNewGame('ring-pass');state.monsters=[];state.player.inventory.push({id:'ring-test',defId:'ring-of-stone'});expect(dispatchAction(state,{type:'use-item',itemId:'ring-test'}).accepted).toBe(true);expect(state.player.equippedRingIds).toContain('ring-test');});
  it('tracks reusable contracts without special combat paths',()=>{const{state}=createNewGame('quest-pass');const quest=createContract(state,'guild-test','hunt');expect(quest).not.toBeNull();state.quests.push(quest!);for(let i=0;i<quest!.goal;i++)recordMonsterKill(state,false);expect(state.quests[0]!.status).toBe('complete');});
  it('corpses are explicit interactions rather than step auto-consumption',()=>{const{state}=createNewGame('corpse-pass');state.monsters=[];state.player.hunger=300;state.features.push({id:'corpse-test',kind:'corpse',x:state.player.x,y:state.player.y,revealed:true,spent:false,sourceDefId:MONSTERS.find((entry)=>!entry.tags.includes('construct')&&!entry.tags.includes('spirit'))!.id});const before=state.player.hunger;expect(dispatchAction(state,{type:'interact'}).accepted).toBe(true);expect(state.player.hunger).toBeGreaterThan(before);});
});
""")

print('grand pass applied')
