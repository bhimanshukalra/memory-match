import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { announce } from "@/lib/announce";
import {
  DEFAULT_DIFFICULTY,
  findDifficulty,
  type Difficulty,
} from "@/lib/difficulty";
import { gameReducer, initialState } from "@/lib/gameReducer";
import { successHaptic, tapHaptic, warningHaptic } from "@/lib/haptics";
import { makeDeck } from "@/lib/shuffle";
import {
  isBetter,
  loadAllBest,
  loadDifficultyKey,
  saveBest,
  saveDifficultyKey,
} from "@/lib/storage";
import type { BestScores } from "@/lib/types";

export const MISMATCH_DELAY_MS = 800;

export function useMemoryGame() {
  const [difficulty, setDifficultyState] = useState<Difficulty>(
    DEFAULT_DIFFICULTY,
  );
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    initialState(makeDeck(DEFAULT_DIFFICULTY.pairs)),
  );
  // Best scores as of the start of the current game, for every difficulty.
  const [bests, setBests] = useState<BestScores>({});

  const best = bests[difficulty.key] ?? null;
  const score = { moves: state.moves, seconds: state.seconds };
  // Derived: works even if storage fails, since `bests` is also held in memory.
  const isNewBest = state.won && isBetter(score, best);
  const displayBest = isNewBest ? score : best;

  // Load persisted best scores and the last-used difficulty once on mount.
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAllBest(), loadDifficultyKey()]).then(([all, key]) => {
      if (cancelled) return;
      setBests((prev) => ({ ...all, ...prev }));
      const saved = findDifficulty(key);
      if (saved.key !== DEFAULT_DIFFICULTY.key) {
        setDifficultyState(saved);
        dispatch({ type: "RESTART", cards: makeDeck(saved.pairs) });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // On a new best, persist it in the background (never throws).
  useEffect(() => {
    if (!isNewBest) return;
    saveBest(difficulty.key, { moves: state.moves, seconds: state.seconds });
  }, [isNewBest, difficulty.key, state.moves, state.seconds]);

  // Feedback (haptics + screen-reader announcements), driven by what changed
  // since the previous state so every event fires exactly once: a final match
  // is a win, not also a match; a mismatch is a warning, not also a tap.
  const prev = useRef(state);
  useEffect(() => {
    const before = prev.current;
    prev.current = state;
    if (state.won && !before.won) {
      successHaptic();
      announce(
        `You won in ${state.moves} ${state.moves === 1 ? "move" : "moves"}`,
      );
    } else if (state.matched.size > before.matched.size) {
      successHaptic();
      announce("Match");
    } else if (state.locked && !before.locked) {
      warningHaptic();
      announce("No match");
    } else if (state.flipped.length > before.flipped.length) {
      tapHaptic();
    }
  }, [state]);

  // Mismatch: keep both cards visible briefly, then flip back. Input is locked
  // meanwhile. Cleanup also cancels the pending timeout on restart/unmount.
  useEffect(() => {
    if (!state.locked) return;
    const t = setTimeout(() => dispatch({ type: "RESOLVE" }), MISMATCH_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.locked]);

  // Timer: runs from the first flip until the game is won.
  useEffect(() => {
    if (!state.started || state.won) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.started, state.won]);

  const flip = useCallback(
    (index: number) => dispatch({ type: "FLIP", index }),
    [],
  );

  // Fold a just-achieved best into memory before the next game starts.
  const foldBest = useCallback(() => {
    if (isNewBest) {
      setBests((prevBests) => ({
        ...prevBests,
        [difficulty.key]: { moves: state.moves, seconds: state.seconds },
      }));
    }
  }, [isNewBest, difficulty.key, state.moves, state.seconds]);

  const restart = useCallback(() => {
    foldBest();
    dispatch({ type: "RESTART", cards: makeDeck(difficulty.pairs) });
  }, [foldBest, difficulty.pairs]);

  const setDifficulty = useCallback(
    (next: Difficulty) => {
      if (next.key === difficulty.key) return;
      foldBest();
      setDifficultyState(next);
      saveDifficultyKey(next.key);
      dispatch({ type: "RESTART", cards: makeDeck(next.pairs) });
    },
    [foldBest, difficulty.key],
  );

  return {
    state,
    best: displayBest,
    isNewBest,
    difficulty,
    setDifficulty,
    flip,
    restart,
  };
}
