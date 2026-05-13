# Quest 06 — Focus Mode

## Core design

Focus is the counterweight to Overclock. Where Overclock rewards greed, Focus rewards patience and discipline.

The meter fills passively while you skate — faster speed means faster fill. When it's full, the player has earned a window of slow-motion. Holding Shift collapses the world to 40% speed: obstacles crawl, gaps that looked impossible become navigable, the player has time to breathe and correct.

The win condition is a specific feeling:
> "I saved myself because I used focus at the right moment."

Not: "I slowed time randomly and survived." The player has to *earn* the meter by going fast (which is also dangerous), *recognise* the right moment to use it, and *decide* to spend it rather than hoard it.

---

## Effect details

**Activation:**
- Press Shift when `focusMeter >= 1.0` (fully charged, rising edge only)
- `focusActive = true`

**While active:**
- `physDt = dt × 0.40` — all physics run at 40% speed
- This affects: player movement, obstacle scrolling, token scrolling, worldOffset, score accumulation
- This does NOT affect: `timeElapsed` (survival timer), `overclockTimer` (overclock countdown)
- Meter drains at `drainRate (0.27) × dt` — depletes over ~3.7s from full

**Deactivation:**
- Meter reaches 0: deactivates, meter stays at 0
- Player releases Shift early: deactivates, meter **retains remaining charge**
- Cannot re-activate until meter refills to 100% again

**Recharge:**
- Meter fills at `fillRate (0.12) × speedRatio × dt`
- At max speed (680 px/s): `0.12 × 1.0 = 0.12/s` → ~8.3s to full
- At half speed: ~16.6s to full
- Stationary: no fill — you must be moving to earn Focus

---

## Time scaling architecture

The key implementation decision: split `dt` into two values per frame.

```
dt       — real elapsed time (RAF delta, capped at 50ms)
physDt   — dt × 0.40 when focusActive, else dt
```

`timeElapsed` and `updateOverclock` use `dt`. Everything else uses `physDt`.

This means:
- The 60-second survival clock is never extended by using Focus
- Overclock doesn't last longer if you activate Focus during it
- Score accumulates slower during Focus (intentional — you earn less for being safe)
- Focus and Overclock can stack: max Overclock speed at 40% physics = 1360 × 0.40 = 544 effective px/s of world scroll

---

## "Feels earned, not cheap" design rules applied

1. **Fill requires forward speed** — you can't farm Focus by standing still. Going fast is how you earn it, but going fast is also what makes you need it. The tension is built in.

2. **Activate only at 100%** — partial charges can't be tapped. This prevents the player from trivially firing Focus at every obstacle. They have to hold it, which requires trusting themselves.

3. **Early release preserves charge** — if the player activates Focus and immediately sees the obstacle was easier than expected, they can release early and keep their remaining meter. No punishment for conservative use.

4. **Score slows during Focus** — activating Focus is a tradeoff. You survive the obstacle but you earn fewer points for those seconds. The game still has something to say about the choice.

5. **Survival timer is unaffected** — Focus doesn't extend the game. You can't just slow-mo your way through the last 10 seconds. The clock is always real.

6. **Full information** — the HUD meter, "SHIFT" label when full, and amber edge vignette all communicate state clearly. The player knows when they have it, when it's active, and how much is left.

---

## Visuals

### Focus meter (HUD, left side)
- Position: below the survive bar (Y≈72), same width (110px), 4px tall
- Charging: dim amber `rgba(200, 130, 20, 0.75)` filling left to right
- Full: bright gold `rgba(255, 200, 60, 0.95)` with soft glow shadow, label shows `FOCUS  SHIFT`
- Active: `rgba(255, 160, 20, ~0.95)` pulsing at 5 rad/s (≈0.8 Hz), label shows `FOCUS  1.4s` with remaining seconds

### Edge vignette (during Focus)
- 4 gradient fills from canvas edges inward (60px depth)
- Warm amber `rgba(255, 170, 20, ~0.38)`
- Breathing at 2.5 rad/s (≈0.4 Hz) — slow and calming vs. Overclock's urgent 14 rad/s
- Communicates "time is different right now" without being alarming

### Interaction with Overclock
- Both can be active simultaneously
- Overclock edge is cyan; Focus edge is amber — both render if both active (overclock edge draws first, focus edge composites over it)
- Combined visual is unusual enough to feel powerful

---

## What was NOT built

- Screen flash on Focus activation (Overclock has one; Focus is quieter by design — the edge vignette is enough)
- Focus pausing the Overclock timer (intentionally excluded — the two systems stay independent)
- Sound cue on activation (audio pass is a future quest)
- Focus meter persisting across death (resets with all other state on restart)
- Focus filling from near-misses or combo (kept simple — speed is the only fill source)

---

## Files changed in this quest

```
src/game/core/types.ts              — focusMeter, focusActive, focusHeld on GameState
src/game/config/gameConfig.ts       — added focus section (fillRate, drainRate, timeScale, activationThreshold, flashDuration)
src/game/core/gameState.ts          — initialize focus fields
src/game/systems/inputManager.ts    — focus: boolean on InputState, Shift key handler
src/game/systems/focusSystem.ts     — new: updateFocus() — fill, rising-edge activation, drain, deactivate
src/game/core/gameLoop.ts           — import updateFocus; split physDt; update call order
src/game/rendering/renderer.ts      — drawFocusEdge(), focus meter in drawHUD(), controls hint updated
src/components/game/AdminPanel.tsx  — FocusKey type, FOCUS_DEFAULTS, FOCUS section, handleChange + reset
game/dev-docs/QUEST_06_FOCUS.md    ← this file
game/dev-docs/CURRENT_STATE.md      — updated
game/dev-docs/QUEST_LOG.md          — updated
```
