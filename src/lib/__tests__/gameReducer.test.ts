import { gameReducer, initialState } from "../gameReducer";
import type { Card, GameState } from "../types";

const cards: Card[] = ["a", "b", "a", "b"].map((symbol, id) => ({ id, symbol }));
const flip = (s: GameState, index: number) =>
  gameReducer(s, { type: "FLIP", index });

describe("gameReducer", () => {
  it("starts with everything face down", () => {
    const s = initialState(cards);
    expect(s).toMatchObject({
      flipped: [],
      moves: 0,
      seconds: 0,
      started: false,
      locked: false,
      won: false,
    });
    expect(s.matched.size).toBe(0);
  });

  it("starts the timer on the first flip without counting a move", () => {
    const s = flip(initialState(cards), 0);
    expect(s.started).toBe(true);
    expect(s.flipped).toEqual([0]);
    expect(s.moves).toBe(0);
  });

  it("ignores a second tap on the same card", () => {
    const s = flip(initialState(cards), 0);
    expect(flip(s, 0)).toBe(s);
  });

  it("counts a move and keeps a matching pair face up", () => {
    const s = flip(flip(initialState(cards), 0), 2);
    expect(s.moves).toBe(1);
    expect(s.flipped).toEqual([]);
    expect(s.matched.has("a")).toBe(true);
    expect(s.locked).toBe(false);
    expect(s.won).toBe(false);
  });

  it("locks input on a mismatch until RESOLVE", () => {
    const s = flip(flip(initialState(cards), 0), 1);
    expect(s.moves).toBe(1);
    expect(s.locked).toBe(true);
    expect(s.flipped).toEqual([0, 1]);
    expect(flip(s, 2)).toBe(s); // third tap during lock does nothing
    const resolved = gameReducer(s, { type: "RESOLVE" });
    expect(resolved.locked).toBe(false);
    expect(resolved.flipped).toEqual([]);
  });

  it("ignores taps on matched cards", () => {
    const s = flip(flip(initialState(cards), 0), 2);
    expect(flip(s, 0)).toBe(s);
    expect(flip(s, 2)).toBe(s);
  });

  it("ignores out-of-range indices", () => {
    const s = initialState(cards);
    expect(flip(s, 99)).toBe(s);
  });

  it("wins when the last pair is matched, and stops accepting input", () => {
    let s = initialState(cards);
    for (const i of [0, 2, 1, 3]) s = flip(s, i);
    expect(s.won).toBe(true);
    expect(s.moves).toBe(2);
    expect(flip(s, 0)).toBe(s);
  });

  it("ticks only while the game is running", () => {
    const idle = initialState(cards);
    expect(gameReducer(idle, { type: "TICK" })).toBe(idle);

    const running = flip(idle, 0);
    expect(gameReducer(running, { type: "TICK" }).seconds).toBe(1);

    let won = idle;
    for (const i of [0, 2, 1, 3]) won = flip(won, i);
    expect(gameReducer(won, { type: "TICK" })).toBe(won);
  });

  it("RESTART returns a fresh state for the new deck", () => {
    let s = flip(flip(initialState(cards), 0), 1);
    s = gameReducer(s, { type: "TICK" });
    const next: Card[] = [{ id: 0, symbol: "z" }, { id: 1, symbol: "z" }];
    const fresh = gameReducer(s, { type: "RESTART", cards: next });
    expect(fresh).toEqual(initialState(next));
  });
});
