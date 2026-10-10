#!/usr/bin/env node
// Refactor tool: dynamic evidence for collapsing function rebinding chains.
//
//   node tools/refactor/chain-probe.mjs <src dir> <out dir>
//
// Copies the source tree and instruments 10-runtime.js:
//   * every layer of a rebinding chain (the declaration and each reassigned function)
//     counts its calls in globalThis.__chainHit['name@line'];
//   * calls made before the chain's last assignment has executed are also counted in
//     globalThis.__chainEarly — those are the calls that would change if the final
//     definition became the (hoisted) declaration.
// tests/chain-probe-run.mjs drives the instrumented copy and reports the counters.
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import { analyze } from '../lib/scope.mjs';

const [srcDir, outDir] = process.argv.slice(2).map((p) => path.resolve(p));
fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync(srcDir, outDir, { recursive: true });
const file = path.join(outDir, 'scripts', '10-runtime.js');
let src = fs.readFileSync(file, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true });
const A = analyze(ast);
const isFn = (n) => n && (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression');

const inserts = []; // {at, text}
const chains = [];
for (const b of A.bindings) {
  const fnBinding = b.kind === 'function' || (isFn(b.decl?.init) && b.kind !== 'param');
  if (!fnBinding) continue;
  const assigns = b.refs.filter((r) => r.parent.type === 'AssignmentExpression' && r.parent.left === r.node && isFn(r.parent.right));
  if (!assigns.length) continue;
  const id = `${b.name}@${b.idNode.loc.start.line}`;
  const layers = [];
  const declFn = b.kind === 'function' ? b.decl : b.decl.init;
  layers.push({ fn: declFn, line: b.idNode.loc.start.line });
  for (const r of assigns) layers.push({ fn: r.parent.right, line: r.node.loc.start.line, stmt: r.ancestors.findLast((a) => a.type === 'ExpressionStatement') });
  const last = layers.at(-1);
  const key = JSON.stringify(id);
  for (const l of layers) {
    const tag = JSON.stringify(`${b.name}@${l.line}`);
    const probe = `globalThis.__chainHit[${tag}]=(globalThis.__chainHit[${tag}]||0)+1;if(!globalThis.__chainFinal[${key}])globalThis.__chainEarly[${tag}]=(globalThis.__chainEarly[${tag}]||0)+1;`;
    if (l.fn.body.type === 'BlockStatement') inserts.push({ at: l.fn.body.start + 1, text: probe });
    else {
      inserts.push({ at: l.fn.body.start, text: `((()=>{${probe}})(),(` });
      inserts.push({ at: l.fn.body.end, text: '))' });
    }
  }
  if (!last.stmt) throw new Error('final layer of ' + id + ' is not a statement');
  inserts.push({ at: last.stmt.end, text: `;globalThis.__chainFinal[${key}]=1;` });
  chains.push({ id, layers: layers.map((l) => l.line) });
}
const outerBodyNode = ast.body[0].expression.callee.body;
const first = outerBodyNode.body[0];
const outerStart = first?.directive ? first.end : outerBodyNode.start + 1;
inserts.push({ at: outerStart, text: 'globalThis.__chainHit={};globalThis.__chainEarly={};globalThis.__chainFinal={};' });
inserts.sort((a, b) => b.at - a.at);
for (const i of inserts) src = src.slice(0, i.at) + i.text + src.slice(i.at);
acorn.parse(src, { ecmaVersion: 'latest' });
fs.writeFileSync(file, src);
fs.writeFileSync(path.join(outDir, 'chains.json'), JSON.stringify(chains, null, 1));
console.log(`instrumented ${chains.length} chains`);
