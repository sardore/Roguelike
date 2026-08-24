import type { FloorMap, Point, ThemeDefinition, WorldCoord } from '../core/types';
import { DeterministicRng } from '../core/rng';
import { applyFloorBlueprint, type StructureStamp } from './floor-blueprints';
import { applyVaultLayer, type VaultStamp } from './vaults';

export interface MapCompositionResult {
  structures: StructureStamp[];
  vaults: VaultStamp[];
}

export function composeMap(
  floor:FloorMap,
  theme:ThemeDefinition,
  coord:WorldCoord,
  rng:DeterministicRng,
  extraReserved:Point[]=[]
):MapCompositionResult{
  const structures=applyFloorBlueprint(floor,theme,coord,rng.fork('layout'),extraReserved);
  const vaults=applyVaultLayer(floor,theme,coord,rng.fork('vaults'),extraReserved);
  return{structures,vaults};
}

export function applyMapStructures(
  floor:FloorMap,
  theme:ThemeDefinition,
  coord:WorldCoord,
  rng:DeterministicRng,
  extraReserved:Point[]=[]
):StructureStamp[]{
  return composeMap(floor,theme,coord,rng,extraReserved).structures;
}
