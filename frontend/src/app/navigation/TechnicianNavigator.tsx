import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TechnicianAiAssistantScreen } from "../../features/technician/screens/TechnicianAiAssistantScreen";
import { TechnicianHomeScreen } from "../../features/shell/screens/TechnicianHomeScreen";
import { TechnicianRequestScreen } from "../../features/technician/screens/TechnicianRequestScreen";
import { TechnicianOfferScreen } from "../../features/technician/screens/TechnicianOfferScreen";
import { TechnicianProScreen } from "../../features/technician/screens/TechnicianProScreen";
import { TechnicianJobsScreen } from "../../features/technician/screens/TechnicianJobsScreen";
import { TechnicianMessagesScreen } from "../../features/technician/screens/TechnicianMessagesScreen";
import { TechnicianAccountScreen } from "../../features/technician/screens/TechnicianAccountScreen";
import { TechnicianProfileDemoScreen } from "../../features/technician/screens/TechnicianProfileDemoScreen";
import { TechnicianChatScreen } from "../../features/technician/screens/TechnicianChatScreen";
import { TechnicianJobDetailsScreen } from "../../features/technician/screens/TechnicianJobDetailsScreen";
import { TechnicianAccountDetailScreen } from "../../features/technician/screens/TechnicianAccountDetailScreen";
import { uiText } from "../../shared/constants/uiText";
import { typography, useTheme } from "../../shared/theme";
import { useI18n } from "../../shared/i18n/I18nProvider";
import type { TechnicianStackParamList, TechnicianTabParamList } from "./navigation.types";
import { tabOptions } from "./tabOptions";
import { AccessibilitySettingsScreen } from "../../features/settings/screens/AccessibilitySettingsScreen";

const Tab = createBottomTabNavigator<TechnicianTabParamList>();
const Stack = createNativeStackNavigator<TechnicianStackParamList>();

function TechnicianTabs() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <Tab.Navigator initialRouteName="TechnicianRequests" screenOptions={{ lazy: true }}>
      <Tab.Screen name="TechnicianRequests" component={TechnicianHomeScreen} options={{ ...tabOptions("map-outline", theme), title: t("navigation.mapRequests") }} />
      <Tab.Screen name="TechnicianJobs" component={TechnicianJobsScreen} options={{ ...tabOptions("briefcase-outline", theme), title: t("navigation.jobs") }} />
      <Tab.Screen name="TechnicianMessages" component={TechnicianMessagesScreen} options={{ ...tabOptions("chatbubble-ellipses-outline", theme), title: t("navigation.messages") }} />
      <Tab.Screen name="TechnicianAccount" component={TechnicianAccountScreen} options={{ ...tabOptions("person-outline", theme), title: t("navigation.account") }} />
    </Tab.Navigator>
  );
}

export function TechnicianNavigator() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: t("common.back"),
        headerStyle: { backgroundColor: theme.navigationBackground },
        headerTintColor: theme.text,
        headerTitleAlign: "center",
        headerTitleStyle: { fontFamily: typography.fontFamily, fontWeight: typography.weight.bold }
      }}
    >
      <Stack.Screen name="TechnicianTabs" component={TechnicianTabs} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianProfile" options={{ headerShown: false }}>
        {({ navigation }) => <TechnicianProfileDemoScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="TechnicianPro" options={{ headerShown: false }}>
        {({ navigation }) => <TechnicianProScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="TechnicianRequestDetails" component={TechnicianRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianCreateOffer" component={TechnicianOfferScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianChat" component={TechnicianChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianJobDetails" component={TechnicianJobDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianAccountDetail" component={TechnicianAccountDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianPreferences" component={AccessibilitySettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechnicianAiAssistant" options={{ headerShown: false }}>
        {({ route, navigation }) => <TechnicianAiAssistantScreen route={route} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
