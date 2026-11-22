import { StyleSheet, Text, View } from "react-native";

import { formatTime } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import type { BestScore } from "@/lib/types";

type Props = {
  moves: number;
  seconds: number;
  best?: BestScore | null;
  /** "row" (default) for narrow screens, "column" for the wide side panel. */
  layout?: "row" | "column";
};

function Stat({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          large && styles.valueLarge,
          { color: theme.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function StatsBar({ moves, seconds, best, layout = "row" }: Props) {
  const theme = useTheme();
  const column = layout === "column";
  const bestText = best ? `${best.moves} / ${formatTime(best.seconds)}` : "--";

  return (
    <View
      style={
        column
          ? [
              styles.panel,
              {
                backgroundColor: theme.cardFront,
                borderColor: theme.cardFrontBorder,
              },
            ]
          : styles.bar
      }
    >
      <Stat label="Moves" value={String(moves)} large={column} />
      <Stat label="Time" value={formatTime(seconds)} large={column} />
      <Stat label="Best" value={bestText} large={column} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 640,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  panel: {
    width: "100%",
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  stat: { alignItems: "center" },
  label: { fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  value: { fontSize: 22, fontWeight: "700" },
  valueLarge: { fontSize: 32 },
});
