import { StatusBar } from "expo-status-bar";
import { registerRootComponent } from "expo";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { AppProviders } from "./src/app/providers/AppProviders";
import { useTheme } from "./src/shared/theme";

const ammerhaLogo = require("./assets/brand/ammerha-logo.png");

export default function App() {
  return <AppProviders><AppContent /></AppProviders>;
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { theme, isDark, reduceMotion } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), reduceMotion ? 350 : 1200);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <>
      {showSplash ? <BrandSplash backgroundColor={theme.background} /> : <RootNavigator />}
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

registerRootComponent(App);

function BrandSplash({ backgroundColor }: { backgroundColor: string }) {
  return (
    <View style={[styles.splash, { backgroundColor }]}>
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
  },
  logo: { height: 300, resizeMode: "contain", width: 300 }
});
