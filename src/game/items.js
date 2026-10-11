function itemQuantity(item){const n=item?.count??1;if(!Number.isSafeInteger(n)||n<0)throw new Error('invalid item quantity');return n}
function itemStackPrototype(item){
  if(item?.mineItem105)return MINE_ITEMS105[item.mineItem105]||null;
  if(!item||!['food','ingredient','potion','talisman','ammo'].includes(item.type))return null;
  const field={food:'foodKind',ingredient:'foodKind',potion:'potionKind',talisman:'talismanKind',ammo:'ammoKind'}[item.type];
  const pool=item.type==='potion'?(globalThis.MANRU_POTIONS||[]):item.type==='talisman'?(globalThis.MANRU_TALISMANS||[]):item.type==='ammo'?(globalThis.MANRU_AMMO||[]):CONSUMABLES;
  return pool.find(p=>p.type===item.type&&(item[field]?p[field]===item[field]:p.name===item.name))||CONSUMABLES.find(p=>p.type===item.type&&(item[field]?p[field]===item[field]:p.name===item.name))||null;
}
function itemStackLimit(item){
  if(item?.charcoalBurn105?.lit)return 1;
  if(['weapon','armor','cloak','relic','trinket'].includes(item?.type))return 1;
  const proto=itemStackPrototype(item),n=proto?.stackMax??(item?.fusion74?2:item?.stackMax??1);
  if(!Number.isSafeInteger(n)||n<1)throw new Error('invalid stack limit');return n;
}
function itemStackIdentity(item,inventory=false){
  const consumable=['food','ingredient','potion','talisman','ammo'].includes(item?.type),proto=consumable?itemStackPrototype(item):null;
  const ignored=new Set(['x','y','count']);
  if(item?.summonItem105==='picture')ignored.add('summonPortrait105');
  if(consumable){
    for(const k of ['stackMax','desc','ability','color','seal','appearance56','identified','isIdentified','unidentified','origin56','minFloor','maxFloor','craftedOnly57','naturalOnly57','weight','weight74','spawnMin','spawnMax'])ignored.add(k);
    // Ground placement tags remain distinct until pickup; no room reward/topology data is merged on the map.
    if(inventory){ignored.add('placement57');for(const k of ITEM_PLACEMENT_FIELDS58)ignored.add(k);}
  }
  const data={},source=proto?{...proto,...item}:item;
  // Older field-cooked fish retained the raw input flag; cooked food has no raw effect.
  if(item?.foodKind==='grilled_fish')ignored.add('raw');
  for(const key of Object.keys(source).sort())if(!ignored.has(key)&&source[key]!==undefined)data[key]=source[key];
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,stable(v[k])])):v;
  return JSON.stringify(stable(data));
}
function transferItemQuantity(item,source,target,quantity=itemQuantity(item),opts={}){
  if(!item||!Array.isArray(target)||source===target)return{moved:0,remaining:item?itemQuantity(item):0};
  const total=itemQuantity(item);if(!Number.isSafeInteger(quantity)||quantity<0||quantity>total)throw new Error('invalid quantity transfer');
  if(source&&!source.includes(item))return{moved:0,remaining:total};
  const carried=!opts.position&&item.foodKind==='charcoal'?structuredClone(item):item;if(carried!==item)coolCharcoal105(carried);
  const limit=itemStackLimit(carried),capacity=opts.capacity??Infinity,key=itemStackIdentity(carried,!opts.position),merges=[];let left=quantity;
  for(const stack of target){if(left===0)break;if(opts.position&&(stack.x!==opts.position.x||stack.y!==opts.position.y))continue;if(itemStackLimit(stack)!==limit||itemStackIdentity(stack,!opts.position)!==key)continue;const room=Math.max(0,limit-itemQuantity(stack)),n=Math.min(room,left);if(n){merges.push({stack,n});left-=n}}
  const chunks=[];for(let slots=Math.max(0,capacity-target.length);left>0&&slots>0;slots--){const n=Math.min(limit,left);chunks.push(n);left-=n}
  const moved=quantity-left;if(!moved)return{moved:0,remaining:total};
  for(const entry of merges)entry.stack.count=itemQuantity(entry.stack)+entry.n;
  const remaining=total-moved;let reused=false;
  for(const n of chunks){const stack=!remaining&&!reused?item:structuredClone(item);reused=true;stack.count=n;if(opts.position){stack.x=opts.position.x;stack.y=opts.position.y}else{delete stack.x;delete stack.y;if(stack.foodKind==='charcoal')coolCharcoal105(stack);if(['food','ingredient','potion','talisman','ammo'].includes(stack.type))for(const key of ['placement57',...ITEM_PLACEMENT_FIELDS58])delete stack[key]}target.push(stack)}
  if(remaining)item.count=remaining;else if(source)source.splice(source.indexOf(item),1);
  if(target===state?.player?.inventory&&item.artifactId46)globalThis.__MANRU_LEGEND47__?.recordAcquisition?.();return{moved,remaining}
}
function consumeItemQuantity(item,quantity=1,container=state?.player?.inventory){
  if(!item||!container?.includes(item)||!Number.isSafeInteger(quantity)||quantity<1||itemQuantity(item)<quantity)return false;
  const remaining=itemQuantity(item)-quantity;if(remaining)item.count=remaining;else container.splice(container.indexOf(item),1);return true
}
function splitItemQuantity(item,quantity,container){
  if(!container?.includes(item)||!Number.isSafeInteger(quantity)||quantity<1||quantity>itemQuantity(item))return null;
  if(quantity===itemQuantity(item)){container.splice(container.indexOf(item),1);return item}
  const split=structuredClone(item);split.count=quantity;item.count=itemQuantity(item)-quantity;return split
}
function addInventoryItem(item,origin=state?.player){
  if(!state||!item)return false;const r=transferItemQuantity(item,null,state.player.inventory,itemQuantity(item),{capacity:inventoryCapacity()});
  if(r.remaining){if(r.moved)item.count=r.remaining;PlacementService.placeItem(item,origin)}return r.moved>0
}
function itemTypeLabel(t){if(t==='ammo')return'탄약';if(t==='ingredient')return'조리 재료';if(t==='talisman')return'부적';if(t==='potion')return'비약 / 약병';if(t==='painting')return '화공의 그림';if(t==='book')return '소환술서';if(t==='guide')return '안내서';if(t==='martial_manual')return '무술비급';return({weapon:'무기',armor:'방어구',cloak:'망토',relic:'유물',trinket:'장신구',food:'음식'})[t]||'물품'}
function itemGlyph(item){if(item?.type==='ammo')return'탄';if(item?.mineItem105)return item.mineItem105==='stone'?'石':item.mineItem105==='oil'?'油':'玄';if(item?.type==='ingredient')return item.foodKind==='seaweed'?'초':item.name==='깨끗한 물'?'수':'빙';if(item?.type==='potion')return'약';if(item?.type==='talisman')return publicTalismanSeal56(item);if(item?.summonItem105==='picture')return '畵';if(item?.summonItem105)return '召';if(item?.type==='martial_manual')return '秘';if(item.type==='weapon'){if(item.kind==='brawl')return'권';if(item.kind==='bow')return'활';if(item.kind==='spear')return'창';if(item.kind==='blunt')return'둔';return'검'}if(item.type==='armor')return'갑';if(item.type==='cloak')return'망';if(item.type==='relic')return'유';if(item.type==='trinket')return'장';if(item.type==='food')return'식';return'물'}
  function ordinaryPotionPool(tactical,floor=state.floor){
    const pool=(window.MANRU_POTIONS||[]).filter(p=>floor>=(p.minFloor||1)&&(tactical?!['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(p.potionKind):['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(p.potionKind)));
    // 전술 소모품 상향은 유지하되 회복 비약의 과도한 가중만 낮춘다.
    const out=[];for(const p of pool){let w=1;if(p.potionKind==='heal_small')w=2;else if(p.potionKind==='smoke')w=4;for(let i=0;i<w;i++)out.push(p)}return out
  }
function ordinaryGearPool(tier,floor){const lo=Math.max(1,tier-1),hi=Math.min(5,tier+(floor>=16?1:0)),all=[...WEAPONS.map(x=>({...x,type:'weapon'})),...ARMORS.map(x=>({...x,type:'armor'})),...CLOAKS.map(x=>({...x,type:'cloak'}))];const pool=all.filter(x=>(x.tier||1)>=lo&&(x.tier||1)<=hi);return pool.length?pool:all.filter(x=>(x.tier||1)<=tier)}
function giveFood(name,x=state.player.x,y=state.player.y){const proto=CONSUMABLES.find(v=>v.name===name);if(!proto)return false;return giveItem(proto,x,y)}
function itemSummary(item){if(item?.type==='ammo'){const d=ammoDef(item.ammoKind)||item,a=[];if(d.atkBonus)a.push(`공격 +${d.atkBonus}`);if(d.pierce)a.push(`방어 ${d.pierce} 무시`);return `활 탄약 · ${a.length?a.join(' · '):'표준 화살'} · ${item.count||1}발`}return describeItemWithBrands(item)}
function describeItemWithBrands(item){const s=describeIdentifiedItem(item);if(item?.type==='weapon'&&item.elementBrand74)return `${s} · ${E74[item.elementBrand74].name} 무기각인${item.elementBrand74==='holy'?' · 언데드 추가피해 +5':''}`;if(item?.type==='armor'&&item.elementGuard74)return `${s} · ${E74[item.elementGuard74].name} 방어각인${item.elementGuard74==='holy'?' · 언데드 피해 -15%':''}`;return s}
function describeIdentifiedItem(item){if(item?.type==='potion'&&!isPotionKnownByPlayer(item))return `${POTION_META[item.potionKind]?.family||'미확인 약성'} · ${item.origin56?.label||'출처 불명'}`;if(item?.type==='talisman'&&!knownTalisman56(item))return '미확인 부적 · 술법 불명';if(item?.type==='talisman')return item.ability||item.desc||'';return describeItemStats(item)}
function describeItemStats(item){return displayText53(stats53(item).join(' · '))}
function consumeOne(idx){return consumeItemQuantity(state?.player?.inventory?.[idx])}
/* r30 canonical item-use resolver: one ordered decision tree replaces the historical useInventoryItem wrapper stack. */
function useInventoryItem(idx,...rest){
  const pending=state?.player?.inventory?.[idx];
  if(pending?.talismanKind==='upgrade'&&bodyPowerActive()){toast('이미 괴력이 폭발하고 있다.');return false}
  const act=playerAction57('item',{allowInventory:true,closeInventory:true,stunMessage:'몸이 굳어 물건을 사용하지 못했다.'});if(!act.ok)return !!act.consumed;const item=state?.player?.inventory?.[idx];if(!item)return false;
  const identity991=globalThis.__MANRU_ITEM_IDENTITY991__;
  const library1022=globalThis.__MANRU_LIBRARY1022_ACTIONS__;
  const talisman74=globalThis.__MANRU_TALISMAN74_ACTIONS__;
  const consumable56=globalThis.__MANRU_CONSUMABLE56_ACTIONS__;
  const potion41=globalThis.__MANRU_POTION41_ACTIONS__;
  const ux45=globalThis.__MANRU_UX45_ACTIONS__;
  const runtime70=globalThis.__MANRU_RELEASE__;

  // Special library scrolls are owned by the library subsystem through one explicit action service.
  if(item.branchGuide105){showInspect(item.name,item.desc);return true}
  if(item.summonItem105)return summonUse(item,idx);
  if(item.mineItem105)return mineUseItem105(item);
  if(item.type==='martial_manual')return showMartialManual(item);
  if(item.libraryScroll1022)return library1022?.consume?.(idx,item)??false;

  // Gear identity / curse handling is resolved before equip. No IIFE-private helper is referenced here.
  if(item.type==='talisman'){
    if(item.talismanKind==='identify')return identity991?.useIdentify?.(item)??false;
    if(item.talismanKind==='holy')return identity991?.useHoly?.(item)??false;
    if(item.fusion74&&(String(item.fusionEffect74||'').startsWith('holy_')||item.fusionEffect74==='identify_all991'))return identity991?.useHolyFusion?.(item)??false;
  }
  if(identity991?.isGear?.(item)){
    const cur=state.player[item.type];
    if(cur?.curseActive991){toast(`${cur.name}의 저주가 장착을 봉인하고 있다. 성부로 먼저 정화해야 한다.`);return false}
    identity991.identifyGear(item,'착용');
    if(item.curse991){const nextStacks=identity991.activateCurse?.(item)||(identity991.curseStacks?.(item.curse991)||1),power=Math.pow(2,Math.max(0,nextStacks-1));identity991.revealCurse(item);addLog(`저주 발현 · ${item.name}: ${identity991.curseDef(item)?.name||'알 수 없는 저주'}${nextStacks>1?` · 중첩 ${nextStacks}단계 / 효과 ×${power}`:''}. 성부 없이는 벗을 수 없다.`)}
  }

  if(item.type==='ammo'){state.player.loadedAmmoKind=item.ammoKind;addLog(`${item.name} 장전 선택.`);toast(`${item.name} 장전 · ${item.count||1}발`);renderInventory();updateAll();return true}

  // v7.4 owns elemental/upgrade/fused talisman families. A handled result never falls through.
  if(item.type==='talisman'){
    const dispatch=talisman74?.dispatch?.(item);
    if(dispatch?.handled)return dispatch.result;
  }

  if(item.type==='potion'&&item.throwable)runtime70?.tip?.('throw','투척 약병은 목표 칸을 지정해 지형을 만든다. 연막으로 사선을 자르고 화유병으로 통로를 막아라.','소모품을 전투 지형처럼 쓰는 것이 핵심');
  runtime70?.markAction?.();if(!item.throwable)presentPlayerAction58('item');

  // v5.6 owns ordinary talisman target/instant effects.
  if(item.type==='talisman')return consumable56?.useTalisman?.(item)??false;

  if(item.type==='upgrade'){cancelAutoWalk();state.player.upgradeMarks=(state.player.upgradeMarks||0)+1;consumeOne(idx);inventoryTab='gear';inventorySelection=-1;addLog('개량 인장을 펼쳤다. 장비를 고르면 개량할 수 있다.');renderInventory();return true}

  ux45?.markDirty?.();
  let result=false;
  if(item.throwable)result=potion41?.beginTarget?.(item)??false;
  else if(item.type==='potion')result=potion41?.drink?.(item)??false;
  else result=useInventoryBaseR30(idx,...rest);

  // Keep an unidentified throwable's public appearance in the target banner without reaching into v5.6 internals.
  if(item.type==='potion'&&item.throwable&&!consumable56?.knownPotion?.(item))setTimeout(()=>{const e=document.getElementById('potionTargetName');if(e)e.textContent=`${consumable56?.publicName?.(item)||item.name} 투척`},0);
  return result;
}
function dropInventoryItem(idx){const act=playerAction57('drop',{allowInventory:true});if(!act.ok)return !!act.consumed;const item=splitItemQuantity(state.player.inventory[idx],1,state.player.inventory);if(!item)return false;PlacementService.placeItem(item,state.player);renderInventory();updateAll();return true}
function itemPrototype(name){if(name==='만령 소환술서')return summonBookItem();if(name==='만령부적')return summonSealItem();const mine=Object.values(MINE_ITEMS105).find(i=>i.name===name);if(mine)return {...mine};
    const pools=[[WEAPONS,'weapon'],[ARMORS,'armor'],[CLOAKS,'cloak'],[RELICS,'relic'],[TRINKETS,'trinket'],[CONSUMABLES,null],[window.MANRU_POTIONS||[],'potion'],[window.MANRU_TALISMANS||[],'talisman'],[window.MANRU_AMMO||[],'ammo']];
    for(const [pool,type] of pools){const it=pool?.find?.(x=>x.name===name);if(it)return {...it,type:it.type||type}}
    return null
  }
  const itemEffects=(it)=>{if(!it)return'';const a=[];if(it.atk)a.push(`ATK +${displayNumber53(it.atk)}`);if(it.def)a.push(`DEF ${it.def>0?'+':''}${displayDef42(it.def)}`);if(it.eva)a.push(`EVA ${it.eva>0?'+':''}${it.eva}`);if(it.will)a.push(`WILL +${it.will}`);if(it.vision)a.push(`VIS ${it.vision>0?'+':''}${it.vision}`);if(it.focus)a.push(`FOCUS +${displayNumber53(it.focus)}`);if(it.speed)a.push(`공속 ${it.speed}× · ${attackTurnCost(it).toFixed(1)}턴`);if(it.range)a.push(`사거리 ${it.range}`);if(it.heal)a.push(`HP +${it.heal}`);if(it.focusGain)a.push(`FOCUS +${it.focusGain}`);if(it.hunger)a.push(`허기력 +${it.hunger}`);if(it.ability&&it.ability!=='없음')a.push(`[${it.ability}]`);if(it.curse)a.push(`저주: ${it.curse}`);return a.join(' · ')};
  const POTIONS=[
    {name:'소회복 비약',type:'potion',potionKind:'heal_small',tier:1,rarity:'common',stackMax:3,minFloor:1,color:'#c64f49',ability:'최대 HP의 32% 회복 (최소 10)',desc:'상처를 빠르게 봉합하는 붉은 비약. 최대 HP의 32%를 회복하며 최소 회복량은 10이다.',useCost:.8},
    {name:'중회복 비약',type:'potion',potionKind:'heal_medium',tier:2,rarity:'rare',stackMax:3,minFloor:4,color:'#d66b57',ability:'최대 HP의 60% 회복 (최소 18) · 출혈 완화',desc:'농축된 금창 약액. 최대 HP의 60%를 회복하며 최소 회복량은 18이고, 50% 확률로 출혈을 제거한다.',useCost:.8},
    {name:'막걸리',type:'potion',potionKind:'makgeolli',tier:2,rarity:'rare',stackMax:3,minFloor:4,color:'#e3dcc7',ability:'취함 8턴 · 매턴 최대 HP 9% 누적 회복 · 총 약 72%',desc:'탁한 쌀술. 마시면 8턴 동안 취해 이동과 공격 판단이 불안정해지지만, 취함이 유지되는 동안 최대 HP의 9%씩 회복량을 누적해 정수 HP로 회복한다. 8턴 총 잠재 회복량은 최대 HP의 약 72%다.',useCost:.8,drunkTurns57:8,regenPercent57:.09,regenMin57:2},
    {name:'청심탕',type:'potion',potionKind:'focus',tier:2,rarity:'rare',stackMax:3,minFloor:3,color:'#55a7b8',ability:'기력 +20 · WILL +2',desc:'정신을 맑게 하는 푸른 탕약. 기력을 20 회복하고 5턴 동안 WILL +2.',useCost:.8},
    {name:'해독산',type:'potion',potionKind:'cleanse',tier:1,rarity:'common',stackMax:3,minFloor:1,color:'#d9d6b6',ability:'중병·독·출혈·약화·배탈 해제 · 최대 HP의 12% 회복',desc:'독기와 중병, 피멎음, 쇠약과 배탈을 다스리는 백색 약산. 독·중병·출혈·약화·배탈을 제거하고 최대 HP의 12%를 회복하며 최소 회복량은 4이다.',useCost:.8},
    {name:'경신약',type:'potion',potionKind:'swift',tier:3,rarity:'rare',stackMax:2,minFloor:6,color:'#70b46a',ability:'6턴 신속',desc:'6턴 동안 이동·공격 행동비용 20% 감소, EVA +10.',useCost:.8},
    {name:'강골주',type:'potion',potionKind:'fortify',tier:3,rarity:'rare',stackMax:2,minFloor:7,color:'#b7884c',ability:'8턴 DEF +3',desc:'뼈와 힘줄을 굳히는 독한 약주. 8턴 동안 DEF +3.',useCost:.8},
    {name:'연막병',type:'potion',potionKind:'smoke',tier:3,rarity:'rare',stackMax:2,minFloor:7,color:'#747b84',ability:'투척 · 3×3 연막 5턴',desc:'사거리 4칸. 깨진 지점 주변 3×3에 5턴 동안 시야를 가리는 연막을 만든다.',throwable:true,throwRange:4,useCost:1},
    {name:'화유병',type:'potion',potionKind:'fire',tier:4,rarity:'rare',stackMax:2,minFloor:12,color:'#df6a32',ability:'투척 · 3×3 화염 4턴',desc:'사거리 4칸. 직격 6 피해 후 주변 3×3을 4턴 동안 불태워 턴당 3 피해를 준다.',throwable:true,throwRange:4,useCost:1}
  ];
  // v4.5 canonical turn core below owns field/status ticking; the obsolete duplicate field ticker was removed.
  function consumeRef(item){const i=state.player.inventory.indexOf(item);if(i<0)return false;consumeOne(i);return true}
  function itemHtml(item,dist=null){
    if(!item)return '<div class="clean53"><div class="clean53Desc">정보가 없다.</div></div>';
    const chips=stats53(item),ability=(item.ability&&item.ability!=='없음')?String(item.ability).trim():'',desc=String(item.desc||'').trim(),parts=[];
    if(chips.length)parts.push(`<div class="clean53Meta">${chips.map(x=>`<span class="clean53Chip">${esc53(x)}</span>`).join('')}</div>`);
    if(ability&&ability!==desc)parts.push(`<div class="clean53Ability"><b>능력</b> · ${esc53(ability)}</div>`);
    if(desc)parts.push(`<div class="clean53Desc">${esc53(desc)}</div>`);
    else if(!ability&&!chips.length)parts.push('<div class="clean53Desc">별도 설명이 없다.</div>');
    if(dist!=null)parts.push(`<div class="clean53Hint">거리 ${Number(dist)}칸 · 탭하면 목표 이동/습득</div>`);
    return `<div class="clean53">${parts.join('')}</div>`;
  }
  const APPEARANCES=[
    {id:'crimson',name:'탁한 주홍색 약병',color:'#a8493e',glass:'#d08b78'},
    {id:'jade',name:'맑은 비취색 약병',color:'#5b9d72',glass:'#a8cba9'},
    {id:'azure',name:'푸른 유리 약병',color:'#4d83a8',glass:'#a7c6d7'},
    {id:'ivory',name:'우윳빛 약병',color:'#c9c2a5',glass:'#eee8d4'},
    {id:'amber',name:'호박빛 약병',color:'#b77b3e',glass:'#e2bc78'},
    {id:'smoke',name:'회청색 약병',color:'#6d7781',glass:'#b7c0c5'},
    {id:'violet',name:'자줏빛 약병',color:'#855b8c',glass:'#c6a2ca'},
    {id:'ink',name:'먹빛 약병',color:'#3e4148',glass:'#8c939c'},
    {id:'ochre',name:'황갈색 유리 약병',color:'#9a805e',glass:'#c9b58f'}
  ];
  const APP_BY_ID=new Map(APPEARANCES.map(a=>[a.id,a]));
  const POTION_META={
    heal_small:{sense:'묽고 따뜻하다. 약한 쇠 냄새가 나며 천천히 피부를 당긴다.',candidates:['heal_small','heal_medium','makgeolli','cleanse'],family:'상처·정화 계열'},
    heal_medium:{sense:'점성이 높고 따뜻하다. 마른 피와 약초를 섞은 냄새가 난다.',candidates:['heal_medium','heal_small','makgeolli','fortify'],family:'회복·강화 계열'},
    makgeolli:{sense:'점성이 있고 따뜻하다. 약초와 발효된 약재 같은 향이 섞여 있어 회복제인지 강화제인지 단정하기 어렵다.',candidates:['makgeolli','heal_medium','heal_small','fortify'],family:'회복·강화 계열'},
    focus:{sense:'차갑고 맑은 향이 코끝을 찌른다. 흔들면 가느다란 푸른 거품이 오래 남는다.',candidates:['focus','cleanse','swift'],family:'정신·기동 계열'},
    cleanse:{sense:'가루가 바닥에 가라앉지 않는다. 쓴 향 뒤로 흰 연기가 금세 사라진다.',candidates:['cleanse','focus','heal_small'],family:'정화·회복 계열'},
    swift:{sense:'병 안의 액체가 손보다 먼저 움직이는 듯 출렁인다. 풀잎과 박하 향이 강하다.',candidates:['swift','focus','smoke'],family:'기동·연막 계열'},
    fortify:{sense:'무겁고 매운 향이 난다. 병벽을 두드리면 금속처럼 둔한 울림이 돌아온다.',candidates:['fortify','heal_medium','fire'],family:'강화·열기 계열'},
    smoke:{sense:'마개 틈으로 회색 실오라기가 샌다. 불꽃 가까이 가져가도 온도가 거의 오르지 않는다.',candidates:['smoke','swift','fire'],family:'연막·기동 계열'},
    fire:{sense:'병을 잡은 손바닥이 서서히 뜨거워진다. 기름과 유황 냄새가 약하게 배어 있다.',candidates:['fire','fortify','smoke'],family:'열기·전투 계열'}
  };
  function isPotionKnownByPlayer(item){if(item?.mineItem105)return true;return item?.type==='potion'&&!!state?.knowledge56?.potionKnown?.[item.potionKind]}
  function truePotion(item){return POTION_BY_KIND.get(item?.potionKind)||item}
  function potionClueHTML(item,compact=false){
    const K=state.knowledge56,meta=POTION_META[item.potionKind]||{},origin=item.origin56||{label:'출처 불명',text:'발견 위치만으로는 약성을 좁히기 어렵다.',strength:0},seen=K.potionSeen[item.potionKind]||0,cands=candidateKinds56(item).map(k=>POTION_BY_KIND.get(k)?.name||k),certainty=cands.length===1?'거의 확실':origin.strength>=2?'맥락 강함':seen>=2?'반복 관찰':'초기 추정',head=compact?`<div class="v56CompactCert"><b>추정 신뢰도</b><span>${certainty}</span></div>`:`<div class="v56MysteryHead"><b>${esc56(app56(item).name)}</b><span>${certainty}</span></div>`;
    return `${head}<div class="v56Clue"><b>감각</b>${esc56(meta.sense||'특징을 잡기 어렵다.')}</div><div class="v56Clue"><b>${esc56(origin.label)}</b>${esc56(origin.text)}</div><div class="v56Candidates"><b>가능성</b>${cands.map(n=>`<span>${esc56(n)}</span>`).join('')}</div><div class="v56KnowledgeHint">같은 빛의 약병은 이번 탐험에서 항상 같은 효과다. 사용하거나 감정부적를 펼치면 확정된다.</div>`;
  }
  function identifyPotion(kind,reason='효과를 직접 확인했다'){
    const K=ensureKnowledge56();if(!kind||K.potionKnown[kind])return false;K.potionKnown[kind]=true;const p=POTION_BY_KIND.get(kind),a=APP_BY_ID.get(K.potionMap[kind]);logWithCategory(`약병 식별 · ${a?.name||'미확인 약병'} = ${p?.name||kind} (${reason}).`);burst(state.player.x,state.player.y,a?.color||'#d6b071',13,.55);setTimeout(()=>{if(inventoryOpen)renderInventory();updateAll()},0);return true
  }
  function observePotion(item){if(!item||item.type!=='potion')return;decoratePotion56(item);const K=ensureKnowledge56(),n=(K.potionSeen[item.potionKind]||0)+1;K.potionSeen[item.potionKind]=n;if(!isPotionKnownByPlayer(item)&&!K.clueSeen[item.potionKind]){K.clueSeen[item.potionKind]=1;logWithCategory(`약병 단서 기록 · ${app56(item).name}: ${POTION_META[item.potionKind]?.family||'약성 불명'} / ${item.origin56?.label||'출처 불명'}.`)}}
const POTION_LOOK={crimson:'탁한 주홍색 약병',jade:'맑은 비취색 약병',azure:'푸른 유리 약병',ivory:'우윳빛 약병',amber:'호박빛 약병',smoke:'회청색 약병',violet:'자줏빛 약병',ink:'먹빛 약병',ochre:'황갈색 유리 약병'};
const FOOD_RECIPES=[
  {id:'grilled_fish',name:'구운 생선 살',ingredients:['신선한 생선 살'],stations:['brazier'],hint:'날생선을 불에 직접 익힌다.'},
  {id:'power_riceball',name:'전력 주먹밥',ingredients:['주먹밥','엽전 엿'],hint:'밥과 단것을 함께 뭉친다.'},
  {id:'spicy_jerky',name:'매콤한 육포',ingredients:['말린 육포','화유병'],alternatives:{'화유병':['화룡유']},hint:'육포에 화염 기름을 한 방울 바른다.'},
  {id:'medicinal_fish',name:'한방 생선찜',ingredients:['신선한 생선 살','독버섯 꼬치'],hint:'독기를 약재로 중화해 생선을 찐다.'},
  {id:'talisman_sungnyung',name:'원력 숭늉',ingredients:['식어버린 국밥','깨끗한 물'],hint:'식은 국물에 맑은 물을 붓는다.'},
  {id:'vital_hotpot',name:'보신 전골',ingredients:['말린 육포','신선한 생선 살','깨끗한 물'],hint:'육지와 바다의 재료를 물에 고아낸다.'},
  {id:'ice_peach',name:'얼음 복숭아',ingredients:['신선도','빙결액'],hint:'영험한 복숭아를 차가운 액체에 담근다.'},
  {id:'seaweed_recovery',name:'중회복 비약',ingredients:['해초','소회복 비약'],stations:['pot'],hint:'솥에서 바다 약초로 작은 회복 비약을 농축한다.'},
  {id:'palace_roll',name:'창해말이',ingredients:['해초','주먹밥','구운 생선 살','매콤한 육포'],stations:['pot','brazier'],yield:10,hint:'해초로 밥과 익힌 생선, 매콤한 고기를 말아 열 조각으로 썬다.'}
];
function foodOccurrencePick(pool,unit=globalThis.__MANRU_RANDOM57__()){
 const candy=pool.filter(i=>i==='엽전 엿'||i?.foodKind==='coin_candy'),others=pool.filter(i=>i!=='엽전 엿'&&i?.foodKind!=='coin_candy');if(!candy.length||!others.length)return pool[Math.floor(unit*pool.length)];
 const chance=candy.length/pool.length/3;return unit<chance?candy[Math.min(candy.length-1,Math.floor(unit/chance*candy.length))]:others[Math.min(others.length-1,Math.floor((unit-chance)/(1-chance)*others.length))];
}
function foodDef(name){return CONSUMABLES.find(i=>i.name===name)}
function ensureFoodState(){
  if(!state)return;
  state.status=state.status||{};
  for(const q of ['foodHaste57','warm57','fireCoat57','poisonResist57','vitality57','freeStamina57'])if(!Number.isFinite(state.status[q]))state.status[q]=0;
  state.cookbook57=state.cookbook57||{grilled_fish:true};
  state.player.foodVital57=Number(state.player.foodVital57)||0;
}
function consumeStack(item){return consumeItemQuantity(item)}
function giveItem(proto,x=state.player.x,y=state.player.y){if(!proto)return false;const item=clone(proto);addInventoryItem(item,{x,y});addLog(`${item.name} 획득.`);return true}
function cleanseFood(){return cleanseStatuses()}
function consumeFood(item,idx){const c=playerCloak?.()||{},old=item?.eatCost57;if(item&&c.eatSpeed&&Number.isFinite(old))item.eatCost57=Math.max(.25,old/c.eatSpeed);try{return consumeFoodAtCost(item,idx)}finally{if(item&&Number.isFinite(old))item.eatCost57=old}}
function consumeFoodAtCost(item,idx){
  if(!state||!item)return;ensureFoodState();const p=state.player;
  if(item.throwableFood57){beginFoodTarget(item);return}
  if(item.hungerFull57)p.hunger=BALANCE.hungerMax;else p.hunger=Math.min(BALANCE.hungerMax,p.hunger+(item.hunger||0));
  if(item.focusFull)p.focus=getStats().maxFocus;
  if(item.focusPercent57)p.focus=Math.min(getStats().maxFocus,p.focus+Math.ceil(getStats().maxFocus*(item.foodKind==='coin_candy'?foodDef('엽전 엿').focusPercent57:item.focusPercent57)));
  if(item.regenTurns)state.status.regen=Math.max(state.status.regen,item.regenTurns+1);
  if(item.raw&&globalThis.__MANRU_RANDOM57__()<.15){state.status.upset=Math.max(state.status.upset,5);addLog('날생선을 잘못 먹어 배탈이 났다. 이동 행동비용이 증가한다.')}
  if(item.poisonSelf&&state.status.poisonResist57<=0)state.status.poison=Math.max(state.status.poison,5);
  if(item.cleanse)cleanseFood();
  if(item.foodHasteTurns57)state.status.foodHaste57=Math.max(state.status.foodHaste57,item.foodHasteTurns57+1);
  if(item.warmTurns57)state.status.warm57=Math.max(state.status.warm57,item.warmTurns57+1);
  if(item.fireCoatTurns57)state.status.fireCoat57=Math.max(state.status.fireCoat57,item.fireCoatTurns57+1);
  if(item.poisonResistTurns57){state.status.poison=0;state.status.poisonResist57=Math.max(state.status.poisonResist57,item.poisonResistTurns57+1)}
  if(item.vitalityTurns57){if(!p.foodVital57){p.foodVital57=10;p.temporaryMaxHpBonus+=10;recomputeMaxHp(p,true)}state.status.vitality57=Math.max(state.status.vitality57,item.vitalityTurns57+1)}
  if(item.freeStaminaTurns57)state.status.freeStamina57=Math.max(state.status.freeStamina57,item.freeStaminaTurns57+1);
  if(item.charcoalDamage57){const dealt=damageEntity(p,item.charcoalDamage57);if(dealt>0)floatText(p.x,p.y,`-${dealt}`,'#b28a6c',12);if(p.hp<=0){consumeOne(idx);closeInventory();die('검게 탄 숯');return}}
  floatText(p.x,p.y,'냠냠','#e5c98e',10);addLog(`${item.name} 섭취 · 허기 ${Math.round(p.hunger)}/${BALANCE.hungerMax}.`);consumeOne(idx);closeInventory();globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:item.eatCost57??1,reason:"consumeFood57"}).value
}
// 독버섯 꼬치 투척
const foodTargetPanel=document.createElement('div');
function cancelFoodTarget(silent=false){V57.foodTarget=null;foodTargetPanel.classList.remove('show');syncWorldTargetInput();endTargetInput57(320);if(!silent)toast('꼬치 투척을 취소했다.');drawMap(true)}
function beginFoodTarget(item){if(!gameplayUiOpen57())return false;cancelAutoWalk();closeInventory();V57.foodTarget={item,range:item.throwRange57||4};foodTargetPanel.classList.add('show');syncWorldTargetInput();document.getElementById('foodTargetName57').textContent=`${item.name} 투척`;drawMap(true)}
function throwFood(tx,ty){const act=playerAction57('target',{uiOwner:'foodTarget57'});if(!act.ok)return false;const a=V57.foodTarget;if(!a||!state)return false;const p=state.player;if(tx<0||ty<0||tx>=COLS||ty>=ROWS||entityDistance57({x:tx,y:ty},p)>a.range){toast(`사거리 ${a.range}칸 밖이다.`);return false}if(!state.seen.has(k(tx,ty))||!lineClear(p.x,p.y,tx,ty)){toast('꼬치를 던질 길이 막혔다.');return false}const m=findMonsterAt(tx,ty);if(!isThreatVisibleToPlayer(m)){toast('먹일 적대 요괴가 없다.');return false}markCombatActivity57('food-throw');if(state.floor>=11)alertNearby(tx,ty,6,'projectile');projectileFX(p.x,p.y,tx,ty,'#9bb061');if(globalThis.__MANRU_ASURA61__?.blocksDirect?.(m,p)){floatText(tx,ty,'영역 밖 무효','#d7b16e',10);addLog(`${m.name}의 아수라장이 투척물을 튕겨냈다.`)}else if(m.kind==='construct'){floatText(tx,ty,'무효','#a6a29a',10);addLog(`${m.name}은 독버섯을 먹지 않는다.`)}else{setMonsterStatus(m,'poisoned57',Math.max(m.poisoned57||0,5),p);if(m.poisoned57>0)setMonsterAttackInvestigation(m,p);setMonsterWeakened(m,3);floatText(tx,ty,'중독 5','#9dc77e',10);addLog(`${m.name}에게 독버섯 꼬치를 먹였다.`)}consumeStack(a.item);cancelFoodTarget(true);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:'reference-effect'});return true}
// 비방 조리 UI
const cookingPanel=document.createElement('div');
function isPotionKindVisible(item){return item?.type!=='potion'||(item.potionKind==='mine_fire105'&&item.identified===true)||!!state?.knowledge56?.potionKnown?.[item.potionKind]}
function cookingName(item){if(item?.type==='potion'&&!isPotionKindVisible(item))return POTION_LOOK[item.appearance56]||'미확인 약병';return item?.name||'물품'}
function eligibleCooking(){return state.player.inventory.map((item,idx)=>({item,idx})).filter(v=>v.item.mineItem105!=='stone'&&(v.item.type==='food'||v.item.type==='ingredient'||['fire','mine_fire105','heal_small'].includes(v.item.potionKind)))}
function selectedCooking(){return [...V57.selected].map(idx=>({idx,item:state.player.inventory[idx]})).filter(v=>v.item)}
function matchRecipe(items){return FOOD_RECIPES.find(r=>{if(r.stations&&!r.stations.includes(V57.cookSource))return false;const keys=items.map(v=>{const key=ingredientKey57(v.item);return Object.keys(r.alternatives||{}).find(base=>r.alternatives[base].includes(key))||key}).sort((a,b)=>a.localeCompare(b,'ko'));return r.ingredients.slice().sort((a,b)=>a.localeCompare(b,'ko')).join('|')===keys.join('|')})||null}
function openCooking(source='pot'){if(!gameplayUiOpen57())return false;if(!cookingFireAvailable105(source)){toast('불씨가 꺼져 있다. 불속성으로 다시 지펴야 한다.');return false;}if(!state)return;ensureFoodState();cancelAutoWalk();if(inventoryOpen)closeInventory();if(typeof closeMobileDrawer==='function')closeMobileDrawer();if(typeof closeInspect==='function')closeInspect();V57.cookSource=source;V57.selected.clear();V57.cookOpen=true;cookingPanel.classList.add('show');document.body.classList.toggle('ux-modal-open',activeGameplayPanels57().length>0);renderCooking()}
function closeCooking(){V57.cookOpen=false;V57.selected.clear();cookingPanel.classList.remove('show');document.body.classList.toggle('ux-modal-open',activeGameplayPanels57().length>0)}
function consumeCookingSelection(sel){for(const {idx} of [...sel].sort((a,b)=>b.idx-a.idx)){const it=state.player.inventory[idx];if(!it)continue;consumeItemQuantity(it)}}
function cookSelected(){
 const action=playerAction57('cook',{uiOwner:'cook57'});if(!action.ok)return false;
 if(!cookingFireAvailable105(V57.cookSource)){toast('조리할 불씨가 꺼져 있다.');return false;}
 const sel=selectedCooking();if(!sel.length){toast('재료를 고르시오.');return false;}
 if(sel.length>COOKING_INGREDIENT_LIMIT57){toast(`재료는 최대 ${COOKING_INGREDIENT_LIMIT57}종까지 넣을 수 있다.`);return false;}
 const rec=matchRecipe(sel),proto=itemPrototype(rec?.name||'검게 탄 숯');if(!proto)return false;
 const result={...clone(proto),count:rec?.yield||1},first=rec&&!state.cookbook57[rec.id];
 consumeCookingSelection(sel);
 if(state.knowledge56?.potionKnown){for(const {item} of sel)if(item.type==='potion')state.knowledge56.potionKnown[item.potionKind]=true;if(result.type==='potion')state.knowledge56.potionKnown[result.potionKind]=true;}
 if(rec)state.cookbook57[rec.id]=true;
 giveItem(result);closeCooking();burst(state.player.x,state.player.y,rec?'#d5b56b':'#514036',rec?18:10,.75);
 addLog(rec?`${rec.name} ${rec.yield||1}개 조리 완료.${first?' 새 비방이 도감에 기록됐다.':''}`:'비방이 맞지 않아 검게 탄 숯이 나왔다.');
 globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:rec?.id==='vital_hotpot'?1.5:1,reason:"cookSelected57"}).value;
 return true;
}
// 랜덤 드랍에서는 완성 요리/재료/날생선을 제외하고 PDF 기본 음식만 가중치로 선택한다.
function naturalFoodPick(){const pool=[];const add=(n,w)=>{const d=foodDef(n);if(d&&state.floor>=(d.minFloor||1))for(let i=0;i<w;i++)pool.push(d)};add('주먹밥',30);add('말린 육포',28);add('식어버린 국밥',18);add('엽전 엿',21);if(state.floor>=6)add('독버섯 꼬치',8);if(state.floor>=16)add('신선로',3);if(state.floor>=21)add('신선도',1);return clone(foodOccurrencePick(pool))}
  const belt=document.createElement('div');
  function beltItemKnown(item){
    const svc=globalThis.__MANRU_CONSUMABLE56_ACTIONS__;
    if(item?.type==='potion')return svc?.knownPotion?.(item)===true;
    if(item?.type==='talisman')return svc?.knownTalisman?.(item)===true;
    return !!item&&item.identified!==false;
  }
  function beltItems(){
    const p=state?.player;if(!p)return [];
    if(V62.beltPlayer!==p){V62.beltPlayer=p;V62.beltOrder=[];V62.beltSig=''}
    const groups=new Map();
    p.inventory.forEach((item,idx)=>{if(!beltItemKnown(item)||!strategyItem62(item))return;const key=beltItemKey62(item);if(!groups.has(key))groups.set(key,{item,idx,key})});
    V62.beltOrder=V62.beltOrder.filter(key=>groups.has(key));
    for(const key of groups.keys())if(!V62.beltOrder.includes(key))V62.beltOrder.push(key);
    return V62.beltOrder.slice(0,3).map(key=>groups.get(key));
  }
  function escBelt(text){return String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  const RECIPES=[];
  const addFusionRecipe=(a,b,o)=>RECIPES.push({a,b,...o});
  const RECIPE=new Map(RECIPES.map(r=>[key74(r.a,r.b),r]));
  function identifyKind(kind,reason='효과 관찰'){
    const K=K74();if(!kind||kind==='identify'||K.talismanKnown[kind])return false;const t=BASE_KIND74.get(kind);if(!t)return false;const a=app74(t);K.talismanKnown[kind]=true;addLog(`부적 식별 · ${a.name} = ${t.name} (${reason}).`);burst(state.player.x,state.player.y,a.ink||'#d6b071',13,.55);return true
  }
  function identifyPotionKind(kind,reason='천안부 관찰'){
    const K=K74();if(!kind||K.potionKnown[kind])return false;K.potionKnown[kind]=true;const p=(window.MANRU_POTIONS||[]).find(x=>x.potionKind===kind);addLog(`약병 식별 · ${p?.name||kind} (${reason}).`);return true
  }
  function recipeItem(r){return{name:r.name,type:'talisman',talismanKind:r.kind,fusion74:true,element74:r.element||null,seal:r.seal,tier:3,rarity:r.kind.includes('upgrade')?'sealed':'rare',stackMax:2,count:1,targeted:r.mode==='target',targetRange:r.range||5,fusionMode74:r.mode,fusionEffect74:r.effect||null,ability:r.ability,desc:r.desc}}
  /* fusion UI */
  const fusion=document.createElement('div');
  function openFusion(first=null){if(!playerClassRules58().talismanFusion){closeFusion();toast('천하장사는 부적을 합성할 수 없다.');return false}if(!gameplayUiOpen57())return false;cancelAutoWalk();closeInventory();V74.first=first;setInteraction8('fusion74',true);renderFusion74()}
  function closeFusion(){V74.first=null;setInteraction8('fusion74',false);if(state)updateAll()}
  /* gear application */
  function gearEntries(){const a=[],p=state.player;if(p.weapon)a.push({item:p.weapon,label:'장착 무기'});if(p.armor)a.push({item:p.armor,label:'장착 방어구'});for(const it of p.inventory)if(['weapon','armor'].includes(it.type))a.push({item:it,label:'행낭'});if(V74.gearScroll?.talismanKind==='upgrade')for(const it of p.inventory)if(it.summonItem105==='book')a.push({item:it,label:'소환술 · HP '+summonHpCost(null,it.upgrade||0)+' → '+summonHpCost(null,1+(it.upgrade||0))+' · 기운 회복 '+summonRecovery105(it.upgrade||0)+' → '+summonRecovery105(1+(it.upgrade||0))+'턴'});return a}
  function openGear(scroll){if(scroll?.talismanKind==='upgrade'&&playerClassRules58().upgradeTalismanMode==='bodyBoost'&&!state.player.inventory.some(i=>i.summonItem105==='book'))return useBodyPower74(scroll);if(!gameplayUiOpen57())return false;V74.gearScroll=scroll;closeInventory();setInteraction8('gear74',true);renderGear()}
  function closeGear(){V74.gearScroll=null;setInteraction8('gear74',false)}
  function applyGear(entry){if(V74.gearScroll?.talismanKind==='upgrade'&&playerClassRules58().upgradeTalismanMode==='bodyBoost'&&entry?.item?.summonItem105!=='book'){closeGear();return false}const action=playerAction57('gear',{uiOwner:'gear74'});if(!action.ok)return false;const scroll=V74.gearScroll,it=entry?.item;if(!scroll||!it||!state.player.inventory.includes(scroll)||!gearEntries().some(e=>e.item===it))return false;if(scroll.talismanKind==='reinforce105'&&((it.tier||1)>2||it.artifactWeapon46)){toast('보강부적은 T2 이하 일반 무기·방어구에만 사용할 수 있다.');return false}if(['upgrade','reinforce105'].includes(scroll.talismanKind)){if(it.artifactWeapon46){toast('전설의 무기는 강화할 수 없다.');return false}if(it.summonItem105==='book'){summonState();it.upgrade=(it.upgrade||0)+1;state.player.summoning105.activeBook105=it.summonBookId105;summonState();}else if(it.type==='weapon')applyWeaponUpgrade(it);else if(it.type==='armor')applyArmorUpgrade(it);else{it.upgrade=(it.upgrade||0)+1;it.def=(it.def||0)+1;}identifyKind('upgrade','강화 효과 관찰');consumeRef(scroll);addLog(`${it.name} +${it.upgrade} 강화.`)}else{const elem=scroll.element74;if(!elem)return false;if(it.type==='weapon')it.elementBrand74=elem;else it.elementGuard74=elem;consumeRef(scroll);addLog(`${it.name}에 ${E74[elem].name} 각인을 새겼다.`)}closeGear();burst(state.player.x,state.player.y,E74[scroll.element74]?.color||'#d8b06c',18,.7);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"applyGear74"}).value;return true}
  function identifyN(n){let done=0;for(let c=0;c<n;c++){const tal=state.player.inventory.find(i=>i.type==='talisman'&&!known74(i));if(tal){identifyKind(tal.talismanKind,'천안부 해독');done++;continue}const pot=state.player.inventory.find(i=>i.type==='potion'&&!K74().potionKnown[i.potionKind]);if(pot){identifyPotionKind(pot.potionKind,'천안부 해독');done++;continue}break}return done}
  function castFusion(tx,ty){const action=playerAction57('modal-action',{uiOwner:'talismanTarget56'});if(!action.ok)return false;
    const a=V74.target;if(!a)return false;const item=a.item,e=a.effect,p=state.player;if(tx<0||ty<0||tx>=COLS||ty>=ROWS||entityDistance57({x:tx,y:ty},p)>a.range||!state.seen.has(k(tx,ty))){toast(`사거리 ${a.range}칸 안의 확인한 칸을 골라야 한다.`);return false}if(typeof lineClear==='function'&&!lineClear(p.x,p.y,tx,ty)&&!['guardblink','shockblink'].includes(e)){toast('부적의 기운이 벽에 막힌다.');return false}const ts=near74(tx,ty,1),depthStep=Math.floor((state.floor-1)/5),depth2=depthStep*2;projectileFX(p.x,p.y,tx,ty,E74[item.element74]?.color||'#d7b46d');
    const contactElem=({bomb_fire:'fire',bomb_shock:'shock',thunderpool:'shock',bomb_grass:'grass',bomb_water:'water',bomb_earth:'earth',bomb_ice:'ice',frostfield:'ice',icebind:'ice',lava:'fire'})[e];if(contactElem){const cells=elementCells105(tx,ty,['bomb_water','bomb_shock','thunderpool'].includes(e)?2:1),attackCells=e==='bomb_water'?elementCells105(tx,ty,1):cells;emitElementContact105(contactElem,cells,effectSource57(p),{baseDamage:18+depthStep*4});elementAttackFx105(contactElem,attackCells,p)}
    if(e==='bomb_fire'){for(const m of ts)hurtMon74(m,'fire',32+depthStep*6,true);addElemField74('fire',tx,ty,5,4)}
    else if(e==='bomb_shock'||e==='thunderpool'){const pool=[...state.monsters].filter(m=>isHostileTarget57(m)&&!m.hidden&&entityDistance57(m,{x:tx,y:ty})<=2).sort((m,n)=>entityDistance57(m,{x:tx,y:ty})-entityDistance57(n,{x:tx,y:ty}));for(const m of pool.slice(0,e==='thunderpool'?6:5))hurtMon74(m,'shock',e==='thunderpool'?27+depthStep*5:31+depthStep*6,true)}
    else if(e==='bomb_water'){for(const m of ts){hurtMon74(m,'water',26+depthStep*5,true);if(m.hp>0)push74(m,tx,ty,2)}}
    else if(e==='bomb_ice'||e==='frostfield'||e==='icebind'){for(const m of ts){hurtMon74(m,'ice',e==='bomb_ice'?24+depthStep*5:16+depthStep*3,true);if(m.hp>0){if(m.boss){if((m.controlCd54||0)<=0){m.stunned=1;m.controlCd54=4;m.controlCdTurn54=state.turn}}else m.stunned=Math.max(m.stunned||0,e==='icebind'||e==='frostfield'?2:1)}}}
    else if(e==='bomb_grass'){for(const m of ts){hurtMon74(m,'grass',23+depthStep*5,true);if(m.hp>0){m.poison74=Math.max(m.poison74||0,4);if(!m.boss)m.stunned=Math.max(m.stunned||0,1)}}}
    else if(e==='bomb_earth'){for(const m of ts){hurtMon74(m,'earth',27+depthStep*5,true);if(m.hp>0){push74(m,tx,ty,1);if(!m.boss)m.stunned=Math.max(m.stunned||0,1)}}}
    else if(e==='steam'){const cells=elementCells105(tx,ty,1);emitElementContact105('water',cells,effectSource57(p));for(const q of cells)steamCell105(q.x,q.y);elementAttackFx105('water',cells,p);VisibilityService.compute()}
    else if(e==='lava'){for(const m of ts)hurtMon74(m,'fire',24+depthStep*5,true);for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)if(Math.abs(ox)+Math.abs(oy)<=1)tempTile74(tx+ox,ty+oy,TT.LAVA,5,'lava')}
    else if(e==='bindblast'){const dmg=24+depthStep*5;for(const m of ts){const dealt=damageEntity(m,dmg,state.player);if(dealt>0)floatText(m.x,m.y,`-${dealt}`,'#e7c17b',12);if(m.hp<=0)killMonster(m);else if(m.boss){m.controlCd54=Math.max(0,m.controlCd54||0);if(m.controlCd54<=0){m.stunned=Math.max(m.stunned||0,1);m.controlCd54=4;m.controlCdTurn54=state.turn}}else m.stunned=Math.max(m.stunned||0,3)}}
    else if(e==='shockblink'||e==='guardblink'){if(!safeBlink74(tx,ty)){toast('현재 열린 진행 구역 안의 안전한 칸만 접을 수 있다.');return false}const ox=p.x,oy=p.y,landing=resolvePlayerLanding57(tx,ty,{cause:'fusion-blink',resetVisual:true});if(!landing.ok){toast('이동부적이 공간을 접지 못했다.');return false}if(e==='shockblink'){const cells=elementCells105(0,0,0,[...elementCells105(ox,oy,1),...elementCells105(tx,ty,1)]);emitElementContact105('shock',cells,effectSource57(p),{baseDamage:18+depthStep*4});elementAttackFx105('shock',cells,{x:ox,y:oy});const unique=[...new Set([...near74(ox,oy,1),...near74(tx,ty,1)])];for(const m of unique)if(m.hp>0)hurtMon74(m,'shock',18+depthStep*4,true)}else state.status.ward=Math.max(state.status.ward||0,7)}
    burst(tx,ty,E74[item.element74]?.color||'#d9b66f',24,.9);consumeRef(item);cancelTalismanTargeting(true);addLog(`${item.name}: ${item.ability}.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"castFusion74"}).value;return true
  }
  function useFusionInstant(item){const e=item.fusionEffect74,p=state.player;if(item.fusionMode74==='gear'){openGear(item);return true}if(e==='fireward'){state.status.ward=Math.max(state.status.ward||0,8);state.elementWard74={element:'fire',ttl:8};addElemField74('fire',p.x,p.y,3,3)}else if(e==='pureward'){cleanseStatuses();state.status.ward=Math.max(state.status.ward||0,9);state.elementWard74={element:'water',ttl:9}}else if(e==='lifemap'){reveal74();p.hp=Math.min(p.maxHp,p.hp+8)}else if(e==='stoneward'){state.status.ward=Math.max(state.status.ward||0,9);state.elementWard74={element:'earth',ttl:9}}else if(e==='regrowth'){state.status.regen=Math.max(state.status.regen||0,7);for(const m of near74(p.x,p.y,1))if(!m.boss)m.stunned=Math.max(m.stunned||0,1)}else if(e==='bulwark'){state.status.ward=Math.max(state.status.ward||0,7);let n=0;for(const[dx,dy]of randOrder74(DIRS4))if(n<3&&tempTile74(p.x+dx,p.y+dy,TT.WALL,5,'bulwark'))n++}else if(e==='heaveneye'){const n=reveal74(),ids=identifyN(2);addLog(`천안부적: 지도 공개 · 숨은 문 ${n} · 감정 ${ids}종.`)}else return false;consumeRef(item);burst(p.x,p.y,E74[item.element74]?.color||'#d9b66f',22,.8);if(e!=='heaveneye')addLog(`${item.name}: ${item.ability}.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useFusionInstant74"}).value;return true}
  function addItem(r,special=false){const a=roomFreeCells90(r);if(!a.length)return false;const p=a[Math.floor(globalThis.__MANRU_RANDOM57__()*a.length)];try{dropRandomItem(p,special);return true}catch(_){return false}}
  function biasItems(){
    if(!state?.items?.length)return;const important=[...(state.itemBiasZones94||[]),...(state.purposeRooms90||[]),...(state.featureRooms||[]).filter(r=>/보급|병기|저장|비밀|사당|성소|정자|굴|제단|외곽/.test(r.name||''))];if(!important.length)return;const occupiedItems=new Set(state.items.map(i=>key85(i.x,i.y)));let moved=0;
    for(const it of state.items){if(globalThis.__MANRU_RANDOM57__()>(state.specialFloor?.68:.50))continue;if(important.some(r=>it.x>=r.x&&it.x<r.x+r.w&&it.y>=r.y&&it.y<r.y+r.h))continue;const r=choice(important),cells=zoneCells94(r).filter(p=>!occupiedItems.has(key85(p.x,p.y)));if(!cells.length)continue;const p=choice(cells);occupiedItems.delete(key85(it.x,it.y));it.x=p.x;it.y=p.y;occupiedItems.add(key85(p.x,p.y));moved++}
    state.itemBiasMoved94=moved;
  }
/* ===== MANRU v9.6.7: COMMON AMMUNITION / BOW-BIASED FLOOR LOOT ===== */
const AMMO_TYPES=[
    {name:'목제 화살',type:'ammo',ammoKind:'wood_arrow',ammoFamily:'arrow',rarity:'common',stackMax:36,minFloor:1,weight:55,spawnMin:10,spawnMax:18,atkBonus:0,pierce:0,color:'#d7c092',desc:'가볍고 값싼 표준 화살. 한 묶음에 많이 들어 있어 가장 흔하게 발견된다.'},
    {name:'철촉 화살',type:'ammo',ammoKind:'iron_arrow',ammoFamily:'arrow',rarity:'common',stackMax:30,minFloor:2,weight:32,spawnMin:8,spawnMax:14,atkBonus:1,pierce:0,color:'#bcc3c7',desc:'철제 화살촉을 단 보급용 화살. 목제 화살보다 약간 더 강한 타격을 준다.'},
    {name:'관통 화살',type:'ammo',ammoKind:'piercing_arrow',ammoFamily:'arrow',rarity:'common',stackMax:24,minFloor:7,weight:13,spawnMin:5,spawnMax:10,atkBonus:0,pierce:2,color:'#8fa4b0',desc:'가늘고 단단한 촉으로 갑옷 틈을 노리는 화살. 명중 시 적 방어를 2만큼 무시한다.'}
  ];
  const ammoStacks=()=>state?.player?.inventory?.filter(i=>i?.type==='ammo'&&(i.count||0)>0)||[];
  const totalAmmo=()=>ammoStacks().reduce((n,i)=>n+(i.count||1),0);
  function ammoDef(kind){return AMMO_TYPES.find(a=>a.ammoKind===kind)||null}
  function weightedAmmo(){const pool=AMMO_TYPES.filter(a=>(a.minFloor||1)<=Math.max(1,state?.floor||1));let sum=pool.reduce((n,a)=>n+(a.weight||1),0),r=globalThis.__MANRU_RANDOM57__()*Math.max(1,sum);for(const a of pool){r-=a.weight||1;if(r<=0)return a}return pool[0]||AMMO_TYPES[0]}
  function makeAmmo(def=weightedAmmo(),boost=false){const q=clone(def);q.count=randInt967(q.spawnMin||6,q.spawnMax||12);if(boost)q.count+=randInt967(2,5);return q}
  function selectedAmmo(){if(!state?.player)return null;const stacks=ammoStacks();if(!stacks.length)return null;let a=stacks.find(i=>i.ammoKind===state.player.loadedAmmoKind);if(!a){const order=['wood_arrow','iron_arrow','piercing_arrow'];a=[...stacks].sort((x,y)=>order.indexOf(x.ammoKind)-order.indexOf(y.ammoKind))[0];state.player.loadedAmmoKind=a.ammoKind}return a}
  function consumeAmmo(stack){if(!consumeItemQuantity(stack))return false;if(!state.player.inventory.some(i=>i.ammoKind===state.player.loadedAmmoKind)){state.player.loadedAmmoKind=null;selectedAmmo()}return true}
  function ammoUnit(salt=0){
    const src=`${state?.runId984||window.__MANRU_RUN_SEED984||'legacy'}|${state?.floor||1}|${salt}`;let h=2166136261>>>0;
    for(let i=0;i<src.length;i++){h^=src.charCodeAt(i);h=Math.imul(h,16777619)>>>0}h^=h>>>16;h=Math.imul(h,2246822507)>>>0;h^=h>>>13;return(h>>>0)/4294967296;
  }
  function controlledAmmo(index=0){
    const pool=AMMO_TYPES.filter(a=>(a.minFloor||1)<=Math.max(1,state?.floor||1));if(!pool.length)return null;
    let sum=pool.reduce((n,a)=>n+(a.weight||1),0),r=ammoUnit(100+index)*Math.max(1,sum),def=pool[0];for(const a of pool){r-=a.weight||1;if(r<=0){def=a;break}}
    const item=clone(def),lo=def.spawnMin||1,hi=def.spawnMax||lo;item.count=lo+Math.floor(ammoUnit(200+index)*(hi-lo+1));
    const ok=(x,y)=>x>0&&y>0&&x<COLS-1&&y<ROWS-1&&ReachabilityService.playerPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!(state.player.x===x&&state.player.y===y)&&!OccupancyService.isOccupied(x,y)&&!state.items.some(i=>i.x===x&&i.y===y);
    const cells=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(ok(x,y))cells.push({x,y});if(!cells.length)return null;
    const start=Math.floor(ammoUnit(300+index)*cells.length)%cells.length,p0=cells[start];item.x=p0.x;item.y=p0.y;PlacementService.placeItem(item);return item;
  }
  function upgradeProto(){return (window.MANRU_TALISMANS||[]).find(i=>i.talismanKind==='upgrade')||null}
  function isLegacyUpgrade(i){return !!i&&(i.name==='개량 인장'||i.type==='upgrade')}
  function isUpgrade(i){return !!i&&(i.talismanKind==='upgrade'||isLegacyUpgrade(i))}
  function unidentifiedItem(it){
    if(!it||it.mineItem105||it.branchExclusive105)return false;const api=globalThis.__MANRU_CONSUMABLE56_ACTIONS__;
    if(it.type==='potion')return !api?.knownPotion?.(it);
    if(it.type==='talisman')return !api?.knownTalisman?.(it);
    return it.identified===false||it.isIdentified===false||it.unidentified===true;
  }
  function itemPublicName(it){if(it?.mineItem105)return it.name;if(it?.branchExclusive105)return it.name;
    if(it?.type==='potion'||it?.type==='talisman')return globalThis.__MANRU_CONSUMABLE56_ACTIONS__?.publicName?.(it)||(it.type==='potion'?'미확인 약병':'미확인 부적');
    if(it&&(it.identified===false||it.isIdentified===false||it.unidentified===true))return'미감정 물건';
    return it?.name||'물품';
  }
  function unidentifiedInfo(it){
    if(it?.type==='potion')return{name:itemPublicName(it),desc:'아직 감정되지 않은 약병이다. 겉으로 보이는 색과 용기 외에는 효과나 성능을 알 수 없다.',hint:''};
    if(it?.type==='talisman')return{name:itemPublicName(it),desc:'아직 감정되지 않은 부적이다. 종이와 문양 외에는 어떤 술법이 묶였는지 알 수 없다.',hint:''};
    return{name:'미감정 물건',desc:'아직 감정되지 않은 물건이다. 정체와 성능은 감정하기 전에는 확인할 수 없다.',hint:''};
  }
  function itemInfo(it){
    if(unidentifiedItem(it))return unidentifiedInfo(it);
    const classDesc=classItemDescription58(it);if(classDesc)return{name:itemPublicName(it),meta:[itemTypeLabel(it.type)],stats:[],ability:'괴력 · ATK +2 · DEF +7',desc:classDesc,hint:'장비 강화 불가 · 괴력 중 재사용 불가'};
    const hint=it?.branchGuide105?(it.guideHint105||'인벤토리에서 읽기를 눌러 안내 내용을 다시 확인할 수 있다.'):state?.artifactDungeon46&&it?.legendaryWeapon47?'전설무기를 확보했다면 입구 쪽 귀환문으로 돌아가 원래 만루 층에 복귀할 수 있다.':'',stats=[],meta=[];
    meta.push(it.legendaryWeapon47?'전설의 무기':itemTypeLabel(it.type));if(it.tier)meta.push(`TIER ${it.tier}`);if(it.rarity)meta.push(String(it.rarity).toUpperCase());if((it.upgrade||0)>0)meta.push(`강화 +${it.upgrade}`);if((it.count||1)>1)meta.push(`수량 ×${it.count}`);
    if(it.atk)stats.push(`ATK +${displayNumber53(it.atk)}`);if(it.def)stats.push(`DEF ${it.def>0?'+':''}${displayDef42(it.def)}`);if(it.eva)stats.push(`EVA ${it.eva>0?'+':''}${displayNumber53(it.eva)}`);if(it.will)stats.push(`WILL +${displayNumber53(it.will)}`);if(it.vision)stats.push(`VIS ${it.vision>0?'+':''}${displayNumber53(it.vision)}`);if(it.focus)stats.push(`FOCUS +${displayNumber53(it.focus)}`);if(it.speed)stats.push(`공격속도 ${it.speed}× · ${attackTurnCost(it).toFixed(1)}턴`);if(it.range)stats.push(`사거리 ${displayNumber53(it.range)}`);if(it.heal)stats.push(`HP +${displayNumber53(it.heal)}`);if(it.focusGain)stats.push(`FOCUS +${displayNumber53(it.focusGain)}`);if(it.hunger)stats.push(`허기 +${displayNumber53(it.hunger)}`);if(it.curse991){const svc=globalThis.__MANRU_ITEM_IDENTITY991__,c=svc?.curseDef?.(it),stacks=it.curseActive991?(svc?.curseStacks?.(it.curse991)||1):0,power=stacks?svc?.cursePower?.(it.curse991)||1:1;stats.push(`저주 · ${c?.name||it.curse991}${stacks>1?` · 중첩 ${stacks} / 효과 ×${power}`:''}`)}else if(it.curse)stats.push(`저주 · ${it.curse}`);
    return{name:itemPublicName(it),meta,stats,ability:it.ability&&it.ability!=='없음'?it.ability:'',desc:dedupeProse986(String(it.desc||'누군가 남겨 둔 물건이다.').replace(/거리\s*\d+칸[^.。]*[.。]?/g,'')),hint};
  }
/* ===== MANRU v9.9.1 CURSE / HOLY / IDENTIFY / SKILL UX ===== */
const GEAR_SLOT_TYPES=new Set(['weapon','armor','cloak','relic','trinket']);
  const CURSE_RATE=.15;
  const CURSE_CATALOG=[
    {id:'thirst',name:'갈증',desc:'공격이 빗나가면 기력 1을 잃는다.'},
    {id:'blood_hunger',name:'피의 굶주림',desc:'전투가 8턴 이상 끊기면 3턴마다 허기 1을 잃는다.'},
    {id:'binding',name:'속박',desc:'이동 행동 비용이 12% 증가한다.'},
    {id:'clang',name:'쇠울림',desc:'적의 기본 감지 거리가 2칸 늘어난다.'},
    {id:'presence',name:'기척',desc:'평소 감지 범위 밖에서도 적이 2칸 더 멀리서 기척을 잡는다.'},
    {id:'drain',name:'흡기',desc:'최대 기력 +2를 얻지만 5턴마다 현재 기력을 1 흡수한다.'},
    {id:'nightmare',name:'악몽',desc:'시야 -1 · WILL -2.'},
    {id:'clumsy',name:'둔손',desc:'공격 행동 비용이 8% 증가한다.'},
    {id:'brittle',name:'균열',desc:'DEF -1 · EVA -1.'},
    {id:'frailty_cycle',name:'쇠약진',desc:'11턴마다 쇠약에 2턴 빠진다.',periodic:{period:11,status:'weaken',turns:2}},
    {id:'venom_cycle',name:'독맥',desc:'12턴마다 중독에 2턴 빠진다.',periodic:{period:12,status:'poison',turns:2}},
    {id:'blood_clock',name:'혈루',desc:'13턴마다 출혈에 2턴 빠진다.',periodic:{period:13,status:'bleed',turns:2}},
    {id:'blind_cycle',name:'암막',desc:'14턴마다 실명에 2턴 빠진다.',periodic:{period:14,status:'blind',turns:2}},
    {id:'seal_cycle',name:'기봉진',desc:'15턴마다 기봉인에 2턴 빠진다.',periodic:{period:15,status:'skillSeal',turns:2}},
    {id:'upset_cycle',name:'역위',desc:'17턴마다 배탈에 2턴 빠진다.',periodic:{period:17,status:'upset',turns:2}},
    {id:'spasm_cycle',name:'경련',desc:'19턴마다 기절에 1턴 빠진다.',periodic:{period:19,status:'stun',turns:1}}
  ];
  // Curse kind is not fixed to an equipment category. Every ordinary gear slot draws from
  // the same catalog, so the same curse can appear on different equipment and truly stack.
  const CURSES=Object.fromEntries([...GEAR_SLOT_TYPES].map(type=>[type,CURSE_CATALOG]));
  const CURSE_BY_ID=new Map(CURSE_CATALOG.map(v=>[v.id,v]));
  const publicGearType=t=>({weapon:'무기',armor:'갑옷',cloak:'망토',relic:'유물',trinket:'장신구'})[t]||'장비';
  const isGearItem=i=>!!i&&GEAR_SLOT_TYPES.has(i.type);
  const curseDefOf=i=>CURSE_BY_ID.get(i?.curse991)||null;
  const isUnknownPotion=i=>i?.type==='potion'&&i.potionKind&&!state?.knowledge56?.potionKnown?.[i.potionKind];
  const isUnknownGear=i=>isGearItem(i)&&i.identified===false;
  const isUnidentifiedItem=i=>!!i&&(isUnknownPotion(i)||isUnknownTalisman991(i)||isUnknownGear(i)||i.identified===false||i.isIdentified===false||i.unidentified===true);
  function chooseCurse(item){
    const pool=CURSES[item.type]||[];return pool.length?pool[Math.floor(globalThis.__MANRU_RANDOM57__()*pool.length)]:null;
  }
  function curseStackCount(id,actor=state?.player){let n=0;for(const slot of GEAR_SLOT_TYPES){const it=actor?.[slot];if(it?.curseActive991&&it.curse991===id)n++}return n}
  function curseMultiplier(id,actor=state?.player){const n=curseStackCount(id,actor);return n>0?Math.pow(2,n-1):0}
  function activateItemCurse(item,actor=state?.player){if(!item?.curse991)return 0;const prior=curseStackCount(item.curse991,actor);item.curseActive991=true;item.curseActivatedTurn991=state?.turn??0;if(prior===0)armCurseClock991(item.curse991,item.curseActivatedTurn991,actor);else syncCurseClocks991(actor);return prior+1}
function undeadItemCurse(p=state.player){
    if(!p)return false;if(p.weapon?.elementBrand74==='holy'||p.armor?.elementGuard74==='holy')return false;
    const chance=Number.isFinite(p.itemCurseChance991)?p.itemCurseChance991:.05;
    if(globalThis.__MANRU_RANDOM57__()<chance){const gear=[...new Set([...[...GEAR_SLOT_TYPES].map(slot=>p[slot]),...(p.inventory||[])])].filter(canReceiveHostileCurse991);if(gear.length){const item=choice(gear);prepareGearCurse(item,{hostile:true,actor:p});if(item.curse991){p.itemCurseChance991=.01;addLog('차가운 원념이 소지품에 스며들었다.');return true}}}
    p.itemCurseChance991=Math.min(.05,chance+.005);return false;
  }
function prepareGearCurse(item,opt={}){
    if(!isGearItem(item))return item;
    if(opt.hostile){if(!canReceiveHostileCurse991(item))return item;const curse=chooseCurse(item);if(curse){item.curse991=curse.id;item.curseRoll991=true;if([...GEAR_SLOT_TYPES].some(slot=>(opt.actor||state.player)[slot]===item)){activateItemCurse(item,opt.actor||state.player);revealItemCurse(item)}else if(item.identified)revealItemCurse(item)}return item}
    if(item.curseImmune991||item.name==='용의 여의주 파편'){item.curseImmune991=true;item.identified=true;delete item.curse991;delete item.curse;return item}
    if(opt.known){item.identified=true;return item}
    if(item.identified==null)item.identified=false;
    if(item.curseRoll991==null){item.curseRoll991=true;if(globalThis.__MANRU_RANDOM57__()<CURSE_RATE){const c=chooseCurse(item);if(c)item.curse991=c.id}}
    return item;
  }
  function revealItemCurse(item){const c=curseDefOf(item);if(c)item.curse=`${c.name} — ${c.desc} · 같은 저주를 중복 장착하면 효과가 1→2→4→8배로 증폭된다.`;else delete item.curse;return c}
  function identifyGearItem(item,reason='감정'){if(!isGearItem(item))return false;const was=item.identified===false;item.identified=true;const c=revealItemCurse(item);if(was)addLog(`${item.name} 완전 감정${c?` · 저주 ${c.name}`:' · 저주 없음'} (${reason}).`);return was}
  function useIdentifyScrollOn(item,reason='감정부적'){
    if(!item)return false;
    if(isUnknownGear(item))return identifyGearItem(item,reason);
    if(isUnknownPotion(item)){state.knowledge56=state.knowledge56||{};state.knowledge56.potionKnown=state.knowledge56.potionKnown||{};state.knowledge56.potionKnown[item.potionKind]=true;addLog(`약병 완전 감정 · ${item.name} (${reason}).`);return true}
    if(isUnknownTalisman991(item)){state.knowledge56=state.knowledge56||{};state.knowledge56.talismanKnown=state.knowledge56.talismanKnown||{};state.knowledge56.talismanKnown[item.talismanKind]=true;addLog(`부적 완전 감정 · ${item.name} (${reason}).`);return true}
    if(item.identified===false||item.isIdentified===false||item.unidentified===true){item.identified=true;item.isIdentified=true;item.unidentified=false;addLog(`물품 완전 감정 · ${item.name||'물품'} (${reason}).`);return true}
    return false;
  }
  function purifyGearItem(item){if(!isGearItem(item)||!item.curse991)return false;const id=item.curse991,c=curseDefOf(item);delete item.curse991;delete item.curse;delete item.curseActive991;delete item.curseActivatedTurn991;item.cursePurified991=true;item.identified=true;if(curseStackCount(id)===0)delete curseClocks991()[id];else syncCurseClocks991();addLog(`${item.name}의 ${c?.name||'저주'}가 정화됐다. 장비와 강화 수치는 그대로다.`);return true}
  function cursedEntries(){const p=state?.player;if(!p)return[];const out=[];for(const slot of GEAR_SLOT_TYPES){const it=p[slot];if(it?.curse991)out.push({item:it,slot,equipped:true})}for(const it of p.inventory||[])if(isGearItem(it)&&it.curse991&&!isUnknownGear(it))out.push({item:it,slot:null,equipped:false});return out}
  function consumeInventoryItem(item){const i=state?.player?.inventory?.indexOf(item)??-1;if(i<0)return false;consumeOne(i);return true}
  function markHolyKnown(){if(!state)return;state.knowledge56=state.knowledge56||{};state.knowledge56.talismanKnown=state.knowledge56.talismanKnown||{};state.knowledge56.talismanKnown.holy=true}
  function holyNova(power=8,radius=2){if(state.floor>=11)alertNearby(state.player.x,state.player.y,9,'explosion');let n=0;for(const m of [...(state?.monsters||[])]){if(m.hp<=0||entityDistance57(m,state.player)>radius)continue;if(!['undead','spirit'].includes(m.kind)&&!monsterIsEvil(m))continue;if(n===0)markCombatActivity57('holy-nova');const dmg=Math.max(3,Math.round((power+Math.floor((state.floor-1)/5)*2)*(m.boss?.6:1)));const dealtDamage=damageEntity(m,dmg, state.player);if(dealtDamage>0)floatText(m.x,m.y,`-${dealtDamage}`,'#ffe7a0',13,'holy');impact(m.x,m.y,'#f1cf73',5);n++;if(m.hp<=0)killMonster(m)}burst(state.player.x,state.player.y,'#f2d783',24,.85);return n}
  function useHolyItem(item){
    markHolyKnown();const cursed=cursedEntries();
    if(cursed.length){openChoice('성부 · 저주 정화','정화할 장비 하나를 고른다. 장비와 강화 수치는 유지된다.',cursed,{type:'PURIFY_CHOICE',args:[item]});return true}
    const cleansed=cleanseOne991(),n=holyNova(18,2);consumeInventoryItem(item);closeInventory();addLog(`성부: 성광이 번졌다${n?` · 사기 ${n}체 타격`:''}${cleansed?' · 상태 정화':''}.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHoly991"}).value;return true;
  }
  function useIdentifyItem(item){const entries=(state?.player?.inventory||[]).filter(v=>v!==item&&isUnidentifiedItem(v));if(!entries.length){toast('감정할 미감정 아이템이 없다. 감정부적은 소모되지 않는다.');if(inventoryOpen)renderInventory();return false}openChoice('감정부적 · 완전 감정','미감정 아이템 하나를 직접 고른다.',entries,{type:'IDENTIFY_CHOICE',args:[item]});return true}
  function useHolyFusionItem(item){
    const e=item.fusionEffect74||'',p=state.player;
    if(e==='identify_all991'){const n=identifyAllInventory991('감강부적');consumeInventoryItem(item);closeInventory();burst(p.x,p.y,'#e1c77f',24,.85);addLog(`감강부적: 행낭의 미감정 아이템 ${n}개를 완전 감정했다.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    if(e==='holy_identify991'){let n=0;for(const it of p.inventory||[])if(isUnknownGear(it)&&identifyGearItem(it,'성감부적'))n++;consumeInventoryItem(item);closeInventory();holyNova(13,1);addLog(`성감부적: 미감정 장비 ${n}개를 감정해 저주 여부를 드러냈다.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    if(e.startsWith('holy_elem_')){const elem=e.slice('holy_elem_'.length,-3);const names={fire:'화염',shock:'뇌전',water:'수류',ice:'빙결',grass:'목령',earth:'대지'};cleanseStatuses(state.status);state.status.ward=Math.max(state.status.ward||0,6);state.elementWard74={element:elem,ttl:7};const n=holyNova(16,2);consumeInventoryItem(item);closeInventory();addLog(`${item.name}: 성광 정화 · ${names[elem]||elem} 가호 · 사기 ${n}체 타격.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    if(e==='holy_blast991'){const n=holyNova(30,3);cleanseOne991();consumeInventoryItem(item);closeInventory();addLog(`성폭부적: 성광 폭발로 사기 ${n}체를 태웠다.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    if(e==='holy_mapping991'){const n=revealMap();cleanseStatuses(state.status);consumeInventoryItem(item);closeInventory();addLog(`성안부적: 층을 밝혔다 · 숨은 문 ${n}개 · 상태 정화.`);burst(p.x,p.y,'#f0da8a',22,.8);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    if(e==='holy_ward991'){cleanseStatuses(state.status);state.status.ward=Math.max(state.status.ward||0,11);consumeInventoryItem(item);closeInventory();addLog('성호부적: 해로운 상태를 씻고 강한 보호막을 둘렀다.');burst(p.x,p.y,'#f0da8a',24,.85);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    if(e==='holy_blink991'){const f=p.facing||{x:0,y:-1};let best={x:p.x,y:p.y};for(let d=1;d<=5;d++){const x=p.x+f.x*d,y=p.y+f.y*d,t=state.map[y]?.[x];if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>=COLS||y>=ROWS||!ReachabilityService.playerPassable(x,y)||OccupancyService.isOccupied(x,y)||[TT.TRAP,TT.SNARE,TT.LAVA,TT.WATER,TT.VOID,TT.MERCURY].includes(t))break;if(validatePlayerTransfer57(x,y,{cause:'holy-blink'}).ok)best={x,y};if(t===TT.PORTAL)break}if(best.x===p.x&&best.y===p.y){toast('성광이 짚을 안전한 착지점이 없다.');return false}const landing=resolvePlayerLanding57(best.x,best.y,{cause:'holy-blink',resetVisual:true});if(!landing.ok){toast('성광이 현재 열린 길을 넘지 못했다.');return false}cleanseStatuses(state.status);consumeInventoryItem(item);closeInventory();burst(p.x,p.y,'#f5df9a',22,.8);addLog('성축부적: 안전한 발판을 짚어 점멸하고 몸을 정화했다.');globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    if(e==='holy_bind991'){let n=0;for(const m of state.monsters||[]){if(m.hp<=0||entityDistance57(m,p)>2)continue;const evil=['undead','spirit'].includes(m.kind)||monsterIsEvil(m);if(m.boss)m.stunned=Math.max(m.stunned||0,evil?1:0);else m.stunned=Math.max(m.stunned||0,evil?3:1);n++}consumeInventoryItem(item);closeInventory();burst(p.x,p.y,'#ecd48c',22,.75);addLog(`성봉부적: 주변 ${n}체를 봉박했다.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useHolyFusion991"}).value;return true}
    return false;
  }
  // Curse assignment is a real 15% roll on generated gear only. Starter gear and boss uniques are excluded.
  // Canonical dropRandomItem marks runtime drops through __MANRU_ITEM_IDENTITY991__.markGear;
  // applyCurses991 below covers every generated/restored gear container after final geometry.
  function applyCursesToAllGear(){if(!state)return;for(const it of state.items||[])prepareGearCurse(it);for(const it of state.player?.inventory||[])if(isGearItem(it)&&it.identified==null)prepareGearCurse(it);for(const slot of GEAR_SLOT_TYPES){const it=state.player?.[slot];if(it){it.identified=true;if(it.curse991)revealItemCurse(it)}}}
  // One guaranteed holy talisman per five-floor chapter, plus its low-weight normal random inclusion.
  function holyProto(){return(window.MANRU_TALISMANS||[]).find(t=>t.talismanKind==='holy')}
  function holySchedule(){if(!state)return null;state.holy991=state.holy991||{schedule:{},spawned:{}};const ch=Math.max(0,Math.min(4,Math.floor((state.floor-1)/5))),k=String(ch);if(!state.holy991.schedule[k]){const lo=ch===0?2:ch*5+1,hi=ch*5+5;state.holy991.schedule[k]=lo+Math.floor(globalThis.__MANRU_RANDOM57__()*(hi-lo+1))}return{ch,k,floor:state.holy991.schedule[k]}}
  function holyCell(){for(let n=0;n<80;n++){const q=PlacementService.randomFloor(0),t=state.map[q.y]?.[q.x];if(ReachabilityService.playerPassable(q.x,q.y)&&!OccupancyService.isOccupied(q.x,q.y)&&!state.items.some(i=>i.x===q.x&&i.y===q.y)&&![TT.STAIR,TT.TRAP,TT.SNARE,TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY].includes(t))return q}return{x:state.player.x,y:state.player.y}}
  function ensureHolyDrop(){const h=holySchedule(),proto=holyProto();if(!h||!proto||h.floor!==state.floor||state.holy991.spawned[h.k])return false;const q=holyCell(),it=clone(proto);Object.assign(it,{x:q.x,y:q.y,count:1,coreHoly991:true});PlacementService.placeItem(it);state.holy991.spawned[h.k]=true;return true}
  function applyCurseStats(stats,actor=state.player){const drainStacks=curseStackCount('drain',actor),nightmare=curseMultiplier('nightmare',actor),brittle=curseMultiplier('brittle',actor);if(drainStacks>0)stats.maxFocus+=2*drainStacks;if(nightmare>0){stats.will-=Math.round(2*nightmare);stats.vision-=Math.round(nightmare)}if(brittle>0){stats.def-=Math.round(brittle);stats.eva-=Math.round(brittle)}return stats}
  function triggerPeriodicCurse(c,clocks=syncCurseClocks991(),actor=state.player){const power=curseMultiplier(c.id,actor),p=c.periodic,clock=clocks[c.id];if(!power||!p||!clock||state.turn<clock.next)return false;while(clock.next<=state.turn)clock.next+=p.period;const turns=Math.max(1,Math.round(p.turns*power)),ok=applyCombatStatus(actor,p.status,turns,1,{log:`${c.name}의 저주가 발작했다.`});if(ok)floatText(actor.x,actor.y,`${c.name} ×${power}`,'#d67869',10);return ok}
  function tickActorCurses(actor){
   if(!state||!actor||actor.hp<=0||actor.curseTick105===state.turn)return false;actor.curseTick105=state.turn;let dirty=false;const clocks=syncCurseClocks991(actor),blood=curseMultiplier('blood_hunger',actor),bloodClock=clocks.blood_hunger;
   if(blood>0&&bloodClock&&state.turn>=bloodClock.next){const loss=Math.max(1,Math.round(blood));if(Number.isFinite(actor.hunger))actor.hunger=Math.max(0,actor.hunger-loss);while(bloodClock.next<=state.turn)bloodClock.next+=3;dirty=true}
   const drain=curseMultiplier('drain',actor),drainClock=clocks.drain;if(drain>0&&drainClock&&state.turn>=drainClock.next){while(drainClock.next<=state.turn)drainClock.next+=5;if(actor.focus>0){const loss=Math.min(actor.focus,Math.max(1,Math.round(drain)));actor.focus-=loss;addLog(`흡기의 저주가 현재 기력을 ${loss} 빨아들였다.`);dirty=true}}
   for(const c of CURSE_CATALOG)if(c.periodic&&triggerPeriodicCurse(c,clocks,actor))dirty=true;return dirty;
  }
  // Gear identity is public from the moment it appears. Identification hides only the rolled +n, curse and magic details.
  function baseGearDef(it){if(!isGearItem(it)||!it?.name)return null;const pool=it.type==='weapon'?WEAPONS:it.type==='armor'?ARMORS:it.type==='cloak'?CLOAKS:it.type==='relic'?RELICS:TRINKETS;return pool.find(v=>v.name===it.name)||null}
  function publicGearStats(it){const b=baseGearDef(it)||it,out=[];if(b.atk)out.push(`ATK +${b.atk}`);if(b.def)out.push(`DEF ${b.def>0?'+':''}${displayDef42(b.def)}`);if(b.eva)out.push(`EVA ${b.eva>0?'+':''}${b.eva}`);if(b.speed)out.push(`속도 ${b.speed}×`);if(b.range)out.push(`사거리 ${b.range}`);if(b.vision)out.push(`VIS ${b.vision>0?'+':''}${b.vision}`);if(b.will)out.push(`WILL +${b.will}`);return out}
function normalizeAllItems(){
  if(!state?.player)return;
  for(const slot of ['weapon','armor','cloak','relic','trinket'])normalizeSavedItem(state.player[slot]);
  for(const it of state.player.inventory||[])normalizeSavedItem(it);
  for(const it of state.items||[])normalizeSavedItem(it);
}
const RESTAURANT_FOODS=['주먹밥','말린 육포','식어버린 국밥','엽전 엿','깨끗한 물'];
function startingGearFor(id){const cls=CLASSES.find(c=>c.id===id);return{weapon:cls?.startWeapon?{...(WEAPONS.find(w=>w.name===cls.startWeapon)||{}),name:cls.startWeapon}:null,armor:{...(ARMORS[0]||{}),name:ARMORS[0]?.name||'경량복',tier:1,rarity:'common'},cloak:null,relic:null,trinket:null}}
function naturalGearUpgrade(item,rnd){const roll=rnd(),n=roll<MOUNTAIN_GEAR_CHANCE105.plus2?2:roll<MOUNTAIN_GEAR_CHANCE105.plus2+MOUNTAIN_GEAR_CHANCE105.plus1?1:0;for(let i=0;i<n;i++)if(item.type==='armor')applyArmorUpgrade(item);else if(item.type==='weapon')applyWeaponUpgrade(item);item.naturalUpgrade105=n;return item;}
function anvilGear(item){return !!item&&['weapon','armor'].includes(item.type)&&!item.artifactWeapon46&&!item.artifactId46&&!item.curse991&&!item.curse&&!item.curseActive991&&(item.count??1)===1;}
