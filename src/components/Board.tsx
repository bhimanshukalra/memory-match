import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import type { Card } from "@/lib/types";

import { CardView } from "./CardView";

const COLUMNS = 4;
const ROWS = 4;
const GAP = 10;
const PADDING = 16;
const MAX_BOARD_WIDTH = 640;
const MAX_CARD_SIZE = 150;

type Props = {
  cards: Card[];
  flipped: number[];
  matched: Set<string>;
  locked: boolean;
  onFlip: (index: number) => void;
};

export function Board({ cards, flipped, matched, locked, onFlip }: Props) {
  // Measured from the container (not useWindowDimensions) so the first render
  // is identical on server/client and never produces a negative size. Both
  // dimensions count, so the board also fits short (landscape) screens.
  const [box, setBox] = useState({ width: 0, height: 0 });
  const fitW = (box.width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const fitH = (box.height - PADDING * 2 - GAP * (ROWS - 1)) / ROWS;
  const size = Math.max(0, Math.floor(Math.min(fitW, fitH, MAX_CARD_SIZE)));
  const boardWidth = size * COLUMNS + GAP * (COLUMNS - 1) + PADDING * 2;

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ width, height });
      }}
    >
      {size > 0 && (
        <FlatList
          data={cards}
          numColumns={COLUMNS}
          scrollEnabled={false}
          keyExtractor={(card) => String(card.id)}
          extraData={{ flipped, matched, locked }}
          style={{ flexGrow: 0, width: boardWidth }}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => (
            <CardView
              index={index}
              symbol={item.symbol}
              size={size}
              faceUp={flipped.includes(index) || matched.has(item.symbol)}
              matched={matched.has(item.symbol)}
              mismatched={locked && flipped.includes(index)}
              onPress={onFlip}
            />
          )}
        />
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
  content: { padding: PADDING, gap: GAP },
  row: { gap: GAP },
});
