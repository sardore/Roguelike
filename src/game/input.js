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
let touchStart = null;
const INPUT={held:new Set(),nextMoveAt:0};
const DesktopClient=Object.freeze({
  kind:'desktop',
  active(){return RuntimeState.client.type==='desktop'},
  emit(command){return clientCommand9(this,command)},
  handleEvent(e){
    if(!this.active()){RuntimeState.client.desktop.inactivePhysical++;return}
    RuntimeState.client.desktop.physical++;
    if(e.type==='keydown'||e.type==='keyup'){clientKeyboardEvent(this,e);return}
    if(e.type==='contextmenu'){
      e.preventDefault();if(!state)return;e.stopPropagation();e.stopImmediatePropagation();this.emit({type:'WORLD_INSPECT',cell:globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY),source:'contextmenu'});return;
    }
    if(e.type==='wheel'){
      const path=e.composedPath(),surface=RuntimeState.input.device?.input;if(!state||state.debugBattle57||!path.includes(C)&&!path.includes(surface))return;
      const r=C.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
      const unit=e.deltaMode===1?16:e.deltaMode===2?VIEW.h:1,dy=Math.max(-180,Math.min(180,(e.deltaY||0)*unit)),result=this.emit({type:'CAMERA_ZOOM',scale:Math.exp(-dy*.00165),anchor:{clientX:e.clientX,clientY:e.clientY},source:'wheel'});
      if(result.status==='handled'){e.preventDefault();e.stopImmediatePropagation()}return;
    }
    if(e.currentTarget===C)clientTargetEvent(this,e)
  },
  cancelPhysical(){clearHeldInput53()},
  snapshot(){return{kind:this.kind,active:this.active(),...RuntimeState.client.desktop}}
});
const MobileClient=Object.freeze({
  kind:'mobile',
  active(){return RuntimeState.client.type==='mobile'},
  emit(command){return clientCommand9(this,command)},
  handleEvent(e){
    if(!this.active()){RuntimeState.client.mobile.inactivePhysical++;return}
    RuntimeState.client.mobile.physical++;
    if(e.type==='keydown'||e.type==='keyup'){clientKeyboardEvent(this,e);return}
    if(e.currentTarget===C)clientTargetEvent(this,e)
  },
  cancelPhysical(){
    clearHeldInput53();const device=RuntimeState.input.device;if(!device)return;
    globalThis.__MANRU_CAMERA_STATE12__?.cancelInertia?.();
    for(const pointer of device.pointers?.values?.()||[]){clearTimeout(pointer.holdShow);clearTimeout(pointer.holdFire);if(device.input?.hasPointerCapture?.(pointer.id))device.input.releasePointerCapture(pointer.id)}
    for(const [button,contact]of device.actionPointers?.entries?.()||[]){contact.down=null;contact.ready=false;button.classList.remove('rt81-pressed')}
    device.pointers?.clear?.();device.hold?.classList.remove('show');device.gesture=null;device.mousePan=null;globalThis.__MANRU_RUNTIME81__?.stopHeld?.();
  },
  snapshot(){return{kind:this.kind,active:this.active(),...RuntimeState.client.mobile}}
});
const ClientEnvironment=Object.freeze({
  capture(){
    const touch=Number(navigator.maxTouchPoints||0)>0||'ontouchstart'in window,coarse=!!window.matchMedia?.('(pointer: coarse)')?.matches,narrow=!!window.matchMedia?.('(max-width: 1080px)')?.matches;
    return{touch,coarse,narrow,width:innerWidth,height:innerHeight,orientation:innerHeight>innerWidth?'portrait':'landscape'};
  },
  initialize(){
    if(RuntimeState.client.initialized)return this.snapshot();const environment=this.capture();
    RuntimeState.client.initialized=true;RuntimeState.client.environment=environment;RuntimeState.client.type=environment.touch&&(environment.coarse||environment.narrow)?'mobile':'desktop';RuntimeState.client.selection={touch:environment.touch,coarse:environment.coarse,narrow:environment.narrow};RuntimeState.client.orientation=environment.orientation;
    this.project();return this.snapshot();
  },
  handleEvent(){this.refresh('environment-change')},
  refresh(reason='refresh'){
    const environment=this.capture(),before=RuntimeState.client.orientation;RuntimeState.client.environment=environment;RuntimeState.client.orientation=environment.orientation;RuntimeState.client.refreshes++;RuntimeState.client.lastReason=reason;
    if(before!==environment.orientation){RuntimeState.client.transitions++;if(environment.orientation==='portrait')MobileClient.cancelPhysical()}
    this.project();return this.snapshot();
  },
  project(){
    const type=RuntimeState.client.type;document.body.dataset.manruClient=type||'';document.body.classList.toggle('client-desktop9',type==='desktop');document.body.classList.toggle('client-mobile9',type==='mobile');document.body.classList.toggle('client-portrait9',type==='mobile'&&RuntimeState.client.orientation==='portrait');OrientationGate.project();
  },
  activeClient(){return RuntimeState.client.type==='mobile'?MobileClient:DesktopClient},
  emit(command){return this.activeClient().emit(command)},
  routeEvent(e){return this.activeClient().handleEvent(e)},
  snapshot(){return{owner:'ClientEnvironment',type:RuntimeState.client.type,orientation:RuntimeState.client.orientation,orientationGate:OrientationGate.active(),selection:{...RuntimeState.client.selection},environment:{...RuntimeState.client.environment},refreshes:RuntimeState.client.refreshes,transitions:RuntimeState.client.transitions,owners:{desktop:DesktopClient.active()?1:0,mobile:MobileClient.active()?1:0},inactiveEmissions:{desktop:0,mobile:0},desktop:DesktopClient.snapshot(),mobile:MobileClient.snapshot()}}
});
/* ===== MANRU v3.3 INPUT / MODAL CLEANUP =====
   Fixes Android ghost-click reopen, stacked long-press handlers, and game-input leakage while inspect is open.
*/
const U={blockUntil:0,longPresses:new Set(),inspectOpenedAt:0};
/* ===== MANRU v8.1: ALWAYS-ON AUTOWALK / FOLLOW-PEEK CAMERA / CONNECTED DECOR =====
   Input, automation, camera and viewport UI have one explicit owner.
   Map taps always mean destination movement. Auto-pickup is a fixed policy.
*/
const CONFIG81=Object.freeze({
    version:'v8.1-structured-runtime',
    autoMove:true,
    autoPickup:true,
    dragThreshold:11,
    holdPreviewMs:330,
    holdInspectMs:660,
    repeatDelayMs:360,
    repeatEveryMs:125
  });
  const Runtime81={
    input:null,
    hold:null,
    pointers:new Map(),
    actionPointers:new Map(),
    gesture:null,
    held:null,
    repeatDelay:0,
    repeatTick:0,
    mousePan:null,
    suppressClickUntil:0,
    cameraInspecting:false,
    qa:{mapTaps:0,autoMoves:0,autoPickups:0,holds:0,drags:0,pinches:0,manualMoves:0}
  };
  const canAct81=()=>gameplayInputAllowed57();
  function queuePlace81(){requestAnimationFrame(placeInput)}
