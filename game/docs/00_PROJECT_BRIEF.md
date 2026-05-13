# Project Brief: Runtime Rush

## One-line concept

**Runtime Rush** is a 2D browser skating game where the player controls momentum, jumps over obstacles, collects rewards, and unlocks developer portfolio cards.

## Design pillar

```txt
Fast movement where greed creates danger.
```

The game should make the player feel:

```txt
I want to go faster, but going faster makes survival harder.
```

## Core fantasy

The player skates through a chaotic software pipeline, dodging bugs, broken builds, merge conflicts, and other software-themed hazards.

## Primary verb

```txt
Control momentum.
```

## Secondary verb

```txt
Jump.
```

## Core loop

```txt
accelerate → steer → jump → avoid obstacle → collect reward → build combo → go faster → survive
```

## Main systems

### 1. Momentum skating

The player moves forward continuously. The player can accelerate and steer. Speed affects difficulty and scoring.

### 2. Jumping

Jumping adds timing and obstacle variety. Jump distance should depend partly on current speed.

### 3. Obstacles

Obstacles create readable patterns. They should test steering, speed control, and jumping.

### 4. Scoring

Score should reward distance, speed, collectibles, near-misses, and combos.

### 5. Overclock

A risk/reward mode where speed and score gain increase, but danger also increases.

### 6. Focus Mode

A manually activated meter ability. When the focus meter reaches 100%, the player can slow down time for a short period.

### 7. Patch Pulse

A power-up where the next landing releases a shockwave that clears nearby ground obstacles.

## Portfolio layer

The game is optional. The main portfolio website must contain all critical recruiter/client information without requiring gameplay.

The game can unlock short developer cards, but those cards should link back to normal portfolio sections.

## Non-goals for the first version

Do not add:

- multiplayer
- login
- online leaderboard
- complex inventory
- complex physics
- large maps
- story mode
- grappling hook
- tricks system
- ducking system
- procedural bosses
- complex enemy AI

The first successful milestone is a grey-box prototype that is fun for 60 seconds.
