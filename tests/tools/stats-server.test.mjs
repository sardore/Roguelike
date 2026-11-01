// The play-statistics server (server/stats.gs, a Google Apps Script) run against an in-memory sheet:
// a run in progress is one row that is updated in place, the final record closes it, a finished row never changes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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
      getRange: (r, c, nr = 1, nc = 1) => ({
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => rows[r - 1 + i]?.[c - 1 + j] ?? '')),
        setValues: (values) => values.forEach((vals, i) => vals.forEach((v, j) => { rows[r - 1 + i][c - 1 + j] = v; })),
        getValue: () => rows[r - 1]?.[c - 1] ?? '',
        setValue: (v) => { rows[r - 1][c - 1] = v; },
        createTextFinder: (text) => ({
          matchEntireCell() { return this; },
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
    Date: FakeDate,
    console,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const post = (record) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify(record) } }).text);
  const get = (view) => JSON.parse(context.doGet({ parameter: { view } }).text);
  return { rows: sheets.get('deaths').rows, nicks: () => sheets.get('nicks')?.rows, clock, post, get };
}

const base = { v: 1, id: 'ABCD12-run1', floor: 3, level: 4, kills: 10, turns: 300, cls: 'archer' };
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

test('live progress appears in rankings but expired progress disappears from both rankings and deaths', () => {
  const s = server();
  claimed(s);
  s.post({ ...base, live: 1 });
  let row = s.get('ranking').boards.depth[0];
  assert.deepEqual([row.live, row.cause, row.cls, row.nick, row.tag], [true, '진행 중', 'archer', '만루왕', 'ABCD12']);
  s.clock.t += 16 * 60 * 1000;
  s.post({ v: 1, id: 'ZZZZ99-x', floor: 1, level: 1, kills: 0, turns: 5, cause: '취객' }); // invalidate cached views
  assert.ok(!s.get('ranking').boards.depth.some(r => r.tag === 'ABCD12'));
  assert.equal(s.get('summary').total, 1, 'only the real death is counted');
  assert.deepEqual(s.get('summary').causes, [['취객', 1]]);
});

test('a new run cancels only the abandoned live record; a previously finished death is preserved', () => {
  const s = server();
  const death = { ...base, id: 'ABCD12-dead', cause: '취객', floor: 2 };
  assert.deepEqual(s.post(death), { ok: true });
  s.post({ ...base, live: 1 });
  assert.equal(s.get('ranking').total, 2);
  assert.deepEqual(s.post({ ...base, abandon: 1 }), { ok: true });
  assert.equal(s.rows.find(r => r[1] === base.id)[3], '탐사 중단');
  assert.equal(s.get('ranking').total, 1);
  assert.equal(s.get('summary').total, 1);
  assert.deepEqual(s.get('summary').causes, [['취객', 1]]);
  assert.equal(s.rows.find(r => r[1] === death.id)[3], '취객');
  assert.deepEqual(s.post({ ...base, live: 1, turns: 999 }), { ok: true, duplicate: true });
  assert.equal(s.get('ranking').total, 1, 'late progress cannot resurrect a cancelled run');
  assert.deepEqual(s.post({ ...death, abandon: 1 }), { ok: true, duplicate: true });
  assert.equal(s.get('summary').total, 1, 'cancelling an already dead run changes nothing');
});

test('abandon arriving before progress creates an invisible tombstone', () => {
  const s = server();
  assert.deepEqual(s.post({ ...base, abandon: 1 }), { ok: true });
  assert.equal(s.get('ranking').total, 0);
  assert.equal(s.get('summary').total, 0);
  assert.deepEqual(s.post({ ...base, live: 1 }), { ok: true, duplicate: true });
  assert.equal(s.get('ranking').total, 0);
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
