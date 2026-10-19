#!/usr/bin/env node
// Refactor tool: turns the registration calls of ONE registry of the game into entries of its declaration, in the work
// file (node tools/game.mjs assemble … split), and gives inline stage functions a name.
//   node tools/refactor/registry-table.mjs <work.js> <spec.json> [--dry]
// spec: {
//   "callees": ["ActionDispatcher.register"],        call targets, as written (an identifier or a member path)
//   "container": { "decl": "ACTION_ROUTES5", "kind": "map" }                      `new Map()` -> `new Map([[…],…])`
//             | { "decl": "TurnEngine", "kind": "prop", "prop": "stages" }       `stages:[]` inside the declaration's object literal
//             | { "decl": "X", "kind": "prop", "prop": "{phase}" }                the property named by the call's phase argument
//             | { "decl": "X", "kind": "array" }                                  `[]` as the declaration's initialiser
//             | { "decl": "X", "kind": "value", "prop": "base" }                  a property that is `null` and is SET by the calls: the calls overwrite
//                                                                                 each other, so the property takes the LAST call's entry and the earlier
//                                                                                 calls are dropped (they must not be read in between: measure first)
//   "entry": { "form": "pair" }                                  [<arg0>, <fn arg1>]
//          | { "form": "obj", "fields": { "id": 0, "fn": 1 } }  {id:<arg0>, fn:<fn arg1>}; a number is an argument index
//          | { "form": "obj", "fields": { "id": 0, "pre": "1.pre", "post": "1.post" }, "defaults": { "pre": "null", "post": "null" } }
//                                                                 "1.pre": the property pre of the object literal in argument 1
//   "phaseArg": 1,                                                the argument that names the phase/property (container kind prop with "{phase}")
//   "fnFields": ["fn","pre","post"],                              fields whose value is a stage function (inline functions get a name)
//   "names": { "<id>": "functionName" }, "dest": { "functionName": "combat.js" },   inline function -> declaration in that file
//   "autoName": { "suffix": "Route", "defaultDest": "save.js" }   instead of "names"/"dest": the name is the id without digits, in camelCase, plus
//                                                                 the suffix (a trailing "-pre"/"-post" stays); the file is the one whose declarations
//                                                                 the function uses most (outside spine.js), else defaultDest
//   "removeFunctions": ["registerMinimapHook"],                   deleted when nothing but the handled calls used them
//   "removeMembers": [{ "decl": "TurnEngine", "member": "register" }]   a method/property deleted from the declaration's object literal
// }
// The handled calls are top-level expression statements; every call of a callee anywhere in the program must be one of them
// (otherwise the tool stops). Entries keep the source order of the calls. A new function takes the stage's parameters and body
// text unchanged. Refused, nothing is written: exit 1.
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
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index }));
const slice = (n) => text.slice(n.start, n.end);
const fail = (msg) => { console.error(msg); process.exit(1); };

const calleeText = (c) => slice(c).replace(/\s+/g, '');
const wantedCallees = new Set(spec.callees);
const allCalls = [];
(function walk(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'CallExpression' && wantedCallees.has(calleeText(n.callee))) allCalls.push(n);
  for (const k in n) { if (k === 'loc') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); }
})(ast);
const handled = closure.body.filter((s) => s.type === 'ExpressionStatement' && s.expression.type === 'CallExpression' && wantedCallees.has(calleeText(s.expression.callee)));
if (!handled.length) fail(`no top-level call of ${spec.callees.join(', ')} found`);
if (allCalls.length !== handled.length) fail(`${allCalls.length} calls of ${spec.callees.join(', ')} in the program but ${handled.length} are top-level statements: the others (line ${allCalls.find((c) => !handled.some((h) => h.expression === c)).loc.start.line}) must be handled first`);

const taken = new Set(A.bindings.filter((b) => b.scope === closure).map((b) => b.name));
const newFns = [];
const camel = (k) => String(k).replace(/[0-9]+/g, '').split(/[^A-Za-z]+/).filter(Boolean).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join('');
const segOf = (pos) => { let c = null; for (const m of marks) if (m.at <= pos) c = m.file; return c; };
function plurality(node) {
  const cnt = {};
  for (const r of A.refs) {
    if (r.node.start < node.start || r.node.end > node.end || !r.binding || r.binding.scope !== closure) continue;
    const f = segOf(r.binding.idNode.start);
    if (f === 'spine.js' || f === 'qa/qa.js' || f === 'kernel.js') continue; // kernel is used by everything: it says nothing about where a function belongs
    cnt[f] = (cnt[f] || 0) + 1;
  }
  return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}
