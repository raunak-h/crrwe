import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import SongCard from "../components/SongCard";
import { Song } from "../socket/protocol";

interface Props {
  participantId?: string;
  isOrganizer?: boolean;
  isDisplay?: boolean;
  roundNumber: number;
  pairIndex: number;
}

export default function SongSelectPhase({ participantId, isOrganizer, isDisplay, roundNumber, pairIndex }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const participants = gameState?.participants ?? [];
  const round = gameState?.rounds?.[roundNumber - 1];
  const pair = round?.pairs?.[pairIndex];

  const allSongs: Song[] = participants.flatMap((p) => p.songs);
  const availableSongs = (pair?.availableSongs ?? [])
    .map((id) => allSongs.find((s) => s.id === id))
    .filter(Boolean) as Song[];

  const personA = participants.find((p) => p.id === pair?.participantA);
  const personB = participants.find((p) => p.id === pair?.participantB);

  const isActivePair =
    participantId === pair?.participantA || participantId === pair?.participantB;
  const myVote = participantId ? pair?.songVotes?.[participantId] : null;

  const peerId = participantId === pair?.participantA ? pair?.participantB : pair?.participantA;
  const peerName = participants.find((p) => p.id === peerId)?.name;
  const peerVote = peerId ? pair?.songVotes?.[peerId] : null;

  function vote(songId: string) {
    if (!participantId) return;
    sendMessage({ type: "VOTE_SONG", participantId, songId });
  }

  function breakTie(songId: string) {
    sendMessage({ type: "BREAK_SONG_TIE", songId });
  }

  if (!pair) return null;

  const voted = Object.values(pair.songVotes ?? {});
  const hasTie = voted.length === 2 && voted[0] !== voted[1];

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div className="text-center">
        <p className="text-[var(--muted)] text-sm">Round {roundNumber} · Pair {pairIndex + 1}</p>
        <h2 className="text-xl font-bold mt-1">Choose a Song</h2>
        <p className="text-[var(--muted)] text-sm mt-1">
          {personA?.name} & {personB?.name}
        </p>
      </div>

      {hasTie && isOrganizer && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-3 text-center">
          <p className="text-yellow-300 text-sm">Tie — pick one:</p>
          <div className="flex gap-2 justify-center mt-2">
            {voted.map((songId) => {
              const s = allSongs.find((x) => x.id === songId);
              return (
                <button
                  key={songId}
                  onClick={() => breakTie(songId)}
                  className="px-3 py-1 rounded-lg bg-yellow-600 text-black text-sm font-semibold"
                >
                  {s?.vibe} by {participants.find((p) => p.id === s?.submittedBy)?.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {availableSongs.map((song) => {
          const iVoted = myVote === song.id;
          const peerVotedThis = peerVote === song.id;
          return (
            <SongCard
              key={song.id}
              song={song}
              participants={participants}
              selected={iVoted}
              voted={!isDisplay && peerVotedThis && !iVoted}
              onClick={isActivePair && !isDisplay ? () => vote(song.id) : undefined}
              disabled={isDisplay || !isActivePair}
            />
          );
        })}
      </div>

      {!isDisplay && isActivePair && (
        <div className="text-center text-sm text-[var(--muted)]">
          {myVote
            ? peerVote
              ? peerVote === myVote
                ? "✓ Both agree!"
                : `You and ${peerName} voted differently — waiting for resolution`
              : `Voted! Waiting for ${peerName}…`
            : "Select your preferred song"}
        </div>
      )}

      {!isDisplay && !isActivePair && !isOrganizer && (
        <p className="text-center text-[var(--muted)] text-sm">
          {personA?.name} & {personB?.name} are choosing a song…
        </p>
      )}
    </div>
  );
}
