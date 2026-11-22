import { StyleSheet, Text, View } from "react-native";

import { formatTime } from "@/lib/format";
import { useTheme } from "@/lib/theme";
import type { BestScore } from "@/lib/types";

type Props = {
  moves: number;
  seconds: number;
  best?: BestScore | null;
};

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

export function StatsBar({ moves, seconds, best }: Props) {
  return (
    <View style={styles.bar}>
      <Stat label="Moves" value={String(moves)} />
      <Stat label="Time" value={formatTime(seconds)} />
      <Stat
        label="Best"
        value={best ? `${best.moves} / ${formatTime(best.seconds)}` : "--"}
      />
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
  stat: { alignItems: "center" },
  label: { fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  value: { fontSize: 22, fontWeight: "700" },
});
