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
const CHARM_SHAPES_BY_SLOT={relic:['ring','beads','plaque','mirror','seal','bracelet'],trinket:['norigae','bell','gourd','coins','fan','hairpin']};
const CHARM_SHAPE_NAME={ring:'반지',beads:'염주',plaque:'옥패',mirror:'거울',seal:'인장',bracelet:'팔찌',norigae:'노리개',bell:'방울',gourd:'호리병',coins:'엽전 꿰미',fan:'부채',hairpin:'비녀',orb:'보주',lotus:'연화'};
const CHARM_FLAVOR={ring:'손가락에 맞춰 두면 은은한 기운이 돈다.',beads:'한 알씩 굴릴 때마다 호흡이 가라앉는다.',plaque:'뒷면에 닳은 주문이 새겨진 패.',mirror:'비추는 쪽의 기운을 되받는 작은 거울.',seal:'찍는 자의 뜻을 새기는 작은 도장.',bracelet:'팔목을 감싸는 얇은 고리.',norigae:'매듭마다 소원이 묶인 노리개.',bell:'소리가 닿는 곳까지 액을 쫓는다.',gourd:'마개를 열면 어디선가 약초 냄새가 난다.',coins:'꿰미째 들면 쨍그랑 소리가 난다.',fan:'펼칠 때마다 바람의 결이 달라진다.',hairpin:'머리에 꽂아 두는 가는 장식.',orb:'쥐고 있으면 손바닥이 따뜻해지는 구슬.',lotus:'꽃잎이 한 겹씩 천천히 열린다.'};
const CHARM_PREFIX_SPECIAL={regenEvery:'생명',killHeal:'피빛',killFocus:'기맥',thorns:'가시',lowHpAtk:'배수',lowHpDef:'결사',critAdd:'쾌검',moveMul:'신속',atkCostMul:'속공',statusGuard:'불침',strike:'격발',atk:'맹호',def:'철벽',eva:'그림자',will:'명경',vision:'천리',focus:'기맥'};
const CHARM_QUIRKS={
  chainBurst:{name:'연쇄 폭죽',desc:'격파 시 인접한 적에게 화염 3',prefix:'폭죽'},
  luckyMend:{name:'요행',desc:'피격 시 12% 확률로 받은 피해를 전부 회복',prefix:'요행'},
  lastStand:{name:'불굴',desc:'층마다 한 번, HP 20% 이하가 되면 HP 30% 회복',prefix:'불굴'},
  feast:{name:'탐식',desc:'격파 시 8% 확률로 말린 육포를 떨어뜨림',prefix:'탐식'},
  frostWard:{name:'서리 방벽',desc:'근접 피격 시 15% 확률로 공격자 기절 1턴',prefix:'서리'}
};
const CHARM_PREMIUM_PREFIX=['천면','명경','청명','월광','운무'];
const CHARM_STATS=['atk','def','eva','will','vision','focus'];
const CHARM_STAT_LABEL={focus:'기력'};

function charmPct(v){return Math.round(v*100)}
function charmGear(){const p=state?.player;return[p?.relic,p?.trinket].filter(Boolean)}
function charmSum(key){let n=0;for(const g of charmGear())n+=Number(g[key])||0;return n}
function charmMul(key){let n=1;for(const g of charmGear())if(Number.isFinite(g[key]))n*=g[key];return n}
function charmBest(key){let n=0;for(const g of charmGear()){const v=Number(g[key])||0;if(v>0&&(!n||v<n))n=v}return n}

/* ---- trait text: shared by item details, randart flavor and the codex ---- */
function resistChipText(element,level){return`${RESIST_NAMES57[element]||element} ${level<0?'취약':'저항'} ${level<0?'Ⅰ':'Ⅰ Ⅱ Ⅲ'.split(' ')[Math.min(3,level)-1]}`}
function charmTraitLines(item){
  const out=[];if(!item)return out;
  if(item.focus)out.push(`기력 ${item.focus>0?'+':''}${item.focus}`);
  for(const[el,lv]of Object.entries(item.resist||{}))if(lv)out.push(resistChipText(el,lv));
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
  return out;
}

