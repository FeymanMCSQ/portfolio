# Quest 3C Phase 1 - Risk/Reward Route Foundation

## Goal

Add simple route-choice structure without building a level editor or complex loop physics.

## What changed

- Replaced the old repeating segment list with a deterministic route pattern library.
- Added reusable Phase 1 route patterns:
  - Safe Flat
  - Upper Ledge
  - Ramp Arc
  - Red Drop Route
  - Obstacle Line
  - Recovery
- Added overlapping route support through segment metadata:
  - `route: "main" | "upper" | "lower"`
  - `surfaceKind: "ground" | "platform"`
- Added temporary upper ledges that behave like one-way platforms.
- Added red drop ramps marked with `S ↓`.
- Pressing `S`/Down while grounded on a red ramp drops through the main platform to a lower downhill route.
- Missing an optional route usually returns the player to the safe/default path instead of killing the run.

## Implementation notes

- `sampleTerrainAt` now accepts contextual sampling options so the player stays on the current/nearest surface instead of snapping to the wrong overlapping route.
- Airborne landing ignores temporarily dropped-through platforms for a short configurable window.
- Red drop ramps use the existing pump input, but only while standing on a `red-ramp` segment. Off red ramps, the old mini-overclock pump behavior remains for now.
- Platform route segments render as thin ledges instead of filling to the bottom of the canvas, keeping lower routes visible.

## New config

`GAME_CONFIG.routes`:

- `upperLedgeHeight`
- `dropRouteDepth`
- `redRampLength`
- `platformThickness`
- `dropThroughDuration`
- `dropVelocity`

## What was not built

- Score Surge.
- Collectible lines/arcs.
- Energy Ring bonus.
- Full fairness/pacing pass.
- Full Sonic loop physics.
- Level editor.

## Files changed

- `src/game/config/gameConfig.ts`
- `src/game/core/types.ts`
- `src/game/systems/terrainSystem.ts`
- `src/game/systems/playerController.ts`
- `src/game/systems/pumpSystem.ts`
- `src/game/rendering/renderer.ts`
