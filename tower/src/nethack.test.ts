import { describe, expect, it } from 'vitest';
import { createRun, waitTurn } from './tower';
import { debugFeatureCounts, getRogueStatus, initNethackRun, searchSystem, syncNethack } from './nethack';

describe('systemic dungeon layer', () => {
  it('places interactive and hidden features', () => {
    const s=createRun('features','ranger');
    initNethackRun(s);
    const c=debugFeatureCounts(s);
    expect(c.trap).toBeGreaterThanOrEqual(2);
    expect(c.chest).toBe(1);
    expect(c.gold).toBe(1);
  });

  it('tracks hunger over turns', () => {
    const s=createRun('food','vanguard');
    initNethackRun(s);
    const before=getRogueStatus(s).nutrition;
    for(let i=0;i<4;i++){waitTurn(s);syncNethack(s)}
    expect(getRogueStatus(s).nutrition).toBeLessThan(before);
  });

  it('supports active searching', () => {
    const s=createRun('search','ranger');
    initNethackRun(s);
    expect(searchSystem(s).length).toBeGreaterThan(10);
  });
});
