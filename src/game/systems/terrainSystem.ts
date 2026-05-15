import { GAME_CONFIG } from "../config/gameConfig";
import type {
  GameState,
  TerrainObstacle,
  TerrainPatternDifficulty,
  TerrainRoute,
  TerrainSegment,
  TerrainSegmentType,
  TerrainSurfaceKind,
} from "../core/types";

const CV = GAME_CONFIG.canvas;
const T = GAME_CONFIG.terrain;
const R = GAME_CONFIG.routes;
const RW = GAME_CONFIG.rewards;
const P = GAME_CONFIG.player;
const J = GAME_CONFIG.jump;
const G = GAME_CONFIG.generation;

export interface TerrainSample {
  hasSurface: boolean;
  y: number;
  angle: number;
  segment: TerrainSegment | null;
}

export interface TerrainObstacleFrame {
  segment: TerrainSegment;
  obstacle: TerrainObstacle;
  worldX: number;
  y: number;
  angle: number;
}

interface TerrainSampleOptions {
  currentSegmentId?: number | null;
  preferredY?: number;
  ignoreSegmentId?: number | null;
  ignorePlatformRoute?: TerrainRoute | null;
  stickToRoute?: TerrainRoute | null;
}

interface RoutePatternValidation {
  safeGaps?: number[];
  riskGaps?: number[];
  rampGaps?: number[];
  upperLedgeHeight?: number;
  minLandingWidth?: number;
  firstObstacleAfterLanding?: number;
}

interface RoutePattern {
  id: string;
  difficulty: TerrainPatternDifficulty;
  length: number;
  minEntrySpeed: number;
  maxEntrySpeed: number;
  hasSafePath: boolean;
  hasRiskRewardPath: boolean;
  requiresJump: boolean;
  requiresPump: boolean;
  requiresHighSpeed: boolean;
  preferredNextPatterns?: string[];
  validation?: RoutePatternValidation;
  build: (state: GameState, startX: number, startY: number) => TerrainSegment;
}

interface GeneratorContext {
  tail: TerrainSegment;
  scoreTier: number;
  distanceTier: number;
  difficultyTier: number;
  estimatedEntrySpeed: number;
  safeJumpDistance: number;
  riskJumpDistance: number;
  rampJumpDistance: number;
  maxJumpHeight: number;
}

const TERRAIN_Y_MIN = 180;          // don't climb above background structures
const TERRAIN_Y_MAX = CV.height + 60; // camera follows lower terrain; this stops runaway drift
const LOWER_RETURN_GAP = 150;
const DEEP_RETURN_GAP = 210;
const LOWER_RETURN_MIN_LENGTH = 320;
const DEEP_RETURN_MIN_LENGTH = 480;

