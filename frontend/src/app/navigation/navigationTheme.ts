import { DefaultTheme, type Theme } from "@react-navigation/native";

import { colors } from "../../shared/theme";

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    border: colors.border,
    card: colors.background,
    notification: colors.primary,
    primary: colors.primary,
    text: colors.text
  }
};
