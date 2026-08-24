import fs from 'node:fs';

function patch(path, transforms) {
  let source = fs.readFileSync(path, 'utf8');
  for (const { oldText, newText, label } of transforms) {
    if (source.includes(newText)) continue;
    if (!source.includes(oldText)) throw new Error(`${path}: missing patch anchor: ${label}`);
    source = source.replace(oldText, newText);
  }
  fs.writeFileSync(path, source);
}

patch('src/content/items.ts', [
  {
    label: 'extra item import',
    oldText: "import type { ItemDefinition } from '../core/types';\n",
    newText: "import type { ItemDefinition } from '../core/types';\nimport { EXTRA_ITEMS } from './extra-items';\n",
  },
  {
    label: 'extra item catalog append',
    oldText: "];\nexport function itemById(id:string):ItemDefinition",
    newText: "];\nITEMS.push(...EXTRA_ITEMS);\nexport function itemById(id:string):ItemDefinition",
  },
]);

patch('src/content/monsters.ts', [
  {
    label: 'extra monster import',
    oldText: "import type { AiProfile, EffectSpec, MonsterDefinition, ThemeDefinition } from '../core/types';\n",
    newText: "import type { AiProfile, EffectSpec, MonsterDefinition, ThemeDefinition } from '../core/types';\nimport { EXTRA_MONSTERS } from './extra-monsters';\n",
  },
  {
    label: 'extra monster catalog append',
    oldText: "{id:'abyss-unperson',name:'Unperson',glyph:'@',color:'#b28ac8',maxHp:34,attack:14,defense:3,ai:'stalker',tags:['void','spirit','theme:abyss'],minDepth:1,abilities:[{op:'status',id:'unmoored',duration:3}]});\nexport function monstersForTheme",
    newText: "{id:'abyss-unperson',name:'Unperson',glyph:'@',color:'#b28ac8',maxHp:34,attack:14,defense:3,ai:'stalker',tags:['void','spirit','theme:abyss'],minDepth:1,abilities:[{op:'status',id:'unmoored',duration:3}]});\nMONSTERS.push(...EXTRA_MONSTERS);\nexport function monstersForTheme",
  },
]);

