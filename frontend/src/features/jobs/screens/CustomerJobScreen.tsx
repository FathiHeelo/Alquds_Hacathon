import { LocalizedText } from "../../../shared/i18n/LocalizedText";
import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import type { CustomerStackParamList } from "../../../app/navigation/navigation.types";
import { Badge, Button, Card, LoadingState, ScreenContainer } from "../../../shared/components";
import { customerJobRepository as jobRepository } from "../../../services/repositories";
import { statusLabel } from "../services/jobStatus";
import { Alert } from "react-native";
import type { Job } from "../../../domain/models/job";
export function CustomerJobScreen({ route, navigation }: NativeStackScreenProps<CustomerStackParamList, "CustomerJob">) {
  const [job, setJob] = useState<Job>(); const [technicianName, setTechnicianName] = useState("الفني"); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void jobRepository.getJob(route.params.jobId).then((value) => { if (!active) return; setJob(value); setTechnicianName(value?.technician?.name ?? "الفني"); }).catch((error: unknown) => { if (active) Alert.alert("تعذر تحميل المهمة", error instanceof Error ? error.message : "حاول مرة أخرى."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [route.params.jobId]);
  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>; if (!job) return <ScreenContainer><LocalizedText style={styles.text}>تعذر العثور على المهمة.</LocalizedText></ScreenContainer>;
  return <ScreenContainer><LocalizedText style={styles.title}>تفاصيل المهمة</LocalizedText><Card><Badge label={statusLabel[job.status]} /><LocalizedText style={styles.text}>الفني: {technicianName}</LocalizedText><LocalizedText style={styles.text}>السعر المتفق عليه: {job.agreedPrice} ₪</LocalizedText>{job.locationLabel ? <LocalizedText style={styles.text}>الموقع: {job.locationLabel}</LocalizedText> : null}{job.expectedArrival ? <LocalizedText style={styles.text}>الوصول المتوقع: {job.expectedArrival}</LocalizedText> : null}</Card><LocalizedText style={styles.title}>تقدم المهمة</LocalizedText>{(["accepted", "scheduled", "on_the_way", "in_progress", "completed", "cancelled"] as const).map((step) => <Card key={step}><LocalizedText style={styles.text}>{statusLabel[step]} {step === job.status ? "• الآن" : ""}</LocalizedText></Card>)}{job.status === "completed" ? <Button onPress={() => navigation.navigate("CustomerRating", { jobId: job.id, technicianId: job.technicianId })}>تقييم الفني</Button> : <Button onPress={() => { void jobRepository.getJob(job.id).then((value) => setJob(value)).catch((error: unknown) => Alert.alert("تعذر تحديث الحالة", error instanceof Error ? error.message : "حاول مرة أخرى.")); }}>تحديث الحالة</Button>}<Button variant="secondary" onPress={() => navigation.navigate("CustomerChat", { jobId: job.id, requestId: job.requestId, technicianId: job.technicianId })}>فتح المحادثة مع الفني</Button><Button variant="outlined" onPress={() => navigation.navigate("CustomerNotifications")}>التنبيهات</Button></ScreenContainer>;
}
const styles = { title: { fontSize: 22, fontWeight: "700" as const, textAlign: "right" as const, marginBottom: 12, writingDirection: "rtl" as const }, text: { fontSize: 16, textAlign: "right" as const, writingDirection: "rtl" as const, marginVertical: 5 } };
