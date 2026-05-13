# Feature Implementation Workflow

Use this workflow for every feature.

## Step 1: Define the feature

Write:

```txt
What does this feature do?
What player problem does it solve?
What system owns it?
What should not be included?
```

## Step 2: Identify affected files

Before coding, list the files that need changes.

Avoid touching unrelated files.

## Step 3: Implement the smallest version

Build the simplest working slice.

Example for Focus Mode:

```txt
meter fills
press key at 100%
time scale changes
meter drains
time scale returns to normal
```

Do not add polish first.

## Step 4: Add debug visibility

For game systems, add temporary debug information.

Example:

```txt
Focus: 72%
Time scale: 1.0
Overclock: inactive
Patch Pulse: armed
```

## Step 5: Test manually

Play the game and verify:

- feature activates
- feature ends
- feature resets after game over
- feature does not break other systems

## Step 6: Tune values

Only after the feature works, tune numbers.

## Step 7: Add polish

Polish can include:

- particles
- animation
- sound
- HUD indicators
- small screen effects

## Step 8: Clean up

Remove dead code, console spam, and temporary hacks.

## Feature order

Recommended order:

```txt
1. movement
2. jump
3. basic obstacles
4. collision
5. score
6. combo
7. near misses
8. overclock
9. focus mode
10. patch pulse
11. unlock cards
12. menus/pause/settings
13. final visual polish
```

## Scope control

Each feature should have a clear stopping point.

Do not turn one feature into three features.

Example:

Bad:

```txt
Implement jumping, double jump, trick system, landing particles, jump upgrades, and airborne collectibles.
```

Good:

```txt
Implement grounded jump with gravity and landing detection.
```
