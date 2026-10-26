
/* Shared by every script: a failure that is expected and harmless (storage blocked, audio locked, an optional
   browser API missing) is passed here instead of an empty catch. The first occurrence of each reason is logged
   so it stays visible in the console; docs/CATCH_AUDIT.md lists every call site. */
const ignoredErrorReasons=new Set();
function ignoreError(reason,error){
  if(ignoredErrorReasons.has(reason))return;
  ignoredErrorReasons.add(reason);
  console.debug('[manru] ignored error:',reason,error);
}

/* The one place that names this release. The document title in index.html must equal title (tools/build.mjs checks it),
   the corner stamp shows stamp, and the QA bridge reports build. */
const RELEASE_INFO=Object.freeze({build:'10.0.6',title:'만루',stamp:'10.0.6 · 창해 용궁 · 잠긴 조정'});

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
  }catch(error){ignoreError('boot recovery: storage unavailable, keep the primary save',error)}
})();
