import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { getTerrainObstacleFrames } from "./terrainSystem";

const CV = GAME_CONFIG.canvas;
const P = GAME_CONFIG.player;

const PLAYER_INSET = 0.16;
const OBSTACLE_INSET = 0.12;
const FALL_MARGIN = 90;

export function checkCollisions(state: GameState): boolean {
  if (state.player.y - P.height / 2 > CV.height + FALL_MARGIN) {
    return true;
  }

  return checkTerrainObstacleCollisions(state);
}

function checkTerrainObstacleCollisions(state: GameState): boolean {
  const playerWorldX = state.worldOffset + state.player.x;
  const halfW = (P.width / 2) * (1 - PLAYER_INSET * 2);
  const halfH = (P.height / 2) * (1 - PLAYER_INSET * 2);

  for (const frame of getTerrainObstacleFrames(state.terrainSegments)) {
    const localPlayer = toObstacleLocal(
      playerWorldX,
      state.player.y,
      frame.worldX,
      frame.y,
      frame.angle
    );

    const left = -frame.obstacle.width / 2 + frame.obstacle.width * OBSTACLE_INSET;
    const right = frame.obstacle.width / 2 - frame.obstacle.width * OBSTACLE_INSET;
    const top = -frame.obstacle.height + frame.obstacle.height * OBSTACLE_INSET;
    const bottom = -frame.obstacle.height * OBSTACLE_INSET;

    const overlaps =
      localPlayer.x + halfW > left &&
      localPlayer.x - halfW < right &&
      localPlayer.y + halfH > top &&
      localPlayer.y - halfH < bottom;

    if (overlaps) return true;
  }

  return false;
}

export function toObstacleLocal(
  worldX: number,
  y: number,
  obstacleWorldX: number,
  obstacleY: number,
  angle: number
): { x: number; y: number } {
  const dx = worldX - obstacleWorldX;
  const dy = y - obstacleY;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: dx * cos + dy * sin,
    y: -dx * sin + dy * cos,
  };
}
