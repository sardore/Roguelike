// Run after npm run build:qa. 병 그림은 아이템의 bottle105 필드로 정해진다(맹독 물약·화룡유가 다른 물약과 같은 그림 시스템을 쓴다).
// 옛 세이브의 아이템(필드 없음)은 불러올 때 갱신되고, 숯불고기의 문구도 새 문구로 바뀐다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleGame, QA_MARKER } from '../tools/lib/game.mjs';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = `globalThis.bt={
 icons:()=>[itemPrototype('맹독 물약'),{...clone(MINE_ITEMS105.oil),count:1},itemPrototype('소회복 비약')].map(i=>{const h=__MANRU_ITEM_ART_R7__.iconHtml(i);return{name:i.name,potion:h.includes('v56PotionIcon'),liquid:(h.match(/--liquid:(#[0-9a-f]+)/i)||[])[1]||null,unknown:h.includes('<b class="mark">?</b>')}}),
 legacy:()=>{const inv=state.player.inventory;inv.length=0;
  const flask={...itemPrototype('맹독 물약'),count:1},oil={...clone(MINE_ITEMS105.oil),count:1},meat={...itemPrototype('숯불고기'),count:1};
  delete flask.bottle105;delete oil.bottle105;meat.desc='옛 설명';meat.ability='옛 능력';inv.push(flask,oil,meat);normalizeItemContainers57();
  const get=n=>state.player.inventory.find(i=>i.name===n);return{flask:get('맹독 물약')?.bottle105,oil:get('화룡유')?.bottle105,meat:[get('숯불고기')?.ability,get('숯불고기')?.desc]}}};`;
const runtime = assembleGame(path.join(repo, 'src')).text.replace(QA_MARKER, fs.readFileSync(path.join(repo, 'src/qa/qa.js'), 'utf8') + '\n' + bridge);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/scripts/10-runtime.js', r => r.fulfill({ contentType: 'text/javascript', body: runtime }));
const s = await openSession(browser, path.join(repo, 'dist-qa'), { context: ctx, seed: 9 });
const errors = []; s.page.on('pageerror', e => errors.push(e.message));
await startRun(s, 'swordsman'); await dismissModals(s); await s.tick(300);
const out = await s.page.evaluate(() => ({ icons: bt.icons(), legacy: bt.legacy() }));
console.log(JSON.stringify(out));
const [flask, oil, potion] = out.icons;
assert.ok(flask.potion && flask.liquid === '#7fae5a' && !flask.unknown, `맹독 물약이 병 그림이 아니다 ${JSON.stringify(flask)}`);
assert.ok(oil.potion && oil.liquid === '#bc7135' && !oil.unknown, `화룡유 병 그림이 바뀌었다 ${JSON.stringify(oil)}`);
assert.ok(potion.potion && potion.unknown, '일반 물약은 미식별 표시가 그대로여야 한다');
assert.equal(out.legacy.flask?.color, '#7fae5a'); assert.equal(out.legacy.oil?.color, '#bc7135');
assert.deepEqual(out.legacy.meat, ['허기 +40 · 화염 저항 Ⅱ 12턴', '검게 탄 숯과 말린 육포를 함께 구운 고기. 허기를 40 채우고 12턴 동안 화염 저항 Ⅱ를 얻는다.']);
assert.deepEqual(errors, []);
await browser.close();
console.log('bottle-art: ok');
process.exit(0);
