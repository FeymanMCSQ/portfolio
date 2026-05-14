# Current State

**Last updated:** 2026-05-15

## Active quest

None. Quest 12 (sound effects and gameplay music) just completed.

## What exists and works

### Movement (Quest 01 — done)
- W/↑ accelerates, release decelerates with momentum
- Touch: hold to accelerate; short tap queues jump; short tap on game-over queues restart
- A/D/←/→ no longer moves the player vertically after the side-view Phase A refactor
- Parallax grid (3 layers), speed lines, speed-reactive player colour/trail/glow
- Localhost-only master controls overlay (⚙ button, bottom-right) — live-tunes all physics values in clearly divided sections
- Master controls supports Local Settings, Global Settings, and Reset Default
- Global Settings is dev-only and writes selected tuning values back to `src/game/config/gameConfig.ts`

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
- Renderer paints all terrain first and all terrain-attached blocks second, so later slope fills cannot cover obstacle blocks
- Old lane obstacle manager/types/rendering were removed from active code

### Risk/reward routes (Quest 3C Phase 1 — done)
- Terrain generation now uses a small route pattern library instead of one flat segment-type loop
- Active Phase 1 patterns: safe flat, upper ledge, ramp arc, red drop route, obstacle line, recovery
- Terrain segments now carry `route: "main" | "upper" | "lower"` and `surfaceKind: "ground" | "platform"`
- Upper ledges are temporary one-way platform segments; player can land on them from above and fall back to the main route when they end
- Red ramps are visible platform segments marked `S ↓`
- Pressing `S`/Down while grounded on a red ramp drops the player through the platform onto a lower downhill branch
- Missing an upper ledge or not pressing on a red ramp keeps the run alive; the cost is route/reward opportunity, not instant death

### Route rewards (Quest 3C Phase 2 — done)
- The generic yellow collectible orbs were removed in Phase 3
- Risk routes now award passive score while the player stays grounded on tagged risky segments
- Upper ledges, ramp landings, deep low routes, and extreme routes use `riskLevel` metadata for score rate
- Red Score Surge pickups remain the main visible reward on risky paths
- Ramp reward patterns keep optional Energy Ring bonuses
- Score Surge is a red risky-route pickup that temporarily multiplies score gain by `scoreSurgeMultiplier`
- Score Surge affects score earned while active; progress/high-score storage still saves the resulting run score normally
- HUD shows the effective multiplier and Score Surge timer while active
- Short route feedback text shows line names like `HIGH LINE`, `RISK LINE`, `EXTREME LINE`, `DEEP LINE`, `RING BONUS`, or `SCORE SURGE`
- Master controls now expose Score Surge and Route Rewards tuning values in local/global modes

### Risk/reward balance (Quest 3C Phase 3 — done)
- Route rhythm now inserts more recovery after route-choice patterns
- Upper routes are multi-step: first high platform, upper launch ramp, hazard platform, second launch ramp, short extreme landing
- Staying higher gives more passive score, but the platforms are shorter, include gaps, and can contain blocks
- Ramp reward sections now include a real launch gap before a hazard landing instead of a safe continuous landing
- Downward routes now support chained red ramps: press `S`/Down on the first red ramp for a low route, then press again on the lower red ramp for a deeper, higher-risk branch
- Deeper lower branches include downhill speed, blocks, a gap, stronger passive score, and Score Surge placement
- The default/safe route remains continuous and readable, with fewer forced hazards

### Deterministic endless progress (Quest 09 — done)
- Runs are endless: the old 60-second survival win condition and `"won"` phase were removed
- Terrain generation uses the fixed segment pattern/index, so a block or gap at a given world position appears in the same place on replay unless the config/pattern changes
- Overclock and Patch Pulse token spacing is deterministic instead of `Math.random()`-based
- Local progress persists in `localStorage` under `runtimeRush.progress.v1`
- Stored progress: last death distance, farthest distance, best score, and the distance reached during the best-score run
- HUD shows current score, current distance, best score, and best distance
- World markers show the last death point and the best-score run death point when those positions scroll into view

### Sound effects and music (Quest 12 — done)
- `public/sfx/` contains the browser-served MP3 files copied from the root `sfx/` folder
- `audioManager.ts` owns registration, preloading, one-shots, loops, music, fades, mute persistence, and missing-file failure handling
- `audioSystem.ts` drains queued gameplay audio events, manages the acceleration loop/deceleration cooldown, and syncs gameplay music to game phase
- Audio unlocks after the first keyboard, pointer, or touch interaction
- `M` toggles mute/unmute; mute persists in `localStorage` under `runtimeRush.audio.muted.v1`
- HUD shows `[M] SOUND ON/OFF`
- Acceleration loops/fades while accelerating; deceleration is cooldown-limited
- `main_gameplay_loop.mp3` fades in during play, fades out on game over, pauses when the page is hidden, and ducks under major SFX
- Jump, landing/hard landing, pump/perfect pump, Overclock, Score Surge, Patch Pulse, ring pass, scenery shift, fall, crash, game over, and high-score sounds are wired

## Architecture snapshot

