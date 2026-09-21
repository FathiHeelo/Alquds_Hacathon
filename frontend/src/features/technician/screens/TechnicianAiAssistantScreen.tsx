import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { appConfig } from "../../../app/config/appConfig";
import { subscriptionApi } from "../../../services/api/subscriptionApi";
import { repairRequestRepository } from "../../repair-request/services/requestService";
import { analyzeTechnicianRequest, type TechnicianVoiceOfferResult } from "../../../services/ai/technicianVoiceOfferAdapter";
import { presentAiList, presentAiTerm } from "../../../services/ai/aiPresentation";
import { colors, shadows, typography } from "../../../shared/theme";
import type { TechnicianRequestItem } from "../technicianData";
import { PalestinianVoiceOfferCard } from "../components/PalestinianVoiceOfferCard";

type Props = NativeStackScreenProps<TechnicianStackParamList, "TechnicianAiAssistant">;

export function TechnicianAiAssistantScreen({ route, navigation }: Props) {
  const [request, setRequest] = useState<TechnicianRequestItem>();
  const [isPro, setIsPro] = useState(false);
  const [entitlementLoaded, setEntitlementLoaded] = useState(false);
  const [result, setResult] = useState<TechnicianVoiceOfferResult>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    void (async () => {
      const requests = await repairRequestRepository.listForTechnician();
      const selected = route.params?.requestId ? requests.find(({ id }) => id === route.params?.requestId) : requests[0];
      if (!selected) throw new Error("تعذر العثور على طلب صيانة متاح.");
      const entitlement = appConfig.demoMode
        ? { isPro: route.params?.isPro ?? true, capabilities: { offerAssistant: route.params?.isPro ?? true } }
        : await subscriptionApi.getMine();
      if (!active) return;
      const allowed = entitlement.isPro && entitlement.capabilities.offerAssistant;
      setRequest(selected); setIsPro(allowed); setEntitlementLoaded(true);
      if (allowed) { const generated = await analyzeTechnicianRequest(selected); if (active) setResult(generated); }
    })().catch((cause: unknown) => { if (active) { setEntitlementLoaded(true); setError(cause instanceof Error ? cause.message : "تعذر تشغيل المساعد الآن."); } });
    return () => { active = false; };
  }, [route.params?.isPro, route.params?.requestId]);

  const requestId = request?.id ?? route.params?.requestId ?? "";

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.header}><Pressable onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable><View style={styles.headerCopy}><LocalizedText style={styles.headerTitle}>مساعد العرض الذكي</LocalizedText><LocalizedText style={styles.headerSub}>ميزة عَمِّرها Pro</LocalizedText></View><View style={styles.pro}><Ionicons name="star" size={12} color="#FCD34D" /><LocalizedText style={styles.proText}>PRO</LocalizedText></View></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {!entitlementLoaded ? <View style={styles.loading}><LocalizedText style={styles.loadingTitle}>نحمّل بيانات الطلب...</LocalizedText></View> : error || !request ? <View style={styles.error}><Ionicons name="alert-circle" size={24} color="#BE123C" /><LocalizedText style={styles.errorTitle}>تعذر تشغيل المساعد الآن</LocalizedText><LocalizedText style={styles.errorText}>{error ?? "لا يوجد طلب متاح."}</LocalizedText></View> : !isPro ? <View style={styles.locked}><Ionicons name="lock-closed" size={32} color="#8C6D14" /><LocalizedText style={styles.lockedTitle}>هذه الميزة خاصة بـ Pro</LocalizedText><LocalizedText style={styles.lockedText}>فعّل الاشتراك للحصول على تشخيص وسعر ورسالة عرض مقترحة.</LocalizedText><Pressable onPress={() => navigation.navigate("TechnicianPro")} style={styles.primary}><LocalizedText style={styles.primaryText}>التعرف على Pro</LocalizedText></Pressable></View> : <>
        <View style={styles.request}><View style={styles.requestIcon}><Ionicons name="water" size={20} color="#1D4ED8" /></View><View style={styles.requestCopy}><LocalizedText style={styles.eyebrow}>الطلب قيد التحليل</LocalizedText><LocalizedText style={styles.problem}>{request.problem}</LocalizedText><LocalizedText style={styles.customer}>العميل: {request.customerName} • {request.distanceKm} كم</LocalizedText></View></View>
        <PalestinianVoiceOfferCard request={request} onResult={setResult} />
        {!result ? <View style={styles.loading}><View style={styles.spark}><Ionicons name="sparkles" size={28} color="#C59B27" /></View><LocalizedText style={styles.loadingTitle}>نحلّل المشكلة...</LocalizedText><LocalizedText style={styles.loadingText}>نراجع الوصف ونقدّر القطع والمدة والسعر العادل.</LocalizedText></View> : <>
          <View style={styles.analysis}><View style={styles.analysisHead}><Ionicons name="sparkles" size={18} color="#8C6D14" /><LocalizedText style={styles.analysisTitle}>تحليل جابر الذكي</LocalizedText><View style={styles.ready}><LocalizedText style={styles.readyText}>جاهز</LocalizedText></View></View><Detail icon="search" label="التشخيص المحتمل" value={presentAiTerm(result.diagnosis.likelyIssue)} /><Detail icon="cube" label="القطع المقترحة" value={presentAiList(result.possibleParts)} /><Detail icon="time" label="المدة المتوقعة" value={presentAiTerm(result.suggestedDuration)} last /></View>
          <View style={styles.priceCard}><View><LocalizedText style={styles.priceLabel}>السعر العادل في المنطقة</LocalizedText><LocalizedText style={styles.priceRange}>{result.fairPrice.min}–{result.fairPrice.max} ₪</LocalizedText></View><View style={styles.suggested}><LocalizedText style={styles.suggestedLabel}>عرضك المقترح</LocalizedText><LocalizedText style={styles.suggestedValue}>{result.suggestedPrice} ₪</LocalizedText></View></View>
          <View style={styles.messageCard}><LocalizedText style={styles.cardTitle}>رسالة العرض المقترحة</LocalizedText><LocalizedText style={styles.message}>{result.suggestedMessage}</LocalizedText></View>
        </>}
        <View style={styles.note}><Ionicons name="information-circle" size={15} color="#8C6D14" /><LocalizedText style={styles.noteText}>الاقتراح مساعد لك. راجع التفاصيل والسعر قبل إرسال العرض للعميل.</LocalizedText></View>
        <Pressable onPress={() => navigation.navigate("TechnicianCreateOffer", { requestId, suggestedPrice: result?.suggestedPrice, suggestedMessage: result?.suggestedMessage })} style={styles.primary}><Ionicons name="create" size={17} color={colors.text} /><LocalizedText style={styles.primaryText}>{result ? "تعديل العرض وإرساله" : "إنشاء العرض يدوياً"}</LocalizedText></Pressable>
      </>}
    </ScrollView>
  </SafeAreaView>;
}

