export type Point = { x:number; y:number };

export type TileKind =
  | 'wall' | 'floor' | 'door' | 'water' | 'acid' | 'fire' | 'stairs'
  | 'steam' | 'sludge' | 'glass' | 'oil' | 'rune'
  | 'brine' | 'miasma' | 'embers' | 'crystal';

export type FixtureKind =
  | 'shelf' | 'still' | 'crate' | 'lamp' | 'planter' | 'boards' | 'herbs' | 'grate'
  | 'counter' | 'vat' | 'table' | 'awning' | 'pipe' | 'barrel' | 'cart' | 'sign'
  | 'fountain' | 'rubble' | 'cabinet' | 'boiler' | 'sealed-cache' | 'lever'
  | 'brass-gate' | 'retort' | 'ward-pylon' | 'cage' | 'incinerator'
  | 'stall' | 'valve' | 'reagent-pump' | 'bell' | 'transmuter'
  | 'crucible' | 'furnace' | 'silver-mirror' | 'archive-desk';

export type Tile = {
  kind: TileKind;
  room?: string;
  variant: number;
  discovered: boolean;
  visible: boolean;
  fixture?: FixtureKind;
  blocks?: boolean;
  state?: number;
};

export type EnemyKind =
  | 'glass-mite' | 'distiller-rat' | 'vapor-hound'
  | 'retort-leech' | 'soot-sprite' | 'brine-warden' | 'gutter-alchemist'
  | 'homunculus' | 'glass-sentinel' | 'miasma-moth' | 'crucible-knight';

export type Enemy = {
  id:string;
  kind:EnemyKind;
  x:number;
  y:number;
  hp:number;
  cooldown:number;
  telegraph?:Point;
  alert?:Point;
};

export type ItemKind =
  | 'red-phial' | 'salt-bomb' | 'blue-tonic' | 'chalk'
  | 'smoke-ampoule' | 'neutralizer' | 'copper-key' | 'black-catalyst'
  | 'frost-salts' | 'solvent' | 'amber-elixir';

export type GroundItem = { id:string; kind:ItemKind; x:number; y:number };
export type Status = 'bleeding' | 'poisoned' | 'marked' | 'sluggish' | 'warded';
export type Player = {
  x:number; y:number; hp:number; maxHp:number; guard:number;
  inventory:ItemKind[];
  statuses:Array<{id:Status;turns:number}>;
};
export type Message = { text:string; tone?:'good'|'bad'|'odd' };

export type GameState = {
  width:number;
  height:number;
  tiles:Tile[];
  player:Player;
  enemies:Enemy[];
  items:GroundItem[];
  turn:number;
  messages:Message[];
  seed:number;
  over:boolean;
  won:boolean;
  noise:Point[];
  enteredRooms:string[];
  districtStage:number;
};
