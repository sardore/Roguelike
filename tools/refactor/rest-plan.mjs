#!/usr/bin/env node
// Read-only plan for what is left in boot.js after the domain moves: each remaining declaration gets a candidate domain
// (the split domain it is most connected to, or for the cross-cutting rest a keyword category), then the references between
// the candidate domains and the load-time reads that fix the order are counted.
//   node tools/refactor/rest-plan.mjs <work.js> [--list <cat>]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const KEYWORD = [
  ['debug', /^(debugBattle|DEBUG_BATTLE|initDebugBattle|openDebugBattle|closeDebugBattle)/],
  ['classes', /^(base(Strongman|Wanderer|Swordsman|Escort|Summoner|Archer|Infiltrator)|CLASS|classGear|startingGearFor|heroClass)/],
  ['turn', /^(ActionDispatcher|InputRouter|Auto81|endTurn|TurnEngine|TURN_|playerAction|runAutoPath|movementInterval|executeIntent|advanceHeld|heldInput|ClientEnvironment|DesktopClient|MobileClient|OrientationGate|PointerRuntime|POINTER_CONFIG|Runtime81|CONFIG81)/],
  ['world', /^(resolve(ForcedMovement|EntityHazard|PlayerLanding|ElementDamage|StandingHazard)|emitElement|elementMaterial|wallMaterial|RuntimeTerrain|TERRAIN|terrain|Terrain|VisibilityService|OccupancyService|PlacementService|hazard|Hazard|forcedMovement|entityTerrain|setTerrain|pushStructure|movePlatform|tickTerrainReactions|elementField|environment|occupan|structure)/],
  ['layout', /(layout|Layout|room|Room|hall|Hall|organic|sculpt|spread|Floor|floor|stamp|densify|placeRooms|cleanupMapGeometry|scrub|symmetric|strategic|shape|repair|relocate|grass|Grass|kitchen|Kitchen|cluster|Landmark|connect|normalize|guard|nook|Nook|vault|Vault|manhattan|architecture|Decor|decor|DECOR|ART60|PACKS)/],
];
const args = process.argv.slice(2);
const work = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--list') || '.work/runtime.js';
const text = fs.readFileSync(work, 'utf8');
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1].replace(/\.js$/, ''), at: m.index }));
const segOf = (pos) => { let cur = null; for (const m of marks) if (m.at <= pos) cur = m.file; return cur; };
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const body = ast.body[0].expression.callee.body, top = body.body, A = analyze(ast);
const namesOf = (s) => (s.type === 'FunctionDeclaration' ? [s.id.name] : s.type === 'VariableDeclaration' ? s.declarations.filter((d) => d.id.type === 'Identifier').map((d) => d.id.name) : []);
const lines = (s) => s.loc.end.line - s.loc.start.line + 1;
const enclosing = (pos) => top.find((s) => pos >= s.start && pos < s.end);
const bindingByName = new Map(A.bindings.filter((b) => b.scope === body).map((b) => [b.name, b]));
const declSeg = new Map(); for (const s of top) for (const n of namesOf(s)) declSeg.set(n, segOf(s.start));
const spine = top.filter((s) => segOf(s.start) === 'spine');
const links = new Map();
const bump = (s, d) => { if (!d || ['spine', 'qa/qa', 'start', 'kernel', 'catalog'].includes(d)) return; const o = links.get(s) || links.set(s, {}).get(s); o[d] = (o[d] || 0) + 1; };
for (const s of spine) walk.full(s, (n) => { if (n.type === 'Identifier' && declSeg.has(n.name) && !namesOf(s).includes(n.name)) bump(s, declSeg.get(n.name)); });
for (const s of spine) for (const n of namesOf(s)) for (const r of bindingByName.get(n)?.refs || []) { const e = enclosing(r.node.start); if (e && e !== s) bump(s, segOf(e.start)); }
const cat = new Map();
for (const s of spine) {
  const n = namesOf(s)[0];
  if (!n) { cat.set(s, 'loose'); continue; }
  const kw = KEYWORD.find(([, re]) => re.test(n));
  const l = links.get(s) || {}, tot = Object.values(l).reduce((a, b) => a + b, 0), best = Object.entries(l).sort((a, b) => b[1] - a[1])[0];
  const aff = tot >= 2 && best[1] / tot >= 0.4 ? best[0] : null;
  cat.set(s, kw && !(aff && aff !== 'mapgen' && aff !== 'special' && aff !== 'branches') ? kw[0] : aff ? 'pinned:' + aff : 'rest');
}
const li = args.indexOf('--list');
if (li >= 0) { for (const s of spine) if (cat.get(s) === args[li + 1]) console.log((namesOf(s).join(',') || '(loose)'), lines(s)); process.exit(0); }
const count = {}, sizes = {};
for (const s of spine) { const c = cat.get(s); count[c] = (count[c] || 0) + 1; sizes[c] = (sizes[c] || 0) + lines(s); }
console.log('remaining in boot.js:', spine.length, 'statements,', spine.reduce((a, s) => a + lines(s), 0), 'statement lines');
for (const c of Object.keys(sizes).sort((a, b) => sizes[b] - sizes[a])) console.log(c.padEnd(18), String(count[c]).padStart(6), String(sizes[c]).padStart(8));
const C = ['world', 'layout', 'turn', 'classes', 'debug', 'rest', 'loose'];
const refs = {}, eager = {}; const bmp = (o, a, b) => { (o[a] ||= {})[b] = (o[a][b] || 0) + 1; };
const catOfName = new Map(); for (const s of spine) for (const n of namesOf(s)) catOfName.set(n, cat.get(s));
for (const [name, b] of bindingByName) { const tc = catOfName.get(name); if (!tc) continue; for (const r of b.refs) { const s = enclosing(r.node.start); if (!s || !cat.has(s)) continue; const fc = cat.get(s); if (fc === tc || !C.includes(fc) || !C.includes(tc)) continue; bmp(refs, fc, tc); } }
for (const s of spine) { if (s.type === 'FunctionDeclaration') continue; const fc = cat.get(s); walk.ancestor(s, { Identifier(id, _st, anc) { if (anc.some((a, i) => /Function/.test(a.type) && !(i > 0 && anc[i - 1].type === 'CallExpression' && anc[i - 1].callee === a))) return; const tc = catOfName.get(id.name); if (!tc || tc === fc || !C.includes(fc) || !C.includes(tc)) return; const b = bindingByName.get(id.name); if (!b || b.kind === 'function') return; bmp(eager, fc, tc); } }); }
const row = (o, t) => { console.log(`\n${t} (row reads column)`); console.log(' '.repeat(9) + C.map((c) => c.padStart(8)).join('')); for (const a of C) console.log(a.padEnd(9) + C.map((b) => String(a === b ? '-' : o[a]?.[b] || 0).padStart(8)).join('')); };
row(refs, 'references between candidate domains'); row(eager, 'load-time reads of const/let between candidate domains');
