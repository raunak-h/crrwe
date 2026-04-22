import { useState, FormEvent } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";

interface Props {
  isOrganizer?: boolean;
}

export default function SetupPhase({ isOrganizer }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const error = useGameStore((s) => s.error);

  const participants = gameState?.participants ?? [];

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || pin.length !== 4) return;
    sendMessage({ type: "ADD_PARTICIPANT", name: name.trim(), pin });
    setName("");
    setPin("");
    setErr("");
  }

  function handleRemove(id: string) {
    sendMessage({ type: "REMOVE_PARTICIPANT", participantId: id });
  }

  function handleAdvance() {
    sendMessage({ type: "ADVANCE_PHASE" });
  }

  if (!isOrganizer) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p className="text-xl">Waiting for the organizer to set up the event…</p>
        <p className="mt-2 text-sm">{participants.length}/8 participants added</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <h2 className="text-xl font-bold">Add Participants</h2>

      <form onSubmit={handleAdd} className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent)]"
        />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="4-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent)]"
        />
        {(err || error) && <p className="text-red-400 text-sm">{err || error}</p>}
        <button
          type="submit"
          disabled={!name.trim() || pin.length !== 4 || participants.length >= 8}
          className="w-full py-2 rounded-lg bg-[var(--accent)] text-black font-semibold disabled:opacity-40"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2"
          >
            <span>{p.name}</span>
            <button
              onClick={() => handleRemove(p.id)}
              className="text-red-400 text-sm hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
        <p className="text-[var(--muted)] text-sm text-right">{participants.length}/8</p>
      </div>

      <button
        onClick={handleAdvance}
        disabled={participants.length !== 8}
        className="w-full py-3 rounded-xl bg-[var(--accent2)] text-black font-bold disabled:opacity-40"
      >
        Start → Song Submission
      </button>
    </div>
  );
}
