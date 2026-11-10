import { create } from "zustand";
import { STORAGE_KEYS } from "../constants";

export const useChatStore = create((set) => ({
  sessionId: readSessionId(),
  messages: [],
  loading: false,
  streaming: false,
  error: null,

  setSessionId: (sessionId) => {
    try { if (sessionId) localStorage.setItem(STORAGE_KEYS.sessionId, sessionId); } catch { /* ignore */ }
    set({ sessionId });
  },

  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  updateLastMessage: (patch) =>
    set((s) => {
      if (!s.messages.length) return s;
      const last = { ...s.messages[s.messages.length - 1], ...patch };
      return { messages: [...s.messages.slice(0, -1), last] };
    }),

  appendToLastMessage: (text) =>
    set((s) => {
      if (!s.messages.length) return s;
      const last = { ...s.messages[s.messages.length - 1], content: (s.messages[s.messages.length - 1].content || "") + text };
      return { messages: [...s.messages.slice(0, -1), last] };
    }),

  setLoading: (loading) => set({ loading }),
  setStreaming: (streaming) => set({ streaming }),
  setError: (error) => set({ error }),

  reset: () => {
    try { localStorage.removeItem(STORAGE_KEYS.sessionId); } catch { /* ignore */ }
    set({ sessionId: null, messages: [], loading: false, streaming: false, error: null });
  },

  loadThread: (thread) =>
    set({ sessionId: thread.sessionId, messages: thread.messages, loading: false, streaming: false, error: null }),
}));

function readSessionId() {
  try { return localStorage.getItem(STORAGE_KEYS.sessionId); } catch { return null; }
}
