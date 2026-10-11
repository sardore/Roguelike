#!/usr/bin/env node
// Refactor tool: turn a rebinding chain with several live layers into explicit composition.
//
//   node tools/refactor/compose-chain.mjs <file> <name> <innerName>[,<innerName>...] [--dry]
//
// Layers before the last full replacement are dead and are deleted. Of the live layers, the
// last one becomes the declaration of <name>; each inner live layer becomes a function
// declaration with the given name (innermost first), and every call through an alias of that
// layer is rewritten to call the named function directly. No reassignment remains.
// Refuses when an alias is used outside the layer that wraps it (unless --keep-external lists
// it: such callers then call the named inner function, which is exactly what they reached).
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';
import { moveProblems, ancestorsOf } from '../lib/moves.mjs';

const args = process.argv.slice(2);
const [file, name, innerList] = args;
const dry = args.includes('--dry');
const keepExternal = args.includes('--keep-external');
const innerNames = (innerList || '').split(',').filter(Boolean);
let src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A = analyze(ast);
const T = (n) => src.slice(n.start, n.end);
const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');

const cands = A.bindings.filter((b) => b.name === name && b.refs.some((r) => r.parent.type === 'AssignmentExpression' && r.parent.left === r.node && isFn(r.parent.right)));
if (cands.length !== 1) throw new Error(`${name}: expected one rebound binding, found ${cands.length}`);
const b = cands[0];
const late = b.kind === 'let' || b.kind === 'var';
const writes = b.refs.filter((r) => r.parent.type === 'AssignmentExpression' && r.parent.left === r.node);
for (const r of writes) if (!isFn(r.parent.right)) throw new Error(`${name}: non-function write at ${r.node.loc.start.line}`);
// layers: declaration (if it is a function) + writes
const layers = [];
if (b.kind === 'function') layers.push({ fn: b.decl, decl: true });
else if (isFn(b.decl?.init)) layers.push({ fn: b.decl.init, decl: true });
for (const r of writes) layers.push({ fn: r.parent.right, ref: r });
// aliases: const x = name  ->  which layer they capture = the last layer written before them
const aliases = b.refs.filter((r) => r.parent.type === 'VariableDeclarator' && r.parent.init === r.node).map((r) => ({ ref: r, binding: A.bindings.find((x) => x.decl === r.parent) }));
const layerAt = (pos) => { let idx = -1; layers.forEach((l, i) => { const at = l.decl ? -1 : l.ref.parent.end; if (at < pos) idx = i; }); return idx; };
for (const al of aliases) al.captures = layerAt(al.ref.node.start);
const inside = (n, f) => n.start >= f.start && n.end <= f.end;
const usesOld = (l) => aliases.some((al) => al.binding.refs.some((x) => inside(x.node, l.fn)));
let k = layers.length - 1;
while (k > 0 && usesOld(layers[k])) k--;
const live = layers.slice(k);
const dead = layers.slice(0, k);
if (innerNames.length !== live.length - 1) throw new Error(`${name}: ${live.length - 1} inner live layers need names, got ${innerNames.length} (live layers at lines ${live.map((l) => (l.decl ? b.idNode : l.ref.node).loc.start.line).join(',')})`);
const nameOfLayer = new Map(live.slice(0, -1).map((l, i) => [layers.indexOf(l), innerNames[i]]));
for (const nm of innerNames) if (A.bindings.some((x) => x.name === nm)) throw new Error(`${nm} already exists`);

