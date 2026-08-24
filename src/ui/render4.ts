import { drawMap as baseDrawMap, screenToTile } from './render3';
import type { GameState, Tile } from '../game/types';

const TS=32;
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,a=1){c.globalAlpha=a;c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),Math.floor(w),Math.floor(h));c.globalAlpha=1}
function ln(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1,a=1){c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(Math.floor(x1)+.5,Math.floor(y1)+.5);c.lineTo(Math.floor(x2)+.5,Math.floor(y2)+.5);c.stroke();c.globalAlpha=1}

const actionable=new Set<NonNullable<Tile['fixture']>>(['sealed-cache','lever','brass-gate','boiler','ward-pylon','incinerator','valve','reagent-pump','bell','transmuter','crucible','furnace','silver-mirror','archive-desk','fountain','retort']);

function enemyReadability(c:CanvasRenderingContext2D,s:GameState){for(const e of s.enemies){const t=s.tiles[e.y*s.width+e.x];if(!t?.visible)continue;const X=e.x*TS,Y=e.y*TS;px(c,X+7,Y+27,18,2,'#5e2923',.88);px(c,X+9,Y+27,14,1,'#b65f4a',.92);px(c,X+14,Y+10,2,2,'#ead8a1',.78);px(c,X+18,Y+10,2,2,'#ead8a1',.78);if(e.telegraph){ln(c,X+9,Y+5,X+23,Y+5,'#d9844c',2,.9);px(c,X+15,Y+2,4,3,'#efb765',.9)}}}
function playerReadability(c:CanvasRenderingContext2D,s:GameState){const X=s.player.x*TS,Y=s.player.y*TS;px(c,X+10,Y+6,12,2,'#f1deb0',.75);px(c,X+7,Y+28,18,2,'#8e7344',.7);px(c,X+15,Y+4,3,2,'#d6b66e',.9)}
function interactionReadability(c:CanvasRenderingContext2D,s:GameState){for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible||!t.fixture||!actionable.has(t.fixture))continue;const X=x*TS,Y=y*TS;px(c,X+26,Y+5,3,3,'#b99555',.86);px(c,X+27,Y+4,1,1,'#e3c77b',.95)}}
function hazardReadability(c:CanvasRenderingContext2D,s:GameState){for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible)continue;const X=x*TS,Y=y*TS;if(t.kind==='acid'){px(c,X+5,Y+28,22,2,'#b8cb5e',.78)}else if(t.kind==='oil'){px(c,X+7,Y+27,18,2,'#7b6478',.72)}else if(t.kind==='steam'){ln(c,X+6,Y+28,X+26,Y+28,'#c5cec3',1,.6)}else if(t.kind==='sludge'){px(c,X+6,Y+28,20,2,'#87905a',.66)}else if(t.kind==='glass'){ln(c,X+6,Y+28,X+26,Y+28,'#cbe7df',1,.72)}else if(t.kind==='rune'){ln(c,X+8,Y+29,X+24,Y+29,'#d7b868',1,.7)}else if(t.kind==='brine'){ln(c,X+6,Y+28,X+26,Y+28,'#7fa7a5',1,.68)}else if(t.kind==='miasma'){px(c,X+7,Y+28,18,2,'#8f895d',.62)}else if(t.kind==='embers'||t.kind==='fire'){px(c,X+7,Y+28,18,2,'#d9783d',.78)}else if(t.kind==='crystal'){ln(c,X+7,Y+28,X+25,Y+28,'#9bc6c2',1,.72)}}}

export function drawMap(canvas:HTMLCanvasElement,s:GameState){baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;hazardReadability(c,s);interactionReadability(c,s);enemyReadability(c,s);playerReadability(c,s)}
export { screenToTile };
