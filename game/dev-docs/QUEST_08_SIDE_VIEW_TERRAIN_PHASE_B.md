# Quest 08 Phase B — Terrain Collision and Scoring

## What changed

Phase B completes the gameplay-side conversion from top-down lanes to side-view terrain for steps 6–10 of the refactor.

Implemented:

- landing now reconnects to terrain by detecting the player crossing the sampled surface from above
- ramp launch remains terrain-driven and uses configurable launch velocity
- old lane obstacle manager, old lane obstacle types, and old lane obstacle rendering were removed from active code
- terrain-attached blocks now collide with the player
- missing a gap and falling below the canvas causes game over
- terrain block near-miss scoring replaces side-lane near-miss scoring
- Overclock and Patch Pulse tokens spawn above valid sampled terrain instead of random Y positions
- Patch Pulse shockwaves clear terrain-attached blocks inside the landing radius
- Admin panel now exposes terrain tuning and no longer exposes obsolete lateral/lane-obstacle controls

## Collision model

Terrain blocks live inside `TerrainSegment.obstacle`.

Collision converts the player center into the obstacle's slope-local coordinate space:

```txt
player world X = worldOffset + player.x
obstacle base = obstacle.worldX sampled on its segment
local coordinates = rotate player around obstacle base by -segment angle
```

The block rectangle is then tested as:

```txt
x: -width/2 → width/2
y: -height → 0
```

This keeps flat and slope obstacle behavior consistent with rendering without adding realistic skateboard physics.

## Scoring model

Distance score and speed multipliers are unchanged.

Near-miss scoring now fires once per terrain block after the block passes behind the player. It awards the existing near-miss/combo bonus only when the player cleared the block top by a small configurable margin:

```txt
clearance = obstacleTop - playerBottom
0 <= clearance <= nearMissObstacleClearance
```

## Token placement

Overclock and Patch Pulse use `sampleTerrainAt()` to find valid terrain ahead of the camera.

Tokens are placed a fixed offset above the sampled surface and skip gaps.

## Files changed

```txt
CLAUDE.md
src/game/config/gameConfig.ts
src/game/core/types.ts
src/game/core/gameState.ts
src/game/core/gameLoop.ts
src/game/systems/collisionSystem.ts
src/game/systems/scoringSystem.ts
src/game/systems/playerController.ts
src/game/systems/terrainSystem.ts
src/game/systems/tokenManager.ts
src/game/systems/patchPulseSystem.ts
src/game/rendering/renderer.ts
src/components/game/AdminPanel.tsx
game/dev-docs/CURRENT_STATE.md
game/dev-docs/QUEST_LOG.md
game/dev-docs/QUEST_08_SIDE_VIEW_TERRAIN_PHASE_B.md
```

Deleted:

```txt
src/game/systems/obstacleManager.ts
```

## Still not built

- final terrain visual polish
- deliberate difficulty curve
- better terrain pattern authoring
- high-score persistence
- sound/music
- portfolio shell around the game

## Verification

`npm run build` passes.