const decisions = [];
function fnRef(node, key) {
  if (!node) return 'null';
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'Literal' && node.value === null) return 'null';
  if (spec.autoName) {
    const name = camel(key) + spec.autoName.suffix;
    if (!spec.dest) spec.dest = {};
    spec.dest[name] ||= plurality(node) || spec.autoName.defaultDest;
    spec.names = { ...(spec.names || {}), [key]: name };
  }
  const name = spec.names?.[key];
  if (!name) fail(`no name given for the function of "${key}"`);
  decisions.push(`${key} -> ${name} (${spec.dest?.[name]})`);
  if (taken.has(name)) fail(`the name ${name} is already used`);
  taken.add(name);
  const dest = spec.dest?.[name];
  if (!dest) fail(`no destination file for ${name}`);
  let fn;
  if (node.type === 'ArrowFunctionExpression') {
    if (node.async || node.generator) fail(`${key}: async arrow`);
    if (/\b(this|arguments)\b/.test(slice(node))) fail(`${key}: an arrow function that uses this/arguments cannot become a function declaration`);
    const params = !node.params.length ? '' : text[node.start] === '(' ? text.slice(node.start + 1, text.lastIndexOf(')', node.body.start - 1)) : slice(node.params[0]);
    fn = `function ${name}(${params})${node.body.type === 'BlockStatement' ? slice(node.body) : `{return ${slice(node.body)}}`}`;
  } else if (node.type === 'FunctionExpression') {
    if (node.async || node.generator) fail(`${key}: async/generator function`);
    const head = text.indexOf('(', node.id ? node.id.end : node.start);
    fn = `function ${name}${text.slice(head, node.end)}`;
  } else fail(`${key}: unsupported function node ${node.type}`);
  newFns.push({ name, dest, text: fn });
  return name;
}

const lastOnly = spec.container.kind === 'value';
const entries = {};
const fnFields = new Set(spec.fnFields || ['fn']);
for (const st of lastOnly ? handled.slice(-1) : handled) {
  const args = st.expression.arguments;
  const idText = slice(args[0]);
  const key = args[0].type === 'Literal' ? String(args[0].value) : idText;
  const phase = spec.phaseArg != null ? String(args[spec.phaseArg].value) : '';
  let e;
  if (spec.entry.form === 'pair') e = `[${idText},${fnRef(args[1], key)}]`;
  else {
    const parts = [];
    for (const [field, src] of Object.entries(spec.entry.fields)) {
      let node;
      if (typeof src === 'number') node = args[src];
      else {
        const [ai, prop] = src.split('.');
        const o = args[+ai];
        node = o?.type === 'ObjectExpression' ? o.properties.find((p) => (p.key.name ?? p.key.value) === prop)?.value : undefined;
      }
      if (node === undefined) {
        if (spec.entry.defaults && field in spec.entry.defaults) { parts.push(`${field}:${spec.entry.defaults[field]}`); continue; }
        fail(`${key}: no value for ${field}`);
      }
      parts.push(`${field}:${fnFields.has(field) ? fnRef(node, `${key}${phase ? '|' + phase : ''}${field === 'fn' ? '' : '.' + field}`) : slice(node)}`);
    }
    e = `{${parts.join(',')}}`;
  }
  (entries[phase] ||= []).push(e);
}

