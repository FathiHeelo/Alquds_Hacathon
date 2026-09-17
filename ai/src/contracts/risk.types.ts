export interface RiskInput {
  userId: string;
  requestText: string;
}

export interface RiskResult {
  level: "low" | "medium" | "high";
  signals: string[];
}