const ROUTE_PATTERNS: RoutePattern[] = [
  {
    id: "safe-flat",
    difficulty: "easy",
    length: T.flatLength * 0.95,
    minEntrySpeed: 0,
    maxEntrySpeed: P.maxSpeed * 2,
    hasSafePath: true,
    hasRiskRewardPath: false,
    requiresJump: false,
    requiresPump: false,
    requiresHighSpeed: false,
    preferredNextPatterns: ["obstacle-reward", "ring-gate", "upper-ledge"],
    build: buildSafeFlatPattern,
  },
  {
    id: "recovery",
    difficulty: "recovery",
    length: T.flatLength * 0.85,
    minEntrySpeed: 0,
    maxEntrySpeed: P.maxSpeed * 2,
    hasSafePath: true,
    hasRiskRewardPath: false,
    requiresJump: false,
    requiresPump: false,
    requiresHighSpeed: false,
    preferredNextPatterns: ["safe-flat", "obstacle-reward", "ring-gate"],
    build: buildRecoveryPattern,
  },
  {
    id: "ramp-reward-arc",
    difficulty: "hard",
    length: 1205,
    minEntrySpeed: 220,
    maxEntrySpeed: P.maxSpeed * 2,
    hasSafePath: true,
    hasRiskRewardPath: true,
    requiresJump: true,
    requiresPump: false,
    requiresHighSpeed: true,
    preferredNextPatterns: ["recovery", "safe-flat"],
    validation: {
      rampGaps: [135],
      minLandingWidth: 320,
      firstObstacleAfterLanding: 198,
    },
    build: buildRampArcPattern,
  },
  {
    id: "upper-ledge",
    difficulty: "medium",
    length: 1520,
    minEntrySpeed: 180,
    maxEntrySpeed: P.maxSpeed * 2,
    hasSafePath: true,
    hasRiskRewardPath: true,
    requiresJump: true,
    requiresPump: false,
    requiresHighSpeed: false,
    preferredNextPatterns: ["recovery", "downhill-pump", "safe-flat"],
    validation: {
      upperLedgeHeight: R.upperLedgeHeight,
      minLandingWidth: 190,
    },
    build: buildUpperLedgePattern,
  },
  {
    id: "downhill-pump",
    difficulty: "hard",
    length: 1200,
    minEntrySpeed: 170,
    maxEntrySpeed: P.maxSpeed * 2,
    hasSafePath: true,
    hasRiskRewardPath: true,
    requiresJump: true,
    requiresPump: true,
    requiresHighSpeed: false,
    preferredNextPatterns: ["recovery", "safe-flat"],
    validation: {
      riskGaps: [LOWER_RETURN_GAP, DEEP_RETURN_GAP],
      minLandingWidth: 280,
      firstObstacleAfterLanding: 255,
    },
    build: buildDownhillPumpPattern,
  },
  {
    id: "obstacle-reward",
    difficulty: "medium",
    length: 1000,
    minEntrySpeed: 120,
    maxEntrySpeed: P.maxSpeed * 2,
    hasSafePath: true,
    hasRiskRewardPath: true,
    requiresJump: true,
    requiresPump: false,
    requiresHighSpeed: false,
    preferredNextPatterns: ["safe-flat", "recovery", "upper-ledge"],
    validation: {
      minLandingWidth: 260,
      firstObstacleAfterLanding: 260,
    },
    build: buildObstacleRewardPattern,
  },
  {
    id: "ring-gate",
    difficulty: "medium",
    length: 1180,
    minEntrySpeed: 160,
    maxEntrySpeed: P.maxSpeed * 2,
    hasSafePath: true,
    hasRiskRewardPath: true,
    requiresJump: false,
    requiresPump: false,
    requiresHighSpeed: false,
    preferredNextPatterns: ["safe-flat", "upper-ledge", "recovery"],
    validation: {
      minLandingWidth: 360,
    },
    build: buildRingGatePattern,
  },
];

export function updateTerrain(state: GameState): void {
  ensureTerrainAhead(state);
  cullTerrainBehind(state);
}

export function ensureTerrainAhead(state: GameState): void {
  if (state.terrainSegments.length === 0) {
    addSegment(state, "flat", 0, T.groundY, {
      length: T.flatLength,
      route: "main",
      surfaceKind: "ground",
    });
  }

  let tail = getPrimaryTail(state.terrainSegments);
  const targetX = state.worldOffset + CV.width + T.generateAhead;

  while (tail.endX < targetX) {
    const pattern = selectRoutePattern(state, tail);
    state.terrainPatternIndex += 1;
    tail = pattern.build(state, tail.endX, tail.endY);
    recordPatternPlacement(state, pattern);
  }
}

export function sampleTerrainAt(
  segments: TerrainSegment[],
  worldX: number,
  options: TerrainSampleOptions = {}
): TerrainSample {
  const candidates: TerrainSample[] = [];
  let gapSample: TerrainSample | null = null;

  for (const segment of segments) {
    if (worldX < segment.startX || worldX > segment.endX) continue;
    if (options.stickToRoute && segment.route !== options.stickToRoute) continue;

    if (segment.type === "gap") {
      gapSample ??= {
        hasSurface: false,
        y: segment.startY,
        angle: 0,
        segment,
      };
      continue;
    }

    if (shouldIgnoreSurface(segment, options)) continue;

    const sample = buildSurfaceSample(segment, worldX);
    if (segment.id === options.currentSegmentId) {
      return sample;
    }
    candidates.push(sample);
  }

  if (candidates.length === 0) {
    return gapSample ?? {
      hasSurface: false,
      y: T.groundY,
      angle: 0,
      segment: null,
    };
  }

  if (typeof options.preferredY === "number") {
    return candidates.reduce((best, candidate) => {
      const bestDist = Math.abs(best.y - options.preferredY!);
      const candidateDist = Math.abs(candidate.y - options.preferredY!);
      if (candidateDist < bestDist) return candidate;
      if (candidateDist === bestDist && candidate.y > best.y) return candidate;
      return best;
    });
  }

  // Default callers, like token spawn and camera lookahead, use the lowest
  // surface so optional upper ledges do not steal the baseline route.
  return candidates.reduce((lowest, candidate) =>
    candidate.y > lowest.y ? candidate : lowest
  );
}

