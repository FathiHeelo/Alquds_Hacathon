import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { radius, shadows, spacing, useTheme } from "../theme";

export function Card({ children }: PropsWithChildren) {
  const { theme, isHighContrast } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: isHighContrast ? 2 : 1 }]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...shadows.subtle,
    borderRadius: radius.md,
    padding: spacing.md
  }
});
