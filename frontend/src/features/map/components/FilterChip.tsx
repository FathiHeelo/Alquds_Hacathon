import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography, useTheme } from "../../../shared/theme";

interface FilterChipProps extends PropsWithChildren {
  isSelected: boolean;
  onPress(): void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function FilterChip({ children, icon, iconColor = colors.primaryPressed, isSelected, onPress }: FilterChipProps) {
  const { theme, isHighContrast } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: isSelected ? theme.primary : theme.cardBackground, borderColor: isSelected ? theme.primaryPressed : theme.borderStrong, borderWidth: isHighContrast ? 2 : 1 }]}
    >
      {icon ? <Ionicons color={isSelected ? theme.textInverse : iconColor} name={icon} size={15} /> : null}
      <LocalizedText style={[styles.label, { color: isSelected ? theme.textInverse : theme.text }]}>{children}</LocalizedText>
    </Pressable>
  );
}

const styles = createAdaptiveStyleSheet({
  chip: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    justifyContent: "center",
    flexDirection: "row-reverse",
    minHeight: 44,
    paddingHorizontal: 9,
    gap: 3
  },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    writingDirection: "rtl"
  },
  selectedLabel: { color: colors.neutral, fontWeight: typography.weight.bold }
});
