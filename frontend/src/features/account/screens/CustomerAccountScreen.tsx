import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList, CustomerTabParamList } from "../../../app/navigation/navigation.types";
import { useDemoSession } from "../../../app/providers/DemoSessionProvider";
import { colors, shadows, typography, useTheme } from "../../../shared/theme";
import { appConfig } from "../../../app/config/appConfig";
import { apiClient } from "../../../services/api/apiClient";
import { repairRequestRepository, rewardRepository } from "../../../services/repositories";

type AccountNavigation = CompositeNavigationProp<BottomTabNavigationProp<CustomerTabParamList, "CustomerAccount">, NativeStackNavigationProp<CustomerStackParamList>>;

const menuItems = [
  { icon: "person-outline", title: "المعلومات الشخصية", subtitle: "الاسم ورقم الهاتف", color: "#8C6D14", background: "#FFF4C8" },
  { icon: "location-outline", title: "عناويني", subtitle: "المنزل ومواقع الصيانة", color: "#1D4ED8", background: "#DBEAFE" },
  { icon: "card-outline", title: "طرق الدفع", subtitle: "إدارة وسائل الدفع والفواتير", color: "#047857", background: "#D1FAE5" },
  { icon: "notifications-outline", title: "الإشعارات", subtitle: "تنبيهات الطلبات والعروض", color: "#7C3AED", background: "#EDE9FE", route: "notifications" },
  { icon: "settings-outline", title: "الإعدادات والخصوصية", subtitle: "اللغة والمظهر وإمكانية الوصول", color: "#0F766E", background: "#CCFBF1", route: "settings" },
  { icon: "help-circle-outline", title: "المساعدة والدعم", subtitle: "تواصل مع فريق عَمِّرها", color: "#475569", background: "#E2E8F0" }
] as const;

