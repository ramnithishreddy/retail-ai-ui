import { useCallback, useRef } from "react";
import { useChatStore } from "../lib/stores/chatStore";
import { useThreadsStore } from "../lib/stores/threadsStore";
import { sendChatMessage, streamChatMessage } from "../lib/api";

export function useChat({ streaming = true } = {}) {
  const sessionId = useChatStore((s) => s.sessionId);
  const setSessionId = useChatStore((s) => s.setSessionId);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);
  const appendToLastMessage = useChatStore((s) => s.appendToLastMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const setError = useChatStore((s) => s.setError);
  const saveSnapshot = useThreadsStore((s) => s.saveSnapshot);

  const controllerRef = useRef(null);

  const send = useCallback(
    async (text) => {
      const message = text.trim();
      if (!message) return;

      setError(null);
      addMessage({ role: "user", content: message });
      addMessage({ role: "assistant", content: "", sources: [], route: null, pending: true });

      if (streaming) {
        setStreaming(true);
        controllerRef.current = streamChatMessage({ message, sessionId }, (event) => {
          if (event.type === "start" && event.session_id) {
            setSessionId(event.session_id);
          } else if (event.type === "token") {
            updateLastMessage({ pending: false });
            appendToLastMessage(event.content);
          } else if (event.type === "sources") {
            updateLastMessage({ sources: event.sources, route: event.route });
          } else if (event.type === "error") {
            updateLastMessage({ content: "Sorry — something went wrong.", route: "error", pending: false });
            setError(event.error?.message || "Unknown error");
          } else if (event.type === "done") {
            setStreaming(false);
            controllerRef.current = null;
            persistThread();
          }
        });
      } else {
        setLoading(true);
        try {
          const data = await sendChatMessage({ message, sessionId });
          if (data.session_id) setSessionId(data.session_id);
          updateLastMessage({ content: data.answer, sources: data.sources || [], route: data.route, pending: false });
          persistThread();
        } catch (err) {
          updateLastMessage({ content: "Sorry — something went wrong.", route: "error", pending: false });
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    },
    [sessionId, streaming, addMessage, updateLastMessage, appendToLastMessage, setLoading, setStreaming, setSessionId, setError, saveSnapshot]
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStreaming(false);
    updateLastMessage({ pending: false });
  }, [setStreaming, updateLastMessage]);

  return { send, stop };
}

function persistThread() {
  const { sessionId, messages } = useChatStore.getState();
  useThreadsStore.getState().saveSnapshot({ sessionId, messages });
}
