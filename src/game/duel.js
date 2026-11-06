/* The ghost duel (docs/GHOST_BATTLE.md), first part: finding an opponent and passing payloads over the shared cp32 relay, mode MANRU_DUEL.
   The relay only matches two players and carries what they send; the game itself (arena, rules) is built on top of `send` and `inbox`.
   The socket is the one Spectate owns (one connection per page): Spectate hands every packet that is not about spectating to `receive` here. */
const Duel={
 MODE:'MANRU_DUEL',TURN_MS:20000,SEND_GAP_MS:120,
 stage:'idle',queueEntryId:'',matchId:'',token:'',role:'',remote:'',sent:0,inbox:[],note:'',play:false,environment:0,mineFloor:1,mineGhostId:'',mineScore:null,theirScore:null,theirFloor:0,CARRY_KEY:'manru.duelCarry',LEVELS_KEY:'manru.duelLevels',PENDING_KEY:'manru.duelPending',resumed:false,lastStand:null,fellTurn:-1,carried:false,helloScore:null,before:null,after:null,dies:false,locked:false,stakes:false,helloBody:null,helloFloor:0,hudSig:'',hudFoe:null,theirClock:0,settledText:'',pending:null,settling:null,shown:0,turn:'host',turnEnds:0,turnSeen:0,theirs:null,mineBody:'',outcome:'',reported:false,applying:false,arena:-1,seq:0,lastSig:'',lastSend:0,keysBound:false,
 // idle -> connecting -> queued -> offered -> matched (the relay committed the session) -> idle again on leave or when the relay drops it
 setStage(stage,note=''){this.stage=stage;this.note=note;PlayStats.logAdd({a:'DUEL',stage,note,role:this.role,match:this.matchId});this.renderPicker()},
 find(play=false,body='',floor=1,ghostId=''){
  if(this.stage!=='idle')return false;this.play=play;this.mineBody=body;this.mineFloor=floor;this.mineGhostId=ghostId;this.mineScore=this.scoreOf(ghostId,floor);this.theirScore=null;this.helloScore=null;this.before=this.after=null;this.dies=false;this.locked=!play;this.stakes=false;this.helloBody=null;this.theirs=null;
  this.queueEntryId='q-'+Math.random().toString(36).slice(2,12)+Date.now().toString(36);this.inbox=[];this.sent=0;
  // The relay is a free instance that sleeps when it is quiet: wake it first (as the spectator screens do), or the first connection after a pause is refused.
  const entry=this.queueEntryId;
  this.setStage('connecting','서버를 깨우는 중… (오래 쉬었다면 1분쯤 걸린다)');
  Spectate.wake().then(()=>{
   if(this.stage!=='connecting'||this.queueEntryId!==entry)return;
   this.setStage('connecting','서버에 연결하는 중…');
   if(!Spectate.ws&&!Spectate.open('duel')){this.pickNote='서버에 연결할 수 없다. 잠시 뒤 다시 해 본다.';this.leave('서버에 연결할 수 없다');return}
   if(Spectate.ready)this.onReady();
  });
  return true;
 },
 onReady(){
  if(this.stage!=='connecting')return;
  this.setStage('queued','상대를 찾는 중…');
  Spectate.send({type:'match.enqueue',mode:this.MODE,queueEntryId:this.queueEntryId});
 },
 // Every packet of the relay that belongs to a match.
 receive(packet){
  switch(packet.type){
   // The relay put this side in its queue (again, if an offer fell through): say where, and be ready for the next offer.
   case 'match.queued':
    if(packet.mode!==this.MODE||!['connecting','queued','offered'].includes(this.stage))return;
    this.matchId='';this.setStage('queued',packet.position>1?`상대를 찾는 중… (대기 ${packet.position}번째)`:'상대를 찾는 중…');return;
   // An offer the relay withdrew (the other side did not answer in time): it queues this side again, so the search goes on instead of staying at "found".
   case 'match.offer-cancelled':
    if(this.stage!=='offered'||packet.matchId!==this.matchId)return;
    this.matchId='';this.setStage('queued','상대가 떠나 다시 찾는 중…');return;
   case 'session.failed':this.failed(packet);return;
   case 'match.offer':
    if(packet.mode!==this.MODE||!['queued','offered'].includes(this.stage))return;
    this.matchId=packet.matchId;this.role=packet.role;this.remote=packet.remotePlayerId;this.setStage('offered','상대를 찾았다');
    Spectate.send({type:'match.ready',matchId:packet.matchId,queueEntryId:this.queueEntryId});return;
   case 'session.commit':
    if(packet.mode!==this.MODE||packet.matchId!==this.matchId)return;
    this.token=packet.sessionToken;this.role=packet.role;this.remote=packet.remotePlayerId;this.setStage('matched','상대와 연결됐다. 망령을 거는 중…');
    if(this.play)this.lockMine();return;
   case 'relay.message':
    if(packet.sessionToken!==this.token)return;
    if(this.fightMessage(packet.payload))return;
    this.inbox.push({from:packet.fromRole,payload:packet.payload,seq:packet.relaySequence});return;
   case 'session.ended':case 'session.closed':case 'session.expired':
    if(this.stage==='matched'){this.forfeited();this.leave('상대와의 연결이 끝났다')}return;
   default:return;
  }
 },
 // ---- score (duelarenas.js): kept per ghost on this device, no server field ---------------------------------------------------
 SCORE_KEY:'manru.duelScores',
 scoreMap(){try{const map=JSON.parse(lsGet(this.SCORE_KEY)||'{}');return map&&typeof map==='object'&&!Array.isArray(map)?map:{}}catch(error){ignoreError('duel scores unreadable',error);return{}}},
 scoreOf(id,floor){return duelScoreClean(id?this.scoreMap()[id]:null,floor)},
 saveScore(id,score){if(!id)return;const map=this.scoreMap();if(score)map[id]={s:score.s,peak:score.peak};else delete map[id];lsSet(this.SCORE_KEY,JSON.stringify(map))},
 // A ghost whose current score is at or under its death score is gone, whether or not the server has settled it yet (a row with a score and a best score).
 isGone(row){const s=Number(row?.score)||0,peak=Number(row?.peak)||0;return s>0&&peak>=s&&s<=duelDeathOf(peak)},
 // death score (purple-grey, with a red pulsing glow that grows as the current score nears it) / current score
 scoreNode(score){
  const node=Spectate.el('span','dsScore'),danger=duelDanger(score);
  node.style.setProperty('--danger',String(danger));if(danger>0)node.classList.add('hot');
  node.append(Spectate.el('i','dsD',String(score.d)),Spectate.el('i','dsSlash','/'),Spectate.el('i','dsS',String(score.s)),document.createTextNode('점'));return node;
 },
 // Hand a payload to the other player.
 send(payload){
  if(this.stage!=='matched')return false;
  return Spectate.send({type:'relay.message',sessionToken:this.token,clientMessageId:'d'+(++this.sent),payload});
 },
 // Take what has arrived since the last call.
 take(){const list=this.inbox;this.inbox=[];return list},
 // Both ghosts go into the duel on the server before anything is played (the server lets a ghost be in one duel at a time). A server that does not know the
 // stakes yet makes this a practice duel; a ghost that is busy, or a server that cannot be reached, stops it here.
 async lockMine(){
  const match=this.matchId;let refused='';
  this.stakes=false;
  if(PlayStats.endpoint()&&this.mineGhostId){
   let reply=null;
   try{reply=await PlayStats.ghostLock(this.mineGhostId,match)}catch(error){ignoreError('duel lock not sent',error)}
   if(this.matchId!==match||this.stage!=='matched')return;
   if(!reply)refused='서버에 연결하지 못해 망령을 걸 수 없다.';
   else if(reply.ok){this.stakes=true;lsSet(PlayStats.STAKES_KEY,'1')}
   else if(['busy','none','duel','auth'].includes(reply.error))refused=reply.error==='busy'?'이 망령은 다른 대전에 묶여 있다.':'이 망령을 걸 수 없다.';
  }
  if(refused){this.pickNote=refused;this.leave(refused);return}
  this.locked=true;
  if(this.role==='guest')this.send({kind:'hello',body:this.mineBody,floor:this.mineFloor,score:this.mineScore});
  else if(this.helloBody!==null)this.startFight(Math.floor(Math.random()*DUEL_ARENAS.length),this.helloBody,this.helloFloor,this.helloScore);
 },
 // The relay refused something during a search: say why (the one that matters is a relay that does not know the duel mode yet).
 failed(packet){
  if(!['connecting','queued','offered'].includes(this.stage))return;
  const text=packet.code==='INVALID_MODE'?'서버가 아직 망령전을 모른다. 서버를 갱신해야 한다. (INVALID_MODE)':`서버가 거절했다. (${packet.code||'?'}${packet.detail?' · '+packet.detail:''})`;
  this.pickNote=text;this.leave(text);
 },
 // The socket closed: a search still going on (waking, queued, offered) cannot go on. A match already made is the relay's business (the session ends there).
 socketClosed(){
  if(['connecting','queued','offered'].includes(this.stage)){this.pickNote='서버 연결이 끊겼다. 다시 해 본다.';this.leave('서버 연결이 끊겼다')}
 },
 leave(note=''){
  if(note&&!document.getElementById('duelScene'))toast(note); // with the picker open, its own line says it
  if(this.stakes&&this.locked&&!this.fighting&&this.mineGhostId)PlayStats.ghostRelease(this.mineGhostId,this.matchId).catch(error=>ignoreError('duel release not sent',error));
  if(this.stage==='matched')Spectate.send({type:'session.leave',sessionToken:this.token});
  else if(this.stage==='queued'||this.stage==='offered')Spectate.send({type:'match.cancel',matchId:this.matchId});
  this.token='';this.matchId='';this.role='';this.remote='';this.fighting=false;this.setStage('idle',note);
 },

 // ---- the way in: the title button ---------------------------------------------------------------------------------------------
 // A panel with the player's own ghosts (the ones still standing); choosing one fetches its saved character, looks for an opponent and, when both have one,
 // the fight begins on its own. The panel shows what the search is doing and can cancel it.
 openPicker(){
  if(document.getElementById('duelScene'))return false;
  if(this.stage!=='idle')this.leave(''); // the title screen is the only way in: a match still open here is a stale one
  const scene=Spectate.el('div'),panel=Spectate.el('div','spectatePanel'),head=Spectate.el('header','duelHead'),close=Spectate.el('button',null,'×'),note=Spectate.el('p','spectateHint duelNote',''),list=Spectate.el('div','duelGhosts');
  const title=Spectate.el('div','duelTitle'),rules=Spectate.el('ul','duelRules');
  scene.id='duelScene';scene.setAttribute('role','dialog');scene.setAttribute('aria-label','망령전');note.id='duelNote';list.id='duelGhosts';
  close.type='button';close.id='duelClose';close.setAttribute('aria-label','닫기');close.onclick=()=>this.closePicker();
  title.append(Spectate.el('small',null,'저승의 전장'),Spectate.el('h2',null,'망령전'));
  for(const [mark,text] of [['건다','가진 것을 모두 건다'],['잃는다','점수가 데스점수 아래로 떨어지면 망령이 사라진다'],['얻는다','상대를 소멸시키면 떨어진 것을 줍고 레벨이 오른다']]){const rule=Spectate.el('li');rule.append(Spectate.el('b',null,mark),Spectate.el('span',null,text));rules.append(rule)}
  head.append(title,close);panel.append(head,rules,note,list);scene.append(panel);document.body.append(scene);
  this.ghosts=null;this.pickNote='';this.loadMine();return true;
 },
 closePicker(){
  if(this.stage==='queued'||this.stage==='offered'||this.stage==='connecting')this.leave('취소했다');
  this.pending=null;document.getElementById('duelScene')?.remove();
 },
 async loadMine(){
  const url=PlayStats.endpoint();
  if(!url){this.pickNote='수집 서버가 연결되어 있지 않다.';this.renderPicker();return}
  this.pickNote='내 망령을 불러오는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghosts&'+PlayStats.ownerQuery());
   this.ghosts=Array.isArray(data?.list)?data.list.filter(g=>(g.status==='alive'||g.status==='locked')&&!this.isGone(g)):null;
   for(const g of this.ghosts||[])if(g.score>0&&!this.scoreMap()[g.id])this.saveScore(g.id,{s:g.score,peak:g.peak}); // a cleared browser gets its scores back from the server
   this.pickNote=this.ghosts?'':'망령을 불러오지 못했다.'; // the rules strip and the empty-state card already say the rest
  }catch(error){ignoreError('duel ghosts load failed',error);this.ghosts=null;this.pickNote='망령을 불러오지 못했다.'}
  this.renderPicker();
 },
 async choose(row){
  if(this.stage!=='idle')return;
  const url=PlayStats.endpoint();
  this.pickNote='망령을 깨우는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghost&'+PlayStats.ownerQuery()+'&id='+encodeURIComponent(row.id));
   if(!data?.body){this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker();return}
   this.pending={row,body:data.body};this.pickNote='';this.renderPicker();
  }catch(error){ignoreError('duel ghost fetch failed',error);this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker()}
 },
 // The class look (small, as the board draws it) on a pedestal, the class name, and the numbers of a ghost, for the cards of the picker.
 className(id){return CLASSES.find(c=>c.id===id)?.name||'망령'},
 portrait(id,size=''){const wrap=Spectate.el('span','duelPedestal'+(size?' '+size:'')),icon=PlayStats.classIcon(id);icon.className='duelPortrait';wrap.append(icon);return wrap},
 chip(label,value){const chip=Spectate.el('span','duelChip');const text=Spectate.el('b');text.append(value instanceof Node?value:String(value));chip.append(Spectate.el('small',null,label),text);return chip},
 ghostCard(row){
  const card=Spectate.el('button','duelGhost'),body=Spectate.el('span','duelBody'),chips=Spectate.el('span','duelChips');
  card.type='button';card.dataset.ghost=row.id;
  chips.append(this.chip('깊이',row.floor+'층'),this.chip('레벨',row.level),this.chip('데스/현재',this.scoreNode(this.scoreOf(row.id,row.floor))));
  body.append(Spectate.el('b','duelName',this.className(row.cls)),Spectate.el('span','duelCause',`${row.floor}층에서 쓰러짐 · ${row.cause}`),chips);
  const locked=row.status==='locked'; // in a duel (or one that ended without a word): the server frees it by itself after half an hour
  card.append(this.portrait(row.cls),body,Spectate.el('span','duelEnter',locked?'대전 중 · 최대 30분':'출전'));
  if(locked){card.disabled=true;card.classList.add('locked')}else card.onclick=()=>this.choose(row);
  return card;
 },
 confirmCard(){
  const {row,body}=this.pending,card=Spectate.el('div','duelConfirmCard'),head=Spectate.el('div','duelConfirmHead'),title=Spectate.el('div'),buttons=Spectate.el('div','duelButtons');
  let ghost;try{ghost=JSON.parse(body)}catch(error){ignoreError('duel ghost body unreadable',error);ghost={}}
  const worn=['weapon','armor','cloak','relic','trinket'].filter(slot=>ghost[slot]).length,bag=Array.isArray(ghost.inventory)?ghost.inventory.length:0;
  title.append(Spectate.el('b','duelName',this.className(row.cls)),Spectate.el('span','duelCause',`${row.floor}층에서 쓰러짐 · Lv ${row.level}`));
  head.append(this.portrait(row.cls,'big'),title);
  const stake=Spectate.el('div','duelStake');stake.append(this.chip('소지품',bag+'개'),this.chip('장비',worn+'개'),this.chip('데스/현재',this.scoreNode(this.scoreOf(row.id,row.floor))));
  const warn=Spectate.el('p','duelWarn','이기면 현점수가 오르고, 지면 내려간다. 현점수가 데스점수 이하로 떨어지는 패배만 이 망령과 가진 것을 모두 잃는다. 그때는 이긴 쪽이 쓰러진 자리에서 줍고 레벨이 오른다.');
  const go=Spectate.el('button','duelGo','건다'),back=Spectate.el('button','duelBack','돌아가기');go.type=back.type='button';go.id='duelConfirm';back.id='duelBack';
  go.onclick=()=>{this.pending=null;this.find(true,body,row.floor,row.id)};back.onclick=()=>{this.pending=null;this.renderPicker()};
  buttons.append(go,back);card.append(head,stake,warn,buttons);return card;
 },
 searchCard(){
  let ghost={};try{ghost=JSON.parse(this.mineBody||'{}')}catch(error){ignoreError('duel ghost body unreadable',error)}
  const card=Spectate.el('div','duelSearch duelCenter'),rings=Spectate.el('span','duelRings'),cancel=Spectate.el('button','duelBack','그만두기');
  rings.append(this.portrait(ghost.classId||'wanderer','big'));cancel.type='button';cancel.onclick=()=>this.leave('취소했다');
  card.append(rings,Spectate.el('b','duelName',this.note||'상대를 찾는 중…'),Spectate.el('span','duelCause',`${this.className(ghost.classId)} · ${this.mineFloor}층에서 쓰러진 망령`),cancel);return card;
 },
 renderPicker(){
  const scene=document.getElementById('duelScene');
  if(!scene)return;
  if(this.stage==='matched'&&(this.fighting||state?.duel)){scene.remove();return} // until the fight is on, the card says what is going on
  const note=document.getElementById('duelNote'),list=document.getElementById('duelGhosts'),busy=this.stage!=='idle',confirming=!!this.pending&&!busy;
  scene.dataset.view=busy?'search':confirming?'confirm':'pick';
  note.textContent=busy||confirming?'':this.pickNote; // while searching or confirming, the card says it
  list.replaceChildren();
  if(busy){list.append(this.searchCard());return}
  if(confirming){list.append(this.confirmCard());return}
  if(!this.ghosts){if(/중…$/.test(this.pickNote))for(let i=0;i<3;i++)list.append(Spectate.el('span','duelSkel'));return}
  if(!this.ghosts.length){const empty=Spectate.el('div','duelEmpty');empty.append(Spectate.el('b',null,'출전할 망령이 없다'),Spectate.el('span',null,'깊이 순위권(상위 30)에 든 채 죽으면 그 캐릭터가 망령으로 남는다.'));list.append(empty);return}
  for(const row of this.ghosts)list.append(this.ghostCard(row));
 },
 // ---- winnings: what a won duel took from the other ghost waits on the server until the next new run, and goes into that run's start chest ----
 async claimWinnings(){
  if(!PlayStats.endpoint()||!lsGet(PlayStats.STAKES_KEY)||!state||state.duel||runIsEphemeral()||state.debugMapGeneration57)return;
  let reply=null;
  try{reply=await PlayStats.lootClaim()}catch(error){ignoreError('duel winnings not claimed',error)}
  if(!(reply?.ok&&Array.isArray(reply.items)&&reply.items.length))return; // the server says a win stands
  this.grantLevels();
  // what was picked up from the drop is what comes (a win from another device has no list here: then what the server has)
  const raw=lsGet(this.CARRY_KEY);let items=reply.items;
  if(raw!==null){try{const carried=JSON.parse(raw);if(Array.isArray(carried))items=carried}catch(error){ignoreError('duel carry unreadable',error)}lsSet(this.CARRY_KEY,'[]')}
  this.deliver(items);
 },
 // A ghost put out (a duel won against a score that fell to its death score) is a level for the next new run, which brings a martial-arts point to spend: given
 // once the server has said the win stands.
 grantLevels(){
  const count=Number(lsGet(this.LEVELS_KEY))||0;if(count<=0||!state?.player)return;
  lsSet(this.LEVELS_KEY,'0');let gained=0;
  for(let i=0;i<count&&state.player.level<BALANCE.maxLevel;i++){state.player.xp=state.player.nextXp;checkLevel();gained++}
  if(gained){addLog(`망령전에서 망령을 소멸시킨 보상: 레벨 ${gained} 상승.`);updateAll()}
 },
 // Into the start chest if it is still shut; if the player has opened it already (or there is none), straight into the bag. The upgrade talisman (강화부적) is not among it.
 deliver(items){
  const drops=items.filter(item=>item&&item.talismanKind!=='upgrade');if(!drops.length)return;
  const chest=state?.tutorialChest;
  if(chest&&!chest.opened){chest.loot=[...(chest.loot||[]),...drops];addLog('망령전의 전리품이 시작 상자에 들어 있다.');return}
  for(const item of drops)addInventoryItem(item);
  addLog('망령전의 전리품을 받았다.');
 },
 // ---- the fight: each side plays its own real game ---------------------------------------------------------------------------
 // Both players run the real game on their own page (the arena of duelarenas.js as a run, their own ghost as the player: real inventory, skills, screen). The
 // other player is a stand-in creature (`duelOpponent`, with the stats of the other's ghost) that stands where the other player stands. Four things cross:
 // `sync` (where the sender stands, its health, whose turn it is), `hit` (damage the sender dealt to the stand-in: the receiver takes it as its own player),
 // `result` (who won) and the setup (`hello`, `start`). Self-effects (potions, equipment, buffs) need no message; effects that put something on the map (fields,
 // terrain) do not cross yet. One side acts at a time, twenty seconds each, the host first; nothing is calculated by the relay.
 begin(arena,theirsBody,theirFloor=0,theirScore=null){
  if(this.stage!=='matched'||!DUEL_ARENAS[arena]||this.fighting)return false;
  this.fighting=true;this.carried=false;this.lastStand=null;this.fellTurn=-1;this.theirFloor=theirFloor;this.theirScore=duelScoreClean(theirScore,theirFloor);this.before=this.after=null;this.dies=false;this.theirClock=0;this.arena=arena;this.lastSig='';this.reported=false;this.outcome='';this.settledText='';this.hudFoe=null;this.hudSig='';
  this.theirs=theirsBody?JSON.parse(theirsBody):null;
  try{newGame(CLASSES[0],{arena,role:this.role,ghost:this.mineBody?JSON.parse(this.mineBody):null,opponent:this.theirs,baseFloor:this.mineFloor,opponentFloor:theirFloor})}
  catch(error){ignoreError('duel arena could not be opened',error);this.pickNote='전장을 열지 못했다.';this.leave('전장을 열지 못했다');return false}
  document.getElementById('duelScene')?.remove();
  this.giveTurn('host');
  return true;
 },
 // Host: choose the arena, begin, and tell the guest (with the host's ghost, so that the guest can stand its stand-in up).
 startFight(arena,guestBody='',guestFloor=0,guestScore=null){
  if(this.role!=='host'||!this.begin(arena,guestBody,guestFloor,guestScore))return false;
  this.send({kind:'start',arena,body:this.mineBody,floor:this.mineFloor,score:this.mineScore});
  return true;
 },
 // What the fight itself passes over the relay; true when the payload was one of its own.
 fightMessage(payload){
  if(!payload||typeof payload!=='object')return false;
  switch(payload.kind){
   case 'hello':if(this.role!=='host')return false;if(this.locked)this.startFight(Math.floor(Math.random()*DUEL_ARENAS.length),String(payload.body||''),Number(payload.floor)||0,payload.score);else{this.helloBody=String(payload.body||'');this.helloFloor=Number(payload.floor)||0;this.helloScore=payload.score||null}return true;
   case 'start':if(this.role==='guest')this.begin(payload.arena,String(payload.body||''),Number(payload.floor)||0,payload.score);return this.role==='guest';
   case 'sync':this.applySync(payload);return true;
   case 'hit':this.applyHit(payload);return true;
   case 'status':this.applyStatus(payload);return true;
   case 'force':this.applyForce(payload);return true;
   case 'field':this.applyField(payload);return true;
   case 'terrain':this.applyTerrain(payload);return true;
   case 'tile':this.applyTile(payload);return true;
   case 'jar':this.applyJar(payload);return true;
   case 'item':this.applyItem(payload);return true;
   case 'result':this.applyResult(payload);return true;
   default:return false;
  }
 },
 opponent(){return state?.duel?state.monsters.find(m=>m.duelOpponent):null},
 other(){return this.role==='host'?'guest':'host'},
 // The stand-in follows the other player.
 applySync(sync){
  const stand=this.opponent();
  if(!stand||this.reported)return;
  if(Number.isFinite(sync.x)&&Number.isFinite(sync.y)&&(stand.x!==sync.x||stand.y!==sync.y)){stand.x=sync.x;stand.y=sync.y;OccupancyService.move(stand,sync.x,sync.y)}
  this.lastStand={x:stand.x,y:stand.y};
  if(Number.isFinite(sync.hp))stand.hp=Math.max(0,sync.hp);
  if(Number.isFinite(sync.maxHp))stand.maxHp=sync.maxHp;
  if(Array.isArray(sync.allies))this.syncProxies(sync.allies);
  if(sync.facing)stand.facing=sync.facing;
  if(Number.isFinite(sync.stun))stand.stunned=Math.max(0,sync.stun);
  for(const key of ['atk','def','eva','will'])if(Number.isFinite(sync.stats?.[key]))stand[key]=sync.stats[key];
  if(Number.isFinite(sync.clock))this.theirClock=sync.clock;
  VisibilityService.compute();updateAll();
 },
 // The summons of the other player are on its page only. Here each is a picture of it: a hostile monster of the same kind that takes no turn, stands where the
 // summon stands and has its health (both come in `sync`); what hurts it here is sent back as a `hit` with the summon's id, and the summon takes it.
 ownAllies(){return state.monsters.filter(m=>summonActive(m)&&m.hp>0).map(m=>({id:combatantId(m),name:m.name,x:m.x,y:m.y,hp:m.hp,maxHp:m.maxHp}))},
 syncProxies(list){
  const shown=state.monsters.filter(m=>m.duelProxy);
  for(const m of shown)if(!list.some(a=>a.id===m.duelProxy))OccupancyService.removeMonster(m);
  for(const a of list){
   let m=shown.find(p=>p.duelProxy===a.id);
   if(!m&&Number.isFinite(a.x)&&Number.isFinite(a.y)){
    m=placeNamedMonster(a.name,{x:a.x,y:a.y},{provenance:'duel'});
    if(m)Object.assign(m,{duelProxy:a.id,faction57:'hostile',alerted:true,rewardPolicy57:{xp:false,kills:false,drops:false}});
   }
   if(!m)continue;
   if(Number.isFinite(a.x)&&Number.isFinite(a.y)&&(m.x!==a.x||m.y!==a.y)){m.x=a.x;m.y=a.y;OccupancyService.move(m,a.x,a.y)}
   if(Number.isFinite(a.maxHp))m.maxHp=a.maxHp;
   if(Number.isFinite(a.hp))m.hp=Math.max(1,a.hp);
  }
 },
 // Damage the other player dealt to its stand-in on its page: here it is taken by the real player.
 applyHit(hit){
  const stand=this.opponent();
  // Only what the other side does in its own turn counts: a hit that arrives while it is this side's turn was not dealt by the rules.
  if(!stand||state.dead||this.reported||!(hit.amount>0)||this.turn!==this.other())return;
  const target=hit.proxy?state.monsters.find(m=>m.combatantId54===hit.proxy&&summonActive(m)):state.player;
  if(!target)return;
  this.applying=true;
  const dmg=Math.round(hit.amount);
  // the blow looks like any monster's: the stand-in lunges (swinging what it holds, or loosing it), then the target flashes and the number rises over it
  stand.attackUntil=performance.now()+150;stand.attackTarget={x:target.x,y:target.y};
  if(stand.duelLook?.weapon?.ranged||stand.duelLook?.weapon?.kind==='bow')projectileFX(stand.x,stand.y,target.x,target.y,'#d9c8a4');
  try{damageEntity(target,dmg,stand,hit.element||null)}finally{this.applying=false}
  presentMonsterHit(stand,target,dmg,!!hit.element);
  updateAll();
 },
 // Sent from damageEntity when the stand-in is hurt by this player.
 // A blow of the player's ally (a summon) lands in the turn engine, which runs on both sides by itself; it is the one thing of the engine that is sent, because the ally exists on this page only.
 // `proxy` is set when the one hurt is not the other player but a picture of one of its summons (see syncProxies): the blow is then taken by that summon.
 sendHit(amount,element,source=null,proxy=null){
  const ally=!!source&&source!==state.player&&state.monsters.includes(source)&&entityFaction(source)==='player';
  if(!this.applying&&!this.environment&&(!state._turnPipelineActive57||ally))this.send({kind:'hit',amount,element:element||null,proxy});
 },
 // What this player puts on the map in its own action (a field, a stretch of terrain) is put on the other player's map by the same game functions, with the
 // stand-in as the source; what the map then does to whoever stands there (and what a burning or poisoned stand-in takes at the end of a turn) is the map's own work on each side: damage dealt inside the turn engine or by a field's contact is not sent as a hit. Reactions inside the
 // turn engine run on both sides by themselves and are not sent.
 mirrored(){return this.stage==='matched'&&state?.duel&&!this.applying&&!this.environment&&!state._turnPipelineActive57},
 // True while the other player is the one acting: what it sends is replayed here only then, and only through `replay`, which keeps the replay itself from being sent back.
 theirTurn(){return !!this.opponent()&&!state.dead&&!this.reported&&this.turn===this.other()},
 replay(work){
  if(!this.theirTurn())return;
  this.applying=true;
  try{work()}finally{this.applying=false}
  updateAll();
 },
 sendField(kind,x,y,ttl,cells,metadata){
  if(!this.mirrored())return;
  const {owner,credit,sourceFaction,friendlyFire,...rest}=metadata||{};
  this.send({kind:'field',field:kind,x,y,ttl,cells:cells||null,metadata:rest});
 },
 sendTerrain(x,y,tile,ttl,kind,opts){
  if(!this.mirrored())return;
  this.send({kind:'terrain',x,y,tile,ttl,terrain:kind,opts:{allowedOld:opts?.allowedOld,source:opts?.source,overlapSolid:opts?.overlapSolid}});
 },
 applyField(field){
  const stand=this.opponent();
  if(!stand||!field.field)return;
  this.replay(()=>addField(field.field,field.x,field.y,field.ttl,field.cells,{...(field.metadata||{}),...effectSource57(stand)}));
 },
 applyTerrain(terrain){
  this.replay(()=>RuntimeTerrainOwner.temporary(terrain.x,terrain.y,terrain.tile,terrain.ttl,terrain.terrain,terrain.opts||{}));
 },
 // A tile the player's action changed for good (a broken piece of furniture, a burnt door…), a jar that broke, an item dropped or picked up: each is done here by the
 // same function that did it there.
 sendTile(x,y,tile,opts){
  if(this.mirrored())this.send({kind:'tile',x,y,tile,opts:{source:opts?.source,overlapSolid:opts?.overlapSolid}});
 },
 applyTile(tile){this.replay(()=>RuntimeTerrainOwner.mutate(tile.x,tile.y,tile.tile,tile.opts||{}))},
 sendJar(x,y,opts){
  if(this.mirrored())this.send({kind:'jar',x,y,opts:{forced:!!opts?.forced,from:opts?.from||null}});
 },
 applyJar(jar){this.replay(()=>state.map[jar.y]?.[jar.x]===TT.JAR?destroyJar57(jar.x,jar.y,jar.opts||{}):shatterJar(jar.x,jar.y,jar.opts||{}))},
 sendItem(act,item,x,y){
  if(this.mirrored())this.send({kind:'item',act,item:act==='drop'?item:{name:item.name},x,y});
 },
 applyItem(m){
  this.replay(()=>{
   if(m.act==='drop'&&m.item&&Number.isFinite(m.x)&&Number.isFinite(m.y))PlacementService.placeItem(clone(m.item),{x:m.x,y:m.y});
   else if(m.act==='take'){const at=state.items.find(i=>i.x===m.x&&i.y===m.y&&i.name===m.item?.name);if(at)OccupancyService.removeItem(at)}
  });
 },
 // A status the other player put on its stand-in (poison, stun…): the real player takes it here, with its own resistance.
 sendStatus(effect,turns,chance){if(!this.applying)this.send({kind:'status',effect,turns,chance})},
 // A push or pull on the other player's stand-in (a knock-back, a pulled-in blow): sent as where it came from, so the real player is moved by the same function here.
 sendForce(source,steps,opts){if(!this.applying)this.send({kind:'force',x:source.x,y:source.y,steps,mode:opts.mode||'push',orthogonal:!!opts.orthogonal})},
 applyForce(force){
  if(!state?.duel||state.dead||this.reported||!(force.steps>0)||!Number.isFinite(force.x)||!Number.isFinite(force.y)||this.turn!==this.other())return;
  this.applying=true;
  try{resolveForcedMovement57(state.player,{x:force.x,y:force.y},Math.min(6,Math.floor(force.steps)),{mode:force.mode==='pull'?'pull':'push',hostile:true,orthogonal:!!force.orthogonal})}finally{this.applying=false}
  updateAll();
 },
 applyStatus(status){
  if(!state?.duel||state.dead||this.reported||!status.effect||!(status.turns>0)||this.turn!==this.other())return;
  this.applying=true;
  try{applyHostileStatus(status.effect,status.turns,status.chance??1,{})}finally{this.applying=false}
  updateAll();
 },
 // The fight is over for this side. With the ghost at stake, the server is told how it ended (and asked again until the other side has said its part too).
 // The score moves on both sides by the same numbers. The loser's ghost is gone only when its new current score is at or under its death score: only then
 // does the server hear of it (settle); any other result frees the lock again and nothing is lost or won on the server.
 // `outcome` is 'win', 'lose' or 'draw' (both went down in the same moment, or the two sides' words contradict: nobody wins, nothing is lost, the score stays).
 // The server is told nothing for five seconds, so that a contradicting word from the other side can still turn this into a draw first.
 conclude(outcome){
  this.reported=true;this.outcome=outcome;
  const win=outcome==='win',draw=outcome==='draw',me=this.mineScore||duelScoreStart(this.mineFloor),foe=this.theirScore||duelScoreStart(1);
  this.dies=draw?false:win?duelDiesOnLoss(foe,me):duelDiesOnLoss(me,foe);
  this.before=me;this.after=draw?me:duelScoreAfter(me,foe,win);
  if(!draw&&this.mineGhostId)this.saveScore(this.mineGhostId,win||!this.dies?this.after:null);
  if(!draw&&this.mineGhostId&&PlayStats.endpoint())PlayStats.ghostScore(this.mineGhostId,this.after.s,this.after.peak).catch(error=>ignoreError('duel score not sent',error));
  if(win&&this.dies){this.dropLoot();lsSet(this.LEVELS_KEY,String((Number(lsGet(this.LEVELS_KEY))||0)+1))} // a ghost put out is a level for the next run
  if(!(this.stakes&&this.mineGhostId))return;
  const hold=performance.now()+5000;
  // a draw is told to the server as a win by this side: the other side says the same, and the same word from both voids the duel (both ghosts stand again)
  if(this.dies||draw)this.setJob({won:win||draw,match:this.matchId,ghost:this.mineGhostId,next:hold,until:Date.now()+13*60*1000,busy:false});
  else this.setJob({release:true,match:this.matchId,ghost:this.mineGhostId,next:hold,until:Date.now()+13*60*1000,busy:false}); // nobody is lost: the lock is freed after the hold
 },
 // The other side's word contradicts this side's (both say they won, or both say they lost), or both went down together: nobody won. What this side had concluded is taken back.
 turnDraw(){
  if(!state?.duel||this.outcome==='draw')return;
  if(this.reported){
   if(this.mineGhostId&&this.before){this.saveScore(this.mineGhostId,this.before);if(PlayStats.endpoint())PlayStats.ghostScore(this.mineGhostId,this.before.s,this.before.peak).catch(error=>ignoreError('duel score not sent',error))}
   this.discardLoot();
   this.outcome='draw';this.dies=false;this.after=this.before;
   if(this.stakes&&this.mineGhostId)this.setJob({won:true,match:this.matchId,ghost:this.mineGhostId,next:performance.now()+1500,until:Date.now()+13*60*1000,busy:false});
  }else this.conclude('draw');
  state.duel.finished=true;
  this.send({kind:'result',winner:'draw'});
  this.endCard();
 },
 // ---- the beaten ghost's drop: what it carried falls where it fell, the way a boss's reward does, and can be picked up before the way out ----------------------
 dropLoot(){
  const body=this.theirs;if(!body||typeof body!=='object')return;
  const slots=['weapon','armor','cloak','relic','trinket'].map(slot=>body[slot]).filter(item=>item&&typeof item==='object');
  const items=[...(Array.isArray(body.inventory)?body.inventory:[]),...slots].filter(item=>item&&typeof item==='object'&&item.name&&item.talismanKind!=='upgrade');
  if(!items.length)return;
  const at=this.lastStand||{x:state.player.x,y:state.player.y},put=placeDropItems(items,at,'duelDrop');
  if(put.ok)addLog(`망령이 가진 것 ${put.worldCount}개가 떨어졌다. 문으로 나가기 전에 주워라.${put.stackedFallbacks?` 자리가 모자라 ${put.stackedFallbacks}개는 겹쳐 놓였다.`:''}`);
  else addLog('망령이 가진 것을 놓을 자리가 없었다.');
 },
 discardLoot(){if(!state)return;state.items=(state.items||[]).filter(item=>!item.duelDrop);const bag=state.player?.inventory;if(Array.isArray(bag))state.player.inventory=bag.filter(item=>!item.duelDrop)},
 // What was picked up from the drop goes on to the next new run (this page's run is not kept). A winner who went down after the win (the arena's own harm) keeps all of
 // it: the drop on the floor counts as picked up. Written once; an empty list says that this device took part and took nothing.
 carryDrops(){
  if(!state?.duel||this.outcome!=='win'||!this.dies||this.carried)return;
  this.carried=true;
  const clean=item=>{const copy=clone(item);for(const key of ['x','y','duelDrop'])delete copy[key];return copy};
  const list=[...(state.player.inventory||[]).filter(item=>item.duelDrop),...(state.dead?(state.items||[]).filter(item=>item.duelDrop):[])].map(clean);
  let prior=[];try{const raw=JSON.parse(lsGet(this.CARRY_KEY)||'[]');if(Array.isArray(raw))prior=raw}catch(error){ignoreError('duel carry unreadable',error)}
  lsSet(this.CARRY_KEY,JSON.stringify([...prior,...list].slice(-60)));
 },
 // The card that ends a duel (instead of the death card of a normal run): the two ghosts face to face with their scores, and the new score of this one comes down from
 // above and knocks the old one away; what happened to each ghost is said under it.
 endCard(){
  const win=this.outcome==='win',draw=this.outcome==='draw',gone=!win&&!draw&&this.dies,a=this.before,b=this.after,foe=this.theirScore;
  const title=win?'망령전 승리':draw?'무승부':gone?'망령이 사라졌다':'패배';
  const note=draw?'둘이 같은 순간에 쓰러졌다. 점수도 망령도 그대로다. 아무것도 빼앗기지 않았다.':win?(this.dies?'상대 망령은 사라졌다. 쓰러진 자리에 떨어진 것 중 주운 것은 다음 새 판의 시작 상자에 들어 있고, 다음 새 판에서 레벨이 1 오른다(무술 포인트를 쓸 수 있다).':'상대 망령은 살아남았다. 아무것도 빼앗지 않았다.'):gone?'현점수가 데스점수 아래로 떨어졌다. 이 망령과 가진 것은 모두 사라진다.':'현점수만 내려갔다. 이 망령은 그대로 남아 있다.';
  let mine={},theirs={};try{mine=JSON.parse(this.mineBody||'{}')}catch(error){ignoreError('duel ghost body unreadable',error)}
  theirs=this.theirs||{};
  const el=Spectate.el.bind(Spectate),card=document.getElementById('card'),root=el('div','death94 duelEnd '+(win?'victory94 win':draw?'draw':gone?'gone':'lose'));
  root.id='duelEnd';root.append(el('span','uiCorners63'),el('div','deathSeal94',win?'勝':draw?'和':'敗'),el('div','brand','만루 · 망령전'),el('h1',null,title));
  // one side of the face-off: the portrait, the class, depth and level, and the score (the loser's is struck through when it is gone)
  const side=(who,ghost,floor,score,after,over)=>{
    const part=el('div','deSide '+who+(over?' burn':'')),info=el('span','deInfo');
    info.append(el('b',null,this.className(ghost.classId)),el('small',null,`${floor}층에서 쓰러짐${ghost.level?' · Lv '+ghost.level:''}`));
    const sc=el('span','deScore'),node=this.scoreNode(after||score);if(over)node.classList.add('over');sc.append(node);
    part.append(el('small','deWho',who==='me'?'내 망령':'상대 망령'),this.portrait(ghost.classId,'big'),info,sc);return part;
  };
  const foeAfter=a&&b&&foe?(draw?foe:duelScoreAfter(foe,a,!win)):foe,foeGone=win&&this.dies;
  const versus=el('div','deVs'),slam=el('div','deSlam '+(b&&a&&b.s>=a.s?'up':'down'));
  if(a&&b){
    const old=el('b','deOld',String(a.s)),fresh=el('b','deNew',String(b.s)),delta=b.s-a.s;
    slam.append(old,fresh,el('i','deRing'),el('em','deDelta',(delta>0?'+':delta<0?'-':'±')+Math.abs(delta)),el('small','deSlamLabel','현점수'));
  }
  versus.append(side('me',mine,this.mineFloor,a,b,gone),slam,side('foe',theirs,this.theirFloor,foe,foeAfter,foeGone));
  const back=el('button','deathRetry94','돌아가기');back.id='duelEndBack';back.type='button';back.onclick=()=>location.reload();
  root.append(versus,el('p',null,note),back);
  // A win ends no run (a death does, and moves the screen to 'ending' itself): without this the overlay stays hidden behind the game screen.
  showEndingScreen();
  card.replaceChildren(root);document.getElementById('overlay').style.display='flex';
 },
 // The server job that tells how this side's fight ended (settle, or free the lock) is kept on the device until it is done: leaving the page (the way back from the end
 // card reloads it) must not strand it, or the ghost stays locked for half an hour.
 setJob(job){
  this.settling=job;
  lsSet(this.PENDING_KEY,job?JSON.stringify({won:!!job.won,release:!!job.release,match:job.match,ghost:job.ghost,until:job.until}):'');
 },
 resumeJob(){
  this.resumed=true;
  try{const job=JSON.parse(lsGet(this.PENDING_KEY)||'null');if(job&&job.ghost&&job.match&&Date.now()<job.until)this.settling={...job,next:0,busy:false}}catch(error){ignoreError('duel pending job unreadable',error)}
 },
 async pollSettle(now){
  if(!this.resumed)this.resumeJob();
  const job=this.settling;
  if(!job||job.busy||now<job.next)return;
  if(Date.now()>job.until){this.setJob(null);return}
  if(job.release){this.setJob(null);PlayStats.ghostRelease(job.ghost,job.match).catch(error=>ignoreError('duel release not sent',error));return}
  job.busy=true;
  try{
   const reply=await PlayStats.ghostSettle(job.ghost,job.match,job.won);
   if(reply?.ok&&reply.state&&reply.state!=='pending'){
    this.setJob(null);
    const text={won:'판돈 정산: 상대 망령의 것을 모두 얻었다. 새 판을 시작하면 시작 상자에 들어 있다.',lost:'판돈 정산: 이 망령은 사라졌다. 가진 것도 모두 잃었다.',void:'판돈 정산: 양쪽의 말이 같아 무효가 되었다. 아무도 잃지 않았다.'}[reply.state];
    if(text){this.settledText=text.replace('판돈 정산: ','');addLog(text)}
  }
  }catch(error){ignoreError('duel settle not sent',error)}
  job.busy=false;job.next=now+4000;
 },
 applyResult(result){
  if(!state?.duel)return;
  if(result.winner==='draw'){this.turnDraw();return}
  // the two words must be opposite (one says it won, the other that it lost); the same word from both means nobody won
  if(this.reported){if(this.outcome!=='draw'&&(this.outcome==='win')!==(result.winner===this.role))this.turnDraw();return}
  if(result.winner===this.role){
   this.conclude('win');
   const stand=this.opponent();
   if(stand){stand.hp=0;killMonster(stand)}
  }else{this.conclude('lose');if(!state.dead)die('상대 망령')}
 },
 // This side won by its own hand (the stand-in fell on this page): tell the other.
 reportWin(){
  if(this.stage!=='matched'||this.reported)return;
  // this side is down too (the arena's harm took it in the same moment): nobody won
  if(state.dead){this.turnDraw();return}
  this.fellTurn=state.turn;
  this.conclude('win');
  this.send({kind:'result',winner:this.role});
 },
 // The other side is gone in the middle of a fight (the relay ended the session): the one that stays wins. A session the relay has ended cannot be taken up
 // again, so nothing waits for a return.
 forfeited(){
  if(!state?.duel||state.duel.won||state.dead||this.reported)return;
  const stand=this.opponent();
  this.conclude('win');
  if(stand){addLog('상대 망령이 자리를 떠났다.');stand.hp=0;killMonster(stand)}
 },
 // ---- turns: one side acts at a time, twenty seconds each ---------------------------------------------------------------------
 // The host acts first. A side's turn ends when it has acted (the game's turn counter moved) or when TURN_MS has passed (the turn is then spent waiting);
 // the next side is told in `sync`. The turn and its end are kept in `state.duel` for the top bar.
 myTurn(){return !state?.duel||this.stage!=='matched'||this.turn===this.role},
 giveTurn(side){
  this.turn=side;this.turnEnds=Date.now()+this.TURN_MS;this.turnSeen=state.turn;
  if(state?.duel){state.duel.turn=side;state.duel.turnEnds=this.turnEnds}
  this.lastSig='';
 },
 // The sides take turns by the time their actions cost (`state.duel.clock`, which the turn engine adds up): the side that has spent less acts, the host when they
 // are even, so that an action that costs three turns lets the other side act three times. Each side works this out from its own clock and the last clock it was
 // told of the other (a clock only grows, so an out-of-date one can make a side wait too long but never act when it is not its turn); nothing is handed over.
 holdsTurn(){
  const mine=state.duel?.clock||0,theirs=this.theirClock;
  return mine<theirs-1e-6||(Math.abs(mine-theirs)<1e-6&&this.role==='host');
 },
 tickTurn(){
  if(!state?.duel||state.duel.finished||state.dead)return;
  const side=this.holdsTurn()?this.role:this.other();
  if(side!==this.turn)this.giveTurn(side);
  else if(state.turn!==this.turnSeen){this.turnSeen=state.turn;this.turnEnds=Date.now()+this.TURN_MS;state.duel.turnEnds=this.turnEnds;this.lastSig=''} // acted and still has the turn
  if(this.turn!==this.role||Date.now()<this.turnEnds)return;
  addLog('시간이 다 되어 이번 차례를 넘겼다.');
  globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:'duel-timeout'});
 },
 // The duel's heads-up display (the strip over the top of the arena): both healths with the look of each side, whose turn it is and how long it has left, the
 // cooldown of potions and talismans and of martial arts (five pips: each turn that passes puts one out), and how it ended. It reads what the game already keeps
 // (`state.duel`, the two healths, the turn); nothing here decides anything.
 hud(){
  let box=document.getElementById('duelHud');
  if(!state?.duel){box?.remove();this.hudSig='';return}
  const d=state.duel,p=state.player,stand=this.opponent(),live=this.stage==='matched',now=Date.now();
  const cool=kind=>Math.max(0,(d.cooldown?.[kind]??0)-state.turn),mine=!live||this.turn===this.role,left=live?Math.max(0,this.turnEnds-now):0;
  const to=this.after?` · ${this.before.s}→${this.after.s}점 (데스 ${this.after.d})`:'';
  const result=this.outcome==='draw'?'무승부 · 점수와 망령은 그대로':d.finished?'승리'+to:d.won?'상대 망령이 쓰러졌다 · 위쪽 문으로 나가면 한 판이 끝난다':(this.outcome==='lose'||state.dead)?(this.dies?'패배 · 이 망령은 사라진다':'패배 · 망령은 남는다')+to:'';
  if(stand)this.hudFoe={cls:stand.duelLook?.classId,max:stand.maxHp};
  const foe=this.hudFoe||{cls:undefined,max:0},sig=[p.hp,p.maxHp,stand?.hp,stand?.maxHp,cool('item'),cool('martial'),mine,live,Math.ceil(left/1000),result,this.settledText||''].join('|');
  if(!box){box=Spectate.el('div');box.id='duelHud';box.setAttribute('role','status');document.body.append(box)}
  if(sig!==this.hudSig){
   this.hudSig=sig;box.replaceChildren();
   const side=(who,tag,cls,hp,max)=>{
    const part=Spectate.el('div','dhSide '+who),icon=PlayStats.classIcon(cls),info=Spectate.el('div','dhInfo'),name=Spectate.el('b'),bar=Spectate.el('span','dhHp'),fill=Spectate.el('i');
    icon.className='dhFace';name.append(Spectate.el('small',null,tag),document.createTextNode(this.className(cls)));
    fill.style.transform=`scaleX(${max>0?Math.max(0,Math.min(1,hp/max)):0})`;bar.append(fill);
    info.append(name,bar,Spectate.el('small','dhNum',`${Math.max(0,Math.ceil(hp))} / ${max}`));part.append(icon,info);return part;
   };
   const mid=Spectate.el('div','dhMid'),turn=Spectate.el('span','dhTurn '+(mine?'on':'off')),timer=Spectate.el('span','dhTimer'),cools=Spectate.el('div','dhCools');
   turn.append(Spectate.el('b',null,result?'한 판 종료':mine?'내 차례':'상대 차례'),Spectate.el('em',null,live&&!result?`${Math.ceil(left/1000)}초`:''));timer.append(Spectate.el('i'));
   for(const [kind,label] of [['item','물약·부적'],['martial','무술']]){
    const turns=cool(kind),chip=Spectate.el('span','dhCool'+(turns?'':' ready')),pips=Spectate.el('span','dhPips');
    for(let i=0;i<5;i++)pips.append(Spectate.el('i',i<turns?'on':''));
    chip.append(Spectate.el('small',null,label),pips,Spectate.el('em',null,turns?`${turns}턴`:'준비'));cools.append(chip);
   }
   mid.append(turn,timer,cools);
   box.append(side('me','나',p.classId,p.hp,p.maxHp),mid,side('foe','상대',foe.cls,stand?.hp??0,stand?.maxHp??foe.max));
   if(result||this.settledText){const line=Spectate.el('p','dhResult '+(d.finished||d.won?'win':'lose'));line.append(Spectate.el('b',null,result));if(this.settledText)line.append(Spectate.el('span',null,this.settledText));box.append(line)}
  }
  // over the arena, not over the side panel: centred on the canvas (a phone's strip is the screen's width)
  const wrap=document.getElementById('canvasWrap'),rect=wrap?.getBoundingClientRect();
  if(rect&&innerWidth>700){box.style.left=rect.left+rect.width/2+'px';box.style.width=Math.min(660,rect.width-24)+'px'}
  else{box.style.left='';box.style.width=''}
  const bar=box.querySelector('.dhTimer i');
  if(bar)bar.style.transform=`scaleX(${live?Math.min(1,Math.max(0,left/this.TURN_MS)):1})`;
 },
 // Every frame, on both sides.
 pump(now){
  this.pollSettle(now);
  this.hud();
  // A duel that is over (the winner through the door, the loser fallen), or whose run has been replaced by another run, ends its match: the next duel can then be asked for.
  if(this.stage==='matched'&&this.fighting&&(!state?.duel||(this.reported&&(state.duel.finished||state.dead)))){this.carryDrops();this.leave('')}
  if(this.stage!=='matched'||!state?.duel)return;
  const p=state.player;
  if(state.dead&&!this.reported){
   // down while the other is down too: nobody won
   const stand=this.opponent();if(stand&&stand.hp<=0){this.turnDraw();return}
   this.conclude('lose');this.send({kind:'result',winner:this.other()});return
  }
  // this side won and went down in the same turn (the same poison, the same fire): nobody won. Later (on the way to the door): the win stands, and so does the drop.
  if(this.reported&&this.outcome==='win'&&state.dead&&state.turn<=this.fellTurn){this.turnDraw();return}
  if(this.reported)return;
  this.tickTurn();
  const second=Math.ceil((this.turnEnds-Date.now())/1000);
  if(second!==this.shown){this.shown=second;updatePanels()}
  if(now-this.lastSend<this.SEND_GAP_MS)return;
  // what the other page works the stand-in's blows and its dodging out from: this player's stats as they are now (a potion of fortitude, a swift one…), not as they were at the start
  const live=getStats(),stats={atk:live.atk,def:live.def,eva:live.eva,will:live.will};
  const allies=this.ownAllies(),stun=state.status?.stun||0,sig=[this.turn,second,p.x,p.y,p.hp,p.maxHp,stun,stats.atk,stats.def,stats.eva,stats.will,state.turn,state.duel.clock||0,allies.map(a=>[a.id,a.x,a.y,a.hp].join(',')).join(';')].join(':');
  if(sig===this.lastSig)return;
  this.lastSig=sig;this.lastSend=now;
  this.send({kind:'sync',x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,stun,stats,facing:p.facing,turn:this.turn,ends:this.turnEnds,clock:state.duel.clock||0,allies});
 },
};
