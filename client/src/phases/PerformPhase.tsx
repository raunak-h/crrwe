import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import { Song } from "../socket/protocol";
import { PROPS, FURNITURE } from "../components/PropGrid";

interface Props {
  participantId?: string;
  isOrganizer?: boolean;
  isDisplay?: boolean;
  roundNumber: number;
  pairIndex: number;
}

export default function PerformPhase({ participantId, isOrganizer, isDisplay, roundNumber, pairIndex }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const participants = gameState?.participants ?? [];
  const round = gameState?.rounds?.[roundNumber - 1];
  const pair = round?.pairs?.[pairIndex];

  const allSongs: Song[] = participants.flatMap((p) => p.songs);
  const song = pair?.selectedSong ? allSongs.find((s) => s.id === pair.selectedSong) : null;

  const personA = participants.find((p) => p.id === pair?.participantA);
  const personB = participants.find((p) => p.id === pair?.participantB);
  const swapped = round?.roleSwapped ?? false;
  const standingPerson = swapped ? personB : personA;
  const seatedPerson = swapped ? personA : personB;

  function handleAdvance() {
    sendMessage({ type: "ADVANCE_PHASE" });
  }

  if (!pair) return null;

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center ${isDisplay ? "py-16" : "py-8"}`}>
      <div>
        <p className="text-[var(--muted)] text-sm uppercase tracking-widest">Round {roundNumber} · Pair {pairIndex + 1}</p>
        <h2 className={`font-bold mt-2 ${isDisplay ? "text-5xl" : "text-2xl"}`}>✨ Performance</h2>
      </div>

      <div className={`flex gap-8 items-center ${isDisplay ? "text-3xl" : "text-xl"}`}>
        <div className="text-center">
          <div className="text-2xl mb-1" title="Standing">🧍</div>
          <div className="font-bold">{standingPerson?.name}</div>
        </div>
        <div className="text-[var(--muted)]">⟺</div>
        <div className="text-center">
          <div className="text-2xl mb-1" title="Seated">💺</div>
          <div className="font-bold">{seatedPerson?.name}</div>
        </div>
      </div>

      {song && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-4 max-w-sm">
          <p className="text-[var(--muted)] text-xs mb-1">Playing</p>
          <a
            href={song.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold text-[var(--accent)] hover:underline break-all ${isDisplay ? "text-lg" : "text-sm"}`}
          >
            {song.url}
          </a>
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              song.vibe === "energetic"
                ? "bg-orange-900/50 text-orange-300"
                : "bg-blue-900/50 text-blue-300"
            }`}
          >
            {song.vibe}
          </span>
        </div>
      )}

      {pair.selectedProp && (
        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <span className="text-xl">{PROPS.find((p) => p.value === pair.selectedProp)?.emoji}</span>
            <span>{PROPS.find((p) => p.value === pair.selectedProp)?.label}</span>
          </span>
          <span>·</span>
          {pair.selectedFurniture.map((f) => (
            <span key={f} className="flex items-center gap-1">
              <span className="text-xl">{FURNITURE.find((x) => x.value === f)?.emoji}</span>
              <span>{FURNITURE.find((x) => x.value === f)?.label}</span>
            </span>
          ))}
        </div>
      )}

      {isOrganizer && (
        <button
          onClick={handleAdvance}
          className="mt-4 px-8 py-3 rounded-xl bg-[var(--accent2)] text-black font-bold text-lg hover:opacity-90"
        >
          End Performance →
        </button>
      )}

      {!isOrganizer && !isDisplay && (
        <p className="text-[var(--accent)] text-lg font-bold">Let's go!</p>
      )}
    </div>
  );
}
