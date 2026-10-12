function storyInputOpen(){return interactionActive8('storyModal992')||interactionActive8('storyScene992')}
function storyInvestigatorDefinition(){return{...clone(BOSSES[25]),...{name:'실종된 선행 조사관',concept57:SPECIAL_MONSTER_CONCEPTS57['실종된 선행 조사관'],hp:136,maxHp:136,atk:BOSS_ARENA_RULES.master.maskAtk,def:6,eva:5,color:'#718792',shape:'human',kind:'human',ranged:false,range:7,bossPattern:'friendmask',flying:false,storyPhase992:1,storyLine992:0},boss:true};}
function inTutorialEntry(x,y){const a=state?.tutorialEntry60;return !!(state?.floor===1&&!state.artifactDungeon46&&!state.shopIntermission?.active&&a&&x>=a.x&&x<=a.right&&y>=a.y&&y<=a.bottom)}
function tutorialEntryAudit(){
 const a=state?.tutorialEntry60;if(state?.floor!==1)return{ok:true,applicable:false};if(!a)return{ok:false,reason:'missing-entry'};
 const reach=ReachabilityService.playerSearch(a.start,{ignoreOccupants:true}).cells,checkpoints=a.stations.map(p=>({id:p.id,reachable:reach.has(k(p.x,p.y))})),enemies=state.monsters.filter(m=>m.hp>0&&entityFootprintCells57(m).some(p=>inTutorialEntry(p.x,p.y))).map(m=>m.name),hazards=[];
 for(let y=a.y;y<=a.bottom;y++)for(let x=a.x;x<=a.right;x++)if([TT.TRAP,TT.SNARE,TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY].includes(state.map[y]?.[x]))hazards.push({x,y});
 const distances=new Map([[k(a.exit.x,a.exit.y),0]]),queue=[a.exit];
 for(let i=0;i<queue.length;i++){const q=queue[i];for(const[dx,dy]of DIRS8){const x=q.x+dx,y=q.y+dy,key=k(x,y);if(!reach.has(key)||distances.has(key))continue;distances.set(key,distances.get(k(q.x,q.y))+1);queue.push({x,y})}}
 const stairDistance=distances.get(k(state.stairs.x,state.stairs.y))??-1;
 return{ok:checkpoints.every(p=>p.reachable)&&reach.has(k(a.exit.x,a.exit.y))&&enemies.length===0&&hazards.length===0&&stairDistance>=24,checkpoints,enemies,hazards,stairDistance,minimumStairDistance:24,exitReachable:reach.has(k(a.exit.x,a.exit.y))};
}
function beginEndingPresentation(){document.body.classList.remove('run-active');endScreen()}
function showEnding(){if(!RunLifecycle.terminate('victory'))return false;beginEndingPresentation();presentVictory()}
let coachFocus=null,coachCurrent=null,coachTimer=null;
  function showFloorTips(){
    if(!state||state.debugBattle57||state.debugMapGeneration57||state.shopIntermission?.active||state.artifactDungeon46)return;
    if(state.floor===5)tip70('floor5','첫 수문장이 기다린다. 보스의 움직임과 공격 예고를 살피고, 싸우기 전에 체력·음식·약병을 준비하자.','퇴로와 지형을 살피며 한 수씩 움직여라.');
    if(state.floor===6)tip70('floor6','객잔을 지나 수묵원에 들어섰다. 물길과 정원이 건물 사이로 이어지고, 낯선 지형과 적이 나타난다.','물가에서는 발 디딜 곳과 건널 길을 먼저 확인하자.');
    if(state.floor===11)tip70('floor11','깊은 층의 괴물들은 더 영악하다. 소리를 쫓고 옆길로 접근하니 퇴로를 살펴라. '+(state.passiveRecoveryUnlocked57?'화공을 넘어선 네 몸도 달라졌다. 피해를 입지 않고 숨을 고르면 체력이 회복되며, 오래 버틸수록 회복이 빨라진다.':'10층의 화공을 쓰러뜨리면, 피해를 피해 숨을 고르는 동안 체력을 회복하는 힘을 얻는다.'),'회복에는 허기가 남아 있어야 한다. 다시 맞으면 회복 준비가 끊긴다.');
  }
  function advanceEntryTutorial(){
    const a=state?.tutorialEntry60;if(!a||a.completed||!inTutorialEntry(state.player.x,state.player.y)||state.story992?.dispatchPending60)return;
    const p=state.player,defs={
      start:['등불이 켜진 전실은 안전하다. 바닥을 탭하거나 클릭해 이동해 보자. 오른쪽 회랑을 따라 다음 방으로 가면 된다.','PC: WASD / 방향키 · 모바일: 원하는 바닥을 탭'],
      bag:['여기는 조사관 준비실이다. 행낭을 열어 가져온 장비와 물건을 확인하자. 물건을 선택하면 설명과 사용 방법을 볼 수 있다.','행낭: I / 화면의 행 버튼 · 확인한 뒤 오른쪽 수련실로 이동'],
      martial:['무술은 짧게 눌러 사용하고, 길게 눌러 강화한다. 수련점으로 배울 무술을 골라 보자.','PC: Q 짧게 / Q 꾹 · 모바일: 무술 버튼 탭 / 길게 누르기'],
      entry_exit:['문 너머부터는 적이 있는 객잔이다. 적을 향해 이동하거나 공격 버튼을 눌러 싸운다. 네가 행동하면 적도 움직인다.','준비가 됐다면 아래쪽 문으로 나가자. 상처를 입으면 적과 거리를 벌리고 쉬어라.']
    };
    const next=a.stations.find(v=>!seenTip70(v.id));if(!next)return;
    const index=a.stations.indexOf(next),reached=index===0||index<3?p.x>=next.x-1:p.y>=next.y-1&&p.x>=a.stations[2].x-1;
    if(reached)tip70(next.id,...defs[next.id]);
  }
  function coachContext(){
    if(!state||state.dead||state.victory||state.shopIntermission?.active)return;
    if(trainingActive()){advanceEntryTutorial();return}
    showFloorTips();const p=state.player;
    if(state.monsters.some(m=>isThreatVisibleToPlayer(m)&&entityDistance57(m,p)<=4))tip70('combat','적을 향해 이동하면 가까운 적을 공격한다. 공격 버튼 / Space로도 공격할 수 있다. 한 번 행동하면 적도 움직이니, 좁은 길에서 한 마리씩 상대하라.','상처를 입었다면 적과 거리를 벌리고 안전한 곳에서 쉬어라.');
    if(p.hp<p.maxHp*.65)tip70('recovery','체력이 줄었다. 가까운 적이 없고 허기가 충분하면 자연 회복한다. 전투 중 급한 회복은 약병을 써라.','독·출혈 중에는 자연 회복에 기대지 마라.');
    if(p.level>=2)tip70('level','레벨이 올랐다. 늘어난 능력치를 확인하고, 무술 창에서 남은 수련점을 투자하라.','Q를 꾹 누르기 / 무술 버튼 길게 누르기 = 강화 창');
    if((state.playerAgencyTurns57||0)>=3&&p.skillPoints>0)tip70('martial','지금 사용할 수 있는 수련점이 있다. Q를 꾹 누르면 무술 강화 창을 연다. 짧게 누르면 무술을 사용한다.','모바일에서는 무술 버튼을 길게 눌러도 된다.');
    if(state.stairs&&entityDistance57(p,state.stairs)<=2)tip70('stairs','계단을 찾았다. 내려가기 전에 방을 살피고 경험치와 장비를 챙겨라. 놓친 방에는 도움이 될 물건이 남아 있을 수 있다.','탐사하지 않은 방과 떨어진 물건은 지도에서 확인하라.');
    if(p.hunger<40)tip70('hunger','허기가 낮아지면 회복도 느려진다. 안전한 방에서 음식을 먹고, 조리 시설을 찾으면 재료를 활용하라.','일부 음식은 여러 턴이 걸린다. 적 앞에서 먹지 마라.');
  }
