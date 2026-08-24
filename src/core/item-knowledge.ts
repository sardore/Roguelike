import type { GameState, ItemDefinition } from './types';
import { deriveSeed } from './rng';
import { ITEMS } from '../content/items';

const POTION_APPEARANCES = [
  'smoky amber vial','cloudy teal vial','oily black vial','milky white vial','violet glass vial','silver-flecked vial',
  'bubbling green vial','warm crimson vial','frosted blue vial','clear heavy vial','iridescent vial','muddy brown vial',
  'pale gold vial','ink-dark vial','pearlescent vial','coppery vial','rose-colored vial','gray sediment vial',
  'luminous cyan vial','deep indigo vial','orange vapor vial','chalky vial','opal vial','scarlet-threaded vial',
  'sea-green vial','smoldering vial','mirror-bright vial','purple sediment vial','brass-capped vial','wax-sealed vial',
  'cold clear vial','thick maroon vial','green-gold vial','blue-black vial','ashen vial','sunlit vial',
  'salt-crusted vial','soft pink vial','needle-bubbled vial','white-fog vial','dark ruby vial','faintly humming vial',
];

const SCROLL_APPEARANCES = [
  'creased copper strip','waxed bone strip','blue-ink strip','charcoal strip','green-thread strip','silver glyph strip',
  'red-knot strip','water-stained strip','mirror foil strip','violet seal strip','ash-dusted strip','gold stitch strip',
  'black-edged strip','cracked parchment strip','glass-fiber strip','reed-paper strip','spiral-marked strip','blank gray strip',
  'star-punched strip','rust-speckled strip','white braided strip','teal rune strip','blood-red strip','ice-blue strip',
];

function groupFor(def: ItemDefinition): 'potion' | 'scroll' | null {
  if (def.tags.includes('potion')) return 'potion';
  if (def.tags.includes('scroll')) return 'scroll';
  if (def.tags.includes('mystery') && def.category === 'consumable') return 'potion';
  if (def.tags.includes('mystery') && def.category === 'tool') return 'scroll';
  return null;
}

function appearancePool(group: 'potion' | 'scroll'): string[] {
  return group === 'potion' ? POTION_APPEARANCES : SCROLL_APPEARANCES;
}

export function isMysteryItem(def: ItemDefinition): boolean {
  return groupFor(def) !== null;
}

export function appearanceFor(def: ItemDefinition, runSeed: number): string {
  const group = groupFor(def);
  if (!group) return def.name;
  const defs = ITEMS.filter((entry) => groupFor(entry) === group)
    .slice()
    .sort((a, b) => deriveSeed(runSeed, group, a.id) - deriveSeed(runSeed, group, b.id) || a.id.localeCompare(b.id));
  const appearances = appearancePool(group)
    .slice()
    .sort((a, b) => deriveSeed(runSeed, group, a) - deriveSeed(runSeed, group, b) || a.localeCompare(b));
  const index = Math.max(0, defs.findIndex((entry) => entry.id === def.id));
  return appearances[index % appearances.length] ?? `${group} of uncertain make`;
}

export function displayItemName(state: Pick<GameState, 'runSeed' | 'identifiedItemDefs'>, def: ItemDefinition): string {
  if (!isMysteryItem(def) || state.identifiedItemDefs.includes(def.id)) return def.name;
  return appearanceFor(def, state.runSeed);
}

export function identifyItem(state: GameState, def: ItemDefinition): boolean {
  if (!isMysteryItem(def) || state.identifiedItemDefs.includes(def.id)) return false;
  state.identifiedItemDefs.push(def.id);
  return true;
}
