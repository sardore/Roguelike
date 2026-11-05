// The play-statistics server (server/stats.gs, a Google Apps Script) run against an in-memory sheet:
// a run in progress is one row that is updated in place, the final record closes it, a finished row never changes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'server', 'stats.gs'), 'utf8');

function server() {
  const clock = { t: Date.UTC(2026, 9, 31, 12, 0, 0) };
  const cache = new Map();
  const sheets = new Map();
  const makeSheet = (header) => {
    const rows = header.length ? [header] : [];
    return {
      rows,
      appendRow: (row) => { rows.push([...row]); },
      getLastRow: () => rows.length,
      getMaxColumns: () => Math.max(26, ...rows.map((r) => r.length)),
      insertColumnsAfter: () => {},
      getRange: (r, c, nr = 1, nc = 1) => ({
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => rows[r - 1 + i]?.[c - 1 + j] ?? '')),
        setValues: (values) => values.forEach((vals, i) => vals.forEach((v, j) => { rows[r - 1 + i][c - 1 + j] = v; })),
        getValue: () => rows[r - 1]?.[c - 1] ?? '',
        setValue: (v) => { rows[r - 1][c - 1] = v; },
        createTextFinder: (text) => ({
          matchEntireCell() { return this; },
          findAll() { const hits = []; for (let i = 0; i < nr; i++) if (String(rows[r - 1 + i]?.[c - 1]).toLowerCase() === String(text).toLowerCase()) hits.push({ getRow: () => r + i }); return hits; },
          findNext() { for (let i = 0; i < nr; i++) if (String(rows[r - 1 + i]?.[c - 1]).toLowerCase() === String(text).toLowerCase()) return { getRow: () => r + i }; return null; },
        }),
      }),
    };
  };
  sheets.set('deaths', makeSheet(['time', 'id', 'floor', 'cause', 'level', 'kills', 'turns', 'nick', 'cls', 'live']));
  const book = { getSheetByName: (name) => sheets.get(name) ?? null, insertSheet: (name) => { const sheet = makeSheet([]); sheets.set(name, sheet); return sheet; } };
  class FakeDate extends Date { static now() { return clock.t; } }
  const out = (text) => ({ text, setMimeType() { return this; } });
  const context = {
    SpreadsheetApp: { getActiveSpreadsheet: () => book },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v), removeAll: (keys) => keys.forEach((k) => cache.delete(k)) }) },
    ContentService: { createTextOutput: out, MimeType: { JSON: 'json' } },
    Utilities: { computeDigest: (algo, text) => [...crypto.createHash('sha256').update(String(text)).digest()].map((b) => (b > 127 ? b - 256 : b)), DigestAlgorithm: { SHA_256: 'sha256' } },
    Date: FakeDate,
    console,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const post = (record) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify(record) } }).text);
  const get = (view, extra = {}) => JSON.parse(context.doGet({ parameter: { view, ...extra } }).text);
  return { rows: sheets.get('deaths').rows, ghosts: () => sheets.get('ghosts')?.rows, ids: () => sheets.get('ids')?.rows ?? [], nicks: () => sheets.get('nicks')?.rows, clock, post, get };
}

const base = { v: 1, id: 'ABCD12-run1', floor: 3, level: 4, kills: 10, turns: 300, cls: 'archer' };
const KEY_A = 'a'.repeat(32), KEY_B = 'b'.repeat(32);
const claimed = (s) => s.post({ claim: '만루왕', owner: 'ABCD12' });

test('a run in progress is one row that is updated in place', () => {
  const s = server();
  claimed(s);
  assert.deepEqual(s.post({ ...base, live: 1 }), { ok: true });
  assert.deepEqual(s.post({ ...base, floor: 4, level: 5, kills: 22, turns: 700, live: 1 }), { ok: true });
  assert.equal(s.rows.length, 2, 'the same id is not added twice');
  const [, id, floor, cause, level, kills, turns, nick, cls, stamp] = s.rows[1];
  assert.deepEqual([id, floor, cause, level, kills, turns, nick, cls], ['ABCD12-run1', 4, '진행 중', 5, 22, 700, '만루왕', 'archer']);
  assert.ok(Number(stamp) > 0);
});

test('the ranking marks a run in progress and a run nobody updates reads as given up', () => {
  const s = server();
  claimed(s);
  s.post({ ...base, live: 1 });
  let row = s.get('ranking').boards.depth[0];
  assert.deepEqual([row.live, row.cause, row.cls, row.nick, row.tag], [true, '진행 중', 'archer', '만루왕', 'ABCD12']);
  s.clock.t += 16 * 60 * 1000;
  s.post({ v: 1, id: 'ZZZZ99-x', floor: 1, level: 1, kills: 0, turns: 5, cause: '취객' }); // drops the cached ranking
  row = s.get('ranking').boards.depth.find((r) => r.tag === 'ABCD12');
  assert.deepEqual([row.live, row.cause], [false, '탐사 중단']);
});

