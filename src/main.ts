import './style.css';
import './noncombat.css';
import './fx.css';
import { assertGameInvariants, createNewGame, dispatchAction } from './core/game';
import { RunSaveStore } from './core/save';
import type { GameAction, GameState, Locale, NonCombatSite, SiteServiceKind, StoryEvent } from './core/types';
import { itemById } from './content/items';
import { isMysteryItem } from './core/item-knowledge';
import { describeState, renderCanvas } from './ui/render';
import { siteAt, siteDefinition, servicePrice, sellPrice } from './world/sites';
import { categoryName, itemTooltip, localizeMessage, localizedItemName, localizedStory, serviceName, siteKindName, tr } from './i18n';
import { canCarryDefinition, carryCapacity, encumbranceStage, hungerPercent, hungerStage, inventoryWeight, isRangedWeapon, itemWeight } from './core/foundations';
import { ORIGINS } from './content/origins';
import { SPELLS, spellById, spellDescription, spellName } from './content/spells';
import { PATRONS, patronById } from './content/patrons';
import { featureAt, featureDefinition } from './world/features';
import { isEquipped, sanctityFor, enchantmentFor } from './core/item-state';
import { questLabel } from './core/quests';
import { captureFx, playActionFx } from './ui/fx';

const appElement = document.querySelector<HTMLDivElement>('#app');
if (!appElement) throw new Error('missing #app');
const app = appElement;
const saveStore = new RunSaveStore(localStorage);
const LOCALE_KEY='abyssal-roguelike:locale';
let locale:Locale=localStorage.getItem(LOCALE_KEY)==='ko'?'ko':'en';
let state: GameState | null = null;
let sessionNonce: string | null = null;
let openSheet: 'bag' | 'menu' | 'site' | 'spells' | null = null;
let selectedOrigin='delver';

function toggleLocale():void{
  locale=locale==='en'?'ko':'en';
  localStorage.setItem(LOCALE_KEY,locale);
  if(state)gameScreen();else titleScreen();
}

function titleScreen(note = ''): void {
  state = null;
  sessionNonce = null;
  openSheet = null;
  app.innerHTML = `
    <section class="title-screen">
      <div class="title-card">
        <button class="language-button" id="language-button">${tr(locale,'language')}</button>
        <p class="eyebrow">${tr(locale,'titleEyebrow')}</p>
        <h1>Below the<br>Lateral Edge</h1>
        <p class="subtitle">${tr(locale,'subtitle')}</p>
        ${note ? `<p class="notice">${note}</p>` : ''}
        <label class="seed-field">${tr(locale,'seed')}<input id="seed" autocomplete="off" value="${Math.random().toString(36).slice(2, 10)}" /></label>
        <section class="origin-picker"><div class="origin-heading">${locale==='ko'?'출신':'Origin'}</div><div class="origin-grid">${ORIGINS.map((origin)=>`<button class="origin-chip ${origin.id===selectedOrigin?'selected':''}" data-origin="${origin.id}"><strong>${locale==='ko'?origin.nameKo:origin.name}</strong></button>`).join('')}</div><p id="origin-description" class="origin-description"></p></section>
        <button class="primary-title-action" id="new-run">${tr(locale,'newRun')}</button>
        <button class="secondary-title-action" id="continue" ${saveStore.hasSave() ? '' : 'disabled'}>${tr(locale,'continue')}</button>
        <p class="save-warning">${tr(locale,'saveWarning')}</p>
      </div>
    </section>`;

  document.querySelector<HTMLButtonElement>('#language-button')?.addEventListener('click',toggleLocale);
  const describeOrigin=()=>{const origin=ORIGINS.find((entry)=>entry.id===selectedOrigin)??ORIGINS[0]!;const element=document.querySelector<HTMLElement>('#origin-description');if(element)element.textContent=locale==='ko'?origin.descriptionKo:origin.description;};
  document.querySelectorAll<HTMLButtonElement>('[data-origin]').forEach((button)=>button.addEventListener('click',()=>{selectedOrigin=button.dataset.origin??'delver';document.querySelectorAll('[data-origin]').forEach((entry)=>entry.classList.toggle('selected',(entry as HTMLElement).dataset.origin===selectedOrigin));describeOrigin();}));
  describeOrigin();
  document.querySelector<HTMLButtonElement>('#new-run')?.addEventListener('click', () => {
    const seed = document.querySelector<HTMLInputElement>('#seed')?.value ?? '';
    const created = createNewGame(seed, selectedOrigin);
    state = created.state;
    sessionNonce = saveStore.beginNewRun(state);
    gameScreen();
    if (created.event) showStory(created.event);
  });

  document.querySelector<HTMLButtonElement>('#continue')?.addEventListener('click', () => {
    const loaded = saveStore.claimCleanSave();
    if (!loaded.ok) {
      const message = loaded.reason === 'dirty'
        ? tr(locale,'loadDirty')
        : loaded.reason === 'incompatible'
          ? tr(locale,'loadOld')
          : locale==='ko'?`세이브를 불러올 수 없습니다 (${loaded.reason}).`:`Save could not be loaded (${loaded.reason}).`;
      titleScreen(message);
      return;
    }
    state = loaded.state;
    sessionNonce = loaded.sessionNonce;
    gameScreen();
  });
}

