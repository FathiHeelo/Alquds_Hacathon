import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../../../shared/components";
import { uiText } from "../../../shared/constants/uiText";
import { colors, spacing, typography } from "../../../shared/theme";

interface PlaceholderScreenProps {
  description?: string;
  title: string;
}

export function PlaceholderScreen({ description = uiText.common.comingSoon, title }: PlaceholderScreenProps) {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", flex: 1, gap: spacing.sm, justifyContent: "center" },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    textAlign: "center",
    writingDirection: "rtl"
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    textAlign: "center",
    writingDirection: "rtl"
  }
});
