// Mobile browser context menus are suppressed independently of world inspection.
(()=>{
  'use strict';
  document.addEventListener('contextmenu',function(e){
    if(window.matchMedia?.('(max-width:1080px)').matches)e.preventDefault();
  },{capture:true});
})();
