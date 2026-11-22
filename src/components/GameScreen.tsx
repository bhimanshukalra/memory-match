import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMemoryGame } from "@/hooks/useMemoryGame";

import { Board } from "./Board";

export function GameScreen() {
  const { state, flip } = useMemoryGame();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Board
          cards={state.cards}
          flipped={state.flipped}
          matched={state.matched}
          onFlip={flip}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef2ff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
