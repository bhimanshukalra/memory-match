import { useSyncExternalStore } from "react";
import { Appearance } from "react-native";

export type Theme = {
  bg: string;
  text: string;
  label: string;
  cardBack: string;
  cardBackRing: string;
  cardBackMark: string;
  cardFront: string;
  cardFrontBorder: string;
  matchBorder: string;
  matchBg: string;
  button: string;
  buttonText: string;
  modalBg: string;
  modalTitle: string;
  modalText: string;
  badgeBg: string;
  badgeText: string;
  backdrop: string;
};

const light: Theme = {
  bg: "#eef2ff",
  text: "#312e81",
  label: "#6366f1",
  cardBack: "#4f46e5",
  cardBackRing: "rgba(255,255,255,0.35)",
  cardBackMark: "#e0e7ff",
  cardFront: "#ffffff",
  cardFrontBorder: "#c7d2fe",
  matchBorder: "#22c55e",
  matchBg: "#f0fdf4",
  button: "#4f46e5",
  buttonText: "#ffffff",
  modalBg: "#ffffff",
  modalTitle: "#312e81",
  modalText: "#4338ca",
  badgeBg: "#fef3c7",
  badgeText: "#b45309",
  backdrop: "rgba(0,0,0,0.5)",
};

const dark: Theme = {
  bg: "#0f172a",
  text: "#e0e7ff",
  label: "#a5b4fc",
  cardBack: "#6366f1",
  cardBackRing: "rgba(255,255,255,0.3)",
  cardBackMark: "#e0e7ff",
  cardFront: "#1e293b",
  cardFrontBorder: "#475569",
  matchBorder: "#22c55e",
  matchBg: "#14532d",
  button: "#6366f1",
  buttonText: "#ffffff",
  modalBg: "#1e293b",
  modalTitle: "#e0e7ff",
  modalText: "#c7d2fe",
  badgeBg: "#78350f",
  badgeText: "#fde68a",
  backdrop: "rgba(0,0,0,0.65)",
};

const subscribe = (onChange: () => void) => {
  const sub = Appearance.addChangeListener(onChange);
  return () => sub.remove();
};

// useSyncExternalStore with an explicit server snapshot: the web build is
// server-rendered (no color scheme there), and this lets React hydrate with
// "light" and then switch to the real scheme without a hydration mismatch.
export function useTheme(): Theme {
  const scheme = useSyncExternalStore(
    subscribe,
    () => Appearance.getColorScheme(),
    () => "light" as const,
  );
  return scheme === "dark" ? dark : light;
}
