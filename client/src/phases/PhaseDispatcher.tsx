import { PhaseId } from "../socket/protocol";
import SetupPhase from "../phases/SetupPhase";
import SongSubmissionPhase from "../phases/SongSubmissionPhase";
import ExclusionPhase from "../phases/ExclusionPhase";
import RoleSelectionPhase from "../phases/RoleSelectionPhase";
import PairingComputedPhase from "../phases/PairingComputedPhase";
import DrawPhase from "../phases/DrawPhase";
import SongSelectPhase from "../phases/SongSelectPhase";
import PropSelectPhase from "../phases/PropSelectPhase";
import PerformPhase from "../phases/PerformPhase";
import CompletePhase from "../phases/CompletePhase";

function parseRoundPhase(phase: PhaseId): { round: number; pair: number; suffix: string } | null {
  const m = phase.match(/^round_(\d+)_pair_(\d+)_(\w+)$/);
  if (!m) return null;
  return { round: parseInt(m[1]), pair: parseInt(m[2]), suffix: m[3] };
}

interface Props {
  phase: PhaseId;
  participantId?: string;
  isOrganizer?: boolean;
  isDisplay?: boolean;
}

export default function PhaseDispatcher({ phase, participantId, isOrganizer, isDisplay }: Props) {
  if (phase === "setup") return <SetupPhase isOrganizer={isOrganizer} />;
  if (phase === "song_submission") return <SongSubmissionPhase participantId={participantId} isOrganizer={isOrganizer} />;
  if (phase === "exclusion_setting") return <ExclusionPhase participantId={participantId} isOrganizer={isOrganizer} />;
  if (phase === "role_selection") return <RoleSelectionPhase participantId={participantId} isOrganizer={isOrganizer} />;
  if (phase === "pairing_computed") return <PairingComputedPhase isOrganizer={isOrganizer} />;
  if (phase === "complete") return <CompletePhase isDisplay={isDisplay} />;

  const rp = parseRoundPhase(phase);
  if (rp) {
    if (rp.suffix === "draw")
      return <DrawPhase roundNumber={rp.round} pairIndex={rp.pair} participantId={participantId} isOrganizer={isOrganizer} isDisplay={isDisplay} />;
    if (rp.suffix === "song")
      return <SongSelectPhase roundNumber={rp.round} pairIndex={rp.pair} participantId={participantId} isOrganizer={isOrganizer} isDisplay={isDisplay} />;
    if (rp.suffix === "props")
      return <PropSelectPhase roundNumber={rp.round} pairIndex={rp.pair} participantId={participantId} isOrganizer={isOrganizer} isDisplay={isDisplay} />;
    if (rp.suffix === "perform")
      return <PerformPhase roundNumber={rp.round} pairIndex={rp.pair} participantId={participantId} isOrganizer={isOrganizer} isDisplay={isDisplay} />;
  }

  return <div className="text-center py-12 text-[var(--muted)]">Unknown phase: {phase}</div>;
}
