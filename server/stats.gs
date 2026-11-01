// 만루 플레이 통계 수집 서버 (Google Apps Script 웹 앱). 설치: docs/PLAY_STATS.md
// POST 본문 JSON {v,id,floor,cause,level,kills,turns,nick?,cls?,live?} -> 시트에 한 줄 (같은 id는 한 번만; 진행 중(live:1)인 판은 같은 줄을 갱신하고, 끝난 기록이 오면 그 줄을 최종값으로 닫는다). nick은 선택(한글·영문·숫자 2~8자), cls는 직업 id(선택)
// 클리어는 floor 25, cause 'End'로 오고, 랭킹에서는 30층으로 센다
// POST {claim,owner} -> 닉네임 등록(이미 다른 기기가 쓰면 error 'taken', 이 기기가 이미 다른 닉네임이 있으면 error 'owned'+nick). 기록의 닉네임은 보낸 값이 아니라 등록부에서 그 기기의 닉네임을 찾아 붙인다.
// GET ?view=summary -> {total,floors[25],causes[[이름,수]],avg{level,kills,turns},recent[]}
// GET ?view=ranking -> {total,boards:{depth[],level[],kills[]}} each the top RANK_ROWS rows {tag,nick,cls,live,floor,level,kills,turns,cause}; tag = first 6 characters of the run id; nick = the nickname sent with that run (empty for older runs)
const SHEET_NAME = 'deaths';
// Nicknames are claimed once, on their own sheet: nick (lower case, the key), nick as typed, owner (the player ID of the device), time.
const NICK_SHEET = 'nicks';
const HEADER = ['time', 'id', 'floor', 'cause', 'level', 'kills', 'turns', 'nick', 'cls', 'live'];
// A run still being played is one row that its player keeps updating (same id); its last update time sits in the `live` column and is cleared
// when the final record (death or clear) arrives. A run not updated for LIVE_TTL_MS is treated as given up.
const LIVE_CAUSE = '진행 중', GAVE_UP_CAUSE = '탐사 중단', LIVE_TTL_MS = 15 * 60 * 1000;
const MAX_ROWS = 200000;
const RANK_ROWS = 30;
const LIVE_COL = HEADER.indexOf('live') + 1;
// Whether a row's `live` stamp marks a run that is still being played.
function isLive_(stamp) { return Number(stamp) > 0 && Date.now() - Number(stamp) <= LIVE_TTL_MS; }
// A progress row nobody updates any more reads as given up.
function causeOf_(cause, stamp) { return String(cause) === LIVE_CAUSE && !isLive_(stamp) ? GAVE_UP_CAUSE : cause; }

// Works bound to a spreadsheet or as a stand-alone script: a stand-alone script creates its own spreadsheet once and remembers it.
function book_() {
  const bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;
  const props = PropertiesService.getScriptProperties(), id = props.getProperty('BOOK_ID');
  if (id) return SpreadsheetApp.openById(id);
  const created = SpreadsheetApp.create('만루 플레이 통계');
  props.setProperty('BOOK_ID', created.getId());
  return created;
}

function sheet_() {
  const book = book_();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = book.insertSheet(SHEET_NAME); sheet.appendRow(HEADER); }
  return sheet;
}

function nicks_() {
  const book = book_();
  let sheet = book.getSheetByName(NICK_SHEET);
  if (!sheet) { sheet = book.insertSheet(NICK_SHEET); sheet.appendRow(['key', 'nick', 'owner', 'time']); }
  return sheet;
}

// Hangul, letters and digits only, two to eight characters; '' for anything that does not fit.
function cleanNick_(text) {
  const nick = String(text || '').replace(/[^0-9A-Za-z가-힣]/g, '').slice(0, 8);
  return nick.length < 2 ? '' : nick;
}

// The nickname a device has claimed ('' if none). Call with the lock held or for reading only.
function nickOf_(owner) {
  const sheet = nicks_(), rows = sheet.getLastRow();
  if (rows < 2) return '';
  const found = sheet.getRange(2, 3, rows - 1, 1).createTextFinder(owner).matchEntireCell(true).findNext();
  return found ? String(sheet.getRange(found.getRow(), 2).getValue()) : '';
}

