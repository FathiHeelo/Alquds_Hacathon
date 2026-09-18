import { Platform } from "react-native";

export const typography = {
  fontFamily: Platform.select({ android: "sans-serif", default: "System" }),
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    display: 40
  },
  lineHeight: {
    sm: 20,
    md: 24,
    lg: 30,
    display: 48
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700"
  }
} as const;
