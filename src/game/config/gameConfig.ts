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

    acceleration: 385,     // px/s² — tune: higher = more responsive snap
    friction: 0.993,       // per-frame decay — ~4s coast from max to stop (0.982^60 ≈ 0.34/s)
    maxSpeed: 860,         // px/s forward
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

  routes: {
    upperLedgeHeight: 92,
    dropRouteDepth: 104,
    redRampLength: 220,
    platformThickness: 16,
    dropThroughDuration: 0.55,
    dropVelocity: 180,
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
    comboTimeout: 5,         // seconds without a near-miss before combo resets
    // Speed-ratio thresholds for x2 / x3 / x4 (fraction of maxSpeed)
    tier2: 0.35,
    tier3: 0.65,
    tier4: 0.9,
  },

  patchPulse: {
    tokenRadius: 14,
    tokenSpacing: 4800,      // deterministic px between patch token spawns
    graceDistance: 3000,     // no patch tokens before this worldOffset
    shockwaveBaseRadius: 300,   // px at zero speed
    shockwaveRadiusBonus: 280,  // extra px added at max speed
    shockwaveDuration: 0.45,    // seconds for the ring animation
  },

  focus: {
    fillRate: 0.12,           // meter gain per second × speedRatio — fills in ~8s at max speed
    drainRate: 0.27,          // meter loss per second while active — ~3.7s of slow-mo
    timeScale: 0.4,          // physDt multiplier while active (0.4 = 40% speed)
    activationThreshold: 1.0, // must be fully charged to activate
    flashDuration: 0.12,      // brief amber screen flash on activation
  },

  pump: {
    cooldown: 0.75,        // seconds before another pump is allowed
    duration: 1.0,         // mini-overclock duration (same effect as cyan token)
    landingWindow: 0.20,   // seconds after landing — bar shows during this window
    crouchDuration: 0.12,  // squash animation duration on pump press
  },

  overclock: {
    duration: 5,           // seconds the effect lasts
    speedMultiplier: 2,    // max speed cap multiplier during overclock
    scoreMultiplier: 2,      // stacks with the speed-tier multiplier
    tokenRadius: 14,         // collection hitbox radius (adds to player half-dims)
    tokenSpacing: 3700,      // deterministic worldOffset gap between token spawns
    graceDistance: 2200,     // no tokens before this worldOffset
    flashDuration: 0.14,     // screen flash duration on collection
  },

  scoreSurge: {
    scoreSurgeMultiplier: 2,  // temporary score gain multiplier
    scoreSurgeDuration: 6,    // seconds after collecting a red surge token
    scoreSurgeSpawnRules: "risky-routes-only",
    scoreSurgeVisualColor: "rgba(255, 56, 48, 0.98)",
    tokenRadius: 15,
    flashDuration: 0.18,
  },

  rewards: {
    riskScorePerSecond: 55,
    ringBonus: 650,
    ringRadiusX: 42,
    ringRadiusY: 54,
    cullBehind: 320,
    feedbackDuration: 1.1,
  },

};
