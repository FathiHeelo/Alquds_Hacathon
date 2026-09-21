import { appConfig } from "../../app/config/appConfig";
import { demoVoiceRequest } from "../../demo/fixtures/voiceRequest";
import { Urgency } from "../../domain/enums/status";
import type { RequestVoice } from "../../domain/models/repairRequest";
import type { ServiceCategoryId } from "../../domain/models/technician";
import { serviceCategories } from "../../shared/constants/serviceCategories";
import { aiAdapter } from "./aiAdapter";

export interface VoiceSuggestion {
  description: string;
  category?: ServiceCategoryId;
  urgency: Urgency;
  voice: RequestVoice;
}

export async function suggestVoiceRequest(transcript = demoVoiceRequest.transcript): Promise<VoiceSuggestion> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    if (appConfig.aiMode !== "simulation") throw new Error("Remote voice adapter is not configured");
    const result = await Promise.race([
      aiAdapter.structureVoiceRequest({ transcript }),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error("Voice timeout")), 5000); })
    ]);
    if (!result.normalizedDescription?.trim() || !Object.values(Urgency).includes(result.urgency)) {
    throw new Error("Invalid voice result");
}

    return {
      description: result.normalizedDescription,
      category: serviceCategories.find(({ id }) => id === result.category)?.id,
      urgency: result.urgency, voice: { transcript, source: "ai" } };
  } catch {
    if (__DEV__) console.warn("[AMMERHA] Jaber voice structuring unavailable — using frontend demo fallback");
    return { ...demoVoiceRequest, voice: { transcript: demoVoiceRequest.transcript, source: "demo" } };
  } finally {
    clearTimeout(timeout);
  }
}
