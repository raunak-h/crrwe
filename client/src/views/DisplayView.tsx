import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import PhaseDispatcher from "../phases/PhaseDispatcher";

export default function DisplayView() {
  const gameState = useGameStore((s) => s.gameState);
  const connected = useGameStore((s) => s.connected);

  useEffect(() => {
    // Identify as display to server when connected
    if (connected) {
      sendMessage({ type: "DISPLAY_CONNECT" });
    }
  }, [connected]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-bold text-[var(--accent)]">Magic Mike For Everyone</h1>
        <p className="text-[var(--muted)] text-lg">Connecting…</p>
      </div>
    );
  }

  // Special: show a big splash on pairing_computed
  if (gameState.phase === "pairing_computed" && gameState.rounds.length > 0) {
    const round1 = gameState.rounds[0];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-8">
        <h1 className="text-5xl font-bold text-[var(--accent)]">The Pairs</h1>
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          {round1.pairs.map((pair, i) => {
            const pA = gameState.participants.find((p) => p.id === pair.participantA);
            const pB = gameState.participants.find((p) => p.id === pair.participantB);
            return (
              <div key={pair.id} className="bg-[var(--surface)] border-2 border-[var(--accent)] rounded-2xl p-6 text-center">
                <p className="text-[var(--muted)] text-sm mb-2">Pair {i + 1}</p>
                <div className="flex gap-3 items-center justify-center text-2xl font-bold">
                  <span>{pA?.name}</span>
                  <span className="text-[var(--muted)]">⟺</span>
                  <span>{pB?.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h1 className="text-2xl font-bold text-[var(--accent)]">Magic Mike For Everyone</h1>
        <span className="text-sm font-mono text-[var(--muted)]">{gameState.phase}</span>
      </div>
      <div className="flex-1">
        <PhaseDispatcher
          phase={gameState.phase}
          isDisplay={true}
        />
      </div>
    </div>
  );
}
