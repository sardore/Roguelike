// Run after npm run build:qa. 천면경탑 2층 보물창고, 3층 잎사귀 정자(이지선다), 인벤토리·음식 보강.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.roomTest={reset:resetVisualState,vis2:()=>VisibilityService.compute(),pickup:()=>ActionDispatcher.dispatch({type:'PICKUP',args:[]}).value,TT,draw:drawFast,resetView:resetVisualState,hazard:()=>hz(),state:()=>state,go:branchTransition,build:buildBranch,vis:()=>VisibilityService.compute(),capacity:inventoryCapacity,
 move:(dx,dy)=>ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}),
 wait:()=>TurnEngine.advance({handled:true,committed:true,timeCost:1,reason:'t'}),passive:martialPassiveSlots};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER,
  fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 217 });
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(1000);
const out = await s.page.evaluate(() => {
  const T = roomTest, st = T.state(), r = { vault: [], pav: [], errors: [] };
  st.tutorialEntry60 = { completed: true };
  for (let i = 0; i < 40; i++) for (const level of [2, 3]) {
    try {
      st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'rooms-' + level + '-' + i;
      T.build('mirror', level);
      const cur = T.state(), ter = cur.branchTerrain105, z = ter.mirror105.zones;
      const premium = cur.items.filter(it => it.premium || it.art?.premium);
      if (level === 2) {
        let cells = 0; for (const row of z) for (const c of row) if (c === 'v') cells++;
        r.vault.push({ cells, premium: premium.length, names: premium.map(p => p.name) });
      } else {
        const leaves = Object.keys(ter.leaves || {}).length, onLeaf = premium.filter(p => ter.leaves?.[p.x + ',' + p.y]).length;
        r.pav.push({ leaves, premium: premium.length, onLeaf });
      }
    } catch (e) { r.errors.push(level + ':' + e.message); }
  }
  r.capacity = [T.capacity(), T.passive()];
  return r;
});
console.log('mirror rooms', JSON.stringify({ ...out, vault: out.vault.length }).slice(0, 1600));
assert.deepEqual(out.errors, [], 'generation errors');
const goodVault = out.vault.filter(v => v.cells >= 14 && v.premium === 3).length;
const goodPav = out.pav.filter(v => v.leaves >= 20 && v.onLeaf === 2).length;
console.log('vault ok', goodVault + '/' + out.vault.length, 'pavilion ok', goodPav + '/' + out.pav.length);
assert.ok(goodVault >= out.vault.length * .7, 'vault frequency');
assert.ok(goodPav >= out.pav.length * .7, 'pavilion frequency');

// play-through: build a pavilion, stand on its west ledge, run the leaf path and take one prize
const play = await s.page.evaluate(() => {
  const T = roomTest; let st = T.state(), cur = null;
  for (let i = 0; i < 12; i++) { st.branchWorld105 = { version: 1, pages: {} }; st.runId984 = 'play-' + i; T.build('mirror', 3); cur = T.state(); if (Object.keys(cur.branchTerrain105.leaves || {}).length) break; }
  const ter = cur.branchTerrain105, leaves = Object.keys(ter.leaves).map(key => key.split(',').map(Number)), prizes = cur.items.filter(i => i.premium);
  const ledgeCells = []; const z = ter.mirror105.zones;
  // the west ledge is the zone-p floor next to leaf row v=0 start: find a floor cell adjacent to a leaf that has the longest leaf line
  const leafSet = new Set(Object.keys(ter.leaves)); let start = null;
  for (let y = 0; y < z.length && !start; y++) for (let x = 0; x < z[y].length; x++) if (z[y][x] === 'p' && cur.map[y][x] === T.TT.FLOOR) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (leafSet.has((x + dx) + ',' + (y + dy)) && !start) { let n = 0, cx = x + dx, cy = y + dy; while (leafSet.has(cx + ',' + cy)) { n++; cx += dx; cy += dy } if (n >= 4) start = { x, y, dx, dy } }
  return { leaves: leaves.length, prizes: prizes.map(p => ({ x: p.x, y: p.y, name: p.name })), start, tile: start && cur.map[start.y + start.dy][start.x + start.dx], paper: T.TT.PAPER_BRIDGE };
});
console.log('play', JSON.stringify(play));
assert.ok(play.start, 'pavilion west ledge found');
assert.equal(play.tile, play.paper, 'leaf tile is a paper bridge');
assert.equal(play.prizes.length, 2);

