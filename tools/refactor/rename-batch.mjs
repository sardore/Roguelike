#!/usr/bin/env node
// Refactor tool: rename many bindings in one pass (scope-aware; shorthand properties are expanded).
//   node tools/refactor/rename-batch.mjs <work.js> <map.tsv> [--dry]
// map.tsv: oldName<TAB>newName per line. Every old name must be one binding, every new name unused
// anywhere (declared or referenced as a global) and unique within the map.
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const [file, mapFile] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
let src = fs.readFileSync(file, 'utf8');
const rows = fs.readFileSync(mapFile, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean).map((l) => l.split(/\t+/));
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A = analyze(ast);
const taken = new Set([...A.bindings.map((b) => b.name), ...A.refs.filter((r) => !r.binding).map((r) => r.node.name)]);
const targets = new Set();
const problems = [];
const edits = [];
const shorthand = new Map();
walk.full(ast, (n) => { if (n.type === 'Property' && n.shorthand) shorthand.set(n.value, n); });
for (const [from, to] of rows) {
  const bs = A.bindings.filter((b) => b.name === from);
  if (bs.length !== 1) { problems.push(`${from}: ${bs.length} bindings`); continue; }
  if (taken.has(to) || targets.has(to)) { problems.push(`${from} -> ${to}: ${to} is already used`); continue; }
  targets.add(to);
  const b = bs[0];
  const decl = shorthand.get(b.idNode);
  edits.push(decl ? { start: decl.start, end: decl.end, text: `${from}:${to}` } : { start: b.idNode.start, end: b.idNode.end, text: to });
  for (const r of b.refs) { const p = r.parent; if (p.type === 'Property' && p.shorthand && p.value === r.node) edits.push({ start: p.start, end: p.end, text: `${from}:${to}` }); else edits.push({ start: r.node.start, end: r.node.end, text: to }); }
}
if (problems.length) { console.log(problems.join('\n')); throw new Error(`${problems.length} rename(s) refused; nothing written`); }
edits.sort((x, y) => y.start - x.start);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error('overlapping edits');
for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);
const ast2 = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A2 = analyze(ast2);
const g1 = A.refs.filter((r) => !r.binding).length, g2 = A2.refs.filter((r) => !r.binding).length;
if (g1 !== g2) throw new Error(`unresolved references changed: ${g1} -> ${g2}`);
console.log(`${rows.length} renames, ${edits.length} occurrences`);
if (!dry) fs.writeFileSync(file, src);
