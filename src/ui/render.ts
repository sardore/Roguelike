import '../tactical.css';
import type { FloorMap, GameState, Locale, Point, ThemePalette, TileKind } from '../core/types';
import { itemById } from '../content/items';
import { monsterById } from '../content/monsters';
import { resolveThemeContext, themeById } from '../world/themes';
import { featureDefinition } from '../world/features';
import { siteDefinition } from '../world/sites';
import { localizedThemeName } from '../i18n';

function blendHex(a:string,b:string,t:number):string{const parse=(hex:string)=>[1,3,5].map((offset)=>Number.parseInt(hex.slice(offset,offset+2),16));const aa=parse(a),bb=parse(b),out=aa.map((value,index)=>Math.round(value+(bb[index]!-value)*t));return `#${out.map((value)=>value.toString(16).padStart(2,'0')).join('')}`;}
function rgba(hex:string,alpha:number):string{const rgb=[1,3,5].map((offset)=>Number.parseInt(hex.slice(offset,offset+2),16));return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;}
function paletteForState(state:GameState):ThemePalette{const context=resolveThemeContext(state.coord);if(!context.blend)return context.primary.palette;const t=context.blend.weight;return{wall:blendHex(context.primary.palette.wall,context.blend.target.palette.wall,t),floor:blendHex(context.primary.palette.floor,context.blend.target.palette.floor,t),accent:blendHex(context.primary.palette.accent,context.blend.target.palette.accent,t),danger:blendHex(context.primary.palette.danger,context.blend.target.palette.danger,t),water:blendHex(context.primary.palette.water,context.blend.target.palette.water,t)};}
function tileGlyph(map:FloorMap,x:number,y:number):string{return map.exits.find((entry)=>entry.x===x&&entry.y===y)?.glyph??map.tiles[y*map.width+x]!.glyph;}
function clamp(value:number,min:number,max:number):number{return Math.max(min,Math.min(max,value));}
function noise01(x:number,y:number,seed:number):number{let n=(x*374761393+y*668265263+seed*69069)>>>0;n=(n^(n>>>13))*1274126177>>>0;return((n^(n>>>16))>>>0)/4294967295;}

interface Viewport { x:number; y:number; cols:number; rows:number; cell:number; width:number; height:number; offsetX:number; offsetY:number; }
function viewportFor(canvas:HTMLCanvasElement,state:GameState):Viewport{
  const parent=canvas.parentElement;
  const width=Math.max(320,parent?.clientWidth||canvas.clientWidth||320);
  const height=Math.max(280,parent?.clientHeight||canvas.clientHeight||280);
  const cell=width<430?20:22;
  const cols=Math.min(state.floor.width,Math.max(19,Math.ceil(width/cell)+1));
  const rows=Math.min(state.floor.height,Math.max(17,Math.ceil(height/cell)+1));
  const x=clamp(state.player.x-Math.floor(cols/2),0,Math.max(0,state.floor.width-cols));
  const y=clamp(state.player.y-Math.floor(rows/2),0,Math.max(0,state.floor.height-rows));
  const drawWidth=cols*cell,drawHeight=rows*cell;
  return{x,y,cols,rows,cell,width,height,offsetX:(width-drawWidth)/2,offsetY:(height-drawHeight)/2};
}
function threatTarget(monster:GameState['monsters'][number]):Point|null{
  const threat=monster.statuses.find((status)=>status.id==='charging'||status.id==='winding');
  if(!threat?.sourceId)return null;
  const parts=threat.sourceId.split(',');const x=Number(parts[0]),y=Number(parts[1]);
  return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}
function inView(point:Point,view:Viewport):boolean{return point.x>=view.x&&point.y>=view.y&&point.x<view.x+view.cols&&point.y<view.y+view.rows;}
function terrainColor(kind:TileKind,palette:ThemePalette):string|null{
  if(kind==='ice')return blendHex(palette.water,'#e7f6ff',.52);
  if(kind==='miasma')return blendHex(palette.danger,'#8da55c',.48);
  if(kind==='bramble')return blendHex(palette.accent,'#6f9257',.55);
  if(kind==='void-rift')return '#b184d2';
  if(kind==='oil')return '#76634b';
  if(kind==='holy')return '#d8cf9f';
  if(kind==='tree')return '#6f9a62';
  if(kind==='grass')return '#789665';
  if(kind==='reed')return '#8aa56d';
  if(kind==='fungus')return '#a7a96a';
  if(kind==='crystal')return '#aebeea';
  if(kind==='bones')return '#c5baa0';
  if(kind==='pillar')return blendHex(palette.wall,'#c2b9a6',.3);
  if(kind==='door')return '#b58f67';
  return null;
}

