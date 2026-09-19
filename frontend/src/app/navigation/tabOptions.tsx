import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

import { colors, spacing, typography, type SemanticTheme } from "../../shared/theme";

export function tabOptions(icon: keyof typeof Ionicons.glyphMap, theme?: SemanticTheme): BottomTabNavigationOptions {
  const palette = theme ?? { primaryPressed: colors.primaryPressed, textMuted: colors.textMuted, navigationBackground: colors.background, border: colors.border };
  return {
    headerShown: false,
    tabBarActiveTintColor: palette.primaryPressed,
    tabBarInactiveTintColor: palette.textMuted,
    tabBarIcon: ({ color, size }) => <Ionicons color={color} name={icon} size={size} />,
    tabBarLabelStyle: {
      fontFamily: typography.fontFamily,
      fontSize: typography.size.xs,
      fontWeight: typography.weight.semibold
    },
    tabBarStyle: {
      backgroundColor: palette.navigationBackground,
      borderTopColor: palette.border,
      height: 68,
      paddingBottom: spacing.sm,
      paddingTop: spacing.sm
    }
  };
}
