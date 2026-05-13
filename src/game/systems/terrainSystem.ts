import { GAME_CONFIG } from "../config/gameConfig";
import type {
  GameState,
  TerrainObstacle,
  TerrainSegment,
  TerrainSegmentType,
} from "../core/types";

const CV = GAME_CONFIG.canvas;
const T = GAME_CONFIG.terrain;

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

const SEGMENT_PATTERN: TerrainSegmentType[] = [
  "flat",
  "uphill",
  "flat",
  "flat-obstacle",
  "downhill",
  "gap",
  "flat-platform",
  "small-ramp",
  "slope-obstacle",
  "downhill",
  "flat",
];

export function updateTerrain(state: GameState): void {
  ensureTerrainAhead(state);
  cullTerrainBehind(state);
}

export function ensureTerrainAhead(state: GameState): void {
  if (state.terrainSegments.length === 0) {
    addSegment(state, "flat", 0, T.groundY);
  }

  let last = state.terrainSegments[state.terrainSegments.length - 1];
  const targetX = state.worldOffset + CV.width + T.generateAhead;

  while (last.endX < targetX) {
    const type = SEGMENT_PATTERN[state.terrainPatternIndex % SEGMENT_PATTERN.length];
    state.terrainPatternIndex += 1;
    addSegment(state, type, last.endX, last.endY);
    last = state.terrainSegments[state.terrainSegments.length - 1];
  }
}

export function sampleTerrainAt(
  segments: TerrainSegment[],
  worldX: number
): TerrainSample {
  for (const segment of segments) {
    if (worldX < segment.startX || worldX > segment.endX) continue;

    if (segment.type === "gap") {
      return {
        hasSurface: false,
        y: segment.startY,
        angle: 0,
        segment,
      };
    }

    const t = (worldX - segment.startX) / (segment.endX - segment.startX);
    const y = segment.startY + (segment.endY - segment.startY) * t;
    const angle = Math.atan2(segment.endY - segment.startY, segment.endX - segment.startX);

    return {
      hasSurface: true,
      y,
      angle,
      segment,
    };
  }

  return {
    hasSurface: false,
    y: T.groundY,
    angle: 0,
    segment: null,
  };
}

export function crossedRampEnd(
  segments: TerrainSegment[],
  previousWorldX: number,
  nextWorldX: number
): TerrainSegment | null {
  for (const segment of segments) {
    if (segment.type !== "small-ramp") continue;
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

function addSegment(
  state: GameState,
  type: TerrainSegmentType,
  startX: number,
  startY: number
): void {
  const id = state.nextTerrainSegmentId++;
  const dimensions = getSegmentDimensions(type, startY);
  const endX = startX + dimensions.length;
  const endY = dimensions.endY;
  const obstacle = createTerrainObstacle(state, type, startX, endX);

  state.terrainSegments.push({
    id,
    type,
    startX,
    endX,
    startY,
    endY,
    obstacle,
  });
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

function cullTerrainBehind(state: GameState): void {
  const keepAfter = state.worldOffset - T.cullBehind;
  state.terrainSegments = state.terrainSegments.filter(
    (segment, index, segments) => segment.endX >= keepAfter || index === segments.length - 1
  );
}
