import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { ServerMessage, ClientMessage } from "./protocol";

const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;

let socket: WebSocket | null = null;
const listeners: Set<(msg: ServerMessage) => void> = new Set();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pendingQueue: ClientMessage[] = [];

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    useGameStore.getState().setConnected(true);
    // Flush any messages queued before the socket was ready
    const queued = pendingQueue.splice(0);
    queued.forEach((msg) => socket!.send(JSON.stringify(msg)));
    useGameStore.getState().onReconnect?.();
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as ServerMessage;
      listeners.forEach((l) => l(msg));
    } catch {
      // ignore parse errors
    }
  };

  socket.onclose = () => {
    useGameStore.getState().setConnected(false);
    socket = null;
    reconnectTimer = setTimeout(connect, 2000);
  };

  socket.onerror = () => {
    socket?.close();
  };
}

export function sendMessage(msg: ClientMessage): void {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  } else {
    // Queue the message — will be flushed once the socket opens
    pendingQueue.push(msg);
    connect();
  }
}

export function useSocket() {
  const setGameState = useGameStore((s) => s.setGameState);
  const setAuthResult = useGameStore((s) => s.setAuthResult);
  const setError = useGameStore((s) => s.setError);

  useEffect(() => {
    const handler = (msg: ServerMessage) => {
      if (msg.type === "STATE_UPDATE") setGameState(msg.payload);
      else if (msg.type === "AUTH_RESULT") setAuthResult(msg);
      else if (msg.type === "ERROR") setError(msg.message);
    };

    listeners.add(handler);
    connect();

    return () => {
      listeners.delete(handler);
    };
  }, [setGameState, setAuthResult, setError]);
}
