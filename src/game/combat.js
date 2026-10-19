function bodyPowerActive(p=state?.player){return playerClassRules58(p).upgradeTalismanMode==='bodyBoost'&&(p?.classState?.powerTurns||0)>0}
function martialPresentation(id,info,p=state.player){
 const wood=mountainWoodPresentation(id,p);if(wood)return {...info,...wood};
 const family=martialFamily(id,p),form=martialFormOf(id,p),lv=p.martial?.[id]||0,n=Math.max(1,lv),v={...info,...(id==='roar'&&family!=='roar'?CLASS_MARTIAL[family]:{})};
 if(form)v.name=MARTIAL_FORMS[family][form];
 if(id==='strong')v.desc=form==='guard'?`굳게 자세를 낮춰 적의 공세를 받아낸다. 다음 두 번의 공격 행동을 막을 때 방어력 +${strongBonus(n)}. 각 행동의 연속 타격도 끝까지 막으며, 피한 공격에는 횟수를 소모하지 않는다.`:form==='drive'?`대지를 박차는 일격으로 적을 밀어낸다. 다음 근접 공격의 공격력 +${strongBonus(n)-2}, 최대 ${n}칸 밀침. 벽에 부딪히면 밀려난 칸 수만큼 경직된다(최소 1턴). 보스는 최대 1칸·1턴이며 연달아 제압할 수 없다.`:`온몸의 힘을 한 점에 모아 내지른다. 다음에 적중하는 근접 공격의 공격력 +${strongBonus(n)}.`;
 if(family==='roar'){v.cost=lv>=5?4:5;v.desc=`${form==='silent'?'소리 없는 기세로 주위를 짓누른다.':form==='echo'?'한 번의 외침이 길 위에 여운을 남긴다.':'범의 포효처럼 기운을 터뜨려 주위를 뒤흔든다.'} 반경 ${martialRoarRange(n)}칸의 적에게 피해 ${form==='silent'?Math.min(8,2+n*2):2+n*2}, 경직 ${n>=2?2:1}턴. ${form==='silent'?'포효 소리로 먼 적을 깨우지 않는다.':form==='echo'?`바라보는 방향 ${n}칸 앞의 안전한 빈자리에 메아리가 남는다. 밟으면 기력 소모 없이 한 번 더 울려 퍼진다.`:''} 벽에 가로막히며, 보스는 오래 붙잡아 둘 수 없다.`}
 if(family==='aim')v.desc=`${form==='focus'?'상처와 고통에도 흔들리지 않고 시위를 겨눈다.':form==='divine'?'하나의 시선으로 두 적의 빈틈을 꿰뚫는다.':'호흡을 멈추고 적의 빈틈에 시선을 모은다.'} 사격 피해 ×${(Math.min(5+n,6+n-(form==='divine'?1:0))/4).toFixed(2)}에서 최대 ×${((6+n-(form==='divine'?1:0))/4).toFixed(2)}까지. 방어와 회피를 꿰뚫는다. 이동하거나 쏘면 집중이 한 단계 줄고, 제자리에서 다시 쌓인다. ${form==='focus'?'피해나 해로운 상태에 시달려도 집중을 이어갈 수 있다.':form==='divine'?'쏠 수 있는 다른 적이 있으면 집중 한 단계와 탄약 한 발을 더 써 함께 쏜다. 피해를 받거나 해로운 상태에 걸리면 집중이 풀린다.':'피해를 받거나 해로운 상태에 걸리면 집중이 풀린다.'}`;
 if(family==='smoke')v.desc=`${form==='cloud'?'흐르는 구름처럼 연막을 두르고 움직인다.':form==='burst'?'연기 속에 불씨를 감춰 때를 기다린다.':'짙은 연기를 흩뿌려 적의 눈을 가린다.'} ${form==='cloud'?'몸을 중심으로': '4칸 안에 던져'} ${n}×${n}칸에 피해 ${n*3}을 주고, ${MARTIAL_RULES.smokeTurns}턴 동안 사선을 가린다. ${form==='cloud'?'연막은 발걸음을 따라 움직인다.':form==='burst'?`사라지기 1턴 전 붉게 물든 뒤 폭발해, 연막 안의 적과 자신에게 피해 ${n*3}을 준다.`:''}`;
 if(id==='ghost'){if(form==='darkcloud'){v.type='passive';v.cost=0;v.desc=`검은 연기 사이로 스며들어 기척을 감춘다. 연막 밖에서 안으로 들어설 때 ${ghostDuration(n)*2}턴 동안 은신한다. 공격하면 모습을 드러낸다.`}else v.desc=`${form==='assassin'?'그림자에 숨어 적의 허점을 노린다.':'귀신의 그림자처럼 몸을 감춘다.'} ${ghostDuration(n)}턴 동안 은신하고 회피를 높여, 적의 감지와 추적·직접 조준을 피한다. 공격하면 은신이 풀린다.${form==='assassin'?` 숨어서 가한 첫 공격이 적중하면 적을 ${MARTIAL_RULES.assassinTurns}턴 동안 약화시킨다.`:''}`}
 if(id==='brawl')v.desc=form==='reach'?`주먹의 위력 대신 뻗어 나가는 거리를 단련한다. 맨손과 권갑의 공격 사거리 ${n}칸. 가로막힌 적 너머로는 닿지 않는다.`:form==='close'?`짧은 병기를 손발처럼 다룬다. 사거리 1칸인 근접무기의 공격력 +${n}. 맨손과 권갑에는 이 힘이 실리지 않는다.`:`주먹과 몸놀림을 갈고닦아 맞붙는 싸움에 능해진다. 맨손과 권갑의 공격력 +${n}.`;
 if(id==='constitution'){v.desc=form==='vigor'?`몸집을 키우는 대신 호흡을 다스려 더 많은 기를 품는다. 최대 기력 +${2*n}.`:form==='revive'?`죽음의 문턱에서 남은 생기를 불사른다. 치명상을 막고 체력을 최대치의 80%까지 회복한다. 대가로 이 무술이 1단 낮아진다.`:`뼈와 살을 단련해 거친 싸움을 견딘다. 최대 체력 +${8*n}%.`;if(playerClassRules58(p).upgradeTalismanMode==='bodyBoost')v.desc+=` 장사 체질로 얻는 괴력은 ${bodyPowerDuration58(p)}턴 지속되며, 매턴 체력을 2% 회복한다. 힘이 다하면 같은 시간 동안 눈이 멀고 배탈을 앓는다.`}
 if(lv===0)v.desc='미습득 · 1단 효과: '+v.desc;
 return v;
}
/* 10.0.5 acquired martial rules: producer -> persisted state -> existing consumers. */
const MARTIAL_RULES=Object.freeze({ids:['strong','roar','ghost','brawl','constitution'],keys:['b','n','m'],assassinTurns:3,smokeTurns:5,guardActions:2,latePoints:[13,15,17,18]});
const MARTIAL_FORMS={strong:{drive:'진각',guard:'방어'},roar:{silent:'무성호효',echo:'회음호효'},aim:{focus:'집중',divine:'신궁'},smoke:{cloud:'유운',burst:'폭연'},ghost:{assassin:'암살',darkcloud:'흑운'},brawl:{reach:'장타',close:'근접'},constitution:{vigor:'활력',revive:'필사즉생'}};
function martialFamily(id,p=state.player){return id==='roar'?playerClassRules58(p).roar:id}
function martialFormOf(id,p=state?.player){return p?.martialForm?.[id]||null}
function martialCap(id,p=state.player){return p.martialBreakthrough?.[id]?5:4}
function strongBonus(lv){return lv>=5?14:2+lv*2}
function ghostDuration(lv){return lv>=5?8:2+lv}
function martialHpMultiplier(p){return martialFormOf('constitution',p)?1:1+.08*(p.martial?.constitution||0)}
function recomputeMaxHp(p=state.player,grow=false){
 const before=p.maxHp||1,raw=Math.round(p.baseMaxHpPermanent*martialHpMultiplier(p))+(p.temporaryMaxHpBonus||0);
 p.maxHp=Math.max(1,p.legendCurseActive47?raw-Math.max(1,Math.ceil(raw*.30)):raw);
 if(p.legendCurseActive47){p.legendCurseBaseMax47=raw;p.legendCurseCut47=raw-p.maxHp}
 p.hp=Math.min(p.maxHp,(p.hp||0)+(grow?Math.max(0,p.maxHp-before):0));return p.maxHp;
}
function initializeMartial(run){
 const p=run.player;if(!p)return;const legacy=!p.martialRules1005;p.martial=p.martial||{};p.martialForm=p.martialForm||{};p.martialBreakthrough=p.martialBreakthrough||{};
 for(const id of MARTIAL_RULES.ids){const forms=MARTIAL_FORMS[martialFamily(id,p)];p.martialForm[id]=Object.hasOwn(forms,p.martialForm[id])?p.martialForm[id]:null;p.martialBreakthrough[id]=p.martialBreakthrough[id]===true;p.martial[id]=clamp(Math.floor(Number(p.martial[id])||0),0,martialCap(id,p))}
 p.temporaryMaxHpBonus=Number.isFinite(p.temporaryMaxHpBonus)?p.temporaryMaxHpBonus:Math.max(0,p.foodVital57||0);
 if(!Number.isFinite(p.baseMaxHpPermanent)){
  // Legacy saves did not record training order. Preserve their current maximum exactly,
  // then use this fixed inferred permanent base for every future growth/reload.
  const raw=p.legendCurseActive47?(p.legendCurseBaseMax47||p.maxHp):p.maxHp;
  p.baseMaxHpPermanent=Math.max(1,(raw-p.temporaryMaxHpBonus)/martialHpMultiplier(p));
 }
 p.guardReady1005=Math.max(0,Number(p.guardReady1005)||0);p.guardCharges1005=p.guardReady1005>0?clamp(Math.floor(Number(p.guardCharges1005??MARTIAL_RULES.guardActions)||0),0,MARTIAL_RULES.guardActions):0;if(!p.guardCharges1005)p.guardReady1005=0;p.martialRules1005=1;recomputeMaxHp(p);
 run.martialManualDrops=run.martialManualDrops||{};run.martialDamageSequence=Number(run.martialDamageSequence)||0;
 run.pendingMartialManualChoice=run.pendingMartialManualChoice||null;run.martialEcho=run.martialEcho||null;
 if(legacy){const bosses=[5,10,15,20].filter(f=>f<run.floor||(f===run.floor&&run.bossDefeated)).length,late=MARTIAL_RULES.latePoints.filter(lv=>lv<=(p.level||1)).length;run.martialProgression1005={migratedAtLevel:p.level||1,legacyBossCredit:Math.max(0,bosses-late)};p.skillPoints=(p.skillPoints||0)+Math.max(0,late-bosses);for(const f of [5,10,15,20])if(f<run.floor||(f===run.floor&&run.bossDefeated))run.martialManualDrops[f]='legacy-defeated'}
}
function martialBrawlBonus(p,w){const f=martialFormOf('brawl',p),lv=p.martial.brawl||0,brawl=!p.weapon||isBrawlWeapon(w);return f==='reach'?0:f==='close'?(!brawl&&!w.ranged&&w.kind!=='bow'&&weaponRange(p)===1?lv:0):(brawl?lv:0)}
function martialOptions(id,p=state.player){
 if((p.martial[id]||0)>=5)return[];const out=[];
 if(!martialFormOf(id,p))for(const form of Object.keys(MARTIAL_FORMS[martialFamily(id,p)]))out.push({id,form});
 if(!p.martialBreakthrough[id])out.push({id,form:'breakthrough'});return out;
}
function makeMartialManual(provenance,manualId){ return {type:'martial_manual',name:'무술비급',desc:'선인의 무학이 담긴 비급. 펼쳐진 가르침 중 하나를 골라 무술을 새롭게 익히거나 5단에 이르는 길을 연다.',seal:'秘',color:'#e9d9ac',rarity:'relic',count:1,stackMax:1,identified:true,manualId:manualId,provenance:provenance};}
function grantMartialManual(mon){
 const f=state.floor;if(!mon.boss||![5,10,15,20].includes(f)||state.martialManualDrops[f])return false;
 const item=makeMartialManual({kind:'boss-martial-manual',floor:f,boss:mon.name},`${state.runId984||state.runId||'run'}:boss:${f}`);
 // Use the existing placement queue if the arena has no free drop tile.
 const before=(state.items||[]).length;PlacementService.placeItem(item,{x:mon.x,y:mon.y});
 const placed=(state.items||[]).some(x=>x.manualId===item.manualId)||(state.pendingGroundItems57||[]).some(x=>x.item?.manualId===item.manualId);
 if(!placed)throw Error('무술비급 보상 배치 실패');state.martialManualDrops[f]=item.manualId;addLog(`${f}층 보스의 무술비급이 떨어졌다.`);return true;
}
function showMartialManual(item){
 if(!state.player.inventory.includes(item))return false;
 let pending=state.pendingMartialManualChoice;
 if(pending&&pending.manualId!==item.manualId){toast('먼저 펼친 비급의 선택을 마쳐야 한다.');return false}
 if(!pending){const choices=rollMartialChoices1005();if(!choices.length){toast('더 해금할 후천무술이 없다. 비급은 보존된다.');return false}pending=state.pendingMartialManualChoice={manualId:item.manualId,choices,createdTurn:state.turn}}
 // Extend older three-offer saves once, preserving every already revealed offer.
 if(pending.choices.length<6)pending.choices=rollMartialChoices1005(state.player,globalThis.__MANRU_RANDOM57__,pending.choices);
 // Commit before showing RNG results. Storage failure does not discard the in-memory roll.
 const save=globalThis.__MANRU_SAVE_SERVICE__?.commit?.('martial-manual-candidates');if(!save?.ok){toast('후보 저장에 실패했다. 같은 후보를 유지하며 저장 후 다시 열 수 있다.');return false}
 return globalThis.__MANRU_ITEM_IDENTITY991__.openMartialManual(pending);
}
function chooseMartialManual(index){
 const act=playerAction57('choice',{uiOwner:'choice991'});if(!act.ok)return false;
 const pending=state.pendingMartialManualChoice,c=pending?.choices?.[index],p=state.player,item=p.inventory.find(i=>i.manualId===pending?.manualId&&i.type==='martial_manual');if(!c||!item)return false;
 // Honor a persisted form offer even if the player trains an already-unlocked cap before reopening.
 const applicable=MARTIAL_RULES.ids.includes(c.id)&&(c.form==='breakthrough'?!p.martialBreakthrough[c.id]:!martialFormOf(c.id,p)&&Object.hasOwn(MARTIAL_FORMS[martialFamily(c.id,p)],c.form));
 if(!applicable){toast('이 후보는 이미 완성됐다. 다른 확정 후보를 선택해라.');return false}
 const oldHp=p.maxHp;if(c.form==='breakthrough')p.martialBreakthrough[c.id]=true;else p.martialForm[c.id]=c.form;
 if(c.id==='strong'){p.strongReady=0;p.guardReady1005=0;p.guardCharges1005=0}if(c.id==='roar'){state.martialEcho=null;if(p.classState?.aimPower>0)setAimPower(p.classState.aimPower)}
 if(c.id==='constitution')recomputeMaxHp(p);p.focus=Math.min(p.focus,getStats().maxFocus);
 consumeItemQuantity(item);state.pendingMartialManualChoice=null;globalThis.__MANRU_ITEM_IDENTITY991__.closeChoice();
 const v=martialPresentation(c.id,MARTIAL_INFO[c.id],p);addLog(c.form==='breakthrough'?`${v.name}: 5단에 이르는 길이 열렸다. 무술 포인트로 마지막 경지를 익힐 수 있다.`:`후천무술 습득: ${v.name}. 현재 ${p.martial[c.id]}단계 유지.`);martialFx('unlock',p);commitPlayerAction57(act,1);updateAll();return true;
}
const MARTIAL_VISUAL={run:null,events:[]};
function martialFx(kind,q=state.player,extra={}){
 const palette={drive:'#e6b986',guard:'#d5ddc9',echo:'#c4b980',assassin:'#bca0dc',darkcloud:'#8e79ab',revive:'#fff0cc',divine:'#f1d9db',cloud:'#abbeca',burst:'#f28b63',unlock:'#f6eed3',transcend:'#fff9e8',warning:'#f28b63'},color=palette[kind]||'#d0b890';
 if(MARTIAL_VISUAL.run!==state){MARTIAL_VISUAL.run=state;MARTIAL_VISUAL.events=[]}MARTIAL_VISUAL.events.push({kind,x:q.x,y:q.y,color,start:performance.now(),life:kind==='revive'?700:480,dx:q.facing?.x,dy:q.facing?.y,...extra});if(MARTIAL_VISUAL.events.length>24)MARTIAL_VISUAL.events.shift();
 impact(q.x,q.y,color,kind==='revive'?7:3);burst(q.x,q.y,color,kind==='burst'?20:10,.6);
 if(kind==='revive'){flash('#eedfba',220);floatText(q.x,q.y,'生','#fff5d7',20)}
 if(kind==='guard')floatText(q.x,q.y,'禦',color,14);
 if(kind==='assassin')floatText(q.x,q.y,'약화',color,11);
 if(kind==='darkcloud')floatText(q.x,q.y,'흑운',color,11);
}
function resolveDrive(mon,lv,origin){
 if(mon.hp<=0||mon.fixed)return {moved:0};const actor=origin||state.player,f=actor.facing||{x:Math.sign(mon.x-actor.x),y:Math.sign(mon.y-actor.y)},source={x:mon.x-f.x,y:mon.y-f.y};
 const r=resolveForcedMovement57(mon,source,mon.boss?Math.min(1,lv):lv,{mode:'push',hostile:true,creditPlayer:actor===state.player,reportCollision:true});
 state.lastDrive1005={moved:r.moved,collision:r.collision||null};martialFx('drive',mon);
 if(r.collision&&mon.hp>0){wallCollisionFx1005(mon,r.collision);mon===state.player?applyHostileStatus('stun',Math.max(1,r.moved),1,{stagger:true}):applyMartialControl1005(mon,Math.max(1,r.moved))}return r;
}
function performRoar(createEcho=true,actor=state.player){
 const p=actor,lv=p.martial.roar,form=martialFormOf('roar',p),range=martialRoarRange(lv),damage=form==='silent'?Math.min(8,2+lv*2):2+lv*2;
 if(form!=='silent')alertNearby(p.x,p.y,state.floor>=11?12:8,'roar');
 for(const target of martialTargets(p))if(entityDistance57(target,p)<=range&&entityCombatLineCheckR(p,target,{range,ignore:target,units:false}).ok){damageEntity(target,damage,p);if(target===state.player)applyHostileStatus('stun',lv>=2?2:1,1,{stagger:true});else applyMartialControl1005(target,lv>=2?2:1);martialCheckDeath(target,p)}
 impact(p.x,p.y,'#d8b06c',5);addLog(`${p.name} · ${martialPresentation('roar',MARTIAL_INFO.roar,p).name}: 반경 ${range} · 피해 ${damage}.`);
 if(createEcho&&form==='echo'){const f=p.facing||{x:0,y:1},x=p.x+Math.sign(f.x)*lv,y=p.y+Math.sign(f.y)*lv;if(p===state.player){state.martialEcho=null;if(safeEchoCell1005(x,y)){state.martialEcho={x,y,floor:state.floor};martialFx('echo',state.martialEcho)}}}
}
function smokeAt(x,y){return (state.tempFields||[]).some(f=>f.kind==='smoke'&&f.ttl>0&&tempFieldCells57(f).some(c=>c.x===x&&c.y===y))}
function syncSmokeEntry(allowEntry=true){
 const p=state.player,inside=smokeAt(p.x,p.y),before=!!p.smokeInside1005;
 if(allowEntry&&!before&&inside&&martialFormOf('ghost')==='darkcloud'&&p.martial.ghost>0){state.status.stealth=Math.max(state.status.stealth||0,ghostDuration(p.martial.ghost)*2);p.stealthBornAgency1005=(state.playerAgencyTurns57||0)+(state._turnPipelineActive57&&state._turnAgencyCounted57?0:1);for(const m of state.monsters)if(isHostileTarget57(m))clearPlayerTracking58(m);martialFx('darkcloud');addLog(`흑운: 은신 ${ghostDuration(p.martial.ghost)*2}턴.`)}p.smokeInside1005=inside;
}
function smokeCells(center,lv){const out=[],start=Math.floor((lv-1)/2);for(let dy=0;dy<lv;dy++)for(let dx=0;dx<lv;dx++){const x=center.x+dx-start,y=center.y+dy-start;if(x>=0&&y>=0&&x<COLS&&y<ROWS&&!tileBlocksSight(state.map[y][x])&&lineClear(center.x,center.y,x,y))out.push({x,y})}return out}
function martialLanding(origin){
 const p=state.player,moved=p.x!==origin.x||p.y!==origin.y;
 if(moved)for(const f of state.tempFields||[])if(f.martialSmoke&&f.smokeForm==='cloud'&&f.ttl>0){f.x=p.x;f.y=p.y;f.cells=smokeCells(p,f.castLevel)}
 syncSmokeEntry();const e=state.martialEcho;if(moved&&e&&e.floor===state.floor&&e.x===p.x&&e.y===p.y){state.martialEcho=null;martialFx('echo');performRoar(false)}
}
function expireMartialSmoke(f){
 if(!f.martialSmoke||f.smokeForm!=='burst')return false;
 const cells=tempFieldCells57(f),touch=e=>cells.some(c=>monCovers(e,c.x,c.y));alertNearby(f.x,f.y,12,'explosion',f.castDamage);martialFx('burst',f);
 for(const m of [...state.monsters])if(m.hp>0&&touch(m)&&(effectCanAffect57(f,m)||f.owner===m.dojoActorId105)){const d=damageEntity(m,f.castDamage,f);if(d>0)floatText(m.x,m.y,'-'+d,'#ed977e',12);if(m.hp<=0)killMonster(m)}
 if(cells.some(c=>c.x===state.player.x&&c.y===state.player.y)){const d=damageEntity(state.player,f.castDamage,f);if(d>0)floatText(state.player.x,state.player.y,'폭연 -'+d,'#ed977e',13);if(state.player.hp<=0)die('폭연')}
 addLog(`폭연 폭발: 설치 피해 ${f.castDamage}.`);return true;
}
function martialWorldInfo(x,y){if(state.martialEcho?.floor===state.floor&&state.martialEcho.x===x&&state.martialEcho.y===y)return{name:'회음',desc:'호효의 여운이 이곳에 맺혀 있다. 밟으면 기력 소모 없이 한 번 더 울려 퍼지고 사라진다.'};const f=(state.tempFields||[]).find(f=>f.kind==='smoke'&&f.ttl>0&&tempFieldCells57(f).some(c=>c.x===x&&c.y===y));return f?{name:f.smokeForm==='burst'?'폭연':f.smokeForm==='cloud'?'유운':'연막',desc:f.smokeForm==='burst'?`${f.ttl===1?'붉은 연기 속에서 불씨가 끓어오른다. 다음 턴에 폭발한다!':`남은 ${f.ttl}턴.`} 영역 전체 피해 ${f.castDamage}. 플레이어도 피해를 받는다.`:'연막이 사선을 가린다.'}:null}
let martialOpen = false;
function bodyPowerHeal(p){
  if(!bodyPowerActive(p)||p.hp<=0)return 0;
  const cs=p.classState;
  if(p.hp>=p.maxHp){cs.powerHealHundredths=0;return 0}
  // Integer hundredths retain the exact 2% rate without putting fractions into HP.
  const units=(cs.powerHealHundredths||0)+p.maxHp*2;
  const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+Math.floor(units/100));
  cs.powerHealHundredths=p.hp>=p.maxHp?0:units%100;
  return p.hp-before;
}
function statusSummary(){
  const s=state?.status||{},out=[];
  if(state?.player?.classState?.aimPower>0)out.push(`명중 ×${(state.player.classState.aimPower/4).toFixed(2)}`);
  if(bodyPowerActive())out.push(`괴력 ${state.player.classState.powerTurns}`);
  for(const row of playerDebuffRows())out.push(`${row.label} ${row.turns}`);
  if(s.ward>0)out.push(`보호막 ${s.ward}`);
  if(s.evade>0)out.push(`회피상승 ${s.evade}`);
  if(s.markCrit>0)out.push(`치명표식 ${s.markCrit}`);
  if(s.haste>0)out.push(`가속 ${s.haste}`);
  if(s.stealth>0)out.push(`은신 ${s.stealth}`);
  if(s.regen>0)out.push(`재생 ${s.regen}`);
  if(s.swift>0)out.push(`경신 ${s.swift}`);
  if(s.fortify>0)out.push(`강골 ${s.fortify}`);
  if(s.willBoost>0)out.push(`청심 ${s.willBoost}`);
  if(s.foodHaste57>0)out.push(`전력식 ${s.foodHaste57}`);
  if(s.warm57>0)out.push(`온기 ${s.warm57}`);
  if(s.fireCoat57>0)out.push(`화미 ${s.fireCoat57}`);
  if(s.poisonResist57>0)out.push(`독저항 ${s.poisonResist57}`);
  if(s.vitality57>0)out.push(`보신 ${s.vitality57}`);
  if(s.freeStamina57>0)out.push(`빙복숭아 ${s.freeStamina57}`);
  if(state?.elementWard74?.ttl>0)out.push(`원소가호 ${state.elementWard74.ttl}`);
  if((state?.visionPenalty||0)>0)out.push(`환경시야 -${state.visionPenalty}`);
  return out.length?out.join(' · '):'상태 이상 없음.';
}
function applyStatusTick(){
  if(!state||state.dead)return;ensureFoodState();
  if(state.status.poisonResist57>0)state.status.poison=0;
  if(state.status.poison>0){
    const dmg=damageEntity(state.player,combatDebuffDamage(state.player,'poison'));
    if(dmg>0){floatText(state.player.x,state.player.y,`독 -${dmg}`,'#8bd96d',12);addLog(`독이 현재 체력을 갉아먹는다. -${dmg} HP`);}
    if(state.player.hp<=0){die('중독');return}
  }
  if(state.status.bleed>0){
    const dmg=damageEntity(state.player,combatDebuffDamage(state.player,'bleed'));
    if(dmg>0){floatText(state.player.x,state.player.y,`출혈 -${dmg}`,'#e48989',12);addLog(`상처가 벌어져 출혈이 심해진다. -${dmg} HP`);}
    if(state.player.hp<=0){die('출혈');return}
  }
  if(state.makgeolliRecoveryTurns57>0&&state.turn>(state.drunkBornTurn57??-1)&&state.player.hp>0){
    const brew=(globalThis.MANRU_POTIONS||[]).find(v=>v.potionKind==='makgeolli'),minimum=Math.max(0,Math.floor(brew?.regenMin57||2)),percent=Math.max(0,Number(brew?.regenPercent57)||.09),before=state.player.hp;
    if(before>=state.player.maxHp)state.makgeolliHealHundredths57=0;
    else{
      const raw=Math.max(0,Math.floor(Number(state.makgeolliHealHundredths57)||0))+Math.round(state.player.maxHp*percent*100),finalTick=state.makgeolliRecoveryTurns57<=1;
      const whole=finalTick?Math.round(raw/100):Math.floor(raw/100),heal=Math.max(minimum,whole),remainder=finalTick?0:Math.max(0,raw-heal*100);
      state.player.hp=Math.min(state.player.maxHp,state.player.hp+heal);const gained=state.player.hp-before;
      state.makgeolliHealHundredths57=state.player.hp>=state.player.maxHp?0:remainder;
      if(gained>0){floatText(state.player.x,state.player.y,`술기운 +${gained}`,'#ead9b6',11);addLog(`막걸리의 술기운이 상처를 덥힌다. +${gained} HP`)}
    }
    state.makgeolliRecoveryTurns57--;
  }
  if(state.dead)return;
  tickMonsterCombatStatuses();
  for(const q of ['foodHaste57','warm57','fireCoat57','poisonResist57','vitality57','freeStamina57'])if(state.status[q]>0)state.status[q]--;
  if(state.status.vitality57<=0&&state.player.foodVital57>0){const n=state.player.foodVital57;state.player.foodVital57=0;state.player.temporaryMaxHpBonus=Math.max(0,(state.player.temporaryMaxHpBonus||0)-n);recomputeMaxHp(state.player);addLog('보신 전골의 기운이 가셨다. 최대 HP가 돌아왔다.')}

}
function weaponRange(actor=state?.player){const w=actor?.weapon;if(martialFormOf('brawl',actor)==='reach'&&(!w||isBrawlWeapon(w)))return Math.max(1,actor.martial.brawl||0);if(w?.kind==='spear'){if(w.legendaryWeapon47||w.artifactWeapon46)return Math.max(1,w.range||1);const tier=w.tier||1;return tier===1?3:tier>=4?5:4}return Math.max(1,w?.range||1)}
function weaponActionCost(item){return clamp(1.15-Math.log2(Math.max(.18,item?.speed||1.35))*.28,.58,1.85)}
function attackTurnCost(item=state?.player?.weapon){let cost=weaponActionCost(item);for(const stage of ATTACK_COST_STAGES)cost=stage.run(cost,item);const cursed=globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('clumsy')||0;return clamp(applyPlayerDebuffActionCost('attack',cost),.25,cursed>0?6:2.6)}
function combatEffectActor(source){if(!source||!state)return null;if(source===state.player||state.monsters.includes(source))return source;const id=source.owner;if(id==='player')return state.player;return state.monsters.find(m=>m.combatantId54===id||m.allyId53===id||m.dojoActorId105===id)||null}
const DRUNK_RULES=Object.freeze({movementUnstable:.30,movementWanderWithinUnstable:.68,attackWhiff:.20,attackHeavyThreshold:.84,attackHeavyBonus:2});
function drunkAttackOutcome(){const q=globalThis.__MANRU_RANDOM57__();return q<DRUNK_RULES.attackWhiff?'whiff':q>DRUNK_RULES.attackHeavyThreshold?'heavy':'steady'}
function combatDebuffDamage(p,key){
  if(!p)return 0;const hp=Math.max(1,Number(p.hp)||1),maxHp=Math.max(hp,Number(p.maxHp)||hp),missing=Math.max(0,maxHp-hp);
  if(key==='poison')return Math.max(1,Math.ceil(hp*.055));
  if(key==='bleed')return Math.max(1,Math.ceil(maxHp*.02+missing*.03));
  return 0
}
function combatStatusTurns(actor,key){
 if(!actor)return 0;if(actor===state?.player)return Math.max(0,Number(state.status?.[key])||0);
 const meta=STATUS_META57[key],fields=[meta?.monsterField57||key,meta?.legacyMonsterField57,...(meta?.legacyMonsterFields57||[])].filter(Boolean);return Math.max(0,...fields.map(field=>Number(actor[field])||0));
}
// Presentation reads the existing status owners without changing their clocks.
const ACTOR_STATUS_MARKS=Object.freeze({combustion105:{key:'combustion',glyph57:["0001000","0011000","0011010","0111110","1101111","1111111","0111110"],label:'연소',color:'#ec8753',turnsField:'remaining'},sleeping105:{key:'sleep',glyph57:["1111111","0000010","0000100","0001000","0010000","0100000","1111111"],label:'잠듦',color:'#e5c996'}});
function combatStatusRows(actor){
 if(!actor)return[];const rows=[];
 for(const [key,meta]of Object.entries(STATUS_META57)){if(!meta.harmful)continue;const turns=combatStatusTurns(actor,key);if(turns>0)rows.push({key,label:meta.label,color:meta.color57,glyph:meta.glyph57,turns});}
 for(const [field,meta]of Object.entries(ACTOR_STATUS_MARKS)){const status=actor[field],turns=meta.turnsField?Math.max(0,Number(status?.[meta.turnsField])||0):null;if(status&&(turns===null||turns>0))rows.push({key:meta.key,label:meta.label,color:meta.color,glyph:meta.glyph57,turns});}
 return rows;
}
function applyPlayerDebuffActionCost(kind,cost){
  let out=Number(cost)||1;if(state?.status?.upset>0)out*=kind==='move'?1.45:1.20;return out
}
function playerDebuffRows(){
  if(!state?.status)return[];const s=state.status,rows=[];
  if(s.illness>0)rows.push({key:'illness',label:'중병',turns:s.illness,effect:'유예가 끝나면 사망 · 해독산이나 정화로 치료'});
  if(s.poison>0)rows.push({key:'poison',label:'중독',turns:s.poison,effect:`현재 HP 5.5% · 다음 피해 ${combatDebuffDamage(state.player,'poison')}`});
  if(s.bleed>0)rows.push({key:'bleed',label:'출혈',turns:s.bleed,effect:`최대·손실 HP 비례 · 다음 피해 ${combatDebuffDamage(state.player,'bleed')}`});
  if(s.weaken>0)rows.push({key:'weaken',label:'쇠약',turns:s.weaken,effect:'현재 ATK ×0.80 · DEF ×0.75 · EVA ×0.80'});
  if(s.stun>0)rows.push({key:'stun',label:'기절',turns:s.stun,effect:'다음 입력 행동권 상실 · 적 턴은 정상 진행'});
  if(s.upset>0)rows.push({key:'upset',label:'배탈',turns:s.upset,effect:'현재 이동비용 ×1.45 · 공격비용 ×1.20'});
  if(s.drunk>0)rows.push({key:'drunk',label:'취함',turns:s.drunk,effect:'이동 30% 불안정(그중 68% 방향 오판) · 공격 20% 헛침 / 16% 강타'});
  if(s.blind>0)rows.push({key:'blind',label:'실명',turns:s.blind,effect:`현재 VIS ×${STATUS_META57.blind.visionScale57} · 빗나감 +${Math.round(STATUS_META57.blind.missPenalty57*100)}%p`});
  if(s.skillSeal>0)rows.push({key:'skillSeal',label:'기봉인',turns:s.skillSeal,effect:'점멸·무술 봉쇄'});
  return rows.map(row=>({...row,color:STATUS_META57[row.key]?.color57,glyph:STATUS_META57[row.key]?.glyph57}))
}
function cleanseStatuses(status=state?.status,limit=Infinity){const removed=[];for(const [name,meta]of Object.entries(STATUS_META57).sort((a,b)=>Number(!!b[1].lethal)-Number(!!a[1].lethal)))if(meta.harmful&&meta.cleanseable&&status?.[name]>0&&removed.length<limit){status[name]=0;removed.push(name)}return removed}
function installMartialJar(actor){
 if(!actor?.relic?.jarOnMartial57||actor.hp<=0)return null;const cells=[],hostiles=[state.player,...state.monsters].filter(m=>m.hp>0&&entitiesHostile57(actor,m));
 for(let y=Math.max(1,actor.y-4);y<=Math.min(ROWS-2,actor.y+4);y++)for(let x=Math.max(1,actor.x-4);x<=Math.min(COLS-2,actor.x+4);x++){
  const t=state.map[y][x];if(!terrainSurface58(t)||terrainLayerCatalog58().overlays.has(t)||!safeLootGround42(x,y)||entityDistance57(actor,{x,y})<2||!lineClear(actor.x,actor.y,x,y)||OccupancyService.isOccupied(x,y)||state.items.some(i=>i.x===x&&i.y===y)||state.decor?.some(d=>d.x===x&&d.y===y)||state.branchTerrain105?.props?.[k(x,y)])continue;
  if(hostiles.some(m=>entityDistance57(m,{x,y})<3)||DIRS8.filter(([dx,dy])=>safeLootGround42(x+dx,y+dy)).length<5)continue;
  if(jarGasState57().some(f=>f.cells?.some(c=>c.x===x&&c.y===y&&c.c>0))||[...(state.tempFields||[]),...(state.elementFields74||[]),...(state.legendFireFields47||[])].some(f=>tempFieldCells57(f).some(c=>c.x===x&&c.y===y))||state.monsters.some(m=>(m.intent54?.cells||m.intent61?.cells||[]).some(c=>c.x===x&&c.y===y)))continue;
  cells.push({x,y});
 }
 if(!cells.length)return null;const q=choice(cells.filter(c=>![state.stairs,state.fixedExit,...(state.branchPortals105||[]),...(state.switches||[])].some(p=>p&&entityDistance57(p,c)<=2)));if(!q)return null;setTerrainTile58(state.map,q.x,q.y,TT.JAR);burst(q.x,q.y,'#b18b60',8,.4);VisibilityService.compute();return q;
}
function isBrawlWeapon(it){return !!(it&&it.type==='weapon'&&(it.brawlWeapon||it.kind==='brawl'))}
function applyWeaponUpgrade(it){if(!it||it.type!=='weapon')return{delta:0,effective:0};if(it.artifactWeapon46){toast('전설의 무기는 강화할 수 없다.');return{delta:0,effective:it.upgrade||0,blocked:true}}const before=it.upgrade||0;it.upgrade=before+1;if(isBrawlWeapon(it)){const prev=Math.floor(before/3),next=Math.floor(it.upgrade/3),delta=next-prev;if(delta>0)it.atk=(it.atk||0)+delta;return{delta,effective:next}}it.atk=(it.atk||0)+1;return{delta:1,effective:it.upgrade}}
function armorBaseDef(it){if(!it)return null;const d=(ARMORS||[]).find(a=>a.name===it.name);if(d&&Number.isFinite(+d.def))return +d.def;if(Number.isFinite(+it.baseDef42))return +it.baseDef42;return null}
const ARMOR_DIM_BASE_GAIN=1.75,ARMOR_DIM_BASE_WEIGHT=.02,ARMOR_DIM_DECAY=.14;
function armorEffectiveDef(it,level=it?.upgrade||0){if(!it)return 0;const base=armorBaseDef(it);if(base==null)return Math.max(0,+it.def||0);const value=base+armorUpgradeGain42(base,level);return Math.round(value*1000)/1000}
function syncArmorDefense(it){if(!it||it.type!=='armor')return it;const base=armorBaseDef(it);if(base==null)return it;it.baseDef42=base;it.def=armorEffectiveDef(it);return it}
function applyArmorUpgrade(it){if(!it||it.type!=='armor')return{delta:0,effective:+it?.def||0};const before=armorEffectiveDef(it),level=Math.max(0,Math.floor(+it.upgrade||0))+1;it.upgrade=level;syncArmorDefense(it);return{delta:Math.round((it.def-before)*1000)/1000,effective:it.def,displayEffective:Math.round(it.def),base:it.baseDef42,stepGain:armorUpgradeStepGain42(it.baseDef42,level),level}}
function getStats(){const p=state.player,w=p.weapon||{},a=p.armor||{},c=p.cloak||{},r=p.relic||{},t=p.trinket||{},hm=hungerMods(),armorDef=armorEffectiveDef(a),gear105=equipmentContributions105(p);const brawl=martialBrawlBonus(p,w),lg=globalThis.__MANRU_LEGEND47__;let out={atk:Math.max(1,p.baseAtk+gear105.atk+(lg?.atkBonus?.()||0)+hm.atk+(state.status.haste>0?1:0)),def:Math.max(0,p.baseDef+gear105.def+(lg?.defBonus?.()||0)+(state.status.ward>0?2:0)),eva:Math.max(0,p.baseEva+gear105.eva+hm.eva+(state.status.evade>0?3:0)+(state.status.stealth>0?4:0)),will:p.baseWill+(a.will||0)+(r.will||0)+(t.will||0),vision:Math.max(3,Math.floor((p.baseVision+(r.vision||0)+(t.vision||0))*dungeonVisionScale50())),maxFocus:p.maxFocus+(r.focus||0)+(t.focus||0)+(martialFormOf('constitution',p)==='vigor'?2*(p.martial.constitution||0):0),critBonus:(w.crit||0)+(globalThis.__MANRU_LEGEND47__?.critBonus?.()||0)+(state.status.markCrit>0?.22:0),chain:w.chain||0,holy:(w.holy||0)+(w.elementBrand74==='holy'?5:0)};for(const stage of PLAYER_STAT_STAGES)out=stage.run(out)||out;return applyCombatDebuffStats57(out)}
function setPlayerAttackOutcome(kind,mon,extra={}){if(!state)return null;const out={kind,target:mon||null,turn:state.turn??0,...extra};state.playerAttackOutcome57=out;if(kind==='hit'&&mon?.martialActor105&&(state.player.weapon?.ranged||state.player.weapon?.kind==='bow'))dojoRememberHit(mon,'ranged');return out}
function isThreatVisibleToPlayer(entity){return isHostileTarget57(entity)&&isEntityObservableToPlayer57(entity)&&!(entity?.treeMimic105&&entity.mimicDormant105!==false)}
function damageFormula(att, defVal, isCrit=false,opts=null){
  if(opts)defVal=Math.floor((Math.max(0,defVal-(opts.defenseIgnore||0))+(opts.defenseBonus||0))*(opts.defenseScale??1))-(opts.defensePenalty||0);
  let dmg = Math.max(1, att + rand(-1,2) - Math.floor(defVal*0.55));
  if(isCrit) dmg = Math.round(dmg*1.6);
  return Math.max(1,Math.round(dmg*(opts?.damageScale??1)));
}
function combatShotCheckR(mon){
  if(!state||!isHostileTarget57(mon)||mon.hidden)return{ok:false,reason:'유효한 적대 표적이 아니다.'};
  const p=state.player,w=p.weapon||{},range=weaponRange();if(!(w.ranged||w.kind==='bow'))return{ok:false,reason:'원거리 무기가 아니다.'};
  if(!isThreatVisibleToPlayer(mon))return{ok:false,reason:'현재 관측 가능한 적이 아니다.'};return entityCombatLineCheckR(p,mon,{range,ignore:mon})
}
function rangedJarTargetR(){
 const candidates=[];for(const key of state.visible){const[x,y]=key.split(',').map(Number);if(state.map[y]?.[x]!==TT.JAR)continue;const q={type:'jar',x,y,hp:1,maxHp:1};if(combatTerrainTargetCheckR8(q).ok)candidates.push(q);}return candidates.sort((a,b)=>entityDistance57(a,state.player)-entityDistance57(b,state.player))[0]||null;
}
function bestRangedTargetR(){
  if(!state)return null;const p=state.player,w=p.weapon||{};if(!(w.ranged||w.kind==='bow'))return null;
  const manual=state._manualRangedTargetR8;if(manual&&state.monsters.includes(manual)&&combatShotCheckR(manual).ok)return manual;state._manualRangedTargetR8=null;
  return state.monsters.filter(m=>isThreatVisibleToPlayer(m)&&combatShotCheckR(m).ok).sort((a,b)=>(b.boss?1:0)-(a.boss?1:0)||(b.alerted?1:0)-(a.alerted?1:0)||entityDistance57(a,p)-entityDistance57(b,p))[0]||rangedJarTargetR()
}
function applyPlayerPostHitR(target,w,range){
  if(target.hp>0&&w.knockback)knockMonster(target,w.knockback);if(target.hp>0&&w.shred){target.def=Math.max(0,target.def-1);target.shredDef105=(target.shredDef105||0)+1;}
  if(target.hp>0&&w.execute&&target.hp/target.maxHp<=w.execute&&!target.boss){target.hp=0;killMonster(target);addLog('종결. 약해진 적을 단번에 끝냈다.')}
  if(w.wide)for(const m of [...state.monsters])if(m!==target&&isHostileTarget57(m)&&entityDistance57(m,target)<=1&&entityDistance57(m,state.player)<=range+1&&entityCombatLineCheckR(state.player,m,{range:range+1,ignore:m,units:false}).ok){damageEntity(m,Math.max(1,Math.floor(getStats().atk*.45)), state.player);if(m.hp<=0)killMonster(m)}
}
function adjacentAttackTargetR(){if(!state)return null;const p=state.player,forced=state._forcedAdjacentTargetR8;state._forcedAdjacentTargetR8=null;if(forced&&isThreatVisibleToPlayer(forced)&&entityDistance57(forced,p)<=1)return forced;return selectFacingAdjacentTarget57(state.monsters.filter(isThreatVisibleToPlayer),(a,b)=>(b.boss?1:0)-(a.boss?1:0)||(b.alerted?1:0)-(a.alerted?1:0))}
function basicAttack(){
  const act=playerAction57('attack',{stunMessage:'몸이 굳어 공격하지 못했다.'});if(!act.ok)return !!act.consumed;const p=state.player
  const w=p.weapon||{},ranged=!!(w.ranged||w.kind==='bow'),f=p.facing||{x:0,y:-1},range=weaponRange();
  // Tool weapons use one semantic furniture policy. Structural walls, doors, gates, stonework, windows and progression objects are never members.
  if(!ranged&&w.breakPower){const bx=p.x+f.x,by=p.y+f.y,t=state.map?.[by]?.[bx];if(t!==TT.JAR&&isToolBreakableTerrain57(t)){const elem=weaponElement105(w);if(elem)emitElementContact105(elem,[{x:bx,y:by}],effectSource57(p));if(!(elem==='fire'&&elementMaterial105(t,'wood',bx,by)))breakFurnitureTerrain57(bx,by,w);if(state.status.stealth>0)state.status.stealth=0;commitPlayerAction57(act,attackTurnCost(w));updateAttackButton();return true}}
  const manual=state._manualTerrainTargetR8;if(manual){const check=combatTerrainTargetCheckR8(manual,range);if(!check.ok){state._manualTerrainTargetR8=null;toast(check.reason);return false;}}
  let ammoCtx=null;if(ranged&&globalThis.__MANRU_AMMO_ATTACK__){ammoCtx=globalThis.__MANRU_AMMO_ATTACK__.prepare?.();if(ammoCtx&&!ammoCtx.ok)return false;if(ammoCtx?.ammo)state._activeAmmo967=ammoCtx.ammo}
  let target=manual?{...manual,hp:1,maxHp:1}:adjacentAttackTargetR(),last={x:p.x+f.x,y:p.y+f.y};
  if(target){last=entityClosestCellTo57(target,p)||{x:target.x,y:target.y};if(ranged)p.facing={x:Math.sign(last.x-p.x),y:Math.sign(last.y-p.y)}}
  else if(ranged){target=bestRangedTargetR();if(!target){state._activeAmmo967=null;toast(`사거리 ${range}칸 안에 사격 가능한 적이 없다.`);return false}last=entityClosestCellTo57(target,p)||{x:target.x,y:target.y};p.facing={x:Math.sign(last.x-p.x),y:Math.sign(last.y-p.y)}}
  else for(let i=1;i<=range;i++){const x=p.x+f.x*i,y=p.y+f.y*i;if(x<0||y<0||x>=COLS||y>=ROWS)break;last={x,y};const mon=findMonsterAt(x,y);if(isEntityObservableToPlayer57(mon)){if(isHostileTarget57(mon))target=mon;break}if(state.map[y][x]===TT.JAR){const q={type:'jar',x,y,hp:1,maxHp:1};if(combatTerrainTargetCheckR8(q,range).ok)target=q;break;}if(weaponElement105(w)&&elementalWorldTarget105(x,y))break;if(tileBlocksSight(state.map[y][x])&&!w.cornerHit)break}
  const wasStealthed=state.status.stealth>0;
  if(state.status.stealth>0){state.status.stealth=0;globalThis.__MANRU_MARTIAL_FX965__?.pulse?.('ghostBreak',430);burst(p.x,p.y,'#c8d7db',11,.68);addLog('공격 동작과 함께 은신이 풀렸다.')}
  if(target&&!target.type&&!ranged&&martialFormOf('brawl')==='reach'&&(!p.weapon||isBrawlWeapon(w))&&!entityCombatLineCheckR(p,target,{range,ignore:target}).ok){state._activeAmmo967=null;toast('장타 사선이 막혔다.');return false}
  const turn0=state.turn,shotPower=p.classState?.aimPower||0;
  const second=ranged&&martialFormOf('roar')==='divine'&&shotPower>5&&(!ammoCtx?.active||itemQuantity(ammoCtx.ammo)>=2)?state.monsters.find(m=>m!==target&&combatShotCheckR(m).ok):null;
  try{
    if(target){const targets=second?[target,second]:[target];for(let i=0;i<targets.length;i++){const m=targets[i];if(i>0&&!combatShotCheckR(m).ok)continue;if(ammoCtx?.active&&!globalThis.__MANRU_AMMO_ATTACK__.consume(ammoCtx.ammo))break;if(ammoCtx)ammoCtx.consumed=true;
      const connected=attackPlayer(m,0,{wasStealthed:i===0&&wasStealthed,shotBundle:ranged,aimPower:shotPower})===true;if(connected)applyPlayerPostHitR(m,w,range);if(ranged&&shotPower>0)setAimPower((p.classState.aimPower||0)-1,'attack');if(i>0){projectileFX(p.x,p.y,m.x,m.y,'#f1d9db');martialFx('divine',m)}}state._manualRangedTargetR8=!target.type&&target.hp>0?target:null;state._manualTerrainTargetR8=null;}
    else{presentPlayerAction58('attack',last);const elem=weaponElement105(w);if(elem&&combatLineCheckR8(p.x,p.y,last.x,last.y,{range,units:false}).ok)emitElementContact105(elem,[last],effectSource57(p),{baseDamage:getStats().atk})}
    commitPlayerAction57(act,attackTurnCost(w));updateAttackButton();return true
  }finally{if(ammoCtx?.ok)globalThis.__MANRU_AMMO_ATTACK__?.finish?.(ammoCtx,turn0);state._activeAmmo967=null}
}
const MANRU_ATTACK_PIPELINE_R={playerBase:null,monsterBase:null,playerStages:[],monsterStages:[]};
function setPlayerAttackBaseR(id,fn){if(typeof fn!=='function')throw new TypeError('player attack base must be a function');MANRU_ATTACK_PIPELINE_R.playerBase={id,fn};return fn}
function registerPlayerAttackStageR(id,fn){if(typeof fn!=='function')throw new TypeError('player attack stage must be a function');if(MANRU_ATTACK_PIPELINE_R.playerStages.some(x=>x.id===id))throw new Error('duplicate player attack stage: '+id);MANRU_ATTACK_PIPELINE_R.playerStages.push({id,fn});return fn}
function runAttackStagesR(kind,args){
  const base=kind==='player'?MANRU_ATTACK_PIPELINE_R.playerBase:MANRU_ATTACK_PIPELINE_R.monsterBase,stages=kind==='player'?MANRU_ATTACK_PIPELINE_R.playerStages:MANRU_ATTACK_PIPELINE_R.monsterStages;
  if(typeof base?.fn!=='function')throw new Error(kind+' attack base missing');
  const call=(idx,a)=>idx<0?base.fn(...a):stages[idx].fn((...nextArgs)=>call(idx-1,nextArgs),...a);
  return call(stages.length-1,args);
}
function attackPlayer(mon,bonusAtk=0,...args){const terrain=['jar','terrain'].includes(mon?.type);if(terrain?!combatTerrainTargetCheckR8(mon).ok:!isHostileTarget57(mon))return false;markCombatActivity57('player-attack');state.playerAttackOutcome57=null;presentPlayerAction58('attack',mon);const own=!RuntimeState.martialDamageBundle1005;if(own)RuntimeState.martialDamageBundle1005={id:++state.martialDamageSequence,revived:false,guardHit:false};try{const hp=mon.hp,result=runAttackStagesR('player',[mon,bonusAtk,...args]);ACTION_PRESENTATION58.hit=state.playerAttackOutcome57?.kind==='hit'||mon.hp<hp;ACTION_PRESENTATION58.crit=!!state.playerAttackOutcome57?.crit;return result}finally{if(own){if(RuntimeState.martialDamageBundle1005.guardHit)consumeMartialGuard(state.player);for(const guarded of RuntimeState.martialDamageBundle1005.guardTargets105||[])consumeMartialGuard(guarded);RuntimeState.martialDamageBundle1005=null}}}
function attackPlayerInitialCoreR(mon,bonusAtk=0){state.playerAttackUntil=performance.now()+145;state.playerAttackTarget={x:mon.x,y:mon.y};setPlayerAttackOutcome('attempt',mon);mon.alerted=true;if(state.floor<11)alertNearby(mon.x,mon.y,4);const st=getStats(),w=state.player.weapon||{},ranged=!!(w.ranged||w.kind==='bow');let bonus=bonusAtk;if((state.status?.drunk||0)>0){const drunk=drunkAttackOutcome();if(drunk==='whiff'){setPlayerAttackOutcome('miss',mon,{reason:'drunk-whiff'});floatText(state.player.x,state.player.y,'비틀','#d7c39e',10);addLog('취기가 손끝을 틀어 공격이 허공을 갈랐다.');return false}if(drunk==='heavy'){bonus+=DRUNK_RULES.attackHeavyBonus;floatText(state.player.x,state.player.y,'취중 강타','#e5c987',9)}}if(globalThis.__MANRU_RANDOM57__()<entityAttackMissChance(state.player,mon,{base:.05,max:.45})){setPlayerAttackOutcome('miss',mon,{reason:'evasion'});addLog(mon.name+'이 공격을 피했다.');floatText(mon.x,mon.y,'빗나감','#a9bed2',10);return false}if(!ranged&&state.player.strongReady>0){bonus+=2+state.player.strongReady*2;addLog(`강타 ${state.player.strongReady}단계 발동.`);state.player.strongReady=0}const crit=globalThis.__MANRU_RANDOM57__()<(.07+st.critBonus),dmg=damageEntity(mon,damageFormula(st.atk+bonus,mon.def-(mon.weakened>0?2:0),crit));setPlayerAttackOutcome('hit',mon,{damage:dmg,crit});if(mon.hp>0)setMonsterAttackInvestigation(mon,state.player);mon.hitUntil=performance.now()+115;if(dmg>0)floatText(mon.x,mon.y,'-'+dmg,crit?'#ffe09a':'#f0b7b7',crit?15:13);addLog(`${state.player.name} → ${mon.name}: ${dmg}${crit?' 치명타':''}`);if(w.bleed&&globalThis.__MANRU_RANDOM57__()<w.bleed&&mon.hp>0)damageEntity(mon,3,state.player);if(w.stun&&globalThis.__MANRU_RANDOM57__()<w.stun)mon.stunned=Math.max(mon.stunned||0,1);if(mon.hp<=0)killMonster(mon);else vfVibrate(crit?HAPTIC_PATTERN57.crit:HAPTIC_PATTERN57.hit);return true}
function combatEntityStats(actor){if(actor===state.player)return getStats();return applyCombatDebuffStats57({...actor,vision:actor.vision||monsterSenseRadius(actor)},actor)}
function combatDefenseBonus(target){
 if(!target||target===state.player)return 0;let bonus=martialGuardHit(target),floor=combatDepth(target);
 if(target.shell61>0)bonus+=floor>=16?8:7;
 if(target.role61==='formation'&&state.monsters.some(a=>a!==target&&a.hp>0&&a.role61==='formation'&&entitiesAllied57(a,target)&&entityDistance57(a,target)<=1))bonus+=floor>=21?5:floor>=16?4:floor>=11?3:2;
 return bonus;
}
function damageEntity(entity,amount,source=null,element=null,context={}){
 if(!entity||entity.hp<=0||!Number.isFinite(amount)||amount<=0)return 0;
 const invulnerability=combatInvulnerability(entity);if(invulnerability){floatText(entity.x,entity.y,'무적','#e8d29e',11);addLog(invulnerability);return 0;}
 source=combatEffectActor(source)||source;const before=entity.hp;
 if(entity.bossPattern==='master'&&entity.storyPhase992!==1){
  const stage=entity.coreStage54||0,threshold=BOSS_ARENA_RULES.master.thresholds[stage];
  if(threshold!=null&&before-amount<=Math.ceil(entity.maxHp*threshold)){
   // Resolve the destination before committing either HP or encounter state.
   const destination=selectCoreDestination54(entity,combatTargetValid57(entity,source)?source:selectCombatOpponent(entity)||entity);if(!destination)throw new Error('천실핵 사념체: 도달 가능한 전투 공간이 없습니다.');
   entity.hp=Math.min(before,Math.ceil(entity.maxHp*threshold));beginCorePhase(entity,stage+1,destination);return before-entity.hp;
  }
 }
 if((entity===state?.player||entity.martialActor105)&&amount>=entity.hp&&martialFormOf('constitution',entity)==='revive'&&entity.martial.constitution>0){
  const bundle=RuntimeState.martialDamageBundle1005,revived=bundle&&(bundle.revivedTargets105||(bundle.revivedTargets105=new Set()));if(!revived?.has(entity)){if(revived)revived.add(entity);const lv=entity.martial.constitution;entity.martial.constitution--;entity.hp=Math.max(1,Math.round(entity.maxHp*.8));martialFx('revive',entity);addLog(`필사즉생 — 죽음을 밀어냈다. 체력단련 ${lv}→${lv-1}`);return 0}
 }
 if(combatTargetValid57(entity,source))entity.lastDamageOpponent57=source===state.player?'player':combatantId(source);entity.lastDamageElement105=element;entity.hp-=amount;if(entity.equipmentActor105&&entity.hp>0)updateEquipmentPhase105(entity);if(entity.bossPattern==='needle'){if(entity.hp>0)prepareBossArena(entity);if(context.delivery==='ranged'&&entity.hp>0)entity.needleGasShotReady54=true;if(entity.hp>0)needleEscape(entity,source);}if(entity.bossPattern==='keeper'&&entity.hp>0)tickKeeperLava54(entity,source);
 if(entity!==state?.player&&entity.hp>0&&combatTargetValid57(entity,source)){entity.retaliationId53=source===state.player?'player':(source.allyId53||combatantId(source));entity.retaliationUntilTurn54=state.turn+4;entity.retaliationLastPosition54={x:source.x,y:source.y};entity.alerted=true;}
 if(entity.hiveTree105)mountainHiveDamaged(entity);
 if(!state.debugBattle57&&entity!==state?.player&&entity.hpThreshold57&&before>entity.maxHp*(entity.hpThreshold57.ratio??.5)&&entity.hp<=entity.maxHp*(entity.hpThreshold57.ratio??.5))globalThis.__MANRU_SPECIAL_FLOORS60__?.onMonsterHpThreshold?.(entity,entity.hpThreshold57);
 if(entity!==state?.player&&entity.hp>0&&source&&factionsHostile57(entityFaction(entity),entityFaction(source))){
  if(source===state.player)setMonsterAttackInvestigation(entity,state.player);
  if(!state.debugBattle57&&entity.boss&&BOSS_ARENA_RULES.containment.patterns.includes(entity.bossPattern)){
   prepareBossArena(entity);if(!entity.arena54.mistActive57){entity.arena54.mistActive57=true;addLog(entity.name+'의 결계가 닫혔다. 본거지 중심 31×31 밖은 짙은 독안개다! 안쪽에서 싸워라.');floatText(entity.x,entity.y,'외곽 독안개','#b9d46a',14)}
  }
 }
 if(entity===state?.player&&entity.hp<before){state.lastDamageAgencyTurn57=(state.playerAgencyTurns57||0)+(state._turnPipelineActive57?Number(!!state._turnAgencyWillCount57&&!state._turnAgencyCounted57):1);if(entity.classState?.aimPower>0&&martialFormOf('roar',entity)!=='focus')setAimPower(0);}return before-entity.hp;
}
// World target callbacks receive (cell, inputSource); action context is a separate argument.
function castMartialSmoke(cell,inputSource='pointer',existingAction=null){
 const act=existingAction||playerAction57('martial',{uiOwner:'worldTarget57',skill:true});if(!act.ok)return false;
 const p=state.player,lv=p.martial.roar,info=martialPresentation('roar',MARTIAL_INFO.roar,p);
 if(playerClassRules58(p).roar!=='smoke'||lv<1||p.focus<info.cost){toast('연막을 사용할 기력이 부족하거나 기술을 배우지 않았다.');return false}
 if(!state.visible.has(k(cell.x,cell.y))||entityDistance57(p,cell)>4||tileBlocksSight(state.map[cell.y]?.[cell.x])||!lineClear(p.x,p.y,cell.x,cell.y)){toast('연막을 던질 경로가 막혔다.');return false}
 if(!executeMartialActor(p,'roar',cell))return false;commitPlayerAction57(act,1);return true;
}
function setPlayerStatus(key,turns){
 if(!state?.status||turns<=0)return 0;
 state.status[key]=Math.max(state.status[key]||0,turns);
 if(STATUS_META57[key]?.harmful&&state.player.classState?.aimPower>0&&martialFormOf('roar')!=='focus')setAimPower(0);
 return state.status[key];
}
const CLASS_MARTIAL={
 aim:{name:'명중',cost:3,seal:'準',visual:'aim',desc:'방어·회피를 꿰뚫는 사격. 공격·이동 시 약화, 제자리에서 회복. 피해·해로운 상태이상 시 해제.'},
 smoke:{name:'연막',cost:4,seal:'霧',visual:'smoke',desc:'4칸 내 3/6/9/12 피해. 단계별 1×1~4×4 연막으로 5턴간 사선을 가린다.'}
};
function combatStatus(source,target,kind,turns){return combatTargetValid57(source,target)&&applyCombatStatus(target,kind,turns,1,{source,stagger:kind==='weaken'})}
function damageCombatTarget(source,target,amount,why,color='#e78372'){
 if(!combatTargetValid57(source,target))return 0;const dealt=damageEntity(target,Math.max(0,Math.round(amount)),source);if(dealt>0){floatText(target.x,target.y,'-'+dealt,color,15);impact(target.x,target.y,color,5);addLog(`${source.name} → ${target.name}: ${why} -${dealt} HP`);}if(target.hp<=0){if(target===state.player)die(why);else killMonster(target)}return dealt;
}
function expireCombatFields(){
 for(const f of [...state.tempFields]){if(f.kind==='steam'&&state.turn<=f.bornTurn)continue;f.ttl--;if(f.ttl===1&&f.martialSmoke&&f.smokeForm==='burst'){martialFx('warning',f);addLog('폭연이 붉게 물들었다. 다음 턴 폭발!')}if(f.ttl<=0)expireMartialSmoke(f)}state.tempFields=state.tempFields.filter(f=>f.ttl>0);syncSmokeEntry(false);
}
function entityAttackMissChance(attacker,target,{base=.06,max=.42,evaScale=1,evaIgnore=0}={}){const blinded=combatStatusTurns(attacker,'blind')>0,eva=Math.max(0,Number(target?combatEntityStats(target).eva:0)||0),minChance=target===state?.player?0:base;return clamp(base+Math.max(0,eva-evaIgnore)*evaScale*.022+(blinded?STATUS_META57.blind.missPenalty57:0),minChance,max)}
const MARTIAL_INFO={strong:{name:'강타',type:'active',cost:3,desc:'기력을 모아 다음 한 번의 근접 공격을 강화.'},roar:{name:'호효',type:'active',cost:5,desc:'주변 적에게 피해와 경직. 레벨 1/2/3/4의 반경은 각각 1/2/3/4칸. 벽 너머에는 닿지 않는다.'},ghost:{name:'귀영',type:'active',cost:4,desc:'적의 감지·추적·직접 조준을 끊는다. 공격하면 해제. 이미 예고된 범위 공격과 지형 피해는 피해야 한다. 단계가 높을수록 오래 유지.'},brawl:{name:'격투',type:'passive',cost:0,desc:'맨손과 권갑의 공격력을 단계당 +1 높인다. 권갑은 기본 성능이 높지만 강화 효율이 매우 낮다.'},constitution:{name:'체력 단련',type:'passive',cost:0,desc:'강화할 때마다 최대 HP 약 8% 증가.'}};
function upgradeMartial(id){globalThis.__MANRU_UX45_ACTIONS__?.markDirty?.();const p=state.player;if(p.skillPoints<=0){toast('무술 포인트가 없다.');return}if(!MARTIAL_INFO[id]||p.martial[id]>=martialCap(id,p)){toast('현재 상한에 도달했다.');return}p.skillPoints--;p.martial[id]++;if(id==='constitution')recomputeMaxHp(p,true);addLog(`${martialPresentation(id,MARTIAL_INFO[id],p).name} ${p.martial[id]}단계.`);renderMartialPanel();updateAll()}
function martialRoarRange(lv){return Math.max(1,Math.min(4,Math.floor(lv||1)))}
function activateMartial(id){globalThis.__MANRU_UX45_ACTIONS__?.markDirty?.();globalThis.__MANRU_ITEM_IDENTITY991__?.closeSkillQuick?.();const act=playerAction57('martial',{allowMartial:true,skill:true,closeMartial:true,stunMessage:'몸이 굳어 무술을 펼치지 못했다.'});if(!act.ok){if(id==='roar'&&playerClassRules58().roar==='aim'&&['stun','skillSeal'].includes(act.reason))globalThis.__MANRU_MARTIAL_FX965__?.pulse?.('aimBreak',680);return !!act.consumed;}cancelAutoWalk();const p=state.player,lv=p.martial[id],info=martialPresentation(id,MARTIAL_INFO[id],p);if(info.type!=='active'){toast('지속 효과 무술이다.');return false}if(!lv){toast('먼저 무술을 배워야 한다.');return false}if(p.focus<info.cost){toast('기력이 부족하다.');return false}if(mountainWoodSlot(p)===id)return mountainWoodCast(id,act);if(id==='roar'&&playerClassRules58(p).roar==='smoke'){if(martialFormOf('roar')==='cloud')return castMartialSmoke({x:p.x,y:p.y},'self',act);
 const cells=[];for(let y=Math.max(0,p.y-4);y<=Math.min(ROWS-1,p.y+4);y++)for(let x=Math.max(0,p.x-4);x<=Math.min(COLS-1,p.x+4);x++)if(state.visible.has(k(x,y))&&!tileBlocksSight(state.map[y][x])&&lineClear(p.x,p.y,x,y))cells.push({x,y,dx:x-p.x,dy:y-p.y,dist:Math.max(Math.abs(x-p.x),Math.abs(y-p.y))});
 if(!cells.length){toast('연막을 던질 수 있는 칸이 없다.');return false}closeMartial();return beginWorldTarget({kind:'smoke',title:info.name,text:`사거리 4칸 · ${lv}×${lv} · 피해 ${lv*3} · 기 4 · 목표 칸 선택`,range:4,cells,onPick:castMartialSmoke});
 }if(!executeMartialActor(p,id))return false;if(!(id==='strong'&&martialFormOf(id)==='guard')&&!(id==='roar'&&playerClassRules58(p).roar==='aim'&&!p.classState.aimPower))globalThis.__MANRU_MARTIAL_FX965__?.used?.(id,lv);if(lv>=5)martialFx('transcend');closeMartial();commitPlayerAction57(act,id==='ghost'?.85:1);return true}
