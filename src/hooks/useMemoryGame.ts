import { useCallback, useReducer } from "react";

import { gameReducer, initialState } from "@/lib/gameReducer";
import { makeDeck } from "@/lib/shuffle";

export function useMemoryGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    initialState(makeDeck()),
  );

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
