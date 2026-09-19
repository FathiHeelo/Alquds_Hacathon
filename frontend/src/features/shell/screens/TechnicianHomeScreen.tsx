import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { demoTechnicians } from "../../../demo/fixtures/technicians";
import { colors, shadows, typography } from "../../../shared/theme";
import { TechnicianPortrait } from "../../map/components/TechnicianPortrait";
import { technicianRequests, type TechnicianRequestItem } from "../../technician/technicianData";
import { repairRequestRepository } from "../../../services/repositories";
import { appConfig } from "../../../app/config/appConfig";

type Navigation = NativeStackNavigationProp<TechnicianStackParamList>;
const region: Region = { latitude: 31.7849, longitude: 35.2329, latitudeDelta: 0.035, longitudeDelta: 0.03 };
type Filter = "الكل" | "عاجل" | "اليوم";

export function TechnicianHomeScreen() {
  const navigation = useNavigation<Navigation>();
  const [available, setAvailable] = useState(true);
  const [filter, setFilter] = useState<Filter>("الكل");
  const [loadedRequests, setLoadedRequests] = useState<readonly TechnicianRequestItem[]>(technicianRequests);
  const [selectedId, setSelectedId] = useState("old_city_plumbing_leak");
  const technician = demoTechnicians[0];
  useFocusEffect(useCallback(() => {
    let active = true;
    if (!appConfig.demoMode) void repairRequestRepository.listForTechnician().then((items) => { if (active) setLoadedRequests(items); }).catch(() => undefined);
    return () => { active = false; };
  }, []));
  const requests = useMemo(() => loadedRequests.filter((request) => filter === "الكل" || request.urgency === filter), [filter, loadedRequests]);
  const selected = requests.find(({ id }) => id === selectedId) ?? requests[0];

  return <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}>
      <View style={styles.identity}><TechnicianPortrait technician={technician} round size={44} /><View><View style={styles.nameRow}><LocalizedText style={styles.name}>{technician.name}</LocalizedText><LocalizedText style={styles.pro}>Pro</LocalizedText></View><View style={styles.onlineRow}><View style={[styles.onlineDot, !available && styles.offlineDot]} /><LocalizedText style={[styles.onlineText, !available && styles.offlineText]}>{available ? "متصل وجاهز للعمل بالقدس" : "غير متاح لاستقبال طلبات"}</LocalizedText></View></View></View>
      <Switch accessibilityLabel="تغيير حالة التوفر" value={available} onValueChange={setAvailable} trackColor={{ false: "#CBD5E1", true: "#A7E6CD" }} thumbColor={available ? "#10B981" : "#94A3B8"} />
    </View>

    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.metrics}><Metric label="أرباح اليوم" value="420 ₪" /><Metric label="نسبة القبول" value="96%" color="#047857" /><Metric label="التقييم" value="★ 4.9" color="#D69E00" /></View>
      <View style={styles.sectionHeading}><View><LocalizedText style={styles.title}>الخريطة والطلبات</LocalizedText><LocalizedText style={styles.subtitle}>طلبات صيانة قريبة ومحمية داخل عَمِّرها</LocalizedText></View><View style={styles.liveBadge}><View style={styles.liveDot} /><LocalizedText style={styles.liveText}>مباشر</LocalizedText></View></View>
      <View style={styles.filters}>{(["الكل", "عاجل", "اليوم"] as const).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}><LocalizedText style={[styles.filterText, filter === item && styles.activeFilterText]}>{item}</LocalizedText></Pressable>)}</View>

      <View style={styles.mapCard}>
        <MapView initialRegion={region} pitchEnabled={false} rotateEnabled={false} style={styles.map} userInterfaceStyle="light">
          {requests.map((request) => <Marker key={request.id} coordinate={{ latitude: request.latitude, longitude: request.longitude }} onPress={() => setSelectedId(request.id)}><View style={[styles.marker, selectedId === request.id && styles.selectedMarker]}><Ionicons name={request.category.includes("كهرباء") ? "flash" : request.category.includes("تكييف") ? "snow" : request.category.includes("نجارة") ? "hammer" : "water"} size={16} color={selectedId === request.id ? colors.secondary : colors.primary} /></View></Marker>)}
        </MapView>
        <View style={styles.mapPrivacy}><Ionicons name="shield-checkmark" size={13} color="#176B51" /><LocalizedText style={styles.mapPrivacyText}>الموقع تقريبي حتى قبول العميل للعرض</LocalizedText></View>
      </View>

      {selected ? <View style={[styles.requestCard, selected.state === "new" && styles.newRequest]}>
        <View style={styles.requestTop}><View><View style={styles.categoryRow}><LocalizedText style={styles.category}>{selected.category}</LocalizedText>{selected.state === "new" ? <LocalizedText style={styles.newBadge}>جديد الآن</LocalizedText> : null}</View><LocalizedText style={styles.problem}>{selected.problem}</LocalizedText><LocalizedText style={styles.customer}>العميل: {selected.customerName} • {selected.area} ({selected.distanceKm} كم)</LocalizedText></View><LocalizedText style={styles.time}>{selected.createdAt}</LocalizedText></View>
        <View style={styles.priceRow}><View><LocalizedText style={styles.priceLabel}>السعر العادل</LocalizedText><LocalizedText style={styles.price}>{selected.fairPrice}</LocalizedText></View><View style={styles.urgency}><Ionicons name="flash" size={12} color="#BE123C" /><LocalizedText style={styles.urgencyText}>{selected.urgency}</LocalizedText></View></View>
        <Pressable onPress={() => navigation.navigate("TechnicianAiAssistant", { requestId: selected.id })} style={styles.aiCard}><View style={styles.aiIcon}><Ionicons name="sparkles" size={17} color="#8C6D14" /></View><View style={styles.aiCopy}><LocalizedText style={styles.aiTitle}>مساعد العروض الذكي</LocalizedText><LocalizedText style={styles.aiText}>يقترح السعر والقطع ونص الرد</LocalizedText></View><LocalizedText style={styles.aiOpen}>فتح</LocalizedText><Ionicons name="chevron-back" size={14} color="#8C6D14" /></Pressable>
        <View style={styles.actions}><Pressable onPress={() => navigation.navigate("TechnicianRequestDetails", { requestId: selected.id })} style={styles.secondaryButton}><LocalizedText style={styles.secondaryText}>عرض التفاصيل</LocalizedText></Pressable><Pressable onPress={() => navigation.navigate("TechnicianCreateOffer", { requestId: selected.id })} style={styles.primaryButton}><LocalizedText style={styles.primaryText}>إرسال عرض</LocalizedText></Pressable></View>
      </View> : <View style={styles.empty}><Ionicons name="map-outline" size={34} color="#CBD5E1" /><LocalizedText style={styles.emptyText}>لا توجد طلبات ضمن هذا الفلتر</LocalizedText></View>}

      <Pressable onPress={() => navigation.navigate("TechnicianPro")} style={styles.proCard}><View style={styles.proIcon}><Ionicons name="star" size={20} color="#8C6D14" /></View><View style={styles.proCopy}><LocalizedText style={styles.proTitle}>مزايا اشتراك عَمِّرها Pro</LocalizedText><LocalizedText style={styles.proSubtitle}>أولوية الظهور 3x + مساعد العروض الذكي</LocalizedText></View><Ionicons name="chevron-back" size={18} color="#8C6D14" /></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

