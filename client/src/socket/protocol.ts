// Mirror of server types — keep in sync with server/src/state/types.ts
export type Vibe = "energetic" | "calm";
export type Prop = "mop" | "sash_ribbon" | "belt";
export type Furniture = "chair" | "table" | "wide_couch";
export type Role = "A" | "B";

export interface Song {
  id: string;
  submittedBy: string;
  url: string;
  vibe: Vibe;
  used: boolean;
}

export interface SafeParticipant {
  id: string;
  name: string;
  role: Role | null;
  songs: Song[];
  exclusions: string[];
  songsSubmitted: boolean;
  exclusionsSubmitted: boolean;
}

export interface Pair {
  id: string;
  roundNumber: 1 | 2 | 3 | 4;
  pairIndex: 0 | 1 | 2 | 3;
  participantA: string;
  participantB: string;
  availableSongs: string[];
  selectedSong: string | null;
  songVotes: Record<string, string>;
  selectedProp: Prop | null;
  selectedFurniture: Furniture[];
  propsSubmittedBy: string | null;
  propsConfirmedBy: string | null;
}

export interface Round {
  roundNumber: 1 | 2 | 3 | 4;
  roleSwapped: boolean;
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

// WS Messages — Client → Server
export type ClientMessage =
  | { type: "AUTH_ORGANIZER"; pin: string }
  | { type: "AUTH_PARTICIPANT"; name: string; pin: string }
  | { type: "DISPLAY_CONNECT" }
  | { type: "ADD_PARTICIPANT"; name: string; pin: string }
  | { type: "REMOVE_PARTICIPANT"; participantId: string }
  | { type: "ADVANCE_PHASE" }
  | { type: "COMPUTE_PAIRINGS" }
  | { type: "DRAW_COMPLETE" }
  | { type: "SUBMIT_SONGS"; participantId: string; songs: Array<{ url: string; vibe: Vibe }> }
  | { type: "SET_EXCLUSIONS"; participantId: string; excludedIds: string[] }
  | { type: "SELECT_ROLE"; participantId: string; role: Role }
  | { type: "VOTE_SONG"; participantId: string; songId: string }
  | { type: "BREAK_SONG_TIE"; songId: string }
  | { type: "SUBMIT_PROPS"; participantId: string; prop: Prop; furniture: Furniture[] }
  | { type: "CONFIRM_PROPS"; participantId: string }
  | { type: "OVERRIDE_PROPS" };

// WS Messages — Server → Client
export type ServerMessage =
  | { type: "STATE_UPDATE"; payload: GameState }
  | { type: "AUTH_RESULT"; success: boolean; role: "organizer" | "participant" | null; participantId?: string }
  | { type: "ERROR"; code: string; message: string };
