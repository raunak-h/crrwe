import { Prop, Furniture } from "../socket/protocol";

export const PROPS: { value: Prop; label: string; emoji: string }[] = [
  { value: "mop", label: "Mop", emoji: "🧹" },
  { value: "sash_ribbon", label: "Sash Ribbon", emoji: "🎀" },
  { value: "belt", label: "Belt", emoji: "👟" },
];

export const FURNITURE: { value: Furniture; label: string; emoji: string }[] = [
  { value: "chair", label: "Chair", emoji: "🪑" },
  { value: "table", label: "Table", emoji: "🪵" },
  { value: "wide_couch", label: "Wide Couch", emoji: "🛋️" },
];

interface Props {
  prop: Prop | null;
  furniture: Furniture[];
  onPropChange: (p: Prop) => void;
  onFurnitureChange: (f: Furniture[]) => void;
  disabled?: boolean;
}

export default function PropGrid({ prop, furniture, onPropChange, onFurnitureChange, disabled }: Props) {
  function toggleFurniture(f: Furniture) {
    if (furniture.includes(f)) {
      onFurnitureChange(furniture.filter((x) => x !== f));
    } else if (furniture.length < 2) {
      onFurnitureChange([...furniture, f]);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-2 uppercase tracking-wide">Prop (choose 1)</h3>
        <div className="grid grid-cols-3 gap-3">
          {PROPS.map((p) => (
            <button
              key={p.value}
              disabled={disabled}
              onClick={() => onPropChange(p.value)}
              className={`rounded-xl border p-4 text-center transition-all ${
                prop === p.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/15"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="text-2xl mb-1">{p.emoji}</div>
              <div className="text-sm">{p.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-2 uppercase tracking-wide">
          Furniture (choose 2) — {furniture.length}/2
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {FURNITURE.map((f) => (
            <button
              key={f.value}
              disabled={disabled || (furniture.length >= 2 && !furniture.includes(f.value))}
              onClick={() => toggleFurniture(f.value)}
              className={`rounded-xl border p-4 text-center transition-all ${
                furniture.includes(f.value)
                  ? "border-[var(--accent2)] bg-[var(--accent2)]/15"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50"
              } ${
                disabled || (furniture.length >= 2 && !furniture.includes(f.value))
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <div className="text-2xl mb-1">{f.emoji}</div>
              <div className="text-sm">{f.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
