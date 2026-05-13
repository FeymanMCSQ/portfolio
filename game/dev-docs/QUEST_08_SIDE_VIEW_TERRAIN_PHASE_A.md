# Quest 08 Phase A — Side-view Terrain Foundation

## What changed

The prototype no longer uses free vertical lane movement as the player model.

Phase A installs the side-view terrain foundation:

- terrain is represented as connected piecewise-linear segments in world coordinates
- the player stays near the left side of the screen while `worldOffset` scrolls the world
- grounded player Y is sampled from the terrain surface under `worldOffset + player.x`
- the player aligns visually to slope angle while grounded
- jumping and ramp launch detach the player from the ground
- gaps have no surface, so the player falls when reaching them
- landing reconnects the player to the next valid terrain surface when falling from above

## Terrain segment types

Implemented segment types:

```txt
flat
uphill
downhill
small-ramp
gap
flat-platform
flat-obstacle
slope-obstacle
```

The current generator uses a simple repeated sequence so the terrain is readable while the system is still being refactored.

## Key implementation decisions

### Player Y is now physical side-view Y

`player.y` is now the actual canvas Y for the player body center.

Old model:

```txt
player.y = top-down lane position
player.jumpHeight = visual offset above lane
```

New model:

```txt
player.y = actual side-view body center
player.surfaceY = sampled terrain surface
player.verticalVelocity = gravity/jump/ramp motion
```

`jumpHeight` is kept temporarily as a compatibility/debug value for HUD and older systems.

### Terrain is sampled, not manually steered

The player controller samples terrain at:

```txt
worldOffset + player.x
```

If a surface exists and the player is grounded, the player snaps to it and inherits its slope angle.

If no surface exists, the player becomes airborne and gravity takes over.

### Old lane obstacles are disabled for this phase

The old `ground`, `side-top`, and `side-bottom` lane obstacle spawner is disabled because those obstacles undermine the side-view refactor.

Terrain-attached obstacle blocks now exist on `flat-obstacle` and `slope-obstacle` segments and render as placeholders. Collision, scoring, and Patch Pulse interaction with those blocks are Phase B work.

Old random-Y Overclock and Patch Pulse token spawning is also disabled until Phase B can place tokens relative to sampled terrain.

## Files changed

```txt
src/game/config/gameConfig.ts
src/game/core/types.ts
src/game/core/gameState.ts
src/game/core/gameLoop.ts
src/game/systems/terrainSystem.ts
src/game/systems/playerController.ts
src/game/systems/obstacleManager.ts
src/game/rendering/renderer.ts
game/dev-docs/CURRENT_STATE.md
game/dev-docs/QUEST_LOG.md
game/dev-docs/QUEST_08_SIDE_VIEW_TERRAIN_PHASE_A.md
```

## Not built yet

- terrain-attached obstacle collision
- gap/fall death condition
- terrain-aware Overclock and Patch Pulse token placement
- scoring/near-miss rewrite for side-view block obstacles
- admin panel cleanup for obsolete lateral tuning values
- final visual polish

## Verification

`npm run build` passes.
