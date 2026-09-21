import type {
  PriceStatus,
  RepairCategory,
  Urgency,
} from "./ai.types";

export type DurationBucket =
  | "short"
  | "medium"
  | "long";

export type PartsBucket =
  | "none"
  | "minor"
  | "major";

export interface FairPriceInput {
  category: RepairCategory;
  urgency: Urgency;
  durationBucket?: DurationBucket;
  partsBucket?: PartsBucket;
  areaFactor?: number;
}

export interface FairPriceResult {
  minPrice: number;
  maxPrice: number;
  status: PriceStatus;
  confidence: number;
  explanationFactors: string[];

  // Temporary compatibility fields for the existing frontend integration.
  min: number;
  max: number;
  currency: "ILS";
  rationale: string;
}

export interface OfferEvaluation {
  status: PriceStatus;
  explanation: string;
}