export function crossedRampEnd(
  segments: TerrainSegment[],
  previousWorldX: number,
  nextWorldX: number,
  currentSegmentId?: number | null
): TerrainSegment | null {
  for (const segment of segments) {
    if (segment.type !== "small-ramp") continue;
    if (currentSegmentId != null && segment.id !== currentSegmentId) continue;
    if (previousWorldX < segment.endX && nextWorldX >= segment.endX) {
      return segment;
    }
  }
  return null;
}

export function getTerrainObstacleFrames(
  segments: TerrainSegment[]
): TerrainObstacleFrame[] {
  const frames: TerrainObstacleFrame[] = [];

  for (const segment of segments) {
    if (!segment.obstacle || segment.type === "gap") continue;
    const obstacle = segment.obstacle;
    const t = (obstacle.worldX - segment.startX) / (segment.endX - segment.startX);
    frames.push({
      segment,
      obstacle,
      worldX: obstacle.worldX,
      y: segment.startY + (segment.endY - segment.startY) * t,
      angle: Math.atan2(segment.endY - segment.startY, segment.endX - segment.startX),
    });
  }

  return frames;
}

export function getTerrainSegmentById(
  segments: TerrainSegment[],
  id: number | null
): TerrainSegment | null {
  if (id == null) return null;
  return segments.find((segment) => segment.id === id) ?? null;
}

export function isRedDropRamp(segment: TerrainSegment | null): segment is TerrainSegment {
  return segment?.type === "red-ramp";
}

export function shouldIgnoreSurface(
  segment: TerrainSegment,
  options: TerrainSampleOptions
): boolean {
  if (segment.id === options.ignoreSegmentId) return true;
  return Boolean(
    options.ignorePlatformRoute &&
    segment.route === options.ignorePlatformRoute &&
    segment.surfaceKind === "platform"
  );
}

export function surfaceYAtX(segment: TerrainSegment, x: number): number {
  const t = (x - segment.startX) / (segment.endX - segment.startX);
  return segment.startY + (segment.endY - segment.startY) * t;
}

// ─── Pattern selection and validation ───────────────────────────────────────

function selectRoutePattern(state: GameState, tail: TerrainSegment): RoutePattern {
  const context = buildGeneratorContext(state, tail);
  const forcedRecovery = state.terrainGenerator.hardStreak >= G.hardStreakLimit;
  const candidatePool = forcedRecovery
    ? getPatternsById(["recovery", "safe-flat"])
    : getCandidatePool(state, context);

  const seedOffset = stableSeedHash(state.terrainGenerator.seed);
  const preferredCandidateCount = forcedRecovery
    ? candidatePool.length
    : countPreferredCandidates(state, candidatePool);
  const selectionRange = preferredCandidateCount > 0
    ? preferredCandidateCount
    : candidatePool.length;
  const startIndex = candidatePool.length === 0
    ? 0
    : (state.terrainPatternIndex * 3 + context.distanceTier + seedOffset) % selectionRange;

  let lastRejected = forcedRecovery
    ? `forced recovery after ${state.terrainGenerator.hardStreak} hard patterns`
    : "";

  const attempts = Math.min(G.maxPatternSelectionAttempts, candidatePool.length);
  for (let i = 0; i < attempts; i += 1) {
    const pattern = candidatePool[(startIndex + i) % candidatePool.length];
    const result = validatePatternPlacement(pattern, context, state);
    if (result.valid) {
      state.terrainGenerator.rejectedPatternReason = lastRejected;
      state.terrainGenerator.currentScoreTier = context.scoreTier;
      return pattern;
    }
    lastRejected = `${pattern.id}: ${result.reason}`;
  }

  const fallbackId = forcedRecovery ? "recovery" : "safe-flat";
  state.terrainGenerator.rejectedPatternReason =
    `fallback ${fallbackId}${lastRejected ? ` after ${lastRejected}` : ""}`;
  state.terrainGenerator.currentScoreTier = context.scoreTier;
  return getPatternById(fallbackId);
}

