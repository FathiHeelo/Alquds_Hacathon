import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { colors, radius, shadows, spacing } from "../theme";

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...shadows.subtle,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md
  }
});
