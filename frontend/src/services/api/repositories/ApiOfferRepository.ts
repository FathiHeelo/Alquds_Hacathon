import type { OfferRepository } from "../../../domain/contracts/offerRepository";
import type { Offer } from "../../../domain/models/offer";
import { apiClient } from "../apiClient";
import { mapJob, mapOffer, type JobDto, type OfferDto } from "./mappers";

export class ApiOfferRepository implements OfferRepository {
  private readonly cache = new Map<string, Offer>();
  async createOffer(input: Omit<Offer, "id" | "status" | "createdAt">) { const result = mapOffer(await apiClient.request<OfferDto>(`/repair-requests/${input.repairRequestId}/offers`, { method: "POST", body: JSON.stringify({ price: input.price, message: input.message, etaMinutes: input.etaMinutes }) }, "technician")); this.cache.set(result.id, result); return result; }
  async getOffersForRequest(requestId: string) { const rows = (await apiClient.request<OfferDto[]>(`/repair-requests/${requestId}/offers`, undefined, "customer")).map(mapOffer); rows.forEach((item) => this.cache.set(item.id, item)); return rows; }
  async getOffer(id: string) { return this.cache.get(id); }
  async acceptOffer(id: string) { const job = mapJob(await apiClient.request<JobDto>(`/offers/${id}/accept`, { method: "POST" }, "customer")); return { jobId: job.id, requestId: job.requestId, offerId: job.offerId, technicianId: job.technicianId }; }
}
