import { GAME_CONFIG } from "../config/gameConfig";
import type {
  GameState,
  TerrainObstacle,
  TerrainRoute,
  TerrainSegment,
  TerrainSegmentType,
  TerrainSurfaceKind,
} from "../core/types";

const CV = GAME_CONFIG.canvas;
const T = GAME_CONFIG.terrain;
const R = GAME_CONFIG.routes;
const RW = GAME_CONFIG.rewards;

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
}

interface RoutePattern {
  name: string;
  build: (state: GameState, startX: number, startY: number) => TerrainSegment;
}

const TERRAIN_Y_MIN = 180;          // don't climb above background structures
const TERRAIN_Y_MAX = CV.height + 60; // camera follows lower terrain; this stops runaway drift

const ROUTE_PATTERNS: RoutePattern[] = [
  { name: "safe-flat", build: buildSafeFlatPattern },
  { name: "upper-ledge", build: buildUpperLedgePattern },
  { name: "recovery", build: buildRecoveryPattern },
  { name: "ramp-arc", build: buildRampArcPattern },
  { name: "red-drop", build: buildRedDropPattern },
  { name: "recovery", build: buildRecoveryPattern },
  { name: "obstacle-line", build: buildObstacleRewardPattern },
  { name: "recovery", build: buildRecoveryPattern },
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
    const pattern = ROUTE_PATTERNS[state.terrainPatternIndex % ROUTE_PATTERNS.length];
    state.terrainPatternIndex += 1;
    tail = pattern.build(state, tail.endX, tail.endY);
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
    length: 170,
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
  const lowerReturn = addSegment(state, "uphill", lowerBridge.endX, lowerBridge.endY, {
    length: Math.max(230, safeBridge.endX - lowerBridge.endX),
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
    length: 120,
    endY: deepHazard.endY,
    route: "lower",
    surfaceKind: "ground",
  });
  const deepReturn = addSegment(state, "uphill", deepGap.endX, deepGap.endY, {
    length: Math.max(260, safeBridge.endX - deepGap.endX),
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
