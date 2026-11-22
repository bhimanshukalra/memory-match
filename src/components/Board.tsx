import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/lib/theme";
import type { Card } from "@/lib/types";

import { CardView } from "./CardView";

const GAP = 10;
const PADDING = 12;
const MARGIN = 12;
const MAX_BOARD_WIDTH = 640;
const MAX_CARD_SIZE = 150;

type Props = {
  cards: Card[];
  columns: number;
  rows: number;
  flipped: number[];
  matched: Set<string>;
  locked: boolean;
  onFlip: (index: number) => void;
};

export function Board({
  cards,
  columns,
  rows,
  flipped,
  matched,
  locked,
  onFlip,
}: Props) {
  // Measured from the container (not useWindowDimensions) so the first render
  // is identical on server/client and never produces a negative size. Both
  // dimensions count, so the board also fits short (landscape) screens.
  const theme = useTheme();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const fitW =
    (box.width - MARGIN * 2 - PADDING * 2 - GAP * (columns - 1)) / columns;
  const fitH = (box.height - MARGIN * 2 - PADDING * 2 - GAP * (rows - 1)) / rows;
  const size = Math.max(0, Math.floor(Math.min(fitW, fitH, MAX_CARD_SIZE)));
  const boardWidth = size * columns + GAP * (columns - 1) + PADDING * 2;

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ width, height });
      }}
    >
      {size > 0 && (
        <View
          style={[
            styles.board,
            { width: boardWidth, backgroundColor: theme.tray },
          ]}
        >
          {cards.map((card, index) => (
            <CardView
              key={card.id}
              index={index}
              symbol={card.symbol}
              size={size}
              faceUp={flipped.includes(index) || matched.has(card.symbol)}
              matched={matched.has(card.symbol)}
              mismatched={locked && flipped.includes(index)}
              onPress={onFlip}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_BOARD_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    padding: PADDING,
    borderRadius: 20,
  },
});
