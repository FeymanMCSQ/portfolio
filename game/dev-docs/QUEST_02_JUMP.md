# Quest 02 — Jump Feel

## What we built

Jump that depends on momentum. Higher speed = bigger arc. Lower speed = smaller hop.

Controls:
- `Space` — jump (single jump only, must be grounded)
- `W`/`↑` still accelerates — these are independent
- Steering (`A`/`D`) still works in the air with slightly reduced control

---

## Key design decision: speed-dependent arc

The jump velocity formula is:

```
jumpVelocity = baseVelocity + speedBonus × (currentSpeed / maxSpeed)
```

At zero speed: `420 px/s` → peak height ≈ **80px**, airtime ≈ **0.76s**
At max speed: `420 + 220 = 640 px/s` → peak height ≈ **186px**, airtime ≈ **1.16s**

This makes skating matter before there are any obstacles. The player can feel the difference between a slow-speed hop and a max-speed leap. It reinforces the core pillar: *moving faster is rewarding*.

Peak height formula: `v² / (2g)` — basic kinematics.

---

## Rising-edge detection (no hold-to-fly)

A naive `if (input.jump && isGrounded)` would let the player hold Space and bounce repeatedly on every landing frame. Instead:

```ts
const jumpPressed = input.jump && !player.jumpHeld;
player.jumpHeld = input.jump;
if (jumpPressed && player.isGrounded) { ... }
```

`jumpHeld` is stored in `PlayerState` (not a module variable) so it resets with the game state properly.

---

## Physics tuning

| Value | Number | Rationale |
|---|---|---|
| `baseVelocity` | 420 px/s | Hop at zero speed clears ~80px — visible but small |
| `speedBonus` | 220 px/s | At max speed adds 52% more height — very noticeable |
| `gravity` | 1100 px/s² | ~0.76–1.16s airtime — responsive, not floaty |
| `airControlMultiplier` | 0.82 | Steering still works but feels deliberate mid-air |
| `landingSquashDuration` | 0.14s | Fast enough to feel punchy, slow enough to see |

Gravity is the most sensitive tuning dial:
- Too high (>1800): jump feels like a short pop, no arc shape visible
- Too low (<600): jump feels floaty and disconnected from momentum
- 1100 hits "responsive but satisfying" on the tuned range

---

## Squash & stretch

Three phases of the jump animation:

**Ascending** — player stretches tall (1.2× height, 0.92× width):
```ts
squashY = 1 + velFactor * 0.2;   // tall
squashX = 1 - velFactor * 0.08;  // narrow
```
Communicates upward force. Fades to normal at peak.

**Airborne / descending** — no squash. Player returns to neutral shape.

**Landing** — immediate squash (0.62× height, 1.38× width), springs back with ease-out curve over `landingSquashDuration`:
```ts
const eased = 1 - (1 - t)²;
squashY = 0.62 + 0.38 * eased;
squashX = 1.38 - 0.38 * eased;
```

The ease-out gives a natural spring feel — fast initial recovery, smooth tail.

---

## Shadow

While airborne, an elliptical shadow is drawn at the player's ground Y position:
- Shrinks as player rises (proportional to `1 - jumpHeight / 220`)
- Fades in opacity at the same rate
- Drawn before the player so it appears underneath

This gives two pieces of feedback: where the player will land, and how high they are. Essential for obstacle clearance judgement in later quests.

---

## Landing ring

On the frame `isGrounded` becomes true, `landingTimer` is set to `0`. While `landingTimer < landingSquashDuration`:
- An expanding circle arc is drawn at the ground position
- Radius grows from 0 to 48px
- Opacity fades from 0.7 to 0

This gives a clear "thud" visual that confirms the landing moment.

---

## Air control

Lateral steering still works in the air at 82% effectiveness. This is intentional:
- Full control would make the jump feel like flying (too free)
- Zero control would make air time feel dead
- 82% keeps steering meaningful while adding a slight "committed" feeling to the arc

---

## Airborne HUD indicator

While in the air, the HUD shows `↑ NNN px` in the top-left — the current jump height in pixels. This is primarily a dev tool to understand the arc at different speeds. Can be removed in production polish.

---

## Admin panel additions

Added JUMP section to the admin panel with:
- **Base Velocity** — height at zero speed
- **Speed Bonus** — how much speed affects the arc
- **Gravity** — fall speed (most impactful dial)
- **Air Control** — lateral responsiveness while airborne

All values take effect immediately without restarting the game.

---

## What was NOT built

- Variable hold-height (holding Space for bigger jump) — not in the design doc for v1
- Coyote time (jump grace window after walking off a ledge) — no gaps yet
- Double jump — explicitly excluded in the design doc
- Jump audio — polish phase

---

## Files changed in this quest

```
src/game/config/gameConfig.ts       — added jump config section
src/game/core/types.ts              — added jumpHeight, jumpVelocity, isGrounded, landingTimer, jumpHeld
src/game/systems/inputManager.ts    — added Space key / jump input
src/game/systems/playerController.ts — added updateJump(), air control in lateral
src/game/rendering/renderer.ts      — jump offset, shadow, squash/stretch, landing ring
src/components/game/AdminPanel.tsx  — added JUMP section, refactored to handle multiple config targets
game/dev-docs/QUEST_02_JUMP.md      ← this file
```