function currentSite(current:GameState):NonCombatSite|undefined{return siteAt(current.sites,current.player.x,current.player.y);}

function gameScreen(): void {
  if (!state) return;
  openSheet = null;
  app.innerHTML = `
    <section class="game-shell">
      <header class="hud">
        <div class="place-block">
          <strong id="place"></strong>
          <span id="drift"></span>
        </div>
        <div class="vitals-block" aria-label="health and hunger">
          <div class="vital-labels"><span id="hp-text"></span><b id="level-text"></b></div>
          <div class="hp-track"><i id="hp-fill"></i></div>
          <div class="hunger-line"><span id="hunger-text"></span><small id="ammo-text"></small></div>
          <div class="hunger-track"><i id="hunger-fill"></i></div>
        </div>
        <button class="icon-button" id="menu-button" aria-label="menu">≡</button>
      </header>

      <div class="map-wrap"><canvas id="game-canvas"></canvas><div class="message-strip" aria-live="polite"><span id="message-text"></span></div><div id="context-slot" class="context-slot context-float"></div></div>

      <footer class="mobile-dock">
        <div class="utility-dock"><button class="bag-button" id="bag-button"><span class="bag-glyph">▣</span><span>${tr(locale,'bag')}</span><b id="bag-count">0</b></button></div>
        <section class="action-pad" aria-label="action controls">
          <button data-command="explore"><strong>◎</strong><small>${tr(locale,'explore')}</small></button>
          <button data-command="search"><strong>⌕</strong><small>${tr(locale,'search')}</small></button>
          <button data-command="rest"><strong>+</strong><small>${tr(locale,'rest')}</small></button>
          <button data-command="fire" id="fire-button"><strong>›</strong><small>${tr(locale,'fire')}</small></button>
          <button id="spell-button"><strong>✦</strong><small>${tr(locale,'spell')}</small></button>
          <button class="brace-action" data-wait><strong>•</strong><small>${tr(locale,'brace')}</small></button>
        </section>
        <section class="controls" aria-label="movement controls">
          <span></span><button data-move="0,-1" aria-label="move up">▲</button><span></span>
          <button data-move="-1,0" aria-label="move left">◀</button><span class="dpad-core">•</span><button data-move="1,0" aria-label="move right">▶</button>
          <span></span><button data-move="0,1" aria-label="move down">▼</button><span></span>
        </section>
      </footer>
      <div id="sheet-layer"></div>
    </section>`;

  document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((button) => button.addEventListener('click', () => {
    const [dx, dy] = button.dataset.move!.split(',').map(Number) as [number, number];
    doAction({ type: 'move', dx, dy });
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-wait]').forEach((button)=>button.addEventListener('click', () => doAction({ type: 'wait' })));
  document.querySelectorAll<HTMLButtonElement>('[data-command]').forEach((button)=>button.addEventListener('click',()=>{const type=button.dataset.command as 'explore'|'search'|'rest'|'fire';doAction({type});}));
  document.querySelector<HTMLButtonElement>('#bag-button')?.addEventListener('click', () => toggleSheet('bag'));
  document.querySelector<HTMLButtonElement>('#menu-button')?.addEventListener('click', () => toggleSheet('menu'));
  document.querySelector<HTMLButtonElement>('#spell-button')?.addEventListener('click', () => toggleSheet('spells'));
  window.onresize=redraw;
  redraw();
}

function doAction(action: GameAction): void {
  if (!state || !sessionNonce) return;
  const beforeFx=captureFx(state);
  const result = dispatchAction(state, action);
  assertGameInvariants(state);
  saveStore.checkpointDirty(state, sessionNonce);
  if(openSheet==='site'&&!currentSite(state))openSheet=null;
  redraw();
  if(result.accepted){const shell=document.querySelector<HTMLElement>('.game-shell');if(shell)playActionFx(shell,action,beforeFx,state);}
  if (state.gameOver) {
    saveStore.invalidateRun();
    setTimeout(() => titleScreen(tr(locale,'runEnded')), 650);
    return;
  }
  if (result.event) showStory(result.event);
}

function cleanQuit(): void {
  if (!state || !sessionNonce) return;
  const ok = saveStore.saveAndQuitClean(state, sessionNonce);
  titleScreen(ok ? tr(locale,'runSaved') : tr(locale,'saveFailed'));
}

function driftLabel(current: GameState): string {
  if (current.coord.lane === 0) return '';
  const side = current.coord.lane < 0 ? (locale==='ko'?'서쪽':'west') : (locale==='ko'?'동쪽':'east');
  return locale==='ko'?`${side} 편류 ${Math.abs(current.coord.lane)}`:`${side} drift ${Math.abs(current.coord.lane)}`;
}

function tooltipMarkup(current:GameState,def:ReturnType<typeof itemById>):string{
  const tip=itemTooltip(current,def,locale);
  return `<div class="item-tooltip" data-tooltip-for="${def.id}">
    <div class="tooltip-title"><span style="color:${def.color}">${def.glyph}</span><strong>${tip.name}</strong><em>${tip.rarity}</em></div>
    <div class="tooltip-meta">${tip.category} · ${tr(locale,'load')} ${itemWeight(def)}${tip.unknown?` · ${tr(locale,'unknown')}`:''}</div>
    <div class="tooltip-section"><b>${tr(locale,'effects')}</b>${tip.effects.map((effect)=>`<span>${effect}</span>`).join('')}</div>
    <div class="tooltip-tags"><b>${tr(locale,'tags')}</b> ${tip.tags.join(' · ')}</div>
  </div>`;
}

function inventoryMarkup(current: GameState): string {
  if (!current.player.inventory.length) return `<p class="sheet-empty">${tr(locale,'emptyBag')}</p>`;
  return current.player.inventory.map((entry) => {
    const def = itemById(entry.defId);
    const name = localizedItemName(current, def,locale);
    const equipped = isEquipped(current,entry.id);const sanctity=sanctityFor(current,entry.id),enchant=enchantmentFor(current,entry.id);
    const verb = def.category === 'weapon' ? tr(locale,'ready') : def.category === 'armor' ? tr(locale,'wear') : def.category === 'consumable' ? tr(locale,'use') : tr(locale,'activate');
    return `
      <div class="simple-item-row">
        <button class="item-main" data-item-action="use" data-item-id="${entry.id}">
          <span class="item-glyph" style="color:${def.color}">${def.glyph}</span>
          <span class="item-name"><strong>${name}${enchant?` ${enchant>0?'+':''}${enchant}`:''}</strong><small>${equipped ? `${tr(locale,'equipped')} · ${sanctity} · ` : ''}${categoryName(def.category,locale)}</small></span>
          <span class="item-verb">${verb}</span>
        </button>
        <button class="item-info" data-item-info="${entry.id}" aria-label="${tr(locale,'itemInfo')}">ⓘ</button>
        <button class="item-drop" data-item-action="drop" data-item-id="${entry.id}" aria-label="${tr(locale,'drop')} ${name}">×</button>
        ${tooltipMarkup(current,def)}
      </div>`;
  }).join('');
}

function recentMessagesMarkup(current: GameState): string {
  return current.messages.slice().reverse().map((message, index) => `<div class="message-row ${index === 0 ? 'latest' : ''}">${localizeMessage(message,locale)}</div>`).join('');
}

function serviceButton(site:NonCombatSite,service:SiteServiceKind,label?:string):string{
  const price=servicePrice(service),used=site.usedServices.includes(service);
  return `<button class="site-action" data-site-service="${service}" ${used?'disabled':''}><span>${label??serviceName(service,locale)}</span><b>${price?`${price}g`:used?'✓':''}</b></button>`;
}

function merchantMarkup(current:GameState,site:NonCombatSite):string{
  const stock=site.stock.length?site.stock.map((offer)=>{const def=itemById(offer.defId);const name=localizedItemName(current,def,locale);return `<div class="trade-row"><span class="trade-glyph" style="color:${def.color}">${def.glyph}</span><span><strong>${name}</strong><small>${categoryName(def.category,locale)} · ${'★'.repeat(def.rarity)}</small></span><button data-site-service="buy" data-offer-id="${offer.id}" ${current.player.gold<offer.price||!canCarryDefinition(current,def)?'disabled':''}>${offer.price}g</button></div>`;}).join(''):`<p class="sheet-empty">${tr(locale,'noStock')}</p>`;
  const sell=current.player.inventory.length?current.player.inventory.map((entry)=>{const def=itemById(entry.defId);return `<div class="trade-row sell"><span class="trade-glyph" style="color:${def.color}">${def.glyph}</span><span><strong>${localizedItemName(current,def,locale)}</strong><small>${tr(locale,'sell')}</small></span><button data-site-service="sell" data-item-id="${entry.id}">+${sellPrice(def.id)}g</button></div>`;}).join(''):`<p class="sheet-empty">${tr(locale,'noItems')}</p>`;
  return `<h3>${tr(locale,'buy')}</h3><div class="trade-list">${stock}</div><h3>${tr(locale,'sell')}</h3><div class="trade-list">${sell}</div>`;
}

function siteMarkup(current:GameState,site:NonCombatSite):string{
  if(site.kind==='merchant'||site.kind==='provisioner')return `${merchantMarkup(current,site)}${site.kind==='provisioner'?serviceButton(site,'meal'):''}`;
  if(site.kind==='appraiser'){
    const candidates=current.player.inventory.filter((entry)=>{const def=itemById(entry.defId);return isMysteryItem(def)&&!current.identifiedItemDefs.includes(def.id);});
    return candidates.length?candidates.map((entry)=>{const def=itemById(entry.defId);return `<div class="trade-row"><span class="trade-glyph" style="color:${def.color}">${def.glyph}</span><span><strong>${localizedItemName(current,def,locale)}</strong><small>${tr(locale,'unknown')}</small></span><button data-site-service="identify" data-item-id="${entry.id}" ${current.player.gold<servicePrice('identify')?'disabled':''}>${servicePrice('identify')}g</button></div>`;}).join(''):`<p class="sheet-empty">${tr(locale,'noItems')}</p>`;
  }
  if(site.kind==='healer')return `${serviceButton(site,'heal')}${serviceButton(site,'cleanse')}`;
  if(site.kind==='cartographer')return serviceButton(site,'map');
  if(site.kind==='shrine'){const patron=current.player.patronId?patronById(current.player.patronId):null;return `${serviceButton(site,'bless')}<h3>${tr(locale,'patron')}</h3>${patron?`<p class="site-copy"><strong style="color:${patron.color}">${locale==='ko'?patron.nameKo:patron.name}</strong> · ${tr(locale,'piety')} ${current.player.piety}</p><button class="site-action" data-site-service="invoke"><span>${tr(locale,'invoke')}</span><b>${patron.invokeCost}</b></button>`:PATRONS.map((entry)=>`<button class="site-action" data-site-service="devote" data-offer-id="${entry.id}"><span style="color:${entry.color}">${locale==='ko'?entry.nameKo:entry.name}</span></button>`).join('')}`;}
  if(site.kind==='camp')return serviceButton(site,'rest');
  if(site.kind==='trainer')return `${serviceButton(site,'train-attack')}${serviceButton(site,'train-defense')}${serviceButton(site,'train-vigor')}`;
  if(site.kind==='inn')return `${serviceButton(site,'inn-rest')}${serviceButton(site,'meal')}`;
  if(site.kind==='guildhall'){const active=current.quests.filter((quest)=>quest.status!=='claimed');return `<h3>${tr(locale,'quests')}</h3>${active.map((quest)=>`<div class="contract-row"><span>${questLabel(quest,locale)}</span>${quest.status==='complete'?`<button data-site-service="claim-contract" data-offer-id="${quest.id}">+${quest.rewardGold}g</button>`:`<b>${quest.rewardGold}g</b>`}</div>`).join('')||'<p class="site-copy">No active contracts.</p>'}<h3>New</h3>${(['hunt','delve','unique'] as const).map((kind)=>`<button class="site-action" data-site-service="contract" data-offer-id="${kind}"><span>${kind}</span></button>`).join('')}`;}
  if(site.kind==='smithy')return `${serviceButton(site,'temper-weapon')}${serviceButton(site,'temper-armor')}${serviceButton(site,'uncurse')}`;
  return serviceButton(site,'rumor');
}

function toggleSheet(kind: 'bag' | 'menu' | 'site' | 'spells'): void {
  if(kind==='site'&&state&&!currentSite(state))return;
  openSheet = openSheet === kind ? null : kind;
  renderSheet();
}

function closeSheet(): void { openSheet = null; renderSheet(); }

function bindItemInfo(layer:HTMLElement):void{
  layer.querySelectorAll<HTMLButtonElement>('[data-item-info]').forEach((button)=>button.addEventListener('click',(event)=>{
    event.stopPropagation();
    const row=button.closest<HTMLElement>('.simple-item-row');
    if(!row)return;
    const was=row.classList.contains('show-tooltip');
    layer.querySelectorAll('.simple-item-row.show-tooltip').forEach((other)=>other.classList.remove('show-tooltip'));
    if(!was)row.classList.add('show-tooltip');
  }));
}

function renderSheet(): void {
  const layer = document.querySelector<HTMLDivElement>('#sheet-layer');
  if (!layer || !state) return;
  if (!openSheet) { layer.innerHTML = ''; return; }

  if (openSheet === 'bag') {
    layer.innerHTML = `
      <div class="sheet-backdrop" data-close-sheet></div>
      <section class="bottom-sheet" aria-label="inventory">
        <div class="sheet-handle"></div>
        <header class="sheet-header"><strong>${tr(locale,'bag')}</strong><span>${state.player.inventory.length} · ${tr(locale,'load')} ${inventoryWeight(state)}/${carryCapacity(state)} · ${state.player.gold}g</span><button data-close-sheet>${tr(locale,'done')}</button></header>
        <div class="sheet-scroll">${inventoryMarkup(state)}</div>
      </section>`;
  } else if(openSheet==='spells'){
    const activeState=state;const known=activeState.player.knownSpells.map(spellById);
    layer.innerHTML=`<div class="sheet-backdrop" data-close-sheet></div><section class="bottom-sheet spell-sheet"><div class="sheet-handle"></div><header class="sheet-header"><strong>✦ ${tr(locale,'spell')}</strong><span>MP ${state.player.mana}/${state.player.maxMana}</span><button data-close-sheet>${tr(locale,'done')}</button></header><div class="spell-list">${known.map((spell)=>`<button class="spell-row" data-spell-id="${spell.id}" ${activeState.player.mana<spell.mana?'disabled':''}><span style="color:${spell.color}">${spell.glyph}</span><strong>${spellName(spell,locale)}</strong><small>${spellDescription(spell,locale)}</small><b>${spell.mana} MP</b></button>`).join('')}</div></section>`;
  } else if(openSheet==='site'){
    const site=currentSite(state);if(!site){openSheet=null;layer.innerHTML='';return;}
    const def=siteDefinition(site.kind),title=site.settlementName?`${site.settlementName} · ${siteKindName(site.kind,locale)}`:siteKindName(site.kind,locale);
    layer.innerHTML=`<div class="sheet-backdrop" data-close-sheet></div><section class="bottom-sheet site-sheet"><div class="sheet-handle"></div><header class="sheet-header"><strong><span style="color:${def.color}">${def.glyph}</span> ${title}</strong><span>${state.player.gold}g</span><button data-close-sheet>${tr(locale,'done')}</button></header><div class="site-scroll">${siteMarkup(state,site)}</div></section>`;
  } else {
    layer.innerHTML = `
      <div class="sheet-backdrop" data-close-sheet></div>
      <section class="bottom-sheet menu-sheet" aria-label="menu">
        <div class="sheet-handle"></div>
        <header class="sheet-header"><strong>${tr(locale,'recent')}</strong><button data-close-sheet>${tr(locale,'done')}</button></header>
        <div class="run-summary">${state.player.patronId?`<span>${tr(locale,'patron')}: ${locale==='ko'?patronById(state.player.patronId).nameKo:patronById(state.player.patronId).name} · ${tr(locale,'piety')} ${state.player.piety}</span>`:''}${state.quests.filter((quest)=>quest.status!=='claimed').map((quest)=>`<span>${questLabel(quest,locale)}</span>`).join('')}</div><div class="recent-messages">${recentMessagesMarkup(state)}</div>
        <button class="language-menu-button" id="language-menu">${tr(locale,'language')}</button>
        <button class="save-quit-button" id="save-quit">${tr(locale,'saveQuit')}</button>
      </section>`;
  }

  layer.querySelectorAll<HTMLElement>('[data-close-sheet]').forEach((element) => element.addEventListener('click', closeSheet));
  layer.querySelector<HTMLButtonElement>('#save-quit')?.addEventListener('click', cleanQuit);
  layer.querySelector<HTMLButtonElement>('#language-menu')?.addEventListener('click',toggleLocale);
  layer.querySelectorAll<HTMLButtonElement>('[data-spell-id]').forEach((button)=>button.addEventListener('click',()=>{const spellId=button.dataset.spellId;if(!spellId)return;closeSheet();doAction({type:'cast-spell',spellId});}));
  bindItemInfo(layer);
  layer.querySelector('.sheet-scroll')?.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-item-action]');
    if (!target) return;
    const itemId = target.dataset.itemId;if (!itemId) return;
    doAction(target.dataset.itemAction === 'drop' ? { type: 'drop-item', itemId } : { type: 'use-item', itemId });
    if (state?.gameOver) return;renderSheet();
  });
  layer.querySelector('.site-scroll')?.addEventListener('click',(event)=>{
    const target=(event.target as HTMLElement).closest<HTMLButtonElement>('button[data-site-service]');if(!target||!state)return;
    const site=currentSite(state);if(!site)return;
    const service=target.dataset.siteService as SiteServiceKind;
    doAction({type:'site-service',siteId:site.id,service,...(target.dataset.itemId?{itemId:target.dataset.itemId}:{}),...(target.dataset.offerId?{offerId:target.dataset.offerId}:{})});
    if(state&&!state.gameOver&&openSheet==='site')renderSheet();
  });
}

