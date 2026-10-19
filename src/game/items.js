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
  if(item.mineItem105)return mineUseItem(item);
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
    const K=ensureKnowledge56();if(!kind||K.potionKnown[kind])return false;K.potionKnown[kind]=true;const p=POTION_BY_KIND.get(kind),a=APP_BY_ID.get(K.potionMap[kind]);logWithCategory(`약병 식별 · ${a?.name||'미확인 약병'} = ${p?.name||kind} (${reason}).`);burst(state.player.x,state.player.y,a?.color||'#d6b071',13,.55);if(inventoryOpen)inventoryDirty=true;updateAll();return true
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
function naturalGearUpgrade(item,rnd){const roll=rnd(),n=roll<MOUNTAIN_GEAR_CHANCE.plus2?2:roll<MOUNTAIN_GEAR_CHANCE.plus2+MOUNTAIN_GEAR_CHANCE.plus1?1:0;for(let i=0;i<n;i++)if(item.type==='armor')applyArmorUpgrade(item);else if(item.type==='weapon')applyWeaponUpgrade(item);item.naturalUpgrade105=n;return item;}
function anvilGear(item){return !!item&&['weapon','armor'].includes(item.type)&&!item.artifactWeapon46&&!item.artifactId46&&!item.curse991&&!item.curse&&!item.curseActive991&&(item.count??1)===1;}
// set when a game event changes what the open inventory shows; the next frame flush (updateAll(true)) repaints it
let inventoryDirty = false;
function displayNumber53(value){const n=Number(value);return Number.isFinite(n)?String(Number(n.toFixed(2))):'—'}
function fountainEvent(x,y){const r=drinkFromFountain(x,y);giveItem(foodDef('깨끗한 물'),x,y);addLog('정화의 샘에서 깨끗한 물을 한 병 길었다.');return r}
// Placement provenance is needed by ground reward audits, but never changes a carried item's effect.
const ITEM_PLACEMENT_FIELDS58=Object.freeze(['floor2Bonus66','floor2BonusIndex66','restaurantReward42','restaurantId42','restaurantRewardSpot42','miniVaultOrigin62','f20LooseLoot1020','r8LibraryPrize','f6Prize1023','resource48','resource53','bossDrop55','coreDrop982','coreHoly991','rumorSpaceId1030','f22Holy1023','generatedPeach53','branchReward105','branchFoodLevel105']);
function normalizeItemContainers57(){
  if(!state?.player)return;
  const normalizeWeapon=item=>{if(!item||item.type!=='weapon')return;const d=WEAPONS.find(w=>w.name===item.name);if(d?.heavyStrikeBalance105&&!item.legendaryWeapon47&&!item.artifactWeapon46){if((item.heavyStrikeBalance105||0)<d.heavyStrikeBalance105){const old=((item.heavyStrikeBalance105||0)>=2?{'무쇠 메':16,'대형 오해머':20,'대장간 망치':21}:item.heavyStrikeBalance105?{'무쇠 메':13,'대형 오해머':16,'대장간 망치':21}:{'무쇠 메':8,'대형 오해머':10,'대장간 망치':14})[item.name];item.atk=Number.isFinite(item.atk)?item.atk+d.atk-old:d.atk+(item.upgrade||0);item.heavyStrikeBalance105=d.heavyStrikeBalance105;}item.speed=d.speed;}if(item.kind==='spear'&&!item.legendaryWeapon47&&!item.artifactWeapon46){const tier=item.tier||1;item.range=tier===1?3:tier>=4?5:4}if(item.name==='낫')item.ability='광역타격';else if(item.name==='암살용 비수')item.ability='치명 +10%';else if(item.name==='별운검')item.ability='치명 +14%';else if(item.name==='철참도'){item.ability='없음';item.atk=10+Math.max(0,Math.floor(Number(item.upgrade)||0))}};
  for(const item of [...(state.player.inventory||[]),...(state.items||[]),...(state.pendingGroundItems57||[]).map(q=>q?.item)]){if(item?.foodKind==='charcoal')item.desc=CONSUMABLES.find(i=>i.foodKind==='charcoal').desc;if(item?.foodKind==='coin_candy'){item.focusPercent57=.60;item.stackMax=99;item.desc=CONSUMABLES.find(i=>i.foodKind==='coin_candy').desc}if(item?.foodKind==='grilled_fish'){delete item.raw;delete item.naturalOnly57}normalizeWeapon(item)}normalizeWeapon(state.player.weapon);
  const inventory=[...(state.player.inventory||[])];state.player.inventory=[];for(const item of inventory)addInventoryItem(item);
  const ground=[...(state.items||[])];state.items=[];for(const item of ground){
    // Restoring an existing pile is not a fresh drop. A monster standing on its
    // valid saved cell must not push the pile elsewhere during normalization.
    if(Number.isInteger(item.x)&&Number.isInteger(item.y)&&safeLootGround42(item.x,item.y))transferItemQuantity(item,null,state.items,itemQuantity(item),{position:{x:item.x,y:item.y}});
    else PlacementService.placeItem(item,{x:item.x,y:item.y},{requireReachable:false});
  }PlacementService.flushPendingItems()
}