patch('src/core/game.ts', [
  {
    label: 'deep system imports',
    oldText: "import { milestoneEvent, themeDiscoveryEvent } from './story';\n",
    newText: "import { milestoneEvent, themeDiscoveryEvent } from './story';\nimport { featureAt, featureDefinition, generateFeatures } from '../world/features';\nimport { displayItemName, identifyItem } from './item-knowledge';\nimport { monsterDamageMultiplier, playerDamageMultiplier, scaleTypedDamage, weaponDamageType } from './combat-rules';\n",
  },
  {
    label: 'reserve feature positions',
    oldText: "  const occupied = new Set<string>([pointKey(state.player), ...state.floor.exits.map(pointKey)]);",
    newText: "  const occupied = new Set<string>([pointKey(state.player), ...state.floor.exits.map(pointKey), ...state.features.map(pointKey)]);",
  },
  {
    label: 'feature generation per floor',
    oldText: "  state.temporaryTerrain = [];\n  state.explored = [];\n  state.visible = [];\n  populateFloor(state, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'population')));",
    newText: "  state.temporaryTerrain = [];\n  state.explored = [];\n  state.visible = [];\n  state.features = generateFeatures(state.floor, context.primary, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'features')));\n  populateFloor(state, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'population')));",
  },
  {
    label: 'schema v3',
    oldText: "    schemaVersion: 2,",
    newText: "    schemaVersion: 3,",
  },
  {
    label: 'item knowledge state',
    oldText: "    seenStoryEvents: [],\n    floor,",
    newText: "    seenStoryEvents: [],\n    identifiedItemDefs: [],\n    floor,",
  },
  {
    label: 'feature state',
    oldText: "    monsters: [],\n    items: [],\n    explored: [],",
    newText: "    monsters: [],\n    items: [],\n    features: [],\n    explored: [],",
  },
  {
    label: 'initial feature generation',
    oldText: "  populateFloor(state, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'population')));\n  refreshVisibility(state);",
    newText: "  state.features = generateFeatures(floor, context.primary, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'features')));\n  populateFloor(state, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'population')));\n  refreshVisibility(state);",
  },
  {
    label: 'typed player effect damage',
    oldText: "      const damage = Math.max(1, effect.amount - Math.floor(playerDefense(state) / 3));\n      damagePlayer(state, damage, `${source.id === 'player' ? 'The effect' : 'A hostile effect'} hits you for ${damage}.`);",
    newText: "      const type = effect.damageType ?? 'physical';\n      const base = Math.max(1, effect.amount - Math.floor(playerDefense(state) / 3));\n      const damage = scaleTypedDamage(base, playerDamageMultiplier(state, type));\n      if (damage <= 0) pushMessage(state, `The ${type} effect cannot harm you.`);\n      else damagePlayer(state, damage, `${source.id === 'player' ? 'The effect' : 'A hostile effect'} hits you for ${damage} ${type}.`);",
  },
  {
    label: 'typed monster effect damage',
    oldText: "      const damage = Math.max(1, effect.amount - Math.floor(monsterDefense(target) / 3));\n      target.hp -= damage; pushMessage(state, `${monsterById(target.defId).name} takes ${damage}.`); killMonsterIfNeeded(state, target);",
    newText: "      const targetDef = monsterById(target.defId), type = effect.damageType ?? 'physical';\n      const base = Math.max(1, effect.amount - Math.floor(monsterDefense(target) / 3));\n      const damage = scaleTypedDamage(base, monsterDamageMultiplier(targetDef, type));\n      if (damage <= 0) pushMessage(state, `${targetDef.name} ignores the ${type} effect.`);\n      else { target.hp -= damage; pushMessage(state, `${targetDef.name} takes ${damage} ${type}.`); killMonsterIfNeeded(state, target); }",
  },
  {
    label: 'status resistance',
    oldText: "  } else if (effect.op === 'status') {\n    if (target === 'player' && effect.id === 'cleansed') state.player.statuses = state.player.statuses.filter((status) => !statusById(status.id).harmful);\n    else addStatus(target === 'player' ? state.player.statuses : target.statuses, effect, source.id);",
    newText: "  } else if (effect.op === 'status') {\n    if (target === 'player' && effect.id === 'cleansed') state.player.statuses = state.player.statuses.filter((status) => !statusById(status.id).harmful);\n    else {\n      const statusType = effect.id === 'poisoned' ? 'poison' : effect.id === 'burning' ? 'fire' : effect.id === 'chilled' ? 'cold' : null;\n      const resistance = statusType ? (target === 'player' ? playerDamageMultiplier(state, statusType) : monsterDamageMultiplier(monsterById(target.defId), statusType)) : 1;\n      if (statusType && resistance <= 0.55) pushMessage(state, `${target === 'player' ? 'You resist' : monsterById(target.defId).name + ' resists'} ${effect.id}.`);\n      else addStatus(target === 'player' ? state.player.statuses : target.statuses, effect, source.id);\n    }",
  },
  {
    label: 'typed weapon attacks',
    oldText: "function attackMonster(state: GameState, monster: MonsterEntity, rng: DeterministicRng): void {\n  const def = monsterById(monster.defId), damage = Math.max(1, playerAttackPower(state) + rng.int(-1, 2) - monsterDefense(monster));\n  monster.hp -= damage; pushMessage(state, `You hit ${def.name} for ${damage}.`);\n  const weapon = equippedWeapon(state);",
    newText: "function attackMonster(state: GameState, monster: MonsterEntity, rng: DeterministicRng): void {\n  const def = monsterById(monster.defId), weapon = equippedWeapon(state), damageType = weaponDamageType(weapon);\n  const base = Math.max(1, playerAttackPower(state) + rng.int(-1, 2) - monsterDefense(monster));\n  const damage = scaleTypedDamage(base, monsterDamageMultiplier(def, damageType));\n  if (damage <= 0) pushMessage(state, `${def.name} ignores your ${damageType} strike.`);\n  else { monster.hp -= damage; pushMessage(state, `You hit ${def.name} for ${damage} ${damageType}.`); }\n  const weaponAfter = weapon;",
  },
  {
    label: 'weapon after variable',
    oldText: "  if (!killMonsterIfNeeded(state, monster) && weapon) for (const effect of weapon.effects) if (effect.op === 'status' || effect.op === 'push') applyEffect(state, effect, state.player, monster, rng);",
    newText: "  if (!killMonsterIfNeeded(state, monster) && weaponAfter) for (const effect of weaponAfter.effects) if (effect.op === 'status' || effect.op === 'push') applyEffect(state, effect, state.player, monster, rng);",
  },
  {
    label: 'typed melee against player',
    oldText: "  const def = monsterById(monster.defId), damage = Math.max(1, monsterAttack(monster) + rng.int(-1, 1) - playerDefense(state));\n  damagePlayer(state, damage, `${def.name} hits you for ${damage}.`);",
    newText: "  const def = monsterById(monster.defId), base = Math.max(1, monsterAttack(monster) + rng.int(-1, 1) - playerDefense(state));\n  const damage = scaleTypedDamage(base, playerDamageMultiplier(state, 'physical'));\n  if (damage > 0) damagePlayer(state, damage, `${def.name} hits you for ${damage}.`); else pushMessage(state, `${def.name} cannot penetrate your protection.`);",
  },
  {
    label: 'feature helpers',
    oldText: "function endAcceptedTurn(state: GameState, rng: DeterministicRng): void {",
    newText: "function searchNearbyFeatures(state: GameState, rng: DeterministicRng): void {\n  for (const feature of state.features) {\n    if (feature.revealed || feature.spent || manhattan(state.player, feature) > 2) continue;\n    if (!rng.chance(0.45)) continue;\n    feature.revealed = true;\n    pushMessage(state, `You notice a ${featureDefinition(feature.kind).label}.`);\n    break;\n  }\n}\nfunction resolveFeatureAtPlayer(state: GameState, rng: DeterministicRng): void {\n  const feature = featureAt(state.features, state.player.x, state.player.y);\n  if (!feature) return;\n  const def = featureDefinition(feature.kind);\n  if (!feature.revealed) { feature.revealed = true; pushMessage(state, `You discover a ${def.label}!`); }\n  if (feature.kind === 'spike-trap') {\n    const base = 4 + Math.floor(state.coord.depth / 35), damage = scaleTypedDamage(base, playerDamageMultiplier(state, 'physical'));\n    if (damage > 0) damagePlayer(state, damage, `Spikes tear into you for ${damage}.`);\n  } else if (feature.kind === 'snare-rune') {\n    addStatus(state.player.statuses, { op: 'status', id: 'pinned', duration: 2, magnitude: 1 }, feature.id);\n    pushMessage(state, 'A snare rune locks your feet.');\n  } else if (feature.kind === 'teleport-rune') {\n    teleportEntity(state, 'player', 9, rng); pushMessage(state, 'Space folds and throws you elsewhere.');\n  } else if (feature.kind === 'alarm-rune') {\n    const tag = resolveThemeContext(state.coord).primary.monsterTags[0] ?? 'beast';\n    summonNear(state, state.player, tag, 2, rng); pushMessage(state, 'The rune calls hunters into the level.');\n  } else if (feature.kind === 'healing-spring') {\n    const before = state.player.hp; state.player.hp = Math.min(state.player.maxHp, state.player.hp + 12);\n    pushMessage(state, `The spring restores ${state.player.hp - before} HP.`);\n  } else if (feature.kind === 'warding-altar') {\n    addStatus(state.player.statuses, { op: 'status', id: 'focused', duration: 10, magnitude: 1 }, feature.id);\n    addStatus(state.player.statuses, { op: 'status', id: 'guarding', duration: 3, magnitude: 1 }, feature.id);\n    pushMessage(state, 'The altar sharpens your senses and hardens your stance.');\n  } else if (feature.kind === 'unstable-cache') {\n    for (let i = 0; i < 2; i += 1) { const found = weightedItem(state, rng); state.player.inventory.push({ id: makeId('cache', rng), defId: found.id }); }\n    pushMessage(state, 'You crack the cache and recover two objects.');\n  }\n  if (!def.repeatable) feature.spent = true;\n}\nfunction endAcceptedTurn(state: GameState, rng: DeterministicRng): void {",
  },
  {
    label: 'lava resistance',
    oldText: "  if (playerTile?.kind === 'lava' && !hasStatus(state.player.statuses, 'fire-ward')) damagePlayer(state, 3, 'The lava burns you for 3.');",
    newText: "  if (playerTile?.kind === 'lava') { const damage = scaleTypedDamage(3, playerDamageMultiplier(state, 'fire')); if (damage > 0) damagePlayer(state, damage, `The lava burns you for ${damage}.`); }",
  },
  {
    label: 'pickup mystery name and feature resolution',
    oldText: "        if (item) { state.player.inventory.push({ id: item.id, defId: item.defId }); state.items = state.items.filter((entry) => entry.id !== item.id); pushMessage(state, `You pick up ${itemById(item.defId).name}.`); }\n        pendingExit = exitAt(state.floor, state.player.x, state.player.y);",
    newText: "        if (item) { const itemDef = itemById(item.defId); state.player.inventory.push({ id: item.id, defId: item.defId }); state.items = state.items.filter((entry) => entry.id !== item.id); pushMessage(state, `You pick up ${displayItemName(state, itemDef)}.`); }\n        resolveFeatureAtPlayer(state, rng);\n        pendingExit = exitAt(state.floor, state.player.x, state.player.y);",
  },
  {
    label: 'wait searches',
    oldText: "    addStatus(state.player.statuses, { op: 'status', id: 'guarding', duration: 1, magnitude: 1 }, state.player.id);\n    pushMessage(state, 'You brace for the next attack.'); accepted = true;",
    newText: "    addStatus(state.player.statuses, { op: 'status', id: 'guarding', duration: 1, magnitude: 1 }, state.player.id);\n    searchNearbyFeatures(state, rng);\n    resolveFeatureAtPlayer(state, rng);\n    pushMessage(state, 'You brace and search the nearby stonework.'); accepted = true;",
  },
  {
    label: 'identify successful item use',
    oldText: "  for (const effect of def.effects) applyEffect(state, effect, state.player, harmfulItemEffect(effect) ? hostile! : 'player', rng);\n  if (def.category === 'consumable') { state.player.inventory = state.player.inventory.filter((item) => item.id !== itemId); pushMessage(state, `You use ${def.name}.`); }\n  else pushMessage(state, `You activate ${def.name}.`);",
    newText: "  for (const effect of def.effects) applyEffect(state, effect, state.player, harmfulItemEffect(effect) ? hostile! : 'player', rng);\n  const newlyIdentified = identifyItem(state, def);\n  if (def.category === 'consumable') { state.player.inventory = state.player.inventory.filter((item) => item.id !== itemId); pushMessage(state, `You use ${def.name}.`); }\n  else pushMessage(state, `You activate ${def.name}.`);\n  if (newlyIdentified) pushMessage(state, `You identify it as ${def.name}.`);",
  },
  {
    label: 'drop mystery name',
    oldText: "  state.items.push({ id: entry.id, defId: entry.defId, x: state.player.x, y: state.player.y }); pushMessage(state, `You drop ${itemById(entry.defId).name}.`); return true;",
    newText: "  const def = itemById(entry.defId); state.items.push({ id: entry.id, defId: entry.defId, x: state.player.x, y: state.player.y }); pushMessage(state, `You drop ${displayItemName(state, def)}.`); return true;",
  },
  {
    label: 'feature invariants',
    oldText: "    const key = pointKey(monster); if (occupied.has(key)) throw new Error(`invariant: monsters overlap at ${key}`); occupied.add(key);\n  }\n}",
    newText: "    const key = pointKey(monster); if (occupied.has(key)) throw new Error(`invariant: monsters overlap at ${key}`); occupied.add(key);\n  }\n  for (const feature of state.features) if (!tileAt(state.floor, feature.x, feature.y)?.walkable) throw new Error(`invariant: feature in wall ${feature.id}`);\n}\n",
  },
]);

