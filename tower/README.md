# Tower of the First King

A mobile-first turn-based roguelike about climbing a colossal ancient tower.

The old Alchemy City runtime has been replaced. The live game now starts at the tower title screen and uses a new engine, map generator, progression structure, UI, and renderer.

## Current foundation

- 20-floor ascent split into five visual regions.
- Lower Ward → Knights’ Quarters → Hanging Gardens → Forbidden Archive → Astrarium Crown.
- Named floors and a clear upward progression fantasy.
- Three starting roles: Vanguard, Ranger, Arcanist.
- Procedural floors built from connected architectural nodes, loops, chambers, and irregular routes rather than a single rectangular arena.
- Floor guardians every fourth floor.
- Tap-to-path movement on mobile; adjacent enemy tap attacks; keyboard movement also supported.
- Four quick-use slots, pack screen, HP/guard HUD, boss health display, title screen, death/victory screens.
- Distinct environmental materials for masonry, gardens, flooded areas, archives, gears, and crown-fire.
- Turn-based enemy pursuit, loot, hazards, healing/defensive consumables, bombs, visibility and fog-of-war.

## Design rule

Every section of the tower must feel like a different age and function of one impossible structure, while the controls remain immediately readable on a phone.
