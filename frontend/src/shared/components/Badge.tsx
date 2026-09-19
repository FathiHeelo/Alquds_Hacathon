import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography, useTheme } from "../theme";
import { useI18n } from "../i18n/I18nProvider";

export function Badge({ label }: { label: string }) {
  const { theme, textScale, isHighContrast } = useTheme();
  const { isRTL } = useI18n();
  return (
    <View style={[styles.badge, { backgroundColor: theme.surfaceSecondary, borderColor: theme.borderStrong, borderWidth: isHighContrast ? 2 : 1 }]}>
      <Text style={[styles.label, { color: theme.text, fontSize: typography.size.xs * textScale, writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.round,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textAlign: "center"
  }
});
