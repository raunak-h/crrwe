import { Participant, Round } from "../state/types.js";
import { buildPairsForRound } from "./pairingAlgo.js";

export function buildAllRounds(
  orderedA: Participant[],
  orderedB: Participant[]
): Round[] {
  return [
    {
      roundNumber: 1,
      roleSwapped: false,
      pairs: buildPairsForRound(orderedA, orderedB, 1, false),
    },
    {
      roundNumber: 2,
      roleSwapped: true,
      pairs: buildPairsForRound(orderedA, orderedB, 2, false),
    },
    {
      roundNumber: 3,
      roleSwapped: false,
      pairs: buildPairsForRound(orderedA, orderedB, 3, true),
    },
    {
      roundNumber: 4,
      roleSwapped: true,
      pairs: buildPairsForRound(orderedA, orderedB, 4, true),
    },
  ];
}