patch('src/ui/render.ts', [
  {
    label: 'feature render import',
    oldText: "import { resolveThemeContext, themeById } from '../world/themes';\n",
    newText: "import { resolveThemeContext, themeById } from '../world/themes';\nimport { featureDefinition } from '../world/features';\n",
  },
  {
    label: 'feature layer',
    oldText: "  for(const monster of state.monsters){\n    if(!visible.has(`${monster.x},${monster.y}`))continue;\n    const target=threatTarget(monster);if(!target)continue;",
    newText: "  for(const feature of state.features){\n    if(feature.spent||!feature.revealed)continue;const key=`${feature.x},${feature.y}`;if(!explored.has(key))continue;\n    if(feature.x<view.x||feature.y<view.y||feature.x>=view.x+view.cols||feature.y>=view.y+view.rows)continue;\n    const def=featureDefinition(feature.kind),p=screen(feature.x,feature.y);ctx.fillStyle=visible.has(key)?def.color:blendHex(def.color,'#07090d',.6);ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);\n  }\n  for(const monster of state.monsters){\n    if(!visible.has(`${monster.x},${monster.y}`))continue;\n    const target=threatTarget(monster);if(!target)continue;",
  },
]);

patch('src/main.ts', [
  {
    label: 'item knowledge ui import',
    oldText: "import { itemById } from './content/items';\n",
    newText: "import { itemById } from './content/items';\nimport { displayItemName } from './core/item-knowledge';\n",
  },
  {
    label: 'mystery item inventory names',
    oldText: "    const def = itemById(entry.defId);\n    const equipped = current.player.equippedWeaponId === entry.id || current.player.equippedArmorId === entry.id;",
    newText: "    const def = itemById(entry.defId);\n    const name = displayItemName(current, def);\n    const equipped = current.player.equippedWeaponId === entry.id || current.player.equippedArmorId === entry.id;",
  },
  {
    label: 'mystery item markup',
    oldText: "          <span class=\"item-name\"><strong>${def.name}</strong><small>${equipped ? 'Equipped · ' : ''}${def.category}</small></span>",
    newText: "          <span class=\"item-name\"><strong>${name}</strong><small>${equipped ? 'Equipped · ' : ''}${def.category}</small></span>",
  },
  {
    label: 'mystery drop aria',
    oldText: "        <button class=\"item-drop\" data-item-action=\"drop\" data-item-id=\"${entry.id}\" aria-label=\"drop ${def.name}\">×</button>",
    newText: "        <button class=\"item-drop\" data-item-action=\"drop\" data-item-id=\"${entry.id}\" aria-label=\"drop ${name}\">×</button>",
  },
]);
