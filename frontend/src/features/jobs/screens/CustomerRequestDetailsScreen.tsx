import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { demoTechnicians } from "../../../demo/fixtures/technicians";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";
import { getCustomerRequest } from "../customerRequests";

type Props = NativeStackScreenProps<CustomerStackParamList, "CustomerRequestDetails">;

export function CustomerRequestDetailsScreen({ route, navigation }: Props) {
  const request = getCustomerRequest(route.params.requestId);
  if (!request) return <SafeAreaView style={styles.safe}><View style={styles.missing}><Text style={styles.sectionTitle}>تعذر العثور على الطلب</Text></View></SafeAreaView>;
  const technician = demoTechnicians.find(({ id }) => id === request.technicianId)!;
  const isActive = request.state === "on_the_way" || request.state === "scheduled";
  const isCompleted = request.state === "completed";
  const steps = isCompleted
    ? ["تم استلام الطلب", "تم قبول العرض", "اكتملت الصيانة", "تم الدفع والتقييم"]
    : request.state === "cancelled"
      ? ["تم استلام الطلب", "تم إلغاء الطلب"]
      : ["تم قبول العرض والاتفاق", request.state === "on_the_way" ? "الفني يتحرك نحوك" : "موعد الصيانة محجوز", "بدء تنفيذ الصيانة", "إتمام العمل والدفع"];
  const activeIndex = isCompleted ? steps.length - 1 : request.state === "cancelled" ? 1 : 1;

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="العودة إلى طلباتي" onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable>
      <View style={styles.headerCopy}><Text style={styles.headerTitle}>تفاصيل الطلب</Text><Text style={styles.headerSubtitle}>طلب رقم {request.orderNumber}</Text></View>
      <View style={styles.headerButton}><Ionicons name="ellipsis-horizontal" size={18} color="#64748B" /></View>
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.statusHero, isCompleted && styles.completedHero, request.state === "cancelled" && styles.cancelledHero]}>
        <View style={styles.statusIcon}><Ionicons name={isCompleted ? "checkmark-circle" : request.state === "cancelled" ? "close-circle" : request.state === "scheduled" ? "calendar" : "navigate"} size={23} color={isCompleted ? "#047857" : request.state === "cancelled" ? "#9F1239" : "#8C6D14"} /></View>
        <View style={styles.statusCopy}><Text style={styles.eyebrow}>حالة الطلب الحالية</Text><Text style={styles.statusTitle}>{request.statusLabel}</Text><Text style={styles.statusDetail}>{request.statusDetail}</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الفني المسؤول</Text>
        <View style={styles.technicianRow}>
          <TechnicianPortrait technician={technician} round size={54} />
          <View style={styles.technicianCopy}><View style={styles.nameRow}><Text style={styles.technicianName}>{technician.name}</Text><Ionicons name="checkmark-circle" size={14} color={colors.primaryPressed} /></View><Text style={styles.muted}>{technician.specialty}</Text><Text style={styles.rating}>★ {technician.rating.toFixed(1)} · {technician.completedJobs} عملية</Text></View>
          {isActive ? <View style={styles.contactRow}><Pressable accessibilityLabel="الاتصال بالفني" onPress={() => void Linking.openURL("tel:+970599000000")} style={styles.roundButton}><Ionicons name="call" size={17} color="#176B51" /></Pressable><Pressable accessibilityLabel="مراسلة الفني" onPress={() => navigation.navigate("CustomerChat", { jobId: request.jobId, requestId: request.id, technicianId: request.technicianId })} style={[styles.roundButton, styles.chatButton]}><Ionicons name="chatbubble-ellipses" size={17} color="#8C6D14" /></Pressable></View> : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>مراحل تنفيذ العمل</Text>
        <View style={styles.timeline}>
          {steps.map((step, index) => {
            const done = isCompleted || index < activeIndex || request.state === "cancelled";
            const active = !isCompleted && index === activeIndex;
            return <View key={step} style={styles.stepRow}>
              <View style={styles.stepRail}><View style={[styles.stepDot, done && styles.doneDot, active && styles.activeDot]}>{done ? <Ionicons name="checkmark" size={11} color="white" /> : active ? <View style={styles.activeCore} /> : <View style={styles.pendingCore} />}</View>{index < steps.length - 1 ? <View style={[styles.line, done && styles.doneLine]} /> : null}</View>
              <View style={styles.stepCopy}><Text style={[styles.stepTitle, active && styles.activeTitle]}>{step}</Text><Text style={styles.stepDetail}>{index === activeIndex ? request.statusDetail : done ? "تم بنجاح" : "بانتظار المرحلة السابقة"}</Text></View>
            </View>;
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ملخص طلب الصيانة</Text>
        <SummaryRow label="نوع الصيانة" value={request.title} />
        <SummaryRow label="الموقع" value={request.location} />
        <SummaryRow label="تاريخ الطلب" value={request.date} />
        <SummaryRow label="السعر المتفق عليه" value={request.price ? `${request.price} ₪` : "لم يتم تحديد سعر"} strong />
        {request.state !== "cancelled" ? <View style={styles.guarantee}><Ionicons name="shield-checkmark" size={16} color="#176B51" /><Text style={styles.guaranteeText}>دفع آمن وضمان عَمِّرها على تنفيذ العمل</Text></View> : null}
      </View>

      {isCompleted ? <Pressable onPress={() => Alert.alert("الفاتورة", `تم دفع ${request.price} ₪ بنجاح`)} style={styles.primaryButton}><Ionicons name="receipt" size={18} color={colors.text} /><Text style={styles.primaryButtonText}>عرض الفاتورة والتقييم</Text></Pressable> : isActive ? <Pressable onPress={() => navigation.navigate("CustomerChat", { jobId: request.jobId, requestId: request.id, technicianId: request.technicianId })} style={styles.primaryButton}><Ionicons name="chatbubble-ellipses" size={18} color={colors.text} /><Text style={styles.primaryButtonText}>متابعة الطلب مع الفني</Text></Pressable> : null}
    </ScrollView>
  </SafeAreaView>;
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={[styles.summaryValue, strong && styles.summaryStrong]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 62, paddingHorizontal: 12 }, headerButton: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, headerCopy: { alignItems: "center", flex: 1 }, headerTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 16, fontWeight: "700" }, headerSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9 },
  content: { gap: 12, padding: 14, paddingBottom: 30 }, statusHero: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#E7CB69", borderRadius: 18, borderWidth: 1, flexDirection: "row-reverse", gap: 11, padding: 14 }, completedHero: { backgroundColor: "#ECFDF5", borderColor: "#A7E6CD" }, cancelledHero: { backgroundColor: "#FFF1F2", borderColor: "#FECDD3" }, statusIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, statusCopy: { flex: 1 }, eyebrow: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600", textAlign: "right" }, statusTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "800", textAlign: "right" }, statusDetail: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, marginTop: 2, textAlign: "right" },
  card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, padding: 14 }, sectionTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700", marginBottom: 11, textAlign: "right" }, technicianRow: { alignItems: "center", flexDirection: "row-reverse", gap: 9 }, technicianCopy: { flex: 1 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 4 }, technicianName: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "700" }, muted: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, rating: { color: "#B58100", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "right" }, contactRow: { flexDirection: "row-reverse", gap: 6 }, roundButton: { alignItems: "center", backgroundColor: "#E8F7F1", borderRadius: 11, height: 36, justifyContent: "center", width: 36 }, chatButton: { backgroundColor: "#FFF4C8" },
  timeline: { paddingTop: 2 }, stepRow: { flexDirection: "row-reverse", minHeight: 63 }, stepRail: { alignItems: "center", marginLeft: 10, width: 24 }, stepDot: { alignItems: "center", backgroundColor: "#F1F5F9", borderColor: "#CBD5E1", borderRadius: 12, borderWidth: 1, height: 24, justifyContent: "center", width: 24 }, doneDot: { backgroundColor: "#10B981", borderColor: "#10B981" }, activeDot: { backgroundColor: "#FFF4C8", borderColor: colors.primary }, activeCore: { backgroundColor: colors.primary, borderRadius: 5, height: 10, width: 10 }, pendingCore: { backgroundColor: "#CBD5E1", borderRadius: 4, height: 7, width: 7 }, line: { backgroundColor: "#E2E8F0", flex: 1, width: 2 }, doneLine: { backgroundColor: "#A7E6CD" }, stepCopy: { flex: 1, paddingBottom: 12 }, stepTitle: { color: "#64748B", fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "600", textAlign: "right" }, activeTitle: { color: "#9A7200", fontWeight: "700" }, stepDetail: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 9, marginTop: 2, textAlign: "right" },
  summaryRow: { borderTopColor: "#F0ECE3", borderTopWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: 9 }, summaryLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10 }, summaryValue: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "600", paddingLeft: 12, textAlign: "left" }, summaryStrong: { color: "#8C6D14", fontSize: 14, fontWeight: "800" }, guarantee: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 10, flexDirection: "row-reverse", gap: 5, justifyContent: "center", marginTop: 5, padding: 8 }, guaranteeText: { color: "#176B51", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 15, flexDirection: "row-reverse", gap: 7, justifyContent: "center", minHeight: 50 }, primaryButtonText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800" }, missing: { alignItems: "center", flex: 1, justifyContent: "center" }
});