function cookingFireAvailable105(source){if(source!=='pot'&&source!=='brazier')return true;const p=state.player,t=source==='pot'?TT.COOKPOT:TT.BRAZIER;return DIRS8.concat([[0,0]]).some(([dx,dy])=>state.map[p.y+dy]?.[p.x+dx]===t&&!terrainUnlit105(p.x+dx,p.y+dy))}
function jarReward57(x,y){
 if(globalThis.__MANRU_RANDOM57__()>=.20)return null;
 let item;if(globalThis.__MANRU_RANDOM57__()<.05){item={...clone(RELICS.find(r=>r.jarOnly57)),count:1};globalThis.__MANRU_ITEM_IDENTITY991__?.markGear?.(item);PlacementService.placeItem(item,{x,y});}
 else{const before=new Map(state.items.map(i=>[i,itemQuantity(i)])),pending=state.pendingGroundItems57?.length||0;dropRandomItem({x,y},false);item=state.items.find(i=>!before.has(i)||itemQuantity(i)>before.get(i))||state.pendingGroundItems57?.slice(pending)[0]?.item;}
 if(item)addLog('장독 속에 감춰져 있던 물건이 모습을 드러냈다.');return item||null;
}
function logWithCategory(msg){writeLogLine(msg);if(state){const [kind,ico]=cls(msg);meta.unshift({msg,kind,ico,turn:state.turn});if(meta.length>50)meta.length=50}}
function dropLootWithNaturalFood(pos,special=false){const n=state.items.length,r=dropLootWithTalismans(pos,special);for(let i=n;i<state.items.length;i++){const it=state.items[i];if(it?.type==='food'&&(it.craftedOnly57||it.naturalOnly57||(it.minFloor||1)>state.floor)){const repl=naturalFoodPick();Object.assign(repl,{x:it.x,y:it.y,count:1});state.items[i]=repl}if(it?.type==='ingredient'){const repl=naturalFoodPick();Object.assign(repl,{x:it.x,y:it.y,count:1});state.items[i]=repl}}return r}
function dropFloorLoot(pos,fromSpecial=false){const tier=Math.min(5,tierForFloor()+(fromSpecial&&globalThis.__MANRU_RANDOM57__()<.42?1:0)),r=globalThis.__MANRU_RANDOM57__();let item;if(r<(fromSpecial?.50:.40))item=deckPick47(gear47(tier),'gear');else if(r<(fromSpecial?.68:.68)){const foods=CONSUMABLES.filter(x=>x.type==='food'&&(x.rarity!=='relic'||state.floor>=16));item=deckPick47([...foods,...ordinaryPotionPool(false)],'recovery')}else if(r<(fromSpecial?.86:.88))item=deckPick47(ordinaryPotionPool(true),'strategy');else{const owned=new Set([...state.player.inventory,state.player.relic,state.player.trinket].filter(Boolean).map(x=>x.name)),pool=relics47().filter(x=>!owned.has(x.name));item=clone(choice(pool.length?pool:relics47()))}if(!item)return;item.x=pos.x;item.y=pos.y;item.count=item.count||1;globalThis.__MANRU_ITEM_IDENTITY991__?.markGear?.(item);PlacementService.placeItem(item)}
function displayDef42(value){const n=Number(value);return Number.isFinite(n)?String(Math.round(n)):'—'}
function markCombatActivity57(reason='combat'){if(!state)return false;const turn=Math.max(0,Number(state.turn)||0);state.lastCombat57=turn;state.lastCombat991=turn;state.lastCombatReason57=reason;return true}
function dropBossConsumables55(mon){
  if(!state||!mon?.boss||state.bossDrop55?.granted)return false;
  const floor=state.floor,potions=(window.MANRU_POTIONS||[]).filter(i=>floor>=(i.minFloor||1)),talismans=(window.MANRU_TALISMANS||[]).filter(i=>floor>=(i.minFloor||1)&&i.talismanKind!=='upgrade');
  const potion=kind=>potions.find(i=>i.potionKind===kind),talisman=kind=>talismans.find(i=>i.talismanKind===kind);
  const small=potion('heal_small'),medium=potion('heal_medium');if(!small)return false;
  const heals=[small,(floor>=10&&medium&&globalThis.__MANRU_RANDOM57__()<.35)?medium:small];
  const weighted=[
    {item:talisman('blast'),weight:12},{item:talisman('blink'),weight:11},{item:talisman('bind'),weight:10},{item:potion('smoke'),weight:12},
    {item:talisman('ward'),weight:3.0},{item:potion('focus'),weight:2.8},{item:potion('cleanse'),weight:2.6},{item:potion('swift'),weight:2.5},{item:potion('fortify'),weight:2.4},{item:potion('fire'),weight:1.8}
  ].filter(e=>e.item);
  const utilities=[],left=[...weighted];
  while(utilities.length<4&&left.length){const pick=weightedBossUtility55(left);if(!pick)break;utilities.push(pick.item);left.splice(left.indexOf(pick),1)}
  if(utilities.length<4){
    const fallback=[...talismans,...potions].filter(i=>i&&!['heal_small','heal_medium','heal_large','makgeolli'].includes(i.potionKind)&&!utilities.some(v=>v.name===i.name));
    while(utilities.length<4&&fallback.length){const i=Math.floor(globalThis.__MANRU_RANDOM57__()*fallback.length);utilities.push(fallback.splice(i,1)[0])}
  }
  const plan=[...heals,...utilities].slice(0,6);if(plan.length!==6)return false;
  const origin={x:mon.x,y:mon.y},reachable=ReachabilityService.lootCells(),reserved=new Set(),spots=[];
  for(let i=0;i<plan.length;i++){
    let q=PlacementService.findItemCell(origin,{reachable,allowPlayer:true,allowItems:false,restrict:p=>!reserved.has(k(p.x,p.y))}),stacked=false;
    if(!q){q=PlacementService.findItemCell(origin,{reachable,allowPlayer:true,allowItems:true});stacked=!!q}
    if(!q)return queueBossDropTransaction55(plan,origin,floor)
    reserved.add(k(q.x,q.y));spots.push({...q,stacked})
  }
  const before=structuredClone(state.items||[]),beforeQty=(state.items||[]).filter(i=>i.bossDrop55).reduce((n,i)=>n+itemQuantity(i),0),dropped=[];
  try{
    for(let i=0;i<plan.length;i++){
      const def=plan[i],q=spots[i],it={...clone(def),count:1,bossDrop55:true},moved=transferItemQuantity(it,null,state.items,1,{position:q});
      if(moved.moved!==1)throw new Error(`boss drop ${i} transfer failed`);
      dropped.push({name:def.name,type:def.type,potionKind:def.potionKind||null,talismanKind:def.talismanKind||null,x:q.x,y:q.y,stacked:q.stacked});
    }
  }catch(e){state.items=before;state.bossDrop55={granted:false,floor,requested:plan.length,count:0,healCount:0,names:plan.map(v=>v.name),items:[],reason:'transaction-rollback',error:String(e?.message||e)};addLog('보스 전리품 배치 트랜잭션이 롤백됐다. 보상 일부 지급은 발생하지 않았다.');return false}
  const afterQty=(state.items||[]).filter(i=>i.bossDrop55).reduce((n,i)=>n+itemQuantity(i),0),worldCount=afterQty-beforeQty,healCount=dropped.filter(v=>['heal_small','heal_medium','heal_large'].includes(v.potionKind)).length,stackedFallbacks=dropped.filter(v=>v.stacked).length;
  state.bossDrop55={granted:worldCount===plan.length&&healCount===2,floor,requested:plan.length,count:worldCount,healCount,stackedFallbacks,names:dropped.map(v=>v.name),items:dropped};
  if(state.bossDrop55.granted)addLog(`보스가 전투 소모품 ${worldCount}개를 떨어뜨렸다. 회복 2개 + 전술 소모품 4개${stackedFallbacks?` · 공간 부족으로 ${stackedFallbacks}개 중첩 배치`:''}.`);
  else addLog(`보스 전리품 배치 이상: ${worldCount}/${plan.length} · 회복 ${healCount}/2.`);
  return state.bossDrop55.granted
}
function useInventoryBaseR30(idx){
  const p=state.player,item=p.inventory[idx];if(!item)return;
  if(['weapon','armor','cloak','relic','trinket'].includes(item.type)){const old=p[item.type];p[item.type]=item;p.inventory.splice(idx,1);mountainEquip(item,old);if(old)addInventoryItem(old);branchInventoryOverflow();globalThis.__MANRU_LEGEND47__?.syncEquip?.();addLog(item.name+' 장착.');closeInventory();globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useInventoryBaseR30"}).value;return}
  if(item.type==='food')return consumeFood(item,idx);
  if(item.type==='ingredient'){toast('화로나 솥에서 사용하는 조리 재료다.');return}
  consumeOne(idx);closeInventory();globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useInventoryBaseR30"}).value
}
function closeMobileDrawer(){
  setInteraction8('mobileDrawer',false);
globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.();}
  function addP(fr,names){const pool=names.map(n=>POTIONS.find(p=>p.name===n)).filter(Boolean).filter(p=>state.floor>=(p.minFloor||1)),p=freeRoomCell(fr);if(pool.length&&p)PlacementService.placeItem({...clone(choice(pool)),x:p.x,y:p.y,count:1})}
  function detailHTML(item,idx,slot=null){
    if(!item)return'';const stats=uxStats(item),gear=['weapon','armor','cloak','relic','trinket'].includes(item.type),primary=item.summonItem105==='book'?'책을 본다':item.summonItem105==='picture'?'그림 끼우기':(item.mineItem105==='stone'||item.throwable)?'투척':item.branchGuide105?'읽기':item.type==='potion'?(item.throwable?'투척':'마시기'):(gear?'장착':'사용'),svc=globalThis.__MANRU_ITEM_IDENTITY991__,curse=item?.identified===true&&item?.curse991?svc?.curseDef?.(item):null,stacks=item?.curseActive991?(svc?.curseStacks?.(item.curse991)||1):0,power=stacks?(svc?.cursePower?.(item.curse991)||1):1,curseChip=curse?`<span class="uxStat curse991Chip">저주 · ${curse.name}${stacks>1?` · 중첩 ${stacks} / 효과 ×${power}`:''}</span>`:'';
    return `<div class="uxDetail" id="uxDetail"><div class="uxDetailHead">${uxIcon(item,'uxDetailIcon')}<div><h3>${item.name}${(item.count||1)>1?` ×${item.count}`:''}</h3><small>${slot?'장착 중 · ':''}${item.legendaryWeapon47?'전설의 무기':uxType(item)}${item.tier?` · T${item.tier}`:''} · ${item.legendaryWeapon47?'강화 불가':(item.rarity||'common').toUpperCase()}</small></div></div><div class="uxStats">${stats.map(x=>`<span class="uxStat">${x}</span>`).join('')}${curseChip}</div><div class="uxDesc">${classItemDescription58(item)||item.desc||item.ability||itemSummary(item)||'설명이 없다.'}</div><div class="uxActions">${slot?`<button class="primary" data-uxinspectequip="${slot}">세부 정보</button><button data-uxunequip="${slot}">해제</button><button class="danger" data-uxdrop-equip="${slot}">바닥에 놓기</button>`:`<button class="primary" data-invuse="${idx}"${item.summonItem105==='book'&&!SUMMON_RACES[item.summonElement105]?' disabled':''}>${primary}</button>${item.summonItem105==='book'?`<button data-bookmaterial105="talisman" data-bookindex105="${idx}">부적을 끼운다</button><button data-bookmaterial105="picture" data-bookindex105="${idx}">그림을 끼운다</button>`:''}<button data-invinspect="${idx}">정보</button><button class="danger" data-invdrop="${idx}">버리기</button>`}</div></div>`;
  }
  function gear47(tier){return ordinaryGearPool(tier,state.floor)}
/* ===== MANRU v5.3: native copy/callout kill + clean inspect formatter ===== */
const esc53=v=>displayText53(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const esc56=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensureKnowledge56(){
    if(!state)return null;
    if(!state.knowledge56)state.knowledge56={potionMap:{},potionKnown:{},potionSeen:{},roomHints:{},talismanHistory:[],clueSeen:{},talismanMap:{},talismanKnown:{identify:true},talismanSeen:{}};
    const K=state.knowledge56;
    K.potionMap=K.potionMap||{};K.potionKnown=K.potionKnown||{};K.potionSeen=K.potionSeen||{};K.roomHints=K.roomHints||{};K.talismanHistory=K.talismanHistory||[];K.clueSeen=K.clueSeen||{};
    K.talismanMap=K.talismanMap||{};K.talismanKnown=K.talismanKnown||{};K.talismanSeen=K.talismanSeen||{};K.talismanKnown.identify=true;
    const used=new Set(Object.values(K.potionMap)),free=shuffle(APPEARANCES.filter(a=>!used.has(a.id)).map(a=>a.id));
    for(const p of POTION_LIST)if(!K.potionMap[p.potionKind])K.potionMap[p.potionKind]=free.shift()||APPEARANCES[Object.keys(K.potionMap).length%APPEARANCES.length].id;
    const usedT=new Set(Object.values(K.talismanMap)),freeT=shuffle(TALISMAN_APPEARANCES.filter(a=>!usedT.has(a.id)).map(a=>a.id));
    // Talisman texture is a run-stable physical appearance, never an identification-state skin.
    // Every base talisman kind (including the always-known identify talisman) receives one shuffled
    // paper/ink/rune appearance and keeps it before and after identification.
    for(const t of TALISMANS)if(!K.talismanMap[t.talismanKind])K.talismanMap[t.talismanKind]=freeT.shift()||TALISMAN_APPEARANCES[Object.keys(K.talismanMap).length%TALISMAN_APPEARANCES.length].id;
    return K;
  }
  function app56(item){if(item?.mineItem105==='oil')return {...APPEARANCES[0],color:'#bc7135',glass:'#e3c791',name:item.name};const K=state?.knowledge56,id=item?.appearance56||K?.potionMap?.[item?.potionKind];return APP_BY_ID.get(id)||APPEARANCES[0]}
  function publicTalismanSeal56(item){if(item?.branchExclusive105||item?.fusion74)return item.seal||'合';return talismanApp56(item)?.seal||'符'}
  function decoratePotion56(item,x=item?.x,y=item?.y){if(!item||item.type!=='potion'||!item.potionKind)return item;const K=ensureKnowledge56();item.appearance56=item.appearance56||K.potionMap[item.potionKind];if(!item.origin56&&Number.isFinite(x)&&Number.isFinite(y))item.origin56=contextAt56(x,y,item.potionKind);return item}
  function candidateKinds56(item){
    const K=state.knowledge56,meta=POTION_META[item.potionKind]||{candidates:[item.potionKind]},seen=K.potionSeen[item.potionKind]||0,origin=item.origin56||{kinds:[]};let a=[...meta.candidates];
    if(origin.kinds?.length){const x=a.filter(k=>origin.kinds.includes(k));if(x.length)a=x}
    if(!a.includes(item.potionKind))a.unshift(item.potionKind);
    a=[...new Set(a)];if(seen>=2&&a.length>2)a=a.slice(0,2);const off=(app56(item).id.charCodeAt(0)+seen)%Math.max(1,a.length);return a.slice(off).concat(a.slice(0,off));
  }
  function inspectHTML56(item,dist=null){
    if(!item)return'<div class="clean53"><div class="clean53Desc">정보가 없다.</div></div>';
    if(item.type==='potion'&&!isPotionKnownByPlayer(item))return `<div class="v56Inspect">${potionClueHTML(item)}${dist!=null?`<div class="clean53Hint">거리 ${Number(dist)}칸 · 탭하면 목표 이동/습득</div>`:''}</div>`;
    if(item.type==='talisman')return `<div class="v56Inspect">${talismanHTML56(item)}${dist!=null?`<div class="clean53Hint">거리 ${Number(dist)}칸 · 탭하면 목표 이동/습득</div>`:''}</div>`;
    if(item.type==='potion'){const p=truePotion(item);return `<div class="clean53"><div class="clean53Ability"><b>효과</b> · ${esc56(p.ability||'')}</div><div class="clean53Desc">${esc56(p.desc||'')}</div>${dist!=null?`<div class="clean53Hint">거리 ${Number(dist)}칸 · 탭하면 목표 이동/습득</div>`:''}</div>`}
    return V56.baseCleanItem?V56.baseCleanItem(item,dist):`<div class="clean53"><div class="clean53Desc">${esc56(item.desc||itemSummary(item)||'')}</div></div>`;
  }
  function patchInventory56(){
    if(!inventoryOpen||!state)return;const box=document.getElementById('inventory');if(!box)return;
    const count=tab=>inventoryFilteredFor56(tab).length,unknownCount=state.player.inventory.filter(i=>(i.type==='potion'&&!isPotionKnownByPlayer(i))||(i.type==='talisman'&&!knownTalisman56(i))).length,defs=[['all','전체'],['gear','장비'],['recovery','회복'],['strategy',unknownCount?'전술·?':'전술'],['relic','유물']];
    box.querySelectorAll('.uxTabs [data-invtab]').forEach((b,i)=>{const d=defs[i];if(!d)return;b.dataset.invtab=d[0];if(b.firstChild)b.firstChild.nodeValue=d[1];const s=b.querySelector('span');if(s)s.textContent=count(d[0])});
    box.querySelectorAll('[data-invslot]').forEach(el=>{const item=state.player.inventory[+el.dataset.invslot];if(!item)return;const n=el.querySelector('.nm,.invSlotName');if(n)n.textContent=publicName56(item);const t=el.querySelector('.tier,.invTier');if(t&&((item.type==='potion'&&!isPotionKnownByPlayer(item))||(item.type==='talisman'&&!knownTalisman56(item))))t.textContent='?';el.classList.toggle('v56Unknown',(item.type==='potion'&&!isPotionKnownByPlayer(item))||(item.type==='talisman'&&!knownTalisman56(item)));el.classList.toggle('v56Talisman',item.type==='talisman');el.setAttribute('aria-label',`${publicName56(item)} · ${item.type==='potion'&&!isPotionKnownByPlayer(item)?'미확인 비약':item.type==='talisman'&&!knownTalisman56(item)?'미확인 부적':role56(item)}`);const role=el.querySelector('.uxRole47');if(role){role.textContent=item.type==='talisman'?(knownTalisman56(item)?'부적':'미확인'):item.type==='potion'&&!isPotionKnownByPlayer(item)?'미확인':({gear:'장비',recovery:'회복',strategy:'전술',relic:'유물'})[role56(item)]||'기타';role.classList.toggle('v56RoleMystery',(item.type==='potion'&&!isPotionKnownByPlayer(item))||(item.type==='talisman'&&!knownTalisman56(item)))}});
    const meta=box.querySelector('.uxInvMeta');if(meta&&!meta.querySelector('.v56KnowledgeMeter')){const K=state.knowledge56,known=Object.values(K.potionKnown).filter(Boolean).length,tKnown=TALISMANS.filter(t=>knownTalisman56(t)).length;meta.insertAdjacentHTML('beforeend',`<span class="v56KnowledgeMeter">약 ${known}/${POTION_LIST.length} · 부 ${tKnown}/${TALISMANS.length}</span>`)}
    const eq=box.querySelector('.uxEq.selected'),selected=eq?state.player[eq.dataset.uxeq]:(inventorySelection>=0?state.player.inventory[inventorySelection]:null),detail=box.querySelector('.uxDetail');
    if(selected&&detail&&(selected.type==='potion'||selected.type==='talisman')){
      const h=detail.querySelector('h3');if(h)h.textContent=publicName56(selected)+((selected.count||1)>1?` ×${selected.count}`:'');const sub=detail.querySelector('small');if(sub)sub.textContent=selected.type==='talisman'?(knownTalisman56(selected)?`식별된 부적 · 일회용${selected.targeted?` · 사거리 ${selected.targetRange}`:''}`:'미확인 부적 · 술법 불명'):(isPotionKnownByPlayer(selected)?'식별된 비약':'미확인 비약 · 단서로 추정 가능');const stats=detail.querySelector('.uxStats');if(stats)stats.innerHTML=selected.type==='talisman'?(knownTalisman56(selected)?`<span class="uxStat">${esc56(classItemDescription58(selected)?'괴력 · 매턴 HP 2% 회복':selected.ability||'일회용 술법')}</span>`:`<span class="uxStat">문양 ${esc56(publicTalismanSeal56(selected))}</span><span class="uxStat">효과 ?</span>`):(isPotionKnownByPlayer(selected)?`<span class="uxStat">${esc56(truePotion(selected).ability||'식별됨')}</span>`:`<span class="uxStat">${esc56(POTION_META[selected.potionKind]?.family||'미확인')}</span><span class="uxStat">${esc56(selected.origin56?.label||'출처 불명')}</span>`);const desc=detail.querySelector('.uxDesc');if(desc)desc.innerHTML=selected.type==='talisman'?talismanHTML56(selected):(isPotionKnownByPlayer(selected)?`<div class="v56Clue"><b>확정 효과</b>${esc56(truePotion(selected).desc||'')}</div>`:potionClueHTML(selected,true));const primary=detail.querySelector('[data-invuse]');if(primary)primary.textContent=selected.type==='talisman'?'펼치기':(!isPotionKnownByPlayer(selected)?'사용':(selected.throwable?'투척':'마시기'));const info=detail.querySelector('[data-invinspect]');if(info){const n=info.cloneNode(true);info.replaceWith(n);n.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(typeof globalThis.__MANRU_TERRAIN_CODEX986__?.openItem==='function')globalThis.__MANRU_TERRAIN_CODEX986__.openItem(selected);else showInspectSheet(publicName56(selected),inspectHTML56(selected))})}
    }
  }
  function useInstantTalisman56(item){
    cancelAutoWalk();
    if(item.talismanKind==='identify'){
      const unknownPotion=state.player.inventory.filter(i=>i.type==='potion'&&!isPotionKnownByPlayer(i)).sort((a,b)=>(b.count||1)-(a.count||1))[0];
      const unknownTalisman=state.player.inventory.filter(i=>i.type==='talisman'&&!knownTalisman56(i)).sort((a,b)=>(b.count||1)-(a.count||1))[0];
      if(!unknownPotion&&!unknownTalisman){toast('감응할 미확인 약병이나 부적이 없다.');return false}
      if(unknownPotion)identifyPotion(unknownPotion.potionKind,'감정부적 해독');else identifyTalisman56(unknownTalisman.talismanKind,'감정부적 해독');
      consumeRef(item);closeInventory();burst(state.player.x,state.player.y,'#d9ba73',18,.7);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useInstantTalisman56"}).value;return true
    }
    if(item.talismanKind==='mapping'){if(state.branchContext105?.id==='dojo'){toast('도장의 결계가 등명부를 봉한다.');return false;}const n=revealMap();identifyTalisman56(item.talismanKind,'사용 효과 관찰');consumeRef(item);closeInventory();addLog(`등명부: 층의 구조를 드러냈다${n?` · 숨은 문 ${n}개`:''}.`);burst(state.player.x,state.player.y,'#d9c57a',22,.75);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useInstantTalisman56"}).value;return true}
    if(item.talismanKind==='ward'){state.status.ward=Math.max(state.status.ward||0,11);state.status.weaken=0;identifyTalisman56(item.talismanKind,'사용 효과 관찰');consumeRef(item);closeInventory();addLog('호신부: 10턴 보호막 · 약화 해제.');burst(state.player.x,state.player.y,'#dfc76f',20,.72);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useInstantTalisman56"}).value;return true}
    return false
  }
/* ===== MANRU v5.7 · PDF 앞쪽 몬스터 초안 + 음식/비방 조리 완성 패스 ===== */
const V57={cookOpen:false,cookSource:'pot',selected:new Set(),foodTarget:null};
function foodFloorRewards57(){
  if(!state||state.artifactDungeon46||[5,10,15,20,25].includes(state.floor))return;
  // Every five-floor theme has four ordinary floors. Each ordinary floor keeps the same
  // guaranteed one-ration floor quota (= four guaranteed rations per theme). Supply is
  // nudged only slightly above that baseline with one independent 20% bonus ration roll.
  for(let i=0;i<GUARANTEED_FOOD_PER_NONBOSS_FLOOR57;i++){
    const ration=naturalFoodPick();if(ration)placeFood57(ration.name);
  }
  if(globalThis.__MANRU_RANDOM57__()<EXTRA_FOOD_CHANCE_NONBOSS57){const ration=naturalFoodPick();if(ration)placeFood57(ration.name)}
  for(const fr of state.featureRooms||[])if(fr.name==='주방'){
    placeFood57(choice(['주먹밥','말린 육포','식어버린 국밥']),fr);
    placeFood57(foodOccurrencePick([...Array(5).fill('주먹밥'),...Array(5).fill('말린 육포'),...Array(10).fill('엽전 엿'),...Array(5).fill('독버섯 꼬치')]),fr);
    if(globalThis.__MANRU_RANDOM57__()<.45)placeFood57('깨끗한 물',fr);
    if(state.floor>=16&&globalThis.__MANRU_RANDOM57__()<.18)placeFood57('신선로',fr);
  }
  if(state.floor===6||state.floor===23)placeFood57('빙결액');
  else if(state.floor>=6&&state.floor<=10&&globalThis.__MANRU_RANDOM57__()<.16)placeFood57('빙결액');
}
/* ===== MANRU v6.2: FLOOR FEELINGS / MINIVAULTS / TACTICAL BELT ===== */
const V62={lastFeeling:null,lastRoomKey:'',beltSig:'',beltPlayer:null,beltOrder:[]};
/* ===== MANRU v7.4: ELEMENTAL TALISMANS / FUSION / GEAR INFUSION ===== */
const V74={first:null,target:null,gearScroll:null,modal:null};
  const E74={
    fire:{name:'화염',seal:'화',color:'#e45e34',soft:'#ffb061'},shock:{name:'뇌전',seal:'뇌',color:'#e7cf55',soft:'#fff39a'},
    water:{name:'수류',seal:'수',color:'#4b9fc3',soft:'#9edff2'},ice:{name:'빙결',seal:'빙',color:'#86b6cf',soft:'#d3eff7'},
    grass:{name:'목령',seal:'목',color:'#6fa954',soft:'#b8df8f'},earth:{name:'대지',seal:'토',color:'#9a7048',soft:'#d6aa71'},holy:{name:'성광',seal:'성',color:'#d9bd68',soft:'#ffe7a0'}
  };
  function K74(){
    if(!state)return null;
    const K=state.knowledge56=state.knowledge56||{};
    K.potionMap=K.potionMap||{};K.potionKnown=K.potionKnown||{};K.talismanMap=K.talismanMap||{};K.talismanKnown=K.talismanKnown||{};K.talismanKnown.identify=true;
    const used=new Set(Object.values(K.talismanMap)),free=randOrder74(APP_IDS74.filter(id=>!used.has(id)));
    for(const t of window.MANRU_TALISMANS||[]){if(t.talismanKind==='identify')continue;if(!K.talismanMap[t.talismanKind])K.talismanMap[t.talismanKind]=free.shift()||APP_IDS74[Object.keys(K.talismanMap).length%APP_IDS74.length]}
    return K;
  }
  function hurtMon74(mon,elem,base,contactHandled=false){if(!isHostileTarget57(mon))return 0;return resolveElementDamage57(mon,elem,base,{contactHandled105:contactHandled,source:`${E74[elem]?.name||elem} 피해`,color:E74[elem]?.soft||'#e5c080',size:13}).damage}
  function near74(x,y,r=1){return[...state.monsters].filter(m=>isHostileTarget57(m)&&!m.hidden&&entityDistance57(m,{x,y})<=r)}
  function push74(mon,fx,fy,n=1){return resolveForcedMovement57(mon,{x:fx,y:fy},n,{mode:'push',hostile:true,creditPlayer:true}).moved>0}
  function tempTile74(x,y,tile,ttl,kind){return RuntimeTerrainOwner.temporary(x,y,tile,ttl,kind,{allowedOld:[TT.FLOOR,TT.GRASS,TT.OPEN_DOOR],source:'element74'})}

  function fuse74(a,b){if(!playerClassRules58().talismanFusion){closeFusion();toast('천하장사는 부적을 합성할 수 없다.');return false}const action=playerAction57('modal-action',{uiOwner:'fusion74'});if(!action.ok)return false;if(!a||!b||a===b||!known74(a)||!known74(b)){toast('감정된 서로 다른 기본 부적이 필요하다.');return false}const r=compatible74(a,b);if(!r){toast('두 부적의 기운이 안정적으로 합쳐지지 않는다.');return false}const result=recipeItem(r);consumeRef(a);consumeRef(b);addInventoryItem(result);K74().talismanKnown[result.talismanKind]=true;closeFusion();burst(state.player.x,state.player.y,E74[r.element]?.color||'#d8b06c',24,.9);addLog(`부적 합성 · ${r.name} 완성.`);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"fuse74"}).value;return true}
  function reveal74(){let n=0;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(k(x,y));if(state.map[y][x]===TT.SECRET_DOOR)n++}VisibilityService.compute();return n}
  const randInt967=(a,b)=>Math.floor(globalThis.__MANRU_RANDOM57__()*(b-a+1))+a;
  function itemFromTitle986(title){
    const all=[...(state?.player?.inventory||[]),...(state?.items||[])].filter(Boolean),exact=all.find(i=>i.name===title&&(!unidentifiedItem(i)||itemPublicName(i)===title));if(exact)return exact;
    const publicMatches=all.filter(i=>itemPublicName(i)===title);return publicMatches.length===1?publicMatches[0]:null;
  }
  function openItemInspect986(it,target=null){if(!it)return false;const info=itemInfo(it);directOpenInspect(info.name,simpleHtml986(info),target,it);return true}
  const isUnknownTalisman991=i=>i?.type==='talisman'&&!i.branchExclusive105&&!i.fusion74&&i.talismanKind!=='identify'&&!state?.knowledge56?.talismanKnown?.[i.talismanKind];
  const displayName991=i=>isUnknownPotion(i)?'미감정 약병':isUnknownTalisman991(i)?'미감정 부적':(i?.name||'물품');
  function armCurseClock991(id,turn=state?.turn??0,actor=state?.player){if(!state||!id)return null;const clocks=curseClocks991(actor),def=CURSE_BY_ID.get(id);if(def?.periodic)clocks[id]={next:turn+def.periodic.period,period:def.periodic.period};else if(id==='drain')clocks[id]={next:turn+5,period:5};else if(id==='blood_hunger'){const combat=state.lastCombat57??state.lastCombat991??turn;clocks[id]={next:Math.max(turn+8,combat+8),period:3,lastCombat:combat}}return clocks[id]||null}
  function syncCurseClocks991(actor=state?.player){if(!state)return{};const clocks=curseClocks991(actor);for(const c of CURSE_CATALOG){const active=curseStackCount(c.id,actor)>0;if(!active){delete clocks[c.id];continue}if(!clocks[c.id])armCurseClock991(c.id,state.turn??0,actor);if(c.id==='blood_hunger'){const combat=state.lastCombat57??state.lastCombat991??(state.turn??0),clock=clocks[c.id];if(clock&&combat!==clock.lastCombat){clock.lastCombat=combat;clock.next=combat+8}}}return clocks}
  function canReceiveHostileCurse991(item){return isGearItem(item)&&!item.curse991&&!item.curseImmune991&&!item.curseImmune&&!item.storyId&&!item.storyItem&&!item.keyId&&!item.combatFixture54&&!item.artifactWeapon46&&!item.legendaryWeapon47&&!item.artifactId46&&item.name!=='용의 여의주 파편'}
  function identifyAllInventory991(reason='감강부적'){let n=0;for(const it of state?.player?.inventory||[])if(useIdentifyScrollOn(it,reason))n++;if(inventoryOpen)renderInventory();updateAll();return n}
  function identifyChoiceAction5(e,item){const act=playerAction57('choice',{uiOwner:'choice991'});if(!act.ok)return;const target=e?.item||e;if(!useIdentifyScrollOn(target,'감정부적')){toast('이미 감정된 물건이다. 다른 대상을 고르시오.');return}consumeInventoryItem(item);closeChoice991();burst(state.player.x,state.player.y,'#d9ba73',18,.7);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"identifyChoiceAction5"}).value}
  function purifyChoiceAction5(e,item){const act=playerAction57('choice',{uiOwner:'choice991'});if(!act.ok)return;if(!purifyGearItem(e.item))return;consumeInventoryItem(item);closeChoice991();burst(state.player.x,state.player.y,'#f1d786',22,.8);globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"purifyChoiceAction5"}).value}
  function cleanseOne991(){const removed=cleanseStatuses(state.status,1);if(removed.length)addLog('성광이 해로운 상태를 씻어 냈다.');return removed[0]||null}
