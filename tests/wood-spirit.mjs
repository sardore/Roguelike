// Run after npm run build:qa. Exercise the assembled runtime and real turn engine.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.rootTest={state:()=>state,can:()=>playerAction57('martial',{allowMartial:true,skill:true,closeMartial:true}),cast:activateMartial,raise:palaceRootWallsRise,resolve:palaceResolveIntent,
  freeze:freezeWater105,lotus:PALACE_LOTUS105,rules:MOUNTAIN_WOOD_RULES,terrain:RuntimeTerrainOwner,TT,occupancy:OccupancyService,
  wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:'root-wall-test'}),
  blocks:tileBlocks,sight:tileBlocksSight,blink:blinkHardBlock,inspect:palaceInspect,warning:martialWorldInfo,
  fx:FX,draw:drawPalaceRock,save:saveGame,load:loadGame,update:updateAll};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
const evaluate = (fn, arg) => s.page.evaluate(fn, arg);
const setup = async (level = 3) => { await dismissModals(s); await s.tick(1000); return evaluate(level => {
  const Q = rootTest, st = Q.state(), T = Q.TT;
  st.monsters = []; st.items = []; st.tempFields = []; st.tempTerrain74 = [];
  st.terrainUnderlay58 = {}; st.terrainAttachment58 = {}; st.terrainMutationVersion57 = {};
  st.branchContext105 = null; st.branchTerrain105 = null; st.dead = false; st.victory = false;
  st.status = {}; st.turn = 10; st.floorTurn = 10; st.enemyEnergy = 0;
  st.player.x = 15; st.player.y = 15; st.player.hp = st.player.maxHp = 1000;
  st.player.focus = st.player.maxFocus = 20;
  st.player.martial.strong = level;
  st.player.trinket = { name: '흑산 목령인', type: 'trinket', branchEffect105: 'woodMartial', martialSlot105: 'strong' };
  st.playerAgencyTurns57 = 10; st.tutorialEntry60 = { completed: true };
  st.visible = new Set(); st.seen = new Set();
  for (let y = 8; y <= 22; y++) for (let x = 8; x <= 22; x++) {
    st.map[y][x] = T.FLOOR; st.visible.add(`${x},${y}`); st.seen.add(`${x},${y}`);
  }
  Q.occupancy.endShared();
  const dummy = (name, x, y, extras = {}) => {
    const m = { name, x, y, hp: 1000, maxHp: 1000, atk: 0, def: 0, eva: 0, xp: 0,
      fixed: true, dormant57: true, immobile105: true, skillSeal105: 99, shape: 'human', kind: 'human', ...extras };
    Q.occupancy.addMonster(m); return m;
  };
  dummy('테두리 적', 17, 15); dummy('안쪽 적', 16, 15); dummy('아군', 15, 13, { faction57: 'player' });
  dummy('독 면역', 13, 15, { poisonImmune: true });
  dummy('풀 저항', 15, 17, { armor: { elementGuard74: 'grass' } });
  dummy('밖의 적', 19, 15);
  return Q.lotus.atk;
}, level); };

