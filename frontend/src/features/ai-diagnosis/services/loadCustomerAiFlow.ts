import type { CustomerAiClient, DiagnosisAnswer, DiagnosisResult, FairPriceResult, RiskResult, StructuredVoiceRequest, TechnicianMatch } from "../../../domain/contracts/customerAiClient";
import type { RepairRequestRepository } from "../../../domain/contracts/repairRequestRepository";
import type { TechnicianRepository } from "../../../domain/contracts/technicianRepository";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import type { Technician } from "../../../domain/models/technician";
import { AppError } from "../../../shared/errors/AppError";

export interface Recommendation { technician: Technician; match?: TechnicianMatch; }

export interface CustomerAiFlowResult {
  request: RepairRequest;
  structured?: StructuredVoiceRequest;
  diagnosis?: DiagnosisResult;
  price?: FairPriceResult;
  risk?: RiskResult;
  recommendations: Recommendation[];
  awaitingAnswers: boolean;
  unavailable: Array<"structure" | "diagnosis" | "price" | "risk" | "technicians" | "matching" | "request-update">;
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

export async function loadCustomerAiFlow(
  id: string,
  deps: FlowDependencies,
  onRequest?: (request: RepairRequest) => void,
  answers: readonly DiagnosisAnswer[] = []
): Promise<CustomerAiFlowResult> {
  const timeout = deps.timeoutMs ?? 6000;
  const original = await bounded(() => deps.requests.getRequest(id), timeout);
  if (!original) throw new RequestNotFoundError();
  onRequest?.(original);
  const result: CustomerAiFlowResult = { request: original, recommendations: [], awaitingAnswers: false, unavailable: [] };

  await Promise.all([
    bounded(() => deps.ai.structureRequest(original), timeout).then((value) => {
      if (!value.normalizedDescription?.trim()) throw new Error("Invalid summary");
      result.structured = value;
    }).catch(() => { result.unavailable.push("structure"); }),
    bounded(() => deps.ai.assessRisk(original), timeout).then((value) => {
      if (!Number.isFinite(value.riskScore) || value.riskScore < 0 || value.riskScore > 100 || !Array.isArray(value.signals)) throw new Error("Invalid risk result");
      result.risk = value;
    }).catch(() => { result.unavailable.push("risk"); })
  ]);

  try {
    const diagnosis = await bounded(() => deps.ai.diagnose(original, answers), timeout);
    if (!diagnosis.likelyIssue?.trim() || !Number.isFinite(diagnosis.confidence) || diagnosis.confidence < 0 || diagnosis.confidence > 1 || !diagnosis.routing) throw new Error("Invalid diagnosis");
    result.diagnosis = diagnosis;
    result.awaitingAnswers = diagnosis.followUpQuestions.length > 0;
  } catch {
    result.unavailable.push("diagnosis");
    try {
      const technicians = await bounded(() => deps.technicians.findNearby(
        original.location.latitude != null && original.location.longitude != null ? { latitude: original.location.latitude, longitude: original.location.longitude } : undefined,
        { categoryId: original.category }
      ), timeout);
      result.recommendations = technicians.map((technician) => ({ technician }));
    } catch { result.unavailable.push("technicians"); }
    return result;
  }

  if (!result.diagnosis || result.awaitingAnswers) return result;

  const effective: RepairRequest = { ...original, category: result.diagnosis.category, urgency: result.diagnosis.urgency, aiSummary: { diagnosis: result.diagnosis } };
  try {
    result.request = await bounded(() => deps.requests.updateAiAssessment(id, result.diagnosis!), timeout);
    onRequest?.(result.request);
  } catch {
    result.request = effective;
    result.unavailable.push("request-update");
  }

  if (!["NORMAL_TECHNICIAN", "URGENT_TECHNICIAN"].includes(result.diagnosis.routing.type)) return result;

  await Promise.all([
    bounded(() => deps.ai.estimatePrice(result.request, result.diagnosis), timeout).then((value) => {
      if (!Number.isFinite(value.min) || !Number.isFinite(value.max) || value.min < 0 || value.max < value.min || value.currency !== "ILS") throw new Error("Invalid price");
      result.price = value;
    }).catch(() => { result.unavailable.push("price"); }),
    bounded(() => deps.technicians.findNearby(
      result.request.location.latitude != null && result.request.location.longitude != null
        ? { latitude: result.request.location.latitude, longitude: result.request.location.longitude }
        : undefined,
      { categoryId: result.request.category }
    ), timeout).then(async (technicians) => {
      result.recommendations = technicians.map((technician) => ({ technician }));
      if (!technicians.length) return;
      try {
        const matches = await bounded(() => deps.ai.match(result.request, technicians), timeout);
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