/* ---- hooks (one per pipeline; each reads the same trait fields) ---- */
function charmStats(s){
  const p=state?.player;if(!p)return s;
  s.critBonus=(s.critBonus||0)+charmSum('critAdd');
  if(p.hp<=p.maxHp*.4){s.atk+=charmSum('lowHpAtk');s.def+=charmSum('lowHpDef')}
  return s;
}
function charmMoveCost(c){return c*charmMul('moveMul')}
function charmAttackCost(c){return c*charmMul('atkCostMul')}
function charmPostTurn(){
  const p=state?.player;if(!p||state.dead||state.victory)return;
  const every=charmBest('regenEvery');if(every&&state.turn%every===0&&p.hp<p.maxHp)recoverCombatHealth(p,1);
}
function charmOnKill(mon){
  const p=state?.player;if(!p||p.hp<=0||mon?.lastDamageOpponent57!=='player')return;
  const heal=charmSum('killHeal'),focus=charmSum('killFocus');
  for(const g of charmGear()){
    if(g.quirk==='chainBurst')for(const n of [...state.monsters])if(n!==mon&&n.hp>0&&entityDistance57(n,mon)<=1&&factionsHostile57(entityFaction(p),entityFaction(n)))resolveElementDamage57(n,'fire',3,{effect:effectSource57(p),source:g.name,color:CHARM_GEM.fire});
    if(g.quirk==='feast'&&globalThis.__MANRU_RANDOM57__()<.08){const food=foodDef('말린 육포');if(food)PlacementService.placeItem({...clone(food),count:1},{x:mon.x,y:mon.y})}
  }
  if(heal>0&&p.hp<p.maxHp){const g=recoverCombatHealth(p,heal);if(g>0)floatText(p.x,p.y,`+${g}`,'#e08a7a',9)}
  if(focus>0&&Number.isFinite(p.focus))p.focus=Math.min(getStats().maxFocus,p.focus+focus);
}
function charmOnHurt(source,amount){
  const p=state?.player;if(!p||amount<=0)return;
  for(const g of charmGear()){
    if(g.quirk==='luckyMend'&&p.hp>0&&globalThis.__MANRU_RANDOM57__()<.12){const back=recoverCombatHealth(p,amount);if(back>0)floatText(p.x,p.y,'요행','#e6d49a',10)}
    if(g.quirk==='lastStand'&&p.hp>0&&p.hp<=p.maxHp*.2&&p.lastStandFloor!==state.floor){p.lastStandFloor=state.floor;recoverCombatHealth(p,Math.ceil(p.maxHp*.3));floatText(p.x,p.y,'불굴','#e6d49a',12);addLog(`${g.name}이 몸을 일으켜 세웠다.`)}
    if(g.quirk==='frostWard'&&source&&source!==p&&source.hp>0&&entityDistance57(source,p)<=1&&!source.boss&&globalThis.__MANRU_RANDOM57__()<.15)applyCombatStatus(source,'stun',1,1,{source:p,element:'ice',stagger:true});
  }
  const thorns=charmSum('thorns');
  if(!p||!(thorns>0)||!source||source===p||source.hp<=0||amount<=0||entityDistance57(source,p)>1||!factionsHostile57(entityFaction(p),entityFaction(source)))return;
  const dealt=damageEntity(source,thorns,p);if(dealt>0){floatText(source.x,source.y,`반격 -${dealt}`,'#d6b77d',9);if(source.hp<=0)killMonster(source)}
}
function charmStatusGuard(){
  const chance=Math.min(.75,charmSum('statusGuard'));
  if(chance>0&&globalThis.__MANRU_RANDOM57__()<chance){floatText(state.player.x,state.player.y,'불침','#b9d7cd',9);return true}
  return false;
}
function charmStrike(target,actor){
  if(actor!==state?.player||!target||target.hp<=0)return;
  for(const g of charmGear())if(g.strike&&target.hp>0)resolveElementDamage57(target,g.strike.element,g.strike.dmg,{contactHandled105:true,effect:effectSource57(actor),source:g.name,color:CHARM_GEM[g.strike.element]});
}