function classItemDescription58(item,p=state?.player){return item?.talismanKind==='upgrade'&&playerClassRules58(p).upgradeTalismanMode==='bodyBoost'?`괴력 ${bodyPowerDuration58(p)}턴: ATK +2 · DEF +7 · 매턴 HP 2% 회복. 종료 후 같은 시간 실명·배탈. 장비 강화·중첩 불가.`:null}
function drinkFromFountain(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 10);
  state.player.focus = Math.min(getStats().maxFocus, state.player.focus + 4);
  cleanseStatuses();
  burst(x,y,"#8bd0f3",16,.9);
  addLog("정화의 샘. HP/FOCUS 회복, 상태이상 정화.");
  giveItem(foodDef('깨끗한 물'),x,y);
  addLog('정화의 샘에서 깨끗한 물을 한 병 길었다.');
}
function dropRandomItem(pos,special=false){if(state?.branchContext105?.id==='granary'){const roll=globalThis.__MANRU_RANDOM57__();let item;if(roll<.30)item=naturalFoodPick();else if(roll<.78)item=clone(choice((window.MANRU_POTIONS||[]).filter(p=>(p.minFloor||1)<=state.floor&&!p.craftedOnly57)));else if(roll<.90)item=makeAmmo(weightedAmmo(),false);if(item){PlacementService.placeItem(item,pos);return item}}if(state&&pos){const chance=special ? .20 : .13;if(globalThis.__MANRU_RANDOM57__()<chance){const item=makeAmmo(weightedAmmo(),false);item.x=pos.x;item.y=pos.y;PlacementService.placeItem(item);return item}}return dropLootWithNaturalFood(pos,special)}
function applyRecoveryPotion57(actor,item){
 const rules={heal_small:{minimum:10,fraction:.32},heal_medium:{minimum:18,fraction:.60}},rule=item?.type==='potion'?rules[item.potionKind]:null;if(!actor||actor.hp<=0||!rule)return false;
 const used=splitItemQuantity(item,1,actor.inventory);if(!used)return false;
 const before=actor.hp;actor.hp=Math.min(actor.maxHp,actor.hp+Math.max(rule.minimum,Math.ceil(actor.maxHp*rule.fraction)));
 const cleansed=item.potionKind==='heal_medium'&&combatStatusTurns(actor,'bleed')>0&&globalThis.__MANRU_RANDOM57__()<.5;
 if(cleansed){if(actor===state.player)state.status.bleed=0;else setMonsterStatus(actor,STATUS_META57.bleed.monsterField57,0);}
 addLog(`${actor===state.player?'':actor.name+' · '}${item.name}: HP +${displayNumber53(Math.round(actor.hp-before))}${cleansed?' · 출혈 제거':''}.`);
 if(actor.equipmentActor105)updateEquipmentPhase105(actor);return true;
}
function renderInventory(...args){inventoryDirty=false;for(const s of INVENTORY_RENDER.pre)s.fn(...args);const core=INVENTORY_RENDER.core?.fn||renderInventoryFallbackR;const result=core(...args);for(const s of INVENTORY_RENDER.post)s.fn(...args);return result}
  /* ---------- rich log ---------- */
  const meta=[];
  function drink(item){const p=state.player;pstate();const recovery=['heal_small','heal_medium'].includes(item.potionKind);if(recovery){if(!applyRecoveryPotion57(p,item))return false;}else switch(item.potionKind){case'makgeolli':{const turns=Math.max(1,Math.floor(item.drunkTurns57||8));state.status.drunk=Math.max(state.status.drunk||0,turns+1);state.makgeolliRecoveryTurns57=state.status.drunk;state.drunkBornTurn57=state.turn+1;state.makgeolliHealHundredths57=0;addLog(`${item.name}: 취함 ${turns}턴 · 매턴 지속 회복. 취기는 중첩되지 않고 남은 시간을 ${turns}턴까지 새로 고친다.`);break}case'focus':{const b=p.focus;p.focus=Math.min(getStats().maxFocus,p.focus+20);state.status.willBoost=Math.max(state.status.willBoost,6);addLog(`${item.name}: 기력 +${p.focus-b} · WILL 강화.`);break}case'cleanse':{const b=p.hp,h=Math.max(4,Math.ceil(p.maxHp*.12));p.hp=Math.min(p.maxHp,p.hp+h);state.status.illness=0;state.status.poison=0;state.status.bleed=0;state.status.weaken=0;state.status.upset=0;addLog(`${item.name}: 독·출혈·약화·배탈 해제 · HP +${displayNumber53(Math.round(p.hp-b))}.`);break}case'swift':state.status.swift=Math.max(state.status.swift,7);addLog(`${item.name}: 6턴 신속.`);break;case'fortify':state.status.fortify=Math.max(state.status.fortify,9);addLog(`${item.name}: 8턴 DEF 강화.`);break;default:return false}burst(p.x,p.y,pcolor(item),12,.75);if(!recovery)consumeRef(item);closeInventory();globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:item.useCost||.8,reason:"drink"}).value;return true}
