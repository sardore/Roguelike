import assert from 'node:assert/strict';
import path from 'node:path';
import { launch, openSession, startRun, dismissModals } from './harness.mjs';

const browser = await launch();
const root = path.resolve('dist-qa');
async function submit(session, code) {
  await session.page.locator('.giftBox input').fill(code);
  await session.page.locator('.giftBox button').click();
  await session.page.locator('.giftBox button:disabled').waitFor({ state: 'hidden' });
}
async function openRecords(session) {
  await session.page.evaluate(() => __MANRU_QA_STATS__.api.open());
  await session.page.locator('[data-stats-tab="rows"]').click();
}
async function checkRoute(session, level, count, turns, potionMap, talismanMap) {
  const result = await session.page.evaluate(({ level, count, turns, potionMap, talismanMap }) => {
    const state = () => __MANRU_QA_UI__.state();
    const release = __MANRU_RELEASE__, travel = __MANRU_QA_SEALING__.branch;
    const st = state(), p = st.player;
    const up = st.branchPortals105.find(portal => portal.id === 'up');
    if (st.floor !== 9 || st.branchContext105?.id !== 'palace' || st.branchContext105.level !== 2 ||
        !up || Math.max(Math.abs(p.x - up.x), Math.abs(p.y - up.y)) !== 1) throw Error('missing 2F entry landing');
    if (p.level !== level || p.hp !== p.maxHp || p.focus !== p.maxFocus ||
        p.inventory.filter(item => item.potionKind === 'heal_small').reduce((sum, item) => sum + item.count, 0) !== count) throw Error('ghost body lost');
    const checkContinuity = () => {
      const run = state(), map = run.knowledge56.potionMap;
      for (const [kind, appearance] of Object.entries(talismanMap)) {
        if (run.knowledge56.talismanMap[kind] !== appearance) throw Error('talisman map changed for ' + kind);
      }
      if (turns === 1380 && !run.knowledge56.talismanKnown.elem_fire) throw Error('talisman identification lost');
      if (turns === 1380 && !run.knowledge56.potionKnown.focus) throw Error('potion identification lost');
      if (run.turn !== turns) throw Error('turn count changed: ' + run.turn);
      for (const [kind, appearance] of Object.entries(potionMap)) {
        if (map[kind] !== appearance) throw Error('potion map changed for ' + kind);
      }
      for (const item of [...run.player.inventory, ...run.items]) {
        if (item.type === 'potion' && !item.mineItem105 && map[item.potionKind] && (item.appearance56 || map[item.potionKind]) !== map[item.potionKind]) {
          throw Error('bottle colour mismatch for ' + JSON.stringify([run.branchContext105?.level, item.potionKind, item.appearance56, map[item.potionKind]]));
        }
      }
    };
    checkContinuity();
    if (!release.load()) throw Error('recovered run was not saved');
    checkContinuity();
    const transition = destination => {
      const portal = state().branchPortals105.find(candidate => candidate.to === destination);
      if (!portal || !travel(portal)) throw Error('broken route to ' + destination);
      checkContinuity();
      const run = state();
      return run.branchContext105 ? run.branchContext105.id + ':' + run.branchContext105.level : 'main:' + run.floor;
    };
    return [transition('palace:1'), transition('main:9'), transition('palace:1'), transition('palace:2')];
  }, { level, count, turns, potionMap, talismanMap });
  assert.deepEqual(result, ['palace:1', 'main:9', 'palace:1', 'palace:2']);
  assert.deepEqual(session.errors, []);
}
try {
  const local = await openSession(browser, root, { seed: 4249 });
  try {
    await startRun(local, 'wanderer');
    await openRecords(local);
    await submit(local, '19722');
    assert.match(await local.page.locator('.giftNote').textContent(), /이어갈 탐사/);
    await local.page.locator('#statsClose').click();
    const { potionMap, talismanMap } = await local.page.evaluate(() => {
      const run = __MANRU_QA_UI__.state(), p = run.player;
      run.turn = 1380;
      const map = { ...run.knowledge56.potionMap };
      run.knowledge56.talismanKnown.elem_fire = true;
      run.knowledge56.potionKnown.focus = true;
      p.level = 8;
      p.inventory = JSON.parse(__MANRU_QA_DUEL__.ghostOf(p.classId, 3)).inventory;
      p.inventory[0].appearance56 = map.heal_small;
      p.focus = 1;
      if (!__MANRU_QA_DUEL__.killSelf()) throw Error('death fixture failed');
      return { potionMap: map, talismanMap: { ...run.knowledge56.talismanMap } };
    });
    await openRecords(local);
    await submit(local, '19720');
    assert.match(await local.page.locator('.giftNote').textContent(), /알 수 없는 코드/);
    await submit(local, '19722');
    await local.page.evaluate(() => {
      if (!sessionStorage.getItem('manru1004_palace_recovery_raw')) throw Error('checkpoint missing');
      localStorage.removeItem('manru1004_active_run');
      localStorage.removeItem('manru1004_active_run_shadow');
    });
    await local.page.reload();
    await local.page.locator('#continueBtn').click();
    const debug = await local.page.evaluate(() => ({ live: !!__MANRU_QA_UI__.state(), cls:document.querySelector('#continueBtn').className, toast:document.querySelector('#toast').textContent, meta:__MANRU_SAVE1004__.meta() }));
    assert.ok(debug.live, JSON.stringify(debug));
    await checkRoute(local, 8, 3, 1380, potionMap, talismanMap);
  } finally { await local.close(); }

  for (const missingLatest of [false, true]) {
    const legacy = await openSession(browser, root, { seed: 4952 });
    try {
      const ghost = await legacy.page.evaluate(() => {
        const body = JSON.parse(__MANRU_QA_DUEL__.ghostOf('wanderer', 3));
        body.inventory[0].appearance56 = 'azure';
        body.inventory.push({ ...body.inventory[0], count: 2 });
        body.inventory.push({ ...window.MANRU_TALISMANS.find(item => item.talismanKind === 'elem_fire'), appearance56: 'jadepaper', count: 1 });
        body.level = 11;
        const A = __MANRU_QA_STATS__.api;
        A.rememberRun({ id: 'older-death', cause: '함정', turns: 2084 });
        A.rememberRun({ id: 'newest-death', cause: '취객', turns: 2084 });
        A.rememberRun({ id: 'later-clear', cause: 'End' });
        document.querySelector('meta[name="manru-stats"]').content = location.origin + '/ghost-fixture';
        return JSON.stringify(body);
      });
      const requested = [];
      await legacy.page.route('**/ghost-fixture?*', async route => {
        const url = new URL(route.request().url());
        if (url.searchParams.get('view') === 'ghosts') return route.fulfill({ json: { ok: true, list: [{ id: 'older-death', floor: 9, level: 11 }] } });
        if (url.searchParams.get('view') !== 'ghost') return route.fulfill({ json: {} });
        requested.push(url.searchParams.get('id'));
        if (missingLatest && url.searchParams.get('id') === 'newest-death') return route.fulfill({ json: { ok: false, error: 'none' } });
        await route.fulfill({ json: { ok: true, body: ghost } });
      });
      const title = legacy.page.locator('#card h1').first();
      for (let tap = 0; tap < 7; tap++) await title.dispatchEvent('pointerdown', { button: 0 });
      await legacy.page.locator('[data-stats-tab="rows"]').click();
      await submit(legacy, '19722');
      if (missingLatest) {
        assert.match(await legacy.page.locator('.giftNote').textContent(), /확인을 다시 누르면 이전 판/);
        assert.equal(await legacy.page.evaluate(() => __MANRU_QA_UI__.state()), null);
        await legacy.page.locator('.giftBox button').click();
        await legacy.page.locator('.giftBox button:disabled').waitFor({ state: 'hidden' });
      }
      await legacy.page.evaluate(() => {
        const st = __MANRU_QA_UI__.state(), map = st.knowledge56.talismanMap;
        delete st.branchWorld105.recoveryTalismans;
        [map.elem_fire, map.elem_water] = [map.elem_water, map.elem_fire];
        if (!__MANRU_RELEASE__.save().ok) throw Error('could not create pre-update continuation fixture');
      });
      await legacy.page.reload();
      await legacy.page.locator('#continueBtn').click();
      await checkRoute(legacy, 11, 5, 2084, { heal_small: 'azure' }, { elem_fire: 'jadepaper' });
      assert.deepEqual(requested, missingLatest ? ['newest-death', 'older-death'] : ['newest-death']);
    } finally { await legacy.close(); }
  }
  const starter = await openSession(browser, root, { seed: 8301 });
  try {
    await openRecords(starter);
    await submit(starter, '19721');
    const verify = () => starter.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state();
      if (!st) throw Error(document.querySelector('.giftNote')?.textContent || 'starter failed');
      const p = st.player, chest = st.branchTerrain105.palace105.starterChest;
      const up = st.branchPortals105.find(portal => portal.id === 'up');
      const book = p.inventory.find(item => item.summonItem105 === 'book');
      return {
        place: [st.floor, st.branchContext105.id, st.branchContext105.level, Math.max(Math.abs(p.x-up.x), Math.abs(p.y-up.y))],
        player: [p.classId, p.level, st.turn, p.kills, p.skillPoints, p.blinkLevel, p.trinket.name,p.armor.name,p.armor.upgrade],
        stock: Object.fromEntries(['축지부','대지부적','화염부적','수류부적','목령부적','빙폭부적','엽전 엿','보신 전골'].map(name =>
          [name,p.inventory.filter(item => item.name === name).reduce((sum,item) => sum + item.count,0)])),
        book: [book.summonElement105, Object.values(book.summonPictures105).map(pic=>pic.count),
          __MANRU_QA_BROOD__.recipes().map(recipe=>recipe.entry.name).sort()],
        known: [
          MANRU_POTIONS.every(item => st.knowledge56.potionKnown[item.potionKind] === true),
          MANRU_TALISMANS.every(item => st.knowledge56.talismanKnown[item.talismanKind] === true)
        ],
        chest: [chest.x===p.x+p.facing.x && chest.y===p.y+p.facing.y, chest.items.reduce((count,item)=>count+item.count,0),
          chest.items.some(item=>item.type==='food'||(item.type==='talisman'&&item.talismanKind!=='upgrade')),
          __MANRU_QA_ODDITY__.material(st.map[chest.y][chest.x], 1, chest.x, chest.y)?.id]
      };
    });
    const first = await verify();
    assert.deepEqual(first.place, [9,'palace',2,1]);
    assert.deepEqual(first.player, ['summoner',18,20000,430,16,2,'수문지기의 접힌 행낭','강화 가죽 갑옷',1]);
    assert.deepEqual(Object.values(first.stock), [2,2,3,2,1,2,7,4]);
    assert.deepEqual(first.book, ['grass',[1,1],['어미거미','용궁 해련']]);
    assert.deepEqual(first.known,[true,true]);
    assert.ok(first.chest[1]>25);
    assert.deepEqual([first.chest[0],first.chest[2],first.chest[3]],[true,false,'wood']);
    await starter.page.reload();
    const continueButton=starter.page.locator('#continueBtn');
    assert.equal(await continueButton.isEnabled(),true);
    assert.equal(await continueButton.evaluate(button=>button.classList.contains('noSave')),false);
    await continueButton.click();
    assert.deepEqual(await verify(),first);
    const destroyed = await starter.page.evaluate(() => {
      const st = __MANRU_QA_UI__.state(), chest = st.branchTerrain105.palace105.starterChest;
      const before = st.items.length;
      const ok = __MANRU_QA_ODDITY__.detach(chest.x,chest.y);
      return [ok,!!st.branchTerrain105.palace105.starterChest,st.items.length-before];
    });
    assert.deepEqual(destroyed,[true,false,0]);
    assert.equal(await starter.page.evaluate(() => __MANRU_RELEASE__.load()),true);
    await dismissModals(starter);
    await starter.tick(800);
    assert.equal(await starter.page.locator('#bossHud').isVisible(),true);
    assert.match(await starter.page.locator('#bossName').textContent(),/창해군/);
    assert.equal(await starter.page.locator('#contextActionLabel').textContent(),'상자 열기');
    await starter.page.evaluate(() => {
      const {x,y}=__MANRU_QA_UI__.state().branchTerrain105.palace105.starterChest;
      __MANRU_INSPECT984__({x,y});
    });
    assert.equal(await starter.page.locator('#inspectTitle').textContent(),'탐사 보급 상자');
    assert.match(await starter.page.locator('#inspectBody').textContent(),/물품 목록이 열린다/);
    await dismissModals(starter);
    await starter.page.keyboard.press('f');
    const panel = starter.page.locator('#choice991');
    await panel.waitFor({state:'visible'});
    const rows = panel.locator('.choice991Row');
    const potions = await rows.evaluateAll(buttons => {
      const items=__MANRU_QA_UI__.state().branchTerrain105.palace105.starterChest.items;
      return items.flatMap((item,index)=>item.type==='potion'?[[buttons[index].querySelector('.choice991ItemName').textContent,item.name]]:[]);
    });
    assert.ok(potions.length>0);
    for(const [visible,name] of potions)assert.equal(visible,name);
    const confirm = panel.getByRole('button',{name:/받기/});
    assert.equal(await confirm.isDisabled(),true);
    const isScrollable = await panel.locator('#choice991List').evaluate(list=>list.scrollHeight>list.clientHeight);
    assert.equal(isScrollable,true);
    await rows.evaluateAll(buttons=>buttons.slice(0,60).forEach(button=>button.click()));
    await confirm.click();
    assert.match(await panel.locator('output').textContent(),/행낭 공간/);
    await panel.getByRole('button',{name:'닫기'}).click();
    assert.deepEqual(await verify(),first);
    await starter.page.keyboard.press('f');
    await panel.waitFor({state:'visible'});
    const upgradesToClaim = rows.filter({hasText:'강화부적'});
    await upgradesToClaim.evaluateAll(buttons=>buttons.forEach(button=>button.click()));
    await rows.filter({hasNotText:'강화부적'}).first().click();
    const selectedQty = await starter.page.evaluate(() => {
      const st=__MANRU_QA_UI__.state(), chest=st.branchTerrain105.palace105.starterChest;
      const buttons=[...document.querySelectorAll('#choice991List .choice991Row')];
      return chest.items.reduce((n,item,i)=>n+(buttons[i].getAttribute('aria-pressed')==='true'?item.count:0),0);
    });
    await confirm.click();
    await panel.waitFor({state:'hidden'});
    const after=await verify();
    assert.equal(after.chest[1],first.chest[1]-selectedQty);
    assert.equal(after.player[2],20001);
    assert.equal(await starter.page.evaluate(()=>__MANRU_RELEASE__.load()),true);
    assert.deepEqual(await verify(),after);
    const upgrades = await starter.page.evaluate(() => {
      const state = () => __MANRU_QA_UI__.state();
      const count = items => items.filter(item=>item.talismanKind==='upgrade').reduce((n,item)=>n+item.count,0);
      const supplied = count(state().player.inventory);
      for(const dest of ['palace:1','main:9']){
        const portal = state().branchPortals105.find(candidate=>candidate.to===dest);
        if(!__MANRU_QA_SEALING__.branch(portal))throw Error('broken route to '+dest);
      }
      return supplied+count(state().items);
    });
    assert.equal(upgrades,7);
    await starter.page.evaluate(() => {
      localStorage.removeItem('manru1004_active_run');
      localStorage.removeItem('manru1004_active_run_shadow');
    });
    await starter.page.reload();
    assert.match(await continueButton.textContent(),/복구 지점에서 이어가기/);
    await continueButton.click();
    assert.match(await starter.page.locator('#toast').textContent(),/최신 저장본이 없어 20,000턴의 복구 지점/);
    assert.deepEqual(await verify(),first);
    const stored=await starter.page.evaluate(()=>{
      const meta=JSON.parse(__MANRU_SAVE1004__.raw());
      const book=meta.player.inventory.find(item=>item.summonItem105==='book');
      return {portraits:Object.values(book.summonPictures105).some(picture=>picture.portrait),
        catalog:meta.player.summoning105?.prototypes?.some(entry=>entry.def)??false};
    });
    assert.deepEqual(stored,{portraits:false,catalog:false});
    await dismissModals(starter);
    await starter.tick(800);
    assert.equal(await starter.page.evaluate(()=>__MANRU_QA_BROOD__.summon('어미거미')),true);
    assert.deepEqual(starter.errors,[]);
  } finally { await starter.close(); }
  const oldChest=await openSession(browser,root,{seed:1});
  try{
    await oldChest.page.evaluate(()=>{
      let id=100;
      crypto.randomUUID=()=>`00000000-0000-4000-8000-${String(++id).padStart(12,'0')}`;
    });
    await openRecords(oldChest);
    await submit(oldChest,'19721');
    for(const generated of [false,true]){
      await oldChest.page.evaluate(generated=>{
        const st=__MANRU_QA_UI__.state(),chest=st.branchTerrain105.palace105.starterChest;
        if(!st.coreLoot982?.spawned?.upgrade?.[9])throw Error('expected a floor 9 upgrade');
        chest.generatedSupply=generated;
        if(generated)chest.items.find(i=>i.talismanKind==='upgrade'&&!i.coreDrop982).count++;
        if(!__MANRU_RELEASE__.save().ok)throw Error('fixture save failed');
      },generated);
      await oldChest.page.reload();
      await oldChest.page.locator('#continueBtn').click();
      const count=await oldChest.page.evaluate(()=>{
        const chest=__MANRU_QA_UI__.state().branchTerrain105.palace105.starterChest;
        return chest.items.filter(i=>i.talismanKind==='upgrade').reduce((n,i)=>n+i.count,0);
      });
      assert.equal(count,6);
    }
    assert.deepEqual(oldChest.errors,[]);
  }finally{await oldChest.close()}
  console.log('PASS: recovery code, latest local and archived ghosts, save/load, palace 2F ↔ 1F ↔ main 9F');
} finally { await browser.close(); }
