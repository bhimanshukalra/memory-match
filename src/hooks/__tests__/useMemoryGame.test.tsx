import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { AccessibilityInfo } from "react-native";

import { DIFFICULTIES } from "@/lib/difficulty";

import { MISMATCH_DELAY_MS, useMemoryGame } from "../useMemoryGame";

type Hook = Awaited<ReturnType<typeof setup>>;

const notification = Haptics.notificationAsync as jest.Mock;
const selection = Haptics.selectionAsync as jest.Mock;

async function setup() {
  const hook = await renderHook(() => useMemoryGame());
  await act(async () => {}); // let the mount-time storage load settle
  return hook;
}

const flip = (hook: Hook, index: number) =>
  act(() => hook.result.current.flip(index));

/** Index pairs [a, b] that match, one per symbol. */
function matchingPairs(hook: Hook) {
  const bySymbol = new Map<string, number[]>();
  hook.result.current.state.cards.forEach((c, i) =>
    bySymbol.set(c.symbol, [...(bySymbol.get(c.symbol) ?? []), i]),
  );
  return [...bySymbol.values()];
}

/** Two indices whose symbols differ. */
function wrongPair(hook: Hook): [number, number] {
  const { cards } = hook.result.current.state;
  const j = cards.findIndex((c) => c.symbol !== cards[0].symbol);
  return [0, j];
}

async function solve(hook: Hook, { skipLast = false } = {}) {
  const pairs = matchingPairs(hook);
  for (const [n, [a, b]] of pairs.entries()) {
    if (skipLast && n === pairs.length - 1) break;
    await flip(hook, a);
    await flip(hook, b);
  }
}

beforeEach(async () => {
  jest.useFakeTimers();
  await AsyncStorage.clear();
  notification.mockClear();
  selection.mockClear();
  jest.spyOn(AccessibilityInfo, "announceForAccessibility").mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("useMemoryGame", () => {
  it("starts a Medium (4x4) game", async () => {
    const hook = await setup();
    expect(hook.result.current.state.cards).toHaveLength(16);
    expect(hook.result.current.difficulty.key).toBe("4x4");
    expect(hook.result.current.best).toBeNull();
    expect(hook.result.current.isNewBest).toBe(false);
  });

  it("flips a mismatched pair back after the delay", async () => {
    const hook = await setup();
    const [a, b] = wrongPair(hook);
    await flip(hook, a);
    await flip(hook, b);
    expect(hook.result.current.state.locked).toBe(true);
    expect(hook.result.current.state.moves).toBe(1);

    await act(() => {
      jest.advanceTimersByTime(MISMATCH_DELAY_MS - 1);
    });
    expect(hook.result.current.state.locked).toBe(true);

    await act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(hook.result.current.state.locked).toBe(false);
    expect(hook.result.current.state.flipped).toEqual([]);
  });

  it("runs the timer from the first flip and stops it on win", async () => {
    const hook = await setup();
    await act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(hook.result.current.state.seconds).toBe(0); // not started yet

    await flip(hook, 0);
    await act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(hook.result.current.state.seconds).toBe(3);

    await act(() => hook.result.current.restart());
    expect(hook.result.current.state.seconds).toBe(0);

    await solve(hook);
    expect(hook.result.current.state.won).toBe(true);
    const frozen = hook.result.current.state.seconds;
    await act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(hook.result.current.state.seconds).toBe(frozen);
  });

  it("records a new best, persists it, and keeps it after restart", async () => {
    const hook = await setup();
    await solve(hook);
    expect(hook.result.current.isNewBest).toBe(true);
    expect(hook.result.current.best).toEqual({
      moves: hook.result.current.state.moves,
      seconds: hook.result.current.state.seconds,
    });
    await act(async () => {}); // flush the background save
    expect(JSON.parse((await AsyncStorage.getItem("memory-match:best"))!)).toEqual({
      "4x4": { moves: 8, seconds: 0 },
    });

    await act(() => hook.result.current.restart());
    expect(hook.result.current.isNewBest).toBe(false);
    expect(hook.result.current.best).toEqual({ moves: 8, seconds: 0 });
  });

  it("does not call a worse score a new best", async () => {
    await AsyncStorage.setItem(
      "memory-match:best",
      JSON.stringify({ "4x4": { moves: 8, seconds: 0 } }),
    );
    const hook = await setup();
    expect(hook.result.current.best).toEqual({ moves: 8, seconds: 0 });
    const [a, b] = wrongPair(hook);
    await flip(hook, a);
    await flip(hook, b);
    await act(() => {
      jest.advanceTimersByTime(MISMATCH_DELAY_MS);
    });
    await solve(hook);
    expect(hook.result.current.state.won).toBe(true);
    expect(hook.result.current.isNewBest).toBe(false);
    expect(hook.result.current.best).toEqual({ moves: 8, seconds: 0 });
  });

  it("switches difficulty, rebuilds the deck and remembers the choice", async () => {
    const hook = await setup();
    const easy = DIFFICULTIES.find((d) => d.key === "3x4")!;
    await act(() => hook.result.current.setDifficulty(easy));
    expect(hook.result.current.difficulty.key).toBe("3x4");
    expect(hook.result.current.state.cards).toHaveLength(12);
    expect(await AsyncStorage.getItem("memory-match:difficulty")).toBe("3x4");

    await hook.unmount();
    const again = await setup();
    expect(again.result.current.difficulty.key).toBe("3x4");
    expect(again.result.current.state.cards).toHaveLength(12);
  });

  it("keeps best scores separate per difficulty", async () => {
    await AsyncStorage.setItem(
      "memory-match:best",
      JSON.stringify({ "3x4": { moves: 6, seconds: 5 } }),
    );
    const hook = await setup();
    expect(hook.result.current.best).toBeNull(); // Medium has none
    await act(() =>
      hook.result.current.setDifficulty(DIFFICULTIES.find((d) => d.key === "3x4")!),
    );
    expect(hook.result.current.best).toEqual({ moves: 6, seconds: 5 });
  });

  describe("feedback", () => {
    it("taps once on a first flip", async () => {
      const hook = await setup();
      await flip(hook, 0);
      expect(selection).toHaveBeenCalledTimes(1);
      expect(notification).not.toHaveBeenCalled();
    });

    it("warns once on a mismatch, with no extra tap", async () => {
      const hook = await setup();
      const [a, b] = wrongPair(hook);
      await flip(hook, a);
      selection.mockClear();
      await flip(hook, b);
      expect(notification).toHaveBeenCalledTimes(1);
      expect(notification).toHaveBeenCalledWith("warning");
      expect(selection).not.toHaveBeenCalled();
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith("No match");
    });

    it("succeeds once on a match", async () => {
      const hook = await setup();
      const [a, b] = matchingPairs(hook)[0];
      await flip(hook, a);
      notification.mockClear();
      await flip(hook, b);
      expect(notification).toHaveBeenCalledTimes(1);
      expect(notification).toHaveBeenCalledWith("success");
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith("Match");
    });

    it("fires a single success haptic for the winning match", async () => {
      const hook = await setup();
      await solve(hook, { skipLast: true });
      const [a, b] = matchingPairs(hook).at(-1)!;
      await flip(hook, a);
      notification.mockClear();
      (AccessibilityInfo.announceForAccessibility as jest.Mock).mockClear();
      await flip(hook, b);
      expect(hook.result.current.state.won).toBe(true);
      expect(notification).toHaveBeenCalledTimes(1);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringMatching(/^You won in \d+ moves$/),
      );
    });
  });
});
