import type { EffectSpec, GameState, ItemCategory, ItemDefinition, Locale, SiteKind, SiteServiceKind, StoryEvent } from './core/types';
import { displayItemName, isMysteryItem } from './core/item-knowledge';

const UI: Record<Locale, Record<string, string>> = {
  en: {
    newRun:'New Run',continue:'Continue',seed:'Seed',saveWarning:'Only Save & Quit creates a resumable save.',bag:'Bag',done:'Done',recent:'Recent',saveQuit:'Save & Quit',gold:'Gold',site:'Place',language:'한국어',itemInfo:'Info',drop:'Drop',buy:'Buy',sell:'Sell',heal:'Heal',cleanse:'Cleanse',identify:'Identify',map:'Map',bless:'Bless',rest:'Rest',rumor:'Listen',equipped:'Equipped',unknown:'Unidentified',effects:'Effects',tags:'Traits',rarity:'Rarity',price:'Price',close:'Close',noStock:'Nothing useful is for sale.',noItems:'You have nothing suitable.',fullHp:'You are already fully healed.',storyEvent:'EXCEPTIONAL EVENT',titleEyebrow:'COLOR ASCII ROGUELIKE',subtitle:'Descend. Drift. Do not go too far sideways.',loadDirty:'The previous run did not end cleanly.',loadOld:'That save belongs to an older build.',runSaved:'Run saved.',saveFailed:'Save failed; the run remains active.',runEnded:'The run ended.',emptyBag:'Your bag is empty.',use:'Use',activate:'Activate',ready:'Ready',wear:'Wear',settlement:'Settlement',serviceUsed:'Already used here.',notEnoughGold:'Not enough gold.',siteHint:'Stand here and choose a service.',load:'Load',burdened:'Burdened',overloaded:'Overloaded',explore:'Explore',search:'Search',brace:'Brace',fire:'Fire',ammo:'Ammo',level:'Level',hunger:'Hunger',sated:'Sated',fed:'Fed',hungry:'Hungry',weak:'Weak',starving:'Starving',meal:'Meal',innRest:'Sleep',trainAttack:'Train ATK',trainDefense:'Train DEF',trainVigor:'Train Vigor',spell:'Spell',mana:'Mana',interact:'Use',patron:'Patron',quests:'Contracts',piety:'Piety',temperWeapon:'Temper weapon',temperArmor:'Temper armor',uncurse:'Remove curse',devote:'Devote',invoke:'Invoke'
  },
  ko: {
    newRun:'새 게임',continue:'이어하기',seed:'시드',saveWarning:'이어할 수 있는 세이브는 「저장 후 종료」로만 만들어집니다.',bag:'가방',done:'완료',recent:'최근 기록',saveQuit:'저장 후 종료',gold:'골드',site:'장소',language:'English',itemInfo:'정보',drop:'버리기',buy:'구매',sell:'판매',heal:'치료',cleanse:'정화',identify:'감정',map:'지도',bless:'축복',rest:'휴식',rumor:'소문 듣기',equipped:'장착 중',unknown:'미확인',effects:'효과',tags:'특성',rarity:'희귀도',price:'가격',close:'닫기',noStock:'살 만한 물건이 없습니다.',noItems:'대상으로 삼을 물건이 없습니다.',fullHp:'이미 체력이 가득합니다.',storyEvent:'특별한 사건',titleEyebrow:'컬러 ASCII 로그라이크',subtitle:'내려가라. 옆으로 틀어라. 하지만 너무 멀리 가지 마라.',loadDirty:'이전 플레이가 정상적으로 종료되지 않았습니다.',loadOld:'이 세이브는 이전 버전에서 만들어졌습니다.',runSaved:'게임을 저장했습니다.',saveFailed:'저장에 실패했습니다. 현재 런은 계속 활성 상태입니다.',runEnded:'이번 런이 끝났습니다.',emptyBag:'가방이 비어 있습니다.',use:'사용',activate:'작동',ready:'장착',wear:'착용',settlement:'정착지',serviceUsed:'이 장소의 서비스는 이미 사용했습니다.',notEnoughGold:'골드가 부족합니다.',siteHint:'이 칸에 서서 서비스를 선택할 수 있습니다.',load:'무게',burdened:'짐 많음',overloaded:'과적',explore:'탐색',search:'수색',brace:'방어',fire:'사격',ammo:'탄약',level:'레벨',hunger:'포만도',sated:'배부름',fed:'든든함',hungry:'배고픔',weak:'허기짐',starving:'굶주림',meal:'식사',innRest:'숙박',trainAttack:'공격 훈련',trainDefense:'방어 훈련',trainVigor:'체력 훈련',spell:'주문',mana:'마나',interact:'사용',patron:'수호신',quests:'계약',piety:'신앙',temperWeapon:'무기 단련',temperArmor:'방어구 단련',uncurse:'저주 해제',devote:'귀의',invoke:'권능 요청'
  }
};