function redraw(): void {
  if (!state) return;
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  const place = document.querySelector<HTMLElement>('#place');
  const drift = document.querySelector<HTMLElement>('#drift');
  const hpText = document.querySelector<HTMLElement>('#hp-text');
  const hpFill = document.querySelector<HTMLElement>('#hp-fill');
  const hungerText=document.querySelector<HTMLElement>('#hunger-text');
  const hungerFill=document.querySelector<HTMLElement>('#hunger-fill');
  const levelText=document.querySelector<HTMLElement>('#level-text');
  const ammoText=document.querySelector<HTMLElement>('#ammo-text');
  const fireButton=document.querySelector<HTMLButtonElement>('#fire-button');
  const messageText = document.querySelector<HTMLElement>('#message-text');
  const bagCount = document.querySelector<HTMLElement>('#bag-count');
  const contextSlot=document.querySelector<HTMLElement>('#context-slot');

  if (canvas) renderCanvas(canvas, state);
  if (place) place.textContent = describeState(state,locale);
  if (drift) {const lane=driftLabel(state),burden=encumbranceStage(state);drift.textContent=`${lane?lane+' · ':''}${state.player.gold}g · ${state.player.kills}${locale==='ko'?'처치':' kills'}${burden==='light'?'':` · ${tr(locale,burden)}`}`;}
  if (hpText) hpText.textContent = `HP ${state.player.hp}/${state.player.maxHp}`;
  if (hpFill) hpFill.style.width = `${Math.max(0, Math.min(100, state.player.hp / state.player.maxHp * 100))}%`;
  const hungerKey=hungerStage(state.player.hunger,state.player.maxHunger);
  if(hungerText)hungerText.textContent=`${tr(locale,hungerKey)} ${hungerPercent(state)}%`;
  if(hungerFill)hungerFill.style.width=`${hungerPercent(state)}%`;
  if(levelText)levelText.textContent=`L${state.player.level}`;
  if(ammoText)ammoText.textContent=`MP ${state.player.mana}/${state.player.maxMana} · ${tr(locale,'ammo')} ${state.player.ammo}`;
  if(fireButton){const equippedWeaponId=state.player.equippedWeaponId;const equipped=state.player.inventory.find((entry)=>entry.id===equippedWeaponId);fireButton.disabled=!equipped||!isRangedWeapon(itemById(equipped.defId))||state.player.ammo<=0;}
  if (messageText) messageText.textContent = localizeMessage(state.messages.at(-1) ?? '',locale);
  if (bagCount) bagCount.textContent = `${state.player.inventory.length}`;
  if(contextSlot){const site=currentSite(state),feature=featureAt(state.features,state.player.x,state.player.y);if(site){const def=siteDefinition(site.kind);contextSlot.innerHTML=`<button class="site-dock-button" id="site-button"><span style="color:${def.color}">${def.glyph}</span><small>${siteKindName(site.kind,locale)}</small></button>`;contextSlot.querySelector('#site-button')?.addEventListener('click',()=>toggleSheet('site'));}else if(feature&&featureDefinition(feature.kind).trigger==='interact'){const def=featureDefinition(feature.kind);contextSlot.innerHTML=`<button class="site-dock-button" id="interact-button"><span style="color:${def.color}">${def.glyph}</span><small>${tr(locale,'interact')}</small></button>`;contextSlot.querySelector('#interact-button')?.addEventListener('click',()=>doAction({type:'interact'}));}else contextSlot.innerHTML='';}
  if (openSheet) renderSheet();
}

