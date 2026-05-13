# Folder Structure

Recommended structure for a Next.js project with a browser game route.

```txt
src/
  app/
    page.tsx
    play/
      page.tsx

  components/
    portfolio/
      Hero.tsx
      ProjectCard.tsx
      SkillsSection.tsx
      ContactSection.tsx

    game/
      GameCanvas.tsx
      GameHUD.tsx
      GameMenu.tsx
      UnlockCard.tsx

  game/
    config/
      gameConfig.ts
      obstacleConfig.ts
      powerUpConfig.ts

    core/
      gameLoop.ts
      gameState.ts
      types.ts
      events.ts

    systems/
      inputManager.ts
      playerController.ts
      obstacleManager.ts
      collisionSystem.ts
      scoreSystem.ts
      powerUpSystem.ts
      particleSystem.ts

    rendering/
      renderer.ts
      drawPlayer.ts
      drawObstacles.ts
      drawParticles.ts
      drawDebug.ts

    utils/
      math.ts
      random.ts
      collision.ts
      clamp.ts

  content/
    portfolioCards.ts
    projects.ts
    skills.ts

  styles/
    globals.css
```

## Rules

### `components/game`

React components only.

Use this for:

- game canvas wrapper
- HUD
- menus
- overlays
- unlock cards

Do not place physics or game rules here.

### `game/core`

Core loop, state, events, and shared types.

### `game/systems`

Gameplay logic.

Each system should be focused.

### `game/rendering`

Canvas drawing code.

Rendering code should read state and draw it. It should not decide gameplay rules.

### `game/config`

Tunable values.

If a number affects game feel, it probably belongs here.

### `content`

Portfolio content that can be displayed in the normal site and unlocked in the game.

Do not duplicate portfolio content across multiple files.

## Naming conventions

Use clear names:

```txt
playerController.ts
collisionSystem.ts
scoreSystem.ts
powerUpSystem.ts
```

Avoid vague names:

```txt
helpers.ts
stuff.ts
logic.ts
manager.ts
```

A `helpers.ts` file often becomes a dumping ground. Prefer specific utility files.
