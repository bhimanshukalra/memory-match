export type Card = {
  id: number; // unique per card
  symbol: string; // emoji, shared by exactly two cards
};

export type GameState = {
  cards: Card[];
  flipped: number[]; // indices currently face up and unresolved (0..2)
  matched: Set<string>; // symbols already matched
  moves: number;
  seconds: number; // elapsed
  started: boolean; // timer running after first flip
  locked: boolean; // true during mismatch delay
  won: boolean;
};

export type BestScore = { moves: number; seconds: number };
export type BestScores = Record<string, BestScore>; // key: difficulty, e.g. "4x4"

export type Action =
  | { type: "FLIP"; index: number }
  | { type: "RESOLVE" } // after mismatch delay
  | { type: "TICK" }
  | { type: "RESTART"; cards: Card[] };
