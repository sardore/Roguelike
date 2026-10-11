#!/usr/bin/env node
// Read-only analysis for the remaining split (what is still in spine.js): puts every top-level
// declaration of the spine segment into ui / input / story / boot / world by name, then reports per
// cluster the size, the references between clusters, the load-time (eager) dependencies a cluster
// has on another, and the loose statements (registrations, calls) whose order is behaviour.
//   node tools/refactor/cluster-report.mjs <work.js> [--list <cluster>] [--json]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

export const CLUSTERS = [
  ['input', /key(board|down|up|Hold|Meta|map)|pointer|touch|gesture|longPress|longpress|hold(Timer|Start|Cancel)|cancelHold|drag|swipe|joystick|dpad|hotkey|shortcut|InputRouter|inputRouter|bindInput|bindKeys|typedKey|wheel|contextmenu|tap(s)?\b|click|press/i],
  ['story', /story|ending|epilogue|narrat|dialog|lore|rumor|library|prologue|intro|credits|cutscene|scroll(?!Into)|note(?!s)|tutorial|tip(?!o)/i],
  ['ui', /panel|modal|hud|toast|inspect|button|btn|inventory|help|menu|screen|title|overlay|addLog|log[A-Z]|shop|choice|ui[A-Z]|UI|dom|element|mobile|drawer|class(Select|Grid|Card|Portrait)|settings|slot|tooltip|open[A-Z]|close[A-Z]|render[A-Z]|refresh[A-Z]|update[A-Z]|show[A-Z]|feel|skill|belt|fusion|cooking|gear[A-Z]/],
  ['boot', /^(boot|init|start|main|bootstrap|INIT|BOOT)|Boot|bootR9|registerBoot|runtimeStart/],
];
export function clusterOf(name) { for (const [d, re] of CLUSTERS) if (re.test(name)) return d; return 'world'; }

