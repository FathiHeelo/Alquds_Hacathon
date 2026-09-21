import type {
  RepairCategory,
  Urgency,
} from "./ai.types";

export interface OfferAssistantInput {
  diagnosis: string;
  fairPriceMin: number;
  fairPriceMax: number;

  category?: RepairCategory;
  urgency?: Urgency;
  likelyParts?: string[];
  estimatedDuration?: string;
}

export interface OfferAssistantResult {
  suggestedDuration: string;
  suggestedPrice: number;
  possibleParts: string[];
  explanation: string;

  // Kept for compatibility with the current frontend.
  suggestedMessage: string;
}