export function CustomerAccountScreen() {
  const navigation = useNavigation<AccountNavigation>();
  const { logout } = useDemoSession();
  const { theme, isDark } = useTheme();
  const [account, setAccount] = useState<{ name?: string; phone?: string | null; email?: string | null }>();
  const [requestCount, setRequestCount] = useState<number>();
  const [points, setPoints] = useState<number>();
  useEffect(() => {
    if (appConfig.demoMode) { setAccount({ name: "أحمد ناصر", phone: "+970 59 123 4567" }); setRequestCount(12); setPoints(850); return; }
    let active = true;
    void apiClient.request<{ name?: string; phone?: string | null; email?: string | null }>("/users/me", undefined, "customer").then((value) => { if (active) setAccount(value); }).catch(() => { if (active) setAccount(undefined); });
    void repairRequestRepository.listMine().then((items) => { if (active) setRequestCount(items.length); }).catch(() => { if (active) setRequestCount(undefined); });
    void rewardRepository.getAccount().then((value) => { if (active) setPoints(value.balance); }).catch(() => { if (active) setPoints(undefined); });
    return () => { active = false; };
  }, []);
  return <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: theme.background }]}>
    <View style={[styles.header, { backgroundColor: theme.background }]}><View><LocalizedText style={styles.title}>حسابي</LocalizedText><LocalizedText style={styles.subtitle}>إدارة بياناتك وخدماتك في عَمِّرها</LocalizedText></View><Pressable accessibilityLabel="إمكانية الوصول والمظهر" accessibilityRole="button" onPress={() => navigation.navigate("CustomerSettings")} style={styles.headerIcon}><Ionicons name="settings-outline" size={21} color={theme.primaryPressed} /></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.profileCard, { backgroundColor: isDark ? theme.surfaceElevated : colors.secondary, borderColor: theme.border }]}>
        <View style={styles.profileGlow} />
        <Image accessibilityLabel="صورة العميل" source={require("../../../../assets/customers/customer-default.jpg")} style={styles.avatarImage} />
        <View style={styles.profileCopy}><View style={styles.nameRow}><LocalizedText style={styles.name}>{account?.name ?? "أحمد المقدسي"}</LocalizedText><Ionicons name="checkmark-circle" size={14} color="#6EE7B7" /></View><LocalizedText style={styles.phone}>{account?.phone ?? "0590000001"}</LocalizedText><LocalizedText style={styles.profileMeta}>{account?.email ?? "customer@ammerha.demo"}</LocalizedText><View style={styles.location}><Ionicons name="location" size={12} color="#D6B24D" /><LocalizedText style={styles.locationText}>شارع صلاح الدين، القدس</LocalizedText></View></View>
        <Pressable onPress={() => Alert.alert("تعديل الحساب", "يمكنك تعديل معلومات الحساب من هنا.")} style={styles.editButton}><Ionicons name="create-outline" size={16} color="white" /></Pressable>
      </View>

      <View style={styles.stats}>
        <Pressable onPress={() => navigation.navigate("CustomerRequests")} style={styles.stat}><Ionicons name="construct" size={19} color="#8C6D14" /><LocalizedText style={styles.statValue}>{requestCount ?? "—"}</LocalizedText><LocalizedText style={styles.statLabel}>طلب صيانة</LocalizedText></Pressable>
        <View style={styles.statDivider} />
        <Pressable onPress={() => navigation.navigate("CustomerRewards")} style={styles.stat}><Ionicons name="star" size={19} color="#8C6D14" /><LocalizedText style={styles.statValue}>{points ?? "—"}</LocalizedText><LocalizedText style={styles.statLabel}>نقطة مكافأة</LocalizedText></Pressable>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Ionicons name="heart" size={19} color="#8C6D14" /><LocalizedText style={styles.statValue}>—</LocalizedText><LocalizedText style={styles.statLabel}>فنيون مفضلون</LocalizedText></View>
      </View>

      <View style={styles.loyaltyCard}><View style={styles.loyaltyIcon}><Ionicons name="ribbon" size={22} color="#8C6D14" /></View><View style={styles.loyaltyCopy}><LocalizedText style={styles.loyaltyTitle}>عضو عَمِّرها الذهبي</LocalizedText><LocalizedText style={styles.loyaltyText}>رصيدك الحالي {points ?? "—"} نقطة في برنامج المكافآت</LocalizedText><View style={styles.progress}><View style={styles.progressFill} /></View></View><Pressable onPress={() => navigation.navigate("CustomerRewards")}><Ionicons name="chevron-back" size={19} color="#8C6D14" /></Pressable></View>

      <LocalizedText style={styles.sectionTitle}>إعدادات الحساب</LocalizedText>
      <View style={styles.menuCard}>{menuItems.map((item, index) => <Pressable key={item.title} onPress={() => "route" in item && item.route === "settings" ? navigation.navigate("CustomerSettings") : "route" in item && item.route === "notifications" ? navigation.navigate("CustomerNotifications") : Alert.alert(item.title, "بيانات العرض جاهزة، وسيتم حفظ أي تعديل من خلال نموذج الإضافة المخصص.")} style={({ pressed }) => [styles.menuItem, index < menuItems.length - 1 && styles.menuDivider, pressed && styles.pressed]}><View style={[styles.menuIcon, { backgroundColor: item.background }]}><Ionicons name={item.icon} size={19} color={item.color} /></View><View style={styles.menuCopy}><LocalizedText style={styles.menuTitle}>{item.title}</LocalizedText><LocalizedText style={styles.menuSubtitle}>{item.subtitle}</LocalizedText></View><Ionicons name="chevron-back" size={17} color="#94A3B8" /></Pressable>)}</View>

      <Pressable onPress={logout} style={styles.logout}><Ionicons name="log-out-outline" size={18} color="#BE123C" /><LocalizedText style={styles.logoutText}>العودة لاختيار الدور</LocalizedText></Pressable>
      <LocalizedText style={styles.version}>عَمِّرها • الإصدار 1.0.0</LocalizedText>
    </ScrollView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingBottom: 12, paddingHorizontal: 16, paddingTop: 10 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "right" }, headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, content: { padding: 14, paddingBottom: 30 },
  profileCard: { ...shadows.raised, alignItems: "center", borderRadius: 22, borderWidth: 1, flexDirection: "row-reverse", gap: 11, overflow: "hidden", padding: 15 }, profileGlow: { backgroundColor: "rgba(197,155,39,0.14)", borderRadius: 90, height: 180, left: -50, position: "absolute", top: -65, width: 180 }, avatarImage: { borderColor: colors.primary, borderRadius: 32, borderWidth: 2, height: 64, width: 64 }, profileCopy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, name: { color: "white", fontFamily: typography.fontFamily, fontSize: 17, fontWeight: "800" }, phone: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 10, marginTop: 2, textAlign: "right" }, profileMeta: { color: "#AAB8B1", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, location: { alignItems: "center", flexDirection: "row-reverse", gap: 3, marginTop: 5 }, locationText: { color: "#D6B24D", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, editButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 11, height: 36, justifyContent: "center", width: 36 },
  stats: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, flexDirection: "row-reverse", marginTop: 12, paddingVertical: 12 }, stat: { alignItems: "center", flex: 1, gap: 2 }, statValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800" }, statLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, textAlign: "center" }, statDivider: { backgroundColor: "#ECE7DC", height: 35, width: 1 },
  loyaltyCard: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 9, marginTop: 12, padding: 12 }, loyaltyIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 11, height: 40, justifyContent: "center", width: 40 }, loyaltyCopy: { flex: 1 }, loyaltyTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, loyaltyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, progress: { backgroundColor: "#F3E2AB", borderRadius: 4, height: 5, marginTop: 6, overflow: "hidden" }, progressFill: { backgroundColor: colors.primary, borderRadius: 4, height: 5, width: "85%" },
  sectionTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "800", marginBottom: 8, marginTop: 18, textAlign: "right" }, menuCard: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, overflow: "hidden" }, menuItem: { alignItems: "center", flexDirection: "row-reverse", gap: 10, minHeight: 64, paddingHorizontal: 12 }, menuDivider: { borderBottomColor: "#F0ECE3", borderBottomWidth: 1 }, menuIcon: { alignItems: "center", borderRadius: 11, height: 38, justifyContent: "center", width: 38 }, menuCopy: { flex: 1 }, menuTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700", textAlign: "right" }, menuSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, pressed: { backgroundColor: "#FAFAF9" }, logout: { alignItems: "center", backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 6, justifyContent: "center", marginTop: 14, minHeight: 46 }, logoutText: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700" }, version: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 12, textAlign: "center" }
});
