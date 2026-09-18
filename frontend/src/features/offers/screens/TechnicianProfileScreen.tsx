import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import type { Technician } from "../../../domain/models/technician";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, ScreenContainer } from "../../../shared/components";
import { aiStyles } from "../../ai-diagnosis/components/AiResults";
import { DemoTechnicianRepository } from "../../../demo/adapters/DemoTechnicianRepository";
import { reviewRepository } from "../../../demo/adapters/demoReviewRepository";

export function TechnicianProfileScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerTechnicianProfile">) {
  const [technician, setTechnician] = useState<Technician | null>(); const [reviews, setReviews] = useState<readonly { id: string; overall: number; comment?: string }[]>([]); useEffect(() => { void new DemoTechnicianRepository().getById(route.params.technicianId).then(setTechnician); void reviewRepository.getForTechnician(route.params.technicianId).then(setReviews); }, [route.params.technicianId]);
  if (technician === undefined) return <ScreenContainer><LoadingState /></ScreenContainer>; if (!technician) return <ScreenContainer><ErrorState message="تعذر العثور على ملف الفني." onRetry={() => navigation.goBack()} /></ScreenContainer>;
  return <ScreenContainer><View style={aiStyles.section}><Text style={[aiStyles.text, aiStyles.title]}>{technician.name}</Text><Text style={[aiStyles.text, aiStyles.muted]}>{technician.specialty}</Text><View style={{ flexDirection: "row-reverse", gap: 8 }}>{technician.isVerified ? <Badge label="هوية موثقة" /> : null}{technician.isPro ? <Badge label="AMMERHA Pro" /> : null}</View><Text style={aiStyles.text}>★ {technician.rating} · {technician.completedJobs} أعمال مكتملة · يبعد {technician.distanceKm} كم</Text><Text style={aiStyles.text}>{technician.isAvailable ? "متاح الآن" : "غير متاح حالياً"}</Text><Text style={aiStyles.text}>فني موثوق لخدمات {technician.specialty} في القدس.</Text></View><View style={aiStyles.section}><Text style={[aiStyles.text, aiStyles.title]}>التقييمات</Text>{reviews.length ? reviews.map((review) => <Card key={review.id}><Text style={aiStyles.text}>★ {review.overall} / 5</Text><Text style={aiStyles.text}>{review.comment ?? "تجربة موثوقة مع الفني."}</Text></Card>) : <EmptyState message="لا توجد تقييمات بعد." />}</View><Button disabled={!technician.isAvailable} onPress={() => navigation.navigate("CustomerRepairRequest", { technicianId: technician.id })}>طلب صيانة</Button>{route.params.offerId ? <Button variant="outlined" onPress={() => navigation.goBack()}>العودة للعرض</Button> : null}<Button variant="outlined" onPress={() => navigation.goBack()}>العودة</Button></ScreenContainer>;
}
