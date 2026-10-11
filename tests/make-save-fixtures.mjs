// Writes tests/baseline/saves/*.json: localStorage written by the V40 build in four states
// (run in progress, after death, inside a branch, inside a legendary dungeon).
// Run once against the untouched V40 source:  node tests/make-save-fixtures.mjs <v40 src dir>
// The debug hash (#debug) is only used here, to reach the states quickly with V40's own API.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, openSession, startRun, dismissModals, storageDump, snapshot } from './harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, '..', 'src'));
const outDir = path.join(here, 'baseline', 'saves');
fs.mkdirSync(outDir, { recursive: true });

const browser = await launch();
const write = async (name, s, note) => {
  const dump = await storageDump(s);
  fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify({ note, storage: dump }, null, 1) + '\n');
  const env = JSON.parse((await snapshot(s)) || 'null');
  console.log(name, dump.length, 'keys', env ? `floor ${env.state.floor} hp ${env.state.player.hp} branch ${!!env.state.branchContext105} legend ${!!env.state.artifactDungeon46}` : 'no snapshot', JSON.stringify(s.errors));
};
const press = async (s, keys, ms = 260) => {
  for (const k of keys) {
    await s.page.keyboard.press(k);
    await s.tick(ms);
  }
};

try {
  // 1. Run in progress: a few floors down, items picked up, some turns played.
  {
    const s = await openSession(browser, root, { seed: 901, hash: 'debug' });
    await startRun(s, 'escort');
    await press(s, ['ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'g', 'ArrowLeft', ' ', 'ArrowUp']);
    await s.page.evaluate(() => window.__MANRU_DEBUG__.floor(4));
    await s.tick(2500);
    await dismissModals(s);
    await press(s, ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'r', 'g']);
    await s.page.evaluate(() => window.__MANRU_RELEASE__.save(1));
    await s.tick(500);
    await write('progress', s, 'escort on floor 4 after a few turns, autosave plus manual slot 1');
    await s.close();
  }
  // 2. Death: 1 HP, the next tile turned to lava, step on it.
  {
    const s = await openSession(browser, root, { seed: 902, hash: 'debug' });
    await startRun(s, 'archer');
    await press(s, ['ArrowRight', 'ArrowDown', 'r']);
    const key = await s.page.evaluate(() => {
      const st = window.__MANRU_DEBUG__.get();
      const p = st.player;
      st.player.hp = 1;
      for (const [dx, dy, k] of [[1, 0, 'ArrowRight'], [-1, 0, 'ArrowLeft'], [0, 1, 'ArrowDown'], [0, -1, 'ArrowUp']]) {
        const x = p.x + dx, y = p.y + dy;
        // 1 = floor, 54 = carpet; 19 = lava
        if ([1, 54].includes(st.map[y]?.[x]) && !st.monsters.some((m) => m.x === x && m.y === y)) { st.map[y][x] = 19; return k; }
      }
      return null;
    });
    if (!key) throw new Error('no free tile next to the player');
    await press(s, [key], 1500);
    await s.tick(3000);
    await write('dead', s, 'archer stepped into lava at 1 HP on floor 1 (death record, no active run)');
    await s.close();
  }
  // 3. Inside a branch: floor 2 canal entrance, stepped through.
  {
    const s = await openSession(browser, root, { seed: 903, hash: 'debug' });
    await startRun(s, 'swordsman');
    await s.page.evaluate(() => window.__MANRU_DEBUG__.floor(2));
    await s.tick(2500);
    await dismissModals(s);
    const step = await s.page.evaluate(() => {
      const st = window.__MANRU_DEBUG__.get();
      const p = (st.branchPortals105 || [])[0];
      if (!p) return null;
      for (const [dx, dy, key] of [[-1, 0, 'ArrowRight'], [1, 0, 'ArrowLeft'], [0, -1, 'ArrowDown'], [0, 1, 'ArrowUp']]) {
        const x = p.x + dx, y = p.y + dy;
        // 1 = floor, 54 = carpet: plain walkable tiles next to the entrance
        if ([1, 54].includes(st.map[y]?.[x]) && !st.monsters.some((m) => m.x === x && m.y === y)) {
          st.player.x = x; st.player.y = y;
          return key;
        }
      }
      return null;
    });
    if (!step) throw new Error('no branch portal on floor 2');
    await s.tick(400);
    await press(s, ['f'], 1500);
    await s.tick(2500);
    await dismissModals(s);
    await press(s, ['ArrowRight', 'ArrowDown', 'r']);
    await s.page.evaluate(() => window.__MANRU_RELEASE__.save(1));
    await s.tick(500);
    await write('branch', s, 'swordsman inside the floor 2 canal branch');
    await s.close();
  }
  // 4. Inside a legendary dungeon through its portal.
  {
    const s = await openSession(browser, root, { seed: 904, hash: 'debug' });
    await startRun(s, 'strongman');
    await s.page.evaluate(() => window.__MANRU_DEBUG__.floor(5));
    await s.tick(2500);
    await dismissModals(s);
    const id = await s.page.evaluate(() => {
      const api = globalThis.__MANRU_LEGEND47__;
      for (const def of api.defs()) if (def.id !== 'water_crossbow' && api.walkPortal(def.id)) return def.id;
      return null;
    });
    if (!id) throw new Error('no legendary portal could be opened');
    await s.tick(2500);
    await dismissModals(s);
    await press(s, ['ArrowRight', 'r']);
    await s.page.evaluate(() => window.__MANRU_RELEASE__.save(1));
    await s.tick(500);
    await write('legend', s, `strongman inside legendary dungeon ${id}`);
    await s.close();
  }
} finally {
  await browser.close();
}
