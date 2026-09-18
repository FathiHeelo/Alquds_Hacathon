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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: colors.background, // Premium off-white
  },

  logoMark: {
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 24,

    paddingHorizontal: 34,
    paddingVertical: 26,

    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,

    elevation: 5,
  },

  logoText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 54,

    textAlign: "center",
    writingDirection: "rtl",
  },

  logoRule: {
    width: 68,
    height: 3,
    marginVertical: 10,

    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  communityText: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 25,

    textAlign: "center",
    writingDirection: "rtl",
  },

  tagline: {
    marginTop: 16,

    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 21,

    textAlign: "center",
    writingDirection: "rtl",
  },
});