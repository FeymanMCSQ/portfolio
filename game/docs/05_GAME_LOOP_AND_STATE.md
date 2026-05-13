# Game Loop and State

## Game loop principle

The game loop should be predictable.

Each frame:

```txt
calculate delta time
read input state
update simulation
resolve events
render
request next frame
```

## Use delta time

Do not assume a fixed frame rate.

Bad:

```ts
player.x += player.speed;
```

Good:

```ts
player.x += player.speed * deltaTime;
```

This keeps movement consistent across different devices.

## Cap extreme delta time

If the tab freezes or the browser pauses, delta time can become huge.

Cap it:

```ts
const cappedDelta = Math.min(deltaTime, 0.05);
```

This prevents objects from teleporting after lag.

## Game phase

Use a clear phase enum:

```ts
type GamePhase = "idle" | "playing" | "paused" | "gameOver";
```

Avoid scattered booleans.

## State ownership

The game engine owns fast-changing state:

- player position
- velocity
- obstacle positions
- particles
- current score
- timers
- power-up durations

React owns slower UI state:

- route/page
- menu visibility
- settings
- selected portfolio card
- modal state

## Avoid React state every frame

Do not call `setState` 60 times per second for game objects.

Instead:

- keep game state in refs/classes/plain objects
- render to canvas directly
- only update React state for low-frequency UI changes

Examples of low-frequency UI updates:

```txt
game started
game paused
game over
portfolio card unlocked
settings changed
```

## Deterministic update order

Keep update order consistent.

Recommended:

```txt
1. input
2. player movement
3. world movement
4. obstacle spawning
5. obstacle updates
6. power-up updates
7. collision checks
8. event resolution
9. scoring
10. rendering
```

## Events instead of direct coupling

Collision code should not directly modify score, trigger particles, and unlock cards.

Better:

```txt
CollisionSystem detects collision
→ emits PLAYER_CRASHED event
→ GameEventResolver applies consequences
```

This keeps systems clean.

## Reset state carefully

A new run should fully reset:

- player position
- speed
- jump state
- obstacles
- collectibles
- particles
- score
- combo
- power-up timers
- focus meter
- game clock

Do not leave old state leaking into new runs.
