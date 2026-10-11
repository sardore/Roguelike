function exclusiveGameplayInput(){return storyInputOpen()||actionTargetOpen56()}
function syncWorldTargetInput(){const input=document.getElementById('runtimeInput81');if(input)input.style.pointerEvents=actionTargetOpen56()?'none':'auto'}
function ensureWorldTarget(){
  let h=document.getElementById('worldTarget57');if(h)return h;
  h=document.createElement('div');h.id='worldTarget57';h.innerHTML='<div><b id="worldTargetTitle57">목표 지정</b><span id="worldTargetText57">이동할 곳을 골라라.</span></div><button id="worldTargetCancel57">취소</button>';document.body.appendChild(h);
  h.querySelector('#worldTargetCancel57').onclick=e=>{e.preventDefault();e.stopPropagation();InputRouter.dispatch({type:'TARGET_CANCEL',source:'target-hud'})};return h;
}
function beginWorldTarget(cfg={}){
  if(!state||runState57()!=='playing'||WORLD_TARGET||!Array.isArray(cfg.cells)||!cfg.cells.length)return false;
  cancelAutoWalk();clearHeldInput53();const h=ensureWorldTarget(),cells=cfg.cells.map(v=>({...v})),byKey=new Map(cells.map(v=>[k(v.x,v.y),v]));
  WORLD_TARGET={kind:cfg.kind||'world',title:cfg.title||'목표 지정',text:cfg.text||'목표 칸을 골라라.',range:cfg.range||0,cells,byKey,onPick:cfg.onPick||null,onCancel:cfg.onCancel||null,meta:cfg.meta||null};
  document.getElementById('worldTargetTitle57').textContent=WORLD_TARGET.title;document.getElementById('worldTargetText57').textContent=WORLD_TARGET.text;h.classList.add('show');syncWorldTargetInput();
  if(cfg.toast)toast(cfg.toast);drawMap(true);return true;
}
function cancelWorldTarget(silent=false){
  const t=WORLD_TARGET;if(!t)return false;WORLD_TARGET=null;ensureWorldTarget().classList.remove('show');syncWorldTargetInput();endTargetInput57(260);try{t.onCancel?.()}catch(e){console.warn('[world-target cancel]',e)}if(!silent)toast('목표 지정을 취소했다.');drawMap(true);return true;
}
function finishWorldTarget(cell,source='pointer'){
  const t=WORLD_TARGET;if(!t||!cell)return false;const live=t.byKey.get(k(cell.x,cell.y));if(!live){toast('선택할 수 없는 칸이다.');return false}
  let ok=false;try{ok=t.onPick?.({...live},source)!==false}catch(e){console.error('[world-target pick]',e);ok=false}if(!ok)return false;
  WORLD_TARGET=null;ensureWorldTarget().classList.remove('show');syncWorldTargetInput();endTargetInput57(300);drawMap(true);return true;
}
function heldInputBlocked(){return !gameplayInputAllowed57()||document.hidden||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)}
function advanceHeldInput(now=performance.now()){
 if(heldInputBlocked()){clearHeldInput53();return false}
 const key=[...INPUT.held].pop(),d=MOVE_KEYS[key];if(!d||now<INPUT.nextMoveAt)return false;
 INPUT.nextMoveAt=now+Math.max(125,movementInterval());ClientEnvironment.emit({type:'MOVE',dx:d[0],dy:d[1],source:'keyboard-hold'});return true;
}
function floatText(x,y,text,color="#ffffff",size=13,element=null){
  const elementColor=element&&ELEMENT_FX_COLORS105[element];
  if(elementColor)color=elementColor;
  text=displayCombatText58(text);
  const dmg=/^-\d+/.test(text),n=dmg?Math.max(14,size):size;
  FX.floats.push({x:x*TILE+TILE/2,y:y*TILE+8,text,color,size:n,damage57:dmg,start:performance.now(),life:dmg?820:720});
  const feed=dmg&&state?document.getElementById('mfHitFeed'):null;
  if(feed){const hurt=x===state.player.x&&y===state.player.y,d=document.createElement('div');d.className=`mfHit ${hurt?'hurt':''}`;d.textContent=`${hurt?'피격':'타격'} ${text}`;if(elementColor)d.style.color=elementColor;feed.appendChild(d);setTimeout(()=>d.remove(),620)}
}
function projectInteractionUI(){
  for(const panel of gameplayPanels57()){
    const active=interactionActive8(panel.id),element=document.getElementById(panel.id);
    if(panel.css&&element){element.classList.toggle(panel.css,active);element.style.removeProperty('display')}if(panel.body)document.body.classList.toggle(panel.body,active);
    const display={inventory:'block',martialPanel:'block',helpPanel:'block',cipherPanel:'flex'}[panel.id];if(element&&display){element.style.display=active?display:'none';if(panel.id==='inventory')element.classList.toggle('open',active)}
  }
  document.getElementById('mapGenerationNotice57')?.classList.toggle('show',RuntimeState.ui.generationPending);
  document.body.classList.toggle('manru-inspect-open',interactionActive8('mobileInspect'));
  document.body.classList.toggle('ux-modal-open',activeGameplayPanels57().length>0);syncWorldTargetInput();
}
const CLIENT_GAMEPLAY_COMMANDS=Object.freeze(new Set(['MOVE','ATTACK','REST','PICKUP','CONTEXT_ACTION','DESCEND','BLINK','CLASS_SKILL','OPEN_MARTIAL','TOGGLE_SKILL_QUICK','QUICK_MARTIAL','AUTO_EXPLORE','TARGET_MOVE','TARGET_CONFIRM','WORLD_SELECT','WORLD_INSPECT','CAMERA_PAN','CAMERA_ZOOM','CAMERA_CENTER','CLOSE_DOOR','QUICK_SLOT']));
function debuffDetailHtml(){const rows=playerDebuffRows();return rows.length?rows.map(r=>`<b style="color:${r.color}">${combatStatusIconHtml57(r)} ${r.label} ${r.turns}</b> · ${r.effect}`).join('<br>'):'현재 디버프 없음.'}
function ensureDebuffHud(){
  let hud=document.getElementById('debuffHud57');if(hud)return hud;hud=document.createElement('div');hud.id='debuffHud57';document.body.appendChild(hud);
  return hud
}
function updateDebuffHud(){const hud=ensureDebuffHud(),rows=playerDebuffRows();if(bodyPowerActive())rows.unshift({label:'괴력',turns:state.player.classState.powerTurns});hud.classList.toggle('show',rows.length>0);hud.innerHTML=rows.map(r=>`<span${r.color?` style="color:${r.color};border-color:${r.color}"`:''}>${combatStatusIconHtml57(r)}${r.label} ${r.turns}</span>`).join('');return rows.length}
function normalizeTerrainUnderlays(){
  if(!state?.map)return 0;const layers=terrainMapLayers58(state.map),cat=terrainLayerCatalog58();let recovered=0;
  for(let y=0;y<state.map.length;y++)for(let x=0;x<state.map[y].length;x++){
    const key=k(x,y),tile=state.map[y][x];if(!cat.overlays.has(tile)){delete layers.underlay[key];delete layers.attachment[key];continue}
    const entrance=(state.rumorSpaces1030||[]).find(r=>r.revealed&&!r.opened&&r.entry?.x===x&&r.entry?.y===y);
    if(entrance&&[TT.SCREEN,TT.RACK,TT.WINDOW].includes(tile)){layers.underlay[key]=TT.WALL;layers.attachment[key]='secret-wall';continue}
    if(tile===TT.WALL_BANNER){layers.underlay[key]=TT.WALL;layers.attachment[key]='wall';continue}
    let mode=layers.attachment[key],base=layers.underlay[key];
    if(!mode){mode=cat.wallOverlays.has(tile)&&base===TT.WALL?'wall':'standing';layers.attachment[key]=mode}
    const valid=mode==='wall'?cat.wallOverlays.has(tile)&&base===TT.WALL:mode==='standing'&&terrainSurface58(base);
    if(!valid){layers.attachment[key]='standing';layers.underlay[key]=inferTerrainUnderlay58(x,y,tile);recovered++}
  }
  state.terrainUnderlayVersion58=2;RuntimeState.persistence.terrainRecovery58={recovered,method:'legacy-room-or-adjacent-surface',exactOriginalRecoverable:false};return recovered;
}
function movementInterval(){return 105}
function runAutoPath(path,meta={}){return Auto81.startPath(path,meta)}
function showBossIntro(mon){
  const box=document.getElementById('bossIntro');if(!box||!mon)return;vfVibrate(HAPTIC_PATTERN57.boss);clearTimeout(bossIntroTimer);document.getElementById('bossIntroName').textContent=mon.name;document.getElementById('bossIntroFloor').textContent=`제 ${String(state.floor).padStart(2,'0')}층`;box.classList.add('show');bossIntroTimer=setTimeout(()=>box.classList.remove('show'),1900);
  globalThis.__MANRU_SFX54__?.play?.('boss');const rule=document.getElementById('bossRule54');if(rule){rule.textContent=mon.bossPattern==='master'?'최종전 · 금빛 부채꼴을 피하고 사념체를 파괴하라':'보스 규칙을 읽고 예고 칸을 피하라';rule.classList.add('show');setTimeout(()=>{if(!state?.monsters?.some(m=>m.intent54))rule.classList.remove('show')},1700)}
}
function toast(msg){
  msg=sanitize56(msg);
  const t = document.getElementById("toast");
  t.textContent = displayText53(msg);
  t.style.opacity = 1;
  clearTimeout(t._tm);
  t._tm = setTimeout(()=>t.style.opacity=0, 1300);
}
function projectRunningScreen(){document.body.classList.add('run-active');const overlay=document.getElementById('overlay');if(overlay)overlay.style.display='none'}
function closeCipher(){cipherOpen=false;const p=document.getElementById('cipherPanel');if(p)p.style.display='none';globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.()}
function renderCipherPanel(){const box=document.getElementById('cipherPanel');if(!box||!state?.cipher)return;const c=state.cipher;box.innerHTML=`<div class="cipherSheet"><span class="uiCorners63" aria-hidden="true"></span><div class="cipherHead"><div><b>성채 도개교 암호</b><small>숫자 1~5 · O=자리/숫자 일치 · P=숫자만 존재 · X=없음<br>한 번 제출할 때마다 1턴이 흐른다.</small></div><button class="uxClose" id="cipherClose" aria-label="닫기">×</button></div><div class="cipherDisplay">${Array.from({length:5},(_,i)=>`<div class="cipherDigit ${c.guess[i]?'':'empty'}">${c.guess[i]||'·'}</div>`).join('')}</div><div class="cipherKeys">${[1,2,3,4,5].map(n=>`<button data-cnum="${n}">${n}</button>`).join('')}</div><div class="cipherActions"><button id="cipherClear">지우기</button><button id="cipherSubmit">제출</button></div><div class="cipherHistory">${c.history.slice().reverse().map(h=>`<div class="cipherTry"><b>${h.guess.join('')}</b><span>${h.result.map(v=>`<b class="${v}">${v}</b>`).join(' ')}</span></div>`).join('')}</div></div>`;box.querySelector('#cipherClose').onclick=closeCipher;box.querySelectorAll('[data-cnum]').forEach(b=>b.onclick=()=>InputRouter.dispatch({type:'CIPHER_DIGIT',digit:+b.dataset.cnum,source:'cipher-key'}));box.querySelector('#cipherClear').onclick=()=>InputRouter.dispatch({type:'CIPHER_CLEAR',source:'cipher-clear'});box.querySelector('#cipherSubmit').onclick=ActionDispatcher.handleEvent}
function openCipher(){if(!gameplayUiOpen57())return false;if(!state?.cipher||state.cipher.solved){toast('도개교는 이미 열려 있다.');return}if(inventoryOpen)closeInventory();if(martialOpen)closeMartial();closeMobileDrawer();cipherOpen=true;renderCipherPanel();document.getElementById('cipherPanel').style.display='flex'}
function lockProgressText(){const q=globalThis.__MANRU_TYPED_KEYS__?.summary?.();if(q?.active&&q.rows?.length)return q.rows.map(r=>`${r.name} ×${r.have} · 잠금 ${r.closed}`).join(' / ');if(state?.floor===6&&state.f6LibraryGateR8&&state.map?.[state.f6LibraryGateR8.y]?.[state.f6LibraryGateR8.x]!==TT.LOCKED_GATE)return '봉인 고문서고 · 해제됨';if((state?.floorKeysRequired||0)>0)return `${legacyKeyLabel()} ${state.floorKeys||0}/${state.floorKeysRequired||0}`;return '잠금 상태 없음'}
function updateAttackButton(...args){const r=markAttackButtonAim(...args);if(state&&isBow967()){const b=document.getElementById('attackActionBtn'),sm=b?.querySelector('small');if(sm){const a=selectedAmmo();sm.textContent=a?`${a.name.replace(' 화살','')} ${totalAmmo()}발`:'화살 없음';b.classList.toggle('cooling',!a)}}return r}
function markAttackButtonAim(){
    paintAttackButton();const b=document.getElementById('attackActionBtn');if(!b)return;
    const valid=isAimTargetValid()&&(!!AIM_STATE.jar||bow52());b.classList.toggle('aim52',!!valid);const sm=b.querySelector('small');
    if(valid&&sm)sm.textContent='조준';
  }
