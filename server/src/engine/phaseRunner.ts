import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { getState, setState } from "../state/store.js";
import {
  InternalGameState,
  Participant,
  PhaseId,
  Prop,
  Furniture,
  Vibe,
} from "../state/types.js";
import { computePairings } from "./pairingAlgo.js";
import { buildAllRounds } from "./roundBuilder.js";
import { getAvailableSongs } from "./songPool.js";
import { saveToDisk } from "../state/persist.js";
import { broadcastState } from "../ws/broadcast.js";

function save(state: InternalGameState): void {
  setState(state);
  saveToDisk(state);
  broadcastState();
}

function currentPairCoords(
  phase: PhaseId
): { roundIndex: number; pairIndex: number } | null {
  const m = phase.match(/^round_(\d+)_pair_(\d+)_/);
  if (!m) return null;
  return { roundIndex: parseInt(m[1]) - 1, pairIndex: parseInt(m[2]) };
}

function nextPhase(
  state: InternalGameState
): PhaseId {
  const coords = currentPairCoords(state.phase);
  if (!coords) throw new Error("Not in a round phase");
  const { roundIndex, pairIndex } = coords;
  const suffix = state.phase.split("_").slice(-1)[0];

  if (suffix === "draw") return `round_${roundIndex + 1}_pair_${pairIndex}_song`;
  if (suffix === "song") return `round_${roundIndex + 1}_pair_${pairIndex}_props`;
  if (suffix === "props") return `round_${roundIndex + 1}_pair_${pairIndex}_perform`;
  if (suffix === "perform") {
    if (pairIndex < 3) return `round_${roundIndex + 1}_pair_${pairIndex + 1}_draw`;
    if (roundIndex < 3) return `round_${roundIndex + 2}_pair_0_draw`;
    return "complete";
  }
  throw new Error("Unknown suffix");
}

// Check feasibility of pairings given current exclusions
function checkFeasibility(state: InternalGameState): boolean {
  const groupA = state.participants.filter((p) => p.role === "A");
  const groupB = state.participants.filter((p) => p.role === "B");
  if (groupA.length !== 4 || groupB.length !== 4) return true; // not ready yet, no alert
  return computePairings(groupA, groupB) !== null;
}

export function handleAddParticipant(
  name: string,
  pin: string
): { ok: boolean; error?: string } {
  const state = getState();
  if (state.phase !== "setup") return { ok: false, error: "Not in setup phase" };
  if (state.participants.length >= 8) return { ok: false, error: "Already 8 participants" };
  if (state.participants.find((p) => p.name === name)) return { ok: false, error: "Name taken" };

  const pinHash = bcrypt.hashSync(pin, 10);
  const participant: Participant = {
    id: uuidv4(),
    name,
    pinHash,
    role: null,
    songs: [],
    exclusions: [],
    songsSubmitted: false,
    exclusionsSubmitted: false,
  };
  save({ ...state, participants: [...state.participants, participant] });
  return { ok: true };
}

export function handleRemoveParticipant(
  participantId: string
): { ok: boolean; error?: string } {
  const state = getState();
  if (state.phase !== "setup") return { ok: false, error: "Not in setup phase" };
  save({
    ...state,
    participants: state.participants.filter((p) => p.id !== participantId),
  });
  return { ok: true };
}

export function handleAdvancePhase(): { ok: boolean; error?: string } {
  const state = getState();
  const { phase, participants } = state;

  if (phase === "setup") {
    if (participants.length !== 8) return { ok: false, error: "Need exactly 8 participants" };
    save({ ...state, phase: "song_submission" });
    return { ok: true };
  }
  if (phase === "song_submission") {
    if (!participants.every((p) => p.songsSubmitted)) return { ok: false, error: "Not all songs submitted" };
    save({ ...state, phase: "exclusion_setting" });
    return { ok: true };
  }
  if (phase === "exclusion_setting") {
    if (!participants.every((p) => p.exclusionsSubmitted)) return { ok: false, error: "Not all exclusions submitted" };
    save({ ...state, phase: "role_selection" });
    return { ok: true };
  }
  if (phase === "role_selection") {
    const aCount = participants.filter((p) => p.role === "A").length;
    const bCount = participants.filter((p) => p.role === "B").length;
    if (aCount !== 4 || bCount !== 4) return { ok: false, error: "Need 4 A and 4 B" };
    save({ ...state, phase: "pairing_computed" });
    return { ok: true };
  }
  if (phase === "pairing_computed") {
    if (state.rounds.length === 0) return { ok: false, error: "Run COMPUTE_PAIRINGS first" };
    // Start first draw, populate available songs for pair 0 round 1
    const newState = populateAvailableSongs(state, 0, 0);
    save({ ...newState, phase: "round_1_pair_0_draw", drawRevealComplete: false });
    return { ok: true };
  }

  // Inside round phases
  const coords = currentPairCoords(phase);
  if (coords) {
    const suffix = phase.split("_").slice(-1)[0];
    if (suffix === "perform") {
      const np = nextPhase(state);
      if (np === "complete") {
        save({ ...state, phase: "complete" });
        return { ok: true };
      }
      // Entering next draw — populate songs for that pair
      const nextCoords = currentPairCoords(np)!;
      const newState = populateAvailableSongs(state, nextCoords.roundIndex, nextCoords.pairIndex);
      save({ ...newState, phase: np, drawRevealComplete: false });
      return { ok: true };
    }
    return { ok: false, error: "ADVANCE_PHASE not valid here" };
  }

  return { ok: false, error: "Cannot advance from this phase" };
}

