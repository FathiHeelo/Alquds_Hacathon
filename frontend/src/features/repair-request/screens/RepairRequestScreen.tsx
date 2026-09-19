import { LocalizedTextInput } from "../../../shared/i18n/LocalizedTextInput";
import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { serviceCategories } from "../../../shared/constants/serviceCategories";
import { colors, shadows, typography } from "../../../shared/theme";
import { ErrorState } from "../../../shared/components";
import { RequestMediaList } from "../components/RequestMediaList";
import { RequestReview } from "../components/RequestReview";
import { useRepairRequest } from "../hooks/useRepairRequest";
import { timeOptions, urgencyOptions } from "../requestOptions";

export function RepairRequestScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerRepairRequest">) {
  const form = useRepairRequest(route.params.technicianId);
  const { draft, errors } = form;
  const disabled = !!form.busy;
  const transcript = form.suggestion?.voice.transcript ?? draft.voice?.transcript;

  const continueFlow = async () => {
    if (!form.reviewing) { form.review(); return; }
    const request = await form.submit();
    if (request) navigation.replace("CustomerAiEntry", { requestId: request.id });
  };

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="العودة" onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-forward" size={18} color="#475569" /></Pressable>
        <View style={styles.headerCopy}><LocalizedText style={styles.headerTitle}>{form.reviewing ? "مراجعة طلب الصيانة" : "طلب صيانة جديد"}</LocalizedText><LocalizedText style={styles.headerSubtitle}>بصوتك أو بالصورة • تشخيص فوري</LocalizedText></View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {form.reviewing ? <>
          <View style={styles.infoBanner}><Ionicons name="checkmark-circle" size={19} color="#047857" /><LocalizedText style={styles.infoText}>تأكد من التفاصيل قبل إرسالها للفنيين القريبين منك.</LocalizedText></View>
          <View style={styles.card}><RequestReview draft={draft} /></View>
          <Pressable disabled={disabled} onPress={form.edit} style={styles.secondaryButton}><Ionicons name="create-outline" size={17} color={colors.text} /><LocalizedText style={styles.secondaryButtonText}>تعديل التفاصيل</LocalizedText></Pressable>
        </> : <>
          <View style={[styles.card, styles.voiceCard]}>
            <View style={styles.cardHeading}>
              <View style={styles.headingRow}><View style={styles.aiIcon}><LocalizedText style={styles.aiText}>AI</LocalizedText></View><LocalizedText style={styles.cardTitle}>احكِ المشكلة بصوتك</LocalizedText></View>
              <View style={styles.readyBadge}><View style={styles.readyDot} /><LocalizedText style={styles.readyText}>{form.busy === "voice" ? "جارٍ التحليل" : "جاهز للتسجيل"}</LocalizedText></View>
            </View>
            <View style={styles.waveBox}>
              <View style={styles.waveform}>{[16, 28, 38, 22, 34, 18, 30, 12, 25].map((height, index) => <View key={index} style={[styles.wave, { height }]} />)}</View>
              {transcript ? <View style={styles.transcript}><LocalizedText style={styles.transcriptLabel}>التفريغ الصوتي التلقائي:</LocalizedText><LocalizedText style={styles.transcriptText}>“{transcript}”</LocalizedText></View> : <LocalizedText style={styles.voiceHint}>اضغط التسجيل واحكِ المشكلة بطريقتك، وسنرتب التفاصيل تلقائيًا.</LocalizedText>}
            </View>
            {form.suggestion ? <View style={styles.voiceActions}><Pressable onPress={form.dismissVoice} style={styles.smallGhost}><LocalizedText style={styles.smallGhostText}>إعادة التسجيل</LocalizedText></Pressable><Pressable onPress={form.applyVoice} style={styles.smallPrimary}><LocalizedText style={styles.smallPrimaryText}>اعتماد النص</LocalizedText></Pressable></View> : <Pressable disabled={disabled} onPress={() => void form.loadVoice()} style={styles.recordButton}><View style={styles.recordDot} /><LocalizedText style={styles.recordText}>{form.busy === "voice" ? "جارٍ تجهيز التسجيل…" : "ابدأ التسجيل الصوتي"}</LocalizedText></Pressable>}
          </View>

          <View style={styles.section}><LocalizedText style={styles.label}>وصف المشكلة</LocalizedText><LocalizedTextInput multiline value={draft.description} onChangeText={(description) => form.update({ description })} placeholder="اشرح العطل باختصار..." placeholderTextColor="#94A3B8" style={styles.textArea} />{errors.description ? <LocalizedText style={styles.error}>{errors.description}</LocalizedText> : null}</View>

          <View style={styles.section}><LocalizedText style={styles.label}>نوع الخدمة</LocalizedText><View style={styles.chips}>{serviceCategories.map((category) => { const selected = draft.category === category.id; return <Pressable key={category.id} disabled={disabled} onPress={() => form.update({ category: category.id })} style={[styles.chip, selected && styles.selectedChip]}><LocalizedText style={[styles.chipText, selected && styles.selectedChipText]}>{category.label}</LocalizedText></Pressable>; })}</View>{errors.category ? <LocalizedText style={styles.error}>{errors.category}</LocalizedText> : null}</View>

          <View style={styles.section}><LocalizedText style={styles.label}>أرفق صورة أو فيديو للعطل</LocalizedText><Pressable disabled={disabled} onPress={() => void form.attachMedia()} style={styles.mediaBox}><View style={styles.mediaIcon}><Ionicons name="camera" size={23} color={colors.primaryPressed} /></View><LocalizedText style={styles.mediaTitle}>{form.busy === "media" ? "جارٍ فتح المعرض…" : draft.media.length ? "إضافة صورة أو فيديو آخر" : "صوّر العطل أو اختر من المعرض"}</LocalizedText><LocalizedText style={styles.mediaHint}>الصورة تساعد الذكاء الاصطناعي على تشخيص أدق</LocalizedText></Pressable><RequestMediaList media={draft.media} onRemove={form.removeMedia} disabled={disabled} /></View>

          <View style={styles.section}><LocalizedText style={styles.label}>موقع الصيانة بالقدس</LocalizedText><View style={styles.locationBox}><View style={styles.locationIcon}><Ionicons name="location" size={19} color="#8C6D14" /></View><LocalizedTextInput value={draft.location.label} onChangeText={(label) => form.update({ location: { ...draft.location, label } })} style={styles.locationInput} /><View style={styles.autoBadge}><LocalizedText style={styles.autoText}>محدد تلقائياً</LocalizedText></View></View>{errors.location ? <LocalizedText style={styles.error}>{errors.location}</LocalizedText> : null}</View>

          <OptionSection label="درجة الاستعجال" value={draft.urgency} options={urgencyOptions} onChange={(urgency) => form.update({ urgency })} />
          <OptionSection label="الوقت المناسب" value={draft.preferredTime} options={timeOptions} onChange={(preferredTime) => form.update({ preferredTime })} />
        </>}
        {form.error ? <ErrorState message={form.error} /> : null}
      </ScrollView>

      <View style={styles.footer}><Pressable disabled={disabled} onPress={() => void continueFlow()} style={({ pressed }) => [styles.submitButton, disabled && styles.disabled, pressed && styles.pressed]}><Ionicons name={form.reviewing ? "checkmark-circle" : "sparkles"} size={18} color={colors.text} /><LocalizedText style={styles.submitText}>{form.busy === "submit" ? "جارٍ إرسال الطلب…" : form.reviewing ? "تأكيد الطلب والمتابعة" : "تشخيص العطل واقتراح السعر العادل"}</LocalizedText></Pressable></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function OptionSection<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { id: T; label: string }[]; onChange(value: T): void }) {
  return <View style={styles.section}><LocalizedText style={styles.label}>{label}</LocalizedText><View style={styles.optionRow}>{options.map((option) => { const selected = option.id === value; return <Pressable key={option.id} onPress={() => onChange(option.id)} style={[styles.option, selected && styles.selectedOption]}><LocalizedText style={[styles.optionText, selected && styles.selectedOptionText]}>{option.label}</LocalizedText></Pressable>; })}</View></View>;
}

