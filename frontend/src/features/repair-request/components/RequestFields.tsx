import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, typography } from "../../../shared/theme";

export const requestStyles = createAdaptiveStyleSheet({
  section: { gap: spacing.sm, marginBottom: spacing.lg },
  text: { fontFamily: typography.fontFamily, fontSize: typography.size.md, color: colors.text, textAlign: "right", writingDirection: "rtl", lineHeight: typography.lineHeight.md },
  label: { fontWeight: typography.weight.bold },
  muted: { color: colors.textMuted, fontSize: typography.size.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, padding: spacing.md, minHeight: 48 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: { minHeight: 44, justifyContent: "center", padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  selected: { borderColor: colors.primary, backgroundColor: colors.background, borderWidth: 2 },
  error: { color: colors.danger },
  actions: { gap: spacing.sm, marginBottom: spacing.lg }
});

export function Field({ label, error, children }: PropsWithChildren<{ label: string; error?: string }>) {
  return <View style={requestStyles.section}><LocalizedText style={[requestStyles.text, requestStyles.label]}>{label}</LocalizedText>{children}
    {error ? <LocalizedText accessibilityRole="alert" style={[requestStyles.text, requestStyles.error]}>{error}</LocalizedText> : null}</View>;
}

export function TextField({ label, value, onChange, multiline, error, disabled }: {
  label: string; value: string; onChange(value: string): void; multiline?: boolean; error?: string; disabled?: boolean;
}) {
  return <Field label={label} error={error}><LocalizedTextInput accessibilityLabel={label} value={value} onChangeText={onChange}
    editable={!disabled} multiline={multiline} textAlignVertical={multiline ? "top" : "center"}
    style={[requestStyles.text, requestStyles.input, multiline && { minHeight: 120 }]} /></Field>;
}

export function Options<T extends string>({ label, value, options, onChange, error, disabled }: {
  label: string; value?: T; options: readonly { id: T; label: string }[]; onChange(value: T): void; error?: string; disabled?: boolean;
}) {
  return <Field label={label} error={error}><View accessibilityRole="radiogroup" style={requestStyles.options}>
    {options.map((option) => <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: option.id === value, disabled }}
      disabled={disabled} onPress={() => onChange(option.id)} style={[requestStyles.option, value === option.id && requestStyles.selected]}>
      <LocalizedText style={requestStyles.text}>{option.label}</LocalizedText></Pressable>)}
  </View></Field>;
}
