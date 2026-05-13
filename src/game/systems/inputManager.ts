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
  const state: InputState = {
    accelerating: false,
    left: false,
    right: false,
    jump: false,
    restart: false,
    focus: false,
  };

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

  // Guard: window may not exist during SSR
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  }

  return {
    getState: () => ({ ...state }),
    destroy: () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      }
    },
  };
}
