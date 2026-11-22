# Memory Match: Phased Build Plan

Derived from [MVP.md](MVP.md). Each phase ends with a working, verifiable state. Check boxes as you go.

## Adjustments to the MVP for this repo

The repo is already scaffolded (Expo SDK 58, Expo Router, `react-native-reanimated` and `react-native-worklets` installed), so the MVP differs in these ways:

- **No `App.tsx`.** `GameScreen` is rendered from the route `src/app/index.tsx`. Non-route code lives outside `src/app/` (e.g. `src/components`, `src/hooks`, `src/lib`).
- **Skip scaffolding and the Reanimated install.** Only add `@react-native-async-storage/async-storage` and `expo-haptics`, via `npx expo install`.
- **Check Expo SDK 58 docs** (`https://docs.expo.dev/versions/v58.0.0/`) before using any Expo or RN API (haptics, splash, icon config).
- **Run `npx expo lint` and `npx tsc --noEmit` at the end of every phase.**
- Native modules (AsyncStorage, Haptics) may require a development build if Expo Go for SDK 58 does not bundle them.

## Target file layout

```
src/
  app/
    _layout.tsx          (exists)
    index.tsx            -> renders <GameScreen />
  components/
    GameScreen.tsx
    Board.tsx
    CardView.tsx
    StatsBar.tsx
    WinModal.tsx
  hooks/
    useMemoryGame.ts
  lib/
    types.ts
    shuffle.ts           (shuffle + makeDeck)
    gameReducer.ts
    storage.ts
```

---

## Phase 0: Baseline and setup

Goal: confirm the existing project runs and dependencies are in place.

- [x] Read `src/app/_layout.tsx` and `src/app/index.tsx`; note what boilerplate to replace.
- [ ] Run `npx expo start` and confirm the app boots on a simulator or device.
- [x] `npx expo install @react-native-async-storage/async-storage expo-haptics`
- [x] Create the folders `src/components`, `src/hooks`, `src/lib`.
- [ ] (Optional) Add Jest via `npx expo install jest-expo jest @types/jest` for reducer tests.

**Done when:** app boots, dependencies installed, lint and typecheck pass.

## Phase 1: Types and pure logic

Goal: all game rules exist as pure, testable code with no UI.

- [ ] `lib/types.ts`: `Card`, `GameState`, `BestScore`, `BestScores`, `Action`.
- [ ] `lib/shuffle.ts`: Fisher-Yates `shuffle<T>` and `makeDeck(pairs = 8)` using the 8 emoji symbols.
- [ ] `lib/gameReducer.ts`: `initialState(cards)` and the reducer with `FLIP`, `RESOLVE`, `TICK`, `RESTART`.
  - [ ] `FLIP` ignores taps when `locked` or `won`, on an already-flipped card, or on an already-matched card.
  - [ ] First flip sets `started: true`; second flip increments `moves` and evaluates match or mismatch.
  - [ ] Match adds the symbol to `matched` and sets `won` when all pairs are matched.
  - [ ] Mismatch sets `locked: true` and keeps both cards in `flipped`.
  - [ ] `RESOLVE` clears `flipped` and unlocks.
  - [ ] `TICK` increments `seconds` only while `started && !won`.
  - [ ] `RESTART` returns a fresh state from the new deck.
- [ ] Unit tests (if Jest added): deck has each symbol exactly twice, same-card double tap, third tap while locked, matched-card tap, move counting.

**Done when:** reducer behavior matches the MVP "Game rules" and the first five testing-checklist items hold in tests or by manual dispatch.

## Phase 2: Static playable grid (no animation)

Goal: tap-to-reveal board on screen using plain conditional rendering.

- [ ] `hooks/useMemoryGame.ts`: `useReducer` with the reducer and a lazily built initial deck; expose `state`, `flip(index)`, `restart()`.
- [ ] `components/CardView.tsx`: `Pressable` showing the symbol if face up, else a card back. Face-up rule: index in `flipped` or symbol in `matched`. Wrap in `React.memo`.
- [ ] `components/Board.tsx`: compute card size from `useWindowDimensions` (columns, gap, padding) and render the grid with `FlatList numColumns={4}` or flex-wrap. Keep cards square.
- [ ] `components/GameScreen.tsx`: renders `Board`, wrapped in `SafeAreaView`.
- [ ] `src/app/index.tsx`: render `GameScreen`; set `_layout.tsx` to hide the header.

**Done when:** you can tap cards and see symbols reveal on a shuffled 4x4 grid.

