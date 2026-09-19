import type { Job } from "../../../domain/models/job";
import type { Offer } from "../../../domain/models/offer";
import type { RepairRequest, PreferredTime } from "../../../domain/models/repairRequest";
import type { ServiceCategoryId, Technician } from "../../../domain/models/technician";

export const toBackendCategory = (value?: string) => value === "ac" ? "hvac" : value ?? "general";
export const toFrontendCategory = (value?: string): ServiceCategoryId => value === "hvac" ? "ac" : (["electrical", "plumbing", "appliances", "carpentry", "electronics", "general"].includes(value ?? "") ? value : "general") as ServiceCategoryId;

type TechnicianDto = { userId: string; specialty: string; availability: string; isVerified: boolean; isPro: boolean; user?: { name?: string }; reputation?: { ratingAvg?: number; completedJobs?: number } };
export function mapTechnician(dto: TechnicianDto, origin = { latitude: 31.778, longitude: 35.235 }): Technician {
  const hash = [...dto.userId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const distanceKm = 0.4 + (hash % 30) / 10;
  const category = toFrontendCategory(dto.specialty);
  return { id: dto.userId, name: dto.user?.name ?? dto.userId, specialty: dto.specialty, categoryIds: [category], rating: dto.reputation?.ratingAvg ?? 0, completedJobs: dto.reputation?.completedJobs ?? 0, distanceKm, isAvailable: dto.availability === "available", isVerified: dto.isVerified, isPro: dto.isPro, location: { latitude: origin.latitude + ((hash % 9) - 4) * 0.0018, longitude: origin.longitude + (((hash >> 2) % 9) - 4) * 0.0018 } };
}

export type RepairRequestDto = { id: string; customerId: string; categoryId: string; description: string; urgency: "low" | "medium" | "high"; preferredTime?: string | null; locationSummary?: string | null; lat?: number | null; lng?: number | null; createdAt: string; media?: { url: string; type: "image" | "video" | "audio" }[] };
export function mapRepairRequest(dto: RepairRequestDto): RepairRequest {
  const preferred: PreferredTime = dto.preferredTime ? "today" : "asap";
  return { id: dto.id, localId: dto.id, customerId: dto.customerId, description: dto.description, category: toFrontendCategory(dto.categoryId), urgency: dto.urgency, preferredTime: preferred, location: { label: dto.locationSummary ?? "Jerusalem", latitude: dto.lat ?? 31.778, longitude: dto.lng ?? 35.235, source: "demo" }, media: (dto.media ?? []).filter((item) => item.type !== "audio").map((item) => ({ uri: item.url, type: item.type as "image" | "video" })), createdAt: dto.createdAt };
}

export function mapRepairRequestForTechnician(dto: RepairRequestDto): import("../../../features/technician/technicianData").TechnicianRequestItem {
  const categoryNames: Record<ServiceCategoryId, string> = { electrical: "كهرباء", plumbing: "سباكة وصحية", ac: "تكييف وتبريد", appliances: "أجهزة منزلية", carpentry: "نجارة", electronics: "إلكترونيات", general: "صيانة عامة" };
  const urgency = dto.urgency === "high" ? "عاجل" : dto.urgency === "medium" ? "اليوم" : "عادي";
  const latitude = dto.lat ?? 31.778;
  const longitude = dto.lng ?? 35.235;
  const description = dto.description;
  return { id: dto.id, customerName: "عميل", problem: description.length > 44 ? `${description.slice(0, 44)}…` : description, category: categoryNames[toFrontendCategory(dto.categoryId)], area: dto.locationSummary ?? "القدس", distanceKm: 1, fairPrice: "يحدد في العرض", urgency, createdAt: new Date(dto.createdAt).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" }), latitude, longitude, description, state: "new" };
}

export type OfferDto = { id: string; requestId: string; technicianId: string; price: number; message?: string | null; etaMinutes?: number | null; status: "pending" | "accepted" | "rejected" | "withdrawn"; createdAt: string };
export const mapOffer = (dto: OfferDto): Offer => ({ id: dto.id, repairRequestId: dto.requestId, technicianId: dto.technicianId, price: dto.price, message: dto.message ?? "", estimatedDurationMinutes: 60, etaMinutes: dto.etaMinutes ?? 60, status: dto.status === "withdrawn" ? "rejected" : dto.status, createdAt: dto.createdAt });

export type JobDto = { id: string; requestId: string; offerId: string; technicianId: string; status: Job["status"]; scheduledAt?: string | null; createdAt?: string; offer: { price: number; etaMinutes?: number | null }; request: { locationSummary?: string | null; description?: string; createdAt?: string; category?: { name?: string } }; conversation?: { id: string } | null; financial?: { commissionRate?: number; platformFee?: number; total?: number; technicianEarning?: number } | null };
export const mapJob = (dto: JobDto): Job => ({ id: dto.id, requestId: dto.requestId, offerId: dto.offerId, technicianId: dto.technicianId, status: dto.status, agreedPrice: dto.offer.price, expectedArrival: dto.scheduledAt ?? `${dto.offer.etaMinutes ?? 60} min`, durationMinutes: 60, locationLabel: dto.request.locationSummary ?? "Jerusalem", description: dto.request.description, createdAt: dto.createdAt });