function showStory(event: StoryEvent): void {
  document.querySelector('.story-modal')?.remove();
  const shown=localizedStory(event,locale);
  const modal = document.createElement('div');
  modal.className = 'story-modal';
  modal.innerHTML = `<div class="story-card"><p class="eyebrow">${tr(locale,'storyEvent')}</p><h2>${shown.title}</h2><p>${shown.body}</p><button>${tr(locale,'continue')}</button></div>`;
  modal.querySelector('button')?.addEventListener('click', () => modal.remove());
  document.body.appendChild(modal);
}

window.addEventListener('keydown', (event) => {
  if (!state) return;
  if (event.key === 'Escape' && openSheet) { event.preventDefault(); closeSheet(); return; }
  const movement: Record<string, [number, number]> = {
    ArrowUp: [0, -1], w: [0, -1], W: [0, -1], k: [0, -1],
    ArrowDown: [0, 1], s: [0, 1], S: [0, 1], j: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], h: [-1, 0],
    ArrowRight: [1, 0], d: [1, 0], D: [1, 0], l: [1, 0],
  };
  const delta = movement[event.key];
  if (delta) { event.preventDefault(); doAction({ type: 'move', dx: delta[0], dy: delta[1] }); return; }
  if (event.key === '.' || event.key === ' ') { event.preventDefault(); doAction({ type: 'wait' }); return; }
  if(event.key==='f'||event.key==='F'){event.preventDefault();doAction({type:'fire'});return;}
  if(event.key==='x'||event.key==='X'){event.preventDefault();doAction({type:'explore'});return;}
  if(event.key==='r'||event.key==='R'){event.preventDefault();doAction({type:'rest'});return;}
  if(event.key==='/'){event.preventDefault();doAction({type:'search'});return;}
  if (event.key.toLowerCase() === 'i') { event.preventDefault(); toggleSheet('bag'); return; }
  if (event.key.toLowerCase() === 'e'&&currentSite(state)){event.preventDefault();toggleSheet('site');return;}
  if (/^[1-9]$/.test(event.key)) {
    const entry = state.player.inventory[Number(event.key) - 1];
    if (entry) { event.preventDefault(); doAction({ type: 'use-item', itemId: entry.id }); }
  }
});

window.addEventListener('pagehide', () => {
  if (state && sessionNonce) saveStore.checkpointDirty(state, sessionNonce);
});

titleScreen();
