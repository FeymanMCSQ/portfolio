export type GamePhase = "idle" | "playing" | "gameOver";

export interface PlayerState {
  x: number;
  y: number;
  speed: number;
  lateralVelocity: number;
  verticalVelocity: number;
  distanceTraveled: number;
  jumpHeight: number;
  jumpVelocity: number;
  isGrounded: boolean;
  surfaceY: number;
  groundAngle: number;
  currentSegmentId: number | null;
  landingTimer: number;
  jumpHeld: boolean;
  overclockSpeedMult: number; // 1.0 normally, 2.0 during overclock
  justLanded: boolean;        // true for exactly one frame on touchdown
}

export type TerrainSegmentType =
  | "flat"
  | "uphill"
  | "downhill"
  | "small-ramp"
  | "gap"
  | "flat-platform"
  | "flat-obstacle"
  | "slope-obstacle";

export interface TerrainObstacle {
  id: number;
  worldX: number;
  width: number;
  height: number;
  scored: boolean;
}

export interface TerrainSegment {
  id: number;
  type: TerrainSegmentType;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  obstacle?: TerrainObstacle;
}

export interface OverclockToken {
  id: number;
  worldX: number;
  y: number;
}

export interface PatchPulseToken {
  id: number;
  worldX: number;
  y: number;
}

export interface Shockwave {
  id: number;
  worldX: number;
  y: number;
  maxRadius: number;
  timer: number;
  duration: number;
}

export interface ProgressState {
  lastDistance: number;
  bestDistance: number;
  bestScore: number;
  bestScoreDistance: number;
}

export interface GameState {
  phase: GamePhase;
  player: PlayerState;
  timeElapsed: number;
  worldOffset: number;
  terrainSegments: TerrainSegment[];
  nextTerrainSegmentId: number;
  terrainPatternIndex: number;
  nextObstacleId: number;

  // Scoring
  score: number;
  multiplier: 1 | 2 | 3 | 4;
  combo: number;
  comboTimer: number;
  nearMissTimer: number;
  nearMissPoints: number;
  progress: ProgressState;

  // Overclock
  overclockActive: boolean;
  overclockTimer: number;    // countdown 5 → 0
  overclockFlash: number;    // brief screen flash on collection (0.15 → 0)
  tokens: OverclockToken[];
  nextTokenAt: number;
  nextTokenId: number;

  // Focus
  focusMeter: number;        // 0.0 – 1.0
  focusActive: boolean;
  focusHeld: boolean;        // focus key held last frame — for rising-edge detection

  // Pump
  pumpCooldown: number;
  pumpLandingWindow: number;
  pumpCrouchTimer: number;

  // Patch Pulse
  patchCount: number;       // inventory: 0–3 collected charges
  patchTokens: PatchPulseToken[];
  nextPatchTokenAt: number;
  nextPatchTokenId: number;
  shockwaves: Shockwave[];
  nextShockwaveId: number;
}
