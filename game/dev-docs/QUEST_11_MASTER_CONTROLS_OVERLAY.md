# Quest 11 - Master Controls Overlay

## Goal

Make the tuning controls readable and add a way to test values locally or save them back into the source config during local development.

## What changed

- Replaced the narrow right-side admin rail with a large centered modal overlay.
- Split controls into clear sections:
  - Forward
  - Terrain
  - Jump
  - Overclock
  - Patch Pulse
  - Focus
  - Scoring
- Added three primary buttons:
  - `LOCAL SETTINGS` - slider changes apply only to the current running session.
  - `GLOBAL SETTINGS` - slider changes apply immediately and are saved into `src/game/config/gameConfig.ts`.
  - `RESET DEFAULT` - resets sliders to the loaded source defaults; in global mode it saves those defaults back to the source file.
- Added `POST /api/game-config`, a localhost/dev-only route that updates numeric properties in `gameConfig.ts`.

## Guardrails

- Global writes are disabled in production.
- Global writes are only accepted from `localhost` or `127.0.0.1`.
- The API only writes the explicitly allowed tuning keys exposed in the overlay.

## Files changed

- `src/components/game/AdminPanel.tsx`
- `src/app/api/game-config/route.ts`