function Detail({ icon, label, value, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; last?: boolean }) { return <View style={[styles.detail, last && styles.last]}><View style={styles.detailIcon}><Ionicons name={icon} size={16} color="#8C6D14" /></View><View style={styles.detailCopy}><LocalizedText style={styles.detailLabel}>{label}</LocalizedText><LocalizedText style={styles.detailValue}>{value}</LocalizedText></View></View>; }

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 9, minHeight: 62, paddingHorizontal: 12 }, back: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, headerCopy: { flex: 1 }, headerTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800", textAlign: "right" }, headerSub: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, marginTop: 1, textAlign: "right" }, pro: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 9, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 8, paddingVertical: 6 }, proText: { color: "#FCD34D", fontSize: 7, fontWeight: "800" }, content: { gap: 11, padding: 14, paddingBottom: 30 }, request: { ...shadows.subtle, alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 9, padding: 12 }, requestIcon: { alignItems: "center", backgroundColor: "#DBEAFE", borderRadius: 12, height: 43, justifyContent: "center", width: 43 }, requestCopy: { flex: 1 }, eyebrow: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700", textAlign: "right" }, problem: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", marginTop: 2, textAlign: "right" }, customer: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, marginTop: 3, textAlign: "right" }, loading: { alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 18, borderWidth: 1, padding: 28 }, spark: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 27, height: 54, justifyContent: "center", width: 54 }, loadingTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800", marginTop: 9 }, loadingText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 4, textAlign: "center" }, error: { alignItems: "center", backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderRadius: 18, borderWidth: 1, padding: 22 }, errorTitle: { color: "#9F1239", fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", marginTop: 6 }, errorText: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 8, marginTop: 3 }, analysis: { ...shadows.subtle, backgroundColor: "white", borderColor: "#EEDB9D", borderRadius: 18, borderWidth: 1, overflow: "hidden", paddingHorizontal: 12 }, analysisHead: { alignItems: "center", borderBottomColor: "#F0ECE3", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 6, minHeight: 51 }, analysisTitle: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800", textAlign: "right" }, ready: { backgroundColor: "#ECFDF5", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 }, readyText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" }, detail: { alignItems: "center", borderBottomColor: "#F0ECE3", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 8, minHeight: 66 }, last: { borderBottomWidth: 0 }, detailIcon: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 10, height: 35, justifyContent: "center", width: 35 }, detailCopy: { flex: 1 }, detailLabel: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 7, textAlign: "right" }, detailValue: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700", lineHeight: 15, marginTop: 2, textAlign: "right" }, priceCard: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 17, flexDirection: "row-reverse", justifyContent: "space-between", padding: 13 }, priceLabel: { color: "#CBD5E1", fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" }, priceRange: { color: "white", fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800", marginTop: 3, textAlign: "right" }, suggested: { alignItems: "center", backgroundColor: "rgba(197,155,39,0.17)", borderRadius: 11, paddingHorizontal: 12, paddingVertical: 7 }, suggestedLabel: { color: "#FDE68A", fontFamily: typography.fontFamily, fontSize: 7 }, suggestedValue: { color: colors.primary, fontFamily: typography.fontFamily, fontSize: 17, fontWeight: "900", marginTop: 1 }, messageCard: { backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 16, borderWidth: 1, padding: 12 }, cardTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "800", textAlign: "right" }, message: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 17, marginTop: 7, textAlign: "right", writingDirection: "rtl" }, note: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 13, flexDirection: "row-reverse", gap: 6, padding: 10 }, noteText: { color: "#8C6D14", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "right" }, primary: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 14, flexDirection: "row-reverse", gap: 6, justifyContent: "center", minHeight: 49 }, primaryText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "800" }, locked: { alignItems: "center", backgroundColor: "white", borderColor: "#EEDB9D", borderRadius: 19, borderWidth: 1, padding: 24 }, lockedTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "800", marginTop: 7 }, lockedText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 16, marginBottom: 14, marginTop: 4, textAlign: "center", width: "85%" }
});
