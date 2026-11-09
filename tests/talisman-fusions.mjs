// npm run build:qa && node tests/talisman-fusions.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.fusionTest={state:()=>state,recipes:FUSION_RECIPES,base:TALISMAN_BY_KIND,
  item:recipeItem,use:useInventoryItem,cast:castFusion,open:openFusion,fuse:fuse74,compatible:compatible74,
  TT,occupancy:OccupancyService,stats:getStats,fx:FX,update:updateAll,hydrate:ensure74,save:saveGame,load:loadGame,
  wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:'fusion-test'})};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 306 });
const evaluate = (fn, arg) => s.page.evaluate(fn, arg);
async function setup(floor = 1) {
  await dismissModals(s); await s.tick(1000);
  await evaluate(floor => {
    const Q = fusionTest, st = Q.state(), p = st.player;
    st.floor = floor; st.branchContext105 = null; st.branchTerrain105 = null;
    st.status = {}; st.log = []; st.elementWard74 = null; st.tempFields = []; st.elementFields74 = [];
    st.tempTerrain74 = []; st.items = []; st.monsters = []; st.terrainReactions105 = null;
    st.terrainUnderlay58 = {}; st.terrainAttachment58 = {}; st.terrainMutationVersion57 = {};
    st.turn = 10; st.floorTurn = 10; st.enemyEnergy = 0; st.playerAgencyTurns57 = 10;
    st.dead = false; st.victory = false; st.tutorialEntry60 = { completed: true };
    p.x = 15; p.y = 15; p.hunger = 100; p.hp = p.maxHp; p.facing = { x: 0, y: -1 };
    p.inventory = []; p.weapon = p.armor = p.cloak = p.trinket = p.relic = null;
    st.visible = new Set(); st.seen = new Set();
    for (let y = 8; y <= 24; y++) for (let x = 8; x <= 24; x++) {
      st.map[y][x] = Q.TT.FLOOR; st.visible.add(`${x},${y}`); st.seen.add(`${x},${y}`);
    }
    Q.occupancy.endShared(); Q.fx.elementAttacks105 = [];
  }, floor);
}
async function dummy(extra = {}) {
  await evaluate(extra => {
    fusionTest.occupancy.addMonster({ name: '시험 적', x: 17, y: 15, hp: 1000, maxHp: 1000,
      atk: 0, def: 0, eva: 0, xp: 0, fixed: true, dormant57: true, kind: 'human', shape: 'human', ...extra });
  }, extra);
}
async function cast(kind, x = 17, y = 15) {
  return evaluate(([kind, x, y]) => {
    const Q = fusionTest, st = Q.state(), recipe = Q.recipes.find(r => r.kind === kind);
    const item = recipe ? Q.item(recipe) : { ...Q.base.get(kind), count: 1 };
    st.player.inventory.push(item); const before = st.turn;
    const opened = Q.use(st.player.inventory.indexOf(item));
    const ok = item.fusionMode74 === 'target' ? Q.cast(x, y) : opened;
    return { ok, before, turn: st.turn, remaining: st.player.inventory.includes(item),
      status: { ...st.status }, guard: st.elementWard74, fields: st.tempFields,
      elementFields: st.elementFields74, walls: st.tempTerrain74,
      monsters: st.monsters.map(m => ({ name: m.name, x: m.x, y: m.y, hp: m.hp, stun: m.stunned || 0,
        poison: m.poisoned57 || 0, sealed: m.skillSeal105 || 0, weak: m.weakened || 0, blind: m.blinded55 || 0 })),
      log: st.log.slice(0, 15), hp: st.player.hp };
  }, [kind, x, y]);
}

