import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState } from "../core/types";
import type { InputState } from "../systems/inputManager";
import { audioManager } from "./audioManager";

const P = GAME_CONFIG.player;
const AU = GAME_CONFIG.audio;

let wasAccelerating = false;
let decelCooldown = 0;
let collectibleCooldown = 0;
let dissolveCooldown = 0;
let sceneryShiftCooldown = 0;

export function initializeAudio(): void {
  audioManager.preloadAll();
}

export function updateAudioSystem(
  state: GameState,
  input: InputState,
  dt: number,
  mutePressed: boolean
): void {
  if (mutePressed) audioManager.toggleMuted();
  state.audioMuted = audioManager.isMuted();

  decelCooldown = Math.max(0, decelCooldown - dt);
  collectibleCooldown = Math.max(0, collectibleCooldown - dt);
  dissolveCooldown = Math.max(0, dissolveCooldown - dt);
  sceneryShiftCooldown = Math.max(0, sceneryShiftCooldown - dt);

  updateAccelerationLoop(state, input);
  drainAudioEvents(state);
  updateGameplayMusic(state);
}

export function isAudioMuted(): boolean {
  return audioManager.isMuted();
}

export function shutdownAudio(): void {
  audioManager.stopAllLoops();
  audioManager.stopMusic(0.08, false);
}

function updateAccelerationLoop(state: GameState, input: InputState): void {
  const speedRatio = state.player.speed / P.maxSpeed;
  const shouldLoop =
    state.phase === "playing" &&
    input.accelerating &&
    speedRatio < 0.985 &&
    state.player.speed > 4;

  if (shouldLoop) {
    audioManager.startLoop("acceleration", {
      volume: AU.volumes.acceleration * (0.35 + speedRatio * 0.65),
      playbackRate: 0.92 + speedRatio * 0.18,
    });
  } else {
    audioManager.stopLoop("acceleration");
  }

  if (
    wasAccelerating &&
    !input.accelerating &&
    state.player.speed > AU.speedThresholdForDecel &&
    decelCooldown <= 0 &&
    state.phase === "playing"
  ) {
    audioManager.play("deceleration", {
      playbackRate: 0.95 + Math.min(speedRatio, 1) * 0.12,
    });
    decelCooldown = AU.decelerationCooldown;
  }

  wasAccelerating = input.accelerating;
}

function drainAudioEvents(state: GameState): void {
  if (state.audioEvents.length === 0) return;

  const events = state.audioEvents.splice(0);
  const suppressSceneryShift = events.includes("crash") || events.includes("game_over");
  let sceneryShiftPlayed = false;

  for (const event of events) {
    switch (event) {
      case "collectible":
        if (collectibleCooldown > 0) break;
        audioManager.play("collectible", { playbackRate: randomRate(0.94, 1.08) });
        collectibleCooldown = AU.collectibleCooldown;
        break;
      case "obstacle_dissolve":
        if (dissolveCooldown > 0) break;
        audioManager.play("obstacle_dissolve", {
          playbackRate: randomRate(0.92, 1.12),
        });
        dissolveCooldown = AU.obstacleDissolveCooldown;
        break;
      case "crash":
        audioManager.stopLoop("acceleration", 0.04);
        audioManager.duckMusic();
        audioManager.play("crash");
        break;
      case "game_over":
        audioManager.stopLoop("acceleration", 0.04);
        audioManager.duckMusic();
        audioManager.play("game_over", { delayMs: 240 });
        break;
      case "high_score":
        audioManager.duckMusic(AU.musicDuckHoldSeconds + 0.55);
        audioManager.play("high_score", { delayMs: 520 });
        break;
      case "blast_use":
        audioManager.duckMusic();
        audioManager.play("blast_use");
        break;
      case "perfect_pump":
        audioManager.play("perfect_pump");
        break;
      case "scenery_shift":
        if (suppressSceneryShift || sceneryShiftPlayed || sceneryShiftCooldown > 0) break;
        audioManager.play("scenery_shift");
        sceneryShiftPlayed = true;
        sceneryShiftCooldown = AU.sceneryShiftCooldown;
        break;
      default:
        audioManager.play(event);
        break;
    }
  }
}

function updateGameplayMusic(state: GameState): void {
  const pageHidden = typeof document !== "undefined" && document.hidden;
  if (state.phase === "playing" && !pageHidden) {
    audioManager.startMusic("gameplay", GAME_CONFIG.audio.musicFadeInSeconds);
    return;
  }

  if (state.phase === "playing" && pageHidden) {
    audioManager.pauseMusic(GAME_CONFIG.audio.musicPauseFadeSeconds);
    return;
  }

  audioManager.stopMusic(GAME_CONFIG.audio.musicFadeOutSeconds, true);
}

function randomRate(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
