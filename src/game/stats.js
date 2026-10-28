/* Play statistics. Out: one anonymous record per death (the numbers on the death screen). In: the ranking board (a title button) and the aggregate view behind a hidden title gesture. */
const PlayStats={
 LOG_KEY:'manruDebugLog',LOG_MAX:1500,LOG_BYTES:160000,logStored:true,FLUSH_EVERY:20,LOG_SHOWN:120,SNAP_EVERY:40,logList:null,logPending:0,lastRun:null,tileNames:null,lifecycleBound:false,QUEUE_KEY:'manruStatsQueue',QUEUE_MAX:20,MINE_KEY:'manruMyRuns',MINE_MAX:30,TAPS:7,TAP_GAP_MS:1000,TOP_CAUSES:12,
 BOARDS:[['depth','깊이'],['level','레벨'],['kills','처치']],TOTAL_FLOORS:25,
 taps:0,lastTapAt:0,sending:false,tab:'stats',board:'depth',mode:'hidden',data:null,ranking:null,failed:null,
 endpoint(){return document.querySelector('meta[name="manru-stats"]')?.content.trim()||''},
 queue(){try{const list=JSON.parse(lsGet(this.QUEUE_KEY)||'[]');return Array.isArray(list)?list:[]}catch(error){ignoreError('play stats queue unreadable',error);return[]}},
 saveQueue(list){lsSet(this.QUEUE_KEY,JSON.stringify(list.slice(-this.QUEUE_MAX)))},
 recordDeath(cause){
  if(!state||state.debugBattle57||state.debugMapGeneration57||!this.endpoint())return false;
  const record={v:1,id:String(state.runId984||''),floor:state.floor,cause:String(cause||'').slice(0,40),level:state.player.level,kills:state.player.kills,turns:state.turn};
  this.rememberRun(record);
  this.saveQueue([...this.queue().filter(q=>q.id!==record.id),record]);
  this.flush();return true;
 },
 // The player's own sent runs stay on the device: they are what the board marks as "mine", and the personal best on it.
 mine(){try{const list=JSON.parse(lsGet(this.MINE_KEY)||'[]');return Array.isArray(list)?list:[]}catch(error){ignoreError('own runs unreadable',error);return[]}},
 rememberRun(record){lsSet(this.MINE_KEY,JSON.stringify([...this.mine().filter(r=>r.id!==record.id),record].slice(-this.MINE_MAX)))},
 // The board shows a run by the first six characters of its random id.
 tag(id){return String(id||'').replace(/[^0-9a-z]/gi,'').slice(0,6).toUpperCase()},
 // The server drops a repeated id, so a record whose reply never arrived is simply sent again.
 async flush(){
  const url=this.endpoint();if(!url||this.sending)return 0;
  this.sending=true;let sent=0;
  try{
   for(const record of this.queue()){
    const reply=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(record)});
    if(!reply.ok)break;
    this.saveQueue(this.queue().filter(q=>q.id!==record.id));sent++;
   }
  }catch(error){ignoreError('play stats send failed',error)}
  finally{this.sending=false}
  return sent;
 },
 // Temporary: a ring of the last LOG_MAX events, kept in localStorage across reloads, for "the button does nothing" and
 // "I died for no reason" reports. Every dispatched action is one line; the lines that matter for reconstructing a situation
 // (refusals, zero-time commits, big hits, deaths, every SNAP_EVERY turns, floor changes) also carry the 9x9 surroundings,
 // the monsters nearby and the pack. Written to localStorage in batches (and when the page is hidden), never per move.
 logAdd(entry,flushNow=false){
  try{
   if(!this.logList)this.loadLog();
   this.logList.push({t:new Date().toISOString().slice(5,23),...entry});
   if(this.logList.length>this.LOG_MAX)this.logList.splice(0,this.logList.length-this.LOG_MAX);
   if(flushNow||++this.logPending>=this.FLUSH_EVERY)this.logSave();
  }catch(error){ignoreError('debug log write failed',error)}
 },
 // The lines of an earlier session; unreadable storage starts a fresh list instead of losing every later line.
 loadLog(){
  try{const list=JSON.parse(lsGet(this.LOG_KEY)||'[]');this.logList=Array.isArray(list)?list:[]}
  catch(error){ignoreError('debug log unreadable',error);this.logList=[]}
 },
 // The origin's localStorage is shared with the owner's other pages and can be nearly full: keep the log under a byte budget and shed the
 // oldest lines until the write fits; if it never fits the lines stay in memory (logStored=false) and the view still shows them.
 logSave(){
  if(!this.logList)return;
  try{
   let text=JSON.stringify(this.logList);
   while(text.length>this.LOG_BYTES&&this.logList.length>20){this.logList.splice(0,Math.ceil(this.logList.length*.15));text=JSON.stringify(this.logList)}
   let stored=lsSet(this.LOG_KEY,text);
   for(let tries=0;!stored&&tries<5&&this.logList.length>10;tries++){this.logList.splice(0,Math.ceil(this.logList.length/2));stored=lsSet(this.LOG_KEY,JSON.stringify(this.logList))}
   this.logStored=stored;this.logPending=0;
  }catch(error){ignoreError('debug log save failed',error);this.logStored=false}
 },
 // Called once from the title binding: the in-memory tail reaches storage when the tab is hidden or closed.
 bindLifecycle(){
  if(this.lifecycleBound)return;this.lifecycleBound=true;
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')this.logSave()});
  addEventListener('pagehide',()=>this.logSave());
 },
 tileName(t){
  if(!this.tileNames)this.tileNames=Object.fromEntries(Object.entries(TT).map(([name,value])=>[value,name]));
  return this.tileNames[t]??(t==null?'OUT':String(t));
 },
 // 9x9 around the player: # wall, . floor, + door, ~ water, L lava, > stairs, o other terrain, space unseen/void, @ you, M hostile, a other creature.
 view(radius=4){
  const p=state.player,rows=[],mons=new Map((state.monsters||[]).filter(m=>m.hp>0).map(m=>[m.x+','+m.y,m]));
  for(let y=p.y-radius;y<=p.y+radius;y++){
   let row='';
   for(let x=p.x-radius;x<=p.x+radius;x++){
    const t=state.map[y]?.[x],key=x+','+y;
    if(x===p.x&&y===p.y){row+='@';continue}
    if(t==null||!state.seen.has(key)){row+=' ';continue}
    const mon=mons.get(key);if(mon&&state.visible.has(key)){row+=isHostileTarget57(mon)?'M':'a';continue}
    const name=this.tileName(t);
    row+=name==='WALL'||name==='HIDDEN_WALL'?'#':/^(FLOOR|WOOD_FLOOR|DARK_WOOD|GILDED_FLOOR|MOON_STONE|STONE_PATH|CARPET|GRASS|LIGHT_GRASS|PETAL_MAT)$/.test(name)?'.':/DOOR|GATE/.test(name)?'+':/WATER|ICE/.test(name)?'~':name==='LAVA'?'L':name==='VOID'?' ':name==='STAIR'?'>':'o';
   }
   rows.push(row);
  }
  return rows.join('/');
 },
 nearby(radius=6){
  const p=state.player;
  return(state.monsters||[]).filter(m=>m.hp>0&&Math.max(Math.abs(m.x-p.x),Math.abs(m.y-p.y))<=radius).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,6)
   .map(m=>[m.name,m.x-p.x,m.y-p.y,m.hp,m.maxHp,isHostileTarget57(m)?1:0,m.alerted?1:0]);
 },
 vitals(){
  const p=state.player,status=Object.fromEntries(Object.entries(state.status||{}).filter(([,v])=>v>0));
  return{hp:p.hp,max:p.maxHp,hun:p.hunger,lv:p.level,st:Object.keys(status).length?status:undefined,wpn:p.weapon?.name,arm:p.armor?.name};
 },
 // Why a step or tap did nothing: what stands on the target, and whether a diagonal was cut by a corner.
 blocker(type,args,before){
  if(!state||!before||!args)return undefined;
  let x,y;
  if(type==='MOVE'){x=before.x+(+args[0]||0);y=before.y+(+args[1]||0)}
  else if(type==='STRUCTURE_INTERACT'||type==='ATTACK'&&args.length>1){x=+args[0];y=+args[1]}
  else return undefined;
  if(!Number.isFinite(x)||!Number.isFinite(y))return undefined;
  const mon=(state.monsters||[]).find(m=>m.hp>0&&m.x===x&&m.y===y),out={at:[x,y],tile:this.tileName(state.map[y]?.[x]),mon:mon?mon.name:undefined,seen:state.seen.has(x+','+y)?1:0};
  if(type==='MOVE'&&args[0]&&args[1]){
   const solid=(xx,yy)=>[TT.WALL,TT.HIDDEN_WALL,TT.WINDOW].includes(state.map[yy]?.[xx]);
   out.corner=solid(before.x+args[0],before.y)||solid(before.x,before.y+args[1])?1:0;
  }
  return out;
 },
 snapshot(){return{view:this.view(),near:this.nearby(),inv:state.player.inventory.map(i=>i?.name),...this.vitals()}},
 // The header of a run: enough to tell which run the following lines belong to.
 logRun(){
  this.lastRun=state.runId984;
  this.logAdd({a:'RUN',run:state.runId984,floor:state.floor,cls:state.player.classId,turn:state.turn,build:document.querySelector('meta[name="manru-build"]')?.content||'dev',ua:navigator.userAgent.slice(0,90),vw:innerWidth+'x'+innerHeight,...this.snapshot()},true);
 },
 logAction(type,command,result,denial,before){
  if(!state||!state.player)return;
  if(state.runId984!==this.lastRun)this.logRun();
  const p=state.player,hpDrop=before.hp-p.hp,failed=!['committed','pending','cancelled'].includes(result.status),zero=result.status==='committed'&&!result.advancesWorld&&(type==='MOVE'?before.x===p.x&&before.y===p.y:type!=='ATTACK'),
   big=hpDrop>=Math.max(5,p.maxHp*.2),turnSnap=Math.floor(state.turn/this.SNAP_EVERY)!==Math.floor(before.turn/this.SNAP_EVERY),floorChanged=state.floor!==before.floor,
   incident=failed||zero&&!['ITEM_USE','ITEM_DROP','QUICK_SLOT','TOGGLE_SKILL_QUICK'].includes(type)||big||turnSnap||floorChanged||state.dead;
  const entry={a:type,args:command?.args??(type==='MOVE'?[command?.dx,command?.dy]:command?.index),src:command?.source,item:before.item,st:result.status,why:denial||(result.reason!==type?result.reason:undefined),
   fl:state.floor,tn:state.turn,dtn:state.turn-before.turn,dt:result.timeCost?+result.timeCost.toFixed(2):0,from:[before.x,before.y],at:[p.x,p.y],hp:p.hp,dhp:p.hp-before.hp||undefined};
  if(failed||zero)entry.blk=this.blocker(type,entry.args,before);
  if(typeof result.value==='object'&&result.value)entry.value='obj';else if(result.value!==undefined)entry.value=result.value;
  if(incident){
   const owner=gameplayInputOwner57();
   Object.assign(entry,this.snapshot(),{owner:owner.kind,panels:owner.panels.map(q=>q.id),before:before.panels,gen:RuntimeState.ui.generationPending||undefined,orient:OrientationGate.active()||undefined,
    presenting:ACTION_PRESENTATION58.run===state&&performance.now()<ACTION_PRESENTATION58.inputUntil||undefined,run:runState57(),stun:state.status?.stun||undefined});
  }
  this.logAdd(entry,incident);
 },
 // One line per hit the player takes: who, how much, with what.
 logHit(source,amount,element,hpBefore,context){
  if(!state||!state.player)return;
  if(state.runId984!==this.lastRun)this.logRun();
  const p=state.player,mon=source&&typeof source==='object'&&source!==p?source:null;
  this.logAdd({a:'HIT',by:mon?.name||context?.cause||context?.kind||(typeof source==='string'?source:'env'),dmg:amount,el:element||undefined,fl:state.floor,tn:state.turn,at:[p.x,p.y],hp:p.hp,from:hpBefore,
   src:mon?[mon.x-p.x,mon.y-p.y,mon.hp,mon.maxHp]:undefined,...(amount>=Math.max(5,p.maxHp*.2)||p.hp<=0?{view:this.view(),near:this.nearby()}:{})},p.hp<=0);
 },
 // Which keys of this origin use the space: the origin is shared with every other page of the same host.
 storageUsage(){
  try{
   const rows=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);rows.push([key,key.length+(localStorage.getItem(key)||'').length])}
   rows.sort((a,b)=>b[1]-a[1]);return{total:rows.reduce((n,r)=>n+r[1],0),top:rows.slice(0,4).map(r=>r[0].slice(0,24)+' '+Math.round(r[1]/1024)+'KB').join(' · ')};
  }catch(error){ignoreError('storage usage unreadable',error);return{total:0,top:''}}
 },
 logText(){try{if(!this.logList)this.loadLog();this.logSave();return this.logList.map(e=>JSON.stringify(e)).join('\n')}catch(error){ignoreError('debug log unreadable',error);return''}},
 logView(){
  const box=this.el('div','statsLog'),text=this.logText(),lines=text.split('\n'),pre=this.el('pre',null,text?(lines.length>this.LOG_SHOWN?`… 앞의 ${lines.length-this.LOG_SHOWN}줄은 복사로만 받는다.\n`:'')+lines.slice(-this.LOG_SHOWN).join('\n'):'기록된 로그가 없다.'),row=this.el('div','statsLogRow'),copy=this.el('button',null,'복사'),clear=this.el('button',null,'지우기');
  copy.type='button';clear.type='button';
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);copy.textContent='복사됨'}catch(error){ignoreError('debug log copy failed',error);const range=document.createRange();range.selectNodeContents(pre);getSelection().removeAllRanges();getSelection().addRange(range);copy.textContent='선택됨: 길게 눌러 복사'}};
  clear.onclick=()=>{this.logList=[];this.logPending=0;lsRemove(this.LOG_KEY);this.render()};
  row.append(copy,clear);box.append(row,this.el('p','statsNote',`${lines.length&&text?lines.length:0}줄 · ${text.length}자 · 저장소 ${this.logStored?'정상':'가득 참(이 화면을 닫으면 사라진다. 복사해 두자)'}`),this.el('p','statsNote',(u=>`이 사이트 저장소 ${Math.round(u.total/1024)}KB 사용 · ${u.top}`)(this.storageUsage())),pre);return box;
 },
 // Seven quick taps anywhere on the title block (crown, small brand line, the big logo, rule) open the view.
 tapTitle(event){
  this.taps=event.timeStamp-this.lastTapAt<=this.TAP_GAP_MS?this.taps+1:1;this.lastTapAt=event.timeStamp;
  if(this.taps>=this.TAPS){this.taps=0;this.open()}
 },
 // mode 'rank' (the title button): the ranking board only. mode 'hidden' (seven taps): every view.
 open(mode='hidden'){
  if(document.getElementById('statsScene'))return false;
  const scene=this.el('div'),panel=this.el('div','statsPanel'),head=this.el('header'),tabs=this.el('nav'),close=this.el('button',null,'×'),board=mode==='rank';
  scene.id='statsScene';scene.dataset.mode=mode;scene.setAttribute('role','dialog');scene.setAttribute('aria-label',board?'기록판':'탐사 기록 통계');
  close.type='button';close.id='statsClose';close.setAttribute('aria-label','닫기');close.onclick=()=>this.close();
  this.mode=mode;this.tab=board?'rank':'stats';
  if(!board)for(const [tab,name] of [['rank','랭킹'],['stats','통계'],['rows','기록'],['log','로그']]){const button=this.el('button',null,name);button.type='button';button.dataset.statsTab=tab;button.onclick=()=>{this.tab=tab;this.render()};tabs.append(button)}
  head.append(this.el('h2',null,board?'기록판':'탐사 기록 통계'),tabs,close);
  const body=this.el('div');body.id='statsBody';panel.append(head,body);scene.append(panel);document.body.append(scene);
  this.data=null;this.ranking=null;this.failed={};this.render('loading');this.load();return true;
 },
 close(){document.getElementById('statsScene')?.remove()},
 async fetchView(url,view){
  const reply=await fetch(url+(url.includes('?')?'&':'?')+'view='+view);
  if(!reply.ok)throw new Error('HTTP '+reply.status);
  return reply.json();
 },
 // The views load independently: a server that does not know the ranking yet still serves the summary.
 async load(){
  const url=this.endpoint();if(!url){this.render('unset');return}
  const views=this.mode==='rank'?['ranking']:['summary','ranking'];
  const results=await Promise.all(views.map(async view=>{try{return await this.fetchView(url,view)}catch(error){ignoreError('play stats load failed',error);return null}}));
  views.forEach((view,i)=>{const data=results[i];if(view==='summary')this.data=data;else this.ranking=data?.boards?data:null;this.failed[view]=!data});
  this.render();
 },
 el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node},
 render(status){
  const body=document.getElementById('statsBody');body.replaceChildren();
  for(const button of document.querySelectorAll('[data-stats-tab]'))button.classList.toggle('on',button.dataset.statsTab===this.tab);
  if(this.tab==='log'){body.append(this.logView());return}
  if(this.tab==='rank'){body.append(this.rankView(status));return}
  const notice={loading:'기록을 불러오는 중…',unset:'수집 서버가 연결되어 있지 않다.',error:'기록을 불러오지 못했다.'}[status]||(this.failed?.summary?'기록을 불러오지 못했다.':'');
  if(notice||!this.data){body.append(this.el('p','statsNote',notice||'기록이 없다.'));return}
  body.append(this.tab==='rows'?this.rowsView(this.data):this.summaryView(this.data));
 },
 // The ranking board: the player's own best, the three boards, a podium for the first three and a list for the rest.
 rankView(status){
  const view=this.el('div','rankView'),notice={loading:'기록판을 불러오는 중…',unset:'수집 서버가 연결되어 있지 않다.'}[status]||(this.failed?.ranking?'서버가 아직 기록판을 내주지 않는다.':'');
  const list=this.ranking?.boards?.[this.board]||[];
  view.append(this.mineCard(list));
  const tabs=this.el('nav','rankBoards');
  for(const [id,name] of this.BOARDS){const button=this.el('button',null,name);button.type='button';button.dataset.rankBoard=id;button.classList.toggle('on',id===this.board);button.onclick=()=>{this.board=id;this.render()};tabs.append(button)}
  view.append(tabs);
  if(notice||!list.length){view.append(this.el('p','statsNote',notice||'아직 남은 기록이 없다.'));return view}
  view.append(this.podium(list.slice(0,3)),this.rankRows(list));
  return view;
 },
 // What a row is ranked by on the open board, and how full its bar is.
 metric(row,list){
  if(this.board==='level')return{value:'Lv '+row.level,fill:row.level/Math.max(1,...list.map(r=>+r.level||0))};
  if(this.board==='kills')return{value:String(row.kills),fill:row.kills/Math.max(1,...list.map(r=>+r.kills||0))};
  return{value:row.floor+'층',fill:row.floor/this.TOTAL_FLOORS};
 },
 detail(row){return this.board==='depth'?`Lv ${row.level} · 처치 ${row.kills} · ${row.turns}턴`:this.board==='level'?`${row.floor}층 · 처치 ${row.kills} · ${row.turns}턴`:`${row.floor}층 · Lv ${row.level} · ${row.turns}턴`},
 mineCard(list){
  const card=this.el('div','rankMine'),runs=this.mine().slice().sort((a,b)=>b.floor-a.floor||b.level-a.level||b.kills-a.kills||a.turns-b.turns),best=runs[0];
  card.append(this.el('span','rankMineLabel','나의 최고 기록'));
  if(!best){card.append(this.el('p','rankMineEmpty','아직 남긴 기록이 없다. 첫 탐사를 마치면 여기에 올라온다.'));return card}
  const place=list.findIndex(r=>r.tag===this.tag(best.id)),figure=this.el('div','rankMineFigure');
  figure.append(this.el('b',null,best.floor+'층'),this.el('small',null,`Lv ${best.level} · 처치 ${best.kills} · ${best.turns}턴`));
  card.append(figure,this.el('em',place>=0?'rankMinePlace':'rankMinePlace out',place>=0?`${this.BOARDS.find(b=>b[0]===this.board)[1]} ${place+1}위`:'순위권 밖'));
  return card;
 },
 podium(top){
  const wrap=this.el('div','rankPodium'),mine=new Set(this.mine().map(r=>this.tag(r.id)));
  for(const place of [2,1,3]){
   const row=top[place-1],plate=this.el('div','rankPlate p'+place);
   if(!row){plate.classList.add('empty');plate.append(this.el('i','rankMedal',place),this.el('b',null,'—'));wrap.append(plate);continue}
   const metric=this.metric(row,top);
   if(mine.has(row.tag))plate.classList.add('mine');
   plate.style.setProperty('--delay',(place===1?0:place===2?120:240)+'ms');
   plate.append(this.el('i','rankMedal',place),this.el('b','rankTag','탐사자 '+row.tag),this.el('strong','rankValue',metric.value),this.el('small','rankDetail',this.detail(row)),this.el('span','rankCause',row.cause||''));
   wrap.append(plate);
  }
  return wrap;
 },
 rankRows(list){
  const box=this.el('ol','rankList'),mine=new Set(this.mine().map(r=>this.tag(r.id)));
  list.slice(3).forEach((row,i)=>{
   const item=this.el('li','rankRow'),metric=this.metric(row,list),bar=this.el('i');
   item.classList.toggle('mine',mine.has(row.tag));item.style.setProperty('--delay',(300+i*28)+'ms');bar.style.setProperty('--fill',Math.round(Math.max(0,Math.min(1,metric.fill))*100)+'%');
   const who=this.el('div','rankWho'),track=this.el('div','rankTrack');
   who.append(this.el('b',null,'탐사자 '+row.tag),this.el('small',null,this.detail(row)));track.append(bar);
   item.append(this.el('span','rankNo',i+4),who,track,this.el('strong','rankValue',metric.value));
   if(mine.has(row.tag))item.append(this.el('span','rankMineBadge','나'));
   box.append(item);
  });
  return box;
 },

 summaryView(data){
  const box=this.el('div','statsSummary'),floors=Array.from({length:25},(_,i)=>+data.floors?.[i]||0),total=+data.total||floors.reduce((a,b)=>a+b,0);
  const tiles=this.el('div','statsTiles');
  for(const [value,label] of [[total,'기록된 사망'],[data.avg?.level??'-','평균 레벨'],[data.avg?.kills??'-','평균 처치'],[data.avg?.turns??'-','평균 턴']]){const tile=this.el('div','statsTile');tile.append(this.el('b',null,value),this.el('small',null,label));tiles.append(tile)}
  const hist=this.el('div','statsHist'),peak=Math.max(1,...floors);
  floors.forEach((count,i)=>{const col=this.el('div','statsCol'),bar=this.el('i');bar.style.height=Math.round(count/peak*100)+'%';bar.title=`${i+1}층 ${count}명`;col.append(this.el('span','statsCount',count||''),bar,this.el('small',null,(i+1)%5===0||i===0?i+1:''));hist.append(col)});
  const causes=this.el('div','statsCauses'),list=(data.causes||[]).slice(0,this.TOP_CAUSES),top=Math.max(1,...list.map(c=>+c[1]||0));
  for(const [name,count] of list){const row=this.el('div','statsCause'),bar=this.el('i');bar.style.width=Math.round(count/top*100)+'%';row.append(this.el('span','statsCauseName',name),bar,this.el('b',null,count));causes.append(row)}
  box.append(tiles,this.el('h3',null,'도달 층별 사망'),hist,this.el('h3',null,'사망 원인'),causes);return box;
 },
 rowsView(data){
  const table=this.el('table','statsRows'),head=table.createTHead().insertRow();
  for(const name of ['시각','층','원인','Lv','처치','턴'])head.append(this.el('th',null,name));
  const bodyRows=table.createTBody();
  for(const row of data.recent||[]){const tr=bodyRows.insertRow();for(const value of [String(row.t||'').slice(5,16).replace('T',' '),row.floor,row.cause,row.level,row.kills,row.turns])tr.insertCell().textContent=value}
  return table;
 }
};
