import { StyleSheet, Text, View } from "react-native";

import { Card, ScreenContainer } from "../../../shared/components";
import { uiText } from "../../../shared/constants/uiText";
import { colors, spacing, typography } from "../../../shared/theme";

const entries = [
  uiText.admin.verification,
  uiText.admin.reports,
  uiText.admin.risk,
  uiText.admin.summary
] as const;

export function AdminHomeScreen() {
  return (
    <ScreenContainer>
      <View style={styles.grid}>
        {entries.map((entry) => (
          <Card key={entry}>
            <Text style={styles.label}>{entry}</Text>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    textAlign: "right",
    writingDirection: "rtl"
  }
});
