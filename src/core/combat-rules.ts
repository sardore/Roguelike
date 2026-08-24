import type { GameState, ItemDefinition, MonsterDefinition } from './types';
import { itemById } from '../content/items';

export type DamageType = 'physical' | 'fire' | 'cold' | 'shock' | 'poison' | 'void' | string;

function explicitMultiplier(tags: string[], damageType: DamageType): number | null {
  if (tags.includes(`immune:${damageType}`)) return 0;
  if (tags.includes(`vuln:${damageType}`)) return 1.5;
  if (tags.includes(`resist:${damageType}`)) return 0.55;
  return null;
}

export function monsterDamageMultiplier(def: MonsterDefinition, damageType: DamageType): number {
  const explicit = explicitMultiplier(def.tags, damageType);
  if (explicit !== null) return explicit;
  if (damageType === 'fire' && def.tags.includes('fire')) return 0.55;
  if (damageType === 'cold' && def.tags.includes('ice')) return 0.55;
  if (damageType === 'poison' && (def.tags.includes('venom') || def.tags.includes('undead') || def.tags.includes('construct'))) return 0.45;
  if (damageType === 'shock' && def.tags.includes('aquatic')) return 1.35;
  if (damageType === 'void' && def.tags.includes('void')) return 0.5;
  return 1;
}

function equippedArmor(state: GameState): ItemDefinition | null {
  const entry = state.player.inventory.find((item) => item.id === state.player.equippedArmorId);
  return entry ? itemById(entry.defId) : null;
}

export function playerDamageMultiplier(state: GameState, damageType: DamageType): number {
  const armor = equippedArmor(state);
  const tags = armor?.tags ?? [];
  const explicit = explicitMultiplier(tags, damageType);
  if (explicit !== null) return explicit;
  if (damageType === 'fire' && state.player.statuses.some((status) => status.id === 'fire-ward')) return 0.5;
  if (damageType === 'cold' && state.player.statuses.some((status) => status.id === 'cold-ward')) return 0.5;
  if (damageType === 'poison' && (state.player.statuses.some((status) => status.id === 'poison-ward') || state.player.statuses.some((status) => status.id === 'antivenom'))) return 0.35;
  if (damageType === 'shock' && tags.includes('aquatic')) return 1.25;
  if (damageType === 'void' && state.player.statuses.some((status) => status.id === 'lucid')) return 0.7;
  return 1;
}

export function weaponDamageType(def: ItemDefinition | null): DamageType {
  if (!def) return 'physical';
  const typed = def.effects.find((effect) => effect.op === 'damage' && effect.damageType);
  return typed?.op === 'damage' ? typed.damageType ?? 'physical' : 'physical';
}

export function scaleTypedDamage(amount: number, multiplier: number): number {
  if (multiplier <= 0) return 0;
  return Math.max(1, Math.round(amount * multiplier));
}
