import fs from 'node:fs';
const path='src/core/game.ts';
let s=fs.readFileSync(path,'utf8');
function once(oldText,newText,label){if(s.includes(newText))return;if(!s.includes(oldText))throw new Error(`missing anchor ${label}`);s=s.replace(oldText,newText);}

once(
"import { monsterDamageMultiplier, playerDamageMultiplier, scaleTypedDamage, weaponDamageType } from './combat-rules';",
"import { monsterDamageMultiplier, playerDamageMultiplier, scaleTypedDamage, weaponDamageType } from './combat-rules';\nimport { buyPrice, generateSites, sellPrice, servicePrice, siteAt, siteDefinition } from '../world/sites';",
'import sites');

once(
"  const occupied = new Set<string>([pointKey(state.player), ...state.floor.exits.map(pointKey), ...state.features.map(pointKey)]);\n  return state.floor.tiles.flatMap((tile, index) => {\n    if (!tile.walkable) return [];\n    const point = { x: index % state.floor.width, y: Math.floor(index / state.floor.width) };\n    return occupied.has(pointKey(point)) ? [] : [point];\n  });",
"  const occupied = new Set<string>([pointKey(state.player), ...state.floor.exits.map(pointKey), ...state.features.map(pointKey), ...state.sites.map(pointKey)]);\n  return state.floor.tiles.flatMap((tile, index) => {\n    if (!tile.walkable) return [];\n    const point = { x: index % state.floor.width, y: Math.floor(index / state.floor.width) };\n    if (occupied.has(pointKey(point))) return [];\n    if (state.sites.some((site) => site.settlementId && manhattan(site, point) <= 4)) return [];\n    return [point];\n  });",
'safe settlement spawn');

once(
"  state.temporaryTerrain = [];\n  state.explored = [];\n  state.visible = [];\n  state.features = generateFeatures(state.floor, context.primary, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'features')));\n  populateFloor(state, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'population')));",
"  state.temporaryTerrain = [];\n  state.explored = [];\n  state.visible = [];\n  state.sites = generateSites(state.floor, context.primary, state.coord, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'sites')));\n  state.features = generateFeatures(state.floor, context.primary, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'features')), state.sites);\n  populateFloor(state, new DeterministicRng(deriveSeed(state.runSeed, state.coord.depth, state.coord.lane, 'population')));",
'floor sites');

once("    schemaVersion: 3,","    schemaVersion: 4,",'schema');
once(
"    player: { id: 'player', x: floor.spawn.x, y: floor.spawn.y, hp: 34, maxHp: 34, attack: 5, defense: 1, inventory: [], statuses: [] },\n    monsters: [],\n    items: [],\n    features: [],",
"    player: { id: 'player', x: floor.spawn.x, y: floor.spawn.y, hp: 34, maxHp: 34, attack: 5, defense: 1, gold: 24, inventory: [], statuses: [] },\n    monsters: [],\n    items: [],\n    features: [],\n    sites: [],",
'new state');
once(
"  state.features = generateFeatures(floor, context.primary, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'features')));\n  populateFloor(state, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'population')));",
"  state.sites = generateSites(floor, context.primary, coord, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'sites')));\n  state.features = generateFeatures(floor, context.primary, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'features')), state.sites);\n  populateFloor(state, new DeterministicRng(deriveSeed(runSeed, coord.depth, coord.lane, 'population')));",
'initial sites');

once(
"  state.monsters = state.monsters.filter((entry) => entry.id !== monster.id);\n  pushMessage(state, `${def.name} dies.`);\n  return true;",
"  state.monsters = state.monsters.filter((entry) => entry.id !== monster.id);\n  const coin = def.tags.includes('humanoid') ? 2 : def.tags.includes('construct') ? 1 : 0;\n  if (coin) state.player.gold += coin;\n  pushMessage(state, `${def.name} dies.${coin ? ` You recover ${coin} gold.` : ''}`);\n  return true;",
'coin drops');

