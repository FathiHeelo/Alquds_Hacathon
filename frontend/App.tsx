import { StatusBar } from "expo-status-bar";
import { registerRootComponent } from "expo";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { AppProviders } from "./src/app/providers/AppProviders";
import { colors, typography } from "./src/shared/theme";

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
      <View style={styles.logoMark}>
        <Text style={styles.logoText}>عَمِّرها</Text>
        <View style={styles.logoRule} />
        <Text style={styles.communityText}>أهل القدس</Text>
      </View>
      <Text style={styles.tagline}>من قلب القدس نبنيها بأيدينا</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: "center",
    backgroundColor: "#F8F7F4",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: colors.neutral,
    borderColor: colors.primary,
    borderRadius: 28,
    borderWidth: 2,
    paddingHorizontal: 30,
    paddingVertical: 24,
    shadowColor: "#132A24",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 30
  },
  logoText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 56,
    textAlign: "center",
    writingDirection: "rtl"
  },
  logoRule: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 3,
    marginVertical: 8,
    width: 72
  },
  communityText: {
    color: colors.secondary,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
    textAlign: "center",
    writingDirection: "rtl"
  },
  tagline: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 18,
    textAlign: "center",
    writingDirection: "rtl"
  }
});
