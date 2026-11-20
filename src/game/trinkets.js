/* ===== 유물·장신구 접사 엔진 + 랜다트 =====
   Relics and trinkets carry flat trait fields (stats, `resist`, specials). Fixed catalog items and
   randarts share the same fields, so every hook below reads one shape. Resistance itself is owned by
   elements.js (gearResistLevel); this file owns the specials, the randart roller and the charm icons. */
const CHARM_GLYPH={fire:'火',water:'水',ice:'氷',shock:'雷',earth:'土',grass:'木',holy:'聖'};
const CHARM_GEM={fire:'#d9623a',water:'#3fa3cc',ice:'#9fd0e6',shock:'#e2bd3c',earth:'#b98b4e',grass:'#58b25e',holy:'#f0dc9a',
  ruby:'#c33a4a',sapphire:'#3f6fc4',emerald:'#2f9e6c',topaz:'#e0b040',amethyst:'#9a63c8',pearl:'#efe7dc',onyx:'#34303c',turquoise:'#35b5b0'};
const CHARM_JEWELS=['ruby','sapphire','emerald','topaz','amethyst','pearl','onyx','turquoise'];
const CHARM_CORDS={crimson:'#a83240',indigo:'#3a4f9a',saffron:'#d19a30',forest:'#3f7a52',violet:'#7a52a0',teal:'#2f8a8a',ivory:'#e0d6b8',black:'#352d3a'};
const CHARM_MATERIALS={
  jade:{name:'비취',c1:'#58b08f',c2:'#1f5a49'},celadon:{name:'청자',c1:'#9cc8b0',c2:'#35604f'},gold:{name:'황금',c1:'#e0b64a',c2:'#6e5018'},
  rosegold:{name:'홍금',c1:'#d99a82',c2:'#6a3426'},silver:{name:'백은',c1:'#c9d3d8',c2:'#525e66'},bronze:{name:'청동',c1:'#b07440',c2:'#4a2c17'},
  copper:{name:'적동',c1:'#c8643a',c2:'#53230f'},ebony:{name:'흑단',c1:'#5e4a66',c2:'#1d1522'},ruby:{name:'적옥',c1:'#c04840',c2:'#541814'},
  coral:{name:'산호',c1:'#e07a68',c2:'#722a24'},azure:{name:'청금석',c1:'#4f86c2',c2:'#1c3a64'},lapis:{name:'감청',c1:'#3a58a0',c2:'#141f48'},
  amber:{name:'호박',c1:'#dc9a34',c2:'#6a3e0c'},amethyst:{name:'자수정',c1:'#9068b4',c2:'#3a2258'},pearl:{name:'진주',c1:'#ece3d4',c2:'#756a5c'},
  turquoise:{name:'옥청',c1:'#3fb4b0',c2:'#134c4c'},obsidian:{name:'흑요석',c1:'#46465a',c2:'#12121c'}
};
const CHARM_ELEM_MATERIAL={fire:['ruby','copper','coral','amber'],water:['azure','turquoise','lapis'],ice:['silver','pearl','celadon','azure'],shock:['gold','amethyst','obsidian'],earth:['amber','bronze','ebony','rosegold'],grass:['jade','celadon','ebony'],holy:['silver','gold','pearl','rosegold']};
const CHARM_ELEM_PREFIX={fire:'염화',water:'청류',ice:'한빙',shock:'뇌명',earth:'암맥',grass:'녹음',holy:'성광'};
// Designs come in three grades: plain ones are common, fine ones carry a soft halo, grand ones are intricate and glow. Better gear tends to the better designs.
const CHARM_SHAPE_GRADE={ring:'simple',beads:'simple',bracelet:'simple',seal:'simple',coins:'simple',hairpin:'simple',gourd:'simple',plaque:'fine',mirror:'fine',norigae:'fine',bell:'fine',fan:'fine',crescent:'grand',crown:'grand',butterfly:'grand',phoenix:'grand',orb:'grand',lotus:'grand'};
const CHARM_SHAPES_BY_SLOT={relic:['ring','beads','bracelet','seal','plaque','mirror','crescent','crown'],trinket:['coins','hairpin','gourd','norigae','bell','fan','butterfly','phoenix']};
function charmPickShape(slot,score,rnd){
  const pool=CHARM_SHAPES_BY_SLOT[slot],by=g=>pool.filter(x=>CHARM_SHAPE_GRADE[x]===g),r=rnd();
  const grand=Math.max(0,Math.min(.5,(score-6)*.12)),fine=Math.max(.1,Math.min(.6,.2+(score-3)*.1));
  const list=r<grand?by('grand'):r<grand+fine?by('fine'):by('simple');
  return list[Math.floor(rnd()*list.length)];
}
const CHARM_SHAPE_NAME={ring:'반지',beads:'염주',plaque:'옥패',mirror:'거울',seal:'인장',bracelet:'팔찌',norigae:'노리개',bell:'방울',gourd:'호리병',coins:'엽전 꿰미',fan:'부채',hairpin:'비녀',orb:'보주',lotus:'연화',crescent:'월패',crown:'관식',butterfly:'나비 노리개',phoenix:'봉황 비녀'};
const CHARM_FLAVOR={ring:'손가락에 맞춰 두면 은은한 기운이 돈다.',beads:'한 알씩 굴릴 때마다 호흡이 가라앉는다.',plaque:'뒷면에 닳은 주문이 새겨진 패.',mirror:'비추는 쪽의 기운을 되받는 작은 거울.',seal:'찍는 자의 뜻을 새기는 작은 도장.',bracelet:'팔목을 감싸는 얇은 고리.',norigae:'매듭마다 소원이 묶인 노리개.',bell:'소리가 닿는 곳까지 액을 쫓는다.',gourd:'마개를 열면 어디선가 약초 냄새가 난다.',coins:'꿰미째 들면 쨍그랑 소리가 난다.',fan:'펼칠 때마다 바람의 결이 달라진다.',hairpin:'머리에 꽂아 두는 가는 장식.',orb:'쥐고 있으면 손바닥이 따뜻해지는 구슬.',lotus:'꽃잎이 한 겹씩 천천히 열린다.',crescent:'달이 기울 때마다 빛의 결이 바뀌는 패.',crown:'작지만 무게가 있는 금빛 관 장식.',butterfly:'날개를 접었다 폈다 하는 듯한 노리개.',phoenix:'꼬리깃이 불빛에 따라 색을 바꾸는 비녀.'};
const CHARM_PREFIX_SPECIAL={regenEvery:'생명',killHeal:'피빛',killFocus:'기맥',thorns:'가시',lowHpAtk:'배수',lowHpDef:'결사',critAdd:'쾌검',moveMul:'신속',atkCostMul:'속공',statusGuard:'불침',strike:'격발',atk:'맹호',def:'철벽',eva:'그림자',will:'명경',vision:'천리',focus:'기맥'};
// Gear quirks. `w` is the pick weight: the five older ones are common, the newer ones deliberately rare so a drop never reads as a pile of effects.
const CHARM_QUIRKS={
  chainBurst:{name:'연쇄 폭죽',desc:'격파 시 인접한 적에게 화염 3',prefix:'폭죽',w:1,fx:'#ff9a5a'},
  luckyMend:{name:'요행',desc:'적의 공격이 닿기 직전 12% 확률로 한 칸 물러선다. 물러선 자리까지 공격이 닿지 않으면 빗나간다(위험한 칸으로는 물러서지 않음)',prefix:'요행',w:1,fx:'#f3dc8e'},
  lastStand:{name:'불굴',desc:'층마다 한 번, HP 20% 이하가 되면 HP 30% 회복',prefix:'불굴',w:1,fx:'#ffe9a8'},
  feast:{name:'탐식',desc:'격파 시 8% 확률로 말린 육포를 떨어뜨림',prefix:'탐식',w:1,fx:'#e2b977'},
  frostWard:{name:'서리 방벽',desc:'근접 피격 시 15% 확률로 공격자 기절 1턴',prefix:'서리',w:1,fx:'#a6e6f2'},
  echo:{name:'메아리',desc:'같은 적을 연속으로 때리면 타격마다 추가 피해 +1(최대 +5)',prefix:'메아리',w:.3,fx:'#c9d8ff'},
  shadowStep:{name:'그림자 걸음',desc:'5칸 연속 이동하면 다음 공격이 2배 피해',prefix:'그림자',w:.3,fx:'#b79cdd'},
  backlash:{name:'역류',desc:'상태이상에 걸리면 20% 확률로 가까운 적에게 같은 상태이상이 옮겨감',prefix:'역류',w:.3,fx:'#c78fe0'},
  treasureSense:{name:'도굴꾼',desc:'새 층에 들어서면 주변 14칸 안 바닥 아이템 위치가 드러남',prefix:'도굴',w:.3,fx:'#f0d27a'},
  fullMoon:{name:'만월',desc:'6턴마다 충전, 다음 격파 때 HP 4와 기력 2를 회복',prefix:'만월',w:.3,fx:'#dfe8ff'},
  hungerSwap:{name:'허기 전환',desc:'허기가 낮을수록 공격 +1~3(허기 70 미만부터)',prefix:'허기',w:.3,fx:'#e8a05a'},
  fireKnot:{name:'폭죽 매듭',desc:'적을 처음 발견하면 그 적이 화염에 휩싸임(10턴에 한 번)',prefix:'매듭',w:.3,fx:'#ff8a4a'},
  twins:{name:'쌍둥이',desc:'비약·부적을 쓸 때 10% 확률로 소모되지 않음',prefix:'쌍둥이',w:.3,fx:'#f6e7a6'},
  ghostStep:{name:'유령 걸음',desc:'피격 후 1턴 동안 이동 비용 -30%',prefix:'유령',w:.3,fx:'#b9c6d8'},
  airPurify:{name:'공기정화',desc:'가스에 처음 노출되는 턴의 효과를 확정으로 무시',prefix:'정화',w:.3,fx:'#bfeedd'},
  frostStep:{name:'차가운 걸음',desc:'걸을 때마다 인접 칸이 얼어붙음(물은 얼음이 됨)',prefix:'냉보',w:.3,fx:'#9fe3f2'}
};
function charmPickQuirk(rnd,premium=false){
  // Premium pieces lean the other way: the newer, rarer effects are the ones they are made to carry.
  const weight=q=>premium?(q.w<1?1.5:.4):q.w,keys=Object.keys(CHARM_QUIRKS),total=keys.reduce((n,key)=>n+weight(CHARM_QUIRKS[key]),0);let r=rnd()*total;
  for(const key of keys){r-=weight(CHARM_QUIRKS[key]);if(r<=0)return key}return keys[0];
}
const CHARM_PREMIUM_PREFIX=['천면','명경','청명','월광','운무'];
const CHARM_STATS=['atk','def','eva','will','vision','focus'];
const CHARM_STAT_LABEL={focus:'기력'};

function charmPct(v){return Math.round(v*100)}
function charmGear(){const p=state?.player;return[p?.relic,p?.trinket].filter(Boolean)}
function charmSum(key){let n=0;for(const g of charmGear())n+=Number(g[key])||0;return n}
function charmMul(key){let n=1;for(const g of charmGear())if(Number.isFinite(g[key]))n*=g[key];return n}
function charmBest(key){let n=0;for(const g of charmGear()){const v=Number(g[key])||0;if(v>0&&(!n||v<n))n=v}return n}

/* ---- trait text: shared by item details, randart flavor and the codex ---- */
function resistChipText(element,level){return`${RESIST_NAMES57[element]||element} ${level<0?'취약':'저항'} ${level<0?'Ⅰ':'Ⅰ Ⅱ Ⅲ Ⅳ'.split(' ')[Math.min(4,level)-1]}`}
function charmTraitLines(item){
  const out=[];if(!item)return out;
  if(item.focus)out.push(`기력 ${item.focus>0?'+':''}${item.focus}`);
  for(const[el,lv]of Object.entries(item.resist||{}))if(lv)out.push(resistChipText(el,lv));
  if(item.bagSlots)out.push(`인벤토리 +${item.bagSlots}칸`);
  if(item.regenEvery)out.push(`${item.regenEvery}턴마다 HP +1`);
  if(item.killHeal)out.push(`격파 시 HP +${item.killHeal}`);
  if(item.killFocus)out.push(`격파 시 기력 +${item.killFocus}`);
  if(item.thorns)out.push(`근접 피격 시 반격 ${item.thorns}`);
  if(item.lowHpAtk)out.push(`HP 40% 이하 ATK +${item.lowHpAtk}`);
  if(item.lowHpDef)out.push(`HP 40% 이하 DEF +${item.lowHpDef}`);
  if(item.critAdd)out.push(`치명 +${charmPct(item.critAdd)}%`);
  if(item.moveMul)out.push(`이동 비용 ${item.moveMul<1?'-':'+'}${Math.abs(charmPct(1-item.moveMul))}%`);
  if(item.atkCostMul)out.push(`공격 비용 ${item.atkCostMul<1?'-':'+'}${Math.abs(charmPct(1-item.atkCostMul))}%`);
  if(item.statusGuard)out.push(`상태이상 ${charmPct(item.statusGuard)}% 무효`);
  if(item.quirk&&CHARM_QUIRKS[item.quirk])out.push(`✦ ${CHARM_QUIRKS[item.quirk].name}: ${CHARM_QUIRKS[item.quirk].desc}`);
  if(item.strike)out.push(`타격 시 ${RESIST_NAMES57[item.strike.element]||item.strike.element} 피해 +${item.strike.dmg}`);
  if(item.bane&&CHARM_BANES[item.bane])out.push(`✖ ${CHARM_BANES[item.bane].name}: ${CHARM_BANES[item.bane].desc}`);
  return out;
}