function martialCardClasses(id,p=state.player){const v=martialPresentation(id,MARTIAL_INFO[id],p);return `martialCard991 skill-${v.visual||id} ${v.classStyle||''} ${p.martial[id]===5?'martialTranscend1005':''} form-${martialFormOf(id,p)||'base'}`}
function martialCardContent(id,p=state.player,title='',note='',compact=false){const v=martialPresentation(id,MARTIAL_INFO[id],p);return `<div class="skillSig991">${v.seal||(id==='strong'?'力':id==='roar'?'吼':id==='ghost'?'影':id==='brawl'?'拳':v.classStyle?'力':'體')}</div><div class="skillCopy991"><h4>${title||v.name}</h4><div class="martialLv991">${'◆'.repeat(p.martial[id])}${compact?'':'◇'.repeat(Math.max(0,martialCap(id,p)-p.martial[id]))} · ${v.type==='active'?`기력 ${v.cost}`:'지속 효과'}</div><p>${note?note+'<br>':''}${compact?dojoMartialSummary(id,p):v.desc}</p></div>`}
function openMartial(){
  if(!gameplayUiOpen57()||cipherOpen)return false;globalThis.__MANRU_UX45_ACTIONS__?.beginViewer?.();if(!state||cipherOpen)return;globalThis.__MANRU_ITEM_IDENTITY991__?.closeSkillQuick?.();martialOpen=true;renderMartialPanel();document.getElementById('martialPanel').style.display='block';globalThis.__MANRU_UX45_ACTIONS__?.finishViewer?.();
}
function closeMartial(){martialOpen=false;document.getElementById('martialPanel').style.display='none';globalThis.__MANRU_UX45_ACTIONS__?.finishClose?.();}
function die(by){if(!RunLifecycle.terminate('death'))return false;RuntimeState.ui.deathCause=by;vfVibrate(HAPTIC_PATTERN57.death);beginEndingPresentation();addLog('사망 원인: '+by);updateAll();presentDeath(by)}
  /* ---------- combat math fixes: armor pierce, holy, fair boss control ---------- */
  function attackPlayerCore54R(mon,bonusAtk=0,context={}){
    if(!state||!mon)return false;
    if(['jar','terrain'].includes(mon.type))return attackTerrainTargetR8(mon);
    if(combatGuardBlocks57(state.player,mon)){setPlayerAttackOutcome('blocked',mon,{reason:'guard'});return false}
    const p=state.player,st=getStats(),w=p.weapon||{},ranged=!!(w.ranged||w.kind==='bow');
    state.playerAttackUntil=performance.now()+150;state.playerAttackTarget={x:mon.x,y:mon.y};setPlayerAttackOutcome('attempt',mon);mon.alerted=true;const noiseRadius=state.floor<11?4:ranged?6:state.player.strongReady>0?7:5;
    const aim=ranged?(context.aimPower??p.classState?.aimPower??0):0,ammo=ranged?(globalThis.MANRU_AMMO||[]).find(a=>a.ammoKind===state._activeAmmo967?.ammoKind):null;
    if(aim>0&&!context.shotBundle)setAimPower(aim-1,'attack');
    const missChance=entityAttackMissChance(p,mon,{base:.05,max:mon.boss?.26:.34,evaScale:aim?.5:1,evaIgnore:ranged&&w.tracking?6:0});
    if(globalThis.__MANRU_RANDOM57__()<missChance){alertNearby(mon.x,mon.y,noiseRadius,ranged?'projectile':'combat');setPlayerAttackOutcome('miss',mon,{reason:'evasion'});mon.evadeUntil=performance.now()+220;floatText(mon.x,mon.y,'회피','#b7c8d4',11);addLog(mon.name+'이 공격을 피했다.');sfx54('miss');return false}
    const ready=!ranged?p.strongReady:0;let bonus=bonusAtk+(ammo?.atkBonus||0);if(ready>0){bonus+=strongBonus(ready)-(martialFormOf('strong')==='drive'?2:0);addLog(`${martialPresentation('strong',MARTIAL_INFO.strong,p).name} ${ready}단계 발동.`);p.strongReady=0}
    const nativeHoly=(w.holy||0)&&['spirit','undead'].includes(mon.kind)?w.holy:0,holyBrand=w.elementBrand74==='holy'&&mon.kind==='undead'?5:0,holy=nativeHoly+holyBrand;
    const defenseBonus=combatDefenseBonus(mon);
    const crit=globalThis.__MANRU_RANDOM57__()<(.07+st.critBonus),dmg=damageEntity(mon,damageFormula(st.atk+bonus+holy,combatEntityStats(mon).def,crit,{defenseBonus,defenseIgnore:ammo?.pierce||0,defenseScale:(w.armorPierce?.25:1)*(aim?.5:1),damageScale:aim?aim/4:1}), state.player,null,{delivery:ranged?'ranged':'melee'});
    alertNearby(mon.x,mon.y,noiseRadius,ranged?'projectile':'combat',dmg);
    setPlayerAttackOutcome('hit',mon,{damage:dmg,crit});mon.hitUntil=performance.now()+170;mon.hitDir={x:Math.sign(mon.x-p.x),y:Math.sign(mon.y-p.y)};slashFX(p.x,p.y,mon.x,mon.y,crit?'#ffe8a2':'#e7d4d4');impact(mon.x,mon.y,crit?'#ffe09a':'#e7c8c8',crit?5:3);if(dmg>0)floatText(mon.x,mon.y,'-'+dmg,crit?'#ffe09a':'#f0b7b7',crit?16:13);addLog(`${p.name} → ${mon.name}: ${dmg}${crit?' 치명타':''}${w.armorPierce?' · 방어관통':''}`);sfx54(crit?'crit':'hit');
    if(context.wasStealthed&&martialFormOf('ghost')==='assassin'&&mon.hp>0){setMonsterWeakened(mon,MARTIAL_RULES.assassinTurns);martialFx('assassin',mon)}if(ready>0&&martialFormOf('strong')==='drive'&&mon.hp>0)resolveDrive(mon,ready,p);
    if(dmg>0&&!mon.statusImmune&&w.bleed&&globalThis.__MANRU_RANDOM57__()<w.bleed&&mon.hp>0)damageEntity(mon,3, state.player);
    if(dmg>0&&w.stun&&mon.hp>0){if(mon.boss){mon.controlCd54=Math.max(0,mon.controlCd54||0);if(mon.controlCd54<=0&&globalThis.__MANRU_RANDOM57__()<w.stun*.45){setMonsterStatus(mon,'stunned',1);mon.controlCd54=4;mon.controlCdTurn54=state.turn;floatText(mon.x,mon.y,'경직','#d5c58e',10)}}else if(globalThis.__MANRU_RANDOM57__()<w.stun)setMonsterStatus(mon,'stunned',Math.max(mon.stunned||0,1))}
    if(mon.guardReady1005>0){const bundle=RuntimeState.martialDamageBundle1005;if(bundle)(bundle.guardTargets105||(bundle.guardTargets105=new Set())).add(mon);else consumeMartialGuard(mon);}if(mon.hp<=0)killMonster(mon);else vfVibrate(crit?HAPTIC_PATTERN57.crit:HAPTIC_PATTERN57.hit);return true;
  }
  function monsterAttacksTarget(m,bonus=0,context={}){context={target:selectCombatOpponent(m)||state.player,...context};if(state.dead)return monsterAttackResultR(m,context,{attempted:false,blocked:true,reason:'dead'});return attackMonster(m,bonus,context)}
  function martialPulse(type,duration=680){FX965.pulse={type,start:performance.now(),until:performance.now()+duration};globalThis.__MANRU_RENDER47__?.invalidate?.()}
  function martialUsedFx(id){if(!state)return false;if(id==='ghost'){martialPulse('ghost',780);burst(state.player.x,state.player.y,'#9dcad4',22,1.05);impact(state.player.x,state.player.y,'#718e9b',7);floatText(state.player.x,state.player.y,martialPresentation('ghost',MARTIAL_INFO.ghost,state.player).name,'#c7eef0',14);globalThis.__MANRU_SFX54__?.play?.('evade')}else if(id==='strong'){martialPulse('strong',840);burst(state.player.x,state.player.y,'#efaa48',18,.95);floatText(state.player.x,state.player.y,'축기','#ffd38a',13);globalThis.__MANRU_SFX54__?.play?.('warn')}else if(id==='roar'){martialPulse(playerClassRules58(state.player).roar==='aim'?'aim':'roar',740);burst(state.player.x,state.player.y,'#dca45a',30,1.3);floatText(state.player.x,state.player.y,martialPresentation('roar',MARTIAL_INFO.roar,state.player).name,'#ffe2a0',15)}return true}
