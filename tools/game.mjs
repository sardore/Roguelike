#!/usr/bin/env node
// Work on the whole game as one file, then put the pieces back:
//   node tools/game.mjs assemble [out]   writes the assembled runtime with `/*@@FILE x.js@@*/` lines
//                                        (default .work/runtime.js, ignored by git)
//   node tools/game.mjs split [file]     writes the files in src/game/ back from such a file
// The tools in tools/refactor/ take the work file as their first argument, e.g.
//   node tools/game.mjs assemble && node tools/refactor/rename.mjs .work/runtime.js oldName newName && node tools/game.mjs split
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, splitGame } from './lib/game.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(repo, 'src');
const [cmd, arg] = process.argv.slice(2);
const work = path.join(repo, '.work', 'runtime.js');
if (cmd === 'assemble') {
  const out = path.resolve(arg || work);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const { text, parts } = assembleGame(src, { sentinels: true });
  fs.writeFileSync(out, text);
  console.log(`${path.relative(repo, out)}: ${parts.length} files, ${text.split('\n').length} lines`);
} else if (cmd === 'split') {
  const files = splitGame(src, fs.readFileSync(path.resolve(arg || work), 'utf8'));
  console.log(`wrote ${files.length} files: ${files.join(', ')}`);
} else {
  console.error('usage: node tools/game.mjs assemble [out] | split [file]');
  process.exit(2);
}