## Phase 3: Game loop (lock, moves, timer, win, restart)

Goal: the full ruleset works end to end, still without animation.

- [ ] Mismatch delay effect in the hook: when `locked`, `setTimeout(RESOLVE, 800)` with cleanup.
- [ ] Timer effect: `setInterval(TICK, 1000)` while `started && !won`; clear on unmount and on win.
- [ ] `components/StatsBar.tsx`: moves, elapsed time (`m:ss`), best score (placeholder `--` for now).
- [ ] Restart button in `GameScreen` that dispatches `RESTART` with a new `makeDeck()`. Make sure pending timeouts and the lock are cleared (effects keyed on state handle this).
- [ ] `components/WinModal.tsx`: React Native `Modal` (or an overlay) showing final moves and time, and a "Play again" button.

**Done when:** a full game is playable start to finish; checklist items on moves, timer, mismatch flip-back, win modal and mid-game restart pass.

## Phase 4: Animations

Goal: polished card feedback using Reanimated 4.

- [ ] Check Reanimated 4 docs for the current API (`useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSequence`, `withSpring`).
- [ ] **Flip:** in `CardView`, one `rotation` shared value (0 to 180) driven by `withTiming(faceUp ? 180 : 0, { duration: 300 })`. Two absolutely positioned faces with `backfaceVisibility: "hidden"`; back uses `rotateY(rotation)`, front uses `rotateY(rotation + 180)`; `perspective: 800`.
- [ ] **Match pulse:** `withSequence(withSpring(1.1), withSpring(1))` on scale and a green border when matched.
- [ ] **Mismatch shake:** short `translateX` sequence on both cards just before they flip back.
- [ ] **Win modal:** fade or scale-in entrance; optional confetti emoji.
- [ ] Keep shared values stable (no re-creation per render) and keep `CardView` memoized with stable props (pass `index` and a stable `onPress`).

**Done when:** flips, pulses and shakes look smooth and do not break input locking.

## Phase 5: Persistence and best scores

Goal: best score per difficulty survives app restarts.

- [ ] `lib/storage.ts`: `loadBest(diff)` and `saveBest(diff, score)` under key `memory-match:best`, with the "fewer moves, then fewer seconds" rule. Wrap every AsyncStorage call in try/catch and fall back gracefully.
- [ ] Hook integration: load the best on mount; when `won` becomes true, compare against the stored best, save if beaten, and expose `isNewBest`.
- [ ] Show the best in `StatsBar` and a "New best!" badge in `WinModal`.
- [ ] Use the difficulty key `"4x4"` for now so difficulty levels can be added later.

**Done when:** best score persists after killing the app, only updates when beaten, and the game stays playable if storage throws.

## Phase 6: Haptics, visuals and app polish

Goal: finished feel on a real device.

- [ ] `expo-haptics`: `selectionAsync` on flip, `notificationAsync(Success)` on match and win, `Warning` on mismatch. Wrap in try/catch and skip on web or unsupported devices.
- [ ] Color palette, card-back design, typography, spacing; support light and dark if cheap.
- [ ] App icon and splash screen via `app.json` (check the SDK 58 `expo-splash-screen` config).
- [ ] Layout hardening: small phones, tablets, portrait and landscape (recompute card size on dimension change; cap the board width on tablets).

**Done when:** the app looks consistent and the grid fits all tested sizes.

## Phase 7: QA and release readiness

Goal: pass the MVP testing checklist on a real device.

- [ ] Walk the full checklist in [MVP.md](MVP.md#testing-checklist) on a physical iOS and Android device (or emulators plus one real device).
- [ ] Profile animations on a mid-range Android device; reduce work per card if frames drop.
- [ ] `npx expo-doctor`, `npx expo lint`, `npx tsc --noEmit` all clean.
- [ ] (Optional) `eas build --profile preview` for a shareable build.

**Done when:** every checklist item is checked and the lint, typecheck and doctor checks pass.

---

## Stretch backlog (post-MVP, in suggested order)

1. **Difficulty levels** (3x4, 4x4, 4x5, 6x6): parameterize `makeDeck` and column count; best scores already keyed per difficulty. Needs more symbols for 6x6 (18 pairs).
2. **Themes** (animal, food, space emoji sets, card-back designs) with a settings screen.
3. **Sound** with `expo-audio` and a mute toggle.
4. **Timer mode:** countdown challenge with optional combo bonus.
5. **Two-player hot-seat** with per-player scores.
6. **Share result** with `Share.share`.
