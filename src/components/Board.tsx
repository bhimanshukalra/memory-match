import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import type { Card } from "@/lib/types";

import { CardView } from "./CardView";

const COLUMNS = 4;
const GAP = 10;
const PADDING = 16;
const MAX_BOARD_WIDTH = 520;

type Props = {
  cards: Card[];
  flipped: number[];
  matched: Set<string>;
  locked: boolean;
  onFlip: (index: number) => void;
};

export function Board({ cards, flipped, matched, locked, onFlip }: Props) {
  // Measured from the container (not useWindowDimensions) so the first render
  // is identical on server/client and never produces a negative size.
  const [width, setWidth] = useState(0);
  const size = Math.max(
    0,
    Math.floor((width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS),
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {size > 0 && (
        <FlatList
          data={cards}
          numColumns={COLUMNS}
          scrollEnabled={false}
          keyExtractor={(card) => String(card.id)}
          extraData={{ flipped, matched, locked }}
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
  container: { width: "100%", maxWidth: MAX_BOARD_WIDTH },
  content: { padding: PADDING, gap: GAP },
  row: { gap: GAP },
});
