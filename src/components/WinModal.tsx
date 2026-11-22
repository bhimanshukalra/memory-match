import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import { formatTime } from "@/lib/format";

type Props = {
  visible: boolean;
  moves: number;
  seconds: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
};

export function WinModal({
  visible,
  moves,
  seconds,
  isNewBest,
  onPlayAgain,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onPlayAgain}
    >
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.springify()} style={styles.card}>
          <Text style={styles.title}>🎉 You won!</Text>
          {isNewBest && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🏆 New best!</Text>
            </View>
          )}
          <Text style={styles.line}>Moves: {moves}</Text>
          <Text style={styles.line}>Time: {formatTime(seconds)}</Text>
          <Pressable
            onPress={onPlayAgain}
            accessibilityRole="button"
            style={styles.button}
          >
            <Text style={styles.buttonText}>Play again</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    width: 280,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#312e81" },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#fef3c7",
  },
  badgeText: { color: "#b45309", fontWeight: "700" },
  line: { fontSize: 18, color: "#4338ca" },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
  },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
