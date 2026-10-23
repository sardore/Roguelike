#!/usr/bin/env node
// Refactor tool: folds load-time patches of data definitions into the definitions themselves, in the work file
// (node tools/game.mjs assemble ... split).
//   node tools/refactor/fold-patches.mjs <work.js> <spec.json> [--dry]
// spec: { "callee": "patchDef",                       patchDef('<name>', {props}): Object.assign onto the definition called <name>
//         "lists": ["WEAPONS","ARMORS","CLOAKS"],     the arrays of object literals that hold the definitions, searched in this order
//         "key": "name",                              the property that identifies a definition
//         "deleteOf": "defBy",                        `delete defBy('<name>').prop` statements: the property is removed from the definition
//         "removeFunctions": ["patchDef"] }           deleted when nothing but the folded calls used them
// A patched property that exists is replaced where it stands; a new one is appended after the last property, in call order: the
// same key order Object.assign would have produced, so a JSON dump of the definition is unchanged. Refused (exit 1, nothing
// written): a definition that is not found once, a literal with a spread or a computed key, a patch whose argument is not an
// object literal of plain keys, a call that is not a top-level statement, a patch before its definition.
import fs from 'node:fs';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';

const [work, specFile] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const text = fs.readFileSync(work, 'utf8');
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const closure = ast.body[0].expression.callee.body;
const A = analyze(ast);
const slice = (n) => text.slice(n.start, n.end);
const fail = (msg) => { console.error(msg); process.exit(1); };
const keyName = (p) => (p.key.type === 'Identifier' ? p.key.name : p.key.value);

const lists = spec.lists.map((n) => {
  const d = closure.body.filter((s) => s.type === 'VariableDeclaration').flatMap((s) => s.declarations).find((x) => x.id.name === n);
  if (!d || d.init?.type !== 'ArrayExpression') fail(`${n} is not a top-level array literal`);
  return { name: n, decl: d, elements: d.init.elements };
});
const find = (name, at) => {
  for (const l of lists) {
    const hits = l.elements.filter((e) => e?.type === 'ObjectExpression' && e.properties.some((p) => p.type === 'Property' && !p.computed && keyName(p) === spec.key && p.value.type === 'Literal' && p.value.value === name));
    if (hits.length > 1) fail(`"${name}" is defined ${hits.length} times in ${l.name}`);
    if (hits.length) { if (hits[0].start > at) fail(`"${name}" is patched before its definition`); return hits[0]; }
  }
  fail(`no definition called "${name}" in ${spec.lists.join(', ')}`);
};

const ops = new Map(); // ObjectExpression -> [{op:'set'|'delete', key, keyText, valueText}]
const statements = [];
for (const s of closure.body) {
  if (s.type !== 'ExpressionStatement') continue;
  const e = s.expression;
  if (e.type === 'CallExpression' && e.callee.type === 'Identifier' && e.callee.name === spec.callee) {
    const [nameArg, props] = e.arguments;
    if (nameArg?.type !== 'Literal' || props?.type !== 'ObjectExpression') fail(`line ${s.loc.start.line}: ${spec.callee} needs a name literal and an object literal`);
    const target = find(nameArg.value, s.start);
    for (const p of props.properties) {
      if (p.type !== 'Property' || p.computed || p.kind !== 'init' || p.method || p.shorthand) fail(`line ${s.loc.start.line}: only plain key: value properties can be folded`);
      (ops.get(target) || ops.set(target, []).get(target)).push({ op: 'set', key: keyName(p), keyText: slice(p.key), valueText: slice(p.value) });
    }
    statements.push(s);
  } else if (spec.deleteOf && e.type === 'UnaryExpression' && e.operator === 'delete' && e.argument.type === 'MemberExpression' && !e.argument.computed
    && e.argument.object.type === 'CallExpression' && e.argument.object.callee.name === spec.deleteOf && e.argument.object.arguments[0]?.type === 'Literal') {
    const target = find(e.argument.object.arguments[0].value, s.start);
    (ops.get(target) || ops.set(target, []).get(target)).push({ op: 'delete', key: e.argument.property.name });
    statements.push(s);
  }
}
if (!statements.length) fail(`no top-level ${spec.callee}(...) call found`);
// every call of the callee anywhere must be one of the folded statements
let calls = 0;
(function walk(n) { if (!n || typeof n.type !== 'string') return; if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === spec.callee) calls++; for (const k in n) { if (k === 'loc') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); } })(ast);
const folded = statements.filter((s) => s.expression.type === 'CallExpression').length;
if (calls !== folded) fail(`${calls} calls of ${spec.callee} in the program, ${folded} folded: the others must be handled first`);