export function renderCanvas(canvas:HTMLCanvasElement,state:GameState):void{
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const palette=paletteForState(state),view=viewportFor(canvas,state),dpr=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1));
  const cssWidth=view.width,cssHeight=view.height;
  canvas.style.width='100%';canvas.style.height='100%';
  canvas.dataset.fxViewX=String(view.x);canvas.dataset.fxViewY=String(view.y);canvas.dataset.fxCell=String(view.cell);canvas.dataset.fxOffsetX=String(view.offsetX);canvas.dataset.fxOffsetY=String(view.offsetY);
  canvas.width=Math.round(cssWidth*dpr);canvas.height=Math.round(cssHeight*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const backdrop=ctx.createRadialGradient(cssWidth*.5,cssHeight*.48,0,cssWidth*.5,cssHeight*.48,Math.max(cssWidth,cssHeight)*.7);
  backdrop.addColorStop(0,blendHex('#090c12',palette.wall,.06));backdrop.addColorStop(1,'#040609');ctx.fillStyle=backdrop;ctx.fillRect(0,0,cssWidth,cssHeight);
  ctx.font=`600 ${Math.max(13,Math.floor(view.cell*.9))}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  const exitByPos=new Map(state.floor.exits.map((exit)=>[`${exit.x},${exit.y}`,exit])),visible=new Set(state.visible),explored=new Set(state.explored);
  const screen=(x:number,y:number)=>({x:(x-view.x)*view.cell,y:(y-view.y)*view.cell});
  ctx.save();ctx.translate(view.offsetX,view.offsetY);

  for(let sy=0;sy<view.rows;sy+=1)for(let sx=0;sx<view.cols;sx+=1){
    const x=view.x+sx,y=view.y+sy,key=`${x},${y}`;if(!explored.has(key))continue;
    const tile=state.floor.tiles[y*state.floor.width+x]!,glyph=tileGlyph(state.floor,x,y),exit=exitByPos.get(key),isVisible=visible.has(key),n=noise01(x,y,state.floor.generation.seed);
    const specialColor=terrainColor(tile.kind,palette);
    let fg=exit?palette.accent:specialColor??(tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:tile.kind==='rubble'?blendHex(palette.wall,palette.floor,.55):palette.floor);
    const tileBase=specialColor??(tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:palette.floor);
    const baseAlpha=isVisible?((tile.kind==='wall'||tile.kind==='pillar'||tile.kind==='tree')?.09:.04)+(n*.02):.012;
    ctx.fillStyle=rgba(tileBase,baseAlpha);ctx.fillRect(sx*view.cell,sy*view.cell,view.cell,view.cell);
    if(tile.kind==='water'&&isVisible){ctx.fillStyle=rgba(palette.water,.075+.025*Math.sin((state.turn+x+y)*.28));ctx.fillRect(sx*view.cell+1,sy*view.cell+1,view.cell-2,view.cell-2);}
    if(tile.kind==='lava'&&isVisible){ctx.shadowColor=palette.danger;ctx.shadowBlur=view.cell*.42;}
    if(tile.kind==='miasma'&&isVisible){ctx.fillStyle=rgba('#91a75e',.07+.035*Math.sin((state.turn+x*2+y)*.38));ctx.fillRect(sx*view.cell,sy*view.cell,view.cell,view.cell);ctx.shadowColor='#9dbd67';ctx.shadowBlur=4;}
    if(tile.kind==='void-rift'&&isVisible){ctx.fillStyle=rgba('#b184d2',.1+.04*Math.sin((state.turn+x+y)*.44));ctx.fillRect(sx*view.cell+1,sy*view.cell+1,view.cell-2,view.cell-2);ctx.shadowColor='#bd8fe3';ctx.shadowBlur=8;}
    if(tile.kind==='holy'&&isVisible){ctx.fillStyle=rgba('#e6dcae',.08);ctx.fillRect(sx*view.cell+2,sy*view.cell+2,view.cell-4,view.cell-4);ctx.shadowColor='#e8dca6';ctx.shadowBlur=5;}
    if(tile.kind==='ice'&&isVisible&&((x+y+state.turn)%5===0)){ctx.fillStyle='#eefaff';ctx.fillText('·',sx*view.cell+view.cell*.72,sy*view.cell+view.cell*.28);}
    if(tile.kind==='grass'&&isVisible&&n>.64){ctx.fillStyle=rgba('#b7c889',.5);ctx.fillText('`',sx*view.cell+view.cell*.7,sy*view.cell+view.cell*.35);}
    if(tile.kind==='tree'&&isVisible){ctx.shadowColor='#5d9652';ctx.shadowBlur=5;ctx.fillStyle=rgba('#7db36c',.08);ctx.beginPath();ctx.arc(sx*view.cell+view.cell/2,sy*view.cell+view.cell/2,view.cell*.45,0,Math.PI*2);ctx.fill();}
    if(tile.kind==='fungus'&&isVisible){ctx.shadowColor='#c3c56f';ctx.shadowBlur=3+(n*3);}
    if(tile.kind==='crystal'&&isVisible){ctx.shadowColor='#bcd3ff';ctx.shadowBlur=7;if((state.turn+x*3+y)%7===0){ctx.fillStyle='#eef5ff';ctx.fillText('·',sx*view.cell+view.cell*.75,sy*view.cell+view.cell*.25);}}
    if(tile.kind==='reed'&&isVisible&&n>.55){ctx.fillStyle=rgba('#b8c68b',.5);ctx.fillText('|',sx*view.cell+view.cell*.7,sy*view.cell+view.cell*.46);}
    if(tile.kind==='door'&&isVisible){ctx.fillStyle=rgba('#c39b6d',.09);ctx.fillRect(sx*view.cell+3,sy*view.cell+2,view.cell-6,view.cell-4);}
    if(exit&&isVisible){ctx.fillStyle=rgba(palette.accent,.11);ctx.fillRect(sx*view.cell+1,sy*view.cell+1,view.cell-2,view.cell-2);ctx.shadowColor=palette.accent;ctx.shadowBlur=5;}
    if(!isVisible)fg=blendHex(fg,'#07090d',.68);
    ctx.fillStyle=fg;ctx.fillText(glyph,sx*view.cell+view.cell/2,sy*view.cell+view.cell/2);ctx.shadowBlur=0;
  }

  for(const feature of state.features){
    if(feature.spent||!feature.revealed||!inView(feature,view))continue;const key=`${feature.x},${feature.y}`;if(!explored.has(key))continue;
    const def=featureDefinition(feature.kind),p=screen(feature.x,feature.y),isVisible=visible.has(key);if(isVisible){ctx.fillStyle=rgba(def.color,.08);ctx.fillRect(p.x+2,p.y+2,view.cell-4,view.cell-4);}
    ctx.fillStyle=isVisible?def.color:blendHex(def.color,'#07090d',.6);ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);
  }
  for(const site of state.sites){
    const key=`${site.x},${site.y}`;if(!explored.has(key)||!inView(site,view))continue;const def=siteDefinition(site.kind),p=screen(site.x,site.y),isVisible=visible.has(key);
    if(site.settlementId){ctx.fillStyle=rgba(def.color,isVisible?.13:.04);ctx.fillRect(p.x+1,p.y+1,view.cell-2,view.cell-2);}
    if(isVisible){ctx.shadowColor=def.color;ctx.shadowBlur=4;}ctx.fillStyle=isVisible?def.color:blendHex(def.color,'#07090d',.58);ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);ctx.shadowBlur=0;
  }

  for(const monster of state.monsters){
    if(!visible.has(`${monster.x},${monster.y}`))continue;const target=threatTarget(monster);if(!target||!inView(target,view))continue;const p=screen(target.x,target.y);
    ctx.fillStyle=rgba(palette.danger,.22+.06*Math.sin(state.turn*.7));ctx.fillRect(p.x+1,p.y+1,view.cell-2,view.cell-2);ctx.shadowColor=palette.danger;ctx.shadowBlur=7;ctx.fillStyle=palette.danger;ctx.fillText('!',p.x+view.cell/2,p.y+view.cell/2);ctx.shadowBlur=0;
  }
  for(const entry of state.items){if(!visible.has(`${entry.x},${entry.y}`)||!inView(entry,view))continue;const def=itemById(entry.defId),p=screen(entry.x,entry.y);ctx.shadowColor=def.color;ctx.shadowBlur=3;ctx.fillStyle=def.color;ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);ctx.shadowBlur=0;}
  for(const monster of state.monsters){if(!visible.has(`${monster.x},${monster.y}`)||!inView(monster,view))continue;const def=monsterById(monster.defId),p=screen(monster.x,monster.y),unique=def.tags.includes('unique');if(monster.power>1||unique){ctx.fillStyle=rgba(def.color,unique?.18:.09);ctx.beginPath();ctx.arc(p.x+view.cell/2,p.y+view.cell/2,view.cell*(unique?.62:.46),0,Math.PI*2);ctx.fill();}if(unique){ctx.strokeStyle=rgba(def.color,.6);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p.x+view.cell/2,p.y+view.cell/2,view.cell*.68,0,Math.PI*2);ctx.stroke();}ctx.shadowColor=def.color;ctx.shadowBlur=unique?11:monster.power>2?6:2;ctx.fillStyle=def.color;ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);ctx.shadowBlur=0;}
  const player=screen(state.player.x,state.player.y);ctx.fillStyle=rgba(palette.accent,.16);ctx.beginPath();ctx.arc(player.x+view.cell/2,player.y+view.cell/2,view.cell*.58,0,Math.PI*2);ctx.fill();ctx.shadowColor='#ffffff';ctx.shadowBlur=8;ctx.fillStyle='#f5f5f1';ctx.fillText('@',player.x+view.cell/2,player.y+view.cell/2);ctx.shadowBlur=0;
  ctx.restore();

  const vignette=ctx.createRadialGradient(cssWidth/2,cssHeight/2,Math.min(cssWidth,cssHeight)*.28,cssWidth/2,cssHeight/2,Math.max(cssWidth,cssHeight)*.68);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=vignette;ctx.fillRect(0,0,cssWidth,cssHeight);
}

export function describeState(state:GameState,locale:Locale='en'):string{const theme=themeById(state.themeId);return `${localizedThemeName(theme.id,theme.name,locale)} · ${state.coord.depth}F`;}
