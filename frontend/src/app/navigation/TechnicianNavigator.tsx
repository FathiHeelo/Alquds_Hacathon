import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { PlaceholderScreen } from "../../features/shell/screens/PlaceholderScreen";
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
      <Tab.Screen name="TechnicianJobs" component={TechnicianJobsScreen} options={{ ...tabOptions("briefcase-outline"), title: uiText.technician.jobs }} />
      <Tab.Screen name="TechnicianMessages" component={TechnicianMessagesScreen} options={{ ...tabOptions("chatbubble-ellipses-outline"), title: uiText.technician.messages }} />
      <Tab.Screen name="TechnicianAccount" component={TechnicianAccountScreen} options={{ ...tabOptions("person-outline"), title: uiText.technician.account }} />
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
        {() => <TechnicianProfileDemoScreen />}
      </Stack.Screen>
      <Stack.Screen name="TechnicianPro" options={{ title: uiText.technician.pro }}>
        {() => <TechnicianProScreen />}
      </Stack.Screen>
      <Stack.Screen name="TechnicianRequestDetails" component={TechnicianRequestScreen} options={{ title: "تفاصيل الطلب" }} />
      <Stack.Screen name="TechnicianCreateOffer" component={TechnicianOfferScreen} options={{ title: "إنشاء عرض" }} />
      <Stack.Screen name="TechnicianChat" component={TechnicianChatScreen} options={{ title: "المحادثة" }} />
      <Stack.Screen name="TechnicianAiAssistant" options={{ title: uiText.technician.aiAssistant }}>
        {({ route, navigation }) => <TechnicianAiAssistantScreen route={route} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
