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
    return aiAdapter.structureVoiceRequest({ transcript: request.voice?.transcript ?? request.description });
  },
  async diagnose(request) {
    available();
    return aiAdapter.diagnoseProblem({ category: request.category, description: request.description, urgency: request.urgency });
  },
  async estimatePrice(request) {
    available();
    return aiAdapter.estimateFairPrice({ category: request.category, urgency: request.urgency });
  },
  async match(request, technicians) {
    available();
    return aiAdapter.rankTechnicians({
      category: request.category,
      candidates: technicians.map(({ id, distanceKm, rating, completedJobs, categoryIds, specialty, isAvailable, isVerified, isPro }) => ({
        id,
        distanceKm: distanceKm ?? Number.POSITIVE_INFINITY,
        rating,
        completedJobs,
        categoryIds,
        specialty,
        isAvailable,
        isVerified,
        isPro
      }))
    });
  },
  async assessRisk(request) {
    available();
    return aiAdapter.assessRisk({ userId: request.customerId, requestText: request.description });
  }
};
