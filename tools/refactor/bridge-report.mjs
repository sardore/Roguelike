#!/usr/bin/env node
// Report on the globals the runtime publishes (globalThis.__X__ / window.__X__):
// where they are defined, whether game code reads them, and for object bridges which members
// game code reads. Read-only analysis used to plan the QA / game split (FINDINGS F-09).
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const file = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'src/scripts/10-runtime.js';
const src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const T = (n) => src.slice(n.start, n.end);
const isRoot = (n) => n.type === 'Identifier' && (n.name === 'globalThis' || n.name === 'window');
const bridges = new Map();
const get = (name) => bridges.get(name) || bridges.set(name, { defs: [], reads: [], members: new Map() }).get(name);
const nameOf = (m) => (m.type === 'MemberExpression' && !m.computed && isRoot(m.object) && /^__/.test(m.property.name) ? m.property.name : null);

walk.fullAncestor(ast, (n, _s, anc) => {
  const name = n.type === 'MemberExpression' ? nameOf(n) : null;
  if (!name) return;
  const parent = anc[anc.length - 2];
  const b = get(name);
  const line = n.loc.start.line;
  if (parent.type === 'AssignmentExpression' && parent.left === n) { b.defs.push({ line, rhs: parent.right.type }); return; }
  if (parent.type === 'CallExpression' && parent.callee.type === 'MemberExpression' && /^Object\.(defineProperty|freeze)$/.test(T(parent.callee)) && parent.arguments[0] === n) { b.reads.push({ line, kind: 'freeze' }); return; }
  b.reads.push({ line, kind: 'read' });
  // member access  X.member / X?.member
  if (parent.type === 'MemberExpression' && parent.object === n && !parent.computed) {
    b.members.set(parent.property.name, (b.members.get(parent.property.name) || 0) + 1);
  }
});
// Aliases: `const api = window.__X__` (also `a = window.__X__ || ...`). Member reads through the alias
// count for the bridge. Matching is by name only, so it can over-count reads (the safe direction).
const aliasOf = new Map();
walk.simple(ast, {
  VariableDeclarator(n) {
    let init = n.init; while (init && init.type === 'LogicalExpression') init = init.left;
    const name = init && init.type === 'MemberExpression' ? nameOf(init) : null;
    if (name && n.id.type === 'Identifier') aliasOf.set(n.id.name, name);
  },
});
walk.fullAncestor(ast, (n, _s, anc) => {
  if (n.type !== 'MemberExpression' || n.computed || n.object.type !== 'Identifier' || !aliasOf.has(n.object.name)) return;
  const parent = anc[anc.length - 2];
  if (parent.type === 'AssignmentExpression' && parent.left === n) return;
  const b = get(aliasOf.get(n.object.name));
  b.members.set(n.property.name, (b.members.get(n.property.name) || 0) + 1);
});
// defineProperty(globalThis,'__X__',...)
walk.simple(ast, {
  CallExpression(n) {
    if (T(n.callee) === 'Object.defineProperty' && isRoot(n.arguments[0]) && n.arguments[1]?.type === 'Literal' && /^__/.test(n.arguments[1].value)) get(n.arguments[1].value).defs.push({ line: n.loc.start.line, rhs: 'defineProperty' });
  },
});
// Members each bridge defines: object-literal keys on the assigned value (spread/Object.assign
// sources are followed one level), plus later `X.member = ...` assignments.
const defined = new Map();
const addDef = (name, key, line) => { if (!defined.has(name)) defined.set(name, new Map()); defined.get(name).set(key, line); };
const literalKeys = (o, name) => { for (const p of o.properties) if (p.type === 'Property' && !p.computed) addDef(name, p.key.name ?? p.key.value, p.loc.start.line); };
walk.fullAncestor(ast, (n, _s, anc) => {
  const parent = anc[anc.length - 2];
  const name = n.type === 'MemberExpression' ? nameOf(n) : null;
  if (name && parent.type === 'AssignmentExpression' && parent.left === n && parent.right.type === 'ObjectExpression') literalKeys(parent.right, name);
  if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && !n.left.computed) {
    const base = n.left.object.type === 'MemberExpression' ? nameOf(n.left.object) : null;
    if (base) addDef(base, n.left.property.name, n.loc.start.line);
  }
});
// Reads of the members from test code (tests/*.mjs), by textual match.
const testsText = fs.readdirSync('tests').filter((f) => f.endsWith('.mjs')).map((f) => fs.readFileSync('tests/' + f, 'utf8')).join('\n');
const testReads = (name, member) => new RegExp(`${name}\\??\\.${member}\\b`).test(testsText);
const out = [...bridges].map(([name, b]) => ({
  name,
  defs: b.defs.map((d) => d.line),
  gameReads: b.reads.filter((r) => r.kind === 'read').length,
  members: Object.fromEntries([...b.members].sort((a, c) => c[1] - a[1])),
  defined: Object.fromEntries([...(defined.get(name) || [])].map(([k, line]) => [k, { line, reads: b.members.get(k) || 0, test: testReads(name, k) }])),
  testReadsObject: new RegExp(name + '\\b').test(testsText),
}));
out.sort((a, b) => b.gameReads - a.gameReads || a.name.localeCompare(b.name));
if (process.argv.includes('--md')) {
  const L = ['# 공개 전역(브리지) 판정표', '', '`node tools/refactor/bridge-report.mjs --md`가 만든다. 멤버가 게임 코드·별칭을 통해 읽히는지, 테스트가 읽는지로 가른다.', '',
    '- **게임**: 런타임 안 어디선가 읽는다 (감사 함수가 생성 검증에 쓰이는 경우 포함).', '- **테스트**: 테스트만 읽는다.', '- **미사용**: 코드도 테스트도 읽지 않는다. 콘솔에서 손으로 부르는 용도일 수 있다.', ''];
  for (const x of out) {
    const d = Object.entries(x.defined);
    const g = d.filter(([, v]) => v.reads), t = d.filter(([, v]) => !v.reads && v.test), u = d.filter(([, v]) => !v.reads && !v.test);
    const kind = !x.gameReads && !x.testReadsObject ? '전체 미사용' : g.length || x.gameReads ? '게임 사용' : '테스트 전용';
    L.push(`## ${x.name} — ${kind} (줄 ${x.defs.join(',')})`);
    if (g.length) L.push(`- 게임: ${g.map(([k, v]) => `${k}(${v.reads})`).join(', ')}`);
    if (t.length) L.push(`- 테스트: ${t.map(([k]) => k).join(', ')}`);
    if (u.length) L.push(`- 미사용: ${u.map(([k]) => k).join(', ')}`);
    L.push('');
  }
  console.log(L.join('\n'));
} else console.log(JSON.stringify(out, null, 1));
