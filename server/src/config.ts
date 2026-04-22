export const PORT = parseInt(process.env.PORT ?? "3001", 10);
export const ORGANIZER_PIN = process.env.ORGANIZER_PIN ?? "1234";
// In production, write state to a known writable path
export const DATA_PATH = process.env.DATA_PATH ?? (
  process.env.NODE_ENV === "production" ? "/tmp/state.json" : "./src/data/state.json"
);
