interface Props {
  label: string;
  confirmed?: boolean;
  peerName?: string;
  peerConfirmed?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function VoteButton({ label, confirmed, peerName, peerConfirmed, onClick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onClick}
        disabled={disabled || confirmed}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          confirmed
            ? "bg-[var(--accent)]/30 border border-[var(--accent)] text-[var(--accent)]"
            : "bg-[var(--accent)] text-black hover:opacity-90"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {confirmed ? "✓ Confirmed" : label}
      </button>
      {peerName && (
        <p className="text-center text-sm text-[var(--muted)]">
          {peerName}: {peerConfirmed ? <span className="text-green-400">✓ ready</span> : <span>waiting…</span>}
        </p>
      )}
    </div>
  );
}
