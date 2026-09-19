import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { spacing, useTheme } from "../theme";

export function ScreenContainer({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.md }
});
