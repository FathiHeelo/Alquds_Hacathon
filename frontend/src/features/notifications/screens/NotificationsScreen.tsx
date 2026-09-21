import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";
import { notificationRepository } from "../../../services/repositories";
import { customerJobRepository } from "../../../services/repositories";
import { appConfig } from "../../../app/config/appConfig";

type Props = NativeStackScreenProps<CustomerStackParamList, "CustomerNotifications">;

type NotificationCardItem = { id: string; icon: "star" | "pricetag" | "bicycle" | "notifications" | "shield-checkmark"; title: string; detail: string; time: string; createdAt?: string; tone: keyof typeof tones; read: boolean; data?: Record<string, unknown> };

const demoNotifications: NotificationCardItem[] = [
  { id: "tracking", icon: "bicycle" as const, title: "طارق في طريقه إليك الآن!", detail: "المسافة المتبقية 400 متر فقط نحو عقبة الخالدية.", time: "منذ 3 دقائق", tone: "gold" as const, read: false },
  { id: "reward", icon: "star" as const, title: "مبروك! كسبت 50 نقطة عَمِّرها", detail: "شكراً لتقييمك الصيانة. يمكنك استبدالها بخصم لدى شركائنا.", time: "منذ 25 دقيقة", tone: "green" as const, read: false },
  { id: "safety", icon: "shield-checkmark" as const, title: "أمان بيوت القدس أولاً", detail: "أبقِ جميع الاتفاقات المالية داخل تطبيق عَمِّرها لضمان حقك.", time: "أمس", tone: "slate" as const, read: true },
  { id: "offer", icon: "pricetag" as const, title: "وصلك عرض صيانة جديد", detail: "قدّم محمود الخطيب عرضاً لإصلاح القاطع الكهربائي.", time: "منذ يومين", tone: "blue" as const, read: true }
];

const tones = {
  gold: { background: "#FFF8E3", border: "#E7CB69", iconBackground: "#FDE9A7", icon: "#8C6D14" },
  green: { background: "white", border: "#E7E2D8", iconBackground: "#D1FAE5", icon: "#047857" },
  slate: { background: "white", border: "#E7E2D8", iconBackground: "#E2E8F0", icon: "#475569" },
  blue: { background: "white", border: "#E7E2D8", iconBackground: "#DBEAFE", icon: "#1D4ED8" }
};

