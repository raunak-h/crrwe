import { Pair, SafeParticipant, Round } from "../socket/protocol";

interface Props {
  pair: Pair;
  participants: SafeParticipant[];
  round?: Round;
  highlight?: boolean;
}

export default function PairCard({ pair, participants, round, highlight }: Props) {
  const pA = participants.find((p) => p.id === pair.participantA);
  const pB = participants.find((p) => p.id === pair.participantB);
  const swapped = round?.roleSwapped ?? false;

  const standingLabel = swapped ? "B" : "A";
  const seatedLabel = swapped ? "A" : "B";
  const standingPerson = swapped ? pB : pA;
  const seatedPerson = swapped ? pA : pB;

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-[var(--accent)] bg-[var(--accent)]/10"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <div className="flex gap-4 justify-center">
        <div className="text-center">
          <div className="text-xs text-[var(--muted)] mb-1">Standing ({standingLabel})</div>
          <div className="text-lg font-semibold">{standingPerson?.name ?? "?"}</div>
        </div>
        <div className="text-[var(--muted)] self-center text-xl">⟺</div>
        <div className="text-center">
          <div className="text-xs text-[var(--muted)] mb-1">Seated ({seatedLabel})</div>
          <div className="text-lg font-semibold">{seatedPerson?.name ?? "?"}</div>
        </div>
      </div>
      {pair.selectedSong && (
        <div className="mt-2 text-center text-xs text-[var(--accent2)]">Song selected ✓</div>
      )}
      {pair.selectedProp && (
        <div className="mt-1 text-center text-xs text-[var(--muted)]">
          {pair.selectedProp.replace("_", " ")} · {pair.selectedFurniture.map((f) => f.replace("_", " ")).join(" & ")}
        </div>
      )}
    </div>
  );
}
