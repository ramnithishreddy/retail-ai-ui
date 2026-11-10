import { Sparkles } from "lucide-react";
import { SUGGESTIONS } from "../lib/constants";

export function Welcome({ onSuggestionClick }) {
  return (
    <div className="welcome">
      <div className="welcome-icon">
        <Sparkles size={28} />
      </div>
      <h2>How can I help?</h2>
      <p>
        Ask about store information, products, policies, or approved DMart web
        information.
      </p>
      <div className="suggestions">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.text}
            onClick={() => onSuggestionClick(suggestion.text)}
          >
            {suggestion.icon} {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}
