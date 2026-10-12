#!/usr/bin/env node
// Refactor tool: turns the registration calls of ONE stage table into an array literal in the table's declaration and
// named function declarations for the stages, in the work file (node tools/game.mjs assemble ... split).
//   node tools/refactor/stage-table.mjs <work.js> <spec.json> [--dry]
// spec: {
//   "table": "PLAYER_STAT_STAGES55",
//   "names": { "<id>": "functionName", ... },     bare tables (move hooks, effects): "<phase>#<n>" counted per phase
//   "dest":  { "functionName": "combat.js", ... }, file that receives the new function declaration
//   "remove": ["registerPlayerStatStage55"]       register functions to delete (they must have no other use)
// }
// A stage that already is a top-level function (an identifier argument) is referenced as it is. A new function takes the
// stage's parameters and body text unchanged (an expression body becomes `{return <expr>}`), so a hash of parameters+body
// (tests/scenarios.mjs stageBody) is the same before and after. Entries keep the registration (= source) order.
import fs from 'node:fs';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';
import { REGISTERS, DIRECT_TABLES } from '../lib/stage-tables.mjs';

const [work, specFile] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const text = fs.readFileSync(work, 'utf8');
const ast = acorn.parse(text, { ecmaVersion: 'latest' });
const closure = ast.body[0].expression.callee.body;
const A = analyze(ast);
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index, end: m.index + m[0].length }));
const fileAt = (pos) => { let cur = null; for (const m of marks) if (m.at <= pos) cur = m.file; return cur; };

const table = spec.table;
const regs = Object.entries(REGISTERS).filter(([, r]) => r.table === table);
const direct = DIRECT_TABLES.includes(table);
if (!regs.length && !direct) throw new Error(`${table} is not a stage table`);

const calls = [];
for (const stmt of closure.body) {
  if (stmt.type !== 'ExpressionStatement' || stmt.expression.type !== 'CallExpression') continue;
  const call = stmt.expression, cal = call.callee;
  const reg = cal.type === 'Identifier' ? regs.find(([n]) => n === cal.name) : null;
  if (reg) calls.push({ stmt, call, reg: reg[1], via: reg[0] });
  else if (direct && cal.type === 'MemberExpression' && cal.object.name === table && cal.property.name === 'push') calls.push({ stmt, call, reg: { shape: 'bare', phase: null, fnArg: 0 }, via: 'push' });
}
if (!calls.length) throw new Error(`no registration of ${table} found`);

const slice = (n) => text.slice(n.start, n.end);
const taken = new Set(A.bindings.filter((b) => b.scope === closure).map((b) => b.name));
const newFns = []; // { name, dest, text }
const counters = {};
function stageRef(node, key) {
  if (!node) return 'undefined';
  if (node.type === 'Identifier') return node.name;
  const name = spec.names?.[key];
  if (!name) throw new Error(`${table}: no name given for the stage "${key}"`);
  if (taken.has(name)) throw new Error(`${table}: the name ${name} is already used`);
  taken.add(name);
  const dest = spec.dest?.[name];
  if (!dest) throw new Error(`${table}: no destination file for ${name}`);
  let fn;
  if (node.type === 'ArrowFunctionExpression') {
    if (node.async || node.generator) throw new Error(`${key}: async arrow`);
    const first = node.params[0], last = node.params.at(-1);
    let params;
    if (!node.params.length) params = '';
    else if (text[node.start] === '(') params = text.slice(node.start + 1, text.lastIndexOf(')', node.body.start - 1));
    else params = slice(first);
    void last;
    const body = node.body.type === 'BlockStatement' ? slice(node.body) : `{return ${slice(node.body)}}`;
    fn = `function ${name}(${params})${body}`;
  } else if (node.type === 'FunctionExpression') {
    const head = text.indexOf('(', node.id ? node.id.end : node.start);
    fn = `function ${name}${text.slice(head, node.end)}`;
  } else throw new Error(`${key}: unsupported stage node ${node.type}`);
  newFns.push({ name, dest, text: fn });
  return name;
}

