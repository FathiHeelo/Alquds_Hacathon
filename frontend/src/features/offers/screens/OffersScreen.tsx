import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Button, EmptyState, ErrorState, LoadingState, ScreenContainer } from "../../../shared/components";
import { DemoTechnicianRepository } from "../../../demo/adapters/DemoTechnicianRepository";
import { aiStyles, PriceCard } from "../../ai-diagnosis/components/AiResults";
import { useOffers } from "../hooks/useOffers";
import { OfferCard } from "../components/OfferCard";
import { comparePrice } from "../services/priceComparison";
import { useEffect, useState } from "react";
import type { Technician } from "../../../domain/models/technician";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import { repairRequestRepository } from "../../repair-request/services/requestService";

export function OffersScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerOffersEntry">) {
  const state = useOffers(route.params.requestId); const [request, setRequest] = useState<RepairRequest>(); const [technicians, setTechnicians] = useState<readonly Technician[]>([]);
  useEffect(() => { void repairRequestRepository.getRequest(route.params.requestId).then(setRequest); void new DemoTechnicianRepository().findNearby({ latitude: 31.78, longitude: 35.23 }).then(setTechnicians); }, [route.params.requestId]);
  const fairPrice = request?.category === "plumbing" ? { min: 110, max: 150 } : undefined;
  return <ScreenContainer><Text style={[aiStyles.text, aiStyles.title]}>العروض المتاحة ({state.offers.length})</Text>
    {fairPrice ? <View style={{ marginVertical: 16 }}><PriceCard result={{ ...fairPrice, currency: "ILS", rationale: "بحسب سياق السعر العادل من التشخيص." }} /></View> : <Text style={aiStyles.text}>السعر العادل غير متاح لهذا الطلب.</Text>}
    {state.loading ? <LoadingState message="نحمّل عروض الفنيين…" /> : state.error ? <ErrorState message={state.error} onRetry={() => void state.retry()} /> : !state.offers.length ? <EmptyState message="لا توجد عروض بعد. سنخبرك عند وصول عرض جديد." /> : state.offers.map((offer) => { const technician = technicians.find(({ id }) => id === offer.technicianId); return technician ? <OfferCard key={offer.id} offer={offer} technician={technician} fairPrice={fairPrice} onDetails={() => navigation.navigate("CustomerOfferDetails", { requestId: route.params.requestId, offerId: offer.id })} onProfile={() => navigation.navigate("CustomerTechnicianProfile", { technicianId: technician.id, requestId: route.params.requestId, offerId: offer.id })} /> : null; })}
    <Button variant="outlined" onPress={() => navigation.goBack()}>العودة للتشخيص</Button></ScreenContainer>;
}
