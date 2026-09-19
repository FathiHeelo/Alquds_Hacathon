export type RiskSignalCode =
  | "short_request_text"
  | "repeated_request_pattern"
  | "suspicious_pricing"
  | "urgent_language"
  | "insufficient_information";

export interface RiskInput {
  userId: string;
  requestText: string;

  // Optional contextual signals that the backend can provide later.
  previousRequestCount?: number;
  offeredPrice?: number;
  fairPriceMin?: number;
  fairPriceMax?: number;
}

export interface RiskResult {
  riskScore: number;
  level: "low" | "medium" | "high";
  signals: RiskSignalCode[];
}