- **Stack**: Next.js 16, TypeScript 6, React 19, raw Canvas API (no game framework)
- **Game loop**: `createGameLoop(canvas, getInput)` — owns state, RAF-driven, `MAX_DELTA=0.05`
- **No React state in game loop**: `GameState` is a plain mutable object
- **Physics**: all delta-time multiplied; friction uses `Math.pow(friction, dt*60)`
- **Canvas**: 900×500px, player fixed at X=210, world scrolls left
- **Terrain**: piecewise linear side-view route-pattern segments in world coordinates; player samples terrain at `worldOffset + player.x`
- **Old lane steering removed for Phase A**: A/D no longer moves the player vertically

### Side-view terrain runner (Quest 08 Phase A/B — done)
- Added `terrain` config section: ground Y, segment lengths, slope height, ramp values, gap/platform values, obstacle block size
- Added terrain segment types: `flat`, `uphill`, `downhill`, `small-ramp`, `red-ramp`, `gap`, `flat-platform`, `flat-obstacle`, `slope-obstacle`
- Added `terrainSystem.ts`: generates connected piecewise-linear terrain ahead of the camera, culls behind, samples terrain surface/angle by world X, detects ramp end crossing
- Player is now grounded to sampled terrain while riding; `y` is actual side-view body center, not a top-down lane position
- Jumping and ramp launch detach the player from the terrain; gravity drives airborne movement; falling through gaps detaches from ground
- Renderer now draws a simple visible terrain surface and aligns the grounded player to terrain slope
- Overclock and Patch Pulse tokens now spawn above sampled terrain instead of random lane Y positions
- Tokens and shockwaves now store world X and render through `screenX = worldX - worldOffset`
- Renderer uses side-view background bounds instead of old track top/bottom config
- Gaps draw simple edge markers so missing terrain is readable
- Admin panel now exposes terrain tuning values and no longer exposes obsolete lateral/lane obstacle controls


### Patch Pulse (Quest 07, terrain-adapted in 08B — done)
- Lime green token spawns above sampled terrain (one at a time, after 3000px grace, every 4800px)
- Collecting token: `patchArmed = true` — indicator shows "PATCH  LAND TO FIRE" in HUD
- Next landing: fires shockwave at player X with radius = `baseRadius(100) + speedRatio × bonus(120)` — max 220px
- Shockwave clears terrain-attached obstacle blocks whose world X is within radius
- `justLanded: boolean` flag on PlayerState — set for exactly one frame by `updateJump` on touchdown
- Renderer: rotating lime-green cross token, flattened ground-ring shockwave (ctx.scale Y 0.22), dual rings
- AdminPanel PATCH PULSE section: shockwaveBaseRadius, shockwaveRadiusBonus, shockwaveDuration

### Focus Mode (Quest 06 — done)
- Amber meter fills while moving: `fillRate × speedRatio × dt` — ~8s to full at max speed
- Press SHIFT when full (100%) → activates 40% time scale (physDt) for ~3.7s
- While active: obstacles, player physics, scroll, and score all run at 40% speed; overclock timer runs at real speed
- Focus deactivates when meter reaches 0 or SHIFT released; meter retains remaining charge (must refill to 100% to reactivate)
- Renderer: amber edge vignette (slow 2.5 rad/s breathe), HUD meter bar (left side), "SHIFT" prompt when full
- AdminPanel FOCUS section: fillRate, drainRate, timeScale sliders

### Overclock (Quest 05, terrain-adapted in 08B — done)
- Cyan token spawns above sampled terrain (one at a time, after 2200px grace, every 3700px)
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
  phase: "idle" | "playing" | "gameOver"
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
  progress: {
    lastDistance: number
    bestDistance: number
    bestScore: number
    bestScoreDistance: number
  }
  overclockActive: boolean
  overclockTimer: number
  overclockFlash: number
  tokens: OverclockToken[] // worldX + y
  nextTokenAt: number
  nextTokenId: number
  focusMeter: number
  focusActive: boolean
  focusHeld: boolean
  pumpCooldown: number
  pumpLandingWindow: number
  pumpCrouchTimer: number
  patchCount: number
  patchTokens: PatchPulseToken[] // worldX + y
  nextPatchTokenAt: number
  nextPatchTokenId: number
  shockwaves: Shockwave[] // worldX + y
  nextShockwaveId: number
  scoreSurgeTokens: ScoreSurgeToken[]
  nextScoreSurgeTokenId: number
  scoreSurgeActive: boolean
  scoreSurgeTimer: number
  scoreSurgeFlash: number
  energyRings: EnergyRing[]
  nextEnergyRingId: number
  routeFeedbackText: string
  routeFeedbackTimer: number
  lastRiskSegmentId: number | null
  audioEvents: AudioEventName[]
  audioMuted: boolean
}
```

## Config sections in gameConfig.ts

`player`, `terrain`, `routes`, `jump`, `world`, `patchPulse`, `focus`, `pump`, `overclock`, `scoreSurge`, `rewards`, `audio`, `scoring` — all mutable (no `as const`)

## Pending / not yet built

- Portfolio pages around the game