/* ---- effects shown on screen: every quirk and curse that fires uses the game's own impact / burst / bell / flash / float text ---- */
function charmFx(x,y,label,color,power=1){
  impact(x,y,color,3+power*2);burst(x,y,color,10+power*6,.6+power*.25);
  if(power>=2)burst(x,y,'#fff6dc',8,.9,90);
  if(power>=3){flash(color,120);bellFX(x,y,3+power,color)}
  if(label)floatText(x,y,label,color,power>=2?12:10);
}
function charmQuirkFx(id,x,y,power=1,label=null){const q=CHARM_QUIRKS[id];charmFx(x,y,label??q.name,q.fx,power)}

/* ---- hooks (one per pipeline; each reads the same trait fields) ---- */
function charmQuirkOn(id){return charmGear().some(g=>g.quirk===id)}
function charmStats(s){
  const p=state?.player;if(!p)return s;
  s.critBonus=(s.critBonus||0)+charmSum('critAdd');
  if(p.hp<=p.maxHp*.4){s.atk+=charmSum('lowHpAtk');s.def+=charmSum('lowHpDef')}
  if(charmQuirkOn('hungerSwap')&&Number.isFinite(p.hunger)&&p.hunger<70)s.atk+=Math.min(3,1+Math.floor((70-p.hunger)/20));
  return s;
}
function charmMoveCost(c){
  const p=state?.player;let m=charmMul('moveMul');
  if(p&&charmQuirkOn('ghostStep')&&state.turn<=(p.charmGhostUntil??-1))m*=.7;
  return c*m;
}
function charmAttackCost(c){return c*charmMul('atkCostMul')}
function charmPostTurn(){
  const p=state?.player;if(!p||state.dead||state.victory)return;
  baneTick();baneMirrorTick();
  const every=charmBest('regenEvery');if(every&&state.turn%every===0&&p.hp<p.maxHp)recoverCombatHealth(p,1);
  const moved=p.charmLast&&(p.charmLast.x!==p.x||p.charmLast.y!==p.y);p.charmLast={x:p.x,y:p.y};
  if(charmQuirkOn('shadowStep')){
    p.charmStreak=moved?(p.charmStreak||0)+1:0;
    if(p.charmStreak>=5&&!p.charmShadowReady){p.charmShadowReady=true;charmQuirkFx('shadowStep',p.x,p.y,2,'그림자')}
  }
  if(charmQuirkOn('fullMoon')){
    p.charmMoon=(p.charmMoon||0)+1;
    if(p.charmMoon>=6&&!p.charmMoonReady){p.charmMoonReady=true;charmQuirkFx('fullMoon',p.x,p.y,2,'만월 충전')}
  }
  if(charmQuirkOn('frostStep')&&moved){
    const cells=elementCells105(p.x,p.y,1).filter(c=>c.x!==p.x||c.y!==p.y);
    emitElementContact105('ice',cells,effectSource57(p),{baseDamage:0});
    for(const c of cells)if(globalThis.__MANRU_RANDOM57__()<.5)burst(c.x,c.y,CHARM_QUIRKS.frostStep.fx,4,.4);
  }
  if(charmQuirkOn('treasureSense')&&p.charmFloor!==state.floor){
    p.charmFloor=state.floor;let n=0;
    for(const it of state.items||[])if(entityDistance57(it,p)<=14&&!state.seen.has(k(it.x,it.y))){state.seen.add(k(it.x,it.y));if(n++<10)charmFx(it.x,it.y,null,CHARM_QUIRKS.treasureSense.fx,1)}
    if(n){charmQuirkFx('treasureSense',p.x,p.y,2,`보물 ${n}`);addLog(`도굴꾼의 감각이 바닥의 물건 ${n}개를 짚어냈다.`)}
  }else if(p.charmFloor==null)p.charmFloor=state.floor;
  if(charmQuirkOn('fireKnot')){
    const fresh=state.monsters.filter(m=>m.hp>0&&!m.charmKnot&&state.visible.has(k(m.x,m.y))&&entitiesHostile57(p,m));
    for(const m of fresh)m.charmKnot=true;
    if(fresh.length&&state.turn>=(p.charmKnotCd??0)){
      p.charmKnotCd=state.turn+10;const m=fresh[0];
      charmQuirkFx('fireKnot',m.x,m.y,2,'폭죽 매듭');
      resolveElementDamage57(m,'fire',4+Math.floor(state.floor/5),{effect:effectSource57(p),source:'폭죽 매듭',color:CHARM_QUIRKS.fireKnot.fx});
    }
  }
}
function charmOnKill(mon){
  const p=state?.player;if(!p||p.hp<=0||mon?.lastDamageOpponent57!=='player')return;
  const heal=charmSum('killHeal'),focus=charmSum('killFocus');
  for(const g of charmGear()){
    if(g.quirk==='chainBurst'){
      let hit=false;
      for(const n of [...state.monsters])if(n!==mon&&n.hp>0&&entityDistance57(n,mon)<=1&&factionsHostile57(entityFaction(p),entityFaction(n))){resolveElementDamage57(n,'fire',3,{effect:effectSource57(p),source:g.name,color:CHARM_QUIRKS.chainBurst.fx});hit=true}
      if(hit)charmQuirkFx('chainBurst',mon.x,mon.y,2)
    }
    if(g.quirk==='feast'&&globalThis.__MANRU_RANDOM57__()<.08){const food=foodDef('말린 육포');if(food){PlacementService.placeItem({...clone(food),count:1},{x:mon.x,y:mon.y});charmQuirkFx('feast',mon.x,mon.y,1)}}
    if(g.quirk==='fullMoon'&&p.charmMoonReady){
      p.charmMoonReady=false;p.charmMoon=0;recoverCombatHealth(p,4);if(Number.isFinite(p.focus))p.focus=Math.min(getStats().maxFocus,p.focus+2);
      charmQuirkFx('fullMoon',p.x,p.y,3,'만월');
    }
  }
  if(heal>0&&p.hp<p.maxHp){const g=recoverCombatHealth(p,heal);if(g>0)floatText(p.x,p.y,`+${g}`,'#e08a7a',9)}
  if(focus>0&&Number.isFinite(p.focus))p.focus=Math.min(getStats().maxFocus,p.focus+focus);
  baneOnKill(mon);
}
// 요행: as a monster's direct blow is about to land, the wearer sometimes stumbles one step back from the attacker. If the blow
// can no longer reach from there it misses; if it still reaches it lands as usual. Area blasts and hazards are not dodged
// this way, and the step is never taken onto a door, trap, liquid, void, a burning or gassed cell, or a cell an enemy has marked.
function charmLuckyStep(mon,target,ctx){
  const p=state?.player;if(!p||target!==p||!mon||!charmQuirkOn('luckyMend')||['area','hazard'].includes(ctx.delivery))return false;
  if(globalThis.__MANRU_RANDOM57__()>=.12)return false;
  const sx=Math.sign(p.x-mon.x),sy=Math.sign(p.y-mon.y),marked=new Set();
  for(const m of state.monsters||[])for(const c of m.intent61?.cells||[])marked.add(k(c.x,c.y));
  const hazard=(x,y)=>marked.has(k(x,y))||(state.tempFields||[]).some(f=>f.ttl>0&&f.kind!=='smoke'&&(f.cells||[f]).some(c=>c.x===x&&c.y===y));
  const steps=[[sx,sy],[sx,0],[0,sy]].filter(([a,b])=>a||b).filter((v,i,a)=>a.findIndex(w=>w[0]===v[0]&&w[1]===v[1])===i);
  for(const[a,b]of steps){
    const x=p.x+a,y=p.y+b;if(!playerTransferLandingSafe57(x,y)||hazard(x,y))continue;
    if(!resolvePlayerLanding57(x,y,{cause:'lucky-step',resetVisual:true}).moved)continue;
    const reaches=ctx.delivery==='melee'?entityDistance57(mon,p)<=(mon.reach||1):monsterAttackLineR(mon,ctx.range,{...ctx,target:p}).ok;
    charmQuirkFx('luckyMend',p.x,p.y,2,reaches?'요행 · 물러섬':'요행 · 빗나감');
    return{moved:true,dodged:!reaches};
  }
  return false;
}
function charmOnHurt(source,amount){
  const p=state?.player;if(!p||amount<=0)return;
  for(const g of charmGear()){
    if(g.quirk==='lastStand'&&p.hp>0&&p.hp<=p.maxHp*.2&&p.lastStandFloor!==state.floor){p.lastStandFloor=state.floor;recoverCombatHealth(p,Math.ceil(p.maxHp*.3));charmQuirkFx('lastStand',p.x,p.y,3);addLog(`${g.name}이 몸을 일으켜 세웠다.`)}
    if(g.quirk==='frostWard'&&source&&source!==p&&source.hp>0&&entityDistance57(source,p)<=1&&!source.boss&&globalThis.__MANRU_RANDOM57__()<.15){applyCombatStatus(source,'stun',1,1,{source:p,element:'ice',stagger:true});charmQuirkFx('frostWard',source.x,source.y,2)}
    if(g.quirk==='ghostStep'){p.charmGhostUntil=state.turn+1;charmQuirkFx('ghostStep',p.x,p.y,1)}
  }
  const thorns=charmSum('thorns');
  if(p&&thorns>0&&source&&source!==p&&source.hp>0&&entityDistance57(source,p)<=1&&factionsHostile57(entityFaction(p),entityFaction(source))){
    const dealt=damageEntity(source,thorns,p);if(dealt>0){floatText(source.x,source.y,`반격 -${dealt}`,'#d6b77d',9);if(source.hp<=0)killMonster(source)}
  }
  baneOnHurt(source,amount);
}
function charmStatusGuard(){
  const chance=Math.min(.75,charmSum('statusGuard'));
  if(chance>0&&globalThis.__MANRU_RANDOM57__()<chance){floatText(state.player.x,state.player.y,'불침','#b9d7cd',9);burst(state.player.x,state.player.y,'#b9d7cd',8,.5);return true}
  return false;
}
// A status landed on the player: 역류 may pass it on to the nearest enemy in sight.
function charmOnStatus(key,turns){
  const p=state?.player;if(!p||!charmQuirkOn('backlash')||globalThis.__MANRU_RANDOM57__()>=.2)return;
  const foes=state.monsters.filter(m=>m.hp>0&&state.visible.has(k(m.x,m.y))&&entitiesHostile57(p,m)&&entityDistance57(m,p)<=6).sort((a,b)=>entityDistance57(a,p)-entityDistance57(b,p));
  const m=foes[0];if(!m)return;
  projectileFX(p.x,p.y,m.x,m.y,CHARM_QUIRKS.backlash.fx);
  if(applyCombatStatus(m,key,turns,1,{source:p}))charmQuirkFx('backlash',m.x,m.y,2);
}
// Consuming a potion or talisman: 쌍둥이 sometimes spares it.
function charmSaveConsumable(item,quantity,container){
  const p=state?.player;
  if(!p||container!==p.inventory||quantity!==1||!['potion','talisman'].includes(item?.type)||!charmQuirkOn('twins')||globalThis.__MANRU_RANDOM57__()>=.1)return false;
  charmQuirkFx('twins',p.x,p.y,2);addLog(`${item.name}이(가) 쌍둥이처럼 하나 더 남았다.`);return true;
}
// Gas on the player: 공기정화 waves away the first turn of an exposure.
function charmGasFirstTurn(inGas){
  const p=state?.player;if(!p)return false;
  const wasIn=p.charmGasTurn===state.turn-1;if(inGas)p.charmGasTurn=state.turn;
  if(inGas&&!wasIn&&charmQuirkOn('airPurify')){charmQuirkFx('airPurify',p.x,p.y,2);return true}
  return false;
}
// A weapon hit lands: 메아리 builds on a repeated target, 그림자 걸음 cashes in its charge, and any `strike` element rides along.
function charmStrike(target,actor,damage=0){
  if(actor!==state?.player||!target||target.hp<=0)return;
  const p=actor;
  if(charmQuirkOn('echo')){
    p.charmEcho=p.charmEchoTarget===target?(p.charmEcho||0)+1:0;p.charmEchoTarget=target;
    if(p.charmEcho>0){const extra=Math.min(5,p.charmEcho);const dealt=damageEntity(target,extra,p);if(dealt>0){charmQuirkFx('echo',target.x,target.y,1,`메아리 +${dealt}`);if(target.hp<=0)killMonster(target)}}
  }
  if(target.hp>0&&p.charmShadowReady){
    p.charmShadowReady=false;p.charmStreak=0;const dealt=damageEntity(target,Math.max(2,damage),p);
    if(dealt>0){charmQuirkFx('shadowStep',target.x,target.y,3,`급습 -${dealt}`);if(target.hp<=0)killMonster(target)}
  }
  for(const g of charmGear())if(g.strike&&target.hp>0)resolveElementDamage57(target,g.strike.element,g.strike.dmg,{contactHandled105:true,effect:effectSource57(actor),source:g.name,color:CHARM_GEM[g.strike.element]});
}

/* ---- banes: a randart's negative trait. Not a curse: it is shown with the other traits from the start, works only while
   the piece is worn, comes off with it, and two pieces with the same bane double it. A bane taken on pays for more elsewhere
   (pts, see makeRandart). The periodic ones run on their own clock here, the rest from the hooks above. ---- */
