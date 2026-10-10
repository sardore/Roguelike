#!/usr/bin/env node
// Refactor tool: replace every game-code use of a published bridge member with a direct reference
// and delete the member from the bridge.
//   node tools/refactor/promote-bridge-member.mjs <file> <__MANRU_X__> <member> <target> [--extract name] [--dry]
// <target> is the expression the member stood for (an identifier in scope, or a dotted path). With
// --extract the member's value (an arrow function) becomes a function declaration called <name>,
// placed before the statement that defines the bridge, and <target> is ignored.
// Reads are `window.__X__.m`, `globalThis.__X__?.m` and reads through `const api = window.__X__`.
// A call `X?.m?.(a)` becomes `target(a)`. Refuses when the target identifier is shadowed at a
// replaced spot or an extracted arrow uses bindings that are not visible at the destination.
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';
import { moveProblems, ancestorsOf } from '../lib/moves.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const exIdx = args.indexOf('--extract');
const extract = exIdx >= 0 ? args[exIdx + 1] : null;
const [file, bridge, member, targetArg] = args.filter((a, i) => !a.startsWith('--') && !(exIdx >= 0 && i === exIdx + 1));
let src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A = analyze(ast);
const T = (n) => src.slice(n.start, n.end);
const isRoot = (n) => n.type === 'Identifier' && (n.name === 'globalThis' || n.name === 'window');
const isBridge = (n) => n.type === 'MemberExpression' && !n.computed && isRoot(n.object) && n.property.name === bridge;
const target = extract || targetArg;

const aliases = new Set();
walk.simple(ast, { VariableDeclarator(n) { let i = n.init; while (i && i.type === 'LogicalExpression') i = i.left; if (i && isBridge(i) && n.id.type === 'Identifier') aliases.add(n.id.name); } });

// definition sites of the member
const defs = []; // {kind:'prop', obj, prop, stmt} | {kind:'assign', stmt, rhs}
walk.fullAncestor(ast, (n, _s, anc) => {
  const p = anc[anc.length - 2];
  if (isBridge(n) && p.type === 'AssignmentExpression' && p.left === n && p.right.type === 'ObjectExpression') {
    for (const prop of p.right.properties) if (prop.type === 'Property' && !prop.computed && (prop.key.name ?? prop.key.value) === member) defs.push({ kind: 'prop', obj: p.right, prop, stmt: anc.findLast((a) => a.type === 'ExpressionStatement') });
  }
  if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && !n.left.computed && n.left.property.name === member && isBridge(n.left.object)) defs.push({ kind: 'assign', node: n, stmt: anc.findLast((a) => a.type === 'ExpressionStatement'), rhs: n.right });
});
if (defs.length !== 1) throw new Error(`${bridge}.${member}: expected one definition, found ${defs.length}`);
const def = defs[0];

const edits = [];
const readsFound = [];
walk.fullAncestor(ast, (n, _s, anc) => {
  if (n.type !== 'MemberExpression' || n.computed || n.property.name !== member) return;
  if (!(isBridge(n.object) || (n.object.type === 'Identifier' && aliases.has(n.object.name)))) return;
  const p = anc[anc.length - 2];
  if (p.type === 'AssignmentExpression' && p.left === n) return; // the definition
  if (n.object.type === 'Identifier' && A.resolveFrom(n.object.name, anc.slice(0, -1)) == null) return;
  readsFound.push({ n, p, anc });
});
if (!readsFound.length) throw new Error(`${bridge}.${member}: no reads`);
for (const { n, p, anc } of readsFound) {
  if (/^[A-Za-z_$][\w$]*$/.test(target)) {
    const seen = A.resolveFrom(target, anc.slice(0, -1));
    const top = A.resolveFrom(target, anc.slice(0, 3));
    if (seen !== top) throw new Error(`${target} is shadowed at line ${n.loc.start.line}`);
  }
  if (p.type === 'CallExpression' && p.callee === n) {
    const open = src.indexOf('(', n.end);
    edits.push({ start: n.start, end: open, text: target });
  } else {
    if (/\./.test(target) && extract == null) console.warn(`note: non-call use of ${target} at line ${n.loc.start.line} loses its receiver`);
    edits.push({ start: n.start, end: n.end, text: target });
  }
}
// remove the definition (and extract the function body when asked)
let fnText = '';
const valueNode = def.kind === 'prop' ? def.prop.value : def.rhs;
if (extract) {
  const f = valueNode;
  if (!(f.type === 'ArrowFunctionExpression' || f.type === 'FunctionExpression')) throw new Error('--extract needs an inline function');
  if (A.bindings.some((b) => b.name === extract)) throw new Error(`${extract} already exists`);
  const dest = ancestorsOf(ast, def.stmt).slice(0, -1);
  const bad = moveProblems(A, f, dest);
  if (bad.length) throw new Error(`extracted function uses bindings not visible at the destination: ${bad.join(', ')}`);
  const body = f.body.type === 'BlockStatement' ? T(f.body) : `{return ${T(f.body)}}`;
  fnText = `${f.async ? 'async ' : ''}function ${extract}(${f.params.map(T).join(',')})${body}\n`;
  if (/\bthis\b|\barguments\b/.test(T(f.body)) && f.type === 'ArrowFunctionExpression') throw new Error('arrow uses this/arguments');
}
if (def.kind === 'assign') {
  if (def.stmt.expression !== def.node) throw new Error('assignment is not a plain statement');
  edits.push({ start: def.stmt.start, end: def.stmt.end, text: fnText });
} else {
  const props = def.obj.properties, i = props.indexOf(def.prop);
  if (props.length === 1) edits.push({ start: def.prop.start, end: def.prop.end, text: '' });
  else if (i < props.length - 1) edits.push({ start: def.prop.start, end: props[i + 1].start, text: '' });
  else edits.push({ start: props[i - 1].end, end: def.prop.end, text: '' });
  if (fnText) edits.push({ start: def.stmt.start, end: def.stmt.start, text: fnText });
}
edits.sort((a, b) => b.start - a.start || b.end - a.end);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error(`overlapping edits near ${edits[i].start}`);
for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);
acorn.parse(src, { ecmaVersion: 'latest' });
if (!dry) fs.writeFileSync(file, src);
console.log(`${bridge}.${member} -> ${target}${extract ? ' (extracted)' : ''}: ${readsFound.length} read(s)`);
