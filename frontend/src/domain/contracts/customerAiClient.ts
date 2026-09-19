import type { DiagnosisResult, FairPriceResult, StructuredVoiceRequest, TechnicianMatch } from "@ammerha/ai";
import type { RepairRequest } from "../models/repairRequest";
import type { Technician } from "../models/technician";

// Frontend integration contract; all intelligence remains behind the public AI facade.
export interface CustomerAiClient {
  structureRequest(request: RepairRequest): Promise<StructuredVoiceRequest>;
  diagnose(request: RepairRequest): Promise<DiagnosisResult>;
  estimatePrice(request: RepairRequest): Promise<FairPriceResult>;
  match(technicians: readonly Technician[]): Promise<TechnicianMatch[]>;
}

export type { DiagnosisResult, FairPriceResult, StructuredVoiceRequest, TechnicianMatch };
