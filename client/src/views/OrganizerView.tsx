import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import PinGate from "../components/PinGate";
import PhaseHeader from "../components/PhaseHeader";
import PhaseDispatcher from "../phases/PhaseDispatcher";

const SESSION_KEY = "crrwe_organizer_pin";

export default function OrganizerView() {
  const authResult = useGameStore((s) => s.authResult);
  const gameState = useGameStore((s) => s.gameState);
  const setOnReconnect = useGameStore((s) => s.setOnReconnect);

  // On mount: try silent re-auth from sessionStorage
  useEffect(() => {
    const pin = sessionStorage.getItem(SESSION_KEY);
    if (pin) sendMessage({ type: "AUTH_ORGANIZER", pin });
  }, []);

  // On reconnect: re-send organizer auth automatically
  useEffect(() => {
    setOnReconnect(() => {
      const pin = sessionStorage.getItem(SESSION_KEY);
      if (pin) sendMessage({ type: "AUTH_ORGANIZER", pin });
    });
    return () => setOnReconnect(null);
  }, [setOnReconnect]);

  function handlePin(pin: string) {
    sessionStorage.setItem(SESSION_KEY, pin);
    sendMessage({ type: "AUTH_ORGANIZER", pin });
  }

  // Clear session if auth fails (e.g. PIN changed)
  useEffect(() => {
    if (authResult?.success === false) {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [authResult]);

  const isAuthed = authResult?.role === "organizer";
  const authFailed = authResult?.success === false;

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <h1 className="text-3xl font-bold">Magic Mike For Everyone</h1>
        <p className="text-[var(--muted)]">Organizer Access</p>
        <PinGate label="Organizer PIN" onSubmit={handlePin} error={authFailed} />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold text-[var(--accent)]">Magic Mike For Everyone — Organizer</h1>
        <span className="text-xs text-[var(--muted)] font-mono">{gameState.phase}</span>
      </div>
      <PhaseHeader phase={gameState.phase} />
      <div className="flex-1 overflow-y-auto">
        <PhaseDispatcher
          phase={gameState.phase}
          isOrganizer={true}
        />
      </div>
    </div>
  );
}
