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

export function buildPairsForRound(
  orderedA: Participant[],
  orderedB: Participant[],
  roundNumber: 1 | 2 | 3 | 4,
  shifted: boolean
): Pair[] {
  return orderedA.map((a, i) => {
    const bIndex = shifted ? (i + 1) % 4 : i;
    return {
      id: uuidv4(),
      roundNumber,
      pairIndex: i as 0 | 1 | 2 | 3,
      participantA: a.id,
      participantB: orderedB[bIndex].id,
      availableSongs: [],
      selectedSong: null,
      songVotes: {},
      selectedProp: null,
      selectedFurniture: [],
      propsSubmittedBy: null,
      propsConfirmedBy: null,
    };
  });
}
