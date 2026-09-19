import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import type { Offer } from "../../../domain/models/offer";
import type { Technician } from "../../../domain/models/technician";
import { Button, ErrorState, LoadingState, PlatformFeeBreakdown, ScreenContainer } from "../../../shared/components";
import { technicianRepository } from "../../../services/repositories";
import { aiStyles, Detail } from "../../ai-diagnosis/components/AiResults";
import { offerRepository } from "../services/offerService";
import { priceLabels, comparePrice } from "../services/priceComparison";

export function OfferDetailsScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerOfferDetails">) {
  const [offer, setOffer] = useState<Offer>(); const [technician, setTechnician] = useState<Technician | null>(); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>(); const [confirming, setConfirming] = useState(false);
  useEffect(() => { let active = true; Promise.all([offerRepository.getOffer(route.params.offerId), technicianRepository.getById(route.params.technicianId ?? "")]).then(([found, tech]) => { if (!found || !tech) throw new Error("missing"); if (active) { setOffer(found); setTechnician(tech); } }).catch(() => { if (active) setError("تعذر العثور على العرض أو الفني."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [route.params.offerId, route.params.technicianId]);
  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>; if (error || !offer || !technician) return <ScreenContainer><ErrorState message={error} onRetry={() => navigation.goBack()} /></ScreenContainer>;
  const comparison = comparePrice(offer.price, 110, 150);
  if (confirming) return <ScreenContainer><LocalizedText style={[aiStyles.text, aiStyles.title]}>تأكيد قبول العرض</LocalizedText><Detail label="الفني المختار" value={technician.name} /><Detail label="السعر المتفق عليه مبدئياً" value={`${offer.price} ₪`} /><Detail label="الوصول المتوقع" value={`${offer.etaMinutes} دقيقة`} /><Detail label="طلب الصيانة" value={offer.message} /><PlatformFeeBreakdown servicePrice={offer.price} showTechnicianAmount /><Button onPress={async () => { try { const handoff = await offerRepository.acceptOffer(offer.id); navigation.replace("CustomerJobEntry", handoff); } catch { setError("تم قبول عرض آخر لهذا الطلب بالفعل."); setConfirming(false); } }}>تأكيد قبول العرض</Button><Button variant="outlined" onPress={() => setConfirming(false)}>رجوع</Button></ScreenContainer>;
  return <ScreenContainer><LocalizedText style={[aiStyles.text, aiStyles.title]}>تفاصيل العرض</LocalizedText><Detail label="الفني" value={technician.name} /><Detail label="الرسالة" value={offer.message} /><Detail label="السعر" value={`${offer.price} ₪`} /><Detail label="السعر العادل" value={comparison ? priceLabels[comparison] : "غير متاح"} /><Detail label="مدة العمل" value={`${offer.estimatedDurationMinutes} دقيقة`} /><Detail label="الوصول" value={`${offer.etaMinutes} دقيقة`} /><View style={aiStyles.section}><Button onPress={() => setConfirming(true)}>قبول العرض</Button><Button variant="outlined" onPress={() => navigation.navigate("CustomerTechnicianProfile", { technicianId: technician.id, requestId: route.params.requestId, offerId: offer.id })}>عرض ملف الفني</Button><Button variant="outlined" onPress={() => navigation.goBack()}>رجوع</Button></View></ScreenContainer>;
}