function clientCommand9(client,command){
  const audit=RuntimeState.client[client.kind];
  if(!client.active()){audit.inactiveAttempts++;return{command:command?.type||'UNKNOWN',source:command?.source||'unknown',status:'ignored',owner:'inactive-client',consumed:false}}
  if(OrientationGate.blocks(command)){audit.gated++;return InputRouter.dispatch(command)}
  audit.emissions++;return InputRouter.dispatch(command)
}
function resumeCameraOnMove(ctx){ctx.automationSerial81=Auto81.serial;if(Runtime81.cameraInspecting)CameraController.resume(false);return true}
function trackManualMoves(ctx){if(ctx.moved){Runtime81.qa.manualMoves++;if(ctx.automationSerial81===Auto81.serial)Auto81.pickupAll()}}
  const inspectOpen=()=>!!interactionActive8('mobileInspect');
const AUTO_MOVE_RATE70=1.5;
const RuntimeState={
  ui:{sessions:new Set(),generationPending:false,release:null,food:null,inventory:null,screen:null,storyChoice:null,storyNote:null,storyScene:null,deathCause:null},
  interactionActive:interactionActive8,projectUI(){projectInteractionUI();globalThis.__MANRU_STORY992__?.project?.();if(inventoryOpen)renderInventory();if(interactionActive8('shop58'))renderShop();if(runState57()==='death')presentDeath(RuntimeState.ui.deathCause)},
  input:{qHold61:null,classic:INPUT,router:INPUT_ROUTER57_AUDIT,device:null},action:ACTION_AUDIT5,turn:null,
  client:{initialized:false,type:null,orientation:null,orientationGate:false,selection:null,environment:null,refreshes:0,transitions:0,lastReason:'boot',desktop:{emissions:0,inactiveAttempts:0,inactivePhysical:0,physical:0,gated:0},mobile:{emissions:0,inactiveAttempts:0,inactivePhysical:0,physical:0,gated:0}},
  lifecycle:{phase:'no-run',generation:0,depth:0,last:null,validate:validateSaveState,parse:parseEnvelope},
  persistence:{pending:false,last:null,history:[]},
  prepareRun(){
    RuntimeState.persistence.retiredItemMigration57=null;RuntimeState.persistence.terrainRecovery58=null;
    RuntimeState.ui.sessions.clear();RuntimeState.ui.generationPending=false;RuntimeState.ui.storyChoice=null;RuntimeState.ui.storyNote=null;RuntimeState.ui.storyScene=null;RuntimeState.ui.deathCause=null;projectInteractionUI();
    clearHeldInput53();const device=RuntimeState.input.device;
    if(device){for(const pointer of device.pointers?.values?.()||[]){clearTimeout(pointer.holdShow);clearTimeout(pointer.holdFire)}device.pointers?.clear?.();device.gesture=null;device.mousePan=null;device.suppressClickUntil=0;device.cameraInspecting=false;}
    globalThis.__MANRU_RUNTIME81__?.stopHeld?.();globalThis.__MANRU_RUNTIME81__?.Camera81?.resume?.(false);document.body.classList.remove('camera-inspect81');return true;
  },
  snapshot(){const d=RuntimeState.input.device;return structuredClone({owner:'RuntimeState',schema:1,input:{held:[...INPUT.held],nextMoveAt:INPUT.nextMoveAt,device:d?{repeatDelay:d.repeatDelay,repeatTick:d.repeatTick,pointers:d.pointers?.size||0,gesture:d.gesture,mousePan:d.mousePan,cameraInspecting:d.cameraInspecting}:null},client:ClientEnvironment.snapshot(),lifecycle:{phase:RuntimeState.lifecycle.phase,generation:RuntimeState.lifecycle.generation,depth:RuntimeState.lifecycle.depth,last:RuntimeState.lifecycle.last},persistence:RuntimeState.persistence,action:{serial:ACTION_AUDIT5.serial,roots:ACTION_AUDIT5.roots,activeDepth:ACTION_AUDIT5.stack.length},turn:RuntimeState.turn?{serial:RuntimeState.turn.serial,history:RuntimeState.turn.history}:null})}
};
  /* ---------------- always-on automation: independent path runner ---------------- */
  const Auto81={
    serial:0,
    timer:0,
    active:false,
    exploreMode:false,
    target:null,
    path:[],
    lastStop:'idle',
    intervalMs:82/AUTO_MOVE_RATE70,

    valid(q){return !!q&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.x>=0&&q.y>=0&&q.x<COLS&&q.y<ROWS},
    visibleEnemies(){return new Set((state?.monsters||[]).filter(isThreatVisibleToPlayer))},
    alertedEnemies(){return new Set((state?.monsters||[]).filter(m=>m.alerted&&isThreatVisibleToPlayer(m)))},
    setChip(text){try{v10AutoChip(text||null)}catch(error){ignoreError('auto-walk chip update',error)}},
    syncPreview(path=this.path){VIS.autoPath=(path||[]).map(p=>({x:p.x,y:p.y}))},
    clearTimer(){if(this.timer){clearTimeout(this.timer);this.timer=0}if(autoWalkTimer){clearTimeout(autoWalkTimer);autoWalkTimer=null}},
    stop(reason='manual',clearExplore=true){
      this.serial++;this.clearTimer();this.active=false;this.path=[];this.target=null;this.lastStop=reason;
      if(clearExplore)this.exploreMode=false;
      autoWalkToken++
      VIS.autoPath=null;VIS.exploring=!!this.exploreMode;this.setChip(null);
      const legacyChip=document.getElementById('vfAutoState');if(legacyChip){legacyChip.classList.remove('show');legacyChip.textContent=''}
      return true;
    },
    schedule(fn,ms=this.intervalMs){
      this.clearTimer();
      const id=setTimeout(()=>{if(this.timer===id)this.timer=0;if(autoWalkTimer===id)autoWalkTimer=null;fn()},ms);
      this.timer=id;autoWalkTimer=id;return id;
    },
    targetAt(tx,ty){
      if(neutralInteractableAt58(tx,ty))return{type:'merchant',x:tx,y:ty};
      if(ShopMapBuilder.groundAt(tx,ty))return{type:'shop-stock',x:tx,y:ty};
      const mon=findMonsterAt(tx,ty);
      if(mon&&!isHostileTarget57(mon)&&occupancySwapAllowed57(state.player,mon))return{type:'tile',x:tx,y:ty};
      if(isThreatVisibleToPlayer(mon)||summonActive(mon)&&state.visible.has(k(tx,ty)))return{type:'monster',x:tx,y:ty,mon};
      if(state.map[ty]?.[tx]===TT.JAR)return{type:'blocked',x:tx,y:ty,tile:TT.JAR};
      const item=(state.items||[]).find(it=>it.x===tx&&it.y===ty);
      if(item)return{type:'item',x:tx,y:ty,item};
      if(state.branchPortals105?.some(p=>p.x===tx&&p.y===ty))return{type:'branch',x:tx,y:ty};
      if(state.stairs&&state.stairs.x===tx&&state.stairs.y===ty)return{type:'stairs',x:tx,y:ty};
      if(ReachabilityService.playerPassable(tx,ty)&&!OccupancyService.isOccupied(tx,ty))return{type:'tile',x:tx,y:ty};
      return{type:'blocked',x:tx,y:ty,tile:state.map[ty]?.[tx]};
    },
    targetPos(t){
      if(!t)return null;
      if(t.type==='monster'){
        const m=t.mon;
        if(!m||m.hp<=0||!(state.monsters||[]).includes(m))return null;
        if(Number.isFinite(t.x)&&Number.isFinite(t.y)&&monCovers(m,t.x,t.y))return{x:t.x,y:t.y};const c=entityClosestCellTo57(m,state.player);return c?{x:c.x,y:c.y}:{x:m.x,y:m.y};
      }
      if(t.type==='stairs')return state.stairs?{x:state.stairs.x,y:state.stairs.y}:null;
      if(t.type==='item'){
        const it=(state.items||[]).includes(t.item)?t.item:(state.items||[]).find(i=>i.x===t.x&&i.y===t.y);
        return it?{x:it.x,y:it.y}:{x:t.x,y:t.y};
      }
      return{x:t.x,y:t.y};
    },
    adjacentPath(pos){
      const search=ReachabilityService.playerSearch(state.player,{seenOnly:true,ignoreOccupants:false});let best=null;
      for(const[dx,dy]of DIRS8){
        const x=pos.x+dx,y=pos.y+dy;
        if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1||!state.seen.has(k(x,y))||!ReachabilityService.playerPassable(x,y)||OccupancyService.isOccupied(x,y))continue;
        const path=ReachabilityService.playerPath(search,{x,y});
        if(path&&(!best||path.length<best.length))best=path;
      }
      return best;
    },
    computePath(t){
      const pos=this.targetPos(t);if(!pos)return null;
      const p=state.player;
      if(t.type==='monster'){if(entityDistance57(t.mon,p)<=1)return[];return this.adjacentPath(pos)}
      if(t.type==='merchant'){if(entityDistance57(pos,p)<=1)return[];return this.adjacentPath(pos)}
      if(t.type==='blocked'){if(entityDistance57(pos,p)<=1)return[];return this.adjacentPath(pos)}
      if(p.x===pos.x&&p.y===pos.y)return[];
      return ReachabilityService.pathTo(pos.x,pos.y);
    },
    pickupAll(){
      if(!state||isGameplayInputBlocked())return 0;
      let count=0,guard=0;
      while(guard++<12){
        const before=state.items.length;
        if(!state.items.some(it=>it.x===state.player.x&&it.y===state.player.y))break;
        ActionDispatcher.dispatch({type:'PICKUP',args:[]}).value;
        if(state.items.length>=before)break;
        count+=before-state.items.length;
      }
      if(count){Runtime81.qa.autoPickups+=count;return count}
      return 0;
    },
    act(t){
      if(!t||!state)return false;
      const pos=this.targetPos(t),p=state.player;if(!pos)return false;
      if(t.type==='merchant'){if(entityDistance57(pos,p)>1)return false;this.stop('merchant',true);return interactNeutral58(neutralInteractableAt58(pos.x,pos.y))}
      if(t.type==='shop-stock'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('shop-stock',true);const stock=ShopMapBuilder.groundAt(pos.x,pos.y);if(stock)openShop(stock);return true;
      }
      if(t.type==='monster'){
        if(entityDistance57(t.mon,p)>1)return false;
        const dx=Math.sign(pos.x-p.x),dy=Math.sign(pos.y-p.y);
        this.stop('target-monster',true);ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}).value;return true;
      }
      if(t.type==='item'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('target-item',true);this.pickupAll();return true;
      }
      if(t.type==='stairs'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('target-stairs',true);ActionDispatcher.dispatch({type:'DESCEND',args:[]}).value;return true;
      }
      if(t.type==='branch'){
        if(p.x!==pos.x||p.y!==pos.y)return false;
        this.stop('target-branch',true);this.pickupAll();return true;
      }
      if(t.type==='blocked'){
        if(entityDistance57(pos,p)>1)return false;
        this.stop('target-structure',true);
        const now=state.map[pos.y]?.[pos.x];
        if(ReachabilityService.playerPassable(pos.x,pos.y)&&!OccupancyService.isOccupied(pos.x,pos.y))ActionDispatcher.dispatch({type:'MOVE',args:[Math.sign(pos.x-p.x),Math.sign(pos.y-p.y)]}).value;
        else if(!ActionDispatcher.dispatch({type:'STRUCTURE_INTERACT',args:[pos.x,pos.y]}).value)toast(`${terrainName(now)} 바로 앞이다.`);
        return true;
      }
      if(t.type==='tile'&&p.x===pos.x&&p.y===pos.y){
        this.stop('destination',true);this.pickupAll();return true;
      }
      return false;
    },
    threatBefore(){return{hp:state.player.hp,visible:this.visibleEnemies(),alerted:this.alertedEnemies()}},
    shouldStopForThreat(before,target){
      if(state.player.hp<before.hp)return'hit';
      const after=this.visibleEnemies(),afterAlert=this.alertedEnemies(),targetMon=target?.type==='monster'?target.mon:null;
      for(const m of after)if(!before.visible.has(m)&&m!==targetMon)return'new-enemy';
      for(const m of afterAlert)if(!before.alerted.has(m)&&m!==targetMon)return'alerted-enemy';
      if([...after].some(m=>m!==targetMon&&entityDistance57(m,state.player)<=1))return'adjacent-enemy';
      return'';
    },
    startPath(path,meta={}){
      if(!state||state.dead||state.victory||isGameplayInputBlocked()||targeting81())return false;
      this.stop('replace',false);
      this.active=true;this.exploreMode=!!meta.explore;VIS.exploring=this.exploreMode;
      this.target=meta.target||null;this.path=(path||[]).map(p=>({x:p.x,y:p.y}));
      const token=++this.serial;
      let plannedTarget=this.targetPos(this.target);
      this.syncPreview();
      const label=this.exploreMode?'자동 탐사':this.target?.type==='stairs'?'계단으로 이동':this.target?.type==='item'?'아이템으로 이동':this.target?.type==='monster'?'적에게 접근':'자동 이동';
      this.setChip(label);
      const tick=()=>{
        if(token!==this.serial||!this.active)return;
        if(!state||state.dead||state.victory||isGameplayInputBlocked()||targeting81()){this.stop('blocked-ui',true);return}
        const presentationWait=ACTION_PRESENTATION58.run===state?ACTION_PRESENTATION58.inputUntil-performance.now():0;
        if(presentationWait>0){this.schedule(tick,Math.ceil(presentationWait));return}
        if(this.target&&this.act(this.target))return;
        const pos=this.targetPos(this.target),head=this.path[0],player=state.player;
        const targetMoved=!!this.target&&(!pos||!plannedTarget||pos.x!==plannedTarget.x||pos.y!==plannedTarget.y);
        const blockedNext=!!head&&!ReachabilityService.playerStepAllowed(player,head.x,head.y,{seenOnly:true,ignoreOccupants:false,allowAllySwap:true});
        if(targetMoved||blockedNext||this.target&&!this.path.length){
          if(!this.target){this.active=false;this.path=[];this.syncPreview();this.schedule(()=>this.explore(true),76/AUTO_MOVE_RATE70);return}
          const fresh=this.computePath(this.target);
          if(!fresh){this.stop('unreachable',true);toast('본 길 안에서 닿을 수 없는 곳이다.');return}
          this.path=fresh;plannedTarget=pos;this.syncPreview();
        }
        if(!this.path.length){
          if(this.target&&this.act(this.target))return;
          if(this.exploreMode){this.active=false;this.path=[];this.syncPreview();this.schedule(()=>this.explore(true),76/AUTO_MOVE_RATE70);return}
          this.stop('arrived',true);return;
        }
        const next=this.path[0],p0={x:state.player.x,y:state.player.y,turn:state.turn},before=this.threatBefore();
        const dx=Math.sign(next.x-p0.x),dy=Math.sign(next.y-p0.y);
        if(!dx&&!dy){this.path.shift();this.schedule(tick,30);return}
        ActionDispatcher.dispatch({type:'MOVE',args:[dx,dy]}).value;
        if(token!==this.serial||!this.active)return;
        const moved=state.player.x!==p0.x||state.player.y!==p0.y,turnChanged=state.turn!==p0.turn;
        const danger=this.shouldStopForThreat(before,this.target);
        if(danger){this.stop(danger,true);return}
        this.pickupAll();
        if(this.target&&this.act(this.target))return;
        if(!moved&&!turnChanged){this.stop('stalled',true);return}
        // Consume only a reached cell: opening a door or a consumed failed move
        // must retain the next step. Replan after displacement on the next tick.
        if(state.player.x===next.x&&state.player.y===next.y)this.path.shift();
        this.syncPreview();this.schedule(tick,this.intervalMs);
      };
      this.schedule(tick,0);return true;
    },
    go(tx,ty){
      const q=typeof tx==='object'?tx:{x:tx,y:ty};
      if(!this.valid(q)||!canAct81())return false;
      if(!state.seen.has(k(q.x,q.y))){toast('아직 본 적 없는 칸이다.');return false}
      Runtime81.qa.mapTaps++;CameraController.resume(false);if((q.x!==state.player.x||q.y!==state.player.y)&&elementalWorldTarget105(q.x,q.y)&&combatTerrainTargetCheckR8({type:'terrain',...q}).ok){this.stop('furniture-aim',true);return !!selectJarTarget(q.x,q.y,true)}
      const t=this.targetAt(q.x,q.y);
      if(q.x===state.player.x&&q.y===state.player.y){
        this.stop('same-tile',true);
        if(t.type==='branch')toast('상호작용 버튼(F)으로 출입할 수 있다.');else if(t.type==='item')this.pickupAll();else if(t.type==='stairs')ActionDispatcher.dispatch({type:'DESCEND',args:[]}).value;else if(adjacentBranchPortal105())toast('상호작용 버튼(F)으로 출입할 수 있다.');else ActionDispatcher.dispatch({type:'CONTEXT_ACTION',args:[]}).value;
        return true;
      }
      const path=this.computePath(t);
      if(!path){toast('본 길 안에서 닿을 수 없는 곳이다.');return false}
      Runtime81.qa.autoMoves++;return this.startPath(path,{explore:false,target:t});
    },
    chooseFrontier(){return ReachabilityService.frontierPath(.35,DIRS8)},
    explore(resume=false){
      if(!canAct81())return false;
      if(!resume){this.stop('explore-start',false);this.exploreMode=true;VIS.exploring=true;addLog('자동 탐사: 미탐사 구역을 찾아간다. 적이나 피격에서 멈춘다.')}
      else{this.exploreMode=true;VIS.exploring=true}
      const visible=this.visibleEnemies();
      if([...visible].some(m=>m.alerted||entityDistance57(m,state.player)<=1)){this.stop('explore-danger',true);return false}
      const path=this.chooseFrontier();
      if(!path){this.stop('explore-complete',true);toast('탐사할 새 길이 없다.');return false}
      return this.startPath(path,{explore:true,target:null});
    },
    state(){return{active:this.active,exploring:this.exploreMode,target:this.target?{type:this.target.type,...this.targetPos(this.target)}:null,path:this.path.length,lastStop:this.lastStop}}
  };