function vibrationEnabled(){return HAPTIC57.enabled}
function setVibrationEnabled(on){HAPTIC57.enabled=!!on;try{localStorage.setItem('manruHaptics57',HAPTIC57.enabled?'1':'0')}catch(error){console.warn('[manru] haptics setting not stored',error)}return HAPTIC57.enabled}
function normalizeShop(){
 const s=state.shopIntermission;if(!s){state.shopIntermission=null;state.neutralInteractables58=[];return}
 if(!s.active){state.neutralInteractables58=[];return}
 if(![5,10,15,20].includes(s.afterFloor)||s.afterFloor!==state.floor||s.nextFloor!==s.afterFloor+1||s.theme!==s.afterFloor/5-1||!Array.isArray(s.stock)||!s.merchant||!s.outer)throw new Error('invalid shop save');
 if(s.stock.some(x=>typeof x.soldOut!=='boolean'||!shopEligible58(x.item,s.afterFloor,s.theme)))throw new Error('invalid shop stock');
 if(s.version!==3){for(const row of s.stock)row.price=shopPrice58(row.item);ShopMapBuilder.build();s.version=3}
 if(s.stock.some(x=>x.price!==shopPrice58(x.item)||!Number.isInteger(x.x)||!Number.isInteger(x.y)))throw new Error('invalid shop stock placement');
 s.purchaseId=null;state.neutralInteractables58=[s.merchant];
}
function shopPublic(item){
 const consumable=globalThis.__MANRU_CONSUMABLE56_ACTIONS__,talisman=globalThis.__MANRU_TALISMAN74_ACTIONS__,gear=['weapon','armor','cloak','relic','trinket'].includes(item.type);
 const known=item.type==='talisman'?talisman?.known?.(item):item.type==='potion'?consumable?.knownPotion?.(item):!gear||item.identified===true;
 const name=item.type==='talisman'?talisman?.publicName?.(item):consumable?.publicName?.(item);
 return{name:name||item.name,description:known?(item.desc||item.ability||''):'미감정 물품 · 교환해도 자동으로 감정되지 않는다.'};
}
function openShop(stock=null){
 const panel=document.getElementById('shop58'),shop=state?.shopIntermission;if(!panel||!shop?.active)return false;
 if(stock&&(stock.soldOut||stock.x!==state.player.x||stock.y!==state.player.y))return false;
 if(!stock&&!adjacentMerchant58())return false;
 cancelAutoWalk();clearHeldInput53();shop.purchaseId=stock?.id||null;globalThis.__MANRU_UX45_ACTIONS__?.beginViewer?.();renderShop();setInteraction8('shop58',true);globalThis.__MANRU_UX45_ACTIONS__?.finishViewer?.();return true;
}
function renderShop(){
 const panel=document.getElementById('shop58'),s=state?.shopIntermission;if(!panel||!s?.active)return;
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),purchase=s.stock.find(r=>r.id===s.purchaseId&&!r.soldOut),items=purchase?[purchase.item]:state.player.inventory;
 panel.innerHTML=`<section class="shopSheet58" role="dialog" aria-modal="true" aria-label="${purchase?'진열품 구매 확인':'내 행낭 · 물품 판매'}"><span class="uiCorners63" aria-hidden="true"></span><header><div><small>${esc(SHOP_RULES58[s.theme].room)} · ${esc(s.merchant.name)}</small><h2>${purchase?'이 물건을 살까?':'내 행낭 · 물품 판매'}</h2><p>보유 엽전 엿 <b>${shopCurrency58()}</b>개</p></div><button class="uxClose" data-shop-close aria-label="닫기">×</button></header><div class="ShopMapBuilder.stock ${purchase?'shopConfirm58':''}">${items.map((item,index)=>{const pub=shopPublic(item),value=ShopMapBuilder.saleValue(item),enabled=!!purchase||value>0;return`<article class="shopItem58 ${enabled?'eligible':'ineligible'}"><div class="shopArt58">${globalThis.__MANRU_ITEM_ART_R7__?.iconHtml?.(item)||''}</div><div><small style="color:${rarityColor(item.rarity)}">${esc(({common:'일반',rare:'희귀',relic:'유물',sealed:'봉인'})[item.rarity]||'특수')} · ${itemQuantity(item)}개</small><h3>${esc(pub.name)}</h3><p>${esc(pub.description)}</p></div>${purchase?`<button data-shop-buy="${esc(purchase.id)}" ${shopCurrency58()<purchase.price?'disabled':''}>엽전 엿 ${purchase.price}개 지불 · 구매</button>`:`<button data-shop-sell="${index}" ${value?'':'disabled'}>${value?`1개 판매 · 엽전 엿 ${value}개 받기`:'판매 불가'}</button>`}</article>`}).join('')||'<p>행낭이 비어 있다.</p>'}</div><footer>${purchase?'구매를 확정할 때만 엽전 엿이 차감된다.':'밝게 표시된 물건만 판매 가능 · 유물 1개 / 봉인급 2개 받기'}<button data-shop-cancel>${purchase?'두고 가기':'닫기'}</button></footer></section>`;
 panel.querySelector('[data-shop-close]').onclick=closeShop58;panel.querySelector('[data-shop-cancel]').onclick=closeShop58;
 panel.querySelectorAll('[data-shop-buy]').forEach(b=>b.onclick=()=>ActionDispatcher.dispatch({type:'SHOP_BUY',args:[b.dataset.shopBuy]}).value);
 panel.querySelectorAll('[data-shop-sell]').forEach(b=>{const item=items[+b.dataset.shopSell];b.onclick=()=>ActionDispatcher.dispatch({type:'SHOP_SELL',args:[item]}).value});
}
function renderMartialPanel(){const box=document.getElementById('martialPanel');if(!box||!state)return;const p=state.player;box.innerHTML=`<div class="martialHead991"><div><b>기술 강화</b><small>포인트 ${p.skillPoints} · ×로 닫기 · 기술 사용은 버튼을 짧게 눌러 실행</small></div><button class="uxClose" id="martialClose991" aria-label="닫기">×</button></div><div class="martialGrid991">${Object.entries(MARTIAL_INFO).map(([id,info])=>{const v=martialPresentation(id,info,p);return `<article data-martial-inspect="${id}" class="${martialCardClasses(id,p)}">${martialCardContent(id,p)}<button class="upgrade991" data-up991="${id}" ${p.skillPoints<=0||p.martial[id]>=martialCap(id,p)?'disabled':''}>${p.martial[id]>=martialCap(id,p)?'최대 강화':'강화 +1'}</button></article>`}).join('')}</div>`;box.querySelectorAll('[data-martial-inspect]').forEach(el=>el.oncontextmenu=e=>{e.preventDefault();const id=el.dataset.martialInspect,v=martialPresentation(id,MARTIAL_INFO[id],p);showInspect(v.name,`${p.martial[id]}단 / 상한 ${martialCap(id,p)} · ${v.type==='active'?'기력 '+v.cost:'지속 효과'}<br>${v.desc}`)});box.querySelector('#martialClose991').onclick=closeMartial;box.querySelectorAll('[data-up991]').forEach(b=>b.onclick=()=>ActionDispatcher.dispatch({type:'UPGRADE_MARTIAL',args:[b.dataset.up991]}).value)}
function inventoryDetailHtml(item,idx){if(!item)return'<div class="invDetailEmpty">물품을 골라 자세히 살펴본다.</div>';const stats=[];if(item.atk)stats.push(`ATK +${displayNumber53(item.atk)}`);if(item.def)stats.push(`DEF ${item.def>0?'+':''}${displayDef42(item.def)}`);if(item.eva)stats.push(`EVA ${item.eva>0?'+':''}${item.eva}`);if(item.speed)stats.push(`속도 ${item.speed}× · ${attackTurnCost(item).toFixed(1)}턴`);if(item.range)stats.push(`사거리 ${item.range}`);if(item.hunger)stats.push(`허기력 +${item.hunger}`);if(item.vision)stats.push(`VIS ${item.vision>0?'+':''}${item.vision}`);if(item.will)stats.push(`WILL +${item.will}`);const gear=['weapon','armor','cloak','relic','trinket'].includes(item.type),fx=hiEffectSummary(item),desc=item.desc||'설명이 없다.';return `<div class="vfDetailTop">${vfIconHtml(item,'large')}<div><h3>${item.name}${(item.count||1)>1?` ×${item.count}`:''}</h3><div class="typeLine">${item.legendaryWeapon47?'전설의 무기':itemTypeLabel(item.type)} · ${item.tier?`${item.tier} TIER · `:''}${item.legendaryWeapon47?'강화 불가':(item.rarity||'common').toUpperCase()}${item.type==='weapon'?' · TURN-BASED':''}</div></div></div><div class="invStats">${stats.map(x=>`<span class="invStatChip">${x}</span>`).join('')}</div>${item.ability&&item.ability!=='없음'?`<div class="invAbility"><b>능력 · ${item.ability}</b><br>${fx}</div>`:''}<div class="desc">${desc}</div><div class="invActions"><button class="primary" data-invuse="${idx}">${gear?'장착':'사용'}</button><button data-invdrop="${idx}">버리기</button><button class="wide" data-invinspect="${idx}">세부 정보</button></div>`}
function renderInventoryFallbackR(){const box=document.getElementById('inventory');if(!box||!state)return;const p=state.player;if(inventorySelection>=p.inventory.length)inventorySelection=p.inventory.length-1;const filtered=inventoryFiltered(),selected=inventorySelection>=0?p.inventory[inventorySelection]:null;box.innerHTML=`<div class="invFrame"><div class="invTop"><div><h2>행낭</h2><small>장비는 위, 소모품은 아래. 같은 음식은 겹친다.</small></div><div class="invTopMeta"><span><b>${p.inventory.length}</b> / ${inventoryCapacity()}</span><button class="uxClose" id="invCloseBtn" aria-label="닫기">×</button></div></div><div class="invEquipStrip">${equipData().map(([slot,label,item,g])=>`<div class="equipSlot" data-eqslot="${slot}"><div class="ek">${label}</div><div class="ev">${item?item.name:'비어 있음'}</div><div class="eg">${g}</div></div>`).join('')}</div><div class="invBody"><div class="invBagPane"><div class="invTabs"><button class="invTab ${inventoryTab==='all'?'active':''}" data-invtab="all">전체</button><button class="invTab ${inventoryTab==='gear'?'active':''}" data-invtab="gear">장비</button><button class="invTab ${inventoryTab==='food'?'active':''}" data-invtab="food">음식</button><button class="invTab ${inventoryTab==='treasure'?'active':''}" data-invtab="treasure">유물</button></div><div class="invGrid">${filtered.length?filtered.map(({item,idx})=>`<button class="invSlot ${idx===inventorySelection?'selected':''}" data-invslot="${idx}" data-rarity="${item.rarity||'common'}"><span class="invTier">${item.tier?`T${item.tier}`:''}</span><span class="invGlyph">${itemGlyph(item)}</span><span class="invSlotName">${item.name}</span>${(item.count||1)>1?`<span class="invCount">×${item.count}</span>`:''}</button>`).join(''):'<div class="invDetailEmpty" style="grid-column:1/-1">이 분류에는 물품이 없다.</div>'}</div></div><div class="invDetail" id="invDetail">${inventoryDetailHtml(selected,inventorySelection)}</div></div></div>`;box.querySelector('#invCloseBtn').onclick=closeInventory;box.querySelectorAll('[data-invtab]').forEach(b=>b.onclick=()=>{inventoryTab=b.dataset.invtab;renderInventory()});box.querySelectorAll('[data-invslot]').forEach(b=>{b.onclick=()=>{inventorySelection=+b.dataset.invslot;renderInventory()};b.ondblclick=()=>ActionDispatcher.dispatch({type:'ITEM_USE',args:[+b.dataset.invslot]}).value});box.querySelectorAll('[data-invuse]').forEach(b=>b.onclick=()=>ActionDispatcher.dispatch({type:'ITEM_USE',args:[+b.dataset.invuse]}).value);box.querySelectorAll('[data-invdrop]').forEach(b=>b.onclick=()=>ActionDispatcher.dispatch({type:'ITEM_DROP',args:[+b.dataset.invdrop]}).value);box.querySelectorAll('[data-invinspect]').forEach(b=>b.onclick=()=>{const it=p.inventory[+b.dataset.invinspect];showInspect(it.name,`${itemSummary(it)}<br><span style="color:#a79374">${it.desc||''}</span>`)});box.querySelectorAll('[data-eqslot]').forEach(el=>{el.onclick=()=>{const it=p[el.dataset.eqslot];if(it)showInspect(it.name,`${itemSummary(it)}<br><span style="color:#a79374">${it.desc||''}</span>`)};attachLongPress(el,el.onclick)})}
function openInventory(){
  if(!gameplayUiOpen57())return false;globalThis.__MANRU_UX45_ACTIONS__?.beginViewer?.();
  if(cipherOpen){globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.();return}
  if(martialOpen) closeMartial();
  inventoryOpen = true;if(inventorySelection<0&&state.player.inventory.length)inventorySelection=0;
  renderInventory();
  const box=document.getElementById("inventory");box.style.display="block";box.classList.add('open');
globalThis.__MANRU_UX45_ACTIONS__?.finishViewer?.();
}
function closeInventory(){
  inventoryOpen = false;
  const box=document.getElementById("inventory");box.style.display="none";box.classList.remove('open');
globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.();}
function renderHelp(){const box=document.getElementById('helpPanel');box.innerHTML=`<div class="invHeader helpHead57"><div><h2>만루 · 도움말</h2><small>ESC 또는 ?로도 닫을 수 있다.</small></div><button class="uxClose" id="helpClose57" aria-label="닫기">×</button></div><div class="helpCols"><div><h3>조작</h3><div>WASD 이동 · SPACE/J 기본 공격 · G 줍기 · F 주변 분기문 출입 · C 인접 문닫기 · E 점멸</div><div>Q 무술 메뉴 · I 인벤토리 · R 휴식</div><div>&gt; 다음 층 · K 저장 · L 불러오기</div><br><h3>성장</h3><div>Lv.1~12: 기존 성장 유지(레벨에 따라 최대 HP +1~2, 무술 포인트 +1). Lv.13~18: 최대 HP +3, 레벨업 무술 포인트 없음.</div><div>완전 턴제다. 당신이 행동할 때만 적·허기·상태가 진행된다. 무기 속도는 공격 행동의 턴 비용을 바꾼다.</div><div>ATK/DEF/EVA는 자동으로 폭증하지 않는다. 장비와 무술 선택이 핵심.</div></div><div><h3>점멸</h3><div>5층 보스: 2칸 습득</div><div>15층 보스: 3칸</div><div>20층 보스: 4칸</div><div>21층부터 공허 간격을 넘는 핵심 이동기가 된다.</div><br><h3>허기</h3><div>1 이상: 전투 능력치 패널티 없음</div><div>0: ATK -20% + 주기적 굶주림 피해</div></div></div>`;box.querySelector('#helpClose57').onclick=closeHelp}
function openHelp(){
  if(!gameplayUiOpen57())return false;globalThis.__MANRU_UX45_ACTIONS__?.beginViewer?.();
  helpOpen = true;
  renderHelp();
  document.getElementById("helpPanel").style.display = "block";
globalThis.__MANRU_UX45_ACTIONS__?.finishViewer?.();
}
function closeHelp(){
  helpOpen = false;
  document.getElementById("helpPanel").style.display = "none";
globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.();}
function endScreen(){document.body.classList.add('end-screen95');for(const id of ['coach70','toast','autoMoveChip','vfAutoState']){const n=document.getElementById(id);if(n){n.classList.remove('show');n.style.display='none'}}}
function presentDeath(by){document.getElementById('overlay').style.display='flex';const pct=Math.min(100,Math.round(state.floor/25*100));document.getElementById('card').innerHTML=`<div class="death94"><span class="uiCorners63" aria-hidden="true"></span><div class="deathSeal94">亡</div><div class="brand">만루 · 탐사 기록 종료</div><h1>등불이 꺼졌다</h1><div class="deathCause94">${by}</div><div class="deathStats94"><span><b>${state.floor}</b><small>도달 층</small></span><span><b>${state.player.level}</b><small>레벨</small></span><span><b>${state.player.kills}</b><small>처치</small></span><span><b>${state.turn}</b><small>턴</small></span></div><div class="deathDepth94"><i style="width:${pct}%"></i></div><p>객주의 복도 어딘가에서 감찰 기록이 끊겼다.<br>남은 등불들은 아무 일도 없었다는 듯 다시 흔들린다.</p><button class="deathRetry94" onclick="location.reload()">다시 침투</button></div>`}
function presentVictory(){document.getElementById('overlay').style.display='flex';document.getElementById('card').innerHTML=`<div class="death94 victory94"><span class="uiCorners63" aria-hidden="true"></span><div class="deathSeal94">만</div><div class="brand">만루 · 천 개의 방이 잠들다</div><h1>천 개의 방이 멎었다</h1><div class="deathCause94">만루보주 격파</div><div class="deathStats94"><span><b>25</b><small>최심부</small></span><span><b>${state.player.level}</b><small>레벨</small></span><span><b>${state.player.kills}</b><small>처치</small></span><span><b>${state.turn}</b><small>턴</small></span></div><div class="deathDepth94"><i style="width:100%"></i></div><p>좌우와 위아래로 뒤틀리던 객실이 처음으로 제자리에서 멎는다.<br>만루의 마지막 등불이 조용히 꺼졌다.</p><button class="deathRetry94" onclick="location.reload()">새 기록 시작</button></div>`}
function runPanelHooks(){for(const h of PANEL_HOOKS54)h.run()}
function setMobileTab(tab){
  mobileTab = tab;
  document.querySelectorAll(".mTab").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  renderMobileDrawer();
}
function renderMobileDrawer(){if(!interactionActive8('mobileDrawer'))return;const box=document.getElementById('mobileDrawerBody');if(!box||!state)return;const p=state.player,st=getStats(),region=regionFor(state.floor),near=state.monsters.filter(isThreatVisibleToPlayer).sort((a,b)=>entityDistance57(a,p)-entityDistance57(b,p))[0];if(mobileTab==='status'){box.innerHTML=`<div class="mDrawerGrid"><div class="mCard"><h4>층 / 구역</h4><div><b>${state.artifactDungeon46?(state.artifactDungeon46.name||state.layoutName||''):`${String(state.floor).padStart(2,'0')} / 25`}</b> <span class="turnPip">T${state.turn}</span><br>${state.artifactDungeon46?'':region[2]}${state.artifactDungeon46?'':`<br><span style="color:#a38d6c">${state.layoutName||''}</span>`}</div></div><div class="mCard"><h4>성장</h4><div>LV ${p.level} · 무술 ${p.skillPoints}<br>점멸 ${p.blinkLevel?p.blinkLevel+'칸':'미습득'}</div></div><div class="mCard"><h4>생명</h4><div>HP ${displayHealth(p.hp)}/${displayHealth(p.maxHp)}<br>기력 ${displayNumber53(p.focus)}/${st.maxFocus}<br>허기 ${Math.round(p.hunger)}/125</div></div><div class="mCard"><h4>능력</h4><div>ATK ${st.atk} · DEF ${displayDef42(st.def)}<br>EVA ${st.eva} · WILL ${st.will}</div></div><div class="mCard mWide"><h4>디버프</h4><div>${debuffDetailHtml()}</div></div><div class="mCard mWide"><h4>주변</h4><div>${near?`<b style="color:${near.color}">${near.name}</b> · HP ${displayHealth(near.hp)}/${displayHealth(near.maxHp)}`:'주변 적 없음'}</div></div><div class="mCard mWide"><h4>지형</h4><div>${state.floor===16&&!state.cipher?.solved?'성채 암호를 풀어 용암 해자의 도개교를 내려야 한다.':state.floor===18?`철판창고 · ${lockProgressText()}.`:state.floor===21?'공허 위 5×5 섬을 점멸로 잇는다. 발판에서 기력이 회복된다.':state.specialFloor?'이 층은 구조 자체가 특수 기믹이다.':'등불 뒤의 샛길과 특수 방을 살펴라.'}</div><button class="mInvBtn" id="saveFromDrawer">기록 저장</button></div></div>`;document.getElementById('saveFromDrawer').onclick=()=>ClientEnvironment.emit({type:'SAVE',source:'mobile-drawer'})}else if(mobileTab==='equip'){box.innerHTML=`<div class="mDrawerGrid"><div class="mCard mWide"><h4>장비</h4><div>무기 ${p.weapon?p.weapon.name:'맨손'}<br>갑옷 ${p.armor?p.armor.name:'경량복'}<br>망토 ${p.cloak?p.cloak.name:'없음'}<br>유물 ${p.relic?p.relic.name:'없음'}<br>장신구 ${p.trinket?p.trinket.name:'없음'}</div><button class="mInvBtn" id="openInvFromDrawer">인벤토리</button><button class="mInvBtn" id="openMartialFromDrawer">무술</button></div></div>`;document.getElementById('openInvFromDrawer').onclick=()=>openInventory();document.getElementById('openMartialFromDrawer').onclick=()=>openMartial()}else if(mobileTab==='log'){box.innerHTML=`<div class="mCard"><h4>최근 기록</h4><div class="mLogList">${state.log.slice(0,20).map(v=>`<div class="mLogItem">${v}</div>`).join('')}</div></div>`}else{box.innerHTML=`<div class="mDrawerGrid"><div class="mCard mWide"><h4>조작</h4><div>스와이프/방향키 이동 · 탭 자동 이동 · 상단 이동 자동 탐사 · 살/. 살피기·대기 · 공격 공격 · 점멸 점멸 · 무술 · 줍 줍기</div></div><div class="mCard"><h4>성장</h4><div>Lv.1~12는 최대 HP +1~2 · 무술 포인트 +1. Lv.13~18은 영구 기본 HP +3. Lv13·15·17·18 무술 포인트 +1. 보스는 비급 지급.</div></div><div class="mCard"><h4>허기</h4><div>1+ 정상 · 0에서 ATK -20% + 굶주림 피해.</div></div><div class="mCard mWide"><h4>특수 지형</h4><div>거대 회관·병풍 / 수중 정자·대나무 미로 / 향수강 뗏목·가짜 문 / 16층 성채 암호·도개교 / 철판창고 열쇠 / 공허 점멸섬·숨은 신전·복숭아 정원</div></div></div>`}}
function closeInspect(ev){
    const wrap=inspectWrap();if(!interactionActive8('mobileInspect'))return false;
    if(ev){ev.preventDefault?.();ev.stopPropagation?.();ev.stopImmediatePropagation?.()}
    cancelLongPresses();
    setInteraction8('mobileInspect',false);wrap?.setAttribute('aria-hidden','true');
    document.body.classList.remove('manru-inspect-open');
    touchStart=null;if(typeof VIS==='object')VIS.tapTrack=null;
    // Android synthetic click can arrive hundreds of ms after touchend.
    block(520);return true;
  }
