import type { GeoPoint } from "./location";

export type ServiceCategoryId =
  | "electrical"
  | "plumbing"
  | "ac"
  | "appliances"
  | "carpentry"
  | "electronics"
  | "general";

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  categoryIds: readonly ServiceCategoryId[];
  rating: number;
  completedJobs: number;
  distanceKm?: number;
  isAvailable: boolean;
  isVerified: boolean;
  isPro: boolean;
  acceptsUrgentRequests?: boolean;
  location?: GeoPoint;
  ratingCount?: number;
  yearsExperience?: number;
  serviceAreas?: readonly string[];
  bio?: string;
}

export interface TechnicianSearchCriteria {
  query?: string;
  categoryId?: ServiceCategoryId;
  minimumRating?: number;
  availableOnly?: boolean;
  maximumDistanceKm?: number;
}
