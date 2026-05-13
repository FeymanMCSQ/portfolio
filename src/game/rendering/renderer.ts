import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState, Shockwave, TerrainSegment } from "../core/types";
import { sampleTerrainAt } from "../systems/terrainSystem";

const { canvas: CV, player: P, world: W, jump: J, overclock: OC, focus: FC, patchPulse: PP } = GAME_CONFIG;
const VIEW_TOP = 64;
const VIEW_BOTTOM = CV.height - 34;

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  ctx.clearRect(0, 0, CV.width, CV.height);
  drawBackground(ctx);
  drawOverclockEdge(ctx, state);    // atmospheric edge glow — behind grid
  drawFocusEdge(ctx, state);        // amber vignette during focus — behind grid
  drawParallaxGrid(ctx, state);
  drawTerrain(ctx, state);
  drawProgressMarkers(ctx, state);
  drawSpeedLines(ctx, state);
  drawTokens(ctx, state);           // overclock tokens behind player
  drawPatchTokens(ctx, state);      // patch pulse tokens behind player
  drawShockwaves(ctx, state);       // ground shockwaves
  drawPlayerShadow(ctx, state);
  drawPlayer(ctx, state);
  drawLandingRing(ctx, state);
  drawHUD(ctx, state);
  drawNearMissPopup(ctx, state);
  drawControlsHint(ctx, state);
  drawOverclockFlash(ctx, state);   // full-screen flash — topmost game layer
  if (state.phase === "gameOver") drawGameOverOverlay(ctx, state);
}

// ─── Background ──────────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#08080f";
  ctx.fillRect(0, 0, CV.width, CV.height);
}

// ─── Parallax grid ───────────────────────────────────────────────────────────

function drawParallaxGrid(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  for (let layer = 0; layer < 3; layer++) {
    const spacing = W.gridSpacings[layer];
    const offset = (state.worldOffset * W.gridSpeeds[layer]) % spacing;

    ctx.strokeStyle = `rgba(50, 70, 180, ${W.gridOpacities[layer]})`;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = CV.width - offset; x > -spacing; x -= spacing) {
      ctx.moveTo(x, VIEW_TOP);
      ctx.lineTo(x, VIEW_BOTTOM);
    }
    ctx.stroke();
  }
}

// ─── Terrain ─────────────────────────────────────────────────────────────────

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  for (const segment of state.terrainSegments) {
    drawTerrainSegment(ctx, state, segment);
  }
}

function drawTerrainSegment(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  segment: TerrainSegment
): void {
  const x1 = segment.startX - state.worldOffset;
  const x2 = segment.endX - state.worldOffset;
  if (x2 < -80 || x1 > CV.width + 80) return;
  if (segment.type === "gap") {
    drawGapEdges(ctx, x1, x2, segment.startY, segment.endY);
    return;
  }

  ctx.fillStyle = "rgba(28, 36, 54, 0.92)";
  ctx.beginPath();
  ctx.moveTo(x1, segment.startY);
  ctx.lineTo(x2, segment.endY);
  ctx.lineTo(x2, CV.height);
  ctx.lineTo(x1, CV.height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = segment.type === "small-ramp"
    ? "rgba(100, 230, 255, 0.95)"
    : "rgba(105, 145, 220, 0.92)";
  ctx.lineWidth = segment.type === "small-ramp" ? 5 : 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, segment.startY);
  ctx.lineTo(x2, segment.endY);
  ctx.stroke();
  ctx.lineCap = "butt";

  if (segment.obstacle) {
    drawTerrainObstacle(ctx, state, segment);
  }
}

function drawGapEdges(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y1: number,
  y2: number
): void {
  ctx.strokeStyle = "rgba(255, 160, 70, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1, y1 + 34);
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2, y2 + 34);
  ctx.stroke();
}

