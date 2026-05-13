# Rendering and Performance

## Rendering approach

Use HTML Canvas for the active game area.

React should render:

- page shell
- HUD
- menus
- overlays
- buttons
- portfolio cards

Canvas should render:

- player
- obstacles
- collectibles
- particles
- trails
- game background

## Performance budget

Target:

```txt
60 FPS on ordinary laptops
acceptable performance on mobile/tablet if supported
```

## Avoid expensive work per frame

Do not:

- allocate many new objects every frame
- query the DOM every frame
- update React state every frame
- load assets during gameplay
- run complex layout calculations in the loop

## Object pooling

If particles or obstacles cause performance problems, reuse objects instead of constantly creating/destroying them.

This is optional at first. Do not overengineer before there is a performance issue.

## Draw order

Recommended draw order:

```txt
background
track/grid
collectibles
obstacles
patch pulse effects
player trail
player
particles
debug overlay
```

## Visual clarity over visual noise

Gameplay readability is more important than effects.

The player must always be able to identify:

- player position
- current speed
- incoming obstacles
- jumpable obstacles
- steer-around obstacles
- collectibles
- active power-ups

## Use simple shapes first

Prototype visuals:

```txt
player = circle or rounded rectangle
ground obstacle = red rectangle
steer obstacle = orange block
collectible = yellow circle
overclock = purple token
patch pulse = blue token
```

Do not block development waiting for polished art.

## Animation principles

Use animation to improve feedback:

- player lean while steering
- squash/stretch on landing
- trail length based on speed
- screen pulse on overclock
- subtle slow-motion visual during focus
- shockwave ring on patch pulse

Do not animate everything.

## Debug rendering

Add optional debug overlays:

- hitboxes
- speed value
- jump state
- obstacle spawn lanes
- collision radius
- current delta time
- FPS estimate

Debug rendering should be toggleable.
