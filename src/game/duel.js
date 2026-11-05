/* The ghost duel (docs/GHOST_BATTLE.md), first part: finding an opponent and passing payloads over the shared cp32 relay, mode MANRU_DUEL.
   The relay only matches two players and carries what they send; the game itself (arena, rules) is built on top of `send` and `inbox`.
   The socket is the one Spectate owns (one connection per page): Spectate hands every packet that is not about spectating to `receive` here. */
const Duel={
 MODE:'MANRU_DUEL',TURN_MS:20000,SEND_GAP_MS:120,
 stage:'idle',queueEntryId:'',matchId:'',token:'',role:'',remote:'',sent:0,inbox:[],note:'',play:false,shown:0,turn:'host',turnEnds:0,turnSeen:0,theirs:null,mineBody:'',outcome:'',reported:false,applying:false,arena:-1,seq:0,lastSig:'',lastSend:0,keysBound:false,
 // idle -> connecting -> queued -> offered -> matched (the relay committed the session) -> idle again on leave or when the relay drops it
 setStage(stage,note=''){this.stage=stage;this.note=note;PlayStats.logAdd({a:'DUEL',stage,note,role:this.role,match:this.matchId});this.renderPicker()},
 find(play=false,body=''){
  if(this.stage!=='idle')return false;this.play=play;this.mineBody=body;this.theirs=null;
  this.queueEntryId='q-'+Math.random().toString(36).slice(2,12)+Date.now().toString(36);this.inbox=[];this.sent=0;
  this.setStage('connecting','서버에 연결하는 중…');
  if(!Spectate.ws&&!Spectate.open('duel')){this.setStage('idle','연결을 열 수 없다');return false}
  if(Spectate.ready)this.onReady();
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
   case 'match.offer':
    if(packet.mode!==this.MODE||this.stage!=='queued')return;
    this.matchId=packet.matchId;this.role=packet.role;this.remote=packet.remotePlayerId;this.setStage('offered','상대를 찾았다');
    Spectate.send({type:'match.ready',matchId:packet.matchId,queueEntryId:this.queueEntryId});return;
   case 'session.commit':
    if(packet.mode!==this.MODE||packet.matchId!==this.matchId)return;
    this.token=packet.sessionToken;this.role=packet.role;this.remote=packet.remotePlayerId;this.setStage('matched','대전이 시작된다');
    if(this.play&&this.role==='guest')this.send({kind:'hello',body:this.mineBody});return;
   case 'relay.message':
    if(packet.sessionToken!==this.token)return;
    if(this.fightMessage(packet.payload))return;
    this.inbox.push({from:packet.fromRole,payload:packet.payload,seq:packet.relaySequence});return;
   case 'session.ended':case 'session.closed':case 'session.expired':
    if(this.stage==='matched'){this.forfeited();this.leave('상대와의 연결이 끝났다')}return;
   default:return;
  }
 },
 // Hand a payload to the other player.
 send(payload){
  if(this.stage!=='matched')return false;
  return Spectate.send({type:'relay.message',sessionToken:this.token,clientMessageId:'d'+(++this.sent),payload});
 },
 // Take what has arrived since the last call.
 take(){const list=this.inbox;this.inbox=[];return list},
 leave(note=''){
  if(this.stage==='matched')Spectate.send({type:'session.leave',sessionToken:this.token});
  else if(this.stage==='queued'||this.stage==='offered')Spectate.send({type:'match.cancel',matchId:this.matchId});
  this.token='';this.matchId='';this.role='';this.remote='';this.fighting=false;this.setStage('idle',note);
 },

 // ---- the way in: the title button ---------------------------------------------------------------------------------------------
 // A panel with the player's own ghosts (the ones still standing); choosing one fetches its saved character, looks for an opponent and, when both have one,
 // the fight begins on its own. The panel shows what the search is doing and can cancel it.
 openPicker(){
  if(document.getElementById('duelScene'))return false;
  const scene=Spectate.el('div'),panel=Spectate.el('div','spectatePanel'),head=Spectate.el('header'),close=Spectate.el('button',null,'×'),note=Spectate.el('p','spectateHint',''),list=Spectate.el('div','duelGhosts');
  scene.id='duelScene';scene.setAttribute('role','dialog');scene.setAttribute('aria-label','망령전');note.id='duelNote';list.id='duelGhosts';
  close.type='button';close.id='duelClose';close.setAttribute('aria-label','닫기');close.onclick=()=>this.closePicker();
  head.append(Spectate.el('h2',null,'망령전'),close);panel.append(head,note,list);scene.append(panel);document.body.append(scene);
  this.ghosts=null;this.pickNote='';this.loadMine();return true;
 },
 closePicker(){
  if(this.stage==='queued'||this.stage==='offered'||this.stage==='connecting')this.leave('취소했다');
  document.getElementById('duelScene')?.remove();
 },
 async loadMine(){
  const url=PlayStats.endpoint();
  if(!url){this.pickNote='수집 서버가 연결되어 있지 않다.';this.renderPicker();return}
  this.pickNote='내 망령을 불러오는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghosts&owner='+PlayStats.deviceTag());
   this.ghosts=Array.isArray(data?.list)?data.list.filter(g=>g.status!=='taken'):null;
   this.pickNote=this.ghosts?(this.ghosts.length?'출전할 망령을 고른다. 지면 가진 것을 모두 잃고, 이기면 상대의 것을 모두 가져간다.':'출전할 망령이 없다. 깊이 순위권에 든 채 죽으면 망령이 남는다.'):'망령을 불러오지 못했다.';
  }catch(error){ignoreError('duel ghosts load failed',error);this.ghosts=null;this.pickNote='망령을 불러오지 못했다.'}
  this.renderPicker();
 },
 async choose(row){
  if(this.stage!=='idle')return;
  const url=PlayStats.endpoint();
  this.pickNote='망령을 깨우는 중…';this.renderPicker();
  try{
   const data=await PlayStats.fetchView(url,'ghost&owner='+PlayStats.deviceTag()+'&id='+encodeURIComponent(row.id));
   if(!data?.body){this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker();return}
   this.find(true,data.body);
  }catch(error){ignoreError('duel ghost fetch failed',error);this.pickNote='이 망령의 본문을 받지 못했다.';this.renderPicker()}
 },
 renderPicker(){
  const scene=document.getElementById('duelScene');
  if(!scene)return;
  if(this.stage==='matched'){scene.remove();return}
  const note=document.getElementById('duelNote'),list=document.getElementById('duelGhosts'),busy=this.stage!=='idle';
  note.textContent=busy?this.note:this.pickNote;
  list.replaceChildren();
  if(busy){const cancel=Spectate.el('button',null,'그만두기');cancel.type='button';cancel.onclick=()=>this.leave('취소했다');list.append(cancel);return}
  for(const row of this.ghosts||[]){
   const button=Spectate.el('button','duelGhost');button.type='button';button.dataset.ghost=row.id;
   button.append(Spectate.el('b',null,`${row.floor}층 · Lv ${row.level}`),Spectate.el('span',null,row.cause));button.onclick=()=>this.choose(row);list.append(button);
  }
 },
 // ---- the fight: each side plays its own real game ---------------------------------------------------------------------------
 // Both players run the real game on their own page (the arena of duelarenas.js as a run, their own ghost as the player: real inventory, skills, screen). The
 // other player is a stand-in creature (`duelOpponent`, with the stats of the other's ghost) that stands where the other player stands. Four things cross:
 // `sync` (where the sender stands, its health, whose turn it is), `hit` (damage the sender dealt to the stand-in: the receiver takes it as its own player),
 // `result` (who won) and the setup (`hello`, `start`). Self-effects (potions, equipment, buffs) need no message; effects that put something on the map (fields,
 // terrain) do not cross yet. One side acts at a time, twenty seconds each, the host first; nothing is calculated by the relay.
 begin(arena,theirsBody){
  if(this.stage!=='matched'||!DUEL_ARENAS[arena]||this.fighting)return false;
  this.fighting=true;this.arena=arena;this.lastSig='';this.reported=false;this.outcome='';
  this.theirs=theirsBody?JSON.parse(theirsBody):null;
  newGame(CLASSES[0],{arena,role:this.role,ghost:this.mineBody?JSON.parse(this.mineBody):null,opponent:this.theirs});
  this.giveTurn('host');
  return true;
 },
 // Host: choose the arena, begin, and tell the guest (with the host's ghost, so that the guest can stand its stand-in up).
 startFight(arena,guestBody=''){
  if(this.role!=='host'||!this.begin(arena,guestBody))return false;
  this.send({kind:'start',arena,body:this.mineBody});
  return true;
 },
 // What the fight itself passes over the relay; true when the payload was one of its own.
 fightMessage(payload){
  if(!payload||typeof payload!=='object')return false;
  switch(payload.kind){
   case 'hello':if(this.role==='host')this.startFight(Math.floor(Math.random()*DUEL_ARENAS.length),String(payload.body||''));return this.role==='host';
   case 'start':if(this.role==='guest')this.begin(payload.arena,String(payload.body||''));return this.role==='guest';
   case 'sync':this.applySync(payload);return true;
   case 'hit':this.applyHit(payload);return true;
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
  if(Number.isFinite(sync.hp))stand.hp=Math.max(0,sync.hp);
  if(Number.isFinite(sync.maxHp))stand.maxHp=sync.maxHp;
  if(sync.facing)stand.facing=sync.facing;
  if(sync.turn===this.role&&this.turn!==this.role)this.giveTurn(this.role);
  VisibilityService.compute();updateAll();
 },
 // Damage the other player dealt to its stand-in on its page: here it is taken by the real player.
 applyHit(hit){
  const stand=this.opponent();
  if(!stand||state.dead||this.reported||!(hit.amount>0))return;
  this.applying=true;
  try{damageEntity(state.player,Math.round(hit.amount),stand,hit.element||null)}finally{this.applying=false}
  updateAll();
 },
 // Sent from damageEntity when the stand-in is hurt by this player.
 sendHit(amount,element){if(!this.applying)this.send({kind:'hit',amount,element:element||null})},
 applyResult(result){
  if(!state?.duel||this.reported)return;
  this.reported=true;
  if(result.winner===this.role){
   this.outcome='win';
   const stand=this.opponent();
   if(stand){stand.hp=0;killMonster(stand)}
  }else{this.outcome='lose';if(!state.dead)die('상대 망령')}
 },
 // This side won by its own hand (the stand-in fell on this page): tell the other.
 reportWin(){
  if(this.stage!=='matched'||this.reported)return;
  this.reported=true;this.outcome='win';
  this.send({kind:'result',winner:this.role});
 },
 // The other side is gone in the middle of a fight (the relay ended the session): the one that stays wins. A session the relay has ended cannot be taken up
 // again, so nothing waits for a return.
 forfeited(){
  if(!state?.duel||state.duel.won||state.dead||this.reported)return;
  const stand=this.opponent();
  this.reported=true;this.outcome='win';
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
 tickTurn(){
  if(!state?.duel||state.duel.finished||state.dead||this.turn!==this.role)return;
  if(state.turn!==this.turnSeen){this.giveTurn(this.other());return}
  if(Date.now()<this.turnEnds)return;
  addLog('시간이 다 되어 이번 차례를 넘겼다.');
  globalThis.__MANRU_TURN_ENGINE__.advance({handled:true,committed:true,timeCost:1,reason:'duel-timeout'});
  this.giveTurn(this.other());
 },
 // Every frame, on both sides.
 pump(now){
  if(this.stage!=='matched'||!state?.duel)return;
  const p=state.player;
  if(state.dead&&!this.reported){this.reported=true;this.outcome='lose';this.send({kind:'result',winner:this.other()});return}
  if(this.reported)return;
  this.tickTurn();
  const second=Math.ceil((this.turnEnds-Date.now())/1000);
  if(second!==this.shown){this.shown=second;updatePanels()}
  const sig=[this.turn,second,p.x,p.y,p.hp,p.maxHp,state.turn].join(':');
  if(sig===this.lastSig||now-this.lastSend<this.SEND_GAP_MS)return;
  this.lastSig=sig;this.lastSend=now;
  this.send({kind:'sync',x:p.x,y:p.y,hp:p.hp,maxHp:p.maxHp,facing:p.facing,turn:this.turn,ends:this.turnEnds});
 },
};
