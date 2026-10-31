// 앱 셸: 서비스 워커 등록 (게임 코드와 무관)
// 캐시 우선이라 새 버전은 한 번 더 열어야 보였다. 새 워커가 제어권을 넘겨받으면 새로 고치되, 판을 하는 중에는 새로 고치지 않고
// 타이틀 화면일 때(바로, 아니면 다음에 앱을 다시 볼 때)만 새로 고친다. 새 버전은 다음에 앱을 열 때 어차피 뜬다.
// 앱을 다시 보게 될 때(백그라운드 복귀)마다 새 버전이 있는지 확인한다. 진행은 턴마다 자동 저장된다.
(()=>{
  if(!('serviceWorker' in navigator)||window.Capacitor)return;
  const local=['localhost','127.0.0.1'].includes(location.hostname);
  if(location.protocol!=='https:'&&!local)return;
  const hadController=!!navigator.serviceWorker.controller;
  let reloading=false,pending=false;
  // The game keeps its screen on <body data-manru-screen>; no value yet or 'title' means no run is on the screen.
  const idle=()=>{const screen=document.body?.dataset.manruScreen;return !screen||screen==='title'};
  const apply=()=>{if(!pending||reloading||!idle())return;reloading=true;location.reload()};
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||reloading)return;pending=true;apply()});
  addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').then(reg=>{
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){apply();reg.update().catch(()=>{})}});
    }).catch(()=>{});
  });
})();
