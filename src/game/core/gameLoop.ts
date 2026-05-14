import { updatePlayer } from "../systems/playerController";
import { updateTerrain } from "../systems/terrainSystem";
import { checkCollisions } from "../systems/collisionSystem";
import { updateScore, checkNearMisses } from "../systems/scoringSystem";
import { updateTokens, updateOverclock } from "../systems/tokenManager";
import { updateFocus } from "../systems/focusSystem";
import { updatePatchPulse } from "../systems/patchPulseSystem";
import { updatePump } from "../systems/pumpSystem";
import { updateRewards } from "../systems/rewardSystem";
import { recordRunProgress } from "../systems/progressStorage";
import { renderFrame } from "../rendering/renderer";
import { createInitialGameState } from "./gameState";
import { GAME_CONFIG } from "../config/gameConfig";
import type { InputState } from "../systems/inputManager";

const MAX_DELTA = 0.05;

export function createGameLoop(
  canvas: HTMLCanvasElement,
  getInput: () => InputState
): { start: () => void; stop: () => void } {
  let rafId: number | null = null;
  let lastTimestamp: number | null = null;
  let state = createInitialGameState();
  let restartHeld = false;
  let patchHeld   = false;
  let pumpHeld    = false;
  updateTerrain(state);

  function tick(timestamp: number): void {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, MAX_DELTA);
    lastTimestamp = timestamp;

    const input = getInput();
    const restartPressed = input.restart && !restartHeld;
    restartHeld = input.restart;
    const patchPressed = input.usePatch && !patchHeld;
    patchHeld = input.usePatch;
    const pumpPressed = input.pump && !pumpHeld;
    pumpHeld = input.pump;

    if (state.phase === "playing") {
      // Focus and overclock timers run in real time, not slowed
      updateFocus(state, input, dt);
      updateOverclock(state, dt);
      state.timeElapsed += dt;

      // All physics run at scaled time when focus is active
      const physDt = state.focusActive ? dt * GAME_CONFIG.focus.timeScale : dt;
      updateTerrain(state);
      updatePlayer(state, input, physDt);
      state.worldOffset += state.player.speed * physDt;
      updateTerrain(state);

      updateTokens(state, physDt);
      updatePatchPulse(state, patchPressed, physDt);
      updatePump(state, pumpPressed, physDt);
      updateRewards(state, dt);
      updateScore(state, physDt);
      checkNearMisses(state);

      if (checkCollisions(state)) {
        state.progress = recordRunProgress(state);
        state.phase = "gameOver";
      }
    } else if (state.phase === "gameOver" && restartPressed) {
      state = createInitialGameState();
      updateTerrain(state);
      state.phase = "playing";
    }

    const ctx = canvas.getContext("2d");
    if (ctx) renderFrame(ctx, state);

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      state.phase = "playing";
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      lastTimestamp = null;
    },
  };
}
