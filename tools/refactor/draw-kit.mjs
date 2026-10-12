#!/usr/bin/env node
// Refactor tool (F-16): the sprite painters each define the same two canvas helpers as local arrow
// functions over their own context, e.g. `r=(c,a,b,w,h)=>{q.fillStyle=c;q.fillRect(a,b,w,h)}` and
// `poly=(c,pts)=>{...fill...}`. This replaces every such declarator by a destructuring of
// `drawKit(ctx)` (the one definition, in render.js); call sites are untouched.
//   node tools/refactor/draw-kit.mjs <work.js> [--dry]
// A declarator is replaced only when its canonical text (identifiers renamed by first appearance)
// equals the kit's, and its context identifier is a parameter, a const, or a binding that is never
// assigned and is declared before the helper (so binding it earlier cannot change which canvas it draws on).
import fs from 'node:fs';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';

const [work] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dry = process.argv.includes('--dry');
let text = fs.readFileSync(work, 'utf8');

const KIT = {
  r: '(v0,v1,v2,v3,v4)=>{v5.fillStyle=v0;v5.fillRect(v1,v2,v3,v4)}',
  poly: '(v0,v1)=>{v2.fillStyle=v0;v2.beginPath();v1.forEach(([v3,v4],v5)=>v5?v2.lineTo(v3,v4):v2.moveTo(v3,v4));v2.closePath();v2.fill()}',
};
const canon = (src) => {
  const map = new Map();
  const out = src.replace(/\s+/g, '').replace(/;}/g, '}').replace(/(?<![.\w$])[A-Za-z_$][\w$]*/g, (m) => {
    if (!map.has(m)) map.set(m, 'v' + map.size);
    return map.get(m);
  });
  return out;
};
const kitCanon = Object.fromEntries(Object.entries(KIT).map(([k, v]) => [k, v]));

const ast = acorn.parse(text, { ecmaVersion: 'latest' });
const A = analyze(ast);
const refAt = new Map(A.refs.map((r) => [r.node, r]));
const hits = []; // {declaration, declarator, helper, ctx}
const walkNodes = (n, fn) => { if (!n || typeof n.type !== 'string') return; fn(n); for (const k of Object.keys(n)) { const v = n[k]; if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === 'string' && walkNodes(c, fn)); else if (v && typeof v.type === 'string') walkNodes(v, fn); } };
walkNodes(ast, (n) => {
  if (n.type !== 'VariableDeclaration') return;
  for (const d of n.declarations) {
    const f = d.init;
    if (d.id.type !== 'Identifier' || !f || f.type !== 'ArrowFunctionExpression' || f.body.type !== 'BlockStatement') continue;
    const src = text.slice(f.start, f.end);
    // the context is the identifier whose members the body assigns/calls: take it from the first `X.` in the body
    const m = /^\(([^)]*)\)=>\s*\{\s*([A-Za-z_$][\w$]*)\./.exec(src.replace(/\n/g, ' '));
    if (!m) continue;
    const ctxName = m[2];
    const c = canon(src);
    const helper = Object.keys(kitCanon).find((k) => kitCanon[k] === c);
    if (!helper) continue;
    // resolve the context reference inside the helper
    let ctxRef = null;
    walkNodes(f.body, (x) => { if (!ctxRef && x.type === 'Identifier' && x.name === ctxName && refAt.has(x)) ctxRef = refAt.get(x); });
    const b = ctxRef?.binding;
    if (!b) continue;
    const writes = b.refs.some((r) => (r.parent.type === 'AssignmentExpression' && r.parent.left === r.node) || r.parent.type === 'UpdateExpression');
    const before = b.kind === 'param' || (b.idNode.start < d.start);
    if (writes || !before || !['const', 'let', 'param'].includes(b.kind)) continue;
    hits.push({ declaration: n, declarator: d, helper, ctx: ctxName, local: d.id.name });
  }
});

const edits = [];
const byDecl = new Map();
for (const h of hits) (byDecl.get(h.declaration) || byDecl.set(h.declaration, []).get(h.declaration)).push(h);
let converted = 0;
for (const [decl, list] of byDecl) {
  // group by context name; the first declarator of a group becomes the destructuring, the others are removed
  const groups = new Map();
  for (const h of list) (groups.get(h.ctx) || groups.set(h.ctx, []).get(h.ctx)).push(h);
  const all = decl.declarations;
  const removed = new Set();
  for (const [ctx, gs] of groups) {
    const pat = gs.map((g) => (g.local === g.helper ? g.helper : `${g.helper}:${g.local}`)).join(',');
    const first = gs[0].declarator;
    edits.push({ start: first.start, end: first.end, text: `{${pat}}=drawKit(${ctx})` });
    for (const g of gs.slice(1)) removed.add(g.declarator);
    converted += gs.length;
  }
  // delete the other declarators (and one adjoining comma)
  for (const d of removed) {
    const i = all.indexOf(d);
    if (i < all.length - 1) edits.push({ start: d.start, end: all[i + 1].start, text: '' });
    else edits.push({ start: all[i - 1].end, end: d.end, text: '' });
  }
}
// overlapping edits (a removed declarator next to another removed one) are merged by applying from the end
edits.sort((a, b) => b.start - a.start);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error('overlapping edits; run again after fixing the tool');
for (const e of edits) text = text.slice(0, e.start) + e.text + text.slice(e.end);
acorn.parse(text, { ecmaVersion: 'latest' });
console.log(`${converted} helper declarators -> drawKit (${byDecl.size} declarations)`);
if (!dry) fs.writeFileSync(work, text);