function populateAvailableSongs(
  state: InternalGameState,
  roundIndex: number,
  pairIndex: number
): InternalGameState {
  const allSongs = state.participants.flatMap((p) => p.songs);
  const round = state.rounds[roundIndex];
  if (!round) return state;
  const pair = round.pairs[pairIndex];
  if (!pair) return state;

  const available = getAvailableSongs(pair, allSongs).map((s) => s.id);
  const updatedPair = { ...pair, availableSongs: available };
  const updatedPairs = round.pairs.map((p, i) => (i === pairIndex ? updatedPair : p));
  const updatedRounds = state.rounds.map((r, i) =>
    i === roundIndex ? { ...r, pairs: updatedPairs } : r
  );
  return { ...state, rounds: updatedRounds };
}

export function handleComputePairings(): { ok: boolean; error?: string } {
  const state = getState();
  if (state.phase !== "pairing_computed") return { ok: false, error: "Not in pairing_computed phase" };

  const groupA = state.participants.filter((p) => p.role === "A");
  const groupB = state.participants.filter((p) => p.role === "B");
  const result = computePairings(groupA, groupB);
  if (!result) return { ok: false, error: "No valid pairing exists — ask participants to relax exclusions" };

  const orderedB = result.map(([, j]) => groupB[j]);
  const rounds = buildAllRounds(groupA, orderedB);
  save({ ...state, rounds });
  return { ok: true };
}

export function handleDrawComplete(): { ok: boolean; error?: string } {
  const state = getState();
  if (!state.phase.endsWith("_draw")) return { ok: false, error: "Not in draw phase" };
  const coords = currentPairCoords(state.phase)!;
  const np: PhaseId = `round_${coords.roundIndex + 1}_pair_${coords.pairIndex}_song`;
  save({ ...state, phase: np, drawRevealComplete: true });
  return { ok: true };
}

export function handleVoteSong(
  participantId: string,
  songId: string
): { ok: boolean; error?: string } {
  const state = getState();
  if (!state.phase.endsWith("_song")) return { ok: false, error: "Not in song phase" };

  const coords = currentPairCoords(state.phase)!;
  const pair = state.rounds[coords.roundIndex].pairs[coords.pairIndex];
  if (!pair.availableSongs.includes(songId)) return { ok: false, error: "Song not available" };
  if (participantId !== pair.participantA && participantId !== pair.participantB)
    return { ok: false, error: "Not your turn" };

  const updatedVotes = { ...pair.songVotes, [participantId]: songId };
  const votedSongs = Object.values(updatedVotes);
  let selectedSong = pair.selectedSong;
  let newPhase: PhaseId = state.phase;

  // Both voted for same song
  if (
    votedSongs.length === 2 &&
    votedSongs[0] === votedSongs[1]
  ) {
    selectedSong = songId;
    newPhase = `round_${coords.roundIndex + 1}_pair_${coords.pairIndex}_props`;
  }

  const updatedPair = { ...pair, songVotes: updatedVotes, selectedSong };
  const newState = updatePair(state, coords.roundIndex, coords.pairIndex, updatedPair);

  // Mark song as used and remove from participant songs if agreed
  if (selectedSong) {
    markSongUsed(newState, selectedSong);
  }

  save({ ...newState, phase: newPhase });
  return { ok: true };
}

export function handleBreakSongTie(songId: string): { ok: boolean; error?: string } {
  const state = getState();
  if (!state.phase.endsWith("_song")) return { ok: false, error: "Not in song phase" };

  const coords = currentPairCoords(state.phase)!;
  const pair = state.rounds[coords.roundIndex].pairs[coords.pairIndex];
  if (!pair.availableSongs.includes(songId)) return { ok: false, error: "Song not available" };

  const updatedPair = { ...pair, selectedSong: songId };
  const np: PhaseId = `round_${coords.roundIndex + 1}_pair_${coords.pairIndex}_props`;
  const newState = updatePair(state, coords.roundIndex, coords.pairIndex, updatedPair);
  markSongUsed(newState, songId);
  save({ ...newState, phase: np });
  return { ok: true };
}

function markSongUsed(state: InternalGameState, songId: string): void {
  for (const p of state.participants) {
    const song = p.songs.find((s) => s.id === songId);
    if (song) song.used = true;
  }
  // Also update availableSongs in all future pairs
  for (const round of state.rounds) {
    for (const pair of round.pairs) {
      pair.availableSongs = pair.availableSongs.filter((id) => id !== songId);
    }
  }
}

