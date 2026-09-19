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
import { CustomerMessagesScreen } from "../../features/jobs/screens/CustomerMessagesScreen";
import { CustomerRequestsScreen } from "../../features/jobs/screens/CustomerRequestsScreen";
import { CustomerRequestDetailsScreen } from "../../features/jobs/screens/CustomerRequestDetailsScreen";
import { CustomerAccountScreen } from "../../features/account/screens/CustomerAccountScreen";
import { uiText } from "../../shared/constants/uiText";
import { colors, typography, useTheme } from "../../shared/theme";
import { useI18n } from "../../shared/i18n/I18nProvider";
import type { CustomerStackParamList, CustomerTabParamList } from "./navigation.types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { tabOptions } from "./tabOptions";
import { AccessibilitySettingsScreen } from "../../features/settings/screens/AccessibilitySettingsScreen";

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerTabs() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <Tab.Navigator initialRouteName="CustomerMap" screenOptions={{ lazy: true }} tabBar={(props) => <CustomerTabBar {...props} />}>
      <Tab.Screen name="CustomerMap" component={CustomerMapScreen} options={{ ...tabOptions("map-outline", theme), title: t("navigation.home") }} />
      <Tab.Screen name="CustomerRequests" component={CustomerRequestsScreen} options={{ ...tabOptions("document-text-outline", theme), title: t("navigation.requests") }} />
      <Tab.Screen name="CustomerMessages" component={CustomerMessagesScreen} options={{ ...tabOptions("chatbubble-ellipses-outline", theme), title: t("navigation.messages") }} />
      <Tab.Screen name="CustomerRewards" component={RewardsScreen} options={{ ...tabOptions("star-outline", theme), title: t("navigation.rewards") }} />
      <Tab.Screen name="CustomerAccount" component={CustomerAccountScreen} options={{ ...tabOptions("person-outline", theme), title: t("navigation.account") }} />
    </Tab.Navigator>
  );
}

function CustomerTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, isRTL } = useI18n();
  const stackNavigation = navigation.getParent<NativeStackNavigationProp<CustomerStackParamList>>();
  const tabs = [
    { route: "CustomerMap" as const, icon: "map-outline" as const, label: t("navigation.home") },
    { route: "CustomerRequests" as const, icon: "document-text-outline" as const, label: t("navigation.requests") },
    { route: "CustomerMessages" as const, icon: "chatbubbles-outline" as const, label: t("navigation.messages") },
    { route: "CustomerRewards" as const, icon: "star-outline" as const, label: t("navigation.rewards") }
  ];

  return (
    <View style={[footerStyles.footer, { backgroundColor: theme.navigationBackground, borderTopColor: theme.border, flexDirection: isRTL ? "row-reverse" : "row", paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.slice(0, 2).map((tab) => <CustomerTabButton descriptors={descriptors} key={tab.route} navigation={navigation} state={state} {...tab} />)}
      <Pressable
        accessibilityLabel={t("navigation.requests")}
        accessibilityRole="button"
        onPress={() => stackNavigation?.navigate("CustomerRepairRequest", {})}
        style={({ pressed }) => [footerStyles.plusButton, { backgroundColor: theme.primary, borderColor: theme.primarySoft, shadowColor: theme.primaryPressed }, pressed && footerStyles.plusPressed]}
      >
        <Ionicons color={colors.neutral} name="add" size={26} />
      </Pressable>
      {tabs.slice(2).map((tab) => <CustomerTabButton descriptors={descriptors} key={tab.route} navigation={navigation} state={state} {...tab} />)}
    </View>
  );
}

type CustomerTabButtonProps = Pick<BottomTabBarProps, "state" | "descriptors" | "navigation"> & { route: keyof CustomerTabParamList; icon: keyof typeof Ionicons.glyphMap; label: string };

function CustomerTabButton({ route, icon, label, state, descriptors, navigation }: CustomerTabButtonProps) {
  const { theme } = useTheme();
  const { isRTL } = useI18n();
  const isFocused = state.routes[state.index]?.name === route;
  const routeState = state.routes.find((item) => item.name === route);
  const descriptor = routeState ? descriptors[routeState.key] : undefined;
  return (
    <Pressable
      accessibilityLabel={descriptor?.options.tabBarAccessibilityLabel ?? label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      onPress={() => {
        if (!routeState) return;
        const event = navigation.emit({ type: "tabPress", target: routeState.key, canPreventDefault: true });
        if (!isFocused && !event.defaultPrevented) navigation.navigate(route);
      }}
      style={footerStyles.tab}
    >
      <Ionicons color={isFocused ? theme.primaryPressed : theme.textMuted} name={icon} size={20} />
      <Text style={[footerStyles.label, { color: isFocused ? theme.primaryPressed : theme.textMuted, writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text>
    </Pressable>
  );
}

const footerStyles = StyleSheet.create({
  footer: { alignItems: "center", backgroundColor: colors.background, borderTopColor: "#F3F1EC", borderTopWidth: 1, justifyContent: "space-around", paddingHorizontal: 8 },
  tab: { alignItems: "center", flex: 1, gap: 2, justifyContent: "center", minHeight: 56 },
  label: { color: "#AAB5C6", fontFamily: typography.fontFamily, fontSize: 10, fontWeight: typography.weight.semibold, writingDirection: "rtl" },
  activeLabel: { color: colors.primaryPressed },
  plusButton: { alignItems: "center", backgroundColor: colors.primary, borderColor: "#F8EDB8", borderRadius: 999, borderWidth: 2, elevation: 5, height: 42, justifyContent: "center", marginHorizontal: 12, marginTop: -10, shadowColor: colors.primaryPressed, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.2, shadowRadius: 5, width: 42 },
  plusPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.93 }] }
});

export function CustomerNavigator() {
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
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerTechnicianProfile" component={TechnicianProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerRepairRequest" component={RepairRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerAiEntry" component={AiCustomerFlowScreen} options={{ title: "التشخيص الذكي" }} />
      <Stack.Screen name="CustomerOffersEntry" component={OffersScreen} options={{ title: "عروض الفنيين" }} />
      <Stack.Screen name="CustomerOfferDetails" component={OfferDetailsScreen} options={{ title: "تفاصيل العرض" }} />
      <Stack.Screen name="CustomerJobEntry" component={CustomerJobEntryScreen} options={{ title: "تأكيد المهمة" }} />
      <Stack.Screen name="CustomerJob" component={CustomerJobScreen} options={{ title: "المهمة النشطة" }} />
      <Stack.Screen name="CustomerRating" component={CustomerRatingScreen} options={{ title: "تقييم الفني" }} />
      <Stack.Screen name="CustomerNotifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerChat" component={CustomerChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerRequestDetails" component={CustomerRequestDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerSettings" component={AccessibilitySettingsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
