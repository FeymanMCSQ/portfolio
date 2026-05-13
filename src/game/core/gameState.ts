import { GAME_CONFIG } from "../config/gameConfig";
import { createPlayerState } from "../systems/playerController";
import { loadProgress } from "../systems/progressStorage";
import type { GameState } from "./types";

export function createInitialGameState(): GameState {
  return {
    phase: "idle",
    player: createPlayerState(),
    timeElapsed: 0,
    worldOffset: 0,
    terrainSegments: [],
    nextTerrainSegmentId: 0,
    terrainPatternIndex: 0,
    nextObstacleId: 0,
    score: 0,
    multiplier: 1,
    combo: 0,
    comboTimer: 0,
    nearMissTimer: 0,
    nearMissPoints: 0,
    progress: loadProgress(),
    overclockActive: false,
    overclockTimer: 0,
    overclockFlash: 0,
    tokens: [],
    nextTokenAt: GAME_CONFIG.overclock.graceDistance,
    nextTokenId: 0,
    focusMeter: 0,
    focusActive: false,
    focusHeld: false,
    patchArmed: false,
    patchTokens: [],
    nextPatchTokenAt: GAME_CONFIG.patchPulse.graceDistance,
    nextPatchTokenId: 0,
    shockwaves: [],
    nextShockwaveId: 0,
  };
}
