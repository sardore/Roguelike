import { ENEMIES } from '../game/content';
import { drawMap as baseDrawMap, screenToTile } from './render2';
import type { EnemyKind, GameState, ItemKind, Tile, TileKind } from '../game/types';

const TS=32;
const hash=(x:number,y:number,v=0)=>{let n=Math.imul(x+31*y+v*131,0x45d9f3b);n=(n^(n>>>16))>>>0;return n/4294967296};
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}
function openTile(t:Tile|undefined){return !!t&&t.kind!=='wall'}
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}

function floorDetail(c:CanvasRenderingContext2D,s:GameState,x:number,y:number,t:Tile){if(!t.visible||t.kind==='wall'||occupied(s,x,y))return;const X=x*TS,Y=y*TS,r=hash(x,y,t.variant),room=t.room??'';
  if(room.includes('distill')||room.includes('kiln')||room.includes('furnace')||room.includes('underworks')){ln(c,X+2,Y+16,X+30,Y+16,'#171914',1,.38);if((x+y)%2===0)ln(c,X+16,Y+2,X+16,Y+30,'#171914',1,.28)}
  else if(room.includes('glass')||room.includes('assay')||room.includes('master')||room.includes('counting')||room.includes('mint')){for(const v of[8,16,24]){ln(c,X+v,Y+2,X+v,Y+30,'#17201d',1,.18);ln(c,X+2,Y+v,X+30,Y+v,'#17201d',1,.18)}}
  else if(room.includes('street')||room.includes('row')||room.includes('bazaar')||room.includes('arcade')||room.includes('ward')){if((x+t.variant)%4===0){ln(c,X+3,Y+5,X+9,Y+3,'#a28c69',1,.25);ln(c,X+23,Y+25,X+29,Y+23,'#1c211b',1,.34)}}
  if(room.includes('ash')||room.includes('black-market'))for(let i=0;i<2;i++){const q=hash(x+i*7,y,t.variant);px(c,X+5+Math.floor(q*21),Y+7+Math.floor((1-q)*18),2,2,'#11130f',.30)}
  if((room.includes('herbal')||room.includes('spice')||room.includes('courtyard'))&&r>.76){px(c,X+6,Y+22,3,4,'#6f824d',.55);px(c,X+8,Y+20,3,3,'#a2b973',.42)}
}

function facade(c:CanvasRenderingContext2D,s:GameState,x:number,y:number,t:Tile){if(!t.visible||t.kind!=='wall')return;const south=y+1<s.height?s.tiles[(y+1)*s.width+x]:undefined;if(!openTile(south))return;const X=x*TS,Y=y*TS,room=t.room??'',motif=(x+t.variant)%6;
  if(motif===1||motif===4){px(c,X+5,Y+8,22,14,'#151b18');px(c,X+7,Y+9,18,11,room.includes('glass')?'#587a74':room.includes('sealed')?'#58444d':'#566b61');px(c,X+15,Y+9,2,11,'#b48b4d',.88);px(c,X+7,Y+14,18,2,'#b48b4d',.72);px(c,X+9,Y+10,5,2,'#e4f2dd',.20)}
  if((room.includes('distill')||room.includes('kiln')||room.includes('furnace'))&&motif===2){px(c,X+4,Y+7,5,18,'#9f5a34');px(c,X+5,Y+7,2,18,'#db8b50');px(c,X+2,Y+8,10,3,'#a98248');px(c,X+2,Y+22,10,3,'#a98248')}
  if((room.includes('bazaar')||room.includes('market')||room.includes('row'))&&motif===3){px(c,X+4,Y+7,24,7,'#45392b');px(c,X+6,Y+9,20,3,'#c39d5c');px(c,X+14,Y+14,4,10,'#6a482f')}
}

