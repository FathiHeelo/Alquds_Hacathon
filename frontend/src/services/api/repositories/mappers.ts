import type { Job } from "../../../domain/models/job";
import type { Offer } from "../../../domain/models/offer";
import type { RepairRequest, PreferredTime } from "../../../domain/models/repairRequest";
import type { ServiceCategoryId, Technician } from "../../../domain/models/technician";

export const toBackendCategory = (value?: string) => value === "ac" ? "hvac" : value ?? "general";
export const toFrontendCategory = (value?: string): ServiceCategoryId => value === "hvac" ? "ac" : (["electrical", "plumbing", "appliances", "carpentry", "electronics", "general"].includes(value ?? "") ? value : "general") as ServiceCategoryId;

export type TechnicianDto = { userId: string; specialty: string; availability: string; isVerified: boolean; isPro: boolean; yearsExperience?: number | null; serviceAreas?: unknown; bio?: string | null; user?: { name?: string }; reputation?: { ratingAvg?: number; ratingCount?: number; completedJobs?: number } };
export function mapTechnician(dto: TechnicianDto): Technician {
  const category = toFrontendCategory(dto.specialty);
  return { id: dto.userId, name: dto.user?.name ?? dto.userId, specialty: dto.specialty, categoryIds: [category], rating: dto.reputation?.ratingAvg ?? 0, ratingCount: dto.reputation?.ratingCount ?? 0, completedJobs: dto.reputation?.completedJobs ?? 0, isAvailable: dto.availability === "available", isVerified: dto.isVerified, isPro: dto.isPro, yearsExperience: dto.yearsExperience ?? undefined, serviceAreas: Array.isArray(dto.serviceAreas) ? dto.serviceAreas.filter((area): area is string => typeof area === "string") : undefined, bio: dto.bio ?? undefined };
}

export type RepairRequestDto = { id: string; customerId: string; categoryId: string; description: string; urgency: "low" | "medium" | "high"; preferredTime?: string | null; locationSummary?: string | null; lat?: number | null; lng?: number | null; createdAt: string; media?: { url: string; type: "image" | "video" | "audio" }[] };
export function mapRepairRequest(dto: RepairRequestDto): RepairRequest {
  const preferred: PreferredTime = dto.preferredTime ? "today" : "asap";
  return { id: dto.id, localId: dto.id, customerId: dto.customerId, description: dto.description, category: toFrontendCategory(dto.categoryId), urgency: dto.urgency, preferredTime: preferred, location: { label: dto.locationSummary ?? "", latitude: dto.lat ?? undefined, longitude: dto.lng ?? undefined, source: "backend" }, media: (dto.media ?? []).filter((item) => item.type !== "audio").map((item) => ({ uri: item.url, type: item.type as "image" | "video" })), createdAt: dto.createdAt };
}

export function mapRepairRequestForTechnician(dto: RepairRequestDto): import("../../../features/technician/technicianData").TechnicianRequestItem {
  const categoryNames: Record<ServiceCategoryId, string> = { electrical: "كهرباء", plumbing: "سباكة وصحية", ac: "تكييف وتبريد", appliances: "أجهزة منزلية", carpentry: "نجارة", electronics: "إلكترونيات", general: "صيانة عامة" };
  const urgency = dto.urgency === "high" ? "عاجل" : dto.urgency === "medium" ? "اليوم" : "عادي";
  const description = dto.description;
  return { id: dto.id, customerName: "عميل", problem: description.length > 44 ? `${description.slice(0, 44)}…` : description, category: categoryNames[toFrontendCategory(dto.categoryId)], area: dto.locationSummary ?? "الموقع غير محدد", fairPrice: "يحدد الفني السعر في العرض", urgency, createdAt: new Date(dto.createdAt).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" }), latitude: dto.lat ?? undefined, longitude: dto.lng ?? undefined, description, state: "new" };
}

export type OfferDto = { id: string; requestId: string; technicianId: string; price: number; message?: string | null; etaMinutes?: number | null; status: "pending" | "accepted" | "rejected" | "withdrawn"; createdAt: string };
export const mapOffer = (dto: OfferDto): Offer => ({ id: dto.id, repairRequestId: dto.requestId, technicianId: dto.technicianId, price: dto.price, message: dto.message ?? "", etaMinutes: dto.etaMinutes ?? undefined, status: dto.status === "withdrawn" ? "rejected" : dto.status, createdAt: dto.createdAt });

export type JobDto = { id: string; requestId: string; offerId: string; technicianId: string; status: Job["status"]; scheduledAt?: string | null; createdAt?: string; offer: { price: number; etaMinutes?: number | null }; request: { locationSummary?: string | null; description?: string; createdAt?: string; category?: { name?: string } }; conversation?: { id: string } | null; financial?: { commissionRate?: number; platformFee?: number; total?: number; technicianEarning?: number } | null };
export const mapJob = (dto: JobDto): Job => ({ id: dto.id, requestId: dto.requestId, offerId: dto.offerId, technicianId: dto.technicianId, status: dto.status, agreedPrice: dto.offer.price, expectedArrival: dto.scheduledAt ?? (dto.offer.etaMinutes != null ? `${dto.offer.etaMinutes} min` : ""), locationLabel: dto.request.locationSummary ?? "", description: dto.request.description, createdAt: dto.createdAt, conversationId: dto.conversation?.id, technicianEarning: dto.financial?.technicianEarning });
