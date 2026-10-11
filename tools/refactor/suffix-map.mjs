#!/usr/bin/env node
// Refactor tool: builds the TSV for rename-batch.mjs that strips the trailing version number from the
// given names (one per line). Names whose stripped form is too short, already used, or shared by
// another name of the list are written to <out>.skip for a hand-picked role name.
//   node tools/refactor/suffix-map.mjs <work.js> <names.txt> <out.tsv>
import fs from 'node:fs';
const [work, namesFile, out] = process.argv.slice(2);
const src = fs.readFileSync(work, 'utf8');
const names = fs.readFileSync(namesFile, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
const used = new Set(src.match(/[A-Za-z_$][\w$]*/g));
const rows = [], skip = [];
for (const n of names) {
  const m = n.match(/^(.*?[A-Za-z_])(\d+)$/); if (!m) continue;
  const base = m[1];
  if (base.length < 5 || used.has(base) || rows.some((r) => r[1] === base) || names.some((o) => o !== n && o.replace(/\d+$/, '') === base && /\d$/.test(o))) { skip.push(n); continue; }
  rows.push([n, base]);
}
fs.writeFileSync(out, rows.map((r) => r.join('\t')).join('\n') + '\n');
fs.writeFileSync(out + '.skip', skip.join('\n') + '\n');
console.log(`${rows.length} strip, ${skip.length} need a role name: ${skip.join(' ')}`);
