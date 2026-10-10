#!/usr/bin/env node
// Refactor tool: move QA-only publication code out of the runtime into src/qa/qa.js.
//   node tools/refactor/extract-qa.mjs [--write] [--keep __MANRU_A__,__MANRU_B__]
// "QA-only" is decided by tools/lib/bridges.mjs: members (or whole bridges) that no game code
// reaches. Moved: top-level statements that only publish QA bridges, the QA members of a mixed
// bridge (as `window.X.m=...` statements), and then every top-level function that is referenced
// only from moved code (repeated until stable). Statements that need judgement are listed and
// left in place. With --write the runtime gets the marker that tools/build.mjs --qa replaces
// with the QA file; without it nothing is changed.
import fs from 'node:fs';
import { analyzeBridges } from '../lib/bridges.mjs';
import { analyze } from '../lib/scope.mjs';
import * as walk from 'acorn-walk';

const args = process.argv.slice(2);
const write = args.includes('--write');
const keepArg = args.includes('--keep') ? args[args.indexOf('--keep') + 1].split(',') : [];
const KEEP = new Set(['__MANRU_DEBUG__', '__MANRU_DEBUG_BATTLE57__', ...keepArg]);
const file = 'src/scripts/10-runtime.js';
const qaFile = 'src/qa/qa.js';
export const MARKER = '/*@@QA-BRIDGES@@*/';
const B = analyzeBridges(file);
const { src, ast, out, isRoot } = B;
const A = analyze(ast);
const T = (n) => src.slice(n.start, n.end);
const iife = ast.body[0].expression.callee;
const body = iife.body;
const byName = new Map(out.map((x) => [x.name, x]));
const members = (x) => Object.entries(x.defined);
const wholly = (x) => !KEEP.has(x.name) && (members(x).length ? members(x).every(([, v]) => v.qa) : !x.gameReads);
const mixed = (x) => !KEEP.has(x.name) && members(x).some(([, v]) => v.qa) && members(x).some(([, v]) => !v.qa);
const bridgeOf = (n) => (n.type === 'MemberExpression' && !n.computed && isRoot(n.object) && /^__/.test(n.property.name) ? n.property.name : null);

const walkUpIsAssignTarget = (root, member) => { let hit = false; walk.simple(root, { AssignmentExpression(a) { if (a.left === member) hit = true; } }); return hit; };
const moved = []; // { node, why }
const manual = [];
const propRemovals = []; // { start, end }
const added = []; // { text, at }
for (const S of body.body) {
  const mentions = []; // {bridge, role}
  walk.fullAncestor(S, (n, _s, anc) => {
    const name = bridgeOf(n);
    if (!name || !byName.has(name)) return;
    const p = anc[anc.length - 2];
    mentions.push({ name, node: n, parent: p });
  });
  if (!mentions.length) continue;
  // Only the bridges a statement writes decide where it belongs; reads of other bridges inside
  // the value (e.g. an arrow calling the camera bridge) just travel with it.
  const isWrite = (m) => (m.parent.type === 'AssignmentExpression' && m.parent.left === m.node)
    || (m.parent.type === 'MemberExpression' && m.parent.object === m.node && walkUpIsAssignTarget(S, m.parent))
    || (m.parent.type === 'CallExpression' && m.parent.callee.type === 'MemberExpression' && /^(Object\.assign|Object\.defineProperty)$/.test(T(m.parent.callee)) && m.parent.arguments[0] === m.node)
    || (m.parent.type === 'AssignmentExpression' && m.parent.right === m.node && S.expression === m.parent && false);
  const writes = mentions.filter(isWrite);
  const qaNames = writes.length && writes.every((m) => wholly(byName.get(m.name))) ? mentions : [];
  const publishShaped = (s) => s.type === 'ExpressionStatement' || ((s.type === 'IfStatement') && !s.alternate && publishShaped(s.consequent)) || (s.type === 'BlockStatement' && s.body.length && s.body.every(publishShaped));
  if (qaNames.length === mentions.length) {
    if (S.type === 'FunctionDeclaration' || S.type === 'VariableDeclaration') continue; // handled by the reachability pass below
    if (publishShaped(S)) moved.push({ node: S, why: 'publishes ' + [...new Set(mentions.map((m) => m.name))].join(',') });
    else manual.push(`line ${S.loc.start.line}: ${S.type} mentions only QA bridges but is not a plain publication`);
    continue;
  }
  // statement touching a mixed bridge
  for (const m of mentions) {
    const x = byName.get(m.name);
    if (!mixed(x)) continue;
    const p = m.parent;
    if (S.type !== 'ExpressionStatement' || S.expression.type !== 'AssignmentExpression') continue;
    const as = S.expression;
    if (as.left === m.node && as.right.type === 'ObjectExpression') {
      const qaKeys = new Set(members(x).filter(([, v]) => v.qa).map(([k]) => k));
      const props = as.right.properties, keep = props.filter((pr) => !(pr.type === 'Property' && !pr.computed && qaKeys.has(pr.key.name ?? pr.key.value)));
      if (keep.length === props.length) continue;
      if (props.some((pr) => pr.type !== 'Property' || pr.kind !== 'init')) { manual.push(`line ${S.loc.start.line}: ${m.name} literal has spread/accessor members`); continue; }
      const text = [];
      for (const pr of props) {
        if (keep.includes(pr)) continue;
        const key = pr.key.name ?? pr.key.value;
        const val = pr.shorthand ? key : pr.method ? 'function' + T(pr.value) : T(pr.value);
        text.push(`${m.name === '' ? '' : 'window.' + m.name}.${/^[A-Za-z_$][\w$]*$/.test(key) ? key : `[${JSON.stringify(key)}]`}=${val};`);
        propRemovals.push({ pr, props });
      }
      added.push({ text: text.join('\n'), at: S.start, line: S.loc.start.line });
    } else if (as.left.type === 'MemberExpression' && as.left.object === m.node && !as.left.computed && members(x).find(([k, v]) => k === as.left.property.name && v.qa)) {
      moved.push({ node: S, why: `${m.name}.${as.left.property.name}` });
    }
  }
}
// Whole-statement moves can overlap with member moves of the same statement: keep unique nodes.
const movedSet = new Set(moved.map((m) => m.node));

