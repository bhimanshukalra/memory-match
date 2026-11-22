import { useCallback, useEffect, useReducer } from "react";

import { gameReducer, initialState } from "@/lib/gameReducer";
import { makeDeck } from "@/lib/shuffle";

const MISMATCH_DELAY_MS = 800;

export function useMemoryGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    initialState(makeDeck()),
  );

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
  const restart = useCallback(
    () => dispatch({ type: "RESTART", cards: makeDeck() }),
    [],
  );

  return { state, flip, restart };
}
