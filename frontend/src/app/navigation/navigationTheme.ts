import { DefaultTheme, type Theme } from "@react-navigation/native";

import type { SemanticTheme } from "../../shared/theme";

export function createNavigationTheme(theme: SemanticTheme): Theme {
  return { ...DefaultTheme, dark: theme.background === "#000000" || theme.background === "#0D1411", colors: { ...DefaultTheme.colors, background: theme.background, border: theme.border, card: theme.navigationBackground, notification: theme.danger, primary: theme.primary, text: theme.text } };
}
