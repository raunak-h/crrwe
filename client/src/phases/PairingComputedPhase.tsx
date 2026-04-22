import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import PairCard from "../components/PairCard";

interface Props {
  isOrganizer?: boolean;
}

export default function PairingComputedPhase({ isOrganizer }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const error = useGameStore((s) => s.error);
  const participants = gameState?.participants ?? [];
  const hasPairings = (gameState?.rounds?.length ?? 0) > 0;
  const round1Pairs = gameState?.rounds?.[0]?.pairs ?? [];

  function handleCompute() {
    sendMessage({ type: "COMPUTE_PAIRINGS" });
  }

  function handleAdvance() {
    sendMessage({ type: "ADVANCE_PHASE" });
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <h2 className="text-xl font-bold text-center">Pairing</h2>

      {isOrganizer && !hasPairings && (
        <div className="text-center">
          <button
            onClick={handleCompute}
            className="px-8 py-4 rounded-2xl bg-[var(--accent)] text-black text-lg font-bold hover:opacity-90"
          >
            Compute Pairings
          </button>
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {hasPairings && (
        <>
          <div className="space-y-3">
            {round1Pairs.map((pair) => (
              <PairCard
                key={pair.id}
                pair={pair}
                participants={participants}
                round={gameState?.rounds?.[0]}
              />
            ))}
          </div>

          {isOrganizer && (
            <button
              onClick={handleAdvance}
              className="w-full py-3 rounded-xl bg-[var(--accent2)] text-black font-bold hover:opacity-90"
            >
              Start the Show →
            </button>
          )}
        </>
      )}

      {!isOrganizer && !hasPairings && (
        <p className="text-center text-[var(--muted)]">Waiting for organizer to compute pairings…</p>
      )}
    </div>
  );
}
