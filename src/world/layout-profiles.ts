import type { ThemeDefinition } from '../core/types';
import type { StructureKind } from './floor-blueprints';

export type VaultFamily='fort'|'water'|'crypt'|'wild'|'arcane'|'works'|'rift';
export interface LayoutProfile {
  macro:Array<{value:StructureKind;weight:number}>;
  vaultFamilies:Array<{value:VaultFamily;weight:number}>;
  serialChance:number;
  secondaryMacroChance:number;
}

const P=(
  macro:Array<[StructureKind,number]>,
  vaultFamilies:Array<[VaultFamily,number]>,
  serialChance=.48,
  secondaryMacroChance=.62,
):LayoutProfile=>({macro:macro.map(([value,weight])=>({value,weight})),vaultFamilies:vaultFamilies.map(([value,weight])=>({value,weight})),serialChance,secondaryMacroChance});

const PROFILES:Record<string,LayoutProfile>={
  'moss-cistern':P([['canal-quarter',3],['ruined-blocks',2],['woodland-lanes',1.5],['shrine-axis',.6]],[['water',3],['fort',2],['wild',1.3]],.42,.58),
  'drowned-aqueduct':P([['canal-quarter',7],['ruined-blocks',2],['burial-terraces',.8],['woodland-lanes',.7]],[['water',7],['crypt',1.5],['wild',1]],.5,.7),
  'ember-mine':P([['mine-spine',7],['ruined-blocks',2.5],['shrine-axis',.5]],[['works',7],['fort',2],['arcane',.4]],.5,.68),
  'fungal-vault':P([['fungal-zone',7],['woodland-lanes',3],['ruined-blocks',1]],[['wild',8],['crypt',1],['water',.7]],.58,.72),
  'ossuary-terraces':P([['burial-terraces',7],['ruined-blocks',2],['shrine-axis',1.4]],[['crypt',8],['fort',1.5],['arcane',.7]],.62,.7),
  ironwarren:P([['mine-spine',6],['ruined-blocks',4],['shrine-axis',.5]],[['works',6],['fort',4],['arcane',.5]],.54,.7),
  'crystal-hollows':P([['crystal-gallery',7],['mine-spine',1.8],['fracture-scar',.7],['ruined-blocks',.6]],[['arcane',8],['works',1.4],['rift',.5]],.52,.72),
  'venom-fen':P([['canal-quarter',5],['woodland-lanes',4],['fungal-zone',2.5]],[['water',5],['wild',5],['crypt',.5]],.58,.76),
  'storm-archive':P([['ruined-blocks',3.5],['shrine-axis',3],['crystal-gallery',2.5],['mine-spine',1]],[['arcane',6],['fort',2],['works',1.5]],.5,.68),
  'ash-cathedral':P([['shrine-axis',4.5],['ruined-blocks',4],['burial-terraces',2],['mine-spine',.7]],[['arcane',4],['crypt',3],['fort',2]],.56,.7),
  'flesh-cloister':P([['fungal-zone',3],['fracture-scar',3],['ruined-blocks',2],['woodland-lanes',1]],[['wild',4],['rift',4],['crypt',1]],.56,.7),
  'clockwork-necropolis':P([['mine-spine',3.5],['burial-terraces',3.5],['ruined-blocks',3],['shrine-axis',.6]],[['works',4],['crypt',4],['fort',2]],.62,.76),
  'frozen-observatory':P([['crystal-gallery',7],['shrine-axis',2],['ruined-blocks',2]],[['arcane',8],['fort',1.4],['works',.6]],.5,.72),
  'sunken-palace':P([['canal-quarter',5.5],['ruined-blocks',3.5],['shrine-axis',2]],[['water',5],['fort',3],['arcane',2]],.56,.72),
  'void-garden':P([['fracture-scar',5],['woodland-lanes',3.5],['shrine-axis',1],['fungal-zone',1]],[['rift',6],['wild',3],['arcane',1]],.62,.76),
  'royal-chasm':P([['ruined-blocks',4.5],['shrine-axis',3.5],['burial-terraces',2],['mine-spine',1.5]],[['fort',5],['crypt',2],['arcane',2],['works',1]],.58,.74),
  'dream-prison':P([['fracture-scar',3.5],['ruined-blocks',2.5],['shrine-axis',2],['crystal-gallery',1.5]],[['rift',5],['arcane',3],['fort',1.5]],.62,.8),
  'star-forge':P([['mine-spine',5],['crystal-gallery',2.5],['fracture-scar',2],['shrine-axis',1]],[['works',5],['arcane',3],['rift',2]],.58,.78),
  abyss:P([['fracture-scar',7],['fungal-zone',1.2],['crystal-gallery',1.2],['canal-quarter',1],['ruined-blocks',1]],[['rift',7],['arcane',1],['wild',1],['crypt',1],['works',1]],.7,.9),
};

function fallback(theme:ThemeDefinition):LayoutProfile{
  const tags=new Set(theme.monsterTags),macro:Array<[StructureKind,number]>=[['ruined-blocks',2],['mine-spine',1]],families:Array<[VaultFamily,number]>=[['fort',1]];
  if(tags.has('aquatic')||tags.has('venom')){macro.push(['canal-quarter',4]);families.push(['water',4]);}
  if(tags.has('plant')||tags.has('beast')||tags.has('fungal')){macro.push(['woodland-lanes',3]);families.push(['wild',3]);}
  if(tags.has('fungal'))macro.push(['fungal-zone',5]);if(tags.has('undead')||tags.has('spirit')){macro.push(['burial-terraces',4]);families.push(['crypt',4]);}
  if(tags.has('crystal')||tags.has('ice')||tags.has('caster')){macro.push(['crystal-gallery',3]);families.push(['arcane',3]);}
  if(tags.has('construct')||tags.has('fire'))families.push(['works',3]);if(tags.has('void')||tags.has('aberrant')){macro.push(['fracture-scar',5]);families.push(['rift',5]);}
  return P(macro,families,.48,.64);
}

export function layoutProfileFor(theme:ThemeDefinition):LayoutProfile{return PROFILES[theme.id]??fallback(theme);}
export function validateLayoutProfiles(themeIds:string[]):string[]{const errors:string[]=[];for(const id of themeIds)if(!PROFILES[id])errors.push(`missing layout profile for ${id}`);return errors;}
