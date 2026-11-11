// 만루 플레이 통계 수집 서버 (Google Apps Script 웹 앱). 설치: docs/PLAY_STATS.md
// POST 본문 JSON {v,id,floor,cause,level,kills,turns,nick?,cls?,live?} -> 시트에 한 줄 (같은 id는 한 번만; 진행 중(live:1)인 판은 같은 줄을 갱신하고, 끝난 기록이 오면 그 줄을 최종값으로 닫는다). nick은 선택(한글·영문·숫자 2~8자), cls는 직업 id(선택)
// 클리어는 floor 25, cause 'End'로 오고, 랭킹에서는 30층으로 센다
// POST {claim,owner} -> 닉네임 등록(이미 다른 기기가 쓰면 error 'taken', 이 기기가 이미 다른 닉네임이 있으면 error 'owned'+nick). 기록의 닉네임은 보낸 값이 아니라 등록부에서 그 기기의 닉네임을 찾아 붙인다.
// POST body may also carry `ghost` (a JSON string of the dead character, at most GHOST_MAX characters) on a final death record: stored on the `ghosts` sheet, one row per run id, and only when the run reached the depth ranking (its place on the depth board is within RANK_ROWS).
// GET ?view=ghosts&owner=AAAA00 -> {ok,list:[{id,t,cls,floor,level,cause,status}]} the ghosts of one player ID, newest first; GET ?view=ghost&owner=AAAA00&id=... -> {ok,body} only for the owner.
// Stakes (docs/GHOST_STAKES.md): a device proves it owns a player ID with a secret (`key`, 32 letters/digits made on the device); the server keeps only its SHA-256 on the `ids` sheet, the first device to show an ID owns it.
// Everything about ghosts needs owner + key: GET ?view=ghosts|ghost take &key=...; a `ghost` on a death record is kept only with a right `key`.
// POST {ghostLock:{owner,key,ghost,duel}} -> {ok:true} when the ghost was alive (or its lock ran out), else {ok:false,error:'busy'|'none'|'auth'|'duel'}; both ghosts of a duel lock with the same duel id.
// POST {ghostRelease:{owner,key,ghost,duel}} -> {ok:true}: the duel never began (nobody has spoken in it), so the ghost is free again and the duel is void.
// POST {ghostScore:{owner,key,ghost,score,peak}} -> {ok:true}: the owner's current and best score of a ghost, shown on the ghost board (and in `list` of the owner's ghosts).
// POST {ghostSettle:{owner,key,ghost,duel,won}} -> {ok:true,state:'pending'|'won'|'lost'|'void'}: the result stands when the two sides say opposite things (the loser's ghost is taken, its things become a row of the winner on the `loot` sheet),
//   the same thing from both voids the duel (both ghosts alive again), and when only one side has spoken for SETTLE_MS its word stands. Asking again gives the same answer.
// POST {lootClaim:{owner,key}} -> {ok:true,items:[...]} at most LOOT_PER_CLAIM things of the pending loot of that player ID, each handed out once.
// GET ?view=summary -> {total,floors[25],causes[[이름,수]],avg{level,kills,turns},recent[]}
// GET ?view=ranking -> {total,boards:{depth[],level[],kills[],ghost[]}} (ghost: the runs of the ghosts that still stand, by the score a win over them gives (floor + 1), same rows as the others) each the top RANK_ROWS rows {tag,nick,cls,live,floor,level,kills,turns,cause}; tag = first 6 characters of the run id; nick = the nickname sent with that run (empty for older runs)
const SHEET_NAME = 'deaths';
// Nicknames are claimed once, on their own sheet: nick (lower case, the key), nick as typed, owner (the player ID of the device), time.
const NICK_SHEET = 'nicks';
// Ghosts: the dead character of a run (the player object as JSON) kept for the owner (player ID), and later for others to fight. status is 'alive' until a fight takes it.
const GHOST_SHEET = 'ghosts';
const GHOST_PART_HEADERS = Array.from({ length: 9 }, (_, i) => 'body_part_' + (i + 2));
const GHOST_HEADER = ['time', 'id', 'owner', 'nick', 'cls', 'floor', 'level', 'cause', 'status', 'body', 'lock', 'lockTime', 'score', 'peak', 'wins', 'losses', ...GHOST_PART_HEADERS];
const BODY_COL = GHOST_HEADER.indexOf('body') + 1, LOCK_COL = GHOST_HEADER.indexOf('lock') + 1;
const GHOST_PART_COL = GHOST_HEADER.indexOf(GHOST_PART_HEADERS[0]) + 1;
// Stakes: ids (player ID -> hash of its device secret), duels (one row per duel id), loot (what a winner has coming).
const ID_SHEET = 'ids', DUEL_SHEET = 'duels', LOOT_SHEET = 'loot';
const DUEL_HEADER = ['id', 'time', 'ghostA', 'ownerA', 'ghostB', 'ownerB', 'claimA', 'claimB', 'timeA', 'timeB', 'state', 'winner'];
const LOOT_HEADER = ['time', 'owner', 'duel', 'ghost', 'items', 'status', ...GHOST_PART_HEADERS];
const LOCK_MS = 30 * 60 * 1000, SETTLE_MS = 10 * 60 * 1000, LOOT_PER_CLAIM = 12;
const LEGACY_BODY_MAX = 45000, BODY_PART_SIZE = 46000;
const GHOST_MAX = 450000, GHOST_ROWS = 20000, GHOSTS_PER_OWNER = 200, GHOST_LIST = 100;
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

