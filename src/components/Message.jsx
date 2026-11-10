import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "../lib/utils";

const ROUTE_LABELS = {
  web: "Web Sources",
  private: "Private Sources",
  business: "Business Data",
  error: "Sources",
};

export function Message({ message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("message-row", message.role)}>
      {isAssistant && <div className="avatar">AI</div>}
      <div className="message-wrapper">
        <div className="message-label">
          {isAssistant ? "Retail AI Helper" : "You"}
        </div>
        <div className="message-content">
          {isAssistant ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {message.content || ""}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>

        {isAssistant && message.sources?.length > 0 && (
          <Sources sources={message.sources} route={message.route} />
        )}
      </div>
    </div>
  );
}

function Sources({ sources, route }) {
  return (
    <div className="sources">
      <div className="sources-title">
        {ROUTE_LABELS[route] || ROUTE_LABELS.error}
      </div>
      <ul>
        {sources.map((source, idx) => (
          <li key={idx} className="source">
            {source.type === "web" ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={14} />
                {source.title || source.url}
              </a>
            ) : (
              <span>
                <FileText size={14} />
                {source.source}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="message-row assistant">
      <div className="avatar">AI</div>
      <div className="message-wrapper">
        <div className="message-label">Retail AI Helper</div>
        <div className="message-content">
          <div className="typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
