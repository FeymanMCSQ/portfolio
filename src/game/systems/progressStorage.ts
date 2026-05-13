import type { GameState, ProgressState } from "../core/types";

const STORAGE_KEY = "runtimeRush.progress.v1";

const EMPTY_PROGRESS: ProgressState = {
  lastDistance: 0,
  bestDistance: 0,
  bestScore: 0,
  bestScoreDistance: 0,
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return { ...EMPTY_PROGRESS };

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...EMPTY_PROGRESS };

  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const bestScore = cleanNumber(parsed.bestScore);
    const bestDistance = cleanNumber(parsed.bestDistance);
    const savedBestScoreDistance = cleanNumber(parsed.bestScoreDistance);
    return {
      lastDistance: cleanNumber(parsed.lastDistance),
      bestDistance,
      bestScore,
      bestScoreDistance: savedBestScoreDistance || (bestScore > 0 ? bestDistance : 0),
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function recordRunProgress(state: GameState): ProgressState {
  const distance = Math.max(0, Math.round(state.player.distanceTraveled));
  const score = Math.max(0, Math.round(state.score));
  const previous = state.progress;
  const isBestScoreRun = score > previous.bestScore;
  const next: ProgressState = {
    lastDistance: distance,
    bestDistance: Math.max(previous.bestDistance, distance),
    bestScore: Math.max(previous.bestScore, score),
    bestScoreDistance: isBestScoreRun ? distance : previous.bestScoreDistance,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

function cleanNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}
