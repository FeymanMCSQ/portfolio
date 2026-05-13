# Testing and Debugging

## Testing goal

The goal is not only to check whether the code runs.

The goal is to check whether the game is:

```txt
playable
fair
tunable
stable
understandable
```

## Manual playtest checklist

After each feature, test:

```txt
Can the game start?
Can the game restart?
Can the player move?
Can the player jump?
Can the player crash?
Does score reset correctly?
Do obstacles reset correctly?
Does the feature work more than once?
Does the feature break after pause/restart?
```

## Game feel test

Rate each prototype run from 1 to 10:

```txt
movement feel
jump feel
obstacle fairness
clarity
desire to retry
```

The most important score is:

```txt
desire to retry
```

If the player crashes and immediately wants another run, the design is working.

## Debug overlay

Include a debug mode that can show:

```txt
FPS
delta time
player speed
player x/y
isGrounded
focus meter
time scale
overclock active
patch pulse armed
obstacle count
collision boxes
```

## Console logging

Use logs sparingly.

Bad:

```txt
console.log every frame
```

Good:

```txt
console.log important state transitions
```

Examples:

```txt
Game started
Game over
Focus activated
Overclock collected
Patch Pulse triggered
```

## Common bugs to watch for

### Delta time explosion

When tab focus changes, delta time may spike.

Fix by capping delta.

### State not resetting

Power-up timers, obstacle arrays, or combo state may persist across restarts.

Fix by centralizing reset logic.

### Collision too harsh

If the visible player barely touches an obstacle and dies, it may feel unfair.

Use forgiving hitboxes.

### Unreadable obstacles

If obstacles spawn too close or too randomly, the player cannot learn.

Use pattern-based generation.

### React render overload

If React state updates every frame, performance may drop.

Keep fast game state outside React.

## Regression checklist

Before committing:

```txt
movement still works
jump still works
collision still works
score still works
restart works
no console spam
no TypeScript errors
no obvious frame drops
```
