#!/usr/bin/env node
// Refactor tool: a `let X;` that is assigned a function exactly once by a loose top-level statement (`X=function name(){...}`) becomes
// a function declaration X in a domain file; the `let` and the assignment statement go. Works on the work file.
//   node tools/refactor/let-to-function.mjs <work.js> <spec.json> [--dry]
// spec: { "items": [ { "name": "updatePanels", "dest": "render.js" } ] }
// Refused, nothing written (exit 1): more than one write to X, an initialiser on the let, an assignment that is not a plain function
// expression (async, generator, arrow), a function that mentions its own expression name, a load-time read of X that stands before the
// assignment statement (a function declaration would exist earlier than the let did). Reads made later by functions that run while
// loading are not visible here: measure them with tools/refactor/load-reads.mjs (the `undef` count of a name is its reads of undefined).
import fs from 'node:fs';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';

const [work, specFile] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const text = fs.readFileSync(work, 'utf8');
const fail = (m) => { console.error(m); process.exit(1); };
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const closure = ast.body[0].expression.callee.body, top = closure.body;
const A = analyze(ast);
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index }));
const deferred = (anc) => anc.some((a, i) => /Function/.test(a.type) && !(i > 0 && anc[i - 1].type === 'CallExpression' && anc[i - 1].callee === a));
const edits = [], appended = {};
for (const it of spec.items) {
  const b = A.bindings.find((x) => x.name === it.name && x.scope === closure);
  if (!b || b.kind !== 'let') fail(`${it.name}: not a top-level let`);
  const writes = b.refs.filter((r) => { const anc = [...r.ancestors, r.node]; return anc.some((a, i) => i + 1 < anc.length && a.type === 'AssignmentExpression' && a.left === anc[i + 1]); });
  if (writes.length !== 1) fail(`${it.name}: ${writes.length} writes (exactly one expected)`);
  const declStmt = top.find((s) => s.type === 'VariableDeclaration' && s.declarations.some((d) => d.id === b.idNode));
  const declarator = declStmt.declarations.find((d) => d.id === b.idNode);
  if (declarator.init) fail(`${it.name}: the let has an initialiser`);
  const assignStmt = top.find((s) => s.start <= writes[0].node.start && writes[0].node.end <= s.end);
  const e = assignStmt.type === 'ExpressionStatement' ? assignStmt.expression : null;
  if (!e || e.type !== 'AssignmentExpression' || e.operator !== '=' || e.left.type !== 'Identifier' || e.left.name !== it.name) fail(`${it.name}: the assignment is not a plain statement \`${it.name}=...\``);
  const fn = e.right;
  if (fn.type !== 'FunctionExpression' || fn.async || fn.generator) fail(`${it.name}: the assigned value is not a plain function expression`);
  if (fn.id && fn.id.name !== it.name) { let own = false; (function walk(n) { if (!n || typeof n.type !== 'string') return; if (n.type === 'Identifier' && n.name === fn.id.name) own = true; for (const k in n) { if (k === 'loc') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); } })(fn.body); if (own) fail(`${it.name}: the function mentions its own name ${fn.id.name}`); }
  const assignIdx = top.indexOf(assignStmt);
  for (const r of b.refs) {
    if (r === writes[0]) continue;
    const anc = [...r.ancestors, r.node];
    if (deferred(anc)) continue;
    const owner = top.find((s) => s.start <= r.node.start && r.node.end <= s.end);
    if (top.indexOf(owner) < assignIdx) fail(`${it.name}: read at load time before the assignment (line ${r.node.loc.start.line})`);
  }
  if (!marks.find((m) => m.file === it.dest)) fail(`${it.name}: no file ${it.dest}`);
  const params = fn.params.length ? text.slice(fn.params[0].start, fn.params.at(-1).end) : '';
  const bodyText = text.slice(fn.body.start, fn.body.end);
  (appended[it.dest] ||= []).push(`function ${it.name}(${params})${bodyText}\n`);
  // remove the assignment statement (with its line) and the declarator (or the whole let statement)
  const whole = (s) => { const ls = text.lastIndexOf('\n', s.start - 1) + 1, le = text.indexOf('\n', s.end); return text.slice(ls, s.start).trim() === '' && text.slice(s.end, le < 0 ? text.length : le).trim() === '' ? { start: ls, end: le < 0 ? text.length : le + 1 } : { start: s.start, end: s.end }; };
  edits.push({ ...whole(assignStmt), text: '' });
  if (declStmt.declarations.length === 1) edits.push({ ...whole(declStmt), text: '' });
  else {
    const after = text.slice(declarator.end).match(/^\s*,/);
    if (after) edits.push({ start: declarator.start, end: declarator.end + after[0].length, text: '' });
    else { const before = text.slice(0, declarator.start).match(/,\s*$/); edits.push({ start: declarator.start - before[0].length, end: declarator.end, text: '' }); }
  }
}
edits.sort((a, b) => b.start - a.start);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) fail('overlapping edits');
let out = text;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
for (const [file, fns] of Object.entries(appended)) {
  const m = [...out.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)];
  const k = m.findIndex((x) => x[1] === file);
  const at = k + 1 < m.length ? m[k + 1].index : out.indexOf('\n})();', m[k].index);
  out = out.slice(0, at) + (out.slice(0, at).endsWith('\n') ? '' : '\n') + fns.join('') + out.slice(at);
}
acorn.parse(out, { ecmaVersion: 'latest' });
console.log(`${spec.items.length} lets became functions: ${spec.items.map((i) => `${i.name}@${i.dest}`).join(', ')}`);
if (!dry) fs.writeFileSync(work, out);
