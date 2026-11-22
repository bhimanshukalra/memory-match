import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  isBetter,
  loadAllBest,
  loadBest,
  loadDifficultyKey,
  saveBest,
  saveDifficultyKey,
} from "../storage";

const getItem = AsyncStorage.getItem as jest.Mock;
const setItem = AsyncStorage.setItem as jest.Mock;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("isBetter", () => {
  it("accepts anything when there is no current best", () => {
    expect(isBetter({ moves: 99, seconds: 999 }, null)).toBe(true);
    expect(isBetter({ moves: 99, seconds: 999 })).toBe(true);
  });

  it("prefers fewer moves, then less time", () => {
    expect(isBetter({ moves: 5, seconds: 90 }, { moves: 6, seconds: 1 })).toBe(true);
    expect(isBetter({ moves: 5, seconds: 8 }, { moves: 5, seconds: 9 })).toBe(true);
  });

  it("rejects equal or worse scores", () => {
    expect(isBetter({ moves: 5, seconds: 9 }, { moves: 5, seconds: 9 })).toBe(false);
    expect(isBetter({ moves: 7, seconds: 1 }, { moves: 6, seconds: 99 })).toBe(false);
  });
});

describe("best scores", () => {
  it("round-trips a score per difficulty", async () => {
    await saveBest("4x4", { moves: 12, seconds: 40 });
    await saveBest("3x4", { moves: 7, seconds: 15 });
    expect(await loadBest("4x4")).toEqual({ moves: 12, seconds: 40 });
    expect(await loadBest("3x4")).toEqual({ moves: 7, seconds: 15 });
    expect(await loadBest("6x6")).toBeNull();
  });

  it("only overwrites when beaten", async () => {
    await saveBest("4x4", { moves: 12, seconds: 40 });
    await saveBest("4x4", { moves: 14, seconds: 10 });
    expect(await loadBest("4x4")).toEqual({ moves: 12, seconds: 40 });
    await saveBest("4x4", { moves: 12, seconds: 39 });
    expect(await loadBest("4x4")).toEqual({ moves: 12, seconds: 39 });
  });

  it("treats corrupt JSON as empty", async () => {
    await AsyncStorage.setItem("memory-match:best", "{not json");
    expect(await loadAllBest()).toEqual({});
  });

  it("drops malformed entries but keeps valid ones", async () => {
    await AsyncStorage.setItem(
      "memory-match:best",
      JSON.stringify({
        "4x4": { moves: 10, seconds: 30 },
        "3x4": { moves: "x", seconds: 1 },
        "6x6": null,
      }),
    );
    expect(await loadAllBest()).toEqual({ "4x4": { moves: 10, seconds: 30 } });
  });

  it("never throws when storage fails", async () => {
    // One-shot rejections (the mock's own implementation is left intact).
    getItem.mockRejectedValueOnce(new Error("boom"));
    setItem.mockRejectedValueOnce(new Error("boom"));
    await expect(saveBest("4x4", { moves: 1, seconds: 1 })).resolves.toBeUndefined();
    getItem.mockRejectedValueOnce(new Error("boom"));
    await expect(loadBest("4x4")).resolves.toBeNull();
    getItem.mockRejectedValueOnce(new Error("boom"));
    await expect(loadDifficultyKey()).resolves.toBeNull();
    setItem.mockRejectedValueOnce(new Error("boom"));
    await expect(saveDifficultyKey("4x4")).resolves.toBeUndefined();
  });
});

describe("difficulty key", () => {
  it("round-trips", async () => {
    expect(await loadDifficultyKey()).toBeNull();
    await saveDifficultyKey("6x6");
    expect(await loadDifficultyKey()).toBe("6x6");
  });
});
