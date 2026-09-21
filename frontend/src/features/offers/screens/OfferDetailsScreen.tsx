import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import type { Offer } from "../../../domain/models/offer";
import type { Technician } from "../../../domain/models/technician";
import type { FairPriceResult } from "../../../domain/contracts/customerAiClient";
import { Button, ErrorState, LoadingState, PlatformFeeBreakdown, ScreenContainer } from "../../../shared/components";
import { technicianRepository } from "../../../services/repositories";
import { aiStyles, Detail } from "../../ai-diagnosis/components/AiResults";
import { offerRepository } from "../services/offerService";
import { priceLabelKeys, comparePrice } from "../services/priceComparison";
import { repairRequestRepository } from "../../repair-request/services/requestService";
import { customerAiClient } from "../../../services/ai/customerAiClient";
import { useI18n } from "../../../shared/i18n/I18nProvider";

export function OfferDetailsScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerOfferDetails">) {
  const { t } = useI18n();
  const [offer, setOffer] = useState<Offer>(); const [technician, setTechnician] = useState<Technician | null>(); const [fairPrice, setFairPrice] = useState<FairPriceResult>(); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>(); const [confirming, setConfirming] = useState(false);
  useEffect(() => { let active = true; void (async () => { const found = await offerRepository.getOffer(route.params.offerId) ?? (await offerRepository.getOffersForRequest(route.params.requestId)).find(({ id }) => id === route.params.offerId); if (!found) throw new Error("missing offer"); const [tech, request] = await Promise.all([technicianRepository.getById(route.params.technicianId ?? found.technicianId), repairRequestRepository.getRequest(route.params.requestId)]); if (!tech) throw new Error("missing profile"); let estimate: FairPriceResult | undefined; if (request) { try { estimate = await customerAiClient.estimatePrice(request); } catch { estimate = undefined; } } if (active) { setOffer(found); setTechnician(tech); setFairPrice(estimate); } })().catch(() => { if (active) setError("تعذر العثور على العرض أو الفني."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [route.params.offerId, route.params.requestId, route.params.technicianId]);
  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>; if (error || !offer || !technician) return <ScreenContainer><ErrorState message={error} onRetry={() => navigation.goBack()} /></ScreenContainer>;
  const comparison = fairPrice ? comparePrice(offer.price, fairPrice.min, fairPrice.max) : undefined;
  if (confirming) return <ScreenContainer><LocalizedText style={[aiStyles.text, aiStyles.title]}>تأكيد قبول العرض</LocalizedText><Detail label="الفني المختار" value={technician.name} /><Detail label="السعر المتفق عليه مبدئياً" value={`${offer.price} ₪`} />{offer.etaMinutes != null ? <Detail label="الوصول المتوقع" value={`${offer.etaMinutes} دقيقة`} /> : null}<Detail label="طلب الصيانة" value={offer.message} /><PlatformFeeBreakdown servicePrice={offer.price} showTechnicianAmount /><Button onPress={async () => { try { const handoff = await offerRepository.acceptOffer(offer.id); navigation.replace("CustomerJobEntry", handoff); } catch { setError("تعذر قبول العرض. قد يكون عرض آخر قد قُبل بالفعل."); setConfirming(false); } }}>تأكيد قبول العرض</Button><Button variant="outlined" onPress={() => setConfirming(false)}>رجوع</Button></ScreenContainer>;
  return <ScreenContainer><LocalizedText style={[aiStyles.text, aiStyles.title]}>تفاصيل العرض</LocalizedText><Detail label="الفني" value={technician.name} /><Detail label="الرسالة" value={offer.message} /><Detail label="سعر خدمة الفني" value={`${offer.price} ₪`} /><Detail label="نطاق الخدمة العادل" value={fairPrice ? `${fairPrice.min}–${fairPrice.max} ₪` : "غير متاح"} /><Detail label="تقييم السعر" value={comparison ? t(priceLabelKeys[comparison]) : "غير متاح"} />{offer.estimatedDurationMinutes != null ? <Detail label="مدة العمل" value={`${offer.estimatedDurationMinutes} دقيقة`} /> : null}{offer.etaMinutes != null ? <Detail label="الوصول" value={`${offer.etaMinutes} دقيقة`} /> : null}<LocalizedText style={[aiStyles.text, aiStyles.disclaimer]}>{t("fairPrice.disclaimer")}</LocalizedText><View style={aiStyles.section}><Button onPress={() => setConfirming(true)}>قبول العرض</Button><Button variant="outlined" onPress={() => navigation.navigate("CustomerTechnicianProfile", { technicianId: technician.id, requestId: route.params.requestId, offerId: offer.id })}>عرض ملف الفني</Button><Button variant="outlined" onPress={() => navigation.goBack()}>رجوع</Button></View></ScreenContainer>;
}
