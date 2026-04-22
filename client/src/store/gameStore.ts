import { create } from "zustand";
import { GameState } from "../socket/protocol";

interface AuthResult {
  success: boolean;
  role: "organizer" | "participant" | null;
  participantId?: string;
}

interface GameStore {
  gameState: GameState | null;
  connected: boolean;
  authResult: AuthResult | null;
  error: string | null;
  onReconnect: (() => void) | null;

  setGameState: (state: GameState) => void;
  setConnected: (connected: boolean) => void;
  setAuthResult: (result: AuthResult) => void;
  setError: (error: string | null) => void;
  setOnReconnect: (fn: (() => void) | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  connected: false,
  authResult: null,
  error: null,
  onReconnect: null,

  setGameState: (gameState) => set({ gameState, error: null }),
  setConnected: (connected) => set({ connected }),
  setAuthResult: (authResult) => set({ authResult }),
  setError: (error) => set({ error }),
  setOnReconnect: (fn) => set({ onReconnect: fn }),
}));
