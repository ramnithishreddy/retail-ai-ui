import { create } from "zustand";
import { STORAGE_KEYS } from "../constants";

export const useThemeStore = create((set) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    try { localStorage.setItem(STORAGE_KEYS.theme, theme); } catch { /* ignore */ }
    set({ theme });
  },
}));

function readTheme() {
  try { return localStorage.getItem(STORAGE_KEYS.theme) || "system"; } catch { return "system"; }
}
