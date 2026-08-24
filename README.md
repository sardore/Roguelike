# Below the Lateral Edge

A large deterministic ASCII roguelike built around deep vertical progression and lateral theme drift.

The main route descends through a sequence of large dungeon ecologies. Every floor also offers ways to drift sideways. Side routes gradually change palette, architecture, ambience, and enemy ecology before becoming a different named theme. Drift too far and stable world generation gives way to the infinite Abyss.

Current foundation already enforces the intended scale gates:

- 18 normal dungeon themes + the Abyss
- at least 8 floor archetype choices per normal theme
- 57 monsters at foundation stage
- 78 items at foundation stage
- deterministic procedural floors with connectivity/open-area validation
- mobile + keyboard ASCII canvas renderer
- rare major-event popup system
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
