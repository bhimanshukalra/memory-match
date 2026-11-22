import type { Card } from "./types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const SYMBOLS = ["🍎", "🐶", "🚀", "🎲", "🌵", "🎧", "🦊", "⚡"];

export const makeDeck = (pairs = 8): Card[] =>
  shuffle(SYMBOLS.slice(0, pairs).flatMap((s) => [s, s])).map(
    (symbol, id) => ({ id, symbol }),
  );
