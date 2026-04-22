import { useState, FormEvent } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import { Vibe } from "../socket/protocol";

interface Props {
  participantId?: string;
  isOrganizer?: boolean;
}

export default function SongSubmissionPhase({ participantId, isOrganizer }: Props) {
  const gameState = useGameStore((s) => s.gameState);
  const error = useGameStore((s) => s.error);
  const [songs, setSongs] = useState([
    { url: "", vibe: "energetic" as Vibe },
    { url: "", vibe: "calm" as Vibe },
  ]);

  const me = gameState?.participants.find((p) => p.id === participantId);
  const submittedCount = gameState?.participants.filter((p) => p.songsSubmitted).length ?? 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!participantId) return;
    sendMessage({ type: "SUBMIT_SONGS", participantId, songs });
  }

  function handleAdvance() {
    sendMessage({ type: "ADVANCE_PHASE" });
  }

  if (me?.songsSubmitted) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-green-400 text-xl">✓ Songs submitted!</p>
        <p className="text-[var(--muted)]">{submittedCount}/8 submitted</p>
        {isOrganizer && (
          <button
            onClick={handleAdvance}
            disabled={submittedCount !== 8}
            className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent2)] text-black font-bold disabled:opacity-40"
          >
            Next → Exclusions
          </button>
        )}
      </div>
    );
  }

  if (isOrganizer && !participantId) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-[var(--muted)]">Waiting for participants to submit songs…</p>
        <p className="text-2xl font-bold">{submittedCount}/8</p>
        <button
          onClick={handleAdvance}
          disabled={submittedCount !== 8}
          className="mt-4 px-6 py-2 rounded-xl bg-[var(--accent2)] text-black font-bold disabled:opacity-40"
        >
          Next → Exclusions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold">Submit Your Songs</h2>
        <p className="text-[var(--muted)] text-sm mt-1">One energetic/sassy, one calm/sensual. Spotify or YouTube links.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {songs.map((song, i) => (
          <div key={i} className="space-y-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex gap-2">
              {(["energetic", "calm"] as Vibe[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    const updated = [...songs];
                    updated[i] = { ...updated[i], vibe: v };
                    setSongs(updated);
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    song.vibe === v
                      ? v === "energetic"
                        ? "bg-orange-600 text-white"
                        : "bg-blue-700 text-white"
                      : "bg-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {v === "energetic" ? "⚡ Energetic" : "🌙 Calm"}
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="Spotify or YouTube URL"
              value={song.url}
              onChange={(e) => {
                const updated = [...songs];
                updated[i] = { ...updated[i], url: e.target.value };
                setSongs(updated);
              }}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        ))}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={songs.some((s) => !s.url.trim())}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-bold disabled:opacity-40"
        >
          Submit Songs
        </button>
      </form>

      <p className="text-center text-[var(--muted)] text-sm">{submittedCount}/8 submitted</p>
    </div>
  );
}
