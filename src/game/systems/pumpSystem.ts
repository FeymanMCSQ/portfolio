import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { queueAudioEvent } from "../audio/audioEvents";
import { getTerrainSegmentById, isRedDropRamp } from "./terrainSystem";
import { activateOverclock } from "./tokenManager";

const PU = GAME_CONFIG.pump;
const R = GAME_CONFIG.routes;

export function updatePump(state: GameState, pumpPressed: boolean, dt: number): void {
  // Open landing window on touchdown
  if (state.player.justLanded) {
    state.pumpLandingWindow = PU.landingWindow;
  }

  if (state.pumpCooldown     > 0) state.pumpCooldown     = Math.max(0, state.pumpCooldown - dt);
  if (state.pumpCrouchTimer  > 0) state.pumpCrouchTimer  = Math.max(0, state.pumpCrouchTimer - dt);
  if (state.pumpLandingWindow > 0) state.pumpLandingWindow = Math.max(0, state.pumpLandingWindow - dt);

  if (!pumpPressed || state.pumpCooldown !== 0 || !state.player.isGrounded) return;

  const currentSegment = getTerrainSegmentById(
    state.terrainSegments,
    state.player.currentSegmentId
  );

  if (isRedDropRamp(currentSegment)) {
    state.player.isGrounded = false;
    state.player.verticalVelocity = Math.max(
      state.player.verticalVelocity,
      R.dropVelocity
    );
    state.player.dropThroughSegmentId = currentSegment.id;
    state.player.dropThroughRoute = currentSegment.route;
    state.player.dropThroughTimer = R.dropThroughDuration;
    state.player.fallAudioPlayed = true;
    state.pumpCooldown = PU.cooldown;
    state.pumpCrouchTimer = PU.crouchDuration;
    queueAudioEvent(state, "fall");
    return;
  }

  if (state.player.isGrounded) {
    const perfectPump = state.pumpLandingWindow > PU.landingWindow * 0.5;
    activateOverclock(state, PU.duration, { playSound: false }); // same effect as cyan token, just shorter
    state.pumpCooldown    = PU.cooldown;
    state.pumpCrouchTimer = PU.crouchDuration;
    queueAudioEvent(state, perfectPump ? "perfect_pump" : "pump");
  }
}
