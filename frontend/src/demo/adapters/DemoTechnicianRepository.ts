import type { TechnicianRepository } from "../../domain/contracts/technicianRepository";
import type { GeoPoint } from "../../domain/models/location";
import type { Technician, TechnicianSearchCriteria } from "../../domain/models/technician";
import { demoTechnicians } from "../fixtures/technicians";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("ar");
}

export class DemoTechnicianRepository implements TechnicianRepository {
  async findNearby(
    _origin: GeoPoint | undefined,
    criteria: TechnicianSearchCriteria = {}
  ): Promise<readonly Technician[]> {
    const query = normalize(criteria.query ?? "");

    return demoTechnicians
      .filter((technician) => !query || normalize(`${technician.name} ${technician.specialty}`).includes(query))
      .filter((technician) => !criteria.categoryId || technician.categoryIds.includes(criteria.categoryId))
      .filter((technician) => technician.rating >= (criteria.minimumRating ?? 0))
      .filter((technician) => !criteria.availableOnly || technician.isAvailable)
      .filter((technician) => technician.distanceKm != null && technician.distanceKm <= (criteria.maximumDistanceKm ?? Number.POSITIVE_INFINITY))
      .sort((left, right) => (left.distanceKm ?? 0) - (right.distanceKm ?? 0));
  }

  async getById(id: string): Promise<Technician | null> {
    return demoTechnicians.find((technician) => technician.id === id) ?? null;
  }

  async getMine(): Promise<Technician | null> { return demoTechnicians[0] ?? null; }

  async setAvailability(availability: "available" | "busy" | "offline"): Promise<Technician> {
    return { ...demoTechnicians[0], isAvailable: availability === "available" };
  }
}
