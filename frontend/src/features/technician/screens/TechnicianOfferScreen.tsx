import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TechnicianStackParamList } from "../../../app/navigation/navigation.types";
import { colors, shadows, typography } from "../../../shared/theme";
import { offerRepository } from "../../offers/services/offerService";
import { getTechnicianRequest, type TechnicianRequestItem } from "../technicianData";
import { demoTechnicians } from "../../../demo/fixtures/technicians";
import { appConfig } from "../../../app/config/appConfig";
import { repairRequestRepository, technicianRepository } from "../../../services/repositories";
import type { Technician } from "../../../domain/models/technician";

export function TechnicianOfferScreen({ navigation, route }: NativeStackScreenProps<TechnicianStackParamList, "TechnicianCreateOffer">) {
  const [request, setRequest] = useState<TechnicianRequestItem | undefined>(() => appConfig.demoMode ? getTechnicianRequest(route.params.requestId) : undefined);
  const [technician, setTechnician] = useState<Technician | null>(() => appConfig.demoMode ? demoTechnicians[0] ?? null : null);
  const [loading, setLoading] = useState(!appConfig.demoMode);
  const [price, setPrice] = useState(String(route.params.suggestedPrice ?? (appConfig.demoMode ? 120 : "")));
  const [etaMinutes, setEtaMinutes] = useState(appConfig.demoMode ? "20" : "");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(appConfig.demoMode ? "40" : "");
  const [message, setMessage] = useState(route.params.suggestedMessage ?? (appConfig.demoMode ? "مرحباً، أستطيع تنفيذ الصيانة المطلوبة. أرسل لي أي تفاصيل إضافية تساعدني في تجهيز العرض." : ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (appConfig.demoMode) return;
    let active = true;
    void Promise.all([repairRequestRepository.listForTechnician(), technicianRepository.getMine()]).then(([requests, profile]) => {
      if (active) { setRequest(requests.find((item) => item.id === route.params.requestId)); setTechnician(profile); }
    }).catch(() => { if (active) setError("تعذر تحميل بيانات الطلب والفني."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.requestId]);

  if (sent) return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><View style={styles.success}><View style={styles.successIcon}><Ionicons name="checkmark" size={34} color="#047857" /></View><LocalizedText style={styles.successTitle}>تم إرسال العرض للعميل</LocalizedText><LocalizedText style={styles.successText}>سيتم إعلامك داخل عَمِّرها عند قبول العرض، ولن تظهر بيانات التواصل الخاصة بالعميل.</LocalizedText><Pressable onPress={() => navigation.popTo("TechnicianTabs")} style={styles.primary}><LocalizedText style={styles.primaryText}>العودة للوحة الفني</LocalizedText></Pressable></View></SafeAreaView>;

  const submit = async () => {
    const numericPrice = Number(price);
    if (!numericPrice || !message.trim() || !request || (!appConfig.demoMode && !technician)) return;
    setSaving(true); setError("");
    try {
      await offerRepository.createOffer({ repairRequestId: route.params.requestId, technicianId: technician?.id ?? "", price: numericPrice, message: message.trim(), ...(Number(estimatedDurationMinutes) > 0 ? { estimatedDurationMinutes: Number(estimatedDurationMinutes) } : {}), ...(Number(etaMinutes) > 0 ? { etaMinutes: Number(etaMinutes) } : {}) });
      setSent(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذر إرسال العرض. حاول مرة أخرى."); }
    finally { setSaving(false); }
  };

  if (loading) return <SafeAreaView style={styles.safe}><View style={styles.success}><LocalizedText style={styles.successTitle}>جارٍ تحميل الطلب</LocalizedText></View></SafeAreaView>;
  if (!request) return <SafeAreaView style={styles.safe}><View style={styles.success}><LocalizedText style={styles.successTitle}>الطلب غير متاح</LocalizedText><LocalizedText style={styles.successText}>{error || "لا يمكن إرسال عرض لطلب غير موجود أو غير متاح."}</LocalizedText></View></SafeAreaView>;

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.header}><Pressable onPress={() => navigation.goBack()} style={styles.back}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable><View style={styles.headerCopy}><LocalizedText style={styles.headerTitle}>إرسال عرض صيانة</LocalizedText><LocalizedText style={styles.headerSubtitle}>{request?.problem ?? "طلب صيانة"}</LocalizedText></View><View style={styles.headerSpace} /></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {route.params.suggestedPrice == null ? <Pressable onPress={() => navigation.navigate("TechnicianAiAssistant", { requestId: request.id, isPro: technician?.isPro })} style={styles.aiAssistant}><View style={styles.aiAssistantIcon}><Ionicons name="sparkles" size={20} color="#8C6D14" /></View><View style={styles.aiAssistantCopy}><LocalizedText style={styles.aiAssistantTitle}>حضّر العرض بمساعد Pro</LocalizedText><LocalizedText style={styles.aiAssistantText}>ملخص، قطع محتملة، مدة، نطاق سعر ورسالة جاهزة</LocalizedText></View><Ionicons name="chevron-back" size={18} color="#8C6D14" /></Pressable> : <View style={styles.aiReady}><Ionicons name="checkmark-circle" size={18} color="#047857" /><LocalizedText style={styles.aiReadyText}>تم تعبئة اقتراح المساعد الذكي ويمكنك تعديله قبل الإرسال.</LocalizedText></View>}
      {appConfig.demoMode || route.params.suggestedPrice != null ? <View style={styles.fairCard}><View><LocalizedText style={styles.fairLabel}>{route.params.suggestedPrice != null ? "اقتراح مساعد تجريبي" : "السعر المقترح التجريبي"}</LocalizedText><LocalizedText style={styles.fairPrice}>{route.params.suggestedPrice != null ? `${route.params.suggestedPrice} ₪` : request.fairPrice}</LocalizedText></View>{appConfig.demoMode ? <View style={styles.fairBadge}><Ionicons name="sparkles" size={14} color="#047857" /><LocalizedText style={styles.fairBadgeText}>وضع العرض</LocalizedText></View> : null}</View> : null}
      <View style={styles.card}><LocalizedText style={styles.label}>قيمة العرض المالي</LocalizedText><View style={styles.priceInput}><LocalizedTextInput value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="المبلغ" style={styles.priceField} /><LocalizedText style={styles.currency}>₪ شيكل</LocalizedText></View><View style={styles.row}><NumericField label="وقت الوصول المتوقع" value={etaMinutes} onChangeText={setEtaMinutes} />{appConfig.demoMode ? <NumericField label="مدة العمل المقدّرة" value={estimatedDurationMinutes} onChangeText={setEstimatedDurationMinutes} /> : null}</View></View>
      <View style={styles.card}><View style={styles.labelRow}><LocalizedText style={styles.label}>رسالة العرض للعميل</LocalizedText><View style={styles.aiBadge}><Ionicons name="sparkles" size={11} color="#8C6D14" /><LocalizedText style={styles.aiBadgeText}>اقتراح ذكي</LocalizedText></View></View><LocalizedTextInput multiline value={message} onChangeText={setMessage} style={styles.messageInput} textAlignVertical="top" /><LocalizedText style={styles.hint}>تظهر الرسالة داخل التطبيق فقط. لا تضف رقم هاتف أو رابط تواصل خارجي.</LocalizedText></View>
      <View style={styles.privacy}><Ionicons name="shield-checkmark" size={18} color="#176B51" /><LocalizedText style={styles.privacyText}>يحمي عَمِّرها حقك وحق العميل عند إبقاء الاتفاق والدفع والمراسلة داخل التطبيق.</LocalizedText></View>
      {error ? <LocalizedText style={styles.hint}>{error}</LocalizedText> : null}
      <Pressable disabled={saving || !Number(price) || !message.trim() || !request || (!appConfig.demoMode && !technician)} onPress={() => void submit()} style={({ pressed }) => [styles.primary, (saving || !Number(price) || !message.trim() || !request || (!appConfig.demoMode && !technician)) && styles.disabled, pressed && styles.pressed]}><Ionicons name="send" size={18} color={colors.text} /><LocalizedText style={styles.primaryText}>{saving ? "جارٍ إرسال العرض..." : "إرسال العرض للعميل"}</LocalizedText></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

function NumericField({ label, value, onChangeText }: { label: string; value: string; onChangeText(value: string): void }) { return <View style={[styles.info, { flex: 1, flexDirection: "column", alignItems: "stretch" }]}><LocalizedText style={styles.infoText}>{label} (دقيقة)</LocalizedText><LocalizedTextInput value={value} onChangeText={onChangeText} keyboardType="number-pad" placeholder="اختياري" style={{ minHeight: 34, color: colors.text, textAlign: "right" }} /></View>; }

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 64, paddingHorizontal: 12 }, back: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, headerCopy: { alignItems: "center", flex: 1 }, headerTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 14, fontWeight: "800" }, headerSubtitle: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8 }, headerSpace: { width: 34 }, content: { gap: 12, padding: 14, paddingBottom: 30 }, aiAssistant: { alignItems: "center", backgroundColor: "#FFF8E3", borderColor: "#EEDB9D", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 9, padding: 12 }, aiAssistantIcon: { alignItems: "center", backgroundColor: "white", borderRadius: 11, height: 40, justifyContent: "center", width: 40 }, aiAssistantCopy: { flex: 1 }, aiAssistantTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, aiAssistantText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2, textAlign: "right" }, aiReady: { alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#A7E6CD", borderRadius: 13, borderWidth: 1, flexDirection: "row-reverse", gap: 6, padding: 10 }, aiReadyText: { color: "#176B51", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" }, fairCard: { alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#A7E6CD", borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", padding: 13 }, fairLabel: { color: "#397564", fontFamily: typography.fontFamily, fontSize: 8, textAlign: "right" }, fairPrice: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 18, fontWeight: "900", marginTop: 2, textAlign: "right" }, fairBadge: { alignItems: "center", backgroundColor: "white", borderRadius: 9, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 7, paddingVertical: 5 }, fairBadgeText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 17, borderWidth: 1, padding: 13 }, label: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800", textAlign: "right" }, priceInput: { alignItems: "center", borderColor: colors.primary, borderRadius: 13, borderWidth: 2, flexDirection: "row-reverse", marginTop: 8, paddingHorizontal: 11 }, priceField: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 18, fontWeight: "800", minHeight: 48, textAlign: "right" }, currency: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700" }, row: { flexDirection: "row-reverse", gap: 8, marginTop: 10 }, info: { alignItems: "center", backgroundColor: "#F8F7F4", borderRadius: 9, flexDirection: "row-reverse", gap: 4, padding: 7 }, infoText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8 }, labelRow: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, aiBadge: { alignItems: "center", backgroundColor: "#FFF8E3", borderRadius: 8, flexDirection: "row-reverse", gap: 3, paddingHorizontal: 6, paddingVertical: 4 }, aiBadgeText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" }, messageInput: { backgroundColor: "#FAFAF9", borderColor: "#E7E2D8", borderRadius: 13, borderWidth: 1, color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 18, marginTop: 8, minHeight: 110, padding: 10, textAlign: "right", writingDirection: "rtl" }, hint: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 7, lineHeight: 13, marginTop: 6, textAlign: "right" }, privacy: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 13, flexDirection: "row-reverse", gap: 7, padding: 10 }, privacyText: { color: "#176B51", flex: 1, fontFamily: typography.fontFamily, fontSize: 8, lineHeight: 14, textAlign: "right" }, primary: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 14, flexDirection: "row-reverse", gap: 7, justifyContent: "center", minHeight: 49, paddingHorizontal: 18 }, primaryText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800" }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] }, success: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 }, successIcon: { alignItems: "center", backgroundColor: "#D1FAE5", borderRadius: 36, height: 72, justifyContent: "center", width: 72 }, successTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 19, fontWeight: "800", marginTop: 14 }, successText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 18, marginBottom: 18, marginTop: 6, textAlign: "center" }
});