const edits = [];
for (const [obj, list] of ops) {
  if (obj.properties.some((p) => p.type !== 'Property' || p.computed || p.kind !== 'init')) fail(`the definition at line ${obj.loc.start.line} has a spread, a computed key or an accessor`);
  const final = new Map(); // key -> {op, keyText, valueText} in the order Object.assign / delete would leave them
  for (const o of list) {
    if (o.op === 'delete') final.set(o.key, { op: 'delete' });
    else final.set(o.key, { op: 'set', keyText: o.keyText, valueText: o.valueText });
  }
  const existing = new Map(obj.properties.map((p) => [keyName(p), p]));
  const appended = [];
  for (const [key, o] of final) {
    const p = existing.get(key);
    if (o.op === 'delete') {
      if (!p) { if (list.some((x) => x.op === 'set' && x.key === key)) continue; fail(`delete of "${key}": the definition at line ${obj.loc.start.line} has no such property`); }
      const after = text.slice(p.end).match(/^\s*,/);
      if (after) edits.push({ start: p.start, end: p.end + after[0].length, text: '' });
      else { const before = text.slice(0, p.start).match(/,\s*$/); if (!before) fail(`cannot tell the separator of "${key}"`); edits.push({ start: p.start - before[0].length, end: p.end, text: '' }); }
    } else if (p) edits.push({ start: p.value.start, end: p.value.end, text: o.valueText });
    else appended.push(`${o.keyText}:${o.valueText}`);
  }
  if (appended.length) {
    const last = obj.properties.filter((p) => !(final.get(keyName(p))?.op === 'delete')).at(-1) || obj.properties.at(-1);
    edits.push({ start: obj.end - 1, end: obj.end - 1, text: `${last ? ',' : ''}${appended.join(',')}` });
  }
}
for (const s of statements) edits.push({ start: s.start, end: s.end, text: '\u0001' });
const removed = new Set(statements);
for (const name of spec.removeFunctions || []) {
  const b = A.bindings.find((x) => x.name === name && x.scope === closure);
  const own = closure.body.find((s) => s.type === 'FunctionDeclaration' && s.id.name === name);
  if (!b || !own) fail(`${name} is not a top-level function`);
  const outside = b.refs.filter((r) => { const s = closure.body.find((t) => t.start <= r.node.start && r.node.end <= t.end); return !removed.has(s) && s !== own; });
  if (outside.length) fail(`${name} is still used outside the folded calls (line ${outside[0].node.loc.start.line})`);
  edits.push({ start: own.start, end: own.end, text: '\u0001' });
}
edits.sort((a, b) => b.start - a.start || b.end - a.end);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) fail('overlapping edits');
let out = text;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
out = out.split('\n').flatMap((l) => (l.includes('\u0001') ? (l.replace(/\u0001/g, '').trim() === '' ? [] : [l.replace(/\u0001/g, '')]) : [l])).join('\n');
acorn.parse(out, { ecmaVersion: 'latest' });
console.log(`folded ${folded} ${spec.callee} calls and ${statements.length - folded} delete statements into ${ops.size} definitions`);
if (!dry) fs.writeFileSync(work, out);
