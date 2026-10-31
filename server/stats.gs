// 만루 플레이 통계 수집 서버 (Google Apps Script 웹 앱). 설치: docs/PLAY_STATS.md
// POST 본문 JSON {v,id,floor,cause,level,kills,turns,nick?} -> 시트에 한 줄 (같은 id는 한 번만). nick은 선택(한글·영문·숫자 2~8자)
// GET ?view=summary -> {total,floors[25],causes[[이름,수]],avg{level,kills,turns},recent[]}
// GET ?view=ranking -> {total,boards:{depth[],level[],kills[]}} each the top RANK_ROWS rows {tag,nick,floor,level,kills,turns,cause}; tag = first 6 characters of the run id; nick = the nickname sent with that run (empty for older runs)
const SHEET_NAME = 'deaths';
const HEADER = ['time', 'id', 'floor', 'cause', 'level', 'kills', 'turns', 'nick'];
const MAX_ROWS = 200000;
const RANK_ROWS = 30;

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
  const id = String(record.id || '').slice(0, 64);
  const floor = int_(record.floor, 1, 25), level = int_(record.level, 1, 99);
  const kills = int_(record.kills, 0, 100000), turns = int_(record.turns, 0, 10000000);
  if (record.v !== 1 || !id || floor === null || level === null || kills === null || turns === null) return reply_({ ok: false, error: 'fields' });
  // A leading = + - @ would run as a formula in the sheet.
  const cause = String(record.cause || '').slice(0, 40).replace(/^[=+\-@]/, "'$&");
  // Hangul, letters and digits only, two to eight characters: anything else is dropped, a nickname that is too short is ignored.
  let nick = String(record.nick || '').replace(/[^0-9A-Za-z가-힣]/g, '').slice(0, 8);
  if (nick.length < 2) nick = '';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_(), rows = sheet.getLastRow();
    if (rows >= MAX_ROWS) return reply_({ ok: false, error: 'full' });
    if (rows > 1 && sheet.getRange(2, 2, rows - 1, 1).createTextFinder(id).matchEntireCell(true).findNext()) return reply_({ ok: true, duplicate: true });
    sheet.appendRow([new Date().toISOString(), id, floor, cause, level, kills, turns, nick]);
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
  const runs = values.map(([, id, floor, cause, level, kills, turns, nick]) => ({
    tag: String(id).replace(/[^0-9a-z]/gi, '').slice(0, 6).toUpperCase(), nick: String(nick || ''), floor, cause, level, kills, turns,
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
  for (const [, , floor, cause, lv, kl, tn] of values) {
    floors[floor - 1]++; causes[cause] = (causes[cause] || 0) + 1; level += lv; kills += kl; turns += tn;
  }
  const n = values.length || 1;
  const summary = JSON.stringify({
    ok: true, total: values.length, floors,
    causes: Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 40),
    avg: { level: Math.round(level / n * 10) / 10, kills: Math.round(kills / n), turns: Math.round(turns / n) },
    recent: values.slice(-50).reverse().map(([t, , floor, cause, lv, kl, tn]) => ({ t, floor, cause, level: lv, kills: kl, turns: tn })),
  });
  cache.put('summary', summary, 60);
  return ContentService.createTextOutput(summary).setMimeType(ContentService.MimeType.JSON);
}
