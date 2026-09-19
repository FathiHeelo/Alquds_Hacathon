import type { TechnicianRepository } from "../../../domain/contracts/technicianRepository";
import type { GeoPoint } from "../../../domain/models/location";
import type { TechnicianSearchCriteria } from "../../../domain/models/technician";
import { apiClient } from "../apiClient";
import { AppError } from "../../../shared/errors/AppError";
import { mapTechnician, toBackendCategory } from "./mappers";

export class ApiTechnicianRepository implements TechnicianRepository {
  async findNearby(origin: GeoPoint, criteria: TechnicianSearchCriteria = {}) {
    const query = criteria.categoryId ? `?specialty=${encodeURIComponent(toBackendCategory(criteria.categoryId))}` : "";
    const rows = await apiClient.request<Parameters<typeof mapTechnician>[0][]>(`/technicians${query}`, undefined, "customer");
    return rows.map((row) => mapTechnician(row, origin)).filter((item) => (!criteria.query || `${item.name} ${item.specialty}`.toLowerCase().includes(criteria.query.toLowerCase())) && (!criteria.minimumRating || item.rating >= criteria.minimumRating) && (!criteria.availableOnly || item.isAvailable) && (!criteria.maximumDistanceKm || item.distanceKm <= criteria.maximumDistanceKm));
  }
  async getById(id: string) { try { return mapTechnician(await apiClient.request<Parameters<typeof mapTechnician>[0]>(`/technicians/${id}`, undefined, "customer")); } catch (error) { if (error instanceof AppError && error.code === "NOT_FOUND") return null; throw error; } }
}
