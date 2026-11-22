import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMemoryGame } from "@/hooks/useMemoryGame";
import { useTheme } from "@/lib/theme";

import { Board } from "./Board";
import { DifficultyPicker } from "./DifficultyPicker";
import { StatsBar } from "./StatsBar";
import { WinModal } from "./WinModal";

// A window counts as "wide" when it is clearly landscape (e.g. the open
// iPhone Duo, tablets, desktop browsers): board on the left, stats and
// Restart in a side panel.
const WIDE_RATIO = 1.2;

export function GameScreen() {
  const theme = useTheme();
  const { state, best, isNewBest, difficulty, setDifficulty, flip, restart } =
    useMemoryGame();

  // Measured from the container (not useWindowDimensions) so the first render
  // is the same on server and client; it starts out narrow until measured.
  const [box, setBox] = useState({ width: 0, height: 0 });
  const wide = box.width > box.height * WIDE_RATIO;

  // The grid is cols x rows in portrait; in the wide layout lay it out
  // landscape (the longer side horizontal) so cards stay large.
  const columns = wide ? Math.max(difficulty.cols, difficulty.rows) : difficulty.cols;
  const rows = wide ? Math.min(difficulty.cols, difficulty.rows) : difficulty.rows;

  const picker = <DifficultyPicker value={difficulty} onChange={setDifficulty} />;

  const restartButton = (
    <Pressable
      onPress={restart}
      accessibilityRole="button"
      style={[styles.restart, { backgroundColor: theme.button }]}
    >
      <Text style={[styles.restartText, { color: theme.buttonText }]}>
        ↻  Restart
      </Text>
    </Pressable>
  );

  const header = (
    <Text style={[styles.title, { color: theme.accent }]}>✦ Memory Match</Text>
  );

  const board = (
    <Board
      cards={state.cards}
      columns={columns}
      rows={rows}
      flipped={state.flipped}
      matched={state.matched}
      locked={state.locked}
      onFlip={flip}
    />
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View
        style={wide ? styles.row : styles.column}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setBox({ width, height });
        }}
      >
        {wide ? (
          <>
            {board}
            <View style={styles.sidePanel}>
              {header}
              {picker}
              <StatsBar
                layout="column"
                moves={state.moves}
                seconds={state.seconds}
                best={best}
              />
              {restartButton}
            </View>
          </>
        ) : (
          <>
            {header}
            {picker}
            <StatsBar moves={state.moves} seconds={state.seconds} best={best} />
            {board}
            {restartButton}
          </>
        )}
      </View>
      <WinModal
        visible={state.won}
        moves={state.moves}
        seconds={state.seconds}
        isNewBest={isNewBest}
        onPlayAgain={restart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  column: { flex: 1, alignItems: "center", gap: 12, paddingBottom: 12, paddingTop: 8 },
  row: {
    flex: 1,
    flexDirection: "row",
    // Stretch so the board container gets the full row height to measure.
    alignItems: "stretch",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
  },
  sidePanel: {
    alignSelf: "center",
    width: 290,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  restart: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  title: { fontSize: 20, fontWeight: "700", letterSpacing: 0.5 },
  restartText: { fontSize: 16, fontWeight: "700" },
});
