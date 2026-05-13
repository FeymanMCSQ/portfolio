export interface InputState {
  accelerating: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  restart: boolean;
  focus: boolean;
}

export function createInputManager(): {
  getState: () => InputState;
  destroy: () => void;
} {
  const TAP_MAX_MS = 180;
  const TAP_MAX_MOVE = 18;

  const state: InputState = {
    accelerating: false,
    left: false,
    right: false,
    jump: false,
    restart: false,
    focus: false,
  };
  let touchJumpQueued = false;
  let touchRestartQueued = false;
  let touchStartAt = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        state.accelerating = true;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        state.left = true;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        state.right = true;
        break;
      case " ":
        state.jump = true;
        break;
      case "r":
      case "R":
        state.restart = true;
        break;
      case "Shift":
        state.focus = true;
        break;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Shift"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        state.accelerating = false;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        state.left = false;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        state.right = false;
        break;
      case " ":
        state.jump = false;
        break;
      case "r":
      case "R":
        state.restart = false;
        break;
      case "Shift":
        state.focus = false;
        break;
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    touchStartAt = performance.now();
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;
    state.accelerating = true;
    e.preventDefault();
  };

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.hypot(dx, dy) > TAP_MAX_MOVE) {
      touchMoved = true;
    }
    e.preventDefault();
  };

  const onTouchEnd = (e: TouchEvent) => {
    const touchDuration = performance.now() - touchStartAt;
    if (!touchMoved && touchDuration <= TAP_MAX_MS) {
      touchJumpQueued = true;
      touchRestartQueued = true;
    }

    if (e.touches.length === 0) {
      state.accelerating = false;
    }
    e.preventDefault();
  };

  const onTouchCancel = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      state.accelerating = false;
    }
    e.preventDefault();
  };

  // Guard: window may not exist during SSR
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("touchcancel", onTouchCancel, { passive: false });
  }

  return {
    getState: () => {
      const next = {
        ...state,
        jump: state.jump || touchJumpQueued,
        restart: state.restart || touchRestartQueued,
      };
      touchJumpQueued = false;
      touchRestartQueued = false;
      return next;
    },
    destroy: () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchCancel);
      }
    },
  };
}
