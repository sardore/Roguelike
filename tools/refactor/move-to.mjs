#!/usr/bin/env node
// Refactor tool: move top-level declarations of the game closure into another file of src/game, keeping
// their order and the comments directly above them. Run on the work file (node tools/game.mjs assemble).
//   node tools/refactor/move-to.mjs <work.js> <target.js> <names.txt> [--create-after <file>] [--measured <file>] [--dry]
// names.txt lists one declaration name per line (# starts a comment). Statements that declare several
// names must be listed completely. The tool refuses when the move would make a const/let initialiser
// read another const/let that is now declared after it (a temporal-dead-zone error at load time).
// Loose statements (calls, registrations) are never moved: their order is behaviour.
// --measured <file> takes the output of tools/refactor/load-reads.mjs. The call-path check below is static and
// counts any mention of a function as a call; a name the measurement saw no read of before its declaration ran
// ("tdz 0") is exempt from that one check when it moves to an earlier place, a name never read during load
// ("not read at load") wherever it moves.
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { readManifest, SENTINEL } from '../lib/game.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const createIdx = args.indexOf('--create-after');
const createAfter = createIdx >= 0 ? args[createIdx + 1] : null;
const beforeIdx = args.indexOf('--create-before');
const createBefore = beforeIdx >= 0 ? args[beforeIdx + 1] : null;
const measuredIdx = args.indexOf('--measured');
const [workFile, target, namesFile] = args.filter((a, i) => !a.startsWith('--') && ![createIdx, beforeIdx, measuredIdx].some((k) => k >= 0 && i === k + 1));
const measuredLines = measuredIdx < 0 ? [] : fs.readFileSync(args[measuredIdx + 1], 'utf8').split('\n');
const measuredSafe = new Set(measuredLines.map((l) => /^(\S+)\t(not read at load|ok \d+ tdz 0\b)/.exec(l)?.[1]).filter(Boolean));
const measuredUnread = new Set(measuredLines.map((l) => /^(\S+)\tnot read at load/.exec(l)?.[1]).filter(Boolean));
const srcDir = path.resolve('src');
let text = fs.readFileSync(workFile, 'utf8');
const names = fs.readFileSync(namesFile, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean);
if (new Set(names).size !== names.length) throw new Error('names.txt lists a name twice');

// code inside a function runs later, except an immediately invoked one ((function(){...})() runs where it stands)
const deferred = (anc) => anc.some((a, i) => /Function/.test(a.type) && !(i > 0 && anc[i - 1].type === 'CallExpression' && anc[i - 1].callee === a));
const parse = (t) => acorn.parse(t, { ecmaVersion: 'latest', locations: true });
const topOf = (ast) => ast.body[0].expression.callee.body.body;
const declNames = (s) => (s.type === 'FunctionDeclaration' ? [s.id.name] : s.type === 'VariableDeclaration' ? s.declarations.flatMap((d) => (d.id.type === 'Identifier' ? [d.id.name] : ['<pattern>'])) : s.type === 'ClassDeclaration' ? [s.id.name] : []);

