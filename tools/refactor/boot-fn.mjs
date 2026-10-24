#!/usr/bin/env node
// Refactor tool: turns a run of loose top-level statements of spine.js (boot code) into a named function of a domain file and puts
// the call where the statements stood, so everything runs in the same order. Works on the work file (node tools/game.mjs assemble ... split).
//   node tools/refactor/boot-fn.mjs <work.js> <spec.json> [--dry]
// spec: { "groups": [ { "name": "buildCookingPanel", "dest": "items.js",
//                       "anchor": "cookingPanel.id='cook57'",   source text the first statement starts with (unique unless "occurrence" is given)
//                       "occurrence": 0,                         which match when the anchor is not unique
//                       "count": 6,                              how many loose statements the function takes (function declarations in between do not count)
//                       "absorb": ["m"] } ] }                    const/let declarations (directly before the first statement or between the statements)
//                                                                that nothing outside the group reads: they become locals of the function
// Function declarations that stand inside the run stay in spine.js, after the call (they are hoisted, they execute nothing).
// Refused, nothing written (exit 1): an anchor that is missing or ambiguous, a declaration inside the run that is not absorbed,
// an absorbed name used outside the group, return/await/yield/this/arguments/var at the top level of a statement, a name already used.
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const [work, specFile] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
let text = fs.readFileSync(work, 'utf8');
const fail = (m) => { console.error(m); process.exit(1); };
const ast = acorn.parse(text, { ecmaVersion: 'latest', locations: true });
const closure = ast.body[0].expression.callee.body, top = closure.body;
const A = analyze(ast);
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index, bodyAt: m.index + m[0].length }));
const seg = (p) => { let c = null; for (const m of marks) if (m.at <= p) c = m.file; return c; };
const taken = new Set(A.bindings.filter((b) => b.scope === closure).map((b) => b.name));
const isDecl = (s) => s.type === 'VariableDeclaration' || s.type === 'ClassDeclaration';
const declNames = (s) => (s.type === 'VariableDeclaration' ? s.declarations.map((d) => d.id.name) : s.type === 'ClassDeclaration' ? [s.id.name] : []);
const norm = (t) => t.replace(/\s+/g, ' ');
const deferredAnc = (anc) => anc.some((a) => /Function/.test(a.type));

