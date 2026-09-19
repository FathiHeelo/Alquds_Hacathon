import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { uiText } from "../constants/uiText";
import { colors, spacing, typography } from "../theme";
import { Button } from "./Button";

interface StateProps {
  message?: string;
}

function StateLayout({ message, symbol }: StateProps & { symbol: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>{symbol}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function LoadingState({ message = uiText.placeholders.loading }: StateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primaryPressed} />
      <Text style={styles.message}>{message}</Text>
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
  return (
    <View style={styles.container}>
      <Text style={[styles.symbol, styles.error]}>!</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button onPress={onRetry}>{uiText.common.retry}</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: spacing.sm, justifyContent: "center", padding: spacing.lg },
  symbol: { color: colors.primaryPressed, fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  error: { color: colors.danger },
  message: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    textAlign: "center",
    writingDirection: "rtl"
  }
});