test('the final record closes the row, and a later progress update changes nothing', () => {
  const s = server();
  s.post({ ...base, live: 1 });
  assert.deepEqual(s.post({ ...base, floor: 25, level: 18, kills: 400, turns: 9000, cause: 'End' }), { ok: true });
  assert.equal(s.rows.length, 2);
  assert.deepEqual([s.rows[1][2], s.rows[1][3], s.rows[1][9]], [25, 'End', '']);
  assert.deepEqual(s.post({ ...base, floor: 9, live: 1 }), { ok: true, duplicate: true });
  assert.deepEqual(s.post({ ...base, floor: 9, cause: '함정' }), { ok: true, duplicate: true });
  assert.equal(s.rows[1][2], 25, 'a finished row never changes');
  const row = s.get('ranking').boards.depth[0];
  assert.deepEqual([row.floor, row.live, row.cause], [30, false, 'End']);
});

test('the summary counts finished runs only', () => {
  const s = server();
  s.post({ ...base, live: 1 });
  s.post({ v: 1, id: 'QQQQ11-a', floor: 2, level: 2, kills: 3, turns: 90, cause: '취객' });
  const summary = s.get('summary');
  assert.equal(summary.total, 1);
  assert.deepEqual(summary.causes, [['취객', 1]]);
  s.post({ ...base, floor: 3, cause: '굶주림' });
  assert.equal(s.get('summary').total, 2);
});

test('a nickname is claimed once: another device is refused (letter case does not count), the same device may ask again, a device keeps one', () => {
  const s = server();
  assert.deepEqual(s.post({ claim: '만루왕', owner: 'ABCD12' }), { ok: true, nick: '만루왕' });
  assert.deepEqual(s.post({ claim: '만루왕', owner: 'ABCD12' }), { ok: true, nick: '만루왕' });
  assert.deepEqual(s.post({ claim: '만루왕', owner: 'ZZZZ99' }), { ok: false, error: 'taken' });
  assert.deepEqual(s.post({ claim: 'Hero', owner: 'QQQQ11' }), { ok: true, nick: 'Hero' });
  assert.deepEqual(s.post({ claim: 'hERO', owner: 'WWWW22' }), { ok: false, error: 'taken' });
  assert.deepEqual(s.post({ claim: '다른이름', owner: 'ABCD12' }), { ok: false, error: 'owned', nick: '만루왕' });
  assert.deepEqual(s.post({ claim: 'a', owner: 'ABCD12' }), { ok: false, error: 'fields' });
  assert.deepEqual(s.post({ claim: '이름', owner: 'abcd12' }), { ok: false, error: 'fields' });
  assert.equal(s.nicks().length, 3, 'header and two claims');
});

test('a record carries the nickname its device has claimed, not the one it says', () => {
  const s = server();
  s.post({ ...base, nick: '훔친이름', cause: '함정' }); // no claim yet
  claimed(s);
  s.post({ ...base, id: 'ABCD12-run2', nick: '훔친이름', cause: '함정' });
  s.post({ ...base, id: 'ZZZZ99-run1', nick: '만루왕', cause: '함정' }); // another device cannot borrow it
  const byTag = Object.fromEntries(s.get('ranking').boards.depth.map((r) => [r.tag + r.nick, r]));
  assert.ok(byTag['ABCD12만루왕'], 'the claimed nickname is on the later record of its device');
  assert.ok(byTag['ABCD12'], 'a record from before the claim has none');
  assert.ok(byTag['ZZZZ99'], 'a device that did not claim it shows its player ID');
});

// A ghost (the dead character, docs/GHOSTS.md) is kept only for a run that reached the depth ranking: with the board full, a shallow death makes none and
// a death that takes a place among them does.
test('a ghost is made only by a run that reached the depth ranking', () => {
  const s = server();
  for (let i = 0; i < 30; i++) s.post({ v: 1, id: `FILL${String(i).padStart(2, '0')}-r`, floor: 25, level: 18, kills: 100 + i, turns: 500, cause: '함정' });
  const body = JSON.stringify({ cls: 'archer' });
  s.post({ ...base, id: 'ABCD12-shallow', floor: 3, cause: '함정', ghost: body, key: KEY_A });
  assert.equal(s.ghosts()?.length ?? 1, 1, 'a death outside the first thirty places leaves no ghost');
  s.post({ ...base, id: 'ABCD12-deep', floor: 25, level: 99, cause: '함정', ghost: body, key: KEY_A });
  assert.equal(s.ghosts().length, 2, 'a death within them does');
  assert.equal(s.ghosts()[1][1], 'ABCD12-deep');
});

