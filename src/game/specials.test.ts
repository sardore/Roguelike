import { describe, expect, it } from 'vitest';
import { hash } from './rng';
import { applySpecialFeatures, specialSignature } from './specials';
import { applyStageDetails } from './stageDetails';
import { createWorld } from './world';

function decorated(seed:string,stage:number){const s=createWorld(hash(seed),stage);applyStageDetails(s);applySpecialFeatures(s);return s}

describe('seeded district specials',()=>{
  it('adds one recognizable special encounter to every district',()=>{for(const stage of[1,2,3]){const s=decorated(`special-${stage}`,stage);expect(specialSignature(s).length).toBeGreaterThan(0)}});
  it('is deterministic for the same run seed and stage',()=>{for(const stage of[1,2,3]){const a=decorated('same-run',stage),b=decorated('same-run',stage);expect(specialSignature(a)).toBe(specialSignature(b));expect(a.enemies.map(e=>`${e.kind}:${e.x},${e.y}`).join('|')).toBe(b.enemies.map(e=>`${e.kind}:${e.x},${e.y}`).join('|'));expect(a.items.map(i=>`${i.kind}:${i.x},${i.y}`).join('|')).toBe(b.items.map(i=>`${i.kind}:${i.x},${i.y}`).join('|'))}});
  it('never overwrites the player or district exit',()=>{for(const stage of[1,2,3]){const s=decorated(`safety-${stage}`,stage),start=s.tiles[s.player.y*s.width+s.player.x];expect(start?.kind).not.toBe('wall');expect(start?.fixture).toBeFalsy();expect(s.tiles.some(t=>t.kind==='stairs')).toBe(true);expect(s.enemies.some(e=>e.x===s.player.x&&e.y===s.player.y)).toBe(false);expect(s.items.some(i=>i.x===s.player.x&&i.y===s.player.y)).toBe(false)}});
});
