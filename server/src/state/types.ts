export type Vibe = "energetic" | "calm";
export type Prop = "mop" | "sash_ribbon" | "belt";
export type Furniture = "chair" | "table" | "wide_couch";
export type Role = "A" | "B";

export interface Song {
  id: string;
  submittedBy: string; // participant id
  url: string;
  vibe: Vibe;
  used: boolean; // global — once used, never available again
}

export interface Participant {
  id: string;
  name: string;
  pinHash: string; // bcrypt hash — NEVER broadcast
  role: Role | null;
  songs: Song[];
  exclusions: string[]; // participant ids excluded
  songsSubmitted: boolean;
  exclusionsSubmitted: boolean;
}

export type SafeParticipant = Omit<Participant, "pinHash">;

export interface Pair {
  id: string;
  roundNumber: 1 | 2 | 3 | 4;
  pairIndex: 0 | 1 | 2 | 3;
  participantA: string;
  participantB: string;
  availableSongs: string[]; // song ids
  selectedSong: string | null;
  songVotes: Record<string, string>; // participantId → songId
  selectedProp: Prop | null;
  selectedFurniture: Furniture[];
  propsSubmittedBy: string | null;
  propsConfirmedBy: string | null;
}

export interface Round {
  roundNumber: 1 | 2 | 3 | 4;
  roleSwapped: boolean; // true for rounds 2 and 4
  pairs: Pair[];
}

export type PhaseId =
  | "setup"
  | "song_submission"
  | "exclusion_setting"
  | "role_selection"
  | "pairing_computed"
  | `round_${number}_pair_${number}_draw`
  | `round_${number}_pair_${number}_song`
  | `round_${number}_pair_${number}_props`
  | `round_${number}_pair_${number}_perform`
  | "complete";

export interface GameState {
  phase: PhaseId;
  participants: SafeParticipant[];
  rounds: Round[];
  drawRevealComplete: boolean;
  pairingFeasible: boolean;
  updatedAt: string;
}

// Full internal state (includes pinHash)
export interface InternalGameState {
  phase: PhaseId;
  participants: Participant[];
  rounds: Round[];
  drawRevealComplete: boolean;
  pairingFeasible: boolean;
  updatedAt: string;
}

export function toSafeState(state: InternalGameState): GameState {
  return {
    ...state,
    participants: state.participants.map(({ pinHash: _pinHash, ...rest }) => rest),
  };
}
