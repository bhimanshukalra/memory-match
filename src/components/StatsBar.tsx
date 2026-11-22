import { StyleSheet, Text, View } from "react-native";

import { formatTime } from "@/lib/format";
import type { BestScore } from "@/lib/types";

type Props = {
  moves: number;
  seconds: number;
  best?: BestScore | null;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
    paddingHorizontal: 16,
  },
  stat: { alignItems: "center" },
  label: { fontSize: 12, color: "#6366f1", textTransform: "uppercase" },
  value: { fontSize: 22, fontWeight: "700", color: "#312e81" },
});
