import type { DiagnosisResult, FairPriceResult, OfferAssistantResult } from "@ammerha/ai";
import type { TechnicianRequestItem } from "../../features/technician/technicianData";
import { aiAdapter } from "./aiAdapter";
import { presentAiTerm } from "./aiPresentation";

export interface TechnicianVoiceOfferResult extends OfferAssistantResult {
  transcript: string;
  diagnosis: DiagnosisResult;
  fairPrice: FairPriceResult;
}

function toUrgency(value: TechnicianRequestItem["urgency"]): "low" | "medium" | "high" {
  if (value === "عاجل") return "high";
  if (value === "اليوم") return "medium";
  return "low";
}

export async function analyzeTechnicianRequest(request: TechnicianRequestItem, transcript = ""): Promise<TechnicianVoiceOfferResult> {
  const urgency = toUrgency(request.urgency);
  const description = transcript ? `${request.description}\nملاحظات الفني: ${transcript}` : request.description;
  const diagnosis = await aiAdapter.diagnoseProblem({ category: request.categoryId, description, urgency });
  const fairPrice = await aiAdapter.estimateFairPrice({ category: request.categoryId, urgency });
  const offer = await aiAdapter.generateOfferAssistant({
    diagnosis: request.description,
    fairPriceMin: fairPrice.min,
    fairPriceMax: fairPrice.max,
    category: request.categoryId,
    urgency,
    likelyParts: diagnosis.likelyParts,
    estimatedDuration: presentAiTerm(diagnosis.estimatedDuration)
  });
  return { ...offer, transcript, diagnosis, fairPrice };
}

// Jaber accepts a supplied transcript; microphone capture/transcription is not part of its package yet.
export async function analyzeTechnicianVoice(request: TechnicianRequestItem): Promise<TechnicianVoiceOfferResult> {
  const transcript = `أنا قريب من ${request.area} وفهمت وصف المشكلة، وبأكد القطع والمدة بعد المعاينة.`;
  return analyzeTechnicianRequest(request, transcript);
}
