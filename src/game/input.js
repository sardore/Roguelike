const MOVE_KEYS={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],numpad8:[0,-1],numpad2:[0,1],numpad4:[-1,0],numpad6:[1,0],numpad7:[-1,-1],numpad9:[1,-1],numpad1:[-1,1],numpad3:[1,1]};
function targetFollowupSuppressed(){return performance.now()<targetFollowupSuppressUntil}
const WORLD_TARGET_KEYS={arrowup:[0,-1],w:[0,-1],numpad8:[0,-1],arrowdown:[0,1],s:[0,1],numpad2:[0,1],arrowleft:[-1,0],a:[-1,0],numpad4:[-1,0],arrowright:[1,0],d:[1,0],numpad6:[1,0],numpad7:[-1,-1],numpad9:[1,-1],numpad1:[-1,1],numpad3:[1,1]};
function worldTargetKeyDirection(e){const code=String(e?.code||'').toLowerCase(),key=String(e?.key||'').toLowerCase();return WORLD_TARGET_KEYS[code]||WORLD_TARGET_KEYS[key]||null}
function clientTargetEvent(client,e){
  if(e.type==='click'&&targetFollowupSuppressed()){e.preventDefault();e.stopImmediatePropagation();return}
  if(!actionTargetOpen56()||e.button>0)return;
  if(e.type==='pointerdown'){e.preventDefault();e.stopImmediatePropagation();return}
  if(e.type==='pointerup'&&!window.__manruZoomActive){e.preventDefault();e.stopImmediatePropagation();touchStart=null;VIS.tapTrack=null;client.emit({type:'TARGET_CONFIRM',cell:globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY),source:e.pointerType==='touch'?'touch':'pointer'})}
}
function clientKeyboardEvent(client,e){
  if(state?.debugBattle57){if(e.type==='keydown'&&e.key==='Escape'){e.preventDefault();if(document.body.classList.contains('manru-inspect-open'))closeInspect();else closeDebugBattle57()}return;}
  if(e.type==='keyup'){const key=String(e.key||'').toLowerCase();INPUT.held.delete(String(e.code||'').toLowerCase());INPUT.held.delete(key);if(key==='q'){const hold=RuntimeState.input.qHold61;if(hold){clearTimeout(hold.timer);RuntimeState.input.qHold61=null;e.preventDefault();if(!hold.fired&&RunLifecycle.isCurrent(hold.generation))client.emit({type:'CLASS_SKILL',source:'keyboard'})}}return}
  if(document.body.classList.contains('title-class-mode'))return;
  const tag=(e.target?.tagName||'').toUpperCase();if(['INPUT','TEXTAREA','SELECT'].includes(tag)||e.target?.isContentEditable)return;
  const key=String(e.key||'').toLowerCase(),owner=InputRouter.owner(),targetDirection=worldTargetKeyDirection(e),moveKey=MOVE_KEYS[String(e.code||'').toLowerCase()]?String(e.code).toLowerCase():key,move=MOVE_KEYS[moveKey];
  let command=null;
  if(e.key==='Escape')command={type:owner.kind==='targeting'?'TARGET_CANCEL':'MODAL_CANCEL'};
  else if(e.key==='F1')command={type:'TOGGLE_RELEASE'};
  else if(owner.kind==='targeting'&&targetDirection)command={type:'TARGET_MOVE',dx:targetDirection[0],dy:targetDirection[1]};
  else if((key==='s'&&e.ctrlKey)||key==='k')command={type:'SAVE'};
  else if(key==='l')command={type:'LOAD'};
  else if(key==='?'||(e.shiftKey&&e.key==='/'))command={type:'TOGGLE_HELP',key:'?'};
  else if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&MARTIAL_RULES.keys.includes(key)&&globalThis.__MANRU_SKILL991_INPUT__?.isOpen())command={type:'QUICK_MARTIAL',index:MARTIAL_RULES.keys.indexOf(key)};
  else if(!e.ctrlKey&&!e.metaKey&&['v','t'].includes(key))command={type:'OPEN_SUMMON105',slot:key==='v'?0:1};
  else if(key==='i')command={type:'TOGGLE_INVENTORY'};
  else if(move)command={type:'MOVE',dx:move[0],dy:move[1]};
  else if(key===' '||key==='j')command={type:'ATTACK'};
  else if(key==='g')command={type:'PICKUP'};
  else if(key==='f')command={type:'CONTEXT_ACTION'};
  else if(key==='e')command={type:'BLINK'};
  else if(key==='q'){e.preventDefault();e.stopImmediatePropagation();if(e.repeat||RuntimeState.input.qHold61||owner.kind!=='none')return;const hold={fired:false,generation:RunLifecycle.generation(),timer:0};RuntimeState.input.qHold61=hold;hold.timer=setTimeout(()=>{if(RuntimeState.input.qHold61!==hold||!RunLifecycle.isCurrent(hold.generation))return;hold.fired=true;client.emit({type:'OPEN_MARTIAL',source:'keyboard-hold'})},420);return;}
  else if(key==='r')command={type:'REST'};
  else if(e.key==='>'||key==='.')command={type:'DESCEND'};
  else if(key==='h')command={type:'TOGGLE_HELP',key:'h'};
  else if(key==='x')command={type:'AUTO_EXPLORE'};
  else if(e.key==='+'||e.key==='=')command={type:'CAMERA_ZOOM',delta:1};
  else if(e.key==='-'||e.key==='_')command={type:'CAMERA_ZOOM',delta:-1};
  else if(e.key==='0')command={type:'CAMERA_ZOOM',reset:true};
  else if(key==='c')command={type:'CLOSE_DOOR'};
  else if(['1','2','3'].includes(e.key))command={type:'QUICK_SLOT',slot:+e.key};
  else if(key==='m')command={type:'TOGGLE_SFX'};
  if(!command)return;
  command.source='keyboard';e.preventDefault();e.stopImmediatePropagation();
  if(command.type==='MOVE'){
    if(e.repeat)return;const result=client.emit(command);if(result.status==='handled'){INPUT.held.add(moveKey);INPUT.nextMoveAt=performance.now()+360}else clearHeldInput53();return;
  }
  if(e.repeat&&['TARGET_MOVE','ATTACK','PICKUP','CONTEXT_ACTION','BLINK','CLASS_SKILL','REST','DESCEND','QUICK_SLOT','QUICK_MARTIAL','OPEN_SUMMON105'].includes(command.type))return;
  client.emit(command);
}
function attachLongPress(el,fn){
    if(!el||!fn)return;
    if(el.__manruLongPressCleanup)el.__manruLongPressCleanup();
    let timer=null,sx=0,sy=0,fired=false;
    const clear=()=>{if(timer){clearTimeout(timer);timer=null}U.longPresses.delete(clear)};
    const down=(e)=>{
      if(blocked()||inspectOpen())return;
      const p=e.touches?.[0]||e; sx=p.clientX||0;sy=p.clientY||0;fired=false;clear();
      timer=setTimeout(()=>{timer=null;fired=true;block(220);fn();},430);U.longPresses.add(clear);
    };
    const move=(e)=>{const p=e.touches?.[0]||e;if(Math.hypot((p.clientX||0)-sx,(p.clientY||0)-sy)>12)clear()};
    const up=(e)=>{if(fired){e.preventDefault?.();e.stopPropagation?.();block(260)}clear()};
    const ctx=(e)=>e.preventDefault();
    el.addEventListener('touchstart',down,{passive:true});el.addEventListener('touchmove',move,{passive:true});el.addEventListener('touchend',up,{passive:false});el.addEventListener('touchcancel',clear,{passive:true});el.addEventListener('contextmenu',ctx);
    el.__manruLongPressCleanup=()=>{clear();el.removeEventListener('touchstart',down);el.removeEventListener('touchmove',move);el.removeEventListener('touchend',up);el.removeEventListener('touchcancel',clear);el.removeEventListener('contextmenu',ctx)};
  }
  // Old quickbar closures hard-cancelled auto-walk before opening UI. Replace only viewer buttons.
  function replaceViewerQuickButton(act,fn){
    const old=document.querySelector(`#mobileControls [data-act="${act}"]`);if(!old)return;
    const b=old.cloneNode(true);old.replaceWith(b);let armed=0;
    const fire=e=>{e?.preventDefault?.();e?.stopPropagation?.();const t=now();if(t<armed)return;armed=t+160;fn()};
    b.addEventListener('pointerup',fire,{passive:false});b.addEventListener('click',fire,{passive:false});b.addEventListener('touchend',fire,{passive:false});
  }
  // cheap modal swipe-down close for backpack / drawer / inspect / map.
  function swipeClose(el,fn){if(!el)return;let sy=0,active=false;el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;sy=e.clientY;active=true},{passive:true});el.addEventListener('pointerup',e=>{if(!active)return;active=false;if(e.clientY-sy>90)fn()},{passive:true})}
  function rebindControls(){
    const old=document.getElementById('mobileControls');if(!old)return;
    const controls=old.cloneNode(true);old.replaceWith(controls);
    controls.querySelectorAll('.pad button').forEach(btn=>{
      const raw=btn.dataset.move||btn.dataset.diag70||'',dir=raw?raw.split(',').map(Number):null,center=btn.dataset.act==='rest';if(!dir&&!center)return;
      btn.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0||btn.hidden||!btn.isConnected||btn.getClientRects().length===0)return;
        if(worldTargetActive57()&&dir){e.preventDefault();e.stopPropagation();stopHeldInput();ClientEnvironment.emit({type:'TARGET_MOVE',dx:dir[0],dy:dir[1],source:'mobile-pad'});return}
        if(!canAct81())return;e.preventDefault();e.stopPropagation();stopHeldInput();try{btn.setPointerCapture(e.pointerId)}catch(error){ignoreError('pointer capture refused (pointer already released)',error)}
        Runtime81.held={btn,id:e.pointerId,dir,center};btn.classList.add('rt81-pressed');
        if(dir){ClientEnvironment.emit({type:'MOVE',dx:dir[0],dy:dir[1],source:'mobile-pad'});Runtime81.repeatDelay=setTimeout(()=>{if(Runtime81.held?.btn!==btn)return;Runtime81.repeatTick=setInterval(()=>{if(Runtime81.held?.btn===btn&&canAct81())ClientEnvironment.emit({type:'MOVE',dx:dir[0],dy:dir[1],source:'mobile-pad-hold'})},CONFIG81.repeatEveryMs)},CONFIG81.repeatDelayMs)}else ClientEnvironment.emit({type:'REST',source:'mobile-pad'});
      },{passive:false});
      const end=e=>{if(Runtime81.held?.btn!==btn)return;e?.preventDefault?.();e?.stopPropagation?.();stopHeldInput()};
      btn.addEventListener('pointerup',end,{passive:false});btn.addEventListener('pointercancel',end,{passive:false});btn.addEventListener('lostpointercapture',end,{passive:false});btn.onclick=e=>{e.preventDefault();e.stopPropagation()};
    });
    const acts={attack:'ATTACK',rest:'REST',pickup:'CONTEXT_ACTION',open:'BLINK',skill:'CLASS_SKILL',inv:'TOGGLE_INVENTORY',summon0:'OPEN_SUMMON105',summon1:'OPEN_SUMMON105'};
    Runtime81.actionPointers.clear();
    controls.querySelectorAll('.actions [data-act]').forEach(btn=>{
      const contact={down:null,ready:false};Runtime81.actionPointers.set(btn,contact);
      const clear=()=>{contact.down=null;contact.ready=false;btn.classList.remove('rt81-pressed')};
      btn.addEventListener('pointerdown',e=>{clear();if((e.pointerType==='mouse'&&e.button!==0)||!canAct81()||btn.hidden)return;e.stopPropagation();contact.down={id:e.pointerId,x:e.clientX,y:e.clientY};btn.classList.add('rt81-pressed')},{passive:true});
      btn.addEventListener('pointermove',e=>{const down=contact.down;if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>16)clear()},{passive:true});
      btn.addEventListener('pointercancel',clear,{passive:true});
      btn.addEventListener('lostpointercapture',()=>{if(contact.down)clear()},{passive:true});
      btn.addEventListener('pointerup',e=>{const down=contact.down;contact.ready=!!down&&e.pointerId===down.id&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<=16;contact.down=null;btn.classList.remove('rt81-pressed');e.stopPropagation()},{passive:true});
      btn.onclick=e=>{e.preventDefault();e.stopPropagation();const ok=contact.ready||e.detail===0,type=acts[btn.dataset.act];clear();if(ok&&canAct81()&&type)ClientEnvironment.emit({type,slot:btn.dataset.act==='summon1'?1:0,source:'mobile-action'})};
    });
    for(const id of ['mobile-pad:pointerdown','mobile-pad:pointerup','mobile-pad:pointercancel','mobile-pad:lostpointercapture','mobile-pad:click','mobile-action:pointerdown','mobile-action:pointermove','mobile-action:pointerup','mobile-action:pointercancel','mobile-action:lostpointercapture','mobile-action:click'])InputRouter.noteListener(id);
  }
  function makeInput(){
    document.getElementById('runtimeInput80')?.remove();document.getElementById('runtimeHold80')?.remove();document.getElementById('runtimeInput81')?.remove();document.getElementById('runtimeHold81')?.remove();
    const input=document.createElement('div');input.id='runtimeInput81';input.setAttribute('aria-label','만루 게임 입력 영역');document.body.appendChild(input);Runtime81.input=input;
    const hold=document.createElement('div');hold.id='runtimeHold81';hold.textContent='⋯';document.body.appendChild(hold);Runtime81.hold=hold;
    const cancelHold=p=>{if(p?.holdShow)clearTimeout(p.holdShow);if(p?.holdFire)clearTimeout(p.holdFire);hold.classList.remove('show')};
    const clearAll=()=>{CameraController.cancelInertia();for(const p of Runtime81.pointers.values())cancelHold(p);Runtime81.pointers.clear();Runtime81.gesture=null;hold.classList.remove('show')};
    input.addEventListener('pointerdown',e=>{
      CameraController.cancelInertia();if(!canAct81()||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();e.stopPropagation();try{input.setPointerCapture(e.pointerId)}catch(error){ignoreError('pointer capture refused (pointer already released)',error)}
      const q=globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY),p={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,q,moved:false,held:false,holdShow:0,holdFire:0};Runtime81.pointers.set(e.pointerId,p);
      if(Runtime81.pointers.size===1){
        if(e.pointerType!=='mouse'){
          p.holdShow=setTimeout(()=>{if(!Runtime81.pointers.has(p.id)||p.moved)return;hold.style.left=p.x+'px';hold.style.top=p.y+'px';hold.classList.add('show')},CONFIG81.holdPreviewMs);
          p.holdFire=setTimeout(()=>{if(!Runtime81.pointers.has(p.id)||p.moved)return;p.held=true;Runtime81.qa.holds++;hold.classList.remove('show');ClientEnvironment.emit({type:'WORLD_INSPECT',cell:p.q,source:'world-long-press'})},CONFIG81.holdInspectMs);
        }
      }else if(Runtime81.pointers.size===2){
        for(const v of Runtime81.pointers.values())cancelHold(v);const a=[...Runtime81.pointers.values()],dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);Runtime81.gesture={type:'pinch',dist,zoom0:ZoomController.value()/100};Runtime81.qa.pinches++;
      }
    },{passive:false});
    input.addEventListener('pointermove',e=>{
      const p=Runtime81.pointers.get(e.pointerId);if(!p)return;e.preventDefault();e.stopPropagation();p.lx=e.clientX;p.ly=e.clientY;
      if(Runtime81.gesture?.type==='pinch'&&Runtime81.pointers.size>=2){
        p.x=e.clientX;p.y=e.clientY;const a=[...Runtime81.pointers.values()].slice(0,2),d=Math.hypot(a[0].lx-a[1].lx,a[0].ly-a[1].ly),g=Runtime81.gesture;
        if(typeof window.__MANRU_V984_SET_ZOOM__==='function'){const mx=(a[0].lx+a[1].lx)*.5,my=(a[0].ly+a[1].ly)*.5;ClientEnvironment.emit({type:'CAMERA_ZOOM',value:(g.zoom0||1)*d/Math.max(1,g.dist),anchor:{clientX:mx,clientY:my},source:'world-pinch'});return}
        const ratio=d/Math.max(1,g.dist);if(ratio>1.13){ClientEnvironment.emit({type:'CAMERA_ZOOM',delta:1,source:'world-pinch'});g.dist=d;g.zoom0=ZoomController.value()/100}else if(ratio<.885){ClientEnvironment.emit({type:'CAMERA_ZOOM',delta:-1,source:'world-pinch'});g.dist=d;g.zoom0=ZoomController.value()/100}return;
      }
      const totalX=e.clientX-p.x,totalY=e.clientY-p.y;
      if(!p.moved&&Math.hypot(totalX,totalY)>CONFIG81.dragThreshold){p.moved=true;cancelHold(p);Runtime81.qa.drags++;CameraController.beginInspect();Runtime81.gesture={type:'pan',lastX:p.x,lastY:p.y}}
      if(p.moved&&Runtime81.gesture?.type==='pan'){const dx=e.clientX-Runtime81.gesture.lastX,dy=e.clientY-Runtime81.gesture.lastY;ClientEnvironment.emit({type:'CAMERA_PAN',dx,dy,source:'world-pan'});Runtime81.gesture.lastX=e.clientX;Runtime81.gesture.lastY=e.clientY}
    },{passive:false});
    input.addEventListener('pointerup',e=>{
      const p=Runtime81.pointers.get(e.pointerId);if(!p)return;e.preventDefault();e.stopPropagation();cancelHold(p);Runtime81.pointers.delete(e.pointerId);if(Runtime81.pointers.size)return;
      const gesture=Runtime81.gesture;Runtime81.gesture=null;
      if(p.held)return;
      if(p.moved||gesture){
        if(gesture?.type==='pan')ClientEnvironment.emit({type:'CAMERA_PAN',phase:'end',source:'world-pan-release'});
        return;
      }
      const q=p.q||globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY);ClientEnvironment.emit({type:'WORLD_SELECT',cell:q,source:e.pointerType==='touch'?'touch':'pointer'});
    },{passive:false});
    input.addEventListener('pointercancel',clearAll,{passive:true});input.addEventListener('lostpointercapture',e=>{const p=Runtime81.pointers.get(e.pointerId);if(p){CameraController.cancelInertia();cancelHold(p);Runtime81.pointers.delete(e.pointerId)}if(!Runtime81.pointers.size)Runtime81.gesture=null},{passive:true});input.addEventListener('contextmenu',e=>e.preventDefault());
    new ResizeObserver(queuePlace81).observe(C);addEventListener('resize',queuePlace81,{passive:true});addEventListener('scroll',queuePlace81,{passive:true});window.visualViewport?.addEventListener('resize',queuePlace81,{passive:true});window.visualViewport?.addEventListener('scroll',queuePlace81,{passive:true});
    for(const id of ['world:pointerdown','world:pointermove','world:pointerup','world:pointercancel','world:lostpointercapture','world:contextmenu'])InputRouter.noteListener(id);queuePlace81();
  }
  function bindSkillButton(){const old=document.querySelector('#mobileControls [data-act="skill"]');if(!old||old.dataset.v991==='1')return;const b=old.cloneNode(true);b.dataset.v991='1';old.replaceWith(b);let timer=0,long=false,down=false,x=0,y=0;const clear=()=>{clearTimeout(timer);timer=0;down=false;b.classList.remove('rt81-pressed')};b.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0||b.hidden||!b.isConnected||b.getClientRects().length===0)return;e.preventDefault();e.stopPropagation();down=true;long=false;x=e.clientX;y=e.clientY;b.classList.add('rt81-pressed');try{b.setPointerCapture(e.pointerId)}catch(error){ignoreError('pointer capture refused (pointer already released)',error)}timer=setTimeout(()=>{if(!down)return;long=true;clearTimeout(timer);timer=0;b.classList.remove('rt81-pressed');ClientEnvironment.emit({type:'OPEN_MARTIAL',source:'skill-long-press'})},520)},{passive:false});b.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-x,e.clientY-y)>18)clear()},{passive:true});b.addEventListener('pointerup',e=>{if(!down&&!long)return;e.preventDefault();e.stopPropagation();const wasLong=long;clear();if(!wasLong)ClientEnvironment.emit({type:'TOGGLE_SKILL_QUICK',source:'mobile-action'})},{passive:false});b.addEventListener('pointercancel',clear,{passive:true});b.onclick=e=>{e.preventDefault();e.stopPropagation()};b.title='짧게: 기술 사용 · 길게: 기술 강화';for(const id of ['skill:pointerdown','skill:pointermove','skill:pointerup','skill:pointercancel','skill:click'])InputRouter.noteListener(id)}
  const now=()=>performance.now();
