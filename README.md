# Below the Lateral Edge

A large deterministic ASCII roguelike built around deep vertical progression, lateral theme drift, systemic dungeon interactions, and position-heavy tactical combat.

The main route descends through a sequence of large dungeon ecologies. Every floor also offers ways to drift sideways. Side routes gradually change palette, architecture, ambience, enemy ecology, hazards, and loot before becoming a different named theme. Drift too far and stable world generation gives way to the infinite Abyss.

The design target combines two strengths without copying either game's names, text, layouts, or other expressive content:

- systemic roguelike play: unidentified consumables, reusable environment rules, traps/boons/caches, equipment interactions, typed resistances, towns/services, and emergent combinations
- tactical roguelike play: readable enemy intentions, positioning, reach, terrain control, resistance matching, escape resources, and meaningful side-route risk

Current scale gates and systems:

- 18 normal dungeon themes + the infinite Abyss
- at least 8 floor archetype choices per normal theme
- 90+ monsters, with at least 5 native monsters for every normal theme
- 125+ items across weapons, armor, consumables, tools, and relics
- run-specific unidentified potion/scroll appearances with persistent identification knowledge
- inline mobile item tooltips showing category, rarity, effects, and traits without revealing unidentified effects
- hidden traps plus visible springs, altars, and caches generated as real floor entities
- procedural non-combat sites using the same floor/state framework: settlements, shops, healers, appraisers, cartographers, shrines, camps, rumors, and roadside services
- gold economy with deterministic shop stock, buying/selling, paid services, and protected settlement pockets
- physical/fire/cold/shock/poison/void resistance and vulnerability rules
- deterministic procedural floors with connectivity/open-area validation
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

Architecture constraints and save semantics are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).