const declStmt = closure.body.find((s) => s.type === 'VariableDeclaration' && s.declarations.some((d) => d.id.name === spec.container.decl));
if (!declStmt) fail(`${spec.container.decl} is not declared at the top level`);
const d = declStmt.declarations.find((x) => x.id.name === spec.container.decl);
const edits = [];
const objectOf = (init) => (init.type === 'ObjectExpression' ? init : init.type === 'CallExpression' ? init.arguments.find((a) => a.type === 'ObjectExpression') : null);
if (spec.container.kind === 'map') {
  if (!(d.init.type === 'NewExpression' && d.init.callee.name === 'Map' && !d.init.arguments.length)) fail(`${spec.container.decl} is not initialised with new Map()`);
  edits.push({ start: d.init.start, end: d.init.end, text: `new Map([${(entries[''] || []).join(',')}])` });
} else if (spec.container.kind === 'array') {
  if (!(d.init.type === 'ArrayExpression' && !d.init.elements.length)) fail(`${spec.container.decl} is not initialised with []`);
  edits.push({ start: d.init.start, end: d.init.end, text: `[${(entries[''] || []).join(',')}]` });
} else if (spec.container.kind === 'prop') {
  const obj = objectOf(d.init);
  if (!obj) fail(`${spec.container.decl}: no object literal in its initialiser`);
  const byPhase = spec.container.prop === '{phase}';
  for (const prop of byPhase ? Object.keys(entries) : [spec.container.prop]) {
    const pn = obj.properties.find((p) => (p.key?.name ?? p.key?.value) === prop);
    if (!pn || pn.value.type !== 'ArrayExpression' || pn.value.elements.length) fail(`${spec.container.decl}.${prop} is not an empty array literal`);
    edits.push({ start: pn.value.start, end: pn.value.end, text: `[${(entries[byPhase ? prop : ''] || []).join(',')}]` });
  }
} else if (spec.container.kind === 'value') {
  const obj = objectOf(d.init);
  const pn = obj?.properties.find((p) => (p.key?.name ?? p.key?.value) === spec.container.prop);
  if (!pn || !(pn.value.type === 'Literal' && pn.value.value === null)) fail(`${spec.container.decl}.${spec.container.prop} is not null`);
  edits.push({ start: pn.value.start, end: pn.value.end, text: (entries[''] || [])[0] });
  decisions.push(`dropped ${handled.length - 1} earlier call(s): ${handled.slice(0, -1).map((h) => slice(h.expression.arguments[0])).join(', ')}; kept ${slice(handled.at(-1).expression.arguments[0])}`);
} else fail(`unknown container kind ${spec.container.kind}`);
for (const st of handled) edits.push({ start: st.start, end: st.end, text: '\u0001' });
for (const m of spec.removeMembers || []) {
  const dd = closure.body.find((s) => s.type === 'VariableDeclaration' && s.declarations.some((x) => x.id.name === m.decl))?.declarations.find((x) => x.id.name === m.decl);
  const obj = dd && objectOf(dd.init);
  const pn = obj?.properties.find((p) => (p.key?.name ?? p.key?.value) === m.member);
  if (!pn) fail(`${m.decl}.${m.member} not found`);
  const after = text.slice(pn.end).match(/^\s*,/);
  if (after) edits.push({ start: pn.start, end: pn.end + after[0].length, text: '' });
  else {
    const before = text.slice(0, pn.start).match(/,\s*$/);
    if (!before) fail(`${m.decl}.${m.member}: cannot tell its separator`);
    edits.push({ start: pn.start - before[0].length, end: pn.end, text: '' });
  }
}
const removed = new Set(handled);
for (const name of spec.removeFunctions || []) {
  const b = A.bindings.find((x) => x.name === name && x.scope === closure);
  if (!b) fail(`${name} is not a top-level function`);
  const own = closure.body.find((s) => s.type === 'FunctionDeclaration' && s.id.name === name);
  const outside = b.refs.filter((r) => { const s = closure.body.find((t) => t.start <= r.node.start && r.node.end <= t.end); return !removed.has(s) && !(own && r.node.start >= own.start && r.node.end <= own.end); });
  if (outside.length) fail(`${name} is still used outside the handled calls (line ${outside[0].node.loc.start.line})`);
  edits.push({ start: own.start, end: own.end, text: '\u0001' });
}
const segEnd = (file) => {
  const m = marks.find((x) => x.file === file);
  if (!m) fail(`no segment ${file}`);
  const next = marks.find((x) => x.at > m.at);
  return next ? next.at : text.indexOf('\n})();', m.at);
};
const byFile = {};
for (const f of newFns) (byFile[f.dest] ||= []).push(f.text);
for (const [file, fns] of Object.entries(byFile)) { const at = segEnd(file); edits.push({ start: at, end: at, text: fns.join('\n') + '\n' }); }
edits.sort((a, b) => b.start - a.start);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) fail('overlapping edits');
let out = text;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
out = out.split('\n').flatMap((l) => (l.includes('\u0001') ? (l.replace(/\u0001/g, '').trim() === '' ? [] : [l.replace(/\u0001/g, '')]) : [l])).join('\n');
acorn.parse(out, { ecmaVersion: 'latest' });
if (process.argv.includes('--verbose')) console.log(decisions.join('\n'));
console.log(`${spec.container.decl}: ${handled.length} calls -> entries; ${newFns.length} new functions (${newFns.map((f) => `${f.name}@${f.dest}`).join(', ') || 'none'})`);
if (!dry) fs.writeFileSync(work, out);
