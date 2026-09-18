import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type PressableProps = ComponentProps<typeof Pressable>;
type ButtonVariant = "primary" | "secondary" | "outlined";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({ children, disabled, variant = "primary", ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
      {...props}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
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
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outlined: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    textAlign: "center",
    writingDirection: "rtl"
  },
  primaryLabel: { color: colors.neutral },
  secondaryLabel: { color: colors.invertedText },
  outlinedLabel: { color: colors.text },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.45 }
});
