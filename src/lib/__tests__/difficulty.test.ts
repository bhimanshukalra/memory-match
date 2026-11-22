import { DEFAULT_DIFFICULTY, DIFFICULTIES, findDifficulty } from "../difficulty";
import { SYMBOLS, symbolName } from "../symbols";

describe("difficulty", () => {
  it("has unique keys and even card counts that fit the symbol set", () => {
    expect(new Set(DIFFICULTIES.map((d) => d.key)).size).toBe(DIFFICULTIES.length);
    for (const d of DIFFICULTIES) {
      expect((d.cols * d.rows) % 2).toBe(0);
      expect(d.pairs).toBe((d.cols * d.rows) / 2);
      expect(d.pairs).toBeLessThanOrEqual(SYMBOLS.length);
    }
  });

  it("falls back to the default for unknown or missing keys", () => {
    expect(findDifficulty("nope")).toBe(DEFAULT_DIFFICULTY);
    expect(findDifficulty(null)).toBe(DEFAULT_DIFFICULTY);
    expect(findDifficulty("6x6").key).toBe("6x6");
  });
});

describe("symbols", () => {
  it("gives every symbol a spoken name", () => {
    for (const s of SYMBOLS) expect(symbolName(s)).not.toBe(s);
    expect(symbolName("?")).toBe("?");
  });
});
