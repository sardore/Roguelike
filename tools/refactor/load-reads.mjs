#!/usr/bin/env node
// Measurement tool (read-only for src/): which top-level bindings of the game closure are actually read while the
// closure is still loading, and which of those reads hit the temporal dead zone (a read before the declaration ran,
// which throws and is then caught somewhere, or fails the boot).
//   node tools/refactor/load-reads.mjs <names.txt> [--root dist-qa] [--out <dir>] [--snapshot <file.json>]
// It copies the built tree (default dist-qa/, build it first) to <out>, rewrites every read of the listed names in
// scripts/10-runtime.js into a probe, boots the copy in the situations that change what runs at load time
// (empty storage, each V40 save fixture, ?debug=1, mobile viewport) and prints, per name, the load-time reads seen
// (ok = read after its declaration ran, tdz = read before) with the first call site of each kind.
// A name with no load-time read can be declared anywhere earlier in the closure without changing behaviour.
// --snapshot also records the value of every listed name when the closure has finished loading (functions by name,
// DOM nodes by tag/id, cycles cut), per situation, into a JSON file: two builds' snapshots compared show whether a
// move changed what a declaration holds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';
import { launch, openSession } from '../../tests/harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const namesFile = args.find((a, i) => !a.startsWith('--') && !['--root', '--out', '--snapshot'].includes(args[i - 1]));
const snapshotFile = opt('--snapshot', null);
const names = new Set(fs.readFileSync(namesFile, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean));
const root = path.resolve(repo, opt('--root', 'dist-qa'));
const out = path.resolve(repo, opt('--out', '.work/load-reads'));

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(root, out, { recursive: true });
const rtFile = path.join(out, 'scripts', '10-runtime.js');
const text = fs.readFileSync(rtFile, 'utf8');
const ast = acorn.parse(text, { ecmaVersion: 'latest', sourceType: 'script' });
const closure = ast.body.find((s) => s.type === 'ExpressionStatement' && s.expression.type === 'CallExpression' && /Function/.test(s.expression.callee.type));
if (!closure) throw new Error('game closure not found in ' + rtFile);
const body = closure.expression.callee.body;
const A = analyze(ast);
const found = new Set();
const edits = [];
for (const b of A.bindings) {
  if (b.scope !== body || !names.has(b.name)) continue;
  found.add(b.name);
  for (const r of b.refs) {
    const p = r.parent;
    if (p.type === 'AssignmentExpression' && p.left === r.node) continue;
    if (p.type === 'UpdateExpression') continue;
    const probe = `__MANRU_LOAD_PROBE__(${JSON.stringify(b.name)},()=>${b.name})`;
    if (p.type === 'Property' && p.shorthand) edits.push({ start: p.start, end: p.end, text: `${b.name}:${probe}` });
    else edits.push({ start: r.node.start, end: r.node.end, text: probe });
  }
}
for (const n of names) if (!found.has(n)) console.log(`warning: ${n} is not a top-level binding of the game closure`);
const seen = new Set();
const unique = edits.filter((e) => (seen.has(e.start) ? false : seen.add(e.start))).sort((a, b) => b.start - a.start);
let rewritten = text;
for (const e of unique) rewritten = rewritten.slice(0, e.start) + e.text + rewritten.slice(e.end);
// the closure finishes loading at its last statement: mark the end there (before a final return, if any)
const last = body.body[body.body.length - 1];
const serialize = `(v)=>{const seen=new Map();const go=(x,d)=>{if(x===null||typeof x!=='object'&&typeof x!=='function')return typeof x==='number'&&!Number.isFinite(x)?String(x):x===undefined?'<undefined>':x;if(typeof x==='function')return'<fn '+(x.name||'?')+'>';if(typeof Node!=='undefined'&&x instanceof Node)return'<'+(x.nodeName||'node')+(x.id?'#'+x.id:'')+(x.getAttribute?.('src')?' '+x.getAttribute('src').length+':'+x.getAttribute('src').slice(-40):'')+'>';if(seen.has(x))return'<cycle '+seen.get(x)+'>';seen.set(x,d);if(d>6)return'<deep>';if(x instanceof Map)return{'<Map>':[...x].map(([k,w])=>[go(k,d+1),go(w,d+1)])};if(x instanceof Set)return{'<Set>':[...x].map((w)=>go(w,d+1))};if(Array.isArray(x))return x.map((w)=>go(w,d+1));const o={};for(const k of Object.keys(x))o[k]=go(x[k],d+1);return o};return go(v,0)}`;
const snapNames = [...found].filter((n) => A.bindings.some((b) => b.scope === body && b.name === n && b.kind !== 'function'));
const endMark = 'globalThis.__MANRU_LOADING__=false;' + (snapshotFile ? `{const __s=${serialize};globalThis.__MANRU_SNAPSHOT__={${snapNames.map((n) => `${JSON.stringify(n)}:(()=>{try{return __s(${n})}catch(e){return '<error '+e.message+'>'}})()`).join(',')}}}` : '');
const at = last.type === 'ReturnStatement' ? last.start : last.end;
const shift = unique.filter((e) => e.start < at).reduce((d, e) => d + e.text.length - (e.end - e.start), 0);
rewritten = rewritten.slice(0, at + shift) + '\n' + endMark + '\n' + rewritten.slice(at + shift);
const prelude = `globalThis.__MANRU_LOADING__=true;globalThis.__MANRU_LOAD_HITS__={};
globalThis.__MANRU_LOAD_PROBE__=(n,f)=>{if(!globalThis.__MANRU_LOADING__)return f();const h=(globalThis.__MANRU_LOAD_HITS__[n]||={ok:0,tdz:0,okSite:null,tdzSite:null});const site=()=>String(new Error().stack).split('\\n').slice(2,12).map((l)=>l.trim()).join(' < ');try{const v=f();h.ok++;h.okSite||=site();return v}catch(e){if(e instanceof ReferenceError){h.tdz++;h.tdzSite||=site()}throw e}};
`;
fs.writeFileSync(rtFile, prelude + rewritten);

