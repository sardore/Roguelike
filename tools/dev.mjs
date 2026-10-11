#!/usr/bin/env node
// Development server: builds dist-dev/ (or dist-qa/ with --qa), serves it, and rebuilds whenever a file in src/ changes.
//   npm run dev            game without QA hooks  -> http://127.0.0.1:5173/
//   npm run dev -- --qa    game with src/qa/qa.js spliced in (console hooks for diagnostics)
//   npm run dev -- --port 8080
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { serve } from '../tests/server.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const qa = process.argv.includes('--qa');
const portArg = process.argv.indexOf('--port');
const port = portArg >= 0 ? Number(process.argv[portArg + 1]) : 5173;
const dir = path.join(repo, qa ? 'dist-qa' : 'dist-dev');
const build = () => {
  try { execFileSync(process.execPath, [path.join(repo, 'tools', 'build.mjs'), qa ? '--qa' : '--dev'], { stdio: 'pipe' }); return true; }
  catch (e) { console.error(String(e.stderr || e.message).trim()); return false; }
};
if (!build()) process.exit(1);
const server = await serve(dir, port);
console.log(`${qa ? 'QA' : 'dev'} build served at ${server.url}  (rebuilds when src/ changes; Ctrl+C to stop)`);
let timer = null;
fs.watch(path.join(repo, 'src'), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => { const t = Date.now(); console.log(build() ? `rebuilt in ${Date.now() - t} ms` : 'build failed (see above); serving the previous build'); }, 150);
});
