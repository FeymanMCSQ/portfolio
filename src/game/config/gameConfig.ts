export const GAME_CONFIG = {
  canvas: {
    width: 900,
    height: 500,
  },

  player: {
    startX: 210,
    startY: 351,
    startSpeed: 50,        // small initial speed so world is live from frame 1
    width: 38,
    height: 18,

    acceleration: 290,     // px/s² — tune: higher = more responsive snap
    friction: 0.964,       // per-frame decay — ~3s from max to stop (0.964^60 ≈ 0.106/s)
    maxSpeed: 680,         // px/s forward
  },

  terrain: {
    groundY: 360,
    generateAhead: 2400,
    cullBehind: 700,
    flatLength: 520,
    slopeLength: 430,
    slopeHeight: 66,
    rampLength: 210,
    rampHeight: 48,
    rampLaunchVelocity: 520,
    rampSpeedLaunchBonus: 160,
    gapLength: 180,
    platformLength: 380,
    platformDrop: 42,
    obstacleWidth: 46,
    obstacleHeight: 46,
  },

  jump: {
    baseVelocity: 420,          // px/s upward at zero forward speed
    speedBonus: 220,            // extra px/s added at maxSpeed (scales linearly)
    gravity: 1100,              // px/s² downward pull
    airControlMultiplier: 0.82, // lateral turn effectiveness while airborne
    landingSquashDuration: 0.14,// seconds the squash-to-normal animation takes
  },

  world: {
    gridSpeeds: [0.28, 0.58, 1.0] as [number, number, number],
    gridSpacings: [160, 105, 62] as [number, number, number],
    gridOpacities: [0.1, 0.18, 0.32] as [number, number, number],
  },

  scoring: {
    pointsPerPx: 0.1,          // score per px traveled, before multiplier
    nearMissBonus: 50,         // base near-miss bonus before multiplier × combo scaling
    nearMissObstacleClearance: 34, // px above a terrain block that counts as a close clear
    comboTimeout: 5.0,         // seconds without a near-miss before combo resets
    // Speed-ratio thresholds for x2 / x3 / x4 (fraction of maxSpeed)
    tier2: 0.35,
    tier3: 0.65,
    tier4: 0.90,
  },

  patchPulse: {
    tokenRadius: 14,
    tokenSpacingMin: 3500,   // px between patch token spawns
    tokenSpacingRandom: 2500,
    graceDistance: 3000,     // no patch tokens before this worldOffset
    shockwaveBaseRadius: 100,   // px at zero speed
    shockwaveRadiusBonus: 120,  // extra px added at max speed
    shockwaveDuration: 0.45,    // seconds for the ring animation
  },

  focus: {
    fillRate: 0.12,           // meter gain per second × speedRatio — fills in ~8s at max speed
    drainRate: 0.27,          // meter loss per second while active — ~3.7s of slow-mo
    timeScale: 0.40,          // physDt multiplier while active (0.4 = 40% speed)
    activationThreshold: 1.0, // must be fully charged to activate
    flashDuration: 0.12,      // brief amber screen flash on activation
  },

  overclock: {
    duration: 5.0,           // seconds the effect lasts
    speedMultiplier: 2.0,    // max speed cap multiplier during overclock
    scoreMultiplier: 2,      // stacks with the speed-tier multiplier
    tokenRadius: 14,         // collection hitbox radius (adds to player half-dims)
    tokenSpacingMin: 2800,   // min worldOffset gap between token spawns
    tokenSpacingRandom: 1800,
    graceDistance: 2200,     // no tokens before this worldOffset
    flashDuration: 0.14,     // screen flash duration on collection
  },

  obstacles: {
    surviveDuration: 60,   // seconds to survive to win
  },
};
