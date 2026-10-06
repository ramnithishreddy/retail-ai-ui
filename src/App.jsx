import { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status}`
        );
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          route: data.route,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong while processing your request.",
          route: "error",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const useSuggestion = (text) => {
    setInput(text);
  };

  return (
    <div className="app">

      {/* Header */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            🛒
          </div>

          <div>
            <h1>Retail AI Helper</h1>

            <p>
              Your intelligent retail assistant
            </p>
          </div>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          Online

        </div>

      </header>


      {/* Chat */}

      <main className="chat-container">

        {messages.length === 0 ? (

          <div className="welcome">

            <div className="welcome-icon">
              ✦
            </div>

            <h2>
              How can I help?
            </h2>

            <p>
              Ask about store information, products,
              policies, or approved DMart web information.
            </p>

            <div className="suggestions">

              <button
                onClick={() =>
                  useSuggestion(
                    "Where can I find basmati rice?"
                  )
                }
              >
                📍 Where can I find basmati rice?
              </button>

              <button
                onClick={() =>
                  useSuggestion(
                    "What is the return policy?"
                  )
                }
              >
                📄 What is the return policy?
              </button>

              <button
                onClick={() =>
                  useSuggestion(
                    "What is DMart?"
                  )
                }
              >
                🌐 What is DMart?
              </button>

            </div>

          </div>

        ) : (

          <div className="messages">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`message-row ${message.role}`}
              >

                {message.role === "assistant" && (
                  <div className="avatar">
                    AI
                  </div>
                )}

                <div className="message-wrapper">

                  <div className="message-label">
                    {message.role === "user"
                      ? "You"
                      : "Retail AI Helper"}
                  </div>

                  <div className="message-content">
                    {message.content}
                  </div>


                  {message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 && (

                      <div className="sources">

                        <div className="sources-title">
                          {message.route === "web"
                            ? "Web Sources"
                            : message.route === "private"
                              ? "Private Sources"
                              : "Sources"}
                        </div>

                        {message.sources.map(
                          (source, sourceIndex) => (

                            <div
                              className="source"
                              key={sourceIndex}
                            >

                              {source.type === "web" ? (

                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  🔗 {source.title}
                                </a>

                              ) : (

                                <span>
                                  📄 {source.source}
                                </span>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    )}

                </div>

              </div>

            ))}


            {loading && (

              <div className="message-row assistant">

                <div className="avatar">
                  AI
                </div>

                <div className="message-wrapper">

                  <div className="message-label">
                    Retail AI Helper
                  </div>

                  <div className="message-content">

                    <div className="typing">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}

      </main>


      {/* Input */}

      <div className="input-area">

        <div className="input-wrapper">

          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={loading}
          />

          <button
            className="send-button"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            ↑
          </button>

        </div>

        <div className="input-hint">
          Enter to send • Shift + Enter for a new line
        </div>

      </div>

    </div>
  );
}

export default App;