// Behaviour scenarios. Each returns {key: text}; run.mjs hashes the text, stores the
// hash as the baseline and writes the text under tests/artifacts/ so a mismatch can be diffed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSession, startRun, snapshot, dismissModals, storageDump, sha } from './harness.mjs';
import { instrumentRuntime } from '../tools/lib/load-probe.mjs';
import { compareImages } from './lib-images.mjs';

const savesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'baseline', 'saves');

// The text of a stage function without what a move may change: the name, whitespace, and whether it is an arrow
// function or a function declaration (`s=>{...}` and `function f(s){...}` compare equal; so do `()=>X` and
// `function f(){return X}`). The parameters and the body must be the same.
export function stageBody(src) {
  if (src == null) return null;
  const s = src.trim().replace(/^async\s+/, '');
  let params, body;
  const arrow = /^(\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*([\s\S]*)$/.exec(s);
  if (arrow) [, params, body] = arrow;
  else {
    const fn = /^function\s*[\w$]*\s*(\([^)]*\))\s*([\s\S]*)$/.exec(s);
    if (!fn) return 'raw:' + s.replace(/\s+/g, ' ');
    [, params, body] = fn;
  }
  params = params.replace(/^\(|\)$/g, '').replace(/\s+/g, '');
  body = body.trim();
  const ret = /^\{\s*return\s+([\s\S]*?);?\s*\}$/.exec(body);
  if (ret && !/;\s*\S/.test(ret[1])) body = ret[1];
  return `(${params})${body.replace(/\s+/g, ' ')}`;
}

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
  // The game canvas itself, read back from the page: free of compositor noise.
  const canvas = await s.page.evaluate(() => { const c = document.getElementById('game'); try { return c && c.width ? c.toDataURL('image/png') : null; } catch { return null; } });
  if (canvas) out[key + '.canvas.png'] = Buffer.from(canvas.split(',')[1], 'base64');
  out[key + '.css'] = await computedStyles(s.page);
}


// Records every addEventListener call in registration order (target, type, options), without the handler text,
// so the fingerprint survives renames but not a changed order, a dropped or an added listener.
const LISTENER_LOG = () => {
  const log = (window.__listenerLog = []);
  const label = (t) => {
    if (t === window) return 'window';
    if (t === document) return 'document';
    if (t === document.documentElement) return 'html';
    if (t === document.body) return 'body';
    if (t && t.tagName) return t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (t.classList && t.classList.length ? '.' + [...t.classList].slice(0, 3).join('.') : '');
    return Object.prototype.toString.call(t);
  };
  const orig = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opt) {
    const o = typeof opt === 'object' && opt ? opt : { capture: !!opt };
    log.push([label(this), type, !!o.capture, o.passive === undefined ? '-' : !!o.passive, !!o.once].join('|'));
    return orig.call(this, type, fn, opt);
  };
};
const listenerLog = (s) => s.page.evaluate(() => (window.__listenerLog || []).join('\n'));
async function inputState(s) {
  return s.page.evaluate(() => {
    const env = window.__MANRU_RELEASE__.snapshot();
    if (env) delete env.savedAt;
    // pointer timestamps are real time, so inertia drifts by a fraction of a pixel between runs: record the camera coarsely
    const c0 = globalThis.__MANRU_CAMERA_STATE12__?.snapshot?.();
    const q = (v) => Math.round(v / 32);
    const cam = c0 && { mode: c0.mode, zoom: Math.round(c0.zoom * 20) / 20, cx: q(c0.cx), cy: q(c0.cy) };
    const open = [...document.querySelectorAll('[id]')].filter((e) => /panel|modal|drawer|overlay|sheet|menu/i.test(e.id) && getComputedStyle(e).display !== 'none' && e.offsetParent !== null).map((e) => e.id).sort();
    const shown = [...document.querySelectorAll('.show, .open, .active, [aria-hidden="false"]')].map((e) => (e.id || e.tagName.toLowerCase()) + '.' + [...e.classList].sort().join('.')).sort();
    return JSON.stringify({ env, cam, open, shown, screen: document.body.dataset.manruScreen || document.documentElement.dataset.manruScreen || null, cls: document.body.className });
  });
}
const KEYS2 = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'w', 'a', 's', 'd', 'h', 'j', 'k', 'l', 'y', 'u', 'b', 'n', '1', '2', '3', 'z', 'Shift+ArrowUp', 'Shift+ArrowLeft', 'Control+ArrowRight', '?', 'Tab', 'Enter', 'Escape', 'm', 'r', 't', 'p', 'v', ' ', '.', ','];