// ---- stakes (docs/GHOST_STAKES.md) ----------------------------------------------------------------------------------------
const item = (name) => ({ name, type: 'potion' });
const dead = (s, owner, key, run, items = [], extra = {}) => {
  const body = JSON.stringify({ cls: 'archer', maxHp: 40, inventory: items, weapon: { name: `${run}검`, type: 'weapon' }, ...extra });
  s.post({ v: 1, id: `${owner}-${run}`, floor: 25, level: 99, kills: 9000, turns: 100, cause: '함정', ghost: body, key });
  return `${owner}-${run}`;
};
const lock = (s, owner, key, ghost, duel) => s.post({ ghostLock: { owner, key, ghost, duel } });
const settle = (s, owner, key, ghost, duel, won) => s.post({ ghostSettle: { owner, key, ghost, duel, won } });
const statusOf = (s, id) => s.ghosts().find((row) => row[1] === id)[8];

test('the secret of a device owns its player ID: the others get nothing', () => {
  const s = server();
  const id = dead(s, 'ABCD12', KEY_A, 'r1');
  assert.equal(s.get('ghosts', { owner: 'ABCD12', key: KEY_A }).list.length, 1);
  assert.deepEqual(s.get('ghosts', { owner: 'ABCD12', key: KEY_B }), { ok: false, error: 'auth' }, 'another secret is refused');
  assert.deepEqual(s.get('ghosts', { owner: 'ABCD12' }), { ok: false, error: 'auth' }, 'no secret is refused');
  assert.equal(s.get('ghost', { owner: 'ABCD12', id, key: KEY_A }).ok, true);
  assert.equal(s.get('ghost', { owner: 'ABCD12', id, key: KEY_B }).ok, false);
  const before = s.ghosts().length;
  dead(s, 'ABCD12', KEY_B, 'forged');
  assert.equal(s.ghosts().length, before, 'a ghost uploaded with the wrong secret is not kept');
  assert.equal(s.ids().some((row) => row.includes(KEY_A)), false, 'only the hash is kept');
});

test('a ghost is locked to one duel; a second duel is refused until the lock runs out', () => {
  const s = server();
  const a = dead(s, 'ABCD12', KEY_A, 'r1'), b = dead(s, 'WXYZ34', KEY_B, 'r1');
  assert.equal(lock(s, 'ABCD12', KEY_A, a, 'duel1').ok, true);
  assert.equal(lock(s, 'ABCD12', KEY_A, a, 'duel1').ok, true, 'the same duel may ask again');
  assert.deepEqual(lock(s, 'ABCD12', KEY_A, a, 'duel2'), { ok: false, error: 'busy' });
  assert.deepEqual(lock(s, 'WXYZ34', KEY_A, b, 'duel1'), { ok: false, error: 'auth' });
  assert.deepEqual(lock(s, 'WXYZ34', KEY_B, a, 'duel1'), { ok: false, error: 'none' }, 'not the ghost of this player');
  assert.equal(statusOf(s, a), 'locked');
  assert.equal(s.get('ghosts', { owner: 'ABCD12', key: KEY_A }).list[0].status, 'locked');
  s.clock.t += 31 * 60 * 1000;
  assert.equal(s.get('ghosts', { owner: 'ABCD12', key: KEY_A }).list[0].status, 'alive', 'the lock runs out');
  assert.equal(lock(s, 'ABCD12', KEY_A, a, 'duel2').ok, true);
  assert.equal(lock(s, 'WXYZ34', KEY_B, b, 'duel2').ok, true);
  const c = dead(s, 'QQQQ11', 'c'.repeat(32), 'r1');
  assert.deepEqual(lock(s, 'QQQQ11', 'c'.repeat(32), c, 'duel2'), { ok: false, error: 'duel' }, 'a duel has two ghosts');
});

test('opposite words settle: the loser is taken and the winner gets its things, once', () => {
  const s = server();
  const a = dead(s, 'ABCD12', KEY_A, 'r1', [item('물약'), item('부적')]), b = dead(s, 'WXYZ34', KEY_B, 'r1', [item('열쇠')]);
  lock(s, 'ABCD12', KEY_A, a, 'd'); lock(s, 'WXYZ34', KEY_B, b, 'd');
  assert.deepEqual(settle(s, 'ABCD12', KEY_A, a, 'd', true), { ok: true, state: 'pending' });
  assert.deepEqual(settle(s, 'WXYZ34', KEY_B, b, 'd', false), { ok: true, state: 'lost' });
  assert.deepEqual(settle(s, 'ABCD12', KEY_A, a, 'd', true), { ok: true, state: 'won' }, 'asking again gives the same answer');
  assert.deepEqual([statusOf(s, a), statusOf(s, b)], ['alive', 'taken']);
  const first = s.post({ lootClaim: { owner: 'ABCD12', key: KEY_A } });
  assert.deepEqual(first.items.map((i) => i.name), ['열쇠', 'r1검'], 'the bag and what it wore');
  assert.deepEqual(s.post({ lootClaim: { owner: 'ABCD12', key: KEY_A } }).items, [], 'handed out once');
  assert.deepEqual(s.post({ lootClaim: { owner: 'ABCD12', key: KEY_B } }), { ok: false, error: 'auth' });
  assert.deepEqual(lock(s, 'WXYZ34', KEY_B, b, 'd2'), { ok: false, error: 'none' }, 'a taken ghost cannot fight again');
});