const walkLeaves = await s.page.evaluate(() => {
  const T = roomTest, st = T.state(), ter = st.branchTerrain105, leafSet = new Set(Object.keys(ter.leaves)), z = ter.mirror105.zones;
  let start = null;
  for (let y = 0; y < z.length && !start; y++) for (let x = 0; x < z[y].length; x++) if (z[y][x] === 'p' && st.map[y][x] === T.TT.FLOOR) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (leafSet.has((x + dx) + ',' + (y + dy)) && !start) { let n = 0, cx = x + dx, cy = y + dy; while (leafSet.has(cx + ',' + cy)) { n++; cx += dx; cy += dy } if (n >= 4) start = { x, y } }
  const prizes = st.items.filter(i => i.premium), target = prizes[0];
  // BFS over leaves from the ledge
  const q = [[start.x, start.y]], prev = new Map([[start.x + ',' + start.y, null]]);
  while (q.length) { const [x, y] = q.shift(); if (x === target.x && y === target.y) break; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const key = (x + dx) + ',' + (y + dy); if (!prev.has(key) && leafSet.has(key)) { prev.set(key, x + ',' + y); q.push([x + dx, y + dy]) } } }
  const path = []; let cur = target.x + ',' + target.y; while (cur) { path.unshift(cur.split(',').map(Number)); cur = prev.get(cur) } 
  st.monsters = []; st.items = st.items.filter(i => i.premium); st.tutorialEntry60 = { completed: true }; st.playerAgencyTurns57 = 10;
  Object.assign(st.player, { x: start.x, y: start.y, hp: st.player.maxHp }); T.reset(); T.vis2();
  globalThis.__pavStart = start;
  const log = []; let prevPos = path[0];
  for (const [x, y] of path.slice(1)) { const r = T.move(x - prevPos[0], y - prevPos[1]); prevPos = [x, y]; log.push([x, y, T.state().player.x, T.state().player.y, T.state().floor]) }
  const after = T.state(), picked = after.player.inventory.filter(i => i.premium).length, other = after.items.filter(i => i.premium).length, before = 0;
  const here = after.map[after.player.y][after.player.x];
  return { steps: path.length - 1, atTarget: after.player.x === target.x && after.player.y === target.y, pos: [after.player.x, after.player.y, target.x, target.y], picked, gained: picked - before, others: other, hereTile: here, floor: after.floor, level: after.branchContext105?.level, hp: after.player.hp, last: log.at(-1) };
});
console.log('walk', JSON.stringify(walkLeaves));
assert.equal(walkLeaves.picked, 1, 'exactly one prize taken');
assert.equal(walkLeaves.others, 0, 'the other prize scattered');
assert.equal(walkLeaves.level, 3);

// inventory: passive martial arts add one slot each, the canal satchel adds 3, overflow is laid on the floor
const inv = await s.page.evaluate(() => {
  const T = roomTest, st = T.state(), p = st.player, r = {};
  st.monsters = []; p.martial = { ...p.martial, constitution: 0, brawl: 0 }; p.trinket = null; r.base = T.capacity();
  p.martial.constitution = 1; p.martial.brawl = 2; r.passive = [T.passive(), T.capacity()];
  p.trinket = { name: '수문지기의 접힌 행낭', type: 'trinket', branchEffect105: 'capacity' }; r.satchel = T.capacity();
  // an acquired form that makes an art passive counts: 귀영 becomes 흑운 (passive), level 3 adds a slot and a half
  p.martial.ghost = 3; p.martialForm = { ...(p.martialForm || {}), ghost: 'darkcloud' }; r.darkcloud = T.capacity(); p.martial.ghost = 0; p.martialForm.ghost = null;
  while (p.inventory.length < T.capacity()) p.inventory.push({ name: '주먹밥', type: 'food', foodKind: 'riceball', count: 1, stackMax: 1 });
  const floorBefore = st.items.length, lenBefore = p.inventory.length; p.trinket = null; p.martial.constitution = 0; T.wait(); T.wait();
  r.after = [p.inventory.length, T.capacity(), lenBefore - p.inventory.length];
  return r;
});
console.log('inventory', JSON.stringify(inv));
assert.equal(inv.base, 25); assert.deepEqual(inv.passive, [1, 26]); assert.equal(inv.satchel, 29); assert.equal(inv.darkcloud, 31);
assert.ok(inv.after[0] <= inv.after[1] && inv.after[2] >= 3, 'overflow dropped to the floor');
console.log('mirror-rooms: ok');
await browser.close(); process.exit(0);
