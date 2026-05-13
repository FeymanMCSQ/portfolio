# AI Coding Rules

These rules are for any AI agent writing code for this project.

## Prime directive

Write code that is:

```txt
small, readable, modular, testable, and easy to change.
```

Do not optimize for cleverness. Optimize for clarity.

## Do not build too much at once

Implement one feature at a time.

Bad:

```txt
Implement the full game with movement, power-ups, score, menus, unlocks, animations, and portfolio cards.
```

Good:

```txt
Implement player movement with acceleration, deceleration, and steering.
```

## Respect existing architecture

Before editing code:

1. Read the relevant files.
2. Identify the current architecture.
3. Make the smallest change that fits.
4. Do not rewrite unrelated systems.

## Do not create giant files

Avoid files larger than roughly 250-350 lines unless there is a clear reason.

Split by responsibility:

```txt
PlayerController
ObstacleManager
CollisionSystem
ScoreSystem
PowerUpSystem
GameLoop
Renderer
InputManager
```

## Do not mix concerns

Avoid mixing:

- rendering
- physics
- input handling
- game rules
- UI state
- portfolio content
- sound effects
- configuration constants

Each module should have one main reason to change.

## Prefer configuration over magic numbers

Bad:

```ts
player.speed += 0.42;
```

Good:

```ts
const PLAYER_ACCELERATION = 0.42;
player.speed += PLAYER_ACCELERATION;
```

Even better:

```ts
player.speed += GAME_CONFIG.player.acceleration;
```

## Keep the game tunable

Game feel comes from tuning numbers.

Important values should be easy to change:

- acceleration
- friction
- max speed
- jump force
- gravity
- obstacle spawn rate
- obstacle size
- focus meter gain
- overclock duration
- patch pulse radius

## Avoid premature abstraction

Do not create abstract factories, generic engines, or complex inheritance trees unless the project actually needs them.

Prefer simple composition.

## No hidden behavior

A function should not secretly mutate unrelated state.

Bad:

```ts
updatePlayer();
```

If it also spawns obstacles, updates score, and triggers unlocks, the name is misleading.

Good:

```ts
updatePlayerPhysics();
updateObstaclePositions();
updateScore();
```

## Use explicit names

Bad:

```ts
doThing()
handleStuff()
data
obj
temp
```

Good:

```ts
updateFocusMeter()
spawnObstacleRow()
resolvePlayerObstacleCollision()
calculateSpeedMultiplier()
```

## Keep React out of per-frame game logic

React should manage:

- page layout
- menus
- HUD
- portfolio cards
- settings panels

Canvas/game loop code should manage:

- movement
- collisions
- obstacles
- animation
- rendering

Do not update React state every frame unless absolutely necessary.

## Always preserve playability

After every feature, the game should still run.

Do not leave the project in a broken half-integrated state.

## When uncertain

Choose the simpler implementation.

Complexity can be added later. Removing complexity is harder.
