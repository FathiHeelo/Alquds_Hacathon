import type { GeoPoint } from "../models/location";
import type { Technician, TechnicianSearchCriteria } from "../models/technician";

export interface TechnicianRepository {
  findNearby(origin: GeoPoint, criteria?: TechnicianSearchCriteria): Promise<readonly Technician[]>;
  getById(id: string): Promise<Technician | null>;
}
