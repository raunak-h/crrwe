import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";
import { InternalGameState } from "./types.js";
import { DATA_PATH } from "../config.js";

export function loadFromDisk(): InternalGameState | null {
  if (!existsSync(DATA_PATH)) return null;
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as InternalGameState;
  } catch {
    return null;
  }
}

export function saveToDisk(state: InternalGameState): void {
  const dir = dirname(DATA_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), "utf-8");
}
