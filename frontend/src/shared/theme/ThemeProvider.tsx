import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";

import { useAccessibilityPreferences } from "../preferences/AccessibilityPreferencesProvider";
import { darkTheme, highContrastTheme, lightTheme, type SemanticTheme } from "./themes";
import { setAdaptiveTheme } from "./adaptiveStyles";

interface ThemeContextValue {
  theme: SemanticTheme;
  isDark: boolean;
  isHighContrast: boolean;
  textScale: number;
  reduceMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const { preferences } = useAccessibilityPreferences();
  const resolvedMode = preferences.appearance === "system" ? (systemScheme === "dark" ? "dark" : "light") : preferences.appearance;
  const value = useMemo<ThemeContextValue>(() => ({
    theme: resolvedMode === "dark" ? darkTheme : resolvedMode === "high_contrast" ? highContrastTheme : lightTheme,
    isDark: resolvedMode === "dark" || resolvedMode === "high_contrast",
    isHighContrast: resolvedMode === "high_contrast",
    textScale: preferences.textSize === "large" ? 1.18 : 1,
    reduceMotion: preferences.reduceMotion
  }), [preferences.reduceMotion, preferences.textSize, resolvedMode]);
  setAdaptiveTheme(value.theme, value.isHighContrast);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
