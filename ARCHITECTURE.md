# Architecture invariants

This project treats architecture rules as correctness constraints, not style preferences.

## Canonical state

- `GameState` is the single owner of simulation state.
- UI renders a projection and never decides game rules.
- Every action passes through one simulation path; tests and UI must not have separate gameplay implementations.
- Entity identity is stable and explicit. Names, array offsets, and presentation order are never identity.
- Deterministic RNG is serializable. Same initial state + same action sequence must produce the same simulation result.

## No one-off hardcoding

New content should be expressed with existing data components and effect operations first. A unique monster, item, dungeon theme, or story beat does not earn a private execution path. If a genuinely new mechanic is required, add a reusable primitive with tests and then compose content from it.

Theme data selects generator archetypes, palettes, ecology tags, and ambience. Map algorithms are shared primitives. This prevents one theme from becoming a forked mini-engine.

## World geometry

Progression is primarily vertical (`depth`). Each descent may also change `lane`. Lane 0 is the central route, side lanes blend toward alternate ecologies, and `abs(lane) >= 4` crosses into the Abyss.

Theme transitions are communicated twice: gradually through palette/ecology/layout blending, then once through a major popup when the primary theme actually changes. Ordinary floors, loot, combat, and minor encounters never create popups.

## Map diversity gate

Every normal theme exposes at least eight floor archetype choices. Current primitives include bent room networks, tight BSP structures, dense cellular caverns, mazes with chambers, mine tunnels, catacombs, river-cut layouts, ring sanctums, and fractured maps.

Generated floors are rejected when they are too empty, too open, too disconnected, or too small. This is deliberate: broad featureless rectangles do not count as procedural variety.

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