function drawTerrainObstacle(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  segment: TerrainSegment
): void {
  if (!segment.obstacle) return;

  const { obstacle } = segment;
  const t = (obstacle.worldX - segment.startX) / (segment.endX - segment.startX);
  const surfaceY = segment.startY + (segment.endY - segment.startY) * t;
  const angle = Math.atan2(segment.endY - segment.startY, segment.endX - segment.startX);
  const screenX = obstacle.worldX - state.worldOffset;

  ctx.save();
  ctx.translate(screenX, surfaceY);
  ctx.rotate(angle);
  ctx.fillStyle = "rgba(255, 80, 40, 0.92)";
  ctx.fillRect(-obstacle.width / 2, -obstacle.height, obstacle.width, obstacle.height);
  ctx.strokeStyle = "rgba(255, 210, 160, 0.75)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-obstacle.width / 2, -obstacle.height, obstacle.width, obstacle.height);
  ctx.restore();
}

// ─── Progress markers ────────────────────────────────────────────────────────

function drawProgressMarkers(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const { bestScoreDistance, lastDistance } = state.progress;
  if (
    bestScoreDistance > 0 &&
    lastDistance > 0 &&
    Math.abs(bestScoreDistance - lastDistance) < 1
  ) {
    drawDistanceMarker(
      ctx,
      state,
      bestScoreDistance,
      "LAST/BEST",
      "rgba(255, 220, 90, 0.9)"
    );
    return;
  }

  drawDistanceMarker(
    ctx,
    state,
    bestScoreDistance,
    "BEST SCORE",
    "rgba(255, 220, 90, 0.9)"
  );
  drawDistanceMarker(
    ctx,
    state,
    lastDistance,
    "LAST",
    "rgba(120, 190, 255, 0.85)"
  );
}

