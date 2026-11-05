/* The ghost duel (docs/GHOST_BATTLE.md), first part: finding an opponent and passing payloads over the shared cp32 relay, mode MANRU_DUEL.
   The relay only matches two players and carries what they send; the game itself (arena, rules) is built on top of `send` and `inbox`.
   The socket is the one Spectate owns (one connection per page): Spectate hands every packet that is not about spectating to `receive` here. */
const Duel={
 MODE:'MANRU_DUEL',TURN_MS:20000,SEND_GAP_MS:120,
 stage:'idle',queueEntryId:'',matchId:'',token:'',role:'',remote:'',sent:0,inbox:[],note:'',play:false,outcome:'',reported:false,arena:-1,seq:0,lastSig:'',lastSend:0,keysBound:false,
 // idle -> connecting -> queued -> offered -> matched (the relay committed the session) -> idle again on leave or when the relay drops it
 setStage(stage,note=''){this.stage=stage;this.note=note;PlayStats.logAdd({a:'DUEL',stage,note,role:this.role,match:this.matchId})},
 find(play=false){
  if(this.stage!=='idle')return false;this.play=play;
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
    if(this.play&&this.role==='host')this.startFight(Math.floor(Math.random()*DUEL_ARENAS.length));return;
   case 'relay.message':
    if(packet.sessionToken!==this.token)return;
    if(this.fightMessage(packet.payload))return;
    this.inbox.push({from:packet.fromRole,payload:packet.payload,seq:packet.relaySequence});return;
   case 'session.ended':case 'session.closed':case 'session.expired':
    if(this.stage==='matched')this.leave('상대와의 연결이 끝났다');return;
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
  this.token='';this.matchId='';this.role='';this.remote='';this.setStage('idle',note);
 },

 // ---- the fight on a real map ------------------------------------------------------------------------------------------
 // The host owns the game: its own run is the arena (newGame with {arena,role}), the other player's ghost stands in it as `duelOpponent`
 // (duelarenas.js) and moves only by what arrives here. The guest owns no game: its screen is the host's state seen from the guest's
 // cell (`frameForGuest`), drawn by the spectator view of Spectate, and what it sends is a step (`input`). Frames and steps are payloads
 // of the relay, so nothing of the rules runs on the server.
 startFight(arena){
  if(this.role!=='host'||this.stage!=='matched'||!DUEL_ARENAS[arena])return false;
  this.arena=arena;this.seq=0;this.lastSig='';this.reported=false;this.outcome='';
  newGame(CLASSES[0],{arena,role:'host'});
  this.send({kind:'start',arena});return true;
 },
 // What the fight itself passes over the relay; true when the payload was one of its own.
 fightMessage(payload){
  if(!payload||typeof payload!=='object')return false;
  if(payload.kind==='start'&&this.role==='guest'){this.enterGuest(payload.arena);return true}
  if(payload.kind==='frame'&&this.role==='guest'){Spectate.applyFrame({kind:'snapshot',seq:payload.seq,frame:payload.frame});return true}
  if(payload.kind==='input'&&this.role==='host'){this.applyInput(payload);return true}
  if(payload.kind==='result'&&this.role==='guest'){this.outcome=payload.winner==='guest'?'win':'lose';Spectate.viewerNotice(this.outcome==='win'?'승리했다.':'패배했다.');return true}
  return false;
 },
 enterGuest(arena){
  this.arena=arena;this.seq=0;
  Spectate.watching={matchId:'duel'};Spectate.view=null;Spectate.floorKey='';
  if(!this.keysBound){this.keysBound=true;addEventListener('keydown',event=>this.guestKey(event),true)}
 },
 // The guest's keys: a step (arrow keys, WASD) or nothing. Bound before the spectator view binds its own, which swallows every key.
 guestKey(event){
  if(this.role!=='guest'||this.stage!=='matched'||!state?.spectator)return;
  const dir={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[event.key];
  if(!dir)return;
  event.preventDefault();event.stopImmediatePropagation();
  this.send({kind:'input',dx:dir[0],dy:dir[1]});
 },
 // Host: one step of the other player's ghost. Walking into the host player is an attack, as for any creature.
 applyInput(input){
  const opponent=state?.duel&&state.monsters.find(m=>m.duelOpponent);
  if(!opponent||opponent.hp<=0||state.dead)return;
  const dx=Math.sign(Number(input.dx)||0),dy=Math.sign(Number(input.dy)||0);
  if(!dx&&!dy)return;
  opponent.facing={x:dx,y:dy};
  const x=opponent.x+dx,y=opponent.y+dy,player=state.player;
  if(player.x===x&&player.y===y)attackMonster(opponent,0,{target:player});
  else if(PlacementService.canPlaceEntity(opponent,x,y))moveMonsterStep(opponent,x,y);
  VisibilityService.compute();updateAll();
 },
 // Host, every frame: when the fight changed, send the guest a whole frame (the arenas are small, so there are no deltas to get wrong).
 pump(now){
  if(this.role!=='host'||this.stage!=='matched'||!state?.duel||this.reported)return;
  const opponent=state.monsters.find(m=>m.duelOpponent),p=state.player;
  // The fight is over when one of the two is down: say so once, and stop sending frames.
  if(state.dead||!opponent||opponent.hp<=0){this.reported=true;this.outcome=state.dead?'lose':'win';this.send({kind:'result',winner:state.dead?'guest':'host'});return}
  if(now-this.lastSend<this.SEND_GAP_MS)return;
  const sig=[state.turn,p.x,p.y,p.hp,opponent.x,opponent.y,opponent.hp,state.log[0]].join(':');
  if(sig===this.lastSig)return;
  this.lastSig=sig;this.lastSend=now;
  this.send({kind:'frame',seq:++this.seq,frame:this.frameForGuest()});
 },
 // The host's state as the guest sees it: the guest's ghost is `player`, the host's player is a creature standing where it stands, and what is
 // visible is worked out from the guest's cell. The host's own player, creatures, seen and visible are put back afterwards.
 frameForGuest(){
  const keep={player:state.player,monsters:state.monsters,seen:state.seen,visible:state.visible},host=state.player,opponent=state.monsters.find(m=>m.duelOpponent);
  try{
   state.player={...host,x:opponent.x,y:opponent.y,hp:Math.max(0,opponent.hp),maxHp:opponent.maxHp,facing:opponent.facing||{x:-1,y:0}};
   state.monsters=[...keep.monsters.filter(m=>m!==opponent),{name:'상대 망령',shape:'human',kind:'human',x:host.x,y:host.y,hp:host.hp,maxHp:host.maxHp,atk:host.baseAtk,def:host.baseDef,eva:host.baseEva,color:host.color,facing:host.facing}];
   state.seen=new Set();state.visible=new Set();
   VisibilityService.compute();
   for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)state.seen.add(k(x,y));
   return Spectate.diff(Spectate.project(),null);
  }finally{Object.assign(state,keep)}
 },
};
