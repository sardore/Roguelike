import type { GameState, Point, Tile } from '../game/types';

const TS=32;
const P={
  void:'#060706',ink:'#11130f',mortar:'#20221c',stone:'#403d33',stoneHi:'#6d6652',stoneLo:'#2a2b25',
  street:'#3d4037',street2:'#4d5044',streetHi:'#737461',wood:'#5c412d',woodHi:'#a1774e',woodLo:'#302319',
  brass:'#9b743e',brassHi:'#d1a45a',copper:'#a45d35',copperHi:'#da8748',glass:'#6fa59b',glassHi:'#b8d5ca',
  herb:'#607044',herbHi:'#9aaa70',acid:'#849348',acidHi:'#d7da70',water:'#31575d',waterHi:'#82a6a2',
  red:'#b35d48',cloth:'#875b4d',bone:'#d3c9aa',purple:'#665366'
};
const rnd=(x:number,y:number,v=0)=>{let n=Math.imul(x+31*y+v*131,0x45d9f3b);n=(n^(n>>>16))>>>0;return n/4294967296};
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke()}
function txt(c:CanvasRenderingContext2D,s:string,x:number,y:number,col:string,size=7){c.fillStyle=col;c.font=`700 ${size}px ui-monospace,monospace`;c.textAlign='center';c.textBaseline='middle';c.fillText(s,x,y)}

function drawStreet(c:CanvasRenderingContext2D,x:number,y:number,t:Tile){
  const X=x*TS,Y=y*TS,r=rnd(x,y,t.variant);px(c,X,Y,TS,TS,P.street);
  for(let yy=0;yy<4;yy++){const off=(yy&1)*8;for(let xx=-1;xx<3;xx++){const bx=X+xx*16+off,by=Y+yy*8;px(c,bx+1,by+1,14,6,((xx+yy+t.variant)%4===0)?P.streetHi:P.street2);px(c,bx+1,by+6,14,1,'#252821');px(c,bx+14,by+1,1,6,'#2a2c25')}}
  if((x+t.variant)%5===0){px(c,X+2,Y+25,28,3,'#283733');px(c,X+5,Y+26,13,1,'#678076',.5)}
  if(r>.66){px(c,X+4+Math.floor(r*17),Y+5+Math.floor((1-r)*15),6,1,'#8b7654',.45);px(c,X+22,Y+10,2,2,'#7d4936',.5)}
}
function drawRoomFloor(c:CanvasRenderingContext2D,x:number,y:number,t:Tile){
  const X=x*TS,Y=y*TS,r=rnd(x,y,t.variant),room=t.room??'';
  if(room==='herbalist'){
    px(c,X,Y,TS,TS,'#342d23');for(let yy=0;yy<4;yy++)for(let xx=0;xx<4;xx++){px(c,X+xx*8+1,Y+yy*8+1,6,6,(xx+yy+t.variant)%2?'#574533':'#46382b');if((xx*3+yy+t.variant)%6===0)px(c,X+xx*8+3,Y+yy*8+3,2,2,P.herb,.8)}
  }else if(room==='distillery'){
    px(c,X,Y,TS,TS,'#282820');for(let yy=0;yy<4;yy++){ln(c,X,Y+yy*8,X+TS,Y+yy*8,'#171914');for(let xx=(yy&1)*8;xx<TS;xx+=16)ln(c,X+xx,Y+yy*8,X+xx,Y+yy*8+8,'#171914')}if(r>.5)px(c,X+4,Y+4,20,2,'#6c5636',.55);
  }else if(room==='courtyard'){
    px(c,X,Y,TS,TS,'#30372b');for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++){px(c,X+xx*16+1,Y+yy*16+1,14,14,(xx+yy+t.variant)%3?'#414a38':'#535d45');px(c,X+xx*16+2,Y+yy*16+13,10,1,'#252b23')}if(r>.42){px(c,X+7,Y+8,3,4,P.herb,.65);px(c,X+9,Y+7,2,2,P.herbHi,.6)}
  }else if(room==='sealed-shop'){
    px(c,X,Y,TS,TS,'#2d2928');for(let yy=0;yy<4;yy++)for(let xx=0;xx<4;xx++){px(c,X+xx*8+1,Y+yy*8+1,6,6,(xx+yy+t.variant)%3?'#423a35':'#514344');if((xx+yy+t.variant)%7===0)px(c,X+3+xx*8,Y+3+yy*8,2,2,P.purple,.65)}
  }else if(room==='north-alley'||room==='service-passage'){
    px(c,X,Y,TS,TS,'#2c302a');for(let yy=0;yy<4;yy++)for(let xx=0;xx<2;xx++){px(c,X+xx*16+1,Y+yy*8+1,14,6,'#3e443a');px(c,X+1+xx*16,Y+7+yy*8,14,1,'#1e211c')}if(r>.7)px(c,X+5,Y+22,17,2,'#5b6e60',.4);
  }else drawStreet(c,x,y,t);
  if(t.variant===15){px(c,X+2,Y+15,28,2,'#e0d8b9');px(c,X+10,Y+13,9,1,'#fff3d0')}
}
function drawFloor(c:CanvasRenderingContext2D,x:number,y:number,t:Tile){if(t.room==='apothecaries-row'||t.room==='street-drain')drawStreet(c,x,y,t);else drawRoomFloor(c,x,y,t)}