// Installed before the page's scripts (openSession init): records the continue button's class before each change
// while the game boots, and console warnings.
const BOOT_PROBE = () => {
  const probe = (window.__QA_BOOT_PROBE__ = { continueClass: [], warnings: [] });
  const warn = console.warn.bind(console);
  console.warn = (...a) => { probe.warnings.push(a.map(String).join(' ').slice(0, 160)); warn(...a); };
  // observer records arrive batched, so each record keeps the value the class had before that change
  new MutationObserver((list) => { for (const m of list) if (m.target.id === 'continueBtn') probe.continueClass.push(m.oldValue); })
    .observe(document, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
};

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
  // Needs no QA hook, so it runs against every build: the same inputs must leave the same saved
  // data behind in the QA build and in the release builds, and a release build publishes no QA hooks.
  async release(browser, root, target) {
    const out = {};
    const s = await openSession(browser, root, { seed: 7 });
    await startRun(s, 'swordsman');
    const rnd = pick(7 * 7919);
    for (let step = 1; step <= 80; step++) {
      const key = KEYS[rnd(KEYS.length)];
      await s.page.keyboard.press(key);
      await s.tick(key === 'x' ? 1500 : 220);
      if (key === 'i' || key === 'f' || key === 'q') await dismissModals(s, 1);
    }
    // Panels reached only through the keyboard bridge in the real game (these broke once when QA hooks were split off).
    const panels = {};
    const bodyClass = (c) => s.page.evaluate((c) => document.body.classList.contains(c), c);
    await dismissModals(s, 2);
    await s.page.keyboard.press('F1'); await s.tick(300); panels.settingsOpen = await bodyClass('rc70-open');
    await s.page.keyboard.press('F1'); await s.tick(300); panels.settingsClosed = !(await bodyClass('rc70-open'));
    await s.page.keyboard.press('h'); await s.tick(300); panels.helpOpen = await s.page.evaluate(() => { const e = document.getElementById('helpPanel'); return !!e && getComputedStyle(e).display !== 'none'; });
    await s.page.keyboard.press('Escape'); await s.tick(300); panels.helpClosed = await s.page.evaluate(() => { const e = document.getElementById('helpPanel'); return !e || getComputedStyle(e).display === 'none'; });
    out['release.panels'] = JSON.stringify(panels);
    if (!(panels.settingsOpen && panels.settingsClosed && panels.helpOpen && panels.helpClosed)) throw new Error('panel keys do not work: ' + JSON.stringify(panels));
    out['release.storage'] = JSON.stringify(await storageDump(s));
    out['release.errors'] = JSON.stringify(s.errors);
    if (target !== 'qa') {
      const leaked = await s.page.evaluate(() => Object.keys(window).filter((k) => /^__MANRU_V\d+_TEST__$|^__MANRU_ARCH1020__$|^__MANRU_GAME_STATE__$/.test(k)).concat(typeof window.__MANRU_RELEASE__?.snapshot === 'function' ? ['__MANRU_RELEASE__.snapshot'] : []));
      if (leaked.length) throw new Error(`QA hooks published by the ${target} build: ${leaked.join(', ')}`);
    }
    await s.close();
    return out;
  },
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

  // Floors 1-25 generated one at a time with the random stream reset before each floor, so a
  // change to the generator shows up only on the floor it affects (no shifted-seed cascade).
  async floorsind(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 4242 });
    await startRun(s, 'wanderer');
    for (let f = 1; f <= 25; f++) {
      out[`floorsind.${String(f).padStart(2, '0')}`] = await s.page.evaluate((floor) => {
        window.__reseed(900000 + floor * 7919);
        window.__MANRU_RELEASE__.regen(floor);
        const st = window.__MANRU_RELEASE__.snapshot().state;
        return JSON.stringify({ map: st.map, items: st.items, monsters: st.monsters.map((m) => ({ name: m.name, x: m.x, y: m.y })), rooms: st.rooms, stairs: st.stairs });
      }, f);
      await s.tick(200);
    }
    out['floorsind.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // Fingerprint of the floor generator across seeds, classes and all 25 floors, for the generation pipeline tables to
  // be moved against. The generator draws from its own seeded stream (RngService, started per floor from the run
  // seed), whose seed, number of draws and final state it records in state.generationRngAuditR59; that record is
  // the random consumption. Per floor 1-25 of three runs (three session seeds and classes) the floor is
  // generated and recorded with that audit, the tile histogram, the structure (rooms, stairs, feature rooms, route
  // tags), items and monsters, and the size of the whole saved state; per run also the whole final state and the
  // stage ids of the pipeline in run order. A stage dropped, added, reordered, or one that draws a different
  // number of random values changes the audit of the floors it touches.
  async genprint(browser, root) {
    const out = {};
    for (const [name, seed, cls] of [['a', 31, 'wanderer'], ['b', 4242, 'strongman'], ['c', 90210, 'summoner']]) {
      const s = await openSession(browser, root, { seed });
      await startRun(s, cls);
      const rows = [];
      for (let f = 1; f <= 25; f++) {
        rows.push(await s.page.evaluate(({ floor, base }) => {
          window.__reseed(base * 100003 + floor * 7919);
          window.__MANRU_RELEASE__.regen(floor);
          const env = window.__MANRU_RELEASE__.snapshot();
          const st = env.state;
          const hist = {};
          for (const row of st.map) for (const t of row) hist[t] = (hist[t] || 0) + 1;
          delete env.savedAt;
          const next = [Math.random(), Math.random(), Math.random()];
          return JSON.stringify({
            floor, rng: st.generationRngAuditR59, next, hist,
            rooms: st.rooms, stairs: st.stairs, featureRooms: st.featureRooms, routeTags: st.routeTags, fixed: [st.fixedStart, st.fixedExit],
            items: st.items.map((i) => [i.type, i.name, i.x, i.y]),
            monsters: st.monsters.map((m) => [m.name, m.x, m.y, m.hp]),
            state: JSON.stringify(env).length,
          });
        }, { floor: f, base: seed }));
      }
      out[`genprint.${name}`] = rows.join('\n');
      out[`genprint.${name}.full`] = await s.page.evaluate(() => {
        const env = window.__MANRU_RELEASE__.snapshot();
        delete env.savedAt;
        return JSON.stringify(env);
      });
      out[`genprint.${name}.stages`] = JSON.stringify(await s.page.evaluate(() => globalThis.__MANRU_GENERATION_R18__.stages()));
      out[`genprint.${name}.errors`] = JSON.stringify(s.errors);
      await s.close();
    }
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
      const s = await openSession(browser, root, { seed: 77, query: 'debug=1' });
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

  // Play statistics: one anonymous record per death out, the hidden title gesture and the aggregate view in.
  async stats(browser, root) {
    const out = {};
    const URL_ = 'https://stats.test/exec';
    const SUMMARY = {
      ok: true, total: 12, floors: [3, 2, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
      causes: [['광견 대장', 5], ['<img src=x onerror=window.__xss=1>', 4], ['굶주림', 3]],
      avg: { level: 4.5, kills: 21, turns: 880 },
      recent: [{ t: '2026-10-26T10:11:12.000Z', floor: 25, cause: '굶주림', level: 9, kills: 40, turns: 1500 }],
    };
    // The test points the endpoint at a fake host; the game reads it from the page's meta tag.
    const endpoint = () => {
      const d = Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype, 'content');
      Object.defineProperty(HTMLMetaElement.prototype, 'content', { ...d, get() { return this.name === 'manru-stats' ? 'https://stats.test/exec' : d.get.call(this); } });
    };
    const serve = async (ctx, mode) => {
      const posts = [];
      await ctx.route(URL_ + '**', async (route) => {
        const req = route.request();
        const cors = { 'access-control-allow-origin': '*' };
        if (req.method() === 'POST') {
          posts.push(JSON.parse(req.postData()));
          if (mode.fail) return route.abort();
          return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '{"ok":true}' });
        }
        return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(SUMMARY) });
      });
      return posts;
    };
    const waitFor = async (fn) => { for (let i = 0; i < 40 && !(await fn()); i++) await new Promise((r) => setTimeout(r, 100)); };
    // Taps cycle over the title block (crown, small brand line, big logo, rule); a finger on the phone, a click on PC.
    const TITLE_PARTS = ['.titleCrown', '.brand', '#card h1', '.titleRule', '#card h1', '.brand', '#card h1'];
    const titleTaps = async (s, n, touch, parts = TITLE_PARTS) => { for (let i = 0; i < n; i++) await (touch ? s.page.tap(parts[i % parts.length]) : s.page.click(parts[i % parts.length])); };
    const sceneOpen = (s) => s.page.evaluate(() => !!document.getElementById('statsScene'));

    // No endpoint configured: the gesture still opens the scene and says so; nothing is sent.
    {
      const s = await openSession(browser, root, { seed: 90 });
      await titleTaps(s, 7, false);
      out['stats.unset'] = await s.page.evaluate(() => JSON.stringify({ open: !!document.getElementById('statsScene'), text: document.getElementById('statsBody').textContent }));
      await s.close();
    }

    // Gesture: six taps do nothing, the seventh opens; the view renders the server numbers as text.
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await serve(ctx, {});
      const s = await openSession(browser, root, { seed: 90, context: ctx, init: endpoint });
      await titleTaps(s, 6, true);
      out['stats.six-taps'] = String(await sceneOpen(s));
      await titleTaps(s, 1, true, ['#card h1']);
      await waitFor(() => s.page.evaluate(() => document.querySelectorAll('.statsCol').length === 25));
      out['stats.view'] = await s.page.evaluate(() => JSON.stringify({
        open: !!document.getElementById('statsScene'),
        tiles: [...document.querySelectorAll('.statsTile')].map((t) => t.textContent),
        cols: document.querySelectorAll('.statsCol').length,
        causes: [...document.querySelectorAll('.statsCauseName')].map((n) => n.textContent),
        injected: document.querySelectorAll('#statsBody img').length + (window.__xss ? 1 : 0),
        overflowX: document.documentElement.scrollWidth > innerWidth,
      }));
      await s.page.click('[data-stats-tab=rows]');
      out['stats.rows'] = await s.page.evaluate(() => [...document.querySelectorAll('.statsRows tbody tr')].map((r) => r.textContent).join('|'));
      await s.page.click('#statsClose');
      out['stats.closed'] = String(await sceneOpen(s));
      out['stats.errors'] = JSON.stringify(s.errors);
      await s.close();
      await ctx.close();
    }

    // Taps that are too slow, or outside the title block, never add up.
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await serve(ctx, {});
      const s = await openSession(browser, root, { seed: 90, context: ctx, init: endpoint });
      await titleTaps(s, 4, true);
      await s.tick(1300);
      await titleTaps(s, 3, true);
      out['stats.slow-taps'] = String(await sceneOpen(s));
      await titleTaps(s, 7, true, ['.startIntro']);
      out['stats.outside-taps'] = String(await sceneOpen(s));
      out['stats.tap-errors'] = JSON.stringify(s.errors);
      await s.close();
      await ctx.close();
    }

    // Death: the record carries exactly the death-screen numbers; a failed send stays queued.
    for (const fail of [false, true]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const posts = await serve(ctx, { fail });
      const s = await openSession(browser, root, { seed: 91, context: ctx, init: endpoint });
      await startRun(s, 'wanderer');
      await s.page.evaluate(() => window.__MANRU_V95_TEST__.deathPreview('광견 대장'));
      await waitFor(() => posts.length > 0);
      await s.tick(300);
      const key = fail ? 'stats.death-failed' : 'stats.death';
      out[key] = JSON.stringify({ posts: posts.map(({ id, ...rest }) => ({ hasId: id.length > 8, ...rest })), queue: await s.page.evaluate(() => JSON.parse(localStorage.getItem('manruStatsQueue') || '[]').length) });
      out[key + '.errors'] = JSON.stringify(s.errors);
      await s.close();
      await ctx.close();
    }

    // A record left in the queue is sent at the next start, once.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const posts = await serve(ctx, {});
      const queued = JSON.stringify([{ v: 1, id: 'left-over-run', floor: 7, cause: '굶주림', level: 3, kills: 5, turns: 99 }]);
      const s = await openSession(browser, root, { seed: 92, context: ctx, init: endpoint, storage: [['manruStatsQueue', queued]] });
      await waitFor(() => posts.length > 0);
      await s.tick(300);
      out['stats.resend'] = JSON.stringify({ posts, queue: await s.page.evaluate(() => JSON.parse(localStorage.getItem('manruStatsQueue') || '[]').length) });
      await s.close();
      await ctx.close();
    }

    // The debug battlefield never reports.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const posts = await serve(ctx, {});
      const s = await openSession(browser, root, { seed: 93, context: ctx, init: endpoint, query: 'debug=1' });
      await s.page.click('#debugBattleBtn57');
      await s.tick(800);
      const recorded = await s.page.evaluate(() => { try { window.__MANRU_V95_TEST__.deathPreview('시험'); } catch (e) { return String(e.message); } return 'died'; });
      await s.tick(300);
      out['stats.debug-battle'] = JSON.stringify({ recorded, posts: posts.length });
      await s.close();
      await ctx.close();
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

  // The hound boss's charge: it runs up to four cells and strikes the cells around where it stops; the telegraph is exactly the cells it
  // ran through plus that ring. A player on a telegraphed cell is struck, a player anywhere else never is.
  async bosscharge(browser, root) {
    const out = {};
    for (const [name, at] of [['onPath', { x: 0, y: 0 }], ['ringFront', { x: 2, y: 0 }], ['besideEarlyPath', { x: -2, y: 1 }], ['outsideRing', { x: 4, y: 1 }]]) {
      const s = await openSession(browser, root, { seed: 5 });
      await startRun(s, 'escort');
      const r = await s.page.evaluate((o) => globalThis.__MANRU_QA_BOSSCHARGE__(o), at);
      if (r.hpLost > 0 && !r.telegraphed) throw new Error(`bosscharge (${name}): the player was struck on a cell the telegraph did not show: ${JSON.stringify(r)}`);
      out[`bosscharge.${name}`] = JSON.stringify(r);
      out[`bosscharge.${name}.errors`] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // The DOM elements the game keeps in closure variables (feelEl, panel, coach, modal, skillQuick, classDetail1001, classStart1001,
  // hud): after loading, in every boot situation, each holds its element, attached where the game attaches it. A variable that is
  // read before its initialisation would be undefined here.
  async domvars(browser, root) {
    const out = {};
    const branch = JSON.parse(fs.readFileSync(path.join(savesDir, 'branch.json'), 'utf8'));
    for (const [name, opts] of [['empty', {}], ['debug', { query: 'debug=1' }], ['mobile', { viewport: { width: 390, height: 844 }, mobile: true }], ['branch', { storage: branch.storage }]]) {
      const s = await openSession(browser, root, { seed: 1, ...opts });
      const vars = await s.page.evaluate(() => globalThis.__MANRU_QA_DOMVARS__());
      const bad = Object.entries(vars).filter(([, v]) => !/ connected=true /.test(v + ' '));
      if (bad.length) throw new Error(`domvars (${name}): ${bad.map(([k, v]) => `${k}=${v}`).join(', ')}`);
      out[`domvars.${name}`] = JSON.stringify(vars);
      out[`domvars.${name}.errors`] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // Coming back from the background: phone browsers can drop the pixels of canvases while a page is hidden. Every canvas the game
  // created is blanked, the page is hidden and shown again, and the screen must look like one that never lost them (title, class
  // selection, a floor with furniture and monsters). A drawing that is made once and never again after a resume stays blank here.
  async resume(browser, root) {
    const out = {};
    const track = () => {
      const made = (window.__canvases = []);
      const create = document.createElement.bind(document);
      document.createElement = (tag, ...rest) => { const el = create(tag, ...rest); if (String(tag).toLowerCase() === 'canvas') made.push(el); return el; };
    };
    const comeBack = async (s) => {
      await s.page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await s.tick(400);
      await s.page.evaluate(() => {
        for (const c of window.__canvases) c.width = c.width;
        for (const c of document.querySelectorAll('canvas')) c.width = c.width;
      });
      await s.page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
        window.dispatchEvent(new Event('pageshow'));
      });
      await s.tick(800);
    };
    const looks = async (drive, discard, opts = {}) => {
      const s = await openSession(browser, root, { seed: 7, init: track, ...opts });
      await drive(s);
      if (discard) await comeBack(s); else await s.tick(1200);
      const shot = await s.page.screenshot();
      const errors = s.errors;
      await s.close();
      return { shot, errors };
    };
    const cases = {
      title: async () => {},
      classPick: async (s) => { await s.page.click('#enterBtn'); await s.tick(800); },
      floor: async (s) => { await startRun(s, 'wanderer'); const rnd = pick(7); for (let i = 0; i < 12; i++) { await s.page.keyboard.press(KEYS[rnd(8)]); await s.tick(220); } },
      inventory: async (s) => { await startRun(s, 'wanderer'); await s.page.keyboard.press('i'); await s.tick(600); },
      settings: async (s) => { await startRun(s, 'wanderer'); await s.page.evaluate(() => window.__MANRU_RELEASE__.openPanel()); await s.tick(600); },
      mobileTitle: async () => {},
      mobileFloor: async (s) => { await startRun(s, 'wanderer'); const rnd = pick(9); for (let i = 0; i < 12; i++) { await s.page.keyboard.press(KEYS[rnd(8)]); await s.tick(220); } },
    };
    const mobile = { viewport: { width: 390, height: 844 }, mobile: true };
    for (const [name, drive] of Object.entries(cases)) {
      const opts = name.startsWith('mobile') ? mobile : {};
      const kept = await looks(drive, false, opts), lost = await looks(drive, true, opts);
      const r = compareImages(`resume.${name}.png`, kept.shot, lost.shot, path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts', 'resume-diff'));
      out[`resume.${name}`] = r.ok ? 'same' : `differs ${(r.share * 100).toFixed(2)}%`;
      out[`resume.${name}.errors`] = JSON.stringify([...kept.errors, ...lost.errors]);
    }
    return out;
  },

  // The save string (settings panel): the running game and the account's progress travel as one text. A run is played on one
  // "device", the string is made through the panel, a second device (fresh storage, another run already going and a dead-run id of
  // its own) pastes it through the panel; after the page reloaded and the run was continued, the saved state is the same and the
  // account keys came with it (dead-run ids merged). Corrupt, cut, foreign and empty strings are refused with the run untouched.
  async savestring(browser, root) {
    const out = {};
    const a = await openSession(browser, root, { seed: 41 });
    await startRun(a, 'escort');
    const rnd = pick(41);
    for (let i = 0; i < 40; i++) {
      await a.page.keyboard.press(KEYS[rnd(8)]);
      await a.tick(220);
    }
    await a.page.evaluate(() => {
      localStorage.setItem('manruUiVolume70', '0.6');
      localStorage.setItem('manru1004_dead_runs', JSON.stringify(['dead-from-a']));
    });
    const text = await a.page.evaluate(() => globalThis.__MANRU_QA_SAVESTRING__.make());
    if (!/^MANRU[01]\.[A-Za-z0-9_-]+\.[0-9a-f]{8}$/.test(text)) throw new Error(`savestring: no string was made: ${text}`);
    const accountOf = async (s) => s.page.evaluate(() => Object.keys(localStorage).filter((k) => /^manru/.test(k) && !/active_run|transaction/.test(k)).sort().map((k) => [k, localStorage.getItem(k)]));
    const accountA = await accountOf(a);
    const dumpA = await storageDump(a);
    await a.close();
    // control: the same persisted bytes continued the normal way
    const c = await openSession(browser, root, { seed: 43, storage: dumpA });
    await c.page.click('#continueBtn');
    await c.tick(2500);
    await dismissModals(c);
    const control = await snapshot(c);
    await c.close();
    // the write counters of the save are bookkeeping of each commit, not part of the run
    const plain = (text) => { const e = JSON.parse(text); delete e.state.saveSeq1004; delete e.state.saveWrittenAt1004; return JSON.stringify(e); };

    const b = await openSession(browser, root, { seed: 42, storage: [['manru1004_dead_runs', JSON.stringify(['dead-from-b'])], ['manruUiVolume70', '0.1']] });
    await startRun(b, 'wanderer');
    const refused = {};
    // the message the panel used to show for a refused string
    const tryString = async (label, value) => {
      refused[label] = await b.page.evaluate(async (v) => { try { await globalThis.__MANRU_QA_SAVESTRING__.read(v); return 'accepted'; } catch (e) { return `가져오기 실패: ${e.message}`; } }, value);
    };
    const [head, body, crc] = text.split('.');
    await tryString('empty', '');
    await tryString('foreign', 'hello world');
    await tryString('cut', `${head}.${body.slice(0, body.length >> 1)}.${crc}`);
    await tryString('flipped', `${head}.${body.slice(0, 20)}${body[20] === 'A' ? 'B' : 'A'}${body.slice(21)}.${crc}`);
    await tryString('crc', `${head}.${body}.${crc === '00000000' ? '00000001' : '00000000'}`);
    out['savestring.refused'] = JSON.stringify(refused);
    for (const [k, v] of Object.entries(refused)) if (!/실패/.test(v)) throw new Error(`savestring: "${k}" was not refused: ${v}`);
    // the string as it is pasted: wrapped in lines; applying it reloads the page like the panel did
    await b.page.evaluate((t) => globalThis.__MANRU_QA_SAVESTRING__.apply(t).then(() => location.reload()), text.replace(/(.{60})/g, '$1\n'));
    await b.tick(3000);
    await b.page.click('#continueBtn');
    await b.tick(2500);
    await dismissModals(b);
    out['savestring.after'] = plain(await snapshot(b));
    out['savestring.control'] = plain(control);
    if (out['savestring.after'] !== out['savestring.control']) throw new Error('savestring: the run continued from the string differs from the run continued from the same save the normal way');
    const accountB = await accountOf(b);
    out['savestring.account'] = JSON.stringify({ a: accountA, b: accountB });
    const deadRuns = JSON.parse(accountB.find(([k]) => k === 'manru1004_dead_runs')[1]);
    if (!(deadRuns.includes('dead-from-a') && deadRuns.includes('dead-from-b'))) throw new Error(`savestring: dead runs were not merged: ${JSON.stringify(deadRuns)}`);
    if (accountB.find(([k]) => k === 'manruUiVolume70')?.[1] !== '0.6') throw new Error('savestring: the volume setting did not come along');
    out['savestring.errors'] = JSON.stringify([...a.errors, ...b.errors]);
    await b.close();
    return out;
  },

  // Every top-level value of the game closure when it has finished loading (tools/lib/load-probe.mjs), booted with
  // no save and with the V40 branch save. A declaration moved before the statements that fill what it captures
  // (TT.* tile ids, a recipe list) holds a different value here even when no other scenario reaches it.
  async values(browser, root) {
    const out = {};
    const src = typeof root === 'string' ? root : root.dir;
    const copy = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts', 'values-build');
    fs.rmSync(copy, { recursive: true, force: true });
    fs.cpSync(src, copy, { recursive: true });
    const rt = path.join(copy, 'scripts', '10-runtime.js');
    fs.writeFileSync(rt, instrumentRuntime(fs.readFileSync(rt, 'utf8'), { snapshot: 'all' }).text);
    const branch = JSON.parse(fs.readFileSync(path.join(savesDir, 'branch.json'), 'utf8'));
    for (const [name, opts] of [['empty', {}], ['branch', { storage: branch.storage }]]) {
      const s = await openSession(browser, copy, { seed: 1, ...opts });
      const snap = await s.page.evaluate(() => globalThis.__MANRU_SNAPSHOT__);
      if (!snap) throw new Error(`values: the closure did not finish loading (${JSON.stringify(s.errors)})`);
      // function names are not values: a rename must not count as a change
      out[`values.${name}`] = Object.keys(snap).sort().map((k) => `${k}\t${String(JSON.stringify(snap[k])).replace(/<fn [^>]*>/g, '<fn>')}`).join('\n');
      await s.close();
    }
    return out;
  },

  // The spine-owned stage tables (move hooks, stat/cost stages, boss reward, pickup, inventory render, panel hooks,
  // run-end/descend effects): per table the stages in run order with their ids and a hash of each function's
  // parameters and body (stageBody), so a move that reorders a table, drops or duplicates a stage, or edits a body
  // changes the baseline. Ids must be unique per table (this replaces the duplicate-id errors the register functions threw).
  async stages(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 1 });
    const rows = await s.page.evaluate(() => globalThis.__MANRU_QA_STAGES__());
    const tables = {};
    for (const r of rows) (tables[r.table] ||= []).push(r);
    for (const [table, list] of Object.entries(tables)) {
      const ids = new Map();
      for (const r of list) if (r.id != null) {
        if (ids.has(r.id)) throw new Error(`stages: ${table} registers the id ${r.id} twice`);
        ids.set(r.id, true);
      }
      out[`stages.${table}`] = list.map((r) => [r.phase, r.id ?? '-', ...['fn', 'run', 'pre', 'post'].map((k) => (r[k] == null ? '' : sha(stageBody(r[k])).slice(0, 12)))].join('\t')).join('\n');
    }
    out['stages.counts'] = Object.entries(tables).map(([t, l]) => `${t}\t${l.length}`).join('\n');
    out['stages.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // The stage tables through their real consumers (src/qa/qa.js __MANRU_QA_CONSUMERS__): a blocked and a normal move
  // (move hooks), picking up real floor items (pickup stages), the floor-5 boss reward (boss reward stages). Test stages
  // at both ends of the move and pickup tables record the direction the reader walks them. The expected directions are
  // asserted here, so a reader that changes direction fails even if the tables are unchanged.
  async consumers(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 21 });
    await startRun(s, 'wanderer');
    const moves = await s.page.evaluate(() => globalThis.__MANRU_QA_CONSUMERS__.moves());
    out['consumers.moves'] = JSON.stringify(moves);
    if (moves.error || moves.zoom.result !== false || !moves.zoom.at || moves.cook.result !== false || !moves.cook.at || !moves.normal.moved) throw new Error(`consumers: move hooks do not block or move as expected: ${JSON.stringify(moves)}`);
    if (JSON.stringify(moves.trace) !== JSON.stringify(['pre-last', 'pre-first', 'post-first', 'post-last'])) throw new Error(`consumers: move hook directions changed: ${JSON.stringify(moves.trace)}`);
    const pickups = await s.page.evaluate(() => globalThis.__MANRU_QA_CONSUMERS__.pickups());
    out['consumers.pickups'] = JSON.stringify(pickups);
    if (!pickups.picked.length || pickups.picked.every((p) => !p.gained)) throw new Error(`consumers: nothing was picked up: ${JSON.stringify(pickups)}`);
    for (const p of pickups.picked) if (p.trace.join() !== ['pre-last', 'pre-first', 'post-first', 'post-last'].join()) throw new Error(`consumers: pickup stage directions changed: ${p.trace}`);
    const boss = await s.page.evaluate(() => globalThis.__MANRU_QA_CONSUMERS__.boss());
    out['consumers.boss'] = JSON.stringify(boss);
    if (boss.error || !(boss.xpGain > 0) || !boss.defeated) throw new Error(`consumers: boss reward did not run: ${JSON.stringify(boss)}`);
    out['consumers.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // The registries of the game (action routes, turn stages, attack stage chains, minimap hooks, presentation updates,
  // generation pipeline): per registry the entries in the order their reader walks them with ids and a hash of each
  // function's parameters and body (stageBody), unique ids per registry, and the registries through their readers
  // (src/qa/qa.js __MANRU_QA_REGISTRIES__ / __MANRU_QA_CONSUMERS__.registries) with test entries at both ends that
  // record the walking direction. A registration dropped, doubled, reordered or edited changes the baseline.
  async registries(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 21 });
    await startRun(s, 'wanderer');
    const rows = await s.page.evaluate(() => globalThis.__MANRU_QA_REGISTRIES__());
    const regs = {};
    for (const r of rows) (regs[r.registry] ||= []).push(r);
    for (const [name, list] of Object.entries(regs)) {
      const ids = new Set();
      for (const r of list) {
        if (ids.has(r.id)) throw new Error(`registries: ${name} registers ${r.id} twice`);
        ids.add(r.id);
      }
      out[`registries.${name}`] = list.map((r) => [r.id, ...r.fns.map((f) => (f == null ? '' : sha(stageBody(f)).slice(0, 12)))].join('\t')).join('\n');
    }
    const probe = await s.page.evaluate(() => globalThis.__MANRU_QA_CONSUMERS__.registries());
    out['registries.paths'] = JSON.stringify(probe);
    if (JSON.stringify(probe.attackTrace) !== JSON.stringify(['last-in', 'first-in', 'base', 'first-out', 'last-out'])) throw new Error(`registries: attack stage chain direction changed: ${JSON.stringify(probe.attackTrace)}`);
    if (JSON.stringify(probe.minimapTrace) !== JSON.stringify(['first', 'last'])) throw new Error(`registries: minimap hook direction changed: ${JSON.stringify(probe.minimapTrace)}`);
    if (probe.unknown !== 'ignored') throw new Error(`registries: an unknown action was not ignored: ${probe.unknown}`);
    out['registries.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // Features a declaration move can break without changing any snapshot the other scenarios take (F-23): the
  // talisman fusion screen must offer every recipe's result for its pair, and every citadel furnishing must be
  // queued for drawing with a tile (src/qa/qa.js __MANRU_QA_FEATURES__ runs the real code paths).
  async features(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 12 });
    await startRun(s, 'wanderer');
    const fusion = await s.page.evaluate(() => globalThis.__MANRU_QA_FEATURES__.fusion());
    out['features.fusion'] = JSON.stringify(fusion);
    const notOffered = fusion.filter((r) => !r.offered);
    if (!fusion.length || notOffered.length) throw new Error(`fusion screen does not offer ${notOffered.length} of ${fusion.length} recipes: ${notOffered.slice(0, 3).map((r) => r.pair).join(', ')}`);
    const citadel = await s.page.evaluate(() => globalThis.__MANRU_QA_FEATURES__.citadel());
    out['features.citadel'] = JSON.stringify(citadel);
    const failed = citadel.kinds.filter((k) => k.failed || k.drawn !== k.cells);
    if (!citadel.entered || !citadel.cells || failed.length) throw new Error(`citadel furnishings not drawn: ${failed.slice(0, 3).map((k) => `${k.prop} ${k.drawn}/${k.cells} ${k.error || ''}`).join('; ')}`);
    const stages = await s.page.evaluate(() => globalThis.__MANRU_QA_FEATURES__.stages());
    out['features.stages'] = JSON.stringify(stages);
    out['features.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // Saves written by V40 (tests/baseline/saves, made by make-save-fixtures.mjs) loaded by this build.
  async saves(browser, root) {
    const out = {};
    for (const name of ['progress', 'dead', 'branch', 'legend']) {
      const fixture = JSON.parse(fs.readFileSync(path.join(savesDir, name + '.json'), 'utf8'));
      const s = await openSession(browser, root, { seed: 50, storage: fixture.storage, init: BOOT_PROBE });
      out[`saves.${name}.title`] = await s.page.evaluate(() => JSON.stringify({
        continue: document.getElementById('continueBtn')?.className,
        text: document.getElementById('continueBtn')?.textContent.replace(/\s+/g, ' ').trim(),
        screen: document.body.dataset.manruScreen,
      }));
      // The continue button must be enabled at boot exactly when a resumable run exists (F-01:
      // branch saves used to be rejected during boot because branch data was not initialised yet).
      const enabled = await s.page.evaluate(() => !document.getElementById('continueBtn').classList.contains('noSave'));
      if (enabled !== (name !== 'dead')) throw new Error(`continue button for the ${name} save is ${enabled ? 'enabled' : 'disabled'} at boot`);
      // F-21: the continue check made while the game loads must accept the run by itself (the boot-end re-check that
      // used to repair the branch save is gone, so the enabled check above covers it) and must reject nothing on the
      // way: the branch save used to read BRANCH_DEFS105 before its declaration. F-22: the load-time check runs once,
      // after the save service is published, so a resumable run never sees its button disabled first.
      const boot = await s.page.evaluate(() => window.__QA_BOOT_PROBE__);
      out[`saves.${name}.boot`] = JSON.stringify(boot);
      if (boot.warnings.some((w) => w.includes('cannot be continued'))) throw new Error(`the ${name} save was rejected during boot: ${boot.warnings.join(' | ')}`);
      if (name !== 'dead' && boot.continueClass.length) throw new Error(`the continue button changed while the ${name} save booted: ${boot.continueClass.join(' -> ')}`);
      if (name !== 'dead') {
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
      // The release build has no snapshot hook: the run shows up as a screen change and a stored save.
      return JSON.stringify({ screen: document.body.dataset.manruScreen, saved: Object.keys(localStorage).filter((k) => k.startsWith('manru1004_')).sort() });
    });
    out['pwa.errors'] = JSON.stringify(s.errors);
    await s.close();
    await ctx.close();
    return out;
  },

  // Game canvas on every floor and inside a branch / legendary dungeon (local-only, like screens).
  async render(browser, root) {
    const out = {};
    const canvas = async (s) => {
      const data = await s.page.evaluate(() => document.getElementById('game').toDataURL('image/png'));
      return Buffer.from(data.split(',')[1], 'base64');
    };
    const s = await openSession(browser, root, { seed: 8080 });
    await startRun(s, 'wanderer');
    for (let f = 1; f <= 25; f++) {
      await s.page.evaluate((floor) => window.__MANRU_RELEASE__.regen(floor), f);
      await s.tick(600);
      out[`screens.render.floor${String(f).padStart(2, '0')}.canvas.png`] = await canvas(s);
    }
    out['render.errors'] = JSON.stringify(s.errors);
    await s.close();
    for (const name of ['branch', 'legend', 'progress']) {
      const fixture = JSON.parse(fs.readFileSync(path.join(savesDir, name + '.json'), 'utf8'));
      const r = await openSession(browser, root, { seed: 51, storage: fixture.storage });
      await r.page.click('#continueBtn');
      await r.tick(3000);
      await dismissModals(r);
      await r.tick(600);
      out[`screens.render.${name}.canvas.png`] = await canvas(r);
      await r.close();
    }
    return out;
  },

  // Screens: pixels and computed styles. Local-only (fonts and GPU differ between machines).
  // Keyboard (with modifiers, auto-repeat and Q hold), mouse (click, double click, right click, long press, drag, wheel)
  // and touch (tap, long press, drag, pinch) on PC and mobile, plus the registration order of every event listener.
  async input(browser, root) {
    const out = {};
    // ---- PC
    {
      const s = await openSession(browser, root, { seed: 21, init: LISTENER_LOG });
      out['input.listeners.title'] = await listenerLog(s);
      await startRun(s, 'swordsman');
      out['input.listeners.run'] = await listenerLog(s);
      const rnd = pick(4243);
      for (let step = 1; step <= 120; step++) {
        const key = KEYS2[rnd(KEYS2.length)];
        await s.page.keyboard.press(key);
        await s.tick(220);
        if (step % 20 === 0) out[`input.pc.keys.${step}`] = await inputState(s);
      }
      await dismissModals(s);
      // auto-repeat: hold a direction for a second (keydown with repeat), then release
      await s.page.keyboard.down('ArrowRight');
      for (let i = 0; i < 6; i++) { await s.tick(150); await s.page.keyboard.down('ArrowRight'); }
      await s.page.keyboard.up('ArrowRight');
      await s.tick(300);
      out['input.pc.repeat'] = await inputState(s);
      // Q held past its threshold, then released; and a short tap
      await s.page.keyboard.down('q'); await s.tick(900); await s.page.keyboard.up('q'); await s.tick(300);
      out['input.pc.qhold'] = await inputState(s);
      await dismissModals(s, 2);
      await s.page.keyboard.down('q'); await s.tick(80); await s.page.keyboard.up('q'); await s.tick(300);
      out['input.pc.qtap'] = await inputState(s);
      await dismissModals(s, 2);
      // mouse on the canvas
      const box = await s.page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      const at = (fx, fy) => ({ x: box.x + box.w * fx, y: box.y + box.h * fy });
      for (const [i, [fx, fy]] of [[.5, .5], [.62, .5], [.5, .38], [.3, .6]].entries()) { const p = at(fx, fy); await s.page.mouse.click(p.x, p.y); await s.tick(400); out[`input.pc.click.${i}`] = await inputState(s); }
      { const p = at(.55, .55); await s.page.mouse.dblclick(p.x, p.y); await s.tick(400); out['input.pc.dblclick'] = await inputState(s); }
      { const p = at(.45, .5); await s.page.mouse.click(p.x, p.y, { button: 'right' }); await s.tick(400); out['input.pc.rightclick'] = await inputState(s); await dismissModals(s, 2); }
      { const p = at(.5, .5); await s.page.mouse.move(p.x, p.y); await s.page.mouse.down(); await s.tick(900); await s.page.mouse.up(); await s.tick(400); out['input.pc.longpress'] = await inputState(s); await dismissModals(s, 2); }
      for (const [i, [a, b]] of [[[.7, .5], [.35, .45]], [[.3, .7], [.62, .3]]].entries()) {
        const p0 = at(...a), p1 = at(...b);
        await s.page.mouse.move(p0.x, p0.y); await s.page.mouse.down();
        for (let k = 1; k <= 8; k++) { await s.page.mouse.move(p0.x + (p1.x - p0.x) * k / 8, p0.y + (p1.y - p0.y) * k / 8); await s.tick(40); }
        await s.page.mouse.up(); await s.tick(500); out[`input.pc.drag.${i}`] = await inputState(s);
      }
      { const p = at(.5, .5); await s.page.mouse.move(p.x, p.y); for (const dy of [-120, -120, 120, 240]) { await s.page.mouse.wheel(0, dy); await s.tick(250); } out['input.pc.wheel'] = await inputState(s); }
      out['input.listeners.after'] = await listenerLog(s);
      out['input.pc.errors'] = JSON.stringify(s.errors);
      await s.close();
    }
    // ---- mobile (touch through CDP so long press, drag and pinch are real touch sequences)
    {
      const s = await openSession(browser, root, { seed: 22, viewport: { width: 390, height: 844 }, mobile: true, init: LISTENER_LOG });
      out['input.listeners.mobile.title'] = await listenerLog(s);
      await startRun(s, 'archer');
      out['input.listeners.mobile.run'] = await listenerLog(s);
      const cdp = await s.page.context().newCDPSession(s.page);
      const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: i })) });
      const box = await s.page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      const at = (fx, fy) => ({ x: box.x + box.w * fx, y: box.y + box.h * fy });
      for (const [i, [fx, fy]] of [[.5, .5], [.7, .45], [.4, .6]].entries()) { const p = at(fx, fy); await touch('touchStart', [p]); await s.tick(60); await touch('touchEnd', []); await s.tick(500); out[`input.mobile.tap.${i}`] = await inputState(s); }
      { const p = at(.5, .5); await touch('touchStart', [p]); await s.tick(300); out['input.mobile.holdpreview'] = await inputState(s); await s.tick(600); out['input.mobile.holding'] = await inputState(s); await touch('touchEnd', []); await s.tick(500); out['input.mobile.longpress'] = await inputState(s); await dismissModals(s, 2); }
      for (const [i, [a, b]] of [[[.75, .5], [.3, .45]], [[.3, .7], [.7, .3]]].entries()) {
        const p0 = at(...a), p1 = at(...b);
        await touch('touchStart', [p0]);
        for (let k = 1; k <= 8; k++) { await touch('touchMove', [{ x: p0.x + (p1.x - p0.x) * k / 8, y: p0.y + (p1.y - p0.y) * k / 8 }]); await s.tick(40); }
        await touch('touchEnd', []); await s.tick(600); out[`input.mobile.drag.${i}`] = await inputState(s);
      }
      { // pinch out then in
        const c = at(.5, .5);
        await touch('touchStart', [{ x: c.x - 30, y: c.y }, { x: c.x + 30, y: c.y }]);
        for (let k = 1; k <= 8; k++) { await touch('touchMove', [{ x: c.x - 30 - k * 2.5, y: c.y }, { x: c.x + 30 + k * 2.5, y: c.y }]); await s.tick(40); }
        await touch('touchEnd', []); await s.tick(500); out['input.mobile.pinchout'] = await inputState(s);
        await touch('touchStart', [{ x: c.x - 100, y: c.y }, { x: c.x + 100, y: c.y }]);
        for (let k = 1; k <= 8; k++) { await touch('touchMove', [{ x: c.x - 100 + k * 5, y: c.y }, { x: c.x + 100 - k * 5, y: c.y }]); await s.tick(40); }
        await touch('touchEnd', []); await s.tick(500); out['input.mobile.pinchin'] = await inputState(s);
      }
      out['input.listeners.mobile.after'] = await listenerLog(s);
      out['input.mobile.errors'] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // The UI actions whose deferred follow-ups were replaced by direct calls: closing the inventory with its button (touch and
  // click), the sound toggle in the settings panel, the throw banner of an unidentified potion, and the static first state
  // of the pad, the context button and the settings buttons.
  async uiactions(browser, root) {
    const out = {};
    for (const [form, opts] of [['pc', { viewport: { width: 1280, height: 800 } }], ['mobile', { viewport: { width: 390, height: 844 }, mobile: true }]]) {
      const s = await openSession(browser, root, { seed: 31, hash: 'debug', ...opts });
      out[`uiactions.${form}.static`] = await s.page.evaluate(() => JSON.stringify(['.pad [data-act=rest]', '#contextActionBtn', '#mobileAutoBtn', '#releaseGear70', '#releaseGearDesktop70', '#inspectClose'].map((q) => { const e = document.querySelector(q); return e && { attrs: [...e.attributes].filter((a) => !a.name.startsWith('data-mf')).map((a) => a.name + '=' + a.value).sort(), text: e.textContent }; })));
      await startRun(s, 'swordsman');
      // inventory: open, close with the button
      await s.page.keyboard.press('i'); await s.tick(500);
      out[`uiactions.${form}.inv.open`] = await inputState(s);
      if (form === 'mobile') { const b = await s.page.locator('#invCloseBtn').boundingBox(); await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); } else await s.page.click('#invCloseBtn');
      await s.tick(400);
      out[`uiactions.${form}.inv.closed`] = await inputState(s);
      // sound toggle: the label right after the click and after the clock moved
      await s.page.keyboard.press('F1'); await s.tick(400);
      const sfx = [];
      for (let i = 0; i < 2; i++) { await s.page.click('#rcSfx70'); sfx.push(await s.page.evaluate(() => [document.getElementById('rcSfx70').textContent, localStorage.getItem('manruSfx54')])); await s.tick(60); sfx.push(await s.page.evaluate(() => [document.getElementById('rcSfx70').textContent, localStorage.getItem('manruSfx54')])); }
      out[`uiactions.${form}.sfx`] = JSON.stringify(sfx);
      await s.page.keyboard.press('Escape'); await s.tick(300);
      // identification while the inventory is open: the list must show the identified potion once the clock moved
      await s.page.keyboard.press('i'); await s.tick(400);
      const ident = await s.page.evaluate(() => {
        const st = window.__MANRU_DEBUG__.get();
        const proto = (window.MANRU_POTIONS || []).find((p) => !p.throwable) || window.MANRU_POTIONS[0];
        const potion = { ...JSON.parse(JSON.stringify(proto)), count: 1 };
        st.player.inventory.push(potion);
        const text = () => (document.getElementById('inventory')?.innerText || '').replace(/\s+/g, ' ').trim();
        const known0 = !!globalThis.__MANRU_CONSUMABLE56_ACTIONS__.knownPotion(potion);
        const before = text();
        const ret = globalThis.__MANRU_QA_IDENTIFY__.potion(potion.potionKind, 'test');
        return { real: potion.name, known0, ret, known1: !!globalThis.__MANRU_CONSUMABLE56_ACTIONS__.knownPotion(potion), before, sync: text() };
      });
      await s.tick(60);
      ident.after = await s.page.evaluate(() => (document.getElementById('inventory')?.innerText || '').replace(/\s+/g, ' ').trim());
      ident.afterShowsName = ident.after.includes(ident.real);
      out[`uiactions.${form}.identify`] = JSON.stringify(ident);
      await s.page.keyboard.press('Escape'); await s.tick(300);
      // throw banner of an unidentified throwable potion
      const banner = await s.page.evaluate(() => {
        const st = window.__MANRU_DEBUG__.get();
        const proto = (window.MANRU_POTIONS || []).find((p) => p.throwable);
        if (!proto) return { error: 'no throwable potion' };
        const item = { ...JSON.parse(JSON.stringify(proto)), count: 1 };
        st.player.inventory.push(item);
        const known = !!globalThis.__MANRU_CONSUMABLE56_ACTIONS__?.knownPotion?.(item);
        const ret = globalThis.__MANRU_ACTION_DISPATCHER__.dispatch({ type: 'ITEM_USE', args: [st.player.inventory.length - 1] });
        return { known, real: item.name, started: !!ret?.value, sync: document.getElementById('potionTargetName')?.textContent, shown: document.getElementById('potionTargetHud')?.classList.contains('show') };
      });
      await s.tick(20);
      banner.after = await s.page.evaluate(() => document.getElementById('potionTargetName')?.textContent);
      out[`uiactions.${form}.banner`] = JSON.stringify(banner);
      // rotation: the canvas size follows the viewport (resize and the orientationchange event, then the clock moves)
      if (form === 'mobile') {
        const dims = () => s.page.evaluate(() => { const c = document.getElementById('game'); return [c.width, c.height, innerWidth, innerHeight, Math.round(c.getBoundingClientRect().width), Math.round(c.getBoundingClientRect().height)]; });
        const rot = [await dims()];
        await s.page.setViewportSize({ width: 844, height: 390 });
        await s.page.evaluate(() => window.dispatchEvent(new Event('orientationchange')));
        await s.tick(300); rot.push(await dims());
        await s.page.setViewportSize({ width: 390, height: 844 });
        await s.page.evaluate(() => window.dispatchEvent(new Event('orientationchange')));
        await s.tick(300); rot.push(await dims());
        out['uiactions.mobile.rotate'] = JSON.stringify(rot);
      }
      out[`uiactions.${form}.errors`] = JSON.stringify(s.errors);
      await s.close();
    }
    return out;
  },

  // What a load leaves behind: the state after saving and loading, with unidentified potions/talismans in the bag, an aim
  // target set before the load, saved monsters, and a save stripped of the fields the post-load hooks (re)create. Used to
  // decide which of the load stages registered before resetLoad (camera49, aim52, knowledge56, monster-config61, food57,
  // potions41) change anything: run against a build with and a build without them and diff the artifacts.
  async loadhooks(browser, root) {
    const out = {};
    const monsterSrc = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'game', 'monsters.js'), 'utf8');
    const fields = [...monsterSrc.match(/function configureMonsterTraits\(m\)\{[^]*?for\(const field of \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    for (const variant of ['plain', 'stripped']) {
      for (const form of ['pc', 'mobile']) {
        const s = await openSession(browser, root, { seed: 51, hash: 'debug', ...(form === 'mobile' ? { viewport: { width: 390, height: 844 }, mobile: true } : {}) });
        await startRun(s, 'swordsman');
        await s.page.evaluate(({ variant, fields }) => {
          const st = window.__MANRU_DEBUG__.get();
          const cp = (o) => JSON.parse(JSON.stringify(o));
          const potions = (window.MANRU_POTIONS || []).slice(0, 3).map((p) => ({ ...cp(p), count: 1 }));
          const tals = (window.MANRU_TALISMANS || []).filter((t) => t.talismanKind !== 'identify').slice(0, 3).map((t) => ({ ...cp(t), count: 1 }));
          st.player.inventory.push(...potions, ...tals);
          for (const p of potions.slice(0, 1)) st.items.push({ ...cp(p), x: st.player.x + 1, y: st.player.y });
          globalThis.__MANRU_CONSUMABLE56_ACTIONS__.initializeKnowledge();
          if (variant === 'stripped') {
            delete st.knowledge56; delete st.roomHints56; delete st.cookbook57; delete st.tempFields;
            for (const k of ['foodHaste57', 'warm57', 'fireCoat57', 'poisonResist57', 'vitality57', 'freeStamina57', 'swift', 'fortify', 'willBoost']) delete st.status?.[k];
            delete st.player.foodVital57;
            for (const m of st.monsters) for (const f of fields) delete m[f];
          }
        }, { variant, fields });
        out[`loadhooks.${variant}.${form}.saved`] = await s.page.evaluate(() => { const ok = window.__MANRU_RELEASE__.save(); return JSON.stringify(ok === undefined ? 'void' : ok); });
        // aim at the first monster, force the redraw flags off, then load
        await s.page.evaluate(() => { const st = window.__MANRU_DEBUG__.get(); globalThis.__MANRU_QA_LOAD__.setAim(st.monsters[0] || null); globalThis.__MANRU_QA_LOAD__.clearPerf(); });
        const pre = await s.page.evaluate(() => JSON.stringify({ aim: globalThis.__MANRU_QA_LOAD__.aim(), perf: globalThis.__MANRU_QA_LOAD__.perf() }));
        const ret = await s.page.evaluate(() => { const r = window.__MANRU_RELEASE__.load(); return JSON.stringify(r === undefined ? 'void' : r); });
        const post = await s.page.evaluate(() => JSON.stringify({ aim: globalThis.__MANRU_QA_LOAD__.aim(), perf: globalThis.__MANRU_QA_LOAD__.perf() }));
        out[`loadhooks.${variant}.${form}.aim`] = JSON.stringify({ pre, ret, post });
        // the same with a jar target (a cell) set before the load
        await s.page.evaluate(() => { const st = window.__MANRU_DEBUG__.get(); globalThis.__MANRU_QA_LOAD__.setAim(null, { x: st.player.x + 2, y: st.player.y }); });
        const preJar = await s.page.evaluate(() => JSON.stringify(globalThis.__MANRU_QA_LOAD__.aim()));
        const retJar = await s.page.evaluate(() => { const r = window.__MANRU_RELEASE__.load(); return JSON.stringify(r === undefined ? 'void' : r); });
        out[`loadhooks.${variant}.${form}.aimjar`] = JSON.stringify({ pre: preJar, ret: retJar, post: await s.page.evaluate(() => JSON.stringify(globalThis.__MANRU_QA_LOAD__.aim())) });
        await s.tick(600);
        out[`loadhooks.${variant}.${form}.state`] = await snapshot(s);
        // what the player sees: the bag after the load (names of unidentified potions and talismans)
        await s.page.keyboard.press('i'); await s.tick(500);
        out[`loadhooks.${variant}.${form}.bag`] = await s.page.evaluate(() => JSON.stringify({
          text: (document.getElementById('inventory')?.innerText || '').replace(/\s+/g, ' ').trim(),
          names: (window.__MANRU_DEBUG__.get().player.inventory || []).map((i) => [i.name, globalThis.__MANRU_CONSUMABLE56_ACTIONS__.publicName?.(i), i.type === 'potion' ? !!globalThis.__MANRU_CONSUMABLE56_ACTIONS__.knownPotion(i) : null]),
          floor: (window.__MANRU_DEBUG__.get().items || []).filter((i) => i.type === 'potion').map((i) => [i.name, globalThis.__MANRU_CONSUMABLE56_ACTIONS__.publicName?.(i)]),
          hints: window.__MANRU_DEBUG__.get().roomHints56 ?? null,
        }));
        await s.page.keyboard.press('Escape'); await s.tick(300);
        // what 60 further inputs do on the loaded run
        const rnd = pick(7771);
        for (let step = 1; step <= 60; step++) { const key = KEYS[rnd(KEYS.length)]; await s.page.keyboard.press(key); await s.tick(key === 'x' ? 1500 : 220); if (key === 'i' || key === 'f' || key === 'q') await dismissModals(s, 1); }
        out[`loadhooks.${variant}.${form}.after60`] = await snapshot(s);
        out[`loadhooks.${variant}.${form}.errors`] = JSON.stringify(s.errors);
        await s.close();
      }
    }
    return out;
  },

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
      // Settings (F1) and help (H) panels.
      await s.page.keyboard.press('F1');
      await s.tick(600);
      await capture(out, `screens.${form}.settings`, s);
      await s.page.keyboard.press('F1');
      await s.tick(300);
      await s.page.keyboard.press('h');
      await s.tick(600);
      await capture(out, `screens.${form}.help`, s);
      await dismissModals(s, 2);
      // A fight on the first floor: a training dummy next to the player, one blow exchanged.
      await s.page.evaluate(() => window.__MANRU_V56_TEST__.spawnDummy(1, 0));
      await s.tick(300);
      await s.page.keyboard.press('ArrowRight');
      await s.tick(250);
      await capture(out, `screens.${form}.combat`, s);
      out[`screens.${form}.errors`] = JSON.stringify(s.errors);
      await s.close();
      // A sub-branch: the V40 save made inside a branch.
      const fixture = JSON.parse(fs.readFileSync(path.join(savesDir, 'branch.json'), 'utf8'));
      const b = await openSession(browser, root, { seed: 8, storage: fixture.storage, ...opts });
      await b.page.click('#continueBtn');
      await b.tick(3000);
      await dismissModals(b);
      await b.tick(600);
      await capture(out, `screens.${form}.branch`, b);
      out[`screens.${form}.branch.errors`] = JSON.stringify(b.errors);
      await b.close();
      const d = await openSession(browser, root, { seed: 6, query: 'debug=1', ...opts });
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
