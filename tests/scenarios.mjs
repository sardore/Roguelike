// Behaviour scenarios. Each returns {key: text}; run.mjs hashes the text, stores the
// hash as the baseline and writes the text under tests/artifacts/ so a mismatch can be diffed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSession, startRun, snapshot, dismissModals, storageDump } from './harness.mjs';

const savesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'baseline', 'saves');

export const CLASSES = ['wanderer', 'escort', 'swordsman', 'archer', 'infiltrator', 'strongman', 'summoner'];

const KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'g', 'x', 'q', 'e', 'f', 'c', 'i', 'Escape'];

function pick(seed) {
  let a = seed >>> 0;
  return (n) => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    return a % n;
  };
}

const STYLE_PROPS = ['display', 'visibility', 'opacity', 'color', 'background-color', 'background-image', 'font-family', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'text-align', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'box-shadow', 'text-shadow', 'padding', 'margin', 'position', 'inset', 'z-index', 'transform', 'filter', 'width', 'height', 'overflow', 'pointer-events', 'gap', 'grid-template-columns', 'flex-direction', 'justify-content', 'align-items', 'cursor', 'animation-name', 'transition'];

async function computedStyles(page) {
  return page.evaluate((props) => {
    const rows = [];
    const label = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].sort().join('.') : '');
    const SKIP = new Set(['LINK', 'SCRIPT', 'STYLE', 'META', 'NOSCRIPT', 'TEMPLATE']);
    const walkEl = (el, path) => {
      if (SKIP.has(el.tagName)) return;
      const p = path + '>' + label(el);
      const cs = getComputedStyle(el);
      rows.push(p + ' ' + props.map((k) => cs.getPropertyValue(k)).join('|'));
      for (const pseudo of ['::before', '::after']) {
        const ps = getComputedStyle(el, pseudo);
        if (ps.content && ps.content !== 'none') rows.push(p + pseudo + ' ' + ps.content + '|' + props.map((k) => ps.getPropertyValue(k)).join('|'));
      }
      for (const c of el.children) walkEl(c, p);
    };
    walkEl(document.body, '');
    return rows.join('\n');
  }, STYLE_PROPS);
}

async function capture(out, key, s) {
  // Park the pointer so :hover transitions are not caught mid-way.
  await s.page.mouse.move(1, 1);
  // CSS animations run on the real compositor clock: settle them to a fixed point first.
  for (let round = 0; round < 3; round++) {
    await s.page.evaluate(() => {
      for (const a of document.getAnimations()) {
        try {
          if (a.effect?.getComputedTiming().iterations === Infinity) { a.pause(); a.currentTime = 0; }
          else a.finish();
        } catch { a.cancel(); }
      }
    });
    await s.tick(50);
  }
  out[key + '.png'] = await s.page.screenshot();
  out[key + '.css'] = await computedStyles(s.page);
}

