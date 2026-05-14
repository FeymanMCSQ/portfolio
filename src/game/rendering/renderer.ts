import { GAME_CONFIG } from "../config/gameConfig";
import type { GameState, Shockwave, TerrainSegment } from "../core/types";
import { sampleTerrainAt } from "../systems/terrainSystem";

const { canvas: CV, player: P, world: W, jump: J, overclock: OC, focus: FC, patchPulse: PP, pump: PU } = GAME_CONFIG;
const VIEW_TOP = 64;
const VIEW_BOTTOM = CV.height - 34;

// ─── Visual constants ─────────────────────────────────────────────────────────

// Skateboard geometry — all values in player-local space, y=0 is hitbox centre
const BOARD = {
  deckW:   46,   // longer deck so wheels sit well inside nose/tail
  deckH:   4,
  deckTop: -7,   // top of deck above centre
  wheelR:  5,
  wheelY:  5,    // wheel centre below centre
  wheelFX: 13,   // front wheel — inside the nose
  wheelBX: -13,  // back wheel — inside the tail
};

// ─── Deterministic score-interval palette ────────────────────────────────────

interface Palette {
  skyTop: string; skyMid: string; skyHorizon: string; skyBottom: string;
  farFill: string; farRingStroke: string; midFill: string; nearFill: string;
  terrainBody: string; terrainEdge: string; terrainGlow: string;
  terrainRampEdge: string; terrainRampGlow: string; gapEdge: string;
  obstacleBody: string; obstacleTopStripe: string;
  obstacleEdge: string; obstacleShadow: string;
  obstacleGlowColor: string; obstacleCrossRgba: string;
  truckColor: string; deckColor: string; deckGlowColor: string;
  iridescentARgb: string; iridescentBRgb: string;
  wheelColor: string;
  accentRgb: string;   // "r,g,b" — for rgba() in trail / ring / landing particles
  bgTintRgb: string;   // "r,g,b" — for rgba() in speed lines / dust particles
}

function ihash(n: number): number {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b) | 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b) | 0;
  return (n ^ (n >>> 16)) >>> 0;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number): number => {
    const k = (n + h / 30) % 12;
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))) * 255);
  };
  return [f(0), f(8), f(4)];
}

function buildPalette(idx: number): Palette {
  const h0 = ihash(idx + 1);  // +1 avoids degenerate zero seed
  const h1 = ihash(h0);

  // Derive independent hue angles from hash bits
  const baseH    = (h0 & 0x1FF) / 512 * 360;
  const terrainH = (baseH + 150 + ((h0 >>> 9)  & 0x3F) / 64 * 60) % 360; // 150-210° away
  const accentH  = (baseH + 90  + ((h0 >>> 15) & 0x3F) / 64 * 90) % 360; // 90-180° away
  const obstH    = (baseH + 180 + ((h0 >>> 21) & 0x1F) / 32 * 60) % 360; // complementary ±30
  const bgTintH  = (baseH + 20  + (h1 & 0x3F)  / 64 * 40) % 360;

  const skyS = 20 + ((h1 >>> 6)  & 0x1F) / 32 * 25; // 20-45 %
  const skyL = 72 + ((h1 >>> 11) & 0x0F) / 16 * 12; // 72-84 %

  const hs  = (h: number, s: number, l: number) =>
    `hsl(${Math.round(((h % 360) + 360) % 360)},${Math.round(s)}%,${Math.round(l)}%)`;
  const hsa = (h: number, s: number, l: number, a: number) =>
    `hsla(${Math.round(((h % 360) + 360) % 360)},${Math.round(s)}%,${Math.round(l)}%,${a})`;

  const [ar, ag, ab] = hslToRgb(accentH, 78, 55);
  const [br, bg, bb] = hslToRgb(bgTintH, 40, 72);
  const iriA = hslToRgb(accentH, 100, 60);
  const iriB = hslToRgb((accentH + 180) % 360, 100, 55);

  return {
    skyTop:     hs(baseH,        skyS,      skyL),
    skyMid:     hs(baseH + 15,   skyS - 4,  skyL - 7),
    skyHorizon: hs(accentH,      skyS - 8,  skyL - 3),
    skyBottom:  hs(accentH + 15, skyS - 10, skyL - 5),

    farFill:       hsa(baseH,    28, 55, 0.50),
    farRingStroke: hsa(baseH,    22, 55, 0.28),
    midFill:       hsa(terrainH, 33, 42, 0.60),
    nearFill:      hsa(accentH,  28, 44, 0.70),

    terrainBody:     hs(terrainH,       38, 11),
    terrainEdge:     hs(accentH,        80, 56),
    terrainGlow:     hsa(accentH,       80, 56, 0.55),
    terrainRampEdge: hs(accentH + 15,   75, 62),
    terrainRampGlow: hsa(accentH + 15,  75, 62, 0.65),
    gapEdge:         hsa(obstH,         70, 60, 0.70),

    obstacleBody:      hs(obstH,       55, 48),
    obstacleTopStripe: hs(obstH + 20,  70, 60),
    obstacleEdge:      hs(obstH - 20,  50, 25),
    obstacleShadow:    hsa(obstH - 20, 50, 25, 0.55),
    obstacleGlowColor: hs(obstH,       60, 50),
    obstacleCrossRgba: hsa(obstH + 30, 80, 75, 0.52),

    truckColor:    hs(baseH,   18, 32),
    deckColor:     hs(baseH,   25, 12),
    deckGlowColor: hs(accentH, 90, 55),

    iridescentARgb: `${iriA[0]},${iriA[1]},${iriA[2]}`,
    iridescentBRgb: `${iriB[0]},${iriB[1]},${iriB[2]}`,
    wheelColor:     hs(baseH + 30, 20, 80),

    accentRgb: `${ar},${ag},${ab}`,
    bgTintRgb:  `${br},${bg},${bb}`,
  };
}

