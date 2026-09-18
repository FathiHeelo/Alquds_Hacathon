import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Badge, Button, Card, LoadingState, ScreenContainer } from "../../../shared/components";
import { jobRepository } from "../../../demo/adapters/demoJobRepository";
import type { Job } from "../../../domain/models/job";
import { statusLabel } from "../../jobs/services/jobStatus";
export function TechnicianJobsScreen() { const [job, setJob] = useState<Job>(); useEffect(() => { void jobRepository.getJob("demo-job-offer-tariq-plumbing").then(setJob); }, []); if (!job) return <ScreenContainer><LoadingState message="لا توجد مهمة مقبولة بعد." /></ScreenContainer>; return <ScreenContainer><Text style={styles.title}>أعمالي</Text><Card><Badge label={statusLabel[job.status]} /><Text style={styles.text}>طلب العميل: تسريب مياه في المجلى</Text><Text style={styles.text}>العميل: عميل عَمِّرها</Text><Text style={styles.text}>السعر المتفق عليه: {job.agreedPrice} ₪</Text><Text style={styles.text}>الموقع: {job.locationLabel}</Text><Button onPress={() => undefined}>تحديث حالة المهمة</Button></Card></ScreenContainer>; }
const styles = { title: { fontSize: 22, fontWeight: "700" as const, textAlign: "right" as const, writingDirection: "rtl" as const }, text: { fontSize: 16, textAlign: "right" as const, writingDirection: "rtl" as const, marginVertical: 5 } };
