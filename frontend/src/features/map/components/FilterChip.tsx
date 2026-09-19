import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "../../../shared/theme";

interface FilterChipProps extends PropsWithChildren {
  isSelected: boolean;
  onPress(): void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function FilterChip({ children, icon, iconColor = colors.primaryPressed, isSelected, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.chip, isSelected && styles.selectedChip]}
    >
      {icon ? <Ionicons color={isSelected ? colors.neutral : iconColor} name={icon} size={13} /> : null}
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    justifyContent: "center",
    flexDirection: "row-reverse",
    minHeight: 28,
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