export function tr(locale: Locale, key: string): string { return UI[locale][key] ?? UI.en[key] ?? key; }

const THEME_KO: Record<string,string> = {
  'moss-cistern':'이끼 저수조','drowned-aqueduct':'침수 수로','ember-mine':'잿불 광산','fungal-vault':'균사 지하고','ossuary-terraces':'납골단지 계단층',ironwarren:'철의 굴','crystal-hollows':'수정 공동','venom-fen':'맹독 습지','storm-archive':'폭풍 기록보관소','ash-cathedral':'재의 대성당','flesh-cloister':'살점 회랑','clockwork-necropolis':'태엽 공동묘지','frozen-observatory':'빙결 관측소','sunken-palace':'침몰 궁전','void-garden':'공허 정원','royal-chasm':'왕가의 균열','dream-prison':'꿈 감옥','star-forge':'별의 대장간',abyss:'심연'
};
export function localizedThemeName(id:string, fallback:string, locale:Locale):string { return locale === 'ko' ? THEME_KO[id] ?? fallback : fallback; }

const SITE_KO: Record<SiteKind,string> = {
  'town-square':'마을 광장',merchant:'상점',provisioner:'식량상',healer:'치료소',appraiser:'감정소',cartographer:'지도상',shrine:'성소',camp:'야영지',trainer:'훈련소',inn:'여관',guildhall:'길드홀',smithy:'대장간'
};
const SITE_EN: Record<SiteKind,string> = {
  'town-square':'Town Square',merchant:'Shop',provisioner:'Provisioner',healer:'Healer',appraiser:'Appraiser',cartographer:'Cartographer',shrine:'Shrine',camp:'Camp',trainer:'Trainer',inn:'Inn',guildhall:'Guildhall',smithy:'Smithy'
};
export function siteKindName(kind:SiteKind, locale:Locale):string { return locale === 'ko' ? SITE_KO[kind] : SITE_EN[kind]; }

const SERVICE_EN: Record<SiteServiceKind,string>={rumor:'Hear rumor',buy:'Buy',sell:'Sell',heal:'Heal',cleanse:'Cleanse',identify:'Identify',map:'Buy map',bless:'Receive blessing',rest:'Rest',meal:'Hot meal','train-attack':'Train attack','train-defense':'Train defense','train-vigor':'Train vigor','inn-rest':'Sleep safely',devote:'Devote',invoke:'Invoke patron',contract:'Take contract','claim-contract':'Claim contract','temper-weapon':'Temper weapon','temper-armor':'Temper armor',uncurse:'Remove curse'};
const SERVICE_KO: Record<SiteServiceKind,string>={rumor:'소문 듣기',buy:'구매',sell:'판매',heal:'치료',cleanse:'정화',identify:'감정',map:'지도 구매',bless:'축복 받기',rest:'휴식',meal:'따뜻한 식사','train-attack':'공격 훈련','train-defense':'방어 훈련','train-vigor':'체력 훈련','inn-rest':'안전한 숙박',devote:'귀의',invoke:'권능 요청',contract:'계약 수락','claim-contract':'계약 보상','temper-weapon':'무기 단련','temper-armor':'방어구 단련',uncurse:'저주 해제'};
export function serviceName(service:SiteServiceKind,locale:Locale):string{return locale==='ko'?SERVICE_KO[service]:SERVICE_EN[service];}

