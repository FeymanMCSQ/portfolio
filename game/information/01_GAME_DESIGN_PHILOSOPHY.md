# Game Design Philosophy

## Fun comes first

Runtime Rush should be a game first and a portfolio feature second.

The core movement should be enjoyable even with placeholder shapes.

## Start with the toy

Before building the full game, build a toy:

```txt
The player can move, accelerate, steer, and jump.
It feels good before score, power-ups, menus, or portfolio content exist.
```

If the toy is not fun, do not add more systems yet.

## One strong mechanic beats many weak mechanics

The core mechanic is:

```txt
Control momentum at high speed.
```

Everything else should support that.

Good additions:

- jumping that interacts with speed
- score multipliers for speed
- near-miss bonuses
- Overclock increasing speed and danger
- Focus Mode helping the player survive chaos
- Patch Pulse rewarding strong landings

Bad additions for version 1:

- unrelated combat system
- inventory system
- dialogue system
- complex upgrade trees
- multiplayer
- complex procedural worlds

## Failure should feel fair

When the player crashes, the reaction should be:

```txt
I went too fast.
I jumped too late.
I got greedy.
I should have used Focus Mode.
```

Not:

```txt
That obstacle was impossible.
The hitbox lied.
The game randomly killed me.
I could not see what happened.
```

## Readable challenge

Obstacles should form readable patterns, not random garbage.

Good obstacle design creates rhythm:

```txt
easy obstacle → harder obstacle → reward path → risky shortcut → recovery moment
```

## Do not solve boredom with features

If the game feels boring, first tune:

- acceleration
- friction
- max speed
- obstacle spacing
- score feedback
- near misses
- jump feel
- camera/world speed

Do not immediately add new mechanics.
