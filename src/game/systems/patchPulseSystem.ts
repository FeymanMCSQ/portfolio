import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { getTerrainObstacleFrames, sampleTerrainAt } from "./terrainSystem";

const PP = GAME_CONFIG.patchPulse;
const P = GAME_CONFIG.player;
const CV = GAME_CONFIG.canvas;
const TOKEN_SURFACE_OFFSET = 50;

export function updatePatchPulse(state: GameState, dt: number): void {
  scrollTokens(state, dt);
  collectToken(state);
  spawnToken(state);
  fireShockwave(state);
  tickShockwaves(state, dt);
}

function scrollTokens(state: GameState, dt: number): void {
  for (const token of state.patchTokens) {
    token.x -= state.player.speed * dt;
  }
  state.patchTokens = state.patchTokens.filter(
    (t) => t.x + PP.tokenRadius > -20
  );
}

function collectToken(state: GameState): void {
  if (state.patchArmed) return;
  for (let i = state.patchTokens.length - 1; i >= 0; i--) {
    const token = state.patchTokens[i];
    const dx = Math.abs(token.x - state.player.x);
    const dy = Math.abs(token.y - state.player.y);
    if (dx < P.width / 2 + PP.tokenRadius && dy < P.height / 2 + PP.tokenRadius) {
      state.patchArmed = true;
      state.patchTokens.splice(i, 1);
      return;
    }
  }
}

function spawnToken(state: GameState): void {
  if (state.patchTokens.length > 0 || state.patchArmed) return;
  if (state.worldOffset < state.nextPatchTokenAt) return;

  const spawn = findTokenSpawn(state);
  if (spawn) {
    state.patchTokens.push({
      id: state.nextPatchTokenId++,
      x: spawn.screenX,
      y: spawn.y,
    });
    state.nextPatchTokenAt =
      state.worldOffset + PP.tokenSpacingMin + Math.random() * PP.tokenSpacingRandom;
  } else {
    state.nextPatchTokenAt = state.worldOffset + 450;
  }
}

function fireShockwave(state: GameState): void {
  if (!state.patchArmed || !state.player.justLanded) return;

  const speedRatio = state.player.speed / P.maxSpeed;
  const radius = PP.shockwaveBaseRadius + speedRatio * PP.shockwaveRadiusBonus;

  const playerWorldX = state.worldOffset + state.player.x;
  for (const frame of getTerrainObstacleFrames(state.terrainSegments)) {
    if (Math.abs(frame.worldX - playerWorldX) <= radius) {
      frame.segment.obstacle = undefined;
    }
  }

  state.shockwaves.push({
    id: state.nextShockwaveId++,
    x: state.player.x,
    y: state.player.surfaceY,
    maxRadius: radius,
    timer: 0,
    duration: PP.shockwaveDuration,
  });

  state.patchArmed = false;
}

function tickShockwaves(state: GameState, dt: number): void {
  for (const sw of state.shockwaves) {
    sw.timer += dt;
    sw.x -= state.player.speed * dt; // scroll with world
  }
  state.shockwaves = state.shockwaves.filter((sw) => sw.timer < sw.duration);
}

function findTokenSpawn(state: GameState): { screenX: number; y: number } | null {
  for (let offset = CV.width + 110; offset < CV.width + 720; offset += 80) {
    const sample = sampleTerrainAt(state.terrainSegments, state.worldOffset + offset);
    if (!sample.hasSurface) continue;
    return {
      screenX: offset,
      y: sample.y - TOKEN_SURFACE_OFFSET,
    };
  }

  return null;
}
