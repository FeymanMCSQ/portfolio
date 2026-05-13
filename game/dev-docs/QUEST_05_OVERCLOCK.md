# Quest 05 — Overclock

## Core design

Overclock is the proof of the game's central pillar: **greed creates danger.**

The token is visible, collectable, and entirely optional. When the player grabs it:
- Their max speed doubles — they can go faster if they keep accelerating
- Their score accumulates twice as fast
- Obstacles approach faster because they're moving faster
- The world tells them clearly what's happening (edge glow, badge, timer bar)

When they die during Overclock, the cause is always traceable:
- "I was going too fast to react" → they chose to accelerate into the danger zone
- "I steered toward the token instead of dodging the obstacle" → they chose the risk
- "The timer ran out and I was off-balance" → they rode it too hard

No randomness is introduced. No obstacle spawns faster because of Overclock. The only change is the player's own speed.

---

## Effect details

On token collection:
1. Immediate speed kick: `speed = min(speed × 1.35, maxSpeed × 2)`
2. `player.overclockSpeedMult = 2.0` → max speed cap = 1360 px/s
3. `overclockTimer = 5.0` (countdown to deactivation)
4. `overclockFlash = 0.14` (brief screen flash)

On expiry:
- `overclockSpeedMult` resets to 1.0
- Speed above normal max decays naturally via friction — no sudden stop

Score during Overclock: `speed × tier_multiplier × 2 × pointsPerPx × dt`

At max Overclock speed (1360 px/s), tier 4 (×4, since 1360/680 > 90%), overclock ×2:
`1360 × 8 × 0.1 = 1088 pts/s` — vs normal max 272 pts/s

5 seconds of max Overclock ≈ 5,440 pts. Same time at normal max ≈ 1,360 pts. **4× better.**

---

## Token system

- One token visible at a time
- Spawns only when: no active token, no active Overclock
- Grace distance before first token: 2200px (player has already seen obstacles first)
- Spacing: 2800–4600px between spawns
- Token Y position: random in the center 3/4 of the track (55px from each boundary)
- Token scrolls left at player's current speed (same as obstacles)
- Collection hitbox: player half-dims + tokenRadius (14px) — generous

---

## Visuals

### Token
- Pulsing outer ring (radius 13px, cyan glow, shadowBlur 22px)
- Second faint ring at larger radius — different pulse phase, feels organic
- Rotating inner diamond (8px across, rotates at 1.8 rad/s)
- Bright core dot (radius 3.5px)

### Edge vignette (during Overclock)
- 4 gradient fills from canvas edges inward (55px depth)
- Cyan while time remaining; turns orange in last 1.5s
- Intensity proportional to `overclockTimer / duration`
- Last 1.5s: pulsing at ~14 rad/s (≈2.2 Hz) — fast enough to feel urgent

### Screen flash (on collection)
- Single cyan fill over full canvas, 38% max opacity
- Fades out over 0.14s — quick punch, not distracting

### HUD badge during Overclock
- Badge background/border turns cyan
- Shows effective total: `×${tier * 2}` (e.g., ×8 at tier 4)
- Shadow blur doubles (16px)
- Overclock bar below badge depletes from full to 0 over 5s
- Bar turns orange in last 1.5s, pulses
- Label shows `OVERCLOCK  3.2s` with remaining time

---

## "Feels exciting, not unfair" design rules applied

1. **Token is always visible before it reaches the player** — minimum approach time at max speed (680 px/s, canvas width 900px minus player X 130px) = 770/680 = 1.13s. At overclock max speed (1360) — but you only HAVE overclock if you already collected the token.

2. **Overclock is opt-in** — you must steer to collect it. Tokens don't appear in the player's exact lane by default (Y range is track-wide). The player makes a deliberate movement.

3. **No obstacle density increase** — Overclock doesn't change spawn timing. The world stays exactly as hard. The difficulty increase comes entirely from the player's chosen speed.

4. **Natural deceleration on expiry** — speed doesn't drop instantly. Friction brings you down over ~2s if you stop accelerating. The player feels the power end gradually.

5. **Full information** — the edge glow, timer bar, and badge all communicate exactly how much Overclock is left. No surprises.

---

## What was NOT built

- Token label / indicator before it comes on screen ("TOKEN INCOMING")
- Combo reset on Overclock expiry (intentionally excluded — would feel punishing)
- Multiple tokens at once — by design, one at a time keeps the choice clear
- Token collection animation (sparks, etc.) — sound will handle this when audio is added
- Token reappearing based on score or performance (just time-based for now)

---

## Files changed in this quest

```
src/game/core/types.ts              — OverclockToken interface, overclockSpeedMult on PlayerState, overclock fields on GameState
src/game/config/gameConfig.ts       — added overclock section
src/game/core/gameState.ts          — initialize overclock/token fields
src/game/systems/playerController.ts — use overclockSpeedMult in speed cap
src/game/systems/tokenManager.ts    — new: token spawn, scroll, collect, overclock timer
src/game/systems/scoringSystem.ts   — apply overclock scoreMultiplier factor
src/game/core/gameLoop.ts           — call updateTokens, updateOverclock
src/game/rendering/renderer.ts      — drawTokens, drawOverclockEdge, drawOverclockFlash, HUD badge
src/components/game/AdminPanel.tsx  — OVERCLOCK section
game/dev-docs/QUEST_05_OVERCLOCK.md ← this file
game/dev-docs/CURRENT_STATE.md      — updated
game/dev-docs/QUEST_LOG.md          — updated
```
