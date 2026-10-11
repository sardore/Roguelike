#!/usr/bin/env node
// Refactor tool: move top-level declarations of the game closure into another file of src/game, keeping
// their order and the comments directly above them. Run on the work file (node tools/game.mjs assemble).
//   node tools/refactor/move-to.mjs <work.js> <target.js> <names.txt> [--create-after <file>] [--dry]
// names.txt lists one declaration name per line (# starts a comment). Statements that declare several
// names must be listed completely. The tool refuses when the move would make a const/let initialiser
// read another const/let that is now declared after it (a temporal-dead-zone error at load time).
// Loose statements (calls, registrations) are never moved: their order is behaviour.
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
const [workFile, target, namesFile] = args.filter((a, i) => !a.startsWith('--') && !(createIdx >= 0 && i === createIdx + 1) && !(beforeIdx >= 0 && i === beforeIdx + 1));
const srcDir = path.resolve('src');
let text = fs.readFileSync(workFile, 'utf8');
const names = fs.readFileSync(namesFile, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean);
if (new Set(names).size !== names.length) throw new Error('names.txt lists a name twice');

const parse = (t) => acorn.parse(t, { ecmaVersion: 'latest', locations: true });
const topOf = (ast) => ast.body[0].expression.callee.body.body;
const declNames = (s) => (s.type === 'FunctionDeclaration' ? [s.id.name] : s.type === 'VariableDeclaration' ? s.declarations.flatMap((d) => (d.id.type === 'Identifier' ? [d.id.name] : ['<pattern>'])) : s.type === 'ClassDeclaration' ? [s.id.name] : []);

// ---- the order constraints a const/let initialiser imposes (identifier read outside any function)
function initPairs(t) {
  const ast = parse(t), top = topOf(ast), pos = new Map();
  top.forEach((s, i) => { for (const n of declNames(s)) pos.set(n, { i, kind: s.type === 'FunctionDeclaration' ? 'fn' : 'data' }); });
  const pairs = new Set();
  top.forEach((s, i) => {
    if (s.type !== 'VariableDeclaration' && s.type !== 'ClassDeclaration') return;
    walk.ancestor(s, { Identifier(id, _st, anc) {
      if (anc.some((a) => /Function/.test(a.type))) return;
      const p = pos.get(id.name); if (!p || p.kind === 'fn' || p.i === i) return;
      pairs.add(`${declNames(s)[0]}>${id.name}:${p.i < i ? 'ok' : 'late'}`);
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
for (const s of stmts) if (!segOf(s.start)) throw new Error('statement outside any file segment');

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
  if (!dry) {
    const manifest = readManifest(srcDir);
    const list = manifest.closure.includes(ref) ? manifest.closure : manifest.afterClosure;
    list.splice(list.indexOf(ref) + (createBefore ? 0 : 1), 0, target);
    fs.writeFileSync(path.join(srcDir, 'game', 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
    fs.writeFileSync(path.join(srcDir, 'game', target), '');
  }
}
parse(out);
const after = initPairs(out);
const newlyLate = after.late.filter((x) => !before.late.includes(x));
console.log(`moved ${stmts.length} statements (${names.length} names) into ${target}; initialiser order violations: ${newlyLate.length}`);
if (newlyLate.length) { console.log(newlyLate.slice(0, 15).join('\n')); throw new Error('the move would break the load order'); }
if (!dry) fs.writeFileSync(workFile, out);
