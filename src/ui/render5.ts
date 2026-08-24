import { drawMap as baseDrawMap, screenToTile } from './render4';
import type { GameState } from '../game/types';

const TS=32;
function occupied(s:GameState,x:number,y:number){return s.player.x===x&&s.player.y===y||s.enemies.some(e=>e.x===x&&e.y===y)||s.items.some(i=>i.x===x&&i.y===y)}
function glaze(room=''){if(room.includes('glass')||room.includes('assay')||room.includes('crystal')||room.includes('mirror'))return'rgba(26,36,34,.16)';if(room.includes('distill')||room.includes('furnace')||room.includes('kiln')||room.includes('alembic'))return'rgba(36,30,24,.15)';if(room.includes('cistern')||room.includes('cooling')||room.includes('drain'))return'rgba(20,32,33,.16)';if(room.includes('sealed')||room.includes('black-market')||room.includes('sanctum'))return'rgba(31,25,29,.15)';return'rgba(22,25,20,.13)'}
export function drawMap(canvas:HTMLCanvasElement,s:GameState){baseDrawMap(canvas,s);const c=canvas.getContext('2d')!;for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){const t=s.tiles[y*s.width+x];if(!t?.visible||t.kind!=='floor'||t.fixture||occupied(s,x,y))continue;c.fillStyle=glaze(t.room);c.fillRect(x*TS+2,y*TS+2,TS-4,TS-4);c.fillStyle='rgba(214,198,151,.035)';c.fillRect(x*TS+3,y*TS+3,TS-6,1)}}
export { screenToTile };
