# Alchemy City Roguelike — Rebuild 0.1

This repository was deliberately reset on 2026-08-25. The previous content-heavy prototype was removed rather than patched forward.

## Core promise
A mobile-first turn-based roguelike set in a ruined alchemical city. Every turn should create a positional or resource decision. Systems must interact instead of existing as isolated lists.

## Vertical slice: Apothecaries' Row
- Coherent street / shop / distillery architecture, not random rectangular rooms.
- Three enemies with distinct rules: shattering melee hazard, fire-averse scavenger, telegraphed corrosive attack.
- Fire, acid and thrown alchemical tools interact with terrain and enemies.
- Minimal inventory: each object should create a tactical choice.
- No hunger meter, XP treadmill, safe infinite rest, giant content catalog, or filler stats yet.
- Mobile D-pad plus tap movement; keyboard supported.

## Design laws
1. A new monster must change how the player moves, not just its numbers.
2. A new item must enable at least two meaningful uses or interactions.
3. Damage that survives a fight should matter; recovery cannot be free and infinite.
4. Unknown information is allowed, but outcomes must be learnable and consistent.
5. Maps are places first and random grids second. Rooms need purpose, entrances and readable topology.
6. Telegraphs create decisions only when escape routes and other threats make movement costly.
7. Content count is never a milestone. New content is accepted only if it creates new situations.
8. Visual materials are layered: base material, edge/structure, props, decals, light/weather. Flat color blocks are not final art.
9. One authoritative game state. Rendering reads state; it does not own rules.
10. A run should generate stories the player can retell as cause-and-effect, not merely 'a stronger number killed me'.

## Next slice gates
Before expanding districts, this slice must prove: readable mobile visuals, at least one memorable death/escape pattern, meaningful use of fire/acid/tools, and no dominant safe routine.
