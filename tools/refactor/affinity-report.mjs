#!/usr/bin/env node
// Read-only analysis of what is left in boot.js: every remaining top-level declaration is assigned to the already split
// domain file it is most connected to (references it makes into that file + references that file makes to it).
// A declaration with no clear winner (winner under 40% of its links, or fewer than 2 links) is "shared".
//   node tools/refactor/affinity-report.mjs <work.js> [--list <domain>]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

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
const links = new Map(); // statement -> {domain: n}
const bump = (s, d) => { if (!d || d === 'spine' || d === 'qa/qa' || d === 'start' || d === 'kernel' || d === 'catalog') return; const o = links.get(s) || links.set(s, {}).get(s); o[d] = (o[d] || 0) + 1; };
// references made by the statement
for (const s of spine) walk.full(s, (n) => { if (n.type === 'Identifier' && declSeg.has(n.name) && !namesOf(s).includes(n.name)) bump(s, declSeg.get(n.name)); });
// references made to it
for (const s of spine) for (const n of namesOf(s)) for (const r of bindingByName.get(n)?.refs || []) { const e = enclosing(r.node.start); if (e && e !== s) bump(s, segOf(e.start)); }
const dom = new Map(); const sizes = {}, counts = {}, loose = {};
for (const s of spine) {
  const l = links.get(s) || {}; const tot = Object.values(l).reduce((a, b) => a + b, 0);
  const best = Object.entries(l).sort((a, b) => b[1] - a[1])[0];
  const d = !namesOf(s).length ? 'loose' : tot >= 2 && best[1] / tot >= 0.4 ? best[0] : 'shared';
  dom.set(s, d);
}
// loose statements follow the domain they touch most
for (const s of spine) if (dom.get(s) === 'loose') { const l = links.get(s) || {}; const best = Object.entries(l).sort((a, b) => b[1] - a[1])[0]; dom.set(s, best ? 'loose:' + best[0] : 'loose:none'); }
const li = args.indexOf('--list');
if (li >= 0) { for (const s of spine) if (dom.get(s) === args[li + 1]) console.log(namesOf(s)[0] || '(loose)', lines(s)); process.exit(0); }
for (const s of spine) { const d = dom.get(s); counts[d] = (counts[d] || 0) + 1; sizes[d] = (sizes[d] || 0) + lines(s); }
console.log('boot.js remaining:', spine.length, 'statements,', spine.reduce((a, s) => a + lines(s), 0), 'lines');
for (const d of Object.keys(sizes).sort((a, b) => sizes[b] - sizes[a])) console.log(d.padEnd(18), String(counts[d]).padStart(6), String(sizes[d]).padStart(8));
