# Quest 08 Phase C — Side-view Cleanup

## What changed

Phase C finishes steps 11–14 of the side-view runner refactor.

Implemented:

- Overclock tokens store `worldX` and render relative to `worldOffset`
- Patch Pulse tokens store `worldX` and render relative to `worldOffset`
- Patch Pulse shockwaves store `worldX` and render relative to `worldOffset`
- old player `trackTopY` / `trackBottomY` config was removed
- renderer background and speed-line bounds are no longer tied to the old top-down track band
- gaps render simple edge markers so missing terrain is readable
- docs were updated for the completed side-view terrain conversion

## Why this matters

After Phase B, terrain blocks were world-space, but tokens and shockwaves still used old screen-space scrolling.

That worked visually in many cases, but it left two coordinate models in the engine:

```txt
terrain / obstacles = world X
tokens / shockwaves = screen X
```

Phase C makes moving world objects consistent:

```txt
screenX = worldX - worldOffset
```

This makes future polish, collectibles, effects, and camera changes easier to reason about.

## Files changed

```txt
src/game/config/gameConfig.ts
src/game/core/types.ts
src/game/systems/tokenManager.ts
src/game/systems/patchPulseSystem.ts
src/game/rendering/renderer.ts
game/dev-docs/CURRENT_STATE.md
game/dev-docs/QUEST_LOG.md
game/dev-docs/QUEST_08_SIDE_VIEW_TERRAIN_PHASE_C.md
```

## Verification

`npm run build` passes.