function ghosts_() {
  const book = book_();
  let sheet = book.getSheetByName(GHOST_SHEET);
  if (!sheet) { sheet = book.insertSheet(GHOST_SHEET); sheet.appendRow(GHOST_HEADER); }
  // a sheet made before the lock columns existed gets them
  if (sheet.getMaxColumns() < GHOST_HEADER.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), GHOST_HEADER.length - sheet.getMaxColumns());
  if (String(sheet.getRange(1, GHOST_HEADER.length).getValue()) !== GHOST_HEADER[GHOST_HEADER.length - 1]) sheet.getRange(1, 1, 1, GHOST_HEADER.length).setValues([GHOST_HEADER]);
  return sheet;
}

function sheetOf_(name, header) {
  const book = book_();
  let sheet = book.getSheetByName(name);
  if (!sheet) { sheet = book.insertSheet(name); sheet.appendRow(header); }
  return sheet;
}

function hash_(secret) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, secret).map(b => ((b & 255) + 256).toString(16).slice(1)).join('');
}

// Whether the caller owns the player ID: its secret hashes to the one on the `ids` sheet. An ID nobody has shown yet belongs to the first device that does.
function authed_(owner, key) {
  if (!/^[A-Z]{4}\d{2}$/.test(owner) || !/^[0-9A-Za-z]{32}$/.test(key)) return false;
  const sheet = sheetOf_(ID_SHEET, ['owner', 'hash', 'time']), hash = hash_(key);
  const find = () => { const rows = sheet.getLastRow(); return rows > 1 ? sheet.getRange(2, 1, rows - 1, 1).createTextFinder(owner).matchEntireCell(true).findNext() : null; };
  let found = find();
  if (!found) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try { found = find(); if (!found) { sheet.appendRow([owner, hash, new Date().toISOString()]); return true; } } finally { lock.releaseLock(); }
  }
  return String(sheet.getRange(found.getRow(), 2).getValue()) === hash;
}

// A ghost is made only by a run that reached the depth ranking: its place on the depth board (the one the game shows, RANK_ROWS rows, runs in progress
// counted as the board counts them) is within RANK_ROWS. Called after the run's own row is written, with the lock held.
function depthRanked_(id) {
  const sheet = sheet_(), rows = sheet.getLastRow();
  if (rows <= 1) return false;
  const runs = sheet.getRange(2, 1, rows - 1, HEADER.length).getValues().map(([, rid, floor, cause, level, kills, turns]) => ({
    id: String(rid), floor: String(cause) === 'End' ? 30 : floor, level, kills, turns,
  }));
  return runs.sort(BOARDS.depth).slice(0, RANK_ROWS).some((run) => run.id === id);
}

