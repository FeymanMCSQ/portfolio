import { updatePlayer } from "../systems/playerController";
import { updateTerrain } from "../systems/terrainSystem";
import { checkCollisions } from "../systems/collisionSystem";
import { updateScore, checkNearMisses } from "../systems/scoringSystem";
import { updateTokens, updateOverclock } from "../systems/tokenManager";
import { updateFocus } from "../systems/focusSystem";
import { updatePatchPulse } from "../systems/patchPulseSystem";
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
  updateTerrain(state);

  function tick(timestamp: number): void {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, MAX_DELTA);
    lastTimestamp = timestamp;

    const input = getInput();
    const restartPressed = input.restart && !restartHeld;
    restartHeld = input.restart;

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
      updatePatchPulse(state, physDt);
      updateScore(state, physDt);
      checkNearMisses(state);

      if (checkCollisions(state)) {
        state.phase = "gameOver";
      } else if (state.timeElapsed >= GAME_CONFIG.obstacles.surviveDuration) {
        state.phase = "won";
      }
    } else if ((state.phase === "gameOver" || state.phase === "won") && restartPressed) {
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
