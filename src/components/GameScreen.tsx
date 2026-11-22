import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMemoryGame } from "@/hooks/useMemoryGame";
import { useTheme } from "@/lib/theme";

import { Board } from "./Board";
import { StatsBar } from "./StatsBar";
import { WinModal } from "./WinModal";

export function GameScreen() {
  const theme = useTheme();
  const { state, best, isNewBest, flip, restart } = useMemoryGame();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={styles.column}>
        <StatsBar moves={state.moves} seconds={state.seconds} best={best} />
        <Board
          cards={state.cards}
          flipped={state.flipped}
          matched={state.matched}
          locked={state.locked}
          onFlip={flip}
        />
        <Pressable
          onPress={restart}
          accessibilityRole="button"
          style={[styles.restart, { backgroundColor: theme.button }]}
        >
          <Text style={[styles.restartText, { color: theme.buttonText }]}>
            Restart
          </Text>
        </Pressable>
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
  restart: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  restartText: { fontSize: 16, fontWeight: "700" },
});
