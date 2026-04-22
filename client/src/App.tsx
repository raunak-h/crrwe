import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSocket } from "./socket/useSocket";
import OrganizerView from "./views/OrganizerView";
import ParticipantView from "./views/ParticipantView";
import DisplayView from "./views/DisplayView";
import { useGameStore } from "./store/gameStore";

function ConnectionBanner() {
  const connected = useGameStore((s) => s.connected);
  if (connected) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-900 text-white text-center py-1 text-sm">
      Reconnecting…
    </div>
  );
}

export default function App() {
  useSocket();

  return (
    <BrowserRouter>
      <ConnectionBanner />
      <Routes>
        <Route path="/organizer" element={<OrganizerView />} />
        <Route path="/participant" element={<ParticipantView />} />
        <Route path="/participants" element={<ParticipantView />} />
        <Route path="/display" element={<DisplayView />} />
        <Route path="*" element={<Navigate to="/participant" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