function Metric({ label, value, color = colors.text }: { label: string; value: string; color?: string }) { return <View style={styles.metric}><LocalizedText style={styles.metricLabel}>{label}</LocalizedText><LocalizedText style={[styles.metricValue, { color }]}>{value}</LocalizedText></View>; }

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", minHeight: 66, paddingHorizontal: 14 }, identity: { alignItems: "center", flexDirection: "row-reverse", gap: 9 }, nameRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, name: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800" }, pro: { backgroundColor: "#FFF4C8", borderRadius: 5, color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "800", paddingHorizontal: 5, paddingVertical: 2 }, onlineRow: { alignItems: "center", flexDirection: "row-reverse", gap: 3, marginTop: 2 }, onlineDot: { backgroundColor: "#10B981", borderRadius: 4, height: 7, width: 7 }, offlineDot: { backgroundColor: "#94A3B8" }, onlineText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, offlineText: { color: "#64748B" },
  content: { gap: 12, padding: 14, paddingBottom: 28 }, metrics: { flexDirection: "row-reverse", gap: 8 }, metric: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 14, borderWidth: 1, flex: 1, padding: 10 }, metricLabel: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8 }, metricValue: { fontFamily: typography.fontFamily, fontSize: 13, fontWeight: "800", marginTop: 2 }, sectionHeading: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, title: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 17, fontWeight: "800", textAlign: "right" }, subtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" }, liveBadge: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 10, flexDirection: "row-reverse", gap: 4, paddingHorizontal: 8, paddingVertical: 5 }, liveDot: { backgroundColor: "#10B981", borderRadius: 4, height: 7, width: 7 }, liveText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, filters: { flexDirection: "row-reverse", gap: 7 }, filter: { backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 11, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 7 }, activeFilter: { backgroundColor: colors.secondary, borderColor: colors.secondary }, filterText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, activeFilterText: { color: "white" },
  mapCard: { ...shadows.subtle, borderColor: "#E7E2D8", borderRadius: 18, borderWidth: 1, height: 235, overflow: "hidden" }, map: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }, marker: { alignItems: "center", backgroundColor: colors.secondary, borderColor: "white", borderRadius: 19, borderWidth: 2, height: 38, justifyContent: "center", width: 38 }, selectedMarker: { backgroundColor: colors.primary, height: 44, width: 44 }, mapPrivacy: { ...shadows.subtle, alignItems: "center", alignSelf: "center", backgroundColor: "white", borderRadius: 10, bottom: 9, flexDirection: "row-reverse", gap: 4, paddingHorizontal: 8, paddingVertical: 6, position: "absolute" }, mapPrivacyText: { color: "#176B51", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "600" },
  requestCard: { ...shadows.raised, backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 20, borderWidth: 1, padding: 13 }, newRequest: { borderColor: "#D9B547", borderWidth: 2 }, requestTop: { flexDirection: "row-reverse", justifyContent: "space-between" }, categoryRow: { alignItems: "center", flexDirection: "row-reverse", gap: 5 }, category: { backgroundColor: "#FFF4C8", borderRadius: 7, color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 3 }, newBadge: { backgroundColor: "#FFF1F2", borderRadius: 7, color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 3 }, problem: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", marginTop: 5, textAlign: "right" }, customer: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 3, textAlign: "right" }, time: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7 }, priceRow: { alignItems: "center", backgroundColor: "#F8F7F4", borderRadius: 11, flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 10, padding: 9 }, priceLabel: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, textAlign: "right" }, price: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", textAlign: "right" }, urgency: { alignItems: "center", backgroundColor: "#FFF1F2", borderRadius: 8, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 7, paddingVertical: 5 }, urgencyText: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" },
  aiCard: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 12, borderWidth: 1, flexDirection: "row-reverse", gap: 7, marginTop: 9, padding: 9 }, aiIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 9, height: 32, justifyContent: "center", width: 32 }, aiCopy: { flex: 1 }, aiTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", textAlign: "right" }, aiText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, textAlign: "right" }, aiOpen: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, actions: { flexDirection: "row-reverse", gap: 8, marginTop: 10 }, secondaryButton: { alignItems: "center", borderColor: "#D6D3D1", borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 42 }, secondaryText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700" }, primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, flex: 1, justifyContent: "center", minHeight: 42 }, primaryText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "800" },
  proCard: { alignItems: "center", backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 9, padding: 11 }, proIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 11, height: 38, justifyContent: "center", width: 38 }, proCopy: { flex: 1 }, proTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", textAlign: "right" }, proSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" }, empty: { alignItems: "center", padding: 35 }, emptyText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, marginTop: 6 }
});