function clutter(c:CanvasRenderingContext2D,s:GameState,x:number,y:number,t:Tile){if(!t.visible||t.kind!=='floor'||t.fixture||occupied(s,x,y))return;const r=hash(x,y,t.variant),X=x*TS,Y=y*TS,room=t.room??'';if(r<.91)return;
  if(room.includes('row')||room.includes('bazaar')||room.includes('arcade')){px(c,X+4,Y+21,8,4,'#4a3426');px(c,X+5,Y+20,6,2,'#956b44');px(c,X+22,Y+22,3,4,'#38655e')}
  else if(room.includes('distill')||room.includes('assay')||room.includes('master')){px(c,X+22,Y+19,5,6,'#355d59');px(c,X+23,Y+17,3,3,'#c09a55');px(c,X+8,Y+24,10,1,'#9d673e')}
  else if(room.includes('ash')||room.includes('under')){px(c,X+7,Y+22,15,2,'#11130f',.55);px(c,X+12,Y+18,2,4,'#65584a',.48)}
}

function glow(c:CanvasRenderingContext2D,x:number,y:number,r:number,inner:string,outer:string){const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function lighting(c:CanvasRenderingContext2D,s:GameState){c.save();c.globalCompositeOperation='screen';for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS+16,Y=y*TS+16;if(t.fixture==='lamp')glow(c,X,Y,54,'rgba(235,179,92,.17)','rgba(235,179,92,0)');if(t.kind==='fire'||t.kind==='embers')glow(c,X,Y,58,'rgba(255,132,54,.20)','rgba(255,132,54,0)');if(t.kind==='rune')glow(c,X,Y,40,'rgba(189,160,97,.10)','rgba(189,160,97,0)');if(t.kind==='crystal')glow(c,X,Y,36,'rgba(119,190,185,.08)','rgba(119,190,185,0)')}c.restore()}

function silhouettes(c:CanvasRenderingContext2D,s:GameState){for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind==='wall')continue;const X=x*TS,Y=y*TS,n=y>0?s.tiles[(y-1)*s.width+x]:undefined,w=x>0?s.tiles[y*s.width+x-1]:undefined;if(n?.kind==='wall'){px(c,X,Y,TS,4,'#050705',.44);px(c,X,Y+4,TS,1,'#b19866',.16)}if(w?.kind==='wall')px(c,X,Y,3,TS,'#050705',.25)}}

function hazardSignature(c:CanvasRenderingContext2D,x:number,y:number,k:TileKind,v:number){const X=x*TS,Y=y*TS;
  if(k==='acid'){ln(c,X+4,Y+25,X+27,Y+25,'#ddeb72',2,.9);for(const [dx,dy] of[[8,20],[17,23],[24,19]] as const){px(c,X+dx,Y+dy,3,3,'#ddeb72',.9);px(c,X+dx+1,Y+dy-2,1,2,'#eff7a0',.8)}}
  else if(k==='oil'){ln(c,X+5,Y+23,X+27,Y+23,'#baa477',2,.68);ln(c,X+10,Y+26,X+21,Y+26,'#6f5a76',1,.7);px(c,X+23,Y+21,3,2,'#d0b979',.55)}
  else if(k==='steam'){for(let i=0;i<3;i++){const xx=X+7+i*8;ln(c,xx,Y+26,xx+4,Y+20,'#d8ded2',2,.62);ln(c,xx+4,Y+20,xx+1,Y+14,'#edf1e9',1,.45)}}
  else if(k==='sludge'){for(const [dx,dy] of[[6,24],[12,21],[19,25],[24,20]] as const){px(c,X+dx,Y+dy,5,3,'#a3aa67',.68);px(c,X+dx+1,Y+dy-1,2,1,'#d0cf85',.5)}}
  else if(k==='glass'){for(const [x1,y1,x2,y2] of[[6,25,13,15],[14,26,20,12],[21,25,27,18]] as const)ln(c,X+x1,Y+y1,X+x2,Y+y2,'#d9f2e7',2,.9)}
  else if(k==='rune'){const col='#e5c274';ln(c,X+7,Y+8,X+12,Y+8,col,2,.78);ln(c,X+7,Y+8,X+7,Y+13,col,2,.78);ln(c,X+25,Y+8,X+20,Y+8,col,2,.78);ln(c,X+25,Y+8,X+25,Y+13,col,2,.78);ln(c,X+12,Y+17,X+16,Y+13,col,1,.9);ln(c,X+16,Y+13,X+20,Y+17,col,1,.9);ln(c,X+20,Y+17,X+16,Y+21,col,1,.9);ln(c,X+16,Y+21,X+12,Y+17,col,1,.9)}
  else if(k==='brine'){for(const yy of[20,24,28]){ln(c,X+5,Y+yy,X+12,Y+yy-2,'#a6c7c1',1,.68);ln(c,X+12,Y+yy-2,X+20,Y+yy,'#a6c7c1',1,.68);ln(c,X+20,Y+yy,X+27,Y+yy-2,'#a6c7c1',1,.68)}}
  else if(k==='miasma'){for(let i=0;i<5;i++){const r=hash(x+i*5,y,v);px(c,X+5+Math.floor(r*21),Y+9+Math.floor((1-r)*16),3,3,i%2?'#b2a96d':'#807b54',.62)}}
  else if(k==='embers'){for(const [dx,dy] of[[7,23],[12,18],[18,25],[24,20],[27,26]] as const){px(c,X+dx,Y+dy,3,2,'#f19845',.9);px(c,X+dx+1,Y+dy-1,1,1,'#ffe08a',.95)}}
  else if(k==='crystal'){for(const [x1,y1,x2,y2] of[[7,25,11,12],[13,26,16,8],[19,25,24,13]] as const){ln(c,X+x1,Y+y1,X+x2,Y+y2,'#d7f3ec',2,.85);ln(c,X+x2,Y+y2,X+x2+3,Y+y2+6,'#79aaa8',1,.75)}}
  else if(k==='fire'){ln(c,X+6,Y+28,X+27,Y+28,'#f5a34b',2,.86);ln(c,X+10,Y+25,X+14,Y+12,'#ffd978',2,.82);ln(c,X+20,Y+25,X+18,Y+15,'#f37a36',2,.9)}
}

