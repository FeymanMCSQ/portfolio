# Runtime Rush — Claude Instructions

## Context loading

**Do not read all docs on startup.** Read only these three files at the start of every session:

1. `game/dev-docs/CURRENT_STATE.md` — what exists, what's next
2. `game/dev-docs/QUEST_LOG.md` — which quests are done
3. The current quest file if one is in progress (listed in CURRENT_STATE.md)

Read source files only when you need to make a specific change. Do not pre-read the whole codebase.

## Quest work

Before starting a new quest: read CURRENT_STATE.md and QUEST_LOG.md only. If the quest needs more context, read the relevant source files then.

After completing a quest:
- Update `CURRENT_STATE.md` (bump completed quest, set next quest)
- Append a one-line entry to `QUEST_LOG.md`
- Write a `QUEST_NN_NAME.md` in `game/dev-docs/`

## Style rules

- No comments unless the WHY is non-obvious
- No error handling for things that can't fail
- No abstractions beyond what the current quest requires
- Keep responses concise — no trailing summaries after code edits

## Key files

```
src/game/config/gameConfig.ts       — all tunable numbers (mutable, no as const)
src/game/core/types.ts              — GameState, PlayerState, TerrainSegment
src/game/core/gameLoop.ts           — RAF loop, owns state, handles restart
src/game/core/gameState.ts          — createInitialGameState()
src/game/systems/inputManager.ts    — keyboard → InputState
src/game/systems/playerController.ts
src/game/systems/terrainSystem.ts
src/game/systems/collisionSystem.ts
src/game/rendering/renderer.ts
src/components/game/GameCanvas.tsx  — mounts canvas + AdminPanel
src/components/game/AdminPanel.tsx  — localhost-only live tuning panel
```

## Context rules detail

See `game/dev-docs/CONTEXT_RULES.md` if needed.