const situations = [
  ['empty storage', {}],
  ['?debug=1', { query: 'debug=1' }],
  ['mobile 390x844', { viewport: { width: 390, height: 844 }, mobile: true }],
];
const savesDir = path.join(repo, 'tests', 'baseline', 'saves');
for (const f of fs.readdirSync(savesDir).filter((f) => f.endsWith('.json')).sort()) situations.push([`save ${f}`, { storage: JSON.parse(fs.readFileSync(path.join(savesDir, f), 'utf8')).storage }]);

const browser = await launch();
const total = {}, snapshots = {};
for (const [label, o] of situations) {
  const s = await openSession(browser, out, { seed: 1, ...o });
  const r = await s.page.evaluate(() => ({ loading: globalThis.__MANRU_LOADING__, hits: globalThis.__MANRU_LOAD_HITS__, snapshot: globalThis.__MANRU_SNAPSHOT__ }));
  if (snapshotFile) snapshots[label] = r.snapshot;
  if (r.loading !== false) console.log(`${label}: the closure did not finish loading (errors: ${JSON.stringify(s.errors)})`);
  if (s.errors.length) console.log(`${label}: page errors ${JSON.stringify(s.errors)}`);
  for (const [n, h] of Object.entries(r.hits || {})) {
    const t = (total[n] ||= { ok: 0, tdz: 0, okSite: null, tdzSite: null, situations: [] });
    t.ok += h.ok; t.tdz += h.tdz; t.okSite ||= h.okSite; t.tdzSite ||= h.tdzSite; t.situations.push(label);
  }
  await s.close();
}
await browser.close();
if (snapshotFile) fs.writeFileSync(path.resolve(snapshotFile), JSON.stringify(snapshots, null, 1));
console.log(`probed ${found.size} names, ${unique.length} read sites, ${situations.length} boots`);
for (const n of [...found].sort()) {
  const t = total[n];
  if (!t) console.log(`${n}\tnot read at load`);
  else console.log(`${n}\tok ${t.ok} tdz ${t.tdz}\t[${[...new Set(t.situations)].join(', ')}]${t.tdzSite ? `\n  tdz at ${t.tdzSite}` : ''}${t.okSite ? `\n  ok at ${t.okSite}` : ''}`);
}
