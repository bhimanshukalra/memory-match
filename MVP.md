# Memory Match: One-Day Build Guide (React Native + Expo)

## Overview

A card-matching game. A grid of face-down cards hides pairs of matching symbols. The player flips two cards per turn. Matches stay face up, and mismatches flip back. The goal is to match every pair in as few moves and as little time as possible. Best scores persist on-device.

Scope: single player, offline, no backend, one playable screen plus a win overlay. Target: iOS and Android via Expo Go, no native code.

## Tech stack

- **Expo (managed workflow)** with `npx create-expo-app memory-match -t expo-template-blank-typescript`
- **TypeScript** for card and state types
- **react-native-reanimated** for the 3D flip (`npx expo install react-native-reanimated`)
- **@react-native-async-storage/async-storage** for best scores (`npx expo install ...`)
- **expo-haptics** (optional) for tap, match and win feedback
- State via `useReducer` in a single `useMemoryGame` hook. No external state library.

## Game rules

1. The board starts shuffled with all cards face down (default 4x4 = 8 pairs).
2. Tap a face-down card to flip it. Tap a second card to flip it.
3. If both symbols match, both stay face up and are marked matched.
4. If they differ, they stay visible for about 800 ms, then flip back. Input is locked meanwhile.
5. Each pair of flips counts as one move.
6. The timer starts on the first flip. The game ends when all pairs are matched.
7. Best score = fewest moves, with time as a tiebreaker. Stored per difficulty.

## Screens and components

- `App.tsx`: renders `GameScreen`.
- `GameScreen`: header (moves, timer, best), board, restart button, win modal.
- `Board`: computes card size from screen width and renders a grid (`FlatList` with `numColumns`, or flex-wrap).
- `CardView`: one card with front and back faces and the flip animation. Wrapped in `Pressable`.
- `StatsBar`: moves, elapsed time, best score.
- `WinModal`: final moves and time, "New best!" badge, "Play again".
- `hooks/useMemoryGame.ts`: reducer, timer and persistence.
- `lib/shuffle.ts`, `lib/storage.ts`: pure helpers.

## State model

```ts
export type Card = {
  id: number;          // unique per card
  symbol: string;      // emoji, shared by exactly two cards
};

export type GameState = {
  cards: Card[];
  flipped: number[];       // indices currently face up and unresolved (0..2)
  matched: Set<string>;    // symbols already matched
  moves: number;
  seconds: number;         // elapsed
  started: boolean;        // timer running after first flip
  locked: boolean;         // true during mismatch delay
  won: boolean;
};

export type BestScore = { moves: number; seconds: number };
export type BestScores = Record<string, BestScore>; // key: difficulty, e.g. "4x4"

type Action =
  | { type: "FLIP"; index: number }
  | { type: "RESOLVE" }      // after mismatch delay
  | { type: "TICK" }
  | { type: "RESTART"; cards: Card[] };
```

A card is face up if its index is in `flipped` or its symbol is in `matched`.

## Core logic

**Build and shuffle (Fisher-Yates):**

```ts
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SYMBOLS = ["🍎","🐶","🚀","🎲","🌵","🎧","🦊","⚡"];
export const makeDeck = (pairs = 8): Card[] =>
  shuffle(SYMBOLS.slice(0, pairs).flatMap((s) => [s, s]))
    .map((symbol, id) => ({ id, symbol }));
```

**Flip handling (reducer) with input lock:**

```ts
case "FLIP": {
  const { index } = action;
  const card = state.cards[index];
  if (state.locked || state.won) return state;
  if (state.flipped.includes(index) || state.matched.has(card.symbol)) return state;

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
```

**Mismatch delay (in the hook):**

```ts
useEffect(() => {
  if (!state.locked) return;
  const t = setTimeout(() => dispatch({ type: "RESOLVE" }), 800);
  return () => clearTimeout(t);
}, [state.locked]);
```

