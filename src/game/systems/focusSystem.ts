import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import type { InputState } from "./inputManager";

const FC = GAME_CONFIG.focus;
const P = GAME_CONFIG.player;

export function updateFocus(state: GameState, input: InputState, dt: number): void {
  const focusPressed = input.focus && !state.focusHeld;
  state.focusHeld = input.focus;

  if (state.focusActive) {
    state.focusMeter = Math.max(0, state.focusMeter - FC.drainRate * dt);
    if (state.focusMeter <= 0 || !input.focus) {
      state.focusActive = false;
    }
  } else {
    if (focusPressed && state.focusMeter >= FC.activationThreshold) {
      state.focusActive = true;
    } else {
      const speedRatio = state.player.speed / P.maxSpeed;
      state.focusMeter = Math.min(1, state.focusMeter + FC.fillRate * speedRatio * dt);
    }
  }
}
