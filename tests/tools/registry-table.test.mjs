// tools/refactor/registry-table.mjs on a small work file: registration calls become table entries, inline functions become
// named declarations in the file their body uses most, and each refusal writes nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const node = process.execPath;
const tool = path.resolve('tools/refactor/registry-table.mjs');

function work(parts, spec) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-table-'));
  const text = '(()=>{\n"use strict";\n' + Object.entries(parts).map(([f, t]) => `/*@@FILE ${f}@@*/\n${t}\n`).join('') + '})();\n';
  const w = path.join(dir, 'work.js'), s = path.join(dir, 'spec.json');
  fs.writeFileSync(w, text); fs.writeFileSync(s, JSON.stringify(spec));
  return { text, run: () => { const p = spawnSync(node, [tool, w, s], { encoding: 'utf8' }); return { code: p.status, out: p.stdout + p.stderr, after: fs.readFileSync(w, 'utf8') }; } };
}

test('a Map of routes: calls become entries in source order, inline functions are named and placed by what they use', () => {
  const k = work({
    'a.js': 'const A1=1;\nconst ROUTES=new Map();\nfunction reg(t,f){ROUTES.set(t,f)}\nreg("go",()=>A1);',
    'b.js': 'const B1=2;\nreg("stop",function(x){return B1+x});\nreg("same",existing);\nfunction existing(){}',
  }, { callees: ['reg'], container: { decl: 'ROUTES', kind: 'map' }, entry: { form: 'pair' }, names: { stop: 'haltHandler' }, autoName: { suffix: 'Route', defaultDest: 'a.js' }, removeFunctions: ['reg'] });
  const r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /const ROUTES=new Map\(\[\["go",goRoute\],\["stop",haltHandler\],\["same",existing\]\]\)/);
  assert.match(r.after, /function goRoute\(\)\{return A1\}/);
  assert.match(r.after, /function haltHandler\(x\)\{return B1\+x\}/);
  assert.doesNotMatch(r.after, /reg\(/);
  assert.ok(r.after.indexOf('function goRoute') < r.after.indexOf('/*@@FILE b.js@@*/'), 'goRoute stays with A1 in a.js');
  assert.ok(r.after.indexOf('function haltHandler') > r.after.indexOf('/*@@FILE b.js@@*/'), 'haltHandler goes to b.js with B1');
});

test('a value container keeps the last call and drops the earlier ones', () => {
  const k = work({
    'a.js': 'const P={base:null,stages:[]};\nfunction setBase(id,fn){P.base={id,fn}}\nfunction oldBase(){return 0}\nfunction sharedBase(){return 9}\nsetBase("zero",oldBase);\nsetBase("one",sharedBase);\nsetBase("two",function(){return 2});\nconst keep=sharedBase;',
  }, { callees: ['setBase'], container: { decl: 'P', kind: 'value', prop: 'base' }, entry: { form: 'obj', fields: { id: 0, fn: 1 } }, autoName: { suffix: 'Base', defaultDest: 'a.js' }, removeFunctions: ['setBase'] });
  const r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /base:\{id:"two",fn:twoBase\}/);
  assert.doesNotMatch(r.after, /oneBase/);
  assert.doesNotMatch(r.after, /oldBase/, 'a function only an overwritten call used goes with it');
  assert.match(r.after, /function sharedBase/, 'a function that something else still uses stays');
});

test('refuses a call that is not a top-level statement, a function still used elsewhere, and a taken name; nothing is written', () => {
  let k = work({ 'a.js': 'const R=new Map();\nfunction reg(t,f){R.set(t,f)}\nreg("y",()=>2);\nif(true)reg("x",()=>1);' }, { callees: ['reg'], container: { decl: 'R', kind: 'map' }, entry: { form: 'pair' }, autoName: { suffix: 'Route', defaultDest: 'a.js' } });
  let r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /top-level statements/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'const R=new Map();\nfunction reg(t,f){R.set(t,f)}\nreg("x",()=>1);\nfunction other(){return reg}' }, { callees: ['reg'], container: { decl: 'R', kind: 'map' }, entry: { form: 'pair' }, autoName: { suffix: 'Route', defaultDest: 'a.js' }, removeFunctions: ['reg'] });
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /still used outside/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'const R=new Map();\nfunction reg(t,f){R.set(t,f)}\nfunction xRoute(){}\nreg("x",()=>1);' }, { callees: ['reg'], container: { decl: 'R', kind: 'map' }, entry: { form: 'pair' }, autoName: { suffix: 'Route', defaultDest: 'a.js' } });
  r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /already used/); assert.equal(r.after, k.text);
});

