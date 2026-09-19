import type { RepairRequestRepository, CreateRepairRequestDraft } from "../../../domain/contracts/repairRequestRepository";
import { apiClient } from "../apiClient";
import { AppError } from "../../../shared/errors/AppError";
import { mapRepairRequest, mapRepairRequestForTechnician, toBackendCategory, type RepairRequestDto } from "./mappers";

const preferredTime = (value: string) => new Date(Date.now() + (value === "tomorrow" ? 86_400_000 : value === "today" ? 3_600_000 : 0)).toISOString();
export class ApiRepairRequestRepository implements RepairRequestRepository {
  async create(draft: CreateRepairRequestDraft) {
    const dto = await apiClient.request<RepairRequestDto>("/repair-requests", { method: "POST", body: JSON.stringify({ categoryId: toBackendCategory(draft.category), description: draft.description, locationSummary: draft.location.label, lat: draft.location.latitude, lng: draft.location.longitude, urgency: draft.urgency, preferredTime: preferredTime(draft.preferredTime), aiSummary: draft.voice ? { transcript: draft.voice.transcript, source: draft.voice.source } : undefined, media: draft.media.filter((item) => /^https?:/.test(item.uri)).map((item) => ({ url: item.uri, type: item.type })) }) }, "customer");
    return mapRepairRequest(dto);
  }
  async getRequest(id: string) { try { return mapRepairRequest(await apiClient.request<RepairRequestDto>(`/repair-requests/${id}`, undefined, "customer")); } catch (error) { if (error instanceof AppError && error.code === "NOT_FOUND") return undefined; throw error; } }
  async listMine() { return (await apiClient.request<RepairRequestDto[]>("/repair-requests", undefined, "customer")).map(mapRepairRequest); }
  async listForTechnician() { return (await apiClient.request<RepairRequestDto[]>("/repair-requests/feed", undefined, "technician")).map(mapRepairRequestForTechnician); }
}
