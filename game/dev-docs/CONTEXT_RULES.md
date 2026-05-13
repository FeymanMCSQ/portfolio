# Context Rules

Rules for loading context efficiently in this project. Follow these to avoid wasting tokens on files you don't need.

---

## Session startup

Read exactly these files, in order:

1. `game/dev-docs/CURRENT_STATE.md`
2. `game/dev-docs/QUEST_LOG.md`
3. If a quest is in progress: `game/dev-docs/QUEST_NN_NAME.md`

Stop there. Do not read source files speculatively.

---

## Before touching a source file

Read it only when you are about to edit it or need a specific fact from it (a type name, a function signature, a config value). Do not read files to "understand the codebase" in general — CURRENT_STATE.md covers that.

---

## Do NOT read automatically

- `QUEST_01_MOVEMENT.md` — historical, only needed if debugging physics foundations
- `QUEST_02_JUMP.md` — historical, only needed if modifying jump
- `QUEST_03_OBSTACLES.md` — historical, only needed if modifying obstacles
- `src/app/**` — Next.js page shell, rarely needs changing during game quests
- `package.json`, `tsconfig.json`, `next.config.ts` — stable, read only if there's a build error

---

## After completing a quest

1. Update `CURRENT_STATE.md`:
   - Change "Active quest" line
   - Update "What exists" section
   - Update GameState shape if it changed
   - Update "Pending" list
2. Append a row to `QUEST_LOG.md`
3. Write `game/dev-docs/QUEST_NN_NAME.md` covering: what was built, key design decisions, physics values, what was NOT built, files changed

---

## Memory system

Persistent memory lives in `~/.claude/projects/.../memory/`. The index is `MEMORY.md`. Use it for user preferences, feedback, and project-level facts that are NOT derivable from source code. Do not duplicate what's in CURRENT_STATE.md.

---

## Quick reference: file purposes

| File | Read when |
|------|-----------|
| `CURRENT_STATE.md` | Every session start |
| `QUEST_LOG.md` | Every session start |
| `QUEST_NN_*.md` | Active quest only |
| `gameConfig.ts` | Changing physics values |
| `types.ts` | Adding/changing state shape |
| `gameLoop.ts` | Changing update order, phases, restart |
| `playerController.ts` | Changing movement physics |
| `terrainSystem.ts` | Changing terrain generation, sampling, ramps, gaps, terrain blocks |
| `collisionSystem.ts` | Changing collision rules |
| `renderer.ts` | Changing visuals |
| `AdminPanel.tsx` | Adding/removing tunable values |
| `GameCanvas.tsx` | Mounting, canvas setup |
| `gameState.ts` | Changing initial state |
| `inputManager.ts` | Adding input keys |
