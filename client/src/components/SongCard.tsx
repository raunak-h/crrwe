import { Song, SafeParticipant } from "../socket/protocol";

interface Props {
  song: Song;
  participants: SafeParticipant[];
  selected?: boolean;
  voted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const SPOTIFY_RE = /open\.spotify\.com|spotify\.com/;
const YOUTUBE_RE = /youtube\.com|youtu\.be|music\.youtube\.com/;

function SongIcon({ url }: { url: string }) {
  if (SPOTIFY_RE.test(url))
    return <span className="text-green-400 text-lg">♬</span>;
  if (YOUTUBE_RE.test(url))
    return <span className="text-red-400 text-lg">▶</span>;
  return <span className="text-gray-400 text-lg">♪</span>;
}

export default function SongCard({ song, participants, selected, voted, onClick, disabled }: Props) {
  const submitter = participants.find((p) => p.id === song.submittedBy);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent)]/15"
          : voted
          ? "border-[var(--accent2)] bg-[var(--accent2)]/10"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-3">
        <SongIcon url={song.url} />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-[var(--muted)] truncate">{song.url}</div>
          <div className="flex gap-2 mt-1 items-center">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                song.vibe === "energetic"
                  ? "bg-orange-900/50 text-orange-300"
                  : "bg-blue-900/50 text-blue-300"
              }`}
            >
              {song.vibe}
            </span>
            <span className="text-xs text-[var(--muted)]">by {submitter?.name ?? "?"}</span>
          </div>
        </div>
        <a
          href={song.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[var(--muted)] hover:text-white text-sm shrink-0"
        >
          ↗
        </a>
      </div>
    </button>
  );
}
