import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { Text, View } from "react-native";
import type { Offer } from "../../../domain/models/offer";
import type { Technician } from "../../../domain/models/technician";
import { Badge, Button, Card } from "../../../shared/components";
import { colors, spacing } from "../../../shared/theme";
import { priceLabelKeys, comparePrice } from "../services/priceComparison";
import { aiStyles } from "../../ai-diagnosis/components/AiResults";
import { useI18n } from "../../../shared/i18n/I18nProvider";

export function OfferCard({ offer, technician, fairPrice, onDetails, onProfile }: { offer: Offer; technician?: Technician; fairPrice?: { min: number; max: number }; onDetails(): void; onProfile(): void }) {
  const { t } = useI18n();
  const comparison = comparePrice(offer.price, fairPrice?.min, fairPrice?.max);
  return <Card><View style={{ gap: spacing.sm }}><View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: spacing.sm }}>
    <View style={{ flex: 1, gap: spacing.xs }}><LocalizedText style={[aiStyles.text, { fontWeight: "700" }]}>{technician?.name ?? "عرض فني"}</LocalizedText><LocalizedText style={[aiStyles.text, aiStyles.muted]}>{technician?.specialty ?? "تفاصيل الفني غير متاحة"}</LocalizedText>
      <LocalizedText style={aiStyles.text}>{technician?.ratingCount ? `★ ${technician.rating.toFixed(1)} · ${technician.ratingCount} تقييم` : technician ? "لا توجد تقييمات" : ""}{offer.etaMinutes != null ? `${technician ? " · " : ""}${offer.etaMinutes} دقيقة للوصول` : ""}</LocalizedText></View><LocalizedText style={[aiStyles.price, { color: colors.text }]}>{offer.price} ₪</LocalizedText></View>
    <View style={{ flexDirection: "row-reverse", gap: spacing.xs }}>{technician?.isVerified ? <Badge label="موثق" /> : null}{technician?.isPro ? <Badge label="Pro" /> : null}{comparison ? <View style={[styles.priceState, comparison === "good_value" || comparison === "within" ? styles.priceGood : comparison === "slightly_above" ? styles.priceWarn : styles.priceHigh]}><LocalizedText style={styles.priceStateText}>{t(priceLabelKeys[comparison])}</LocalizedText></View> : null}</View>
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>{offer.estimatedDurationMinutes != null ? `${offer.estimatedDurationMinutes} دقيقة · ` : ""}{offer.message}</LocalizedText><View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
      {technician ? <View style={{ flex: 1 }}><Button variant="outlined" onPress={onProfile}>ملف الفني</Button></View> : null}<View style={{ flex: 1 }}><Button onPress={onDetails}>مراجعة العرض</Button></View></View>
  </View></Card>;
}

const styles = {
  priceState: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  priceGood: { backgroundColor: "#DCFCE7" },
  priceWarn: { backgroundColor: "#FEF3C7" },
  priceHigh: { backgroundColor: "#FFE4E6" },
  priceStateText: { color: colors.text, fontSize: 11, fontWeight: "700" as const }
};
