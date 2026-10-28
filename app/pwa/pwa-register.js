// 앱 셸: 서비스 워커 등록 (게임 코드와 무관)
// 캐시 우선이라 새 버전은 한 번 더 열어야 보였다. 새 워커가 제어권을 넘겨받으면 한 번 새로 고치고,
// 앱을 다시 보게 될 때(백그라운드 복귀)마다 새 버전이 있는지 확인한다. 진행은 턴마다 자동 저장된다.
(()=>{
  if(!('serviceWorker' in navigator)||window.Capacitor)return;
  const local=['localhost','127.0.0.1'].includes(location.hostname);
  if(location.protocol!=='https:'&&!local)return;
  const hadController=!!navigator.serviceWorker.controller;
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||reloading)return;reloading=true;location.reload()});
  addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').then(reg=>{
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})});
    }).catch(()=>{});
  });
})();