test('the same word from both voids the duel and nobody loses anything', () => {
  const s = server();
  const a = dead(s, 'ABCD12', KEY_A, 'r1', [item('물약')]), b = dead(s, 'WXYZ34', KEY_B, 'r1');
  lock(s, 'ABCD12', KEY_A, a, 'd'); lock(s, 'WXYZ34', KEY_B, b, 'd');
  settle(s, 'ABCD12', KEY_A, a, 'd', true);
  assert.equal(settle(s, 'WXYZ34', KEY_B, b, 'd', true).state, 'void');
  assert.equal(settle(s, 'ABCD12', KEY_A, a, 'd', true).state, 'void');
  assert.deepEqual([statusOf(s, a), statusOf(s, b)], ['alive', 'alive']);
  assert.deepEqual(s.post({ lootClaim: { owner: 'ABCD12', key: KEY_A } }).items, []);
  assert.deepEqual(s.post({ lootClaim: { owner: 'WXYZ34', key: KEY_B } }).items, []);
});

test('a side that never answers loses after ten minutes', () => {
  const s = server();
  const a = dead(s, 'ABCD12', KEY_A, 'r1'), b = dead(s, 'WXYZ34', KEY_B, 'r1', [item('물약')]);
  lock(s, 'ABCD12', KEY_A, a, 'd'); lock(s, 'WXYZ34', KEY_B, b, 'd');
  settle(s, 'ABCD12', KEY_A, a, 'd', true);
  s.clock.t += 9 * 60 * 1000;
  assert.equal(settle(s, 'ABCD12', KEY_A, a, 'd', true).state, 'pending');
  s.clock.t += 2 * 60 * 1000;
  assert.equal(settle(s, 'ABCD12', KEY_A, a, 'd', true).state, 'won');
  assert.equal(statusOf(s, b), 'taken');
  assert.equal(settle(s, 'WXYZ34', KEY_B, b, 'd', true).state, 'lost', 'a late word changes nothing');
});

test('the loot comes twelve things at a time', () => {
  const s = server();
  const many = Array.from({ length: 20 }, (_, i) => item(`물약${i}`));
  const a = dead(s, 'ABCD12', KEY_A, 'r1'), b = dead(s, 'WXYZ34', KEY_B, 'r1', many);
  lock(s, 'ABCD12', KEY_A, a, 'd'); lock(s, 'WXYZ34', KEY_B, b, 'd');
  settle(s, 'ABCD12', KEY_A, a, 'd', true); settle(s, 'WXYZ34', KEY_B, b, 'd', false);
  const one = s.post({ lootClaim: { owner: 'ABCD12', key: KEY_A } }).items, two = s.post({ lootClaim: { owner: 'ABCD12', key: KEY_A } }).items;
  assert.deepEqual([one.length, two.length], [12, 9], '21 things: 20 in the bag and the weapon');
  assert.deepEqual(s.post({ lootClaim: { owner: 'ABCD12', key: KEY_A } }).items, []);
});

test('a duel that never began gives the lock back', () => {
  const s = server();
  const a = dead(s, 'ABCD12', KEY_A, 'r1'), b = dead(s, 'WXYZ34', KEY_B, 'r1');
  lock(s, 'ABCD12', KEY_A, a, 'd');
  assert.deepEqual(s.post({ ghostRelease: { owner: 'ABCD12', key: KEY_A, ghost: a, duel: 'd' } }), { ok: true });
  assert.equal(statusOf(s, a), 'alive');
  assert.equal(lock(s, 'ABCD12', KEY_A, a, 'e').ok, true, 'free for another duel');
  lock(s, 'WXYZ34', KEY_B, b, 'e');
  settle(s, 'ABCD12', KEY_A, a, 'e', true);
  assert.deepEqual(s.post({ ghostRelease: { owner: 'WXYZ34', key: KEY_B, ghost: b, duel: 'e' } }), { ok: false, error: 'begun' }, 'once someone has spoken it cannot be taken back');
});
