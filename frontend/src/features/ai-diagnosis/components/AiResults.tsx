import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { DiagnosisResult, FairPriceResult } from "../../../domain/contracts/customerAiClient";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import { Badge, Card } from "../../../shared/components";
import { serviceCategories } from "../../../shared/constants/serviceCategories";
import { colors, spacing, typography } from "../../../shared/theme";
import { urgencyOptions } from "../../repair-request/requestOptions";
import { isLowConfidence } from "../services/loadCustomerAiFlow";
import { presentAiTerm } from "../../../services/ai/aiPresentation";

export function DiagnosisCard({ result, request }: { result: DiagnosisResult; request: RepairRequest }) {
  return <Card><View style={aiStyles.content}>
    <View style={aiStyles.heading}><Ionicons name="sparkles-outline" size={24} color={colors.primaryPressed} />
      <LocalizedText style={[aiStyles.text, aiStyles.title]}>التشخيص المبدئي</LocalizedText></View>
    <Badge label={`نسبة الثقة: ${Math.round(result.confidence * 100)}%`} />
    {isLowConfidence(result.confidence) ? <LocalizedText accessibilityRole="alert" style={[aiStyles.text, aiStyles.warning]}>التشخيص المبدئي يحتاج إلى تأكيد</LocalizedText> : null}
    <Detail label="المشكلة المحتملة" value={presentAiTerm(result.likelyIssue)} />
    <Detail label="نوع الخدمة" value={serviceCategories.find(({ id }) => id === request.category)?.label} />
    <Detail label="درجة الاستعجال المقترحة" value={urgencyOptions.find(({ id }) => id === result.urgency)?.label} />
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>يؤكد الفني طبيعة العطل عند المعاينة.</LocalizedText>
  </View></Card>;
}

export function PriceCard({ result }: { result: FairPriceResult }) {
  return <Card><View style={aiStyles.content}>
    <View style={aiStyles.heading}><Ionicons name="wallet-outline" size={24} color={colors.primaryPressed} />
      <LocalizedText style={[aiStyles.text, aiStyles.title]}>السعر العادل المتوقع</LocalizedText></View>
    <LocalizedText accessibilityLabel={`من ${result.min} إلى ${result.max} شيكل`} style={aiStyles.price}>{result.min} – {result.max} ₪</LocalizedText>
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>شيكل إسرائيلي (NIS)</LocalizedText>
    <LocalizedText style={aiStyles.text}>التقدير مبني على نوع الخدمة ودرجة الاستعجال، بنسبة ثقة {Math.round(result.confidence * 100)}%.</LocalizedText>
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>تقدير إرشادي، وليس سعراً نهائياً مضموناً.</LocalizedText>
  </View></Card>;
}

export function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <View style={aiStyles.content}><LocalizedText style={[aiStyles.text, aiStyles.muted]}>{label}</LocalizedText><LocalizedText style={aiStyles.text}>{value}</LocalizedText></View>;
}

export const aiStyles = createAdaptiveStyleSheet({
  content: { gap: spacing.sm }, section: { gap: spacing.md, marginBottom: spacing.lg },
  heading: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  text: { fontFamily: typography.fontFamily, fontSize: typography.size.md, lineHeight: typography.lineHeight.md,
    color: colors.text, textAlign: "right", writingDirection: "rtl", flexShrink: 1 },
  title: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  muted: { color: colors.textMuted, fontSize: typography.size.sm },
  warning: { color: colors.primaryPressed, fontWeight: typography.weight.semibold },
  price: { color: colors.secondary, fontFamily: typography.fontFamily, fontSize: typography.size.xl,
    fontWeight: typography.weight.bold, textAlign: "right", writingDirection: "ltr" }
});
