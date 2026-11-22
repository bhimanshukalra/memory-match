import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BestScore, BestScores } from "./types";

const KEY = "memory-match:best";

/** Fewer moves wins; equal moves are broken by less time. */
export function isBetter(score: BestScore, current?: BestScore | null) {
  return (
    !current ||
    score.moves < current.moves ||
    (score.moves === current.moves && score.seconds < current.seconds)
  );
}

async function readAll(): Promise<BestScores> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function loadBest(diff: string): Promise<BestScore | null> {
  return (await readAll())[diff] ?? null;
}

/** Persists the score if it beats the stored best. Never throws. */
export async function saveBest(diff: string, score: BestScore): Promise<void> {
  try {
    const all = await readAll();
    if (!isBetter(score, all[diff])) return;
    all[diff] = score;
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable: the game stays playable, the score just isn't kept.
  }
}
