import { Pair, Song } from "../state/types.js";

export function getAvailableSongs(pair: Pair, allSongs: Song[]): Song[] {
  return allSongs.filter(
    (s) =>
      (s.submittedBy === pair.participantA ||
        s.submittedBy === pair.participantB) &&
      !s.used
  );
}

export function wouldDepletePerson(
  song: Song,
  pair: Pair,
  allSongs: Song[]
): boolean {
  // Would marking this song as used leave the person with 0 songs for any future pair-turn?
  // Since we don't have full future schedule here, this is a conservative check:
  // if this is the person's last unused song, flag it.
  const personSongs = allSongs.filter(
    (s) => s.submittedBy === song.submittedBy && !s.used
  );
  return personSongs.length <= 1;
}
