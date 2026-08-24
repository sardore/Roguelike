import '../tactical.css';
import type { FloorMap, GameState, Point, ThemePalette } from '../core/types';
import { itemById } from '../content/items';
import { monsterById } from '../content/monsters';
import { resolveThemeContext, themeById } from '../world/themes';
import { featureDefinition } from '../world/features';

function blendHex(a:string,b:string,t:number):string{const parse=(hex:string)=>[1,3,5].map((offset)=>Number.parseInt(hex.slice(offset,offset+2),16));const aa=parse(a),bb=parse(b),out=aa.map((value,index)=>Math.round(value+(bb[index]!-value)*t));return `#${out.map((value)=>value.toString(16).padStart(2,'0')).join('')}`;}
function paletteForState(state:GameState):ThemePalette{const context=resolveThemeContext(state.coord);if(!context.blend)return context.primary.palette;const t=context.blend.weight;return{wall:blendHex(context.primary.palette.wall,context.blend.target.palette.wall,t),floor:blendHex(context.primary.palette.floor,context.blend.target.palette.floor,t),accent:blendHex(context.primary.palette.accent,context.blend.target.palette.accent,t),danger:blendHex(context.primary.palette.danger,context.blend.target.palette.danger,t),water:blendHex(context.primary.palette.water,context.blend.target.palette.water,t)};}
function tileGlyph(map:FloorMap,x:number,y:number):string{return map.exits.find((entry)=>entry.x===x&&entry.y===y)?.glyph??map.tiles[y*map.width+x]!.glyph;}
function oddFloor(value:number,min:number,max:number):number{let out=Math.max(min,Math.min(max,Math.floor(value)));if(out%2===0)out-=1;return Math.max(min,out);}
function clamp(value:number,min:number,max:number):number{return Math.max(min,Math.min(max,value));}

interface Viewport { x:number; y:number; cols:number; rows:number; cell:number; }
function viewportFor(canvas:HTMLCanvasElement,state:GameState):Viewport{
  const width=Math.max(300,canvas.clientWidth||canvas.parentElement?.clientWidth||300);
  const height=Math.max(260,canvas.clientHeight||canvas.parentElement?.clientHeight||260);
  const targetCell=width<430?16:18;
  const cols=Math.min(state.floor.width,oddFloor(width/targetCell,19,31));
  const rows=Math.min(state.floor.height,oddFloor(height/targetCell,15,31));
  const x=clamp(state.player.x-Math.floor(cols/2),0,Math.max(0,state.floor.width-cols));
  const y=clamp(state.player.y-Math.floor(rows/2),0,Math.max(0,state.floor.height-rows));
  const cell=Math.max(14,Math.floor(Math.min(width/cols,height/rows)));
  return{x,y,cols,rows,cell};
}
function threatTarget(monster:GameState['monsters'][number]):Point|null{
  const threat=monster.statuses.find((status)=>status.id==='charging'||status.id==='winding');
  if(!threat?.sourceId)return null;
  const parts=threat.sourceId.split(',');const x=Number(parts[0]),y=Number(parts[1]);
  return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
}

export function renderCanvas(canvas:HTMLCanvasElement,state:GameState):void{
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const palette=paletteForState(state),view=viewportFor(canvas,state),dpr=Math.max(1,Math.min(2,globalThis.devicePixelRatio||1));
  const cssWidth=view.cols*view.cell,cssHeight=view.rows*view.cell;
  canvas.style.width=`${cssWidth}px`;canvas.style.height=`${cssHeight}px`;
  canvas.width=Math.round(cssWidth*dpr);canvas.height=Math.round(cssHeight*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle='#07090d';ctx.fillRect(0,0,cssWidth,cssHeight);
  ctx.font=`${Math.max(13,Math.floor(view.cell*.96))}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  const exitByPos=new Map(state.floor.exits.map((exit)=>[`${exit.x},${exit.y}`,exit])),visible=new Set(state.visible),explored=new Set(state.explored);
  const screen=(x:number,y:number)=>({x:(x-view.x)*view.cell,y:(y-view.y)*view.cell});
  for(let sy=0;sy<view.rows;sy+=1)for(let sx=0;sx<view.cols;sx+=1){
    const x=view.x+sx,y=view.y+sy,key=`${x},${y}`;if(!explored.has(key))continue;
    const tile=state.floor.tiles[y*state.floor.width+x]!,glyph=tileGlyph(state.floor,x,y),exit=exitByPos.get(key);
    let color=exit?palette.accent:tile.kind==='wall'?palette.wall:tile.kind==='water'?palette.water:tile.kind==='lava'?palette.danger:tile.kind==='rubble'?blendHex(palette.wall,palette.floor,.55):palette.floor;
    if(!visible.has(key))color=blendHex(color,'#07090d',.68);
    ctx.fillStyle=color;ctx.fillText(glyph,sx*view.cell+view.cell/2,sy*view.cell+view.cell/2);
  }
  for(const feature of state.features){
    if(feature.spent||!feature.revealed)continue;const key=`${feature.x},${feature.y}`;if(!explored.has(key))continue;
    if(feature.x<view.x||feature.y<view.y||feature.x>=view.x+view.cols||feature.y>=view.y+view.rows)continue;
    const def=featureDefinition(feature.kind),p=screen(feature.x,feature.y);ctx.fillStyle=visible.has(key)?def.color:blendHex(def.color,'#07090d',.6);ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);
  }
  for(const monster of state.monsters){
    if(!visible.has(`${monster.x},${monster.y}`))continue;
    const target=threatTarget(monster);if(!target)continue;
    if(target.x<view.x||target.y<view.y||target.x>=view.x+view.cols||target.y>=view.y+view.rows)continue;
    const p=screen(target.x,target.y);
    ctx.globalAlpha=.28;ctx.fillStyle=palette.danger;ctx.fillRect(p.x+1,p.y+1,view.cell-2,view.cell-2);ctx.globalAlpha=1;
    ctx.fillStyle=palette.danger;ctx.fillText('!',p.x+view.cell/2,p.y+view.cell/2);
  }
  for(const entry of state.items){if(!visible.has(`${entry.x},${entry.y}`))continue;if(entry.x<view.x||entry.y<view.y||entry.x>=view.x+view.cols||entry.y>=view.y+view.rows)continue;const def=itemById(entry.defId),p=screen(entry.x,entry.y);ctx.fillStyle=def.color;ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);}
  for(const monster of state.monsters){if(!visible.has(`${monster.x},${monster.y}`))continue;if(monster.x<view.x||monster.y<view.y||monster.x>=view.x+view.cols||monster.y>=view.y+view.rows)continue;const def=monsterById(monster.defId),p=screen(monster.x,monster.y);ctx.fillStyle=def.color;ctx.fillText(def.glyph,p.x+view.cell/2,p.y+view.cell/2);}
  const player=screen(state.player.x,state.player.y);ctx.fillStyle='#f4f4f1';ctx.fillText('@',player.x+view.cell/2,player.y+view.cell/2);
}

export function describeState(state:GameState):string{const theme=themeById(state.themeId);return `${theme.name} · ${state.coord.depth}F`;}
