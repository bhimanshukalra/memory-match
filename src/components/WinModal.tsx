import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import { formatTime } from "@/lib/format";
import { useTheme } from "@/lib/theme";

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
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onPlayAgain}
    >
      <View style={[styles.backdrop, { backgroundColor: theme.backdrop }]}>
        <Animated.View
          entering={ZoomIn.springify()}
          style={[styles.card, { backgroundColor: theme.modalBg }]}
        >
          <Text style={[styles.title, { color: theme.modalTitle }]}>🎉 You won!</Text>
          {isNewBest && (
            <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
              <Text style={[styles.badgeText, { color: theme.badgeText }]}>🏆 New best!</Text>
            </View>
          )}
          <Text style={[styles.line, { color: theme.modalText }]}>Moves: {moves}</Text>
          <Text style={[styles.line, { color: theme.modalText }]}>Time: {formatTime(seconds)}</Text>
          <Pressable
            onPress={onPlayAgain}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: theme.button }]}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Play again</Text>
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
  },
  card: {
    width: 280,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 26, fontWeight: "800" },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeText: { fontWeight: "700" },
  line: { fontSize: 18 },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
});
