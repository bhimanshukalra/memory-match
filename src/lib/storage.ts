import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BestScore, BestScores } from "./types";

const BEST_KEY = "memory-match:best";
const DIFFICULTY_KEY = "memory-match:difficulty";

/** Fewer moves wins; equal moves are broken by less time. */
export function isBetter(score: BestScore, current?: BestScore | null) {
  return (
    !current ||
    score.moves < current.moves ||
    (score.moves === current.moves && score.seconds < current.seconds)
  );
}

const isScore = (v: unknown): v is BestScore =>
  typeof v === "object" &&
  v !== null &&
  Number.isFinite((v as BestScore).moves) &&
  Number.isFinite((v as BestScore).seconds);

async function readAll(): Promise<BestScores> {
  try {
    const raw = await AsyncStorage.getItem(BEST_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object") return {};
    // Drop malformed entries instead of trusting whatever is on disk.
    return Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => isScore(v)),
    ) as BestScores;
  } catch {
    return {};
  }
}

export const loadAllBest = readAll;

export async function loadBest(diff: string): Promise<BestScore | null> {
  return (await readAll())[diff] ?? null;
}

/** Persists the score if it beats the stored best. Never throws. */
export async function saveBest(diff: string, score: BestScore): Promise<void> {
  try {
    const all = await readAll();
    if (!isBetter(score, all[diff])) return;
    all[diff] = score;
    await AsyncStorage.setItem(BEST_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable: the game stays playable, the score just isn't kept.
  }
}

export async function loadDifficultyKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DIFFICULTY_KEY);
  } catch {
    return null;
  }
}

export async function saveDifficultyKey(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DIFFICULTY_KEY, key);
  } catch {
    // ignore
  }
}
