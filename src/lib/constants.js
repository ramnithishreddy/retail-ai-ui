export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const CHAT_ENDPOINT = `${API_BASE_URL}/chat`;
export const CHAT_STREAM_ENDPOINT = `${API_BASE_URL}/chat/stream`;

export const SUGGESTIONS = [
  { icon: "📍", text: "Where can I find basmati rice?" },
  { icon: "📄", text: "What is the return policy?" },
  { icon: "🌐", text: "What is DMart?" },
  { icon: "⏰", text: "What time does the store open?" },
];

export const STORAGE_KEYS = {
  theme: "retail-ai-theme",
  sessionId: "retail-ai-session-id",
  threads: "retail-ai-threads",
};
