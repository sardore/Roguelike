import { describe, expect, it } from 'vitest';
import { findPath } from './path';
import { hash } from './rng';
import { createWorld } from './world';

describe('tap pathfinding',()=>{
  it('routes across discovered walkable street tiles',()=>{
    const s=createWorld(hash('path-basic'));
    const path=findPath(s,{x:11,y:12});
    expect(path.length).toBeGreaterThan(1);
    expect(path.at(-1)).toEqual({x:11,y:12});
  });

  it('refuses to auto-walk through open flame when another route exists',()=>{
    const s=createWorld(hash('path-fire'));
    const fire=s.tiles[12*s.width+9]!;
    fire.kind='fire';fire.discovered=true;
    const path=findPath(s,{x:11,y:12});
    expect(path.length).toBeGreaterThan(1);
    expect(path.some(p=>p.x===9&&p.y===12)).toBe(false);
  });

  it('does not path through blocking fixtures',()=>{
    const s=createWorld(hash('path-block'));
    const blocked=s.tiles[12*s.width+9]!;
    blocked.fixture='crate';blocked.blocks=true;
    const path=findPath(s,{x:11,y:12});
    expect(path.length).toBeGreaterThan(1);
    expect(path.some(p=>p.x===9&&p.y===12)).toBe(false);
  });
});