/* ---- randart roller ---- */
function makeRandart(slot,tier=3,opts={},rnd=()=>globalThis.__MANRU_RANDOM57__()){
  const pick=a=>a[Math.floor(rnd()*a.length)],chance=p=>rnd()<p,shuffle=a=>a.map(v=>[rnd(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  tier=Math.max(1,Math.min(5,Math.round(tier)));
  const it={type:slot,randart:true,tier,rarity:tier>=5?'sealed':tier>=3?'relic':'rare',identified:true,curseImmune991:true,count:1,resist:{}};
  const premium=!!opts.premium,elems=shuffle(RESIST_ELEMENTS57),roll=rnd(),resistCount=premium?3:roll<.3?1:roll<.75?2:3;
  for(const el of elems.slice(0,resistCount))it.resist[el]=1;
  if(premium){it.resist[elems[0]]=2;it.premium=true;it.rarity='sealed';it.tier=5}
  const mainKey=pick(CHARM_STATS),statValue={atk:1+(tier>=3?1:0)+(tier>=5?1:0),def:1+(tier>=3?1:0),eva:1+(tier>=2?1:0)+(tier>=4?1:0),will:1+(tier>=3?1:0),vision:1+(tier>=4?1:0),focus:tier>=3?3:2};
  it[mainKey]=statValue[mainKey];
  if(chance(.5)){const k=pick(CHARM_STATS.filter(x=>x!==mainKey));it[k]=Math.max(1,statValue[k]-1)}
  const drawback=!premium&&chance(.3);
  if(drawback){
    const rest=elems.slice(resistCount);
    if(rest.length&&chance(.6))it.resist[rest[0]]=-1;
    else{const k=pick(['vision','eva','def'].filter(x=>!it[x]));if(k)it[k]=-1}
  }
  let specialCount=premium?2:(tier>=3?(chance(.5)?2:1):(chance(.6)?1:0))+(drawback?1:0);specialCount=Math.min(3,specialCount);
  const specials={
    regenEvery:()=>Math.max(5,11-tier),killHeal:()=>1+(tier>=4?1:0),killFocus:()=>1+(tier>=3?1:0),thorns:()=>1+(tier>=3?1:0),
    lowHpAtk:()=>2+(tier>=4?1:0),lowHpDef:()=>2,critAdd:()=>.03+.01*(tier-1),moveMul:()=>+(1-(.03+.01*(tier-1))).toFixed(2),
    atkCostMul:()=>+(1-(.03+.01*(tier-1))).toFixed(2),statusGuard:()=>+(.15+.03*tier).toFixed(2),
    strike:()=>({element:pick(Object.keys(it.resist).filter(e=>it.resist[e]>0)||['fire']),dmg:2+(tier>=4?1:0)})
  };
  for(const key of shuffle(Object.keys(specials)).slice(0,specialCount))it[key]=specials[key]();
  if(it.strike&&!it.strike.element)it.strike.element=pick(RESIST_ELEMENTS57);
  if(premium||(tier>=2&&chance(.28)))it.quirk=pick(Object.keys(CHARM_QUIRKS));
  const posResist=Object.keys(it.resist).filter(e=>it.resist[e]>0),dominant=posResist[0]||null;
  const specialKey=Object.keys(specials).find(k=>it[k]);
  const mat=premium?pick(['gold','silver','pearl','rosegold','amethyst','azure']):pick(dominant&&chance(.65)?CHARM_ELEM_MATERIAL[dominant]:Object.keys(CHARM_MATERIALS)),shape=premium?(slot==='relic'?'orb':'lotus'):pick(CHARM_SHAPES_BY_SLOT[slot]),gemKey=dominant&&chance(.6)?dominant:pick(CHARM_JEWELS),cordKey=pick(Object.keys(CHARM_CORDS));
  const prefix=premium?pick(CHARM_PREMIUM_PREFIX):dominant?CHARM_ELEM_PREFIX[dominant]:(CHARM_PREFIX_SPECIAL[specialKey]||CHARM_PREFIX_SPECIAL[mainKey]||'무명');
  it.name=`${prefix} ${CHARM_MATERIALS[mat].name} ${CHARM_SHAPE_NAME[shape]}`;
  it.art={shape,mat,gem:gemKey,cord:cordKey,glyph:dominant?CHARM_GLYPH[dominant]:'',premium};
  it.desc=`${CHARM_MATERIALS[mat].name}으로 빚은 ${CHARM_SHAPE_NAME[shape]}. ${CHARM_FLAVOR[shape]}`;
  if(!Object.keys(it.resist).length)delete it.resist;
  return it;
}
function charmDrop(pool){
  const fixed=pool.filter(x=>!x.randart);
  if(globalThis.__MANRU_RANDOM57__()<.55||!fixed.length){const slot=globalThis.__MANRU_RANDOM57__()<.5?'relic':'trinket';return makeRandart(slot,Math.max(1,Math.min(5,tierForFloor())))}
  return clone(choice(fixed));
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
  switch(a.shape){
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
  default:{
    ringStroke(24,33,12.5,8,[[8,dark],[5,lg(12,26,36,41,[hi,c1,c2])]]);ringStroke(24,33,12.5,8,[[.9,hi]]);
    for(let i=0;i<8;i++){const t=Math.PI*(.15+i*.1);thin(24+Math.cos(t)*12.5-1.4,33+Math.sin(t)*8,24+Math.cos(t)*12.5+1.4,33+Math.sin(t)*8,shade(c2,-20),1)}
    fp([[14,24],[18,14],[30,14],[34,24],[24,29]],dark);fp([[15.6,24],[19,15.2],[29,15.2],[32.4,24],[24,27.6]],metal(14,14,34,29));gem(24,20.5,5);orb(12.5,31,2.2,shade(g,-10));orb(35.5,31,2.2,shade(g,-10))}
  }
  if(a.premium){stroke(trim,1,()=>q.rect(2.5,2.5,43,43));for(const[x,y,r]of[[7,8,2.4],[41,10,1.8],[8,38,1.6],[40,34,2.2]]){thin(x-r*1.6,y,x+r*1.6,y,'#fff6d6',1);thin(x,y-r*1.6,x,y+r*1.6,'#fff6d6',1);itemArtDot(q,Math.round(x),Math.round(y),'#ffffff')}}
  if(a.glyph&&a.shape!=='plaque'){fe(38,38,6.4,6.4,dark);fe(38,38,5.5,5.5,lg(32,32,44,44,[shade(g,-60),shade(g,-110)]));stroke(trim,.9,()=>q.arc(38,38,5.5,0,Math.PI*2));q.fillStyle='#fbf0d2';q.font='900 9px serif';q.textAlign='center';q.fillText(a.glyph,38,41);q.textAlign='start'}
}
