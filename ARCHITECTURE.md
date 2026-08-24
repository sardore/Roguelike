# Architecture invariants

This project treats architecture rules as correctness constraints, not style preferences.

## Canonical state

- `GameState` is the single owner of simulation state.
- UI renders a projection and never decides game rules.
- Every action passes through one simulation path; tests and UI must not have separate gameplay implementations.
- Entity identity is stable and explicit. Names, array offsets, and presentation order are never identity.
- Deterministic RNG is serializable. Same initial state + same action sequence must produce the same simulation result.

## No one-off hardcoding

New content should be expressed with existing data components and effect operations first. A unique monster, item, dungeon theme, settlement, shop, or story beat does not earn a private execution path. If a genuinely new mechanic is required, add a reusable primitive with tests and then compose content from it.

Theme data selects generator archetypes, palettes, ecology tags, ambience, feature weights, and content affinities. Map algorithms are shared primitives. This prevents one theme from becoming a forked mini-engine.

## Systemic gameplay rule

The game should get depth from rules that interact, not from long lists of isolated scripted exceptions.

- damage type, resistance, vulnerability, status, terrain, reach, movement, summons, traps, identification, trade, services, hunger, ammunition, experience, and encumbrance are reusable systems
- an item should preferably combine existing systems in a new way rather than introduce an item-specific executor
- dungeon features and non-combat sites are entities in canonical state, not decorative renderer-only marks
- unidentified appearances are deterministic per run and identification knowledge belongs to `GameState`
- environment effects apply to monsters as well as the player whenever the underlying rule permits it
- adding the 126th item or 91st monster should normally be content data, not another branch in the simulation core

## Non-combat world rule

Towns and services extend the same dungeon simulation rather than switching to a separate minigame or one-off scene engine.

- settlements are deterministic clusters of reusable `NonCombatSite` entities placed on ordinary generated floors
- merchant stock, gold, service usage, and site identity live in `GameState` and therefore save/restore with the run
- buy, sell, heal, cleanse, identify, map, bless, rest, meals, training, inn recovery, and rumor all enter through the canonical `GameAction` dispatcher
- settlement generation may be weighted by theme and depth, but individual named towns do not get private gameplay code
- settlement pockets are protected from ordinary monster population/movement so they function as genuine breathing spaces without creating a second combat engine
- roadside services reuse the exact same site definitions and service resolver as settlement services

## Localization rule

Simulation state is language-neutral. Localization belongs to presentation.

- canonical item/theme/site IDs and English rule messages remain stable identifiers/data; locale is not part of simulation ownership
- English/Korean rendering uses the same state and action paths
- unidentified items must remain unidentified in every language; localization must never leak hidden effects
- adding a language must extend translation tables/formatters rather than fork gameplay or save data

## Survival and inventory rule

Long-run pressure must come from reusable state, not one-off scripted hunger checks or inventory exceptions.

- nutrition changes only through canonical turn metabolism, food effects, or reusable services/features
- ranged attacks consume the shared ammunition resource through the same action dispatcher
- carry load is derived from stable item definitions and player state; shops, floor pickup, and generated rewards respect the same hard carry rule
- soft encumbrance increases metabolism and eventually reduces defense instead of silently disabling arbitrary actions
- experience and permanent growth are owned by `GameState` and awarded from canonical monster deaths

## Tactical transparency rule

Strategy should come from meaningful choices, not hidden arbitrary punishment.

- dangerous committed attacks are telegraphed when evasion is intended to be a counterplay
- enemy families must differ in positioning pressure, target range, movement behavior, resistance profile, or utility
- terrain must affect routing or combat outcomes; palette-only terrain does not count as tactical depth
- consumables and escape tools are scarce tactical resources, not mandatory UI buttons
- mobile UI stays sparse: tactical information should appear on the map or in the one-line message feed before adding persistent panels

## World geometry

Progression is primarily vertical (`depth`). Each descent may also change `lane`. Lane 0 is the central route, side lanes blend toward alternate ecologies, and `abs(lane) >= 4` crosses into the Abyss.

Theme transitions are communicated twice: gradually through palette/ecology/layout blending, then once through a major popup when the primary theme actually changes. Ordinary floors, loot, combat, traps, settlements, shops, and minor encounters never create popups.

## Map diversity gate

Every normal theme exposes at least eight floor archetype choices. Current primitives include bent room networks, tight BSP structures, dense cellular caverns, mazes with chambers, mine tunnels, catacombs, river-cut layouts, ring sanctums, and fractured maps.

Generated floors are rejected when they are too empty, too open, too disconnected, or too small. This is deliberate: broad featureless rectangles do not count as procedural variety.

## Content volume gate

Volume gates are regression constraints, not targets to satisfy with meaningless variants.

- 18 normal themes + the Abyss
- at least 8 map archetype choices per normal theme
- at least 5 native monster definitions per normal theme
- at least 160 monsters overall, with named uniques excluded from ordinary ecology sampling
- at least 230 items overall
- at least 15 reusable dungeon feature kinds

A numeric variant that only changes HP/damage without changing tactical role should not be used merely to satisfy these gates. Starting origins must be data packages over the same canonical player state, and named uniques must reuse ordinary AI/effect primitives rather than private boss executors.

## Save / load anti-scumming

Active play is always `dirty=true`.

1. Starting a run immediately writes a dirty lease.
2. Every action checkpoints the current state while remaining dirty.
3. Browser background/close checkpoints dirty; it never silently marks a run safe.
4. Only the explicit **Save & Quit** transaction may persist `dirty=false`.
5. Continue accepts only a clean envelope.
6. Before returning loaded state to gameplay, Continue atomically claims it by writing a new dirty lease and advancing the ledger.
7. A copied clean save with a sequence already claimed by the persistent ledger is rejected as replayed.

This blocks ordinary save/load retry abuse. A purely offline browser game cannot defeat a user who deletes or rewrites all local persistent storage; stronger anti-cheat would require a trusted remote authority.

## Bug-fixing discipline

- Never mask state bugs with UI watchdogs, delayed button enabling, or compensating wrappers.
- Never create a second recovery implementation that computes state differently from normal execution.
- Fix the owner/path/invariant that allowed the bad state.
- When one bug exposes a class of failures, audit the whole class rather than patching the observed instance.
- A passing happy-path test is not release evidence. Property tests, long random runs, transitions, save/restore, and invariants are required.
