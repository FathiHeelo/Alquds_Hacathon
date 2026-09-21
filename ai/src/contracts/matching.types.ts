import type { RepairCategory } from "./ai.types";

export interface TechnicianCandidate {
  id: string;
  distanceKm: number;
  rating: number;
  completedJobs: number;

  // Optional fields for the richer A04 ranking engine.
  categoryIds?: readonly RepairCategory[];
  specialty?: string;
  isAvailable?: boolean;
  isVerified?: boolean;
  isPro?: boolean;
}

export interface TechnicianRankingInput {
  category: RepairCategory;
  candidates: TechnicianCandidate[];
}

export interface TechnicianMatch {
  technicianId: string;
  score: number;
  reasons: string[];

  // Shows how the final score was constructed.
  scoreBreakdown?: {
    specialty: number;
    distance: number;
    rating: number;
    availability: number;
    reliability: number;
  };
}