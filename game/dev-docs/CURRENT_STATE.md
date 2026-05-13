# Current State

**Last updated:** 2026-05-14

## Active quest

None. Quest 08 Phase B (terrain collision and scoring) just completed. Ready for Phase C.

## What exists and works

### Movement (Quest 01 — done)
- W/↑ accelerates, release decelerates with momentum
- A/D/←/→ no longer moves the player vertically after the side-view Phase A refactor
- Parallax grid (3 layers), speed lines, speed-reactive player colour/trail/glow
- Localhost-only admin panel (⚙ button, bottom-right) — live-tunes all physics values

### Jump (Quest 02 — done)
- Space to jump; speed-dependent arc (faster = higher + longer)
- Squash & stretch: ascending stretch, landing squash with ease-out spring
- Elliptical shadow while airborne; landing ring on touchdown
- Single jump only, rising-edge detection (no hold-to-bounce)

### Terrain obstacles (Quest 08 Phase B — done)
- Obstacle blocks are attached to `flat-obstacle` and `slope-obstacle` terrain segments
- Collision checks player body against each block in the obstacle's slope-local coordinate space
- Falling below the canvas after a missed gap causes game over
- Near-miss scoring now rewards close block clears instead of top-down lane threading
- Patch Pulse shockwaves clear terrain-attached blocks inside the landing radius
- Old lane obstacle manager/types/rendering were removed from active code

## Architecture snapshot

- **Stack**: Next.js 16, TypeScript 6, React 19, raw Canvas API (no game framework)
- **Game loop**: `createGameLoop(canvas, getInput)` — owns state, RAF-driven, `MAX_DELTA=0.05`
- **No React state in game loop**: `GameState` is a plain mutable object
- **Physics**: all delta-time multiplied; friction uses `Math.pow(friction, dt*60)`
- **Canvas**: 900×500px, player fixed at X=210, world scrolls left
- **Terrain**: piecewise linear side-view segments in world coordinates; player samples terrain at `worldOffset + player.x`
- **Old lane steering removed for Phase A**: A/D no longer moves the player vertically

### Side-view terrain runner (Quest 08 Phase A/B — done)
- Added `terrain` config section: ground Y, segment lengths, slope height, ramp values, gap/platform values, obstacle block size
- Added terrain segment types: `flat`, `uphill`, `downhill`, `small-ramp`, `gap`, `flat-platform`, `flat-obstacle`, `slope-obstacle`
- Added `terrainSystem.ts`: generates connected piecewise-linear terrain ahead of the camera, culls behind, samples terrain surface/angle by world X, detects ramp end crossing
- Player is now grounded to sampled terrain while riding; `y` is actual side-view body center, not a top-down lane position
- Jumping and ramp launch detach the player from the terrain; gravity drives airborne movement; falling through gaps detaches from ground
- Renderer now draws a simple visible terrain surface and aligns the grounded player to terrain slope
- Overclock and Patch Pulse tokens now spawn above sampled terrain instead of random lane Y positions
- Admin panel now exposes terrain tuning values and no longer exposes obsolete lateral/lane obstacle controls


### Patch Pulse (Quest 07, terrain-adapted in 08B — done)
- Lime green token spawns above sampled terrain (one at a time, after 3000px grace, every 3500–6000px)
- Collecting token: `patchArmed = true` — indicator shows "PATCH  LAND TO FIRE" in HUD
- Next landing: fires shockwave at player X with radius = `baseRadius(100) + speedRatio × bonus(120)` — max 220px
- Shockwave clears terrain-attached obstacle blocks whose world X is within radius
- `justLanded: boolean` flag on PlayerState — set for exactly one frame by `updateJump` on touchdown
- Renderer: rotating lime-green cross token, flattened ground-ring shockwave (ctx.scale Y 0.22), dual rings
- AdminPanel PATCH PULSE section: shockwaveBaseRadius, shockwaveRadiusBonus, shockwaveDuration

### Focus Mode (Quest 06 — done)
- Amber meter fills while moving: `fillRate × speedRatio × dt` — ~8s to full at max speed
- Press SHIFT when full (100%) → activates 40% time scale (physDt) for ~3.7s
- While active: obstacles, player physics, scroll, score all run at 40% speed; overclock timer and survival timer run at real speed
- Focus deactivates when meter reaches 0 or SHIFT released; meter retains remaining charge (must refill to 100% to reactivate)
- Renderer: amber edge vignette (slow 2.5 rad/s breathe), HUD meter bar (left side, below survive bar), "SHIFT" prompt when full
- AdminPanel FOCUS section: fillRate, drainRate, timeScale sliders

### Overclock (Quest 05, terrain-adapted in 08B — done)
- Cyan token spawns above sampled terrain (one at a time, after 2200px grace, every 2800–4600px)
- Collecting token: immediate ×1.35 speed kick, max speed cap doubles, 5s timer
- Effect: score multiplier ×2 (stacks with tier), score/near-miss doubled
- Renderer: rotating diamond token with pulsing rings, edge vignette glow (cyan → orange last 1.5s), brief screen flash on collect
- HUD: multiplier badge turns cyan, shows effective total (e.g. ×8), overclock bar depletes below badge
- Expires: overclockSpeedMult resets to 1.0, speed decays naturally via friction

### Scoring (Quest 04, terrain-adapted in 08B — done)
- Distance score accumulates every frame: `speed × multiplier × pointsPerPx × dt`
- Speed multiplier: ×1 / ×2 / ×3 / ×4 based on speed ratio (tiers: 35% / 65% / 90% of maxSpeed)
- Near-miss bonus: fires when a terrain block passes behind the player and was cleared by a small vertical margin; awards `nearMissBonus × multiplier × combo`
- Combo counter: increments on near-miss, resets after 5s without one
- HUD: score (top-left hero), multiplier badge (top-right, color-coded), combo counter, near-miss popup (floats/fades)
- Overlays now show final score

## GameState shape (current)

```ts
{
  phase: "idle" | "playing" | "gameOver" | "won"
  player: PlayerState
  timeElapsed: number
  worldOffset: number
  terrainSegments: TerrainSegment[]
  nextTerrainSegmentId: number
  terrainPatternIndex: number
  nextObstacleId: number
  score: number
  multiplier: 1 | 2 | 3 | 4
  combo: number
  comboTimer: number
  nearMissTimer: number
  nearMissPoints: number
  overclockActive: boolean
  overclockTimer: number
  overclockFlash: number
  tokens: OverclockToken[]
  nextTokenAt: number
  nextTokenId: number
  focusMeter: number
  focusActive: boolean
  focusHeld: boolean
  patchArmed: boolean
  patchTokens: PatchPulseToken[]
  nextPatchTokenAt: number
  nextPatchTokenId: number
  shockwaves: Shockwave[]
  nextShockwaveId: number
}
```

## Config sections in gameConfig.ts

`player`, `terrain`, `jump`, `world`, `patchPulse`, `focus`, `overclock`, `obstacles`, `scoring` — all mutable (no `as const`)

## Pending / not yet built

- Quest 08 Phase C: visual/feel polish, terrain pattern tuning, remaining docs cleanup
- Difficulty scaling (obstacle density doesn't ramp up yet)
- High score persistence
- Sound / music
- Portfolio pages around the game
- Mobile / touch controls