function getCandidatePool(
  state: GameState,
  context: GeneratorContext
): RoutePattern[] {
  const previousId = state.terrainGenerator.currentPatternId;
  const previous = ROUTE_PATTERNS.find((pattern) => pattern.id === previousId);
  const preferred = previous?.preferredNextPatterns
    ? getPatternsById(previous.preferredNextPatterns)
    : [];

  const allowed = ROUTE_PATTERNS.filter((pattern) => {
    if (pattern.difficulty === "hard" && context.difficultyTier < 2) return false;
    if (pattern.difficulty === "medium" && context.difficultyTier < 1) {
      return pattern.id === "obstacle-reward" || pattern.id === "ring-gate";
    }
    if (pattern.difficulty === "hard" && state.terrainGenerator.hardStreak >= G.hardStreakLimit) {
      return false;
    }
    return true;
  });

  const preferredAllowed = preferred.filter((pattern) => allowed.includes(pattern));
  const remaining = allowed.filter((pattern) => !preferredAllowed.includes(pattern));
  return [...preferredAllowed, ...remaining];
}

function countPreferredCandidates(state: GameState, candidates: RoutePattern[]): number {
  const previous = ROUTE_PATTERNS.find(
    (pattern) => pattern.id === state.terrainGenerator.currentPatternId
  );
  if (!previous?.preferredNextPatterns) return 0;
  return candidates.filter((candidate) =>
    previous.preferredNextPatterns?.includes(candidate.id)
  ).length;
}

function validatePatternPlacement(
  pattern: RoutePattern,
  context: GeneratorContext,
  state: GameState
): { valid: true } | { valid: false; reason: string } {
  if (!pattern.hasSafePath) {
    return { valid: false, reason: "no safe survival path" };
  }

  if (context.tail.endY < TERRAIN_Y_MIN || context.tail.endY > TERRAIN_Y_MAX) {
    return { valid: false, reason: "entry terrain outside camera bounds" };
  }

  if (!isDifficultyAllowed(pattern, context, state)) {
    return { valid: false, reason: `difficulty ${pattern.difficulty} not allowed yet` };
  }

  if (pattern.minEntrySpeed > context.estimatedEntrySpeed + 80) {
    return {
      valid: false,
      reason: `entry speed ${Math.round(context.estimatedEntrySpeed)} < ${pattern.minEntrySpeed}`,
    };
  }

  const validation = pattern.validation;
  if (!validation) return { valid: true };

  for (const gap of validation.safeGaps ?? []) {
    if (gap > context.safeJumpDistance) {
      return {
        valid: false,
        reason: `safe gap ${Math.round(gap)} > ${Math.round(context.safeJumpDistance)}`,
      };
    }
  }

  for (const gap of validation.riskGaps ?? []) {
    if (gap > context.riskJumpDistance) {
      return {
        valid: false,
        reason: `risk gap ${Math.round(gap)} > ${Math.round(context.riskJumpDistance)}`,
      };
    }
  }

  for (const gap of validation.rampGaps ?? []) {
    if (gap > context.rampJumpDistance) {
      return {
        valid: false,
        reason: `ramp gap ${Math.round(gap)} > ${Math.round(context.rampJumpDistance)}`,
      };
    }
  }

  if (
    typeof validation.upperLedgeHeight === "number" &&
    validation.upperLedgeHeight > context.maxJumpHeight * G.upperLedgeReachSafety
  ) {
    return {
      valid: false,
      reason: `ledge ${Math.round(validation.upperLedgeHeight)} too high`,
    };
  }

  if (
    typeof validation.minLandingWidth === "number" &&
    validation.minLandingWidth < G.minimumLandingWidth
  ) {
    return {
      valid: false,
      reason: `landing ${Math.round(validation.minLandingWidth)} too short`,
    };
  }

  if (
    typeof validation.firstObstacleAfterLanding === "number" &&
    validation.firstObstacleAfterLanding < Math.max(
      G.blindLandingObstacleBuffer,
      context.estimatedEntrySpeed * G.reactionTimeSeconds
    )
  ) {
    return {
      valid: false,
      reason: `blind obstacle ${Math.round(validation.firstObstacleAfterLanding)}px`,
    };
  }

  return { valid: true };
}

function isDifficultyAllowed(
  pattern: RoutePattern,
  context: GeneratorContext,
  state: GameState
): boolean {
  if (pattern.difficulty === "hard") {
    return context.difficultyTier >= 2 && state.terrainGenerator.hardStreak < G.hardStreakLimit;
  }

  if (pattern.difficulty === "medium") {
    return context.difficultyTier >= 1 ||
      pattern.id === "obstacle-reward" ||
      pattern.id === "ring-gate";
  }

  return true;
}

