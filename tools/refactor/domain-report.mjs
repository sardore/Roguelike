#!/usr/bin/env node
// Read-only analysis for the module split: assigns every top-level declaration of the runtime
// closure to a domain by name keywords, counts references between domains, and checks which
// initialisation-order constraints (a const/let/statement that needs another one to have run
// first) a given domain order would break.
//   node tools/refactor/domain-report.mjs [file] [--json]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

export const DOMAINS = [
  ['save', /save|load|lifecycle|snapshot|storage|resume|recover|persist|migrat|envelope|slot|serializ|hydrate|backup|version|autosave/i],
  ['render', /draw|render|sprite|canvas|paint|palette|texture|tile(?!Blocks)|vf[A-Z]|camera|zoom|viewport|fx\b|particle|burst|float|vignette|light|glow|shade|minimap|atlas|icon(?!Kind)|portrait/i],
  ['ui', /panel|modal|hud|toast|inspect|button|btn|inventory(?!Item)|dialog|tooltip|help|tutorial|tip\b|menu|screen|title|overlay|story|ending|log\b|addLog|shop|choice|ui[A-Z]|dom|element|keyboard|pointer|touch|gesture|input|click|longpress|mobile|desktop|orientation|stamp/i],
  ['mapgen', /build|generat|carve|room|layout|corridor|floor(?!Turn)|maze|decor|architecture|connectiv|reach|vestibule|dungeon|branch|palace|citadel|dojo|mine|canal|granary|stockade|stair|portal|door|lock|key(?!board)|terrain|wall|grid|spawn(?!Near)|place|placement/i],
  ['monster', /monster|mon[A-Z]|boss|ai\b|AI|flank|noise|alert|summon|asura|gumi|legend|revive|revival|enemy|creature|species|role|detect|patrol|chase|intent|sound/i],
  ['combat', /attack|damage|hurt|hit|kill|death|die|armor|defense|status|poison|burn|stun|crit|projectile|knockback|ranged|weapon|martial|skill|spell|talisman(?!Icon)|element|elem/i],
  ['items', /item|potion|food|cook|recipe|ingredient|equip|gear|loot|drop|curse|holy|identify|relic|trinket|cloak|weapon(?=Def)|pickup|ammo|consum|belt|fusion|upgrade|reinforce/i],
];
export function domainOf(name) { for (const [d, re] of DOMAINS) if (re.test(name)) return d; return 'core'; }

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'src/scripts/10-runtime.js';
  const src = fs.readFileSync(file, 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
  const A = analyze(ast);
  const body = ast.body[0].expression.callee.body;
  const top = body.body;
  const lineCount = (n) => n.loc.end.line - n.loc.start.line + 1;
  // top-level binding -> {domain, kind, node}
  const owner = new Map();
  const info = [];
  for (const s of top) {
    if (s.type === 'FunctionDeclaration') { owner.set(s.id.name, s); info.push({ name: s.id.name, kind: 'function', node: s }); }
    else if (s.type === 'VariableDeclaration') for (const d of s.declarations) if (d.id.type === 'Identifier') { owner.set(d.id.name, s); info.push({ name: d.id.name, kind: s.kind === 'const' ? 'const' : 'let', node: s }); }
  }
  const byBinding = new Map(); for (const b of A.bindings) if (b.scope === body) byBinding.set(b.name, b);
  const dom = new Map(info.map((i) => [i.name, domainOf(i.name)]));
  const topIndex = new Map(top.map((s, i) => [s, i]));
  const enclosingTop = (pos) => top.find((s) => pos >= s.start && pos < s.end);
  // Refinement: names that match no keyword (domain "core") join the domain they reference most,
  // except the kernel (bindings referenced by very many declarations) which stays core.
  const refsBetween = new Map(); // name -> Map(otherName -> weight)
  const declName = (s) => (s.type === 'FunctionDeclaration' ? s.id.name : s.type === 'VariableDeclaration' && s.declarations[0].id.type === 'Identifier' ? s.declarations[0].id.name : null);
  const touch = (a, b) => { if (a === b || !dom.has(a) || !dom.has(b)) return; (refsBetween.get(a) || refsBetween.set(a, new Map()).get(a)).set(b, ((refsBetween.get(a).get(b)) || 0) + 1); (refsBetween.get(b) || refsBetween.set(b, new Map()).get(b)).set(a, ((refsBetween.get(b).get(a)) || 0) + 1); };
  for (const b of byBinding.values()) for (const r of b.refs) { const s = enclosingTop(r.node.start); const from = s && declName(s); if (from) touch(from, b.name); }
  const kernel = new Set([...refsBetween].filter(([, m]) => m.size >= 60).map(([n]) => n));
  for (const n of kernel) dom.set(n, 'kernel');
  for (let pass = 0; pass < 6; pass++) for (const [n, m] of refsBetween) {
    if (dom.get(n) !== 'core') continue; const score = {}; for (const [o, w] of m) { const d = dom.get(o); if (d && d !== 'core' && d !== 'kernel') score[d] = (score[d] || 0) + w; }
    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0]; if (best) dom.set(n, best[0]);
  }
  const edges = {}; const bump = (a, b) => { edges[a] ||= {}; edges[a][b] = (edges[a][b] || 0) + 1; };
  const lets = info.filter((i) => i.kind === 'let').map((i) => i.name);
  const count = {}, lines = {};
  for (const i of info) { const d = dom.get(i.name); count[d] = (count[d] || 0) + 1; lines[d] = (lines[d] || 0) + lineCount(i.node); }
  // references from a top-level declaration of domain A to a top-level binding of domain B
  for (const b of byBinding.values()) {
    const target = dom.get(b.name); if (!target) continue;
    for (const r of b.refs) { const s = enclosingTop(r.node.start); if (!s) continue; let from; if (s.type === 'FunctionDeclaration') from = dom.get(s.id.name); else if (s.type === 'VariableDeclaration') from = dom.get(s.declarations[0].id.name); else from = 'core'; if (from && from !== target) bump(from, target); }
  }
  // the public surface each domain would need: distinct bindings other domains reference
  const surface = {};
  for (const b of byBinding.values()) { const target = dom.get(b.name); if (!target) continue; for (const r of b.refs) { const s = enclosingTop(r.node.start); const from = s ? (declName(s) ? dom.get(declName(s)) : 'core') : null; if (from && from !== target) { (surface[target] ||= new Set()).add(b.name); } } }
  // statements that are neither declarations nor functions: executed in place, so they pin an order
  const loose = top.filter((s) => s.type !== 'FunctionDeclaration' && s.type !== 'VariableDeclaration');
  // init-order constraints: a const/let initialiser or loose statement that *executes* a reference to a const/let defined later in the file
  const eager = (n) => { const out = []; walk.ancestor(n, { Identifier(id, _s, anc) { const inFn = anc.some((a) => /Function/.test(a.type)); if (!inFn) out.push(id); } }); return out; };
  const initDeps = [];
  for (const s of top) {
    if (s.type === 'FunctionDeclaration') continue;
    for (const id of eager(s)) { const b = byBinding.get(id.name); if (!b || b.kind === 'function') continue; const decl = owner.get(id.name); if (!decl || decl === s) continue; if (topIndex.get(decl) < topIndex.get(s)) initDeps.push({ from: topIndex.get(s), to: topIndex.get(decl), name: id.name }); }
  }
  const report = { surface: Object.fromEntries(Object.entries(surface).map(([k, v]) => [k, v.size])), top: top.length, functions: info.filter((i) => i.kind === 'function').length, consts: info.filter((i) => i.kind === 'const').length, lets: lets.length, loose: loose.length, count, lines, edges, initDeps: initDeps.length };
  if (process.argv.includes('--json')) console.log(JSON.stringify(report));
  else {
    console.log(`top-level statements ${report.top}: functions ${report.functions}, const ${report.consts}, let ${report.lets}, loose statements ${report.loose}`);
    console.log('domain      decls   lines');
    for (const d of Object.keys(count).sort((a, b) => lines[b] - lines[a])) console.log(d.padEnd(10), String(count[d]).padStart(6), String(lines[d]).padStart(7));
    console.log('\nreferences between domains (row uses column):');
    const ds = Object.keys(count);
    console.log(' '.repeat(9) + ds.map((d) => d.slice(0, 7).padStart(8)).join(''));
    for (const a of ds) console.log(a.padEnd(9) + ds.map((b) => String(edges[a]?.[b] || (a === b ? '-' : 0)).padStart(8)).join(''));
    console.log('\nbindings other domains reference (the public surface each domain would need):', JSON.stringify(report.surface));
    console.log(`\neager init dependencies (const/let/loose statements that read an earlier const/let while loading): ${initDeps.length}`);
  }
}