const CHARM_BANES=Object.freeze({
  roar:{name:'굉음',desc:'14턴마다 맵 전체에 울릴 만큼 큰 소음을 낸다. 12칸 안의 적이 경계한다.',period:14,event:'roar',pts:2},
  summon:{name:'불러냄',desc:'100턴마다 이 층의 몬스터 한 마리가 내 곁에 불려 나온다. 이미 불려 나온 것이 살아 있으면 부르지 않는다.',period:100,event:'summon',pts:1},
  selfblast:{name:'자폭 천명탄',desc:'25턴마다, 또는 HP가 25% 아래로 떨어지면 내 자리에서 천명탄이 터져 5×5의 적과 나를 함께 맞힌다. 나는 죽지 않는다.',period:25,event:'selfblast',pts:3},
  wander:{name:'방랑',desc:'20턴마다 시야 안 아무 곳으로 순간이동한다.',period:20,event:'blink',pts:1},
  glutton:{name:'식탐귀',desc:'250턴마다 인벤토리의 음식 하나를 먹어 치운다. 음식이 없으면 HP 3를 잃는다.',period:250,event:'eatfood',pts:2},
  mirror_image:{name:'거울상',desc:'적을 쓰러뜨릴 때마다 그 적의 반영이 일어나 4턴 동안 나를 쫓는다.',pts:2},
  scream:{name:'비명',desc:'HP가 절반 아래일 때 맞으면 소음을 낸다(6턴에 한 번). 9칸 안의 적이 경계한다.',pts:1}
});
function baneCount(id){return charmGear().filter(g=>g.bane===id).length}
function banePower(id){const n=baneCount(id);return n>0?Math.pow(2,n-1):0}
function baneTick(){
  const p=state.player,clocks=p.baneClock||(p.baneClock={});
  for(const[id,b]of Object.entries(CHARM_BANES)){
    if(!b.period)continue;const power=banePower(id);
    if(!power){delete clocks[id];continue}
    if(clocks[id]==null){clocks[id]=state.turn+b.period;continue}
    if(state.turn<clocks[id])continue;clocks[id]=state.turn+b.period;runBaneEffect(b.event,p,power,b);
  }
}
function runBaneEffect(effect,actor,power,c){
  const p=state.player,mark=(label,color,pw)=>charmFx(p.x,p.y,label,color,pw);
  if(effect==='roar'){
    alertNearby(p.x,p.y,12+power*2,'explosion');bellFX(p.x,p.y,12,'#e0735f');flash('#e0735f',140);floatText(p.x,p.y,'굉음!','#ff9d80',14);addLog(`${c.name}: 장비가 맵 전체에 울려 퍼졌다.`);return true;
  }
  if(effect==='summon'){
    if(state.monsters.some(m=>m.hp>0&&m.curseSummon991))return false;
    const m=spawnMonster({x:p.x,y:p.y},false,{provenance:'curse'});if(!m)return false;m.curseSummon991=true;m.alerted=true;
    charmFx(m.x,m.y,'불러냄',CURSE_FX.summon,2);addLog(`${c.name}: 어둠 속에서 ${m.name}이(가) 불려 나왔다.`);return true;
  }
  if(effect==='selfblast'){baneSelfBlast(p,power,c);return true}
  if(effect==='blink'){
    const cells=[];for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){const x=p.x+dx,y=p.y+dy;if((dx||dy)&&state.visible.has(k(x,y))&&ReachabilityService.playerPassable(x,y)&&!OccupancyService.isOccupied(x,y)&&playerTransferLandingSafe57(x,y))cells.push({x,y})}
    if(!cells.length)return false;const to=choice(cells);mark(null,CURSE_FX.blink,1);
    if(resolvePlayerLanding57(to.x,to.y,{cause:'blink',resetVisual:true}).moved){charmFx(to.x,to.y,'방랑',CURSE_FX.blink,2);addLog(`${c.name}: 발밑이 흔들리더니 낯선 곳에 서 있었다.`);return true}
    return false;
  }
  if(effect==='eatfood'){
    const foods=p.inventory.filter(i=>i.type==='food');
    if(foods.length){const f=choice(foods);consumeItemQuantity(f,1);mark('식탐귀',CURSE_FX.glutton,2);addLog(`${c.name}: 장비가 ${f.name}을(를) 게걸스럽게 먹어 치웠다.`)}
    else{const dealt=damageEntity(p,3);if(dealt>0)mark(`식탐귀 -${dealt}`,CURSE_FX.glutton,2);addLog(`${c.name}: 먹을 것이 없자 장비가 몸을 물어뜯었다.`)}
    return true;
  }
  return false;
}
const CURSE_FX={roar:'#e0735f',summon:'#9b6fc8',selfblast:'#a9b6ff',blink:'#8fd0e0',glutton:'#c9805a',mirror:'#c8bcff',scream:'#e6a0a0'};
function baneSelfBlast(p,power,c){
  const cells=elementCells105(p.x,p.y,2),effect=effectSource57(null,{sourceFaction:'player',owner:'player',credit:null}),base=8+Math.floor(state.floor*1.2)+power*2;
  impact(p.x,p.y,CURSE_FX.selfblast,8);burst(p.x,p.y,'#e6fdff',26,1.2);flash('#c8bcff',160);bellFX(p.x,p.y,4,'#b6f3ff');
  for(const element of ['shock','ice'])elementAttackFx105(element,cells,p);
  const keys=new Set(cells.map(q=>k(q.x,q.y)));
  for(const m of [...state.monsters])if(m.hp>0&&entityFootprintCells57(m).some(q=>keys.has(k(q.x,q.y)))){
    resolveElementDamage57(m,'shock',base,{contactHandled105:true,effect,source:'자폭 천명탄 전격',color:'#a9b6ff'});
    if(m.hp>0)resolveElementDamage57(m,'ice',base,{contactHandled105:true,effect,source:'자폭 천명탄 빙결',color:'#b6f3ff'});
  }
  // the wearer is caught in it too, but it never kills
  const cap=Math.max(0,Math.floor((p.hp-1)/3));
  if(cap>0){resolveElementDamage57(p,'shock',Math.min(base,cap),{contactHandled105:true,source:'자폭 천명탄 전격',color:'#a9b6ff'});if(p.hp>1)resolveElementDamage57(p,'ice',Math.min(base,cap),{contactHandled105:true,source:'자폭 천명탄 빙결',color:'#b6f3ff'})}
  floatText(p.x,p.y,'자폭 천명탄!',CURSE_FX.selfblast,14);addLog(`${c.name}: 장비가 천명탄처럼 터져 나와 나도 함께 휘말렸다.`);
}
function baneOnHurt(source,amount){
  const p=state?.player;if(!p||p.hp<=0)return;
  if(baneCount('scream')>0&&p.hp<=p.maxHp*.5&&state.turn>=(p.curseScreamCd??0)){
    p.curseScreamCd=state.turn+6;alertNearby(p.x,p.y,9,'explosion');bellFX(p.x,p.y,8,CURSE_FX.scream);floatText(p.x,p.y,'비명!',CURSE_FX.scream,13);addLog('비명: 장비가 고통에 찬 소리를 질렀다.');
  }
  if(baneCount('selfblast')>0&&p.hp<=p.maxHp*.25&&state.turn>=(p.curseBlastCd??0)){
    p.curseBlastCd=state.turn+10;baneSelfBlast(p,banePower('selfblast'),CHARM_BANES.selfblast);
  }
}
function baneOnKill(mon){
  const p=state?.player;if(!p||p.hp<=0||!mon||mon.curseMirror991||baneCount('mirror_image')<=0)return;
  const echo=spawnMonster({x:mon.x,y:mon.y},false,{provenance:'curse'});if(!echo)return;
  Object.assign(echo,{name:`거울상 ${mon.name}`,curseMirror991:true,alerted:true,mirrorLife991:4,hp:Math.max(3,Math.round((mon.maxHp||10)*.6)),maxHp:Math.max(3,Math.round((mon.maxHp||10)*.6))});
  charmFx(echo.x,echo.y,'거울상',CURSE_FX.mirror,2);addLog('거울상: 쓰러진 적의 반영이 일어나 나를 쫓는다.');
}
// A mirror image fades after four turns.
function baneMirrorTick(){
  for(const m of [...state.monsters]){
    if(!m.curseMirror991||m.hp<=0)continue;m.mirrorLife991=(m.mirrorLife991??4)-1;
    if(m.mirrorLife991<=0){charmFx(m.x,m.y,'흩어짐',CURSE_FX.mirror,1);OccupancyService.removeMonster(m)}
  }
}

