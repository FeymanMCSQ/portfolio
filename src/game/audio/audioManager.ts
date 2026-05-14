import { GAME_CONFIG } from "../config/gameConfig";
import type { AudioEventName } from "../core/types";

type SoundId = AudioEventName | "acceleration";

interface PlayOptions {
  volume?: number;
  playbackRate?: number;
  delayMs?: number;
}

interface LoopState {
  audio: HTMLAudioElement;
  targetVolume: number;
  fadeId: number | null;
}

const STORAGE_KEY = "runtimeRush.audio.muted.v1";
const SFX_BASE = "/sfx";

const SOUND_FILES: Record<SoundId, string> = {
  acceleration: "acceleration.mp3",
  blast_collect: "blast_collect.mp3",
  blast_use: "blast_use.mp3",
  collectible: "collectible.mp3",
  crash: "crash.mp3",
  deceleration: "deceleration.mp3",
  fall: "fall.mp3",
  game_over: "game_over.mp3",
  hard_landing: "hard_landing.mp3",
  high_score: "high_score.mp3",
  jump: "jump.mp3",
  landing: "landing.mp3",
  obstacle_dissolve: "obstacle_dissolve.mp3",
  overclock_end: "overclock_end.mp3",
  overclock_start: "overclock_start.mp3",
  perfect_pump: "perfect_pump.mp3",
  pump: "pump.mp3",
  ring_pass: "ring_pass.mp3",
  scenery_shift: "scenery_shift.mp3",
  score_surge: "score_surge.mp3",
};

class AudioManager {
  private readonly registry = new Map<SoundId, HTMLAudioElement>();
  private readonly unavailable = new Set<SoundId>();
  private readonly loops = new Map<SoundId, LoopState>();
  private unlocked = false;
  private muted = false;

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.muted = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      this.muted = false;
    }
    this.registerAll();
    const unlock = () => this.unlock();
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  }

  preloadAll(): void {
    for (const audio of this.registry.values()) {
      audio.load();
    }
  }

  play(id: SoundId, options: PlayOptions = {}): void {
    if (!this.canPlay(id)) return;

    const run = () => {
      if (!this.canPlay(id)) return;
      const base = this.registry.get(id);
      if (!base) return;

      const audio = base.cloneNode(true) as HTMLAudioElement;
      audio.volume = this.resolveVolume(id, options.volume);
      audio.playbackRate = options.playbackRate ?? 1;
      audio.play().catch(() => {
        this.unavailable.add(id);
      });
    };

    if (options.delayMs && options.delayMs > 0) {
      window.setTimeout(run, options.delayMs);
    } else {
      run();
    }
  }

  startLoop(id: SoundId, options: PlayOptions = {}): void {
    if (!this.canPlay(id)) return;

    const targetVolume = this.resolveVolume(id, options.volume);
    const existing = this.loops.get(id);
    if (existing) {
      existing.targetVolume = targetVolume;
      this.fadeLoop(existing, targetVolume, GAME_CONFIG.audio.accelerationFadeSeconds);
      return;
    }

    const base = this.registry.get(id);
    if (!base) return;

    const audio = base.cloneNode(true) as HTMLAudioElement;
    audio.loop = true;
    audio.volume = 0;
    audio.playbackRate = options.playbackRate ?? 1;
    const loop: LoopState = { audio, targetVolume, fadeId: null };
    this.loops.set(id, loop);

    audio.play()
      .then(() => this.fadeLoop(loop, targetVolume, GAME_CONFIG.audio.accelerationFadeSeconds))
      .catch(() => {
        this.loops.delete(id);
        this.unavailable.add(id);
      });
  }

  stopLoop(id: SoundId, fadeSeconds = GAME_CONFIG.audio.accelerationFadeSeconds): void {
    const loop = this.loops.get(id);
    if (!loop) return;

    this.fadeLoop(loop, 0, fadeSeconds, () => {
      loop.audio.pause();
      loop.audio.currentTime = 0;
      this.loops.delete(id);
    });
  }

  stopAllLoops(): void {
    for (const id of Array.from(this.loops.keys())) {
      this.stopLoop(id, 0.06);
    }
  }

  setMuted(nextMuted: boolean): void {
    this.muted = nextMuted;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, nextMuted ? "1" : "0");
      } catch {
        // Storage may be unavailable in private or restricted contexts.
      }
    }
    if (nextMuted) this.stopAllLoops();
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  unlock(): void {
    this.unlocked = true;
  }

  private registerAll(): void {
    for (const [id, file] of Object.entries(SOUND_FILES) as [SoundId, string][]) {
      const audio = new Audio(`${SFX_BASE}/${file}`);
      audio.preload = "auto";
      audio.addEventListener("error", () => {
        this.unavailable.add(id);
      });
      this.registry.set(id, audio);
    }
  }

  private canPlay(id: SoundId): boolean {
    return Boolean(
      typeof window !== "undefined" &&
      this.unlocked &&
      !this.muted &&
      !this.unavailable.has(id) &&
      this.registry.has(id)
    );
  }

  private resolveVolume(id: SoundId, override?: number): number {
    const base = override ?? GAME_CONFIG.audio.volumes[id];
    return Math.max(0, Math.min(1, base * GAME_CONFIG.audio.masterVolume));
  }

  private fadeLoop(
    loop: LoopState,
    targetVolume: number,
    seconds: number,
    onDone?: () => void
  ): void {
    if (loop.fadeId !== null) window.clearInterval(loop.fadeId);

    if (seconds <= 0) {
      loop.audio.volume = targetVolume;
      onDone?.();
      return;
    }

    const startVolume = loop.audio.volume;
    const startAt = performance.now();
    const durationMs = seconds * 1000;

    loop.fadeId = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startAt) / durationMs);
      loop.audio.volume = startVolume + (targetVolume - startVolume) * t;
      if (t >= 1 && loop.fadeId !== null) {
        window.clearInterval(loop.fadeId);
        loop.fadeId = null;
        onDone?.();
      }
    }, 16);
  }
}

export const audioManager = new AudioManager();
