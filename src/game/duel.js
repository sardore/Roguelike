/* The ghost duel (docs/GHOST_BATTLE.md), first part: finding an opponent and passing payloads over the shared cp32 relay, mode MANRU_DUEL.
   The relay only matches two players and carries what they send; the game itself (arena, rules) is built on top of `send` and `inbox`.
   The socket is the one Spectate owns (one connection per page): Spectate hands every packet that is not about spectating to `receive` here. */
const Duel={
 MODE:'MANRU_DUEL',TURN_MS:20000,
 stage:'idle',queueEntryId:'',matchId:'',token:'',role:'',remote:'',sent:0,inbox:[],note:'',
 // idle -> connecting -> queued -> offered -> matched (the relay committed the session) -> idle again on leave or when the relay drops it
 setStage(stage,note=''){this.stage=stage;this.note=note;PlayStats.logAdd({a:'DUEL',stage,note,role:this.role,match:this.matchId})},
 find(){
  if(this.stage!=='idle')return false;
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
    this.token=packet.sessionToken;this.role=packet.role;this.remote=packet.remotePlayerId;this.setStage('matched','대전이 시작된다');return;
   case 'relay.message':
    if(packet.sessionToken!==this.token)return;
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
};
