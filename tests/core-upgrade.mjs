// Run after npm run build:qa. 5층 챕터마다 일정에 잡힌 3개 층에는 강화부적이 실제로 바닥에 놓이고, 놓인 층만 spawned로 기록된다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.cu={gen:f=>{regenerateFloor(f);const ups=(state.items||[]).filter(i=>i.talismanKind==='upgrade'&&i.coreDrop982).length,C=state.coreLoot982;return{floor:f,ups,sched:C?.chapters?Object.values(C.chapters).flatMap(c=>c.upgrades):[],spawned:Object.keys(C?.spawned?.upgrade||{}).map(Number)}}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 900, height: 700 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 3 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(200);
const rows = await s.page.evaluate(() => { const r = []; for (let f = 1; f <= 24; f++) r.push(cu.gen(f)); return r; });
const last = rows[rows.length - 1], sched = new Set(last.sched);
console.log(JSON.stringify({ sched: [...sched], spawned: last.spawned }));
for (const r of rows) {
  if (r.floor % 5 === 0) { assert.equal(r.ups, 0, `${r.floor}층(보스)에 일정 강화부적이 있다`); continue; }
  if (sched.has(r.floor)) assert.ok(r.ups >= 1, `${r.floor}층에 일정 강화부적이 없다`);
}
for (const f of sched) assert.ok(last.spawned.includes(f), `${f}층이 spawned로 기록되지 않았다`);
assert.deepEqual(errors, []);
await browser.close();
console.log('core-upgrade: ok');
process.exit(0);
