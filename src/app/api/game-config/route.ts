import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const CONFIG_PATH = path.join(process.cwd(), "src/game/config/gameConfig.ts");

const WRITABLE_KEYS: Record<string, string[]> = {
  player: ["acceleration", "friction", "maxSpeed"],
  terrain: ["slopeHeight", "rampLaunchVelocity", "gapLength", "obstacleHeight"],
  jump: ["baseVelocity", "speedBonus", "gravity", "airControlMultiplier"],
  scoring: [
    "pointsPerPx",
    "nearMissBonus",
    "nearMissObstacleClearance",
    "comboTimeout",
    "tier2",
    "tier3",
    "tier4",
  ],
  overclock: ["duration", "speedMultiplier", "scoreMultiplier", "tokenSpacing"],
  scoreSurge: ["scoreSurgeMultiplier", "scoreSurgeDuration"],
  rewards: ["riskScorePerSecond", "ringBonus"],
  focus: ["fillRate", "drainRate", "timeScale"],
  patchPulse: ["shockwaveBaseRadius", "shockwaveRadiusBonus", "shockwaveDuration"],
  pump: ["landingWindow", "cooldown", "duration"],
};

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Global game config writes are disabled in production." },
      { status: 403 }
    );
  }

  const host = req.headers.get("host") ?? "";
  if (!host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    return NextResponse.json(
      { error: "Global game config writes are localhost-only." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const values = body?.values;
  if (!values || typeof values !== "object") {
    return NextResponse.json({ error: "Missing config values." }, { status: 400 });
  }

  let source = await readFile(CONFIG_PATH, "utf8");

  for (const [section, keys] of Object.entries(WRITABLE_KEYS)) {
    const sectionValues = values[section];
    if (!sectionValues || typeof sectionValues !== "object") continue;

    for (const key of keys) {
      const value = sectionValues[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }

      source = replaceNumericProperty(source, section, key, value);
    }
  }

  await writeFile(CONFIG_PATH, source, "utf8");
  return NextResponse.json({ ok: true });
}

function replaceNumericProperty(
  source: string,
  section: string,
  key: string,
  value: number
): string {
  const block = findObjectBlock(source, section);
  if (!block) {
    throw new Error(`Could not find config section "${section}".`);
  }

  const nextValue = formatNumber(value);
  const before = source.slice(0, block.start);
  const current = source.slice(block.start, block.end);
  const after = source.slice(block.end);
  const pattern = new RegExp(`(\\n\\s*${escapeRegExp(key)}:\\s*)([-+]?\\d+(?:\\.\\d+)?)(\\s*,?)`);
  if (!pattern.test(current)) {
    throw new Error(`Could not find config key "${section}.${key}".`);
  }

  const next = current.replace(pattern, `$1${nextValue}$3`);

  return `${before}${next}${after}`;
}

function findObjectBlock(
  source: string,
  section: string
): { start: number; end: number } | null {
  const marker = `${section}: {`;
  const start = source.indexOf(marker);
  if (start === -1) return null;

  const openBrace = source.indexOf("{", start);
  if (openBrace === -1) return null;

  let depth = 0;
  for (let i = openBrace; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return { start, end: i + 1 };
      }
    }
  }

  return null;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