function drawWall(c:CanvasRenderingContext2D,x:number,y:number,t:Tile,s:GameState){
  const X=x*TS,Y=y*TS,room=t.room??'';const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;const north=y>0?s.tiles[(y-1)*s.width+x]:undefined;const faceSouth=!!south&&south.kind!=='wall';const faceNorth=!!north&&north.kind!=='wall';
  let base='#474438',hi='#625c49';if(room.includes('herbalist')){base='#4d4937';hi='#72684b'}else if(room.includes('distillery')){base='#48443a';hi='#6d6048'}else if(room.includes('courtyard')){base='#3e4639';hi='#5d674f'}else if(room.includes('sealed')){base='#403837';hi='#62514f'}
  px(c,X,Y,TS,TS,'#141612');px(c,X,Y+3,TS,27,base);px(c,X,Y+3,TS,3,hi);
  for(let yy=0;yy<3;yy++){const off=(yy&1)*7;for(let xx=-1;xx<3;xx++){const bx=X+xx*15+off,by=Y+6+yy*8;px(c,bx+1,by+1,13,6,yy===0?hi:base);ln(c,bx+1,by+7,bx+14,by+7,'#282a22');ln(c,bx+14,by+1,bx+14,by+7,'#292b23')}}
  if(faceSouth||faceNorth){const edgeY=faceSouth?26:2;px(c,X,edgeY,TS,4,'#171914');px(c,X,faceSouth?25:6,TS,2,P.stoneHi,.48)}
  if(faceSouth){const motif=(x+t.variant)%7;if(motif===1||motif===5){px(c,X+6,Y+9,20,14,'#1c211c');px(c,X+8,Y+10,16,11,room.includes('distillery')?'#4a695d':'#527065');px(c,X+15,Y+10,2,11,P.brass,.82);px(c,X+8,Y+15,16,2,P.brass,.72);px(c,X+10,Y+11,4,2,P.glassHi,.3)}if(room.includes('distillery')&&(x+t.variant)%3===0){px(c,X+3,Y+8,5,17,P.copper);px(c,X+4,Y+8,2,17,P.copperHi);px(c,X+1,Y+8,9,3,P.brass);px(c,X+1,Y+22,9,3,P.brass)}}
}
function floorEdges(c:CanvasRenderingContext2D,x:number,y:number,t:Tile,s:GameState){if(t.kind==='wall')return;const X=x*TS,Y=y*TS,n=y>0?s.tiles[(y-1)*s.width+x]:undefined,so=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined,w=x>0?s.tiles[y*s.width+x-1]:undefined,e=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;if(n?.kind==='wall'){px(c,X,Y,TS,4,'#131510',.72);px(c,X,Y+4,TS,2,'#887858',.32)}if(so?.kind==='wall')px(c,X,Y+29,TS,3,'#12140f',.54);if(w?.kind==='wall')px(c,X,Y,3,TS,'#10120e',.42);if(e?.kind==='wall')px(c,X+29,Y,3,TS,'#796b51',.17)}
function door(c:CanvasRenderingContext2D,x:number,y:number,v:number){const X=x*TS,Y=y*TS;drawStreet(c,x,y,{kind:'floor',variant:v,room:'apothecaries-row',discovered:true,visible:true});px(c,X+2,Y,5,32,P.woodLo);px(c,X+25,Y,5,32,P.woodLo);px(c,X+4,Y,3,31,P.brass);px(c,X+25,Y,3,31,P.brass);px(c,X+7,Y+3,14,25,P.wood);px(c,X+9,Y+5,10,21,'#79563a');ln(c,X+20,Y+5,X+25,Y+2,P.woodHi,2);ln(c,X+20,Y+26,X+25,Y+29,'#2a2019',2);px(c,X+18,Y+15,3,3,P.brassHi);if(v>=4)for(let i=0;i<3;i++)ln(c,X+6,Y+7+i*7,X+22,Y+12+i*7,'#8b6642',2)}
function liquid(c:CanvasRenderingContext2D,x:number,y:number,k:'water'|'acid'|'fire',v:number){const X=x*TS,Y=y*TS;drawStreet(c,x,y,{kind:'floor',variant:v,room:'apothecaries-row',discovered:true,visible:true});if(k==='water'){px(c,X+2,Y+18,28,11,P.water,.9);px(c,X+5,Y+20,17,2,P.waterHi,.75);px(c,X+17,Y+25,10,1,'#b2cac2',.5)}else if(k==='acid'){px(c,X+2,Y+17,28,12,'#4b572f');px(c,X+4,Y+19,24,9,P.acid,.9);for(let i=0;i<6;i++){const r=rnd(x+i,y,v);px(c,X+4+Math.floor(r*22),Y+19+Math.floor((1-r)*7),2+(i&1),2,P.acidHi,.72)}}else{px(c,X+5,Y+20,22,9,'#6a3020');px(c,X+8,Y+14,6,14,'#b34d28');px(c,X+17,Y+16,7,12,'#df7733');px(c,X+12,Y+9,5,17,'#f1ba5f');px(c,X+14,Y+8,2,10,'#fff0a0')}}
function stairs(c:CanvasRenderingContext2D,x:number,y:number){const X=x*TS,Y=y*TS;drawRoomFloor(c,x,y,{kind:'floor',variant:2,room:'sealed-shop',discovered:true,visible:true});px(c,X+4,Y+4,24,24,'#10130f');for(let i=0;i<5;i++){px(c,X+6+i*2,Y+23-i*3,20-i*4,3,'#76684e');px(c,X+7+i*2,Y+23-i*3,18-i*4,1,'#b19c70')}px(c,X+7,Y+4,18,2,P.brassHi)}