function cursedBladeCritBonus(){return equipped47('curse_blade')?cursedEquipped47()*.05:0}
function earthGauntletDefBonus(){if(!equipped47('earth_gauntlet'))return 0;const p=state.player,s=Math.max(0,p.legendEarthStacks47||0),raw=Math.max(0,p.baseDef+armorEffectiveDef(p.armor)+(p.cloak?.def||0)+(p.relic?.def||0)+(p.trinket?.def||0));return Math.max(0,Math.floor(s/(1+raw*.10)))}
function resolveWaterWeaponBlast(actor,pos){if(!pos)return;const cells=elementCells105(pos.x,pos.y,1),source=effectSource57(actor);emitElementContact105('water',cells,source);elementAttackFx105('water',cells,pos);burst(pos.x,pos.y,'#72d3ef',18,.8);for(const target of [state.player,...state.monsters])if(combatTargetValid57(actor,target)&&entityFootprintCells57(target).some(c=>cells.some(p=>p.x===c.x&&p.y===c.y))){const dealt=damageEntity(target,4,actor,'water');if(dealt>0)floatText(target.x,target.y,'폭쇄 -'+dealt,'#9bdee8',9,'water');if(target.hp<=0){if(target===state.player)die('해압 폭쇄');else killMonster(target);}}}
/* Dojo: graph producer -> persistent branch terrain -> validator -> existing owners. */
function martialTargets(actor){return[state.player,...state.monsters].filter(target=>combatTargetValid57(actor,target))}
function martialCheckDeath(target,source){if(target.hp>0)return;if(target===state.player)die(source.name||'무술');else killMonster(target)}
function executeMartialActor(actor,id,cell=null){
 const lv=actor.martial?.[id]||0,info=martialPresentation(id,MARTIAL_INFO[id],actor),form=martialFormOf(id,actor),player=actor===state.player,status=player?state.status:(actor.martialStatus105||(actor.martialStatus105={}));
 if(lv<1||info.type!=='active'||actor.focus<info.cost||(player?state.status.skillSeal:actor.skillSeal105)>0)return false;
 const family=martialFamily(id,actor);
 if(family==='smoke'&&(!cell||entityDistance57(actor,cell)>4||tileBlocksSight(state.map[cell.y]?.[cell.x])||!lineClear(actor.x,actor.y,cell.x,cell.y)))return false;
 actor.focus-=info.cost;
 if(id==='strong'){actor.strongReady=form==='guard'?0:lv;actor.guardReady1005=form==='guard'?strongBonus(lv):0;actor.guardCharges1005=form==='guard'?MARTIAL_RULES.guardActions:0;martialFx(form==='guard'?'guard':'drive',actor)}
 else if(id==='ghost'){const duration=ghostDuration(lv)+(player?1:0);status.stealth=Math.max(status.stealth||0,duration);status.evade=Math.max(status.evade||0,duration);if(player)for(const m of state.monsters)if(isHostileTarget57(m))clearPlayerTracking58(m);martialFx('assassin',actor)}
 else if(family==='aim'){actor.classState.aimBornAgency=(state.playerAgencyTurns57||0)+1;actor.classState.aimMoveAgency=-1;setAimPower(5+lv)}
 else if(family==='smoke'){
  const center=form==='cloud'?actor:cell,cells=form==='cloud'?smokeCells(center,lv):martialSmokeCells(center,lv);status.stealth=0;projectileFX(actor.x,actor.y,center.x,center.y,'#aab6ba');alertNearby(center.x,center.y,6,'projectile');markCombatActivity57('martial-smoke');
  for(const m of martialTargets(actor))if(cells.some(c=>monCovers(m,c.x,c.y))&&!globalThis.__MANRU_ASURA61__?.blocksDirect?.(m,actor)){damageEntity(m,lv*3,actor);martialCheckDeath(m,actor)}
  const owner=player?'player':actor.dojoActorId105;if(form==='cloud')state.tempFields=(state.tempFields||[]).filter(f=>!(f.martialSmoke&&f.smokeForm==='cloud'&&f.owner===owner));
  addField('smoke',center.x,center.y,MARTIAL_RULES.smokeTurns+Number(player),cells,{martialSmoke:true,smokeForm:form,castDamage:lv*3,castLevel:lv,...effectSource57(actor),owner,sourceFaction:entityFaction(actor)});if(player)syncSmokeEntry();martialFx('cloud',center);
 }else performRoar(true,actor);
 installMartialJar(actor);floatText(actor.x,actor.y,info.name,lv===5?'#f5e9d0':'#d6b77d',12);addLog(`${actor.name} · ${info.name} ${lv}단 · 기 ${info.cost} 소모.`);if(lv===5)martialFx('transcend',actor);return true;
}
function consumeMartialGuard(actor){
 if(!(actor.guardReady1005>0)){actor.guardCharges1005=0;return;}
 actor.guardCharges1005=Math.max(0,Math.min(MARTIAL_RULES.guardActions,Math.floor(Number(actor.guardCharges1005??MARTIAL_RULES.guardActions)||0))-1);
 if(!actor.guardCharges1005)actor.guardReady1005=0;
}
function martialGuardHit(actor){const n=actor.guardReady1005||0;if(n)martialFx('guard',actor);return n}
function syncMartialActorStats(mon){const e=equipmentContributions105(mon),s=mon.martialStatus105||{};mon.atk=mon.baseAtk+e.atk;mon.def=Math.max(0,mon.baseDef+e.def-(mon.shredDef105||0));mon.eva=mon.baseEva+e.eva+(s.evade>0?3:0)+(s.stealth>0?4:0);mon.will=(mon.baseWill||0)+e.will;mon.baseMaxFocus105=Number.isFinite(mon.baseMaxFocus105)?mon.baseMaxFocus105:mon.maxFocus;const cursed=globalThis.__MANRU_ITEM_IDENTITY991__?.curseStats?.({def:mon.def,eva:mon.eva,will:mon.will,vision:mon.baseVision||7,maxFocus:mon.baseMaxFocus105},mon);if(cursed){mon.def=Math.max(0,cursed.def);mon.eva=Math.max(0,cursed.eva);mon.will=cursed.will;mon.maxFocus=cursed.maxFocus;mon.focus=Math.min(mon.focus,mon.maxFocus)}mon.reach=weaponRange(mon);mon.armorPierce=!!mon.weapon?.armorPierce;mon.weaponRecovery105=Math.max(0,mon.weaponRecovery105||0);}
function tickMartialActor(mon){const s=mon.martialStatus105||(mon.martialStatus105={});for(const key of ['stealth','evade'])if(s[key]>0)s[key]--;mon.martialCd105=Math.max(0,(mon.martialCd105||0)-1);mon.blinkCd105=Math.max(0,(mon.blinkCd105||0)-1);recoverActorFocus105(mon,state.turn);const fr=+mon.cloak?.focusRegen||1;if(fr>1){mon.cloakFocusCarry1006=(mon.cloakFocusCarry1006||0)+(fr-1)/10;while(mon.cloakFocusCarry1006>=1){mon.cloakFocusCarry1006--;mon.focus=Math.min(mon.maxFocus,mon.focus+1);}}syncMartialActorStats(mon)}
function martialSmokeCells(center,lv){const ox=Math.floor((lv-1)/2)+(lv%2===0?rand(0,1):0),oy=Math.floor((lv-1)/2)+(lv%2===0?rand(0,1):0),out=[];for(let dy=0;dy<lv;dy++)for(let dx=0;dx<lv;dx++){const x=center.x-ox+dx,y=center.y-oy+dy;if(x>=0&&y>=0&&x<COLS&&y<ROWS&&!tileBlocksSight(state.map[y][x])&&lineClear(center.x,center.y,x,y))out.push({x,y});}return out;}
function applyWeaponBrandHit(actor,target,damage,contact=entityFootprintCells57(target),context={}){
 if(damage<=0)return;if(actor.weapon?.artifactId46==='water_crossbow'&&context.delivery!=='area')resolveWaterWeaponBlast(actor,contact[0]||target);
 const elem=actor.weapon?.elementBrand74;if(!elem)return;
 const source=effectSource57(actor),hurt=(victim,base)=>resolveElementDamage57(victim,elem,base,{contactHandled105:true,effect:source,source:'무기각인',color:'#e5c080'}).damage;
 emitElementContact105(elem,contact,source,{baseDamage:Math.max(1,damage),directTarget:target});if(target.hp<=0)return;
 if(elem==='fire'){hurt(target,2);if(target.hp>0)combustionContact105(target,'fire',source)}
 else if(elem==='shock'&&globalThis.__MANRU_RANDOM57__()<.22){const other=[state.player,...state.monsters].find(m=>m!==target&&combatTargetValid57(actor,m)&&entityDistance57(m,target)<=1);if(other)hurt(other,4)}
 else if(elem==='water'&&globalThis.__MANRU_RANDOM57__()<.28)applyCombatStatus(target,'weaken',2,1,{source:actor});
 else if(elem==='ice'&&globalThis.__MANRU_RANDOM57__()<.16){if(target.boss){if((target.controlCd54||0)<=0&&globalThis.__MANRU_RANDOM57__()<.45)applyMartialControl1005(target,1)}else applyCombatStatus(target,'stun',1,1,{source:actor,element:elem});}
 else if(elem==='grass'&&globalThis.__MANRU_RANDOM57__()<.32)applyCombatStatus(target,'poison',3,1,{source:actor});
 else if(elem==='earth'){hurt(target,3);if(target.hp>0&&globalThis.__MANRU_RANDOM57__()<.25)resolveForcedMovement57(target,actor,1,{mode:'push',hostile:true,creditPlayer:entityFaction(actor)==='player'})}
}
function finishMartialStrike(mon,target,result,ready,stealth,ctx={}){if(mon.equipmentActor105&&ctx.delivery==='area')return;if(!mon.martialActor105){if(mon.weapon?.focusChain&&Number.isFinite(mon.focus)&&Number.isFinite(mon.maxFocus))equipmentFocusChain105(mon,result.hit&&result.damage>0);if(result.attempted&&(mon.weapon||mon.upset>0)){const cost=weaponActionCost(mon.weapon)*(mon.upset>0?1.2:1)*(1+.08*(globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('clumsy',mon)||0));mon.weaponCostCarry105=(mon.weaponCostCarry105||0)+Math.max(0,cost-1);mon.weaponRecovery105=Math.floor(mon.weaponCostCarry105);mon.weaponCostCarry105-=mon.weaponRecovery105;}if(result.hit&&result.damage>0&&mon.weapon){equipmentHit105(mon,target);}return}if(mon.martialActor105){equipmentFocusChain105(mon,result.hit&&result.damage>0);if(result.attempted){mon.weaponCostCarry105=(mon.weaponCostCarry105||0)+Math.max(0,weaponActionCost(mon.weapon)*(mon.upset>0?1.2:1)*(1+.08*(globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('clumsy',mon)||0))-1);mon.weaponRecovery105=Math.floor(mon.weaponCostCarry105);mon.weaponCostCarry105-=mon.weaponRecovery105;}if(mon.martialStatus105)mon.martialStatus105.stealth=0;if(result.hit&&result.damage>0){equipmentHit105(mon,target);if(target===state.player&&target.hp<=0)die(mon.name);mon.strongReady=0;if(stealth&&martialFormOf('ghost',mon)==='assassin')(target===state.player?applyHostileStatus('weaken',MARTIAL_RULES.assassinTurns,1):setMonsterWeakened(target,MARTIAL_RULES.assassinTurns));if(ready&&martialFormOf('strong',mon)==='drive')resolveDrive(target,ready,mon)}syncMartialActorStats(mon);}}
function resolveCombatIllness(target){
 if(!target||target===state.player||target.hp<=0)return 0;const source=target.illnessSource105;target.illness105=0;target.illnessSource105=null;
 const damage=damageEntity(target,STATUS_META57.illness.monsterDamage57,source);if(damage>0){floatText(target.x,target.y,`중병 -${damage}`,'#c892d5',13);addLog(`${target.name}의 중병이 발현되어 ${damage} 피해를 입었다.`);}if(target.hp<=0)killMonster(target);return damage;
}
function applyCombatStatus(target,key,turns,chance=1,opts={}){
 if(!state||!target||target.hp<=0||turns<=0)return false;
 const kind=STATUS_META57[key]?key:Object.keys(STATUS_META57).find(k=>STATUS_META57[k].monsterField57===key)||key,meta=STATUS_META57[kind];
 if(target===state.player)return applyHostileStatus(kind,turns,chance,opts);
 const cloak=target.cloak||{};if(target.statusImmune||cloak.statusImmune||kind==='poison'&&monsterPoisonImmune(target)||(opts.element==='ice'||opts.cold)&&entityElementGuard57(target,'ice'))return false;
 if(opts.stagger||kind==='stun'){const resist=clamp(Number(cloak.staggerResist)||0,0,.95);if(resist&&globalThis.__MANRU_RANDOM57__()<resist){floatText(target.x,target.y,'경직 저항','#b9d7cd',9);return false}}
 if(chance<1&&globalThis.__MANRU_RANDOM57__()>=hostileStatusChance(chance,target.will||0))return false;
 const field=meta?.monsterField57||kind;
 if(kind==='illness'&&target.illness105>0){if(opts.source)target.illnessSource105=effectSource57(opts.source);target.illness105=Math.max(0,target.illness105-6);if(!target.illness105)resolveCombatIllness(target);return true}
 if(kind==='illness')target.illnessBorn105=state.turn;
 if(kind==='weaken')return setMonsterWeakened(target,turns);
 return !!setMonsterStatus(target,field,Math.max(combatStatusTurns(target,kind),turns),opts.source||null,{resistanceHandled105:true});
}
// Class rules are pure per-player queries; no run or item prototypes are mutated.
function playerClassRules58(p=state?.player){if(p?.martialActor105)return {roar:p.martialFamily105||'roar'};return {talismanFusion:true,upgradeTalismanMode:'gear',roar:'roar',...(CLASSES.find(c=>c.id===p?.classId)?.rules||{})}}
function rollMartialChoices1005(p=state.player,rng=globalThis.__MANRU_RANDOM57__,initial=[]){
 const out=initial.slice(),used=new Set(out.map(c=>c.id+':'+c.form));
 const pool=MARTIAL_RULES.ids.map(id=>({id,weight:1+(p.martial[id]||0),choices:martialOptions(id,p).filter(c=>!used.has(c.id+':'+c.form))})).filter(x=>x.choices.length);
 // Draw the family first. Only the selected final option is removed, so six unique offers are possible across five slots.
 while(pool.length&&out.length<6){let r=rng()*pool.reduce((n,x)=>n+x.weight,0),i=0;for(;i<pool.length-1;i++){r-=pool[i].weight;if(r<0)break}const family=pool[i],j=Math.min(family.choices.length-1,Math.floor(rng()*family.choices.length));out.push(family.choices.splice(j,1)[0]);if(!family.choices.length)pool.splice(i,1)}return out;
}
function applyMartialControl1005(mon,turns){if(!mon||mon.hp<=0)return false;if(mon.boss){if((mon.controlCd54||0)>0||!setMonsterStatus(mon,'stunned',1))return false;mon.controlCd54=4;mon.controlCdTurn54=state.turn;return true}return setMonsterStatus(mon,'stunned',Math.max(mon.stunned||0,turns))}
function wallCollisionFx1005(mon,wall){const colors=martialWallPalette1005(wall.x,wall.y,state.map[wall.y]?.[wall.x]),x=(mon.x+wall.x)/2,y=(mon.y+wall.y)/2;for(const color of colors)burst(x,y,color,5,.55);martialFx('collision',{x,y},{tones:colors});impact(x,y,colors[2],5)}
function trapEvent(x,y,entity=state.player){
  if(!entity){setTerrainTile58(state.map,x,y,TT.FLOOR);burst(x,y,'#b99373',10,.6);addLog('돌의 무게에 함정이 먼저 터졌다.');return true}
  const cloak=entity===state.player?playerCloak():(entity.cloak||{});
  if(cloak.trapGuard&&globalThis.__MANRU_RANDOM57__()<cloak.trapGuard){setTerrainTile58(state.map,x,y,TT.FLOOR);burst(x,y,'#b6a98d',9,.55);floatText(x,y,'완충','#d7c9ac',10);addLog(`${cloak.name}가 함정 충격을 받아냈다.`);return true}
  const roll = globalThis.__MANRU_RANDOM57__();
  vfVibrate(HAPTIC_PATTERN57.trap);
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  impact(x,y,"#d28766",3);
  burst(x,y,"#d28766",12,.8);
  if(roll < 0.45){
    const dmg = damageEntity(entity,rand(5,9));
    if(dmg>0){floatText(x,y,"-"+dmg,"#ff9c7e",14);addLog("철침 함정 작동! -" + dmg + " HP");}
  }else if(roll < 0.75){
    applyCombatStatus(entity,'bleed',5);
    addLog("베는 함정! 출혈.");
  }else{
    applyCombatStatus(entity,'poison',6);
    addLog("독침 함정! 중독.");
  }
  if(entity.hp<=0){if(entity===state.player)die("함정");else killMonster(entity)}
}
function altarEvent(x,y){
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  const gains=Number.isFinite(state.player.bloodAltarGains105)?Math.max(0,Math.floor(state.player.bloodAltarGains105)):0,chance=.5/(1+gains);
  const roll = globalThis.__MANRU_RANDOM57__();
  if(roll < chance){
    state.player.bloodAltarGains105=gains+1;
    state.player.baseAtk += 1;
    state.player.baseWill += 1;
    addLog("혈흔 제단이 힘을 주었다. ATK +1, WILL +1");
  }else if(roll < chance+(1-chance)*7/11){
    damageEntity(state.player,Math.min(6,Math.max(0,state.player.hp-1)));
    state.player.focus = Math.min(getStats().maxFocus, state.player.focus + 6);
    addLog("제단에 피를 바치고 FOCUS를 얻었다. HP -6, FOCUS +6");
  }else{
    spawnMonster(PlacementService.randomFloor(1), false);
    addLog("제단이 갈라지며 요괴를 토해냈다.");
  }
}
const ACTION_PRESENTATION58={run:null,until:0,start:0,kind:null,target:null,source:null,weapon:null,hit:false,inputUntil:0};
function presentPlayerAction58(kind,target=null){
 if(!state||state.generationInProgress57)return;
 const now=performance.now(),p=state.player,a=ACTION_PRESENTATION58,rate=automationPresentationRate70();
 Object.assign(a,{run:state,start:now,until:now+(kind==='attack'?260:240)/rate,inputUntil:now+85/rate,rate,kind,source:{x:p.x,y:p.y},target:target?{x:target.x,y:target.y}:null,entity:target,pending:true,weapon:p.weapon?.kind||'brawl',hit:false,crit:false,strong:false});
}


