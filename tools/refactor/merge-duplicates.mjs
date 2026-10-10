#!/usr/bin/env node
// Refactor tool: keep one of several functions with identical bodies and point every
// reference of the others at it.
//   node tools/refactor/merge-duplicates.mjs <file> <keep> <dup> [<dup> ...] [--as newName] [--dry]
// Each name must have exactly one declaration. Bodies are compared as text with whitespace
// removed and the function's own name normalised, and every free identifier in the kept body
// must resolve to the same binding as in each duplicate (so a helper that closes over a
// different local is never merged).
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const asIdx = args.indexOf('--as');
const newName = asIdx >= 0 ? args[asIdx + 1] : null;
const positional = args.filter((a, i) => !a.startsWith('--') && !(asIdx >= 0 && i === asIdx + 1));
const [file, keepSpec, ...dupSpecs] = positional;
const keep = keepSpec.split('@')[0];
const dups = dupSpecs;
let src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A = analyze(ast);
const T = (n) => src.slice(n.start, n.end);
const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
// name, name@line or name@top (when the same name is declared in several scopes)
const one = (spec) => {
  const [name, line] = spec.split('@');
  const outerScope = ast.body[0]?.expression?.callee?.body;
  const bs = A.bindings.filter((b) => b.name === name && (!line || (line === 'top' ? b.scope === outerScope : b.idNode.loc.start.line === +line)) && (b.kind === 'function' || ((b.kind === 'const' || b.kind === 'let') && isFn(b.decl?.init))));
  if (bs.length !== 1) throw new Error(`${name}: ${bs.length} function bindings`);
  const b = bs[0];
  const fn = b.kind === 'function' ? b.decl : b.decl.init;
  return { b, fn };
};
const norm = ({ b, fn }) => (fn.params.map(T).join(',') + '|' + T(fn.body)).replace(/\s+/g, '').split(b.name).join('§');
const freeRefs = ({ fn }) => A.refs.filter((r) => r.node.start >= fn.start && r.node.end <= fn.end && r.binding && !(r.binding.scope.start >= fn.start && r.binding.scope.end <= fn.end)).map((r) => `${r.node.name}#${r.binding.id}`).sort().join(',');
const K = one(keepSpec);
for (const d of dups) {
  const D = one(d);
  const dn = d.split('@')[0];
  if (norm(D) !== norm(K)) throw new Error(`${d}: body differs from ${keep}`);
  if (freeRefs(D).replace(new RegExp(`\\b${dn}#\\d+`, 'g'), '') !== freeRefs(K).replace(new RegExp(`\\b${keep}#\\d+`, 'g'), '')) throw new Error(`${d}: closes over different bindings than ${keep}`);
}
const edits = [];
for (const d of dups) {
  const D = one(d);
  for (const r of D.b.refs) {
    if (r.node.start >= D.fn.start && r.node.end <= D.fn.end) continue;
    const p = r.parent;
    if (p.type === 'Property' && p.shorthand && p.value === r.node) edits.push({ start: p.start, end: p.end, text: `${d.split('@')[0]}:${keep}` });
    else edits.push({ start: r.node.start, end: r.node.end, text: keep });
  }
  let stmt = D.b.kind === 'function' ? D.fn : null;
  if (!stmt) walk.full(ast, (n) => { if (n.type === 'VariableDeclaration' && n.declarations.length === 1 && n.declarations[0] === D.b.decl) stmt = n; });
  if (!stmt) throw new Error(`${d}: declaration shares a statement`);
  edits.push({ start: stmt.start, end: stmt.end, text: '\u0001' });
}
edits.sort((a, b) => b.start - a.start);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error('overlapping edits');
for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);
src = src.split('\n').filter((l) => !(l.includes('\u0001') && /^[\s\u0001;]*$/.test(l))).join('\n').replaceAll('\u0001', '');
acorn.parse(src, { ecmaVersion: 'latest' });
if (!dry) fs.writeFileSync(file, src);
console.log(`${dups.join(', ')} -> ${keep}`);
if (newName) {
  const { execFileSync } = await import('node:child_process');
  if (!dry) console.log(execFileSync(process.execPath, [new URL('./rename.mjs', import.meta.url).pathname, file, keep, newName]).toString().trim());
}
