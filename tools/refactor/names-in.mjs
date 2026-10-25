#!/usr/bin/env node
// Refactor tool: prints the top-level declaration names that live in one file segment of the work file.
//   node tools/refactor/names-in.mjs <work.js> <file e.g. boot.js>
import fs from 'node:fs';
import * as acorn from 'acorn';
const [work, file] = process.argv.slice(2);
const text = fs.readFileSync(work, 'utf8');
const marks = [...text.matchAll(/^\/\*@@FILE ([^@]+)@@\*\/\n/gm)].map((m) => ({ file: m[1], at: m.index }));
const top = acorn.parse(text, { ecmaVersion: 'latest' }).body[0].expression.callee.body.body;
const segOf = (pos) => { let cur = null; for (const m of marks) if (m.at <= pos) cur = m.file; return cur; };
for (const s of top) {
  if (segOf(s.start) !== file) continue;
  if (s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') console.log(s.id.name);
  else if (s.type === 'VariableDeclaration') for (const d of s.declarations) if (d.id.type === 'Identifier') console.log(d.id.name);
}
