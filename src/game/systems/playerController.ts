import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState, PlayerState, TerrainSegment } from "../core/types";
import type { InputState } from "./inputManager";
import { crossedRampEnd, sampleTerrainAt, shouldIgnoreSurface } from "./terrainSystem";

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
    dropThroughSegmentId: null,
    dropThroughRoute: null,
    dropThroughTimer: 0,
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
  updateDropThroughTimer(player, dt);

  // Rising-edge detection: only fire on the frame the key transitions to pressed
  const jumpPressed = input.jump && !player.jumpHeld;
  player.jumpHeld = input.jump;
  const ignoreSegmentId = player.dropThroughTimer > 0
    ? player.dropThroughSegmentId
    : null;
  const ignorePlatformRoute = player.dropThroughTimer > 0
    ? player.dropThroughRoute
    : null;
  const surface = sampleTerrainAt(state.terrainSegments, nextWorldX, {
    currentSegmentId: player.currentSegmentId,
    preferredY: player.y + P.height / 2,
    ignoreSegmentId,
    ignorePlatformRoute,
  });

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

    const ramp = crossedRampEnd(
      state.terrainSegments,
      previousWorldX,
      nextWorldX,
      player.currentSegmentId
    );
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

    const footY = player.y + P.height / 2;
    const landing = findLandingSurface(
      state.terrainSegments,
      previousWorldX,
      nextWorldX,
      previousFootY,
      footY,
      player.verticalVelocity,
      {
        ignoreSegmentId,
        ignorePlatformRoute,
      }
    );

    if (landing) {
      player.y = landing.y - P.height / 2;
      player.surfaceY = landing.y;
      player.groundAngle = landing.angle;
      player.currentSegmentId = landing.segment.id;
      player.verticalVelocity = 0;
      player.isGrounded = true;
      player.landingTimer = 0;
      player.justLanded = true;
    }
  }
}

function updateDropThroughTimer(player: PlayerState, dt: number): void {
  if (player.dropThroughTimer <= 0) return;

  player.dropThroughTimer = Math.max(0, player.dropThroughTimer - dt);
  if (player.dropThroughTimer === 0) {
    player.dropThroughSegmentId = null;
    player.dropThroughRoute = null;
  }
}

interface LandingSurface {
  y: number;
  angle: number;
  segment: TerrainSegment;
}

function findLandingSurface(
  segments: TerrainSegment[],
  previousWorldX: number,
  nextWorldX: number,
  previousFootY: number,
  footY: number,
  verticalVelocity: number,
  options: {
    ignoreSegmentId?: number | null;
    ignorePlatformRoute?: TerrainSegment["route"] | null;
  } = {}
): LandingSurface | null {
  if (verticalVelocity < 0) return null;

  const dx = nextWorldX - previousWorldX;
  if (Math.abs(dx) < 0.001) {
    const surface = sampleTerrainAt(segments, nextWorldX, options);
    if (
      surface.hasSurface &&
      surface.segment &&
      previousFootY <= surface.y &&
      footY >= surface.y
    ) {
      return {
        y: surface.y,
        angle: surface.angle,
        segment: surface.segment,
      };
    }
    return null;
  }

  const minX = Math.min(previousWorldX, nextWorldX);
  const maxX = Math.max(previousWorldX, nextWorldX);

  let bestLanding: (LandingSurface & { motionT: number }) | null = null;

  for (const segment of segments) {
    if (segment.type === "gap") continue;
    if (shouldIgnoreSurface(segment, options)) continue;
    if (segment.endX < minX || segment.startX > maxX) continue;

    const overlapStartX = Math.max(minX, segment.startX);
    const overlapEndX = Math.min(maxX, segment.endX);
    if (overlapEndX < overlapStartX) continue;

    const startDiff = footAtX(
      overlapStartX,
      previousWorldX,
      nextWorldX,
      previousFootY,
      footY
    ) - surfaceYAtX(segment, overlapStartX);
    const endDiff = footAtX(
      overlapEndX,
      previousWorldX,
      nextWorldX,
      previousFootY,
      footY
    ) - surfaceYAtX(segment, overlapEndX);

    if (startDiff <= 0 && endDiff >= 0) {
      const denom = endDiff - startDiff;
      const t = Math.abs(denom) < 0.001 ? 1 : -startDiff / denom;
      const landingX = overlapStartX + (overlapEndX - overlapStartX) * t;
      const motionT = (landingX - previousWorldX) / (nextWorldX - previousWorldX);
      const landing = {
        y: surfaceYAtX(segment, landingX),
        angle: Math.atan2(segment.endY - segment.startY, segment.endX - segment.startX),
        segment,
        motionT,
      };
      if (!bestLanding || landing.motionT < bestLanding.motionT) {
        bestLanding = landing;
      }
    }
  }

  return bestLanding;
}

function footAtX(
  x: number,
  previousWorldX: number,
  nextWorldX: number,
  previousFootY: number,
  footY: number
): number {
  const t = (x - previousWorldX) / (nextWorldX - previousWorldX);
  return previousFootY + (footY - previousFootY) * t;
}

function surfaceYAtX(segment: TerrainSegment, x: number): number {
  const t = (x - segment.startX) / (segment.endX - segment.startX);
  return segment.startY + (segment.endY - segment.startY) * t;
}
