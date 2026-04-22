import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import PhaseDispatcher from "../phases/PhaseDispatcher";
import participantQrCode from "../assets/participant_qr_code.png";

export default function DisplayView() {
  const gameState = useGameStore((s) => s.gameState);
  const connected = useGameStore((s) => s.connected);

  useEffect(() => {
    // Identify as display to server when connected
    if (connected) {
      sendMessage({ type: "DISPLAY_CONNECT" });
    }
  }, [connected]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-bold text-[var(--accent)]">Magic Mike For Everyone</h1>
        <p className="text-[var(--muted)] text-lg">Connecting…</p>
      </div>
    );
  }

  const participantCount = gameState.participants.length;
  const allParticipantsJoined = participantCount >= 8;
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h1 className="text-2xl font-bold text-[var(--accent)]">Magic Mike For Everyone</h1>
        <span className="text-sm font-mono text-[var(--muted)]">{gameState.phase}</span>
      </div>
      {!allParticipantsJoined && (
        <div className="mx-4 mt-4 md:mx-6 rounded-2xl border-2 border-[var(--accent)] bg-[var(--surface)] px-4 py-5 md:px-6 md:py-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-8">
            <div className="text-center md:text-left">
              <p className="text-sm uppercase tracking-wider text-[var(--accent)]">Join Now</p>
              <h2 className="mt-1 text-3xl md:text-4xl font-black">Scan to Join Participants</h2>
              <p className="mt-2 text-[var(--muted)] text-lg">
                {participantCount}/8 joined. Keep scanning until everyone is in.
              </p>
            </div>
            <img
              src={participantQrCode}
              alt="QR code for participant join page"
              className="w-52 h-52 md:w-64 md:h-64 rounded-xl border border-[var(--border)] bg-white p-2"
            />
          </div>
        </div>
      )}
      <div className="flex-1">
        <PhaseDispatcher
          phase={gameState.phase}
          isDisplay={true}
        />
      </div>
      <div className="fixed bottom-4 right-4 z-40 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 shadow-lg backdrop-blur px-2 py-2">
        <p className="text-[10px] text-center text-[var(--muted)] mb-1">Rejoin</p>
        <img
          src={participantQrCode}
          alt="QR code to reconnect participants"
          className="w-20 h-20 rounded-md bg-white p-1"
        />
      </div>
    </div>
  );
}
