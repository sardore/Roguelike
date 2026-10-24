#!/usr/bin/env node
// Refactor tool: folds load-time member assignments (`OBJ.a = value;`, `OBJ.a.b = value;`) into the object literal that defines
// OBJ, in the work file (node tools/game.mjs assemble ... split).
//   node tools/refactor/fold-assign.mjs <work.js> <spec.json> [--dry]
// spec: { "items": [ { "path": "MINIMAP_PIPELINE.before", "freeze": false } ] }
//   path    the assigned member, root first; the root is a top-level const initialised with an object literal of plain keys
//   freeze  the statement after the assignment is `Object.freeze(ROOT)`: it goes and the literal is wrapped in Object.freeze(…)
// An existing property is replaced where it stands; a new one is appended after the last property. Only values that cannot read
// anything while the literal is evaluated are accepted (a literal, a function or arrow expression): the rest needs a look.
// Refused (exit 1, nothing written): a path assigned more than once or not as a top-level statement of the closure, a root
// that is not an object literal const, an intermediate property that is not an object literal, any other write to the path.
import fs from 'node:fs';
import * as acorn from 'acorn';

const [work, specFile] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const text = fs.readFileSync(work, 'utf8');
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const closure = ast.body[0].expression.callee.body;
const fail = (msg) => { console.error(msg); process.exit(1); };
const keyName = (p) => (p.key.type === 'Identifier' ? p.key.name : p.key.value);
const lazy = (v) => v.type === 'Literal' || v.type === 'FunctionExpression' || v.type === 'ArrowFunctionExpression';
const chain = (m) => { const out = []; let n = m; while (n.type === 'MemberExpression' && !n.computed) { out.unshift(n.property.name); n = n.object; } return n.type === 'Identifier' ? [n.name, ...out] : null; };

const writes = new Map(); // dotted path -> [AssignmentExpression]
(function walk(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression') { const c = chain(n.left); if (c) (writes.get(c.join('.')) || writes.set(c.join('.'), []).get(c.join('.'))).push(n); }
  for (const k in n) { if (k === 'loc') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); }
})(ast);

const edits = [], removed = [];
for (const item of spec.items) {
  const parts = item.path.split('.');
  if (parts.length < 2) fail(`${item.path}: a member path needs at least ROOT.prop`);
  const hits = writes.get(item.path) || [];
  if (hits.length !== 1) fail(`${item.path}: ${hits.length} writes, exactly one can be folded`);
  const stmtIndex = closure.body.findIndex((s) => s.type === 'ExpressionStatement' && s.expression === hits[0]);
  if (stmtIndex < 0) fail(`${item.path}: the write is not a top-level statement of the closure`);
  const stmt = closure.body[stmtIndex], value = hits[0].right;
  if (!lazy(value)) fail(`${item.path}: the value is a ${value.type}; only literals and function expressions can be folded unchecked`);
  for (const [other, list] of writes) if (other !== item.path && (other.startsWith(item.path + '.') || item.path.startsWith(other + '.'))) fail(`${item.path}: ${other} is written too (${list.length}x)`);
  const decl = closure.body.filter((s) => s.type === 'VariableDeclaration' && s.kind === 'const').flatMap((s) => s.declarations).find((d) => d.id.type === 'Identifier' && d.id.name === parts[0]);
  if (!decl || decl.init?.type !== 'ObjectExpression') fail(`${item.path}: ${parts[0]} is not a top-level const initialised with an object literal`);
  if (decl.end > stmt.start) fail(`${item.path}: assigned before ${parts[0]} is defined`);
  let obj = decl.init;
  for (const key of parts.slice(1, -1)) {
    const p = obj.properties.find((q) => q.type === 'Property' && !q.computed && keyName(q) === key);
    if (!p || p.value.type !== 'ObjectExpression') fail(`${item.path}: ${key} is not an object literal property`);
    obj = p.value;
  }
  if (obj.properties.some((p) => p.type !== 'Property' || p.computed || p.kind !== 'init')) fail(`${item.path}: the literal has a spread, a computed key or an accessor`);
  const last = parts.at(-1), existing = obj.properties.find((p) => keyName(p) === last), valueText = text.slice(value.start, value.end);
  if (existing) edits.push({ start: existing.value.start, end: existing.value.end, text: valueText });
  else if (obj.properties.length) { const tail = obj.properties.at(-1); edits.push({ start: tail.end, end: tail.end, text: `,${/\n/.test(text.slice(tail.end, obj.end)) ? '\n' : ''}${last}:${valueText}` }); }
  else edits.push({ start: obj.end - 1, end: obj.end - 1, text: `${last}:${valueText}` });
  removed.push(stmt);
  if (item.freeze) {
    const next = closure.body[stmtIndex + 1], c = next?.expression;
    if (!(c?.type === 'CallExpression' && text.slice(c.callee.start, c.callee.end) === 'Object.freeze' && c.arguments.length === 1 && c.arguments[0].name === parts[0])) fail(`${item.path}: the statement after the assignment is not Object.freeze(${parts[0]})`);
    removed.push(next);
    edits.push({ start: decl.init.start, end: decl.init.start, text: 'Object.freeze(' }, { start: decl.init.end, end: decl.init.end, text: ')' });
  }
}
for (const s of removed) edits.push({ start: s.start, end: s.end, text: '\u0001' });
edits.sort((a, b) => b.start - a.start || b.end - a.end);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) fail('overlapping edits (two items in one literal property?)');
let out = text;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
out = out.split('\n').flatMap((l) => (l.includes('\u0001') ? (l.replace(/\u0001/g, '').trim() === '' ? [] : [l.replace(/\u0001/g, '')]) : [l])).join('\n');
acorn.parse(out, { ecmaVersion: 'latest' });
console.log(`folded ${spec.items.length} member assignments into their literals`);
if (!dry) fs.writeFileSync(work, out);
