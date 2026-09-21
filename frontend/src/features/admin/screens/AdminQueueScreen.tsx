import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AdminStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";
import { adminCases, type AdminCaseKind } from "../adminData";
import { AdminHeader } from "../components/AdminHeader";
import { applyAdminDecision, loadAdminCases } from "../services/adminIntegration";
import { appConfig } from "../../../app/config/appConfig";
import { ErrorState, LoadingState } from "../../../shared/components";

type Kind = "verification" | "reports" | "risk";
type Navigation = NativeStackNavigationProp<AdminStackParamList>;
const config = {
  verification: { kind: "verification" as AdminCaseKind, title: "توثيق الفنيين", subtitle: "مراجعة الهوية والشهادات المهنية", icon: "id-card" as const, color: "#047857" },
  reports: { kind: "report" as AdminCaseKind, title: "البلاغات والسلامة", subtitle: "حماية العملاء والفنيين وحل النزاعات", icon: "flag" as const, color: "#D97706" },
  risk: { kind: "risk" as AdminCaseKind, title: "مركز المخاطر الذكي", subtitle: "مكافحة الاحتيال والتواصل خارج المنصة", icon: "shield-half" as const, color: "#BE123C" }
};

export function AdminQueueScreen({ kind }: { kind: Kind }) {
  const navigation = useNavigation<Navigation>();
  const details = config[kind];
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [cases, setCases] = useState(() => appConfig.demoMode ? adminCases.filter((item) => item.kind === details.kind) : []);
  const [loading, setLoading] = useState(!appConfig.demoMode);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => { let active = true; setLoading(!appConfig.demoMode); setLoadFailed(false); void loadAdminCases(kind).then((value) => { if (active) setCases([...value]); }).catch(() => { if (active) { setCases([]); setLoadFailed(true); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [kind, reloadKey]);
  const data = useMemo(() => cases.filter((item) => filter === "all" || (filter === "resolved" ? Boolean(statuses[item.id]) : !statuses[item.id])), [cases, filter, statuses]);
  const act = (id: string, value: string, positive: boolean) => { void applyAdminDecision(kind, id, positive).then(() => { setStatuses((current) => ({ ...current, [id]: value })); Alert.alert("تم توثيق الإجراء", value); }).catch(() => Alert.alert("تعذر تنفيذ الإجراء", "تحقق من اتصال الخادم وحاول مرة أخرى.")); };
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <AdminHeader title={details.title} subtitle={details.subtitle} onBack={() => navigation.goBack()} />
    <View style={styles.summary}><View style={[styles.summaryIcon, { backgroundColor: `${details.color}18` }]}><Ionicons name={details.icon} size={23} color={details.color} /></View><View style={styles.summaryCopy}><LocalizedText style={styles.summaryValue}>{cases.length}</LocalizedText><LocalizedText style={styles.summaryLabel}>حالات في الطابور</LocalizedText></View></View>
    <View style={styles.filters}>{(["all", "open", "resolved"] as const).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}><LocalizedText style={[styles.filterText, filter === item && styles.activeFilterText]}>{item === "all" ? "الكل" : item === "open" ? "قيد المراجعة" : "تم الإجراء"}</LocalizedText></Pressable>)}</View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {data.map((item) => { const status = statuses[item.id]; return <Pressable key={item.id} onPress={() => navigation.navigate("AdminCaseDetails", { caseId: item.id, kind: item.kind })} style={({ pressed }) => [styles.card, item.severity === "critical" ? styles.critical : item.severity === "warning" ? styles.warning : styles.normal, pressed && styles.pressed]}>
        <View style={styles.top}><View style={styles.titleRow}><View style={[styles.dot, { backgroundColor: details.color }]} /><LocalizedText style={styles.title}>{item.title}</LocalizedText></View><LocalizedText style={styles.time}>{item.time}</LocalizedText></View><LocalizedText style={styles.subject}>{item.subject} • {item.area}</LocalizedText><LocalizedText style={styles.description}>{item.description}</LocalizedText>
        {status ? <View style={styles.done}><Ionicons name="checkmark-circle" size={15} color="#047857" /><LocalizedText style={styles.doneText}>{status}</LocalizedText></View> : <View style={styles.actions}>{kind === "verification" ? <><Pressable onPress={(event) => { event.stopPropagation(); act(item.id, "تم اعتماد الوثائق", true); }} style={styles.approve}><LocalizedText style={styles.approveText}>اعتماد</LocalizedText></Pressable><Pressable onPress={(event) => { event.stopPropagation(); act(item.id, "تم رفض التوثيق", false); }} style={styles.outline}><LocalizedText style={styles.outlineText}>رفض</LocalizedText></Pressable></> : kind === "risk" ? <><Pressable onPress={(event) => { event.stopPropagation(); act(item.id, "تمت مراجعة التقييم", true); }} style={styles.approve}><LocalizedText style={styles.approveText}>تمت المراجعة</LocalizedText></Pressable><Pressable onPress={(event) => { event.stopPropagation(); act(item.id, "تم تجاهل التقييم", false); }} style={styles.danger}><LocalizedText style={styles.dangerText}>تجاهل</LocalizedText></Pressable></> : <><Pressable onPress={(event) => { event.stopPropagation(); act(item.id, "تمت مراجعة البلاغ", true); }} style={styles.approve}><LocalizedText style={styles.approveText}>تمت المراجعة</LocalizedText></Pressable><Pressable onPress={(event) => { event.stopPropagation(); act(item.id, "أعيد البلاغ إلى قائمة المراجعة", false); }} style={styles.outline}><LocalizedText style={styles.outlineText}>إعادة للمتابعة</LocalizedText></Pressable></>}</View>}
      </Pressable>; })}
      {loading ? <LoadingState /> : null}
      {!loading && loadFailed ? <ErrorState message="تعذر تحميل الحالات من الخدمة." onRetry={() => setReloadKey((value) => value + 1)} /> : null}
      {!loading && !loadFailed && !data.length ? <View style={styles.empty}><Ionicons name="checkmark-done-circle" size={34} color="#10B981" /><LocalizedText style={styles.emptyTitle}>لا توجد حالات هنا</LocalizedText><LocalizedText style={styles.emptyText}>{cases.length ? "كل الحالات ضمن هذا الفلتر تمت معالجتها." : "لا توجد حالات في هذا الطابور حالياً."}</LocalizedText></View> : null}
    </ScrollView>
  </SafeAreaView>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, summary: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 9, padding: 12 }, summaryIcon: { alignItems: "center", borderRadius: 12, height: 45, justifyContent: "center", width: 45 }, summaryCopy: { flex: 1 }, summaryValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 18, fontWeight: "800", textAlign: "right" }, summaryLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" }, summaryMetric: { alignItems: "center", backgroundColor: "#F8F7F4", borderRadius: 11, paddingHorizontal: 10, paddingVertical: 7 }, summaryMetricValue: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800" }, summaryMetricLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, marginTop: 1 }, filters: { backgroundColor: "white", flexDirection: "row-reverse", gap: 6, paddingHorizontal: 12, paddingVertical: 9 }, filter: { borderRadius: 9, paddingHorizontal: 11, paddingVertical: 6 }, activeFilter: { backgroundColor: colors.secondary }, filterText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "600" }, activeFilterText: { color: "white" }, content: { gap: 10, padding: 14, paddingBottom: 30 }, card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderRightWidth: 4, borderWidth: 1, padding: 12 }, critical: { borderRightColor: "#E11D48" }, warning: { borderRightColor: "#F59E0B" }, normal: { borderRightColor: "#10B981" }, pressed: { opacity: 0.75 }, top: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, titleRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, dot: { borderRadius: 4, height: 8, width: 8 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800" }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7 }, subject: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700", marginTop: 5, textAlign: "right" }, description: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 16, marginTop: 5, textAlign: "right" }, actions: { borderTopColor: "#F0ECE3", borderTopWidth: 1, flexDirection: "row-reverse", gap: 7, marginTop: 9, paddingTop: 9 }, approve: { alignItems: "center", backgroundColor: "#047857", borderRadius: 9, flex: 1, paddingVertical: 8 }, approveText: { color: "white", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, outline: { alignItems: "center", borderColor: "#D6D3D1", borderRadius: 9, borderWidth: 1, flex: 1, paddingVertical: 8 }, outlineText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, danger: { alignItems: "center", backgroundColor: "#BE123C", borderRadius: 9, flex: 1, paddingVertical: 8 }, dangerText: { color: "white", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, done: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 10, flexDirection: "row-reverse", gap: 5, marginTop: 9, padding: 8 }, doneText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, empty: { alignItems: "center", padding: 50 }, emptyTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", marginTop: 7 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 3 }
});