const INTERACTIVE=new Set<NonNullable<Tile['fixture']>>(['sealed-cache','lever','brass-gate','boiler','ward-pylon','incinerator','valve','reagent-pump','bell','transmuter','crucible','furnace','silver-mirror','archive-desk','fountain','retort']);
function interactionMarker(c:CanvasRenderingContext2D,x:number,y:number,t:Tile){if(!t.visible||!t.fixture||!INTERACTIVE.has(t.fixture))return;const X=x*TS,Y=y*TS,col=t.blocks?'#d1aa62':'#ab8b54';for(const [x1,y1,x2,y2] of[[5,7,10,7],[5,7,5,12],[27,7,22,7],[27,7,27,12],[5,27,10,27],[5,27,5,22],[27,27,22,27],[27,27,27,22]] as const)ln(c,X+x1,Y+y1,X+x2,Y+y2,col,1,.65)}

function targetMarkers(c:CanvasRenderingContext2D,s:GameState){for(const e of s.enemies){if(!e.telegraph)continue;const p=e.telegraph,t=s.tiles[p.y*s.width+p.x];if(!t?.visible)continue;const X=p.x*TS,Y=p.y*TS,col='#df8b4e';for(const [x1,y1,x2,y2] of[[4,4,12,4],[4,4,4,12],[28,4,20,4],[28,4,28,12],[4,28,12,28],[4,28,4,20],[28,28,20,28],[28,28,28,20]] as const)ln(c,X+x1,Y+y1,X+x2,Y+y2,col,2,.9);ln(c,X+12,Y+12,X+20,Y+20,col,1,.65);ln(c,X+20,Y+12,X+12,Y+20,col,1,.65)}}

