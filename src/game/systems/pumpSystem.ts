import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { sampleTerrainAt } from "./terrainSystem";

const PU = GAME_CONFIG.pump;
const P  = GAME_CONFIG.player;

export function updatePump(state: GameState, pumpPressed: boolean, dt: number): void {
  state.pumpJustFired = false;

  // Open landing window when player touches down
  if (state.player.justLanded) {
    state.pumpLandingWindow = PU.landingWindow;
  }

  // Tick timers
  if (state.pumpCooldown      > 0) state.pumpCooldown      = Math.max(0, state.pumpCooldown - dt);
  if (state.pumpResultTimer   > 0) state.pumpResultTimer   = Math.max(0, state.pumpResultTimer - dt);
  if (state.pumpCrouchTimer   > 0) state.pumpCrouchTimer   = Math.max(0, state.pumpCrouchTimer - dt);
  if (state.pumpLandingWindow > 0) state.pumpLandingWindow = Math.max(0, state.pumpLandingWindow - dt);

  // Expire boost — reset speed mult when done
  if (state.pumpBoostTimer > 0) {
    state.pumpBoostTimer = Math.max(0, state.pumpBoostTimer - dt);
    if (state.pumpBoostTimer === 0) {
      state.player.pumpSpeedMult = 1;
    }
  }

  if (pumpPressed && state.pumpCooldown === 0 && state.player.isGrounded) {
    executePump(state);
  }
}

function getDownhillDropPx(state: GameState): number {
  const playerWorldX = state.worldOffset + state.player.x;
  const here  = sampleTerrainAt(state.terrainSegments, playerWorldX);
  const ahead = sampleTerrainAt(state.terrainSegments, playerWorldX + PU.downhillLookahead);
  if (!here.hasSurface || !ahead.hasSurface) return 0;
  return ahead.y - here.y; // positive = downhill in canvas coords (y increases downward)
}

function executePump(state: GameState): void {
  const dropPx       = getDownhillDropPx(state);
  const inWindow     = state.pumpLandingWindow > 0;
  const onDownhill   = dropPx >= PU.downhillSlopeThreshold;
  const strongSlope  = dropPx >= PU.strongDownhillThreshold;

  const isPerfect = inWindow || strongSlope;
  const isGood    = onDownhill;

  state.pumpCooldown    = PU.cooldown;
  state.pumpCrouchTimer = PU.crouchDuration;

  if (isPerfect) {
    state.player.pumpSpeedMult = PU.perfectBoostMult;
    state.player.speed = Math.min(
      state.player.speed + PU.perfectSpeedKick,
      P.maxSpeed * state.player.overclockSpeedMult * PU.perfectBoostMult
    );
    state.pumpBoostTimer   = PU.boostDuration;
    state.pumpResult       = "perfect";
    state.pumpResultTimer  = PU.resultDisplayDuration;
    state.pumpLandingWindow = 0;
    state.pumpJustFired    = true;
  } else if (isGood) {
    state.player.pumpSpeedMult = PU.goodBoostMult;
    state.player.speed = Math.min(
      state.player.speed + PU.goodSpeedKick,
      P.maxSpeed * state.player.overclockSpeedMult * PU.goodBoostMult
    );
    state.pumpBoostTimer  = PU.boostDuration;
    state.pumpResult      = "good";
    state.pumpResultTimer = PU.resultDisplayDuration;
    state.pumpJustFired   = true;
  } else {
    // Bad timing — crouch animation only, no boost
    state.pumpResult = "none";
  }
}
