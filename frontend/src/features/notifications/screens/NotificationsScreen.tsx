import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";

type Props = NativeStackScreenProps<CustomerStackParamList, "CustomerNotifications">;

const notifications = [
  { id: "tracking", icon: "bicycle" as const, title: "طارق في طريقه إليك الآن!", detail: "المسافة المتبقية 400 متر فقط نحو عقبة الخالدية.", time: "منذ 3 دقائق", tone: "gold" as const },
  { id: "reward", icon: "star" as const, title: "مبروك! كسبت 50 نقطة عَمِّرها", detail: "شكراً لتقييمك الصيانة. يمكنك استبدالها بخصم لدى شركائنا.", time: "منذ 25 دقيقة", tone: "green" as const },
  { id: "safety", icon: "shield-checkmark" as const, title: "أمان بيوت القدس أولاً", detail: "أبقِ جميع الاتفاقات المالية داخل تطبيق عَمِّرها لضمان حقك.", time: "أمس", tone: "slate" as const },
  { id: "offer", icon: "pricetag" as const, title: "وصلك عرض صيانة جديد", detail: "قدّم محمود الخطيب عرضاً لإصلاح القاطع الكهربائي.", time: "منذ يومين", tone: "blue" as const }
];

const tones = {
  gold: { background: "#FFF8E3", border: "#E7CB69", iconBackground: "#FDE9A7", icon: "#8C6D14" },
  green: { background: "white", border: "#E7E2D8", iconBackground: "#D1FAE5", icon: "#047857" },
  slate: { background: "white", border: "#E7E2D8", iconBackground: "#E2E8F0", icon: "#475569" },
  blue: { background: "white", border: "#E7E2D8", iconBackground: "#DBEAFE", icon: "#1D4ED8" }
};

export function NotificationsScreen({ navigation }: Props) {
  const [readIds, setReadIds] = useState<string[]>(["safety", "offer"]);
  const open = (id: string) => {
    setReadIds((current) => current.includes(id) ? current : [...current, id]);
    if (id === "tracking") navigation.navigate("CustomerRequestDetails", { requestId: "old_city_plumbing_leak" });
    if (id === "reward") navigation.navigate("CustomerTabs", { screen: "CustomerRewards" });
    if (id === "offer") navigation.navigate("CustomerOffersEntry", { requestId: "old_city_plumbing_leak" });
  };

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="العودة" onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable>
      <View style={styles.headerCopy}><Text style={styles.title}>مركز الإشعارات</Text><Text style={styles.subtitle}>كل جديد في طلباتك ومكافآتك</Text></View>
      <Pressable onPress={() => setReadIds(notifications.map(({ id }) => id))} style={styles.markRead}><Text style={styles.markReadText}>قراءة الكل</Text></Pressable>
    </View>

    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.summary}><View style={styles.summaryIcon}><Ionicons name="notifications" size={20} color="#8C6D14" /></View><View style={styles.summaryCopy}><Text style={styles.summaryTitle}>{notifications.length - readIds.length} إشعار جديد</Text><Text style={styles.summaryText}>سنخبرك فوراً بأي تحديث على طلبات الصيانة</Text></View></View>
      <Text style={styles.dayLabel}>اليوم</Text>
      {notifications.slice(0, 2).map((item) => <NotificationCard key={item.id} item={item} read={readIds.includes(item.id)} onPress={() => open(item.id)} />)}
      <Text style={styles.dayLabel}>سابقاً</Text>
      {notifications.slice(2).map((item) => <NotificationCard key={item.id} item={item} read={readIds.includes(item.id)} onPress={() => open(item.id)} />)}
      <View style={styles.safetyNote}><Ionicons name="lock-closed" size={14} color="#8C6D14" /><Text style={styles.safetyText}>إشعاراتك خاصة ومحمية داخل عَمِّرها</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

function NotificationCard({ item, read, onPress }: { item: (typeof notifications)[number]; read: boolean; onPress(): void }) {
  const tone = tones[item.tone];
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: read ? "white" : tone.background, borderColor: tone.border }, pressed && styles.pressed]}>
    <View style={[styles.icon, { backgroundColor: tone.iconBackground }]}><Ionicons name={item.icon} size={20} color={tone.icon} /></View>
    <View style={styles.copy}><View style={styles.notificationTitleRow}><Text style={styles.notificationTitle}>{item.title}</Text>{!read ? <View style={styles.unreadDot} /> : null}</View><Text style={styles.detail}>{item.detail}</Text><Text style={styles.time}>{item.time}</Text></View>
    <Ionicons name="chevron-back" size={16} color="#94A3B8" />
  </Pressable>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 64, paddingHorizontal: 12 }, backButton: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, headerCopy: { alignItems: "center", flex: 1 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "800" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8 }, markRead: { alignItems: "center", justifyContent: "center", minHeight: 34, minWidth: 58 }, markReadText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" },
  content: { gap: 9, padding: 14, paddingBottom: 30 }, summary: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 17, flexDirection: "row-reverse", gap: 9, padding: 12 }, summaryIcon: { alignItems: "center", backgroundColor: "rgba(197,155,39,0.17)", borderRadius: 12, height: 40, justifyContent: "center", width: 40 }, summaryCopy: { flex: 1 }, summaryTitle: { color: "white", fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", textAlign: "right" }, summaryText: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, dayLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", marginTop: 6, textAlign: "right" },
  card: { ...shadows.subtle, alignItems: "center", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 9, minHeight: 86, padding: 11 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] }, icon: { alignItems: "center", borderRadius: 12, height: 42, justifyContent: "center", width: 42 }, copy: { flex: 1 }, notificationTitleRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, notificationTitle: { color: colors.text, flexShrink: 1, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700", textAlign: "right" }, unreadDot: { backgroundColor: colors.primary, borderRadius: 4, height: 7, width: 7 }, detail: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 15, marginTop: 3, textAlign: "right", writingDirection: "rtl" }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, marginTop: 4, textAlign: "right" }, safetyNote: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 5, justifyContent: "center", marginTop: 5, padding: 9 }, safetyText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "600" }
});
