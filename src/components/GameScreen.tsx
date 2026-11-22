import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMemoryGame } from "@/hooks/useMemoryGame";
import { useTheme } from "@/lib/theme";

import { Board } from "./Board";
import { StatsBar } from "./StatsBar";
import { WinModal } from "./WinModal";

// A window counts as "wide" when it is clearly landscape (e.g. the open
// iPhone Duo, tablets, desktop browsers): board on the left, stats and
// Restart in a side panel.
const WIDE_RATIO = 1.2;

export function GameScreen() {
  const theme = useTheme();
  const { state, best, isNewBest, flip, restart } = useMemoryGame();

  // Measured from the container (not useWindowDimensions) so the first render
  // is the same on server and client; it starts out narrow until measured.
  const [box, setBox] = useState({ width: 0, height: 0 });
  const wide = box.width > box.height * WIDE_RATIO;

  const restartButton = (
    <Pressable
      onPress={restart}
      accessibilityRole="button"
      style={[styles.restart, { backgroundColor: theme.button }]}
    >
      <Text style={[styles.restartText, { color: theme.buttonText }]}>
        Restart
      </Text>
    </Pressable>
  );

  const board = (
    <Board
      cards={state.cards}
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
  column: { flex: 1, alignItems: "center", gap: 8, paddingBottom: 12 },
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
    width: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  restart: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  restartText: { fontSize: 16, fontWeight: "700" },
});
