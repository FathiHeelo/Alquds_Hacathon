import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import { appConfig } from "./src/app/config/appConfig";

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>AMMERHA</Text>
      <Text style={{ marginTop: 8, textAlign: "center" }}>
        Frontend foundation ready in {appConfig.aiMode} mode.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
