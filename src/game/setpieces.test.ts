import { describe, expect, it } from 'vitest';
import { createLateWorld } from './lateStages';
import { applyStageDetails } from './stageDetails';
import { applySpecialFeatures } from './specials';
import { applyExpansionContent } from './expansion';
import { applyDistrictSetpiece, setpieceSignature } from './setpieces';
import { createWorld } from './world';

function world(stage:number,floor=1){
  const seed=0x51a7c0de;
  const s=stage<=3?createWorld(seed,stage):createLateWorld(seed,stage);
  s.floorInDistrict=floor;
  applyStageDetails(s);applySpecialFeatures(s);applyExpansionContent(s);applyDistrictSetpiece(s);
  return s;
}

describe('district setpieces',()=>{
  it('adds a themed elite setpiece on every district',()=>{
    for(let stage=1;stage<=5;stage++){
      const s=world(stage),sig=setpieceSignature(s);
      expect(sig).not.toBe('|');
      expect(s.enemies.some(e=>e.id.startsWith('setpiece-')&&!!e.elite)).toBe(true);
      expect(s.expansionFlags).toContain(`setpiece-${stage}-1`);
    }
  });

  it('adds a district master on every second floor',()=>{
    for(let stage=1;stage<=5;stage++)expect(world(stage,2).enemies.some(e=>e.id===`district-boss-${stage}`&&!!e.elite)).toBe(true);
  });

  it('never occupies the start or stair tile',()=>{
    for(let stage=1;stage<=5;stage++){
      const s=world(stage),start=s.tiles[s.player.y*s.width+s.player.x];
      expect(start?.fixture).toBeUndefined();
      const stair=s.tiles.find(t=>t.kind==='stairs');
      expect(stair?.fixture).toBeUndefined();
    }
  });

  it('is deterministic for the same seed and district',()=>{
    for(let stage=1;stage<=5;stage++)expect(setpieceSignature(world(stage))).toBe(setpieceSignature(world(stage)));
  });
});