try {
  await startRun(s, 'swordsman');
  assert.equal(await setup(), 9, 'lotus base attack');
  assert.equal(await evaluate(() => rootTest.cast('strong')), true);
  let out = await evaluate(() => {
    const st = rootTest.state(); return { turn: st.turn, fields: st.tempFields.filter(f => f.kind === 'rootWall'), walls: st.tempTerrain74.length, focus: st.player.focus };
  });
  assert.equal(out.turn, 11); assert.equal(out.walls, 0, 'casting action leaves a warning');
  assert.equal(out.fields.length, 1); assert.equal(out.fields[0].cells.length, 16); assert.equal(out.focus, 15);
  assert.ok(out.fields[0].cells.every(c => Math.max(Math.abs(c.x - 15), Math.abs(c.y - 15)) === 2));
  assert.match(await evaluate(() => rootTest.warning(17, 15).name), /목령벽/);
  await evaluate(() => rootTest.wait());
  out = await evaluate(() => {
    const Q = rootTest, st = Q.state(); return { turn: st.turn, walls: st.tempTerrain74.length,
      stun: st.monsters.find(m => m.name === '테두리 적').stunned,
      allyStun: st.monsters.find(m => m.name === '아군').stunned || 0,
      blocked: [Q.blocks(Q.TT.PALACE_ROCK), Q.sight(Q.TT.PALACE_ROCK), Q.blink(Q.TT.PALACE_ROCK)],
      name: Q.inspect(Q.TT.PALACE_ROCK, 17, 15).name };
  });
  assert.equal(out.turn, 12); assert.equal(out.walls, 16); assert.equal(out.stun, 1);
  assert.equal(out.allyStun, 0); assert.deepEqual(out.blocked, [true, true, true]); assert.equal(out.name, '목령벽');
  await s.tick(300);
  fs.mkdirSync(path.join(repo, 'tests/artifacts/wood-spirit'), { recursive: true });
  await s.page.screenshot({ path: path.join(repo, 'tests/artifacts/wood-spirit/walls.png') });
  // The actual save loader must preserve raised walls, timers, source, and substrate.
  await evaluate(() => { rootTest.save(); rootTest.load(); });
  await s.tick(500);
  assert.equal(await evaluate(() => rootTest.state().tempTerrain74.filter(t => t.rootWall105?.element === 'grass').length), 16);
  const hpAfterLoad = await evaluate(() => rootTest.state().player.hp);
  await evaluate(() => rootTest.wait());
  out = await evaluate(() => {
    const st = rootTest.state(); return { walls: st.tempTerrain74.length, playerHP: st.player.hp,
      monsters: st.monsters.map(m => ({ name: m.name, damage: 1000 - m.hp, poison: m.poisoned57 || 0, drunk: m.drunk || 0 })),
      restored: st.map[15][17] === rootTest.TT.FLOOR,
      grassFX: rootTest.fx.elementAttacks105.some(f => f.elem === 'grass') };
  });
  assert.equal(out.walls, 0); assert.equal(out.restored, true); assert.equal(out.playerHP, hpAfterLoad); assert.equal(out.grassFX, true);
  const byName = n => out.monsters.find(m => m.name === n);
  for (const name of ['테두리 적', '안쪽 적']) {
    assert.equal(byName(name).damage, 21, name + ': three overlapping explosions');
    assert.equal(byName(name).poison, 16); assert.equal(byName(name).drunk, 12);
  }
  assert.equal(byName('아군').damage, 0); assert.equal(byName('아군').drunk, 0);
  assert.equal(byName('독 면역').poison, 0); assert.equal(byName('독 면역').drunk, 12);
  assert.equal(byName('풀 저항').damage, 0); assert.equal(byName('풀 저항').drunk, 0);
  assert.equal(byName('밖의 적').damage, 0);
  console.log('PASS cast → warning → 16 walls → stun → stacked grass explosion; immunity, allies, save/load');

  for (const level of [1, 2, 4, 5]) {
    await setup(level); assert.equal(await evaluate(() => rootTest.cast('strong')),true,JSON.stringify(await evaluate(() => ({can:rootTest.can(),log:rootTest.state().log.slice(-3),turn:rootTest.state().turn})))); await evaluate(() => rootTest.wait()); await evaluate(() => rootTest.wait());
    out = await evaluate(() => { const m = rootTest.state().monsters.find(m => m.name === '테두리 적'); return [1000 - m.hp, m.poisoned57, m.drunk]; });
    const damage = [0, 3, 5, 7, 10, 14], poison = [0, 8, 12, 16, 22, 30], drunk = [0, 6, 9, 12, 16, 22];
    assert.deepEqual(out, [damage[level] * 3, poison[level], drunk[level]]);
  }
  console.log('PASS all five martial levels');

  await setup();
  await evaluate(() => rootTest.cast('strong'));
  await s.tick(1000);
  assert.equal(await evaluate(() => rootTest.cast('strong')), true);
  assert.equal(await evaluate(() => rootTest.state().tempTerrain74.filter(t => t.rootWall105).length), 16,
    'a repeated cast must not cancel the first warning');
  console.log('PASS repeated cast preserves pending eruption');

  await setup();
  await evaluate(() => rootTest.cast('strong'));
  await evaluate(() => { rootTest.save(); rootTest.load(); });
  await dismissModals(s);
  await evaluate(() => rootTest.wait());
  assert.equal(await evaluate(() => rootTest.state().tempTerrain74.filter(t => t.rootWall105).length), 16,
    'warning survives save/load before the eruption');
  console.log('PASS pending warning survives save/load');

  await setup();
  await evaluate(() => {
    const st = rootTest.state(), T = rootTest.TT;
    st.map[13][15] = T.STAIR; st.map[15][17] = T.WALL; st.map[15][13] = T.WATER; rootTest.freeze(13,15);
  });
  await evaluate(() => rootTest.cast('strong')); await evaluate(() => rootTest.wait());
  out = await evaluate(() => { const st = rootTest.state(), Q = rootTest; return { walls: st.tempTerrain74.filter(t => t.rootWall105).length, tiles: [st.map[13][15], st.map[15][17], st.map[15][13]], expected: [Q.TT.STAIR, Q.TT.WALL, Q.TT.ICE], stun: st.monsters.find(m => m.name === '독 면역').stunned || 0 }; });
  assert.equal(out.walls, 13); assert.deepEqual(out.tiles, out.expected); assert.equal(out.stun, 0);
  await evaluate(() => rootTest.wait());
  console.log('PASS protected stairs, existing walls, ice, and no stun on failed rise');

  await setup();
  out = await evaluate(() => {
    const Q = rootTest, st = Q.state();
    const mon = st.monsters.find(m => m.name === '테두리 적');
    mon.atk = 9; mon.palaceLotus105 = true;
    Q.resolve(mon, { type: 'palaceRoots105', data: { resolveTurn105: st.turn }, cells: [{ x: 16, y: 15 }], armedPlayerTurn: st.turn - 1 });
    return { root: st.tempTerrain74[0].rootWall105, stun: st.status.stun || 0 };
  });
  assert.equal(out.root.atk, 9); assert.equal(out.root.element, undefined);
  await evaluate(() => { rootTest.state().turn++; rootTest.terrain.tick(); });
  assert.equal(await evaluate(() => 1000 - rootTest.state().player.hp), 13);
  console.log('PASS lotus retains earth explosion at attack 9 × 1.4');

  await setup();
  out = await evaluate(() => {
    const Q = rootTest, st = Q.state();
    const mon = st.monsters.find(m => m.name === '테두리 적');
    mon.atk = 9; mon.palaceLotus105 = true;
    st.player.weapon = { ...st.player.weapon, name: '철두창', elementBrand74: 'water' };
    st.player.armor = { ...st.player.armor, name: '강화 가죽 갑옷', elementGuard74: 'earth' };
    Q.resolve(mon, { type: 'palaceRoots105', data: { resolveTurn105: st.turn },
      cells: [{ x: 16, y: 15 }, { x: 15, y: 16 }], armedPlayerTurn: st.turn - 1 });
    const walls = st.tempTerrain74.filter(t => t.rootWall105).length;
    st.turn++; Q.terrain.tick();
    return { walls, hp: st.player.hp, remaining: st.tempTerrain74.filter(t => t.rootWall105).length };
  });
  assert.deepEqual(out, { walls: 2, hp: 1000, remaining: 0 });
  console.log('PASS earth armor blocks overlapping lotus wall blasts with a water-branded spear');
  assert.deepEqual(s.errors, []);
} finally { await s.close(); await ctx.close(); await browser.close(); }