{
  const dest = ancestorsOf(ast, b.kind === 'function' ? b.decl : b.decl);
  for (const l of live) {
    const bad = moveProblems(A, l.fn, dest).filter((x) => !aliases.some((al) => x.startsWith(al.binding.name + '@')));
    if (bad.length) throw new Error(`${name}: layer at ${l.fn.loc.start.line} refers to bindings not visible at the declaration: ${bad.join(', ')}`);
  }
}
const edits = [];
// alias uses
for (const al of aliases) {
  const target = nameOfLayer.get(al.captures);
  for (const x of al.binding.refs) {
    const inLive = live.some((l) => inside(x.node, l.fn));
    const inDead = dead.some((l) => inside(x.node, l.fn));
    if (inDead) continue;
    if (!target) throw new Error(`${name}: alias ${al.binding.name} (captures a dead layer) used at ${x.node.loc.start.line}`);
    if (!inLive && !keepExternal) throw new Error(`${name}: alias ${al.binding.name} used outside the chain at ${x.node.loc.start.line} (pass --keep-external)`);
    edits.push({ start: x.node.start, end: x.node.end, text: target });
  }
  // remove alias declaration
  let vd = null;
  walk.full(ast, (n) => { if (n.type === 'VariableDeclaration' && n.declarations.includes(al.binding.decl)) vd = n; });
  if (vd.declarations.length === 1) edits.push({ start: vd.start, end: vd.end, text: '', remove: true });
  else {
    // drop just this declarator from `const a=x,b=y;`
    const i = vd.declarations.indexOf(al.binding.decl);
    const next = vd.declarations[i + 1], prev = vd.declarations[i - 1];
    edits.push(next ? { start: al.binding.decl.start, end: next.start, text: '', remove: true } : { start: prev.end, end: al.binding.decl.end, text: '', remove: true });
  }
}
// render a layer as a declaration text with replacements applied inside it
const render = (l, declName) => {
  const f = l.fn;
  const inner = edits.filter((e) => !e.remove && e.start >= f.start && e.end <= f.end).sort((a, c) => c.start - a.start);
  let bodyText = f.type === 'FunctionDeclaration' || f.body.type === 'BlockStatement' ? T(f.body) : `{return ${T(f.body)}}`;
  const base = f.body.start;
  for (const e of inner) {
    const off = f.body.type === 'BlockStatement' ? 0 : '{return '.length;
    bodyText = bodyText.slice(0, e.start - base + off) + e.text + bodyText.slice(e.end - base + off);
    e.consumed = true;
  }
  if (f.type === 'ArrowFunctionExpression') {
    let bad = false;
    walk.ancestor(f.body, {
      ThisExpression(_n, _s, anc) { if (!anc.some((a) => a.type === 'FunctionExpression' || a.type === 'FunctionDeclaration')) bad = true; },
      Identifier(n, _s, anc) { if (n.name === 'arguments' && !anc.some((a) => a.type === 'FunctionExpression' || a.type === 'FunctionDeclaration')) bad = true; },
    });
    if (bad) throw new Error(`${name}: arrow layer uses this/arguments`);
  }
  return `${f.async ? 'async ' : ''}function ${declName}(${f.params.map(T).join(',')})${bodyText}`;
};
const finalLayer = live.at(-1);
const finalText = render(finalLayer, name);
const innerTexts = live.slice(0, -1).map((l, i) => render(l, innerNames[i]));
// place: the declaration slot gets the final layer followed by the inner layers
const declStart = b.kind === 'function' ? b.decl.start : b.decl.start;
const indent = src.slice(src.lastIndexOf('\n', declStart) + 1, declStart).match(/^\s*/)[0];
const declText = [finalText, ...innerTexts.reverse()].join('\n' + indent);
const statementOf = (r) => r.ancestors.findLast((a) => a.type === 'ExpressionStatement');
if (b.kind === 'function') edits.push({ start: b.decl.start, end: b.decl.end, text: declText, remove: false, place: true });
else {
  let vd = null;
  walk.full(ast, (n) => { if (n.type === 'VariableDeclaration' && n.declarations.includes(b.decl)) vd = n; });
  if (vd.declarations.length !== 1) throw new Error(`${name}: declaration shares a statement`);
  edits.push({ start: vd.start, end: vd.end, text: declText, place: true });
}
for (const r of writes) {
  const st = statementOf(r);
  if (!st || st.expression !== r.parent) throw new Error(`${name}: write at ${r.node.loc.start.line} is not a plain statement`);
  edits.push({ start: st.start, end: st.end, text: '', remove: true });
}
const apply = edits.filter((e) => !e.consumed).sort((a, c) => c.start - a.start);
for (let i = 1; i < apply.length; i++) if (apply[i].end > apply[i - 1].start) throw new Error(`${name}: overlapping edits near ${apply[i].start}`);
for (const e of apply) src = src.slice(0, e.start) + (e.text === '' ? '\u0001' : e.text) + src.slice(e.end);
src = src.split('\n').filter((l) => !(l.includes('\u0001') && /^[\s\u0001;]*$/.test(l))).join('\n').replaceAll('\u0001', '');
acorn.parse(src, { ecmaVersion: 'latest' });
console.log(`${name}: ${dead.length} dead layer(s) removed, ${live.length} live layer(s) composed${innerNames.length ? ' via ' + innerNames.join(', ') : ''}`);
if (!dry) fs.writeFileSync(file, src);
