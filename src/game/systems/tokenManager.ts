import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { sampleTerrainAt } from "./terrainSystem";

const CV = GAME_CONFIG.canvas;
const P = GAME_CONFIG.player;
const OC = GAME_CONFIG.overclock;
const TOKEN_SURFACE_OFFSET = 54;

export function updateTokens(state: GameState, dt: number): void {
  state.tokens = state.tokens.filter(
    (t) => t.worldX - state.worldOffset + OC.tokenRadius > -20
  );

  // Check collection before spawning, so collection happens on the same frame
  for (let i = state.tokens.length - 1; i >= 0; i--) {
    const token = state.tokens[i];
    const screenX = token.worldX - state.worldOffset;
    const dx = Math.abs(screenX - state.player.x);
    const dy = Math.abs(token.y - state.player.y);
    const hitW = P.width / 2 + OC.tokenRadius;
    const hitH = P.height / 2 + OC.tokenRadius;

    if (dx < hitW && dy < hitH) {
      state.tokens.splice(i, 1);
      activateOverclock(state);
    }
  }

  if (
    state.tokens.length === 0 &&
    !state.overclockActive &&
    state.worldOffset >= state.nextTokenAt
  ) {
    const spawn = findTokenSpawn(state);
    if (spawn) {
      state.tokens.push({
        id: state.nextTokenId++,
        worldX: spawn.worldX,
        y: spawn.y,
      });
      state.nextTokenAt =
        state.nextTokenAt + OC.tokenSpacing;
    } else {
      state.nextTokenAt += 450;
    }
  }
}

export function updateOverclock(state: GameState, dt: number): void {
  if (state.overclockFlash > 0) {
    state.overclockFlash = Math.max(0, state.overclockFlash - dt);
  }

  if (!state.overclockActive) return;

  state.overclockTimer -= dt;
  if (state.overclockTimer <= 0) {
    state.overclockActive = false;
    state.overclockTimer = 0;
    state.player.overclockSpeedMult = 1;
    // Speed above normal maxSpeed will decay naturally via friction
  }
}

function activateOverclock(state: GameState): void {
  state.overclockActive = true;
  state.overclockTimer = OC.duration;
  state.overclockFlash = OC.flashDuration;
  state.player.overclockSpeedMult = OC.speedMultiplier;
  // Immediate kick — feel the activation instantly
  state.player.speed = Math.min(
    state.player.speed * 1.35,
    P.maxSpeed * OC.speedMultiplier
  );
}

function findTokenSpawn(state: GameState): { worldX: number; y: number } | null {
  for (let offset = CV.width + 80; offset < CV.width + 720; offset += 80) {
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
