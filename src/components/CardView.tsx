import { memo, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/lib/theme";

const FLIP_MS = 300;
const PULSE_SPRING = { damping: 14, stiffness: 400 };

type Props = {
  index: number;
  symbol: string;
  faceUp: boolean;
  matched: boolean;
  mismatched: boolean; // second card of a wrong pair, during the lock window
  size: number;
  onPress: (index: number) => void;
};

function CardViewBase({
  index,
  symbol,
  faceUp,
  matched,
  mismatched,
  size,
  onPress,
}: Props) {
  const theme = useTheme();
  const rotation = useSharedValue(faceUp ? 180 : 0);
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(faceUp ? 180 : 0, { duration: FLIP_MS });
  }, [faceUp, rotation]);

  // Pulse once the flip has finished.
  useEffect(() => {
    if (!matched) return;
    scale.value = withDelay(
      FLIP_MS,
      withSequence(withSpring(1.1, PULSE_SPRING), withSpring(1, PULSE_SPRING)),
    );
  }, [matched, scale]);

  // Shake after the flip, before the cards flip back (lock lasts 800 ms).
  useEffect(() => {
    if (!mismatched) return;
    shake.value = withDelay(
      FLIP_MS + 50,
      withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 80 }),
        withTiming(-6, { duration: 80 }),
        withTiming(0, { duration: 50 }),
      ),
    );
  }, [mismatched, shake]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotation.value}deg` }],
  }));
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${rotation.value + 180}deg` },
    ],
  }));

  return (
    <Pressable
      onPress={() => onPress(index)}
      accessibilityRole="button"
      accessibilityLabel={faceUp ? symbol : "Hidden card"}
      style={{ width: size, height: size }}
    >
      <Animated.View style={[styles.fill, containerStyle]}>
        <Animated.View
          style={[styles.face, { backgroundColor: theme.cardBack }, backStyle]}
        >
          <View
            style={[
              styles.ring,
              { borderColor: theme.cardBackRing, borderRadius: 8 },
            ]}
          />
          <Animated.Text
            style={{ fontSize: size * 0.45, color: theme.cardBackMark }}
          >
            ?
          </Animated.Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.face,
            styles.front,
            {
              backgroundColor: matched ? theme.matchBg : theme.cardFront,
              borderColor: matched ? theme.matchBorder : theme.cardFrontBorder,
            },
            frontStyle,
          ]}
        >
          <Animated.Text style={{ fontSize: size * 0.5 }}>{symbol}</Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export const CardView = memo(CardViewBase);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  face: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backfaceVisibility: "hidden",
  },
  front: { borderWidth: 2 },
  ring: {
    ...StyleSheet.absoluteFill,
    margin: 6,
    borderWidth: 2,
  },
});
