# Runtime Rush Engineering Docs

These docs are intended to guide an AI coding agent while building **Runtime Rush**, a browser-based 2D skating portfolio game.

The goal is to keep the AI grounded in clean engineering practice instead of letting it generate a messy pile of code.

## How to use this folder

Before asking the AI to implement a feature, point it to the relevant docs.

Example:

```txt
Read docs/01_AI_CODING_RULES.md, docs/03_GAME_ARCHITECTURE.md, and docs/05_GAME_LOOP_AND_STATE.md before implementing player movement.
Follow the rules strictly.
```

## Recommended reading order

1. `00_PROJECT_BRIEF.md`
2. `01_AI_CODING_RULES.md`
3. `02_ENGINEERING_PRINCIPLES.md`
4. `03_GAME_ARCHITECTURE.md`
5. `04_FOLDER_STRUCTURE.md`
6. `05_GAME_LOOP_AND_STATE.md`
7. `06_RENDERING_AND_PERFORMANCE.md`
8. `07_INPUT_PHYSICS_COLLISION.md`
9. `08_FEATURE_IMPLEMENTATION_WORKFLOW.md`
10. `09_TESTING_DEBUGGING.md`
11. `10_UI_ACCESSIBILITY_POLISH.md`
12. `11_DEFINITION_OF_DONE.md`

## Core rule

Do not build the whole game at once.

Build the smallest playable prototype first:

```txt
movement → jump → obstacles → score → overclock → focus mode → patch pulse → portfolio integration
```
