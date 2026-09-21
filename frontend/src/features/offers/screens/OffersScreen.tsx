import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, EmptyState, ErrorState, LoadingState, ScreenContainer } from "../../../shared/components";
import { aiStyles, PriceCard } from "../../ai-diagnosis/components/AiResults";
import { useOffers } from "../hooks/useOffers";
import { OfferCard } from "../components/OfferCard";
import { useEffect, useState } from "react";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import type { FairPriceResult } from "../../../domain/contracts/customerAiClient";
import { repairRequestRepository } from "../../repair-request/services/requestService";
import { customerAiClient } from "../../../services/ai/customerAiClient";

export function OffersScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerOffersEntry">) {
  const state = useOffers(route.params.requestId); const [request, setRequest] = useState<RepairRequest>(); const [fairPrice, setFairPrice] = useState<FairPriceResult>();
  useEffect(() => { let active = true; void repairRequestRepository.getRequest(route.params.requestId).then(async (value) => { if (!active) return; setRequest(value); if (!value) return; try { const estimate = await customerAiClient.estimatePrice(value); if (active) setFairPrice(estimate); } catch { if (active) setFairPrice(undefined); } }).catch(() => { if (active) { setRequest(undefined); setFairPrice(undefined); } }); return () => { active = false; }; }, [route.params.requestId]);
  return <ScreenContainer><LocalizedText style={[aiStyles.text, aiStyles.title]}>العروض المتاحة ({state.offers.length})</LocalizedText>
    {fairPrice ? <View style={{ marginVertical: 16 }}><PriceCard result={fairPrice} /></View> : request ? <LocalizedText style={aiStyles.text}>السعر العادل غير متاح لهذا الطلب.</LocalizedText> : null}
    {state.loading ? <LoadingState message="نحمّل عروض الفنيين…" /> : state.error ? <ErrorState message={state.error} onRetry={() => void state.retry()} /> : !state.offers.length ? <EmptyState message="لا توجد عروض بعد. سنخبرك عند وصول عرض جديد." /> : state.offers.map((offer) => { const technician = offer.technician; return <OfferCard key={offer.id} offer={offer} technician={technician} fairPrice={fairPrice} onDetails={() => navigation.navigate("CustomerOfferDetails", { requestId: route.params.requestId, offerId: offer.id, technicianId: technician?.id ?? offer.technicianId })} onProfile={() => navigation.navigate("CustomerTechnicianProfile", { technicianId: technician?.id ?? offer.technicianId, requestId: route.params.requestId, offerId: offer.id })} />; })}
    <Button variant="outlined" onPress={() => navigation.goBack()}>العودة للتشخيص</Button></ScreenContainer>;
}
