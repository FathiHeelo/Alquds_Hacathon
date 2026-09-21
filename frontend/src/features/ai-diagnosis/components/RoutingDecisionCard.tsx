import type { DiagnosisResult } from "@ammerha/ai";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, View } from "react-native";
import { useState } from "react";

import { getVerifiedAssistanceContact } from "../../../app/config/assistanceContacts";
import { urgentDispatchApi, type UrgentDispatchState } from "../../../services/api/urgentDispatchApi";
import { Button, Card } from "../../../shared/components";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { colors, spacing } from "../../../shared/theme";
import { aiStyles } from "./AiResults";

const reasonText: Record<string, { ar: string; en: string }> = {
  fire_immediate_danger: { ar: "الوصف يشير إلى حريق أو خطر فوري، لذلك تكون جهة الطوارئ هي الأولوية.", en: "The description indicates fire or immediate danger, so emergency services take priority." },
  medical_immediate_danger: { ar: "الوصف يشير إلى خطر قد يهدد الحياة ويحتاج استجابة طبية طارئة.", en: "The description indicates a potentially life-threatening situation requiring emergency medical help." },
  electrical_immediate_danger: { ar: "وجود دخان أو شرر يجعل الحالة خطراً كهربائياً فورياً، وليس طلب صيانة عادياً.", en: "Smoke or sparking makes this an immediate electrical danger rather than a normal repair request." },
  public_infrastructure: { ar: "المشكلة تبدو مرتبطة ببنية أو خدمة عامة خارج نطاق فني منزلي.", en: "The issue appears connected to public infrastructure rather than a household technician." },
  social_support_needed: { ar: "الحالة تحتاج جهة مساعدة اجتماعية متخصصة بدلاً من فني صيانة.", en: "This situation needs a specialized social assistance service rather than a maintenance technician." },
  urgent_maintenance: { ar: "الحالة صيانة عاجلة ويمكن لفني مؤهل التعامل معها بسرعة.", en: "This is urgent maintenance that an eligible qualified technician can address." },
  normal_maintenance: { ar: "الحالة مناسبة لمسار عروض الفنيين المعتاد.", en: "This situation is suitable for the normal technician offer flow." }
};

const safetyText: Record<string, { ar: string; en: string }> = {
  leave_area: { ar: "ابتعد عن منطقة الخطر فوراً.", en: "Move away from the danger area immediately." },
  do_not_reenter: { ar: "لا تعد إلى المكان قبل تأكيد أنه آمن.", en: "Do not re-enter until the area is confirmed safe." },
  move_to_safety: { ar: "انتقل إلى مكان آمن واطلب المساعدة.", en: "Move to a safe place and request help." },
  cut_power_if_safe: { ar: "افصل الكهرباء فقط إذا كان ذلك آمناً ومن دون الاقتراب من الخطر.", en: "Turn off power only if it is safe and does not require approaching the hazard." },
  avoid_water_contact: { ar: "لا تستخدم الماء قرب مصدر كهربائي.", en: "Do not use water near an electrical source." },
  keep_distance: { ar: "حافظ على مسافة آمنة عن موقع المشكلة.", en: "Keep a safe distance from the affected area." },
  shut_water_if_safe: { ar: "أغلق مصدر المياه إن أمكن ذلك بأمان.", en: "Shut off the water supply if it is safe to do so." }
};