once(
"  } else if (feature.kind === 'unstable-cache') {\n    for (let i = 0; i < 2; i += 1) { const found = weightedItem(state, rng); state.player.inventory.push({ id: makeId('cache', rng), defId: found.id }); }\n    pushMessage(state, 'You crack the cache and recover two objects.');\n  }",
"  } else if (feature.kind === 'unstable-cache') {\n    for (let i = 0; i < 2; i += 1) { const found = weightedItem(state, rng); state.player.inventory.push({ id: makeId('cache', rng), defId: found.id }); }\n    const coins = rng.int(4, 12); state.player.gold += coins;\n    pushMessage(state, `You crack the cache and recover two objects and ${coins} gold.`);\n  }",
'cache coins');

const siteFunctions=`\nfunction revealWholeFloor(state: GameState): void {\n  const explored = new Set(state.explored);\n  for (let y=0;y<state.floor.height;y+=1) for (let x=0;x<state.floor.width;x+=1) if (state.floor.tiles[y*state.floor.width+x]!.walkable) explored.add(\`${'${x}'},${'${y}'}\`);\n  for (const exit of state.floor.exits) explored.add(pointKey(exit));\n  state.explored=[...explored];\n}\nfunction payForService(state: GameState, amount: number): boolean { if (state.player.gold < amount) { pushMessage(state, 'You do not have enough gold.'); return false; } state.player.gold -= amount; return true; }\nfunction resolveSiteService(state: GameState, action: Extract<GameAction,{type:'site-service'}>, rng: DeterministicRng): boolean {\n  const site=state.sites.find((entry)=>entry.id===action.siteId);\n  if(!site||site.x!==state.player.x||site.y!==state.player.y)return false;\n  const def=siteDefinition(site.kind); if(!def.services.includes(action.service))return false;\n  const singleUse = action.service==='rumor'||action.service==='map'||action.service==='bless'||action.service==='rest';\n  if(singleUse&&site.usedServices.includes(action.service)){pushMessage(state,'That service has already been used here.');return false;}\n  if(action.service==='buy'){\n    const offer=site.stock.find((entry)=>entry.id===action.offerId);if(!offer)return false;if(!payForService(state,offer.price))return false;\n    state.player.inventory.push({id:offer.id,defId:offer.defId});site.stock=site.stock.filter((entry)=>entry.id!==offer.id);pushMessage(state,\`You buy ${'${itemById(offer.defId).name}'} for ${'${offer.price}'} gold.\`);return true;\n  }\n  if(action.service==='sell'){\n    const entry=action.itemId?inventoryEntry(state,action.itemId):undefined;if(!entry)return false;\n    if(state.player.equippedWeaponId===entry.id)state.player.equippedWeaponId=undefined;if(state.player.equippedArmorId===entry.id)state.player.equippedArmorId=undefined;\n    const price=sellPrice(entry.defId);state.player.inventory=state.player.inventory.filter((item)=>item.id!==entry.id);state.player.gold+=price;pushMessage(state,\`You sell ${'${itemById(entry.defId).name}'} for ${'${price}'} gold.\`);return true;\n  }\n  const price=servicePrice(action.service);if(price&&!payForService(state,price))return false;\n  if(action.service==='heal'){if(state.player.hp>=state.player.maxHp){state.player.gold+=price;pushMessage(state,'You are already fully healed.');return false;}state.player.hp=state.player.maxHp;pushMessage(state,'The healer restores you completely.');return true;}\n  if(action.service==='cleanse'){const before=state.player.statuses.length;state.player.statuses=state.player.statuses.filter((status)=>!statusById(status.id).harmful);if(before===state.player.statuses.length){state.player.gold+=price;pushMessage(state,'There is nothing harmful to cleanse.');return false;}pushMessage(state,'The healer clears your afflictions.');return true;}\n  if(action.service==='identify'){const entry=action.itemId?inventoryEntry(state,action.itemId):undefined;if(!entry){state.player.gold+=price;return false;}const item=itemById(entry.defId);if(!identifyItem(state,item)){state.player.gold+=price;pushMessage(state,\`${'${item.name}'} is already understood.\`);return false;}pushMessage(state,\`The appraiser identifies ${'${item.name}'}.\`);return true;}\n  if(action.service==='map'){revealWholeFloor(state);site.usedServices.push('map');pushMessage(state,'The cartographer marks the entire reachable level.');return true;}\n  if(action.service==='bless'){addStatus(state.player.statuses,{op:'status',id:'focused',duration:28,magnitude:1},site.id);addStatus(state.player.statuses,{op:'status',id:'guarding',duration:5,magnitude:1},site.id);site.usedServices.push('bless');pushMessage(state,'The shrine grants a long blessing.');return true;}\n  if(action.service==='rest'){const amount=Math.max(6,Math.floor(state.player.maxHp*.35));state.player.hp=Math.min(state.player.maxHp,state.player.hp+amount);site.usedServices.push('rest');pushMessage(state,\`You rest and recover ${'${amount}'} HP.\`);return true;}\n  if(action.service==='rumor'){for(const exit of state.floor.exits){for(let y=Math.max(0,exit.y-2);y<=Math.min(state.floor.height-1,exit.y+2);y+=1)for(let x=Math.max(0,exit.x-2);x<=Math.min(state.floor.width-1,exit.x+2);x+=1)state.explored.push(\`${'${x}'},${'${y}'}\`);}state.explored=[...new Set(state.explored)];site.usedServices.push('rumor');pushMessage(state,'Locals mark the known descents and warn that deeper side routes become unstable.');return true;}\n  return false;\n}\n`;
once("function dropInventoryItem(state: GameState, itemId: string): boolean {",siteFunctions+"\nfunction dropInventoryItem(state: GameState, itemId: string): boolean {",'site service functions');

