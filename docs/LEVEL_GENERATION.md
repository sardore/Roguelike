# Level generation architecture

The floor builder is deliberately layered. A theme is not a single generator and a feature is not a special-case room.

## Pipeline

1. **Base topology** — one of the shared procedural floor archetypes establishes the main connected dungeon graph.
2. **Macro blueprint** — one or two large coherent zones reshape a meaningful part of the level: canal quarters, mine spines, woodland lanes, ruined blocks, burial terraces, fungal zones, crystal galleries, shrine axes, or fracture scars.
3. **Randomized minivault layer** — small authored tactical fragments are selected by depth/theme affinity, rotated/reflected, and stamped into the generated level. They are original project content and are not copied from another game's map files.
4. **Serial motif** — some floors repeat two related minivault fragments from one family so the floor develops a coherent visual/gameplay motif instead of becoming a bag of unrelated decorations.
5. **Settlement special** — when a settlement is selected, its streets/crossroads/courtyard and separate buildings are stamped into the ordinary dungeon map.
6. **Terrain accent pass** — the floor picks one dominant environmental accent and, rarely, one secondary accent. Random patches do not independently choose unrelated terrain kinds.
7. **Sites, features, population, loot** — ordinary canonical systems populate the finished geometry.
8. **Connectivity repair + regression tests** — player arrival and required exits remain traversable after structural composition.

## Reference principles

Dungeon Crawl Stone Soup is used as a design reference for its separation between broad level layouts, regular/floating vaults, post-generation minivaults, and serial vaults. The important idea is composition: random topology provides the unknown, while many small authored fragments provide memorable tactical situations and flavour. Vaults should be randomized and should not seize the whole level every time.

Cataclysm: DDA is used only as a map-structure reference: weighted variants of a location, large structures assembled from smaller local pieces, and connected linear features such as roads/tunnels. Its simulation complexity is not a design target for this project.

No Crawl or Cataclysm map/source code is copied into this project. Their public source and documentation are read as references; the implementation and map patterns here are original.

## Visual restraint

More terrain types do not mean more terrain types per screen. A floor should have a dominant material language. Structural tiles use restrained glyphs (`T`, `*`, `%`, `O`, `+`) and theme-derived colours. Glow and animation are reserved for active danger, uniques, the player, and important effects.

The goal is a readable classic roguelike map first, atmosphere second, spectacle only when an event deserves it.

## Content gates

- 9 macro blueprint families are currently available.
- 28+ randomized minivault definitions are required by tests.
- normal themes retain 8+ base topology choices before the composition layers are applied.
- minivault placement is capped so authored fragments enrich a level instead of covering it.
- exit connectivity is asserted across repeated generated-floor tests.