const args = process.argv.slice(2);
const work = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--list') || '.work/runtime.js';
const text = fs.readFileSync(work, 'utf8');
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index }));
const segOf = (pos) => { let cur = null; for (const m of marks) if (m.at <= pos) cur = m.file; return cur; };
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const body = ast.body[0].expression.callee.body;
const top = body.body;
const A = analyze(ast);
const nameOf = (s) => (s.type === 'FunctionDeclaration' ? s.id.name : s.type === 'VariableDeclaration' && s.declarations[0].id.type === 'Identifier' ? s.declarations[0].id.name : null);
const lines = (s) => s.loc.end.line - s.loc.start.line + 1;
const spine = top.filter((s) => segOf(s.start) === 'spine.js');
const cl = new Map(); // statement -> cluster
const INPUT_BODY = /addEventListener\(\s*['"`](key(down|up|press)|pointer\w*|touch\w*|mouse\w*|wheel|contextmenu|click|dblclick|dragstart|drop)['"`]|\.(clientX|clientY|pointerId|touches|changedTouches|ctrlKey|shiftKey|altKey|metaKey)\b|\be\.key\b|ev(ent)?\.key\b|\.code===/;
const UI_BODY = /document\.(getElementById|querySelector\w*|createElement|body)|\.innerHTML|\.classList|\.textContent|\.appendChild|\.setAttribute|\.style\./;
const STORY_NAME = /story|ending|epilogue|narrat|dialog|lore|prologue|credits|cutscene|tutorial|coach/i;
const seedOf = (s) => {
  const n = nameOf(s), src = text.slice(s.start, s.end);
  if (n && STORY_NAME.test(n)) return 'story';
  if (INPUT_BODY.test(src)) return 'input';
  if (n && /^(boot|init|start)|Boot/.test(n)) return 'boot';
  if (UI_BODY.test(src)) return 'ui';
  return null;
};
for (const s of spine) cl.set(s, seedOf(s) || 'unlabeled');
// absorption: an unlabeled declaration whose every caller sits in one cluster joins that cluster (to a fixpoint);
// loose statements follow the cluster whose bindings they reference most; whatever is left is the world
const enclosing = (pos) => top.find((s) => pos >= s.start && pos < s.end);
const bindingByName = new Map(A.bindings.filter((b) => b.scope === body).map((b) => [b.name, b]));
const namesOf = (s) => (s.type === 'FunctionDeclaration' ? [s.id.name] : s.type === 'VariableDeclaration' ? s.declarations.filter((d) => d.id.type === 'Identifier').map((d) => d.id.name) : []);
for (let changed = true; changed;) {
  changed = false;
  for (const s of spine) {
    if (cl.get(s) !== 'unlabeled' || !nameOf(s)) continue;
    const callers = new Set();
    for (const n of namesOf(s)) for (const r of bindingByName.get(n)?.refs || []) { const e = enclosing(r.node.start); if (e && e !== s) callers.add(cl.get(e) || 'external'); }
    if (callers.size === 1) { const c = [...callers][0]; if (c !== 'unlabeled' && c !== 'external') { cl.set(s, c); changed = true; } }
  }
}
const declCluster = new Map();
for (const s of spine) if (nameOf(s)) for (const n of namesOf(s)) declCluster.set(n, cl.get(s));
for (const s of spine) {
  if (cl.get(s) !== 'unlabeled' || nameOf(s)) continue;
  const score = {};
  walk.full(s, (n) => { if (n.type === 'Identifier' && declCluster.has(n.name)) { const c = declCluster.get(n.name); if (c !== 'unlabeled') score[c] = (score[c] || 0) + 1; } });
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  cl.set(s, best ? best[0] : 'world');
}
for (const s of spine) if (cl.get(s) === 'unlabeled') { cl.set(s, 'world'); if (nameOf(s)) for (const n of namesOf(s)) declCluster.set(n, 'world'); }
const clusters = ['input', 'story', 'ui', 'boot', 'world'];
const count = {}, nlines = {}, loose = {};
for (const s of spine) { const c = cl.get(s); count[c] = (count[c] || 0) + 1; nlines[c] = (nlines[c] || 0) + lines(s); if (!nameOf(s)) loose[c] = (loose[c] || 0) + 1; }
const listIdx = args.indexOf('--list');
if (listIdx >= 0) { for (const s of spine) if (cl.get(s) === args[listIdx + 1] && nameOf(s)) console.log(nameOf(s), lines(s)); process.exit(0); }
// references between clusters (any reference inside a statement of cluster A to a spine binding of cluster B)
const edges = {}, eager = {}, eagerFrom = new Set();
const bump = (o, a, b) => { (o[a] ||= {})[b] = (o[a][b] || 0) + 1; };
for (const [name, b] of bindingByName) {
  const tc = declCluster.get(name); if (!tc) continue;
  for (const r of b.refs) {
    const s = enclosing(r.node.start); if (!s || !cl.has(s)) continue;
    const fc = cl.get(s); if (fc === tc) continue;
    bump(edges, fc, tc);
  }
}
// load-time reads: a const/let initialiser or loose statement of cluster A that, outside any function, reads a const/let/loosely-assigned binding of cluster B
for (const s of spine) {
  if (s.type === 'FunctionDeclaration') continue;
  const fc = cl.get(s);
  walk.ancestor(s, { Identifier(id, _st, anc) {
    if (anc.some((a) => /Function/.test(a.type))) return;
    const tc = declCluster.get(id.name); if (!tc || tc === fc) return;
    const b = bindingByName.get(id.name); if (!b || b.kind === 'function') return;
    bump(eager, fc, tc);
  } });
}
// the public surface: spine bindings of cluster B that another cluster (or a file already split off) references
const surface = {};
for (const [name, b] of bindingByName) {
  const tc = declCluster.get(name); if (!tc) continue;
  for (const r of b.refs) { const s = enclosing(r.node.start); if (!s) continue; const fc = cl.get(s) || segOf(s.start); if (fc !== tc) { (surface[tc] ||= new Set()).add(name); break; } }
}
const report = { spineStatements: spine.length, count, lines: nlines, looseStatements: loose, refs: edges, eagerReads: eager, publicBindings: Object.fromEntries(Object.entries(surface).map(([k, v]) => [k, v.size])) };
if (args.includes('--json')) console.log(JSON.stringify(report, null, 1));
else {
  console.log(`spine.js: ${spine.length} top-level statements`);
  console.log('cluster   decls+loose   lines   loose-stmts   public-bindings');
  for (const c of clusters) console.log(c.padEnd(9), String(count[c] || 0).padStart(10), String(nlines[c] || 0).padStart(8), String(loose[c] || 0).padStart(12), String(surface[c]?.size || 0).padStart(14));
  const row = (o, title) => { console.log(`\n${title} (row reads column)`); console.log(' '.repeat(9) + clusters.map((c) => c.padStart(8)).join('')); for (const a of clusters) console.log(a.padEnd(9) + clusters.map((b) => String(a === b ? '-' : o[a]?.[b] || 0).padStart(8)).join('')); };
  row(edges, 'references between clusters');
  row(eager, 'load-time reads (const/let or loose statement reading another cluster at load)');
}
