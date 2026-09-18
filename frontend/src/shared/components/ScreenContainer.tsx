import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { colors, spacing } from "../theme";

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.surface, flex: 1 },
  content: { flexGrow: 1, padding: spacing.md }
});