function jar(c:CanvasRenderingContext2D,x:number,y:number,col:string){px(c,x+2,y,5,2,P.brassHi);px(c,x+1,y+2,7,7,'#20302d');px(c,x+2,y+3,5,5,col,.9);px(c,x+2,y+3,1,3,'#e5f2e7',.48)}
function fixture(c:CanvasRenderingContext2D,x:number,y:number,t:Tile){const X=x*TS,Y=y*TS;switch(t.fixture){
  case'shelf':px(c,X+2,Y+4,28,4,P.wood);for(const yy of[10,18,26])px(c,X+4,Y+yy,24,3,P.woodLo);px(c,X+3,Y+8,3,20,P.wood);px(c,X+27,Y+8,3,20,P.wood);jar(c,X+6,Y+1,'#537b5f');jar(c,X+16,Y+1,'#8d503c');jar(c,X+9,Y+10,'#5c8b8d');jar(c,X+19,Y+18,'#8c7939');break;
  case'still':px(c,X+5,Y+10,23,16,P.copper);px(c,X+8,Y+7,17,16,'#bc6c3b');px(c,X+11,Y+9,8,5,P.copperHi);px(c,X+12,Y+3,6,5,P.brass);px(c,X+14,Y-1,2,5,P.brassHi);px(c,X+24,Y+3,3,11,P.brass);px(c,X+26,Y+2,6,2,P.brass);px(c,X+10,Y+25,14,3,'#6a311e');px(c,X+12,Y+24,9,2,'#ee9849');break;
  case'crate':px(c,X+4,Y+8,24,19,P.woodLo);px(c,X+6,Y+10,20,15,P.wood);ln(c,X+7,Y+11,X+25,Y+24,P.woodHi,2);ln(c,X+25,Y+11,X+7,Y+24,'#3a2a20',2);break;
  case'lamp':px(c,X+14,Y+2,4,14,P.brass);px(c,X+10,Y+13,12,8,'#3a281b');px(c,X+12,Y+14,8,6,'#e7a14b');px(c,X+15,Y+14,2,5,'#fff0a7');break;
  case'planter':px(c,X+2,Y+8,28,20,'#20241d');px(c,X+4,Y+10,24,16,'#4c523d');for(const xx of[7,14,21]){px(c,X+xx,Y+5,4,13,P.herb);px(c,X+xx+1,Y+4,3,5,P.herbHi)}break;
  case'boards':px(c,X+5,Y+6,22,21,'#24211d');for(let i=0;i<3;i++)ln(c,X+5,Y+8+i*7,X+27,Y+14+i*7,'#8b6742',3);px(c,X+14,Y+12,4,10,P.purple,.7);break;
  case'herbs':for(let i=0;i<4;i++){ln(c,X+16,Y+2,X+16,Y+12,'#9b8057');px(c,X+9+i*4,Y+11+(i&1)*2,4,9,P.herb);px(c,X+10+i*4,Y+12,2,5,P.herbHi,.65)}break;
  case'grate':px(c,X+5,Y+11,22,12,'#151814');for(let i=0;i<6;i++)px(c,X+7+i*4,Y+12,2,10,'#6a6b5d');break;
  case'counter':px(c,X+2,Y+8,28,18,P.woodLo);px(c,X+3,Y+7,27,5,P.woodHi);px(c,X+5,Y+12,23,14,P.wood);jar(c,X+18,Y+2,'#537b63');break;
  case'vat':px(c,X+5,Y+7,22,19,'#2a1d17');px(c,X+7,Y+5,18,20,P.copper);px(c,X+9,Y+8,14,15,'#bc6b3b');px(c,X+6,Y+8,20,3,P.brass);px(c,X+8,Y+21,18,3,P.brass);break;
  case'table':px(c,X+3,Y+9,26,7,'#805a39');px(c,X+5,Y+10,22,3,P.woodHi,.6);px(c,X+6,Y+16,4,12,P.woodLo);px(c,X+22,Y+16,4,12,P.woodLo);jar(c,X+8,Y+2,'#764b69');break;
  case'awning':for(let i=0;i<5;i++)px(c,X+2+i*6,Y+5,6,12,i&1?'#93684f':'#64443d');px(c,X+3,Y+3,27,3,P.brass,.65);break;
  case'pipe':px(c,X+13,Y+2,6,25,P.copper);px(c,X+14,Y+2,2,25,P.copperHi);px(c,X+8,Y+4,11,4,P.brass);px(c,X+17,Y+21,10,5,P.brass);break;
  case'barrel':px(c,X+7,Y+5,18,23,P.woodLo);px(c,X+9,Y+4,14,24,P.wood);for(const yy of[8,17,25])px(c,X+8,Y+yy,16,2,P.brass);px(c,X+13,Y+7,3,15,P.woodHi,.35);break;
  case'cart':px(c,X+3,Y+7,24,14,P.wood);px(c,X+5,Y+9,20,10,'#835e3e');for(const xx of[8,23]){px(c,X+xx-4,Y+20,8,8,'#171914');px(c,X+xx-2,Y+22,4,4,'#676050')}px(c,X+25,Y+4,4,17,P.woodLo);break;
  case'sign':px(c,X+15,Y+2,3,7,P.brass);px(c,X+8,Y+8,18,13,P.woodLo);px(c,X+10,Y+10,14,9,'#805a3a');txt(c,'⚗',X+17,Y+15,'#e0bf70',9);break;
  case'fountain':px(c,X+3,Y+18,26,10,'#222720');px(c,X+5,Y+16,22,10,'#606454');px(c,X+8,Y+18,16,6,P.water);px(c,X+11,Y+4,10,15,'#77715e');px(c,X+15,Y+6,2,12,P.waterHi,.8);break;
  case'rubble':for(let i=0;i<8;i++){const r=rnd(X+i,Y,i);px(c,X+4+Math.floor(r*22),Y+10+Math.floor((1-r)*15),4+i%3,3+(i&1),i%2?'#625c4c':'#444239')}break;
  case'cabinet':px(c,X+4,Y+3,24,26,P.woodLo);px(c,X+6,Y+5,20,22,P.wood);px(c,X+8,Y+7,7,17,'#35271e');px(c,X+17,Y+7,7,17,'#35271e');px(c,X+13,Y+14,2,2,P.brassHi);px(c,X+18,Y+14,2,2,P.brassHi);break;
}}
function item(c:CanvasRenderingContext2D,k:string,X:number,Y:number){if(k==='red-phial'||k==='blue-tonic'){const col=k==='red-phial'?P.red:'#5f91a7';px(c,X+12,Y+8,8,3,P.brass);px(c,X+11,Y+11,10,13,'#1c2928');px(c,X+13,Y+13,6,9,col);px(c,X+14,Y+14,2,4,'#ecf5e8',.5)}else if(k==='salt-bomb'){px(c,X+10,Y+12,12,12,P.bone);px(c,X+12,Y+10,8,3,P.wood);px(c,X+15,Y+6,2,5,P.copperHi)}else{ln(c,X+7,Y+22,X+24,Y+9,'#e4dec4',3);px(c,X+7,Y+21,7,4,'#fff8df')}}
function glassMite(c:CanvasRenderingContext2D,X:number,Y:number){for(const [a,b,d,e]of[[8,13,3,9],[8,18,3,22],[24,13,29,9],[24,18,29,22]]as const)ln(c,X+a,Y+b,X+d,Y+e,'#8daea3',2);px(c,X+9,Y+11,14,12,'#20312d');px(c,X+12,Y+8,8,16,'#8eb5ab');px(c,X+14,Y+9,4,13,P.glassHi);px(c,X+16,Y+7,2,5,'#eff9f2')}
function rat(c:CanvasRenderingContext2D,X:number,Y:number){px(c,X+8,Y+14,16,10,'#684b39');px(c,X+6,Y+11,8,9,'#825f49');px(c,X+7,Y+9,4,4,'#9c755a');px(c,X+10,Y+10,2,2,'#e0c39d');ln(c,X+23,Y+20,X+30,Y+24,'#a98260',2);px(c,X+17,Y+8,7,9,'#1c2928');px(c,X+19,Y+10,3,5,P.glass);px(c,X+20,Y+8,2,3,P.brass)}
function hound(c:CanvasRenderingContext2D,X:number,Y:number){px(c,X+7,Y+12,18,11,'#7f8062');px(c,X+20,Y+8,8,10,'#a09a72');px(c,X+24,Y+6,3,5,'#c0b987');for(const xx of[9,18,23])px(c,X+xx,Y+21,3,7,'#555842');px(c,X+24,Y+11,2,2,'#efe6a5');px(c,X+3,Y+9,5,3,'#738d7f',.5);px(c,X+1,Y+6,5,2,'#9ab7a7',.3)}
function player(c:CanvasRenderingContext2D,X:number,Y:number){px(c,X+10,Y+6,12,8,'#26332e');px(c,X+13,Y+4,6,5,'#d2c29d');px(c,X+8,Y+13,16,13,'#425c50');px(c,X+10,Y+15,12,8,'#69806d');px(c,X+7,Y+18,4,9,'#34473f');px(c,X+22,Y+18,4,9,'#34473f');px(c,X+10,Y+25,6,4,'#171f1b');px(c,X+18,Y+25,6,4,'#171f1b');px(c,X+13,Y+7,2,2,'#20251f');px(c,X+19,Y+7,2,2,'#20251f');px(c,X+23,Y+12,5,4,P.brass);px(c,X+25,Y+15,2,9,P.wood)}