const CATEGORY_KO:Record<ItemCategory,string>={weapon:'무기',armor:'방어구',consumable:'소모품',tool:'도구',relic:'유물'};
export function categoryName(category:ItemCategory,locale:Locale):string{return locale==='ko'?CATEGORY_KO[category]:category;}

const ITEM_KO: Record<string,string> = {
  'rust-knife':'녹슨 단검','cistern-spear':'저수조 창','ember-pick':'잿불 곡괭이','bone-sabre':'뼈 사브르','iron-maul':'철제 대망치','spore-crook':'포자 지팡이','prism-rapier':'프리즘 레이피어','fen-hook':'습지 갈고리','storm-rod':'폭풍 지팡이','ash-glaive':'재의 글레이브','vein-cutter':'혈관 절단검','gear-hammer':'기어 망치','rime-brand':'서리 검','tide-trident':'파도 삼지창','dream-sickle':'꿈 낫','star-anvil-blade':'별모루 검',
  'patched-coat':'기운 외투','moss-mail':'이끼 갑옷','silt-vest':'진흙 조끼','ore-plate':'광석 판갑','mycelium-wrap':'균사 붕대갑','ossuary-cuirass':'납골 흉갑','prism-shell':'프리즘 갑각','fen-scale':'습지 비늘갑','ash-vestment':'재의 예복','clockwork-harness':'태엽 하네스','rime-carapace':'서리 갑각','royal-ruin-plate':'폐왕궁 판갑',
  'red-tonic':'붉은 강장제','clearwater-vial':'맑은물 약병','coal-flask':'석탄 플라스크','spore-draught':'포자 드래프트','bone-salts':'뼛가루 소금','quick-silver':'퀵실버','prism-ink':'프리즘 잉크','antivenom':'습지 해독제','storm-bottle':'폭풍 병','ash-oil':'재 기름','clot-serum':'응고 혈청','gear-solvent':'기어 용제','rime-phial':'서리 약병','tide-pearl':'파도 진주','dream-milk':'꿈의 우유','star-sap':'별 수액',
  chalk:'측량용 분필','coil-rope':'감은 밧줄','rust-keyring':'녹슨 열쇠고리','spore-lantern':'포자 랜턴','bone-chime':'뼈 풍경','magnet-hook':'자석 갈고리','crystal-tuning-fork':'수정 소리굽쇠','fen-compass':'습지 나침반','storm-capacitor':'폭풍 축전기','ash-censer':'재 향로','nerve-thread':'신경 실','clockwork-wedge':'태엽 쐐기','ice-lens':'얼음 렌즈','drowned-mirror':'침수 거울','dream-key':'꿈의 열쇠','forge-tongs':'별대장간 집게',
  'root-crown':'뿌리 왕관','aqueduct-seal':'수로의 인장','black-coal-heart':'검은 석탄 심장','king-spore':'왕의 포자','ivory-ledger':'상아 장부','iron-warrant':'철의 영장','prism-heart':'프리즘 심장','fen-idol':'습지 우상','thunder-index':'천둥 색인','cinder-halo':'잿불 후광','living-rosary':'살아있는 묵주','last-gear':'마지막 기어','north-star-lens':'북극성 렌즈','sunken-diadem':'침몰한 관','void-seed':'공허 씨앗','broken-crown':'부서진 왕관','oneiric-shackle':'몽환의 족쇄','star-forge-spark':'별대장간 불꽃',
  'hook-spear':'갈고리 창','serrated-cleaver':'톱니 식칼','storm-pike':'폭풍 장창','grave-mace':'묘지 철퇴','fen-lance':'습지 랜스','mirror-sabre':'거울 사브르','cinder-axe':'잿불 도끼','void-pike':'공허 장창','execution-chain':'처형 사슬','star-needle':'별바늘',
  'reed-cloak':'갈대 망토','barbed-hide':'가시 가죽갑','storm-weave':'폭풍 직조복','cinder-scale':'잿불 비늘갑','mirror-mail':'거울 사슬갑','void-silk':'공허 비단','glacier-plate':'빙하 판갑','forge-bastion':'대장간 요새갑',
  'murky-restorative':'탁한 회복약','bitter-restorative':'쓴 회복약','smoking-vial':'연기 나는 약병','silver-vial':'은빛 약병','black-vial':'검은 약병','violet-vial':'보랏빛 약병','caustic-vial':'부식성 약병','blood-vial':'피빛 약병','white-vial':'흰 약병','gold-vial':'금빛 약병','smoke-ampoule':'연막 앰풀','ward-ampoule':'수호 앰풀',
  'etched-map':'새김 지도','red-glyph-strip':'붉은 문자 두루마리','blue-glyph-strip':'푸른 문자 두루마리','green-glyph-strip':'초록 문자 두루마리','ashen-glyph-strip':'재빛 문자 두루마리','mirror-glyph-strip':'거울 문자 두루마리','void-glyph-strip':'공허 문자 두루마리','binding-glyph-strip':'속박 문자 두루마리','signal-flare':'신호탄','phase-hook':'위상 갈고리','ward-stone':'수호석','war-drum':'전쟁 북','cold-mirror':'냉기 거울','spore-jar':'포자 단지','grave-whistle':'묘지 피리','prism-lure':'프리즘 미끼',
  'ring-of-pressure':'압력의 반지','mirror-eye':'거울 눈','fen-heart':'습지 심장','ember-lung':'잿불 허파','storm-knot':'폭풍 매듭','frozen-second':'얼어붙은 1초','void-anchor':'공허 닻','crown-of-thorns':'가시 왕관'
};

