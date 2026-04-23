// Tiny in-memory event bus used to log voice commands across the app.
// Persisted to localStorage so the audit trail survives reloads.

import type { VoiceCommandLog } from "./mock-data";
import { voiceHistorySeed } from "./mock-data";

const STORAGE_KEY = "hw-voice-history-v1";
type Listener = (log: VoiceCommandLog[]) => void;
const listeners = new Set<Listener>();

function read(): VoiceCommandLog[] {
  if (typeof window === "undefined") return voiceHistorySeed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return voiceHistorySeed;
    return JSON.parse(raw) as VoiceCommandLog[];
  } catch {
    return voiceHistorySeed;
  }
}

function write(items: VoiceCommandLog[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* noop */ }
}

export function getVoiceHistory(): VoiceCommandLog[] {
  return read();
}

export function logVoiceCommand(entry: Omit<VoiceCommandLog, "id" | "at">) {
  const next: VoiceCommandLog = {
    ...entry,
    id: `vh-${Date.now()}`,
    at: "Just now",
  };
  const all = [next, ...read()].slice(0, 50);
  write(all);
  listeners.forEach((l) => l(all));
}

export function subscribeVoiceHistory(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
