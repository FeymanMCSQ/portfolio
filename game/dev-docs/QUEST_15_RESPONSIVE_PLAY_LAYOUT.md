# Quest 15 - Responsive Play Layout

## Goal

Make `/play` fill the available screen cleanly on desktop and mobile landscape while preserving the existing gameplay simulation.

## What changed

- Replaced the small centered inline canvas layout with a full-viewport game shell.
- Added a responsive 16:9 game frame that uses the largest size that fits the viewport.
- Added DPR-aware canvas backing-store resizing with `ResizeObserver`, `window.resize`, `orientationchange`, and `visualViewport.resize`.
- Updated the game loop to clear the physical backing store and draw the existing virtual game coordinate system through a uniform transform.
- Added client-to-virtual touch mapping so tap/drag thresholds remain consistent after display scaling.
- Added a portrait mobile rotate prompt below the supported width threshold.
- Added a small fullscreen button on the game frame.

## Notes

- Gameplay, scoring, generation, and sound behavior were not changed.
- The simulation still uses the existing `GAME_CONFIG.canvas` virtual coordinate system.
- The displayed frame is 16:9; the renderer is scaled uniformly, so there is no non-uniform stretching.

## Files changed

- `src/app/play/page.tsx`
- `src/app/play/play.module.css`
- `src/components/game/GameCanvas.tsx`
- `src/components/game/GameCanvas.module.css`
- `src/game/core/gameLoop.ts`
- `src/game/systems/inputManager.ts`
- `game/dev-docs/CURRENT_STATE.md`
