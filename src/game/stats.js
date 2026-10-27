/* Play statistics. Out: one anonymous record per death (the numbers on the death screen). In: the aggregate view behind a hidden title gesture. */
const PlayStats={
 QUEUE_KEY:'manruStatsQueue',QUEUE_MAX:20,TAPS:7,TAP_GAP_MS:1000,TOP_CAUSES:12,
 taps:0,lastTapAt:0,sending:false,tab:'stats',data:null,
 endpoint(){return document.querySelector('meta[name="manru-stats"]')?.content.trim()||''},
 queue(){try{const list=JSON.parse(lsGet(this.QUEUE_KEY)||'[]');return Array.isArray(list)?list:[]}catch(error){ignoreError('play stats queue unreadable',error);return[]}},
 saveQueue(list){lsSet(this.QUEUE_KEY,JSON.stringify(list.slice(-this.QUEUE_MAX)))},
 recordDeath(cause){
  if(!state||state.debugBattle57||state.debugMapGeneration57||!this.endpoint())return false;
  const record={v:1,id:String(state.runId984||''),floor:state.floor,cause:String(cause||'').slice(0,40),level:state.player.level,kills:state.player.kills,turns:state.turn};
  this.saveQueue([...this.queue().filter(q=>q.id!==record.id),record]);
  this.flush();return true;
 },
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
 // Seven quick taps anywhere on the title block (crown, small brand line, the big logo, rule) open the view.
 tapTitle(event){
  this.taps=event.timeStamp-this.lastTapAt<=this.TAP_GAP_MS?this.taps+1:1;this.lastTapAt=event.timeStamp;
  if(this.taps>=this.TAPS){this.taps=0;this.open()}
 },
 open(){
  if(document.getElementById('statsScene'))return false;
  const scene=this.el('div'),panel=this.el('div','statsPanel'),head=this.el('header'),tabs=this.el('nav'),close=this.el('button',null,'×');
  scene.id='statsScene';scene.setAttribute('role','dialog');scene.setAttribute('aria-label','탐사 기록 통계');
  close.type='button';close.id='statsClose';close.setAttribute('aria-label','닫기');close.onclick=()=>this.close();
  for(const [tab,name] of [['stats','통계'],['rows','기록']]){const button=this.el('button',null,name);button.type='button';button.dataset.statsTab=tab;button.onclick=()=>{this.tab=tab;this.render()};tabs.append(button)}
  head.append(this.el('h2',null,'탐사 기록 통계'),tabs,close);
  const body=this.el('div');body.id='statsBody';panel.append(head,body);scene.append(panel);document.body.append(scene);
  this.data=null;this.render('loading');this.load();return true;
 },
 close(){document.getElementById('statsScene')?.remove()},
 async load(){
  const url=this.endpoint();if(!url){this.render('unset');return}
  try{
   const reply=await fetch(url+(url.includes('?')?'&':'?')+'view=summary');
   if(!reply.ok)throw new Error('HTTP '+reply.status);
   this.data=await reply.json();this.render();
  }catch(error){ignoreError('play stats load failed',error);this.render('error')}
 },
 el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node},
 render(status){
  const body=document.getElementById('statsBody');body.replaceChildren();
  for(const button of document.querySelectorAll('[data-stats-tab]'))button.classList.toggle('on',button.dataset.statsTab===this.tab);
  const notice={loading:'기록을 불러오는 중…',unset:'수집 서버가 연결되어 있지 않다.',error:'기록을 불러오지 못했다.'}[status];
  if(notice||!this.data){body.append(this.el('p','statsNote',notice||'기록이 없다.'));return}
  body.append(this.tab==='rows'?this.rowsView(this.data):this.summaryView(this.data));
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
