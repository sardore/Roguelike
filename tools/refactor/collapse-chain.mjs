#!/usr/bin/env node
// Refactor tool: collapse a function rebinding chain whose last layer is a full replacement
// (it never calls an earlier layer). Every earlier layer is dead: the declaration takes the
// final layer's parameters and body, the reassignments and their aliases are deleted.
//
//   node tools/refactor/collapse-chain.mjs <file> <name> [<name> ...] [--dry]
//
// Refuses when an alias of a dead layer is used outside the dead layers, when the final
// layer is an arrow function that uses `this`/`arguments`, or when a reassignment is not a
// plain top-level statement. Earlier-than-final calls must be ruled out separately
// (tools/refactor/chain-probe.mjs + tests/chain-probe-run.mjs).
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const args = process.argv.slice(2);
const file = args[0];
const dry = args.includes('--dry');
const names = args.slice(1).filter((a) => !a.startsWith('--'));
let src = fs.readFileSync(file, 'utf8');
const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');

for (const name of names) {
  const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
  const A = analyze(ast);
  const T = (n) => src.slice(n.start, n.end);
  const candidates = A.bindings.filter((b) => b.name === name && (b.kind === 'function' || (isFn(b.decl?.init) && b.kind !== 'param')) && b.refs.some((r) => r.parent.type === 'AssignmentExpression' && r.parent.left === r.node));
  if (candidates.length !== 1) throw new Error(`${name}: expected one rebound function binding, found ${candidates.length}`);
  const b = candidates[0];
  const assigns = b.refs.filter((r) => r.parent.type === 'AssignmentExpression' && r.parent.left === r.node);
  for (const r of assigns) if (!isFn(r.parent.right)) throw new Error(`${name}: non-function assignment at line ${r.node.loc.start.line}`);
  const final = assigns.at(-1).parent.right;
  const aliases = b.refs.filter((r) => r.parent.type === 'VariableDeclarator' && r.parent.init === r.node).map((r) => A.bindings.find((x) => x.decl === r.parent));
  // The final layer must not use any alias (it is a full replacement).
  for (const al of aliases) if (al.refs.some((x) => x.node.start >= final.start && x.node.end <= final.end)) throw new Error(`${name}: final layer calls ${al.name}; not a full replacement`);
  // Dead aliases may only be used inside dead layers.
  const deadRanges = assigns.slice(0, -1).map((r) => r.parent.right);
  for (const al of aliases) for (const x of al.refs) {
    if (!deadRanges.some((f) => x.node.start >= f.start && x.node.end <= f.end)) throw new Error(`${name}: alias ${al.name} used outside dead layers at line ${x.node.loc.start.line}`);
  }
  if (final.type === 'ArrowFunctionExpression') {
    let bad = false;
    walk.ancestor(final.body, {
      ThisExpression(_n, _s, anc) { if (!anc.some((a) => a.type === 'FunctionExpression' || a.type === 'FunctionDeclaration')) bad = true; },
      Identifier(n, _s, anc) { if (n.name === 'arguments' && !anc.some((a) => a.type === 'FunctionExpression' || a.type === 'FunctionDeclaration')) bad = true; },
    });
    if (bad) throw new Error(`${name}: final arrow uses this/arguments`);
  }
  const edits = [];
  // 1. declaration gets the final layer
  const params = final.params.map(T).join(',');
  const body = final.body.type === 'BlockStatement' ? T(final.body) : `{return ${T(final.body)}}`;
  const prefix = final.async ? 'async ' : '';
  if (b.kind === 'function') edits.push({ start: b.decl.start, end: b.decl.end, text: `${prefix}function ${name}(${params})${body}` });
  else edits.push({ start: b.decl.init.start, end: b.decl.init.end, text: final.type === 'ArrowFunctionExpression' ? `${prefix}(${params})=>${final.body.type === 'BlockStatement' ? T(final.body) : T(final.body)}` : `${prefix}function(${params})${body}` });
  // 2. every reassignment statement
  for (const r of assigns) {
    const stmt = r.ancestors.at(-1).type === 'ExpressionStatement' ? r.ancestors.at(-1) : r.ancestors.findLast((a) => a.type === 'ExpressionStatement');
    if (!stmt || stmt.expression !== r.parent) throw new Error(`${name}: reassignment at line ${r.node.loc.start.line} is not a plain statement`);
    edits.push({ start: stmt.start, end: stmt.end, text: '' });
  }
  // 3. alias declarations
  for (const al of aliases) {
    const vd = al.refs.length >= 0 && (() => { let hit = null; walk.full(ast, (n) => { if (n.type === 'VariableDeclaration' && n.declarations.includes(al.decl)) hit = n; }); return hit; })();
    if (vd.declarations.length === 1) edits.push({ start: vd.start, end: vd.end, text: '' });
    else {
      const i = vd.declarations.indexOf(al.decl);
      const next = vd.declarations[i + 1], prev = vd.declarations[i - 1];
      edits.push(next ? { start: al.decl.start, end: next.start, text: '' } : { start: prev.end, end: al.decl.end, text: '' });
    }
  }
  edits.sort((x, y) => y.start - x.start);
  for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error(`${name}: overlapping edits`);
  for (const e of edits) src = src.slice(0, e.start) + (e.text === '' ? '\u0001' : e.text) + src.slice(e.end);
  src = src.split('\n').filter((l) => !(l.includes('\u0001') && /^[\s\u0001;]*$/.test(l))).join('\n').replaceAll('\u0001', '');
  acorn.parse(src, { ecmaVersion: 'latest' });
  console.log(`${name}: ${assigns.length} reassignments and ${aliases.length} aliases folded into the declaration`);
}
if (!dry) fs.writeFileSync(file, src);
