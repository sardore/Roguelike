
/* v10.0.4 boot recovery: if the canonical save is missing/corrupt, preserve the newest surviving same-build legacy candidate before later code can prune anything. */
(()=>{
  'use strict';
  const V='v10.0.4',PRIMARY='manru1004_active_run',RECOVERY='manru1004_boot_recovery_raw';
  const unpack=raw=>{if(!raw)return null;try{const q=JSON.parse(raw),st=q?.format==='MANRU_SAVE'&&q.state?q.state:q;if(!st?.player||!Array.isArray(st?.map)||st.saveVersion1004!==V||st.dead||st.victory)return null;return{raw,st,savedAt:Date.parse(q?.savedAt||'')||0}}catch(_){return null}};
  try{
    sessionStorage.removeItem(RECOVERY);
    const primary=unpack(localStorage.getItem(PRIMARY));
    if(primary)return;
    const keys=['manru984_active_run','manruV08Save','manruRC70_autosave','manruRC70_backup_0','manruRC70_backup_1','manruRC70_slot_1','manruRC70_slot_2','manruRC70_slot_3'];
    let best=null;
    for(const key of keys){
      const c=unpack(localStorage.getItem(key));if(!c)continue;
      const written=Number(c.st.saveWrittenAt1004)||c.savedAt||0,seq=Number(c.st.saveSeq1004)||0,turn=Number(c.st.turn)||0;
      const rank=[written,seq,turn];
      if(!best||rank[0]>best.rank[0]||(rank[0]===best.rank[0]&&(rank[1]>best.rank[1]||(rank[1]===best.rank[1]&&rank[2]>best.rank[2]))))best={...c,key,rank};
    }
    if(best){sessionStorage.setItem(RECOVERY,best.raw);sessionStorage.setItem('manru1004_boot_recovery_source',best.key)}
  }catch(_){}
})();