function buildTutorialEntry(m,rooms){
    const x0=Math.max(3,Math.floor(COLS/2)-17),cy=7,starts=[x0,x0+12,x0+24],names=['등불 열람실','조사관 준비실','정심 수련실'],suite=[];
    for(let i=0;i<3;i++){
      const x=starts[i],r={x:x+1,y:3,w:8,h:8,cx:x+4,cy:7,tutorial60:true,name:names[i]};
      for(let y=2;y<=11;y++)for(let xx=x;xx<=x+9;xx++)setTerrainTile58(m,xx,y,(xx===x||xx===x+9||y===2||y===11)?TT.WALL:TT.WOOD_FLOOR);
      for(let xx=x+1;xx<=x+8;xx++)for(let y=6;y<=8;y++)setTerrainTile58(m,xx,y,TT.CARPET);
      for(const xx of[x+2,x+7])setTerrainTile58(m,xx,4,TT.LANTERN_POST);
      if(i===0){setTerrainTile58(m,x+4,4,TT.TABLE);setTerrainTile58(m,x+5,4,TT.TABLE)}
      if(i===1){setTerrainTile58(m,x+4,4,TT.RACK);setTerrainTile58(m,x+5,4,TT.RACK)}
      if(i===2){for(const xx of[x+3,x+6])for(const y of[5,9])setTerrainTile58(m,xx,y,TT.STONE_PATH)}
      suite.push(r);state.rooms.push(r);feature89(names[i],r,'tutorial');
      if(i>0)for(let xx=starts[i-1]+9;xx<=x;xx++)setTerrainTile58(m,xx,cy,TT.STONE_PATH);
    }
    const gx=starts[2]+4,near=[...rooms].sort((a,b)=>(Math.abs(a.cx-gx)+Math.abs(a.cy-17))-(Math.abs(b.cx-gx)+Math.abs(b.cy-17)))[0];
    for(let y=9;y<=near.cy;y++)setTerrainTile58(m,gx,y,y===11?TT.DOOR:TT.STONE_PATH);
    for(let x=Math.min(gx,near.cx);x<=Math.max(gx,near.cx);x++)setTerrainTile58(m,x,near.cy,TT.STONE_PATH);
    const start={x:starts[0]+4,y:cy};state.fixedStart={...start};
    const origin={x:gx,y:15},queue=[origin],dist=new Map([[k(origin.x,origin.y),0]]);
    for(let i=0;i<queue.length;i++){const q=queue[i];for(const[dx,dy]of DIRS4){const x=q.x+dx,y=q.y+dy,key=k(x,y);if(x<1||y<15||x>=COLS-1||y>=ROWS-1||dist.has(key)||tileBlocks(m[y][x])&&m[y][x]!==TT.DOOR)continue;dist.set(key,dist.get(k(q.x,q.y))+1);queue.push({x,y})}}
    const destinations=rooms.filter(r=>r!==near&&dist.has(k(r.cx,r.cy))).sort((a,b)=>dist.get(k(b.cx,b.cy))-dist.get(k(a.cx,a.cy)));
    if(!destinations.length)throw new Error('F1 has no exploration exit');
    state.fixedExit={x:destinations[0].cx,y:destinations[0].cy};
    state.tutorialEntry60={x:1,y:1,right:COLS-2,bottom:14,start,exit:{x:gx,y:15},completed:false,stations:[{id:'start',x:start.x,y:cy},{id:'bag',x:starts[1]+2,y:cy},{id:'martial',x:starts[2]+2,y:cy},{id:'entry_exit',x:gx,y:10}],rooms:suite};
  }
  const STYLE_LORE={
    f6_hut:'관리 오두막의 생활 흔적이 남은 구획이다.',f6_submerged:'수면 가까이 잠긴 정자 구역의 일부다.',f6_shoal:'연꽃과 얕은 물이 맞닿는 수목원 가장자리다.',
    f11_canyon:'향수강을 끼고 솟은 회색 돌산 협곡의 일부다.',f11_dock:'뗏목이 닿는 강변 부두의 일부다.',f11_blinkpost:'뗏목이 막혔을 때 강을 건너기 위한 비상 점멸 지점의 일부다.',f11_cliff_ledge:'협곡 벽을 깎아 만든 좁은 발판의 일부다.',
    f15_stage:'공연을 위해 높여 만든 무대 바닥의 일부다.',f15_runway:'무대와 객석을 잇는 긴 통로의 일부다.',f20_catwalk:'형틀 심부를 가로지르는 점검 통로의 일부다.',
    f21_observatory:'공허의 흐름을 읽던 관측섬의 일부다.',f22_nave:'금빛 의식 회랑의 중심축을 이루는 구획이다.',f23_pump:'수은을 끌어올리던 펌프섬의 일부다.',f24_tea:'복숭아 정원의 찻집 구획이다.',f25_core:'만루의 가장 깊은 중심부에 가까운 바닥이다.'
  };
  const STORY_NOTE_FLOORS={4:'friend_measure',7:'assistant_numbers',11:'friend_route',16:'soldier_retreat',19:'friend_correction',22:'friend_accept',24:'friend_last'};
  const STORY_ECHO_FLOOR=23;
  const STORY_DOCS={
    dispatch:{title:'파견 전 남긴 쪽지',author:'선행 조사관',dept:'정부 특별조사과',location:'관청 숙소 · 출발 전날',style:'friend',seal:'조사국',sign:'— 돌아와서 밥은 내가 산다.',body:`이번 건은 규모가 좀 큰 무허가 증축 조사래. 신고된 객실 수가 허가도면보다 많아서 현장 실측하고 책임자 몇 명 확인하라는 정도야. 군 경계대도 입구까지만 붙는다고 하니 위험한 일은 아닐 거야.

늦어도 사흘이면 돌아오겠다. 네가 또 쓸데없이 따라올까 봐 먼저 남긴다. 정말 별일 아니야. 걱정하지 마.`},
    friend_measure:{title:'1차 실측 기록',author:'선행 조사관',dept:'정부 특별조사과 · 현장기록',location:'청풍루 하층 회랑',style:'friend',seal:'조사국',sign:'현장 재측정 예정.',body:`객실 수가 도면과 맞지 않는다. 남측 복도를 세 번 재봤는데 외벽 길이 안에 들어갈 수 없는 폭이 나온다.

일단 현장 실측 오류로 본다. 오래된 증축 과정에서 기준점이 어긋났을 가능성이 높다. 책임자는 “옛날부터 이랬다”고만 답했다.`},
    assistant_numbers:{title:'방 번호 대조 메모',author:'보조 조사원',dept:'특별조사과 임시조',location:'수묵원 진입 전',style:'official',seal:'현장',sign:'번호 재부여 필요.',body:`선행 조사관 지시로 모든 문틀에 분필 번호를 적었다.

37호 다음이 다시 31호였다. 외부에서 확인한 창은 열두 개인데 안쪽 복도에서 센 창은 스무 개가 넘는다. 조사관은 아직 “구조 문제”라고 한다. 나는 외벽을 다시 보러 나가고 싶다.`},
    friend_route:{title:'경로 대조 기록',author:'선행 조사관',dept:'정부 특별조사과 · 개인기록',location:'향수강 상류',style:'friend',seal:'조사국',sign:'북쪽 표기 전면 재검토.',body:`같은 방을 세 번 지나왔다. 출구는 북쪽이어야 하는데 다시 연회장이다.

나침반도 도면도 서로 다른 북쪽을 가리킨다. 누군가 방 번호를 바꾼 흔적은 없다. 그런데 길은 바뀌었다. 지금부터는 지나온 문마다 시간을 적는다.`},
    soldier_retreat:{title:'철수 불이행 보고',author:'증원 경계병',dept:'정부 파견 경계대',location:'지하 장고 전초',style:'soldier',seal:'경계대',sign:'보고자 · 하층 경계 2조',body:`철수 명령이 내려왔으나 선행 조사관은 혼자 아래로 내려갔다.

붙잡으려 하자 “도면이 틀린 게 아니야. 도면 밖이 모자란 거야.”라고 말했다. 처음 파견될 때 입었던 제복 그대로였다. 하층에서 총성이 두 번 들렸다. 이후 통신 없음.`},
    friend_correction:{title:'정정 보고서 초안',author:'선행 조사관',dept:'정부 특별조사과',location:'성채 외곽 통로',style:'friend',seal:'조사국',sign:'제출 보류.',body:`우리가 틀렸다. 이곳은 불법으로 증축된 것이 아니다. 적어도 지금은 아니다.

방은 벽 뒤에 생기는 게 아니다. 사람이 머문 자리와 되짚은 길을 따라 자리를 얻는다.

여긴 이상한 곳이 아니다. 밖이 잘못되어 있었다.`},
    friend_accept:{title:'제목 없는 쪽지',author:'선행 조사관',dept:'소속 표기 없음',location:'만루 심부',style:'friend',seal:'',sign:'',body:`방은 늘어나는 게 아니다. 받아들이는 것이다.

사람이 머문 자리는 방이 되고, 이름을 남기면 문패가 된다. 나도 이제 어느 쪽이 출구였는지 기억나지 않는다.

그런데 이상하게도 무섭지 않다.`},
    friend_last:{title:'마지막 조사기록',author:'선행 조사관',dept:'찢긴 정부 문서 뒷면',location:'천실핵 바로 위층',style:'friend',seal:'',sign:'끝부분의 먹이 심하게 번져 있다.',body:`이 기록을 네가 읽고 있다면 네가 내려왔다는 뜻이다. 오지 말라고 썼어야 했다.

만루는 떠난 사람의 목소리와 얼굴과 기억까지 방 안에 남긴다. 내가 너를 부르더라도 따라오지 마.

도면의 마지막 칸은 빈칸이 아니다. 주인의 자리다.`}
  };
  const docOrder=['dispatch','friend_measure','assistant_numbers','friend_route','soldier_retreat','friend_correction','friend_accept','friend_last'];
  let whisperTimer=0;
  function storyEnsureState(){
    if(!state)return null;
    const st=state.story992||(state.story992={});
    st.collected=Array.isArray(st.collected)?st.collected:[];
    st.read=Array.isArray(st.read)?st.read:[];
    st.echoSeen=!!st.echoSeen;st.echo=st.echo||null;st.truthRevealed=!!st.truthRevealed;st.ending=st.ending||null;
    return st;
  }
  function hasDoc(id){return !!storyEnsureState()?.collected.includes(id)}
  function storyInitNewRun(){
    if(!state)return;state.story992={collected:['dispatch'],read:[],echoSeen:false,echo:null,truthRevealed:false,ending:null};storyRefreshSettings();
    addLog('친구가 파견 전에 남긴 쪽지를 가지고 있다. 설정의 「조사 기록」에서 다시 읽을 수 있다.');
    state.story992.dispatchPending60=true;
  }
  function findStoryDoc(id){return STORY_DOCS[id]||null}
  function escapeHtmlText(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function storyEnsureUI(){
    if(!document.getElementById('storyModal992')){
      const modal=document.createElement('div');modal.id='storyModal992';modal.innerHTML='<div id="storyModalBody992"></div>';document.body.appendChild(modal);modal.addEventListener('pointerdown',e=>{if(e.target===modal){e.preventDefault();e.stopPropagation()}});
    }
    if(!document.getElementById('storyWhisper992')){const w=document.createElement('div');w.id='storyWhisper992';document.body.appendChild(w)}
    if(!document.getElementById('storyScene992')){const sc=document.createElement('div');sc.id='storyScene992';document.body.appendChild(sc)}
    storyRefreshSettings();
  }
  function storyRefreshSettings(){
    const body=document.querySelector('#releasePanel70 .rc70Body');if(!body)return;
    let sec=document.getElementById('storySettings992');if(!sec){sec=document.createElement('section');sec.id='storySettings992';sec.className='rc70Section';sec.innerHTML='<h3>조사 기록</h3><div class="rc70Row"><button id="storyOpenArchiveBtn992">문서철 열기</button><span id="storyCount992"></span></div>';body.prepend(sec);sec.querySelector('#storyOpenArchiveBtn992').onclick=storyOpenArchive}
    const st=state?.story992,n=st?.collected?.length||0,el=document.getElementById('storyCount992');if(el)el.textContent=`회수 ${n}건`;
  }
  function storyCloseModal(opts={}){RuntimeState.ui.storyNote=null;setInteraction8('storyModal992',false);if(opts?.preserveProgress)return;if(state?.story992?.dispatchPending60&&state.story992.read.includes('dispatch'))state.story992.dispatchPending60=false;globalThis.__MANRU_RELEASE__?.entryTutorial?.()}
  function storyOpenNote(id){if(!gameplayUiOpen57())return false;
    globalThis.__MANRU_RELEASE__?.suspendTip?.();const d=findStoryDoc(id),st=storyEnsureState();if(!d||!st||!st.collected.includes(id))return false;if(!st.read.includes(id))st.read.push(id);RuntimeState.ui.storyNote=id;setInteraction8('storyModal992',true);presentStoryNote(d);return true;
  }
  function presentStoryNote(d){storyEnsureUI();storyRefreshSettings();
    const modal=document.getElementById('storyModal992'),body=document.getElementById('storyModalBody992');
    body.innerHTML=`<article class="storyPaper992 story${d.style==='official'?'Official':d.style==='soldier'?'Soldier':'Friend'}992"><i class="storyFold992"></i><i class="storyStain992"></i><header class="storyDocHead992"><div><div class="storyKicker992">회수 문서 · ${escapeHtmlText(d.dept)}</div><div class="storyTitle992">${escapeHtmlText(d.title)}</div><div class="storyMeta992"><span>작성자 · ${escapeHtmlText(d.author)}</span><span>기록 위치 · ${escapeHtmlText(d.location)}</span></div></div>${d.seal?`<div class="storySeal992">${escapeHtmlText(d.seal)}</div>`:''}<button class="storyClose992" aria-label="닫기">×</button></header><div class="storyBody992">${escapeHtmlText(d.body)}</div>${d.sign?`<div class="storySign992">${escapeHtmlText(d.sign)}</div>`:''}<div class="storyArchiveLink992"><button id="storyArchiveFromNote992">문서철</button></div></article>`;
    body.querySelector('.storyClose992').onclick=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'story-close'});body.querySelector('#storyArchiveFromNote992').onclick=storyOpenArchive;setInteraction8('storyModal992',true);return true;
  }
  function storyOpenArchive(){globalThis.__MANRU_RELEASE__?.suspendTip?.();if(!gameplayUiOpen57())return false;
    storyEnsureUI();const st=storyEnsureState();if(!st)return;RuntimeState.ui.storyNote=null;const modal=document.getElementById('storyModal992'),body=document.getElementById('storyModalBody992');const ids=docOrder.filter(id=>st.collected.includes(id));
    body.innerHTML=`<section class="storyArchive992"><span class="uiCorners63" aria-hidden="true"></span><header class="storyArchiveHead992"><div><b>정부 조사 문서철</b><small>만루 내부에서 회수한 기록 · ${ids.length}건</small></div><button class="storyClose992" aria-label="닫기">×</button></header><div class="storyList992">${ids.map((id,i)=>{const d=findStoryDoc(id);return`<button class="storyRow992" data-story-doc="${id}"><span>${String(i+1).padStart(2,'0')}</span><div><b>${escapeHtmlText(d.title)}</b><small>${escapeHtmlText(d.author)} · ${escapeHtmlText(d.location)}</small></div><i>${st.read.includes(id)?'읽음':'새 기록'}</i></button>`}).join('')}</div></section>`;
    body.querySelector('.storyClose992').onclick=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'story-close'});body.querySelectorAll('[data-story-doc]').forEach(b=>b.onclick=()=>InputRouter.dispatch({type:'STORY_OPEN_NOTE',id:b.dataset.storyDoc,source:'story-choice'}));setInteraction8('storyModal992',true);
  }
  function storyWhisper(text,life=2700){storyEnsureUI();const el=document.getElementById('storyWhisper992');if(!el)return;clearTimeout(whisperTimer);el.textContent=text;el.classList.add('show');whisperTimer=setTimeout(()=>el.classList.remove('show'),life)}
  function storyCloseScene(){RuntimeState.ui.storyScene=null;setInteraction8('storyScene992',false)}
  function storyOpenScene(title,text,quote=''){
    RuntimeState.ui.storyScene={title,text,quote};setInteraction8('storyScene992',true);presentStoryScene(title,text,quote);
  }
  function presentStoryScene(title,text,quote){storyEnsureUI();const sc=document.getElementById('storyScene992');sc.innerHTML=`<div class="storySceneCard992"><span class="uiCorners63" aria-hidden="true"></span><h2>${escapeHtmlText(title)}</h2><p>${escapeHtmlText(text)}</p>${quote?`<p class="storySceneQuote992">“${escapeHtmlText(quote)}”</p>`:''}<button id="storySceneContinue992">계속</button></div>`;setInteraction8('storyScene992',true);document.getElementById('storySceneContinue992').onclick=()=>InputRouter.dispatch({type:'STORY_CONTINUE',source:'story-continue'});
  }
  function storyContinueScene(){if(!interactionActive8('storyScene992'))return false;storyCloseScene();const boss=state?.monsters?.find(m=>m.boss&&m.storyPhase992===2);if(boss)setTimeout(()=>{try{showBossIntro(boss)}catch(error){ignoreError('boss intro could not be shown; the story continues',error)}},120);return true;
  }
  function storySafeNoteCell(){
    if(!state)return null;for(let n=0;n<160;n++){const q=PlacementService.randomFloor(0),t=state.map[q.y]?.[q.x],dp=Math.max(Math.abs(q.x-state.player.x),Math.abs(q.y-state.player.y)),ds=Math.max(Math.abs(q.x-state.stairs.x),Math.abs(q.y-state.stairs.y));if(dp<5||ds<3||!ReachabilityService.playerPassable(q.x,q.y)||OccupancyService.isOccupied(q.x,q.y)||state.items.some(i=>i.x===q.x&&i.y===q.y)||[TT.TRAP,TT.SNARE,TT.WATER,TT.LAVA,TT.VOID,TT.MERCURY].includes(t))continue;return q}return PlacementService.randomFloor(0)
  }
  function storyPlaceFloorNote(){const id=STORY_NOTE_FLOORS[state?.floor];if(!id||hasDoc(id)||state.items.some(i=>i.type==='story_note'&&i.storyId===id))return false;const q=storySafeNoteCell();if(!q)return false;PlacementService.placeItem({name:'접힌 조사 문서',type:'story_note',storyId:id,rarity:'rare',x:q.x,y:q.y,count:1,desc:'정부 조사단이 남긴 종이 기록. 회수하면 문서철에 보관된다.'});return true}
  function storyCollectNote(id){const st=storyEnsureState(),d=findStoryDoc(id);if(!st||!d)return false;if(!st.collected.includes(id))st.collected.push(id);addLog(`조사 기록 회수 · ${d.title}`);toast('새 조사 기록을 회수했다.');burst(state.player.x,state.player.y,'#caa36a',12,.6);storyRefreshSettings();updateAll();const generation14=RunLifecycle.generation();setTimeout(()=>{if(RunLifecycle.isCurrent(generation14)&&state&&!state.dead&&!state.victory)storyOpenNote(id)},80);return true}
  function storyPrimeFinalBoss(){const st=storyEnsureState(),boss=state?.monsters?.find(m=>m.boss);if(!boss||state.floor!==25||boss.storyPhase992)return false;Object.assign(boss,storyInvestigatorDefinition());st.truthRevealed=false;setTimeout(()=>storyWhisper('“여기까지 왔네.”',2400),1250);return true}
  function storyAfterFloorGenerated(){storyEnsureState();storyPlaceFloorNote();if(state?.floor===25)storyPrimeFinalBoss();storyRefreshSettings()}
  function storyEchoCell(){if(!state)return null;const cand=[];for(const kk of state.visible||[]){const [x,y]=kk.split(',').map(Number),d=Math.max(Math.abs(x-state.player.x),Math.abs(y-state.player.y));if(d>=5&&d<=8&&ReachabilityService.playerPassable(x,y)&&!OccupancyService.isOccupied(x,y)&&!(x===state.stairs.x&&y===state.stairs.y))cand.push({x,y,d})}cand.sort((a,b)=>b.d-a.d);return cand[0]||null}
  function storyTick(){
    const st=storyEnsureState();if(!st||state.dead||state.victory)return;
    if(state.floor===STORY_ECHO_FLOOR&&!st.echoSeen&&!st.echo&&state.floorTurn>=2){const q=storyEchoCell();if(q){st.echo={x:q.x,y:q.y,startTurn:state.turn};storyWhisper('복도 끝에 익숙한 제복이 보인다.',2200);addLog('멀리서 선행 조사관과 닮은 사람이 보였다.')}}
    if(st.echo){const d=Math.max(Math.abs(st.echo.x-state.player.x),Math.abs(st.echo.y-state.player.y)),age=state.turn-st.echo.startTurn;if(d<=3||age>=7){storyWhisper(d<=3?'“여기야.”':'그가 문 너머로 들어간 순간, 복도에는 아무도 없었다.',2300);addLog(d<=3?'이름을 불렀지만 그는 대답하지 않고 “여기야.”라고만 말했다.':'복도 끝의 인영이 사라졌다. 발자국은 남지 않았다.');st.echo=null;st.echoSeen=true}}
  }
  function storyDrawWorld(){
    const st=storyEnsureState();if(!st||!state)return;
    if(st.echo&&VisibilityService.isVisible(st.echo.x,st.echo.y)){X.save();X.globalAlpha=.91;drawCreature({x:st.echo.x,y:st.echo.y,color:'#708592',shape:'human',name:'선행 조사관의 인영'});X.globalCompositeOperation='screen';const gx=st.echo.x*TILE+TILE/2,gy=st.echo.y*TILE+TILE/2,g=X.createRadialGradient(gx,gy,4,gx,gy,36);g.addColorStop(0,'rgba(154,178,183,.10)');g.addColorStop(1,'rgba(154,178,183,0)');X.fillStyle=g;X.fillRect(gx-36,gy-36,72,72);X.restore()}
    if(st.friendCorpse&&VisibilityService.isVisible(st.friendCorpse.x,st.friendCorpse.y)){const x=st.friendCorpse.x*TILE,y=st.friendCorpse.y*TILE;X.save();X.globalAlpha=.95;X.fillStyle='rgba(0,0,0,.5)';X.fillRect(x+5,y+25,24,4);X.fillStyle='#243039';X.fillRect(x+7,y+17,19,8);X.fillStyle='#586b75';X.fillRect(x+11,y+10,13,10);X.fillStyle='#b79a72';X.fillRect(x+22,y+13,5,4);X.fillStyle='#7e3428';X.fillRect(x+9,y+19,5,3);X.fillStyle='#d2b978';X.fillRect(x+12,y+12,3,3);X.restore()}
  }
  const friendLines=['여기서 나가면 또 누군가가 내려올 뿐이야.','나는 실패한 게 아니야. 만루가 어떤 곳인지 알아낸 거야.','건물은 사람이 사는 곳이라고 생각했지? 여기서는 사람이 방을 완성한다.','너라면 이해할 줄 알았어.'];
  function storyFriendBossPattern(mon,d,target=state.player){if(target===state.player&&playerConcealed58())return false;const turn=state.floorTurn,p=target;if(turn%8===0){const line=friendLines[(mon.storyLine992++)%friendLines.length];if(p===state.player)storyWhisper(`“${line}”`,2300);addLog(`실종된 조사관: ${line}`)}if(turn%6===0){const cand=DIRS8.map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).filter(q=>q.x>0&&q.y>0&&q.x<COLS-1&&q.y<ROWS-1&&terrainSurface58(state.map[q.y]?.[q.x])).slice(0,2);for(const q of cand)RuntimeTerrainOwner.mutate(q.x,q.y,TT.SNARE,{source:'story-boss'});addLog('조사관이 정부 봉쇄부적을 던져 퇴로를 묶었다.');return true}if(turn%4===0&&d>=3&&d<=7&&monsterAttackLineR(mon,7,{target:p}).ok){projectileFX(mon.x,mon.y,p.x,p.y,'#d3c09c');addLog('조사관이 낡은 권총을 들어 급소를 노린다.');attackMonster(mon,3,{target:p,delivery:'ranged',projectile:true,reflectable:true,range:7});return true}return false}
  function storyCorpseCell(mon){const dirs=[[2,1],[-2,1],[2,-1],[-2,-1],[3,0],[-3,0],[0,3]];for(const[dx,dy]of dirs){const x=mon.x+dx,y=mon.y+dy;if(x>1&&y>1&&x<COLS-2&&y<ROWS-2&&ReachabilityService.playerPassable(x,y)&&!OccupancyService.isOccupied(x,y))return{x,y}}return{x:clamp(mon.x+2,2,COLS-3),y:clamp(mon.y+1,2,ROWS-3)}}
  function storyBreakFriendMask(mon){
    if(!mon||mon.storyPhase992!==1)return false;const st=storyEnsureState();st.friendCorpse=storyCorpseCell(mon);st.truthRevealed=true;mon.storyPhase992=2;Object.assign(mon,{name:'만루보주 · 본모습',monsterSpecies105:BOSSES[25].name,concept57:SPECIAL_MONSTER_CONCEPTS57['만루보주 · 본모습'],hp:BOSSES[25].hp,maxHp:BOSSES[25].hp,atk:BOSSES[25].atk,def:BOSSES[25].def,eva:BOSSES[25].eva,color:BOSSES[25].color,shape:'zero',kind:'spirit',ranged:false,range:4,bossPattern:'master',flying:true,coreStage54:0,nextAction54:state.floorTurn+2,nextShot54:state.floorTurn+3,intent54:null,stunned:1});state.visionPenalty=0;FX.flashUntil=performance.now()+420;FX.flashColor='#d8b36a';burst(mon.x,mon.y,'#d2b46d',34,1.25);addLog('친구의 얼굴이 깨졌다. 경기장 가장자리에서 오래된 정부 제복과 신분패가 드러난다.');addLog('그 모습은 친구가 타락한 것이 아니었다. 만루가 남은 기억을 입고 있었다.');updateAll();storyOpenScene('시체의 신분패','봉인된 바닥이 갈라지며 오래 전에 굳은 정부 제복이 드러난다. 신분패는 선행 조사관의 것이다.\n\n네가 23층에서 본 사람도, 방금 싸운 얼굴도 이 시체보다 훨씬 뒤의 시간에 나타났다.','오지 말랬어야 했는데.');return true
  }
  function storyShowEndingChoice(){
    if(!RunLifecycle.terminate('victory'))return;updateAll();RuntimeState.ui.storyChoice=null;presentStoryEndingChoice();
  }
  function presentStoryEndingChoice(){document.body.classList.remove('run-active');const ov=document.getElementById('overlay'),card=document.getElementById('card');if(!ov||!card)return;ov.style.display='flex';const st=storyEnsureState(),count=st?.collected?.length||0,complete=count>=7;const evidence=complete?'회수한 기록들은 같은 결론을 가리킨다. 만루는 사람의 기억과 동선을 붙잡아 방을 유지하고, 주인의 자리를 다음 사람에게 넘긴다.':'기록은 일부 비어 있지만 시체와 천실핵만으로도 한 가지는 분명하다. 친구는 되돌아오지 않는다.';
    card.innerHTML=`<div class="storyEnd992"><div class="brand">정부 특별조사 · 최종 판단</div><h1>주인의 자리가 비었다</h1><div class="sub">선행 조사관 사망 확인 · 천실핵 통제권 소실</div><div class="storyEvidence992"><b>회수 기록 ${count}/${docOrder.length}</b><br>${escapeHtmlText(evidence)}<br><br>만루는 마지막으로 두 가지 가능성을 보여준다. 하나는 방과 그 안의 흔적을 남기는 것. 다른 하나는 핵과 함께 전부 끝내는 것이다.</div><div class="storyChoices992"><button class="storyChoice992" data-story-ending="inherit"><small>주인 인장</small><b>계승한다</b><p>천실핵을 유지하고 친구를 포함한 남은 기억과 영혼의 흔적을 보존한다. 대신 네 이름이 다음 만루보주의 자리에 들어간다.</p></button><button class="storyChoice992" data-story-ending="destroy"><small>철거 판단</small><b>핵을 부순다</b><p>증식의 근원을 끝낸다. 만루에 묶인 흔적과 일부 유물도 함께 사라지며 친구는 되돌릴 수 없다.</p></button></div><div class="storyJudge992" id="storyJudge992"></div></div>`;
    card.querySelectorAll('[data-story-ending]').forEach(b=>b.onclick=()=>InputRouter.dispatch({type:'STORY_SELECT_ENDING',choice:b.dataset.storyEnding,source:'story-choice'}));
  }
  function storySelectEnding(type){if(runState57()!=='victory'||!['inherit','destroy'].includes(type))return false;RuntimeState.ui.storyChoice=type;presentStorySelection(type);return true}
  function presentStorySelection(type){const box=document.getElementById('storyJudge992');if(!box)return;document.querySelectorAll('.storyChoice992').forEach(b=>b.classList.toggle('selected',b.dataset.storyEnding===type));const text=type==='inherit'?'친구의 목소리를 보존한다는 말은 친구를 되살린다는 뜻이 아니다. 만루가 기억을 소유하는 방식 그대로 남긴다는 뜻이다. 인장을 잡는 순간 너는 밖으로 나가는 사람이 아니라 방을 유지하는 사람이 된다.':'핵을 부수면 방들은 외부 크기에 맞춰 무너진다. 그 과정에서 만루가 붙잡고 있던 목소리와 물건 일부도 함께 사라진다. 대신 다음 조사관이 같은 복도를 걷는 일은 끝난다.';box.innerHTML=`${escapeHtmlText(text)}<br><button id="storyConfirmEnding992">이 판단을 확정한다</button>`;box.classList.add('open');document.getElementById('storyConfirmEnding992').onclick=()=>InputRouter.dispatch({type:'STORY_CONFIRM_ENDING',source:'story-confirm'})}
  function storyResolveEnding(type){if(runState57()!=='victory')return;const st=storyEnsureState();if(st){st.ending=type;if(!st.endCleanup992){st.endCleanup992=true;runEndEffects53('victory')}}presentStoryEnding(type)}
