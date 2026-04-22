import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import { PORT } from "./config.js";
import { loadFromDisk } from "./state/persist.js";
import { setState } from "./state/store.js";
import { initWsServer } from "./ws/wsServer.js";
import { handleMessage } from "./ws/handlers.js";
import router from "./http/router.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.use(express.json());
app.use("/api", router);

// In production, serve the built client
if (isProd) {
  const clientDist = join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

const server = createServer(app);
const wss = initWsServer(server);

// Load persisted state
const saved = loadFromDisk();
if (saved) {
  setState(saved);
  console.log("Loaded state from disk");
}

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    handleMessage(ws, data.toString());
  });
});

server.listen(PORT, () => {
  console.log(`Server running on :${PORT} (${isProd ? "production" : "development"})`);
});
