// 앱 셸: 서비스 워커 등록 (게임 코드와 무관)
(()=>{
  if(!('serviceWorker' in navigator)||window.Capacitor)return;
  const local=['localhost','127.0.0.1'].includes(location.hostname);
  if(location.protocol!=='https:'&&!local)return;
  addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
})();
