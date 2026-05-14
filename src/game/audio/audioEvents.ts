import type { AudioEventName, GameState } from "../core/types";

export function queueAudioEvent(state: GameState, name: AudioEventName): void {
  state.audioEvents.push(name);
}