function drunkMovementOutcome57(){if(globalThis.__MANRU_RANDOM57__()>=DRUNK_RULES.movementUnstable)return'steady';return globalThis.__MANRU_RANDOM57__()<DRUNK_RULES.movementWanderWithinUnstable?'misstep':'stumble'}
function applyCombatDebuffStats57(stats,actor=state?.player){
 if(!stats||!actor)return stats;
 if(combatStatusTurns(actor,'weaken')>0){stats.atk=Math.max(1,Math.round(stats.atk*.80*100)/100);stats.def=Math.max(0,Math.round(stats.def*.75*100)/100);stats.eva=Math.max(0,Math.round(stats.eva*.80*100)/100)}
 if(combatStatusTurns(actor,'blind')>0){const rule=STATUS_META57.blind,nightmare=globalThis.__MANRU_ITEM_IDENTITY991__?.cursePower?.('nightmare',actor)||0;stats.vision=Math.max(nightmare>0?rule.nightmareVisionFloor57:rule.visionFloor57,Math.floor(stats.vision*rule.visionScale57))}
 return stats
}
function applyJarGasEffects57(){
  if(!state||state.dead||state.victory)return;
  for(const target of [state.player,...state.monsters]){if(target.hp<=0)continue;const concentration=status=>{const gas=jarGasConcentrationMap57(status,target);return Math.max(0,...entityFootprintCells57(target).map(q=>gas.get(jarGasCellKey57(q.x,q.y))||0));};const drunk=concentration('drunk'),pc=concentration('poison');if(drunk)applyCombatStatus(target,'drunk',4);if(!pc||target!==state.player&&monsterPoisonImmune(target))continue;const source=jarGasState57().find(f=>(f.status57||'poison')==='poison'&&(!f.sourceFaction||effectCanAffect57(f,target))&&entityFootprintCells57(target).some(q=>(f.cells||[]).some(c=>c.x===q.x&&c.y===q.y&&c.c===pc)));applyCombatStatus(target,'poison',target===state.player?(pc>=3?4:pc===2?3:2):(pc>=3?5:pc===2?4:3),1,{source:source?.sourceFaction?source:null});}
}
function combatTerrainTargetCheckR8(target,range=weaponRange()){
  if(!state||!target||!['jar','terrain'].includes(target.type)||!elementalWorldTarget105(target.x,target.y))return{ok:false,reason:'공격할 가구가 없다.'};if(!state.seen.has(k(target.x,target.y)))return{ok:false,reason:'확인하지 못한 가구다.'};return combatLineCheckR8(state.player.x,state.player.y,target.x,target.y,{range,units:!!(state.player.weapon?.ranged||state.player.weapon?.kind==='bow')})
}
function entityClosestCellTo57(entity,target){const cells=entityFootprintCells57(entity),other=entityFootprintCells57(target);let best=null,bd=Infinity;for(const a of cells)for(const b of other){const d=Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));if(d<bd){bd=d;best={x:a.x,y:a.y,dist:d}}}return best}
function armorUpgradeStepGain42(base,step=1){const n=Math.max(1,Math.floor(+step||1));return(ARMOR_DIM_BASE_GAIN+Math.max(0,+base||0)*ARMOR_DIM_BASE_WEIGHT)/(1+ARMOR_DIM_DECAY*(n-1))}
function isHostileTarget57(mon){return entitiesHostile57(state?.player,mon)}
// Shared adjacent selection: facing cell first, then existing attack priorities/direction distance.
function selectFacingAdjacentTarget57(candidates,priority=null){
 if(!state?.player)return null;const p=state.player,f=p.facing||{x:0,y:-1},fx=p.x+f.x,fy=p.y+f.y;
 const near=candidates.filter(q=>entityDistance57(q,p)<=1);
 const face=near.find(q=>entityFootprintCells57(q).some(c=>c.x===fx&&c.y===fy));
 return face||near.sort((a,b)=>(priority?priority(a,b):0)||Math.abs(a.x-fx)+Math.abs(a.y-fy)-Math.abs(b.x-fx)-Math.abs(b.y-fy))[0]||null;
}
const HAPTIC_PATTERN57=Object.freeze({
  hit:24,crit:38,hurt:30,trap:34,toggle:24,
  kill:Object.freeze([28,18,60]),bossKill:Object.freeze([38,24,82]),
  ambush:Object.freeze([24,20,62]),summon:Object.freeze([26,18,26,18,70]),
  boss:Object.freeze([36,25,82]),death:Object.freeze([75,45,125])
});
function registerMonsterAttackStageR25(id,fn){if(typeof fn!=='function')throw new TypeError('monster attack stage must be a function');if(MANRU_ATTACK_PIPELINE_R.monsterStages.some(x=>x.id===id))throw new Error('duplicate monster attack stage: '+id);MANRU_ATTACK_PIPELINE_R.monsterStages.push({id,fn});return fn}
// WILL is the player's universal resistance against chance-based hostile status effects.
// Curve: effective proc chance = base chance * 6/(6+WILL). It never grants immunity;
// explicit statusImmune gear remains the only full immunity source.
function hostileStatusChance(baseChance,willOverride=null){
  const w=Number(willOverride==null?getStats().will:willOverride)||0,den=Math.max(1,6+w);
  return clamp((Number(baseChance)||0)*(6/den),0,.95);
}
function applyHostileStatus(key,turns,baseChance=1,opts={}){if(!state||state.dead||turns<=0)return false;const cloak=playerCloak();if(cloak.statusImmune)return false;if((opts.element==='ice'||opts.cold)&&entityElementGuard57(state.player,'ice'))return false;if(key==='poison'&&(state.status?.poisonResist57||0)>0)return false;if(opts.stagger){const r=Math.max(0,Math.min(.95,Number(cloak.staggerResist)||0));if(r>0&&globalThis.__MANRU_RANDOM57__()<r){floatText(state.player.x,state.player.y,'경직 저항','#b9d7cd',9);return false}}if(baseChance<1&&!rollHostileStatus(baseChance))return false;const before=state.status[key]||0;if(key==='illness'&&(state.status.illness||0)>0){state.status.illness=Math.max(0,state.status.illness-6);if(state.status.illness===0){addLog('중병이 악화되어 유예가 끝났다.');die('중병 재감염');return true}}else setPlayerStatus(key,turns);if(STATUS_META57[key]?.screen&&(before===0||key==='illness'))flash(STATUS_META57[key].screen.color,420);if(opts.log)addLog(opts.log);updateDebuffHud();return true}
function checkLevel(){const p=state.player;normalizePlayerProgression57(p);while(p.level<BALANCE.maxLevel&&p.xp>=p.nextXp){p.xp-=p.nextXp;p.level++;branchLevelFood();const hpGain=p.level>=13?3:(p.level%4===0?2:1);let martialGain=p.level<=12||MARTIAL_RULES.latePoints.includes(p.level)?1:0;p.baseMaxHpPermanent+=hpGain;recomputeMaxHp(p);p.hp=Math.min(p.maxHp,p.hp+Math.max(2,Math.ceil(p.maxHp*.22)));if([4,7,10].includes(p.level))p.maxFocus+=1;p.focus=Math.min(getStats().maxFocus,p.focus+2);if(martialGain){if(p.level>=13&&(state.martialProgression1005?.legacyBossCredit||0)>0){state.martialProgression1005.legacyBossCredit--;martialGain=0}else p.skillPoints+=martialGain;}p.nextXp=p.level<BALANCE.maxLevel?xpRequirementForLevel57(p.level+1):xpRequirementForLevel57(BALANCE.maxLevel);addLog(`LEVEL ${p.level}. HP +${hpGain}${martialGain?` · 무술 포인트 +${martialGain}`:' · 무술 포인트 지급 없음'}.`)}}
function hungerTick(){const p=state.player;if(state.turn%BALANCE.hungerTick===0)p.hunger=Math.max(0,p.hunger-1);if(p.hunger===0&&state.turn%5===0){damageEntity(p,1);addLog('굶주림으로 체력이 깎인다.');if(p.hp<=0)die('굶주림')}}
function tempFieldCells57(f){
 if(Array.isArray(f.cells))return f.cells;
 const cells=[];for(let y=f.y-1;y<=f.y+1;y++)for(let x=f.x-1;x<=f.x+1;x++)cells.push({x,y});return cells;
}
function addField(kind,x,y,ttl,cells=null,metadata={}){
 if(['fire','water','earth'].includes(kind)){cells=elementCells105(x,y,1,cells);emitElementContact105(kind,cells,metadata)}
 state.tempFields=(state.tempFields||[]).filter(f=>!(f.kind===kind&&f.x===x&&f.y===y&&!f.martialSmoke&&!metadata.martialSmoke));
 state.tempFields.push({kind,x,y,ttl,bornTurn:state.turn+1,...(cells?{cells}:{}),...effectSource57(state.player),...metadata});syncSmokeEntry();
}
function applyMonsterAttackStatus57(mon,target,context={}){
 if(!target||target.hp<=0)return;
 const opts={source:mon};
 if(context.damage>0&&context.delivery==='melee'&&combatDepth(mon)>=16&&mon.infectionHitsRequired57){
  let hits;if(target===state.player)hits=mon.infectionHits57=(mon.infectionHits57||0)+1;else{const id=combatantId(target),counts=mon.infectionTargets105||(mon.infectionTargets105={});hits=counts[id]=(counts[id]||0)+1;}
  if(hits>=mon.infectionHitsRequired57)applyCombatStatus(target,'illness',27,1,{...opts,log:'창고 쥐의 감염이 깊어졌다. 해독산이나 정화가 필요하다.'});
 }
 if(mon.poison)applyCombatStatus(target,'poison',4,.32,opts);
 if(mon.bleed)applyCombatStatus(target,'bleed',4,.34,opts);
 if(mon.web)applyCombatStatus(target,'stun',1,.30,{...opts,stagger:true});
 if(mon.heavyHit57)applyCombatStatus(target,'weaken',3,.28,{...opts,stagger:true});
 if(mon.slow)applyCombatStatus(target,'weaken',2,.35,{...opts,stagger:true});
 if(mon.blind)applyCombatStatus(target,'blind',4,.45,opts);
 if(mon.sealSkill)applyCombatStatus(target,'skillSeal',5,.42,opts);
 if(mon.focusDrain&&Number.isFinite(target.focus))target.focus=Math.max(0,target.focus-mon.focusDrain);
 if(mon.hungerDrain&&Number.isFinite(target.hunger))target.hunger=Math.max(0,target.hunger-mon.hungerDrain);
 if(mon.knockback)resolveForcedMovement57(target,mon,1,{mode:'push',hostile:true,creditPlayer:isPlayerAlly57(mon)});
}
  function upgradeGearAction5(it){const act=playerAction57('upgrade',{allowInventory:true,closeInventory:true,stunMessage:'몸이 굳어 장비를 개량하지 못했다.'});if(!act.ok)return;if(!(state.player.upgradeMarks>0))return;if(it.type==='weapon')applyWeaponUpgrade(it);else if(it.type==='armor')applyArmorUpgrade(it);else{it.upgrade=(it.upgrade||0)+1;it.eva=(it.eva||0)+1;}state.player.upgradeMarks--;addLog(`${it.name} +${it.upgrade} 개량.`);cancelAutoWalk();closeInventory();commitPlayerAction57(act,1)}
  function sfx54(k){if(!V54.sfx)return;const map={bodyPower58:[72,.20,'sawtooth',.035,145],stepWood:[92,.032,'square',.018,-15],stepStone:[122,.028,'triangle',.014,-8],stepMetal:[178,.03,'square',.014,18],stepWater:[72,.05,'sine',.022,-18],swing:[260,.045,'sawtooth',.018,-100],hit:[105,.055,'square',.032,-45],crit:[330,.08,'square',.028,170],miss:[420,.035,'sine',.012,-140],hurt:[74,.07,'sawtooth',.026,-28],pickup:[520,.055,'square',.018,210],door:[118,.06,'square',.022,-40],stairs:[180,.11,'sine',.025,-90],boss:[64,.22,'sawtooth',.035,-22],warn:[150,.10,'square',.025,80],death:[82,.14,'triangle',.026,-50]};const p=map[k];if(p)tone54(...p);if(['hit','hurt','door','death'].includes(k))noise54(k==='death'?.10:.035,k==='death'?.035:.018)}
  function availableSkills991(){if(!state||state.status.skillSeal>0)return[];const p=state.player;return Object.entries(MARTIAL_INFO).map(([id,info])=>[id,martialPresentation(id,info,p)]).filter(([id,v])=>v.type==='active'&&(p.martial[id]||0)>0&&p.focus>=v.cost)}
