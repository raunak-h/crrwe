import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";

export interface ConnMeta {
  role: "organizer" | "participant" | "display" | null;
  participantId: string | null;
}

const registry = new Map<WebSocket, ConnMeta>();

let wss: WebSocketServer | null = null;

export function initWsServer(server: import("http").Server): WebSocketServer {
  wss = new WebSocketServer({ server });
  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    registry.set(ws, { role: null, participantId: null });
    ws.on("close", () => registry.delete(ws));
  });
  return wss;
}

export function getWss(): WebSocketServer {
  if (!wss) throw new Error("WS server not initialized");
  return wss;
}

export function getRegistry(): Map<WebSocket, ConnMeta> {
  return registry;
}

export function getMeta(ws: WebSocket): ConnMeta {
  return registry.get(ws) ?? { role: null, participantId: null };
}

export function setMeta(ws: WebSocket, meta: Partial<ConnMeta>): void {
  const current = registry.get(ws) ?? { role: null, participantId: null };
  registry.set(ws, { ...current, ...meta });
}

export function sendTo(ws: WebSocket, msg: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
