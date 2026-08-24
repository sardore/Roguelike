import { describe, expect, it } from 'vitest';
import { hash } from './rng';
import { useItem } from './systems';
import { createWorld } from './world';

describe('alchemical interactions',()=>{
  it('throws a red phial onto the tapped tile instead of maximum range',()=>{
    const s=createWorld(hash('exact-throw'));
    const target={x:10,y:12};
    useItem(s,0,target);
    expect(s.tiles[target.y*s.width+target.x]?.kind).toBe('fire');
  });

  it('burns a flammable fixture when hit',()=>{
    const s=createWorld(hash('burn-fixture'));
    const t=s.tiles[12*s.width+10]!;
    t.fixture='crate';t.blocks=true;
    useItem(s,0,{x:10,y:12});
    expect(t.kind).toBe('fire');
    expect(t.fixture).toBeUndefined();
    expect(t.blocks).toBe(false);
  });

  it('makes healing tonic scent mechanically persist',()=>{
    const s=createWorld(hash('tonic-scent'));
    s.player.inventory=['blue-tonic'];s.player.hp=10;
    useItem(s,0);
    expect(s.player.hp).toBeGreaterThan(10);
    expect(s.player.statuses.some(st=>st.id==='marked'&&st.turns>0)).toBe(true);
  });
});
