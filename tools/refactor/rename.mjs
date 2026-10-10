#!/usr/bin/env node
// Refactor tool: scope-aware rename of one top-level binding and every reference to it
// (shorthand properties are expanded). Refuses if the new name is already declared anywhere
// or referenced as a global.
//   node tools/refactor/rename.mjs <file> <name> <newName> [--dry]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const [file, name, to] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
let src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A = analyze(ast);
const matches = A.bindings.filter((b) => b.name === name);
if (matches.length !== 1) throw new Error(`${name}: ${matches.length} bindings with this name; rename needs exactly one`);
if (A.bindings.some((b) => b.name === to) || A.refs.some((r) => !r.binding && r.node.name === to)) throw new Error(`${to} is already used`);
const b = matches[0];
const edits = [];
let shorthandDecl = null;
walk.full(ast, (n) => { if (n.type === 'Property' && n.shorthand && n.value === b.idNode) shorthandDecl = n; });
edits.push(shorthandDecl ? { start: shorthandDecl.start, end: shorthandDecl.end, text: `${name}:${to}` } : { start: b.idNode.start, end: b.idNode.end, text: to });
for (const r of b.refs) {
  const p = r.parent;
  if (p.type === 'Property' && p.shorthand && p.value === r.node) edits.push({ start: p.start, end: p.end, text: `${name}:${to}` });
  else edits.push({ start: r.node.start, end: r.node.end, text: to });
}
edits.sort((x, y) => y.start - x.start);
for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);
acorn.parse(src, { ecmaVersion: 'latest' });
console.log(`${name} -> ${to}: ${edits.length} occurrence(s)`);
if (!dry) fs.writeFileSync(file, src);