function drawDistanceMarker(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  distance: number,
  label: string,
  color: string
): void {
  if (distance <= 0) return;

  const markerWorldX = P.startX + distance;
  const screenX = markerWorldX - state.worldOffset;
  if (screenX < -40 || screenX > CV.width + 40) return;

  const surface = sampleTerrainAt(state.terrainSegments, markerWorldX);
  const markerBottom = surface.hasSurface ? surface.y : VIEW_BOTTOM;
  const markerTop = Math.max(VIEW_TOP + 18, markerBottom - 86);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(screenX, markerTop);
  ctx.lineTo(screenX, markerBottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = color;
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${label} ${Math.round(distance)}m`, screenX, markerTop - 6);
  ctx.restore();
}

// ─── Speed lines ─────────────────────────────────────────────────────────────

const SPEED_LINE_COUNT = 18;
const SPEED_LINE_SLOTS = Array.from({ length: SPEED_LINE_COUNT }, (_, i) => ({
  tY: i / (SPEED_LINE_COUNT - 1),
  phase: (i * 53.7) % 1,
  thickEvery: i % 4 === 0,
}));

function drawSpeedLines(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const speedRatio = state.player.speed / P.maxSpeed;
  if (speedRatio < 0.12) return;

  const intensity = Math.min((speedRatio - 0.12) / 0.6, 1);
  const visibleCount = Math.floor(intensity * SPEED_LINE_COUNT);
  const trackTop = VIEW_TOP + 8;
  const trackHeight = VIEW_BOTTOM - VIEW_TOP - 48;

  for (let i = 0; i < visibleCount; i++) {
    const slot = SPEED_LINE_SLOTS[i];
    const y = trackTop + slot.tY * trackHeight;
    const len = 25 + intensity * 110;
    const scrollSpeed = 0.9 + (i % 5) * 0.06;
    const totalScroll =
      (state.worldOffset * scrollSpeed + slot.phase * (CV.width + len)) %
      (CV.width + len);
    const x = CV.width - totalScroll + len;

    if (x < -len || x > CV.width + len) continue;

    const alpha = intensity * 0.38 * (0.55 + 0.45 * slot.tY);
    ctx.strokeStyle = `rgba(120, 165, 255, ${alpha})`;
    ctx.lineWidth = slot.thickEvery ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len, y);
    ctx.stroke();
  }
}

// ─── Player shadow ───────────────────────────────────────────────────────────

function drawPlayerShadow(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const { x, surfaceY, jumpHeight, isGrounded } = state.player;
  if (isGrounded || jumpHeight <= 0) return;

  const heightFactor = Math.max(0.08, 1 - jumpHeight / 220);

  ctx.save();
  ctx.translate(x, surfaceY);
  ctx.scale(heightFactor, 0.28);
  ctx.beginPath();
  ctx.ellipse(0, 0, P.width * 0.55, P.height * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0, 0, 12, ${0.55 * heightFactor})`;
  ctx.fill();
  ctx.restore();
}

// ─── Player ───────────────────────────────────────────────────────────────────

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const { x, y, speed, groundAngle, jumpVelocity, isGrounded, landingTimer } =
    state.player;
  const speedRatio = speed / P.maxSpeed;

  const canvasY = y;

  let squashX = 1.0;
  let squashY = 1.0;

  if (!isGrounded) {
    if (jumpVelocity > 0) {
      const velFactor = Math.min(jumpVelocity / J.baseVelocity, 1);
      squashY = 1 + velFactor * 0.2;
      squashX = 1 - velFactor * 0.08;
    }
  } else if (landingTimer < J.landingSquashDuration) {
    const t = landingTimer / J.landingSquashDuration;
    const eased = 1 - (1 - t) * (1 - t);
    squashY = 0.62 + 0.38 * eased;
    squashX = 1.38 - 0.38 * eased;
  }

  const leanAngle = isGrounded ? groundAngle : 0;
  const stretchX = 1 + speedRatio * 0.18;

  const r = Math.round(80 + speedRatio * 175);
  const g = Math.round(145 - speedRatio * 95);
  const b = Math.round(255 - speedRatio * 80);

  ctx.save();
  ctx.translate(x, canvasY);
  ctx.rotate(leanAngle);
  ctx.scale(stretchX * squashX, squashY);

  const trailLen = speedRatio * 72;
  if (trailLen > 6) {
    const grad = ctx.createLinearGradient(-trailLen, 0, 0, 0);
    grad.addColorStop(0, "rgba(70, 110, 255, 0)");
    grad.addColorStop(0.6, `rgba(70, 110, 255, ${speedRatio * 0.25})`);
    grad.addColorStop(1, `rgba(70, 110, 255, ${speedRatio * 0.45})`);
    ctx.fillStyle = grad;
    ctx.fillRect(-trailLen, -P.height / 2, trailLen, P.height);
  }

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(-P.width / 2, -P.height / 2, P.width, P.height);

  if (speedRatio > 0.58) {
    const glowAlpha = (speedRatio - 0.58) / 0.42;
    ctx.shadowColor = `rgba(${r},${g},${b},0.85)`;
    ctx.shadowBlur = 14 * glowAlpha;
    ctx.fillRect(-P.width / 2, -P.height / 2, P.width, P.height);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(P.width / 2, 0);
  ctx.lineTo(P.width / 2 - 8, -4);
  ctx.lineTo(P.width / 2 - 8, 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ─── Landing ring ─────────────────────────────────────────────────────────────

function drawLandingRing(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const { x, surfaceY, isGrounded, landingTimer } = state.player;
  if (!isGrounded || landingTimer >= J.landingSquashDuration) return;

  const t = landingTimer / J.landingSquashDuration;
  const radius = t * 48;
  const alpha = (1 - t) * 0.7;

  ctx.strokeStyle = `rgba(140, 190, 255, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, surfaceY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

// ─── HUD ─────────────────────────────────────────────────────────────────────

function fmtScore(n: number): string {
  const s = Math.round(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { speed, distanceTraveled, isGrounded, jumpHeight } = state.player;
  const speedRatio = speed / P.maxSpeed;

  // ── Left column ──────────────────────────────────────────────────────────

  // Score — hero element
  ctx.fillStyle = "rgba(255, 240, 180, 0.95)";
  ctx.font = "bold 20px monospace";
  ctx.fillText(fmtScore(state.score), 18, 24);

  // Distance + persistent bests
  ctx.fillStyle = "rgba(100, 120, 170, 0.7)";
  ctx.font = "10px monospace";
  ctx.fillText(`${Math.round(distanceTraveled)} m`, 18, 38);
  ctx.fillStyle = "rgba(255, 220, 90, 0.75)";
  ctx.fillText(`BEST ${fmtScore(state.progress.bestScore)}`, 18, 53);
  ctx.fillStyle = "rgba(120, 190, 255, 0.65)";
  ctx.fillText(`BEST DIST ${Math.round(state.progress.bestDistance)}m`, 18, 67);

  // Airborne height (dev aid)
  if (!isGrounded) {
    ctx.fillStyle = "rgba(160, 210, 255, 0.6)";
    ctx.font = "10px monospace";
    ctx.fillText(`↑ ${Math.round(jumpHeight)} px`, 18, 96);
  }

  // Focus meter
  const focusBarX = 18;
  const focusBarY = 86;
  const focusBarW = 110;
  const focusBarH = 4;
  const focusFull = state.focusMeter >= 1;
  const focusActivePulse = state.focusActive
    ? 0.75 + 0.25 * Math.sin(state.timeElapsed * 5)
    : 1;

  ctx.fillStyle = "rgba(20, 20, 40, 0.7)";
  ctx.fillRect(focusBarX - 1, focusBarY - 1, focusBarW + 2, focusBarH + 2);

  const focusColor = state.focusActive
    ? `rgba(255, 160, 20, ${0.95 * focusActivePulse})`
    : focusFull
    ? "rgba(255, 200, 60, 0.95)"
    : "rgba(200, 130, 20, 0.75)";
  ctx.fillStyle = focusColor;
  ctx.fillRect(focusBarX, focusBarY, focusBarW * state.focusMeter, focusBarH);

  if (focusFull && !state.focusActive) {
    ctx.save();
    ctx.shadowColor = "rgba(255, 200, 40, 0.8)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgba(255, 210, 60, 0.95)";
    ctx.fillRect(focusBarX, focusBarY, focusBarW, focusBarH);
    ctx.restore();
  }

  const focusLabel = state.focusActive
    ? `FOCUS  ${(state.focusMeter / FC.drainRate).toFixed(1)}s`
    : focusFull
    ? "FOCUS  SHIFT"
    : "FOCUS";
  ctx.fillStyle = focusFull || state.focusActive
    ? "rgba(255, 195, 50, 0.9)"
    : "rgba(160, 120, 50, 0.7)";
  ctx.font = "10px monospace";
  ctx.fillText(focusLabel, focusBarX, focusBarY - 4);

  // Patch armed indicator
  if (state.patchArmed) {
    const pulse = 0.7 + 0.3 * Math.sin(state.timeElapsed * 4.5);
    ctx.save();
    ctx.shadowColor = "rgba(60, 255, 120, 0.7)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = `rgba(80, 255, 140, ${0.9 * pulse})`;
    ctx.font = "10px monospace";
    ctx.fillText("PATCH  LAND TO FIRE", focusBarX, focusBarY + 18);
    ctx.restore();
  }

  // ── Right column ─────────────────────────────────────────────────────────

  // Speed bar
  const barW = 150;
  const barH = 6;
  const barX = CV.width - barW - 20;
  const barY = 18;

  ctx.fillStyle = "rgba(20, 20, 40, 0.7)";
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

  ctx.fillStyle =
    speedRatio > 0.82 ? `rgb(255,${Math.round(80 - speedRatio * 40)},60)` :
    speedRatio > 0.5  ? `rgb(255,${Math.round(170 - speedRatio * 80)},40)` :
                        "rgb(80,130,255)";
  ctx.fillRect(barX, barY, barW * speedRatio, barH);

  ctx.fillStyle = "rgba(140, 150, 190, 0.65)";
  ctx.font = "10px monospace";
  ctx.fillText("SPEED", barX, barY - 5);
  ctx.fillText(`${Math.round(speed)} / ${P.maxSpeed}`, barX + barW - 55, barY - 5);

  // Multiplier badge — cyan during overclock, normal colors otherwise
  const mult = state.multiplier;
  const effectiveMult = state.overclockActive ? mult * OC.scoreMultiplier : mult;

  const [multBg, multFg, multGlow]: [string, string, string | null] = state.overclockActive
    ? ["rgba(0,200,255,0.18)", "rgba(0,230,255,1)", "rgba(0,200,255,0.7)"]
    : mult === 4 ? ["rgba(255,40,20,0.22)",  "rgba(255,90,60,1)",   "rgba(255,50,20,0.7)"]
    : mult === 3 ? ["rgba(255,150,0,0.18)",  "rgba(255,190,50,1)",  "rgba(255,140,0,0.5)"]
    : mult === 2 ? ["rgba(50,200,100,0.15)", "rgba(100,230,140,1)", null]
    :              ["rgba(60,80,120,0.12)",  "rgba(100,120,170,0.7)", null];

  const badgeX = CV.width - 68;
  const badgeY = 35;
  const badgeW = 52;
  const badgeH = 26;

  ctx.fillStyle = multBg;
  ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  ctx.strokeStyle = multFg.replace(/[\d.]+\)$/, "0.4)");
  ctx.lineWidth = 1;
  ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

  if (multGlow) {
    ctx.save();
    ctx.shadowColor = multGlow;
    ctx.shadowBlur = state.overclockActive ? 16 : 10;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
    ctx.restore();
  }

  ctx.fillStyle = multFg;
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`×${effectiveMult}`, badgeX + badgeW / 2, badgeY + badgeH - 6);
  ctx.textAlign = "left";

  // Overclock bar — replaces / supplements combo when active
  if (state.overclockActive) {
    const ratio = state.overclockTimer / OC.duration;
    const ocBarX = badgeX - 4;
    const ocBarW = badgeW + 8;
    const ocBarY = badgeY + badgeH + 5;
    const ocBarH = 4;
    const nearEnd = state.overclockTimer < 1.5;
    const pulse = nearEnd ? 0.55 + 0.45 * Math.sin(state.timeElapsed * 14) : 1;

    ctx.fillStyle = "rgba(0, 20, 30, 0.8)";
    ctx.fillRect(ocBarX - 1, ocBarY - 1, ocBarW + 2, ocBarH + 2);

    ctx.fillStyle = nearEnd
      ? `rgba(255, 100, 40, ${0.9 * pulse})`
      : "rgba(0, 220, 255, 0.9)";
    ctx.fillRect(ocBarX, ocBarY, ocBarW * ratio, ocBarH);

    ctx.fillStyle = nearEnd ? "rgba(255, 140, 80, 0.85)" : "rgba(0, 210, 255, 0.7)";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`OVERCLOCK  ${state.overclockTimer.toFixed(1)}s`, badgeX + badgeW / 2, ocBarY + ocBarH + 10);
    ctx.textAlign = "left";
  } else if (state.combo > 0) {
    ctx.fillStyle = "rgba(200, 220, 255, 0.75)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${state.combo} COMBO`, badgeX + badgeW / 2, badgeY + badgeH + 14);
    ctx.textAlign = "left";
  }
}

// ─── Near-miss popup ─────────────────────────────────────────────────────────

function drawNearMissPopup(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.nearMissTimer <= 0) return;

  const t = state.nearMissTimer / 1.2; // 1.0 → 0
  const alpha = t > 0.35 ? 0.95 : (t / 0.35) * 0.95;
  const popY = 90 - (1 - t) * 22; // drifts up as it fades

  ctx.save();
  ctx.textAlign = "center";

  // Points
  ctx.fillStyle = `rgba(255, 240, 120, ${alpha})`;
  ctx.font = "bold 22px monospace";
  ctx.fillText(`+${fmtScore(state.nearMissPoints)}`, CV.width / 2, popY);

  // Label
  const label = state.combo > 1 ? `NEAR MISS  ×${state.combo} COMBO` : "NEAR MISS";
  ctx.fillStyle = `rgba(200, 210, 255, ${alpha * 0.85})`;
  ctx.font = "11px monospace";
  ctx.fillText(label, CV.width / 2, popY + 16);

  ctx.restore();
}