const edits = [], appended = {};
const used = new Set();
for (const g of spec.groups) {
  if (!g.name || !g.dest || !g.anchor || !(g.count >= 1)) fail(`bad group ${JSON.stringify(g)}`);
  if (taken.has(g.name)) fail(`${g.name}: the name is already used`);
  taken.add(g.name);
  const loose = top.map((s, i) => ({ s, i })).filter(({ s }) => seg(s.start) === 'spine.js' && s.type !== 'FunctionDeclaration' && !isDecl(s));
  const hits = loose.filter(({ s }) => norm(text.slice(s.start, s.end)).startsWith(norm(g.anchor)));
  if (!hits.length) fail(`${g.name}: no loose statement of spine.js starts with ${JSON.stringify(g.anchor)}`);
  if (hits.length > 1 && g.occurrence == null) fail(`${g.name}: ${hits.length} statements start with ${JSON.stringify(g.anchor)}; give "occurrence"`);
  const startIdx = hits[g.occurrence ?? 0].i;
  const absorb = new Set(g.absorb || []);
  const inGroup = [], lifted = [], absorbedDecls = [];
  // absorbed declarations that stand directly before the first statement
  let from = startIdx;
  while (from > 0 && isDecl(top[from - 1]) && declNames(top[from - 1]).every((n) => absorb.has(n))) from--;
  let count = 0, i = from;
  for (; i < top.length && count < g.count; i++) {
    const s = top[i];
    if (seg(s.start) !== 'spine.js') fail(`${g.name}: the run leaves spine.js`);
    if (s.type === 'FunctionDeclaration') { lifted.push(s); continue; }
    if (isDecl(s)) { if (!declNames(s).every((n) => absorb.has(n))) fail(`${g.name}: a declaration (${declNames(s).join(',')}) stands inside the run and is not absorbed`); absorbedDecls.push(s); inGroup.push(s); continue; }
    inGroup.push(s); count++;
  }
  if (count !== g.count) fail(`${g.name}: only ${count} statements available`);
  const last = inGroup.at(-1);
  // trailing function declarations after the last statement are not part of the run
  const members = new Set(inGroup);
  for (const s of inGroup) {
    if (used.has(s)) fail(`${g.name}: overlaps another group`);
    used.add(s);
    walk.ancestor(s, {
      ReturnStatement(n, _st, anc) { if (!deferredAnc(anc)) fail(`${g.name}: a top-level return`); },
      AwaitExpression(n, _st, anc) { if (!deferredAnc(anc)) fail(`${g.name}: a top-level await`); },
      YieldExpression(n, _st, anc) { if (!deferredAnc(anc)) fail(`${g.name}: a top-level yield`); },
      ThisExpression(n, _st, anc) { if (!anc.some((a) => a.type === 'FunctionDeclaration' || a.type === 'FunctionExpression')) fail(`${g.name}: this at the top level`); },
      Identifier(n, _st, anc) { if (n.name === 'arguments' && !anc.some((a) => a.type === 'FunctionDeclaration' || a.type === 'FunctionExpression')) fail(`${g.name}: arguments at the top level`); },
      VariableDeclaration(n, _st, anc) { if (n.kind === 'var' && !deferredAnc(anc)) fail(`${g.name}: a top-level var`); },
    });
  }
  // an absorbed name must not be read or written outside the group
  for (const d of absorbedDecls) for (const name of declNames(d)) {
    const b = A.bindings.find((x) => x.name === name && x.scope === closure);
    for (const r of b.refs) { const owner = top.find((t) => t.start <= r.node.start && r.node.end <= t.end); if (!members.has(owner) && owner !== d) fail(`${g.name}: ${name} is used outside the group (line ${r.node.loc.start.line})`); }
  }
  // text: each member with the comments/blank lines in front of it; lifted function declarations stay in spine.js after the call
  const pieces = [];
  let prevEnd = null;
  const span = top.slice(from, top.indexOf(last) + 1);
  const spineBody = marks.find((m) => m.file === 'spine.js').bodyAt;
  const spanStart = Math.max(spineBody - 1, from > 0 ? top[from - 1].end : closure.start); // never reaches back over the file sentinel
  let cursor = spanStart;
  let liftedText = '';
  for (const s of span) {
    const gap = text.slice(cursor, s.start);
    if (s.type === 'FunctionDeclaration') { liftedText += gap + text.slice(s.start, s.end); }
    else pieces.push(gap.replace(/^[^\S\n]*\n/, '') + text.slice(s.start, s.end));
    cursor = s.end;
  }
  const body = pieces.map((p) => '  ' + p.replace(/^\n+/, '').replace(/\n/g, '\n  ')).join('\n');
  // keep the line break the spine had before the span; the call stands on the first line
  edits.push({ start: spanStart, end: last.end, text: `\n${g.name}();${liftedText}` });
  const destMark = marks.find((m) => m.file === g.dest);
  if (!destMark) fail(`${g.name}: no file ${g.dest}`);
  (appended[g.dest] ||= []).push(`function ${g.name}(){\n${body}\n}\n`);
}
const out0 = text;
edits.sort((a, b) => b.start - a.start);
for (let k = 1; k < edits.length; k++) if (edits[k].end > edits[k - 1].start) fail('overlapping edits');
let out = out0;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
for (const [file, fns] of Object.entries(appended)) {
  const marksNow = [...out.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)];
  const k = marksNow.findIndex((m) => m[1] === file);
  const at = k + 1 < marksNow.length ? marksNow[k + 1].index : out.indexOf('\n})();', marksNow[k].index);
  out = out.slice(0, at) + (out.slice(0, at).endsWith('\n') ? '' : '\n') + fns.join('') + out.slice(at);
}
acorn.parse(out, { ecmaVersion: 'latest' });
console.log(`${spec.groups.length} groups -> functions: ${spec.groups.map((g) => `${g.name}@${g.dest}`).join(', ')}`);
if (!dry) fs.writeFileSync(work, out);