function rewardRooms(){for(const fr of state?.featureRooms||[]){if(fr.name==='연금술방'){addP(fr,['소회복 비약','중회복 비약','청심탕','해독산']);addP(fr,['경신약','강골주','연막병','화유병','청심탕'])}else if(fr.name==='사당')addP(fr,['청심탕','해독산','강골주']);else if(fr.name==='무기고'&&globalThis.__MANRU_RANDOM57__()<.82)addP(fr,['연막병','화유병','강골주']);else if(fr.name==='감방'&&globalThis.__MANRU_RANDOM57__()<.68)addP(fr,['중회복 비약','강골주','연막병']);else if(fr.name==='주방'&&globalThis.__MANRU_RANDOM57__()<.42)addP(fr,['소회복 비약','해독산'])}}
  function uxType(item){return item?.mineItem105==='stone'?'투척 도구':item?.type==='potion'?'비약 / 약병':itemTypeLabel(item?.type||'')}
  function uxStats(item){
    const a=[];if(!item)return a;
    if(item.atk)a.push(`ATK +${displayNumber53(item.atk)}`);if(item.def)a.push(`DEF ${item.def>0?'+':''}${displayDef42(item.def)}`);if(item.eva)a.push(`EVA ${item.eva>0?'+':''}${item.eva}`);if(item.will)a.push(`WILL +${item.will}`);if(item.vision)a.push(`VIS ${item.vision>0?'+':''}${item.vision}`);if(item.speed)a.push(`속도 ${item.speed}×`);if(item.range)a.push(`사거리 ${item.range}`);if(item.hunger)a.push(`허기력 +${item.hunger}`);if(item.heal)a.push(`HP +${item.heal}`);if(item.focusGain)a.push(`기력 +${item.focusGain}`);return a;
  }
  function uxIcon(item,cls=''){try{return vfIconHtml(item,cls)}catch(_){return `<span>${itemGlyph(item)}</span>`}}
  function deckPick47(pool,key){if(!pool.length)return null;state.lootHistory47=state.lootHistory47||{};const h=state.lootHistory47[key]||[];let a=pool.filter(i=>!h.includes(i.name));if(!a.length)a=pool;const p=clone(foodOccurrencePick(a));h.push(p.name);while(h.length>Math.min(4,Math.max(2,pool.length-1)))h.shift();state.lootHistory47[key]=h;return p}
  function relics47(){const f={'붉은 등롱 심지':1,'먹빛 벼루 조각':6,'깨진 천면경':11,'장고의 쇠갈고리':16,'용의 여의주 파편':99,'방 번호패':1,'비단 매듭':6,'금박 부적':16};return[...RELICS.map(x=>({...x,type:'relic'})),...TRINKETS.map(x=>({...x,type:'trinket'}))].filter(x=>!x.jarOnly57&&state.floor>=(f[x.name]||1))}
  function guaranteedResource48(){
    if(!state||state.specialFloor)return;
    // One recovery checkpoint per chapter. Like SPD's limited drops, this prevents pure RNG starvation.
    if([3,8,13,18,23].includes(state.floor)&&!floorHasRole48('recovery')){const p=deckPick47(ordinaryPotionPool(false),'limitedRecovery48');if(p)place47(p)}
    // Gameplay items are persistent state; rendering owns any visual culling.
  }
  function stats53(item){
    if(!item)return[];const a=[];
    if(item.atk)a.push(`ATK +${displayNumber53(item.atk)}`);
    if(item.def)a.push(`DEF ${item.def>=0?'+':''}${displayDef42(item.def)}`);
    if(item.eva)a.push(`EVA ${item.eva>=0?'+':''}${item.eva}`);
    if(item.will)a.push(`WILL +${item.will}`);
    if(item.vision)a.push(`VIS ${item.vision>0?'+':''}${item.vision}`);
    if(item.focus)a.push(`FOCUS +${displayNumber53(item.focus)}`);
    if(item.speed)a.push(`공격 ${item.speed}× · ${attackTurnCost(item).toFixed(1)}턴`);
    if(item.range)a.push(`사거리 ${item.range}`);
    if(isBrawlWeapon(item)){a.push(`강화 +${item.upgrade||0} · 실제 강화 ATK +${brawlUpgradeEffect42(item)}`);a.push('강화 효율 매우 낮음')}
    if(item.heal)a.push(`HP +${item.heal}`);
    if(item.focusGain)a.push(`FOCUS +${item.focusGain}`);
    if(item.hunger)a.push(`허기력 +${item.hunger}`);
    if((item.count||1)>1)a.push(`수량 ×${item.count||1}`);
    if(item.curse)a.push(`저주 · ${item.curse}`);
    return uniq53(a);
  }
  const TALISMANS=[
    {name:'감정부적',type:'talisman',talismanKind:'identify',seal:'鑑',tier:1,rarity:'common',stackMax:3,minFloor:1,weight74:.95,ability:'미감정 아이템 1개 완전 감정',desc:'미감정 물건 하나를 직접 골라 정체와 숨은 성질까지 밝혀낸다.'},
    {name:'성부',type:'talisman',talismanKind:'holy',seal:'聖',tier:2,rarity:'rare',stackMax:3,minFloor:2,weight74:.42,ability:'저주 1개 정화 / 저주가 없으면 성광',desc:'탁한 기운을 끊어 장비의 저주를 지운다. 정화할 저주가 없으면 주변의 원혼과 언데드를 태우고 몸의 해로운 기운 하나를 씻는다.'},
    {name:'화염부적',type:'talisman',talismanKind:'elem_fire',element74:'fire',seal:'火',tier:1,rarity:'common',stackMax:3,minFloor:1,weight74:1.35,ability:'주변 화염 폭주 · 역류 위험',desc:'제어하지 않고 펼치면 불길이 주변으로 터진다. 화염 저항이 없으면 독자도 열기를 뒤집어쓴다.'},
    {name:'수류부적',type:'talisman',talismanKind:'elem_water',element74:'water',seal:'水',tier:1,rarity:'common',stackMax:3,minFloor:1,weight74:1.30,ability:'주변 수압 방출 · 역류 위험',desc:'거친 물기운이 사방으로 터져 적을 밀고 불길을 끈다. 수류 저항이 없으면 독자도 균형을 잃는다.'},
    {name:'대지부적',type:'talisman',talismanKind:'elem_earth',element74:'earth',seal:'土',tier:2,rarity:'common',stackMax:3,minFloor:2,weight74:1.20,ability:'낙석·암벽 폭주 · 역류 위험',desc:'대지가 솟아 주변을 바위로 가른다. 대지 저항이 없으면 충격과 낙석을 그대로 받는다.'},
    {name:'빙결부적',type:'talisman',talismanKind:'elem_ice',element74:'ice',seal:'冰',tier:2,rarity:'rare',stackMax:3,minFloor:3,weight74:1.10,ability:'주변 급랭·빙결 · 역류 위험',desc:'주변 열을 빼앗아 적을 굳힌다. 냉기 저항이 없으면 독자의 관절도 함께 얼어붙는다.'},
    {name:'뇌전부적',type:'talisman',talismanKind:'elem_shock',element74:'shock',seal:'雷',tier:2,rarity:'rare',stackMax:3,minFloor:4,weight74:1.05,ability:'주변 연쇄 뇌격 · 역류 위험',desc:'전류가 가까운 생체와 금속을 따라 튄다. 뇌전 저항이 없으면 독자도 감전된다.'},
    {name:'목령부적',type:'talisman',talismanKind:'elem_grass',element74:'grass',seal:'木',tier:2,rarity:'rare',stackMax:3,minFloor:5,weight74:1.05,ability:'뿌리·독분 폭주 · 역류 위험',desc:'식물의 생기가 폭주해 뿌리와 독분을 뿜는다. 목령 저항이 없으면 독자도 포자에 잠식된다.'},
    {name:'강화부적',type:'talisman',talismanKind:'upgrade',seal:'強',tier:1,rarity:'rare',stackMax:15,minFloor:1,weight74:.58,ability:'무기 강화 +1 · 방어구 점감 강화',desc:'장비 하나를 한 단계 개량한다. 방어구는 첫 강화가 원본 DEF에 따라 약 1.8~2.0 오르고, 강화 횟수가 늘수록 매회 상승량이 완만하게 감소한다. 실제 계산은 소수 DEF를 유지하지만 화면에는 반올림한 정수 DEF만 표시한다. 강화 횟수 제한은 없지만 이미 소비한 강화는 되돌릴 수 없다.'},
    {name:'폭발부적',type:'talisman',talismanKind:'blast',seal:'爆',tier:2,rarity:'rare',stackMax:2,minFloor:3,weight74:1.70,targeted:true,targetRange:5,ability:'목표 3×3 고위력 폭발·밀치기',desc:'선택한 지점의 진형을 터뜨려 층이 깊어질수록 강해지는 피해를 주고 바깥으로 밀어낸다.'},
    {name:'등명부',type:'talisman',talismanKind:'mapping',seal:'明',tier:2,rarity:'rare',stackMax:2,minFloor:3,weight74:.62,ability:'층 지도와 숨은 문 탐지',desc:'불빛이 벽의 틈을 훑어 현재 층의 구조와 숨은 문을 드러낸다.'},
    {name:'호신부',type:'talisman',talismanKind:'ward',seal:'護',tier:2,rarity:'rare',stackMax:3,minFloor:4,weight74:.68,ability:'보호막 10턴',desc:'몸 둘레에 얇은 금빛 장막을 두른다. 보호막 동안 DEF가 오른다.'},
    {name:'축지부',type:'talisman',talismanKind:'blink',seal:'縮',tier:3,rarity:'rare',stackMax:2,minFloor:7,weight74:1.55,targeted:true,targetRange:8,ability:'본 안전 칸으로 순간이동',desc:'이미 확인한 안전한 칸 하나를 찍어 그곳으로 몸을 접어 이동한다.'},
    {name:'봉박부',type:'talisman',talismanKind:'bind',seal:'封',tier:4,rarity:'relic',stackMax:2,minFloor:11,weight74:1.45,targeted:true,targetRange:6,ability:'목표 3×3 적 4턴 봉인',desc:'선택한 지점의 일반 적을 종이 사슬로 4턴 봉인한다. 보스는 제어 내성이 열려 있을 때 1턴만 경직된다.'}
  ];
  const TALISMAN_APPEARANCES=[
    {id:'redthread',name:'붉은 실매듭 부적',paper:'#d9bd82',paper2:'#af8952',ink:'#8d2c28',seal:'甲'},
    {id:'jadepaper',name:'옥빛 종이 부적',paper:'#b6c79a',paper2:'#81956f',ink:'#315f50',seal:'乙'},
    {id:'inkwash',name:'먹선 번진 부적',paper:'#c8bda2',paper2:'#948873',ink:'#34353c',seal:'丙'},
    {id:'violet',name:'자줏빛 주사 부적',paper:'#c6a4b9',paper2:'#936e88',ink:'#71345f',seal:'丁'},
    {id:'goldedge',name:'금테 누런 부적',paper:'#d8c36f',paper2:'#a48a43',ink:'#6b4326',seal:'戊'},
    {id:'ashgray',name:'잿빛 삼베 부적',paper:'#aaa493',paper2:'#777263',ink:'#4b4542',seal:'己'},
    {id:'cobalt',name:'남청색 비단 부적',paper:'#8fa9bd',paper2:'#617b91',ink:'#334f70',seal:'庚'},
    {id:'blueglass',name:'청유리빛 부적',paper:'#a6c4c7',paper2:'#6f9da0',ink:'#2f6165',seal:'辛'},
    {id:'frostwhite',name:'서리 묻은 백지 부적',paper:'#d9d8cf',paper2:'#a8afb0',ink:'#526b75',seal:'壬'},
    {id:'moss',name:'이끼 물든 부적',paper:'#a9b786',paper2:'#73815c',ink:'#3e5631',seal:'癸'},
    {id:'ochre',name:'황토 얼룩 부적',paper:'#c6a66f',paper2:'#8f7249',ink:'#654228',seal:'子'},
    {id:'cinnabar',name:'주사 점박이 부적',paper:'#d1b091',paper2:'#a6795f',ink:'#9b3b30',seal:'丑'},
    {id:'roughpaper',name:'거친 닥종이 부적',paper:'#c2b89f',paper2:'#8e826d',ink:'#4d453a',seal:'寅'},
    {id:'waxpaper',name:'밀랍 먹인 부적',paper:'#c1ad83',paper2:'#8f7656',ink:'#554533',seal:'卯'},
    {id:'palepaper',name:'빛바랜 삼지 부적',paper:'#c8c0aa',paper2:'#958d79',ink:'#575149',seal:'辰'}
  ];
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(globalThis.__MANRU_RANDOM57__()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function knownTalisman56(item){if(item?.mineItem105==='mystery')return true;return item?.type==='talisman'&&(item.branchExclusive105||item.fusion74||item.talismanKind==='identify'||!!state?.knowledge56?.talismanKnown?.[item.talismanKind])}
  function publicName56(item){if(!item)return'';if(item.type==='potion'&&!isPotionKnownByPlayer(item))return app56(item).name;if(item.type==='talisman')return publicTalismanName56(item);return item.name}
  function decorateAllItems56(){if(!state)return;for(const i of state.items||[]){migrateScroll56(i);decoratePotion56(i,i.x,i.y);if(i.type==='talisman')talismanApp56(i)}for(const i of state.player?.inventory||[]){migrateScroll56(i);decoratePotion56(i);if(i.type==='talisman')talismanApp56(i)} }
  function talismanHTML56(item){
    if(!knownTalisman56(item)){const a=talismanApp56(item);return `<div class="v56TalismanInfo v56TalismanUnknown"><b>성질을 알 수 없는 부적</b><p>${esc56(a.name)}. 주사와 종이의 결만으로는 어떤 술법인지 판별할 수 없다.</p><span>펼치기 1.0턴 · 사용하거나 감정부적로 식별</span></div>`}
    const classDesc=classItemDescription58(item);
    return `<div class="v56TalismanInfo"><b>${esc56(classDesc?'괴력 · ATK +2 · DEF +7 · 매턴 HP 2% 회복':item.ability||'일회용 술법')}</b><p>${esc56(classDesc||item.desc||'')}</p><span>펼치기 1.0턴${item.targeted?` · 목표 사거리 ${item.targetRange||5}`:''}</span></div>`
  }
  function identifyTalisman56(kind,reason='효과를 직접 확인했다'){
    const K=ensureKnowledge56();if(!kind||kind==='identify'||K.talismanKnown[kind])return false;const t=TALISMAN_BY_KIND.get(kind);if(!t)return false;const a=TALISMAN_APP_BY_ID.get(K.talismanMap[kind])||TALISMAN_APPEARANCES[0];K.talismanKnown[kind]=true;logWithCategory(`부적 식별 · ${a.name} = ${t.name} (${reason}).`);burst(state.player.x,state.player.y,a.ink||'#d6b071',13,.55);if(inventoryOpen)inventoryDirty=true;updateAll();return true
  }
  function sanitize56(text){let s=String(text??'');if(!state)return s;const K=state.knowledge56;for(const p of POTION_LIST)if(!K.potionKnown[p.potionKind])s=s.split(p.name).join(app56(p).name);for(const t of TALISMANS)if(t.talismanKind!=='identify'&&!K.talismanKnown[t.talismanKind])s=s.split(t.name).join(talismanApp56(t).name);return s}
  function role56(item){if(!item)return'other';if(item.mineItem105==='stone')return'strategy';if(['weapon','armor','cloak'].includes(item.type))return'gear';if(['relic','trinket'].includes(item.type))return'relic';if(item.type==='food')return'recovery';if(item.type==='upgrade'||item.type==='talisman')return'strategy';if(item.type==='potion')return isPotionKnownByPlayer(item)?(RECOVERY_KINDS.has(item.potionKind)?'recovery':'strategy'):'strategy';return'other'}
function placeFood57(name,fr=null){const d=foodDef(name);if(!d)return;const p=fr?roomFreeFood57(fr):PlacementService.randomFloor(0);PlacementService.placeItem({...clone(d),x:p.x,y:p.y,count:1})}
  function pacing70(){
    if(!state)return;
    if(state.monsters.some(m=>m.boss)){state.floorFeeling62=null;state.miniVault62=null;return;}
    const ground=state.items||[],inv=state.player.inventory||[],all=[...ground,...inv];
    const preBoss=[4,9,14,19,24].includes(state.floor);
    if(!all.some(recovery70))placeItem70(foodOccurrencePick(recoveryPool70()));
    const dangerSpecial=[16,18,21,22,23].includes(state.floor);
    if((preBoss||dangerSpecial||state.floorFeeling62?.id==='traps'||state.floorFeeling62?.id==='war')&&!all.some(tactical70))placeItem70(choice(tacticalPool70()));
    // Ground clutter cap: preserve upgrades, relics, talismans and tactical items first.
    if(state.items.length>14){
      state.items=state.items.map((i,n)=>({i,n,s:(i.type==='upgrade'?100:0)+(['relic','sealed'].includes(i.rarity)?80:0)+(i.type==='talisman'?60:0)+(tactical70(i)?45:0)+(recovery70(i)?35:0)+(i.tier||0)*3}))
        .sort((a,b)=>b.s-a.s||a.n-b.n).slice(0,14).map(v=>v.i);
    }
  }
  const APP_IDS74=['redthread','jadepaper','inkwash','violet','goldedge','ashgray','cobalt','blueglass','frostwhite','moss','ochre','cinnabar','roughpaper','waxpaper','palepaper'];
  const randOrder74=a=>[...a].sort(()=>globalThis.__MANRU_RANDOM57__()-.5);
  function known74(item){if(!item||item.type!=='talisman')return false;if(item.branchExclusive105||item.fusion74||item.talismanKind==='identify')return true;return !!(state?.knowledge56?.talismanKnown?.[item.talismanKind])}
  function compatible74(a,b){return RECIPE.get(key74(a.talismanKind,b.talismanKind))||null}
  function renderFusion74(){
    const host=document.getElementById('fusion74body'),items=basicTalismans74();if(items.length<2){host.innerHTML='<div class="f74none">합성하려면 감정된 기본 부적이 2장 이상 필요하다.</div>';return}
    if(!V74.first){host.innerHTML='<div class="f74hint">첫 번째 부적을 고른다. 미감정부적은 합성 목록에 표시되지 않는다.</div><div class="f74grid">'+items.map(v=>`<button class="f74card" data-f74first="${v.idx}"><span class="sig">${esc74(v.item.seal||'부')}</span><span><b>${esc74(v.item.name)}${(v.item.count||1)>1?` ×${v.item.count}`:''}</b><small>${esc74(v.item.ability||'')}</small></span></button>`).join('')+'</div>';host.querySelectorAll('[data-f74first]').forEach(b=>b.onclick=()=>{V74.first=state.player.inventory[+b.dataset.f74first];renderFusion74()});return}
    const first=V74.first,cands=items.filter(v=>v.item!==first).map(v=>({...v,r:compatible74(first,v.item)})).filter(v=>v.r);host.innerHTML=`<div class="f74hint f74picked"><span><b>${esc74(first.name)}</b>를 첫 재료로 선택했다. 만들 수 있는 부적을 골라라.</span><button data-f74reset>첫 재료 변경</button></div><div class="f74grid">${cands.length?cands.map(v=>`<button class="f74card compat" data-f74second="${v.idx}"><span class="sig">${esc74(v.r.seal)}</span><span><b>${esc74(v.r.name)}</b><small>${esc74(first.name)} + ${esc74(v.item.name)}<br>${esc74(v.r.ability)}</small></span></button>`).join(''):'<div class="f74none">지금 만들 수 있는 조합이 없다.<br><small>첫 재료를 바꿔 다른 조합을 확인할 수 있다.</small></div>'}<div class="f74result"><b>합성 규칙</b><br>결과를 누르면 합성 · 1턴 소모 · 재료 각 1장 · 강화 + 원소 → 속성 각인</div></div>`;host.querySelector('[data-f74reset]')?.addEventListener('click',()=>{V74.first=null;renderFusion74()});host.querySelectorAll('[data-f74second]').forEach(b=>b.onclick=()=>ActionDispatcher.dispatch({type:'FUSE',args:[first,state.player.inventory[+b.dataset.f74second]]}).value)
  }
  function startTarget74(item){if(!gameplayUiOpen57())return false;cancelAutoWalk();clearHeldInput53();V74.target={item,range:item.targetRange||5,effect:item.fusionEffect74};closeInventory();const h=targetHud74();h?.classList.add('show');syncWorldTargetInput();const a=document.getElementById('talismanTargetTitle'),b=document.getElementById('talismanTargetText');if(a)a.textContent=`${item.name} · ${item.seal}`;if(b)b.textContent=`목표 지정 · 사거리 ${V74.target.range}`;drawMap(true)}
  function curseClocks991(actor=state?.player){if(!state||!actor)return{};const owner=actor===state.player?state:actor;owner.curseClocks991=owner.curseClocks991&&typeof owner.curseClocks991==='object'?owner.curseClocks991:{};return owner.curseClocks991}
  function closeChoice991(){setInteraction8('choice991',false);choiceCancel991=null}
  function revealMap(){let secrets=0;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){VisibilityService.rememberKey(k(x,y));if(state.map[y][x]===TT.SECRET_DOOR)secrets++}VisibilityService.compute();return secrets}
