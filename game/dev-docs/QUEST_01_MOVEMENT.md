# Quest 01 — Movement Feel

## What we built

A blank canvas with a single player object and full momentum-based movement.

No obstacles. No score. No menus. Just movement.

The game loop runs at native frame rate via `requestAnimationFrame`. The player can:

- hold `W` / `↑` to accelerate up to a max speed
- release to decelerate with momentum (friction-based decay)
- steer left/right with `A`/`D` or `←`/`→`
- steering also has momentum — it doesn't snap

---

## Stack decision

**Next.js 16 + TypeScript + raw HTML Canvas API**

### Why Next.js

The end product is a portfolio website with an embedded game. Next.js handles routing, SSR for the portfolio pages, and gives a clean App Router structure. Starting with Next.js now avoids a migration later.

### Why raw Canvas instead of Phaser/PixiJS

- No extra dependency for a project of this scope
- Canvas rendering demonstrates more engineering skill for a portfolio piece
- Phaser's overhead and API surface would obscure what's actually happening
- We control every pixel — tuning feel means editing one file, not learning a framework's animation system
- PixiJS is WebGL-first, which is overkill for 2D sprites and rectangles

### Why TypeScript

Strict typing on `GameState`, `PlayerState`, `InputState` catches bugs early and makes the codebase safe to edit incrementally — important when building feature by feature as the docs specify.

---

## Architecture decisions

### Separation of concerns from day one

Even for a movement-only prototype, the architecture follows the module split described in `docs/03_GAME_ARCHITECTURE.md`:

```
inputManager.ts     — reads keyboard state only
playerController.ts — applies physics to PlayerState
gameLoop.ts         — orchestrates update + render each frame
renderer.ts         — reads GameState and draws; decides nothing
gameConfig.ts       — all tunable numbers in one place
```

This matters because it means every physics value is one edit in `gameConfig.ts`. No magic numbers scattered across files.

### No React state in the game loop

`GameState` is a plain mutable object passed to `createGameLoop`. The game loop reads/writes it directly every frame. React never sees it. The only React involvement is mounting/unmounting the canvas and the game loop via `useEffect`.

This follows the doc rule: *"Do not call setState 60 times per second for game objects."*

### Delta time everywhere

All movement is multiplied by `dt` (seconds since last frame). The friction formula uses `Math.pow(friction, dt * 60)` to give frame-rate-independent decay. A browser running at 30fps feels identical to one at 144fps.

Delta is capped at `0.05s` (20 fps equivalent) to prevent position teleporting if the tab freezes.

---

## Physics tuning

All values live in `src/game/config/gameConfig.ts`.

### Forward movement

| Value | Number | Rationale |
|---|---|---|
| `acceleration` | 290 px/s² | Reaches ~50% speed in ~1.2s — fast enough to feel responsive, slow enough to feel like building momentum |
| `friction` | 0.964 | `0.964^60 ≈ 0.106/s` decay → from max speed to stop in ~3 seconds. Feels like a skater on a smooth surface |
| `maxSpeed` | 680 px/s | Canvas is 900px wide. At max speed, ~0.75 canvas-widths of world pass per second — fast but readable |
| `startSpeed` | 50 px/s | Small initial speed so the parallax grid is visibly moving from frame 1 |

### Lateral movement (steering)

| Value | Number | Rationale |
|---|---|---|
| `turnAcceleration` | 460 px/s² | Reaches max lateral speed in ~0.63s. Feels weighted, not instant |
| `turnFriction` | 0.87 | Higher friction than forward — lateral drift stops in ~0.6s, feels controlled |
| `maxTurnSpeed` | 290 px/s | Track is 344px tall. Cross-track time at max lateral: ~1.2s. Fast enough to dodge obstacles later |

### Why friction uses the exponential formula

```ts
speed *= Math.pow(friction, dt * 60);
```

A naive `speed -= friction * dt` makes deceleration linear and frame-rate-dependent.
`Math.pow(friction, dt * 60)` gives exponential decay that is identical at any frame rate.
The `* 60` normalises the coefficient so the value in the config matches "friction per 60fps frame" which is intuitive to tune.

---

## Visual design decisions

### Parallax grid (3 layers)

Three layers of vertical lines scrolling at different speeds (28%, 58%, 100% of world speed). This creates depth: close lines fly past, far lines crawl. Without obstacles, this is the main cue that tells the player how fast they're going.

### Speed-reactive player

- **Trail**: length grows linearly with speed. Gives visual momentum.
- **Colour**: interpolates from cool blue → orange-red at max speed. Subconsciously signals danger at high speed, matching the "greed creates danger" design pillar.
- **Glow**: activates above 58% max speed. Reinforces the "I am fast" feeling.
- **Lean**: player rotates slightly into the direction of lateral velocity. Sells the skating feel.
- **Stretch**: subtle horizontal scale at high speed (max ~18%). Classic speed effect.

### Speed lines

18 fixed Y-slot positions with per-slot phase offsets so they don't all start at the same X. Each slot has a slightly different scroll multiplier (0.9–1.2×) so they feel organic rather than mechanical. Only appear above 12% max speed and scale in count and length with speed ratio.

### Colour-coded speed bar

Three states:
- Blue: cruising
- Amber: pushing it
- Red: near max / dangerous territory

This primes the player to associate red with danger before any obstacles exist.

---

## What was explicitly NOT built

- No scoring
- No obstacles
- No jump
- No pause or game-over state
- No portfolio content
- No sound

The doc philosophy is: *"Build a toy first. If the toy is not fun, do not add more systems yet."*

Quest 01 is the toy. Before moving to Quest 02 (jumping), the movement must pass the 30-second feel test described in the game design documents.

---

## Files created in this quest

```
src/app/page.tsx
src/app/play/page.tsx
src/app/layout.tsx
src/app/globals.css
src/components/game/GameCanvas.tsx
src/game/config/gameConfig.ts
src/game/core/types.ts
src/game/core/gameLoop.ts
src/game/systems/inputManager.ts
src/game/systems/playerController.ts
src/game/rendering/renderer.ts
package.json
tsconfig.json
next.config.ts
.gitignore
game/dev-docs/QUEST_01_MOVEMENT.md  ← this file
```

## Tuning guide

To change how the game feels, edit `src/game/config/gameConfig.ts`:

- **Snappier acceleration** → increase `acceleration` (try 350–420)
- **More slide on release** → increase `friction` toward 0.98 (longer stop)
- **Faster stops** → decrease `friction` toward 0.94
- **Quicker steering** → increase `turnAcceleration` or `maxTurnSpeed`
- **Floatier steering** → increase `turnFriction` toward 0.95
- **Higher top speed** → increase `maxSpeed` (also makes speed lines more dramatic)