// Long JSON uses prefixed chunks so Sheets cannot interpret any slice as a formula or a number.
function jsonCells_(body) {
  if (body.length <= LEGACY_BODY_MAX) return ["'" + body];
  const cells = [];
  for (let start = 0; start < body.length;) {
    let end = Math.min(body.length, start + BODY_PART_SIZE);
    const last = body.charCodeAt(end - 1);
    if (end < body.length && last >= 0xD800 && last <= 0xDBFF) end--;
    cells.push('~' + body.slice(start, end));
    start = end;
  }
  return cells;
}

function readJsonCells_(row, bodyColumn, partColumn) {
  const first = String(row[bodyColumn - 1] || '');
  if (!first.startsWith('~')) return first.replace(/^'/, '');
  const cells = [first, ...row.slice(partColumn - 1)];
  const end = cells.findIndex(cell => cell === '');
  const parts = end < 0 ? cells : cells.slice(0, end);
  if (parts.some(cell => typeof cell !== 'string' || !cell.startsWith('~'))) throw new Error('Invalid JSON cell parts');
  return parts.map(cell => cell.slice(1)).join('');
}

// Keeps the ghost of a run (once per run id). Call with the lock held. A character is a JSON object; anything else is dropped.
function ghostPut_(id, owner, nick, cls, floor, level, cause, body) {
  if (typeof body !== 'string' || body.length > GHOST_MAX) return;
  try { if (typeof JSON.parse(body) !== 'object') return; } catch (error) { return; }
  const sheet = ghosts_(), rows = sheet.getLastRow();
  if (rows > 1 && sheet.getRange(2, 2, rows - 1, 1).createTextFinder(id).matchEntireCell(true).findNext()) return true;
  if (rows >= GHOST_ROWS) return;
  if (rows > 1 && sheet.getRange(2, 3, rows - 1, 1).createTextFinder(owner).matchEntireCell(true).findAll().length >= GHOSTS_PER_OWNER) return;
  const [first, ...parts] = jsonCells_(body);
  sheet.appendRow([new Date().toISOString(), id, owner, nick, cls, floor, level, cause, 'alive', first, '', '', '', '', '', '', ...parts]);
  return true;
}

// A ghost whose lock ran out is alive again (unless a duel still has to be settled: ghostFree_ looks).
function statusOf_(row) {
  const status = String(row[8]);
  return status === 'locked' && Date.now() - Number(row[GHOST_HEADER.indexOf('lockTime')]) > LOCK_MS ? 'alive' : status;
}

function ghostList_(owner, key) {
  if (!authed_(owner, key)) return reply_({ ok: false, error: 'auth' });
  const sheet = ghosts_(), rows = sheet.getLastRow();
  const values = rows > 1 ? sheet.getRange(2, 1, rows - 1, 9).getValues() : [];
  const stats = rows > 1 ? sheet.getRange(2, LOCK_COL + 1, rows - 1, 5).getValues() : [];
  const list = values.map((row, i) => [...row, '', '', ...stats[i]])
    .filter(row => String(row[2]) === owner).reverse().slice(0, GHOST_LIST)
    .map(row => ({ t: row[0], id: row[1], cls: row[4], floor: row[5], level: row[6], cause: row[7], status: statusOf_(row), score: Number(row[12]) || 0, peak: Number(row[13]) || 0, wins: Number(row[14]) || 0, losses: Number(row[15]) || 0 }));
  return reply_({ ok: true, list });
}

function ghostGet_(owner, id, key) {
  if (!authed_(owner, key)) return reply_({ ok: false, error: 'auth' });
  const sheet = ghosts_(), rows = sheet.getLastRow();
  const found = rows > 1 ? sheet.getRange(2, 2, rows - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
  if (!found || String(sheet.getRange(found.getRow(), 3).getValue()) !== owner) return reply_({ ok: false, error: 'none' });
  const runs = sheet_(), runCount = runs.getLastRow();
  const run = runCount > 1 ? runs.getRange(2, 2, runCount - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
  const turns = run ? Number(runs.getRange(run.getRow(), HEADER.indexOf('turns') + 1).getValue()) : null;
  return reply_({ ok: true, body: readJsonCells_(sheet.getRange(found.getRow(), 1, 1, GHOST_HEADER.length).getValues()[0], BODY_COL, GHOST_PART_COL), turns });
}

// ---- stakes ----------------------------------------------------------------------------------------------------------------
function ghostRow_(sheet, id) {
  const rows = sheet.getLastRow();
  const found = rows > 1 ? sheet.getRange(2, 2, rows - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
  return found ? found.getRow() : 0;
}

function duelRow_(sheet, id) {
  const rows = sheet.getLastRow();
  const found = rows > 1 ? sheet.getRange(2, 1, rows - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
  return found ? found.getRow() : 0;
}

function setGhost_(sheet, row, status, duel) {
  sheet.getRange(row, 9).setValue(status);
  sheet.getRange(row, LOCK_COL, 1, 2).setValues([[status === 'locked' ? duel : '', status === 'locked' ? Date.now() : '']]);
}

// What a taken ghost leaves: everything it carried (the bag) and wore (the five slots).
function lootOf_(body) {
  let ghost;
  try { ghost = JSON.parse(String(body).replace(/^'/, '')); } catch (error) { return []; }
  const items = Array.isArray(ghost.inventory) ? ghost.inventory.slice() : [];
  for (const slot of ['weapon', 'armor', 'cloak', 'relic', 'trinket']) if (ghost[slot] && typeof ghost[slot] === 'object') items.push(ghost[slot]);
  return items.filter(item => item && typeof item === 'object');
}

// Settles a duel row if it can be settled now. Call with the lock held.
function resolve_(duels, row) {
  const [id, , ghostA, ownerA, ghostB, ownerB, claimA, claimB, timeA, timeB, state] = duels.getRange(row, 1, 1, DUEL_HEADER.length).getValues()[0];
  if (String(state) !== 'open') return;
  const now = Date.now();
  let winner = null, voided = false;
  if (claimA && claimB) {
    if (claimA === claimB) voided = true;
    else winner = claimA === 'won' ? ghostA : ghostB;
  } else if (claimA || claimB) {
    const claim = claimA || claimB, at = Number(claimA ? timeA : timeB), mine = claimA ? ghostA : ghostB, other = claimA ? ghostB : ghostA;
    if (now - at < SETTLE_MS) return;
    winner = claim === 'won' ? mine : other;
  } else return;
  const ghosts = ghosts_();
  const rowA = ghostRow_(ghosts, ghostA), rowB = ghostRow_(ghosts, ghostB);
  if (voided) {
    if (rowA) setGhost_(ghosts, rowA, 'alive'); if (rowB) setGhost_(ghosts, rowB, 'alive');
    duels.getRange(row, DUEL_HEADER.indexOf('state') + 1, 1, 2).setValues([['void', '']]);
    return;
  }
  const loser = winner === ghostA ? ghostB : ghostA, winnerOwner = winner === ghostA ? ownerA : ownerB;
  const loserRow = loser === ghostA ? rowA : rowB, winnerRow = winner === ghostA ? rowA : rowB;
  // the record of a ghost: a settled duel is one win for the winner and one loss for the loser (a void duel counts for neither)
  const count = (r, name) => { if (r) { const cell = ghosts.getRange(r, GHOST_HEADER.indexOf(name) + 1); cell.setValue((Number(cell.getValue()) || 0) + 1); } };
  count(winnerRow, 'wins'); count(loserRow, 'losses');
  if (loserRow) {
    const items = lootOf_(readJsonCells_(ghosts.getRange(loserRow, 1, 1, GHOST_HEADER.length).getValues()[0], BODY_COL, GHOST_PART_COL));
    setGhost_(ghosts, loserRow, 'taken');
    CacheService.getScriptCache().removeAll(['ranking']);
    if (items.length) {
      const [first, ...parts] = jsonCells_(JSON.stringify(items));
      sheetOf_(LOOT_SHEET, LOOT_HEADER).appendRow([new Date().toISOString(), winnerOwner, id, loser, first, 'pending', ...parts]);
    }
  }
  if (winnerRow) setGhost_(ghosts, winnerRow, 'alive');
  duels.getRange(row, DUEL_HEADER.indexOf('state') + 1, 1, 2).setValues([['done', winner]]);
}

// The caller's ghost goes into a duel: it must be alive (a lock that ran out counts as alive unless its duel has someone's word in it; a lock of a duel nobody
// has spoken in is the owner's to take back: asking for it means they are not in that duel).
function ghostLock_(req) {
  const owner = String(req.owner || ''), ghost = String(req.ghost || '').slice(0, 64), duel = String(req.duel || '').slice(0, 64);
  if (!authed_(owner, String(req.key || ''))) return reply_({ ok: false, error: 'auth' });
  if (!ghost || !duel) return reply_({ ok: false, error: 'fields' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ghosts = ghosts_(), duels = sheetOf_(DUEL_SHEET, DUEL_HEADER), grow = ghostRow_(ghosts, ghost);
    if (!grow || String(ghosts.getRange(grow, 3).getValue()) !== owner) return reply_({ ok: false, error: 'none' });
    let drow = duelRow_(duels, duel);
    const held = () => ghosts.getRange(grow, 1, 1, GHOST_HEADER.length).getValues()[0];
    let current = held();
    if (String(current[8]) === 'locked' && String(current[LOCK_COL - 1]) !== duel && statusOf_(current) === 'alive') {
      // its lock ran out: settle the old duel if someone had spoken in it
      const oldRow = duelRow_(duels, String(current[LOCK_COL - 1]));
      if (oldRow) resolve_(duels, oldRow);
      current = held();
      if (String(current[8]) === 'locked') setGhost_(ghosts, grow, 'alive');
      current = held();
    }
    const status = String(current[8]);
    if (status === 'taken') return reply_({ ok: false, error: 'none' });
    if (status === 'locked' && String(current[LOCK_COL - 1]) !== duel) {
      // the owner is asking for it, so they are not in that duel any more: a lock of an earlier duel that nobody has spoken in (the page was closed, the
      // other player never came) is given back, and the other ghost of that duel with it. A duel with a word in it stays until it settles.
      const oldId = String(current[LOCK_COL - 1]), oldRow = duelRow_(duels, oldId);
      let free = !oldRow;
      if (oldRow) {
        const [, , oldA, , oldB, , claimA, claimB, , , state] = duels.getRange(oldRow, 1, 1, DUEL_HEADER.length).getValues()[0];
        if (String(state) !== 'open') free = true;
        else if (!claimA && !claimB) {
          duels.getRange(oldRow, DUEL_HEADER.indexOf('state') + 1, 1, 2).setValues([['void', '']]);
          for (const id of [oldA, oldB]) { const r = id ? ghostRow_(ghosts, id) : 0; if (r && String(ghosts.getRange(r, LOCK_COL).getValue()) === oldId) setGhost_(ghosts, r, 'alive'); }
          free = true;
        }
      }
      if (free) setGhost_(ghosts, grow, 'alive');
      current = held();
      if (String(current[8]) === 'locked') return reply_({ ok: false, error: 'busy' });
    }
    if (!drow) { duels.appendRow([duel, new Date().toISOString(), ghost, owner, '', '', '', '', '', '', 'open', '']); drow = duels.getLastRow(); }
    else {
      const [, , ghostA, , ghostB] = duels.getRange(drow, 1, 1, DUEL_HEADER.length).getValues()[0];
      if (ghostA !== ghost && ghostB !== ghost) {
        if (ghostB) return reply_({ ok: false, error: 'duel' });
        duels.getRange(drow, 5, 1, 2).setValues([[ghost, owner]]);
      }
    }
    setGhost_(ghosts, grow, 'locked', duel);
  } finally { lock.releaseLock(); }
  return reply_({ ok: true });
}

// A duel that never began: the lock is given back.
function ghostRelease_(req) {
  const owner = String(req.owner || ''), ghost = String(req.ghost || '').slice(0, 64), duel = String(req.duel || '').slice(0, 64);
  if (!authed_(owner, String(req.key || ''))) return reply_({ ok: false, error: 'auth' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ghosts = ghosts_(), duels = sheetOf_(DUEL_SHEET, DUEL_HEADER), grow = ghostRow_(ghosts, ghost), drow = duelRow_(duels, duel);
    if (!grow || !drow || String(ghosts.getRange(grow, 3).getValue()) !== owner) return reply_({ ok: false, error: 'none' });
    const values = duels.getRange(drow, 1, 1, DUEL_HEADER.length).getValues()[0];
    if (String(values[10]) !== 'open' || values[6] || values[7]) return reply_({ ok: false, error: 'begun' });
    if (String(ghosts.getRange(grow, 9).getValue()) === 'locked' && String(ghosts.getRange(grow, LOCK_COL).getValue()) === duel) setGhost_(ghosts, grow, 'alive');
    duels.getRange(drow, 11, 1, 2).setValues([['void', '']]);
  } finally { lock.releaseLock(); }
  return reply_({ ok: true });
}

// The owner reports the current score and the best score of one of its ghosts (the game keeps the arithmetic; this only shows it on the board).
function ghostScore_(req) {
  const owner = String(req.owner || ''), ghost = String(req.ghost || '').slice(0, 64);
  const score = Math.floor(Number(req.score)), peak = Math.floor(Number(req.peak));
  if (!ghost || !(score >= 0 && score <= 9999) || !(peak >= score && peak <= 9999)) return reply_({ ok: false, error: 'fields' });
  if (!authed_(owner, String(req.key || ''))) return reply_({ ok: false, error: 'auth' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ghosts = ghosts_(), grow = ghostRow_(ghosts, ghost);
    if (!grow || String(ghosts.getRange(grow, 3).getValue()) !== owner) return reply_({ ok: false, error: 'none' });
    ghosts.getRange(grow, GHOST_HEADER.indexOf('score') + 1, 1, 2).setValues([[score, peak]]);
  } finally { lock.releaseLock(); }
  return reply_({ ok: true });
}

// A side says how the duel ended for it. Asking again returns the standing answer.
function ghostSettle_(req) {
  const owner = String(req.owner || ''), ghost = String(req.ghost || '').slice(0, 64), duel = String(req.duel || '').slice(0, 64);
  if (!authed_(owner, String(req.key || ''))) return reply_({ ok: false, error: 'auth' });
  if (!ghost || !duel || typeof req.won !== 'boolean') return reply_({ ok: false, error: 'fields' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const duels = sheetOf_(DUEL_SHEET, DUEL_HEADER), row = duelRow_(duels, duel);
    if (!row) return reply_({ ok: false, error: 'none' });
    const read = () => duels.getRange(row, 1, 1, DUEL_HEADER.length).getValues()[0];
    let values = read();
    const side = values[2] === ghost && values[3] === owner ? 'A' : values[4] === ghost && values[5] === owner ? 'B' : '';
    if (!side) return reply_({ ok: false, error: 'none' });
    resolve_(duels, row); // a word given long ago may stand already
    values = read();
    const col = DUEL_HEADER.indexOf('claim' + side) + 1;
    if (String(values[10]) === 'open' && !values[col - 1]) {
      duels.getRange(row, col, 1, 1).setValue(req.won ? 'won' : 'lost');
      duels.getRange(row, col + 2, 1, 1).setValue(Date.now());
      resolve_(duels, row);
      values = read();
    }
    const state = String(values[10]);
    const answer = state === 'done' ? (values[11] === ghost ? 'won' : 'lost') : state === 'void' ? 'void' : 'pending';
    return reply_({ ok: true, state: answer });
  } finally { lock.releaseLock(); }
}

// Hands out the pending loot of a player ID: at most LOOT_PER_CLAIM things, the rest stays for the next claim.
function lootClaim_(req) {
  const owner = String(req.owner || '');
  if (!authed_(owner, String(req.key || ''))) return reply_({ ok: false, error: 'auth' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  const taken = [];
  try {
    const sheet = sheetOf_(LOOT_SHEET, LOOT_HEADER), rows = sheet.getLastRow();
    for (let r = 2; r <= rows && taken.length < LOOT_PER_CLAIM; r++) {
      const row = sheet.getRange(r, 1, 1, LOOT_HEADER.length).getValues()[0];
      const [, who, , , , status] = row;
      if (String(who) !== owner || String(status) !== 'pending') continue;
      let list;
      try { list = JSON.parse(readJsonCells_(row, 5, 7)); } catch (error) { list = []; }
      const give = list.slice(0, LOOT_PER_CLAIM - taken.length), rest = list.slice(give.length);
      taken.push(...give);
      if (rest.length) {
        const [first, ...parts] = jsonCells_(JSON.stringify(rest));
        sheet.getRange(r, 5, 1, LOOT_HEADER.length - 4).setValues([[first, 'pending', ...GHOST_PART_HEADERS.map((_, i) => parts[i] || '')]]);
      }
      else sheet.getRange(r, 6).setValue('claimed');
    }
  } finally { lock.releaseLock(); }
  return reply_({ ok: true, items: taken });
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
  if (record.ghostLock) return ghostLock_(record.ghostLock);
  if (record.ghostRelease) return ghostRelease_(record.ghostRelease);
  if (record.ghostSettle) return ghostSettle_(record.ghostSettle);
  if (record.ghostScore) return ghostScore_(record.ghostScore);
  if (record.lootClaim) return lootClaim_(record.lootClaim);
  const id = String(record.id || '').slice(0, 64);
  const floor = int_(record.floor, 1, 25), level = int_(record.level, 1, 99);
  const kills = int_(record.kills, 0, 100000), turns = int_(record.turns, 0, 10000000);
  if (record.v !== 1 || !id || floor === null || level === null || kills === null || turns === null) return reply_({ ok: false, error: 'fields' });
  // A leading = + - @ would run as a formula in the sheet.
  const cause = String(record.cause || '').slice(0, 40).replace(/^[=+\-@]/, "'$&");
  const owner = id.replace(/[^0-9a-z]/gi, '').slice(0, 6).toUpperCase();
  const cls = /^[a-z][a-z0-9_]{0,23}$/.test(String(record.cls || '')) ? String(record.cls) : '';
  const live = record.live === 1;
  const ghost = !live && cause !== 'End' && typeof record.ghost === 'string' && authed_(owner, String(record.key || '')) ? record.ghost : null;
  const largeGhost = typeof record.ghost === 'string' && record.ghost.length > LEGACY_BODY_MAX;
  let ghostStored = false;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_(), rows = sheet.getLastRow();
    const nick = nickOf_(owner); // the nickname this device has claimed, whatever the record says
    const found = rows > 1 ? sheet.getRange(2, 2, rows - 1, 1).createTextFinder(id).matchEntireCell(true).findNext() : null;
    if (found) {
      // A finished run never changes again (a late progress update or a resent record is dropped); a run in progress is updated in place.
      const row = found.getRow();
      if (!sheet.getRange(row, LIVE_COL).getValue()) {
        if (!largeGhost) return reply_({ ok: true, duplicate: true });
        const final = sheet.getRange(row, 1, 1, HEADER.length).getValues()[0];
        const matches = final[2] === floor && final[3] === cause && final[4] === level &&
          final[5] === kills && final[6] === turns && final[8] === cls;
        if (matches && ghost && depthRanked_(id)) ghostStored = !!ghostPut_(id, owner, nick, cls, floor, level, cause, ghost);
        if (ghostStored) CacheService.getScriptCache().removeAll(['ranking']);
        return reply_({ ok: true, duplicate: true, ghostStored });
      }
      sheet.getRange(row, 3, 1, 7).setValues([[floor, live ? LIVE_CAUSE : cause, level, kills, turns, nick, cls]]);
      sheet.getRange(row, LIVE_COL).setValue(live ? Date.now() : '');
      if (ghost && depthRanked_(id)) ghostStored = !!ghostPut_(id, owner, nick, cls, floor, level, cause, ghost);
    } else {
      if (rows >= MAX_ROWS) return reply_({ ok: false, error: 'full' });
      sheet.appendRow([new Date().toISOString(), id, floor, live ? LIVE_CAUSE : cause, level, kills, turns, nick, cls, live ? Date.now() : '']);
      if (ghost && depthRanked_(id)) ghostStored = !!ghostPut_(id, owner, nick, cls, floor, level, cause, ghost);
    }
    CacheService.getScriptCache().removeAll(['summary', 'ranking']);
  } finally { lock.releaseLock(); }
  return reply_(largeGhost ? { ok: true, ghostStored } : { ok: true });
}

// Each board orders by its own number first, then by how far the run got.
const BOARDS = {
  depth: (a, b) => b.floor - a.floor || b.level - a.level || b.kills - a.kills || a.turns - b.turns,
  level: (a, b) => b.level - a.level || b.floor - a.floor || b.kills - a.kills || a.turns - b.turns,
  kills: (a, b) => b.kills - a.kills || b.floor - a.floor || b.level - a.level || a.turns - b.turns,
};

// The ghosts that still stand (not taken), as the runs they came from (the same rows the other boards use) with their current score and best score, by current
// score (a ghost that has not dueled yet has the starting score, the floor it died on + 2, at least 3); depth, level, kills and fewer turns break a tie.
function standingGhosts_(runs) {
  const sheet = ghosts_(), rows = sheet.getLastRow();
  if (rows < 2) return [];
  const scores = {};
  const rowsById = sheet.getRange(2, 2, rows - 1, 1).getValues();
  const states = sheet.getRange(2, 9, rows - 1, 1).getValues();
  const stats = sheet.getRange(2, 13, rows - 1, 4).getValues();
  rowsById.forEach(([id], i) => {
    if (String(states[i][0]) === 'taken') return;
    const [score, peak, wins, losses] = stats[i].map(value => Number(value) || 0);
    scores[String(id)] = { score, peak, wins, losses };
  });
  const start = run => Math.max(3, (Number(run.floor) || 1) + 2);
  return runs.filter(run => scores[run.id]).map(run => ({ ...run, score: scores[run.id].score, peak: scores[run.id].peak, wins: scores[run.id].wins, losses: scores[run.id].losses }))
    .sort((a, b) => (b.score || start(b)) - (a.score || start(a)) || BOARDS.depth(a, b)).slice(0, RANK_ROWS).map(({ id, ...run }) => run);
}

function ranking_() {
  const cache = CacheService.getScriptCache(), hit = cache.get('ranking');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  const sheet = sheet_(), rows = sheet.getLastRow();
  const values = rows > 1 ? sheet.getRange(2, 1, rows - 1, HEADER.length).getValues() : [];
  const runs = values.map(([, id, floor, cause, level, kills, turns, nick, cls, stamp]) => ({
    id: String(id), tag: String(id).replace(/[^0-9a-z]/gi, '').slice(0, 6).toUpperCase(), nick: String(nick || ''), cls: String(cls || ''), live: isLive_(stamp),
    floor: String(cause) === 'End' ? 30 : floor, cause: causeOf_(cause, stamp), level, kills, turns,
  }));
  const boards = {};
  for (const name of Object.keys(BOARDS)) boards[name] = runs.slice().sort(BOARDS[name]).slice(0, RANK_ROWS).map(({ id, ...run }) => run);
  boards.ghost = standingGhosts_(runs);
  const ranking = JSON.stringify({ ok: true, total: runs.length, boards });
  cache.put('ranking', ranking, 60);
  return ContentService.createTextOutput(ranking).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.view === 'ghost-capacity') return reply_({ ok: true, max: GHOST_MAX });
  if (e && e.parameter && e.parameter.view === 'ghosts') return ghostList_(String(e.parameter.owner || ''), String(e.parameter.key || ''));
  if (e && e.parameter && e.parameter.view === 'ghost') return ghostGet_(String(e.parameter.owner || ''), String(e.parameter.id || '').slice(0, 64), String(e.parameter.key || ''));
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