const entries = {}; // phase -> [text]
let n = 0;
for (const c of calls) {
  const { reg, call } = c;
  const id = reg.idArg != null ? call.arguments[reg.idArg].value : null;
  const phase = reg.phase || (reg.phaseArg != null ? call.arguments[reg.phaseArg].value : '');
  const arg = call.arguments[reg.fnArg];
  const key = reg.shape === 'bare' ? `${phase || 'all'}#${(counters[phase] = (counters[phase] ?? -1) + 1)}` : id + (reg.phaseArg != null && reg.shape === 'fn' ? `|${phase}` : '');
  let e;
  if (reg.shape === 'bare') e = stageRef(arg, key);
  else if (reg.shape === 'run') e = `{id:${JSON.stringify(id).replace(/"/g, "'")},run:${stageRef(arg, key)}}`;
  else if (reg.shape === 'fn') e = `{id:'${id}',fn:${stageRef(arg, key)}}`;
  else if (reg.shape === 'pickup') {
    const get = (k) => arg.properties.find((p) => p.key.name === k)?.value;
    e = `{id:'${id}',pre:${stageRef(get('pre'), key + '.pre')},post:${stageRef(get('post'), key + '.post')}}`;
  }
  (entries[phase] ||= []).push(e);
  n++;
}

// the table declaration
const decl = closure.body.find((s) => s.type === 'VariableDeclaration' && s.declarations.some((d) => d.id.name === table));
if (!decl) throw new Error(`${table} is not declared at the top level`);
const d = decl.declarations.find((x) => x.id.name === table);
const list = (p) => `[${(entries[p] || []).join(',')}]`;
let literal;
if (table === 'MOVE_HOOKS_R8' || table === 'BOSS_REWARD_STAGES') literal = `{pre:${list('pre')},post:${list('post')}}`;
else if (table === 'MANRU_PICKUP_PIPELINE_R25') literal = `{stages:${list('')},handlers:[]}`;
else if (table === 'INVENTORY_RENDER_R34') literal = `{core:${(entries.core || [null])[0]},pre:${list('pre')},post:${list('post')}}`;
else literal = list('');

const edits = [{ start: d.init.start, end: d.init.end, text: literal }];
for (const c of calls) edits.push({ start: c.stmt.start, end: c.stmt.end, text: '\u0001' });
// register functions that are no longer used
const removed = new Set(calls.map((c) => c.stmt));
for (const name of spec.remove || []) {
  const b = A.bindings.find((x) => x.name === name && x.scope === closure);
  if (!b) throw new Error(`${name} is not a top-level function`);
  const used = b.refs.filter((r) => !removed.has(closure.body.find((s) => s.start <= r.node.start && r.node.end <= s.end)));
  const own = closure.body.find((s) => s.type === 'FunctionDeclaration' && s.id.name === name);
  const outside = used.filter((r) => !(own && r.node.start >= own.start && r.node.end <= own.end));
  if (outside.length) throw new Error(`${name} is still used outside the registrations`);
  edits.push({ start: own.start, end: own.end, text: '\u0001' });
}
// new function declarations go to the end of their file's segment
const byFile = {};
for (const f of newFns) (byFile[f.dest] ||= []).push(f.text);
for (const [file, fns] of Object.entries(byFile)) {
  const m = marks.find((x) => x.file === file);
  if (!m) throw new Error(`no segment ${file}`);
  const next = marks.find((x) => x.at > m.at);
  const at = next ? next.at : text.indexOf('\n})();', m.at);
  edits.push({ start: at, end: at, text: fns.join('\n') + '\n' });
}
edits.sort((a, b) => b.start - a.start);
let out = text;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
// a line that only held removed statements disappears; a statement removed from a longer line leaves the rest
out = out.split('\n').flatMap((l) => (l.includes('\u0001') ? (l.replace(/\u0001/g, '').trim() === '' ? [] : [l.replace(/\u0001/g, '')]) : [l])).join('\n');
console.log(`${table}: ${n} stages -> ${newFns.length} new functions (${newFns.map((f) => `${f.name}@${f.dest}`).join(', ') || 'none'}); table now in ${fileAt(d.start)}`);
if (!dry) fs.writeFileSync(work, out);