function presentStoryEnding(type){const card=document.getElementById('card');if(!card)return;if(type==='inherit'){card.innerHTML=`<div class="storyEnd992 storyEndingResult992"><div class="brand">계승 기록</div><h2>새 만루보주</h2><p>인장을 손에 넣는 순간 천 개의 방이 네 호흡에 맞춰 조용히 자리를 바꾼다. 친구의 목소리는 돌아오지 않는다. 다만 그가 남긴 필체와 발자국과 마지막 말은 어느 방에서도 지워지지 않는다.<br><br>정부는 실종된 두 조사관을 끝내 회수하지 못한다.</p><p class="storyEndingLast992">몇 달 뒤, 관청에 새로운 민원이 접수되었다.<br>“객주의 방이 어제보다 하나 늘었습니다.”</p><button onclick="location.reload()">새 조사 시작</button></div>`}else{card.innerHTML=`<div class="storyEnd992 storyEndingResult992"><div class="brand">철거 완료 보고</div><h2>천 개의 방이 멎었다</h2><p>천실핵이 깨지자 외부의 크기보다 넓던 복도부터 차례로 접혀 사라진다. 챙겨 온 몇몇 유물은 빛을 잃고, 만루가 붙잡고 있던 목소리도 더 이상 들리지 않는다.<br><br>너는 친구의 신분패와 회수한 조사 기록만 들고 밖으로 나온다.</p><p class="storyEndingLast992">철거 보고서에는 건물 한 채가 사라졌다고 적혔다.<br>그 안에 천 개의 방이 있었다는 내용은 기록되지 않았다.</p><button onclick="location.reload()">새 조사 시작</button></div>`}}
  function projectStoryUI(){if(interactionActive8('storyScene992')&&RuntimeState.ui.storyScene){const v=RuntimeState.ui.storyScene;presentStoryScene(v.title,v.text,v.quote)}else if(interactionActive8('storyModal992')){const d=findStoryDoc(RuntimeState.ui.storyNote);if(d)presentStoryNote(d);else storyOpenArchive()}if(runState57()==='victory'){const ending=state?.story992?.ending;if(ending)presentStoryEnding(ending);else{presentStoryEndingChoice();if(RuntimeState.ui.storyChoice)presentStorySelection(RuntimeState.ui.storyChoice)}}}
