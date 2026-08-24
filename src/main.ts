import './style.css';
import { assertGameInvariants, createNewGame, dispatchAction } from './core/game';
import { RunSaveStore } from './core/save';
import type { GameAction, GameState, StoryEvent } from './core/types';
import { itemById } from './content/items';
import { displayItemName } from './core/item-knowledge';
import { describeState, renderCanvas } from './ui/render';

const appElement = document.querySelector<HTMLDivElement>('#app');
if (!appElement) throw new Error('missing #app');
const app = appElement;
const saveStore = new RunSaveStore(localStorage);
let state: GameState | null = null;
let sessionNonce: string | null = null;
let openSheet: 'bag' | 'menu' | null = null;

function titleScreen(note = ''): void {
  state = null;
  sessionNonce = null;
  openSheet = null;
  app.innerHTML = `
    <section class="title-screen">
      <div class="title-card">
        <p class="eyebrow">COLOR ASCII ROGUELIKE</p>
        <h1>Below the<br>Lateral Edge</h1>
        <p class="subtitle">Descend. Drift. Do not go too far sideways.</p>
        ${note ? `<p class="notice">${note}</p>` : ''}
        <label class="seed-field">Seed<input id="seed" autocomplete="off" value="${Math.random().toString(36).slice(2, 10)}" /></label>
        <button class="primary-title-action" id="new-run">New Run</button>
        <button class="secondary-title-action" id="continue" ${saveStore.hasSave() ? '' : 'disabled'}>Continue</button>
        <p class="save-warning">Only Save & Quit creates a resumable save.</p>
      </div>
    </section>`;

  document.querySelector<HTMLButtonElement>('#new-run')?.addEventListener('click', () => {
    const seed = document.querySelector<HTMLInputElement>('#seed')?.value ?? '';
    const created = createNewGame(seed);
    state = created.state;
    sessionNonce = saveStore.beginNewRun(state);
    gameScreen();
    if (created.event) showStory(created.event);
  });

  document.querySelector<HTMLButtonElement>('#continue')?.addEventListener('click', () => {
    const loaded = saveStore.claimCleanSave();
    if (!loaded.ok) {
      const message = loaded.reason === 'dirty'
        ? 'The previous run did not end cleanly.'
        : loaded.reason === 'incompatible'
          ? 'That save belongs to an older build.'
          : `Save could not be loaded (${loaded.reason}).`;
      titleScreen(message);
      return;
    }
    state = loaded.state;
    sessionNonce = loaded.sessionNonce;
    gameScreen();
  });
}

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
        <div class="hp-block" aria-label="health">
          <span id="hp-text"></span>
          <div class="hp-track"><i id="hp-fill"></i></div>
        </div>
        <button class="icon-button" id="menu-button" aria-label="menu">≡</button>
      </header>

      <div class="map-wrap"><canvas id="game-canvas"></canvas></div>

      <button class="message-strip" id="message-button" aria-label="recent messages">
        <span id="message-text"></span>
      </button>

      <footer class="mobile-dock">
        <button class="bag-button" id="bag-button"><span class="bag-glyph">▣</span><span>Bag</span><b id="bag-count">0</b></button>
        <section class="controls" aria-label="movement controls">
          <span></span><button data-move="0,-1" aria-label="move up">▲</button><span></span>
          <button data-move="-1,0" aria-label="move left">◀</button><button class="wait" data-wait aria-label="wait">·</button><button data-move="1,0" aria-label="move right">▶</button>
          <span></span><button data-move="0,1" aria-label="move down">▼</button><span></span>
        </section>
        <div class="dock-spacer" aria-hidden="true"></div>
      </footer>
      <div id="sheet-layer"></div>
    </section>`;

  document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((button) => button.addEventListener('click', () => {
    const [dx, dy] = button.dataset.move!.split(',').map(Number) as [number, number];
    doAction({ type: 'move', dx, dy });
  }));
  document.querySelector<HTMLButtonElement>('[data-wait]')?.addEventListener('click', () => doAction({ type: 'wait' }));
  document.querySelector<HTMLButtonElement>('#bag-button')?.addEventListener('click', () => toggleSheet('bag'));
  document.querySelector<HTMLButtonElement>('#menu-button')?.addEventListener('click', () => toggleSheet('menu'));
  document.querySelector<HTMLButtonElement>('#message-button')?.addEventListener('click', () => toggleSheet('menu'));
  window.addEventListener('resize', redraw, { passive: true });
  redraw();
}

function doAction(action: GameAction): void {
  if (!state || !sessionNonce) return;
  const result = dispatchAction(state, action);
  assertGameInvariants(state);
  saveStore.checkpointDirty(state, sessionNonce);
  redraw();
  if (state.gameOver) {
    saveStore.invalidateRun();
    setTimeout(() => titleScreen('The run ended.'), 650);
    return;
  }
  if (result.event) showStory(result.event);
}

function cleanQuit(): void {
  if (!state || !sessionNonce) return;
  const ok = saveStore.saveAndQuitClean(state, sessionNonce);
  titleScreen(ok ? 'Run saved.' : 'Save failed; the run remains active.');
}

function driftLabel(current: GameState): string {
  if (current.coord.lane === 0) return '';
  const side = current.coord.lane < 0 ? 'west' : 'east';
  return `${side} drift ${Math.abs(current.coord.lane)}`;
}

function inventoryMarkup(current: GameState): string {
  if (!current.player.inventory.length) return '<p class="sheet-empty">Your bag is empty.</p>';
  return current.player.inventory.map((entry) => {
    const def = itemById(entry.defId);
    const name = displayItemName(current, def);
    const equipped = current.player.equippedWeaponId === entry.id || current.player.equippedArmorId === entry.id;
    const verb = def.category === 'weapon' ? 'Ready' : def.category === 'armor' ? 'Wear' : def.category === 'consumable' ? 'Use' : 'Activate';
    return `
      <div class="simple-item-row">
        <button class="item-main" data-item-action="use" data-item-id="${entry.id}">
          <span class="item-glyph" style="color:${def.color}">${def.glyph}</span>
          <span class="item-name"><strong>${name}</strong><small>${equipped ? 'Equipped · ' : ''}${def.category}</small></span>
          <span class="item-verb">${verb}</span>
        </button>
        <button class="item-drop" data-item-action="drop" data-item-id="${entry.id}" aria-label="drop ${name}">×</button>
      </div>`;
  }).join('');
}

function recentMessagesMarkup(current: GameState): string {
  return current.messages.slice().reverse().map((message, index) => `<div class="message-row ${index === 0 ? 'latest' : ''}">${message}</div>`).join('');
}

function toggleSheet(kind: 'bag' | 'menu'): void {
  openSheet = openSheet === kind ? null : kind;
  renderSheet();
}

function closeSheet(): void {
  openSheet = null;
  renderSheet();
}

function renderSheet(): void {
  const layer = document.querySelector<HTMLDivElement>('#sheet-layer');
  if (!layer || !state) return;
  if (!openSheet) {
    layer.innerHTML = '';
    return;
  }

  if (openSheet === 'bag') {
    layer.innerHTML = `
      <div class="sheet-backdrop" data-close-sheet></div>
      <section class="bottom-sheet" aria-label="inventory">
        <div class="sheet-handle"></div>
        <header class="sheet-header"><strong>Bag</strong><span>${state.player.inventory.length}</span><button data-close-sheet>Done</button></header>
        <div class="sheet-scroll">${inventoryMarkup(state)}</div>
      </section>`;
  } else {
    layer.innerHTML = `
      <div class="sheet-backdrop" data-close-sheet></div>
      <section class="bottom-sheet menu-sheet" aria-label="menu">
        <div class="sheet-handle"></div>
        <header class="sheet-header"><strong>Recent</strong><button data-close-sheet>Done</button></header>
        <div class="recent-messages">${recentMessagesMarkup(state)}</div>
        <button class="save-quit-button" id="save-quit">Save & Quit</button>
      </section>`;
  }

  layer.querySelectorAll<HTMLElement>('[data-close-sheet]').forEach((element) => element.addEventListener('click', closeSheet));
  layer.querySelector<HTMLButtonElement>('#save-quit')?.addEventListener('click', cleanQuit);
  layer.querySelector('.sheet-scroll')?.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-item-action]');
    if (!target) return;
    const itemId = target.dataset.itemId;
    if (!itemId) return;
    doAction(target.dataset.itemAction === 'drop' ? { type: 'drop-item', itemId } : { type: 'use-item', itemId });
    if (state?.gameOver) return;
    renderSheet();
  });
}

function redraw(): void {
  if (!state) return;
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  const place = document.querySelector<HTMLElement>('#place');
  const drift = document.querySelector<HTMLElement>('#drift');
  const hpText = document.querySelector<HTMLElement>('#hp-text');
  const hpFill = document.querySelector<HTMLElement>('#hp-fill');
  const messageText = document.querySelector<HTMLElement>('#message-text');
  const bagCount = document.querySelector<HTMLElement>('#bag-count');

  if (canvas) renderCanvas(canvas, state);
  if (place) place.textContent = describeState(state);
  if (drift) drift.textContent = driftLabel(state);
  if (hpText) hpText.textContent = `${state.player.hp}/${state.player.maxHp}`;
  if (hpFill) hpFill.style.width = `${Math.max(0, Math.min(100, state.player.hp / state.player.maxHp * 100))}%`;
  if (messageText) messageText.textContent = state.messages.at(-1) ?? '';
  if (bagCount) bagCount.textContent = `${state.player.inventory.length}`;
  if (openSheet) renderSheet();
}

function showStory(event: StoryEvent): void {
  document.querySelector('.story-modal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'story-modal';
  modal.innerHTML = `<div class="story-card"><p class="eyebrow">EXCEPTIONAL EVENT</p><h2>${event.title}</h2><p>${event.body}</p><button>Continue</button></div>`;
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
  if (event.key.toLowerCase() === 'i') { event.preventDefault(); toggleSheet('bag'); return; }
  if (/^[1-9]$/.test(event.key)) {
    const entry = state.player.inventory[Number(event.key) - 1];
    if (entry) { event.preventDefault(); doAction({ type: 'use-item', itemId: entry.id }); }
  }
});

window.addEventListener('pagehide', () => {
  if (state && sessionNonce) saveStore.checkpointDirty(state, sessionNonce);
});

titleScreen();
