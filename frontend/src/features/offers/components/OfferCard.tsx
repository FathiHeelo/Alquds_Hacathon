import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { Text, View } from "react-native";
import type { Offer } from "../../../domain/models/offer";
import type { Technician } from "../../../domain/models/technician";
import { Badge, Button, Card } from "../../../shared/components";
import { colors, spacing } from "../../../shared/theme";
import { priceLabels, comparePrice } from "../services/priceComparison";
import { aiStyles } from "../../ai-diagnosis/components/AiResults";

export function OfferCard({ offer, technician, fairPrice, onDetails, onProfile }: { offer: Offer; technician?: Technician; fairPrice?: { min: number; max: number }; onDetails(): void; onProfile(): void }) {
  const comparison = comparePrice(offer.price, fairPrice?.min, fairPrice?.max);
  return <Card><View style={{ gap: spacing.sm }}><View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: spacing.sm }}>
    <View style={{ flex: 1, gap: spacing.xs }}><LocalizedText style={[aiStyles.text, { fontWeight: "700" }]}>{technician?.name ?? "عرض فني"}</LocalizedText><LocalizedText style={[aiStyles.text, aiStyles.muted]}>{technician?.specialty ?? "تفاصيل الفني غير متاحة"}</LocalizedText>
      <LocalizedText style={aiStyles.text}>{technician?.ratingCount ? `★ ${technician.rating.toFixed(1)} · ${technician.ratingCount} تقييم` : technician ? "لا توجد تقييمات" : ""}{offer.etaMinutes != null ? `${technician ? " · " : ""}${offer.etaMinutes} دقيقة للوصول` : ""}</LocalizedText></View><LocalizedText style={[aiStyles.price, { color: colors.text }]}>{offer.price} ₪</LocalizedText></View>
    <View style={{ flexDirection: "row-reverse", gap: spacing.xs }}>{technician?.isVerified ? <Badge label="موثق" /> : null}{technician?.isPro ? <Badge label="Pro" /> : null}{comparison ? <Badge label={priceLabels[comparison]} /> : null}</View>
    <LocalizedText style={[aiStyles.text, aiStyles.muted]}>{offer.estimatedDurationMinutes != null ? `${offer.estimatedDurationMinutes} دقيقة · ` : ""}{offer.message}</LocalizedText><View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
      {technician ? <View style={{ flex: 1 }}><Button variant="outlined" onPress={onProfile}>ملف الفني</Button></View> : null}<View style={{ flex: 1 }}><Button onPress={onDetails}>مراجعة العرض</Button></View></View>
  </View></Card>;
}
