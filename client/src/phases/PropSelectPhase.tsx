import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import PropGrid from "../components/PropGrid";
import { Prop, Furniture } from "../socket/protocol";

interface Props {
  participantId?: string;
  isOrganizer?: boolean;
  isDisplay?: boolean;
  roundNumber: number;
  pairIndex: number;
}

export default function PropSelectPhase({ participantId, isOrganizer, isDisplay, roundNumber, pairIndex }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const participants = gameState?.participants ?? [];
  const round = gameState?.rounds?.[roundNumber - 1];
  const pair = round?.pairs?.[pairIndex];

  const [prop, setProp] = useState<Prop | null>(null);
  const [furniture, setFurniture] = useState<Furniture[]>([]);

  const personA = participants.find((p) => p.id === pair?.participantA);
  const personB = participants.find((p) => p.id === pair?.participantB);

  const isActivePair =
    participantId === pair?.participantA || participantId === pair?.participantB;

  const submitted = pair?.propsSubmittedBy != null;
  const confirmed = pair?.propsConfirmedBy != null;

  const iSubmitted = participantId === pair?.propsSubmittedBy;
  const peerName =
    iSubmitted
      ? participants.find((p) => p.id === (participantId === pair?.participantA ? pair?.participantB : pair?.participantA))?.name
      : participants.find((p) => p.id === pair?.propsSubmittedBy)?.name;

  function handleSubmit() {
    if (!participantId || !prop || furniture.length !== 2) return;
    sendMessage({ type: "SUBMIT_PROPS", participantId, prop, furniture });
  }

  function handleConfirm() {
    if (!participantId) return;
    sendMessage({ type: "CONFIRM_PROPS", participantId });
  }

  function handleOverride() {
    sendMessage({ type: "OVERRIDE_PROPS" });
  }

  if (!pair) return null;

  // Show confirmed selection to everyone
  if (confirmed && pair.selectedProp) {
    return (
      <div className="max-w-lg mx-auto py-8 px-4 space-y-4 text-center">
        <p className="text-green-400 text-xl">✓ Selection confirmed</p>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-2">
          <p className="text-lg font-bold">
            Prop: {pair.selectedProp.replace("_", " ")}
          </p>
          <p className="text-[var(--muted)]">
            Furniture: {pair.selectedFurniture.map((f) => f.replace("_", " ")).join(" & ")}
          </p>
        </div>
      </div>
    );
  }

  if (!isActivePair && !isOrganizer && !isDisplay) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        {personA?.name} & {personB?.name} are choosing props…
      </div>
    );
  }

  // Display shows submitted selection (once submitted)
  if (isDisplay) {
    if (submitted && pair.selectedProp) {
      return (
        <div className="text-center py-12 space-y-2">
          <p className="text-[var(--muted)]">Proposed selection:</p>
          <p className="text-2xl font-bold">{pair.selectedProp.replace("_", " ")}</p>
          <p className="text-[var(--muted)]">{pair.selectedFurniture.map((f) => f.replace("_", " ")).join(" & ")}</p>
          <p className="text-sm text-yellow-300">Awaiting confirmation…</p>
        </div>
      );
    }
    return <div className="text-center py-12 text-[var(--muted)]">Selecting props…</div>;
  }

  // Someone submitted, other needs to confirm
  if (submitted && !confirmed && pair.selectedProp) {
    if (iSubmitted) {
      return (
        <div className="text-center py-12 space-y-3">
          <p className="text-[var(--muted)]">Waiting for {peerName} to confirm…</p>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <p className="font-bold">{pair.selectedProp.replace("_", " ")}</p>
            <p className="text-[var(--muted)] text-sm">{pair.selectedFurniture.map((f) => f.replace("_", " ")).join(" & ")}</p>
          </div>
          {isOrganizer && (
            <button onClick={handleOverride} className="px-4 py-2 rounded-lg bg-yellow-600 text-black font-semibold text-sm">
              Override & Advance
            </button>
          )}
        </div>
      );
    }
    // Other person needs to confirm
    return (
      <div className="max-w-sm mx-auto py-8 px-4 space-y-4 text-center">
        <p className="text-lg">{peerName} proposes:</p>
        <div className="bg-[var(--surface)] border border-[var(--accent)] rounded-xl p-4">
          <p className="font-bold text-xl">{pair.selectedProp.replace("_", " ")}</p>
          <p className="text-[var(--muted)]">{pair.selectedFurniture.map((f) => f.replace("_", " ")).join(" & ")}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded-xl bg-green-600 text-white font-bold"
          >
            ✓ Confirm
          </button>
          {isOrganizer && (
            <button onClick={handleOverride} className="px-4 py-2 rounded-lg bg-yellow-600 text-black font-semibold text-sm">
              Override
            </button>
          )}
        </div>
      </div>
    );
  }

  // Selection form
  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div className="text-center">
        <p className="text-[var(--muted)] text-sm">Round {roundNumber} · Pair {pairIndex + 1}</p>
        <h2 className="text-xl font-bold mt-1">Choose Props & Furniture</h2>
      </div>

      <PropGrid
        prop={prop}
        furniture={furniture}
        onPropChange={setProp}
        onFurnitureChange={setFurniture}
        disabled={!isActivePair}
      />

      {isActivePair && (
        <button
          onClick={handleSubmit}
          disabled={!prop || furniture.length !== 2}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-bold disabled:opacity-40"
        >
          Propose Selection
        </button>
      )}

      {isOrganizer && (
        <button
          onClick={handleOverride}
          className="w-full py-2 rounded-xl bg-yellow-600 text-black font-semibold text-sm"
        >
          Skip / Override
        </button>
      )}
    </div>
  );
}