export function localizedItemBaseName(def:ItemDefinition,locale:Locale):string{return locale==='ko'?ITEM_KO[def.id]??def.name:def.name;}
export function localizedItemName(state:Pick<GameState,'runSeed'|'identifiedItemDefs'>,def:ItemDefinition,locale:Locale):string{
  if(locale==='en')return displayItemName(state,def);
  if(isMysteryItem(def)&&!state.identifiedItemDefs.includes(def.id))return def.tags.includes('scroll')?'미확인 문자 두루마리':'미확인 약병';
  return localizedItemBaseName(def,locale);
}

const STATUS_KO:Record<string,string>={poisoned:'중독',burning:'화상',chilled:'냉기',slowed:'둔화',dazed:'멍함',confused:'혼란',pinned:'속박',blinded:'실명',unmoored:'불안정',armor:'방어', 'armor-break':'방어 파괴',guarding:'방어 태세',hasted:'가속','fire-brand':'화염 부여','water-step':'수상 보행','spore-ward':'포자 저항','beam-ward':'광선 저항','poison-ward':'독 저항','fire-ward':'화염 저항','cold-ward':'냉기 저항','spore-sight':'포자 시야',antivenom:'해독',lucid:'명료함',focused:'집중',bleeding:'출혈',berserk:'광폭화',marked:'표식',stasis:'정지'};
const DAMAGE_KO:Record<string,string>={physical:'물리',fire:'화염',cold:'냉기',shock:'전격',poison:'독',void:'공허'};
export function effectText(effect:EffectSpec,locale:Locale):string{
  if(locale==='en'){
    if(effect.op==='damage')return `${effect.amount} ${effect.damageType??'physical'} damage`;
    if(effect.op==='heal')return `Heal ${effect.amount} HP`;
    if(effect.op==='status')return `${effect.id.replaceAll('-',' ')} · ${effect.duration} turns${effect.magnitude?` ×${effect.magnitude}`:''}`;
    if(effect.op==='push')return `Push ${effect.distance}`;
    if(effect.op==='teleport')return `Teleport within ${effect.radius}`;
    if(effect.op==='reveal')return `Reveal radius ${effect.radius}`;
    if(effect.op==='spawn-terrain')return `Create ${effect.tile} terrain · ${effect.duration??4} turns`;
    if(effect.op==='summon')return `Summon ${effect.count} ${effect.tag}`;
    if(effect.op==='nutrition')return `Restore ${effect.amount} nutrition`;
    return `Recover ${effect.amount} ammunition`;
  }
  if(effect.op==='damage')return `${DAMAGE_KO[effect.damageType??'physical']??effect.damageType??'물리'} 피해 ${effect.amount}`;
  if(effect.op==='heal')return `HP ${effect.amount} 회복`;
  if(effect.op==='status')return `${STATUS_KO[effect.id]??effect.id} · ${effect.duration}턴${effect.magnitude?` ×${effect.magnitude}`:''}`;
  if(effect.op==='push')return `${effect.distance}칸 밀쳐냄`;
  if(effect.op==='teleport')return `반경 ${effect.radius} 내 순간이동`;
  if(effect.op==='reveal')return `반경 ${effect.radius} 지도 공개`;
  if(effect.op==='spawn-terrain')return `${effect.tile} 지형 생성 · ${effect.duration??4}턴`;
  if(effect.op==='summon')return `${effect.tag} 계열 ${effect.count}체 소환`;
  if(effect.op==='nutrition')return `포만도 ${effect.amount} 회복`;
  return `탄약 ${effect.amount} 회수`;
}