// ---- the order constraints a const/let initialiser imposes (identifier read outside any function)
const lateInfo = new Map();
// An initialiser also reads, when it runs, the values read by the functions it mentions (transitively; any mention
// counts, as for the call-path check below). Those reads are paired too, so a move that puts a value after an
// initialiser that reaches it through a function is refused (strictKeyFloors -> strictLockFloors() -> LOCK_SPECIAL).
function initPairs(t) {
  const ast = parse(t), top = topOf(ast), pos = new Map(), fnStmt = new Map();
  top.forEach((s, i) => { for (const n of declNames(s)) pos.set(n, { i, kind: s.type === 'FunctionDeclaration' ? 'fn' : 'data' }); if (s.type === 'FunctionDeclaration') fnStmt.set(s.id.name, s); });
  const fnReads = new Map(); // function name -> Set of value names its body (and the functions it mentions) reads
  const readsOf = (name) => {
    if (fnReads.has(name)) return fnReads.get(name);
    const out = new Set(); fnReads.set(name, out);
    const stack = [name], seen = new Set([name]);
    while (stack.length) {
      const f = fnStmt.get(stack.pop()); if (!f) continue;
      walk.simple(f.body, { Identifier(id) {
        const p = pos.get(id.name); if (!p) return;
        if (p.kind === 'fn') { if (!seen.has(id.name)) { seen.add(id.name); stack.push(id.name); } } else out.add(id.name);
      } });
    }
    return out;
  };
  const pairs = new Set();
  top.forEach((s, i) => {
    if (s.type !== 'VariableDeclaration' && s.type !== 'ClassDeclaration') return;
    const reader = declNames(s)[0];
    const add = (name, via) => {
      const p = pos.get(name); if (!p || p.i === i) return;
      const key = `${reader}>${name}:${p.i < i ? 'ok' : 'late'}`; pairs.add(key);
      if (p.i >= i) lateInfo.set(key, `reader#${i} reads decl#${p.i}${via ? ' through ' + via + '()' : ''}`);
    };
    walk.ancestor(s, { Identifier(id, _st, anc) {
      if (deferred(anc)) return;
      const p = pos.get(id.name); if (!p) return;
      if (p.kind === 'fn') {
        // a function stored as a value (array element, property value, the whole initialiser) is not called while the initialiser runs
        const parent = anc[anc.length - 2];
        if (parent && (parent.type === 'ArrayExpression' || (parent.type === 'Property' && parent.value === id) || (parent.type === 'VariableDeclarator' && parent.init === id))) return;
        for (const v of readsOf(id.name)) add(v, id.name); return;
      }
      add(id.name, null);
    } });
  });
  return { pairs, late: [...pairs].filter((x) => x.endsWith(':late')) };
}
const before = initPairs(text);

// ---- file segments of the work file
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index, bodyAt: m.index + m[0].length }));
const segOf = (pos) => { let cur = null; for (const m of marks) if (m.at <= pos) cur = m; return cur; };