function bodyPowerDuration58(p=state?.player){return 20+Math.max(0,Math.min(5,Math.floor(Number(p?.martial?.constitution)||0)))*5}
function armoryEvent(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  addLog("잠긴 무기고를 발견했다.");
  dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.55) dropRandomItem({x,y}, true);
  burst(x,y,"#d4b46b",16,1);
}
function cacheEvent(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.5) dropRandomItem({x,y}, false);
  burst(x,y,"#b9d3a2",14,.8);
  addLog("숨겨진 보급함 발견.");
}
function vaultEvent(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.78) dropRandomItem({x,y}, true);
  if(globalThis.__MANRU_RANDOM57__()<0.35) spawnMonster(PlacementService.randomFloor(1), false);
  burst(x,y,"#e0be6b",18,1);
  addLog("객주 금고 개방. 전리품 획득.");
}
const INVENTORY_RENDER={core:{id:'ux45-core',fn:renderInventoryCore},pre:[{id:'r47-tab-normalize',fn:normalizeInventoryTab}],post:[{id:'r47-decorate',fn:decorateInventoryStage},{id:'r48-clean-taxonomy',fn:cleanInventoryTaxonomy},{id:'r53-inspect-bindings',fn:bindInspectButtons},{id:'r56-identification',fn:patchInventoryIdentification},{id:'r57-food-actions',fn:foodInventoryActions},{id:'r74-talisman-fusion',fn:talismanFusionInventory},{id:'r967-ammo',fn:ammoInventory},{id:'r991-gear-identity',fn:gearIdentityInventory}]};
  const TALISMAN_BY_KIND=new Map(TALISMANS.map(t=>[t.talismanKind,t]));
  const TALISMAN_APP_BY_ID=new Map(TALISMAN_APPEARANCES.map(a=>[a.id,a]));
  function talismanApp56(item){
    if(!item||item.type!=='talisman')return GENERIC_TALISMAN56;
    if(item.mineItem105==='mystery')return {...TALISMAN_APPEARANCES[0],seal:'玄'};
    if(item.fusion74)return {id:'fusion',name:item.name,paper:'#d8bf83',paper2:'#a8844f',ink:'#8b2d28',seal:item.seal||'合'};
    if(item.talismanKind==='identify')return IDENTIFY_TALISMAN_THEME56;
    const K=state?.knowledge56,id=item.appearance56||K?.talismanMap?.[item.talismanKind];
    // The shuffled appearance itself is the texture. Identification changes knowledge/text only.
    // Unidentified talismans keep the same body/frame and only differ by their run-stable rune/color theme.
    return TALISMAN_APP_BY_ID.get(id)||TALISMAN_APPEARANCES[0];
  }
  function publicTalismanName56(item){return knownTalisman56(item)?item.name:GENERIC_TALISMAN56.name}
  function migrateScroll56(item){
    if(!item||item.type!=='scroll')return item;const n=String(item.name||''),kind=n.includes('감정')||n.includes('식별')?'identify':n.includes('지도')?'mapping':n.includes('이동')||n.includes('귀환')?'blink':n.includes('분노')||n.includes('응징')||n.includes('파쇄')?'blast':n.includes('수면')||n.includes('공포')?'bind':'ward',t=TALISMAN_BY_KIND.get(kind)||TALISMANS[0],keep={x:item.x,y:item.y,count:item.count||1};Object.keys(item).forEach(k=>delete item[k]);Object.assign(item,clone(t),keep);return item
  }
  function recovery70(i){return i&&(i.type==='food'||(i.type==='potion'&&['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(i.potionKind)))}
  function tactical70(i){return i&&(i.type==='talisman'||(i.type==='potion'&&!['heal_small','heal_medium','makgeolli','focus'].includes(i.potionKind))||(i.type==='food'&&['전력 주먹밥','매콤한 육포','한방 생선찜','보신 전골','얼음 복숭아'].includes(i.name)))}
  function placeItem70(proto){
    if(!proto)return false;const p=PlacementService.randomFloor(0);if(!p)return false;const i=clone(proto);Object.assign(i,{x:p.x,y:p.y,count:i.count||1});PlacementService.placeItem(i);return true
  }
  const key74=(a,b)=>[a,b].sort().join('+');
  /* The fusion recipes in the order the fusion screen and the talisman shop list them. RECIPE is built from this list. */
  const FUSION_RECIPES=[
  // 원소 + 강화 : +1을 같이 주지 않는다. 일반 강화 대신 속성 각인을 선택하는 거래다.
  {a:'elem_fire',b:'upgrade',kind:'f_fire_upgrade',name:'화강부적',seal:'炎',element:'fire',mode:'gear',ability:'무기 화염각인 / 방어구 화염면역',desc:'무기는 추가 화염 피해와 연소를 얻고, 방어구는 화염 역류를 막는다.'},
  {a:'elem_shock',b:'upgrade',kind:'f_shock_upgrade',name:'뇌강부적',seal:'淨',element:'shock',mode:'gear',ability:'무기 공속 +10% / 방어구 이동비용 -8%',desc:'전류를 장비의 움직임에 맞춰 흘린다.'},
  {a:'elem_water',b:'upgrade',kind:'f_water_upgrade',name:'수강부적',seal:'流',element:'water',mode:'gear',ability:'무기 방어 약화 / 방어구 독·출혈 세척',desc:'수기를 장비에 순환시켜 적의 자세를 무너뜨리거나 상처를 씻는다.'},
  {a:'elem_ice',b:'upgrade',kind:'f_ice_upgrade',name:'빙강부적',seal:'凍',element:'ice',mode:'gear',ability:'무기 냉각 경직 / 방어구 EVA +1',desc:'차가운 기운을 장비에 고정한다.'},
  {a:'elem_grass',b:'upgrade',kind:'f_grass_upgrade',name:'목강부적',seal:'芽',element:'grass',mode:'gear',ability:'무기 독분 각인 / 방어구 독 면역',desc:'살아 있는 기운을 장비 표면에 뿌리내린다.'},
  {a:'elem_earth',b:'upgrade',kind:'f_earth_upgrade',name:'지강부적',seal:'岩',element:'earth',mode:'gear',ability:'무기 중량타 / 방어구 DEF +1·밀치기 면역',desc:'장비의 무게와 지지력을 대지에 맞춘다.'},
  // 원소 + 폭발 : 생원소의 자기역류를 없애고 목표 지점에 집중한다.
  {a:'elem_fire',b:'blast',kind:'f_fire_blast',name:'화폭부적',seal:'炎',element:'fire',mode:'target',effect:'bomb_fire',range:5,ability:'3×3 층 비례 화염폭발 + 화염지대',desc:'원소 역류 없이 목표 지점에 층이 깊어질수록 강해지는 화염을 집중한다.'},
  {a:'elem_shock',b:'blast',kind:'f_shock_blast',name:'뇌폭부적',seal:'電',element:'shock',mode:'target',effect:'bomb_shock',range:6,ability:'층 비례 연쇄 뇌격 · 물/금속 특효',desc:'목표 주변의 생체와 금속을 층이 깊어질수록 강해지는 전류가 연쇄적으로 잇는다.'},
  {a:'elem_water',b:'blast',kind:'f_water_blast',name:'조수 폭쇄부적',seal:'潮',element:'water',mode:'target',effect:'bomb_water',range:5,ability:'층 비례 수압 폭발 · 강한 밀치기 · 소화',desc:'강한 층 비례 수압 피해와 밀치기로 진형을 붕괴시키는 수압 폭탄이다.'},
  {a:'elem_ice',b:'blast',kind:'f_ice_blast',name:'빙폭부적',seal:'雪',element:'ice',mode:'target',effect:'bomb_ice',range:5,ability:'층 비례 빙결폭발 · 비보스 경직',desc:'강해지는 급랭 피해와 경직으로 각개격파 시간을 번다.'},
  {a:'elem_grass',b:'blast',kind:'f_grass_blast',name:'목폭부적',seal:'荊',element:'grass',mode:'target',effect:'bomb_grass',range:5,ability:'층 비례 독분폭발 · 뿌리 구속',desc:'강한 직접 피해와 독·구속을 함께 퍼뜨린다.'},
  {a:'elem_earth',b:'blast',kind:'f_earth_blast',name:'지폭부적',seal:'震',element:'earth',mode:'target',effect:'bomb_earth',range:5,ability:'층 비례 고충격 폭발 · 밀치기/경직',desc:'층이 깊어질수록 강해지는 충격파로 지상 적의 진형을 무너뜨린다.'},
  // 일부 원소 + 기능 조합
  {a:'elem_fire',b:'ward',kind:'f_fire_ward',name:'화막부적',seal:'熾',element:'fire',mode:'instant',effect:'fireward',ability:'7턴 보호막 + 일시 화염저항',desc:'몸을 화염 장막으로 감싸고 주변에 불길을 남긴다.'},
  {a:'elem_shock',b:'blink',kind:'f_shock_blink',name:'뇌섬부적',seal:'閃',element:'shock',mode:'target',effect:'shockblink',range:7,ability:'순간이동 + 출발/도착 뇌격',desc:'축지의 양끝에 짧은 뇌격을 남긴다.'},
  {a:'elem_water',b:'ward',kind:'f_water_ward',name:'정수부적',seal:'淨',element:'water',mode:'instant',effect:'pureward',ability:'상태이상 정화 + 8턴 보호막',desc:'상처를 씻고 보호막을 만든다.'},
  {a:'elem_ice',b:'bind',kind:'f_ice_bind',name:'빙쇄부적',seal:'鎖',element:'ice',mode:'target',effect:'icebind',range:6,ability:'3×3 강빙결',desc:'봉박의 사슬을 냉기로 굳혀 더 오래 붙잡는다.'},
  {a:'elem_grass',b:'mapping',kind:'f_grass_map',name:'생맥부적',seal:'脈',element:'grass',mode:'instant',effect:'lifemap',ability:'전체 지도 + HP 8 회복',desc:'건물의 틈과 살아 있는 기운을 함께 읽는다.'},
  {a:'elem_earth',b:'ward',kind:'f_earth_ward',name:'석갑부적',seal:'壁',element:'earth',mode:'instant',effect:'stoneward',ability:'8턴 보호막 + 일시 대지저항',desc:'몸을 암반 같은 기운으로 감싼다.'},
  // 일부 원소 + 원소
  {a:'elem_fire',b:'elem_water',kind:'f_steam',name:'증기부적',seal:'霧',mode:'target',effect:'steam',range:5,ability:'3×3 증기 2턴 · 사선 차단',desc:'상극의 두 기운을 증기로 바꿔 사선을 끊는다.'},
  {a:'elem_water',b:'elem_ice',kind:'f_frostfield',name:'설빙부적',seal:'霜',mode:'target',effect:'frostfield',range:5,ability:'3×3 강빙결장',desc:'수기를 얼려 강한 제압장으로 만든다.'},
  {a:'elem_water',b:'elem_grass',kind:'f_regrowth',name:'생장부적',seal:'生',mode:'instant',effect:'regrowth',ability:'재생 7턴 + 인접 적 뿌리구속',desc:'수기와 목기를 생장으로 바꾼다.'},
  {a:'elem_fire',b:'elem_earth',kind:'f_lava',name:'용암부적',seal:'熔',mode:'target',effect:'lava',range:5,ability:'화염 충격 + 임시 용암',desc:'대지를 녹여 좁은 길을 5턴 동안 용암으로 만든다. 보스가 밟고 있는 칸에는 용암이 생기지 않는다.'},
  {a:'elem_grass',b:'elem_earth',kind:'f_bulwark',name:'목석부적',seal:'壘',mode:'instant',effect:'bulwark',ability:'임시 암벽 + 6턴 보호막',desc:'뿌리가 바위를 끌어올려 즉석 엄폐물을 만든다.'},
  {a:'elem_shock',b:'elem_water',kind:'f_thunderpool',name:'폭뢰부적',seal:'轟',mode:'target',effect:'thunderpool',range:6,ability:'수기 전도 연쇄뇌격',desc:'물기운을 전도체로 삼아 뇌격을 넓게 퍼뜨린다.'},
  // 일부 기능 + 기능
  {a:'blast',b:'bind',kind:'f_bindblast',name:'봉폭부적',seal:'禁',mode:'target',effect:'bindblast',range:5,ability:'층 비례 폭발 + 일반 적 3턴 봉인',desc:'폭발 뒤 종이 사슬이 퍼져 살아남은 일반 적을 3턴 봉인한다. 보스는 제어 내성이 열려 있을 때 1턴만 경직된다.'},
  {a:'identify',b:'mapping',kind:'f_heaveneye',name:'천안부적',seal:'眼',mode:'instant',effect:'heaveneye',ability:'전체 지도 + 미확인 2종 감정',desc:'지도와 감정을 한 장으로 묶은 탐색용 고급 부적이다.'},
  {a:'identify',b:'upgrade',kind:'f_identify_upgrade',name:'감강부적',seal:'鑑',mode:'instant',effect:'identify_all991',ability:'인벤토리의 모든 미감정 아이템 완전 감정',desc:'감정의 결을 강화해 행낭 안의 미감정 물건을 한꺼번에 밝힌다.'},
  {a:'ward',b:'blink',kind:'f_guardblink',name:'호축부적',seal:'遁',mode:'target',effect:'guardblink',range:6,ability:'안전 순간이동 + 6턴 보호막',desc:'도망과 방어를 한 번에 해결하는 비상탈출 부적이다.'},
  // 성부는 생원소와 기능부적 양쪽 합성계에 정식 참여한다. 미감정 상태에서는 아래 진짜 인장/색을 노출하지 않는다.
  {a:'holy',b:'elem_fire',kind:'f_holy_fire',name:'성화부적',seal:'輝',mode:'instant',effect:'holy_elem_fire991',ability:'성광 정화 + 화염 가호',desc:'성광과 화기를 겹쳐 저주와 탁기를 태우고 짧은 화염 가호를 남긴다.'},
  {a:'holy',b:'elem_shock',kind:'f_holy_shock',name:'성뢰부적',seal:'閃',mode:'instant',effect:'holy_elem_shock991',ability:'성광 정화 + 뇌전 가호',desc:'성광을 전류에 실어 주변의 사기를 태우고 뇌전 역류를 잠시 막는다.'},
  {a:'holy',b:'elem_water',kind:'f_holy_water',name:'성수부적',seal:'淨',mode:'instant',effect:'holy_elem_water991',ability:'강한 정화 + 수류 가호',desc:'깨끗한 수기와 성광으로 몸의 탁기를 씻고 잠시 수류의 역류를 막는다.'},
  {a:'holy',b:'elem_ice',kind:'f_holy_ice',name:'성빙부적',seal:'雪',mode:'instant',effect:'holy_elem_ice991',ability:'성광 정화 + 빙결 가호',desc:'차갑게 가라앉힌 성광이 사기를 얼려 부수고 냉기의 역류를 막는다.'},
  {a:'holy',b:'elem_grass',kind:'f_holy_grass',name:'성목부적',seal:'生',mode:'instant',effect:'holy_elem_grass991',ability:'성광 정화 + 목령 가호',desc:'살아 있는 기운에 성광을 섞어 탁기를 밀어내고 독분의 역류를 막는다.'},
  {a:'holy',b:'elem_earth',kind:'f_holy_earth',name:'성토부적',seal:'震',mode:'instant',effect:'holy_elem_earth991',ability:'성광 정화 + 대지 가호',desc:'성광을 대지에 내려앉혀 사기를 누르고 충격의 역류를 막는다.'},
  {a:'holy',b:'identify',kind:'f_holy_identify',name:'성감부적',seal:'明',mode:'instant',effect:'holy_identify991',ability:'모든 미감정 장비 감정 + 저주 드러냄',desc:'성광으로 장비의 숨은 결을 드러내 저주까지 함께 판별한다.'},
  {a:'holy',b:'upgrade',kind:'f_holy_upgrade',name:'성강부적',seal:'鍊',element:'holy',mode:'gear',ability:'무기 언데드 추가피해 +5 / 방어구 언데드 피해 15% 감소',desc:'성광을 장비에 각인한다. 무기는 기존 금강령 퇴와 같은 성속성 추가피해 계통을 사용하고, 방어구는 언데드에게 받는 직접 피해를 소폭 줄인다.'},
  {a:'holy',b:'blast',kind:'f_holy_blast',name:'성폭부적',seal:'光',mode:'instant',effect:'holy_blast991',ability:'주변 성광 폭발 · 원혼/언데드 특효',desc:'성광을 폭발시켜 가까운 사악한 존재를 강하게 태운다.'},
  {a:'holy',b:'mapping',kind:'f_holy_mapping',name:'성안부적',seal:'眼',mode:'instant',effect:'holy_mapping991',ability:'전체 지도 + 숨은 문 + 해로운 상태 정화',desc:'성광이 벽과 몸의 탁한 결을 함께 훑는다.'},
  {a:'holy',b:'ward',kind:'f_holy_ward',name:'성호부적',seal:'護',mode:'instant',effect:'holy_ward991',ability:'강한 상태 정화 + 보호막',desc:'성광을 장막으로 둘러 몸의 해로운 기운을 씻고 공격을 막는다.'},
  {a:'holy',b:'blink',kind:'f_holy_blink',name:'성축부적',seal:'縮',mode:'instant',effect:'holy_blink991',ability:'바라보는 방향 안전 점멸 + 정화',desc:'성광이 안전한 발판을 짚어 몸을 앞으로 접어 옮긴다.'},
  {a:'holy',b:'bind',kind:'f_holy_bind',name:'성봉부적',seal:'封',mode:'instant',effect:'holy_bind991',ability:'주변 구속 · 원혼/언데드 강구속',desc:'종이 사슬에 성광을 흘려 가까운 사기를 강하게 붙잡는다.'},
  ];
  const RECIPE=new Map(FUSION_RECIPES.map(r=>[key74(r.a,r.b),r]));
  const esc74=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function basicTalismans74(){return state.player.inventory.map((item,idx)=>({item,idx})).filter(v=>v.item.type==='talisman'&&!v.item.branchExclusive105&&!v.item.fusion74&&known74(v.item))}
  /* fused effects */
  const targetHud74=()=>document.getElementById('talismanTarget56');
  function monsterInfo986(mon){
    if(mon?.treeMimic105&&mon.mimicDormant105!==false)return mountainDeadTreeInfo();
    const desc=monsterConcept(mon);
    const hints=[],stats=[`HP ${displayHealth(mon.hp)}/${displayHealth(mon.maxHp)}`,`ATK ${displayNumber53(mon.atk)}`,`DEF ${displayNumber53(mon.def)}`,`EVA ${displayNumber53(mon.eva||0)}`],meta=[];
    if(mon.combustion105){hints.push(`연소 기본 피해 ${COMBUSTION_RULES105.damage}, 불바닥 위에서는 기본 피해 3. 식물은 화염에 더 약하다. 물·냉기로 꺼지며 주변을 자동 점화하지 않는다.`)}
    if(mon.sleeping105){hints.push(mon.doorSleep105?'봉인된 쥐굴의 잠. 이 방의 경고문을 열기 전에는 접근·소음으로 깨어나지 않는다. 문이 열리면 같은 방의 쥐들이 함께 깨어난다.':'잠든 동안 행동하지 않는다. 은신하지 않은 채 1칸 이내로 접근하거나, 전해지는 소음을 듣거나, 피해를 받으면 깨어난다.');}
    if(mon.ranged)stats.push(`사거리 ${displayNumber53(mon.range||6)}`);else if((mon.reach||1)>1)stats.push(`공격거리 ${displayNumber53(mon.reach)}`);
    if(mon.boss)meta.push('보스');else if(mon.legendElite47||mon.miniBoss)meta.push('정예');else meta.push(isPlayerAlly57(mon)?'아군 개체':'적대 개체');
    if(mon.kind)meta.push(({human:'인간',beast:'야수',spirit:'영체',undead:'망자',plant:'식물',construct:'구조체',slime:'점액'})[mon.kind]||mon.kind);
    if(mon.flying)meta.push('비행');if(mon.aquatic)meta.push('수생');if(monsterMovementLocked57(mon))meta.push('고정');
    if(aquaticStranded(mon)){meta.push('뭍에 남음');hints.push('물이 빠진 자리에서 몸을 뒤틀며 펄떡인다. 다시 물이 차면 헤엄치는 모습을 되찾는다.')}
    if(mon.legendElite47)meta.push('문지기 강화');
    if(mon.palaceLotus105)hints.push(palaceWet(mon)?'개화 · 완전 견인 사용 가능':'닫힌 꽃봉오리 · 견인 불가');if(mon.equipmentActor105)hints.push('무기: '+(mon.weapon?.name||'없음'));if(mon.martialActor105){stats.push(`기 ${Math.floor(mon.focus)}/${mon.maxFocus}`);hints.push(dojoInspect(mon,{battle:!!state.debugBattle57}));}return{name:mon.name,meta,stats,statuses:combatStatusRows(mon),desc,skills:monsterSkills(mon),martialCards:mon.martialActor105?Object.keys(MARTIAL_INFO).filter(id=>mon.martial[id]>0).map(id=>({id,actor:mon})):null,blink:mon.martialActor105&&mon.dojoRank105>=3,hint:[...new Set(hints)].join(' ')};
  }
/* R37 THEME-2 DESIGN — quiet ink/wood/stone materials, with deliberate indoor/outdoor room identities. */
function refineTheme2Rooms1027(){
  state.theme2RoomIdentity1027=null;if(![7,9].includes(state.floor))return null;const rooms=[...(state.rooms||[])].filter(r=>r&&r.w>=6&&r.h>=5).sort((a,b)=>b.w*b.h-a.w*a.h),out={floor:state.floor,indoor:0,garden:0,rooms:[]};
  const floorish=t=>[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.WOOD_FLOOR,TT.DARK_WOOD].includes(t),meta=[];
  for(const r of rooms){const q=roomProbe1026(r),nm=r.name||r.label||'',seed=hash1022(floorSeedKey(`t2room:${state.floor}:${r.x},${r.y}`)),namedIndoor=/객실|서고|가옥|오두막|실내|본관|장옥|연회|공방/.test(nm),enclosure=q?.enclosure||0;meta.push({r,seed,enclosure,namedIndoor,indoor:namedIndoor||enclosure>=.34||(enclosure>=.23&&seed%100<36)})}
  // At least a quarter of anonymous rooms become gardens when the generator otherwise reads as one giant brown interior.
  const anon=meta.filter(v=>!v.namedIndoor).sort((a,b)=>a.enclosure-b.enclosure||a.seed-b.seed),wantGarden=Math.min(anon.length,Math.max(meta.length>=4?1:0,Math.round(meta.length*.28)));for(let i=0;i<wantGarden;i++)anon[i].indoor=false;
  for(const v of meta){const {r,seed,indoor}=v;for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const t=state.map[y]?.[x];if(!floorish(t))continue;if(indoor){const border=x===r.x+1||x===r.x+r.w-2||y===r.y+1||y===r.y+r.h-2;setTerrainTile58(state.map,x,y,border&&r.w>=9&&r.h>=7?TT.DARK_WOOD:TT.WOOD_FLOOR)}else{const cross=x===r.cx||y===r.cy;setTerrainTile58(state.map,x,y,cross?TT.STONE_PATH:((x+y+seed)%6===0?TT.LIGHT_GRASS:TT.GRASS))}}if(indoor)out.indoor++;else out.garden++;out.rooms.push({x:r.x,y:r.y,w:r.w,h:r.h,indoor,enclosure:v.enclosure})}
  state.theme2RoomIdentity1027=out;return out;
}
function weightedBossUtility55(entries){
  const pool=entries.filter(e=>e?.item&&Number(e.weight)>0);if(!pool.length)return null;
  const total=pool.reduce((n,e)=>n+e.weight,0);let r=globalThis.__MANRU_RANDOM57__()*total;
  for(const e of pool){r-=e.weight;if(r<=0)return e}return pool.at(-1)
}
function cls(msg){if(/치명타|종결/.test(msg))return['crit','✦'];if(/→|격파|돌진|칼날|피했다|회피|끌어당/.test(msg))return['combat','칼'];if(/획득|전리품|금고|보급함|열쇠/.test(msg))return['loot','가방'];if(/중독|출혈|회복|FOCUS|HP|허기|보호막|LEVEL/.test(msg))return['status','기'];return['system','기록']}
  const uniq53=a=>[...new Set(a.map(v=>String(v??'').trim()).filter(Boolean))];
  const RECOVERY_KINDS=new Set(['heal_small','heal_medium','makgeolli','focus','cleanse']);
  const IDENTIFY_TALISMAN_THEME56=Object.freeze({id:'identify',name:'감정부적',paper:'#dfc78e',paper2:'#b8955b',ink:'#9d3126',seal:'鑑'});
  function contextAt56(x,y,kind){
    const fr=featureAt56(x,y);if(fr&&ROOM_CONTEXT[fr.name]){const c=ROOM_CONTEXT[fr.name],match=c.kinds.includes(kind);return{label:fr.name,text:match?c.text:'이 방의 주된 약성과 다른 물건이다. 다른 곳에서 반입된 듯하다.',kinds:match?[...c.kinds]:[],strength:match?2:0}}
    const n=nearTypes56(x,y,2),tests=[
      {has:[TT.LAVA,TT.BRAZIER],label:'열기 주변',text:'불과 수지 흔적이 있어 열기·강화 계열일 가능성이 있다.',kinds:['fire','fortify','smoke']},
      {has:[TT.WATER,TT.FOUNTAIN,TT.MERCURY],label:'물가 주변',text:'정화수와 냉기가 가까워 정신·정화 계열일 가능성이 있다.',kinds:['cleanse','focus','heal_small']},
      {has:[TT.TRAP,TT.SNARE],label:'함정 주변',text:'회피 경로에 놓인 약병이라 기동·연막 계열일 가능성이 있다.',kinds:['swift','smoke','heal_medium']},
      {has:[TT.ALTAR,TT.GOLD],label:'제단 주변',text:'향과 금분 흔적이 있어 정화·보호 계열일 가능성이 있다.',kinds:['cleanse','focus','fortify']},
      {has:[TT.ARMORY],label:'병기 보관구',text:'병기 옆에 놓여 전투·연막 계열일 가능성이 있다.',kinds:['fortify','smoke','fire']}
    ];
    for(const t of tests)if(t.has.some(v=>n.has(v))){const match=t.kinds.includes(kind);return{label:t.label,text:match?t.text:'주변 구조와 약성이 어긋난다. 위치 단서의 신뢰도가 낮다.',kinds:match?[...t.kinds]:[],strength:match?1:0}}
    return{label:'출처 불명',text:'발견 위치만으로는 약성을 좁히기 어렵다.',kinds:[],strength:0};
  }
  function inventoryFilteredFor56(tab){const old=inventoryTab;inventoryTab=tab;const r=inventoryFiltered();inventoryTab=old;return r}
function ingredientKey57(item){if(item?.type==='potion'){const proto=(globalThis.MANRU_POTIONS||[]).find(p=>p.potionKind===item.potionKind);return item.potionKind==='fire'?'화유병':proto?.name||item.name||'';}return item?.name||''}
const GUARANTEED_FOOD_PER_NONBOSS_FLOOR57=1;
const EXTRA_FOOD_CHANCE_NONBOSS57=.20;
  function strategyItem62(i){if(!i)return false;if(i.type==='talisman')return true;if(i.type==='potion')return !['heal_small','heal_medium','makgeolli','focus'].includes(i.potionKind);if(i.type==='food')return ['전력 주먹밥','매콤한 육포','한방 생선찜','보신 전골','얼음 복숭아'].includes(i.name);return false}
  function beltItemKey62(item){return JSON.stringify([item.type,item.talismanKind||item.potionKind||item.name])}
  function recoveryPool70(){
    const food=CONSUMABLES.filter(i=>i.type==='food'&&!['relic','sealed'].includes(i.rarity)&&!i.recipeResult57);
    const pots=(window.MANRU_POTIONS||[]).filter(i=>['heal_small','heal_medium','makgeolli','focus','cleanse'].includes(i.potionKind)&&(state.floor>=(i.minFloor||1)));
    return [...food,...pots];
  }
  function tacticalPool70(){
    const pots=(window.MANRU_POTIONS||[]).filter(i=>!['heal_small','heal_medium','makgeolli','focus'].includes(i.potionKind)&&(state.floor>=(i.minFloor||1)));
    const tal=(window.MANRU_TALISMANS||[]).filter(i=>state.floor>=(i.minFloor||1));
    return [...pots,...tal];
  }
  function app74(item){return window.__MANRU_TALISMAN_PUBLIC__?.app?.(item)||{name:'미확인 부적',ink:'#9b7448'}}
  let choiceCancel991=null;
  function useBodyPower74(item){
    if(bodyPowerActive()){toast('이미 괴력이 폭발하고 있다.');return false}
    if(!state?.player?.inventory.includes(item)||item.talismanKind!=='upgrade'||playerClassRules58().upgradeTalismanMode!=='bodyBoost')return false;
    const p=state.player,d=bodyPowerDuration58(p),born=(state.playerAgencyTurns57||0)+1;
    p.classState={powerTurns:d,powerTotal:d,powerHealHundredths:p.classState?.powerHealHundredths||0,powerRulesVersion:3,powerExhaustion:bodyPowerExhaustion58(p),powerBornAgencyTurn:born,powerLastAgencyTurn:born};
    identifyKind('upgrade','괴력 발현');consumeRef(item);closeGear();closeInventory();cancelAutoWalk();
    burst(p.x,p.y,'#dfad51',30,1);impact(p.x,p.y,'#e9bd65',6);floatText(p.x,p.y,`괴력 ${d}턴`,'#ffdc8a',17);vfVibrate([60,30,100]);
    globalThis.__MANRU_SFX54__?.play('bodyPower58');
    addLog(`괴력 발동 · ${d}턴 동안 ATK +2 · DEF +7 · 매턴 최대 HP 2% 회복. 종료 후 ${p.classState.powerExhaustion}턴 실명·배탈.`);
    globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"useBodyPower74"}).value;return true;
  }
function tierForFloor(floor=state.floor){if(floor>=24)return globalThis.__MANRU_RANDOM57__()<.42?5:4;if(floor>=21)return globalThis.__MANRU_RANDOM57__()<.38?4:3;if(floor>=16)return globalThis.__MANRU_RANDOM57__()<.40?4:3;if(floor>=11)return globalThis.__MANRU_RANDOM57__()<.55?3:2;if(floor>=6)return globalThis.__MANRU_RANDOM57__()<.48?2:1;return 1}
  /* ---------- v4.8 loot ecology: guaranteed core resources without item spam ---------- */
  function floorHasRole48(role){return(state.items||[]).some(i=>role47(i)===role)}
function roomFreeFood57(fr){const a=[];for(let y=fr.y+1;y<fr.y+fr.h-1;y++)for(let x=fr.x+1;x<fr.x+fr.w-1;x++)if(ReachabilityService.playerPassable(x,y)&&state.map[y][x]!==TT.STAIR&&!OccupancyService.isOccupied(x,y)&&!state.items.some(i=>i.x===x&&i.y===y))a.push({x,y});return a.length?choice(a):PlacementService.randomFloor(0)}
function bodyPowerExhaustion58(p=state?.player){return bodyPowerDuration58(p)}
  const GENERIC_TALISMAN56=Object.freeze({id:'unknown',name:'미확인 부적',paper:'#d8c79b',paper2:'#b49b6d',ink:'#8a2f28',seal:'?'});
  function featureAt56(x,y){return(state?.featureRooms||[]).find(r=>x>=r.x&&y>=r.y&&x<r.x+r.w&&y<r.y+r.h)||null}
  function nearTypes56(x,y,r=2){const s=new Set();for(let yy=Math.max(0,y-r);yy<=Math.min(ROWS-1,y+r);yy++)for(let xx=Math.max(0,x-r);xx<=Math.min(COLS-1,x+r);xx++)s.add(state.map[yy]?.[xx]);return s}
function addLog(msg){const raw=String(msg??'');if(state){for(const p of POTION_LIST)if(raw.startsWith(p.name+':')&&effectLog56(raw)&&!isPotionKnownByPlayer(p))identifyPotion(p.potionKind,'사용 효과 관찰')}return logWithCategory(sanitize56(raw))}
function playerAction57(kind,opts={}){
  if(runState57()!=='playing'){ActionDispatcher.denied('inactive');return{ok:false,kind,reason:'inactive'}};
  if(!gameplayInputAllowed57(opts)){ActionDispatcher.denied('blocked');return{ok:false,kind,reason:'blocked'}};
  if(ACTION_PRESENTATION58.run===state&&performance.now()<ACTION_PRESENTATION58.inputUntil){ActionDispatcher.denied('presenting');return{ok:false,kind,reason:'presenting'}}
  if(dojoSleeping()){ActionDispatcher.denied('asleep');return{ok:false,kind,reason:'asleep'};}
  if(state.shopIntermission?.active)return{ok:true,kind,committed:false};
  if((state.status?.stun||0)>0){ActionDispatcher.denied('stun');state.status.stun--;if(opts.closeMartial)closeMartial();if(opts.closeInventory)closeInventory();addLog(opts.stunMessage||'몸이 굳어 행동하지 못했다.');globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:"playerAction57",...{playerAgency:false,reason:'stun-skip'}}).value;return{ok:false,kind,reason:'stun',consumed:true,stunned:true}}
  if(opts.skill&&(state.status?.skillSeal||0)>0){ActionDispatcher.denied('skillSeal');toast('기력이 봉인되어 이 행동을 할 수 없다.');return{ok:false,kind,reason:'skillSeal'}}
  return{ok:true,kind,committed:false}
}
function potionStats(s){if(state?.status?.swift>0)s.eva+=10;if(state?.status?.fortify>0)s.def+=3;if(state?.status?.willBoost>0)s.will+=2;return s}
function hungerStats(s){if(state?.player?.hunger<=0)s.atk=Math.max(1,Math.round(s.atk*.8*10)/10);return s}
function curseStats(s){return applyCurseStats(s)}
function potionAttackCost(c,item){return state?.status?.swift>0?clamp(c*.8,.45,1.8):c}
function foodAttackCost(c,item){if(state?.status?.foodHaste57>0)c*=.90;if(state?.status?.freeStamina57>0)c*=.50;return clamp(c,.25,2.2)}
function curseAttackCost(c){const power=curseMultiplier('clumsy');if(power>0)c*=1+.08*power;return c}
function potionMoveCost(c){return state?.status?.swift>0?clamp(c*.8,.55,1.15):c}
function foodMoveCost(c){if(state?.status?.freeStamina57>0)c*=.50;return clamp(c,.25,1.8)}
function curseMoveCost(c){const power=curseMultiplier('binding');if(power>0)c*=1+.12*power;return c}
function patchInventoryIdentification(){return patchInventory56()}
function talismanFusionInventory(){const box=document.getElementById('inventory');if(!box)return;const head=box.querySelector('.uxInvMeta,.mfInvMeta,.invMeta');if(head&&(basicTalismans74().length>=2||!playerClassRules58().talismanFusion)&&!head.querySelector('.f74FuseBtn')){const b=document.createElement('button');b.className='f74FuseBtn';b.textContent=playerClassRules58().talismanFusion?'부적 합성':'합성 불가';b.disabled=!playerClassRules58().talismanFusion;b.title=b.disabled?'천하장사는 부적을 합성할 수 없다.':'';b.onclick=e=>{e.preventDefault();e.stopPropagation();openFusion()};head.appendChild(b)}const selected=inventorySelection>=0?state.player.inventory[inventorySelection]:null;if(selected?.type==='talisman'&&known74(selected)&&!selected.fusion74){const detail=box.querySelector('.uxActions,.mfActions,.invActions');if(detail&&basicTalismans74().length>=2&&!detail.querySelector('[data-fuse-selected74]')){const b=document.createElement('button');b.dataset.fuseSelected74='1';b.textContent=playerClassRules58().talismanFusion?'이 부적으로 합성':'천하장사는 부적을 합성할 수 없다.';b.disabled=!playerClassRules58().talismanFusion;b.onclick=e=>{e.preventDefault();e.stopPropagation();openFusion(selected)};detail.appendChild(b)}}box.querySelectorAll('[data-invslot]').forEach(el=>{const it=state.player.inventory[+el.dataset.invslot];if(it?.fusion74&&!el.querySelector('.f74badge'))el.insertAdjacentHTML('beforeend','<span class="f74badge">합</span>')})}
function gearIdentityInventory(){if(!state||!inventoryOpen)return;const box=document.getElementById('inventory');if(!box)return;
    box.querySelectorAll('[data-invslot]').forEach(el=>{const it=state.player.inventory[+el.dataset.invslot];const knownCurse=!!(it?.identified===true&&it?.curse991);el.classList.toggle('knownCurse991',knownCurse);if(knownCurse){el.style.setProperty('border-color','#d44738','important');el.style.setProperty('background','linear-gradient(180deg,#35100d,#140706)','important');el.style.setProperty('box-shadow','inset 0 0 0 1px #6f1d18,0 0 13px rgba(224,55,42,.44)','important')}else{el.style.removeProperty('border-color');el.style.removeProperty('background');el.style.removeProperty('box-shadow')}const nm=el.querySelector('.nm,.invSlotName');if(nm&&isGearItem(it))nm.textContent=it.name});
    box.querySelectorAll('[data-uxeq],[data-eqslot]').forEach(el=>{const slot=el.dataset.uxeq||el.dataset.eqslot,it=state.player[slot],known=!!(it?.identified===true&&it?.curse991);el.classList.toggle('knownCurse991',known);if(known){el.style.setProperty('border-color','#d44738','important');el.style.setProperty('background','linear-gradient(180deg,#35100d,#140706)','important');el.style.setProperty('box-shadow','inset 0 0 0 1px #6f1d18,0 0 13px rgba(224,55,42,.44)','important')}else{el.style.removeProperty('border-color');el.style.removeProperty('background');el.style.removeProperty('box-shadow')}});
    const selected=inventorySelection>=0?state.player.inventory[inventorySelection]:null,d=box.querySelector('.uxDetail,.invDetail');
    if(isUnknownGear(selected)&&d){const h=d.querySelector('h3');if(h)h.textContent=selected.name;const sub=d.querySelector('.uxDetailHead small,.typeLine');if(sub)sub.textContent=`${publicGearType(selected.type)} · 종류 확인 · 세부 미감정`;const stats=d.querySelector('.uxStats,.invStats');if(stats)stats.innerHTML=publicGearStats(selected).map(x=>`<span class="invStatChip">${x}</span>`).join('');const desc=d.querySelector('.uxDesc,.desc');if(desc)desc.textContent='종류와 기본 외형은 확인됐다. 강화 수치, 저주 여부와 숨은 마법 옵션은 감정 전까지 드러나지 않는다.'}
    else if(selected?.identified===true&&selected?.curse991&&d){const stats=d.querySelector('.uxStats,.invStats');if(stats&&!stats.querySelector('.curse991Chip')){const c=curseDefOf(selected),stacks=selected.curseActive991?curseStackCount(selected.curse991):0,power=stacks?curseMultiplier(selected.curse991):1,sp=document.createElement('span');sp.className='uxStat curse991Chip';sp.textContent=`저주 · ${c?.name||'불명'}${stacks>1?` · 중첩 ${stacks} / ×${power}`:''}`;stats.appendChild(sp)}}}