function buildGeneratorContext(
  state: GameState,
  tail: TerrainSegment
): GeneratorContext {
  const scoreTier = Math.floor(state.score / G.scoreTierSize);
  const distanceTier = Math.floor(tail.endX / G.difficultyDistanceTierLength);
  const difficultyTier = Math.max(scoreTier, distanceTier);
  const estimatedEntrySpeed = estimateEntrySpeedAtTail(state, tail.endX);
  const safeJump = estimateJumpReach(P.maxSpeed * G.safeJumpSpeedRatio, "jump");
  const riskJump = estimateJumpReach(P.maxSpeed * G.riskJumpSpeedRatio, "jump");
  const rampJump = estimateJumpReach(Math.max(estimatedEntrySpeed, P.maxSpeed * 0.55), "ramp");
  const maxJumpVelocity = J.baseVelocity + J.speedBonus * G.riskJumpSpeedRatio;
  const maxJumpHeight = (maxJumpVelocity * maxJumpVelocity) / (2 * J.gravity);

  return {
    tail,
    scoreTier,
    distanceTier,
    difficultyTier,
    estimatedEntrySpeed,
    safeJumpDistance: safeJump.distance,
    riskJumpDistance: riskJump.distance,
    rampJumpDistance: rampJump.distance,
    maxJumpHeight,
  };
}

function estimateEntrySpeedAtTail(state: GameState, tailX: number): number {
  const playerWorldX = state.worldOffset + state.player.x;
  const runway = Math.max(0, tailX - playerWorldX);
  const baselineSpeed = Math.max(state.player.speed, P.startSpeed, P.maxSpeed * 0.32);
  const accelerationTime = Math.min(3.2, runway / Math.max(180, baselineSpeed));
  return Math.min(P.maxSpeed, baselineSpeed + P.acceleration * accelerationTime);
}

function estimateJumpReach(
  speed: number,
  launchType: "jump" | "ramp"
): { distance: number; airtime: number } {
  const speedRatio = Math.max(0, Math.min(1, speed / P.maxSpeed));
  const verticalVelocity = launchType === "ramp"
    ? T.rampLaunchVelocity + T.rampSpeedLaunchBonus * speedRatio
    : J.baseVelocity + J.speedBonus * speedRatio;
  const airtime = (2 * verticalVelocity) / J.gravity;
  const margin = launchType === "ramp" ? G.rampSafetyMargin : G.jumpSafetyMargin;
  return {
    distance: speed * airtime * margin,
    airtime,
  };
}

function recordPatternPlacement(state: GameState, pattern: RoutePattern): void {
  const generator = state.terrainGenerator;
  generator.currentPatternId = pattern.id;
  generator.currentPatternDifficulty = pattern.difficulty;
  generator.currentScoreTier = Math.floor(state.score / G.scoreTierSize);
  generator.recentPatternIds = [pattern.id, ...generator.recentPatternIds]
    .slice(0, G.debugHistorySize);
  generator.hardStreak = pattern.difficulty === "hard"
    ? generator.hardStreak + 1
    : 0;
  generator.lastWasRecovery = pattern.difficulty === "recovery";
}

function getPatternById(id: string): RoutePattern {
  const pattern = ROUTE_PATTERNS.find((candidate) => candidate.id === id);
  if (!pattern) throw new Error(`Missing terrain pattern: ${id}`);
  return pattern;
}

function getPatternsById(ids: string[]): RoutePattern[] {
  return ids.map(getPatternById);
}

function stableSeedHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ─── Route pattern library ───────────────────────────────────────────────────

function buildSafeFlatPattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  return addSegment(state, "flat", startX, startY, {
    length: T.flatLength * 0.95,
    route: "main",
    surfaceKind: "ground",
  });
}

function buildUpperLedgePattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  const lowerRunway = addSegment(state, "flat", startX, startY, {
    length: 360,
    route: "main",
    surfaceKind: "ground",
  });
  const lowerUnderpass = addSegment(state, "flat", lowerRunway.endX, lowerRunway.endY, {
    length: 1160,
    route: "main",
    surfaceKind: "ground",
  });

  const upperY1 = clampY(startY - R.upperLedgeHeight);
  const upperY2 = clampY(upperY1 - 46);
  const upperY3 = clampY(upperY2 - 38);

  addSegment(state, "flat-platform", startX + 270, upperY1, {
    length: 220,
    route: "upper",
    surfaceKind: "platform",
    riskLevel: 1,
    riskLabel: "HIGH LINE",
  });
  const launchRamp = addSegment(state, "small-ramp", startX + 490, upperY1, {
    length: 150,
    endY: upperY2,
    route: "upper",
    surfaceKind: "platform",
    riskLevel: 1,
    riskLabel: "HIGH LINE",
  });

  const upperHazard = addSegment(state, "flat-obstacle", launchRamp.endX + 72, upperY2, {
    length: 260,
    route: "upper",
    surfaceKind: "platform",
    riskLevel: 2,
    riskLabel: "RISK LINE",
  });
  addScoreSurgeToken(
    state,
    upperHazard.startX + (upperHazard.endX - upperHazard.startX) * 0.42,
    upperY2 - 34
  );

  const topRamp = addSegment(state, "small-ramp", upperHazard.endX + 74, upperY2, {
    length: 130,
    endY: upperY3,
    route: "upper",
    surfaceKind: "platform",
    riskLevel: 2,
    riskLabel: "RISK LINE",
  });

  const topLanding = addSegment(state, "flat-platform", topRamp.endX + 96, upperY3, {
    length: 190,
    route: "upper",
    surfaceKind: "platform",
    riskLevel: 3,
    riskLabel: "EXTREME LINE",
  });
  addScoreSurgeToken(
    state,
    topLanding.startX + (topLanding.endX - topLanding.startX) * 0.50,
    upperY3 - 34
  );

  return lowerUnderpass;
}

function buildRampArcPattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  const runway = addSegment(state, "flat", startX, startY, {
    length: 320,
    route: "main",
    surfaceKind: "ground",
  });
  const ramp = addSegment(state, "small-ramp", runway.endX, runway.endY, {
    route: "main",
    surfaceKind: "ground",
  });
  const launchGap = addSegment(state, "gap", ramp.endX, ramp.endY, {
    length: 135,
    endY: ramp.endY,
    route: "main",
    surfaceKind: "ground",
  });
  const highLanding = addSegment(state, "flat-obstacle", launchGap.endX, launchGap.endY, {
    length: 320,
    route: "main",
    surfaceKind: "ground",
    riskLevel: 2,
    riskLabel: "RAMP LINE",
  });
  const returnSlope = addSegment(state, "downhill", highLanding.endX, highLanding.endY, {
    length: T.slopeLength,
    endY: startY,
    route: "main",
    surfaceKind: "ground",
  });
  addEnergyRing(state, ramp.endX + 120, ramp.endY - 86);
  addScoreSurgeToken(state, highLanding.startX + 245, highLanding.endY - 32);
  return addSegment(state, "flat", returnSlope.endX, returnSlope.endY, {
    length: 220,
    route: "main",
    surfaceKind: "ground",
  });
}

function buildRingGatePattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  const runway = addSegment(state, "flat", startX, startY, {
    length: 320,
    route: "main",
    surfaceKind: "ground",
  });
  const ramp = addSegment(state, "small-ramp", runway.endX, runway.endY, {
    length: 190,
    route: "main",
    surfaceKind: "ground",
    riskLevel: 1,
    riskLabel: "RING LINE",
  });
  const landing = addSegment(state, "flat-platform", ramp.endX, ramp.endY, {
    length: 360,
    route: "main",
    surfaceKind: "platform",
  });
  addEnergyRing(state, ramp.endX + 110, ramp.endY - 88);
  const returnSlope = addSegment(state, "downhill", landing.endX, landing.endY, {
    length: 150,
    endY: startY,
    route: "main",
    surfaceKind: "ground",
  });
  return addSegment(state, "flat", returnSlope.endX, returnSlope.endY, {
    length: 160,
    route: "main",
    surfaceKind: "ground",
  });
}

function buildDownhillPumpPattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  return buildRedDropPattern(state, startX, startY);
}

function buildRedDropPattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  const redRamp = addSegment(state, "red-ramp", startX, startY, {
    length: R.redRampLength,
    route: "main",
    surfaceKind: "platform",
  });
  const safeBridge = addSegment(state, "flat-platform", redRamp.endX, redRamp.endY, {
    length: 820,
    route: "main",
    surfaceKind: "platform",
  });

  const lowerStartX = startX + R.redRampLength * 0.72;
  const lowerStartY = clampY(startY + 54);
  const lowerDown = addSegment(state, "downhill", lowerStartX, lowerStartY, {
    length: 260,
    endY: startY + R.dropRouteDepth * 0.82,
    route: "lower",
    surfaceKind: "ground",
    riskLevel: 1,
    riskLabel: "LOW LINE",
  });
  const lowerRamp = addSegment(state, "red-ramp", lowerDown.endX, lowerDown.endY, {
    length: R.redRampLength * 0.86,
    route: "lower",
    surfaceKind: "platform",
    riskLevel: 1,
    riskLabel: "LOW LINE",
  });
  const lowerBridge = addSegment(state, "flat-platform", lowerRamp.endX, lowerRamp.endY, {
    length: 280,
    route: "lower",
    surfaceKind: "platform",
    riskLevel: 1,
    riskLabel: "LOW LINE",
  });
  const lowerReturnGap = addSegment(state, "gap", lowerBridge.endX, lowerBridge.endY, {
    length: LOWER_RETURN_GAP,
    endY: lowerBridge.endY,
    route: "lower",
    surfaceKind: "ground",
  });
  const lowerReturn = addSegment(state, "uphill", lowerReturnGap.endX, lowerReturnGap.endY, {
    length: Math.max(LOWER_RETURN_MIN_LENGTH, safeBridge.endX - lowerReturnGap.endX),
    endY: startY,
    route: "lower",
    surfaceKind: "ground",
    riskLevel: 1,
    riskLabel: "LOW LINE",
  });

  const deepStartX = lowerRamp.startX + (lowerRamp.endX - lowerRamp.startX) * 0.66;
  const deepStartY = clampY(lowerRamp.endY + 58);
  const deepDown = addSegment(state, "downhill", deepStartX, deepStartY, {
    length: 230,
    endY: deepStartY + 42,
    route: "lower",
    surfaceKind: "ground",
    riskLevel: 2,
    riskLabel: "DEEP LINE",
  });
  const deepHazard = addSegment(state, "flat-obstacle", deepDown.endX, deepDown.endY, {
    length: 255,
    route: "lower",
    surfaceKind: "ground",
    riskLevel: 3,
    riskLabel: "EXTREME LOW",
  });
  const deepGap = addSegment(state, "gap", deepHazard.endX, deepHazard.endY, {
    length: DEEP_RETURN_GAP,
    endY: deepHazard.endY,
    route: "lower",
    surfaceKind: "ground",
  });
  const deepReturn = addSegment(state, "uphill", deepGap.endX, deepGap.endY, {
    length: Math.max(DEEP_RETURN_MIN_LENGTH, safeBridge.endX - deepGap.endX),
    endY: startY,
    route: "lower",
    surfaceKind: "ground",
    riskLevel: 2,
    riskLabel: "DEEP LINE",
  });

  addScoreSurgeToken(state, lowerBridge.startX + 100, lowerBridge.endY - 30);
  addScoreSurgeToken(
    state,
    deepHazard.startX + 110,
    surfaceYAtX(deepHazard, deepHazard.startX + 110) - 32
  );

  const reconnectX = Math.max(safeBridge.endX, lowerReturn.endX, deepReturn.endX);
  if (reconnectX > safeBridge.endX) {
    addSegment(state, "flat-platform", safeBridge.endX, startY, {
      length: reconnectX - safeBridge.endX,
      route: "main",
      surfaceKind: "platform",
    });
  }
  return addSegment(state, "flat", reconnectX, startY, {
    length: 260,
    route: "main",
    surfaceKind: "ground",
  });
}

function buildObstacleRewardPattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  const setup = addSegment(state, "flat", startX, startY, {
    length: 260,
    route: "main",
    surfaceKind: "ground",
  });
  const obstacle = addSegment(state, "flat-obstacle", setup.endX, setup.endY, {
    length: 520,
    route: "main",
    surfaceKind: "ground",
  });
  if (obstacle.obstacle) {
    const rewardX = obstacle.obstacle.worldX + 86;
    addScoreSurgeToken(state, rewardX, surfaceYAtX(obstacle, rewardX) - 30);
  }
  return addSegment(state, "flat", obstacle.endX, obstacle.endY, {
    length: 220,
    route: "main",
    surfaceKind: "ground",
  });
}