// ─── Controls hint ───────────────────────────────────────────────────────────

function drawControlsHint(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  if (state.timeElapsed > 6) return;

  const alpha = Math.max(0, 1 - state.timeElapsed / 5);
  ctx.fillStyle = `rgba(110, 130, 175, ${alpha})`;
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    "↑/W accelerate    SPACE jump    SHIFT focus",
    CV.width / 2,
    CV.height - 22
  );
  ctx.textAlign = "left";
}

// ─── Overclock token ─────────────────────────────────────────────────────────

function drawTokens(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const token of state.tokens) {
    const screenX = token.worldX - state.worldOffset;
    if (screenX + OC.tokenRadius < 0 || screenX - OC.tokenRadius > CV.width) continue;
    drawToken(ctx, screenX, token.y, state.timeElapsed);
  }
}

function drawToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number
): void {
  const pulse = 0.82 + 0.18 * Math.sin(t * 5.5);

  ctx.save();
  ctx.translate(x, y);

  // Outer glow
  ctx.save();
  ctx.shadowColor = "rgba(0, 220, 255, 0.9)";
  ctx.shadowBlur = 22 * pulse;
  ctx.strokeStyle = `rgba(0, 220, 255, ${0.85 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 13 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Second ring — slower pulse, offset phase
  const pulse2 = 0.7 + 0.3 * Math.sin(t * 5.5 + 1.2);
  ctx.strokeStyle = `rgba(180, 240, 255, ${0.45 * pulse2})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 20 * pulse2, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating inner diamond
  ctx.save();
  ctx.rotate(t * 1.8);
  ctx.fillStyle = "rgba(0, 230, 255, 0.95)";
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(7, 0);
  ctx.lineTo(0, 7);
  ctx.lineTo(-7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bright core
  ctx.fillStyle = "rgba(200, 248, 255, 0.95)";
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Patch Pulse token ───────────────────────────────────────────────────────

function drawPatchTokens(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const token of state.patchTokens) {
    const screenX = token.worldX - state.worldOffset;
    if (screenX + PP.tokenRadius < 0 || screenX - PP.tokenRadius > CV.width) continue;
    drawPatchToken(ctx, screenX, token.y, state.timeElapsed);
  }
}

function drawPatchToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number
): void {
  const pulse = 0.82 + 0.18 * Math.sin(t * 4.8);

  ctx.save();
  ctx.translate(x, y);

  // Outer glow ring
  ctx.save();
  ctx.shadowColor = "rgba(60, 255, 120, 0.9)";
  ctx.shadowBlur = 20 * pulse;
  ctx.strokeStyle = `rgba(60, 255, 120, ${0.85 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 13 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Second faint ring
  const pulse2 = 0.7 + 0.3 * Math.sin(t * 4.8 + 1.4);
  ctx.strokeStyle = `rgba(140, 255, 180, ${0.4 * pulse2})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 20 * pulse2, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating cross
  ctx.save();
  ctx.rotate(t * 1.2);
  ctx.fillStyle = "rgba(60, 255, 120, 0.95)";
  ctx.fillRect(-2, -7, 4, 14);
  ctx.fillRect(-7, -2, 14, 4);
  ctx.restore();

  // Core dot
  ctx.fillStyle = "rgba(200, 255, 220, 0.95)";
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Shockwave ───────────────────────────────────────────────────────────────

function drawShockwaves(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const sw of state.shockwaves) {
    drawShockwave(ctx, state, sw);
  }
}

