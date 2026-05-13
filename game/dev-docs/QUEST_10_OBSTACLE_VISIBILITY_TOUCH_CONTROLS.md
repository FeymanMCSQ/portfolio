# Quest 10 - Obstacle Visibility + Touch Controls

## Goal

Fix terrain blocks becoming hidden by later slope fills and add a basic mobile input path.

## What changed

- Terrain rendering now draws in two passes:
  - pass 1: terrain fills, strokes, gap edges
  - pass 2: terrain-attached obstacle blocks
- This prevents a later downhill/uphill segment fill from painting over a block that belongs to the previous segment.
- Added touch input:
  - hold touch to accelerate
  - short tap to jump
  - short tap also queues restart, which only matters on the game-over screen
- Canvas now disables browser touch gestures with `touchAction: "none"` and `userSelect: "none"`.

## Why the block disappeared

Blocks were drawn during each segment's render pass. Because terrain segments are drawn in world order, the next segment's filled polygon could be painted after the block and cover it. The collision still existed; only the visual was hidden.

## What was not built

- Separate on-screen buttons.
- Multi-touch controls for focus.
- Mobile-specific layout beyond responsive canvas scaling and touch input.

## Files changed

- `src/game/rendering/renderer.ts`
- `src/game/systems/inputManager.ts`
- `src/components/game/GameCanvas.tsx`
