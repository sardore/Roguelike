// Deterministic browser harness. Math.random, crypto.randomUUID and the clock are
// fixed from outside the page, so no QA hook has to live in the shipped game code.
import { chromium } from 'playwright-core';
import crypto from 'node:crypto';
import { serve } from './server.mjs';

export const EPOCH = '2026-01-01T00:00:00Z';

export function sha(text) {
  return crypto.createHash('sha1').update(text).digest('hex');
}

function seedScript(seed) {
  let a = seed >>> 0;
  Math.random = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // performance.timeOrigin depends on real navigation timing; tie the monotonic clock to the fake wall clock.
  const origin = Date.parse('2026-01-01T00:00:00Z');
  performance.now = () => Date.now() - origin;
  let u = 0;
  crypto.randomUUID = () => '00000000-0000-4000-8000-' + String(++u).padStart(12, '0');
}

export async function launch() {
  const executablePath = process.env.MANRU_CHROMIUM || undefined;
  return chromium.launch({ executablePath });
}

// root is a source directory, or {dir, entry} for a built page (dist/MANRU.html).
export async function openSession(browser, root, { seed = 1, viewport = { width: 1280, height: 800 }, mobile = false, storage = null, hash = '', query = '', context = null } = {}) {
  const { dir, entry } = typeof root === 'string' ? { dir: root, entry: '' } : root;
  const server = await serve(dir);
  const ctx = context || (await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));
  await page.clock.install({ time: new Date(EPOCH) });
  await page.clock.pauseAt(new Date(Date.parse(EPOCH) + 1000));
  await page.addInitScript(seedScript, seed);
  if (storage) {
    await page.addInitScript((entries) => {
      if (sessionStorage.getItem('__manru_test_seeded')) return;
      sessionStorage.setItem('__manru_test_seeded', '1');
      localStorage.clear();
      for (const [k, v] of entries) localStorage.setItem(k, v);
    }, storage);
  }
  await page.goto(server.url + entry + (query ? '?' + query : '') + (hash ? '#' + hash : ''));
  // Navigation lets a variable amount of fake time pass; re-anchor to a fixed instant.
  await page.clock.pauseAt(new Date(Date.parse(EPOCH) + 5000));
  await page.clock.runFor(1500);
  return {
    page,
    errors,
    async tick(ms = 300) { await page.clock.runFor(ms); },
    url: server.url + entry,
    async close() { if (!context) await ctx.close(); else await page.close(); await server.close(); },
  };
}

export async function dismissModals(s, times = 4) {
  for (let i = 0; i < times; i++) {
    await s.page.keyboard.press('Escape');
    await s.tick(250);
  }
}

export async function startRun(s, classId) {
  await s.page.click('#enterBtn');
  await s.tick(500);
  await s.page.click('#class-choice-' + classId);
  await s.tick(200);
  await s.page.click('#classStartBtn1001');
  await s.tick(3000);
  await dismissModals(s);
}

export async function snapshot(s) {
  return s.page.evaluate(() => {
    const env = window.__MANRU_RELEASE__.snapshot();
    if (!env) return null;
    delete env.savedAt;
    return JSON.stringify(env);
  });
}

export async function storageDump(s) {
  return s.page.evaluate(() => Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]));
}