const ITEM_COLOR:Record<ItemKind,string>={'red-phial':'#dc7257','salt-bomb':'#e1d8b6','blue-tonic':'#6aa2b5','chalk':'#ddd8c0','smoke-ampoule':'#b5c0ae','neutralizer':'#a9c888','copper-key':'#d89b55','black-catalyst':'#6c5a78','frost-salts':'#b9e1dc','solvent':'#c7c18d','amber-elixir':'#e4a85c'};
function itemShape(c:CanvasRenderingContext2D,kind:ItemKind,X:number,Y:number){const col=ITEM_COLOR[kind];px(c,X+9,Y+25,14,3,'#050705',.48);if(kind==='copper-key'){px(c,X+7,Y+14,15,4,col);px(c,X+18,Y+12,4,9,col);px(c,X+21,Y+16,5,3,col);px(c,X+9,Y+12,6,8,'#7b5835');return}if(kind==='chalk'){px(c,X+8,Y+19,18,4,col);px(c,X+22,Y+18,4,6,'#9e9988');return}if(kind==='salt-bomb'||kind==='frost-salts'){px(c,X+10,Y+11,13,13,'#3a3933');px(c,X+12,Y+13,9,9,col);px(c,X+14,Y+9,5,4,'#8a7954');for(const [dx,dy] of[[8,10],[24,12],[7,22],[25,24]] as const)px(c,X+dx,Y+dy,2,2,col,.8);return}if(kind==='black-catalyst'){px(c,X+16,Y+8,8,8,col);px(c,X+10,Y+14,12,12,'#2a252d');px(c,X+13,Y+16,7,7,col);return}const body=kind==='smoke-ampoule'?12:14;px(c,X+14,Y+7,5,5,'#c2a669');px(c,X+11,Y+11,11,3,'#2b312c');px(c,X+9,Y+14,body,12,'#26312e');px(c,X+11,Y+16,body-4,8,col,.95);px(c,X+12,Y+16,2,4,'#f4fff3',.45)}
function groundItems(c:CanvasRenderingContext2D,s:GameState){for(const i of s.items){const t=s.tiles[i.y*s.width+i.x];if(!t?.visible)continue;itemShape(c,i.kind,i.x*TS,i.y*TS)}}

