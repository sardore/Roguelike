// The two canvas helpers every sprite painter needs, bound to its own context: r(color,x,y,w,h) fills a rectangle,
// poly(color,points) fills a polygon. Painters take them with `const {r,poly}=drawKit(q)`.
function drawKit(q){return{r:(c,a,b,w,h)=>{q.fillStyle=c;q.fillRect(a,b,w,h)},poly:(c,pts)=>{q.fillStyle=c;q.beginPath();pts.forEach(([a,b],i)=>i?q.lineTo(a,b):q.moveTo(a,b));q.closePath();q.fill()}}}
/* Shared X-braced crate: timber grain, beveled rails and iron fasteners. */
function drawCrateX(ctx,px,py){
 ctx.save();ctx.translate(px,py);ctx.lineWidth=.7;
 ctx.fillStyle='rgba(9,7,5,.32)';ctx.fillRect(4,27,25,3);
 ctx.fillStyle='#38291c';ctx.fillRect(4,7,24,22);
 const g=ctx.createLinearGradient(5,7,27,28);g.addColorStop(0,'#94734b');g.addColorStop(.45,'#795332');g.addColorStop(1,'#533b28');ctx.fillStyle=g;ctx.fillRect(5,8,22,20);
 for(let x=10;x<27;x+=5){ctx.fillStyle='rgba(30,19,10,.46)';ctx.fillRect(x,10,.7,16);ctx.fillStyle='rgba(207,166,103,.17)';ctx.fillRect(x+1,11,.5,12)}
 ctx.strokeStyle='#332718';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(7,10);ctx.lineTo(25,26);ctx.moveTo(25,10);ctx.lineTo(7,26);ctx.stroke();
 ctx.strokeStyle='#b08b58';ctx.lineWidth=1.5;ctx.stroke();ctx.strokeStyle='rgba(231,199,139,.35)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(7,9.5);ctx.lineTo(25,25.5);ctx.stroke();
 ctx.fillStyle='#aa8453';ctx.fillRect(5,8,22,1);ctx.fillRect(5,8,1,20);ctx.fillStyle='#473421';ctx.fillRect(26,9,1,19);ctx.fillRect(5,27,22,1);
 for(const[x,y]of[[6,9],[24,9],[6,25],[24,25]]){ctx.fillStyle='#343932';ctx.fillRect(x,y,2,2);ctx.fillStyle='#b7ad8a';ctx.fillRect(x,y,1,.6)}
 ctx.restore();
}
// Shared deterministic material producer. World-aligned joints continue across tile boundaries.
const WORLD_LIGHT_ART=Object.freeze({lantern:'#f29a38',gold:'#efb846',fire:'#ee852e',water:'#60b6bd',lava:'#e76a26',portal:'#ac73d1'});
const TERRAIN_RENDER_REV=new WeakMap();
const SHARED_PROP_ART=new Map();
function drawBotanical(ctx,t,px,py,x,y,region=0){
 const tree=t===TT.GARDEN_TREE||t===TT.PEACH_TREE;const key=['plant',t,region,x%4,y%4].join(':');let c=SHARED_PROP_ART.get(key);
 if(!c){c=document.createElement('canvas');c.width=48;c.height=tree?54:48;const q=c.getContext('2d');q.scale(1.5,1.5);if(tree)q.translate(0,4);const leaf=['#55704a','#596f4d','#536953','#536652','#657455'][region]||'#55704a',pale='#8c9d69',dark='#293d2c',{r}=drawKit(q),e=(co,x,y,rx,ry)=>{q.fillStyle=co;q.beginPath();q.ellipse(x,y,rx,ry,0,0,Math.PI*2);q.fill()},line=(co,x,y,xx,yy,w=1)=>{q.strokeStyle=co;q.lineWidth=w;q.beginPath();q.moveTo(x,y);q.lineTo(xx,yy);q.stroke()};
 if(t===TT.LIGHT_GRASS){r('#43503b',0,0,32,32);for(let i=0;i<32;i++){const a=hash2(x,y,i+81),b=hash2(y,x,i+371),xx=a*32,yy=b*32;r(i%3?'rgba(146,155,100,.12)':'rgba(19,32,22,.18)',xx,yy,2,1);if(i%3===0){line(dark,xx,yy,xx-1,yy-3,.7);line(leaf,xx,yy,xx+2,yy-2,.7);r(pale,xx+1,yy-2,.5,.5)}}}
 else if(t===TT.GARDEN_TREE||t===TT.PEACH_TREE){e('rgba(9,19,14,.35)',16,28,13,3);line('#30271e',16,29,15,9,5);line('#9d794f',15,29,14,10,1.5);line('#513723',16,24,11,30,2);line('#785231',16,25,21,30,2);line('#bd965b',14,25,13,29,.8);for(const [xx,yy]of[[6,12],[25,9],[23,21],[8,21]]){line('#423e2b',16,24,xx,yy,2);line('#958264',15,22,xx,yy,.6)}for(const [xx,yy,rr]of[[8,8,7],[18,3,8],[25,11,7],[13,15,8]]){e(dark,xx,yy+2,rr,rr*.7);e(leaf,xx,yy,rr,rr*.72);for(let j=0;j<9;j++){const a=hash2(xx,yy,j+51)*6.28,dist=hash2(yy,xx,j+77)*rr,ax=xx+Math.cos(a)*dist,ay=yy+Math.sin(a)*dist*.55;line(j%3?pale:'#b0b080',ax-1,ay,ax+1.5,ay-1,.7)}}if(t===TT.PEACH_TREE)for(const [xx,yy]of[[7,7],[19,2],[26,11],[13,15],[18,11]]){e('#ba747c',xx,yy,1.8,1.6);r('#edc5ab',xx-.6,yy-1,.9,.7)}}
 else if(t===TT.FLOWERBED){e('rgba(5,13,9,.3)',16,28,13,2);r('#40362c',3,17,26,12);r('#7f7960',3,25,26,4);r('#b1a184',3,25,26,.7);r('#282b21',4,14,24,11);for(let i=0;i<12;i++){const xx=6+hash2(x,y,i+9)*20,yy=10+hash2(y,x,i+3)*13;line(dark,xx,26,xx,yy);line(leaf,xx,yy+5,xx+3,yy+2,1.7);line(pale,xx,yy+6,xx-2,yy+3,1);if(i%2===0){const co=['#c796a6','#c8b879','#a392b1'][i%3];e(co,xx-1,yy,1.6,1);e(co,xx+1,yy,1.6,1);e(co,xx,yy-1,1,1.6);r('#ecd49e',xx-.4,yy-.3,.8,.8)}}}
 else if(t===TT.LOTUS_FLOWER){e('#294736',16,22,12,5);e('#4d7250',16,21,11,4);line('#91a176',6,20,24,22,.6);for(let i=0;i<7;i++){const a=i*.8;q.save();q.translate(16,18);q.rotate(a);q.fillStyle=i%2?'#c48794':'#e0abb3';q.beginPath();q.ellipse(0,-3,2.1,5,0,0,Math.PI*2);q.fill();q.restore()}e('#e9cc8e',16,17,2.3,1.5);r('#fff0c1',15,16,1,1)}
 if(SHARED_PROP_ART.size>=1024)SHARED_PROP_ART.clear();SHARED_PROP_ART.set(key,c)}ctx.drawImage(c,px,py-(tree?4:0),32,tree?36:32);return true;
}
function drawHearthFlame(q,px,py,now,pot){
 q.save();q.translate(px,py);q.beginPath();q.rect(0,pot?24:0,32,pot?6:32);q.clip();
 const t=now/1000,base=pot?28:21,spread=pot?4.2:6.4,h=pot?6.5:13;
 const glow=q.createRadialGradient(16,base-3,1,16,base-3,pot?10:14);glow.addColorStop(0,'rgba(239,112,28,'+(.20+.035*Math.sin(t*4.1))+')');glow.addColorStop(1,'rgba(215,74,18,0)');q.fillStyle=glow;q.fillRect(1,1,30,30);
 for(let i=0;i<3;i++){
  const x=16+(i-1)*spread*.7,phase=t*5.2+i*2.1,w=pot?2.5:3.6,height=h*(.73+.18*Math.sin(phase*.79)+.09*Math.sin(phase*1.73)),lean=Math.sin(phase)*1.7;
  const g=q.createLinearGradient(x,base,x,base-height);g.addColorStop(0,'#b83c1d');g.addColorStop(.42,'#eb7e28');g.addColorStop(1,'#f9be62');q.fillStyle=g;
  q.beginPath();q.moveTo(x-w,base);q.bezierCurveTo(x-w*1.6,base-height*.38,x+lean-w*.7,base-height*.66,x+lean,base-height);q.bezierCurveTo(x+lean+.5,base-height*.56,x+w*1.4,base-height*.33,x+w,base);q.closePath();q.fill();
  q.fillStyle='#ffd38a';q.beginPath();q.moveTo(x-w*.45,base-.5);q.quadraticCurveTo(x-w*.65,base-height*.35,x+lean*.4,base-height*.58);q.quadraticCurveTo(x+w*.65,base-height*.24,x+w*.4,base-.5);q.fill();
 }
 if(!pot)for(let i=0;i<3;i++){const age=(t*.45+i*.37)%1,x=12+i*4+Math.sin(t*2+i)*age*1.5,y=18-age*15;q.globalAlpha=Math.sin(age*Math.PI)*.65;q.fillStyle=i%2?'#ef923b':'#ffc271';q.beginPath();q.ellipse(x,y,.36,.55+age*.3,0,0,Math.PI*2);q.fill()}
 q.restore();
}
function drawPotSteam(q,px,py,now){
 q.save();q.translate(px,py);q.beginPath();q.rect(0,0,32,32);q.clip();const t=now/1000;
 // Small expanding broth rings; the rim and iron body stay firmly in place.
 for(let i=0;i<3;i++){const age=(t*.63+i*.34)%1,x=12+i*3.7;q.globalAlpha=Math.sin(age*Math.PI)*.6;q.strokeStyle='#ccb57e';q.lineWidth=.45;q.beginPath();q.ellipse(x,13.7+(i%2)*.4,.25+age*1.1,.2+age*.35,0,0,Math.PI*2);q.stroke()}
 // Soft curling ribbons rise and dissolve; each plume has its own phase.
 for(let i=0;i<3;i++){const age=(t*.30+i*.34)%1,x=12+i*4+Math.sin(t*1.7+i)*age*1.3,y=11-age*8,alpha=Math.sin(age*Math.PI)*.35;
  q.globalAlpha=alpha;q.lineCap='round';q.strokeStyle='#c9c5ac';q.lineWidth=.6+age*.45;q.beginPath();q.moveTo(x,y+2);q.bezierCurveTo(x-2.5,y,x+2.5,y-1.4,x+.6,y-3);q.stroke();
  q.globalAlpha=alpha*.25;q.lineWidth=1.6+age*.9;q.stroke();
 }
 q.restore();
}
function drawSharedProp(ctx,t,px,py,region=0,variant=0,now=0,lit=true,appearance='default'){
 const supported=[TT.TABLE,TT.BENCH,TT.JAR,TT.RACK,TT.BED,TT.RUMOR_BED,TT.BOOK_STACK,TT.STONE_PILLAR,TT.STATUE,TT.ROCK,TT.LANTERN_POST,TT.GOLD_LAMP,TT.INCENSE_STAND,TT.ARMORY,TT.CACHE,TT.VAULT,TT.MIRROR,TT.ALTAR,TT.FOUNTAIN,TT.LOW_FENCE,TT.SCREEN,TT.BRAZIER,TT.COOKPOT,TT.RUMOR_WEAPON_RACK,TT.RUMOR_MED_CABINET,TT.SWITCH];
 if(!supported.includes(t))return false;
 const frame=[TT.FOUNTAIN,TT.INCENSE_STAND].includes(t)?Math.floor(now/240)%4:0,key=[t,region,variant&3,frame,lit?1:0,t===TT.MIRROR?appearance:'default'].join(':');let c=SHARED_PROP_ART.get(key);
 if(!c){c=document.createElement('canvas');c.width=c.height=48;const q=c.getContext('2d');q.scale(1.5,1.5);
 const wood=['#805638','#747050','#785345','#66513f','#7a6441'][region]||'#805638',hi=colorShift(wood,40),dark='#352a24',stone='#8c9287',metal='#b0b6a6',cloth=['#a44b32','#4f7850','#944a78','#756049','#9c7737'][region];
 const {r:rect,poly}=drawKit(q),line=(co,x,y,xx,yy,w=1)=>{q.strokeStyle=co;q.lineWidth=w;q.beginPath();q.moveTo(x,y);q.lineTo(xx,yy);q.stroke()},ellipse=(co,x,y,rx,ry)=>{q.fillStyle=co;q.beginPath();q.ellipse(x,y,rx,ry,0,0,Math.PI*2);q.fill()},grad=(x,y,w,h,a,b,d)=>{const g=q.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);g.addColorStop(.4,b);g.addColorStop(1,d);return g},panel=(x,y,w,h)=>{rect(grad(x,y,w,h,hi,wood,dark),x,y,w,h);rect(colorShift(wood,49),x,y,w,.6);rect('#231e1b',x+w-1,y+1,1,h-1);rect('#261f1b',x,y+h-1,w,1);for(let i=3;i<h;i+=4){line('rgba(31,22,18,.24)',x+1,y+i,x+w-2,y+i+.3,.5);line('rgba(227,193,135,.15)',x+2,y+i+1,x+w-3,y+i+1,.4);}},rivet=(x,y)=>{ellipse('#342f28',x,y,1,1);rect('#d4c299',x-.4,y-.6,.7,.5)};
 ellipse('rgba(7,10,14,.12)',16,28.5,14.5,3.2);ellipse('rgba(7,10,14,.25)',16,28.5,11.5,1.7);ellipse('rgba(7,10,14,.38)',16,28.7,7.5,.65);
 if(t===TT.TABLE||t===TT.BENCH){const bench=t===TT.BENCH,y=bench?15:12,w=bench?26:28;for(const x of[5,24]){panel(x,y+6,3,11);rect('#251c17',x+2,y+7,1,10)}if(bench){panel(2,y,w,7);rect('#30221b',3,y+6,w-1,2);panel(3,y-2,w-2,5);line(colorShift(wood,35),4,y-1,27,y-1,.45)}else{
  rect(grad(2,12,28,8,'#ba6043','#843929','#48211e'),2,12,28,8);rect('#3b1a16',3,19,26,2);rect(grad(3,10,26,6,'#c17a52','#9c4935','#602b26'),3,10,26,6);line('#d99e68',4,10.6,27,10.6,.7);line('#d09a62',4,18,28,18,.6);
  poly(grad(16,10,8,13,'#b95152','#8d3044','#4b2133'),[[16,10],[24,10],[24,21],[22,23],[16,22]]);line('#d5aa68',17,11,17,21,.6);line('#d5aa68',23,11,23,21,.6);
  ellipse('#402522',10,14,5,2.3);ellipse('#e4d6b4',10,13.2,4.7,2);ellipse('#99b6a4',10,13,3,.9);ellipse('#754932',10,13,1.6,.6);
  rect('#833142',21,11,4,4);ellipse('#cd7165',23,11,2,1);ellipse('#491b2e',23,11,1.1,.55);line('#ddc493',14,11,14.8,15.5,.6);line('#ddc493',15.4,11,16.2,15.5,.6);
 }}
 else if(t===TT.JAR){q.fillStyle=grad(7,8,20,21,'#a77e50','#795638','#302920');q.beginPath();q.moveTo(11,10);q.bezierCurveTo(2,16,6,28,12,29);q.lineTo(22,29);q.bezierCurveTo(29,27,30,15,22,10);q.closePath();q.fill();ellipse('#402f23',16.5,9,7.5,2.5);ellipse('#98764f',16.5,8,7.5,2);ellipse('#4e3a29',16.5,8,5,1);line('rgba(194,151,95,.4)',9,15,8,20,.7);q.strokeStyle='rgba(32,26,23,.5)';q.lineWidth=.6;q.beginPath();q.ellipse(17,19,9,3,0,0,Math.PI);q.stroke();ellipse('rgba(21,20,17,.26)',17,27,8,1.4)}
 else if(t===TT.RACK||t===TT.RUMOR_WEAPON_RACK){panel(4,4,3,25);panel(25,4,3,25);for(const yy of[7,17,26]){panel(4,yy,24,3);rect('#2c241c',6,yy+3,20,1)}if(t===TT.RACK){for(let i=0;i<6;i++){const xx=8+i*2.7,yy=10+(i%2)*10;rect(['#9c6650','#818c71','#bfaa7e'][i%3],xx,yy,2,6);rect('#decbb0',xx,yy+1,1.5,.5);line('#3b3028',xx,yy+5,xx+2,yy+5,.5)}}else for(const xx of[10,17,24]){line('#322f29',xx,11,xx-4,26,2);line('#a7b1a4',xx,8,xx-2,19,1.5);line('#bec7b8',xx,8,xx-1,13,.45);line('#957144',xx-4,20,xx+1,21,1.4)}}
 else if(t===TT.BED||t===TT.RUMOR_BED){const worn=t===TT.RUMOR_BED,cover=worn?['#98af89','#5f805a','#334d3f']:['#c27486','#91415f','#4d233c'];panel(3,5,26,5);panel(3,23,26,5);panel(3,8,3,23);panel(26,8,3,23);rect('#3d332c',6,10,20,15);rect(grad(6,9,20,8,'#e1d1ad','#bfa982','#8c775b'),6,9,20,8);rect(grad(6,15,20,12,...cover),6,15,20,12);line(worn?'#aaba8c':'#dfb26f',7,16,25,16,.8);line(worn?'#819e79':'#be6e85',9,18,8,25,.7);line(worn?'#3f6148':'#602b46',22,17,23,25,.8);rect('#d7c49f',8,10,8,4);rect('#e4d2b0',8,10,8,.6);rect('#9f8d72',8,14,8,1);if(!worn){rect('#d1a55e',18,20,5,1);rect('#d1a55e',20,18,1,5)}else{line('#b0bf96',16,20,19,22,.6);line('#b0bf96',17,19,18,23,.6)}}
 else if(t===TT.BOOK_STACK){for(let i=0;i<5;i++){const xx=4+(i%2)*3,yy=25-i*4,w=23-i;rect('#30251e',xx,yy,w,4);rect(['#785146','#55675b','#927d53'][i%3],xx,yy-1,w,1.6);rect('#c9b997',xx+2,yy+1,w-3,1.8);line('#88785f',xx+3,yy+2,xx+w-2,yy+2,.4);rect('#ae9671',xx,yy,1.3,4)}line('#ab7954',16,8,16,28,1)}
 else if(t===TT.STONE_PILLAR||t===TT.STATUE){rect(grad(5,26,22,5,'#8c9588',stone,'#384246'),5,26,22,5);rect('#bbc1a8',5,26,22,.8);rect('#39484a',5,30,22,1);rect('#a4af99',6,27,1,3);if(t===TT.STONE_PILLAR){rect(grad(10,7,12,20,'#b6baa7',stone,'#48545a'),10,7,12,20);for(const xx of[12,16,20])line('rgba(32,43,47,.26)',xx,9,xx,25,.7);rect('#475254',8,6,16,3);rect('#899582',8,4,16,3);line('#a6b095',9,4.5,22,4.5,.45)}else{poly(grad(9,7,15,20,'#b0b7a5',stone,'#48545a'),[[12,11],[20,11],[25,24],[22,27],[9,27],[7,23]]);ellipse('#8e9990',16,8,4,5);poly('#565f59',[[11,7],[16,2],[21,7],[19,9],[12,9]]);line('#a0ad97',13,12,11,22,.6);line('#48514e',18,15,20,24,1);line('#3c4440',14,8,15,8,.6);line('#3c4440',18,8,19,8,.6)}}
 else if(t===TT.ROCK){poly('#303b3e',[[3,26],[7,13],[14,6],[23,8],[29,19],[27,28],[12,30]]);poly('#85908b',[[7,13],[14,6],[23,8],[19,16],[10,20]]);poly('#5b6b69',[[19,16],[23,8],[29,19],[26,26],[18,25]]);poly('#455350',[[10,20],[19,16],[18,25],[12,30],[3,26]]);line('#a0a493',8,13,14,7,.7);line('#33413e',14,13,12,17,.6);rect('#697953',7,25,7,2)}
 else if(t===TT.LANTERN_POST||t===TT.GOLD_LAMP){const gold=t===TT.GOLD_LAMP;panel(14,13,4,16);panel(10,27,12,3);rect('#302921',8,4,17,3);rect(gold?'#b78a31':'#ac4822',9,6,15,11);rect(lit?grad(10,6,13,11,gold?'#fff0a0':'#ffe39a',gold?WORLD_LIGHT_ART.gold:WORLD_LIGHT_ART.lantern,gold?'#bd7728':'#bf5224'):grad(10,6,13,11,'#805e3d','#563d2e','#352b28'),10,6,13,11);if(lit)rect('#fff1bd',13,8,3,6);for(const xx of[10,16,23])rect(gold?'#6f5e39':'#705137',xx,6,.7,11);line('#7b5937',10,12,23,12,.6);poly('#5b4b35',[[7,5],[11,1],[22,1],[26,5]]);line('#b29a68',9,3,24,3,.7);rect('#dac28d',12,18,9,1);rivet(16,28)}
 else if(t===TT.BRAZIER||t===TT.INCENSE_STAND){const fire=t===TT.BRAZIER;for(const xx of[9,21])rect('#443c2e',xx,23,2,6);ellipse('#756950',16,22,11,4);ellipse('#b5a477',16,20,11,3);ellipse('#443c2e',16,20,8,1.8);if(!fire&&lit){for(const xx of[12,16,20]){line('#c8a973',xx,20,xx,10-(xx%3));rect('#c57948',xx-.4,9-(xx%3),.8,1)}q.strokeStyle='rgba(193,190,171,.5)';q.lineWidth=.6;q.beginPath();q.moveTo(16,8);q.bezierCurveTo(9+frame,5,23-frame,4,17,1);q.stroke()}}
 else if(t===TT.COOKPOT){q.save();q.scale(2/3,2/3);const rect48=(x,y,w,h,co)=>{q.fillStyle=co;q.fillRect(x,y,w,h)};
      // Foreground-only: retain the actual room substrate beneath the hearth.
      q.fillStyle='rgba(10,8,7,.38)';q.beginPath();q.ellipse(24,41,18,4,0,0,Math.PI*2);q.fill();
      rect48(10,38,29,4,'#392a20');rect48(14,35,23,4,'#513b27');rect48(13,38,20,1,'#997041');
      q.strokeStyle='#a2a696';q.lineWidth=2;for(const a of[10,38]){q.beginPath();q.ellipse(a,23,4,4,0,0,Math.PI*2);q.stroke()}
      const metal=q.createLinearGradient(10,0,37,0);metal.addColorStop(0,'#333c3a');metal.addColorStop(.25,'#7c8780');metal.addColorStop(.55,'#505b56');metal.addColorStop(1,'#202b29');
      q.fillStyle=metal;q.beginPath();q.moveTo(10,20);q.lineTo(38,20);q.lineTo(35,32);q.quadraticCurveTo(24,40,13,32);q.closePath();q.fill();
      q.fillStyle='#a6afa0';q.beginPath();q.ellipse(24,20,14,5,0,0,Math.PI*2);q.fill();q.fillStyle='#1d2926';q.beginPath();q.ellipse(24,20,11.5,3,0,0,Math.PI*2);q.fill();
      q.fillStyle='#726e45';q.beginPath();q.ellipse(24,21,10,2,0,0,Math.PI*2);q.fill();rect48(18,20,3,1,'#baab72');rect48(27,21,2,1,'#bb9e64');
      q.restore();
 }
 else if([TT.ARMORY,TT.CACHE,TT.VAULT].includes(t)){const vault=t===TT.VAULT,cache=t===TT.CACHE,rim=vault?'#edc568':cache?'#b7c578':'#c29c62',body=vault?['#d0a44c','#977032','#514022']:cache?['#92ad71','#5d794d','#304a35']:['#bea078',wood,dark];
  if(!vault&&!cache)panel(5,14,23,14);else rect(grad(5,14,23,14,...body),5,14,23,14);poly(grad(5,8,23,8,...body),[[5,14],[8,8],[25,8],[28,14]]);line(body[0],9,8.7,24,8.7,.7);
  for(const xx of[8,23]){rect(rim,xx,9,2,18);rivet(xx+1,17);rivet(xx+1,25)}rect(vault?'#59431f':cache?'#293f2c':'#251e18',6,16,21,1);rect(rim,14,14,5,6);rect('#332e22',16,16,1,3);
  if(vault){rect('#694923',11,21,11,5);line('#dfb957',11,21,21,21,.6);poly('#e6bf65',[[16,21],[19,23],[16,25],[13,23]]);line('rgba(255,224,143,.45)',11,11,20,11,.6)}else if(cache){rect('#bad086',11,22,10,1);rect('#bad086',15.5,19,1,7)}
 }
 else if(t===TT.MIRROR){
  const P=appearance==='black'?{foot:['#5c5369','#332938','#15121c'],back:'#100d17',rim:['#8e7b99','#43374e','#17121f'],edge:'#aa94b6',glass:['#594762','#24182d','#0b0812'],shine:'rgba(201,174,226,.30)',gleam:'#a893b6',shade:'#211328',crest:'#746180',stud:'#9c849c',base:'#59465e'}:appearance==='red'?{foot:['#b56858','#76372e','#3b211f'],back:'#43221f',rim:['#e6a08a','#aa584a','#592a28'],edge:'#edc0aa',glass:['#f1c6b8','#c28178','#794749'],shine:'rgba(255,236,219,.48)',gleam:'#ffe0ca',shade:'#713c3b',crest:'#df9279',stud:'#dba38d',base:'#c1876f'}:{foot:['#a879ac','#614366','#302439'],back:'#39263f',rim:['#cc9abe','#855488','#412d52'],edge:'#d0b0cf',glass:['#e2d9ef','#ae96c0','#685879'],shine:'rgba(248,231,255,.48)',gleam:'#e6c9e9',shade:'#65416e',crest:'#d8a3c6',stud:'#c69dbc',base:'#bc8bac'};
  rect(grad(7,26,19,4,...P.foot),7,26,19,4);poly(P.back,[[8,5],[12,2],[22,2],[25,5],[25,27],[8,27]]);rect(grad(9,4,15,23,...P.rim),9,4,15,23);rect(P.edge,10,5,13,1);rect(grad(11,6,11,19,...P.glass),11,6,11,19);poly(P.shine,[[11,7],[14,6],[22,16],[22,21]]);line(P.gleam,12,8,12,21,.8);line(P.shade,21.5,7,21.5,24,.6);poly(P.crest,[[16,2],[18,4],[16,6],[14,4]]);for(const yy of[8,23]){rect(P.stud,9,yy,1,1);rect(P.stud,23,yy,1,1)}line(P.base,9,27,24,27,.7);
 }
 else if(t===TT.ALTAR){rect(grad(5,23,23,6,'#a35f53','#773d39','#3d2429'),5,23,23,6);rect(grad(8,16,17,8,'#b56f60','#87473e','#48282f'),8,16,17,8);rect('#c1826b',7,15,19,2);poly(grad(12,16,9,11,'#b54f5c','#7f2c42','#442035'),[[12,16],[21,16],[21,25],[17,27],[12,25]]);line('#c59c67',13,17,13,24,.6);line('#c59c67',20,17,20,24,.6);rect('#532d32',6,28,21,1);ellipse('#b7a479',16,13,5,2);rect('#ead3a4',15,7,2,6);ellipse('#ffe2a1',16,6,1,2);line('#ca8c72',6,24,10,24,.6);line('#bd7d65',23,24,26,24,.6)}
 else if(t===TT.FOUNTAIN){ellipse('#35474a',16,25,13,5);ellipse('#7d9987',16,23,13,5);ellipse('#375c63',16,23,10,3);ellipse(WORLD_LIGHT_ART.water,16,23,8,2);rect(grad(13,8,6,16,'#98b39e','#6d9387','#3d585e'),13,8,6,15);ellipse('#92b5a2',16,8,5,2);line('#a1d3c1',16,9,16+Math.sin(frame),21,.7);line('#8ac5b5',7,24,12,24,.5);line('#8ac5b5',20,22,25,22,.5)}
 else if(t===TT.LOW_FENCE){for(const xx of[4,14,24]){panel(xx,9,3,20);poly(hi,[[xx,9],[xx+1.5,6],[xx+3,9]])}panel(2,14,28,3);panel(2,22,28,3);for(const xx of[5,15,25])rivet(xx,15)}
 else if(t===TT.SCREEN){const silk=region===2?['#b776a5','#7c3c72','#422742']:['#c97a61','#984536','#542b2c'];for(let i=0;i<3;i++){const xx=3+i*9;panel(xx,4+(i===1?0:1),9,24);rect(grad(xx+1,6,7,20,...silk),xx+1,6,7,20);line('#ceac77',xx+1.5,7,xx+7,7,.6);line('#ceac77',xx+1.5,25,xx+7,25,.6);line('#452a36',xx+2,23,xx+5,11,.8);line('#617d63',xx+3,18,xx+6,16,1);ellipse(region===2?'#dfb0c7':'#e0b78c',xx+4.5,12,1.2,1.3);ellipse(region===2?'#c895b8':'#d7a775',xx+3,19,1,.8);rect(dark,xx,27,2,4);line('rgba(242,189,188,.18)',xx+1.4,9,xx+1.4,23,.5)}}
 else if(t===TT.RUMOR_MED_CABINET){rect('#293c36',5,5,23,24);rect(grad(5,4,22,25,'#a3b69d','#7b9281','#40554c'),5,4,21,24);rect('#bbcab0',5,4,21,1);rect('#354b43',25,5,2,23);rect('#33473d',6,27,20,2);rect('#2c4038',7,7,17,10);rect('#bfd0b3',8,7,15,.6);rect(grad(9,8,14,7,'#b8ccb0','#95b49e','#678c77'),9,8,14,7);rect('#8e493b',15,8,2,7);rect('#8e493b',12,10,8,2);for(const yy of[18,23]){rect('#334b40',8,yy,16,4);rect('#668271',9,yy,14,3);rect('#bfd0ac',9,yy,14,.5);rect('#302d22',14,yy+1,4,1.2);rect('#dbc99c',14,yy+1,4,.6)}rect('#24372e',7,29,3,1.5);rect('#24372e',22,29,3,1.5);line('#a1b99f',6,5,26,5,.5)}
 else if(t===TT.SWITCH){
  // A pressure mechanism is a low iron treadle, never a standing lever.
  const down=!!(variant&1),active=!!(variant&2),drop=down?2:0;
  poly('#182328',[[3,15],[6,11],[26,11],[29,16],[27,27],[5,27]]);
  poly('#35454b',[[4,15],[7,12],[25,12],[28,16],[25,25],[7,25]]);
  line('#73827d',7,12.5,24,12.5,.75);line('#101d24',6,25,26,25,1);
  for(const xx of[6,25]){rect('#b5a078',xx,15,1,1);rect('#8e805f',xx,23,1,1);}
  poly(down?'#25343b':'#28363d',[[8,14+drop],[24,14+drop],[24,22],[22,25],[9,25],[7,22]]);
  poly(grad(8,12+drop,16,10,'#9baaa0','#6c817b','#405a59'),[[9,12+drop],[23,12+drop],[25,16+drop],[23,21+drop],[9,21+drop],[7,17+drop]]);
  line('#bac2ab',9,12.5+drop,22,12.5+drop,.7);line('#334d50',9,21+drop,23,21+drop,.8);
  for(const yy of[15,18]){line('#364d50',10,yy+drop,22,yy+drop,.65);line('#91a29b',10,yy+.75+drop,22,yy+.75+drop,.35);}
  rect('#263735',12,13+drop,8,2);rect('#b59b66',13,13+drop,6,.6);
  rect('#152a2d',12,24,8,2);rect(active?'#a6bda3':'#8c7350',14,24,4,1);rect(active?'#6f9986':'#baa070',14,24,4,.45);
 }
 if(SHARED_PROP_ART.size>=1024)SHARED_PROP_ART.clear();SHARED_PROP_ART.set(key,c);
 }
 ctx.drawImage(c,px,py,32,32);
 if(lit&&(t===TT.BRAZIER||t===TT.COOKPOT))drawHearthFlame(ctx,px,py,now,t===TT.COOKPOT);
 if(lit&&t===TT.COOKPOT)drawPotSteam(ctx,px,py,now);
 return true;
}
function actorSpriteCanvas(actor=null,resolution=1){const c=document.createElement('canvas'),pad=actor?.weapon||actor?.palaceActor105==='king';c.actorResolution105=Math.max(1,resolution);c.width=(pad?48:32)*c.actorResolution105;c.height=(pad?48:36)*c.actorResolution105;c.actorFrame105={x:pad?8:0,y:pad?12:0,w:32,h:36};const q=c.getContext('2d');q.imageSmoothingEnabled=false;q.scale(c.actorResolution105,c.actorResolution105);q.translate(c.actorFrame105.x,c.actorFrame105.y);return[c,q];}
function actorSpriteRect(c,x,y,scale=1){const f=c.actorFrame105||{x:0,y:0,w:32,h:36};return{x:x+16-f.w*scale/2-f.x*scale,y:y+32-(f.h+f.y)*scale,w:c.width/(c.actorResolution105||1)*scale,h:c.height/(c.actorResolution105||1)*scale};}
function drawHeldWeapon(q,p,dir='down',attack=false,pose=null){
  const w=p?.weapon,art=globalThis.__MANRU_ITEM_ART_R7__;if(!w?.name||!art)return;
  const asset=art.weaponAsset(w),left=dir==='left',ranged=asset.ranged;
  const parts=asset.parts||[asset];
  for(let i=0;i<parts.length;i++){
    const part=parts[i],paired=parts.length>1,handX=pose?(paired?(i?pose.right:pose.left):pose.right)[0]:paired?(i?24:7):(left?7:24),handY=pose?(paired?(i?pose.right:pose.left):pose.right)[1]:dir==='up'?25:27;
    const angle=ranged?(left?Math.PI:0):(left?-Math.PI/2-.12:-Math.PI/2+.12)+(attack?(left?-.22:.22):0),rot=angle-part.axis;
    const co=Math.cos(rot),si=Math.sin(rot),corners=[[part.bounds.x,part.bounds.y],[part.bounds.right,part.bounds.y],[part.bounds.x,part.bounds.bottom],[part.bounds.right,part.bounds.bottom]].map(([x,y])=>{x-=part.grip.x;y-=part.grip.y;return [x*co-y*si,x*si+y*co]});
    let scale=asset.size/Math.max(part.bounds.right-part.bounds.x,part.bounds.bottom-part.bounds.y);
    const frame=q.canvas.actorFrame105||{x:0,y:0};const loX=1-frame.x,hiX=q.canvas.width-1-frame.x,loY=1-frame.y,hiY=q.canvas.height-1-frame.y;for(const [x,y]of corners){if(x>0)scale=Math.min(scale,(hiX-handX)/x);else if(x<0)scale=Math.min(scale,(handX-loX)/-x);if(y>0)scale=Math.min(scale,(hiY-handY)/y);else if(y<0)scale=Math.min(scale,(handY-loY)/-y);}
    q.save();q.imageSmoothingEnabled=false;q.translate(handX,handY);q.rotate(rot);q.scale(scale,scale);q.drawImage(part.canvas,-part.grip.x,-part.grip.y);q.restore();
  }
}
function drawMenuLight(q,x,y,light){
  const r=light.radius,g=q.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(255,231,153,${.48*light.energy})`);
  g.addColorStop(.10,`rgba(255,201,83,${.44*light.energy})`);
  g.addColorStop(.28,`rgba(255,132,24,${.4752*light.energy})`);
  g.addColorStop(.50,`rgba(255,99,12,${.3344*light.energy})`);
  g.addColorStop(.76,`rgba(226,68,8,${.1232*light.energy})`);g.addColorStop(1,'rgba(226,68,8,0)');
  q.fillStyle=g;q.fillRect(x-r,y-r,r*2,r*2);
}
function drawMartialVisual(now){
 if(!state)return;const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),z=cam.zoom||1;
 if(MARTIAL_VISUAL.run!==state){MARTIAL_VISUAL.run=state;MARTIAL_VISUAL.events=[]}
 const events=MARTIAL_VISUAL.events=MARTIAL_VISUAL.events.filter(e=>now-e.start<e.life);
 X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
 const polygon=(x,y,r,n,angle=0)=>{X.beginPath();for(let i=0;i<n;i++){const a=angle+i*Math.PI*2/n;if(i)X.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);else X.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}X.closePath()};
 const cx=cam.x+(VIS.playerX*32+16)*z,cy=cam.y+(VIS.playerY*32+16)*z;
 if(state.player.guardReady1005>0){X.strokeStyle='#c6c6a5';X.globalAlpha=.6;X.lineWidth=z;polygon(cx,cy,17*z,6,Math.PI/6);X.stroke();X.globalAlpha=1}
 for(const e of events){if(!state.visible.has(k(Math.floor(e.x),Math.floor(e.y))))continue;const t=(now-e.start)/e.life,x=cam.x+(e.x*32+16)*z,y=cam.y+(e.y*32+16)*z,r=(8+18*t)*z;X.globalAlpha=Math.max(0,1-t);X.strokeStyle=e.color;X.fillStyle=e.color;X.lineWidth=Math.max(1,2*z);
  if(e.kind==='guard'){polygon(x,y,r,6,Math.PI/6);X.stroke();polygon(x,y,r*.68,6,Math.PI/6);X.lineWidth=z;X.stroke()}
  else if(e.kind==='echo'){for(let i=0;i<3;i++){X.beginPath();X.ellipse(x,y+5*z,r+i*5*z,(r+i*5*z)*.48,0,0,Math.PI*2);X.stroke()}}
  else if(e.kind==='darkcloud'||e.kind==='cloud'){for(let i=0;i<4;i++){X.globalAlpha=(1-t)*.25;X.beginPath();X.ellipse(x+(i-1.5)*7*z,y-Math.sin(i+t*4)*5*z,9*z,4*z,0,0,Math.PI*2);X.fill();X.globalAlpha=(1-t)*.7;X.beginPath();X.arc(x,y,12*z+i*2*z,t*2+i,2+t*2+i);X.stroke()}}
  else if(e.kind==='assassin'){X.beginPath();X.moveTo(x-r,y+r*.6);X.lineTo(x+r,y-r*.6);X.moveTo(x-r*.5,y-r);X.lineTo(x+r*.5,y+r);X.stroke();polygon(x,y,7*z,4,Math.PI/4);X.stroke()}
  else if(e.kind==='collision'){for(let i=0;i<9;i++){const a=i*2.399,r0=(5+t*24)*z,xx=x+Math.cos(a)*r0,yy=y+Math.sin(a)*r0+t*t*9*z;X.fillStyle=e.tones[i%3];polygon(xx,yy,(2+(i%2))*z,3,a+t*4);X.fill()}}
  else if(e.kind==='drive'||e.kind==='divine'){const dx=e.dx||1,dy=e.dy||0;for(let i=0;i<3;i++){const xx=x-dx*i*6*z,yy=y-dy*i*6*z;X.beginPath();X.moveTo(xx-dx*7*z-dy*4*z,yy-dy*7*z+dx*4*z);X.lineTo(xx+dx*5*z,yy+dy*5*z);X.lineTo(xx-dx*7*z+dy*4*z,yy-dy*7*z-dx*4*z);X.stroke()}}
  else if(e.kind==='warning'){polygon(x,y,13*z,4,Math.PI/4);X.stroke();X.fillRect(x-z,y-6*z,2*z,8*z);X.fillRect(x-z,y+5*z,2*z,2*z)}
  else if(e.kind==='burst'){for(let i=0;i<8;i++){const a=i*Math.PI/4;X.beginPath();X.moveTo(x+Math.cos(a)*r*.3,y+Math.sin(a)*r*.3);X.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);X.stroke()}X.lineWidth=z;X.beginPath();X.arc(x,y,r*.8,0,Math.PI*2);X.stroke()}
  else{polygon(x,y,r,4,Math.PI/4);X.stroke();polygon(x,y,r*.7,4,0);X.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;X.fillRect(x+Math.cos(a)*r-1*z,y+Math.sin(a)*r-1*z,2*z,2*z)}}
 }X.restore();
}
const PRESENTATION_UPDATES=new Map([['effects',effectsUpdate],['monster-motion',monsterMotionUpdate],['martial965',martialPulseUpdate]]);
const PresentationState=Object.freeze({
  
  advance(now){for(const update of PRESENTATION_UPDATES.values())update(now)},
  cache(){return Object.freeze({monsterMotion:MON_VIS,effects:FX})}
});
let forcedMotionUntil=0;
const FORCED_MOTION_TILE_MS=96;
function forcedMotionSample(m,now=performance.now()){
  if(!m||!Array.isArray(m.points)||m.points.length<2)return null;
  const duration=Math.max(1,m.duration||1),first=m.points[0],last=m.points[m.points.length-1],elapsed=now-m.start;
  if(elapsed<=0)return{x:first.x,y:first.y,done:false,progress:0};
  if(elapsed>=duration)return{x:last.x,y:last.y,done:true,progress:1};
  const u=Math.max(0,Math.min(1,elapsed/duration)),ease=u*u*u*(u*(u*6-15)+10),distance=ease*m.length;
  for(const seg of m.segments){
    if(distance>seg.end)continue;
    const t=seg.length>0?(distance-seg.start)/seg.length:1;
    return{x:seg.a.x+(seg.b.x-seg.a.x)*t,y:seg.a.y+(seg.b.y-seg.a.y)*t,done:false,progress:u};
  }
  return{x:last.x,y:last.y,done:false,progress:u};
}
function beginForcedMotion(entity,points,now=performance.now()){
  if(!state||!entity||!points?.length)return false;
  const player=entity===state.player;let visual=null,start;
  if(player){
    visual=forcedMotionSample(VIS.forced105,now);start=visual?{x:visual.x,y:visual.y}:{x:VIS.playerX,y:VIS.playerY};
  }else{
    let v=MON_VIS.get(entity);if(!v){v={x:entity.x,y:entity.y,last:now};MON_VIS.set(entity,v)}
    visual=forcedMotionSample(v.forced105,now);if(visual){v.x=visual.x;v.y=visual.y}start={x:v.x,y:v.y};
  }
  const path=[start];
  for(const q of points){const last=path[path.length-1];if(!last||Math.abs(q.x-last.x)>.0001||Math.abs(q.y-last.y)>.0001)path.push({x:q.x,y:q.y})}
  if(path.length<2)return false;
  const segments=[];let length=0;
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],segment=Math.hypot(b.x-a.x,b.y-a.y);if(segment<=.0001)continue;segments.push({a,b,length:segment,start:length,end:length+segment});length+=segment}
  if(!segments.length)return false;
  const rate=Math.max(.5,automationPresentationRate70()),duration=Math.max(110,length*FORCED_MOTION_TILE_MS)/rate,motion={points:path,segments,length,start:now,duration};
  if(player)VIS.forced105=motion;else{const v=MON_VIS.get(entity);v.forced105=motion;v.last=now}
  forcedMotionUntil=Math.max(forcedMotionUntil,now+duration);return true;
}
function rarityColor(r){
  if(r==="artifact") return "#ef8b45";
  if(r==="sealed") return "#b75d49";
  if(r==="relic") return "#d4aa55";
  if(r==="rare") return "#74a286";
  return "#cabb9c";
}
// Health and combat amounts are whole units; fractional stat/rate calculations remain untouched.
function displayHealth(value){const n=Number(value);return Number.isFinite(n)?String(n>0?Math.max(1,Math.round(n)):0):'—'}
function impact(x,y,color="#f0d6d6",power=3){
  burst(x,y,color,10,power*.28);
  FX.rings.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2,color,start:performance.now(),life:270,power});
  FX.shakePower=Math.max(FX.shakePower,power);
  FX.shakeUntil=performance.now()+110;
}
function flash(color="#ffffff",ms=70){
  FX.flashColor=color;FX.flashUntil=performance.now()+ms;
}
function snareEvent(x,y,disarm=false,entity=state.player){
  if(!disarm&&!entity){const silk=state.silkTraps57?.[k(x,y)];setTerrainTile58(state.map,x,y,silk?.base??TT.FLOOR);if(silk)delete state.silkTraps57[k(x,y)];burst(x,y,'#c9aac0',12,.6);addLog('돌에 걸린 함정이 허공을 조이며 풀렸다.');return true}
  const silk=state.silkTraps57?.[k(x,y)];
  if(silk){if(disarm&&!canDisarmSilkTrap57(x,y))return false;setTerrainTile58(state.map,x,y,silk.base);delete state.silkTraps57[k(x,y)];if(disarm){addLog('비단 함정을 조심스럽게 걷어 냈다.');return true}const dmg=damageEntity(entity,Math.max(1,Math.floor(entity.hp*.5)));if(dmg>0){floatText(x,y,`비단 -${dmg}`,'#e79db8',14);addLog(`날카로운 비단 함정이 조인다. -${dmg} HP`);}if(entity.hp<=0){if(entity===state.player)die('비단 함정');else killMonster(entity)}return true}
  if(disarm)return false;
  setTerrainTile58(state.map,x,y,TT.FLOOR);
  if(entity===state.player){applyHostileStatus('weaken',5,1,{stagger:true});state.status.evade=0}else setMonsterWeakened(entity,5);
  burst(x,y,"#aac3ff",12,.8);
  addLog("구속진 발동. 몸이 무거워진다.");
}
function slashFX(x0,y0,x1,y1,color="#f0d6d6",kind="melee"){
  FX.slashes.push({
    x0:x0*TILE+TILE/2,y0:y0*TILE+TILE/2,
    x1:x1*TILE+TILE/2,y1:y1*TILE+TILE/2,
    color,start:performance.now(),life:180,kind
  });
}
function projectileFX(x0,y0,x1,y1,color="#c9a6ff",opts={}){
  const ammo=state?._activeAmmo967;
  const projectile={
    x0:x0*TILE+TILE/2,y0:y0*TILE+TILE/2,
    x1:x1*TILE+TILE/2,y1:y1*TILE+TILE/2,
    color:opts.kind==='gas'?color:ammo?.color||color,start:performance.now(),life:opts.life||220,arrow984:!!ammo&&opts.kind!=='gas',kind:opts.kind||null,size:opts.size||0
  };FX.projectiles.push(projectile);return projectile;
}
function drawCombatProjectile(q,pj,now){
 const t=(now-pj.start)/pj.life;if(t<0||t>=1)return;const x=pj.x0+(pj.x1-pj.x0)*t,y=pj.y0+(pj.y1-pj.y0)*t;q.save();q.globalAlpha=1;
 if(pj.kind==='gas'){
  const dx=pj.x1-pj.x0,dy=pj.y1-pj.y0,len=Math.max(.001,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,r=pj.size||14;
  for(let i=4;i>=0;i--){const lag=i*r*.6,cx=x-ux*lag,cy=y-uy*lag,size=r*(1-i*.12),g=q.createRadialGradient(cx,cy,1,cx,cy,size*1.7);g.addColorStop(0,'#d9b2e4aa');g.addColorStop(.5,'#995db775');g.addColorStop(1,'#49345600');q.globalAlpha=1-i*.13;q.fillStyle=g;q.beginPath();q.arc(cx,cy,size*1.7,0,Math.PI*2);q.fill();}
  for(let i=0;i<6;i++){const a=i*Math.PI/3+now/210,cx=x+Math.cos(a)*r*.48,cy=y+Math.sin(a)*r*.38,g=q.createRadialGradient(cx,cy,1,cx,cy,r*.85);g.addColorStop(0,'#e9c3f0');g.addColorStop(.4,'#a776bccc');g.addColorStop(1,'#64427500');q.globalAlpha=.82;q.fillStyle=g;q.beginPath();q.arc(cx,cy,r*.85,0,Math.PI*2);q.fill();}
  q.globalAlpha=.7;q.strokeStyle='#efcdf6';q.lineWidth=1.2;q.beginPath();q.ellipse(x,y,r*.63,r*.28,now/260,Math.PI*.1,Math.PI*1.55);q.stroke();
 }else if(pj.arrow984){
  const dx=pj.x1-pj.x0,dy=pj.y1-pj.y0,len=Math.max(.001,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,px=-uy,py=ux;
  q.strokeStyle=pj.color;q.lineWidth=2;q.beginPath();q.moveTo(x-ux*9,y-uy*9);q.lineTo(x+ux*5,y+uy*5);q.stroke();
  q.fillStyle=pj.color;q.beginPath();q.moveTo(x+ux*8,y+uy*8);q.lineTo(x+ux*3+px*3.6,y+uy*3+py*3.6);q.lineTo(x+ux*3-px*3.6,y+uy*3-py*3.6);q.closePath();q.fill();
  q.strokeStyle='#8d5b3c';q.lineWidth=1.2;q.beginPath();q.moveTo(x-ux*8,y-uy*8);q.lineTo(x-ux*5+px*3,y-uy*5+py*3);q.moveTo(x-ux*8,y-uy*8);q.lineTo(x-ux*5-px*3,y-uy*5-py*3);q.stroke();
 }else{q.fillStyle=pj.color;q.beginPath();q.arc(x,y,3.2,0,Math.PI*2);q.fill();}
 if(pj.kind!=='gas'){q.globalAlpha=.22*(1-t);q.strokeStyle=pj.color;q.lineWidth=1;q.beginPath();q.moveTo(pj.x0,pj.y0);q.lineTo(x,y);q.stroke();}q.restore();
}
function doorFX(x,y){
  FX.doors.push({x,y,start:performance.now(),life:300});
}
function actionPose(now=performance.now()){
 const a=ACTION_PRESENTATION58;if(a.run!==state||now>=a.until)return null;
 const t=Math.max(0,Math.min(1,(now-a.start)/(a.until-a.start))),f=state.player.facing||{x:0,y:1},dx=(a.target?.x??a.source.x+f.x)-a.source.x,dy=(a.target?.y??a.source.y+f.y)-a.source.y,len=Math.hypot(dx,dy)||1;
 return{a,t,dx:dx/len,dy:dy/len,reach:t<.22?8*(1-Math.pow(1-t/.22,3)):8*Math.pow(1-(t-.22)/.78,2)};
}
function actorPresentationPoint(entity,player=false,now=performance.now()){
 const base=player?{x:VIS.playerX,y:VIS.playerY}:v8CreatureCoords(entity),pose=actionPose(now);
 let x=base.x*TILE+TILE/2,y=base.y*TILE+TILE/2;
 if(player&&pose){if(pose.a.kind==='attack'){x+=pose.dx*pose.reach;y+=pose.dy*pose.reach}else y-=Math.sin(Math.PI*pose.t)*3}
 const struck=!player&&pose?.a.entity===entity&&pose.a.hit;
 if(struck){const kick=Math.sin(Math.min(1,pose.t/.8)*Math.PI)*4;x+=pose.dx*kick;y+=pose.dy*kick}
 if(!struck&&!player){if((entity.hitUntil||0)>now)x+=Math.sin(now/18)*1.2;if((entity.evadeUntil||0)>now)x+=Math.sin(now/22)*1.4;if((entity.attackUntil||0)>now&&entity.attackTarget){const t=clamp((entity.attackUntil-now)/150,0,1);x+=Math.sign(entity.attackTarget.x-entity.x)*(1-t)*2;y+=Math.sign(entity.attackTarget.y-entity.y)*(1-t)*1.4}}
 else if(player&&!pose&&(state.playerHitUntil||0)>now)x+=Math.sin(now/18)*1.2;
 return{x,y};
}
function actionFrame(now=performance.now()){
 const pose=actionPose(now);if(!pose)return null;
 const source=actorPresentationPoint(state.player,true,now),target=pose.a.entity?actorPresentationPoint(pose.a.entity,false,now):source;
 return{...pose,source,target};
}
function drawActionPresentation(now){
 const frame=actionFrame(now);if(!frame)return;const{a,t,source,target}=frame,px=source.x,py=source.y,tx=target.x,ty=target.y;
 X.save();X.lineCap='round';X.globalAlpha=Math.max(0,1-t);
 if(a.kind==='attack'&&a.target){
  const angle=Math.atan2(ty-py,tx-px),dist=Math.hypot(tx-px,ty-py),ux=Math.cos(angle),uy=Math.sin(angle);
  X.strokeStyle=a.crit||a.strong?'#ffe09a':'#f3dab0';X.fillStyle='#fff0c4';
  if(a.weapon==='bow'){
   const head=Math.min(1,t/.4)*dist;X.lineWidth=1.5;X.beginPath();X.moveTo(px+ux*Math.max(0,head-15),py+uy*Math.max(0,head-15));X.lineTo(px+ux*head,py+uy*head);X.stroke();
  }else if(a.weapon==='spear'){
   X.lineWidth=2.5;X.beginPath();X.moveTo(px,py);X.lineTo(tx,ty);X.stroke();X.beginPath();X.moveTo(tx+ux*4,ty+uy*4);X.lineTo(tx-ux*5-uy*3,ty-uy*5+ux*3);X.lineTo(tx-ux*5+uy*3,ty-uy*5-ux*3);X.closePath();X.fill();
  }else if(a.weapon==='brawl'||a.weapon==='blunt'){
   X.lineWidth=2*(1-t)+.5;X.beginPath();X.moveTo(px+ux*8,py+uy*8);X.lineTo(tx,ty);X.stroke();X.beginPath();X.ellipse(tx,ty,4+t*9,4+t*9,0,0,Math.PI*2);X.stroke();
  }else{
   X.save();X.translate(tx,ty);X.rotate(angle);const sweep=-1.1+t*2.4;for(let i=0;i<3;i++){X.strokeStyle=['#a86b38','#e7ba75','#fff2cc'][i];X.lineWidth=5-i*1.6;X.beginPath();X.arc(-10,0,10+i,Math.max(-1.2,sweep-1),sweep);X.stroke()}X.restore();
  }
  const hitStart=a.weapon==='bow'?.4:0;
  if(a.hit&&t>=hitStart){const v=(t-hitStart)/(1-hitStart);X.globalAlpha=1-v;X.strokeStyle=a.crit||a.strong?'#ffe09a':'#fff1cc';X.lineWidth=1.5;for(let i=0;i<6;i++){const k=i*Math.PI/3+.2;X.beginPath();X.moveTo(tx+Math.cos(k)*(3+v*3),ty+Math.sin(k)*(3+v*3));X.lineTo(tx+Math.cos(k)*(7+v*8),ty+Math.sin(k)*(7+v*8));X.stroke()}}
 }else{X.globalAlpha=(1-t)*.8;X.strokeStyle='#b4e0c0';X.lineWidth=1.5;X.beginPath();X.ellipse(px,py+10,8+17*t,4+8*t,0,0,Math.PI*2);X.stroke();for(let i=0;i<4;i++){X.fillStyle='#f3d79f';X.fillRect(px-9+i*6,py+4-t*19+(i%2)*4,2,3)}}
 X.restore();
}
function lightAt(x,y){return elementMaterial105(state.map[y]?.[x],'light')||(state.decor||[]).some(d=>d.x===x&&d.y===y&&['lantern','brazier','lampstand'].includes(d.kind))||(state.legendDecor47||[]).some(d=>d.x===x&&d.y===y&&d.kind==='light')||(state.branchTerrain105?.mine105?.lanterns||[]).some(l=>l.x===x&&l.y===y)||(state.branchTerrain105?.dojo?.lanterns||[]).some(l=>l.x===x&&l.y===y)}
let structureMotionUntil=0;
function structureMotionSample(m,now=performance.now()){
  if(!m)return null;const duration=Math.max(1,m.duration||1),elapsed=now-m.start;
  if(elapsed<=0)return{x:m.from.x,y:m.from.y,vx:m.vx||0,vy:m.vy||0,done:false};
  if(elapsed>=duration)return{x:m.x,y:m.y,vx:0,vy:0,done:true};
  const u=Math.max(0,Math.min(1,elapsed/duration)),u2=u*u,u3=u2*u,h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2;
  const vx0=m.vx||0,vy0=m.vy||0,x=h00*m.from.x+h10*duration*vx0+h01*m.x,y=h00*m.from.y+h10*duration*vy0+h01*m.y;
  const dh00=6*u2-6*u,dh10=3*u2-4*u+1,dh01=-6*u2+6*u;
  return{x,y,vx:(dh00*m.from.x+dh10*duration*vx0+dh01*m.x)/duration,vy:(dh00*m.from.y+dh10*duration*vy0+dh01*m.y)/duration,done:false};
}
function structureVisualPosition(key,x,y,now=performance.now()){
  const motions=STRUCTURE_MOTION105.get(state.map),m=motions?.get(key);if(!m)return{x,y};
  if(m.x!==x||m.y!==y){motions.delete(key);return{x,y}}
  const sample=structureMotionSample(m,now);if(!sample||sample.done){motions.delete(key);return{x,y}}
  return{x:sample.x,y:sample.y};
}
function drawElementAttacks(now){
 FX.elementAttacks105=(FX.elementAttacks105||[]).filter(f=>f.map===state.map&&now-f.start<f.life);
 if(!FX.elementAttacks105.length)return;
 // All paths use tile-local units. Seeded particles never consume gameplay RNG.
 const poly=(color,pts)=>{X.fillStyle=color;X.beginPath();X.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)X.lineTo(pts[i][0],pts[i][1]);X.closePath();X.fill()};
 const oval=(color,x,y,rx,ry,a=0)=>{X.fillStyle=color;X.beginPath();X.ellipse(x,y,Math.max(.05,rx),Math.max(.05,ry),a,0,Math.PI*2);X.fill()};
 const line=(color,width,pts)=>{X.strokeStyle=color;X.lineWidth=width;X.beginPath();X.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)X.lineTo(...pts[i]);X.stroke()};
 const mote=(color,x,y,s)=>poly(color,[[x,y-s],[x+s*.55,y],[x,y+s],[x-s*.55,y]]);
 X.save();X.globalCompositeOperation='source-over';X.lineJoin='round';X.lineCap='round';
 for(const f of FX.elementAttacks105){
  const age=now-f.start;if(age>=f.life)continue;
  const dense=f.cells.length>16;
  for(const q of f.cells){
   if(!state.visible.has(k(q.x,q.y)))continue;
   const seed=(q.x*73+q.y*151+f.elem.length*29)>>>0,rand=i=>{const n=Math.sin(seed+i*127.1)*43758.5453;return n-Math.floor(n)};
   const delay=f.cells.length>1?rand(91)*65:0,u=Math.max(0,(age-delay)/(f.life-delay));
   const fade=Math.min(1,u/.075)*Math.pow(1-Math.max(0,(u-.48)/.52),1.3),rise=Math.sin(Math.PI*u);
   X.save();X.translate(q.x*TILE,q.y*TILE);X.scale(TILE/32,TILE/32);
   // Low, colored impact light grounds the volume without bleaching the actor.
   X.globalAlpha=fade*.24;const glow=X.createRadialGradient(16,20,1,16,20,19);glow.addColorStop(0,ELEMENT_FX_COLORS105[f.elem]);glow.addColorStop(1,'transparent');oval(glow,16,20,19,15);
   X.globalAlpha=fade;
   if(f.elem==='fire'){
    X.globalAlpha=fade*.65;oval('#6b2918',16,26,12,3);X.globalAlpha=fade*.9;
    for(let i=0;i<5;i++){
     const bx=5+i*5.4,by=27+(i%2),h=(13+rand(i)*13)*(1-.35*u),w=3+rand(i+9)*2,lean=Math.sin(u*11+i*2)*2.6;
     const flame=(color,scale)=>{X.fillStyle=color;X.beginPath();X.moveTo(bx-w*scale,by);X.bezierCurveTo(bx-w*1.8*scale,by-h*.45*scale,bx+lean+3*scale,by-h*.58*scale,bx+lean,by-h*scale);X.bezierCurveTo(bx+lean+7*scale,by-h*.65*scale,bx+w*1.4*scale,by-h*.2*scale,bx+w*scale,by);X.closePath();X.fill()};
     flame('#a9361d',1.13);flame(i%2?'#ed6320':'#ee8026',1);flame('#ffb33f',.66);flame('#ffe397',.32);
    }
    for(let i=0;i<(dense?5:10);i++){const v=(u+rand(i+20)*.65)%1,x=4+rand(i+40)*24+Math.sin(v*8+i)*2,y=26-v*29;X.globalAlpha=fade*(1-v);line('#ed6a24',1.2,[[x,y+3],[x+.5,y]]);mote('#ffd365',x,y,.6+rand(i+50))}
    X.globalAlpha=fade*u*.28;for(let i=0;i<3;i++)oval('#573c32',10+i*7+Math.sin(u*6+i)*2,9-u*12-i*2,3+u*3,2+u*3);
   }else if(f.elem==='water'){
    X.globalAlpha=fade*.55;oval('#15536a',16,25,13,4);X.globalAlpha=fade*.9;
    // A filled breaking crest, darker water body and a thin turquoise foam lip.
    X.save();X.translate(16,26);X.rotate((rand(63)-.5)*.32);X.scale((.86+u*.22)*(.84+rand(61)*.2),(.64+rise*.42)*(.74+rand(62)*.36));X.translate(-16,-26);
    X.fillStyle='#19788f';X.beginPath();X.moveTo(2,25);X.bezierCurveTo(8,23,5,7,16,5);X.bezierCurveTo(25,3,29,13,21,16);X.bezierCurveTo(27,8,17,8,17,15);X.bezierCurveTo(17,22,25,22,30,25);X.quadraticCurveTo(16,31,2,25);X.fill();
    X.fillStyle='#35acc4';X.beginPath();X.moveTo(4,24);X.bezierCurveTo(10,20,8,6,18,6);X.bezierCurveTo(23,6,26,9,25,12);X.bezierCurveTo(21,6,13,10,14,18);X.quadraticCurveTo(15,24,25,25);X.quadraticCurveTo(13,28,4,24);X.fill();
    X.strokeStyle='#a0e2e1';X.lineWidth=1.15;X.beginPath();X.moveTo(7,20);X.bezierCurveTo(10,12,10,6,18,6);X.quadraticCurveTo(24,6,25,11);X.stroke();X.restore();
    for(let i=0;i<(dense?5:10);i++){const a=Math.PI*(1.12+rand(i)*.78),v=Math.min(1,u*1.65),d=6+v*(10+rand(i+10)*6),x=16+Math.cos(a)*d,y=24+Math.sin(a)*d+v*v*10;X.globalAlpha=fade*(.6+rand(i+20)*.4);oval('#36a5c9',x,y,1.2,2.2,a-Math.PI/2);oval('#ade9e7',x-.35,y-.7,.5,.8,a)}
    X.globalAlpha=fade*.75;X.strokeStyle='#69d0df';X.lineWidth=1.1;X.beginPath();X.ellipse(16,26,8+u*9,2+u*3,0,.1,Math.PI*.94);X.stroke();
   }else if(f.elem==='ice'){
    X.globalAlpha=fade*.45;oval('#245b79',16,26,13,4);X.globalAlpha=fade*.9;
    for(let i=0;i<5;i++){
     const bx=5+i*5.5,by=27-(i%2),h=(i===2?25:12+rand(i)*9)*Math.min(1,u*6),w=2.6+rand(i+3)*1.2,lean=(i-2)*1.2;
     poly('#2b6988',[[bx-w,by-3],[bx+lean-1,by-h],[bx+lean+1,by-h-2],[bx+w,by-3],[bx,by+1]]);
     poly('#58acc8',[[bx-w,by-3],[bx+lean-1,by-h],[bx,by-h*.65],[bx,by+1]]);
     poly('#a4e5ec',[[bx+lean-1,by-h],[bx+lean+1,by-h-2],[bx+w,by-3],[bx,by+1],[bx,by-h*.65]]);
     line('#d0eff0',.7,[[bx+lean,by-h],[bx,by-4]]);
    }
    for(let i=0;i<(dense?5:9);i++){const a=rand(i+20)*Math.PI*2,r=5+u*16,x=16+Math.cos(a)*r,y=17+Math.sin(a)*r;X.globalAlpha=fade*.8;poly(i%2?'#5399bc':'#9bd9e7',[[x-1,y+2],[x+1,y-3],[x+2,y],[x,y+3]])}
    X.globalAlpha=fade*.23;for(let i=0;i<3;i++)oval('#9bcdda',8+i*8,27,4+u*3,1.5+u);
   }else if(f.elem==='shock'){
    const phase=Math.floor(u*8),bolt=[];for(let i=0;i<7;i++)bolt.push([16+(rand(i+phase*7)-.5)*(i===0||i===6?4:19),2+i*4.5]);
    X.globalAlpha=fade*.28;line('#d99024',6,bolt);X.globalAlpha=fade*.95;line('#bd7528',3.5,bolt);line('#f3c84c',2,bolt);line('#fff0aa',.65,bolt);
    for(let i=1;i<5;i++){const [x,y]=bolt[i],side=i%2?1:-1,ex=x+side*(5+rand(i+50)*5);line('#c98d31',1.8,[[x,y],[ex-side*2,y+2],[ex,y-2],[ex+side*2,y+1]]);line('#ffe184',.65,[[x,y],[ex-side*2,y+2],[ex,y-2]])}
    X.globalAlpha=fade*.85;for(let i=0;i<(dense?4:8);i++){const a=rand(i+80)*Math.PI*2,r=7+u*15,x=16+Math.cos(a)*r,y=16+Math.sin(a)*r;line('#f0bd42',1,[[x,y],[x+Math.cos(a)*2.5,y+Math.sin(a)*2.5]]);mote('#fff0a6',x,y,.7)}
    X.globalAlpha=fade*.4;X.strokeStyle='#ca9b3e';X.lineWidth=.8;X.beginPath();X.ellipse(16,27,11,3,0,0,Math.PI*2);X.stroke();
   }else if(f.elem==='earth'){
    const lift=Math.sin(Math.min(1,u*1.5)*Math.PI)*7;
    X.globalAlpha=fade*.7;oval('#523725',16,26,14,4);for(let i=0;i<5;i++){const a=i*1.26+.2;line('#513426',1.5,[[16,24],[16+Math.cos(a)*7,24+Math.sin(a)*3],[16+Math.cos(a+.2)*14,24+Math.sin(a+.2)*6]])}
    X.globalAlpha=fade*.95;
    for(let i=0;i<5;i++){const bx=5+i*5.5,by=26-(i%2)*3-lift*(.5+rand(i)),w=3+rand(i+10)*2,h=5+rand(i+20)*7;poly('#674331',[[bx-w,by],[bx-w-1,by-h*.65],[bx-1,by-h],[bx+w,by-h*.75],[bx+w+1,by-1],[bx,by+2]]);poly('#ab7848',[[bx-w-1,by-h*.65],[bx-1,by-h],[bx+w,by-h*.75],[bx,by-h*.4]]);poly('#865734',[[bx,by-h*.4],[bx+w,by-h*.75],[bx+w+1,by-1],[bx,by+2]]);line('#ce9f61',.7,[[bx-w+1,by-h*.65],[bx-1,by-h+.8],[bx+w-1,by-h*.75]])}
    for(let i=0;i<(dense?5:10);i++){const a=rand(i+30)*Math.PI*2,r=4+u*17,x=16+Math.cos(a)*r,y=21+Math.sin(a)*r*.65-rise*6;X.globalAlpha=fade*.9;poly(i%2?'#bd9057':'#765039',[[x-1.7,y],[x-.3,y-2.5],[x+1.8,y-.6],[x+.8,y+1.5]])}
    X.globalAlpha=fade*.25;for(let i=0;i<5;i++)oval('#b18b5a',4+i*6,26+Math.sin(i)*2,3+u*4,1.5+u*2);
   }else if(f.elem==='grass'){
    X.globalAlpha=fade*.4;oval('#315030',16,26,13,4);X.globalAlpha=fade*.92;
    for(let i=0;i<3;i++){
     const bx=7+i*9,h=(17+i%2*8)*Math.min(1,u*6),sway=Math.sin(u*6+i*2)*2;
     X.beginPath();X.moveTo(bx,28);X.bezierCurveTo(bx-7,22,bx+7+sway,17,bx+sway,28-h);X.strokeStyle='#294629';X.lineWidth=3;X.stroke();X.strokeStyle='#64943b';X.lineWidth=1.7;X.stroke();
     for(let j=0;j<3;j++){const by=24-j*5,side=(i+j)%2?1:-1,lx=bx+(j%2?1:-1)+sway*.4,ly=by,tx=lx+side*(5+rand(i*5+j)*3),ty=ly-4;X.fillStyle=(i+j)%2?'#77a842':'#477b39';X.beginPath();X.moveTo(lx,ly);X.quadraticCurveTo(lx+side*1,ly-6,tx,ty);X.quadraticCurveTo(tx,ly+2,lx,ly);X.fill();line('#b0cf62',.6,[[lx,ly],[tx-side,ty+.5]])}
    }
    for(let i=0;i<(dense?4:8);i++){const a=rand(i+30)*6.28+u*2,r=5+u*12,x=16+Math.cos(a)*r,y=17+Math.sin(a)*r*.6-u*5;X.globalAlpha=fade*.85;oval(i%2?'#bed56d':'#78a73e',x,y,2,1,a);mote('#d0dd85',x+2,y-2,.5)}
   }else if(f.elem==='holy'){
    X.globalAlpha=fade*.35;oval('#bb7b29',16,25,13,5);X.globalAlpha=fade*.78;
    // A golden lotus opens into light, with volume instead of a crosshair glyph.
    for(let i=0;i<7;i++){
     const a=-Math.PI+(i/6)*Math.PI,reach=9+rise*6,tx=16+Math.cos(a)*reach,ty=24+Math.sin(a)*reach-3;
     X.fillStyle=i%2?'#b67c2c':'#d8a749';X.beginPath();X.moveTo(16,26);X.quadraticCurveTo(tx-4,ty+5,tx,ty);X.quadraticCurveTo(tx+4,ty+4,16,26);X.fill();line('#f1cf7c',.65,[[16,25],[tx,ty+1]]);
    }
    X.globalAlpha=fade*.8;poly('#e9bf63',[[16,5],[20,15],[16,24],[12,15]]);poly('#ffdf91',[[16,5],[16,24],[12,15]]);poly('#fff0b3',[[16,8],[17.2,15],[16,19],[14.8,15]]);
    X.strokeStyle='#dbad54';X.lineWidth=.9;X.beginPath();X.ellipse(16,26,10+u*5,3+u*1.5,0,0,Math.PI*2);X.stroke();
    for(let i=0;i<(dense?5:10);i++){const v=(u+rand(i)*.8)%1,x=4+rand(i+10)*24,y=27-v*28;X.globalAlpha=fade*(1-v)*.95;mote('#fbe09a',x,y,1+rand(i+20));if(i%2===0)line('#d9a64b',.6,[[x-1.7,y],[x+1.7,y]])}
   }
   X.restore();
  }
 }X.restore();
}
function drawCombustion(f,now,q=X){
 q.save();q.globalCompositeOperation='source-over';q.globalAlpha=1;
 const px=f.x*TILE,py=f.y*TILE,phase=now/170+f.x*2.3+f.y;
 const {poly}=drawKit(q);
  // Irregular scorch pieces: no opaque rectangle over the underlying floor.
  for(let i=0;i<5;i++){const x=px+5+i*4.5,y=py+22+Math.sin(i+f.y)*3;poly(f.age>=2?'#171817':'#50321f',[[x,y-4-f.age],[x+4,y-2],[x+3,y+5],[x-2,y+3]])}
  for(let i=0;i<5;i++){const x=px+5+i*5,y=py+27,h=14+7*Math.sin(phase+i*1.7),s=Math.sin(phase*1.2+i)*3;poly('#bd4321',[[x-3,y],[x-4,y-h*.55],[x+s,y-h],[x+3,y-h*.45],[x+5,y]]);poly('#ee812b',[[x-2,y],[x-1,y-h*.46],[x+s,y-h*.78],[x+2,y-h*.3],[x+3,y]]);poly('#f4c465',[[x,y],[x-1,y-4],[x+1,y-h*.42],[x+2,y]])}
  for(let i=0;i<4;i++){const u=(now/800+i*.23+f.x*.17)%1;q.globalAlpha=(1-u)*.7;q.fillStyle=i%2?'#e98a32':'#342e2a';q.fillRect(px+6+i*5+Math.sin(phase+i)*2,py+16-u*22,2,2)}q.globalAlpha=1;
 q.restore();
}
function drawTerrainReactions(now,b){
 if(!state)return;const r=terrainReactions105(),visible=q=>state.visible.has(k(q.x,q.y))&&(!b||q.x>=b.x0-1&&q.x<=b.x1+1&&q.y>=b.y0-1&&q.y<=b.y1+1);
 X.save();X.globalCompositeOperation='source-over';X.globalAlpha=1;
 const {poly}=drawKit(X);
 for(const f of Object.values(r.burning)){if(visible(f))drawCombustion(f,now)}
 for(const structure of mineState()?.carts||[])if(structure.alive&&structure.burning105&&visible(structure))drawCombustion({...structure,...structure.burning105},now);
 if(state.player.combustion105)drawCombustion({...state.player,age:0},now);
 for(const spill of Object.values(r.spills||{}))if(visible(spill)){
  const px=(spill.x+.5)*TILE,py=(spill.y+.67)*TILE,phase=now/520+spill.x*.83+spill.y*.61,fade=Math.min(1,spill.ttl/2),colors={water:['#235568','#69b7c5','#b2dce2'],oil:['#29241d','#79612f','#be9853'],poison:['#3a4d27','#729b44','#b6ce77'],wine:['#472230','#a04c69','#d9a0b2']}[spill.kind]||['#302a23','#746134','#ad955f'];
  X.globalAlpha=.5*fade;X.fillStyle=colors[0];X.beginPath();X.ellipse(px,py+1,13,6,0,0,Math.PI*2);X.fill();
  X.globalAlpha=.48*fade;X.fillStyle=colors[1];for(let i=0;i<3;i++){X.beginPath();X.ellipse(px+(i-1)*6,py+Math.sin(spill.x+i)*1.4,7+i%2,3.5+i%2*.6,(i-1)*.12,0,Math.PI*2);X.fill()}
  X.strokeStyle=colors[2];X.lineWidth=.75;X.globalAlpha=.4*fade;X.beginPath();X.ellipse(px+Math.sin(phase)*1.5,py-1,7+Math.sin(phase*.7),2.2,0,Math.PI*1.06,Math.PI*1.83);X.stroke();
  if(spill.kind==='water'){const u=(phase*.22)%1;X.globalAlpha=(1-u)*.3*fade;X.beginPath();X.ellipse(px,py,4+u*8,1+u*3,0,0,Math.PI*2);X.stroke()}
  else if(spill.kind==='oil'){X.globalAlpha=.22*fade;X.strokeStyle=Math.sin(phase)>0?'#b2a267':'#8d769d';X.beginPath();X.ellipse(px-2,py,8,2.6,-.13,Math.PI*.05,Math.PI*.88);X.stroke()}
  X.globalAlpha=1;
 }
 for(const q of Object.values(r.clues||{}))if(visible(q)){X.strokeStyle=q.elem==='water'?'#669eae':'#ae936d';X.lineWidth=1;X.beginPath();X.moveTo(q.x*TILE+11,q.y*TILE+5);X.lineTo(q.x*TILE+12,q.y*TILE+27);X.stroke()}
 drawElementAttacks(now);

 FX.terrainReactions105=(FX.terrainReactions105||[]).filter(f=>f.map===state.map&&now-f.start<f.life);
 for(const f of FX.terrainReactions105){if(!visible(f))continue;const t=Math.max(0,(now-f.start)/f.life),cx=(f.x+.5)*TILE,cy=(f.y+.6)*TILE,earth=f.kind==='earth',wood=f.kind==='wood';
  if(f.kind==='jar'){
   const liquid={water:'#83c7d2',oil:'#bb954f',poison:'#a4bf70',wine:'#c8839c'}[f.contents]||'#bd9b72',fade=Math.pow(1-t,1.3);
   X.globalAlpha=fade*.6;X.strokeStyle=liquid;X.lineWidth=2.2*(1-t)+.5;X.beginPath();X.ellipse(cx,cy+4,5+t*31,2+t*13,0,0,Math.PI*2);X.stroke();
   for(let i=0;i<18;i++){const a=i*2.39996+f.x*.37,travel=(12+i%5*5)*Math.pow(t,.65),x=cx+Math.cos(a)*travel,y=cy+Math.sin(a)*travel*.48-Math.sin(t*Math.PI)*(12+i%4*5),s=(2+i%3)*(1-t*.5);X.globalAlpha=fade;poly(['#be9567','#7a5238','#dbb68b'][i%3],[[x-s,y],[x-s*.2,y-s],[x+s,y-.3*s],[x+.6*s,y+s*.7]]);X.strokeStyle='#ead0a0';X.lineWidth=.6;X.beginPath();X.moveTo(x-s*.2,y-s);X.lineTo(x+s,y-.3*s);X.stroke()}
   if(f.contents!=='poison')for(let i=0;i<14;i++){const a=i*2.39996+f.y*.19,travel=(15+i%4*7)*t,x=cx+Math.cos(a)*travel,y=cy+Math.sin(a)*travel*.45-Math.sin(t*Math.PI)*(7+i%3*5);X.globalAlpha=fade*.85;X.fillStyle=liquid;X.beginPath();X.ellipse(x,y,1.7*(1-t)+.5,3*(1-t)+.5,-a,0,Math.PI*2);X.fill()}
   X.globalAlpha=1;continue;
  }
  X.globalAlpha=(1-t)*.55;X.strokeStyle=earth?'#a87945':'#5c4632';X.lineWidth=3*(1-t)+.5;X.beginPath();X.ellipse(cx,cy,5+t*23,3+t*12,0,0,Math.PI*2);X.stroke();
  for(let i=0;i<12;i++){const a=i*2.39996+f.x,travel=(10+i%4*5)*t,x=cx+Math.cos(a)*travel,y=cy+Math.sin(a)*travel*.55-Math.sin(t*Math.PI)*(8+i%3*4),s=(earth?3:2)*(1-t*.5);X.globalAlpha=1-t;poly(earth||wood?['#a47748','#6e5035','#be925f'][i%3]:['#191d1b','#38362b','#5d4530'][i%3],[[x-s,y],[x,y-s],[x+s,y-.3*s],[x+.4*s,y+s]])}X.globalAlpha=1;
 }X.restore();
}
function drawCombatStatusBadges(actor,cx,bottom){
 if(actor.hp<=0||!isEntityObservableToPlayer57(actor)||actor.treeMimic105&&actor.mimicDormant105!==false)return 0;
 const rows=combatStatusRows(actor);if(!rows.length)return 0;const size=10,gap=1,columns=3,line=12,total=Math.ceil(rows.length/columns);
 X.save();X.globalCompositeOperation='source-over';X.lineWidth=1;
 for(let i=0;i<rows.length;i++){const row=Math.floor(i/columns),count=Math.min(columns,rows.length-row*columns),width=count*size+(count-1)*gap,x=Math.round(cx-width/2+(i%columns)*(size+gap)),y=Math.round(bottom-(total-row)*line),mark=rows[i];X.fillStyle='#100a08';X.fillRect(x,y,size,size+1);X.strokeStyle=mark.color;X.globalAlpha=.75;X.strokeRect(x+.5,y+.5,size-1,size);X.globalAlpha=1;X.fillStyle=mark.color;for(let gy=0;gy<mark.glyph.length;gy++)for(let gx=0;gx<mark.glyph[gy].length;gx++)if(mark.glyph[gy][gx]==='1')X.fillRect(x+1+gx,y+2+gy,1,1);}
 X.restore();return rows.length;
}
function drawJarGas(now,bounds=null,q=X){
  if(!state)return;const fields=jarGasState57();if(!fields.length)return;q.save();q.globalCompositeOperation='source-over';
  for(const f of fields)if(now>=(JAR_GAS_VISUAL_START57.get(f)||0))for(const c of f.cells||[]){
    if(c.c<=0||!state.visible.has(k(c.x,c.y))||bounds&&(c.x<bounds.x0-1||c.x>bounds.x1+1||c.y<bounds.y0-1||c.y>bounds.y1+1))continue;
    const px=c.x*TILE,py=c.y*TILE,seed=c.x*17+c.y*31,phase=now/650+seed,fade=f.age>=(f.linger57?Math.max(5,(f.duration57||9)-2):5)?Math.max(.25,1-(f.age-(f.linger57?(f.duration57||9)-3:4))*.16):1,strength=(.13+c.c*.065)*fade,drunk=f.status57==='drunk';
    // Overlapping smoke lobes replace hard rectangular cell markers. Presentation consumes no combat RNG.
    for(let i=0;i<3;i++){
      const cx=px+16+Math.sin(phase*.61+i*2.1)*5,cy=py+15+Math.cos(phase*.47+i*1.7)*4,r=10+c.c+Math.sin(phase+i)*2,g=q.createRadialGradient(cx,cy,1,cx,cy,r);
      g.addColorStop(0,drunk?'#b982c3':'#a6c76d');g.addColorStop(.55,drunk?'#775381':'#628842');g.addColorStop(1,drunk?'#382a4100':'#2c482400');q.globalAlpha=strength;q.fillStyle=g;q.beginPath();q.ellipse(cx,cy,r,r*.8,Math.sin(phase*.2)*.25,0,Math.PI*2);q.fill();
    }
    q.globalAlpha=strength*.65;q.strokeStyle=drunk?'#deb5df':'#c5d991';q.lineWidth=.8;q.beginPath();q.ellipse(px+16+Math.sin(phase)*3,py+14,8+Math.sin(phase*.5)*2,3.5,Math.sin(phase*.4)*.45,Math.PI*.16,Math.PI*1.35);q.stroke();
    for(let i=0;i<3;i++){const u=(now/1800+i*.31+(seed%23)/23)%1;q.globalAlpha=(1-u)*strength;q.fillStyle=drunk?'#d1a5d3':'#bed586';q.fillRect(px+7+i*8+Math.sin(phase+i)*2,py+24-u*20,1.4,1.4)}
  }q.restore();
}
function visualPlayerPosition(){if(!state)return{x:0,y:0,worldX:TILE/2,worldY:TILE/2};const x=Number.isFinite(VIS.playerX)?VIS.playerX:state.player.x,y=Number.isFinite(VIS.playerY)?VIS.playerY:state.player.y;return{x,y,worldX:x*TILE+TILE/2,worldY:y*TILE+TILE/2}}
function cameraFollowPosition(){
 if(state?.debugBattle57){const mon=debugBattleSubject57(),p=mon?v8CreatureCoords(mon):DEBUG_BATTLE57.lastSubjectPosition||{x:COLS/2,y:ROWS/2};return{x:p.x,y:p.y,worldX:(p.x+.5)*TILE,worldY:(p.y+.5)*TILE}}
 return visualPlayerPosition();
}
function updateVisualMotion(now){if(!state)return;if(VIS.forced105){const f=forcedMotionSample(VIS.forced105,now);if(f){VIS.playerX=f.x;VIS.playerY=f.y;VIS.last=now;if(!f.done)return}VIS.forced105=null}const dt=Math.min(.05,Math.max(.001,(now-VIS.last)/1000));VIS.last=now;const a=1-Math.exp(-dt*19*automationPresentationRate70());VIS.playerX+=(state.player.x-VIS.playerX)*a;VIS.playerY+=(state.player.y-VIS.playerY)*a;if(Math.abs(state.player.x-VIS.playerX)<.002)VIS.playerX=state.player.x;if(Math.abs(state.player.y-VIS.playerY)<.002)VIS.playerY=state.player.y}
function paintLine(m,x0,y0,x1,y1,tile=TT.FLOOR,width=1){let x=x0,y=y0,guard=0;while((x!==x1||y!==y1)&&guard++<220){for(let oy=0;oy<width;oy++)for(let ox=0;ox<width;ox++){const xx=x+ox,yy=y+oy;if(xx>0&&yy>0&&xx<COLS-1&&yy<ROWS-1)setTerrainTile58(m,xx,yy,tile)}if(x!==x1)x+=Math.sign(x1-x);else if(y!==y1)y+=Math.sign(y1-y)}for(let oy=0;oy<width;oy++)for(let ox=0;ox<width;ox++){const xx=x+ox,yy=y+oy;if(xx>0&&yy>0&&xx<COLS-1&&yy<ROWS-1)setTerrainTile58(m,xx,yy,tile)}}
function paintAttackButton(){const b=document.getElementById('attackActionBtn');if(!b||!state)return;b.classList.add('ready');b.classList.remove('cooling');const sm=b.querySelector('small');if(sm)sm.textContent=`${attackTurnCost().toFixed(1)}턴`}
function vfVibrate(pattern){
  try{
    if(!HAPTIC57.enabled||typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return false;
    const normalized=Array.isArray(pattern)?pattern.map(v=>Math.max(0,Math.round(Number(v)||0))):Math.max(0,Math.round(Number(pattern)||0));
    return !!navigator.vibrate.call(navigator,normalized);
  }catch(_){return false}
}
function drawStatusScreen(now){
 if(state?.branchContext105?.id==='dojo'&&state.branchContext105.level===2&&state.branchTerrain105?.dojo?.escape105?.active){X.save();X.fillStyle='rgba(30,15,14,.85)';X.fillRect(VIEW.w/2-111,8,222,26);X.strokeStyle='#ad765c';X.strokeRect(VIEW.w/2-111,8,222,26);X.fillStyle='#ecd1b3';X.font='12px sans-serif';X.textAlign='center';X.fillText('낙인 추적 중 · 도장 1층으로 탈출',VIEW.w/2,25);X.restore();}
 if(!state?.status||state.dead||state.victory)return;
 if(state.player.combustion105){X.save();X.fillStyle='#2b160fe8';X.fillRect(8,8,180,24);X.fillStyle='#ee9b53';X.font='12px sans-serif';X.fillText(`연소 ${state.player.combustion105.remaining}턴 · 물/냉기로 소화`,14,24);X.restore();}
 let effect=null,activeKey=null,priority=-1;
 for(const [key,meta]of Object.entries(STATUS_META57)){
  if(!(state.status[key]>0)||!meta.screen)continue;
  const rank=meta.screen.priority+(meta.lethal&&state.status[key]<=6?30:0);
  if(rank>priority){effect=meta.screen;activeKey=key;priority=rank}
 }
 if(!effect)return;
 const w=VIEW.w,h=VIEW.h,breath=.92+.08*Math.sin(now/900),urgency=activeKey==='illness'&&state.status.illness<=6?1.2:1;
 X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.globalCompositeOperation='source-over';X.globalAlpha=effect.strength*breath*urgency;
 const wash=X.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.20,w*.5,h*.5,Math.hypot(w,h)*.56);
 wash.addColorStop(0,effect.color+'00');wash.addColorStop(.55,effect.color+'48');wash.addColorStop(1,effect.color);X.fillStyle=wash;X.fillRect(0,0,w,h);
 X.strokeStyle=effect.color;X.lineWidth=effect.motif==='seal'?3:2;
 if(effect.motif==='rays'){
  for(let i=0;i<18;i++){const angle=i*Math.PI/9+Math.sin(now/1600)*.025,c=Math.cos(angle),d=Math.sin(angle);X.beginPath();X.moveTo(w*.5+c*w*.57,h*.5+d*h*.57);X.lineTo(w*.5+c*w*.40,h*.5+d*h*.40);X.stroke()}
 }else if(effect.motif==='seal'){
  for(let i=0;i<7;i++){const y=h*(i+1)/8;X.beginPath();X.moveTo(0,y);X.lineTo(w*.07,y-8);X.lineTo(w*.12,y+8);X.moveTo(w,y);X.lineTo(w*.93,y-8);X.lineTo(w*.88,y+8);X.stroke()}
 }else if(effect.motif==='veins'){
  for(let i=0;i<9;i++){const x=w*(i+.5)/9,length=h*(.055+.025*Math.sin(i*7));X.beginPath();X.moveTo(x,0);X.lineTo(x+7,length*.55);X.lineTo(x-4,length);X.moveTo(w-x,h);X.lineTo(w-x-7,h-length*.55);X.lineTo(w-x+4,h-length);X.stroke()}
 }else if(effect.motif==='rings'){
  for(let i=0;i<3;i++){X.beginPath();X.ellipse(w*.5,h*.5,w*(.46+i*.035),h*(.46+i*.035),Math.sin(now/1700)*.018,0,Math.PI*2);X.stroke()}
 }
 X.restore();
}
function drawKeeperLavaWarning(mon,now,q=X,{tiles=true,label=true}={}){
 const phase=mon.keeperLava54?.phases.filter(p=>!p.resolved).at(-1);if(!phase)return;updateKeeperLavaOrigin54(mon,phase);
 const remain=Math.max(0,phase.due-state.floorTurn),pulse=.16+.055*Math.sin((TERRAIN_MOTION54.matches?0:now)/180),cells=keeperLavaCells(mon,phase);
 q.save();if(tiles)for(const c of cells){if(!state.visible.has(k(c.x,c.y)))continue;const px=c.x*TILE,py=c.y*TILE;
  q.fillStyle=c.safe?'rgba(192,180,140,.09)':`rgba(239,83,30,${pulse})`;q.fillRect(px,py,TILE,TILE);
  if(!c.safe){q.strokeStyle='rgba(255,157,65,.48)';q.lineWidth=1;q.beginPath();q.moveTo(px+6,py+23);q.lineTo(px+16,py+7);q.lineTo(px+26,py+23);q.stroke();q.fillStyle='#ffd390';q.fillRect(px+15,py+13,2,5);q.fillRect(px+15,py+20,2,2);}
 }
 if(label&&state.visible.has(k(mon.x,mon.y))){const text=`용암 ${remain}턴`,x=mon.x*TILE+16,y=mon.y*TILE-19;q.font='bold 12px sans-serif';q.textAlign='center';const width=q.measureText(text).width+12;q.fillStyle='rgba(25,12,8,.9)';q.fillRect(x-width/2,y-12,width,18);q.strokeStyle='#c38a51';q.lineWidth=1;q.strokeRect(x-width/2+.5,y-11.5,width-1,17);q.fillStyle='#ffdc9c';q.fillText(text,x,y+1)}q.restore();
}
function drawSilkThread(ctx,a,b,now,phase=0,preview=false){
 const ax=a.x*TILE+16.5,ay=a.y*TILE+15.5,bx=b.x*TILE+16.5,by=b.y*TILE+15.5,dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy);
 if(length<1)return;
 const x0=Math.max(0,Math.min(a.x,b.x)-1),x1=Math.min(COLS-1,Math.max(a.x,b.x)+1),y0=Math.max(0,Math.min(a.y,b.y)-1),y1=Math.min(ROWS-1,Math.max(a.y,b.y)+1),clip=new Path2D();let visible=0;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(state.visible.has(k(x,y))){clip.rect(x*TILE,y*TILE,TILE,TILE);visible++}
 if(!visible)return;
 const sag=preview?0:1.15*Math.sin(now/650+phase*.73),strand=new Path2D();strand.moveTo(ax,ay);strand.quadraticCurveTo((ax+bx)/2-dy/length*sag*2,(ay+by)/2+dx/length*sag*2,bx,by);
 ctx.save();ctx.clip(clip);ctx.setLineDash([]);ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha*=preview?.46+.12*Math.sin(now/240):.94;
 ctx.strokeStyle='#421b24';ctx.lineWidth=2.6;ctx.stroke(strand);
 ctx.strokeStyle=preview?'#e09a9f':'#e9a9b1';ctx.lineWidth=1.2;ctx.stroke(strand);
 ctx.strokeStyle='#ffe3d7';ctx.lineWidth=.35;ctx.stroke(strand);ctx.restore();
}
function drawBossArena(){
 if(!state)return;const now=performance.now(),cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current();X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.translate(cam.x,cam.y);X.scale(cam.zoom,cam.zoom);
 for(const mon of state.monsters||[]){
  if(mon.combatFixture54==='core'&&state.visible.has(k(mon.x,mon.y))){const x=mon.x*TILE+16,y=mon.y*TILE+18;X.strokeStyle=mon.color;X.lineWidth=1.5;for(let i=0;i<3;i++){const r=19+(now/45+i*11)%32;X.globalAlpha=1-(r-19)/32;X.beginPath();X.ellipse(x,y+10,r,r*.34,0,0,Math.PI*2);X.stroke()}X.globalAlpha=1;X.fillStyle='rgba(226,204,255,.18)';X.fillRect(x-2,y-72,4,60)}
  if(!mon.boss)continue;const a=mon.arena54;if(mon.hp>0&&mon.bossPattern==='keeper')drawKeeperLavaWarning(mon,now);
  if(mon.hp>0&&a?.mistActive57)for(const key of state.visible){const [x,y]=key.split(',').map(Number);if(!bossArenaMist(mon,x,y)||tileBlocks(state.map[y]?.[x]))continue;const px=x*TILE,py=y*TILE,pulse=.30+.05*Math.sin(now/360+x*.6+y*.4);X.fillStyle=`rgba(93,132,37,${pulse})`;X.fillRect(px,py,TILE,TILE);X.fillStyle='rgba(190,218,99,.25)';X.fillRect(px+3,py+9,25,10);if(Math.max(Math.abs(x-a.cx),Math.abs(y-a.cy))===BOSS_ARENA_RULES.containment.radius+1){X.strokeStyle='#cce575';X.lineWidth=2;X.strokeRect(px+1,py+1,TILE-2,TILE-2)}}
  if(mon.bossPattern==='master'&&activeCore(mon)&&state.visible.has(k(mon.x,mon.y))){const x=mon.x*TILE+16,y=mon.y*TILE+12;X.strokeStyle='#f5d699';X.lineWidth=2;X.beginPath();X.ellipse(x,y,23,30,Math.sin(now/900)*.12,0,Math.PI*2);X.stroke();X.fillStyle='rgba(219,187,115,.12)';X.fill();}

  if(mon.hp>0&&mon.silk54)for(const link of mon.silk54.links){
   const ends=silkLinkEndpoints(mon,link);if(ends)drawSilkThread(X,...ends,now,link.a*13+link.b);
  }
  for(const anchor of a?.anchors||[]){if(!state.seen.has(k(anchor.x,anchor.y)))continue;const x=anchor.x*TILE,y=anchor.y*TILE,vis=state.visible.has(k(anchor.x,anchor.y));X.globalAlpha=vis?1:.33;
   X.fillStyle='#211817';X.fillRect(x+5,y+24,23,6);X.fillStyle=anchor.broken?'#493c38':'#67504a';X.fillRect(x+9,y+(anchor.broken?21:4),5,25-(anchor.broken?17:0));X.fillRect(x+22,y+(anchor.broken?23:4),5,25-(anchor.broken?19:0));
   if(!anchor.broken){X.fillStyle='#a48770';X.fillRect(x+7,y+5,22,4);X.fillStyle='#d2bba0';X.fillRect(x+9,y+5,2,2);X.fillRect(x+24,y+5,2,2);X.strokeStyle='#d7bba0';X.lineWidth=2;X.beginPath();X.arc(x+18,y+15,5,0,Math.PI*2);X.stroke();X.fillStyle='#b26b42';X.fillRect(x+17,y+9,2,2)}
   X.globalAlpha=1;
  }
  if(mon.bound54){const anchor=a.anchors?.find(v=>v.x===mon.bound54.x&&v.y===mon.bound54.y);if(anchor&&state.visible.has(k(mon.x,mon.y))&&state.visible.has(k(anchor.x,anchor.y))){X.strokeStyle='#bc987b';X.lineWidth=2;X.setLineDash([4,3]);X.beginPath();X.moveTo(mon.x*TILE+16,mon.y*TILE+18);X.lineTo(anchor.x*TILE+18,anchor.y*TILE+15);X.stroke();X.setLineDash([]);X.strokeStyle='#ffcf88';X.strokeRect(mon.x*TILE+4,mon.y*TILE+4,24,24)}}
  if(mon.bossPattern==='master'&&mon.storyPhase992!==1&&state.visible.has(k(mon.x,mon.y))){
   const x=mon.x*TILE+16,y=mon.y*TILE+24;X.strokeStyle='rgba(231,187,103,.65)';X.lineWidth=1;X.beginPath();X.ellipse(x,y,24+Math.sin(now/350)*2,9,0,0,Math.PI*2);X.stroke();
   for(let i=0;i<6;i++){const angle=now/1800+i*Math.PI/3,px=x+Math.cos(angle)*25,py=y+Math.sin(angle)*9-12;X.fillStyle=i%2?'#ad5089':'#edca7c';X.fillRect(px,py,3,5)}
  }
 }
 X.restore();
}
function drawCoreSealWarning(ctx,intent,project,now,visible=()=>true){
 const keys=new Set(intent.cells.map(c=>k(c.x,c.y))),pulse=TERRAIN_MOTION54.matches?.65:.62+.19*Math.sin(now/150),origin=intent.data?.origin57,axis=intent.data?.direction57;
 ctx.save();
 for(const c of intent.cells){
  if(!visible(c))continue;const {x,y,size:s}=project(c),distance=origin?Math.hypot(c.x-origin.x,c.y-origin.y):0;
  ctx.fillStyle=`rgba(224,175,62,${.16+.08*pulse})`;ctx.fillRect(x,y,s,s);ctx.fillStyle=`rgba(255,230,146,${.06+.08*pulse})`;ctx.fillRect(x+s*.25,y+s*.25,s*.5,s*.5);
  ctx.strokeStyle=`rgba(255,216,105,${.70+.25*pulse})`;ctx.lineWidth=Math.max(1,s/22);
  for(const[dx,dy]of DIRS4)if(!keys.has(k(c.x+dx,c.y+dy))){ctx.beginPath();if(dx){const xx=x+(dx>0?s-1:1);ctx.moveTo(xx,y+1);ctx.lineTo(xx,y+s-1)}else{const yy=y+(dy>0?s-1:1);ctx.moveTo(x+1,yy);ctx.lineTo(x+s-1,yy)}ctx.stroke()}
  if(origin&&axis){ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,s-2,s-2);ctx.clip();const a=Math.atan2(c.y-origin.y,c.x-origin.x),cx=x+s*.5,cy=y+s*.5;ctx.strokeStyle=`rgba(255,237,172,${.28+.24*pulse})`;ctx.lineWidth=Math.max(1,s/32);ctx.beginPath();ctx.moveTo(cx-Math.cos(a)*s*.22,cy-Math.sin(a)*s*.22);ctx.lineTo(cx+Math.cos(a)*s*.22,cy+Math.sin(a)*s*.22);ctx.stroke();if(distance>intent.data.range-1){ctx.fillStyle='#f5d982';ctx.fillRect(cx-1,cy-1,2,2)}ctx.restore()}
 }
 ctx.restore();
}
function drawNeutralInteractable(n){
    for(const row of state.shopIntermission?.active?state.shopIntermission.stock:[]){if(row.soldOut||!VisibilityService.isVisible(row.x,row.y))continue;X.save();X.strokeStyle='rgba(221,190,119,.50)';X.lineWidth=1;X.strokeRect(row.x*TILE+3.5,row.y*TILE+3.5,25,25);drawItem({...row.item,x:row.x,y:row.y});X.fillStyle='#21180edb';X.fillRect(row.x*TILE+8,row.y*TILE+27,20,8);X.font='bold 7px sans-serif';X.fillStyle='#efdb9c';X.fillText(row.price+' 엿',row.x*TILE+10,row.y*TILE+33);X.restore()}

 if(!n||!VisibilityService.isVisible(n.x,n.y))return;
 globalThis.__MANRU_ACTOR_ART__?.drawWorld?.({...n,name:n.theme===2?'구미호':n.name,shopPortrait58:n.theme});
 const px=n.x*TILE,py=n.y*TILE;X.save();X.fillStyle='#ead3a0';X.font='bold 8px sans-serif';X.textAlign='center';X.fillText('판매',px+16,py-7);X.restore();
}
function drawDecal(d){
  const px=d.x*TILE, py=d.y*TILE;
  const age=(performance.now()-(d.t||performance.now()));
  const alpha=Math.max(0.18, 1 - age/180000); // 3분에 걸쳐 천천히 fade
  X.save();
  X.globalAlpha = .9*alpha;
  if(d.type==="bones"){
    X.strokeStyle="rgba(213,218,226,.42)";
    X.lineWidth=2;
    X.beginPath();
    X.moveTo(px+9,py+22); X.lineTo(px+16,py+15); X.lineTo(px+23,py+22); X.stroke();
    X.beginPath();
    X.moveTo(px+11,py+18); X.lineTo(px+21,py+18); X.stroke();
  }else{
    X.fillStyle="rgba(90,20,26,.22)";
    X.beginPath();
    X.ellipse(px+16,py+22,9,4,0,0,Math.PI*2); X.fill();
    X.fillStyle="rgba(160,80,90,.18)";
    X.beginPath();
    X.ellipse(px+13,py+20,5,3,.3,0,Math.PI*2); X.fill();
  }
  X.restore();
}
function isMobileViewport(){return window.matchMedia('(max-width:1080px)').matches}
function syncViewportOnWindowResize(){ClientEnvironment.refresh('viewport');const observing=!!state?.debugBattle57,w=document.getElementById(observing?(DEBUG_BATTLE57.watching?'battleWatchViewport57':'battleViewport57'):'canvasWrap'),cs=getComputedStyle(w),cw=Math.max(observing?1:300,Math.floor((w.clientWidth||(observing?innerWidth:0))-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0))),ch=Math.max(observing?1:280,Math.floor((w.clientHeight||(observing?innerHeight-130:0))-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0))),dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));if(VIEW.w!==cw||VIEW.h!==ch||VIEW.dpr!==dpr){VIEW.w=cw;VIEW.h=ch;VIEW.dpr=dpr;C.style.width=cw+'px';C.style.height=ch+'px';C.width=Math.max(1,Math.round(cw*dpr));C.height=Math.max(1,Math.round(ch*dpr));VIS.camInit=false}}
/* ===== MANRU rendering override ===== */
function regionColors(){const c=regionColorsWithFloor11(),p=FLOOR91[regionIndex()]||FLOOR91[0];return{...c,floor:p.floor,floorAlt:p.alt,fog:p.fog}}
function regionColorsWithPalette(){
    const c=floorArtRegionColors();if(!state||state.specialFloor||state.monsters?.some(m=>m.boss))return c;
    return {...c,...PALETTE71[regionIndex()]};
  }
function liftedRegionColors(){const c=regionBasePalette(),z=regionIndex(),lift=[13,10,11,10,12][z]||9;return{...c,floor:colorShift(c.floor,lift),floorAlt:colorShift(c.floorAlt,lift),wall:colorShift(c.wall,lift+5),wallDark:colorShift(c.wallDark,lift+1)}}
function regionBasePalette(){
  const a=REGION_ART[regionIndex()]||REGION_ART[0];
  return {...a};
}
function colorShift(hex,amt){
  const h=(hex||'#777777').replace('#','');if(h.length!==6)return hex;
  const n=parseInt(h,16),r=clamp((n>>16)+amt,0,255),g=clamp(((n>>8)&255)+amt,0,255),b=clamp((n&255)+amt,0,255);
  return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
}
function drawAuthoredWall(px,py,x,y){
  if(state.floor===23){const rawStyle=state.floor23?.wallStyleByCell?.[k(x,y)],style=rawStyle==='timber'&&wallMaterial105(x,y)==='stone'?'stone':rawStyle;if(style){const top=!((state.map[y-1]?.[x]??TT.WALL)===TT.WALL);X.fillStyle=style==='timber'?'#26170f':style==='plaster'?'#392e27':style==='depot'?'#252b2e':style==='ruin'?'#35393a':'#2d3940';X.fillRect(px,py,32,32);if(style==='timber'){X.fillStyle='#6d4528';X.fillRect(px+3,py+4,26,27);for(let yy=7;yy<30;yy+=7){X.fillStyle='#9a6437';X.fillRect(px+4,py+yy,24,3)}X.fillStyle='#321d12';X.fillRect(px+4,py+4,4,27);X.fillRect(px+24,py+4,4,27)}else if(style==='plaster'){X.fillStyle='#c6c0ad';X.fillRect(px+4,py+5,24,25);X.fillStyle='#4b3020';X.fillRect(px+3,py+4,5,28);X.fillRect(px+24,py+4,5,28);X.fillRect(px+4,py+14,24,3);X.fillStyle='rgba(255,249,224,.20)';X.fillRect(px+9,py+7,13,5)}else if(style==='depot'){X.fillStyle='#4b565b';X.fillRect(px+3,py+5,26,26);X.strokeStyle='#89959b';X.strokeRect(px+5.5,py+7.5,21,19);for(const [ox,oy]of[[7,9],[24,9],[7,24],[24,24]])X.fillRect(px+ox,py+oy,2,2)}else if(style==='ruin'){X.fillStyle='#797b73';X.fillRect(px+3,py+5,26,26);X.fillStyle='#525b5f';X.fillRect(px+4,py+6,11,9);X.fillRect(px+17,py+17,10,12);X.strokeStyle='#34393a';X.beginPath();X.moveTo(px+18,py+5);X.lineTo(px+13,py+17);X.lineTo(px+20,py+26);X.stroke()}else{X.fillStyle='#667a84';X.fillRect(px+3,py+5,26,26);X.strokeStyle='#9fb0b6';for(let yy=9;yy<28;yy+=8){X.beginPath();X.moveTo(px+4,py+yy);X.lineTo(px+28,py+yy);X.stroke()}}if(top){X.fillStyle=style==='timber'?'#a26d3f':style==='plaster'?'#76503a':style==='depot'?'#79848a':'#8fa0a7';X.fillRect(px+2,py+1,28,6)}X.fillStyle='rgba(0,0,0,.30)';X.fillRect(px+2,py+28,28,4);return true}}
  if(state.floor===24){const style=state.floor24?.wallStyleByCell?.[k(x,y)]||'estate-mass';drawEstateWall(px,py,x,y,style);return true}

return false;}
function drawEstateWall(px,py,x,y,style){
  const exposed=estateWallExposure24(x,y),axis=(exposed==='n'||exposed==='s')?'h':'v',coord=axis==='h'?x:y;
  const palette=style==='private'?['#24150d','#b5aa94','#694027']:style==='gallery'?['#29190f','#b9ad94','#75482c']:style==='service'?['#2a1c13','#aaa08d','#5b3d28']:style==='rear'?['#2d1c12','#b7ac94','#724d30']:style==='courtyard-wall'?['#2f2017','#bdb19a','#754c30']:style==='estate-mass'?['#1f140d','#4a3527','#604026']:['#291a11','#b7ab91','#704529'];
  const dark=palette[0],paper=palette[1],beam=palette[2],module=8,phase=((coord+(style.length%7))%module+module)%module,boundary=phase===0;
  X.fillStyle=dark;X.fillRect(px,py,32,32);
  if(!exposed){
    // Interior roof/wall mass uses broad world-aligned courses, not one boxed motif per 32px cell.
    X.fillStyle='#352318';X.fillRect(px,py,32,32);
    const gy=y*32,gx=x*32;for(let yy=(-gy%16+16)%16;yy<32;yy+=16){X.fillStyle=((gy+yy)/16|0)%2?'#432b1c':'#4a3020';X.fillRect(px,py+yy,32,3)}
    const rib=((gx+gy*2)%96+96)%96;if(rib<4){X.fillStyle='rgba(175,112,62,.13)';X.fillRect(px,py,4-rib,32)}
    X.fillStyle='rgba(0,0,0,.38)';X.fillRect(px,py+28,32,4);return;
  }
  // Continuous wall face. Neighboring cells share the same plaster field; posts appear only every 6 tiles.
  X.fillStyle=paper;X.fillRect(px,py+6,32,22);
  X.fillStyle='rgba(87,63,43,.075)';X.fillRect(px,py+21,32,7);
  X.fillStyle=beam;X.fillRect(px,py+2,32,4);X.fillRect(px,py+27,32,2);
  if(axis==='h'){
    if(boundary){X.fillStyle=dark;X.fillRect(px,py+2,5,28)}
    if(phase===module-1){X.fillStyle=dark;X.fillRect(px+28,py+2,4,28)}
    if(style==='gallery'&&phase===4){X.fillStyle='rgba(105,72,43,.22)';X.fillRect(px+8,py+9,16,14);X.strokeStyle='rgba(105,72,43,.34)';X.strokeRect(px+8.5,py+9.5,15,13)}
    else if(style==='private'&&phase===3){X.fillStyle='#5f4937';X.fillRect(px+5,py+18,22,8);X.strokeStyle='rgba(184,145,91,.48)';X.strokeRect(px+6.5,py+19.5,19,5)}
    else if(style==='service'&&phase===4){X.fillStyle='#514235';X.fillRect(px+5,py+12,22,4);X.fillRect(px+10,py+21,12,4)}
  }else{
    if(boundary){X.fillStyle=dark;X.fillRect(px,py+2,32,5)}
    if(phase===module-1){X.fillStyle=dark;X.fillRect(px,py+28,32,4)}
    if(style==='gallery'&&phase===4){X.fillStyle='rgba(105,72,43,.22)';X.fillRect(px+8,py+9,16,14);X.strokeStyle='rgba(105,72,43,.34)';X.strokeRect(px+8.5,py+9.5,15,13)}
  }
  // Shared eave/sill and cast shadow make the wall read as one raised structure.
  X.fillStyle='#1c110b';X.fillRect(px,py,32,3);X.fillStyle='#825332';X.fillRect(px,py+3,32,2);
  X.fillStyle='rgba(0,0,0,.44)';X.fillRect(px,py+29,32,3);
}
function drawMonsterWarningAuras(now,bounds=null){
  const sources=(state?.monsters||[]).filter(m=>m.warningAura57&&m.hp>0&&m.revivePhase57!=='corpse');if(!sources.length)return;X.save();X.globalCompositeOperation='screen';for(const mon of sources){const r=Math.ceil(mon.warningAura57),x0=Math.max(bounds?.x0??0,mon.x-r),x1=Math.min(bounds?.x1??COLS-1,mon.x+r),y0=Math.max(bounds?.y0??0,mon.y-r),y1=Math.min(bounds?.y1??ROWS-1,mon.y+r);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!state.seen.has(k(x,y)))continue;const q=monsterWarningAuraSample(mon,x,y);if(!q||q.alpha<=0)continue;X.fillStyle=`rgba(${q.color[0]},${q.color[1]},${q.color[2]},${q.alpha})`;X.fillRect(x*TILE,y*TILE,TILE,TILE)}}X.restore()
}
function drawFloorTexture(px,py,x,y,colors,vis){
    drawFloorWithStyle(px,py,x,y,colors,vis);const r41=globalThis.__MANRU_TERRAIN_R41__,t=terrainBaseTile58(x,y);if(tileBlocks(t)||[TT.WATER,TT.MERCURY,TT.VOID,TT.LAVA].includes(t)){r41?.floor?.(px,py,x,y,colors,vis);return}const edges=[[0,-1,'n'],[0,1,'s'],[-1,0,'w'],[1,0,'e']];X.save();for(const[dx,dy,side]of edges){const nt=terrainBaseTile58(x+dx,y+dy);if(nt!==TT.WATER&&nt!==TT.MERCURY)continue;const c=nt===TT.MERCURY?'151,177,181':'48,118,132';for(let i=0;i<4;i++){const a=(.15-i*.027)*(vis?1:.65);X.fillStyle=`rgba(${c},${a})`;if(side==='n')X.fillRect(px,py+i,32,1);else if(side==='s')X.fillRect(px,py+31-i,32,1);else if(side==='w')X.fillRect(px+i,py,1,32);else X.fillRect(px+31-i,py,1,32)}}X.restore();r41?.floor?.(px,py,x,y,colors,vis);
  }
function drawFloorWithStyle(px,py,x,y,colors,vis){
    drawFloorWithSubtheme(px,py,x,y,colors,vis);
    const style=state?.floorStyle980?.[key980(x,y)]||state?.subthemeFloors972?.[key980(x,y)]||state?.subthemeWalls970?.[key980(x,y)];if(!style)return;
    const h=hash980(x,y,67),h2=hash980(x,y,71),now=performance.now(),pulse=.5+.5*Math.sin(now/360+x*.7+y*.4);X.save();
    const plank=(base,hi,dark,vertical=false)=>{X.fillStyle=base;X.fillRect(px,py,32,32);if(vertical){for(let xx=0;xx<32;xx+=6){X.fillStyle=(xx/6)%2?hi:base;X.fillRect(px+xx,py,5,32);X.fillStyle=dark;X.fillRect(px+xx+5,py,1,32)}}else{for(let yy=0;yy<32;yy+=6){X.fillStyle=(yy/6)%2?hi:base;X.fillRect(px,py+yy,32,5);X.fillStyle=dark;X.fillRect(px,py+yy+5,32,1)}}X.fillStyle='rgba(255,238,196,.07)';X.fillRect(px+3,py+3,24,1)};
    const stone=(base,a,b)=>{X.fillStyle=base;X.fillRect(px,py,32,32);X.fillStyle=a;X.fillRect(px+1,py+1,14,14);X.fillRect(px+17,py+17,14,14);X.fillStyle=b;X.fillRect(px+17,py+1,14,14);X.fillRect(px+1,py+17,14,14);X.strokeStyle='rgba(255,255,255,.07)';X.strokeRect(px+.5,py+.5,31,31)};
    if(/f6_indoor|r2_indoor/.test(style))plank('#8c6737','#a47b45','rgba(51,31,17,.32)',false);
    else if(/f6_lotus|f6_watergarden|r2_outdoor|f8_|f24_orchard|f24_stream|f24_tea/.test(style)){X.fillStyle='rgba(63,113,68,.12)';X.fillRect(px,py,32,32);for(let i=0;i<4;i++){X.fillStyle=i%2?'rgba(122,166,91,.18)':'rgba(46,82,48,.20)';X.fillRect(px+3+((x*7+y*5+i*8)%24),py+5+((x*3+y*11+i*6)%22),2,2)}}
    else if(/f10_|f13_silk|f13_inner|f15_stage|f15_box|f15_runway|r3_silk/.test(style)){plank('#3a2332','#513047','rgba(20,11,18,.35)',false);X.strokeStyle='rgba(225,171,207,.11)';X.strokeRect(px+5.5,py+5.5,21,21)}
    else if(/f13_mirror|f13_gallery|f13_ante|f23_|r3_moon/.test(style))stone('#3f4d58','#4c5d68','#354149');
    else if(/f16_|f18_cold|f18_cells|f20_|f22_|f11_cave/.test(style))stone('#414446','#55595b','#343638');
    else if(/f18_|r4_storage/.test(style))plank('#3f2a1f','#563728','rgba(22,13,9,.35)',false);
    else if(/f25_core|f22_sanctum|r5_sanctum/.test(style)){X.fillStyle='rgba(177,142,54,.12)';X.fillRect(px,py,32,32);X.strokeStyle='rgba(244,212,114,.16)';X.strokeRect(px+4.5,py+4.5,23,23);X.fillStyle='rgba(244,218,124,.10)';X.fillRect(px+15,py+4,2,24);X.fillRect(px+4,py+15,24,2)}
    else if(/f21_|f25_/.test(style)){X.fillStyle='rgba(37,42,86,.18)';X.fillRect(px,py,32,32);X.fillStyle=`rgba(91,229,230,${.05+.06*pulse})`;X.fillRect(px+4+(h*23|0)%22,py+4+(h2*19|0)%22,2,2);X.strokeStyle='rgba(116,168,211,.08)';X.beginPath();X.moveTo(px+3,py+16);X.lineTo(px+29,py+16);X.stroke()}
    else if(/f23_|f22_cloister/.test(style))stone('#4d5c63','#63737a','#3d494f');
    if(vis){X.fillStyle='rgba(255,255,255,.025)';if(h>.82)X.fillRect(px+5,py+7,12,1);if(h2>.87)X.fillRect(px+20,py+23,7,1)}
    X.restore();
  }
function drawFloorWithSubtheme(px,py,x,y,colors,vis){
    drawRegionFloor(px,py,x,y,colors,vis);
    const style = state?.subthemeFloors972?.[key972(x,y)] || state?.subthemeWalls970?.[key972(x,y)] || null;
    if(!style) return;
    const t=state.map[y][x], p=.5+.5*Math.sin((x*17+y*9+performance.now()/340));
    X.save();
    if(style==='r2_indoor'){
      X.fillStyle='rgba(188,169,128,.075)'; X.fillRect(px+2,py+2,28,28);
      X.fillStyle='rgba(65,53,38,.18)'; for(let yy=3;yy<31;yy+=6) X.fillRect(px+1,py+yy,30,1);
      X.fillStyle='rgba(249,226,177,.10)'; X.fillRect(px+4,py+5,24,1);
    }else if(style==='r2_indoor_water'){
      X.strokeStyle=`rgba(202,235,229,${.15+.08*p})`; X.beginPath(); X.moveTo(px+4,py+11); X.lineTo(px+14,py+8); X.lineTo(px+27,py+11); X.stroke();
      X.beginPath(); X.moveTo(px+6,py+22); X.lineTo(px+18,py+19); X.lineTo(px+27,py+22); X.stroke();
    }else if(style==='r2_outdoor' || style==='r2_outdoor_path'){
      X.fillStyle='rgba(74,98,75,.055)'; for(let i=0;i<4;i++){ const xx=3+((x*11+y*7+i*5)%23), yy=4+((x*5+y*13+i*7)%21); X.fillRect(px+xx,py+yy,2,2); }
      if(style==='r2_outdoor_path' || t===TT.STONE_PATH){ X.strokeStyle='rgba(187,177,138,.18)'; X.strokeRect(px+4.5,py+4.5,23,23); X.fillStyle='rgba(201,193,152,.08)'; X.fillRect(px+7,py+14,18,2); }
    }else if(style==='r3_silk'){
      X.fillStyle='rgba(125,62,101,.10)'; X.fillRect(px+2,py+2,28,28);
      X.strokeStyle='rgba(239,200,222,.13)'; X.strokeRect(px+6.5,py+6.5,19,19);
      X.fillStyle='rgba(245,215,228,.09)'; X.fillRect(px+15,py+5,2,22); X.fillRect(px+5,py+15,22,2);
    }else if(style==='r3_moon'){
      X.fillStyle='rgba(87,111,131,.10)'; X.fillRect(px+2,py+2,28,28);
      X.strokeStyle='rgba(220,234,240,.12)'; for(let s=0;s<32;s+=8){ X.beginPath(); X.moveTo(px+s,py+1); X.lineTo(px+s,py+31); X.moveTo(px+1,py+s); X.lineTo(px+31,py+s); X.stroke(); }
    }else if(style==='r4_storage'){
      X.fillStyle='rgba(111,84,57,.09)'; X.fillRect(px+2,py+2,28,28);
      X.fillStyle='rgba(53,38,24,.18)'; for(let yy=5;yy<30;yy+=7) X.fillRect(px+3,py+yy,26,1);
    }else if(style==='r4_cellar'){
      X.fillStyle='rgba(88,99,103,.10)'; X.fillRect(px+2,py+2,28,28);
      X.strokeStyle='rgba(197,210,216,.11)'; X.strokeRect(px+5.5,py+5.5,21,21);
      X.fillStyle='rgba(36,42,45,.20)'; X.fillRect(px+15,py+4,1,24);
    }else if(style==='r5_sanctum'){
      X.fillStyle='rgba(175,146,66,.08)'; X.fillRect(px+2,py+2,28,28);
      X.strokeStyle='rgba(238,211,125,.15)'; X.strokeRect(px+4.5,py+4.5,23,23);
      X.fillStyle='rgba(240,220,146,.11)'; X.fillRect(px+15,py+4,2,24); X.fillRect(px+4,py+15,24,2);
    }else if(style==='r5_garden' || style==='r5_garden_path'){
      X.fillStyle='rgba(80,100,64,.08)'; for(let i=0;i<5;i++){ const xx=4+((x*13+y*3+i*7)%22), yy=5+((x*7+y*11+i*5)%20); X.fillRect(px+xx,py+yy,2,2); }
      if(style==='r5_garden_path' || t===TT.STONE_PATH){ X.fillStyle='rgba(188,170,134,.10)'; X.fillRect(px+4,py+14,24,2); X.fillStyle='rgba(120,112,83,.16)'; X.fillRect(px+7,py+11,4,4); X.fillRect(px+18,py+17,5,4); }
    }
    X.restore();
  }
function drawRegionFloor(px,py,x,y,colors,vis){
    const h=hash2(x>>1,y>>1,91001+state.floor*13),base=h>.72?colors.floorAlt:colors.floor;X.fillStyle=base;X.fillRect(px,py,32,32);
    X.fillStyle='rgba(255,255,255,.018)';if((x+y)%5===0)X.fillRect(px+2,py+2,28,1);
    X.fillStyle='rgba(0,0,0,.035)';X.fillRect(px,py+30,32,2);
  }
function drawWallTexture(px,py,x,y,colors){if(drawAuthoredWall(px,py,x,y))return;
    drawWallWithSubthemeOverlay(px,py,x,y,colors);const r41=globalThis.__MANRU_TERRAIN_R41__,style=state?.wallStyle980?.[key980(x,y)]||state?.subthemeWalls970?.[key980(x,y)];if(!style){r41?.wall?.(px,py,x,y,colors);return}const h=hash980(x,y,79);X.save();
    if(/f6_|r2_indoor/.test(style)){X.fillStyle='rgba(205,164,91,.11)';X.fillRect(px+3,py+5,26,2);X.fillStyle='rgba(58,35,18,.24)';X.fillRect(px+15,py+6,2,20);X.fillStyle='rgba(235,207,151,.07)';X.fillRect(px+4,py+22,24,1)}
    else if(/f8_|r2_outdoor|f24_/.test(style)){X.fillStyle='rgba(80,121,78,.14)';X.fillRect(px+3,py+22,11,3);X.fillRect(px+18,py+8,8,2);if(h>.55){X.fillStyle='rgba(159,189,139,.09)';X.fillRect(px+7,py+5,2,12)}}
    else if(/f10_|f13_|f15_|r3_/.test(style)){X.strokeStyle='rgba(229,177,210,.13)';X.strokeRect(px+5.5,py+5.5,21,21);X.fillStyle='rgba(134,72,112,.12)';X.fillRect(px+14,py+6,4,20)}
    else if(/f11_canyon/.test(style)){X.fillStyle='rgba(184,192,194,.09)';X.fillRect(px+3,py+6,26,2);X.fillStyle='rgba(37,43,45,.28)';X.fillRect(px+10+(h>.5?6:0),py+8,2,20);X.fillStyle='rgba(73,102,74,.18)';if(h>.72)X.fillRect(px+4,py+24,11,3)}
    else if(/f16_|f18_|f20_|f22_|f23_/.test(style)){X.strokeStyle='rgba(210,218,218,.10)';X.strokeRect(px+4.5,py+6.5,23,20);X.fillStyle='rgba(32,37,40,.22)';X.fillRect(px+15,py+7,2,19);if(h>.65){X.fillStyle='rgba(186,131,83,.14)';X.fillRect(px+6,py+8,2,2);X.fillRect(px+24,py+23,2,2)}}
    else if(/f21_|f25_|r5_/.test(style)){X.strokeStyle='rgba(106,224,226,.13)';X.beginPath();X.moveTo(px+4,py+16);X.lineTo(px+28,py+16);X.stroke();X.fillStyle='rgba(227,197,94,.09)';X.fillRect(px+15,py+7,2,18)}
    X.restore();r41?.wall?.(px,py,x,y,colors);
  }
function drawWallWithSubthemeOverlay(px,py,x,y,colors){
    drawWallWithSubthemePalette(px,py,x,y,colors);
    const style = state?.subthemeWalls970?.[key972(x,y)];
    if(!style) return;
    X.save();
    if(style==='r2_indoor'){
      X.fillStyle='rgba(194,175,135,.075)'; X.fillRect(px+4,py+5,24,2); X.fillRect(px+4,py+24,24,2);
      X.fillStyle='rgba(70,47,26,.20)'; X.fillRect(px+15,py+6,2,20);
    }else if(style==='r2_outdoor'){
      X.fillStyle='rgba(72,94,75,.10)'; X.fillRect(px+3,py+22,10,2); X.fillRect(px+18,py+8,8,2);
      X.fillStyle='rgba(180,206,168,.07)'; X.fillRect(px+6,py+6,1,8);
    }else if(style==='r3_silk'){
      X.strokeStyle='rgba(238,206,227,.12)'; X.strokeRect(px+5.5,py+5.5,21,21); X.fillStyle='rgba(161,96,137,.11)'; X.fillRect(px+14,py+6,4,20);
    }else if(style==='r3_moon'){
      X.strokeStyle='rgba(216,233,244,.12)'; X.beginPath(); X.moveTo(px+4,py+10.5); X.lineTo(px+28,py+10.5); X.moveTo(px+4,py+21.5); X.lineTo(px+28,py+21.5); X.stroke();
    }else if(style==='r4_storage'){
      X.fillStyle='rgba(158,120,81,.11)'; X.fillRect(px+3,py+6,26,2); X.fillStyle='rgba(52,37,24,.20)'; X.fillRect(px+7,py+18,18,2);
    }else if(style==='r4_cellar'){
      X.fillStyle='rgba(180,188,192,.07)'; X.fillRect(px+4,py+7,24,1); X.fillRect(px+4,py+23,24,1); X.fillStyle='rgba(45,51,54,.16)'; X.fillRect(px+15,py+7,2,18);
    }else if(style==='r5_sanctum'){
      X.strokeStyle='rgba(238,213,131,.14)'; X.strokeRect(px+6.5,py+6.5,19,19); X.fillStyle='rgba(244,222,134,.10)'; X.fillRect(px+14,py+5,4,22);
    }else if(style==='r5_garden'){
      X.fillStyle='rgba(143,163,112,.09)'; X.fillRect(px+4,py+23,9,2); X.fillRect(px+19,py+9,8,2);
    }
    X.restore();
  }
function drawWallWithSubthemePalette(px,py,x,y,colors){const s=state?.subthemeWalls970?.[`${x},${y}`];if(s){const P={r1_banquet:['#5f2c24','#26130f'],r1_service:['#4c3424','#20160f'],r2_indoor:['#9b7846','#4e3822'],r2_outdoor:['#4a5c50','#202b25'],r3_silk:['#5e3659','#281625'],r3_moon:['#4b5965','#202932'],r4_storage:['#554034','#211812'],r4_cellar:['#555d61','#22282b'],r5_sanctum:['#5d5130','#231f13'],r5_garden:['#5b6250','#252a20'],rumor_garden:['#52684d','#1e2820'],rumor_store:['#6b4a2f','#26180d'],rumor_archive:['#51443c','#1d1816'],rumor_moon:['#667582','#27313b'],rumor_silk:['#70405f','#281521'],rumor_shrine:['#7a6635','#2b2411'],rumor_flood:['#54727a','#1f2c31'],rumor_gas:['#5b6551','#20261c'],haz_water:['#4f6e77','#1d2a30'],haz_lava:['#7f4a2d','#2d140d'],haz_mercury:['#7e858d','#262a2f'],haz_void:['#5a4e78','#1c1829']}[s];if(P)colors={...colors,wall:P[0],wallDark:P[1]}}return drawWallWithOuterPalette(px,py,x,y,colors)}
function drawWallWithOuterPalette(px,py,x,y,colors){
    if(state?.outerWall94?.[key85(x,y)]){
      const z=regionIndex(),c=z===0?{...colors,wall:'#4d3a33',wallDark:'#211a17'}:z===1?{...colors,wall:'#4b5a54',wallDark:'#202925'}:z===2?{...colors,wall:'#594353',wallDark:'#261e25'}:z===3?{...colors,wall:'#4e5559',wallDark:'#202529'}:{...colors,wall:'#5d5845',wallDark:'#27241c'};
      return drawFloor11AwareWall(px,py,x,y,c)
    }
    return drawFloor11AwareWall(px,py,x,y,colors)
  }
function drawFloor11AwareWall(px,py,x,y,colors){
    if(state?.floor!==11)return drawTintedRegionWall(px,py,x,y,colors);
    const h=hash2(x,y,11851),h2=hash2(x,y,11899);X.save();X.fillStyle='#292e30';X.fillRect(px,py,32,32);X.fillStyle=h>.5?'#666d70':'#596064';X.fillRect(px+2,py+3,28,26);X.fillStyle='#777e81';X.fillRect(px+3,py+4,26,3);X.fillStyle='#3d4346';X.fillRect(px+3,py+25,26,5);X.strokeStyle='rgba(25,28,29,.55)';X.beginPath();X.moveTo(px+3,py+12);X.lineTo(px+29,py+12);X.moveTo(px+3,py+21);X.lineTo(px+29,py+21);X.moveTo(px+(h>.5?11:19),py+4);X.lineTo(px+(h>.5?9:21),py+29);X.stroke();if(h2>.7){X.fillStyle='rgba(75,101,73,.33)';X.fillRect(px+4,py+23,10,3);X.fillRect(px+8,py+20,3,5)}X.restore()
  }
function drawTintedRegionWall(px,py,x,y,colors){
    drawRegionWallWithEdges(px,py,x,y,colors);const a=state&&ART60[state.floor];if(!a)return;X.save();X.globalCompositeOperation='multiply';X.fillStyle=a.tint.replace(/\.\d+\)$/,'.48)');X.fillRect(px,py,32,32);X.globalCompositeOperation='screen';X.fillStyle=a.glow;X.fillRect(px+2,py+2,28,26);X.globalCompositeOperation='source-over';X.fillStyle='rgba(255,255,255,.08)';X.fillRect(px+2,py+1,28,2);X.fillStyle='rgba(0,0,0,.30)';X.fillRect(px+2,py+27,28,5);if([16,18,20].includes(state.floor)){X.strokeStyle='rgba(233,166,100,.13)';X.strokeRect(px+4.5,py+6.5,23,20);for(const [ox,oy] of [[6,8],[25,8],[6,24],[25,24]])X.fillRect(px+ox,py+oy,2,2)}else if([21,25].includes(state.floor)){X.strokeStyle='rgba(94,228,236,.16)';X.beginPath();X.moveTo(px+5,py+17);X.lineTo(px+27,py+17);X.stroke()}else if(state.floor===22){X.strokeStyle='rgba(255,225,146,.16)';X.strokeRect(px+5.5,py+6.5,21,19)}X.restore();
  }
function drawRegionWallWithEdges(px,py,x,y,colors){
    drawRegionWall(px,py,x,y,colors);
    const L=state.map[y]?.[x-1]===TT.WALL,R=state.map[y]?.[x+1]===TT.WALL,U=state.map[y-1]?.[x]===TT.WALL,D=state.map[y+1]?.[x]===TT.WALL;
    if(!U){X.fillStyle='rgba(255,232,196,.07)';X.fillRect(px+2,py+1,28,2)}
    if(!L){X.fillStyle='rgba(255,224,184,.08)';X.fillRect(px+1,py+5,3,26)}
    if(!R){X.fillStyle='rgba(0,0,0,.26)';X.fillRect(px+28,py+5,4,27)}
    if(!D){X.fillStyle='rgba(0,0,0,.22)';X.fillRect(px+2,py+27,28,5)}
    if((!L&&!U)||(!R&&!U)){X.fillStyle='rgba(220,170,108,.10)';X.fillRect(px+(!L?3:25),py+4,4,5)}
  }
function drawRegionWall(px,py,x,y,colors){const z=regionIndex(),p=wallPalette[z],L=isWall(x-1,y),R=isWall(x+1,y),U=isWall(x,y-1);X.fillStyle=p.dark;X.fillRect(px,py,32,32);X.fillStyle=p.face;X.fillRect(px,py+5,32,27);if(z===0){X.fillStyle='rgba(233,164,102,.08)';X.fillRect(px,py+9,32,2);X.fillRect(px,py+22,32,1)}else if(z===1){X.fillStyle='rgba(186,207,188,.06)';X.fillRect(px,py+13,32,1);X.fillRect(px,py+25,32,1)}else if(z===2){X.fillStyle='rgba(235,185,218,.055)';X.fillRect(px,py+11,32,1);X.fillRect(px,py+24,32,1)}else if(z===3){X.fillStyle='rgba(199,158,119,.08)';X.fillRect(px+5,py+8,2,2);X.fillRect(px+25,py+23,2,2)}else{X.strokeStyle='rgba(235,201,107,.08)';X.strokeRect(px+6.5,py+9.5,19,16)}if(!U){X.fillStyle=p.top;X.fillRect(px,py,32,8);X.fillStyle=p.edge;X.fillRect(px,py+7,32,2)}if(!L){X.fillStyle='rgba(255,230,188,.10)';X.fillRect(px,py+5,2,27)}if(!R){X.fillStyle='rgba(0,0,0,.32)';X.fillRect(px+29,py+5,3,27)}}
function drawRegionalAtmosphere(now){
    if(state?.branchContext105?.id==='mine')return;
    if(!isMobileViewport())return drawRegionalAtmosphereDesktop(now);const z=regionIndex();X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);if(z===0){const g=X.createRadialGradient(VIEW.w*.52,VIEW.h*.30,12,VIEW.w*.52,VIEW.h*.30,VIEW.h*.68);g.addColorStop(0,'rgba(199,74,35,.055)');g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(0,0,VIEW.w,VIEW.h)}else if(z===1){X.strokeStyle='rgba(190,210,199,.07)';for(let i=0;i<8;i++){const x=(i*91+now*.035)%(VIEW.w+60)-30,y=(i*71+now*.09)%(VIEW.h+60)-30;X.beginPath();X.moveTo(x,y);X.lineTo(x-5,y+13);X.stroke()}}else if(z===2){X.fillStyle='rgba(195,92,166,.025)';X.fillRect(0,0,VIEW.w,VIEW.h)}else if(z===3){X.fillStyle=state.floor===16?'rgba(224,73,29,.035)':'rgba(115,68,39,.02)';X.fillRect(0,0,VIEW.w,VIEW.h)}else{for(let i=0;i<6;i++){const x=hash2(i,7,19)*VIEW.w,y=(hash2(i,11,17)*VIEW.h-now*.008+VIEW.h)%VIEW.h;X.fillStyle='rgba(237,201,98,.05)';X.fillRect(x,y,2,2)}}X.restore()
  }
function drawRegionalAtmosphereDesktop(now){
  const z=regionIndex();X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.globalCompositeOperation='screen';
  if(z===0){
    const g=X.createRadialGradient(VIEW.w*.52,VIEW.h*.30,12,VIEW.w*.52,VIEW.h*.30,VIEW.h*.72);g.addColorStop(0,'rgba(199,74,35,.075)');g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(0,0,VIEW.w,VIEW.h);
    for(let i=0;i<5;i++){const x=VIEW.w*(.10+i*.22),y=28+Math.sin(now/850+i)*4;X.fillStyle='rgba(203,71,38,.045)';X.fillRect(x-12,y-6,24,16)}
  }else if(z===1){
    X.strokeStyle='rgba(190,210,199,.10)';for(let i=0;i<22;i++){const x=(i*67+(now*.045))%(VIEW.w+80)-40,y=(i*43+(now*.13))%(VIEW.h+80)-40;X.beginPath();X.moveTo(x,y);X.lineTo(x-8,y+18);X.stroke()}
    const g=X.createLinearGradient(0,VIEW.h*.35,0,VIEW.h);g.addColorStop(0,'rgba(184,204,191,0)');g.addColorStop(1,'rgba(165,192,177,.065)');X.fillStyle=g;X.fillRect(0,0,VIEW.w,VIEW.h);
  }else if(z===2){
    for(let i=0;i<5;i++){const y=VIEW.h*(.22+i*.15)+Math.sin(now/900+i)*13;X.strokeStyle=`rgba(195,92,166,${.035+i*.004})`;X.lineWidth=8;X.beginPath();X.moveTo(-30,y);X.bezierCurveTo(VIEW.w*.3,y-34,VIEW.w*.66,y+37,VIEW.w+30,y-8);X.stroke()}X.lineWidth=1;
  }else if(z===3){
    const g=X.createLinearGradient(0,0,0,VIEW.h);g.addColorStop(0,'rgba(115,129,126,.025)');g.addColorStop(1,state.floor===16?'rgba(224,73,29,.085)':'rgba(115,68,39,.045)');X.fillStyle=g;X.fillRect(0,0,VIEW.w,VIEW.h);
    if(state.floor===16){for(let i=0;i<9;i++){const x=(i*79+now*.018)%VIEW.w,y=VIEW.h*.75+(i%3)*18;X.fillStyle='rgba(222,85,30,.055)';X.fillRect(x,y,3,2)}}
  }else{
    for(let i=0;i<18;i++){const x=hash2(i,7,19)*VIEW.w+Math.sin(now/700+i)*12,y=(hash2(i,11,17)*VIEW.h-(now*.011*(1+i%3))+VIEW.h+30)%(VIEW.h+30);X.fillStyle='rgba(237,201,98,.075)';X.fillRect(x,y,2+(i%2),2+(i%2))}
    for(let i=0;i<4;i++){const x=VIEW.w*(.15+i*.24),y=VIEW.h*.7+Math.sin(now/800+i)*25;X.strokeStyle='rgba(97,55,110,.06)';X.lineWidth=7;X.beginPath();X.moveTo(x,VIEW.h+20);X.quadraticCurveTo(x+35,y,x-10,y-80);X.stroke()}X.lineWidth=1;
  }
  X.globalCompositeOperation='source-over';X.restore();
}
const LAVA_ART_CACHE=new Map(),FIRE_ART_CACHE=new Map(),KEEPER_BRIDGE_ART=new Map();
function lavaSprite(variant,frame,rowPhase=0){
 const key=[variant,rowPhase,frame].join(':');if(LAVA_ART_CACHE.has(key))return LAVA_ART_CACHE.get(key);
 const c=document.createElement('canvas');c.width=c.height=48;const q=c.getContext('2d'),image=q.createImageData(48,48),phase=frame/24*Math.PI*2,ox=variant*48,oy=rowPhase*48,tau=Math.PI*2;
 // Periodic world-space flow: the same molten channels continue through tile boundaries.
 for(let yy=0;yy<48;yy++)for(let xx=0;xx<48;xx++){
  const u=(xx+ox)/192*tau,v=(yy+oy)/336*tau,warp=Math.sin(v*3+phase)*.42+Math.sin(u*2-v*2-phase)*.24;
  const flow=Math.sin(u*3+warp+Math.sin(phase)*.35)+Math.cos(v*5-u+Math.sin(u+phase)*.6)+Math.sin(u*2+v*3-phase)*.45;
  const vein=Math.max(0,1-Math.abs(flow)*1.6),heat=Math.pow(vein,1.5),grain=hash2(xx+ox,yy+oy,745)*.10,basalt=Math.max(0,Math.abs(flow)-1.15),glow=.035*Math.sin(u*7+v*8+phase*2);
  const i=(yy*48+xx)*4;image.data[i]=Math.min(255,155+heat*97-basalt*67+grain*45);image.data[i+1]=Math.max(18,47+heat*147-basalt*34+grain*17+glow*180);image.data[i+2]=Math.max(13,22+heat*51-basalt*10+grain*9);image.data[i+3]=255;
 }
 q.putImageData(image,0,0);
 for(let i=0;i<3;i++){
  const xx=7+hash2(variant+rowPhase*4,i,741)*34,yy=7+hash2(i,variant+rowPhase*4,742)*34,life=(frame/24+hash2(i,variant+rowPhase*4,746))%1,r=1+Math.sin(life*Math.PI)*2.8;
  if(life>.82)continue;q.strokeStyle=`rgba(255,213,116,${Math.sin(life*Math.PI)*.7})`;q.lineWidth=.9;q.beginPath();q.ellipse(xx,yy,r,r*.58,0,0,Math.PI*2);q.stroke();q.fillStyle='#f9be69';q.fillRect(xx-1,yy-1,1.5,1);
 }
 LAVA_ART_CACHE.set(key,c);return c;
}
function drawLavaTerrain(q,px,py,x,y,now){
 const visible=state?.visible?.has(k(x,y)),time=TERRAIN_MOTION54.matches||!visible?0:now,frame=Math.floor(time/90)%24,variant=(x%4+4)%4,rowPhase=(y%7+7)%7;
 q.save();const alpha=q.globalAlpha;q.imageSmoothingEnabled=false;q.lineCap='round';q.lineJoin='round';q.setLineDash([]);q.beginPath();q.rect(px,py,TILE,TILE);q.clip();q.drawImage(lavaSprite(variant,frame,rowPhase),px,py,TILE,TILE);
 const borders=[[0,0,32,0],[0,32,32,32],[0,0,0,32],[32,0,32,32]],neighbors=[[0,-1],[0,1],[-1,0],[1,0]];
 for(let i=0;i<4;i++){
  const [dx,dy]=neighbors[i];if(state?.map[y+dy]?.[x+dx]===TT.LAVA)continue;
  const [ax,ay,bx,by]=borders[i],pulse=.68+.15*Math.sin(time/260+x*.8+y*.3);
  const hot=q.createLinearGradient(px+ax,py+ay,px+ax-dx*7,py+ay-dy*7);hot.addColorStop(0,'#ffcc6cb0');hot.addColorStop(.3,'#f29a4850');hot.addColorStop(1,'#ef6e3000');q.fillStyle=hot;q.fillRect(dx?px+(dx>0?25:0):px,dy?py+(dy>0?25:0):py,dx?7:32,dy?7:32);
  q.strokeStyle=`rgba(255,221,128,${pulse})`;q.lineWidth=1.3;q.beginPath();q.moveTo(px+ax,py+ay);q.lineTo(px+bx,py+by);q.stroke();
  for(let n=0;n<3;n++){
   const t=(time/1150+hash2(x+i,y+n,748))%1,pos=4+n*11,xx=px+(dx?ax-dx*(1+t*5):pos),yy=py+(dy?ay-dy*(1+t*5):pos),rise=4+t*18;
   q.globalAlpha=alpha*(1-t)*.38;q.strokeStyle=n%2?'#e89449':'#ffe1a0';q.lineWidth=2.8-t*1.8;q.beginPath();q.moveTo(xx,yy);q.bezierCurveTo(xx-3,yy-rise*.35,xx+4,yy-rise*.7,xx+Math.sin(time/300+n)*3,yy-rise);q.stroke();
   q.globalAlpha=alpha*(1-t)*.55;q.fillStyle='#ffcc7b';q.fillRect(xx+Math.sin(t*7+n)*3,yy-rise,1.2,1.2);q.globalAlpha=alpha;
  }
 }
 q.restore();return true;
}
function fireFloorSprite(variant,frame){
 const key=[variant,frame].join(':');if(FIRE_ART_CACHE.has(key))return FIRE_ART_CACHE.get(key);
 const c=document.createElement('canvas');c.width=c.height=48;const q=c.getContext('2d'),phase=frame/24*Math.PI*2,{poly:polygon}=drawKit(q);
 const glow=q.createRadialGradient(24,31,2,24,30,25);glow.addColorStop(0,'#e478285a');glow.addColorStop(.65,'#bc4d2438');glow.addColorStop(1,'#b43a1700');q.fillStyle=glow;q.fillRect(0,0,48,48);
 for(let i=0;i<8;i++){const xx=8+hash2(variant,i,752)*31,yy=21+hash2(i,variant,753)*19;polygon('#422d2480',[[xx-4,yy],[xx-2,yy-3],[xx+4,yy-2],[xx+5,yy+2],[xx,yy+4]]);q.strokeStyle='#e77b3a60';q.lineWidth=.7;q.beginPath();q.moveTo(xx-3,yy);q.lineTo(xx,yy+1);q.lineTo(xx+2,yy-1);q.stroke();}
 // Licks rise from the ground perimeter, with dark outer flame, orange body and a pale core.
 for(let i=0;i<10;i++){
  const angle=i/10*Math.PI*2,x=24+Math.cos(angle)*18,y=30+Math.sin(angle)*11,h=10+hash2(variant,i,754)*7+Math.sin(phase+i*1.73+variant)*5,sway=Math.sin(phase+i*2.2)*3.5,w=2.6+hash2(i,variant,755)*1.8;
  const flame=(color,scale)=>{q.fillStyle=color;q.beginPath();q.moveTo(x-w*scale,y);q.bezierCurveTo(x-w*scale*1.5,y-h*.25,x+sway+3*scale,y-h*.5,x+sway,y-h*scale);q.bezierCurveTo(x+sway-2*scale,y-h*.55,x+w*scale*1.6,y-h*.3,x+w*scale,y);q.closePath();q.fill();};
  flame('#a43425b8',1);flame('#e55d25df',.84);flame('#f6a33bec',.62);flame('#ffe2a1df',.35);
 }
 for(let i=0;i<6;i++){const t=(frame/24+hash2(variant,i,756))%1,x=8+i*6+Math.sin(phase+i)*2,y=27-t*23;q.globalAlpha=(1-t)*.8;q.fillStyle=i%3?'#ffce79':'#804331';q.fillRect(x,y,i%2?1:1.7,1.5);}q.globalAlpha=1;
 FIRE_ART_CACHE.set(key,c);return c;
}
function drawFireFloor(q,px,py,size,x,y,now){
 const visible=state?.visible?.has(k(x,y)),time=TERRAIN_MOTION54.matches||!visible?0:now,variant=Math.floor(hash2(x,y,757)*8),frame=Math.floor(time/80)%24;
 q.save();q.imageSmoothingEnabled=false;q.globalCompositeOperation='source-over';q.drawImage(fireFloorSprite(variant,frame),px,py,size,size);q.restore();return true;
}
function drawOxidizedChain(q,{links=5,start=-9,step=4.3,phase=0}={}){
 for(let i=0;i<links;i++){const n=i+phase,xx=start+i*step,yy=Math.sin(n*.8)*2,angle=n%2?.85:-.45;q.strokeStyle='#211c1b';q.lineWidth=2.8;q.beginPath();q.ellipse(xx+.7,yy+.8,3.7,2,angle,0,Math.PI*2);q.stroke();q.strokeStyle=n%2?'#985e41':'#c38755';q.lineWidth=1.6;q.beginPath();q.ellipse(xx,yy,3.7,2,angle,0,Math.PI*2);q.stroke();q.strokeStyle='#dcc0a0';q.lineWidth=.55;q.beginPath();q.ellipse(xx,yy-.35,3.5,1.8,angle,Math.PI,Math.PI*1.8);q.stroke();}
}
function drawKeeperBridge(q,px,py,d){
 const corner=d.corner54??[[-1,-1],[1,-1],[1,1],[-1,1]].reduce((bits,[dx,dy],i)=>bits|(state.map[d.y+dy]?.[d.x+dx]===TT.LAVA?1<<i:0),0),variant=Math.floor(hash2(d.x,d.y,749)*4),chains=d.chains54||0,key=[d.edge54,corner,chains,variant,chains&1?d.x:0,chains&2?d.y:0].join(':');let c=KEEPER_BRIDGE_ART.get(key);
 if(!c){c=document.createElement('canvas');c.width=c.height=32;const a=c.getContext('2d'),edge=d.edge54;
  a.fillStyle=edge?'#66665d':'#858679';a.fillRect(0,0,32,32);
  const shade=a.createLinearGradient(0,0,32,32);shade.addColorStop(0,'#c1bba32a');shade.addColorStop(1,'#20262b24');a.fillStyle=shade;a.fillRect(0,0,32,32);
  for(let i=0;i<52;i++){const xx=hash2(variant,i,750)*31,yy=hash2(i,variant,751)*31;a.fillStyle=i%3?'#c7c0a125':'#20282c40';a.fillRect(xx,yy,i%5===0?2:1,1);}
  a.strokeStyle='#3c4542';a.lineWidth=.8;a.beginPath();a.moveTo(0,16);a.lineTo(32,16);a.moveTo(16,0);a.lineTo(16,16);a.moveTo(7,16);a.lineTo(7,32);a.stroke();a.strokeStyle='#b9b69b66';a.beginPath();a.moveTo(0,17);a.lineTo(32,17);a.stroke();
  for(const [bit,rotation]of [[1,Math.PI/2],[2,-Math.PI/2],[4,Math.PI],[8,0]])if(edge&bit){
   a.save();a.translate(16,16);a.rotate(rotation);a.translate(-16,-16);a.fillStyle='#292e30';a.fillRect(0,0,32,3);a.fillStyle='#a8a58d';a.fillRect(0,3,32,2);a.fillStyle='#535a55';a.fillRect(0,5,32,3);a.strokeStyle='#c4b991';a.lineWidth=.8;a.beginPath();for(let xx=0;xx<32;xx+=8){a.moveTo(xx+1,5);a.lineTo(xx+4,7);a.lineTo(xx+7,5)}a.stroke();a.restore();
  }
  for(const [bit,rotation]of [[1,0],[2,Math.PI/2],[4,Math.PI],[8,-Math.PI/2]])if(corner&bit){
   a.save();a.translate(16,16);a.rotate(rotation);a.translate(-16,-16);a.fillStyle='#171b1d';a.beginPath();a.moveTo(0,0);a.lineTo(8,0);a.lineTo(0,8);a.closePath();a.fill();a.strokeStyle='#a29e86';a.lineWidth=1;a.beginPath();a.moveTo(1,8);a.lineTo(8,1);a.stroke();a.restore();
  }
  for(const [bit,rotation,axis]of [[1,0,d.x],[2,Math.PI/2,d.y]])if(chains&bit){a.save();a.beginPath();a.rect(0,0,32,32);a.clip();a.translate(16,16);a.rotate(rotation);drawOxidizedChain(a,{links:9,start:-16,step:4,phase:axis*8});a.restore();}
  KEEPER_BRIDGE_ART.set(key,c);
 }q.drawImage(c,px,py,TILE,TILE);return true;
}
function drawLiquidTerrain(tile,px,py,x,y,now){
  const mercury=tile===TT.MERCURY,base=mercury?'#667270':'#264c50',lo=mercury?'#3a4141':'#143237',hi=mercury?'#c2cbc5':'#619399',wave=((now/250+x*2+y)%9)|0;
  X.fillStyle=base;X.fillRect(px,py,32,32);X.fillStyle=lo;X.fillRect(px,py+26,32,6);
  X.fillStyle=hi;X.fillRect(px+3+wave,py+7,11,2);X.fillRect(px+18-(wave>>1),py+18,10,2);X.fillStyle='rgba(255,255,255,.15)';X.fillRect(px+6,py+8,4,1);if(mercury&&state.floor===23){const hm=state.floor23?.hydraulicCellMeta?.[k(x,y)];if(hm){const dir=hm.type==='diversion'||hm.type==='spillway'?1:-1,shift=((now/180+x+y)%12)|0;X.strokeStyle='rgba(235,252,250,.34)';X.beginPath();X.moveTo(px+(dir>0?3+shift:29-shift),py+13);X.lineTo(px+(dir>0?10+shift:22-shift),py+13);X.stroke();X.fillStyle='rgba(55,79,78,.25)';X.fillRect(px+2,py+27,28,2)}}
  // stitched shoreline: visual continuity matters more than per-tile decoration.
  X.fillStyle=mercury?'rgba(224,228,220,.28)':'rgba(134,171,157,.20)';
  if(!liquidNeighborSame(tile,x,y-1))X.fillRect(px,py,32,2);if(!liquidNeighborSame(tile,x+1,y))X.fillRect(px+30,py,2,32);if(!liquidNeighborSame(tile,x,y+1))X.fillRect(px,py+30,32,2);if(!liquidNeighborSame(tile,x-1,y))X.fillRect(px,py,2,32);
}
function drawAuthoredTerrain(tile,px,py,x,y,now){
  const seed=hash2(x,y,state.floor),wave=((now/260+x*1.7+y*.9)%8)|0;
  if(state.floor===23&&tile===TT.SWITCH){
    const sw=state.switches?.find(v=>v.x===x&&v.y===y),on=!!sw?.used,pulse=.42+.14*Math.sin(now/280+x+y);
    X.fillStyle='#263036';X.fillRect(px+2,py+4,28,27);X.fillStyle='#4b5b61';X.fillRect(px+4,py+6,24,20);X.fillStyle='#1d2529';X.fillRect(px+7,py+9,18,11);
    X.strokeStyle='#b78a49';X.lineWidth=2;X.beginPath();X.arc(px+16,py+15,6,0,Math.PI*2);X.stroke();X.beginPath();X.moveTo(px+16,py+8);X.lineTo(px+16,py+22);X.moveTo(px+9,py+15);X.lineTo(px+23,py+15);X.stroke();X.lineWidth=1;
    X.fillStyle=on?'#7fc8bd':'#d2bd73';X.fillRect(px+8,py+25,16,3);X.fillStyle=on?`rgba(145,240,225,${pulse})`:`rgba(227,209,137,${pulse})`;X.fillRect(px+11,py+10,10,4);
    X.fillStyle='#8b6736';X.fillRect(px+4,py+29,24,3);return true
  }
  if(state.floor===24){
    if(tile===TT.WOOD_FLOOR||tile===TT.DARK_WOOD||tile===TT.GILDED_FLOOR){
      const zone=state.floor24?.zoneByCell?.[k(x,y)]||'',vertical=/gallery|haengrang|north-eaves/.test(zone),dark=tile===TT.DARK_WOOD,grand=tile===TT.GILDED_FLOOR;
      const bg=grand?'#94613a':dark?'#452c1d':'#77533a',line=grand?'rgba(91,54,31,.62)':dark?'rgba(35,21,13,.60)':'rgba(67,42,27,.58)',hi=grand?'rgba(242,202,132,.09)':'rgba(235,202,151,.055)';
      X.fillStyle=bg;X.fillRect(px,py,32,32);
      // World-space plank courses: seams continue through tile boundaries and joints are staggered over 4-6 cells.
      const gx=x*32,gy=y*32,spacing=vertical?16:15,plankLen=vertical?224:240;
      if(vertical){
        let off=((spacing-(gx%spacing))%spacing);for(let xx=off;xx<32;xx+=spacing){X.fillStyle=line;X.fillRect(px+xx,py,1,32);X.fillStyle=hi;X.fillRect(px+xx+1,py,1,32)}
        const band=Math.floor((gx+5)/spacing),stagger=((band*53+zone.length*17)%plankLen+plankLen)%plankLen;for(let wy=gy;wy<gy+32;wy++){if(((wy-stagger)%plankLen+plankLen)%plankLen===0){X.fillStyle='rgba(40,22,12,.24)';X.fillRect(px,py+(wy-gy),32,1)}}
      }else{
        let off=((spacing-(gy%spacing))%spacing);for(let yy=off;yy<32;yy+=spacing){X.fillStyle=line;X.fillRect(px,py+yy,32,1);X.fillStyle=hi;X.fillRect(px,py+yy+1,32,1)}
        const band=Math.floor((gy+5)/spacing),stagger=((band*61+zone.length*19)%plankLen+plankLen)%plankLen;for(let wx=gx;wx<gx+32;wx++){if(((wx-stagger)%plankLen+plankLen)%plankLen===0){X.fillStyle='rgba(40,22,12,.24)';X.fillRect(px+(wx-gx),py,1,32)}}
      }
      if(grand){X.fillStyle='rgba(223,177,94,.06)';X.fillRect(px,py,32,32)}return true
    }
    if(tile===TT.CARPET){X.fillStyle='#6a352a';X.fillRect(px+1,py+2,30,28);X.fillStyle='#8f4d39';X.fillRect(px+4,py+5,24,22);X.strokeStyle='#cda662';X.strokeRect(px+5.5,py+6.5,21,19);X.strokeStyle='rgba(235,213,163,.28)';X.beginPath();X.moveTo(px+8,py+16);X.lineTo(px+24,py+16);X.moveTo(px+16,py+8);X.lineTo(px+16,py+24);X.stroke();return true}
    if(tile===TT.WINDOW){
      const L=state.map[y]?.[x-1]===TT.WINDOW,R=state.map[y]?.[x+1]===TT.WINDOW,U=state.map[y-1]?.[x]===TT.WINDOW,D=state.map[y+1]?.[x]===TT.WINDOW,horiz=L||R;
      X.fillStyle='#291911';X.fillRect(px,py,32,32);X.fillStyle='#c2b697';X.fillRect(px,py+6,32,21);X.fillStyle='rgba(242,225,184,.11)';X.fillRect(px,py+8,32,4);
      X.strokeStyle='rgba(95,64,43,.72)';X.lineWidth=1;if(horiz){
        for(const xx of [11,21]){X.beginPath();X.moveTo(px+xx,py+7);X.lineTo(px+xx,py+27);X.stroke()}X.beginPath();X.moveTo(px,py+17);X.lineTo(px+32,py+17);X.stroke();
        if(!L){X.fillStyle='#321f15';X.fillRect(px,py+3,5,28)}if(!R){X.fillStyle='#321f15';X.fillRect(px+27,py+3,5,28)}
      }else{
        for(const yy of [13,21]){X.beginPath();X.moveTo(px+5,py+yy);X.lineTo(px+27,py+yy);X.stroke()}X.beginPath();X.moveTo(px+16,py+6);X.lineTo(px+16,py+27);X.stroke();
        if(!U){X.fillStyle='#321f15';X.fillRect(px+2,py+2,28,5)}if(!D){X.fillStyle='#321f15';X.fillRect(px+2,py+27,28,5)}
      }X.lineWidth=1;X.fillStyle='rgba(0,0,0,.22)';X.fillRect(px,py+28,32,4);return true
    }
    if(tile===TT.STONE_PILLAR){X.fillStyle='#23150e';X.fillRect(px+9,py+1,14,31);X.fillStyle='#6d4328';X.fillRect(px+12,py+2,8,28);X.fillStyle='#9a673d';X.fillRect(px+8,py+2,16,5);X.fillRect(px+7,py+27,18,4);X.fillStyle='rgba(245,207,147,.16)';X.fillRect(px+13,py+5,2,20);return true}
    if(tile===TT.SCREEN){X.fillStyle='#2c1c14';X.fillRect(px+1,py+3,30,29);for(let p=0;p<4;p++){const xx=px+3+p*7;X.fillStyle=p%2?'#c9b280':'#bda16b';X.fillRect(xx,py+5,6,24);X.strokeStyle='#68432a';X.strokeRect(xx+.5,py+5.5,5,23);X.fillStyle=p%2?'#6c7b51':'#875a43';X.fillRect(xx+2,py+11+(p%2)*5,2,7)}X.fillStyle='rgba(0,0,0,.24)';X.fillRect(px+1,py+29,30,3);return true}
    if(tile===TT.RACK){X.fillStyle='#291910';X.fillRect(px+3,py+4,26,28);X.fillStyle='#684327';X.fillRect(px+5,py+5,22,24);X.strokeStyle='#a77745';X.strokeRect(px+6.5,py+6.5,19,21);for(let yy=12;yy<=23;yy+=6)X.fillRect(px+7,py+yy,18,2);for(let i=0;i<4;i++){X.fillStyle=['#d2bc82','#7d8f69','#a25d43','#8d6f4c'][i];X.fillRect(px+9+i*4,py+8+(i%2)*7,3,5)}return true}
    if(tile===TT.TABLE){X.fillStyle='#2a180f';X.fillRect(px+5,py+18,22,9);X.fillStyle='#754629';X.fillRect(px+3,py+11,26,9);X.fillStyle='#a66a3c';X.fillRect(px+4,py+11,24,3);X.fillStyle='#d8c39a';X.fillRect(px+12,py+14,8,3);X.fillStyle='#473022';X.fillRect(px+7,py+26,4,5);X.fillRect(px+22,py+26,4,5);return true}
    if(tile===TT.LANTERN_POST||tile===TT.GOLD_LAMP){const glow=.36+.14*Math.sin(now/360+x+y);X.fillStyle='#382116';X.fillRect(px+15,py+8,3,24);X.fillStyle='#8e5b31';X.fillRect(px+10,py+5,13,4);X.fillStyle='#d8a54e';X.fillRect(px+8,py+8,17,11);X.fillStyle=`rgba(255,231,166,${glow})`;X.fillRect(px+11,py+10,11,6);X.strokeStyle='#6e3f22';X.strokeRect(px+8.5,py+8.5,16,10);return true}
    if(tile===TT.WALL_BANNER){X.fillStyle='#392117';X.fillRect(px+6,py+2,20,29);X.fillStyle='#cdbd98';X.fillRect(px+8,py+4,16,23);X.fillStyle='#71503b';X.fillRect(px+14,py+7,4,15);X.fillStyle='#aa684d';X.fillRect(px+11,py+11,10,2);return true}
    if(tile===TT.INCENSE_STAND){X.fillStyle='#392319';X.fillRect(px+11,py+18,10,10);X.fillStyle='#a06a3d';X.fillRect(px+8,py+16,16,4);X.fillStyle='#d0a35a';X.fillRect(px+15,py+8,2,8);X.fillStyle='rgba(221,214,193,.35)';X.fillRect(px+16,py+5,1,4);return true}
  }
  if(tile===TT.WATER||tile===TT.MERCURY){drawLiquidTerrain(tile,px,py,x,y,now);return true}
  if(tile===TT.PAPER_BRIDGE){const wood=regionIndex()===1&&seed>.5;X.fillStyle='#5f5748';X.fillRect(px+3,py+5,26,25);X.fillStyle=wood?'#8f663f':'#d9cfb1';X.fillRect(px+5,py+4,22,23);X.fillStyle=wood?'#c08a4f':'#eee1c1';X.fillRect(px+6,py+5,20,3);X.strokeStyle=wood?'#6d4c31':'#8c816c';for(let q=0;q<4;q++){X.beginPath();X.moveTo(px+6,py+9+q*5);X.lineTo(px+26,py+9+q*5);X.stroke()}if(wood){X.fillStyle='rgba(240,216,166,.18)';X.fillRect(px+16,py+6,1,18)}else if(seed>.6){X.fillStyle='#9c927b';X.fillRect(px+17,py+6,1,18)}return true}
  if(tile===TT.TABLE){X.fillStyle='#21120c';X.fillRect(px+4,py+11,24,17);X.fillStyle='#70452a';X.fillRect(px+3,py+6,26,16);X.fillStyle='#a66a3c';X.fillRect(px+4,py+6,24,3);if(seed>.45){X.fillStyle='#d6c49c';X.fillRect(px+9,py+11,6,3);X.fillStyle='#7a2e24';X.fillRect(px+20,py+12,4,4)}X.fillStyle='#372015';X.fillRect(px+6,py+24,4,5);X.fillRect(px+22,py+24,4,5);return true}
  if(tile===TT.SCREEN){X.fillStyle='#23100d';X.fillRect(px+4,py+3,24,29);X.fillStyle='#752c27';X.fillRect(px+6,py+4,20,24);X.fillStyle='#bd6c50';X.fillRect(px+6,py+4,20,2);X.fillRect(px+6,py+26,20,2);X.fillStyle='rgba(230,183,139,.19)';for(let q=0;q<3;q++)X.fillRect(px+9+q*6,py+7,2,17);return true}
  if(tile===TT.GRASS){X.fillStyle='#17281a';X.fillRect(px,py,32,32);X.fillStyle='#325438';for(let q=0;q<9;q++){const xx=px+3+(q*11+x*3+y)%27,yy=py+18+(q%4)*3;X.fillRect(xx,yy,2,9-(q%4));X.fillRect(xx-2,yy+2,2,2)}if(seed>.76){X.fillStyle='#aa7b6f';X.fillRect(px+20,py+20,2,2)}return true}
  if(tile===TT.HEDGE){X.fillStyle='#0f1b11';X.fillRect(px,py,32,32);X.fillStyle='#315236';for(let yy=3;yy<29;yy+=7)for(let xx=2+(yy%2);xx<29;xx+=8)X.fillRect(px+xx,py+yy,7,6);X.fillStyle='#52714d';X.fillRect(px+6,py+5,5,3);X.fillRect(px+20,py+17,5,3);X.fillStyle='rgba(0,0,0,.35)';X.fillRect(px,py+29,32,3);return true}
  if(tile===TT.RAFT){X.fillStyle='#17100b';X.fillRect(px+2,py+7,28,22);for(let q=0;q<5;q++){X.fillStyle=q%2?'#81593a':'#6c482c';X.fillRect(px+3,py+7+q*4,26,3)}X.fillStyle='#bfa06a';X.fillRect(px+15,py+1,2,13);X.fillStyle='#3a271a';X.fillRect(px+4,py+27,24,2);return true}
  if(tile===TT.FAKE_DOOR){drawDoor(px,py,false);X.fillStyle='rgba(151,62,91,.19)';X.fillRect(px+8,py+7,16,18);X.fillStyle='#8a4c68';X.fillRect(px+23,py+11,2,2);return true}
  if(tile===TT.LOCKED_GATE){X.fillStyle='#151414';X.fillRect(px+2,py+2,28,30);X.fillStyle='#55514a';X.fillRect(px+3,py+3,26,5);X.fillStyle='#0d0e0f';for(let q=0;q<5;q++)X.fillRect(px+5+q*5,py+7,2,23);X.fillStyle='#c0914c';X.fillRect(px+13,py+14,7,7);X.fillStyle='#2b2115';X.fillRect(px+15,py+16,3,5);return true}
  if(tile===TT.KEY_TILE){X.fillStyle='rgba(184,136,62,.12)';X.fillRect(px+4,py+4,24,24);X.strokeStyle='#dfb05b';X.lineWidth=3;X.beginPath();X.arc(px+11,py+12,5,0,Math.PI*2);X.stroke();X.beginPath();X.moveTo(px+15,py+15);X.lineTo(px+27,py+27);X.moveTo(px+22,py+22);X.lineTo(px+26,py+18);X.stroke();X.lineWidth=1;return true}
  if(tile===TT.STAMINA_PAD){const on=(Math.floor(now/240)+x+y)%2;X.fillStyle='#152326';X.fillRect(px+4,py+4,24,24);X.strokeStyle=on?'#a4c8c7':'#68989b';X.strokeRect(px+5.5,py+5.5,21,21);X.fillStyle='#91bdbf';X.fillRect(px+14,py+8,4,16);X.fillRect(px+9,py+14,14,4);return true}
  if(tile===TT.PEACH_TREE){X.fillStyle='#2c2117';X.fillRect(px+14,py+13,5,18);X.fillStyle='#29462f';for(const[ox,oy,w,h]of[[6,9,11,8],[14,5,10,9],[19,10,10,8],[9,15,15,7]])X.fillRect(px+ox,py+oy,w,h);X.fillStyle='#d78a88';X.fillRect(px+9,py+10,3,3);X.fillRect(px+23,py+13,3,3);X.fillRect(px+17,py+7,3,3);X.fillStyle='#f0b0a6';X.fillRect(px+10,py+10,1,1);return true}
  if(tile===TT.SECRET_DOOR){X.fillStyle='#33271a';X.fillRect(px+1,py+1,30,31);X.strokeStyle='#7e693d';X.strokeRect(px+4.5,py+4.5,23,23);X.fillStyle='rgba(215,179,87,.18)';X.fillRect(px+15,py+7,2,18);return true}
  if(tile===TT.PAVILION){X.fillStyle='#302117';X.fillRect(px+8,py+17,16,12);X.fillStyle='#a55d3f';X.fillRect(px+6,py+13,20,4);X.fillRect(px+10,py+10,12,3);X.fillRect(px+14,py+7,4,3);X.fillStyle='#d5a06c';X.fillRect(px+10,py+17,2,10);X.fillRect(px+20,py+17,2,10);return true}
  if(tile===TT.LAVA)return drawLavaTerrain(X,px,py,x,y,now);
  if(tile===TT.VOID){X.fillStyle='#010102';X.fillRect(px,py,32,32);X.fillStyle='#2b1832';for(let q=0;q<4;q++){const xx=(q*9+x*3+Math.floor(now/500))%29,yy=(q*13+y*5)%29;X.fillRect(px+2+xx,py+2+yy,2,2)}X.fillStyle='rgba(143,84,162,.25)';X.fillRect(px+15,py+8,2,16);for(const[dx,dy]of DIRS4){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS||state.map[ny][nx]===TT.VOID)continue;X.fillStyle='rgba(119,77,139,.28)';if(dx===1)X.fillRect(px+30,py,2,32);if(dx===-1)X.fillRect(px,py,2,32);if(dy===1)X.fillRect(px,py+30,32,2);if(dy===-1)X.fillRect(px,py,32,2)}return true}
  if(tile===TT.GOLD){X.fillStyle='#3b2c16';X.fillRect(px+2,py+2,28,28);X.strokeStyle='#bf9642';X.strokeRect(px+4.5,py+4.5,23,23);X.fillStyle='#dcb55b';X.fillRect(px+15,py+6,3,20);X.fillRect(px+7,py+15,18,3);if((Math.floor(now/350)+x+y)%5===0){X.fillStyle='#ffecaa';X.fillRect(px+9,py+8,2,2)}return true}
  if(tile===TT.SWITCH){const sw=state.switches?.find(v=>v.x===x&&v.y===y);X.fillStyle=sw?.used?'#40372d':'#704421';X.fillRect(px+7,py+8,18,18);X.strokeStyle=sw?.kind==='cipher'?'#df974b':'#a67c50';X.strokeRect(px+7.5,py+8.5,17,17);X.fillStyle=sw?.used?'#756858':'#d6a45d';X.fillRect(px+15,py+3,3,12);if(sw?.kind==='cipher'){X.fillStyle='#f0d49b';X.font='800 8px monospace';X.fillText('5',px+12,py+22)}return true}
  if(tile===TT.BAMBOO){X.fillStyle='#0d170f';X.fillRect(px,py,32,32);for(let q=0;q<3;q++){const xx=px+7+q*9;X.fillStyle=q===1?'#5c7a59':'#48664b';X.fillRect(xx,py+2,3,30);X.fillStyle='#2b432e';X.fillRect(xx-4,py+8+q*5,6,2);X.fillRect(xx+2,py+15+q*3,7,2)}X.fillStyle='rgba(0,0,0,.34)';X.fillRect(px,py+29,32,3);return true}
  return false;
}
function drawSpecialTerrain(tile,px,py,x,y,now){
   if(tile===TT.SWITCH){const button=mineButton(x,y);if(button)return drawSharedProp(X,tile,px,py,regionIndex(),pressureSwitchVariant105(button));}
  if(tile===TT.ICE){
   X.save();X.fillStyle='#285564';X.fillRect(px,py,32,32);X.fillStyle='#478596';X.fillRect(px+1,py+1,30,30);
   X.fillStyle='#5899a7';X.beginPath();X.moveTo(px+1,py+1);X.lineTo(px+29,py+1);X.lineTo(px+18,py+12);X.lineTo(px+1,py+18);X.fill();
   X.fillStyle='#397181';X.beginPath();X.moveTo(px+31,py+10);X.lineTo(px+31,py+31);X.lineTo(px+8,py+31);X.lineTo(px+19,py+22);X.fill();
   X.lineWidth=1;X.strokeStyle='#79b4c1';X.beginPath();X.moveTo(px,py+12);X.lineTo(px+11,py+15);X.lineTo(px+17,py+24);X.lineTo(px+32,py+21);X.moveTo(px+11,py+15);X.lineTo(px+17,py+8);X.lineTo(px+15,py);X.stroke();
   X.fillStyle='#a2d0d7';X.fillRect(px+4,py+5,7,1);X.fillRect(px+21,py+26,5,1);X.fillStyle='#649eac';X.fillRect(px+5,py+23,3,1);X.restore();return true;
  }
if([23,24].includes(state?.floor)&&drawAuthoredTerrain(tile,px,py,x,y,now))return true;
    const r41=globalThis.__MANRU_TERRAIN_R41__;if(r41?.libraryDesk52?.(tile,px,py,x,y,now)||r41?.specialBefore?.(tile,px,py,x,y,now)){r41?.specialAfter?.(tile,px,py,x,y,now,true);return true}
    let r;if(tile===TT.PORTAL){const p=.5+.5*Math.sin(now/180+x*.7+y*.9);X.save();X.fillStyle='rgba(24,12,35,.78)';X.fillRect(px+4,py+4,24,24);X.strokeStyle=`rgba(192,132,235,${.55+.35*p})`;X.lineWidth=2;X.beginPath();X.ellipse(px+16,py+16,10,12,0,0,Math.PI*2);X.stroke();X.strokeStyle=`rgba(103,218,229,${.35+.35*(1-p)})`;X.beginPath();X.ellipse(px+16,py+16,6,9,0,0,Math.PI*2);X.stroke();X.fillStyle=`rgba(238,221,255,${.35+.35*p})`;for(let i=0;i<4;i++){const a=now/520+i*Math.PI/2;X.fillRect(px+15+Math.cos(a)*9,py+15+Math.sin(a)*10,2,2)}X.restore();r=true}else r=drawPaperBridgeSpecialTerrain(tile,px,py,x,y,now);
    r41?.specialKeyAfter?.(tile,px,py,x,y,now,r);r41?.specialAfter?.(tile,px,py,x,y,now,r);return r;
  }
function drawPaperBridgeSpecialTerrain(tile,px,py,x,y,now){
    const r=drawFloorMaterialSpecialTerrain(tile,px,py,x,y,now);if(!r)return r;const z=region980(),h=hash980(x,y,83),pulse=.5+.5*Math.sin(now/260+x+y);X.save();
    if(tile===TT.PAPER_BRIDGE){const horizontal=[state.map[y]?.[x-1],state.map[y]?.[x+1]].some(t=>t===TT.PAPER_BRIDGE||t===TT.DRAWBRIDGE_DOWN);X.strokeStyle=z===1?'rgba(246,222,172,.30)':'rgba(236,198,133,.20)';X.lineWidth=1;if(horizontal){for(let yy=7;yy<28;yy+=6){X.beginPath();X.moveTo(px+3,py+yy);X.lineTo(px+29,py+yy);X.stroke()}}else{for(let xx=7;xx<28;xx+=6){X.beginPath();X.moveTo(px+xx,py+3);X.lineTo(px+xx,py+29);X.stroke()}}}
    else if(tile===TT.WATER){X.strokeStyle=`rgba(184,235,231,${.08+.07*pulse})`;X.beginPath();X.moveTo(px+4,py+9);X.lineTo(px+13,py+9);X.moveTo(px+18,py+22);X.lineTo(px+28,py+22);X.stroke();if(h>.82){X.fillStyle='rgba(237,194,208,.35)';X.fillRect(px+20,py+13,3,3)}}
    else if(tile===TT.GARDEN_TREE){X.fillStyle='rgba(188,221,164,.11)';X.fillRect(px+8,py+7,8,2);X.fillStyle='rgba(25,45,25,.20)';X.fillRect(px+12,py+26,9,3)}
    else if(tile===TT.MIRROR){X.fillStyle=`rgba(244,238,255,${.06+.07*pulse})`;X.fillRect(px+19,py+9,3,22)}
    else if(tile===TT.RACK||tile===TT.JAR){X.fillStyle='rgba(255,213,149,.07)';X.fillRect(px+6,py+8,16,2)}
    X.restore();return true;
  }
function drawFloorMaterialSpecialTerrain(tile,px,py,x,y,now){
    if(tile===TT.WOOD_FLOOR){
      X.fillStyle='#8d6737'; X.fillRect(px,py,32,32);
      for(let yy=0;yy<32;yy+=6){ X.fillStyle=yy%12===0?'#a77a42':'#946a3a'; X.fillRect(px,py+yy,32,5); X.fillStyle='rgba(246,224,173,.08)'; X.fillRect(px+2,py+yy+1,28,1); }
      X.fillStyle='rgba(58,36,19,.20)'; for(let xx=8;xx<32;xx+=8) X.fillRect(px+xx,py,1,32);
      const grain=hash2(x,y,427);X.fillStyle='rgba(49,29,15,.12)';for(let row=0;row<5;row++){const xx=2+((x*7+y*3+row*11)%15),yy=3+row*6;X.fillRect(px+xx,py+yy,7+grain*8,.5)}X.fillStyle='rgba(231,190,120,.16)';X.fillRect(px+3+(x+y)%17,py+6,2,.6);
      return true;
    }
    if(tile===TT.DARK_WOOD){
      X.fillStyle='#3f281b'; X.fillRect(px,py,32,32);
      for(let yy=1;yy<32;yy+=6){ X.fillStyle=yy%12===1?'#5a3924':'#4b3020'; X.fillRect(px,py+yy,32,4); X.fillStyle='rgba(216,174,120,.05)'; X.fillRect(px+3,py+yy,25,1); }
      X.fillStyle='rgba(24,14,10,.26)'; X.fillRect(px+15,py+2,2,28);
      X.fillStyle='rgba(163,115,71,.14)';for(let row=0;row<5;row++)X.fillRect(px+3+(x+y+row*7)%11,py+3+row*6,9,.5);X.fillStyle='rgba(14,9,6,.16)';X.fillRect(px+1,py+30,30,1);
      return true;
    }
    if(tile===TT.MOON_STONE){
      const garden=regionIndex()===1;X.fillStyle=garden?'#49563f':'#43505a'; X.fillRect(px,py,32,32);
      const cs=[[1,1],[17,1],[1,17],[17,17]]; for(let i=0;i<cs.length;i++){ const [ox,oy]=cs[i]; X.fillStyle=garden?(i%2?'#606b4e':'#788064'):(i%2?'#4d5c66':'#5b6a74'); X.fillRect(px+ox,py+oy,14,14); }
      X.strokeStyle='rgba(221,232,236,.12)'; X.strokeRect(px+.5,py+.5,31,31); X.beginPath(); X.moveTo(px+16.5,py+1); X.lineTo(px+16.5,py+31); X.moveTo(px+1,py+16.5); X.lineTo(px+31,py+16.5); X.stroke();
      for(const[ox,oy]of cs){X.fillStyle='rgba(183,207,207,.09)';X.fillRect(px+ox+1,py+oy+1,12,.6);X.fillStyle='rgba(13,23,27,.16)';X.fillRect(px+ox+13,py+oy+2,1,12);X.fillRect(px+ox+1,py+oy+13,12,1)}if(hash2(x,y,619)>.78){X.strokeStyle='rgba(26,38,43,.28)';X.lineWidth=.6;X.beginPath();X.moveTo(px+20,py+20);X.lineTo(px+24,py+24);X.lineTo(px+23,py+28);X.stroke()}
      return true;
    }
    if(tile===TT.GILDED_FLOOR){
      X.fillStyle=regionIndex()===4?'#3b3c30':'#17130f'; X.fillRect(px,py,32,32);if(regionIndex()===4){X.fillStyle='#51513e';X.fillRect(px+3,py+3,26,1);X.fillStyle='#2d3229';X.fillRect(px+3,py+27,26,2);}
      X.strokeStyle='#8e7638'; X.strokeRect(px+2.5,py+2.5,27,27);
      X.fillStyle='#b79a49'; X.fillRect(px+15,py+4,2,24); X.fillRect(px+4,py+15,24,2);
      X.fillStyle='rgba(255,231,145,.16)'; X.fillRect(px+6,py+6,4,4); X.fillRect(px+22,py+22,4,4); X.fillRect(px+14,py+14,4,4);
      X.fillStyle='#d4b966';X.fillRect(px+15,py+4,.6,24);X.fillRect(px+4,py+15,24,.6);X.fillStyle='rgba(31,24,12,.28)';X.fillRect(px+17,py+17,1,11);X.fillRect(px+17,py+17,11,1);
      return true;
    }
    return drawCarpetSpecialTerrain(tile,px,py,x,y,now);
  }
function drawCarpetSpecialTerrain(tile,px,py,x,y,now){
    if(tile===TT.CARPET){const z=regionIndex(),base=z===2?'#695064':z===4?'#776c45':'#796447',edge=z===2?'#b99ab0':'#c6aa70',line=z===2?'rgba(231,202,224,.18)':'rgba(243,222,170,.18)';X.fillStyle=base;X.fillRect(px,py,32,32);X.fillStyle='rgba(25,18,12,.16)';for(let q=0;q<32;q+=8)X.fillRect(px+q,py,1,32);X.strokeStyle=line;X.beginPath();X.moveTo(px,py+8.5);X.lineTo(px+32,py+8.5);X.moveTo(px,py+23.5);X.lineTo(px+32,py+23.5);X.stroke();X.strokeStyle=edge;X.lineWidth=1;if(state.map[y-1]?.[x]!==TT.CARPET){X.beginPath();X.moveTo(px,py+.5);X.lineTo(px+32,py+.5);X.stroke()}if(state.map[y+1]?.[x]!==TT.CARPET){X.beginPath();X.moveTo(px,py+31.5);X.lineTo(px+32,py+31.5);X.stroke()}if(state.map[y]?.[x-1]!==TT.CARPET){X.beginPath();X.moveTo(px+.5,py);X.lineTo(px+.5,py+32);X.stroke()}if(state.map[y]?.[x+1]!==TT.CARPET){X.beginPath();X.moveTo(px+31.5,py);X.lineTo(px+31.5,py+32);X.stroke()}return true}
    if(tile===TT.KEY_TILE&&state?.keyPlan96){const km=keyPos96(x,y),meta=keyMeta96(km?.keyId);X.fillStyle='rgba(15,12,8,.55)';X.fillRect(px+6,py+9,20,15);X.fillStyle=meta.dark;X.fillRect(px+8,py+11,16,11);X.fillStyle=meta.color;X.fillRect(px+8,py+14,13,4);X.fillRect(px+18,py+11,4,10);X.fillRect(px+21,py+17,4,3);X.fillStyle='rgba(255,255,225,.45)';X.fillRect(px+9,py+14,7,1);return true}
    const r=drawStructureSpecialTerrain(tile,px,py,x,y,now);if(r&&tile===TT.LOCKED_GATE){const d=doorPos96(x,y);if(d){const meta=keyMeta96(d.keyId);X.fillStyle=meta.color;X.fillRect(px+13,py+13,7,3);X.fillRect(px+15,py+16,3,6)}}return r
  }
function drawStructureSpecialTerrain(tile,px,py,x,y,now){
    if(tile===TT.WINDOW&&state.terrainAttachment58?.[k(x,y)]==='standing'){X.fillStyle='#826346';X.fillRect(px+6,py+3,2,27);X.fillRect(px+24,py+3,2,27);X.fillRect(px+6,py+3,20,2);X.fillRect(px+6,py+24,20,2);X.fillStyle='#d2bd90';X.fillRect(px+9,py+6,14,17);X.strokeStyle='#6e5238';X.lineWidth=1;X.beginPath();X.moveTo(px+16,py+6);X.lineTo(px+16,py+23);X.moveTo(px+9,py+14);X.lineTo(px+23,py+14);X.stroke();return true}
    if(tile===TT.WINDOW){
      const z=regionIndex(),frame=['#492419','#32463d','#4f324b','#485057','#4f4b36'][z],edge=['#a85d39','#719680','#a66e95','#879198','#bda454'][z];
      X.fillStyle='#121416';X.fillRect(px,py,32,32);X.fillStyle=frame;X.fillRect(px+2,py+2,28,28);X.fillStyle='#151b1d';X.fillRect(px+6,py+5,20,22);
      X.fillStyle=z===1?'rgba(112,171,165,.24)':z===2?'rgba(173,116,164,.18)':'rgba(137,164,171,.20)';X.fillRect(px+7,py+6,18,20);
      X.strokeStyle=edge;X.lineWidth=2;X.strokeRect(px+5.5,py+4.5,21,23);X.lineWidth=1;X.beginPath();X.moveTo(px+16,py+5);X.lineTo(px+16,py+27);X.moveTo(px+6,py+16);X.lineTo(px+26,py+16);X.stroke();
      X.fillStyle='rgba(240,238,210,.12)';X.fillRect(px+8,py+7,6,2);return true
    }
    if(tile===TT.CARPET){if(regionIndex()===1){X.fillStyle='#8a6a3a';X.fillRect(px+2,py+4,28,24);for(let yy=7;yy<28;yy+=5){X.fillStyle=yy%10===7?'#b78e57':'#9a7546';X.fillRect(px+4,py+yy,24,3)}X.fillStyle='rgba(248,220,162,.10)';X.fillRect(px+5,py+6,22,2);X.fillRect(px+5,py+21,22,1);X.strokeStyle='#d8b16c';X.strokeRect(px+3.5,py+5.5,25,21);return true}X.fillStyle=regionIndex()===2?'#5c2d50':'#6b3023';X.fillRect(px+2,py+4,28,24);X.strokeStyle=regionIndex()===2?'#c487aa':'#c88654';X.strokeRect(px+3.5,py+5.5,25,21);if((x+y)%2===0){X.fillStyle='rgba(238,210,158,.18)';X.fillRect(px+8,py+15,16,2)}return true}
    if(tile===TT.STONE_PATH){X.lineWidth=1;X.fillStyle=regionIndex()===1?'#626a4f':state.floor===11?'#676d70':'#55585a';X.fillRect(px,py,32,32);X.strokeStyle='rgba(225,226,218,.18)';X.strokeRect(px+2.5,py+3.5,27,25);X.strokeStyle='rgba(25,27,28,.28)';X.beginPath();X.moveTo(px+3,py+16);X.lineTo(px+29,py+16);X.moveTo(px+16,py+3);X.lineTo(px+16,py+29);X.stroke();return true}
    if(tile===TT.WOOD_FLOOR){X.fillStyle='#8b693a';X.fillRect(px,py,32,32);for(let yy=0;yy<32;yy+=7){X.fillStyle=(yy/7)%2?'#a87f48':'#987140';X.fillRect(px,py+yy,32,5);X.fillStyle='rgba(248,223,174,.10)';X.fillRect(px,py+yy,32,1)}X.strokeStyle='rgba(57,35,18,.22)';for(let xx=8;xx<32;xx+=8){X.beginPath();X.moveTo(px+xx,py);X.lineTo(px+xx,py+32);X.stroke()}return true}
    if(tile===TT.MOON_STONE){const garden=regionIndex()===1;X.fillStyle=garden?'#4d5c46':'#46525a';X.fillRect(px,py,32,32);X.fillStyle=garden?'#788064':'#56646c';X.fillRect(px+1,py+1,14,14);X.fillRect(px+17,py+17,14,14);X.fillStyle=garden?'#46543e':'#3b464c';X.fillRect(px+17,py+1,14,14);X.fillRect(px+1,py+17,14,14);X.strokeStyle='rgba(221,231,226,.11)';X.strokeRect(px+.5,py+.5,31,31);return true}
    if(tile===TT.DARK_WOOD){X.fillStyle='#3b281d';X.fillRect(px,py,32,32);for(let yy=2;yy<32;yy+=6){X.fillStyle=yy%12===2?'#573a27':'#4a3122';X.fillRect(px,py+yy,32,4);X.fillStyle='rgba(219,174,117,.07)';X.fillRect(px+2,py+yy,27,1)}return true}
    if(tile===TT.GILDED_FLOOR){X.fillStyle=regionIndex()===4?'#3b3c30':'#171511';X.fillRect(px,py,32,32);X.strokeStyle='#8e7639';X.strokeRect(px+2.5,py+2.5,27,27);X.fillStyle='#b89b4a';X.fillRect(px+15,py+4,2,24);X.fillRect(px+4,py+15,24,2);X.fillStyle='rgba(255,228,132,.17)';X.fillRect(px+6,py+6,3,3);X.fillRect(px+23,py+22,3,3);return true}
    if(tile===TT.PAPER_CRANE){X.fillStyle='#eadfc9';X.beginPath();X.moveTo(px+7,py+22);X.lineTo(px+14,py+11);X.lineTo(px+17,py+18);X.lineTo(px+25,py+10);X.lineTo(px+22,py+23);X.lineTo(px+16,py+20);X.closePath();X.fill();X.fillStyle='#e9a8b4';X.fillRect(px+10,py+14,3,3);X.fillStyle='#d7bd67';X.fillRect(px+19,py+16,3,3);return true}
    if(tile===TT.LOTUS_FLOWER){return drawBotanical(X,tile,px,py,x,y,regionIndex())}
    if(tile===TT.GARDEN_TREE){return drawBotanical(X,tile,px,py,x,y,regionIndex())}
    if(tile===TT.INCENSE_STAND){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.IRON_HOOK){X.strokeStyle='#8a8d8b';X.lineWidth=3;X.beginPath();X.moveTo(px+11,py+6);X.lineTo(px+11,py+21);X.quadraticCurveTo(px+12,py+27,px+18,py+24);X.moveTo(px+21,py+7);X.lineTo(px+21,py+17);X.quadraticCurveTo(px+21,py+23,px+16,py+23);X.stroke();return true}
    if(tile===TT.GOLD_LAMP){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.PETAL_MAT){for(let i=0;i<10;i++){const xx=5+((x*11+y*7+i*9)%22),yy=5+((x*3+y*13+i*5)%21);X.fillStyle=i%3===0?'#df9ea4':i%3===1?'#d3aa6d':'#b47e96';X.fillRect(px+xx,py+yy,3,2)}return true}
    if(tile===TT.STONE_PILLAR){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.LANTERN_POST){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.WALL_BANNER){const c=['#9e4230','#416c55','#8e4e7c','#6b4937','#a98c32'][regionIndex()];X.fillStyle='#231b16';X.fillRect(px+5,py+4,22,3);X.fillStyle='#c0a16a';X.fillRect(px+5,py+3,22,2);X.fillStyle=c;X.beginPath();X.moveTo(px+8,py+6);X.lineTo(px+24,py+6);X.lineTo(px+24,py+28);X.lineTo(px+16,py+25);X.lineTo(px+8,py+28);X.closePath();X.fill();X.strokeStyle='#c6a367';X.lineWidth=1;X.stroke();X.fillStyle='#efcb8230';X.fillRect(px+10,py+7,2,17);X.fillStyle='#160b1240';X.fillRect(px+21,py+7,2,17);X.strokeStyle='#dfbb79';X.beginPath();X.moveTo(px+16,py+11);X.lineTo(px+20,py+16);X.lineTo(px+16,py+21);X.lineTo(px+12,py+16);X.closePath();X.stroke();return true}
    // TT.CRATE uses the existing b1ca0 X-braced crate in every region.
    if(tile===TT.CRATE){const v=structureVisualPosition(k(x,y),x,y,now);drawCrateX(X,px+(v.x-x)*TILE,py+(v.y-y)*TILE);return true}
    if(tile===TT.BENCH){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.FLOWERBED){return drawBotanical(X,tile,px,py,x,y,regionIndex())}
    if(tile===TT.ROCK){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.STATUE){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.RACK){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.LOW_FENCE){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.BED){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.BOOK_STACK){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.RUMOR_BED){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.RUMOR_MED_CABINET){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.RUMOR_GAS_PIPE){
      X.save();X.translate(px,py);X.fillStyle='rgba(6,17,17,.34)';X.fillRect(5,6,23,24);
      for(const a of[7,20]){const g=X.createLinearGradient(a,0,a+5,0);g.addColorStop(0,'#344340');g.addColorStop(.35,'#a0ada1');g.addColorStop(.65,'#70877b');g.addColorStop(1,'#344a42');X.fillStyle=g;X.fillRect(a,4,5,24);for(const yy of[6,23]){X.fillStyle='#3c4940';X.fillRect(a-1,yy,7,3);X.fillStyle='#a4ae8c';X.fillRect(a-1,yy,7,.5)}}
      X.fillStyle='#473d2b';X.fillRect(6,13,20,5);X.fillStyle='#b5985b';X.fillRect(7,13,18,1);X.fillStyle='#797e67';X.fillRect(13,12,6,7);
      X.strokeStyle='#433425';X.lineWidth=2.5;X.beginPath();X.arc(16,15.5,5,0,Math.PI*2);X.stroke();X.strokeStyle='#c7a46d';X.lineWidth=1;X.stroke();X.beginPath();X.moveTo(11,15.5);X.lineTo(21,15.5);X.moveTo(16,10.5);X.lineTo(16,20.5);X.stroke();X.fillStyle='#dfc591';X.fillRect(15,14.5,2,2);X.restore();
      return true;
    }
    if(tile===TT.RUMOR_FLOOD_GRATE){
      X.save();X.translate(px,py);X.fillStyle='rgba(7,16,18,.34)';X.fillRect(3,6,27,24);X.fillStyle='#182c31';X.fillRect(4,5,24,23);
      X.fillStyle='#657b7a';X.fillRect(4,5,24,2);X.fillRect(4,5,2,23);X.fillStyle='#354e52';X.fillRect(26,7,2,21);X.fillRect(5,26,23,2);
      for(let a=8;a<=24;a+=4){X.fillStyle='#536f70';X.fillRect(a,8,2,18);X.fillStyle='#a4b8ac';X.fillRect(a,8,.5,18);X.fillStyle='#1b3036';X.fillRect(a+2,9,1,17)}
      for(const yy of[12,21]){X.fillStyle='#344b4e';X.fillRect(6,yy,20,2);X.fillStyle='#829b94';X.fillRect(6,yy,20,.5)}
      for(const[a,b]of[[5,6],[25,6],[5,25],[25,25]]){X.fillStyle='#c3c0a1';X.fillRect(a,b,1,1)}X.fillStyle='rgba(106,138,89,.26)';X.fillRect(6,24,7,2);X.restore();
      return true;
    }
    if(tile===TT.RUMOR_ARCHIVE_PILE){const cs=['#c8b48b','#8d7255','#aa8b62'];for(let i=0;i<5;i++){const xx=5+((i*7+x*3+y)%17),yy=9+i*4;X.fillStyle=cs[i%cs.length];X.fillRect(px+xx,py+yy,15-(i%3)*2,4);X.fillStyle='#5c3c29';X.fillRect(px+xx+2,py+yy+1,8,1)}return true}
    if(tile===TT.RUMOR_WEAPON_RACK){return drawSharedProp(X,tile,px,py,regionIndex(),0,now,!terrainUnlit105(x,y))}
    if(tile===TT.RUMOR_SILK_DIVAN){X.fillStyle='#4a273d';X.fillRect(px+4,py+13,24,13);X.fillStyle='#a95c84';X.fillRect(px+6,py+10,20,12);X.fillStyle='#e1b0c8';X.fillRect(px+8,py+12,7,5);X.fillRect(px+18,py+12,6,5);X.fillStyle='#6b3a57';X.fillRect(px+7,py+22,18,5);return true}
    if(tile===TT.RUMOR_RITUAL_OBELISK){X.fillStyle='#29281f';X.fillRect(px+7,py+26,18,5);X.fillStyle='#7d6a37';X.beginPath();X.moveTo(px+16,py+3);X.lineTo(px+24,py+26);X.lineTo(px+8,py+26);X.closePath();X.fill();X.fillStyle='#e0c363';X.fillRect(px+15,py+9,2,11);X.fillRect(px+12,py+14,8,2);return true}
    if(tile===TT.RUMOR_CHARRED_COUNTER){
      X.save();X.translate(px,py);X.fillStyle='rgba(12,9,7,.32)';X.fillRect(3,27,27,3);X.fillStyle='#31241b';X.fillRect(4,12,24,17);
      for(const a of[5,16]){X.fillStyle='#624d36';X.fillRect(a,14,10,13);X.fillStyle='#443323';X.fillRect(a+1,15,8,11);X.fillStyle='#241d16';X.fillRect(a+5,16,.7,10);X.fillStyle='#ad986e';X.fillRect(a+3,20,1.5,1)}
      const g=X.createLinearGradient(0,8,0,14);g.addColorStop(0,'#9c8060');g.addColorStop(.35,'#736048');g.addColorStop(1,'#3c2f24');X.fillStyle=g;X.fillRect(3,8,26,6);X.fillStyle='#b59870';X.fillRect(4,8,24,.7);
      X.fillStyle='#252320';X.fillRect(5,9,6,2);X.fillRect(8,10,5,3);X.fillRect(21,9,6,2);X.fillStyle='#8e6640';X.fillRect(16,7,6,3);X.fillStyle='#bbb18e';X.fillRect(17,7,4,1);X.strokeStyle='rgba(197,173,135,.22)';X.lineWidth=.5;X.beginPath();X.moveTo(13,10);X.lineTo(25,10);X.stroke();X.restore();
      return true;
    }
    if(tile===TT.RUMOR_INVESTIGATION_BOARD){X.fillStyle='#3e2b1d';X.fillRect(px+3,py+4,26,25);X.fillStyle='#bda77d';X.fillRect(px+5,py+6,22,20);X.strokeStyle='#8b4b3d';X.lineWidth=1;X.beginPath();X.moveTo(px+8,py+10);X.lineTo(px+23,py+21);X.moveTo(px+11,py+23);X.lineTo(px+24,py+9);X.stroke();for(const q of [[8,9],[22,8],[12,21],[24,20]]){X.fillStyle='#d9c49c';X.fillRect(px+q[0],py+q[1],5,4)}return true}
    if(tile===TT.RUMOR_SMUGGLER_BUNDLE){
      X.save();X.translate(px,py);X.fillStyle='rgba(18,13,8,.30)';X.beginPath();X.ellipse(17,27,13,3,0,0,Math.PI*2);X.fill();
      for(const[a,b,w,h]of[[5,13,12,15],[16,8,12,20]]){
       const g=X.createLinearGradient(a,b,a+w,b+h);g.addColorStop(0,'#c5ac7a');g.addColorStop(.42,'#aa8b57');g.addColorStop(1,'#6b5437');X.fillStyle=g;X.beginPath();X.moveTo(a+3,b+2);X.quadraticCurveTo(a-1,b+h*.5,a+1,b+h-2);X.quadraticCurveTo(a+w*.5,b+h+1,a+w-1,b+h-2);X.quadraticCurveTo(a+w+1,b+h*.5,a+w-3,b+2);X.closePath();X.fill();
       X.fillStyle='#bba074';X.fillRect(a+3,b-1,w-6,4);X.fillStyle='#51412b';X.fillRect(a+2,b+2,w-4,1);X.fillStyle='#d7c391';X.fillRect(a+4,b+2,3,.5);
       X.strokeStyle='rgba(61,46,27,.34)';X.lineWidth=.6;X.beginPath();X.moveTo(a+3,b+5);X.quadraticCurveTo(a+5,b+9,a+3,b+h-2);X.moveTo(a+w-3,b+6);X.lineTo(a+w-2,b+h-3);X.stroke();
       for(let j=0;j<4;j++){X.fillStyle='rgba(232,214,166,.20)';X.fillRect(a+3+(j%2)*4,b+6+j*2,2,.5)}
       X.strokeStyle='#695236';X.lineWidth=1;X.beginPath();X.moveTo(a+1,b+9);X.lineTo(a+w-1,b+h-5);X.stroke();X.strokeStyle='#d3bb83';X.lineWidth=.4;X.stroke();
      }X.restore();
      return true;
    }
    if(tile===TT.RUMOR_GREENHOUSE_FRAME){X.strokeStyle='#7b9887';X.lineWidth=3;X.strokeRect(px+5,py+5,22,24);X.strokeStyle='#bad3c6';X.lineWidth=1;X.beginPath();X.moveTo(px+16,py+5);X.lineTo(px+16,py+29);X.moveTo(px+5,py+16);X.lineTo(px+27,py+16);X.stroke();X.fillStyle='rgba(166,216,197,.18)';X.fillRect(px+7,py+7,18,20);X.fillStyle='#4d774c';X.fillRect(px+9,py+21,5,6);X.fillRect(px+19,py+18,4,9);return true}
    return drawLightGrassSpecialTerrain(tile,px,py,x,y,now)
  }
function drawLightGrassSpecialTerrain(tile,px,py,x,y,now){if(tile===TT.LIGHT_GRASS){return drawBotanical(X,tile,px,py,x,y,regionIndex())}return drawHiddenSpecialTerrain(tile,px,py,x,y,now)}
function drawHiddenSpecialTerrain(tile,px,py,x,y,now){
    if(tile===TT.HIDDEN_BRIDGE){const base=state.hiddenBase60?.[k(x,y)]??TT.VOID;drawStairSpecialTerrain(base,px,py,x,y,now);const pulse=.10+.08*Math.sin(now/240+x+y);X.fillStyle=`rgba(100,238,238,${pulse})`;X.fillRect(px+14,py+14,4,4);X.fillStyle=`rgba(230,255,255,${pulse*.7})`;X.fillRect(px+15,py+7,2,3);return true}
    if(tile===TT.HIDDEN_WALL){const base=state.hiddenBase60?.[k(x,y)]??TT.WALL;if(base===TT.BAMBOO)drawStairSpecialTerrain(TT.BAMBOO,px,py,x,y,now);else drawWallTexture(px,py,x,y,regionColors());X.fillStyle='rgba(229,196,122,.07)';X.fillRect(px+15,py+8,2,16);return true}
    if(tile===TT.CRUMBLE){X.strokeStyle='rgba(239,184,126,.48)';X.beginPath();X.moveTo(px+6,py+8);X.lineTo(px+14,py+15);X.lineTo(px+10,py+26);X.moveTo(px+14,py+15);X.lineTo(px+25,py+10);X.moveTo(px+14,py+15);X.lineTo(px+24,py+25);X.stroke();return true}
    const r=drawStairSpecialTerrain(tile,px,py,x,y,now);if(!r)return r;const f=state.floor;
    if(tile===TT.WATER&&[6,10].includes(f)){X.fillStyle='rgba(55,89,92,.12)';X.fillRect(px,py,32,32);X.strokeStyle='rgba(166,188,174,.12)';X.beginPath();X.moveTo(px+3,py+9+(x%4));X.lineTo(px+27,py+9+(x%4));X.stroke()}
    else if(tile===TT.WATER&&f===11){X.fillStyle='rgba(223,91,194,.13)';X.fillRect(px,py,32,32);X.strokeStyle='rgba(255,190,231,.22)';X.beginPath();X.arc(px+16,py+16,8+(x+y)%5,0,Math.PI*1.4);X.stroke()}
    else if(tile===TT.VOID&&[21,25].includes(f)){X.fillStyle='rgba(18,28,83,.32)';X.fillRect(px,py,32,32);X.fillStyle='rgba(69,232,238,.28)';X.fillRect(px+(x*7+y*3)%27+2,py+(x*5+y*11)%27+2,2,2)}
    else if(tile===TT.MERCURY&&[23,25].includes(f)){X.fillStyle='rgba(198,243,255,.18)';X.fillRect(px,py,32,32);X.fillStyle='rgba(255,255,255,.22)';X.fillRect(px+5,py+6+(x+y)%8,21,2)}
    else if(tile===TT.GRASS&&f===24){X.fillStyle='rgba(68,159,75,.15)';X.fillRect(px,py,32,32)}
    return true;
  }
function drawStairSpecialTerrain(tile,px,py,x,y,now){
    if(tile===TT.STAIR){
      X.save();X.fillStyle='rgba(0,0,0,.52)';X.fillRect(px+3,py+3,26,28);X.fillStyle='#2b1a10';X.fillRect(px+5,py+4,22,5);for(let i=0;i<5;i++){const inset=6+i*2;X.fillStyle=`rgba(${89-i*7},${58-i*5},${36-i*4},1)`;X.fillRect(px+inset,py+9+i*4,32-inset*2,3)}X.fillStyle='rgba(231,192,130,.18)';X.fillRect(px+6,py+5,20,1);X.fillStyle='rgba(0,0,0,.38)';X.fillRect(px+4,py+29,24,4);X.restore();return true;
    }
    if(tile===TT.GOLD){
      X.save();X.fillStyle='#34260f';X.fillRect(px+2,py+4,28,28);X.fillStyle='#8a6a28';X.fillRect(px+3,py+3,26,25);X.fillStyle='#d1a84d';X.fillRect(px+4,py+3,24,3);X.fillStyle='rgba(255,231,142,.15)';X.fillRect(px+6,py+7,20,1);X.fillStyle='rgba(0,0,0,.42)';X.fillRect(px+3,py+28,26,5);X.strokeStyle='rgba(244,206,102,.20)';X.strokeRect(px+7.5,py+8.5,17,15);X.restore();return true;
    }
    return drawMaterialSpecialTerrain(tile,px,py,x,y,now);
  }
function drawMaterialSpecialTerrain(tile,px,py,x,y,now){const r=drawCoreSpecialTerrain(tile,px,py,x,y,now);if(!r)return r;const p=.5+.5*Math.sin(now/260+x+y);X.save();if(tile===TT.WATER||tile===TT.MERCURY){X.strokeStyle=`rgba(190,226,220,${.06+.05*p})`;X.beginPath();X.moveTo(px+5,py+9);X.lineTo(px+13,py+9);X.moveTo(px+18,py+22);X.lineTo(px+27,py+22);X.stroke()}else if(tile===TT.VOID){X.fillStyle=`rgba(181,109,203,${.10+.08*p})`;X.fillRect(px+15,py+8,2,16)}else if(tile===TT.GOLD||tile===TT.ALTAR||tile===TT.VAULT){X.strokeStyle=`rgba(247,215,128,${.10+.08*p})`;X.strokeRect(px+6.5,py+6.5,19,19)}X.restore();return true}
function drawCoreSpecialTerrain(tile,px,py,x,y,now){
    if(tile===TT.LAVA)return drawLavaTerrain(X,px,py,x,y,now);
    if(tile===TT.PEACH_TREE)return drawBotanical(X,tile,px,py,x,y,regionIndex());
    if(tile===TT.COOKPOT||tile===TT.BRAZIER){const visible=state.visible.has(k(x,y)),lit=!terrainUnlit105(x,y);if(visible&&lit)hearthAnimationSeen105=performance.now();return drawSharedProp(X,tile,px,py,regionIndex(),0,visible?now+x*173+y*319:0,lit)}
    const dynamic=tile===TT.WATER||tile===TT.MERCURY||tile===TT.LAVA||tile===TT.VOID||tile===TT.STAMINA_PAD;
    const frame=dynamic?(Math.floor(now/220)+x+y)%3:0;
    let extra=terrainUnlit105(x,y)?'unlit':'';if(tile===TT.SWITCH){const sw=state.switches?.find(v=>v.x===x&&v.y===y);extra=sw?.used?'used':sw?.kind==='cipher'?'cipher':''}
    const c=hiTerrain(tile,regionIndex(),Math.floor(vfHash(x,y,31)*4),frame,extra);if(!c)return false;drawHi(c,px,py,32,32,1,false);return true;
  }
function drawDoor(px,py,opened=false,side=false,ctx=X){
 const paper=state?.floor===24,wood=['#704b31','#756444','#755048','#65523e','#796542'][regionIndex()]||'#704b31',left=side?6:3,width=side?21:27;
 ctx.save();ctx.translate(px,py);ctx.fillStyle='rgba(5,9,12,.35)';ctx.fillRect(left-1,28,width+2,4);
 ctx.fillStyle='#28231e';ctx.fillRect(left,-3,width,34);const g=ctx.createLinearGradient(left,0,left+width,30);g.addColorStop(0,'#c0a175');g.addColorStop(.35,wood);g.addColorStop(1,'#3a3028');ctx.fillStyle=g;ctx.fillRect(left,-3,width,5);ctx.fillRect(left,1,3,28);ctx.fillRect(left+width-3,1,3,28);ctx.fillStyle='#cfb88e';ctx.fillRect(left+1,-2,width-2,.7);
 ctx.fillStyle=opened?'#11171a':paper?'#d6ccb1':wood;ctx.fillRect(left+4,3,width-8,26);
 if(opened){ctx.fillStyle=wood;ctx.fillRect(left+4,3,4,26);ctx.fillStyle='#b69b72';ctx.fillRect(left+4,3,.7,26);ctx.fillStyle='rgba(187,170,128,.12)';ctx.fillRect(left+9,4,1,24)}else{
  ctx.strokeStyle=paper?'#795c40':'rgba(31,22,19,.65)';ctx.lineWidth=.7;for(let xx=left+8;xx<left+width-4;xx+=5){ctx.beginPath();ctx.moveTo(xx,4);ctx.lineTo(xx,28);ctx.stroke()}
  for(const yy of[8,23]){ctx.fillStyle=paper?'#876846':'#3d352b';ctx.fillRect(left+4,yy,width-8,1.7);ctx.fillStyle=paper?'#b49a71':'#a1916c';ctx.fillRect(left+5,yy,width-10,.5)}
  ctx.strokeStyle='#c5b082';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(left+width-7,17,1.4,2,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#dfcda4';ctx.fillRect(left+width-7.5,14.5,1,1);
 }
 ctx.fillStyle='#8d7b60';ctx.fillRect(left+2,29,width-4,1.5);ctx.restore();
}
function drawInteractiveTerrain(tile,px,py,x,y,now){if(tile===TT.DOOR||tile===TT.OPEN_DOOR){drawDoorAt(px,py,tile===TT.OPEN_DOOR,x,y);return true}return drawFurnitureInteractiveTerrain(tile,px,py,x,y,now)}
function drawFurnitureInteractiveTerrain(tile,px,py,x,y,now){const z=regionIndex(),p=wallPalette[z];if(tile===TT.TABLE){X.save();X.fillStyle='rgba(0,0,0,.28)';X.beginPath();X.ellipse(px+16,py+27,18,5,0,0,Math.PI*2);X.fill();X.fillStyle='#3a1e14';X.fillRect(px-1,py+12,34,15);X.fillStyle='#875238';X.fillRect(px-2,py+8,36,12);X.fillStyle='#bc7b50';X.fillRect(px,py+8,32,3);X.fillStyle='#a16242';X.fillRect(px,py+19,32,3);X.fillStyle='#2d160f';X.fillRect(px+4,py+24,4,8);X.fillRect(px+24,py+24,4,8);X.restore();return true}if(tile===TT.SCREEN){X.save();X.fillStyle='rgba(0,0,0,.26)';X.fillRect(px+4,py+27,26,5);X.fillStyle='#2c110e';X.fillRect(px+3,py-7,26,39);X.fillStyle=z===2?'#7c3a68':'#7e3329';X.fillRect(px+6,py-4,20,32);X.fillStyle=z===2?'#d49abd':'#c27a58';X.fillRect(px+8,py-2,2,27);X.fillRect(px+15,py-2,2,27);X.fillRect(px+22,py-2,2,27);X.fillStyle='rgba(255,230,198,.08)';X.fillRect(px+7,py-3,18,2);X.restore();return true}return drawCoreInteractiveTerrain(tile,px,py,x,y,now)}
function drawCoreInteractiveTerrain(tile,px,py,x,y,now){
    if(tile===TT.LAVA)return drawLavaTerrain(X,px,py,x,y,now);
    if(tile===TT.PEACH_TREE)return drawBotanical(X,tile,px,py,x,y,regionIndex());
    if(tile===TT.COOKPOT||tile===TT.BRAZIER){const visible=state.visible.has(k(x,y)),lit=!terrainUnlit105(x,y);if(visible&&lit)hearthAnimationSeen105=performance.now();return drawSharedProp(X,tile,px,py,regionIndex(),0,visible?now+x*173+y*319:0,lit)}
    const frame=(Math.floor(now/180)+x+y)%3;let extra=terrainUnlit105(x,y)?'unlit':'';if(tile===TT.SWITCH){const sw=state.switches?.find(v=>v.x===x&&v.y===y);extra=sw?.used?'used':sw?.kind==='cipher'?'cipher':''}
    const c=hiTerrain(tile,regionIndex(),Math.floor(vfHash(x,y,37)*4),frame,extra);if(!c)return false;drawHi(c,px,py,32,32,1,false);return true;
  }
// r49: one canonical, occluded light pass for every normal floor and legendary branch.
let LIGHT_CACHE={map:null,turn:-1,sources:[],geometry:new Map()};
function lightRay(s,x,y){let dx=x-s.x,dy=y-s.y,n=Math.max(Math.abs(dx),Math.abs(dy))*2;if(!n)return true;let px=s.x,py=s.y;for(let i=1;i<n;i++){const xx=Math.round(s.x+dx*i/n),yy=Math.round(s.y+dy*i/n);if(xx===px&&yy===py)continue;if(xx===x&&yy===y)return true;if(xx!==px&&yy!==py&&tileBlocksSight(state.map[py]?.[xx])&&tileBlocksSight(state.map[yy]?.[px]))return false;if(tileBlocksSight(state.map[yy]?.[xx]))return false;px=xx;py=yy}return true}
function worldLightSources(){
 const mine=state.branchTerrain105?.mine105,dojo=state.branchTerrain105?.dojo,lanternKey=(mine?.lanterns||[]).map(l=>`${l.x},${l.y}:${l.lit?1:0}:${l.color||''}:${l.radius||''}:${l.power||''}`).join(';')+'|'+[state.player,...state.monsters].filter(e=>e.hp>0&&e.combustion105).map(e=>e.x+','+e.y).join(';'),revision=(TERRAIN_RENDER_REV.get(state.map)||0)+':'+(state.terrainReactions105?.revision||0);
 if(LIGHT_CACHE.map===state.map&&LIGHT_CACHE.revision===revision&&LIGHT_CACHE.lanternKey===lanternKey&&LIGHT_CACHE.lights===state.legendLights49&&LIGHT_CACHE.decor===state.decor)return LIGHT_CACHE.sources;
 const sources=[],used=new Set(),add=(x,y,color,r,power,kind='lamp')=>{const kk=x+','+y;if(used.has(kk)||!Number.isFinite(x)||!Number.isFinite(y)||terrainUnlit105(x,y))return;used.add(kk);sources.push({x,y,color,r,power,kind})};
 for(const e of [state.player,...state.monsters])if(e.hp>0&&e.combustion105)add(e.x,e.y,'#ef872e',2.2,.22,'combustion');
 for(const f of Object.values(state.terrainReactions105?.burning||{}))add(f.x,f.y,'#ef872e',2.5,.28,'burn');
 if(state.artifactDungeon46){for(const l of state.legendLights49||[])add(l.x,l.y,l.color,l.r,l.power);for(const o of state.legendObjects49||[])if(o.kind.startsWith('monument'))add(o.x+Math.floor(o.w/2),o.y+o.h,globalThis.__MANRU_LEGEND_TERRAIN47__.theme(state.artifactDungeon46.id).glow,4.2,.30,'monument')}
 for(const l of mine?.lanterns||[])if(l.lit)add(l.x,l.y,l.color||WORLD_LIGHT_ART.lantern,l.radius??3.8,l.power??.24,'mine');
 const palace=state.branchContext105?.id==='palace'?state.branchTerrain105?.palace105:null;if(palace){for(const l of palace.lights||[]){if(l.wall){if(state.map[l.y]?.[l.x]!==TT.PALACE_WALL_LAMP||terrainUnlit105(l.x,l.y))continue;add(l.x+l.dx,l.y+l.dy,l.color||'#ecc17d',3.7,.22,'palace-wall-lamp');}else add(l.x,l.y,l.color||'#ecc17d',3.4,.21,'palace-lamp');}for(const key of Object.keys(palace.windows||{})){const[x,y]=key.split(',').map(Number);if(state.map[y]?.[x]===TT.WALL)add(x,y,'#78bfc5',3.2,.10,'palace-window');}}
 for(const l of dojo?.lanterns||[])add(l.x,l.y,WORLD_LIGHT_ART.lantern,3.2,.19,'dojo');
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const t=state.map[y][x];if(t===TT.BRAZIER||t===TT.COOKPOT)add(x,y,WORLD_LIGHT_ART.fire,3.2,.24);else if(t===TT.LANTERN_POST)add(x,y,WORLD_LIGHT_ART.lantern,3.5,.23);else if(t===TT.GOLD_LAMP)add(x,y,WORLD_LIGHT_ART.gold,3.5,.22);else if(t===TT.FOUNTAIN)add(x,y,WORLD_LIGHT_ART.water,2.3,.12);else if(t===TT.LAVA&&(x+y)%5===0)add(x,y,WORLD_LIGHT_ART.lava,2.3,.15,'lava');else if(t===TT.PORTAL)add(x,y,state.artifactDungeon46?globalThis.__MANRU_LEGEND_TERRAIN47__.theme(state.artifactDungeon46.id).glow:WORLD_LIGHT_ART.portal,2.2,.13,'portal')}
 for(const d of state.decor||[])if(['lantern','brazier','lampstand'].includes(d.kind))add(d.x,d.y,d.kind==='brazier'?WORLD_LIGHT_ART.fire:d.kind==='lampstand'?WORLD_LIGHT_ART.gold:WORLD_LIGHT_ART.lantern,2.8,.17,'decor');
 LIGHT_CACHE={map:state.map,revision,lanternKey,lights:state.legendLights49,decor:state.decor,sources,geometry:new Map()};return sources;
}
function drawWorldLights(now=performance.now(),bounds=null){if(!state?.map||!state.visible)return;const sources=worldLightSources(),b=bounds||{x0:0,y0:0,x1:COLS-1,y1:ROWS-1};let rendered=0;X.save();X.globalCompositeOperation='source-over';X.globalAlpha=1;
 for(const l of sources){const maxRadius=l.r*1.035;if(l.x+maxRadius<b.x0||l.x-maxRadius>b.x1||l.y+maxRadius<b.y0||l.y-maxRadius>b.y1||!state.visible.has(k(l.x,l.y)))continue;if(rendered++>=48)break;
  const key=l.x+','+l.y;let cells=LIGHT_CACHE.geometry.get(key);if(!cells){cells=[];const r=Math.ceil(maxRadius);for(let y=Math.max(0,l.y-r);y<=Math.min(ROWS-1,l.y+r);y++)for(let x=Math.max(0,l.x-r);x<=Math.min(COLS-1,l.x+r);x++)if(Math.hypot(x-l.x,y-l.y)<=maxRadius+.5&&lightRay(l,x,y))cells.push({x,y});LIGHT_CACHE.geometry.set(key,cells)}
  // A small, slow radius pulse; source offsets keep nearby lamps from moving in sync.
  const radius=l.r*(1+.035*Math.sin(now/460+l.x*1.73+l.y*2.19));
  const pulse=state.legendTheme47==='thunder_spear'?.76+(.5+.5*Math.sin(now/1800+l.x))**18*.6:.94+.06*Math.sin(now/310+l.x*1.7+l.y);
  X.save();X.beginPath();for(const c of cells)if(c.x>=b.x0&&c.x<=b.x1&&c.y>=b.y0&&c.y<=b.y1&&(state.visible.has(k(c.x,c.y))||mineSceneryVisible(c.x,c.y))){if(state.branchContext105?.id==='dojo'&&state.map[c.y]?.[c.x]===TT.WALL){for(const[xx,yy,w,h]of dojoWallFootprint(c.x,c.y))X.rect(c.x*TILE+xx,c.y*TILE+yy,w,h)}else X.rect(c.x*TILE,c.y*TILE,TILE,TILE)}X.clip();
  const gx=(l.x+.5)*TILE,gy=(l.y+.5)*TILE,r=radius*TILE,g=X.createRadialGradient(gx,gy,2,gx,gy,r),rgb=[1,3,5].map(i=>parseInt(l.color.slice(i,i+2),16)).join(',');g.addColorStop(0,`rgba(${rgb},${l.power*pulse})`);g.addColorStop(.32,`rgba(${rgb},${l.power*.55*pulse})`);g.addColorStop(1,`rgba(${rgb},0)`);X.fillStyle=g;X.fillRect(gx-r,gy-r,r*2,r*2);
  // Narrow highlights show wet stone and metal orientation, rather than washing out the material.
  for(const c of cells){if(!state.visible.has(k(c.x,c.y)))continue;const t=state.map[c.y][c.x],falloff=Math.max(0,1-Math.hypot(c.x-l.x,c.y-l.y)/radius);if(t===TT.WATER||t===TT.MERCURY){X.fillStyle=`rgba(${rgb},${falloff*.20})`;X.fillRect(c.x*TILE+5,c.y*TILE+19+Math.sin(now/600+c.x)*2,19,1)}else if(tileBlocksSight(t)&&falloff>.2){X.fillStyle=`rgba(${rgb},${falloff*.17})`;X.fillRect(c.x*TILE+2,c.y*TILE+(c.y<l.y?27:3),28,1)}}
  X.restore();
 }
 X.restore();
}
function drawItem(item){
  const impl=globalThis.__MANRU_DRAW_ITEM_IMPL_R7__;if(typeof impl==='function'){
   const result=impl(item);if(item.charcoalBurn105?.lit){X.save();const now=performance.now(),x=item.x*TILE,y=item.y*TILE;for(let i=0;i<5;i++){X.globalAlpha=.55+.35*Math.sin(now/210+i*1.9+item.x);X.fillStyle=i%2?'#f59b35':'#ba4521';X.fillRect(x+10+i*3,y+16+i%3*3,2,1.5)}X.restore()}return result;
  }
  // Bootstrap fallback only; R7 is installed before a run can start.
  const px=item.x*TILE,py=item.y*TILE,col=rarityColor(item.rarity),dark=colorShift(col,-75),light=colorShift(col,45),spark=(Math.floor(performance.now()/360)+item.x+item.y)%5===0;
  X.save();X.fillStyle='rgba(0,0,0,.5)';X.fillRect(px+10,py+25,13,3);X.fillStyle=dark;
  if(item.type==='weapon'){
    X.fillRect(px+14,py+5,5,19);X.fillStyle=col;X.fillRect(px+15,py+4,3,18);X.fillStyle=light;X.fillRect(px+15,py+5,1,13);X.fillStyle=dark;X.fillRect(px+9,py+20,15,4);X.fillStyle=col;X.fillRect(px+11,py+20,11,2);
  }else if(item.type==='armor'){
    X.fillRect(px+8,py+7,16,19);X.fillStyle=col;X.fillRect(px+10,py+7,12,17);X.fillRect(px+7,py+10,4,8);X.fillRect(px+21,py+10,4,8);X.fillStyle=light;X.fillRect(px+12,py+9,3,11);X.fillStyle=dark;X.fillRect(px+14,py+17,5,7);
  }else if(item.type==='potion'){
    X.fillRect(px+11,py+10,11,15);X.fillStyle=col;X.fillRect(px+13,py+11,7,12);X.fillRect(px+15,py+6,4,6);X.fillStyle=light;X.fillRect(px+14,py+13,2,6);
  }else if(item.type==='scroll'||item.type==='story_note'){
    X.fillStyle='#d4c39e';X.fillRect(px+8,py+8,17,18);X.fillStyle='#8c704d';X.fillRect(px+10,py+11,12,2);X.fillRect(px+10,py+16,9,2);X.fillRect(px+10,py+21,11,2);X.fillStyle=col;X.fillRect(px+21,py+8,4,18);
  }else if(item.type==='trinket'){
    X.fillStyle=dark;X.fillRect(px+9,py+9,15,15);X.fillStyle=col;X.fillRect(px+11,py+11,11,11);X.fillStyle='#090605';X.fillRect(px+14,py+14,5,5);X.fillStyle=light;X.fillRect(px+12,py+12,3,3);
  }else{
    X.fillStyle=dark;X.fillRect(px+9,py+7,15,19);X.fillStyle=col;X.fillRect(px+11,py+9,11,15);X.fillStyle=light;X.fillRect(px+13,py+10,3,7);
  }
  if(spark&&item.rarity!=='common'){X.fillStyle=light;X.fillRect(px+25,py+6,2,2);X.fillRect(px+27,py+8,1,1)}X.restore();
}
function drawCreature(m){
  const renderer=globalThis.__MANRU_ACTOR_ART__?.drawWorld;
  if(typeof renderer!=='function')return false;
  const result=renderer(m);if(m.hp>0&&m.combustion105&&isEntityObservableToPlayer57(m))drawCombustion({...m,age:Math.min(2,Math.max(0,state.turn-m.combustion105.born))},performance.now());return result;
}
function drawCombatParticles(q,now){q.save();for(const p of FX.particles){const t=(now-p.start)/p.life;if(t<0||t>=1)continue;q.globalAlpha=1-t;q.fillStyle=p.color;q.fillRect(p.x,p.y,p.size,p.size);}q.restore();}
function drawFX(now){drawActionPresentation(now);drawPalaceWaves(X,now);
  for(const r of FX.rings){const t=(now-r.start)/r.life;if(t<0||t>=1)continue;const radius=4+t*(9+r.power*2);X.save();X.globalAlpha=(1-t)*.64;X.strokeStyle=r.color;X.lineWidth=Math.max(1,2.2*(1-t));X.beginPath();X.arc(r.x,r.y,radius,0,Math.PI*2);X.stroke();X.restore()}

  for(const d of FX.doors){
    const t=(now-d.start)/d.life;
    const px=d.x*TILE, py=d.y*TILE;
    X.globalAlpha=1-t;
    X.strokeStyle="rgba(240,208,160,.65)";
    X.lineWidth=2;
    X.strokeRect(px+3+t*6,py+3,24-t*12,26);
    X.strokeStyle="rgba(196,120,96,.4)";
    X.beginPath(); X.moveTo(px+16,py+3); X.lineTo(px+16,py+29); X.stroke();
  }

  for(const s of FX.slashes){
    const t=(now-s.start)/s.life;
    X.globalAlpha=1-t;
    X.strokeStyle=s.color;
    X.lineWidth=2 + (1-t)*3;
    X.beginPath();
    X.moveTo(s.x0 + (s.x1-s.x0)*0.15, s.y0 + (s.y1-s.y0)*0.15);
    X.lineTo(s.x1 - (s.x1-s.x0)*0.1, s.y1 - (s.y1-s.y0)*0.1);
    X.stroke();
    X.strokeStyle="rgba(255,255,255,.6)";
    X.lineWidth=1.2;
    X.beginPath();
    X.moveTo(s.x0 + (s.x1-s.x0)*(0.1+t*0.2), s.y0 + (s.y1-s.y0)*(0.1+t*0.2));
    X.lineTo(s.x1 - (s.x1-s.x0)*(0.05+t*0.1), s.y1 - (s.y1-s.y0)*(0.05+t*0.1));
    X.stroke();
  }

  for(const pj of FX.projectiles)drawCombatProjectile(X,pj,now);

  drawCombatParticles(X,now);
  X.textAlign="center";X.textBaseline="middle";X.font="700 13px Inter,system-ui,sans-serif";
  for(const f of FX.floats){
    const t=(now-f.start)/f.life,y=f.y-t*20;
    X.globalAlpha=1-Math.max(0,(t-.45)/.55);
    X.font=`800 ${f.size}px Inter,system-ui,sans-serif`;
    X.strokeStyle="rgba(0,0,0,.75)";X.lineWidth=3;X.strokeText(f.text,f.x,y);
    X.fillStyle=f.color;X.fillText(f.text,f.x,y);
  }
  X.globalAlpha=1;X.textAlign="start";X.textBaseline="alphabetic";
}
function drawTransition(now){
  if(!FX.transition)return;const t=(now-FX.transition.start)/FX.transition.life;if(t>=1)return
  const fadeIn=clamp(t/.18,0,1),fadeOut=clamp((1-t)/.24,0,1),a=Math.min(fadeIn,fadeOut),ease=1-Math.pow(1-clamp(t/.55,0,1),3);
  X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.globalAlpha=a;
  X.fillStyle=`rgba(3,1,1,${.64+.12*Math.sin(Math.min(1,t)*Math.PI)})`;X.fillRect(0,0,VIEW.w,VIEW.h);
  const bandH=Math.min(146,VIEW.h*.22),cy=VIEW.h*.42,top=cy-bandH/2;
  X.fillStyle='rgba(20,10,6,.90)';X.fillRect(0,top,VIEW.w,bandH);
  const grd=X.createLinearGradient(0,0,VIEW.w,0);grd.addColorStop(0,'rgba(120,68,35,0)');grd.addColorStop(.5,'rgba(190,126,66,.68)');grd.addColorStop(1,'rgba(120,68,35,0)');X.fillStyle=grd;X.fillRect(0,top,VIEW.w,1);X.fillRect(0,top+bandH-1,VIEW.w,1);
  const slide=(1-ease)*28;X.textAlign='center';X.textBaseline='middle';
  const title=FX.transition.side?(state?.artifactDungeon46?.name||state?.layoutName||''):`제 ${String(FX.transition.floor).padStart(2,'0')} 층`;
  X.fillStyle='#edcf94';X.font=`900 ${Math.max(36,Math.min(68,VIEW.w/11))}px Georgia,serif`;X.fillText(title,VIEW.w/2,cy-10-slide);
  if(!FX.transition.side){
    const bits=[FX.transition.region,FX.transition.layout].map(v=>String(v||'').trim()).filter(Boolean);
    const sub=bits.filter((v,i,a)=>a.indexOf(v)===i).slice(0,2).join(' · ');
    if(sub){X.fillStyle='#a98e69';X.font=`700 ${Math.max(10,Math.min(14,VIEW.w/48))}px system-ui,sans-serif`;X.fillText(sub,VIEW.w/2,cy+35-slide*.35)}
  }
  const sealX=Math.min(VIEW.w-26,VIEW.w/2+Math.min(220,VIEW.w*.29)),sealY=cy-34;X.strokeStyle='#8c4034';X.lineWidth=1.5;X.strokeRect(sealX-11,sealY-11,22,22);X.fillStyle='#ad5141';X.font='900 10px Georgia,serif';X.fillText('입',sealX,sealY+1);
  X.restore();
}
const MINIMAP_PIPELINE={before:force=>{const now=performance.now();if(!state)return false;if(!force&&!RENDER_PERF_STATE.miniDirty&&!mapOpen49()&&now-RENDER_PERF_STATE.lastMini<320)return false;RENDER_PERF_STATE.lastMini=now;RENDER_PERF_STATE.miniDirty=false;return true},hooks:[{id:'doors59',draw:doorsDrawMinimap},{id:'architecture85',draw:architectureDrawMinimap},{id:'portals981',draw:portalsDrawMinimap}]};
function drawMinimap(force=false){if(MINIMAP_PIPELINE.before&&!MINIMAP_PIPELINE.before(force))return false;MX.clearRect(0,0,MC.width,MC.height);const sx=MC.width/COLS,sy=MC.height/ROWS;MX.fillStyle='#070a0e';MX.fillRect(0,0,MC.width,MC.height);const cols=new Map([[TT.WALL,'#3d342d'],[TT.STAIR,'#e0d0a0'],[TT.WATER,'#426c73'],[TT.PAPER_BRIDGE,'#c8b990'],[TT.MIRROR,'#a3789e'],[TT.JAR,'#7b543d'],[TT.LAVA,'#a4412c'],[TT.DRAWBRIDGE_DOWN,'#9e7547'],[TT.DRAWBRIDGE_UP,'#55402f'],[TT.VOID,'#08050d'],[TT.GOLD,'#c8a543'],[TT.MERCURY,'#9eaaaa'],[TT.SWITCH,'#d09855'],[TT.BAMBOO,'#476346'],[TT.TABLE,'#735039'],[TT.SCREEN,'#7d3533'],[TT.GRASS,'#243b27'],[TT.HEDGE,'#315136'],[TT.RAFT,'#9b754a'],[TT.FAKE_DOOR,'#704b63'],[TT.LOCKED_GATE,'#7b756c'],[TT.KEY_TILE,'#e3bf6e'],[TT.STAMINA_PAD,'#6daac0'],[TT.PEACH_TREE,'#b06f78'],[TT.SECRET_DOOR,'#8d7444'],[TT.PAVILION,'#a47452']]);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(!state.seen.has(k(x,y))&&!mineScenerySeen(x,y))continue;const t=mineHidden(x,y)?TT.VOID:state.map[y][x];MX.fillStyle=state.branchContext105?.id==='palace'?palaceMiniColor(t,x,y):state.artifactDungeon46&&globalThis.__MANRU_LEGEND_TERRAIN47__?.miniColor?globalThis.__MANRU_LEGEND_TERRAIN47__.miniColor(t,x,y):(cols.get(t)||'#15130f');MX.fillRect(x*sx,y*sy,Math.ceil(sx),Math.ceil(sy))}for(const m of state.monsters)if(isThreatVisibleToPlayer(m)){MX.fillStyle=m.boss?'#f1c35f':'#c45d62';MX.fillRect(m.x*sx,m.y*sy,3,3)}for(const it of state.items)if(state.seen.has(k(it.x,it.y))){MX.fillStyle=rarityColor(it.rarity);MX.fillRect(it.x*sx,it.y*sy,2,2)}MX.fillStyle='#91d39a';MX.fillRect(state.player.x*sx,state.player.y*sy,3,3);MX.strokeStyle='#506174';MX.strokeRect(.5,.5,MC.width-1,MC.height-1);for(const h of MINIMAP_PIPELINE.hooks)h.draw({sx,sy,force});return true}
let renderUpdatePending=false, cameraRenderPending=false;
function syncLargeMinimap(){
  const big = document.getElementById("mobileMiniLarge");
  if(!big) return;
  const bx = big.getContext("2d");
  bx.imageSmoothingEnabled = false;
  bx.clearRect(0,0,big.width,big.height);
  bx.drawImage(MC,0,0,big.width,big.height);
}
function drawDepthOcclusion(now,bounds=null){
  // Project the visual actor through this frame's actual transform, including shake.
  // Cover the viewport rather than a fixed world rectangle around the actor.
  const pos=visualPlayerPosition(),matrix=X.getTransform(),dpr=VIEW.dpr||1,
    gx=(matrix.a*pos.worldX+matrix.c*pos.worldY+matrix.e)/dpr,
    gy=(matrix.b*pos.worldX+matrix.d*pos.worldY+matrix.f)/dpr,
    zoom=Math.hypot(matrix.a,matrix.b)/dpr,
    inner=Math.min(120*zoom,Math.min(VIEW.w,VIEW.h)*.25),outer=Math.max(inner+1,Math.hypot(VIEW.w,VIEW.h)*.55),mobile=isMobileViewport();
  X.save();X.setTransform(dpr,0,0,dpr,0,0);X.globalCompositeOperation='source-over';X.globalAlpha=1;
  const shade=X.createRadialGradient(gx,gy,inner,gx,gy,outer);
  shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(.68,'rgba(0,0,0,.012)');shade.addColorStop(1,mobile?'rgba(0,0,0,.16)':'rgba(0,0,0,.13)');
  X.fillStyle=shade;X.fillRect(0,0,VIEW.w,VIEW.h);X.restore();
  // Architecture contact shadows retain their world-space geometry.
  if(mobile)return;
  const x0=bounds?.x0??0,x1=bounds?.x1??COLS-1,y0=bounds?.y0??0,y1=Math.min(bounds?.y1??ROWS-2,ROWS-2);
  X.save();X.fillStyle='rgba(0,0,0,.12)';
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(vfFrontWall(x,y)&&state.seen.has(k(x,y)))X.fillRect(x*TILE+1,(y+1)*TILE,30,4);
  X.restore();
}
/* ===== 만루 COMPLETE VERIFIED ART / DECOR / SPRITE PIPELINE ===== */
const VF_ASSETS={"creature_uri":"data:image/png;base64,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","creature_meta":{"객잔 쥐":{"base":0,"frames":3,"boss":false},"독 그리마":{"base":3,"frames":3,"boss":false},"목재 좀벌레":{"base":6,"frames":3,"boss":false},"객잔 박쥐":{"base":9,"frames":3,"boss":false},"그림자 살모사":{"base":12,"frames":3,"boss":false},"취한 경비견":{"base":15,"frames":3,"boss":false},"거대 거미":{"base":18,"frames":3,"boss":false},"피라냐":{"base":21,"frames":3,"boss":false},"가시 덩굴":{"base":24,"frames":3,"boss":false},"먹물 개구리":{"base":27,"frames":3,"boss":false},"정원 지네":{"base":30,"frames":3,"boss":false},"환각 나비":{"base":33,"frames":3,"boss":false},"돌 거북":{"base":36,"frames":3,"boss":false},"윈도":{"base":39,"frames":3,"boss":false},"비단 술래":{"base":42,"frames":3,"boss":false},"환각의 향로":{"base":45,"frames":3,"boss":false},"향기요정":{"base":48,"frames":3,"boss":false},"분홍거미":{"base":51,"frames":3,"boss":false},"구미호":{"base":54,"frames":3,"boss":false},"지네":{"base":57,"frames":3,"boss":false},"강시":{"base":60,"frames":3,"boss":false},"식귀":{"base":63,"frames":3,"boss":false},"산성 슬라임":{"base":66,"frames":3,"boss":false},"굶주린 창고 쥐":{"base":69,"frames":3,"boss":false},"악어":{"base":72,"frames":3,"boss":false},"수비병":{"base":75,"frames":3,"boss":false},"강철이":{"base":78,"frames":3,"boss":false},"살라맨더":{"base":81,"frames":3,"boss":false},"화염 가고일":{"base":84,"frames":3,"boss":false},"녹아내린 슬라임":{"base":87,"frames":3,"boss":false},"경비 인형 - 보병":{"base":90,"frames":3,"boss":false},"해자 잠복꾼":{"base":93,"frames":3,"boss":false},"경비 인형 - 포병":{"base":96,"frames":3,"boss":false},"성채 비행 감시자":{"base":99,"frames":3,"boss":false},"공허 가오리":{"base":102,"frames":3,"boss":false},"만루의 수호상":{"base":105,"frames":3,"boss":false},"천수 아수라":{"base":108,"frames":3,"boss":false},"신전 사제 망령":{"base":111,"frames":3,"boss":false},"차원 포식자":{"base":114,"frames":3,"boss":false},"보주의 파수꾼":{"base":117,"frames":3,"boss":false},"여의 수룡":{"base":120,"frames":3,"boss":false},"광견 대장":{"base":123,"frames":3,"boss":true},"화공 노인":{"base":126,"frames":3,"boss":true},"환각의 침모":{"base":129,"frames":3,"boss":true},"장고의 간수":{"base":132,"frames":3,"boss":true},"객주 주인: 만루보주":{"base":135,"frames":3,"boss":true},"player:wanderer:down":{"base":138,"frames":3},"player:wanderer:up":{"base":141,"frames":3},"player:wanderer:left":{"base":144,"frames":3},"player:wanderer:right":{"base":147,"frames":3},"player:escort:down":{"base":150,"frames":3},"player:escort:up":{"base":153,"frames":3},"player:escort:left":{"base":156,"frames":3},"player:escort:right":{"base":159,"frames":3},"player:swordsman:down":{"base":162,"frames":3},"player:swordsman:up":{"base":165,"frames":3},"player:swordsman:left":{"base":168,"frames":3},"player:swordsman:right":{"base":171,"frames":3}},"creature_cols":12,"tile_uri":"data:image/png;base64,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","tile_meta":{"floor:0:0":0,"floor:0:1":1,"floor:0:2":2,"floor:0:3":3,"wall:0:0":4,"wall:0:1":5,"wall:0:2":6,"wall:0:3":7,"floor:1:0":8,"floor:1:1":9,"floor:1:2":10,"floor:1:3":11,"wall:1:0":12,"wall:1:1":13,"wall:1:2":14,"wall:1:3":15,"floor:2:0":16,"floor:2:1":17,"floor:2:2":18,"floor:2:3":19,"wall:2:0":20,"wall:2:1":21,"wall:2:2":22,"wall:2:3":23,"floor:3:0":24,"floor:3:1":25,"floor:3:2":26,"floor:3:3":27,"wall:3:0":28,"wall:3:1":29,"wall:3:2":30,"wall:3:3":31,"floor:4:0":32,"floor:4:1":33,"floor:4:2":34,"floor:4:3":35,"wall:4:0":36,"wall:4:1":37,"wall:4:2":38,"wall:4:3":39},"tile_cols":8,"decor_uri":"data:image/png;base64,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","decor_meta":{"0:trim":0,"0:lantern":1,"0:scroll":2,"0:vines":3,"0:silk":4,"0:chains":5,"0:relief":6,"0:cabinet":7,"0:jars":8,"0:planter":9,"0:basin":10,"0:cushion":11,"0:screen":12,"0:crate":13,"0:rack":14,"0:altar":15,"0:brazier":16,"0:rug":17,"0:papers":18,"0:rubble":19,"0:bones":20,"0:incense":21,"1:trim":22,"1:lantern":23,"1:scroll":24,"1:vines":25,"1:silk":26,"1:chains":27,"1:relief":28,"1:cabinet":29,"1:jars":30,"1:planter":31,"1:basin":32,"1:cushion":33,"1:screen":34,"1:crate":35,"1:rack":36,"1:altar":37,"1:brazier":38,"1:rug":39,"1:papers":40,"1:rubble":41,"1:bones":42,"1:incense":43,"2:trim":44,"2:lantern":45,"2:scroll":46,"2:vines":47,"2:silk":48,"2:chains":49,"2:relief":50,"2:cabinet":51,"2:jars":52,"2:planter":53,"2:basin":54,"2:cushion":55,"2:screen":56,"2:crate":57,"2:rack":58,"2:altar":59,"2:brazier":60,"2:rug":61,"2:papers":62,"2:rubble":63,"2:bones":64,"2:incense":65,"3:trim":66,"3:lantern":67,"3:scroll":68,"3:vines":69,"3:silk":70,"3:chains":71,"3:relief":72,"3:cabinet":73,"3:jars":74,"3:planter":75,"3:basin":76,"3:cushion":77,"3:screen":78,"3:crate":79,"3:rack":80,"3:altar":81,"3:brazier":82,"3:rug":83,"3:papers":84,"3:rubble":85,"3:bones":86,"3:incense":87,"4:trim":88,"4:lantern":89,"4:scroll":90,"4:vines":91,"4:silk":92,"4:chains":93,"4:relief":94,"4:cabinet":95,"4:jars":96,"4:planter":97,"4:basin":98,"4:cushion":99,"4:screen":100,"4:crate":101,"4:rack":102,"4:altar":103,"4:brazier":104,"4:rug":105,"4:papers":106,"4:rubble":107,"4:bones":108,"4:incense":109},"decor_cols":10,"item_uri":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABACAYAAACdi3yvAAADdklEQVR42u2dP2sUQRiH39OgpWBhkUYwWgh+AE+rVArCFSFgCgshjSAEtJNEghixUwgINgELiwghxYGglZXRDyBY6Ak2KQwIloqyVi+4g3NzuzuzM7P3PN3d3t7+OfbZ37wzOycCADCt9Lp+gHvDjWLc8guDtSzPwdGZw4WP7/n5+0+vyfbrrq8c4hqEmMyE+uKzs8cLEZGP+9+TNIxv833auVKIiBwc6bdq1je792qtN7+w3si8ut35hfVGJsSA0C0Dqvlim1C3qyZyZcGm5rO9f2bxZdY528yapnFNE1bNlhgQumFA03xbT2+LiMjyjUetmtBm4FDZzzTc3rBfdMGELvPZsqhmy0lbyRgQ8jagzXzm69CtQnM/lH+MW/Bz+zOf3tnM39lmQls2xICQpwFd5guVuWqYr5X9sGVDzYC5ZcG69UXb+ra6IwaEvDNg6uaDtMGAkJcB1TyYLw56/F++/RibrTAggE8DYr40zKecOnFMunA+MCCkbUCX+cyKOOZr5/hDnQ/tqdDRLU3rgZpRbX3CGBDSNOCk5gtlotzNZ44TrNoD0rb5yICAAf935cqvd61eeWS+6TAfBoQ8WsGxr/zUr3TzjnFgLK+a/fR4Uz8ftrYBBoSs6DkzoIVQ49pSf57YZULfzwXHOh++Zl5QqAMCAAAAAAAAAERl4tpS1bpQ05k3Q9F0Rk/wC3VAiErlvuD7V8ePgL77wk8f4Yfty14P9NzSKy/f4+opyn0+wFB3InpCoBsGnJubK70ejUZRdvz15n7p9aWV2aDbm7SPvCszo/q6E7nuPBgQ0jZg3Szg638klMFKeWT2zdMnxy4fbvaDmE/Ndv3xVun9Z7eWvcyGZTvfSw+vVdrv7TvPs6gCYEDIIwO6Wr/m53y1hmNR96k2X/MC2mY+qLu+ziWTGhgQ8moFx2rtmpnPxFyu6/luHZvZz3xfs6AvhjsPRERk4+37WusNFleT/n0xIGBAcLN28XwnjwsDQpoG9NUX2LQeqBnOVQd88vlrOQN5qgOaaMaz1QEBAwIZMH/q1vOazoqFAQFSMuCkPSC29Xz1iJiZzhwNEyrz2Uwoslv63Crmw4BABmyN0OP/XCZ0fa4r+BpJjgEhDwO66n91R0BXrQeGvvKamrAtYvXltjVuEANCVHpVDZjLlZUr03b+MSAAAEAU/gI1dMY+elUX0gAAAABJRU5ErkJggg==","item_meta":{"blade":0,"spear":1,"bow":2,"blunt":3,"armor":4,"cloak":5,"relic":6,"trinket":7,"food":8,"other":9},"item_cols":5};
function vfHash(x,y,s=0){return hash2(x,y,1901+(state?.floor||0)*37+s)}
function vfRegion(){return Math.max(0,Math.min(4,regionIndex()))}
function vfItemKind(item){if(item?.type==='weapon')return item.kind==='brawl'?'blunt':item.kind==='spear'?'spear':item.kind==='bow'?'bow':item.kind==='blunt'?'blunt':'blade';if(['armor','cloak','relic','trinket','food'].includes(item?.type))return item.type;return 'other'}
function vfIconPos(item){const idx=VF_ASSETS.item_meta[vfItemKind(item)]??VF_ASSETS.item_meta.other;return `${-(idx%VF_ASSETS.item_cols)*32}px ${-Math.floor(idx/VF_ASSETS.item_cols)*32}px`}
function vfIconHtml(item,cls=''){const impl=globalThis.__MANRU_ICON_HTML_IMPL_R7__;if(typeof impl==='function')return impl(item,cls);return `<span class="vfIcon ${cls} vfRarity-${item?.rarity||'common'}" style="background-position:${vfIconPos(item)}"></span>`}
// Deterministic architectural decoration: wall runs, room sets, and context-aware clutter.
function vfFrontWall(x,y){return state.map[y]?.[x]===TT.WALL&&y<ROWS-1&&state.map[y+1]?.[x]!==TT.WALL}
function vfDecorFloor(x,y){if(x<0||y<0||x>=COLS||y>=ROWS)return false;return [TT.FLOOR,TT.GRASS,TT.GOLD,TT.FLOOR].includes(state.map[y][x])}
function vfAddDecor(list,x,y,kind,layer,opt={}){list.push({x,y,kind,layer,alpha:opt.alpha??1,flip:!!opt.flip,region:vfRegion()})}
function vfBuildDecor(){
 if(!state)return;if(state.artifactDungeon46){state.decor=[];return}
 const z=vfRegion(),a=[],wallKinds=[['scroll'],['vines','scroll'],['silk','scroll'],['chains','scroll'],['relief','scroll']][z];
 for(let y=0;y<ROWS-1;y++){let x=0;while(x<COLS){if(!vfFrontWall(x,y)){x++;continue}const start=x;while(x<COLS&&vfFrontWall(x,y))x++;const len=x-start,spacing=z===1?5:4;for(let xx=start;xx<x;xx++){if(vfDecorFloor(xx,y+1))vfAddDecor(a,xx,y+1,'trim','ground',{alpha:.8});if(len>=3&&(xx-start)%spacing===Math.floor(vfHash(start,y,811)*spacing))vfAddDecor(a,xx,y,wallKinds[(xx+y)%wallKinds.length],'wall',{alpha:.92})}}}
 for(const r of state.rooms||[]){if(r.w<5||r.h<5)continue;if(vfDecorFloor(r.cx,r.cy)&&vfHash(r.x,r.y,79)>.5)vfAddDecor(a,r.cx,r.cy,'rug','ground',{alpha:.34})}
 for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){if(!vfDecorFloor(x,y))continue;const h=vfHash(x,y,917);if(h>.982&&DIRS4.some(([dx,dy])=>state.map[y+dy][x+dx]!==TT.FLOOR))vfAddDecor(a,x,y,z===1?'roots':z===3?'rubble':z===4?'bones':'papers','ground',{alpha:.32})}
 state.decor=a;globalThis.__MANRU_RUNTIME81__?.ConnectedDecor81.build();
}
function vfDrawDecor(e,fogHandled58=false){if(ConnectedDecor81.draw(e,fogHandled58))return;return drawDecorSprite(e,fogHandled58)}
function drawDecorSprite(e,fogHandled58=false){
    if(e?.layer==='wall'&&!vfFrontWall(e.x,e.y))return;
    if(!state.seen.has(k(e.x,e.y)))return;const vis=state.visible.has(k(e.x,e.y)),alpha=(fogHandled58||vis?1:.46)*(e.alpha??1),dx=e.x*TILE,dy=e.y*TILE+(e.layer==='wall'?24:0);
    if(e.kind==='keeperBridge54'){X.save();X.globalAlpha*=alpha;drawKeeperBridge(X,dx,dy,e);X.restore();return}
    if(e.kind==='brazier'){const lit=!terrainUnlit105(e.x,e.y);if(vis&&lit)hearthAnimationSeen105=performance.now();X.save();X.globalAlpha*=alpha;drawSharedProp(X,TT.BRAZIER,dx,dy,e.region??regionIndex(),0,vis?(FX.frameNow||performance.now())+e.x*173+e.y*319:0,lit);X.restore();return}
    const c=hiDecor(e.kind,e.region??regionIndex(),e.flip,!terrainUnlit105(e.x,e.y));drawHi(c,dx,dy,32,32,alpha,false);
  }
// Visible autowalk state, while retaining verified stop-on-danger behavior.
const vfAuto=document.createElement('div');
/* ===== MANRU v3.0 TRUE HI-RES COMPLETION PASS =====
   48x48 source pixel art for world tiles, terrain, decor, characters, monsters and items.
   Also includes hard zoom-input suppression, dynamic floor dimensions, and DCSS-style vault terrain.
*/
const VIEW_ZOOM={desktop:1,mobile:1,min:.72,max:1.38,step:.08};
  const suppressZoomMove=(ms=260)=>{
    window.__manruZoomSuppressUntil=Math.max(window.__manruZoomSuppressUntil,performance.now()+ms);
    VIS.tapTrack=null;
  };
  const zoomValue=()=>isMobileViewport()?VIEW_ZOOM.mobile:VIEW_ZOOM.desktop;
  const updateZoomHud=()=>{const v=document.getElementById('zoomVal');if(v)v.textContent=`${Math.round(zoomValue()*100)}%`};
  const setZoom=(v,announce=false)=>{
    const key=isMobileViewport()?'mobile':'desktop';VIEW_ZOOM[key]=clamp(Math.round(v*100)/100,VIEW_ZOOM.min,VIEW_ZOOM.max);VIS.camInit=false;updateZoomHud();suppressZoomMove(220);if(announce)toast(`줌 ${Math.round(VIEW_ZOOM[key]*100)}%`)
  };
  const adjustZoom=dir=>setZoom(zoomValue()+dir*VIEW_ZOOM.step,true);
  const zoomHud=document.createElement('div');
  /* ----------------------- utility / palette ----------------------- */
  const HI=48;
  const hiResDot=(q,x,y,c)=>rect(q,x,y,1,1,c);
  const rgba=(hex,a)=>{
    const s=(hex||'#777777').replace('#','');if(s.length!==6)return `rgba(120,120,120,${a})`;
    const n=parseInt(s,16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;
  };
  const pal=(base)=>({
    ink:colorShift(base,-105),dark:colorShift(base,-62),mid:base,light:colorShift(base,38),hi:colorShift(base,75)
  });
  const drawHi=(c,dx,dy,dw=32,dh=32,alpha=1,flip=false)=>{
    X.save();X.globalAlpha*=alpha;X.imageSmoothingEnabled=false;
    if(flip){X.translate(dx+dw,dy);X.scale(-1,1);X.drawImage(c,0,0,HI,HI,0,0,dw,dh)}else X.drawImage(c,0,0,HI,HI,dx,dy,dw,dh);
    X.restore();
  };
  /* ----------------------- 48x48 creature sprites ----------------------- */
  function playerColors(id){
    if(id==='escort')return{skin:'#d9b58d',hat:'#251711',coat:'#896447',coat2:'#c39a70',sash:'#6c2c21',boots:'#16100c',metal:'#b8ac94'};
    if(id==='swordsman')return{skin:'#d8b793',hat:'#10161a',coat:'#607d88',coat2:'#9fb8bf',sash:'#3c626e',boots:'#111719',metal:'#c4d0d1'};
    return{skin:'#d9b991',hat:'#17100b',coat:'#d5bf97',coat2:'#ead8b4',sash:'#8b3b30',boots:'#211610',metal:'#c1b39a'};
  }
  function drawPlayer(q,id,dir,frame,gear){
    const c=playerColors(id),attack=frame===2,bob=frame===1?1:0;
    rect(q,14,8+bob,20,9,c.hat);rect(q,18,4+bob,12,6,c.hat);rect(q,17,13+bob,14,10,c.skin);rect(q,19,15+bob,3,2,'#39251d');rect(q,27,15+bob,3,2,'#39251d');
    rect(q,12,22+bob,24,17,c.coat);rect(q,15,22+bob,8,16,c.coat2);rect(q,9,24+bob,6,13,c.coat);rect(q,34,24+bob,6,13,c.coat);rect(q,13,32+bob,22,4,c.sash);rect(q,19,31+bob,5,8,c.sash);rect(q,14,39,8,6,c.boots);rect(q,28,39,8,6,c.boots);
    if(gear?.cloak){q.fillStyle=gear.cloak.rarity==='sealed'?'#704732':'#514239';q.beginPath();q.moveTo(11,22);q.lineTo(37,22);q.lineTo(42,42);q.lineTo(7,42);q.closePath();q.fill();rect(q,12,24,4,13,'rgba(238,188,121,.12)')}
    const w=gear?.weapon||{},metal=(w.rarity==='sealed'?'#e7ca79':w.rarity==='relic'?'#cbb482':c.metal),wood='#664128';
    const off=attack?7:0;q.save();q.translate(24,29);let ang=dir==='left'?Math.PI:dir==='up'?-Math.PI/2:dir==='down'?Math.PI/2:0;q.rotate(ang);q.translate(off,0);
    if(!w.name){rect(q,8,-3,8,6,c.skin)}else if(w.kind==='bow'){q.strokeStyle=wood;q.lineWidth=3;q.beginPath();q.arc(12,0,11,-1.15,1.15);q.stroke();ln(q,16,-9,16,9,'#d8c89e',1)}else if(w.kind==='spear'){rect(q,6,-1,24,3,wood);q.fillStyle=metal;q.beginPath();q.moveTo(35,0);q.lineTo(27,-5);q.lineTo(27,5);q.closePath();q.fill()}else if(w.kind==='blunt'){rect(q,5,-1,18,4,wood);rect(q,21,-7,13,14,metal);rect(q,23,-5,9,4,colorShift(metal,35))}else{rect(q,4,-1,9,3,wood);q.fillStyle=metal;q.beginPath();q.moveTo(34,0);q.lineTo(12,-5);q.lineTo(12,5);q.closePath();q.fill();rect(q,15,-3,13,1,colorShift(metal,40))}q.restore();
    // cloth seams and class insignia
    rect(q,17,25+bob,1,11,'rgba(255,255,255,.15)');rect(q,28,25+bob,1,11,'rgba(0,0,0,.14)');box(q,20,25+bob,8,7,'rgba(111,70,44,.28)');
  }
  function drawBeast(q,m,frame,h){
    const p=pal(m.color||'#76604a'),attack=frame===2,bob=frame===1?1:0,name=m.name||'';
    if(name.includes('박쥐')||name.includes('나비')||name.includes('가오리')){
      q.fillStyle=p.dark;q.beginPath();q.moveTo(24,18);q.lineTo(4,8+bob);q.lineTo(9,30);q.lineTo(24,25);q.lineTo(39,30);q.lineTo(44,8+bob);q.closePath();q.fill();rect(q,19,14+bob,10,16,p.mid);rect(q,21,10+bob,6,7,p.light);hiResDot(q,22,14+bob,'#f1ca7a');hiResDot(q,27,14+bob,'#f1ca7a');
    }else if(name.includes('거미')){
      for(let i=0;i<4;i++){const yy=15+i*6;ln(q,20,yy,4,6+i*10,p.dark,2);ln(q,28,yy,44,6+i*10,p.dark,2)}rect(q,14,13+bob,20,24,p.mid);rect(q,18,8+bob,12,11,p.light);for(const [x,y] of [[20,14],[25,14],[22,17],[28,17]])hiResDot(q,x,y,'#e2b36c');
    }else if(name.includes('뱀')||name.includes('살모사')){
      q.strokeStyle=p.mid;q.lineWidth=8;q.beginPath();q.moveTo(8,38);q.bezierCurveTo(7,25,35,36,31,17);q.bezierCurveTo(29,9,37,8,40,14);q.stroke();rect(q,34,9,10,9,p.light);hiResDot(q,40,12,'#efc574');ln(q,43,16,47,18,'#c85c5c',1);
    }else if(name.includes('지네')||name.includes('그리마')){
      for(let i=0;i<7;i++){const x=6+i*6,y=21+((i+frame)&1)*3;rect(q,x,y,7,8,i%2?p.dark:p.mid);hiResDot(q,x+3,y+2,p.light);ln(q,x+2,y+7,x-1,y+13,p.dark,1);ln(q,x+5,y+7,x+8,y+13,p.dark,1)}
    }else if(name.includes('물고기')||name.includes('피라냐')){
      q.fillStyle=p.mid;q.beginPath();q.ellipse(25,25,16,10,0,0,Math.PI*2);q.fill();q.beginPath();q.moveTo(10,25);q.lineTo(2,14);q.lineTo(2,36);q.closePath();q.fill();rect(q,33,17,9,16,p.light);hiResDot(q,37,21,'#f4d69b');for(let i=0;i<4;i++)rect(q,38+i*2,30-i,2,2,'#e4d7bd');
    }else if(name.includes('거북')){
      q.fillStyle=p.dark;q.beginPath();q.ellipse(24,25,17,13,0,0,Math.PI*2);q.fill();rect(q,10,17,28,17,p.mid);box(q,13,19,22,13,p.light);rect(q,37,22,8,7,p.light);hiResDot(q,42,24,'#1b1b16');for(const [x,y] of [[8,18],[8,31],[36,16],[36,32]])rect(q,x,y,5,5,p.dark);
    }else if(name.includes('악어')||name.includes('수룡')){
      rect(q,5,19+bob,34,14,p.mid);rect(q,33,15+bob,13,12,p.light);rect(q,3,22+bob,10,7,p.dark);for(let i=0;i<6;i++)rect(q,9+i*5,17+bob,3,3,p.dark);hiResDot(q,41,19+bob,'#f0d49a');
    }else{
      const lunge=attack?5:0;rect(q,7+lunge,20+bob,31,15,p.mid);rect(q,31+lunge,13+bob,14,14,p.dark);rect(q,10+lunge,33+bob,7,8,p.dark);rect(q,30+lunge,33+bob,7,8,p.dark);rect(q,3+lunge,23+bob,8,5,p.dark);rect(q,34+lunge,15+bob,8,4,p.light);hiResDot(q,41+lunge,20+bob,'#f1d09b');if(name.includes('광견')||name.includes('경비견')){rect(q,35+lunge,8+bob,4,8,p.dark);rect(q,42+lunge,10+bob,4,8,p.dark)}
    }
    for(let i=0;i<5;i++){const x=8+((h>>>i)%32),y=12+((h>>>(i+5))%25);hiResDot(q,x,y,rgba(p.hi,.28))}
  }
  function drawHumanoid(q,m,frame,h){
    const p=pal(m.color||'#806b58'),attack=frame===2,bob=frame===1?1:0,name=m.name||'',guard=m.shape==='guard'||m.shape==='knight'||name.includes('병졸')||name.includes('수비병')||name.includes('인형');
    if(guard){rect(q,15,7+bob,19,12,p.dark);rect(q,18,8+bob,13,5,p.light);rect(q,16,18+bob,18,21,p.mid);rect(q,10,20+bob,7,17,p.dark);rect(q,33,20+bob,7,17,p.dark);rect(q,19,39,6,7,p.dark);rect(q,29,39,6,7,p.dark);rect(q,18,14+bob,13,4,'#11100e');for(let y=22;y<36;y+=5)rect(q,19,y+bob,13,2,rgba(p.hi,.18));if(attack){rect(q,39,11,3,30,'#c09b61');rect(q,36,11,9,3,'#c09b61')}}
    else{rect(q,17,8+bob,15,10,p.light);rect(q,14,18+bob,21,20,p.mid);rect(q,9,22+bob,6,15,p.mid);rect(q,34,22+bob,6,15,p.mid);rect(q,17,38,6,8,p.dark);rect(q,29,38,6,8,p.dark);hiResDot(q,21,12+bob,'#291d17');hiResDot(q,28,12+bob,'#291d17');if(name.includes('도둑')||name.includes('살수'))rect(q,16,7+bob,18,5,'#191416')}
    if(m.ranged||m.shape==='mage'){rect(q,39,15,3,26,'#6f4b30');rect(q,36,13,9,5,p.hi)}
  }
  function drawSpirit(q,m,frame,h){
    const p=pal(m.color||'#79657c'),attack=frame===2,bob=frame===1?1:0,name=m.name||'';
    if(name.includes('슬라임')||m.kind==='slime'){q.fillStyle=p.mid;q.beginPath();q.moveTo(7,37);q.quadraticCurveTo(6,18,24,13+bob);q.quadraticCurveTo(42,18,41,37);q.closePath();q.fill();rect(q,15,15+bob,18,7,p.light);hiResDot(q,18,26,'#191718');hiResDot(q,31,26,'#191718');for(let i=0;i<5;i++)hiResDot(q,10+((h>>>i)%28),19+((h>>>(i+4))%16),rgba(p.hi,.35))}
    else if(m.kind==='construct'||name.includes('가고일')||name.includes('수호상')){rect(q,10,10+bob,28,29,p.dark);rect(q,14,7+bob,20,13,p.mid);rect(q,6,18+bob,9,20,p.mid);rect(q,34,18+bob,9,20,p.mid);rect(q,15,38,7,8,p.dark);rect(q,28,38,7,8,p.dark);box(q,16,11+bob,16,10,p.light);hiResDot(q,20,15+bob,'#e1754d');hiResDot(q,29,15+bob,'#e1754d');if(attack)rect(q,5,12,38,4,rgba(p.hi,.22))}
    else{q.fillStyle=p.dark;q.beginPath();q.moveTo(13,13+bob);q.quadraticCurveTo(24,3+bob,35,13+bob);q.lineTo(40,39);q.lineTo(31,35);q.lineTo(24,44);q.lineTo(17,35);q.lineTo(8,39);q.closePath();q.fill();rect(q,16,11+bob,16,16,p.mid);rect(q,19,13+bob,10,7,p.light);hiResDot(q,21,18+bob,'#e8dfc4');hiResDot(q,28,18+bob,'#e8dfc4');if(attack){rect(q,4,23,40,3,rgba(p.hi,.30));rect(q,2,21,5,7,p.hi)}}
    for(let i=0;i<5;i++)hiResDot(q,9+((h>>>i)%31),9+((h>>>(i+5))%31),rgba(p.hi,.35));
  }
  function baseDpr(){const d=window.devicePixelRatio||1;return isMobileViewport()?Math.min(1.20,Math.max(1,d*.48)):Math.min(1.70,Math.max(1,d))}
  function syncCanvasWrapViewport(){if(state?.debugBattle57)return syncGameViewport();const w=document.getElementById('canvasWrap');if(!w)return false;const cs=getComputedStyle(w),cw=Math.max(300,Math.floor(w.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight))),ch=Math.max(280,Math.floor(w.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom))),dpr=P47.renderDpr;if(VIEW.w!==cw||VIEW.h!==ch||Math.abs(VIEW.dpr-dpr)>.01){VIEW.w=cw;VIEW.h=ch;VIEW.dpr=dpr;C.style.width=cw+'px';C.style.height=ch+'px';C.width=Math.max(1,Math.round(cw*dpr));C.height=Math.max(1,Math.round(ch*dpr));VIS.camInit=false;P47.force=true;P47.cullKey=''}return true}
  function trimTransient(){if(FX.particles?.length>120)FX.particles.splice(0,FX.particles.length-120);if(FX.floats?.length>28){const labels=FX.floats.filter(f=>!f.damage57).slice(-28);FX.floats=FX.floats.filter(f=>f.damage57||labels.includes(f))};if(FX.slashes?.length>18)FX.slashes.splice(0,FX.slashes.length-18);if(FX.projectiles?.length>18)FX.projectiles.splice(0,FX.projectiles.length-18);if(FX.doors?.length>16)FX.doors.splice(0,FX.doors.length-16);if(state?.decals?.length>48)state.decals.splice(0,state.decals.length-48)}
  const drawerOpen=()=>!!interactionActive8('mobileDrawer');
  const titleLightState={layers:null,lamps:[],last:-Infinity,reduced:null};
  function paintTitleScene(now,reduced){
    const st=titleSceneState49;if(!st.sky)return;const t=reduced?0:now/1000,q=st.sky,a=st.windows,W=q.canvas.width,H=q.canvas.height;
    q.clearRect(0,0,W,H);q.drawImage(st.background,0,0);a.clearRect(0,0,W,H);
    const x=W*.69,y=H*.16,pulse=.94+.06*Math.sin(t*.57),radius=178+12*Math.sin(t*.57),halo=q.createRadialGradient(x,y,20,x,y,radius);
    halo.addColorStop(0,`rgba(185,194,175,${.22*pulse})`);halo.addColorStop(.42,`rgba(174,191,178,${.065*pulse})`);halo.addColorStop(1,'rgba(173,185,170,0)');q.fillStyle=halo;q.fillRect(x-radius,y-radius,radius*2,radius*2);
    q.save();q.globalAlpha=pulse;q.fillStyle='#bbc6b5';q.beginPath();q.arc(x,y,37,0,Math.PI*2);q.fill();q.fillStyle='#09202b33';for(let i=0;i<8;i++){q.beginPath();q.arc(x-20+i*6,y+Math.sin(i*2)*23,5+i%5,0,7);q.fill();}q.restore();
    const clouds=[];for(const cloud of st.clouds){const width=cloud.art.width*cloud.scale,height=cloud.art.height*cloud.scale,span=W+width*1.5,xx=((cloud.start+t*cloud.speed)%span+span)%span-width;q.save();q.globalAlpha=cloud.opacity;q.drawImage(cloud.art,xx,H*cloud.y,width,height);q.restore();clouds.push({x:xx,y:H*cloud.y,width,speed:cloud.speed});}
    const rooms=[];for(const [i,w]of st.rooms.entries()){const period=i?37:27,phase=(t+(i?17.2:5.3))%period,dip=.74*Math.exp(-Math.pow((phase-1.2)/.10,2))+.46*Math.exp(-Math.pow((phase-1.47)/.08,2))+.62*Math.exp(-Math.pow((phase-1.85)/.14,2)),energy=reduced?1:Math.max(.18,1-dip);
      a.fillStyle=`rgba(5,12,12,${(1-energy)*.91})`;a.fillRect(w.x,w.y,w.w,w.h);rooms.push({...w,energy});}
    st.snapshot={time:t,moon:{x,y,radius,energy:pulse},clouds,rooms};return st.snapshot;
  }
  function paintTitleLights(now=performance.now(),force=false){
    const st=titleLightState,reduced=titleMotion49.matches;if(!st.layers)return;
    if(!force&&st.reduced===reduced&&(reduced||now-st.last<33))return st.lamps.map(({radius,energy})=>({radius,energy}));
    st.last=now;st.reduced=reduced;paintTitleScene(now,reduced);
    for(const q of Object.values(st.layers))q.clearRect(0,0,q.canvas.width,q.canvas.height);
    for(const lamp of st.lamps){
      const {x,y,r,side,index}=lamp,q=st.layers[side],light=menuLanternLight1001(now,index*.73+(side<0?0:2.5),r*9,reduced),yy=y+light.bob;
      drawMenuLight(q,x,yy,light);
      q.fillStyle='#ca550f';q.fillRect(x-r,yy-r,r*2,r*2);q.fillStyle='#ffd17a';q.fillRect(x-r+3,yy-r+3,r*2-6,r*2-6);
      q.fillStyle='#332923';q.fillRect(x-r-2,yy-r-3,r*2+4,3);q.fillRect(x-r-2,yy+r,r*2+4,3);q.fillRect(x-1,yy+r+3,2,12);
      lamp.radius=light.radius;lamp.energy=light.energy;
    }
    return st.lamps.map(({radius,energy})=>({radius,energy}));
  }
  function drawTitleCanvas(){
    const world=document.querySelector('.titleWorld');if(!world)return;
    let c=document.getElementById('titleCanvas49');if(!c){c=document.createElement('canvas');c.id='titleCanvas49';world.prepend(c)}
    const mobile=innerWidth<700,W=mobile?720:1440,H=mobile?1200:1000;c.width=W;c.height=H;c.dataset.mobile=mobile?'1':'0';const q=c.getContext('2d');q.imageSmoothingEnabled=false;
    const titleLights={};titleLightState.lamps=[];titleLightState.layers=titleLights;
    for(const side of [-1,1]){const id=side<0?'titleLanternLeft49':'titleLanternRight49';let layer=document.getElementById(id);if(!layer){layer=document.createElement('canvas');layer.id=id;layer.className='titleLanterns49';world.appendChild(layer)}layer.width=W;layer.height=H;titleLights[side]=layer.getContext('2d');titleLights[side].imageSmoothingEnabled=false;}

    const scene=titleSceneState49;scene.rooms=[];
    for(const [key,id]of [['sky','titleSky49'],['windows','titleWindows49']]){let layer=document.getElementById(id);if(!layer){layer=document.createElement('canvas');layer.id=id;world.appendChild(layer);}layer.width=W;layer.height=H;scene[key]=layer.getContext('2d');}
    scene.background=document.createElement('canvas');scene.background.width=W;scene.background.height=H;const bg=scene.background.getContext('2d'),sky=bg.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#08131b');sky.addColorStop(.48,'#1b2628');sky.addColorStop(1,'#090e10');bg.fillStyle=sky;bg.fillRect(0,0,W,H);
    scene.clouds=[{y:.065,start:W*.2,speed:11,scale:1.25,opacity:.48},{y:.12,start:W*.92,speed:17,scale:.95,opacity:.55},{y:.22,start:W*.6,speed:7,scale:1.7,opacity:.38},{y:.04,start:W*.75,speed:21,scale:.8,opacity:.36}].map((cloud,i)=>({...cloud,art:titleCloudArt(i*7)}));
    const poly=(pts,fill)=>{q.fillStyle=fill;q.beginPath();pts.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill()};
    // Distant ridges and silhouettes establish scale behind the inhabited inn.
    for(let row=0;row<3;row++){const pts=[[0,H]];for(let x=0;x<=W+60;x+=60)pts.push([x,H*(.29+row*.065)+Math.sin(x*.012+row)*38+Math.cos(x*.027)*22]);pts.push([W,H]);poly(pts,['#18272d','#142328','#101e23'][row])}
    function roof(x,y,w,h){
      poly([[x-22,y+h*.5],[x-7,y+h*.62],[x+w*.20,y+h*.43],[x+w*.5,y],[x+w*.8,y+h*.43],[x+w+7,y+h*.62],[x+w+22,y+h*.5],[x+w+13,y+h],[x-13,y+h]],'#071015');
      q.strokeStyle='#52615d';q.lineWidth=2;q.beginPath();q.moveTo(x-20,y+h*.57);q.quadraticCurveTo(x+w*.16,y+h*.92,x+w*.5,y+8);q.quadraticCurveTo(x+w*.84,y+h*.92,x+w+20,y+h*.57);q.stroke();
      q.fillStyle='#304243';q.fillRect(x-8,y+h-6,w+16,3);q.fillStyle='#977653';q.fillRect(x-3,y+h-1,w+6,2);
      for(let i=1;i<16;i++){const xx=x+w*i/16;q.strokeStyle=i%3?'#354548':'#65706a';q.lineWidth=1;q.beginPath();q.moveTo(x+w/2+(xx-x-w/2)*.72,y+10+Math.abs(i-8)*2);q.lineTo(xx,y+h-7);q.stroke()}
    }
    function building(cx,base,w,levels,scale=1,landmark=false){
      const fh=62*scale;for(let f=0;f<levels;f++){const ww=w-f*18*scale,x=cx-ww/2,y=base-(f+1)*fh;q.fillStyle='#19201e';q.fillRect(x,y,ww,fh);q.fillStyle='#49362a';q.fillRect(x,y+11,ww,5);q.fillStyle='#7a5c3b';q.fillRect(x,y+16,ww,2);
        for(let wx=x+13*scale;wx<x+ww-20*scale;wx+=32*scale){const glow=((Math.floor(wx)+f*13)%5)!==0;if(landmark&&f===levels-1&&[1,6].includes(Math.round((wx-x-13*scale)/(32*scale))))scene.rooms.push({x:wx,y:y+23*scale,w:19*scale,h:24*scale});q.fillStyle=glow?'#a27847':'#283a39';q.fillRect(wx,y+23*scale,19*scale,24*scale);q.fillStyle=glow?'#ddbd76':'#49605a';q.fillRect(wx+2*scale,y+24*scale,15*scale,3*scale);q.fillStyle='#2c2820';for(let j=0;j<3;j++)q.fillRect(wx+(3+j*6)*scale,y+23*scale,scale,24*scale);q.fillRect(wx,y+34*scale,19*scale,2*scale)}
        for(let px=x+3;px<x+ww;px+=64*scale){q.fillStyle='#462e24';q.fillRect(px,y+15,5*scale,fh-15);q.fillStyle='#977453';q.fillRect(px,y+16,scale,fh-16)}q.fillStyle='#101617';q.fillRect(x-5,y+fh-7,ww+10,7);roof(x-4,y-29*scale,ww+8,39*scale);
      }
    }
    const center=W*.5,base=H*.53;
    building(center-W*.32,base+H*.07,W*.27,3,.9);building(center+W*.32,base+H*.05,W*.26,4,.82);
    building(center-W*.17,base-40,W*.23,4,.82);building(center+W*.18,base-30,W*.22,3,.95);
    building(center,base,W*(mobile?.47:.27),5,1.04,true);
    // Stepped stone forecourt, gate and a receding procession path.
    const gw=mobile?160:190,gy=base-52; q.fillStyle='#080d0e';q.fillRect(center-gw/2,gy,gw,96);q.fillStyle='#4f3425';q.fillRect(center-gw/2,gy,8,96);q.fillRect(center+gw/2-8,gy,8,96);roof(center-gw/2-14,gy-35,gw+28,40);
    q.fillStyle='#d3ad67';q.fillRect(center-34,gy+7,68,21);q.fillStyle='#241b14';q.font='bold 15px serif';q.textAlign='center';q.fillText('萬  樓',center,gy+23);
    for(let i=0;i<5;i++){q.fillStyle=i%2?'#39413c':'#4b5147';q.fillRect(center-gw/2-i*13,base+34+i*6,gw+i*26,5)}
    poly([[center-55,base+65],[center+55,base+65],[center+W*.39,H],[center-W*.39,H]],'#28302c');
    for(let j=0;j<13;j++){const t=j/13,yy=base+65+(H-base-65)*t*t,ww=110+(W*.78-110)*t*t;q.strokeStyle='#81857522';q.beginPath();q.moveTo(center-ww/2,yy);q.lineTo(center+ww/2,yy);q.stroke()}
    function lantern(x,y,r,side){titleLightState.lamps.push({x,y,r,side,index:titleLightState.lamps.length})}
    for(const side of [-1,1]){lantern(center+side*(gw/2-12),gy+57,8,side);for(let i=0;i<3;i++){const x=center+side*(gw*.9+i*W*.12),y=base+90+i*85;q.fillStyle='#101b1d';q.fillRect(x-3,y,6,50+i*12);lantern(x,y-7,7+i*2,side)}}
    for(let i=0;i<80;i++){const x=(i*137+31)%W,y=(i*83+11)%(H*.67);q.fillStyle=i%4?'#c7b18126':'#e5c88c66';q.fillRect(x,y,1+i%2,1+i%2)}
    const fog=q.createLinearGradient(0,H*.45,0,H);fog.addColorStop(0,'#0c141400');fog.addColorStop(.4,'#0a131a77');fog.addColorStop(1,'#060b0e');q.fillStyle=fog;q.fillRect(0,0,W,H);
    const edge=q.createRadialGradient(center,H*.34,100,center,H*.38,W*.7);edge.addColorStop(0,'#00000000');edge.addColorStop(1,'#03090cc9');q.fillStyle=edge;q.fillRect(0,0,W,H);
    paintTitleLights(performance.now(),true);
  }
  /* ---------- performance: 1x mobile raster, dirty rendering, diff-only HUD ---------- */
  const RENDER_PERF_STATE={dirty:true,panelDirty:true,miniDirty:true,lastFrame:0,lastPanel:0,lastMini:0,lastHud:0,lastDrawCost:10,emaCost:10,lastTurn:-1,lastEquip:'',lastLog:'',viewW:0,viewH:0};
  function syncGameViewport(){
    const observing=!!state?.debugBattle57,w=document.getElementById(observing?(DEBUG_BATTLE57.watching?'battleWatchViewport57':'battleViewport57'):'canvasWrap');if(!w||!C?.isConnected)return false;
    const cs=getComputedStyle(w),cw=Math.max(observing?1:300,Math.floor((w.clientWidth||(observing?innerWidth:0))-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0))),ch=Math.max(observing?1:280,Math.floor((w.clientHeight||(observing?innerHeight-130:0))-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0))),dpr=mobileDpr49();
    if(VIEW.w!==cw||VIEW.h!==ch||Math.abs(VIEW.dpr-dpr)>.01){VIEW.w=cw;VIEW.h=ch;VIEW.dpr=dpr;C.style.width=cw+'px';C.style.height=ch+'px';C.width=Math.max(1,Math.round(cw*dpr));C.height=Math.max(1,Math.round(ch*dpr));VIS.camInit=false;RENDER_PERF_STATE.dirty=true;RENDER_PERF_STATE.miniDirty=true}
    return true;
  }
  function drawBossIntent(){
 if(!state)return;drawBossArena();
 const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),now=performance.now(),pulse=.55+.35*Math.sin(now/140),colors={blackFrost105:[139,210,236],charge:[218,65,45],maul:[196,86,58],ink:[119,138,110],inkbeam:[103,137,111],weave:[207,92,142],sew:[199,104,150],chain:[171,127,89],blade:[225,102,72]};
 X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
 for(const mon of state.monsters||[]){const I=mon.intent54;if(!I)continue;const silkIntent=I.type==='weave'||I.type==='sew';
  if(I.type==='corebolt'){drawCoreSealWarning(X,I,c=>({x:cam.x+c.x*TILE*cam.zoom,y:cam.y+c.y*TILE*cam.zoom,size:TILE*cam.zoom}),now,c=>state.visible.has(k(c.x,c.y)));continue}
  if(I.type==='palaceSweep105'){drawPalaceSweepWarning(X,I,c=>({x:cam.x+c.x*TILE*cam.zoom,y:cam.y+c.y*TILE*cam.zoom,size:TILE*cam.zoom}),now,c=>state.visible.has(k(c.x,c.y)));continue}
  for(const c of I.cells){
   if(!state.visible.has(k(c.x,c.y)))continue;const rgb=colors[I.type]||[220,130,72],x=cam.x+c.x*TILE*cam.zoom,y=cam.y+c.y*TILE*cam.zoom,z=TILE*cam.zoom;
   X.save();X.beginPath();X.rect(x,y,z,z);X.clip();X.fillStyle=`rgba(${rgb.join(',')},${.10+.13*pulse})`;X.fillRect(x+1,y+1,z-2,z-2);if(silkIntent){X.restore();continue}X.strokeStyle=`rgba(${rgb.join(',')},${.65+.3*pulse})`;X.lineWidth=Math.max(1,1.5*cam.zoom);
   if(I.type==='blackFrost105'){X.strokeRect(x+2,y+2,z-4,z-4);for(let i=0;i<3;i++){const a=i*Math.PI/3;X.beginPath();X.moveTo(x+z*.5+Math.cos(a)*z*.32,y+z*.5+Math.sin(a)*z*.32);X.lineTo(x+z*.5-Math.cos(a)*z*.32,y+z*.5-Math.sin(a)*z*.32);X.stroke()}}else if(I.type==='chain'){
    for(let i=0;i<3;i++){X.beginPath();X.ellipse(x+z*(.2+i*.3),y+z*.52,z*.15,z*.075,-.35,0,Math.PI*2);X.stroke()}
   }else{X.strokeRect(x+3,y+3,z-6,z-6);X.beginPath();X.moveTo(x+z*.22,y+z*.22);X.lineTo(x+z*.78,y+z*.78);X.moveTo(x+z*.78,y+z*.22);X.lineTo(x+z*.22,y+z*.78);X.stroke()}
   X.restore();
  }
  if(silkIntent){
   X.save();X.translate(cam.x,cam.y);X.scale(cam.zoom,cam.zoom);
   if(I.type==='weave')for(const link of I.data?.links||[]){const ends=silkLinkEndpoints(mon,link);if(ends)drawSilkThread(X,...ends,now,link.a*13+link.b,true)}
   else if(I.cells.length)drawSilkThread(X,mon,I.cells[I.cells.length-1],now,0,true);
   X.restore();
  }
 }
 X.restore();
}
  function potionIconHtml56R(item,cls=''){const a=app56(item),mark=isPotionKnownByPlayer(item)?'':'?';return `<span class="vfHiIcon ${cls} v56PotionIcon" style="--liquid:${a.color};--glass:${a.glass}"><i class="neck"></i><i class="bottle"></i><i class="shine"></i><b class="mark">${mark}</b></span>`}
  function drawPotionWorld56R(item){const px=item.x*TILE,py=item.y*TILE;X.save();X.fillStyle='rgba(0,0,0,.45)';X.fillRect(px+9,py+26,14,3);const a=app56(item);X.fillStyle='#5a3b27';X.fillRect(px+14,py+6,5,6);X.fillStyle='#bba782';X.fillRect(px+13,py+9,7,3);X.fillStyle='#4b2d20';X.fillRect(px+10,py+12,13,14);X.fillStyle=a.color;X.fillRect(px+12,py+14,9,10);X.fillStyle=a.glass;X.globalAlpha=.38;X.fillRect(px+13,py+15,2,7);X.globalAlpha=1;if(!isPotionKnownByPlayer(item)){X.fillStyle='#e3cfaa';X.font='900 8px ui-monospace,monospace';X.fillText('?',px+24,py+10)}X.restore()}
  // ---- fast renderer: bypass accumulated drawMap wrapper stack on mobile/desktop
  const FRAME_PERF_STATE={last:0,lastMini:0,lastHud:0,lastViewport:0,dirty:true,avg:0,lastCost:0,frames:0};
  function drawField(f,now){
    for(const {x,y} of tempFieldCells57(f)){
      if(x<0||y<0||x>=COLS||y>=ROWS||!state.visible.has(k(x,y)))continue;
      const px=x*TILE,py=y*TILE,a=.13+.035*Math.sin(now/190+x+y);
      if(f.kind==='steam'){X.fillStyle=`rgba(108,165,176,${a+.12})`;for(let i=0;i<3;i++){X.beginPath();X.ellipse(px+8+i*8,py+19-Math.sin(now/450+x+i)*3,7,5,0,0,Math.PI*2);X.fill()}}
      if(f.kind==='smoke'){const warning=f.martialSmoke&&f.smokeForm==='burst'&&f.ttl===1;X.fillStyle=warning?`rgba(205,49,41,${a+.18})`:`rgba(120,126,128,${a})`;X.fillRect(px+2,py+2,28,28);if(f.martialSmoke){X.strokeStyle=warning?'#e8765d':f.smokeForm==='cloud'?'#8ba9b9':'#979b9c';X.globalAlpha=.55;X.beginPath();X.arc(px+16,py+16,8+Math.sin(now/300+x)*2,0,Math.PI*1.7);X.stroke();X.globalAlpha=1}}
      else if(f.kind==='fire')drawFireFloor(X,px,py,TILE,x,y,now);
    }
  }
  function drawWallMass(b){
    // Full-material wall projection. The completed scenery fog pass owns memory darkness.
    const p=[['#4d241b','#7a3b2a'],['#304139','#657467'],['#40253e','#79516f'],['#403228','#78604d'],['#4e401e','#9d8236']][regionIndex()]||['#4d241b','#7a3b2a'];
    const indoor=['canal','granary'].includes(state.branchContext105?.id);
    const front=(x,y)=>terrainBaseTile58(x,y)===TT.WALL&&terrainBaseTile58(x,y+1)!==TT.WALL&&state.seen.has(k(x,y));
    for(let y=b.y0;y<=Math.min(b.y1,ROWS-2);y++){
      let x=b.x0;
      while(x<=b.x1){
        if(!front(x,y)){x++;continue}
        const s=x,material=indoor?branchDistrictAt(x,y):null;
        while(x<=b.x1&&front(x,y)&&(!indoor||branchDistrictAt(x,y)===material))x++;
        const w=(x-s)*TILE,px=s*TILE,py=y*TILE;
        X.save();X.globalAlpha=1;
        if(indoor){
          const g=X.createLinearGradient(0,py+25,0,py+39);g.addColorStop(0,material.wall);g.addColorStop(.35,colorShift(material.wall,-9));g.addColorStop(1,material.dark);X.fillStyle=g;
        }else{const g=X.createLinearGradient(0,py+27,0,py+39);g.addColorStop(0,p[0]);g.addColorStop(1,colorShift(p[0],-9));X.fillStyle=g}X.fillRect(px+1,py+25,w-2,14);
        X.fillStyle=indoor?material.cap:p[1];X.fillRect(px+1,py+25,w-2,2);
        if(indoor){
          X.fillStyle='rgba(10,16,15,.38)';X.fillRect(px+1,py+34,w-2,1);
          for(let a=px+18;a<px+w-1;a+=material.wood?16:32){X.fillRect(a,py+28,1,6);X.fillStyle='rgba(214,216,182,.13)';X.fillRect(a+1,py+28,.5,5);X.fillStyle='rgba(10,16,15,.38)';}
        }
        X.fillStyle='rgba(255,237,200,.035)';X.fillRect(px+2,py+29,w-4,1);
        X.fillStyle='rgba(0,0,0,.46)';X.fillRect(px+1,py+36,w-2,3);
        X.restore();
      }
    }
  }
  function drawSceneryFog(b,unknownColor,ctx=X){
    ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){
      const key=k(x,y);if(state.visible.has(key)||mineSceneryVisible(x,y))continue;
      ctx.fillStyle=state.seen.has(key)||mineScenerySeen(x,y)?'rgba(3,4,5,.67)':unknownColor;
      ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
    }
    ctx.restore();
  }
  function drawFast(force=false){
    if(!state||document.hidden||X.isContextLost?.())return false;
    const t0=performance.now(),now=t0,cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),colors=regionColors(),b=bounds58(cam,isMobileViewport()?1:2);
    FX.frameNow=now;
    if(state.debugBattle57&&cam.zoom<.3)return drawDebugBattleOverview(cam,now);
    X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over';X.lineWidth=1;X.lineCap='butt';X.lineJoin='miter';X.setLineDash([]);X.lineDashOffset=0;X.filter='none';X.shadowBlur=0;X.shadowOffsetX=0;X.shadowOffsetY=0;X.shadowColor='rgba(0,0,0,0)';X.beginPath();
    X.fillStyle=colors.fog||'#080503';X.fillRect(0,0,VIEW.w,VIEW.h);
    X.save();X.translate(cam.x,cam.y);X.scale(cam.zoom,cam.zoom);X.imageSmoothingEnabled=false;
    const terrainProps63=[];
    for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){
      const kk=k(x,y);if(!state.seen.has(kk)&&!mineScenerySeen(x,y))continue;const vis=state.visible.has(kk)||mineSceneryVisible(x,y),px=x*TILE,py=y*TILE,t=mineHidden(x,y)?TT.VOID:state.map[y][x];
      X.save();
      if(drawBranchCell(t,px,py,x,y,terrainProps63)){X.restore();continue}
      if(state.artifactDungeon46&&globalThis.__MANRU_LEGEND_TERRAIN47__?.drawCell?.(t,px,py,x,y,now,true)){X.restore();continue}
      X.globalAlpha=1;const base=terrainBaseTile58(x,y,t);
      if(base===TT.WALL)drawWallTexture(px,py,x,y,colors);else{drawFloorTexture(px,py,x,y,colors,true);if(base!==TT.FLOOR&&base!==TT.GRASS){if(!drawSpecialTerrain(base,px,py,x,y,now))drawInteractiveTerrain(base,px,py,x,y,now)}}
      if(t!==base&&t!==TT.FLOOR&&t!==TT.GRASS&&t!==TT.WALL)terrainProps63.push({t,px,py,x,y});
      X.restore();
    }
    X.globalAlpha=1;
    for(const d of state.decor||[])if(d.layer==='ground'&&inB58(d,b,1)&&state.seen.has(k(d.x,d.y)))vfDrawDecor(d,true);
    for(const d of state.decals||[])if(inB58(d,b,1)&&VisibilityService.isVisible(d.x,d.y))drawDecal(d);

    // Canonical world order: substrate -> projected architecture -> props -> fog -> loot -> actors -> FX.
    // The projected wall plate is architecture, but ground loot is a gameplay-readable layer and must remain
    // visible in the lower cell.  This fixes talismans/scrolls being hidden by the wall plate WITHOUT resizing
    // or shifting the item art itself.
    const props=[];
    for(const d of state.decor||[])if(d.layer==='object'&&inB58(d,b,1)&&state.seen.has(k(d.x,d.y)))props.push({y:d.y+.78,o:d});
    props.sort((a,b)=>a.y-b.y);
    if(!state.artifactDungeon46&&(!state.branchContext105||['canal','granary'].includes(state.branchContext105.id)))drawWallMass(b);
    drawDepthOcclusion(now,b);
    for(const l of state.branchTerrain105?.mine105?.lanterns||[])if(l.x>=b.x0&&l.x<=b.x1&&l.y>=b.y0&&l.y<=b.y1&&state.seen.has(k(l.x,l.y)))terrainProps63.push({t:TT.LANTERN_POST,px:l.x*TILE,py:l.y*TILE,x:l.x,y:l.y});
    // All physical props share one foreground pass above projected architecture, below FOV and actors.
    for(const a of terrainProps63){X.save();X.lineWidth=1;X.setLineDash([]);if(!drawSpecialTerrain(a.t,a.px,a.py,a.x,a.y,now))drawInteractiveTerrain(a.t,a.px,a.py,a.x,a.y,now);X.restore()}
    for(const a of props)vfDrawDecor(a.o,true);

    if(!state.branchContext105)for(const p of state.branchPortals105||[])if(state.seen.has(k(p.x,p.y)))drawBranchDoor(p.x*TILE,p.y*TILE,p);
    // Revealed rumor entrances are a gameplay cue, so they must sit above the projected wall face/depth pass.
    // The old legacy renderer drew this cue inside the base-tile loop, but the canonical fast renderer did not draw it at all.
    // Keep ownership here: no wrapper/overlay renderer is allowed to repair this later.
    for(const r of state.rumorSpaces1030||[]){
      if(!r?.revealed||r.opened||!r.entry)continue;const x=r.entry.x,y=r.entry.y;
      if(x<b.x0-1||x>b.x1+1||y<b.y0-1||y>b.y1+1||!state.seen.has(k(x,y)))continue;
      globalThis.__MANRU_RUMOR_SPACES1030__?.drawEntranceOverlay?.(X,state.map[y]?.[x],x*TILE,y*TILE,x,y,now);
    }

    drawTerrainReactions(now,b);
    drawWorldLights(now,b);
    drawSceneryFog(b,colors.fog||'#080503');

    const floorLoot=[];
    for(const it of state.items||[])if(inB58(it,b,1)&&VisibilityService.isVisible(it.x,it.y))floorLoot.push({y:it.y+.62,o:it});
    floorLoot.sort((a,b)=>a.y-b.y);
    for(const a of floorLoot)drawItem(a.o);

    const living=[];
    for(const m of state.monsters||[])if(inB58(m,b,2)&&isEntityObservableToPlayer57(m))living.push({y:m.y+.70,o:m});
    if(!state.debugBattle57)living.push({y:VIS.playerY+.72,o:{x:VIS.playerX,y:VIS.playerY,color:state.player.color,shape:'player',name:'player'}});
    living.sort((a,b)=>a.y-b.y);
    for(const a of living){drawCreature(a.o);if(state.debugBattle57){const m=a.o,p=v8CreatureCoords(m),color=entityFaction(m)==='player'?'#78c8ff':'#ff9d8e';X.save();X.strokeStyle=color;X.lineWidth=1.5;for(const c of entityFootprintCells57(m))X.strokeRect((c.x-m.x+p.x)*TILE+1,(c.y-m.y+p.y)*TILE+1,TILE-2,TILE-2);X.font='bold 9px system-ui';X.fillStyle=color;X.fillText((m.debugSide57||'')+(m.debugId57||''),p.x*TILE+2,p.y*TILE+TILE-2);X.restore();}}
    for(const n of state.neutralInteractables58||[])drawNeutralInteractable(n);

    for(const f of state.tempFields||[])if(inB58(f,b,6))drawField(f,now);
    const echo=state.martialEcho;if(echo?.floor===state.floor&&state.visible.has(k(echo.x,echo.y))){X.save();X.strokeStyle='#c4b980';X.lineWidth=1;for(let i=0;i<3;i++){X.globalAlpha=.7-i*.15;X.beginPath();X.ellipse(echo.x*32+16,echo.y*32+21,5+i*4,3+i*2,0,0,Math.PI*2);X.stroke()}X.restore()}
    drawJarGas(now,b);
    drawMineWorld(now,b);

    // Gameplay glows follow actors; physical lights are applied to scenery before fog.
    X.globalCompositeOperation='screen';
    const glowAt58=(tx,ty,color,rad=56,alpha=.15)=>{
      // Additive world light still obeys current FOV. Clip the glow to visible tiles so a player,
      // stair or high-grade item cannot re-light a seen-only wall plate after its memory-dark pass.
      const gx=tx*TILE+TILE/2,gy=ty*TILE+TILE/2,x0=Math.max(b.x0,Math.floor((gx-rad)/TILE)),y0=Math.max(b.y0,Math.floor((gy-rad)/TILE)),x1=Math.min(b.x1,Math.floor((gx+rad)/TILE)),y1=Math.min(b.y1,Math.floor((gy+rad)/TILE));
      let cells=0;X.save();X.beginPath();for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!state.visible.has(k(x,y)))continue;const cx=x*TILE+TILE/2,cy=y*TILE+TILE/2;if(Math.hypot(cx-gx,cy-gy)>rad+TILE*.75)continue;X.rect(x*TILE,y*TILE,TILE,TILE);cells++}
      if(cells){X.clip();const g=X.createRadialGradient(gx,gy,3,gx,gy,rad);g.addColorStop(0,color.replace('ALPHA',alpha));g.addColorStop(1,color.replace('ALPHA','0'));X.fillStyle=g;X.fillRect(gx-rad,gy-rad,rad*2,rad*2)}X.restore();
    };
    if(!state.debugBattle57)glowAt58(VIS.playerX,VIS.playerY,'rgba(211,158,88,ALPHA)',68,.10);
    if(VisibilityService.isVisible(state.stairs.x,state.stairs.y))glowAt58(state.stairs.x,state.stairs.y,'rgba(211,171,91,ALPHA)',50,.10);
    for(const it of state.items||[])if(inB58(it,b,2)&&VisibilityService.isVisible(it.x,it.y)&&['relic','sealed'].includes(it.rarity))glowAt58(it.x,it.y,it.rarity==='sealed'?'rgba(176,76,59,ALPHA)':'rgba(214,166,70,ALPHA)',42,.10);
    X.globalCompositeOperation='source-over';
    drawMonsterWarningAuras(now,b);drawFX(now);
    X.restore();

    // Atmosphere/vignette are screen-space post passes, matching the old quality order without restoring old ownership.
    drawRegionalAtmosphere(now);
    X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
    const vg58=X.createRadialGradient(VIEW.w/2,VIEW.h/2,Math.min(VIEW.w,VIEW.h)*.30,VIEW.w/2,VIEW.h/2,Math.max(VIEW.w,VIEW.h)*.68);vg58.addColorStop(0,'rgba(0,0,0,0)');vg58.addColorStop(1,'rgba(0,0,0,.24)');X.fillStyle=vg58;X.fillRect(0,0,VIEW.w,VIEW.h);
    const aim=currentAim();if(aim?.check?.ok)screenMark58(aim.x,aim.y,cam,'rgba(235,194,104,.92)');
    const tal=currentTalismanTarget();if(tal){const r=tal.range||5;for(let y=Math.max(0,state.player.y-r);y<=Math.min(ROWS-1,state.player.y+r);y++)for(let x=Math.max(0,state.player.x-r);x<=Math.min(COLS-1,state.player.x+r);x++)if(entityDistance57({x,y},state.player)<=r&&state.seen.has(k(x,y)))screenMark58(x,y,cam,'rgba(220,190,116,.20)')}
    const wt=worldTargetSnapshot();if(wt)for(const q of wt.cells)screenMark58(q.x,q.y,cam,wt.kind==='blink21'?'rgba(159,206,234,.34)':'rgba(220,190,116,.24)');
    if(VIS.autoPath?.length)v10DrawPath(VIS.autoPath,true);
    drawStatusScreen(now);if(now<FX.flashUntil){X.save();X.globalAlpha=22/255;X.fillStyle=FX.flashColor;X.fillRect(0,0,VIEW.w,VIEW.h);X.restore()}
    if(state.player.hp/state.player.maxHp<.28){X.save();X.strokeStyle='rgba(161,43,39,.28)';X.lineWidth=8;X.strokeRect(4,4,VIEW.w-8,VIEW.h-8);X.restore()}
    drawTransition(now);
    FRAME_PERF_STATE.last=now;FRAME_PERF_STATE.lastCost=performance.now()-t0;FRAME_PERF_STATE.frames++;FRAME_PERF_STATE.avg+= (FRAME_PERF_STATE.lastCost-FRAME_PERF_STATE.avg)/Math.min(FRAME_PERF_STATE.frames,120);FRAME_PERF_STATE.dirty=false;
    return true;
  }
  function drawDoorAt(px,py,open,x,y){drawDoor(px,py,open,state.map[y-1]?.[x]===TT.WALL&&state.map[y+1]?.[x]===TT.WALL)}
  /* ---------- visual telegraphs / role readability / bright orchard ---------- */
  function drawRoleOverlay(){if(!state)return;const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),now=performance.now(),screen=(x,y)=>globalThis.__MANRU_CAMERA_PROJECTION12__.tileCenter(x,y,cam);X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
    for(const m of state.monsters||[]){if(m.hp<=0||m.hidden||!state.visible.has(k(m.x,m.y)))continue;
      if(m.gaze&&(m.gazeCount||0)>0){const a=screen(m.x,m.y),b=screen(state.player.x,state.player.y),stacks=Math.min(4,Math.max(1,m.gazeCount||0)),p=Math.min(1,stacks/4),pulse=.5+.5*Math.sin(now/125),dx=b.x-a.x,dy=b.y-a.y;X.save();X.globalCompositeOperation='screen';X.setLineDash([Math.max(3,(10-4*p)*cam.zoom),Math.max(2,(8-3*p)*cam.zoom)]);X.strokeStyle=`rgba(224,108,194,${.14+p*.82+pulse*.05})`;X.lineWidth=Math.max(1.2,(1.2+p*4.6)*cam.zoom);X.beginPath();X.moveTo(a.x,a.y);X.lineTo(b.x,b.y);X.stroke();X.setLineDash([]);X.strokeStyle=`rgba(255,232,247,${.12+p*.54})`;X.lineWidth=Math.max(1,(.6+p*1.35)*cam.zoom);X.beginPath();X.moveTo(a.x,a.y);X.lineTo(b.x,b.y);X.stroke();for(let i=1;i<=4;i++){const u=i/5,cx=a.x+dx*u,cy=a.y+dy*u,filled=i<=stacks;X.fillStyle=filled?`rgba(255,${Math.round(214+16*p)},240,${.20+p*.38})`:`rgba(255,222,241,.12)`;X.beginPath();X.arc(cx,cy,Math.max(1.1,(filled?1.5+p*2.6:1.2)*cam.zoom),0,Math.PI*2);X.fill()}for(const q of[a,b]){X.strokeStyle=`rgba(255,190,232,${.25+p*.58})`;X.lineWidth=Math.max(1,1.4*cam.zoom);X.beginPath();X.arc(q.x,q.y,q.s*(.12+p*.07),0,Math.PI*2);X.stroke()}X.restore()}
      if(m.intent61)for(const c of m.intent61.cells){const q=screen(c.x,c.y),a=.18+.10*Math.sin(now/90);X.fillStyle=m.intent61.type==='poison'?`rgba(111,174,89,${a})`:m.intent61.type==='seal'?`rgba(154,112,188,${a})`:`rgba(221,104,58,${a})`;X.fillRect(q.x-q.s/2+3,q.y-q.s/2+3,q.s-6,q.s-6);X.strokeStyle='rgba(255,227,177,.68)';X.strokeRect(q.x-q.s/2+4.5,q.y-q.s/2+4.5,q.s-9,q.s-9)}
      if(m.role61==='asura'&&(m.asuraWarn61||(m.asuraZone61||0)>0)){const q=screen(m.x,m.y),rad=m.asuraRadius61||m.asuraRadius47||3,pulse=.58+.18*Math.sin(now/120);if((m.asuraZone61||0)>0){for(let yy=Math.max(0,m.y-rad);yy<=Math.min(ROWS-1,m.y+rad);yy++)for(let xx=Math.max(0,m.x-rad);xx<=Math.min(COLS-1,m.x+rad);xx++){if(!state.visible.has(k(xx,yy))||Math.hypot(xx-m.x,yy-m.y)>rad+.28)continue;const c=screen(xx,yy);X.fillStyle=`rgba(128,72,161,${.055+.035*pulse})`;X.fillRect(c.x-c.s/2+2,c.y-c.s/2+2,c.s-4,c.s-4)}X.strokeStyle=`rgba(229,190,103,${.72+.18*pulse})`;X.lineWidth=Math.max(2,2*cam.zoom);X.beginPath();X.arc(q.x,q.y,(rad+.48)*q.s,0,Math.PI*2);X.stroke();X.setLineDash([6*cam.zoom,4*cam.zoom]);X.strokeStyle='rgba(157,99,190,.68)';X.beginPath();X.arc(q.x,q.y,(rad-.15)*q.s,0,Math.PI*2);X.stroke();X.setLineDash([])}else{X.strokeStyle=`rgba(229,175,89,${pulse})`;X.lineWidth=Math.max(2,2*cam.zoom);X.setLineDash([5*cam.zoom,5*cam.zoom]);X.beginPath();X.arc(q.x,q.y,(rad+.48)*q.s,0,Math.PI*2);X.stroke();X.setLineDash([])}if(m.asuraVolleyWarn61){const pt=m.asuraVolleyTarget61||state.player,t=screen(pt.x,pt.y);X.strokeStyle=`rgba(245,126,82,${.72+.20*pulse})`;X.lineWidth=2;X.beginPath();X.arc(t.x,t.y,t.s*.45,0,Math.PI*2);X.moveTo(t.x-t.s*.58,t.y);X.lineTo(t.x+t.s*.58,t.y);X.moveTo(t.x,t.y-t.s*.58);X.lineTo(t.x,t.y+t.s*.58);X.stroke()}}
      if(m.role61){const q=screen(m.x,m.y),rune=ROLE_RUNE[m.role61]||'적';X.fillStyle='rgba(8,5,3,.82)';X.fillRect(q.x-8,q.y-q.s*.56-10,16,12);X.fillStyle=m.role61==='asura'?'#f0cf7c':'#e7c58c';X.font='900 9px "Noto Sans CJK KR",sans-serif';X.textAlign='center';X.fillText(rune,q.x,q.y-q.s*.56)}
    }
    for(const g of state.gazeBursts57||[]){const age=now-g.t,ttl=g.ttl||460;if(age<0||age>=ttl)continue;const t=age/ttl,a=screen(g.x0,g.y0),b=screen(g.x1,g.y1),alpha=(1-t),dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;X.save();X.globalCompositeOperation='screen';X.strokeStyle=`rgba(255,184,232,${.90*alpha})`;X.lineWidth=Math.max(2,(3+t*16)*cam.zoom);X.beginPath();X.moveTo(a.x,a.y);X.lineTo(b.x,b.y);X.stroke();X.strokeStyle=`rgba(255,244,252,${.78*alpha})`;X.lineWidth=Math.max(1,(1.2+t*4)*cam.zoom);X.beginPath();X.moveTo(a.x,a.y);X.lineTo(b.x,b.y);X.stroke();for(let i=1;i<=7;i++){const u=i/8,cx=a.x+dx*u,cy=a.y+dy*u,spread=(5+22*t)*cam.zoom*((i&1)?1:-1),r=(2+5*t)*cam.zoom;X.fillStyle=`rgba(255,205,239,${alpha*(.70-i*.035)})`;X.beginPath();X.arc(cx+nx*spread,cy+ny*spread,r,0,Math.PI*2);X.fill()}X.restore()}
    X.textAlign='start';X.restore()}
  /* Level atmosphere is screen-space; generation room bounds are metadata only. */
  function drawFeelingOverlay(){
    if(!state)return;
    X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
    const f=feeling62();
    if(f){
      if(f.id==='dark'){X.fillStyle='rgba(12,8,18,.07)';X.fillRect(0,0,VIEW.w,VIEW.h)}
      else if(f.id==='supply'){X.strokeStyle='rgba(191,151,79,.10)';X.strokeRect(7.5,7.5,VIEW.w-15,VIEW.h-15)}
      else if(f.id==='traps'){X.strokeStyle='rgba(175,76,61,.11)';X.strokeRect(5.5,5.5,VIEW.w-11,VIEW.h-11)}
      else if(f.id==='secrets'){X.strokeStyle='rgba(122,116,181,.10)';X.strokeRect(9.5,9.5,VIEW.w-19,VIEW.h-19)}
    }
    X.restore();
  }
  function drawElementOverlay(){if(!state)return;const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),now=performance.now();X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);for(const f of state.elementFields74||[]){if(f.kind!=='fire')continue;for(const c of f.cells??elementCells105(f.x,f.y,1)){if(!state.visible.has(k(c.x,c.y)))continue;const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileTopLeft(c.x,c.y,cam);drawFireFloor(X,q.x,q.y,q.s,c.x,c.y,now);}}for(const t of state.tempTerrain74||[]){if(!state.visible.has(k(t.x,t.y)))continue;const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileTopLeft(t.x,t.y,cam),sx=q.x,sy=q.y,s=q.s,a=.18+.06*Math.sin(now/180+t.x+t.y);X.strokeStyle=t.kind==='lava'?`rgba(255,120,50,${a+.2})`:`rgba(208,176,121,${a+.12})`;X.lineWidth=2;X.strokeRect(sx+2,sy+2,s-4,s-4)}if(V74.target){const rr=V74.target.range;for(let y=Math.max(0,state.player.y-rr);y<=Math.min(ROWS-1,state.player.y+rr);y++)for(let x=Math.max(0,state.player.x-rr);x<=Math.min(COLS-1,state.player.x+rr);x++)if(entityDistance57({x,y},state.player)<=rr&&state.seen.has(k(x,y))){const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileTopLeft(x,y,cam),sx=q.x,sy=q.y,s=q.s;X.strokeStyle='rgba(226,190,111,.28)';X.strokeRect(sx+3,sy+3,s-6,s-6)}}X.restore()}
  /* ---------------- camera: follow by default, drag to inspect, next movement resumes follow ---------------- */
  const CameraController={
    state(){return globalThis.__MANRU_CAMERA_STATE12__?.snapshot()||{mode:'follow',zoom:1,cx:0,cy:0,tx:0,ty:0}},
    set(mode){return globalThis.__MANRU_CAMERA_STATE12__?.setMode(mode)},
    beginInspect(){return globalThis.__MANRU_CAMERA_STATE12__?.beginInspect()},
    panScreen(dx,dy){return globalThis.__MANRU_CAMERA_STATE12__?.panScreen(dx,dy)},
    endPan(){return globalThis.__MANRU_CAMERA_STATE12__?.endPan()},
    cancelInertia(){return globalThis.__MANRU_CAMERA_STATE12__?.cancelInertia()},
    resume(snap=false){return globalThis.__MANRU_CAMERA_STATE12__?.resume(snap)},
    center(){return globalThis.__MANRU_CAMERA_STATE12__?.center()}
  };
  /* ---------------- actual zoom controller: reuse the verified zoom implementation ---------------- */
  const ZoomController={
    value(){return Math.round(globalThis.__MANRU_CAMERA_STATE12__?.desiredZoom?.()*100||100)},
    step(dir){const c=globalThis.__MANRU_CAMERA_STATE12__;return c?.setZoom(c.desiredZoom()+(dir>0?.05:-.05),false)},
    reset(){return globalThis.__MANRU_CAMERA_STATE12__?.setZoom(1,false)},
    cameraZoom(){return globalThis.__MANRU_CAMERA_STATE12__?.scale()||1}
  };
  function drawMartialOverlay(){
    if(!state)return;drawMartialVisual(performance.now());
    const now=performance.now(),cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),z=cam.zoom||1,cx=cam.x+(VIS.playerX*TILE+TILE/2)*z,cy=cam.y+(VIS.playerY*TILE+TILE/2)*z;
    X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.lineCap='round';
    if(state.status.stealth>0){
      const t=now/240;X.globalCompositeOperation='screen';
      for(let i=0;i<3;i++){const a=t+i*2.094,rr=14+3*Math.sin(t*1.4+i),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;X.fillStyle=`rgba(150,211,222,${.10+.04*Math.sin(t+i)})`;X.beginPath();X.arc(x,y,2.2+i*.35,0,Math.PI*2);X.fill()}
      X.strokeStyle=`rgba(167,221,230,${.20+.08*Math.sin(t*1.7)})`;X.lineWidth=1.2;X.beginPath();X.arc(cx,cy,13+2*Math.sin(t),0,Math.PI*2);X.stroke();X.globalCompositeOperation='source-over';
    }
    if(state.player.strongReady>0){
      const p=.5+.5*Math.sin(now/115),rr=15+2*p;X.globalCompositeOperation='screen';X.strokeStyle=`rgba(244,170,68,${.38+.24*p})`;X.lineWidth=2;X.beginPath();X.arc(cx,cy,rr,-.9,2.9);X.stroke();for(let i=0;i<4;i++){const a=now/330+i*Math.PI/2;X.fillStyle=`rgba(255,202,105,${.38+.25*p})`;X.fillRect(cx+Math.cos(a)*18-1,cy+Math.sin(a)*18-1,2,2)}X.globalCompositeOperation='source-over';
    }
    const aimPower=state.player.classState?.aimPower||0,broken=FX965.pulse?.type==='aimBreak'&&now<FX965.pulse.until;
    if(aimPower>0||broken){
      const maximum=aimMaximum(),fraction=aimPower>0?(aimPower-4)/(maximum-4):0;
      const colors=[[155,155,155],[250,218,66],[255,134,30],[255,78,55]],scaled=Math.min(3,Math.max(0,fraction*3)),index=Math.min(2,Math.floor(scaled)),mix=scaled-index;
      const color=colors[index].map((v,i)=>Math.round(v+(colors[index+1][i]-v)*mix));
      const age=broken?now-FX965.pulse.start:0,scatter=broken?Math.max(0,(age-160)/520):0,label=aimPower>0?'×'+(aimPower/4).toFixed(2).replace(/0$/,''):'×1.0';
      const pixel=1.5*z,gap=.5*z;
      let width=-gap;
      for(const ch of label)width+=(ch==='.'?3:ch==='1'?3:5)*pixel+gap;
      let cursor=-width/2;
      X.globalAlpha=1-scatter;X.shadowBlur=0;
      X.fillStyle=`rgb(${color.join(',')})`;
      for(let i=0;i<label.length;i++){
        const ch=label[i],glyph=AIM_GLYPHS[ch],left=ch==='.'?2:ch==='1'?1:0,columns=ch==='.'?3:ch==='1'?3:5,dx=i-(label.length-1)/2;
        const gx=Math.round(cx+cursor-left*pixel+(ch==='.'?pixel:0)+dx*scatter*18*z),gy=Math.round(cy+(-37+Math.sin(i*2)*scatter*13-scatter*8)*z);
        for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(glyph[row]&(1<<(4-col))){
          X.fillRect(gx+col*pixel,gy+row*pixel,ch==='.'?2*z:pixel,ch==='.'?2*z:pixel);
        }
        cursor+=columns*pixel+gap;
      }
      if(scatter>0)for(let i=0;i<7;i++)X.fillRect(Math.round(cx+(i-3)*scatter*13*z),Math.round(cy+(-30+(i%2?1:-1)*scatter*(8+i*2))*z),pixel,pixel);
      X.globalAlpha=1;X.shadowBlur=0;
    }
    const f=FX965.pulse;if(f&&now<f.until&&f.type!=='aimBreak'){const q=Math.max(0,Math.min(1,(now-f.start)/(f.until-f.start))),rr=9+q*(f.type==='roar'?((martialRoarRange(state.player.martial.roar)+.5)*TILE*z-9):30),alpha=(1-q)*.72,rgb=f.type==='ghost'?'157,213,224':f.type==='ghostBreak'?'220,235,238':f.type==='roar'?'226,172,83':'239,170,72';X.strokeStyle=`rgba(${rgb},${alpha})`;X.lineWidth=f.type==='roar'?3:2;X.beginPath();X.arc(cx,cy,rr,0,Math.PI*2);X.stroke();if(f.type==='roar'){X.strokeStyle=`rgba(255,221,154,${alpha*.58})`;X.lineWidth=1;X.beginPath();X.arc(cx,cy,Math.max(5,rr-9),0,Math.PI*2);X.stroke()}}else if(f&&now>=f.until)FX965.pulse=null;
    X.restore();
  }
  function paintInterior(r,tile,chance=1){
    for(let y=r.y+1;y<r.y+r.h-1;y++) for(let x=r.x+1;x<r.x+r.w-1;x++) if(hash2(x,y,97201+state.floor*13)<=chance) safeSet972(x,y,tile);
  }
  function paintBorder(r,tile){
    for(let x=r.x+1;x<r.x+r.w-1;x++){
      safeSet972(x,r.y+1,tile); safeSet972(x,r.y+r.h-2,tile);
    }
    for(let y=r.y+1;y<r.y+r.h-1;y++){
      safeSet972(r.x+1,y,tile); safeSet972(r.x+r.w-2,y,tile);
    }
  }
  function paintCross(r,tile,width=1){
    for(let d=-width; d<=width; d++){
      for(let x=r.x+1;x<r.x+r.w-1;x++) safeSet972(x,r.cy+d,tile);
      for(let y=r.y+1;y<r.y+r.h-1;y++) safeSet972(r.cx+d,y,tile);
    }
  }
  /* ---------- Phase 12 canonical camera, projection and world hit-test owners ---------- */
  const savedMode='follow';
  const ZOOM_LIMITS={mobile:{min:.50,max:1.80},desktop:{min:.40,max:2.20}};
  const savedZoom=(()=>{try{const active=localStorage.getItem('manru984_active_run');if(!active)return 1;const raw=localStorage.getItem('manruZoom984');if(raw==null||raw==='')return 1;const z=+raw;if(!Number.isFinite(z))return 1;const lim=isMobileViewport()?ZOOM_LIMITS.mobile:ZOOM_LIMITS.desktop;return Math.max(lim.min,Math.min(lim.max,z))}catch(_){return 1}})();
  const cameraData={mode:savedMode,zoom:savedZoom,cx:0,cy:0,tx:0,ty:0,ready:false,last:performance.now(),lastUpdate:0,lastPlayerX:null,lastPlayerY:null};
  const cameraMotion={active:false,vx:0,vy:0,lastInput:0,lastFrame:0,started:0,samples:[]};
  let zoomPersistTimer=0,lastRenderedCamera=null;
  const CameraState=Object.freeze({
    limits(){return state?.debugBattle57?{min:.025,max:3.5}:isMobileViewport()?ZOOM_LIMITS.mobile:ZOOM_LIMITS.desktop},
    scale(){return(isMobileViewport()?1.24:1.44)*cameraData.zoom},
    snapshot(){return Object.freeze({mode:cameraData.mode,cx:cameraData.cx,cy:cameraData.cy,tx:cameraData.tx,ty:cameraData.ty,zoom:CameraState.scale()})},
    clampCenter(x,y,z=CameraState.scale()){const ww=COLS*TILE,wh=ROWS*TILE,vw=VIEW.w/Math.max(.001,z),vh=VIEW.h/Math.max(.001,z),pad=8;let minX=vw*.50-pad,maxX=ww-vw*.50+pad,minY=vh*.48-pad,maxY=wh-vh*.52+pad;if(minX>maxX)minX=maxX=ww*.5;if(minY>maxY)minY=maxY=wh*.5;return{x:clamp(x,minX,maxX),y:clamp(y,minY,maxY)}},
    centerOnPlayer(){CameraState.cancelInertia();if(!state)return CameraState.snapshot();const p=cameraFollowPosition(),x=p.worldX,y=p.worldY;cameraData.cx=cameraData.tx=x;cameraData.cy=cameraData.ty=y;cameraData.ready=true;cameraData.last=performance.now();return CameraState.snapshot()},
    setMode(mode){cameraRenderPending=true;if(mode!=='follow'&&mode!=='free')mode='follow';if(mode!=='free'||cameraData.mode!==mode)CameraState.cancelInertia();cameraData.mode=mode;if(!cameraData.ready&&state)CameraState.centerOnPlayer();document.body.classList.toggle('camera-inspect81',mode==='free');return CameraState.snapshot()},
    update(now=performance.now()){
      const z=CameraState.scale();if(document.hidden||!gameplayInputAllowed57())CameraState.cancelInertia();if(!cameraData.ready&&state)CameraState.centerOnPlayer();
      if(state){const px=state.player?.x,py=state.player?.y;if(cameraData.lastPlayerX==null||cameraData.lastPlayerY==null){cameraData.lastPlayerX=px;cameraData.lastPlayerY=py}else if(px!==cameraData.lastPlayerX||py!==cameraData.lastPlayerY){CameraState.cancelInertia();cameraData.mode='follow';document.body.classList.remove('camera-inspect81');const rt=window.__MANRU_RUNTIME81__;if(rt?.state)rt.state.cameraInspecting=false;cameraData.lastPlayerX=px;cameraData.lastPlayerY=py}}
      if(state&&cameraData.mode==='free'&&cameraMotion.active){
        const m=cameraMotion,dt=clamp(now-m.lastFrame,0,48),decay=Math.exp(-dt/105),gain=105*(1-decay),wantedX=cameraData.tx+m.vx*gain,wantedY=cameraData.ty+m.vy*gain,c=CameraState.clampCenter(wantedX,wantedY,z);
        cameraData.tx=cameraData.cx=c.x;cameraData.ty=cameraData.cy=c.y;m.vx=Math.abs(c.x-wantedX)>.001?0:m.vx*decay;m.vy=Math.abs(c.y-wantedY)>.001?0:m.vy*decay;m.lastFrame=now;
        if(Math.hypot(m.vx,m.vy)*z<.012||now-m.started>500)CameraState.cancelInertia();
      }
      if(state&&cameraData.mode==='follow'){const p=cameraFollowPosition(),c=CameraState.clampCenter(p.worldX,p.worldY,z);cameraData.tx=c.x;cameraData.ty=c.y;cameraData.cx=c.x;cameraData.cy=c.y}else if(state){const c=CameraState.clampCenter(cameraData.tx,cameraData.ty,z);cameraData.tx=c.x;cameraData.ty=c.y;if(cameraData.mode==='free'){cameraData.cx=cameraData.tx;cameraData.cy=cameraData.ty}}
      cameraData.last=now;cameraData.lastUpdate=now;return CameraState.snapshot()
    },
    setZoom(value,announce=false,anchor=null){CameraState.cancelInertia();const lim=CameraState.limits(),priorZoom=CameraState.scale(),sp=CameraProjection.clientToViewport(anchor?.clientX,anchor?.clientY),anchorCamera=cameraData.ready&&sp?{cx:cameraData.cx,cy:cameraData.cy}:null;cameraData.zoom=Math.max(lim.min,Math.min(lim.max,Math.round(value*1000)/1000));const nextZ=CameraState.scale();if(anchorCamera&&cameraData.mode==='free'&&Math.abs(nextZ-priorZoom)>.0001){const wx=anchorCamera.cx+(sp.x-VIEW.w*.5)/Math.max(.001,priorZoom),wy=anchorCamera.cy+(sp.y-VIEW.h*.48)/Math.max(.001,priorZoom),wantedX=wx-(sp.x-VIEW.w*.5)/Math.max(.001,nextZ),wantedY=wy-(sp.y-VIEW.h*.48)/Math.max(.001,nextZ),c=CameraState.clampCenter(wantedX,wantedY,nextZ);cameraData.cx=cameraData.tx=c.x;cameraData.cy=cameraData.ty=c.y}clearTimeout(zoomPersistTimer);if(!state?.debugBattle57)zoomPersistTimer=setTimeout(()=>{try{localStorage.setItem('manruZoom984',String(cameraData.zoom))}catch(error){console.warn('[manru] zoom setting not stored',error)}},220);const el=document.getElementById('zoomVal');if(el)el.textContent=Math.round(cameraData.zoom*100)+'%';window.__manruZoomSuppressUntil=performance.now()+120;if(announce)toast(`줌 ${Math.round(cameraData.zoom*100)}%`);cameraRenderPending=true;return cameraData.zoom},
    center(){CameraState.setMode('follow');CameraState.centerOnPlayer();cameraRenderPending=true;return CameraState.snapshot()},
    panWorld(dx,dy){cameraMotion.active=false;if(!cameraData.ready&&state)CameraState.centerOnPlayer();CameraState.setMode('free');const c=CameraState.clampCenter(cameraData.tx+dx,cameraData.ty+dy);cameraData.cx=cameraData.tx=c.x;cameraData.cy=cameraData.ty=c.y;cameraData.last=performance.now();cameraData.lastUpdate=cameraData.last;cameraRenderPending=true;return CameraState.snapshot()},
    beginInspect(){CameraState.cancelInertia();cameraMotion.lastInput=performance.now()-16;const rt=window.__MANRU_RUNTIME81__;if(rt?.state)rt.state.cameraInspecting=true;return CameraState.setMode('free')},
    panScreen(dx,dy){
      if(!Number.isFinite(dx)||!Number.isFinite(dy))return CameraState.snapshot();
      const now=performance.now(),m=cameraMotion,dt=clamp(now-(m.lastInput||now-16),8,100),z=Math.max(.001,CameraState.scale());
      if(now-m.lastInput>120)m.samples=[];
      const result=CameraState.panWorld(-dx/z,-dy/z);m.samples.push({t:now,dx,dy,dt});m.samples=m.samples.filter(q=>now-q.t<=90).slice(-8);m.lastInput=now;return result;
    },
    endPan(){
      const m=cameraMotion,now=performance.now(),age=now-m.lastInput;
      if(cameraData.mode!=='free'||age>90||!m.samples.length||!gameplayInputAllowed57()){CameraState.cancelInertia();return CameraState.snapshot()}
      const dt=Math.max(16,m.samples.reduce((n,q)=>n+q.dt,0)),factor=.72*Math.exp(-age/55),sx=m.samples.reduce((n,q)=>n+q.dx,0)/dt*factor,sy=m.samples.reduce((n,q)=>n+q.dy,0)/dt*factor,speed=Math.hypot(sx,sy),cap=Math.min(1,1.1/Math.max(speed,.001)),z=CameraState.scale();
      m.samples=[];m.vx=-sx*cap/z;m.vy=-sy*cap/z;m.active=speed>.035;m.lastFrame=m.started=now;cameraRenderPending=true;return CameraState.snapshot();
    },
    cancelInertia(){const m=cameraMotion,was=m.active;m.active=false;m.vx=m.vy=0;m.samples=[];m.lastInput=0;return was},
    isCoasting(){return cameraMotion.active},
    resume(snap=false){const rt=window.__MANRU_RUNTIME81__;if(rt?.state)rt.state.cameraInspecting=false;document.body.classList.remove('camera-inspect81');return snap?CameraState.center():CameraState.setMode('follow')},
    capture(){return{...cameraData}},
    restore(saved){CameraState.cancelInertia();clearTimeout(zoomPersistTimer);Object.assign(cameraData,saved);lastRenderedCamera=null;document.body.classList.toggle('camera-inspect81',cameraData.mode==='free');cameraRenderPending=true},
    desiredZoom(){return cameraData.zoom},
    lastPlayer(){return[cameraData.lastPlayerX,cameraData.lastPlayerY]},
    notePlayer(x,y){cameraData.lastPlayerX=x;cameraData.lastPlayerY=y}
  });
  const CameraProjection=Object.freeze({
    project(camera=CameraState.snapshot()){const x=VIEW.w*.5-camera.cx*camera.zoom,y=VIEW.h*.48-camera.cy*camera.zoom;return Object.freeze({x:Math.round(x*2)/2,y:Math.round(y*2)/2,zoom:camera.zoom,cx:camera.cx,cy:camera.cy,mode:camera.mode})},
    beginFrame(now=performance.now()){CameraState.update(now);lastRenderedCamera=CameraProjection.project();VIS.camX=lastRenderedCamera.x;VIS.camY=lastRenderedCamera.y;VIS.camInit=true;return lastRenderedCamera},
    current(){return lastRenderedCamera||CameraProjection.project()},
    lastRendered(){return lastRenderedCamera},
    worldToViewport(x,y,camera=CameraProjection.current()){return{x:camera.x+x*camera.zoom,y:camera.y+y*camera.zoom}},
    viewportToWorld(x,y,camera=CameraProjection.current()){return{x:(x-camera.x)/camera.zoom,y:(y-camera.y)/camera.zoom}},
    tileTopLeft(x,y,camera=CameraProjection.current()){const p=CameraProjection.worldToViewport(x*TILE,y*TILE,camera);return{x:p.x,y:p.y,s:TILE*camera.zoom}},
    tileCenter(x,y,camera=CameraProjection.current()){const p=CameraProjection.worldToViewport((x+.5)*TILE,(y+.5)*TILE,camera);return{x:p.x,y:p.y,s:TILE*camera.zoom}},
    clientToViewport(clientX,clientY){if(!Number.isFinite(clientX)||!Number.isFinite(clientY)||!C)return null;const r=C.getBoundingClientRect();if(!r.width||!r.height)return null;return{x:(clientX-r.left)*VIEW.w/r.width,y:(clientY-r.top)*VIEW.h/r.height,rect:r}},
    viewportToClient(x,y){if(!C)return null;const r=C.getBoundingClientRect();if(!r.width||!r.height)return null;return{x:r.left+x*r.width/VIEW.w,y:r.top+y*r.height/VIEW.h,rect:r}},
    worldToClient(x,y,camera=CameraProjection.current()){const p=CameraProjection.worldToViewport(x,y,camera);return CameraProjection.viewportToClient(p.x,p.y)},
    tileCenterToClient(x,y,camera=CameraProjection.current()){const p=CameraProjection.tileCenter(x,y,camera);return CameraProjection.viewportToClient(p.x,p.y)},
    clientToWorld(clientX,clientY,camera=CameraProjection.current()){const p=CameraProjection.clientToViewport(clientX,clientY);return p?{...CameraProjection.viewportToWorld(p.x,p.y,camera),rect:p.rect}:null}
  });
  const camApi={camera:CameraState.snapshot,setMode:CameraState.setMode,center:CameraState.center,pan:CameraState.panWorld};
  function bindZoom(){
    const bind=(id,dir)=>{const old=document.getElementById(id);if(!old)return;const b=old.cloneNode(true);old.replaceWith(b);b.onclick=e=>{e.preventDefault();e.stopPropagation();ClientEnvironment.emit({type:'CAMERA_ZOOM',delta:dir,source:'zoom-hud'})}};
    bind('zoomOutBtn',-1);bind('zoomInBtn',1);
    const val=document.getElementById('zoomVal');if(val){val.textContent=Math.round(cameraData.zoom*100)+'%';val.onclick=e=>{e.preventDefault();e.stopPropagation();ClientEnvironment.emit({type:'CAMERA_ZOOM',reset:true,source:'zoom-hud'})}}
    const old=document.getElementById('cameraCenterBtn');if(old){const b=old.cloneNode(true);old.replaceWith(b);b.onclick=e=>{e.preventDefault();e.stopPropagation();ClientEnvironment.emit({type:'CAMERA_CENTER',source:'zoom-hud'})};b.title='플레이어에게 시점 복귀'}
  }
  function paintClassLighting(now=performance.now(),force=false){
    const st=classLight1001;if(!st?.stage?.isConnected)return;
    const stage=st.stage,w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
    const reduced=classMotion1001.matches,resized=st.w!==w||st.h!==h;
    if(!force&&!resized&&st.reduced===reduced&&(reduced||now-st.last<33))return st.snapshot;
    st.last=now;st.reduced=reduced;st.w=w;st.h=h;
    if(resized)stage.style.setProperty('--pick-wood',`url("${classWoodPanel(w,h)}")`);
    const field=stage.querySelector('.pickLightField1001'),actor=stage.querySelector('.pickActorLight1001'),q=field.getContext('2d'),a=actor.getContext('2d');
    for(const c of [field,actor]){if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;}
    q.clearRect(0,0,w,h);a.clearRect(0,0,w,h);q.imageSmoothingEnabled=false;a.imageSmoothingEnabled=false;
    const box=stage.getBoundingClientRect(),sprite=stage.querySelector('.pickStageSprite1001').getBoundingClientRect(),lamps=[...stage.querySelectorAll('.pickLantern1001')];
    const lights=lamps.map((el,i)=>{const light=menuLanternLight1001(now,i?2.65:0,Math.min(w*.69,Math.max(165,h*.78)),reduced);el.style.transform=`translateY(${light.bob}px)`;const r=el.getBoundingClientRect();return {...light,x:r.x-box.x+r.width/2,y:r.y-box.y+r.height/2};});
    for(const light of lights)drawMenuLight(q,light.x,light.y,light);
    if(!st.mask)return;
    const frame=st.source.actorFrame105||{x:0,y:0,w:32,h:36},resolution=st.source.actorResolution105||1,sx=sprite.width/(frame.w*resolution),sy=sprite.height/(frame.h*resolution),left=sprite.x-box.x-frame.x*resolution*sx,top=sprite.y-box.y-frame.y*resolution*sy,footX=sprite.x-box.x+sprite.width/2,footY=top+st.foot*sy,bodyWidth=(st.maxX-st.minX)*sx;
    // Sprite alpha silhouette projected on the floor away from each lamp. Feet stay fixed.
    const shadows=[];
    for(let i=0;i<lights.length;i++){
      const light=lights[i],cross=lights[1-i],dy=Math.max(35,footY-light.y),distance=Math.hypot(footX-light.x,dy),reach=Math.max(0,1-distance/(light.radius*1.75)),vertical=sy*(.20+.10*reach),shear=(footX-light.x)/dy*vertical,opacity=(.12+.28*reach)*light.energy/(1+cross.energy*.65),softness=1.5+light.radius*.012;
      q.save();q.globalAlpha=opacity;q.filter=`blur(${softness}px)`;q.setTransform(sx,0,shear,-vertical,left-st.foot*shear,footY+st.foot*vertical);q.drawImage(st.mask,0,0);q.restore();shadows.push({dx:(footX-light.x)/dy*st.foot*vertical,length:st.foot*vertical,opacity,softness});
    }
    q.save();q.translate(footX,footY);q.scale(1,.21);const contact=q.createRadialGradient(0,0,0,0,0,Math.max(8,bodyWidth*.58));contact.addColorStop(0,'#080402b8');contact.addColorStop(1,'#08040200');q.fillStyle=contact;q.fillRect(-bodyWidth,-bodyWidth,bodyWidth*2,bodyWidth*2);q.restore();
    // Reflected warm edge light only uses the original opaque sprite pixels.
    const tint=st.tint,t=tint.getContext('2d');t.globalCompositeOperation='source-over';t.clearRect(0,0,tint.width,tint.height);t.drawImage(st.rim,0,0);t.globalCompositeOperation='source-in';const grad=t.createLinearGradient(0,0,tint.width,0);
    const strengths=lights.map(l=>Math.max(0,1-Math.hypot(footX-l.x,footY-sprite.height*.5-l.y)/(l.radius*1.5))*l.energy*.30);
    grad.addColorStop(0,`rgba(255,191,91,${strengths[0]})`);grad.addColorStop(.48,'rgba(255,191,91,0)');grad.addColorStop(.52,'rgba(255,191,91,0)');grad.addColorStop(1,`rgba(255,191,91,${strengths[1]})`);t.fillStyle=grad;t.fillRect(0,0,tint.width,tint.height);a.drawImage(tint,left,top,st.source.width*sx,st.source.height*sy);
    stage.querySelector('.pickStageSeal1001').style.transform=`translateY(${lights[1].bob}px) rotate(3deg)`;stage.querySelector('.pickStageGlyph1001').style.transform=`translateY(${lights[0].bob}px)`;
    st.snapshot={w,h,foot:{x:footX,y:footY},lights:lights.map(({x,y,radius,energy})=>({x,y,radius,energy})),shadows,strengths};return st.snapshot;
  }
    /* ---------- compact 32x36 player art ----------
       Visual target: Nevanda-style 32px NetHack readability, not a copy of its art.
       Exactly four pixels may overhang upward; width remains one tile. */
    const PLAYER_SPRITE_W=32,PLAYER_SPRITE_H=36,PLAYER=new Map();
    const PLAYER_RARITY_HI={common:'#b7aa91',uncommon:'#9fc494',rare:'#88accb',epic:'#b896ce',legendary:'#d9b96b',sealed:'#e2bf72',relic:'#d4c28b',artifact:'#ef8b45'};
    function drawPlayerCloak(q,p){
      const c=p.cloak;if(!c)return;const col=cloakTone1004(c),hi=PLAYER_RARITY_HI[c.rarity]||'#9c8065';
      q.fillStyle='#17110f';q.beginPath();q.moveTo(8,15);q.lineTo(24,15);q.lineTo(27,32);q.lineTo(21,34);q.lineTo(16,31);q.lineTo(11,34);q.lineTo(5,32);q.closePath();q.fill();
      q.fillStyle=col;q.beginPath();q.moveTo(9,16);q.lineTo(23,16);q.lineTo(25,31);q.lineTo(20,32);q.lineTo(16,29);q.lineTo(12,32);q.lineTo(7,31);q.closePath();q.fill();q.fillStyle=hi;q.globalAlpha=.22;q.fillRect(9,17,2,12);q.globalAlpha=1;
    }
    function drawArmorDetail(q,p){
      const a=p.armor;if(!a||a.name==='경량복')return;const hi=PLAYER_RARITY_HI[a.rarity]||'#b3a88d',tier=Math.max(1,a.tier||1);
      q.fillStyle=hi;q.globalAlpha=.55;q.fillRect(11,18,10,1);if(tier>=2){q.fillRect(10,22,12,1)}if(tier>=3){q.fillRect(12,26,8,1)}if(tier>=4){q.fillRect(8,17,2,5);q.fillRect(22,17,2,5)}q.globalAlpha=1;
    }
    function drawPlayerRelic(q,p){
      const i=p.relic;if(!i)return;const col=PLAYER_RARITY_HI[i.rarity]||choose1004(i,['#d6b45e','#9dc5b6','#b89ac9']);q.fillStyle='#2a1c15';q.fillRect(14,24,4,5);q.fillStyle=col;q.fillRect(15,25,2,3);px1004(q,16,26,'#fff0b3');
    }
    function drawPlayerTrinket(q,p){
      const i=p.trinket;if(!i)return;const col=PLAYER_RARITY_HI[i.rarity]||choose1004(i,['#d29962','#88b4aa','#a98abd']);q.fillStyle=col;q.fillRect(24,24,2,2);px1004(q,25,25,'#f2dfb5');
    }
    function playerSprite(id='wanderer',p=null,dir='down',attack=false){
      const gear=p||{weapon:null,armor:{name:'경량복',tier:1,rarity:'common'},cloak:null,relic:null,trinket:null};
      const powered=bodyPowerActive(gear),key=`${id}|${dir}|${attack?1:0}|${gearKey1004(gear)}|${powered?1:0}`;const cached=PLAYER.get(key);if(cached&&!cached.getContext('2d').isContextLost?.())return cached;
      const[c,q]=actorSpriteCanvas(gear);q.clearRect(0,0,PLAYER_SPRITE_W,PLAYER_SPRITE_H);drawPlayerCloak(q,gear);
 if(id==='archer'){
      // Layered green hunting coat, ivory lapel, brass fittings and feathered quiver.
      q.fillStyle='#30231c';q.beginPath();q.moveTo(6,10);q.lineTo(10,9);q.lineTo(13,27);q.lineTo(8,29);q.closePath();q.fill();
      q.fillStyle='#835b38';q.beginPath();q.moveTo(7,12);q.lineTo(10,12);q.lineTo(12,26);q.lineTo(9,27);q.closePath();q.fill();
      q.fillStyle='#c7b38a';q.fillRect(5,4,1,10);q.fillRect(8,2,1,11);
      q.fillStyle='#ddd3b6';q.beginPath();q.moveTo(3,3);q.lineTo(6,4);q.lineTo(5,7);q.lineTo(3,5);q.closePath();q.fill();
      q.fillStyle='#b4c5b8';q.beginPath();q.moveTo(7,2);q.lineTo(10,1);q.lineTo(9,5);q.lineTo(7,4);q.closePath();q.fill();
      q.fillStyle='#202a28';q.beginPath();q.moveTo(10,8);q.lineTo(11,5);q.lineTo(15,3);q.lineTo(20,4);q.lineTo(22,7);q.lineTo(21,10);q.closePath();q.fill();
      q.fillStyle='#42594b';q.beginPath();q.moveTo(12,6);q.lineTo(16,4);q.lineTo(20,5);q.lineTo(21,7);q.lineTo(13,8);q.closePath();q.fill();
      q.fillStyle='#839478';q.fillRect(13,5,5,1);
      q.fillStyle='#463327';q.fillRect(11,9,10,4);q.fillRect(12,13,8,2);
      q.fillStyle='#cda67d';q.fillRect(12,9,8,5);q.fillRect(13,14,6,1);
      q.fillStyle='#e8c69a';q.fillRect(13,9,6,2);
      q.fillStyle='#292821';q.fillRect(13,12,1,1);q.fillRect(18,12,1,1);
      q.fillStyle='#a77152';q.fillRect(16,12,1,2);
      q.fillStyle='#76503c';q.fillRect(14,14,4,1);
      q.fillStyle='#a88b55';q.fillRect(10,8,12,1);
      q.fillStyle='#ead09a';q.fillRect(12,8,4,1);
      q.fillStyle='#252b25';q.beginPath();q.moveTo(10,16);q.lineTo(20,15);q.lineTo(23,18);q.lineTo(24,26);q.lineTo(22,29);q.lineTo(10,30);q.lineTo(8,21);q.closePath();q.fill();
      q.fillStyle='#557957';q.beginPath();q.moveTo(11,17);q.lineTo(19,16);q.lineTo(22,19);q.lineTo(21,28);q.lineTo(11,29);q.lineTo(9,21);q.closePath();q.fill();
      q.fillStyle='#91aa76';q.beginPath();q.moveTo(11,17);q.lineTo(15,17);q.lineTo(14,22);q.lineTo(12,28);q.lineTo(10,26);q.lineTo(10,20);q.closePath();q.fill();
      q.fillStyle='#375843';q.beginPath();q.moveTo(18,18);q.lineTo(21,19);q.lineTo(21,27);q.lineTo(17,29);q.lineTo(16,24);q.closePath();q.fill();
      q.fillStyle='#c7bc91';q.beginPath();q.moveTo(13,16);q.lineTo(16,18);q.lineTo(19,16);q.lineTo(20,17);q.lineTo(16,21);q.closePath();q.fill();
      q.fillStyle='#47664a';q.beginPath();q.moveTo(8,18);q.lineTo(11,18);q.lineTo(11,23);q.lineTo(8,27);q.lineTo(5,25);q.lineTo(6,21);q.closePath();q.fill();
      q.fillStyle='#839a68';q.beginPath();q.moveTo(8,19);q.lineTo(10,19);q.lineTo(9,24);q.lineTo(7,24);q.lineTo(6,22);q.closePath();q.fill();
      q.fillStyle='#415d43';q.beginPath();q.moveTo(21,18);q.lineTo(24,20);q.lineTo(25,25);q.lineTo(22,27);q.lineTo(20,23);q.closePath();q.fill();
      q.fillStyle='#d4ad80';q.fillRect(6,26,3,2);q.fillRect(23,26,3,2);
      q.fillStyle='#533d29';q.beginPath();q.moveTo(19,16);q.lineTo(21,17);q.lineTo(13,27);q.lineTo(11,26);q.closePath();q.fill();
      q.fillStyle='#bd9358';q.beginPath();q.moveTo(19,17);q.lineTo(20,18);q.lineTo(13,26);q.lineTo(12,25);q.closePath();q.fill();
      q.fillStyle='#483325';q.fillRect(10,25,13,2);
      q.fillStyle='#a77a47';q.fillRect(11,25,10,1);
      q.fillStyle='#e4c184';q.fillRect(15,25,3,2);
      q.fillStyle='#715037';q.fillRect(6,23,4,3);q.fillRect(22,23,3,3);
      q.fillStyle='#c5a16e';q.fillRect(7,23,3,1);q.fillRect(22,23,3,1);
      q.fillStyle='#6b855a';q.beginPath();q.moveTo(11,27);q.lineTo(16,28);q.lineTo(14,32);q.lineTo(9,31);q.closePath();q.fill();
      q.fillStyle='#39583f';q.beginPath();q.moveTo(18,27);q.lineTo(22,27);q.lineTo(24,31);q.lineTo(19,32);q.closePath();q.fill();
      q.fillStyle='#29372e';q.fillRect(11,31,4,4);q.fillRect(19,31,4,4);
      q.fillStyle='#ac9c7b';q.fillRect(11,32,4,1);q.fillRect(19,32,4,1);
      q.fillStyle='#151b17';q.fillRect(10,34,6,2);q.fillRect(18,34,7,2);
 }else if(id==='infiltrator'){
      // Folded violet-grey travel cloth, wine-red scarf and a small exposed eye line.
      q.fillStyle='#201f2a';q.beginPath();q.moveTo(10,8);q.lineTo(12,4);q.lineTo(16,2);q.lineTo(20,4);q.lineTo(22,8);q.lineTo(21,13);q.lineTo(11,13);q.closePath();q.fill();
      q.fillStyle='#494856';q.beginPath();q.moveTo(12,7);q.lineTo(13,5);q.lineTo(17,4);q.lineTo(20,6);q.lineTo(20,9);q.lineTo(12,10);q.closePath();q.fill();
      q.fillStyle='#797281';q.beginPath();q.moveTo(13,5);q.lineTo(16,3);q.lineTo(19,5);q.lineTo(16,5);q.lineTo(13,8);q.closePath();q.fill();
      q.fillStyle='#765b52';q.fillRect(11,9,10,5);
      q.fillStyle='#ceb19b';q.fillRect(12,9,8,4);
      q.fillStyle='#e4c6af';q.fillRect(13,9,6,1);
      q.fillStyle='#26222a';q.fillRect(13,11,1,1);q.fillRect(18,11,1,1);
      q.fillStyle='#555165';q.beginPath();q.moveTo(11,12);q.lineTo(16,13);q.lineTo(21,12);q.lineTo(21,16);q.lineTo(15,17);q.lineTo(11,15);q.closePath();q.fill();
      q.fillStyle='#8f8493';q.beginPath();q.moveTo(12,12);q.lineTo(17,14);q.lineTo(20,13);q.lineTo(20,14);q.lineTo(16,15);q.lineTo(12,14);q.closePath();q.fill();
      q.fillStyle='#262431';q.beginPath();q.moveTo(10,17);q.lineTo(20,16);q.lineTo(24,19);q.lineTo(23,28);q.lineTo(19,30);q.lineTo(15,28);q.lineTo(10,31);q.lineTo(8,24);q.closePath();q.fill();
      q.fillStyle='#66617c';q.beginPath();q.moveTo(11,18);q.lineTo(19,17);q.lineTo(22,20);q.lineTo(21,27);q.lineTo(17,29);q.lineTo(12,28);q.lineTo(10,25);q.closePath();q.fill();
      q.fillStyle='#a294a6';q.beginPath();q.moveTo(11,18);q.lineTo(15,18);q.lineTo(14,24);q.lineTo(11,27);q.lineTo(10,23);q.closePath();q.fill();
      q.fillStyle='#403e58';q.beginPath();q.moveTo(18,19);q.lineTo(22,20);q.lineTo(21,27);q.lineTo(18,29);q.lineTo(16,25);q.closePath();q.fill();
      q.fillStyle='#c1b39c';q.beginPath();q.moveTo(13,17);q.lineTo(16,19);q.lineTo(19,17);q.lineTo(18,20);q.lineTo(16,22);q.closePath();q.fill();
      q.fillStyle='#4b4b62';q.beginPath();q.moveTo(9,18);q.lineTo(11,19);q.lineTo(10,24);q.lineTo(8,28);q.lineTo(5,26);q.lineTo(6,21);q.closePath();q.fill();
      q.fillStyle='#7a758a';q.beginPath();q.moveTo(8,20);q.lineTo(10,20);q.lineTo(8,25);q.lineTo(6,25);q.closePath();q.fill();
      q.fillStyle='#3e3f53';q.beginPath();q.moveTo(21,18);q.lineTo(25,21);q.lineTo(25,26);q.lineTo(22,27);q.lineTo(20,22);q.closePath();q.fill();
      q.fillStyle='#c5a18a';q.fillRect(6,27,3,2);q.fillRect(24,26,2,2);
      q.fillStyle='#903d46';q.beginPath();q.moveTo(10,15);q.lineTo(15,17);q.lineTo(21,15);q.lineTo(23,16);q.lineTo(18,19);q.lineTo(12,18);q.closePath();q.fill();
      q.fillStyle='#c2736a';q.beginPath();q.moveTo(11,15);q.lineTo(16,17);q.lineTo(21,15);q.lineTo(20,17);q.lineTo(16,18);q.closePath();q.fill();
      q.fillStyle='#6e303d';q.beginPath();q.moveTo(21,16);q.lineTo(27,18);q.lineTo(25,23);q.lineTo(23,20);q.lineTo(20,18);q.closePath();q.fill();
      q.fillStyle='#362831';q.fillRect(10,25,13,2);
      q.fillStyle='#ad8470';q.fillRect(11,25,11,1);
      q.fillStyle='#d7b990';q.fillRect(16,25,2,2);
      q.fillStyle='#55516b';q.beginPath();q.moveTo(10,27);q.lineTo(15,27);q.lineTo(14,31);q.lineTo(9,32);q.closePath();q.fill();
      q.fillStyle='#35354b';q.beginPath();q.moveTo(18,27);q.lineTo(22,27);q.lineTo(24,31);q.lineTo(19,30);q.closePath();q.fill();
      q.fillStyle='#31323f';q.fillRect(10,31,4,4);q.fillRect(19,30,4,5);
      q.fillStyle='#8e8b90';q.fillRect(10,32,4,1);q.fillRect(19,31,4,1);
      q.fillStyle='#171820';q.fillRect(8,34,7,2);q.fillRect(18,34,7,2);
      q.fillStyle='#453936';q.fillRect(9,22,3,4);
      q.fillStyle='#b2aa92';q.fillRect(9,22,3,1);
      q.fillStyle='#80745f';q.fillRect(10,24,2,1); }else if(id==='summoner')baseSummoner1004(q,gear,dir);else if(playerClassRules58({classId:id}).upgradeTalismanMode==='bodyBoost')baseStrongman1004(q,gear,powered,dir,attack);else if(id==='escort')baseEscort1004(q,gear);else if(id==='swordsman')baseSwordsman1004(q,gear);else baseWanderer1004(q,gear);
      drawArmorDetail(q,gear);drawPlayerRelic(q,gear);drawPlayerTrinket(q,gear);drawHeldWeapon(q,gear,dir,attack);
      PLAYER.set(key,c);return c;
    }
    function playerCanvasForClass(id='wanderer',gear=null,dir='down',attack=false){return playerSprite(id,gear||classGear(CLASSES.find(c=>c.id===id)),dir,!!attack)}
function clearPlayerArt(){PLAYER.clear();return true}
/* warning overlay and equipped ward glow */
function drawHazardOverlay(){if(!state)return;const h=hz(),cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),now=performance.now();X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);const pulse=.5+.5*Math.sin(now/120);for(const a of Object.values(h.armed)){if(!state.seen.has(k(a.x,a.y)))continue;const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileTopLeft(a.x,a.y,cam),x=q.x,y=q.y,s=q.s;X.strokeStyle=a.kind==='paper'?`rgba(255,222,140,${.55+.35*pulse})`:`rgba(218,153,240,${.55+.35*pulse})`;X.lineWidth=Math.max(1.5,2*cam.zoom);X.strokeRect(x+3,y+3,s-6,s-6);X.beginPath();X.moveTo(x+s*.25,y+s*.22);X.lineTo(x+s*.52,y+s*.53);X.lineTo(x+s*.40,y+s*.80);X.moveTo(x+s*.52,y+s*.53);X.lineTo(x+s*.78,y+s*.28);X.stroke()}const d=remain('drown'),v=remain('void');if(d||v){const vp=visualPlayerPosition(),point=globalThis.__MANRU_CAMERA_PROJECTION12__.worldToViewport(vp.worldX,vp.worldY,cam),q={x:point.x,y:point.y,s:TILE*cam.zoom};X.strokeStyle=d?`rgba(116,225,235,${.44+.20*pulse})`:`rgba(191,137,241,${.44+.20*pulse})`;X.lineWidth=2;X.beginPath();X.arc(q.x,q.y,q.s*.48,0,Math.PI*2);X.stroke()}X.restore();}
/* r19: one canonical map renderer. World draw + explicit ordered overlays; no nested drawMap wrappers. */
function drawMap(force=false){
  const frameNow=performance.now();PresentationState.advance(frameNow);globalThis.__MANRU_CAMERA_PROJECTION12__?.beginFrame(frameNow);
  const base=globalThis.__MANRU_DRAW_BASE58__,hooks=globalThis.__MANRU_DRAW_HOOKS_R19__;
  if(typeof base!=='function')return false;
  const painted=base(force);if(painted===false)return false;cameraRenderPending=false;
  for(const phase of ['world','post'])for(const h of hooks?.[phase]||[]){
    X.save();try{h.draw(force)}catch(e){console.warn(`[draw:${h.id}]`,e);globalThis.__MANRU_RESUME_R6__?.schedule?.('overlay-error',0)}finally{X.restore()}
  }
  drawPalaceHud();return true;
}
function drawKeyTile(tile,px,py,x,y,now){
  if(tile!==TT.KEY_TILE||!state?.keyPlan96)return false;
  const km=keyPos1006(x,y),m=keyMeta1006(km?.keyId),pulse=.55+.25*Math.sin((now||performance.now())/180+x*.7+y*.3);
  X.save();X.imageSmoothingEnabled=false;
  X.fillStyle=`rgba(6,9,9,${.46+.12*pulse})`;X.fillRect(px+3,py+8,27,17);
  X.strokeStyle=m.dark;X.lineWidth=2;X.strokeRect(px+4.5,py+8.5,25,17);
  X.fillStyle=`rgba(255,244,204,${.06+.07*pulse})`;X.fillRect(px+6,py+10,21,13);
  if((m.shape||km?.keyId)==='jade'){
    X.fillStyle=m.dark;X.beginPath();X.moveTo(px+7,py+16);X.lineTo(px+11,py+11);X.lineTo(px+16,py+16);X.lineTo(px+11,py+22);X.closePath();X.fill();
    X.fillStyle=m.color;X.beginPath();X.moveTo(px+8,py+16);X.lineTo(px+11,py+13);X.lineTo(px+14,py+16);X.lineTo(px+11,py+20);X.closePath();X.fill();
    X.fillStyle=m.dark;X.fillRect(px+14,py+15,13,4);X.fillRect(px+22,py+18,3,4);X.fillRect(px+26,py+18,2,3);X.fillStyle=m.color;X.fillRect(px+14,py+16,12,2);X.fillRect(px+22,py+18,2,2);X.fillStyle=m.glow;X.fillRect(px+10,py+14,2,2);X.fillRect(px+17,py+16,4,1);
  }else if((m.shape||km?.keyId)==='brass'){
    X.fillStyle=m.dark;X.fillRect(px+6,py+12,10,10);X.fillStyle=m.color;X.fillRect(px+7,py+13,8,8);X.fillStyle='#17120b';X.fillRect(px+10,py+16,3,3);X.fillStyle=m.dark;X.fillRect(px+14,py+15,14,4);X.fillRect(px+20,py+18,2,4);X.fillRect(px+24,py+18,2,5);X.fillRect(px+27,py+18,2,3);X.fillStyle=m.color;X.fillRect(px+14,py+16,13,2);X.fillRect(px+20,py+18,1,2);X.fillRect(px+24,py+18,1,3);X.fillRect(px+27,py+18,1,2);X.fillStyle=m.glow;X.fillRect(px+8,py+14,4,1);X.fillRect(px+17,py+16,4,1);
  }else{
    X.fillStyle=m.dark;X.fillRect(px+6,py+11,11,11);X.fillStyle=m.color;X.fillRect(px+8,py+13,7,7);X.fillStyle='#14191c';X.fillRect(px+10,py+15,3,3);X.fillStyle=m.dark;X.fillRect(px+15,py+15,13,5);X.fillRect(px+21,py+19,3,4);X.fillRect(px+26,py+18,3,3);X.fillStyle=m.color;X.fillRect(px+15,py+16,12,3);X.fillRect(px+21,py+19,2,2);X.fillRect(px+26,py+18,2,2);X.fillStyle=m.glow;X.fillRect(px+8,py+13,5,1);X.fillRect(px+17,py+16,5,1);
  }
  X.restore();return true;
}
function drawKeyGateOverlay(tile,px,py,x,y,now,r){
  if(!r||tile!==TT.LOCKED_GATE||!state?.keyPlan96)return;const d=doorPos1006(x,y);if(!d)return;const m=keyMeta1006(d.keyId),shape=m.shape||d.keyId;X.save();
  X.fillStyle='rgba(12,10,8,.72)';X.fillRect(px+9,py+9,14,17);X.strokeStyle=m.dark;X.lineWidth=2;X.strokeRect(px+9.5,py+9.5,13,16);
  if(shape==='jade'){X.fillStyle=m.color;X.beginPath();X.moveTo(px+16,py+11);X.lineTo(px+21,py+16);X.lineTo(px+16,py+21);X.lineTo(px+11,py+16);X.closePath();X.fill();X.fillStyle=m.dark;X.fillRect(px+15,py+15,3,7)}
  else if(shape==='brass'){X.fillStyle=m.color;X.fillRect(px+11,py+12,10,3);X.fillRect(px+12,py+17,2,6);X.fillRect(px+15,py+16,2,7);X.fillRect(px+19,py+17,2,6)}
  else{X.fillStyle=m.color;X.fillRect(px+11,py+12,10,5);X.fillStyle=m.dark;X.fillRect(px+14,py+13,4,3);X.fillStyle=m.color;X.fillRect(px+15,py+17,3,6);X.fillRect(px+18,py+20,2,3)}
  X.restore();
}
function paintRestaurantFinal(fr){
  const floor=fr.theme42===3?(TT.DARK_WOOD??TT.WOOD_FLOOR??TT.FLOOR):(TT.WOOD_FLOOR??TT.FLOOR),d=fr.door42;
  for(let y=fr.y;y<fr.y+fr.h;y++)for(let x=fr.x;x<fr.x+fr.w;x++){const edge=x===fr.x||y===fr.y||x===fr.x+fr.w-1||y===fr.y+fr.h-1;setTerrainTile58(state.map,x,y,edge?TT.WALL:floor)}
  setTerrainTile58(state.map,d.x,d.y,TT.DOOR);restaurantCluster(fr);restaurantFurniture(fr);styleRestaurantFinal42(fr);return true;
}
/* ===== NEVANDA-CLEAN ACTOR PASS (render only) ===== */
/* ---------- compact clean Nevanda-informed sprites; every non-exempt enemy gets an individual tile ---------- */
const HERO_SPRITE_W=32,HERO_SPRITE_H=36,HERO_SPRITE_CACHE=new Map();
const EXEMPT=new Set(['취객','떠돌이 도둑','객잔 경비병']);
function drawSpecialMaterial(px,py,x,y,wall=false){
 if(!state||state.artifactDungeon46)return;const g=state.specialPlaces52;if(!g||g.floor!==state.floor)return;const q=(wall?g.walls:g.cells)?.[K1020(x,y)];let d=SPECIAL_PLACES52[state.floor];if(!q||!d)return;if(state.floor===6){const name=g.zones[q.zone]?.name||'';if(/대열람|집무/.test(name))d=[d[0],'#51493c','#8f7e60','#ddc99d',d[4]];else if(/기록|고문서/.test(name))d=[d[0],'#42484a','#7c8784','#cbd6c5',d[4]];}
 X.save();const h=hash1022(`${state.floor}:${x}:${y}:place52`);
 if(wall){X.fillStyle=d[1];X.fillRect(px,py,32,32);X.fillStyle='#20272a';X.fillRect(px,py+29,32,3);X.fillStyle=d[2];X.fillRect(px+2,py+2,28,3);X.fillRect(px+3,py+6,2,22);X.fillRect(px+27,py+6,2,22);X.strokeStyle=d[2];X.strokeRect(px+8.5,py+9.5,15,14);X.fillStyle='#292c2b';X.fillRect(px+10,py+11,12,10);X.fillStyle=d[2];for(let i=0;i<3;i++)X.fillRect(px+12+i*3,py+13+(i%2)*2,1,6);if(q.fixture){X.fillStyle=d[3];X.fillRect(px+12,py+10,8,3);X.fillStyle='#f4deac';X.fillRect(px+14,py+11,4,5);X.globalAlpha=.16;X.fillStyle=d[3];X.fillRect(px+7,py+7,18,13);X.globalAlpha=1;X.fillStyle='#292c28';X.fillRect(px+13,py+17,6,2)}}
 else{const t=terrainBaseTile58(x,y);if(!basicFloor1022(t)){X.restore();return}X.fillStyle=d[1];X.fillRect(px,py,32,32);X.fillStyle='#252d2c';X.fillRect(px,py+31,32,1);X.fillRect(px+31,py,1,32);X.strokeStyle=d[2];X.globalAlpha=.42;
  if(q.mode===0){for(let yy=3;yy<32;yy+=8){X.beginPath();X.moveTo(px+2,py+yy);X.lineTo(px+30,py+yy);X.stroke()}X.fillStyle=d[2];X.fillRect(px+3+(h%23),py+5,1,22)}
  else if(q.mode===1){X.strokeRect(px+3.5,py+3.5,25,25);X.strokeRect(px+7.5,py+7.5,17,17)}
  else if(q.mode===2){X.beginPath();X.moveTo(px+16,py+2);X.lineTo(px+30,py+16);X.lineTo(px+16,py+30);X.lineTo(px+2,py+16);X.closePath();X.stroke()}
  else{for(let yy=2;yy<31;yy+=10){X.beginPath();X.moveTo(px+1,py+yy);X.lineTo(px+30,py+yy);X.stroke();X.fillStyle=d[2];X.fillRect(px+((yy+h)%24)+3,py+yy,1,9)}}
  X.globalAlpha=.3;X.fillStyle=d[3];X.fillRect(px+4+(h%23),py+7+((h>>>4)%18),3,1);X.globalAlpha=1;
  if(q.landmark){const l=q.landmark,ux=l.u*32,uy=l.v*32;X.save();X.beginPath();X.rect(px,py,32,32);X.clip();X.translate(px-ux,py-uy);X.scale((l.w||3)/3,(l.h||3)/3);drawPlaceLandmark(d);X.restore()}
 }X.restore()
}
function drawLibraryDesk(tile,px,py,x,y){
 const d=state?.floor===6&&!state.artifactDungeon46&&tile===TT.TABLE?state.libraryDesks52?.[K1020(x,y)]:null;if(!d)return false;
 X.save();X.fillStyle='#30271e';X.fillRect(px,py,32,32);X.fillStyle='#725c40';X.fillRect(px+1,py+1,30,30);X.fillStyle='#947550';for(const yy of [3,11,19,27])X.fillRect(px+2,py+yy,28,1);X.fillStyle='#b49666';if(d.u===0)X.fillRect(px+2,py,2,32);else X.fillRect(px+28,py,2,32);if(d.v===0)X.fillRect(px,py+2,32,2);if(d.v===2)X.fillRect(px,py+28,32,2);
 if(d.v!==1){X.fillStyle='#273d39';X.fillRect(px+7,py+8,18,13);X.fillStyle='#c1b897';X.fillRect(px+9,py+7,14,12);X.fillStyle='#5b5a48';for(let i=0;i<4;i++)X.fillRect(px+11,py+9+i*2,10-(i%2)*3,1);X.fillStyle='#293b3d';X.fillRect(px+24,py+22,4,4)}else{X.fillStyle='#443426';X.fillRect(px+11,py+9,10,14);X.fillStyle='#dfc993';X.fillRect(px+14,py+7,4,8);X.fillStyle='#ffebbd';X.fillRect(px+15,py+5,2,5)}X.restore();return true
}
globalThis.__MANRU_TERRAIN_R41__={specialBefore:drawKeyTile,specialKeyAfter:drawKeyGateOverlay,
floor:(px,py,x,y,colors,vis)=>{floorOverlay1020(px,py,x,y,colors,vis);floorThemeOverlay1022(px,py,x,y,colors,vis);drawSpecialMaterial(px,py,x,y,false)},
surfaceBlend:floorSurfaceBlend1025,
libraryDesk52:drawLibraryDesk,
wall:(px,py,x,y,colors)=>wallLibraryOverlay1022(px,py,x,y,colors),
specialAfter:(tile,px,py,x,y,now,r)=>{specialBlendOverlay1020(tile,px,py,x,y,now,r)}};
function drawPlaceLandmark(d){
 const f=state.floor;X.fillStyle='#242c2b';X.fillRect(3,3,90,90);X.strokeStyle=d[2];X.lineWidth=2;X.strokeRect(5,5,86,86);X.strokeStyle=d[3];X.fillStyle=d[3];
 const line=(a,b,c,e)=>{X.beginPath();X.moveTo(a,b);X.lineTo(c,e);X.stroke()},circle=(x,y,r)=>{X.beginPath();X.arc(x,y,r,0,Math.PI*2);X.stroke()},box=(x,y,w,h)=>X.strokeRect(x,y,w,h);
 if(f===2){X.fillStyle='#b6ab8b';X.fillRect(17,18,44,55);X.fillStyle='#4f5145';for(let i=0;i<7;i++)X.fillRect(23,25+i*6,29-(i%3)*5,2);X.fillStyle='#954e40';X.fillRect(50,57,24,22);X.strokeStyle='#d29c75';box(55,61,14,14)}
 else if(f===4){for(let i=0;i<5;i++){const x=20+i*14;line(x,22,x,74);X.beginPath();X.moveTo(x,15);X.lineTo(x-4,28);X.lineTo(x+4,28);X.closePath();X.fill()}line(13,43,82,43);line(13,64,82,64)}
 else if(f===5){circle(48,48,33);circle(48,48,27);X.fillStyle='#98835c';X.beginPath();X.moveTo(36,22);X.lineTo(60,22);X.lineTo(72,66);X.lineTo(24,66);X.closePath();X.fill();line(28,58,68,58);circle(48,73,4)}
 else if(f===6){X.fillStyle='#a39875';X.fillRect(13,18,70,60);X.strokeStyle='#535b4c';for(let i=0;i<5;i++){line(18,25+i*11,78,25+i*11);line(22+i*13,22,22+i*13,74)}X.strokeStyle='#796142';circle(49,49,22);line(28,66,64,28);line(64,28,62,40);line(64,28,53,30)}
 else if(f===8){X.strokeStyle='#65817d';X.lineWidth=8;X.beginPath();X.moveTo(14,23);X.bezierCurveTo(80,8,15,91,81,73);X.stroke();X.lineWidth=2;X.strokeStyle=d[3];for(const [x,y]of [[25,32],[61,61],[38,71]]){circle(x,y,7);line(x-8,y+2,x+8,y+2)}}
 else if(f===10){circle(48,48,29);X.beginPath();X.ellipse(48,48,14,34,.55,0,Math.PI*2);X.stroke();X.beginPath();X.ellipse(48,48,35,12,-.4,0,Math.PI*2);X.stroke();line(48,12,48,83);line(25,83,71,83)}
 else if(f===11){X.fillStyle='#705246';X.fillRect(17,26,63,39);X.strokeStyle='#d5bb8f';for(let i=0;i<7;i++)line(20,31+i*4,77,31+i*4);X.fillStyle='#bb9870';X.fillRect(25,23,3,47);X.fillRect(69,23,3,47)}
 else if(f===13){X.fillStyle='#978b77';X.fillRect(17,17,27,60);X.fillRect(49,21,29,59);X.fillStyle='#504749';for(let i=0;i<8;i++){X.fillRect(21,24+i*5,17,1);X.fillRect(53,28+i*5,20,1)}X.fillStyle='#8d5157';X.fillRect(34,61,19,18);X.fillRect(66,60,9,9)}
 else if(f===15){X.beginPath();X.moveTo(12,48);X.quadraticCurveTo(48,3,84,48);X.quadraticCurveTo(48,89,12,48);X.stroke();circle(48,48,18);circle(48,48,6);for(let i=0;i<5;i++)line(24+i*12,27,22+i*13,17)}
 else if(f===16){circle(48,48,23);circle(48,48,9);for(let i=0;i<8;i++){X.save();X.translate(48,48);X.rotate(i*Math.PI/4);X.fillRect(-5,23,10,12);X.restore()}X.strokeStyle='#995d40';line(17,78,79,78)}
 else if(f===18){for(let i=0;i<5;i++){X.beginPath();X.ellipse(21+i*14,22+i*13,7,12,-.65,0,Math.PI*2);X.stroke()}X.fillStyle='#806f61';X.fillRect(13,13,10,10);X.fillRect(74,74,10,10)}
 else if(f===20){box(17,17,63,62);for(let i=0;i<5;i++){line(17+i*15,17,17+i*15,79);line(17,17+i*15,80,17+i*15)}for(const [x,y]of [[31,32],[61,47],[46,63]]){X.fillRect(x-4,y-4,8,8);line(x,y-5,x,y-13)}}
 else if(f===21){circle(48,48,31);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(48+24*Math.cos(a),48+24*Math.sin(a),48+36*Math.cos(a),48+36*Math.sin(a))}X.beginPath();X.moveTo(48,14);X.lineTo(60,58);X.lineTo(48,49);X.lineTo(36,58);X.closePath();X.fill();line(48,49,48,78)}
 else if(f===22){box(18,22,60,53);box(29,34,38,41);box(40,47,16,28);line(12,80,84,80);for(let i=0;i<5;i++)X.fillRect(19+i*13,16,7,9)}
 else if(f===23){for(let y=0;y<3;y++)for(let x=0;x<3;x++){const xx=18+x*21+(y%2)*2,yy=22+y*18;X.fillStyle=(x+y)%2?'#a98b51':'#c0a269';X.fillRect(xx,yy,17,12);X.fillStyle='#e0c58b';X.fillRect(xx+2,yy+1,13,2);X.fillStyle='#665538';X.fillRect(xx+2,yy+10,14,2)}}
 else if(f===24){X.fillStyle='#71583e';X.fillRect(30,61,37,17);X.fillStyle='#967753';X.fillRect(25,59,46,5);X.strokeStyle='#8c7856';X.lineWidth=5;line(48,60,43,38);line(43,38,59,25);X.fillStyle='#78916d';for(const [x,y,r]of [[30,34,13],[51,29,17],[68,39,12]]){X.beginPath();X.arc(x,y,r,0,Math.PI*2);X.fill()}}
 else if(f===25){for(let i=0;i<3;i++){const r=35-i*11;X.beginPath();X.moveTo(48,48-r);X.lineTo(48+r,48);X.lineTo(48,48+r);X.lineTo(48-r,48);X.closePath();X.stroke()}X.fillStyle='#b38370';X.fillRect(42,42,12,12);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])line(48+26*Math.cos(a),48+26*Math.sin(a),48+41*Math.cos(a),48+41*Math.sin(a))}
}
/* ===== R7 CANONICAL CREATURE ART (outer game scope) ===== */
/* ---------- MANRU canonical creature art r3: Nevanda/NetHack readability, exact-name silhouettes ---------- */
const ACTOR_OUTLINE='#120f12',ACTOR_INK='#211a1c';
const ACTOR_CACHE=new Map(),PCACHE=new Map();
const ACTOR_SPEC={
  // Dedicated regional art; servants explicitly retain the original body and palette.
  '용철 화로지기':{"a":"branch","c":"#765142","h":"#ab8060","ac":"#e9ac62","design":"forge_keeper"},
  '불씨 식귀':{"a":"branch","c":"#694132","h":"#a9754e","ac":"#f4b469","design":"ember_ghoul"},
  '제련 도깨비':{"a":"branch","c":"#68523e","h":"#9c9067","ac":"#c9ab73","design":"smelter_imp"},
  '침수 쇠뇌수':{"a":"branch","c":"#355765","h":"#86a6ac","ac":"#c9b67f","design":"drowned_crossbow"},
  '수압 악어':{"a":"branch","c":"#355c58","h":"#7f9c88","ac":"#e4c482","design":"pressure_croc"},
  '물살 시종':{"a":"servant","c":"#80654c","h":"#c9ad82","ac":"#d6bd7e","waterServant1012":true},
  '뇌우 사수':{"a":"branch","c":"#3f5d70","h":"#95adb7","ac":"#d6cf97","design":"storm_shooter"},
  '피뢰 갑병':{"a":"branch","c":"#4f5e68","h":"#a0a9ac","ac":"#c3dcda","design":"lightning_plate"},
  '전도 정령':{"a":"branch","c":"#457f93","h":"#90bcbf","ac":"#d9ecc1","design":"conduction_spirit"},
  '주박 검객':{"a":"branch","c":"#563d50","h":"#98818b","ac":"#c77d91","design":"bound_swordsman"},
  '사당 주술시종':{"a":"branch","c":"#68404f","h":"#ad7890","ac":"#cfaa70","design":"shrine_attendant"},
  '혈인 원혼':{"a":"branch","c":"#663747","h":"#ae707a","ac":"#e2a098","design":"blood_wraith"},
  '석분 권사':{"a":"branch","c":"#786850","h":"#b3a17a","ac":"#ddc99e","design":"stone_boxer"},
  '붕락 갑병':{"a":"branch","c":"#68695b","h":"#a3a48b","ac":"#d4c497","design":"collapse_plate"},
  '토맥 괴수':{"a":"branch","c":"#605647","h":"#978b6b","ac":"#c9b588","design":"earth_beast"},
  '반영 검객':{"a":"branch","c":"#577384","h":"#a4b4ba","ac":"#d7d3b7","design":"reflection_duelist"},
  '거울 시녀':{"a":"branch","c":"#80637b","h":"#b9a2b0","ac":"#d5b87f","design":"mirror_handmaid"},
  '파편 망령':{"a":"branch","c":"#607f8f","h":"#adc4ca","ac":"#dbcda8","design":"shard_wraith"},
  '부패 창병':{"a":"branch","c":"#514451","h":"#8b8780","ac":"#b5ac7b","design":"rotted_spear"},
  '묘문 사제':{"a":"branch","c":"#5d4c61","h":"#9c899d","ac":"#c2b58a","design":"grave_priest"},
  '혼백 사냥꾼':{"a":"branch","c":"#454651","h":"#8f9a9c","ac":"#c5b493","design":"soul_hunter"},
  '월화 궁수':{"a":"branch","c":"#9c442c","h":"#dc844a","ac":"#f4c877","design":"moonfire_archer"},
  '재의 감시자':{"a":"branch","c":"#625752","h":"#a69584","ac":"#e5b583","design":"ash_watcher"},
  '용암 살라맨더':{"a":"branch","c":"#793e2c","h":"#bc6c43","ac":"#eec37b","design":"lava_salamander"},
  '족쇄 인형':{"a":"branch","c":"#4d5457","h":"#929a93","ac":"#c9b587","design":"shackle_doll"},
  '갈고리 죄수':{"a":"branch","c":"#5f4740","h":"#9c8170","ac":"#cdbf96","design":"hook_prisoner"},
  '파성 갑병':{"a":"branch","c":"#74654b","h":"#b1a086","ac":"#d9c391","design":"breach_plate"},
  '성벽 포수':{"a":"branch","c":"#515955","h":"#96998a","ac":"#c7af7d","design":"wall_gunner"},
  '수로 잠복꾼':{a:'thief',c:'#3c6561',h:'#8da28b',ac:'#ccbc82'},
  '수문 쇠뇌수':{a:'archer',c:'#406563',h:'#95b4a4',ac:'#d2b877'},
  '어린 수압 악어':{a:'croc',c:'#3e6258',h:'#88a797',ac:'#d4ca88'},
  '곡물 식귀':{a:'ghoul',c:'#6c5740',h:'#bb9671',ac:'#dfbd83'},
  '창고 파수꾼':{a:'inn_guard',c:'#6a5140',h:'#b99865',ac:'#e3c58a'},
  '산채 도객':{a:'thief',c:'#514b34',h:'#a49c65',ac:'#c98351'},
  '산채 궁수':{a:'archer',c:'#4b5437',h:'#a1a175',ac:'#d29d64'},
  '산채 창병':{a:'inn_guard',c:'#625745',h:'#b3a078',ac:'#c5704d'},
  '산채 대두령':{a:'inn_guard',c:'#694737',h:'#c68d5f',ac:'#e0c27e'},
  '흑산채 도객':{a:'thief',c:'#363843',h:'#828396',ac:'#b55564'},
  '흑산채 쇠뇌수':{a:'archer',c:'#3e3948',h:'#94879c',ac:'#c16b72'},
  '쇠사슬 간수':{a:'inn_guard',c:'#43454c',h:'#a0a4a4',ac:'#ab626c'},
  '흑기 두령':{a:'inn_guard',c:'#493846',h:'#ac8196',ac:'#e1b880'},

  '문하생':{a:'dojo',c:'#a99372',h:'#bba27c',ac:'#cec0a4'},
  '수련생':{a:'dojo',c:'#9e8968',h:'#bba27c',ac:'#c3a779'},
  '상급 무도가':{a:'dojo',c:'#8c785b',h:'#bba27c',ac:'#d5ba85'},
  '백사 사범':{a:'dojo',c:'#d0be9f',h:'#bba27c',ac:'#846342'},
  '사범급 무도가':{a:'dojo',c:'#d0be9f',h:'#bba27c',ac:'#846342'},
  '객잔 쥐':{a:'rat',c:'#766858',h:'#ad9170',ac:'#cf5d5d'},
  '취객':{a:'drunk',c:'#765644',h:'#b18a63',ac:'#c8614f'},
  '객잔 경비병':{a:'inn_guard',c:'#5c4838',h:'#9f7652',ac:'#d2a45f'},
  '떠돌이 도둑':{a:'thief',c:'#403a3d',h:'#756a70',ac:'#bc6c63'},
  '시종':{a:'servant',c:'#80654c',h:'#c9ad82',ac:'#d6bd7e'},
  '거대 거미':{a:'spider',c:'#4c3b45',h:'#8e6a7a',ac:'#df806e'},
  '정원사 망령':{a:'reaper',c:'#526558',h:'#8fa28b',ac:'#b8d38d'},
  '독꽃':{a:'flower',c:'#4e733b',h:'#8eb65c',ac:'#b76a9a'},
  '검은 뱀':{a:'snake',c:'#263730',h:'#557065',ac:'#d7b75b'},
  '먹물 정령':{a:'ink',c:'#273843',h:'#526a7a',ac:'#99bdc8'},
  '작은 먹물':{a:'inksmall',c:'#273843',h:'#526a7a',ac:'#99bdc8'},
  '갱도 투석꾼':{a:'mine_slinger',c:'#4c5050',h:'#89908b',ac:'#c8a36b'},
  '수목 궁수':{a:'archer',c:'#41583d',h:'#84956d',ac:'#c5a469'},
  '정원 바위괴물':{a:'golem',c:'#4e5450',h:'#858b7e',ac:'#9db581'},
  '식인 물고기':{a:'fish',c:'#386a71',h:'#75a1a4',ac:'#e2c66f'},
  '수은 물고기':{a:'fish',c:'#586d6d',h:'#a9b8b4',ac:'#e8d27a'},
  '윈도':{a:'widow',c:'#4e354d',h:'#8c627f',ac:'#d496b8'},
  '비단 술래':{a:'silk',c:'#784e68',h:'#c37f9e',ac:'#efd0dd'},
  '환각의 향로':{a:'censer',c:'#4b3c52',h:'#8c728e',ac:'#d1a76e'},
  '향기요정':{a:'fairy',c:'#76648a',h:'#b49dcc',ac:'#efd0ef'},
  '분홍거미':{a:'spider',c:'#6e3f5c',h:'#bd7195',ac:'#f1a1b4'},
  '구미호':{a:'fox',c:'#805d65',h:'#d2a0a0',ac:'#f0d3b7'},
  '구미묘':{a:'fox',c:'#9a651f',h:'#f2c75a',ac:'#ef8a2f'},
  '장부지기':{a:'merchant_ledger',c:'#294c50',h:'#598387',ac:'#dcc28b'},
  '장물아비':{a:'merchant_fence',c:'#3a4035',h:'#767d59',ac:'#c7a978'},
  '도깨비 보부상':{a:'merchant_porter',c:'#624632',h:'#a17b51',ac:'#d1b17d'},
  '지네':{a:'centipede',c:'#66452f',h:'#a8734e',ac:'#d6a66d'},
  '강시':{a:'jiangshi',c:'#45534e',h:'#78877e',ac:'#d5c07a'},
  '식귀':{a:'ghoul',c:'#5d443c',h:'#977064',ac:'#c6a08a'},
  '산성 슬라임':{a:'slime',c:'#58733d',h:'#96b861',ac:'#d5e87f'},
  '굶주린 창고 쥐':{a:'rat',c:'#59473f',h:'#8e6b5c',ac:'#d55f50'},
  '악어':{a:'croc',c:'#3f563d',h:'#708068',ac:'#d3c06b'},
  '수비병':{a:'guard',c:'#5b4a39',h:'#9d7957',ac:'#d5ad66'},
  '강철이':{a:'ironbrute',c:'#41464c',h:'#787f86',ac:'#d28b58'},
  '살라맨더':{a:'salamander',c:'#8d3f2e',h:'#d1704d',ac:'#ffd06b'},
  '화염 가고일':{a:'gargoyle',c:'#5e4540',h:'#967067',ac:'#f09a59'},
  '녹아내린 슬라임':{a:'slime',c:'#843a23',h:'#d26338',ac:'#ffb24e'},
  '경비 인형 - 보병':{a:'puppet',c:'#5d5547',h:'#928878',ac:'#d0ad68'},
  '해자 잠복꾼':{a:'lurker',c:'#713626',h:'#b65a3c',ac:'#f0a65a'},
  '경비 인형 - 포병':{a:'cannon',c:'#514b44',h:'#827a6f',ac:'#d3a763'},
  '성채 비행 감시자':{a:'drone',c:'#765a3f',h:'#ae8560',ac:'#e2be70'},
  '공허 가오리':{a:'manta',c:'#403858',h:'#77698e',ac:'#79c8d0'},
  '만루의 수호상':{a:'statue',c:'#6e6346',h:'#aa9569',ac:'#e4c568'},
  '천수 아수라':{a:'asura',c:'#6f5a8f',h:'#bda4e0',ac:'#f3c96e'},
  '신전 사제 망령':{a:'priest',c:'#57455f',h:'#8c7895',ac:'#d8c16c'},
  '차원 포식자':{a:'devourer',c:'#4e2841',h:'#823f62',ac:'#76c5d2'},
  '보주의 파수꾼':{a:'sentinel',c:'#6a542f',h:'#b19055',ac:'#f1d26c'},
  '금령':{a:'goldspirit',c:'#7a5d26',h:'#c6a85f',ac:'#fff0a0'},
  '여의 수룡':{a:'dragon',c:'#506a70',h:'#8e9fa0',ac:'#d0e7dd'},
  '광견 대장':{a:'houndboss',c:'#443936',h:'#806b5e',ac:'#d85b4b'},
  '화공 노인':{a:'painter',c:'#4f6256',h:'#879b87',ac:'#d6c98e'},
  '환각의 침모':{a:'seamstress',c:'#6d405d',h:'#b36f90',ac:'#f0b0ca'},
  '장고의 간수':{a:'keeper'},
  '객주 주인: 만루보주':{a:'master'},
  '만루보주 · 본모습':{a:'master_true'},
  '만루 환영':{a:'masterghost',c:'#4b3f70',h:'#8171a4',ac:'#c5b3ea'},
  '종이 호랑이':{a:'tiger',c:'#d2ba78',h:'#f1dfaa',ac:'#7d4c34'}
};
function genericSpec(m){const a=m?.shape==='beast'?'croc':m?.shape==='mage'?'priest':m?.shape==='brute'?'golem':m?.shape==='angel'?'fairy':m?.shape==='void'?'shadow':m?.shape==='guard'||m?.shape==='armor'?'guard':'ghoul';return{a,c:m?.color||'#6d6460',h:'#a79b8d',ac:'#d7b46c'}}
function drawDojoActor(q,m,frame){
 const rank=Math.max(1,Math.min(4,m.dojoRank105||4)),style=m.dojoStyle105??5,v=m.dojoLook105||{},b=frame?1:0,
 colors=[['#5a4033','#947157','#c2a07a'],['#384d44','#718476','#b7baa0'],['#593b37','#986b58','#c5a277'],['#3e4a52','#78858a','#b5bdb1'],['#36323e','#746976','#ada0af'],['#706553','#aaa087','#d5c7a7']],c=colors[style]||colors[5],skin='#b99a78',dark='#26231f';
 // Same plain head and cloth vocabulary. Rank is carried by body size and stance.
 const pose=[null,
  {head:[15,15],shoulders:[11,21,20,21],hip:[12,28,19,28],feet:[11,21],left:[[11,22],[10,25],[13,25]],right:[[20,22],[22,25],[19,24]]},
  {head:[15,10],shoulders:[10,17,21,18],hip:[12,27,20,27],feet:[9,23],left:[[10,18],[7,22],[11,21]],right:[[21,19],[24,21],[24,18]]},
  {head:[13,7],shoulders:[7,15,21,14],hip:[11,25,21,26],feet:[5,25],left:[[8,16],[4,20],[7,23]],right:[[21,15],[25,13],[27,19]]},
  {head:[16,5],shoulders:[7,13,25,13],hip:[10,28,23,28],feet:[8,24],left:[[8,14],[4,19],[2,22]],right:[[24,14],[28,18],[27,19]]}
 ][rank],hx=pose.head[0],hy=pose.head[1]+b,[lx,ly,rx,ry]=pose.shoulders,[hl,hly,hr,hry]=pose.hip;
 shadow1012(q,16,34,rank===1?16:rank===2?21:28);
 const limb=(points,color,width)=>{q.lineJoin='round';q.lineCap='butt';for(let i=1;i<points.length;i++){const a=points[i-1],z=points[i];lR9(q,a[0],a[1]+b,z[0],z[1]+b,dark,width+2);lR9(q,a[0],a[1]+b,z[0],z[1]+b,color,width);}};
 limb([[hl+1,hly],[pose.feet[0]+1,32]],c[0],rank===1?3:4);limb([[hr-1,hry],[pose.feet[1],32]],c[0],rank===1?3:4);
 bootR9(q,pose.feet[0]-1,31,rank===1?4:5);bootR9(q,pose.feet[1]-1,31,rank===1?4:5);
 pR9(q,c[0],[[lx,ly+b],[hx,hy+4],[rx,ry+b],[hr+1,hry+2],[hl-1,hly+2]]);
 pR9(q,c[1],[[lx+1,ly+1+b],[hx,hy+5],[hx-1,hly],[hl,hly]],null);
 lR9(q,lx+2,ly+1+b,hr-2,hry-3,c[2]);lR9(q,rx-2,ry+1+b,hl+2,hly-3,c[1]);
 if(m.armor){pR9(q,'#4e5049',[[lx+3,ly+5+b],[rx-2,ry+5+b],[hr-1,hry-3],[hl+2,hly-3]],null);for(let y=Math.max(ly,ry)+6;y<hly-3;y+=2)lR9(q,lx+4,y+b,rx-3,y+b,'#878979');}
 limb(pose.left,c[1],rank===1?3:rank===4?6:4);limb(pose.right,c[0],rank===1?3:rank===4?6:4);
 const handL=pose.left.at(-1),handR=pose.right.at(-1);eR9(q,handL[0],handL[1]+b,rank===1?1.4:2,2,skin,null);eR9(q,handR[0],handR[1]+b,rank===1?1.4:2,2,skin,null);
 lR9(q,hl,hly-2,hr,hry-2,dark,3);lR9(q,hl+1,hly-2,hr-1,hry-2,c[2]);lR9(q,hx,hly,hx+(v.sash?2:-2),hly+3,c[1],2);
 // No eyes, brows, mouth, beard, masks or rank-specific headwear.
 eR9(q,hx,hy,rank===1?3:3.6,rank===1?3.2:3.8,skin);pR9(q,dark,[[hx-4,hy-1],[hx-3,hy-4],[hx+2,hy-4],[hx+4,hy-1],[hx+2,hy-2],[hx-2,hy-2]],null);
 const w=m.weapon,kind=w?.kind;drawHeldWeapon(q,m,'right',false,{left:[handL[0],handL[1]+b],right:[handR[0],handR[1]+b]});
 if(!w||kind==='brawl')for(const hand of [handL,handR]){r1012(q,hand[0]-2,hand[1]-2+b,4,3,kind==='brawl'?'#87958d':'#bfb59b');}
}
function drawKeeperBoss(q,frame){
 const b=frame?1:0,steel='#606361',edge='#a5a091',dark='#343a3a',rust='#735344',gold='#ba9060',fire='#e39a64',{r}=drawKit(q);
 shadow1012(q,16,34,30);
 // The strapped execution frame rises behind a compact helmet and separated legs.
 r('#171b1c',5,4,3,25);r('#484e4c',6,4,1,23);r('#171b1c',24,4,3,25);r('#63675f',24,5,1,22);r('#232828',5,4,22,3);r('#8c8170',7,4,18,1);r('#2a3030',5,17,22,3);
 for(const x of[7,24]){r(gold,x,7,1,1);r('#101718',x,11,2,3);r('#b39b75',x,11,1,1)}
 pR9(q,'#282c2b',[[10,13+b],[22,13+b],[24,23+b],[22,29],[10,29],[8,23+b]]);
 pR9(q,steel,[[10,13+b],[21,12+b],[23,18+b],[21,24+b],[11,24+b],[9,18+b]]);pR9(q,'#838174',[[11,14+b],[15,13+b],[14,23+b],[11,22+b]],null);pR9(q,dark,[[17,14+b],[21,14+b],[22,20+b],[19,23+b],[16,22+b]],null);
 for(const y of[17,20]){r('#242b2b',11,y+b,10,1);r(edge,11,y-1+b,5,1)}r(rust,10,24+b,12,3);r('#d1b07a',14,24+b,4,3);r('#4b4135',15,25+b,2,1);
 pR9(q,'#292c2b',[[4,12+b],[10,10+b],[12,14+b],[9,19+b],[3,17+b]]);pR9(q,steel,[[4,13+b],[9,11+b],[10,14+b],[8,17+b],[4,16+b]],null);lR9(q,4,12+b,9,11+b,edge,1);
 pR9(q,dark,[[23,11+b],[28,13+b],[30,17+b],[24,19+b],[21,15+b]]);pR9(q,'#7b7c70',[[24,12+b],[28,14+b],[28,16+b],[24,17+b]],null);r(gold,5,14+b,1,1);r(gold,26,14+b,1,1);
 pR9(q,dark,[[3,18+b],[8,17+b],[9,24+b],[6,27+b],[2,24+b]]);pR9(q,'#747569',[[3,19+b],[6,18+b],[7,23+b],[4,24+b]],null);pR9(q,dark,[[24,18+b],[29,17+b],[30,24+b],[26,26+b],[23,23+b]]);r(steel,25,19+b,3,5);
 r('#272b2b',10,28,5,6);r('#202525',18,28,5,6);r('#797c72',11,28,3,4);r('#64695f',19,28,3,4);r('#161c1d',8,32,7,3);r('#151b1d',18,32,7,3);r(edge,9,32,4,1);r('#878a7d',19,32,4,1);
 // Closed iron faceplate, brow ridge and a narrow furnace slit rather than a bare round face.
 pR9(q,'#191f20',[[11,4+b],[20,3+b],[23,7+b],[21,12+b],[13,13+b],[10,9+b]]);pR9(q,steel,[[12,5+b],[20,4+b],[21,7+b],[20,11+b],[14,12+b],[12,9+b]],null);pR9(q,'#8e8b7c',[[12,5+b],[16,4+b],[16,7+b],[13,8+b]],null);
 r('#232a2b',12,7+b,10,2);r(fire,13,8+b,2,1);r('#ffd1a0',13,8+b,1,1);r(fire,19,8+b,2,1);r('#373e3c',15,9+b,3,3);r(edge,16,9+b,1,2);r('#1b2223',14,11+b,1,1);r('#1b2223',19,11+b,1,1);
 // A continuous chain crosses the cuirass and hangs from the held hooked blade.
 for(let i=0;i<6;i++){const x=9+i*2,y=14+i+b;r('#1c2222',x,y,3,3);r('#a39b81',x,y,2,1);r('#706e5d',x+1,y+1,1,1)}
 r('#b49e7a',4,24+b,3,3);r('#5c4739',4,26+b,3,1);r('#b49e7a',25,23+b,3,3);r('#242a2b',28,17+b,2,16);r('#7b7d73',28,17+b,1,15);pR9(q,'#a9aaa0',[[28,13+b],[31,15+b],[31,20+b],[29,22+b],[29,18+b],[27,17+b]],'#262e2e');r('#e1d5b6',29,15+b,1,4);
 for(let i=0;i<3;i++){r('#1b2222',1+i,26+b+i*2,3,3);r('#a09a82',1+i,26+b+i*2,2,1);r('#817960',2+i,27+b+i*2,1,1)}
}
function drawMasterBoss(q,frame,trueForm=false){
 const b=frame?1:0,ink=trueForm?'#201822':'#252725',robe=trueForm?'#56344b':'#665238',light=trueForm?'#935c70':'#987947',gold='#cfaa66',ivory='#f1db9e',{r}=drawKit(q);
 shadow1012(q,16,34,28);
 // Palace silhouette: raised crown, broad hanging sleeves and a tapered layered robe.
 if(trueForm){
  for(const side of[-1,1]){pR9(q,'#352338',[[16+side*6,5+b],[16+side*12,8+b],[16+side*15,17+b],[16+side*11,15+b],[16+side*14,30],[16+side*9,27]],'#120e17');lR9(q,16+side*10,10+b,16+side*13,26,'#a48658',1);pR9(q,'#af915e',[[16+side*8,5+b],[16+side*12,1+b],[16+side*13,3+b],[16+side*11,7+b]],'#241923');r(ivory,16+side*12,2+b,1,2)}
  for(const [x,y]of[[3,10],[27,10],[1,24],[28,27]]){pR9(q,'#80623f',[[x,y+b],[x+2,y-2+b],[x+4,y+b],[x+2,y+3+b]],'#201622');r(ivory,x+2,y+b,1,1)}
 }
 pR9(q,'#17171b',[[11,11+b],[21,11+b],[25,23],[27,32],[21,30],[17,35],[12,33],[6,33],[8,23]]);
 pR9(q,robe,[[11,12+b],[20,12+b],[22,22],[25,31],[20,30],[17,33],[13,31],[8,32],[10,22]],null);
 pR9(q,light,[[11,13+b],[15,15+b],[13,29],[10,30],[11,22]],null);pR9(q,ink,[[19,14+b],[21,20],[23,29],[19,31],[17,30],[18,20]],null);
 pR9(q,ink,[[9,12+b],[12,14+b],[10,21+b],[7,27+b],[2,25+b],[3,17+b]]);pR9(q,robe,[[8,13+b],[10,15+b],[8,20+b],[6,24+b],[3,23+b],[4,17+b]],null);
 pR9(q,ink,[[22,12+b],[26,14+b],[30,22+b],[29,26+b],[23,27+b],[21,21+b]]);pR9(q,light,[[23,14+b],[26,16+b],[28,21+b],[27,24+b],[24,24+b],[22,20+b]],null);
 lR9(q,4,22+b,7,23+b,gold,1);lR9(q,24,23+b,28,22+b,gold,1);lR9(q,10,14+b,15,18+b,ivory,1);lR9(q,21,14+b,16,19+b,gold,1);
 r('#211d20',11,20+b,10,3);r(gold,11,20+b,10,1);r('#e4c882',14,20+b,4,3);r('#564238',15,21+b,2,1);r(gold,15,24,2,7);r(ivory,15,24,1,3);
 for(const [x,y]of[[10,25],[20,26],[11,29],[21,29]]){r(gold,x,y,2,1);r('#a08355',x+1,y+1,1,2)}lR9(q,9,31,12,31,gold,1);lR9(q,19,31,22,30,gold,1);
 // A black veil hides the entire face; only two red eyes remain beneath the crown.
 pR9(q,'#111015',[[12,5+b],[20,5+b],[22,8+b],[20,12+b],[16,14+b],[12,12+b],[10,8+b]]);pR9(q,'#050507',[[12,6+b],[20,6+b],[21,8+b],[19,12+b],[16,13+b],[13,11+b],[11,8+b]],null);
 r('#e62635',13,9+b,2,1);r('#e62635',18,9+b,2,1);r('#ff5960',14,9+b,1,1);r('#ff5960',18,9+b,1,1);
 r('#181a1d',11,3+b,10,3);r('#9f7c40',9,4+b,14,2);r(ivory,10,4+b,12,1);r(gold,12,1+b,2,3);r(gold,16,b,2,4);r(gold,20,1+b,2,3);r(ivory,16,b,1,2);
 r('#e3ca8e',10,6+b,1,4);r('#e3ca8e',22,6+b,1,4);r('#9d7950',10,10+b,1,3);r('#9d7950',22,10+b,1,3);r('#eddcaa',10,11+b,1,1);r('#eddcaa',22,11+b,1,1);
 // Hands frame the seal. In the revealed form the same seal is suspended above the palm.
 r('#c5ad8c',5,23+b,3,2);r('#d8bc92',24,22+b,3,2);const sy=trueForm?15-b:24+b;
 pR9(q,'#4b3540',[[25,sy],[28,sy+2],[27,sy+5],[23,sy+4],[23,sy+1]],'#1d1a23');pR9(q,gold,[[25,sy+1],[27,sy+2],[26,sy+4],[24,sy+3],[24,sy+2]],null);r(ivory,25,sy+2,1,1);
 if(trueForm){lR9(q,25,21+b,25,sy+5,'#9d7c53',.7);r('#edd894',8,14+b,1,3);r('#c5a368',22,28,1,3);r('#f6df9b',16,17+b,1,2)}
}
// Regional silhouettes use the same 32×36 frame, outline and shaded polygons as main creatures.
// Species identity, not floor or faction, selects art; no combat flags are changed here.
function drawBranchCreature(q,m,frame,sp){
 const b=frame?1:0,c=sp.c,h=sp.h,a=sp.ac,d=ACTOR_OUTLINE,skin='#b99a78',ivory='#e4d7b5',
 R=(x,y,w,hh,col)=>{q.fillStyle=col;q.fillRect(x,y,w,hh)},
 P=(col,pts,stroke=d)=>pR9(q,col,pts,stroke),L=(x,y,xx,yy,col,w=1)=>lR9(q,x,y,xx,yy,col,w),
 E=(x,y,rx,ry,col)=>eR9(q,x,y,rx,ry,col),
 facets=(pts)=>{for(const[x,y]of pts){R(x,y+b,2,1,h);R(x+1,y+1+b,1,2,c)}},
 eyes=(x,y,col=a)=>{R(x,y+b,2,1,col);R(x+5,y+b,2,1,col)},
 link=(x,y)=>{R(x,y,3,3,d);R(x,y,2,1,h);R(x+2,y+1,1,2,h);R(x+1,y+2,1,1,a)},
 trim=(pts,col=a)=>{for(let i=1;i<pts.length;i++)L(...pts[i-1],...pts[i],col)};
 shadow1012(q,16,34,sp.design==='ash_watcher'?18:28);
 switch(sp.design){
 case'forge_keeper':{
  // An iron kiln carried on separated squat legs, with a chimney and hinged furnace door.
  P('#292b2c',[[8,10+b],[24,10+b],[28,17+b],[26,28],[6,28],[4,18+b]]);
  R(10,2+b,5,9,d);R(11,3+b,3,7,h);R(10,2+b,6,2,c);
  P(c,[[8,12+b],[23,12+b],[26,18+b],[24,27],[8,27],[6,19+b]]);
  P(h,[[8,12+b],[14,12+b],[13,26],[8,25]],null);
  R(15,15+b,8,9,d);R(16,16+b,6,7,'#7a382b');R(17,18+b,2,4,a);R(20,17+b,1,5,'#f1c27a');
  for(const y of[17,20])R(15,y+b,8,1,'#413e37');
  P(h,[[3,16+b],[7,14+b],[8,24],[4,26],[1,23]]);P(c,[[26,14+b],[30,16+b],[31,25],[27,26],[24,22]]);
  bootR9(q,7,30,7);bootR9(q,20,30,7);R(8,28,5,3,h);R(21,28,4,3,c);
  R(11,10+b,11,2,a);facets([[8,17],[24,17],[9,25],[22,25]]);break;
 }
 case'ember_ghoul':{
  // Charred, arched spine and hooked hands; the ribs enclose the remaining embers.
  P('#312421',[[5,29],[9,15+b],[17,10+b],[24,17+b],[24,27],[18,29],[10,33]]);
  P(c,[[10,16+b],[16,12+b],[21,17+b],[20,28],[13,27],[9,30]]);
  P(h,[[8,6+b],[14,3+b],[21,8+b],[19,14+b],[11,14+b],[7,10+b]]);
  P('#2b2623',[[8,7+b],[13,4+b],[17,5+b],[15,8+b],[9,9+b]],null);
  R(11,9+b,2,1,a);R(17,10+b,2,1,a);R(13,12+b,5,1,d);
  for(let i=0;i<3;i++){L(13,17+b+i*3,19,19+b+i*3,ivory);R(16,18+b+i*3,2,1,a)}
  L(10,18+b,4,22+b,c,4);L(4,22+b,2,30,h,3);L(21,18+b,28,22+b,c,4);L(28,22+b,30,28,h,3);
  for(const[x,y]of[[1,29],[28,27]]){L(x,y,x+2,y+3,ivory);L(x+2,y+3,x+3,y+1,ivory)}
  bootR9(q,7,31,5);bootR9(q,19,30,5);
  P(a,[[6,19+b],[4,16-b],[7,17+b],[8,14+b],[9,20+b]],null);R(23,30-b,1,2,a);break;
 }
 case'smelter_imp':{
  // Broad horned smith, bare shoulders, a leather apron and a massive raised hammer.
  L(24,12+b,28,29,'#73513c',3);P('#35383a',[[20,3+b],[29,2+b],[31,10+b],[22,11+b]]);R(22,4+b,6,2,h);
  P(c,[[7,16+b],[22,15+b],[25,26],[20,32],[8,32],[4,26]]);
  E(13,10+b,6,5,h);P(ivory,[[7,8+b],[4,1+b],[10,5+b]]);P(ivory,[[18,5+b],[23,1+b],[20,10+b]]);
  R(8,10+b,3,1,d);R(15,10+b,3,1,d);R(11,13+b,5,2,a);R(12,14+b,1,2,ivory);R(15,14+b,1,2,ivory);
  P('#4a352b',[[10,16+b],[18,15+b],[21,30],[8,30]]);L(10,16+b,18,16+b,a,2);L(11,22,18,22,h);
  L(7,18+b,3,23+b,h,5);L(3,23+b,8,26,h,4);L(22,18+b,26,15+b,h,5);E(25,15+b,2,2,h);
  bootR9(q,6,31,7);bootR9(q,18,31,7);R(11,27,5,2,c);R(13,28,2,1,a);break;
 }
 case'drowned_crossbow':{
  // Low floating coat and a wide, horizontal pressure crossbow; algae trails behind the helm.
  P('#203b43',[[11,11+b],[22,12+b],[25,25],[27,31],[19,29],[15,35],[11,29],[5,32],[8,22]]);
  P(c,[[11,13+b],[20,13+b],[22,27],[16,30],[9,29]]);L(13,15+b,16,28,h,2);
  P(h,[[11,5+b],[19,4+b],[22,8+b],[21,12+b],[13,13+b],[9,10+b]]);R(10,6+b,12,2,'#33505b');eyes(13,9,'#d3eee2');
  L(21,8+b,25,16+b,'#65896c',2);L(23,13+b,26,22,'#8ca993');
  L(8,17+b,4,21+b,h,3);L(22,16+b,25,21+b,h,3);
  P('#27343a',[[1,19+b],[27,19+b],[30,22+b],[26,24+b],[2,23+b]]);R(4,20+b,23,2,a);
  L(5,16+b,5,27+b,h,2);L(25,16+b,25,27+b,h,2);L(5,16+b,25,27+b,ivory,.7);L(5,27+b,25,16+b,ivory,.7);
  R(13,17+b,3,12,'#403c31');R(14,18+b,1,8,'#b2a788');R(3,30-b,2,1,h);R(26,33-b,2,1,h);break;
 }
 case'pressure_croc':{
  // Massive armoured aquatic jaw, a raised pressure crest and short paddling feet.
  P(c,[[1,28+b],[5,18+b],[13,14+b],[21,17+b],[28,15+b],[31,20+b],[31,29],[22,30],[12,33],[4,32]]);
  P(h,[[7,20+b],[13,17+b],[22,21+b],[19,27],[8,29],[4,29]],null);
  for(const[x,y]of[[8,18],[13,15],[18,16]])P('#355654',[[x,y+b],[x+2,y-6+b],[x+5,y+b]]);
  P('#25474d',[[20,15+b],[23,9+b],[29,11+b],[31,18+b],[28,23+b],[20,22+b]]);
  P(h,[[22,16+b],[25,12+b],[29,14+b],[30,18+b],[24,19+b]],null);R(27,15+b,2,1,a);
  P('#162e33',[[21,24+b],[31,21+b],[30,28+b],[24,30+b],[20,28+b]]);P(ivory,[[22,25+b],[24,28+b],[25,24+b],[27,27+b],[29,23+b],[30,26+b]],null);
  for(const[x,y]of[[7,27],[16,27]]){P(c,[[x,y],[x+6,y],[x+5,34],[x-2,33]]);R(x,32,5,1,ivory)}
  for(const[x,y]of[[6,23],[10,22],[14,23],[9,27],[17,25]]){P('#466f69',[[x,y+b],[x+2,y-1+b],[x+4,y+1+b],[x+1,y+2+b]]);R(x+1,y+b,2,1,h)}
  L(2,28+b,7,28+b,a);break;
 }
 case'storm_shooter':{
  // A split rain cloak, reed hat and a long shoulder-mounted thunder tube.
  P('#2a3f4b',[[10,13+b],[22,13+b],[26,30],[20,28],[18,34],[14,28],[6,32]]);
  P(c,[[11,14+b],[17,15+b],[14,29],[8,30]],null);P(h,[[18,15+b],[22,14+b],[24,27],[20,26]],null);
  E(16,10+b,4,4,'#9aaeb0');P('#344452',[[4,8+b],[15,2+b],[27,8+b],[23,10+b],[8,10+b]]);L(6,8+b,25,8+b,h);R(13,2+b,2,3,a);eyes(13,10,ivory);
  L(7,18+b,19,20+b,h,3);L(22,17+b,25,18+b,c,3);
  P('#253340',[[13,17+b],[29,13+b],[31,17+b],[15,22+b]]);L(16,18+b,30,15+b,h,2);R(27,14+b,3,5,a);R(29,15+b,2,2,d);
  L(11,21+b,9,26,a);L(9,26,11,30,a);bootR9(q,10,31,5);bootR9(q,19,31,5);break;
 }
 case'lightning_plate':{
  // Narrow cage armour and an unmistakable lightning rod instead of a spear or hat.
  L(25,2,25,32,h,2);P(a,[[25,1],[21,7],[25,6],[22,12],[29,5],[25,6]],null);
  P('#323e48',[[8,14+b],[21,14+b],[24,27],[19,31],[8,30],[5,22]]);P(c,[[9,15+b],[20,15+b],[21,26],[10,26]]);
  for(const x of[10,14,18]){L(x,15+b,x,26,h);R(x,18+b,2,1,a)}
  P(h,[[8,7+b],[12,3+b],[18,3+b],[22,8+b],[19,13+b],[11,13+b]]);R(10,8+b,11,3,'#28343c');eyes(11,9,a);R(14,3+b,2,5,ivory);
  P(c,[[4,13+b],[9,12+b],[10,19+b],[4,22+b],[1,17+b]]);P(h,[[22,12+b],[27,14+b],[28,21+b],[23,20+b]]);
  P('#465567',[[1,22],[8,20],[9,29],[3,31]]);L(3,24,7,27,a);bootR9(q,8,31,6);bootR9(q,18,31,6);break;
 }
 case'conduction_spirit':{
  // Broken conductive rings surround a suspended diamond; no head, arms or robe.
  for(const[x,y,rx,ry]of[[16,18,11,13],[16,19,14,5]]){q.strokeStyle='#344f60';q.lineWidth=3;q.beginPath();q.ellipse(x,y+b,rx,ry,0,.25,5.6);q.stroke();q.strokeStyle=h;q.lineWidth=1;q.stroke()}
  P(c,[[16,6+b],[21,14+b],[19,22+b],[16,29+b],[12,22+b],[11,14+b]]);
  P('#c5e1df',[[16,9+b],[17,17+b],[14,23+b],[13,16+b]],null);R(17,17+b,2,2,a);
  for(const[x,y]of[[5,9],[26,23],[7,29]]){P(h,[[x,y+b],[x+3,y-3+b],[x+4,y+2+b],[x+1,y+4+b]]);R(x+1,y+b,1,1,ivory)}
  trim([[6,13+b],[10,18+b],[6,20+b],[12,24+b]],a);trim([[24,7+b],[22,11+b],[27,14+b],[23,18+b]],a);R(19,32-b,2,1,h);break;
 }
 case'bound_swordsman':{
  // A sideways duellist with a bound scabbard, raised blade and paper seals over the face.
  P('#322534',[[9,12+b],[20,13+b],[23,23+b],[19,29],[9,31],[6,23+b]]);
  P(c,[[11,14+b],[19,14+b],[19,27],[10,28]],null);L(11,15+b,18,23,h,2);R(9,23,12,2,'#31252d');
  E(14,8+b,4,4,'#9a8b91');P('#28232b',[[8,6+b],[12,1+b],[19,4+b],[20,10+b],[17,9+b],[10,9+b]]);R(12,6+b,3,7,ivory);R(13,7+b,1,4,a);R(17,8+b,2,1,'#dfa1b4');
  L(9,16+b,3,22+b,h,3);L(20,16+b,25,15+b,c,3);E(25,15+b,2,2,'#b2a2a1');
  L(25,14+b,30,3+b,ivory,2);L(23,14+b,28,16+b,a,2);L(5,18+b,4,31,'#3b2834',3);L(4,20,5,30,a);
  for(const[x,y]of[[4,21],[6,27],[20,25]]){R(x,y,3,4,ivory);R(x+1,y+1,1,2,a)}
  bootR9(q,5,31,6);bootR9(q,18,30,5);break;
 }
 case'shrine_attendant':{
  // Tall split ritual headdress, hanging seal sleeves and a small brazier held forward.
  P('#382431',[[9,14+b],[22,14+b],[26,32],[19,31],[16,35],[11,32],[5,32]]);
  P(c,[[12,14+b],[19,14+b],[22,31],[15,33],[9,30]],null);L(12,15+b,16,21,a);L(20,15+b,16,21,ivory);
  P('#362330',[[9,9+b],[10,2+b],[15,4+b],[16,0+b],[22,3+b],[23,11+b]]);R(11,5+b,3,6,h);R(19,4+b,2,6,h);
  R(12,10+b,9,4,'#b3a29d');eyes(13,11,'#59283f');R(15,7+b,3,10,ivory);R(16,8+b,1,6,a);
  P(h,[[8,14+b],[4,18+b],[2,29],[8,27],[12,18+b]]);P(c,[[22,14+b],[29,19+b],[27,29],[21,25]]);
  for(const x of[5,23]){R(x,21+b,3,7,ivory);R(x+1,22+b,1,4,a)}
  P('#745347',[[18,21+b],[28,21+b],[26,27+b],[20,27+b]]);R(19,21+b,8,1,ivory);P(a,[[22,21+b],[20,17+b],[23,18+b],[25,14+b],[26,21+b]],null);break;
 }
 case'blood_wraith':{
  // An open, disembodied seal with ragged streaming ribbons and a single buried face.
  P('#422633',[[16,2+b],[25,8+b],[26,17+b],[21,24+b],[25,32],[16,28],[8,35],[10,23+b],[5,17+b],[7,8+b]]);
  P(c,[[16,5+b],[22,9+b],[22,17+b],[16,24+b],[10,17+b],[10,9+b]]);
  P('#201821',[[12,10+b],[20,10+b],[21,16+b],[17,21+b],[12,17+b]]);R(12,13+b,2,1,a);R(18,13+b,2,1,a);
  L(16,7+b,16,11+b,h,2);L(11,17+b,15,20+b,h);L(20,17+b,17,20+b,h);
  P(h,[[8,15+b],[2,18+b],[1,27],[5,24],[8,30],[9,22+b]]);P(c,[[24,15+b],[30,18+b],[31,31],[26,27],[24,32],[23,22+b]]);
  R(16,24+b,2,5,a);R(4,31-b,1,2,a);R(28,10-b,1,2,h);break;
 }
 case'stone_boxer':{
  // Wide crouched stance, tiny stone head and two oversized, separately faceted fists.
  P(c,[[10,14+b],[20,14+b],[23,25],[18,28],[11,28],[7,24]]);P(h,[[11,15+b],[16,16+b],[15,25],[10,25]],null);
  P(h,[[12,5+b],[19,4+b],[22,8+b],[19,12+b],[12,12+b],[10,9+b]]);eyes(12,8,'#6a5137');L(13,11+b,19,11+b,a);
  P('#5e5a4e',[[1,15+b],[8,12+b],[12,18+b],[9,25+b],[2,25+b],[0,20+b]]);P(h,[[2,16+b],[7,14+b],[9,19+b],[7,22+b],[2,22+b]],null);
  P(c,[[22,13+b],[29,12+b],[31,18+b],[29,24+b],[22,24+b],[20,18+b]]);P(h,[[23,14+b],[28,14+b],[29,17+b],[25,20+b]],null);
  L(3,18+b,8,18+b,a);L(23,17+b,28,17+b,a);L(12,27,6,31,c,5);L(19,27,24,31,c,5);bootR9(q,2,31,9);bootR9(q,22,31,8);facets([[12,19],[17,22],[5,28],[23,28]]);break;
 }
 case'collapse_plate':{
  // Fallen masonry rebuilt as an uneven walking bastion, without a golem's round head.
  P('#403f37',[[5,9+b],[14,6+b],[18,10+b],[26,8+b],[29,28],[23,33],[9,33],[2,27]]);
  P(c,[[6,11+b],[13,9+b],[16,13+b],[25,10+b],[26,28],[21,30],[9,29],[5,25]]);
  P(h,[[5,10+b],[11,7+b],[15,10+b],[11,14+b],[5,14+b]],null);P(h,[[19,9+b],[25,8+b],[28,12+b],[23,15+b],[18,14+b]],null);
  R(10,15+b,13,3,d);R(11,16+b,3,1,a);R(19,16+b,3,1,a);
  for(const y of[20,25]){L(7,y,24,y-1,'#45483e');L(7,y-1,15,y-2,h)}
  trim([[17,11+b],[15,21],[19,25],[17,29]],'#373c37');
  P(h,[[0,18+b],[5,16+b],[7,28],[2,31],[0,27]]);P(c,[[27,16+b],[31,18+b],[31,29],[27,30],[25,25]]);
  R(7,31,7,4,'#353a33');R(21,31,7,4,'#353a33');facets([[9,22],[22,27],[2,21]]);break;
 }
 case'earth_beast':{
  // Burrowing tusked quadruped: low belly, huge digging paws, mineral plates down the spine.
  P('#37352c',[[1,24+b],[5,16+b],[13,11+b],[23,14+b],[29,20+b],[30,29],[23,33],[9,33],[3,30]]);
  P(c,[[4,24+b],[7,17+b],[14,14+b],[22,16+b],[26,23+b],[24,29],[8,30]],null);
  for(const[x,y]of[[6,19],[12,14],[18,16]]){P(h,[[x,y+b],[x+2,y-5+b],[x+6,y-1+b],[x+5,y+3+b]]);L(x+2,y-3+b,x+4,y,a)}
  P(h,[[19,18+b],[24,15+b],[29,20+b],[30,25+b],[26,28+b],[19,25+b]]);R(26,20+b,2,1,'#d7bd7c');R(28,24+b,3,2,d);
  P(ivory,[[20,24+b],[17,29+b],[23,27+b]]);P(ivory,[[28,25+b],[30,30+b],[26,28+b]]);
  for(const[x,y]of[[4,26],[18,28]]){P(h,[[x,y],[x+7,y-1],[x+8,33],[x-1,34]]);for(let i=0;i<3;i++)L(x+i*2,31,x+i*2-1,34,ivory)}
  L(2,25+b,6,29,c,3);facets([[9,23],[13,25],[16,20]]);break;
 }
 case'reflection_duelist':{
  // An asymmetric mirrored fencer, polished mask and backwards blade silhouette.
  P('#28343f',[[11,12+b],[20,14+b],[23,25],[18,29],[9,29],[6,20+b]]);
  P(c,[[11,13+b],[17,16+b],[16,26],[9,26]],null);P(h,[[18,16+b],[21,17+b],[22,25],[18,27]],null);
  P('#bac8cb',[[12,4+b],[18,3+b],[22,7+b],[19,12+b],[13,12+b],[10,8+b]]);P(c,[[18,4+b],[21,7+b],[18,11+b],[16,10+b]],null);R(12,8+b,3,1,d);R(18,8+b,2,1,d);L(16,5+b,15,11+b,ivory);
  L(9,17+b,4,23+b,h,3);L(21,17+b,26,20+b,c,3);E(26,20+b,2,2,'#bdc7c5');
  P(ivory,[[28,4+b],[30,5+b],[27,20+b],[25,19+b]]);L(23,18+b,29,20+b,a,2);
  L(12,28,7,32,c,4);L(18,28,22,31,h,4);bootR9(q,4,31,6);bootR9(q,20,31,6);
  P('#7794a0',[[1,10-b],[5,8-b],[5,13-b],[2,15-b]]);L(2,11-b,4,10-b,ivory);break;
 }
 case'mirror_handmaid':{
  // A pinned bun and long narrow skirt; a large hand mirror balances the extended sleeve.
  L(26,17+b,26,30,a,2);P('#40505c',[[23,7+b],[29,7+b],[31,12+b],[29,19+b],[23,19+b],[21,13+b]]);
  P('#b6d2d4',[[24,9+b],[28,9+b],[29,13+b],[27,17+b],[24,16+b],[23,12+b]]);L(25,10+b,27,15+b,ivory);
  P('#45354a',[[10,13+b],[19,13+b],[21,24],[24,33],[17,35],[7,33],[9,24]]);P(c,[[11,14+b],[18,14+b],[18,24],[21,32],[12,32],[9,31]],null);
  P(h,[[11,17+b],[14,20+b],[12,30],[10,31]],null);L(12,15+b,17,20+b,ivory);R(10,21,10,2,a);
  E(14,9+b,4,4,'#d3bcba');P('#302c37',[[9,7+b],[11,3+b],[16,3+b],[19,7+b],[16,6+b],[12,8+b]],null);E(17,3+b,3,2,'#423445');L(9,4+b,22,3+b,a);eyes(11,10,'#563f51');
  P(h,[[9,14+b],[5,16+b],[3,25],[8,26],[11,19+b]]);P(c,[[19,14+b],[25,20+b],[26,25],[20,23],[17,18+b]]);E(25,21+b,1.5,2,'#d3bcba');R(15,26,2,6,a);break;
 }
 case'shard_wraith':{
  // Faceted disconnected shards, arranged like a shattered mask and jagged wings.
  const pieces=[[[15,3+b],[21,7+b],[17,13+b],[11,9+b]],[[9,10+b],[3,6+b],[1,17+b],[8,20+b]],[[23,10+b],[29,5+b],[31,16+b],[25,20+b]],[[10,22+b],[4,25+b],[7,33],[13,28]],[[22,22+b],[29,25+b],[25,34],[19,28]],[[16,17+b],[21,23+b],[17,32],[12,26]]];
  for(const pts of pieces){P(c,pts);L(...pts[0],...pts[1],ivory);P(h,[pts[0],pts[1],[(pts[0][0]+pts[2][0])/2,(pts[0][1]+pts[2][1])/2]],null)}
  R(12,9+b,2,1,'#e5f3e9');R(18,9+b,2,1,'#e5f3e9');L(14,14+b,18,14+b,a);R(2,28-b,2,2,h);R(28,1+b,1,2,a);break;
 }
 case'rotted_spear':{
  // Decayed lamellar armour with exposed ribs, torn cloak and a very long held lance.
  L(28,8,27,35,'#6a5442',2);P('#b8b7a5',[[28,1],[24,9],[30,7]]);L(27,9,25,14,a);
  P('#342c34',[[5,14+b],[13,11+b],[22,14+b],[25,29],[20,27],[19,34],[12,28],[4,32],[7,23]]);
  P(c,[[10,14+b],[20,14+b],[21,27],[10,27]]);for(const y of[16,20,24])L(10,y+b,20,y+b,h,2);
  P(h,[[10,5+b],[18,3+b],[23,7+b],[21,10+b],[10,10+b],[8,8+b]]);P('#979b80',[[12,9+b],[20,9+b],[19,14+b],[13,13+b]]);eyes(12,10,'#e3ca85');R(15,13+b,4,1,d);
  P('#27262d',[[12,18+b],[18,18+b],[18,25],[12,25]]);for(const y of[20,23])L(13,y,17,y,ivory);
  P(c,[[7,15+b],[10,17+b],[7,25],[3,25],[2,20+b]]);L(21,17+b,26,23,h,4);E(27,23,2,2,'#999b82');bootR9(q,8,31,6);bootR9(q,18,31,6);R(7,27,2,2,'#598071');break;
 }
 case'grave_priest':{
  // A funeral crown, weighted mourning drape, soul lantern and crooked staff.
  L(3,10+b,3,33,'#806852',2);P(a,[[3,3+b],[6,8+b],[3,13+b],[0,8+b]]);R(2,6+b,2,4,'#d4cfad');
  P('#312a36',[[11,12+b],[21,12+b],[27,30],[21,32],[16,35],[10,31],[6,30]]);P(c,[[12,14+b],[20,14+b],[22,29],[17,32],[10,29]],null);
  P('#40323c',[[10,9+b],[10,2+b],[14,4+b],[16,1+b],[20,4+b],[22,3+b],[22,10+b]]);L(11,6+b,21,6+b,a);R(15,2+b,2,4,ivory);
  R(12,10+b,8,4,'#a1a997');eyes(12,11,'#474445');R(15,7+b,2,14,ivory);R(15,12+b,1,6,a);
  P(h,[[9,14+b],[5,17+b],[4,25],[9,26],[12,19+b]]);P(c,[[21,14+b],[26,18+b],[29,26],[23,27],[20,19+b]]);
  R(22,22+b,7,9,d);R(23,23+b,5,6,'#477068');R(25,24+b,1,4,'#bed9b5');R(22,22+b,7,1,a);R(22,30+b,7,1,a);L(24,18+b,26,22+b,ivory);L(13,27,12,32,h);break;
 }
 case'soul_hunter':{
  // Lean, forward leaning masked hunter with a soul net and a hooked knife.
  P('#292934',[[5,13+b],[14,7+b],[22,11+b],[24,19+b],[19,22+b],[20,30],[12,32],[9,24],[2,27],[4,20+b]]);
  P(c,[[9,14+b],[17,13+b],[20,20+b],[15,26],[10,25],[7,20+b]]);P(h,[[12,15+b],[15,17+b],[13,24],[10,23]],null);
  P('#a2a7a1',[[10,7+b],[16,5+b],[21,9+b],[18,14+b],[12,13+b]]);P('#252833',[[8,6+b],[13,2+b],[21,6+b],[23,10+b],[17,8+b],[12,9+b]],null);R(14,10+b,2,1,a);R(19,10+b,1,1,a);R(15,13+b,3,1,d);
  L(8,18+b,3,21+b,h,3);L(20,17+b,27,20+b,c,3);L(28,17+b,26,27,ivory,2);L(26,27,23,25,ivory,2);
  E(3,25,3,5,'#3d4652');L(1,23,5,28,a);L(1,27,5,24,h);L(3,20,4,22,ivory);
  bootR9(q,8,31,5);bootR9(q,19,30,6);P(h,[[22,13+b],[29,10-b],[26,17+b],[31,17+b],[25,21+b]],null);break;
 }
 case'moonfire_archer':{
  // A red hood remains; petal-like metal shoulders, a crescent bow and a furnace torso are new.
  P('#532d25',[[6,14+b],[10,10+b],[21,11+b],[24,17+b],[21,28],[10,31],[6,23]]);
  P(c,[[10,14+b],[19,14+b],[20,26],[11,27],[8,21+b]]);P(h,[[10,15+b],[14,16+b],[13,24],[10,23]],null);
  P('#712e22',[[8,8+b],[11,2+b],[18,1+b],[23,7+b],[21,12+b],[11,12+b]]);P('#bf7548',[[12,8+b],[19,7+b],[20,10+b],[16,14+b],[12,12+b]]);R(13,10+b,2,1,ivory);R(18,9+b,2,1,a);
  for(const pts of[[[7,13+b],[2,9+b],[3,18+b],[8,20+b]],[[21,13+b],[24,8+b],[27,16+b],[23,21+b]]]){P(h,pts);L(...pts[0],...pts[1],a)}
  R(12,18+b,7,6,'#4b2521');R(14,19+b,3,4,a);R(15,20+b,1,2,ivory);L(9,25,20,25,'#73523a',2);
  P('#e29445',[[26,3],[30,9],[31,22],[27,31],[25,30],[28,20],[28,11],[24,5]]);L(26,4,26,30,'#f1d5a0',.7);L(8,19+b,23,19+b,h,3);L(16,18+b,30,18+b,ivory);P(a,[[30,18+b],[27,16+b],[27,20+b]],null);
  bootR9(q,6,31,7);bootR9(q,18,30,6);R(7,27,3,3,h);R(20,26,2,4,h);break;
 }
 case'ash_watcher':{
  // A hovering charred eye inside a broken ash halo, carried by smoky streamers rather than wings.
  q.strokeStyle='#5b514d';q.lineWidth=3;q.beginPath();q.arc(16,14+b,11,.2,5.3);q.stroke();q.strokeStyle=h;q.lineWidth=1;q.stroke();
  P('#342c2b',[[13,8+b],[20,7+b],[25,13+b],[23,20+b],[18,24+b],[9,21+b],[6,16+b]]);
  P(c,[[12,10+b],[19,9+b],[22,14+b],[19,21+b],[11,19+b],[8,15+b]],null);
  P('#d2b895',[[8,15+b],[14,11+b],[21,12+b],[24,15+b],[19,19+b],[12,18+b]]);E(17,15+b,3,3,'#654335');R(17,13+b,1,5,a);R(18,14+b,1,1,ivory);
  P(h,[[11,22+b],[9,28],[4,32],[10,31],[15,25+b]],null);P(c,[[20,23+b],[25,29],[22,34],[28,31],[26,26+b]],null);R(5,5-b,2,2,h);R(28,19+b,2,2,c);R(13,33-b,1,1,a);break;
 }
 case'lava_salamander':{
  // A tall frilled head, black lava scales and a curled tail with exposed molten seams.
  P('#372521',[[1,30],[5,21+b],[12,17+b],[18,20+b],[20,14+b],[26,10+b],[31,15+b],[30,24+b],[24,29],[13,32],[5,33]]);
  P(c,[[3,29],[8,23+b],[13,21+b],[19,24+b],[23,19+b],[28,15+b],[29,22+b],[23,27],[12,29],[6,30]],null);
  for(const pts of[[[19,15+b],[17,8+b],[22,11+b]],[[22,12+b],[24,4+b],[26,11+b]],[[27,12+b],[31,7+b],[30,16+b]],[[11,20+b],[9,13+b],[15,17+b]]])P(h,pts);
  P('#452c29',[[22,15+b],[27,13+b],[30,18+b],[27,23+b],[22,22+b]]);R(26,16+b,2,1,ivory);L(25,21+b,30,20+b,a);
  for(const pts of[[[6,26],[10,25],[12,28]],[[14,22+b],[16,25],[21,24]],[[23,15+b],[24,18+b],[28,18+b]]])trim(pts,a);
  for(const[x,y]of[[9,28],[22,26]]){P(h,[[x,y],[x+4,y],[x+6,32],[x-1,33]]);L(x,32,x+4,32,ivory)}
  P(a,[[3,25+b],[1,21-b],[4,22+b],[5,17+b],[7,24+b]],null);R(13,11-b,1,2,a);break;
 }
 case'shackle_doll':{
  // Articulated hanging puppet inside two heavy cuffs, chains binding the uneven legs.
  P('#2c3031',[[11,12+b],[21,12+b],[24,27],[18,30],[9,27],[7,19+b]]);
  R(12,14+b,8,12,c);for(const y of[15,19,23])R(12,y+b,8,1,h);R(15,17+b,2,6,d);
  P(h,[[12,4+b],[20,4+b],[23,8+b],[21,12+b],[12,12+b],[10,8+b]]);R(11,7+b,11,3,'#343838');eyes(12,8,a);R(16,4+b,1,3,ivory);
  L(10,16+b,5,23+b,c,4);L(22,16+b,27,23+b,c,4);
  for(const x of[2,24]){R(x,21+b,7,6,d);R(x+1,22+b,5,4,h);R(x+2,23+b,3,2,c);link(x+2,28-b)}
  L(13,27,10,33,c,4);L(19,27,22,32,c,4);bootR9(q,7,32,6);bootR9(q,20,31,6);for(const[x,y]of[[10,27],[13,29],[16,30],[19,29],[22,27]])link(x,y);
  R(9,14+b,2,2,a);R(21,14+b,2,2,a);break;
 }
 case'hook_prisoner':{
  // Emaciated prisoner with exposed bones, a striped rag and one exaggerated hooked arm.
  P('#493631',[[10,14+b],[18,13+b],[21,22+b],[17,27],[9,27],[7,20+b]]);P(c,[[11,15+b],[18,15+b],[18,24],[10,24]],null);
  for(const y of[17,20,23])L(10,y+b,18,y+b,h);E(14,8+b,4,5,'#a8a18b');P('#3b322c',[[10,6+b],[12,3+b],[18,4+b],[19,7+b]],null);eyes(11,8,'#be7961');R(13,11+b,4,1,d);L(12,13+b,13,17+b,ivory);
  L(9,17+b,4,20+b,'#938d7b',3);L(4,20+b,3,27,h,2);L(19,17+b,25,22+b,h,3);E(25,22+b,2,2,'#b0a38d');
  L(26,22+b,29,13+b,'#afa991',2);L(29,13+b,26,11+b,'#afa991',2);L(26,11+b,24,15+b,'#afa991',2);
  for(const[x,y]of[[2,25],[3,28],[5,30]])link(x,y);L(12,26,8,32,h,3);L(17,26,21,31,c,3);bootR9(q,5,32,6);bootR9(q,19,31,6);R(10,22,2,4,'#44342d');break;
 }
 case'breach_plate':{
  // A helmet beneath battlement shoulders, a massive tower shield and a ram-shaped mace.
  P('#423b30',[[8,13+b],[23,13+b],[27,25],[22,31],[10,31],[6,24]]);P(c,[[10,15+b],[22,15+b],[23,27],[11,27]]);
  P(h,[[8,6+b],[13,3+b],[20,4+b],[24,8+b],[22,13+b],[10,13+b]]);R(10,8+b,12,3,d);eyes(12,9,ivory);R(16,4+b,2,4,a);
  for(const pts of[[[3,10+b],[7,10+b],[7,13+b],[11,13+b],[10,19+b],[3,18+b]],[[21,13+b],[25,13+b],[25,10+b],[29,10+b],[29,18+b],[23,19+b]]])P(h,pts);
  P('#514b3e',[[1,19+b],[10,17+b],[12,30],[7,34],[1,32]]);P(c,[[3,20+b],[8,19+b],[10,29],[6,32],[3,30]],null);L(4,22+b,8,22+b,a,2);L(6,21+b,6,30,a,2);
  L(26,20+b,27,33,'#69543b',2);P('#b0a18a',[[23,18+b],[24,12+b],[30,12+b],[31,18+b]]);R(25,13+b,4,2,ivory);E(26,23+b,2,2,h);
  for(const y of[18,22,26])L(13,y+b,21,y+b,h);bootR9(q,11,31,6);bootR9(q,20,31,6);break;
 }
 case'wall_gunner':{
  // A squat cannon turret on jointed feet, with crenellations and a forward-facing round muzzle.
  P('#333b3c',[[5,13+b],[25,13+b],[28,28],[23,32],[8,32],[3,27]]);P(c,[[7,14+b],[23,14+b],[24,28],[9,29],[6,25]]);
  for(const x of[6,13,20]){R(x,5+b,5,10,d);R(x+1,6+b,3,8,h)}R(6,11+b,19,3,c);R(7,11+b,17,1,a);
  R(10,15+b,11,4,'#333534');eyes(11,16,'#d5b98a');
  P('#454b4c',[[10,19+b],[22,19+b],[27,23+b],[24,29],[10,27]]);P(h,[[11,20+b],[21,20+b],[24,23+b],[12,24+b]],null);
  E(25,25+b,5,5,'#928978');E(25,25+b,3,3,'#292e30');R(24,23+b,2,1,'#131d23');
  P(h,[[2,20+b],[7,18+b],[8,27],[4,30],[1,27]]);L(3,22,5,26,a);bootR9(q,7,31,7);bootR9(q,20,31,7);R(10,28,4,3,h);R(21,29,3,2,h);break;
 }
 }
}
function monsterCanvas(m,frame=0){
 if(m?.storyPhase992===1)return friendCanvas(true,false,frame);
 if(m?.palaceActor105||monsterSpeciesName(m)==='용궁 정원사'){const key='palace:'+(m.palaceActor105||'gardener')+':'+!!(m.palaceLotus105&&palaceWet(m))+':'+heldWeaponKey1001(m.weapon)+':'+frame;if(ACTOR_CACHE.has(key))return ACTOR_CACHE.get(key);const[c,q]=actorSpriteCanvas(m,m.palaceActor105==='king'?PALACE_KING_SPRITE.resolution:1);drawPalaceActor(q,m,frame);ACTOR_CACHE.set(key,c);return c;}
 if(m?.citadelActor105){const key='citadel:'+m.name+':'+frame;if(ACTOR_CACHE.has(key))return ACTOR_CACHE.get(key);const[c,q]=actorSpriteCanvas();drawCitadelActor(q,m,frame);ACTOR_CACHE.set(key,c);return c;}
 if(m?.branchBoss105||m?.treeMimic105||m?.hiveTree105||m?.beeSwarm105){const dormant=m.treeMimic105&&m.mimicDormant105!==false,disguise=dormant?[state?.branchContext105?.id||'stockade',m.x,m.y,branchHeight(m.x,m.y)].join(':'):'awake',key='mountain:'+m.name+':'+dormant+':'+disguise+':'+frame;if(ACTOR_CACHE.has(key))return ACTOR_CACHE.get(key);const[c,q]=actorSpriteCanvas();q.translate(0,4);drawMountainActor(q,m,frame);ACTOR_CACHE.set(key,c);return c;}
 const source=m?.martialActor105?ACTOR_SPEC['문하생']:m?.combatFixture54==='core'?{a:'thought_core',c:'#382840',h:m.color,ac:'#fff1ce'}:m?.combatFixture54==='silk'?{a:'silk_mirror'}:ACTOR_SPEC[m?.name]||ACTOR_SPEC[m?.spriteSpecies105]||ACTOR_SPEC[monsterSpeciesName(m)]||genericSpec(m),sp=m?.shopPortrait58===2?{...ACTOR_SPEC['구미호'],c:'#305879',h:'#8bc6e0',ac:'#dbf3fa'}:source,a=sp.a,revivePhase=m?.revivePhase57||'normal',key=`r9|${m?.name||a}|${a}|${m?.shopPortrait58??''}|${m?.silkMirrorColor54||''}|${revivePhase}|${m.martialActor105?[m.dojoRank105,m.dojoStyle105,JSON.stringify(m.dojoLook105||{}),m.weapon?.name||'fist',m.armor?.name||'',m.cloak?.name||''].join(':'):''}|${frame}`;if(ACTOR_CACHE.has(key))return ACTOR_CACHE.get(key);const[c,q]=actorSpriteCanvas(m),b=frame?1:0;q.clearRect(0,0,32,36);
 const hi=sp.h, base=sp.c, ac=sp.ac;
 switch(a){ case'branch':{drawBranchCreature(q,m,frame,sp);break;}case'dojo':{drawDojoActor(q,m,frame);break;
 }case'thought_core':{
 shadow1012(q,16,33,23);q.fillStyle='#30243c';q.fillRect(7,28,18,5);q.fillStyle='#ad895d';q.fillRect(5,29,22,2);q.strokeStyle=sp.h;q.lineWidth=1;q.beginPath();q.ellipse(16,19,12,5,frame?.35:-.35,0,Math.PI*2);q.stroke();pR9(q,'#312137',[[16,2+b],[24,13+b],[22,24+b],[16,29+b],[10,24+b],[8,13+b]]);pR9(q,sp.h,[[16,5+b],[21,14+b],[19,23+b],[16,26+b],[12,21+b],[11,14+b]]);pR9(q,'#fff0c9',[[16,8+b],[18,15+b],[16,22+b],[14,15+b]]);q.fillStyle='#fff6de';q.fillRect(4,11+b,2,2);q.fillRect(26,21-b,2,2);break;
 }case'silk_mirror':{
  drawSharedProp(q,TT.MIRROR,0,4,2,0,0,true,m.silkMirrorColor54||'red');break}

  case'merchant_ledger':case'merchant_fence':case'merchant_porter':{
   const porter=a==='merchant_porter',fence=a==='merchant_fence';shadow1012(q,16,33,25);
   if(porter){pR9(q,'#3e3025',[[1,10],[9,7],[12,11],[11,31],[2,31]]);q.fillStyle='#896c46';q.fillRect(2,12,8,2);q.fillRect(2,24,8,2);lR9(q,3,11,10,29,'#b59a68',1)}
   pR9(q,base,[[9,14+b],[22,14+b],[27,24+b],[24,32],[7,32],[5,24+b]]);pR9(q,hi,[[10,16+b],[15,18+b],[13,30],[8,29]]);pR9(q,'#201d19',[[20,17+b],[24,21+b],[23,31],[18,31]],null);
   eR9(q,16,9+b,5,5,porter?'#87956f':'#bc9c7d');eyePairR9(q,14,18,10+b,'#2a2119');
   if(porter){pR9(q,ac,[[11,6+b],[9,0],[14,5+b]]);pR9(q,ac,[[20,5+b],[24,1],[22,8+b]]);q.fillStyle='#e3d7b3';q.fillRect(14,13+b,2,2);q.fillRect(18,13+b,2,2)}
   else{pR9(q,fence?'#292b23':'#202c2a',[[10,7+b],[11,2+b],[21,2+b],[23,7+b]],null);lR9(q,fence?8:5,7+b,fence?25:28,7+b,hi,2);if(fence){pR9(q,'#444a36',[[11,12+b],[22,12+b],[20,16+b],[12,16+b]],null)}else{lR9(q,12,10+b,20,10+b,'#a69872',1);q.strokeStyle='#a69872';q.strokeRect(12,9+b,3,3);q.strokeRect(17,9+b,3,3)}}
   lR9(q,8,23,24,23,ac,2);lR9(q,17,23,19,31,hi,1);bootR9(q,9,31,5);bootR9(q,19,31,5);
   if(!fence&&!porter){pR9(q,'#513624',[[21,18],[30,19],[29,30],[21,29]]);q.fillStyle='#d9cba1';q.fillRect(22,20,6,8);for(let y=21;y<28;y+=2)lR9(q,23,y,27,y,'#827453',1);lR9(q,7,19,3,10,'#c8b283',1)}
   if(fence){eR9(q,26,27,4,5,'#8b7049');lR9(q,23,22,29,22,ac,1);q.fillStyle='#ccb77d';q.fillRect(5,24,2,2);q.fillRect(8,25,2,2)}
   break;
  }
  case'rat':{
 shadow1012(q,16,32,27);q.strokeStyle='#a16c61';q.lineWidth=1.5;q.beginPath();q.moveTo(9,27);q.bezierCurveTo(0,31,0,22,3,20);q.stroke();
 pR9(q,base,[[4,26],[5,21+b],[9,17+b],[17,17+b],[23,20+b],[26,26],[20,30],[8,30]]);pR9(q,hi,[[6,22+b],[10,18+b],[16,19+b],[19,22+b],[14,24+b],[8,24+b]],null);
 pR9(q,'#403c38',[[7,26],[17,26],[23,23],[24,28],[18,30],[8,29]],null);
 pR9(q,hi,[[19,19+b],[23,16+b],[27,19+b],[31,24+b],[28,26+b],[20,25+b]]);eR9(q,22,16+b,3.2,3.8,base);eR9(q,22,16+b,1.8,2.3,'#c38c7d',null);eR9(q,27,17+b,2,2.7,base);eye1012(q,26,21+b,'#ec9c74');q.fillStyle='#fff1c8';q.fillRect(26,20+b,1,1);eR9(q,30,24+b,1.2,.9,'#efbbaa',null);
 for(const [x,y]of[[10,21],[13,20],[16,22],[8,24],[18,24]])lR9(q,x,y+b,x+2,y-1+b,base,.7);
 for(const x of[10,20]){lR9(q,x,28,x-1,31,'#ad8070',2);lR9(q,x-2,31,x+2,31,'#dac0a0',.7)}for(const y of[22,25])lR9(q,28,24+b,32,y+b,'#d5c6b1',.5);
break;}
  case'drunk':{shadow1012(q,15,33,21);pR9(q,base,[[6,17+b],[13,13+b],[22,16+b],[28,29+b],[19,31+b],[12,28+b],[4,26+b]]);eR9(q,15,11+b,5,5,'#bd9679');pR9(q,'#3b2921',[[9,10+b],[11,5+b],[18,4+b],[22,8+b],[20,10+b]],null);eyePairR9(q,13,17,11+b,'#f0d7a2');pR9(q,hi,[[6,18+b],[1,21+b],[4,28+b],[10,25+b]],null);lR9(q,22,18+b,29,29,'#8b5d3d',3);eR9(q,28,29,3,3,'#5a3023');q.fillStyle=ac;q.fillRect(5,20+b,3,5);bootR9(q,10,29,5);bootR9(q,20,29,5);break}
  case'inn_guard':{shadow1012(q,16,33,23);pR9(q,base,[[7,15+b],[11,12+b],[22,12+b],[26,17+b],[25,31+b],[8,31+b]]);pR9(q,hi,[[5,16+b],[10,12+b],[11,22+b],[7,27+b],[3,24+b]],null);eR9(q,16,9+b,5,4,'#b99c79');pR9(q,'#30271f',[[7,7+b],[16,2+b],[25,7+b],[23,9+b],[9,9+b]],null);lR9(q,27,4+b,27,34,'#7a5535',2);pR9(q,ac,[[27,2+b],[23,9+b],[31,9+b]],null);q.fillStyle=ac;q.fillRect(11,16+b,11,2);bootR9(q,9,30,6);bootR9(q,19,30,6);break}
  case'thief':{shadow1012(q,16,33,23);pR9(q,'#211b22',[[16,3+b],[26,10+b],[24,16+b],[29,23+b],[22,22+b],[20,31+b],[8,31+b],[11,21+b],[4,23+b],[8,13+b]]);pR9(q,base,[[10,14+b],[16,10+b],[22,14+b],[20,24+b],[12,24+b]]);pR9(q,'#8f746d',[[12,11+b],[16,8+b],[20,11+b],[19,15+b],[13,15+b]]);eyePairR9(q,14,18,12+b,'#e8c0a0');lR9(q,21,20+b,30,27,ac,2);pR9(q,ac,[[30,27],[25,26],[28,22]],null);bootR9(q,8,30,5);bootR9(q,18,30,5);break}
  case'servant':{shadow1012(q,16,33,18);eR9(q,16,8+b,4.5,4.5,'#b99a78');pR9(q,'#382b21',[[10,7+b],[12,2+b],[20,2+b],[22,7+b]],null);pR9(q,base,[[11,13+b],[21,13+b],[24,31+b],[8,31+b]]);pR9(q,hi,[[11,17+b],[21,17+b],[20,29+b],[12,29+b]],null);lR9(q,4,20+b,13,20+b,'#8b6d49',2);lR9(q,3,18+b,13,18+b,'#b39066',1);eR9(q,3,17+b,2,1,'#efe0b6',null);q.fillStyle=ac;q.fillRect(15,15+b,2,12);bootR9(q,10,30,5);bootR9(q,18,30,5);
   if(sp.waterServant1012){
    // Original servant body, tray, face and boots remain; palace ornaments sit above the cloth.
    pR9(q,'#2c565d',[[10,6+b],[11,2+b],[14,4+b],[16,0+b],[18,4+b],[21,2+b],[22,6+b]],null);
    lR9(q,11,6+b,21,6+b,'#a6c1ab',1);eR9(q,16,4+b,1.3,1.3,'#efddae',null);
    lR9(q,11,14+b,16,17+b,'#779e94',1);lR9(q,21,14+b,16,17+b,'#779e94',1);
    for(const[x,y]of[[12,14],[14,15],[18,15],[20,14]]){q.fillStyle='#e5d5ad';q.fillRect(x,y+b,1,1)}
    pR9(q,'#477e81',[[21,17+b],[25,18+b],[26,23+b],[24,29+b],[22,27+b]],null);
    lR9(q,23,19+b,24,26+b,'#a6c3ac',1);eR9(q,24,27+b,1,1,'#e5d5ad',null);
    lR9(q,12,25+b,15,27+b,'#648e83',1);lR9(q,15,27+b,19,25+b,'#648e83',1);
    lR9(q,12,28+b,15,29+b,'#a1b49c',1);lR9(q,15,29+b,19,28+b,'#a1b49c',1);
    eR9(q,3,16+b,1,1,'#a9d3cf',null);
   }break}
  case'spider':{shadow1012(q,16,33,28);for(const [x1,y1,x2,y2]of[[11,19,1,10],[10,22,0,19],[11,26,1,32],[21,19,31,10],[22,22,32,19],[21,26,31,32],[13,18,5,4],[19,18,27,4]])lR9(q,x1,y1+b,x2,y2+b,hi,2);eR9(q,16,22+b,10,8,base);eR9(q,16,13+b,6,5,hi);for(const[x,y]of[[13,11],[17,10],[20,13],[15,15]])eye1012(q,x,y+b,ac);break}
  case'reaper':{shadow1012(q,16,33,22);pR9(q,base,[[8,15+b],[16,9+b],[24,15+b],[27,30+b],[20,28+b],[16,34],[12,28+b],[5,30+b]]);eR9(q,16,11+b,4,4,'#7f9382');pR9(q,'#27372e',[[5,9+b],[16,4+b],[27,9+b],[23,11+b],[9,11+b]],null);eyePairR9(q,14,18,11+b,ac);lR9(q,25,29,29,8,'#b7c5aa',2);pR9(q,'#cdd7bd',[[29,7],[24,9],[29,11],[32,10]],null);q.globalAlpha=.35;glowR9(q,16,19,10,'rgba(160,210,170,.45)');q.globalAlpha=1;break}
  case'flower':{shadow1012(q,16,33,20);lR9(q,16,31,16,16,base,3);for(const [x,y,rx,ry]of[[16,8,5,7],[8,14,7,5],[24,14,7,5],[10,22,6,5],[22,22,6,5]])eR9(q,x,y+b,rx,ry,hi);eR9(q,16,15+b,6,6,ac);eyePairR9(q,14,18,15+b,'#3b2636');for(const x of[8,12,20,24])lR9(q,16,29,x,34,'#3f5d34',2);break}
  case'snake':{
 shadow1012(q,16,33,27);q.lineCap='round';q.strokeStyle=ACTOR_OUTLINE;q.lineWidth=8;q.beginPath();q.moveTo(3,30);q.bezierCurveTo(30,36,27,25,15,27);q.bezierCurveTo(7,28,12,20,22,19+b);q.stroke();q.strokeStyle=base;q.lineWidth=6;q.stroke();q.strokeStyle=hi;q.lineWidth=1.5;q.stroke();q.lineCap='butt';
 pR9(q,base,[[19,20+b],[18,13+b],[22,9+b],[28,11+b],[31,16+b],[26,21+b]]);pR9(q,hi,[[20,13+b],[23,10+b],[27,12+b],[29,15+b],[22,16+b]],null);pR9(q,'#9c986b',[[21,18+b],[29,17+b],[26,21+b],[22,22+b]],null);
 for(let i=0;i<5;i++){lR9(q,10+i*3,29+(i%2),11+i*3,27+(i%2),'#293e37',1);lR9(q,21,14+i,23,14+i,'#344b3b',.6)}eye1012(q,27,13+b,ac);lR9(q,29,18+b,32,20+b,'#d77465',.8);lR9(q,31,19+b,32,18+b,'#d77465',.7);
break;}
  case'ink':case'inksmall':{
 const sm=a==='inksmall';shadow1012(q,16,33,sm?16:27);q.save();q.translate(16,32);q.scale(sm?.72:1,sm?.72:1);q.translate(-16,-32);
 for(let i=0;i<5;i++){const x=5+i*5;q.strokeStyle=base;q.lineWidth=3;q.beginPath();q.moveTo(13+i*1.5,23);q.quadraticCurveTo(x,28,x-2+b,33-i%2);q.stroke()}
 pR9(q,'#111d29',[[4,27],[7,18+b],[12,15+b],[10,9+b],[14,3+b],[17,10+b],[24,13+b],[27,20+b],[29,29],[22,31],[15,28],[8,31]]);
 pR9(q,base,[[7,23+b],[12,15+b],[14,7+b],[17,14+b],[23,15+b],[25,24+b],[20,28],[11,27]],null);pR9(q,hi,[[10,18+b],[13,13+b],[15,13+b],[14,19+b],[10,23+b]],null);
 pR9(q,'#13212d',[[10,23+b],[16,19+b],[23,21+b],[23,26+b],[16,24+b]],null);eyePairR9(q,13,21,21+b,'#a5eef1');q.fillStyle='#e5ffff';q.fillRect(12,20+b,1,1);q.fillRect(20,20+b,1,1);eR9(q,6,13-b,1.4,2.3,hi,null);eR9(q,25,8+b,1,1.6,base,null);q.restore();
break;}
  case'mine_slinger':{shadow1012(q,16,33,20);pR9(q,base,[[9,14+b],[21,14+b],[24,28+b],[20,32],[8,31],[7,22+b]]);pR9(q,hi,[[10,15+b],[14,16+b],[12,29],[8,28]],null);pR9(q,'#312e2a',[[16,16+b],[21,16+b],[22,30],[16,29]],null);eR9(q,15,10+b,5,5,'#aa957a');pR9(q,'#575047',[[8,7+b],[11,4+b],[20,4+b],[23,8+b],[21,10+b],[8,10+b]],null);lR9(q,8,8+b,23,8+b,'#b5a68b',2);eyePairR9(q,13,17,11+b,'#2a2624');lR9(q,9,18+b,5,22+b,'#aa957a',3);lR9(q,20,17+b,26,14+b,'#aa957a',3);lR9(q,26,14+b,28,21+b,'#b8a07c',1);eR9(q,27,22+b,3,2,'#9d9f96');r1012(q,17,24+b,6,5,'#75644b');lR9(q,11,15+b,21,25+b,'#b1a080',1);bootR9(q,9,30,5);bootR9(q,17,30,5);break}
  case'archer':{shadow1012(q,16,33,18);pR9(q,base,[[10,14+b],[18,12+b],[22,19+b],[20,31+b],[9,31+b],[7,22+b]]);pR9(q,sp.hood||'#2e4933',[[7,9+b],[15,4+b],[24,7+b],[22,11+b],[9,12+b]],null);eR9(q,15,11+b,4,4,sp.face||'#8da27d');eyePairR9(q,13,17,11+b,sp.eyes||'#e6d27c');lR9(q,26,8,29,31,sp.bow||'#9b6a3d',2);q.strokeStyle=sp.string||'#d9c598';q.lineWidth=1;q.beginPath();q.moveTo(26,8);q.quadraticCurveTo(18,19,29,31);q.stroke();lR9(q,9,20,22,18,hi,2);bootR9(q,9,30,5);bootR9(q,17,30,5);break}
  case'golem':{shadow1012(q,16,34,27);pR9(q,base,[[5,17+b],[9,10+b],[14,12+b],[18,7+b],[25,12+b],[28,20+b],[27,31],[21,34],[15,31],[9,34],[4,28]]);pR9(q,hi,[[10,8+b],[20,5+b],[25,11+b],[18,15+b],[8,14+b]]);eyePairR9(q,13,21,12+b,ac);pR9(q,hi,[[2,18],[8,17],[7,30],[2,27]],null);pR9(q,hi,[[30,18],[24,17],[25,30],[30,27]],null);pR9(q,colorShift(base,-18),[[17,16+b],[24,14+b],[25,28],[20,31],[17,27]],null);for(const yy of[19,24,29])lR9(q,8,yy,22,yy-1,colorShift(base,-32),.8);lR9(q,11,16+b,10,28,hi,.7);lR9(q,18,16+b,16,21+b,'#303438',.7);eyePairR9(q,13,21,12+b,ac);break}
  case'ironbrute':{shadow1012(q,16,34,28);pR9(q,base,[[4,13+b],[9,8+b],[24,8+b],[29,14+b],[28,31],[21,34],[11,34],[4,30]]);q.fillStyle=hi;q.fillRect(8,9+b,17,7);q.fillRect(6,17+b,21,4);q.fillStyle='#2d3136';q.fillRect(10,22+b,13,8);eyePairR9(q,13,21,12+b,ac);q.fillStyle=ac;q.fillRect(15,23+b,4,4);bootR9(q,7,30,8);bootR9(q,20,30,8);for(const[x,y]of[[8,10],[23,10],[7,18],[25,18],[11,25],[21,25]]){eR9(q,x,y+b,1,1,'#c6c4b2',null)}pR9(q,'#9ca9ad',[[9,9+b],[15,9+b],[12,14+b],[9,14+b]],null);lR9(q,7,22+b,9,29,'#6c8790',1);lR9(q,25,22+b,24,29,'#252e36',2);break}
  case'fish':{
 const mercury=m.name==='수은 물고기';shadow1012(q,16,33,27);
 pR9(q,base,[[9,21+b],[2,14+b],[3,23+b],[1,30+b],[11,26+b]]);pR9(q,hi,[[3,17+b],[8,22+b],[4,26+b],[6,23+b]],null);
 pR9(q,base,[[7,23+b],[13,17+b],[24,17+b],[31,22+b],[30,27+b],[22,30+b],[12,28+b]]);pR9(q,hi,[[10,22+b],[15,18+b],[24,19+b],[28,21+b],[22,24+b],[13,24+b]],null);
 pR9(q,base,[[13,18+b],[16,10+b],[19,15+b],[22,12+b],[24,18+b]]);pR9(q,hi,[[16,18+b],[17,13+b],[20,17+b]],null);pR9(q,hi,[[14,27+b],[20,34],[21,28+b]],null);
 for(let y=21;y<27;y+=3)for(let x=12+(y%2);x<23;x+=4){lR9(q,x,y+b,x+1,y+1+b,mercury?'#d5e6e7':'#7aa6a5',.8)}lR9(q,23,21+b,23,27+b,base,1.4);
 pR9(q,'#1b2024',[[25,25+b],[32,22+b],[30,28+b],[25,28+b]],null);for(const x of[26,29])pR9(q,'#fff2d6',[[x,24+b],[x+1,27+b],[x+2,23+b]],null);eye1012(q,27,21+b,mercury?'#e8faff':'#ffc177');
break;}
  case'widow':{shadow1012(q,16,33,22);pR9(q,base,[[9,14+b],[16,10+b],[23,14+b],[28,31],[19,28],[16,34],[13,28],[4,31]]);pR9(q,'#241526',[[7,8+b],[12,3+b],[22,5+b],[26,11+b],[22,16+b],[10,15+b]],null);eR9(q,16,10+b,4,5,'#c1a0ad');eyePairR9(q,14,18,10+b,ac);for(const [x1,x2]of[[9,1],[23,31]])lR9(q,x1,18+b,x2,31,ac,2);q.globalAlpha=.35;for(const x of[5,27])lR9(q,16,14+b,x,34,hi,1);q.globalAlpha=1;break}
  case'silk':{shadow1012(q,16,33,21);eR9(q,16,9+b,4.5,4.5,'#e2c5ce');pR9(q,'#5a324e',[[9,8+b],[13,3+b],[22,4+b],[24,10+b],[20,12+b],[10,11+b]],null);pR9(q,base,[[11,14+b],[21,14+b],[24,30],[18,28],[16,34],[13,28],[7,31]]);q.strokeStyle=hi;q.lineWidth=3;q.beginPath();q.moveTo(10,17+b);q.bezierCurveTo(1,17,3,30,0,34);q.stroke();q.beginPath();q.moveTo(22,17+b);q.bezierCurveTo(31,17,29,30,32,34);q.stroke();eyePairR9(q,14,18,9+b,'#3e2338');q.fillStyle=ac;q.fillRect(9,18+b,14,2);break}
  case'censer':{
 shadow1012(q,16,33,25);for(let i=0;i<3;i++){q.strokeStyle=['#9477b666','#c9a9da88','#8265a355'][i];q.lineWidth=1.7;q.beginPath();q.moveTo(12+i*4,15);q.bezierCurveTo(6+i*5,9,22-i*3,8,13+i*4+b,2);q.stroke()}
 for(const x of[8,24]){eR9(q,x,21+b,4,5,'#967346');eR9(q,x,21+b,2,3,'#191827',null)}
 pR9(q,'#292633',[[7,18+b],[11,14+b],[21,14+b],[25,18+b],[23,28+b],[19,31],[12,31],[9,27+b]]);pR9(q,hi,[[10,18+b],[13,16+b],[21,17+b],[22,24+b],[18,27+b],[12,26+b]],null);
 pR9(q,'#ba955e',[[7,17+b],[11,12+b],[21,12+b],[25,17+b]],null);lR9(q,8,17+b,24,17+b,'#f1d49c',1);eR9(q,16,11+b,2,2,'#c7a465');
 for(const x of[12,16,20]){eR9(q,x,22+b,1.3,2,'#302639',null);lR9(q,x-1,25+b,x+1,25+b,'#dcc58e',.6)}for(const x of[10,22])pR9(q,'#9b7746',[[x-1,28],[x+2,28],[x+3,33],[x-2,33]]);lR9(q,12,29,21,29,'#cdae74',1);
break;}
  case'fairy':{shadow1012(q,16,33,18);q.globalAlpha=.65;eR9(q,8,16+b,7,10,hi);eR9(q,24,16+b,7,10,hi);eR9(q,7,25+b,6,7,hi);eR9(q,25,25+b,6,7,hi);q.globalAlpha=1;eR9(q,16,10+b,4,4,'#d6b6c7');pR9(q,base,[[12,15+b],[20,15+b],[22,29+b],[16,33],[10,29+b]]);eyePairR9(q,14,18,10+b,ac);lR9(q,13,29,12,34,ACTOR_INK,2);lR9(q,19,29,20,34,ACTOR_INK,2);break}
  case'fox':{shadow1012(q,16,34,28);const blue=m?.shopPortrait58===2,phase=m?.revivePhase57||'normal',hair=blue?'#182e4c':base,hair2=blue?'#2e5277':hi,hairHi=blue?'#6297bc':ac,skin=blue?'#c5e2ed':hi,skinHi=blue?'#e8f5f8':ac,robe=blue?'#396b92':base,robeHi=blue?'#73accb':hi,eye=blue?'#d4f8ff':ac;
    if(phase==='corpse'){
      shadow1012(q,16,34,29);for(const [pts,col] of [[[[2,29],[6,24],[12,26],[15,31],[9,33]],hair],[[[5,31],[10,23],[15,27],[17,33],[11,34]],hair2],[[[28,29],[25,24],[20,26],[17,31],[22,33]],hair],[[[30,31],[24,23],[19,27],[16,33],[23,34]],hair2]])pR9(q,col,pts);
      pR9(q,robe,[[8,25],[13,21],[22,22],[27,26],[24,31],[11,32],[6,29]]);pR9(q,robeHi,[[11,25],[21,24],[23,28],[12,29]],null);pR9(q,skin,[[20,20],[26,19],[30,22],[29,26],[24,28],[19,25]]);pR9(q,hair,[[19,20],[22,16],[25,20],[29,17],[28,23],[23,24]],null);lR9(q,24,23,28,23,hairHi,1);q.fillStyle=skinHi;q.fillRect(28,25,2,1);break;
    }
    if(phase==='reviving'){
      for(const [pts,col] of [[[[4,31],[7,23],[12,27],[12,34]],hair],[[[10,33],[12,22],[16,27],[16,35]],hair2],[[[28,31],[25,23],[20,27],[20,34]],hair],[[[22,33],[20,22],[16,27],[16,35]],hair2]])pR9(q,col,pts);pR9(q,robe,[[10,21+b],[21,21+b],[24,29+b],[21,34],[11,34],[8,29+b]]);pR9(q,robeHi,[[12,23+b],[20,23+b],[19,28+b],[12,28+b]],null);pR9(q,skin,[[12,13+b],[20,13+b],[22,17+b],[20,21+b],[13,21+b],[10,18+b]]);pR9(q,hair,[[10,13+b],[13,8+b],[16,12+b],[19,8+b],[22,13+b],[20,16+b],[12,16+b]],null);q.fillStyle=eye;q.fillRect(12,17+b,2,2);q.fillRect(19,17+b,2,2);q.fillStyle=skinHi;q.fillRect(15,21+b,3,1);break;
    }
    pR9(q,hair,[[8,6+b],[12,3+b],[20,3+b],[24,6+b],[26,13+b],[25,21+b],[27,29+b],[21,31+b],[18,28+b],[16,34],[13,28+b],[10,31+b],[5,29+b],[7,20+b],[6,13+b]]);pR9(q,hair2,[[7,9+b],[8,3+b],[13,8+b],[12,12+b]]);pR9(q,hair2,[[19,8+b],[24,3+b],[25,10+b],[21,12+b]]);pR9(q,skinHi,[[8,8+b],[9,5+b],[12,9+b],[11,11+b]],null);pR9(q,skinHi,[[20,9+b],[23,5+b],[24,9+b],[21,11+b]],null);pR9(q,hair2,[[8,11+b],[4,15+b],[9,15+b]],null);pR9(q,hair2,[[24,11+b],[29,15+b],[23,15+b]],null);
    pR9(q,robe,[[11,20+b],[21,20+b],[24,26+b],[23,32+b],[19,33+b],[16,35],[13,33+b],[9,32+b],[8,26+b]]);q.fillStyle=robeHi;q.fillRect(12,20+b,8,2);q.fillRect(12,23+b,8,2);pR9(q,skin,[[10,20+b],[8,21+b],[7,25+b],[3,27+b],[1,29+b],[2,32+b],[7,31+b],[10,28+b],[11,23+b]]);pR9(q,skin,[[22,20+b],[24,21+b],[25,25+b],[29,27+b],[31,29+b],[30,32+b],[25,31+b],[22,28+b],[21,23+b]]);pR9(q,skinHi,[[8,22+b],[10,21+b],[10,24+b],[8,25+b]],null);pR9(q,skinHi,[[22,21+b],[24,22+b],[24,25+b],[22,24+b]],null);
    pR9(q,skin,[[13,10+b],[19,10+b],[22,13+b],[21,17+b],[18,19+b],[14,19+b],[11,17+b],[11,13+b]]);pR9(q,hair,[[10,9+b],[14,7+b],[16,10+b],[18,7+b],[22,9+b],[20,13+b],[18,12+b],[17,15+b],[15,15+b],[14,12+b],[12,13+b]],null);q.fillStyle=eye;q.fillRect(12,14+b,2,3);q.fillRect(11,15+b,1,1);q.fillRect(11,14+b,1,1);q.fillRect(19,14+b,2,3);q.fillRect(21,15+b,1,1);q.fillRect(21,14+b,1,2);q.fillRect(18,14+b,1,3);q.fillStyle=skinHi;q.fillRect(15,19+b,3,2);pR9(q,hair,[[9,14+b],[12,14+b],[11,29+b],[8,30+b]]);pR9(q,hair,[[20,14+b],[23,14+b],[24,30+b],[21,29+b]]);q.fillStyle=hairHi;q.fillRect(8,12+b,2,6);q.fillRect(23,12+b,2,6);q.fillRect(10,7+b,2,3);q.fillRect(21,7+b,2,3);eR9(q,16,27+b,5.5,4.5,hi);eR9(q,16,27+b,3.7,3.1,skinHi,null);pR9(q,ac,[[16,25+b],[18,24+b],[18,27+b],[16,30+b],[15,30+b],[15,26+b]],null);q.fillStyle=skinHi;q.fillRect(2,29+b,2,2);q.fillRect(28,29+b,2,2);if(phase==='full'&&!blue){q.fillStyle=ac;for(const [x,y] of [[5,8],[27,8],[3,19],[29,19],[7,3],[25,3]])q.fillRect(x,y+b,2,2);q.fillStyle=hi;q.fillRect(14,2+b,4,1)}break}
  case'centipede':{
 shadow1012(q,16,33,29);const ys=[27,24,21,20,22,24,20];for(let i=0;i<7;i++){const x=3+i*4,y=ys[i]+b;for(const d of[-1,1]){lR9(q,x,y+2,x+d*3,y+5,ac,1);lR9(q,x+d*3,y+5,x+d*4,y+8,'#aa6a48',.7)}eR9(q,x,y,3.5,4.3,'#322821');eR9(q,x,y-1,2.7,3.3,base,null);pR9(q,hi,[[x-2,y-2],[x,y-4],[x+2,y-2],[x,y]],null);lR9(q,x-2,y+2,x+2,y+2,'#d2985b',.7)}
 pR9(q,base,[[23,17+b],[24,12+b],[29,10+b],[32,14+b],[31,21+b],[26,22+b]]);pR9(q,hi,[[25,13+b],[28,11+b],[30,14+b],[27,16+b]],null);eyePairR9(q,26,30,16+b,'#ffe39c');for(const d of[-1,1]){lR9(q,28+d*2,12+b,28+d*3,6+b,ac,1);lR9(q,28+d*3,6+b,27+d*4,4+b,ac,.7)}pR9(q,'#e5bd82',[[26,20+b],[24,25+b],[28,22+b]],null);pR9(q,'#e5bd82',[[30,20+b],[32,24+b],[28,22+b]],null);
break;}
  case'jiangshi':{shadow1012(q,16,33,20);pR9(q,base,[[9,14+b],[23,14+b],[25,32],[7,32]]);eR9(q,16,10+b,5,5,'#91a79a');pR9(q,'#27362f',[[8,8+b],[10,3+b],[22,3+b],[24,8+b]],null);q.fillStyle='#d9c476';q.fillRect(13,3+b,6,15);q.fillStyle='#8e302e';q.fillRect(15,5+b,2,11);eyePairR9(q,13,19,10+b,'#d6f4bd');lR9(q,9,18+b,1,16+b,hi,3);lR9(q,23,18+b,31,16+b,hi,3);bootR9(q,8,31,6);bootR9(q,19,31,6);break}
  case'ghoul':{shadow1012(q,16,33,24);pR9(q,base,[[9,15+b],[13,10+b],[22,13+b],[25,22+b],[22,31],[14,28],[8,32],[5,24+b]]);eR9(q,16,10+b,5,5,'#9a7b6f');eyePairR9(q,13,19,10+b,ac);lR9(q,8,18+b,1,30,hi,4);lR9(q,23,18+b,30,32,hi,4);lR9(q,14,14+b,20,12+b,'#6c3b3b',1);bootR9(q,8,30,5);bootR9(q,19,29,6);pR9(q,colorShift(base,-22),[[18,15+b],[23,19+b],[21,30],[17,27]],null);lR9(q,11,16+b,13,27,hi,.7);lR9(q,10,23+b,23,23+b,'#45352b',1.6);q.fillStyle=ac;q.fillRect(15,22+b,2,2);q.fillStyle='#332d2b';q.fillRect(12,6+b,8,2);eyePairR9(q,14,19,10+b,'#e3cca4');if(m.ranged){q.strokeStyle=ac;q.lineWidth=1;q.beginPath();q.arc(26,20,8,-1.3,1.3);q.stroke();lR9(q,28,12,28,28,'#ded2b4',.6)}break}
  case'slime':{
 const lava=m.name.includes('녹아');shadow1012(q,16,33,28);pR9(q,'#23251c',[[2,30],[5,21+b],[10,14+b],[17,11+b],[24,15+b],[28,23+b],[31,30],[26,33],[21,30],[15,34],[10,30],[5,33]]);
 pR9(q,base,[[4,29],[7,21+b],[11,16+b],[17,13+b],[23,17+b],[26,24+b],[28,30],[22,28],[16,31],[10,28]],null);pR9(q,hi,[[7,23+b],[11,17+b],[17,14+b],[22,17+b],[20,21+b],[12,20+b]],null);
 pR9(q,lava?'#3f2925':'#344a2d',[[8,26+b],[12,23+b],[22,24+b],[25,30],[19,28],[14,31]],null);eyePairR9(q,12,22,23+b,lava?'#fff4a5':'#eaffb5');
 eR9(q,12,17+b,2.8,1.2,lava?'#ffc375':'#e1eeae',null);eR9(q,20,19+b,1.1,1.5,ac,null);eR9(q,6,30,2,1,hi,null);
 if(lava){for(const [x,y]of[[9,25],[18,27],[25,25]]){lR9(q,x,y,x+2,y+4,'#ffb14e',1);lR9(q,x+2,y+4,x+1,y+6,'#ffe69b',.6)}}else{eR9(q,17,25+b,2.5,3,'#a6c778',null);eR9(q,17,25+b,1.3,1.8,'#59743d',null);eR9(q,25,9-b,1.3,2,hi,null)}
break;}
  case'croc':{shadow1012(q,16,34,31);pR9(q,ACTOR_OUTLINE,[[0,27+b],[4,21+b],[10,17+b],[20,16+b],[25,13+b],[31,15+b],[32,20+b],[30,25+b],[23,28+b],[11,30+b],[4,31+b]],null);pR9(q,base,[[2,27+b],[6,22+b],[12,19+b],[21,18+b],[25,15+b],[30,17+b],[31,21+b],[28,24+b],[21,26+b],[10,28+b],[5,29+b]],null);for(const[x,y]of[[9,18],[13,16],[17,17],[21,15]])pR9(q,hi,[[x,y+b],[x+2,y-3+b],[x+4,y+b]],null);pR9(q,hi,[[22,16+b],[27,11+b],[32,13+b],[31,18+b],[28,20+b],[22,20+b]],null);eye1012(q,28,14+b,ac);q.fillStyle='#efe0bc';for(const [x,y]of[[25,20],[28,20],[30,19],[27,22],[30,22]])q.fillRect(x,y+b,2,1);q.fillStyle=ac;q.fillRect(12,23+b,2,1);q.fillRect(17,22+b,2,1);for(const[x,y]of[[8,27],[19,25]]){pR9(q,hi,[[x,y+b],[x+5,y+b],[x+4,y+5+b],[x,y+4+b]],null);q.fillStyle=ACTOR_OUTLINE;q.fillRect(x+1,y+4+b,5,1)}for(const[x,y]of[[9,22],[13,21],[17,21],[10,25],[15,24],[19,23]]){pR9(q,'#8c9978',[[x,y+b],[x+1,y-1+b],[x+3,y+b],[x+1,y+1+b]],null)}lR9(q,23,19+b,29,18+b,'#c1c7a0',.7);break}
  case'guard':{shadow1012(q,16,33,25);pR9(q,base,[[9,14+b],[22,14+b],[25,31],[8,31]]);eR9(q,16,9+b,5,4,'#b49672');pR9(q,'#303033',[[7,7+b],[16,2+b],[25,7+b],[23,10+b],[9,10+b]],null);pR9(q,'#40372e',[[2,15+b],[9,13+b],[11,31],[2,29]]);q.fillStyle=hi;q.fillRect(4,17+b,5,11);q.fillStyle=ac;q.fillRect(5,19+b,3,6);lR9(q,27,5,27,34,hi,3);eyePairR9(q,13,19,9+b,'#f0d39a');bootR9(q,10,30,5);bootR9(q,19,30,5);for(const yy of[16,20,24,28]){lR9(q,12,yy+b,22,yy+b,colorShift(base,-25),1);lR9(q,12,yy-.6+b,21,yy-.6+b,hi,.5)}lR9(q,16,14+b,16,29,ac,.8);lR9(q,9,7+b,23,7+b,hi,.7);q.fillStyle='#1e2628';q.fillRect(12,9+b,9,2);eyePairR9(q,14,19,9.5+b,'#dbc6a1');for(const yy of[16,29]){q.fillStyle=ac;q.fillRect(3,yy+b,6,.8)}break}
  case'salamander':{
 shadow1012(q,16,33,30);pR9(q,'#402826',[[0,30],[4,23+b],[10,20+b],[20,19+b],[23,15+b],[29,15+b],[32,21+b],[28,27+b],[16,29],[6,28]]);
 pR9(q,base,[[2,28],[8,22+b],[18,21+b],[24,19+b],[29,20+b],[27,25+b],[17,27],[7,26]],null);
 for(const[x,y]of[[8,21],[14,19],[19,18],[25,15]]){pR9(q,'#e77b3b',[[x-2,y],[x,y-7-b],[x+2,y-3],[x+4,y-6],[x+3,y+2]],null);pR9(q,'#ffe2a0',[[x,y],[x+1,y-4],[x+2,y]],null)}
 pR9(q,hi,[[21,18+b],[24,15+b],[29,17+b],[31,21+b],[27,24+b],[22,23+b]],null);eye1012(q,27,18+b,'#ffeab1');lR9(q,25,23+b,30,22+b,'#572820',1);for(const[x,y]of[[9,26],[19,25]]){lR9(q,x,y,x-3,31,hi,2.2);lR9(q,x-3,31,x+1,32,'#e9ac76',.8)}for(const x of[10,14,18])eR9(q,x,24,1,.8,ac,null);
break;}
  case'gargoyle':{
 shadow1012(q,16,34,27);for(const d of[-1,1]){pR9(q,'#392c30',[[16+d*5,17+b],[16+d*11,9+b],[16+d*15,5+b],[16+d*14,25+b],[16+d*10,22+b],[16+d*7,28+b]]);pR9(q,base,[[16+d*6,18+b],[16+d*13,8+b],[16+d*12,22+b],[16+d*10,19+b]],null);lR9(q,16+d*6,18+b,16+d*13,8+b,hi,1);lR9(q,16+d*6,18+b,16+d*12,22+b,hi,.7)}
 pR9(q,base,[[10,14+b],[22,14+b],[24,24+b],[21,30],[17,28],[12,32],[8,27]]);pR9(q,hi,[[11,15+b],[15,17+b],[14,26],[10,27]],null);pR9(q,'#ce6e3f',[[16,18+b],[20,19+b],[19,24+b],[16,26]],null);
 pR9(q,hi,[[11,8+b],[10,2],[15,7+b],[20,7+b],[24,2],[22,14+b],[18,17+b],[12,13+b]]);eyePairR9(q,13,20,11+b,'#ffd79a');pR9(q,'#443136',[[15,13+b],[19,13+b],[17,16+b]],null);for(const x of[10,20]){lR9(q,x,28,x-1,33,base,3);for(let i=0;i<3;i++)lR9(q,x-2+i*2,32,x-3+i*2,34,'#c1a391',.8)}
break;}
  case'puppet':{shadow1012(q,16,33,21);eR9(q,16,9+b,5,5,'#b8a17c');q.fillStyle='#443a31';q.fillRect(11,4+b,10,4);pR9(q,base,[[11,14+b],[21,14+b],[22,27+b],[10,27+b]]);for(const [x1,y1,x2,y2]of[[11,17,4,23],[21,17,28,23],[12,27,8,34],[20,27,24,34]]){lR9(q,x1,y1+b,x2,y2,hi,3);eR9(q,x1,y1+b,1.8,1.8,ac)}eyePairR9(q,13,19,9+b,ac);q.setLineDash([2,2]);q.strokeStyle=ac;q.strokeRect(11,15+b,10,11);q.setLineDash([]);break}
  case'lurker':{
 shadow1012(q,16,33,29);pR9(q,'#34282b',[[1,30],[5,18+b],[10,15+b],[13,10+b],[20,13+b],[26,17+b],[31,30],[23,28],[16,34],[8,28]]);pR9(q,base,[[4,28],[8,20+b],[12,18+b],[16,13+b],[24,19+b],[28,28],[20,27],[16,30],[10,26]],null);
 pR9(q,hi,[[8,21+b],[12,16+b],[16,14+b],[23,19+b],[21,23+b],[12,23+b]],null);pR9(q,'#211c22',[[8,24+b],[23,23+b],[20,29],[12,28]],null);for(let x=10;x<24;x+=4)pR9(q,'#e5cfa2',[[x,24+b],[x+1,27+b],[x+2,24+b]],null);eyePairR9(q,11,22,20+b,'#ffe8a3');for(const x of[5,26]){lR9(q,x,26,x-2,32,base,2);lR9(q,x-2,32,x+2,33,hi,1)}
break;}
  case'cannon':{shadow1012(q,16,34,26);const wood='#6a5d4b',metal='#73787b',dark='#24272a';eR9(q,13,9+b,4.8,4.8,'#b8a17c');q.fillStyle='#443a31';q.fillRect(8,4+b,10,4);q.fillStyle=ac;q.fillRect(11,4+b,4,2);pR9(q,base,[[8,14+b],[18,14+b],[20,27+b],[7,27+b]]);q.setLineDash([2,2]);q.strokeStyle=ac;q.strokeRect(9,15+b,8,10);q.setLineDash([]);for(const[x1,y1,x2,y2]of[[9,17,3,24],[18,17,23,24],[9,27,6,34],[17,27,20,34]]){lR9(q,x1,y1+b,x2,y2,hi,3);eR9(q,x1,y1+b,1.7,1.7,ac)}eyePairR9(q,11,15,9+b,ac);pR9(q,dark,[[16,10+b],[20,7+b],[25,8+b],[29,12+b],[28,16+b],[21,16+b]]);q.fillStyle=metal;q.fillRect(20,8+b,8,6);q.fillStyle=hi;q.fillRect(22,9+b,6,2);q.fillStyle=ACTOR_OUTLINE;q.fillRect(27,9+b,5,6);q.fillStyle='#0d0f10';q.fillRect(29,10+b,3,4);q.fillStyle=ac;q.fillRect(20,15+b,3,3);lR9(q,19,17+b,25,23+b,metal,3);eR9(q,25,23+b,2.5,2.5,wood);q.fillStyle=metal;q.fillRect(4,16+b,3,8);q.fillStyle=ac;q.fillRect(5,17+b,1,6);for(const y of[19,23,27]){q.fillStyle=dark;q.fillRect(21,y+b,5,3);q.fillStyle=hi;q.fillRect(22,y+b,3,1)}bootR9(q,4,32,6);bootR9(q,18,32,6);break}
  case'drone':{
 shadow1012(q,16,34,22);for(const d of[-1,1]){pR9(q,'#282e32',[[16+d*5,14+b],[16+d*14,5+b],[16+d*13,23+b],[16+d*7,27+b]]);pR9(q,'#87968e',[[16+d*6,15+b],[16+d*12,9+b],[16+d*11,21+b],[16+d*8,23+b]],null);for(let i=0;i<3;i++)lR9(q,16+d*6,16+b,16+d*12,12+i*4+b,'#384c4f',.8)}
 pR9(q,base,[[10,10+b],[16,6+b],[22,10+b],[24,23+b],[16,30+b],[8,23+b]]);pR9(q,hi,[[11,12+b],[15,9+b],[16,25+b],[11,22+b]],null);pR9(q,'#383b36',[[17,9+b],[21,12+b],[22,22+b],[17,26+b]],null);eR9(q,16,18+b,5,5,'#c6a36b');eR9(q,16,18+b,3.4,3.4,'#233c42');eR9(q,16,18+b,1.9,1.9,'#9ae5e6',null);eR9(q,15,17+b,.8,.8,'#f0ffff',null);lR9(q,16,29,16,34,ac,1);for(const x of[11,21])eR9(q,x,12+b,.7,.7,'#f3d49b',null);
break;}
  case'manta':{
 shadow1012(q,16,34,28);pR9(q,'#211e38',[[16,9+b],[23,15+b],[31,11+b],[28,25+b],[22,29+b],[16,26+b],[10,29+b],[3,25+b],[1,11+b],[9,15+b]]);
 for(const d of[-1,1]){pR9(q,base,[[16,13+b],[16+d*12,14+b],[16+d*10,23+b],[16+d*6,26+b],[16,24+b]],null);pR9(q,hi,[[16+d*3,17+b],[16+d*11,15+b],[16+d*8,20+b],[16+d*3,23+b]],null);lR9(q,16+d*4,24+b,16+d*10,19+b,'#99a2c6',.6)}pR9(q,'#2c2d4a',[[16,8+b],[20,18+b],[18,26+b],[16,30+b],[14,26+b],[12,18+b]]);eyePairR9(q,13,19,18+b,'#a8f4eb');q.strokeStyle=hi;q.lineWidth=1.5;q.beginPath();q.moveTo(16,26);q.quadraticCurveTo(20+b,30,13+b,35);q.stroke();for(const x of[6,24])eR9(q,x,19+b,.7,.7,'#c0eee4',null);
break;}
  case'statue':{shadow1012(q,16,34,28);pR9(q,base,[[8,14+b],[11,9+b],[22,9+b],[25,14+b],[27,31],[6,31]]);pR9(q,hi,[[10,8+b],[16,3+b],[23,8+b],[21,12+b],[12,12+b]],null);q.fillStyle=ac;q.fillRect(12,16+b,9,3);q.fillRect(14,21+b,5,6);pR9(q,hi,[[4,17+b],[8,14+b],[10,29],[3,27]],null);pR9(q,hi,[[28,17+b],[24,14+b],[22,29],[29,27]],null);bootR9(q,8,30,6);bootR9(q,19,30,6);break}
  case'shadow':case'masterghost':{shadow1012(q,16,33,23);q.globalAlpha=.9;pR9(q,base,[[9,12+b],[16,6+b],[23,12+b],[28,31],[22,27],[17,34],[13,28],[5,32]]);pR9(q,hi,[[11,9+b],[16,5+b],[21,9+b],[20,15+b],[12,15+b]],null);eyePairR9(q,13,20,11+b,ac);q.globalAlpha=.28;glowR9(q,16,18,13,'rgba(130,170,210,.45)');q.globalAlpha=1;pR9(q,colorShift(base,-25),[[17,16+b],[23,17+b],[26,29],[22,26],[18,31]],null);for(const xx of[10,14,20])lR9(q,xx,18+b,xx-1,27,colorShift(hi,-25),.6);q.fillStyle='#272531';q.fillRect(12,10+b,9,3);eyePairR9(q,14,19,11+b,'#cbe1dc');break}
  case'priest':{shadow1012(q,16,34,26);pR9(q,base,[[8,13+b],[24,13+b],[30,32],[21,29],[16,35],[11,29],[2,32]]);pR9(q,'#33273b',[[10,7+b],[16,2+b],[22,7+b],[20,13+b],[12,13+b]],null);q.fillStyle=ac;q.fillRect(14,5+b,4,17);eyePairR9(q,13,19,9+b,'#d9c77f');for(const [x1,x2]of[[7,0],[25,32]])lR9(q,x1,18+b,x2,33,hi,3);pR9(q,colorShift(base,-21),[[18,15+b],[22,15+b],[26,30],[21,27],[18,32]],null);for(const xx of[9,14,22])lR9(q,xx,18+b,xx-2,29,hi,.6);lR9(q,10,23+b,23,23+b,ac,.8);q.fillStyle='#231e29';q.fillRect(12,9+b,9,3);eyePairR9(q,14,19,10+b,'#f0da9f');lR9(q,28,14,28,34,'#8e795c',1.5);eR9(q,28,13,2,2,ac,null);break}
  case'devourer':{
 shadow1012(q,16,34,29);pR9(q,'#291b32',[[4,10+b],[8,3+b],[16,5+b],[24,2+b],[28,9+b],[26,17+b],[30,29],[25,33],[19,30],[16,35],[11,30],[3,33],[5,21+b]]);pR9(q,base,[[7,10+b],[10,6+b],[16,8+b],[23,5+b],[25,10+b],[23,27],[17,31],[10,28]],null);
 eR9(q,16,20+b,9,12,'#080d19');eR9(q,16,21+b,5,8,'#192135',null);eR9(q,16,22+b,2.5,4,'#367283',null);
 for(let i=0;i<5;i++){const y=10+i*4,x=i===0||i===4?10:8;for(const d of[-1,1]){const xx=d<0?x:32-x;pR9(q,'#c3d8d2',[[xx,y+b],[xx-d*1,y+3+b],[xx-d*4,y+2+b]],null)}}
 for(const d of[-1,1]){lR9(q,16+d*10,22,16+d*13,28,hi,1.5);lR9(q,16+d*13,28,16+d*11,33,hi,1.2)}eyePairR9(q,7,25,9+b,'#b9f9f3');for(const x of[7,25])eR9(q,x,6+b,.7,.7,ac,null);
break;}
  case'sentinel':{shadow1012(q,16,34,27);pR9(q,base,[[7,14+b],[10,9+b],[22,9+b],[25,14+b],[28,31],[4,31]]);pR9(q,'#2c2419',[[7,7+b],[13,3+b],[19,3+b],[25,7+b],[29,9+b],[3,9+b]],null);q.fillStyle=ac;q.fillRect(9,15+b,14,3);eyePairR9(q,13,20,11+b,'#fff0a0');lR9(q,28,5,29,34,'#d1a64f',2);for(const [x,y]of[[4,13],[24,13],[5,27],[23,27]]){q.fillStyle='#d8bd68';q.fillRect(x,y+b,4,5);q.fillStyle='#7a3c30';q.fillRect(x+1,y+1+b,2,3)}break}
  case'goldspirit':{
 shadow1012(q,16,34,21);glowR9(q,16,18,14,'rgba(236,190,71,.25)');q.strokeStyle='#a68440';q.lineWidth=.7;q.beginPath();q.ellipse(16,18+b,11,13,.4,0,Math.PI*2);q.stroke();
 pR9(q,'#705229',[[16,3+b],[22,10+b],[23,19+b],[19,27+b],[23,32],[16,30],[11,35],[12,27+b],[8,19+b],[10,10+b]]);pR9(q,hi,[[16,6+b],[20,12+b],[20,19+b],[16,27+b],[12,19+b],[12,12+b]],null);pR9(q,'#ffe4a0',[[16,8+b],[18,13+b],[17,22+b],[14,18+b],[13,12+b]],null);
 pR9(q,'#554526',[[12,14+b],[20,14+b],[18,17+b],[14,17+b]],null);eyePairR9(q,13,19,15+b,'#fffadc');for(const[x,y]of[[5,11],[27,25],[7,28]]){eR9(q,x,y+b,2.5,2.5,'#d6ae56');q.fillStyle='#514221';q.fillRect(x-.6,y-.6+b,1.2,1.2)}
break;}
  case'dragon':{shadow1012(q,16,35,31);const belly='#d8d7bd',foam='#d9f3f0';q.lineCap='round';q.strokeStyle=ACTOR_OUTLINE;q.lineWidth=12;q.beginPath();q.moveTo(2,29+b);q.bezierCurveTo(9,35,24,35,23,28+b);q.bezierCurveTo(23,23+b,13,24+b,14,19+b);q.bezierCurveTo(15,15+b,20,16+b,22,17+b);q.stroke();q.strokeStyle=base;q.lineWidth=9;q.stroke();q.strokeStyle=hi;q.lineWidth=3;q.beginPath();q.moveTo(4,28+b);q.bezierCurveTo(11,32,20,32,20,28+b);q.bezierCurveTo(20,25+b,16,25+b,17,20+b);q.bezierCurveTo(18,18+b,20,18+b,22,19+b);q.stroke();q.lineCap='butt';for(const[x,y]of[[5,28],[9,30],[13,31],[18,30],[20,27],[17,24],[17,20]]){q.fillStyle=ac;q.fillRect(x,y+b,2,1)}for(const[x,y]of[[8,27],[13,29],[18,27],[16,23]])pR9(q,hi,[[x,y+b],[x+2,y-4+b],[x+4,y+b]],null);pR9(q,hi,[[17,18+b],[17,11+b],[21,6+b],[27,6+b],[31,10+b],[32,15+b],[29,20+b],[23,21+b],[19,19+b]]);pR9(q,base,[[20,11+b],[22,8+b],[28,8+b],[31,11+b],[31,16+b],[27,18+b],[22,17+b]],null);pR9(q,belly,[[24,15+b],[31,15+b],[29,19+b],[24,18+b]],null);pR9(q,ac,[[21,8+b],[18,1+b],[24,6+b]],null);pR9(q,ac,[[26,7+b],[30,1+b],[29,8+b]],null);pR9(q,hi,[[20,10+b],[16,7+b],[18,13+b]],null);eye1012(q,27,11+b,'#fff2a8');q.fillStyle='#221b19';q.fillRect(30,15+b,2,1);q.fillStyle=foam;q.fillRect(29,17+b,2,1);lR9(q,25,13+b,13,9+b,foam,1);lR9(q,25,15+b,12,19+b,foam,1);lR9(q,13,9+b,7,7+b,foam,1);lR9(q,12,19+b,6,22+b,foam,1);pR9(q,belly,[[18,24+b],[14,25+b],[12,29+b],[15,29+b],[17,27+b]],null);q.fillStyle=ac;q.fillRect(12,29+b,2,1);for(const[x,y]of[[5,33],[11,34],[18,33],[25,32]]){pR9(q,'#7fb9c6',[[x-4,y],[x-1,y-4],[x+1,y],[x+4,y-3],[x+5,y+2],[x-4,y+2]],null);q.fillStyle=foam;q.fillRect(x-1,y-1,4,1)}break}
  case'houndboss':{
 shadow1012(q,16,34,30);pR9(q,'#2b2529',[[2,29],[4,18+b],[10,12+b],[20,13+b],[24,7+b],[30,12+b],[31,23+b],[25,28],[23,34],[17,34],[16,29],[10,29],[8,34],[3,33]]);pR9(q,base,[[5,23+b],[10,16+b],[19,16+b],[24,22+b],[20,28],[9,28]],null);pR9(q,hi,[[7,20+b],[11,15+b],[17,16+b],[13,22+b]],null);
 pR9(q,base,[[20,17+b],[21,7+b],[24,3],[26,10+b],[30,7],[30,16+b],[32,21+b],[28,25+b],[21,23+b]]);pR9(q,hi,[[23,12+b],[27,11+b],[29,15+b],[27,19+b],[22,18+b]],null);eye1012(q,27,14+b,'#ff966f');pR9(q,'#21191e',[[25,21+b],[32,20+b],[29,25+b],[25,24+b]],null);for(const x of[26,29])pR9(q,'#f5ddba',[[x,21+b],[x,24+b],[x+1,21+b]],null);
 lR9(q,20,19,24,26,'#9a7157',3);for(let i=0;i<3;i++)eR9(q,20+i,20+i*2,1,1,'#e4c18b',null);for(const x of[5,20]){pR9(q,hi,[[x,29],[x+4,29],[x+4,33],[x-1,33]],null);lR9(q,x,32,x+4,32,'#e1bea1',.7)}lR9(q,5,21,1,14,base,3);
break;}
  case'painter':{shadow1012(q,16,34,22);pR9(q,base,[[8,16+b],[14,12+b],[22,15+b],[25,31],[11,31],[5,25+b]]);eR9(q,15,10+b,5,5,'#bca887');pR9(q,'#d1d0c0',[[9,8+b],[10,4+b],[18,2+b],[23,7+b],[20,11+b]],null);pR9(q,'#40382c',[[5,5+b],[16,2+b],[26,5+b],[23,8+b],[8,8+b]],null);pR9(q,'#d9d0ad',[[1,17+b],[8,16+b],[10,30],[2,31]],null);q.fillStyle='#273d4b';q.fillRect(3,20+b,5,3);q.fillStyle='#c04e5e';q.fillRect(4,25+b,3,3);lR9(q,24,5,31,33,'#9b6239',3);q.fillStyle=ac;q.fillRect(26,4+b,3,8);break}
  case'seamstress':{
   // Pale silk artisan: a visible face, pinned black hair and an asymmetric sewing pose.
   const hair='#231a25',hairHi='#493447',silk='#6d405d',fold='#44273e',silkHi='#a66b8e',skin='#d4b5bb',skinHi='#efdcda',gold='#c6a16b',steel='#e4d7c2';
   shadow1012(q,16,34,23);
   pR9(q,hair,[[11,5+b],[15,2+b],[20,4+b],[23,11+b],[22,24],[19,29],[15,26],[9,29],[8,21],[9,10+b]]);
   pR9(q,hairHi,[[10,8+b],[12,5+b],[13,17+b],[11,26],[9,24]],null);
   // The skirt has a weighted hem and separate folds rather than a star-shaped poncho.
   pR9(q,fold,[[11,15+b],[20,14+b],[20,21+b],[24,31],[23,34],[17,35],[9,34],[5,32],[9,24+b]]);
   pR9(q,silk,[[12,15+b],[19,15+b],[18,21+b],[21,31],[19,34],[12,33],[8,31],[11,24+b]],null);
   pR9(q,silkHi,[[12,19+b],[14,21+b],[13,29],[15,33],[11,31],[10,29]],null);
   pR9(q,'#825071',[[18,20+b],[20,27],[23,32],[20,32],[17,27]],null);
   lR9(q,7,32,12,33,gold,.7);lR9(q,12,33,19,34,gold,.7);lR9(q,19,34,23,33,gold,.7);
   lR9(q,15,23+b,15,31,'#b7829c',.7);lR9(q,18,25+b,20,31,'#d3a18e',.6);
   // Left sleeve hangs below the spool; the right arm raises a single sewing needle.
   pR9(q,fold,[[11,14+b],[8,15+b],[4,18+b],[2,24+b],[5,28+b],[8,25+b],[9,20+b],[12,18+b]]);
   pR9(q,silkHi,[[8,15+b],[10,16+b],[7,20+b],[5,24+b],[3,23+b],[5,18+b]],null);
   lR9(q,3,24+b,6,26+b,gold,.8);
   pR9(q,silk,[[20,14+b],[23,15+b],[25,12+b],[28,14+b],[27,20+b],[29,25+b],[25,27+b],[22,23+b],[22,18+b]]);
   pR9(q,silkHi,[[23,16+b],[25,14+b],[26,16+b],[25,21+b],[27,25+b],[24,24+b]],null);
   lR9(q,25,26+b,28,25+b,gold,.8);
   // Close crossed collar, a narrow waist sash and a small embroidered knot.
   pR9(q,'#c4a7ab',[[12,13+b],[15,16+b],[20,13+b],[18,17+b],[14,18+b]],null);
   pR9(q,fold,[[10,14+b],[13,13+b],[17,19+b],[13,19+b]],null);
   lR9(q,13,14+b,16,18+b,gold,.7);lR9(q,19,14+b,16,18+b,'#e2bd98',.7);
   q.fillStyle=hair;q.fillRect(11,20+b,9,2);q.fillStyle=gold;q.fillRect(12,20+b,7,1);
   pR9(q,'#b98972',[[17,20+b],[19,21+b],[18,27+b],[16,26+b]],null);q.fillStyle='#e9c995';q.fillRect(16,20+b,2,2);
   // An oval face stays visible below the swept fringe, with restrained eyes and lips.
   pR9(q,skin,[[12,6+b],[18,5+b],[21,8+b],[20,11+b],[17,14+b],[14,13+b],[11,10+b]]);
   pR9(q,skinHi,[[15,7+b],[19,7+b],[19,10+b],[17,12+b],[14,11+b]],null);
   pR9(q,hair,[[10,7+b],[11,3+b],[16,2+b],[21,5+b],[22,9+b],[20,8+b],[17,5+b],[14,7+b],[12,10+b],[11,15+b],[9,20+b]],null);
   q.fillStyle='#503043';q.fillRect(13,8+b,2,1);q.fillRect(18,8+b,2,1);
   q.fillStyle='#271e29';q.fillRect(14,9+b,1,1);q.fillRect(19,9+b,1,1);q.fillStyle='#d6a2b7';q.fillRect(15,9+b,1,1);q.fillRect(20,9+b,1,1);q.fillStyle='#92596c';q.fillRect(16,12+b,2,1);
   q.fillStyle=gold;q.fillRect(21,10+b,1,3);q.fillStyle='#f1d7b7';q.fillRect(21,12+b,1,1);
   // Pinned bun, bronze hair needle and a tiny plum blossom.
   pR9(q,hair,[[12,3+b],[12,1+b],[17,0+b],[20,2+b],[19,4+b]],null);
   lR9(q,9,4+b,24,2+b,gold,.8);q.fillStyle=steel;q.fillRect(23,1+b,2,1);q.fillStyle='#9e576d';q.fillRect(10,3+b,3,2);q.fillRect(11,2+b,1,4);q.fillStyle='#edc7ba';q.fillRect(11,3+b,1,1);
   // Both tools are held by hands. The thin continuous strand runs from needle to spool.
   pR9(q,skin,[[24,12+b],[26,11+b],[27,13+b],[25,15+b]],null);
   lR9(q,26,14+b,28,6+b,steel,.9);eR9(q,28,6+b,.65,1.1,gold,null);q.fillStyle=hair;q.fillRect(28,6+b,.5,1);
   pR9(q,skin,[[5,18+b],[7,18+b],[7,21+b],[5,21+b]],null);
   q.fillStyle='#9a7854';q.fillRect(2,18+b,4,1);q.fillRect(2,23+b,4,1);q.fillStyle='#d8bbb2';q.fillRect(3,19+b,2,4);lR9(q,3,20+b,5,20+b,'#eee0cf',.6);lR9(q,3,22+b,5,22+b,'#ac7b91',.6);
   q.strokeStyle='#d7b8c3';q.lineWidth=.6;q.beginPath();q.moveTo(27,9+b);q.bezierCurveTo(31,17+b,24,24+b,17,25+b);q.bezierCurveTo(10,26+b,8,24+b,4,21+b);q.stroke();
   q.fillStyle='#dbb48a';for(const [x,y]of [[9,29],[10,30],[20,30],[21,31]])q.fillRect(x,y,1,1);
   break;
  }
  case'keeper':{drawKeeperBoss(q,frame);break}
  case'master':{drawMasterBoss(q,frame);break}
  case'asura':{shadow1012(q,16,35,29);pR9(q,base,[[8,15+b],[16,7+b],[24,15+b],[27,31],[16,35],[5,31]],null);eR9(q,16,9+b,5,5,'#c7b0a1');pR9(q,'#2b2135',[[9,8+b],[11,4+b],[21,4+b],[23,8+b],[20,12+b],[12,12+b]],null);eyePairR9(q,13,20,10+b,ac);for(const [x1,y1,x2,y2]of[[7,17,0,13],[25,17,32,13],[8,22,2,25],[24,22,30,25],[10,27,5,34],[22,27,27,34]])lR9(q,x1,y1+b,x2,y2+b,hi,2);q.fillStyle=ac;q.fillRect(10,18+b,12,2);q.fillRect(14,23+b,4,7);break}
  case'master_true':{drawMasterBoss(q,frame,true);break}
  case'tiger':{shadow1012(q,16,34,30);pR9(q,ACTOR_OUTLINE,[[2,27+b],[5,19+b],[10,15+b],[16,15+b],[21,11+b],[27,12+b],[31,17+b],[32,24+b],[27,28+b],[23,31],[15,29],[8,32]],null);pR9(q,base,[[4,27+b],[7,20+b],[11,17+b],[17,17+b],[22,13+b],[27,14+b],[30,18+b],[30,23+b],[26,26+b],[22,28],[15,27],[9,29]],null);pR9(q,hi,[[19,15+b],[21,8+b],[25,12+b]],null);pR9(q,hi,[[25,13+b],[29,7+b],[30,15+b]],null);eyePairR9(q,23,28,17+b,ac);q.fillStyle='#f3e3bd';q.fillRect(28,21+b,2,2);for(const[x,y]of[[9,20],[13,18],[17,20],[21,17],[25,23],[13,25]])lR9(q,x,y+b,x+3,y+3+b,'#6c452b',2);for(const[x,y]of[[9,28],[20,27],[25,25]])lR9(q,x,y+b,x-1,y+6+b,hi,2);for(const[x,y]of[[9,20],[14,20],[19,22],[24,15]]){lR9(q,x,y+b,x+2,y+3+b,'#704626',1)}lR9(q,10,17+b,19,18+b,'#fff0bd',.8);break}
  default:{shadow1012(q,16,33,23);pR9(q,base,[[8,15+b],[16,8+b],[24,15+b],[27,31],[16,34],[5,31]]);eR9(q,16,10+b,5,5,hi);eyePairR9(q,13,20,10+b,ac);break}
 }
 ACTOR_CACHE.set(key,c);return c
}
const ACTOR_RARITY_HI={common:'#a99c83',rare:'#73b9d1',relic:'#c49ade',sealed:'#e6c765'};
function playerCanvas(id='wanderer',p=null,dir='down',attack=false){
 p=p||{armor:{name:'경량복',rarity:'common',tier:1}};const key='r10|'+playerKey1012(id,p,dir,attack);if(PCACHE.has(key))return PCACHE.get(key);const[c,q]=actorSpriteCanvas(p),armor=p.armor||{},tier=armor.tier||1,ahi=ACTOR_RARITY_HI[armor.rarity]||'#9f9179';q.clearRect(0,0,32,36);shadow1012(q,16,34,id==='escort'?22:18);
 // Back-layer cloak follows the actual in-game equipment but never turns the body into a single block.
 if(p.cloak){const cc=p.cloak.rarity==='sealed'?'#6d4b29':p.cloak.rarity==='relic'?'#573955':'#403630';pR9(q,cc,[[9,13],[16,10],[23,13],[25,29],[20,27],[17,34],[13,29],[7,30]]);q.globalAlpha=.48;lR9(q,10,15,9,28,ACTOR_RARITY_HI[p.cloak.rarity]||'#8b7257',1);q.globalAlpha=1}
 if(id==='escort'){
   // Stockier trained guard: small head, high shoulders, pinched waist, separated greaves.
   eR9(q,16,7,4,3.7,'#b89570');pR9(q,'#39464a',[[10,6],[12,2],[20,2],[23,6],[21,10],[11,10]],null);q.fillStyle='#8f302c';q.fillRect(15,0,2,4);q.fillRect(18,1,2,3);eyePairR9(q,13,19,7,'#edd9a9');
   pR9(q,'#4c5550',[[10,12],[21,12],[25,17],[22,26],[19,28],[13,28],[9,25],[6,17]]);pR9(q,'#3b4745',[[6,15],[10,13],[11,25],[7,27],[4,21]],null);pR9(q,'#3b4745',[[25,15],[21,13],[20,25],[24,27],[28,21]],null);
   q.fillStyle=ahi;q.fillRect(10,14,12,2);q.fillRect(11,19,10,2);q.fillStyle='#9b7447';q.fillRect(10,23,12,2);q.fillStyle='#22292a';q.fillRect(12,27,4,6);q.fillRect(18,27,4,6);bootR9(q,10,32,6);bootR9(q,18,32,6);q.fillStyle='#c39a55';q.fillRect(7,17,2,7);
 }else if(id==='swordsman'){
   // Lean forward-biased scout. One shoulder and one leg are offset so the silhouette reads as movement even at 32 px.
   eR9(q,16,7.5,3.8,3.8,'#bda097');pR9(q,'#172126',[[10,7],[12,3],[19,2],[23,5],[22,9],[19,11],[10,10]],null);eyePairR9(q,13.5,19,7.5,'#d9e4e1');q.fillStyle='#9b3a32';q.fillRect(8,11,16,2);q.fillRect(23,12,5,2);
   pR9(q,'#42656d',[[11,12],[20,12],[23,17],[21,27],[17,29],[12,27],[8,18]]);pR9(q,'#35545a',[[8,15],[11,13],[12,24],[7,28],[5,23]],null);pR9(q,'#567b82',[[20,14],[24,16],[26,22],[22,24]],null);
   q.fillStyle='#6f9298';q.fillRect(11,15,4,9);lR9(q,20,16,10,29,'#273b40',2);q.fillStyle='#263135';q.fillRect(11,27,4,6);pR9(q,'#263135',[[18,27],[22,28],[24,33],[19,33]],null);bootR9(q,9,32,6);bootR9(q,19,32,6);
 }else{
   // Investigator/wanderer: slim official travel robe, long coat split, document badge and gat. No chibi triangular poncho.
   eR9(q,16,7.5,4,3.6,'#b99a78');pR9(q,'#2b221c',[[10,6],[12,3],[20,3],[22,6],[21,10],[11,10]],null);q.fillStyle='#4b3527';q.fillRect(6,5,20,2);q.fillRect(14,1,4,4);eyePairR9(q,13.5,19,7.5,'#ead5a2');
   pR9(q,'#67523f',[[11,12],[21,12],[23,17],[21,28],[17,30],[16,34],[14,30],[10,28],[8,17]]);pR9(q,'#51402f',[[8,15],[11,13],[12,24],[7,27],[5,21]],null);pR9(q,'#51402f',[[24,15],[21,13],[20,24],[25,27],[27,21]],null);
   q.fillStyle='#a88a62';q.fillRect(11,15,3,9);q.fillStyle='#8f342d';q.fillRect(15,14,2,12);q.fillStyle='#d6b85f';q.fillRect(14,20,4,4);q.fillStyle='#28231f';q.fillRect(11,28,4,5);q.fillRect(18,28,4,5);bootR9(q,9,32,6);bootR9(q,18,32,6);
 }
 if(tier>=2){q.fillStyle=ahi;q.fillRect(11,18,10,1)}if(tier>=3){q.fillStyle=ahi;q.fillRect(11,23,10,1)}if(tier>=4){q.fillStyle=ahi;q.fillRect(9,16,2,6);q.fillRect(21,16,2,6)}
 if(p.relic){eR9(q,16,25,1.8,1.8,ACTOR_RARITY_HI[p.relic.rarity]||'#d2b15e',null);px1012(q,16,24,'#fff1af')}if(p.trinket){q.fillStyle=ACTOR_RARITY_HI[p.trinket.rarity]||'#b68d63';q.fillRect(24,25,2,2)}
 drawHeldWeapon(q,p,dir,attack);PCACHE.set(key,c);return c
}
function friendCanvas(boss=false,echo=false,frame=0){const key=`friend-r10|${boss}|${echo}|${frame}`;if(ACTOR_CACHE.has(key))return ACTOR_CACHE.get(key);const[c,q]=actorSpriteCanvas(),b=frame?1:0;shadow1012(q,16,34,18);q.globalAlpha=echo?.72:1;
  // Government investigator silhouette: narrow official cap, long dark-blue dopo, rank badge, document satchel and holstered sidearm.
  eR9(q,16,7+b,3.8,3.5,boss?'#a68170':'#ad9272');pR9(q,'#1d2a31',[[10,6+b],[12,3+b],[20,3+b],[22,6+b],[21,10+b],[11,10+b]],null);q.fillStyle='#253842';q.fillRect(7,5+b,18,2);q.fillRect(14,1+b,4,4);eyePairR9(q,13.5,19,7+b,boss?'#ef6758':'#bdd3d3');
  pR9(q,boss?'#26353b':'#273b45',[[11,12+b],[21,12+b],[23,17+b],[22,28+b],[18,30+b],[16,34],[13,30+b],[9,28+b],[8,17+b]]);pR9(q,'#35505b',[[8,15+b],[11,13+b],[12,25+b],[7,28+b],[5,22+b]],null);pR9(q,'#314954',[[24,15+b],[21,13+b],[20,25+b],[25,28+b],[27,22+b]],null);
  q.fillStyle=boss?'#8d382f':'#806447';q.fillRect(10,17+b,12,2);q.fillRect(15,14+b,2,13);q.fillStyle='#d0b668';q.fillRect(10,19+b,4,4);q.fillStyle='#182229';q.fillRect(11,28+b,4,5);q.fillRect(18,28+b,4,5);bootR9(q,9,32,6);bootR9(q,18,32,6);
  // Satchel and short service pistol are small identity cues, not combat spoilers.
  pR9(q,'#5a4534',[[5,20+b],[10,19+b],[10,28+b],[5,29+b]],null);lR9(q,9,16+b,5,21+b,'#8b6b4a',1);lR9(q,23,23+b,29,21+b,'#53575b',2);q.fillStyle='#24272b';q.fillRect(28,20+b,3,3);
  if(boss){ // Preserve the same investigator silhouette while corruption grows through it rather than replacing it with a generic red box.
    q.globalAlpha=.75;for(const [x1,y1,x2,y2]of[[8,13,3,4],[22,14,30,7],[10,25,3,33],[21,24,29,34]])lR9(q,x1,y1+b,x2,y2,'#9d3a32',2);q.globalAlpha=.32;glowR9(q,16,19,13,'rgba(184,53,43,.60)');q.globalAlpha=1;eyePairR9(q,13.5,19,7+b,'#ff6b58')}
  q.globalAlpha=1;ACTOR_CACHE.set(key,c);return c}
// r40: the visible class-selection art from v10.0.4 is the canonical player source requested by the user. Use that source itself; do not redraw a parallel preview skin.
const canonicalPlayerCanvas=playerCanvasForClass||playerCanvas;
const ACTOR_ART=Object.freeze({
  player:(id='wanderer',gear=null,dir='down',attack=false)=>canonicalPlayerCanvas(id,gear||startingGearFor(id),dir,attack),
  friend:(boss=false,echo=false,frame=0)=>friendCanvas(!!boss,!!echo,frame|0),
  monster:(m,frame=0)=>monsterCanvas(m,frame|0),
  startGear:startingGearFor,
  classPreview:(id='wanderer')=>canonicalPlayerCanvas(id,startingGearFor(id),'down',false),
  classPreviewData:(id='wanderer')=>canonicalPlayerCanvas(id,startingGearFor(id),'down',false).toDataURL('image/png'),
  friendPreviewData:(boss=false)=>friendCanvas(!!boss,false,0).toDataURL('image/png'),
  drawWorld:drawWorldCreature,
  clear:()=>{ACTOR_CACHE.clear();PCACHE.clear();clearPlayerArt();renderClassGrid();return true}
});
function renderSprite(m,c,player=false){const now=FX.frameNow??performance.now(),point=actorPresentationPoint(m,player,now),px=point.x-TILE/2,py=point.y-TILE/2,hit=player?(state.playerHitUntil||0)>now:(m.hitUntil||0)>now,dormantMimic=!player&&m.treeMimic105&&m.mimicDormant105!==false;X.save();
  const fp=player?[[0,0]]:(typeof footprintOffsets==='function'?footprintOffsets(m):[[0,0]]);if(fp.length>1){X.fillStyle='rgba(0,0,0,.11)';for(const[ox,oy]of fp)X.fillRect((m.x+ox)*TILE+5,(m.y+oy)*TILE+20,22,8)}
  if(!player&&m.summonOwner105==='player'&&m.aquatic){X.fillStyle='rgba(66,143,177,.20)';X.beginPath();X.ellipse(px+16,py+31,13,4,0,0,Math.PI*2);X.fill();X.strokeStyle='rgba(126,207,224,.50)';X.lineWidth=1;X.beginPath();X.ellipse(px+16,py+31,10+Math.sin(now/420+m.x)*1.2,3,0,.2,Math.PI*1.75);X.stroke();}
  if(!dormantMimic){X.fillStyle='rgba(0,0,0,.35)';X.fillRect(px+8,py+28,16,3)}if(m.boss&&!player){X.globalCompositeOperation='screen';const g=X.createRadialGradient(px+16,py+15,4,px+16,py+15,26);g.addColorStop(0,'rgba(226,176,85,.14)');g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(px-10,py-12,52,55);X.globalCompositeOperation='source-over'}
  X.imageSmoothingEnabled=false;const sc=player?(bodyPowerActive()?1.20:1):(m.summonOwner105==='player'?1:m.boss?1.18:(fp.length>1?1.10:1)),dw=c.width/(c.actorResolution105||1)*sc,dh=c.height/(c.actorResolution105||1)*sc,box=actorSpriteRect(c,px,py,sc),spriteTop=box.y-(m.flying&&!player?4+Math.sin(now/320)*2:0);if(!player&&aquaticStranded(m)){const phase=(now/115+m.x*1.7+m.y)%10,hop=phase<3?Math.sin(phase*Math.PI/3):0;X.save();X.translate(px+16,py+24-hop*5);X.rotate(.55+Math.sin(phase*3)*.22*(hop>0?1:.15));X.drawImage(c,-dw/2,-dh+8,dw,dh);X.restore()}else X.drawImage(c,box.x,spriteTop,dw,dh);if(hit&&player){X.globalCompositeOperation='screen';X.fillStyle='rgba(255,78,78,.28)';X.fillRect(px+5,py+2,22,28);X.globalCompositeOperation='source-over'}if(m.boss&&!player){X.strokeStyle='rgba(232,190,103,.60)';X.lineWidth=1.5;X.strokeRect(px+1.5,py-2.5,29,34)}if(m.hp!==undefined&&m.maxHp!==undefined&&m.hp<m.maxHp&&!m.boss&&!player&&!dormantMimic){X.fillStyle='#160706';X.fillRect(px+5,py-3,22,3);X.fillStyle='#a84439';X.fillRect(px+5,py-3,Math.max(1,22*m.hp/m.maxHp),3)}if(m.alerted&&!m.boss&&!player&&!dormantMimic){X.fillStyle='#f08b66';X.font='900 10px system-ui';X.textAlign='center';X.fillText('!',px+16,py-3);X.textAlign='start'}if(!player&&!dormantMimic)drawCombatStatusBadges(m,px+16,Math.min(spriteTop-3,py-15));X.restore();return true}
function drawWorldCreature(m){if(!m||m.hidden&&!m.boss)return false;const player=!!(state&&m.shape==='player'&&m.name==='player'),friend=m.name==='선행 조사관의 인영'||m.name==='실종된 선행 조사관'||m.storyPhase992===1;if(player){const now=performance.now(),c=ACTOR_ART.player(state.player.classId||'wanderer',state.player,dir1012(m,true),(state.playerAttackUntil||0)>now);X.save();if(state.status?.stealth>0)X.globalAlpha*=.22;const r=renderSprite(m,c,true);X.restore();return r}if(friend){const c=ACTOR_ART.friend(!!(m.storyPhase992===1||m.boss),m.name==='선행 조사관의 인영',((performance.now()/430)|0)&1);return renderSprite(m,c,false)}const c=monsterCanvas(m,((performance.now()/430+m.x*3+m.y)|0)&1);return renderSprite(m,c,false)}
const rarityCol={common:'#b9aa8d',uncommon:'#91b889',rare:'#7eb4d1',relic:'#c493dc',sealed:'#e7bc55',legendary:'#e8c75d',artifact:'#ef8b45'};
const tierMetal=['#a99a82','#bdad8c','#c9b889','#d1b36e','#e3c66d'];
function drawBlade(q,st,m,hi,wood){
 if(st==='royal_sword'){
  q.save();q.translate(22,30);q.rotate(.35);
  poly(q,'#101e3a',[[-5,1],[-5,-18],[0,-28],[5,-18],[5,1]]);
  poly(q,'#286fa7',[[-4,0],[-4,-18],[0,-26],[4,-18],[4,0]]);
  poly(q,'#92e7ff',[[0,-26],[4,-18],[4,0],[2,-2],[1,-18]]);poly(q,'#3daada',[[-3,-17],[0,-23],[0,-1],[-3,0]]);
  for(const y of[-17,-9])poly(q,'#ecfdff',[[0,y-3],[1,y-1],[3,y],[1,y+1],[0,y+3],[-1,y+1],[-3,y],[-1,y-1]]);
  poly(q,'#e4c27f',[[-11,-3],[-6,-1],[0,-3],[6,-1],[11,-3],[8,3],[0,2],[-8,3]]);ell(q,'#112e5e',0,1,3,2);itemArtDot(q,0,0,'#b4edff');
  rect(q,-2,4,5,9,'#203f66');for(const y of[5,8,11])line(q,-2,y,3,y+1,'#a7c6d8',1);poly(q,'#e8cc90',[[-3,13],[3,13],[4,16],[0,18],[-4,16]]);ell(q,'#5bc4f1',0,15,1.5,1.5);q.restore();
  for(const[x,y,r]of[[12,11,3],[35,18,2],[12,29,1.5]]){line(q,x-r,y,x+r,y,'#b5e6fc',.8);line(q,x,y-r,x,y+r,'#edfaff',.8)}return;
 }

 const dagger=['rough_dagger','twin_dagger','assassin'].includes(st),royal=st==='royal_sword',heavy=st==='heavy_sword',curved=st==='hwando'||st==='tachi',long=st==='glaive',gold=royal?'#dbbb72':'#a68a59';
 const one=(offset=0,flip=false)=>{q.save();q.translate(offset,0);if(flip){q.translate(48,0);q.scale(-1,1)}q.translate(23,29);q.rotate(.35);
 const top=st==='rough_dagger'?-16:st==='assassin'?-22:dagger?-19:st==='short_sword'?-20:long?-23:-25,w=heavy?5:st==='assassin'?2:dagger?2.8:3.4;
 if(curved){q.beginPath();q.moveTo(-3,1);q.quadraticCurveTo(7,-13,3,top);q.quadraticCurveTo(13,-11,3,2);q.closePath();q.fillStyle='#252b30';q.fill();q.beginPath();q.moveTo(-1,0);q.quadraticCurveTo(8,-13,4,top+3);q.quadraticCurveTo(11,-11,2,0);q.closePath();q.fillStyle=m;q.fill();q.strokeStyle='#e9ede1';q.lineWidth=.8;q.beginPath();q.moveTo(2,0);q.quadraticCurveTo(11,-12,4,top+2);q.stroke()}
 else if(long){poly(q,'#202c32',[[-2,-2],[-2,-22],[3,-24],[10,-16],[8,-7],[2,-2]]);poly(q,m,[[0,-21],[3,-22],[8,-16],[6,-9],[0,-5]]);poly(q,'#e0e7dc',[[3,-22],[8,-16],[6,-9],[4,-8],[6,-16]])}
 else{poly(q,'#212a30',[[-w-1,1],[-w-1,top+7],[0,top-1],[w+1,top+7],[w+1,1]]);poly(q,m,[[-w,0],[-w,top+7],[0,top],[w,top+7],[w,0]]);poly(q,'#e2e7dd',[[0,top],[w,top+7],[w,0],[w-1,0],[0,top+4]]);poly(q,'#61737b',[[-w,0],[-w,top+7],[0,top+2],[0,0]]);if(royal){q.strokeStyle='#b79c60';q.lineWidth=.8;q.beginPath();q.moveTo(0,-4);q.lineTo(0,-17);q.stroke();for(let y=-6;y>-19;y-=4)ell(q,'#f2d186',0,y,1,.7)}}
 if(heavy){poly(q,'#ae7234',[[-7,-2],[-6,-10],[-4,-6],[4,-6],[6,-10],[7,-2]]);line(q,0,-21,0,-8,'#e8b85f',1.2);for(const y of[-17,-12])poly(q,'#eacf80',[[0,y-2],[2,y],[0,y+2],[-2,y]]);}
 if(st==='rough_dagger'){poly(q,'#27343a',[[2,-10],[4,-12],[4,-8]]);rect(q,-1,-5,1,3,'#738071')}if(st==='steel_sword'){ell(q,'#476f76',0,-2,1.4,1.5)}if(!long){poly(q,'#262323',[[-8,-1],[7,-1],[9,2],[3,3],[-3,3],[-9,2]]);poly(q,gold,[[-7,0],[6,0],[7,1.5],[-7,1.5]]);ell(q,'#f0d69a',0,1,2.8,2)}
 if(long){rect(q,-1,-9,3,27,wood);rect(q,-1,-9,1,26,'#b89062');rect(q,-2,-4,5,2,'#a69c7a')}rect(q,-2,3,5,long?13:11,st==='assassin'?'#413e49':wood);rect(q,-2,3,1,11,'#aa7853');for(let y=4;y<14;y+=2){q.strokeStyle=royal?'#ce8c80':'#b19b7b';q.lineWidth=.8;q.beginPath();q.moveTo(-2,y);q.lineTo(2,y+1);q.stroke()}poly(q,gold,[[-3,13],[3,13],[3,15],[0,17],[-3,15]]);if(royal){ell(q,'#315b62',0,1,1.4,1.2);q.strokeStyle='#985447';q.lineWidth=1;q.beginPath();q.moveTo(0,16);q.quadraticCurveTo(8,17,5,22);q.stroke()}
 q.restore()};if(st==='twin_dagger'){one(-7);one(8,true)}else one();
}
function drawBow(q,st,m,hi,wood){
 const horn=st==='horn_bow',iron=st==='iron_bow',siege=st==='siege_bow',mil=st==='mil_bow',c=iron?'#5e747d':horn?'#dfcfaa':wood;
 q.save();q.translate(24,24);q.rotate(-.3);
 q.beginPath();q.moveTo(3,-20);q.bezierCurveTo(-3,-20,-11,-9,-7,0);q.bezierCurveTo(-11,9,-3,20,3,20);q.strokeStyle='#171d20';q.lineWidth=siege?7:5;q.stroke();q.strokeStyle=c;q.lineWidth=siege?4.5:3;q.stroke();q.strokeStyle=iron?'#c5dedf':horn?'#f3e1b8':'#c59a69';q.lineWidth=.8;q.stroke();
 q.strokeStyle='#d5ccb2';q.lineWidth=.65;q.beginPath();q.moveTo(3,-20);q.lineTo(siege?5:1,0);q.lineTo(3,20);q.stroke();
 rect(q,-9,-4,5,8,mil?'#853f34':'#47372d');for(let y=-3;y<4;y+=2)rect(q,-9,y,5,1,'#b99d70');
 for(const y of[-15,13]){q.save();q.translate(-3,y);q.rotate(y<0?.5:-.5);rect(q,-2,-2,4,5,iron?'#baad79':mil?'#b29259':'#54442e');rect(q,-2,-2,1,5,hi);q.restore()}
 if(siege){line(q,-13,3,13,-3,'#b5b6a0',2);poly(q,'#e7e8d3',[[14,-4],[18,-4],[15,-1]]);rect(q,-14,1,4,5,'#7c4c37')}
 if(iron){for(const d of[-1,1]){poly(q,'#c4a65b',[[-4,d*13],[-8,d*17],[-5,d*22],[0,d*20],[-2,d*17]]);line(q,-5,d*16,-3,d*19,'#f6e4a8',1)}ell(q,'#387e8b',-7,0,2,3);line(q,-9,-2,-5,2,'#b4eeee',.7)}
 q.restore();
}
function drawSpear(q,st,m,hi,wood){
 q.save();q.translate(23,25);q.rotate(.28);const bamboo=st==='bamboo_spear';line(q,0,20,0,-12,bamboo?'#7f9768':wood,3);rect(q,-1,-9,1,29,bamboo?'#c6d09c':'#b88756');for(const y of[-2,8,17]){rect(q,-2,y,5,1,bamboo?'#3e6145':'#442f24');rect(q,-2,y+1,4,1,bamboo?'#b2bf87':'#aa784a')}
 const head=(x,y,w,h)=>{poly(q,'#28343a',[[x,y-h],[x+w,y-3],[x+1,y+2],[x-w,y-3]]);poly(q,m,[[x,y-h+1],[x+w-1,y-3],[x,y+1],[x-w+1,y-3]]);poly(q,'#e5e8d7',[[x,y-h+1],[x+w-1,y-3],[x,y+1]]);q.strokeStyle='#668087';q.lineWidth=.6;q.beginPath();q.moveTo(x,y-h+3);q.lineTo(x,y);q.stroke()};head(0,-10,bamboo?3:4,bamboo?8:12);
 if(st==='dangpa'||st==='tri_spear'){const tr=st==='dangpa';for(const d of[-1,1]){line(q,0,-7,d*7,-10,m,2);head(d*7,-11,2.5,tr?8:5)}}
 rect(q,-2,-9,5,3,'#a79569');rect(q,-2,-9,5,1,hi);if(!bamboo){poly(q,'#8b3e36',[[2,-8],[9,-5],[5,3],[4,-2],[1,-4]]);poly(q,'#d0885e',[[2,-7],[6,-4],[4,-1]],null)}q.restore();
}
function drawBlunt(q,st,m,hi,wood){
 q.save();q.translate(23,26);q.rotate(.25);line(q,0,17,0,-12,wood,4);rect(q,-1,-9,1,24,'#b38355');for(let y=9;y<17;y+=2)rect(q,-2,y,5,1,'#ccb089');rect(q,-3,17,6,2,'#928572');
 if(st==='club'){poly(q,'#332c23',[[-3,5],[-6,-14],[-3,-21],[3,-20],[6,-15],[3,5]]);poly(q,'#866341',[[-3,3],[-4,-14],[-1,-19],[3,-17],[4,-12],[2,3]]);for(const x of[-2,1]){q.strokeStyle='#b99a6a';q.lineWidth=.8;q.beginPath();q.moveTo(x,-15);q.lineTo(x+1,-2);q.stroke()}ell(q,'#403727',1,-10,1,2)}
 else if(st==='sickle'){q.strokeStyle='#273139';q.lineWidth=6;q.beginPath();q.arc(0,-12,10,-2.5,.85);q.stroke();q.strokeStyle='#b5c7c6';q.lineWidth=3;q.stroke();poly(q,'#e5e8d4',[[8,-6],[2,-2],[7,-10]])}
 else if(st==='flail'){for(let i=0;i<5;i++){ell(q,'#232a2c',i*2,-9-i*2,2.8,2);ell(q,'#b2b8a8',i*2,-9-i*2,1.8,1.2);ell(q,'#2f373a',i*2,-9-i*2,.9,.5)}ell(q,'#303c41',11,-20,6,6);poly(q,m,[[6,-22],[10,-25],[15,-22],[14,-17],[9,-16]]);for(const d of[-1,1])poly(q,hi,[[11+d*4,-23],[11+d*8,-25],[11+d*5,-20]]);itemArtDot(q,9,-22,'#eceddb')}
 else if(st==='hand_axe'||st==='battle_axe'){const big=st==='battle_axe';poly(q,'#253239',[[-3,-17],[-9,-19],[-15,-12],[-13,-5],[-4,-10],[3,-10],[4,-17]]);poly(q,m,[[-4,-16],[-9,-17],[-13,-12],[-12,-7],[-4,-12],[2,-12],[2,-16]]);poly(q,'#e3e8dc',[[-10,-18],[-14,-12],[-12,-6],[-10,-8],[-12,-12]]);if(big){poly(q,m,[[2,-17],[8,-19],[14,-12],[12,-6],[3,-10]]);poly(q,hi,[[9,-18],[13,-12],[11,-7],[10,-9],[11,-12]])}rect(q,-2,-18,4,9,'#849496');itemArtDot(q,-1,-16,hi)}
 else if(st==='hex_staff'){poly(q,'#303b40',[[-3,18],[-4,-22],[0,-25],[4,-22],[3,18]]);rect(q,-2,-22,2,39,'#a5b4b4');rect(q,1,-21,2,38,'#586c74');for(const y of[-20,-11,1,12])rect(q,-4,y,8,2,'#c1ac78')}
 else if(st==='vajra'){for(const d of[-1,1]){q.strokeStyle='#dbbd72';q.lineWidth=2;q.beginPath();q.moveTo(0,-4);q.bezierCurveTo(d*10,-10,d*7,-17,0,-22);q.stroke()}poly(q,'#e7d394',[[0,-24],[3,-15],[0,-6],[-3,-15]]);ell(q,'#a68045',0,-5,5,2);ell(q,'#f1d79b',0,-5,3,1)}
 else{const claw=st==='claw_hammer',wide=st==='forge_hammer'?13:st==='warhammer'?12:9;poly(q,'#273239',[[-wide,-20],[wide-2,-20],[wide,-17],[wide,-7],[-wide,-7],[-wide-2,-10]]);poly(q,m,[[-wide+1,-18],[wide-2,-18],[wide-1,-9],[-wide+1,-9]]);poly(q,'#d4ddcf',[[-wide,-20],[wide-2,-20],[wide-1,-17],[-wide+1,-17]]);rect(q,wide-4,-17,3,8,'#596e76');rect(q,-wide+2,-15,wide*2-8,1,hi);if(claw){poly(q,'#83969b',[[-9,-17],[-15,-22],[-16,-18],[-10,-12]]);rect(q,-15,-21,2,3,'#20282d')}if(st==='forge_hammer'){for(const x of[-11,7])rect(q,x,-18,3,10,'#b79a5d')}ell(q,'#384b50',0,-13,2,2);itemArtDot(q,-1,-14,'#e7dac0')}
 q.restore();
}
function drawGauntlet(q,m,hi){
 for(const [x,y,rot]of[[14,25,-.2],[33,23,.2]]){q.save();q.translate(x,y);q.rotate(rot);poly(q,'#253138',[[-7,-10],[-5,-16],[5,-16],[8,-10],[7,9],[4,13],[-5,13],[-8,7]]);poly(q,m,[[-6,-9],[-4,-14],[4,-14],[6,-9],[5,8],[3,11],[-4,11],[-6,6]]);for(let i=0;i<3;i++){rect(q,-5+i*3,-13,2,5,hi);rect(q,-5+i*3,-8,2,1,'#4b626b')}poly(q,'#c2cfc9',[[-5,-5],[0,-7],[5,-4],[4,3],[0,5],[-5,2]]);poly(q,'#738991',[[0,-6],[5,-4],[4,3],[0,5]]);rect(q,-5,6,10,2,'#4d3b2b');rect(q,-5,7,10,1,'#bda477');for(const d of[-1,1])itemArtDot(q,d*4,6,hi);q.restore()}
}
function drawArtifactWeapon(q,it){
  const id=it.artifactId46,ink='#1b1210';
  if(id==='ember_axe'){line(q,13,42,28,13,'#5f3522',5);poly(q,ink,[[22,8],[39,10],[34,24],[23,22]]);poly(q,'#d8562d',[[23,10],[36,12],[32,21],[24,20]]);poly(q,'#f2a24b',[[27,17],[30,8],[33,16],[37,13],[34,23]]);line(q,24,11,34,13,'#ffe5a0',.7);line(q,26,21,32,22,'#8a3429',1);for(const y of[31,35,39])line(q,14,y,19,y-2,'#b28c62',.7);return}
  if(id==='water_crossbow'){poly(q,ink,[[7,17],[37,17],[43,23],[37,29],[7,29]]);rect(q,9,19,28,8,'#24586a');rect(q,14,21,22,4,'#7bdcf2');line(q,8,11,8,35,'#bceffc',4);line(q,39,11,39,35,'#bceffc',4);line(q,7,12,40,20,'#dffbff',1);line(q,7,34,40,26,'#dffbff',1);poly(q,'#3f6f79',[[21,29],[29,29],[24,43],[17,43]]);rect(q,18,12,12,7,'#16343d');ell(q,'#58c9e8',24,15,5,3);itemArtDot(q,25,14,'#f2feff');line(q,30,23,45,23,'#e8fbff',2);poly(q,'#9eeeff',[[45,20],[49,23],[45,26]]);for(const [x,y]of[[11,20],[34,20],[21,32]]){ell(q,'#153842',x,y,1.6,1.6);itemArtDot(q,x,y,'#e0f6e9')}line(q,19,38,24,33,'#9fbcb2',.8);return}
  if(id==='thunder_spear'){line(q,12,43,31,8,'#435f69',4);poly(q,ink,[[29,10],[34,2],[38,12]]);poly(q,'#9ce7f2',[[31,10],[34,4],[36,10]]);for(const a of [[[15,33],[23,29],[20,24],[29,21]],[[22,19],[29,16],[26,12],[34,9]]]){q.strokeStyle='#d9fbff';q.lineWidth=2;q.beginPath();q.moveTo(...a[0]);for(const z of a.slice(1))q.lineTo(...z);q.stroke()}poly(q,'#ecfffa',[[34,4],[36,10],[34,12],[35,9]]);for(const y of[34,38,42])line(q,12,y,17,y-2,'#a7d1d5',.8);return}
  if(id==='curse_blade'){line(q,12,42,20,33,'#3f252d',4);poly(q,ink,[[18,35],[20,10],[28,3],[34,9],[27,16],[32,22],[24,35]]);poly(q,'#8d3558',[[21,32],[23,12],[28,7],[30,10],[24,18],[28,22],[23,33]]);for(const z of [[28,8],[25,19],[25,28]])itemArtDot(q,z[0],z[1],'#e884a8');line(q,25,13,24,16,'#e4abc4',.7);line(q,27,24,24,30,'#e4abc4',.7);for(const y of[35,38])line(q,13,y,18,y-1,'#9d6c7d',.8);return}
  if(id==='earth_gauntlet'){drawGauntlet(q,'#9a824f','#e0c878');for(const z of [[12,20],[18,29],[32,18],[35,28]]){rect(q,z[0],z[1],3,3,'#5e4930');itemArtDot(q,z[0]+1,z[1],'#f0d28b')}return}
  if(id==='mirror_blade'){line(q,12,42,20,32,'#66554a',4);poly(q,ink,[[18,34],[23,7],[29,3],[31,10],[25,35]]);poly(q,'#cfe0e4',[[21,32],[25,9],[28,6],[28,11],[23,33]]);line(q,24,13,28,22,'#ffffff',1);line(q,22,25,26,30,'#8ba3b2',1);rect(q,15,31,14,3,'#b99862');poly(q,'#f3fcf2',[[25,11],[27,8],[25,22],[23,24]]);ell(q,'#52767b',22,32,2,1.3);itemArtDot(q,22,31,'#cff6e7');return}
  if(id==='curse_spear'){line(q,12,43,31,9,'#493442',5);poly(q,ink,[[28,12],[34,2],[40,12],[34,19]]);poly(q,'#825275',[[31,11],[34,5],[37,11],[34,16]]);for(const y of[18,25,32])line(q,20+(32-y)*.35,y,26+(32-y)*.35,y-3,'#c16e9c',2);poly(q,'#c09cb8',[[34,5],[37,11],[34,16],[35,11]]);ell(q,'#572d4d',34,11,1,2);line(q,13,40,17,39,'#e1b0c5',1);return}
  if(id==='lava_bow'){q.strokeStyle='#4a2118';q.lineWidth=6;q.beginPath();q.arc(22,24,17,-1.35,1.35);q.stroke();q.strokeStyle='#ed6b31';q.lineWidth=3;q.beginPath();q.arc(22,24,17,-1.35,1.35);q.stroke();q.strokeStyle='#ffcf67';q.lineWidth=1;q.beginPath();q.moveTo(27,7);q.lineTo(27,41);q.stroke();for(const z of [[15,14],[11,25],[16,35]])itemArtDot(q,z[0],z[1],'#ff9a42');q.strokeStyle='#ffce88';q.lineWidth=.8;q.beginPath();q.arc(22,24,18,-1.25,1.25);q.stroke();for(const y of[19,22,25,28])rect(q,37,y,4,1,'#79453b');return}
  if(id==='chain_sickle'){line(q,12,42,22,27,'#64452b',4);q.strokeStyle='#c7aa78';q.lineWidth=4;q.beginPath();q.arc(27,17,11,-2.1,.6);q.stroke();for(const [x,y] of [[23,29],[28,32],[33,35],[37,39]]){ell(q,'#2b241e',x,y,4,3);ell(q,'#c4ad7f',x,y,2,2)}q.strokeStyle='#f4e6bd';q.lineWidth=.8;q.beginPath();q.arc(27,17,12,-2.1,.6);q.stroke();for(const y of[32,36,40])line(q,12,y,18,y-2,'#b29879',.8);return}
  if(id==='ward_hammer'){line(q,13,43,24,20,'#5a4127',5);outlineRect(q,11,8,27,14,ink);rect(q,13,10,23,10,'#c3a34e');rect(q,17,12,15,6,'#e7ce72');line(q,24,11,24,19,'#7a5b23',2);line(q,19,15,29,15,'#7a5b23',2);poly(q,'#f8e3a1',[[13,10],[35,10],[33,12],[15,12]]);rect(q,34,12,2,8,'#7c6337');for(const x of[15,33])itemArtDot(q,x,18,'#f5daa0');return}
}
function drawWeapon(q,it){
  if(it.artifactWeapon46){drawArtifactWeapon(q,it);return}
  const tier=Math.max(1,Math.min(5,it.tier||1)),m=tierMetal[tier-1],hi=shade(m,42),wood=tier>=4?'#744526':'#603a25',st=WEAPON_STYLE[it.name]||it.kind||'blade';
  if(st==='iron_gauntlet'||it.kind==='brawl')drawGauntlet(q,m,hi);
  else if(['hunt_bow','mil_bow','horn_bow','siege_bow','iron_bow'].includes(st))drawBow(q,st,m,hi,wood);
  else if(['bamboo_spear','iron_spear','tri_spear','dangpa'].includes(st))drawSpear(q,st,m,hi,wood);
  else if(['club','claw_hammer','sickle','hand_axe','flail','iron_maul','hex_staff','battle_axe','warhammer','vajra','forge_hammer'].includes(st))drawBlunt(q,st,m,hi,wood);
  else drawBlade(q,st,m,hi,wood);
}
function drawArmor(q,it){
 const st=ARMOR_STYLE[it.name]||'light',gold=st==='gold',light=st==='light',leather=st==='leather',duj=st==='dujeong',metal=gold?'#c59b46':st==='breast'?'#9dacad':'#a78c60',cloth=light?'#8b9587':leather?'#75503d':duj?'#6d3d3a':gold?'#713937':'#344b54';
 const outline=[[14,7],[20,5],[28,5],[34,7],[41,16],[37,26],[33,24],[34,40],[25,43],[24,36],[23,43],[14,40],[15,24],[11,26],[7,16]];
 poly(q,'#172126',outline);poly(q,cloth,[[15,9],[20,7],[28,7],[33,9],[38,17],[35,23],[31,20],[32,38],[26,40],[24,31],[22,40],[16,38],[17,20],[13,23],[10,17]]);
 poly(q,shade(cloth,30),[[15,10],[20,8],[22,12],[18,24],[17,36],[19,38],[15,37],[16,20],[12,21],[12,16]]);poly(q,shade(cloth,-24),[[28,9],[33,11],[36,17],[34,21],[31,18],[31,37],[27,39],[26,27]],null);
 poly(q,'#252d2c',[[19,6],[29,6],[27,13],[24,15],[20,12]]);poly(q,light?'#e0d6b5':'#b39465',[[19,7],[24,12],[29,7],[28,11],[24,16],[20,12]]);
 if(light){for(const [x,y]of[[18,18],[19,24],[28,17],[29,28]]){q.strokeStyle='#bcc0a8';q.lineWidth=.8;q.beginPath();q.moveTo(x,y);q.lineTo(x-1,y+7);q.stroke()}line(q,23,15,20,30,'#53645f',1);rect(q,27,22,4,4,'#6c7e72');rect(q,27,22,4,1,'#c0bfa4')}
 else if(leather){poly(q,'#a47750',[[18,13],[23,16],[30,12],[31,27],[18,28]]);poly(q,'#614330',[[24,16],[29,14],[30,26],[24,27]]);for(const y of[17,22,27]){rect(q,17,y,15,1,'#d1ae79');for(const x of[18,29])itemArtDot(q,x,y-1,'#edd19a')}line(q,19,12,28,29,'#42372b',2);for(const y of[17,21,25])itemArtDot(q,21+(y-17)*.5,y,'#dec092')}
 else if(st==='breast'){poly(q,'#2d414a',[[17,12],[23,15],[30,12],[33,20],[30,28],[24,31],[17,27],[15,20]]);poly(q,metal,[[18,13],[24,17],[29,13],[31,20],[28,27],[24,29],[18,26],[17,20]]);poly(q,'#d8e3dc',[[18,14],[23,17],[23,27],[19,25],[18,20]]);poly(q,'#5b7780',[[25,17],[29,15],[30,20],[27,26],[25,28]]);for(const d of[-1,1]){poly(q,'#687f83',[[24+d*8,10],[24+d*13,14],[24+d*12,18],[24+d*7,16]]);line(q,24+d*8,10,24+d*13,14,'#d1d8c5',1)}for(const y of[30,34,38]){rect(q,17,y,6,2,'#899994');rect(q,26,y,5,2,'#5e767b')}}
 else{for(let y=15;y<38;y+=4)for(let x=17+(y%8?0:2);x<31;x+=4){if(gold){poly(q,'#6c512d',[[x-1,y],[x+3,y],[x+3,y+3],[x+1,y+4],[x-1,y+2]]);poly(q,'#d4b363',[[x,y],[x+2,y],[x+2,y+2],[x+1,y+3],[x,y+2]]);itemArtDot(q,x,y,'#f4dda0')}else{rect(q,x,y,1,2,'#d3b67c');itemArtDot(q,x,y,'#f0d6a0')}}for(const d of[-1,1]){poly(q,metal,[[24+d*8,9],[24+d*14,14],[24+d*12,20],[24+d*7,16]]);line(q,24+d*8,10,24+d*13,14,'#e9d299',1)}if(gold){ell(q,'#73532e',24,20,5,5);ell(q,'#e6c67d',24,20,3.5,3.5);poly(q,'#923f38',[[24,16],[26,20],[24,24],[22,20]]);itemArtDot(q,23,18,'#f5ddaa')}}
 rect(q,16,29,16,3,'#342e26');rect(q,16,29,16,1,'#b39969');outlineRect(q,22,28,5,4,'#bda16a');rect(q,23,29,3,2,'#484436');for(const x of[14,30]){rect(q,x,37,4,3,'#3a332b');itemArtDot(q,x+1,37,'#c8af78')}
}
function drawCloak(q,it){
 const h=hash(it.name),base=['#6b4c3d','#3f5d5d','#5b5146','#6b5f52','#3c344b','#4f535e','#4f4a45','#594539','#4a5c4b','#4e5762','#6b3a2f','#5e5840'][h%12],hi=shade(base,45),st=CLOAK_EMBLEM[it.name]||'stitch';
 poly(q,'#17110f',[[15,7],[33,7],[39,41],[29,38],[24,44],[19,38],[9,41]]);
 poly(q,base,[[16,9],[32,9],[36,38],[28,35],[24,41],[20,35],[12,38]]);rect(q,20,6,8,6,shade(base,-25));
 if(st==='stitch'){for(const y of[18,25,32])for(const x of[17,23,29])itemArtDot(q,x,y,hi)}
 else if(st==='wind'){for(const y of[18,24,30]){line(q,15,y,31,y-3,hi,1);line(q,20,y+2,34,y,hi,1)}}
 else if(st==='pocket'){outlineRect(q,16,27,7,7,shade(base,-20));outlineRect(q,26,27,7,7,shade(base,-20))}
 else if(st==='quilt'){for(let y=16;y<36;y+=5)for(let x=16;x<33;x+=6)rect(q,x,y,5,4,(x+y)%2?hi:base)}
 else if(st==='eye'){ell(q,'#1c1721',24,23,8,5);ell(q,'#9c80b4',24,23,4,3);itemArtDot(q,24,23,'#efe1ff')}
 else if(st==='dash'){for(const y of[17,23,29,35])line(q,14,y,33,y-5,'#b9d7df',2)}
 else if(st==='magnet'){q.strokeStyle=hi;q.lineWidth=4;q.beginPath();q.arc(24,24,7,.2,Math.PI-.2);q.stroke();rect(q,16,23,4,8,'#c96e64');rect(q,29,23,4,8,'#6d9dc4')}
 else if(st==='knot'){line(q,17,17,31,32,hi,2);line(q,31,17,17,32,hi,2);ell(q,'#d7b067',24,24,4,4)}
 else if(st==='shield'){poly(q,hi,[[24,15],[32,18],[30,29],[24,35],[18,29],[16,18]]);poly(q,shade(base,-25),[[24,18],[29,20],[28,28],[24,32],[20,28],[19,20]])}
 else if(st==='mirror'){ell(q,'#d9e4df',24,24,8,10);ell(q,'#758a91',24,24,5,7);rect(q,21,33,6,3,'#b18c5d')}
 else if(st==='flame'){poly(q,'#d96335',[[24,13],[30,24],[26,22],[31,35],[24,30],[18,36],[19,25],[15,26]]);poly(q,'#f2b04e',[[24,19],[27,26],[24,25],[26,31],[22,29],[21,24]])}
 else if(st==='seal'){outlineRect(q,18,17,12,15,'#c9b36d');rect(q,21,20,6,9,'#e0ce91');line(q,24,20,24,28,'#7a4736',1)}
}
function drawRelic(q,it){
 const n=it.name||'',metal='#b99b5a',hi='#ead486';
 if(n==='장독 속 무언가'){
  q.save();q.lineWidth=7;q.strokeStyle='#302620';q.beginPath();q.ellipse(24,28,12,11,-.24,0,Math.PI*2);q.stroke();q.lineWidth=4;q.strokeStyle='#a88957';q.stroke();q.lineWidth=1;q.strokeStyle='#e4c78b';q.beginPath();q.ellipse(24,27,12,11,-.24,Math.PI*.94,Math.PI*1.82);q.stroke();poly(q,'#47352c',[[17,14],[23,9],[31,11],[34,18],[29,23],[21,22]]);poly(q,'#1e2021',[[20,15],[24,12],[29,14],[30,19],[25,21],[21,19]]);line(q,23,14,26,19,'#8a5c4e',1);line(q,22,17,28,16,'#bb8963',1);itemArtDot(q,22,14,'#e3bf83');itemArtDot(q,34,30,'#b88e57');q.restore();
 }
 else if(n==='붉은 등롱 심지'){rect(q,20,7,8,7,'#5a2e20');line(q,24,14,24,36,'#7b442a',3);for(const y of[19,24,29])ell(q,'#dd6541',24,y,5,3);itemArtDot(q,24,35,'#f3c55f')}
 else if(n==='먹빛 벼루 조각'){poly(q,'#181a1e',[[9,28],[16,12],[36,9],[40,30],[30,39],[13,38]]);poly(q,'#3c4651',[[14,29],[19,16],[33,14],[35,28],[28,34],[17,34]]);ell(q,'#0b1118',25,24,7,5);itemArtDot(q,31,18,'#839a9f')}
 else if(n==='깨진 천면경'){poly(q,'#c4d4d1',[[24,5],[37,14],[34,35],[23,42],[11,33],[10,15]]);poly(q,'#425460',[[24,9],[33,16],[31,31],[23,37],[14,30],[14,17]]);line(q,16,16,31,32,'#e8f1e7',1);line(q,29,13,20,36,'#e8f1e7',1)}
 else if(n==='장고의 쇠갈고리'){line(q,13,39,29,12,'#555a5d',5);q.strokeStyle='#1b1c1d';q.lineWidth=7;q.beginPath();q.arc(30,13,9,-.4,2.1);q.stroke();q.strokeStyle='#a1a5a2';q.lineWidth=4;q.beginPath();q.arc(30,13,9,-.4,2.1);q.stroke();rect(q,10,36,7,6,'#6b4934')}
 else if(n==='용의 여의주 파편'){ell(q,'#2d454b',24,24,14,14);ell(q,'#8bb8b6',24,24,10,10);poly(q,'#d3eee2',[[24,11],[28,22],[38,24],[28,27],[24,39],[21,28],[10,24],[21,21]]);itemArtDot(q,23,19,'#fff8c7')}
 else if(n==='용왕의 숨비늘'){poly(q,'#58aebb',[[24,6],[37,15],[34,32],[24,42],[13,33],[10,16]]);for(const y of[14,21,28,35]){ell(q,'#a7e3df',24,y,7,4);line(q,18,y,30,y,'#3b7e89',1)}}
 else if(n==='공허닻 파편'){line(q,24,7,24,35,'#8767a2',4);q.strokeStyle='#b898d1';q.lineWidth=4;q.beginPath();q.arc(24,30,11,.1,Math.PI-.1);q.stroke();poly(q,'#d4b5e8',[[24,4],[29,11],[19,11]]);itemArtDot(q,24,23,'#f1d9ff')}
 else {ell(q,metal,24,24,13,13);ell(q,hi,24,24,8,8);itemArtDot(q,24,24,'#fff3b2')}
}
function drawTrinket(q,it){
 if(it.name==='방 번호패'){outlineRect(q,10,12,28,25,'#6c4b32');rect(q,12,14,24,21,'#c5aa7a');rect(q,16,17,16,4,'#ead7aa');q.fillStyle='#5b3827';q.font='900 12px serif';q.textAlign='center';q.fillText('客',24,31);q.textAlign='start'}
 else if(it.name==='비단 매듭'){for(const [x1,y1,x2,y2]of[[10,15,38,33],[38,15,10,33],[16,9,32,39],[32,9,16,39]])line(q,x1,y1,x2,y2,'#a85b78',4);ell(q,'#dd9bb4',24,24,6,6);itemArtDot(q,24,24,'#f4d1dc')}
 else if(it.name==='금박 부적'){outlineRect(q,13,6,22,35,'#9e7733');rect(q,15,8,18,31,'#d7bd66');rect(q,17,10,14,5,'#f1dd88');line(q,24,16,24,34,'#7d412c',2);line(q,19,22,29,22,'#7d412c',1);itemArtDot(q,24,28,'#fff0a2')}
 else if(it.name==='수문지기의 접힌 행낭'){
  // Rolled waxed-cloth satchel, rope ties and the canal keeper's brass clasp.
  poly(q,'#242724',[[12,15],[31,10],[37,17],[38,35],[16,40],[10,33]]);
  poly(q,'#457276',[[13,16],[30,12],[35,18],[35,33],[17,37],[12,32]]);
  poly(q,'#7fa6a1',[[14,17],[30,13],[34,18],[30,25],[12,27]]);
  poly(q,'#33555a',[[12,26],[30,23],[35,27],[35,33],[17,37],[12,32]]);
  line(q,17,13,16,36,'#c4a67b',2);line(q,31,13,30,34,'#c4a67b',2);
  rect(q,21,26,8,9,'#473a29');rect(q,22,27,6,7,'#d5b879');rect(q,24,28,2,4,'#6d5340');
  itemArtDot(q,16,20,'#c7d7c1');itemArtDot(q,32,19,'#bdd8d4');
 }
 else if(it.name==='창고지기의 밥주머니'){
  // Tied grain sack; spilled rice kernels keep it distinct from the canal bag.
  poly(q,'#37291c',[[14,16],[19,12],[17,7],[29,7],[28,12],[34,17],[39,34],[32,40],[15,40],[9,34]]);
  poly(q,'#b18a50',[[15,18],[20,13],[28,13],[33,18],[37,34],[31,38],[16,38],[11,33]]);
  poly(q,'#e5ca8e',[[18,18],[28,16],[32,20],[34,32],[29,35],[16,34],[14,30]]);
  line(q,16,20,32,18,'#87613d',2);line(q,18,12,29,12,'#a44835',3);
  for(const [x,y]of[[21,25],[25,24],[29,27],[19,30],[25,31]])ell(q,'#f7e3b1',x,y,2,1);
  for(const [x,y]of[[8,37],[11,41],[39,40]])ell(q,'#dfc17d',x,y,2,1);
  rect(q,22,8,4,5,'#efe0ae');itemArtDot(q,16,24,'#f7e2aa');
 }
 else if(it.name==='흑산 목령인'){
  // Carved wooden seal with a living green sprout and inset spirit sigil.
  poly(q,'#171d18',[[15,10],[29,7],[37,14],[35,36],[19,41],[11,34]]);
  poly(q,'#553d2b',[[16,12],[29,9],[34,15],[33,33],[19,38],[13,33]]);
  poly(q,'#805c3b',[[17,14],[29,12],[31,16],[29,31],[20,35],[16,32]]);
  line(q,20,17,20,32,'#b18451',1);line(q,29,16,27,30,'#3b291f',2);
  ell(q,'#254437',24,25,6,7);ell(q,'#87b47b',24,24,4,5);rect(q,23,20,2,10,'#2e5941');
  poly(q,'#8bc487',[[23,23],[17,18],[17,23],[22,26]]);poly(q,'#b6d99c',[[25,23],[31,17],[32,23],[26,27]]);
  poly(q,'#273c31',[[16,36],[33,33],[32,39],[19,42]]);line(q,19,39,32,36,'#a18a55',1);
 }
 else drawRelic(q,it)
}
function drawAmmo(q,it){
 const k=it.ammoKind||'',col=it.color||'#d7c092';
 for(let i=0;i<3;i++){const y=36-i*6,x=9+i*5;line(q,x,y,x+22,9+i*2,col,2);poly(q,shade(col,28),[[x+24,6+i*2],[x+20,11+i*2],[x+25,13+i*2]]);line(q,x,y,x-4,y-5,'#7d5032',1);line(q,x,y,x+4,y+2,'#7d5032',1)}
 if(k==='iron_arrow')for(const x of[27,32,37])rect(q,x,8+(x-27),3,5,'#c6d0d3');
 if(k==='piercing_arrow'){poly(q,'#8fa4b0',[[41,5],[44,11],[37,11]]);line(q,40,12,35,22,'#d6e1e2',1)}
}
function drawUpgrade(q,it){
 const brass='#b78a43',hi='#efd179',dark='#4f3523';
 outlineRect(q,14,9,20,19,dark);rect(q,16,11,16,15,brass);rect(q,19,14,10,9,hi);
 q.strokeStyle=dark;q.lineWidth=2;q.beginPath();q.arc(24,18,6,0,Math.PI*2);q.stroke();
 q.fillStyle=dark;q.font='900 9px serif';q.textAlign='center';q.textBaseline='middle';q.fillText('改',24,19);q.textAlign='start';q.textBaseline='alphabetic';
 rect(q,20,28,8,11,'#6e472c');rect(q,18,37,12,4,'#3f2b20');itemArtDot(q,29,12,'#fff0a8');
}
function drawTalisman(q,it){
 const pub=window.__MANRU_TALISMAN_PUBLIC__;let a,seal;
 if(it?.fusion74){const pals=[['#d8bf83','#a8844f','#8b2d28'],['#a9c4b0','#6e947f','#315f50'],['#aab9cf','#6f829e','#334f70'],['#c7a7bd','#927087','#71345f'],['#d8c36f','#a48a43','#6b4326'],['#b8ae9d','#817667','#4b4542']][hash(it.name)%6];a={paper:pals[0],paper2:pals[1],ink:pals[2]};seal=it.seal||'合'}
 else{a=pub?.app?.(it)||{paper:'#dfc78e',paper2:'#b8955b',ink:'#9d3126',seal:'符'};seal=pub?.seal?.(it)||a.seal||'符'}
 // Exact v9.9.4 .v56TalismanIcon layout: paper left 24%, right 22%, top 8%, bottom 6%;
 // polygon 0/0 100/0 94/82 73/100 52/83 31/100 6/82; seal inset 24% 28% 25%; thread left 49%, height 12%.
 const x0=48*.24,x1=48*(1-.22),y0=48*.08,y1=48*(1-.06),w=x1-x0,h=y1-y0;
 const grad=q.createLinearGradient(0,y0,0,y1);grad.addColorStop(0,a.paper);grad.addColorStop(1,a.paper2);q.fillStyle=grad;q.strokeStyle='#6c4629';q.lineWidth=1;q.beginPath();q.moveTo(x0,y0);q.lineTo(x1,y0);q.lineTo(x0+w*.94,y0+h*.82);q.lineTo(x0+w*.73,y1);q.lineTo(x0+w*.52,y0+h*.83);q.lineTo(x0+w*.31,y1);q.lineTo(x0+w*.06,y0+h*.82);q.closePath();q.fill();q.stroke();
 q.fillStyle='#8c2f27';q.fillRect(48*.49,0,2,48*.12);q.fillStyle='rgba(255,245,201,.32)';q.fillRect(x0+w*.10,y0+h*.09,w*.80,2);
 const sx0=48*.28,sy0=48*.24,sx1=48*(1-.28),sy1=48*(1-.25);q.strokeStyle=a.ink;q.lineWidth=1;q.strokeRect(sx0+.5,sy0+.5,sx1-sx0-1,sy1-sy0-1);q.fillStyle='rgba(118,34,26,.08)';q.fillRect(sx0+1,sy0+1,sx1-sx0-2,sy1-sy0-2);q.fillStyle=a.ink;q.font='900 15px Georgia,serif';q.textAlign='center';q.textBaseline='middle';q.fillText(String(seal).slice(0,1),24,(sy0+sy1)/2+.5);q.textAlign='start';q.textBaseline='alphabetic';
}
function drawFood(q,it){
 const n=it.name||'';
 if(n==='떫은 산열매'){
  // Wild purple berries in a thorned mountain sprig, with powdery bloom.
  line(q,25,13,24,37,'#465b36',3);line(q,25,21,14,28,'#658446',2);line(q,25,24,34,29,'#526f40',2);
  poly(q,'#335438',[[24,16],[13,10],[17,20],[23,23]]);poly(q,'#739651',[[26,18],[38,12],[35,23],[26,25]]);
  line(q,20,19,16,15,'#a6b66e',1);line(q,29,19,35,16,'#a6b66e',1);
  for(const [x,y,r]of[[15,28,6],[25,29,7],[34,30,6],[20,36,6],[30,37,5]]){
   ell(q,'#271e2d',x+1,y+2,r+1,r+1);ell(q,'#623446',x,y,r,r);
   ell(q,'#995a65',x-2,y-2,Math.max(2,r-3),Math.max(1,r-4));
   itemArtDot(q,x-3,y-2,'#d9a0a1');itemArtDot(q,x+2,y+3,'#4a273f');
  }
  for(const [x,y]of[[13,22],[32,24]])poly(q,'#a88853',[[x,y],[x+4,y+2],[x+1,y+4]]);
 }
 else if(n==='해초'){
  for(const [x,y,c]of[[13,10,'#326451'],[23,6,'#417d5c'],[32,12,'#275944']]){
   poly(q,'#102d28',[[x-5,y+1],[x+3,y-2],[x+5,y+7],[x+1,y+15],[x+3,36],[x-3,38],[x-6,y+22],[x-3,y+12]]);
   poly(q,c,[[x-3,y+2],[x+2,y],[x+3,y+7],[x-1,y+15],[x+1,35],[x-2,36],[x-4,y+22],[x-1,y+11]]);
   line(q,x,y+4,x-1,32,'#8db781',1);for(const yy of[y+8,y+17,29])line(q,x-1,yy,x+2,yy-2,'#689d6b',1);
  }
  line(q,10,33,37,31,'#b39559',2);line(q,12,35,35,33,'#efd394',1);
 }
 else if(n==='창해말이'){
  ell(q,'#607879',24,36,20,7);ell(q,'#b0c4b0',24,34,19,6);line(q,9,35,36,35,'#dce1be',1);
  for(const [x,y]of[[16,23],[29,20],[25,31]]){
   ell(q,'#102a24',x,y+3,9,6);rect(q,x-9,y-1,18,5,'#173e2e');ell(q,'#4d7250',x,y-1,9,6);
   ell(q,'#f0e2bc',x,y-2,7,4);ell(q,'#fff2d6',x-1,y-3,5,2);
   rect(q,x-3,y-4,3,4,'#d48b51');rect(q,x,y-3,4,3,'#829d91');rect(q,x+1,y-4,2,2,'#d26a3c');
   itemArtDot(q,x-5,y-3,'#d9c595');itemArtDot(q,x+4,y-1,'#dac693');line(q,x-6,y+3,x-3,y+4,'#749773',1);
  }
 }
 else if(n.includes('주먹밥')){poly(q,'#f3ead8',[[24,7],[38,32],[10,32]]);rect(q,11,29,26,8,'#17211d');rect(q,19,12,10,3,'#fffaf1');if(n.includes('전력')){rect(q,21,18,6,8,'#d4a441');itemArtDot(q,24,20,'#fff1a0')}}
 else if(n.includes('육포')){for(let i=0;i<3;i++){poly(q,i%2?'#9f5d3f':'#814731',[[10+i*9,12],[17+i*7,10],[19+i*7,35],[9+i*8,37]]);line(q,12+i*8,18,17+i*7,28,'#c98259',1)}if(n.includes('매콤'))itemArtDot(q,30,18,'#e54d39')}
 else if(n.includes('생선')){ell(q,'#668d91',24,24,14,8);poly(q,'#496f75',[[10,24],[3,16],[3,32]]);itemArtDot(q,32,21,'#e5d7ae');line(q,17,24,29,24,'#b4c6bd',1);if(n.includes('구운')){rect(q,16,18,18,3,'#9a603c');rect(q,16,27,18,3,'#9a603c')}if(n.includes('찜')){ell(q,'#b9a878',24,29,17,6);rect(q,13,26,22,4,'#6e9a55')}}
 else if(n==='엽전 엿'){for(const [x,y]of[[15,19],[24,16],[32,22],[20,29]]){ell(q,'#c58c39',x,y,6,6);ell(q,'#704b21',x,y,2,2)}line(q,11,12,36,34,'#a46e2f',1)}
 else if(n==='신선로'||n==='보신 전골'){ell(q,'#34251d',24,30,17,9);ell(q,'#8a603d',24,28,15,7);ell(q,'#c69455',24,25,13,6);rect(q,22,10,4,14,'#4a3528');ell(q,'#8da553',19,25,4,2);ell(q,'#aa5f4e',28,24,4,2)}
 else if(n.includes('국밥')||n.includes('숭늉')){
  const rice=n.includes('숭늉');ell(q,'#251d19',24,32,17,9);ell(q,'#73563d',24,29,16,7);
  ell(q,rice?'#e5d4a4':'#ad8255',24,26,14,6);ell(q,rice?'#faf0c9':'#775039',24,25,11,4);
  for(const [x,y]of[[16,24],[22,27],[29,24],[33,28]])ell(q,rice?'#fff7df':'#c6a06e',x,y,2,1);
  poly(q,'#b58c59',[[10,29],[13,37],[19,40],[29,40],[36,37],[39,29],[36,34],[31,37],[17,37],[12,34]]);
  line(q,14,34,33,35,'#513728',1);line(q,35,16,31,32,'#593d29',2);
  for(const x of[17,28]){line(q,x,12,x-2,17,'#bbb8a2',1);itemArtDot(q,x-2,10,'#e7e1cc')}
 }
 else if(n.includes('버섯')){
  // The skewer passes through three differently coloured poison caps.
  line(q,10,38,36,12,'#503323',3);line(q,13,35,34,14,'#c5a577',1);
  for(const [x,y,c]of[[17,29,'#af5664'],[24,22,'#885377'],[31,16,'#bc7862']]){
   poly(q,'#282327',[[x-7,y+1],[x-4,y-5],[x+2,y-7],[x+7,y-2],[x+6,y+2]]);
   poly(q,c,[[x-6,y],[x-3,y-5],[x+2,y-6],[x+6,y-2],[x+5,y+1]]);
   line(q,x-3,y+3,x+4,y+2,'#ebc3ad',2);itemArtDot(q,x-2,y-3,'#f4d9c2');itemArtDot(q,x+3,y-2,'#ebc7a6');
  }
 }
 else if(n.includes('복숭아')||n==='신선도'){ell(q,'#d98b89',19,26,10,10);ell(q,'#df9a8f',29,26,10,10);rect(q,23,9,3,10,'#56764d');poly(q,'#70945e',[[26,10],[38,12],[29,17]]);if(n.includes('얼음')){for(const p of[[12,17],[35,18],[24,37]])poly(q,'#cce9ed',[[p[0],p[1]-4],[p[0]+3,p[1]],[p[0],p[1]+4],[p[0]-3,p[1]]])}}
 else if(n==='검게 탄 숯'){
  for(const [x,y,angle]of[[13,26,-.28],[25,20,.23],[25,32,-.14]]){
   q.save();q.translate(x,y);q.rotate(angle);outlineRect(q,-9,-4,19,8,'#17191c');rect(q,-7,-3,13,2,'#424449');rect(q,-5,2,12,1,'#686971');
   line(q,-5,-1,4,1,'#0d0f13',1);itemArtDot(q,8,-2,'#565961');itemArtDot(q,4,2,'#8b8c93');q.restore();
  }
  for(const [x,y]of[[12,37],[37,37],[9,31]]){itemArtDot(q,x,y,'#777981');itemArtDot(q,x+2,y+1,'#34363d')}
 }
 else if(n==='깨끗한 물'||n==='빙결액'){outlineRect(q,15,9,18,30,'#7a8a89');rect(q,17,15,14,20,n==='빙결액'?'#a9d6df':'#77b7c3');rect(q,20,7,8,6,'#76563c');rect(q,19,17,3,14,'rgba(255,255,255,.35)');if(n==='빙결액')poly(q,'#e5f7f3',[[24,16],[28,23],[24,30],[20,23]])}
 else {outlineRect(q,10,16,28,20,'#6d4e35');rect(q,13,13,22,8,'#d5b47a');rect(q,16,22,16,8,'#709b4d')}
}
function drawScroll(q,it){
 const kind=it.libraryKind1022||'',col=kind==='mapping'?'#6daeb7':kind==='identify'?'#8d74aa':kind==='ward'?'#c5a04c':'#9f7548';
 outlineRect(q,10,10,28,29,'#65452d');rect(q,12,8,24,30,'#dfc998');rect(q,15,11,18,24,'#f0ddae');rect(q,12,8,24,4,'#7c542f');rect(q,12,35,24,4,'#7c542f');
 if(kind==='mapping'){for(const [x1,y1,x2,y2]of[[17,16,31,16],[17,22,28,26],[19,31,31,20]])line(q,x1,y1,x2,y2,col,1);for(const [x,y]of[[17,16],[31,16],[17,22],[28,26],[19,31],[31,20]])itemArtDot(q,x,y,'#315963')}
 else if(kind==='identify'){ell(q,col,24,23,7,7);ell(q,'#f4e5c3',24,23,3,3);line(q,29,28,34,34,col,2)}
 else if(kind==='ward'){poly(q,col,[[24,13],[31,17],[30,27],[24,33],[18,27],[17,17]]);poly(q,'#f0d888',[[24,17],[28,19],[27,25],[24,29],[21,25],[20,19]])}
 else {for(const y of[16,21,26,31])line(q,17,y,31,y,col,1)}
}
function drawStoryNote(q){
 // Folded, stained investigation papers; the wax stamp distinguishes them from loot.
 poly(q,'#423329',[[12,14],[34,10],[38,34],[15,39]]);poly(q,'#dec9a2',[[10,11],[31,8],[37,34],[15,38]]);
 poly(q,'#f1dfb6',[[12,12],[30,9],[35,32],[16,36]]);
 poly(q,'#bda37d',[[30,9],[35,15],[29,16]]);line(q,29,10,30,16,'#80684e',1);
 for(const [y,w]of[[18,12],[22,15],[26,11],[30,13]])line(q,17,y,17+w,y-2,'#695747',1);
 ell(q,'#60382e',30,31,5,4);ell(q,'#a64d38',29,30,4,3);itemArtDot(q,29,30,'#e2b27b');
}
function drawMartialManual(q,it={}){
 // A stitched book with visible pages, spine cord and a raised gold seal.
 poly(q,'#241f1c',[[10,9],[30,6],[39,13],[39,38],[16,42],[9,36]]);
 poly(q,'#e8d7ab',[[17,14],[37,10],[38,35],[17,40]]);
 poly(q,'#bca277',[[12,11],[32,8],[36,36],[15,40]]);
 poly(q,it.summonItem105==='book'?(SUMMON_COLORS[it.summonElement105]||'#746248'):'#733e32',[[10,9],[31,6],[35,34],[14,38]]);
 line(q,14,11,17,37,'#d3a663',2);for(const y of[14,20,26,32])rect(q,11,y,4,2,'#d8b579');
 poly(q,'#e8bd73',[[20,16],[27,15],[30,22],[27,29],[20,30],[17,23]]);
 q.font='bold 10px serif';q.textAlign='center';q.fillStyle='#4a281f';q.fillText(it.summonItem105?'召':'秘',24,26);q.textAlign='start';
}
function drawGeneric(q,it){
 const h=hash(it.name),c=rarityCol[it.rarity]||'#b9aa8d',d=shade(c,-45),hi=shade(c,45);
 outlineRect(q,12,10,24,30,d);rect(q,15,13,18,24,c);for(let i=0;i<5;i++){const x=16+((h>>(i*3))%15),y=16+((h>>(i*4+2))%17);rect(q,x,y,2+(i%2),2, i%2?hi:d)}
}
function sprite(it){
 if(!it)return cv()[0];
 const key=KEY(it);if(CACHE.has(key))return CACHE.get(key);const[c,q]=cv();q.clearRect(0,0,W,H);shadow(q);
 if(it.type==='weapon')q.drawImage(weaponAsset(it).canvas,0,0);
 else if(it.type==='armor')drawArmor(q,it);
 else if(it.type==='cloak')drawCloak(q,it);
 else if(it.type==='relic')drawRelic(q,it);
 else if(it.type==='trinket')drawTrinket(q,it);
 else if(it.mineItem105==='stone')drawMineStone(q);
 else if(it.type==='food'||it.type==='ingredient')drawFood(q,it);
 else if(it.type==='talisman')drawTalisman(q,it);
 else if(it.type==='upgrade')drawUpgrade(q,it);
 else if(it.type==='ammo')drawAmmo(q,it);
 else if(it.type==='story_note')drawStoryNote(q,it);
 else if(it.summonItem105==='picture'){const picture=summonPictureAsset(it);q.drawImage(picture,4,1,40,47);}
 else if(it.type==='martial_manual'||it.type==='book')drawMartialManual(q,it);
 else if(it.type==='scroll'||it.libraryScroll1022)drawScroll(q,it);
 else drawGeneric(q,it);
 CACHE.set(key,c);return c;
}
function iconHtml(it,cls=''){
 if(it?.type==='potion'&&legacyPotionIcon)return legacyPotionIcon(it,cls);
 return`<img class="vfHiIcon ${cls} r7CanonicalItem" src="${data(it)}" alt="">`
}
function worldDraw(it){
 if(it?.type==='potion'&&legacyPotionDraw)return legacyPotionDraw(it);
 if(!it||!state)return;
 const now=performance.now(),px=it.x*TILE,py=it.y*TILE+Math.sin(now/300+it.x*.7+it.y*.4)*.25,col=rarityColor?.(it.rarity||'common')||'#c4ad7b',sz=(it.tier||1)>=4?32:30,dx=px+16-sz/2,dy=py+15-sz/2;
 X.save();X.imageSmoothingEnabled=false;X.fillStyle='rgba(0,0,0,.38)';X.beginPath();X.ellipse(px+16,py+27,9,3,0,0,Math.PI*2);X.fill();
 if(it.rarity&&it.rarity!=='common'){X.globalCompositeOperation='screen';const g=X.createRadialGradient(px+16,py+16,2,px+16,py+16,18);g.addColorStop(0,col+'66');g.addColorStop(1,col+'00');X.fillStyle=g;X.fillRect(px-2,py-2,36,36);X.globalCompositeOperation='source-over'}
 X.drawImage(sprite(it),0,0,48,48,dx,dy,sz,sz);X.restore()
}
const ART_CACHE=new Map();
function artCanvas(w=32,h=32){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')]}
function drawLegendMotif(q,T,x,y,kind,size=20){q.save();q.translate(x,y);q.scale(size/24,size/24);const c=T.trim,g=T.accent,d=shade49(T.wall,-7),s=T.style;
 if(s==='forge'){q.fillStyle=d;q.fillRect(1,8,22,12);q.fillStyle=c;q.fillRect(3,6,18,5);poly49(q,g,[[4,9],[22,9],[17,14],[6,14]]);q.fillStyle=c;q.fillRect(9,14,6,8);if(kind%2)stroke49(q,T.glow,[[7,8],[12,3],[17,8]],2)}
 else if(s==='pressure'){q.fillStyle=d;q.fillRect(2,1,20,22);ring49(q,c,12,12,9,3);ring49(q,g,12,12,6,1);for(let n=0;n<4;n++){const a=n*Math.PI/2;stroke49(q,g,[[12,12],[12+8*Math.cos(a),12+8*Math.sin(a)]],2)}q.fillStyle=T.glow;q.fillRect(11,10,3,3)}
 else if(s==='storm'){q.fillStyle=c;q.fillRect(9,3,6,19);for(let i=0;i<4;i++){q.fillStyle=i%2?T.floor2:g;q.fillRect(5,5+i*4,14,2)}stroke49(q,T.glow,[[14,0],[8,9],[15,9],[10,17]],1.5)}
 else if(s==='curse'){q.fillStyle='#574344';q.fillRect(2,2,20,20);stroke49(q,c,[[2,1],[6,5],[12,2],[18,5],[23,1]],2);for(const xx of[5,11,17]){q.fillStyle='#b5a58b';q.fillRect(xx,6,3,11);stroke49(q,'#633d40',[[xx+1,7],[xx+2,11],[xx,14]],1)}if(kind%2)ring49(q,g,12,14,7)}
 else if(s==='quarry'){poly49(q,c,[[3,22],[1,10],[7,4],[17,1],[23,8],[21,23]]);stroke49(q,T.wall,[[7,4],[10,12],[7,22]],2);stroke49(q,g,[[10,12],[19,7],[21,16]],2);q.fillStyle=T.glow;q.fillRect(14,8,2,2)}
 else if(s==='mirror'){poly49(q,c,[[12,0],[23,6],[21,23],[3,23],[1,6]]);poly49(q,'#364950',[[12,3],[20,8],[18,20],[6,20],[4,8]]);stroke49(q,g,[[7,7],[15,18]],2);stroke49(q,T.glow,[[14,6],[19,12]],1);if(kind%2)stroke49(q,'#151d24',[[10,3],[14,11],[9,16],[11,23]],2)}
 else if(s==='grave'){q.fillStyle=d;q.fillRect(2,3,20,20);q.fillStyle=c;q.fillRect(4,6,16,16);q.fillStyle=T.floor;q.fillRect(7,9,10,10);ring49(q,g,12,13,3,2);q.fillStyle=g;q.fillRect(10,16,4,3);q.fillStyle=c;q.fillRect(1,21,22,3)}
 else if(s==='range'){q.fillStyle=d;q.fillRect(1,2,22,22);for(const r of[9,6,2])ring49(q,c,12,12,r);stroke49(q,g,[[12,0],[12,24]],1);stroke49(q,g,[[0,12],[24,12]],1);poly49(q,T.glow,[[10,10],[16,12],[11,14]])}
 else if(s==='prison'){q.fillStyle=d;q.fillRect(0,0,24,24);for(let i=0;i<4;i++){ring49(q,c,5+i*4,4+i*5,3,2);q.fillStyle=g;q.fillRect(4+i*4,3+i*5,2,1)}if(kind%2)for(let x=2;x<24;x+=6)stroke49(q,c,[[x,0],[x,24]],2)}
 else{poly49(q,c,[[2,2],[22,2],[21,16],[12,24],[3,16]]);poly49(q,T.wall,[[5,5],[19,5],[18,14],[12,20],[6,14]]);stroke49(q,g,[[12,5],[12,19]],2);stroke49(q,g,[[6,10],[18,10]],2)}
 q.restore();
}
function drawLegendWeathering(q,T,seed,kind){
 const u=n=>hash49(n,seed)/4294967295,wet=['pressure','mirror'].includes(T.style),ash=['forge','range'].includes(T.style),organic=['pressure','grave'].includes(T.style),rust=T.style==='prison',blood=T.style==='curse';
 const dark=ash?'#18191e':blood?'#4a2636':organic?'#354c3f':rust?'#603822':shade49(T.floor,-25),pigment=ash?'#6b6257':blood?'#825064':organic?'#638270':rust?'#a96136':T.accent;
 q.save();q.beginPath();q.rect(0,0,32,32);q.clip();
 for(let i=0;i<4;i++){
  const cx=3+u(i*13+1)*26,cy=4+u(i*13+2)*24,r=3+u(i*13+3)*(kind===1?8:5),g=q.createRadialGradient(cx,cy,0,cx,cy,r*1.6);g.addColorStop(0,dark+'b0');g.addColorStop(1,dark+'00');q.fillStyle=g;q.beginPath();q.ellipse(cx,cy+1,r*1.6,r,0,0,Math.PI*2);q.fill();
  const points=Array.from({length:8},(_,j)=>{const a=j*Math.PI/4,rr=r*(.55+u(i*47+j+51)*.5);return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7]});q.fillStyle=(i%2?dark:pigment)+(wet?'60':'75');q.beginPath();q.moveTo((points[7][0]+points[0][0])/2,(points[7][1]+points[0][1])/2);for(let j=0;j<8;j++){const p=points[j],n=points[(j+1)%8];q.quadraticCurveTo(p[0],p[1],(p[0]+n[0])/2,(p[1]+n[1])/2);}q.closePath();q.fill();
  if(wet){q.strokeStyle=T.glow+'50';q.lineWidth=.65;q.beginPath();q.moveTo(cx-r*.65,cy);q.bezierCurveTo(cx-r*.2,cy-r*.5,cx+r*.3,cy-r*.4,cx+r*.7,cy);q.stroke();}
 }
 for(let i=0;i<18;i++){
  const xx=2+u(i*7+131)*28,yy=2+u(i*7+132)*28,size=.35+u(i*7+133)*(kind===2?2.8:1.4);q.fillStyle=(i%4===0?T.trim:i%3===0?pigment:dark)+(i%3?'90':'50');q.beginPath();q.moveTo(xx-size,yy);q.lineTo(xx-size*.4,yy-size*.7);q.lineTo(xx+size,yy-size*.4);q.lineTo(xx+size*.7,yy+size*.8);q.lineTo(xx-size*.4,yy+size);q.closePath();q.fill();
  if(kind===2&&size>1.8){q.strokeStyle=T.glow+'65';q.lineWidth=.55;q.beginPath();q.moveTo(xx-size*.8,yy);q.lineTo(xx-size*.35,yy-size*.55);q.lineTo(xx+size*.75,yy-size*.3);q.stroke();}
 }
 if(kind===2&&blood){q.save();q.translate(10+u(300)*12,10+u(301)*12);q.rotate(u(302)*3);q.fillStyle='#b7a487';q.beginPath();q.moveTo(-3,-5);q.lineTo(4,-4);q.lineTo(3,5);q.lineTo(1,3);q.lineTo(-2,6);q.lineTo(-3,3);q.closePath();q.fill();q.strokeStyle='#5b3345';q.lineWidth=.7;q.beginPath();q.moveTo(-1,-3);q.lineTo(1,-2);q.lineTo(-1,1);q.lineTo(1,3);q.stroke();q.restore();}
 q.restore();
}
function legendTexture(id,offset,variant){const key=id+':'+offset+':'+variant;if(ART_CACHE.has(key))return ART_CACHE.get(key);const[c,q]=artCanvas(),T=LEGEND_THEMES47[id],wall=offset>=4&&offset<=6;let col=T.materials[Math.min(3,offset)];
 if(wall){q.fillStyle=T.wall;q.fillRect(0,0,32,32);col=offset===6?shade49(T.wall2,-18):T.wall2;
  if(offset===6){poly49(q,col,[[1,5],[10,1],[29,3],[31,18],[26,28],[4,29],[0,17]]);stroke49(q,shade49(col,17),[[3,6],[12,3],[27,5]],1);stroke49(q,T.wall,[[12,3],[16,14],[10,22],[12,30]],2)}
  else {for(let yy=2;yy<25;yy+=8){const shift=((yy+variant)%3)*5;for(let xx=-shift;xx<32;xx+=16){q.fillStyle=shade49(col,(xx+yy+variant)%9-5);q.fillRect(xx+1,yy,14,7);q.fillStyle=shade49(col,15);q.fillRect(xx+1,yy,14,1)}}q.fillStyle=shade49(col,-24);q.fillRect(1,25,30,5);q.fillStyle=T.trim;q.fillRect(0,0,32,2);q.fillStyle=shade49(col,15);q.fillRect(0,24,32,1);if(offset===5){q.fillStyle=shade49(col,-12);q.fillRect(11,2,10,29);q.fillStyle=shade49(col,21);q.fillRect(11,2,2,28);q.fillStyle=T.trim;q.fillRect(8,2,16,3);q.fillRect(8,27,16,3)}}grain49(q,32,32,col,variant,65);
 }else if(offset===7){q.fillStyle='#111b20';q.fillRect(0,0,32,32);q.fillStyle=T.materials[1];q.fillRect(1,2,30,28);for(let x=1;x<32;x+=8){q.fillStyle=shade49(T.materials[1],-14);q.fillRect(x,2,1,28)}q.fillStyle=T.trim;q.fillRect(0,2,32,2);q.fillRect(0,28,32,2);q.fillStyle=shade49(T.trim,25);for(let x=4;x<32;x+=12){q.fillRect(x,3,2,2);q.fillRect(x,27,2,2)}}
 else {q.fillStyle=shade49(col,-18);q.fillRect(0,0,32,32);
  if(offset===0){for(let y=0;y<32;y+=16)for(let x=-((y/16)%2)*8;x<32;x+=16){q.fillStyle=shade49(col,(hash49(x,y+variant)%12)-5);q.fillRect(x+1,y+1,15,15);q.fillStyle=shade49(col,10);q.fillRect(x+2,y+2,13,1)}}
  else if(offset===1){q.fillStyle=col;q.fillRect(1,1,30,30);q.strokeStyle=shade49(T.trim,-15);q.strokeRect(3.5,3.5,25,25);q.strokeStyle=shade49(col,-16);q.strokeRect(6.5,6.5,19,19);if(variant%3===0){poly49(q,T.trim,[[16,11],[21,16],[16,21],[11,16]]);poly49(q,col,[[16,13],[19,16],[16,19],[13,16]])}}
  else if(offset===2){q.fillStyle=col;q.fillRect(1,1,30,30);if(['forge','prison','storm','range'].includes(T.style)){q.fillStyle=shade49(col,-14);for(let x=5;x<30;x+=5)q.fillRect(x,4,2,24);q.fillStyle=T.trim;for(const[x,y]of[[2,2],[28,2],[2,28],[28,28]])q.fillRect(x,y,2,2)}else{for(let y=1;y<32;y+=8){q.fillStyle=shade49(col,y%3*4);q.fillRect(1,y,30,6);q.fillStyle=shade49(col,-18);q.fillRect(variant%2?11:21,y,1,6)}}}
  else {q.fillStyle=col;q.fillRect(0,0,32,32);drawLegendWeathering(q,T,variant*197+23,2)}
  grain49(q,32,32,col,variant,90);if(variant===1)stroke49(q,shade49(col,-20),[[4,3],[10,11],[9,16],[14,25]],1);
 }
 ART_CACHE.set(key,c);return c;
}
function objectArt(d,T){const key=d.theme+':object:'+d.kind+':'+d.w+':'+d.h;if(ART_CACHE.has(key))return ART_CACHE.get(key);const[c,q]=artCanvas(d.w*32,d.h*32),w=c.width,h=c.height;
 q.fillStyle='rgba(0,0,0,.65)';q.fillRect(2,5,w-2,h-5);q.fillStyle=shade49(T.wall2,-12);q.fillRect(3,7,w-6,h-10);q.fillStyle=T.wall2;q.fillRect(4,4,w-8,h-12);q.strokeStyle=T.trim;q.lineWidth=2;q.strokeRect(5,5,w-10,h-12);grain49(q,w,h,T.wall2,17,200);
 const monument=d.kind==='monumentA'||d.kind==='monumentB',b=d.kind==='monumentB';
 if(monument){
  const s=T.style;const pillars=()=>{for(const x of[7,w-17]){q.fillStyle=T.wall;q.fillRect(x,10,12,h-20);q.fillStyle=T.trim;q.fillRect(x,9,3,h-22);q.fillRect(x-3,h-16,18,5);q.fillRect(x-3,8,18,5)}};
  if(s==='forge'){pillars();if(!b){for(let i=0;i<3;i++){const x=22+i*19;q.fillStyle='#171a20';q.beginPath();q.roundRect(x,18,16,h-35,[8,8,0,0]);q.fill();q.fillStyle='#99533b';q.fillRect(x+3,34,10,h-54);q.fillStyle='#e6ae6d';q.fillRect(x+6,40,4,h-65);q.fillStyle=T.trim;q.fillRect(x-2,h-20,20,4)}}else{q.fillStyle=T.trim;q.fillRect(w/2-9,4,18,h-14);q.fillStyle='#22262c';q.fillRect(17,h/2-10,w-34,27);poly49(q,T.wall2,[[12,h/2-12],[w-10,h/2-12],[w-24,h/2+3],[24,h/2+3]]);q.fillStyle=T.glow;q.fillRect(w/2-14,h/2+15,28,3)}}
  else if(s==='pressure'){if(!b){pillars();for(let i=0;i<3;i++){const yy=17+i*22;q.fillStyle='#1b4349';q.fillRect(21,yy,w-42,20);q.fillStyle='#87b0a8';for(let x=24;x<w-24;x+=6)q.fillRect(x,yy+2,2,17);q.fillStyle=T.trim;q.fillRect(15,yy+18,w-30,5)}}else{for(const r of[33,25,13])ring49(q,r===25?T.accent:T.trim,w/2,h/2,r,r===25?7:3);for(let n=0;n<8;n++){const a=n*Math.PI/4;stroke49(q,T.trim,[[w/2+12*Math.cos(a),h/2+12*Math.sin(a)],[w/2+34*Math.cos(a),h/2+34*Math.sin(a)]],4)}q.fillStyle=T.glow;q.fillRect(w/2-3,h/2-3,6,6)}}
  else if(s==='storm'){pillars();for(let i=0;i<3;i++){const x=22+i*20;q.fillStyle='#b3b6a9';q.fillRect(x,16,9,h-30);for(let yy=22;yy<h-16;yy+=10){q.fillStyle=T.trim;q.fillRect(x-3,yy,15,4)}}stroke49(q,T.glow,[[23,20],[37,32],[48,16],[61,30],[72,21]],2);if(b){ring49(q,T.trim,w/2,h/2,25,4);ring49(q,T.accent,w/2,h/2,17,2)}}
  else if(s==='curse'){pillars();if(!b){q.fillStyle='#392b32';q.fillRect(24,15,w-48,h-28);for(let yy=23;yy<h-15;yy+=14){stroke49(q,'#ae9570',[[13,yy],[w/2,yy+7],[w-13,yy]],3);for(let x=24;x<w-20;x+=16){q.fillStyle='#cab58b';q.fillRect(x,yy+2,7,14);stroke49(q,'#6b3e42',[[x+2,yy+4],[x+5,yy+10],[x+2,yy+13]],1)}}}else{drawLegendMotif(q,T,20,15,0,58);for(const yy of[27,45,63])for(const xx of[10,w-20])ring49(q,T.accent,xx,yy,7,2)}}
  else if(s==='quarry'){poly49(q,T.trim,[[14,h-10],[8,42],[23,21],[31,9],[46,18],[60,8],[76,22],[86,48],[75,h-10]]);if(!b){for(let i=0;i<4;i++){q.fillStyle=shade49(T.wall2,16+i*3);q.fillRect(22+i*13,19+(i%2)*8,12,37)}q.fillStyle=T.wall2;q.fillRect(26,53,48,25);stroke49(q,T.wall,[[21,49],[73,51],[68,65],[34,64]],3)}else for(const[x,y]of[[22,42],[43,25],[63,44]]){poly49(q,T.accent,[[x,y+28],[x-8,y],[x+3,y-13],[x+12,y+5],[x+7,y+29]]);stroke49(q,T.glow,[[x+3,y-10],[x+4,y+25]],2)}}
  else if(s==='mirror'){pillars();for(let i=0;i<3;i++){const x=18+i*20;poly49(q,T.trim,[[x,18],[x+9,8+(i%2)*8],[x+18,18],[x+15,h-16],[x+3,h-16]]);poly49(q,'#40565c',[[x+3,20],[x+9,13+(i%2)*8],[x+15,20],[x+12,h-20],[x+6,h-20]]);stroke49(q,T.glow,[[x+4,25],[x+12,49]],2);if(b)stroke49(q,T.wall,[[x+11,18],[x+6,36],[x+14,55],[x+6,72]],3)}}
  else if(s==='grave'){if(!b){for(const xx of[15,52]){q.fillStyle='#303b39';q.fillRect(xx,15,28,h-29);q.fillStyle=T.trim;q.fillRect(xx+3,17,22,h-35);q.fillStyle=T.wall2;q.fillRect(xx+6,24,16,h-49);drawLegendMotif(q,T,xx+5,27,0,18)}}else{pillars();q.fillStyle=T.trim;q.beginPath();q.ellipse(w/2,25,13,15,0,0,Math.PI*2);q.fill();poly49(q,T.wall2,[[35,38],[61,38],[76,76],[20,76]]);q.fillStyle=T.trim;q.fillRect(w/2-3,36,6,47);stroke49(q,T.accent,[[15,51],[35,44],[61,44],[80,51]],4)}}
  else if(s==='range'){if(!b){for(let i=0;i<3;i++){const yy=13+i*22;q.fillStyle=shade49(T.wall2,i*8);q.fillRect(12+i*6,yy,w-24-i*12,18);q.fillStyle=T.trim;q.fillRect(10+i*6,yy,w-20-i*12,3);ring49(q,T.accent,w/2,yy+10,5,2)}}else{for(const[r,col]of[[36,T.wall],[29,T.wall2],[22,'#773e2d'],[15,'#c48047'],[8,T.glow]]){q.fillStyle=col;q.beginPath();q.ellipse(w/2,h/2,r,r*.8,0,0,Math.PI*2);q.fill()}for(let i=0;i<7;i++){const a=i*1.8;stroke49(q,T.accent,[[w/2+20*Math.cos(a),h/2+16*Math.sin(a)],[w/2+33*Math.cos(a+.2),h/2+30*Math.sin(a+.2)]],2)}}}
  else if(s==='prison'){pillars();for(let xx=21;xx<w-18;xx+=11){q.fillStyle='#a1a29a';q.fillRect(xx,12,3,h-26)}for(const yy of[20,45,70])stroke49(q,T.trim,[[12,yy],[w-12,yy]],5);if(!b){for(let n=0;n<7;n++)ring49(q,T.accent,w/2,14+n*9,7,3)}else{q.fillStyle=T.trim;q.fillRect(20,20,w-40,5);poly49(q,'#b9b7a5',[[30,26],[64,26],[64,39],[30,52]])}}
  else{pillars();if(!b){for(let i=0;i<3;i++){q.strokeStyle=shade49(T.trim,i*10);q.lineWidth=4;q.beginPath();q.roundRect(20+i*6,15+i*5,w-40-i*12,h-25-i*5,[16,16,0,0]);q.stroke()}q.fillStyle=T.trim;for(let x=33;x<w-30;x+=8)q.fillRect(x,39,3,h-51)}else{poly49(q,T.trim,[[w/2,10],[63,19],[62,35],[w/2,43],[33,35],[32,19]]);poly49(q,T.wall2,[[29,41],[65,41],[73,74],[23,74]]);drawLegendMotif(q,T,31,39,0,34);stroke49(q,T.trim,[[17,38],[13,79]],4);stroke49(q,T.trim,[[77,38],[82,79]],4)}}
 }else if(d.kind==='column'){q.fillStyle=T.trim;q.fillRect(w*.28,3,w*.44,h-6);q.fillStyle=T.wall2;q.fillRect(w*.4,7,w*.3,h-14);q.fillStyle=shade49(T.trim,20);q.fillRect(w*.28,4,3,h-8);q.fillStyle=T.trim;q.fillRect(3,3,w-6,6);q.fillRect(3,h-9,w-6,6)}else{drawLegendMotif(q,T,8,9,d.kind==='workset'?1:0,Math.min(w,h)-16);if(w>55)drawLegendMotif(q,T,w-30,h-31,1,23)}
 ART_CACHE.set(key,c);return c;
}
function drawLegendDecorCell(d,px,py,T){if(!d)return;X.save();X.translate(px,py);
 if(d.object49){const o=d.object49;X.drawImage(objectArt(o,T),d.dx*32,d.dy*32,32,32,0,0,32,32)}
 else if(d.kind.startsWith('wall')){const n=+d.kind.at(-1);X.fillStyle=T.wall;X.fillRect(5,6,22,22);if(n===0)drawLegendMotif(X,T,6,6,0,20);else if(n===1){if(['forge','pressure','storm','range'].includes(T.style)){stroke49(X,T.trim,[[0,14],[10,14],[10,22],[32,22]],4);stroke49(X,T.accent,[[0,13],[11,13],[11,21],[32,21]],1);ring49(X,T.trim,22,22,5,2)}else if(T.style==='prison'){for(let y=7;y<30;y+=6)ring49(X,T.trim,16,y,4,2)}else{X.fillStyle=shade49(T.accent,-26);poly49(X,X.fillStyle,[[7,5],[25,5],[24,29],[16,25],[8,29]]);stroke49(X,T.trim,[[8,4],[24,4]],2);drawLegendMotif(X,T,11,9,0,10)}}else if(n===2){X.fillStyle=T.trim;X.beginPath();X.arc(16,11,5,0,Math.PI*2);X.fill();poly49(X,T.wall2,[[11,15],[21,15],[24,25],[8,25]]);stroke49(X,T.trim,[[7,27],[25,27]],2);X.fillStyle=T.wall;X.fillRect(13,10,2,2);X.fillRect(18,10,2,2)}else{X.fillStyle=shade49(T.wall2,-9);X.fillRect(4,7,24,18);stroke49(X,T.trim,[[5,8],[26,8],[26,24],[5,24],[5,8]],1);for(let i=0;i<3;i++)stroke49(X,T.trim,[[8,11+i*4],[12,13+i*4],[17,10+i*4],[23,12+i*4]],1)}}
 else if(d.kind.startsWith('floor')){const n=+d.kind.at(-1),seed=hash49(d.x,d.y);X.globalAlpha*=.85;
  if(n===0){const g=X.createRadialGradient(16,17,2,16,17,12);g.addColorStop(0,T.accent+'55');g.addColorStop(1,T.accent+'00');X.fillStyle=g;X.beginPath();X.ellipse(16,17,12,10,(seed%7)*.2,0,Math.PI*2);X.fill();X.strokeStyle=T.trim+'70';X.lineWidth=.7;X.beginPath();X.ellipse(16,16,8,7,.3,Math.PI*.2,Math.PI*1.3);X.stroke();}
  else drawLegendWeathering(X,T,seed,n);
 }
 else if(d.kind==='mosaic'){X.globalAlpha*=.5;const xx=d.dx-2,yy=d.dy-1.5;X.strokeStyle=T.trim;X.lineWidth=2;X.beginPath();X.arc(-xx*32+16,-yy*32+16,47,0,Math.PI*2);X.stroke();X.lineWidth=1;X.beginPath();X.arc(-xx*32+16,-yy*32+16,37,0,Math.PI*2);X.stroke();if((d.dx+d.dy)%3===0)drawLegendMotif(X,T,11,11,0,10)}
 else if(d.kind==='light'){const lightColor=(state.legendLights49||[]).find(l=>l.x===d.x&&l.y===d.y)?.color||T.glow;X.fillStyle=T.wall;X.fillRect(11,12,10,16);X.fillStyle=T.trim;X.fillRect(10,25,12,3);X.fillRect(12,15,8,3);X.fillStyle=terrainUnlit105(d.x,d.y)?'#574535':lightColor;X.fillRect(14,10,4,7);X.fillStyle=terrainUnlit105(d.x,d.y)?'#73573c':colorShift(lightColor,24);X.fillRect(15,11,2,3)}
 else if(d.kind==='waterfall'){X.fillStyle=T.trim;X.fillRect(1,0,30,7);X.fillStyle='#699e9b';for(let x=4;x<29;x+=5)X.fillRect(x,6,2,25)}
 else if(d.kind==='route'){X.globalAlpha*=.5;X.strokeStyle=T.trim;X.strokeRect(12,12,8,8)}
 else if(d.kind==='lintel'){X.fillStyle=T.trim;X.fillRect(0,0,32,4);X.fillStyle=T.wall;X.fillRect(1,4,30,3)}
 X.restore();
}
function drawLegendCell(tile,px,py,x,y,now,vis){if(!state?.artifactDungeon46)return false;const id=state.artifactDungeon46.id,T=LEGEND_THEMES47[id],t=LEGEND_TILES49[id],h=hash49(x,y),n=tile>=500&&tile<660?(tile-500)%16:0;X.save();X.globalAlpha=vis?1:.46;
 if(n===6&&!DIRS8.some(([dx,dy])=>{const v=state.map[y+dy]?.[x+dx];return v===TT.WATER||v===TT.LAVA||v===TT.DOOR||v===TT.LOCKED_GATE||(v>=500&&v<660&&((v-500)%16<4||(v-500)%16===7))})){X.fillStyle=shade49(T.wall,-9);X.fillRect(px,py,32,32);if(h%3===0){poly49(X,shade49(T.wall,-4),[[px+3,py+12],[px+13,py+4],[px+27,py+9],[px+24,py+24],[px+7,py+27]]);stroke49(X,shade49(T.wall,1),[[px+5,py+12],[px+13,py+7],[px+25,py+10]],1)}}
 else if(tile===TT.VOID){X.fillStyle='#0b1015';X.fillRect(px,py,32,32);if(h%11===0){X.fillStyle='#1b2229';X.fillRect(px+h%27,py+(h>>>8)%27,2,1)}}
 else if(tile===TT.WATER){X.fillStyle='#193338';X.fillRect(px,py,32,32);for(let i=0;i<3;i++){const yy=(i*11+((now/210+x*2)%11));X.strokeStyle=i%2?'rgba(109,160,153,.32)':'rgba(90,131,130,.25)';X.lineWidth=1;X.beginPath();X.moveTo(px,py+yy);X.bezierCurveTo(px+8,py+yy-2,px+20,py+yy+2,px+32,py+yy);X.stroke()}for(const[dx,dy]of DIRS4){const v=state.map[y+dy]?.[x+dx];if(v>=500&&v<660){X.fillStyle='rgba(153,167,143,.23)';X.fillRect(px+(dx>0?30:0),py+(dy>0?30:0),dx?2:32,dy?2:32)}}}
 else if(tile===TT.LAVA){drawLavaTerrain(X,px,py,x,y,now)}
 else {X.drawImage(legendTexture(id,n===8?0:n,h%4),px,py);if(tile===TT.DOOR||tile===TT.LOCKED_GATE||tile===TT.OPEN_DOOR){X.fillStyle=T.wall;X.fillRect(px+2,py+2,28,29);X.fillStyle=T.trim;X.fillRect(px+2,py+2,4,29);X.fillRect(px+26,py+2,4,29);X.fillRect(px+2,py+1,28,4);if(tile!==TT.OPEN_DOOR){X.fillStyle=shade49(T.materials[2],-5);X.fillRect(px+7,py+7,18,24);for(let xx=9;xx<25;xx+=5){X.fillStyle=T.trim;X.fillRect(px+xx,py+8,1,21)}X.fillStyle=T.trim;X.fillRect(px+7,py+12,18,3);X.fillRect(px+7,py+24,18,3);X.fillStyle=tile===TT.LOCKED_GATE?T.glow:T.accent;X.fillRect(px+14,py+17,5,4)}else{X.drawImage(legendTexture(id,1,h%4),px+7,py+5,18,27);X.fillStyle=T.trim;X.fillRect(px+3,py+6,6,22)}}
 else if(tile===TT.KEY_TILE){X.fillStyle='#23292a';X.fillRect(px+7,py+9,18,19);ring49(X,T.glow,px+13,py+16,4,2);stroke49(X,T.glow,[[px+17,py+16],[px+25,py+16],[px+25,py+20]],2)}
 else if(tile===TT.PORTAL){ring49(X,T.trim,px+16,py+16,12,3);ring49(X,T.glow,px+16,py+16,8,1);X.fillStyle='#526d70';X.fillRect(px+13,py+10,6,12)}
 if(n<4||n===7){if(tileBlocksSight(state.map[y-1]?.[x])){const g=X.createLinearGradient(0,py,0,py+9);g.addColorStop(0,'rgba(0,0,0,.38)');g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(px,py,32,9)}if(tileBlocksSight(state.map[y]?.[x-1])){X.fillStyle='rgba(0,0,0,.16)';X.fillRect(px,py,3,32)}}
 drawLegendDecorCell(state.legendDecorGrid47?.[key46(x,y)],px,py,T);}
 X.restore();return true;
}
function drawLegendWorld(){if(!state)return;const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current(),now=performance.now(),id=state.artifactDungeon46?.id;X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
 for(const f of state.legendFireFields47||[])for(const c of f.cells??[{x:f.x,y:f.y}]){if(!state.visible.has(k(c.x,c.y)))continue;const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileTopLeft(c.x,c.y,cam);drawFireFloor(X,q.x,q.y,q.s,c.x,c.y,now);}for(const a of state.legendSkyAxes47||[]){const age=now-a.t;if(age<0||age>a.ttl||!state.visible.has(k(a.x,a.y)))continue;const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileCenter(a.x,a.y,cam),cx=q.x,ground=q.y,t=Math.min(1,age/360),cy=ground-(1-t)*q.s*3.2;X.save();X.translate(cx,cy);X.rotate(-.7+t*3.5);X.fillStyle='#5f3522';X.fillRect(-2,-10,4,20);X.fillStyle='#ee7137';X.beginPath();X.moveTo(0,-6);X.lineTo(14,-2);X.lineTo(9,7);X.lineTo(0,5);X.closePath();X.fill();X.restore()}
 const rw=state.artifactReward46;if(rw&&state.visible.has(k(rw.x,rw.y))){const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileTopLeft(rw.x,rw.y,cam),rx=q.x,ry=q.y,ss=q.s;X.fillStyle='rgba(224,177,75,.20)';X.fillRect(rx+ss*.12,ry+ss*.55,ss*.76,ss*.30);X.strokeStyle='rgba(255,226,139,.75)';X.strokeRect(rx+ss*.12,ry+ss*.55,ss*.76,ss*.30)}const pp=state.artifactPortal46||state.artifactExit46;if(pp&&state.visible.has(k(pp.x,pp.y))){const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileCenter(pp.x,pp.y,cam),cx=q.x,cy=q.y,r=q.s*.34;X.strokeStyle='#f1cf75';X.lineWidth=Math.max(2,2*cam.zoom);X.beginPath();X.arc(cx,cy,r,0,Math.PI*2);X.stroke();X.fillStyle='#f4df9b';X.font=`${Math.max(9,11*cam.zoom)}px sans-serif`;X.textAlign='center';X.fillText('傳',cx,cy+4*cam.zoom)}X.restore()}
function drawPalaceSweepWarning(ctx,intent,project,now,visible=()=>true){
 const keys=new Set(intent.cells.map(c=>k(c.x,c.y))),pulse=.6+.2*Math.sin(now/150),origin=intent.data.origin57,radius=intent.data.radius105;
 ctx.save();
 for(const c of intent.cells){
  if(!visible(c))continue;const{x,y,size:s}=project(c),edge=Math.hypot(c.x-origin.x,c.y-origin.y)>radius-1;
  ctx.fillStyle=`rgba(114,223,211,${(edge?.20:.09)+.08*pulse})`;ctx.fillRect(x,y,s,s);ctx.strokeStyle=`rgba(189,255,238,${.65+.25*pulse})`;ctx.lineWidth=Math.max(1.5,s/16);
  for(const[dx,dy]of DIRS4)if(!keys.has(k(c.x+dx,c.y+dy))){ctx.beginPath();if(dx){const xx=x+(dx>0?s-1:1);ctx.moveTo(xx,y+1);ctx.lineTo(xx,y+s-1)}else{const yy=y+(dy>0?s-1:1);ctx.moveTo(x+1,yy);ctx.lineTo(x+s-1,yy)}ctx.stroke();}
  // Seeded upward jets are rendered only inside the existing visible warning cells.
  for(let n=0;n<5;n++){
   const seed=c.x*37+c.y*61+n*23,phase=((now/(270+n*19)+seed*.137)%1+1)%1,px=x+s*(.14+((seed*17)%71)/100),py=y+s*(.92-phase*.84),alpha=Math.sin(phase*Math.PI)*.9;
   ctx.strokeStyle=`rgba(101,212,243,${alpha*.6})`;ctx.lineWidth=Math.max(1,s*.035);ctx.beginPath();ctx.moveTo(px,Math.min(y+s*.95,py+s*(.12+phase*.15)));ctx.lineTo(px,py);ctx.stroke();
   ctx.fillStyle=`rgba(206,253,255,${alpha})`;ctx.beginPath();ctx.ellipse(px,py,Math.max(.8,s*.035),Math.max(1.4,s*.064),0,0,Math.PI*2);ctx.fill();
  }
 }

 ctx.restore();
}
function drawPalaceWaves(q,now){q.save();q.imageSmoothingEnabled=true;for(const f of state.tempFields||[]){if(f.kind!=='palaceWave105'||f.ttl<=0)continue;const progress=TERRAIN_MOTION54.matches||f.motionStart105==null?1:Math.min(1,Math.max(0,(now-f.motionStart105)/190));for(const c of f.segments105){if(!state.debugBattle57&&!state.visible?.has(k(c.x,c.y)))continue;const x=(c.prevX105+(c.x-c.prevX105)*progress)*TILE,y=(c.prevY105+(c.y-c.prevY105)*progress)*TILE;q.save();q.translate(x+16,y+16);q.rotate(f.dx>0?Math.PI/2:f.dx<0?-Math.PI/2:f.dy>0?Math.PI:0);q.translate(-16,-16);const phase=now/320+(c.x+c.y)*.37,crest=5+Math.sin(phase)*1.4,g=q.createLinearGradient(0,0,0,32);g.addColorStop(0,'#d3f0ed99');g.addColorStop(.16,'#79d7e9df');g.addColorStop(.48,'#2687c9c9');g.addColorStop(1,'#153f7c72');q.fillStyle=g;q.beginPath();q.moveTo(0,crest+2);q.bezierCurveTo(10,crest-4,18,crest+5,32,crest+1);q.lineTo(32,32);q.lineTo(0,32);q.closePath();q.fill();q.lineCap='round';q.strokeStyle='#e3fcf3df';q.lineWidth=2;q.beginPath();q.moveTo(-1,crest+2);q.bezierCurveTo(10,crest-4,18,crest+5,33,crest+1);q.stroke();q.strokeStyle='#a4e5f6ad';q.lineWidth=1;for(const yy of [14,23]){q.beginPath();q.moveTo(0,yy+Math.sin(phase+yy)*2);q.bezierCurveTo(10,yy-3,21,yy+4,32,yy);q.stroke();}for(let i=0;i<4;i++){const a=(i*9+c.row105*3)%32;q.fillStyle=i%2?'#d9f9f0c9':'#86dbe8ad';q.fillRect(a,crest-3+Math.sin(phase+i)*2,2,1);}q.restore();}}q.restore();}
function drawPalaceWindow(q,w,x,y){const bronze=w.kind==='arch'?'#d6d5b5':'#a98354';q.fillStyle='#1b2832';q.fillRect(1,3,30,27);q.strokeStyle='#283c48';q.lineWidth=4;palaceWindowPath(q,w.kind,w.large);q.stroke();q.save();palaceWindowPath(q,w.kind,w.large);q.clip();
 const g=q.createLinearGradient(0,4,32,25);g.addColorStop(0,'#376d91');g.addColorStop(.45,'#2a7183');g.addColorStop(1,'#112e53');q.fillStyle=g;q.fillRect(0,0,32,32);
 q.fillStyle='#a9e7db36';q.beginPath();q.moveTo(7,1);q.lineTo(14,1);q.lineTo(26,28);q.lineTo(15,28);q.fill();q.fillStyle='#add9cb25';q.beginPath();q.moveTo(19,0);q.lineTo(21,0);q.lineTo(13,27);q.lineTo(9,27);q.fill();
 q.strokeStyle=w.scene==='coral'?'#88b3a14f':'#759ea850';q.lineWidth=1.3;if(w.scene==='palace'){for(let i=0;i<3;i++){q.fillStyle='#162f50';q.fillRect(5+i*8,18-i%2*3,7,14);q.beginPath();q.moveTo(3+i*8,18-i%2*3);q.lineTo(9+i*8,13-i%2*3);q.lineTo(15+i*8,18-i%2*3);q.fill();}}else for(let i=0;i<3;i++){const xx=7+i*9;q.beginPath();q.moveTo(xx,29);q.lineTo(xx+1,18);q.lineTo(xx-2,15);q.moveTo(xx+1,21);q.lineTo(xx+5,17);q.lineTo(xx+6,13);q.stroke();}
 q.strokeStyle='#89a692';q.lineWidth=1;if(w.kind==='moon'){for(const sy of [10,16,21]){q.beginPath();q.moveTo(4,sy);q.bezierCurveTo(10,sy-5,16,sy+5,28,sy);q.stroke();}q.beginPath();q.moveTo(16,4);q.bezierCurveTo(23,8,8,16,17,26);q.stroke();}
 else if(w.kind==='fan'){for(let i=0;i<7;i++){const a=Math.PI+(i/6)*Math.PI;q.beginPath();q.moveTo(16,23);q.lineTo(16+15*Math.cos(a),22+19*Math.sin(a));q.stroke();}}
 else if(w.kind==='ribbon'){for(const xx of [10,21]){q.fillStyle='#a68a61';q.fillRect(xx,7,2,18);}for(const yy of [12,19]){q.beginPath();q.moveTo(2,yy);q.bezierCurveTo(8,yy-3,14,yy+4,21,yy);q.bezierCurveTo(25,yy-3,28,yy+3,32,yy);q.stroke();}}
 else if(w.kind==='gauge'){q.strokeStyle='#bf8b55';q.lineWidth=3;q.strokeRect(3,8,26,16);q.fillStyle='#90c9c3';q.fillRect(5,18,22,5);for(const yy of [11,15,19]){q.fillStyle='#d7c48f';q.fillRect(23,yy,4,1);}}
 else{for(const xx of [11,16,21]){q.beginPath();q.moveTo(xx,5);q.lineTo(xx,27);q.stroke();}q.beginPath();q.moveTo(5,16);q.bezierCurveTo(9,10,22,23,28,13);q.stroke();q.fillStyle='#80c6b5';q.fillRect(9,12,3,3);q.fillStyle='#7ba6ce';q.fillRect(20,18,3,4);}
 q.restore();q.strokeStyle=bronze;q.lineWidth=w.kind==='arch'?3:2;palaceWindowPath(q,w.kind,w.large);q.stroke();q.strokeStyle='#e7d8ac';q.lineWidth=.7;palaceWindowPath(q,w.kind,w.large);q.stroke();
 q.fillStyle='#0f2637';q.fillRect(2,27,29,4);q.fillStyle='#b9c7bb';q.fillRect(2,26,28,2);q.fillStyle='#e6dec2';q.fillRect(4,26,24,1);q.fillStyle='#e6e5d0';for(const xx of [9,23])q.fillRect(xx,6,2,2);if(w.kind==='fan'){q.fillRect(14,22,4,3);q.fillStyle='#fff2dc';q.fillRect(15,22,2,2);}
 if(w.damaged){q.strokeStyle='#182836';q.lineWidth=1;q.beginPath();q.moveTo(13,5);q.lineTo(17,12);q.lineTo(14,18);q.lineTo(19,24);q.stroke();q.fillStyle='#4d626b';q.fillRect(25,17,3,4);}
}
function drawPalaceFloorMaterial(q,h,x,y,d){
 const {r,poly}=drawKit(q),disc=(c,a,b,rx,ry)=>{q.fillStyle=c;q.beginPath();q.ellipse(a,b,rx,ry,0,0,Math.PI*2);q.fill();};
 const key=k(x,y),out=d.outdoors?.[key],inner=state.branchContext105?.level===2,v=hash2(x,y,347),P=inner?[['#5062a0','#7587bd','#a6b8dd','#364e88'],['#7a89c2','#9caadd','#d4d8f3','#5b70a7'],['#abb5e3','#c9d1ef','#edf0fd','#8799c9'],['#d5d5b9','#e5e2c7','#fff1d7','#a6b3a0']][h]:[['#183946','#315260','#4b7177','#112b37'],['#377b72','#659e88','#a3c8a5','#285f5b'],['#83b6a0','#acd0b5','#d8e3c9','#5f9381'],['#d5d5b9','#e5e2c7','#fff1d7','#a6b3a0']][h];
 if(d.permanentWater?.[key]){r('#183d4b',0,0,32,32);for(let i=0;i<4;i++){const a=hash2(x*4+i,y,733)*29,b=hash2(x,y*4+i,739)*30;disc(i%2?'#315553':'#254d52',a,b,3+i,1.5);r('#65827666',a,b,2,1);}return;}
 r(out&&h<2&&!inner?'#426356':P[3],0,0,32,32);poly(P[1],[[1,2],[29,1],[31,5],[30,29],[27,31],[2,30],[0,25]]);poly(P[0],[[2,4],[28,3],[29,7],[28,27],[24,29],[3,28],[2,23]]);poly(P[2],[[2,3],[28,2],[30,4],[3,6]]);poly(P[3],[[28,7],[31,5],[30,29],[26,31],[26,27]]);
 // Filled mineral flecks and broad stone facets, rather than line drawings on a flat square.
 for(let i=0;i<7;i++){const a=4+Math.floor(hash2(x*11+i,y,353)*22),b=5+Math.floor(hash2(x,y*7+i,359)*22);r(i%3===0?P[2]:P[1],a,b,i%2?2:1,1);}
 if(out&&h===1&&!inner){r('#3d695b',0,0,32,32);poly('#628771',[[0,0],[12,1],[9,7],[0,10]]);poly('#315749',[[22,22],[32,18],[32,32],[18,32]]);poly('#7f9a7f',[[5,8],[19,5],[27,11],[25,24],[15,28],[6,24],[3,16]]);poly('#4e8475',[[7,9],[19,7],[25,12],[22,22],[15,25],[8,22],[5,16]]);poly('#a3b59a',[[7,9],[19,7],[23,10],[11,12]]);for(let i=0;i<3;i++){const a=2+i*11,b=3+(i%2)*23;poly('#7e9d75',[[a,b+4],[a+1,b],[a+3,b+3],[a+5,b+1],[a+4,b+6]]);}}
 if(out&&h===1&&!inner&&v>.48){poly('#406c5b',[[0,0],[7,2],[6,8],[2,12],[0,24]]);poly('#54755c',[[26,22],[32,17],[32,32],[20,32],[22,27]]);}
 if(out&&h<2&&!inner){poly(h===0?'#294b50':'#467e68',[[3,24],[8,21],[12,24],[10,29],[4,29]]);poly('#527965',[[21,4],[28,5],[28,9],[24,10],[20,7]]);}
 if(h===0){
  // Pearlescent wave tesserae set into dark, recessed basalt.
  for(let row=0;row<2;row++)for(let i=0;i<5;i++){const a=4+i*5,b=10+row*11+Math.round(2*Math.sin(i*1.2+row));poly(i%2?(inner?'#a2b3da':'#62877f'):(inner?'#7389b9':'#456e78'),[[a,b],[a+3,b-1],[a+4,b+2],[a+1,b+3]]);r((inner?'#b6c6ec':'#90a898'),a+1,b,2,1);}
 }else if(h===1&&(x+2*y)%4===0){
  disc((inner?'#5469a1':'#2e635d'),16,19,10,8);poly((inner?'#d0d8f4':'#afcbaa'),[[6,17],[7,12],[11,8],[16,7],[21,8],[25,12],[26,17],[20,23],[12,23]]);
  for(let i=0;i<5;i++){const a=7+i*4;poly(i%2?(inner?'#95a4d5':'#769e88'):(inner?'#e3e5fa':'#d0d7b2'),[[16,22],[a,13-Math.sin(i*Math.PI/4)*4],[a+3,12-Math.sin(i*Math.PI/4)*4],[18,22]]);}disc((inner?'#7084ba':'#3b7568'),16,23,4,2);r((inner?'#e3e9fb':'#d1daba'),14,22,4,1);
 }else if(h===2&&(x+y*3)%4===0){
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){const a=7+col*9-(row?4:0),b=11+row*10;poly((inner?'#879acd':'#6f9d88'),[[a-4,b],[a+4,b],[a+3,b+5],[a,b+7],[a-3,b+5]]);poly(col%2?(inner?'#d8def7':'#bbd6b9'):(inner?'#bfcbef':'#a7cbaf'),[[a-3,b],[a+3,b],[a+2,b+4],[a,b+5],[a-2,b+4]]);poly((inner?'#eef1ff':'#d6e2c6'),[[a-3,b],[a+3,b],[a+2,b+1],[a-2,b+2]]);}
 }else if(h===3){
  poly('#e5dfc0',[[6,7],[23,6],[26,10],[25,23],[21,26],[7,25],[5,21]]);poly('#f4ebcd',[[7,8],[23,7],[24,10],[8,11]]);poly('#bfc6ac',[[24,12],[25,23],[21,26],[20,24],[22,13]]);
  // Gold borders follow the platform edge; neighbouring high stones form one coherent terrace.
  for(const[dx,dy]of DIRS4)if(d.floors[k(x+dx,y+dy)]!==3){if(dx){const a=dx<0?1:28;r('#866b3f',a,2,3,28);r('#d4b56d',a,2,2,27);r('#f2d998',a,2,1,27);}else{const b=dy<0?1:28;r('#866b3f',2,b,28,3);r('#d4b56d',2,b,27,2);r('#f2d998',2,b,27,1);}}
 }
 const mosaic=d.mosaics?.[key];if(mosaic){const xx=(x-mosaic.cx)*32+16,yy=(y-mosaic.cy)*32+16,rad=Math.hypot(xx,yy);for(let a=4;a<30;a+=5)for(let b=5;b<29;b+=5){const gx=xx+a-16,gy=yy+b-16,ang=Math.atan2(gy,gx),rr=Math.hypot(gx,gy),ring=Math.abs(rr-mosaic.r*25)<7,fan=Math.sin(ang*7+rr*.035)>.25;q.fillStyle=ring?'#c1a772':fan?'#e3d5b1':'#628b7a';q.fillRect(a,b,3,3);} }
}
function drawPalaceArchitecture(q,f,x,y,d){
 const {r,poly}=drawKit(q);
 const style=f?.style||(DIRS8.some(([dx,dy])=>d.outdoors?.[k(x+dx,y+dy)])?'garden-edge':'stone'),roof=style==='roof'||style==='gate-roof',front=style==='gate-front'||style==='front',pier=style==='gate-pier';
 r('#263b44',0,0,32,32);
 if(style==='garden-edge'){poly('#334d49',[[0,5],[8,0],[23,2],[32,8],[31,27],[20,32],[3,30]]);poly('#738575',[[0,8],[10,2],[23,4],[29,10],[23,15],[7,14]]);poly('#4d695d',[[7,15],[23,14],[30,21],[25,29],[8,28],[2,23]]);poly('#8ba18a',[[9,3],[18,4],[21,7],[11,9],[4,9]]);poly('#466551',[[0,0],[7,0],[9,6],[4,11],[0,9]]);poly('#9aab87',[[24,17],[31,14],[32,21],[28,23]]);return;}
 if(style==='timber'){r('#252f2c',0,0,32,32);r('#b9b99b',0,0,32,5);r('#eee0b6',0,0,32,1);for(let i=0;i<4;i++){r(i%2?'#756347':'#877353',i*8+1,5,7,23);r('#a59670',i*8+2,6,1,21);}r('#3c3026',0,12,32,3);r('#b59764',0,12,32,1);r('#584634',0,26,32,6);r('#c1b394',0,27,32,1);if(hash2(x,y,651)>.7){r('#243c3b',10,6,12,18);r('#8ea297',12,8,8,13);r('#c6c7ab',15,8,1,13);}return;}
 if(style==='bronze'){r('#283d40',0,0,32,32);r('#94aaa0',0,0,32,5);r('#cfd3b4',0,0,32,1);for(let yy=6;yy<28;yy+=11){r('#5e7474',1,yy,30,10);r('#a0aaa0',2,yy,27,1);}const vertical=(x+y)%3!==0;r('#332f29',vertical?12:0,vertical?5:13,vertical?9:32,vertical?24:9);r('#98704b',vertical?13:0,vertical?5:14,vertical?7:32,vertical?24:7);r('#c29d68',vertical?14:0,vertical?5:15,vertical?2:32,vertical?24:2);for(const n of[8,24]){r('#bea47c',vertical?11:n,vertical?n:12,vertical?11:3,vertical?3:11);r('#e2c8a0',vertical?12:n,vertical?n:13,vertical?9:1,1);}r('#334544',0,29,32,3);return;}
 if(style==='ivory'){r('#374f55',0,0,32,32);r('#d1d0b0',0,0,32,6);r('#fff0ce',0,0,32,2);for(let yy=7;yy<27;yy+=10){r('#afb7a0',1,yy,30,9);r('#ddd9b9',2,yy,28,2);r('#849b8d',29,yy+2,2,6);}poly('#748e83',[[11,8],[21,8],[25,14],[22,22],[10,22],[7,14]]);poly('#dedbc0',[[12,10],[20,10],[22,14],[20,20],[12,20],[10,14]]);r('#a99262',14,12,4,5);r('#e4d8af',0,27,32,3);r('#748b82',0,30,32,2);return;}
 if(style==='interior'||style==='worn'){const v=hash2(x,y,663);r('#293c40',0,0,32,32);for(let row=0;row<2;row++){const offset=(x+row+y)%2?9:0;for(let i=-1;i<3;i++){const xx=i*22+offset;r(row?'#60776e':'#72857b',xx+1,6+row*11,20,10);r('#b2bfa6',xx+2,6+row*11,18,1);r('#3c5754',xx+19,8+row*11,2,7);}}r('#8aa28f',0,0,32,5);r('#c7cfb0',0,0,32,1);r('#b5baa0',0,28,32,2);r('#394f49',0,30,32,2);if(style==='worn'){poly('#354e47',[[0,17],[8,19],[11,27],[8,32],[0,32]]);poly('#799071',[[0,23],[4,21],[7,25],[5,29],[0,28]]);poly('#344c47',[[20,7],[26,6],[31,13],[27,17],[24,12]]);}else if(v>.6){r('#203c3e',7,8,18,17);r('#738d7e',8,8,16,2);r('#b9c7a8',9,24,14,2);poly('#627f71',[[12,20],[15,11],[18,10],[21,20]]);r('#bdc6a5',14,12,4,5);}return;}
 if(roof){
  // Jade glazed roof courses, broad bronze eaves, and shaded corbels belong to solid wall cells.
  r('#3a625d',0,0,32,19);for(let row=0;row<3;row++)for(let i=-1;i<5;i++){const a=i*8+(row%2?4:0),b=row*5;poly('#264943',[[a,b],[a+7,b],[a+8,b+5],[a-1,b+5]]);r('#719581',a+1,b,5,2);r('#497e6a',a,b+2,7,2);r('#9bab8d',a+2,b,3,1);}
  r('#203731',0,16,32,4);r('#b69b67',0,18,32,3);r('#ead2a0',0,18,32,1);r('#526358',0,22,32,3);r('#c4c3a3',2,25,28,6);for(const a of[3,13,23]){r('#796a49',a,21,5,7);r('#c9b98b',a,21,5,2);r('#eee0b6',a+1,23,2,3);}return;
 }
 r('#92a39a',0,0,32,5);r('#d1cfaf',1,0,30,2);r('#475f66',0,5,32,24);
 for(let row=0;row<3;row++)for(let i=-1;i<3;i++){const a=i*17+(row%2?8:0),b=6+row*7;r(row===2?'#536a6b':(i+row)%2?'#657a77':'#728780',a+1,b,15,6);r('#a1afa0',a+2,b,13,1);r('#3c535c',a+14,b+2,2,4);}
 r('#253c46',0,28,32,4);r('#b5b79b',0,27,32,2);r('#ddd4b1',0,27,32,1);
 if(front||pier){r('#314348',3,5,26,22);r('#939f8b',5,6,22,20);r('#c9c8a6',6,7,19,2);poly('#6c8378',[[7,11],[24,11],[25,22],[8,24]]);poly('#bcc3a2',[[10,16],[15,10],[21,13],[20,19],[13,22]]);poly('#4f6f68',[[12,16],[16,13],[19,15],[18,18],[14,19]]);r('#d7c28b',14,14,3,2);}
 if(pier){r('#4e665e',4,0,24,32);r('#d9d4b1',6,0,20,30);r('#91a28c',23,1,3,28);r('#e5d7ac',5,5,23,4);r('#ab9367',5,8,23,2);r('#8b9986',4,27,24,4);}
}
function drawPalaceArch(q,a){const {r}=drawKit(q);
 if(a.grand&&a.storey===-2){q.save();q.beginPath();q.rect(0,0,32,24);q.clip();drawPalaceArchitecture(q,{style:'gate-roof'},0,0,{});q.restore();return;}if(a.grand&&a.storey<0){r('#20332c',0,0,32,7);r('#bea16e',0,0,32,4);r('#f1d9a8',0,0,32,1);r('#6a5a3e',0,6,32,2);return;}if(a.grand&&a.storey>0)return;
 if(a.axis==='x'){r('#344940',0,0,32,6);r('#b39260',0,2,32,4);r('#efd5a0',0,2,32,1);r('#665738',0,6,32,3);if(Math.abs(a.index)===(a.wide>>1)){const x=a.index<0?1:27;r('#736042',x,8,4,22);r('#c6ab76',x,8,2,21);}if(a.grand){r('#617e69',7,0,18,2);r('#e0c181',10,5,12,2);}}
 else{r('#736042',0,0,5,32);r('#c6ab76',1,0,2,32);if(Math.abs(a.index)===(a.wide>>1)){const y=a.index<0?0:27;r('#aa8c59',3,y,27,5);r('#ebd6a4',3,y,27,1);}}
}
function drawPalaceRock(q,rise=1){q.save();q.beginPath();q.rect(0,0,32,32);q.clip();q.translate(0,32*(1-rise));q.scale(1,rise);const {poly}=drawKit(q);
 poly('#1b2626',[[1,28],[4,23],[27,22],[31,27],[28,31],[4,31]]);
 poly('#3d302b',[[2,27],[7,5],[22,3],[26,8],[30,27],[27,30],[5,30]]);
 poly('#946843',[[4,26],[9,8],[22,6],[25,10],[27,26],[23,28],[6,28]]);
 poly('#c29b68',[[7,10],[9,6],[22,4],[25,8],[22,12],[10,13]]);
 poly('#e0ba82',[[10,6],[21,5],[23,7],[12,9],[8,9]]);
 poly('#684830',[[22,12],[25,8],[29,27],[25,29],[22,25]]);
 poly('#ad7c4c',[[9,13],[17,11],[21,15],[19,20],[6,23]]);
 poly('#bf925c',[[10,14],[16,12],[19,15],[14,17],[8,18]]);
 poly('#785335',[[6,23],[14,19],[21,20],[22,25],[17,27],[5,27]]);
 poly('#d4a46c',[[14,20],[19,19],[20,22],[15,23]]);
 poly('#503b2c',[[8,11],[10,13],[7,18],[5,20]]);
 poly('#392f2a',[[18,9],[21,10],[19,13],[18,15],[16,14]]);
 poly('#d1a16b',[[6,26],[9,24],[12,25],[10,28],[6,28]]);
q.restore();}
function drawPalaceProp(q,p){const {r}=drawKit(q),line=(c,x,y,xx,yy,w=1)=>{q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(x,y);q.lineTo(xx,yy);q.stroke();},ellipse=(c,x,y,rx,ry)=>{q.fillStyle=c;q.beginPath();q.ellipse(x,y,rx,ry,0,0,Math.PI*2);q.fill();};
 q.fillStyle='#07182444';q.fillRect(6,28,21,2);const style=p.style;
 if(style==='jar'||style==='books'){drawSharedProp(q,style==='jar'?TT.JAR:TT.BOOK_STACK,0,0,2);}
 else if(style==='rail'){r('#526e72',2,25,28,3);r('#e3dec0',2,12,28,3);for(const xx of [5,15,25]){r('#abc3b4',xx,15,3,11);r('#f1e8ce',xx,14,1,11);}r('#827b58',2,11,28,1);}
 else if(['column','dragon','stone-lamp'].includes(style)){r('#344c59',7,27,20,3);r('#b4c7b4',6,25,20,3);r('#e1dec1',10,6,12,19);r('#99b6aa',19,6,3,19);r('#f0e6cc',9,5,14,3);r('#768f88',8,3,16,2);if(style==='dragon'){ellipse('#819d98',16,12,8,6);line('#e3d4b4',9,13,5,18,2);line('#e3d4b4',21,13,27,18,2);r('#d5c990',11,11,2,2);r('#1e454f',19,10,2,2);}if(style==='stone-lamp'){r('#977449',10,12,12,9);r('#e8ba69',12,14,8,4);}}
 else if(['engine','pipe','handle'].includes(style)){r('#182b39',4,24,24,5);r('#8c653e',5,6,22,18);r('#cba275',6,6,19,3);r('#507b77',8,10,16,12);r('#263e4c',10,12,12,8);for(const yy of [11,20])r('#c19a67',4,yy,24,2);for(const xx of [6,24]){r('#604a35',xx,8,2,16);r('#ded2a4',xx,7,2,2);}ellipse('#192b35',16,16,7,7);q.strokeStyle='#ba9160';q.lineWidth=3;q.beginPath();q.arc(16,16,6,0,Math.PI*2);q.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;line('#c39b6d',16+4*Math.cos(a),16+4*Math.sin(a),16+9*Math.cos(a),16+9*Math.sin(a),2);}if(style==='handle'){line('#ead8ad',8,12,24,20,3);ellipse('#5b7c7b',16,16,2,2);}}
 else if(style==='throne'){r('#243747',5,26,25,4);r('#ddd3ae',7,24,21,3);r('#98704b',10,5,17,22);r('#bed5b3',12,7,13,16);r('#557e75',15,9,7,11);r('#e3c37b',8,20,23,3);r('#c9aa70',10,17,2,10);r('#c9aa70',27,17,2,10);ellipse('#c2aa6d',18,9,3,2);}
 else if(style==='coral'){r('#263b3d',3,25,26,5);ellipse('#8aaa8f',16,25,13,4);ellipse('#426557',16,24,10,3);const {poly}=drawKit(q);for(const xx of[8,16,24]){poly('#956d6c',[[xx-2,25],[xx-3,15],[xx-6,11],[xx-5,7],[xx-2,10],[xx,15],[xx+1,5],[xx+4,3],[xx+5,7],[xx+3,12],[xx+5,16],[xx+7,12],[xx+9,13],[xx+8,18],[xx+4,20],[xx+3,25]]);poly('#dfb2a4',[[xx-1,23],[xx-1,16],[xx-4,10],[xx-3,9],[xx+1,14],[xx+2,7],[xx+3,5],[xx+3,12],[xx+2,20]]);ellipse('#eed7b8',xx+3,6,2,2);}ellipse('#ced5b5',9,25,3,2);ellipse('#e8dcbb',24,25,2,1);}
 else if(style==='planter'){ellipse('#193a35',16,28,13,3);polyPlanter105(q,'#6c6951',[[5,20],[27,20],[24,29],[8,29]]);r('#c7bc91',5,19,22,3);r('#e1d2aa',7,19,18,1);ellipse('#325147',16,18,10,3);for(const [xx,yy]of[[9,13],[15,8],[23,12]]){ellipse('#37694e',xx,yy,6,5);ellipse('#749778',xx-1,yy-2,4,3);ellipse('#a9bc8f',xx-2,yy-3,2,1);}ellipse('#e5d4b9',17,12,3,2);ellipse('#cbacb3',22,16,2,2);}
 else if(style==='bed'){r('#304755',3,11,27,18);r('#b8cfbb',5,13,24,12);r('#79ab9d',5,17,24,8);r('#d4ded0',5,13,8,4);r('#bdac83',3,10,2,20);r('#aa9269',29,10,2,20);line('#d8dbb9',6,5,27,5);for(const xx of [5,28]){r('#7aada16b',xx,6,3,19);}}
 else if(style==='curtain'){r('#aa956c',3,5,26,2);r('#80aea299',5,8,11,22);r('#568e8999',17,8,10,22);for(const xx of [8,12,20,24])r('#b7cabc',xx,8,1,20);r('#766548',11,18,11,2);line('#486c55',7,12,12,22,2);}
 else if(['banquet','bench','dresser','basin'].includes(style)){r('#273a43',4,11,25,16);r('#695b49',5,10,23,3);r('#a49471',6,10,21,1);r('#789687',6,12,21,8);r('#414744',6,20,3,8);r('#414744',24,20,3,8);if(style==='basin'){ellipse('#cecdb7',16,16,10,5);ellipse('#264e69',16,15,8,3);ellipse('#7fabaa',16,15,5,1);}else{ellipse('#dedac2',12,15,4,2);ellipse('#557e83',12,15,2,1);r('#ad8b58',21,13,3,4);r('#e0ceaa',20,12,5,2);if(style==='bench')line('#ddd0a6',9,18,19,17,2);if(style==='dresser'){r('#a9baaf',15,3,9,10);r('#263b4b',17,4,6,8);}}}
 else if(['weapon','cups','pipe'].includes(style)){r('#70583e',5,5,3,25);r('#70583e',25,5,3,25);for(const yy of [12,22]){r('#ad9265',5,yy,23,2);if(style==='cups')for(const xx of [10,17,24])r('#d4caad',xx,yy-4,3,4);else{for(const xx of [10,20]){line('#a7b9b6',xx,6,xx,24,2);line('#c6dace',xx-5,9,xx+5,9,2);}}}}
 else if(style==='altar'||style==='incense'){r('#344655',5,25,23,4);r('#cad0b7',7,20,19,6);r('#78998a',10,13,14,8);r('#ad9366',5,12,23,3);ellipse('#e5e3ce',16,9,6,5);ellipse('#fff4dd',14,7,2,1);if(style==='incense'){r('#a78358',9,15,15,4);line('#77938b',16,7,19,4);}}
 else if(style==='mirror'){r('#a8895d',7,5,19,23);r('#1b4158',9,7,15,17);r('#9cc8c6',11,8,11,14);line('#c5dfd0',13,10,19,20);r('#7b7659',13,27,8,3);}
 else if(style==='record'){r('#314555',7,10,19,19);r('#b7c7b7',6,8,20,20);r('#e6e0c9',8,10,16,15);for(const yy of [12,15,18,21])r('#466b74',10,yy,12,1);r('#ae8860',18,20,4,3);}
 else{r('#213540',5,10,23,18);r('#8d7652',6,11,21,14);r('#b9a06b',6,11,21,2);r('#344d4c',9,15,15,7);for(const xx of [7,24])r('#c1b589',xx,14,1,10);r('#b4c8b2',14,17,5,3);}
}
function drawPalaceWallLamp(q,l={}){const {r}=drawKit(q);r('#152631',7,4,19,24);r('#263b44',9,3,16,26);r('#9b794e',11,5,12,3);r('#d0ab76',11,5,10,1);r('#574b38',9,10,4,16);r('#b99562',10,10,2,14);r('#2c4149',14,8,10,17);q.fillStyle='#edd0a0';q.beginPath();q.ellipse(18,16,6,8,0,0,Math.PI*2);q.fill();q.fillStyle='#b99e70';q.beginPath();q.ellipse(20,17,3,6,0,0,Math.PI*2);q.fill();r('#fff0bd',15,11,4,10);r('#fff8df',16,11,2,6);r('#927348',13,8,11,2);r('#785b38',13,23,11,2);r('#d9b57a',13,9,1,14);r('#7b6546',22,9,2,15);r('#cbb082',16,25,4,2);r('#21373d',16,27,4,2);}
function drawPressureGrate(q,shut){const {r}=drawKit(q);r('#1c2429',0,0,32,5);r('#b09463',0,1,32,2);for(let a=4;a<32;a+=6){r('#0d151e',a+2,4,3,shut?28:3);r('#a2a89a',a,4,2,shut?28:3);r('#d3c7a1',a,4,1,shut?24:2);}if(shut){r('#485856',0,11,32,3);r('#485856',0,25,32,3);r('#a78b5e',14,12,5,5);}}
function drawPalaceCell(t,px,py,x,y,foreground=null){const d=state.branchTerrain105?.palace105;if(!d)return false;if([TT.VOID,TT.LAVA,TT.MERCURY].includes(t)){X.fillStyle='#102532';X.fillRect(px,py,32,32);drawSpecialTerrain(t,px,py,x,y,FX.frameNow||performance.now());return true;}if(BRANCH_RENDER_MAP!==state.map){BRANCH_RENDER_MAP=state.map;BRANCH_TILE_CACHE.clear();}const key=k(x,y),height=d.floors[key],prop=d.props[key]?.tile===t?d.props[key]:null,window=t===TT.WALL?d.windows[key]:null,base=terrainBaseTile58(x,y),stamp=[t,height,prop?.style,d.materials?.[key],d.permanentWater?.[key],window?.kind,window?.damaged,d.facades?.[key]?.style,!!d.outdoors?.[key],!!d.mosaics?.[key]].join(':');let entry=BRANCH_TILE_CACHE.get('palace:'+key);if(entry?.stamp!==stamp){const c=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d');q.imageSmoothingEnabled=false;
 if(d.facades?.[key]?.style==='iron-grate'){drawPalaceFloorMaterial(q,3,x,y,d);drawPressureGrate(q,t===TT.WALL);}
 else if(t===TT.WALL||t===TT.PALACE_WALL_LAMP){drawPalaceArchitecture(q,d.facades?.[key],x,y,d);if(window)drawPalaceWindow(q,window,x,y);if(t===TT.PALACE_WALL_LAMP)drawPalaceWallLamp(q,d.wallLamps105?.[key]);}
 else{const h=height??2;drawPalaceFloorMaterial(q,h,x,y,d);
  const trace=d.traces[key];if(trace==='root'){q.strokeStyle='#254c4b';q.lineWidth=2;q.beginPath();q.moveTo(15,0);q.lineTo(13,11);q.lineTo(19,18);q.lineTo(18,32);q.moveTo(13,11);q.lineTo(4,15);q.moveTo(19,18);q.lineTo(26,23);q.stroke();}else if(trace){q.fillStyle=trace==='seaweed'?'#345e53':trace==='silt'?'#a8a07a':trace==='pearl-chain'?'#e5dbc1':'#b2b9a4';for(let i=0;i<5;i++)q.fillRect(5+i*3,24+(i%3),trace==='seaweed'?1:2,1);}
  if(prop)drawPalaceProp(q,prop);else if(t===TT.PALACE_ROCK)drawPalaceRock(q);
 }
 entry={stamp,canvas:c};BRANCH_TILE_CACHE.set('palace:'+key,entry);}
 X.drawImage(entry.canvas,px,py);const nativeMaterial=d.materials?.[key];if(t!==TT.PALACE_ROCK&&nativeMaterial!=null&&(base===nativeMaterial||isWaterTile105(base))){if(nativeMaterial===TT.FLOOR){if(state.branchContext105.level!==2)drawFloorTexture(px,py,x,y,REGION_ART[1],true);}else drawSpecialTerrain(nativeMaterial,px,py,x,y,FX.frameNow||performance.now());X.fillStyle=height===3?'#ddcf982b':height===2?'#a6d2af18':'#17425233';X.fillRect(px,py,32,32);if(prop){X.save();X.translate(px,py);drawPalaceProp(X,prop);X.restore();}}const now=FX.frameNow||performance.now();if(isWaterTile105(base)||t===TT.RAFT&&d.permanentWater[key]){X.save();X.fillStyle=base===TT.WATER||t===TT.RAFT?'#12375dab':'#367d9358';X.fillRect(px,py,32,32);X.strokeStyle=base===TT.WATER?'#76aebb45':'#c6e4d050';X.lineWidth=1;const shift=3*Math.sin(now/850+x*.71+y*.28);for(const yy of [10,23]){X.beginPath();X.moveTo(px+3,py+yy+shift);X.bezierCurveTo(px+11,py+yy-2+shift,px+22,py+yy+2+shift,px+29,py+yy+shift);X.stroke();}if(hash2(x,y,219)>.7){X.strokeStyle='#d1ca8c30';X.beginPath();X.moveTo(px+14,py+4);X.lineTo(px+15,py+28);X.stroke();}X.restore();}
 if(t===TT.PAPER_BRIDGE)drawSpecialTerrain(TT.PAPER_BRIDGE,px,py,x,y,now);if(t===TT.SWITCH){if(foreground)foreground.push({t,px,py,x,y});else drawSpecialTerrain(t,px,py,x,y,now);}if(t===TT.RAFT)drawSpecialTerrain(TT.RAFT,px,py,x,y,now);if(t===TT.ICE){X.fillStyle='#aad8d5a0';X.fillRect(px,py,32,32);X.strokeStyle='#e1eddf';X.beginPath();X.moveTo(px+4,py+7);X.lineTo(px+22,py+25);X.lineTo(px+29,py+19);X.stroke();}
 const tide=palaceTide();if(height!=null&&tide.rising&&tide.remaining<=2&&tide.next>height&&base!==TT.WATER){X.strokeStyle='#a7e6df';X.lineWidth=1;X.setLineDash([3,3]);X.strokeRect(px+2,py+2,28,28);X.setLineDash([]);}
 const roomId=d.roomCells[key],gate=palaceWorld().gates[`${state.branchContext105.level}:${roomId}`];if(height!=null&&gate?.until>palaceWorld().time){X.strokeStyle='#e5c485aa';X.lineWidth=2;for(const[dx,dy]of DIRS4)if(d.roomCells[k(x+dx,y+dy)]!==roomId){X.beginPath();if(dx){X.moveTo(px+(dx<0?1:31),py);X.lineTo(px+(dx<0?1:31),py+32);}else{X.moveTo(px,py+(dy<0?1:31));X.lineTo(px+32,py+(dy<0?1:31));}X.stroke();}}
 if(window){X.fillStyle=`rgba(150,222,218,${.035+.025*Math.sin(now/(1600+hash2(x,y,183)*1700)+x+y)})`;X.fillRect(px+7,py+8,18,17);}
 if(d.lights.some(l=>!l.wall&&l.x===x&&l.y===y)&&!terrainUnlit105(x,y)){X.fillStyle='#5a4a35';X.fillRect(px+23,py+9,6,12);X.fillStyle='#e6b96a';X.fillRect(px+24,py+11,4,7);X.fillStyle='#ffe0a0';X.fillRect(px+25,py+12,2,4);}
 if(t===TT.PORTAL){const p=state.branchPortals105.find(p=>p.x===x&&p.y===y);if(p)drawBranchDoor(px,py,p);}
 if(d.arches?.[key]&&!tileBlocks(t)&&!prop){X.save();X.translate(px,py);drawPalaceArch(X,d.arches[key]);X.restore();}else if(t===TT.DOOR||t===TT.OPEN_DOOR)drawDoor(px,py,t===TT.OPEN_DOOR);return true;
}
const PALACE_KING_SPRITE=Object.freeze({width:80,height:88,frames:1,resolution:2,x:-4,y:-8,displayWidth:40,displayHeight:44});
function drawPalaceActor(q,m,frame){const {r,poly}=drawKit(q),line=(c,x,y,xx,yy,w=1)=>{q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(x,y);q.lineTo(xx,yy);q.stroke();},b=frame?1:0;q.imageSmoothingEnabled=false;
 if(m.palaceActor105==='king'){if(PALACE_KING_IMAGE105.complete&&PALACE_KING_IMAGE105.naturalWidth)q.drawImage(PALACE_KING_IMAGE105,(frame%PALACE_KING_SPRITE.frames)*PALACE_KING_SPRITE.width,0,PALACE_KING_SPRITE.width,PALACE_KING_SPRITE.height,PALACE_KING_SPRITE.x,PALACE_KING_SPRITE.y,PALACE_KING_SPRITE.displayWidth,PALACE_KING_SPRITE.displayHeight);drawHeldWeapon(q,m,'right',false);return;}
 if(m.palaceActor105==='gardener'||monsterSpeciesName(m)==='용궁 정원사'){r('#081b2a55',7,33,18,2);if(PALACE_GARDENER_IMAGE105.complete&&PALACE_GARDENER_IMAGE105.naturalWidth)q.drawImage(PALACE_GARDENER_IMAGE105,(frame%2)*64,0,64,72,0,0,32,36);return;}
 r('#081b2a55',5,33,23,2);if(m.palaceActor105==='lotus'){const bloom=palaceWet(m);for(const ps of [[[15,23],[9,30],[2,32]],[[18,22],[23,28],[30,31]],[[15,27],[12,35]],[[18,26],[20,35]]])for(let i=1;i<ps.length;i++)line('#244d4e',...ps[i-1],...ps[i],3);line('#4d8677',15,30,16,16,5);poly('#205250',[[3,25],[9,22],[15,27],[12,30],[5,29]]);poly('#517e6f',[[19,29],[24,23],[30,23],[27,28]]);
  if(!bloom){poly('#202b38',[[16,2+b],[24,10+b],[23,19+b],[16,25+b],[9,19+b],[8,10+b]]);poly('#d3b5c0',[[16,4+b],[21,10+b],[21,17+b],[16,23+b],[11,17+b],[11,10+b]]);poly('#efddcf',[[15,5+b],[17,8+b],[14,18+b],[11,17+b],[11,11+b]]);line('#a27791',16,9+b,18,21+b);line('#779b80',9,20+b,16,23+b,2);}
  else{poly('#263441',[[16,2+b],[21,6+b],[28,7+b],[30,14+b],[26,21+b],[18,25+b],[8,24+b],[3,18+b],[3,10+b],[11,8+b]]);for(const ps of [[[16,4+b],[21,9+b],[17,15+b],[12,10+b]],[[26,8+b],[28,15+b],[20,18+b],[19,12+b]],[[7,9+b],[4,16+b],[11,20+b],[13,13+b]],[[24,22+b],[17,24+b],[14,18+b],[21,17+b]],[[8,23+b],[4,19+b],[10,17+b],[14,21+b]]])poly('#e1c7cc',ps);poly('#553442',[[12,11+b],[20,11+b],[23,17+b],[18,21+b],[10,18+b]]);poly('#eedfcb',[[12,11+b],[14,15+b],[16,11+b],[18,15+b],[20,11+b],[21,16+b],[18,19+b],[16,16+b],[13,19+b],[11,16+b]]);r('#352a35',13,15+b,6,2);r('#ffebe0',12,7+b,2,2);r('#c9a0b7',25,12+b,2,2);}
 }
}
function drawPalaceHud(){if(state?.branchContext105?.id!=='palace')return;X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);const width=Math.min(VIEW.cssW||C.clientWidth||360,620),mobile=isMobileViewport(),canvasTop=C.getBoundingClientRect().top,hud=document.getElementById('mobileHud'),zoom=document.getElementById('zoomHud')||document.querySelector('.zoomHud'),top=state.debugBattle57?8:mobile?Math.max(88,(hud?.getBoundingClientRect().bottom||0)-canvasTop+8,(zoom?.getBoundingClientRect().bottom||0)-canvasTop+8):8,t=palaceTide(),w=palaceWorld(),room=state.branchTerrain105.palace105.roomCells[k(state.player.x,state.player.y)],g=w.gates[`${state.branchContext105.level}:${room}`],extra=[state.monsters.some(m=>m.hp>0&&m.intent54?.type==='palaceRoyal105')?`왕의 밀물 예고 ${Math.max(0,state.monsters.find(m=>m.hp>0&&m.intent54?.type==='palaceRoyal105').intent54.data.resolveTurn105-state.turn)}턴 뒤 · 낮은 바닥 대피`:null,t.royal?`왕의 밀물 ${t.royalRemaining.toFixed(1)}턴`:null,g?.until>w.time?`이 방 배수 ${Math.ceil(g.until-w.time)}턴`:g?.ready>w.time?`수문 재사용 ${Math.ceil(g.ready-w.time)}턴`:null].filter(Boolean).join(' · '),lines=[];X.font='11px system-ui';if(extra){let line='';for(const c of extra){if(X.measureText(line+c).width>width-36){lines.push(line);line=c;}else line+=c;}if(line)lines.push(line);}const height=38+14*lines.length;X.fillStyle='#142b35ed';X.fillRect(8,top,width-16,height);X.strokeStyle='#b0b497';X.strokeRect(8.5,top+.5,width-17,height-1);X.fillStyle='#e3dec1';X.font='11px system-ui';X.fillText(`수위 ${t.level} / ${t.rising?'밀물 ↑':'썰물 ↓'} · 다음 ${t.next} · ${t.remaining.toFixed(1)}턴`,15,top+14);if(extra){X.fillStyle='#efd19b';lines.forEach((line,i)=>X.fillText(line,15,top+28+i*14));}const y=top+height-13;for(let i=0;i<4;i++){X.fillStyle=palaceColors()[i];X.fillRect(15+i*25,y,20,8);if(i===t.level){X.strokeStyle='#f4d485';X.strokeRect(14.5+i*25,y-.5,21,9);}}X.fillStyle='#adcebb';X.font='9px system-ui';X.fillText('물결 0 / 조개 1 / 비늘 2 / 금테 3',122,y+7);X.restore();}
const BRANCH_TILE_CACHE=new Map();
let BRANCH_RENDER_MAP=null;
function drawBranchDoor(px,py,p){

 const id=p.to?.split(':')[0],up=p.id==='up'||id==='main'||p.kind==='citadel-stair'&&p.id.endsWith('-up')||p.kind==='dojo-local'&&p.id.startsWith('in');
 const c=BRANCH_DEFS105[id]?.color||BRANCH_DEFS105[state?.branchContext105?.id]?.color||'#cbb68a';
 X.save();X.imageSmoothingEnabled=false;
 X.fillStyle='#141619';X.fillRect(px+3,py+2,26,28);
 X.fillStyle=state?.branchContext105?.id==='palace'?'#9d7b51':'#584e40';X.fillRect(px+2,py+1,4,30);X.fillRect(px+26,py+1,4,30);
 X.fillStyle=c;X.fillRect(px+2,py+1,28,3);X.fillRect(px+5,py+4,22,2);
 X.fillStyle='#252a2a';X.fillRect(px+6,py+6,20,22);
 // A narrowing flight of stone steps, with the light edge facing the player.
 for(let i=0;i<5;i++){const inset=up?7-i:3+i,w=32-inset*2,y=up?9+i*4:10+i*4;X.fillStyle=state?.branchContext105?.id==='palace'?(i%2?'#a9bca8':'#d9d8ba'):(i%2?'#61594a':'#746958');X.fillRect(px+inset,py+y,w,4);X.fillStyle=i===4?c:'#b4a58b';X.fillRect(px+inset,py+y,w,1);X.fillStyle='#242625';X.fillRect(px+inset,py+y+3,w,1)}
 X.fillStyle=c;X.fillRect(px+13,py+5,6,2);X.fillStyle='#29241e';X.fillRect(px+14,py+5,4,1);
 if(p.requireWorld105){const locked=p.requireWorld105.keys.filter(key=>!state.branchWorld105?.[p.requireWorld105.section]?.opened?.[key]);if(locked.length){X.fillStyle='#11191d';X.fillRect(px+4,py+7,24,3);X.fillStyle='#9b9584';X.fillRect(px+4,py+7,24,1);for(const xx of[8,14,20,26]){X.fillStyle='#182126';X.fillRect(px+xx,py+10,2,19);X.fillStyle='#b0ae96';X.fillRect(px+xx,py+10,1,18);}for(let i=0;i<locked.length;i++){X.strokeStyle='#d2a865';X.lineWidth=1.8;for(let n=0;n<4;n++){X.beginPath();X.ellipse(px+9+i*12,py+12+n*4,2,2.8,n%2?.3:-.3,0,Math.PI*2);X.stroke();}}}}
 X.restore();
}
// Cached, deterministic materials. World-space courses continue across cell edges;
// the canvas owns only the substrate, never gameplay state or foreground furniture.
function drawIndoorBranchMaterial(q,t,s,x,y,P){
 const cold=state.branchContext105.id==='canal',wood=t===TT.WALL?wallMaterial105(x,y)==='wood':s==='wood'||P.wood,gx=x*32,gy=y*32;
 if(t===TT.WALL&&!wood&&(s==='wood'||P.wood))P=branchDistrictPalette('granary',3);
 const {r}=drawKit(q),stroke=(c,pts,w=.5)=>{q.strokeStyle=c;q.lineWidth=w;q.beginPath();pts.forEach(([a,b],i)=>i?q.lineTo(a,b):q.moveTo(a,b));q.stroke()};
 const wall=(xx,yy)=>terrainBaseTile58(xx,yy)===TT.WALL,wet=(xx,yy)=>terrainBaseTile58(xx,yy)===TT.WATER;
 q.save();q.beginPath();q.rect(0,0,32,32);q.clip();
 if(t===TT.WALL){
  const L=wall(x-1,y),R=wall(x+1,y),U=wall(x,y-1),D=wall(x,y+1);
  if(DIRS8.every(([dx,dy])=>wall(x+dx,y+dy))){
   r(colorShift(P.dark,-17),0,0,32,32);
   if((x+2*y)%5===0)stroke('rgba(178,179,152,.045)',[[1,24],[13,21],[24,23],[32,20]]);
   q.restore();return;
  }
  r(P.dark,0,0,32,32);
  if(wood){
   for(let i=-1;i<5;i++){
    const a=i*9-(gx%9),h=hash2(Math.floor((gx+a)/9),y>>1,816);
    const g=q.createLinearGradient(a,0,a+8,0);g.addColorStop(0,colorShift(P.wall,-16));g.addColorStop(.22,colorShift(P.wall,8));g.addColorStop(1,colorShift(P.wall,-10));r(g,a,6,8,26);
    stroke('rgba(230,191,135,.16)',[[a+2,8],[a+2.5,16],[a+2,29]]);
    stroke('rgba(26,18,12,.28)',[[a+5,9],[a+4.5,14+h*8],[a+6,31]]);
   }
   for(const yy of [11,25]){r('#30281f',0,yy,32,3);r('#80735c',0,yy,32,.75);for(let a=4;a<32;a+=21){r('#171b19',a,yy+1,2,1.5);r('#b2a287',a,yy+1,1,.5)}}
  }else{
   const rowH=10,blockW=23;
   for(let row=0;row<3;row++){
    const yy=7+row*rowH,offset=((y*3+row)&1)*11;
    for(let col=Math.floor((gx-offset)/blockW);col*blockW+offset<gx+32;col++){
     const a=col*blockW+offset-gx,n=hash2(col,y*3+row,cold?816:917),base=colorShift(P.wall,Math.round(n*14-7));
     const g=q.createLinearGradient(0,yy,0,yy+9);g.addColorStop(0,colorShift(base,6));g.addColorStop(.45,base);g.addColorStop(1,colorShift(base,-12));r(g,a+.5,yy,blockW-1,9);
     r('rgba(214,224,207,.20)',a+1.5,yy+.5,blockW-3,.5);r('rgba(16,22,23,.38)',a+blockW-1.5,yy+1,1,8);
     for(let j=0;j<4;j++){const xx=a+2+hash2(col+j,y*3+row,77)*18,sy=yy+2+hash2(col,row+j,53)*5;r(j&1?'rgba(232,225,198,.10)':'rgba(17,26,26,.16)',xx,sy,1+(j%2),.5)}
     if(n>.77){stroke('rgba(17,24,24,.42)',[[a+15,yy+.5],[a+12,yy+3],[a+13,yy+5],[a+10,yy+8]]);stroke('rgba(210,215,195,.15)',[[a+15.5,yy+.5],[a+12.5,yy+3],[a+13.5,yy+5]])}
    }
   }
   if(cold){
    const near=DIRS4.some(([dx,dy])=>wet(x+dx,y+dy)),damp=hash2(x,y,922);
    if(near||damp>.65){
     for(let i=0;i<4;i++){const a=2+hash2(x*4+i,y,42)*27,yy=19+hash2(x,y*4+i,43)*9,w=2+hash2(x+i,y,44)*5;r('rgba(38,62,51,.44)',a,yy,w,2.5);r('rgba(129,151,97,.29)',a,yy,w-1,.5);if(i%2)r('rgba(24,47,41,.23)',a+1,yy+2,1,5)}
    }
    if(near){const g=q.createLinearGradient(0,17,0,32);g.addColorStop(0,'rgba(19,43,43,0)');g.addColorStop(1,'rgba(17,40,39,.35)');r(g,0,17,32,15)}
   }else if(P.soot){const g=q.createLinearGradient(0,5,0,27);g.addColorStop(0,'rgba(19,17,15,.44)');g.addColorStop(1,'rgba(19,17,15,0)');r(g,0,5,32,22)}
  }
  // Thick coping continues along the wall, with joints every two cells.
  r(colorShift(P.cap,U?-14:0),0,0,32,6);r(U?'rgba(225,223,193,.09)':P.light,0,U?1:0,32,U?.5:1);
  r('rgba(8,15,17,.52)',0,6,32,1.5);r(colorShift(P.cap,-7),0,7.5,32,1);
  if(x%2===0){r('rgba(11,19,20,.33)',1,0,1,6);r('rgba(230,230,200,.12)',2,1,.5,4)}
  if(!L){r(P.dark,0,8,2,24);r('rgba(208,222,201,.21)',2,8,.75,22)}
  if(!R){r('rgba(7,15,16,.46)',29,7,3,25);r('rgba(200,210,185,.10)',28,8,.5,22)}
  r('rgba(10,17,17,.5)',0,30,32,2);
 }else{
  r(P.floor,0,0,32,32);
  if(wood){
   const spacing=8,len=128;
   for(let row=Math.floor(gy/spacing);row*spacing<gy+32;row++){
    const yy=row*spacing-gy,offset=(row*43)%len;
    for(let col=Math.floor((gx-offset)/len);col*len+offset<gx+32;col++){
     const a=col*len+offset-gx,n=hash2(col,row,922),base=colorShift(P.floor,Math.round(n*12-6));
     r(base,a,yy,len-1,spacing-1);r('rgba(227,183,126,.13)',a+1,yy+.5,len-3,.5);r('rgba(22,16,12,.38)',a,yy+7,len,1);r('rgba(22,16,12,.35)',a,yy,1,7);
     stroke('rgba(24,16,12,.21)',[[a+5,yy+3],[a+23,yy+2.5],[a+49,yy+4],[a+85,yy+3],[a+119,yy+3.5]]);
     stroke('rgba(211,173,120,.11)',[[a+10,yy+5.5],[a+35,yy+5],[a+68,yy+6],[a+99,yy+5.5]]);
     if(n>.62){q.strokeStyle='rgba(28,20,15,.3)';q.lineWidth=.5;q.beginPath();q.ellipse(a+30,yy+4,4,1.2,0,0,Math.PI*2);q.stroke()}
     r('#302921',a+3,yy+2,1,1);r('rgba(213,190,148,.25)',a+3,yy+2,1,.5);
    }
   }
  }else{
   // Broad staggered flagstones, not a separate bright border on every tile.
   const rowH=P.brick?12:24,blockW=P.brick?28:48;
   for(let row=Math.floor(gy/rowH);row*rowH<gy+32;row++){
    const yy=row*rowH-gy,offset=(row&1)*blockW/2;
    for(let col=Math.floor((gx-offset)/blockW);col*blockW+offset<gx+32;col++){
     const a=col*blockW+offset-gx,n=hash2(col,row,cold?125:234),base=colorShift(P.floor,Math.round(n*10-5));
     r(colorShift(P.dark,4),a,yy,blockW,rowH);r(base,a+1,yy+1,blockW-1.5,rowH-1.5);
     r('rgba(207,214,193,.13)',a+1.5,yy+1,blockW-3,.5);r('rgba(193,206,184,.08)',a+1,yy+2,.5,rowH-3);
     r('rgba(12,23,25,.2)',a+2,yy+rowH-1.5,blockW-3,.5);
     for(let j=0;j<6;j++){const xx=a+3+hash2(col*6+j,row,10)*(blockW-6),sy=yy+3+hash2(col,row*6+j,11)*(rowH-6);r(j&1?'rgba(210,209,185,.08)':'rgba(17,27,28,.10)',xx,sy,1.5+(j%3),.5)}
     if(n>.88){stroke('rgba(16,26,28,.26)',[[a+blockW-2,yy+3],[a+blockW-10,yy+8],[a+blockW-8,yy+12],[a+blockW-15,yy+15]]);stroke('rgba(208,209,185,.10)',[[a+blockW-2,yy+2.5],[a+blockW-10,yy+7.5]])}
    }
   }
  }
  const north=wall(x,y-1),west=wall(x-1,y),east=wall(x+1,y),south=wall(x,y+1),edge=north||west||east||south;
  if(north){const g=q.createLinearGradient(0,0,0,11);g.addColorStop(0,'rgba(9,16,18,.48)');g.addColorStop(1,'rgba(9,16,18,0)');r(g,0,0,32,11)}
  if(west){const g=q.createLinearGradient(0,0,7,0);g.addColorStop(0,'rgba(9,16,18,.29)');g.addColorStop(1,'rgba(9,16,18,0)');r(g,0,0,7,32)}
  if(south)r('rgba(11,19,19,.12)',0,30,32,2);if(east)r('rgba(11,19,19,.14)',30,0,2,32);
  const seed=hash2(x,y,773);
  if(edge&&seed>.56){
   for(let i=0;i<4;i++){
    const a=west?1+hash2(x+i,y,4)*3:east?27+hash2(x+i,y,4)*3:3+hash2(x+i,y,4)*26;
    const yy=north?3+hash2(x,y+i,7)*4:south?26+hash2(x,y+i,7)*4:3+hash2(x,y+i,7)*26;
    r(cold?'rgba(111,139,86,.22)':P.soot?'rgba(15,13,11,.25)':'rgba(212,183,116,.27)',a,yy,cold?3:1.5,cold?1.5:.75);
   }
  }
  // Dressed stone curb: the wet edge stays separate from the walkable surface.
  for(const[dx,dy]of DIRS4)if(wet(x+dx,y+dy)){
   const vertical=!!dx,a=dx>0?29:0,b=dy>0?29:0;r(P.dark,vertical?a:0,vertical?0:b,vertical?3:32,vertical?32:3);
   r('rgba(194,207,187,.24)',vertical?(dx>0?28:3):0,vertical?0:(dy>0?28:3),vertical?1:32,vertical?32:1);
  }
 }
 q.restore();
}
function drawBranchCell(t,px,py,x,y,foreground=null){
 if(t===TT.PALACE_ROCK){const record=state.tempTerrain74?.find(r=>r.x===x&&r.y===y&&r.rootWall105),old=record?.old??TT.FLOOR,now=FX.frameNow||performance.now();if(!drawBranchCell(old,px,py,x,y)&&!globalThis.__MANRU_LEGEND_TERRAIN47__?.drawCell?.(old,px,py,x,y,now,true)){if(old===TT.WALL)drawWallTexture(px,py,x,y,regionColors());else{drawFloorTexture(px,py,x,y,regionColors(),true);drawSpecialTerrain(old,px,py,x,y,now);}}X.save();X.translate(px,py);drawPalaceRock(X,record?.riseStarted105==null?1:Math.min(1,Math.max(.08,(now-record.riseStarted105)/220)));X.restore();return true;}
 if(state.branchContext105?.id==='palace')return drawPalaceCell(t,px,py,x,y,foreground);
 if(!state.branchContext105)return false;
 if(isWaterTile105(t)||t===TT.ICE)return drawSpecialTerrain(t,px,py,x,y,FX.frameNow||performance.now());
 if(state.branchContext105.id==='dojo')return drawDojoCell(t,px,py,x,y);
 if(state.branchContext105.id==='citadel')return drawCitadelCell(t,px,py,x,y,foreground);
 if(state.branchContext105.id==='mine')return drawMineCell(t,px,py,x,y,foreground);
 if(BRANCH_RENDER_MAP!==state.map){BRANCH_RENDER_MAP=state.map;BRANCH_TILE_CACHE.clear()}
 const indoor=['canal','granary'].includes(state.branchContext105.id),actual=t;t=terrainBaseTile58(x,y,t);if(!indoor&&[TT.GARDEN_TREE,TT.STONE_PILLAR,TT.CRATE,TT.JAR,TT.RACK].includes(actual)&&state.branchTerrain105.props[k(x,y)])t=actual;
 if(t===TT.WATER||indoor&&[TT.VOID,TT.LAVA,TT.MERCURY].includes(t)){
  drawSpecialTerrain(t,px,py,x,y,FX.frameNow||performance.now());
  if(actual!==t){if(foreground)foreground.push({t:actual,px,py,x,y});else if(!drawSpecialTerrain(actual,px,py,x,y,FX.frameNow||performance.now()))drawInteractiveTerrain(actual,px,py,x,y,FX.frameNow||performance.now());}
  return true;
 }
 const b=state.branchContext105,ter=state.branchTerrain105,material=t===TT.WALL?wallMaterial105(x,y):null,s=t===TT.WALL&&ter.surfaces[k(x,y)]==='wood'&&material==='stone'?'rock':ter.surfaces[k(x,y)]||'stone',prop=!indoor&&[TT.CRATE,TT.JAR,TT.RACK,TT.GARDEN_TREE,TT.STONE_PILLAR].includes(t)?(ter.props[k(x,y)]||({[TT.CRATE]:'crate',[TT.JAR]:'jar',[TT.RACK]:'rack'}[t])):null,height=branchHeight(x,y),key=y*COLS+x,stamp=[actual,t,s,prop,height,material].join(':');
 let entry=BRANCH_TILE_CACHE.get(key),c=entry?.stamp===stamp?entry.canvas:null;
 if(!c){const palette=indoor?branchDistrictAt(x,y):null;c=document.createElement('canvas');c.width=c.height=indoor?48:32;const q=c.getContext('2d');if(indoor)q.scale(1.5,1.5);const h=hash2(x,y,b.level*107),cold=b.id==='canal',black=b.id==='black',outside=b.id==='stockade'||black;
 const {r}=drawKit(q),line=(col,a,d,w,z)=>{q.strokeStyle=col;q.lineWidth=1;q.beginPath();q.moveTo(a,d);q.lineTo(w,z);q.stroke()};
 if(indoor){drawIndoorBranchMaterial(q,t,s,x,y,palette);}else{
 const floor=cold?['#465b68','#506574']:black?['#555155','#5d585b']:outside?['#6a6c50','#737456']:['#65553b','#6f5d42'];r(palette?palette.floor:floor[h>.5?1:0],0,0,32,32);
 if(s==='earth'){r((black?['#394b44','#485249','#565a51','#66685a']:['#536247','#5f6a50','#72795e','#858569'])[Math.max(0,Math.min(3,height))],0,0,32,32);for(let i=0;i<10;i++){const ax=(hash2(x*7+i,y,4)*30)|0,ay=(hash2(x,y*7+i,8)*30)|0;r(i%3?'#788360':'#9a9677',ax,ay,2,1);}if(hash2(x>>1,y>>1,19)>.62){q.fillStyle='#707054';q.beginPath();q.moveTo(0,8);q.lineTo(11,5);q.lineTo(25,9);q.lineTo(32,7);q.lineTo(32,23);q.lineTo(18,26);q.lineTo(0,20);q.fill();r('#939071',8,14,4,2);}}
 if(s==='wood'){
  for(let a=0;a<32;a+=8){r(black?(a%16?'#51464e':'#443c46'):(a%16?'#7f684d':'#735c44'),0,a,32,7);line('#a18a66',0,a,31,a);const joint=((y+a/8)%2)*14+5;r('#443d31',joint,a,1,7);line('#8c7353',3,a+4,27,a+4);}r('#332c24',0,31,32,1);
 }else{
  for(let i=0;i<(indoor?3:8);i++){const hx=(hash2(x*11+i,y,5)*28)|0,hy=(hash2(x,y*13+i,7)*28)|0;r(i%2?'#999780':'#444b42',hx,hy,2+(i%3),1);}
  if(s==='stone'){line(cold?'#354a48':'#4a473f',0,16,31,16);line('#929382',1,17,30,17);line('#414a44',(y%2)*16+7,0,(y%2)*16+7,15);line('#414a44',((y+1)%2)*16+7,17,((y+1)%2)*16+7,31);}
 }
 if(s==='ceremony'){r(black?'#393845':'#746445',0,0,32,32);r(black?'#b1938f':'#c3ad77',1,1,30,1);r('#29292c',2,29,28,2);line('#b8a27c',16,5,26,16);line('#b8a27c',26,16,16,27);line('#b8a27c',16,27,6,16);line('#b8a27c',6,16,16,5);r('#342f30',13,13,6,6);}
 if(s==='peat'||s==='garden'){r(black?(s==='peat'?'#3b393e':'#414d49'):(s==='peat'?'#534d40':'#526447'),0,0,32,32);for(let i=0;i<9;i++)r(s==='peat'?(i%2?'#81705a':'#373d32'):(i%2?'#809267':'#3a4d37'),Math.floor(hash2(x+i,y,41)*29),Math.floor(hash2(x,y+i,92)*29),3,1);}
 if(s==='gravel'){r(black?'#555c67':'#777973',0,0,32,32);for(let i=0;i<14;i++)r(black?(i%2?'#8b929b':'#343f4c'):(i%2?'#aaa99a':'#555f5d'),(hash2(x+i,y,12)*29)|0,(hash2(x,y+i,33)*29)|0,3,2);}
 if(black&&s==='stone'&&t!==TT.WALL){r('#4b505b',0,0,32,32);for(let yy=0;yy<32;yy+=8){line('#292f3a',0,yy,32,yy);line('#717581',2,yy+1,31,yy+1);line('#303842',(yy%16?7:21),yy,(yy%16?7:21),yy+7);}}
 if(s==='cliff'){drawMountainCliff(q,x,y,height,b.id);}
 else if(t===TT.WALL&&DIRS8.every(([dx,dy])=>state.map[y+dy]?.[x+dx]===TT.WALL)){r(cold?'#182630':black?'#1b1b24':'#29251e',0,0,32,32);if(h>.91)r(cold?'#263b3a':'#383127',5,16,18,1);}
 else if(t===TT.WALL){const wood=s==='wood';r(wood?(black?'#302b30':'#493a2d'):'#2e4240',0,0,32,32);
  if(wood){for(let a=1;a<32;a+=6){r(black?'#65545b':'#806044',a,5,5,26);r('#ad8860',a,5,1,23);r('#342b26',a+4,6,1,26);}r('#392b26',0,11,32,4);r('#ad8760',0,11,32,1);r('#392b26',0,25,32,4);for(const a of[3,15,27])r('#b1a18a',a,12,2,2);
  }else{for(let j=6;j<32;j+=10)for(let a=-((j/10|0)%2)*9;a<32;a+=17){r(palette?.wall||(cold?'#526a79':'#596d65'),a,j,16,8);r(palette?.light||(cold?'#879da5':'#85938a'),a+1,j,14,1);r(palette?.dark||(cold?'#253943':'#233b38'),a+15,j,1,9);}if(cold){
   const damp=hash2(x>>1,y>>1,119),nearWater=DIRS8.some(([dx,dy])=>state.map[y+dy]?.[x+dx]===TT.WATER);
   if(damp>(nearWater?.28:.56)){const count=2+Math.floor(hash2(x,y,88)*5);for(let j=0;j<count;j++){const ax=2+Math.floor(hash2(x*5+j,y,44)*26),ay=14+Math.floor(hash2(x,y*7+j,71)*15),w=2+Math.floor(hash2(x+j,y,15)*6);r(j%3===0?'#8e9e77':j%2?'#586e52':'#6e8262',ax,ay,w,2+(j%3));if(j%2===0)r('#40594c',ax+1,ay+2,2,4);}}
  }if(b.id==='granary'&&h>.70){const seed=hash2(x,y,607),ax=5+Math.floor(seed*20),ay=7+Math.floor(hash2(x,y,801)*8),flip=seed>.5?1:-1;let xx=ax,yy=ay;for(let j=0;j<3+Math.floor(seed*3);j++){const nx=xx+flip*(j%2?3:-2),ny=yy+3+Math.floor(hash2(x+j,y,65)*3);line(palette.dark,xx,yy,nx,ny);if(j===1)line(palette.light,xx+1,yy,nx+5,ny-1);xx=nx;yy=ny;}}}

  if(state.map[y-1]?.[x]===TT.WALL){r(wood?'#79664d':palette?.cap||'#657b70',0,0,32,5);}else r(wood?'#ad9472':palette?.light||'#a2afa1',0,0,32,5);r(wood?'#76644d':palette?.cap||'#718b80',0,5,32,3);r('#1b2523',0,30,32,2);
  if(state.map[y]?.[x-1]!==TT.WALL)r('#c1ae85',0,4,2,26);if(state.map[y]?.[x+1]!==TT.WALL)r('#1b2322',29,7,3,25);
 }else if(t===TT.VOID){r(black?'#11151e':'#14202a',0,0,32,32);if(h>.88){r('#1b2932',5,22,14,1);r('#1b2932',12,25,17,1);}
  if((ter.mountainVersion105||0)<2&&y>0&&state.map[y-1]?.[x]!==TT.VOID){r('#3c4948',0,0,32,12);r('#62716a',0,0,32,3);r('#293d40',0,12,32,8);r('#172d35',3,20,26,5);for(let a=3;a<32;a+=9)line('#1b2e32',a,4,a+2,21);}
  if(ter.mountainVersion105)drawMountainVoidSides(q,x,y);else{if(x>0&&state.map[y]?.[x-1]!==TT.VOID){r('#49574f',0,0,5,32);r('#293d3c',5,0,4,32);}if(x<COLS-1&&state.map[y]?.[x+1]!==TT.VOID)r('#4c5952',27,0,5,32);}
 }
 }
 if(t===TT.DRAWBRIDGE_DOWN||s==='bridge'){r('#1d3035',0,0,32,32);const vertical=ter.surfaces[k(x,y-2)]==='bridge'||ter.surfaces[k(x,y+2)]==='bridge';for(let a=1;a<32;a+=5){if(vertical){r('#a17c52',2,a,28,4);r('#c4a377',3,a,26,1);}else{r('#9a7751',a,2,4,28);r('#c4a377',a,3,1,26);}}for(const a of[2,28]){const side=a===2?-1:1;if(ter.surfaces[k(x+(vertical?side:0),y+(vertical?0:side))]==='bridge')continue;if(vertical){r('#3b322b',a,0,2,32);r('#c1ad80',a,0,1,32);}else{r('#3b322b',0,a,32,2);r('#c1ad80',0,a,32,1);}}
 }
 if(t===TT.WALL&&(s==='ironstone'||s==='rock')){r(s==='ironstone'?'#393d48':'#535e5d',0,0,32,32);for(let j=6;j<32;j+=9)for(let a=-(j%2)*7;a<32;a+=15){r(s==='ironstone'?'#646777':'#7a8580',a,j,14,7);r(s==='ironstone'?'#9797a7':'#adb3a2',a,j,14,1);}r('#a4a394',0,0,32,4);r('#1f2831',0,29,32,3);if(s==='ironstone'){r('#272831',3,4,3,25);r('#bbb2a0',3,8,2,2);r('#bbb2a0',3,23,2,2);}}
 if(s==='stairs'&&![TT.WALL,TT.VOID,TT.WATER].includes(t)){for(let a=2;a<32;a+=5){r('#373f3b',1,a,30,4);r('#b4b39a',1,a,30,1);r('#858979',2,a+1,28,2);}}
 if(prop){r('rgba(0,0,0,.35)',4,23,25,7);if(prop==='deadTree'){drawMountainTree(q,x,y,true,b.id,height);}
 else if(prop==='tree'){drawMountainTree(q,x,y,false,b.id,height);}
 else if(prop==='jar'){r('#352b28',7,8,20,19);r('#805e47',8,10,17,16);r('#bb8e62',10,11,3,11);r('#3d3630',9,5,15,5);r('#ae8864',9,5,15,2);r('#493e36',10,24,13,3);}
 else if(prop==='sack'){r('#57442f',5,9,22,20);r('#baa074',6,11,20,15);r('#ddc394',7,12,15,2);r('#8b704c',19,12,6,14);r('#c9af80',10,6,12,8);r('#6e593b',9,8,14,2);line('#92794f',10,15,12,25);line('#e2c89a',14,17,14,25);}
 else if(prop==='banner'){r('#292629',15,3,3,28);r('#c7b78c',15,2,2,27);r(black?'#472d43':'#793f30',4,4,12,17);r(black?'#af7c8d':'#d4ad70',5,5,9,2);r('#ded0a6',9,9,3,8);r('#30242a',4,19,5,3);}
 else if(prop==='brazier'){r('#333138',6,23,21,6);r('#92918b',8,21,17,3);r('#5d5146',9,16,15,6);r('#d2783f',10,9,12,9);r('#f3c16b',13,5,6,13);r('#fff0ba',15,10,3,7);}
 else if(prop==='well'){r('#263638',5,9,23,17);r('#8d9584',5,7,23,5);r('#526d6f',9,12,15,7);r('#354d54',11,12,11,5);r('#b6b9a4',5,22,23,3);r('#7b8175',5,12,4,10);r('#626e64',24,12,4,10);}
 else if(prop==='wheel'){r('#293c3b',13,1,6,30);q.strokeStyle='#af9170';q.lineWidth=3;q.beginPath();q.arc(16,16,11,0,Math.PI*2);q.stroke();for(let a=0;a<4;a++)line('#d1b38a',16,16,16+Math.cos(a*Math.PI/2)*11,16+Math.sin(a*Math.PI/2)*11);r('#b6a07d',14,14,4,4);}
 else{r('#342d28',4,6,25,24);r('#8c6748',5,7,22,20);r('#bb9669',5,7,22,2);r('#503d2e',8,9,2,18);r('#503d2e',22,9,2,18);line('#c7a272',7,10,24,24);line('#b49263',24,10,7,24);if(prop==='rack'){r('#27292c',7,7,19,20);for(let a=9;a<25;a+=6){r('#b9c2bb',a,8,2,13);r('#ae8357',a,20,2,7);}}}
 }
 if(t===TT.PAPER_BRIDGE&&branchLeafAt(x,y)){q.clearRect(0,0,32,32);for(const[a,d]of(h>.5?[[4,5],[14,17]]:[[13,4],[3,18]])){q.fillStyle='#758b53';q.beginPath();q.ellipse(a+6,d+5,8,5,-.5,0,Math.PI*2);q.fill();line('#b2b884',a,d+8,a+11,d+2);line('#344f40',a+3,d+4,a+7,d+5);}}
 if(ter.warningTiles?.[k(x,y)]){r('#4b3021',1,1,30,30);r('#d99044',2,2,28,2);r('#b2672c',2,28,28,2);for(const a of[3,26])r('#b77838',a,5,3,21);q.fillStyle='#edb467';q.beginPath();q.moveTo(16,6);q.lineTo(24,23);q.lineTo(8,23);q.closePath();q.fill();r('#49321e',15,11,2,7);r('#49321e',15,20,2,2);}
 let blend=null;
 if([TT.GRASS,TT.LIGHT_GRASS,TT.BAMBOO].includes(t)){
  const overlay=document.createElement('canvas');overlay.width=overlay.height=32;
  if(globalThis.__MANRU_TERRAIN_R41__?.surfaceBlend?.(0,0,x,y,overlay.getContext('2d')))blend=overlay;
 }else globalThis.__MANRU_TERRAIN_R41__?.surfaceBlend?.(0,0,x,y,q);
 entry={stamp,canvas:c,blend};BRANCH_TILE_CACHE.set(key,entry);if(indoor&&BRANCH_TILE_CACHE.size>4096)BRANCH_TILE_CACHE.delete(BRANCH_TILE_CACHE.keys().next().value);}
 if(indoor&&t===TT.PAPER_BRIDGE&&branchLeafAt(x,y))drawSpecialTerrain(TT.WATER,px,py,x,y,FX.frameNow||performance.now());
 X.drawImage(c,px,py,32,32);
 if(indoor||state.branchTerrain105.mountainVersion105){
  if([TT.GRASS,TT.LIGHT_GRASS,TT.BAMBOO].includes(t))drawSpecialTerrain(t,px,py,x,y,FX.frameNow||performance.now());
  if(b.id==='black'&&[TT.GRASS,TT.LIGHT_GRASS,TT.BAMBOO].includes(t)){X.fillStyle='rgba(35,40,61,.22)';X.fillRect(px,py,32,32);}
  if(entry.blend)X.drawImage(entry.blend,px,py);
  if(actual!==t&&(indoor||!state.branchTerrain105.props[k(x,y)])){if(foreground)foreground.push({t:actual,px,py,x,y});else if(!drawSpecialTerrain(actual,px,py,x,y,FX.frameNow||performance.now()))drawInteractiveTerrain(actual,px,py,x,y,FX.frameNow||performance.now());}
 }
 if(actual===t&&BRANCH_INTERACTIVE_OVERLAYS105.has(t)){
  if(foreground)foreground.push({t,px,py,x,y});
  else if(!drawSpecialTerrain(t,px,py,x,y,FX.frameNow||performance.now()))drawInteractiveTerrain(t,px,py,x,y,FX.frameNow||performance.now());
 }
 const portal=state.branchPortals105.find(p=>p.x===x&&p.y===y);if(portal)drawBranchDoor(px,py,portal);return true;
}
// One regional material definition drives room shape, floor, masonry and furniture.
const BRANCH_DISTRICT_PALETTES=new Map();
function branchDistrictPalette(id,kind=0){
 const key=id+":"+kind;if(BRANCH_DISTRICT_PALETTES.has(key))return BRANCH_DISTRICT_PALETTES.get(key);
 const rows=id==='canal'?[
 ['청석 수로','#3f5157','#5b727a','#98aca9','#26383e','#70888b'],
 ['오래된 이끼각','#404f49','#627569','#a0ad8f','#293a34','#788b74'],
 ['검은 양수실','#353f47','#53616b','#93a0a4','#232d35','#677c83'],
 ['목재 정비소','#4d5147','#687468','#a9ad91','#303b32','#818873']
 ]:[
 ['황토 곡물고','#5b4c39','#8b7859','#c2ad82','#3e3428','#9a8866'],
 ['목조 적치실','#614a34','#7e6448','#bca078','#382c21','#99805b'],
 ['그을린 조리실','#433e36','#726755','#aca087','#2c2924','#8a7d66'],
 ['찬 돌 저장실','#484f48','#737d6f','#b1b69a','#303b34','#8b9783']
 ];const [name,floor,wall,light,dark,cap]=rows[kind%4];const palette=Object.freeze({name,floor,wall,light,dark,cap,wood:id==='granary'&&kind===1,soot:id==='granary'&&kind===2,brick:id==='granary'&&kind===0});BRANCH_DISTRICT_PALETTES.set(key,palette);return palette;
}
function drawMountainActor(q,m,frame){
 if(m.branchBoss105){
  const {r}=drawKit(q);
  r('#192c39',3,28,26,4);r('#374c60',8,13,17,17);r('#9eb8c7',10,12,13,15);r('#d5e4df',13,5,8,9);r('#6b8199',11,4,11,3);r('#d8edf0',10,1,2,6);r('#b0d6e3',16,0,2,6);r('#e0eef0',22,2,2,6);
  r('#202b42',14,8,2,2);r('#446886',19,8,2,2);r('#8caac0',6,15,5,10);r('#bcd6dc',23,14,5,10);r('#e3f0ed',26,11+(frame%2),2,11);
  for(let i=0;i<4;i++){r(i%2?'#a9c8d7':'#60778e',8+i*4,24,3,7-i%2);r('#d4e8e9',9+i*4,29,1,2)}
  q.strokeStyle='#7697ac';q.lineWidth=1;q.beginPath();q.moveTo(14,14);q.lineTo(21,26);q.moveTo(21,14);q.lineTo(12,25);q.stroke();r('#bfccba',16,19,4,2);return;
 }

 if(m.beeSwarm105){for(let i=0;i<5;i++){const x=5+(i*11)%23,y=8+(i*7)%19+(frame%2?i%2:-i%2);q.fillStyle='#b8d5ce';q.fillRect(x-2,y-3,3,3);q.fillRect(x+3,y-2,3,2);q.fillStyle='#272b28';q.fillRect(x-1,y,7,4);q.fillStyle='#d1a852';q.fillRect(x,y,2,3);q.fillRect(x+4,y,1,3);q.fillStyle='#efdb99';q.fillRect(x,y,2,1)}return;}
 if(m.hiveTree105){q.fillStyle='#263229';q.fillRect(5,27,24,4);q.strokeStyle='#3e332b';q.lineWidth=5;q.beginPath();q.moveTo(11,31);q.lineTo(16,21);q.lineTo(14,5);q.moveTo(15,17);q.lineTo(5,11);q.lineTo(1,4);q.moveTo(15,12);q.lineTo(25,8);q.lineTo(30,2);q.stroke();q.strokeStyle='#a48c66';q.lineWidth=2;q.stroke();q.fillStyle='#66533c';q.fillRect(19,10,8,13);q.fillStyle='#c1a05d';q.fillRect(18,12,10,8);q.fillStyle='#e0bd72';q.fillRect(20,10,5,2);for(let y=13;y<21;y+=3){q.fillStyle='#806537';q.fillRect(19,y,8,1);q.fillStyle='#332d24';q.fillRect(y%2?23:21,y+1,2,2)}q.fillStyle='#65734b';q.fillRect(3,3,5,2);q.fillRect(24,4,4,2);return;}
 if(m.mimicDormant105!==false){q.fillStyle='rgba(0,0,0,.35)';q.fillRect(4,23,25,7);drawMountainTree(q,m.x,m.y,true,state?.branchContext105?.id||'stockade',branchHeight(m.x,m.y));return;}drawMountainTree(q,17,23,true,'black',2);q.fillStyle='#ebc67e';q.fillRect(12,14,2,2);q.fillRect(18,14,2,2);q.strokeStyle='#ac9673';q.lineWidth=2;for(const sign of[-1,1]){q.beginPath();q.moveTo(16,23);q.lineTo(16+sign*9,27-frame);q.lineTo(16+sign*13,30);q.stroke()}
}
function drawMountainTree(q,x,y,dead=false,id='stockade',height=0){
 const h=hash2(x,y,97),flip=h>.5?1:-1;q.save();q.translate(16,0);q.scale(flip,1);q.fillStyle='#202c25';q.fillRect(-10,27,23,4);
 q.strokeStyle='#3b302a';q.lineWidth=6;q.beginPath();q.moveTo(-5,32);q.lineTo(0,20);q.lineTo(-2,7);q.stroke();q.strokeStyle=dead?(id==='black'?'#95949b':'#a09278'):(id==='black'?'#696774':'#87765a');q.lineWidth=2;q.beginPath();q.moveTo(-3,31);q.lineTo(1,20);q.lineTo(-1,4);q.moveTo(0,20);q.lineTo(10,12);q.lineTo(9,5);q.moveTo(0,15);q.lineTo(-9,10);q.lineTo(-12,3);q.stroke();
 if(dead){q.strokeStyle='#62584c';q.lineWidth=2;q.beginPath();q.moveTo(7,14);q.lineTo(14,13);q.moveTo(-8,10);q.lineTo(-13,12);q.stroke();q.fillStyle='#ada28b';q.fillRect(-1,23,2,5)}else{
 const colors=id==='black'?['#1d3430','#344c3e','#69735a']:height>1?['#354735','#52664a','#909b69']:['#163b2c','#315b3c','#6e8b56'];
 const variant=Math.floor(h*3),shift=Math.round((hash2(x+31,y+9)-.5)*4);
 q.save();q.translate(shift,0);q.scale(1,.8);
 if(variant===0){for(let i=0;i<3;i++){const yy=1+i*6,w=7+i*3;q.fillStyle=colors[0];q.beginPath();q.moveTo(0,yy);q.lineTo(w,yy+13);q.lineTo(w-3,yy+15);q.lineTo(-w,yy+14);q.closePath();q.fill();q.fillStyle=colors[1];q.beginPath();q.moveTo(0,yy+1);q.lineTo(w-3,yy+11);q.lineTo(-w+2,yy+11);q.closePath();q.fill();q.fillStyle=colors[2];q.fillRect(-w+4,yy+9,5,1)}}else{
 const lobes=variant===1?[[-10,7,19,14],[-5,2,14,18],[-13,11,25,11]]:[[-11,3,12,19],[-2,7,15,17],[-14,14,14,10]];
 for(const[a,b,w,hh]of lobes){q.fillStyle=colors[0];q.fillRect(a,b+3,w,hh-4);q.fillRect(a+3,b,w-6,hh);q.fillStyle=colors[1];q.fillRect(a+2,b+3,w-4,hh-7);q.fillRect(a+4,b+1,w-8,3);q.fillStyle=colors[2];q.fillRect(a+4,b+2,4,1);q.fillRect(a+2,b+5,2,2)}
 }
 q.restore();
 }q.strokeStyle=dead?'#b8a17a':'#b58d59';q.lineWidth=1.2;q.beginPath();q.moveTo(-3,31);q.lineTo(0,24);q.stroke();q.restore();
}
function drawMountainCliff(q,x,y,height,id){
 // Original elevation-era south face, contained in one 32px collision tile.
 const {r}=drawKit(q);
 r(id==='black'?'#11151e':'#14202a',0,0,32,32);
 r('#3c4948',0,0,32,12);r('#62716a',0,0,32,3);r('#293d40',0,12,32,8);r('#172d35',3,20,26,5);
 q.strokeStyle='#1b2e32';q.lineWidth=1;for(let a=3;a<32;a+=9){q.beginPath();q.moveTo(a,4);q.lineTo(a+2,21);q.stroke()}
 // A bent ledge joins through a tapering rock flank, never a full-height green ruler.
 const t=state.branchTerrain105;
 for(const side of[-1,1])if(t.surfaces[k(x+side,y+1)]==='cliff'){
  q.fillStyle='#3c4948';q.beginPath();const xx=side<0?0:32;q.moveTo(xx,0);q.lineTo(xx-side*4,3);q.lineTo(xx-side*6,10);q.lineTo(xx-side*3,18);q.lineTo(xx-side*2,27);q.lineTo(xx,32);q.closePath();q.fill();
 }
}
function drawMountainVoidSides(q,x,y){
 const t=state.branchTerrain105;
 for(const side of[-1,1]){
  const nx=x+side,tile=state.map[y]?.[nx];if(tile==null||tile===TT.VOID)continue;
  const cliff=t.surfaces[k(nx,y)]==='cliff',below=state.map[y+1]?.[nx],continues=!cliff&&below!=null&&below!==TT.VOID;
  const end=cliff?24:continues?32:25,base=side<0?0:32,sign=-side;
  const widths=[3,5,3,6,4].map((v,i)=>v+Math.floor(hash2(nx+i,y,309)*2));
  q.fillStyle='#293d3c';q.beginPath();q.moveTo(base,0);
  for(let i=0;i<5;i++)q.lineTo(base+sign*(widths[i]+2),Math.min(end,i*7));
  q.lineTo(base+sign*(continues?4:1),end);q.lineTo(base,end);q.closePath();q.fill();
  q.strokeStyle='#596a60';q.lineWidth=1;q.beginPath();q.moveTo(base+sign*2,0);
  for(let i=1;i<4;i++)q.lineTo(base+sign*Math.max(1,widths[i]-2),Math.min(end-2,i*7));q.stroke();
 }
}
// The mine uses the same 32px terrain scale and shared item/door renderers as the main game.
let MINE_FX=[],MINE_RENDER_STATE=null;
const MINE_CANVAS=new Map();
function drawMineStone(q){
 const {poly}=drawKit(q);
 poly('#272c2c',[[8,32],[12,22],[23,15],[35,19],[41,32],[32,38],[15,37]]);
 poly('#69706c',[[10,30],[15,21],[24,17],[34,22],[30,31],[16,34]]);
 poly('#90958a',[[15,21],[24,17],[30,20],[22,24],[12,29]]);
 poly('#444d4b',[[30,21],[35,22],[38,31],[31,35],[25,31]]);
 q.strokeStyle='#acaa92';q.lineWidth=1;q.beginPath();q.moveTo(18,22);q.lineTo(23,24);q.lineTo(21,29);q.stroke();q.fillStyle='#b6ab80';q.fillRect(23,24,2,1);q.fillRect(20,29,2,1);
}
function drawMineCart(q,px,py,angle=0,scale=1){
 if(state?.branchContext105?.id==='citadel'){q.save();q.translate(px+16,py+17);q.rotate(angle);q.scale(scale*.8,scale*.8);q.translate(-24,-25);drawMineStone(q);q.restore();return;}
 q.save();q.translate(px+16,py+17);q.rotate(angle);q.scale(scale*2/3,scale*2/3);q.translate(-24,-25);
 const {poly}=drawKit(q),line=(c,x,y,xx,yy,w=1)=>{q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(x,y);q.lineTo(xx,yy);q.stroke();};
 q.fillStyle='rgba(0,0,0,.5)';q.beginPath();q.ellipse(24,37,20,5,0,0,Math.PI*2);q.fill();
 for(const[x,y]of[[10,34],[36,32]]){q.fillStyle='#282622';q.beginPath();q.arc(x,y,7,0,Math.PI*2);q.fill();q.strokeStyle='#8f7858';q.lineWidth=2;q.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;line('#b69b6d',x,y,x+Math.cos(a)*5,y+Math.sin(a)*5);}q.fillStyle='#c1b69b';q.fillRect(x-1,y-1,3,3);}
 poly('#3c3027',[[4,20],[29,15],[44,20],[39,34],[12,38]]);poly('#68503a',[[5,21],[29,17],[42,21],[37,31],[12,35]]);
 poly('#9a7950',[[5,20],[29,15],[44,20],[42,23],[28,18],[7,24]]);
 for(const y of[25,30])line('#bc9663',9,y+3,38,y-2);for(const[x,y]of[[11,23],[26,20],[39,22]])line('#372e25',x,y,x+1,y+12,2);
 for(const[p,c,h]of[[[[9,20],[13,11],[21,9],[26,17],[20,23]],'#6b7068','#a4a393'],[[[23,16],[26,5],[34,4],[41,14],[37,22]],'#58635e','#8f9b90'],[[[16,22],[23,15],[32,18],[33,24],[22,27]],'#7c7b68','#b6ad8d']]){poly(c,p);line(h,p[1][0],p[1][1],p[2][0],p[2][1]);}
 line('#c4b080',7,24,38,21);line('#786547',12,27,35,24);line('#5e4733',9,34,3,43,3);line('#ad8955',8,34,2,42);q.restore();
}
// Region-seeded sparse details: most tiles remain quiet; one crack can span several tiles.
function drawMineGeology(q,x,y,wall,zone,ore=false){
 q.save();q.beginPath();q.rect(0,0,32,32);q.clip();
 for(let gy=Math.floor(y/4)-1;gy<=Math.floor(y/4)+1;gy++)for(let gx=Math.floor(x/4)-1;gx<=Math.floor(x/4)+1;gx++){
  const h=hash2(gx,gy,wall?903:917);if(h<(wall?(ore?.36:.72):.65))continue;
  const ox=(gx*4+hash2(gx,gy,920)*3)*32-x*32,oy=(gy*4+hash2(gx,gy,921)*3)*32-y*32;
  if(wall){q.strokeStyle=zone===1?'rgba(17,23,21,.68)':'rgba(12,23,23,.65)';q.lineWidth=1;let px=ox,py=oy;
   q.beginPath();q.moveTo(px,py);for(let j=0;j<3+Math.floor(h*5);j++){px+=(hash2(gx+j,gy,925)-.45)*23;py+=5+hash2(gx,gy+j,926)*9;q.lineTo(px,py);}q.stroke();
   if(ore&&h>.73){q.strokeStyle='rgba(157,141,91,.42)';q.lineWidth=.7;q.stroke();}
  }else{const count=3+Math.floor(h*8);for(let i=0;i<count;i++){const a=hash2(gx+i,gy,929)*6.28,r=hash2(gx,gy+i,930)*27,xx=ox+Math.cos(a)*r,yy=oy+Math.sin(a)*r*.55,v=hash2(gx+i,gy+i,931);q.fillStyle=v>.7?'#717364':v>.35?'#525d50':'#303d36';q.beginPath();q.moveTo(xx,yy);q.lineTo(xx+1+v*3,yy-1);q.lineTo(xx+2+v*2,yy+1);q.lineTo(xx,yy+2);q.fill();}}
 }
 q.restore();
}
function drawCitadelMotif(q,a,x,y){
 // Chamber ornament is baked into the existing terrain material cache.
 if(a.kind==='chamber'){
  const P=a.palette,theme=a.theme105,left=(a.x-x)*32,top=(a.y-y)*32,w=a.w*32,h=a.h*32,cx=left+w/2,cy=top+h/2;
  q.save();q.beginPath();q.rect(0,0,32,32);q.clip();
  const frame=(inset,color,width)=>{q.strokeStyle=color;q.lineWidth=width;q.strokeRect(left+inset,top+inset,w-inset*2,h-inset*2);};
  const ornate=['chapel','ritual','command','treasury','stair'].includes(theme);frame(5,P.joint+'80',5);if(ornate){frame(3,P.light+'50',.6);frame(10,P.rim+'65',.8);}
  // Jointed inlay segments follow the room perimeter, not each terrain cell.
  q.strokeStyle=P.rim+'55';q.lineWidth=.7;
  if(ornate)for(let i=48;i<w-20;i+=48){for(const yy of[top+6,top+h-10]){q.strokeRect(left+i,yy,10,4);}}
  if(ornate)for(let i=48;i<h-20;i+=48){for(const xx of[left+6,left+w-10]){q.strokeRect(xx,top+i,4,10);}}
  if(ornate)for(const[xx,yy]of[[left+10,top+10],[left+w-10,top+10],[left+10,top+h-10],[left+w-10,top+h-10]]){
   q.fillStyle=P.joint;q.fillRect(xx-7,yy-7,14,14);q.strokeStyle=P.rim;q.lineWidth=1;q.strokeRect(xx-5,yy-5,10,10);q.fillStyle=P.light;q.fillRect(xx-1,yy-1,2,2);
  }
  const ceremonial=['chapel','ritual','tomb','ossuary','stair','command','treasury'].includes(theme),textile=['command','treasury'].includes(theme);
  if(ceremonial&&Math.min(w,h)>=96){
   const rw=Math.min(w-48,theme==='stair'?86:w*.68),rh=Math.min(h-48,theme==='stair'?86:h*.72),rad=Math.min(rw,rh)*.36;
   q.fillStyle=textile?(a.relicTheme105?P.accent:'#361e2a'):P.accent+'75';q.fillRect(cx-rw/2,cy-rh/2,rw,rh);
   q.strokeStyle=P.rim+'a0';q.lineWidth=1.5;q.strokeRect(cx-rw/2+3,cy-rh/2+3,rw-6,rh-6);q.strokeStyle=P.light+'50';q.lineWidth=.6;q.strokeRect(cx-rw/2+7,cy-rh/2+7,rw-14,rh-14);
   q.save();q.translate(cx,cy);
   if(['chapel','ritual'].includes(theme)){
    // Lotus stone inlay is confined to the ceremonial rooms.
    for(let i=0;i<8;i++){q.save();q.rotate(i*Math.PI/4);q.beginPath();q.moveTo(0,-rad);q.bezierCurveTo(rad*.48,-rad*.65,rad*.38,-rad*.2,0,0);q.bezierCurveTo(-rad*.38,-rad*.2,-rad*.48,-rad*.65,0,-rad);q.fillStyle=i%2?P.light+'1c':P.rim+'24';q.fill();q.strokeStyle=P.rim+'65';q.lineWidth=1;q.stroke();q.restore();}
    q.strokeStyle=P.light+'90';q.lineWidth=.8;q.beginPath();q.arc(0,0,rad*.24,0,Math.PI*2);q.stroke();
   }else if(theme==='command'||theme==='treasury'){
    for(const scale of[1,.45]){q.beginPath();q.moveTo(0,-rad*scale);q.lineTo(rad*scale,0);q.lineTo(0,rad*scale);q.lineTo(-rad*scale,0);q.closePath();q.fillStyle=scale===.67?P.joint+'c0':P.rim+'40';q.fill();q.strokeStyle=P.rim+'b0';q.lineWidth=1.2;q.stroke();}
   }else if(theme==='tomb'){
    for(let yy=-rh/2+16;yy<rh/2-12;yy+=24){q.fillStyle=P.joint+'65';q.fillRect(-rw/2+13,yy,rw-26,17);q.strokeStyle=P.light+'75';q.lineWidth=.8;q.strokeRect(-rw/2+13,yy,rw-26,17);q.strokeStyle=P.rim+'60';q.strokeRect(-rw/2+17,yy+4,rw-34,9);}
   }else if(theme==='ossuary'){
    for(const xx of[-rad*.48,rad*.48])for(const yy of[-rad*.48,rad*.48]){q.fillStyle=P.light+'20';q.fillRect(xx-rad*.3,yy-rad*.3,rad*.6,rad*.6);q.strokeStyle=P.rim+'a0';q.lineWidth=1;q.strokeRect(xx-rad*.3,yy-rad*.3,rad*.6,rad*.6);q.strokeStyle=P.light+'50';q.strokeRect(xx-rad*.2,yy-rad*.2,rad*.4,rad*.4);}
   }else{
    // Stair halls use a compact coffer, leaving the stairs as the focal point.
    for(const d of[rad,rad*.65]){q.strokeStyle=P.rim+'70';q.lineWidth=1;q.strokeRect(-d,-d,d*2,d*2);}for(const xx of[-rad,rad])for(const yy of[-rad,rad]){q.fillStyle=P.rim+'a0';q.fillRect(xx-2,yy-2,4,4);}
   }
   q.restore();

  }
  if(['archive','study','mess','barracks','infirmary','store','kitchen'].includes(theme)){
   // Furniture groups sit on broad inset stone panels, leaving a continuous central aisle.
   for(const xx of[left+24,left+w-47]){q.fillStyle=P.joint+'30';q.fillRect(xx,top+24,23,h-48);q.strokeStyle=P.light+'45';q.lineWidth=.7;q.strokeRect(xx,top+24,23,h-48);}
  }
  q.restore();return;
 }
 // Old saved seal/sanctum records intentionally produce no artwork.
 if(!['compass','sunburst'].includes(a.kind))return;
 const cx=(a.x-x)*32+16,cy=(a.y-y)*32+16,rx=a.rx*32-6,ry=a.ry*32-6;
 q.save();q.beginPath();q.rect(0,0,32,32);q.clip();q.translate(cx,cy);q.scale(1,ry/rx);
 q.strokeStyle='#c4ad7866';q.lineWidth=2;q.beginPath();q.arc(0,0,rx,0,Math.PI*2);q.arc(0,0,rx-8,0,Math.PI*2);q.stroke();
 for(let i=0;i<8;i++){q.save();q.rotate(i*Math.PI/4);q.fillStyle=i%2?'#b59c6844':'#dec68c66';q.beginPath();q.moveTo(0,-rx+15);q.lineTo(8,0);q.lineTo(0,rx*.25);q.lineTo(-8,0);q.closePath();q.fill();q.restore();}q.fillStyle='#151b2444';q.beginPath();q.arc(0,0,rx*.22,0,Math.PI*2);q.fill();q.restore();
}
function drawCitadelRelic(q,a,x,y,wall=false){
 const site=CITADEL_RELIC_SITES.find(s=>s.id===a.id);if(!site)return;
 const P=site.palette,strength=clamp(a.strength,0,1),sx=x*32,sy=y*32,span=64;
 q.save();q.beginPath();q.rect(0,0,32,32);q.clip();
 // Seeded world-space deposits cross tile seams. No gameplay randomness or mutable art state.
 for(let gy=Math.floor(sy/span)-1;gy<=Math.floor((sy+31)/span)+1;gy++)for(let gx=Math.floor(sx/span)-1;gx<=Math.floor((sx+31)/span)+1;gx++){
  const h=hash2(gx,gy,347),cx=gx*span+hash2(gx,gy,348)*span-sx,cy=gy*span+hash2(gx,gy,349)*span-sy,r=24+hash2(gx,gy,350)*33;
  if(cx+r<0||cx-r>32||cy+r<0||cy-r>32||h>.28+strength*.72)continue;
  q.save();q.translate(cx,cy);
  const g=q.createRadialGradient(-r*.15,-r*.18,1,0,0,r);g.addColorStop(0,P.accent+'bc');g.addColorStop(.48,P.accent+'75');g.addColorStop(1,P.accent+'00');q.globalAlpha=(wall?.35:.45)+strength*.32;q.fillStyle=g;q.beginPath();q.arc(0,0,r,0,Math.PI*2);q.fill();
  // Irregular lobes, layered weathering and clustered grains keep the stone visible beneath the stain.
  const lobes=9,edge=[];for(let i=0;i<lobes;i++){const t=i/lobes*Math.PI*2,rr=r*(.42+hash2(gx*31+i,gy,351)*.44);edge.push([Math.cos(t)*rr,Math.sin(t)*rr*.82]);}
  q.globalAlpha=(wall?.18:.23)+strength*.22;q.fillStyle=P.accent;q.beginPath();q.moveTo((edge.at(-1)[0]+edge[0][0])/2,(edge.at(-1)[1]+edge[0][1])/2);for(let i=0;i<lobes;i++){const p=edge[i],n=edge[(i+1)%lobes];q.quadraticCurveTo(p[0],p[1],(p[0]+n[0])/2,(p[1]+n[1])/2);}q.closePath();q.fill();
  for(let i=0;i<26;i++){
   const angle=hash2(gx*43+i,gy,352)*Math.PI*2,dist=Math.sqrt(hash2(gx,gy*43+i,353))*r*.85,xx=Math.cos(angle)*dist,yy=Math.sin(angle)*dist*.82,size=.45+hash2(gx+i,gy,354)*2.4;
   q.globalAlpha=(.14+strength*.32)*(1-dist/r);q.fillStyle=i%4===0?P.light:i%3===0?P.rim:P.joint;
   q.beginPath();q.moveTo(xx-size,yy);q.lineTo(xx-size*.25,yy-size*.65);q.lineTo(xx+size,yy-size*.1);q.lineTo(xx+size*.6,yy+size*.65);q.lineTo(xx-size*.5,yy+size*.9);q.closePath();q.fill();
  }
  if(a.id==='curse_spear'){
   // Damp violet bloom, cloudy tendrils and translucent mineral rims, rather than ruled cracks.
   for(let i=0;i<3;i++){const xx=(hash2(gx+i,gy,355)-.5)*r,yy=(hash2(gx,gy+i,356)-.5)*r;q.globalAlpha=.16+strength*.17;const f=q.createRadialGradient(xx,yy,0,xx,yy,7+i*3);f.addColorStop(0,'#bea4d573');f.addColorStop(1,'#67458000');q.fillStyle=f;q.beginPath();q.ellipse(xx,yy,10+i*3,5+i,hash2(gx,gy+i,357)*3,0,Math.PI*2);q.fill();}
   q.strokeStyle='#ac83c966';q.globalAlpha=.25+strength*.25;q.lineWidth=.65;q.beginPath();q.moveTo(-r*.65,r*.12);q.bezierCurveTo(-r*.42,-r*.35,r*.06,r*.37,r*.5,-r*.23);q.stroke();
  }else if(a.id==='chain_sickle'){
   // Oxidized iron flakes have dark pits, curled copper edges and irregular exposed metal.
   for(let i=0;i<5;i++){const xx=(hash2(gx*7+i,gy,358)-.5)*r*1.5,yy=(hash2(gx,gy*7+i,359)-.5)*r,s=2+hash2(gx+i,gy,360)*4;q.globalAlpha=.25+strength*.4;q.fillStyle='#291a17';q.beginPath();q.moveTo(xx-s,yy);q.lineTo(xx-s*.4,yy-s);q.lineTo(xx+s,yy-s*.3);q.lineTo(xx+s*.6,yy+s*.55);q.lineTo(xx-s*.7,yy+s);q.closePath();q.fill();q.strokeStyle=i%2?'#bc6b37':'#d39250';q.lineWidth=.7;q.beginPath();q.moveTo(xx-s*.9,yy);q.quadraticCurveTo(xx-s*.4,yy-s*.8,xx+s*.8,yy-s*.25);q.stroke();}
  }else{
   // Broken blue masonry plates: irregular bevels and restrained gold between displaced fragments.
   for(let i=0;i<3;i++){const xx=(hash2(gx+i,gy,362)-.5)*r,yy=(hash2(gx,gy+i,363)-.5)*r,size=5+hash2(gx+i,gy,364)*8;q.globalAlpha=.25+strength*.3;q.fillStyle=i%2?'#36768d':'#2d506b';q.beginPath();q.moveTo(xx-size,yy-size*.4);q.lineTo(xx-size*.3,yy-size);q.lineTo(xx+size*.8,yy-size*.6);q.lineTo(xx+size,yy+size*.4);q.lineTo(xx+size*.1,yy+size);q.lineTo(xx-size*.7,yy+size*.5);q.closePath();q.fill();q.strokeStyle='#14283bbb';q.lineWidth=1.5;q.stroke();q.strokeStyle='#d2b66c';q.lineWidth=.65;q.beginPath();q.moveTo(xx-size*.9,yy-size*.4);q.lineTo(xx-size*.25,yy-size*.9);q.lineTo(xx+size*.75,yy-size*.55);q.stroke();}
  }
  q.restore();
 }
 // Ground relic fragments and wall reliefs use distinct silhouettes, shadows and material highlights.
 const h=hash2(x,y,365);if(h<.018+strength*.19){
  q.save();q.translate(9+hash2(x,y,366)*14,wall?22:9+hash2(x,y,367)*14);q.rotate((hash2(x,y,368)-.5)*(wall?.35:2.8));q.globalAlpha=.65+strength*.35;
  q.fillStyle='#04091465';q.beginPath();q.ellipse(1,3,11,5,0,0,Math.PI*2);q.fill();
  if(a.id==='curse_spear'){
   if(h<(.018+strength*.19)*.55){
    q.fillStyle='#ad9c96';q.strokeStyle='#e1d5bb';q.lineWidth=.7;q.beginPath();q.moveTo(-8,-1);q.bezierCurveTo(-5,-3,-2,-1,2,-2);q.lineTo(6,-3);q.quadraticCurveTo(9,-5,10,-2);q.quadraticCurveTo(12,0,9,1);q.lineTo(5,0);q.bezierCurveTo(1,1,-4,0,-7,2);q.quadraticCurveTo(-11,4,-11,1);q.quadraticCurveTo(-12,-3,-8,-1);q.closePath();q.fill();q.stroke();q.fillStyle='#554153';q.beginPath();q.ellipse(-9,0,1.2,.8,0,0,Math.PI*2);q.fill();
    q.fillStyle='#c5b7a4';q.beginPath();q.moveTo(2,4);q.lineTo(7,3);q.lineTo(9,6);q.lineTo(5,7);q.closePath();q.fill();
   }else{
    const paper=q.createLinearGradient(-5,-9,5,8);paper.addColorStop(0,'#dfcfb6');paper.addColorStop(1,'#978478');q.fillStyle=paper;q.beginPath();q.moveTo(-5,-9);q.lineTo(5,-8);q.lineTo(4,3);q.lineTo(5,7);q.lineTo(2,6);q.lineTo(0,9);q.lineTo(-2,6);q.lineTo(-5,8);q.closePath();q.fill();q.strokeStyle='#573056';q.lineWidth=.85;q.beginPath();q.moveTo(-2,-5);q.lineTo(2,-5);q.moveTo(0,-7);q.lineTo(-1,-1);q.lineTo(2,1);q.lineTo(-2,3);q.moveTo(-3,-1);q.lineTo(2,-2);q.stroke();q.fillStyle='#3e273a';q.beginPath();q.arc(3,5,2,0,Math.PI*2);q.fill();
   }
  }else if(a.id==='chain_sickle'){
   drawOxidizedChain(q);
   if(strength>.6){q.fillStyle='#8e9997';q.beginPath();q.moveTo(5,-5);q.bezierCurveTo(2,-14,15,-14,14,-4);q.bezierCurveTo(12,-10,7,-10,7,-5);q.closePath();q.fill();q.strokeStyle='#ded5b2';q.lineWidth=.65;q.stroke();q.fillStyle='#624332';q.fillRect(5,-5,2,6);}
  }else{
   const shield=q.createLinearGradient(-7,-8,7,8);shield.addColorStop(0,'#708998');shield.addColorStop(.5,'#304961');shield.addColorStop(1,'#142837');q.fillStyle=shield;q.beginPath();q.moveTo(-7,-8);q.lineTo(5,-8);q.lineTo(7,-3);q.lineTo(4,0);q.lineTo(5,4);q.lineTo(0,9);q.lineTo(-6,3);q.closePath();q.fill();q.strokeStyle='#c2a866';q.lineWidth=1;q.stroke();q.fillStyle='#bbae88';q.beginPath();q.moveTo(0,-6);q.lineTo(2,-1);q.lineTo(0,5);q.lineTo(-2,-1);q.closePath();q.fill();q.strokeStyle='#172532';q.lineWidth=1.3;q.beginPath();q.moveTo(6,-3);q.lineTo(1,-2);q.lineTo(-1,2);q.stroke();
   for(const[xx,yy]of[[-10,4],[9,-5]]){q.fillStyle='#415d71';q.beginPath();q.moveTo(xx-2,yy);q.lineTo(xx+2,yy-2);q.lineTo(xx+3,yy+2);q.lineTo(xx,yy+4);q.closePath();q.fill();q.strokeStyle='#b4a36f';q.lineWidth=.6;q.stroke();}
  }
  q.restore();
 }
 q.restore();
}
function drawCitadelSearch(q,strength,x,y,wall=false){
 q.save();q.beginPath();q.rect(0,0,32,32);q.clip();
 const h=hash2(x,y,7109),cx=5+hash2(x,y,7110)*22,cy=4+hash2(x,y,7111)*24;
 q.globalAlpha=.3+strength*.65;
 const stain=q.createRadialGradient(cx,cy,1,cx,cy,10+strength*12);stain.addColorStop(0,'#111019a0');stain.addColorStop(.55,'#21182150');stain.addColorStop(1,'#13131c00');q.fillStyle=stain;q.fillRect(0,0,32,32);
 if(h<strength){
  const points=[[cx-8,cy-13],[cx-3,cy-7],[cx-5,cy-2],[cx+2,cy+2],[cx,cy+8],[cx+5,cy+15]];
  for(const[color,width,offset]of[['#81756a90',2.3,.6],['#0c0c14',1.4,0]]){q.strokeStyle=color;q.lineWidth=width;q.beginPath();points.forEach(([a,b],i)=>i?q.lineTo(a+offset,b+offset):q.moveTo(a+offset,b+offset));q.stroke();}
  q.fillStyle='#19151c';for(let i=0;i<5;i++){const a=cx-5+hash2(x+i,y,7113)*13,b=cy-7+hash2(x,y+i,7114)*16;q.beginPath();q.moveTo(a,b);q.lineTo(a+2,b-1);q.lineTo(a+3,b+2);q.lineTo(a,b+3);q.fill();}
 }
 if(wall&&strength>.35&&h<strength*.55){q.translate(16,21);q.fillStyle='#0d101a';q.strokeStyle='#6a4e50';q.lineWidth=.7;q.beginPath();q.moveTo(-7,7);q.lineTo(-7,-3);q.lineTo(-4,-3);q.lineTo(-4,-8);q.lineTo(0,-4);q.lineTo(4,-8);q.lineTo(4,-3);q.lineTo(7,-3);q.lineTo(7,7);q.closePath();q.fill();q.stroke();q.fillStyle='#a85548';q.fillRect(-1,-2,2,5);}
 q.restore();
}
function drawCitadelCell(t,px,py,x,y,foreground=null){
 if(BRANCH_RENDER_MAP!==state.map){BRANCH_RENDER_MAP=state.map;BRANCH_TILE_CACHE.clear();}
 const ter=state.branchTerrain105,data=ter.citadel105,m=ter.mine105,s=ter.surfaces[k(x,y)]||'',at=(dx,dy)=>state.map[y+dy]?.[x+dx],key=y*COLS+x;
 // The empty abyss shares a direct fill; no per-cell canvas or visual star grid.
 if(t===TT.VOID&&DIRS8.every(([dx,dy])=>at(dx,dy)==null||at(dx,dy)===TT.VOID)){X.fillStyle='#080d14';X.fillRect(px,py,32,32);return true;}
 const grate=m.walls.some(w=>w.cells.some(c=>c.x===x&&c.y===y)),motifs=data?.motifCells?.[k(x,y)]||[],relic=data?.relicCells105?.[k(x,y)],search=data?.searchCells105?.[k(x,y)]||0,stamp=[t,s,grate,relic?.id,relic?.strength,search,data?.zoneCells105?.[k(x,y)],...DIRS4.map(([dx,dy])=>at(dx,dy)),...DIRS4.map(([dx,dy])=>ter.surfaces[k(x+dx,y+dy)]),motifs.join(',')].join(':');let e=BRANCH_TILE_CACHE.get(key),c=e?.stamp===stamp?e.canvas:null;
 if(!c){c=document.createElement('canvas');c.width=c.height=48;const q=c.getContext('2d');q.scale(1.5,1.5);const {r}=drawKit(q),line=(color,a,b,xx,yy,w=1)=>{q.strokeStyle=color;q.lineWidth=w;q.beginPath();q.moveTo(a,b);q.lineTo(xx,yy);q.stroke();},h=hash2(x,y,716),wall=z=>z===TT.WALL||z===TT.WINDOW;
 const owner=data.cellOwner105[k(x,y)],tower=data.towers.find(t=>t.id===owner),room=data.rooms.find(a=>x>=a.x-Number(t===TT.WALL||t===TT.WINDOW)&&x<a.x+a.w+Number(t===TT.WALL||t===TT.WINDOW)&&y>=a.y-Number(t===TT.WALL||t===TT.WINDOW)&&y<a.y+a.h+Number(t===TT.WALL||t===TT.WINDOW)),basePalette=room?.palette105||data.zones105?.[data.zoneCells105?.[k(x,y)]]?.palette||tower?.palette105||(tower?CITADEL_DISTRICTS[CITADEL_TOWERS[tower.id].district105]:CITADEL_DISTRICTS.arsenal),P=relic?citadelRelicPalette(basePalette,CITADEL_RELIC_SITES.find(s=>s.id===relic.id),relic.strength):basePalette;
 const floor=()=>{
  const sy=y*32,sx=x*32,theme=room?.theme105,ritual=['chapel','ritual'].includes(theme)||s==='citadel-ritual',pale=s==='citadel-pale',warm=['mess','kitchen','store','barracks'].includes(theme),forge=['foundry','smithy','coalstore'].includes(theme),archive=['archive','study'].includes(theme),tomb=['tomb','ossuary'].includes(theme),formal=ritual||pale||s==='citadel-marble';
  const pal=[P.joint,P.stone,P.light];r(pal[0],0,0,32,32);
  const bw=32,bh=tomb?48:warm?24:32;
  for(let band=Math.floor(sy/bh)-1;band<=Math.floor((sy+31)/bh);band++){
   const oy=band*bh-sy,offset=(formal||forge||warm?0:band%2)*Math.floor(bw*.5);
   for(let block=Math.floor((sx-offset)/bw)-1;block<=Math.floor((sx+31-offset)/bw);block++){
    const ox=block*bw+offset-sx,v=hash2(block,band,818),checker=((block+band)%2+2)%2;
    const base=relic||room?.relicTheme105?P.stone:forge?'#3d4b51':pale?(checker?'#71847a':'#697d74'):ritual?(checker?colorShift(P.stone,7):colorShift(P.stone,1)):warm?(checker?colorShift(P.stone,5):colorShift(P.stone,-3)):pal[1],g=q.createLinearGradient(ox,oy,ox+bw,oy+bh),tone=Math.floor(v*6)-3;
    g.addColorStop(0,colorShift(base,tone+5));g.addColorStop(.4,colorShift(base,tone+1));g.addColorStop(1,colorShift(base,tone-4));q.fillStyle=g;
    const cut=formal?2:1;q.beginPath();q.moveTo(ox+cut,oy+1);q.lineTo(ox+bw-cut,oy+1);q.lineTo(ox+bw-1,oy+cut);q.lineTo(ox+bw-1,oy+bh-cut);q.lineTo(ox+bw-cut,oy+bh-1);q.lineTo(ox+cut,oy+bh-1);q.lineTo(ox+1,oy+bh-cut);q.lineTo(ox+1,oy+cut);q.closePath();q.fill();
    line(pal[2]+'55',ox+cut+1,oy+1.5,ox+bw-cut-1,oy+1.5,.7);line('#08121b70',ox+2,oy+bh-1,ox+bw-2,oy+bh-1,1);
    for(let i=0;i<16;i++){const ax=ox+3+hash2(block*29+i,band,920)*(bw-6),ay=oy+3+hash2(block,band*29+i,943)*(bh-6);line(i%3?'#ecdec819':'#08192324',ax,ay,ax+1+v*3,ay,.5);}
    if(formal){q.fillStyle=P.rim+'a0';q.beginPath();q.moveTo(ox,oy-3);q.lineTo(ox+3,oy);q.lineTo(ox,oy+3);q.lineTo(ox-3,oy);q.fill();}
    if(forge){for(const xx of[ox+4,ox+bw-5])for(const yy of[oy+4,oy+bh-5]){r('#162731',xx,yy,2,2);r('#929681',xx,yy,1,.7);}line('#16222b',ox+6,oy+7,ox+bw-7,oy+bh-7,.7);}
    if(archive||tomb){q.strokeStyle=pal[2]+'38';q.lineWidth=.7;q.strokeRect(ox+4,oy+4,bw-8,bh-8);}
    if(v<.14&&!forge){line('#0d1a235c',ox+bw*.7,oy+1,ox+bw*.56,oy+bh*.3,.7);line('#0d1a234c',ox+bw*.56,oy+bh*.3,ox+bw*.65,oy+bh*.5,.6);}
   }
  }
  if(room){const worn=Math.abs(x-room.cx)<=1||Math.abs(y-room.cy)<=1;if(worn){for(let i=0;i<5;i++){const ax=3+hash2(x*7+i,y,1573)*26,ay=3+hash2(x,y*7+i,1574)*26;line('#b6ad891b',ax,ay,ax+2.5,ay+.5,.7);}}if(['foundry','smithy','coalstore'].includes(room.theme105)&&y<=room.y+1){const g=q.createLinearGradient(0,0,0,32);g.addColorStop(0,'#18171050');g.addColorStop(1,'#18171000');q.fillStyle=g;q.fillRect(0,0,32,32);}}
  if(s==='citadel-slag'){r('#241f1d',7,0,18,32);r('#6a3e27',10,0,12,32);r('#d87932',13,0,5,32);r('#f6c16d',15,0,1,32);r('#9a9475',6,0,2,32);r('#9a9475',25,0,2,32);}
  if(s==='citadel-inlay'){for(const[dx,dy]of DIRS4){if(ter.surfaces[k(x+dx,y+dy)]===s)continue;if(dx){r('#15222c',dx<0?2:27,0,3,32);r('#9c876248',dx<0?3:28,0,1,32);}else{r('#15222c',0,dy<0?2:27,32,3);r('#9c876248',0,dy<0?3:28,32,1);}}}
  if(s==='citadel-carpet'){r(relic?P.accent:'#542f3d',0,0,32,32);for(let a=1;a<32;a+=2)line('#c38d701a',0,a,32,a,.5);for(const[dx,dy]of DIRS4){if(ter.surfaces[k(x+dx,y+dy)]==='citadel-carpet')continue;if(dx){r('#241f28',dx<0?0:26,0,6,32);r(P.rim,dx<0?2:29,0,1,32);}else{r('#241f28',0,dy<0?0:26,32,6);r(P.rim,0,dy<0?2:29,32,1);}}}
  if(room)drawCitadelMotif(q,{...room,kind:'chamber',palette:P},x,y);

  for(const i of motifs)drawCitadelMotif(q,data.motifs[i],x,y);
  for(const[dx,dy]of DIRS4)if(wall(at(dx,dy))){q.save();if(dx<0){q.translate(0,32);q.rotate(-Math.PI/2);}else if(dx>0){q.translate(32,0);q.rotate(Math.PI/2);}else if(dy>0){q.translate(32,32);q.rotate(Math.PI);}r(P.joint,0,0,32,4);r(P.light+'60',0,1,32,.6);r(P.accent+'50',0,2,32,.7);if(room&&['ritual','chapel','command','treasury'].includes(room.theme105))r(P.rim+'50',0,4,32,.6);const g=q.createLinearGradient(0,7,0,14);g.addColorStop(0,'#050c1738');g.addColorStop(1,'#050c1700');q.fillStyle=g;q.fillRect(0,7,32,7);q.restore();}

 };
 if(t===TT.VOID){r('#080d14',0,0,32,32);if(at(0,-1)!==TT.VOID&&at(0,-1)!=null){const g=q.createLinearGradient(0,0,0,31);g.addColorStop(0,'#27333b');g.addColorStop(.7,'#111d29');g.addColorStop(1,'#080d14');q.fillStyle=g;q.fillRect(0,0,32,32);line('#687477',0,.8,32,.8,.8);for(let row=0;row<3;row++){const yy=3+row*8,xx=((x+row)%2)*16;line('#090f1960',0,yy+7,32,yy+7,.6);line('#0a142380',xx,yy,xx,yy+7,.6);}if(x%4===0){r('#141e28',6,2,9,24);r('#38454a',6,2,2,18);r('#0c1520',14,3,3,25);}}if(at(-1,0)!==TT.VOID){r('#192530',0,0,4,32);r('#3b4b51',0,0,1,32);}if(at(1,0)!==TT.VOID){r('#14212c',28,0,4,32);r('#2d3e47',31,0,1,32);}}

 else if(grate){floor();drawPressureGrate(q,t===TT.WALL);}
 else if(t===TT.WALL||t===TT.WINDOW){
  const south=!wall(at(0,1)),north=!wall(at(0,-1)),west=!wall(at(-1,0)),east=!wall(at(1,0)),top=south?12:32;
  r(colorShift(P.wall,-12),0,0,32,32);q.save();q.beginPath();q.rect(0,0,32,top);q.clip();
  for(let row=Math.floor(y*32/48);row<=Math.floor((y*32+31)/48);row++){const yy=row*48-y*32,offset=(row%2)*47;for(let block=Math.floor((x*32-offset)/94)-1;block<=Math.floor((x*32+31-offset)/94);block++){const xx=block*94+offset-x*32,v=hash2(block,row,745),g=q.createLinearGradient(xx,yy,xx+90,yy+46);g.addColorStop(0,colorShift(P.wall,Math.floor(v*7)));g.addColorStop(1,colorShift(P.wall,-7));q.fillStyle=g;q.fillRect(xx+.7,yy+.7,92.6,46.6);line('#62717c24',xx+2,yy+1.5,xx+90,yy+1.5,.6);for(let i=0;i<14;i++)r(i%2?'#9aafaf0b':'#040e1b20',xx+3+hash2(block+i,row,746)*85,yy+3+hash2(block,row+i,747)*40,2,.5);if(v>.82){line('#111c2970',xx+72,yy+1,xx+65,yy+13,.7);line('#111c2960',xx+65,yy+13,xx+68,yy+20,.7);}}}
  q.restore();
  if(south){const g=q.createLinearGradient(0,12,0,32);g.addColorStop(0,colorShift(P.wall,30));g.addColorStop(.25,colorShift(P.wall,12));g.addColorStop(1,colorShift(P.wall,-6));q.fillStyle=g;q.fillRect(0,12,32,20);r('#89918b',0,10,32,1);r('#56656a',0,11,32,2);r('#16232f',0,14,32,2);for(let row=0;row<2;row++){const yy=16+row*8,offset=((x+row)%2)*17;for(let a=-34+offset;a<32;a+=34){line('#14222e',a,yy+7,a+34,yy+7,.8);line('#12202d',a,yy,a,yy+7,.8);line('#82908c25',a+2,yy,a+31,yy,.6);}}r('#0c1725',0,30,32,2);if(room&&['ritual','chapel','command','treasury'].includes(room.theme105)&&x%4===2){r('#17262d',4,18,23,9);r(P.light+'70',4,18,23,1);r(P.accent,6,20,19,5);line(P.rim+'70',7,22,24,22,.8);r('#101e27',4,26,23,1);}if(x%4===0){r('#101b26',5,13,10,19);r('#626f71',5,13,2,17);r('#3e505b',7,14,5,17);r('#243441',12,14,2,18);r('#84908a',4,13,10,1);}}
  if(north){r('#6b797b',0,0,32,1);r('#3e505a',0,1,32,3);r('#15222d',0,4,32,1);}if(west){r('#637578',0,0,1,top);r('#3b4c57',1,0,3,top);r('#14222e',4,0,1,top);}if(east){r('#0c1826',28,0,4,32);r('#42555d',28,0,1,top);}
  if(south){r(P.rim+'60',0,10,32,.6);r(P.accent+'80',0,12,32,1);
    const pattern=room?.wallPattern105||tower?.wallPattern105;
    if(pattern==='chains'&&x%3!==1){
     const anchor=8+hash2(x,y,369)*14;r('#151b20',anchor-3,15,6,4);r('#9f7c56',anchor-2,15,4,1);r('#42362c',anchor-1,17,2,1);
     for(let i=0;i<4;i++){const xx=anchor+Math.sin(i*.6+hash2(x,y,370))*1.8,yy=19+i*3;q.strokeStyle='#11191dcc';q.lineWidth=2.3;q.beginPath();q.ellipse(xx+.6,yy+.5,i%2?1:1.8,2.4,i%2?.25:-.2,0,Math.PI*2);q.stroke();q.strokeStyle=i%2?'#927051':'#be9661';q.lineWidth=1;q.beginPath();q.ellipse(xx,yy,i%2?1:1.8,2.4,i%2?.25:-.2,0,Math.PI*2);q.stroke();}
    }else if(pattern==='funerary'&&x%3===1){
     const relief=q.createLinearGradient(8,17,24,29);relief.addColorStop(0,'#746176');relief.addColorStop(.5,'#3d314a');relief.addColorStop(1,'#211e30');q.fillStyle=relief;q.beginPath();q.moveTo(9,28);q.lineTo(9,20);q.bezierCurveTo(9,15,23,15,23,20);q.lineTo(22,28);q.closePath();q.fill();q.strokeStyle=P.light+'70';q.lineWidth=.6;q.stroke();q.fillStyle='#bfb0b8';q.beginPath();q.ellipse(16,21,3,3.5,0,0,Math.PI*2);q.fill();q.fillStyle='#3c2d49';q.beginPath();q.ellipse(14.7,21,1,.7,0,0,Math.PI*2);q.ellipse(17.3,21,1,.7,0,0,Math.PI*2);q.fill();q.fillStyle='#897b91';q.beginPath();q.moveTo(13,25);q.quadraticCurveTo(16,23,19,25);q.lineTo(20,28);q.lineTo(12,28);q.closePath();q.fill();
    }else if(pattern==='bastion'&&x%3===2){
     r('#111f2cc0',7,17,18,13);r(P.light+'50',8,17,16,.7);const relief=q.createLinearGradient(10,18,22,28);relief.addColorStop(0,'#73848c');relief.addColorStop(.5,'#355268');relief.addColorStop(1,'#152b3e');q.fillStyle=relief;q.beginPath();q.moveTo(11,18);q.lineTo(21,18);q.lineTo(20,24);q.quadraticCurveTo(18,27,16,28);q.quadraticCurveTo(12,26,11,23);q.closePath();q.fill();q.strokeStyle=P.rim+'c0';q.lineWidth=.8;q.stroke();q.fillStyle='#c2b887';q.beginPath();q.ellipse(16,22,1.8,2.3,0,0,Math.PI*2);q.fill();r('#ded2a2',15.4,20.4,.7,.7);
    }
   }

  if(relic)drawCitadelRelic(q,relic,x,y,true);if(search)drawCitadelSearch(q,search,x,y,true);
 }

 else if(t===TT.DOOR||t===TT.OPEN_DOOR)floor();
 else if(t===TT.DRAWBRIDGE_DOWN||[TT.LOW_FENCE,TT.GARDEN_TREE].includes(t)&&s.startsWith('citadel-')){
  if(s==='citadel-woodbridge'){r('#252b2c',0,0,32,32);const vertical=at(0,-1)===TT.DRAWBRIDGE_DOWN&&at(0,1)===TT.DRAWBRIDGE_DOWN;q.save();if(!vertical){q.translate(32,0);q.rotate(Math.PI/2);}for(let b=0;b<32;b+=8){r('#8b6545',1,b+1,30,6);r('#bd9770',2,b+1,28,1);r('#503d30',2,b+6,28,1);line('#674c35',7,b+3,27,b+3,.7);r('#c1b294',4,b+3,1,1);r('#c1b294',27,b+3,1,1);}q.restore();}
  else if(s==='citadel-ironbridge'){r('#25363d',0,0,32,32);const vertical=at(0,-1)===TT.DRAWBRIDGE_DOWN&&at(0,1)===TT.DRAWBRIDGE_DOWN;q.save();if(!vertical){q.translate(32,0);q.rotate(Math.PI/2);}for(let b=0;b<32;b+=8){r('#3f5059',1,b+1,30,6);r('#78867f',2,b+1,28,1);r('#152a33',0,b+7,32,1);}r('#74694f',6,0,2,32);r('#74694f',24,0,2,32);for(const b of [4,20]){r('#a59975',7,b,1,1);r('#a59975',25,b,1,1);}q.restore();}else floor();
  for(const [dx,dy]of DIRS4)if(at(dx,dy)===TT.VOID){if(dx){r('#182c32',dx<0?0:27,0,5,32);r('#89918a',dx<0?1:29,0,2,32);r('#465960',dx<0?3:27,0,1,32);}else{r('#142930',0,dy<0?0:27,32,5);r('#89918a',0,dy<0?1:29,32,2);r('#465960',0,dy<0?3:27,32,1);}}
 }

 else floor();if(relic&&t!==TT.WALL&&t!==TT.VOID&&t!==TT.WATER&&t!==TT.LAVA&&t!==TT.MERCURY)drawCitadelRelic(q,relic,x,y);if(search&&![TT.WALL,TT.VOID,TT.WATER,TT.LAVA,TT.MERCURY].includes(t))drawCitadelSearch(q,search,x,y);BRANCH_TILE_CACHE.set(key,{stamp,canvas:c});}
 X.drawImage(c,px,py,32,32);if(t===TT.DOOR||t===TT.OPEN_DOOR)drawDoor(px,py,t===TT.OPEN_DOOR);const prop=ter.props[k(x,y)];if(prop&&foreground){const tile=CITADEL_PROP_TILES[prop];if(tile==null)throw Error('Unknown citadel furnishing '+prop);foreground.push({t:tile,px,py,x,y});}
 if(t===TT.PORTAL){const p=state.branchPortals105.find(p=>p.x===x&&p.y===y);if(p)drawBranchDoor(px,py,p);}else if(t===TT.SWITCH&&foreground){foreground.push({t,px,py,x,y});}else if(![TT.VOID,TT.WALL,TT.DRAWBRIDGE_DOWN,TT.STONE_PATH,TT.FLOOR,TT.DOOR,TT.OPEN_DOOR].includes(t)){X.save();if(!drawSpecialTerrain(t,px,py,x,y,performance.now()))drawInteractiveTerrain(t,px,py,x,y,performance.now());X.restore();}return true;
}
function drawCitadelActor(q,m,frame){const b=frame?1:0,{r}=drawKit(q),type=m.citadelActor105,pR9=(_,color,points)=>{q.fillStyle=color;q.beginPath();points.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill();};q.fillStyle='#0c122480';q.beginPath();q.ellipse(16,33,12,2,0,0,Math.PI*2);q.fill();if(type==='wing'){pR9(q,'#51465f',[[14,15],[1,6+b],[3,23],[11,26],[16,20],[22,26],[31,23],[30,6-b],[18,15]]);r('#aaa0bb',5,13,2,9);r('#aaa0bb',26,13,2,9);}if(type==='bell'){pR9(q,'#9a845e',[[12,3+b],[20,3+b],[23,19+b],[27,23+b],[5,23+b],[9,19+b]]);r('#d2bd89',9,20+b,15,3);r('#152335',13,11+b,7,6);r('#9ed3df',14,13+b,2,2);r('#9ed3df',18,13+b,2,2);r('#728ba3',14,24,4,7);return;}pR9(q,type==='tomb'?'#535f68':'#38465d',[[9,14+b],[23,14+b],[27,28],[22,32],[8,32],[5,27]]);r('#879ab0',10,16+b,12,3);r('#667b94',12,19+b,9,8);r('#b59b70',15,18+b,2,11);r('#222d42',11,4+b,11,10);r('#9aabc0',10,5+b,13,3);r('#879aaf',9,8+b,15,2);r('#c5a278',13,10+b,7,1);r('#633b56',21,11+b,3,17);r('#131c2b',8,31,6,3);r('#131c2b',20,31,6,3);if(type==='lancer'||type==='tomb'){r('#ab9170',27,7,2,25);pR9(q,'#d2dce4',[[28,1],[24,9],[31,9]]);}else if(type==='crossbow'){r('#ab9170',2,19,13,3);r('#d6dce1',7,14,2,16);r('#2d384c',1,21,2,6);}else if(type==='chain'){q.strokeStyle='#b7c5d1';q.beginPath();q.moveTo(7,20);q.lineTo(2,25);q.lineTo(3,32);q.lineTo(7,30);q.stroke();r('#b3bdc8',2,30,6,2);}}
function drawMineCell(t,px,py,x,y,foreground=null){
 const m=mineState();if(!m)return false;if(MINE_RENDER_STATE!==state.map){MINE_RENDER_STATE=state.map;MINE_CANVAS.clear();MINE_FX=[];}
 const hidden=mineHidden(x,y),tile=hidden?TT.VOID:t,at=(dx,dy)=>mineHidden(x+dx,y+dy)?TT.VOID:state.map[y+dy]?.[x+dx],stamp=k(x,y)+':'+tile+':'+DIRS8.map(([dx,dy])=>at(dx,dy)+'.'+Number(mineHidden(x+dx,y+dy))).join('|');let canvas=MINE_CANVAS.get(stamp);
 if(!canvas){canvas=document.createElement('canvas');canvas.width=canvas.height=32;const q=canvas.getContext('2d'),h=hash2(x,y,319),zone=m.cellStyle?.[k(x,y)]??((x>>4)+(y>>4))%3;
  const {r:rect,poly}=drawKit(q),line=(c,a,b,cx,cy,w=1)=>{q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(a,b);q.lineTo(cx,cy);q.stroke();};
  if(state.branchContext105?.id==='citadel'&&m.walls.some(w=>w.cells.some(c=>c.x===x&&c.y===y))){rect('#303c43',0,0,32,32);const shut=tile===TT.WALL;for(let a=3;a<32;a+=6){rect('#11191e',a+2,0,3,shut?32:5);rect('#9aa6a5',a,0,2,shut?32:4);}rect('#637476',0,shut?8:1,32,3);if(shut){rect('#1b292f',0,11,32,1);rect('#637476',0,24,32,2);}else{line('#80a69c',2,29,30,29);}}
  else if(tile===TT.VOID){rect('#0c1013',0,0,32,32);if(y>0&&at(0,-1)!==TT.VOID&&at(0,-1)!=null){
    const plank=at(0,-1)===TT.DRAWBRIDGE_DOWN;
    if(plank){const depth=q.createLinearGradient(0,0,0,29);depth.addColorStop(0,'#181c1c');depth.addColorStop(1,'#0c1013');q.fillStyle=depth;q.fillRect(0,0,32,29);rect('#342e25',0,0,32,4);line('#6b5940',0,1,32,1);const joint=x%3===0;if(joint){poly('#493d2d',[[3,2],[7,2],[10,21],[6,19]]);line('#897353',4,3,7,18);line('#574935',7,17,29,3,3);line('#786345',9,15,29,3);rect('#292b25',4,4,4,2);}else{line('#3d372a',0,5,32,5,2);if(x%3===1)line('#534733',0,3,18,14,2);}q.strokeStyle='#77705a';q.lineWidth=1;q.beginPath();q.moveTo(0,8);q.quadraticCurveTo(16,13+(x%3)*2,32,8);q.stroke();}
    else{poly('#262d2d',[[0,0],[32,0],[32,9],[23,14],[9,12],[0,16]]);poly('#424842',[[0,0],[14,0],[10,10],[1,13]]);poly('#353d39',[[16,0],[30,0],[26,8],[15,12]]);line('#626455',0,1,32,1);line('#1d2627',12,4,9,14);}
   }
  }else if(tile===TT.WALL){
   const pal=[['#343c39','#555e52','#818475'],['#3d3d33','#615f4c','#8d866d'],['#303a3a','#4e5f59','#768a7f']][zone];rect(pal[0],0,0,32,32);
   // Restore staggered masonry as the material base; vary each block independently of optional damage.
   for(let row=Math.floor(y*32/11);row<=Math.floor((y*32+31)/11);row++){
    const yy=row*11-y*32,offset=(row%2)*11;
    for(let col=Math.floor((x*32-offset)/22)-1;col<=Math.floor((x*32+32-offset)/22)+1;col++){
     const xx=col*22+offset+Math.floor(hash2(col,row,540)*3)-x*32,ww=22+Math.floor(hash2(col+1,row,540)*3)-Math.floor(hash2(col,row,540)*3),v=hash2(col,row,544);
     rect(v<.3?pal[0]:v<.7?pal[1]:['#626b5c','#6b6651','#5c7068'][zone],xx+1,yy+1,ww-2,9);
     line('rgba(13,23,22,.62)',xx,yy,xx+ww,yy);line('rgba(13,23,22,.55)',xx,yy,xx,yy+11);
     line('rgba(164,169,143,.20)',xx+2,yy+2,xx+ww-2,yy+2);
    }
   }
   // Broad rock bedding crosses tile boundaries; no repeated zigzag seam per block.
   const ridge=wx=>{const g=Math.floor(wx/96),f=(wx-g*96)/96;return 5+Math.round((hash2(g,y,782)*(1-f)+hash2(g+1,y,782)*f)*7);};
   const top=Array.from({length:5},(_,i)=>[i*8,ridge(x*32+i*8)]);poly(pal[1],[[0,0],[32,0],...top.slice().reverse()]);
   if(at(0,-1)!==TT.WALL)line(pal[2],0,1,32,1);
   if(state.branchContext105?.id!=='citadel')drawMineGeology(q,x,y,true,zone,m.scars?.[k(x,y)]==='ore');
   if(at(0,1)!==TT.WALL){rect('#1d2727',0,29,32,3);line('#28312e',0,27,32,27);}
   if(at(-1,0)!==TT.WALL)line(pal[2],1,3,1,24);if(at(1,0)!==TT.WALL)rect('#202827',29,3,3,26);
  }else if(tile===TT.DRAWBRIDGE_DOWN){
   rect('#242824',0,0,32,32);const ns=at(0,-1)===TT.DRAWBRIDGE_DOWN||at(0,1)===TT.DRAWBRIDGE_DOWN,ew=at(-1,0)===TT.DRAWBRIDGE_DOWN||at(1,0)===TT.DRAWBRIDGE_DOWN,vertical=ns&&!ew||ns&&ew&&at(0,-1)===TT.DRAWBRIDGE_DOWN&&at(0,1)===TT.DRAWBRIDGE_DOWN;
   q.save();if(!vertical){q.translate(32,0);q.rotate(Math.PI/2);}for(let i=0;i<6;i++){const yy=i*6-2,j=Math.floor(hash2(x*7+i,y,103)*3);rect(i%2?'#6d6250':'#615949',0,yy,32,5);rect('#9b8a6b',1,yy,30,1);if(hash2(x+i,y,451)>.7)line('#48483b',5+j,yy+3,12+j+i,yy+3);if(i===1||i===4){rect('#292f2b',3,yy+1,1,1);rect('#292f2b',27,yy+2,1,1);}}q.restore();
   const edge=(dx,dy)=>at(dx,dy)===TT.VOID||at(dx,dy)==null;for(const[dx,dy]of DIRS4)if(edge(dx,dy)){if(dx){line('#2b2821',dx>0?30:1,0,dx>0?30:1,32,3);line('#ad9670',dx>0?29:2,0,dx>0?29:2,32);}else{line('#2b2821',0,dy>0?30:1,32,dy>0?30:1,3);line('#ad9670',0,dy>0?29:2,32,dy>0?29:2);}}
   for(const[dx,dy]of DIRS4)if(edge(dx,dy)&&((dx?y:x)%3===0)){const a=dx?(dx>0?27:2):12,b=dy?(dy>0?26:1):12;rect('#292b24',a,b,4,6);rect('#ae9670',a,b,3,2);rect('#66533c',a+1,b+2,2,4);}
   if(h>.88){rect('#b8ba8a',7+Math.floor(h*15),17,2,1);rect('#747f66',9+Math.floor(h*15),16,1,1);}
  }else{
   rect(['#424b43','#494b3e','#3e4b46'][zone],0,0,32,32);
   const district=m.specialCells?.[k(x,y)];
   if(district){const course=(y*32)%16;line('rgba(13,25,24,.22)',0,16-course,32,16-course);const joint=((x*32+Math.floor(y*2)*13)%25);line('rgba(16,28,25,.18)',joint,0,joint,32);}
   if(state.branchContext105?.id!=='citadel')drawMineGeology(q,x,y,false,zone);else{rect('#59686b',0,0,32,1);rect('#25343b',0,31,32,1);line('#25343b',x%2?16:0,0,x%2?16:0,32);}
   // Damp stains share world-space ellipses across tile boundaries, with no repeated tile glyph.
   for(let gy=Math.floor(y/4)-1;gy<=Math.floor(y/4);gy++)for(let gx=Math.floor(x/5)-1;gx<=Math.floor(x/5);gx++){const seed=hash2(gx,gy,79);if(seed<.82)continue;const cx=gx*160+seed*80,cy=gy*128+hash2(gx,gy,81)*64,rx=25+seed*34,ry=10+seed*17;q.save();q.translate(cx-x*32,cy-y*32);q.rotate((seed-.5)*1.4);q.fillStyle='rgba(18,34,30,.10)';q.beginPath();for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=.72+hash2(gx+i,gy,789)*.28,xx=Math.cos(a)*rx*r,yy=Math.sin(a)*ry*r;i?q.lineTo(xx,yy):q.moveTo(xx,yy);}q.closePath();q.fill();q.restore();}
   if(at(0,-1)===TT.WALL){const g=q.createLinearGradient(0,0,0,13);g.addColorStop(0,'rgba(4,10,10,.52)');g.addColorStop(1,'rgba(4,10,10,0)');q.fillStyle=g;q.fillRect(0,0,32,13);}
  }
  MINE_CANVAS.set(stamp,canvas);
 }
 X.drawImage(canvas,px,py);

 if(!hidden&&t===TT.PORTAL){const portal=state.branchPortals105.find(p=>p.x===x&&p.y===y);if(portal)drawBranchDoor(px,py,portal);return true;}
 const button=!hidden&&mineButton(x,y);if(button){if(foreground)foreground.push({t:TT.SWITCH,px,py,x,y});else drawSpecialTerrain(TT.SWITCH,px,py,x,y,performance.now());}
 if(!hidden&&!button&&![TT.VOID,TT.WALL,TT.DRAWBRIDGE_DOWN,TT.STONE_PATH,TT.FLOOR].includes(t)){X.save();if(!drawSpecialTerrain(t,px,py,x,y,performance.now()))drawInteractiveTerrain(t,px,py,x,y,performance.now());X.restore();}
 return true;
}
function drawMineWorld(now,b){
 const m=mineState();if(!m)return;X.save();
 for(const w of m.walls)for(const c of w.cells){if(!state.visible.has(k(c.x,c.y)))continue;const x=c.x*32,y=c.y*32;X.strokeStyle=w.open?'#6c6651':'#aaa185';X.lineWidth=1;X.beginPath();X.moveTo(x+3,y+29);X.lineTo(x+3,y+7);X.moveTo(x+29,y+7);X.lineTo(x+29,y+29);X.stroke();X.fillStyle='#3a332b';X.fillRect(x+11,y+20,10,4);X.fillStyle='#a48859';X.fillRect(x+13,y+21,6,1);}
 for(const c of m.carts)if(c.alive&&state.visible.has(k(c.x,c.y))){const v=structureVisualPosition(c,c.x,c.y,now);drawMineCart(X,v.x*32,v.y*32);}
 for(const l of m.lanterns){if(b&&(l.x<b.x0-6||l.x>b.x1+6||l.y<b.y0-6||l.y>b.y1+6))continue;const x=l.x*32+16,y=l.y*32+13,visible=state.visible.has(k(l.x,l.y));
  if(!visible){X.save();X.globalAlpha=l.lit?.8:.6;X.strokeStyle=l.lit?'#ed9c3d':'#a89977';X.lineWidth=1;X.strokeRect(x-3.5,y-2.5,7,9);X.beginPath();X.moveTo(x-3,y-3);X.lineTo(x,y-7);X.lineTo(x+3,y-3);X.stroke();X.restore();continue;}

 }
 MINE_FX=MINE_FX.filter(f=>f.map===state.map&&now-f.start<900);
 for(const f of MINE_FX){const progress=Math.min(1,(now-f.start)/800);let pos=f;if(f.path?.length){const step=Math.min(1,progress/.8)*(f.path.length-1),i=Math.floor(step),a=f.path[i],b=f.path[Math.min(i+1,f.path.length-1)],u=step-i;pos={x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};}if(!state.visible.has(k(Math.round(pos.x),Math.round(pos.y))))continue;X.save();
  if(f.path&&progress<.8){const fall=f.kind==='fall'&&progress>.55,tail=fall?(progress-.55)/.25:0;X.globalAlpha=1-tail;drawMineCart(X,pos.x*32,pos.y*32+tail*12,tail*7,1-tail*.9);}
  if(f.kind==='break'||f.kind==='stone'){const phase=f.path?Math.max(0,(progress-.65)/.35):progress;if(phase>0){for(let i=0;i<12;i++){const a=i*2.399,r=6+phase*(10+i%4*3),xx=f.x*32+16+Math.cos(a)*r,yy=f.y*32+20+Math.sin(a)*r*.6-14*Math.sin(phase*Math.PI);X.save();X.translate(xx,yy);X.rotate(a+phase*2);X.globalAlpha=1-phase;X.fillStyle=f.kind==='stone'?['#a0a18a','#67756a','#394941'][i%3]:['#b29b73','#796448','#393b30'][i%3];X.fillRect(-3,-1,i%3+4,2);X.restore();}}}
  else if(!f.path){X.globalAlpha=(1-progress)*.6;X.strokeStyle=f.kind==='light'?'#eaba73':'#b49b72';X.lineWidth=1;X.beginPath();X.ellipse(pos.x*32+16,pos.y*32+24,4+progress*14,2+progress*7,0,0,Math.PI*2);X.stroke();}X.restore();
 }
 X.restore();
}
const DOJO_PALETTES=Object.freeze([
 {name:'적송 연무전',wall:'#b9a48a',cap:'#e0ccb0',beam:'#694333',floor:'#80604a',floor2:'#896952',grain:'#a38463',dark:'#402e28',stone:'#838477',stone2:'#919286',mat:'#b6a176',matLine:'#c7b58a',accent:'#904b38',metal:'#c9ae73'},
 {name:'청죽 회랑',wall:'#b8b6a0',cap:'#e0d9b8',beam:'#3f625e',floor:'#707a67',floor2:'#7b826e',grain:'#99a28a',dark:'#283e3d',stone:'#758889',stone2:'#829497',mat:'#91a48c',matLine:'#aabba0',accent:'#446c67',metal:'#bfbb8a'},
 {name:'주칠 중정',wall:'#c4ac95',cap:'#edd8ba',beam:'#743d39',floor:'#84655c',floor2:'#8f6e62',grain:'#ad8b72',dark:'#482d30',stone:'#91908b',stone2:'#9c9b94',mat:'#b18a73',matLine:'#c6a084',accent:'#883e42',metal:'#d1aa70'},
 {name:'회운 수련각',wall:'#a8b2b3',cap:'#d2d4c4',beam:'#425864',floor:'#697985',floor2:'#72838d',grain:'#92a0a2',dark:'#2a3542',stone:'#737e8b',stone2:'#828c99',mat:'#8f9d9e',matLine:'#a8b7b4',accent:'#526c7e',metal:'#b9c2b2'},
 {name:'먹빛 병장각',wall:'#a7a4a4',cap:'#d5cabb',beam:'#524c65',floor:'#706674',floor2:'#7e707d',grain:'#a08e96',dark:'#302e40',stone:'#757984',stone2:'#818793',mat:'#99919e',matLine:'#b1a8b1',accent:'#65536f',metal:'#c3b199'},
 {name:'백사 대련전',wall:'#d0c2aa',cap:'#f0e2c5',beam:'#444d50',floor:'#847964',floor2:'#928570',grain:'#b7a58c',dark:'#29373c',stone:'#7d8b8b',stone2:'#8a9693',mat:'#c2b28e',matLine:'#dfcdab',accent:'#9b4e3d',metal:'#d9bc7d'}
]);
const DOJO_DEEP_PALETTES=Object.freeze(DOJO_PALETTES.map(p=>Object.freeze(Object.fromEntries(Object.entries(p).map(([key,value])=>{if(key==='name')return[key,value+' · 심부'];const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)),mean=rgb.reduce((a,b)=>a+b,0)/3,factor=key==='cap'||key==='metal'?.86:key==='dark'?.9:.76;return[key,'#'+rgb.map(v=>Math.max(0,Math.min(255,Math.round((mean+(v-mean)*1.22)*factor))).toString(16).padStart(2,'0')).join('')];})))));
function dojoPaletteIndexForZone(level,zone){return level===2?[3,4,2,1,5][zone||0]:(zone||0)%3}
function dojoPalette(x,y){const d=state.branchTerrain105?.dojo,owned=d?.cellZones105?.[k(x,y)],sec=(d?.zones||d?.sectors)?.find(s=>x>=s.x-1&&x<=s.x+s.w&&y>=s.y-1&&y<=s.y+s.h);return (state.branchContext105?.level===2?DOJO_DEEP_PALETTES:DOJO_PALETTES)[dojoPaletteIndexForZone(state.branchContext105?.level,owned??sec?.id??0)]}
function drawDojoCell(t,px,py,x,y){
 if(BRANCH_RENDER_MAP!==state.map){BRANCH_RENDER_MAP=state.map;BRANCH_TILE_CACHE.clear();}const surface=state.branchTerrain105.surfaces[k(x,y)]||'wood',art=state.branchTerrain105.dojo,ornament=art.ornaments?.[k(x,y)],P=dojoPalette(x,y),stamp=t+':'+surface+':'+ornament+':'+P.name+':'+terrainUnlit105(x,y),key=y*COLS+x;let entry=BRANCH_TILE_CACHE.get(key);
 if(!entry||entry.stamp!==stamp){const c=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d'),{r}=drawKit(q),h=hash2(x,y,125),shade=h>.5;
 r('#161719',0,0,32,32);
 const texture=(seed,count,c)=>{for(let i=0;i<count;i++){const a=hash2(x*31+i,y*17,seed),b=hash2(x*19,y*29+i,seed+1);r(c,2+Math.floor(a*27),2+Math.floor(b*27),a>.7?2:1,1);}};
 if(t===TT.VOID){r('#080c13',0,0,32,32);if(state.map[y-1]?.[x]!=null&&![TT.VOID,TT.WALL].includes(state.map[y-1][x])){r(P.cap,0,0,32,2);r(P.stone,0,2,32,5);r(P.dark,0,7,32,9);r('#22292d',0,16,32,4);for(let j=0;j<4;j++){const xx=j*8+Math.floor(h*3);r('#303939',xx,6,1,9+j%3);r('#101820',xx+2,16,5,3+j%2);}q.fillStyle='rgba(0,0,0,.28)';q.fillRect(0,12,32,12);}else if(h>.87)r('#222629',5,22,11,1);}
 else if(t===TT.WALL){
 const wall=(xx,yy)=>state.map[yy]?.[xx]==null||state.map[yy][xx]===TT.WALL,south=wall(x,y+1),north=wall(x,y-1),west=wall(x-1,y),east=wall(x+1,y);
 r(P.dark,0,0,32,32);r(P.beam,0,0,32,south?32:7);
 if(!south){r(P.wall,0,7,32,21);const plaster=q.createLinearGradient(0,7,0,28);plaster.addColorStop(0,'rgba(255,238,198,.13)');plaster.addColorStop(1,'rgba(37,29,22,.18)');q.fillStyle=plaster;q.fillRect(0,7,32,21);texture(819,7,'rgba(77,58,37,.12)');for(let j=0;j<2;j++){const yy=20+j*4;r(P.beam,0,yy,32,1);r(P.grain,0,yy+1,32,1);}if(x%3===0){r(P.dark,0,6,4,23);r(P.beam,1,6,3,22);r(P.grain,1,7,1,20);r(P.metal,0,8,4,2);}r(P.cap,0,0,32,3);r(P.metal,0,4,32,1);r(P.dark,0,5,32,2);r(P.grain,0,6,32,1);if(x%3===0){r(P.beam,2,3,5,6);r(P.metal,3,3,3,1);r(P.dark,3,8,5,2);}r(P.dark,0,28,32,4);r(P.beam,0,24,32,2);if(!west){r(P.beam,0,7,3,21);r(P.metal,3,7,1,20);}if(!east){r(P.beam,29,7,3,21);r(P.dark,28,7,1,21);}}
 else{
  // Side/back wall volume is unlit negative space, outlined only at exposed edges.
  q.clearRect(0,0,32,32);const e=dojoWallEdges(x,y);
  if(e.west){r(P.cap,0,0,2,32);r(P.wall,2,0,2,32);}
  if(e.east){r(P.wall,28,0,2,32);r(P.cap,30,0,2,32);}
  if(e.north){r(P.cap,0,0,32,2);r(P.wall,0,2,32,2);}
  if(e.nw){r(P.cap,0,0,4,2);r(P.cap,0,0,2,4);}if(e.ne){r(P.cap,28,0,4,2);r(P.cap,30,0,2,4);}
  if(e.sw){r(P.cap,0,30,4,2);r(P.cap,0,28,2,4);}if(e.se){r(P.cap,28,30,4,2);r(P.cap,30,28,2,4);}
 }
 // Return the exposed vertical edge through the front-face corner too.
 if(!south){if(!west)r(P.cap,0,0,2,30);if(!east)r(P.cap,30,0,2,30);}

 }
 else {const stone=surface==='stone'||surface==='ceremony'||surface==='throne';r(stone?(shade?P.stone:P.stone2):shade?P.floor:P.floor2,0,0,32,32);if(stone){r(P.beam,0,0,32,1);r(P.stone2,1,1,30,1);r(P.beam,0,0,1,32);}else{for(let i=0;i<32;i+=16){r(P.dark,0,i,32,1);r(P.grain,0,i+1,32,1);if(hash2(x,y+i,31)>.5)r(P.grain,5+((y+i)%7),i+4,13,1);}r(P.beam,(y%2)*15,1,1,15);}
 // Fine material detail has stable, irregular world seeds; it never changes with zoom.
 if(stone){const offset=(y%2)*16;r('rgba(35,38,35,.3)',offset,1,1,30);r('rgba(241,231,200,.13)',offset+1,2,1,28);r('rgba(22,27,28,.20)',1,30,31,2);texture(442,7,'rgba(232,232,202,.12)');if(h>.87){const a=5+Math.floor(hash2(x,y,513)*15),b=7+Math.floor(hash2(x,y,514)*13);r('rgba(34,39,37,.3)',a,b,5,1);r('rgba(34,39,37,.23)',a+4,b+1,2,2);}}
 else{for(let j=0;j<4;j++){const yy=3+j*7+Math.floor(hash2(x,j+y,722)*3),xx=2+Math.floor(hash2(x+j,y,733)*12);r(j%2?'rgba(233,202,150,.12)':'rgba(31,20,18,.15)',xx,yy,8+Math.floor(hash2(x,y+j,744)*12),1);}if(h>.83){r(P.beam,9+Math.floor(h*8),10,4,2);r(P.grain,10+Math.floor(h*8),10,2,1);}r('rgba(0,0,0,.12)',0,30,32,2);}
 const nearbyWall=(xx,yy)=>state.map[yy]?.[xx]===TT.WALL;
 if(nearbyWall(x,y-1)){const shadow=q.createLinearGradient(0,0,0,9);shadow.addColorStop(0,'rgba(12,13,14,.35)');shadow.addColorStop(1,'rgba(12,13,14,0)');q.fillStyle=shadow;q.fillRect(0,0,32,9);}
 if(nearbyWall(x-1,y))r('rgba(12,13,14,.2)',0,0,2,32);
 if(surface.startsWith('mat')){r(P.mat,0,0,32,32);for(let j=2;j<32;j+=3)r(P.matLine,0,j,32,1);const mat=(xx,yy)=>String(state.branchTerrain105.surfaces[k(xx,yy)]).startsWith('mat')&&state.map[yy]?.[xx]===TT.WOOD_FLOOR;if(!mat(x-1,y)){r(P.accent,0,0,3,32);r(P.metal,3,0,1,32);}if(!mat(x+1,y)){r(P.accent,29,0,3,32);r(P.metal,28,0,1,32);}if(!mat(x,y-1)){r(P.accent,0,0,32,3);r(P.metal,0,3,32,1);}if(!mat(x,y+1)){r(P.accent,0,29,32,3);r(P.metal,0,28,32,1);}}

 if(stone){const hazard=(xx,yy)=>[TT.LAVA,TT.VOID,TT.WATER].includes(state.map[yy]?.[xx]);if(hazard(x,y-1)){r(P.dark,0,0,32,3);r(P.metal,0,3,32,1);}if(hazard(x-1,y)){r(P.dark,0,0,3,32);r(P.cap,3,0,1,32);}if(hazard(x+1,y)){r(P.dark,29,0,3,32);r(P.cap,28,0,1,32);}if(hazard(x,y+1)){r(P.dark,0,26,32,6);r(P.cap,0,26,32,2);r(P.beam,2,29,28,2);}}
 if(surface==='bridge'){r('#524630',0,0,3,32);r('#d0b184',2,0,1,32);r('#524630',29,0,3,32);}
 if(t===TT.STONE_PILLAR){r('#554a3b',5,6,23,25);r(P.beam,6,4,20,23);r(P.cap,5,3,22,4);r(P.dark,22,7,4,19);r(P.metal,4,27,24,3);r(P.stone2,6,30,20,2);r(P.grain,8,8,2,17);r(P.dark,18,8,1,17);r(P.accent,7,8,15,3);r(P.metal,9,11,2,2);r(P.cap,6,2,20,1);}
 if(surface==='ceremony'){r(P.accent,0,0,32,2);r(P.metal,0,2,32,1);}

 if(t===TT.BED){r('#372c25',4,4,25,28);r('#a17b50',4,3,3,29);r('#d2b58b',5,3,2,5);r('#76573b',26,3,3,29);r('#e3dac0',8,7,17,6);r(P.accent,8,14,17,15);r(P.mat,10,15,13,10);r(P.metal,8,26,17,2);r('#42342a',7,31,4,1);r('#42342a',23,31,4,1);}
 if(t===TT.TABLE){r('#463723',3,23,3,7);r('#463723',26,23,3,7);r('#715336',1,17,30,8);r('#c0a174',1,17,30,2);r('#8f6e48',3,20,26,2);}
 if(t===TT.RACK){r(P.dark,3,26,27,5);r('#60462e',4,4,3,25);r('#60462e',25,4,3,25);r('#795a38',4,9,24,3);for(let i=9;i<26;i+=6){r('#c4ac81',i,5,2,21);r('#665348',i-1,5,4,3);r('#e3d2a7',i,6,1,13);r(P.dark,i+2,6,1,18);r('#887055',i-2,18,6,2);}}
 if(t===TT.DOOR){r('#59432d',3,0,26,32);r('#b49a72',6,3,20,27);for(let i=8;i<26;i+=5)r('#7d6241',i,3,1,27);r('#dcc49a',20,17,3,3);}
 if(t===TT.PORTAL){r(P.dark,0,0,32,32);}
 }
 if(surface==='throne'){const sec=(art.zones||art.sectors).at(-1),centre=art.throne105||{x:sec.x+20,y:sec.y+36},cx=(centre.x-x)*32,cy=(centre.y-y)*32+16;r('#485356',0,0,32,32);q.strokeStyle='#d4b77b';q.lineWidth=2;for(const radius of [37,46,63]){q.beginPath();q.arc(cx,cy,radius,0,Math.PI*2);q.stroke();}q.strokeStyle='#9b4e3d';q.lineWidth=3;q.beginPath();q.moveTo(cx-51,cy);q.lineTo(cx+51,cy);q.moveTo(cx,cy-51);q.lineTo(cx,cy+51);q.stroke();q.strokeStyle='#e2d4b3';q.lineWidth=4;q.lineCap='square';for(const points of [[[-16,-12],[13,-12]],[[-11,-2],[8,-2]],[[-5,-8],[-5,18],[9,12]],[[12,-23],[15,7],[23,22]],[[5,5],[-15,18]],[[20,-21],[24,-17]]]){q.beginPath();points.forEach(([a,b],i)=>i?q.lineTo(cx+a,cy+b):q.moveTo(cx+a,cy+b));q.stroke();}}
 // Cast shadows and fittings are cached with their owning terrain cell.
 if(t===TT.JAR){r('#252d2b',5,24,23,6);r('#6c7772',7,11,18,16);r('#a6b2a3',10,10,10,3);r('#394b4a',9,7,14,4);r('#c0c5b2',10,8,11,1);r('#4c615d',6,15,3,9);r('#c4c7b1',10,14,2,8);r(P.accent,10,22,12,3);}
 if(ornament==='lattice'){r(P.dark,5,9,22,15);r('#718b88',7,11,18,10);for(let i=7;i<26;i+=5)r(P.beam,i,10,2,13);r(P.cap,5,9,22,1);r(P.beam,6,16,20,2);r(P.dark,4,24,24,2);}
 if(ornament==='scroll'){r('#4a3c31',9,6,16,2);r('#ddd0ae',11,8,12,18);r('#a89b7c',21,8,2,18);r('#4a3c31',9,26,16,2);r('#3f4441',16,11,2,11);r('#3f4441',14,13,6,2);r('#3f4441',13,19,6,1);r('#944b39',18,23,2,2);}
 if(ornament==='banner'){r(P.dark,7,6,21,2);r(P.accent,10,8,15,20);r(P.metal,11,8,1,18);r(P.metal,23,8,1,18);r(P.cap,16,11,3,11);r(P.cap,13,14,8,2);r(P.cap,14,20,7,1);r(P.dark,11,28,3,2);r(P.dark,21,28,3,2);}
 if(ornament==='swords'){r(P.dark,6,14,22,4);for(const xx of [11,21]){r('#c0c8bd',xx,6,2,18);r(P.metal,xx-2,22,6,2);r(P.beam,xx,24,2,5);}}
 if(ornament==='lantern'){
  r(P.dark,22,3,3,25);r(P.metal,22,4,1,22);r(P.dark,10,4,14,2);r(P.metal,11,5,2,4);r('#433b30',6,10,15,18);r('#c3904e',5,9,17,2);r('#a25c2d',8,11,11,14);r(terrainUnlit105(x,y)?'#69432f':WORLD_LIGHT_ART.lantern,9,12,9,12);if(!terrainUnlit105(x,y)){r('#ffe2a2',11,14,5,8);r('#fff3c7',12,16,3,4);}r('#795b38',7,26,13,2);r('#554130',12,11,1,15);r('#554130',8,19,11,1);r(P.dark,11,29,7,2);
 }

 entry={stamp,canvas:c};BRANCH_TILE_CACHE.set(key,entry);}
 X.drawImage(entry.canvas,px,py);if(t===TT.GARDEN_TREE)drawBotanical(X,t,px,py,x,y,regionIndex());if(t===TT.PORTAL){const portal=state.branchPortals105.find(p=>p.x===x&&p.y===y);if(portal)drawBranchDoor(px,py,portal);}if(t===TT.SCREEN)drawInteractiveTerrain(t,px,py,x,y,FX.frameNow||performance.now());if(t===TT.DOOR||t===TT.OPEN_DOOR)drawDoor(px,py,t===TT.OPEN_DOOR);if(t===TT.LOCKED_GATE){drawDoor(px,py,false);globalThis.__MANRU_TERRAIN_R41__.specialKeyAfter(t,px,py,x,y,performance.now(),true);}if(t===TT.KEY_TILE)globalThis.__MANRU_TERRAIN_R41__.specialBefore(t,px,py,x,y,performance.now());if([TT.WATER,TT.LAVA,TT.LIGHT_GRASS].includes(t))drawSpecialTerrain(t,px,py,x,y,FX.frameNow||performance.now());return true;
}
// At overview scale a tile is only a few screen pixels. Reuse the canonical
// minimap palette; close views keep the full native architecture renderer.
function drawDebugBattleOverview(cam,now){
 const b=DEBUG_BATTLE57;
 if(b.overviewMap!==state.map||b.overviewTurn!==state.turn){
  const width=MC.width,height=MC.height;MC.width=COLS*2;MC.height=ROWS*2;
  try{drawMinimap(true);b.overviewCanvas??=document.createElement('canvas');b.overviewCanvas.width=MC.width;b.overviewCanvas.height=MC.height;b.overviewCanvas.getContext('2d').drawImage(MC,0,0);b.overviewMap=state.map;b.overviewTurn=state.turn;}finally{MC.width=width;MC.height=height;}
 }
 X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.fillStyle='#080b11';X.fillRect(0,0,VIEW.w,VIEW.h);X.save();X.translate(cam.x,cam.y);X.scale(cam.zoom,cam.zoom);X.imageSmoothingEnabled=false;X.drawImage(b.overviewCanvas,0,0,COLS*TILE,ROWS*TILE);
 for(const m of state.monsters){if(m.hp<=0)continue;X.fillStyle=entityFaction(m)==='player'?'#78c8ff':'#ff9d8e';for(const c of entityFootprintCells57(m))X.fillRect(c.x*TILE,c.y*TILE,TILE,TILE);}
 X.restore();return true;
}
function citadelRelicPalette(base,site,strength){const out={...base};for(const key of ['stone','joint','light','rim','accent','wall']){const a=base[key],b=site.palette[key],rgb=[1,3,5].map(n=>Math.round(parseInt(a.slice(n,n+2),16)*(1-strength)+parseInt(b.slice(n,n+2),16)*strength).toString(16).padStart(2,'0'));out[key]='#'+rgb.join('');}return out;}
// Hearth animation is visual time only: no gameplay RNG, particles, turns or save fields.
let hearthAnimationSeen105=-Infinity;
function menuLanternLight1001(now,phase,baseRadius,reduced=false){
  const t=reduced?0:now/1000,breath=.5+.5*Math.sin(t*.94+phase);
  return {radius:baseRadius*(.72+.46*breath),energy:.66+.30*breath,bob:reduced?0:Math.sin(t*.94+phase)*1.6};
}
function martialWallPalette1005(x,y,tile){
 const saved=X.getImageData(0,0,32,32);X.save();let colors=[];
 try{X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over';X.fillStyle=REGION_ART[regionIndex()].wall;X.fillRect(0,0,32,32);
 if(!drawBranchCell(tile,0,0,x,y)&&!globalThis.__MANRU_LEGEND_TERRAIN47__?.drawCell?.(tile,0,0,x,y,performance.now(),true)){if(tile===TT.WALL)drawWallTexture(0,0,x,y,regionColors());else{drawFloorTexture(0,0,x,y,regionColors(),true);if(!drawSpecialTerrain(tile,0,0,x,y,performance.now()))drawInteractiveTerrain(tile,0,0,x,y,performance.now())}}
 const data=X.getImageData(0,0,32,32).data,bins=new Map();for(let i=0;i<data.length;i+=4){const rgb=[data[i],data[i+1],data[i+2]],key=rgb.map(n=>Math.round(n/16)*16).join(',');if(rgb.reduce((a,b)=>a+b,0)>60)bins.set(key,{rgb,n:(bins.get(key)?.n||0)+1})}
 const common=[...bins.values()].sort((a,b)=>b.n-a.n).slice(0,12).sort((a,b)=>a.rgb.reduce((n,x)=>n+x,0)-b.rgb.reduce((n,x)=>n+x,0));
 colors=[common[0],common[Math.floor(common.length/2)],common.at(-1)].filter(Boolean).map(v=>'rgb('+v.rgb.join(',')+')');
 }finally{X.restore();X.putImageData(saved,0,0)}
 const art=REGION_ART[regionIndex()];return colors.length===3?colors:[art.wallDark,art.wall,art.light];
}
const REGION_ART=[
  {floor:'#2b1a12',floorAlt:'#311d14',wall:'#5b2f28',wallDark:'#371a17',accent:'#d47749',light:'#e2a05f',fog:'#120a07'},
  {floor:'#31372d',floorAlt:'#394033',wall:'#44483b',wallDark:'#20251f',accent:'#9a8d69',light:'#d4c7a3',fog:'#0a0d09'},
  {floor:'#251626',floorAlt:'#2b1a2c',wall:'#503653',wallDark:'#321f35',accent:'#b56b9b',light:'#d5a4c2',fog:'#100811'},
  {floor:'#251b15',floorAlt:'#2b2019',wall:'#514036',wallDark:'#30251f',accent:'#aa7350',light:'#d29a6a',fog:'#0d0906'},
  {floor:'#21190f',floorAlt:'#261d11',wall:'#5b4b31',wallDark:'#352a1a',accent:'#c7a14a',light:'#ead17a',fog:'#0b0805'}
];
const VIS={playerX:0,playerY:0,last:performance.now(),camX:0,camY:0,camInit:false};
const MON_VIS=new WeakMap();
 // gameplay clock is action-driven; animation remains frame-driven
const FX = {
  particles:[],
  floats:[],
  slashes:[],
  rings:[],
  projectiles:[],
  doors:[],
  shakeUntil:0,
  shakePower:0,
  flashUntil:0,
  flashColor:"#ffffff",
  transition:null
};
function hash2(x,y,s=0){
  let n = (x*374761393 + y*668265263 + s*1442695041) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function displayCombatText58(value){
  return String(value).replace(/([+-])(\d+\.\d+(?:e[+-]?\d+)?)(?!\d|\.\d|[eE][+-]?\d|\s*(?:%|×|턴))/g,(_,sign,n)=>sign+Math.round(Number(n)))
    .replace(/\bHP ([0-9]+(?:\.[0-9]+)?)(\s*[\/→]\s*)([0-9]+(?:\.[0-9]+)?)/g,(_,a,sep,b)=>'HP '+displayHealth(a)+sep+displayHealth(b))
    .replace(/(→[^:\n]+:\s*)(\d+\.\d+(?:e[+-]?\d+)?)/g,(_,prefix,n)=>prefix+Math.round(Number(n)));
}
function automationPresentationRate70(){return globalThis.__MANRU_RUNTIME81__?.Automation81?.presentationRate?.()||1}

function terrainUnlit105(x,y){const lamp=state?.branchTerrain105?.mine105?.lanterns?.find(l=>l.x===x&&l.y===y);return lamp?!lamp.lit:!!state?.terrainReactions105?.unlit?.[k(x,y)]}
function beginStructureMotion105(oldKey,key,from,x,y){
  const now=performance.now();let motions=STRUCTURE_MOTION105.get(state.map);if(!motions){motions=new Map();STRUCTURE_MOTION105.set(state.map,motions)}
  const previous=motions.get(oldKey),sample=previous?structureMotionSample(previous,now):null;motions.delete(oldKey);
  if(!state.visible.has(k(from.x,from.y))||!state.visible.has(k(x,y)))return;
  const start=sample?{x:sample.x,y:sample.y}:{x:from.x,y:from.y},dx=x-start.x,dy=y-start.y,distance=Math.hypot(dx,dy);if(distance<=.0001)return;
  const rate=Math.max(.75,automationPresentationRate70()),duration=150/rate,ux=dx/distance,uy=dy/distance,oldVx=sample&&!sample.done?sample.vx:0,oldVy=sample&&!sample.done?sample.vy:0;
  const nominal=distance/duration,along=Math.max(0,Math.min(nominal*2.25,oldVx*ux+oldVy*uy)),vx=ux*along,vy=uy*along;
  motions.set(key,{from:start,x,y,start:now,duration,vx,vy});structureMotionUntil=Math.max(structureMotionUntil,now+duration);
}
function terrainBaseTile58(x,y,tile=state?.map?.[y]?.[x]){return terrainLayerCatalog58().overlays.has(tile)?terrainUnderlayAt58(x,y)??TT.FLOOR:tile}
function regionIndex(){return Math.floor((state.floor-1)/5)}
function resolveProjectileImpact57(mon,line,result,target,impact=mon.projectileImpact57){
 if(!impact||!line?.ok||!result?.attempted||result.blocked)return false;
 const x=result.reflected?mon.x:line.toX,y=result.reflected?mon.y:line.toY;if(!Number.isInteger(x)||!Number.isInteger(y))return false;
 if(impact.gasStatus57){const source=result.reflected?target:mon,gas=spawnJarGasField57(x,y,{status:impact.gasStatus57,duration:impact.turns,maxRadius:impact.radius,burstRadius:impact.burstRadius,linger:true,source,visualDelay57:impact.visualDelay57});if(gas){FX.rings.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2,color:'#d7a3e0',start:performance.now()+(impact.visualDelay57||0),life:480,power:7});addLog(`${mon.name}의 환각 가스탄이 폭발했다.`);}return !!gas;}
 const cells=elementCells105(x,y,impact.radius).filter(q=>{const tile=state.map[q.y][q.x];return ![TT.VOID,TT.WATER,TT.MERCURY,TT.LAVA].includes(tile)&&(!runtimeTerrainSolid57(tile)||elementMaterial105(tile,'wood',q.x,q.y)||lightAt(q.x,q.y));});
 if(!cells.length)return false;const source=result.reflected?target:mon;
 addField(impact.element,x,y,impact.turns,cells,{...effectSource57(source),ground:true,projectileImpact57:true});return true;
}
function triggerGazeBurst57(mon,target=state.player){
 if(!state?.player||!mon)return;const now=performance.now();state.gazeBursts57=(state.gazeBursts57||[]).filter(b=>now-b.t<(b.ttl||460));state.gazeBursts57.push({x0:mon.x,y0:mon.y,x1:target.x,y1:target.y,t:now,ttl:460});burst(mon.x,mon.y,'#df8fce',18,.75);burst(target.x,target.y,'#f1b3df',28,1.0);impact(target.x,target.y,'#f0a9d9',6)
}
function regionColorsWithFloor11(){const c=regionColorsWithPalette();if(state?.floor===11)return{...c,wall:'#696f73',wallDark:'#303537',accent:'#959da1',light:'#c9ccca',fog:'#111416'};return c}
function floorArtRegionColors(){return state&&ART60[state.floor]?{...ART60[state.floor]}:liftedRegionColors()}
const TERRAIN_MOTION54=matchMedia('(prefers-reduced-motion:reduce)');
function liquidNeighborSame(tile,x,y){
  if(x<0||y<0||x>=COLS||y>=ROWS)return false;const t=state.map[y][x];
  if(tile===TT.WATER)return t===TT.WATER||t===TT.RAFT||t===TT.PAPER_BRIDGE||t===TT.PAVILION;
  return t===TT.MERCURY;
}
function v8CreatureCoords(m){if(m.shape==='player')return{x:m.x,y:m.y};const v=MON_VIS.get(m);return v?{x:v.x,y:v.y}:{x:m.x,y:m.y}}
  const hc=()=>{const c=document.createElement('canvas');c.width=HI;c.height=HI;return c};
  const ln=(q,x0,y0,x1,y1,c,w=1)=>{q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(Math.round(x0)+.5,Math.round(y0)+.5);q.lineTo(Math.round(x1)+.5,Math.round(y1)+.5);q.stroke();q.lineWidth=1};
  const box=(q,x,y,w,h,c)=>{q.strokeStyle=c;q.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(w)-1,Math.round(h)-1)};
  /* ----------------------- 48x48 floor / wall tiles ----------------------- */
  function hiFloor(region,variant){
    const key=`${region}:${variant}`;if(HI_CACHE.floor.has(key))return HI_CACHE.floor.get(key);
    const c=hc(),q=ctx2(c),A=REGION_ART[region]||REGION_ART[0],h=hiHash(key);
    rect(q,0,0,48,48,variant&1?A.floorAlt:A.floor);
    if(region===0){
      for(let y=0;y<48;y+=8){rect(q,0,y,48,1,'rgba(7,3,2,.52)');rect(q,0,y+1,48,1,'rgba(255,214,154,.025)')}
      for(let row=0;row<6;row++){const seam=((row+(h&3))%3)*16+8;rect(q,seam,row*8,1,8,'rgba(4,2,1,.42)')}
      for(let i=0;i<7;i++){const x=(h>>(i%12))%44+2,y=(h>>(i+5)%16)%44+2;rect(q,x,y,2+(i%3),1,'rgba(173,92,52,.13)')}
      if(variant===2){rect(q,6,18,36,10,'rgba(122,39,29,.20)');rect(q,8,20,32,1,'rgba(226,160,87,.10)')}
      if(variant===3){for(let i=0;i<4;i++){const x=8+i*9;hiResDot(q,x,13,'rgba(217,172,101,.14)');hiResDot(q,45-x,35,'rgba(0,0,0,.16)')}}
    }else if(region===1){
      for(let y=0;y<48;y+=16){ln(q,0,y,48,y,'rgba(125,157,137,.14)')}
      for(let y=0;y<3;y++){const off=(y&1)?12:28;rect(q,off,y*16,1,16,'rgba(42,69,51,.24)')}
      for(let i=0;i<8;i++){const x=3+((h+i*13)%42),y=4+((h>>>i)%38);rect(q,x,y,2,1,'rgba(162,189,171,.08)')}
      rect(q,4,41,16+(h%14),4,'rgba(44,79,50,.22)');rect(q,8,37,4,7,'rgba(53,96,59,.20)')
      if(variant===2){rect(q,11,12,25,23,'rgba(34,70,57,.12)');box(q,11,12,25,23,'rgba(152,181,162,.10)')}
    }else if(region===2){
      box(q,4,4,40,40,'rgba(213,137,191,.15)');rect(q,6,20,36,8,'rgba(108,42,88,.15)');
      for(let i=0;i<5;i++){ln(q,7+i*8,7,39-i*8,39,'rgba(232,171,206,.07)')}
      if(variant===1||variant===3){rect(q,12,11,24,2,'rgba(238,186,214,.08)');rect(q,12,35,24,1,'rgba(57,19,51,.16)')}
      for(let i=0;i<5;i++)hiResDot(q,8+((h+i*9)%33),8+((h>>>i)%31),'rgba(224,140,188,.12)')
    }else if(region===3){
      box(q,3,3,42,42,'rgba(168,120,80,.18)');ln(q,3,24,45,24,'rgba(89,59,42,.22)');
      for(const [x,y] of [[7,7],[40,7],[7,40],[40,40]]){rect(q,x-1,y-1,3,3,'#2b211a');hiResDot(q,x,y,'#89735b')}
      for(let i=0;i<7;i++){const x=5+((h+i*7)%36),y=6+((h>>>i)%35);rect(q,x,y,2+(i&1),1,'rgba(122,91,65,.12)')}
      if(variant===2){rect(q,9,30,30,4,'rgba(103,53,32,.17)')}
    }else{
      box(q,4,4,40,40,'rgba(235,196,91,.18)');ln(q,24,6,42,24,'rgba(232,194,95,.15)');ln(q,42,24,24,42,'rgba(232,194,95,.15)');ln(q,24,42,6,24,'rgba(232,194,95,.15)');ln(q,6,24,24,6,'rgba(232,194,95,.15)');
      rect(q,22,9,4,30,'rgba(234,190,72,.08)');for(let i=0;i<6;i++)hiResDot(q,7+((h+i*11)%34),8+((h>>>i)%32),'rgba(250,222,130,.16)');
      if(variant===3){rect(q,11,11,5,4,'rgba(126,50,57,.20)');rect(q,31,33,4,3,'rgba(126,50,57,.14)')}
    }
    rect(q,0,0,48,1,'rgba(255,255,255,.025)');rect(q,0,46,48,2,'rgba(0,0,0,.12)');
    for(let i=0;i<10;i++){const xx=3+(h+i*11)%42,yy=4+((h>>>(i%13))+i*7)%38;rect(q,xx,yy,region===0?3+i%4:1+i%2,.6,i%3?'rgba(6,5,4,.07)':'rgba(213,183,134,.055)')}
    HI_CACHE.floor.set(key,c);return c;
  }
  function hiTerrain(tile,region,variant=0,frame=0,extra=''){
    const key=terrainKey(tile,region,variant,frame,extra);if(HI_CACHE.terrain.has(key))return HI_CACHE.terrain.get(key);
    const c=hc(),q=ctx2(c),h=hiHash(key),A=REGION_ART[region]||REGION_ART[0];
    const baseFloor=()=>{if(!terrainLayerCatalog58().overlays.has(tile))q.drawImage(hiFloor(region,variant&3),0,0)};
    if(tile===TT.WATER||tile===TT.MERCURY){
      const mer=tile===TT.MERCURY;baseFloor();rect(q,0,0,48,48,mer?'#657271':'#244c51');rect(q,0,39,48,9,mer?'#3b4141':'#133238');
      for(let i=0;i<5;i++){const y=8+i*8,x=((h>>(i+2))%16+frame*3+i*7)%34;rect(q,x,y,12-(i%3),2,mer?'#c0cbc5':'#6ba1a7');hiResDot(q,x+2,y,'rgba(255,255,255,.25)')}
      rect(q,0,0,48,2,mer?'rgba(226,230,222,.24)':'rgba(146,183,168,.18)');
    }else if(tile===TT.VOID){
      rect(q,0,0,48,48,'#010102');for(let i=0;i<9;i++){const x=(h+i*17+frame*2)%45,y=((h>>>i)+i*11)%45;rect(q,x,y,1+(i&1),1+(i%3===0),'#392042')}rect(q,23,9,2,30,'rgba(151,87,169,.24)');
    }else if(tile===TT.GOLD){
      baseFloor();rect(q,3,3,42,42,'#3b2c16');box(q,5,5,38,38,'#c09a45');rect(q,22,8,4,31,'#dcb85d');rect(q,9,22,30,4,'#dcb85d');for(let i=0;i<6;i++)hiResDot(q,8+((h+i*9)%32),8+((h>>>i)%30),'#ffecaa');
    }else if(tile===TT.GRASS){
      rect(q,0,0,48,48,'#17281a');for(let i=0;i<22;i++){const x=(h+i*13)%46,y=23+((h>>>i)%22);rect(q,x,y,1+(i%3===0),6+(i%7),'#315439');rect(q,x-2,y+3,2,1,'#4f714d')}for(let i=0;i<4;i++)hiResDot(q,8+((h+i*8)%32),20+((h>>>i)%20),'#b47c77');
    }else if(tile===TT.HEDGE){
      rect(q,0,0,48,48,'#1b2c22');rect(q,0,39,48,9,'#30382a');rect(q,1,40,46,2,'#5b6650');for(const [cx,cy,r]of [[6,9,10],[22,7,12],[39,12,12],[10,28,12],[29,26,14],[44,31,10]]){q.fillStyle=(cx+variant)%3?'#354e36':'#405940';q.beginPath();q.moveTo(cx-r,cy);q.lineTo(cx-r/2,cy-r*.8);q.lineTo(cx+r*.4,cy-r);q.lineTo(cx+r,cy-r*.2);q.lineTo(cx+r*.8,cy+r*.7);q.lineTo(cx-r*.4,cy+r);q.closePath();q.fill();}for(let i=0;i<18;i++){const lx=3+(h+i*13)%42,ly=4+((h>>>i)+i*7)%31;q.fillStyle=i%3?'#5c724d':'#788562';q.beginPath();q.moveTo(lx-2,ly+2);q.lineTo(lx+1,ly-2);q.lineTo(lx+5,ly-3);q.lineTo(lx+2,ly+1);q.closePath();q.fill();}rect(q,0,45,48,3,'#17271e');
    }else if(tile===TT.BAMBOO){
      rect(q,0,0,48,48,'#0d170f');for(let i=0;i<5;i++){const x=5+i*9+(variant&1);rect(q,x,2,4,44,i%2?'#5c7a59':'#48664b');for(let y=8+(i%2)*5;y<43;y+=12)rect(q,x-3,y,10,2,'#2b432e')}rect(q,0,43,48,5,'rgba(0,0,0,.34)');
    }else if(tile===TT.PAPER_BRIDGE||tile===TT.DRAWBRIDGE_DOWN||tile===TT.DRAWBRIDGE_UP){
      baseFloor();const up=tile===TT.DRAWBRIDGE_UP;if(up){rect(q,9,2,30,44,'#513c2e');for(let i=0;i<6;i++){rect(q,10,5+i*7,28,5,i%2?'#75553b':'#60442f');rect(q,11,6+i*7,26,1,'rgba(238,203,153,.08)')}}else{const wood=tile===TT.PAPER_BRIDGE&&region===1&&(variant&1);rect(q,4,7,40,35,tile===TT.PAPER_BRIDGE?(wood?'#7d5937':'#d8cfb2'):'#8d663f');for(let y=9;y<41;y+=6){rect(q,6,y,36,4,tile===TT.PAPER_BRIDGE?(wood?((y/6)%2?'#b98a58':'#a57749'):'#eee2c5'):'#b88650');rect(q,6,y+4,36,1,'rgba(50,33,20,.28)')}rect(q,3,7,3,35,'#463425');rect(q,42,7,3,35,'#463425');if(wood){rect(q,21,8,6,33,'rgba(235,196,133,.08)');hiResDot(q,11,24,'#dbc28b');hiResDot(q,35,20,'#dbc28b')}else if(tile===TT.PAPER_BRIDGE){for(let i=0;i<4;i++)hiResDot(q,11+i*7,14+((variant+i)%3)*7,'#d7a89f')}}
    }else if(tile===TT.BENCH){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.TABLE){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.SCREEN){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.RAFT){
      rect(q,0,0,48,48,'rgba(0,0,0,0)');for(let i=0;i<7;i++){rect(q,5,9+i*5,38,4,i%2?'#8a603d':'#704a30')}rect(q,8,9,3,34,'#3a281b');rect(q,37,9,3,34,'#3a281b');rect(q,22,2,4,17,'#b99a64');
    }else if(tile===TT.PAVILION){
      baseFloor();rect(q,9,28,30,14,'#352419');rect(q,6,21,36,7,'#9d5e3e');rect(q,12,16,24,5,'#ba794f');rect(q,19,10,10,6,'#7d4a32');rect(q,12,28,4,14,'#d4a168');rect(q,32,28,4,14,'#d4a168');rect(q,8,23,32,2,'#e0b081');
    }else if([TT.DOOR,TT.OPEN_DOOR,TT.FAKE_DOOR,TT.SECRET_DOOR,TT.LOCKED_GATE].includes(tile)){
      baseFloor();if(tile===TT.LOCKED_GATE){rect(q,3,3,42,44,'#141516');rect(q,5,5,38,6,'#66635d');for(let i=0;i<7;i++)rect(q,8+i*5,11,2,31,'#0c0d0e');rect(q,20,20,9,12,'#c4944e');rect(q,23,23,3,6,'#292116')}else if(tile===TT.SECRET_DOOR){rect(q,2,2,44,44,colorShift(A.wall,-8));box(q,8,8,32,32,'#836c3d');rect(q,23,11,2,26,'rgba(219,181,88,.20)')}else{q.save();q.scale(1.5,1.5);drawDoor(0,0,tile===TT.OPEN_DOOR,false,q);q.restore()}
    }else if(tile===TT.JAR){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.STAIR){
      baseFloor();rect(q,7,6,34,38,'#0c0805');rect(q,6,6,36,6,'#74462b');rect(q,6,6,6,38,'#74462b');rect(q,36,6,6,38,'#51301f');for(let i=0;i<5;i++)rect(q,11+i*4,34-i*5,25-i*4,4,colorShift('#b7834b',-i*5));rect(q,33,14,3,6,'#e3bc78');
    }else if(tile===TT.RUMOR){
      baseFloor();rect(q,10,11,28,30,'#473525');rect(q,12,8,24,29,'#dfceab');for(let i=0;i<5;i++)rect(q,15,14+i*5,15-(i%2)*3,2,'#8e6542');rect(q,33,8,4,29,'#8e2f26');
    }else if(tile===TT.BRAZIER){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.TRAP){
      baseFloor();q.strokeStyle='rgba(184,98,71,.82)';q.lineWidth=2;q.beginPath();q.moveTo(9,39);q.lineTo(18,10);q.lineTo(26,39);q.lineTo(38,10);q.stroke();rect(q,8,36,32,4,'rgba(110,49,36,.25)');
    }else if(tile===TT.ARMORY||tile===TT.CACHE||tile===TT.VAULT){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.FOUNTAIN){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.MIRROR){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.ALTAR){q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();}else if(tile===TT.SNARE){
      baseFloor();q.strokeStyle='#9d87a1';q.lineWidth=3;q.beginPath();q.moveTo(12,12);q.lineTo(36,36);q.moveTo(36,12);q.lineTo(12,36);q.stroke();q.strokeRect(11.5,11.5,25,25);q.lineWidth=1;
    }else if(tile===TT.COOKPOT){
      q.save();q.scale(1.5,1.5);drawSharedProp(q,tile,0,0,region,variant,frame*240,extra!=='unlit');q.restore();
    }else if(tile===TT.KEY_TILE){
      baseFloor();q.strokeStyle='#dfb05b';q.lineWidth=3;q.beginPath();q.arc(17,18,7,0,Math.PI*2);q.stroke();q.beginPath();q.moveTo(23,23);q.lineTo(39,39);q.moveTo(32,32);q.lineTo(38,26);q.stroke();q.lineWidth=1;
    }else if(tile===TT.STAMINA_PAD){
      baseFloor();rect(q,8,8,32,32,'#152326');box(q,10,10,28,28,frame?'#a4c8c7':'#68989b');rect(q,22,13,5,22,'#91bdbf');rect(q,14,22,20,5,'#91bdbf');
    }else if(tile===TT.SWITCH){
      baseFloor();const used=extra==='used';rect(q,12,13,24,24,used?'#40372d':'#704421');box(q,12,13,24,24,extra==='cipher'?'#df974b':'#a67c50');rect(q,23,5,4,17,used?'#756858':'#d6a45d');
    
    }else return null;
    HI_CACHE.terrain.set(key,c);return c;
  }
  /* ----------------------- 48x48 decor ----------------------- */
  function hiDecor(kind,region,flip=false,lit=true){
    const key=`${kind}:${region}:${flip?1:0}:${lit?1:0}`;if(HI_CACHE.decor.has(key))return HI_CACHE.decor.get(key);
    const c=hc(),q=ctx2(c),A=REGION_ART[region]||REGION_ART[0],h=hiHash(key),P=pal(A.accent||'#9b704a');
    const wood=region===0?'#70452c':region===3?'#5a4334':'#594232';
    if(['lantern','lampstand','brazier'].includes(kind)){q.save();q.scale(1.5,1.5);drawSharedProp(q,kind==='brazier'?TT.BRAZIER:kind==='lampstand'?TT.GOLD_LAMP:TT.LANTERN_POST,0,0,region,0,0,lit);q.restore()}else if(kind==='trim'){rect(q,1,6,46,15,rgba(A.accent,.14));rect(q,2,6,44,2,rgba(A.light,.12));rect(q,2,19,44,3,'rgba(0,0,0,.18)')}
    else if(kind==='scroll'){rect(q,16,2,17,4,'#2b160f');rect(q,18,6,13,29,region===4?'#d4b06a':'#d7c098');rect(q,22,11,4,16,region===4?'#856225':'#734937');for(let y=10;y<32;y+=5)rect(q,20,y,9,1,'rgba(75,45,28,.14)')}
    else if(kind==='vines'||kind==='roots'){for(let i=0;i<4;i++){const x=12+i*7;rect(q,x,3+i*2,2,36-i*5,'#4d6c53');rect(q,x-3,13+i*5,8,3,'#759078');rect(q,x+1,24-i*3,7,3,'#5f7d63')}}
    else if(kind==='silk'){rect(q,12,3,24,34,region===2?'#783e66':'#7b3a2f');rect(q,14,5,20,4,region===2?'#d69abb':'#d28b61');for(let y=11;y<32;y+=6)rect(q,16,y,16,1,'rgba(255,255,255,.08)');rect(q,20,37,3,7,'#4b253f');rect(q,27,37,3,7,'#4b253f')}
    else if(kind==='chains'){for(let x of [18,28]){for(let y=3;y<37;y+=5){box(q,x,y,5,6,'#746861')}}rect(q,18,38,15,4,'#413a35')}
    else if(kind==='relief'){rect(q,11,5,27,32,region===4?'#7d6632':'#5f554b');box(q,13,7,23,28,region===4?'#d0ad5d':'#998b7a');rect(q,20,12,9,6,'rgba(255,235,176,.13)');rect(q,18,20,13,10,'rgba(0,0,0,.14)')}
    else if(kind==='rug'){rect(q,4,15,40,21,region===0?'#61261f':region===2?'#6e315c':region===4?'#796127':'#4d4231');box(q,6,17,36,17,rgba(A.light,.16));for(let x=9;x<40;x+=7)hiResDot(q,x,25,rgba(A.light,.22))}
    else if(kind==='papers'){for(let i=0;i<4;i++){const x=8+(h+i*11)%28,y=20+((h>>>i)%12);rect(q,x,y,10,7,'#d7c5a1');rect(q,x+2,y+2,6,1,'rgba(96,60,38,.28)')}}
    else if(kind==='rubble'){for(let i=0;i<8;i++){const x=7+(h+i*9)%34,y=27+((h>>>i)%10);rect(q,x,y,3+(i%4),2+(i&1),pick(['#594539','#6e5849','#806a57'],h,i))}}
    else if(kind==='bones'){rect(q,10,30,28,4,'#c6b89d');rect(q,15,22,4,13,'#d8cbb2');rect(q,28,20,4,15,'#d8cbb2');rect(q,8,25,10,4,'#d8cbb2');rect(q,30,31,10,4,'#d8cbb2')}
    if(flip){const f=hc(),fq=ctx2(f);fq.translate(48,0);fq.scale(-1,1);fq.drawImage(c,0,0);HI_CACHE.decor.set(key,f);return f}
    HI_CACHE.decor.set(key,c);return c;
  }
/* ===== MANRU v4.2 CLEAN-SCOPE + TRUE 2.5D ARCHITECTURE ===== */
const wallPalette=[
    {top:'#7b4434',face:'#4b221b',dark:'#27110d',edge:'#b06748',side:'#351712',floor:'#321c13'},
    {top:'#637368',face:'#3b4c42',dark:'#202b26',edge:'#9aad9d',side:'#2a3831',floor:'#1b2c26'},
    {top:'#72526f',face:'#472f47',dark:'#271928',edge:'#b879a5',side:'#332033',floor:'#2b1a2c'},
    {top:'#756050',face:'#493a30',dark:'#261e19',edge:'#a98668',side:'#342920',floor:'#2b2019'},
    {top:'#8c7138',face:'#584621',dark:'#2b220f',edge:'#d1ad58',side:'#403417',floor:'#261d11'}
  ];
  const isWall=(x,y)=>state?.map?.[y]?.[x]===TT.WALL;
/* ===== MANRU v4.7 CAMERA / PERF / LOOT STRATEGY ===== */
const P47={lastDraw:0,lastMini:0,lastHud:0,lastViewport:0,lastLoop:0,lastTune:0,frameEMA:18,renderDpr:1,cullKey:'',cullSeen:new Set(),decorKey:'',cullDecor:null,force:true};
  const titleSceneState49={sky:null,windows:null,background:null,clouds:[],rooms:[],snapshot:null};
  function mobileDpr49(){return isMobileViewport()?1:Math.min(1.5,Math.max(1,window.devicePixelRatio||1))}
  function onFloorGenerated56(){ensureKnowledge56();decorateAllItems56();contextualRewards56();decorateAllItems56();state.roomHints56={};if(typeof vfBuildDecor==='function')vfBuildDecor()}
  function inB58(o,b,p=1){return o&&o.x>=b.x0-p&&o.x<=b.x1+p&&o.y>=b.y0-p&&o.y<=b.y1+p}
  function screenMark58(x,y,cam,color){
    const q=globalThis.__MANRU_CAMERA_PROJECTION12__.tileCenter(x,y,cam),sx=q.x,sy=q.y,s=q.s;
    X.strokeStyle=color;X.lineWidth=1.5;X.strokeRect(sx-s*.38,sy-s*.38,s*.76,s*.76);
  }
  function activateFloor23Switch60(sw){
    if(sw?.kind==='branch-reveal')return materializeFloor23Reveal60(sw);
    if(state.floor!==23||!['f23-center','f23-reveal'].includes(sw?.kind))return{handled:false};if(sw.kind==='f23-reveal')return materializeFloor23Reveal60(sw);if(sw.used)return{handled:true,changed:false};const q=state.floor23,control=(q?.controls||[]).find(c=>c.switchId===sw.id);sw.used=true;
    if(control){for(const ch of control.changes||[]){const rr=RuntimeTerrainOwner.mutate(ch.x,ch.y,ch.after,{source:`f23-${control.type}`});if(!rr.ok)throw new Error(`F23 hydraulic mutation failed ${ch.x},${ch.y}:${rr.reason}`)}control.activated=true;const h=control.hydraulic||{},parts=[];if(h.drain)parts.push(`배수 ${h.drain}칸`);if(h.flood)parts.push(`전환 범람 ${h.flood}칸`);if(h.bridge)parts.push(`교량/수문 ${h.bridge}칸 개방`);addLog(`${control.label} 작동 · ${parts.join(' / ')||'수로 상태 변경'}.`);for(const ch of (control.changes||[]).filter((_,i)=>i%Math.max(1,Math.floor((control.changes||[]).length/6))===0).slice(0,6))impact(ch.x,ch.y,ch.after===TT.MERCURY?'#a9dbe0':'#d8d4a8',2)}
    impact(sw.x,sw.y,'#d6d8bf',4);const all=(q?.switchIds||[]).every(id=>state.switches?.find(v=>v.id===id)?.used);if(all&&!q.centerUnlocked){q.centerUnlocked=true;syncFloor23Gate60();addLog('네 수문 계통이 동시에 감압되며 중앙 수은호 봉쇄가 내려갔다.');toast('중앙 수문 완전 개방');burst(sw.x,sw.y,'#d8f2ef',20,1)}else if(!control)addLog('수은 관리 스위치를 작동시켰다.');VisibilityService.compute();updateAll();return{handled:true,changed:true,control:control?.type||null,centerUnlocked:!!q?.centerUnlocked}
  }
  function feeling62(){return state?.floorFeeling62||null}
  /* ---------- performance coordinator: no viewport sync every RAF ---------- */
  function active70(){
    return !!(performance.now()<structureMotionUntil||performance.now()<forcedMotionUntil||MINE_FX.some(f=>f.map===state?.map&&f.path?.length&&performance.now()-f.start<640)||globalThis.__MANRU_CAMERA_STATE12__?.isCoasting?.()||FX.transition||FX.floats?.length||FX.particles?.length||FX.slashes?.length||FX.rings?.length||FX.projectiles?.length||FX.doors?.length||VIS.autoPath?.length||
      actionPresentationBusy58()||(FX.terrainReactions105||[]).some(f=>f.map===state?.map&&performance.now()-f.start<f.life)||performance.now()-RC.lastActionAt<850||Math.abs((VIS.playerX??0)-(state?.player?.x??0))>.01||Math.abs((VIS.playerY??0)-(state?.player?.y??0))>.01);
  }
  // The title art is drawn once into canvases (drawTitleCanvas) and the class screen keeps cached actor art: a phone browser can drop
  // those pixels while the page is hidden, so the first resume after that redraws them, wherever the player is now (the title is
  // under the game and comes back after a run ends). Clearing the actor art also rebuilds the class roster.
  let pageWasHidden=false; // set while the page is hidden (or restored from the back-forward cache): its canvases may have lost their pixels
  function restoreTitleScreen(){
    try{globalThis.__MANRU_ACTOR_ART__?.clear?.()}catch(error){ignoreError('actor art clear',error)}
    drawTitleCanvas();
  }
  function resume71(reason='resume',attempt=0){
    try{
      if(!C||!X||document.hidden)return false;
      if(pageWasHidden){pageWasHidden=false;restoreTitleScreen()}
      if(!state)return true;
      recovery71.attempts++;recovery71.last={reason,attempt,ok:false,at:Date.now()};
      if(X.isContextLost?.())throw Error('main canvas context lost');
      // Android can keep JS Canvas objects while discarding their backing pixels. Invalidate all
      // offscreen actor canvases so the player/monster sprites are rebuilt from drawing commands.
      try{window.__MANRU_ACTOR_CACHE1011__?.clear?.()}catch(error){ignoreError('actor cache clear',error)}
      try{globalThis.__MANRU_ACTOR_ART__?.clear?.()}catch(error){ignoreError('actor art clear',error)}
      try{window.__MANRU_ITEM_ART_R7__?.clear?.()}catch(error){ignoreError('item art clear',error)}
      try{window.__MANRU_CLEAR_HI_CACHE__?.()}catch(error){ignoreError('hi-res cache clear',error)}
      globalThis.__MANRU_LEGEND_TERRAIN47__?.clear?.();
      // Mobile browsers may discard offscreen canvas pixels without discarding
      // the canvas objects. Branch, dojo and mine tiles share these caches.
      BRANCH_TILE_CACHE.clear();
      MINE_CANVAS.clear();
      C.width=C.width;MC.width=MC.width;
      FX.transition=null;FX.flashUntil=0;FX.shakeUntil=0;FX.frameNow=performance.now();
      for(const key of ['floats','particles','slashes','rings','projectiles','doors'])if(Array.isArray(FX[key]))FX[key].length=0;
      Object.assign(ACTION_PRESENTATION58,{run:null,until:0,start:0,inputUntil:0,pending:false,kind:null});
      resetVisualState();clearHeldInput53();cancelAutoWalk();
      if(reason!=='fullscreen'&&fullscreenWanted66&&!document.fullscreenElement)requestGameFullscreen65();
      // Reset only renderer/session-local transients; no gameplay turn or legitimate status changes.
      state.playerHitUntil=0;state.playerAttackUntil=0;state.attackUntil=0;state.evadeUntil=0;
      if(state.player){state.player.nextAttackAt=0;state.player.busyUntil=0}
      for(const m of state.monsters||[]){m.hitUntil=0;m.evadeUntil=0;m.attackUntil=0;delete m.attackTarget;delete m.hitDir}
      // Do not trust canvas drawing state after a surface restore.
      try{X.globalAlpha=1;X.globalCompositeOperation='source-over';X.imageSmoothingEnabled=false;X.shadowBlur=0;X.shadowColor='rgba(0,0,0,0)';X.filter='none'}catch(error){ignoreError('canvas state reset',error)}
      try{syncGameViewport()}catch(error){ignoreError('viewport sync',error)}
      try{X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over';X.filter='none';X.fillStyle='#0b0704';X.fillRect(0,0,VIEW.w,VIEW.h)}catch(error){ignoreError('clear frame',error)}
      VIS.playerX=state.player.x;VIS.playerY=state.player.y;VIS.camInit=false;
      try{globalThis.__MANRU_CAMERA_STATE12__?.resume(true)}catch(error){ignoreError('camera resume',error)}
      try{VisibilityService.compute()}catch(error){ignoreError('visibility recompute',error)}
      try{updatePanels()}catch(error){ignoreError('panel refresh',error)}
      if(drawMap(true)===false)throw Error('main canvas paint refused');
      drawMinimap(true);
      debugBattleRender57(true,performance.now(),true);
      try{updateAttackButton()}catch(error){ignoreError('attack button refresh',error)}
      if(FX?.transition)FX.transition=null;
      recovery71.last={reason,attempt,ok:true,at:Date.now(),width:C.width,height:C.height};
      return true;
    }catch(err){
      recovery71.failures++;recovery71.last={reason,attempt,ok:false,at:Date.now(),error:String(err)};
      console.warn('[MANRU resume recovery]',reason,err);
      if(attempt<3&&!document.hidden){clearTimeout(resumeTimer71);resumeTimer71=setTimeout(()=>resume71(reason,attempt+1),100*(attempt+1))}
      return false;
    }
  }
  function finishSpecialArchitecture88(){
    if(!state)return;
    if(state.specialFloor){cleanupMap85();if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();VisibilityService.compute();vfBuildDecor();pruneDecor85();return}
    if(!NORMAL85.has(state.floor))return;
    scrubNormal88();
    normalizeDoors86();
    // Decorate only after every old generation pass has finished, so nothing can randomly overwrite the composition.
    themeDecor88(regionIndex());
    autoWindows86();
    const path=ReachabilityService.architectureMainPath({key85,in85});if(path.length)strategicPlacement85(path);
    ensureNormalConnectivity();normalizeDoors86();sanitizeWindows88();
    if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();
    VisibilityService.compute();vfBuildDecor();state.decor=[];harmonizeDecor86();
  }
  // Floor readability: one calm base hue per region, with only very low-contrast 2x2 variation.
  const FLOOR91=[
    {floor:'#33201b',alt:'#37231d',fog:'#0d0705'},
    {floor:'#29352f',alt:'#303e36',fog:'#0a0f0c'},
    {floor:'#302131',alt:'#342435',fog:'#0b070c'},
    {floor:'#30302e',alt:'#343432',fog:'#090908'},
    {floor:'#27251f',alt:'#2b2922',fog:'#070705'}
  ];
  const FX965={pulse:null};
  function key972(x,y){ return `${x},${y}`; }
  const WorldHitTest12=Object.freeze({
    cellAtClient(clientX,clientY,{camera=CameraProjection.current(),allowOutside=false}={}){const p=CameraProjection.clientToViewport(clientX,clientY);if(!p||(!allowOutside&&(clientX<p.rect.left||clientX>p.rect.right||clientY<p.rect.top||clientY>p.rect.bottom)))return null;const w=CameraProjection.viewportToWorld(p.x,p.y,camera),cell={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)};return allowOutside||cell.x>=0&&cell.y>=0&&cell.x<COLS&&cell.y<ROWS?cell:null},
    nearestCell(clientX,clientY,{radius=2,predicate=()=>true,camera=CameraProjection.current(),thresholdTiles=.92}={}){const q=WorldHitTest12.cellAtClient(clientX,clientY,{camera});if(!q)return null;const p=CameraProjection.clientToViewport(clientX,clientY);let best=null,distance=Infinity;for(let y=Math.max(0,q.y-radius);y<=Math.min(ROWS-1,q.y+radius);y++)for(let x=Math.max(0,q.x-radius);x<=Math.min(COLS-1,q.x+radius);x++){if(!predicate(x,y))continue;const c=CameraProjection.tileCenter(x,y,camera),d=Math.hypot(p.x-c.x,p.y-c.y);if(d<distance){distance=d;best={x,y}}}return best&&distance<TILE*camera.zoom*thresholdTiles?best:(predicate(q.x,q.y)?q:null)}
  });
    function choose1004(item,pal){return pal[hash1004(item?.name||item?.type||'')%pal.length]}
    function px1004(q,x,y,col){q.fillStyle=col;q.fillRect(x,y,1,1)}
const keyMeta1006=id=>KEY_META1006[id]||KEY_META1006.iron;
function floorSurfaceBlend1025(px,py,x,y,ctx=X){const t=terrainBaseTile58(x,y);
  // floor-to-floor and water-to-land blending, wider but lower alpha to avoid hard bands.
  let painted=false;const blend=(dir,col,w,a)=>{painted=true;const C=rgb1020(col),st=`rgba(${C[0]},${C[1]},${C[2]},`;let g;if(dir==='L')g=ctx.createLinearGradient(px,py,px+w,py);else if(dir==='R')g=ctx.createLinearGradient(px+32,py,px+32-w,py);else if(dir==='U')g=ctx.createLinearGradient(px,py,px,py+w);else g=ctx.createLinearGradient(px,py+32,px,py+32-w);g.addColorStop(0,st+a+')');g.addColorStop(1,st+'0)');ctx.fillStyle=g;if(dir==='L')ctx.fillRect(px,py,w,32);else if(dir==='R')ctx.fillRect(px+32-w,py,w,32);else if(dir==='U')ctx.fillRect(px,py,32,w);else ctx.fillRect(px,py+32-w,32,w)};
  if(GRAD_TERRAIN1025.has(t)&&!objectAt1025(x,y)){for(const[dx,dy,d]of[[-1,0,'L'],[1,0,'R'],[0,-1,'U'],[0,1,'D']]){const n=state.map[y+dy]?.[x+dx];if(n===TT.WATER||n===TT.MERCURY)blend(d,n===TT.WATER?'#3a7e86':'#93a8aa',20,.34);else if(GRAD_TERRAIN1025.has(n)&&!objectAt1025(x+dx,y+dy)&&n!==t){const pal=state.branchContext105?branchDistrictAt(x+dx,y+dy).floor:regionOfFloor()===4?'#9b8440':regionOfFloor()===1?'#536954':'#705b4e';blend(d,pal,11,.18)}}}
return painted;
}
function floorThemeOverlay1022(px,py,x,y,colors,vis){if(!state||!inside1020(x,y))return;const pat=state.floorPattern1022?.[K1020(x,y)],rug=state.rugPattern1022?.[K1020(x,y)];X.save();
  if(pat){X.globalAlpha=.12;X.lineWidth=1;if(pat.kind==='inn'){X.strokeStyle='#a6754a';if((pat.rx+pat.ry+pat.phase)%5===0)X.strokeRect(px+6.5,py+6.5,19,19)}else if(pat.kind==='garden'){X.strokeStyle='#76946c';if((pat.rx+pat.ry)%4===0){X.beginPath();X.arc(px+16,py+16,6,0,Math.PI*2);X.stroke()}}else if(pat.kind==='silk'){X.strokeStyle='#bd789f';if((pat.rx+pat.ry)%4===0){X.beginPath();X.moveTo(px+5,py+16);X.quadraticCurveTo(px+16,py+8,px+27,py+16);X.quadraticCurveTo(px+16,py+24,px+5,py+16);X.stroke()}}else if(pat.kind==='store'){X.strokeStyle='#929697';if((pat.rx+pat.ry)%5===0){X.strokeRect(px+5.5,py+5.5,21,21);X.beginPath();X.moveTo(px+16,py+6);X.lineTo(px+16,py+26);X.stroke()}}else{X.strokeStyle='#c8a647';if((pat.rx+pat.ry)%4===0){X.beginPath();X.moveTo(px+16,py+6);X.lineTo(px+26,py+16);X.lineTo(px+16,py+26);X.lineTo(px+6,py+16);X.closePath();X.stroke()}}X.globalAlpha=1}
  if(rug){const z=regionOfFloor(),pal=[['#5e261f','#c68c50'],['#314735','#879766'],['#542845','#bd789d'],['#383431','#9b6749'],['#302a1e','#c6a347']][z];X.globalAlpha=.52;X.fillStyle=pal[0];X.fillRect(px+1,py+1,30,30);X.strokeStyle=pal[1];X.lineWidth=1;if(rug.kind==='garden'){X.beginPath();X.arc(px+16,py+16,8,0,Math.PI*2);X.stroke();X.beginPath();X.moveTo(px+4,py+16);X.lineTo(px+28,py+16);X.stroke()}else if(rug.kind==='silk'||rug.kind==='gold'){X.beginPath();X.moveTo(px+16,py+5);X.lineTo(px+27,py+16);X.lineTo(px+16,py+27);X.lineTo(px+5,py+16);X.closePath();X.stroke()}else if(rug.kind==='store'){for(let yy=7;yy<28;yy+=6){X.beginPath();X.moveTo(px+5,py+yy);X.lineTo(px+27,py+yy);X.stroke()}for(let xx=7;xx<28;xx+=7){X.beginPath();X.moveTo(px+xx,py+5);X.lineTo(px+xx,py+27);X.stroke()}}else{X.strokeRect(px+5.5,py+5.5,21,21);X.strokeRect(px+9.5,py+9.5,13,13)}X.globalAlpha=1}
  X.restore();}
/* r52 authored room plans and local material detail; never a screen lighting filter. */
const SPECIAL_PLACES52={
 2:['문서 검문소','#454138','#74634a','#bd9e67',0],4:['삼중 병기고','#3d4448','#626d71','#bda276',1],5:['청풍 수문장 전당','#40484a','#6f7771','#c6b68b',2],6:['수중 대도서관','#34463f','#68755d','#d4bc81',3],8:['곡수원 다실','#3e5043','#697963','#d3b18b',4],10:['수묵 관측정','#34494b','#758380','#b1d2c8',5],11:['비단 접견각','#453b43','#7b6467','#d2ac91',6],13:['밀약 기록실','#3d3540','#6c5a71','#c6a3b7',7],15:['몽유 제례실','#493d47','#7e6378','#dab8bc',8],16:['전선 공병창','#3d4548','#6b7679','#c9b27e',9],18:['철쇄 배급소','#3f4145','#6d6964','#c29d77',10],20:['지하 지휘소','#403d38','#74695b','#dfb278',11],21:['공허 측량소','#383f49','#737c8b','#c0c9dd',12],22:['황금 성문 회당','#46443b','#7e7861','#d6c08c',13],23:['금맥 세공실','#454139','#7b7060','#d6b880',14],24:['왕실 원예당','#3c4b3d','#76866b','#dfc99c',15],25:['만루 심장 제의랑','#3d4045','#767776','#dacba7',16]
};
const r1012=(q,x,y,w,h,c,o=true)=>{if(o){q.fillStyle=ACTOR_OUTLINE;q.fillRect(x-1,y-1,w+2,h+2)}q.fillStyle=c;q.fillRect(x,y,w,h)};
const eye1012=(q,x,y,c='#f5dc9a')=>{q.fillStyle=ACTOR_OUTLINE;q.fillRect(x-1,y-1,3,3);q.fillStyle=c;q.fillRect(x,y,1,1)};
const shadow1012=(q,x=16,y=32,w=14)=>{q.fillStyle='rgba(0,0,0,.42)';q.fillRect(x-Math.floor(w/2),y,w,2);q.fillStyle='rgba(0,0,0,.22)';q.fillRect(x-Math.floor(w/2)+2,y+2,w-4,1)};
/* R9 actor drawing primitives.  Deliberately no shared humanoid body template: each human silhouette below owns its posture/proportions. */
/* R11 selective sprite update: retain crocodile, Yeoui water dragon, paper tiger and humanoid artillery treatment; all other overhaul archetypes use the prior canonical sprites. */
function eR9(q,x,y,rx,ry,fill,stroke=ACTOR_OUTLINE,lw=1){q.beginPath();q.ellipse(x,y,rx,ry,0,0,Math.PI*2);q.fillStyle=fill;q.fill();if(stroke){q.strokeStyle=stroke;q.lineWidth=lw;q.stroke()}}
function pR9(q,fill,pts,stroke=ACTOR_OUTLINE,lw=1){q.beginPath();q.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)q.lineTo(pts[i][0],pts[i][1]);q.closePath();q.fillStyle=fill;q.fill();if(stroke){q.strokeStyle=stroke;q.lineWidth=lw;q.stroke()}}
function lR9(q,x1,y1,x2,y2,c,w=1){q.strokeStyle=c;q.lineWidth=w;q.lineCap='round';q.beginPath();q.moveTo(x1,y1);q.lineTo(x2,y2);q.stroke();q.lineCap='butt'}
function glowR9(q,x,y,r,c){const g=q.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=g;q.beginPath();q.arc(x,y,r,0,Math.PI*2);q.fill()}
function eyePairR9(q,x1,x2,y,c){eR9(q,x1,y,1.2,1.1,c,null);eR9(q,x2,y,1.2,1.1,c,null)}
function bootR9(q,x,y,w=5){pR9(q,ACTOR_INK,[[x,y],[x+w,y],[x+w+1,y+4],[x-1,y+4]],null)}
const W=48,H=48,CACHE=new Map(),DATA=new Map(),WEAPON_ASSETS=new Map(),PICTURE_ASSETS=new Map();
const cv=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const q=c.getContext('2d');q.imageSmoothingEnabled=false;return[c,q]};
const rect=(q,x,y,w,h,c)=>{q.fillStyle=c;q.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const itemArtDot=(q,x,y,c)=>rect(q,x,y,1,1,c);
const line=(q,x1,y1,x2,y2,c,w=1)=>{q.strokeStyle='#15100d';q.lineWidth=w+2;q.beginPath();q.moveTo(x1+.5,y1+.5);q.lineTo(x2+.5,y2+.5);q.stroke();q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.moveTo(x1+.5,y1+.5);q.lineTo(x2+.5,y2+.5);q.stroke();q.lineWidth=1};
const poly=(q,c,pts)=>{q.fillStyle=c;q.beginPath();q.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)q.lineTo(pts[i][0],pts[i][1]);q.closePath();q.fill()};
const ell=(q,c,x,y,rx,ry)=>{q.fillStyle=c;q.beginPath();q.ellipse(x,y,rx,ry,0,0,Math.PI*2);q.fill()};
const hash=s=>{let h=2166136261>>>0;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const shade=(hex,d)=>{const m=String(hex||'#888').match(/^#?([0-9a-f]{6})$/i);if(!m)return hex;let n=parseInt(m[1],16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=Math.max(0,Math.min(255,r+d));g=Math.max(0,Math.min(255,g+d));b=Math.max(0,Math.min(255,b+d));return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')};
const outlineRect=(q,x,y,w,h,c)=>{rect(q,x-1,y-1,w+2,h+2,'#17110e');rect(q,x,y,w,h,c)};
function weaponAsset(item){
  const it={...item,type:'weapon'},key=KEY(it);if(WEAPON_ASSETS.has(key))return WEAPON_ASSETS.get(key);
  const [canvas,q]=cv();drawWeapon(q,it);
  const st=WEAPON_STYLE[it.name]||it.kind||'blade',id=it.artifactId46||'',ranged=it.kind==='bow',paired=it.kind==='brawl'||st==='iron_gauntlet'||id==='earth_gauntlet';
  const turn=(x,y,dx,dy,a)=>({x:x+dx*Math.cos(a)-dy*Math.sin(a),y:y+dx*Math.sin(a)+dy*Math.cos(a)});
  let grip,axis,size=it.kind==='spear'?26:ranged?18:it.kind==='blunt'?22:st.includes('dagger')||st==='assassin'?17:23;
  if(ranged){grip=id==='water_crossbow'?{x:23,y:34}:id==='lava_bow'?{x:39,y:24}:turn(24,24,-6.5,0,-.3);axis=id==='lava_bow'?Math.PI:id==='water_crossbow'?0:-.3;}
  else if(id){const layouts={ember_axe:[17,34,28,13],thunder_spear:[16,36,34,4],curse_blade:[16,37,28,7],mirror_blade:[16,37,28,6],curse_spear:[16,36,34,5],chain_sickle:[17,34,27,8],ward_hammer:[18,33,24,13]},v=layouts[id]||[24,35,24,8];grip={x:v[0],y:v[1]};axis=Math.atan2(v[3]-v[1],v[2]-v[0]);}
  else if(it.kind==='spear'){grip=turn(23,25,0,8,.28);axis=-Math.PI/2+.28;}
  else if(it.kind==='blunt'){grip=turn(23,26,0,12,.25);axis=-Math.PI/2+.25;}
  else{grip=turn(st==='royal_sword'?22:23,st==='royal_sword'?30:29,0,8,.35);axis=-Math.PI/2+.35;}
  const bounds=c=>{const d=c.getContext('2d').getImageData(0,0,W,H).data;let x=W,y=H,right=0,bottom=0;for(let v=0;v<H;v++)for(let u=0;u<W;u++)if(d[(v*W+u)*4+3]>8){x=Math.min(x,u);y=Math.min(y,v);right=Math.max(right,u+1);bottom=Math.max(bottom,v+1)}return{x,y,right,bottom}};
  const out={key,canvas,grip,axis,size,ranged,bounds:bounds(canvas)};
  if(paired){out.size=12;out.parts=[[0,24,14,25,-.2],[24,24,33,23,.2]].map(([x,width,gx,gy,angle])=>{const [c,t]=cv();t.drawImage(canvas,x,0,width,H,x,0,width,H);return{canvas:c,grip:{x:gx,y:gy},axis:-Math.PI/2+angle,bounds:bounds(c)}});}
  WEAPON_ASSETS.set(key,out);return out;
}
function data(it){const key='d:'+KEY(it);if(DATA.has(key))return DATA.get(key);const d=sprite(it).toDataURL('image/png');DATA.set(key,d);return d}
function hash49(x,y){let h=Math.imul(x+317,374761393)^Math.imul(y+113,668265263);h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0}
function shade49(hex,n){const a=hex.replace('#','');return'#'+[0,2,4].map(i=>Math.max(0,Math.min(255,parseInt(a.slice(i,i+2),16)+n)).toString(16).padStart(2,'0')).join('')}
function grain49(q,w,h,col,seed=0,n=80){for(let i=0;i<n;i++){const v=hash49(i,seed);q.fillStyle=i%2?shade49(col,10):shade49(col,-12);q.globalAlpha=.32;q.fillRect(v%w,(v>>>10)%h,1+(v%3===0),1)}q.globalAlpha=1}
function stroke49(q,c,points,width=1){q.strokeStyle=c;q.lineWidth=width;q.beginPath();q.moveTo(...points[0]);for(const p of points.slice(1))q.lineTo(...p);q.stroke()}
function ring49(q,c,x,y,r,w=1){q.strokeStyle=c;q.lineWidth=w;q.beginPath();q.arc(x,y,r,0,Math.PI*2);q.stroke()}
function poly49(q,c,p){q.fillStyle=c;q.beginPath();q.moveTo(...p[0]);p.slice(1).forEach(x=>q.lineTo(...x));q.closePath();q.fill()}
function debugBattleCamera57(center=false){
 if(!DEBUG_BATTLE57.open)return;syncGameViewport();const cam=globalThis.__MANRU_CAMERA_STATE12__,value=Number(document.getElementById('battleZoom57').value);
 if(center){document.getElementById('battleFollow57').checked=true;if(value===0)cam.setZoom(Math.min(VIEW.w/(COLS*TILE),VIEW.h/(ROWS*TILE))/(isMobileViewport()?1.24:1.44));else cam.setZoom(value);cam.center();}
 else if(!document.getElementById('battleFollow57').checked&&cam.snapshot().mode!=='free')cam.beginInspect();
 DEBUG_BATTLE57.viewDirty=true;
}
const DEBUG_BATTLE57={open:false,playing:false,timer:null,previous:null,roster:[],catalog:[],round:0,winner:null,serial:0};
function debugBattleZoom57(value,anchor=null){syncGameViewport();if(value===0)value=Math.min(VIEW.w/(COLS*TILE),VIEW.h/(ROWS*TILE))/(isMobileViewport()?1.24:1.44);const cam=globalThis.__MANRU_CAMERA_STATE12__;document.getElementById('battleFollow57').checked=false;cam.beginInspect();const zoom=cam.setZoom(value,false,anchor);for(const id of ['battleZoom57','battleWatchZoom57']){const select=document.getElementById(id);let option=select.querySelector('[data-custom]');if(!option){option=document.createElement('option');option.dataset.custom='1';select.append(option)}option.value=String(zoom);option.textContent=Math.round(zoom*100)+'%';select.value=String(zoom)}DEBUG_BATTLE57.viewDirty=true;debugBattleRender57(false);}
function debugBattleWatch57(){
 const b=DEBUG_BATTLE57;if(b.watching)return;debugBattleCancelGesture57();b.watching=true;document.getElementById('battleWatchViewport57').append(C);
 document.getElementById('debugBattle57').classList.add('watching57');document.getElementById('battleWatch57').hidden=false;document.getElementById('battleWatchSpeed57').value=document.getElementById('battleSpeed57').value;document.getElementById('battleWatchZoom57').value='1';debugBattleSubjects57();syncGameViewport();debugBattleZoom57(globalThis.__MANRU_CAMERA_STATE12__.desiredZoom());globalThis.__MANRU_CAMERA_STATE12__.center();document.getElementById('battleFollow57').checked=true;drawMap(true);debugBattleWatchHud57();
}
function openDebugBattle57(){
 const b=DEBUG_BATTLE57;if(b.open)return;const storyNote=interactionActive8('storyModal992')?RuntimeState.ui.storyNote:null;b.drag=null;closeGameplayInteractionState57({preserveProgress:true});MobileClient.cancelPhysical();OccupancyService.endShared();
 b.previous={state,storyNote,cols:COLS,rows:ROWS,camera:globalThis.__MANRU_CAMERA_STATE12__.capture(),visual:{...VIS},effects:{...FX},presentation:{...ACTION_PRESENTATION58},forcedMotion:forcedMotionUntil,structureMotion:structureMotionUntil,noise:noiseBudget,focus:document.activeElement,screen:currentScreen()};b.watching=false;b.open=true;b.mapTemplate=null;b.mapKey=null;b.mapSerial=0;b.canvasHome={parent:C.parentNode,next:C.nextSibling};document.getElementById('battleViewport57').append(C);
 // Detach every mutable effect collection before the arena can advance it.
 for(const key of Object.keys(FX))if(Array.isArray(FX[key]))FX[key]=[];FX.transition=null;noiseBudget=null;forcedMotionUntil=structureMotionUntil=0;Object.assign(ACTION_PRESENTATION58,{run:null,until:0,inputUntil:0,source:null,target:null});
 document.getElementById('debugBattle57').hidden=false;document.body.classList.add('debug-battle57');document.querySelector('#battleMap57 option[value=current]').disabled=!b.previous.state?.map?.length;
 try{b.catalog=debugBattleCatalog57();debugBattleFilter57();debugBattleRoster57();debugBattleCreateWorld57();document.getElementById('battleSearch57').focus();}
 catch(error){closeDebugBattle57();console.error('debug arena entry rejected',error);toast('전장을 열지 못했다.');return false;}return true;
}
function closeDebugBattle57(){
 const b=DEBUG_BATTLE57;if(!b.open)return;const previous=b.previous;debugBattlePause57();MobileClient.cancelPhysical();const viewport=document.getElementById('battleViewport57');if(b.drag&&viewport?.hasPointerCapture?.(b.drag.id))viewport.releasePointerCapture(b.drag.id);
 debugBattleCancelGesture57();closeInspect();if(b.canvasHome){const home=b.canvasHome;b.watching=false;home.parent.insertBefore(C,home.next?.parentNode===home.parent?home.next:null);b.canvasHome=null;}
 OccupancyService.endShared();state=previous.state;COLS=previous.cols;ROWS=previous.rows;
 for(const key of Object.keys(VIS))if(!(key in previous.visual))delete VIS[key];Object.assign(VIS,previous.visual);
 for(const key of Object.keys(FX))if(!(key in previous.effects))delete FX[key];Object.assign(FX,previous.effects);Object.assign(ACTION_PRESENTATION58,previous.presentation);forcedMotionUntil=previous.forcedMotion;structureMotionUntil=previous.structureMotion;noiseBudget=previous.noise;
 b.previous=null;b.open=false;b.watching=false;b.mapTemplate=null;b.overviewMap=null;b.overviewCanvas=null;b.rooms=null;b.spawnAnchors=null;b.motionFrom=null;b.motionComplete=true;b.canvasHome=null;b.drag=null;
 const panel=document.getElementById('debugBattle57');panel.hidden=true;panel.classList.remove('watching57');document.getElementById('battleWatch57').hidden=true;document.body.classList.remove('debug-battle57');
 syncGameViewport();globalThis.__MANRU_CAMERA_STATE12__.restore(previous.camera);globalThis.__MANRU_RENDER47__?.invalidate?.();renderUpdatePending=cameraRenderPending=true;if(state&&runState57()==='playing')updateAll(true);
 (previous.focus?.isConnected?previous.focus:document.getElementById('enterBtn'))?.focus();if(previous.storyNote&&previous.screen==='game')globalThis.__MANRU_STORY992__?.open(previous.storyNote);return true;
}
function normalizeHealthState58(run){
  if(!run)return;
  for(const e of [run.player,...(run.monsters||[])]){
    if(!e)continue;
    if(Number.isFinite(e.maxHp))e.maxHp=Math.max(1,Math.round(e.maxHp));
    if(Number.isFinite(e.hp))e.hp=Math.min(e.maxHp??Infinity,e.hp>0?Math.max(1,Math.round(e.hp)):0);
  }
  if(Array.isArray(run.log))run.log=run.log.map(displayCombatText58);
}
function resetVisualState(){if(!state)return;const now=performance.now();VIS.playerX=state.player.x;VIS.playerY=state.player.y;VIS.last=now;VIS.forced105=null;forcedMotionUntil=0;VIS.camInit=false;for(const m of state.monsters||[])MON_VIS.set(m,{x:m.x,y:m.y,last:now})}
function jarContents105(x,y){return regionIndex()===3?'poison':['water','oil','poison','wine'][Math.floor(hash2(x,y,state.floor+4105)*4)%4]}
// Presentation-only displacement, owned by the current map; never serialized.
const STRUCTURE_MOTION105=new WeakMap();
function writeLogLine(msg){
  if(!state) return;
  state.log.unshift(displayText53(displayCombatText58(msg)));
  state.log = state.log.slice(0, 18);
}
function rollbackFloorColors971(){
    if(!state)return 0;
    // Authored late-game special floors own their material map. Recoloring them here destroys
    // producer-authored wood/stone zoning and used to leave furniture underlays out of sync.
    if(state.specialFloor&&[23,24].includes(state.floor)){state.floorColorRollback971=0;return 0}
    let n=0;const legacy=new Set([TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR]),layers=terrainMapLayers58(state.map);
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const key=k(x,y),top=state.map[y][x],under=layers.underlay[key];
      if(legacy.has(top)||legacy.has(under)){const before=terrainBaseTile58(x,y);setTerrainSurface65(state.map,x,y,TT.FLOOR);if(terrainBaseTile58(x,y)!==before)n++}
    }
    state.floorColorRollback971=n;return n;
  }
function v10DrawPath(path,strong=false){if(!path?.length)return;const cam=globalThis.__MANRU_CAMERA_PROJECTION12__.current();X.save();X.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);X.translate(cam.x,cam.y);X.scale(cam.zoom,cam.zoom);X.lineJoin='round';X.lineCap='round';X.strokeStyle=strong?'rgba(236,190,94,.78)':'rgba(216,224,229,.34)';X.lineWidth=strong?2.4:1.6;X.beginPath();X.moveTo(VIS.playerX*TILE+16,VIS.playerY*TILE+16);for(const q of path)X.lineTo(q.x*TILE+16,q.y*TILE+16);X.stroke();for(let i=0;i<path.length;i++){const q=path[i];X.fillStyle=strong?'rgba(237,190,91,.72)':'rgba(220,229,234,.48)';X.fillRect(q.x*TILE+14,q.y*TILE+14,4,4)}X.restore()}
  const HI_CACHE={floor:new Map(),wall:new Map(),terrain:new Map(),decor:new Map(),creature:new Map()};
  const ctx2=c=>{const q=c.getContext('2d');q.imageSmoothingEnabled=false;return q};
  const hiHash=(s)=>{let h=2166136261>>>0;for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  function organicNooks43(){
    if(!state||state.specialFloor)return;
    const featureKeys=new Set((state.featureRooms||[]).map(r=>`${r.x},${r.y},${r.w},${r.h}`));
    for(const r of state.rooms||[]){
      if(r.w<7||r.h<7||featureKeys.has(`${r.x},${r.y},${r.w},${r.h}`))continue;
      if((state.player.x>=r.x&&state.player.x<r.x+r.w&&state.player.y>=r.y&&state.player.y<r.y+r.h)||(state.stairs.x>=r.x&&state.stairs.x<r.x+r.w&&state.stairs.y>=r.y&&state.stairs.y<r.y+r.h))continue;
      const m=Math.floor(hash2(r.x,r.y,8700+state.floor*43)*4),cx=r.cx,cy=r.cy;
      if(m===0){ // chamfer all corners
        for(const [x,y] of [[r.x+1,r.y+1],[r.x+r.w-2,r.y+1],[r.x+1,r.y+r.h-2],[r.x+r.w-2,r.y+r.h-2]])setTerrainTile58(state.map,x,y,TT.WALL);
      }else if(m===1&&r.w>=9){ // paired internal buttresses
        for(const y of [r.y+2,r.y+r.h-3]){setTerrainTile58(state.map,cx-2,y,TT.WALL);setTerrainTile58(state.map,cx+2,y,TT.WALL)}
      }else if(m===2&&r.h>=9){ // one asymmetric alcove
        const side=(hash2(r.x,r.y,8711)>.5)?r.x+2:r.x+r.w-3;for(let y=r.y+2;y<=r.y+r.h-4;y++)if(Math.abs(y-cy)>1)setTerrainTile58(state.map,side,y,TT.WALL);
      }else if(m===3&&r.w>=10&&r.h>=8){ // shallow stage / nook
        const y=r.y+2;for(let x=r.x+2;x<=r.x+r.w-3;x++)if(Math.abs(x-cx)>2)setTerrainTile58(state.map,x,y,TT.WALL);
      }
    }
  }
  function pauseAutoForUI(){
    if(!state)return;
    if(!UX.paused && VIS.autoPath?.length){
      UX.paused={path:VIS.autoPath.map(q=>({...q})),meta:{...(UX.autoMeta||{})},turn:state.turn,x:state.player.x,y:state.player.y};
      UX.modalDirty=false;
    }
    cancelAutoWalk();
  }
  const ART60={
    2:{floor:'#4b1715',floorAlt:'#62201b',wall:'#8a382a',wallDark:'#2a0908',accent:'#f0a05c',light:'#ffd58a',fog:'#0d0203',tint:'rgba(148,38,27,.32)',glow:'rgba(255,171,92,.10)'},
    4:{floor:'#302034',floorAlt:'#402847',wall:'#71436f',wallDark:'#1b111f',accent:'#d7a3e1',light:'#f4d7ff',fog:'#09050d',tint:'rgba(95,48,112,.30)',glow:'rgba(230,171,244,.09)'},
    5:{floor:'#481411',floorAlt:'#5e1d17',wall:'#873225',wallDark:'#260806',accent:'#ef8e51',light:'#ffd28b',fog:'#0d0202',tint:'rgba(140,32,22,.33)',glow:'rgba(255,154,73,.10)'},
    6:{floor:'#26383a',floorAlt:'#304847',wall:'#52645d',wallDark:'#182522',accent:'#8da78d',light:'#d4d0ae',fog:'#0a1110',tint:'rgba(45,72,67,.20)',glow:'rgba(177,194,166,.055)'},
    8:{floor:'#293729',floorAlt:'#344630',wall:'#53644d',wallDark:'#172119',accent:'#91a56f',light:'#d8d2a7',fog:'#0a0f0a',tint:'rgba(58,78,55,.18)',glow:'rgba(185,194,151,.05)'},
    10:{floor:'#24363b',floorAlt:'#2d4548',wall:'#4c625f',wallDark:'#162528',accent:'#88a8a0',light:'#d0d3b8',fog:'#091114',tint:'rgba(44,70,73,.20)',glow:'rgba(171,193,185,.05)'},
    11:{floor:'#3c213c',floorAlt:'#4e2c50',wall:'#754a70',wallDark:'#1c0f1d',accent:'#ef94cf',light:'#ffd8f0',fog:'#0b050d',tint:'rgba(112,49,107,.30)',glow:'rgba(244,129,205,.09)'},
    13:{floor:'#321b38',floorAlt:'#46234d',wall:'#774977',wallDark:'#1a0d1d',accent:'#e084c2',light:'#ffd1ec',fog:'#09040c',tint:'rgba(99,42,106,.30)',glow:'rgba(226,111,190,.09)'},
    15:{floor:'#35172f',floorAlt:'#4b2040',wall:'#824a73',wallDark:'#190b17',accent:'#ef82b5',light:'#ffd1e7',fog:'#090309',tint:'rgba(110,38,87,.32)',glow:'rgba(242,102,171,.10)'},
    16:{floor:'#454b50',floorAlt:'#555d63',wall:'#777f86',wallDark:'#1b2024',accent:'#e77e3e',light:'#e6d4ba',fog:'#080a0b',tint:'rgba(82,89,94,.20)',glow:'rgba(218,224,227,.07)'},
    18:{floor:'#303940',floorAlt:'#3e4a52',wall:'#65717a',wallDark:'#151b20',accent:'#c88351',light:'#d6c3a7',fog:'#080b0d',tint:'rgba(62,75,83,.26)',glow:'rgba(206,221,226,.06)'},
    20:{floor:'#2d2928',floorAlt:'#3a3331',wall:'#6d5c56',wallDark:'#171212',accent:'#cf5b4c',light:'#f0b395',fog:'#080606',tint:'rgba(73,61,58,.32)',glow:'rgba(202,76,58,.09)'},
    21:{floor:'#161a35',floorAlt:'#20294c',wall:'#535f91',wallDark:'#070a18',accent:'#52e1df',light:'#c2ffff',fog:'#01030a',tint:'rgba(31,43,104,.34)',glow:'rgba(67,229,226,.13)'},
    22:{floor:'#62635a',floorAlt:'#74766a',wall:'#97998c',wallDark:'#292b27',accent:'#59c9bc',light:'#fff0c8',fog:'#0a0c0b',tint:'rgba(137,139,128,.18)',glow:'rgba(103,218,204,.08)'},
    23:{floor:'#354550',floorAlt:'#49606d',wall:'#718894',wallDark:'#121b21',accent:'#d5fbff',light:'#ffffff',fog:'#050a0e',tint:'rgba(70,102,117,.28)',glow:'rgba(201,248,255,.12)'},
    24:{floor:'#2f6a38',floorAlt:'#67a943',wall:'#5d7e54',wallDark:'#102015',accent:'#ff86b5',light:'#f5ff9f',fog:'#061008',tint:'rgba(70,148,61,.20)',glow:'rgba(194,255,104,.10)'},
    25:{floor:'#12142a',floorAlt:'#1b1c39',wall:'#4c4a78',wallDark:'#080914',accent:'#f0c44f',light:'#fff1a4',fog:'#020208',tint:'rgba(31,30,90,.40)',glow:'rgba(238,187,62,.12)'}
  };
  function qaHash60(){
    let h=2166136261>>>0;const mix=v=>{h^=(+v||0)&255;h=Math.imul(h,16777619)>>>0};
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const v=state.map[y][x]||0;mix(v);mix(v>>>8)}
    return h.toString(16).padStart(8,'0');
  }
  function qaSummary60(){
    if(!state)return null;
    return{floor:state.floor,hash:qaHash60(),generationFailure:state.generationFinalKeyFailureR48||null,player:{x:state.player.x,y:state.player.y,hp:state.player.hp},stairs:{...state.stairs},
      f23:state.floor23?{switchIds:[...(state.floor23.switchIds||[])],centerUnlocked:!!state.floor23.centerUnlocked,keyAcquired:!!state.floor23.keyAcquired,thresholdTriggered:!!state.floor23.thresholdTriggered,reveal:state.floor23.reveal?{districtId:state.floor23.reveal.districtId,switchId:state.floor23.reveal.switchId,materialized:!!state.floor23.reveal.materialized,used:!!state.floor23.reveal.used,spawnBatches:state.floor23.reveal.spawnBatches||0}:null}:null,
      f24:state.floor24?{entranceKey:{...state.floor24.entranceKey},gateCells:(state.floor24.entranceGateCells||[]).map(c=>({...c})),protectedCount:(state.floor24.reinforcementProtectedCells||[]).length,cap:state.floor24.reinforcementCap57||3}:null};
  }
  function qaActivate23ById60(id){if(state.floor!==23)return{ok:false,reason:'not-f23'};const sw=(state.switches||[]).find(v=>v.id===id);if(!sw)return{ok:false,reason:'missing-switch',id};return{ok:true,result:activateFloor23Switch60(sw),used:!!sw.used,disabled:!!sw.disabled,hash:qaHash60()}}
  function qaRun23Order60(order,timing=-1){
    if(state.floor!==23)return{ok:false,reason:'not-f23'};if(qaSnapshot60&&!qaRestore60())return{ok:false,reason:'restore-failed'};
    const q=state.floor23,ids=[...(q.switchIds||[])],reveal=q.reveal?.switchId,seq=Array.isArray(order)&&order.length===ids.length?order:ids;
    const steps=[];for(let i=0;i<=seq.length;i++){if(i===timing&&reveal)steps.push({reveal:qaActivate23ById60(reveal)});if(i<seq.length)steps.push({normal:seq[i],out:qaActivate23ById60(seq[i])})}
    const v=validate23Progress60(),normalUsed=ids.every(id=>(state.switches||[]).find(sw=>sw.id===id)?.used),revealState=q.reveal?{materialized:!!q.reveal.materialized,spawnBatches:q.reveal.spawnBatches||0,disabled:!!(state.switches||[]).find(sw=>sw.id===q.reveal.switchId)?.disabled}:null;
    return{ok:normalUsed&&q.centerUnlocked&&v.ok,order:seq,timing,normalUsed,centerUnlocked:!!q.centerUnlocked,revealState,hash:qaHash60(),validation:v,steps};
  }
  function qaRevealSaveLoad60(){
    if(state.floor!==23||!state.floor23?.reveal?.materialized)return{ok:false,reason:'reveal-not-materialized'};
    const before={floor:state.floor,districtId:state.floor23.reveal.districtId,materialized:state.floor23.reveal.materialized,used:state.floor23.reveal.used,spawnBatches:state.floor23.reveal.spawnBatches,disabled:!!(state.switches||[]).find(sw=>sw.id===state.floor23.reveal.switchId)?.disabled,hash:qaHash60()};
    const wrote=!!globalThis.__MANRU_SAVE1004__?.write?.(),raw=globalThis.__MANRU_SAVE1004__?.raw?.();if(!wrote||!raw)return{ok:false,reason:'save-failed',wrote,hasRaw:!!raw};
    const r=state.floor23.reveal;for(const c of r.cells||[])setTerrainTile58(state.map,c.x,c.y,TT.MERCURY);r.materialized=false;r.used=false;r.spawnBatches=0;const sw=(state.switches||[]).find(v=>v.id===r.switchId);if(sw){sw.used=false;sw.disabled=false}
    const loadResult=loadGame({raw,label:'qa-f23-reveal'}),after=state?.floor23?.reveal?{floor:state.floor,districtId:state.floor23.reveal.districtId,materialized:state.floor23.reveal.materialized,used:state.floor23.reveal.used,spawnBatches:state.floor23.reveal.spawnBatches,disabled:!!(state.switches||[]).find(v=>v.id===state.floor23.reveal.switchId)?.disabled,hash:qaHash60()}:null,loaded=!!after&&after.materialized===true&&after.used===true&&after.spawnBatches===1&&after.disabled===true;
    return{ok:loaded,before,after,loaded,loadResult:!!loadResult};
  }
  function qaHazard23_60(entityKind='monster'){
    if(state.floor!==23)return{ok:false,reason:'not-f23'};const q=state.floor23,control=(q.controls||[]).find(c=>(c.changes||[]).some(ch=>ch.before!==TT.MERCURY&&ch.after===TT.MERCURY));if(!control)return{ok:false,reason:'no-flood-control'};
    const sw=(state.switches||[]).find(v=>v.id===control.switchId),ch=(control.changes||[]).find(c=>c.before!==TT.MERCURY&&c.after===TT.MERCURY);if(!sw||!ch)return{ok:false,reason:'missing-target'};
    let entity=null;
    if(entityKind==='player'){entity=state.player;entity.x=ch.x;entity.y=ch.y;OccupancyService.move(entity,entity.x,entity.y)}
    else{entity=(state.monsters||[]).find(m=>m.hp>0&&!m.boss&&!m.floor24Chaser57&&!globalThis.__MANRU_HAZARD_CORE__?.adapted?.(m,'mercury'));if(!entity)return{ok:false,reason:'no-unadapted-monster'};entity.x=ch.x;entity.y=ch.y;OccupancyService.move(entity,entity.x,entity.y)}
    const before={x:entity.x,y:entity.y,hp:entity.hp},adapted=!!globalThis.__MANRU_HAZARD_CORE__?.adapted?.(entity,'mercury'),out=activateFloor23Switch60(sw),after={x:entity.x,y:entity.y,hp:entity.hp},resolved=adapted||after.hp<before.hp||after.x!==before.x||after.y!==before.y;
    return{ok:!!out.changed&&resolved&&state.map[ch.y]?.[ch.x]===TT.MERCURY,entityKind,control:control.switchId,cell:{x:ch.x,y:ch.y},out,before,after,adapted,resolved};
  }
/* ===== MANRU v7.0.1: ANDROID BACKGROUND / RESUME RECOVERY ===== */
let resumeTimer71=0;
  const recovery71={attempts:0,failures:0,last:null};
  function scheduleResume71(reason,delay=50){
    clearTimeout(resumeTimer71);resumeTimer71=setTimeout(()=>resume71(reason),delay);
  }
  function symmetricFunctional78(){
    if(state.monsters?.some(m=>m.boss))return;
    const z=regionIndex(),hasEnd=r=>{const inside=p=>p&&p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;return inside(state.player)||inside(state.stairs)},rooms=[...(state.rooms||[])].filter(r=>r.w>=8&&r.h>=7&&!hasEnd(r));
    for(const r of rooms.slice(0,state.specialFloor?4:5)){
      const pts=[[r.cx-3,r.cy],[r.cx+3,r.cy],[r.cx,r.cy-3],[r.cx,r.cy+3]], candidates=pts.filter(([x,y])=>safeFloor78(x,y));
      if(candidates.length<2)continue;
      const pair=z===0?[TT.BRAZIER,TT.TABLE]:z===1?[TT.FOUNTAIN,TT.HEDGE]:z===2?[TT.MIRROR,TT.SCREEN]:z===3?[TT.JAR,TT.CACHE]:[TT.GOLD,TT.ALTAR];
      for(let i=0;i<candidates.length;i++){
        const [x,y]=candidates[i],t=pair[i%2];
        if([TT.TABLE,TT.HEDGE,TT.SCREEN].includes(t)&&Math.abs(x-state.player.x)+Math.abs(y-state.player.y)<7)continue;
        setTerrainTile58(state.map,x,y,t);
      }
    }
  }
  function polish78(){
    if(!state)return;
    symmetricFunctional78();preservePath78();vfBuildDecor();;
    state.fullDetail78={decor:state.decor?.length||0,region:regionIndex(),floor:state.floor};
  }
/* ===== MANRU v8.5: TRUE STRUCTURAL MAP REBUILD / DECOR VOCABULARY ===== */
const NORMAL85=new Set([1,3,7,9,12,14,17,19]);
  function autoWindows86(){
    if(!state||state.specialFloor)return 0;sanitizeWindows88();const z=regionIndex();if(z!==0&&z!==2){state.windows86=0;return 0}let placed=0;
    for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++){if(state.map[y][x]!==TT.WALL||!validWindow88(x,y))continue;if(DIRS8.some(([dx,dy])=>state.map[y+dy]?.[x+dx]===TT.WINDOW))continue;if(hash2(x,y,90000+state.floor*37)<.91)continue;setTerrainTile58(state.map,x,y,TT.WINDOW);placed++}
    state.windows86=placed;return placed;
  }
  function harmonizeDecor86(){if(!state||state.specialFloor)return;sanitizeWindows88();state.decor=[]}
  function cleanupMap85(){if(!state)return;cleanupMapGeometry();if(NORMAL85.has(state.floor)&&!state.specialFloor)scrubNormal88();sanitizeWindows88()}
  function cleanupMapGeometry(){
    if(!state)return;if(state.specialFloor&&(state.floor23?.preserveAuthoredGeometry||state.floor24?.preserveAuthoredGeometry)){state.routeTags=[];return}
    // Remove the floor kanji route markers everywhere. They are not collectible nor mechanically useful.
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(state.map[y][x]===TT.FLOOR)setTerrainTile58(state.map,x,y,state.floor===24?TT.LIGHT_GRASS:TT.FLOOR);
    state.routeTags=[];
    const z=regionIndex();
    // Diversify old table/screen leftovers without changing collision semantics.
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
      const t=state.map[y][x];if(t!==TT.TABLE&&t!==TT.SCREEN)continue;
      const h=hash2(x,y,8500+state.floor*17);if(h<.26)continue;
      if(z===0)setTerrainTile58(state.map,x,y,t===TT.TABLE?(h<.63?TT.BENCH:TT.CRATE):(h<.65?TT.WALL_BANNER:TT.LOW_FENCE));
      else if(z===1)setTerrainTile58(state.map,x,y,h<.5?TT.ROCK:(h<.75?TT.FLOWERBED:TT.LOW_FENCE));
      else if(z===2)setTerrainTile58(state.map,x,y,t===TT.SCREEN?(h<.65?TT.WALL_BANNER:TT.STATUE):(h<.6?TT.BENCH:TT.STATUE));
      else if(z===3)setTerrainTile58(state.map,x,y,h<.45?TT.CRATE:(h<.75?TT.RACK:TT.STONE_PILLAR));
      else setTerrainTile58(state.map,x,y,h<.55?TT.STONE_PILLAR:TT.STATUE);
    }
    if(state.floor===11){
      // Stone gorge vocabulary only: no silk screens / dining furniture in the river canyon.
      for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
        if(state.map[y][x]===TT.SCREEN)setTerrainTile58(state.map,x,y,hash2(x,y,11880)<.55?TT.ROCK:TT.STONE_PILLAR);
        else if(state.map[y][x]===TT.JAR)setTerrainTile58(state.map,x,y,hash2(x,y,11881)<.5?TT.LANTERN_POST:TT.CRATE);
        else if(state.map[y][x]===TT.TABLE)setTerrainTile58(state.map,x,y,TT.ROCK);
      }
    }
  }
  function pruneDecor85(){if(NORMAL85.has(state.floor)&&!state.specialFloor){state.decor=[];return}return pruneDecorNearStructures()}
  function pruneDecorNearStructures(){
    if(!state?.decor)return;
    const nearStructure=d=>DIRS8.some(([dx,dy])=>{const x=d.x+dx,y=d.y+dy;if(x<0||y<0||x>=COLS||y>=ROWS)return false;const t=state.map[y][x];return tileBlocks(t)||[TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE].includes(t)});
    const feature=d=>(state.featureRooms||[]).some(r=>d.x>=r.x-1&&d.y>=r.y-1&&d.x<r.x+r.w+1&&d.y<r.y+r.h+1);
    const picked=[];
    for(const d of state.decor){
      if(picked.length>=(state.specialFloor?22:14))break;
      if(feature(d)||nearStructure(d)){if(hash2(d.x,d.y,8591+state.floor*9)>.28)picked.push(d)}
    }
    state.decor=picked;
  }
  function themeDecor88(z){smallTheme90(z)}
  function sanitizeWindows88(){if(state?.specialFloor&&(state.floor23?.preserveAuthoredGeometry||state.floor24?.preserveAuthoredGeometry))return 0;let removed=0;const z=regionIndex();for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.WINDOW){const old=state.map[y][x];setTerrainTile58(state.map,x,y,TT.WALL);if(z!==0&&z!==2||!validWindow88(x,y)){removed++;continue}setTerrainTile58(state.map,x,y,old)}state.windowRemoved88=removed;return removed}
  function scrubNormal88(){
    if(!state||state.specialFloor||!NORMAL85.has(state.floor))return;
    const z=regionIndex();state.routeTags=[];
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
      const t=state.map[y][x];
      if(t===TT.FLOOR){setTerrainTile58(state.map,x,y,TT.FLOOR);continue}
      // Remove the two legacy scatter props completely. They were the main visual noise source.
      if(t===TT.TABLE||t===TT.SCREEN){setTerrainTile58(state.map,x,y,TT.FLOOR);continue}
      // Strip v8.5/8.7 decorative blockers before rebuilding the room's theme deliberately.
      if(DECOR88.has(t)){setTerrainTile58(state.map,x,y,(t===TT.STONE_PATH&&z===1)?TT.GRASS:TT.FLOOR);continue}
      // Garden/inner-room legacy style objects are normalized; functional hazards/rewards remain.
      if(z===1&&(t===TT.BAMBOO||t===TT.HEDGE||t===TT.PAVILION))setTerrainTile58(state.map,x,y,TT.GRASS);
    }
    state.decor=[];
  }
  function coherentDecor94(){
    if(!state||state.specialFloor)return;const rawZones=[...(state.featureRooms||[]),...(state.purposeRooms90||[]),state.grandRoom89,...(state.mainPathRooms92||[]).filter(r=>r?.role93==='hall').slice(0,2)].filter(r=>r&&r.w>=5&&r.h>=5),seenZones=new Set(),zones=rawZones.filter(r=>{const q=`${r.x},${r.y},${r.w},${r.h}`;if(seenZones.has(q))return false;seenZones.add(q);return true});const z=regionIndex(),tiles=z===0?[TT.LANTERN_POST,TT.BENCH,TT.CRATE]:z===1?[TT.FLOWERBED,TT.ROCK,TT.LOW_FENCE]:z===2?[TT.STATUE,TT.MIRROR,TT.WALL_BANNER]:z===3?[TT.CRATE,TT.RACK,TT.STONE_PILLAR]:[TT.STONE_PILLAR,TT.STATUE,TT.CARPET];let used=0;
    const put=(x,y,t)=>{if(in85(x,y)&&[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS].includes(state.map[y][x])&&!OccupancyService.isOccupied(x,y)){setTerrainTile58(state.map,x,y,t);used++;return true}return false};
    for(let zi=0;zi<zones.length&&used<24;zi++){
      const r=zones[zi],t=tiles[zi%tiles.length],corner=[[r.x+1,r.y+1],[r.x+r.w-2,r.y+1],[r.x+1,r.y+r.h-2],[r.x+r.w-2,r.y+r.h-2]];
      for(const [x,y] of corner.slice(0,zi===0?4:2))put(x,y,t);
      if(r.w>=9&&used<24){const t2=tiles[(zi+1)%tiles.length];put(r.cx-2,r.y+1,t2);put(r.cx+2,r.y+1,t2)}
      if(r.h>=9&&used<24&&zi%2===0){put(r.x+1,r.cy-1,t);put(r.x+1,r.cy+1,t)}
    }
    if(used<8){for(const r of (state.mainPathRooms92||[]).filter(q=>q&&q.w>=7&&q.h>=6)){if(used>=8)break;const t=tiles[used%tiles.length];put(r.x+1,r.y+1,t);put(r.x+r.w-2,r.y+1,t)}}
    state.coherentDecorCount94=used;
  }
    /* ---------- transient animation state: never survives a browser session ---------- */
    function sanitizeTransient1003(st=state){
      if(!st)return false;
      st.playerHitUntil=0;st.playerAttackUntil=0;st.attackUntil=0;st.evadeUntil=0;
      if(st.player){st.player.nextAttackAt=0;st.player.busyUntil=0}
      for(const m of st.monsters||[]){m.hitUntil=0;m.evadeUntil=0;m.attackUntil=0;m.attackTarget=null;m.hitDir=null}
      try{FX.shakeUntil=0;FX.shakePower=0}catch(error){ignoreError('effects reset',error)}
      return true;
    }
    function armorTone1004(a,base){
      if(!a||a.name==='경량복')return base;
      return choose1004(a,['#46545a','#5c5148','#4e5e52','#63504d','#46536a','#59605d']);
    }
    function cloakTone1004(c){return choose1004(c,['#51342d','#354a4a','#4a3c55','#5a4730','#3d4658','#49343d'])}
    function baseSummoner1004(q,p,dir){
      const coat=armorTone1004(p.armor,'#eee1c8'),lit=p.armor&&p.armor.name!=='경량복'?'#c4b8ae':'#fff0d8';
      const r=(x,y,w,h,c)=>{q.fillStyle=c;q.fillRect(x,y,w,h)},poly=(pts,c)=>{q.fillStyle=c;q.beginPath();pts.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill()};
      // Female mudang: pinned black hair, red ribbon, ivory jeogori and a long crimson chima.
      r(12,3,8,3,'#211820');r(10,6,12,8,'#211820');r(12,2,7,3,'#322332');r(11,4,11,1,'#b88849');px1004(q,21,4,'#f4d59a');r(8,6,3,3,'#a43c49');r(8,9,2,6,'#c85e6b');r(7,13,2,4,'#8e303e');
      r(12,8,8,6,'#e7bb9e');r(13,8,6,2,'#f4d1b5');r(11,7,10,2,'#291c23');px1004(q,12,9,'#291c23');px1004(q,19,9,'#291c23');r(13,11,1,2,'#332029');r(18,11,1,2,'#332029');px1004(q,12,12,'#d89595');px1004(q,19,12,'#d89595');r(15,13,2,1,'#b0686e');
      r(14,14,4,2,'#d3a289');poly([[10,16],[22,16],[25,21],[23,26],[9,26],[7,21]],'#402a32');
      poly([[11,16],[21,16],[24,21],[22,25],[10,25],[8,21]],coat);poly([[12,16],[15,17],[18,20],[16,23],[11,20]],lit);poly([[20,16],[16,20],[14,17],[13,18],[17,22],[21,18]],'#bf5362');
      poly([[9,18],[6,21],[5,25],[8,27],[11,22]],coat);poly([[23,18],[26,21],[27,25],[24,27],[21,22]],coat);r(6,23,3,2,lit);r(23,23,3,2,lit);r(6,26,3,2,'#e4b89c');r(24,26,2,2,'#e4b89c');
      poly([[11,24],[21,24],[25,33],[24,35],[8,35],[7,33]],'#4c2335');poly([[12,24],[20,24],[23,33],[22,34],[10,34],[9,33]],'#a84661');poly([[12,25],[15,25],[13,33],[10,33]],'#d0768a');poly([[18,25],[20,25],[22,33],[19,33]],'#7e334d');r(10,34,12,1,'#d3a27b');r(10,35,5,1,'#231923');r(18,35,5,1,'#231923');
      r(15,21,6,2,'#ad3b53');r(19,23,2,6,'#d68a9b');r(20,28,2,3,'#ece2bc');r(13,24,3,4,'#518f80');px1004(q,14,25,'#b8d3b1');r(13,28,3,2,'#c6a868');
      r(2,23,7,9,'#30242b');r(3,24,5,7,'#7b5769');r(4,25,3,4,'#e5d2a2');px1004(q,5,26,'#86594b');r(3,30,5,1,'#c4a572');
    }
    function baseWanderer1004(q,p){
      // Inspector: slim Nevanda-like read — small head, clean gat, narrow coat, visible legs.
      const coat=armorTone1004(p.armor,'#b9a37b'),coatHi=p.armor&&p.armor.name!=='경량복'?'#8d928c':'#d8c69f';
      // gat: actual art begins at y=2 => only two world pixels can overhang the tile.
      q.fillStyle='#0e0b09';q.fillRect(10,3,12,2);q.fillRect(8,5,16,2);q.fillRect(6,6,20,1);
      q.fillStyle='#49301f';q.fillRect(12,2,8,2);q.fillRect(10,4,12,1);px1004(q,20,3,'#755238');
      // face/hair, deliberately only 8px wide.
      q.fillStyle='#3b2a20';q.fillRect(12,7,8,1);q.fillRect(11,8,10,4);q.fillRect(12,12,8,3);q.fillStyle='#caa77d';q.fillRect(12,8,8,5);q.fillRect(13,13,6,1);q.fillStyle='#e0bd8f';q.fillRect(13,8,6,2);
      px1004(q,13,11,'#211a16');px1004(q,18,11,'#211a16');px1004(q,16,12,'#b88464');q.fillStyle='#704936';q.fillRect(15,13,3,1);
      // neck + sloped shoulders.
      q.fillStyle='#8e6549';q.fillRect(14,14,4,2);q.fillStyle='#231b17';q.beginPath();q.moveTo(10,16);q.lineTo(22,16);q.lineTo(25,20);q.lineTo(23,29);q.lineTo(9,29);q.lineTo(7,20);q.closePath();q.fill();
      q.fillStyle=coat;q.beginPath();q.moveTo(11,16);q.lineTo(21,16);q.lineTo(23,20);q.lineTo(21,29);q.lineTo(11,29);q.lineTo(9,20);q.closePath();q.fill();
      q.fillStyle=coatHi;q.beginPath();q.moveTo(12,17);q.lineTo(16,17);q.lineTo(15,28);q.lineTo(11,28);q.lineTo(10,20);q.closePath();q.fill();
      // sleeves/hands, one sleeve slightly asymmetric so the silhouette doesn't read as a rectangle.
      q.fillStyle=coat;q.beginPath();q.moveTo(9,18);q.lineTo(6,21);q.lineTo(7,27);q.lineTo(10,26);q.lineTo(11,20);q.closePath();q.fill();q.beginPath();q.moveTo(22,18);q.lineTo(25,20);q.lineTo(25,26);q.lineTo(22,27);q.lineTo(21,20);q.closePath();q.fill();
      q.fillStyle='#c89e73';q.fillRect(6,26,3,2);q.fillRect(23,26,3,2);
      // official red waist strip / small badge gives class identity at 1x.
      q.fillStyle='#7f2f2a';q.fillRect(14,17,4,10);q.fillStyle='#b98647';q.fillRect(15,19,2,5);px1004(q,16,20,'#e2c976');
      q.fillStyle='#4a3025';q.fillRect(8,25,4,4);q.fillStyle='#8d6740';q.fillRect(9,26,2,1);px1004(q,10,27,'#d4af67');
      q.fillStyle='#4a3025';q.fillRect(11,29,10,2);q.fillStyle='#2a1d18';q.fillRect(11,31,4,4);q.fillRect(18,31,4,4);q.fillStyle='#110e0c';q.fillRect(10,34,6,2);q.fillRect(17,34,7,2);
      // two-pixel coat hem breaks the square lower body.
      q.fillStyle=coat;q.fillRect(9,28,4,2);q.fillRect(20,28,3,2);
    }
    function baseStrongman1004(q,p,powered,dir,attack){
      // Pixel-authored anatomy: deltoids, trapezius, chest and forearms change independently of the head.
      const skin='#b98255',lit='#e2b17b',shade='#794a33',edge='#211713',vest=armorTone1004(p.armor,'#754332');
      const r=(x,y,w,h,c)=>{q.fillStyle=c;q.fillRect(x,y,w,h)},poly=(pts,c)=>{q.fillStyle=c;q.beginPath();pts.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill()};
      // Broad planted stance and wrapped boots, unchanged floor anchor at y=36.
      poly([[9,26],[23,26],[25,33],[19,34],[16,30],[13,34],[7,33]],'#262e31');
      r(8,30,5,4,'#495050');r(19,30,5,4,'#3a4040');r(8,32,5,1,'#b6a084');r(19,32,5,1,'#a68d73');r(6,34,8,2,'#141414');r(18,34,8,2,'#141414');
      const outer=powered?2:4,top=powered?12:15;
      poly([[outer,top+2],[10,top],[13,11],[20,11],[23,top],[32-outer,top+2],[29,25],[23,27],[9,27],[3,25]],edge);
      poly([[outer+1,top+3],[10,top+1],[13,12],[20,12],[23,top+1],[31-outer,top+3],[25,24],[22,27],[10,27],[7,24]],skin);
      // Neck tendons and trapezius highlights.
      poly([[11,top+2],[14,12],[15,16],[12,19],[8,18]],lit);poly([[18,12],[21,top+1],[24,18],[20,19],[17,16]],'#c99563');
      // Independent swollen deltoids and forward braced forearms.
      for(const side of [0,1]){const x=side?24:outer,y=top+2+(attack&&side===1?-1:0),w=powered?6:4;
        poly([[x,y],[x+w-1,y],[x+w,y+4],[x+w-1,25],[x+1,27],[x-1,24]],shade);
        r(x,y+1,w-1,4,skin);r(x+1,y+1,2,3,lit);r(x,22,w-1,3,'#bd8a5d');r(x,24,w,3,'#473a2e');r(x,24,w,1,'#c8b188');r(x+1,27,w-2,2,skin);
      }
      // Cross-lapped sleeveless service jacket, brass rank fasteners, thick sash.
      poly([[10,17],[15,19],[19,16],[23,18],[22,25],[10,25],[8,20]],vest);
      poly([[10,17],[15,20],[20,16],[22,17],[16,23],[10,21]],'#a47a50');r(15,21,2,4,'#d0ac68');r(10,25,13,3,'#392723');r(9,25,14,1,'#986344');r(14,25,5,3,'#c29950');r(15,26,3,1,'#f0d28a');r(20,28,3,3,'#773b2c');
      if(powered){r(8,18,3,1,lit);r(21,18,3,1,lit);r(10,22,3,1,'#ce9660')}
      // Small stern face and tied headband: no head scaling during transformation.
      r(12,3,8,3,'#16191a');r(15,1,4,3,'#202528');r(11,5,10,8,edge);r(12,6,8,7,skin);r(13,6,6,3,lit);r(12,5,8,2,'#773d2e');r(12,5,8,1,'#bd8652');r(20,6,3,2,'#773d2e');r(21,8,2,3,'#542c24');
      r(12,9,3,1,'#3b2922');r(17,9,3,1,'#3b2922');r(13,10,1,1,'#141a1a');r(18,10,1,1,'#141a1a');r(16,10,1,2,'#e8b27a');r(14,12,4,1,'#583a2c');r(14,13,4,1,'#805139');
    }
    function baseEscort1004(q,p){
      // Guard: compact lamellar silhouette, small helm/face and separated greaves.
      const arm=armorTone1004(p.armor,'#4e5552'),armHi=p.armor&&p.armor.name!=='경량복'?'#7b8178':'#807463';
      // short crest + helmet, also capped to two-pixel overhang.
      q.fillStyle='#7d302b';q.fillRect(15,2,2,3);q.fillRect(17,3,2,2);q.fillStyle='#1a2021';q.fillRect(10,5,12,4);q.fillStyle='#4e5b5c';q.fillRect(12,4,8,2);q.fillRect(9,7,14,2);q.fillStyle='#89908c';q.fillRect(13,5,5,1);
      q.fillStyle='#3b322b';q.fillRect(12,9,8,1);q.fillRect(11,10,10,4);q.fillRect(12,14,8,2);q.fillStyle='#b7926d';q.fillRect(12,10,8,4);q.fillRect(13,14,6,1);q.fillStyle='#d0ad80';q.fillRect(13,10,6,2);px1004(q,13,12,'#20201e');px1004(q,18,12,'#20201e');px1004(q,16,13,'#9c745a');q.fillStyle='#62483a';q.fillRect(15,14,3,1);
      q.fillStyle='#2a2521';q.fillRect(14,15,4,2);
      // sloped pauldrons and narrower waist than shoulders.
      q.fillStyle='#242522';q.beginPath();q.moveTo(9,16);q.lineTo(22,16);q.lineTo(26,20);q.lineTo(23,30);q.lineTo(9,30);q.lineTo(6,20);q.closePath();q.fill();
      q.fillStyle=arm;q.beginPath();q.moveTo(10,17);q.lineTo(21,17);q.lineTo(24,20);q.lineTo(22,29);q.lineTo(10,29);q.lineTo(8,20);q.closePath();q.fill();
      q.fillStyle=armHi;q.fillRect(11,18,10,2);q.fillStyle='#a38b68';q.fillRect(11,21,10,1);q.fillRect(10,24,12,1);q.fillRect(11,27,10,1);
      q.fillStyle='#413a32';q.beginPath();q.moveTo(8,19);q.lineTo(5,21);q.lineTo(6,28);q.lineTo(9,27);q.closePath();q.fill();q.beginPath();q.moveTo(23,19);q.lineTo(26,21);q.lineTo(25,28);q.lineTo(22,27);q.closePath();q.fill();
      q.fillStyle='#b58f69';q.fillRect(5,27,3,2);q.fillRect(24,27,3,2);
      q.fillStyle='#6b2b28';q.fillRect(10,29,12,2);q.fillStyle='#2b2926';q.fillRect(11,31,4,4);q.fillRect(18,31,4,4);q.fillStyle='#141311';q.fillRect(10,34,6,2);q.fillRect(17,34,7,2);
      // tiny brass clasp instead of a giant chest block.
      q.fillStyle='#b28c55';q.fillRect(15,18,2,2);px1004(q,16,18,'#e1c47a');
    }
    function baseSwordsman1004(q,p){
      // Scout swordsman: asymmetry + diagonals like Nevanda's readable human tiles.
      const coat=armorTone1004(p.armor,'#4e7078'),coatHi=p.armor&&p.armor.name!=='경량복'?'#7d8c8d':'#72929a';
      q.fillStyle='#0f1719';q.fillRect(11,5,11,3);q.fillRect(13,3,8,3);q.fillRect(19,2,3,3);q.fillStyle='#263a3e';q.fillRect(12,4,9,1);q.fillStyle='#11191b';q.fillRect(21,4,3,8);
      q.fillStyle='#3b3130';q.fillRect(12,8,8,1);q.fillRect(11,9,10,4);q.fillRect(12,13,8,3);q.fillStyle='#c0a39a';q.fillRect(12,9,8,5);q.fillRect(13,14,6,1);q.fillStyle='#d8bcb0';q.fillRect(13,9,6,2);px1004(q,13,12,'#202629');px1004(q,18,12,'#202629');px1004(q,16,13,'#a98079');q.fillStyle='#694943';q.fillRect(15,14,3,1);
      // red scarf, one tail visible outside the torso.
      q.fillStyle='#8c342e';q.fillRect(11,16,10,2);q.beginPath();q.moveTo(20,17);q.lineTo(26,18);q.lineTo(23,22);q.closePath();q.fill();
      q.fillStyle='#202c2e';q.beginPath();q.moveTo(10,17);q.lineTo(22,17);q.lineTo(24,21);q.lineTo(21,29);q.lineTo(10,29);q.lineTo(7,21);q.closePath();q.fill();
      q.fillStyle=coat;q.beginPath();q.moveTo(11,18);q.lineTo(21,18);q.lineTo(22,21);q.lineTo(20,28);q.lineTo(11,28);q.lineTo(9,21);q.closePath();q.fill();
      q.fillStyle=coatHi;q.beginPath();q.moveTo(12,19);q.lineTo(16,19);q.lineTo(14,28);q.lineTo(11,28);q.lineTo(10,21);q.closePath();q.fill();
      // diagonal cross-body strap and asymmetric forearms.
      q.strokeStyle='#253b40';q.lineWidth=2;q.beginPath();q.moveTo(20,18);q.lineTo(11,28);q.stroke();q.fillStyle='#9a6b46';q.fillRect(15,23,3,2);
      q.fillStyle='#3b5960';q.beginPath();q.moveTo(9,19);q.lineTo(6,22);q.lineTo(7,28);q.lineTo(10,27);q.closePath();q.fill();q.fillStyle='#263c42';q.beginPath();q.moveTo(22,19);q.lineTo(25,21);q.lineTo(24,27);q.lineTo(21,27);q.closePath();q.fill();
      q.fillStyle='#c09d90';q.fillRect(6,27,3,2);q.fillRect(23,27,3,2);
      q.fillStyle='#1b292d';q.fillRect(11,29,10,2);q.fillRect(11,31,4,4);q.fillRect(18,31,4,4);q.fillStyle='#0c1315';q.fillRect(10,34,6,2);q.fillRect(17,34,7,2);
      // class sheath: slim and diagonal, not a giant side rectangle.
      q.strokeStyle='#3b241c';q.lineWidth=2;q.beginPath();q.moveTo(8,24);q.lineTo(5,34);q.stroke();q.fillStyle='#a17445';q.fillRect(6,23,5,2);
    }
function wardPulse(kind,turns=10){
  const h=hz(),name=kind==='drown'?'익사 면역':'공허 면역';if(kind==='drown')h.drownUntil=(state.turn||0)+turns+1;else h.voidUntil=(state.turn||0)+turns+1;
  FX.flashUntil=performance.now()+620;FX.flashColor=kind==='drown'?'#70d8e8':'#aa79df';FX.shakeUntil=performance.now()+180;FX.shakePower=2.2;
  burst(state.player.x,state.player.y,kind==='drown'?'#77ddeb':'#b687ef',30,1.4);toast(`${name} ${turns}턴`);addLog(`유물이 산산이 부서졌다. ${name} ${turns}턴.`);updateWardHud();
}
/* ---------- key silhouettes: type = material + geometry, not color only ---------- */
const KEY_META1006={
  'f2-danger-exit':{id:'f2-danger-exit',name:'혈문 출구열쇠',color:'#d88069',dark:'#613329',glow:'#f0dfc5',shape:'iron'},
  'f2-east-safe-exit':{id:'f2-east-safe-exit',name:'동쪽 회랑 출구열쇠',color:'#d7c084',dark:'#625538',glow:'#f0dfc5',shape:'brass'},
  'f2-west-safe-exit':{id:'f2-west-safe-exit',name:'서쪽 회랑 출구열쇠',color:'#99caba',dark:'#375f53',glow:'#f0dfc5',shape:'jade'},
  'f2-unknown-exit':{id:'f2-unknown-exit',name:'암실 출구열쇠',color:'#c3a6d1',dark:'#56405d',glow:'#f0dfc5',shape:'iron'},
  'choice-copper':{id:'choice-copper',name:'동제 갈림열쇠',color:'#e29c65',dark:'#63341e',glow:'#ffe0bc',shape:'brass'},
  'choice-silver':{id:'choice-silver',name:'은제 갈림열쇠',color:'#b9d2e4',dark:'#34475f',glow:'#e5f3ff',shape:'jade'},
  iron:{id:'iron',name:'철제 톱니열쇠',color:'#d9e0e3',dark:'#46525b',glow:'#f1f5f4',shape:'iron'},
  jade:{id:'jade',name:'청옥 패형열쇠',color:'#5fe0ad',dark:'#174d3a',glow:'#c7ffe5',shape:'jade'},
  brass:{id:'brass',name:'황동 삼지열쇠',color:'#f0b84e',dark:'#654313',glow:'#ffe5a2',shape:'brass'}
};
function rgb1020(h){h=h.replace('#','');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function mix1020(a,b,t){const A=rgb1020(a),B=rgb1020(b);return`rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`}
function objectAt1025(x,y){return !inside1020(x,y)||!GRAD_TERRAIN1025.has(terrainBaseTile58(x,y))}
const shadow=q=>{ell(q,'rgba(0,0,0,.30)',24,41,13,4);rect(q,14,43,20,2,'rgba(0,0,0,.13)')};
const KEY=(it)=>{
  if(!it)return'none';
  if(it.summonItem105==='picture')return`picture:${it.summonSpecies105||it.name}:${summonPictureGrade(it.pictureCopies105||1)}:${hash(JSON.stringify(it.summonPortrait105||null))}`;
  let extra='';
  // Talisman cache identity follows its assigned physical appearance, not known/unknown state.
  if(it.type==='talisman'){const pub=window.__MANRU_TALISMAN_PUBLIC__,a=pub?.app?.(it);extra=`:${a?.id||''}:${pub?.seal?.(it)||a?.seal||''}:${a?.paper||''}:${a?.paper2||''}:${a?.ink||''}`}
  if(it.type==='ammo')extra+=`:${it.ammoKind||''}`;
  if(it.summonItem105)extra+=`:${it.summonElement105||''}:${it.pictureCopies105||1}:${hash(JSON.stringify(it.summonPortrait105||null))}`;
  return`${it.name||''}:${it.type||''}:${it.kind||''}:${it.tier||0}:${it.rarity||''}:${it.artifactId46||''}:${it.artifactWeapon46?1:0}${extra}`;
};
const WEAPON_STYLE={
'조잡한 단검':'rough_dagger','나무 몽둥이':'club','무딘 소검':'short_sword','대나무창':'bamboo_spear','사냥용 목궁':'hunt_bow','낡은 장도리':'claw_hammer',
'수련용 환도':'hwando','강철 보검':'steel_sword','철두창':'iron_spear','낫':'sickle','손도끼':'hand_axe','병사용 반궁':'mil_bow',
'쌍날 단도':'twin_dagger','암살용 비수':'assassin','편곤':'flail','삼각창':'tri_spear','강화 각궁':'horn_bow','무쇠 메':'iron_maul',
'연철 권갑':'iron_gauntlet','육각 철봉':'hex_staff','장갑 도끼':'battle_axe','협도':'glaive','철참도':'heavy_sword','정량궁':'siege_bow','대형 오해머':'warhammer',
'별운검':'royal_sword','태도':'tachi','당파':'dangpa','금강령 퇴':'vajra','단단한 철궁':'iron_bow','대장간 망치':'forge_hammer'
};
function debugBattleCards57(){
 const b=DEBUG_BATTLE57,select=document.getElementById('battleMonster57'),area=document.getElementById('battleCards57');area.replaceChildren();
 for(const option of select.options){const entry=b.catalog[Number(option.value)],card=document.createElement('button');card.type='button';card.className='battleMonsterCard57'+(option.selected?' selected':'');card.setAttribute('aria-pressed',String(option.selected));card.setAttribute('aria-label',entry.def.name+' 선택');
  const art=document.createElement('canvas');art.width=96;art.height=96;const ctx=art.getContext('2d');ctx.imageSmoothingEnabled=false;const image=globalThis.__MANRU_ACTOR_ART__.monster(entry.def,0);ctx.drawImage(image,16,12,64,72);
  const name=document.createElement('b');name.textContent=entry.def.name;const badge=document.createElement('span');badge.textContent=entry.group;
  card.append(art,name,badge);card.onclick=()=>{select.value=option.value;debugBattlePreview57();for(const child of area.children){const chosen=child===card;child.classList.toggle('selected',chosen);child.setAttribute('aria-pressed',String(chosen))}};area.append(card);
 }
 if(!select.options.length){const empty=document.createElement('p');empty.textContent='해당 몬스터가 없습니다.';area.append(empty)}
 document.getElementById('battleCatalogCount57').textContent=select.options.length+'종';
}
function debugBattleMessage57(message){document.getElementById('battleMessage57').textContent=message;document.getElementById('battleWatchMessage57').textContent=message}
function debugBattlePause57(){const b=DEBUG_BATTLE57;b.playing=false;clearTimeout(b.timer);b.timer=null;document.getElementById('battlePlay57').textContent='▶ 시작 / 계속';document.getElementById('battleWatchPlay57').textContent='▶ 계속'}
function debugBattleCreateWorld57(fresh=false){
 const b=DEBUG_BATTLE57;debugBattlePause57();debugBattleCancelGesture57();closeInspect();OccupancyService.endShared();let skipped=0;
 // DOM events are not the fresh-map command.
 const before={state,cols:COLS,rows:ROWS,template:b.mapTemplate,key:b.mapKey,anchors:b.spawnAnchors,room:b.roomKey};
 try{debugBattleMap57(fresh===true);}catch(error){OccupancyService.endShared();state=before.state;COLS=before.cols;ROWS=before.rows;Object.assign(b,{mapTemplate:before.template,mapKey:before.key,spawnAnchors:before.anchors,roomKey:before.room});console.error('debug map generation rejected',error);debugBattleMessage57('지도 생성 실패: '+error.message);debugBattleRender57();return false;}VisibilityService.compute();
 b.round=0;b.winner=null;b.serial=0;b.motionFrom=null;b.subjectId=null;b.lastSubjectPosition=null;for(const key of ['particles','floats','slashes','rings','projectiles','doors'])FX[key]=[];FX.transition=null;FX.shakeUntil=0;FX.shakePower=0;FX.flashUntil=0;resetVisualState();
 const room=b.rooms.find(e=>e.i===b.roomKey)?.r;
 for(const side of ['A','B'])for(const row of b.roster.filter(r=>r.side===side))for(let i=0;i<row.count;i++){
  const mon=debugBattleMonster57(b.catalog[row.catalog],row.floor,row.gatekeeper),anchor=b.spawnAnchors[side],other=b.spawnAnchors[side==='A'?'B':'A'];
  Object.assign(mon,{debugSide57:side,debugId57:++b.serial,debugFloor57:row.floor,alerted:true,hidden:false,mimicDormant105:false,spawnProvenance57:'debug-battle',rewardPolicy57:{xp:false,kills:false,drops:false}});
  setEntityFaction57(mon,side==='A'?'player':'hostile');mon.alerted=true;
  const positions=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
   if(!PlacementService.canPlaceEntity(mon,x,y))continue;const d=Math.hypot(x-anchor.x,y-anchor.y),op=Math.hypot(x-other.x,y-other.y),outside=room&&(x<room.x||y<room.y||x>=room.x+room.w||y>=room.y+room.h);
   positions.push({x,y,d:d+(d>op?30:0)+(outside?60:0)});
  }
  positions.sort((a,c)=>a.d-c.d);if(!positions.length){skipped++;continue}Object.assign(mon,{x:positions[0].x,y:positions[0].y});OccupancyService.addMonster(mon);
 }
 debugBattleMessage57(skipped?`배치 실패 ${skipped}마리 · 지형 제한을 해제하거나 수량을 줄이세요.`:'실제 맵 배치 완료 · 조사 / 드래그 / 두 손가락 확대 가능');debugBattleSubjects57();debugBattleCamera57(true);debugBattleRender57();
}
function debugBattlePlay57(){
 const b=DEBUG_BATTLE57;if(b.playing){debugBattlePause57();debugBattleMessage57('일시정지');return}
 if(b.winner){debugBattleMessage57('전투 종료 · 재대결을 누르세요.');return}
 if(!['A','B'].every(side=>state.monsters.some(m=>m.debugSide57===side))){debugBattleMessage57('A/B 양쪽에 몬스터를 추가하세요.');return}
 debugBattleWatch57();b.playing=true;if(innerWidth<=1000)document.getElementById('battleSetupDetails57').open=false;document.getElementById('battlePlay57').textContent='Ⅱ 일시정지';document.getElementById('battleWatchPlay57').textContent='Ⅱ 일시정지';
 const tick=()=>{if(!b.open||!b.playing)return;debugBattleRound57();if(b.playing)b.timer=setTimeout(tick,800/Number(document.getElementById('battleSpeed57').value))};tick();
}
function debugBattlePreview57(){
 const b=DEBUG_BATTLE57,select=document.getElementById('battleMonster57'),entry=b.catalog[Number(select.value)];if(!entry||!select.options.length){document.getElementById('battlePreview57').textContent='검색 결과가 없습니다.';return}
 const floor=clamp(Math.floor(Number(document.getElementById('battleFloor57').value)||1),1,100),m=debugBattleMonster57(entry,floor,document.getElementById('battleGatekeeper57').checked,true);
 document.getElementById('battlePreview57').textContent=`${m.name} · ${floor}층 기준${entry.dojo?' (무술·장비 편성 예시)':entry.def.boss?' (보스 · 층 배율 없음)':entry.def.fixedStats57?' (고정 능력치)':''}\n체력 ${m.maxHp} / 공격 ${m.atk} / 방어 ${m.def} / 회피 ${m.eva}\n${m.ranged?'원거리':'근접'} · 사거리 ${m.ranged?m.range:m.reach}${m.fast?' · 빠름':''}${m.revivalLives57?' · 부활':''}${m.split?' · 분열':''}${m.legendElite47?' · 문지기 강화':''}${m.martialActor105?'\n기력 '+m.focus+' / '+m.maxFocus+' · '+dojoInspect(m,{battle:true}):''}`;
}
function debugBattleFilter57(){
 const b=DEBUG_BATTLE57,select=document.getElementById('battleMonster57'),old=select.value,query=document.getElementById('battleSearch57').value.trim().toLowerCase(),group=document.getElementById('battleGroup57').value;
 select.replaceChildren();b.catalog.forEach((entry,index)=>{if((!group||entry.group===group)&&entry.def.name.toLowerCase().includes(query)){const option=document.createElement('option');option.value=index;option.textContent=entry.def.name+' · '+entry.group;select.append(option)}});
 if([...select.options].some(o=>o.value===old))select.value=old;debugBattleCards57();debugBattlePreview57();
}
function debugBattleAdd57(side){
 const b=DEBUG_BATTLE57,index=Number(document.getElementById('battleMonster57').value);if(!b.catalog[index]||!document.getElementById('battleMonster57').options.length)return;
 const floor=clamp(Math.floor(Number(document.getElementById('battleFloor57').value)||1),1,100),count=clamp(Math.floor(Number(document.getElementById('battleCount57').value)||1),1,20);
 if(b.roster.filter(r=>r.side===side).reduce((n,r)=>n+r.count,0)+count>20){debugBattleMessage57('진영당 최대 20마리까지 배치할 수 있습니다.');return}
 const gatekeeper=document.getElementById('battleGatekeeper57').checked,old=b.roster.find(r=>r.side===side&&r.catalog===index&&r.floor===floor&&!!r.gatekeeper===gatekeeper);if(old)old.count+=count;else b.roster.push({side,catalog:index,floor,count,gatekeeper});
 debugBattleRoster57();debugBattleCreateWorld57();
}
function debugBattleRoster57(){
 const b=DEBUG_BATTLE57;for(const side of ['A','B']){
  const area=document.getElementById('battleRoster'+side+'57');area.replaceChildren();const rows=b.roster.filter(r=>r.side===side);
  if(!rows.length){const p=document.createElement('p');p.className='battleEmpty57';p.textContent='몬스터를 골라 '+side+' 진영에 추가하세요.';area.append(p)}
  for(const row of rows){const el=document.createElement('div');el.className='battleRow57';const label=document.createElement('span');label.textContent=b.catalog[row.catalog].def.name+(row.gatekeeper?' · 문지기':'')+' · '+row.floor+'층 × '+row.count;const remove=document.createElement('button');remove.textContent='삭제';remove.setAttribute('aria-label',label.textContent+' 삭제');remove.onclick=()=>{b.roster.splice(b.roster.indexOf(row),1);debugBattleRoster57();debugBattleCreateWorld57()};el.append(label,remove);area.append(el)}
 }
}
function debugBattleFrame57(now){const b=DEBUG_BATTLE57;if(!b.open||now-(b.lastFrame||0)<42)return;b.lastFrame=now;PresentationState.advance(now);debugBattleRender57(false,now);}
function debugBattleRender57(refreshUI=true,now=performance.now(),resetSurface=false){
 const b=DEBUG_BATTLE57;if(!b.open)return;debugBattleSubject57();syncGameViewport();drawMap(true);b.viewDirty=false;
 if(b.watching)debugBattleWatchHud57();if(!refreshUI)return;debugBattleSubjects57();document.getElementById('battleRound57').textContent=b.round+'턴';
 for(const side of ['A','B']){const live=state.monsters.filter(m=>m.debugSide57===side&&m.hp>0);document.getElementById('battleAlive'+side+'57').textContent=side+' 진영 · 생존 '+live.length+' · 체력 '+live.reduce((n,m)=>n+m.hp,0);}
 const log=document.getElementById('battleLog57');log.textContent=state.log.slice(0,10).reverse().map(v=>typeof v==='string'?v:v.text||v.msg||JSON.stringify(v)).join('\n');log.scrollTop=log.scrollHeight;
 const units=document.getElementById('battleUnits57');units.replaceChildren();for(const m of state.monsters){const row=document.createElement('button');row.type='button';row.textContent=`${m.debugSide57}${m.debugId57} ${m.name} · HP ${Math.max(0,m.hp)}/${m.maxHp}${m.stunned?' · 기절':''}${m.revivePhase57==='corpse'?' · 부활 대기':''}`;row.className='battleUnit'+m.debugSide57+'57';row.onclick=()=>debugBattleInspect57({x:m.x,y:m.y});units.append(row)}
}
function debugBattleInspect57(cell){if(!cell||state?.map[cell.y]?.[cell.x]==null)return;debugBattlePause57();globalThis.__MANRU_INSPECT984__(cell);}
function debugBattleCancelGesture57(){const b=DEBUG_BATTLE57;for(const p of b.pointers?.values()||[])clearTimeout(p.hold);b.pointers=new Map();b.gesture=null;b.inspectRelease57=null;globalThis.__MANRU_CAMERA_STATE12__?.cancelInertia();}
function debugBattleSubject57(){
 const b=DEBUG_BATTLE57;if(!b.open)return null;
 const available=state.monsters.filter(m=>!m.combatFixture54&&(m.hp>0||m.revivePhase57==='corpse'));
 let mon=available.find(m=>m.debugId57===b.subjectId);
 if(!mon){const origin=b.lastSubjectPosition;mon=available.filter(m=>m.debugSide57===b.subjectSide).sort((a,c)=>origin?Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(c.x-origin.x,c.y-origin.y):0)[0]||available[0];b.subjectId=mon?.debugId57??null}
 if(mon){b.subjectSide=mon.debugSide57;b.lastSubjectPosition=v8CreatureCoords(mon)}return mon||null;
}
function debugBattleSubjects57(){
 const mon=debugBattleSubject57(),select=document.getElementById('battleSubject57'),list=state.monsters.filter(m=>!m.combatFixture54&&(m.hp>0||m.revivePhase57==='corpse')),key=list.map(m=>m.debugId57+':'+m.name).join('|');
 if(select.dataset.units!==key){select.dataset.units=key;select.replaceChildren();for(const m of list){const option=document.createElement('option');option.value=m.debugId57;option.textContent=m.debugSide57+m.debugId57+' · '+m.name;select.append(option)}if(!list.length){const option=document.createElement('option');option.textContent='관전할 몬스터 없음';option.value='';select.append(option)}}
 select.value=mon?String(mon.debugId57):'';select.disabled=!list.length;
}
function debugBattleWatchHud57(){
 const b=DEBUG_BATTLE57,mon=debugBattleSubject57();document.getElementById('battleSubject57').value=mon?String(mon.debugId57):'';
 document.getElementById('battleWatchStats57').textContent=mon?mon.debugSide57+' 진영 · HP '+Math.max(0,mon.hp)+' / '+mon.maxHp+(mon.revivePhase57==='corpse'?' · 부활 대기':''):'전투 종료';
 document.getElementById('battleWatchRound57').textContent=b.round+'턴 · A '+state.monsters.filter(m=>m.debugSide57==='A'&&m.hp>0&&!m.combatFixture54).length+' : B '+state.monsters.filter(m=>m.debugSide57==='B'&&m.hp>0&&!m.combatFixture54).length;
 const art=document.getElementById('battleSubjectArt57'),ctx=art.getContext('2d');ctx.clearRect(0,0,64,64);ctx.imageSmoothingEnabled=false;if(mon)ctx.drawImage(globalThis.__MANRU_ACTOR_ART__.monster(mon,Math.floor(performance.now()/170)%2),8,5,48,54);
}
function debugBattleSetup57(){
 const b=DEBUG_BATTLE57;if(!b.watching)return;debugBattlePause57();debugBattleCancelGesture57();b.watching=false;document.getElementById('battleViewport57').append(C);
 document.getElementById('debugBattle57').classList.remove('watching57');document.getElementById('battleWatch57').hidden=true;document.getElementById('battleSetupDetails57').open=true;syncGameViewport();debugBattleRender57();document.getElementById('battlePlay57').focus();
}
function debugBattleStep57(){debugBattlePause57();if(DEBUG_BATTLE57.winner){debugBattleMessage57(DEBUG_BATTLE57.winner+' · 재대결을 누르세요.');return}if(['A','B'].every(s=>state.monsters.some(m=>m.debugSide57===s)))debugBattleRound57();else debugBattleMessage57('A/B 양쪽에 몬스터를 추가하세요.')}
function initDebugBattle57(){
 const panel=document.createElement('section');panel.id='debugBattle57';panel.hidden=true;panel.setAttribute('aria-label','디버그 전장');panel.innerHTML=`<div class="battleShell57"><header class="battleHeader57"><div><h2>디버그 전장</h2><p>몬스터를 편성하고 진영 간 전투를 관찰합니다. 진행 기록과 보상에 영향이 없습니다.</p></div><button id="battleExit57">← 로비로</button></header><div class="battleMain57"><aside><details id="battleSetupDetails57" open><summary>몬스터 편성<span>스프라이트 선택 → 층·수량 → 진영 추가</span></summary><section class="battlePanel57"><label>이름 검색<input id="battleSearch57" placeholder="몬스터 이름 검색" autocomplete="off"></label><div class="battleInputs57"><label>분류<select id="battleGroup57"><option value="">전체</option><option>일반</option><option>보스</option><option>별관</option><option>무도가</option></select></label><label>수량<input id="battleCount57" type="number" min="1" max="20" value="1"></label></div><div class="battleCatalogHeader57"><b>몬스터 선택</b><span id="battleCatalogCount57"></span></div><select id="battleMonster57" hidden aria-label="선택된 몬스터"></select><div id="battleCards57" aria-label="몬스터 스프라이트 목록"></div><div class="battleInputs57"><label>기준 층<input id="battleFloor57" type="number" min="1" max="100" value="1"></label><div><label>배치 한도</label>각 진영 20마리</div></div><label class="battleTerrainLabel57"><input id="battleTerrain57" type="checkbox" checked> 물 전용 이동 제한 해제</label><label class="battleTerrainLabel57"><input id="battlePlantMove57" type="checkbox"> 식물 이동 허용 (기본: 고정)</label><label class="battleTerrainLabel57"><input id="battleGatekeeper57" type="checkbox"> 문지기 강화 적용</label><div class="battlePreview57" id="battlePreview57"></div><div class="battleTeamButtons57"><button class="battleA57" id="battleAddA57">+ A 진영</button><button class="battleB57" id="battleAddB57">+ B 진영</button></div><p style="font-size:12px;margin-top:12px">일반은 층별 생성식 · 보스는 고정 능력치<br>무도가는 도장 원본 무술·장비로 개체별 편성<br>문지기 강화는 기준 층의 원본 공식을 적용합니다.</p></section><section class="battlePanel57"><h3 class="battleUnitA57">A 진영 · 청색</h3><div id="battleRosterA57"></div></section><section class="battlePanel57"><h3 class="battleUnitB57">B 진영 · 적색</h3><div id="battleRosterB57"></div><button id="battleClear57">전체 편성 비우기</button></section></details></aside><main><section class="battlePanel57"><div class="battleScores57"><span id="battleAliveA57" class="battleUnitA57"></span><span id="battleAliveB57" class="battleUnitB57"></span><span id="battleRound57">0턴</span></div><div class="battleInputs57"><label>전장 지도<select id="battleMap57"><option value="normal">일반 테마 · 실제 9층</option><option value="palace1">용궁 테마 · 외궁</option><option value="palace2">용궁 테마 · 내궁</option><option value="main">실제 본관 지도 · 층 선택</option><option value="current">내 탐험 지도 복사</option></select></label><label>지도 층<input id="battleMapFloor57" type="number" min="1" max="25" value="9"></label><label>교전 구역<select id="battleRoom57"></select></label><button id="battleNewMap57">새 지도 생성</button></div><p style="font-size:12px">기존 몹·바닥 아이템은 비우고, 지형·가구·조명은 유지합니다. 재대결은 같은 지도입니다.</p><div class="battleMapToolbar57"><span id="battleMapName57"></span><label>배율<select id="battleZoom57"><option value="0">전체 보기</option><option value="0.75">75%</option><option value="1" selected>100%</option><option value="1.5">150%</option><option value="2">200%</option><option value="3">300%</option></select></label><label><input id="battleFollow57" type="checkbox" checked> 교전 추적</label><label>터치<select id="battleTool57"><option value="inspect">조사</option><option value="follow">관전 대상 선택</option><option value="A">A 출발점 지정</option><option value="B">B 출발점 지정</option></select></label><span>드래그 이동 · 두 손가락 확대 · 길게 눌러 조사</span></div><div id="battleViewport57" aria-label="실제 맵 전장"></div><div id="battleMessage57" role="status" aria-live="polite"></div><div class="battleControls57"><button id="battleView57">전체 화면 관전</button><button id="battlePlay57">▶ 시작 / 계속</button><button id="battleStep57">한 턴 진행</button><button id="battleReset57">↻ 재대결</button><label>속도<select id="battleSpeed57"><option value="0.5">0.5배</option><option value="1" selected>1배</option><option value="2">2배</option><option value="4">4배</option></select></label></div></section><p style="font-size:12px">공통 이동·근접·원거리·피격·상태이상·분열·부활 판정을 사용합니다. 보스의 예고·범위 공격·소환·거울·사념체도 진영에 맞게 작동합니다. 무도가의 무술과 조사관의 권총·봉쇄부적도 같은 전투 경로를 사용합니다. 스토리 진행은 발생하지 않습니다. 매 턴 선공 순서를 교대합니다.</p><div class="battleBottom57"><section class="battlePanel57"><h3>개체 상태</h3><div id="battleUnits57"></div></section><section class="battlePanel57"><h3>전투 기록</h3><pre id="battleLog57"></pre></section></div></main></div></div>`;
 panel.insertAdjacentHTML('beforeend',`<section id="battleWatch57" hidden aria-label="몬스터 관전"><header id="battleWatchHeader57"><canvas id="battleSubjectArt57" width="64" height="64" aria-hidden="true"></canvas><div><label>관전 몬스터<select id="battleSubject57"></select></label><div id="battleWatchStats57"></div></div><span id="battleWatchRound57"></span></header><div id="battleWatchViewport57" aria-label="게임 화면"></div><footer id="battleWatchFooter57"><div id="battleWatchControls57"><button id="battleWatchPlay57">Ⅱ 일시정지</button><button id="battleWatchStep57">한 턴</button><button id="battleWatchReset57">재대결</button><select id="battleWatchSpeed57" aria-label="전투 속도"><option value="0.5">0.5배속</option><option value="1" selected>1배속</option><option value="2">2배속</option><option value="4">4배속</option></select><select id="battleWatchZoom57" aria-label="화면 배율"><option value="0">전체 보기</option><option value="0.75">75%</option><option value="1" selected>100%</option><option value="1.5">150%</option><option value="2">200%</option><option value="3">300%</option></select><button id="battleWatchMinus57" aria-label="축소">−</button><button id="battleWatchPlus57" aria-label="확대">＋</button><button id="battleWatchCenter57">대상 추적</button><button id="battleWatchInspect57">대상 조사</button><button id="battleWatchSetup57">편성으로</button><button id="battleWatchExit57">로비로</button></div><div id="battleWatchMessage57" role="status"></div></footer></section>`);
 document.body.append(panel);
 
 document.getElementById('debugBattleBtn57').onclick=openDebugBattle57;
 document.getElementById('battleGatekeeper57').addEventListener('change',debugBattlePreview57);
 for(const id of ['battleSearch57','battleGroup57'])document.getElementById(id).addEventListener('input',debugBattleFilter57);
 for(const id of ['battleMonster57','battleFloor57'])document.getElementById(id).addEventListener('input',debugBattlePreview57);
 for(const side of ['A','B'])document.getElementById('battleAdd'+side+'57').onclick=()=>debugBattleAdd57(side);
 document.getElementById('battleZoom57').onchange=e=>{const v=Number(e.target.value);if(v===0){debugBattleCamera57(true);debugBattleRender57(false);}else debugBattleZoom57(v);};document.getElementById('battleFollow57').onchange=e=>{if(e.target.checked)globalThis.__MANRU_CAMERA_STATE12__.center();else globalThis.__MANRU_CAMERA_STATE12__.beginInspect();debugBattleRender57(false);};
 for(const id of ['battleMap57','battleMapFloor57'])document.getElementById(id).onchange=()=>debugBattleCreateWorld57();
 document.getElementById('battleNewMap57').onclick=()=>debugBattleCreateWorld57(true);
 document.getElementById('battleRoom57').onchange=e=>{DEBUG_BATTLE57.roomKey=Number(e.target.value);DEBUG_BATTLE57.spawnAnchors=null;debugBattleCreateWorld57();};
 document.getElementById('battlePlantMove57').onchange=e=>{state.debugBattlePlantMove57=e.target.checked;debugBattleMessage57(e.target.checked?'식물 이동 허용 · 종 특성은 그대로 유지':'식물 원래 이동 규칙 적용');};
 document.getElementById('battleView57').onclick=debugBattleWatch57;debugBattleBindViewport57(document.getElementById('battleViewport57'));
 document.getElementById('battleExit57').onclick=closeDebugBattle57;document.getElementById('battlePlay57').onclick=debugBattlePlay57;
 document.getElementById('battleStep57').onclick=debugBattleStep57;
 document.getElementById('battleWatchStep57').onclick=debugBattleStep57;document.getElementById('battleWatchPlay57').onclick=debugBattlePlay57;document.getElementById('battleWatchReset57').onclick=debugBattleCreateWorld57;document.getElementById('battleWatchSetup57').onclick=debugBattleSetup57;document.getElementById('battleWatchExit57').onclick=closeDebugBattle57;
 document.getElementById('battleWatchSpeed57').onchange=e=>{document.getElementById('battleSpeed57').value=e.target.value};document.getElementById('battleWatchZoom57').onchange=e=>debugBattleZoom57(Number(e.target.value));
 document.getElementById('battleSubject57').onchange=e=>{document.getElementById('battleFollow57').checked=true;DEBUG_BATTLE57.subjectId=Number(e.target.value);debugBattleSubject57();globalThis.__MANRU_CAMERA_STATE12__.center();debugBattleRender57()};
 debugBattleBindViewport57(document.getElementById('battleWatchViewport57'));
 document.getElementById('battleWatchMinus57').onclick=()=>debugBattleZoom57(globalThis.__MANRU_CAMERA_STATE12__.desiredZoom()/1.25);
 document.getElementById('battleWatchPlus57').onclick=()=>debugBattleZoom57(globalThis.__MANRU_CAMERA_STATE12__.desiredZoom()*1.25);
 document.getElementById('battleWatchCenter57').onclick=()=>{document.getElementById('battleFollow57').checked=true;globalThis.__MANRU_CAMERA_STATE12__.center();debugBattleRender57();};
 document.getElementById('battleWatchInspect57').onclick=()=>{const m=debugBattleSubject57();if(m)debugBattleInspect57(m);};
 document.getElementById('battleReset57').onclick=debugBattleCreateWorld57;document.getElementById('battleTerrain57').onchange=debugBattleCreateWorld57;
 document.getElementById('battleClear57').onclick=()=>{DEBUG_BATTLE57.roster=[];debugBattleRoster57();debugBattleCreateWorld57()};
 panel.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();if(document.body.classList.contains('manru-inspect-open'))closeInspect();else closeDebugBattle57()}});
}
// Menu light radius and energy share one phase; reduced motion freezes the phase.
// Held equipment and item icons share the authored weapon pixels. Poses transform the asset about its actual grip.
function heldWeaponKey1001(item){const art=globalThis.__MANRU_ITEM_ART_R7__;return item?.name?(art?art.weaponAsset(item).key:'weapon-art-pending'):'unarmed'}
  const pick=(arr,h,shift=0)=>arr[((h>>>shift)%arr.length+arr.length)%arr.length];
  const titleMotion49=matchMedia('(prefers-reduced-motion:reduce)');
  function currentTalismanTarget(){return V56.target?{kind:V56.target.kind,range:V56.target.range}:null}
  function bounds58(cam,pad=2){
    const x0=Math.max(0,Math.floor((-cam.x/cam.zoom)/TILE)-pad),y0=Math.max(0,Math.floor((-cam.y/cam.zoom)/TILE)-pad);
    const x1=Math.min(COLS-1,Math.ceil(((VIEW.w-cam.x)/cam.zoom)/TILE)+pad),y1=Math.min(ROWS-1,Math.ceil(((VIEW.h-cam.y)/cam.zoom)/TILE)+pad);
    return{x0,y0,x1,y1};
  }
  const PALETTE71=[
    {floor:'#4a211a',floorAlt:'#5a291f',wall:'#7d382c',wallDark:'#2b0f0d',accent:'#e99150',light:'#ffd18c',fog:'#0b0403'},
    {floor:'#283029',floorAlt:'#313a31',wall:'#4d5348',wallDark:'#252a23',accent:'#93896a',light:'#cec6a6',fog:'#0b0f0c'},
    {floor:'#321c33',floorAlt:'#412443',wall:'#70486d',wallDark:'#211223',accent:'#d783b8',light:'#f5c4df',fog:'#0b050d'},
    {floor:'#343a3e',floorAlt:'#40484d',wall:'#6a7279',wallDark:'#171b1e',accent:'#c07b50',light:'#d8c8b0',fog:'#080a0b'},
    {floor:'#17192e',floorAlt:'#202442',wall:'#565b82',wallDark:'#090b19',accent:'#d9b84f',light:'#f7e39a',fog:'#03040a'}
  ];
  function smallTheme90(z){
    const g=state.grandRoom89;if(!g)return;let n=0;
    // only the grand room gets sparse, symmetric decoration; purpose rooms rely on functional identity.
    if(z===0){n+=sparsePair89(g,TT.LANTERN_POST,'top');if(g.w>=10)n+=sparsePair89(g,TT.BENCH,'bottom')}
    else if(z===1){n+=sparsePair89(g,TT.FLOWERBED,'top');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.ROCK)}
    else if(z===2){n+=sparsePair89(g,TT.WALL_BANNER,'top');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.STATUE)}
    else if(z===3){n+=sparsePair89(g,TT.RACK,'bottom');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.CRATE)}
    else{n+=sparsePair89(g,TT.STONE_PILLAR,'top');if(floorOnly88(g.cx,g.cy))setTerrainTile58(state.map,g.cx,g.cy,TT.STATUE)}
    state.decor=[];state.grandDecor90=n;
  }
  const classMotion1001=matchMedia('(prefers-reduced-motion:reduce)');
    function hash1004(s=''){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const keyPos1006=(x,y)=>state?.keyPlan96?.keys?.find(q=>q.x===x&&q.y===y&&q.active!==false)||null;
const doorPos1006=(x,y)=>state?.keyPlan96?.doors?.find(q=>q.x===x&&q.y===y&&q.open!==true)||null;
const px1012=(q,x,y,c)=>{q.fillStyle=c;q.fillRect(x,y,1,1)};
function dir1012(m,player=false){if(player){const f=state?.player?.facing||{x:0,y:1};return Math.abs(f.x)>Math.abs(f.y)?(f.x<0?'left':'right'):(f.y<0?'up':'down')}const t=m?.attackTarget,dx=t?Math.sign(t.x-m.x):0,dy=t?Math.sign(t.y-m.y):0;return Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down')}
const ARMOR_STYLE={'경량복':'light','강화 가죽 갑옷':'leather','철제 흉갑':'breast','관원용 두정갑':'dujeong','총사령관 황금갑':'gold'};
const CLOAK_EMBLEM={'질긴 가죽망토':'stitch','바람막이망토':'wind','여행자망토':'pocket','두꺼운 면망토':'quilt','암영망토':'eye','축지망토':'dash','자력망토':'magnet','무술망토':'knot','보호망토':'shield','반사망토':'mirror','용암망토':'flame','면역망토':'seal'};
function polyPlanter105(q,c,ps){q.fillStyle=c;q.beginPath();ps.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();q.fill();}
  function syncFloor23Gate60(){const q=state.floor23;if(state.floor!==23||!q)return false;for(const c of q.gateCells||[])setTerrainTile58(state.map,c.x,c.y,q.centerUnlocked?TT.DRAWBRIDGE_DOWN:TT.WALL);return true}
  function materializeFloor23Reveal60(sw){
    const branch=sw?.kind==='branch-reveal',q=state.floor23,r=branch?state.branchTerrain105?.reveals?.find(v=>v.switchId===sw.id):q?.reveal;if((!branch&&state.floor!==23)||!r||sw?.id!==r.switchId)return{handled:false};if(r.materialized||sw.used||sw.disabled)return{handled:true,changed:false,materialized:!!r.materialized};
    if(branch&&(r.cells||[]).some(c=>branchLeafAt(c.x,c.y)&&state.map[c.y]?.[c.x]===TT.PAPER_BRIDGE)){toast('잎사귀가 걸려 수문이 작동하지 않는다. 모든 잎을 없애야 한다.');return{handled:true,changed:false,reason:'leaves-block'}}
    const occupiedBefore=(r.cells||[]).filter(c=>runtimeTerrainOccupants57(c.x,c.y).length);if(occupiedBefore.length){toast('침수 구역에 누군가 있다. 뭍으로 물러나야 한다.');return{handled:true,changed:false,reason:'reveal-occupied',occupied:occupiedBefore.length}}
    if(branch&&(r.cells||[]).some(c=>tileBlocks(c.t)&&state.items.some(i=>i.x===c.x&&i.y===c.y))){toast('올라올 구조물 위에 물품이 걸려 있다.');return{handled:true,changed:false,reason:'reveal-item-occupied'}}
    for(const c of r.cells||[]){if(Number.isInteger(c.underlay)){const base=RuntimeTerrainOwner.mutate(c.x,c.y,c.underlay,{source:'f23-reveal-drain-base'});if(!base.ok)throw new Error(`F23 reveal base restore failed ${c.x},${c.y}:${base.reason}`)}const rr=RuntimeTerrainOwner.mutate(c.x,c.y,c.t,{source:'f23-reveal-drain'});if(!rr.ok||state.map[c.y]?.[c.x]!==c.t)throw new Error(`F23 reveal restore failed ${c.x},${c.y}:${rr.reason||'tile-rejected'}`)}
    const legal=(r.cells||[]).filter(c=>!tileBlocks(state.map[c.y]?.[c.x])&&![TT.MERCURY,TT.WATER,TT.LAVA,TT.VOID,TT.STAIR,TT.DOOR,TT.OPEN_DOOR].includes(state.map[c.y]?.[c.x])).sort((a,b)=>(Math.abs(b.x-sw.x)+Math.abs(b.y-sw.y))-(Math.abs(a.x-sw.x)+Math.abs(a.y-sw.y))),spawned=[];
    for(let i=0;i<(r.monsterNames||[]).length;i++){const name=r.monsterNames[i];let mon=null;for(const c of legal){if(spawned.some(v=>v.x===c.x&&v.y===c.y))continue;mon=spawnNamed(name,{x:c.x,y:c.y},{placementMode:'exact',provenance:'f23-reveal'});if(mon)break}if(mon)spawned.push({name:mon.name,x:mon.x,y:mon.y})}
    produceWallMaterials105();r.materialized=true;r.used=true;r.spawnBatches=(r.spawnBatches||0)+1;r.spawnedIds=spawned.map(v=>`${v.name}@${v.x},${v.y}`);sw.used=true;sw.disabled=true;impact(sw.x,sw.y,'#bde8e6',5);for(const c of (r.cells||[]).filter((_,i)=>i%Math.max(1,Math.floor((r.cells||[]).length/10))===0).slice(0,10))impact(c.x,c.y,'#d7f4f2',2);if(branch)branchRevealReward(r);addLog(branch?'수위가 낮아지며 물 아래의 석조 구조물이 솟아올랐다.':`제 ${r.districtId}구역의 수은 수위가 내려가며 잠겨 있던 건물군이 드러났다.`);toast('침수 구역 배수 완료');VisibilityService.compute();updateAll();return{handled:true,changed:true,materialized:true,spawned}
  }
  function safeFloor78(x,y){return x>1&&y>1&&x<COLS-2&&y<ROWS-2&&!imp78(x,y)&&[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS].includes(state.map[y]?.[x])}
  function normalizeDoors86(){
    if(!state||state.specialFloor)return 0;let removed=0;
    const pass=(x,y)=>in85(x,y)&&!tileBlocks(state.map[y][x]);
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(state.map[y][x]===TT.DOOR){
      const l=pass(x-1,y),r=pass(x+1,y),u=pass(x,y-1),d=pass(x,y+1),n=(l?1:0)+(r?1:0)+(u?1:0)+(d?1:0),valid=(l&&r&&!u&&!d)||(u&&d&&!l&&!r);
      if(!valid){setTerrainTile58(state.map,x,y,TT.FLOOR);removed++;}
    }
    state.doorCleanup86=removed;return removed;
  }
  function strategicPlacement85(path){
    if(!NORMAL85.has(state.floor)||!path?.length)return;
    const pathSet=new Set(path.map(p=>key85(p.x,p.y))),distPath=r=>{let best=1e9;for(const p of path){const d=Math.abs(p.x-r.cx)+Math.abs(p.y-r.cy);if(d<best)best=d}return best};
    const sideRooms=(state.rooms||[]).filter(r=>r.w>=5&&r.h>=5&&!pathSet.has(key85(r.cx,r.cy))).sort((a,b)=>distPath(b)-distPath(a));
    const rewardRoom=sideRooms.find(r=>distPath(r)>=4);
    if(rewardRoom&&ReachabilityService.playerPassable(rewardRoom.cx,rewardRoom.cy)&&!(state.items||[]).some(i=>Math.abs(i.x-rewardRoom.cx)+Math.abs(i.y-rewardRoom.cy)<3)){
      try{dropRandomItem({x:rewardRoom.cx,y:rewardRoom.cy},true);state.featureRooms=state.featureRooms||[];state.featureRooms.push({name:'측면 보급실',x:rewardRoom.x,y:rewardRoom.y,w:rewardRoom.w,h:rewardRoom.h,kind85:'reward'})}catch(error){ignoreError('side-room reward could not be placed; generation continues without it',error)}
    }
    const movable=(state.monsters||[]).filter(m=>!m.boss&&!m.fixed&&!m.aquatic&&!m.flying);
    const moveNear=(mon,anchor)=>{if(!mon||!anchor)return false;for(let r=0;r<=4;r++)for(let y=anchor.y-r;y<=anchor.y+r;y++)for(let x=anchor.x-r;x<=anchor.x+r;x++){if(!in85(x,y)||Math.max(Math.abs(x-anchor.x),Math.abs(y-anchor.y))!==r)continue;if(PlacementService.monsterCanStand(mon,x,y)){mon.x=x;mon.y=y;mon.alerted=false;return true}}return false};
    if(rewardRoom&&movable[0])moveNear(movable[0],{x:rewardRoom.cx,y:rewardRoom.cy});
    const doors=[];for(let y=2;y<ROWS-2;y++)for(let x=2;x<COLS-2;x++)if(state.map[y][x]===TT.DOOR&&pathSet.has(key85(x,y)))doors.push({x,y});
    if(doors.length&&movable[1])moveNear(movable[1],doors[Math.floor(doors.length*.55)]);
    if(sideRooms[1]&&movable[2])moveNear(movable[2],{x:sideRooms[1].cx,y:sideRooms[1].cy});
    state.strategy85={mainPath:path.length,sideRooms:sideRooms.length,rewardRoom:rewardRoom?{x:rewardRoom.cx,y:rewardRoom.cy}:null,guardedDoors:doors.length};
  }
  const DECOR88=new Set([TT.STONE_PILLAR,TT.LANTERN_POST,TT.WALL_BANNER,TT.CRATE,TT.BENCH,TT.FLOWERBED,TT.ROCK,TT.STATUE,TT.RACK,TT.LOW_FENCE,TT.CARPET,TT.STONE_PATH]);
  const CITADEL_PROP_TILES=Object.freeze({"bed":TT.BED,"white-bed":TT.RUMOR_BED,"prison-bed":TT.RUMOR_BED,"bench":TT.BENCH,"shelf":TT.RACK,"desk":TT.TABLE,"mapdesk":TT.TABLE,"table":TT.TABLE,"supplies":TT.CRATE,"stove":TT.COOKPOT,"medicine":TT.RUMOR_MED_CABINET,"sarcophagus":TT.STONE_PILLAR,"tomb":TT.STONE_PILLAR,"urns":TT.JAR,"chains":TT.RUMOR_WEAPON_RACK,"ritual":TT.ALTAR,"sigil":TT.ALTAR,"candles":TT.INCENSE_STAND,"treasure":TT.VAULT,"bell":TT.INCENSE_STAND,"crossbow":TT.RUMOR_WEAPON_RACK,"rack":TT.RUMOR_WEAPON_RACK,"iron-mask":TT.ARMORY,"shield":TT.ARMORY,"banner":TT.SCREEN,"furnace":TT.BRAZIER,"anvil":TT.ARMORY,"coal":TT.CRATE,"books":TT.BOOK_STACK,"statue":TT.STATUE,"incense":TT.INCENSE_STAND,"screen":TT.SCREEN});
  function floorOnly88(x,y){return in85(x,y)&&[TT.FLOOR,TT.GRASS,TT.LIGHT_GRASS,TT.STONE_PATH,TT.CARPET].includes(state.map[y][x])&&!OccupancyService.isOccupied(x,y)&&!(state.player.x===x&&state.player.y===y)&&!(state.stairs.x===x&&state.stairs.y===y)}
  function sparsePair89(r,t,side='top'){
    if(!r)return 0;let pts=[];
    if(side==='top')pts=[[r.x+2,r.y+2],[r.x+r.w-3,r.y+2]];
    else if(side==='bottom')pts=[[r.x+2,r.y+r.h-3],[r.x+r.w-3,r.y+r.h-3]];
    else pts=[[r.x+2,r.cy],[r.x+r.w-3,r.cy]];
    let n=0;for(const [x,y] of pts)if(floorOnly88(x,y)){setTerrainTile58(state.map,x,y,t);n++}return n;
  }
    function classGear(cls){return{weapon:cls?.startWeapon?{...(WEAPONS.find(w=>w.name===cls.startWeapon)||{}),name:cls.startWeapon}:null,armor:{...(ARMORS?.[0]||{}),name:ARMORS?.[0]?.name||'경량복',tier:1,rarity:'common'},cloak:null,relic:null,trinket:null}}
/* r5: floor edge blending is terrain-only; never paint gradients across doors or decoration cells. */
const GRAD_TERRAIN1025=new Set([TT.FLOOR,TT.GRASS,TT.CARPET,TT.STONE_PATH,TT.WOOD_FLOOR,TT.MOON_STONE,TT.DARK_WOOD,TT.GILDED_FLOOR,TT.GOLD].filter(v=>v!=null));
function playerKey1012(id,p,dir,attack){const g=x=>x?`${x.name||''}:${x.tier||0}:${x.rarity||''}:${x.upgrade||0}`:'-';return`${id}|${dir}|${attack?1:0}|${heldWeaponKey1001(p?.weapon)}|${g(p?.weapon)}|${g(p?.armor)}|${g(p?.cloak)}|${g(p?.relic)}|${g(p?.trinket)}`}
function debugBattleCatalog57(){
 const list=monsterSpeciesCatalog();
 list.push({def:storyInvestigatorDefinition(),group:'보스'},{def:PALACE_KING105,group:'보스'});
 const martial=(rank,style,final=false,pursuer=false)=>{const spec={rank,style,final,pursuer,level:final||pursuer?2:1},def=dojoCreateMartialist(rank,-1,style*10+rank,final,style,{level:spec.level,pursuer});if(!final)def.name=DOJO_STYLE_WEIGHTS105[style].name.split(' · ')[0]+' '+def.name;list.push({def,group:'무도가',dojo:spec});};
 for(let style=0;style<DOJO_STYLE_WEIGHTS105.length;style++){for(let rank=1;rank<=4;rank++)martial(rank,style);martial(4,style,false,true);}martial(4,5,true);
 const seen=new Set();return list.filter(e=>{if(seen.has(e.def.name))return false;seen.add(e.def.name);return true}).sort((a,b)=>a.def.name.localeCompare(b.def.name,'ko'));
}
function debugBattleMonster57(entry,floor,gatekeeper=false,preview=false){
 let mon;if(entry.dojo){const d=entry.dojo;mon=preview?clone(entry.def):dojoCreateMartialist(d.rank,-1,DEBUG_BATTLE57.serial+1,d.final,d.style,{level:d.level,pursuer:d.pursuer});mon.name=entry.def.name;}else mon=scaledMonster(clone(entry.def),floor,{inventory:!preview});
 if(mon.equipmentActor105)updateEquipmentPhase105(mon);if(gatekeeper)globalThis.__MANRU_LEGEND47__.gatekeeper(mon,floor);return mon;
}
function burst(x,y,color="#ffffff",count=9,power=1){
  const now=performance.now();
  for(let i=0;i<count;i++){
    const a=globalThis.__MANRU_RANDOM57__()*Math.PI*2, sp=(0.45+globalThis.__MANRU_RANDOM57__()*1.4)*power;
    FX.particles.push({
      x:x*TILE+TILE/2,y:y*TILE+TILE/2,
      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
      color,start:now,life:260+globalThis.__MANRU_RANDOM57__()*420,size:1+globalThis.__MANRU_RANDOM57__()*2.4
    });
  }
}
function markMoveDirty(ctx){if(ctx.moved)RENDER_PERF_STATE.dirty=true}
function footstepFeedback(ctx){if(state&&ctx.moved){const terrain=state.map[state.player.y]?.[state.player.x],now=performance.now();if(now-V54.lastFoot>55){V54.lastFoot=now;sfx54([TT.WATER,TT.RAFT].includes(terrain)?'stepWater':regionIndex()===3?'stepMetal':regionIndex()===0?'stepWood':'stepStone')}if(ctx.targetTile===TT.DOOR)sfx54('door')}}
window.__MANRU_CLEAR_HI_CACHE__=()=>{
    for(const m of [...Object.values(HI_CACHE),SHARED_PROP_ART,LAVA_ART_CACHE,FIRE_ART_CACHE,KEEPER_BRIDGE_ART])m.clear();
  };
globalThis.__MANRU_TRANSIENT47__=Object.freeze({trim:trimTransient});
globalThis.__MANRU_RENDER47__=Object.freeze({invalidate:()=>{P47.force=true;P47.cullKey='';return true}});
globalThis.__MANRU_BOSS54__={draw:drawBossIntent};
globalThis.__MANRU_POTION_ART_56__={iconHtml:potionIconHtml56R,worldDraw:drawPotionWorld56R};
globalThis.__MANRU_DRAW_BASE58__=drawFast;
window.__MANRU_RESUME_R6__={schedule:scheduleResume71};
globalThis.__MANRU_CAMERA_PROJECTION12__=CameraProjection;
globalThis.__MANRU_WORLD_HITTEST12__=WorldHitTest12;
window.__MANRU_V984_SET_ZOOM__=(v,anchor=null)=>CameraState.setZoom(v,false,anchor);
globalThis.__MANRU_CAMERA984__=Object.freeze({zoomByScale(scale,anchor=null){return CameraState.setZoom(cameraData.zoom*scale,false,anchor)}});
window.__MANRU_ACTOR_CACHE1011__={clear:()=>{HERO_SPRITE_CACHE.clear();return true}};
globalThis.__MANRU_DRAW_ITEM_IMPL_R7__=worldDraw;
globalThis.__MANRU_DEBUG_BATTLE57__=Object.freeze({snapshot:()=>DEBUG_BATTLE57.open?{round:DEBUG_BATTLE57.round,watching:!!DEBUG_BATTLE57.watching,subject:DEBUG_BATTLE57.subjectId,playing:DEBUG_BATTLE57.playing,winner:DEBUG_BATTLE57.winner,catalog:DEBUG_BATTLE57.catalog.map(e=>({name:e.def.name,group:e.group})),units:state.monsters.map(m=>({id:m.debugId57,name:m.name,side:m.debugSide57,x:m.x,y:m.y,hp:m.hp,maxHp:m.maxHp,atk:m.atk,def:m.def,faction:entityFaction(m),cells:entityFootprintCells57(m),revive:m.revivePhase57})),debug:state.debugBattle57,map:{width:COLS,height:ROWS,rooms:state.rooms.length,tiles:[...new Set(state.map.flat())]},patterns:state.monsters.filter(m=>m.boss).map(m=>({id:combatantId(m),name:m.name,faction:entityFaction(m),intent:m.intent54?.type,core:m.coreStage54,links:m.silk54?.links.length})),owners:state.monsters.filter(m=>m.bossOwnerId57).map(m=>({name:m.name,owner:m.bossOwnerId57,faction:entityFaction(m),fixture:m.combatFixture54}))}:null});
const legacyPotionIcon=globalThis.__MANRU_POTION_ART_56__?.iconHtml||null;
const legacyPotionDraw=globalThis.__MANRU_POTION_ART_56__?.worldDraw||null;
const BRANCH_INTERACTIVE_OVERLAYS105=new Set([TT.DOOR,TT.OPEN_DOOR,TT.LOCKED_GATE,TT.SWITCH,TT.KEY_TILE,TT.RUMOR,TT.BRAZIER,TT.TRAP,TT.ARMORY,TT.FOUNTAIN,TT.MIRROR,TT.ALTAR,TT.VAULT,TT.SNARE,TT.CACHE,TT.COOKPOT]);
function effectsUpdate(now){
  FX.rings=FX.rings.filter(r=>now-r.start<r.life);FX.doors=FX.doors.filter(d=>now-d.start<d.life);FX.slashes=FX.slashes.filter(s=>now-s.start<s.life);FX.projectiles=FX.projectiles.filter(p=>now-p.start<p.life);FX.particles=FX.particles.filter(p=>now-p.start<p.life);FX.floats=FX.floats.filter(f=>now-f.start<f.life);
  for(const p of FX.particles){p.x+=p.vx;p.y+=p.vy;p.vx*=.96;p.vy*=.96;p.vy+=.015}
  if(FX.transition&&now-FX.transition.start>=FX.transition.life)FX.transition=null;
  if(FX.particles.length>40)FX.particles.splice(0,FX.particles.length-40);if(FX.floats.length>12){const labels=FX.floats.filter(f=>!f.damage57).slice(-12);FX.floats=FX.floats.filter(f=>f.damage57||labels.includes(f))}
}
function monsterMotionUpdate(now){if(!state)return;for(const m of state.monsters||[]){let v=MON_VIS.get(m);if(!v){v={x:m.x,y:m.y,last:now};MON_VIS.set(m,v);continue}if(v.forced105){const f=forcedMotionSample(v.forced105,now);if(f){v.x=f.x;v.y=f.y;v.last=now;if(!f.done)continue}v.forced105=null}const dt=Math.min(.05,Math.max(.001,(now-v.last)/1000)),a=1-Math.exp(-dt*18*automationPresentationRate70());v.last=now;v.x+=(m.x-v.x)*a;v.y+=(m.y-v.y)*a}}
function martialPulseUpdate(now){if(FX965.pulse&&now>=FX965.pulse.until)FX965.pulse=null}
function foodPostTurn(ctx){const b=ctx.food57||{};if(state&&!state.dead&&state.turn!==b.turn&&state.turn%10===0&&state.player.hunger<=0){const raw=(playerCloak().focusRegen||1)>=2?2:1,gained=Math.max(0,state.player.focus-(b.focus??state.player.focus));state.player.focus=Math.max(0,state.player.focus-Math.min(gained,raw*.5));if(typeof updatePanels==='function')updatePanels()}}
function cameraSavePostTurn(){if(state&&!state.dead&&!state.victory){const px=state.player?.x,py=state.player?.y;if(cameraData.lastPlayerX!=null&&cameraData.lastPlayerY!=null&&(px!==cameraData.lastPlayerX||py!==cameraData.lastPlayerY)){cameraData.lastPlayerX=px;cameraData.lastPlayerY=py;CameraState.setMode('follow',false);const p=(()=>{const p=visualPlayerPosition();return{x:p.worldX,y:p.worldY}})();cameraData.tx=p.x;cameraData.ty=p.y}}}
function resourcePostGeneration(){guaranteedResource48();P47.cullKey='';P47.decorKey='';P47.force=true}
function knowledgePostGeneration(){return onFloorGenerated56()}
function polishPostGeneration(){polish78();VisibilityService.compute()}
function qualityPostPostGeneration(){state.itemBiasZones94=state.itemBiasZones94||[];if(!state.specialFloor){normalizeDoors86();sanitizeWindows88()}if(state.specialFloor)installKeyTrial();if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();biasItems();coherentDecor94();if(!state.specialFloor){normalizeDoors86();sanitizeWindows88()}if(window.__MANRU_RUNTIME81__?.Integrity81)window.__MANRU_RUNTIME81__.Integrity81.repair();VisibilityService.compute()}
function clearPathPreview(){
  /* ===== MANRU v1.0 VERIFIED VISUAL + AUTOWALK PASS ===== */
  VIS.hoverPath=null;
  VIS.autoPath=null;
  VIS.tapTrack=null;
}
function bindCanvasHover(){
  /* r53: removed overwritten camera implementation. */
  
  
  
  // Continuous auto-tiled wall masses: fewer "boxed tiles", stronger architecture.
  
  
  
  
  // Local light islands inspired by high-contrast pixel dungeons: readable near the player, deep elsewhere.
  
  
  
  // Architectural front faces, wall scrolls, and subdued non-interactive room dressing.
  
  
  
  
  
  
  
  
  
  
  
  
  C.addEventListener('mousemove',e=>{if(!state||isMobileViewport())return;const t=globalThis.__MANRU_WORLD_HITTEST12__.cellAtClient(e.clientX,e.clientY);VIS.hoverPath=t?ReachabilityService.visiblePath(t.x,t.y):null}, {passive:true});
  C.addEventListener('mouseleave',()=>VIS.hoverPath=null,{passive:true});
}
function startVisualAssetLoads(){
  VF_IMG.creature.src=VF_ASSETS.creature_uri;
  VF_IMG.tile.src=VF_ASSETS.tile_uri;
  VF_IMG.decor.src=VF_ASSETS.decor_uri;
  VF_IMG.item.src=VF_ASSETS.item_uri;
}
function createAutoStateBadge(){
  vfAuto.id='vfAutoState';
  document.getElementById('canvasWrap').appendChild(vfAuto);
}
function createZoomHud(){
  zoomHud.id='zoomHud';
  zoomHud.innerHTML='<button type="button" id="zoomOutBtn">－</button><span class="zoomVal" id="zoomVal">100%</span><button type="button" id="zoomInBtn">＋</button>';
  document.getElementById('canvasWrap').appendChild(zoomHud);
  zoomHud.querySelector('#zoomOutBtn').onclick=()=>adjustZoom(-1);
  zoomHud.querySelector('#zoomInBtn').onclick=()=>adjustZoom(1);
    C.addEventListener('click',e=>{if(performance.now()<window.__manruZoomSuppressUntil){e.preventDefault();e.stopImmediatePropagation()}}, {capture:true});
    
    /* r53: removed overwritten camera implementation. */
    
    updateZoomHud();
}
function initInspectOverlay(){
    const wrap=inspectWrap();
    if(wrap){
      wrap.setAttribute('aria-hidden',wrap.classList.contains('open')?'false':'true');
      wrap.addEventListener('pointerdown',()=>{if(DEBUG_BATTLE57.open)DEBUG_BATTLE57.inspectRelease57=null;},{capture:true});
      const closeBackdrop=(e)=>{
        const release=DEBUG_BATTLE57.open&&DEBUG_BATTLE57.inspectRelease57;
        if(release&&inputNow()<release.until&&(e.pointerId===release.id||!e.pointerId&&Math.hypot(e.clientX-release.x,e.clientY-release.y)<12)){DEBUG_BATTLE57.inspectRelease57=null;e.preventDefault();e.stopImmediatePropagation();return;}
        if(e.target!==wrap||!inspectOpen())return;e.preventDefault?.();e.stopPropagation?.();InputRouter.dispatch({type:'MODAL_CANCEL',source:'inspect-backdrop'})
      };
      wrap.addEventListener('click',closeBackdrop,{capture:true});
    }
    // Inventory inspect actions use the clean, non-duplicated item formatter.
    // r34: obsolete inventory-inspect wrapper removed; r53 post-stage owns inspect rebinding.
  
    // If a stale timer/old sheet survived load, start from a clean state.
    cancelLongPresses();
  document.body.classList.remove('manru-inspect-open');
  if(wrap&&!wrap.classList.contains('open'))wrap.setAttribute('aria-hidden','true');
}
function startTitleCanvas(){
    /* ---------- title / hero select: full-screen art, real mobile scrolling ---------- */
  
  
  
  
  
  
  
  
    drawTitleCanvas();
    addEventListener('resize',()=>{const c=document.getElementById('titleCanvas49');if(c&&c.dataset.mobile!==(innerWidth<700?'1':'0'))drawTitleCanvas()},{passive:true});
}
function createPadToggle(){
  /* ===== MANRU v5.8: PERFORMANCE / DENSITY / KOREAN UI HOTFIX ===== */
  
    // ---- mobile pad toggle
    let pad58=document.getElementById('padToggle58');
    if(!pad58){pad58=document.createElement('button');pad58.id='padToggle58';pad58.type='button';pad58.textContent='십';document.body.appendChild(pad58)}
    try{if(localStorage.getItem('manruPad58')==='0')document.body.classList.add('pad58-hidden')}catch(error){ignoreError('pad visibility unreadable',error)}
    pad58.onclick=e=>{e.preventDefault();e.stopPropagation();document.body.classList.toggle('pad58-hidden');try{localStorage.setItem('manruPad58',document.body.classList.contains('pad58-hidden')?'0':'1')}catch(error){ignoreError('pad visibility could not be saved',error)}};
}
function bindResumeListeners(){
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){clearTimeout(resumeTimer71);pageWasHidden=true;if(fullscreenWanted66)fullscreenResume66=true;return}
      scheduleResume71('visible',35);
    },true);
    window.addEventListener('pageshow',e=>{
      if(e.persisted)pageWasHidden=true;scheduleResume71('pageshow',0);
    },{passive:true});
    window.addEventListener('focus',()=>scheduleResume71('focus',65),{passive:true});
    window.addEventListener('orientationchange',()=>scheduleResume71('orientation',100),{passive:true});
    document.addEventListener('fullscreenchange',()=>scheduleResume71('fullscreen',80),{passive:true});
    for(const canvas of [C,MC]){
      canvas?.addEventListener?.('contextlost',e=>{e.preventDefault();clearHeldInput53();cancelAutoWalk()});
      canvas?.addEventListener?.('contextrestored',()=>scheduleResume71('canvas-contextrestored',0),{passive:true});
    }
}
function visualLoop(now=performance.now()){
    try{
    if(!state?.debugBattle57)advanceHeldInput(now);
    if(!document.hidden&&!window.__MANRU_PAUSE_RENDER61){
      const w=innerWidth,h=innerHeight;
      if(document.body.dataset.manruScreen==='title'){
        if(document.body.classList.contains('title-class-mode'))paintClassLighting(now);
        else paintTitleLights(now);
      }
      if(!state?.debugBattle57&&(w!==RC.vw||h!==RC.vh||now-RC.lastViewport>900)){RC.vw=w;RC.vh=h;RC.lastViewport=now;syncGameViewport()}
      if(state?.debugBattle57)debugBattleFrame57(now);
      if(state&&!state.debugBattle57){
        dojoSleepFrame(now);updateVisualMotion(now);
        const active=active70(),budget=active?(state.branchContext105?33:16):(now-hearthAnimationSeen105<400?(isMobileViewport()?90:66):(isMobileViewport()?230:130)),pending=renderUpdatePending;
        if(pending||cameraRenderPending||now-RC.lastDraw>=budget){
          const t=performance.now();if(pending)updateAll(true);else drawMap(false);const cost=performance.now()-t;RC.perf.lastCost=cost;RC.perf.frames++;RC.perf.ema+= (cost-RC.perf.ema)/Math.min(120,RC.perf.frames);RC.lastDraw=now;
        }
        if(mapModalOpen()&&now-RC.lastMini>180){drawMinimap(true);RC.lastMini=now}
        if(now-RC.lastHud>120){updateAttackButton();RC.lastHud=now}
      }
    }
    }catch(error){
      if(!RC.renderRecoveryAt||now-RC.renderRecoveryAt>1000){
        RC.renderRecoveryAt=now;console.error('[MANRU frame recovery]',error);
        globalThis.__MANRU_RESUME_R6__?.schedule?.('frame-error',0);
      }
    }finally{requestAnimationFrame(visualLoop)}
  }
function updatePanels(){
    if(!state)return;const p=state.player,st=getStats(),region=regionFor(state.floor),side=!!state.artifactDungeon46,location58=hudLocation58();
    setText('floorTxt',location58.desktop);setText('regionTxt',location58.kind==='branch'?location58.tag:side?'전설 던전':location58.kind==='rumor'?`소문 공간 · ${String(state.floor).padStart(2,'0')}층`:region[2]);setText('depthLore',location58.kind==='branch'?location58.full:side?location58.full:location58.kind==='rumor'?location58.full:region[3]);setText('hpTxt',`${displayHealth(p.hp)} / ${displayHealth(p.maxHp)}`);setWidth('hpFill',(100*p.hp/p.maxHp)+'%');setText('manaTxt',`${displayNumber53(p.focus)} / ${st.maxFocus}`);setWidth('manaFill',(100*p.focus/st.maxFocus)+'%');setText('xpTxt',p.level>=BALANCE.maxLevel?`LV ${p.level} · MAX · 무술 ${p.skillPoints}`:`LV ${p.level} · ${p.xp}/${p.nextXp} · 무술 ${p.skillPoints}`);setWidth('xpFill',(p.level>=BALANCE.maxLevel?100:Math.min(100,100*p.xp/Math.max(1,p.nextXp)))+'%');
    setText('atkTxt',st.atk);setText('defTxt',displayDef42(st.def));setText('evaTxt',st.eva);setText('wilTxt',st.will);setText('visTxt',st.vision);setText('weaponTxt',p.weapon?p.weapon.name:'맨손');setText('armorTxt',p.armor?p.armor.name:'경량복');setText('cloakTxt',p.cloak?p.cloak.name:'없음');setText('relicTxt',p.relic?p.relic.name:'없음');setText('trinketTxt',p.trinket?p.trinket.name:'없음');
    setHTML('skillTxt',`<b>무술</b> · 포인트 ${p.skillPoints}<br>${MARTIAL_RULES.ids.map(id=>`${martialPresentation(id,MARTIAL_INFO[id],p).name} ${p.martial[id]}/${martialCap(id,p)}`).join(' · ')} · 점멸 ${p.blinkLevel||0}<br><span style="color:#8f795f">공격비용 ${attackTurnCost().toFixed(1)}턴 · 사거리 ${weaponRange()}</span>`);setText('alertTxt',Math.round(p.hunger)+'%');setWidth('alertFill',Math.min(100,p.hunger)+'%');
    const visibleMonsters=state.monsters.filter(isThreatVisibleToPlayer);let near=null,nearDistance=Infinity;for(const mon of visibleMonsters){const distance=entityDistance57(mon,p);if(distance<nearDistance){near=mon;nearDistance=distance}};setHTML('monsterInfo',near?`<b style="color:${near.color}">${near.name}</b><br>HP ${displayHealth(near.hp)}/${displayHealth(near.maxHp)} · ATK ${near.atk} · DEF ${near.def} · EVA ${near.eva}${near.boss?'<br>구역 보스':''}`:'주변 생체 반응 없음.');setText('statusLine',`TURN ${state.turn} · ${p.combustion105?`연소 ${p.combustion105.remaining}턴 · `:''}${statusSummary()} · 허기 ${Math.round(p.hunger)}${p.hunger<=0?' (ATK -20%)':''}`);updateDebuffHud();setText('turnTxt',`${location58.challenge?location58.challenge+' · ':''}TURN ${state.turn} · 적 행동 ${Math.floor(state.enemyEnergy||0)}/${((state.enemyEnergy||0)%1).toFixed(2)}`);
    const logs=state.log.slice(0,10),sig=logs.join('\u0001');if(sig!==RENDER_PERF_STATE.lastLog){RENDER_PERF_STATE.lastLog=sig;const log=document.getElementById('messageLog');if(log)log.innerHTML=logs.map(x=>'<div>'+x+'</div>').join('')}
    setText('miniMonsters','적 '+visibleMonsters.length);setText('miniItems','아이템 '+state.items.filter(i=>VisibilityService.isVisible(i.x,i.y)).length);setText('miniCells',`턴 ${state.turn} · 무술 ${p.skillPoints}`);setText('miniThreat','허기 '+Math.round(p.hunger)+'%');
    const eqSig=[p.weapon?.name,p.armor?.name,p.cloak?.name,p.relic?.name,p.trinket?.name].join('|');if(eqSig!==RENDER_PERF_STATE.lastEquip){RENDER_PERF_STATE.lastEquip=eqSig;bindEquipInspect()}
    updateMobileHud();updateAttackButton();if(drawerOpen())renderMobileDrawer();RENDER_PERF_STATE.panelDirty=false;RENDER_PERF_STATE.lastPanel=performance.now();runPanelHooks();
  }
window.__manruZoomActive=false;
window.__manruZoomSuppressUntil=0;
globalThis.__MANRU_DRAW_HOOKS_R19__={world:[{id:'role61',draw:drawRoleOverlay},{id:'legendary47',draw:drawLegendWorld}],post:[{id:'boss-intent54',draw:drawBossIntent},{id:'feeling62',draw:drawFeelingOverlay},{id:'element74',draw:drawElementOverlay},{id:'martial965',draw:drawMartialOverlay},{id:'hazard1005',draw:drawHazardOverlay}]};
const VF_IMG={creature:new Image(),tile:new Image(),decor:new Image(),item:new Image()};