function bindEquipInspect(){
    if(!state)return;const p=state.player,map={weaponTxt:p.weapon,armorTxt:p.armor,cloakTxt:p.cloak,relicTxt:p.relic,trinketTxt:p.trinket};
    Object.entries(map).forEach(([id,item])=>{const el=document.getElementById(id);attachLongPress(el,()=>showInspect(item?.name||id.replace('Txt','').toUpperCase(),itemInspectHtml(item)))});
  }
function openMapModal(){
  if(!gameplayUiOpen57())return false;globalThis.__MANRU_UX45_ACTIONS__?.beginViewer?.();
  const wrap = document.getElementById("mobileMapModal");
  syncLargeMinimap();
  setInteraction8('mobileMapModal',true);
globalThis.__MANRU_UX45_ACTIONS__?.finishViewer?.();
}
function closeMapModal(){
  const wrap = document.getElementById("mobileMapModal");
  setInteraction8('mobileMapModal',false);
globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.();}
function bindMobileTopButtons(){
  const p = document.getElementById("mobilePanelBtn");
  const d = document.getElementById("mobileDrawerClose");
  const c = document.getElementById("mobileClosePanel");
  const h = document.getElementById("mobileHelpBtn");
  const m = document.getElementById("mobileMapBtn");
  const ic = document.getElementById("inspectClose");
  const mc = document.getElementById("mapClose");
  if(p) p.onclick = ()=>ClientEnvironment.emit({type:'OPEN_MOBILE_DRAWER',tab:'status',source:'mobile-hud'});
  if(d) d.onclick = ()=>ClientEnvironment.emit({type:'MODAL_CANCEL',source:'mobile-hud'});
  if(c) c.onclick = ()=>ClientEnvironment.emit({type:'MODAL_CANCEL',source:'mobile-hud'});
  if(h) h.onclick = ()=>ClientEnvironment.emit({type:'OPEN_MOBILE_DRAWER',tab:'help',source:'mobile-hud'});
  if(m) m.onclick = ()=>ClientEnvironment.emit({type:'OPEN_MAP',source:'mobile-hud'});
  if(ic) ic.onclick = ()=>ClientEnvironment.emit({type:'MODAL_CANCEL',source:'mobile-hud'});
  if(mc) mc.onclick = ()=>ClientEnvironment.emit({type:'MODAL_CANCEL',source:'mobile-hud'});
  document.querySelectorAll(".mTab").forEach(btn=>btn.onclick = ()=>setMobileTab(btn.dataset.tab));
}
function v10AutoChip(text=null){if(text&&/(석주|등롱 기둥|벽걸이 깃발|목상자|긴 의자|화단|정원석|석상|진열 선반|낮은 목책|창호 창문) 앞으로 이동/.test(text))text=null;const c=document.getElementById('autoMoveChip'),t=document.getElementById('autoMoveChipText');if(!c)return;if(text){if(t)t.textContent=text;c.classList.add('show')}else c.classList.remove('show')}
  function hiCreature(m,frame=0,dir='down',player=false){
    const gear=player?state.player:null,key=player?`p:${gear.classId}:${dir}:${frame}:${gear.weapon?.name||''}:${gear.armor?.tier||1}:${gear.cloak?.name||''}`:`m:${m.name}:${m.color}:${m.shape}:${m.kind}:${frame}`;
    if(HI_CACHE.creature.has(key))return HI_CACHE.creature.get(key);const c=hc(),q=ctx2(c),h=hiHash(key);
    if(player)drawPlayer(q,gear.classId||'wanderer',dir,frame,gear);else if(m.kind==='beast'||m.shape==='beast'||m.shape==='angel'&&!m.name.includes('망령'))drawBeast(q,m,frame,h);else if(m.kind==='spirit'||m.kind==='undead'||m.kind==='construct'||m.shape==='void'||m.shape==='zero'||m.shape==='mage')drawSpirit(q,m,frame,h);else drawHumanoid(q,m,frame,h);
    HI_CACHE.creature.set(key,c);return c;
  }
  /* ----------------------- inventory consistency / no duplicate copy ----------------------- */
  function hiEffectSummary(item){const a=[];if(item.atk)a.push(`ATK +${displayNumber53(item.atk)}`);if(item.def)a.push(`DEF ${item.def>0?'+':''}${displayDef42(item.def)}`);if(item.eva)a.push(`EVA ${item.eva>0?'+':''}${item.eva}`);if(item.will)a.push(`WILL +${item.will}`);if(item.vision)a.push(`VIS ${item.vision>0?'+':''}${item.vision}`);if(item.focus)a.push(`FOCUS +${displayNumber53(item.focus)}`);if(item.speed)a.push(`공속 ${item.speed}× · 비용 ${attackTurnCost(item).toFixed(1)}턴`);if(item.range)a.push(`사거리 ${item.range}`);if(item.heal)a.push(`HP +${item.heal}`);if(item.focusGain)a.push(`FOCUS +${item.focusGain}`);if(item.hunger)a.push(`허기력 +${item.hunger}`);if(item.ability&&item.ability!=='없음')a.push(`[${item.ability}]`);if(item.curse)a.push(`저주: ${item.curse}`);return a.join(' · ')}
  const itemInspectHtml=(it)=>{
    if(!it)return'장착된 아이템 없음.';
    const icon=typeof vfIconHtml==='function'?vfIconHtml(it,'inspectIcon'):'';
    const fx=itemEffects(it),desc=it.desc||'설명이 없다.';
    return `<div class="inspectItemHero">${icon}<div><b>${it.name}</b><small>${itemTypeLabel(it.type)}${it.tier?` · T${it.tier}`:''} · ${(it.rarity||'common').toUpperCase()}</small></div></div>${fx?`<div class="inspectFx">${fx}</div>`:''}<div class="inspectDesc">${desc}</div>`;
  };
  function showInspectSheet(title,html){
    if(blocked())return;
    cancelLongPresses();
    const wrap=inspectWrap(),titleEl=document.getElementById('inspectTitle'),bodyEl=document.getElementById('inspectBody');
    if(titleEl)titleEl.textContent=title;
    if(bodyEl)bodyEl.innerHTML=html;
    setInteraction8('mobileInspect',true);wrap?.setAttribute('aria-hidden','false');
    document.body.classList.add('manru-inspect-open');
    U.inspectOpenedAt=inputNow();
    // swallow release/click belonging to the long-press/tap that opened this sheet
    block(180);
  }
  function tileName(x,y){const t=state?.map?.[y]?.[x];if(t==null)return'알 수 없음';try{return terrainName(t)}catch(_){return'바닥'}}
  function updateCH(){if(!state)return;const vis=state.monsters.filter(isThreatVisibleToPlayer),adj=vis.filter(m=>entityDistance57(m,state.player)<=1),items=state.items.filter(i=>i.x===state.player.x&&i.y===state.player.y),stairs=state.player.x===state.stairs.x&&state.player.y===state.stairs.y,boss=vis.find(m=>m.boss);const sb=document.getElementById('mfState'),tb=document.getElementById('mfThreat'),gb=document.getElementById('mfGround'),ab=document.getElementById('mfAction');if(sb){const engaged=vis.length>0;sb.classList.toggle('warn',engaged);sb.classList.toggle('good',!engaged);sb.querySelector('.v').textContent=engaged?(adj.length?'교전':'경계'):'탐색';sb.querySelector('.s').textContent=engaged?(adj.length?'즉시 공격 거리':'시야 내 위협'):`${regionFor(state.floor)[2]} · ${state.layoutName||''}`}if(tb){tb.classList.toggle('warn',vis.length>0);tb.querySelector('.v').textContent=boss?`보스 ${boss.name}`:`적 ${vis.length}`;tb.querySelector('.s').textContent=`인접 ${adj.length} · HP ${displayHealth(state.player.hp)}/${displayHealth(state.player.maxHp)}`}if(gb){gb.querySelector('.v').textContent=items[0]?.name||(stairs?'계단':'빈 바닥');gb.querySelector('.s').textContent=items.length?`습득 ${items.length}개`:(stairs?'다음 층으로 이동 가능':tileName(state.player.x,state.player.y))}if(ab){ab.querySelector('.v').textContent=adj.length?'공격':items.length?'줍기':stairs?'하강':'이동';ab.querySelector('.s').textContent=`공격 ${attackTurnCost().toFixed(1)}턴 · 점멸 ${(state.player.blinkLevel||0)>0?'가능':'없음'}`}}
  function beginTarget(item){potionTarget={item,range:item.throwRange||4};closeInventory();ph.classList.add('show');syncWorldTargetInput();document.getElementById('potionTargetName').textContent=(item.type==='potion'&&item.throwable&&!globalThis.__MANRU_CONSUMABLE56_ACTIONS__?.knownPotion?.(item)?(globalThis.__MANRU_CONSUMABLE56_ACTIONS__?.publicName?.(item)||item.name):item.name)+' 투척';cancelAutoWalk();toast(`${item.name}: 목표 지점을 지정하라.`)}
function cancelTarget(silent=false){potionTarget=null;ph.classList.remove('show');syncWorldTargetInput();endTargetInput57(320);if(!silent)toast('투척을 취소했다.')}
/* ===== MANRU v3.2 UI + TITLE GRAND ORNAMENT PASS ===== */
function decorateTitle(){
    const card=document.getElementById('card');
    if(!card||card.dataset.mfDecorated==='1') return;
    card.dataset.mfDecorated='1';
    const frame=document.createElement('div');
    frame.className='mf-title-frame';
    frame.innerHTML=`
      <div class="mf-title-corner tl"></div><div class="mf-title-corner tr"></div>
      <div class="mf-title-corner bl"></div><div class="mf-title-corner br"></div>
      <div class="mf-header-rail"><i></i><i></i><b>만 루</b><i></i><i></i></div>
      <div class="mf-footer-rail"><i></i><i></i><b>ROGUELIKE</b><i></i><i></i></div>
      <div class="mf-side-banner left"><div class="sig">루</div><div class="sub">바람</div></div>
      <div class="mf-side-banner right"><div class="sig">밤</div><div class="sub">그림자</div></div>`;
    card.prepend(frame);

    const sub=card.querySelector('.sub');
    if(sub&&!card.querySelector('.mf-title-emblems')){
      const emblems=document.createElement('div');
      emblems.className='mf-title-emblems';
      emblems.innerHTML=`<div class="seal">객</div><div class="knot"><i></i></div><div class="seal">전투</div><div class="knot"><i></i></div><div class="seal">루</div>`;
      sub.insertAdjacentElement('afterend', emblems);
      const plate=document.createElement('div');
      plate.className='mf-subplate';
      plate.innerHTML=`<i></i><span>객 객주 · 요 괴 · 비 밀 · 전 술</span><i></i>`;
      emblems.insertAdjacentElement('afterend', plate);
    }
    const hint=card.querySelector('.startHint');
    if(hint&&!card.querySelector('.pixelBadge')){
      const badge=document.createElement('div');
      badge.className='pixelBadge';
      badge.textContent='턴제 · 자동탐사 · HD 픽셀';
      hint.insertAdjacentElement('beforebegin',badge);
    }
  }
  function decorateButtonGroups(root=document){
    root.querySelectorAll('#startGate button,.invActions button,.invTab,.classBtn,#zoomHud button,#mobileHud .mButtons button,#mobileControls button,.cipherKeys button,.cipherActions button,.martialCard button').forEach(btn=>{
      if(btn.dataset.mfGlyphDone==='1') return;
      btn.dataset.mfGlyphDone='1';
      if(btn.matches('#startGate .enterBtn')&&!btn.querySelector('.mfBtnMark')) btn.insertAdjacentHTML('beforeend','<span class="mfBtnMark" style="position:absolute;right:9px;top:8px;font:900 calc(14px * var(--ui-font-scale, 1)) Georgia,serif;color:#7f5a38;pointer-events:none">문</span>');
      else if(btn.matches('#startGate .continueBtn')&&!btn.querySelector('.mfBtnMark')) btn.insertAdjacentHTML('beforeend','<span class="mfBtnMark" style="position:absolute;right:9px;top:8px;font:900 calc(14px * var(--ui-font-scale, 1)) Georgia,serif;color:#7f5a38;pointer-events:none">계속</span>');
      else if(btn.classList.contains('primary')&&!btn.querySelector('.mfBtnMark')) btn.insertAdjacentHTML('beforeend','<span class="mfBtnMark" style="position:absolute;right:8px;top:6px;font:900 calc(11px * var(--ui-font-scale, 1)) Georgia,serif;color:#7b5531;pointer-events:none">◆</span>');
    });
  }