const styles = createAdaptiveStyleSheet({
  safe: { backgroundColor: "#F8F7F4", flex: 1 }, header: { alignItems: "center", backgroundColor: "white", borderBottomColor: "#ECE7DC", borderBottomWidth: 1, flexDirection: "row-reverse", minHeight: 62, paddingHorizontal: 12 }, headerButton: { alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 11, height: 34, justifyContent: "center", width: 34 }, headerSpacer: { width: 34 }, headerCopy: { alignItems: "center", flex: 1 }, headerTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 15, fontWeight: "800" }, headerSubtitle: { color: colors.primaryPressed, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, content: { gap: 15, padding: 14, paddingBottom: 22 },
  card: { ...shadows.subtle, backgroundColor: "white", borderColor: "#E7D7A5", borderRadius: 21, borderWidth: 1, padding: 14 }, voiceCard: { backgroundColor: "#FFFDF7" }, cardHeading: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, headingRow: { alignItems: "center", flexDirection: "row-reverse", gap: 7 }, aiIcon: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, height: 29, justifyContent: "center", width: 29 }, aiText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "900" }, cardTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "800" }, readyBadge: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 10, flexDirection: "row-reverse", gap: 4, paddingHorizontal: 7, paddingVertical: 5 }, readyDot: { backgroundColor: "#10B981", borderRadius: 4, height: 7, width: 7 }, readyText: { color: "#047857", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700" }, waveBox: { alignItems: "center", backgroundColor: "white", borderColor: "#ECE7DC", borderRadius: 15, borderWidth: 1, marginTop: 11, padding: 11 }, waveform: { alignItems: "center", flexDirection: "row", gap: 5, height: 40, justifyContent: "center" }, wave: { backgroundColor: colors.primary, borderRadius: 4, width: 4 }, voiceHint: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, lineHeight: 15, textAlign: "center" }, transcript: { alignSelf: "stretch", backgroundColor: "#F8F7F4", borderRadius: 11, padding: 9 }, transcriptLabel: { color: "#94A3B8", fontFamily: typography.fontFamily, fontSize: 8, fontWeight: "700", textAlign: "right" }, transcriptText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 17, marginTop: 2, textAlign: "right", writingDirection: "rtl" },
  recordButton: { alignItems: "center", alignSelf: "center", backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderRadius: 11, borderWidth: 1, flexDirection: "row-reverse", gap: 6, marginTop: 10, paddingHorizontal: 14, paddingVertical: 9 }, recordDot: { backgroundColor: "#E11D48", borderRadius: 6, height: 11, width: 11 }, recordText: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700" }, voiceActions: { flexDirection: "row-reverse", gap: 8, justifyContent: "center", marginTop: 10 }, smallGhost: { backgroundColor: "#FFF1F2", borderRadius: 10, paddingHorizontal: 13, paddingVertical: 8 }, smallGhostText: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "700" }, smallPrimary: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 8 }, smallPrimaryText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "800" },
  section: { gap: 7 }, label: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 12, fontWeight: "700", textAlign: "right" }, textArea: { backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 14, borderWidth: 1, color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, minHeight: 84, padding: 11, textAlign: "right", textAlignVertical: "top", writingDirection: "rtl" }, chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7 }, chip: { backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 11, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 }, selectedChip: { backgroundColor: "#FFF8E3", borderColor: colors.primary, borderWidth: 2 }, chipText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600" }, selectedChipText: { color: colors.text, fontWeight: "800" }, error: { color: "#BE123C", fontFamily: typography.fontFamily, fontSize: 9, textAlign: "right" },
  mediaBox: { alignItems: "center", backgroundColor: "#FAFAF9", borderColor: "#D6D3D1", borderRadius: 16, borderStyle: "dashed", borderWidth: 2, padding: 15 }, mediaIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 12, height: 40, justifyContent: "center", width: 40 }, mediaTitle: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "700", marginTop: 6 }, mediaHint: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 8, marginTop: 2 }, locationBox: { alignItems: "center", backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 7, padding: 9 }, locationIcon: { alignItems: "center", backgroundColor: "#FFF4C8", borderRadius: 10, height: 34, justifyContent: "center", width: 34 }, locationInput: { color: colors.text, flex: 1, fontFamily: typography.fontFamily, fontSize: 10, fontWeight: "600", minHeight: 35, textAlign: "right" }, autoBadge: { backgroundColor: "#FFF8E3", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 5 }, autoText: { color: "#8C6D14", fontFamily: typography.fontFamily, fontSize: 7, fontWeight: "700" },
  optionRow: { flexDirection: "row-reverse", gap: 7 }, option: { alignItems: "center", backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: 5 }, selectedOption: { backgroundColor: "#FFF8E3", borderColor: colors.primary, borderWidth: 2 }, optionText: { color: colors.textMuted, fontFamily: typography.fontFamily, fontSize: 9, fontWeight: "600", textAlign: "center" }, selectedOptionText: { color: colors.text, fontWeight: "800" },
  infoBanner: { alignItems: "center", backgroundColor: "#ECFDF5", borderRadius: 14, flexDirection: "row-reverse", gap: 7, padding: 11 }, infoText: { color: "#176B51", flex: 1, fontFamily: typography.fontFamily, fontSize: 10, lineHeight: 17, textAlign: "right" }, secondaryButton: { alignItems: "center", backgroundColor: "white", borderColor: "#E7E2D8", borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 6, justifyContent: "center", minHeight: 46 }, secondaryButtonText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "700" },
  footer: { backgroundColor: "white", borderTopColor: "#ECE7DC", borderTopWidth: 1, padding: 11 }, submitButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 15, flexDirection: "row-reverse", gap: 7, justifyContent: "center", minHeight: 49 }, submitText: { color: colors.text, fontFamily: typography.fontFamily, fontSize: 11, fontWeight: "800" }, disabled: { opacity: 0.5 }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] }
});