// Reachability: a top-level function referenced only from moved code moves too.
const inMoved = (pos, set) => [...set].some((n) => pos >= n.start && pos < n.end);
const topFns = [];
for (const b of A.bindings) {
  if (b.scope !== body) continue;
  const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
  if (b.kind === 'function') topFns.push({ b, node: b.decl, fn: b.decl });
  else if ((b.kind === 'const' || b.kind === 'let') && isFn(b.decl?.init) && b.decl.id.type === 'Identifier') {
    const vd = body.body.find((s) => s.type === 'VariableDeclaration' && s.declarations.includes(b.decl));
    if (vd && vd.declarations.length === 1) topFns.push({ b, node: vd, fn: b.decl.init });
  }
}
for (let changed = true; changed;) {
  changed = false;
  const nodes = new Set([...movedSet, ...topFns.filter((f) => f.moved).map((f) => f.node)]);
  // QA code that is not yet a node: pending member statements get moved too, count them as QA text
  const pendingRanges = added.map((a) => ({ start: a.at, end: a.at }));
  for (const f of topFns) {
    if (f.moved) continue;
    const outside = f.b.refs.filter((r) => !(r.node.start >= f.fn.start && r.node.end <= f.fn.end));
    if (!outside.length) continue;
    if (outside.every((r) => inMoved(r.node.start, nodes) || memberPropsContain(r.node.start))) { f.moved = true; changed = true; }
  }
}
// references from the QA members that are only removed as properties of a game bridge literal
function memberPropsContain(pos) {
  return propRemovals.some(({ pr }) => pos >= pr.start && pos < pr.end);
}
const movedFns = topFns.filter((f) => f.moved);

// ------------------------------------------------------------------ report
const nMembers = propRemovals.length;
console.log(`whole statements moved: ${moved.length}; mixed-bridge members re-published from QA: ${nMembers}; functions only QA uses: ${movedFns.length}`);
for (const m of manual) console.log('manual: ' + m);
if (!write) {
  console.log(movedFns.slice(0, 400).map((f) => f.b.name).join(' '));
  process.exit(0);
}

// ------------------------------------------------------------------ write
const edits = [];
const qaParts = [];
const removeNode = (n) => edits.push({ start: n.start, end: n.end, text: '' });
const items = [];
for (const m of moved) items.push({ pos: m.node.start, text: T(m.node) });
for (const a of added) items.push({ pos: a.at, text: a.text });
for (const f of movedFns) items.push({ pos: f.node.start, text: T(f.node) });
for (const m of moved) removeNode(m.node);
for (const f of movedFns) removeNode(f.node);
for (const { pr, props } of propRemovals) {
  const i = props.indexOf(pr);
  if (props.length === 1) edits.push({ start: pr.start, end: pr.end, text: '' });
  else if (i < props.length - 1) edits.push({ start: pr.start, end: props[i + 1].start, text: '' });
  else edits.push({ start: props[i - 1].end, end: pr.end, text: '' });
}
// removing the last properties can double-remove commas; merge adjacent edits by recomputing from the kept set
{
  const byObj = new Map();
  for (const { pr, props } of propRemovals) { if (!byObj.has(props)) byObj.set(props, new Set()); byObj.get(props).add(pr); }
  const keepEdits = edits.filter((e) => !propRemovals.some(({ pr }) => e.start === pr.start || e.end === pr.end || (e.start >= pr.start && e.end <= pr.end)));
  edits.length = 0; edits.push(...keepEdits);
  for (const [props, gone] of byObj) {
    const kept = props.filter((p) => !gone.has(p));
    const first = props[0], last = props[props.length - 1];
    const text = kept.map(T).join(',');
    edits.push({ start: first.start, end: last.end, text });
  }
}
if (!src.includes(MARKER)) edits.push({ start: body.end - 1, end: body.end - 1, text: `\n  ${MARKER}\n` });
edits.sort((a, b) => b.start - a.start);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error(`overlapping edits near ${edits[i].start}`);
let next = src;
for (const e of edits) next = next.slice(0, e.start) + (e.text === '' ? '\u0001' : e.text) + next.slice(e.end);
next = next.split('\n').filter((l) => !(l.includes('\u0001') && /^[\s\u0001;]*$/.test(l))).join('\n').replaceAll('\u0001', '');
items.sort((a, b) => a.pos - b.pos);
const existing = fs.existsSync(qaFile) ? fs.readFileSync(qaFile, 'utf8') : null;
const qaText = existing ? existing + items.map((i) => i.text).join('\n') + '\n' : '// QA-only code, spliced into the runtime closure by `npm run build:qa` at the marker in 10-runtime.js.\n// Nothing here is read by the game; it publishes diagnostics and test hooks. Generated by\n// tools/refactor/extract-qa.mjs, maintained by hand from now on.\n' + items.map((i) => i.text).join('\n') + '\n';
fs.mkdirSync('src/qa', { recursive: true });
fs.writeFileSync(qaFile, qaText);
fs.writeFileSync(file, next);
console.log(`wrote ${qaFile} (${qaText.split('\n').length} lines); runtime ${src.split('\n').length} -> ${next.split('\n').length} lines`);
