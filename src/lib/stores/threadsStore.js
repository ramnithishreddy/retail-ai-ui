import { create } from "zustand";
import { ulid } from "ulid";
import { STORAGE_KEYS } from "../constants";

export const useThreadsStore = create((set) => ({
  threads: readThreads(),

  saveSnapshot: ({ sessionId, messages }) => {
    if (!messages?.length) return;
    const title = messages.find((m) => m.role === "user")?.content.slice(0, 60) || "New conversation";

    set((state) => {
      const idx = state.threads.findIndex((t) => t.sessionId === sessionId);
      const snapshot = {
        id: idx === -1 ? ulid() : state.threads[idx].id,
        sessionId: sessionId || ulid(),
        title,
        messages,
        updatedAt: Date.now(),
      };
      const next = idx === -1
        ? [snapshot, ...state.threads]
        : [snapshot, ...state.threads.filter((_, i) => i !== idx)];
      const trimmed = next.slice(0, 25);
      persist(trimmed);
      return { threads: trimmed };
    });
  },

  removeThread: (id) =>
    set((state) => {
      const next = state.threads.filter((t) => t.id !== id);
      persist(next);
      return { threads: next };
    }),

  clearAll: () => { persist([]); set({ threads: [] }); },
}));

function readThreads() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.threads) || "[]"); } catch { return []; }
}

function persist(threads) {
  try { localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads)); } catch { /* storage full */ }
}