export function RoutingDecisionCard({ diagnosis, requestId, onReturn }: { diagnosis: DiagnosisResult; requestId: string; onReturn(): void }) {
  const { language, t } = useI18n();
  const [dispatch, setDispatch] = useState<UrgentDispatchState>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const route = diagnosis.routing;
  if (route.type === "NORMAL_TECHNICIAN") return null;
  const contact = getVerifiedAssistanceContact(route.assistanceCategory, language);
  const nonTechnician = route.type === "EMERGENCY_SERVICE" || route.type === "PUBLIC_SERVICE" || route.type === "SOCIAL_ASSISTANCE";
  const title = route.type === "EMERGENCY_SERVICE" ? t("routing.emergencyTitle") : route.type === "PUBLIC_SERVICE" ? t("routing.publicTitle") : route.type === "SOCIAL_ASSISTANCE" ? t("routing.socialTitle") : t("routing.urgentTitle");
  const run = async (action: () => Promise<UrgentDispatchState>) => { setBusy(true); setError(undefined); try { setDispatch(await action()); } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر تشغيل البحث العاجل."); } finally { setBusy(false); } };

  return <Card><View style={styles.content}>
    <View style={styles.heading}><Ionicons name={nonTechnician ? "warning" : "flash"} size={26} color={nonTechnician ? "#BE123C" : "#B45309"} /><LocalizedText accessibilityRole="header" style={[aiStyles.text, styles.title]}>{title}</LocalizedText></View>
    <LocalizedText style={aiStyles.text}>{reasonText[route.reasonCode]?.[language] ?? route.reasonCode}</LocalizedText>
    {route.safetyInstructionCodes.map((code) => <View key={code} style={styles.safety}><Ionicons name="shield-checkmark" size={16} color="#BE123C" /><LocalizedText style={[aiStyles.text, styles.safetyText]}>{safetyText[code]?.[language] ?? code}</LocalizedText></View>)}
    {nonTechnician ? <>
      <LocalizedText style={[aiStyles.text, aiStyles.muted]}>{t("routing.noAutoContact")}</LocalizedText>
      {contact ? <Button onPress={() => void Linking.openURL(`tel:${contact.phone.replace(/[^+0-9]/g, "")}`)}>{contact.label}</Button> : <LocalizedText accessibilityRole="alert" style={[aiStyles.text, styles.unavailable]}>{t("routing.contactUnavailable")}</LocalizedText>}
      <Button variant="outlined" onPress={onReturn}>{t("routing.cancel")}</Button>
    </> : <>
      {dispatch ? <View style={styles.dispatch}><LocalizedText style={aiStyles.text}>{language === "ar" ? `نطاق البحث الحالي: ${dispatch.radiusKm} كم` : `Current search radius: ${dispatch.radiusKm} km`}</LocalizedText><LocalizedText style={aiStyles.text}>{language === "ar" ? `الفنيون المؤهلون: ${dispatch.eligibleCount}` : `Eligible technicians: ${dispatch.eligibleCount}`}</LocalizedText><LocalizedText style={[aiStyles.text, aiStyles.muted]}>{dispatch.status === "assigned" ? (language === "ar" ? "تم تعيين فني واحد للطلب." : "One technician has been assigned.") : (language === "ar" ? "بانتظار أول فني مؤهل يقبل الطلب." : "Waiting for the first eligible technician to accept.")}</LocalizedText></View> : null}
      {error ? <LocalizedText accessibilityRole="alert" style={[aiStyles.text, styles.unavailable]}>{error}</LocalizedText> : null}
      {!dispatch ? <Button disabled={busy} onPress={() => void run(() => urgentDispatchApi.start(requestId))}>{t("routing.startDispatch")}</Button> : dispatch.status === "searching" && dispatch.canExpand ? <Button disabled={busy} onPress={() => void run(() => urgentDispatchApi.expand(requestId))}>{t("routing.expandDispatch")}</Button> : null}
      {dispatch?.status === "searching" ? <Pressable disabled={busy} onPress={() => void run(() => urgentDispatchApi.get(requestId, "customer"))}><LocalizedText style={[aiStyles.text, styles.refresh]}>{language === "ar" ? "تحديث حالة البحث" : "Refresh search status"}</LocalizedText></Pressable> : null}
    </>}
  </View></Card>;
}

const styles = {
  content: { gap: spacing.md },
  heading: { alignItems: "center" as const, flexDirection: "row-reverse" as const, gap: spacing.sm },
  title: { flex: 1, fontWeight: "800" as const },
  safety: { alignItems: "center" as const, backgroundColor: "#FFF1F2", borderRadius: 12, flexDirection: "row-reverse" as const, gap: spacing.sm, padding: spacing.sm },
  safetyText: { color: "#9F1239", flex: 1 },
  unavailable: { color: "#BE123C", fontWeight: "700" as const },
  dispatch: { backgroundColor: "#FFF8E3", borderRadius: 12, gap: spacing.xs, padding: spacing.md },
  refresh: { color: colors.primaryPressed, fontWeight: "700" as const, textDecorationLine: "underline" as const }
};
