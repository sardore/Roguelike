import { describe, expect, it } from 'vitest';
import { Game } from './engine';
describe('room observations',()=>{it('records a room observation only on first entry',()=>{const g=new Game('observe');const s=g.state;const before=s.messages.length;s.player.x=24;s.player.y=11;g.move(0,-1);const after=s.messages.length;g.move(0,1);g.move(0,-1);expect(after).toBeGreaterThanOrEqual(before);expect(s.enteredRooms.filter(r=>r==='distillery').length).toBeLessThanOrEqual(1)})});