let autoWalkTimer = null;
let autoWalkToken = 0;
function bindFullscreenAndResizeListeners(){
  document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement)fullscreenResume66=false;else if(fullscreenWanted66)fullscreenResume66=true;window.dispatchEvent(new window.Event('resize'))});
  // Re-enter from a genuine user gesture when the browser revokes fullscreen on app switching.
  for(const type of ['pointerdown','touchend','keydown'])document.addEventListener(type,e=>{if(e.isTrusted&&fullscreenResume66&&document.body.dataset.manruScreen==='game')requestGameFullscreen65()},{capture:true,passive:true});
  /* Phase 12: CameraProjection12 and WorldHitTest12 are installed before runtime input can fire. */
  window.addEventListener('resize',syncViewportOnWindowResize,{passive:true});
}
function createMobileAutoButton(){
  const m=document.querySelector('#mobileHud .mButtons');
  if(m&&!document.getElementById('mobileAutoBtn')){const b=document.createElement('button');b.id='mobileAutoBtn';b.setAttribute('aria-label','이동 / 자동 탐사');b.textContent='行';b.onclick=()=>ClientEnvironment.emit({type:'AUTO_EXPLORE',source:'mobile-hud'});m.insertBefore(b,document.getElementById('mobilePanelBtn'))}
}
function rebindInspectClose(){
    // adaptive versions of layouts that need to fill the larger maps
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
    /* ----------------------- more decor kinds / context placement ----------------------- */
    
    
  
  
    
  
  
    
    // r34: superseded inventory renderer removed; canonical renderer is registered below.
  
    
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
    // One long-press implementation only. Calling again on the same node replaces the previous binding.
  
    // Use native click activation for touch, mouse and keyboard. Keep the sheet
    // present through pointerup so a touch's click cannot hit the control behind it.
    // IMPORTANT: internal modal controls are NEVER blocked by the ghost-click firewall.
    const oldClose=document.getElementById('inspectClose');
    if(oldClose){
      const c=oldClose.cloneNode(true);oldClose.replaceWith(c);
      const doClose=(e)=>{if(!inspectOpen())return;e.preventDefault?.();e.stopPropagation?.();e.stopImmediatePropagation?.();InputRouter.dispatch({type:'MODAL_CANCEL',source:'inspect-close'})};
      c.addEventListener('click',doClose);
    }
}
function bindModalSwipeClose(){
    // mark real inventory / martial actions so closing the UI does not unexpectedly resume movement.
    // r30: modal-dirty item-use bookkeeping is integrated in canonical useInventoryItem.
    // r57: inventory/martial dirty state is set by the canonical action bodies.
  
  
  
  
  
  
  
  
  
  
  
    // replace the accumulated inventory implementations with one thumb-friendly renderer.
  
  
  
    // don't rebuild a full-screen bag DOM when the bag is closed (pickup used to do this every time).
  
    // relaxed auto-move: explicit destination doesn't abort just because an already-known enemy or incidental item exists.
    
  
  
    // mobile drawer/map/inspect should block world controls but not eat their own buttons.
    /* r8: attack input blocking is handled in attackInputBlockedR8; no basicAttack wrapper. */
  
  
  
    const swipeModalCancel45=()=>InputRouter.dispatch({type:'MODAL_CANCEL',source:'modal-swipe'});
    swipeClose(document.getElementById('inventory'),swipeModalCancel45);
    swipeClose(document.getElementById('mobileDrawer'),swipeModalCancel45);
    swipeClose(document.getElementById('mobileInspect'),swipeModalCancel45);
    swipeClose(document.getElementById('mobileMapModal'),swipeModalCancel45);
}
function bindTextSelectionGuards(){
    
  
    
  
  
    
    
  
  
  
  
  
  
    
  
  
  
  
  
    
    
  
  
  
  
  /* ===== MANRU v5.1 MOBILE PERFORMANCE HOTFIX ===== */
  
  
  
  
  
  
  
  
    // 요약은 수치만. 설명/능력을 섞지 않는다.
  
    const editable53=t=>!!t?.closest?.('input,textarea,[contenteditable="true"]');
    for(const type of ['selectstart','dragstart','copy','cut']){
      document.addEventListener(type,e=>{if(editable53(e.target))return;if(e.target?.closest?.('#app,#overlay,#game,canvas')){e.preventDefault();e.stopImmediatePropagation?.()}},{capture:true,passive:false});
    }
    document.addEventListener('contextmenu',e=>{if(editable53(e.target)||e.target?.closest?.('#game,#runtimeInput81'))return;if(e.target?.closest?.('#app,#overlay')){e.preventDefault();e.stopImmediatePropagation?.()}},{capture:true,passive:false});
    document.addEventListener('pointerdown',e=>{if(editable53(e.target))return;if(e.target?.closest?.('#game,canvas,img')){try{window.getSelection?.()?.removeAllRanges?.()}catch(error){ignoreError('getSelection unavailable',error)}}},{capture:true,passive:true});
}
function bindHeldInputStop(){
    /* Auto-pickup is permanent. A movement also exits temporary camera inspection. */
  
  
  
  
  
  
    
  
  
  
  
  
  
  
  
  
  
  
  
  
  
    /* Reapply after start/load without adding switches or changing user policy. */
      
    addEventListener('pointerup',stopHeldInput,{passive:true});
  addEventListener('pointercancel',stopHeldInput,{passive:true});
  addEventListener('blur',stopHeldInput,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHeldInput()},{passive:true});
}
