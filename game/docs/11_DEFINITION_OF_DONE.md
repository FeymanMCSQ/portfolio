# Definition of Done

A feature is not done just because code was written.

A feature is done when it is implemented, playable, understandable, reset-safe, and does not break the rest of the game.

## General definition of done

For every feature:

```txt
Feature works in the game.
Feature has clear ownership in the codebase.
Feature does not create unrelated changes.
Feature uses configuration values where tuning is expected.
Feature resets correctly after game over/restart.
Feature does not spam the console.
Feature does not cause TypeScript errors.
Feature does not reduce performance noticeably.
```

## Movement done

Movement is done when:

```txt
player accelerates
player decelerates
player steers
speed is clamped
movement feels responsive
movement works after restart
key states do not get stuck
```

## Jump done

Jump is done when:

```txt
player can jump from ground
player cannot infinite-jump unless designed
gravity works
landing is detected
jump has clear visual feedback
jump works with current speed
```

## Obstacles done

Obstacles are done when:

```txt
obstacles spawn off-screen or ahead of player
obstacles move consistently
obstacles can be avoided
obstacles are removed when off-screen
obstacle patterns are readable
no impossible patterns in normal mode
```

## Collision done

Collision is done when:

```txt
player collides with obstacles
collectibles can be collected
hitboxes feel fair
near-miss detection works if implemented
collision debug view exists or can be enabled
```

## Score done

Score is done when:

```txt
distance score increases
speed affects score
combo can increase
combo resets on crash
score resets on new run
HUD displays score clearly
```

## Overclock done

Overclock is done when:

```txt
player can collect/activate it
speed increases temporarily
score multiplier increases temporarily
timer ends correctly
state resets on restart
visual feedback makes it obvious
```

## Focus Mode done

Focus Mode is done when:

```txt
meter fills during play
meter reaches 100%
player can activate focus manually
time slows while active
meter drains while active
focus ends correctly
state resets on restart
HUD communicates availability clearly
```

## Patch Pulse done

Patch Pulse is done when:

```txt
player can collect/arm it
next landing triggers shockwave
shockwave clears nearby eligible obstacles
shockwave radius is configurable
cleared obstacles award score
state resets after use
state resets on restart
visual feedback is clear
```

## Portfolio integration done

Portfolio integration is done when:

```txt
all important information exists outside the game
game unlock cards are short
cards link to normal portfolio sections
game has clear exit back to portfolio
game does not block recruiter access
```

## First milestone done

The first milestone is done when:

```txt
grey-box prototype is playable for 60 seconds
movement feels decent
jumping is usable
obstacles are fair
score exists
player wants to retry after crashing
```
