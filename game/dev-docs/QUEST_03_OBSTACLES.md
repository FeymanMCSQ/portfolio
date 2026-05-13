# Quest 03 — Obstacles

## What we built

Two obstacle types that create a basic gameplay loop: go fast → read obstacle → jump or steer → survive.

Win condition: survive 60 seconds.

Controls:
- `Space` — jump (clears ground obstacles)
- `A`/`D` / `←`/`→` — steer (avoids side obstacles)
- `R` — restart after game over or win

---

## Obstacle types

### Ground obstacle (red/orange)
- Spans the full track height — cannot be steered around
- Player must jump with `jumpHeight >= groundClearHeight` (default: 45px)
- At zero speed, peak jump is ~80px — always clearable
- At max speed, peak jump is ~186px — clears with plenty of headroom
- Visual: red energy barrier with glowing core line

### Side-top obstacle (blue)
- Blocks the top 65% of the track (Y: 78–302)
- Gap at the bottom: 120px — steer into the lower third to pass
- Jump height irrelevant — only `player.y` (not `y - jumpHeight`) is checked
- Visual: blue energy barrier with downward arrow pointing toward the gap

### Side-bottom obstacle (blue)
- Blocks the bottom 65% of the track (Y: 200–422)
- Gap at the top: 122px — steer into the upper third to pass

---

## Collision system

Two distinct collision models:

**Ground obstacles**:
```ts
if (player.jumpHeight < obs.clearHeight) → collision
```
Player must be airborne. The obstacle always spans the full Y range, so steering cannot help.

**Side obstacles**:
```ts
if (player.y overlaps [obs.laneYMin, obs.laneYMax]) → collision
```
Uses the player's ground Y (not canvas Y), so jumping does nothing. Purely a steering challenge.

Both checks shrink hitboxes by 15% per side on player and obstacle for visual generosity.

---

## Spawn system

- **Grace distance**: 1600px of worldOffset before any obstacle spawns — lets the player build speed
- **Spacing**: minSpacing (700px) + random(0–500px) between spawns
- **Selection**: random uniform across all three types
- **Spawn X**: canvas right edge + 50px (off-screen, scrolls in naturally)
- **Removal**: when obstacle right edge is < -80px off the left side

The `nextObstacleAt` counter uses `worldOffset` (cumulative forward distance) rather than clock time, so obstacle density is independent of forward speed.

---

## Physics tuning

| Value | Default | Notes |
|---|---|---|
| `graceDistance` | 1600 px | Enough to reach half speed before first obstacle |
| `minSpacing` | 700 px | ~1s gap at max speed — feels rhythmic |
| `spacingRandom` | 500 px | Keeps patterns from feeling predictable |
| `groundClearHeight` | 45 px | Always clearable at any speed |
| `surviveDuration` | 60 s | ~90–120 obstacles seen in a full run |

Track geometry for side obstacles:
- Track total height: 344px (Y 78–422)
- Side obstacle blocks ~65% = 222px
- Gap = ~120px — comfortable for 18px-tall player with some margin

---

## Game state changes

Added to `GameState`:
- `obstacles: Obstacle[]` — active obstacles in screen space
- `nextObstacleAt: number` — worldOffset trigger for next spawn
- `nextObstacleId: number` — monotonic ID for stable identity

Added to `GamePhase`:
- `"won"` — 60 seconds survived

`GamePhase = "idle" | "playing" | "gameOver" | "won"`

---

## Game loop refactor

`createGameLoop` no longer takes `state` as a parameter — it owns its state internally. This enables:
- Clean restart (R key): replace state with a fresh `createInitialGameState()` without remounting the React component
- Rising-edge detection for restart: `restartHeld` tracked in the loop closure

---

## HUD additions

- **Survival progress bar**: green (→ yellow → red as time runs out), with countdown label `SURVIVE 23s`
- **Game over overlay**: red `GAME OVER` + `R — try again`
- **Win overlay**: green `YOU SURVIVED` + `R — play again`

---

## Admin panel additions

Added OBSTACLES section:
- **Min Spacing** — base gap between obstacles (lower = harder)
- **Rnd Spacing** — randomness added on top of min spacing
- **Jump Threshold** — how high to jump for ground obstacles
- **Survive Time** — seconds needed to win

All values take effect immediately — the next spawn picks up new spacing, the next collision check picks up new threshold.

---

## What was NOT built

- Obstacle patterns / sequences — purely random for now
- Difficulty scaling — obstacle density doesn't increase over time yet
- Near-miss bonus / score — no scoring system yet
- Obstacle preview / warning indicator
- Audio

---

## Files changed in this quest

```
src/game/core/types.ts              — ObstacleType, Obstacle interface, updated GameState
src/game/config/gameConfig.ts       — added obstacles config section
src/game/systems/inputManager.ts    — added restart (R key)
src/game/core/gameState.ts          — new: createInitialGameState()
src/game/systems/obstacleManager.ts — new: spawn, scroll, remove obstacles
src/game/systems/collisionSystem.ts — new: ground vs side collision logic
src/game/core/gameLoop.ts           — integrated obstacles, collision, restart, win check
src/game/rendering/renderer.ts     — draw obstacles, overlays, survival timer
src/components/game/AdminPanel.tsx  — added OBSTACLES section
src/components/game/GameCanvas.tsx  — uses new createGameLoop() signature
game/dev-docs/QUEST_03_OBSTACLES.md ← this file
```