const ast = parse(text), top = topOf(ast);
const byName = new Map();
for (const s of top) for (const n of declNames(s)) byName.set(n, s);
const picked = new Set();
for (const n of names) {
  const s = byName.get(n);
  if (!s) throw new Error(`${n}: no top-level declaration`);
  const all = declNames(s);
  if (all.some((x) => !names.includes(x))) throw new Error(`${n}: the statement also declares ${all.filter((x) => !names.includes(x)).join(', ')}`);
  picked.add(s);
}
const stmts = [...picked].sort((a, b) => a.start - b.start);
const insertAt = (() => {
  const segIdx = (file) => marks.findIndex((m) => m.file === file);
  const tIdx = segIdx(target);
  if (tIdx >= 0) return tIdx + 1 < marks.length ? marks[tIdx + 1].at : text.length;
  const refIdx = segIdx(createAfter || createBefore);
  if (refIdx < 0) return undefined;
  return createBefore ? marks[refIdx].at : refIdx + 1 < marks.length ? marks[refIdx + 1].at : text.length;
})();
// a moved const/let (not a function: those are hoisted) that a statement staying behind reads at load time (outside any function)
// would be read before it exists whenever the new file loads after that statement
{
  const movedValues = new Map();
  for (const s of stmts) if (s.type !== 'FunctionDeclaration') for (const n of declNames(s)) movedValues.set(n, s);
  for (const s of top) {
    if (picked.has(s) || s.type === 'FunctionDeclaration') continue;
    if (insertAt !== undefined && s.start >= insertAt) continue; // loads after the new file: it exists by then
    walk.ancestor(s, { Identifier(id, _st, anc) {
      if (!movedValues.has(id.name) || deferred(anc)) return;
      if (s.type === 'VariableDeclaration' && declNames(s).includes(id.name)) return;
      throw new Error(`${id.name}: read at load time by a statement that stays (line ${id.loc?.start.line ?? '?'}): its place is fixed by that statement`);
    } });
  }
}
// An initialiser that reads window.X / globalThis.X at load time depends on the loose statements that publish X. It may move only
// when every publisher of X (a statement outside any function that assigns window.X) stays before the new place, no publisher
// hides inside a function (its time is unknown), no statement between the new and the old place changes X's members, and the
// global is only addressed by name (window[key] or a bare window cannot be followed).
function checkGlobalReads(s) {
  const who = declNames(s)[0], members = new Set();
  const isGlobal = (n) => n && n.type === 'Identifier' && (n.name === 'window' || n.name === 'globalThis');
  const bare = [];
  walk.ancestor(s, { Identifier(id, _st, anc) {
    if (!isGlobal(id) || deferred(anc)) return;
    const parent = anc[anc.length - 2];
    if (parent?.type === 'MemberExpression' && parent.object === id && !parent.computed) members.add(parent.property.name);
    else bare.push(id.name);
  } });
  if (bare.length) throw new Error(`${who}: the initialiser uses ${bare[0]} other than as ${bare[0]}.NAME at load time; the statements that publish it fix its place`);
  if (insertAt === undefined) throw new Error(`${who}: the initialiser reads window.${[...members][0]} at load time and the new place is not known`);
  const rootMember = (n) => { // window.X.a.b -> X, or null when n is not rooted at window.X
    let cur = n, last = null;
    while (cur.type === 'MemberExpression') { last = cur; cur = cur.object; }
    return isGlobal(cur) && last && !last.computed ? last.property.name : null;
  };
  for (const o of top) {
    if (picked.has(o) || o === s) continue;
    const topLevel = o.type !== 'FunctionDeclaration';
    walk.ancestor(o, {
      AssignmentExpression(a, _st, anc) {
        if (a.left.type !== 'MemberExpression') return;
        const x = rootMember(a.left);
        if (!x || !members.has(x)) return;
        const direct = isGlobal(a.left.object);
        if (!topLevel || deferred(anc)) throw new Error(`${who}: window.${x} is assigned inside a function (line ${a.loc.start.line}), at a time the tool cannot follow`);
        if (direct && o.start >= insertAt) throw new Error(`${who}: window.${x} is published after the new place (line ${a.loc.start.line}): its place is fixed by that statement`);
        if (!direct && o.start >= insertAt && o.start < s.start) throw new Error(`${who}: window.${x}.* is assigned between the new and the old place (line ${a.loc.start.line}): its place is fixed by that statement`);
      },
      CallExpression(c, _st, anc) {
        if (!topLevel || deferred(anc) || o.start < insertAt || o.start >= s.start) return;
        const f = c.callee; if (f.type !== 'MemberExpression') return;
        const name = f.property.name || '';
        const viaArg = /^(assign|defineProperty|defineProperties|freeze)$/.test(name);
        if (viaArg && isGlobal(c.arguments[0])) {
          // the names it publishes must be readable from the call: a string literal, or the keys of an object literal
          const a1 = c.arguments[1];
          const keys = name === 'defineProperty' && a1?.type === 'Literal' ? [a1.value]
            : name !== 'defineProperty' && a1?.type === 'ObjectExpression' && a1.properties.every((q) => q.type === 'Property' && !q.computed) ? a1.properties.map((q) => q.key.name ?? q.key.value)
            : null;
          if (!keys) throw new Error(`${who}: ${name} on ${c.arguments[0].name} between the new and the old place publishes names the tool cannot read (line ${c.loc.start.line})`);
          const hit = keys.find((k) => members.has(k));
          if (hit) throw new Error(`${who}: window.${hit} is published between the new and the old place (line ${c.loc.start.line}): its place is fixed by that statement`);
          return;
        }
        if (viaArg || /^(push|add|set|splice|unshift|delete)$/.test(name)) {
          const x = rootMember(viaArg ? (c.arguments[0] || f) : f.object);
          if (x && members.has(x)) throw new Error(`${who}: ${name} on window.${x} between the new and the old place (line ${c.loc.start.line}): its place is fixed by that statement`);
        }
      },
    });
  }
}
for (const s of stmts) {
  const seg = segOf(s.start);
  if (!seg) throw new Error('statement outside any file segment');
  if (s.type === 'VariableDeclaration') {
    checkGlobalReads(s);
  }
  if (seg.file === 'qa/qa.js') throw new Error(`${declNames(s)[0]} is declared in qa/qa.js (test-only code): it must not move into the game`);
}

