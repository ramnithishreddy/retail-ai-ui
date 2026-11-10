import { useEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";

/**
 * Chat input with Lumina-style auto-growing textarea.
 */
export function ChatInput({ value, onChange, onSend, onStop, disabled, streaming }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about the retail store..."
          rows={1}
          disabled={disabled && !streaming}
        />

        {streaming ? (
          <button
            className="send-button stop-button"
            onClick={onStop}
            aria-label="Stop generating"
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            className="send-button"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            aria-label="Send message"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
      <div className="input-hint">
        Enter to send • Shift + Enter for a new line
      </div>
    </div>
  );
}
