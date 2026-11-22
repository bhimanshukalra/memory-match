import { useCallback, useEffect, useReducer, useState } from "react";

import { gameReducer, initialState } from "@/lib/gameReducer";
import { successHaptic, tapHaptic, warningHaptic } from "@/lib/haptics";
import { makeDeck } from "@/lib/shuffle";
import { isBetter, loadBest, saveBest } from "@/lib/storage";
import type { BestScore } from "@/lib/types";

const MISMATCH_DELAY_MS = 800;
const DIFFICULTY = "4x4";

export function useMemoryGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    initialState(makeDeck()),
  );
  // Best score as of the start of the current game.
  const [best, setBest] = useState<BestScore | null>(null);

  const score = { moves: state.moves, seconds: state.seconds };
  // Derived: works even if storage fails, since `best` is also held in memory.
  const isNewBest = state.won && isBetter(score, best);
  const displayBest = isNewBest ? score : best;

  // Load the stored best once on mount.
  useEffect(() => {
    let cancelled = false;
    loadBest(DIFFICULTY).then((b) => {
      if (!cancelled) setBest(b);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // On a new best, persist it in the background (never throws).
  useEffect(() => {
    if (!isNewBest) return;
    saveBest(DIFFICULTY, { moves: state.moves, seconds: state.seconds });
  }, [isNewBest, state.moves, state.seconds]);

  // Haptics: tap on flip, success on match/win, warning on mismatch.
  useEffect(() => {
    if (state.flipped.length > 0) tapHaptic();
  }, [state.flipped]);
  useEffect(() => {
    if (state.matched.size > 0) successHaptic();
  }, [state.matched]);
  useEffect(() => {
    if (state.locked) warningHaptic();
  }, [state.locked]);
  useEffect(() => {
    if (state.won) successHaptic();
  }, [state.won]);

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
  const restart = useCallback(() => {
    // Fold a just-achieved best into memory before the next game starts.
    if (isNewBest) setBest({ moves: state.moves, seconds: state.seconds });
    dispatch({ type: "RESTART", cards: makeDeck() });
  }, [isNewBest, state.moves, state.seconds]);

  return { state, best: displayBest, isNewBest, flip, restart };
}
