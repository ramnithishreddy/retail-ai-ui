import { Menu, ShoppingCart } from "lucide-react";
import { ModeToggle } from "./ModeToggle";

export function Header({ onToggleSidebar }) {
  return (
    <header className="header">
      <div className="brand">
        <button
          className="icon-button sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="brand-icon" aria-hidden>
          <ShoppingCart size={20} />
        </div>
        <div>
          <h1>Retail AI Helper</h1>
          <p>Your intelligent retail assistant</p>
        </div>
      </div>

      <div className="header-actions">
        <ModeToggle />
        <div className="status" role="status">
          <span className="status-dot" />
          Online
        </div>
      </div>
    </header>
  );
}
