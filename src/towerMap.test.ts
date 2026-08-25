import { describe,expect,it } from 'vitest';
import { createRun } from './tower';
import { debugConnected,reshapeTowerFloor } from './towerMap';

describe('tower map overhaul',()=>{
  it('builds connected, nontrivial layouts for all 20 floors',()=>{
    const s=createRun('tower-map-test','vanguard');
    for(let floor=1;floor<=20;floor++){
      s.floor=floor;
      const info=reshapeTowerFloor(s);
      expect(info.rooms).toBeGreaterThanOrEqual(6);
      expect(debugConnected(s)).toBe(true);
      const open=s.tiles.filter(t=>!['void','wall','chasm','books','pillar'].includes(t.kind));
      expect(open.length).toBeGreaterThan(80);
      expect(s.tiles.filter(t=>t.kind==='stairs')).toHaveLength(1);
      expect(open.some(t=>t.kind==='door')||floor>=9).toBe(true);
      for(const e of s.enemies){const t=s.tiles[e.y*s.w+e.x];expect(t).toBeTruthy();expect(['void','wall','chasm','books','pillar']).not.toContain(t!.kind)}
    }
  });
});
