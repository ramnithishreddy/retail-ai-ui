import { MessageSquarePlus, Trash2, X } from "lucide-react";
import { useThreadsStore } from "../lib/stores/threadsStore";
import { useChatStore } from "../lib/stores/chatStore";
import { cn, formatTime } from "../lib/utils";

export function Sidebar({ open, onClose }) {
  const threads = useThreadsStore((s) => s.threads);
  const removeThread = useThreadsStore((s) => s.removeThread);
  const resetChat = useChatStore((s) => s.reset);
  const loadThread = useChatStore((s) => s.loadThread);
  const currentSessionId = useChatStore((s) => s.sessionId);

  return (
    <aside className={cn("sidebar", open && "sidebar-open")} aria-hidden={!open}>
      <div className="sidebar-header">
        <span className="sidebar-title">History</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      <button
        className="new-chat-button"
        onClick={() => {
          resetChat();
          onClose();
        }}
      >
        <MessageSquarePlus size={16} />
        New chat
      </button>

      <div className="thread-list">
        {threads.length === 0 ? (
          <p className="thread-empty">No past chats yet.</p>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className={cn(
                "thread-row",
                thread.sessionId === currentSessionId && "thread-row-active"
              )}
            >
              <button
                className="thread-main"
                onClick={() => {
                  loadThread(thread);
                  onClose();
                }}
              >
                <span className="thread-title">{thread.title}</span>
                <span className="thread-time">
                  {formatTime(thread.updatedAt)}
                </span>
              </button>
              <button
                className="icon-button thread-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeThread(thread.id);
                }}
                aria-label={`Delete thread "${thread.title}"`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
