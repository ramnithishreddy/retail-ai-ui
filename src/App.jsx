import { useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Welcome } from "./components/Welcome";
import { Message, TypingIndicator } from "./components/Message";
import { ChatInput } from "./components/ChatInput";
import { useChatStore } from "./lib/stores/chatStore";
import { useChat } from "./hooks/useChat";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messages = useChatStore((s) => s.messages);
  const loading = useChatStore((s) => s.loading);
  const streaming = useChatStore((s) => s.streaming);

  const { send, stop } = useChat({ streaming: true });

  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || loading || streaming) return;
    setInput("");
    await send(message);
  };

  const lastMessage = messages[messages.length - 1];
  const showPendingIndicator =
    lastMessage?.role === "assistant" && lastMessage?.pending;

  return (
    <div className="app">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <main className="chat-container" ref={scrollRef}>
        {messages.length === 0 ? (
          <Welcome onSuggestionClick={setInput} />
        ) : (
          <div className="messages">
            {messages.map((message, idx) =>
              message.pending && !message.content ? (
                <TypingIndicator key={idx} />
              ) : (
                <Message key={idx} message={message} />
              )
            )}
            {showPendingIndicator && !lastMessage.content && null}
          </div>
        )}
      </main>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onStop={stop}
        disabled={loading}
        streaming={streaming}
      />
    </div>
  );
}

export default App;
