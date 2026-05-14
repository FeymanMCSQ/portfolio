# Quest 12 - Sound Effects

## Goal

Hook up Runtime Rush sound effects and a subtle gameplay music bed without changing gameplay behavior or scattering direct audio calls through the game.

## What changed

- Copied root `sfx/*.mp3` files into `public/sfx/` so the browser can load them at `/sfx/*.mp3`.
- Added `audioManager.ts`:
  - registers all listed MP3 files
  - registers the gameplay music loop
  - preloads sounds
  - plays one-shots
  - manages loops
  - fades gameplay music in/out
  - ducks gameplay music under major SFX
  - fades loops
  - supports playback rate
  - supports mute/unmute with localStorage persistence
  - ignores missing/unavailable sounds gracefully
- Added `audioSystem.ts`:
  - drains queued audio events from `GameState`
  - manages acceleration loop and deceleration cooldown
  - rate-limits collectible and obstacle dissolve sounds
- Added `queueAudioEvent` helper so systems emit sound events without calling audio directly.
- Added `M` mute toggle and HUD `[M] SOUND ON/OFF` status.
- Added `GAME_CONFIG.audio` for volumes and cooldowns.
- Added separate `masterVolume`, `sfxVolume`, and `musicVolume` controls in config.

## Sound mapping

- Jump: successful jump start.
- Landing / hard landing: chosen by landing velocity.
- Pump / perfect pump: successful pump; perfect if timed shortly after landing.
- Acceleration: managed loop while accelerating and below max speed.
- Deceleration: release after accelerating above threshold.
- Overclock start/end: cyan Overclock activation and natural end.
- Score Surge: red Score Surge activation.
- Blast collect/use: Patch Pulse pickup and use.
- Obstacle dissolve: once per blast if obstacles are cleared.
- Collectible: entering a scored risky route segment after yellow orbs were removed.
- Ring pass: Energy Ring success.
- Fall: first fall state after gap/drop/missed landing.
- Crash: obstacle collision.
- Game over: run end, delayed slightly after crash.
- Scenery shift: once when crossing each new 20,000 score scenery tier; coalesced/cooldown-limited and suppressed if the same frame has crash/game over audio.
- High score: run end when the score beats previous best.

## Music mapping

- Gameplay loop: `public/sfx/main_gameplay_loop.mp3`
- Starts only after browser audio has been unlocked by keyboard, pointer, or touch input.
- Fades in during `playing`.
- Fades out and resets on game over.
- Pauses/fades down when the page is hidden.
- Mute affects both music and SFX.
- Music ducks under Patch Pulse use, crash, game over, and high-score audio.

## Files changed

- `src/game/audio/audioManager.ts`
- `src/game/audio/audioSystem.ts`
- `src/game/audio/audioEvents.ts`
- `src/game/config/gameConfig.ts`
- `src/game/core/types.ts`
- `src/game/core/gameState.ts`
- `src/game/core/gameLoop.ts`
- `src/game/systems/inputManager.ts`
- `src/game/systems/playerController.ts`
- `src/game/systems/pumpSystem.ts`
- `src/game/systems/tokenManager.ts`
- `src/game/systems/patchPulseSystem.ts`
- `src/game/systems/rewardSystem.ts`
- `src/game/systems/collisionSystem.ts`
- `src/game/rendering/renderer.ts`
- `src/components/game/GameCanvas.tsx`
- `public/sfx/*.mp3`
