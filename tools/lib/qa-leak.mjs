// The release build ships the runtime without src/qa/qa.js. This finds everything the runtime reads
// that only qa.js provides, which would silently be missing (or throw) in a release build:
//   - a name declared at the top level of qa.js (function/const/let) that the runtime refers to
//   - a member that only qa.js defines on a published bridge (window.__X__.m / globalThis.__X__.m),
//     read directly or through `const api = window.__X__`
//   - a bridge that only qa.js assigns, read by the runtime
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from './scope.mjs';

const parse = (s) => acorn.parse(s, { ecmaVersion: 'latest', locations: true });
const isRoot = (n) => n.type === 'Identifier' && (n.name === 'globalThis' || n.name === 'window');
const bridgeName = (n) => (n.type === 'MemberExpression' && !n.computed && isRoot(n.object) && /^__/.test(n.property.name) ? n.property.name : null);

export function findQaLeaks(runtimeSrc, qaSrc) {
  const leaks = [];
  const qaAst = parse(qaSrc), ast = parse(runtimeSrc), A = analyze(ast);
  // names the QA file declares
  const qaNames = new Set();
  for (const s of qaAst.body) {
    if (s.type === 'FunctionDeclaration') qaNames.add(s.id.name);
    else if (s.type === 'VariableDeclaration') for (const d of s.declarations) if (d.id.type === 'Identifier') qaNames.add(d.id.name);
  }
  // bridge members / whole bridges the QA file defines
  const members = new Map(), wholly = new Set();
  const addMember = (b, m) => (members.get(b) || members.set(b, new Set()).get(b)).add(m);
  walk.simple(qaAst, {
    AssignmentExpression(n) {
      if (n.left.type !== 'MemberExpression') return;
      const whole = bridgeName(n.left);
      if (whole) { wholly.add(whole); if (n.right.type === 'ObjectExpression') for (const p of n.right.properties) if (p.type === 'Property' && !p.computed) addMember(whole, p.key.name ?? p.key.value); return; }
      if (!n.left.computed && n.left.object.type === 'MemberExpression') { const b = bridgeName(n.left.object); if (b) addMember(b, n.left.property.name); }
    },
  });
  // runtime: names that resolve to no binding in the runtime but exist in qa.js
  for (const r of A.refs) if (!r.binding && qaNames.has(r.node.name)) leaks.push(`name ${r.node.name} (line ${r.node.loc.start.line})`);
  // runtime members: only those the runtime itself never defines
  const own = new Map();
  walk.simple(ast, {
    AssignmentExpression(n) {
      if (n.left.type !== 'MemberExpression') return;
      const whole = bridgeName(n.left);
      if (whole) { if (n.right.type === 'ObjectExpression') for (const p of n.right.properties) if (p.type === 'Property' && !p.computed) (own.get(whole) || own.set(whole, new Set()).get(whole)).add(p.key.name ?? p.key.value); (own.get(whole) || own.set(whole, new Set()).get(whole)).add('*'); return; }
      if (!n.left.computed && n.left.object.type === 'MemberExpression') { const b = bridgeName(n.left.object); if (b) (own.get(b) || own.set(b, new Set()).get(b)).add(n.left.property.name); }
    },
  });
  const check = (b, m, line, via) => { if (members.get(b)?.has(m) && !own.get(b)?.has(m)) leaks.push(`member ${b}.${m} (line ${line}, ${via})`); };
  walk.fullAncestor(ast, (n, _s, anc) => {
    if (n.type !== 'MemberExpression' || n.computed) return;
    const p = anc[anc.length - 2];
    if (p.type === 'AssignmentExpression' && p.left === n) return;
    const b = bridgeName(n.object);
    if (b) check(b, n.property.name, n.loc.start.line, 'direct');
    const whole = bridgeName(n);
    if (whole && wholly.has(whole) && !own.get(whole)?.has('*') && !(p.type === 'MemberExpression' && p.object === n)) leaks.push(`bridge ${whole} (line ${n.loc.start.line})`);
  });
  for (const bind of A.bindings) {
    const d = bind.decl; if (!d?.init) continue;
    let i = d.init; while (i && i.type === 'LogicalExpression') i = i.left;
    const b = i && bridgeName(i); if (!b) continue;
    for (const r of bind.refs) { const p = r.parent; if (p.type === 'MemberExpression' && p.object === r.node && !p.computed && !(r.ancestors.at(-1)?.type === 'AssignmentExpression' && r.ancestors.at(-1).left === p)) check(b, p.property.name, p.loc.start.line, `alias ${bind.name}`); }
  }
  return [...new Set(leaks)];
}
