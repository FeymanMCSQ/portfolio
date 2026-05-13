# AI Prompt Templates

Use these prompts when asking an AI coding agent to work on the project.

## General implementation prompt

```txt
Read the relevant docs before coding:
- docs/01_AI_CODING_RULES.md
- docs/02_ENGINEERING_PRINCIPLES.md
- docs/03_GAME_ARCHITECTURE.md
- docs/11_DEFINITION_OF_DONE.md

Task:
Implement [FEATURE].

Constraints:
- Make the smallest working change.
- Do not rewrite unrelated systems.
- Keep game logic outside React components where possible.
- Use config values for tunable numbers.
- Preserve existing behavior.
- After coding, summarize changed files and how to test manually.
```

## Movement prompt

```txt
Implement the first movement prototype.

Read:
- docs/01_AI_CODING_RULES.md
- docs/05_GAME_LOOP_AND_STATE.md
- docs/07_INPUT_PHYSICS_COLLISION.md
- docs/11_DEFINITION_OF_DONE.md

Requirements:
- Canvas-based game area.
- Player represented by a simple shape.
- Left/right steering.
- Hold accelerate to increase speed.
- Release accelerate to decelerate.
- Clamp speed.
- Show speed in a simple HUD/debug overlay.
- No obstacles yet.
- No power-ups yet.
```

## Jump prompt

```txt
Add grounded jumping to the movement prototype.

Requirements:
- Space triggers jump.
- Player can only jump when grounded.
- Gravity pulls player down.
- Landing is detected.
- Jump should feel responsive.
- Use config values for gravity and jump velocity.
- Add a simple landing visual or debug state.
- Do not add power-ups.
```

## Obstacle prompt

```txt
Add the first obstacle system.

Requirements:
- Spawn simple ground obstacles.
- Obstacles move toward/past the player according to world speed.
- Player crashes when colliding.
- Use forgiving hitboxes.
- Remove off-screen obstacles.
- Add debug rendering for hitboxes if practical.
- Keep obstacle config in a config file.
```

## Review prompt

```txt
Review the current implementation against:
- docs/01_AI_CODING_RULES.md
- docs/02_ENGINEERING_PRINCIPLES.md
- docs/11_DEFINITION_OF_DONE.md

Find:
1. Architecture problems
2. Scope creep
3. Files with too many responsibilities
4. Magic numbers that should move to config
5. Bugs likely to appear during gameplay
6. The five highest-leverage fixes
```

## Refactor prompt

```txt
Refactor only the specific issue below.

Issue:
[DESCRIBE ISSUE]

Rules:
- Do not change gameplay behavior unless necessary.
- Do not rewrite unrelated code.
- Keep public interfaces stable where possible.
- Explain why the refactor improves maintainability.
- List manual tests to confirm nothing broke.
```
