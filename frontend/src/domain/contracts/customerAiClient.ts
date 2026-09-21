import type { DiagnosisAnswer, DiagnosisResult, FairPriceResult, RiskResult, StructuredVoiceRequest, TechnicianMatch } from "@ammerha/ai";
import type { RepairRequest } from "../models/repairRequest";
import type { Technician } from "../models/technician";

// Frontend integration contract; all intelligence remains behind the public AI facade.
export interface CustomerAiClient {
  structureRequest(request: RepairRequest): Promise<StructuredVoiceRequest>;
  diagnose(request: RepairRequest, answers?: readonly DiagnosisAnswer[]): Promise<DiagnosisResult>;
  estimatePrice(request: RepairRequest, diagnosis?: DiagnosisResult): Promise<FairPriceResult>;
  match(request: RepairRequest, technicians: readonly Technician[]): Promise<TechnicianMatch[]>;
  assessRisk(request: RepairRequest): Promise<RiskResult>;
}

export type { DiagnosisAnswer, DiagnosisResult, FairPriceResult, RiskResult, StructuredVoiceRequest, TechnicianMatch };
