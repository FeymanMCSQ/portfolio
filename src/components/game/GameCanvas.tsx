"use client";

import Link from "next/link";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createInputManager, type InputManager, type TouchPressAction } from "@/game/systems/inputManager";
import { createGameLoop, type GameControlStatus } from "@/game/core/gameLoop";
import { initializeAudio, unlockAudio } from "@/game/audio/audioSystem";
import AdminPanel from "./AdminPanel";
import styles from "./GameCanvas.module.css";

const GAME_ASPECT = 16 / 9;
const PORTRAIT_BLOCK_WIDTH = 760;
const MAX_DPR = 3;
const DEFAULT_CONTROL_STATUS: GameControlStatus = {
  phase: "idle",
  focusAvailable: false,
  focusActive: false,
  patchAvailable: false,
  patchCount: 0,
  audioMuted: false,
  pumpAvailable: false,
};

export default function GameCanvas() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<InputManager | null>(null);
  const mobileControlsVisibleRef = useRef(false);
  const [portraitBlocked, setPortraitBlocked] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlStatus, setControlStatus] = useState<GameControlStatus>(
    DEFAULT_CONTROL_STATUS
  );

  const updateViewportMode = useCallback(() => {
    const viewport = getViewportSize();
    setPortraitBlocked(
      viewport.width < viewport.height && viewport.width < PORTRAIT_BLOCK_WIDTH
    );
    mobileControlsVisibleRef.current =
      viewport.width > viewport.height && isCoarseTouchPointer();
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

  const startAccelerating = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      unlockAudio();
      inputRef.current?.setTouchHold("accelerating", event.pointerId, true);
    },
    []
  );

  const stopAccelerating = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      inputRef.current?.setTouchHold("accelerating", event.pointerId, false);
    },
    []
  );

  const pressTouchAction = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      action: TouchPressAction,
      enabled = true
    ) => {
      event.preventDefault();
      event.stopPropagation();
      if (!enabled) return;
      unlockAudio();
      inputRef.current?.pressTouchAction(action);
    },
    []
  );

  useEffect(() => {
    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);
    window.addEventListener("orientationchange", updateViewportMode);
    window.visualViewport?.addEventListener("resize", updateViewportMode);

    return () => {
      window.removeEventListener("resize", updateViewportMode);
      window.removeEventListener("orientationchange", updateViewportMode);
      window.visualViewport?.removeEventListener("resize", updateViewportMode);
    };
  }, [updateViewportMode]);

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
    const input = createInputManager();
    const loop = createGameLoop(canvas, input.getState, {
      getRenderOptions: () => ({
        showDebugOverlay: !mobileControlsVisibleRef.current,
        showControlsHint: !mobileControlsVisibleRef.current,
      }),
    });
    inputRef.current = input;

    const syncControlStatus = () => {
      const next = loop.getControlStatus();
      setControlStatus((current) =>
        controlStatusEqual(current, next) ? current : next
      );
    };

    syncControlStatus();
    const statusTimer = window.setInterval(syncControlStatus, 120);
    loop.start();

    return () => {
      window.clearInterval(statusTimer);
      input.releaseAllTouch();
      loop.stop();
      input.destroy();
      inputRef.current = null;
      setControlStatus(DEFAULT_CONTROL_STATUS);
    };
  }, [portraitBlocked]);

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
      onContextMenu={(event) => event.preventDefault()}
    >
      <div ref={frameRef} className={styles.gameFrame}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Runtime Rush game"
        />
        <div className={styles.mobileControls} aria-label="Mobile game controls">
          <button
            type="button"
            className={`${styles.touchZone} ${styles.leftTouchZone}`}
            onPointerDown={startAccelerating}
            onPointerUp={stopAccelerating}
            onPointerCancel={stopAccelerating}
            onLostPointerCapture={stopAccelerating}
            aria-label="Hold to accelerate"
          >
            <span className={styles.touchHint}>HOLD = SPEED</span>
          </button>
          <button
            type="button"
            className={`${styles.touchZone} ${styles.rightTouchZone}`}
            onPointerDown={(event) => {
              pressTouchAction(event, "jump");
              inputRef.current?.pressTouchAction("restart");
            }}
            aria-label="Tap to jump"
          >
            <span className={styles.touchHint}>TAP = JUMP</span>
          </button>
          <div className={`${styles.controlDock} ${styles.leftControlDock}`}>
            <button
              type="button"
              className={styles.touchButton}
              disabled={!controlStatus.focusAvailable}
              data-active={controlStatus.focusActive ? "true" : undefined}
              onPointerDown={(event) =>
                pressTouchAction(event, "focus", controlStatus.focusAvailable)
              }
            >
              FOCUS
            </button>
            <button
              type="button"
              className={`${styles.touchButton} ${styles.pumpButton}`}
              disabled={!controlStatus.pumpAvailable}
              onPointerDown={(event) =>
                pressTouchAction(event, "pump", controlStatus.pumpAvailable)
              }
            >
              PUMP
            </button>
          </div>
          <div className={`${styles.controlDock} ${styles.rightControlDock}`}>
            <button
              type="button"
              className={styles.touchButton}
              disabled={!controlStatus.patchAvailable}
              onPointerDown={(event) =>
                pressTouchAction(event, "usePatch", controlStatus.patchAvailable)
              }
            >
              PATCH
              <span className={styles.touchButtonMeta}>x{controlStatus.patchCount}</span>
            </button>
          </div>
          <button
            type="button"
            className={`${styles.cornerTouchButton} ${styles.muteTouchButton}`}
            onPointerDown={(event) => pressTouchAction(event, "mute")}
            aria-label={controlStatus.audioMuted ? "Unmute sound" : "Mute sound"}
          >
            {controlStatus.audioMuted ? "UNMUTE" : "MUTE"}
          </button>
        </div>
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

function isCoarseTouchPointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function controlStatusEqual(
  a: GameControlStatus,
  b: GameControlStatus
): boolean {
  return (
    a.phase === b.phase &&
    a.focusAvailable === b.focusAvailable &&
    a.focusActive === b.focusActive &&
    a.patchAvailable === b.patchAvailable &&
    a.patchCount === b.patchCount &&
    a.audioMuted === b.audioMuted &&
    a.pumpAvailable === b.pumpAvailable
  );
}
