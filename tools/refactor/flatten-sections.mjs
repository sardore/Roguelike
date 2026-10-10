#!/usr/bin/env node
// Refactor tool: unwrap the runtime's IIFE patch sections into the one outer closure, so
// every definition lives in a single scope and a behaviour can be owned by one definition.
//
//   node tools/refactor/flatten-sections.mjs <file> [--rename line:name=newName ...] [--dry]
//
// A section is only unwrapped when it is provably equivalent:
//   * no `return`, `this` or `arguments` at section level,
//   * none of its own declarations collides with an outer declaration, another section's
//     declaration, or an unresolved (global) reference anywhere in the file.
// Collisions must be settled with --rename (scope-aware: the declaration and every reference
// that resolves to it are renamed; shorthand properties are expanded).
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';
import { outerBody, sectionCall } from '../lib/sections.mjs';

const args = process.argv.slice(2);
const file = args[0];
const dry = args.includes('--dry');
const renames = new Map();
for (let i = 0; i < args.length; i++) if (args[i] === '--rename') {
  const [key, to] = args[++i].split('=');
  renames.set(key, to);
}

let src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A = analyze(ast);
const outer = outerBody(ast);
if (!outer) throw new Error('no outer closure');
const sections = outer.body.map((stmt) => ({ stmt, fn: sectionCall(stmt) })).filter((s) => s.fn);

const own = (scopeNode) => [...(A.scopes.get(scopeNode) || new Map()).values()].filter((b) => b.kind !== 'param' && b.kind !== 'fname');
const outerNames = new Set(own(outer).map((b) => b.name));
const unresolved = new Map();
for (const r of A.refs) if (!r.binding) (unresolved.get(r.node.name) || unresolved.set(r.node.name, []).get(r.node.name)).push(r);
const nameCount = new Map();
for (const s of sections) for (const b of own(s.fn.body)) nameCount.set(b.name, (nameCount.get(b.name) || 0) + 1);

const edits = []; // {start,end,text}
const problems = [];
const used = new Set([...outerNames, ...nameCount.keys(), ...unresolved.keys()]);

for (const s of sections) {
  const line = s.stmt.loc.start.line;
  // section-level return/this/arguments
  walk.ancestor(s.fn.body, {
    ReturnStatement(n, _st, anc) { if (!anc.slice(0, -1).some((a) => /Function/.test(a.type))) problems.push(`${line}: return at section level (line ${n.loc.start.line})`); },
    ThisExpression(n, _st, anc) { if (!anc.slice(0, -1).some((a) => a.type === 'FunctionExpression' || a.type === 'FunctionDeclaration')) problems.push(`${line}: this at section level (line ${n.loc.start.line})`); },
    Identifier(n, _st, anc) { if (n.name === 'arguments' && !anc.slice(0, -1).some((a) => a.type === 'FunctionExpression' || a.type === 'FunctionDeclaration')) problems.push(`${line}: arguments at section level`); },
  });
  for (const b of own(s.fn.body)) {
    const why = [];
    if (outerNames.has(b.name)) why.push('outer');
    if (nameCount.get(b.name) > 1) why.push('another section');
    if (unresolved.has(b.name)) why.push('global reference at ' + unresolved.get(b.name).map((r) => r.node.loc.start.line).join(','));
    if (!why.length) continue;
    const key = `${b.idNode.loc.start.line}:${b.name}`;
    const to = renames.get(key);
    if (!to) { problems.push(`${line}: ${b.kind} ${b.name} collides (${why.join('; ')}) — pass --rename ${key}=<newName>`); continue; }
    if (used.has(to)) { problems.push(`${key}: rename target ${to} is already used`); continue; }
    used.add(to);
    edits.push({ start: b.idNode.start, end: b.idNode.end, text: to });
    for (const r of b.refs) {
      const p = r.parent;
      if (p.type === 'Property' && p.shorthand && p.value === r.node) edits.push({ start: p.start, end: p.end, text: `${b.name}:${to}` });
      else edits.push({ start: r.node.start, end: r.node.end, text: to });
    }
    // declaration ids inside object patterns written in shorthand
    const declParent = (() => { let hit = null; walk.ancestor(s.fn.body, { Property(n) { if (n.shorthand && n.value === b.idNode) hit = n; } }); return hit; })();
    if (declParent) {
      edits.splice(edits.findIndex((e) => e.start === b.idNode.start), 1);
      edits.push({ start: declParent.start, end: declParent.end, text: `${b.name}:${to}` });
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

// Unwrap: keep the section body statements, drop the IIFE shell and its 'use strict'.
for (const s of sections) {
  const body = s.fn.body.body.filter((n) => !(n.type === 'ExpressionStatement' && n.directive === 'use strict'));
  if (!body.length) { edits.push({ start: s.stmt.start, end: s.stmt.end, text: '' }); continue; }
  edits.push({ start: s.stmt.start, end: body[0].start, text: '' });
  edits.push({ start: body.at(-1).end, end: s.stmt.end, text: '' });
}

edits.sort((a, b) => b.start - a.start || b.end - a.end);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error('overlapping edits at ' + edits[i].start);
for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);
acorn.parse(src, { ecmaVersion: 'latest' });
if (dry) console.log(`ok: ${sections.length} sections, ${edits.length} edits`);
else { fs.writeFileSync(file, src); console.log(`flattened ${sections.length} sections (${edits.length} edits)`); }
