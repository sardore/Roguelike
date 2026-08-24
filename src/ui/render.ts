import type { GameState, Point, Tile } from '../game/types';

const TS=32;
const C={
  void:'#070806', ink:'#10120e', shadow:'#171914', mortar:'#20221c',
  stone0:'#292921', stone1:'#39372d', stone2:'#4a4537', stoneHi:'#716750',
  wood0:'#35261d', wood1:'#5b402d', wood2:'#7d593b', woodHi:'#a57b50',
  brass:'#886337', brassHi:'#c3904d', copper:'#985531', copperHi:'#d07b40',
  glass:'#659087', glassHi:'#aac4b6', water:'#304f54', waterHi:'#74928e',
  acid:'#718044', acidHi:'#c3ca68', cloth:'#6c4b43', cloth2:'#8a6851',
  herb:'#566240', herbHi:'#849062', red:'#9d4d3d', bone:'#c9c0a2'
};

function rand2(x:number,y:number,v=0){let n=Math.imul(x+31*y+v*131,0x45d9f3b);n=(n^(n>>>16))>>>0;return n/4294967296;}
function px(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string,a=1){ctx.globalAlpha=a;ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));ctx.globalAlpha=1;}
function line(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);ctx.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);ctx.stroke();}
function text(ctx:CanvasRenderingContext2D,s:string,x:number,y:number,c:string,size=7){ctx.fillStyle=c;ctx.font=`700 ${size}px ui-monospace,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y);}

function floorPalette(room?:string):[string,string,string]{
  if(room==='distillery')return['#25251f','#343126','#5c5038'];
  if(room==='herbalist')return['#2d2921','#403629','#66533a'];
  if(room==='sealed-shop')return['#22231f','#302e28','#50473a'];
  if(room==='courtyard')return['#293027','#3b4435','#62694f'];
  if(room==='north-alley'||room==='service-passage')return['#252822','#343830','#545948'];
  return[C.stone0,C.stone1,C.stone2];
}

function drawFloor(ctx:CanvasRenderingContext2D,x:number,y:number,t:Tile){
  const X=x*TS,Y=y*TS,r=rand2(x,y,t.variant),p=floorPalette(t.room);
  px(ctx,X,Y,TS,TS,p[0]);
  if(t.room==='apothecaries-row'||t.room==='north-alley'||t.room==='service-passage'){
    for(let yy=0;yy<4;yy++){
      const off=(yy&1)*5;
      for(let xx=-1;xx<4;xx++){
        const bx=X+xx*11+off,by=Y+yy*8;
        px(ctx,bx+1,by+1,9,6,(xx+yy+t.variant)%3===0?p[2]:p[1]);
        px(ctx,bx+1,by+6,9,1,'#1a1c18');px(ctx,bx+9,by+1,1,6,'#1b1d18');
      }
    }
    if((x+t.variant)%5===0){px(ctx,X+1,Y+25,30,3,'#1c2522');px(ctx,X+5,Y+26,12,1,'#4c6159',.45);}
  }else if(t.room==='herbalist'){
    for(let yy=0;yy<4;yy++)for(let xx=0;xx<4;xx++){
      const q=((xx+yy+t.variant)&1)?'#493b2c':'#3a3026';
      px(ctx,X+xx*8+1,Y+yy*8+1,6,6,q);
      if((xx*5+yy+t.variant)%7===0)px(ctx,X+xx*8+3,Y+yy*8+3,2,2,'#7f6b46');
    }
  }else if(t.room==='distillery'){
    for(let yy=0;yy<4;yy++){
      line(ctx,X,Y+yy*8,X+TS,Y+yy*8,'#171a16');
      for(let xx=(yy&1)*8;xx<TS;xx+=16)line(ctx,X+xx,Y+yy*8,X+xx,Y+yy*8+8,'#171a16');
    }
    if(r>.45)px(ctx,X+3,Y+4,24,2,'#514632',.55);
    if(r>.75){px(ctx,X+20,Y+19,8,5,'#302017');px(ctx,X+22,Y+20,5,2,'#6c3e24',.45);}
  }else if(t.room==='courtyard'){
    for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++){
      const bx=X+xx*16,by=Y+yy*16;px(ctx,bx+1,by+1,14,14,(xx+yy+t.variant)%3===0?p[2]:p[1]);
      px(ctx,bx+1,by+14,14,1,'#20251f');px(ctx,bx+14,by+1,1,14,'#20251f');
    }
    if(r>.55){px(ctx,X+5+Math.floor(r*13),Y+9,3,2,C.herb,.55);px(ctx,X+9+Math.floor(r*8),Y+11,2,2,C.herbHi,.45);}
  }else{
    for(let yy=0;yy<4;yy++){line(ctx,X,Y+yy*8,X+TS,Y+yy*8,'#1c1e19');for(let xx=(yy&1)*8;xx<TS;xx+=16)line(ctx,X+xx,Y+yy*8,X+xx,Y+yy*8+8,'#1d1f1a');}
  }
  if(r>.66){px(ctx,X+4+Math.floor(r*18),Y+4+Math.floor((1-r)*18),5,1,p[2],.7);px(ctx,X+7+Math.floor(r*11),Y+9+Math.floor((1-r)*12),1,3,'#171914',.75);}
  if(t.variant===15){px(ctx,X+2,Y+15,28,2,'#d8d0ae');px(ctx,X+9,Y+13,9,1,'#f1e9c5');}
}

function drawWall(ctx:CanvasRenderingContext2D,x:number,y:number,t:Tile,s:GameState){
  const X=x*TS,Y=y*TS,room=t.room??'';
  const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;
  const east=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;
  const west=x>0?s.tiles[y*s.width+x-1]:undefined;
  const facade=!!south&&south.kind!=='wall';
  const sealed=room.includes('sealed');
  px(ctx,X,Y,TS,TS,'#11130f');
  px(ctx,X,Y+4,TS,facade?26:28,sealed?'#37312b':'#464238');
  for(let yy=0;yy<3;yy++){
    const off=(yy&1)*7;
    for(let xx=-1;xx<3;xx++){
      const bx=X+xx*15+off,by=Y+5+yy*9;
      px(ctx,bx+1,by+1,13,7,yy===0?'#585145':'#4a453a');
      line(ctx,bx+1,by+8,bx+14,by+8,'#25271f');line(ctx,bx+14,by+1,bx+14,by+8,'#272920');
      if((xx+yy+x+t.variant)%5===0)px(ctx,bx+4,by+3,5,1,'#746a54',.45);
    }
  }
  px(ctx,X,Y+3,TS,3,'#22241e');px(ctx,X,Y+4,TS,2,'#746b56');
  if(facade){
    px(ctx,X,Y+27,TS,5,'#0e100d');px(ctx,X,Y+26,TS,2,'#81745a');
    const motif=(x+t.variant)%6;
    if(motif===1||motif===4){
      const glass=room.includes('distillery')?'#526b61':sealed?'#413b44':'#48645a';
      px(ctx,X+6,Y+9,20,14,'#201f1a');px(ctx,X+8,Y+10,16,11,glass);
      px(ctx,X+15,Y+10,2,11,C.brass,.75);px(ctx,X+8,Y+15,16,2,C.brass,.65);
      px(ctx,X+10,Y+12,4,2,C.glassHi,.28);
    }else if(motif===2){
      px(ctx,X+7,Y+10,18,4,C.wood0);px(ctx,X+9,Y+14,14,9,C.wood1);px(ctx,X+11,Y+16,10,2,C.woodHi,.45);
    }
    if((x+t.variant)%4===0){
      px(ctx,X+3,Y+9,5,15,C.copper);px(ctx,X+4,Y+9,2,15,C.copperHi);px(ctx,X+1,Y+8,9,3,C.brass);px(ctx,X+1,Y+22,9,3,C.brass);
    }
  }
  if(!east||east.kind!=='wall')px(ctx,X+29,Y+5,3,24,'#151712');
  if(!west||west.kind!=='wall')px(ctx,X,Y+5,3,24,'#746a55',.45);
}

function drawFloorEdges(ctx:CanvasRenderingContext2D,x:number,y:number,t:Tile,s:GameState){
  if(t.kind==='wall')return;
  const X=x*TS,Y=y*TS;
  const n=y>0?s.tiles[(y-1)*s.width+x]:undefined;
  const so=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;
  const w=x>0?s.tiles[y*s.width+x-1]:undefined;
  const e=x+1<s.width?s.tiles[y*s.width+x+1]:undefined;
  if(n?.kind==='wall'){px(ctx,X,Y,TS,4,'#12140f',.82);px(ctx,X,Y+4,TS,2,'#796c52',.32);}
  if(so?.kind==='wall')px(ctx,X,Y+28,TS,4,'#11130f',.6);
  if(w?.kind==='wall')px(ctx,X,Y,3,TS,'#10120e',.52);
  if(e?.kind==='wall')px(ctx,X+29,Y,3,TS,'#6e624c',.16);
}

function drawDoor(ctx:CanvasRenderingContext2D,x:number,y:number,v=0){
  const X=x*TS,Y=y*TS;
  drawFloor(ctx,x,y,{kind:'floor',variant:v,room:'apothecaries-row',discovered:true,visible:true});
  px(ctx,X+2,Y,5,32,'#211a15');px(ctx,X+25,Y,5,32,'#211a15');
  px(ctx,X+4,Y,3,31,C.brass);px(ctx,X+25,Y,3,31,C.brass);
  px(ctx,X+6,Y+3,16,25,C.wood0,.95);px(ctx,X+8,Y+5,12,21,C.wood1,.95);
  // Door leaf is visibly swung open, so passage reads as walkable.
  line(ctx,X+20,Y+5,X+25,Y+2,C.woodHi,2);line(ctx,X+20,Y+26,X+25,Y+29,'#2a2019',2);
  px(ctx,X+18,Y+15,3,3,C.brassHi);
  if(v>=4){for(let i=0;i<3;i++)line(ctx,X+6,Y+7+i*7,X+21,Y+12+i*7,'#7f5d3c',2);}
}

function drawLiquid(ctx:CanvasRenderingContext2D,x:number,y:number,kind:'water'|'acid'|'fire',v:number){
  const X=x*TS,Y=y*TS;
  drawFloor(ctx,x,y,{kind:'floor',variant:v,room:'apothecaries-row',discovered:true,visible:true});
  if(kind==='water'){
    px(ctx,X+2,Y+18,28,11,C.water,.86);px(ctx,X+5,Y+20,17,2,C.waterHi,.72);px(ctx,X+16,Y+25,11,1,'#a1b8b0',.5);px(ctx,X+8,Y+16,16,2,'#1d2f31');
  }else if(kind==='acid'){
    px(ctx,X+2,Y+17,28,12,'#3f4c2c',.95);px(ctx,X+4,Y+19,24,9,C.acid,.88);
    for(let i=0;i<6;i++){const r=rand2(x+i,y,v);px(ctx,X+4+Math.floor(r*22),Y+19+Math.floor((1-r)*7),2+(i&1),2,C.acidHi,.62);}
  }else{
    px(ctx,X+5,Y+20,22,9,'#5e2d20');px(ctx,X+8,Y+14,6,14,'#9f4728');px(ctx,X+17,Y+16,7,12,'#d06d32');px(ctx,X+12,Y+9,5,17,'#edb35b');px(ctx,X+14,Y+8,2,10,'#fff0a0');
  }
}

function drawStairs(ctx:CanvasRenderingContext2D,x:number,y:number){
  drawFloor(ctx,x,y,{kind:'floor',variant:2,room:'sealed-shop',discovered:true,visible:true});
  const X=x*TS,Y=y*TS;px(ctx,X+5,Y+5,22,22,'#10130f');
  for(let i=0;i<5;i++){px(ctx,X+6+i*2,Y+22-i*3,20-i*4,3,'#71654d');px(ctx,X+7+i*2,Y+22-i*3,18-i*4,1,'#a18f69');}
  px(ctx,X+7,Y+4,18,2,C.brass);
}

function jar(ctx:CanvasRenderingContext2D,x:number,y:number,c:string){px(ctx,x+2,y,5,2,'#b8a675');px(ctx,x+1,y+2,7,7,'#24312d');px(ctx,x+2,y+3,5,5,c,.85);px(ctx,x+2,y+3,1,3,'#d9e4cf',.48);}
function shelf(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X,Y,28,5,C.wood0);px(ctx,X+2,Y+1,24,2,C.woodHi,.45);px(ctx,X+1,Y+5,3,20,C.wood1);px(ctx,X+24,Y+5,3,20,C.wood1);for(const yy of [9,17,24])px(ctx,X+2,Y+yy,23,3,C.wood0);jar(ctx,X+5,Y+1,'#4f7b5f');jar(ctx,X+14,Y+1,'#7f4936');jar(ctx,X+8,Y+9,'#597c82');jar(ctx,X+17,Y+9,'#7a6a35');}
function still(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+2,Y+10,27,16,'#241b16');px(ctx,X+7,Y+5,17,18,C.copper);px(ctx,X+9,Y+7,13,13,'#b36a3c');px(ctx,X+11,Y+9,7,4,C.copperHi);px(ctx,X+12,Y+2,6,6,C.brass);px(ctx,X+14,Y-2,2,5,C.brassHi);px(ctx,X+21,Y+3,2,9,C.brass);px(ctx,X+23,Y+2,7,2,C.brass);px(ctx,X+29,Y+2,2,12,C.brass);px(ctx,X+10,Y+24,13,3,'#5e2d1c');px(ctx,X+12,Y+23,8,2,'#e1873e');}
function lamp(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+14,Y+2,4,13,C.brass);px(ctx,X+11,Y+12,10,8,'#38281b');px(ctx,X+13,Y+13,6,6,'#dd9944');px(ctx,X+15,Y+14,2,4,'#ffe8a0');}
function crate(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+3,Y+7,25,20,'#2a2118');px(ctx,X+5,Y+9,21,16,C.wood1);line(ctx,X+6,Y+10,X+25,Y+24,C.woodHi,2);line(ctx,X+25,Y+10,X+6,Y+24,'#3c2b20',2);px(ctx,X+5,Y+8,21,2,C.brass,.5);}
function barrel(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+7,Y+5,18,23,'#2a1e17');px(ctx,X+9,Y+4,14,24,C.wood1);px(ctx,X+10,Y+6,12,20,C.wood2);for(const yy of [8,17,25])px(ctx,X+8,Y+yy,16,2,C.brass);px(ctx,X+13,Y+7,3,15,C.woodHi,.35);}
function herbBundle(ctx:CanvasRenderingContext2D,X:number,Y:number){line(ctx,X+16,Y+2,X+16,Y+12,'#917954',1);for(let i=0;i<4;i++){px(ctx,X+10+i*3,Y+10+(i&1)*2,3,8,C.herb);px(ctx,X+11+i*3,Y+11,2,5,C.herbHi,.55);}}
function counter(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+2,Y+8,28,18,'#2a2018');px(ctx,X+3,Y+7,27,5,C.woodHi);px(ctx,X+5,Y+12,23,14,C.wood1);px(ctx,X+7,Y+15,7,8,C.wood0);px(ctx,X+17,Y+14,8,2,C.brass,.5);jar(ctx,X+18,Y+3,'#557b63');}
function vat(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+5,Y+7,22,19,'#261d18');px(ctx,X+7,Y+5,18,20,C.copper);px(ctx,X+9,Y+8,14,15,'#ad6639');px(ctx,X+6,Y+8,20,3,C.brass);px(ctx,X+8,Y+21,18,3,C.brass);px(ctx,X+13,Y+2,6,5,'#4e4937');px(ctx,X+14,Y+1,4,3,C.glass,.7);}
function table(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+3,Y+9,26,7,C.wood2);px(ctx,X+5,Y+10,22,3,C.woodHi,.55);px(ctx,X+6,Y+16,4,12,C.wood0);px(ctx,X+22,Y+16,4,12,C.wood0);jar(ctx,X+8,Y+2,'#6f455b');px(ctx,X+19,Y+4,7,4,'#c0aa76');}
function awning(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+1,Y+3,30,4,'#211b17');for(let i=0;i<5;i++)px(ctx,X+2+i*6,Y+5,6,11,i&1?'#80604c':'#5f453b');for(let i=0;i<5;i++)px(ctx,X+2+i*6,Y+16,6,3,i&1?'#9b775c':'#725246');px(ctx,X+3,Y+2,27,2,C.brass,.55);}
function pipe(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+13,Y+2,6,25,C.copper);px(ctx,X+14,Y+2,2,25,C.copperHi);px(ctx,X+8,Y+4,11,4,C.brass);px(ctx,X+16,Y+21,11,5,C.brass);px(ctx,X+23,Y+21,4,8,C.copper);px(ctx,X+11,Y+12,10,3,'#473426');}
function cart(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+3,Y+7,24,14,C.wood1);px(ctx,X+5,Y+9,20,10,C.wood2);line(ctx,X+5,Y+10,X+24,Y+18,'#3d2d21',2);for(const xx of [8,23]){px(ctx,X+xx-4,Y+20,8,8,'#181a16');px(ctx,X+xx-2,Y+22,4,4,'#5c5546');}px(ctx,X+25,Y+4,4,17,C.wood0);}
function sign(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+15,Y+2,3,7,C.brass);px(ctx,X+8,Y+8,18,13,C.wood0);px(ctx,X+10,Y+10,14,9,C.wood2);text(ctx,'⚗',X+17,Y+15,'#d0b56d',9);}
function fountain(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+3,Y+18,26,10,'#20251f');px(ctx,X+5,Y+16,22,10,'#596052');px(ctx,X+8,Y+18,16,6,C.water);px(ctx,X+11,Y+4,10,15,'#6f6a58');px(ctx,X+13,Y+2,6,5,'#8a8169');px(ctx,X+15,Y+6,2,12,C.waterHi,.7);}
function rubble(ctx:CanvasRenderingContext2D,X:number,Y:number){for(let i=0;i<8;i++){const r=rand2(X+i,Y,i);px(ctx,X+4+Math.floor(r*22),Y+10+Math.floor((1-r)*15),4+(i%3),3+(i&1),i%2?'#5b5546':'#3d3b32');}}
function cabinet(ctx:CanvasRenderingContext2D,X:number,Y:number){px(ctx,X+4,Y+3,24,26,'#271e17');px(ctx,X+6,Y+5,20,22,C.wood1);px(ctx,X+8,Y+7,7,17,'#31261d');px(ctx,X+17,Y+7,7,17,'#31261d');px(ctx,X+13,Y+14,2,2,C.brassHi);px(ctx,X+18,Y+14,2,2,C.brassHi);px(ctx,X+7,Y+4,18,2,C.woodHi,.5);}

function drawFixture(ctx:CanvasRenderingContext2D,x:number,y:number,t:Tile){
  const X=x*TS,Y=y*TS;
  switch(t.fixture){
    case 'shelf':shelf(ctx,X+2,Y+3);break;
    case 'still':still(ctx,X,Y);break;
    case 'crate':crate(ctx,X,Y);break;
    case 'lamp':lamp(ctx,X,Y);break;
    case 'planter':px(ctx,X+2,Y+7,28,20,'#20231d');px(ctx,X+4,Y+9,24,16,'#48503b');px(ctx,X+7,Y+4,4,11,C.herb);px(ctx,X+14,Y+2,5,13,C.herbHi);px(ctx,X+21,Y+6,4,9,C.herb);break;
    case 'boards':px(ctx,X+6,Y+6,20,20,'#25221f');for(let i=0;i<3;i++)line(ctx,X+5,Y+8+i*7,X+27,Y+14+i*7,'#7b5d3c',3);px(ctx,X+14,Y+12,4,10,'#5c465d',.7);break;
    case 'herbs':herbBundle(ctx,X,Y);break;
    case 'grate':px(ctx,X+6,Y+11,20,12,'#171a17');for(let i=0;i<5;i++)px(ctx,X+8+i*4,Y+12,2,10,'#606057');px(ctx,X+6,Y+10,20,2,'#8a8067',.5);break;
    case 'counter':counter(ctx,X,Y);break;
    case 'vat':vat(ctx,X,Y);break;
    case 'table':table(ctx,X,Y);break;
    case 'awning':awning(ctx,X,Y);break;
    case 'pipe':pipe(ctx,X,Y);break;
    case 'barrel':barrel(ctx,X,Y);break;
    case 'cart':cart(ctx,X,Y);break;
    case 'sign':sign(ctx,X,Y);break;
    case 'fountain':fountain(ctx,X,Y);break;
    case 'rubble':rubble(ctx,X,Y);break;
    case 'cabinet':cabinet(ctx,X,Y);break;
  }
}

function drawItem(ctx:CanvasRenderingContext2D,kind:string,X:number,Y:number){
  if(kind==='red-phial'||kind==='blue-tonic'){
    const c=kind==='red-phial'?'#b75b49':'#5e8ea2';px(ctx,X+12,Y+8,8,3,C.brass);px(ctx,X+11,Y+11,10,13,'#1d2928');px(ctx,X+13,Y+13,6,9,c);px(ctx,X+14,Y+14,2,4,'#e5f1e3',.45);px(ctx,X+10,Y+24,12,2,'#080a08',.55);
  }else if(kind==='salt-bomb'){
    px(ctx,X+10,Y+12,12,12,'#c9c2a5');px(ctx,X+12,Y+10,8,3,C.wood1);px(ctx,X+15,Y+6,2,5,C.copperHi);px(ctx,X+12,Y+15,8,2,'#eee6c9');
  }else{
    line(ctx,X+7,Y+22,X+24,Y+9,'#d8d2b8',3);px(ctx,X+7,Y+21,7,4,'#f2edd8');
  }
}

function drawGlassMite(ctx:CanvasRenderingContext2D,X:number,Y:number){
  for(const [x1,y1,x2,y2] of [[8,13,3,9],[8,18,3,22],[24,13,29,9],[24,18,29,22]] as const)line(ctx,X+x1,Y+y1,X+x2,Y+y2,'#819b91',2);
  px(ctx,X+9,Y+11,14,12,'#20302d');px(ctx,X+12,Y+8,8,16,'#8aa9a1');px(ctx,X+14,Y+9,4,13,'#c2d8cc');px(ctx,X+16,Y+7,2,5,'#e6efe8');
}
function drawRat(ctx:CanvasRenderingContext2D,X:number,Y:number){
  px(ctx,X+8,Y+14,16,10,'#5f4737');px(ctx,X+6,Y+11,8,9,'#735847');px(ctx,X+7,Y+9,4,4,'#8e6d57');px(ctx,X+10,Y+10,2,2,'#d8c09d');
  line(ctx,X+23,Y+20,X+30,Y+24,'#9a7355',2);px(ctx,X+17,Y+8,7,9,'#1e2a29');px(ctx,X+19,Y+10,3,5,'#6a9392');px(ctx,X+20,Y+8,2,3,C.brass);
}
function drawHound(ctx:CanvasRenderingContext2D,X:number,Y:number){
  px(ctx,X+7,Y+12,18,11,'#7d795f');px(ctx,X+20,Y+8,8,10,'#969070');px(ctx,X+24,Y+6,3,5,'#b0a985');
  for(const xx of [9,18,23])px(ctx,X+xx,Y+21,3,7,'#575743');px(ctx,X+24,Y+11,2,2,'#d9d2a0');
  px(ctx,X+3,Y+9,5,3,'#64746c',.4);px(ctx,X+1,Y+6,5,2,'#7c968b',.28);px(ctx,X+4,Y+4,3,2,'#a8beb3',.22);
}
function drawPlayer(ctx:CanvasRenderingContext2D,X:number,Y:number){
  px(ctx,X+11,Y+7,10,7,'#2a302d');px(ctx,X+13,Y+5,6,5,'#c6b997');px(ctx,X+9,Y+13,14,12,'#3f4b45');px(ctx,X+11,Y+15,10,8,'#667266');
  px(ctx,X+8,Y+19,4,8,'#343d38');px(ctx,X+21,Y+19,4,8,'#343d38');px(ctx,X+11,Y+25,5,4,'#1b211f');px(ctx,X+18,Y+25,5,4,'#1b211f');
  px(ctx,X+13,Y+8,2,2,'#20251f');px(ctx,X+18,Y+8,2,2,'#20251f');px(ctx,X+22,Y+12,4,3,C.brass);px(ctx,X+24,Y+14,2,9,C.wood1);
}

function drawEntities(ctx:CanvasRenderingContext2D,s:GameState){
  for(const i of s.items){const t=s.tiles[i.y*s.width+i.x];if(t?.visible)drawItem(ctx,i.kind,i.x*TS,i.y*TS);}
  for(const e of s.enemies){
    const t=s.tiles[e.y*s.width+e.x];if(!t?.visible)continue;
    if(e.kind==='glass-mite')drawGlassMite(ctx,e.x*TS,e.y*TS);
    else if(e.kind==='distiller-rat')drawRat(ctx,e.x*TS,e.y*TS);
    else drawHound(ctx,e.x*TS,e.y*TS);
  }
  drawPlayer(ctx,s.player.x*TS,s.player.y*TS);
}

function applyLighting(ctx:CanvasRenderingContext2D,s:GameState){
  const sources:Array<{x:number;y:number;r:number}>=[{x:s.player.x,y:s.player.y,r:5}];
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t)continue;
    if(t.fixture==='lamp')sources.push({x,y,r:5});
    if(t.kind==='fire')sources.push({x,y,r:4});
  }
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.discovered)continue;
    if(!t.visible){px(ctx,x*TS,y*TS,TS,TS,'#040504',.72);continue;}
    let best=99;
    for(const l of sources){const d=Math.abs(x-l.x)+Math.abs(y-l.y);if(d<=l.r)best=Math.min(best,d/l.r);}
    const alpha=best===99?.42:Math.max(.04,best*.32);
    px(ctx,x*TS,y*TS,TS,TS,'#07100d',alpha);
  }
}

function drawTelegraphs(ctx:CanvasRenderingContext2D,s:GameState){
  for(const e of s.enemies){
    if(!e.telegraph)continue;const p=e.telegraph,t=s.tiles[p.y*s.width+p.x];if(!t?.visible)continue;
    const X=p.x*TS,Y=p.y*TS;
    px(ctx,X+3,Y+3,26,2,'#c98651');px(ctx,X+3,Y+27,26,2,'#c98651');px(ctx,X+3,Y+3,2,26,'#c98651');px(ctx,X+27,Y+3,2,26,'#c98651');
    for(let i=0;i<3;i++)px(ctx,X+10+i*5,Y+12+(i&1)*4,3,3,'#9fb57d',.7);
  }
}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){
  const ctx=canvas.getContext('2d')!;canvas.width=s.width*TS;canvas.height=s.height*TS;ctx.imageSmoothingEnabled=false;
  px(ctx,0,0,canvas.width,canvas.height,C.void);
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
    const t=s.tiles[y*s.width+x];if(!t?.discovered)continue;
    if(t.kind==='wall')drawWall(ctx,x,y,t,s);
    else if(t.kind==='floor')drawFloor(ctx,x,y,t);
    else if(t.kind==='door')drawDoor(ctx,x,y,t.variant);
    else if(t.kind==='water'||t.kind==='acid'||t.kind==='fire')drawLiquid(ctx,x,y,t.kind,t.variant);
    else drawStairs(ctx,x,y);
  }
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(t?.discovered)drawFloorEdges(ctx,x,y,t,s);}
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(t?.visible&&t.fixture)drawFixture(ctx,x,y,t);}
  drawEntities(ctx,s);
  applyLighting(ctx,s);
  drawTelegraphs(ctx,s);
}

export function screenToTile(canvas:HTMLCanvasElement,clientX:number,clientY:number):Point{
  const r=canvas.getBoundingClientRect(),sx=canvas.width/r.width,sy=canvas.height/r.height;
  return{x:Math.floor((clientX-r.left)*sx/TS),y:Math.floor((clientY-r.top)*sy/TS)};
}
