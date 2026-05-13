# Mechanics and Power-Ups

## Core mechanic: Momentum skating

The player skates forward through a scrolling 2D space.

The player can:

```txt
steer
accelerate
slow down naturally
jump
```

Speed affects:

- score gain
- reaction time
- jump distance/reward
- risk level
- visual intensity

## Secondary mechanic: Jump

Jumping is used to:

- clear ground obstacles
- cross gaps
- trigger Patch Pulse
- maintain combo
- take risky reward paths

## Power-up 1: Overclock

### Purpose

Overclock is a greed mechanic.

### Effect

```txt
speed increases significantly
score multiplier increases
reaction time decreases
danger increases
```

### Design role

Overclock should make the player think:

```txt
I can score more, but I might crash.
```

## Power-up 2: Focus Mode

### Purpose

Focus Mode gives the player agency and control during overwhelming moments.

### Effect

```txt
focus meter fills during play
at 100%, player can activate Focus Mode
time slows down
focus meter drains
normal time resumes when meter is empty
```

### Design role

Focus Mode should make the player think:

```txt
I saved that run because I activated focus at the right time.
```

## Power-up 3: Patch Pulse

### Purpose

Patch Pulse makes landing meaningful and aggressive.

### Effect

```txt
collect or arm Patch Pulse
next landing creates a shockwave
shockwave clears nearby eligible ground obstacles
cleared obstacles award score
radius can scale with speed
```

### Design role

Patch Pulse should make the player think:

```txt
Where should I land?
Can I clear that cluster?
Can I keep my combo alive?
```

### Important rule

Patch Pulse should not clear the entire screen.

It should clear a local radius around the landing point.

## Why these three work together

```txt
Overclock = greed
Focus Mode = control
Patch Pulse = impact/style
```

Ideal high-skill moment:

```txt
go fast
→ get overwhelmed
→ enter Focus Mode
→ line up a jump
→ land with Patch Pulse
→ clear obstacles
→ keep combo
```
