import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMemoryGame } from "@/hooks/useMemoryGame";

import { Board } from "./Board";
import { StatsBar } from "./StatsBar";
import { WinModal } from "./WinModal";

export function GameScreen() {
  const { state, flip, restart } = useMemoryGame();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <StatsBar moves={state.moves} seconds={state.seconds} />
        <Board
          cards={state.cards}
          flipped={state.flipped}
          matched={state.matched}
          onFlip={flip}
        />
        <Pressable
          onPress={restart}
          accessibilityRole="button"
          style={styles.restart}
        >
          <Text style={styles.restartText}>Restart</Text>
        </Pressable>
      </View>
      <WinModal
        visible={state.won}
        moves={state.moves}
        seconds={state.seconds}
        onPlayAgain={restart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef2ff" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  restart: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
  },
  restartText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