test('an arrow function that uses this or arguments is refused; a stage object with pre and post becomes two functions', () => {
  let k = work({ 'a.js': 'const R=new Map();\nfunction reg(t,f){R.set(t,f)}\nreg("x",function(){return ()=>arguments.length});' }, { callees: ['reg'], container: { decl: 'R', kind: 'map' }, entry: { form: 'pair' }, autoName: { suffix: 'Route', defaultDest: 'a.js' } });
  assert.equal(k.run().code, 0); // the outer function is a function expression: allowed; the arrow inside is part of its body
  k = work({ 'a.js': 'const R=new Map();\nfunction reg(t,f){R.set(t,f)}\nreg("x",()=>this);' }, { callees: ['reg'], container: { decl: 'R', kind: 'map' }, entry: { form: 'pair' }, autoName: { suffix: 'Route', defaultDest: 'a.js' } });
  const r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /this\/arguments/);
  k = work({ 'a.js': 'const T={stages:[]};\nfunction reg(id,s){T.stages.push({id,...s})}\nreg("t",{pre(){return 1},post:()=>2});' }, { callees: ['reg'], container: { decl: 'T', kind: 'prop', prop: 'stages' }, entry: { form: 'obj', fields: { id: 0, pre: '1.pre', post: '1.post' }, defaults: { pre: 'null', post: 'null' } }, fnFields: ['pre', 'post'], autoName: { suffix: 'Turn', defaultDest: 'a.js' }, removeFunctions: ['reg'] });
  const r2 = k.run();
  assert.equal(r2.code, 0, r2.out);
  assert.match(r2.after, /stages:\[\{id:"t",pre:tPreTurn,post:tPostTurn\}\]/);
});

test('a removed member must not be referenced elsewhere; a published global loses its copy of the member', () => {
  const base = { callees: ['E.register'], container: { decl: 'E', kind: 'prop', prop: 'stages' }, entry: { form: 'obj', fields: { id: 0, post: '1.post' }, defaults: { post: 'null' } }, fnFields: ['post'], autoName: { suffix: 'Turn', defaultDest: 'a.js' } };
  let k = work({ 'a.js': 'const E={stages:[],register(id,s){E.stages.push({id,...s})}};\nE.register("t",{post(){return 1}});\nconst use=E.register;' }, { ...base, removeMembers: [{ decl: 'E', member: 'register' }] });
  let r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /E\.register is still referenced/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'const E={stages:[],register(id,s){E.stages.push({id,...s})}};\nglobalThis.PUB={register:E.register,abort:1};\nE.register("t",{post(){return 1}});' }, { ...base, removeMembers: [{ decl: 'E', member: 'register' }, { global: 'PUB', member: 'register' }] });
  r = k.run();
  assert.equal(r.code, 0, r.out);
  assert.match(r.after, /globalThis\.PUB=\{abort:1\};/);
  assert.doesNotMatch(r.after, /register/);
});

test('a named function that is a const declared after the container is refused; a hoisted one is accepted', () => {
  const spec = { callees: ['reg'], container: { decl: 'R', kind: 'map' }, entry: { form: 'pair' }, autoName: { suffix: 'Route', defaultDest: 'a.js' } };
  let k = work({ 'a.js': 'const R=new Map();\nfunction reg(t,f){R.set(t,f)}\nconst late=()=>1;\nreg("x",late);' }, spec);
  let r = k.run();
  assert.equal(r.code, 1); assert.match(r.out, /late is a const declared after R/); assert.equal(r.after, k.text);
  k = work({ 'a.js': 'const R=new Map();\nfunction reg(t,f){R.set(t,f)}\nreg("x",early);\nfunction early(){}' }, spec);
  assert.equal(k.run().code, 0);
});
