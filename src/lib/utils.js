import clsx from "clsx";

export function cn(...args) {
  return clsx(args);
}

export function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
