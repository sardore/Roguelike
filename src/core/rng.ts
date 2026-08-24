const UINT32_MAX_PLUS_ONE = 0x1_0000_0000;
export function hashString32(text: string): number { let h = 0x811c9dc5; for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
export function mix32(value: number): number { let x = value >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d); x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); x ^= x >>> 16; return x >>> 0; }
export function deriveSeed(...parts: Array<number | string>): number { let seed = 0x9e3779b9; for (const part of parts) { const value = typeof part === 'number' ? part >>> 0 : hashString32(part); seed = mix32(seed ^ value); } return seed || 0x6d2b79f5; }
export class DeterministicRng {
  private _state: number;
  constructor(seed: number) { this._state = seed >>> 0 || 0x6d2b79f5; }
  get state(): number { return this._state >>> 0; }
  set state(value: number) { this._state = value >>> 0 || 0x6d2b79f5; }
  nextU32(): number { let t = (this._state += 0x6d2b79f5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); const result = (t ^ (t >>> 14)) >>> 0; this._state >>>= 0; return result; }
  float(): number { return this.nextU32() / UINT32_MAX_PLUS_ONE; }
  int(minInclusive: number, maxInclusive: number): number { if (maxInclusive < minInclusive) throw new Error('invalid rng range'); return minInclusive + Math.floor(this.float() * (maxInclusive - minInclusive + 1)); }
  chance(probability: number): boolean { return this.float() < probability; }
  pick<T>(values: readonly T[]): T { if (values.length === 0) throw new Error('cannot pick from empty array'); return values[this.int(0, values.length - 1)]!; }
  weighted<T>(entries: ReadonlyArray<{ value: T; weight: number }>): T { const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0); if (total <= 0) throw new Error('weighted choice requires positive total weight'); let roll = this.float() * total; for (const entry of entries) { roll -= Math.max(0, entry.weight); if (roll <= 0) return entry.value; } return entries.at(-1)!.value; }
  shuffle<T>(values: readonly T[]): T[] { const out = [...values]; for (let i = out.length - 1; i > 0; i -= 1) { const j = this.int(0, i); [out[i], out[j]] = [out[j]!, out[i]!]; } return out; }
  fork(label: string | number): DeterministicRng { return new DeterministicRng(deriveSeed(this._state, label)); }
}
