import { InternalGameState } from "./types.js";

const defaultState: InternalGameState = {
  phase: "setup",
  participants: [],
  rounds: [],
  drawRevealComplete: false,
  pairingFeasible: true,
  updatedAt: new Date().toISOString(),
};

let state: InternalGameState = { ...defaultState };

export function getState(): InternalGameState {
  return state;
}

export function setState(newState: InternalGameState): void {
  state = { ...newState, updatedAt: new Date().toISOString() };
}

export function resetState(): void {
  state = { ...defaultState, updatedAt: new Date().toISOString() };
}
