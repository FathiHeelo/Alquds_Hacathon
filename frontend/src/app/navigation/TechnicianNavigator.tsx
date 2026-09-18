import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { PlaceholderScreen } from "../../features/shell/screens/PlaceholderScreen";
import { TechnicianHomeScreen } from "../../features/shell/screens/TechnicianHomeScreen";
import { uiText } from "../../shared/constants/uiText";
import { colors, typography } from "../../shared/theme";
import type { TechnicianStackParamList, TechnicianTabParamList } from "./navigation.types";
import { tabOptions } from "./tabOptions";

const Tab = createBottomTabNavigator<TechnicianTabParamList>();
const Stack = createNativeStackNavigator<TechnicianStackParamList>();

function TechnicianTabs() {
  return (
    <Tab.Navigator initialRouteName="TechnicianRequests" screenOptions={{ lazy: true }}>
      <Tab.Screen name="TechnicianRequests" component={TechnicianHomeScreen} options={{ ...tabOptions("map-outline"), title: uiText.technician.requests }} />
      <Tab.Screen name="TechnicianJobs" options={{ ...tabOptions("briefcase-outline"), title: uiText.technician.jobs }}>
        {() => <PlaceholderScreen title={uiText.technician.jobs} />}
      </Tab.Screen>
      <Tab.Screen name="TechnicianMessages" options={{ ...tabOptions("chatbubble-ellipses-outline"), title: uiText.technician.messages }}>
        {() => <PlaceholderScreen title={uiText.technician.messages} />}
      </Tab.Screen>
      <Tab.Screen name="TechnicianAccount" options={{ ...tabOptions("person-outline"), title: uiText.technician.account }}>
        {() => <PlaceholderScreen title={uiText.technician.account} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function TechnicianNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: uiText.common.back,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleAlign: "center",
        headerTitleStyle: { fontFamily: typography.fontFamily, fontWeight: typography.weight.bold }
      }}
    >
      <Stack.Screen name="TechnicianTabs" component={TechnicianTabs} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianProfile" options={{ title: uiText.technician.profile }}>
        {() => <PlaceholderScreen title={uiText.technician.profile} />}
      </Stack.Screen>
      <Stack.Screen name="TechnicianPro" options={{ title: uiText.technician.pro }}>
        {() => <PlaceholderScreen title={uiText.technician.pro} />}
      </Stack.Screen>
      <Stack.Screen name="TechnicianAiAssistant" options={{ title: uiText.technician.aiAssistant }}>
        {() => <PlaceholderScreen title={uiText.technician.aiAssistant} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
