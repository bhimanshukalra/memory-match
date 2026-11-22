import { DIFFICULTIES } from "../difficulty";
import { makeDeck, shuffle } from "../shuffle";
import { SYMBOLS } from "../symbols";

describe("shuffle", () => {
  it("returns a permutation without mutating the input", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    const out = shuffle(input);
    expect(input).toEqual(copy);
    expect([...out].sort()).toEqual(copy);
  });

  it("reorders with a stubbed random source", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0);
    expect(shuffle([1, 2, 3])).toEqual([2, 3, 1]);
    spy.mockRestore();
  });
});

describe("makeDeck", () => {
  it("defaults to 8 pairs", () => {
    expect(makeDeck()).toHaveLength(16);
  });

  it.each(DIFFICULTIES)("builds a valid deck for $label ($key)", (d) => {
    const deck = makeDeck(d.pairs);
    expect(deck).toHaveLength(d.cols * d.rows);
    expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
    const counts = new Map<string, number>();
    deck.forEach((c) => counts.set(c.symbol, (counts.get(c.symbol) ?? 0) + 1));
    expect(counts.size).toBe(d.pairs);
    expect([...counts.values()].every((n) => n === 2)).toBe(true);
  });

  it("produces different orders across calls", () => {
    const orders = new Set(
      Array.from({ length: 50 }, () =>
        makeDeck(8)
          .map((c) => c.symbol)
          .join(""),
      ),
    );
    expect(orders.size).toBeGreaterThan(40);
  });

  it("rejects pair counts outside the symbol set", () => {
    expect(() => makeDeck(0)).toThrow(RangeError);
    expect(() => makeDeck(SYMBOLS.length + 1)).toThrow(RangeError);
  });
});