// ─── Renderer-local juice state (no GameState mutation) ───────────────────────

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;   // 1 → 0
  decay: number;  // per second
  r: number;
  kind: "landing" | "dust";
}

const _particles: Particle[] = [];
let _prevTimeElapsed = 0;
let _prevPhase       = "idle";
let _shakeTimer      = 0;
let _dustTimer       = 0;
let _cameraY         = 0;
let _palInterval     = -1;
let _pal: Palette    = buildPalette(0);
const _SHAKE_DUR      = 0.32;
const CAMERA_GROUND_Y = GAME_CONFIG.terrain.groundY;

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const dt = Math.max(0, Math.min(state.timeElapsed - _prevTimeElapsed, 0.05));
  _prevTimeElapsed = state.timeElapsed;

  if (state.phase === "gameOver" && _prevPhase !== "gameOver") _shakeTimer = _SHAKE_DUR;
  _prevPhase = state.phase;

  if (state.player.justLanded) spawnLandingParticles(state.player.x, state.player.surfaceY);

  if (state.player.isGrounded && state.player.speed / P.maxSpeed > 0.62) {
    _dustTimer -= dt;
    if (_dustTimer <= 0) {
      spawnDustParticle(state.player.x, state.player.surfaceY);
      _dustTimer = 0.09;
    }
  } else {
    _dustTimer = 0;
  }

  // Camera — stable terrain-aware vertical follow.
  // Anchors to surfaceY (terrain contact point) not player.y, so jump arcs and
  // landing impacts don't move the camera. A 500px lookahead sample shifts the
  // camera down before the player reaches a downhill section.
  // Lookahead only active while grounded — airborne, worldOffset still advances so
  // the 500px sample drifts across varying terrain heights every frame, which is the
  // source of mid-air camera wobble. surfaceY alone is stable during flight.
  let lowestY = state.player.surfaceY;
  if (state.player.isGrounded) {
    const playerWorldX = state.worldOffset + state.player.x;
    const sAhead       = sampleTerrainAt(state.terrainSegments, playerWorldX + 500);
    if (sAhead.hasSurface) lowestY = Math.max(lowestY, sAhead.y);
  }

  // On flat terrain (lowestY == CAMERA_GROUND_Y) → rawTarget == 0 → no camera movement.
  // When terrain drops below ground Y, rawTarget goes negative → camera shifts world up.
  const rawTarget     = CAMERA_GROUND_Y - lowestY;
  const clampedTarget = Math.max(-200, Math.min(60, rawTarget));

  const justDied      = state.phase === "gameOver" && _prevPhase !== "gameOver";
  const justRestarted = state.timeElapsed < _prevTimeElapsed;

  if (justDied || justRestarted) {
    _cameraY = clampedTarget;                               // snap on death / game restart
  } else if (state.phase === "playing") {
    const diff = clampedTarget - _cameraY;
    if (Math.abs(diff) > 12) {                             // dead zone — absorbs micro-bumps
      _cameraY += diff * Math.min(1, diff < 0 ? dt * 7 : dt * 2.5);
    }
  }

  // Palette — rebuild when score crosses a 20 000-point interval boundary
  const palInterval = Math.floor(state.score / 20000);
  if (palInterval !== _palInterval) {
    _palInterval = palInterval;
    _pal = buildPalette(palInterval);
  }

  ctx.clearRect(0, 0, CV.width, CV.height);
  drawBackground(ctx);
  drawBackgroundLayers(ctx, state);
  drawOverclockEdge(ctx, state);   // screen-space effects — no camera transform
  drawFocusEdge(ctx, state);

  ctx.save();
  if (_shakeTimer > 0) {
    _shakeTimer = Math.max(0, _shakeTimer - dt);
    const intensity = (_shakeTimer / _SHAKE_DUR) ** 2;
    ctx.translate((Math.random() * 2 - 1) * 7 * intensity, (Math.random() * 2 - 1) * 5 * intensity);
  }
  ctx.translate(0, _cameraY);
  drawTerrain(ctx, state);
  drawProgressMarkers(ctx, state);
  drawSpeedLines(ctx, state);
  drawTokens(ctx, state);
  drawPatchTokens(ctx, state);
  drawShockwaves(ctx, state);
  drawPlayerShadow(ctx, state);
  drawPlayer(ctx, state);
  drawPumpWindowBar(ctx, state);
  drawLandingRing(ctx, state);
  updateAndDrawParticles(ctx, dt);
  ctx.restore();

  drawHUD(ctx, state);
  drawNearMissPopup(ctx, state);
  drawControlsHint(ctx, state);
  drawOverclockFlash(ctx, state);
  if (state.phase === "gameOver") drawGameOverOverlay(ctx, state);
}

