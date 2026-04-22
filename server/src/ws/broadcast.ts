import WebSocket from "ws";
import { getWss } from "./wsServer.js";
import { getState } from "../state/store.js";
import { toSafeState } from "../state/types.js";

export function broadcastState(): void {
  const safe = toSafeState(getState());
  const msg = JSON.stringify({ type: "STATE_UPDATE", payload: safe });
  getWss().clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