function drawShockwave(ctx: CanvasRenderingContext2D, state: GameState, sw: Shockwave): void {
  const t = sw.timer / sw.duration;          // 0 → 1
  const radius = sw.maxRadius * t;
  const alpha = (1 - t) * 0.85;
  const screenX = sw.worldX - state.worldOffset;

  ctx.save();
  ctx.translate(screenX, sw.y);

  // Flatten to look like a ground-level ring
  ctx.scale(1, 0.22);

  ctx.save();
  ctx.shadowColor = `rgba(60, 255, 120, ${alpha * 0.8})`;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = `rgba(80, 255, 130, ${alpha})`;
  ctx.lineWidth = 3 * (1 - t) + 1;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Second trailing ring slightly behind
  const radius2 = sw.maxRadius * Math.max(0, t - 0.12);
  if (radius2 > 0) {
    ctx.strokeStyle = `rgba(160, 255, 200, ${alpha * 0.45})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Overclock edge glow ─────────────────────────────────────────────────────

function drawOverclockEdge(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.overclockActive) return;

  const ratio = state.overclockTimer / OC.duration;
  const nearEnd = state.overclockTimer < 1.5;
  const pulse = nearEnd ? 0.5 + 0.5 * Math.sin(state.timeElapsed * 14) : 1;
  const intensity = ratio * 0.45 * pulse;

  const color = nearEnd
    ? `rgba(255, 120, 40, ${intensity})`
    : `rgba(0, 220, 255, ${intensity})`;
  const trans = "rgba(0, 0, 0, 0)";
  const depth = 55;

  let g = ctx.createLinearGradient(0, 0, 0, depth);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CV.width, depth);

  g = ctx.createLinearGradient(0, CV.height, 0, CV.height - depth);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(0, CV.height - depth, CV.width, depth);

  g = ctx.createLinearGradient(0, 0, depth, 0);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, depth, CV.height);

  g = ctx.createLinearGradient(CV.width, 0, CV.width - depth, 0);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(CV.width - depth, 0, depth, CV.height);
}

// ─── Focus edge glow ─────────────────────────────────────────────────────────

function drawFocusEdge(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.focusActive) return;

  const breathe = 0.75 + 0.25 * Math.sin(state.timeElapsed * 2.5);
  const intensity = 0.38 * breathe;
  const color = `rgba(255, 170, 20, ${intensity})`;
  const trans = "rgba(0, 0, 0, 0)";
  const depth = 60;

  let g = ctx.createLinearGradient(0, 0, 0, depth);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CV.width, depth);

  g = ctx.createLinearGradient(0, CV.height, 0, CV.height - depth);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(0, CV.height - depth, CV.width, depth);

  g = ctx.createLinearGradient(0, 0, depth, 0);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, depth, CV.height);

  g = ctx.createLinearGradient(CV.width, 0, CV.width - depth, 0);
  g.addColorStop(0, color); g.addColorStop(1, trans);
  ctx.fillStyle = g;
  ctx.fillRect(CV.width - depth, 0, depth, CV.height);
}

// ─── Overclock screen flash ───────────────────────────────────────────────────

function drawOverclockFlash(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.overclockFlash <= 0) return;
  const alpha = (state.overclockFlash / OC.flashDuration) * 0.38;
  ctx.fillStyle = `rgba(0, 220, 255, ${alpha})`;
  ctx.fillRect(0, 0, CV.width, CV.height);
}

// ─── Game Over overlay ───────────────────────────────────────────────────────

function drawGameOverOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = "rgba(0, 0, 8, 0.75)";
  ctx.fillRect(0, 0, CV.width, CV.height);

  const cx = CV.width / 2;
  const cy = CV.height / 2;

  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(255, 60, 30, 0.95)";
  ctx.font = "bold 44px monospace";
  ctx.fillText("GAME OVER", cx, cy - 28);

  ctx.fillStyle = "rgba(255, 240, 160, 0.9)";
  ctx.font = "bold 24px monospace";
  ctx.fillText(fmtScore(state.score), cx, cy + 10);

  ctx.fillStyle = "rgba(160, 190, 255, 0.75)";
  ctx.font = "13px monospace";
  ctx.fillText(`${Math.round(state.player.distanceTraveled)} m`, cx, cy + 34);

  ctx.fillStyle = "rgba(180, 100, 80, 0.75)";
  ctx.font = "13px monospace";
  ctx.fillText("R  -  try again", cx, cy + 56);

  ctx.textAlign = "left";
}