function potionObserveBefore(ctx){const item=ctx.ground;if(item?.type==='potion')decoratePotion56(item,item.x,item.y);ctx.potionBefore56=item?.type==='potion'?qtyKind56(item.potionKind):0}
function potionObserveAfter(ctx){const item=ctx.ground,after=item?.type==='potion'?qtyKind56(item.potionKind):0;if(item?.type==='potion'&&after>(ctx.potionBefore56||0))observePotion(item)}
function blockWhileCooking(){return !V57.cookOpen}
  function pcolor(i){return i?.color||'#b65b4c'}
  const ROOM_CONTEXT={
    '연금술방':{text:'조제대에 금창약·해독재·청심초가 함께 놓여 있다.',kinds:['heal_small','heal_medium','makgeolli','cleanse','focus']},
    '주방':{text:'식재료 옆에 소독재와 보양 약재가 놓여 있다.',kinds:['heal_small','makgeolli','cleanse','focus']},
    '사당':{text:'향로 재와 정화수 흔적이 남아 있다.',kinds:['cleanse','focus','fortify']},
    '무기고':{text:'수지·화약·근육을 굳히는 약재가 함께 보관돼 있다.',kinds:['fortify','smoke','fire']},
    '서고':{text:'약성 기록에는 정신·기동 계열의 표식이 반복된다.',kinds:['focus','swift','cleanse']},
    '감방':{text:'탈옥 도구 곁에 연막·경신·응급 약재가 숨겨져 있다.',kinds:['smoke','swift','heal_medium','makgeolli']}
  };
  function effectLog56(text){return/(HP \+|기 \+|WILL 강화|신속|DEF 강화|연막|화염|독·출혈|약화 해제)/.test(String(text))}
  function qtyKind56(kind){return(state?.player?.inventory||[]).filter(i=>i.type==='potion'&&i.potionKind===kind).reduce((s,i)=>s+(i.count||1),0)}
