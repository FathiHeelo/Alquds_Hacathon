import { StatusBar } from "expo-status-bar";
import { registerRootComponent } from "expo";

import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { AppProviders } from "./src/app/providers/AppProviders";

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
      <StatusBar style="dark" />
    </AppProviders>
  );
}

registerRootComponent(App);
