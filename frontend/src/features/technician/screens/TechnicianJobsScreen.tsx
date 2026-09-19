import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";
import { technicianJobs } from "../technicianData";
import type { Job } from "../../../domain/models/job";
import { technicianJobRepository } from "../../../services/repositories";
import { appConfig } from "../../../app/config/appConfig";

type TechnicianJobListItem = { id: string; requestId: string; customerName: string; problem: string; status: Job["status"]; statusLabel: string; date: string; price: number; area: string };

type Filter = "active" | "completed";

export function TechnicianJobsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TechnicianStackParamList>>();
  const [filter, setFilter] = useState<Filter>("active");
  const [loadedJobs, setLoadedJobs] = useState<readonly TechnicianJobListItem[]>(technicianJobs);
  useFocusEffect(useCallback(() => {
    let active = true;
    if (!appConfig.demoMode) void technicianJobRepository.list().then((rows) => {
      const items = rows.map((job: Job) => {
        const statusLabel: Record<Job["status"], string> = { accepted: "تم قبول العرض", scheduled: "موعد محجوز", on_the_way: "في الطريق", in_progress: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغي" };
        return { id: job.id, requestId: job.requestId, customerName: "عميل", problem: job.description ?? "طلب صيانة", status: job.status, statusLabel: statusLabel[job.status], date: job.createdAt ? new Date(job.createdAt).toLocaleDateString("ar") : "", price: job.agreedPrice, area: job.locationLabel };
      });
      if (active) setLoadedJobs(items);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []));
  const jobs = useMemo(() => loadedJobs.filter((job) => filter === "active" ? job.status !== "completed" && job.status !== "cancelled" : job.status === "completed"), [filter, loadedJobs]);
  const total = loadedJobs.filter(({ status }) => status === "completed").reduce((sum, job) => sum + job.price, 0);

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}><View><LocalizedText style={styles.title}>أعمالي</LocalizedText><LocalizedText style={styles.subtitle}>إدارة المهام والأرباح والتوثيق</LocalizedText></View><View style={styles.headerIcon}><Ionicons name="briefcase" size={21} color={colors.primaryPressed} /></View></View>
    <View style={styles.metrics}><Metric label="مهمة نشطة" value={`${loadedJobs.filter((job) => job.status !== "completed" && job.status !== "cancelled").length}`} color="#047857" /><Metric label="مكتملة" value={`${loadedJobs.filter((job) => job.status === "completed").length}`} /><Metric label="دخل حديث" value={`${total} ₪`} color="#8C6D14" /></View>
    <View style={styles.tabs}><Pressable onPress={() => setFilter("active")} style={[styles.tab, filter === "active" && styles.activeTab]}><LocalizedText style={[styles.tabText, filter === "active" && styles.activeTabText]}>الجارية</LocalizedText></Pressable><Pressable onPress={() => setFilter("completed")} style={[styles.tab, filter === "completed" && styles.activeTab]}><LocalizedText style={[styles.tabText, filter === "completed" && styles.activeTabText]}>المكتملة</LocalizedText></Pressable></View>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {jobs.map((job) => <Pressable key={job.id} onPress={() => navigation.navigate("TechnicianJobDetails", { jobId: job.id })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.cardTop}><View style={styles.jobIcon}><Ionicons name={job.status === "completed" ? "checkmark" : "navigate"} size={19} color={job.status === "completed" ? "#047857" : "#8C6D14"} /></View><View style={styles.copy}><LocalizedText style={styles.problem}>{job.problem}</LocalizedText><LocalizedText style={styles.customer}>العميل: {job.customerName} • {job.area}</LocalizedText></View><View style={[styles.status, job.status === "completed" && styles.completedStatus]}><LocalizedText style={[styles.statusText, job.status === "completed" && styles.completedText]}>{job.statusLabel}</LocalizedText></View></View>
        <View style={styles.divider} />
        <View style={styles.bottom}><View><LocalizedText style={styles.date}>{job.date}</LocalizedText><LocalizedText style={styles.price}>{job.price} ₪</LocalizedText></View><View style={styles.open}><LocalizedText style={styles.openText}>تفاصيل العمل</LocalizedText><Ionicons name="chevron-back" size={15} color="#8C6D14" /></View></View>
      </Pressable>)}
      {!jobs.length ? <View style={styles.empty}><Ionicons name="briefcase-outline" size={36} color="#CBD5E1" /><LocalizedText style={styles.emptyText}>لا توجد أعمال في هذه القائمة</LocalizedText></View> : null}
      <View style={styles.note}><Ionicons name="camera" size={17} color="#8C6D14" /><LocalizedText style={styles.noteText}>وثّق صور قبل وبعد كل عمل لرفع ثقة العملاء بملفك المهني.</LocalizedText></View>
    </ScrollView>
  </SafeAreaView>;
}

function Metric({ label, value, color = colors.text }: { label: string; value: string; color?: string }) { return <View style={styles.metric}><LocalizedText style={styles.metricLabel}>{label}</LocalizedText><LocalizedText style={[styles.metricValue, { color }]}>{value}</LocalizedText></View>; }

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingBottom: 11, paddingHorizontal: 16, paddingTop: 10 }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 22, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, headerIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, metrics: { flexDirection: "row-reverse", gap: 7, paddingHorizontal: 14 }, metric: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 13, borderWidth: 1, flex: 1, padding: 9 }, metricLabel: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7 }, metricValue: { fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "800", marginTop: 2 }, tabs: { flexDirection: "row-reverse", gap: 7, paddingHorizontal: 14, paddingTop: 11 }, tab: { borderRadius: 11, paddingHorizontal: 14, paddingVertical: 7 }, activeTab: { backgroundColor: colors.secondary }, tabText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, activeTabText: { color: "white" }, list: { gap: 10, padding: 14, paddingBottom: 28 }, card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, padding: 12 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] }, cardTop: { alignItems: "center", flexDirection: "row-reverse", gap: 9 }, jobIcon: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 12, height: 42, justifyContent: "center", width: 42 }, copy: { flex: 1 }, problem: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700", textAlign: "right" }, customer: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 3, textAlign: "right" }, status: { backgroundColor: "#FFF8E3", borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5 }, completedStatus: { backgroundColor: "#ECFDF5" }, statusText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, completedText: { color: "#047857" }, divider: { backgroundColor: "#F0ECE3", height: 1, marginVertical: 10 }, bottom: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, date: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, textAlign: "right" }, price: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", marginTop: 2, textAlign: "right" }, open: { alignItems: "center", flexDirection: "row-reverse", gap: 2 }, openText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, empty: { alignItems: "center", padding: 55 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, marginTop: 6 }, note: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 7, padding: 10 }, noteText: { color: "#8C6D14", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "right" }
});
