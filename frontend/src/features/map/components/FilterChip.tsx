import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing, typography } from "../../../shared/theme";

interface FilterChipProps extends PropsWithChildren {
  isSelected: boolean;
  onPress(): void;
}

export function FilterChip({ children, isSelected, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.chip, isSelected && styles.selectedChip]}
    >
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md
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
