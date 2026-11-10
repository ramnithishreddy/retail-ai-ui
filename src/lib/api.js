import { CHAT_ENDPOINT, CHAT_STREAM_ENDPOINT } from "./constants";

/** Non-streaming chat. Returns {answer, route, sources, session_id, response_time_ms}. */
export async function sendChatMessage({ message, sessionId }) {
  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId ?? null }),
  });
  if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);
  return await response.json();
}

/**
 * Streaming chat over SSE. Calls onEvent for each parsed frame:
 * start → token(s) → sources → end → done
 * Returns an AbortController.
 */
export function streamChatMessage({ message, sessionId }, onEvent) {
  const controller = new AbortController();

  (async () => {
    let response;
    try {
      response = await fetch(CHAT_STREAM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: sessionId ?? null, stream: true }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name !== "AbortError") onEvent({ type: "error", error: err });
      return;
    }

    if (!response.ok || !response.body) {
      onEvent({ type: "error", error: new Error(`Stream failed: ${response.status}`) });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const rawFrame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const dataLine = rawFrame.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          const payload = dataLine.slice(5).trim();
          if (payload === "[DONE]") { onEvent({ type: "done" }); return; }
          try { onEvent(JSON.parse(payload)); } catch { /* non-JSON frame, skip */ }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") onEvent({ type: "error", error: err });
    } finally {
      onEvent({ type: "done" });
    }
  })();

  return controller;
}
