export interface InputState {
  accelerating: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  restart: boolean;
  focus: boolean;
  usePatch: boolean;
  pump: boolean;
  mute: boolean;
}

export type TouchHoldAction = "accelerating";
export type TouchPressAction = "jump" | "restart" | "focus" | "usePatch" | "pump" | "mute";

export interface InputManager {
  getState: () => InputState;
  destroy: () => void;
  setTouchHold: (action: TouchHoldAction, pointerId: number, active: boolean) => void;
  pressTouchAction: (action: TouchPressAction) => void;
  releaseAllTouch: () => void;
}

export function createInputManager(): InputManager {
  const keyboardState: InputState = {
    accelerating: false,
    left: false,
    right: false,
    jump: false,
    restart: false,
    focus: false,
    usePatch: false,
    pump: false,
    mute: false,
  };
  const queuedTouchState: Record<TouchPressAction, boolean> = {
    jump: false,
    restart: false,
    focus: false,
    usePatch: false,
    pump: false,
    mute: false,
  };
  const touchAccelerators = new Set<number>();

  const releaseAllInput = () => {
    keyboardState.accelerating = false;
    keyboardState.left = false;
    keyboardState.right = false;
    keyboardState.jump = false;
    keyboardState.restart = false;
    keyboardState.focus = false;
    keyboardState.usePatch = false;
    keyboardState.pump = false;
    keyboardState.mute = false;
    touchAccelerators.clear();
    clearQueuedTouchState();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        keyboardState.accelerating = true;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        keyboardState.left = true;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        keyboardState.right = true;
        break;
      case " ":
        keyboardState.jump = true;
        break;
      case "r":
      case "R":
        keyboardState.restart = true;
        break;
      case "Shift":
        keyboardState.focus = true;
        break;
      case "e":
      case "E":
        keyboardState.usePatch = true;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        keyboardState.pump = true;
        break;
      case "m":
      case "M":
        keyboardState.mute = true;
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
        keyboardState.accelerating = false;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        keyboardState.left = false;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        keyboardState.right = false;
        break;
      case " ":
        keyboardState.jump = false;
        break;
      case "r":
      case "R":
        keyboardState.restart = false;
        break;
      case "Shift":
        keyboardState.focus = false;
        break;
      case "e":
      case "E":
        keyboardState.usePatch = false;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        keyboardState.pump = false;
        break;
      case "m":
      case "M":
        keyboardState.mute = false;
        break;
    }
  };

  // Guard: window may not exist during SSR
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAllInput);
  }

  return {
    getState: () => {
      const next = {
        accelerating: keyboardState.accelerating || touchAccelerators.size > 0,
        left: keyboardState.left,
        right: keyboardState.right,
        jump: keyboardState.jump || queuedTouchState.jump,
        restart: keyboardState.restart || queuedTouchState.restart,
        focus: keyboardState.focus || queuedTouchState.focus,
        usePatch: keyboardState.usePatch || queuedTouchState.usePatch,
        pump: keyboardState.pump || queuedTouchState.pump,
        mute: keyboardState.mute || queuedTouchState.mute,
      };
      clearQueuedTouchState();
      return next;
    },
    destroy: () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", releaseAllInput);
      }
      releaseAllInput();
    },
    setTouchHold: (action, pointerId, active) => {
      if (action !== "accelerating") return;
      if (active) {
        touchAccelerators.add(pointerId);
      } else {
        touchAccelerators.delete(pointerId);
      }
    },
    pressTouchAction: (action) => {
      queuedTouchState[action] = true;
    },
    releaseAllTouch: () => {
      touchAccelerators.clear();
      clearQueuedTouchState();
    },
  };

  function clearQueuedTouchState(): void {
    queuedTouchState.jump = false;
    queuedTouchState.restart = false;
    queuedTouchState.focus = false;
    queuedTouchState.usePatch = false;
    queuedTouchState.pump = false;
    queuedTouchState.mute = false;
  }
}
