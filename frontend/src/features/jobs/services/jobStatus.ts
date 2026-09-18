import type { JobStatus } from "../../../domain/models/job";
export const statusLabel: Record<JobStatus, string> = { accepted: "تم قبول العرض", scheduled: "تمت الجدولة", on_the_way: "الفني في الطريق", in_progress: "بدأ العمل", completed: "اكتملت المهمة", cancelled: "أُلغيت المهمة" };
const nextStatus: Record<JobStatus, JobStatus> = { accepted: "on_the_way", scheduled: "on_the_way", on_the_way: "in_progress", in_progress: "completed", completed: "completed", cancelled: "cancelled" };
export function newStatus(status: JobStatus): JobStatus { return nextStatus[status]; }
