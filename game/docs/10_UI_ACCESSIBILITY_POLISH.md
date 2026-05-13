# UI, Accessibility, and Polish

## Main principle

The game is optional. The portfolio must remain usable without it.

Do not hide essential portfolio information behind gameplay.

## Game entry

The normal portfolio should have a clear optional entry point:

```txt
Play interactive portfolio
```

The game route should have a clear way back:

```txt
Back to portfolio
```

## Controls explanation

The controls should be visible before the game starts.

Example:

```txt
A/D or ←/→: steer
W or ↑: accelerate
Space: jump
Shift: focus
```

Keep it short.

## HUD

HUD should show:

```txt
score
speed
combo
focus meter
active overclock timer
patch pulse status
stability/health if used
```

Do not overcrowd the HUD.

## Accessibility

Consider:

- keyboard controls
- readable contrast
- reduced motion option
- mute option
- no essential info conveyed by color alone
- pause button
- skip game / return to portfolio button

## Motion sensitivity

Fast games can be visually intense.

Add a reduced motion setting if possible:

```txt
less screen shake
fewer particles
reduced background movement
```

## Mobile

Mobile support can be added later.

Do not let mobile controls slow down the first prototype.

If supporting mobile:

```txt
drag left/right to steer
hold to accelerate
tap to jump
button for focus
```

## Polish priorities

Add polish in this order:

```txt
responsive movement feel
clear collision feedback
landing feedback
speed trail
near-miss feedback
focus mode visual
overclock visual
patch pulse visual
score popups
sound effects
```

## Feedback examples

### Crash

```txt
screen shake
brief red flash
combo breaks
speed drops
sound cue
```

### Near miss

```txt
small spark
+50 text
combo pulse
```

### Focus Mode

```txt
slight desaturation
slow-motion trail
focus meter drains
```

### Overclock

```txt
speed lines
stronger trail
score multiplier pulse
```

### Patch Pulse

```txt
landing ring expands
nearby obstacles pop
score text appears for cleared obstacles
```
