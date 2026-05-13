# Quest 09 - Deterministic Endless Progress

## Goal

Make replays stable at the same world positions, remove the finite survival ending, and persist visible player progress between runs.

## What changed

- Removed the old 60-second win condition. Runs now continue until collision, missed-gap fall, or another failure condition.
- Removed the `"won"` game phase from active state and renderer logic.
- Added `ProgressState` to `GameState`.
- Added `progressStorage.ts` for localStorage load/save.
- Persisted:
  - `lastDistance`
  - `bestDistance`
  - `bestScore`
  - `bestScoreDistance`
- Added HUD readouts for current score, current distance, best score, and best distance.
- Added in-world dashed markers for the last death point and best-score run death point.
- Replaced randomized token spacing with deterministic spacing:
  - Overclock: every 3700px after 2200px grace
  - Patch Pulse: every 4800px after 3000px grace

## Determinism notes

Terrain is generated from a fixed segment pattern and a monotonic `terrainPatternIndex`, so the same run configuration produces the same terrain at the same world X on every replay.

Tokens now advance by fixed world-distance spacing instead of `Math.random()`. If a token cannot spawn on the current segment, the retry offset is a fixed 450px, so retries are deterministic too.

## What was not built

- Seeded random generation.
- Runtime level editor or authored checkpoint files.
- Cloud/profile save sync.
- Difficulty ramping over long distances.

## Files changed

- `src/game/core/types.ts`
- `src/game/core/gameState.ts`
- `src/game/core/gameLoop.ts`
- `src/game/config/gameConfig.ts`
- `src/game/systems/progressStorage.ts`
- `src/game/systems/tokenManager.ts`
- `src/game/systems/patchPulseSystem.ts`
- `src/game/rendering/renderer.ts`
- `src/components/game/AdminPanel.tsx`
