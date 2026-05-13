import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState, PlayerState } from "../core/types";
import type { InputState } from "./inputManager";
import { crossedRampEnd, sampleTerrainAt } from "./terrainSystem";

const P = GAME_CONFIG.player;
const J = GAME_CONFIG.jump;
const T = GAME_CONFIG.terrain;

export function createPlayerState(): PlayerState {
  return {
    x: P.startX,
    y: P.startY,
    speed: P.startSpeed,
    lateralVelocity: 0,
    verticalVelocity: 0,
    distanceTraveled: 0,
    jumpHeight: 0,
    jumpVelocity: 0,
    isGrounded: true,
    surfaceY: T.groundY,
    groundAngle: 0,
    currentSegmentId: null,
    landingTimer: J.landingSquashDuration,
    jumpHeld: false,
    overclockSpeedMult: 1,
    justLanded: false,
  };
}

export function updatePlayer(
  state: GameState,
  input: InputState,
  dt: number
): void {
  const { player } = state;
  updateForwardSpeed(player, input, dt);

  const previousWorldX = state.worldOffset + player.x;
  const nextWorldX = previousWorldX + player.speed * dt;

  updateVerticalMovement(state, input, previousWorldX, nextWorldX, dt);
  player.distanceTraveled += player.speed * dt;
  player.lateralVelocity = 0;
  player.jumpVelocity = -player.verticalVelocity;
  player.jumpHeight = Math.max(0, player.surfaceY - (player.y + P.height / 2));
}

// ─── Forward ─────────────────────────────────────────────────────────────────

function updateForwardSpeed(
  player: PlayerState,
  input: InputState,
  dt: number
): void {
  if (input.accelerating) {
    player.speed = Math.min(player.speed + P.acceleration * dt, P.maxSpeed * player.overclockSpeedMult);
  } else {
    player.speed *= Math.pow(P.friction, dt * 60);
    if (player.speed < 2) player.speed = 0;
  }
}

// ─── Vertical / Terrain Contact ──────────────────────────────────────────────

function updateVerticalMovement(
  state: GameState,
  input: InputState,
  previousWorldX: number,
  nextWorldX: number,
  dt: number
): void {
  const { player } = state;
  player.justLanded = false;  // clear each frame; set below on the landing frame

  // Rising-edge detection: only fire on the frame the key transitions to pressed
  const jumpPressed = input.jump && !player.jumpHeld;
  player.jumpHeld = input.jump;
  const surface = sampleTerrainAt(state.terrainSegments, nextWorldX);

  if (player.isGrounded) {
    // Advance landing squash timer
    if (player.landingTimer < J.landingSquashDuration) {
      player.landingTimer = Math.min(
        player.landingTimer + dt,
        J.landingSquashDuration
      );
    }

    if (jumpPressed) {
      const speedRatio = player.speed / P.maxSpeed;
      player.verticalVelocity = -(J.baseVelocity + J.speedBonus * speedRatio);
      player.isGrounded = false;
      // landingTimer left at its current value; squash only triggers on landing
      return;
    }

    const ramp = crossedRampEnd(state.terrainSegments, previousWorldX, nextWorldX);
    if (ramp) {
      const speedRatio = player.speed / P.maxSpeed;
      player.y = ramp.endY - P.height / 2;
      player.surfaceY = ramp.endY;
      player.groundAngle = Math.atan2(ramp.endY - ramp.startY, ramp.endX - ramp.startX);
      player.currentSegmentId = ramp.id;
      player.verticalVelocity = -(T.rampLaunchVelocity + T.rampSpeedLaunchBonus * speedRatio);
      player.isGrounded = false;
      return;
    }

    if (!surface.hasSurface) {
      player.isGrounded = false;
      player.verticalVelocity = Math.max(0, player.verticalVelocity);
      return;
    }

    if (surface.segment) {
      player.y = surface.y - P.height / 2;
      player.surfaceY = surface.y;
      player.groundAngle = surface.angle;
      player.currentSegmentId = surface.segment.id;
    }
  } else {
    // Airborne — apply gravity
    const previousFootY = player.y + P.height / 2;
    player.verticalVelocity += J.gravity * dt;
    player.y += player.verticalVelocity * dt;

    if (surface.hasSurface && surface.segment && player.verticalVelocity >= 0) {
      const footY = player.y + P.height / 2;
      if (previousFootY <= surface.y && footY >= surface.y) {
        player.y = surface.y - P.height / 2;
        player.surfaceY = surface.y;
        player.groundAngle = surface.angle;
        player.currentSegmentId = surface.segment.id;
        player.verticalVelocity = 0;
        player.isGrounded = true;
        player.landingTimer = 0;
        player.justLanded = true;
      }
    }
  }
}