export function handleSubmitProps(
  participantId: string,
  prop: Prop,
  furniture: Furniture[]
): { ok: boolean; error?: string } {
  const state = getState();
  if (!state.phase.endsWith("_props")) return { ok: false, error: "Not in props phase" };
  if (furniture.length !== 2) return { ok: false, error: "Select exactly 2 furniture" };

  const coords = currentPairCoords(state.phase)!;
  const pair = state.rounds[coords.roundIndex].pairs[coords.pairIndex];
  if (participantId !== pair.participantA && participantId !== pair.participantB)
    return { ok: false, error: "Not your turn" };
  if (pair.propsSubmittedBy) return { ok: false, error: "Already submitted — waiting for confirmation" };

  const updatedPair = {
    ...pair,
    selectedProp: prop,
    selectedFurniture: furniture,
    propsSubmittedBy: participantId,
  };
  save(updatePair(state, coords.roundIndex, coords.pairIndex, updatedPair));
  return { ok: true };
}

export function handleConfirmProps(participantId: string): { ok: boolean; error?: string } {
  const state = getState();
  if (!state.phase.endsWith("_props")) return { ok: false, error: "Not in props phase" };

  const coords = currentPairCoords(state.phase)!;
  const pair = state.rounds[coords.roundIndex].pairs[coords.pairIndex];
  if (!pair.propsSubmittedBy) return { ok: false, error: "Nothing submitted yet" };
  if (participantId === pair.propsSubmittedBy) return { ok: false, error: "You submitted — other person must confirm" };
  if (participantId !== pair.participantA && participantId !== pair.participantB)
    return { ok: false, error: "Not your turn" };

  const np: PhaseId = `round_${coords.roundIndex + 1}_pair_${coords.pairIndex}_perform`;
  const updatedPair = { ...pair, propsConfirmedBy: participantId };
  save({ ...updatePair(state, coords.roundIndex, coords.pairIndex, updatedPair), phase: np });
  return { ok: true };
}

export function handleOverrideProps(): { ok: boolean; error?: string } {
  const state = getState();
  if (!state.phase.endsWith("_props")) return { ok: false, error: "Not in props phase" };

  const coords = currentPairCoords(state.phase)!;
  const pair = state.rounds[coords.roundIndex].pairs[coords.pairIndex];
  const np: PhaseId = `round_${coords.roundIndex + 1}_pair_${coords.pairIndex}_perform`;
  const updatedPair = { ...pair, propsConfirmedBy: "organizer" };
  save({ ...updatePair(state, coords.roundIndex, coords.pairIndex, updatedPair), phase: np });
  return { ok: true };
}

export function handleSubmitSongs(
  participantId: string,
  songs: Array<{ url: string; vibe: Vibe }>
): { ok: boolean; error?: string } {
  const state = getState();
  if (state.phase !== "song_submission") return { ok: false, error: "Not in song submission phase" };
  if (songs.length !== 2) return { ok: false, error: "Submit exactly 2 songs" };
  // Validate URLs
  for (const s of songs) {
    if (!isValidSongUrl(s.url)) return { ok: false, error: `Invalid URL: ${s.url}` };
  }

  const newSongs = songs.map((s) => ({
    id: uuidv4(),
    submittedBy: participantId,
    url: s.url,
    vibe: s.vibe,
    used: false,
  }));

  const updated = state.participants.map((p) =>
    p.id === participantId
      ? { ...p, songs: newSongs, songsSubmitted: true }
      : p
  );
  save({ ...state, participants: updated });
  return { ok: true };
}

export function handleSetExclusions(
  participantId: string,
  excludedIds: string[]
): { ok: boolean; error?: string } {
  const state = getState();
  if (state.phase !== "exclusion_setting") return { ok: false, error: "Not in exclusion setting phase" };

  const updated = state.participants.map((p) =>
    p.id === participantId
      ? { ...p, exclusions: excludedIds, exclusionsSubmitted: true }
      : p
  );
  const newState = { ...state, participants: updated };
  newState.pairingFeasible = checkFeasibility(newState);
  save(newState);
  return { ok: true };
}

export function handleSelectRole(
  participantId: string,
  role: "A" | "B"
): { ok: boolean; error?: string } {
  const state = getState();
  if (state.phase !== "role_selection") return { ok: false, error: "Not in role selection phase" };

  const roleCount = state.participants.filter((p) => p.role === role).length;
  if (roleCount >= 4) return { ok: false, error: `Role ${role} is full` };

  const updated = state.participants.map((p) =>
    p.id === participantId ? { ...p, role } : p
  );
  save({ ...state, participants: updated });
  return { ok: true };
}

function updatePair(
  state: InternalGameState,
  roundIndex: number,
  pairIndex: number,
  updatedPair: import("../state/types.js").Pair
): InternalGameState {
  const updatedRounds = state.rounds.map((r, ri) =>
    ri === roundIndex
      ? {
          ...r,
          pairs: r.pairs.map((p, pi) => (pi === pairIndex ? updatedPair : p)),
        }
      : r
  );
  return { ...state, rounds: updatedRounds };
}

function isValidSongUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "open.spotify.com" ||
      u.hostname === "spotify.com" ||
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "youtu.be" ||
      u.hostname === "music.youtube.com"
    );
  } catch {
    return false;
  }
}
