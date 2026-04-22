import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import { Role } from "../socket/protocol";

interface Props {
  participantId?: string;
  isOrganizer?: boolean;
}

export default function RoleSelectionPhase({ participantId, isOrganizer }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const participants = gameState?.participants ?? [];
  const me = participants.find((p) => p.id === participantId);

  const aCount = participants.filter((p) => p.role === "A").length;
  const bCount = participants.filter((p) => p.role === "B").length;

  function selectRole(role: Role) {
    if (!participantId) return;
    sendMessage({ type: "SELECT_ROLE", participantId, role });
  }

  function handleAdvance() {
    sendMessage({ type: "ADVANCE_PHASE" });
  }

  if (me?.role) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-2xl font-bold">
          You're <span className="text-[var(--accent)]">{me.role === "A" ? "Standing (A)" : "Seated (B)"}</span>
        </p>
        <p className="text-[var(--muted)]">A: {aCount}/4 · B: {bCount}/4</p>
        {isOrganizer && (
          <button
            onClick={handleAdvance}
            disabled={aCount !== 4 || bCount !== 4}
            className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent2)] text-black font-bold disabled:opacity-40"
          >
            Next → Compute Pairings
          </button>
        )}
      </div>
    );
  }

  if (isOrganizer && !participantId) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-[var(--muted)]">Waiting for role selections…</p>
        <p className="text-2xl font-bold">A: {aCount}/4 · B: {bCount}/4</p>
        <button
          onClick={handleAdvance}
          disabled={aCount !== 4 || bCount !== 4}
          className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent2)] text-black font-bold disabled:opacity-40"
        >
          Next → Compute Pairings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-12 px-4 space-y-6 text-center">
      <h2 className="text-xl font-bold">Choose Your Role</h2>
      <p className="text-[var(--muted)] text-sm">A: {aCount}/4 · B: {bCount}/4</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => selectRole("A")}
          disabled={aCount >= 4}
          className="flex-1 py-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] text-xl font-bold hover:border-[var(--accent)] disabled:opacity-40 transition"
        >
          <div className="text-3xl mb-1">🧍</div>
          Standing (A)
        </button>
        <button
          onClick={() => selectRole("B")}
          disabled={bCount >= 4}
          className="flex-1 py-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] text-xl font-bold hover:border-[var(--accent2)] disabled:opacity-40 transition"
        >
          <div className="text-3xl mb-1">🪑</div>
          Seated (B)
        </button>
      </div>
    </div>
  );
}
