# Below the Lateral Edge

A large deterministic ASCII roguelike built around deep vertical progression, lateral theme drift, systemic dungeon interactions, and position-heavy tactical combat.

The main route descends through a sequence of large dungeon ecologies. Every floor also offers ways to drift sideways. Side routes gradually change palette, architecture, ambience, enemy ecology, hazards, and loot before becoming a different named theme. Drift too far and stable world generation gives way to the infinite Abyss.

The design target combines two strengths without copying either game's names, text, layouts, or other expressive content:

- systemic roguelike play: unidentified consumables, reusable environment rules, traps/boons/caches, equipment interactions, typed resistances, towns/services, and emergent combinations
- tactical roguelike play: readable enemy intentions, positioning, reach, terrain control, resistance matching, escape resources, and meaningful side-route risk

Current scale gates and systems:

- 18 normal dungeon themes + the infinite Abyss
- at least 8 base floor archetype choices per normal theme
- layered level composition after base topology: 9 coherent macro blueprint families + 28+ randomized, rotated/reflected minivaults + optional serial motifs
- branch-weighted vault families so a theme develops a recognizable structural identity instead of selecting every decoration equally
- one dominant environmental terrain accent per floor with only occasional secondary material, reducing visual salad while preserving tactical variety
- 160+ monsters, including named unique encounters layered over each theme
- 270+ items across weapons, armor, food, ammunition, consumables, tools, relics, jewelry, grimoires, and ritual utility
- five starting origins with genuinely different opening kits, stat profiles, mana pools, and opening spells
- 16 reusable spells with mana, targeting, terrain creation, control, escape, healing, and elemental interactions
- rings + amulets, deterministic curse/blessing, equipment enchantment, smithing, and curse removal
- four patron factions with devotion, piety, and reusable invocation boons
- guild contracts with hunt, descent, and named-foe objectives
- edible corpses and explicit interactable dungeon features instead of accidental auto-consumption
- hunger/nutrition with food scarcity, starvation, and action-based metabolism
- experience levels, permanent combat growth, ammunition, ranged weapons, resting, searching, auto-explore, and carry-weight/encumbrance
- run-specific unidentified potion/scroll appearances with persistent identification knowledge
- inline mobile item tooltips showing category, rarity, effects, and traits without revealing unidentified effects
- 15+ systemic dungeon feature kinds including hidden traps, springs, caches, graves, shelves, anvils, forage patches, memory stones, and blood wells
- procedural non-combat sites using the same floor/state framework: settlements, general shops, provisioners, healers, appraisers, cartographers, shrines, camps, trainers, inns, rumors, and roadside services
- gold economy with deterministic shop stock, buying/selling, paid services, and protected settlement pockets
- physical/fire/cold/shock/poison/void resistance and vulnerability rules
- deterministic procedural floors with connectivity/open-area validation
- systemic special terrain patches: ice, miasma, bramble, void rifts, oil, holy ground, water, lava, bridges, and rubble
- persistent structural terrain composition inside themes: woodland lanes, canals, mines, ruins, burial terraces, fungal zones, crystal galleries, shrine axes, and void fractures
- settlement floors stamp readable streets/crossroads/courtyards, doors, and separate shop/service rooms instead of clustering site markers in one chamber
- named unique-monster floors with deterministic warning, telegraphed abilities, and enhanced rewards
- full-bleed mobile viewport: the ASCII dungeon fills the available play surface instead of sitting in a small centered rectangle
- non-clickable in-map combat log overlay, square right-side d-pad, context interaction button, and actor-anchored combat/spell/level effects
- restrained glyph-first presentation: flatter UI surfaces, reduced always-on glow, and classic structural glyphs while active danger still receives strong feedback
- mobile-first player-centered ASCII viewport
- English and Korean UI modes, including item/effect/site labels and core event/message localization
- rare major-event popup system; ordinary interactions stay in the compact message feed
- dirty-lease Save & Quit protocol that rejects ordinary mid-run save/load retries

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

Architecture constraints and save semantics are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md). The layered floor-generation model and external-reference scope are documented in [`docs/LEVEL_GENERATION.md`](./docs/LEVEL_GENERATION.md).
