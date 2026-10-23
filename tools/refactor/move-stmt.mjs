#!/usr/bin/env node
// Refactor tool: move statements that publish a global (`globalThis.NAME = …` / `window.NAME = …`) from spine.js to the
// end of another game file of the work file (node tools/game.mjs assemble … split).
//   node tools/refactor/move-stmt.mjs <work.js> <target.js> <names.txt> --reads <pub-reads.json> [--dry]
// names.txt: one published name per line (`NAME#2` for the second statement that publishes NAME). The statement must:
//   - be a top-level expression statement of that form in spine.js;
//   - not be read while the closure loads before it is published (pub-reads.mjs; a read before it would start to see the value);
//   - make no calls when it runs except Object.freeze, and use no `let`/`var` that is assigned elsewhere;
//   - use, when it runs (not inside a nested function), no non-function binding declared in spine.js or in a file after the target
//     (function declarations are hoisted, so naming them is fine anywhere).
// Anything else is refused with the reason, and nothing is written (exit 1).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const pos = args.filter((a, i) => !a.startsWith('--') && !['--reads', '--manifest'].includes(args[i - 1]));
const [workFile, target, namesFile] = pos;
const dry = args.includes('--dry');
if (!workFile || !target || !namesFile || !opt('--reads')) { console.error('usage: node tools/refactor/move-stmt.mjs <work.js> <target.js> <names.txt> --reads <pub-reads.json> [--dry]'); process.exit(2); }

const text = fs.readFileSync(workFile, 'utf8');
const reads = JSON.parse(fs.readFileSync(opt('--reads'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.resolve(opt('--manifest') || path.join(repo, 'src', 'game', 'manifest.json')), 'utf8'));
const order = [...manifest.closure];
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index }));
const segOf = (p) => { let c = null; for (const m of marks) if (m.at <= p) c = m.file; return c; };
if (!order.includes(target) || target === 'spine.js') { console.error(`${target} is not a game file before spine.js`); process.exit(1); }
if (!marks.some((m) => m.file === target)) { console.error(`${target} is not in the work file`); process.exit(1); }

const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const body = ast.body[0].expression.callee.body;
const A = analyze(ast);
const closureFn = ast.body[0].expression.callee;
const wanted = fs.readFileSync(namesFile, 'utf8').split('\n').map((l) => l.replace(/#(?!\d).*/, '').trim()).filter(Boolean);

// every publish statement in spine.js, with its ordinal among those of the same name
const stmts = [], seen = {};
for (const s of body.body) {
  if (segOf(s.start) !== 'spine.js' || s.type !== 'ExpressionStatement' || s.expression.type !== 'AssignmentExpression') continue;
  const m = /^(?:window|globalThis)\.([\w$]+)$/.exec(text.slice(s.expression.left.start, s.expression.left.end));
  if (!m) continue;
  seen[m[1]] = (seen[m[1]] || 0) + 1;
  stmts.push({ s, name: m[1], nth: seen[m[1]] });
}
const problems = [], chosen = [];
for (const w of wanted) {
  const [name, nth] = w.split('#');
  const hits = stmts.filter((x) => x.name === name && (nth ? x.nth === +nth : true));
  if (hits.length !== 1) { problems.push(`${w}: ${hits.length} publish statements in spine.js${hits.length > 1 ? ' (use NAME#n)' : ''}`); continue; }
  const { s } = hits[0], rhs = s.expression.right;
  const rd = reads[name];
  if (!rd) { problems.push(`${w}: no measurement in the reads file`); continue; }
  if (rd.before > 0) { problems.push(`${w}: read ${rd.before}x while loading before it is published`); continue; }
  const nestedFn = (r) => r.ancestors.some((a) => /Function/.test(a.type) && a.start >= rhs.start && a !== closureFn);
  let ok = true;
  const call = [];
  (function walk(n, inFn) {
    if (!n || typeof n.type !== 'string') return;
    const fn = /Function/.test(n.type);
    if (n.type === 'CallExpression' && !inFn) { const c = text.slice(n.callee.start, n.callee.end); if (c !== 'Object.freeze') call.push(c.slice(0, 40)); }
    if ((n.type === 'NewExpression' || n.type === 'AwaitExpression') && !inFn) call.push(n.type);
    for (const k in n) { if (k === 'loc') continue; const v = n[k]; if (Array.isArray(v)) v.forEach((x) => walk(x, inFn || fn)); else if (v && typeof v.type === 'string') walk(v, inFn || fn); }
  })(rhs, false);
  if (call.length) { problems.push(`${w}: makes a call when it runs: ${call.join(', ')}`); continue; }
  for (const r of A.refs) {
    if (r.node.start < rhs.start || r.node.end > rhs.end || !r.binding || r.binding.scope !== body || nestedFn(r)) continue;
    const b = r.binding, f = segOf(b.idNode.start);
    if (b.kind === 'function') continue;
    if (f === 'spine.js') { problems.push(`${w}: ${b.name} (${b.kind}) is declared in spine.js`); ok = false; break; }
    if (order.indexOf(f) > order.indexOf(target)) { problems.push(`${w}: ${b.name} is declared in ${f}, after ${target}`); ok = false; break; }
    if ((b.kind === 'let' || b.kind === 'var') && b.refs.some((x) => x.parent && x.parent.type === 'AssignmentExpression' && x.parent.left === x.node)) { problems.push(`${w}: ${b.name} is a ${b.kind} that is assigned elsewhere`); ok = false; break; }
  }
  if (ok) chosen.push(hits[0]);
}
if (problems.length) { console.log(problems.join('\n')); console.error(`${problems.length} statement(s) refused; nothing written`); process.exit(1); }

const m = marks.find((x) => x.file === target), next = marks.find((x) => x.at > m.at);
const at = next ? next.at : text.indexOf('\n})();', m.at);
const edits = chosen.map(({ s }) => ({ start: s.start, end: s.end, text: '\u0001' }));
edits.push({ start: at, end: at, text: chosen.map(({ s }) => text.slice(s.start, s.end)).join('\n') + '\n' });
edits.sort((a, b) => b.start - a.start);
let out = text;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
out = out.split('\n').flatMap((l) => (l.includes('\u0001') ? (l.replace(/\u0001/g, '').trim() === '' ? [] : [l.replace(/\u0001/g, '')]) : [l])).join('\n');
acorn.parse(out, { ecmaVersion: 'latest' }); // the result must still parse
console.log(`moved ${chosen.length} publish statements into ${target}: ${chosen.map((c) => c.name).join(', ')}`);
if (!dry) fs.writeFileSync(workFile, out);
