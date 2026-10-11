#!/usr/bin/env node
// Refactor tool: delete a rebinding chain that nothing uses: the declaration, every
// reassignment and every alias. Refuses if the binding or any alias is referenced anywhere
// outside the chain's own layers.
//   node tools/refactor/drop-dead-chain.mjs <file> <name> [<name> ...] [--dry]
import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { analyze } from '../lib/scope.mjs';

const args = process.argv.slice(2);
const file = args[0];
const dry = args.includes('--dry');
let src = fs.readFileSync(file, 'utf8');
for (const name of args.slice(1).filter((a) => !a.startsWith('--'))) {
  const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
  const A = analyze(ast);
  const b = A.bindings.find((x) => x.name === name && x.refs.some((r) => r.parent.type === 'AssignmentExpression' && r.parent.left === r.node));
  if (!b) throw new Error(`${name}: no rebound binding`);
  const writes = b.refs.filter((r) => r.parent.type === 'AssignmentExpression' && r.parent.left === r.node);
  const aliasRefs = b.refs.filter((r) => r.parent.type === 'VariableDeclarator' && r.parent.init === r.node);
  const aliases = aliasRefs.map((r) => A.bindings.find((x) => x.decl === r.parent));
  const ranges = [...writes.map((w) => w.parent.right), b.kind === 'function' ? b.decl : null].filter(Boolean);
  const inChain = (n) => ranges.some((f) => n.start >= f.start && n.end <= f.end);
  const outside = [
    ...b.refs.filter((r) => !writes.includes(r) && !aliasRefs.includes(r) && !inChain(r.node)),
    ...aliases.flatMap((a) => a.refs.filter((r) => !inChain(r.node))),
  ];
  if (outside.length) throw new Error(`${name}: still used at ${outside.map((r) => r.node.loc.start.line).join(',')}`);
  const stmtOf = (n) => { let hit = null; walk.ancestor(ast, { ExpressionStatement(s) { if (s.expression === n) hit = s; }, VariableDeclaration(s) { if (s.declarations.length === 1 && s.declarations[0] === n) hit = s; } }); return hit; };
  const cuts = [];
  for (const w of writes) { const s = stmtOf(w.parent); if (!s) throw new Error(`${name}: write at ${w.node.loc.start.line} is not a plain statement`); cuts.push(s); }
  for (const a of aliases) { const s = stmtOf(a.decl); if (!s) throw new Error(`${name}: alias ${a.name} shares a declaration`); cuts.push(s); }
  if (b.kind === 'function') cuts.push(b.decl);
  else { const s = stmtOf(b.decl); if (!s) throw new Error(`${name}: declaration shares a statement`); cuts.push(s); }
  cuts.sort((x, y) => y.start - x.start);
  for (const c of cuts) src = src.slice(0, c.start) + '\u0001' + src.slice(c.end);
  src = src.split('\n').filter((l) => !(l.includes('\u0001') && /^[\s\u0001;]*$/.test(l))).join('\n').replaceAll('\u0001', '');
  acorn.parse(src, { ecmaVersion: 'latest' });
  console.log(`${name}: dropped declaration, ${writes.length} reassignment(s), ${aliases.length} alias(es)`);
}
if (!dry) fs.writeFileSync(file, src);
