# Quest 3C Phase 2 - Route Rewards

## Goal

Add a simple reward layer to the Phase 1 route choices without changing the core skating physics.

## What changed

- Added deterministic route collectibles that are placed by route patterns.
- Note: those generic yellow collectibles were removed in Phase 3 and replaced with passive risky-route score.
- Added red Score Surge pickups for risky routes.
- Added temporary Score Surge scoring:
  - `scoreSurgeMultiplier`
  - `scoreSurgeDuration`
  - red flash and HUD timer
- Added Energy Ring Jump pattern support:
  - optional oval ring placed above ramp arcs
  - passing through awards a fixed bonus
  - missing the ring does not kill the run
- Added route feedback labels:
  - `RISK LINE`
  - `HIGH LINE BONUS`
  - `CLEAN ROUTE`
  - `RING BONUS`
  - `SCORE SURGE`
- Added Score Surge and Route Rewards sliders to the master controls overlay.
- Added global config write support for numeric Score Surge and reward values.

## Pattern coverage

- Phase 2 originally used collectible lines/arcs.
- Current code after Phase 3 uses passive risk-route score, Score Surge, and Energy Ring bonuses instead.

## Implementation notes

- Rewards are spawned as part of terrain pattern construction, so they remain deterministic for a given world position.
- Score Surge multiplies score earned while active through the same score-gain factor used by Overclock.
- Saved progress is unchanged; the run's resulting score is saved normally, with no separate high-score post-multiplier.
- The reward system owns pickup collision, culling, Score Surge timer, route feedback timer, and bonus score awards.

## Files changed

- `src/game/config/gameConfig.ts`
- `src/game/core/types.ts`
- `src/game/core/gameState.ts`
- `src/game/core/gameLoop.ts`
- `src/game/systems/terrainSystem.ts`
- `src/game/systems/rewardSystem.ts`
- `src/game/systems/scoringSystem.ts`
- `src/game/rendering/renderer.ts`
- `src/components/game/AdminPanel.tsx`
- `src/app/api/game-config/route.ts`
- `game/dev-docs/CURRENT_STATE.md`
- `game/dev-docs/QUEST_LOG.md`