window.MANRU_POTIONS=POTIONS;
window.__MANRU_CLEAN_INSPECT53={item:itemHtml};
window.MANRU_TALISMANS=TALISMANS;
window.__MANRU_TALISMAN_PUBLIC__={known:knownTalisman56,name:publicTalismanName56,seal:publicTalismanSeal56,app:talismanApp56};
window.MANRU_FOOD57={recipes:FOOD_RECIPES};
globalThis.__MANRU_BELT62__=Object.freeze({use(slot){if(uiInputBlocked())return false;const a=beltItems(),v=a[Number(slot)-1];return v?!!ActionDispatcher.dispatch({type:'ITEM_USE',args:[v.idx]}).value:false},items(){return beltItems().map(v=>({key:v.key,idx:v.idx}))}});
window.MANRU_AMMO=AMMO_TYPES;
window.__MANRU_TERRAIN_CODEX986__={
    openItem:openItemInspect986
  };
globalThis.__MANRU_GEN991__={applyCurses:applyCursesToAllGear,ensureHoly:ensureHolyDrop};
  const POTION_LIST=Array.isArray(window.MANRU_POTIONS)?window.MANRU_POTIONS:[];
  // r57: structure noise / hedge / bamboo behavior is integrated into canonical bumpBlockedTile.
  function uiInputBlocked(){return !gameplayInputAllowed57()||!!window.__manruZoomActive}
  const BASE_KIND74=new Map((window.MANRU_TALISMANS||[]).map(t=>[t.talismanKind,t]));
  const POTION_BY_KIND=new Map(POTION_LIST.map(p=>[p.potionKind,p]));
