import type {
  RepairCategory,
  TechnicianType,
  Urgency,
  ConfidenceLevel,
} from "./ai.types";

export type AssistanceRouteType =
  | "NORMAL_TECHNICIAN"
  | "URGENT_TECHNICIAN"
  | "EMERGENCY_SERVICE"
  | "PUBLIC_SERVICE"
  | "SOCIAL_ASSISTANCE";

export type AssistanceCategory =
  | "fire_emergency"
  | "medical_emergency"
  | "electrical_emergency"
  | "water_utility"
  | "municipal_service"
  | "social_support";

export interface DiagnosisAnswer {
  questionId: string;
  value: string;
}

export interface FollowUpOption {
  value: string;
  labelAr: string;
  labelEn: string;
}

export interface FollowUpQuestion {
  id: string;
  promptAr: string;
  promptEn: string;
  options: FollowUpOption[];
}

export interface RoutingRecommendation {
  type: AssistanceRouteType;
  reasonCode: string;
  assistanceCategory?: AssistanceCategory;
  contactConfigKey?: string;
  safetyInstructionCodes: string[];
}

export interface DiagnosisInput {
  category: RepairCategory;
  description: string;
  urgency?: Urgency;
  voiceTranscript?: string;
  photoContext?: string;
  answers?: DiagnosisAnswer[];
}

export interface DiagnosisResult {
  initialHypothesis: string;
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
  missingInformation: string[];
  followUpQuestions: FollowUpQuestion[];
  refined: boolean;
  routing: RoutingRecommendation;
  fairPriceContext: {
    durationBucket: "short" | "medium" | "long";
    partsBucket: "none" | "minor" | "major";
  };

  // Kept temporarily for compatibility with the existing simulation contract.
  likelyIssue: string;
}