export function NotificationsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState<NotificationCardItem[]>(() => appConfig.demoMode ? demoNotifications.map((item) => ({ ...item, read: ["safety", "offer"].includes(item.id) })) : []);
  const [loading, setLoading] = useState(!appConfig.demoMode);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => { if (appConfig.demoMode) return; let active = true; void notificationRepository.list().then((feed) => { if (active) setNotifications(feed.items.map((item) => ({ id: item.id, icon: (item.type === "reward" ? "star" : item.type === "new_offer" ? "pricetag" : item.type === "on_the_way" ? "bicycle" : "notifications") as "star" | "pricetag" | "bicycle" | "notifications", title: item.title, detail: item.body ?? "", time: new Date(item.createdAt).toLocaleString(), createdAt: item.createdAt, tone: (item.type === "reward" ? "green" : item.type === "new_offer" ? "blue" : item.type === "on_the_way" ? "gold" : "slate") as "green" | "blue" | "gold" | "slate", read: item.read, data: item.data })) ); }).catch(() => { if (active) { setNotifications([]); setLoadError(true); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const today = appConfig.demoMode ? notifications.slice(0, 2) : notifications.filter((item) => item.createdAt && new Date(item.createdAt).toDateString() === new Date().toDateString());
  const earlier = appConfig.demoMode ? notifications.slice(2) : notifications.filter((item) => !today.includes(item));
  const unreadCount = notifications.filter((item) => !item.read).length;
  const open = (item: NotificationCardItem) => {
    setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, read: true } : notification));
    void notificationRepository.markRead(item.id);
    const requestId = typeof item.data?.requestId === "string" ? item.data.requestId : undefined;
    const jobId = typeof item.data?.jobId === "string" ? item.data.jobId : undefined;
    if (requestId && item.tone === "blue") navigation.navigate("CustomerOffersEntry", { requestId });
    else if (requestId) navigation.navigate("CustomerRequestDetails", { requestId });
    else if (item.tone === "green") navigation.navigate("CustomerTabs", { screen: "CustomerRewards" });
    else if (jobId) void customerJobRepository.getJob(jobId).then((job) => {
      if (job) navigation.navigate("CustomerJob", { jobId: job.id, requestId: job.requestId, offerId: job.offerId, technicianId: job.technicianId });
    }).catch(() => undefined);
  };

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="العودة" onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable>
      <View style={styles.headerCopy}><LocalizedText style={styles.title}>مركز الإشعارات</LocalizedText><LocalizedText style={styles.subtitle}>كل جديد في طلباتك ومكافآتك</LocalizedText></View>
      <Pressable onPress={() => { setNotifications((items) => items.map((item) => ({ ...item, read: true }))); void notificationRepository.markAllRead(); }} style={styles.markRead}><LocalizedText style={styles.markReadText}>قراءة الكل</LocalizedText></Pressable>
    </View>

    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.summary}><View style={styles.summaryIcon}><Ionicons name="notifications" size={20} color="#8C6D14" /></View><View style={styles.summaryCopy}><LocalizedText style={styles.summaryTitle}>{loading ? "جارٍ تحميل الإشعارات" : `${unreadCount} إشعار جديد`}</LocalizedText><LocalizedText style={styles.summaryText}>سنخبرك بأي تحديث على طلبات الصيانة</LocalizedText></View></View>
      {loading ? <LocalizedText style={styles.dayLabel}>جارٍ تحميل الإشعارات...</LocalizedText> : null}
      {today.length ? <><LocalizedText style={styles.dayLabel}>اليوم</LocalizedText>{today.map((item) => <NotificationCard key={item.id} item={item} onPress={() => open(item)} />)}</> : null}
      {earlier.length ? <><LocalizedText style={styles.dayLabel}>سابقاً</LocalizedText>{earlier.map((item) => <NotificationCard key={item.id} item={item} onPress={() => open(item)} />)}</> : null}
      {!loading && !notifications.length ? <LocalizedText style={styles.dayLabel}>{loadError ? "تعذر تحميل الإشعارات" : "لا توجد إشعارات"}</LocalizedText> : null}
      <View style={styles.safetyNote}><Ionicons name="lock-closed" size={14} color="#8C6D14" /><LocalizedText style={styles.safetyText}>إشعاراتك خاصة ومحمية داخل عَمِّرها</LocalizedText></View>
    </ScrollView>
  </SafeAreaView>;
}

function NotificationCard({ item, onPress }: { item: NotificationCardItem; onPress(): void }) {
  const tone = tones[item.tone];
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: item.read ? "white" : tone.background, borderColor: tone.border }, pressed && styles.pressed]}>
    <View style={[styles.icon, { backgroundColor: tone.iconBackground }]}><Ionicons name={item.icon} size={20} color={tone.icon} /></View>
    <View style={styles.copy}><View style={styles.notificationTitleRow}><LocalizedText style={styles.notificationTitle}>{item.title}</LocalizedText>{!item.read ? <View style={styles.unreadDot} /> : null}</View><LocalizedText style={styles.detail}>{item.detail}</LocalizedText><LocalizedText style={styles.time}>{item.time}</LocalizedText></View>
    <Ionicons name="chevron-back" size={16} color="#94A3B8" />
  </Pressable>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 64, paddingHorizontal: 12 }, backButton: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, headerCopy: { alignItems: "center", flex: 1 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "800" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8 }, markRead: { alignItems: "center", justifyContent: "center", minHeight: 34, minWidth: 58 }, markReadText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" },
  content: { gap: 9, padding: 14, paddingBottom: 30 }, summary: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 17, flexDirection: "row-reverse", gap: 9, padding: 12 }, summaryIcon: { alignItems: "center", backgroundColor: "rgba(197,155,39,0.17)", borderRadius: 12, height: 40, justifyContent: "center", width: 40 }, summaryCopy: { flex: 1 }, summaryTitle: { color: "white", fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", textAlign: "right" }, summaryText: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, dayLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", marginTop: 6, textAlign: "right" },
  card: { ...shadows.subtle, alignItems: "center", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 9, minHeight: 86, padding: 11 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] }, icon: { alignItems: "center", borderRadius: 12, height: 42, justifyContent: "center", width: 42 }, copy: { flex: 1 }, notificationTitleRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, notificationTitle: { color: colors.text, flexShrink: 1, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700", textAlign: "right" }, unreadDot: { backgroundColor: colors.primary, borderRadius: 4, height: 7, width: 7 }, detail: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 15, marginTop: 3, textAlign: "right", writingDirection: "rtl" }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, marginTop: 4, textAlign: "right" }, safetyNote: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 5, justifyContent: "center", marginTop: 5, padding: 9 }, safetyText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "600" }
});
