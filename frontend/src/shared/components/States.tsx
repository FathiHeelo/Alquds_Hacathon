import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { uiText } from "../constants/uiText";
import { spacing, typography, useTheme } from "../theme";
import { useI18n } from "../i18n/I18nProvider";
import { Button } from "./Button";

interface StateProps {
  message?: string;
}

function StateLayout({ message, symbol }: StateProps & { symbol: string }) {
  const { theme, textScale } = useTheme();
  const { isRTL } = useI18n();
  return (
    <View style={styles.container}>
      <Text style={[styles.symbol, { color: theme.primaryPressed }]}>{symbol}</Text>
      <Text style={[styles.message, { color: theme.textMuted, fontSize: typography.size.sm * textScale, writingDirection: isRTL ? "rtl" : "ltr" }]}>{message}</Text>
    </View>
  );
}

export function LoadingState({ message = uiText.placeholders.loading }: StateProps) {
  const { theme, textScale } = useTheme();
  const { isRTL } = useI18n();
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.primaryPressed} />
      <Text style={[styles.message, { color: theme.textMuted, fontSize: typography.size.sm * textScale, writingDirection: isRTL ? "rtl" : "ltr" }]}>{message}</Text>
    </View>
  );
}

export function EmptyState({ message = uiText.placeholders.empty }: StateProps) {
  return <StateLayout message={message} symbol="○" />;
}

export function SuccessState({ message = uiText.placeholders.success }: StateProps) {
  return <StateLayout message={message} symbol="✓" />;
}

export function ErrorState({ message = uiText.placeholders.error, onRetry }: StateProps & { onRetry?: () => void }) {
  const { theme, textScale } = useTheme();
  const { isRTL } = useI18n();
  return (
    <View style={styles.container}>
      <Text style={[styles.symbol, { color: theme.danger }]}>!</Text>
      <Text style={[styles.message, { color: theme.textMuted, fontSize: typography.size.sm * textScale, writingDirection: isRTL ? "rtl" : "ltr" }]}>{message}</Text>
      {onRetry ? <Button onPress={onRetry}>{uiText.common.retry}</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: spacing.sm, justifyContent: "center", padding: spacing.lg },
  symbol: { fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  message: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    textAlign: "center",
    writingDirection: "rtl"
  }
});