try {
  await startRun(s, 'wanderer');
  await setup();
  const catalog = await evaluate(() => {
    const Q = fusionTest, elements = [...Q.base.keys()].filter(k => k.startsWith('elem_'));
    const pairs = [];
    for (let i = 0; i < elements.length; i++) for (let j = i + 1; j < elements.length; j++) {
      const a = Q.base.get(elements[i]), b = Q.base.get(elements[j]);
      pairs.push([a.talismanKind, b.talismanKind, Q.compatible(a, b)?.kind, Q.compatible(b, a)?.kind]);
    }
    const wards = [...Q.base.values()].filter(t => t.talismanKind !== 'ward')
      .map(t => [t.talismanKind, Q.compatible(Q.base.get('ward'), t)?.kind]);
    const keys = Q.recipes.map(r => [r.a, r.b].sort().join('+'));
    return { pairs, wards, unique: new Set(keys).size === keys.length, offered: __MANRU_QA_FEATURES__.fusion() };
  });
  assert.equal(catalog.pairs.length, 15); assert.equal(catalog.wards.length, 13); assert.equal(catalog.unique, true);
  for (const [a, b, kind, reverse] of catalog.pairs) { assert.ok(kind, a + '+' + b); assert.equal(kind, reverse); }
  for (const [base, kind] of catalog.wards) assert.ok(kind, 'ward+' + base);
  assert.ok(catalog.offered.every(r => r.offered));
  console.log('PASS all 15 elemental pairs, 13 ward partners, unique recipes and real fusion UI');

  for (const pair of [['elem_fire', 'elem_shock'], ['ward', 'elem_ice'], ['blast', 'ward']]) {
    await setup();
    const result = await evaluate(([a, b]) => {
      const Q = fusionTest, st = Q.state(), ia = { ...Q.base.get(a), count: 2 }, ib = { ...Q.base.get(b), count: 2 };
      st.player.inventory.push(ia, ib); st.knowledge56.talismanKnown[a] = st.knowledge56.talismanKnown[b] = true;
      const turn = st.turn; Q.open(ia); const ok = Q.fuse(ia, ib);
      return { ok, elapsed: st.turn - turn, counts: [ia.count, ib.count], result: st.player.inventory.find(i => i.fusion74)?.talismanKind, expected: Q.compatible(ia, ib).kind };
    }, pair);
    assert.equal(result.ok, true); assert.equal(result.elapsed, 1); assert.deepEqual(result.counts, [1, 1]); assert.equal(result.result, result.expected);
  }
  console.log('PASS crafting consumes one of each material and exactly one turn');

  const mixes = await evaluate(() => fusionTest.recipes.filter(r => r.attack).map(r => r.kind));
  assert.equal(mixes.length, 9);
  for (const floor of [1, 21]) for (const kind of mixes) {
    await setup(floor); await dummy();
    const out = await cast(kind); assert.equal(out.ok, true, kind); assert.equal(out.turn - out.before, 1); assert.equal(out.remaining, false);
    const recipe = await evaluate(kind => fusionTest.recipes.find(r => r.kind === kind), kind);
    const minimum = recipe.attack.parts.reduce((n, [, base, scale]) => n + base + Math.floor((floor - 1) / 5) * scale, 0);
    assert.ok(1000 - out.monsters[0].hp >= minimum, `${kind}: direct damage ${1000 - out.monsters[0].hp} >= ${minimum}`);
    for (const [status, turns] of Object.entries(recipe.attack.status)) {
      const key = { poison: 'poison', stun: 'stun', skillSeal: 'sealed', weaken: 'weak', blind: 'blind' }[status];
      if (key) assert.ok(out.monsters[0][key] >= turns - 1, kind + ': ' + status);
    }
    const elements = await evaluate(() => [...new Set(fusionTest.fx.elementAttacks105.map(f => f.elem))]);
    for (const [element] of recipe.attack.parts) assert.ok(elements.includes(element), kind + ': element FX');
  }
  console.log('PASS nine new spells actually deal both elements, status effects and scaling on floors 1/21');

  const bombs = { f_fire_blast: ['화염 피해', 42, 8], f_shock_blast: ['뇌전 피해', 40, 8], f_water_blast: ['수류 피해', 36, 7], f_ice_blast: ['빙결 피해', 34, 7], f_grass_blast: ['목령 피해', 32, 7], f_earth_blast: ['대지 피해', 38, 8], f_bindblast: [null, 34, 7] };
  for (const floor of [1, 21]) for (const [kind, [source, power, scale]] of Object.entries(bombs)) {
    await setup(floor); await dummy(); const out = await cast(kind); assert.equal(out.ok, true);
    const expected = power + scale * Math.floor((floor - 1) / 5);
    if (source) assert.ok(out.log.some(l => l.includes(source + ' → 시험 적: ' + expected)), `${kind}: ${JSON.stringify(out.log)}`);
    else assert.equal(1000 - out.monsters[0].hp, expected);
    if (kind === 'f_ice_blast' || kind === 'f_earth_blast') assert.ok(out.monsters[0].stun >= 1);
    if (kind === 'f_grass_blast') assert.ok(out.monsters[0].poison >= 7 + Math.floor((floor - 1) / 5));
    if (kind === 'f_bindblast') assert.ok(out.monsters[0].stun >= 3);
  }
  await setup(); await dummy({ kind: 'undead', x: 16 });
  let out = await cast('f_holy_blast'); assert.equal(1000 - out.monsters[0].hp, 40);
  await setup();
  for (const [x, y] of [[17,15],[16,14],[17,14],[18,14],[16,15],[18,15],[16,16],[17,16]]) await dummy({x,y});
  out = await cast('f_shock_blast'); assert.equal(out.monsters.filter(m => m.hp < 1000).length, 7);
  await setup(); await dummy(); out = await cast('f_water_blast'); assert.equal(out.monsters[0].x, 20, 'centered pressure blast pushes three cells');
  console.log('PASS all eight explosion fusions receive the intended damage/control buffs');

  await setup(); const def0 = await evaluate(() => fusionTest.stats().def);
  await evaluate(() => { fusionTest.state().status.weaken = 4; fusionTest.state().status.blind = 4; });
  out = await cast('ward'); assert.equal(out.status.ward, 14); assert.equal(out.status.fortify, 6); assert.equal(out.status.weaken, 0); assert.equal(out.status.blind, 0);
  assert.equal(await evaluate(() => fusionTest.stats().def), def0 + 5);
  await evaluate(() => { for (let i = 0; i < 6; i++) fusionTest.wait(); });
  assert.equal(await evaluate(() => fusionTest.stats().def), def0 + 2);
  await evaluate(() => { for (let i = 0; i < 8; i++) fusionTest.wait(); });
  assert.equal(await evaluate(() => fusionTest.stats().def), def0);
  console.log('PASS base ward DEF +5 initially, DEF +2 afterward, exact 6/14-turn expiry');

  const wards = await evaluate(() => fusionTest.recipes.filter(r => r.ward && r.mode === 'instant').map(r => ({ kind: r.kind, rule: r.ward })));
  for (const { kind, rule } of wards) {
    await setup(); await dummy({ x: 16, kind: 'undead' }); out = await cast(kind);
    assert.equal(out.ok, true, kind); assert.equal(out.remaining, false); assert.equal(out.status.ward, rule.turns, kind);
    if (rule.element) { assert.equal(out.guard.element, rule.element); assert.equal(out.guard.ttl, rule.guardTurns); }
    if (rule.fortify) assert.equal(out.status.fortify, rule.fortify);
    if (rule.regen) assert.equal(out.status.regen, rule.regen);
    if (kind === 'f_shock_ward') assert.ok(out.monsters[0].sealed >= 2);
    if (kind === 'f_ice_ward') assert.ok(out.monsters[0].stun >= 1);
    if (kind === 'f_repulse_ward') assert.ok(out.monsters[0].x >= 18);
    if (kind === 'f_binding_ward') assert.ok(out.monsters[0].sealed >= 3 && out.monsters[0].stun >= 2);
    if (kind === 'f_sanctuary_ward') assert.ok(out.monsters[0].sealed >= 4);
    if (kind === 'f_insight_ward') assert.equal(out.status.willBoost, 12);
    if (kind === 'f_earth_ward') assert.equal(out.walls.filter(t => t.kind === 'bulwark').length, 3);
  }
  await setup();
  out = await cast('f_guardblink', 19, 15); assert.equal(out.ok, true); assert.equal(out.status.ward, 14);
  assert.ok(out.fields.some(f => f.kind === 'smoke' && f.x === 15 && f.y === 15 && f.ttl === 3));
  console.log('PASS all 13 ward fusions, elemental guards, active control and blink smoke');

  await setup(); await dummy({ armor: { elementGuard74: 'grass' }, poisonImmune: true });
  out = await cast('f_neurotoxin'); assert.equal(out.monsters[0].poison, 0); assert.ok(out.monsters[0].sealed >= 3);
  await setup(); await dummy({ stunned: 1 }); out = await cast('f_shatterstone'); assert.equal(1000 - out.monsters[0].hp, 44);
  await setup(); await dummy({ boss: true }); out = await cast('f_frostvine'); assert.ok(out.monsters[0].stun <= 1);
  await setup(); await dummy(); await evaluate(() => { fusionTest.state().map[15][16] = fusionTest.TT.WALL; });
  out = await cast('f_stormfire'); assert.equal(out.ok, false); assert.equal(out.turn, out.before); assert.equal(out.remaining, true);
  console.log('PASS immunity, boss control limit and blocked casts without consumption');

  await setup();
  const saved = await evaluate(() => {
    const Q = fusionTest, st = Q.state(), item = Q.item(Q.recipes.find(r => r.kind === 'f_fire_ward'));
    item.count = 2; item.ability = 'old'; item.desc = 'old'; st.player.inventory.push(item);
    Q.hydrate(true); const updated = item.ability !== 'old' && item.count === 2;
    Q.save(); Q.load(); const restored = Q.state().player.inventory.find(i => i.talismanKind === 'f_fire_ward');
    return { updated, count: restored?.count, ability: restored?.ability };
  });
  assert.equal(saved.updated, true); assert.equal(saved.count, 2); assert.match(saved.ability, /14턴/);
  console.log('PASS existing fused items refresh descriptions and keep quantities across save/load');

  await setup();
  await s.page.setViewportSize({ width: 390, height: 844 });
  await evaluate(() => {
    const Q = fusionTest, st = Q.state();
    for (const def of Q.base.values()) { st.player.inventory.push({ ...def, count: 1 }); st.knowledge56.talismanKnown[def.talismanKind] = true; }
    Q.open(st.player.inventory.find(i => i.talismanKind === 'ward'));
  });
  await s.tick(300);
  assert.equal(await s.page.locator('#fusion74body [data-f74second]').count(), 13);
  assert.equal(await evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  fs.mkdirSync(path.join(repo, 'tests/artifacts/fusion-focused'), { recursive: true });
  await s.page.screenshot({ path: path.join(repo, 'tests/artifacts/fusion-focused/ward-mobile.png') });
  assert.deepEqual(s.errors, []);
  console.log('PASS mobile fusion menu shows all 13 ward partners without horizontal overflow');
} finally { await s.close(); await ctx.close(); await browser.close(); }
