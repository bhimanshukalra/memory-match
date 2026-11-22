import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Haptics are a nicety: skip on web and swallow any failure (unsupported
// device, simulator, etc.) so they can never break gameplay.
function run(fn: () => Promise<void>) {
  if (Platform.OS === "web") return;
  try {
    fn().catch(() => {});
  } catch {
    // ignore
  }
}

export const tapHaptic = () => run(() => Haptics.selectionAsync());
export const successHaptic = () =>
  run(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
export const warningHaptic = () =>
  run(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
