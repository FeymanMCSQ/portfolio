# AI Context Brief

This file is written directly for the AI coding agent.

## What you are building

You are building **Runtime Rush**, a small 2D browser skating game for a software engineer's portfolio website.

This is not a generic game.

This is a tightly scoped, design-led browser game.

## Purpose

The project should:

```txt
be fun as a game
demonstrate engineering skill
show interaction design taste
remain small enough to finish
fit inside a portfolio website
```

## Most important design idea

```txt
Fast movement where greed creates danger.
```

The player should want to go faster because it gives more score, but going faster should increase the risk of crashing.

## Core player actions

The player can:

```txt
steer
accelerate
jump
activate Focus Mode when the meter is full
use Patch Pulse after collecting/arming it
enter Overclock through a risky reward
```

## What matters most

Prioritize:

```txt
movement feel
jump responsiveness
readable obstacles
fair collision
score feedback
replayability
maintainable code
```

## What to avoid

Avoid:

```txt
giant files
magic numbers scattered everywhere
React state updates every frame
unrelated new mechanics
large rewrites
overengineering
inventing new game systems without being asked
```

## Build order

Do not build the full game at once.

Use this order:

```txt
movement
jump
obstacles
collision
score
combo
overclock
focus mode
patch pulse
portfolio unlocks
menus
polish
```

## Definition of early success

Early success is:

```txt
A grey-box prototype that is fun for 60 seconds.
```
