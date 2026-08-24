import fs from 'node:fs';
function patch(path,fn){const before=fs.readFileSync(path,'utf8');const after=fn(before);if(after===before)throw new Error(`no changes ${path}`);fs.writeFileSync(path,after);}
function once(s,a,b,label){if(s.includes(b))return s;if(!s.includes(a))throw new Error(`missing ${label}`);return s.replace(a,b);}

patch('src/main.ts',(s)=>{
  s=once(s,"import { categoryName, itemTooltip, localizeMessage, localizedItemName, localizedStory, serviceName, siteKindName, tr } from './i18n';","import { categoryName, itemTooltip, localizeMessage, localizedItemName, localizedStory, serviceName, siteKindName, tr } from './i18n';\nimport { hungerPercent, hungerStage, isRangedWeapon } from './core/foundations';",'foundation ui import');
  s=once(s,`        <div class="hp-block" aria-label="health">
          <span id="hp-text"></span>
          <div class="hp-track"><i id="hp-fill"></i></div>
        </div>
        <button class="icon-button" id="menu-button" aria-label="menu">≡</button>`,`        <div class="vitals-block" aria-label="health and hunger">
          <div class="vital-labels"><span id="hp-text"></span><b id="level-text"></b></div>
          <div class="hp-track"><i id="hp-fill"></i></div>
          <div class="hunger-line"><span id="hunger-text"></span><small id="ammo-text"></small></div>
          <div class="hunger-track"><i id="hunger-fill"></i></div>
        </div>
        <button class="icon-button" id="menu-button" aria-label="menu">≡</button>`,'vitals hud');
  s=once(s,`      <footer class="mobile-dock">
        <button class="bag-button" id="bag-button"><span class="bag-glyph">▣</span><span>${tr(locale,'bag')}</span><b id="bag-count">0</b></button>
        <section class="controls" aria-label="movement controls">
          <span></span><button data-move="0,-1" aria-label="move up">▲</button><span></span>
          <button data-move="-1,0" aria-label="move left">◀</button><button class="wait" data-wait aria-label="wait">·</button><button data-move="1,0" aria-label="move right">▶</button>
          <span></span><button data-move="0,1" aria-label="move down">▼</button><span></span>
        </section>
        <div id="context-slot" class="context-slot"></div>
      </footer>`,`      <footer class="mobile-dock">
        <div class="utility-dock"><button class="bag-button" id="bag-button"><span class="bag-glyph">▣</span><span>${tr(locale,'bag')}</span><b id="bag-count">0</b></button></div>
        <section class="action-pad" aria-label="action controls">
          <button data-command="explore"><strong>◎</strong><small>${tr(locale,'explore')}</small></button>
          <button data-command="search"><strong>⌕</strong><small>${tr(locale,'search')}</small></button>
          <button data-command="rest"><strong>+</strong><small>${tr(locale,'rest')}</small></button>
          <button data-command="fire" id="fire-button"><strong>›</strong><small>${tr(locale,'fire')}</small></button>
          <button class="brace-action" data-wait><strong>•</strong><small>${tr(locale,'brace')}</small></button>
          <div id="context-slot" class="context-slot"></div>
        </section>
        <section class="controls" aria-label="movement controls">
          <span></span><button data-move="0,-1" aria-label="move up">▲</button><span></span>
          <button data-move="-1,0" aria-label="move left">◀</button><span class="dpad-core">•</span><button data-move="1,0" aria-label="move right">▶</button>
          <span></span><button data-move="0,1" aria-label="move down">▼</button><span></span>
        </section>
      </footer>`,'mobile command deck');
  s=once(s,"  document.querySelector<HTMLButtonElement>('[data-wait]')?.addEventListener('click', () => doAction({ type: 'wait' }));","  document.querySelectorAll<HTMLButtonElement>('[data-wait]').forEach((button)=>button.addEventListener('click', () => doAction({ type: 'wait' })));\n  document.querySelectorAll<HTMLButtonElement>('[data-command]').forEach((button)=>button.addEventListener('click',()=>{const type=button.dataset.command as 'explore'|'search'|'rest'|'fire';doAction({type});}));",'command handlers');
  s=once(s,"  if(site.kind==='merchant')return merchantMarkup(current,site);","  if(site.kind==='merchant'||site.kind==='provisioner')return `${merchantMarkup(current,site)}${site.kind==='provisioner'?serviceButton(site,'meal'):''}`;",'provision merchant');
  s=once(s,"  if(site.kind==='camp')return serviceButton(site,'rest');\n  return serviceButton(site,'rumor');","  if(site.kind==='camp')return serviceButton(site,'rest');\n  if(site.kind==='trainer')return `${serviceButton(site,'train-attack')}${serviceButton(site,'train-defense')}${serviceButton(site,'train-vigor')}`;\n  if(site.kind==='inn')return `${serviceButton(site,'inn-rest')}${serviceButton(site,'meal')}`;\n  return serviceButton(site,'rumor');",'new site ui');
  s=once(s,"  const hpFill = document.querySelector<HTMLElement>('#hp-fill');\n  const messageText", "  const hpFill = document.querySelector<HTMLElement>('#hp-fill');\n  const hungerText=document.querySelector<HTMLElement>('#hunger-text');\n  const hungerFill=document.querySelector<HTMLElement>('#hunger-fill');\n  const levelText=document.querySelector<HTMLElement>('#level-text');\n  const ammoText=document.querySelector<HTMLElement>('#ammo-text');\n  const fireButton=document.querySelector<HTMLButtonElement>('#fire-button');\n  const messageText",'redraw queries');
  s=once(s,"  if (drift) drift.textContent = driftLabel(state);\n  if (hpText) hpText.textContent = `${state.player.hp}/${state.player.maxHp}`;\n  if (hpFill) hpFill.style.width = `${Math.max(0, Math.min(100, state.player.hp / state.player.maxHp * 100))}%`;","  if (drift) {const lane=driftLabel(state);drift.textContent=`${lane?lane+' · ':''}${state.player.gold}g · ${state.player.kills}${locale==='ko'?'처치':' kills'}`;}\n  if (hpText) hpText.textContent = `HP ${state.player.hp}/${state.player.maxHp}`;\n  if (hpFill) hpFill.style.width = `${Math.max(0, Math.min(100, state.player.hp / state.player.maxHp * 100))}%`;\n  const hungerKey=hungerStage(state.player.hunger,state.player.maxHunger);\n  if(hungerText)hungerText.textContent=`${tr(locale,hungerKey)} ${hungerPercent(state)}%`;\n  if(hungerFill)hungerFill.style.width=`${hungerPercent(state)}%`;\n  if(levelText)levelText.textContent=`L${state.player.level}`;\n  if(ammoText)ammoText.textContent=`${tr(locale,'ammo')} ${state.player.ammo}`;\n  if(fireButton){const equipped=state.player.inventory.find((entry)=>entry.id===state.player.equippedWeaponId);fireButton.disabled=!equipped||!isRangedWeapon(itemById(equipped.defId))||state.player.ammo<=0;}", 'redraw survival');
  s=once(s,"  if (event.key === '.' || event.key === ' ') { event.preventDefault(); doAction({ type: 'wait' }); return; }","  if (event.key === '.' || event.key === ' ') { event.preventDefault(); doAction({ type: 'wait' }); return; }\n  if(event.key==='f'||event.key==='F'){event.preventDefault();doAction({type:'fire'});return;}\n  if(event.key==='x'||event.key==='X'){event.preventDefault();doAction({type:'explore'});return;}\n  if(event.key==='r'||event.key==='R'){event.preventDefault();doAction({type:'rest'});return;}\n  if(event.key==='/'){event.preventDefault();doAction({type:'search'});return;}", 'keyboard commands');
  return s;
});

