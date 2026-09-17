export interface FairPriceInput {
  category: string;
  urgency: "low" | "medium" | "high";
}

export interface FairPriceResult {
  min: number;
  max: number;
  currency: "ILS";
  rationale: string;
}
