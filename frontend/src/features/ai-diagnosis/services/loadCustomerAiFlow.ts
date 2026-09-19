import type { CustomerAiClient, DiagnosisResult, FairPriceResult, StructuredVoiceRequest, TechnicianMatch } from "../../../domain/contracts/customerAiClient";
import type { RepairRequestRepository } from "../../../domain/contracts/repairRequestRepository";
import type { TechnicianRepository } from "../../../domain/contracts/technicianRepository";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import type { Technician } from "../../../domain/models/technician";
import { AppError } from "../../../shared/errors/AppError";

export interface Recommendation {
  technician: Technician;
  match?: TechnicianMatch;
}

export interface CustomerAiFlowResult {
  request: RepairRequest;
  structured?: StructuredVoiceRequest;
  diagnosis?: DiagnosisResult;
  price?: FairPriceResult;
  recommendations: Recommendation[];
  unavailable: Array<"structure" | "diagnosis" | "price" | "technicians" | "matching">;
}

export class RequestNotFoundError extends AppError {
  constructor() { super("VALIDATION_ERROR", "تعذر العثور على الطلب. يمكنك العودة للخريطة وإنشاء طلب جديد."); }
}

export interface FlowDependencies {
  requests: RepairRequestRepository;
  technicians: TechnicianRepository;
  ai: CustomerAiClient;
  timeoutMs?: number;
}

async function bounded<T>(action: () => Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([Promise.resolve().then(action), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new AppError("AI_UNAVAILABLE", "انتهت مهلة الانتظار.")), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}

export function isLowConfidence(value: number): boolean { return value < 0.65; }

export async function loadCustomerAiFlow(id: string, deps: FlowDependencies,
  onRequest?: (request: RepairRequest) => void): Promise<CustomerAiFlowResult> {
  const timeout = deps.timeoutMs ?? 6000;
  const request = await bounded(() => deps.requests.getRequest(id), timeout);
  if (!request) throw new RequestNotFoundError();
  onRequest?.(request);
  const result: CustomerAiFlowResult = { request, recommendations: [], unavailable: [] };
  // Each section can fail independently; preserve successful results and the manual request.
  await Promise.all([
    bounded(() => deps.ai.structureRequest(request), timeout).then((value) => {
      if (!value.description?.trim()) throw new Error("Invalid summary");
      result.structured = value;
    }).catch(() => { result.unavailable.push("structure"); }),
    bounded(() => deps.ai.diagnose(request), timeout).then((value) => {
      if (!value.likelyIssue?.trim() || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1)
        throw new Error("Invalid diagnosis");
      result.diagnosis = value;
    }).catch(() => { result.unavailable.push("diagnosis"); }),
    bounded(() => deps.ai.estimatePrice(request), timeout).then((value) => {
      if (!Number.isFinite(value.min) || !Number.isFinite(value.max) || value.min < 0 || value.max < value.min || value.currency !== "ILS")
        throw new Error("Invalid price");
      result.price = value;
    }).catch(() => { result.unavailable.push("price"); }),
    bounded(() => deps.technicians.findNearby(
      request.location.latitude != null && request.location.longitude != null
        ? { latitude: request.location.latitude, longitude: request.location.longitude }
        : undefined,
      { categoryId: request.category }
    ), timeout)
      .then(async (technicians) => {
        result.recommendations = technicians.map((technician) => ({ technician }));
        if (!technicians.length) return;
        try {
          const matches = await bounded(() => deps.ai.match(technicians), timeout);
          const seen = new Set<string>();
          result.recommendations = matches.flatMap((match) => {
            const technician = technicians.find(({ id: technicianId }) => technicianId === match.technicianId);
            if (!technician || seen.has(technician.id) || !Number.isFinite(match.score) || !Array.isArray(match.reasons)) return [];
            seen.add(technician.id);
            return [{ technician, match }];
          });
        } catch { result.unavailable.push("matching"); }
      }).catch(() => { result.unavailable.push("technicians"); })
  ]);
  return result;
}
