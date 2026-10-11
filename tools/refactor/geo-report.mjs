#!/usr/bin/env node
// Read-only analysis for the last domains of spine.js (map generation, special floors, branch dungeons).
// Seeds by name, then every unlabeled declaration joins the cluster that is its only caller; a declaration
// called from several clusters is shared and joins the base (mapgen), which must load first.
//   node tools/refactor/geo-report.mjs <work.js> [--list <cluster>]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const SEEDS = {
  mapgen: /^(NormalFloorGenerator|NormalGenerationStages|generateFloor|ReachabilityService|PlacementService|OccupancyService|ConnectedDecor|RngService|GenerationValidator|buildRegionLayout|build(Inn|Garden|Inner|Storage|Heart|Great|Choice|Pavilion|Bamboo|Perfume|Room|Fortress|Iron|VoidSea|Grand|Normal|Temple|Warehouse|River)|vault|applyVaults|applyFeatureRooms|applyStrategy|applyModules|applyRegionArchitecture|applyCoreFloor|registerWholeRoom|registerGenerationStage|carve|blob|walledBox|roomRect|addRoom|registerBuilding|buildUrbanDistrict)/,
  special: /^(build(Mercury|Peach|BossArena|SpecialPlaces|Floor6)|build\d+_\d+|installKey|installGeneric|installF2|installFloor|installLock|installCustom|installNested|installPending|applyLibrary|restaurant|rumor|buildArchitecture|ShopMapBuilder|generateBossFloor|applyFeeling)/,
  branches: /^(branch|BRANCH|buildPalace|buildCitadel|buildMine|buildDojo|buildMountain|mountain|MOUNTAIN|palace|Palace|PALACE|citadel|CITADEL|mine[A-Z]|MINE|dojo|DOJO|canal|Canal|CANAL|artifactDungeon|legend|LEGEND|anvil|Anvil)/,
};
const args = process.argv.slice(2);
const work = args.find((a) => !a.startsWith('--') && a !== args[args.indexOf('--list') + 1]) || '.work/runtime.js';
const text = fs.readFileSync(work, 'utf8');
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index }));
const segOf = (pos) => { let cur = null; for (const m of marks) if (m.at <= pos) cur = m.file; return cur; };
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const body = ast.body[0].expression.callee.body, top = body.body, A = analyze(ast);
const namesOf = (s) => (s.type === 'FunctionDeclaration' ? [s.id.name] : s.type === 'VariableDeclaration' ? s.declarations.filter((d) => d.id.type === 'Identifier').map((d) => d.id.name) : []);
const lines = (s) => s.loc.end.line - s.loc.start.line + 1;
const spine = top.filter((s) => segOf(s.start) === 'spine.js');
const cl = new Map();
for (const s of spine) { const n = namesOf(s)[0]; let c = 'unlabeled'; if (n) for (const [k, re] of Object.entries(SEEDS)) if (re.test(n)) { c = k; break; } cl.set(s, c); }
const enclosing = (pos) => top.find((s) => pos >= s.start && pos < s.end);
const bindingByName = new Map(A.bindings.filter((b) => b.scope === body).map((b) => [b.name, b]));
for (let changed = true; changed;) {
  changed = false;
  for (const s of spine) {
    if (cl.get(s) !== 'unlabeled' || !namesOf(s).length) continue;
    const callers = new Set();
    for (const n of namesOf(s)) for (const r of bindingByName.get(n)?.refs || []) { const e = enclosing(r.node.start); if (e && e !== s) callers.add(cl.get(e) || 'external'); }
    callers.delete('unlabeled'); callers.delete('other');
    if (callers.size === 1 && ![...callers].includes('external')) { cl.set(s, [...callers][0]); changed = true; }
    else if (callers.size > 1 && ![...callers].includes('external') && [...callers].every((c) => ['mapgen', 'special', 'branches'].includes(c))) { cl.set(s, 'mapgen'); changed = true; }
  }
}
// loose statements follow what they reference most
const declCluster = new Map();
for (const s of spine) for (const n of namesOf(s)) declCluster.set(n, cl.get(s));
for (const s of spine) {
  if (namesOf(s).length || cl.get(s) !== 'unlabeled') continue;
  const sc = {}; walk.full(s, (n) => { if (n.type === 'Identifier' && declCluster.has(n.name)) { const c = declCluster.get(n.name); if (['mapgen', 'special', 'branches'].includes(c)) sc[c] = (sc[c] || 0) + 1; } });
  const best = Object.entries(sc).sort((a, b) => b[1] - a[1])[0]; cl.set(s, best ? best[0] : 'other');
}
for (const s of spine) if (cl.get(s) === 'unlabeled') cl.set(s, 'other');
for (const s of spine) for (const n of namesOf(s)) declCluster.set(n, cl.get(s));
const li = args.indexOf('--list');
if (li >= 0) { for (const s of spine) if (cl.get(s) === args[li + 1] && namesOf(s).length) console.log(namesOf(s).join(','), lines(s)); process.exit(0); }
const C = ['mapgen', 'special', 'branches', 'other'];
const count = {}, nl = {}, loose = {};
for (const s of spine) { const c = cl.get(s); count[c] = (count[c] || 0) + 1; nl[c] = (nl[c] || 0) + lines(s); if (!namesOf(s).length) loose[c] = (loose[c] || 0) + 1; }
const refs = {}, eager = {}; const bump = (o, a, b) => { (o[a] ||= {})[b] = (o[a][b] || 0) + 1; };
for (const [name, b] of bindingByName) { const tc = declCluster.get(name); if (!tc) continue; for (const r of b.refs) { const s = enclosing(r.node.start); if (!s || !cl.has(s) || cl.get(s) === tc) continue; bump(refs, cl.get(s), tc); } }
const eagerNames = {};
for (const s of spine) {
  if (s.type === 'FunctionDeclaration') continue; const fc = cl.get(s);
  walk.ancestor(s, { Identifier(id, _st, anc) { if (anc.some((a) => /Function/.test(a.type))) return; const tc = declCluster.get(id.name); if (!tc || tc === fc) return; const b = bindingByName.get(id.name); if (!b || b.kind === 'function') return; bump(eager, fc, tc); (eagerNames[`${fc}>${tc}`] ||= new Set()).add(id.name); } });
}
console.log('cluster   statements   lines   loose');
for (const c of C) console.log(c.padEnd(9), String(count[c] || 0).padStart(9), String(nl[c] || 0).padStart(9), String(loose[c] || 0).padStart(7));
const row = (o, t) => { console.log(`\n${t} (row reads column)`); console.log(' '.repeat(9) + C.map((c) => c.padStart(9)).join('')); for (const a of C) console.log(a.padEnd(9) + C.map((b) => String(a === b ? '-' : o[a]?.[b] || 0).padStart(9)).join('')); };
row(refs, 'references'); row(eager, 'load-time reads of const/let');
for (const [k, v] of Object.entries(eagerNames)) console.log(k, [...v].slice(0, 12).join(' '));
