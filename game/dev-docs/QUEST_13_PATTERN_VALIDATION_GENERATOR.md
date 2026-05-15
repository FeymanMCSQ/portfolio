# Quest 13 - Pattern Validation Generator

## Goal

Make procedural terrain generation coherent, deterministic, and fair by choosing from reusable pattern definitions and validating each candidate before it mutates terrain.

## What changed

- Formalized route pattern metadata inside `terrainSystem.ts`.
- Added generator state to `GameState` for seed, current pattern, current difficulty, score tier, recent history, rejected reason, and hard streak.
- Added `GAME_CONFIG.generation` for seed, score tier size, distance difficulty tier length, retry count, rhythm limits, reachability margins, landing width, blind landing buffer, and debug overlay toggle.
- Replaced the fixed route-pattern cycle with deterministic candidate selection.
- Added compatibility validation before building a pattern:
  - requires at least one safe survival path
  - rejects impossible safe/risky gaps using jump/ramp reach estimates
  - rejects upper ledges that exceed configured jump reach
  - rejects too-short landing platforms
  - rejects obstacles too close after landings
  - gates hard patterns until later difficulty tiers
  - prevents endless hard-pattern chains
- Added fallback to `safe-flat` or `recovery` when candidates fail validation.
- Added a small generator debug panel in the canvas HUD.

## Supported patterns

- Safe Flat Pattern
- Recovery Pattern
- Ramp Reward Arc Pattern
- Upper Ledge Reward Pattern
- Downhill Pump Pattern
- Obstacle Reward Pattern
- Ring Gate Pattern

## Fairness invariant

Every placed pattern must keep at least one reasonable survival path. Risk/reward paths may be harder, but missing them should normally cost reward/score opportunity rather than ending the run.

## Debug overlay

Shown when `GAME_CONFIG.generation.debugOverlay` is `true`.

Displays:

- generator seed
- current pattern id
- pattern difficulty
- score tier
- pattern sequence index
- hard streak
- recent pattern history
- latest rejected pattern/fallback reason

## Files changed

- `src/game/systems/terrainSystem.ts`
- `src/game/core/types.ts`
- `src/game/core/gameState.ts`
- `src/game/config/gameConfig.ts`
- `src/game/rendering/renderer.ts`
- `game/dev-docs/CURRENT_STATE.md`
