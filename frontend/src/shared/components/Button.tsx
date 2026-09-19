import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { radius, spacing, typography, useTheme } from "../theme";
import { useI18n } from "../i18n/I18nProvider";
import { translateLegacyLiteral } from "../i18n/literalEn";

type PressableProps = ComponentProps<typeof Pressable>;
type ButtonVariant = "primary" | "secondary" | "outlined";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({ children, disabled, variant = "primary", ...props }: ButtonProps) {
  const { theme, textScale, isHighContrast } = useTheme();
  const { isRTL, language } = useI18n();
  const label = language === "en" && typeof children === "string" ? translateLegacyLiteral(children) : children;
  const backgroundColor = variant === "primary" ? theme.primary : variant === "secondary" ? theme.surfaceSecondary : theme.cardBackground;
  const color = variant === "primary" ? theme.textInverse : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, borderColor: variant === "primary" ? theme.primary : theme.borderStrong, borderWidth: variant === "outlined" || isHighContrast ? (isHighContrast ? 2 : 1) : 0 },
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
      accessibilityLabel={props.accessibilityLabel ?? (typeof label === "string" ? label : undefined)}
      {...props}
    >
      <Text style={[styles.label, { color, fontSize: typography.size.sm * textScale, writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.md,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.md
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    textAlign: "center"
  },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.45 }
});