export const scenarios = {
  // New game for every class: floor 1 generation, starting kit, story state.
  async newgame(browser, root) {
    const out = {};
    for (const [i, cls] of CLASSES.entries()) {
      const s = await openSession(browser, root, { seed: 100 + i });
      await startRun(s, cls);
      out['newgame.' + cls] = await snapshot(s);
      out['newgame.' + cls + '.errors'] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // Seeded keyboard play: movement, bump attacks, pickup, autoexplore, skills, panels.
  async walk(browser, root) {
    const out = {};
    for (const [cls, seed] of [['swordsman', 7], ['archer', 8], ['summoner', 9], ['strongman', 10]]) {
      const s = await openSession(browser, root, { seed });
      await startRun(s, cls);
      const rnd = pick(seed * 7919);
      for (let step = 1; step <= 240; step++) {
        const key = KEYS[rnd(KEYS.length)];
        await s.page.keyboard.press(key);
        await s.tick(key === 'x' ? 1500 : 220);
        if (key === 'i' || key === 'f' || key === 'q') await dismissModals(s, 1);
        if (step % 40 === 0) out[`walk.${cls}.${step}`] = await snapshot(s);
      }
      out[`walk.${cls}.storage`] = JSON.stringify((await storageDump(s)).map(([k, v]) => [k, v.length]));
      out[`walk.${cls}.errors`] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // Floor generator for every floor of one run (map, rooms, monsters, items, features).
  async floors(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 4242 });
    await startRun(s, 'wanderer');
    for (let f = 1; f <= 25; f++) {
      const audit = await s.page.evaluate((floor) => JSON.stringify(window.__MANRU_RELEASE__.regen(floor)), f);
      await s.tick(300);
      out[`floors.${String(f).padStart(2, '0')}`] = (await snapshot(s)) + '\n' + audit;
    }
    out['floors.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // Debug arena with the AGENTS.md regression species: real placement, then combat rounds.
  async battle(browser, root) {
    const out = {};
    const rosters = {
      hive: [['벌집나무', 'A', 1], ['고목 목매', 'B', 1]],
      bees: [['벌떼', 'A', 3], ['벌집나무', 'B', 1]],
      mixed: [['고목 목매', 'A', 2], ['벌떼', 'B', 2]],
    };
    for (const [name, roster] of Object.entries(rosters)) {
      const s = await openSession(browser, root, { seed: 77 });
      await s.page.click('#debugBattleBtn57');
      await s.tick(800);
      for (const [monster, side, count] of roster) {
        await s.page.evaluate(({ monster, count }) => {
          const sel = document.getElementById('battleSearch57');
          sel.value = monster;
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          const select = document.getElementById('battleMonster57');
          const option = [...select.options].find((o) => o.textContent.split(' · ')[0] === monster);
          if (!option) throw new Error('monster not in catalog: ' + monster);
          select.value = option.value;
          select.dispatchEvent(new Event('input', { bubbles: true }));
          document.getElementById('battleCount57').value = String(count);
        }, { monster, count });
        await s.page.click('#battleAdd' + side + '57');
        await s.tick(300);
      }
      out[`battle.${name}.placed`] = await s.page.evaluate(() => JSON.stringify(globalThis.__MANRU_DEBUG_BATTLE57__.snapshot()));
      for (let r = 1; r <= 12; r++) {
        await s.page.click('#battleStep57');
        await s.tick(400);
      }
      out[`battle.${name}.rounds`] = await s.page.evaluate(() => JSON.stringify(globalThis.__MANRU_DEBUG_BATTLE57__.snapshot()));
      out[`battle.${name}.errors`] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // Save written by this build, reloaded through Continue.
  async saveload(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 31 });
    await startRun(s, 'escort');
    const rnd = pick(31);
    for (let i = 0; i < 60; i++) {
      await s.page.keyboard.press(KEYS[rnd(8)]);
      await s.tick(220);
    }
    const before = await snapshot(s);
    const dump = await storageDump(s);
    await s.close();
    const r = await openSession(browser, root, { seed: 32, storage: dump });
    await r.page.click('#continueBtn');
    await r.tick(2500);
    await dismissModals(r);
    out['saveload.before'] = before;
    out['saveload.after'] = await snapshot(r);
    out['saveload.errors'] = JSON.stringify(r.errors);
    await r.close();
    return out;
  },

  // Saves written by V40 (tests/baseline/saves, made by make-save-fixtures.mjs) loaded by this build.
  async saves(browser, root) {
    const out = {};
    for (const name of ['progress', 'dead', 'branch', 'legend']) {
      const fixture = JSON.parse(fs.readFileSync(path.join(savesDir, name + '.json'), 'utf8'));
      const s = await openSession(browser, root, { seed: 50, storage: fixture.storage });
      out[`saves.${name}.title`] = await s.page.evaluate(() => JSON.stringify({
        continue: document.getElementById('continueBtn')?.className,
        text: document.getElementById('continueBtn')?.textContent.replace(/\s+/g, ' ').trim(),
        screen: document.body.dataset.manruScreen,
      }));
      if (name !== 'dead') {
        // Clicked even when styled as noSave: V40 shows a branch save as noSave at boot (FINDINGS F-01).
        await s.page.click('#continueBtn');
        await s.tick(3000);
        await dismissModals(s);
        out[`saves.${name}.continue`] = await snapshot(s);
        await s.page.keyboard.press('ArrowRight');
        await s.tick(400);
        out[`saves.${name}.after-move`] = await snapshot(s);
      }
      if (name !== 'dead') {
        out[`saves.${name}.slot1`] = await s.page.evaluate(() => { const r = window.__MANRU_RELEASE__.load(1); return JSON.stringify(r ?? null); }) + '\n' + (await snapshot(s));
      }
      out[`saves.${name}.storage-keys`] = JSON.stringify((await storageDump(s)).map(([k]) => k));
      out[`saves.${name}.errors`] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // Installable app: manifest, service worker, offline relaunch and an offline new run.
  async pwa(browser, root) {
    const out = {};
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const s = await openSession(browser, root, { seed: 70, context: ctx });
    const page = s.page;
    out['pwa.manifest'] = await page.evaluate(async () => {
      const link = document.querySelector('link[rel=manifest]');
      const m = await (await fetch(link.href)).json();
      return JSON.stringify({ name: m.name, short_name: m.short_name, display: m.display, start_url: m.start_url, icons: m.icons.map((i) => i.sizes + (i.purpose ? ' ' + i.purpose : '')) });
    });
    // The worker registers on load; give it real time to install (it is outside the fake clock).
    out['pwa.worker'] = await page.evaluate(async () => {
      const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 0))]);
      return String(!!reg);
    });
    await page.clock.resume();
    const ready = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      for (let i = 0; i < 100 && !navigator.serviceWorker.controller; i++) await new Promise((r) => setTimeout(r, 100));
      const keys = await caches.keys();
      const cached = keys.length ? (await (await caches.open(keys[0])).keys()).length : 0;
      return JSON.stringify({ active: !!reg.active, controlled: !!navigator.serviceWorker.controller, caches: keys.length, cached });
    });
    out['pwa.worker'] = ready;
    await ctx.setOffline(true);
    await page.reload();
    await page.waitForTimeout(1500);
    out['pwa.offline-title'] = await page.evaluate(() => JSON.stringify({ screen: document.body.dataset.manruScreen, enter: !!document.getElementById('enterBtn'), title: document.title }));
    await page.click('#enterBtn');
    await page.waitForTimeout(500);
    await page.click('#class-choice-wanderer');
    await page.waitForTimeout(300);
    await page.click('#classStartBtn1001');
    await page.waitForTimeout(3000);
    out['pwa.offline-newgame'] = await page.evaluate(() => {
      const env = window.__MANRU_RELEASE__.snapshot();
      return JSON.stringify({ floor: env?.state?.floor, hp: env?.state?.player?.hp, maxHp: env?.state?.player?.maxHp });
    });
    out['pwa.errors'] = JSON.stringify(s.errors);
    await s.close();
    await ctx.close();
    return out;
  },

  // Screens: pixels and computed styles. Local-only (fonts and GPU differ between machines).
  async screens(browser, root) {
    const out = {};
    for (const [form, opts] of [['pc', { viewport: { width: 1280, height: 800 } }], ['mobile', { viewport: { width: 390, height: 844 }, mobile: true }]]) {
      const s = await openSession(browser, root, { seed: 5, ...opts });
      await capture(out, `screens.${form}.title`, s);
      await s.page.click('#enterBtn');
      await s.tick(600);
      await capture(out, `screens.${form}.class`, s);
      await s.page.click('#class-choice-archer');
      await s.tick(200);
      await s.page.click('#classStartBtn1001');
      await s.tick(3000);
      await capture(out, `screens.${form}.story`, s);
      await dismissModals(s);
      await s.tick(600);
      await capture(out, `screens.${form}.floor1`, s);
      await s.page.keyboard.press('i');
      await s.tick(600);
      await capture(out, `screens.${form}.inventory`, s);
      await dismissModals(s, 2);
      await s.page.keyboard.press('m');
      await s.tick(600);
      await capture(out, `screens.${form}.map`, s);
      await dismissModals(s, 2);
      out[`screens.${form}.errors`] = JSON.stringify(s.errors);
      await s.close();
      const d = await openSession(browser, root, { seed: 6, ...opts });
      await d.page.click('#debugBattleBtn57');
      await d.tick(800);
      await capture(out, `screens.${form}.battle`, d);
      await d.page.evaluate(() => {
        const sel = document.getElementById('battleSearch57');
        sel.value = '벌집나무';
        sel.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await d.tick(200);
      await d.page.click('#battleAddA57');
      await d.tick(200);
      await d.page.evaluate(() => {
        const sel = document.getElementById('battleSearch57');
        sel.value = '고목 목매';
        sel.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await d.tick(200);
      await d.page.click('#battleAddB57');
      await d.tick(400);
      await d.page.click('#battleView57');
      await d.tick(800);
      await capture(out, `screens.${form}.battleWatch`, d);
      out[`screens.${form}.battle.errors`] = JSON.stringify(d.errors);
      await d.close();
    }
    return out;
  },
};
