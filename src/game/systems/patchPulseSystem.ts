import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { queueAudioEvent } from "../audio/audioEvents";
import { getTerrainObstacleFrames, sampleTerrainAt } from "./terrainSystem";

const PP = GAME_CONFIG.patchPulse;
const P = GAME_CONFIG.player;
const CV = GAME_CONFIG.canvas;
const TOKEN_SURFACE_OFFSET = 50;
const MAX_PATCH_COUNT = 3;

export function updatePatchPulse(state: GameState, patchPressed: boolean, dt: number): void {
  cullTokens(state);
  collectToken(state);
  spawnToken(state);
  if (patchPressed) fireShockwave(state);
  tickShockwaves(state, dt);
}

function cullTokens(state: GameState): void {
  state.patchTokens = state.patchTokens.filter(
    (t) => t.worldX - state.worldOffset + PP.tokenRadius > -20
  );
}

function collectToken(state: GameState): void {
  if (state.patchCount >= MAX_PATCH_COUNT) return;
  for (let i = state.patchTokens.length - 1; i >= 0; i--) {
    const token = state.patchTokens[i];
    const screenX = token.worldX - state.worldOffset;
    const dx = Math.abs(screenX - state.player.x);
    const dy = Math.abs(token.y - state.player.y);
    if (dx < P.width / 2 + PP.tokenRadius && dy < P.height / 2 + PP.tokenRadius) {
      state.patchCount += 1;
      state.patchTokens.splice(i, 1);
      queueAudioEvent(state, "blast_collect");
      return;
    }
  }
}

function spawnToken(state: GameState): void {
  if (state.patchTokens.length > 0 || state.patchCount >= MAX_PATCH_COUNT) return;
  if (state.worldOffset < state.nextPatchTokenAt) return;

  const spawn = findTokenSpawn(state);
  if (spawn) {
    state.patchTokens.push({
      id: state.nextPatchTokenId++,
      worldX: spawn.worldX,
      y: spawn.y,
    });
    state.nextPatchTokenAt = state.nextPatchTokenAt + PP.tokenSpacing;
  } else {
    state.nextPatchTokenAt += 450;
  }
}

function fireShockwave(state: GameState): void {
  if (state.patchCount <= 0) return;

  const speedRatio = state.player.speed / P.maxSpeed;
  const radius = PP.shockwaveBaseRadius + speedRatio * PP.shockwaveRadiusBonus;

  const playerWorldX = state.worldOffset + state.player.x;
  let clearedCount = 0;
  for (const frame of getTerrainObstacleFrames(state.terrainSegments)) {
    if (Math.abs(frame.worldX - playerWorldX) <= radius) {
      frame.segment.obstacle = undefined;
      clearedCount += 1;
    }
  }

  state.shockwaves.push({
    id: state.nextShockwaveId++,
    worldX: playerWorldX,
    y: state.player.y,
    maxRadius: radius,
    timer: 0,
    duration: PP.shockwaveDuration,
  });

  state.patchCount -= 1;
  queueAudioEvent(state, "blast_use");
  if (clearedCount > 0) {
    queueAudioEvent(state, "obstacle_dissolve");
  }
}

function tickShockwaves(state: GameState, dt: number): void {
  for (const sw of state.shockwaves) {
    sw.timer += dt;
  }
  state.shockwaves = state.shockwaves.filter((sw) => sw.timer < sw.duration);
}

function findTokenSpawn(state: GameState): { worldX: number; y: number } | null {
  for (let offset = CV.width + 110; offset < CV.width + 720; offset += 80) {
    const worldX = state.worldOffset + offset;
    const sample = sampleTerrainAt(state.terrainSegments, worldX);
    if (!sample.hasSurface) continue;
    return {
      worldX,
      y: sample.y - TOKEN_SURFACE_OFFSET,
    };
  }

  return null;
}
