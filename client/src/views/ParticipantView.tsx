import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { sendMessage } from "../socket/useSocket";
import PinGate from "../components/PinGate";
import PhaseHeader from "../components/PhaseHeader";
import PhaseDispatcher from "../phases/PhaseDispatcher";

const SESSION_KEY = "crrwe_participant_auth";

function saveSession(name: string, pin: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name, pin }));
}

function loadSession(): { name: string; pin: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ParticipantView() {
  const authResult = useGameStore((s) => s.authResult);
  const gameState = useGameStore((s) => s.gameState);
  const connected = useGameStore((s) => s.connected);
  const setOnReconnect = useGameStore((s) => s.setOnReconnect);

  const [step, setStep] = useState<"name" | "pin">("name");
  const [selectedName, setSelectedName] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const pendingPin = useRef<string | null>(null);

  // On mount: attempt silent re-auth from sessionStorage
  useEffect(() => {
    const session = loadSession();
    if (session) {
      pendingPin.current = session.pin;
      setSelectedName(session.name);
      sendMessage({ type: "AUTH_PARTICIPANT", name: session.name, pin: session.pin });
    }
  }, []);

  // On reconnect: re-send auth automatically using stored session
  useEffect(() => {
    setOnReconnect(() => {
      const session = loadSession();
      if (session) {
        sendMessage({ type: "AUTH_PARTICIPANT", name: session.name, pin: session.pin });
      }
    });
    return () => setOnReconnect(null);
  }, [setOnReconnect]);

  // Handle auth results
  useEffect(() => {
    if (authResult?.success && authResult.role === "participant" && authResult.participantId) {
      setParticipantId(authResult.participantId);
    }
    // Silent re-auth from session failed (e.g. server reset, PIN changed) — clear session
    if (authResult?.success === false && loadSession()) {
      sessionStorage.removeItem(SESSION_KEY);
      setSelectedName("");
      pendingPin.current = null;
    }
  }, [authResult]);

  const participants = gameState?.participants ?? [];
  const isAuthed = participantId != null;
  const authFailed = authResult?.success === false && !loadSession();

  function handleNameSelect(name: string) {
    setSelectedName(name);
    setStep("pin");
  }

  function handlePin(pin: string) {
    pendingPin.current = pin;
    sendMessage({ type: "AUTH_PARTICIPANT", name: selectedName, pin });
  }

  // After successful manual auth, save to session
  useEffect(() => {
    if (isAuthed && selectedName && pendingPin.current) {
      saveSession(selectedName, pendingPin.current);
    }
  }, [isAuthed, selectedName]);

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
        <h1 className="text-3xl font-bold">Magic Mike For Everyone</h1>

        {step === "name" && (
          <div className="w-full max-w-sm space-y-3">
            <p className="text-[var(--muted)] text-center text-sm">Who are you?</p>
            {participants.length === 0 && (
              <p className="text-center text-[var(--muted)] text-sm">Waiting for organizer to add participants…</p>
            )}
            {participants.map((p) => (
              <button
                key={p.id}
                onClick={() => handleNameSelect(p.name)}
                className="w-full py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg font-semibold hover:border-[var(--accent)] transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {step === "pin" && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold">{selectedName}</p>
            <PinGate label="Your PIN" onSubmit={handlePin} error={authFailed} />
            <button
              onClick={() => { setStep("name"); setSelectedName(""); }}
              className="text-[var(--muted)] text-sm underline"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold text-[var(--accent)]">Magic Mike For Everyone</h1>
        <span className="text-sm text-[var(--muted)]">
          {participants.find((p) => p.id === participantId)?.name}
        </span>
      </div>
      <PhaseHeader phase={gameState.phase} />
      <div className="flex-1 overflow-y-auto">
        <PhaseDispatcher
          phase={gameState.phase}
          participantId={participantId ?? undefined}
        />
      </div>
    </div>
  );
}
