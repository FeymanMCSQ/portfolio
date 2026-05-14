import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { toObstacleLocal } from "./collisionSystem";
import { getTerrainObstacleFrames } from "./terrainSystem";

const P = GAME_CONFIG.player;
const SC = GAME_CONFIG.scoring;
const OC = GAME_CONFIG.overclock;
const SS = GAME_CONFIG.scoreSurge;

export function getScoreGainFactor(state: GameState): number {
  const ocFactor = state.overclockActive ? OC.scoreMultiplier : 1;
  const surgeFactor = state.scoreSurgeActive ? SS.scoreSurgeMultiplier : 1;
  return ocFactor * surgeFactor;
}

export function updateScore(state: GameState, dt: number): void {
  const speedRatio = state.player.speed / P.maxSpeed;

  state.multiplier =
    speedRatio >= SC.tier4 ? 4 :
    speedRatio >= SC.tier3 ? 3 :
    speedRatio >= SC.tier2 ? 2 : 1;

  state.score += state.player.speed * state.multiplier * getScoreGainFactor(state) * SC.pointsPerPx * dt;

  if (state.nearMissTimer > 0) {
    state.nearMissTimer = Math.max(0, state.nearMissTimer - dt);
  }

  if (state.combo > 0) {
    state.comboTimer += dt;
    if (state.comboTimer > SC.comboTimeout) {
      state.combo = 0;
      state.comboTimer = 0;
    }
  }
}

export function checkNearMisses(state: GameState): void {
  const playerWorldX = state.worldOffset + state.player.x;
  const passThreshold = playerWorldX - P.width * 0.5;
  const halfH = P.height / 2;

  for (const frame of getTerrainObstacleFrames(state.terrainSegments)) {
    const obstacle = frame.obstacle;
    if (obstacle.scored) continue;
    if (obstacle.worldX + obstacle.width / 2 >= passThreshold) continue;

    obstacle.scored = true;

    const localPlayer = toObstacleLocal(
      playerWorldX,
      state.player.y,
      frame.worldX,
      frame.y,
      frame.angle
    );
    const playerBottom = localPlayer.y + halfH;
    const obstacleTop = -obstacle.height;
    const clearance = obstacleTop - playerBottom;

    if (clearance >= 0 && clearance <= SC.nearMissObstacleClearance) {
      awardNearMiss(state);
    }
  }
}

function awardNearMiss(state: GameState): void {
  const bonus = Math.round(
    SC.nearMissBonus * state.multiplier * getScoreGainFactor(state) * (state.combo + 1)
  );

  state.score += bonus;
  state.nearMissPoints = bonus;
  state.nearMissTimer = 1.2;
  state.combo += 1;
  state.comboTimer = 0;
}
