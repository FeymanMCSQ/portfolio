# Engineering Principles

## 1. Single Responsibility Principle

Each module should have one primary reason to change.

Examples:

```txt
InputManager changes when controls change.
CollisionSystem changes when collision rules change.
ScoreSystem changes when scoring rules change.
Renderer changes when visuals change.
```

Bad design:

```txt
Game.ts handles input, movement, collision, rendering, scoring, sound, and portfolio unlocks.
```

Good design:

```txt
Game.ts coordinates systems.
Specialized modules handle their own responsibilities.
```

## 2. Separation of concerns

Separate:

```txt
what the game is doing
from
how it is drawn
```

Game state should not depend on a specific rendering style.

## 3. Data-driven tuning

Gameplay constants should live in configuration files.

Do not bury tuning values across the codebase.

Example:

```ts
export const GAME_CONFIG = {
  player: {
    acceleration: 0.035,
    friction: 0.018,
    maxSpeed: 8,
    jumpVelocity: 12,
  },
  focus: {
    maxMeter: 100,
    gainPerSecond: 8,
    slowMotionScale: 0.45,
  },
};
```

## 4. Small functions

A function should usually do one clear thing.

If a function needs many comments to explain its internal phases, split it.

## 5. Explicit state transitions

State changes should be obvious.

Example:

```txt
playing → paused → playing
playing → gameOver
playing → completedRun
```

Avoid random boolean combinations like:

```ts
isRunning
isDead
hasStarted
isPaused
isFinished
```

when a single enum would be clearer.

## 6. Composition over inheritance

Prefer:

```txt
entity has position
entity has velocity
entity has collider
entity has render style
```

over deep inheritance:

```txt
GameObject → MovingGameObject → LivingGameObject → PlayerLikeObject
```

## 7. Make invalid states hard to represent

Use clear types and enums.

Bad:

```ts
powerUp.type = "weird string";
```

Good:

```ts
type PowerUpType = "overclock" | "patchPulse";
```

## 8. Optimize for change

This game will need tuning. Write code assuming values and rules will change.

Avoid tightly coupling systems.

## 9. No cleverness tax

If future-you has to spend 20 minutes understanding a clever abstraction, it is probably bad.

Readable boring code is usually better.

## 10. Build vertically

Build one complete thin slice at a time.

Example:

```txt
movement slice:
input → movement update → render result → simple debug display
```

Do not build five half-finished systems in parallel.
