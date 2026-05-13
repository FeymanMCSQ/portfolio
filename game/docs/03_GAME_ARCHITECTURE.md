# Game Architecture

## Recommended stack

Use:

```txt
React / Next.js for the website and UI
Canvas for the game rendering
TypeScript for type safety
```

React should not be responsible for rendering every moving game object.

## High-level architecture

```txt
Portfolio Page
  └── Play Route
        ├── GameCanvas
        ├── HUD
        ├── Pause Menu
        ├── Unlock Cards
        └── Game Engine Modules
```

## Core engine modules

### GameLoop

Responsible for:

- starting the loop
- stopping the loop
- calculating delta time
- calling update systems
- calling render systems

### InputManager

Responsible for:

- keyboard input
- pointer/touch input if needed
- current input state
- input mapping

Not responsible for:

- moving the player directly
- scoring
- rendering

### PlayerController

Responsible for:

- acceleration
- deceleration
- steering
- jumping
- player movement state

### ObstacleManager

Responsible for:

- spawning obstacles
- updating obstacle positions
- removing off-screen obstacles
- generating readable patterns

### CollisionSystem

Responsible for:

- detecting collisions
- returning collision results

Not responsible for:

- rendering explosion effects
- changing score directly
- unlocking cards directly

### ScoreSystem

Responsible for:

- distance score
- speed multiplier
- combo
- near-miss scoring
- score events

### PowerUpSystem

Responsible for:

- overclock state
- focus meter state
- patch pulse state
- power-up durations and activation rules

### Renderer

Responsible for:

- drawing background
- drawing player
- drawing obstacles
- drawing collectibles
- drawing particles
- drawing debug overlays when enabled

### GameState

Responsible for storing the current game state.

Example:

```ts
type GamePhase = "idle" | "playing" | "paused" | "gameOver";

interface GameState {
  phase: GamePhase;
  player: PlayerState;
  obstacles: Obstacle[];
  collectibles: Collectible[];
  score: ScoreState;
  powerUps: PowerUpState;
  timeElapsed: number;
}
```

## Data flow

Recommended flow per frame:

```txt
read input
→ update player
→ update world speed
→ spawn/update obstacles
→ update power-ups
→ detect collisions
→ resolve game events
→ update score
→ render frame
```

## Events

Use simple game events to avoid tightly coupling systems.

Examples:

```ts
type GameEvent =
  | { type: "PLAYER_CRASHED"; obstacleId: string }
  | { type: "COLLECTIBLE_PICKED"; collectibleId: string }
  | { type: "NEAR_MISS"; obstacleId: string }
  | { type: "PATCH_PULSE_TRIGGERED"; clearedObstacleIds: string[] };
```

Systems can produce events. A central update step can resolve them.

## Avoid overengineering

Do not build a full ECS unless needed.

A simple object-based architecture is enough for this project.
