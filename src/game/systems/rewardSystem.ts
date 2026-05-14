import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import { getScoreGainFactor } from "./scoringSystem";

const P = GAME_CONFIG.player;
const RW = GAME_CONFIG.rewards;
const SS = GAME_CONFIG.scoreSurge;

export function updateRewards(state: GameState, dt: number): void {
  updateScoreSurgeTimer(state, dt);
  updateRouteFeedback(state, dt);
  cullRewards(state);
  updateRiskRouteScore(state, dt);
  collectScoreSurgeTokens(state);
  collectEnergyRings(state);
}

function updateScoreSurgeTimer(state: GameState, dt: number): void {
  if (state.scoreSurgeFlash > 0) {
    state.scoreSurgeFlash = Math.max(0, state.scoreSurgeFlash - dt);
  }

  if (!state.scoreSurgeActive) return;

  state.scoreSurgeTimer = Math.max(0, state.scoreSurgeTimer - dt);
  if (state.scoreSurgeTimer <= 0) {
    state.scoreSurgeActive = false;
  }
}

function updateRouteFeedback(state: GameState, dt: number): void {
  if (state.routeFeedbackTimer <= 0) return;

  state.routeFeedbackTimer = Math.max(0, state.routeFeedbackTimer - dt);
  if (state.routeFeedbackTimer <= 0) {
    state.routeFeedbackText = "";
  }
}

function cullRewards(state: GameState): void {
  const keepAfter = state.worldOffset - RW.cullBehind;

  state.scoreSurgeTokens = state.scoreSurgeTokens.filter(
    (token) => token.worldX >= keepAfter
  );
  state.energyRings = state.energyRings.filter(
    (ring) => ring.worldX + ring.radiusX >= keepAfter
  );
}

function collectScoreSurgeTokens(state: GameState): void {
  for (let i = state.scoreSurgeTokens.length - 1; i >= 0; i -= 1) {
    const token = state.scoreSurgeTokens[i];
    const screenX = token.worldX - state.worldOffset;

    if (!hitRectCircle(state.player.x, state.player.y, screenX, token.y, SS.tokenRadius)) {
      continue;
    }

    state.scoreSurgeTokens.splice(i, 1);
    activateScoreSurge(state);
  }
}

function collectEnergyRings(state: GameState): void {
  for (let i = state.energyRings.length - 1; i >= 0; i -= 1) {
    const ring = state.energyRings[i];
    const screenX = ring.worldX - state.worldOffset;
    const dx = (state.player.x - screenX) / ring.radiusX;
    const dy = (state.player.y - ring.y) / ring.radiusY;

    if (dx * dx + dy * dy > 1) continue;

    state.energyRings.splice(i, 1);
    awardRewardScore(state, ring.bonus);
    setRouteFeedback(state, `RING BONUS +${ring.bonus}`);
  }
}

function updateRiskRouteScore(state: GameState, dt: number): void {
  if (!state.player.isGrounded || state.player.currentSegmentId == null) {
    state.lastRiskSegmentId = null;
    return;
  }

  const segment = state.terrainSegments.find(
    (candidate) => candidate.id === state.player.currentSegmentId
  );
  const riskLevel = segment?.riskLevel ?? 0;

  if (!segment || riskLevel <= 0) {
    state.lastRiskSegmentId = null;
    return;
  }

  state.score += RW.riskScorePerSecond * riskLevel * getScoreGainFactor(state) * dt;

  if (state.lastRiskSegmentId !== segment.id) {
    state.lastRiskSegmentId = segment.id;
    const label =
      segment.riskLabel ??
      (riskLevel >= 3 ? "EXTREME LINE" : riskLevel === 2 ? "RISK LINE" : "HIGH LINE");
    setRouteFeedback(state, `${label} +${Math.round(RW.riskScorePerSecond * riskLevel)}/s`);
  }
}

function hitRectCircle(
  playerX: number,
  playerY: number,
  itemX: number,
  itemY: number,
  radius: number
): boolean {
  const hitW = P.width / 2 + radius;
  const hitH = P.height / 2 + radius;
  return Math.abs(itemX - playerX) < hitW && Math.abs(itemY - playerY) < hitH;
}

function awardRewardScore(state: GameState, baseValue: number): void {
  state.score += Math.round(baseValue * getScoreGainFactor(state));
}

function activateScoreSurge(state: GameState): void {
  state.scoreSurgeActive = true;
  state.scoreSurgeTimer = Math.max(state.scoreSurgeTimer, SS.scoreSurgeDuration);
  state.scoreSurgeFlash = Math.max(state.scoreSurgeFlash, SS.flashDuration);
  setRouteFeedback(state, `SCORE SURGE x${SS.scoreSurgeMultiplier}`);
}

function setRouteFeedback(state: GameState, text: string): void {
  state.routeFeedbackText = text;
  state.routeFeedbackTimer = RW.feedbackDuration;
}
