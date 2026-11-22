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
  highlight,
  grow,
  timer,
}: {
  label: string;
  value: string;
  large?: boolean;
  highlight?: boolean;
  grow?: boolean;
  timer?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityRole={timer ? "timer" : undefined}
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.chip,
        grow && styles.grow,
        { backgroundColor: theme.chip },
      ]}
    >
      <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          large && styles.valueLarge,
          { color: highlight ? theme.accent : theme.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function StatsBar({ moves, seconds, best, layout = "row" }: Props) {
  const column = layout === "column";
  const bestText = best ? `${best.moves} / ${formatTime(best.seconds)}` : "--";

  return (
    <View style={column ? styles.column : styles.bar}>
      <Stat label="Moves" value={String(moves)} large={column} grow={!column} />
      <Stat
        label="Time"
        value={formatTime(seconds)}
        large={column}
        grow={!column}
        timer
      />
      <Stat label="Best" value={bestText} large={column} grow={!column} highlight />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    maxWidth: 640,
    paddingHorizontal: 12,
  },
  column: { width: "100%", gap: 10 },
  chip: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  grow: { flex: 1 },
  label: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  value: { fontSize: 20, fontWeight: "700" },
  valueLarge: { fontSize: 28 },
});
