import type {
  RepairCategory,
  TechnicianType,
  Urgency,
  ConfidenceLevel,
} from "./ai.types";

export interface DiagnosisInput {
  category: RepairCategory;
  description: string;
  urgency?: Urgency;
}

export interface DiagnosisResult {
  issueTitle: string;
  probableCause: string;
  category: RepairCategory;
  urgency: Urgency;
  recommendedTechnicianType: TechnicianType;
  likelyParts: string[];
  estimatedDuration: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  caution: string | null;
  needsConfirmation: boolean;

  // Kept temporarily for compatibility with the existing simulation contract.
  likelyIssue: string;
}