function equipped47(id){return state?.player?.weapon?.artifactId46===id}
function skyAxe47(){const targets=(state.monsters||[]).filter(m=>isThreatVisibleToPlayer(m)&&entityDistance57(m,state.player)<=9).sort((a,b)=>entityDistance57(a,state.player)-entityDistance57(b,state.player));const m=targets[0];if(!m)return false;const dmg=7;state.legendSkyAxes47=state.legendSkyAxes47||[];state.legendSkyAxes47.push({x:m.x,y:m.y,t:performance.now(),ttl:520});const dealtDamage=damageEntity(m,dmg, state.player,'fire');if(dealtDamage>0)floatText(m.x,m.y,`낙화 -${dealtDamage}`,'#ffc36d',13,'fire');burst(m.x,m.y,'#f16c35',28,1.1);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(Math.abs(dx)+Math.abs(dy)<=2)fireField47(m.x+dx,m.y+dy,3);if(m.hp<=0)killMonster(m);addLog(`낙화 10스택: 하늘에서 ${state.player.weapon?.name||'도끼'}의 화신이 ${m.name}에게 꽂혔다.`);return true}
function effectProbe47(id){const a=adef46(id);if(!a||!state)return null;const old={weapon:state.player.weapon,hp:state.player.hp,maxHp:state.player.maxHp,armor:state.player.armor,monsters:state.monsters,status:structuredClone(state.status),fire:state.legendFireFields47,terrain:state.legendTerrain47};state.player.weapon=clone(a);syncEquip47();state.legendFireFields47=[];state.legendTerrain47=[];const base=MONSTERS.find(m=>!m.boss)||MONSTERS[0],mk=(x,y,hp=80)=>{const m=scaledMonster(base);Object.assign(m,{x,y,hp,maxHp:hp,def:0,eva:0,alerted:false,hidden:false,kind:'human'});return m},p=state.player,t=mk(p.x+Math.min(3,a.range||1),p.y,id==='curse_spear'||id==='lava_bow'?1:120),s1=mk(t.x,t.y+1,80),s2=mk(t.x+1,t.y,80);state.monsters=[t,s1,s2];if(id==='ember_axe'){for(let i=0;i<10;i++){if(!state.monsters.includes(t)){state.monsters=[mk(p.x+2,p.y,200),s1,s2]}attackPlayer(state.monsters[0])}}else if(id==='earth_gauntlet'){t.hp=t.maxHp=500;for(let i=0;i<6;i++)attackPlayer(t)}else if(id==='ward_hammer'){t.hp=t.maxHp=500;for(let i=0;i<3;i++)attackPlayer(t)}else attackPlayer(t);const out={id,stacks:{ember:p.legendEmberStacks47||0,earth:p.legendEarthStacks47||0,ward:p.legendWardHits47||0},status:{...state.status},friends:state.monsters.filter(m=>m.friendly47).length,fields:state.legendFireFields47.length,terrain:state.legendTerrain47.length,secondary:[s1.hp,s2.hp],stats:getStats()};state.player.weapon=old.weapon;state.player.hp=old.hp;state.player.maxHp=old.maxHp;state.player.armor=old.armor;state.monsters=old.monsters;state.status=old.status;state.legendFireFields47=old.fire;state.legendTerrain47=old.terrain;delete state.player.legendCurseActive47;delete state.player.legendCurseBaseMax47;delete state.player.legendCurseCut47;syncEquip47();return out}
function syncEquipmentActor105(mon){const w=mon.weapon||{};mon.atk=(mon.baseAtk??mon.atk)+(w.atk||0);mon.reach=w.ranged?1:weaponRange(mon);mon.range=w.range||1;mon.ranged=!!w.ranged;mon.armorPierce=!!w.armorPierce;}
function equipmentContributions105(actor){const w=actor.weapon||{},a=actor.armor||{},c=actor.cloak||{},r=actor.relic||{},t=actor.trinket||{};return{atk:(w.atk||0)+(r.atk||0)+(t.atk||0)+martialBrawlBonus(actor,w),def:armorEffectiveDef(a)+(c.def||0)+(r.def||0)+(t.def||0),eva:(w.eva||0)+(a.eva||0)+(r.eva||0)+(t.eva||0),will:(a.will||0)+(r.will||0)+(t.will||0)}}
function equipmentFocusChain105(actor,hit){const w=actor?.weapon||{};if(!w.focusChain){actor.focusChain1006=0;return;}actor.focusChain1006=hit?(actor.focusChain1006||0)+1:0;if(actor.focusChain1006>=2){actor.focusChain1006=0;actor.focus=Math.min(actor===state.player?getStats().maxFocus:actor.maxFocus,actor.focus+1);floatText(actor.x,actor.y,'기 +1','#9fd2c3',10);}}
function equipmentHit105(actor,target){const w=actor.weapon||{};if(target.hp<=0)return;
 if(w.shred){target.def=Math.max(0,(target.def||0)-1);target.shredDef105=(target.shredDef105||0)+1;}
 if(w.execute&&!target.boss&&target.hp/target.maxHp<=w.execute){target.hp=0;martialCheckDeath(target,actor);return}
 if(w.wide)for(const other of [...martialTargets(actor)])if(other!==target&&entityDistance57(other,target)<=1&&entityDistance57(other,actor)<=(actor.reach||1)+1&&entityCombatLineCheckR(actor,other,{range:(actor.reach||1)+1,ignore:other,units:false}).ok){damageEntity(other,Math.max(1,Math.floor(actor.atk*.45)),actor);martialCheckDeath(other,actor)}
if(w.bleed&&globalThis.__MANRU_RANDOM57__()<w.bleed&&!target.statusImmune)damageEntity(target,3,actor);if(target.hp>0&&w.stun&&globalThis.__MANRU_RANDOM57__()<w.stun){if(target.boss)applyMartialControl1005(target,1);else applyCombatStatus(target,'stun',1,1,{stagger:true,source:actor});}if(actor!==state.player&&w.knockback&&target.hp>0)resolveForcedMovement57(target,actor,w.knockback,{mode:'push',hostile:true,creditPlayer:false});}
function recoverActorFocus105(actor,turn){if(turn%10||actor.focusRecoveredTurn105===turn)return;actor.focusRecoveredTurn105=turn;const bonus=(actor.cloak?.focusRegen||1)>=2?2:1;actor.focus=Math.min(actor===state.player?getStats().maxFocus:actor.maxFocus,actor.focus+bonus);}
function normalizeClassState58(p,agency=0){
  if(p.classId==='summoner'){p.name='무당';p.gender='female';p.color=CLASSES.find(c=>c.id==='summoner').color;}
  p.bloodAltarGains105=Number.isFinite(p.bloodAltarGains105)?Math.max(0,Math.floor(p.bloodAltarGains105)):0;
  const old=p.classState||{},valid=playerClassRules58(p).upgradeTalismanMode==='bodyBoost';
  const previousTotal=valid?Math.max(0,Math.min(45,Math.floor(Number(old.powerTotal)||0))):0;
  const previousRemaining=Math.max(0,Math.min(previousTotal,Math.floor(Number(old.powerTurns)||0)));
  const exhaustion=previousTotal?Math.max(0,Math.min(16,Math.floor(Number(old.powerExhaustion??old.powerTotal)||0))):0;
  // Upgrade active older saves once, preserving elapsed proportion; exhaustion now equals the full power duration.
  const migrate=previousRemaining>0&&(Number(old.powerRulesVersion)||0)<2;
  const total=migrate?Math.round(exhaustion*2.5):previousTotal;
  const remaining=migrate?Math.min(total,Math.ceil(previousRemaining*total/previousTotal)):previousRemaining;
  p.classState={aimPower:playerClassRules58(p).roar==='aim'&&Number(old.aimPower)>4?Math.min(aimMaximum(p),Math.floor(Number(old.aimPower))):0,aimBornAgency:Number.isFinite(old.aimBornAgency)?old.aimBornAgency:agency,aimMoveAgency:Number.isFinite(old.aimMoveAgency)?old.aimMoveAgency:-1,aimAttackAgency:Number.isFinite(old.aimAttackAgency)?old.aimAttackAgency:-1,powerTurns:remaining,powerTotal:total,powerExhaustion:total,powerRulesVersion:3,powerHealHundredths:valid?Math.max(0,Math.min(99,Math.floor(Number(old.powerHealHundredths)||0))):0,powerBornAgencyTurn:Number.isFinite(old.powerBornAgencyTurn)?old.powerBornAgencyTurn:agency,powerLastAgencyTurn:Number.isFinite(old.powerLastAgencyTurn)?old.powerLastAgencyTurn:agency};
}
function actionPresentationBusy58(){return ACTION_PRESENTATION58.run===state&&performance.now()<ACTION_PRESENTATION58.until}
function jarGasState57(){return state?state.jarGasFields57:[]}
function jarGasConcentrationMap57(status='poison',target=null){
  const out=new Map();for(const f of jarGasState57())if((f.status57||'poison')===status&&(!target||!f.sourceFaction||effectCanAffect57(f,target)))for(const c of f.cells||[])if(c.c>0){const kk=jarGasCellKey57(c.x,c.y),v=out.get(kk)||0;if(c.c>v)out.set(kk,c.c)}return out
}
function armorUpgradeGain42(base,level=0){const u=Math.max(0,Math.floor(+level||0));let gain=0;for(let n=1;n<=u;n++)gain+=armorUpgradeStepGain42(base,n);return gain}
function attackTerrainTargetR8(target){
 const p=state.player,w=p.weapon||{},ranged=!!(w.ranged||w.kind==='bow'),check=combatTerrainTargetCheckR8(target);if(!check.ok)return false;
 const strong=!ranged&&p.strongReady>0;if(strong)p.strongReady=0;const jar=state.map[target.y]?.[target.x]===TT.JAR;if(jar&&!destroyJar57(target.x,target.y,{forced:true,source:ranged?'ranged':'melee'}).ok)return false;
 if(ranged)projectileFX(p.x,p.y,target.x,target.y);else slashFX(p.x,p.y,target.x,target.y,'#e7c8a2');globalThis.__MANRU_SFX54__?.play?.('hit');target.hp=0;setPlayerAttackOutcome('hit',target,{damage:1});ACTION_PRESENTATION58.strong=strong;return true;
}
function rollHostileStatus(baseChance){return globalThis.__MANRU_RANDOM57__()<hostileStatusChance(baseChance)}
function xpRequirementForLevel57(targetLevel){const lv=Math.max(2,Math.min(BALANCE.maxLevel,Math.floor(Number(targetLevel)||2)));if(lv===2)return 32;if(lv<=13)return 24+lv*8;return Math.round(128*Math.pow(1.5,lv-13))}
function normalizePlayerProgression57(p){if(!p)return;p.level=Math.max(1,Math.min(BALANCE.maxLevel,Math.floor(Number(p.level)||1)));p.xp=Math.max(0,Math.floor(Number(p.xp)||0));p.nextXp=p.level<BALANCE.maxLevel?xpRequirementForLevel57(p.level+1):xpRequirementForLevel57(BALANCE.maxLevel);p.skillPoints=Math.max(0,Math.floor(Number(p.skillPoints)||0))}
function recordPlayerSight105(){
 if(!state?.player||state.generationInProgress57)return;
 for(const mon of state.monsters||[])if(!mon.seenByPlayer105&&isThreatVisibleToPlayer(mon))mon.seenByPlayer105=true;
}
  function qaThreshold23_60(){
    if(state.floor!==23)return{ok:false,reason:'not-f23'};const dragon=(state.monsters||[]).find(m=>m.name==='여의 수룡'&&m.hp>0);if(!dragon)return{ok:false,reason:'missing-dragon'};
    const before=dragon.hp,amount=Math.max(1,Math.floor(dragon.maxHp*.51)+1);damageEntity(dragon,amount,state.player);const item=(state.items||[]).find(i=>i.type==='progress_key23');
    return{ok:!!state.floor23?.thresholdTriggered&&!!item,before,after:dragon.hp,maxHp:dragon.maxHp,item:item?{x:item.x,y:item.y,name:item.name}:null,thresholdTriggered:!!state.floor23?.thresholdTriggered};
  }
  function safeForNatural94(){if(!state||state.status.poison>0||state.status.bleed>0)return false;return !state.monsters.some(m=>isThreatVisibleToPlayer(m)&&entityDistance57(m,state.player)<=4)}
