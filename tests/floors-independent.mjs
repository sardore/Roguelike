// Floors 1-25 generated one by one with the random stream reset before each floor, so a
// change in one floor cannot shift the next. Writes one JSON per floor into <outDir>.
//   node tests/floors-independent.mjs <src dir> <out dir> [query]
import fs from 'node:fs';
import path from 'node:path';
import { launch, openSession, startRun } from './harness.mjs';
const [root, out, query = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await launch();
const s = await openSession(b, path.resolve(root), { seed: 4242, query });
await startRun(s, 'wanderer');
for (let f = 1; f <= 25; f++) {
  const r = await s.page.evaluate((floor) => {
    window.__reseed(900000 + floor * 7919);
    window.__MANRU_RELEASE__.regen(floor);
    const st = window.__MANRU_RELEASE__.snapshot().state;
    return JSON.stringify({ map: st.map, items: st.items, monsters: st.monsters.map((m) => ({ name: m.name, x: m.x, y: m.y })), draws: window.__rngCalls });
  }, f);
  await s.tick(200);
  fs.writeFileSync(path.join(out, `f${String(f).padStart(2, '0')}.json`), r);
}
await s.close();
await b.close();