// a moved const/let initialiser that reads members of an object (X.a) captures them when it runs; a statement that stays and
// mutates X between the new place and the old one (X.a=..., Object.assign(X,..), X.push(..)) would then run after the capture
{
  const MUTATORS = /^(push|add|set|splice|unshift|delete|assign|defineProperty|defineProperties|freeze)$/;
  for (const s of stmts) {
    if (s.type !== 'VariableDeclaration') continue;
    const read = new Set();
    walk.ancestor(s, { MemberExpression(m, _st, anc) {
      if (deferred(anc)) return;
      let root = m; while (root.type === 'MemberExpression') root = root.object;
      if (root.type === 'Identifier' && root.name !== 'window' && root.name !== 'globalThis') read.add(root.name); // window.X is followed by checkGlobalReads
    } });
    if (!read.size || insertAt === undefined) continue;
    for (const o of top) {
      if (picked.has(o) || o.type === 'FunctionDeclaration' || o.start >= s.start || o.start < insertAt) continue;
      walk.ancestor(o, {
        AssignmentExpression(a, _st, anc) {
          if (deferred(anc)) return;
          let root = a.left; while (root.type === 'MemberExpression') root = root.object;
          if (root.type === 'Identifier' && read.has(root.name) && a.left.type === 'MemberExpression') throw new Error(`${declNames(s)[0]}: reads ${root.name}.* when it runs, and a statement before its old place assigns ${root.name}.* (line ${a.loc.start.line}): its place is fixed by that statement`);
        },
        CallExpression(c, _st, anc) {
          if (deferred(anc)) return;
          const f = c.callee; if (f.type !== 'MemberExpression') return;
          const name = f.property.name || '';
          if (!MUTATORS.test(name)) return;
          let root = /^(assign|defineProperty|defineProperties|freeze)$/.test(name) ? c.arguments[0] : f.object; while (root?.type === 'MemberExpression') root = root.object;
          if (root?.type === 'Identifier' && read.has(root.name)) throw new Error(`${declNames(s)[0]}: reads ${root.name}.* when it runs, and a statement before its old place calls ${name} on ${root.name} (line ${c.loc.start.line}): its place is fixed by that statement`);
        },
      });
    }
  }
}

// the same, one call away: a function a load-time statement (outside any function, before the new file) calls
// must not read a moved const/let either
{
  if (insertAt !== undefined) {
    const movedValues = new Set();
    for (const s of stmts) if (s.type !== 'FunctionDeclaration') for (const n of declNames(s)) if (!measuredUnread.has(n) && !(measuredSafe.has(n) && insertAt < s.start)) movedValues.add(n);
    const fnByName = new Map();
    for (const s of top) if (s.type === 'FunctionDeclaration') fnByName.set(s.id.name, s);
    const eager = new Map(); // function name -> the load-time statement or function that reaches it
    const queue = [];
    const reach = (node, via, skipFns) => {
      walk.ancestor(node, { Identifier(id, _st, anc) {
        if (skipFns && deferred(anc)) return;
        const f = fnByName.get(id.name);
        if (f && !eager.has(id.name)) { eager.set(id.name, via); queue.push(f); }
      } });
    };
    for (const s of top) if (s.start < insertAt && !picked.has(s) && s.type !== 'FunctionDeclaration') reach(s, `a statement at line ${s.loc.start.line}`, true);
    while (queue.length) { const f = queue.pop(); reach(f.body, `${f.id.name} (via ${eager.get(f.id.name)})`, false); }
    for (const [name] of eager) {
      const f = fnByName.get(name);
      walk.simple(f.body, { Identifier(id) {
        if (movedValues.has(id.name)) throw new Error(`${id.name}: read at load time inside ${name}, which ${eager.get(name)} calls: its place is fixed by that call`);
      } });
    }
  }
}

