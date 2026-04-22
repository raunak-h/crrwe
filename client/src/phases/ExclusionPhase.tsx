import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";

interface Props {
  participantId?: string;
  isOrganizer?: boolean;
}

export default function ExclusionPhase({ participantId, isOrganizer }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [infeasibleWarn, setInfeasibleWarn] = useState(false);

  const participants = gameState?.participants ?? [];
  const others = participants.filter((p) => p.id !== participantId);
  const submittedCount = participants.filter((p) => p.exclusionsSubmitted).length;
  const pairingFeasible = gameState?.pairingFeasible ?? true;

  useEffect(() => {
    setInfeasibleWarn(!pairingFeasible);
  }, [pairingFeasible]);

  function handleToggle(id: string) {
    setExcluded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!participantId) return;
    sendMessage({ type: "SET_EXCLUSIONS", participantId, excludedIds: excluded });
    setSubmitted(true);
  }

  function handleAdvance() {
    sendMessage({ type: "ADVANCE_PHASE" });
  }

  const me = participants.find((p) => p.id === participantId);

  if (infeasibleWarn) {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-red-900/40 border border-red-500 rounded-xl p-4 text-center">
          <p className="text-red-300 font-semibold">⚠ No valid pairing exists</p>
          <p className="text-red-400 text-sm mt-1">
            The current exclusions make it impossible to pair everyone. Please relax some exclusions.
          </p>
        </div>
      </div>
    );
  }

  if (me?.exclusionsSubmitted || submitted) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-green-400 text-xl">✓ Exclusions saved</p>
        <p className="text-[var(--muted)]">{submittedCount}/8 submitted</p>
        {isOrganizer && (
          <button
            onClick={handleAdvance}
            disabled={submittedCount !== 8}
            className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent2)] text-black font-bold disabled:opacity-40"
          >
            Next → Role Selection
          </button>
        )}
      </div>
    );
  }

  if (isOrganizer && !participantId) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-[var(--muted)]">Waiting for participants to set exclusions…</p>
        <p className="text-2xl font-bold">{submittedCount}/8</p>
        <button
          onClick={handleAdvance}
          disabled={submittedCount !== 8}
          className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent2)] text-black font-bold disabled:opacity-40"
        >
          Next → Role Selection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold">Set Exclusions</h2>
        <p className="text-[var(--muted)] text-sm mt-1">
          Deselect anyone you'd prefer NOT to be paired with. Everyone starts selected.
        </p>
      </div>

      <div className="space-y-2">
        {others.map((p) => {
          const isExcluded = excluded.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => handleToggle(p.id)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                isExcluded
                  ? "border-red-500/50 bg-red-900/20 text-[var(--muted)]"
                  : "border-[var(--accent)]/50 bg-[var(--accent)]/10"
              }`}
            >
              <span className={`text-lg ${isExcluded ? "opacity-30" : ""}`}>
                {isExcluded ? "✗" : "✓"}
              </span>
              <span className={isExcluded ? "line-through text-[var(--muted)]" : ""}>{p.name}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-bold"
      >
        Save Exclusions
      </button>

      <p className="text-center text-[var(--muted)] text-sm">{submittedCount}/8 submitted</p>
    </div>
  );
}
