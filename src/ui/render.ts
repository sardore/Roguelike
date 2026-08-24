import '../tactical.css';
import type { FloorMap, GameState, Locale, Point, ThemePalette } from '../core/types';
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
function oddFloor(value:number,min:number,max:number):number{let out=Math.max(min,Math.min(max,Math.floor(value)));if(out%2===0)out-=1;return Math.max(min,out);}
function clamp(value:number,min:number,max:number):number{return Math.max(min,Math.min(max,value));}
function noise01(x:number,y:number,seed:number):number{let n=(x*374761393+y*668265263+seed*69069)>>>0;n=(n^(n>>>13))*1274126177>>>0;return((n^(n>>>16))>>>0)/4294967295;}

interface Viewport { x:number; y:number; cols:number; rows:number; cell:number; }
function viewportFor(canvas:HTMLCanvasElement,state:GameState):Viewport{
  const width=Math.max(300,canvas.clientWidth||canvas.parentElement?.clientWidth||300);
  const height=Math.max(250,canvas.clientHeight||canvas.parentElement?.clientHeight||250);
  const targetCell=width<430?17:19;
  const cols=Math.min(state.floor.width,oddFloor(width/targetCell,17,31));
  const rows=Math.min(state.floor.height,oddFloor(height/targetCell,15,31));
  const x=clamp(state.player.x-Math.floor(cols/2),0,Math.max(0,state.floor.width-cols));
  const y=clamp(state.player.y-Math.floor(rows/2),0,Math.max(0,state.floor.height-rows));
  const cell=Math.max(15,Math.floor(Math.min(width/cols,height/rows)));
  return{x,y,cols,rows,cell};
}
function threatTarget(monster:GameState['monsters'][number]):Point|null{
  const threat=monster.statuses.find((status)=>status.id==='charging'||status.id==='winding');
  if(!threat?.sourceId)return null;
  const parts=threat.sourceId.split(',');const x=Number(parts[0]),y=Number(parts[1]);
  return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}
function inView(point:Point,view:Viewport):boolean{return point.x>=view.x&&point.y>=view.y&&point.x<view.x+view.cols&&point.y<view.y+view.rows;}

export function renderCanvas(canvas:HTMLCanvasElement,state:GameState):void{
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const palette=paletteForState(state),view=viewportFor(canvas,state),dpr=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1));
  const cssWidth=view.cols*view.cell,cssHeight=view.rows*view.cell;
  canvas.style.width=`${cssWidth}px`;canvas.style.height=`${cssHeight}px`;
  canvas.width=Math.round(cssWidth*dpr);canvas.height=Math.round(cssHeight*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const backdrop=ctx.createRadialGradient(cssWidth*.5,cssHeight*.48,0,cssWidth*.5,cssHeight*.48,Math.max(cssWidth,cssHeight)*.7);
  backdrop.addColorStop(0,blendHex('#090c12',palette.wall,.06));backdrop.addColorStop(1,'#040609');ctx.fillStyle=backdrop;ctx.fillRect(0,0,cssWidth,cssHeight);
  ctx.font=`600 ${Math.max(13,Math.floor(view.cell*.9))}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  const exitByPos=new Map(state.floor.exits.map((exit)=>[`${exit.x},${exit.y}`,exit])),visible=new Set(state.visible),explored=new Set(state.explored);
  const screen=(x:number,y:number)=>({x:(x-view.x)*view.cell,y:(y-view.y)*view.cell});

  for(let sy=0;sy<view.rows;sy+=1)for(let sx=0;sx<view.cols;sx+=1){
    const x=view.x+sx,y=view.y+sy,key=`${x},${y}`;if(!explored.has(key))continue;
    const tile=state.floor.tiles[y*state.floor.width+x]!,glyph=tileGlyph(state.floor,x,y),exit=exitByPos.get(key),isVisible=visible.has(key),n=noise01(x,y,state.floor.generation.seed);
    let fg=exit?palette.accent:tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:tile.kind==='rubble'?blendHex(palette.wall,palette.floor,.55):palette.floor;
    const tileBase=tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:palette.floor;
    ctx.fillStyle=rgba(tileBase,isVisible?(tile.kind==='wall'?.075:.035)+(n*.018):.012);ctx.fillRect(sx*view.cell,sy*view.cell,view.cell,view.cell);
    if(tile.kind==='water'&&isVisible){ctx.fillStyle=rgba(palette.water,.075+.025*Math.sin((state.turn+x+y)*.28));ctx.fillRect(sx*view.cell+1,sy*view.cell+1,view.cell-2,view.cell-2);}
    if(tile.kind==='lava'&&isVisible){ctx.shadowColor=palette.danger;ctx.shadowBlur=view.cell*.42;}
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
  for(const monster of state.monsters){if(!visible.has(`${monster.x},${monster.y}`)||!inView(monster,view))continue;const def=monsterById(monster.defId),p=screen(monster.x,monster.y);if(monster.power>1){ctx.fillStyle=rgba(def.color,.09);ctx.fillRect(p.x+2,p.y+2,view.cell-4,view.cell-4);}ctx.shadowColor=def.color;ctx.shadowBlur=monster.power>2?6:2;ctx.fillStyle=def.color;ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);ctx.shadowBlur=0;}
  const player=screen(state.player.x,state.player.y);ctx.fillStyle=rgba(palette.accent,.14);ctx.beginPath();ctx.arc(player.x+view.cell/2,player.y+view.cell/2,view.cell*.52,0,Math.PI*2);ctx.fill();ctx.shadowColor='#ffffff';ctx.shadowBlur=7;ctx.fillStyle='#f5f5f1';ctx.fillText('@',player.x+view.cell/2,player.y+view.cell/2);ctx.shadowBlur=0;

  const vignette=ctx.createRadialGradient(cssWidth/2,cssHeight/2,Math.min(cssWidth,cssHeight)*.28,cssWidth/2,cssHeight/2,Math.max(cssWidth,cssHeight)*.68);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=vignette;ctx.fillRect(0,0,cssWidth,cssHeight);
}

export function describeState(state:GameState,locale:Locale='en'):string{const theme=themeById(state.themeId);return `${localizedThemeName(theme.id,theme.name,locale)} · ${state.coord.depth}F`;}
