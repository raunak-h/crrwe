import { useGameStore } from "../store/gameStore";
import { Song } from "../socket/protocol";

interface Props {
  isDisplay?: boolean;
}

export default function CompletePhase({ isDisplay }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const participants = gameState?.participants ?? [];
  const rounds = gameState?.rounds ?? [];
  const allSongs: Song[] = participants.flatMap((p) => p.songs);

  return (
    <div className={`py-8 px-4 ${isDisplay ? "text-center" : ""}`}>
      <h2 className={`font-bold text-[var(--accent)] text-center mb-8 ${isDisplay ? "text-6xl" : "text-3xl"}`}>
        🎉 Show Complete!
      </h2>

      <div className="max-w-2xl mx-auto space-y-8">
        {rounds.map((round) => (
          <div key={round.roundNumber}>
            <h3 className="text-lg font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">
              Round {round.roundNumber} {round.roleSwapped ? "(roles swapped)" : ""}
            </h3>
            <div className="space-y-2">
              {round.pairs.map((pair) => {
                const pA = participants.find((p) => p.id === pair.participantA);
                const pB = participants.find((p) => p.id === pair.participantB);
                const song = pair.selectedSong ? allSongs.find((s) => s.id === pair.selectedSong) : null;
                const swapped = round.roleSwapped;
                return (
                  <div
                    key={pair.id}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <span>{swapped ? pB?.name : pA?.name}</span>
                      <span className="text-[var(--muted)]">⟺</span>
                      <span>{swapped ? pA?.name : pB?.name}</span>
                    </div>
                    {song && (
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        <a href={song.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                          ♪ {song.vibe}
                        </a>
                        {pair.selectedProp && (
                          <span> · {pair.selectedProp.replace("_", " ")} · {pair.selectedFurniture.map((f) => f.replace("_", " ")).join(" & ")}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
