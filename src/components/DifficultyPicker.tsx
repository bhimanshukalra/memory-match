import { Pressable, StyleSheet, Text, View } from "react-native";

import { DIFFICULTIES, type Difficulty } from "@/lib/difficulty";
import { useTheme } from "@/lib/theme";

type Props = {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
};

export function DifficultyPicker({ value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {DIFFICULTIES.map((d) => {
        const selected = d.key === value.key;
        return (
          <Pressable
            key={d.key}
            onPress={() => onChange(d)}
            accessibilityRole="radio"
            accessibilityLabel={`${d.label}, ${d.cols} by ${d.rows}`}
            aria-checked={selected}
            style={[
              styles.chip,
              { backgroundColor: selected ? theme.accent : theme.chip },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? theme.onAccent : theme.label },
              ]}
            >
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999 },
  label: { fontSize: 13, fontWeight: "700" },
});
