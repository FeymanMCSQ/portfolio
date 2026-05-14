import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { activateOverclock } from "./tokenManager";

const PU = GAME_CONFIG.pump;

export function updatePump(state: GameState, pumpPressed: boolean, dt: number): void {
  // Open landing window on touchdown
  if (state.player.justLanded) {
    state.pumpLandingWindow = PU.landingWindow;
  }

  if (state.pumpCooldown     > 0) state.pumpCooldown     = Math.max(0, state.pumpCooldown - dt);
  if (state.pumpCrouchTimer  > 0) state.pumpCrouchTimer  = Math.max(0, state.pumpCrouchTimer - dt);
  if (state.pumpLandingWindow > 0) state.pumpLandingWindow = Math.max(0, state.pumpLandingWindow - dt);

  if (pumpPressed && state.pumpCooldown === 0 && state.player.isGrounded) {
    activateOverclock(state, PU.duration); // same effect as cyan token, just shorter
    state.pumpCooldown    = PU.cooldown;
    state.pumpCrouchTimer = PU.crouchDuration;
  }
}
