import { memo, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { symbolName } from "@/lib/symbols";
import { useTheme } from "@/lib/theme";

const FLIP_MS = 300;
const CORNERS = ["tl", "tr", "bl", "br"] as const;
const PIP_POS = {
  tl: { top: "17%", left: "17%" },
  tr: { top: "17%", right: "17%" },
  bl: { bottom: "17%", left: "17%" },
  br: { bottom: "17%", right: "17%" },
} as const;
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
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(faceUp ? 180 : 0);
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  // With "Reduce Motion" on, cards turn instantly and the pulse and shake are
  // skipped entirely.
  useEffect(() => {
    rotation.value = withTiming(faceUp ? 180 : 0, {
      duration: reduceMotion ? 0 : FLIP_MS,
    });
  }, [faceUp, reduceMotion, rotation]);

  // Pulse once the flip has finished.
  useEffect(() => {
    if (!matched || reduceMotion) return;
    scale.value = withDelay(
      FLIP_MS,
      withSequence(withSpring(1.1, PULSE_SPRING), withSpring(1, PULSE_SPRING)),
    );
  }, [matched, reduceMotion, scale]);

  // Shake after the flip, before the cards flip back (lock lasts 800 ms).
  useEffect(() => {
    if (!mismatched || reduceMotion) return;
    shake.value = withDelay(
      FLIP_MS + 50,
      withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 80 }),
        withTiming(-6, { duration: 80 }),
        withTiming(0, { duration: 50 }),
      ),
    );
  }, [mismatched, reduceMotion, shake]);

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
      disabled={matched}
      accessibilityRole="button"
      accessibilityLabel={`Card ${index + 1}, ${
        faceUp ? symbolName(symbol) : "face down"
      }`}
      aria-disabled={matched}
      aria-selected={faceUp}
      style={{ width: size, height: size }}
    >
      <Animated.View style={[styles.fill, containerStyle]}>
        <Animated.View
          style={[styles.face, { backgroundColor: theme.cardBack }, backStyle]}
        >
          <View
            style={[
              styles.frame,
              { borderColor: theme.cardBackTrim, borderWidth: 2, margin: size * 0.06 },
            ]}
          />
          <View
            style={[
              styles.frame,
              {
                borderColor: theme.cardBackTrim,
                borderWidth: 1,
                margin: size * 0.1,
                opacity: 0.45,
                borderRadius: 5,
              },
            ]}
          />
          <View
            style={{
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: size * 0.25,
              borderWidth: 2,
              borderColor: theme.cardBackTrim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.Text
              style={{ fontSize: size * 0.3, color: theme.cardBackTrim }}
            >
              ✦
            </Animated.Text>
          </View>
          {CORNERS.map((c) => (
            <View
              key={c}
              style={[
                styles.pip,
                { backgroundColor: theme.cardBackTrim },
                PIP_POS[c],
              ]}
            />
          ))}
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
  frame: {
    ...StyleSheet.absoluteFill,
    borderRadius: 8,
  },
  pip: { position: "absolute", width: 5, height: 5, borderRadius: 3 },
});
