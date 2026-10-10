#!/usr/bin/env node
// Report on the globals the runtime publishes (globalThis.__X__ / window.__X__):
// where they are defined, whether game code reads them, and for object bridges which members
// game code reads. Read-only analysis used to plan the QA / game split (FINDINGS F-09).
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const file = process.argv[2] || 'src/scripts/10-runtime.js';
const src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const T = (n) => src.slice(n.start, n.end);
const isRoot = (n) => n.type === 'Identifier' && (n.name === 'globalThis' || n.name === 'window');
const bridges = new Map();
const get = (name) => bridges.get(name) || bridges.set(name, { defs: [], reads: [], members: new Map() }).get(name);
const nameOf = (m) => (m.type === 'MemberExpression' && !m.computed && isRoot(m.object) && /^__/.test(m.property.name) ? m.property.name : null);

walk.fullAncestor(ast, (n, _s, anc) => {
  const name = n.type === 'MemberExpression' ? nameOf(n) : null;
  if (!name) return;
  const parent = anc[anc.length - 2];
  const b = get(name);
  const line = n.loc.start.line;
  if (parent.type === 'AssignmentExpression' && parent.left === n) { b.defs.push({ line, rhs: parent.right.type }); return; }
  if (parent.type === 'CallExpression' && parent.callee.type === 'MemberExpression' && /^Object\.(defineProperty|freeze)$/.test(T(parent.callee)) && parent.arguments[0] === n) { b.reads.push({ line, kind: 'freeze' }); return; }
  b.reads.push({ line, kind: 'read' });
  // member access  X.member / X?.member
  if (parent.type === 'MemberExpression' && parent.object === n && !parent.computed) {
    b.members.set(parent.property.name, (b.members.get(parent.property.name) || 0) + 1);
  }
});
// defineProperty(globalThis,'__X__',...)
walk.simple(ast, {
  CallExpression(n) {
    if (T(n.callee) === 'Object.defineProperty' && isRoot(n.arguments[0]) && n.arguments[1]?.type === 'Literal' && /^__/.test(n.arguments[1].value)) get(n.arguments[1].value).defs.push({ line: n.loc.start.line, rhs: 'defineProperty' });
  },
});
const out = [...bridges].map(([name, b]) => ({
  name,
  defs: b.defs.map((d) => d.line),
  gameReads: b.reads.filter((r) => r.kind === 'read').length,
  members: Object.fromEntries([...b.members].sort((a, c) => c[1] - a[1])),
}));
out.sort((a, b) => b.gameReads - a.gameReads || a.name.localeCompare(b.name));
console.log(JSON.stringify(out, null, 1));
