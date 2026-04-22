import { Participant, Pair } from "../state/types.js";
import { v4 as uuidv4 } from "uuid";

export function computePairings(
  groupA: Participant[],
  groupB: Participant[]
): [number, number][] | null {
  const allowed = groupA.map((a) =>
    groupB.map(
      (b) =>
        !a.exclusions.includes(b.id) && !b.exclusions.includes(a.id)
    )
  );

  const assignment = new Array(4).fill(-1);
  const taken = new Array(4).fill(false);

  function backtrack(i: number): boolean {
    if (i === 4) return true;
    for (let j = 0; j < 4; j++) {
      if (allowed[i][j] && !taken[j]) {
        assignment[i] = j;
        taken[j] = true;
        if (backtrack(i + 1)) return true;
        assignment[i] = -1;
        taken[j] = false;
      }
    }
    return false;
  }

  if (!backtrack(0)) return null;
  return assignment.map((j, i) => [i, j]);
}

/**
 * Find a random valid permutation of orderedB for rounds 3/4 where:
 * - Each A[i] must NOT be paired with B[i] (different from round 1/2)
 * - Exclusions are respected
 * Returns the permutation as an index array, or null if none exists.
 */
export function findAlternativePermutation(
  orderedA: Participant[],
  orderedB: Participant[]
): number[] | null {
  function canPair(ai: number, bi: number): boolean {
    if (bi === ai) return false; // must differ from round 1/2
    const a = orderedA[ai];
    const b = orderedB[bi];
    return !a.exclusions.includes(b.id) && !b.exclusions.includes(a.id);
  }

  // Build randomised candidate lists per position
  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const candidates = Array.from({ length: 4 }, (_, ai) =>
    shuffle([0, 1, 2, 3].filter((bi) => canPair(ai, bi)))
  );

  const result = new Array(4).fill(-1);
  const taken = new Array(4).fill(false);

  function backtrack(ai: number): boolean {
    if (ai === 4) return true;
    for (const bi of candidates[ai]) {
      if (!taken[bi]) {
        result[ai] = bi;
        taken[bi] = true;
        if (backtrack(ai + 1)) return true;
        result[ai] = -1;
        taken[bi] = false;
      }
    }
    return false;
  }

  if (!backtrack(0)) return null;
  return result;
}

export function buildPairsForRound(
  orderedA: Participant[],
  bOrder: Participant[],
  roundNumber: 1 | 2 | 3 | 4,
): Pair[] {
  return orderedA.map((a, i) => ({
    id: uuidv4(),
    roundNumber,
    pairIndex: i as 0 | 1 | 2 | 3,
    participantA: a.id,
    participantB: bOrder[i].id,
    availableSongs: [],
    selectedSong: null,
    songVotes: {},
    selectedProp: null,
    selectedFurniture: [],
    propsSubmittedBy: null,
    propsConfirmedBy: null,
  }));
}
