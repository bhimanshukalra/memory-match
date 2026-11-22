import { useSyncExternalStore } from "react";
import { Appearance } from "react-native";

export type Theme = {
  bg: string;
  tray: string;
  chip: string;
  accent: string;
  onAccent: string;
  text: string;
  label: string;
  cardBack: string;
  cardBackTrim: string;
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
  bg: "#1e1b4b",
  tray: "#272462",
  chip: "#312e81",
  accent: "#fbbf24",
  onAccent: "#312e81",
  text: "#ffffff",
  label: "#a5b4fc",
  cardBack: "#312e81",
  cardBackTrim: "#fbbf24",
  cardFront: "#ffffff",
  cardFrontBorder: "#c7d2fe",
  matchBorder: "#22c55e",
  matchBg: "#f0fdf4",
  button: "#fbbf24",
  buttonText: "#312e81",
  modalBg: "#312e81",
  modalTitle: "#fbbf24",
  modalText: "#e0e7ff",
  badgeBg: "#fbbf24",
  badgeText: "#312e81",
  backdrop: "rgba(0,0,0,0.5)",
};

const dark: Theme = {
  bg: "#13112e",
  tray: "#1c1a45",
  chip: "#262367",
  accent: "#fbbf24",
  onAccent: "#312e81",
  text: "#ffffff",
  label: "#a5b4fc",
  cardBack: "#3730a3",
  cardBackTrim: "#fbbf24",
  cardFront: "#ffffff",
  cardFrontBorder: "#c7d2fe",
  matchBorder: "#22c55e",
  matchBg: "#f0fdf4",
  button: "#fbbf24",
  buttonText: "#312e81",
  modalBg: "#262367",
  modalTitle: "#fbbf24",
  modalText: "#e0e7ff",
  badgeBg: "#fbbf24",
  badgeText: "#312e81",
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
