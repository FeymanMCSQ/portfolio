"use client";

import { useState, useEffect, useCallback } from "react";
import { GAME_CONFIG } from "@/game/config/gameConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlayerKey =
  | "acceleration"
  | "friction"
  | "maxSpeed";

type TerrainKey =
  | "slopeHeight"
  | "rampLaunchVelocity"
  | "gapLength"
  | "obstacleHeight";

type JumpKey =
  | "baseVelocity"
  | "speedBonus"
  | "gravity"
  | "airControlMultiplier";

type ScoringKey =
  | "pointsPerPx"
  | "nearMissBonus"
  | "nearMissObstacleClearance"
  | "comboTimeout"
  | "tier2"
  | "tier3"
  | "tier4";

type OverclockKey =
  | "duration"
  | "speedMultiplier"
  | "scoreMultiplier"
  | "tokenSpacing";

type FocusKey =
  | "fillRate"
  | "drainRate"
  | "timeScale";

type PatchPulseKey =
  | "shockwaveBaseRadius"
  | "shockwaveRadiusBonus"
  | "shockwaveDuration";

type ConfigTarget = "player" | "terrain" | "jump" | "scoring" | "overclock" | "focus" | "patchPulse";

interface SliderDef {
  key: PlayerKey | TerrainKey | JumpKey | ScoringKey | OverclockKey | FocusKey | PatchPulseKey;
  target: ConfigTarget;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

interface Section {
  title: string;
  sliders: SliderDef[];
}

// ─── Defaults (captured before any runtime mutations) ────────────────────────

const PLAYER_DEFAULTS: Record<PlayerKey, number> = {
  acceleration: GAME_CONFIG.player.acceleration,
  friction: GAME_CONFIG.player.friction,
  maxSpeed: GAME_CONFIG.player.maxSpeed,
};

const TERRAIN_DEFAULTS: Record<TerrainKey, number> = {
  slopeHeight: GAME_CONFIG.terrain.slopeHeight,
  rampLaunchVelocity: GAME_CONFIG.terrain.rampLaunchVelocity,
  gapLength: GAME_CONFIG.terrain.gapLength,
  obstacleHeight: GAME_CONFIG.terrain.obstacleHeight,
};

const JUMP_DEFAULTS: Record<JumpKey, number> = {
  baseVelocity: GAME_CONFIG.jump.baseVelocity,
  speedBonus: GAME_CONFIG.jump.speedBonus,
  gravity: GAME_CONFIG.jump.gravity,
  airControlMultiplier: GAME_CONFIG.jump.airControlMultiplier,
};

const OVERCLOCK_DEFAULTS: Record<OverclockKey, number> = {
  duration: GAME_CONFIG.overclock.duration,
  speedMultiplier: GAME_CONFIG.overclock.speedMultiplier,
  scoreMultiplier: GAME_CONFIG.overclock.scoreMultiplier,
  tokenSpacing: GAME_CONFIG.overclock.tokenSpacing,
};

const FOCUS_DEFAULTS: Record<FocusKey, number> = {
  fillRate: GAME_CONFIG.focus.fillRate,
  drainRate: GAME_CONFIG.focus.drainRate,
  timeScale: GAME_CONFIG.focus.timeScale,
};

const PATCH_PULSE_DEFAULTS: Record<PatchPulseKey, number> = {
  shockwaveBaseRadius: GAME_CONFIG.patchPulse.shockwaveBaseRadius,
  shockwaveRadiusBonus: GAME_CONFIG.patchPulse.shockwaveRadiusBonus,
  shockwaveDuration: GAME_CONFIG.patchPulse.shockwaveDuration,
};

const SCORING_DEFAULTS: Record<ScoringKey, number> = {
  pointsPerPx: GAME_CONFIG.scoring.pointsPerPx,
  nearMissBonus: GAME_CONFIG.scoring.nearMissBonus,
  nearMissObstacleClearance: GAME_CONFIG.scoring.nearMissObstacleClearance,
  comboTimeout: GAME_CONFIG.scoring.comboTimeout,
  tier2: GAME_CONFIG.scoring.tier2,
  tier3: GAME_CONFIG.scoring.tier3,
  tier4: GAME_CONFIG.scoring.tier4,
};

type AllValues = Record<PlayerKey | TerrainKey | JumpKey | ScoringKey | OverclockKey | FocusKey | PatchPulseKey, number>;

const ALL_DEFAULTS: AllValues = { ...PLAYER_DEFAULTS, ...TERRAIN_DEFAULTS, ...JUMP_DEFAULTS, ...SCORING_DEFAULTS, ...OVERCLOCK_DEFAULTS, ...FOCUS_DEFAULTS, ...PATCH_PULSE_DEFAULTS };

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    title: "FORWARD",
    sliders: [
      { key: "acceleration", target: "player", label: "Acceleration",    min: 50,   max: 600,   step: 5,     format: (v) => String(v) },
      { key: "friction",     target: "player", label: "Friction (decay)", min: 0.9,  max: 0.998, step: 0.001, format: (v) => v.toFixed(3) },
      { key: "maxSpeed",     target: "player", label: "Max Speed",        min: 200,  max: 1200,  step: 10,    format: (v) => `${v} px/s` },
    ],
  },
  {
    title: "TERRAIN",
    sliders: [
      { key: "slopeHeight",        target: "terrain", label: "Slope Height", min: 20,  max: 140, step: 5,  format: (v) => `${v} px` },
      { key: "rampLaunchVelocity", target: "terrain", label: "Ramp Launch",  min: 250, max: 850, step: 10, format: (v) => `${v} px/s` },
      { key: "gapLength",          target: "terrain", label: "Gap Length",   min: 80,  max: 340, step: 10, format: (v) => `${v} px` },
      { key: "obstacleHeight",     target: "terrain", label: "Block Height", min: 20,  max: 90,  step: 5,  format: (v) => `${v} px` },
    ],
  },
  {
    title: "JUMP",
    sliders: [
      { key: "baseVelocity",         target: "jump", label: "Base Velocity",   min: 150, max: 800,  step: 10,   format: (v) => `${v} px/s` },
      { key: "speedBonus",           target: "jump", label: "Speed Bonus",     min: 0,   max: 500,  step: 10,   format: (v) => `+${v} px/s` },
      { key: "gravity",              target: "jump", label: "Gravity",         min: 300, max: 2500, step: 25,   format: (v) => `${v} px/s²` },
      { key: "airControlMultiplier", target: "jump", label: "Air Control",     min: 0.2, max: 1.0,  step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    ],
  },
  {
    title: "OVERCLOCK",
    sliders: [
      { key: "duration",          target: "overclock", label: "Duration",        min: 2,    max: 12,   step: 0.5, format: (v) => `${v} s` },
      { key: "speedMultiplier",   target: "overclock", label: "Speed Cap ×",     min: 1.2,  max: 4.0,  step: 0.1, format: (v) => `×${v.toFixed(1)}` },
      { key: "scoreMultiplier",   target: "overclock", label: "Score ×",         min: 1,    max: 6,    step: 1,   format: (v) => `×${v}` },
      { key: "tokenSpacing",      target: "overclock", label: "Token Gap",       min: 1200, max: 7000, step: 100, format: (v) => `${v} px` },
    ],
  },
  {
    title: "PATCH PULSE",
    sliders: [
      { key: "shockwaveBaseRadius", target: "patchPulse", label: "Wave Radius",     min: 40,  max: 250, step: 5,    format: (v) => `${v} px` },
      { key: "shockwaveRadiusBonus",target: "patchPulse", label: "Speed Bonus",     min: 0,   max: 300, step: 10,   format: (v) => `+${v} px` },
      { key: "shockwaveDuration",   target: "patchPulse", label: "Wave Duration",   min: 0.2, max: 1.0, step: 0.05, format: (v) => `${v.toFixed(2)} s` },
    ],
  },
  {
    title: "FOCUS",
    sliders: [
      { key: "fillRate",  target: "focus", label: "Fill Rate",   min: 0.04, max: 0.40, step: 0.01, format: (v) => `${v.toFixed(2)}/s` },
      { key: "drainRate", target: "focus", label: "Drain Rate",  min: 0.10, max: 0.60, step: 0.01, format: (v) => `${v.toFixed(2)}/s` },
      { key: "timeScale", target: "focus", label: "Time Scale",  min: 0.20, max: 0.80, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
    ],
  },
  {
    title: "SCORING",
    sliders: [
      { key: "pointsPerPx",        target: "scoring", label: "Pts / px",       min: 0.02, max: 0.5,  step: 0.01, format: (v) => v.toFixed(2) },
      { key: "nearMissBonus",      target: "scoring", label: "Near-miss Base", min: 10,   max: 200,  step: 5,    format: (v) => String(v) },
      { key: "nearMissObstacleClearance", target: "scoring", label: "Clearance", min: 8,   max: 90,   step: 2,    format: (v) => `${v} px` },
      { key: "comboTimeout",       target: "scoring", label: "Combo Timeout",  min: 1,    max: 12,   step: 0.5,  format: (v) => `${v} s` },
      { key: "tier2",              target: "scoring", label: "×2 Threshold",   min: 0.1,  max: 0.6,  step: 0.05, format: (v) => `${Math.round(v*100)}%` },
      { key: "tier3",              target: "scoring", label: "×3 Threshold",   min: 0.3,  max: 0.85, step: 0.05, format: (v) => `${Math.round(v*100)}%` },
      { key: "tier4",              target: "scoring", label: "×4 Threshold",   min: 0.6,  max: 0.98, step: 0.02, format: (v) => `${Math.round(v*100)}%` },
    ],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  panel: {
    position: "absolute" as const,
    bottom: 52,
    right: 12,
    width: 310,
    background: "rgba(6,6,16,0.96)",
    border: "1px solid rgba(60,80,200,0.5)",
    color: "#c8d4f0",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 12,
    zIndex: 10,
    boxShadow: "0 4px 24px rgba(30,50,180,0.35)",
    maxHeight: "80vh",
    overflowY: "auto" as const,
  },
  header: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: "8px 12px",
    borderBottom: "1px solid rgba(60,80,200,0.35)",
    background: "rgba(16,24,72,0.6)",
    position: "sticky" as const,
    top: 0,
    zIndex: 1,
  },
  sectionTitle: {
    padding: "6px 12px 3px",
    color: "rgba(90,120,200,0.75)",
    fontSize: 10,
    letterSpacing: "0.14em",
    borderBottom: "1px solid rgba(30,50,140,0.3)",
  },
  row: {
    display: "grid" as const,
    gridTemplateColumns: "108px 1fr 72px",
    alignItems: "center" as const,
    gap: 8,
    padding: "5px 12px",
    borderBottom: "1px solid rgba(20,30,80,0.4)",
  },
  label: { color: "#7a8eaa", whiteSpace: "nowrap" as const, fontSize: 11 },
  value: {
    color: "#88aaff",
    textAlign: "right" as const,
    whiteSpace: "nowrap" as const,
    fontSize: 11,
    fontVariantNumeric: "tabular-nums" as const,
  },
  footer: {
    padding: "5px 12px",
    color: "rgba(60,80,130,0.65)",
    fontSize: 10,
    letterSpacing: "0.04em",
  },
  toggleBtn: {
    position: "absolute" as const,
    bottom: 12,
    right: 12,
    width: 30,
    height: 30,
    border: "1px solid rgba(70,100,220,0.4)",
    color: "#7799ee",
    fontSize: 15,
    cursor: "pointer",
    borderRadius: 3,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 20,
    lineHeight: "1" as const,
    transition: "background 0.15s",
  },
  resetBtn: {
    background: "none",
    border: "1px solid rgba(70,100,220,0.3)",
    color: "#6688bb",
    cursor: "pointer",
    fontSize: 10,
    fontFamily: "'Courier New', Courier, monospace",
    letterSpacing: "0.06em",
    padding: "2px 8px",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [isLocal, setIsLocal] = useState(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<AllValues>({ ...ALL_DEFAULTS });

  useEffect(() => {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") setIsLocal(true);
  }, []);

  const handleChange = useCallback(
    (key: PlayerKey | TerrainKey | JumpKey | ScoringKey | OverclockKey | FocusKey | PatchPulseKey, target: ConfigTarget, raw: string) => {
      const n = parseFloat(raw);
      if (isNaN(n)) return;
      setValues((prev) => ({ ...prev, [key]: n }));
      if (target === "player") {
        (GAME_CONFIG.player as Record<string, number>)[key] = n;
      } else if (target === "terrain") {
        (GAME_CONFIG.terrain as Record<string, number>)[key] = n;
      } else if (target === "jump") {
        (GAME_CONFIG.jump as Record<string, number>)[key] = n;
      } else if (target === "scoring") {
        (GAME_CONFIG.scoring as Record<string, number>)[key] = n;
      } else if (target === "overclock") {
        (GAME_CONFIG.overclock as Record<string, number>)[key] = n;
      } else if (target === "patchPulse") {
        (GAME_CONFIG.patchPulse as Record<string, number>)[key] = n;
      } else {
        (GAME_CONFIG.focus as Record<string, number>)[key] = n;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setValues({ ...ALL_DEFAULTS });
    Object.assign(GAME_CONFIG.player, PLAYER_DEFAULTS);
    Object.assign(GAME_CONFIG.terrain, TERRAIN_DEFAULTS);
    Object.assign(GAME_CONFIG.jump, JUMP_DEFAULTS);
    Object.assign(GAME_CONFIG.overclock, OVERCLOCK_DEFAULTS);
    Object.assign(GAME_CONFIG.scoring, SCORING_DEFAULTS);
    Object.assign(GAME_CONFIG.focus, FOCUS_DEFAULTS);
    Object.assign(GAME_CONFIG.patchPulse, PATCH_PULSE_DEFAULTS);
  }, []);

  if (!isLocal) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Admin controls (localhost only)"
        style={{
          ...S.toggleBtn,
          background: open ? "rgba(60,90,220,0.25)" : "rgba(10,10,24,0.85)",
        }}
      >
        ⚙
      </button>

      {open && (
        <div style={S.panel}>
          <div style={S.header}>
            <span style={{ color: "#5577ff", letterSpacing: "0.07em" }}>
              ⚙ ADMIN CONTROLS
            </span>
            <button style={S.resetBtn} onClick={reset}>
              RESET
            </button>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div style={S.sectionTitle}>{section.title}</div>
              {section.sliders.map((slider) => (
                <div key={slider.key} style={S.row}>
                  <label htmlFor={`adm-${slider.key}`} style={S.label}>
                    {slider.label}
                  </label>
                  <input
                    id={`adm-${slider.key}`}
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={values[slider.key]}
                    onChange={(e) =>
                      handleChange(slider.key, slider.target, e.target.value)
                    }
                    style={{ width: "100%", accentColor: "#5577ff", cursor: "pointer" }}
                  />
                  <span style={S.value}>{slider.format(values[slider.key])}</span>
                </div>
              ))}
            </div>
          ))}

          <div style={S.footer}>localhost only — hidden in production</div>
        </div>
      )}
    </>
  );
}
