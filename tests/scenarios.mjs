// Behaviour scenarios. Each returns {key: text}; run.mjs hashes the text, stores the
// hash as the baseline and writes the text under tests/artifacts/ so a mismatch can be diffed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import net from 'node:net';
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

  // A real boss-floor -> merchant intermission -> 6F descent must retain the full grand library.
  async floor6Entry(browser, root) {
    const s = await openSession(browser, root, { seed: 6060 });
    try {
      await startRun(s, 'wanderer');
      const first = await s.page.evaluate(() => {
        window.__MANRU_RELEASE__.regen(5);
        const st = window.__MANRU_QA_UI__.state();
        st.bossDefeated = true;
        st.player.blinkLevel = 3;
        const runId = st.runId984, hp = st.player.hp;
        const intoShop = window.__MANRU_SPECIAL_FLOORS60__.qa.descend();
        return { intoShop, shop: !!window.__MANRU_QA_UI__.state().shopIntermission?.active, runId, hp };
      });
      if (!first.shop) throw Error('5F -> merchant intermission did not open: ' + JSON.stringify(first));
      const second = await s.page.evaluate(() => {
        const st = window.__MANRU_QA_UI__.state();
        st.player.blinkLevel = 3;
        return window.__MANRU_SPECIAL_FLOORS60__.qa.descend();
      });
      await s.tick(1250);
      const outcome = await s.page.evaluate(() => {
        const st = window.__MANRU_QA_UI__.state();
        return {
          floor: st.floor, runId: st.runId984, shop: !!st.shopIntermission?.active,
          library: !!st.floor6GrandLibraryR8, key: !!st.f6LibraryKeyR8, gate: !!st.f6LibraryGateR8,
          prize: (st.items||[]).some(i=>i.r8LibraryPrize), connectivity: st.finalConnectivity51,
          attempts: st.generationFinalKeyAttemptsR48, failure: st.generationFinalKeyFailureR48
        };
      });
      if (outcome.floor !== 6 || outcome.runId !== first.runId || !outcome.library ||
          !outcome.key || !outcome.gate || !outcome.prize || outcome.connectivity?.ok !== true)
        { console.log('::error title=6F shop-exit generation::' + JSON.stringify({ first, second, outcome }).slice(0,5000)); throw Error('6F grand library descent failed: ' + JSON.stringify({ first, second, outcome })); }
      return {};
    } finally { await s.close(); }
  },

  // A deliberately unsealed 6F archive must be rejected, then restored in place.
  async floor6Repair(browser, root) {
    const s = await openSession(browser, root, { seed: 4242 });
    try {
      await startRun(s, 'wanderer');
      const result = await s.page.evaluate(() => {
        window.__MANRU_RELEASE__.regen(6);
        return window.__MANRU_QA_FLOOR6_REPAIR__();
      });
      if (result.invalid !== false || result.accepted !== true ||
          !result.sameStructure || !result.hasPrize || !result.gateRestored ||
          result.library?.ok !== true) {
        console.log('::error title=6F archive bypass recovery::' + JSON.stringify(result).slice(0,5000));
        throw Error('6F archive bypass repair failed: ' + JSON.stringify(result));
      }
      return {};
    } finally { await s.close(); }
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
      await s.page.evaluate(() => globalThis.__MANRU_QA_DEBUGBATTLE__.open());
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

  // Live spectating through a local copy of the cp32 relay: a host and a viewer, each a real page with a real WebSocket.
  async spectate(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      // The game reads the relay address from the page's meta tag; the test points it at the local copy.
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const host = await openSession(browser, root, { seed: 8080, init });
      const view = await openSession(browser, root, { seed: 8081, init, viewport: { width: 390, height: 844 }, mobile: true });
      const ignored = []; view.page.on('console', (m) => { const t = m.text(); if (t.includes('[manru] ignored error:')) ignored.push(t.slice(0, 160)); });
      const both = async (ms = 200) => { await Promise.all([host.tick(ms), view.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 60) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const H = (fn, arg) => host.page.evaluate(fn, arg);
      const V = (fn, arg) => view.page.evaluate(fn, arg);
      await startRun(host, 'wanderer');
      for (let i = 0; i < 3; i++) { await host.page.keyboard.press('Escape'); await host.tick(150); }
      // 1. Always on while playing: no switch in the settings; the run is announced.
      await until(() => H(() => __MANRU_QA_SPECTATE__.api.hosting), 20);
      out['spectate.default'] = JSON.stringify(await H(() => ({ hosting: __MANRU_QA_SPECTATE__.api.hosting, ws: !!__MANRU_QA_SPECTATE__.api.ws })));
      out['spectate.noSwitch'] = String(await H(() => !document.getElementById('rcSpectate70')));
      out['spectate.hostReady'] = String(await until(() => H(() => __MANRU_QA_SPECTATE__.api.ready)));
      // The host sees its own listing confirmed, in the settings line.
      out['spectate.hostListed'] = String(await until(() => H(() => document.getElementById('rcSpectateInfo70').textContent.includes('목록에 올랐다'))));

      // 2. The viewer finds the room from the title screen and joins.
      await view.page.tap('#spectateBtn');
      out['spectate.listed'] = String(await until(() => V(() => document.querySelectorAll('#spectateRooms .spectateRoom').length === 1)));
      out['spectate.listNote'] = await V(() => document.getElementById('spectateListNote').textContent);
      out['spectate.roomText'] = await V(() => document.querySelector('#spectateRooms .spectateRoom').textContent.replace(/\d+턴.*$/, ''));
      await view.page.tap('#spectateRooms .spectateRoom');
      out['spectate.joined'] = String(await until(() => V(() => !!__MANRU_QA_SPECTATE__.state()?.spectator)));
      out['spectate.hostSeesViewer'] = String(await until(() => H(() => __MANRU_QA_SPECTATE__.api.viewers.size === 1)));
      await until(() => V(() => document.getElementById('spectateNote').hidden));

      // 3. What the viewer holds is the host's field of view and nothing outside it; the picture matches the host's.
      const seenOf = () => H(() => [...__MANRU_QA_SPECTATE__.state().seen]);
      const walk = async (keys) => { for (const k of keys) { await host.page.keyboard.press(k); await both(300); } await until(() => V(() => true), 6); await both(600); };
      await walk(['ArrowUp', 'ArrowRight', 'ArrowRight', 'ArrowDown']);
      await until(() => Promise.all([H(() => __MANRU_QA_SPECTATE__.state().seen.size), V(() => __MANRU_QA_SPECTATE__.state().seen.size)]).then(([a, b]) => a === b));
      const hostSeen = new Set(await seenOf());
      const held = await V(() => { const s = __MANRU_QA_SPECTATE__.state(), out = []; for (const key of ['outerWall94', 'subthemeFloors972', 'subthemeWalls970', 'archDecor1020', 'floorPattern1022', 'rugPattern1022', 'terrainUnderlay58', 'terrainAttachment58']) for (const c in s[key]) out.push(c); for (const list of [s.monsters, s.items, s.decor]) for (const e of list) out.push(e.x + ',' + e.y); return { cells: out, seen: s.seen.size, turn: s.turn, floor: s.floor }; });
      out['spectate.outsideSeen'] = String(held.cells.filter((c) => !hostSeen.has(c)).length);
      out['spectate.seenEqual'] = String(held.seen === hostSeen.size);
      // Every cell the viewer holds as seen has the same tile as on the host's map (a seen cell never shows as void), and a cell inspected
      // by the viewer can be closed again.
      const hostTiles = await H(() => { const s = __MANRU_QA_SPECTATE__.state(); return [...s.seen].map((c) => { const [x, y] = c.split(',').map(Number); return [c, s.map[y][x]]; }); });
      out['spectate.tileMismatch'] = String(await V((tiles) => { const s = __MANRU_QA_SPECTATE__.state(); return tiles.filter(([c, t]) => { const [x, y] = c.split(',').map(Number); return !s.seen.has(c) || s.map[y][x] !== t; }).length; }, hostTiles));
      // The side panel is filled by the same function as the player's, so its text is the host's.
      const panelIds = ['floorTxt', 'hpTxt', 'manaTxt', 'xpTxt', 'atkTxt', 'defTxt', 'evaTxt', 'wilTxt', 'visTxt', 'weaponTxt', 'armorTxt', 'alertTxt', 'messageLog'];
      const panelText = (p) => p.page.evaluate((ids) => Object.fromEntries(ids.map((id) => [id, document.getElementById(id)?.textContent ?? null])), panelIds);
      const [hp1, vp1] = [await panelText(host), await panelText(view)];
      out['spectate.panels'] = JSON.stringify({ differ: panelIds.filter((id) => hp1[id] !== vp1[id]), hasLog: (vp1.messageLog || '').length > 0, hp: vp1.hpTxt, swallowed: ignored.filter((t) => t.includes('spectate panels')) });
      await V(() => { const s = __MANRU_QA_SPECTATE__.state(), [x, y] = [...s.seen][0].split(',').map(Number); window.__MANRU_INSPECT984__({ x, y }); });
      await both(700);
      const opened = await V(() => document.body.classList.contains('manru-inspect-open'));
      await view.page.tap('#inspectClose'); await both(700);
      out['spectate.inspectClose'] = JSON.stringify({ opened, closed: await V(() => !document.body.classList.contains('manru-inspect-open')) });
      const crop = (p) => p.page.evaluate(() => {
        const P = window.__MANRU_CAMERA_PROJECTION12__, s = __MANRU_QA_SPECTATE__.state(), c = document.getElementById('game'), pl = s.player;
        const t = P.tileTopLeft(pl.x - 3, pl.y - 3), r = c.getBoundingClientRect(), dpr = c.width / r.width, w = Math.round(t.s * 7 * dpr), x = Math.round(t.x * dpr), y = Math.round(t.y * dpr);
        if (x < 0 || y < 0 || x + w > c.width || y + w > c.height) return null;
        return Array.from(c.getContext('2d').getImageData(x, y, w, w).data);
      });
      // A second viewer on a desktop-sized page shows the same picture as the host (same zoom; light flicker allowed).
      const wide = await openSession(browser, root, { seed: 8082, init });
      const bothW = async (ms = 200) => { await Promise.all([host.tick(ms), view.tick(ms), wide.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      await wide.page.click('#spectateBtn');
      for (let i = 0; i < 60 && !(await wide.page.evaluate(() => !!document.querySelector('#spectateRooms .spectateRoom'))); i++) await bothW();
      await wide.page.click('#spectateRooms .spectateRoom');
      for (let i = 0; i < 60 && !(await wide.page.evaluate(() => __MANRU_QA_SPECTATE__.state()?.seen?.size > 0)); i++) await bothW();
      for (let i = 0; i < 10; i++) await bothW();
      const [a, b] = await Promise.all([crop(host), crop(wide)]);
      out['spectate.picture'] = a && b && a.length === b.length ? String(a.reduce((n, v, i) => n + (Math.abs(v - b[i]) > 40 ? 1 : 0), 0) / a.length < 0.02) : 'size-differs';
      await wide.page.click('.spectateExit'); await wide.close();

      // The viewer's picture follows the host's character: the drawn position catches up after every step (it used to stay where it was
      // when the viewer joined), and a camera the viewer has moved stays where the viewer put it while the host walks on.
      const stepHost = () => H(() => { for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) if (__MANRU_QA_SPECTATE__.move(dx, dy).status === 'committed') break; });
      const apart = () => V(() => { const q = __MANRU_QA_SPECTATE__, s = q.state(), v = q.vis(); return Math.round(Math.hypot(v.x - s.player.x, v.y - s.player.y) * 100) / 100; });
      for (let i = 0; i < 3; i++) { await stepHost(); await both(400); }
      await both(1500);
      out['spectate.walkFollow'] = JSON.stringify({ apart: await apart(), mode: (await V(() => __MANRU_QA_SPECTATE__.vis().cam.mode)) });
      const camBefore = await V(() => { const C = globalThis.__MANRU_CAMERA_STATE12__; C.beginInspect(); C.panScreen(60, 0); return C.snapshot().cx; });
      for (let i = 0; i < 3; i++) { await stepHost(); await both(400); }
      await both(1500);
      out['spectate.walkFree'] = JSON.stringify({ apart: await apart(), mode: await V(() => __MANRU_QA_SPECTATE__.vis().cam.mode), camHeld: Math.abs((await V(() => globalThis.__MANRU_CAMERA_STATE12__.snapshot().cx)) - camBefore) < 1 });
      await V(() => globalThis.__MANRU_CAMERA_STATE12__.center());
      // 4. Floors follow, including a branch floor.
      await H(() => __MANRU_QA_SPECTATE__.regen(2));
      out['spectate.floor2'] = String(await until(() => V(() => __MANRU_QA_SPECTATE__.state().floor === 2)));
      await H(() => __MANRU_QA_SPECTATE__.go('dojo:1'));
      out['spectate.branch'] = String(await until(() => V(() => __MANRU_QA_SPECTATE__.state().branchContext105?.id === 'dojo')));

      // 5b. A message that arrives while the chat box is closed floats in on the screen and counts as unread; opening the box clears both.
      await H(() => __MANRU_QA_SPECTATE__.api.submitChat('먼저 인사'));
      out['spectate.popupShows'] = String(await until(() => V(() => !!document.querySelector('#spectatePopups .spectatePopup')?.textContent.includes('먼저 인사'))));
      out['spectate.unreadBadge'] = await V(() => document.querySelector('#spectateBar .spectateUnread')?.textContent || '');
      // 5. Chat both ways; the box keeps its focus after sending (the keyboard stays up).
      await view.page.tap('.spectateChatBtn');
      out['spectate.openClears'] = JSON.stringify(await V(() => ({ popups: !!document.getElementById('spectatePopups'), badge: !!document.querySelector('#spectateBar .spectateUnread') })));
      await view.page.fill('#spectateInput', '안녕하세요');
      await view.page.tap('#spectateChat .spectateForm button');
      out['spectate.chatFocus'] = await V(() => document.activeElement?.id || '');
      out['spectate.chatCleared'] = String((await view.page.inputValue('#spectateInput')) === '');
      out['spectate.hostGotChat'] = String(await until(() => H(() => __MANRU_QA_SPECTATE__.api.chat.some((c) => c.text === '안녕하세요'))));
      out['spectate.hostPopup'] = String(await H(() => !!document.querySelector('#spectatePopups .spectatePopup')?.textContent.includes('안녕하세요')));
      await H(() => __MANRU_QA_SPECTATE__.api.submitChat('환영합니다'));
      out['spectate.viewerGotChat'] = String(await until(() => V(() => [...document.querySelectorAll('#spectateLog .spectateMsg')].some((e) => e.textContent.includes('환영합니다')))));
      await view.page.fill('#spectateInput', '<img src=x onerror=window.__xss=1>');
      await view.page.tap('#spectateChat .spectateForm button');
      await until(() => V(() => document.querySelectorAll('#spectateLog img').length >= 0), 4);
      out['spectate.chatTextOnly'] = String(await V(() => document.querySelectorAll('#spectateLog img').length === 0 && window.__xss === undefined));
      await view.page.fill('#spectateInput', '첫째'); await view.page.tap('#spectateChat .spectateForm button');
      await view.page.fill('#spectateInput', '둘째'); await view.page.tap('#spectateChat .spectateForm button'); await both(600);
      out['spectate.chatRateLimit'] = String((await H(() => __MANRU_QA_SPECTATE__.api.chat.filter((c) => ['첫째', '둘째'].includes(c.text)).length)) <= 1);

      // 6. Nothing the viewer does reaches the host or its own game; scroll and zoom stay free.
      await view.page.evaluate(() => document.getElementById('spectateChat')?.remove());
      const before = await H(() => { const s = __MANRU_QA_SPECTATE__.state(); return [s.player.x, s.player.y, s.turn]; });
      for (const k of ['ArrowUp', 'ArrowLeft', 'Space', 'KeyF']) await view.page.keyboard.press(k);
      await view.page.touchscreen.tap(195, 400);
      await both(400);
      out['spectate.hostUnchanged'] = String(JSON.stringify(before) === JSON.stringify(await H(() => { const s = __MANRU_QA_SPECTATE__.state(); return [s.player.x, s.player.y, s.turn]; })));
      const z0 = await V(() => globalThis.__MANRU_CAMERA_PROJECTION12__.current().zoom);
      await view.page.mouse.move(195, 400); await view.page.mouse.wheel(0, -300); await both(300);
      out['spectate.zoom'] = String((await V(() => globalThis.__MANRU_CAMERA_PROJECTION12__.current().zoom)) > z0);
      out['spectate.viewerSaves'] = String(await V(() => Object.keys(localStorage).filter((k) => /active_run/.test(k)).length === 0));

      // 7. Leaving returns to the title and the host forgets the viewer.
      await view.page.tap('.spectateExit');
      out['spectate.left'] = JSON.stringify(await V(() => ({ screen: document.body.dataset.manruScreen, state: __MANRU_QA_SPECTATE__.state() === null, bar: !!document.getElementById('spectateBar') })));
      out['spectate.hostForgets'] = String(await until(() => H(() => __MANRU_QA_SPECTATE__.api.viewers.size === 0)));

      // 8. The death screen offers the last scenes; the replay ends on the death and closes back to the death screen.
      await H(() => __MANRU_QA_SPECTATE__.die('시험'));
      await host.tick(500);
      out['spectate.replayOffered'] = String(await H(() => !!document.querySelector('.deathReplay94')));
      await host.page.click('.deathReplay94');
      out['spectate.replayEnds'] = String(await until(() => H(() => { const r = __MANRU_QA_SPECTATE__.api.replaying; return !!r && r.index === r.frames.length; }), 160));
      out['spectate.replayDead'] = String(await H(() => __MANRU_QA_SPECTATE__.state().dead === true));
      await host.page.click('.spectateExit'); await host.tick(300);
      out['spectate.replayClosed'] = JSON.stringify(await H(() => ({ replaying: !!__MANRU_QA_SPECTATE__.api.replaying, overlay: getComputedStyle(document.getElementById('overlay')).display, dead: __MANRU_QA_SPECTATE__.state().dead })));
      // A server that is not there: the list says so, keeps the "try again" promise and does not hang on "searching".
      const deadInit = init.replace(`127.0.0.1:${port}`, '127.0.0.1:9');
      const lost = await openSession(browser, root, { seed: 8083, init: deadInit });
      await lost.page.click('#spectateBtn');
      for (let i = 0; i < 80 && !(await lost.page.evaluate(() => /다시 시도/.test(document.getElementById('spectateListNote').textContent))); i++) { await lost.tick(300); await new Promise((r) => setTimeout(r, 40)); }
      out['spectate.serverDown'] = await lost.page.evaluate(() => document.getElementById('spectateListNote').textContent.replace(/\(.*?\)/g, '').replace(/코드 \d+/, '코드 N'));
      await lost.close();
      out['spectate.errors'] = JSON.stringify({ host: host.errors, view: view.errors });
      await host.close(); await view.close();
    } finally { relay.kill(); }
    return out;
  },

  // One modal at a time: opening the inventory from the menu drawer closes the drawer. Both open at once made every item use
  // refuse ("blocked": the input owner only allows the inventory itself).
  // A bleeding weapon (the triangle spear) opens a real wound: the foe bleeds for 4 turns, a share of its health each turn, and the bleeding then ends.
  async bleedSpear(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 4245 });
    await startRun(s, 'strongman');
    const placed = await s.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), B = __MANRU_QA_BAL__, T = __MANRU_QA_VIS__.TT;
      let spot = null;
      for (let y = 2; y < st.map.length - 2 && !spot; y++) for (let x = 6; x < st.map[0].length - 8 && !spot; x++) if ([-1, 0, 1, 2].every((i) => st.map[y][x + i] === T.FLOOR)) spot = { x, y };
      const p = st.player; p.x = spot.x; p.y = spot.y; p.facing = { x: 1, y: 0 };
      for (const m of [...st.monsters]) m.hp = 0;
      B.equip('삼각창'); p.weapon.bleed = 1; __MANRU_QA_VIS__.compute();
      const mon = B.placeAt('취객', 1, 0);
      if (!mon) return false;
      mon.hp = mon.maxHp = 300; mon.atk = 0; window.__bleedMon = mon; __MANRU_QA_VIS__.compute();
      return true;
    });
    const read = () => s.page.evaluate(() => ({ hp: window.__bleedMon.hp, bleeding: window.__bleedMon.bleeding55 || 0, source: window.__bleedMon.bleedSource57 ?? null }));
    // strike until the blow lands (it can miss); the weapon bleeds every time it hurts
    let hit = null;
    for (let i = 0; i < 10 && !hit; i++) {
      await s.page.evaluate(() => __MANRU_QA_UI__.dispatch({ type: 'ATTACK', args: [] }));
      await s.tick(900); await dismissModals(s, 1);
      const now = await read();
      if (now.hp < 300) hit = now;
    }
    const hp = [hit?.hp], bleeding = [hit?.bleeding];
    await s.page.evaluate(() => { __MANRU_QA_UI__.state().player.weapon.bleed = 0; });
    for (let i = 0; i < 4; i++) {
      await s.page.evaluate(() => __MANRU_QA_UI__.dispatch({ type: 'REST', args: [] }));
      await s.tick(900); await dismissModals(s, 1);
      const now = await read(); hp.push(now.hp); bleeding.push(now.bleeding);
    }
    const lost = hp.map((v, i) => (i ? hp[i - 1] - v : 0));
    const last = await read();
    out['bleedSpear.wound'] = JSON.stringify({ placed, hp, bleeding, losesWhileBleeding: lost.slice(1).filter((_, i) => bleeding[i] > 0).every((v) => v > 0), endsWithoutLoss: lost[lost.length - 1] === 0, source: last.source });
    out['bleedSpear.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // The strike turns the player toward the foe it hits, so the next strike reaches along that line (a long weapon after a bump behind).
  async attackFacing(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 4244 });
    await startRun(s, 'strongman');
    out['attackFacing.turns'] = JSON.stringify(await s.page.evaluate(async () => {
      const st = __MANRU_QA_UI__.state(), B = __MANRU_QA_BAL__, T = __MANRU_QA_VIS__.TT;
      let spot = null;
      for (let y = 2; y < st.map.length - 2 && !spot; y++) for (let x = 6; x < st.map[0].length - 8 && !spot; x++) if ([-3, -2, -1, 0, 1, 2, 3, 4].every((i) => st.map[y][x + i] === T.FLOOR)) spot = { x, y };
      const p = st.player; p.x = spot.x; p.y = spot.y; p.facing = { x: 1, y: 0 };
      for (const m of [...st.monsters]) m.hp = 0;
      B.equip('대나무창'); __MANRU_QA_VIS__.compute();
      const behind = B.placeAt('취객', -1, 0);
      if (!behind) return { placed: false };
      __MANRU_QA_VIS__.compute();
      const before = { ...p.facing };
      __MANRU_QA_UI__.dispatch({ type: 'ATTACK', args: [] });
      return { placed: true, before, after: { ...p.facing } };
    }));
    // 곡격 (the flail): like a ranged weapon it strikes a foe in reach in any direction, turning to it; a plain melee weapon still strikes only what it faces
    const flail = {}, flailErrors = [];
    for (const weapon of ['편곤', '조잡한 단검']) {
      const f = await openSession(browser, root, { seed: 4245 }); // a fresh run for each: after one attack the next input is held for a while
      await startRun(f, 'strongman'); await f.tick(900);
      flail[weapon] = await f.page.evaluate(async (weapon) => {
        const st = __MANRU_QA_UI__.state(), B = __MANRU_QA_BAL__, T = __MANRU_QA_VIS__.TT, p = st.player;
        let spot = null;
        for (let y = 4; y < st.map.length - 4 && !spot; y++) for (let x = 6; x < st.map[0].length - 8 && !spot; x++) if ([-2, -1, 0, 1, 2].every((i) => st.map[y + i][x] === T.FLOOR && st.map[y][x + i] === T.FLOOR)) spot = { x, y };
        for (const m of [...st.monsters]) m.hp = 0;
        p.x = spot.x; p.y = spot.y; p.facing = { x: 1, y: 0 }; st.status.stealth = 0;
        B.equip(weapon); __MANRU_QA_VIS__.compute();
        const foe = B.placeAt('취객', 0, -2);
        __MANRU_QA_VIS__.compute();
        const turn = st.turn;
        const r = __MANRU_QA_UI__.dispatch({ type: 'ATTACK', args: [] });
        return { placed: !!foe, facing: { ...p.facing }, acted: st.turn > turn, status: r.status, hit: !!foe && (foe.hp < foe.maxHp || foe.alerted === true) };
      }, weapon);
      flailErrors.push(f.errors); await f.close();
    }
    out['attackFacing.flail'] = JSON.stringify(flail);
    out['attackFacing.flail.errors'] = JSON.stringify(flailErrors);
    {
      const fl = JSON.parse(out['attackFacing.flail']);
      if (!fl['편곤'].placed || fl['편곤'].facing.x !== 0 || fl['편곤'].facing.y !== -1 || !fl['편곤'].acted || !fl['편곤'].hit) throw Error('attackFacing: the flail did not strike a foe it was not facing ' + out['attackFacing.flail']);
      if (fl['조잡한 단검'].status !== 'committed') throw Error('attackFacing: the control attack did not happen ' + out['attackFacing.flail']);
      if (fl['조잡한 단검'].facing.x !== 1 || fl['조잡한 단검'].facing.y !== 0) throw Error('attackFacing: a plain weapon turned to a foe it was not facing ' + out['attackFacing.flail']);
    }
    out['attackFacing.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // What breaks by walking into it (a table, a screen, a hedge, bamboo) breaks by a blow too, and the blast talisman breaks the furniture in the 3x3 it explodes in.
  async furnitureBreak(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 4246 });
    await startRun(s, 'strongman'); await s.tick(900);
    out['furnitureBreak.attack'] = JSON.stringify(await s.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), T = __MANRU_QA_VIS__.TT, p = st.player, res = {};
      let spot = null;
      for (let y = 4; y < st.map.length - 4 && !spot; y++) for (let x = 6; x < st.map[0].length - 8 && !spot; x++) if ([0, 1, 2, 3, 4].every((i) => st.map[y][x + i] === T.FLOOR)) spot = { x, y };
      p.x = spot.x; p.y = spot.y; p.facing = { x: 1, y: 0 };
      for (const m of [...st.monsters]) m.hp = 0;
      globalThis.__furnSpot = spot;
      st.map[p.y][p.x + 1] = T.TABLE; __MANRU_QA_VIS__.compute();
      const r = __MANRU_QA_UI__.dispatch({ type: 'ATTACK', args: [] });
      res.table = { status: r.status, broken: st.map[p.y][p.x + 1] !== T.TABLE };
      return res;
    }));
    await s.tick(900);
    out['furnitureBreak.use'] = JSON.stringify(await s.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), T = __MANRU_QA_VIS__.TT, p = st.player, spot = globalThis.__furnSpot;
      const cells = [[0, 0], [1, 0], [0, 1], [-1, -1]].map(([dx, dy]) => [spot.x + 3 + dx, spot.y + dy]);
      [T.TABLE, T.CRATE, T.SCREEN, T.BENCH].forEach((t, i) => { st.map[cells[i][1]][cells[i][0]] = t; });
      __MANRU_QA_VIS__.compute();
      globalThis.__furnCells = cells;
      const idx = __MANRU_QA_BAL__.give('폭발부적');
      const use = __MANRU_QA_UI__.dispatch({ type: 'ITEM_USE', args: [idx] });
      return { status: use.status, furniture: cells.map(([x, y]) => st.map[y][x] !== T.FLOOR) };
    }));
    await s.tick(900);
    out['furnitureBreak.blast'] = JSON.stringify(await s.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), T = __MANRU_QA_VIS__.TT, spot = globalThis.__furnSpot, cells = globalThis.__furnCells;
      const r = __MANRU_QA_UI__.dispatch({ type: 'TARGET_CONFIRM', cell: { x: spot.x + 3, y: spot.y } });
      return { status: r.status, left: cells.map(([x, y]) => st.map[y][x] !== T.FLOOR), log: st.log.slice(0, 4).some((l) => /가구/.test(l)) };
    }));
    {
      const a = JSON.parse(out['furnitureBreak.attack']), u = JSON.parse(out['furnitureBreak.use']), b = JSON.parse(out['furnitureBreak.blast']);
      if (a.table.status !== 'committed' || !a.table.broken) throw Error('furnitureBreak: a blow did not break the table ' + JSON.stringify(a));
      if (u.status !== 'pending' || !u.furniture.every(Boolean)) throw Error('furnitureBreak: the blast test was not set up ' + JSON.stringify(u));
      if (b.status !== 'committed' || b.left.some(Boolean) || !b.log) throw Error('furnitureBreak: the blast left furniture standing ' + JSON.stringify(b));
    }
    out['furnitureBreak.errors'] = JSON.stringify(s.errors);
    await s.close();
    return out;
  },

  // A blink may cross water or a cliff but never lands in a pocket the player could not walk out of (a run ended on one): the same blink across to ground that is
  // connected still works.
  async blinkTrap(browser, root) {
    const out = {};
    for (const pocket of [true, false]) {
      const s = await openSession(browser, root, { seed: 4247 });
      await startRun(s, 'strongman'); await s.tick(900);
      out['blinkTrap.' + (pocket ? 'pocket' : 'ground')] = JSON.stringify(await s.page.evaluate((pocket) => {
        const st = __MANRU_QA_UI__.state(), T = __MANRU_QA_VIS__.TT, p = st.player;
        let spot = null;
        for (let y = 5; y < st.map.length - 5 && !spot; y++) for (let x = 6; x < st.map[0].length - 10 && !spot; x++) if ([0, 1, 2, 3, 4, 5].every((i) => st.map[y][x + i] === T.FLOOR)) spot = { x, y };
        for (const m of [...st.monsters]) m.hp = 0;
        p.x = spot.x; p.y = spot.y; p.facing = { x: 1, y: 0 }; p.blinkLevel = 3; p.focus = p.maxFocus;
        if (pocket) {
          // the landing cell, three steps on, is ringed by water: no way to walk in or out
          const lx = spot.x + 3, ly = spot.y;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) st.map[ly + dy][lx + dx] = T.WATER;
          st.map[ly][lx] = T.FLOOR;
          // and the ground before it is water too, so the only standable cell in the ray is the pocket
          st.map[spot.y][spot.x + 1] = T.WATER; st.map[spot.y][spot.x + 2] = T.WATER;
        }
        __MANRU_QA_VIS__.compute();
        const before = { x: p.x, y: p.y }, r = __MANRU_QA_UI__.dispatch({ type: 'BLINK', args: [] });
        return { status: r.status, before, after: { x: p.x, y: p.y }, moved: p.x !== before.x || p.y !== before.y };
      }, pocket));
      out['blinkTrap.errors.' + (pocket ? 'pocket' : 'ground')] = JSON.stringify(s.errors);
      await s.close();
    }
    {
      const a = JSON.parse(out['blinkTrap.pocket']), b = JSON.parse(out['blinkTrap.ground']);
      if (a.moved) throw Error('blinkTrap: the blink landed in a pocket it could not walk out of ' + JSON.stringify(a));
      if (!b.moved || b.after.x !== b.before.x + 3) throw Error('blinkTrap: the control blink over open ground did not work ' + JSON.stringify(b));
    }
    return out;
  },

  // The code box of the record tab: a wrong code does nothing, the right one (once per device) puts 소회복 비약 x2, 보강부적 x2, 성부 x1 and 신비부적 x1 into the next new run, once.
  async giftCode(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 4249 });
    await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
    out['giftCode.box'] = JSON.stringify(await s.page.evaluate(() => {
      const A = __MANRU_QA_STATS__.api; A.open(); A.tab = 'rows'; A.render();
      const box = document.querySelector('.giftBox'), input = box?.querySelector('input'), button = box?.querySelector('button'), note = box?.querySelector('.giftNote'), say = (code) => { input.value = code; button.click(); return note.textContent; };
      if (!box) return { box: false };
      const wrong = say('00000'), right = say('19721'), again = say('19721');
      const redraw = (A.render(), document.querySelector('.giftBox') === box);
      A.close();
      return { box: true, wrong, right, again, redrawSameBox: redraw, pending: localStorage.getItem('manruGiftPending'), done: localStorage.getItem('manruGiftDone') };
    }));
    await s.tick(800);
    out['giftCode.run'] = JSON.stringify(await s.page.evaluate(() => {
      globalThis.__MANRU_QA_DUEL__.newRun(); // the start of a new run is where the things are handed over
      const st = __MANRU_QA_UI__.state(), all = [...(st.tutorialChest?.loot || []), ...st.player.inventory], count = (name) => all.filter((i) => i.name === name).reduce((n, i) => n + (i.count || 1), 0);
      return { potion: count('소회복 비약'), reinforce: count('보강부적'), holy: count('성부'), mystery: count('신비부적'), inChest: !!st.tutorialChest && !st.tutorialChest.opened, pending: localStorage.getItem('manruGiftPending') };
    }));
    out['giftCode.errors'] = JSON.stringify(s.errors);
    await s.close();
    {
      const b = JSON.parse(out['giftCode.box']), r = JSON.parse(out['giftCode.run']);
      if (!b.box || !/알 수 없는/.test(b.wrong) || !/받았다/.test(b.right) || !/이미/.test(b.again) || !b.redrawSameBox || b.pending !== '1') throw Error('giftCode: the box ' + out['giftCode.box']);
      if (r.potion < 2 || r.reinforce < 2 || r.holy < 1 || r.mystery < 1 || r.pending !== null) throw Error('giftCode: the things did not come, or came again ' + out['giftCode.run']);
    }
    return out;
  },

  async vision(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 4243 });
    await startRun(s, 'strongman');
    out['vision.closet'] = JSON.stringify(await s.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), V = __MANRU_QA_VIS__;
      st.player.x = 55; st.player.y = 30; st.seen = new Set(); V.compute();
      const before = { south: V.edges(57, 31).south, face: V.open(57, 31, 0, 1) };
      st.seen.add('57,32');
      const after = { south: V.edges(57, 31).south, face: V.open(57, 31, 0, 1) };
      // the wall beside a wall that is still drawn as an edge has no line along that side (no stub next to the closet's south wall)
      st.seen = new Set(); V.compute();
      const stub = V.edges(54, 31).east;
      return { before, after, stub };
    }));
    // over many positions of floor 1: no seen wall carries an edge or a corner for a cell that has not been seen
    out['vision.unseenEdges'] = String(await s.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), V = __MANRU_QA_VIS__, T = V.TT;
      const floors = []; for (let y = 1; y < st.map.length - 1; y++) for (let x = 1; x < st.map[0].length - 1; x++) if (!V.opaque(st.map[y][x])) floors.push([x, y]);
      const around = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0], nw: [-1, -1], ne: [1, -1], sw: [-1, 1], se: [1, 1] };
      let bad = 0;
      for (const [x, y] of floors.filter((_, i) => i % 9 === 0)) {
        st.player.x = x; st.player.y = y; st.seen = new Set(); V.compute();
        for (const key of st.seen) {
          const [cx, cy] = key.split(',').map(Number); if (st.map[cy][cx] !== T.WALL) continue;
          const e = V.edges(cx, cy);
          for (const [name, [dx, dy]] of Object.entries(around)) if (e[name] && !st.seen.has(`${cx + dx},${cy + dy}`)) bad++;
        }
      }
      return bad;
    }));
    await s.close();
    return out;
  },

  // Holding the wait key rests on its own, and stops when it is let go, when health is full, when hunger is out and when an enemy is in sight.
  async restHold(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 8181 });
    await startRun(s, 'escort');
    await s.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), p = st.player, r = (st.rooms || []).slice(2).filter((x) => x.w >= 5 && x.h >= 5)[0];
      st.monsters.length = 0; p.x = Math.floor(r.x + r.w / 2); p.y = Math.floor(r.y + r.h / 2); p.hunger = 99; p.hp = 5;
    });
    const read = () => s.page.evaluate(() => { const st = __MANRU_QA_UI__.state(); return { turn: st.turn, hp: st.player.hp, max: st.player.maxHp, hunger: st.player.hunger }; });
    const t0 = (await read()).turn;
    await s.page.keyboard.press('KeyR'); await s.tick(400);
    out['restHold.tapIsOneTurn'] = String((await read()).turn - t0 === 1);
    // the one-time tips that come with the first turns are read first
    for (let i = 0; i < 5; i++) { await s.page.keyboard.press('KeyR'); await s.tick(400); await s.page.keyboard.press('Escape'); await s.tick(300); await s.page.keyboard.press('Escape'); await s.tick(300); }
    await s.page.evaluate(() => { __MANRU_QA_UI__.state().player.hp = 5; });
    const h0 = (await read()).turn;
    await s.page.keyboard.down('KeyR');
    for (let i = 0; i < 12; i++) await s.tick(250);
    const held = await read();
    out['restHold.heldRests'] = String(held.turn - h0 > 8);
    await s.page.keyboard.up('KeyR');
    const afterUp = (await read()).turn;
    for (let i = 0; i < 6; i++) await s.tick(250);
    out['restHold.releaseStops'] = String((await read()).turn === afterUp);
    // health full: the hold stops by itself
    await s.page.evaluate(() => { const p = __MANRU_QA_UI__.state().player; p.hp = p.maxHp - 1; });
    await s.page.keyboard.down('KeyR');
    for (let i = 0; i < 40; i++) await s.tick(250);
    const full = await read();
    out['restHold.stopsWhenFull'] = String(full.hp === full.max);
    await s.page.keyboard.up('KeyR');
    // an enemy in sight: no continued rest
    // hunger out: no continued rest
    await s.page.evaluate(() => { const p = __MANRU_QA_UI__.state().player; p.hp = 5; p.hunger = 0; });
    const g0 = (await read()).turn;
    await s.page.keyboard.down('KeyR');
    for (let i = 0; i < 10; i++) await s.tick(250);
    await s.page.keyboard.up('KeyR');
    out['restHold.stopsWhenStarving'] = String((await read()).turn - g0 <= 1);
    // an enemy in sight: no continued rest
    await s.page.evaluate(() => { const p = __MANRU_QA_UI__.state().player; p.hp = 5; p.hunger = 99; });
    const spawned = await s.page.evaluate(() => __MANRU_QA_BAL__.spawnNear('취객'));
    await s.page.keyboard.press('Escape'); await s.tick(200);
    const e0 = (await read()).turn;
    await s.page.keyboard.down('KeyR');
    for (let i = 0; i < 10; i++) await s.tick(250);
    await s.page.keyboard.up('KeyR');
    out['restHold.stopsWithEnemy'] = String(spawned && (await read()).turn - e0 <= 1);
    out['restHold.errors'] = JSON.stringify(s.errors);
    await s.close();
    // the wait button of the phone pad does the same while it is held
    const m = await openSession(browser, root, { seed: 8182, viewport: { width: 390, height: 844 }, mobile: true });
    await startRun(m, 'escort');
    await m.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), p = st.player, r = (st.rooms || []).slice(2).filter((x) => x.w >= 5 && x.h >= 5)[0];
      st.monsters.length = 0; p.x = Math.floor(r.x + r.w / 2); p.y = Math.floor(r.y + r.h / 2); p.hunger = 99; p.hp = 5;
    });
    const mread = () => m.page.evaluate(() => __MANRU_QA_UI__.state().turn);
    const box = await m.page.locator('#mobileControls .pad [data-act="rest"]').boundingBox();
    for (let i = 0; i < 4; i++) { await m.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await m.tick(400); await m.page.keyboard.press('Escape'); await m.tick(300); await m.page.keyboard.press('Escape'); await m.tick(300); }
    await m.page.evaluate(() => { __MANRU_QA_UI__.state().player.hp = 5; });
    const p0 = await mread();
    await m.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await m.page.mouse.down();
    for (let i = 0; i < 14; i++) await m.tick(250);
    const during = (await mread()) - p0;
    await m.page.mouse.up(); await m.tick(300);
    const after = await mread();
    for (let i = 0; i < 6; i++) await m.tick(250);
    out['restHold.padHolds'] = String(during > 8);
    out['restHold.padReleaseStops'] = String((await mread()) === after);
    await m.close();
    return out;
  },

  // One modal at a time: opening the inventory from the menu drawer closes the drawer. Both open at once made every item use
  // refuse ("blocked": the input owner only allows the inventory itself).
  async drawer(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 8080, viewport: { width: 390, height: 844 }, mobile: true });
    await startRun(s, 'wanderer');
    for (let i = 0; i < 3; i++) { await s.page.keyboard.press('Escape'); await s.tick(150); }
    const panels = () => s.page.evaluate(() => ({ drawer: /mobile-drawer-open/.test(document.body.className), inventory: document.getElementById('inventory').classList.contains('open') }));
    await s.page.tap('#mobilePanelBtn'); await s.tick(400);
    out['drawer.open'] = JSON.stringify(await panels());
    await s.page.evaluate(() => [...document.querySelectorAll('#mobileDrawer .mTab')].find((b) => b.textContent === '장비')?.click()); await s.tick(300);
    await s.page.evaluate(() => document.getElementById('openInvFromDrawer')?.click()); await s.tick(500);
    out['drawer.inventoryFromDrawer'] = JSON.stringify(await panels());
    // and the other way: the drawer opened while the inventory is open yields to nothing it should not
    await s.page.keyboard.press('Escape'); await s.tick(300);
    out['drawer.closed'] = JSON.stringify(await panels());
    // The state in the report: the inventory is open, a menu-drawer session is still active underneath, and wearing a cloak was refused
    // ("blocked") every time. The cloak is worn now, and both the inventory and the stale drawer are closed afterwards.
    await s.page.evaluate(() => { const st = __MANRU_QA_UI__.state(); st.player.inventory.push({ name: '시험망토', type: 'cloak', tier: 1, rarity: 'common', count: 1 }); });
    await s.page.keyboard.press('KeyI'); await s.tick(400);
    await s.page.evaluate(() => __MANRU_QA_UI__.sessions.add('mobileDrawer'));
    out['drawer.wearUnderStaleDrawer'] = JSON.stringify(await s.page.evaluate(() => {
      const U = __MANRU_QA_UI__, st = U.state(), idx = st.player.inventory.findIndex((i) => i.name === '시험망토');
      const res = U.dispatch({ type: 'ITEM_USE', args: [idx] });
      return { blocked: res.status === 'blocked', worn: st.player.cloak?.name || null, drawerActive: U.sessions.has('mobileDrawer'), inventoryOpen: document.getElementById('inventory').classList.contains('open') };
    }));
    out['drawer.errors'] = JSON.stringify(s.errors);
    await s.close();
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
          const body = JSON.parse(req.postData());
          if (body.claim !== undefined) {
            (posts.claims ||= []).push(body);
            if (mode.claim === 'taken') return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '{"ok":false,"error":"taken"}' });
            if (mode.claim === 'old') return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '{"ok":false,"error":"fields"}' });
            return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ ok: true, nick: body.claim }) });
          }
          posts.push(body);
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
      await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
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
      // The same browser keeps one player ID (four capital letters and two digits) and every record id starts with it, so the ranking tag is that ID.
      out['stats.deviceId'] = await s.page.evaluate(() => {
        const A = __MANRU_QA_STATS__.api, a = A.deviceTag(), b = A.deviceTag(); A.device = ''; const c = A.deviceTag();
        return JSON.stringify({ format: /^[A-Z]{4}\d{2}$/.test(a), same: a === b, keptAfterReload: a === c, stored: localStorage.getItem(A.DEVICE_KEY) === a, tag: A.tag(a + '-run-1') === a });
      });
      // The nickname is chosen once, on the ranking board: bad input is refused, the first good one is kept, a second one is refused.
      out['stats.nickname'] = await s.page.evaluate(async () => {
        const A = __MANRU_QA_STATS__.api, bad = [];
        for (const text of ['', 'a', '가나다라마바사아자', 'a b!']) bad.push((await A.registerNick(text)).ok);
        const none = A.nick(), first = await A.registerNick('만루왕'), second = await A.registerNick('다른이름');
        return JSON.stringify({ bad, none, first, second: second.ok, stored: localStorage.getItem(A.NICK_KEY) });
      });
      // On the board: the form is there until a nickname is chosen, typing and pressing the button registers it and the form goes.
      await s.page.evaluate(() => { const A = __MANRU_QA_STATS__.api; localStorage.removeItem(A.NICK_KEY); A.open('rank'); document.querySelector('.rankNick input').value = '만루왕'; });
      const nickFormBefore = await s.page.evaluate(() => !!document.querySelector('.rankNick input'));
      await s.page.evaluate(() => document.querySelector('.rankNick button').click());
      await waitFor(() => s.page.evaluate(() => !document.querySelector('.rankNick')));
      out['stats.nickForm'] = await s.page.evaluate((b) => { const A = __MANRU_QA_STATS__.api, r = JSON.stringify({ before: b, after: !!document.querySelector('.rankNick'), label: document.querySelector('.rankMineLabel')?.textContent || '', nick: A.nick() }); A.close(); return r; }, nickFormBefore);
      // Cleared runs ("End", floor 25) count as floor 30 and lead the depth board; the class look falls back to the default class; this device's own nickname shows on its own runs.
      out['stats.rankRows'] = await s.page.evaluate(() => {
        const A = __MANRU_QA_STATS__.api;
        const rows = A.withLegacyRanking({ total: 2, boards: { depth: [{ tag: 'BBBB22', nick: '', cls: '', floor: 25, cause: '객잔 경비병', level: 12, kills: 99, turns: 100 }, { tag: 'AAAA11', nick: '', cls: 'archer', floor: 25, cause: 'End', level: 9, kills: 90, turns: 3000 }], level: [], kills: [] } }).boards.depth;
        return JSON.stringify({ first: rows[0].tag, firstFloor: rows[0].floor, firstText: A.floorText(rows[0]), second: A.floorText(rows[1]), icons: [A.classIcon('archer').width, A.classIcon('').width, A.classIcon('nope').width], own: A.who({ tag: A.deviceTag() }) });
      });
      // A run still being played is listed in its own look; the class look is a clean sprite (transparent, not in a black box) a little larger.
      out['stats.liveRows'] = await s.page.evaluate(() => {
        const A = __MANRU_QA_STATS__.api, mk = (tag, floor, live) => ({ tag, nick: '', cls: 'swordsman', floor, cause: live ? '진행 중' : '함정', level: 5, kills: 20, turns: 800, live });
        const rows = [mk('LIVE00', 9, true), mk('DEAD22', 8, false), mk('DEAD33', 7, false), mk('LIVE11', 6, true), mk('DEAD44', 5, false), mk('LIVE55', 4, true)];
        A.open('rank'); A.ranking = A.withLegacyRanking({ total: 5, boards: { depth: rows, level: rows, kills: rows } }); A.failed = {}; A.render();
        const icon = document.querySelector('.rankClass'), cs = getComputedStyle(icon), live = document.querySelector('.rankRow.live'), plate = document.querySelector('.rankPlate.live');
        const result = JSON.stringify({ livePlates: document.querySelectorAll('.rankPlate.live').length, liveRows: document.querySelectorAll('.rankRow.live').length, tags: document.querySelectorAll('.rankLiveTag').length, iconBg: cs.backgroundColor, iconSize: cs.width + ' ' + cs.height, rowAnimation: live ? getComputedStyle(live).animationName : '', plateAnimation: plate ? getComputedStyle(plate).animationName : '' });
        A.close(); return result;
      });
      // The ghost board lists the ghosts that stand (no legacy rows mixed in), by who they were, and says so when empty
      out['stats.ghostBoard'] = await s.page.evaluate(() => {
        const A = __MANRU_QA_STATS__.api, g = (tag, floor, level, cls) => ({ tag, nick: '', cls, floor, level, kills: 10, turns: 500, cause: '함정', wins: 3, losses: 1 });
        A.open('rank'); A.board = 'ghost';
        A.ranking = A.withLegacyRanking({ total: 3, boards: { depth: [], level: [], kills: [], ghost: [g('GHOS11', 18, 21, 'swordsman'), g('GHOS22', 12, 14, 'archer'), g('GHOS33', 9, 9, 'summoner'), g('GHOS44', 7, 8, 'archer')] } }); A.failed = {}; A.render();
        const result = { tabs: [...document.querySelectorAll('[data-rank-board]')].map((b) => b.textContent), plates: document.querySelectorAll('.rankPlate:not(.empty)').length, rows: document.querySelectorAll('.rankRow').length, detail: document.querySelector('.rankPlate .rankDetail')?.textContent || '', value: document.querySelector('.rankPlate.p1 .rankValue')?.textContent || '', legacyMixed: JSON.stringify(A.ranking.boards.ghost).includes('Legacy') };
        A.ranking = A.withLegacyRanking({ total: 0, boards: { depth: [], level: [], kills: [], ghost: [] } }); A.render();
        result.empty = [...document.querySelectorAll('.statsNote')].map((n) => n.textContent);
        A.board = 'depth'; A.close(); return JSON.stringify(result);
      });
      // the ghost board says level, wins and losses under each ghost (not the depth board's kills and turns)
      if (!/Lv \d+ · 3승 1패$/.test(JSON.parse(out['stats.ghostBoard']).detail)) throw Error('stats: the ghost board does not show level/wins/losses ' + out['stats.ghostBoard']);
      // a ghost whose score is at or under its death score is not listed, whether or not the server has settled it yet
      out['stats.ghostGone'] = await s.page.evaluate(() => {
        const A = __MANRU_QA_STATS__.api, g = (tag, score, peak) => ({ tag, nick: '', cls: 'archer', floor: 9, level: 9, kills: 10, turns: 500, cause: '함정', score, peak });
        A.open('rank'); A.board = 'ghost';
        A.ranking = A.withLegacyRanking({ total: 3, boards: { depth: [], level: [], kills: [], ghost: [g('ALIVE1', 9, 9), g('GONE11', 3, 30), g('ALIVE2', 0, 0)] } }); A.failed = {}; A.render();
        const tags = [...document.querySelectorAll('.rankTag,.rankWho b')].map((n) => n.textContent);
        A.board = 'depth'; A.close(); return JSON.stringify(tags);
      });
      if (/GONE11/.test(out['stats.ghostGone']) || !/ALIVE1/.test(out['stats.ghostGone'])) throw Error('stats: a ghost that is gone is listed ' + out['stats.ghostGone']);
      // a server that does not serve the ghost board has no ghost tab (the records alone cannot tell which ghosts still stand)
      out['stats.ghostFallback'] = await s.page.evaluate(() => { const A = __MANRU_QA_STATS__.api; A.open('rank'); A.board = 'depth'; A.ranking = A.withLegacyRanking({ total: 1, boards: { depth: [{ tag: 'AAAA11', nick: '', cls: 'archer', floor: 9, level: 5, kills: 1, turns: 9, cause: '함정' }], level: [], kills: [] } }); A.failed = {}; A.render(); const tabs = [...document.querySelectorAll('[data-rank-board]')].map((b) => b.textContent); A.close(); return JSON.stringify({ tabs, ghost: A.ranking.boards.ghost ?? null }); });
      // The board names a run by its nickname when the server sends one.
      out['stats.nickWho'] = await s.page.evaluate(() => { const A = __MANRU_QA_STATS__.api; return JSON.stringify([A.who({ tag: 'ABCD12', nick: '만루왕' }), A.who({ tag: 'ABCD12', nick: '' }), A.who({ tag: 'Legacy' })]); });
      out['stats.errors'] = JSON.stringify(s.errors);
      await s.close();
      await ctx.close();
    }

    // Taps that are too slow, or outside the title block, never add up.
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await serve(ctx, {});
      const s = await openSession(browser, root, { seed: 90, context: ctx, init: endpoint });
      await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
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

    // The name is asked for as soon as the game is opened (when there is a statistics server and no name yet): the server's list refuses a
    // name that another device has; a server that does not know claims yet lets it stay on this device; a name kept from before is claimed now.
    for (const [key, mode, storage, typed] of [['ask', {}, [], '만루왕'], ['taken', { claim: 'taken' }, [], '만루왕'], ['oldServer', { claim: 'old' }, [], '만루왕'], ['keptBefore', { claim: 'taken' }, [['manruNick', '옛이름']], '']]) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const posts = await serve(ctx, mode);
      const s = await openSession(browser, root, { seed: 95, context: ctx, init: endpoint, storage });
      await waitFor(() => s.page.evaluate(() => !!document.getElementById('nickAsk')));
      const asked = await s.page.evaluate(() => ({ modal: !!document.getElementById('nickAsk'), note: document.querySelector('#nickAsk p')?.textContent || '' }));
      if (typed) {
        await s.page.evaluate((t) => { document.querySelector('#nickAsk .rankNick input').value = t; document.querySelector('#nickAsk .rankNick button').click(); }, typed);
        await waitFor(() => s.page.evaluate(() => !document.getElementById('nickAsk') || /다른 사람/.test(document.querySelector('#nickAsk .rankNickNote')?.textContent || '')));
      }
      const after = await s.page.evaluate(() => ({ modalAfter: !!document.getElementById('nickAsk'), message: document.querySelector('#nickAsk .rankNickNote')?.textContent || '', nick: localStorage.getItem('manruNick') || '', claimed: localStorage.getItem('manruNickClaimed') || '' }));
      out['stats.ask.' + key] = JSON.stringify({ ...asked, ...after, claims: (posts.claims || []).map((c) => c.claim + '/' + /^[A-Z]{4}\d{2}$/.test(c.owner)) });
      out['stats.ask.' + key + '.errors'] = JSON.stringify(s.errors);
      await s.close();
      await ctx.close();
    }

    // A run in progress is sent as it goes (live), once per change and not again at once; the final record then carries the same id.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const posts = await serve(ctx, {});
      const s = await openSession(browser, root, { seed: 93, context: ctx, init: endpoint });
      await startRun(s, 'swordsman');
      const sent = await s.page.evaluate(() => { const A = __MANRU_QA_STATS__.api; return [A.progress(), A.progress()]; });
      await waitFor(() => posts.length > 0);
      await s.page.evaluate(() => window.__MANRU_V95_TEST__.deathPreview('광견 대장'));
      await waitFor(() => posts.length > 1);
      out['stats.live'] = JSON.stringify({ sent, count: posts.length, live: posts[0].live, cause: [posts[0].cause, posts[1].cause], finalLive: posts[1].live ?? null, sameId: posts[0].id === posts[1].id, cls: posts[0].cls });
      out['stats.live.errors'] = JSON.stringify(s.errors);
      await s.close();
      await ctx.close();
    }

    // Clearing the game is recorded like a death, as floor 25 with the cause "End", and carries the class.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const posts = await serve(ctx, {});
      const s = await openSession(browser, root, { seed: 92, context: ctx, init: endpoint });
      await startRun(s, 'archer');
      await s.page.evaluate(() => window.__MANRU_V95_TEST__.endingPreview());
      await waitFor(() => posts.length > 0);
      out['stats.clear'] = JSON.stringify(posts.map(({ id, ...rest }) => ({ hasId: id.length > 8, ...rest })));
      out['stats.clear.errors'] = JSON.stringify(s.errors);
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
      out[key] = JSON.stringify({ posts: posts.map(({ id, ghost, key, ...rest }) => ({ hasId: id.length > 8, secret: key === undefined ? null : /^[0-9A-Za-z]{32}$/.test(key), ghost: ghost ? (() => { const g = JSON.parse(ghost); return { size: ghost.length < 45000, cls: g.classId, level: g.level, carries: Array.isArray(g.inventory), placeless: g.x === undefined && g.y === undefined }; })() : null, ...rest })), queue: await s.page.evaluate(() => JSON.parse(localStorage.getItem('manruStatsQueue') || '[]').length) });
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
      await s.page.evaluate(() => globalThis.__MANRU_QA_DEBUGBATTLE__.open());
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

  // The grand terrain of ordinary floors: every kind (landscapes, compounds, vault templates) asked for by name on a floor of a region it
  // may appear in must be made, pass the generator's own connectivity checks, leave its middle walkable and be retired from the room list.
  async terrain(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 11 });
    try {
      await startRun(s, 'wanderer');
      const kinds = await s.page.evaluate(() => globalThis.__MANRU_QA_TERRAIN__.kinds());
      const ordinary = [3, 7, 9, 12, 14, 17, 19], regionOf = (f) => Math.floor((f - 1) / 5);
      const made = {}, problems = [];
      for (const kind of kinds) {
        const floors = ordinary.filter((f) => regionOf(f) >= kind.minRegion && regionOf(f) <= kind.maxRegion), floor = floors[0];
        let info = null;
        // some floors place keys and locked gates and refuse a map whose plan does not fit, so a kind is asked for on every floor it may
        // appear on; each try reseeds the generator and the 12% of floors that get no terrain are skipped
        for (let i = 0; i < 14 && !(info && info.kind === kind.id); i++)
          info = await s.page.evaluate(([id, f, seed]) => { window.__reseed(seed); globalThis.__MANRU_QA_TERRAIN__.force(id); window.__MANRU_RELEASE__.regen(f); return globalThis.__MANRU_QA_TERRAIN__.info(); }, [kind.id, floors[i % floors.length], 4000 + i * 977]);
        if (!info || info.kind !== kind.id) problems.push(`${kind.id}: not made on floor ${floor}`);
        else {
          if (!info.retired) problems.push(`${kind.id}: still in the room list`);
          if (!info.centre) problems.push(`${kind.id}: blocked middle`);
          made[kind.id] = { w: info.w, h: info.h, rooms: info.rooms };
        }
      }
      if (problems.length) throw Error('terrain: ' + problems.join('; '));
      out['terrain.kinds'] = JSON.stringify(kinds.map((k) => k.id));
      out['terrain.made'] = JSON.stringify(made);
      out['terrain.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  // Floor 2 chooses among four candidate structures (village, great well, garrison, the old floor) (floor 4 has one: the inn, with a + / X / Y of routes). Run ids are varied until every candidate has been made; each must pass the
  // generator's own checks (for floor 2 the key plan, the encounters and the rewards), and floor 2 must carry its canal entrance.
  async fixedFloors(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 3 });
    try {
      await startRun(s, 'wanderer');
      const seen = { 2: {}, 4: {} }, shortest = {}, problems = [];
      for (let n = 1; n < 80 && (Object.keys(seen[2]).length < 4 || Object.keys(seen[4]).length < 1); n++) {
        for (const floor of [2, 4]) {
          const r = await s.page.evaluate(([floor, n]) => {
            window.__MANRU_QA_UI__.state().runId984 = 'fixed-' + floor + '-' + n;
            try { window.__MANRU_RELEASE__.regen(floor); } catch (e) { return { err: String(e).slice(0, 200) }; }
            const st = window.__MANRU_QA_UI__.state(), a = st.floor2Choice63?.encounterAudit68;
            return { steps: floor === 2 ? globalThis.__MANRU_QA_FLOOR2__.wingSteps() : null, tpl: floor === 2 ? st.floor2Template : st.floor4Template, canal: (st.branchPortals105 || []).some((p) => p.id === 'canal'),
              audit: floor === 2 ? !!a && !a.failures.length && a.packs.every((p) => p.actual >= p.expected) && a.rewards.every((q) => q.actual === q.expected) : true,
              locks: floor === 2 ? st.keyPlan96?.kind : null };
          }, [floor, n]);
          if (r.err) { problems.push(`floor ${floor} run ${n}: ${r.err}`); continue; }
          if (floor === 2 && (!r.canal || !r.audit || r.locks !== 'f2-choice')) problems.push(`floor 2 candidate ${r.tpl}: ${JSON.stringify(r)}`);
          // a region is a chain of rooms: a way through is never a straight run (30 steps) and on average well beyond it (45)
          if (floor === 2 && (r.steps.some((v) => v < 30) || r.steps.reduce((n, v) => n + v, 0) / r.steps.length < 45)) problems.push(`floor 2 candidate ${r.tpl}: a region can be crossed too directly: ${JSON.stringify(r.steps)}`);
          if (floor === 2) shortest[r.tpl] = Math.min(shortest[r.tpl] ?? 999, ...r.steps);
          seen[floor][r.tpl] = (seen[floor][r.tpl] || 0) + 1;
        }
      }
      for (const floor of [2, 4]) if (Object.keys(seen[floor]).length < (floor === 2 ? 4 : 1)) problems.push(`floor ${floor}: only candidates ${Object.keys(seen[floor])} were made`);
      if (problems.length) throw Error('fixedFloors: ' + problems.slice(0, 6).join('; '));
      out['fixedFloors.candidates'] = JSON.stringify({ floor2: Object.keys(seen[2]).sort(), floor4: Object.keys(seen[4]).sort(), shortestWing: shortest });
      out['fixedFloors.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  // The ghost duel, first part: two real pages find each other through a local copy of the relay (mode MANRU_DUEL), get opposite roles and pass
  // payloads both ways; leaving ends it for the other. The turn limit is twenty seconds.
  async duel(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9001, init });
      const b = await openSession(browser, root, { seed: 9002, init });
      await startRun(a, 'wanderer'); await startRun(b, 'swordsman');
      const both = async (ms = 200) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 80) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const D = (s, fn, arg) => s.page.evaluate(fn, arg);
      const stage = (s) => D(s, () => globalThis.__MANRU_QA_DUEL__.api.stage);
      await D(a, () => globalThis.__MANRU_QA_DUEL__.api.find());
      await D(b, () => globalThis.__MANRU_QA_DUEL__.api.find());
      if (!(await until(async () => (await stage(a)) === 'matched' && (await stage(b)) === 'matched'))) throw Error('duel: not matched ' + (await stage(a)) + ' ' + (await stage(b)));
      const info = async (s) => D(s, () => { const d = globalThis.__MANRU_QA_DUEL__.api; return { role: d.role, remote: d.remote, turn: globalThis.__MANRU_QA_DUEL__.turnMsNow(), mode: d.MODE }; });
      const ia = await info(a), ib = await info(b);
      if (ia.role === ib.role || ![ia.role, ib.role].includes('host') || ia.turn !== 20000 || ia.mode !== 'MANRU_DUEL') throw Error('duel: roles ' + JSON.stringify([ia, ib]));
      await D(a, () => globalThis.__MANRU_QA_DUEL__.api.send({ type: 'hello', n: 1 }));
      await D(b, () => globalThis.__MANRU_QA_DUEL__.api.send({ type: 'hello', n: 2 }));
      const got = async (s) => D(s, () => globalThis.__MANRU_QA_DUEL__.api.inbox.length);
      if (!(await until(async () => (await got(a)) > 0 && (await got(b)) > 0))) throw Error('duel: payloads did not arrive');
      const ma = await D(a, () => globalThis.__MANRU_QA_DUEL__.api.take()), mb = await D(b, () => globalThis.__MANRU_QA_DUEL__.api.take());
      if (ma[0].payload.n !== 2 || mb[0].payload.n !== 1 || ma[0].from === ia.role) throw Error('duel: wrong payloads ' + JSON.stringify([ma, mb]));
      await D(a, () => globalThis.__MANRU_QA_DUEL__.api.leave('시험'));
      if (!(await until(async () => (await stage(b)) === 'idle'))) throw Error('duel: the other side was not told ' + (await stage(b)));
      out['duel.match'] = JSON.stringify({ roles: [ia.role, ib.role].sort(), turnMs: ia.turn, mode: ia.mode, relayed: [ma[0].payload, mb[0].payload], ended: true });
      out['duel.errors'] = JSON.stringify([a.errors, b.errors]);
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // The way into the ghost duel: the title button opens a panel that says what is missing (no statistics server in a test build: no ghosts to choose) and closes again.
  async duelpicker(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 3 });
    try {
      await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      await s.page.click('#duelBtn');
      await s.tick(300);
      out['duelpicker.open'] = JSON.stringify(await s.page.evaluate(() => ({ note: document.getElementById('duelNote')?.textContent, ghosts: document.querySelectorAll('#duelGhosts .duelGhost').length, panel: !!document.getElementById('duelScene') })));
      await s.page.click('#duelClose');
      out['duelpicker.closed'] = JSON.stringify(await s.page.evaluate(() => !!document.getElementById('duelScene')));
      // a search with no relay to reach ends with a message instead of waiting for ever; a socket that closes during a search ends it too
      const search = await s.page.evaluate(() => { const D = globalThis.__MANRU_QA_DUEL__.api, first = D.find(true, '{}', 1); return { first, at: D.stage + '|' + D.note }; });
      await s.tick(800);
      search.after = await s.page.evaluate(() => { const D = globalThis.__MANRU_QA_DUEL__.api; return D.stage + '|' + D.pickNote; });
      const closed = await s.page.evaluate(() => { const D = globalThis.__MANRU_QA_DUEL__.api; D.stage = 'queued'; D.socketClosed(); return { stage: D.stage, note: D.pickNote }; });
      // an offer the relay withdraws puts the search back in the queue (and the next offer is taken); a relay that does not know the mode ends the search saying so
      const states = await s.page.evaluate(() => {
        const D = globalThis.__MANRU_QA_DUEL__.api, out = [];
        D.stage = 'offered'; D.matchId = 'm1'; D.receive({ type: 'match.offer-cancelled', matchId: 'm1' }); out.push(D.stage);
        D.receive({ type: 'match.offer', mode: 'MANRU_DUEL', matchId: 'm2', role: 'host', remotePlayerId: 'x' }); out.push(D.stage + ':' + D.matchId);
        D.receive({ type: 'match.queued', mode: 'MANRU_DUEL', position: 3 }); out.push(D.stage + ':' + D.note);
        D.receive({ type: 'session.failed', code: 'INVALID_MODE' }); out.push(D.stage + ':' + D.pickNote);
        return out;
      });
      out['duelpicker.states'] = JSON.stringify(states);
      if (states[0] !== 'queued' || !states[1].startsWith('offered:m2') || !/3번째/.test(states[2]) || !/^idle:.*INVALID_MODE/.test(states[3])) throw Error('duelpicker: states ' + JSON.stringify(states));
      out['duelpicker.search'] = JSON.stringify({ search, closed });
      if (closed.stage !== 'idle') throw Error('duelpicker: a closed socket left the search ' + JSON.stringify(closed));
      out['duelpicker.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    // with a server that has ghosts: a card for each (class, depth, level, the score a win gives), then the confirmation with what is at stake, and the way back
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.route('https://stats.test/**', async (route) => {
      const u = route.request().url(), cors = { 'access-control-allow-origin': '*' };
      let res = { ok: true };
      if (u.includes('view=ghosts&')) res = { ok: true, list: [{ id: 'g1', cls: 'swordsman', floor: 18, level: 21, cause: '광견 대장', status: 'alive' }, { id: 'g2', cls: 'archer', floor: 12, level: 14, cause: '독안개', status: 'alive' }, { id: 'g3', cls: 'summoner', floor: 7, level: 9, cause: '함정', status: 'taken' }, { id: 'g4', cls: 'strongman', floor: 5, level: 6, cause: '함정', status: 'locked' }] };
      if (u.includes('view=ghost&')) res = { ok: true, body: JSON.stringify({ classId: 'swordsman', maxHp: 40, inventory: [{ name: 'a', type: 'potion' }, { name: 'b', type: 'potion' }], weapon: { name: '검', type: 'weapon' } }) };
      return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(res) });
    });
    const t = await openSession(browser, root, { seed: 3, context: ctx, init: `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-stats'?'https://stats.test/exec':d.get.call(this)}})})()` });
    try {
      await t.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      await t.page.click('#duelBtn'); await t.tick(600);
      out['duelpicker.cards'] = JSON.stringify(await t.page.evaluate(() => [...document.querySelectorAll('#duelGhosts .duelGhost')].map((c) => ({ name: c.querySelector('.duelName').textContent, chips: [...c.querySelectorAll('.duelChip b')].map((b) => b.textContent), portrait: !!c.querySelector('canvas.duelPortrait'), locked: c.disabled, view: document.getElementById('duelScene').dataset.view }))));
      // a ghost the server still lists as in a duel is the player's own while the player is here, not in a duel: its card is open like the others
      const lockedCard = await t.page.evaluate(() => { const c = document.querySelector('#duelGhosts .duelGhost[data-ghost="g4"]'); return { found: !!c, disabled: c?.disabled, label: c?.querySelector('.duelEnter')?.textContent }; });
      out['duelpicker.lockedCard'] = JSON.stringify(lockedCard);
      if (!lockedCard.found || lockedCard.disabled || lockedCard.label !== '출전') throw Error('duelpicker: a ghost the server lists as locked is shut away ' + JSON.stringify(lockedCard));
      await t.page.click('.duelGhost'); await t.tick(600);
      out['duelpicker.confirm'] = JSON.stringify(await t.page.evaluate(() => ({ view: document.getElementById('duelScene').dataset.view, chips: [...document.querySelectorAll('.duelConfirmCard .duelChip b')].map((b) => b.textContent), warn: /되돌릴 수 없다/.test(document.querySelector('.duelWarn')?.textContent || ''), buttons: ['duelConfirm', 'duelBack'].map((id) => !!document.getElementById(id)) })));
      await t.page.click('#duelBack'); await t.tick(300);
      out['duelpicker.back'] = JSON.stringify(await t.page.evaluate(() => ({ view: document.getElementById('duelScene').dataset.view, cards: document.querySelectorAll('#duelGhosts .duelGhost').length })));
      // a match made but the fight not yet open (the ghost is being locked on the server): the card stays and says so, then goes when the fight opens
      const wait = await t.page.evaluate(() => {
        const D = globalThis.__MANRU_QA_DUEL__.api, out = [];
        D.stage = 'matched'; D.fighting = false; D.note = '상대와 연결됐다. 망령을 거는 중…'; D.renderPicker();
        out.push([!!document.getElementById('duelScene'), document.getElementById('duelScene')?.dataset.view, document.querySelector('.duelSearch .duelName')?.textContent]);
        D.fighting = true; D.renderPicker(); out.push(!!document.getElementById('duelScene'));
        D.fighting = false; D.stage = 'idle';
        return out;
      });
      out['duelpicker.waiting'] = JSON.stringify(wait);
      if (!wait[0][0] || wait[0][1] !== 'search' || !/거는 중/.test(wait[0][2]) || wait[1]) throw Error('duelpicker: waiting card ' + JSON.stringify(wait));
      out['duelpicker.errors2'] = JSON.stringify(t.errors);
    } finally { await t.close(); await ctx.close(); }
    return out;
  },

  // The ghost duel between two pages, each running its own real game: each page plays its own ghost (its real player) and sees the other as a stand-in on the other
  // start. Turns alternate (a key out of turn does nothing), a step moves the stand-in on the other page, walking into it is an attack whose damage the other page
  // takes as its own player, a potion drunk from the real inventory is seen on the other page as health, and the fall of the stand-in tells the other side it lost.
  async duelfight(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9101, init });
      const b = await openSession(browser, root, { seed: 9102, init });
      for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const both = async (ms = 250) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 120) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const fight = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fight());
      const stand = (f) => f.others.find((m) => m[0] === '상대 망령');
      // each side brings a saved ghost with two potions: a swordsman and an archer
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman', 2)));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 2)));
      if (!(await until(async () => { const [x, y] = [await fight(a), await fight(b)]; return x.duel && y.duel && stand(x) && stand(y); }))) throw Error('duelfight: no fight ' + JSON.stringify([await fight(a), await fight(b)]));
      const host = (await fight(a)).role === 'host' ? a : b, guest = host === a ? b : a;
      const h0 = await fight(host), g0 = await fight(guest);
      out['duelfight.start'] = JSON.stringify({ classes: [(await fight(a)).cls, (await fight(b)).cls], spectators: [h0.spectator, g0.spectator], host: h0.player, hostSees: stand(h0).slice(1, 3), guest: g0.player, guestSees: stand(g0).slice(1, 3) });
      if ((await fight(a)).cls !== 'swordsman' || (await fight(b)).cls !== 'archer') throw Error('duelfight: the ghosts were not the ones brought');
      // a key out of turn does nothing: the host is first
      await guest.page.keyboard.press('ArrowLeft'); await both(300);
      const early = (await fight(guest)).player[0] === g0.player[0];
      // ...but looking around is free out of turn: a finger on the arena (a long press inspects, two fingers zoom, a drag pans) is taken, only acting is refused
      const touch = (s, type, id, x, y) => s.page.evaluate(([type, id, x, y]) => { const el = document.getElementById('runtimeInput81'); el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: id === 1, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0 })); }, [type, id, x, y]);
      const box = await guest.page.evaluate(() => { const r = document.getElementById('runtimeInput81').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      const zoomOf = (x) => x.page.evaluate(() => document.getElementById('zoomVal')?.textContent);
      const zoom0 = await zoomOf(guest), turnNow = (await fight(guest)).myTurn;
      await touch(guest, 'pointerdown', 1, box[0], box[1]); await touch(guest, 'pointerdown', 2, box[0] + 40, box[1]);
      for (let k = 1; k <= 6; k++) { await touch(guest, 'pointermove', 2, box[0] + 40 + k * 25, box[1]); await both(60); }
      await touch(guest, 'pointerup', 2, box[0] + 190, box[1]); await touch(guest, 'pointerup', 1, box[0], box[1]); await both(300);
      const zoom1 = await zoomOf(guest);
      out['duelfight.lookOutOfTurn'] = JSON.stringify({ zoom0, zoom1, myTurn: turnNow });
      if (turnNow) throw Error('duelfight: it was the guest turn, the check means nothing');
      if (zoom0 === zoom1) throw Error('duelfight: a pinch out of turn did nothing ' + [zoom0, zoom1]);
      if ((await fight(guest)).player[0] !== g0.player[0]) throw Error('duelfight: the guest acted out of turn');
      // turns alternate: each steps towards the other until they stand side by side
      const step = async (s, key) => { await s.page.keyboard.press(key); await both(350); };
      for (let i = 0; i < 20; i++) {
        const [x, y] = [(await fight(host)).player[0], (await fight(guest)).player[0]];
        if (y - x <= 1) break;
        await step(host, 'ArrowRight'); await step(guest, 'ArrowLeft');
      }
      const near = await fight(host);
      // the host attacks: walking into the stand-in (a blow can miss, so it tries again, the guest passing its turns)
      const guestBefore = (await fight(guest)).hp, standBefore = stand(near)[3];
      let guestHurt = false, standHurt = false;
      for (let i = 0; i < 10 && !guestHurt; i++) {
        await step(host, 'ArrowRight');
        guestHurt = (await fight(guest)).hp < guestBefore; standHurt = stand(await fight(host))[3] < standBefore;
        if (!guestHurt) { await until(async () => (await fight(guest)).myTurn); await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.wait()); await both(400); }
      }
      // the blow reads like any monster's on the page that takes it: the log line "name → name: damage" (the number over the target and the stand-in's lunge come with it)
      const logSeen = (await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.logLines())).find((l) => /상대 망령 → .*: \d+/.test(l)) || null;
      out['duelfight.hitLine'] = JSON.stringify({ logSeen });
      if (guestHurt && !logSeen) throw Error('duelfight: the blow left no monster-style line on the page that took it');
      // then it is the guest's turn: it drinks a potion from its real inventory, and the host's stand-in is healed
      if (!(await until(async () => (await fight(guest)).myTurn))) throw Error('duelfight: the turn did not come to the guest');
      await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.hurtSelf(4));
      const hpBefore = (await fight(guest)).hp, potionsBefore = await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.potions());
      await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.usePotion()); await both(600);
      const hpAfter = (await fight(guest)).hp, potionsAfter = await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.potions());
      const seenHealed = stand(await fight(host))[3] === hpAfter;
      // what the guest used is shown on the host's page (the common command path sends it once, whatever it was): the name in the log, over the stand-in
      const potionShown = (await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.logLines())).some((l) => /상대 망령: 소회복 비약/.test(l));
      out['duelfight.actShown'] = JSON.stringify({ potionShown });
      if (!potionShown) throw Error('duelfight: the potion the other player drank was not shown on this page');
      out['duelfight.after'] = JSON.stringify({ early, adjacent: near.player[0], guestHurt, standHurt, potion: { healed: hpAfter > hpBefore, count: [potionsBefore[0], potionsAfter[0]], hostSeesIt: seenHealed } });
      // the turn goes by the time spent: a cheap action of the guest (the potion) may leave the turn with it; it passes until the host has it
      for (let i = 0; i < 6 && !(await fight(host)).myTurn; i++) { if ((await fight(guest)).myTurn) await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.wait()); await both(400); }
      // a status put on the stand-in (poison) lands on the real player on the other page
      const poisonBefore = (await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.statusOf())).poison;
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.poisonOpponent()); await both(500);
      const poisonAfter = (await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.statusOf())).poison;
      out['duelfight.status'] = JSON.stringify({ before: poisonBefore, landed: poisonAfter > poisonBefore });
      if (!(poisonAfter > poisonBefore)) throw Error('duelfight: the status did not cross ' + JSON.stringify([await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.turnInfo()), await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.turnInfo())]));
      // a stun put on the stand-in by a weapon (it is set directly, not through applyCombatStatus) lands on the real player too, and the stand-in shows how much of
      // it is left: the count goes down as the real player spends it, not never
      const stunBefore = ((await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.statusAll())).stun || 0);
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.stunStand(2, false)); await both(600);
      const stunTaken = ((await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.statusAll())).stun || 0);
      const stunShown = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.standStun());
      await until(async () => (await fight(guest)).myTurn);
      await guest.page.evaluate(() => globalThis.__MANRU_QA_UI__.dispatch({ type: 'REST' })); await both(700);
      const stunLeft = ((await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.statusAll())).stun || 0);
      const stunShownAfter = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.standStun());
      out['duelfight.stun'] = JSON.stringify({ before: stunBefore, taken: stunTaken, shown: stunShown, left: stunLeft, shownAfter: stunShownAfter });
      if (!(stunTaken > stunBefore)) throw Error('duelfight: the stun did not cross ' + JSON.stringify([stunBefore, stunTaken]));
      if (!(stunLeft < stunTaken) || stunShownAfter !== stunLeft) throw Error('duelfight: the stun count did not go down ' + JSON.stringify([stunTaken, stunLeft, stunShown, stunShownAfter]));
      // a buff the real player drinks (fortitude: DEF +3) is in the stand-in's defence on the other page, where the blows are worked out
      const defBefore = (await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.standStats())).def;
      await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.selfStatus('fortify', 5)); await both(700);
      const defAfter = (await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.standStats())).def;
      out['duelfight.liveStats'] = JSON.stringify({ defBefore, defAfter });
      if (!(defAfter >= defBefore + 3)) throw Error('duelfight: the stand-in kept its starting defence ' + [defBefore, defAfter]);
      // a push on the stand-in (a knock-back, a pulled-in blow) moves the real player too, by the same game function on its own page
      await until(async () => (await fight(host)).myTurn);
      const gx0 = (await fight(guest)).player[0];
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.standAct('forced', 1)); await both(700);
      const gx1 = (await fight(guest)).player[0];
      out['duelfight.push'] = JSON.stringify({ before: gx0, after: gx1 });
      if (gx1 === gx0) throw Error('duelfight: the push did not move the real player ' + [gx0, gx1]);
      // a field the host puts on the map is put on the guest's map too, with the stand-in as its source; the burning it causes is taken on the guest's own map, once
            const fireBefore = (await fight(guest)).hp;
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.castFireOnOpponent()); await both(600);
      const guestFields = await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fieldsInfo());
      if (!guestFields.some((f) => f[0] === 'fire')) throw Error('duelfight: the field did not cross');
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.wait()); await both(500);
      if (!(await until(async () => (await fight(guest)).myTurn))) throw Error('duelfight: the turn did not come to the guest after the field');
      const hpBeforeTurn = (await fight(guest)).hp;
      await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.wait()); await both(600);
      const fireAfter = (await fight(guest)).hp, hostSees = stand(await fight(host))[3];
      out['duelfight.field'] = JSON.stringify({ mirrored: true, source: guestFields.find((f) => f[0] === 'fire')[3], burned: fireAfter < hpBeforeTurn || hpBeforeTurn < fireBefore, standSeesIt: hostSees === fireAfter });
      if (hostSees !== fireAfter) throw Error('duelfight: the stand-in does not show the guest health ' + hostSees + ' ' + fireAfter);
      if (!(await until(async () => (await fight(host)).myTurn))) throw Error('duelfight: the turn did not come back to the host');
      // an element animation the host makes (the one drawing function) is drawn on the guest's page too, at the same cells: the stand-in's cell is the guest's own
      const fxBefore = await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.elementFxCount());
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.elementFxAtStand('ice')); await both(250);
      const fxAfter = await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.elementFxCount()), fxHost = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.elementFxCount());
      out['duelfight.elementFx'] = JSON.stringify({ before: fxBefore, guest: fxAfter, host: fxHost });
      if (!fxAfter.includes('ice') || fxAfter.length !== fxBefore.length + 1) throw Error('duelfight: the element animation did not reach the other page ' + JSON.stringify({ fxBefore, fxAfter }));
      if ((await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.elementFxCount())).length !== fxHost.length) throw Error('duelfight: the animation came back to its maker');
      // the host uses 귀영 (one command, through the common path): the guest's page conceals the stand-in (not seen, not drawn) and shows nothing of where it stands
      const art = await host.page.evaluate(() => { const st = globalThis.__MANRU_QA_UI__.state(); st.player.martial.ghost = 3; st.player.focus = st.player.maxFocus; return globalThis.__MANRU_QA_UI__.dispatch({ type: 'MARTIAL', id: 'ghost' }).status; });
      await both(700);
      const hidden = await guest.page.evaluate(() => ({ ...globalThis.__MANRU_QA_DUEL__.standSeen(), log: globalThis.__MANRU_QA_DUEL__.logLines().filter((l) => /상대 망령/.test(l)).slice(0, 3), floats: globalThis.__MANRU_QA_DUEL__.floatsNow() }));
      out['duelfight.ghostArt'] = JSON.stringify({ art, stealth: hidden.stealth, observable: hidden.observable, told: hidden.log.some((l) => /모습을 감추었다/.test(l)), floatsRevealIt: hidden.floats.some((t) => /귀영/.test(t)) });
      if (art !== 'committed' || !(hidden.stealth > 0) || hidden.observable) throw Error('duelfight: the other page still sees the one who vanished ' + JSON.stringify([art, hidden]));
      if (!hidden.log.some((l) => /모습을 감추었다/.test(l)) || hidden.floats.some((t) => /귀영/.test(t))) throw Error('duelfight: the vanishing was not told, or its place was shown ' + JSON.stringify(hidden));
      for (let i = 0; i < 6 && !(await fight(host)).myTurn; i++) { if ((await fight(guest)).myTurn) await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.wait()); await both(400); }
      // a side that does nothing loses its turn after twenty seconds: the host's turn (after the guest's potion) passes to the guest
      if (!(await until(async () => (await fight(host)).myTurn))) throw Error('duelfight: the turn did not come back to the host');
      // (each page has its own clock: only the host's runs on, or the guest would time out in its turn on the same jump)
      await host.tick(21000); await both(800);
      const timedOut = !(await fight(host)).myTurn && (await fight(guest)).myTurn;
      out['duelfight.turns'] = JSON.stringify({ timeoutPassesTheTurn: timedOut, hud: /차례/.test(await host.page.evaluate(() => document.getElementById('duelHud')?.textContent || '')) });
      // a hit sent out of turn (the host's turn is over) is not taken by the guest
      const forgedBefore = (await fight(guest)).hp;
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.forgeHit(9)); await both(500);
      out['duelfight.forged'] = JSON.stringify({ ignored: (await fight(guest)).hp === forgedBefore });
      if ((await fight(guest)).hp !== forgedBefore) throw Error('duelfight: a hit out of turn was taken');
      // the host brings the stand-in down: the guest is told it lost
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.dropOpponent());
      if (!(await until(async () => (await fight(guest)).outcome === 'lose'))) throw Error('duelfight: the guest was not told ' + JSON.stringify(await fight(guest)));
      out['duelfight.result'] = JSON.stringify({ guest: (await fight(guest)).outcome, host: (await fight(host)).outcome });
      out['duelfight.errors'] = JSON.stringify([a.errors, b.errors]);
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // What a player's action leaves on the map crosses to the other player's map by the same game functions: a tile changed for good, a jar broken (its gas), an item
  // dropped and taken up again.
  async duelmap(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9401, init });
      const b = await openSession(browser, root, { seed: 9402, init });
      for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const both = async (ms = 250) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 120) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const fight = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fight());
      const stand = (f) => f.others.find((m) => m[0] === '상대 망령');
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman', 1)));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 1)));
      if (!(await until(async () => { const [x, y] = [await fight(a), await fight(b)]; return x.duel && y.duel && stand(x) && stand(y); }))) throw Error('duelmap: no fight');
      const host = (await fight(a)).role === 'host' ? a : b, guest = host === a ? b : a;
      const Q = (s, fn, ...args) => s.page.evaluate(([f, ...rest]) => globalThis.__MANRU_QA_DUEL__[f](...rest), [fn, ...args]);
      // the host acts in its turn; the guest answers with a wait so that the turn comes back
      const hostActs = async (work) => {
        if (!(await until(async () => (await fight(host)).myTurn))) throw Error('duelmap: no turn for the host');
        await work(); await both(500);
      };
      const [cx, cy] = await Q(host, 'mapCell');
      // a tile changed for good
      await hostActs(() => Q(host, 'mapAct', 'tile', cx, cy));
      const tile = [(await Q(host, 'mapAt', cx, cy)).tile, (await Q(guest, 'mapAt', cx, cy)).tile];
      out['duelmap.tile'] = JSON.stringify({ same: tile[0] === tile[1], changed: tile[0] !== 1 });
      if (tile[0] !== tile[1] || tile[0] === 1) throw Error('duelmap: the tile did not cross ' + tile);
      // a jar broken: the jar goes and its contents act on both maps
      const [jx, jy] = await Q(host, 'mapCell');
      for (const s of [host, guest]) await Q(s, 'mapPut', jx, jy, 18);
      out['duelmap.pre'] = JSON.stringify(await Q(guest, 'mapAt', jx, jy));
      await hostActs(() => Q(host, 'mapAct', 'jar', jx, jy));
      const jar = [await Q(host, 'mapAt', jx, jy), await Q(guest, 'mapAt', jx, jy)];
      out['duelmap.jar'] = JSON.stringify({ hostTile: jar[0].tile, guestTile: jar[1].tile, sameTile: jar[0].tile === jar[1].tile });
      if (jar[0].tile !== jar[1].tile || jar[1].tile === 18) throw Error('duelmap: the jar did not break on both maps ' + JSON.stringify(jar));
      // an item dropped by the host lies on the guest's map too, and is gone from it when the host takes it up
      const [dx, dy] = await Q(host, 'mapCell');
      await hostActs(() => Q(host, 'mapAct', 'drop', dx, dy));
      const dropped = [(await Q(host, 'mapAt', dx, dy)).items, (await Q(guest, 'mapAt', dx, dy)).items];
      out['duelmap.drop'] = JSON.stringify(dropped);
      if (!dropped[1].includes('시험 약병')) throw Error('duelmap: the item did not cross ' + JSON.stringify(dropped));
      await hostActs(() => Q(host, 'mapAct', 'take', dx, dy));
      const taken = [(await Q(host, 'mapAt', dx, dy)).items, (await Q(guest, 'mapAt', dx, dy)).items];
      out['duelmap.take'] = JSON.stringify(taken);
      if (taken[1].includes('시험 약병')) throw Error('duelmap: the item was left on the other map ' + JSON.stringify(taken));
      // a blow of the host's ally lands inside the turn engine: it is sent (the ally is only on the host's page); a blow with no ally behind it is the engine's own and is not
      const hp0 = await Q(guest, 'hpNow');
      await hostActs(() => Q(host, 'allyHit', false));
      const hp1 = await Q(guest, 'hpNow');
      await hostActs(() => Q(host, 'allyHit', true));
      const hp2 = await Q(guest, 'hpNow');
      out['duelmap.ally'] = JSON.stringify({ engineOwn: hp1 === hp0, allyLanded: hp2 < hp1 });
      if (hp1 !== hp0 || !(hp2 < hp1)) throw Error('duelmap: ally blow ' + [hp0, hp1, hp2]);
      // a summon of the host is only on the host's page: the guest sees a picture of it with its place and health, and a blow on the picture is taken by the summon
      const ally = await Q(host, 'allyAdd'); await both(600);
      await hostActs(() => Q(host, 'wait'));
      const pic = await Q(guest, 'proxyInfo');
      out['duelmap.summon'] = JSON.stringify({ ally, picture: pic && pic.slice(0, 4) });
      if (!pic || pic[0] !== ally[0] || pic[1] !== ally[1]) throw Error('duelmap: no picture of the summon ' + JSON.stringify([ally, pic]));
      if (!(await until(async () => (await fight(guest)).myTurn))) throw Error('duelmap: no turn for the guest');
      await Q(guest, 'hitProxy', 2); await both(600);
      const allyNow = await Q(host, 'allyInfo');
      out['duelmap.summonHit'] = JSON.stringify({ before: ally[2], after: allyNow && allyNow[2] });
      if (!allyNow || !(allyNow[2] < ally[2])) throw Error('duelmap: the blow on the picture did not reach the summon ' + JSON.stringify([ally, allyNow]));
      await Q(guest, 'wait');
      await hostActs(() => Q(host, 'allyKill'));
      await both(800);
      const gone = await Q(guest, 'proxyInfo');
      out['duelmap.summonGone'] = JSON.stringify(gone);
      if (gone) throw Error('duelmap: the picture stayed after the summon fell');
      out['duelmap.errors'] = JSON.stringify([a.errors, b.errors]);
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // After a duel is over (the winner went through the door, the loser fell) the relay match is left on both sides, so that the next duel can be asked for;
  // and a duel run that is replaced by another run ends its match as well.
  async duelend(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9501, init });
      const b = await openSession(browser, root, { seed: 9502, init });
      for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const both = async (ms = 250) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 120) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const fight = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fight());
      const api = (s, f) => s.page.evaluate((f) => globalThis.__MANRU_QA_DUEL__.api[f], f);
      const stand = (f) => f.others.find((m) => m[0] === '상대 망령');
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman', 1)));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 1)));
      if (!(await until(async () => { const [x, y] = [await fight(a), await fight(b)]; return x.duel && y.duel && stand(x) && stand(y); }))) throw Error('duelend: no fight');
      const host = (await fight(a)).role === 'host' ? a : b, guest = host === a ? b : a;
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.dropOpponent());
      await until(async () => (await fight(guest)).outcome === 'lose');
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.exitDoor());
      const left = await until(async () => (await api(host, 'stage')) === 'idle' && (await api(guest, 'stage')) === 'idle', 40);
      out['duelend.stages'] = JSON.stringify({ host: await api(host, 'stage'), guest: await api(guest, 'stage'), left });
      if (!left) throw Error('duelend: the match was not left ' + JSON.stringify(out['duelend.stages']));
      // a new duel can be asked for again
      const again = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 1)));
      out['duelend.again'] = JSON.stringify(again);
      if (!again) throw Error('duelend: a new search was refused');
      out['duelend.errors'] = JSON.stringify([a.errors, b.errors]);
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // The turns go by the time the actions cost: an action that costs three turns lets the other side act three times before this one acts again.
  async duelcost(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9601, init });
      const b = await openSession(browser, root, { seed: 9602, init });
      for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const both = async (ms = 250) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 120) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const fight = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fight());
      const stand = (f) => f.others.find((m) => m[0] === '상대 망령');
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman', 1)));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 1)));
      if (!(await until(async () => { const [x, y] = [await fight(a), await fight(b)]; return x.duel && y.duel && stand(x) && stand(y); }))) throw Error('duelcost: no fight');
      const host = (await fight(a)).role === 'host' ? a : b, guest = host === a ? b : a;
      const mine = async (s) => (await fight(s)).myTurn;
      const wait = async (s) => { await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.wait()); await both(500); };
      // the host starts; it spends three turns on one action
      if (!(await mine(host))) throw Error('duelcost: the host does not start');
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.spend(3)); await both(600);
      const trail = [];
      for (let i = 0; i < 3; i++) { trail.push([await mine(host), await mine(guest)]); if (await mine(guest)) await wait(guest); }
      trail.push([await mine(host), await mine(guest)]);
      out['duelcost.trail'] = JSON.stringify(trail);
      // the guest acted three times (it held the turn each time), then the host has it again
      if (!(trail[0][1] && trail[1][1] && trail[2][1] && trail[3][0] && !trail[3][1])) throw Error('duelcost: ' + JSON.stringify(trail));
      // an even exchange alternates one for one
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.spend(1)); await both(600);
      const alt = [await mine(host), await mine(guest)];
      out['duelcost.alternate'] = JSON.stringify(alt);
      if (alt[0] || !alt[1]) throw Error('duelcost: alternate ' + JSON.stringify(alt));
      out['duelcost.errors'] = JSON.stringify([a.errors, b.errors]);
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // The stakes of the ghost duel (docs/GHOST_STAKES.md) from the client's side, against a stand-in stats server: ghosts are asked for with the secret, both ghosts are
  // locked into the duel before anything is played, a busy ghost stops the duel, the end of the fight is told to the server by each side, and what a won duel brought
  // is in the start chest of the next new run (once).
  async duelstakes(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    const calls = [];
    const server = { lock: 'ok', settle: { 0: 'pending' }, loot: [] };
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':this.name==='manru-stats'?'https://stats.test/exec':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9301, init });
      const b = await openSession(browser, root, { seed: 9302, init });
      const cors = { 'access-control-allow-origin': '*' };
      for (const [name, s] of [['a', a], ['b', b]]) {
        await s.page.context().route('https://stats.test/**', async (route) => {
          const req = route.request();
          if (req.method() !== 'POST') { calls.push({ by: name, get: req.url() }); return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: '{"ok":true,"list":[]}' }); }
          const body = JSON.parse(req.postData());
          calls.push({ by: name, post: body });
          let reply = { ok: true };
          if (body.ghostLock) reply = server.lock === 'ok' ? { ok: true } : { ok: false, error: server.lock };
          if (body.ghostSettle) reply = { ok: true, state: server.settle[body.ghostSettle.won ? 1 : 0] || 'pending' };
          if (body.lootClaim) { reply = { ok: true, items: server.loot }; server.loot = []; }
          return route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(reply) });
        });
      }
      for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const both = async (ms = 250) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 120) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const fight = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fight());
      const stage = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.stage);
      const stand = (f) => f.others.find((m) => m[0] === '상대 망령');

      // a busy ghost: the server refuses the lock and nobody fights
      server.lock = 'busy';
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman', 1), 5, 'A-ghost'));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 1), 6, 'B-ghost'));
      await until(async () => (await stage(a)) === 'idle' && (await stage(b)) === 'idle', 40);
      const refused = { fought: !!((await fight(a)).duel || (await fight(b)).duel), stages: [await stage(a), await stage(b)], locks: calls.filter((c) => c.post?.ghostLock).length };
      out['duelstakes.busy'] = JSON.stringify(refused);
      if (refused.fought || refused.stages.some((x) => x !== 'idle')) throw Error('duelstakes: a busy ghost fought ' + JSON.stringify(refused));

      // both ghosts are one lost duel from death (a low current score under a high death score), so this match is a death match
      for (const x of [a, b]) await x.page.evaluate(() => localStorage.setItem('manru.duelScores', JSON.stringify({ 'A-ghost': { s: 3, peak: 30 }, 'B-ghost': { s: 3, peak: 30 } })));
      // both locked: the fight begins, with one duel id and each side's own ghost and secret
      server.lock = 'ok'; calls.length = 0;
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman', 1), 5, 'A-ghost'));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 1), 6, 'B-ghost'));
      if (!(await until(async () => { const [x, y] = [await fight(a), await fight(b)]; return x.duel && y.duel && stand(x) && stand(y); }))) throw Error('duelstakes: no fight ' + JSON.stringify(calls));
      const locks = calls.filter((c) => c.post?.ghostLock).map((c) => c.post.ghostLock);
      const secrets = new Set(locks.map((l) => l.key));
      out['duelstakes.lock'] = JSON.stringify({ n: locks.length, sameDuel: new Set(locks.map((l) => l.duel)).size === 1, ghosts: locks.map((l) => l.ghost).sort(), keyShape: locks.every((l) => /^[0-9A-Za-z]{32}$/.test(l.key)), ownShapes: locks.every((l) => /^[A-Z]{4}\d{2}$/.test(l.owner)), distinctSecrets: secrets.size });
      if (locks.length !== 2 || new Set(locks.map((l) => l.duel)).size !== 1 || secrets.size !== 2) throw Error('duelstakes: locks ' + JSON.stringify(locks));

      // the host brings the stand-in down: each side tells the server how it ended for it, and asks again while the answer is pending
      const host = (await fight(a)).role === 'host' ? a : b, guest = host === a ? b : a;
      server.settle = { 0: 'pending', 1: 'pending' };
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.dropOpponent());
      if (!(await until(async () => (await fight(guest)).outcome === 'lose'))) throw Error('duelstakes: the guest was not told');
      await both(6000); await both(5000); // the claim waits five seconds (a contradicting word may still come), then asks, and asks again while the answer is pending
      server.settle = { 0: 'lost', 1: 'won' };
      await both(5000); await both(5000);
      const settles = calls.filter((c) => c.post?.ghostSettle).map((c) => [c.by === (host === a ? 'a' : 'b') ? 'host' : 'guest', c.post.ghostSettle.won]);
      out['duelstakes.settle'] = JSON.stringify({ hostWon: settles.some((x) => x[0] === 'host' && x[1] === true), guestLost: settles.some((x) => x[0] === 'guest' && x[1] === false), noOtherWord: settles.every((x) => (x[0] === 'host') === x[1]), askedAgain: settles.length > 2 });
      if (!settles.some((x) => x[0] === 'host' && x[1] === true) || !settles.some((x) => x[0] === 'guest' && x[1] === false) || settles.length <= 2) throw Error('duelstakes: settle ' + JSON.stringify(settles));
      // the loser says where its score ended up too (it fell to its death score: the others can tell it is gone before the server has settled it)
      const scoreCalls = calls.filter((c) => c.post?.ghostScore).map((c) => [c.by === (host === a ? 'a' : 'b') ? 'host' : 'guest', c.post.ghostScore.score, c.post.ghostScore.peak]);
      out['duelstakes.scoreSent'] = JSON.stringify(scoreCalls);
      if (!scoreCalls.some((x) => x[0] === 'guest' && x[1] <= 23 && x[1] >= 0)) throw Error('duelstakes: the loser did not say its score ' + JSON.stringify(scoreCalls));
      out['duelstakes.errors'] = JSON.stringify([a.errors, b.errors]);

      // what the win brought (this device took nothing from a drop, so it is what the server holds) is in the start chest of the next new run, once; the upgrade talisman is not among it
      server.loot = [{ name: '전리품 물약', type: 'potion', count: 1 }, { name: '전리품 투구', type: 'armor', count: 1 }, { name: '강화부적', type: 'talisman', talismanKind: 'upgrade', count: 1 }];
      await host.page.evaluate(() => localStorage.removeItem('manru.duelCarry'));
      calls.length = 0;
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.newRun()); await both(600);
      const chest = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.chestLoot());
      const claims = calls.filter((c) => c.post?.lootClaim).length;
      const lv = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.levelsOf());
      out['duelstakes.level'] = JSON.stringify(lv);
      if (lv.level !== 2 || lv.pending !== '0') throw Error('duelstakes: the ghost put out did not give a level ' + JSON.stringify(lv));
      out['duelstakes.loot'] = JSON.stringify({ inChest: chest?.loot?.map((i) => i.name), claims });
      if (chest?.loot?.map((i) => i.name).join() !== '전리품 물약,전리품 투구' || claims !== 1) throw Error('duelstakes: loot ' + JSON.stringify({ chest, claims }));
      // what was picked up from the drop is what comes, not what the server holds
      server.loot = [{ name: '서버쪽 물건', type: 'potion', count: 1 }];
      await host.page.evaluate(() => localStorage.setItem('manru.duelCarry', JSON.stringify([{ name: '주운 물약', type: 'potion', count: 1 }])));
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.newRun()); await both(600);
      const picked = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.chestLoot());
      out['duelstakes.picked'] = JSON.stringify({ inChest: picked?.loot?.map((i) => i.name) });
      if (picked?.loot?.map((i) => i.name).join() !== '주운 물약') throw Error('duelstakes: the picked-up items did not come ' + JSON.stringify(picked));
      calls.length = 0;
      await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.newRun()); await both(600);
      const again = await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.chestLoot());
      out['duelstakes.once'] = JSON.stringify({ loot: again?.loot ?? null });
      if (again?.loot) throw Error('duelstakes: the winnings came twice');

      // an ordinary match (the loser stays above its death score): nothing is settled, both locks are freed, the loser's ghost lives on with a lower score
      for (const x of [a, b]) await x.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.newRun());
      await both(600);
      calls.length = 0;
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman', 1), 5, 'C-ghost'));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer', 1), 6, 'D-ghost'));
      if (!(await until(async () => { const [x, y] = [await fight(a), await fight(b)]; return x.duel && y.duel && stand(x) && stand(y); }))) throw Error('duelstakes: no second fight ' + JSON.stringify(calls));
      const host2 = (await fight(a)).role === 'host' ? a : b, guest2 = host2 === a ? b : a;
      await host2.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.dropOpponent());
      await until(async () => (await fight(guest2)).outcome === 'lose');
      await both(6000); // the locks are freed after the five-second hold
      const scoresAfter = await Promise.all([host2, guest2].map((x) => x.page.evaluate(() => JSON.parse(localStorage.getItem('manru.duelScores') || '{}'))));
      const freed = calls.filter((c) => c.post?.ghostRelease).length, settled = calls.filter((c) => c.post?.ghostSettle).length;
      out['duelstakes.plain'] = JSON.stringify({ freed, settled, scoresAfter });
      const reported = calls.filter((c) => c.post?.ghostScore).map((c) => c.post.ghostScore);
      out['duelstakes.reported'] = JSON.stringify(reported.map((r) => [r.ghost, r.score, r.peak]).sort());
      if (reported.length < 2 || reported.some((r) => !(r.peak >= r.score))) throw Error('duelstakes: score not reported ' + JSON.stringify(reported));
      if (settled || freed < 2) throw Error('duelstakes: ordinary match ' + JSON.stringify({ freed, settled, calls: calls.filter((c) => c.post?.ghostRelease || c.post?.ghostSettle || c.post?.ghostScore).map((c) => [c.by, Object.keys(c.post)[0], c.post.ghostRelease?.ghost || c.post.ghostSettle?.ghost || c.post.ghostScore?.ghost]) }));
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // The rules of the ghost duel on its map: both ghosts take element damage as a boss does, potions/talismans share a five-turn cooldown and martial arts
  // have their own, the lava talisman is not laid under the other player, the other ghost's fall opens the door, and going through it ends the round with
  // the score; a duel run is never saved or sent to the statistics.
  // A monster that is out of sight, and has marked a cell that is in sight: the mark is drawn (it was drawn only while the monster itself was seen).
  // An enchanted weapon or armor glows in the colour of its element: its picture in the bag, in the worn row and on the floor, its name in the side panel, and the held weapon (through the sprite key). The slot's border does not glow.
  async enchantglow(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 7 });
    try {
      await startRun(s, 'swordsman');
      const r = await s.page.evaluate(() => globalThis.__MANRU_QA_ENCHANT__.probe());
      out['enchantglow.result'] = JSON.stringify(r);
      if (!r.weaponGlow || !r.armorGlow || r.cloakGlow || !r.keyChanged || r.brandSlot || r.plainSlot || !r.iconGlow || r.plainIcon || !r.equipIcon || r.colors[0] !== '#f18a32' || r.colors[1] !== '#42bfdb' || r.colors[2] !== null) throw Error('enchantglow: ' + JSON.stringify(r));
      out['enchantglow.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  async intentoffscreen(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 7 });
    try {
      await startRun(s, 'swordsman');
      const r = await s.page.evaluate(() => globalThis.__MANRU_QA_INTENT__.offscreen());
      out['intentoffscreen.result'] = JSON.stringify(r);
      if (!r.monster || !r.cell) throw Error('intentoffscreen: no monster out of sight on this floor ' + JSON.stringify(r));
      const changed = r.before.some((v, i) => Math.abs(v - r.after[i]) > 8);
      if (r.seen || !changed) throw Error('intentoffscreen: the mark of a monster out of sight was not drawn ' + JSON.stringify(r));
      out['intentoffscreen.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  async duelrules(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 3 });
    try {
      await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.stage(0));
      await s.tick(600);
      const r = await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.rules());
      out['duelrules.result'] = JSON.stringify(r);
      if (r.mulPlayer !== .62 || r.mulOpponent !== .62) throw Error('duelrules: element resistance ' + JSON.stringify(r));
      if (r.coolItem0 || !r.coolItem1 || r.coolItem2 || !r.coolMartial || r.martialAction !== 'cooldown') throw Error('duelrules: cooldown ' + JSON.stringify(r));
      if (r.lava !== 'refused' || r.lavaPlayer !== 'refused' || r.lavaFree !== 'placed') throw Error('duelrules: lava ' + JSON.stringify(r));
      // the upgrade talisman is outside the shared cooldown: while a potion is refused it can still be used
      const upg = await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.coolUpgrade());
      out['duelrules.upgrade'] = JSON.stringify(upg);
      if (!upg.potionRefused || !upg.upgradeAllowed) throw Error('duelrules: upgrade talisman ' + JSON.stringify(upg));
      // the strongman's exhaustion still bars it
      const tired = await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.exhaustUpgrade());
      out['duelrules.exhaust'] = JSON.stringify(tired);
      if (!tired.tiredRefused || !tired.restedNotRefused) throw Error('duelrules: exhaustion ' + JSON.stringify(tired));
      if (!r.doorBefore || r.descendClosed || !r.won || !r.doorAfter || !r.finish || !r.ephemeral) throw Error('duelrules: door ' + JSON.stringify(r));
      // the score arithmetic: starting numbers, the death score rising faster at high scores, small Elo-like steps, death only at or under the death score
      const math = await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.scoreMath());
      out['duelrules.score'] = JSON.stringify(math);
      if (math.start.map((x) => x.s).join() !== '3,7,14' || math.start.map((x) => x.d).join() !== '1,2,6') throw Error('duelrules: start ' + JSON.stringify(math.start));
      const ratio = math.death.map((d, i) => d / [3, 6, 11, 20, 30, 50][i]);
      if (math.death.join() !== '1,1,4,11,23,49') throw Error('duelrules: death ' + math.death);
      if (!(ratio[4] > ratio[2])) throw Error('duelrules: death ratio ' + ratio);
      if (math.win.join() !== '1,2,1' || math.loss.join() !== '3,2,6') throw Error('duelrules: steps ' + JSON.stringify([math.win, math.loss]));
      // both sides' changes together are always below zero (a win pays less than a loss costs), and more so at high scores
      if (math.sums.some((x) => x >= 0) || math.sums[4] >= math.sums[3] || math.sums[7] > math.sums[0]) throw Error('duelrules: sum ' + math.sums);
      if (math.dies.join() !== 'true,true,false' || math.after.s !== 12 || math.after.d !== 4) throw Error('duelrules: dies ' + JSON.stringify([math.dies, math.after]));
      // a blow the other player lands reads like any monster's blow: the number over the target and the "피격 -N" popup, the log line, and the stand-in's lunge
      await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.stage(0)); await s.tick(300);
      const taken = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__, r = Q.takeHit(3); return { ...r, floats: Q.floatsNow(), feed: Q.hitFeedNow(), log: Q.logLines().filter((l) => /상대 망령 → .*: 3/.test(l)).length }; });
      out['duelrules.blow'] = JSON.stringify(taken);
      if (taken.after !== taken.hp - 3 || !taken.floats.includes('-3') || !taken.feed.some((f) => /피격 -3/.test(f)) || !taken.log || !taken.stand) throw Error('duelrules: a blow taken does not read like a monster blow ' + JSON.stringify(taken));
      // the card that ends a duel is on the screen (a win ends no run, so nothing else brings the overlay up) with both ghosts and the new score
      const card = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__, D = Q.api; Q.stageVs(2, 'archer'); D.mineBody = Q.ghostOf('swordsman', 1); D.mineFloor = 9; D.theirFloor = 12; D.mineScore = { s: 11, peak: 11, d: 4 }; D.theirScore = { s: 14, peak: 14, d: 6 }; D.conclude('win'); D.endCard(); const c = document.getElementById('duelEnd'), r = c?.getBoundingClientRect(); return { shown: !!r && r.width > 0 && r.height > 0, sides: c?.querySelectorAll('.deSide').length, fresh: c?.querySelector('.deNew')?.textContent, old: c?.querySelector('.deOld')?.textContent }; });
      out['duelrules.endCard'] = JSON.stringify(card);
      if (!card.shown || card.sides !== 2 || card.old !== '11' || Number(card.fresh) <= 11) throw Error('duelrules: the end card ' + JSON.stringify(card));
      // the ghost that is gone burns away on the card (the loser whose score fell to its death score); a win over a ghost that lives on burns nobody
      const burn = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__, D = Q.api; Q.stageVs(2, 'archer'); D.mineBody = Q.ghostOf('swordsman', 1); D.mineFloor = 9; D.theirFloor = 12; D.mineScore = { s: 5, peak: 30, d: 23 }; D.theirScore = { s: 14, peak: 14, d: 6 }; D.conclude('lose'); D.endCard(); return { gone: D.dies, burning: [...document.querySelectorAll('#duelEnd .deSide.burn')].map((e) => e.classList.contains('me') ? 'me' : 'foe') }; });
      out['duelrules.burn'] = JSON.stringify({ win: card.sides, ...burn });
      if (!burn.gone || burn.burning.join() !== 'me') throw Error('duelrules: the gone ghost does not burn ' + JSON.stringify(burn));
      // the beaten ghost's drop falls where it fell, at once (the upgrade talisman is not in it); what is picked up is carried on, and a winner who goes down after the win keeps the rest
      const loot = await s.page.evaluate(() => {
        const Q = globalThis.__MANRU_QA_DUEL__, D = Q.api; localStorage.removeItem('manru.duelCarry'); Q.stageVs(2, 'archer');
        D.theirs = JSON.parse(Q.ghostOf('swordsman', 2)); D.theirs.inventory.push({ name: '강화부적', type: 'talisman', talismanKind: 'upgrade', count: 1 });
        D.mineScore = { s: 12, peak: 12, d: 3 }; D.theirScore = { s: 3, peak: 30, d: 23 }; D.mineGhostId = 'G-loot'; D.stakes = false; D.lastStand = { x: 20, y: 8 };
        D.conclude('win'); const drops = Q.dropsOnFloor(), dies = D.dies; Q.takeDrop(); Q.killSelf(); D.carryDrops();
        return { dies, names: drops.map((d) => d.name), cells: new Set(drops.map((d) => d.x + ',' + d.y)).size, carried: (Q.carryNow() || []).map((i) => i.name), noFlag: (Q.carryNow() || []).every((i) => !i.duelDrop && i.x === undefined) };
      });
      out['duelrules.loot'] = JSON.stringify(loot);
      if (!loot.dies || loot.names.length < 2 || loot.names.includes('강화부적') || loot.cells !== loot.names.length || loot.carried.length !== loot.names.length || !loot.noFlag) throw Error('duelrules: the drop ' + JSON.stringify(loot));
      // nobody wins when the two sides' words are the same (both won, or both lost), or both went down together; opposite words stand
      const rule = await s.page.evaluate(() => {
        const Q = globalThis.__MANRU_QA_DUEL__, D = Q.api, res = {}, fresh = (id) => { Q.stageVs(2, 'archer'); D.theirs = JSON.parse(Q.ghostOf('swordsman', 1)); D.role = 'host'; D.mineScore = { s: 12, peak: 12, d: 3 }; D.theirScore = { s: 3, peak: 30, d: 23 }; D.mineGhostId = id; D.stakes = false; D.lastStand = { x: 20, y: 8 }; D.reported = false; D.outcome = ''; localStorage.setItem('manru.duelScores', '{}'); };
        fresh('G-a'); D.conclude('win'); D.applyResult({ winner: 'host' }); res.consistentWin = D.outcome; res.savedWin = Q.scoreOfGhost('G-a'); res.keptLoss = (fresh('G-e'), D.mineScore = { s: 12, peak: 12, d: 3 }, D.theirScore = { s: 30, peak: 30, d: 23 }, D.conclude('lose'), Q.scoreOfGhost('G-e'));
        fresh('G-b'); D.conclude('win'); const lootBefore = Q.dropsOnFloor().length; D.applyResult({ winner: 'guest' }); res.bothWon = { outcome: D.outcome, dies: D.dies, dropsAfter: Q.dropsOnFloor().length, lootBefore, score: Q.scoreOfGhost('G-b'), card: document.querySelector('#duelEnd h1')?.textContent };
        fresh('G-c'); D.conclude('lose'); D.applyResult({ winner: 'host' }); res.bothLost = { outcome: D.outcome, dies: D.dies, score: Q.scoreOfGhost('G-c') };
        fresh('G-d'); D.conclude('lose'); D.applyResult({ winner: 'guest' }); res.consistentLoss = D.outcome;
        return res;
      });
      out['duelrules.draw'] = JSON.stringify(rule);
      if (!(rule.savedWin?.s > 12) || !(rule.keptLoss?.s < 12) || rule.consistentWin !== 'win' || rule.consistentLoss !== 'lose' || rule.bothWon.outcome !== 'draw' || rule.bothWon.dies || rule.bothWon.dropsAfter || !rule.bothWon.lootBefore || rule.bothWon.card !== '무승부' || rule.bothLost.outcome !== 'draw' || rule.bothLost.dies || !rule.bothLost.score) throw Error('duelrules: draw ' + JSON.stringify(rule));
      // the blink is there in a duel from the start, two cells at least (a ghost that never beat the gatekeeper has none in its body), and a ghost that learned more keeps it
      const blink = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__, out = {}; for (const level of [0, 2, 3]) out[level] = Q.blinkOfGhost(level); return out; });
      out['duelrules.blink'] = JSON.stringify(blink);
      if (blink[0] !== 2 || blink[2] !== 2 || blink[3] !== 3) throw Error('duelrules: blink ' + JSON.stringify(blink));
      // a ghost whose score fell to its death score is gone (whatever the server still lists); a ghost put out is a level for the next run, given once
      const gone = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__, D = Q.api; localStorage.setItem('manru.duelLevels', '2'); const before = Q.levelsOf(); D.grantLevels(); const after = Q.levelsOf(); D.grantLevels(); return { isGone: [[3, 30], [23, 30], [24, 30], [5, 7], [0, 0]].map(([s, p]) => D.isGone({ score: s, peak: p })), before, after, again: Q.levelsOf() }; });
      out['duelrules.gone'] = JSON.stringify(gone);
      if (gone.isGone.join() !== 'true,true,false,false,false' || gone.after.level !== gone.before.level + 2 || gone.after.points !== gone.before.points + 2 || gone.after.pending !== '0' || gone.again.level !== gone.after.level) throw Error('duelrules: gone/levels ' + JSON.stringify(gone));
      // the job that tells the server how the fight ended survives a reload (the way back from the end card reloads the page), or the ghost stays locked for half an hour
      const job = await s.page.evaluate(() => { const D = globalThis.__MANRU_QA_DUEL__.api; D.setJob({ release: true, match: 'm-1', ghost: 'g-1', until: Date.now() + 60000, busy: false }); const kept = localStorage.getItem('manru.duelPending'); D.settling = null; D.resumed = false; D.resumeJob(); const back = D.settling; D.setJob(null); return { kept: !!kept, back: back && [back.ghost, back.match, back.release], cleared: localStorage.getItem('manru.duelPending') === '' }; });
      out['duelrules.pending'] = JSON.stringify(job);
      if (!job.kept || job.back?.join() !== 'g-1,m-1,true' || !job.cleared) throw Error('duelrules: pending job ' + JSON.stringify(job));
      // the other player's 괴변 is drawn here: its pieces fly at this player (one picture each)
      const flown = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__; Q.stageVs(2, 'archer'); return Q.oddityMirrorNow([{ x: 10, y: 8, tile: 1, mat: 'wood' }, { x: 11, y: 9, tile: 1, mat: 'stone' }]); });
      out['duelrules.oddity'] = JSON.stringify({ flown });
      if (flown !== 2) throw Error('duelrules: the oddity pieces were not drawn ' + flown);
      // drinking a potion starts the shared cooldown (it is started where every action is committed, whatever the item), and a second one is refused while it runs
      const drink = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__; Q.stageWithPotions(3); Q.hurtSelf(6); const before = Q.cooldownNow(), potionsBefore = Q.potions()[0]; Q.usePotion(); const after = Q.cooldownNow(), potionsAfter = Q.potions()[0]; Q.hurtSelf(4); Q.usePotion(); return { before: before.item ?? null, after: after.item ?? null, turn: after.turn, potions: [potionsBefore, potionsAfter, Q.potions()[0]] }; });
      out['duelrules.drinkCooldown'] = JSON.stringify(drink);
      if (!(drink.after > drink.turn - 1) || drink.after === null || drink.potions[1] !== drink.potions[0] - 1 || drink.potions[2] !== drink.potions[1]) throw Error('duelrules: the potion did not start the cooldown ' + JSON.stringify(drink));
      // time presses: no mist at first; the boss arena's mist closes in from the walls as the clock runs (its radius shrinks, outside it hurts), and the turns get shorter (six seconds at least)
      const press = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__; Q.stageVs(2, 'archer'); Q.api.reported = false; return [0, 23, 24, 40, 100].map((c) => Q.cloudProbe(c)); });
      out['duelrules.pressure'] = JSON.stringify(press);
      if (press[0].ring !== 0 || press[0].edge || press[1].ring !== 0 || press[2].ring !== 1 || !press[2].edge || press[2].mid || !(press[3].radius < press[2].radius) || press[0].turnMs !== 20000 || press[3].turnMs >= press[0].turnMs || press[4].turnMs !== 6000 || press[4].radius !== 0 || !press[4].edge) throw Error('duelrules: pressure ' + JSON.stringify(press));
      // standing outside the mist radius at the end of a turn hurts and poisons (the boss arena's own rule, tickBossArenaMist)
      const hurt = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__; Q.stageVs(2, 'archer'); Q.api.reported = false; Q.cloudProbe(100); const hp = Q.fight().hp, before = Q.statusOf().poison; Q.spend(1); return { hp, after: Q.fight().hp, poison: [before, Q.statusOf().poison] }; });
      out['duelrules.mistHurts'] = JSON.stringify(hurt);
      if (!(hurt.after < hurt.hp) || !(hurt.poison[1] > hurt.poison[0])) throw Error('duelrules: the mist did not hurt ' + JSON.stringify(hurt));
      // a duel is fought with everything known: all potions and talismans named, all gear identified
      const known = await s.page.evaluate(() => { const Q = globalThis.__MANRU_QA_DUEL__; Q.stageWithPotions(2); return globalThis.__MANRU_QA_KNOWN__.probe(); });
      out['duelrules.known'] = JSON.stringify(known);
      if (known.potions[0] !== known.potions[1] || known.talismans[0] !== known.talismans[1] || !known.bagIdentified || !known.gear || !known.potions[1]) throw Error('duelrules: not everything is known ' + JSON.stringify(known));
      // the heads-up display: both healths, the turn, and the cooldown pips
      await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.cool('item'));
      await s.tick(300);
      const shown = await s.page.evaluate(() => { const h = document.getElementById('duelHud'); return h && { turn: h.querySelector('.dhTurn b')?.textContent, pips: [...h.querySelectorAll('.dhCool')].map((c) => [c.querySelector('small').textContent, c.querySelectorAll('.dhPips i.on').length, c.querySelector('em').textContent]), sides: h.querySelectorAll('.dhSide').length }; });
      out['duelrules.hud'] = JSON.stringify(shown);
      if (!shown || shown.sides !== 2 || shown.pips[0][1] !== 5 || shown.pips[1][2] !== '준비') throw Error('duelrules: hud ' + JSON.stringify(shown));
      // the other ghost is drawn as the player of its class (not a generic figure)
      const looks = [];
      for (const id of ['archer', 'swordsman']) { await s.page.evaluate((i) => globalThis.__MANRU_QA_DUEL__.stageVs(2, i), id); await s.tick(300); looks.push(await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.lookProbe())); }
      out['duelrules.look'] = JSON.stringify(looks.map((l) => [l.ok, l.cls, l.w, l.h]));
      if (looks.some((l) => !l.ok) || looks[0].cls !== 'archer' || looks[1].cls !== 'swordsman') throw Error('duelrules: look ' + JSON.stringify(looks));
      out['duelrules.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  // A ghost saved from a real run (the character of a game that was played a little, as PlayStats.ghostBody saves it) stands up in a duel on both pages: the other
  // tests use freshly made characters, this one keeps the assumption that what the server holds is a body the duel can use.
  async duelreal(browser, root) {
    const out = {};
    const r = await openSession(browser, root, { seed: 77 });
    let body;
    try {
      await startRun(r, 'swordsman');
      for (let i = 0; i < 12; i++) { await r.page.keyboard.press(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'][i % 4]); await r.tick(300); }
      body = await r.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.myGhost());
    } finally { await r.close(); }
    if (!body || body.length > 45000) throw Error('duelreal: no usable body ' + body?.length);
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((q) => setTimeout(q, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9401, init });
      const b = await openSession(browser, root, { seed: 9402, init });
      for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const both = async (ms = 250) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((q) => setTimeout(q, 40)); };
      const fight = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fight());
      await a.page.evaluate((x) => globalThis.__MANRU_QA_DUEL__.api.find(true, x), body);
      await b.page.evaluate((x) => globalThis.__MANRU_QA_DUEL__.api.find(true, x), body);
      for (let i = 0; i < 80; i++) { const [x, y] = [await fight(a), await fight(b)]; if (x.duel && y.duel && x.others.length && y.others.length) break; await both(); }
      const [x, y] = [await fight(a), await fight(b)];
      if (!(x.duel && y.duel)) throw Error('duelreal: no fight');
      out['duelreal.result'] = JSON.stringify({ classes: [x.cls, y.cls], healthy: [x.hp > 0, y.hp > 0], sees: [x.others.length, y.others.length] });
      out['duelreal.errors'] = JSON.stringify([a.errors, b.errors]);
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // A side that leaves in the middle of a fight loses it: the host that stays wins (the other ghost falls and its door opens), and the guest that stays is told.
  async duelleave(browser, root) {
    const out = {};
    const port = await new Promise((resolve) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); }); });
    const relay = spawn(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'cp32-relay.cjs')], { env: { ...process.env, CP32_RELAY_HOST: '127.0.0.1', CP32_RELAY_PORT: String(port) }, stdio: 'ignore' });
    try {
      for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 100)); }
      const init = `(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMetaElement.prototype,'content');Object.defineProperty(HTMLMetaElement.prototype,'content',{...d,get(){return this.name==='manru-relay'?'ws://127.0.0.1:${port}/online':d.get.call(this)}})})()`;
      const a = await openSession(browser, root, { seed: 9201, init });
      const b = await openSession(browser, root, { seed: 9202, init });
      for (const s of [a, b]) await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const both = async (ms = 200) => { await Promise.all([a.tick(ms), b.tick(ms)]); await new Promise((r) => setTimeout(r, 40)); };
      const until = async (fn, n = 120) => { for (let i = 0; i < n; i++) { if (await fn()) return true; await both(); } return false; };
      const fight = (s) => s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.fight());
      await a.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('swordsman')));
      await b.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.find(true, globalThis.__MANRU_QA_DUEL__.ghostOf('archer')));
      if (!(await until(async () => { const [x, y] = [await fight(a), await fight(b)]; return x.duel && y.duel && x.others.length && y.others.length; }))) throw Error('duelleave: no fight');
      const host = (await fight(a)).role === 'host' ? a : b, guest = host === a ? b : a;
      await guest.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.api.leave('test'));
      if (!(await until(async () => (await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.info())).duel.won))) throw Error('duelleave: the host did not win');
      out['duelleave.result'] = JSON.stringify({ hostWon: (await host.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.info())).duel.won, hostOutcome: (await fight(host)).outcome });
      out['duelleave.errors'] = JSON.stringify([a.errors, b.errors]);
      await a.close(); await b.close();
    } finally { relay.kill(); }
    return out;
  },

  // The floors of the ghost duel are real runs on a small map (duelarenas.js: buildDuelArena): every arena opens on the game's own screen with its name in the
  // top bar, the player on the start the drawing gives, and every kind of tile on it has a name and a description of its own - never the stock text of an
  // unnamed structure (the thing a player sees when a tile was added without one).
  async duelfloor(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 3 });
    try {
      await s.page.evaluate(() => document.getElementById('nickAsk')?.remove());
      const n = await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.arenas());
      for (let i = 0; i < n; i++) {
        await s.page.evaluate((i) => globalThis.__MANRU_QA_DUEL__.stage(i), i);
        await s.tick(600);
        const info = await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.info());
        const tiles = await s.page.evaluate(() => globalThis.__MANRU_QA_DUEL__.describeAll());
        const bad = Object.entries(tiles).filter(([, v]) => !v.name || v.name === '지형' || !v.desc || v.desc.startsWith('만루를 이루는 이름 없는')).map(([t, v]) => t + ':' + v.name);
        if (bad.length) throw Error('duelfloor: ' + info.duel.name + ' has tiles without a description: ' + bad.join(' '));
        out['duelfloor.' + i] = JSON.stringify({ name: info.duel.name, size: [info.cols, info.rows], player: info.player, door: info.duel.door, opponent: info.opponent, floorTxt: info.floorTxt, regionTxt: info.regionTxt, kinds: Object.keys(tiles).length });
      }
      out['duelfloor.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  // The village of floor 2 has a bell in a yard in the middle of the map. Before it is rung the road through the middle is cut by a raised
  // bridge and the stairs cannot be reached from the start; ringing lowers the bridge, wakes the legion commander, who calls escorts (never more
  // than its limit) and walks its patrol.
  async bell(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 3 });
    try {
      await startRun(s, 'wanderer');
      let before = null;
      for (let n = 1; n < 80 && !before; n++) {
        before = await s.page.evaluate((n) => {
          window.__MANRU_QA_UI__.state().runId984 = 'bell-' + n;
          window.__MANRU_RELEASE__.regen(2);
          return window.__MANRU_QA_UI__.state().floor2Template === 0 ? globalThis.__MANRU_QA_BELL__.info() : null;
        }, n);
      }
      if (!before) throw Error('bell: no village was made');
      if (!before.has || before.up !== 2 || before.stairs || before.commanders) throw Error('bell: wrong start ' + JSON.stringify(before));
      await dismissModals(s);
      const rang = await s.page.evaluate(() => { globalThis.__MANRU_QA_BELL__.ring(); return globalThis.__MANRU_QA_BELL__.info(); });
      if (!rang.used || rang.down !== 2 || !rang.stairs || rang.commanders !== 1 || !rang.alerted) throw Error('bell: ringing did not work ' + JSON.stringify(rang));
      const most = await s.page.evaluate(() => globalThis.__MANRU_QA_BELL__.wait(40));
      const after = await s.page.evaluate(() => globalThis.__MANRU_QA_BELL__.info());
      await s.tick(300);
      if (most < 1 || most > 4 || after.commanders !== 1) throw Error('bell: the escort was ' + most + ' ' + JSON.stringify(after));
      const again = await s.page.evaluate(() => { globalThis.__MANRU_QA_BELL__.ring(); return globalThis.__MANRU_QA_BELL__.info(); });
      if (again.commanders !== 1) throw Error('bell: a second ring made another commander ' + JSON.stringify(again));
      out['bell.result'] = JSON.stringify({ before, rang, mostEscorts: most, after: { commanders: after.commanders } });
      out['bell.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  // The first floor has twenty starting places, one chosen at random for each run (the old three rooms at the top of the map, the terraced rock
  // garden, and eighteen drawn places). Every one of them is generated cleanly again and again, holds nothing but the player, has the player start inside
  // it; those with a chest (all but the old one) let the player open it by walking into it (it is the ordinary supply chest).
  async chest(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 3 });
    try {
      await startRun(s, 'wanderer');
      const starts = await s.page.evaluate(() => {
        const res = { made: 0, problems: [], seen: {} };
        for (let n = 1; n <= 400 && Object.keys(res.seen).length < 20; n++) {
          window.__MANRU_QA_UI__.state().runId984 = 'start-' + n;
          try { window.__MANRU_RELEASE__.regen(1); } catch (e) { res.problems.push(n + ':' + String(e).slice(0, 120)); continue; }
          const st = window.__MANRU_QA_UI__.state(), a = st.tutorialEntry60, c = st.tutorialChest, v = st.tutorialVariant;
          res.made++; res.seen[v] = (res.seen[v] || 0) + 1;
          if (!a) { res.problems.push(v + ':missing'); continue; }
          if (v === 0 ? (a.y !== 1 || c) : (!(a.bottom >= st.map.length - 2 && a.x <= 2) || !c)) res.problems.push(v + ':wrong place or chest');
          const inside = st.items.filter((i) => i.x >= a.x && i.x <= a.right && i.y >= a.y && i.y <= a.bottom).length;
          if (inside) res.problems.push(v + ':items inside ' + inside);
          if (st.player.x < a.x || st.player.x > a.right || st.player.y < a.y || st.player.y > a.bottom) res.problems.push(v + ':start outside');
        }
        return res;
      });
      if (starts.problems.length || Object.keys(starts.seen).length !== 20) throw Error('chest: starting places ' + JSON.stringify(starts));
      // the state now holds the last place made; open the chest of one that has it
      await s.page.evaluate(() => { for (let n = 1; n < 60 && !window.__MANRU_QA_UI__.state().tutorialChest; n++) { window.__MANRU_QA_UI__.state().runId984 = 'open-' + n; window.__MANRU_RELEASE__.regen(1); } });
      const opened = await s.page.evaluate(() => globalThis.__MANRU_QA_CHEST__.open());
      if (!opened || !opened.before || !opened.bumped || !opened.opened || !opened.tileIsFloor || opened.items < 1 || opened.items > 2 || opened.again) throw Error('chest: opening ' + JSON.stringify(opened));
      out['chest.starts'] = JSON.stringify({ variants: Object.keys(starts.seen).map(Number).sort((x, y) => x - y) });
      out['chest.opened'] = JSON.stringify({ opened: opened.opened, items: opened.items });
      out['chest.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  // The summoner's martial art 괴변 takes the place of 격투: furniture and structures round her are pulled out of the floor and flung at an enemy.
  // The materials it can pull open with the rank, the material decides the blow, two pieces fly at the fifth rank, and the picture lasts till the hit.
  async oddity(browser, root) {
    const out = {};
    const wanderer = await openSession(browser, root, { seed: 3 });
    try {
      await startRun(wanderer, 'wanderer');
      out['oddity.others'] = JSON.stringify(await wanderer.page.evaluate(() => globalThis.__MANRU_QA_ODDITY__.family()));
    } finally { await wanderer.close(); }
    const s = await openSession(browser, root, { seed: 3 });
    try {
      await startRun(s, 'summoner');
      const ev = (fn, arg) => s.page.evaluate(fn, arg);
      const info = await ev(() => globalThis.__MANRU_QA_ODDITY__.family());
      if (info.family !== 'oddity' || info.name !== '괴변' || info.type !== 'active' || info.bonus !== 0) throw Error('oddity: family ' + JSON.stringify(info));
      const cast = async (opts) => { await ev((o) => globalThis.__MANRU_QA_ODDITY__.setup(o), opts); const r = await ev(() => globalThis.__MANRU_QA_ODDITY__.cast()); await s.tick(300); r.mid = await ev(() => globalThis.__MANRU_QA_ODDITY__.probe()); await s.tick(1500); return Object.assign(r, await ev(() => globalThis.__MANRU_QA_ODDITY__.result())); };
      const res = {};
      res.wood = await cast({ lv: 1, tiles: ['TABLE'] });
      res.stoneLocked = await cast({ lv: 1, tiles: ['STATUE'] });
      res.stone = await cast({ lv: 2, tiles: ['STATUE'] });
      res.lanternLocked = await cast({ lv: 2, tiles: ['LANTERN_POST'] });
      res.lantern = await cast({ lv: 3, tiles: ['LANTERN_POST'] });
      res.treeLocked = await cast({ lv: 3, tiles: ['GARDEN_TREE'] });
      res.tree = await cast({ lv: 4, tiles: ['GARDEN_TREE'] });
      res.anomaly = await cast({ lv: 3, form: 'anomaly', tiles: ['TABLE', 'BENCH', 'CRATE', 'RACK'] });
      res.anomalyFew = await cast({ lv: 5, form: 'anomaly', tiles: ['TABLE', 'BENCH', 'CRATE', 'RACK'] });
      res.psychic = await cast({ lv: 2, form: 'psychic', tiles: ['STATUE'], gap: 3 });
      res.psychicBounce = await cast({ lv: 5, form: 'psychic', tiles: ['STATUE'], gap: 3, neighbor: { dx: -3, dy: 1 } });
      res.bounce = await cast({ lv: 5, tiles: ['TABLE'], neighbor: true });
      res.noBounce = await cast({ lv: 4, tiles: ['TABLE'], neighbor: true });
      res.jar = await cast({ lv: 2, tiles: ['JAR'] });
      res.goldLamp = await cast({ lv: 3, tiles: ['GOLD_LAMP'] });
      res.miscLocked = await cast({ lv: 3, tiles: ['INCENSE_STAND'] });
      res.seal = await cast({ lv: 4, tiles: ['INCENSE_STAND'] });
      res.bleed = await cast({ lv: 4, tiles: ['IRON_HOOK'] });
      res.drunk = await cast({ lv: 4, tiles: ['RUMOR_SILK_DIVAN'] });
      res.far = await cast({ lv: 1, tiles: ['TABLE'], gap: 6 });
      const problems = [];
      if (!res.wood.ok || res.wood.dealt <= 0 || res.wood.spent !== 4) problems.push('wood');
      if (res.stoneLocked.ok || res.stoneLocked.spent !== 0) problems.push('stone before its rank');
      if (!res.stone.ok || res.stone.dealt <= res.wood.dealt) problems.push('stone');
      if (res.lanternLocked.ok) problems.push('lantern before its rank');
      if (!res.lantern.ok || res.lantern.dealt <= 0 || !res.lantern.fire) problems.push('lantern');
      if (res.treeLocked.ok) problems.push('tree before its rank');
      if (!res.tree.ok || res.tree.dealt <= res.stone.dealt) problems.push('tree');
      if (!res.anomaly.ok || res.anomaly.events !== 3 || new Set(res.anomaly.starts).size !== 1 || res.anomaly.dealt <= 0) problems.push('anomaly: three pieces together');
      if (!res.anomalyFew.ok || res.anomalyFew.spent !== 5) problems.push('the fifth rank costs more');
      if (res.wood.spent !== 4) problems.push('the base cost');
      if (!res.psychic.ok || res.psychic.dealt <= 0 || res.psychic.pos.x !== res.psychic.piece.x || res.psychic.pos.y !== res.psychic.piece.y || res.psychic.pieceTiles[0] === 51) problems.push('psychic: the enemy is thrown onto the piece and breaks it');
      if (!res.psychicBounce.ok || res.psychicBounce.neighborDealt <= 0) problems.push('psychic bounce');
      if (!res.bounce.ok || res.bounce.neighborDealt <= 0 || res.bounce.events !== 2) problems.push('bounce at the fifth rank');
      if (res.noBounce.neighborDealt !== 0) problems.push('bounce before the fifth rank');
      if (!res.jar.ok || res.jar.dealt <= 0 || res.jar.jarBreaks !== 1) problems.push('a thrown jar breaks where it lands');
      if (res.wood.jarBreaks !== 0) problems.push('only a jar breaks as a jar');
      if (!res.goldLamp.ok || !res.goldLamp.fire) problems.push('gold lamp');
      if (res.miscLocked.ok) problems.push('other furniture before the fourth rank');
      if (!res.seal.ok || !(res.seal.curse.seal > 0)) problems.push('seal');
      if (!res.bleed.ok || !(res.bleed.curse.bleed > 0)) problems.push('bleed');
      if (!res.drunk.ok || !(res.drunk.curse.drunk > 0)) problems.push('drunk');
      if (res.far.ok) problems.push('an enemy out of the pull was struck');
      for (const k of ['wood', 'stone', 'lantern', 'tree', 'anomaly', 'psychic', 'bounce']) {
        const r = res[k];
        if (r.turnAtCast !== 0 || r.moved || r.dealtAtCast !== 0 || r.mid.turnDelta !== 0 || r.mid.moved || r.mid.dealt !== 0) problems.push('the world moved before the pieces landed ' + k);
        if (r.turnDelta < 1) problems.push('the turn never ended after the impact ' + k);
      }
      for (const k of ['wood', 'stone', 'lantern', 'tree', 'anomaly']) if (!(res[k].flight.every((v) => v >= 780) && res[k].lock >= 700)) problems.push('too quick ' + k);
      if (problems.length) throw Error('oddity: ' + problems.join(', ') + ' ' + JSON.stringify(res));
      await s.tick(2000);
      const pending = await ev(() => globalThis.__MANRU_QA_ODDITY__.pending());
      if (pending !== 0) throw Error('oddity: the picture does not end ' + pending);
      const forms = await ev(() => globalThis.__MANRU_QA_ODDITY__.options());
      if (!['psychic', 'anomaly', 'breakthrough'].every((f) => forms.includes(f))) throw Error('oddity: a manual offers ' + JSON.stringify(forms));
      out['oddity.casts'] = JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, { ok: v.ok, spent: v.spent, dealt: v.dealt, stunned: v.stunned, events: v.events, fire: v.fire }])));
      out['oddity.forms'] = JSON.stringify(forms);
      out['oddity.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
    return out;
  },

  // An automatic walk stops the moment a monster it can see starts a skill (its warning cells appear): the hound boss's charge
  // is armed one player turn before it lands, and a walk that goes on takes the player into the red cells.
  async houndwalk(browser, root) {
    const out = {};
    const s = await openSession(browser, root, { seed: 5 });
    try {
      await startRun(s, 'escort');
      const start = await s.page.evaluate(() => globalThis.__MANRU_QA_HOUNDWALK__());
      // The first-fight tip opens as soon as the boss is seen and cancels any walk on its own: dismiss it and walk on.
      for (let round = 0; round < 4; round++) {
        await s.tick(300); await dismissModals(s);
        start.went = await s.page.evaluate((goal) => globalThis.__MANRU_RUNTIME81__.Automation81.go(goal), start.goal);
        for (let i = 0; i < 40; i++) {
          await s.tick(120);
          if (!(await s.page.evaluate(() => globalThis.__MANRU_RUNTIME81__.Automation81.state().active))) break;
        }
        if ((await s.page.evaluate(() => globalThis.__MANRU_RUNTIME81__.Automation81.state().lastStop)) !== 'manual') break;
      }
      const end = await s.page.evaluate(() => {
        const st = window.__MANRU_QA_UI__.state(), b = globalThis.__MANRU_QA_HOUNDBOSS__;
        return { auto: globalThis.__MANRU_RUNTIME81__.Automation81.state(), hp: st.player.hp, px: st.player.x, intent: b.intent54 ? b.intent54.type : null };
      });
      if (end.auto.lastStop !== 'enemy-skill' || end.hp < start.hp)
        throw Error('houndwalk: the walk did not stop for the charge warning: ' + JSON.stringify({ start, end }));
      out['houndwalk.stop'] = JSON.stringify({ px: end.px, left: end.auto.path, started: start.went, lastStop: end.auto.lastStop, armed: end.intent, hurt: end.hp < start.hp });
      out['houndwalk.errors'] = JSON.stringify(s.errors);
    } finally { await s.close(); }
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
    const accountOf = async (s) => s.page.evaluate(() => Object.keys(localStorage).filter((k) => /^manru/.test(k) && !/active_run|transaction|DebugLog|StatsQueue/.test(k)).sort().map((k) => [k, localStorage.getItem(k)]));
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
    // A new worker taking control while a run is on the screen does not reload the page; with the title on the screen it does.
    out['pwa.updateDuringRun'] = await page.evaluate(async () => {
      window.__stay = 1; navigator.serviceWorker.dispatchEvent(new Event('controllerchange'));
      await new Promise((r) => setTimeout(r, 800));
      return JSON.stringify({ screen: document.body.dataset.manruScreen, stayed: window.__stay === 1 });
    });
    page.evaluate(() => { document.body.dataset.manruScreen = 'title'; document.dispatchEvent(new Event('visibilitychange')); }).catch(() => {});
    await page.waitForTimeout(2500);
    out['pwa.updateAtTitle'] = await page.evaluate(() => JSON.stringify({ reloaded: window.__stay === undefined }));
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
      await d.page.evaluate(() => globalThis.__MANRU_QA_DEBUGBATTLE__.open());
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
