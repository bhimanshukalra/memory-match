import type { Action, Card, GameState } from "./types";

export function initialState(cards: Card[]): GameState {
  return {
    cards,
    flipped: [],
    matched: new Set(),
    moves: 0,
    seconds: 0,
    started: false,
    locked: false,
    won: false,
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "FLIP": {
      const { index } = action;
      const card = state.cards[index];
      if (!card || state.locked || state.won) return state;
      if (state.flipped.includes(index) || state.matched.has(card.symbol)) {
        return state;
      }

      const flipped = [...state.flipped, index];
      if (flipped.length === 1) return { ...state, flipped, started: true };

      // second card: count the move and evaluate
      const [a, b] = flipped.map((i) => state.cards[i]);
      const moves = state.moves + 1;
      if (a.symbol === b.symbol) {
        const matched = new Set(state.matched).add(a.symbol);
        const won = matched.size === state.cards.length / 2;
        return { ...state, flipped: [], matched, moves, won };
      }
      return { ...state, flipped, moves, locked: true }; // wait for RESOLVE
    }
    case "RESOLVE":
      return { ...state, flipped: [], locked: false };
    case "TICK":
      if (!state.started || state.won) return state;
      return { ...state, seconds: state.seconds + 1 };
    case "RESTART":
      return initialState(action.cards);
  }
}