once(
"        resolveFeatureAtPlayer(state, rng);\n        pendingExit = exitAt(state.floor, state.player.x, state.player.y);",
"        resolveFeatureAtPlayer(state, rng);\n        const arrivedSite = siteAt(state.sites, state.player.x, state.player.y);\n        if (arrivedSite) pushMessage(state, `You enter ${arrivedSite.settlementName ?? siteDefinition(arrivedSite.kind).kind}.`);\n        pendingExit = exitAt(state.floor, state.player.x, state.player.y);",
'arrive site');

once(
"  } else if (action.type === 'use-item') accepted = useInventoryItem(state, action.itemId, rng);\n  else if (action.type === 'drop-item') accepted = dropInventoryItem(state, action.itemId);",
"  } else if (action.type === 'use-item') accepted = useInventoryItem(state, action.itemId, rng);\n  else if (action.type === 'drop-item') accepted = dropInventoryItem(state, action.itemId);\n  else if (action.type === 'site-service') accepted = resolveSiteService(state, action, rng);",
'dispatch site');

once(
"  const ids = new Set<string>(), inventoryIds = state.player.inventory.map((entry) => entry.id);\n  for (const entity of [state.player, ...state.monsters, ...state.items, ...state.player.inventory]) { if (ids.has(entity.id)) throw new Error(`invariant: duplicate entity id ${entity.id}`); ids.add(entity.id); }",
"  const ids = new Set<string>(), inventoryIds = state.player.inventory.map((entry) => entry.id);\n  for (const entity of [state.player, ...state.monsters, ...state.items, ...state.player.inventory, ...state.sites, ...state.sites.flatMap((site)=>site.stock)]) { if (ids.has(entity.id)) throw new Error(`invariant: duplicate entity id ${entity.id}`); ids.add(entity.id); }",
'invariant identities');
once(
"  for (const feature of state.features) if (!tileAt(state.floor, feature.x, feature.y)?.walkable) throw new Error(`invariant: feature in wall ${feature.id}`);",
"  for (const feature of state.features) if (!tileAt(state.floor, feature.x, feature.y)?.walkable) throw new Error(`invariant: feature in wall ${feature.id}`);\n  const sitePositions=new Set<string>();for(const site of state.sites){if(!tileAt(state.floor,site.x,site.y)?.walkable)throw new Error(`invariant: site in wall ${site.id}`);const key=pointKey(site);if(sitePositions.has(key))throw new Error(`invariant: sites overlap at ${key}`);sitePositions.add(key);if(state.features.some((feature)=>samePoint(feature,site)))throw new Error(`invariant: site overlaps feature ${site.id}`);}",
'site invariants');

fs.writeFileSync(path,s);
