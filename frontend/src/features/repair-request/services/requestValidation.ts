import { Urgency } from "../../../domain/enums/status";
import { PreferredTime, type RepairRequestDraft } from "../../../domain/models/repairRequest";
import { serviceCategories } from "../../../shared/constants/serviceCategories";

export type RequestErrors = Partial<Record<"description" | "category" | "location" | "urgency" | "preferredTime", string>>;

export function validateRepairRequest(draft: RepairRequestDraft): RequestErrors {
  const errors: RequestErrors = {};
  if (!draft.description.trim()) errors.description = "اكتب وصفاً للمشكلة قبل المتابعة.";
  if (!serviceCategories.some(({ id }) => id === draft.category)) errors.category = "اختر نوع الخدمة.";
  const { latitude, longitude, label } = draft.location;
  if (!label.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) errors.location = "أكد عنوان الصيانة.";
  if (!Object.values(Urgency).includes(draft.urgency)) errors.urgency = "اختر درجة الاستعجال.";
  if (!Object.values(PreferredTime).includes(draft.preferredTime)) errors.preferredTime = "اختر الوقت المناسب.";
  return errors;
}
