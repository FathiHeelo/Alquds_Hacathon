import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

import { colors, spacing, typography } from "../../shared/theme";

export function tabOptions(icon: keyof typeof Ionicons.glyphMap): BottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primaryPressed,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarIcon: ({ color, size }) => <Ionicons color={color} name={icon} size={size} />,
    tabBarLabelStyle: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.xs,
      fontWeight: typography.weight.semibold
    },
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
      height: 68,
      paddingBottom: spacing.sm,
      paddingTop: spacing.sm
    }
  };
}