function ammoPlayerAttack(next,mon,bonus=0,...args){const a=state?._activeAmmo967,d=ammoDef(a?.ammoKind);if(!d)return next(mon,bonus,...args);const oldDef=mon.def;if(d.pierce)mon.def=Math.max(0,(mon.def||0)-d.pierce);try{return next(mon,bonus+(d.atkBonus||0),...args)}finally{mon.def=oldDef}}
function cursePlayerAttack(next,mon,...rest){const r=next(mon,...rest),power=curseMultiplier('thirst'),outcome=state?.playerAttackOutcome57;if(power>0&&outcome?.kind==='miss'){const loss=Math.min(state.player.focus,Math.max(1,Math.round(power)));state.player.focus=Math.max(0,state.player.focus-loss);floatText(state.player.x,state.player.y,`기 -${loss}`,'#b98b79',10);addLog(`갈증의 저주가 빗나간 기운을 빨아들였다. 기력 -${loss}.`)}return r}
function weaponPlayerAttack(next,mon,bonusAtk=0,...rest){
  const p=state?.player,w=p?.weapon||{},hp0=mon?.hp??0,eva0=mon?.eva,followup=rest.some(v=>v&&v.chainFollowup1006===true);
  let opening=false;
  if(mon&&w.edgeBonus&&mon.maxHp>0&&mon.hp/mon.maxHp>=.75)opening=true;bonusAtk+=equipmentOpeningBonus105(p,mon);
  if(mon&&w.tracking&&w.ranged&&Number.isFinite(eva0))mon.eva=Math.max(0,eva0-6);
  let r;try{r=next(mon,bonusAtk,...rest)}finally{if(mon&&w.tracking&&w.ranged&&Number.isFinite(eva0))mon.eva=eva0}
  const hit=r===true&&!!mon&&mon.hp<hp0;
  if(opening&&hit)addLog('태도 · 일섬: 빈틈을 선점해 추가 피해를 냈다.');
  equipmentFocusChain105(p,hit);
  if(hit&&mon.hp>0&&!followup&&Number(w.chain)>0&&globalThis.__MANRU_RANDOM57__()<w.chain){floatText(mon.x,mon.y,'연격','#e8c58d',11);addLog(`${w.name} · 연격!`);attackPlayer(mon,0,{chainFollowup1006:true})}
  return r;
}
