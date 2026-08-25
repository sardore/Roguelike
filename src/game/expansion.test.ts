import { describe, expect, it } from 'vitest';
import { applyExpansionContent } from './expansion';
import { createLateWorld } from './lateStages';
import { createWorld } from './world';
import type { GameState, Tile } from './types';

const SPECIAL=new Set<NonNullable<Tile['fixture']>>([
  'relic-pedestal','pressure-console','scent-burner','field-kit','glass-organ',
  'sealed-urn','chain-hoist','observation-desk','resonator'
]);
function make(stage:number,seed=0x51aa7711):GameState{return stage<=3?createWorld(seed,stage):createLateWorld(seed,stage)}

describe('expansion content',()=>{
  it('adds deterministic rare structures and an elite encounter to every district',()=>{
    for(let stage=1;stage<=5;stage++){
      const a=make(stage),b=make(stage);applyExpansionContent(a);applyExpansionContent(b);
      const fa=a.tiles.filter(t=>t.fixture&&SPECIAL.has(t.fixture)).map(t=>t.fixture);
      const fb=b.tiles.filter(t=>t.fixture&&SPECIAL.has(t.fixture)).map(t=>t.fixture);
      expect(fa.length).toBeGreaterThanOrEqual(stage>=4?3:2);
      expect(fa).toEqual(fb);
      expect(a.enemies.some(e=>!!e.elite)).toBe(true);
      expect(a.expansionFlags).toContain(`decorated-${stage}`);
    }
  });

  it('never overwrites the entrance or exit with a special structure',()=>{
    for(let stage=1;stage<=5;stage++){
      const s=make(stage,0x1337+stage);const start={x:s.player.x,y:s.player.y};
      const stairIndex=s.tiles.findIndex(t=>t.kind==='stairs');applyExpansionContent(s);
      expect(s.tiles[start.y*s.width+start.x]?.fixture).toBeUndefined();
      expect(s.tiles[stairIndex]?.kind).toBe('stairs');
    }
  });
});