function syncEquip47(){const p=state?.player;if(!p)return;for(const it of [p.weapon,...(p.inventory||[]),...(state.items||[])]){if(!it?.legendaryWeapon47)continue;const d=adef46(it.artifactId46);if(d)for(const key of ['atk','speed','range','desc','armorPierce']){if(Object.prototype.hasOwnProperty.call(d,key))it[key]=d[key];else if(key==='armorPierce')delete it[key]}}const on=equipped47('curse_blade'),changed=on!==!!p.legendCurseActive47;p.legendCurseActive47=on;recomputeMaxHp(p);if(changed&&on)floatText(p.x,p.y,'최대 HP -30%','#b95c7c',10);if(!on){delete p.legendCurseBaseMax47;delete p.legendCurseCut47}if(!equipped47('earth_gauntlet'))p.legendEarthStacks47=0}
function brawlUpgradeEffect42(it){return isBrawlWeapon(it)?Math.floor((it.upgrade||0)/3):(it?.upgrade||0)}
function hungerMods(){return{atk:0,eva:0}}
function combatGuardBlocks57(attacker,target){
 if(!target?.guardChance57||target.hp<=0||globalThis.__MANRU_RANDOM57__()>=target.guardChance57)return false;
 target.alerted=true;floatText(target.x,target.y,'방어','#d3c08e',10);impact(target.x,target.y,'#c9ad73',2);addLog(`${target.name}이 창대로 정면 공격을 막았다.`);return true;
}
  function tone54(freq=220,dur=.055,type='square',gain=.035,slide=0){const a=ac54();if(!a)return;try{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,a.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),a.currentTime+dur);g.gain.setValueAtTime(gain,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);o.onended=()=>{o.disconnect();g.disconnect()};o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur+.01)}catch(error){ignoreError('tone cue could not play',error)}}
  function noise54(dur=.045,gain=.025){const a=ac54();if(!a)return;try{const n=Math.max(1,Math.floor(a.sampleRate*dur)),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(globalThis.__MANRU_RANDOM57__()*2-1)*(1-i/n);const s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=gain;s.onended=()=>{s.disconnect();g.disconnect();s.buffer=null};s.connect(g).connect(a.destination);s.start()}catch(error){ignoreError('noise cue could not play',error)}}
