import { Participant, Round } from "../state/types.js";
import { buildPairsForRound, findAlternativePermutation } from "./pairingAlgo.js";

export function buildAllRounds(
  orderedA: Participant[],
  orderedB: Participant[]
): Round[] {
  // Find a random valid permutation of B for rounds 3/4 that differs from round 1/2 and respects exclusions
  const altPerm = findAlternativePermutation(orderedA, orderedB);
  // Fallback to simple +1 shift if no alternative found (shouldn't happen if feasibility was checked)
  const altOrderedB = altPerm
    ? altPerm.map((i) => orderedB[i])
    : orderedB.map((_, i) => orderedB[(i + 1) % 4]);

  return [
    {
      roundNumber: 1,
      roleSwapped: false,
      pairs: buildPairsForRound(orderedA, orderedB, 1),
    },
    {
      roundNumber: 2,
      roleSwapped: true,
      pairs: buildPairsForRound(orderedA, orderedB, 2),
    },
    {
      roundNumber: 3,
      roleSwapped: false,
      pairs: buildPairsForRound(orderedA, altOrderedB, 3),
    },
    {
      roundNumber: 4,
      roleSwapped: true,
      pairs: buildPairsForRound(orderedA, altOrderedB, 4),
    },
  ];
}
