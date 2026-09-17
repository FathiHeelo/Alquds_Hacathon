export interface DiagnosisInput {
  category: string;
  description: string;
}

export interface DiagnosisResult {
  likelyIssue: string;
  confidence: number;
  urgency: "low" | "medium" | "high";
}