fs.writeFileSync('src/tactical.css',`/* Mobile command deck: world first, controls second. */
:root{--panel:#090d13;--panel2:#0d131b;--line:#202a36;--text:#e9ece8;--muted:#778392;--hp:#cf6269;--food:#c4a35d}
.game-shell{max-width:820px;background:radial-gradient(circle at 50% 18%,#101721 0,#070a0f 46%,#040609 100%);box-shadow:0 0 80px #000 inset}
.hud{height:62px;grid-template-columns:minmax(0,1fr) 132px 40px;gap:9px;padding:7px 9px;background:linear-gradient(180deg,#0c1118f5,#080c12f0);border-bottom:1px solid #1c2631;box-shadow:0 8px 24px #0006;z-index:2}
.place-block strong{font-size:13px;color:#f0f1ed;text-shadow:0 1px 8px #000}.place-block span{font-size:9px;color:#7f8b98;letter-spacing:.055em;text-transform:none}
.vitals-block{width:132px;display:grid;gap:3px}.vital-labels,.hunger-line{display:flex;justify-content:space-between;align-items:center;font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#cdd2d7}.vital-labels b{color:#d7c38d}.hunger-line{color:#a89366}.hunger-line small{font-size:8px;color:#8995a2}.hp-track,.hunger-track{height:5px;background:#202832;border-radius:6px;overflow:hidden;box-shadow:inset 0 1px 2px #000}.hp-track i,.hunger-track i{display:block;height:100%;border-radius:inherit;transition:width .12s linear}.hp-track i{background:linear-gradient(90deg,#a9434c,#df7778);box-shadow:0 0 8px #c5535b99}.hunger-track i{background:linear-gradient(90deg,#8f713e,#d4b367);box-shadow:0 0 7px #b28d4c77}.icon-button{width:38px;height:38px;border-color:#27313e;background:#0e141d;color:#b7c0ca}
.map-wrap{position:relative;min-height:0;place-items:center;overflow:hidden;background:radial-gradient(circle,#0a0f16 0,#05080c 72%);border-bottom:1px solid #141d27}.map-wrap:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 38px #000b,inset 0 0 2px #41536b22}.game-canvas,#game-canvas{width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;filter:contrast(1.07) saturate(1.06)}
.message-strip{min-height:31px;padding:6px 11px;border-top:0;border-bottom:1px solid #1a232e;background:#080c12e8;color:#b7c0ca;font-size:11px;box-shadow:0 -8px 20px #0004}
.mobile-dock{min-height:142px;display:grid;grid-template-columns:58px minmax(118px,1fr) 142px;gap:7px;align-items:center;padding:8px 8px max(9px,env(safe-area-inset-bottom));border-top:1px solid #222d39;background:linear-gradient(180deg,#0d131bf4,#080c11fa);box-shadow:0 -12px 32px #0009;z-index:3}.utility-dock{align-self:stretch;display:flex;align-items:center}.bag-button{width:54px;height:62px;border:1px solid #293542;background:linear-gradient(180deg,#131b25,#0e141c);border-radius:13px;color:#c7ced5;box-shadow:0 4px 12px #0006,inset 0 1px #ffffff08}.bag-button .bag-glyph{font-size:21px}.bag-button b{background:#35404c;color:#f3f2eb}
.action-pad{justify-self:center;width:100%;max-width:142px;display:grid;grid-template-columns:repeat(2,minmax(48px,1fr));grid-template-rows:repeat(3,38px);gap:5px}.action-pad>button,.context-slot>.site-dock-button{min-width:0;height:38px;padding:2px 4px;display:grid;grid-template-columns:auto 1fr;place-items:center;gap:3px;border-radius:10px;border:1px solid #283543;background:linear-gradient(180deg,#151e28,#101720);box-shadow:0 3px 10px #0005,inset 0 1px #ffffff09;touch-action:manipulation}.action-pad strong{font:700 15px ui-monospace,monospace;color:#d8dee4}.action-pad small,.context-slot small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px;color:#9ca7b3}.action-pad .brace-action{border-color:#3a4050;background:linear-gradient(180deg,#181e29,#111620)}.action-pad button:disabled{opacity:.32;filter:saturate(.3)}.context-slot{width:100%;height:38px}.context-slot:empty{border:1px dashed #202a34;border-radius:10px;opacity:.35}.site-dock-button span{font-size:16px}
.controls{justify-self:end;display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(3,38px);gap:4px}.controls>button{padding:0;border-radius:11px;border:1px solid #344354;background:linear-gradient(180deg,#1a2531,#111923);color:#e0e4e7;font-size:15px;font-weight:800;box-shadow:0 4px 11px #0006,inset 0 1px #ffffff0b;touch-action:manipulation}.controls>button:active,.action-pad>button:active{transform:translateY(1px) scale(.97);box-shadow:0 1px 4px #0008}.controls .dpad-core{display:grid;place-items:center;color:#465261;font-size:12px;pointer-events:none}
@media(min-width:700px){.mobile-dock{min-height:150px;grid-template-columns:64px minmax(140px,1fr) 158px;padding-left:12px;padding-right:12px}.action-pad{max-width:166px;grid-template-columns:repeat(2,78px);grid-template-rows:repeat(3,41px)}.action-pad>button,.context-slot>.site-dock-button{height:41px}.controls{grid-template-columns:repeat(3,49px);grid-template-rows:repeat(3,41px)}}
@media(max-width:360px){.mobile-dock{grid-template-columns:52px minmax(104px,1fr) 130px;gap:5px;padding-left:5px;padding-right:5px}.bag-button{width:49px}.controls{grid-template-columns:repeat(3,40px);grid-template-rows:repeat(3,36px);gap:3px}.action-pad{grid-template-rows:repeat(3,36px);gap:4px}.action-pad>button,.context-slot>.site-dock-button{height:36px}.action-pad small,.context-slot small{font-size:7px}}
@media(max-height:700px){.hud{height:54px}.mobile-dock{min-height:124px;padding-top:5px}.controls{grid-template-rows:repeat(3,34px)}.action-pad{grid-template-rows:repeat(3,34px)}.action-pad>button,.context-slot>.site-dock-button{height:34px}.message-strip{min-height:28px;padding-top:4px;padding-bottom:4px}}
`);
