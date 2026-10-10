#!/usr/bin/env node
// Refactor tool: delete function declarations (and const/let bound to function expressions)
// that nothing references, repeating until no more become unused. A function that is only
// referenced from inside its own body counts as unused. The runtime has no eval, no
// new Function and no window[name]/globalThis[name] lookups, so an unreferenced binding is
// dead code.
//   node tools/refactor/remove-unused.mjs <file> [--dry] [--only name,name]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const args = process.argv.slice(2);
const file = args[0];
const dry = args.includes('--dry');
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : null;
let src = fs.readFileSync(file, 'utf8');
const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');
const removed = [];
for (let round = 0; round < 50; round++) {
  const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
  const A = analyze(ast);
  const dead = [];
  for (const b of A.bindings) {
    if (only && !only.has(b.name)) continue;
    let node = null;
    if (b.kind === 'function') node = b.decl;
    else if ((b.kind === 'const' || b.kind === 'let') && isFn(b.decl?.init) && b.decl.id.type === 'Identifier') node = b.decl;
    if (!node) continue;
    const body = b.kind === 'function' ? b.decl : b.decl.init;
    const outside = b.refs.filter((r) => !(r.node.start >= body.start && r.node.end <= body.end));
    if (outside.length) continue;
    if (b.kind !== 'function') {
      let vd = null;
      walk.full(ast, (n) => { if (n.type === 'VariableDeclaration' && n.declarations.includes(b.decl)) vd = n; });
      if (!vd || vd.declarations.length !== 1) continue;
      node = vd;
    }
    dead.push({ name: b.name, line: b.idNode.loc.start.line, start: node.start, end: node.end });
  }
  // drop nested duplicates (a dead function inside a dead function)
  const outer = dead.filter((d) => !dead.some((o) => o !== d && o.start <= d.start && o.end >= d.end));
  if (!outer.length) break;
  outer.sort((a, b) => b.start - a.start);
  for (const d of outer) src = src.slice(0, d.start) + '\u0001' + src.slice(d.end);
  src = src.split('\n').filter((l) => !(l.includes('\u0001') && /^[\s\u0001;]*$/.test(l))).join('\n').replaceAll('\u0001', '');
  removed.push(...outer.map((d) => `${d.name}@${d.line}`));
}
acorn.parse(src, { ecmaVersion: 'latest' });
console.log(`removed ${removed.length}: ${removed.join(' ')}`);
if (!dry) fs.writeFileSync(file, src);
