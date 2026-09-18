import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { tabOptions } from "./tabOptions";

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerTabs() {
  return (
    <Tab.Navigator initialRouteName="CustomerMap" screenOptions={{ lazy: true }} tabBar={(props) => <CustomerTabBar {...props} />}>
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

function CustomerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const stackNavigation = navigation.getParent<NativeStackNavigationProp<CustomerStackParamList>>();
  const tabs = [
    { route: "CustomerMap" as const, icon: "map-outline" as const, label: uiText.customer.map },
    { route: "CustomerRequests" as const, icon: "document-text-outline" as const, label: uiText.customer.requests },
    { route: "CustomerRewards" as const, icon: "star-outline" as const, label: uiText.customer.rewards },
    { route: "CustomerAccount" as const, icon: "person-outline" as const, label: uiText.customer.account }
  ];

  return (
    <View style={[footerStyles.footer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.slice(0, 2).map((tab) => <CustomerTabButton descriptors={descriptors} key={tab.route} navigation={navigation} state={state} {...tab} />)}
      <Pressable
        accessibilityLabel="طلب صيانة جديد"
        accessibilityRole="button"
        onPress={() => stackNavigation?.navigate("CustomerRepairRequest", {})}
        style={({ pressed }) => [footerStyles.plusButton, pressed && footerStyles.plusPressed]}
      >
        <Ionicons color={colors.neutral} name="add" size={26} />
      </Pressable>
      {tabs.slice(2).map((tab) => <CustomerTabButton descriptors={descriptors} key={tab.route} navigation={navigation} state={state} {...tab} />)}
    </View>
  );
}

type CustomerTabButtonProps = Pick<BottomTabBarProps, "state" | "descriptors" | "navigation"> & { route: keyof CustomerTabParamList; icon: keyof typeof Ionicons.glyphMap; label: string };

function CustomerTabButton({ route, icon, label, state, descriptors, navigation }: CustomerTabButtonProps) {
  const isFocused = state.routes[state.index]?.name === route;
  const routeState = state.routes.find((item) => item.name === route);
  const descriptor = routeState ? descriptors[routeState.key] : undefined;
  return (
    <Pressable
      accessibilityLabel={descriptor?.options.tabBarAccessibilityLabel ?? label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      onPress={() => navigation.navigate(route)}
      style={footerStyles.tab}
    >
      <Ionicons color={isFocused ? colors.primaryPressed : colors.textMuted} name={icon} size={21} />
      <Text style={[footerStyles.label, isFocused && footerStyles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const footerStyles = StyleSheet.create({
  footer: { alignItems: "center", backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, elevation: 5, flexDirection: "row-reverse", justifyContent: "space-around", minHeight: 70, paddingHorizontal: 8, shadowColor: colors.neutral, shadowOffset: { height: -2, width: 0 }, shadowOpacity: 0.12, shadowRadius: 7 },
  tab: { alignItems: "center", flex: 1, gap: 2, justifyContent: "center", minHeight: 56 },
  label: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: typography.weight.semibold, writingDirection: "rtl" },
  activeLabel: { color: colors.primaryPressed },
  plusButton: { alignItems: "center", backgroundColor: colors.primary, borderColor: colors.background, borderRadius: 999, borderWidth: 4, elevation: 7, height: 58, justifyContent: "center", marginHorizontal: 4, marginTop: -25, shadowColor: colors.neutral, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.2, shadowRadius: 7, width: 58 },
  plusPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.93 }] }
});

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