**Timer:** `setInterval` dispatching `TICK` every second while `started && !won`. Clear it on unmount and on win.

**Win check and best score:** when `won` becomes true, load the stored best for the difficulty key. Save the new score if `moves < best.moves` or (`moves === best.moves` and `seconds < best.seconds`). Wrap AsyncStorage calls in try/catch.

```ts
const KEY = "memory-match:best";
export async function saveBest(diff: string, s: BestScore) {
  const all = JSON.parse((await AsyncStorage.getItem(KEY)) ?? "{}");
  const cur = all[diff];
  if (!cur || s.moves < cur.moves || (s.moves === cur.moves && s.seconds < cur.seconds)) {
    all[diff] = s;
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  }
}
```

## Animations and polish

- **Flip:** one shared value per card, `rotation` from 0 to 180, driven by `withTiming(faceUp ? 180 : 0, { duration: 300 })`. Render two absolutely positioned faces with `backfaceVisibility: "hidden"`. The back face uses `rotateY(rotation deg)` and the front face uses `rotateY(rotation + 180 deg)`. Add `perspective: 800` to the transform array.
- **Match effect:** on match, run a short scale pulse (`withSequence(withSpring(1.1), withSpring(1))`) and tint the border green.
- **Mismatch:** a quick horizontal shake (`withSequence` of small `translateX` values) before the flip back.
- **Haptics (optional):** `Haptics.selectionAsync()` on flip, `notificationAsync(Success)` on match and win, `Warning` on mismatch.
- **Win:** fade in the modal, show confetti emoji or a simple scale-in. Keep it light.
- Use `useAnimatedStyle` and avoid re-creating shared values per render. Memoize `CardView` with `React.memo`.

## One-day timeline

**Morning (3 to 4 h): playable core**
- Scaffold the Expo TS project and install dependencies.
- Write types, `shuffle`, `makeDeck` and the reducer. Unit-test them with Jest if time allows.
- Render a static grid with tap-to-reveal using plain conditional rendering (no animation yet).

**Afternoon (3 to 4 h): game loop and animation**
- Add the mismatch delay with input lock, move counter, timer and win detection.
- Add the Reanimated flip, match pulse and mismatch shake.
- Build `StatsBar`, `WinModal` and restart.

**Evening (2 h): persistence and polish**
- Save and load best scores with AsyncStorage, and show the "New best!" badge.
- Add haptics, app icon, splash screen and colors.
- Run the testing checklist on a real device. Fix layout on small screens.

## Stretch ideas

- **Difficulty levels:** 3x4, 4x4, 4x5, 6x6, with separate best scores per level.
- **Themes:** emoji sets (animals, food, space) or custom card-back designs, chosen in a settings screen.
- **Sound:** flip, match and win effects with `expo-audio`, with a mute toggle.
- **Timer mode:** countdown challenge, where you lose if time runs out. Optionally add a combo bonus for consecutive matches.
- **Two-player hot-seat** with a score per player.
- Share a result card via `Share.share`.

## Testing checklist

- [ ] Every symbol appears exactly twice, and the deck is shuffled differently on each restart.
- [ ] Tapping the same card twice does not count as a match or a move.
- [ ] Tapping a third card during the mismatch delay does nothing.
- [ ] Tapping an already matched card does nothing.
- [ ] Moves increment once per pair of flips, not per tap.
- [ ] The timer starts on the first flip, stops on win and resets on restart.
- [ ] Mismatched cards flip back after the delay, and matched cards stay face up.
- [ ] The win modal appears after the last pair, with correct moves and time.
- [ ] Best score saves, survives an app restart, and only updates when beaten.
- [ ] The app works if AsyncStorage fails (no crash, game still playable).
- [ ] Restarting mid-game clears the lock, pending timeouts and flipped cards.
- [ ] The grid fits small phones and tablets, in portrait and landscape.
- [ ] Animations stay smooth on a mid-range Android device. Haptics are skipped gracefully where unsupported.
