import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import SlotMachine from "../components/SlotMachine";

interface Props {
  participantId?: string;
  isOrganizer?: boolean;
  isDisplay?: boolean;
  roundNumber: number;
  pairIndex: number;
}

export default function DrawPhase({ participantId, isOrganizer, isDisplay, roundNumber, pairIndex }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const participants = gameState?.participants ?? [];
  const round = gameState?.rounds?.[roundNumber - 1];
  const pair = round?.pairs?.[pairIndex];

  const personA = participants.find((p) => p.id === pair?.participantA);
  const personB = participants.find((p) => p.id === pair?.participantB);

  const allNames = participants.map((p) => p.name);
  const swapped = round?.roleSwapped ?? false;

  // In swapped rounds, Standing = B, Seated = A
  const standingName = swapped ? personB?.name ?? "" : personA?.name ?? "";
  const seatedName = swapped ? personA?.name ?? "" : personB?.name ?? "";

  function handleComplete() {
    sendMessage({ type: "DRAW_COMPLETE" });
  }

  function handleSkip() {
    sendMessage({ type: "DRAW_COMPLETE" });
  }

  if (!pair) return <div className="text-center py-12 text-[var(--muted)]">Loading…</div>;

  const isActivePair =
    participantId === pair.participantA || participantId === pair.participantB;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      <div className="text-center">
        <p className="text-[var(--muted)] text-sm uppercase tracking-widest">
          Round {roundNumber} · Pair {pairIndex + 1}
        </p>
        <h2 className="text-2xl font-bold mt-1">The Draw</h2>
      </div>

      <SlotMachine
        names={allNames}
        resultA={standingName}
        resultB={seatedName}
        onComplete={isDisplay || isOrganizer ? handleComplete : () => {}}
        autoStart={true}
      />

      {isOrganizer && (
        <button
          onClick={handleSkip}
          className="text-[var(--muted)] text-sm underline hover:text-white"
        >
          Skip animation
        </button>
      )}

      {!isDisplay && !isOrganizer && (
        <p className="text-[var(--muted)] text-sm">
          {isActivePair ? "You're up next!" : "Watch the draw…"}
        </p>
      )}
    </div>
  );
}
