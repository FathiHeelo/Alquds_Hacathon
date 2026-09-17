import type { DiagnosisInput, DiagnosisResult } from "../contracts/diagnosis.types";
import type { FairPriceInput, FairPriceResult } from "../contracts/fairPrice.types";
import type { TechnicianCandidate, TechnicianMatch } from "../contracts/matching.types";
import type { OfferAssistantInput, OfferAssistantResult } from "../contracts/offerAssistant.types";
import type { RiskInput, RiskResult } from "../contracts/risk.types";
import type { StructuredVoiceRequest, VoiceRequestInput } from "../contracts/voice.types";

export interface AiService {
  structureVoiceRequest(input: VoiceRequestInput): Promise<StructuredVoiceRequest>;
  diagnoseProblem(input: DiagnosisInput): Promise<DiagnosisResult>;
  estimateFairPrice(input: FairPriceInput): Promise<FairPriceResult>;
  matchTechnicians(candidates: TechnicianCandidate[]): Promise<TechnicianMatch[]>;
  generateOfferAssistant(input: OfferAssistantInput): Promise<OfferAssistantResult>;
  assessRisk(input: RiskInput): Promise<RiskResult>;
}
