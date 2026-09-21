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
  async diagnose(request, answers) {
    available();
    return aiAdapter.diagnoseProblem({ category: request.category, description: request.description, urgency: request.urgency, voiceTranscript: request.voice?.transcript, photoContext: request.media.length ? "attachment_provided_no_visual_analysis" : undefined, answers: answers ? [...answers] : undefined });
  },
  async estimatePrice(request, diagnosis) {
    available();
    const context = diagnosis ?? request.aiSummary?.diagnosis;
    return aiAdapter.estimateFairPrice({ category: context?.category ?? request.category, urgency: context?.urgency ?? request.urgency, durationBucket: context?.fairPriceContext?.durationBucket, partsBucket: context?.fairPriceContext?.partsBucket });
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