const ENEMY_TONES:Record<EnemyKind,[string,string,string]>={
  'glass-mite':['#cfeae2','#75aaa2','#213331'],'distiller-rat':['#b78b64','#6c4e38','#251d18'],'vapor-hound':['#d1c88d','#858155','#2c2e25'],'retort-leech':['#a8b66a','#61743f','#27301f'],'soot-sprite':['#e58b45','#4a3a2e','#141412'],'brine-warden':['#9fc7c0','#537875','#213331'],'gutter-alchemist':['#c49bb9','#71556f','#28202a'],'homunculus':['#98bd78','#557347','#243223'],'glass-sentinel':['#cfece7','#78a7a5','#223332'],'miasma-moth':['#cec486','#827c55','#2a2921'],'crucible-knight':['#e0a05a','#665247','#211d1b']
};
function enemySprite(c:CanvasRenderingContext2D,kind:EnemyKind,X:number,Y:number){const [hi,mid,lo]=ENEMY_TONES[kind];px(c,X+7,Y+26,19,3,'#050605',.56);switch(kind){
  case'glass-mite':px(c,X+13,Y+12,7,8,mid);for(const [x1,y1,x2,y2] of[[14,12,9,7],[19,12,24,7],[13,19,8,24],[20,19,25,24]] as const)ln(c,X+x1,Y+y1,X+x2,Y+y2,hi,2);px(c,X+15,Y+13,3,3,hi);break;
  case'distiller-rat':px(c,X+9,Y+17,15,8,mid);px(c,X+20,Y+14,6,7,hi);px(c,X+21,Y+12,2,3,hi);px(c,X+25,Y+12,2,3,hi);ln(c,X+9,Y+22,X+4,Y+18,lo,2);ln(c,X+4,Y+18,X+2,Y+14,mid,1);break;
  case'vapor-hound':px(c,X+8,Y+14,17,11,mid);px(c,X+20,Y+10,7,8,hi);px(c,X+21,Y+8,2,4,hi);px(c,X+25,Y+8,2,4,hi);px(c,X+9,Y+24,4,4,lo);px(c,X+20,Y+24,4,4,lo);break;
  case'retort-leech':px(c,X+7,Y+19,20,7,mid);px(c,X+10,Y+17,16,5,hi);for(const xx of[11,16,21])px(c,X+xx,Y+19,2,5,lo,.7);break;
  case'soot-sprite':px(c,X+11,Y+12,11,12,lo);px(c,X+14,Y+9,6,7,mid);px(c,X+10,Y+18,3,3,hi);px(c,X+21,Y+15,3,3,hi);px(c,X+16,Y+11,2,2,'#ffd285');break;
  case'brine-warden':px(c,X+9,Y+10,15,17,mid);px(c,X+11,Y+7,11,7,hi);px(c,X+6,Y+13,5,12,lo);px(c,X+23,Y+13,5,12,lo);px(c,X+13,Y+12,6,4,'#d8ded4',.55);break;
  case'gutter-alchemist':px(c,X+10,Y+13,13,14,mid);px(c,X+11,Y+8,11,9,hi);px(c,X+13,Y+11,7,5,lo);px(c,X+23,Y+16,5,8,'#8ca677');px(c,X+25,Y+14,2,3,'#d5c477');break;
  case'homunculus':px(c,X+11,Y+11,12,15,mid);px(c,X+14,Y+7,6,7,hi);px(c,X+13,Y+14,8,8,'#31452e');px(c,X+15,Y+15,2,2,'#dce9c8');px(c,X+20,Y+15,2,2,'#dce9c8');break;
  case'glass-sentinel':px(c,X+10,Y+9,13,18,mid);px(c,X+12,Y+6,9,8,hi);ln(c,X+10,Y+12,X+5,Y+20,hi,3);ln(c,X+23,Y+12,X+28,Y+20,hi,3);px(c,X+14,Y+10,5,4,'#eef8f1',.6);break;
  case'miasma-moth':px(c,X+14,Y+12,5,14,lo);px(c,X+5,Y+10,10,12,mid);px(c,X+18,Y+10,10,12,hi);px(c,X+8,Y+12,5,3,'#d9d0a0',.45);px(c,X+21,Y+12,5,3,'#d9d0a0',.45);break;
  case'crucible-knight':px(c,X+8,Y+8,17,19,lo);px(c,X+10,Y+7,13,8,mid);px(c,X+11,Y+11,11,11,mid);px(c,X+13,Y+12,7,5,hi);px(c,X+5,Y+13,6,13,'#423733');px(c,X+23,Y+13,6,13,'#9b663f');break;
}}
function actors(c:CanvasRenderingContext2D,s:GameState){for(const e of s.enemies){const t=s.tiles[e.y*s.width+e.x];if(!t?.visible)continue;const X=e.x*TS,Y=e.y*TS;enemySprite(c,e.kind,X,Y);const max=ENEMIES[e.kind].hp;if(e.hp<max){px(c,X+7,Y+4,18,3,'#171512',.92);px(c,X+8,Y+5,Math.max(1,Math.floor(16*e.hp/max)),1,'#c85f4c',.95)}if(e.telegraph){px(c,X+13,Y+3,7,3,'#df8b4e');px(c,X+15,Y+1,3,2,'#f5c170')}}
  const X=s.player.x*TS,Y=s.player.y*TS;px(c,X+6,Y+27,20,3,'#040504',.62);px(c,X+9,Y+13,14,14,'#203b3b');px(c,X+7,Y+15,4,10,'#c9ab69');px(c,X+21,Y+15,4,10,'#c9ab69');px(c,X+11,Y+7,10,9,'#ddcfac');px(c,X+12,Y+8,8,3,'#f2e3bd');px(c,X+13,Y+12,2,2,'#2b2d28');px(c,X+18,Y+12,2,2,'#2b2d28');px(c,X+13,Y+17,7,3,'#597d78');px(c,X+15,Y+20,3,6,'#c9ab69');px(c,X+16,Y+5,2,3,'#b99758')}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x]!;facade(c,s,x,y,t);floorDetail(c,s,x,y,t);clutter(c,s,x,y,t)}silhouettes(c,s);lighting(c,s);for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x]!;if(!t.visible)continue;hazardSignature(c,x,y,t.kind,t.variant);interactionMarker(c,x,y,t)}targetMarkers(c,s);groundItems(c,s);actors(c,s)}
export { screenToTile };