/* ===== MANRU v3.4 UI SYSTEM PASS (high-readability roguelike inspired) ===== */
function labelSections(){
    const mapping={
      '생명 / 기':'VITAL',
      '능력':'STATS',
      '장비':'GEAR',
      '무술':'STYLE',
      '허기':'HUNGER',
      '주변':'AWARE',
    };
    document.querySelectorAll('#side .section h3').forEach(h=>{
      const t=h.textContent.trim();
      h.setAttribute('data-kor', mapping[t]||'LOG');
    });
  }
  const isDrawerOpen=()=>interactionActive8('mobileDrawer');
  const isInspectOpen=()=>interactionActive8('mobileInspect');
  const isMapOpen=()=>interactionActive8('mobileMapModal');
  function safeToResume(){
    if(!state||!UX.paused||viewerOpen()||cipherOpen)return false;
    if(UX.modalDirty||state.turn!==UX.paused.turn||state.player.x!==UX.paused.x||state.player.y!==UX.paused.y)return false;
    if(state.monsters.some(m=>isThreatVisibleToPlayer(m)&&entityDistance57(m,state.player)<=1))return false;
    return UX.paused.path?.length>0;
  }
  function resumeAutoMaybe(){
    document.body.classList.toggle('ux-modal-open',uiBlocking());
    if(UX.modalOpening)return;
    if(!safeToResume()){if(!viewerOpen()&&UX.modalDirty)UX.paused=null;return}
    const saved=UX.paused,generation14=RunLifecycle.generation();UX.paused=null;
    setTimeout(()=>{if(RunLifecycle.isCurrent(generation14)&&!uiBlocking()&&state&&!state.dead&&!state.victory)runAutoPath(saved.path,{...saved.meta,resumed:true})},90);
  }
  function finishModalOpening(){UX.modalOpening=false;document.body.classList.toggle('ux-modal-open',activeGameplayPanels57().length>0)}
  function finishViewerClose(){UX.modalOpening=false;UX.invEquipSlot=null;blockTap(170);document.body.classList.toggle('ux-modal-open',uiBlocking());resumeAutoMaybe()}
  function rememberInventoryScroll(tab=inventoryTab){
    const grid=document.querySelector('#inventory #uxGrid');
    if(grid)UX.invScrollByTab[tab]=Math.max(0,grid.scrollTop||0);
  }
  function countRole(x){return state.player.inventory.filter(i=>x==='all'||role47(i)===x).length}
  function selectedGear(){const slot=RuntimeState.ui.inventory?.invEquipSlot;if(slot){const it=state.player[slot];if(it&&['weapon','armor','cloak'].includes(it.type))return it}const it=state.player.inventory[inventorySelection];return it&&['weapon','armor','cloak'].includes(it.type)?it:null}
  function decorateInventory(){
    if(!inventoryOpen)return;const box=document.getElementById('inventory');if(!box)return;const defs=[['all','전체'],['gear','장비'],['recovery','회복'],['strategy','전술'],['relic','유물']],tabs=[...box.querySelectorAll('.uxTabs [data-invtab]')];tabs.forEach((b,i)=>{const d=defs[i];if(!d)return;b.dataset.invtab=d[0];if(b.firstChild)b.firstChild.nodeValue=d[1];const s=b.querySelector('span');if(s)s.textContent=countRole(d[0]);b.classList.toggle('active',inventoryTab===d[0])});
    box.querySelectorAll('[data-invslot]').forEach(el=>{const it=state.player.inventory[+el.dataset.invslot];if(!it)return;if(!el.querySelector('.uxRole47'))el.insertAdjacentHTML('beforeend',`<span class="uxRole47">${({gear:'장비',recovery:'회복',strategy:'전술',relic:'유물'})[role47(it)]||'기타'}</span>`);if(it.upgrade>0&&!el.querySelector('.uxPlus47'))el.insertAdjacentHTML('beforeend',`<span class="uxPlus47">+${it.upgrade}</span>`)});
    box.querySelectorAll('[data-uxeq]').forEach(el=>{const it=state.player[el.dataset.uxeq];if(it?.upgrade>0&&!el.querySelector('.uxPlus47'))el.insertAdjacentHTML('beforeend',`<span class="uxPlus47">+${it.upgrade}</span>`)});
    const meta=box.querySelector('.uxInvMeta');if(meta&&!meta.querySelector('.forge47'))meta.insertAdjacentHTML('beforeend',`<span class="forge47">인장 ${state.player.upgradeMarks||0}</span>`);
    const it=selectedGear(),actions=box.querySelector('.uxActions');if(it&&actions&&!it.artifactWeapon46&&(state.player.upgradeMarks||0)>0&&(it.upgrade||0)<3&&!actions.querySelector('.uxUpgradeAction47')){const b=document.createElement('button');b.className='uxUpgradeAction47';b.textContent=`개량 인장×${state.player.upgradeMarks}`;b.onclick=e=>{e.preventDefault();e.stopPropagation();return ActionDispatcher.dispatch({type:'UPGRADE_GEAR',args:[it],source:'inventory'}).value};actions.prepend(b)}
  }
  /* ---------- v4.8 inventory: stable five-role taxonomy, no category drift ---------- */
  const roleName={gear:'장비',recovery:'회복',strategy:'전술',relic:'유물',other:'기타'};
  function cleanInventory(){
    if(!inventoryOpen)return;const box=document.getElementById('inventory');if(!box)return;
    const tabs=[...box.querySelectorAll('.uxTabs [data-invtab]')],defs=[['all','전체'],['gear','장비'],['recovery','회복'],['strategy','전술'],['relic','유물']];
    tabs.forEach((b,i)=>{const d=defs[i];if(!d)return;b.dataset.invtab=d[0];b.childNodes[0].nodeValue=d[1];const n=b.querySelector('span');if(n)n.textContent=countRole(d[0])});
    box.querySelectorAll('[data-invslot]').forEach(el=>{const it=state.player.inventory[+el.dataset.invslot];if(!it)return;el.setAttribute('aria-label',`${it.name} · ${roleName[role47(it)]||'기타'}`)});
    const sub=box.querySelector('.uxInvHead small');if(sub)sub.textContent='장비 · 회복 · 전술 · 유물만 나눠서 관리 / 같은 소모품은 자동 중첩';
  }
  function titleCloudArt(seed){
    const c=document.createElement('canvas');c.width=480;c.height=108;const q=c.getContext('2d');
    for(let i=0;i<11;i++){const x=32+i*40,y=48+Math.sin(i*1.7+seed)*13,rx=46+(i%3)*17,ry=10+(i*7+seed)%14;q.save();q.translate(x,y);q.scale(rx,ry);const g=q.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#9ba9a43a');g.addColorStop(.5,'#7c92942b');g.addColorStop(1,'#7c929400');q.fillStyle=g;q.fillRect(-1,-1,2,2);q.restore();}
    return c;
  }
  function showClassPick(){requestGameFullscreen65();
    startGate.style.display='none';pickWrap.classList.add('show');document.body.classList.add('title-class-mode');
    renderClassGrid();
  }
  function showStartGate(){pickWrap.classList.remove('show');startGate.style.display='grid';document.body.classList.remove('title-class-mode')}
  function setText(id,v){v=displayText53(v);const e=document.getElementById(id);if(e&&e.textContent!==String(v))e.textContent=String(v)}
  function setHTML(id,v){const e=document.getElementById(id);if(e&&e.innerHTML!==v)e.innerHTML=v}
  function setWidth(id,v){const e=document.getElementById(id);if(e&&e.style.width!==v)e.style.width=v}
  function beginTalismanTarget(item){cancelAutoWalk();clearHeldInput53();closeInventory();V56.target={item,kind:item.talismanKind,range:item.targetRange||5,wasUnknown:!knownTalisman56(item)};targetHud.classList.add('show');syncWorldTargetInput();document.getElementById('talismanTargetTitle').textContent=`${publicTalismanName56(item)} · ${publicTalismanSeal56(item)}`;document.getElementById('talismanTargetText').textContent=knownTalisman56(item)?(item.talismanKind==='blink'?`본 안전 칸 · 사거리 ${V56.target.range}`:`목표 중심 3×3 · 사거리 ${V56.target.range}`):'성질 미확인 · 본 칸 하나를 지정';drawMap(true)}
  function cancelTalismanTarget(silent=false){V56.target=null;targetHud.classList.remove('show');syncWorldTargetInput();endTargetInput57(320);if(!silent)toast('부적 사용을 취소했다.');drawMap(true)}
function renderCooking(){document.getElementById('cookStation57').textContent=V57.cookSource==='brazier'?'화로 · 날것을 굽거나 비방을 조리한다':`솥 · 최대 ${COOKING_INGREDIENT_LIMIT57}종 재료를 실험한다`;const a=eligibleCooking(),sel=selectedCooking(),rec=matchRecipe(sel),allKnown=sel.every(v=>isPotionKindVisible(v.item));document.getElementById('cookPreview57').innerHTML=!sel.length?`재료를 최대 ${COOKING_INGREDIENT_LIMIT57}종 고르시오.`:rec?(state.cookbook57[rec.id]&&allKnown?`예상 결과 · <b>${rec.name}</b> ${(rec.yield||1)}개`:'재료가 반응한다. 조리하면 정체를 알 수 있다.'):'맞는 비방이 보이지 않는다. 그대로 조리하면 <b>검게 탄 숯</b>이 된다.';const inv=document.getElementById('cookInv57');inv.innerHTML=a.length?a.map(({item,idx})=>`<button class="cookItem57 ${V57.selected.has(idx)?'sel':''}" data-cook57="${idx}">${typeof vfIconHtml==='function'?vfIconHtml(item,'small'):''}<b>${cookingName(item)}</b><span>${item.count||1}개</span></button>`).join(''):'<div style="grid-column:1/-1;padding:24px;text-align:center;color:#7e674e">조리할 재료가 없다.</div>';inv.querySelectorAll('[data-cook57]').forEach(b=>b.onclick=()=>{const idx=+b.dataset.cook57;if(V57.selected.has(idx))V57.selected.delete(idx);else if(V57.selected.size<COOKING_INGREDIENT_LIMIT57)V57.selected.add(idx);else toast(`재료는 최대 ${COOKING_INGREDIENT_LIMIT57}종까지 넣을 수 있다.`);renderCooking()});const book=document.getElementById('cookBookList57');book.innerHTML=FOOD_RECIPES.map(r=>state.cookbook57[r.id]?`<div><b style="color:#d7b77d">${r.name}</b> ${(r.yield||1)}개${r.stations?.length===1?` · ${r.stations[0]==='pot'?'솥 전용':'화로 전용'}`:''} · ${r.ingredients.map(key=>[key,...(r.alternatives?.[key]||[])].join(' 또는 ')).join(' + ')}</div>`:`<div>??? · ${r.hint}</div>`).join('')}
  function mapModalOpen(){return !!interactionActive8('mobileMapModal')}
function updateAll(flushFrame=false){if(state?.debugBattle57)return;summonUpdateButtons();
    if(!state)return;
    // Gameplay, FOV and saves remain synchronous. Paint only the final state
    // once in the existing animation frame, including rapid keyboard input.
    if(!flushFrame){renderUpdatePending=true;return}
    renderUpdatePending=false;R61.dirty=true;
    updatePanels();
    if(inventoryDirty&&inventoryOpen)renderInventory();
    drawMap(true);R61.last=performance.now();R61.dirty=false;
    if(mapModalOpen()||performance.now()-R61.lastMini>240){drawMinimap(true);R61.lastMini=performance.now()}
    const sk=document.getElementById('skillTxt');if(sk)sk.onclick=()=>InputRouter.dispatch({type:'CLASS_SKILL',source:'gameplay-hud'});
}
  function updateFeelingUI(){const f=feeling62();if(!f){feelEl.classList.remove('show');return}feelEl.innerHTML=`<b>${f.glyph}</b><span>${f.name}</span>`;feelEl.classList.add('show')}
  function beltItemGlyph(i){if(i.type==='talisman')return window.__MANRU_TALISMAN_PUBLIC__?.seal?.(i)||'부';if(i.type==='potion')return i.throwable?'병':'약';if(i.type==='food')return'식';return'물'}
  function renderBelt(){
    if(!state||state.dead||state.victory){belt.classList.remove('show');return}
    const a=beltItems(),pub=v=>globalThis.__MANRU_CONSUMABLE56_ACTIONS__?.publicName?.(v.item)||v.item.name;
    const sig=JSON.stringify(a.map(v=>[v.key,v.idx,pub(v),v.item.count||1]));
    if(sig===V62.beltSig&&belt.childElementCount===a.length){belt.classList.toggle('show',a.length>0);return}V62.beltSig=sig;
    const scroll=belt.scrollLeft;
    belt.innerHTML=a.map((v,n)=>`<button class="beltSlot62" data-belt62="${n}" aria-label="${escBelt(pub(v))}"><i>${n+1}</i><b>${escBelt(beltItemGlyph(v.item))}</b><small>${escBelt(pub(v))}</small>${(v.item.count||1)>1?`<em>×${v.item.count}</em>`:''}</button>`).join('');belt.classList.toggle('show',a.length>0);belt.scrollLeft=scroll;
    belt.querySelectorAll('[data-belt62]').forEach(b=>{const key=a[+b.dataset.belt62].key;b.onclick=e=>{e.preventDefault();e.stopPropagation();const v=beltItems().find(v=>v.key===key);if(v)ActionDispatcher.dispatch({type:'ITEM_USE',args:[v.idx]}).value}});
  }
  function applyTextScale(value,persist=false){
    const scale=[1,1.15,1.3,1.45].includes(Number(value))?Number(value):1;
    RC.textScale=scale;document.documentElement.style.setProperty('--ui-font-scale',String(scale));
    document.documentElement.toggleAttribute('data-ui-text-large',scale>1);
    if(persist)lsSet('manruUiTextScale70',String(scale));
  }
  const AUTO_KEY='manruRC70_autosave';
  function restoreState(st){
    st=GameState.migrate(st);validateSaveState(st);
    // Current saves already own their finalized visual-decor state. Rebuilding vfBuildDecor here
    // discards saved architecture/theme props after the geometry has already been finalized.
    // Only legacy saves that genuinely lack a decor array need the reconstruction fallback.
    const hasSavedDecor70=Array.isArray(st.decor);
    state=GameState.initialize(structuredClone(st));globalThis.__MANRU_CONSUMABLE56_ACTIONS__.initializeKnowledge();state._manualRangedTargetR8=null;state.playerAgencyTurns57=Number.isFinite(state.playerAgencyTurns57)?state.playerAgencyTurns57:0;normalizeClassState58(state.player,state.playerAgencyTurns57);normalizeHealthState58(state);
    ROWS=state.map?.length||ROWS;COLS=state.map?.[0]?.length||COLS;for(const wall of state.tempTerrain74||[])if(wall.rootWall105)delete wall.riseStarted105;
    state.seen=state.seen instanceof Set?state.seen:new Set(state.seen||[]);state.visible=new Set();state.grassTufts1020=state.grassTufts1020 instanceof Set?state.grassTufts1020:new Set(Array.isArray(state.grassTufts1020)?state.grassTufts1020:[]);
    if(state.branchWorld105?.canalFollowers105){summonPlaceFollowers105(state.branchWorld105.canalFollowers105);delete state.branchWorld105.canalFollowers105;}
    if(!state.branchContext105&&!state.artifactDungeon46&&!state.shopIntermission?.active&&[2,3,7,9,12,16].includes(state.floor)&&!state.branchPortals105.length)branchEntrance({required:false});
    if(state.branchContext105?.id==='palace')palaceApplyTide();
 if(state.branchContext105?.id==='mine'){mineEnsureEntrance();migrateMineAppearance105();}
    BRANCH_TILE_CACHE.clear();
    state.decals=state.decals||[];if(state.decals.length>24)state.decals.splice(0,state.decals.length-24);state.decor=state.decor||[];state.vaults=state.vaults||[];state.switches=state.switches||[];state.rafts=state.rafts||[];state.routeTags=state.routeTags||[];
    state.floorKeys=state.floorKeys||0;state.floorKeysRequired=state.floorKeysRequired||0;state.visionPenalty=state.visionPenalty||0;state.cipher=state.cipher||null;state.enemyEnergy=state.enemyEnergy||0;
    state.player=state.player||{};state.player.hunger=state.player.hunger??100;state.player.skillPoints=state.player.skillPoints??0;state.player.blinkLevel=state.player.blinkLevel??0;normalizePlayerProgression57(state.player);
    state.player.martial=Object.assign({strong:0,roar:0,ghost:0,brawl:0,constitution:0},state.player.martial||{});state.player.nextAttackAt=0;state.player.busyUntil=0;
    state.status=Object.assign({haste:0,weaken:0,evade:0,markCrit:0,poison:0,bleed:0,ward:0,stun:0,stealth:0,regen:0,upset:0,drunk:0,blind:0,skillSeal:0,swift:0,fortify:0,willBoost:0},state.status||{});if(!Number.isFinite(state.makgeolliRecoveryTurns57))state.makgeolliRecoveryTurns57=state.status.drunk||0;state.makgeolliHealHundredths57=Math.max(0,Math.min(99,Math.floor(Number(state.makgeolliHealHundredths57)||0)));if(state.status.drunk>0&&!Number.isFinite(state.drunkBornTurn57))state.drunkBornTurn57=state.turn;
    normalizeTerrainUnderlays();
    for(const mon of state.monsters||[])normalizeBoss(mon,{loading:true});
    document.body.classList.add('run-active');const ov=document.getElementById('overlay');if(ov)ov.style.display='none';
    normalizeShop();normalizeRunState57();migrateRetiredItems(state);normalizeItemContainers57();VisibilityService.compute();resetVisualState();resetTurnState();if(!hasSavedDecor70)vfBuildDecor();updateAll();return true;
  }
  function openReleasePanel(){if(!gameplayUiOpen57())return false;
    if(RC.panelOpen)return;cancelAutoWalk();RC.panelOpen=true;panel.classList.add('open');document.body.classList.add('rc70-open');window.__MANRU_PAUSE_RENDER61=true;refreshSlots();refreshSfx();uiTone70(520,.035);
  }
  function closeReleasePanel(){
    if(!RC.panelOpen)return;RC.panelOpen=false;panel.classList.remove('open');document.body.classList.remove('rc70-open');window.__MANRU_PAUSE_RENDER61=false;RC.lastActionAt=performance.now();if(state)updateAll();
  }
  function markTip(id){const ledger=tipLedger66();ledger.seen[id]=true;lsSet('manruTutorialAccount66',JSON.stringify(ledger));if(state)(state.tutorialSeen59||(state.tutorialSeen59={}))[id]=true}
  function closeCurrentTip(silent=false){
    if(!RC.tutorialShowing){if(silent){RC.tutorialQueue=[];clearTimeout(coachTimer)}return}if(!silent&&!coachCurrent.repeatable)markTip(coachCurrent.id);setInteraction8('coach70',false);coach.classList.remove('show');RC.tutorialShowing=false;coachCurrent=null;clearHeldInput53();endTargetInput57(180);if(coachFocus?.isConnected)coachFocus.focus({preventScroll:true});coachFocus=null;if(silent){RC.tutorialQueue=[];clearTimeout(coachTimer)}else coachTimer=setTimeout(pumpTip,200);
  }
  function pumpTip(){
    clearTimeout(coachTimer);if(RC.tutorialShowing||!RC.tutorialQueue.length)return;
    RC.tutorialQueue=RC.tutorialQueue.filter(t=>t.run===state?.runId984);if(!RC.tutorialQueue.length)return;
    if(!state||state.dead||state.victory)return;
    if(state.story992?.dispatchPending60||RC.panelOpen||activeGameplayPanels57().length||actionPresentationBusy58()||state._turnPipelineActive57||document.body.dataset.manruScreen!=='game'){coachTimer=setTimeout(pumpTip,180);return}
    const t=RC.tutorialQueue.shift();if(!t.repeatable&&seenTip70(t.id)&&!t.resume66){coachTimer=setTimeout(pumpTip,0);return}coachCurrent=t;RC.tutorialShowing=true;coachFocus=document.activeElement;cancelAutoWalk();clearHeldInput53();
    const titles={floor5:'첫 수문장 앞에서',floor6:'달라진 만루, 수묵원',floor11:'영악한 괴물, 강해진 회복력',start:'한 걸음이 한 수다',bag:'준비한 물건이 살린다',potion:'색만으로 믿지 마라',talisman:'위기를 뒤집는 한 장',food:'허기를 먼저 살펴라',bow:'사선을 읽고 쏴라',door:'문 너머를 준비하라',throw:'전장을 바꾸는 약병',resume:'다시, 만루 안으로',martial:'무술을 다듬는 법',combat:'첫 교전, 거리를 읽어라',recovery:'상처를 돌보는 시간',level:'한 단계 강해졌다',stairs:'내려가기 전에',hunger:'허기를 놓치지 마라',entry_exit:'전실을 나서기 전에'};
    coach.innerHTML='<section class="coachSheet58"><span class="uiCorners63" aria-hidden="true"></span><button id="coachClose58" aria-label="안내 닫기">×</button><div class="coachEyebrow58">만루 · 조사관의 수첩</div><h2 id="coachTitle58"></h2><p id="coachText58"></p><small id="coachSub58"></small><footer class="coachFoot58"><small>닫기 × / Esc</small><button id="coachContinue58">확인 · 계속</button></footer></section>';
    coach.querySelector('#coachTitle58').textContent=t.title||titles[t.id]||'알아두면 살아남는다';coach.querySelector('#coachText58').textContent=t.text;coach.querySelector('#coachSub58').textContent=t.sub;
    coach.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();closeCurrentTip()});setInteraction8('coach70',true);coach.style.removeProperty('display');coach.classList.add('show');if(!t.repeatable)markTip(t.id);coach.querySelector('#coachContinue58').focus({preventScroll:true});uiTone70(620,.05);
  }
  function suspendTips(){
    if(RC.tutorialShowing){const t=coachCurrent;setInteraction8('coach70',false);coach.classList.remove('show');RC.tutorialShowing=false;coachCurrent=null;coachFocus=null;RC.tutorialQueue.unshift({...t,resume66:true})}
    clearTimeout(coachTimer);coachTimer=setTimeout(pumpTip,180);
  }
  /* ---------- settings buttons ---------- */
  function sfxOn(){try{return lsGet('manruSfx54')!=='0'}catch(_){return true}}
  function refreshSfx(){const b=document.getElementById('rcSfx70');if(b)b.textContent=`게임 효과음 ${sfxOn()?'ON':'OFF'}`;const h=document.getElementById('rcHaptic70');if(h){const on=vibrationEnabled();h.textContent=`진동 ${on?'ON':'OFF'}`;h.setAttribute('aria-pressed',on?'true':'false')}const r=document.getElementById('rcUiVol70');if(r)r.value=String(RC.uiVolume)}
  function refreshContinueStatus(){
    RunLifecycle.refreshContinue();
    const st=document.getElementById('rcStorage70');if(st)st.textContent=RC.storagePersistent?'· 영구 저장 가능':'· 브라우저 영구 저장 제한: 내보내기 사용';
  }
  function renderGear(){const s=V74.gearScroll,host=document.getElementById('gear74body');if(!s){host.innerHTML='';return}document.getElementById('gear74title').textContent=['upgrade','reinforce105'].includes(s.talismanKind)?`${s.name} · 장비 선택`:`${s.name} · 각인 대상`;document.getElementById('gear74sub').textContent=s.talismanKind==='upgrade'?'강화 횟수 제한 없음 · 방어구는 초반 약 +1.8~2.0 DEF에서 시작해 강화할수록 회당 상승량이 점차 감소 · 내부 계산은 소수, 표시는 정수 반올림 · 권갑은 3강마다 실질 ATK +1 · 소환술서는 소모 HP·기운 회복 시간 감소(강화할수록 감소 폭이 작아짐) · 이전 강화는 반환되지 않음.':'장비 각인은 무기 1개 / 방어구 1개만 유지되며 새 각인이 기존 각인을 교체한다. 성광 각인은 무기 언데드 추가피해 +5, 방어구 언데드 직접피해 15% 감소.';const entries=gearEntries().filter(v=>(s.talismanKind!=='upgrade'||playerClassRules58().upgradeTalismanMode!=='bodyBoost'||v.item.summonItem105==='book')&&(s.talismanKind!=='reinforce105'||(!v.item.artifactWeapon46&&(v.item.tier||1)<=2)));if(s.talismanKind==='reinforce105')document.getElementById('gear74sub').textContent='T2 이하 무기·방어구만 +1 강화 · 일반 강화와 같은 효과 · 천하장사도 장비에 사용';host.innerHTML=`<div class="f74gear">${entries.map((v,n)=>{const e=E74[v.item.elementBrand74||v.item.elementGuard74];return`<button data-g74="${n}"><b>${esc74(v.item.name)} ${v.item.upgrade?`+${v.item.upgrade}`:''}</b><small>${v.label} · ${v.item.summonItem105==='book'?'소환술서':v.item.type==='weapon'?'무기':'방어구'}</small>${e?`<div class="f74brand">현재 ${e.name} 각인</div>`:''}</button>`}).join('')}</div>`;if(!entries.length)host.innerHTML='<div class="f74none">사용 가능한 T2 이하 무기·방어구가 없다. 부적은 소비되지 않았다.</div>';host.querySelectorAll('[data-g74]').forEach(b=>b.onclick=()=>ActionDispatcher.dispatch({type:'GEAR_APPLY',args:[entries[+b.dataset.g74]]}).value);if(s.talismanKind==='upgrade'&&playerClassRules58().upgradeTalismanMode==='bodyBoost'){const power=document.createElement('button');power.textContent='육체에 괴력 부여';power.onclick=()=>{closeGear();useBodyPower74(s);};host.append(power);}}
  function cancelTalismanTargeting(silent=false){V74.target=null;targetHud74()?.classList.remove('show');syncWorldTargetInput();endTargetInput57(320);if(!silent)toast('부적 사용을 취소했다.');drawMap(true)}
  const isGameplayInputBlocked=()=>!gameplayInputAllowed57();
  /* ---------------- mobile controls: one owner, no duplicate touch/click stack ---------------- */
  function stopHeldInput(){
    clearTimeout(Runtime81.repeatDelay);clearInterval(Runtime81.repeatTick);Runtime81.repeatDelay=Runtime81.repeatTick=0;
    if(Runtime81.held?.btn)Runtime81.held.btn.classList.remove('rt81-pressed');Runtime81.held=null;
  }
  /* ---------------- mobile map input: tap destination, drag camera, hold inspect, pinch zoom ---------------- */
  function placeInput(){
    const input=Runtime81.input;if(!input)return;
    if(!state||state.debugBattle57||runState57()!=='playing'){input.style.display='none';input.style.pointerEvents='none';return;}
    const r=C.getBoundingClientRect();
    input.style.display='block';input.style.left=r.left+'px';input.style.top=r.top+'px';input.style.width=r.width+'px';input.style.height=r.height+'px';input.style.pointerEvents=targeting81()?'none':'auto';
  }
  /* ---------------- compact viewport controls, no feature banner ---------------- */
  function cleanViewportUI(){
    const hud=document.getElementById('zoomHud');if(hud){
      const rebindZoom=(id,key,title)=>{const old=document.getElementById(id);if(!old)return;const b=old.cloneNode(true);old.replaceWith(b);b.title=title;b.onclick=e=>{e.preventDefault();e.stopPropagation();ClientEnvironment.emit({type:'CAMERA_ZOOM',delta:key==='+'?1:-1,source:'zoom-hud'})}};
      rebindZoom('zoomOutBtn','-','축소');rebindZoom('zoomInBtn','+','확대');
      let center=document.getElementById('cameraCenterBtn');if(!center){center=document.createElement('button');center.id='cameraCenterBtn';center.textContent='◎';hud.appendChild(center)}
      const fresh=center.cloneNode(true);center.replaceWith(fresh);fresh.title='플레이어에게 시점 복귀';fresh.onclick=e=>{e.preventDefault();e.stopPropagation();ClientEnvironment.emit({type:'CAMERA_CENTER',source:'zoom-hud'})};
      hud.setAttribute('aria-label','시점과 확대');
    }
    const autoTop=document.getElementById('mobileAutoBtn');if(autoTop){const b=autoTop.cloneNode(true);autoTop.replaceWith(b);b.onclick=e=>{e.preventDefault();ClientEnvironment.emit({type:'AUTO_EXPLORE',source:'mobile-hud'})}}
  }
  // Polished title motion: lantern glows and mist breathe asynchronously without redrawing the atlas each frame.
  function titlePolish(){const w=document.querySelector('.titleWorld');if(!w||w.querySelector('.titleGlow94'))return;const layer=document.createElement('div');layer.className='titleGlow94';layer.innerHTML='<i style="--x:23%;--y:33%;--d:0s"></i><i style="--x:78%;--y:39%;--d:-.8s"></i><i style="--x:31%;--y:58%;--d:-1.7s"></i><i style="--x:70%;--y:70%;--d:-2.4s"></i><i class="hero" style="--x:50%;--y:83%;--d:-1.1s"></i><b></b>';w.appendChild(layer)}
  /* v9.6.2 DESKTOP INTEL PANEL */
  function buildDesktopSide(){
    const side=document.getElementById('side');if(!side||side.dataset.v962==='1')return;side.dataset.v962='1';
    side.innerHTML=`<button class="uxClose" id="mobileClosePanel" type="button" aria-label="닫기" style="display:none">×</button>
      <div class="d962Head"><div><span>만루 탐사 기록</span><b id="regionTxt">---</b></div><strong id="floorTxt">제 -- 층</strong></div>
      <div class="d962Sub"><span id="depthLore">---</span><span id="turnTxt">TURN --</span></div>
      <div class="d962Vitals">
        <div><label>생명 <span id="hpTxt">--/--</span></label><i><em id="hpFill"></em></i></div>
        <div><label>기력 <span id="manaTxt">--/--</span></label><i><em id="manaFill"></em></i></div>
        <div><label>경험 <span id="xpTxt">--</span></label><i><em id="xpFill"></em></i></div>
        <div><label>허기 <span id="alertTxt">--</span></label><i><em id="alertFill"></em></i></div>
      </div>
      <section class="d962Radar"><header><b>능력치</b><span>현재 장비 포함</span></header><svg id="desktopRadar962" viewBox="0 0 220 190" aria-label="능력치 육각형"></svg></section>
      <section class="d962Keys"><header><b>열쇠 / 봉쇄</b><span id="desktopKeyCount962">---</span></header><div id="desktopKeyStatus962"></div></section>
      <section class="d962Equip"><header><b>장비</b></header><div class="d962Eq"><span>무기</span><b id="weaponTxt">---</b><span>갑옷</span><b id="armorTxt">---</b><span>망토</span><b id="cloakTxt">---</b><span>유물</span><b id="relicTxt">---</b><span>장신구</span><b id="trinketTxt">---</b></div></section>
      <section class="d962Around"><header><b>주변 / 상태</b></header><div id="monsterInfo">주변 생체 반응 없음.</div><div id="statusLine">---</div></section>
      <section class="d962Martial"><header><b>무술</b></header><div id="skillTxt">---</div></section>
      <div class="d962Hint">WASD 이동 · C 문닫기 · 클릭 자동이동 · 드래그 시점 · ◎ 복귀</div>`;
  }
  function radarPoint(cx,cy,r,i,n=6){const a=-Math.PI/2+i*Math.PI*2/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]}
  function updateRadar(){
    const svg=document.getElementById('desktopRadar962');if(!svg||!state)return;const st=getStats(),values=[st.atk,st.def,st.eva,st.will,st.vision,st.maxFocus],steps=[20,12,12,10,12,18],scales=steps.map((step,i)=>step*Math.max(1,Math.ceil(values[i]/step))),vals=values.map((v,i)=>clamp(v/scales[i],0,1));
    const labs=['공격','방어','회피','의지','시야','기력'],cx=110,cy=94,R=64;
    const poly=r=>Array.from({length:6},(_,i)=>radarPoint(cx,cy,R*r,i).map(v=>v.toFixed(1)).join(',')).join(' ');
    const val=vals.map((v,i)=>radarPoint(cx,cy,R*v,i).map(q=>q.toFixed(1)).join(',')).join(' ');
    let axes='';for(let i=0;i<6;i++){const [x,y]=radarPoint(cx,cy,R,i);const [lx,ly]=radarPoint(cx,cy,R+18,i);axes+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/><text x="${lx}" y="${ly-1}" text-anchor="middle"><title>${labs[i]} ${displayNumber53(values[i])} · 눈금 최대 ${scales[i]}</title><tspan x="${lx}">${labs[i]}</tspan><tspan x="${lx}" dy="11">${displayNumber53(values[i])}</tspan></text>`}
    svg.setAttribute('aria-label',labs.map((label,i)=>label+' '+displayNumber53(values[i])).join(' · '));svg.innerHTML=`<g class="grid"><polygon points="${poly(1)}"/><polygon points="${poly(.66)}"/><polygon points="${poly(.33)}"/>${axes}</g><polygon class="value" points="${val}"/><circle cx="${cx}" cy="${cy}" r="2"/>`;
  }
  function updateKeys(){
    const box=document.getElementById('desktopKeyStatus962'),count=document.getElementById('desktopKeyCount962');if(!box||!count||!state)return;
    const plan=state.keyPlan96;if(plan?.groups?.length){const ids=[...new Set(plan.groups.map(g=>g.keyId))];let total=0,closed=0;box.innerHTML=ids.map(id=>{const meta=globalThis.__MANRU_TYPED_KEYS__?.meta?.(id)||keyMeta96(id),have=plan.ring?.[id]||0,doors=plan.groups.filter(g=>g.keyId===id).flatMap(g=>g.doors||[]),left=doors.filter(d=>!d.open&&state.map[d.y]?.[d.x]===TT.LOCKED_GATE).length;total+=have;closed+=left;return`<div class="d962Key"><i style="--kc:${meta.color}"></i><span><b>${meta.name}</b><small>${left?`잠긴 문 ${left}`:'해제됨'}</small></span><strong>×${have}</strong></div>`}).join('');count.textContent=`보유 ${total} · 잠금 ${closed}`;return}
    if((state.floorKeysRequired||0)>0){const nm=legacyKeyLabel(),released=state.floor===6&&state.f6LibraryGateR8&&state.map?.[state.f6LibraryGateR8.y]?.[state.f6LibraryGateR8.x]!==TT.LOCKED_GATE,sub=released?'봉인 고문서고 · 해제됨':state.floor===6?'봉인 고문서고':'구역 봉쇄';box.innerHTML=`<div class="d962Key"><i style="--kc:#c1aa7b"></i><span><b>${nm}</b><small>${sub}</small></span><strong>${released?'해제':`${state.floorKeys||0}/${state.floorKeysRequired}`}</strong></div>`;count.textContent=sub;return}
    box.innerHTML='<div class="d962None">현재 층에 확인된 잠금 없음</div>';count.textContent='자유 통행';
  }
  function refreshDoorContext(){
    if(!state)return;const p=state.player,onStairs=p.x===state.stairs.x&&p.y===state.stairs.y,hasItem=(state.items||[]).some(i=>i.x===p.x&&i.y===p.y),closable=openDoorCandidates964().some(d=>!doorCloseBlock964(d.x,d.y));
    const stock=ShopMapBuilder.groundAt(p.x,p.y),bed=dojoAdjacentBed(),anvil=citadelAdjacentAnvil(),pushable=adjacentPushable105(),silk=adjacentSilkTrap57(),merchant=adjacentMerchant58(),gate=palaceGateNearby(),branch=adjacentBranchPortal105(),label=document.getElementById('contextActionLabel'),btn=document.getElementById('contextActionBtn'),actionable=!!stock||!!bed||!!merchant||!!silk||!!gate||!!branch||onStairs||hasItem||!!anvil||!!pushable||closable;if(label)label.textContent=stock?'구매':dojoSleeping()?'잠듦':bed?'취침':merchant?'교환':silk?'함정해제':gate?'수문':branch?'출입':onStairs?'내려감':hasItem?'줍기':anvil?'장비 합성':pushable?'밀기':closable?'문닫기':'상호작용';
    if(btn){btn.classList.toggle('available',actionable);btn.disabled=!actionable;btn.title=stock?'발밑 진열품 구매 확인':bed?'침상에서 잠들어 회복 (최대 50턴)':merchant?'행낭 물품 판매':silk?'인접 비단 함정 해제 (1턴)':gate?`${gate.label} · 이 방 배수 6턴 / 재사용 16턴`:branch?`${branch.label} · F 또는 상호작용 버튼으로 출입` :onStairs?'다음 층':hasItem?'줍기':anvil?'모루에서 같은 장비 두 개 합성':pushable?'밀기':closable?'인접 열린 문 닫기':'현재 상호작용 대상 없음';const b=btn.querySelector('b');if(b)b.textContent=stock?'買':bed?'眠':merchant?'교환':silk?'解':gate?'閥':branch?'入':onStairs?'降':hasItem?'拾':anvil?'合':pushable?'推':closable?'閉':'·'}
  }
  function textOnly(html){const d=document.createElement('div');d.innerHTML=String(html??'');return(d.textContent||d.innerText||'').replace(/\s+/g,' ').trim()}
  function directOpenInspect(title,html,target=null,previewItem=null){
    const canonicalTitle=title;title=displayText53(title);html=displayText53(html);
    const wrap=document.getElementById('mobileInspect'),titleEl=document.getElementById('inspectTitle'),bodyEl=document.getElementById('inspectBody');
    if(titleEl)titleEl.textContent=title;if(bodyEl)bodyEl.innerHTML=html;wrap?.classList.toggle('martialInspect105',!!bodyEl?.querySelector('.inspectMartials105'));
    pendingInspect984=target?{...target,at:performance.now()}:null;
    setInteraction8('mobileInspect',true);wrap?.setAttribute('aria-hidden','false');document.body.classList.add('manru-inspect-open');
    requestAnimationFrame(()=>{renderPreview(canonicalTitle,target,previewItem)});
  }
  function ensurePreview(){
    const card=document.querySelector('#mobileInspect .inspectCard');if(!card)return null;let box=document.getElementById('inspectPreview984');if(!box){box=document.createElement('div');box.id='inspectPreview984';const body=document.getElementById('inspectBody');card.insertBefore(box,body)}const body=document.getElementById('inspectBody');if(document.getElementById('mobileInspect')?.classList.contains('martialInspect105')){if(box.parentElement!==body)body.prepend(box);}else if(box.parentElement!==card)card.insertBefore(box,body);return box;
  }
  function renderPreview(title,target,itemOverride=null){
    const box=ensurePreview();if(!box)return;box.innerHTML='';delete box.dataset.redacted;
    if(target&&state){
      const ground=itemOverride||(state.items||[]).find(v=>v.x===target.x&&v.y===target.y);
      if(ground&&unidentifiedItem(ground)){
        if((ground.type==='potion'||ground.type==='talisman')&&typeof vfIconHtml==='function'){box.innerHTML=vfIconHtml(ground,'inspect984Icon');box.dataset.redacted='physical-only';return}
        const r=document.createElement('span');r.className='inspect984Rune';r.textContent='?';box.appendChild(r);box.dataset.redacted='unidentified';return;
      }
      const cv=document.createElement('canvas');cv.width=cv.height=96;box.appendChild(cv);const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
      const mon=state.monsters.find(m=>m.martialActor105&&m.x===target.x&&m.y===target.y&&isEntityObservableToPlayer57(m));if(mon){const sprite=globalThis.__MANRU_ACTOR_ART__?.monster(mon,0);if(sprite){cx.drawImage(sprite,16,12,64,72);return;}}
      try{const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),z=cam.zoom,dpr=VIEW.dpr||1,pad=.42,src=TILE*z*dpr*(1+pad*2),point=globalThis.__MANRU_CAMERA_PROJECTION12__.worldToViewport((target.x-pad)*TILE,(target.y-pad)*TILE,cam),sx=point.x*dpr,sy=point.y*dpr;cx.drawImage(C,sx,sy,src,src,0,0,96,96)}catch(_){cx.fillStyle='#130c08';cx.fillRect(0,0,96,96)}
      return;
    }
    const item=itemOverride||itemFromTitle986(title);if(item&&unidentifiedItem(item)&&item.type!=='potion'&&item.type!=='talisman'){const r=document.createElement('span');r.className='inspect984Rune';r.textContent='?';box.appendChild(r);box.dataset.redacted='unidentified';return}
    if(item&&typeof vfIconHtml==='function'){box.innerHTML=vfIconHtml(item,'inspect984Icon');if(unidentifiedItem(item))box.dataset.redacted='physical-only';return}
    const r=document.createElement('span');r.className='inspect984Rune';r.textContent=String(title||'?').trim().slice(0,1);box.appendChild(r);
  }
  function openChoice(title,sub,entries,command){modal.classList.remove('martialManual1005');if(!gameplayUiOpen57())return false;cancelAutoWalk();if(inventoryOpen)closeInventory();const list=modal.querySelector('#choice991List');modal.querySelector('#choice991Title').textContent=title;modal.querySelector('#choice991Sub').textContent=sub||'';list.innerHTML='';entries.forEach((e,n)=>{const it=e.item||e,b=document.createElement('button');b.className='choice991Row';let icon='';try{icon=typeof vfIconHtml==='function'?vfIconHtml(it,'choice991Visual'):''}catch(error){ignoreError('item icon renderer unavailable',error)}b.innerHTML=`<span class="choice991Icon">${icon||`<span class="choice991Fallback">${itemGlyph(it)}</span>`}</span><span><b>${displayName991(it)}</b><small>${e.equipped?'장착 중 · ':''}${isGearItem(it)?publicGearType(it.type):it.type==='potion'?'약병':it.type==='talisman'?'부적':'물품'}</small></span><i>선택</i>`;b.onclick=()=>{return ActionDispatcher.dispatch({...command,args:[e,...command.args],source:'item-choice'}).value};list.appendChild(b)});if(!entries.length)list.innerHTML='<div class="choice991Empty">선택할 물건이 없다.</div>';setInteraction8('choice991',true)}
  function openMartialManualChoice(pending){
    if(!gameplayUiOpen57())return false;cancelAutoWalk();if(inventoryOpen)closeInventory();
    modal.querySelector('#choice991Title').textContent='후천무술 선택';modal.querySelector('#choice991Sub').textContent='펼쳐진 가르침 중 하나를 고른다. 선택하면 비급을 소비한다. 잠시 덮어도 가르침은 바뀌지 않는다.';
    modal.classList.add('martialManual1005');const list=modal.querySelector('#choice991List');list.innerHTML='';pending.choices.forEach((c,index)=>{
      const p=structuredClone(state.player);if(c.form==='breakthrough')p.martialBreakthrough[c.id]=true;else p.martialForm[c.id]=c.form;
      const current=p.martial[c.id];if(c.form==='breakthrough')p.martial[c.id]=5;
      const v=martialPresentation(c.id,MARTIAL_INFO[c.id],p),b=document.createElement('button');b.className=martialCardClasses(c.id,p)+' martialChoice1005';b.dataset.manualSkill=c.id;b.dataset.manualForm=c.form;
      const note=c.form==='breakthrough'?`현재 ${current}단. 5단까지 수련할 길을 연다. 아래는 5단의 경지이며, 단계는 무술 포인트로 올린다.`:`쌓아 온 ${current}단의 수련을 이어, 이 무술로 바꾼다.`;
      b.innerHTML=martialCardContent(c.id,p,v.name+(c.form==='breakthrough'?' · 5단 돌파':''),note)+'<span class="upgrade991 manualSelect1005">선택</span>';
      b.onclick=()=>ActionDispatcher.dispatch({type:'MARTIAL_MANUAL_CHOICE',args:[index],source:'martial-manual'}).value;list.appendChild(b);
    });setInteraction8('choice991',true);return true;
  }
  function closeSkillQuickPanel(){quickOpen991=false;skillQuick.classList.remove('open');skillQuick.innerHTML=''}
  function renderSkillQuick(){const a=availableSkills991(),p=state.player;skillQuick.innerHTML=`<div class="skillQuickHead991"><b>사용 가능한 기술</b><small>짧게 다시 누르면 닫기 · <strong>길게 누르면 강화</strong></small></div><div class="skillQuickGrid991">${a.length?a.map(([id,v],index)=>`<button class="quickSkill991 skill-${v.visual||id} ${p.martial[id]===5?'martialTranscend1005':''} form-${martialFormOf(id,p)||'base'}" title="${v.desc}" data-skill991="${id}"><kbd>[${MARTIAL_RULES.keys[index].toUpperCase()}]</kbd><b>${v.name}</b><small>${p.martial[id]}단계 · 기 ${v.cost}</small></button>`).join(''):'<div class="skillQuickEmpty991">지금 바로 사용할 수 있는 기술이 없다.</div>'}</div>`;skillQuick.querySelectorAll('[data-skill991]').forEach(b=>b.oncontextmenu=e=>{e.preventDefault();const id=b.dataset.skill991,v=martialPresentation(id,MARTIAL_INFO[id],p);showInspect(v.name,v.desc)});skillQuick.querySelectorAll('[data-skill991]').forEach(b=>b.onclick=()=>{const id=b.dataset.skill991;closeSkillQuickPanel();ActionDispatcher.dispatch({type:'MARTIAL',args:[id]}).value})}
  function toggleSkillQuick(){if(!state||exclusiveGameplayInput())return;if(quickOpen991){closeSkillQuickPanel();return}if(martialOpen)closeMartial();quickOpen991=true;renderSkillQuick();skillQuick.classList.add('open');if(!state.skillHoldHint991){state.skillHoldHint991=true;toast('기술: 짧게=사용/닫기 · 길게=강화. 강화창은 ×로 닫는다.')}}
    function classArtSpanHtml(id){
    const canonical=globalThis.__MANRU_ACTOR_ART__;
    return canonical?.classPreviewData?canonical.classPreviewData(id):EMPTY_ACTOR1001;
  }
  function classPortraitHtml(id,role){
    const source=globalThis.__MANRU_ACTOR_ART__?.classPreview(id),frame=source?.actorFrame105||{x:0,y:0,w:32,h:36},resolution=source?.actorResolution105||1;
    const width=(source?.width||32)/resolution/frame.w*100,height=(source?.height||36)/resolution/frame.h*100;
    return `<span class="${role} pickClassArt1001" style="--class-art-left:${-frame.x/frame.w*100}%;--class-art-top:${-frame.y/frame.h*100}%;--class-art-width:${width}%;--class-art-height:${height}%"><img alt="" src="${classArtSpanHtml(id)}"></span>`;
  }
  function classLoadout(cls){
    const out=[{name:'경량복'}];
    if(cls.startWeapon)out.push({name:cls.startWeapon});
    for(const [name,count] of (cls.startItems||[]))out.push({name,count:count||1});
    return out;
  }
  function classItemHtml(it){const nm=(it.count||1)>1?`${it.name}×${it.count}`:it.name;return `<span class="classItem1001" data-item-name="${encodeURIComponent(it.name)}">${vfIconHtml(itemPrototype(it.name),'classStartIcon1001')}<span>${nm}</span></span>`}
  function classStatIcon(key){return `<svg class="pickStatIcon1001" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${CLASS1001_STAT_PATHS[key]}"></path></svg>`}
  // Static, deterministic timber backdrop; generated only on selection/size changes.
  function classWoodPanel(w,h){
    const c=document.createElement('canvas');c.width=w;c.height=h;const q=c.getContext('2d'),count=Math.ceil(w/54),board=w/count;
    const noise=(i,j)=>{let n=Math.imul(i+19,374761393)^Math.imul(j+7,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
    q.fillStyle='#160c07';q.fillRect(0,0,w,h);
    for(let i=0;i<count;i++){
      const x=Math.round(i*board),right=Math.round((i+1)*board),width=right-x,variation=Math.round(noise(i,0)*8),base=q.createLinearGradient(x,0,right,0);
      base.addColorStop(0,`rgb(${30+variation},${18+variation*.5},11)`);base.addColorStop(.20,`rgb(${48+variation},${29+variation*.5},17)`);base.addColorStop(.72,`rgb(${43+variation},${26+variation*.5},16)`);base.addColorStop(1,'#1b100a');q.fillStyle=base;q.fillRect(x,0,width,h);
      q.save();q.beginPath();q.rect(x+2,0,width-4,h);q.clip();
      const knotX=x+width*(.28+noise(i,2)*.42),knotY=h*(.22+noise(i,3)*.55),hasKnot=i%3===1;
      for(let line=0;line<19;line++){
        const gx=x+3+(width-6)*(line+.5)/19,phase=noise(i,line+20)*6.28;
        q.beginPath();for(let y=-12;y<h+14;y+=12){const bulge=hasKnot?Math.exp(-Math.pow((y-knotY)/23,2))*(gx<knotX?-1:1)*3.5:0,xx=gx+Math.sin(y*.028+phase)*(.6+noise(i,line+40)) +Math.sin(y*.073+phase)*.35+bulge;y===-12?q.moveTo(xx,y):q.lineTo(xx,y);}
        q.strokeStyle=line%3?'rgba(13,7,3,.28)':'rgba(174,109,59,.16)';q.lineWidth=line%4?.65:1;q.stroke();
      }
      if(hasKnot){for(let ring=4;ring>=1;ring--){q.beginPath();q.ellipse(knotX,knotY,ring*1.8,ring*4.3,.08,0,Math.PI*2);q.strokeStyle=ring%2?'#13090466':'#7d492a38';q.lineWidth=.8;q.stroke();}q.fillStyle='#170b06aa';q.beginPath();q.ellipse(knotX,knotY,1.4,3.1,.08,0,Math.PI*2);q.fill();}
      const joint=Math.round(h*(.28+noise(i,5)*.46));q.fillStyle='#0d070580';q.fillRect(x+2,joint,width-4,1);q.fillStyle='#9e63322a';q.fillRect(x+3,joint+1,width-6,1);
      for(const nx of [x+7,right-7]){q.fillStyle='#0c0806b0';q.fillRect(nx,joint+5,2,2);q.fillStyle='#ad885140';q.fillRect(nx,joint+5,1,1);}
      q.restore();q.fillStyle='#090503c0';q.fillRect(x,0,2,h);q.fillStyle='#b0794435';q.fillRect(x+2,0,1,h);
    }
    const shade=q.createRadialGradient(w*.5,h*.4,Math.min(w,h)*.14,w*.5,h*.43,Math.max(w,h)*.8);shade.addColorStop(0,'#06030100');shade.addColorStop(1,'#07040280');q.fillStyle=shade;q.fillRect(0,0,w,h);
    return c.toDataURL('image/png');
  }
  function prepareClassLighting(id){
    const stage=classDetail1001.querySelector('.pickStage1001'),source=globalThis.__MANRU_ACTOR_ART__?.classPreview(id);
    classLight1001={stage,source,last:-Infinity,reduced:null};if(!source)return;
    const w=source.width,h=source.height,mask=document.createElement('canvas'),rim=document.createElement('canvas');mask.width=rim.width=w;mask.height=rim.height=h;
    const m=mask.getContext('2d');m.drawImage(source,0,0);m.globalCompositeOperation='source-in';m.fillStyle='#130906';m.fillRect(0,0,w,h);
    const pixels=source.getContext('2d').getImageData(0,0,w,h),edge=rim.getContext('2d').createImageData(w,h);let foot=0,minX=w,maxX=0;
    const alpha=(x,y)=>x<0||x>=w||y<0||y>=h?0:pixels.data[(y*w+x)*4+3];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!alpha(x,y))continue;foot=Math.max(foot,y+1);minX=Math.min(minX,x);maxX=Math.max(maxX,x+1);const i=(y*w+x)*4;edge.data[i]=255;edge.data[i+1]=180;edge.data[i+2]=75;edge.data[i+3]=(!alpha(x-1,y)||!alpha(x+1,y))?alpha(x,y):0;}
    rim.getContext('2d').putImageData(edge,0,0);const tint=document.createElement('canvas');tint.width=w;tint.height=h;Object.assign(classLight1001,{mask,rim,tint,foot,minX,maxX});
  }
  function selectClass(id){
    const cls=CLASSES.find(c=>c.id===id);if(!cls)return;
    selectedClass1001=cls.id;const meta=CLASS1001_META[cls.id];
    pickWrap.style.setProperty('--class-accent',cls.color);
    for(const b of classGrid.children){const selected=b.dataset.classId===id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));b.tabIndex=selected?0:-1;}
    classDetail1001.dataset.classId=id;
    classDetail1001.innerHTML=`<div class="pickStage1001" aria-hidden="true"><div class="pickBackdrop1001"></div><canvas class="pickLightField1001"></canvas><canvas class="pickActorLight1001"></canvas><span class="pickStageLabel1001">萬樓 · ${String(CLASSES.indexOf(cls)+1).padStart(2,'0')} / 07</span><span class="pickStageSeal1001">${meta.seal}</span><span class="pickStageGlyph1001">${meta.seal}</span><i class="pickLantern1001 left"></i><i class="pickLantern1001 right"></i>${classPortraitHtml(id,'pickStageSprite1001')}<span class="pickStageCaption1001">등불 너머, 새로운 여정</span></div><div class="pickInfo1001"><p class="pickRole1001">${meta.role}</p><h2 class="pickName1001" id="classDetailName1001">${cls.name}</h2><p class="pickDesc1001">${cls.desc}</p><section class="pickSection1001" aria-label="시작 능력치"><h3 class="pickSectionTitle1001">시작 능력치</h3><dl class="pickStats1001">${CLASS1001_STATS.map(([key,label])=>`<div class="pickStat1001" data-stat="${key}"><dt>${classStatIcon(key)}<span>${label}</span></dt><dd>${cls[key]}</dd></div>`).join('')}</dl></section><section class="pickSection1001" aria-label="시작 장비"><h3 class="pickSectionTitle1001">시작 장비</h3><div class="classLoadoutItems1001">${classLoadout(cls).map(classItemHtml).join('')}</div></section></div>`;
    classDetail1001.scrollTop=0;
    prepareClassLighting(id);paintClassLighting(performance.now(),true);
    classStart1001.setAttribute('aria-label',`${cls.name} 신분으로 입장`);
  }
  function renderClassGrid(){
    classGrid.classList.add('classRoster1001');classGrid.setAttribute('role','group');classGrid.setAttribute('aria-label','직업 선택');
    classGrid.innerHTML='';
    for(const cls of CLASSES){const b=document.createElement('button');b.type='button';b.className='classBtn';b.id=`class-choice-${cls.id}`;b.dataset.classId=cls.id;b.innerHTML=`${classPortraitHtml(cls.id,'pickRosterSprite1001')}<span class="pickRosterName1001">${cls.name}</span>`;b.onclick=()=>selectClass(cls.id);classGrid.appendChild(b);}
    selectClass(selectedClass1001);
  }
  function setScreen(mode){
    SCREEN1002.mode=mode;
    document.body.dataset.manruScreen=mode;
    if(mode==='game'){
      // Retire title-selection state itself. It no longer survives invisibly behind gameplay.
      pickWrap?.classList.remove('show');document.body.classList.remove('title-class-mode','end-screen95');
      if(startGate)startGate.style.display='grid';
    }else if(mode==='title'){
      document.body.classList.remove('run-active','end-screen95');
    }
    OrientationGate.project();
    return mode;
  }
    /* ---------- visible real quit button ---------- */
    function ensureQuit(){
      // Permadeath has one rolling autosave only: remove legacy rollback/import surfaces entirely.
      const legacyBtn1003=['rcLoadAuto70','rcExport70','rcImport70'].map(id=>document.getElementById(id)).filter(Boolean);
      for(const b of legacyBtn1003){b.disabled=true;const sec=b.closest('.rc70Section');if(sec)sec.style.setProperty('display','none','important')}
      document.querySelectorAll('[data-rcsave],[data-rcload]').forEach(b=>{b.disabled=true;const sec=b.closest('.rc70Section');if(sec)sec.style.setProperty('display','none','important')});
      const head=document.querySelector('#releasePanel70 .rc70Head'),close=document.getElementById('rcClose70');if(head&&close&&!document.getElementById('quitHead1003')){const b=document.createElement('button');b.id='quitHead1003';b.type='button';b.textContent='게임 종료';head.insertBefore(b,close)}
      const body=document.querySelector('#releasePanel70 .rc70Body');if(body&&!document.getElementById('quitSection1003')){const sec=document.createElement('section');sec.id='quitSection1003';sec.className='rc70Section';sec.innerHTML='<h3>게임 종료</h3><div class="quitRow1003"><div class="quitCopy1003"><b>현재 탐사를 자동 저장한 뒤 게임을 종료한다.</b><small>자동 저장한 뒤 탐사를 마친다.</small></div><button id="quitGame1003" type="button">게임 종료</button></div>';body.appendChild(sec)}
      for(const id of ['quitHead1003','quitGame1003']){const b=document.getElementById(id);if(b&&!b.dataset.bound1003){b.dataset.bound1003='1';b.onclick=quitGame}}
    }
    function quitGame(){
      if(!confirm('게임을 종료할까? 현재 진행은 자동 저장된다.'))return;
      if(state&&!state.dead&&!state.victory){const result=globalThis.__MANRU_SAVE_SERVICE__.commit('quit');if(!result.ok){toast('기록 저장에 실패해 종료하지 않았다.');return}}
      try{sessionStorage.setItem('manru1003_explicit_quit','1')}catch(error){ignoreError('explicit-quit flag could not be stored',error)};
      try{window.close()}catch(error){ignoreError('window.close refused by the browser',error)};
      setTimeout(()=>{try{location.replace('about:blank')}catch(_){document.body.innerHTML='<main style="background:#050302;color:#b99b77;position:fixed;inset:0;display:grid;place-items:center;font:700 calc(14px * var(--ui-font-scale, 1)) system-ui">만루 종료됨</main>'}},80);
    }
