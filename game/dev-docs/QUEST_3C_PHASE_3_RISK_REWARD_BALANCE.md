# Quest 3C Phase 3 - Risk/Reward Balance

## Goal

Make optional routes meaningfully riskier than the default route while keeping the game readable and fair.

## Design direction

- Safe/default route should be continuous and readable.
- Risk routes should pay more score because the player survives them, not because they vacuum up generic pickups.
- Going higher should increase reward and risk through shorter platforms, gaps, launch ramps, and blocks.
- Going lower should be an explicit red-ramp commitment with downhill speed, a second drop option, tighter obstacles, and a gap.
- Missing a first optional route can still drop the player back to safety; committing deeper should carry more real death risk.

## What changed

- Removed yellow reward orbs from state, systems, rendering, admin tuning, and config.
- Added `riskLevel` and `riskLabel` metadata on terrain segments.
- Added passive risk-route scoring in `rewardSystem.ts`.
- Added `riskScorePerSecond` config and master-control slider.
- Reworked the upper route into a multi-step high-line chain:
  - first upper platform
  - upper launch ramp
  - hazard platform
  - second launch ramp
  - short extreme landing
- Reworked ramp reward sections:
  - ramp now launches across a real gap
  - landing area can include a block
  - Score Surge waits after the risky landing
- Reworked lower red-drop route:
  - first red ramp drops to a low downhill route
  - second red ramp on the lower route drops to a deeper route
  - deep branch has stronger risk score, a block, a gap, and Score Surge
- Added more recovery slots to the deterministic route rhythm.

## Current reward sources

- Distance score.
- Speed multiplier.
- Near misses.
- Cyan Overclock.
- Red Score Surge.
- Passive score while grounded on risky route segments.
- Energy Ring bonus.

## Files changed

- `src/game/config/gameConfig.ts`
- `src/game/core/types.ts`
- `src/game/core/gameState.ts`
- `src/game/systems/terrainSystem.ts`
- `src/game/systems/rewardSystem.ts`
- `src/game/rendering/renderer.ts`
- `src/components/game/AdminPanel.tsx`
- `src/app/api/game-config/route.ts`
- `game/dev-docs/CURRENT_STATE.md`
- `game/dev-docs/QUEST_LOG.md`
- `game/dev-docs/QUEST_3C_PHASE_2_ROUTE_REWARDS.md`
