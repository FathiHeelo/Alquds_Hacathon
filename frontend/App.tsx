import { StatusBar } from "expo-status-bar";
import { registerRootComponent } from "expo";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { AppProviders } from "./src/app/providers/AppProviders";

const ammerhaLogo = require("./assets/brand/ammerha-logo.png");

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProviders>
      {showSplash ? <BrandSplash /> : <RootNavigator />}
      <StatusBar style="dark" />
    </AppProviders>
  );
}

registerRootComponent(App);

function BrandSplash() {
  return (
    <View style={styles.splash}>
      <Image source={ammerhaLogo} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#FFFFFF"
  },
  logo: { height: 300, resizeMode: "contain", width: 300 }
});