function buildRecoveryPattern(
  state: GameState,
  startX: number,
  startY: number
): TerrainSegment {
  return addSegment(state, "flat", startX, startY, {
    length: T.flatLength * 0.85,
    route: "main",
    surfaceKind: "ground",
  });
}

// ─── Route reward placement ─────────────────────────────────────────────────

function addScoreSurgeToken(state: GameState, worldX: number, y: number): void {
  state.scoreSurgeTokens.push({
    id: state.nextScoreSurgeTokenId++,
    worldX,
    y,
  });
}

function addEnergyRing(state: GameState, worldX: number, y: number): void {
  state.energyRings.push({
    id: state.nextEnergyRingId++,
    worldX,
    y,
    radiusX: RW.ringRadiusX,
    radiusY: RW.ringRadiusY,
    bonus: RW.ringBonus,
  });
}

// ─── Segment creation ────────────────────────────────────────────────────────

interface AddSegmentOptions {
  route?: TerrainRoute;
  surfaceKind?: TerrainSurfaceKind;
  length?: number;
  endY?: number;
  riskLevel?: number;
  riskLabel?: string;
}

function addSegment(
  state: GameState,
  type: TerrainSegmentType,
  startX: number,
  startY: number,
  options: AddSegmentOptions = {}
): TerrainSegment {
  const id = state.nextTerrainSegmentId++;
  const dimensions = getSegmentDimensions(type, startY);
  const length = options.length ?? dimensions.length;
  const endX = startX + length;
  const endY = clampY(options.endY ?? dimensions.endY);
  const route = options.route ?? "main";
  const surfaceKind = options.surfaceKind ?? "ground";
  const obstacle = createTerrainObstacle(state, type, startX, endX);

  const segment: TerrainSegment = {
    id,
    type,
    startX,
    endX,
    startY,
    endY,
    route,
    surfaceKind,
    riskLevel: options.riskLevel,
    riskLabel: options.riskLabel,
    obstacle,
  };

  state.terrainSegments.push(segment);
  return segment;
}

function getSegmentDimensions(
  type: TerrainSegmentType,
  startY: number
): { length: number; endY: number } {
  switch (type) {
    case "uphill":
      return { length: T.slopeLength, endY: startY - T.slopeHeight };
    case "downhill":
      return { length: T.slopeLength, endY: startY + T.slopeHeight };
    case "small-ramp":
      return { length: T.rampLength, endY: startY - T.rampHeight };
    case "red-ramp":
      return { length: R.redRampLength, endY: startY };
    case "gap":
      return { length: T.gapLength, endY: startY + T.platformDrop };
    case "flat-platform":
      return { length: T.platformLength, endY: startY };
    case "slope-obstacle":
      return { length: T.slopeLength, endY: startY - T.slopeHeight * 0.55 };
    default:
      return { length: T.flatLength, endY: startY };
  }
}

function createTerrainObstacle(
  state: GameState,
  type: TerrainSegmentType,
  startX: number,
  endX: number
): TerrainObstacle | undefined {
  if (type !== "flat-obstacle" && type !== "slope-obstacle") return undefined;

  return {
    id: state.nextObstacleId++,
    worldX: startX + (endX - startX) * 0.62,
    width: T.obstacleWidth,
    height: T.obstacleHeight,
    scored: false,
  };
}

function getPrimaryTail(segments: TerrainSegment[]): TerrainSegment {
  const mainSegments = segments.filter((segment) => segment.route === "main");
  return mainSegments.reduce((tail, segment) =>
    segment.endX > tail.endX ? segment : tail
  );
}

function buildSurfaceSample(segment: TerrainSegment, worldX: number): TerrainSample {
  return {
    hasSurface: true,
    y: surfaceYAtX(segment, worldX),
    angle: Math.atan2(segment.endY - segment.startY, segment.endX - segment.startX),
    segment,
  };
}

function clampY(y: number): number {
  return Math.max(TERRAIN_Y_MIN, Math.min(TERRAIN_Y_MAX, y));
}

function cullTerrainBehind(state: GameState): void {
  const keepAfter = state.worldOffset - T.cullBehind;
  state.terrainSegments = state.terrainSegments.filter(
    (segment, index, segments) => segment.endX >= keepAfter || index === segments.length - 1
  );
}