// One nickname for one device, and one device for one nickname (letter case does not count).
function claim_(record) {
  const nick = cleanNick_(record.claim), owner = String(record.owner || '');
  if (!nick || !/^[A-Z]{4}\d{2}$/.test(owner)) return reply_({ ok: false, error: 'fields' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = nicks_(), rows = sheet.getLastRow(), key = nick.toLowerCase();
    const same = rows > 1 ? sheet.getRange(2, 1, rows - 1, 1).createTextFinder(key).matchEntireCell(true).findNext() : null;
    if (same) return String(sheet.getRange(same.getRow(), 3).getValue()) === owner ? reply_({ ok: true, nick }) : reply_({ ok: false, error: 'taken' });
    const mine = nickOf_(owner);
    if (mine) return reply_({ ok: false, error: 'owned', nick: mine });
    sheet.appendRow([key, nick, owner, new Date().toISOString()]);
    CacheService.getScriptCache().removeAll(['summary', 'ranking']);
  } finally { lock.releaseLock(); }
  return reply_({ ok: true, nick });
}

function int_(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function reply_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let record;
  try { record = JSON.parse(e.postData.contents); } catch (error) { return reply_({ ok: false, error: 'json' }); }
  if (record.claim !== undefined) return claim_(record);
  const id = String(record.id || '').slice(0, 64);
  const floor = int_(record.floor, 1, 25), level = int_(record.level, 1, 99);
  const kills = int_(record.kills, 0, 100000), turns = int_(record.turns, 0, 10000000);
  if (record.v !== 1 || !id || floor === null || level === null || kills === null || turns === null) return reply_({ ok: false, error: 'fields' });
  // A leading = + - @ would run as a formula in the sheet.
  const cause = String(record.cause || '').slice(0, 40).replace(/^[=+\-@]/, "'$&");
  const owner = id.replace(/[^0-9a-z]/gi, '').slice(0, 6).toUpperCase();
  const cls = /^[a-z][a-z0-9_]{0,23}$/.test(String(record.cls || '')) ? String(record.cls) : '';
  const live = record.live === 1;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_(), rows = sheet.getLastRow();
    const nick = nickOf_(owner); // the nickname this device has claimed, whatever the record says
    const found = rows > 1 ? sheet.getRange(2, 2, rows - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
    if (found) {
      // A finished run never changes again (a late progress update or a resent record is dropped); a run in progress is updated in place.
      const row = found.getRow();
      if (!sheet.getRange(row, LIVE_COL).getValue()) return reply_({ ok: true, duplicate: true });
      sheet.getRange(row, 3, 1, 7).setValues([[floor, live ? LIVE_CAUSE : cause, level, kills, turns, nick, cls]]);
      sheet.getRange(row, LIVE_COL).setValue(live ? Date.now() : '');
    } else {
      if (rows >= MAX_ROWS) return reply_({ ok: false, error: 'full' });
      sheet.appendRow([new Date().toISOString(), id, floor, live ? LIVE_CAUSE : cause, level, kills, turns, nick, cls, live ? Date.now() : '']);
    }
    CacheService.getScriptCache().removeAll(['summary', 'ranking']);
  } finally { lock.releaseLock(); }
  return reply_({ ok: true });
}

// Each board orders by its own number first, then by how far the run got.
const BOARDS = {
  depth: (a, b) => b.floor - a.floor || b.level - a.level || b.kills - a.kills || a.turns - b.turns,
  level: (a, b) => b.level - a.level || b.floor - a.floor || b.kills - a.kills || a.turns - b.turns,
  kills: (a, b) => b.kills - a.kills || b.floor - a.floor || b.level - a.level || a.turns - b.turns,
};

function ranking_() {
  const cache = CacheService.getScriptCache(), hit = cache.get('ranking');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  const sheet = sheet_(), rows = sheet.getLastRow();
  const values = rows > 1 ? sheet.getRange(2, 1, rows - 1, HEADER.length).getValues() : [];
  const runs = values.map(([, id, floor, cause, level, kills, turns, nick, cls, stamp]) => ({
    tag: String(id).replace(/[^0-9a-z]/gi, '').slice(0, 6).toUpperCase(), nick: String(nick || ''), cls: String(cls || ''), live: isLive_(stamp),
    floor: String(cause) === 'End' ? 30 : floor, cause: causeOf_(cause, stamp), level, kills, turns,
  }));
  const boards = {};
  for (const name of Object.keys(BOARDS)) boards[name] = runs.slice().sort(BOARDS[name]).slice(0, RANK_ROWS);
  const ranking = JSON.stringify({ ok: true, total: runs.length, boards });
  cache.put('ranking', ranking, 60);
  return ContentService.createTextOutput(ranking).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.view === 'ranking') return ranking_();
  if (!e || !e.parameter || e.parameter.view !== 'summary') return reply_({ ok: false, error: 'view' });
  const cache = CacheService.getScriptCache(), hit = cache.get('summary');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  const sheet = sheet_(), rows = sheet.getLastRow();
  const values = rows > 1 ? sheet.getRange(2, 1, rows - 1, HEADER.length).getValues() : [];
  const floors = new Array(25).fill(0), causes = {};
  let level = 0, kills = 0, turns = 0;
  // Runs still being played are not counted yet.
  const ended = values.filter(row => !isLive_(row[9])).map(row => [row[0], row[1], row[2], causeOf_(row[3], row[9]), row[4], row[5], row[6]]);
  for (const [, , floor, cause, lv, kl, tn] of ended) {
    floors[floor - 1]++; causes[cause] = (causes[cause] || 0) + 1; level += lv; kills += kl; turns += tn;
  }
  const n = ended.length || 1;
  const summary = JSON.stringify({
    ok: true, total: ended.length, floors,
    causes: Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 40),
    avg: { level: Math.round(level / n * 10) / 10, kills: Math.round(kills / n), turns: Math.round(turns / n) },
    recent: ended.slice(-50).reverse().map(([t, , floor, cause, lv, kl, tn]) => ({ t, floor, cause, level: lv, kills: kl, turns: tn })),
  });
  cache.put('summary', summary, 60);
  return ContentService.createTextOutput(summary).setMimeType(ContentService.MimeType.JSON);
}
