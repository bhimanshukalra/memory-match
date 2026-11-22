import { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  index: number;
  symbol: string;
  faceUp: boolean;
  size: number;
  onPress: (index: number) => void;
};

function CardViewBase({ index, symbol, faceUp, size, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(index)}
      accessibilityRole="button"
      accessibilityLabel={faceUp ? symbol : "Hidden card"}
      style={[
        styles.card,
        { width: size, height: size },
        faceUp ? styles.front : styles.back,
      ]}
    >
      <Text style={[styles.symbol, { fontSize: size * 0.5 }]}>
        {faceUp ? symbol : "?"}
      </Text>
    </Pressable>
  );
}

export const CardView = memo(CardViewBase);

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  back: { backgroundColor: "#4f46e5" },
  front: { backgroundColor: "#ffffff", borderWidth: 2, borderColor: "#c7d2fe" },
  symbol: { color: "#e0e7ff" },
});