export function itemTooltip(state:Pick<GameState,'runSeed'|'identifiedItemDefs'>,def:ItemDefinition,locale:Locale):{name:string;category:string;rarity:string;effects:string[];tags:string[];unknown:boolean}{
  const unknown=isMysteryItem(def)&&!state.identifiedItemDefs.includes(def.id);
  return {name:localizedItemName(state,def,locale),category:categoryName(def.category,locale),rarity:'★'.repeat(Math.max(1,Math.min(5,def.rarity))),effects:unknown?[locale==='ko'?'사용하거나 감정하기 전에는 효과를 알 수 없다.':'Its effect is unknown until used or identified.']:def.effects.map((effect)=>effectText(effect,locale)),tags:def.tags.map((tag)=>locale==='ko'?(DAMAGE_KO[tag.replace('resist:','')]?tag.startsWith('resist:')?`${DAMAGE_KO[tag.slice(7)]} 저항`:tag:DAMAGE_KO[tag]??tag):tag),unknown};
}

const STORY_KO:Record<string,{title:string;body:string}>={
  'roots-end':{title:'첫 번째 기반층',body:'오래된 기반 구조는 여기서 끝난다. 그 아래의 건축은 전혀 다른 시대를 위해 세워졌다.'},
  'second-bell':{title:'돌 아래의 종소리',body:'훨씬 아래에서 종이 한 번 울린다. 이 깊이에는 저런 소리를 낼 만큼 거대한 것이 없어야 한다.'},
  'ash-line':{title:'재의 경계선',body:'그을음이 세계를 완벽하게 수평으로 가른다. 그 아래의 모든 것은 불탈 곳조차 없는 화재를 버텼다.'},
  'sky-underneath':{title:'아래쪽의 하늘',body:'불가능한 한순간, 바닥의 균열 너머로 별이 가득한 하늘이 보인다.'},
  'crown-fall':{title:'추락한 왕관',body:'왕국보다 수 세기 오래된 문들에 왕가의 표식이 나타나기 시작한다.'},
  'last-foundation':{title:'마지막 기반층',body:'세계에는 더 이상 기반 구조가 남지 않았다. 무언가가 남은 깊이를 억지로 붙들고 있다.'},
  'enter-abyss':{title:'심연',body:'세계의 옆면은 더 이상 장소인 척하지 않는다. 돌아가는 길은 이제 보장되지 않는다.'}
};
export function localizedStory(event:StoryEvent,locale:Locale):StoryEvent{
  if(locale==='en')return event;
  if(event.id.startsWith('theme:')){
    const id=event.id.slice(6);return {...event,title:(THEME_KO[id]??event.title),body:`새로운 지역의 규칙과 생태가 완전히 자리잡았다. ${event.body}`};
  }
  const translated=STORY_KO[event.id];return translated?{...event,...translated}:event;
}

