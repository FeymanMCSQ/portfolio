# Quest Log

| # | Name | Status | Summary |
|---|------|--------|---------|
| 01 | Movement Feel | ✅ done | Player object, momentum forward + lateral, parallax grid, speed-reactive visuals, admin panel |
| 02 | Jump Feel | ✅ done | Speed-dependent arc, squash & stretch, shadow, landing ring, air control |
| 03 | Obstacles | ✅ done | Ground (jump) + side (steer) obstacles, 60s survival win, R to restart, overlays |
| 04 | Scoring & Combo | ✅ done | Distance score, ×1–×4 speed multiplier, near-miss bonus, combo counter, score on overlays |
| 05 | Overclock | ✅ done | Cyan token spawns on track; collect → ×2 speed cap, ×2 score, 5s timer, edge vignette, screen flash |
| 06 | Focus Mode | ✅ done | Amber meter fills while skating; SHIFT at 100% → 40% time scale for ~3.7s; edge vignette + HUD meter |
| 07 | Patch Pulse | ✅ done | Green token arms player; next landing fires radius shockwave that clears nearby ground obstacles |
| 08A | Side-view Terrain Foundation | ✅ done | Added connected terrain segments, terrain sampling, grounded player following, ramp launch, gap detach, simple terrain render |
| 08B | Terrain Collision & Scoring | ✅ done | Terrain block collision, fall failure, terrain-aware token spawns, Patch Pulse terrain clears, block near-miss scoring |
| 08C | Side-view Cleanup | ✅ done | Tokens/shockwaves use world coordinates, old track bounds removed, gap edges rendered, docs finalized |
| 09 | Deterministic Endless Progress | ✅ done | Removed timed win, made token spawns deterministic, persisted last/best run progress, added HUD stats and world markers |
| 10 | Obstacle Visibility + Touch Controls | ✅ done | Draw terrain blocks after terrain fills to prevent slope occlusion; added hold-to-accelerate and tap-to-jump touch input |
| 11 | Master Controls Overlay | ✅ done | Replaced narrow admin rail with large sectioned modal; added local/global tuning modes and dev-only source config saving |
| 3C-1 | Risk/Reward Route Foundation | ✅ done | Added route pattern library, upper/lower overlapping route surfaces, red drop ramps, and S/down drop-through behavior |
| 3C-2 | Route Rewards | ✅ done | Added red Score Surge, route reward scoring, Energy Ring bonuses, and HUD feedback |
| 3C-3 | Risk/Reward Balance | ✅ done | Removed yellow orbs; made upper/lower routes multi-step, riskier, and score through survival on risky lines |
| 12 | Sound Effects | ✅ done | Added central AudioManager, event-driven SFX, acceleration loop, mute toggle, and public `/sfx` assets |

## Next quest candidates (not decided)

- More authored terrain/obstacle patterns
- Portfolio shell (landing page, nav, about section around the game)
