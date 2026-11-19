/* ===== 유물·장신구 접사 엔진 + 랜다트 =====
   Relics and trinkets carry flat trait fields (stats, `resist`, specials). Fixed catalog items and
   randarts share the same fields, so every hook below reads one shape. Resistance itself is owned by
   elements.js (gearResistLevel); this file owns the specials, the randart roller and the charm icons. */
const CHARM_GLYPH={fire:'火',water:'水',ice:'氷',shock:'雷',earth:'土',grass:'木',holy:'聖'};
const CHARM_GEM={fire:'#d0613c',water:'#4a9fbd',ice:'#a6cbdc',shock:'#d4b648',earth:'#b48850',grass:'#76ad58',holy:'#e3d198'};
const CHARM_MATERIALS={
  jade:{name:'비취',c1:'#5f9d89',c2:'#244a3f'},gold:{name:'황금',c1:'#c9a24f',c2:'#5e4719'},silver:{name:'백은',c1:'#b9c1c4',c2:'#4b545a'},
  bronze:{name:'청동',c1:'#9a6a42',c2:'#41271a'},ebony:{name:'흑단',c1:'#4e4254',c2:'#1a141d'},ruby:{name:'적옥',c1:'#a8453f',c2:'#4a1714'},
  azure:{name:'청금석',c1:'#4f7fae',c2:'#1c3452'},amber:{name:'호박',c1:'#c58a3b',c2:'#5e3a12'},amethyst:{name:'자수정',c1:'#85689f',c2:'#35204f'}
};
const CHARM_ELEM_MATERIAL={fire:['ruby','bronze','amber'],water:['azure','jade'],ice:['silver','azure'],shock:['gold','amethyst'],earth:['amber','bronze','ebony'],grass:['jade','ebony'],holy:['silver','gold']};
const CHARM_ELEM_PREFIX={fire:'염화',water:'청류',ice:'한빙',shock:'뇌명',earth:'암맥',grass:'녹음',holy:'성광'};
const CHARM_SHAPES_BY_SLOT={relic:['ring','beads','plaque','mirror','seal','bracelet'],trinket:['norigae','bell','gourd','coins','fan','hairpin']};
const CHARM_SHAPE_NAME={ring:'반지',beads:'염주',plaque:'옥패',mirror:'거울',seal:'인장',bracelet:'팔찌',norigae:'노리개',bell:'방울',gourd:'호리병',coins:'엽전 꿰미',fan:'부채',hairpin:'비녀'};
const CHARM_FLAVOR={ring:'손가락에 맞춰 두면 은은한 기운이 돈다.',beads:'한 알씩 굴릴 때마다 호흡이 가라앉는다.',plaque:'뒷면에 닳은 주문이 새겨진 패.',mirror:'비추는 쪽의 기운을 되받는 작은 거울.',seal:'찍는 자의 뜻을 새기는 작은 도장.',bracelet:'팔목을 감싸는 얇은 고리.',norigae:'매듭마다 소원이 묶인 노리개.',bell:'소리가 닿는 곳까지 액을 쫓는다.',gourd:'마개를 열면 어디선가 약초 냄새가 난다.',coins:'꿰미째 들면 쨍그랑 소리가 난다.',fan:'펼칠 때마다 바람의 결이 달라진다.',hairpin:'머리에 꽂아 두는 가는 장식.'};
const CHARM_PREFIX_SPECIAL={regenEvery:'생명',killHeal:'피빛',killFocus:'기맥',thorns:'가시',lowHpAtk:'배수',lowHpDef:'결사',critAdd:'쾌검',moveMul:'신속',atkCostMul:'속공',statusGuard:'불침',strike:'격발',atk:'맹호',def:'철벽',eva:'그림자',will:'명경',vision:'천리',focus:'기맥'};
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
  if(heal>0&&p.hp<p.maxHp){const g=recoverCombatHealth(p,heal);if(g>0)floatText(p.x,p.y,`+${g}`,'#e08a7a',9)}
  if(focus>0&&Number.isFinite(p.focus))p.focus=Math.min(getStats().maxFocus,p.focus+focus);
}
function charmOnHurt(source,amount){
  const p=state?.player,thorns=charmSum('thorns');
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
function makeRandart(slot,tier=3,rnd=()=>globalThis.__MANRU_RANDOM57__()){
  const pick=a=>a[Math.floor(rnd()*a.length)],chance=p=>rnd()<p,shuffle=a=>a.map(v=>[rnd(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  tier=Math.max(1,Math.min(5,Math.round(tier)));
  const it={type:slot,randart:true,tier,rarity:tier>=5?'sealed':tier>=3?'relic':'rare',identified:true,curseImmune991:true,count:1,resist:{}};
  const elems=shuffle(RESIST_ELEMENTS57),resistCount=2+(chance(.35)?1:0);
  for(const el of elems.slice(0,resistCount))it.resist[el]=1;
  const mainKey=pick(CHARM_STATS),statValue={atk:1+(tier>=3?1:0)+(tier>=5?1:0),def:1+(tier>=3?1:0),eva:1+(tier>=2?1:0)+(tier>=4?1:0),will:1+(tier>=3?1:0),vision:1+(tier>=4?1:0),focus:tier>=3?3:2};
  it[mainKey]=statValue[mainKey];
  if(chance(.5)){const k=pick(CHARM_STATS.filter(x=>x!==mainKey));it[k]=Math.max(1,statValue[k]-1)}
  const drawback=chance(.3);
  if(drawback){
    const rest=elems.slice(resistCount);
    if(rest.length&&chance(.6))it.resist[rest[0]]=-1;
    else{const k=pick(['vision','eva','def'].filter(x=>!it[x]));if(k)it[k]=-1}
  }
  let specialCount=(tier>=3?(chance(.5)?2:1):(chance(.6)?1:0))+(drawback?1:0);specialCount=Math.min(3,specialCount);
  const specials={
    regenEvery:()=>Math.max(5,11-tier),killHeal:()=>1+(tier>=4?1:0),killFocus:()=>1+(tier>=3?1:0),thorns:()=>1+(tier>=3?1:0),
    lowHpAtk:()=>2+(tier>=4?1:0),lowHpDef:()=>2,critAdd:()=>.03+.01*(tier-1),moveMul:()=>+(1-(.03+.01*(tier-1))).toFixed(2),
    atkCostMul:()=>+(1-(.03+.01*(tier-1))).toFixed(2),statusGuard:()=>+(.15+.03*tier).toFixed(2),
    strike:()=>({element:pick(Object.keys(it.resist).filter(e=>it.resist[e]>0)||['fire']),dmg:2+(tier>=4?1:0)})
  };
  for(const key of shuffle(Object.keys(specials)).slice(0,specialCount))it[key]=specials[key]();
  if(it.strike&&!it.strike.element)it.strike.element=pick(RESIST_ELEMENTS57);
  const posResist=Object.keys(it.resist).filter(e=>it.resist[e]>0),dominant=posResist[0]||null;
  const specialKey=Object.keys(specials).find(k=>it[k]);
  const mat=pick(dominant?CHARM_ELEM_MATERIAL[dominant]:Object.keys(CHARM_MATERIALS)),shape=pick(CHARM_SHAPES_BY_SLOT[slot]);
  const prefix=dominant?CHARM_ELEM_PREFIX[dominant]:(CHARM_PREFIX_SPECIAL[specialKey]||CHARM_PREFIX_SPECIAL[mainKey]||'무명');
  it.name=`${prefix} ${CHARM_MATERIALS[mat].name} ${CHARM_SHAPE_NAME[shape]}`;
  it.art={shape,mat,gem:dominant||'',glyph:dominant?CHARM_GLYPH[dominant]:''};
  it.desc=`${CHARM_MATERIALS[mat].name}으로 빚은 ${CHARM_SHAPE_NAME[shape]}. ${CHARM_FLAVOR[shape]}`;
  if(!Object.keys(it.resist).length)delete it.resist;
  return it;
}
function charmDrop(pool){
  const fixed=pool.filter(x=>!x.randart);
  if(globalThis.__MANRU_RANDOM57__()<.55||!fixed.length){const slot=globalThis.__MANRU_RANDOM57__()<.5?'relic':'trinket';return makeRandart(slot,Math.max(1,Math.min(5,tierForFloor())))}
  return clone(choice(fixed));
}

/* ---- icons: twelve silhouettes × nine materials × gem/element glyph ---- */
function drawCharmArt(q,it){
  const a=it.art||{},m=CHARM_MATERIALS[a.mat]||CHARM_MATERIALS.gold,c1=m.c1,c2=m.c2,g=CHARM_GEM[a.gem]||'#d9c58a',hi=shade(c1,42),dark='#17110e',gold='#d6b872';
  const gemAt=(x,y,r)=>{ell(q,dark,x,y,r+1.3,r+1.3);ell(q,shade(g,-38),x,y,r,r);ell(q,g,x-.4,y-.4,r*.74,r*.74);ell(q,shade(g,72),x-r*.32,y-r*.32,r*.3,r*.3)};
  const ring=(cx,cy,rx,ry,cols)=>{q.save();for(const[lw,col]of cols){q.lineWidth=lw;q.strokeStyle=col;q.beginPath();q.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);q.stroke()}q.restore()};
  switch(a.shape){
  case'beads':{
    for(let i=1;i<12;i++){const t=i/12*Math.PI*2+Math.PI/2,x=24+Math.cos(t)*13,y=21+Math.sin(t)*12;ell(q,dark,x,y,4.6,4.6);ell(q,i%3===0?g:c1,x,y,3.5,3.5);itemArtDot(q,x-1,y-1,hi)}
    ell(q,dark,24,33,6.5,6.5);ell(q,c2,24,33,5.5,5.5);gemAt(24,33,4);itemArtDot(q,22,31,'#ffffff');line(q,24,39,24,45,c2,2);break}
  case'plaque':
    line(q,24,2,24,10,g,2);poly(q,dark,[[13,10],[35,10],[38,16],[38,33],[24,43],[10,33],[10,16]]);poly(q,c2,[[14,11],[34,11],[37,17],[37,32],[24,41],[11,32],[11,17]]);poly(q,c1,[[16,14],[32,14],[34,18],[34,30],[24,38],[14,30],[14,18]]);
    line(q,19,22,29,22,gold,1);line(q,24,17,24,31,gold,1);gemAt(24,26,3.5);itemArtDot(q,23,25,'#ffffff');break;
  case'mirror':
    poly(q,dark,[[20,33],[28,33],[29,44],[19,44]]);rect(q,21,34,6,9,c1);ell(q,dark,24,20,15,15);ell(q,c1,24,20,14,14);ell(q,c2,24,20,11,11);ell(q,'#cfe6ea',24,20,10,10);
    poly(q,'rgba(255,255,255,.6)',[[16,15],[22,10],[27,11],[18,25]]);gemAt(24,34,3.2);break;
  case'seal':
    poly(q,dark,[[10,26],[38,26],[38,41],[10,41]]);rect(q,11,27,26,13,c1);rect(q,11,27,26,3,hi);rect(q,11,37,26,3,c2);rect(q,14,32,20,2,gold);
    poly(q,dark,[[16,27],[18,14],[24,8],[30,14],[32,27]]);poly(q,c1,[[17,27],[19,15],[24,10],[29,15],[31,27]]);poly(q,c2,[[24,10],[29,15],[31,27],[24,27]]);gemAt(24,18,3.2);itemArtDot(q,23,17,'#ffffff');break;
  case'bracelet':
    ring(24,26,14,11,[[10,dark],[7,c2],[5,c1]]);
    for(let i=0;i<9;i++){const t=i/9*Math.PI*2,x=24+Math.cos(t)*14,y=26+Math.sin(t)*11;ell(q,c2,x,y,1.4,1.4)}
    ring(24,26,14,11,[[1,hi]]);ell(q,dark,24,37,5,4.2);ell(q,g,24,37,3.6,3.2);itemArtDot(q,23,36,'#ffffff');break;
  case'norigae':
    line(q,24,14,24,23,c2,2);ell(q,dark,24,9,6.5,6.5);gemAt(24,9,5.5);ell(q,c1,24,9,3.2,3.2);itemArtDot(q,22,7,'#ffffff');
    poly(q,dark,[[17,22],[31,22],[34,28],[24,35],[14,28]]);poly(q,c1,[[18,23],[30,23],[32,28],[24,33],[16,28]]);gemAt(24,28,2.8);
    for(const[x1,x2,col]of[[20,15,c2],[24,24,g],[28,33,c2]]){line(q,x1,34,x2,44,col,2);ell(q,c1,x2,44,2.2,2.2)}break;
  case'bell':
    q.save();q.strokeStyle=dark;q.lineWidth=3.4;q.beginPath();q.arc(24,8,4,0,Math.PI*2);q.stroke();q.strokeStyle=c2;q.lineWidth=1.6;q.stroke();q.restore();
    poly(q,dark,[[12,35],[15,20],[24,12],[33,20],[36,35]]);poly(q,c1,[[15,34],[17,21],[24,14],[31,21],[33,34]]);poly(q,c2,[[24,14],[31,21],[33,34],[24,34]]);
    rect(q,12,34,24,3,dark);rect(q,13,35,22,2,c1);line(q,24,27,24,35,dark,2);line(q,19,21,18,31,hi,1);gemAt(24,40,3.2);break;
  case'gourd':
    ell(q,dark,24,31,12.5,11.5);ell(q,dark,24,15,8.5,8.5);ell(q,c1,24,31,11.5,10.5);ell(q,c1,24,15,7.5,7.5);ell(q,c2,29,35,6,5);ell(q,hi,19,28,2.6,4);
    rect(q,21,3,6,5,dark);rect(q,22,4,4,3,c2);rect(q,16,21,16,3,dark);rect(q,17,22,14,1,g);line(q,31,23,35,35,g,1);break;
  case'coins':
    line(q,24,3,24,45,c2,2);ell(q,dark,24,6,4,4);gemAt(24,6,3);
    for(let i=0;i<4;i++){const y=15+i*8;ell(q,dark,24,y,7.5,7.5);ell(q,c1,24,y,6.5,6.5);ell(q,c2,24,y,5,5);ell(q,c1,24,y,4.2,4.2);rect(q,22,y-2,4,4,dark);itemArtDot(q,20,y-4,hi)}break;
  case'fan':{
    const R=25,pts=[[24,41]];for(let d=-152;d<=-28;d+=12)pts.push([24+(R+2)*Math.cos(d*Math.PI/180),41+(R+2)*Math.sin(d*Math.PI/180)]);poly(q,dark,pts);
    for(let i=0;i<6;i++){const a0=(-150+i*20.5)*Math.PI/180,a1=(-150+(i+1)*20.5)*Math.PI/180;poly(q,i%2?c1:hi,[[24,41],[24+R*Math.cos(a0),41+R*Math.sin(a0)],[24+R*Math.cos(a1),41+R*Math.sin(a1)]])}
    for(let i=0;i<=6;i++){const a=(-150+i*20.5)*Math.PI/180;line(q,24,41,24+R*Math.cos(a),41+R*Math.sin(a),c2,1)}
    gemAt(24,43,3);itemArtDot(q,23,42,'#ffffff');break}
  case'hairpin':
    line(q,8,42,33,14,c1,3);line(q,9,41,32,15,hi,1);
    for(let i=0;i<6;i++){const t=i/6*Math.PI*2;ell(q,c1,36+Math.cos(t)*5.5,11+Math.sin(t)*5.5,3.2,3.2)}
    ell(q,dark,36,11,4.6,4.6);gemAt(36,11,3.8);itemArtDot(q,35,9,'#ffffff');gemAt(8,42,2.6);break;
  default:
    ring(24,29,12,10,[[9,dark],[6,c2],[4,c1]]);ring(24,29,12,10,[[1,hi]]);
    poly(q,dark,[[16,19],[24,10],[32,19],[24,26]]);poly(q,c2,[[17,19],[24,11],[31,19],[24,25]]);poly(q,g,[[19,19],[24,13],[29,19],[24,23]]);itemArtDot(q,22,17,'#ffffff');
  }
  if(a.glyph){ell(q,dark,38,38,6.6,6.6);ell(q,shade(g,-70),38,38,5.6,5.6);q.save();q.strokeStyle=gold;q.lineWidth=1;q.beginPath();q.arc(38,38,5.6,0,Math.PI*2);q.stroke();q.restore();q.fillStyle='#f3e6c4';q.font='900 8px serif';q.textAlign='center';q.fillText(a.glyph,38,41);q.textAlign='start'}
}
