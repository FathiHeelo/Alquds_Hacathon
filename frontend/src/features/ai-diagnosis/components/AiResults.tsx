import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { createAdaptiveStyleSheet } from "../../../shared/theme/adaptiveStyles";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { DiagnosisResult, FairPriceResult } from "../../../domain/contracts/customerAiClient";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import { Badge, Card } from "../../../shared/components";
import { serviceCategories } from "../../../shared/constants/serviceCategories";
import { colors, spacing, typography } from "../../../shared/theme";
import { isLowConfidence } from "../services/loadCustomerAiFlow";
import { presentAiTerm } from "../../../services/ai/aiPresentation";
import { presentTechnicianType, presentUrgency } from "../../../services/ai/aiPresentation";
import { useI18n } from "../../../shared/i18n/I18nProvider";

export function DiagnosisCard({ result, request }: { result: DiagnosisResult; request: RepairRequest }) {
  const { language, t } = useI18n();
  return <Card><View style={aiStyles.content}>
    <View style={aiStyles.heading}><Ionicons name="sparkles-outline" size={24} color={colors.primaryPressed} />
      <LocalizedText style={[aiStyles.text, aiStyles.title]}>{t("diagnosis.title")}</LocalizedText></View>
    <Badge label={t("diagnosis.confidence", { value: Math.round(result.confidence * 100) })} />
    {isLowConfidence(result.confidence) ? <LocalizedText accessibilityRole="alert" style={[aiStyles.text, aiStyles.warning]}>{t("diagnosis.needsConfirmation")}</LocalizedText> : null}
    <Detail label={t("diagnosis.likelyIssue")} value={presentAiTerm(result.likelyIssue, language)} />
    <Detail label={t("diagnosis.serviceType")} value={serviceCategories.find(({ id }) => id === request.category)?.label} />
    <Detail label={t("diagnosis.technician")} value={presentTechnicianType(result.recommendedTechnicianType, language)} />
    <Detail label={t("diagnosis.urgency")} value={presentUrgency(result.urgency, language)} />
    <Detail label={t("diagnosis.duration")} value={presentAiTerm(result.estimatedDuration, language)} />
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>{t("diagnosis.disclaimer")}</LocalizedText>
  </View></Card>;
}

export function PriceCard({ result }: { result: FairPriceResult }) {
  const { t } = useI18n();
  return <Card><View style={aiStyles.content}>
    <View style={aiStyles.heading}><Ionicons name="wallet-outline" size={24} color={colors.primaryPressed} />
      <LocalizedText style={[aiStyles.text, aiStyles.title]}>{t("fairPrice.title")}</LocalizedText></View>
    <View style={aiStyles.priceHero}><LocalizedText style={aiStyles.priceKicker}>AMMERHA FAIR PRICE</LocalizedText><LocalizedText accessibilityLabel={t("fairPrice.rangeAccessibility", { min: result.min, max: result.max })} style={aiStyles.price}>{result.min} – {result.max} ₪</LocalizedText></View>
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>{t("fairPrice.currency")}</LocalizedText>
    <LocalizedText style={aiStyles.text}>{t("fairPrice.explanation", { confidence: Math.round(result.confidence * 100) })}</LocalizedText>
    <LocalizedText style={[aiStyles.text, aiStyles.disclaimer]}>{t("fairPrice.disclaimer")}</LocalizedText>
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
  priceHero: { backgroundColor: "#FFF8E3", borderColor: "#E5C86E", borderRadius: 16, borderWidth: 1, gap: spacing.xs, padding: spacing.md },
  priceKicker: { color: colors.primaryPressed, fontFamily: typography.fontFamily, fontSize: typography.size.sm, fontWeight: typography.weight.bold, textAlign: "center", writingDirection: "ltr" },
  disclaimer: { backgroundColor: "#F8FAFC", borderRadius: 12, lineHeight: 19, padding: spacing.sm },
  price: { color: colors.secondary, fontFamily: typography.fontFamily, fontSize: typography.size.xl,
    fontWeight: typography.weight.bold, textAlign: "right", writingDirection: "ltr" }
});
