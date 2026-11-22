import { AccessibilityInfo } from "react-native";

// Spoken feedback for screen-reader users; never allowed to break gameplay.
export function announce(message: string) {
  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch {
    // ignore
  }
}
