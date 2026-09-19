import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerTabParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";

type AccountNavigation = BottomTabNavigationProp<CustomerTabParamList, "CustomerAccount">;

const menuItems = [
  { icon: "person-outline", title: "المعلومات الشخصية", subtitle: "الاسم ورقم الهاتف", color: "#8C6D14", background: "#FFF4C8" },
  { icon: "location-outline", title: "عناويني", subtitle: "المنزل ومواقع الصيانة", color: "#1D4ED8", background: "#DBEAFE" },
  { icon: "card-outline", title: "طرق الدفع", subtitle: "إدارة وسائل الدفع والفواتير", color: "#047857", background: "#D1FAE5" },
  { icon: "notifications-outline", title: "الإشعارات", subtitle: "تنبيهات الطلبات والعروض", color: "#7C3AED", background: "#EDE9FE" },
  { icon: "shield-checkmark-outline", title: "الأمان والخصوصية", subtitle: "حماية حسابك وحقوقك", color: "#0F766E", background: "#CCFBF1" },
  { icon: "help-circle-outline", title: "المساعدة والدعم", subtitle: "تواصل مع فريق عَمِّرها", color: "#475569", background: "#E2E8F0" }
] as const;

export function CustomerAccountScreen() {
  const navigation = useNavigation<AccountNavigation>();
  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}><View><Text style={styles.title}>حسابي</Text><Text style={styles.subtitle}>إدارة بياناتك وخدماتك في عَمِّرها</Text></View><Pressable onPress={() => Alert.alert("الإعدادات", "إعدادات الحساب جاهزة للتخصيص.")} style={styles.headerIcon}><Ionicons name="settings-outline" size={21} color={colors.primaryPressed} /></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.profileGlow} />
        <View style={styles.avatar}><Ionicons name="person" size={40} color={colors.primary} /></View>
        <View style={styles.profileCopy}><View style={styles.nameRow}><Text style={styles.name}>أحمد ناصر</Text><Ionicons name="checkmark-circle" size={16} color={colors.primary} /></View><Text style={styles.phone}>+970 59 123 4567</Text><View style={styles.location}><Ionicons name="location" size={12} color="#D6B24D" /><Text style={styles.locationText}>البلدة القديمة، القدس</Text></View></View>
        <Pressable onPress={() => Alert.alert("تعديل الحساب", "يمكنك تعديل معلومات الحساب من هنا.")} style={styles.editButton}><Ionicons name="create-outline" size={16} color="white" /></Pressable>
      </View>

      <View style={styles.stats}>
        <Pressable onPress={() => navigation.navigate("CustomerRequests")} style={styles.stat}><Ionicons name="construct" size={19} color="#8C6D14" /><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>طلب صيانة</Text></Pressable>
        <View style={styles.statDivider} />
        <Pressable onPress={() => navigation.navigate("CustomerRewards")} style={styles.stat}><Ionicons name="star" size={19} color="#8C6D14" /><Text style={styles.statValue}>850</Text><Text style={styles.statLabel}>نقطة مكافأة</Text></Pressable>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Ionicons name="heart" size={19} color="#8C6D14" /><Text style={styles.statValue}>4</Text><Text style={styles.statLabel}>فنيون مفضلون</Text></View>
      </View>

      <View style={styles.loyaltyCard}><View style={styles.loyaltyIcon}><Ionicons name="ribbon" size={22} color="#8C6D14" /></View><View style={styles.loyaltyCopy}><Text style={styles.loyaltyTitle}>عضو عَمِّرها الذهبي</Text><Text style={styles.loyaltyText}>باقي 150 نقطة لتحصل على قسيمة إضافية</Text><View style={styles.progress}><View style={styles.progressFill} /></View></View><Pressable onPress={() => navigation.navigate("CustomerRewards")}><Ionicons name="chevron-back" size={19} color="#8C6D14" /></Pressable></View>

      <Text style={styles.sectionTitle}>إعدادات الحساب</Text>
      <View style={styles.menuCard}>{menuItems.map((item, index) => <Pressable key={item.title} onPress={() => Alert.alert(item.title, "سيتم ربط هذه الصفحة ببيانات الحساب الفعلية.")} style={({ pressed }) => [styles.menuItem, index < menuItems.length - 1 && styles.menuDivider, pressed && styles.pressed]}><View style={[styles.menuIcon, { backgroundColor: item.background }]}><Ionicons name={item.icon} size={19} color={item.color} /></View><View style={styles.menuCopy}><Text style={styles.menuTitle}>{item.title}</Text><Text style={styles.menuSubtitle}>{item.subtitle}</Text></View><Ionicons name="chevron-back" size={17} color="#94A3B8" /></Pressable>)}</View>

      <Pressable onPress={() => Alert.alert("تسجيل الخروج", "تم تجهيز زر تسجيل الخروج للحساب الحقيقي.")} style={styles.logout}><Ionicons name="log-out-outline" size={18} color="#BE123C" /><Text style={styles.logoutText}>تسجيل الخروج</Text></Pressable>
      <Text style={styles.version}>عَمِّرها • الإصدار 1.0.0</Text>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingBottom: 12, paddingHorizontal: 16, paddingTop: 10 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, textAlign: "right" }, headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, content: { padding: 14, paddingBottom: 30 },
  profileCard: { ...shadows.raised, alignItems: "center", backgroundColor: colors.secondary, borderRadius: 22, flexDirection: "row-reverse", gap: 11, overflow: "hidden", padding: 15 }, profileGlow: { backgroundColor: "rgba(197,155,39,0.14)", borderRadius: 90, height: 180, left: -50, position: "absolute", top: -65, width: 180 }, avatar: { alignItems: "center", backgroundColor: "#28443D", borderColor: colors.primary, borderRadius: 32, borderWidth: 2, height: 64, justifyContent: "center", width: 64 }, profileCopy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, name: { color: "white", fontFamily: typography.fontFamily, fontSize: 17, fontWeight: "800" }, phone: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 10, marginTop: 2, textAlign: "right" }, location: { alignItems: "center", flexDirection: "row-reverse", gap: 3, marginTop: 5 }, locationText: { color: "#D6B24D", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, editButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 11, height: 36, justifyContent: "center", width: 36 },
  stats: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, flexDirection: "row-reverse", marginTop: 12, paddingVertical: 12 }, stat: { alignItems: "center", flex: 1, gap: 2 }, statValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800" }, statLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, textAlign: "center" }, statDivider: { backgroundColor: "#ECE7DC", height: 35, width: 1 },
  loyaltyCard: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 9, marginTop: 12, padding: 12 }, loyaltyIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 11, height: 40, justifyContent: "center", width: 40 }, loyaltyCopy: { flex: 1 }, loyaltyTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, loyaltyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, progress: { backgroundColor: "#F3E2AB", borderRadius: 4, height: 5, marginTop: 6, overflow: "hidden" }, progressFill: { backgroundColor: colors.primary, borderRadius: 4, height: 5, width: "85%" },
  sectionTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "800", marginBottom: 8, marginTop: 18, textAlign: "right" }, menuCard: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, overflow: "hidden" }, menuItem: { alignItems: "center", flexDirection: "row-reverse", gap: 10, minHeight: 64, paddingHorizontal: 12 }, menuDivider: { borderBottomColor: "#F0ECE3", borderBottomWidth: 1 }, menuIcon: { alignItems: "center", borderRadius: 11, height: 38, justifyContent: "center", width: 38 }, menuCopy: { flex: 1 }, menuTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700", textAlign: "right" }, menuSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, pressed: { backgroundColor: "#FAFAF9" }, logout: { alignItems: "center", backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 6, justifyContent: "center", marginTop: 14, minHeight: 46 }, logoutText: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700" }, version: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 12, textAlign: "center" }
});