function updateWardHud(){if(!hud||!state){hud.style.display='none';return}const d=remain('drown'),v=remain('void'),a=hud.querySelector('[data-w=drown]'),b=hud.querySelector('[data-w=void]');hud.style.display=d||v?'flex':'none';a.className=d?'hzWard1005 hzDrown1005':'';b.className=v?'hzWard1005 hzVoid1005':'';a.innerHTML=d?`<b>水</b> 익사 면역 ${d}턴`:'';b.innerHTML=v?`<b>空</b> 공허 면역 ${v}턴`:''}
function rumorNotice(r){if(!r)return false;let box=document.getElementById('rumorNotice1030');if(!box){box=document.createElement('div');box.id='rumorNotice1030';box.innerHTML='<small>숨은 공간 단서 확보</small><b></b><span></span>';document.body.appendChild(box)}const dir=rumorDirection(r),band=rumorDistanceBand(r),clue=rumorEntranceClue(r.entry.style);box.querySelector('b').textContent=r.type.name;box.querySelector('span').textContent=`현재 위치 기준 ${dir} · ${band} · ${withJosa57(clue,'을/를')} 조사하라`;box.classList.remove('show');void box.offsetWidth;box.classList.add('show');clearTimeout(box._tm1030);box._tm1030=setTimeout(()=>box.classList.remove('show'),2600);return true}
function summonPictureAsset(it){
 const key=KEY(it);if(PICTURE_ASSETS.has(key))return PICTURE_ASSETS.get(key);
 const c=document.createElement('canvas');c.width=96;c.height=112;const q=c.getContext('2d');q.imageSmoothingEnabled=false;
 const level=summonPictureGrade(it.pictureCopies105||1)+1,bronze='#8e693c',gold='#d8b76d',hi='#f5dfa0',dark='#2a201b',jade='#82bca5',amethyst='#be99d3';
 const accent=level===1?bronze:level===2?'#b7c6bc':level===3?jade:level===4?amethyst:gold;
 const r=(x,y,w,h,color)=>{q.fillStyle=color;q.fillRect(x,y,w,h)},stroke=(pts,color,width=1)=>{q.strokeStyle=color;q.lineWidth=width;q.lineJoin='round';q.lineCap='round';q.beginPath();pts.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.stroke()},diamond=(x,y,n,color)=>poly(q,color,[[x,y-n],[x+n,y],[x,y+n],[x-n,y]]);
 // Carved timber, inset brass bevels and two parchment layers leave the creature uncluttered.
 r(16,17,64,83,'#120e0b');r(18,18,60,80,'#503b29');r(19,19,58,77,'#9b7748');r(21,21,54,73,'#32251b');r(23,23,50,69,'#c6ad7d');
 const paper=q.createLinearGradient(25,26,69,87);paper.addColorStop(0,'#f3e4bd');paper.addColorStop(.48,'#ead4a7');paper.addColorStop(1,'#cdb27d');q.fillStyle=paper;q.fillRect(25,26,46,62);
 r(25,26,46,1,'#fff0cb');r(25,27,1,60,'#f6e6bf');r(70,28,1,60,'#b89b6b');r(27,87,43,1,'#a98e61');
 for(let i=0;i<19;i++){const x=27+(i*17)%41,y=30+(i*23)%54;r(x,y,1,i%3+1,i%2?'#b3955720':'#fff1ce50');}
 stroke([[27,81],[38,78],[43,80],[55,76],[68,79]],'#b39d6a42');stroke([[28,37],[37,33],[43,35]],'#fff4d32d');
 const mon=it.summonPortrait105,art=mon?globalThis.__MANRU_ACTOR_ART__.monster(mon,0):null;
 if(art){const scale=Math.min(42/art.width,46/art.height),w=Math.round(art.width*scale),h=Math.round(art.height*scale);q.drawImage(art,Math.round(48-w/2),Math.round(57-h/2),w,h);}
 r(59,75,9,9,'#8b4132');r(60,76,7,7,'#b96148');r(61,77,1,4,'#efd4a1');r(63,77,3,1,'#efd4a1');r(64,79,1,3,'#efd4a1');r(62,81,4,1,'#efd4a1');
 // Six grades combine the former small-step variants into visibly different carved, tasselled, jade, amethyst and crowned frames.
 for(const [x,y,dx,dy]of [[19,20,1,1],[76,20,-1,1],[19,94,1,-1],[76,94,-1,-1]]){
  stroke([[x,y+9*dy],[x,y],[x+9*dx,y]],bronze,3);stroke([[x+dx,y+8*dy],[x+dx,y+dy],[x+8*dx,y+dy]],hi);
  {r(x+2*dx-1,y+2*dy-1,3,3,dark);diamond(x+2*dx,y+2*dy,1.5,accent);}
  stroke([[x+4*dx,y+8*dy],[x+4*dx,y+4*dy],[x+8*dx,y+4*dy]],accent);
  if(level>=2)diamond(x+5*dx,y+5*dy,2,gold);
 }
 {r(28,18,40,2,bronze);r(29,19,38,1,'#d0b580');r(28,95,40,2,bronze);}
 {for(const x of [20,76]){r(x,33,1,48,accent);for(const y of [37,53,69])r(x-1,y,3,1,hi);}}
 if(level>=2){for(const x of [15,81]){stroke([[x,30],[x-3,34],[x,38],[x+3,42],[x,46]],dark,3);stroke([[x,30],[x-3,34],[x,38],[x+3,42],[x,46]],accent,1.3);diamond(x,50,3,accent);diamond(x,50,1,hi);}}
 if(level>=2){for(const x of [16,80]){stroke([[x,80],[x,98],[x-2,101],[x+2,104]],'#603e2e',2);r(x-3,103,6,6,'#8c3f35');r(x-2,103,4,1,gold);for(const dx of [-2,0,2])r(x+dx,106,1,5,'#c6744e');}stroke([[29,16],[39,13],[48,16],[57,13],[67,16]],bronze,2);}
 if(level>=3){for(const x of [12,84]){stroke([[x,58],[x-4,62],[x,67],[x+3,62],[x,58]],gold,1.5);diamond(x,62,2,jade);r(x,61,1,1,hi);}stroke([[30,99],[40,102],[48,99],[56,102],[66,99]],bronze,2);}
 if(level>=3){for(const sign of [-1,1]){q.save();q.translate(48,14);q.scale(sign,1);q.strokeStyle=gold;q.lineWidth=1.5;q.beginPath();q.moveTo(0,0);q.bezierCurveTo(7,-8,21,-10,26,-2);q.bezierCurveTo(32,7,17,10,19,3);q.stroke();q.strokeStyle=accent;q.lineWidth=1;q.beginPath();q.moveTo(0,-1);q.bezierCurveTo(9,-5,15,-5,22,-1);q.stroke();q.restore();}diamond(48,12,4,jade);diamond(48,11,1.5,hi);}
 if(level>=4){for(const sign of [-1,1]){q.save();q.translate(48,95);q.scale(sign,1);stroke([[5,4],[17,7],[25,4],[30,-5]],gold,1.5);poly(q,amethyst,[[19,4],[23,0],[26,4],[23,7]]);r(22,2,1,2,hi);q.restore();}stroke([[10,28],[7,39],[10,53],[7,74],[11,84]],accent,1);stroke([[86,28],[89,39],[86,53],[89,74],[85,84]],accent,1);}
 if(level>=5){for(const sign of [-1,1]){q.save();q.translate(48,13);q.scale(sign,1);poly(q,gold,[[5,-2],[13,-9],[23,-8],[30,-3],[23,-5],[18,-3],[26,1],[16,-1],[9,2]]);stroke([[12,-5],[22,-6],[28,-3]],hi);q.restore();}for(const x of [9,87])diamond(x,54,3,hi);}
 if(level>=6){q.strokeStyle=gold;q.lineWidth=1;q.beginPath();q.arc(48,11,9,Math.PI,Math.PI*2);q.stroke();for(const [x,y]of [[48,0],[39,3],[57,3]])diamond(x,y+2,2,hi);diamond(48,10,6,gold);diamond(48,10,3,'#a45e38');r(47,8,2,2,hi);stroke([[37,105],[43,107],[48,104],[53,107],[59,105]],gold,2);diamond(48,105,2,hi);}
 PICTURE_ASSETS.set(key,c);return c;
}
function palaceGaugeText(){const t=palaceTide(),w=palaceWorld(),room=state.branchTerrain105.palace105.roomCells[k(state.player.x,state.player.y)],h=palaceGateNearby(),g=w.gates[`${state.branchContext105.level}:${h?.room||room}`];const pending=state.monsters.find(mon=>mon.hp>0&&mon.intent54?.type==='palaceRoyal105'),warning=pending?` · 왕의 밀물 예고 ${Math.max(0,pending.intent54.data.resolveTurn105-state.turn)}턴 뒤` : '';return `수위 ${t.level} /  ${t.rising?'밀물 ↑':'썰물 ↓'} · 다음 ${t.next}${t.royal?' + 왕의 밀물':''} · ${t.remaining.toFixed(1)}턴`+warning+(t.royal?` · 왕의 밀물 ${t.royalRemaining.toFixed(1)}턴`:'')+(g?.until>w.time?` · 이 방 배수 ${Math.ceil(g.until-w.time)}턴`:g?.ready>w.time?` · 수문 재사용 ${Math.ceil(g.ready-w.time)}턴`:'');}
function palaceInspect(t,x,y){if(t===TT.PALACE_ROCK)return{name:'해련 바위벽',desc:'해련의 뿌리가 밀어 올린 갈색 바위벽. 실제로 솟은 칸에 겹친 적을 1턴 기절시키고, 다음 행동 뒤 무너져 주변 3×3에 대지 피해를 준다.',hint:'이동·시야·투사체·점멸을 막는다. 벽 하나의 기본 붕괴 피해는 해련 공격력 ×1.4이며, 여러 벽에 겹쳐 맞으면 피해가 중첩된다.'};const warning=palaceWarningInfo(x,y);if(warning)return warning;if(state?.branchContext105?.id!=='palace')return null;const restBed=state.branchTerrain105.palace105.beds105?.find(b=>b.x===x&&b.y===y&&!b.uses&&t===TT.BED);if(restBed)return{name:'용궁 회복 침상',desc:'도장 침상처럼 잠든 동안 상처가 아문다. 한 번 몸을 눕히면 낡은 틀이 부서져 다시 사용할 수 없다.',hint:`곁에서 상호작용. 매턴 최대 HP의 ${DOJO_BED_RULES.healFraction*100}% 회복(올림), ${DOJO_BED_RULES.wakeChance*100}% 확률로 기상. 최대 ${DOJO_BED_RULES.maxTurns}턴. 적과 허기는 계속 진행된다.`};const control=mineButton(x,y)||mineState()?.walls.some(w=>w.cells.some(c=>c.x===x&&c.y===y));if(control)return mineInspect(t,x,y);if(t===TT.PAPER_BRIDGE)return{name:'진주 종이다리',desc:'물길 위로 겹친 방수 종이 발판. 밟은 뒤 다음 실제 행동권 사용 후 붕괴하며 10턴 뒤 복구된다.',hint:'불·물 접촉과 붕괴·익사 판정은 기존 종이다리 규칙을 따른다.'};const d=state.branchTerrain105.palace105,key=k(x,y),w=d.windows[key],p=d.props[key],handle=d.handles.find(h=>h.x===x&&h.y===y);if(t===TT.PALACE_WALL_LAMP)return{name:'벽 부착 진주 등롱',desc:'청동 용두 받침으로 석벽에 걸린 진주 유리 등롱. 벽의 깊은 감실에서 따뜻한 빛이 난다.',hint:'석벽에 붙은 장식: 이동·시야·투사체를 막으며 통로를 차지하지 않는다.'};if(w&&t===TT.WALL)return{name:w.name,desc:'청동 격자와 석재 창턱 뒤로 흐린 산호와 푸른 수중 빛이 비친다. 벽에 파인 장식창이다.',hint:'석벽과 같은 이동·시야 차단. 창문을 관통할 수 없다.'};if(d.arches?.[key]&&!tileBlocks(t))return{name:d.arches[key].grand?'창해 정문 · 열린 홍예':'청동 문틀의 열린 통로',desc:'석재 기둥과 청동 인방 사이로 열린 궁전 통로. 문루의 처마 아래로 걸어갈 수 있다.',hint:palaceGaugeText()+' · 열린 통로는 이동과 투사체를 막지 않는다. 양옆 석벽과 기둥은 실제 장애물이다.'};if(d.facades?.[key]&&t===TT.WALL)return{name:d.facades[key].style.startsWith('gate')?'창해 문루의 석재 기둥·외벽':'궁전의 석재 외벽',desc:'윗면과 벽면, 기단이 연결된 두꺼운 석조 구조. 청동 장식과 옥색 기와가 남아 있다.',hint:'이동·시야·투사체를 막는다. 열린 홍예와 문을 이용한다.'};if(handle){const g=palaceWorld().gates[`${state.branchContext105.level}:${handle.room}`];return{name:handle.label,desc:'환류 수문을 조작해 표시된 방만 수위 한 단계 낮춘다.',hint:`조작 1턴 · 지속 6턴 · 재사용 16턴${g?.ready>palaceWorld().time?' · 재사용까지 '+Math.ceil(g.ready-palaceWorld().time)+'턴':''}`};}if(p&&p.tile===t)return{name:p.name,desc:p.desc||'용궁의 오래된 시설. 통로 주변에 배치되어 있다.',hint:tileBlocks(t)?'이동을 막는다. 보이는 물체와 충돌 판정이 같다.':'바닥 위의 작은 장식이다. 이동을 막지 않는다.'};if(d.permanentWater?.[key])return{name:'상시 수중 정원',desc:'조수와 무관하게 깊은 바닷물이 남는 야외 수역. 작은 수목원 섬과 목교가 실내 궁전으로 이어진다.',hint:'깊은 물: 기존 익사·수생·비행·구조 규칙. 끊긴 외원은 양끝 선착장에서 뗏목을 기다려 건넌다. 다른 수역에는 높은 돌길과 목교가 있다.'};if(d.floors[key]!=null){const height=d.floors[key],room=d.rooms.find(r=>r.id===d.roomCells[key]);return{name:`${room?.name||'용궁 회랑'} · 높이 ${height}`,desc:(state.branchContext105.level===2?['청보라 물결 바닥','푸른 보라 조개 바닥','진주빛 청보라 비늘 바닥','상아색 금테 석단']:['남청색 물결 바닥','청록색 조개 바닥','밝은 옥색 비늘 바닥','상아색 금테 석단'])[height],hint:palaceGaugeText()+' · '+(t===TT.SHALLOW_WATER?'얕은 물: 이동 시간 ×1.5':t===TT.WATER?'깊은 물: 기존 익사·구조 규칙':height===3?'항상 물 위의 석단':'수위와 높이 차이로 침수')};}return null;}
let dojoSleepNextFrame=0;
function dojoSleepFrame(now){if(!dojoSleeping()||state.dead||runState57()!=='playing'||!gameplayInputAllowed57()||now<dojoSleepNextFrame)return;dojoSleepNextFrame=now+DOJO_BED_RULES.intervalMs;globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,playerAgency:true,reason:'dojo-sleep'});}
function citadelReward(){
 const world=citadelWorld(),d=state.branchTerrain105?.citadel105,t=citadelTrialState();
 const ready=()=>!world.rewardClaimed&&state.branchContext105?.id==='citadel'&&state.branchContext105.level===1&&d?.trial105&&t.status==='active'&&state.turn<t.deadline&&t.seals.length===3&&entityDistance57(state.player,d.reward)<=1&&state.visible.has(k(d.reward.x,d.reward.y))&&!state.monsters.some(m=>m.citadelTrialGuard105!=null&&m.hp>0);
 if(world.rewardClaimed){toast('이 성채의 전승은 이미 받았다.');return false;}if(!d?.trial105){toast('이전에 생성된 중앙층에는 미궁이 없다. 새로 생성된 성채에서 도전할 수 있다.');return false;}
 if(state.branchContext105?.id!=='citadel'||state.branchContext105.level!==1||entityDistance57(state.player,d.reward)>1||!state.visible.has(k(d.reward.x,d.reward.y)))return false;
 if(t.status!=='active'||state.turn>=t.deadline||t.seals.length!==3){toast('180턴 안에 세 걸쇠를 풀고 전승 제단에 도달해야 한다.');return false;}if(!ready()){toast('시험실의 일곱 수호자를 모두 쓰러뜨려야 한다.');return false;}
  const upgrade=(window.MANRU_TALISMANS||[]).find(i=>i.talismanKind==='upgrade');if(!upgrade)throw Error('Missing citadel reward definition');
  const panel=summonPanel('흑성채의 전승',`시험 보상은 강화부적 1장이다. 남은 ${t.deadline-state.turn}턴.`),button=document.createElement('button');button.textContent=upgrade.name+' × 1';button.onclick=()=>{if(!ready())return;world.rewardClaimed=true;world.rewardChoice105='upgrade';t.status='completed';addInventoryItem({...clone(upgrade),count:1});addLog('흑성 미궁을 통과해 강화부적 1장을 받았다.');closeSummonPanel();globalThis.__MANRU_SAVE_SERVICE__?.request?.();};panel.append(button);return true;
}
function closeAnvil(){ANVIL_SESSION105=null;document.getElementById('anvilPanel105')?.remove();setInteraction8('anvilPanel105',false);}
function anvilOpen(q=citadelAdjacentAnvil()){
 if(!q||!gameplayUiOpen57()||!citadelAnvilAt(q.x,q.y)||!anvilNearby(q))return false;
 closeInventory();cancelAutoWalk();clearHeldInput53();ANVIL_SESSION105={map:state.map,x:q.x,y:q.y};
 const panel=document.createElement('section');panel.id='anvilPanel105';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.style.cssText='position:fixed;z-index:300;top:50%;left:50%;transform:translate(-50%,-50%);width:min(740px,calc(100vw - 24px));max-height:90vh;box-sizing:border-box;overflow:auto;padding:16px;background:#171d23;border:2px solid #a8956b;border-radius:12px;color:#eee0bc;box-shadow:0 15px 90px #000c;display:flex;flex-direction:column;gap:10px;';
 const title=document.createElement('h2');title.textContent='모루 · 장비 합성';const desc=document.createElement('p');desc.textContent='같은 종류·같은 강화치의 미저주 무기 또는 방어구 2개 → 강화 +1 장비 하나. 재료 1개를 소모하며, 남길 장비의 각인과 특성은 유지한다. 전설 무기는 합성할 수 없다. 합성 1턴.';const close=document.createElement('button');close.textContent='닫기';close.onclick=closeAnvil;panel.append(title,desc,close);
 const p=state.player,entries=[p.weapon,p.armor,...p.inventory].filter(anvilGear),pairs=[];
 const detail=it=>`${it.name} +${it.upgrade||0}${p.weapon===it||p.armor===it?' · 장착 중':''}${it.elementBrand74||it.elementGuard74?' · 각인 '+({fire:'화염',water:'수류',wind:'풍압',earth:'대지',wood:'목령',grass:'목령',shock:'뇌전',holy:'성광',ice:'빙결',thunder:'뇌전'}[it.elementBrand74||it.elementGuard74]||'원소'):''}`;
 for(const base of entries)for(const donor of p.inventory){if(!anvilPair(base,donor))continue;pairs.push([base,donor]);const button=document.createElement('button');button.style.cssText='text-align:left;white-space:pre-line;padding:12px;';button.textContent=`남김: ${detail(base)} → +${(base.upgrade||0)+1}\n소모: ${detail(donor)}`;button.onclick=()=>ActionDispatcher.dispatch({type:'ANVIL_FUSE105',args:[base,donor]}).value;panel.append(button);}
 if(!pairs.length){const empty=document.createElement('p');empty.textContent='합성할 장비 쌍이 없다. 같은 종류와 강화치의 미저주 무기·방어구를 모아 오자.';panel.append(empty);}
 document.body.append(panel);setInteraction8('anvilPanel105',true);return true;
}
function closeSummonPanel(){document.getElementById('summonPanel105')?.remove();SUMMON_PANEL_SESSION105=null;setInteraction8('summonPanel105',false);}
function summonPanel(title,description){closeSummonPanel();closeInventory();cancelAutoWalk();clearHeldInput53();const panel=document.createElement('section');panel.id='summonPanel105';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','summonTitle105');panel.innerHTML=`<div class="summonSheet105"><header class="summonHead105"><div class="summonBook105" aria-hidden="true"><span>靈</span></div><div><span class="summonEyebrow105">萬靈 · 소환술서</span><h2 id="summonTitle105"></h2></div><button class="summonClose105" aria-label="닫기" title="닫기">×</button></header><div class="summonBody105"></div></div>`;panel.querySelector('h2').textContent=title;panel.querySelector('.summonClose105').onclick=closeSummonPanel;panel.onclick=event=>{if(event.target===panel)closeSummonPanel();};document.body.append(panel);setInteraction8('summonPanel105',true);return panel;}
function summonChoice(body,title,hint,item,onClick,disabled=false){
 const button=document.createElement('button');button.className='summonPicture105';button.disabled=disabled;
 if(item){const art=document.createElement('img');art.alt='';art.src=item.summonItem105==='picture'?globalThis.__MANRU_ITEM_ART_R7__.pictureAsset(item).toDataURL('image/png'):globalThis.__MANRU_ITEM_ART_R7__.dataItem(item);if(item.summonItem105==='picture')art.className='summonPainting105';button.append(art);}
 const copy=document.createElement('span'),name=document.createElement('b'),description=document.createElement('small');name.textContent=title;description.textContent=hint;copy.append(name,description);button.append(copy);button.onclick=onClick;body.append(button);return button;
}
function summonUpdateButtons(){
 const slot=document.getElementById('summonButton105');if(!slot)return;const books=summonShortcutBooks();slot.hidden=!books.length||runState57()!=='playing'||!!state?.debugBattle57;slot.classList.toggle('summonSplit105',books.length>1);
 for(const [n,button]of [...slot.querySelectorAll('button')].entries()){const book=books[n],ready=!!SUMMON_RACES[book?.summonElement105];button.hidden=!book;button.disabled=!ready;button.classList.toggle('available',ready);button.dataset.bookId=book?.summonBookId105||'';button.title=book?`${book.name} +${book.upgrade} · ${SUMMON_RACES[book.summonElement105]?.name||'속성부적 없음'}`:'';button.setAttribute('aria-label',button.title);}
}
  const blockTap=(ms=180)=>UX.closeBlockUntil=Math.max(UX.closeBlockUntil,now()+ms);
  function equipData(){const p=state.player;return[['weapon','무기',p.weapon,'검'],['armor','갑옷',p.armor,'갑'],['cloak','망토',p.cloak,'망'],['relic','유물',p.relic,'유'],['trinket','장신구',p.trinket,'장']]}
  const bow52=()=>state?.player?.weapon?.kind==='bow';
  function openDoorCandidates964(){
    if(!state?.player)return[];const p=state.player,fdx=p.facing?.x||0,fdy=p.facing?.y||0;
    const dirs=[[fdx,fdy],[1,0],[-1,0],[0,1],[0,-1]],seen=new Set(),out=[];
    for(const [dx,dy] of dirs){if(!dx&&!dy)continue;const x=p.x+dx,y=p.y+dy,key=`${x},${y}`;if(seen.has(key))continue;seen.add(key);if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1||state.map[y][x]!==TT.OPEN_DOOR)continue;out.push({x,y,dirMatch:dx===fdx&&dy===fdy})}
    return out.sort((a,b)=>(b.dirMatch?1:0)-(a.dirMatch?1:0));
  }
  /* ---------- Shattered-style inspect: one description source, top window, complete terrain codex ---------- */
  let pendingInspect984=null;
  const inputNow=()=>performance.now();