/* ---- randart roller ---- */
function makeRandart(slot,tier=3,opts={},rnd=()=>globalThis.__MANRU_RANDOM57__()){
  const pick=a=>a[Math.floor(rnd()*a.length)],chance=p=>rnd()<p,shuffle=a=>a.map(v=>[rnd(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  tier=Math.max(1,Math.min(5,Math.round(tier)));
  const it={type:slot,randart:true,tier,rarity:tier>=5?'sealed':tier>=3?'relic':'rare',identified:true,curseImmune991:true,count:1,resist:{}};
  const premium=!!opts.premium;
  if(premium){it.premium=true;it.rarity='sealed';it.tier=tier=5}
  const specials={
    bagSlots:()=>tier>=5?3:tier>=3?2:1,regenEvery:()=>Math.max(5,11-tier),killHeal:()=>1+(tier>=4?1:0),killFocus:()=>1+(tier>=3?1:0),thorns:()=>1+(tier>=3?1:0),
    lowHpAtk:()=>2+(tier>=4?1:0),lowHpDef:()=>2,critAdd:()=>.03+.01*(tier-1),moveMul:()=>+(1-(.03+.01*(tier-1))).toFixed(2),
    atkCostMul:()=>+(1-(.03+.01*(tier-1))).toFixed(2),statusGuard:()=>+(.15+.03*tier).toFixed(2),
    strike:()=>({element:null,dmg:2+(tier>=4?1:0)})
  };
  // No recipe: a randart is bought with points. The tier sets the budget; a weakness, a lowered stat or a curse taken on
  // adds to it. Each purchase either opens something new (a stat, a resist level, an effect, a quirk) or deepens what the
  // piece already has, and how strongly a piece piles into what it has is rolled per item. So most spread out, and now and
  // then one trades a weakness for one enormous stat, or stacks a single element to Ⅲ, or is all effects.
  const STAT_COST={atk:1.5,def:1.25,eva:.8,will:.8,vision:1.4,focus:.7},STAT_CAP={atk:tier+3,def:tier+3,eva:tier*2+2,will:tier+3,vision:2,focus:tier*3+3};
  // Resists were the commonest line on a randart; they are rolled less often (below) and the budget is cut by what that took.
  let budget=(premium?16:(1.7+1.5*tier)*.9)*(.8+rnd()*.4),points=0;
  if(!premium)for(let n=chance(.35)?(chance(.25)?2:1):0;n>0;n--){
    const r=rnd();
    if(r<.14&&!it.curse991){const c=pick(CURSE_CATALOG);it.curse991=c.id;it.curseRoll991=true;it.curseImmune991=false;revealItemCurse(it);points++;budget+=1.5}
    else if(r<.34&&!it.bane){const id=pick(Object.keys(CHARM_BANES)),b=CHARM_BANES[id];it.bane=id;points+=b.pts;budget+=1.5*b.pts}
    else if(r<.74){const el=pick(RESIST_ELEMENTS57.filter(e=>!it.resist[e]));if(el){it.resist[el]=-1;points++;budget+=1.6}}
    else{const k=pick(['vision','eva','def','will'].filter(x=>!it[x]));if(k){it[k]=-1;points++;budget+=1.2}}
  }
  if(premium)it.quirk=charmPickQuirk(rnd,true);
  const focus=premium?.35:Math.pow(rnd(),1.8)*.9;
  // A low-tier piece has room for few things: at most 1 + tier distinct positive traits (a debuff taken on does not count),
  // and opening a new one costs more than deepening one it already has, so cheap +1s do not pile up as separate lines.
  const traitCap=premium?7:1+tier,openCost=premium?0:.6;
  const traitCount=()=>CHARM_STATS.filter(k=>it[k]>0).length+Object.values(it.resist).filter(v=>v>0).length+Object.keys(specials).filter(k=>it[k]!=null).length+(it.quirk?1:0);
  const owned=()=>[...CHARM_STATS.filter(k=>it[k]>0).map(k=>['stat',k]),...Object.keys(it.resist).filter(e=>it.resist[e]>0).map(e=>['resist',e])];
  for(let guard=0;guard<60&&budget>=.5;guard++){
    let kind,key;const mine=owned();
    if(mine.length&&chance(focus))[kind,key]=pick(mine);
    else{const r=rnd();kind=r<.49?'stat':r<.67?'resist':r<.93?'special':'quirk';key=kind==='stat'?pick(CHARM_STATS):kind==='resist'?pick(RESIST_ELEMENTS57.filter(e=>!it.resist[e])):kind==='special'?pick(Object.keys(specials).filter(k=>it[k]==null)):null}
    if(kind==='resist'&&!key)continue;
    if(kind==='special'&&(!key||Object.keys(specials).filter(k=>it[k]!=null).length>=4)||kind==='quirk'&&(it.quirk||tier<2))continue;
    if(kind==='stat'&&((it[key]||0)<0||(it[key]||0)>=STAT_CAP[key]))continue;
    if(kind==='resist'&&((it.resist[key]||0)<0||(it.resist[key]||0)>=(tier>=3?3:2)))continue;
    const opening=kind==='special'||kind==='quirk'||(kind==='stat'?!(it[key]>0):!(it.resist[key]>0));
    if(opening&&traitCount()>=traitCap){if(!mine.length)break;continue}
    const cost=(kind==='stat'?STAT_COST[key]:kind==='resist'?[1,2.2,3.4][it.resist[key]||0]:kind==='special'?1.6:3)+(opening?openCost:0);
    if(cost>budget)continue;budget-=cost;
    if(kind==='stat')it[key]=(it[key]||0)+1;else if(kind==='resist')it.resist[key]=(it.resist[key]||0)+1;else if(kind==='special')it[key]=specials[key]();else it.quirk=charmPickQuirk(rnd,premium);
  }
  if(it.strike)it.strike.element=pick(Object.keys(it.resist).filter(e=>it.resist[e]>0).concat(Object.keys(it.resist).some(e=>it.resist[e]>0)?[]:RESIST_ELEMENTS57));
  const specialCount=Object.keys(specials).filter(k=>it[k]!=null).length,mainKey=CHARM_STATS.filter(k=>it[k]>0).sort((x,y)=>it[y]-it[x])[0]||null;
  const posResist=Object.keys(it.resist).filter(e=>it.resist[e]>0).sort((x,y)=>it.resist[y]-it.resist[x]),dominant=posResist[0]||null;
  const specialKey=Object.keys(specials).find(k=>it[k]);
  const mat=premium?pick(['gold','silver','pearl','rosegold','amethyst','azure']):pick(dominant&&chance(.65)?CHARM_ELEM_MATERIAL[dominant]:Object.keys(CHARM_MATERIALS)),shape=premium?(slot==='relic'?'orb':'lotus'):charmPickShape(slot,Object.keys(it.resist||{}).length+specialCount*1.2+(it.quirk?2:0)+points*.5+tier*.4,rnd),gemKey=dominant&&chance(.6)?dominant:pick(CHARM_JEWELS),cordKey=pick(Object.keys(CHARM_CORDS));
  const prefix=premium?pick(CHARM_PREMIUM_PREFIX):dominant?CHARM_ELEM_PREFIX[dominant]:(CHARM_PREFIX_SPECIAL[specialKey]||CHARM_PREFIX_SPECIAL[mainKey]||'무명');
  it.name=`${prefix} ${CHARM_MATERIALS[mat].name} ${CHARM_SHAPE_NAME[shape]}`;
  it.art={shape,mat,gem:gemKey,cord:cordKey,glyph:dominant?CHARM_GLYPH[dominant]:'',premium};
  it.desc=`${CHARM_MATERIALS[mat].name}으로 빚은 ${CHARM_SHAPE_NAME[shape]}. ${CHARM_FLAVOR[shape]}`;
  if(!Object.keys(it.resist).length)delete it.resist;
  return it;
}
// The new relics and trinkets are the rarer finds: a randart 40% of the time, and among fixed pieces the newly designed ones
// (they carry their own art) weigh 0.4 against 1 for the classic ones.
const CHARM_DROP_RULES=Object.freeze({randart:.4,newFixedWeight:.4});
function charmDrop(pool){
  const fixed=pool.filter(x=>!x.randart),rnd=globalThis.__MANRU_RANDOM57__;
  if(rnd()<CHARM_DROP_RULES.randart||!fixed.length){const slot=rnd()<.5?'relic':'trinket';return makeRandart(slot,Math.max(1,Math.min(5,tierForFloor())))}
  const weight=x=>x.art?CHARM_DROP_RULES.newFixedWeight:1,total=fixed.reduce((n,x)=>n+weight(x),0);
  let r=rnd()*total;for(const x of fixed){r-=weight(x);if(r<=0)return clone(x)}
  return clone(fixed[fixed.length-1]);
}


/* ---- icons: twelve silhouettes; material, gem, cord and trim colours vary independently ---- */
function drawCharmArt(q,it){
  const a=it.art||{},m=CHARM_MATERIALS[a.mat]||CHARM_MATERIALS.gold,c1=m.c1,c2=m.c2,g=CHARM_GEM[a.gem]||CHARM_GEM.ruby,hi=shade(c1,55),dark='#17110e';
  const cordHex=CHARM_CORDS[a.cord]||Object.values(CHARM_CORDS)[hash(it.name)%8],trim=['gold','rosegold','bronze','copper','amber','coral'].includes(a.mat)?'#f3e7c4':'#e2c47a';
  const lg=(x0,y0,x1,y1,cols)=>{const gr=q.createLinearGradient(x0,y0,x1,y1);cols.forEach((c,i)=>gr.addColorStop(i/(cols.length-1),c));return gr};
  const rg=(x,y,r,cols)=>{const gr=q.createRadialGradient(x-r*.35,y-r*.4,r*.08,x,y,r);cols.forEach((c,i)=>gr.addColorStop(i/(cols.length-1),c));return gr};
  const fp=(pts,st)=>{q.fillStyle=st;q.beginPath();pts.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill()};
  const fe=(x,y,rx,ry,st)=>{q.fillStyle=st;q.beginPath();q.ellipse(x,y,rx,ry,0,0,Math.PI*2);q.fill()};
  const stroke=(st,w,fn)=>{q.save();q.strokeStyle=st;q.lineWidth=w;q.lineCap='round';q.beginPath();fn();q.stroke();q.restore()};
  const thin=(x1,y1,x2,y2,col,w=1)=>stroke(col,w,()=>{q.moveTo(x1,y1);q.lineTo(x2,y2)});
  const orb=(x,y,r,base)=>{fe(x,y,r+1,r+1,dark);fe(x,y,r,r,rg(x,y,r,[shade(base,70),base,shade(base,-60)]))};
  const gem=(x,y,r,col=g)=>{fe(x,y,r+1.4,r+1.4,dark);fe(x,y,r+.6,r+.6,lg(x-r,y-r,x+r,y+r,[trim,shade(trim,-70)]));fe(x,y,r,r,rg(x,y,r,[shade(col,85),col,shade(col,-70)]));fp([[x-r*.7,y-r*.1],[x-r*.1,y-r*.8],[x+r*.5,y-r*.5],[x,y]],shade(col,95));itemArtDot(q,Math.round(x-r*.4),Math.round(y-r*.5),'#ffffff')};
  const metal=(x0,y0,x1,y1)=>lg(x0,y0,x1,y1,[hi,c1,c2]);
  const tassel=(x,y,len,col=cordHex)=>{orb(x,y,2.2,col);for(const dx of[-3,-1.5,0,1.5,3]){thin(x+dx*.3,y+2,x+dx*1.25,y+len,dark,2.2);thin(x+dx*.3,y+2,x+dx*1.25,y+len,shade(col,Math.abs(dx)>2?-35:15),1.2)}thin(x-3.4,y+len-3,x+3.4,y+len-3,trim,1.2);fe(x,y+len+.5,0,0,col)};
  const ringStroke=(cx,cy,rx,ry,cols)=>{for(const[w,st]of cols)stroke(st,w,()=>q.ellipse(cx,cy,rx,ry,0,0,Math.PI*2))};
  const grade=a.grade||CHARM_SHAPE_GRADE[a.shape]||'simple';
  if(grade!=='simple')fe(24,24,grade==='grand'?21:19,grade==='grand'?21:19,grade==='grand'?'rgba(255,240,200,.15)':'rgba(255,244,214,.09)');
  if(a.shape?.startsWith('fx_'))drawFixedCharm(a.shape,{q,c1,c2,hi,g,dark,trim,cordHex,lg,rg,fp,fe,stroke,thin,orb,gem,metal,tassel,ringStroke});
  else switch(a.shape){
  case'beads':{
    for(let i=0;i<14;i++){const t=(i/14)*Math.PI*2+Math.PI/2+.2,x=24+Math.cos(t)*14,y=21+Math.sin(t)*12.5;if(Math.sin(t)>.93)continue;if(i%4===3){fe(x,y,3.2,3.2,dark);fe(x,y,2.5,2.5,metal(x-2,y-2,x+2,y+2));continue}orb(x,y,3.6,i%2?c1:shade(c1,-18))}
    thin(24,33,24,36,cordHex,2);orb(24,38,5.2,g);gem(24,38,2.4,shade(g,40));tassel(24,43,3);break}
  case'plaque':{
    const out=[[13,10],[35,10],[38,15],[38,32],[24,43],[10,32],[10,15]];
    thin(24,3,24,10,cordHex,2.2);stroke(trim,1.4,()=>q.arc(24,5,2.6,0,Math.PI*2));
    fp(out,dark);fp([[14,11],[34,11],[37,16],[37,31],[24,41.5],[11,31],[11,16]],lg(10,10,38,43,[hi,c1,c2]));
    fp([[17,14],[31,14],[34,18],[34,30],[24,38],[14,30],[14,18]],lg(14,14,34,38,[shade(c2,10),shade(c2,-30)]));
    stroke(trim,1,()=>{q.moveTo(17,14);q.lineTo(31,14);q.lineTo(34,18);q.lineTo(34,30);q.lineTo(24,38);q.lineTo(14,30);q.lineTo(14,18);q.closePath()});
    if(a.glyph){q.fillStyle=trim;q.font='900 15px serif';q.textAlign='center';q.fillText(a.glyph,24,31);q.textAlign='start'}
    else{stroke(trim,1.2,()=>{q.arc(20,26,4,Math.PI,Math.PI*2);q.arc(28,26,4,Math.PI,Math.PI*2)});thin(24,20,24,32,trim,1)}
    gem(24,16,2.3);break}
  case'mirror':{
    thin(24,40,24,45,dark,5);fp([[21,33],[27,33],[28,41],[20,41]],dark);fp([[22,33.5],[26,33.5],[26.6,40],[21.4,40]],metal(21,33,27,40));tassel(24,41,4);
    fe(24,20,15.5,15.5,dark);fe(24,20,14.5,14.5,metal(10,6,38,34));fe(24,20,11.3,11.3,dark);fe(24,20,10.4,10.4,rg(24,20,10.4,[shade(c1,25),c2,shade(c2,-25)]));
    stroke(trim,1,()=>q.arc(24,20,8.2,0,Math.PI*2));
    for(let i=0;i<8;i++){const t=i/8*Math.PI*2;fe(24+Math.cos(t)*6,20+Math.sin(t)*6,1.5,1.5,trim)}
    gem(24,20,3);break}
  case'seal':{
    thin(36,30,41,36,cordHex,2);tassel(41,37,6);
    fp([[10,29],[38,29],[38,41],[10,41]],dark);fp([[11,30],[37,30],[37,40],[11,40]],lg(11,30,37,40,[hi,c1,c2]));fp([[11,30],[16,25],[32,25],[37,30]],dark);fp([[12,29.5],[16.5,26],[31.5,26],[36,29.5]],shade(c1,60));
    stroke(trim,1,()=>{q.moveTo(13,33);q.lineTo(35,33);q.moveTo(13,37);q.lineTo(35,37)});
    fe(24,17,8,7,dark);fe(24,17,7,6,rg(24,17,7,[hi,c1,c2]));fe(24,11,5,4.6,dark);fe(24,11,4.2,3.9,rg(24,11,4.4,[hi,c1,c2]));fp([[19.5,8],[21,4.5],[22.8,8]],dark);fp([[25.2,8],[27,4.5],[28.5,8]],dark);gem(24,17,2.2);itemArtDot(q,22,10,dark);itemArtDot(q,26,10,dark);break}
  case'bracelet':{
    ringStroke(24,26,14,11,[[12,dark],[9,lg(10,10,38,40,[hi,c1,c2])]]);
    ringStroke(24,26,14,11,[[1,hi]]);
    for(let i=0;i<10;i++){const t=i/10*Math.PI*2,x=24+Math.cos(t)*14,y=26+Math.sin(t)*11,nx=Math.cos(t),ny=Math.sin(t)*.8;thin(x-nx*3.6,y-ny*3.6,x+nx*3.6,y+ny*3.6,i%2?trim:shade(c2,-10),1.2)}
    orb(14,37,2.2,trim);orb(34,37,2.2,trim);gem(24,37.5,4);break}
  case'norigae':{
    for(const side of[-1,1]){const cx=24+side*7.5;stroke(dark,5,()=>q.ellipse(cx,9,6,4.2,side*.35,0,Math.PI*2));stroke(cordHex,3,()=>q.ellipse(cx,9,6,4.2,side*.35,0,Math.PI*2));stroke(shade(cordHex,60),.8,()=>q.ellipse(cx,8.5,5.2,3.4,side*.35,Math.PI,Math.PI*1.8))}
    orb(24,9,3.8,cordHex);thin(24,13,24,19,cordHex,2.4);
    fe(24,26,8.4,8.4,dark);fe(24,26,7.6,7.6,metal(17,19,31,33));gem(24,26,5);
    for(const[dx,col]of[[-4,cordHex],[0,shade(cordHex,25)],[4,cordHex]])thin(24+dx*.9,32,24+dx*1.7,41,dark,2.6),thin(24+dx*.9,32,24+dx*1.7,41,col,1.4);
    thin(19,40,29,40,trim,1.4);orb(24,35.5,1.9,trim);orb(18,43,1.8,g);orb(30,43,1.8,g);break}
  case'bell':{
    thin(24,2,24,8,cordHex,2.2);stroke(dark,3.6,()=>q.arc(24,8.5,3.6,0,Math.PI*2));stroke(trim,1.6,()=>q.arc(24,8.5,3.6,0,Math.PI*2));
    q.save();q.fillStyle=dark;q.beginPath();q.moveTo(10.5,36);q.quadraticCurveTo(11,13.5,24,11.5);q.quadraticCurveTo(37,13.5,37.5,36);q.closePath();q.fill();q.fillStyle=lg(11,12,37,36,[hi,c1,c2]);q.beginPath();q.moveTo(12,35);q.quadraticCurveTo(12.5,14.8,24,13);q.quadraticCurveTo(35.5,14.8,36,35);q.closePath();q.fill();q.restore();
    fp([[10.5,34],[37.5,34],[38,37.5],[10,37.5]],dark);fp([[11.5,35],[36.5,35],[36.6,36.6],[11.4,36.6]],trim);
    stroke(trim,1.2,()=>{q.moveTo(13,27);q.quadraticCurveTo(24,30,35,27)});stroke(shade(c2,-20),1.4,()=>{q.moveTo(17,20);q.quadraticCurveTo(24,23,31,20)});
    thin(19,17,17.5,30,shade(hi,30),1.2);fe(24,37.6,3.4,1.5,dark);gem(24,41,2.4);break}
  case'gourd':{
    fe(24,31,12.8,12,dark);fe(24,15,8.8,8.6,dark);fe(24,31,11.8,11,rg(24,31,11.8,[hi,c1,c2]));fe(24,15,7.8,7.6,rg(24,15,7.8,[hi,c1,c2]));
    stroke(shade(c2,-10),1,()=>{q.arc(24,31,8,Math.PI*.15,Math.PI*.85);q.moveTo(31,33);q.arc(24,31,8,Math.PI*.15,Math.PI*.4)});stroke(shade(hi,25),1.2,()=>q.arc(24,31,9,Math.PI*1.05,Math.PI*1.35));
    fp([[20,3],[28,3],[29,8],[19,8]],dark);fp([[21,4],[27,4],[27.6,7],[20.4,7]],metal(20,3,28,8));
    stroke(dark,4.2,()=>{q.moveTo(15.5,22);q.quadraticCurveTo(24,25,32.5,22)});stroke(cordHex,2.4,()=>{q.moveTo(15.5,22);q.quadraticCurveTo(24,25,32.5,22)});
    thin(31,23.5,35,26,cordHex,2);tassel(35,27,9);gem(24,31,3);break}
  case'coins':{
    thin(24,2,24,40,dark,3.4);thin(24,2,24,40,cordHex,1.6);orb(24,5,3,cordHex);
    for(let i=0;i<4;i++){const y=14+i*7.4;fe(24,y,7.6,7.6,dark);fe(24,y,6.7,6.7,rg(24,y,6.7,[hi,c1,c2]));stroke(trim,.9,()=>q.arc(24,y,5.3,0,Math.PI*2));fp([[21.6,y-2.4],[26.4,y-2.4],[26.4,y+2.4],[21.6,y+2.4]],dark)}
    tassel(24,41,5);break}
  case'fan':{
    const R=26,pts=[[24,42]];for(let d=-155;d<=-25;d+=10)pts.push([24+(R+2)*Math.cos(d*Math.PI/180),42+(R+2)*Math.sin(d*Math.PI/180)]);fp(pts,dark);
    for(let i=0;i<7;i++){const a0=(-152+i*17.4)*Math.PI/180,a1=(-152+(i+1)*17.4)*Math.PI/180;fp([[24,42],[24+R*Math.cos(a0),42+R*Math.sin(a0)],[24+R*Math.cos(a1),42+R*Math.sin(a1)]],i%2?lg(12,10,36,40,[hi,c1]):lg(12,10,36,40,[c1,shade(c1,-30)]))}
    for(let i=0;i<=7;i++){const t=(-152+i*17.4)*Math.PI/180;thin(24,42,24+R*Math.cos(t),42+R*Math.sin(t),shade(c2,-15),.9)}
    stroke(trim,1.2,()=>q.arc(24,42,R-1.5,-152*Math.PI/180,-28*Math.PI/180));for(let i=0;i<7;i++){const t=(-143+i*17.4)*Math.PI/180;fe(24+(R-8)*Math.cos(t),42+(R-8)*Math.sin(t),1.6,1.6,i%2?g:trim)}
    orb(24,43.5,2.4,trim);thin(24,43,24,47,cordHex,2);break}
  case'hairpin':{
    thin(7,43,31,17,dark,5);thin(7,43,31,17,lg(7,43,31,17,[c2,c1,hi]),3);thin(8,42,30,18,trim,.8);
    for(let i=0;i<6;i++){const t=i/6*Math.PI*2;orb(37+Math.cos(t)*5.2,10+Math.sin(t)*5.2,3.3,i%2?c1:hi)}
    gem(37,10,4.2);
    for(const[x,y,len]of[[31,17,8],[34,16,10]]){thin(x,y,x-2,y+len,trim,.9);orb(x-2,y+len+1,1.9,g)}
    orb(7,43,2.4,cordHex);break}
  case'orb':{
    fe(24,23,19,19,'rgba(255,240,200,.10)');
    fp([[13,40],[35,40],[32,44],[16,44]],dark);fp([[14,40.5],[34,40.5],[31.4,43.2],[16.6,43.2]],metal(13,40,35,44));
    for(const sx of[-1,1]){fp([[24+sx*9,41],[24+sx*14,30],[24+sx*12,27],[24+sx*6,36]],dark);fp([[24+sx*9,40],[24+sx*12.8,31],[24+sx*11.6,29],[24+sx*7,36]],metal(14,28,34,42))}
    fe(24,23,13.5,13.5,dark);fe(24,23,12.5,12.5,rg(24,23,12.5,[shade(g,95),g,shade(g,-75)]));
    stroke('rgba(255,255,255,.55)',1.4,()=>q.arc(24,23,9,Math.PI*1.1,Math.PI*1.55));fe(19,17,2.4,2.4,'rgba(255,255,255,.7)');
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2+.6;stroke(trim,.9,()=>{q.moveTo(24,23);q.quadraticCurveTo(24+Math.cos(t)*5,23+Math.sin(t)*5,24+Math.cos(t)*9,23+Math.sin(t)*9)})}
    orb(24,5.5,2.6,cordHex);thin(24,8,24,10,cordHex,1.6);break}
  case'lotus':{
    fe(24,26,19,19,'rgba(255,240,200,.10)');
    thin(24,46,24,34,dark,4);thin(24,46,24,34,c2,2);
    for(const[dx,dy,rot]of[[-11,8,-1.0],[11,8,1.0],[-7,3,-.55],[7,3,.55]]){q.save();q.translate(24+dx,26+dy);q.rotate(rot);fe(0,0,4.6,9.5,dark);fe(0,0,3.8,8.6,lg(-4,-9,4,9,[hi,c1,c2]));thin(0,-6,0,6,shade(c1,-30),.8);q.restore()}
    q.save();q.translate(24,22);fe(0,0,5.4,11.2,dark);fe(0,0,4.6,10.4,lg(-5,-10,5,10,[shade(c1,70),hi,c1]));thin(0,-7,0,7,shade(c1,-25),.8);q.restore();
    gem(24,28,4.6);for(const dx of[-9,9])orb(24+dx,40,1.8,trim);break}
  case'crescent':{
    stroke(dark,3.4,()=>{q.moveTo(7,3);q.quadraticCurveTo(24,22,41,3)});stroke(trim,1.4,()=>{q.moveTo(7,3);q.quadraticCurveTo(24,22,41,3)});
    for(let i=1;i<6;i++){const t=i/6,x=(1-t)*(1-t)*7+2*t*(1-t)*24+t*t*41,y=(1-t)*(1-t)*3+2*t*(1-t)*22+t*t*3;orb(x,y,1.5,i%2?c1:g)}
    const[cc,cq]=cv();cq.imageSmoothingEnabled=false;
    const cg=cq.createLinearGradient(8,14,40,44);cg.addColorStop(0,hi);cg.addColorStop(.5,c1);cg.addColorStop(1,c2);
    cq.fillStyle=dark;cq.beginPath();cq.arc(24,29,15.5,0,Math.PI*2);cq.fill();cq.fillStyle=cg;cq.beginPath();cq.arc(24,29,14.5,0,Math.PI*2);cq.fill();
    cq.globalCompositeOperation='destination-out';cq.beginPath();cq.arc(31,24,12,0,Math.PI*2);cq.fill();cq.globalCompositeOperation='source-over';
    q.drawImage(cc,0,0);
    stroke(trim,1,()=>q.arc(24,29,12.6,Math.PI*.55,Math.PI*1.25));
    gem(17,34,3.2);orb(13,25,1.8,trim);orb(21,40,1.6,trim);
    for(const[x,y,r]of[[36,31,1.6],[40,37,1.1]]){thin(x-r*1.6,y,x+r*1.6,y,'#fff6d6',1);thin(x,y-r*1.6,x,y+r*1.6,'#fff6d6',1)}break}
  case'crown':{
    fp([[7,35],[41,35],[39,42],[9,42]],dark);fp([[8,36],[40,36],[38.5,41],[9.5,41]],lg(8,36,40,41,[hi,c1,c2]));
    fp([[7,35],[8,17],[16,27],[20,10],[24,25],[28,10],[32,27],[40,17],[41,35]],dark);
    fp([[9,34],[9.6,20],[16,28.5],[20.5,13],[24,27],[27.5,13],[32,28.5],[38.4,20],[39,34]],lg(8,12,40,36,[hi,c1,c2]));
    stroke(trim,1.1,()=>{q.moveTo(10,33);q.lineTo(10.6,22);q.lineTo(16,29);q.lineTo(20.6,15);q.lineTo(24,28);q.lineTo(27.4,15);q.lineTo(32,29);q.lineTo(37.4,22);q.lineTo(38,33)});
    for(const[x,y]of[[8.5,16],[20,9],[28,9],[39.5,16]])orb(x,y,2.1,g);
    gem(24,31,3.6);for(const x of[14,34])orb(x,38.5,1.8,trim);for(const x of[18,30])orb(x,38.5,1.4,g);
    stroke(trim,.9,()=>{q.moveTo(10,38.5);q.lineTo(38,38.5)});break}
  case'butterfly':{
    for(const side of[-1,1]){stroke(dark,4.4,()=>q.ellipse(24+side*6,5.5,5.2,3.4,side*.3,0,Math.PI*2));stroke(cordHex,2.4,()=>q.ellipse(24+side*6,5.5,5.2,3.4,side*.3,0,Math.PI*2))}
    orb(24,6,3.2,cordHex);thin(24,9,24,14,cordHex,2.2);
    const wing=(pts,side,st)=>{const m=pts.map(([x,y])=>[24+side*(x-24),y]);fp(m,dark);const inner=m.map(([x,y])=>[24+(x-24)*.86,y+(26-y)*.1]);fp(inner,st);stroke(trim,.9,()=>{inner.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath()})};
    for(const side of[-1,1]){wing([[26,23],[41,9],[45,20],[36,31]],side,lg(24,8,46,32,[hi,c1,c2]));wing([[26,27],[37,33],[39,43],[29,37]],side,lg(26,26,40,44,[c1,shade(c1,-25),c2]));orb(24+side*13,18,2.2,g);orb(24+side*11,37,1.6,trim)}
    fe(24,28,3.2,9.5,dark);fe(24,28,2.4,8.7,lg(21,18,27,38,[hi,c1,c2]));gem(24,24,3);
    thin(23,19,19,13,dark,1.6);thin(25,19,29,13,dark,1.6);orb(19,12.5,1.2,trim);orb(29,12.5,1.2,trim);
    tassel(24,38,7);break}
  case'phoenix':{
    thin(4,45,24,22,dark,5.4);thin(4,45,24,22,lg(4,45,24,22,[c2,c1,hi]),3.2);thin(5,44,23,23,trim,.8);
    q.save();q.translate(27,20);
    for(const[ang,len,col]of[[.35,17,cordHex],[.8,15,g],[1.25,13,c1]]){q.save();q.rotate(ang);fe(len/2+2,0,len/2,3.5,dark);fe(len/2+2,0,len/2-.8,2.7,lg(2,-3,len,3,[shade(col,45),col,shade(col,-45)]));thin(3,0,len,0,trim,.7);q.restore()}
    q.restore();
    orb(27,15,6,c1);orb(30,11,3.6,hi);
    for(const[dx,dy]of[[-2,-7],[1,-8],[4,-7]])thin(30+dx*.3,10,30+dx,10+dy,trim,1.4);
    fp([[33,11],[39,13],[33,15]],dark);fp([[33.6,11.8],[37.6,13],[33.6,14.4]],trim);
    fe(30.5,10.4,1.3,1.3,dark);itemArtDot(q,30,10,'#ffffff');
    for(const[x,len]of[[35,8],[37,11]]){thin(x,14,x+1,14+len,trim,.8);orb(x+1,15+len,1.7,g)}
    orb(4,45,2.4,cordHex);break}
  default:{
    ringStroke(24,33,12.5,8,[[8,dark],[5,lg(12,26,36,41,[hi,c1,c2])]]);ringStroke(24,33,12.5,8,[[.9,hi]]);
    for(let i=0;i<8;i++){const t=Math.PI*(.15+i*.1);thin(24+Math.cos(t)*12.5-1.4,33+Math.sin(t)*8,24+Math.cos(t)*12.5+1.4,33+Math.sin(t)*8,shade(c2,-20),1)}
    fp([[14,24],[18,14],[30,14],[34,24],[24,29]],dark);fp([[15.6,24],[19,15.2],[29,15.2],[32.4,24],[24,27.6]],metal(14,14,34,29));gem(24,20.5,5);orb(12.5,31,2.2,shade(g,-10));orb(35.5,31,2.2,shade(g,-10))}
  }
  if(grade==='grand'&&!a.premium)for(const[x,y,r]of[[6,9,2],[42,8,1.6],[7,40,1.4]]){thin(x-r*1.6,y,x+r*1.6,y,'#fff6d6',1);thin(x,y-r*1.6,x,y+r*1.6,'#fff6d6',1);itemArtDot(q,Math.round(x),Math.round(y),'#ffffff')}
  if(a.premium){stroke(trim,1,()=>q.rect(2.5,2.5,43,43));for(const[x,y,r]of[[7,8,2.4],[41,10,1.8],[8,38,1.6],[40,34,2.2]]){thin(x-r*1.6,y,x+r*1.6,y,'#fff6d6',1);thin(x,y-r*1.6,x,y+r*1.6,'#fff6d6',1);itemArtDot(q,Math.round(x),Math.round(y),'#ffffff')}}
  if(a.glyph&&a.shape!=='plaque'&&!a.shape.startsWith('fx_')){fe(38,38,6.4,6.4,dark);fe(38,38,5.5,5.5,lg(32,32,44,44,[shade(g,-60),shade(g,-110)]));stroke(trim,.9,()=>q.arc(38,38,5.5,0,Math.PI*2));q.fillStyle='#fbf0d2';q.font='900 9px serif';q.textAlign='center';q.fillText(a.glyph,38,41);q.textAlign='start'}
}

/* ---- the named pieces: each fixed relic and trinket has a drawing of its own, never produced by the random shapes above ---- */
function drawFixedCharm(id,H){
  const{q,c1,c2,hi,g,dark,trim,cordHex,lg,rg,fp,fe,stroke,thin,orb,gem,metal,tassel,ringStroke}=H;
  const leaf=(x,y,len,w,rot,col)=>{q.save();q.translate(x,y);q.rotate(rot);fe(len/2,0,len/2+1,w+1,dark);fe(len/2,0,len/2,w,lg(0,-w,len,w,[shade(col,45),col,shade(col,-45)]));thin(1,0,len-1,0,shade(col,60),.7);q.restore()};
  const bell=(cx,cy,r,body)=>{fe(cx,cy,r+1.2,r+1.2,dark);fe(cx,cy,r,r,rg(cx,cy,r,[shade(body,70),body,shade(body,-70)]));fp([[cx-r*.8,cy+1],[cx+r*.8,cy+1],[cx+r*.7,cy+2.6],[cx-r*.7,cy+2.6]],dark);fe(cx,cy+r*.55,2,1.2,dark);stroke(shade(body,70),1,()=>q.arc(cx,cy,r*.72,Math.PI*1.1,Math.PI*1.5))};
  const gourd=(cx,top,col,scale=1)=>{const lw=11*scale,lh=10.5*scale,uw=7*scale;fe(cx,top+14*scale+lh*.6,lw+1,lh+1,dark);fe(cx,top+uw+1,uw+1,uw+1,dark);fe(cx,top+14*scale+lh*.6,lw,lh,rg(cx,top+20,lw,[shade(col,65),col,shade(col,-60)]));fe(cx,top+uw+1,uw,uw,rg(cx,top+8,uw,[shade(col,65),col,shade(col,-50)]))};
  const pin=(x1,y1,x2,y2)=>{thin(x1,y1,x2,y2,dark,5);thin(x1,y1,x2,y2,lg(x1,y1,x2,y2,[c2,c1,hi]),3);thin(x1+1,y1-1,x2+1,y2-1,trim,.7)};
  const coin=(x,y,r,col=c1)=>{fe(x,y,r+1,r+1,dark);fe(x,y,r,r,rg(x,y,r,[hi,col,c2]));stroke(trim,.8,()=>q.arc(x,y,r-1.4,0,Math.PI*2));fp([[x-1.5,y-1.5],[x+1.5,y-1.5],[x+1.5,y+1.5],[x-1.5,y+1.5]],dark)};
  switch(id){
  case'fx_flint':{
    fe(24,19,15,15,'rgba(255,150,60,.16)');
    ringStroke(24,35,12.5,7,[[9.5,dark],[6.5,lg(11,28,37,42,['#b4bac4','#5c626e','#2a2e36'])]]);ringStroke(24,35,12.5,7,[[.9,'#d6dbe4']]);
    for(let i=0;i<9;i++){const t=Math.PI*(.12+i*.095);thin(24+Math.cos(t)*12.5-1.2,35+Math.sin(t)*7,24+Math.cos(t)*12.5+1.2,35+Math.sin(t)*7,'#1c2026',1)}
    fp([[14,30],[17,25],[31,25],[34,30],[29,33],[19,33]],dark);fp([[15.4,29.6],[17.8,26],[30.2,26],[32.6,29.6],[28.4,32],[19.6,32]],lg(14,25,34,33,['#d6dbe4','#7a808c','#3a3e48']));
    fp([[17,25],[20,13],[28,10],[33,17],[31,25]],dark);fp([[18.6,24.6],[21,14.4],[27.6,11.6],[31.6,17.4],[30,24.6]],lg(18,10,32,25,['#9aa0aa','#4a4f5a','#2a2d34']));
    fp([[21,14.4],[27.6,11.6],[25,19]],'#dfe3ea');fp([[25,19],[31.6,17.4],[30,24.6]],'#5e6470');fp([[18.6,24.6],[21,14.4],[25,19],[23,25]],'#3a3e48');
    for(const[x,y]of[[16.4,27],[31.6,27],[20,32.4],[28,32.4]])orb(x,y,1.5,'#c9ced8');
    for(const[a,b,x,y]of[[32,12,38,6],[33,15,41,13],[30,9,32,2],[34,18,43,19],[27,8,26,1],[35,10,40,2]])thin(a,b,x,y,'#ffb060',1.4);
    for(const[x,y]of[[38,6],[41,13],[32,2],[43,19],[26,1],[40,2]])orb(x,y,1.3,'#ffe0a0');break}
  case'fx_wavebeads':{
    for(let i=0;i<18;i++){const t=i/18*Math.PI*2+Math.PI*.5,x=24+Math.cos(t)*15.5,y=19+Math.sin(t)*14;if(Math.sin(t)>.93)continue;
      if(i%6===3){fe(x,y,2.4,3.4,dark);fe(x,y,1.8,2.8,metal(x-2,y-3,x+2,y+3))}else orb(x,y,3,i%2?'#4a86d0':'#2f66b0')}
    thin(24,33,24,36,cordHex,2);orb(24,35,1.8,trim);
    fe(24,41,8.6,8.6,dark);fe(24,41,7.8,7.8,rg(24,41,7.8,['#a8d8ff','#3f86d0','#1c4a8a']));
    for(const r of[2.6,4.4,6.2])stroke('#e6f6ff',.9,()=>q.arc(24,41,r,Math.PI*1.1,Math.PI*1.9));stroke('#e6f6ff',.9,()=>q.arc(24,41,6.2,Math.PI*.1,Math.PI*.9));
    fp([[24,38.6],[25.6,41],[24,43.4],[22.4,41]],'#fff');stroke(trim,1,()=>q.arc(24,41,7.8,0,Math.PI*2));break}
  case'fx_frosttablet':
    for(const[x,h]of[[17,7],[24,10],[31,6]])fp([[x-3,13],[x,13-h],[x+3,13]],lg(x,13-h,x,13,['#ffffff','#bfe6f6','#7fb8d8']));
    fp([[13,12],[35,12],[35,35],[13,35]],dark);fp([[14,13],[34,13],[34,34],[14,34]],lg(14,13,34,34,['#f2fbff','#bfe3ef',c1]));
    stroke('#fff',1,()=>{q.moveTo(24,16);q.lineTo(24,31);q.moveTo(17.5,19.5);q.lineTo(30.5,27.5);q.moveTo(17.5,27.5);q.lineTo(30.5,19.5)});gem(24,23.5,2.6);
    for(const[x,h]of[[16,9],[20,12],[24,8],[28,13],[32,9]])fp([[x-2,35],[x,35+h*.8],[x+2,35]],lg(x,35,x,35+h,['#e8f7ff','#8fc6e0','#6aa6c8']));
    thin(24,4,24,8,cordHex,2);break;
  case'fx_thundermirror':{
    const oct=(r,cx,cy)=>[...Array(8)].map((_,i)=>[cx+Math.cos(Math.PI/8+i*Math.PI/4)*r,cy+Math.sin(Math.PI/8+i*Math.PI/4)*r]);
    thin(24,36,24,44,dark,5);fp([[22,36],[26,36],[26.6,43],[21.4,43]],metal(21,36,27,43));tassel(24,43,3);
    fp(oct(16,24,21),dark);fp(oct(15,24,21),metal(9,6,39,36));fp(oct(11.6,24,21),dark);fp(oct(10.8,24,21),rg(24,21,11,[shade(c1,30),c2,shade(c2,-30)]));
    stroke(trim,1.1,()=>{for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4,x=24+Math.cos(a)*13.2,y=21+Math.sin(a)*13.2,b=a+Math.PI/8,x2=24+Math.cos(b)*13.2+Math.cos(a+1.2)*1.3,y2=21+Math.sin(b)*13.2+Math.sin(a+1.2)*1.3;q.moveTo(x,y);q.lineTo(x2,y2)}});
    fp([[27,12],[19,22],[23.4,22],[21,31],[30,19],[25.4,19]],'#ffe45c');thin(20,22,28,19.6,'#fff6b0',.8);break}
  case'fx_amberseal':{
    thin(24,3,24,9,cordHex,2);stroke(trim,1.4,()=>q.arc(24,5,3,0,Math.PI*2));
    fp([[10,36],[38,36],[39,42],[9,42]],dark);fp([[11,37],[37,37],[37.6,41],[10.4,41]],lg(11,37,37,41,['#6a6a72','#3a3a42']));stroke('#8a8a94',.8,()=>{q.moveTo(14,40);q.lineTo(20,38);q.moveTo(28,40);q.lineTo(34,38)});
    fp([[10,15],[17,10],[38,10],[39,15]],dark);fp([[11,15],[17.6,11],[37.4,11],[37.6,15]],lg(11,11,38,15,['#fff4c8','#ffd36a']));
    fp([[10,14],[39,14],[39,37],[10,37]],dark);fp([[11,15],[38,15],[38,36],[11,36]],lg(11,15,38,36,['#ffe9a0','#f2b640',c2]));
    fp([[11,15],[16,12],[16,34],[11,36]],'rgba(120,60,10,.28)');fe(28,22,7,5,'rgba(255,250,210,.22)');
    fe(24,26,1.7,5,'#5a3414');fe(24,20,2.4,2.1,'#5a3414');
    for(const side of[-1,1]){q.save();q.translate(24+side*1.6,23);q.rotate(side*.55);fe(side*5,-3,6,2.2,'rgba(110,60,20,.55)');q.restore();q.save();q.translate(24+side*1.4,28);q.rotate(side*.25);fe(side*4.5,2,5,1.8,'rgba(110,60,20,.5)');q.restore()}
    for(const[x,y,r]of[[16,30,1],[32,19,.9],[30,31,.7]])fe(x,y,r,r,'rgba(255,255,230,.6)');
    thin(13,17,17,17,'#fff6d0',1.6);break}
  case'fx_leafbracelet':{
    ringStroke(24,27,13.5,10,[[5,dark],[3,'#2f5a34']]);
    for(let i=0;i<14;i++){const t=i/14*Math.PI*2,x=24+Math.cos(t)*13.5,y=27+Math.sin(t)*10,tan=Math.atan2(Math.cos(t)*10,-Math.sin(t)*13.5);
      for(const off of[-.45,.45])leaf(x,y,11,3.4,tan+(i%2?off:-off*.6),(i+(off>0?1:0))%2?'#3f9a52':'#6cc46a')}
    for(const[a,b]of[[.5,0],[2.3,0],[4.1,0],[5.5,0]]){const x=24+Math.cos(a)*13.5,y=27+Math.sin(a)*10;orb(x,y,2.1,'#d9483b');itemArtDot(q,Math.round(x-1),Math.round(y-1),'#ffd0c8')}
    for(const a of[1.4,3.3,5.0]){const x=24+Math.cos(a)*13.5,y=27+Math.sin(a)*10;for(let k=0;k<5;k++){const aa=k*Math.PI*2/5;orb(x+Math.cos(aa)*2.2,y+Math.sin(aa)*2.2,1.5,'#fff')}orb(x,y,1.5,'#f2c84a')}
    break}
  case'fx_holybeads':
    for(let i=0;i<11;i++){const t=i/11*Math.PI*2+Math.PI*.5+.18,x=24+Math.cos(t)*14.5,y=19+Math.sin(t)*12.5;if(Math.sin(t)>.88)continue;orb(x,y,3,i%3===0?hi:c1)}
    thin(24,31,24,33,cordHex,2);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;thin(24+Math.cos(a)*5.4,38+Math.sin(a)*5.4,24+Math.cos(a)*9,38+Math.sin(a)*9,i%2?trim:'#fff6d0',1.4)}
    fe(24,38,5.4,5.4,dark);fe(24,38,4.6,4.6,rg(24,38,4.6,['#fff6d0',trim,shade(trim,-60)]));gem(24,38,2);break;
  case'fx_fiveRing':
    ringStroke(24,25,16,16,[[11,dark],[8,lg(8,9,40,41,[hi,c1,c2])]]);ringStroke(24,25,16,16,[[1,hi]]);ringStroke(24,25,12.8,12.8,[[.9,trim]]);
    {const cols=['#ff7a45','#58b6e6','#d4a35e','#6fcf6a','#f2d44c'];for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;gem(24+Math.cos(a)*16,25+Math.sin(a)*16,3.6,cols[i])}
    stroke(trim,.9,()=>{for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*4/5,x=24+Math.cos(a)*9,y=25+Math.sin(a)*9;i?q.lineTo(x,y):q.moveTo(x,y)}q.closePath()})}break;
  case'fx_phoenixfeather':
    thin(6,45,17,32,dark,4);thin(6,45,17,32,lg(6,45,17,32,[c2,c1]),2.4);
    q.save();q.translate(14,35);q.rotate(-.95);
    fe(15,0,17,7.6,dark);fe(15,0,16,6.8,lg(0,-7,32,7,['#ffd25a','#ff7a3a','#b8261f']));
    for(let i=-5;i<=5;i++){thin(15,0,15+14*Math.cos(i*.18),i*1.15,i%2?'#ffe9a0':'#ff9a50',.7)}
    thin(0,0,31,0,'#fff2c0',1);fe(23,0,3.8,3,'#2a8c8c');fe(23,0,2,1.6,'#9ff0e0');fe(23,0,.8,.8,dark);q.restore();
    for(const[x,y,r]of[[40,6,1.8],[43,13,1.3],[36,3,1.2]])orb(x,y,r,'#ffb15a');break;
  case'fx_icequeenring':
    ringStroke(24,38,11,5.6,[[7,dark],[4.6,lg(13,34,35,42,['#ffffff','#bcd2e0','#7f98ad'])]]);
    for(const[x,t,w,h]of[[24,5,5,29],[16.5,13,4,21],[31.5,13,4,21],[10.5,22,3,13],[37.5,22,3,13]])fp([[x-w,t+h],[x-w*.5,t+h*.28],[x,t],[x+w*.5,t+h*.28],[x+w,t+h]],lg(x,t,x,t+h,['#ffffff','#bfe6f6','#6aa6d0']));
    for(const[x,t]of[[24,5],[16.5,13],[31.5,13]]){thin(x,t,x,t+9,'#fff',.8)}
    gem(24,32,3,'#9fd8ff');for(const[x,y]of[[8,8],[40,10],[44,24]]){thin(x-2,y,x+2,y,'#fff',1);thin(x,y-2,x,y+2,'#fff',1)}break;
  case'fx_thunderseal':{
    for(const[a,b,x,y]of[[8,22,3,19],[7,30,2,31],[9,38,4,42],[40,22,45,19],[41,31,46,30],[39,39,44,43]]){thin(a,b,x,y,'rgba(255,228,92,.65)',1.2)}
    fp([[9,20],[39,20],[39,41],[9,41]],dark);fp([[10,21],[38,21],[38,40],[10,40]],lg(10,21,38,40,['#565b68','#2c2f38','#15171d']));
    fp([[9,20],[15,14],[33,14],[39,20]],dark);fp([[10.6,19.6],[15.6,15],[32.4,15],[37.4,19.6]],lg(10,15,38,20,['#7a8090','#4a4e5a']));
    fp([[10,21],[10,40],[13,38],[13,22]],'rgba(255,255,255,.08)');
    fe(18,9.4,5,4,'#9aa0ac');fe(24,7.6,5.6,4.6,'#b4bac6');fe(30,9.4,5,4,'#9aa0ac');fe(24,10,9,3.2,'#8a90a0');
    for(const x of[17,24,31])orb(x,9,1.2,'#e6c34a');thin(18,6,19,4,'#dfe3ec',1.2);
    fp([[26,22],[16,32],[22,32],[18,40],[32,28],[26,28],[30,22]],'rgba(255,228,92,.35)');
    fp([[26,23],[17,32],[22.4,32],[19,39],[31,28.6],[25.6,28.6],[29,23]],'#ffe45c');thin(18,31.6,24,30,'#fffbd0',.9);break}
  case'fx_dragonscale':
    thin(24,3,24,9,cordHex,2);orb(24,10,2.6,cordHex);
    fp([[24,8],[39,17],[36,34],[24,44],[12,34],[9,17]],dark);fp([[24,10],[37.4,18],[34.6,33],[24,42],[13.4,33],[10.6,18]],lg(10,10,38,44,['#b6f0e6',c1,c2]));
    for(const r of[7,12,17])stroke(shade(c2,-10),.9,()=>q.arc(24,12,r,Math.PI*.2,Math.PI*.8));
    for(const[x,y]of[[24,22],[17,27],[31,27],[24,33]]){stroke(shade(c1,55),.8,()=>q.arc(x,y-2,3.6,0,Math.PI))}
    stroke('#ff5a4a',1.6,()=>{q.moveTo(31,19);q.lineTo(27,25);q.lineTo(30,30);q.lineTo(26,37)});stroke('#ffc2b8',.7,()=>{q.moveTo(31,19);q.lineTo(27,25);q.lineTo(30,30);q.lineTo(26,37)});
    gem(24,16,2.6,'#ff6a5a');break;
  case'fx_redknot':
    for(const[dx,dy,rx,ry]of[[0,-9,5,7],[0,9,5,7],[-9,0,7,5],[9,0,7,5]]){stroke(dark,5,()=>q.ellipse(24+dx,22+dy,rx,ry,0,0,Math.PI*2));stroke('#c8362f',3,()=>q.ellipse(24+dx,22+dy,rx,ry,0,0,Math.PI*2));stroke('#ff8f7a',.8,()=>q.ellipse(24+dx,21.4+dy,rx-1,ry-1,0,Math.PI*1.1,Math.PI*1.8))}
    orb(24,22,4,'#e0b24a');gem(24,22,2,'#e8483f');
    for(const dx of[-3.5,0,3.5]){thin(24+dx*.5,34,24+dx*1.2,45,dark,2.6);thin(24+dx*.5,34,24+dx*1.2,45,dx?'#c8362f':'#e8564a',1.3)}thin(19,41,29,41,'#e0b24a',1.4);break;
  case'fx_bluebell':{
    thin(24,3,24,8,dark,3);stroke(dark,3.4,()=>q.arc(24,8,3.6,0,Math.PI*2));stroke(trim,1.5,()=>q.arc(24,8,3.6,0,Math.PI*2));
    bell(24,24,12.5,'#3f78c8');
    stroke('#cfe6ff',1,()=>{q.arc(24,24,9.6,Math.PI*.1,Math.PI*.9);q.moveTo(15,19);q.quadraticCurveTo(24,15,33,19)});
    stroke('#1c3f78',.9,()=>{q.moveTo(15.4,27);q.quadraticCurveTo(24,31,32.6,27)});
    for(const x of[18,24,30])orb(x,24.6,.9,'#cfe6ff');
    for(const side of[-1,1]){stroke(dark,4,()=>q.ellipse(24+side*6,40,5,3,side*.5,0,Math.PI*2));stroke('#6aa6e8',2.2,()=>q.ellipse(24+side*6,40,5,3,side*.5,0,Math.PI*2));thin(24+side*3,40,24+side*8,45,'#6aa6e8',1.6)}
    orb(24,40,2.6,'#6aa6e8');gem(24,40,1.4,'#f2e6a0');break}
  case'fx_frostgourd':{
    gourd(24,3,'#cfe9f6');
    for(const[cx,cy,sc,rot]of[[8,30,1,-.5],[40,30,1,.5],[13,41,.9,-.15],[35,41,.9,.15],[24,44,1.1,0],[17,17,.7,-.3],[31,17,.7,.3]]){
      for(const[dx,h,w]of[[-2.4,7,2],[0,10,2.4],[2.4,6,1.8]]){q.save();q.translate(cx+dx*sc,cy);q.rotate(rot);const hh=h*sc;
        fp([[-w*sc-.8,0],[0,-hh-1],[w*sc+.8,0]],dark);fp([[-w*sc,0],[0,-hh],[w*sc,0]],lg(0,-hh,0,0,['#ffffff','#bfe6f6','#7fb8d8']));thin(0,-hh+1,0,-1,'rgba(255,255,255,.8)',.7);q.restore()}}
    for(const[x,y,r]of[[19,27,3.4],[29,34,3],[22,38,2.4],[27,21,2.2]])fe(x,y,r,r*.7,'rgba(255,255,255,.55)');
    fp([[20,3],[28,3],[29,8],[19,8]],dark);fp([[21,4],[27,4],[27.6,7],[20.4,7]],'#dff3fb');
    for(const[x,len]of[[17,6],[21,9],[26,7],[30,10]])fp([[x-1.2,9],[x,9+len],[x+1.2,9]],'#eaf8ff');
    gem(24,30,3.2,'#9fd8ff');break}
  case'fx_thunderfan':{
    const R=23,cx=24,cy=40,a0=-158,a1=-22;
    const rim=[[cx,cy]];for(let d=a0;d<=a1;d+=8)rim.push([cx+(R+2)*Math.cos(d*Math.PI/180),cy+(R+2)*Math.sin(d*Math.PI/180)]);fp(rim,dark);
    const N=7,st=(a1-a0)/N;
    for(let i=0;i<N;i++){const s0=(a0+i*st)*Math.PI/180,s1=(a0+(i+1)*st)*Math.PI/180;fp([[cx,cy],[cx+R*Math.cos(s0),cy+R*Math.sin(s0)],[cx+R*Math.cos(s1),cy+R*Math.sin(s1)]],i%2?lg(8,12,40,40,['#4a5072','#242844']):lg(8,12,40,40,['#363c5c','#181b30']))}
    for(let i=0;i<=N;i++){const a=(a0+i*st)*Math.PI/180;thin(cx,cy,cx+R*Math.cos(a),cy+R*Math.sin(a),'#12141f',1.1)}
    stroke('#e6c34a',1.4,()=>q.arc(cx,cy,R-1,a0*Math.PI/180,a1*Math.PI/180));
    fp([[27,14],[19,26],[24,26],[20,35],[30,22],[25,22]],'#ffe45c');thin(20,26,27,22.6,'#fffbd0',.9);
    for(const[x,y]of[[10,26],[38,26],[14,16],[34,15]]){thin(x-2,y,x+2,y,'rgba(255,228,92,.8)',1);thin(x,y-2,x,y+2,'rgba(255,228,92,.8)',1)}
    orb(cx,cy+1.5,2.6,'#e6c34a');thin(cx,cy+3,cx,46,cordHex,2);orb(cx,46,1.4,'#e6c34a');break}
  case'fx_clay':{
    thin(24,2,24,9,cordHex,2);stroke(dark,3,()=>q.arc(24,8,3,0,Math.PI*2));stroke(trim,1.2,()=>q.arc(24,8,3,0,Math.PI*2));
    fe(24,32,11.4,12.6,dark);fe(24,32,10.4,11.6,rg(24,32,10.4,['#eab487','#b86a3c','#6e3820']));
    for(const side of[-1,1]){q.save();q.translate(24+side*9.6,27);q.rotate(side*.55);fe(0,4,3,7,dark);fe(0,4,2.2,6.2,lg(-2,-2,2,10,['#d79a68','#9a5530']));q.restore()}
    fe(24,16,8.2,7.6,dark);fe(24,16,7.4,6.8,rg(24,16,7.4,['#f0bc90','#b86a3c','#7a4026']));
    for(const side of[-1,1]){fe(24+side*6.6,15,1.6,2.4,'#9a5530')}
    fe(21,15.2,1.3,1.6,'#1c120c');fe(27,15.2,1.3,1.6,'#1c120c');itemArtDot(q,21,14,'#fff');itemArtDot(q,27,14,'#fff');
    stroke('#5a2412',1,()=>q.arc(24,17.6,2.6,Math.PI*.15,Math.PI*.85));fe(18.4,18,1.4,1,'rgba(220,90,70,.45)');fe(29.6,18,1.4,1,'rgba(220,90,70,.45)');
    fp([[14,28],[34,28],[33,32],[15,32]],'#e8d6a0');for(let x=17;x<32;x+=4)thin(x,28.4,x+1,31.6,'#c8362f',1);
    for(const[x,y]of[[18,36],[30,38],[22,40],[27,35],[20,30],[28,24]])fe(x,y,.7,.7,'rgba(70,30,14,.5)');
    stroke('#6a2a16',1,()=>q.arc(24,35,5,Math.PI*.2,Math.PI*.8));
    for(const x of[18,30]){fe(x,44,3,1.8,dark);fe(x,43.6,2.4,1.4,'#b86a3c')}
    for(const x of[20,28])orb(x,46,1.2,'#d9483b');break}
  case'fx_herbcoins':
    thin(24,3,24,42,dark,3.2);thin(24,3,24,42,cordHex,1.6);
    for(const y of[9,36])coin(24,y,6.2);
    for(const[rot,col]of[[-1.9,'#5ea04e'],[-1.55,'#7fc86a'],[-1.25,'#4a8c46'],[-2.2,'#7fc86a'],[-.95,'#5ea04e']])leaf(24,24,14,2.6,rot,col);
    for(const[rot,col]of[[1.9,'#4a8c46'],[1.5,'#7fc86a'],[1.15,'#5ea04e']])leaf(24,24,12,2.4,rot,col);
    fe(24,23,4,3.2,'#c8362f');thin(21,22,27,24,'#ff9f90',.8);tassel(24,43,3);break;
  case'fx_holypin':
    pin(5,45,26,22);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;thin(33+Math.cos(a)*6,14+Math.sin(a)*6,33+Math.cos(a)*10.4,14+Math.sin(a)*10.4,i%2?trim:'#fff6d0',1.5)}
    fe(33,14,6.2,6.2,dark);fe(33,14,5.4,5.4,rg(33,14,5.4,['#fff6d0',trim,shade(trim,-60)]));orb(33,14,2.6,'#fff');
    for(const[x,len]of[[28,8],[31,11],[35,9]]){thin(x,19,x-1,19+len,trim,.8);orb(x-1,20+len,1.6,hi)}orb(5,45,2.4,cordHex);break;
  case'fx_oni':
    thin(24,2,24,8,dark,3);stroke(trim,1.4,()=>q.arc(24,8,3,0,Math.PI*2));
    fp([[13,14],[17,3],[21,15]],dark);fp([[27,15],[31,3],[35,14]],dark);fp([[14.2,13.6],[17,5],[20,14.4]],'#f2e2b8');fp([[28,14.4],[31,5],[33.8,13.6]],'#f2e2b8');
    bell(24,27,13,'#a8402f');
    fp([[17,23],[22,24.6],[21,26.6],[16,25]],dark);fp([[31,23],[26,24.6],[27,26.6],[32,25]],dark);fe(19.6,25.2,1.3,1.1,'#ffe090');fe(28.4,25.2,1.3,1.1,'#ffe090');
    fp([[18,32],[30,32],[28,36],[26.4,33.6],[24,36.4],[21.6,33.6],[20,36]],'#fff2d0');tassel(24,40,4,'#2a2030');break;
  case'fx_luckycoin':{
    stroke(dark,3.4,()=>{q.moveTo(4,9);q.quadraticCurveTo(24,32,44,9)});stroke('#c8362f',1.8,()=>{q.moveTo(4,9);q.quadraticCurveTo(24,32,44,9)});
    for(const x of[4,44])orb(x,8,2.2,'#c8362f');
    for(let i=0;i<5;i++){const t=(i+.5)/5,x=(1-t)*(1-t)*4+2*t*(1-t)*24+t*t*44,y=(1-t)*(1-t)*9+2*t*(1-t)*32+t*t*9;coin(x,y+1,5.6)}
    thin(24,26,24,30,'#c8362f',1.6);
    const heart=(x,y,rot)=>{q.save();q.translate(x,y);q.rotate(rot);fe(-1.9,-1.4,2.2,2.4,dark);fe(1.9,-1.4,2.2,2.4,dark);fp([[-4.2,-.6],[0,4.6],[4.2,-.6]],dark);fe(-1.9,-1.4,1.6,1.8,'#5ec65a');fe(1.9,-1.4,1.6,1.8,'#5ec65a');fp([[-3.4,-.2],[0,3.8],[3.4,-.2]],'#4aae4c');thin(0,-.4,0,3,'#d8f6c8',.6);q.restore()};
    for(const[dx,dy,r]of[[-5.6,0,-Math.PI/2],[5.6,0,Math.PI/2],[0,-5.6,Math.PI],[0,5.6,0]])heart(24+dx,38+dy,r);
    orb(24,38,2,'#f2c84a');thin(24,45,27,47,'#3a7a3a',1.5);break}
  case'fx_charmgourd':
    gourd(24,3,'#d9962e');
    fp([[20,3],[28,3],[29,8],[19,8]],dark);fp([[21,4],[27,4],[27.6,7],[20.4,7]],metal(20,3,28,8));
    q.save();q.translate(24,28);q.rotate(-.35);fp([[-4.6,-14],[4.6,-14],[4.6,14],[-4.6,14]],dark);fp([[-3.6,-13],[3.6,-13],[3.6,13],[-3.6,13]],lg(-4,-13,4,13,['#fff8dc','#f2e2a8']));
    for(const y of[-9,-3,3,9])thin(-2,y,2,y+.6,'#c8362f',1.1);thin(0,-12,0,12,'#c8362f',.9);q.restore();
    stroke(cordHex,1.8,()=>{q.moveTo(16,22);q.quadraticCurveTo(24,25,32,22)});tassel(33,24,8,'#c8362f');break;
  case'fx_thornball':
    thin(24,2,24,12,'#2a2030',2.4);orb(24,13,2.6,'#2a2030');
    for(let i=0;i<14;i++){const a=i*Math.PI*2/14+.2,x=24+Math.cos(a)*9,y=26+Math.sin(a)*9;fp([[x-Math.sin(a)*1.8,y+Math.cos(a)*1.8],[24+Math.cos(a)*15,26+Math.sin(a)*15],[x+Math.sin(a)*1.8,y-Math.cos(a)*1.8]],i%2?'#6a4a38':'#4a3226')}
    fe(24,26,10.6,10.6,dark);fe(24,26,9.6,9.6,rg(24,26,9.6,['#8a6a52','#4a3226','#241810']));
    for(const[a,b,c,d]of[[18,22,26,30],[30,20,20,28],[28,32,22,22]])thin(a,b,c,d,'#9a7a60',.8);orb(24,26,3,'#d9483b');itemArtDot(q,23,25,'#ffe0d8');tassel(24,40,5,'#2a2030');break;
  case'fx_bloodbell':{
    thin(24,3,24,8,dark,3);stroke(dark,3.4,()=>q.arc(24,8,3.6,0,Math.PI*2));stroke(trim,1.5,()=>q.arc(24,8,3.6,0,Math.PI*2));
    bell(22,22,11.5,'#b8302a');
    stroke('#ff9a8a',1,()=>q.arc(22,22,8.6,Math.PI*1.05,Math.PI*1.45));
    stroke('#ff4a4a',1.6,()=>{q.moveTo(16,31);q.lineTo(16,36)});stroke('#ff4a4a',1.6,()=>{q.moveTo(28,32);q.lineTo(28,38)});orb(16,37,1.5,'#ff5a5a');orb(28,39,1.6,'#ff5a5a');
    for(const[x,y,s]of[[37,17,1.2],[34,29,1],[39,38,1.4]]){fp([[x,y-4*s],[x+2.8*s,y+.4*s],[x+2*s,y+3.2*s],[x,y+4.2*s],[x-2*s,y+3.2*s],[x-2.8*s,y+.4*s]],dark);fp([[x,y-3.2*s],[x+2*s,y+.4*s],[x+1.4*s,y+2.6*s],[x,y+3.4*s],[x-1.4*s,y+2.6*s],[x-2*s,y+.4*s]],lg(x-2,y-3,x+2,y+4,['#ff8a8a','#d8262a','#8a1418']));fe(x-.8*s,y-.2*s,.7*s,1.1*s,'rgba(255,255,255,.7)')}
    break}
  case'fx_crystalfan':{
    const R=26;
    for(let i=0;i<7;i++){const a0=(-155+i*17.8)*Math.PI/180,a1=(-155+(i+1)*17.8)*Math.PI/180,am=(a0+a1)/2,tip=R+(i%2?4:0);
     fp([[24,43],[24+R*Math.cos(a0),43+R*Math.sin(a0)],[24+tip*Math.cos(am),43+tip*Math.sin(am)],[24+R*Math.cos(a1),43+R*Math.sin(a1)]],dark);
     const k=.93;fp([[24,43],[24+R*k*Math.cos(a0),43+R*k*Math.sin(a0)],[24+(tip-1.4)*Math.cos(am),43+(tip-1.4)*Math.sin(am)],[24+R*k*Math.cos(a1),43+R*k*Math.sin(a1)]],lg(10,10,38,43,i%2?['#eaf8ff','#8fc6e8','#5a94c0']:['#cfeaf8','#6aa6d0','#3f78a8']));
     thin(24,43,24+(tip-2)*Math.cos(am),43+(tip-2)*Math.sin(am),'rgba(255,255,255,.7)',.8)}
    for(const[x,y]of[[10,12],[38,10],[24,6]]){thin(x-2,y,x+2,y,'#fff',1);thin(x,y-2,x,y+2,'#fff',1)}orb(24,44.5,2.4,trim);thin(24,45,24,47,cordHex,2);break}
  case'fx_powdergourd':
    gourd(24,6,'#7a4a2a');
    fp([[20,6],[28,6],[29,11],[19,11]],dark);fp([[21,7],[27,7],[27.6,10],[20.4,10]],'#3a2a20');
    stroke('#d9b878',1.2,()=>{q.moveTo(24,6);q.quadraticCurveTo(28,3,30,6);q.quadraticCurveTo(32,8,34,4)});
    for(const[x,y,r]of[[34.4,3.4,2.4],[36,6,1.2]])orb(x,y,r,'#ffb040');
    for(const[a,b,c,d]of[[35,1,38,0],[37,3,41,3],[34,0,35,-2]])thin(a,b,c,d,'#ffd890',1);
    for(const[x,y]of[[19,31],[24,36],[30,32],[22,28],[27,38]])orb(x,y,1.1,'#2a2020');
    stroke('#c88a5a',1,()=>q.arc(24,33,8,Math.PI*.15,Math.PI*.85));tassel(33,25,8,'#8a5a3a');break;
  case'fx_mirrororb':
    fp([[14,41],[34,41],[31,45],[17,45]],dark);fp([[15,41.6],[33,41.6],[30.4,44],[17.6,44]],metal(14,41,34,45));
    fe(24,22,17,17,dark);fe(24,22,16,16,rg(24,22,16,['#f4f8ff','#a9bedc','#4a5f8a']));
    {const P=[[24,6],[38,14],[38,30],[24,38],[10,30],[10,14]];stroke('rgba(255,255,255,.65)',.9,()=>{P.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();for(const[x,y]of P){q.moveTo(24,22);q.lineTo(x,y)}});
    fp([[24,22],[24,6],[38,14]],'rgba(255,255,255,.35)');fp([[24,22],[10,30],[24,38]],'rgba(60,80,130,.35)');fp([[24,22],[38,30],[38,14]],'rgba(200,220,255,.25)')}
    gem(24,22,3,'#bfe6ff');break;
  case'fx_voidorb':
    fp([[15,42],[33,42],[30,46],[18,46]],dark);fp([[16,42.6],[32,42.6],[29.4,45],[18.6,45]],metal(15,42,33,46));
    fe(24,23,17,17,dark);fe(24,23,16,16,rg(24,23,16,['#bff5dc',c1,c2]));
    fe(24,23,9.4,9.4,'#0a0f10');stroke('#7fe0c0',1.2,()=>{for(let t=0;t<=Math.PI*3.4;t+=.2){const r=.8+t*.78,x=24+Math.cos(t)*r,y=23+Math.sin(t)*r;t?q.lineTo(x,y):q.moveTo(x,y)}});
    leaf(21,15,7,1.8,.5,'#7fe0a0');stroke('rgba(255,255,255,.5)',1.3,()=>q.arc(24,23,13.5,Math.PI*1.05,Math.PI*1.4));gem(24,23,1.8,'#bfffe6');break;
  case'fx_whitelotus':
    fe(24,22,18,18,'rgba(236,240,255,.22)');stroke('#eef2ff',1.4,()=>q.arc(24,22,17,Math.PI*1.15,Math.PI*1.85));
    thin(24,46,24,34,dark,4);thin(24,46,24,34,'#5e8a5a',2);leaf(20,43,11,2.6,-2.6,'#5e8a5a');leaf(28,43,11,2.6,-.5,'#5e8a5a');
    for(const[dx,rot]of[[-12,-1.15],[12,1.15],[-7,-.7],[7,.7]]){q.save();q.translate(24+dx,29);q.rotate(rot);fe(0,-1,4.6,10,dark);fe(0,-1,3.8,9.2,lg(-4,-10,4,8,['#ffffff','#f2eef8','#d6cfe6']));thin(0,-7,0,5,'#d6cfe6',.7);q.restore()}
    for(const dx of[-3.6,3.6]){q.save();q.translate(24+dx,25);q.rotate(dx*.1);fe(0,0,4.2,10,dark);fe(0,0,3.4,9.2,lg(-4,-9,4,9,['#ffffff','#faf6ff','#e4def0']));q.restore()}
    fe(24,23,5,11.4,dark);fe(24,23,4.2,10.6,lg(20,12,28,34,['#ffffff','#f8f4ff','#ded6ee']));thin(24,15,24,31,'#d0c6e0',.8);
    gem(24,30,3.2,'#f4f0ff');for(const[x,y]of[[10,36],[38,36],[24,5]])orb(x,y,1.7,'#fff');break;
  case'fx_dewpin':{
    pin(4,45,25,23);
    fp([[24,26],[29,22],[34,23],[33,28],[28,29]],'#3f7a4a');
    for(const[rot,col,len,w]of[[-2.1,'#8fc0f0',11,4],[-.5,'#8fc0f0',11,4],[-1.75,'#bfe0ff',13,4.6],[-.95,'#bfe0ff',13,4.6],[-1.35,'#eaf6ff',15,5.2]]){q.save();q.translate(30,24);q.rotate(rot);fe(len/2,0,len/2+1,w/2+1,dark);fe(len/2,0,len/2,w/2,lg(0,-w/2,len,w/2,[shade(col,40),col,shade(col,-35)]));thin(1,0,len-1,0,'rgba(255,255,255,.7)',.7);q.restore()}
    gem(30,23,1.8,'#fff0a0');
    for(const[x,len]of[[26,10],[30,14],[34,9]]){thin(x,26,x-.5,26+len,trim,.8);const y=27+len;fp([[x-.5,y-3.4],[x+1.8,y],[x-.5,y+2.4],[x-2.8,y]],dark);fp([[x-.5,y-2.6],[x+1.2,y],[x-.5,y+1.6],[x-2.2,y]],lg(x-2,y-3,x+2,y+2,['#eaf8ff','#8fc6e8']));orb(x-1.2,y-.6,.6,'#fff')}
    orb(4,45,2.4,cordHex);break}
  default:orb(24,24,8,c1)}
}
