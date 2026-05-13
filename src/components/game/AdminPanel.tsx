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

type SliderKey =
  | PlayerKey
  | TerrainKey
  | JumpKey
  | ScoringKey
  | OverclockKey
  | FocusKey
  | PatchPulseKey;

type ConfigTarget = "player" | "terrain" | "jump" | "scoring" | "overclock" | "focus" | "patchPulse";
type AdminMode = "local" | "global";
type AllValues = Record<SliderKey, number>;

interface SliderDef {
  key: SliderKey;
  target: ConfigTarget;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

interface Section {
  title: string;
  summary: string;
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

const ALL_DEFAULTS: AllValues = {
  ...PLAYER_DEFAULTS,
  ...TERRAIN_DEFAULTS,
  ...JUMP_DEFAULTS,
  ...SCORING_DEFAULTS,
  ...OVERCLOCK_DEFAULTS,
  ...FOCUS_DEFAULTS,
  ...PATCH_PULSE_DEFAULTS,
};

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    title: "Forward",
    summary: "Ground speed, acceleration, and coast-down feel.",
    sliders: [
      { key: "acceleration", target: "player", label: "Acceleration", min: 50, max: 600, step: 5, format: (v) => String(v) },
      { key: "friction", target: "player", label: "Friction", min: 0.9, max: 0.998, step: 0.001, format: (v) => v.toFixed(3) },
      { key: "maxSpeed", target: "player", label: "Max Speed", min: 200, max: 1200, step: 10, format: (v) => `${v} px/s` },
    ],
  },
  {
    title: "Terrain",
    summary: "Track height changes, gaps, ramps, and obstacle size.",
    sliders: [
      { key: "slopeHeight", target: "terrain", label: "Slope Height", min: 20, max: 140, step: 5, format: (v) => `${v} px` },
      { key: "rampLaunchVelocity", target: "terrain", label: "Ramp Launch", min: 250, max: 850, step: 10, format: (v) => `${v} px/s` },
      { key: "gapLength", target: "terrain", label: "Gap Length", min: 80, max: 340, step: 10, format: (v) => `${v} px` },
      { key: "obstacleHeight", target: "terrain", label: "Block Height", min: 20, max: 90, step: 5, format: (v) => `${v} px` },
    ],
  },
  {
    title: "Jump",
    summary: "Air arc, gravity, and speed-based jump scaling.",
    sliders: [
      { key: "baseVelocity", target: "jump", label: "Base Velocity", min: 150, max: 800, step: 10, format: (v) => `${v} px/s` },
      { key: "speedBonus", target: "jump", label: "Speed Bonus", min: 0, max: 500, step: 10, format: (v) => `+${v} px/s` },
      { key: "gravity", target: "jump", label: "Gravity", min: 300, max: 2500, step: 25, format: (v) => `${v} px/s²` },
      { key: "airControlMultiplier", target: "jump", label: "Air Control", min: 0.2, max: 1.0, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    ],
  },
  {
    title: "Overclock",
    summary: "Cyan token timing and temporary speed/score boost.",
    sliders: [
      { key: "duration", target: "overclock", label: "Duration", min: 2, max: 12, step: 0.5, format: (v) => `${v} s` },
      { key: "speedMultiplier", target: "overclock", label: "Speed Cap", min: 1.2, max: 4.0, step: 0.1, format: (v) => `×${v.toFixed(1)}` },
      { key: "scoreMultiplier", target: "overclock", label: "Score", min: 1, max: 6, step: 1, format: (v) => `×${v}` },
      { key: "tokenSpacing", target: "overclock", label: "Token Gap", min: 1200, max: 7000, step: 100, format: (v) => `${v} px` },
    ],
  },
  {
    title: "Patch Pulse",
    summary: "Green token shockwave radius and animation timing.",
    sliders: [
      { key: "shockwaveBaseRadius", target: "patchPulse", label: "Wave Radius", min: 40, max: 250, step: 5, format: (v) => `${v} px` },
      { key: "shockwaveRadiusBonus", target: "patchPulse", label: "Speed Bonus", min: 0, max: 300, step: 10, format: (v) => `+${v} px` },
      { key: "shockwaveDuration", target: "patchPulse", label: "Wave Duration", min: 0.2, max: 1.0, step: 0.05, format: (v) => `${v.toFixed(2)} s` },
    ],
  },
  {
    title: "Focus",
    summary: "Slow-motion charge, drain, and time scale.",
    sliders: [
      { key: "fillRate", target: "focus", label: "Fill Rate", min: 0.04, max: 0.40, step: 0.01, format: (v) => `${v.toFixed(2)}/s` },
      { key: "drainRate", target: "focus", label: "Drain Rate", min: 0.10, max: 0.60, step: 0.01, format: (v) => `${v.toFixed(2)}/s` },
      { key: "timeScale", target: "focus", label: "Time Scale", min: 0.20, max: 0.80, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
    ],
  },
  {
    title: "Scoring",
    summary: "Distance points, near-miss value, combo timing, and speed tiers.",
    sliders: [
      { key: "pointsPerPx", target: "scoring", label: "Points / px", min: 0.02, max: 0.5, step: 0.01, format: (v) => v.toFixed(2) },
      { key: "nearMissBonus", target: "scoring", label: "Near-miss Base", min: 10, max: 200, step: 5, format: (v) => String(v) },
      { key: "nearMissObstacleClearance", target: "scoring", label: "Clearance", min: 8, max: 90, step: 2, format: (v) => `${v} px` },
      { key: "comboTimeout", target: "scoring", label: "Combo Timeout", min: 1, max: 12, step: 0.5, format: (v) => `${v} s` },
      { key: "tier2", target: "scoring", label: "x2 Threshold", min: 0.1, max: 0.6, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
      { key: "tier3", target: "scoring", label: "x3 Threshold", min: 0.3, max: 0.85, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
      { key: "tier4", target: "scoring", label: "x4 Threshold", min: 0.6, max: 0.98, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    ],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  toggleBtn: {
    position: "absolute" as const,
    bottom: 12,
    right: 12,
    width: 34,
    height: 34,
    border: "1px solid rgba(120,150,255,0.55)",
    color: "#9bb2ff",
    fontSize: 16,
    cursor: "pointer",
    borderRadius: 4,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 20,
    lineHeight: "1" as const,
  },
  backdrop: {
    position: "fixed" as const,
    inset: 0,
    zIndex: 1000,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    background: "rgba(1, 2, 8, 0.68)",
    padding: 18,
  },
  panel: {
    width: "min(1120px, calc(100vw - 36px))",
    height: "min(780px, calc(100vh - 36px))",
    background: "rgba(7, 8, 20, 0.98)",
    border: "1px solid rgba(100,130,255,0.55)",
    color: "#c8d4f0",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 12,
    boxShadow: "0 14px 60px rgba(20,40,130,0.42)",
    display: "flex" as const,
    flexDirection: "column" as const,
  },
  header: {
    display: "grid" as const,
    gridTemplateColumns: "1fr auto",
    gap: 12,
    padding: "16px 18px 14px",
    borderBottom: "1px solid rgba(70,95,190,0.45)",
    background: "rgba(16,24,72,0.58)",
  },
  title: {
    color: "#8fa7ff",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.09em",
    textTransform: "uppercase" as const,
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(170,185,225,0.68)",
    lineHeight: 1.4,
  },
  toolbar: {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: 8,
    flexWrap: "wrap" as const,
    justifyContent: "flex-end" as const,
  },
  actionBtn: {
    border: "1px solid rgba(100,130,255,0.45)",
    background: "rgba(20,28,72,0.85)",
    color: "#b8c6ff",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Courier New', Courier, monospace",
    letterSpacing: "0.05em",
    padding: "8px 10px",
    borderRadius: 4,
  },
  activeBtn: {
    border: "1px solid rgba(130,160,255,0.9)",
    background: "rgba(75,105,255,0.32)",
    color: "#ffffff",
  },
  dangerBtn: {
    border: "1px solid rgba(255,130,100,0.48)",
    color: "#ffc0a8",
  },
  closeBtn: {
    width: 32,
    padding: "8px 0",
  },
  body: {
    overflow: "auto" as const,
    padding: 18,
  },
  sectionGrid: {
    display: "grid" as const,
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 14,
  },
  section: {
    border: "1px solid rgba(55,75,150,0.65)",
    background: "rgba(10,14,34,0.82)",
  },
  sectionHead: {
    padding: "10px 12px 9px",
    borderBottom: "1px solid rgba(55,75,150,0.5)",
    background: "rgba(20,28,66,0.58)",
  },
  sectionTitle: {
    color: "#7f99ff",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
  sectionSummary: {
    marginTop: 4,
    color: "rgba(145,160,205,0.7)",
    fontSize: 11,
    lineHeight: 1.35,
  },
  row: {
    display: "grid" as const,
    gridTemplateColumns: "122px 1fr 82px",
    alignItems: "center" as const,
    gap: 10,
    padding: "9px 12px",
    borderBottom: "1px solid rgba(28,42,90,0.58)",
  },
  label: {
    color: "#9aa9c8",
    whiteSpace: "nowrap" as const,
    fontSize: 11,
  },
  value: {
    color: "#9eb4ff",
    textAlign: "right" as const,
    whiteSpace: "nowrap" as const,
    fontSize: 11,
    fontVariantNumeric: "tabular-nums" as const,
  },
  footer: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    gap: 12,
    borderTop: "1px solid rgba(70,95,190,0.35)",
    padding: "10px 18px",
    color: "rgba(135,150,195,0.75)",
    fontSize: 11,
    background: "rgba(5,7,18,0.9)",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AdminMode>("local");
  const [values, setValues] = useState<AllValues>({ ...ALL_DEFAULTS });
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("Local settings apply to this running session only.");

  useEffect(() => {
    const h = window.location.hostname;
    setIsLocalhost(h === "localhost" || h === "127.0.0.1");
  }, []);

  useEffect(() => {
    if (!open || mode !== "global" || !dirty) return;

    const timer = window.setTimeout(() => {
      void saveGlobal(values);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [dirty, mode, open, values]);

  const saveGlobal = useCallback(async (nextValues: AllValues) => {
    setStatus("Saving global settings to gameConfig.ts...");

    try {
      const res = await fetch("/api/game-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: toConfigPatch(nextValues) }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Save failed with ${res.status}`);
      }

      setDirty(false);
      setStatus("Global settings saved to src/game/config/gameConfig.ts.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Global save failed.");
    }
  }, []);

  const setLocalMode = useCallback(() => {
    setMode("local");
    setDirty(false);
    setStatus("Local settings apply to this running session only.");
  }, []);

  const setGlobalMode = useCallback(() => {
    setMode("global");
    setDirty(true);
    setStatus("Global settings write to src/game/config/gameConfig.ts in dev.");
  }, []);

  const handleChange = useCallback(
    (slider: SliderDef, raw: string) => {
      const n = parseFloat(raw);
      if (!Number.isFinite(n)) return;

      setValues((prev) => {
        const next = { ...prev, [slider.key]: n };
        applyValuesToRuntime(next);
        return next;
      });

      if (mode === "global") {
        setDirty(true);
        setStatus("Global settings changed. Saving...");
      } else {
        setStatus("Local settings changed for this session.");
      }
    },
    [mode]
  );

  const reset = useCallback(() => {
    const next = { ...ALL_DEFAULTS };
    setValues(next);
    applyValuesToRuntime(next);

    if (mode === "global") {
      setDirty(true);
      void saveGlobal(next);
    } else {
      setDirty(false);
      setStatus("Local settings reset to the loaded defaults.");
    }
  }, [mode, saveGlobal]);

  if (!isLocalhost) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Master controls"
        style={{
          ...S.toggleBtn,
          background: open ? "rgba(75,105,255,0.32)" : "rgba(10,10,24,0.88)",
        }}
      >
        ⚙
      </button>

      {open && (
        <div style={S.backdrop}>
          <div style={S.panel}>
            <div style={S.header}>
              <div>
                <div style={S.title}>Master Controls</div>
                <div style={S.subtitle}>
                  Local tuning changes this run only. Global tuning saves the current values into the source config file during local development.
                </div>
              </div>

              <div style={S.toolbar}>
                <button
                  type="button"
                  onClick={setLocalMode}
                  style={{
                    ...S.actionBtn,
                    ...(mode === "local" ? S.activeBtn : {}),
                  }}
                >
                  LOCAL SETTINGS
                </button>
                <button
                  type="button"
                  onClick={setGlobalMode}
                  style={{
                    ...S.actionBtn,
                    ...(mode === "global" ? S.activeBtn : {}),
                  }}
                >
                  GLOBAL SETTINGS
                </button>
                <button
                  type="button"
                  onClick={reset}
                  style={{ ...S.actionBtn, ...S.dangerBtn }}
                >
                  RESET DEFAULT
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ ...S.actionBtn, ...S.closeBtn }}
                  title="Close controls"
                >
                  X
                </button>
              </div>
            </div>

            <div style={S.body}>
              <div style={S.sectionGrid}>
                {SECTIONS.map((section) => (
                  <section key={section.title} style={S.section}>
                    <div style={S.sectionHead}>
                      <div style={S.sectionTitle}>{section.title}</div>
                      <div style={S.sectionSummary}>{section.summary}</div>
                    </div>

                    {section.sliders.map((slider) => (
                      <div key={`${slider.target}.${slider.key}`} style={S.row}>
                        <label htmlFor={`adm-${slider.target}-${slider.key}`} style={S.label}>
                          {slider.label}
                        </label>
                        <input
                          id={`adm-${slider.target}-${slider.key}`}
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          step={slider.step}
                          value={values[slider.key]}
                          onChange={(e) => handleChange(slider, e.target.value)}
                          style={{
                            width: "100%",
                            accentColor: mode === "global" ? "#f5b85e" : "#6f84ff",
                            cursor: "pointer",
                          }}
                        />
                        <span style={S.value}>{slider.format(values[slider.key])}</span>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            </div>

            <div style={S.footer}>
              <span>{status}</span>
              <span>{mode === "global" ? "GLOBAL MODE" : "LOCAL MODE"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function applyValuesToRuntime(values: AllValues): void {
  for (const section of SECTIONS) {
    for (const slider of section.sliders) {
      const target = getRuntimeTarget(slider.target);
      target[slider.key] = values[slider.key];
    }
  }
}

function getRuntimeTarget(target: ConfigTarget): Record<string, number> {
  switch (target) {
    case "player":
      return GAME_CONFIG.player as Record<string, number>;
    case "terrain":
      return GAME_CONFIG.terrain as Record<string, number>;
    case "jump":
      return GAME_CONFIG.jump as Record<string, number>;
    case "scoring":
      return GAME_CONFIG.scoring as Record<string, number>;
    case "overclock":
      return GAME_CONFIG.overclock as Record<string, number>;
    case "patchPulse":
      return GAME_CONFIG.patchPulse as Record<string, number>;
    case "focus":
      return GAME_CONFIG.focus as Record<string, number>;
  }
}

function toConfigPatch(values: AllValues): Record<ConfigTarget, Record<string, number>> {
  const patch: Record<ConfigTarget, Record<string, number>> = {
    player: {},
    terrain: {},
    jump: {},
    scoring: {},
    overclock: {},
    focus: {},
    patchPulse: {},
  };

  for (const section of SECTIONS) {
    for (const slider of section.sliders) {
      patch[slider.target][slider.key] = values[slider.key];
    }
  }

  return patch;
}
