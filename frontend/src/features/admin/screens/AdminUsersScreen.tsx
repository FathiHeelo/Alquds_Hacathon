import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AdminStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";
import { AdminHeader } from "../components/AdminHeader";
import { adminApi } from "../../../services/api/adminApi";
import { appConfig } from "../../../app/config/appConfig";

export function AdminUsersScreen({ navigation }: NativeStackScreenProps<AdminStackParamList, "AdminUsers">) {
  const [summary, setSummary] = useState<Record<string, unknown>>();
  const [failed, setFailed] = useState(false);
  useEffect(() => { if (appConfig.demoMode) return; let active = true; void adminApi.summary().then((value) => { if (active) setSummary(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  const value = (key: string) => typeof summary?.[key] === "number" ? String(summary[key]) : "—";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><AdminHeader title="المستخدمون والفنيون" subtitle="إحصاءات الحسابات المتاحة عبر الخدمة" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.metrics}><Metric label="كل المستخدمين" value={value("users")} /><Metric label="الفنيون" value={value("technicians")} /><Metric label="مشتركو Pro" value={value("proSubscribers")} /></View>
    <View style={styles.metrics}><Metric label="أعمال مكتملة" value={value("completedJobs")} /></View>
    <View style={styles.user}><View style={styles.copy}><LocalizedText style={styles.name}>{failed ? "تعذر تحميل الإحصاءات" : appConfig.demoMode ? "بيانات الحسابات غير متاحة في وضع العرض" : "قائمة الحسابات التفصيلية غير متاحة عبر الخدمة"}</LocalizedText><LocalizedText style={styles.role}>تعرض لوحة الإدارة حالياً أعداداً إجمالية فقط؛ لا توجد واجهة API لعرض المستخدمين فردياً.</LocalizedText></View></View>
  </ScrollView></SafeAreaView>;
}
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><LocalizedText style={styles.metricLabel}>{label}</LocalizedText><LocalizedText style={styles.metricValue}>{value}</LocalizedText></View>; }
const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, search: { alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 7, marginHorizontal: 14, marginTop: 11, paddingHorizontal: 10 }, input: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 9, minHeight: 43, textAlign: "right" }, filters: { flexDirection: "row-reverse", gap: 6, paddingHorizontal: 14, paddingTop: 9 }, filter: { borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 }, activeFilter: { backgroundColor: colors.secondary }, filterText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "600" }, activeText: { color: "white" }, content: { gap: 9, padding: 14, paddingBottom: 30 }, metrics: { flexDirection: "row-reverse", gap: 7 }, metric: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 13, borderWidth: 1, flex: 1, padding: 9 }, metricLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, textAlign: "center" }, metricValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", marginTop: 2 }, user: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 9, minHeight: 72, padding: 10 }, pressed: { opacity: 0.72 }, avatar: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 21, height: 42, justifyContent: "center", position: "relative", width: 42 }, avatarText: { color: colors.primary, fontFamily: typography.fontFamily, fontSize: 16, fontWeight: "800" }, statusDot: { borderColor: "white", borderRadius: 6, borderWidth: 1.5, bottom: 0, height: 12, position: "absolute", right: 0, width: 12 }, success: { backgroundColor: "#10B981" }, warning: { backgroundColor: "#F59E0B" }, danger: { backgroundColor: "#E11D48" }, copy: { flex: 1 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "800", textAlign: "right" }, role: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, marginTop: 3, textAlign: "right" }, badge: { borderRadius: 8, maxWidth: 84, paddingHorizontal: 6, paddingVertical: 5 }, badgeText: { fontFamily: typography.fontFamily, fontSize: 6, fontWeight: "700", textAlign: "center" }, successBg: { backgroundColor: "#ECFDF5" }, successText: { color: "#047857" }, warningBg: { backgroundColor: "#FEF3C7" }, warningText: { color: "#92400E" }, dangerBg: { backgroundColor: "#FFF1F2" }, dangerText: { color: "#BE123C" }
});
