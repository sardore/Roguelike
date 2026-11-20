// Run after npm run build:qa. "Enable legacy map": with the preference on, a new run keeps the old 청풍루 — no inn art,
// the old floor 2/4/5 palette, no inn landmark set on floors 1/3 and no dressing in the floor 5 hall. With it off the
// new 청풍루 is used. The preference is stored in localStorage and stamped on the run so a save keeps it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.env.MANRU_DIST || path.join(repo, 'dist-qa');
const bridge = 'globalThis.lgm={state:()=>state,TT,ng:()=>newGame(CLASSES[0]),adv:()=>{resetFloorScopedState57();state.floor++;NormalFloorGenerator.generate()},inn:()=>innFloorArt(),art:()=>currentFloorArt()?.floor||null,colors:()=>regionColors(),save:()=>GameState.snapshot?.()};';
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext();
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, dir, { context: ctx, seed: 21 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s);
const toggle = await s.page.evaluate(() => { const t = document.getElementById('legacyMapToggle'); return t ? { label: t.parentElement.textContent.trim() } : null });
const run = legacy => s.page.evaluate(legacy => {
  localStorage.setItem('manruLegacyMap', legacy ? '1' : '0');
  const out = { floors: {} };
  for (let i = 0; i < 6; i++) {
    lgm.ng(); const st = lgm.state(); out.flag = st.legacyInn;
    for (let f = 1; f <= 5; f++) {
      if (f > 1) lgm.adv();
      const r = out.floors[f] = out.floors[f] || { inn: 0, kinds: [], carpet: 0, floor: lgm.colors().floor, art: lgm.art() };
      if (lgm.inn()) r.inn++;
      if (st.grandTerrain93 && (f === 1 || f === 3)) r.kinds.push(st.grandTerrain93.kind);
      if (f === 5) r.carpet += st.map.flat().filter(t => t === lgm.TT.CARPET).length;
    }
  }
  return out;
}, legacy);
const fresh = await run(false), old = await run(true);
await s.page.evaluate(() => localStorage.removeItem('manruLegacyMap'));
console.log('legacy-map', JSON.stringify({ toggle, fresh, old }));
assert.ok(toggle && /Enable legacy map/.test(toggle.label), 'toggle on the class pick screen');
assert.equal(fresh.flag, false); assert.equal(old.flag, true);
for (let f = 1; f <= 5; f++) { assert.equal(fresh.floors[f].inn, 6, 'inn art on floor ' + f); assert.equal(old.floors[f].inn, 0, 'no inn art on legacy floor ' + f) }
assert.equal(old.floors[2].art, '#4b1715'); assert.equal(old.floors[4].art, '#302034'); assert.equal(old.floors[5].art, '#481411');
assert.equal(old.floors[1].art, null); assert.equal(old.floors[3].art, null);
for (let f = 1; f <= 5; f++) assert.notEqual(old.floors[f].floor, fresh.floors[f].floor, 'legacy floor ' + f + ' keeps the region floor colour');
assert.equal(fresh.floors[3].kinds.length, 6, 'new floor 3 always has a landmark');
const inn = ['lodge', 'cloister', 'bazaar', 'courtyard', 'colonnade', 'pond'];
assert.ok(old.floors[1].kinds.length === 0, 'legacy floor 1 has no landmark');
assert.ok(fresh.floors[5].carpet > 0 && old.floors[5].carpet === 0, 'floor 5 hall dressing only on the new map');
assert.ok(old.floors[3].kinds.length < 6 || old.floors[3].kinds.some(k => !inn.includes(k)), 'legacy floor 3 uses the region pool');
assert.deepEqual(errors, []);
console.log('legacy-map: ok');
await browser.close(); process.exit(0);