// ─── Background ──────────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const grad = ctx.createLinearGradient(0, 0, 0, CV.height);
  grad.addColorStop(0,    _pal.skyTop);
  grad.addColorStop(0.48, _pal.skyMid);
  grad.addColorStop(0.82, _pal.skyHorizon);
  grad.addColorStop(1,    _pal.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CV.width, CV.height);
}

// ─── Parallax background layers ──────────────────────────────────────────────

function drawBackgroundLayers(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  drawFarLayer(ctx, state.worldOffset);
  drawMidLayer(ctx, state.worldOffset);
  drawNearLayer(ctx, state.worldOffset);
}

// Waypoints for the far rolling-dune horizon — relative X within tile, absolute Y
const FAR_HILL_PTS: [number, number][] = [
  [0,    282], [220, 264], [480, 274], [720, 260],
  [950,  270], [1180, 258], [1420, 268], [1660, 262],
  [1900, 272], [2160, 260], [2400, 278],
];

function drawFarLayer(ctx: CanvasRenderingContext2D, worldOffset: number): void {
  const tileW   = 2400;
  const bgOff   = (worldOffset * 0.04) % tileW;

  for (let tx = -bgOff; tx < CV.width + tileW; tx += tileW) {
    ctx.fillStyle = _pal.farFill;

    // Rolling dune horizon — smooth polygon from hill crests down to canvas bottom
    ctx.beginPath();
    ctx.moveTo(tx - 2, CV.height);
    ctx.lineTo(tx + FAR_HILL_PTS[0][0], FAR_HILL_PTS[0][1]);
    for (let i = 1; i < FAR_HILL_PTS.length - 1; i++) {
      const [cx, cy] = FAR_HILL_PTS[i];
      const [nx, ny] = FAR_HILL_PTS[i + 1];
      ctx.quadraticCurveTo(tx + cx, cy, tx + (cx + nx) / 2, (cy + ny) / 2);
    }
    const sL = FAR_HILL_PTS[FAR_HILL_PTS.length - 2];
    const la = FAR_HILL_PTS[FAR_HILL_PTS.length - 1];
    ctx.quadraticCurveTo(tx + sL[0], sL[1], tx + la[0], la[1]);
    ctx.lineTo(tx + tileW + 2, CV.height);
    ctx.closePath();
    ctx.fill();

    // Obelisk A — narrow shaft + triangular peak
    ctx.fillRect(tx + 316, 218, 8, 56);
    ctx.beginPath();
    ctx.moveTo(tx + 320, 208);
    ctx.lineTo(tx + 316, 218);
    ctx.lineTo(tx + 324, 218);
    ctx.closePath();
    ctx.fill();

    // Obelisk B — thinner
    ctx.fillRect(tx + 1482, 224, 6, 48);
    ctx.beginPath();
    ctx.moveTo(tx + 1485, 215);
    ctx.lineTo(tx + 1482, 224);
    ctx.lineTo(tx + 1488, 224);
    ctx.closePath();
    ctx.fill();

    // Stepped distant monolith at right of tile
    ctx.fillRect(tx + 1822, 262, 42, 12);
    ctx.fillRect(tx + 1828, 251, 30, 11);
    ctx.fillRect(tx + 1834, 241, 18,  10);

    // Orbital ring — faint flattened ellipse high in sky
    ctx.strokeStyle = _pal.farRingStroke;
    ctx.lineWidth = 3;
    ctx.save();
    ctx.translate(tx + 840, 136);
    ctx.scale(1, 0.40);
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawMidLayer(ctx: CanvasRenderingContext2D, worldOffset: number): void {
  const tileW = 1800;
  const bgOff = (worldOffset * 0.15) % tileW;

  for (let tx = -bgOff; tx < CV.width + tileW; tx += tileW) {
    ctx.fillStyle = _pal.midFill;

    // Ruined arch — annular stone crown + two pillars
    const acx    = tx + 228;
    const aBaseY = 248;
    const aOuter = 34;
    const aInner = 22;
    ctx.beginPath();
    ctx.arc(acx, aBaseY, aOuter, Math.PI, 0);           // outer top half L→R
    ctx.lineTo(acx + aInner, aBaseY);
    ctx.arc(acx, aBaseY, aInner, 0, Math.PI, true);     // inner top half R→L
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(acx - aOuter, aBaseY, aOuter - aInner, 52); // left pillar
    ctx.fillRect(acx + aInner, aBaseY, aOuter - aInner, 52); // right pillar

    // Rounded tower
    ctx.fillRect(tx + 758, 200, 24, 98);
    ctx.beginPath();
    ctx.arc(tx + 770, 200, 12, Math.PI, 0);
    ctx.fill();

    // Floating sphere + small satellite
    ctx.beginPath();
    ctx.arc(tx + 518, 176, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx + 544, 163, 5, 0, Math.PI * 2);
    ctx.fill();

    // Broken horizontal wall slab
    ctx.fillRect(tx + 1342, 264, 80, 15);
    ctx.fillRect(tx + 1362, 256, 40,  8);

    // Distant pylon cluster — three thin columns
    ctx.fillRect(tx + 1642, 242, 10, 56);
    ctx.fillRect(tx + 1660, 252, 8,  46);
    ctx.fillRect(tx + 1676, 246, 10, 52);
  }
}

function drawNearLayer(ctx: CanvasRenderingContext2D, worldOffset: number): void {
  const tileW = 2000;
  const bgOff = (worldOffset * 0.28) % tileW;

  for (let tx = -bgOff; tx < CV.width + tileW; tx += tileW) {
    ctx.fillStyle = _pal.nearFill;

    // Organic rock formation (main)
    ctx.beginPath();
    ctx.moveTo(tx + 120, 308);
    ctx.bezierCurveTo(tx + 112, 272, tx + 148, 254, tx + 182, 258);
    ctx.bezierCurveTo(tx + 214, 252, tx + 246, 264, tx + 250, 282);
    ctx.bezierCurveTo(tx + 260, 296, tx + 252, 308, tx + 238, 308);
    ctx.closePath();
    ctx.fill();

    // Second rock peak overlapping the first
    ctx.beginPath();
    ctx.moveTo(tx + 200, 308);
    ctx.bezierCurveTo(tx + 196, 276, tx + 222, 260, tx + 248, 268);
    ctx.bezierCurveTo(tx + 268, 276, tx + 274, 295, tx + 270, 308);
    ctx.closePath();
    ctx.fill();

    // Ruined column with wider capital
    ctx.fillRect(tx + 862, 264, 16, 44);
    ctx.fillRect(tx + 856, 258, 28,  8);

    // Wide low terrain mound
    ctx.beginPath();
    ctx.moveTo(tx + 1500, 308);
    ctx.bezierCurveTo(tx + 1500, 286, tx + 1540, 278, tx + 1580, 280);
    ctx.bezierCurveTo(tx + 1620, 278, tx + 1660, 288, tx + 1660, 308);
    ctx.closePath();
    ctx.fill();
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

  for (const segment of state.terrainSegments) {
    drawTerrainObstacle(ctx, state, segment);
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

  // Terrain body — deep slate fill
  // fillBottom must account for camera offset so the body always reaches the screen edge.
  const fillBottom = CV.height - _cameraY;
  ctx.fillStyle = _pal.terrainBody;
  ctx.beginPath();
  ctx.moveTo(x1, segment.startY);
  ctx.lineTo(x2, segment.endY);
  ctx.lineTo(x2, fillBottom);
  ctx.lineTo(x1, fillBottom);
  ctx.closePath();
  ctx.fill();

  // Glowing top edge
  const isRamp = segment.type === "small-ramp";
  ctx.save();
  ctx.shadowColor = isRamp ? _pal.terrainRampGlow : _pal.terrainGlow;
  ctx.shadowBlur  = isRamp ? 10 : 7;
  ctx.strokeStyle = isRamp ? _pal.terrainRampEdge : _pal.terrainEdge;
  ctx.lineWidth   = isRamp ? 3 : 2.5;
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(x1, segment.startY);
  ctx.lineTo(x2, segment.endY);
  ctx.stroke();
  ctx.restore();

}

function drawGapEdges(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y1: number,
  y2: number
): void {
  ctx.strokeStyle = _pal.gapEdge;
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
  if (
    screenX + obstacle.width < -80 ||
    screenX - obstacle.width > CV.width + 80
  ) {
    return;
  }

  const w = obstacle.width;
  const h = obstacle.height;

  ctx.save();
  ctx.translate(screenX, surfaceY);
  ctx.rotate(angle);

  // Ambient glow + body
  ctx.save();
  ctx.shadowColor = _pal.obstacleGlowColor;
  ctx.shadowBlur = 14;
  ctx.fillStyle = _pal.obstacleBody;
  ctx.fillRect(-w / 2, -h, w, h);
  ctx.restore();

  // Left shadow edge
  ctx.fillStyle = _pal.obstacleEdge;
  ctx.fillRect(-w / 2, -h, 3, h);

  // Bottom shadow band
  ctx.fillStyle = _pal.obstacleShadow;
  ctx.fillRect(-w / 2, -5, w, 5);

  // Top highlight stripe
  ctx.fillStyle = _pal.obstacleTopStripe;
  ctx.fillRect(-w / 2, -h, w, 3);

  // Hazard cross
  const armW = 4;
  const armL = 12;
  ctx.fillStyle = _pal.obstacleCrossRgba;
  ctx.fillRect(-armW / 2, -h / 2 - armL / 2, armW, armL);
  ctx.fillRect(-armL / 2, -h / 2 - armW / 2, armL, armW);

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
    ctx.strokeStyle = `rgba(${_pal.bgTintRgb},${alpha})`;
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
  ctx.scale(heightFactor, 0.20);
  ctx.beginPath();
  ctx.ellipse(0, 0, BOARD.deckW * 0.52, BOARD.wheelR, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(8, 18, 28, ${0.48 * heightFactor})`;
  ctx.fill();
  ctx.restore();
}

// ─── Player ───────────────────────────────────────────────────────────────────

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const { x, y, speed, groundAngle, jumpVelocity, isGrounded, landingTimer } = state.player;
  const speedRatio = speed / P.maxSpeed;

  // Squash/stretch — same logic as before, applied to the whole board
  let squashX = 1.0;
  let squashY = 1.0;

  if (!isGrounded) {
    if (jumpVelocity > 0) {
      const velFactor = Math.min(jumpVelocity / J.baseVelocity, 1);
      squashY = 1 + velFactor * 0.18;
      squashX = 1 - velFactor * 0.06;
    }
  } else if (landingTimer < J.landingSquashDuration) {
    const t = landingTimer / J.landingSquashDuration;
    const eased = 1 - (1 - t) * (1 - t);
    squashY = 0.65 + 0.35 * eased;
    squashX = 1.35 - 0.35 * eased;
  }

  // Pump crouch — brief compression on pump press
  if (state.pumpCrouchTimer > 0 && isGrounded) {
    const pt = state.pumpCrouchTimer / PU.crouchDuration; // 1→0
    squashY = Math.min(squashY, 1 - pt * 0.22);
    squashX = Math.max(squashX, 1 + pt * 0.18);
  }

  const leanAngle = isGrounded ? groundAngle : 0;
  const stretchX  = 1 + speedRatio * 0.14;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(leanAngle);
  ctx.scale(stretchX * squashX, squashY);

  // Speed trail — teal streak behind the board
  const trailLen = speedRatio * 60;
  if (trailLen > 4) {
    const tGrad = ctx.createLinearGradient(
      -BOARD.deckW / 2 - trailLen, 0,
      -BOARD.deckW / 2, 0
    );
    tGrad.addColorStop(0, `rgba(${_pal.accentRgb},0)`);
    tGrad.addColorStop(1, `rgba(${_pal.accentRgb},${speedRatio * 0.36})`);
    ctx.fillStyle = tGrad;
    ctx.fillRect(
      -BOARD.deckW / 2 - trailLen,
      BOARD.deckTop - 1,
      trailLen,
      BOARD.deckH + 2
    );
  }

  // ── Wheels (drawn first so deck overlaps the wheel tops) ─────────────────
  const spinAngle = state.worldOffset / BOARD.wheelR;
  const wheelPositions = [BOARD.wheelFX, BOARD.wheelBX];

  for (const wx of wheelPositions) {
    const wy = BOARD.wheelY;

    // Tire — dark rubber outer
    ctx.fillStyle = "#1c1c26";
    ctx.beginPath();
    ctx.arc(wx, wy, BOARD.wheelR, 0, Math.PI * 2);
    ctx.fill();

    // Tire sidewall ring
    ctx.strokeStyle = "rgba(120, 130, 160, 0.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(wx, wy, BOARD.wheelR - 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Hub — lighter inner disc
    ctx.fillStyle = _pal.wheelColor;
    ctx.beginPath();
    ctx.arc(wx, wy, BOARD.wheelR - 2, 0, Math.PI * 2);
    ctx.fill();

    // Rotating spokes — 3 at 120° intervals
    ctx.strokeStyle = "rgba(60, 70, 95, 0.80)";
    ctx.lineWidth = 0.9;
    for (let s = 0; s < 3; s++) {
      const a = spinAngle + s * (Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(
        wx + Math.cos(a) * (BOARD.wheelR - 0.8),
        wy + Math.sin(a) * (BOARD.wheelR - 0.8)
      );
      ctx.stroke();
    }

    // Hub cap
    ctx.fillStyle = _pal.truckColor;
    ctx.beginPath();
    ctx.arc(wx, wy, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Trucks — flat horizontal baseplates only, no vertical rods ───────────
  const baseplateY = BOARD.deckTop + BOARD.deckH;
  ctx.fillStyle = _pal.truckColor;
  ctx.fillRect(BOARD.wheelFX - 3, baseplateY, 6, 2);
  ctx.fillRect(BOARD.wheelBX - 3, baseplateY, 6, 2);

  // ── Deck base — near-black with speed glow ────────────────────────────────
  ctx.save();
  if (speedRatio > 0.50) {
    const glow = (speedRatio - 0.50) / 0.50;
    ctx.shadowColor = `rgba(${_pal.accentRgb},${glow * 0.80})`;
    ctx.shadowBlur  = 10 * glow;
  }
  ctx.fillStyle = _pal.deckColor;
  ctx.fillRect(-BOARD.deckW / 2, BOARD.deckTop, BOARD.deckW, BOARD.deckH);
  ctx.restore();

  // ── Iridescent stripe overlay on deck ────────────────────────────────────
  const iGrad = ctx.createLinearGradient(-BOARD.deckW / 2, 0, BOARD.deckW / 2, 0);
  iGrad.addColorStop(0,    `rgba(${_pal.iridescentARgb},0)`);
  iGrad.addColorStop(0.26, `rgba(${_pal.iridescentARgb},0.72)`);
  iGrad.addColorStop(0.56, `rgba(${_pal.iridescentBRgb},0.65)`);
  iGrad.addColorStop(0.80, `rgba(${_pal.iridescentARgb},0.42)`);
  iGrad.addColorStop(1,    `rgba(${_pal.iridescentARgb},0)`);
  ctx.fillStyle = iGrad;
  ctx.fillRect(-BOARD.deckW / 2, BOARD.deckTop, BOARD.deckW, BOARD.deckH);

  ctx.restore();
}

// ─── Pump window bar ─────────────────────────────────────────────────────────

function drawPumpWindowBar(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.pumpLandingWindow <= 0) return;

  const progress = state.pumpLandingWindow / PU.landingWindow; // 1→0
  const { x, y } = state.player;

  const barW    = 26;
  const barH    = 3;
  const barX    = x - barW / 2;
  const barY    = y + BOARD.deckTop - 7; // just above the deck top
  const fillW   = barW * progress;
  const alpha   = 0.55 + 0.45 * progress; // fades as window closes

  // Track background
  ctx.fillStyle = "rgba(10, 20, 30, 0.55)";
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

  // Fill
  ctx.save();
  ctx.shadowColor = `rgba(64, 232, 200, ${0.7 * progress})`;
  ctx.shadowBlur  = 5;
  ctx.fillStyle   = `rgba(64, 232, 200, ${alpha})`;
  ctx.fillRect(barX, barY, fillW, barH);
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

  ctx.strokeStyle = `rgba(${_pal.accentRgb},${alpha})`;
  ctx.lineWidth = 1.5;
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

  // ── Backing panels ───────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(6, 8, 22, 0.58)";
  ctx.beginPath();
  ctx.roundRect(8, 6, 142, 102, 4);
  ctx.fill();

  ctx.fillStyle = "rgba(6, 8, 22, 0.58)";
  ctx.beginPath();
  ctx.roundRect(CV.width - 194, 2, 186, 76, 4);
  ctx.fill();

  // ── Left column ──────────────────────────────────────────────────────────

  // Score — hero element
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
  ctx.shadowBlur = 4;
  ctx.fillStyle = "rgba(255, 245, 200, 1.0)";
  ctx.font = "bold 20px monospace";
  ctx.fillText(fmtScore(state.score), 18, 24);
  ctx.restore();

  // Distance + persistent bests
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 2;
  ctx.font = "11px monospace";
  ctx.fillStyle = "rgba(175, 195, 235, 0.97)";
  ctx.fillText(`${Math.round(distanceTraveled)} m`, 18, 38);
  ctx.fillStyle = "rgba(255, 220, 90, 0.97)";
  ctx.fillText(`BEST ${fmtScore(state.progress.bestScore)}`, 18, 53);
  ctx.fillStyle = "rgba(160, 210, 255, 0.90)";
  ctx.fillText(`BEST DIST ${Math.round(state.progress.bestDistance)}m`, 18, 67);
  ctx.restore();

  // Airborne height (dev aid)
  if (!isGrounded) {
    ctx.fillStyle = "rgba(160, 210, 255, 0.80)";
    ctx.font = "10px monospace";
    ctx.fillText(`↑ ${Math.round(jumpHeight)} px`, 18, 76);
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
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 2;
  ctx.fillStyle = focusFull || state.focusActive
    ? "rgba(255, 205, 65, 0.98)"
    : "rgba(195, 150, 70, 0.95)";
  ctx.font = "10px monospace";
  ctx.fillText(focusLabel, focusBarX, focusBarY - 4);
  ctx.restore();

  // Patch inventory
  if (state.patchCount > 0) {
    const pulse = 0.75 + 0.25 * Math.sin(state.timeElapsed * 4.5);
    ctx.save();
    ctx.shadowColor = "rgba(60, 255, 120, 0.7)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = `rgba(80, 255, 140, ${pulse})`;
    ctx.font = "10px monospace";
    ctx.fillText(`[E] PATCH  ×${state.patchCount}`, focusBarX, focusBarY + 18);
    ctx.restore();
  } else {
    ctx.fillStyle = "rgba(80, 130, 90, 0.45)";
    ctx.font = "10px monospace";
    ctx.fillText("[E] PATCH", focusBarX, focusBarY + 18);
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

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 2;
  ctx.fillStyle = "rgba(180, 190, 225, 0.97)";
  ctx.font = "10px monospace";
  ctx.fillText("SPEED", barX, barY - 5);
  ctx.fillText(`${Math.round(speed)} / ${P.maxSpeed}`, barX + barW - 55, barY - 5);
  ctx.restore();

  // Multiplier badge — cyan during overclock, normal colors otherwise
  const mult = state.multiplier;
  const effectiveMult = state.overclockActive ? mult * OC.scoreMultiplier : mult;

  const [multBg, multFg, multGlow]: [string, string, string | null] = state.overclockActive
    ? ["rgba(0,200,255,0.18)", "rgba(0,230,255,1)", "rgba(0,200,255,0.7)"]
    : mult === 4 ? ["rgba(255,40,20,0.22)",  "rgba(255,90,60,1)",   "rgba(255,50,20,0.7)"]
    : mult === 3 ? ["rgba(255,150,0,0.18)",  "rgba(255,190,50,1)",  "rgba(255,140,0,0.5)"]
    : mult === 2 ? ["rgba(50,200,100,0.15)", "rgba(100,230,140,1)", null]
    :              ["rgba(60,80,120,0.25)",  "rgba(165,182,225,0.97)", null];

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

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 2;
  ctx.fillStyle = multFg;
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`×${effectiveMult}`, badgeX + badgeW / 2, badgeY + badgeH - 6);
  ctx.textAlign = "left";
  ctx.restore();

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

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 2;
    ctx.fillStyle = nearEnd ? "rgba(255, 150, 90, 0.97)" : "rgba(0, 220, 255, 0.95)";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`OVERCLOCK  ${state.overclockTimer.toFixed(1)}s`, badgeX + badgeW / 2, ocBarY + ocBarH + 10);
    ctx.textAlign = "left";
    ctx.restore();
  } else if (state.combo > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 2;
    ctx.fillStyle = "rgba(210, 228, 255, 0.95)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${state.combo} COMBO`, badgeX + badgeW / 2, badgeY + badgeH + 14);
    ctx.textAlign = "left";
    ctx.restore();
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
  ctx.fillStyle = `rgba(240, 192, 60, ${alpha})`;
  ctx.font = "bold 22px monospace";
  ctx.fillText(`+${fmtScore(state.nearMissPoints)}`, CV.width / 2, popY);

  // Label
  const label = state.combo > 1 ? `NEAR MISS  ×${state.combo} COMBO` : "NEAR MISS";
  ctx.fillStyle = `rgba(240, 192, 60, ${alpha * 0.65})`;
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
    "↑/W accelerate    SPACE jump    SHIFT focus    S pump",
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

// ─── Particles ───────────────────────────────────────────────────────────────

function spawnLandingParticles(x: number, y: number): void {
  for (let i = 0; i < 7; i++) {
    const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.7;
    const speed = 40 + Math.random() * 90;
    _particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      life: 1, decay: 2.8 + Math.random() * 1.4,
      r: 2 + Math.random() * 2.5,
      kind: "landing",
    });
  }
}

function spawnDustParticle(x: number, y: number): void {
  _particles.push({
    x: x - 18 + (Math.random() - 0.5) * 10,
    y: y + (Math.random() - 0.5) * 3,
    vx: -30 - Math.random() * 50,
    vy: -8 - Math.random() * 18,
    life: 1, decay: 3.5 + Math.random() * 2,
    r: 1.5 + Math.random() * 2,
    kind: "dust",
  });
}

function updateAndDrawParticles(ctx: CanvasRenderingContext2D, dt: number): void {
  for (let i = _particles.length - 1; i >= 0; i--) {
    const p = _particles[i];
    p.life -= p.decay * dt;
    if (p.life <= 0) { _particles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 180 * dt; // gravity pull-down

    const alpha = p.life * (p.kind === "landing" ? 0.72 : 0.45);
    ctx.fillStyle = p.kind === "landing"
      ? `rgba(${_pal.accentRgb},${alpha})`
      : `rgba(${_pal.bgTintRgb},${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Game Over overlay ───────────────────────────────────────────────────────

function drawGameOverOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  const isNewBest = state.score > 0 && Math.round(state.score) === state.progress.bestScore;

  ctx.fillStyle = "rgba(0, 0, 8, 0.68)";
  ctx.fillRect(0, 0, CV.width, CV.height);

  const cx = CV.width / 2;
  const cy = CV.height / 2;
  const panelW = 320;
  const panelH = isNewBest ? 190 : 148;
  const panelX = cx - panelW / 2;
  const panelY = cy - panelH / 2;

  ctx.save();
  if (isNewBest) {
    ctx.shadowColor = "rgba(240, 192, 64, 0.55)";
    ctx.shadowBlur = 18;
  }
  ctx.fillStyle = "rgba(8, 12, 28, 0.92)";
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = isNewBest ? "rgba(240, 192, 64, 0.55)" : "rgba(136, 152, 204, 0.22)";
  ctx.lineWidth = isNewBest ? 1.5 : 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(224, 96, 80, 0.95)";
  ctx.font = "bold 36px monospace";
  ctx.fillText("GAME OVER", cx, panelY + 44);

  if (isNewBest) {
    ctx.fillStyle = "#f0c040";
    ctx.font = "bold 13px monospace";
    ctx.fillText("★  NEW HIGH SCORE  ★", cx, panelY + 68);

    ctx.fillStyle = "#f0c040";
    ctx.font = "bold 28px monospace";
    ctx.fillText(fmtScore(state.score), cx, panelY + 104);

    ctx.fillStyle = "rgba(136, 152, 204, 0.80)";
    ctx.font = "12px monospace";
    ctx.fillText(`${Math.round(state.player.distanceTraveled)} m`, cx, panelY + 128);

    ctx.fillStyle = "#40c8b0";
    ctx.font = "12px monospace";
    ctx.fillText("R  —  try again", cx, panelY + 168);
  } else {
    ctx.fillStyle = "#e8eeff";
    ctx.font = "bold 26px monospace";
    ctx.fillText(fmtScore(state.score), cx, panelY + 82);

    ctx.fillStyle = "rgba(136, 152, 204, 0.80)";
    ctx.font = "12px monospace";
    ctx.fillText(`${Math.round(state.player.distanceTraveled)} m`, cx, panelY + 104);

    ctx.fillStyle = "#40c8b0";
    ctx.font = "12px monospace";
    ctx.fillText("R  —  try again", cx, panelY + 130);
  }

  ctx.textAlign = "left";
}
