import { useState, FormEvent } from "react";

interface Props {
  label?: string;
  onSubmit: (pin: string) => void;
  error?: boolean;
}

export default function PinGate({ label = "Enter PIN", onSubmit, error }: Props) {
  const [pin, setPin] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pin.length === 4) onSubmit(pin);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <p className="text-[var(--muted)] text-sm">{label}</p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        className="w-32 text-center text-2xl tracking-widest bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--accent)]"
        placeholder="••••"
        autoFocus
      />
      {error && <p className="text-red-400 text-sm">Incorrect PIN</p>}
      <button
        type="submit"
        disabled={pin.length !== 4}
        className="px-6 py-2 rounded-lg bg-[var(--accent)] text-black font-semibold disabled:opacity-40 hover:opacity-90 transition"
      >
        Enter
      </button>
    </form>
  );
}
