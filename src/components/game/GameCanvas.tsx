"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createInputManager } from "@/game/systems/inputManager";
import { createGameLoop } from "@/game/core/gameLoop";
import { GAME_CONFIG } from "@/game/config/gameConfig";
import { initializeAudio } from "@/game/audio/audioSystem";
import AdminPanel from "./AdminPanel";
import styles from "./GameCanvas.module.css";

const GAME_ASPECT = 16 / 9;
const PORTRAIT_BLOCK_WIDTH = 760;
const MAX_DPR = 3;
const CV = GAME_CONFIG.canvas;

export default function GameCanvas() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [portraitBlocked, setPortraitBlocked] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const updatePortraitState = useCallback(() => {
    const viewport = getViewportSize();
    setPortraitBlocked(
      viewport.width < viewport.height && viewport.width < PORTRAIT_BLOCK_WIDTH
    );
  }, []);

  const mapClientPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };

    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / CV.width, rect.height / CV.height);
    const renderedWidth = CV.width * scale;
    const renderedHeight = CV.height * scale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;

    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current;
    if (!root || typeof document === "undefined") return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void root.requestFullscreen?.();
  }, []);

  useEffect(() => {
    updatePortraitState();
    window.addEventListener("resize", updatePortraitState);
    window.addEventListener("orientationchange", updatePortraitState);
    window.visualViewport?.addEventListener("resize", updatePortraitState);

    return () => {
      window.removeEventListener("resize", updatePortraitState);
      window.removeEventListener("orientationchange", updatePortraitState);
      window.visualViewport?.removeEventListener("resize", updatePortraitState);
    };
  }, [updatePortraitState]);

  useEffect(() => {
    const updateFullscreen = () => {
      setFullscreen(document.fullscreenElement === rootRef.current);
    };

    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    if (portraitBlocked) return;

    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const resizeCanvas = () => {
      const rect = frame.getBoundingClientRect();
      const displayWidth = Math.max(1, Math.round(rect.width));
      const displayHeight = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const backingWidth = Math.max(1, Math.round(displayWidth * dpr));
      const backingHeight = Math.max(1, Math.round(displayHeight * dpr));

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      if (canvas.width !== backingWidth) canvas.width = backingWidth;
      if (canvas.height !== backingHeight) canvas.height = backingHeight;
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(frame);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);
    window.visualViewport?.addEventListener("resize", resizeCanvas);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
      window.visualViewport?.removeEventListener("resize", resizeCanvas);
    };
  }, [portraitBlocked]);

  useEffect(() => {
    if (portraitBlocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    initializeAudio();
    const input = createInputManager({ mapClientPoint });
    const loop = createGameLoop(canvas, input.getState);

    loop.start();

    return () => {
      loop.stop();
      input.destroy();
    };
  }, [mapClientPoint, portraitBlocked]);

  if (portraitBlocked) {
    return (
      <section className={styles.rotateShell}>
        <div className={styles.rotateCard}>
          <div className={styles.rotateIcon} aria-hidden="true">
            <span />
          </div>
          <h1>Rotate your device</h1>
          <p>Runtime Rush is designed for landscape. Rotate your device to play.</p>
          <Link href="/" className={styles.rotateLink}>
            Back to portfolio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className={styles.gameShell}
      style={{ "--game-aspect": String(GAME_ASPECT) } as CSSProperties}
    >
      <div ref={frameRef} className={styles.gameFrame}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Runtime Rush game"
        />
        <div className={styles.frameActions}>
          <button
            type="button"
            className={styles.fullscreenButton}
            onClick={toggleFullscreen}
            title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {fullscreen ? "EXIT" : "FULL"}
          </button>
        </div>
        <AdminPanel />
      </div>
    </section>
  );
}

function getViewportSize(): { width: number; height: number } {
  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
}
