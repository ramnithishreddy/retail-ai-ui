import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { cn } from "../lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mode-toggle" role="radiogroup" aria-label="Theme">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          className={cn("mode-option", theme === value && "active")}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
          title={label}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