function replaceKnownItemNames(text:string):string{
  let out=text;
  for(const [id,ko] of Object.entries(ITEM_KO)){
    const en=id.split('-').map((part)=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ');
    out=out.replace(en,ko);
  }
  return out;
}
export function localizeMessage(message:string,locale:Locale):string{
  if(locale==='en')return message;
  let m=replaceKnownItemNames(message);
  if(m==='You descend beneath the cistern.')return '저수조 아래로 내려간다.';
  if(m==='You descend.')return '더 아래로 내려간다.';
  if(m==='You take the western descent.')return '서쪽으로 치우친 하강로를 택한다.';
  if(m==='You take the eastern descent.')return '동쪽으로 치우친 하강로를 택한다.';
  if(m==='You brace and search the nearby stonework.')return '방어 태세를 취하며 주변 구조물을 살핀다.';
  if(m==='You brace for the next exchange.')return '다음 공격에 대비해 방어 태세를 취한다.';
  if(m==='You carefully search nearby terrain.')return '주변 지형을 주의 깊게 수색한다.';
  if(m==='You are getting hungry.')return '배가 고파지기 시작한다.';
  if(m==='Hunger is making you weak.')return '허기로 몸에 힘이 빠진다.';
  if(m==='You are starving.')return '굶주리고 있다.';
  if(m==='You need a ranged weapon ready.')return '원거리 무기를 장착해야 한다.';
  if(m==='You are out of ammunition.')return '탄약이 없다.';
  if(m==='There is no visible target in range.')return '사거리 안에 보이는 대상이 없다.';
  if(m==='Enemies are too close to rest.')return '적이 너무 가까워 쉴 수 없다.';
  if(m==='You are already fully rested.')return '이미 체력이 가득하다.';
  if(m==='You die beneath the world.')return '세계 아래에서 죽었다.';
  const patterns:Array<[RegExp,(x:RegExpMatchArray)=>string]>=[
    [/^You pick up (.+)\.$/,(x)=>`${x[1]}을(를) 주웠다.`],[/^You drop (.+)\.$/,(x)=>`${x[1]}을(를) 버렸다.`],[/^You use (.+)\.$/,(x)=>`${x[1]}을(를) 사용했다.`],[/^You activate (.+)\.$/,(x)=>`${x[1]}을(를) 작동시켰다.`],[/^You ready (.+)\.$/,(x)=>`${x[1]}을(를) 장착했다.`],[/^You wear (.+)\.$/,(x)=>`${x[1]}을(를) 착용했다.`],[/^You remove (.+)\.$/,(x)=>`${x[1]}을(를) 벗었다.`],[/^(.+) dies\.$/,(x)=>`${x[1]}이(가) 죽었다.`],[/^You hit (.+) for (\d+) (.+)\.$/,(x)=>`${x[1]}에게 ${x[2]} ${DAMAGE_KO[x[3]??'']??x[3]} 피해를 입혔다.`],[/^(.+) hits you for (\d+)\.$/,(x)=>`${x[1]}에게 ${x[2]} 피해를 받았다.`],[/^The spring restores (\d+) HP\.$/,(x)=>`샘이 HP를 ${x[1]} 회복시켰다.`],[/^You notice a (.+)\.$/,(x)=>`${x[1]}의 흔적을 발견했다.`],[/^You discover a (.+)!$/,(x)=>`${x[1]}을(를) 발견했다!`],[/^You identify it as (.+)\.$/,(x)=>`정체는 ${x[1]}이었다.`],[/^You buy (.+) for (\d+) gold\.$/,(x)=>`${x[1]}을(를) ${x[2]}골드에 샀다.`],[/^You sell (.+) for (\d+) gold\.$/,(x)=>`${x[1]}을(를) ${x[2]}골드에 팔았다.`],[/^You enter (.+)\.$/,(x)=>`${x[1]}에 들어섰다.`],[/^Your pack cannot carry (.+?)(?:; it falls at your feet)?\.$/,(x)=>`짐이 너무 무거워 ${x[1]}을(를) 들 수 없다.`]
  ];
  for(const [regex,fn] of patterns){const match=m.match(regex);if(match)return fn(match);}
  const exact:Record<string,string>={'A snare rune locks your feet.':'속박 룬이 발을 붙잡았다.','Space folds and throws you elsewhere.':'공간이 접히며 다른 곳으로 튕겨 나간다.','The rune calls hunters into the level.':'룬이 이 층의 사냥꾼들을 불러낸다.','The altar sharpens your senses and hardens your stance.':'제단의 힘이 감각을 날카롭게 하고 자세를 단단하게 만든다.','You crack the cache and recover two objects.':'보관함을 열어 물건 두 개를 건졌다.'};
  return exact[m]??m;
}
