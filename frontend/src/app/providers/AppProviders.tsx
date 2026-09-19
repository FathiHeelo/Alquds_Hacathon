import type { PropsWithChildren } from "react";
import { I18nManager } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { I18nProvider } from "../../shared/i18n/I18nProvider";
import { AccessibilityPreferencesProvider } from "../../shared/preferences/AccessibilityPreferencesProvider";
import { ThemeProvider } from "../../shared/theme";
import { DemoSessionProvider } from "./DemoSessionProvider";

I18nManager.allowRTL(true);

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <AccessibilityPreferencesProvider>
        <I18nProvider>
          <ThemeProvider><DemoSessionProvider>{children}</DemoSessionProvider></ThemeProvider>
        </I18nProvider>
      </AccessibilityPreferencesProvider>
    </SafeAreaProvider>
  );
}
