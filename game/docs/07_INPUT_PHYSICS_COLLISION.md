# Input, Physics, and Collision

## Input design

The first control scheme should be simple:

```txt
Left / Right or A / D = steer
Up / W = accelerate
Space = jump
Shift = activate Focus Mode
```

Alternative:

```txt
Mouse/touch hold = accelerate
Swipe/drag = steer
Tap = jump
```

Keyboard first is acceptable for the prototype.

## InputManager rules

InputManager should track input state.

Example:

```ts
interface InputState {
  accelerate: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  jumpPressed: boolean;
  focusPressed: boolean;
}
```

It should not directly move the player.

## Movement model

Start simple.

State:

```ts
interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  speed: number;
  verticalVelocity: number;
  isGrounded: boolean;
}
```

## Acceleration and friction

The player should feel momentum.

Rules:

```txt
holding accelerate increases speed
releasing accelerate gradually reduces speed
speed is clamped between min and max
steering becomes harder at high speed if desired
```

## Jumping

Jump should be responsive.

Rules:

```txt
can jump only when grounded
jump gives vertical velocity
gravity pulls player down
landing returns player to ground
```

Momentum interaction:

```txt
higher speed should slightly increase jump distance or jump reward
```

Do not make high-speed jumps uncontrollable in version 1.

## Collision philosophy

Use forgiving hitboxes.

Visible sprite/shape can be larger than actual collision box.

This reduces frustration.

Example:

```txt
visual player width = 40px
collision player width = 28px
```

## Collision types

Start with:

```txt
solid obstacle collision
collectible pickup collision
near-miss detection
landing pulse radius collision
```

## Near-miss detection

Near-miss rewards make danger exciting.

A near miss occurs when the player passes close to an obstacle without colliding.

Use a larger radius/box than collision.

Example:

```txt
collision zone = actual danger
near-miss zone = danger + margin
```

## Patch Pulse collision

Patch Pulse should clear obstacles within a radius around the landing point.

Rules:

```txt
only clears eligible ground obstacles
does not clear gaps
does not clear major walls
does not clear every obstacle on screen
```

## Fairness rules

The player should have enough time to react.

Obstacle patterns should not be impossible.

Avoid:

- unavoidable obstacles
- random dense walls
- tiny reaction windows
- obstacles hidden behind effects
- required frame-perfect jumps in normal mode
