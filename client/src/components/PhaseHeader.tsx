import { PhaseId } from "../socket/protocol";

const STAGES = [
  { id: "setup", label: "Setup" },
  { id: "song_submission", label: "Songs" },
  { id: "exclusion_setting", label: "Exclusions" },
  { id: "role_selection", label: "Roles" },
  { id: "pairing_computed", label: "Pairings" },
  { id: "rounds", label: "Rounds" },
  { id: "complete", label: "Done" },
];

function stageIndex(phase: PhaseId): number {
  if (phase === "setup") return 0;
  if (phase === "song_submission") return 1;
  if (phase === "exclusion_setting") return 2;
  if (phase === "role_selection") return 3;
  if (phase === "pairing_computed") return 4;
  if (phase === "complete") return 6;
  if (phase.startsWith("round_")) return 5;
  return 0;
}

function roundInfo(phase: PhaseId): string | null {
  const m = phase.match(/^round_(\d+)_pair_(\d+)_(\w+)/);
  if (!m) return null;
  const suffixMap: Record<string, string> = {
    draw: "Draw",
    song: "Song",
    props: "Props",
    perform: "Perform",
  };
  return `Round ${m[1]} · Pair ${parseInt(m[2]) + 1} · ${suffixMap[m[3]] ?? m[3]}`;
}

interface Props {
  phase: PhaseId;
}

export default function PhaseHeader({ phase }: Props) {
  const current = stageIndex(phase);
  const info = roundInfo(phase);

  return (
    <div className="w-full px-4 py-3 border-b border-[var(--border)]">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex gap-1 items-center">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < current
                    ? "bg-[var(--accent)]"
                    : i === current
                    ? "bg-[var(--accent2)]"
                    : "bg-[var(--border)]"
                }`}
              />
              <span
                className={`text-xs ${
                  i === current ? "text-[var(--accent2)]" : "text-[var(--muted)]"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        {info && (
          <span className="text-xs font-mono text-[var(--accent)]">{info}</span>
        )}
      </div>
    </div>
  );
}
