import { describe, expect, it } from 'vitest';
import { hash } from './rng';
import { createWorld } from './world';
import { createLateWorld } from './lateStages';
import { applyStageDetails } from './stageDetails';
import { applySpecialFeatures } from './specials';
import { applyExpansionContent } from './expansion';
import { applyDistrictSetpiece } from './setpieces';
import { applyOrganicArchitecture } from './organicArchitecture';
import type { GameState } from './types';

function build(stage:number,floor:number){
  const seed=hash(`organic-${stage}-${floor}`),s=stage<=3?createWorld(seed,stage):createLateWorld(seed,stage);s.floorInDistrict=floor;
  applyStageDetails(s);applySpecialFeatures(s);applyExpansionContent(s);applyDistrictSetpiece(s);
  return s;
}
function geometryConnected(s:GameState){
  const start=s.player.y*s.width+s.player.x,seen=new Set<number>([start]),q=[start],dirs=[[1,0],[-1,0],[0,1],[0,-1]] as const;
  for(let h=0;h<q.length;h++){const i=q[h]!,x=i%s.width,y=Math.floor(i/s.width);for(const[dx,dy]of dirs){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.width||ny>=s.height)continue;const ni=ny*s.width+nx;if(seen.has(ni)||s.tiles[ni]?.kind==='wall')continue;seen.add(ni);q.push(ni)}}
  const stair=s.tiles.findIndex(t=>t.kind==='stairs');return stair>=0&&seen.has(stair);
}

describe('organic city architecture',()=>{
  it('breaks rectangular silhouettes without deleting critical occupants or breaking an existing route',()=>{
    let changed=0;
    for(let stage=1;stage<=5;stage++)for(let floor=1;floor<=2;floor++){
      const s=build(stage,floor),wasConnected=geometryConnected(s),critical=[{x:s.player.x,y:s.player.y},...s.enemies.map(e=>({x:e.x,y:e.y})),...s.items.map(i=>({x:i.x,y:i.y}))],stairs=s.tiles.findIndex(t=>t.kind==='stairs');
      const result=applyOrganicArchitecture(s);changed+=result.cuts+result.carved;
      for(const p of critical)expect(s.tiles[p.y*s.width+p.x]?.kind).not.toBe('wall');
      expect(stairs).toBeGreaterThanOrEqual(0);expect(s.tiles[stairs]?.kind).toBe('stairs');
      if(wasConnected)expect(geometryConnected(s)).toBe(true);
      expect(s.expansionFlags?.some(f=>f.startsWith('organic-geometry:'))).toBe(true);
    }
    expect(changed).toBeGreaterThan(20);
  });
});