function lighting(c:CanvasRenderingContext2D,s:GameState){
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.discovered)continue;if(!t.visible)px(c,x*TS,y*TS,TS,TS,'#030403',.72);else px(c,x*TS,y*TS,TS,TS,'#07100d',.05)}
  const glows:Array<{x:number;y:number;r:number;a:number}>=[{x:s.player.x,y:s.player.y,r:74,a:.1}];for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(t?.visible&&t.fixture==='lamp')glows.push({x,y,r:82,a:.2});if(t?.visible&&t.kind==='fire')glows.push({x,y,r:68,a:.24})}
  for(const g of glows){const gx=g.x*TS+16,gy=g.y*TS+16,gr=c.createRadialGradient(gx,gy,2,gx,gy,g.r);gr.addColorStop(0,`rgba(238,184,91,${g.a})`);gr.addColorStop(1,'rgba(238,184,91,0)');c.fillStyle=gr;c.fillRect(gx-g.r,gy-g.r,g.r*2,g.r*2)}
}
function telegraphs(c:CanvasRenderingContext2D,s:GameState){for(const e of s.enemies){if(!e.telegraph)continue;const p=e.telegraph,t=s.tiles[p.y*s.width+p.x];if(!t?.visible)continue;const X=p.x*TS,Y=p.y*TS;px(c,X+3,Y+3,26,2,'#e18d52');px(c,X+3,Y+27,26,2,'#e18d52');px(c,X+3,Y+3,2,26,'#e18d52');px(c,X+27,Y+3,2,26,'#e18d52');for(let i=0;i<3;i++)px(c,X+10+i*5,Y+12+(i&1)*4,3,3,P.acidHi,.8)}}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  const c=canvas.getContext('2d')!;canvas.width=s.width*TS;canvas.height=s.height*TS;c.imageSmoothingEnabled=false;px(c,0,0,canvas.width,canvas.height,P.void);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.discovered)continue;if(t.kind==='wall')drawWall(c,x,y,t,s);else if(t.kind==='floor')drawFloor(c,x,y,t);else if(t.kind==='door')door(c,x,y,t.variant);else if(t.kind==='water'||t.kind==='acid'||t.kind==='fire')liquid(c,x,y,t.kind,t.variant);else stairs(c,x,y)}
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(t?.discovered)floorEdges(c,x,y,t,s)}
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(t?.visible&&t.fixture)fixture(c,x,y,t)}
  for(const i of s.items){const t=s.tiles[i.y*s.width+i.x];if(t?.visible)item(c,i.kind,i.x*TS,i.y*TS)}
  for(const e of s.enemies){const t=s.tiles[e.y*s.width+e.x];if(!t?.visible)continue;if(e.kind==='glass-mite')glassMite(c,e.x*TS,e.y*TS);else if(e.kind==='distiller-rat')rat(c,e.x*TS,e.y*TS);else hound(c,e.x*TS,e.y*TS)}
  player(c,s.player.x*TS,s.player.y*TS);lighting(c,s);telegraphs(c,s);
}
export function screenToTile(canvas:HTMLCanvasElement,clientX:number,clientY:number):Point{const r=canvas.getBoundingClientRect(),sx=canvas.width/r.width,sy=canvas.height/r.height;return{x:Math.floor((clientX-r.left)*sx/TS),y:Math.floor((clientY-r.top)*sy/TS)}}
