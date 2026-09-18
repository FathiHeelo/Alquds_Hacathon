import type { PropsWithChildren } from "react";
import { I18nManager } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DemoSessionProvider } from "./DemoSessionProvider";

I18nManager.allowRTL(true);

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <DemoSessionProvider>{children}</DemoSessionProvider>
    </SafeAreaProvider>
  );
}
