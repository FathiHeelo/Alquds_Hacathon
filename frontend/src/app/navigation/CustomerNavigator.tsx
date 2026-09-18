import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CustomerMapScreen } from "../../features/map/screens/CustomerMapScreen";
import { RepairRequestScreen } from "../../features/repair-request/screens/RepairRequestScreen";
import { AiCustomerFlowScreen } from "../../features/ai-diagnosis/screens/AiCustomerFlowScreen";
import { CustomerOffersEntryScreen } from "../../features/ai-diagnosis/screens/CustomerOffersEntryScreen";
import { OffersScreen } from "../../features/offers/screens/OffersScreen";
import { OfferDetailsScreen } from "../../features/offers/screens/OfferDetailsScreen";
import { TechnicianProfileScreen } from "../../features/offers/screens/TechnicianProfileScreen";
import { CustomerJobEntryScreen } from "../../features/offers/screens/CustomerJobEntryScreen";
import { CustomerJobScreen } from "../../features/jobs/screens/CustomerJobScreen";
import { CustomerRatingScreen } from "../../features/jobs/screens/CustomerRatingScreen";
import { RewardsScreen } from "../../features/rewards/screens/RewardsScreen";
import { NotificationsScreen } from "../../features/notifications/screens/NotificationsScreen";
import { CustomerChatScreen } from "../../features/jobs/screens/CustomerChatScreen";
import { PlaceholderScreen } from "../../features/shell/screens/PlaceholderScreen";
import { uiText } from "../../shared/constants/uiText";
import { colors, typography } from "../../shared/theme";
import type { CustomerStackParamList, CustomerTabParamList } from "./navigation.types";
import { tabOptions } from "./tabOptions";

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerTabs() {
  return (
    <Tab.Navigator initialRouteName="CustomerMap" screenOptions={{ lazy: true }}>
      <Tab.Screen name="CustomerMap" component={CustomerMapScreen} options={{ ...tabOptions("map-outline"), title: uiText.customer.map }} />
      <Tab.Screen name="CustomerRequests" options={{ ...tabOptions("document-text-outline"), title: uiText.customer.requests }}>
        {() => <PlaceholderScreen title={uiText.customer.requests} />}
      </Tab.Screen>
      <Tab.Screen name="CustomerMessages" options={{ ...tabOptions("chatbubble-ellipses-outline"), title: uiText.customer.messages }}>
        {() => <PlaceholderScreen title={uiText.customer.messages} />}
      </Tab.Screen>
      <Tab.Screen name="CustomerRewards" component={RewardsScreen} options={{ ...tabOptions("star-outline"), title: uiText.customer.rewards }} />
      <Tab.Screen name="CustomerAccount" options={{ ...tabOptions("person-outline"), title: uiText.customer.account }}>
        {() => <PlaceholderScreen title={uiText.customer.account} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function CustomerNavigator() {
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
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerTechnicianProfile" component={TechnicianProfileScreen} options={{ title: uiText.map.profile }} />
      <Stack.Screen name="CustomerRepairRequest" component={RepairRequestScreen} options={{ title: uiText.map.repairRequest }} />
      <Stack.Screen name="CustomerAiEntry" component={AiCustomerFlowScreen} options={{ title: "التشخيص الذكي" }} />
      <Stack.Screen name="CustomerOffersEntry" component={OffersScreen} options={{ title: "عروض الفنيين" }} />
      <Stack.Screen name="CustomerOfferDetails" component={OfferDetailsScreen} options={{ title: "تفاصيل العرض" }} />
      <Stack.Screen name="CustomerJobEntry" component={CustomerJobEntryScreen} options={{ title: "تأكيد المهمة" }} />
      <Stack.Screen name="CustomerJob" component={CustomerJobScreen} options={{ title: "المهمة النشطة" }} />
      <Stack.Screen name="CustomerRating" component={CustomerRatingScreen} options={{ title: "تقييم الفني" }} />
      <Stack.Screen name="CustomerNotifications" component={NotificationsScreen} options={{ title: "التنبيهات" }} />
      <Stack.Screen name="CustomerChat" component={CustomerChatScreen} options={{ title: "المحادثة" }} />
    </Stack.Navigator>
  );
}