// ---- the text of each statement with the comments directly above and a trailing comment
function blockOf(s) {
  let start = s.start, end = s.end;
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  if (text.slice(lineStart, start).trim() === '') {
    start = lineStart;
    // comment lines directly above (no blank line between)
    for (;;) {
      if (start === 0) break;
      const prevEnd = start - 1;
      const prevStart = text.lastIndexOf('\n', prevEnd - 1) + 1;
      const line = text.slice(prevStart, prevEnd);
      const t = line.trim();
      if (/^\/\*@@FILE [^@]+@@\*\/$/.test(t)) break; // a segment sentinel is not a comment of the statement below it
      if (t.startsWith('//') || (t.startsWith('/*') && t.endsWith('*/'))) { start = prevStart; continue; }
      if (t.endsWith('*/')) { const open = text.lastIndexOf('/*', prevEnd); const openLine = text.lastIndexOf('\n', open - 1) + 1; if (text.slice(openLine, open).trim() === '') { start = openLine; continue; } }
      break;
    }
  }
  const lineEnd = text.indexOf('\n', end) === -1 ? text.length : text.indexOf('\n', end);
  const rest = text.slice(end, lineEnd);
  if (/^\s*(\/\/.*|\/\*.*\*\/)?\s*$/.test(rest) && !/^\s*$/.test(rest)) end = lineEnd;
  return { start, end, text: text.slice(start, end) };
}
const blocks = stmts.map(blockOf);
for (let i = 1; i < blocks.length; i++) if (blocks[i].start < blocks[i - 1].end) { /* adjacent statements on one line share comment text: merge */ blocks[i].start = Math.max(blocks[i].start, blocks[i - 1].end); blocks[i].text = text.slice(blocks[i].start, blocks[i].end); }

// ---- apply: cut from the end of the file backwards, collect the moved text in original order
const moved = blocks.map((b) => b.text.replace(/^\n+/, '').replace(/\s+$/, ''));
let out = text;
for (const b of [...blocks].sort((a, c) => c.start - a.start)) {
  let { start, end } = b;
  out = out.slice(0, start) + out.slice(end);
  // drop a line that became empty
  const ls = out.lastIndexOf('\n', start - 1) + 1, le = out.indexOf('\n', start) === -1 ? out.length : out.indexOf('\n', start);
  if (out.slice(ls, le).trim() === '' && ls < le) out = out.slice(0, ls) + out.slice(le + 1);
}
const payload = moved.join('\n') + '\n';
let writeNewFile = null;

// ---- append to the target segment
const targetMark = new RegExp(`^/\\*@@FILE ${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}@@\\*/\\n`, 'm');
const m = out.match(targetMark);
if (m) {
  const idx = [...out.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)];
  const here = idx.findIndex((x) => x[1] === target);
  const endOfSeg = here + 1 < idx.length ? idx[here + 1].index : out.length;
  // the target segment may be the one before the closing of the closure (the qa file): never append there
  if (target === 'qa/qa.js') throw new Error('refusing to move into qa/qa.js');
  out = out.slice(0, endOfSeg) + (out.slice(0, endOfSeg).endsWith('\n') ? '' : '\n') + payload + out.slice(endOfSeg);
} else {
  if (!createAfter && !createBefore) throw new Error(`${target} is not a file of the game; pass --create-after <file> or --create-before <file>`);
  const idx = [...out.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)];
  const ref = createAfter || createBefore;
  const afterIdx = idx.findIndex((x) => x[1] === ref);
  if (afterIdx < 0) throw new Error(`${ref} is not a file of the game`);
  const at = createBefore ? idx[afterIdx].index : afterIdx + 1 < idx.length ? idx[afterIdx + 1].index : out.length;
  out = out.slice(0, at) + SENTINEL(target) + '\n' + payload + out.slice(at);
  // the manifest and the new file are written only after the load-order check below has passed: a refused move must leave nothing behind
  writeNewFile = () => {
    const manifest = readManifest(srcDir);
    const list = manifest.closure.includes(ref) ? manifest.closure : manifest.afterClosure;
    list.splice(list.indexOf(ref) + (createBefore ? 0 : 1), 0, target);
    fs.writeFileSync(path.join(srcDir, 'game', 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
    fs.writeFileSync(path.join(srcDir, 'game', target), '');
  };
}
parse(out);
const after = initPairs(out);
const newlyLate = after.late.filter((x) => !before.late.includes(x));
console.log(`moved ${stmts.length} statements (${names.length} names) into ${target}; initialiser order violations: ${newlyLate.length}`);
if (newlyLate.length) { console.log(newlyLate.slice(0, 15).map((x) => x + ' ' + (lateInfo.get(x) || '')).join('\n')); throw new Error('the move would break the load order'); }
if (!dry) {
  writeNewFile?.();
  fs.writeFileSync(workFile, out);
}
