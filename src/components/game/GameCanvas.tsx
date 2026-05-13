"use client";

import { useEffect, useRef } from "react";
import { createInputManager } from "@/game/systems/inputManager";
import { createGameLoop } from "@/game/core/gameLoop";
import { GAME_CONFIG } from "@/game/config/gameConfig";
import AdminPanel from "./AdminPanel";

const { width, height } = GAME_CONFIG.canvas;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const input = createInputManager();
    const loop = createGameLoop(canvas, input.getState);

    loop.start();

    return () => {
      loop.stop();
      input.destroy();
    };
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: "block",
          maxWidth: "100vw",
          height: "auto",
          outline: "1px solid rgba(60,80,160,0.4)",
        }}
      />
      <AdminPanel />
    </div>
  );
}
