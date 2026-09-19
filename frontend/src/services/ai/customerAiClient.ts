import { appConfig } from "../../app/config/appConfig";
import type { CustomerAiClient } from "../../domain/contracts/customerAiClient";
import { AppError } from "../../shared/errors/AppError";
import { aiAdapter } from "./aiAdapter";

function available() {
  if (appConfig.aiMode === "remote") throw new AppError("AI_UNAVAILABLE", "خدمة الذكاء غير متاحة حالياً.");
}

export const customerAiClient: CustomerAiClient = {
  async structureRequest(request) {
    available();
    if (request.voice) return aiAdapter.structureVoiceRequest({ transcript: request.voice.transcript });
    const technicianType =
    request.category === "plumbing"
        ? "plumber"
        : request.category === "electrical"
            ? "electrician"
            : request.category === "ac"
                ? "ac_technician"
                : request.category === "appliances"
                    ? "appliance_technician"
                    : "general_technician";

return {
    normalizedDescription: request.description,
    category: request.category,
    urgency: request.urgency,
    technicianType,
    extractedKeywords: [],
    requiresConfirmation: false,
};
  },
  async diagnose(request) {
    available();
    return aiAdapter.diagnoseProblem({ category: request.category, description: request.description });
  },
  async estimatePrice(request) {
    available();
    return aiAdapter.estimateFairPrice({ category: request.category, urgency: request.urgency });
  },
  async match(technicians) {
    available();
    return aiAdapter.matchTechnicians(technicians.map(({ id, distanceKm, rating, completedJobs }) =>
      ({ id, distanceKm, rating, completedJobs })));
  }
};
