import WebSocket from "ws";
import bcrypt from "bcrypt";
import { getMeta, setMeta, sendTo } from "./wsServer.js";
import { getState } from "../state/store.js";
import { ORGANIZER_PIN } from "../config.js";
import { broadcastState } from "./broadcast.js";
import {
  handleAddParticipant,
  handleRemoveParticipant,
  handleAdvancePhase,
  handleComputePairings,
  handleDrawComplete,
  handleVoteSong,
  handleBreakSongTie,
  handleSubmitProps,
  handleConfirmProps,
  handleRejectProps,
  handleOverrideProps,
  handleSubmitSongs,
  handleSetExclusions,
  handleSelectRole,
} from "../engine/phaseRunner.js";
import { Prop, Furniture, Vibe } from "../state/types.js";

export function handleMessage(ws: WebSocket, raw: string): void {
  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(raw);
  } catch {
    sendTo(ws, { type: "ERROR", code: "BAD_JSON", message: "Invalid JSON" });
    return;
  }

  const type = msg.type as string;
  const meta = getMeta(ws);

  if (type === "AUTH_ORGANIZER") {
    const pin = msg.pin as string;
    if (pin === ORGANIZER_PIN) {
      setMeta(ws, { role: "organizer" });
      sendTo(ws, { type: "AUTH_RESULT", success: true, role: "organizer" });
      // Send current state
      broadcastState();
    } else {
      sendTo(ws, { type: "AUTH_RESULT", success: false, role: null });
    }
    return;
  }

  if (type === "AUTH_PARTICIPANT") {
    const name = msg.name as string;
    const pin = msg.pin as string;
    const state = getState();
    const participant = state.participants.find((p) => p.name === name);
    if (!participant) {
      sendTo(ws, { type: "AUTH_RESULT", success: false, role: null });
      return;
    }
    const ok = bcrypt.compareSync(pin, participant.pinHash);
    if (ok) {
      setMeta(ws, { role: "participant", participantId: participant.id });
      sendTo(ws, { type: "AUTH_RESULT", success: true, role: "participant", participantId: participant.id });
      broadcastState();
    } else {
      sendTo(ws, { type: "AUTH_RESULT", success: false, role: null });
    }
    return;
  }

  if (type === "DISPLAY_CONNECT") {
    setMeta(ws, { role: "display" });
    broadcastState();
    return;
  }

  // After here, require auth
  if (!meta.role) {
    sendTo(ws, { type: "ERROR", code: "UNAUTHENTICATED", message: "Not authenticated" });
    return;
  }

  const isOrganizer = meta.role === "organizer";

  function guardOrganizer(): boolean {
    if (!isOrganizer) {
      sendTo(ws, { type: "ERROR", code: "FORBIDDEN", message: "Organizer only" });
      return false;
    }
    return true;
  }

  function dispatch(result: { ok: boolean; error?: string }): void {
    if (!result.ok) {
      sendTo(ws, { type: "ERROR", code: "ACTION_FAILED", message: result.error ?? "Failed" });
    }
  }

  switch (type) {
    case "ADD_PARTICIPANT":
      if (!guardOrganizer()) return;
      dispatch(handleAddParticipant(msg.name as string, msg.pin as string));
      break;

    case "REMOVE_PARTICIPANT":
      if (!guardOrganizer()) return;
      dispatch(handleRemoveParticipant(msg.participantId as string));
      break;

    case "ADVANCE_PHASE":
      if (!guardOrganizer()) return;
      dispatch(handleAdvancePhase());
      break;

    case "COMPUTE_PAIRINGS":
      if (!guardOrganizer()) return;
      dispatch(handleComputePairings());
      break;

    case "DRAW_COMPLETE":
      // Display or organizer can signal
      if (meta.role !== "display" && !isOrganizer) {
        sendTo(ws, { type: "ERROR", code: "FORBIDDEN", message: "Display or organizer only" });
        return;
      }
      dispatch(handleDrawComplete());
      break;

    case "SUBMIT_SONGS":
      dispatch(handleSubmitSongs(
        msg.participantId as string,
        msg.songs as Array<{ url: string; vibe: Vibe }>
      ));
      break;

    case "SET_EXCLUSIONS":
      dispatch(handleSetExclusions(
        msg.participantId as string,
        msg.excludedIds as string[]
      ));
      break;

    case "SELECT_ROLE":
      dispatch(handleSelectRole(msg.participantId as string, msg.role as "A" | "B"));
      break;

    case "VOTE_SONG":
      dispatch(handleVoteSong(msg.participantId as string, msg.songId as string));
      break;

    case "BREAK_SONG_TIE":
      if (!guardOrganizer()) return;
      dispatch(handleBreakSongTie(msg.songId as string));
      break;

    case "SUBMIT_PROPS":
      dispatch(handleSubmitProps(
        msg.participantId as string,
        msg.prop as Prop,
        msg.furniture as Furniture[]
      ));
      break;

    case "CONFIRM_PROPS":
      dispatch(handleConfirmProps(msg.participantId as string));
      break;

    case "REJECT_PROPS":
      dispatch(handleRejectProps(msg.participantId as string));
      break;

    case "OVERRIDE_PROPS":
      if (!guardOrganizer()) return;
      dispatch(handleOverrideProps());
      break;

    default:
      sendTo(ws, { type: "ERROR", code: "UNKNOWN_TYPE", message: `Unknown message type: ${type}` });
  }
}
