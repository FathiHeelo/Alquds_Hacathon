import type { ViewStyle } from "react-native";

export const shadows = {
  subtle: {
    elevation: 2,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  } satisfies ViewStyle,
  raised: {
    elevation: 4,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8
  } satisfies ViewStyle
} as const;
