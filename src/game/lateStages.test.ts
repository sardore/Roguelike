import { describe, expect, it } from 'vitest';
import { createLateWorld } from './lateStages';
import { hash } from './rng';

const roomSet=(s:ReturnType<typeof createLateWorld>)=>new Set(s.tiles.map(t=>t.room).filter(Boolean));

describe('late game districts',()=>{
  it('builds the Vitreous Catacombs as a distinct district',()=>{const s=createLateWorld(hash('glass-depths'),4),rooms=roomSet(s);for(const room of['vitreous-catacombs','mirror-ossuary','crystal-vault','preservation-hall','drain-chapel','specimen-crypt','sealed-archive'])expect(rooms.has(room)).toBe(true);for(const kind of['crystal','miasma','brine','glass','rune'])expect(s.tiles.some(t=>t.kind===kind)).toBe(true);expect(s.enemies.length).toBeGreaterThanOrEqual(8)});
  it('builds the Grand Alembic as a distinct final district',()=>{const s=createLateWorld(hash('machine-heart'),5),rooms=roomSet(s);for(const room of['grand-alembic','furnace-nave','catalyst-library','cooling-core','master-vault','central-lab','condenser-hall','final-sanctum'])expect(rooms.has(room)).toBe(true);for(const kind of['embers','brine','steam','rune','acid','crystal','oil'])expect(s.tiles.some(t=>t.kind===kind)).toBe(true);expect(s.enemies.some(e=>e.kind==='crucible-knight')).toBe(true)});
  it('keeps loot, start and exit on valid cells',()=>{for(const stage of[4,5]){const s=createLateWorld(hash(`late-safe-${stage}`),stage);expect(s.tiles.some(t=>t.kind==='stairs')).toBe(true);const start=s.tiles[s.player.y*s.width+s.player.x];expect(start?.kind).not.toBe('wall');expect(start?.blocks).not.toBe(true);for(const i of s.items){const t=s.tiles[i.y*s.width+i.x];expect(t?.kind).not.toBe('wall');expect(t?.blocks).not.toBe(true)}for(const e of s.enemies){const t=s.tiles[e.y*s.width+e.x];expect(t?.kind).not.toBe('wall');expect(t?.blocks).not.toBe(true)}}});
});