const BRANCH_LORE=Object.freeze({
 palace:'48턴 조수에 따라 낮은 지름길이 잠긴다. 금테 석단과 높은 회랑을 이용하고 잠긴 조정의 창해군을 처치하라.',
 citadel:'여러 높이의 탑과 철교를 오간다. 최상층 다리로 중앙탑에 들어가 최하부까지 내려가라.',
 dojo:'1층은 구획마다 무도가를 쓰러뜨려야 다음 문이 열린다. 2층은 무도가를 피해 지나갈 수 있으며, 등명부가 통하지 않는다.',
 canal:'물길과 수문으로 갈라진 지하 수로. 물가의 적과 잠긴 길을 살펴라.',
 granary:'적재실과 지하 숙성고로 이어지는 창고. 보급품 사이에 식귀가 숨어 있다.',
 stockade:'가파른 산길과 정상 성채. 길 밖의 낭떠러지와 시야를 가리는 절벽을 조심하라.',
 black:'검은 능선과 산성. 좁은 길과 매복에 대비하라.',
 mine:'불빛이 닿지 않는 갱도와 광차가 오가는 심부. 다리 밖은 낭떠러지다.'
});
  function tip70(id,text,sub='',options={}){
    if((!options.repeatable&&seenTip70(id))||coachCurrent?.id===id||RC.tutorialQueue.some(t=>t.id===id))return;
    const entry={id,text,sub,repeatable:!!options.repeatable,title:options.title,run:state?.runId984};if(entry.repeatable)RC.tutorialQueue.unshift(entry);else RC.tutorialQueue.push(entry);clearTimeout(coachTimer);coachTimer=setTimeout(pumpTip,0);
  }
  function seenTip70(id){return !!tipLedger66().seen[id]}
function coachAfterPickup(ctx){
    const ground=ctx.ground;
    if(ground){
      if(ground.type==='potion')tip70('potion','약병은 런마다 색과 정체가 바뀐다. 발견 장소와 냄새·색 단서로 후보를 좁히고, 마시거나 감정부적으로 식별한다.','미확인 약병은 역할 탭도 숨겨진다.');
      else if(ground.type==='talisman')tip70('talisman','부적은 주문서와 폭탄 역할을 겸한다. 위기 탈출·봉쇄·지도·광역 공격에 아끼지 말고 써라.','전술벨트에서 빠르게 사용 가능');
      else if(ground.type==='food')tip70('food','음식은 허기 관리뿐 아니라 보스 전 도핑과 조리 재료다. 화로나 솥에서 비방 조합을 실험할 수 있다.','국밥처럼 먹는 턴이 긴 음식은 안전한 곳에서 사용');
      else if(ground.type==='weapon'&&ground.range>=7)tip70('bow','활은 적을 한 번 눌러 조준하고 다시 누르거나 공격을 눌러 발사한다. 사선과 장애물을 확인하라.','적을 길게 누르면 사격 가능 여부도 표시');
    }
  }
