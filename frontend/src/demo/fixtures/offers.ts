import type { Offer } from "../../domain/models/offer";

export const demoOffers: readonly Offer[] = [
  { id: "offer-tariq-plumbing", repairRequestId: "old_city_plumbing_leak", technicianId: "tech-tariq-maqdisi", price: 120,
    message: "معي القطع اللازمة وأقدر أوصل خلال ربع ساعة وأضمن لك الإصلاح أسبوعين.", estimatedDurationMinutes: 35, etaMinutes: 15, status: "pending", createdAt: "2026-09-18T00:10:00.000Z" },
  { id: "offer-mahmoud-plumbing", repairRequestId: "old_city_plumbing_leak", technicianId: "tech-mahmoud-khatib", price: 180,
    message: "أفحص التسريب كاملاً وأبدّل القطعة المناسبة مع ضمان على العمل.", estimatedDurationMinutes: 50, etaMinutes: 25, status: "pending", createdAt: "2026-09-18T00:11:00.000Z" },
  { id: "offer-yousef-plumbing", repairRequestId: "old_city_plumbing_leak", technicianId: "tech-yousef-najjar", price: 95,
    message: "أستطيع الحضور بعد انتهاء موعد سابق، والسعر يشمل أجرة العمل فقط.", estimatedDurationMinutes: 60, etaMinutes: 55, status: "pending", createdAt: "2026-09-18T00:12:00.000Z" }
] as const;
