import type {
  RepairCategory,
  TechnicianType,
  Urgency,
} from "./ai.types";

export interface VoiceRequestInput {
  transcript?: string;
  scenarioKey?: string;
}

export interface StructuredVoiceRequest {
  normalizedDescription: string;
  category: RepairCategory;
  urgency: Urgency;
  technicianType: TechnicianType;
  extractedKeywords: string[];
  requiresConfirmation: boolean;
}