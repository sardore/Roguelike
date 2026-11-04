// The ghost duel's arenas (src/game/duelarenas.js): small, mirror-symmetric, both starts and the door reachable, only known glyphs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'src/game/duelarenas.js'), 'utf8') + '\nthis.ARENAS = DUEL_ARENAS;', sandbox);
const ARENAS = sandbox.ARENAS;
// the glyphs of terrain.js (surfaces, props) plus the three marks
const GLYPHS = new Set([...'#+~:vl,schgIhmw', ...'TrPLSBtkbiCFWjanofe*=M', ...'ADB']);
const BLOCKS = new Set([...'#PLSiWFoftTrhmkC*janWe']);

test('there are at least eight arenas, each 21 x 21 at most', () => {
  assert.ok(ARENAS.length >= 8);
  for (const a of ARENAS) {
    assert.ok(a.rows.length <= 21 && a.rows.every((r) => r.length <= 21 && r.length === a.rows[0].length), a.name);
  }
});

test('every arena is a mirror image left to right, apart from the two starts', () => {
  for (const a of ARENAS) for (const r of a.rows) assert.equal(r.replace(/B/g, 'A'), [...r.replace(/B/g, 'A')].reverse().join(''), a.name);
});

test('only known glyphs; one door in the middle of the top wall; the starts are where spawns says', () => {
  for (const a of ARENAS) {
    const w = a.rows[0].length;
    for (const r of a.rows) for (const ch of r) assert.ok(GLYPHS.has(ch), a.name + ' ' + ch);
    assert.equal(JSON.stringify(a.door), JSON.stringify([(w - 1) / 2, 0]), a.name);
    assert.equal(a.rows[0][a.door[0]], 'D', a.name);
    assert.equal(a.rows.join('').split('D').length - 1, 1, a.name);
    assert.equal(a.rows[a.spawns.host[1]][a.spawns.host[0]], 'A', a.name);
    assert.equal(a.rows[a.spawns.guest[1]][a.spawns.guest[0]], 'B', a.name);
  }
});

test('the two starts and the cell below the door are connected, and the starts are far apart', () => {
  for (const a of ARENAS) {
    const [hx, hy] = a.spawns.host, [gx, gy] = a.spawns.guest, h = a.rows.length, w = a.rows[0].length;
    const dist = new Map([[hy * w + hx, 0]]), queue = [[hx, hy]];
    for (const [x, y] of queue) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, key = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || dist.has(key) || BLOCKS.has(a.rows[ny][nx])) continue;
      dist.set(key, dist.get(y * w + x) + 1); queue.push([nx, ny]);
    }
    assert.ok(dist.has(gy * w + gx), a.name + ' guest start unreachable');
    assert.ok(dist.has((a.door[1] + 1) * w + a.door[0]), a.name + ' door unreachable');
    assert.ok(dist.get(gy * w + gx) >= 12, a.name + ' starts too close');
  }
});
