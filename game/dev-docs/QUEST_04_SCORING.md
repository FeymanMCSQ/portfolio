# Quest 04 — Scoring & Combo

## What we built

A scoring system where going faster is measurably more rewarding — and visibly so.

The heart of the game: slow = safe but boring, fast = dangerous but profitable.

---

## Score formula

```
score += player.speed × multiplier × pointsPerPx × dt
```

Every frame. Accumulates continuously while playing. At max speed ×4: `680 × 4 × 0.1 × dt = 272 pts/s`. At zero speed: 0 pts/s.

Score difference over 60 seconds:
- Full crawl (speed ≈ 0, ×1): ~0
- Moderate (300 px/s, ×2): ~3,600
- Max speed ×4 the whole time: ~16,300

The player can feel the difference in seconds.

---

## Speed multiplier tiers

| Tier | Speed ratio | Speed (px/s) | HUD colour |
|------|------------|--------------|------------|
| ×1   | < 35%      | < 238        | Gray-blue (dull) |
| ×2   | 35–65%     | 238–442      | Green |
| ×3   | 65–90%     | 442–612      | Amber |
| ×4   | ≥ 90%      | ≥ 612        | Red (danger) |

Thresholds are configurable: `GAME_CONFIG.scoring.tier2 / tier3 / tier4`.

The ×4 zone is narrow (90–100% of max speed) — it's the risk zone. The player has to be going nearly flat-out to get it.

---

## Near-miss bonus

Fires once per obstacle as it passes the player, if the player was in the close-call zone.

**Ground obstacle**: near-miss if `clearHeight ≤ jumpHeight < clearHeight × 2.5`
(barely cleared — jumped just high enough but not with headroom)

**Side obstacles**: near-miss if player's Y is within 36px of the obstacle's open edge
(threaded the gap close to the wall)

Bonus formula:
```
bonus = nearMissBonus × multiplier × (combo + 1)
```

- Base bonus: 50
- At ×3, combo 2: `50 × 3 × 3 = 450`

The multiplier double-dips: going fast both earns distance score faster AND inflates near-miss bonuses.

---

## Combo counter

Increments on every near-miss. Resets if no near-miss within `comboTimeout` (5 seconds).

It never resets on speed drop — that would feel punishing and arbitrary. The player loses combo by playing cautiously (no near-misses), not by slowing down.

The combo multiplies the near-miss bonus but not the distance score. This keeps the combo relevant without making it dominant.

---

## Near-miss popup

When a near-miss fires:
- `+NNN` appears in gold at top-center of canvas (Y≈85)
- Drifts upward 22px over 1.2 seconds
- Alpha stays full for 0.75s, then fades to 0 over 0.45s
- If combo > 1: shows `NEAR MISS  ×N COMBO` as sub-label

The popup uses `nearMissTimer` (countdown 1.2→0) and `nearMissPoints` in GameState. Only one popup at a time — newer near-misses replace the current one.

---

## HUD layout

```
[TOP-LEFT]                    [TOP-RIGHT]
12,450          ← score       SPEED ████████░ 610/680
0.3 km                        ┌───────────┐
SURVIVE ████░ 23s             │    ×3     │  ← multiplier badge
                              └───────────┘
                               3 COMBO      ← only when combo > 0
```

Multiplier badge colours reinforce the risk-reward signal visually — the badge turns red at ×4, exactly when the speed bar is also red.

---

## Win/game-over overlays

Both now show the final score prominently (`bold 24px` below the headline). The player always leaves knowing their number.

---

## Physics values

| Config key | Default | Effect |
|---|---|---|
| `pointsPerPx` | 0.1 | Score per pixel of distance (before multiplier) |
| `nearMissBonus` | 50 | Base near-miss bonus |
| `nearMissGroundFactor` | 2.5 | Jump threshold for ground near-miss |
| `nearMissSideMargin` | 36 px | Gap depth that counts as near-miss |
| `comboTimeout` | 5.0 s | Seconds before combo resets |
| `tier2 / tier3 / tier4` | 0.35 / 0.65 / 0.90 | Speed ratio thresholds |

All editable in the admin panel SCORING section.

---

## What was NOT built

- High-score persistence (no localStorage yet)
- Score multiplier on distance (only on near-miss bonus)
- Bonus for surviving with high speed average
- Score display on the controls hint / tutorial

---

## Files changed in this quest

```
src/game/core/types.ts              — scored on Obstacle; score/multiplier/combo fields on GameState
src/game/config/gameConfig.ts       — added scoring section
src/game/core/gameState.ts          — initialize scoring fields
src/game/systems/obstacleManager.ts — scored: false on spawn
src/game/systems/scoringSystem.ts   — new: updateScore(), checkNearMisses()
src/game/core/gameLoop.ts           — call updateScore + checkNearMisses each tick
src/game/rendering/renderer.ts      — new HUD layout, near-miss popup, score on overlays
src/components/game/AdminPanel.tsx  — SCORING section
game/dev-docs/QUEST_04_SCORING.md   ← this file
game/dev-docs/CURRENT_STATE.md      — updated
game/dev-docs/QUEST_LOG.md          — updated
```