function fireField47(x,y,ttl=4,source=state.player){emitElementContact105('fire',elementCells105(x,y),effectSource57(source));state.legendFireFields47=state.legendFireFields47||[];if(!insideMapInterior(x,y)||tileBlocks(state.map[y][x]))return false;const provenance=effectSource57(source),q=state.legendFireFields47.find(f=>f.x===x&&f.y===y&&fieldProvenance57(f).sourceFaction===provenance.sourceFaction);if(q)q.ttl=Math.max(q.ttl,ttl);else state.legendFireFields47.push({x,y,ttl,born:state.turn,...provenance});return true}
function cursedEquipped47(){const p=state?.player;if(!p)return 0;return['armor','cloak','relic','trinket'].reduce((n,k0)=>n+((p[k0]?.curse991||p[k0]?.curseActive991)?1:0),0)}
  /* ---------- lightweight procedural SFX ---------- */
  function ac54(){if(!V54.sfx)return null;try{if(!V54.audio){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;V54.audio=new A()}if(V54.audio.state==='suspended')V54.audio.resume?.();return V54.audio}catch(_){return null}}
function stairsSound(){return sfx54('stairs')}
function classBodyPowerStats(s){if(bodyPowerActive()){s.atk+=2;s.def+=7}return s}
const PLAYER_STAT_STAGES=[{id:'class-body-power58',run:classBodyPowerStats},{id:'potions41',run:potionStats},{id:'food57',run:hungerStats},{id:'elements74',run:elementGuardStats},{id:'curse991',run:curseStats}];
const ATTACK_COST_STAGES=[{id:'potions41',run:potionAttackCost},{id:'food57',run:foodAttackCost},{id:'elements74',run:elementBrandAttackCost},{id:'curse991',run:curseAttackCost}];
