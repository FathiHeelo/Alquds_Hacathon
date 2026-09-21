import type { AiService } from "./AiService";
import { diagnoseProblem as diagnoseProblemWithEngine } from "../engines/diagnosis/diagnosisEngine";
import { estimateFairPrice as estimateFairPriceWithEngine } from "../engines/fair-price/priceEngine";
import { rankTechnicians as rankTechniciansWithEngine } from "../engines/matching/matchingEngine";
import { generateOfferAssistant as generateOfferAssistantWithEngine } from "../engines/offer-assistant/offerAssistantEngine";
import { assessRisk as assessRiskWithEngine } from "../engines/risk/riskEngine";
export function createSimulationAiService(): AiService {
  return {
    async structureVoiceRequest(input) {
  const transcript = input.transcript?.trim() ?? "";
  const normalizedTranscript = transcript.toLowerCase();

  const isPlumbing =
    normalizedTranscript.includes("leak") ||
    normalizedTranscript.includes("water") ||
    normalizedTranscript.includes("sink") ||
    normalizedTranscript.includes("مجلى") ||
    normalizedTranscript.includes("مي") ||
    normalizedTranscript.includes("ماء");

  const isElectrical =
    normalizedTranscript.includes("electric") ||
    normalizedTranscript.includes("outlet") ||
    normalizedTranscript.includes("socket") ||
    normalizedTranscript.includes("كهرب") ||
    normalizedTranscript.includes("فيشة") ||
    normalizedTranscript.includes("مقبس");

  const isAc =
    normalizedTranscript.includes("ac") ||
    normalizedTranscript.includes("air conditioner") ||
    normalizedTranscript.includes("مكيف") ||
    normalizedTranscript.includes("تبريد");

  let category: "plumbing" | "electrical" | "ac" | "general" = "general";

  if (isPlumbing) {
    category = "plumbing";
  } else if (isElectrical) {
    category = "electrical";
  } else if (isAc) {
    category = "ac";
  }

  const urgency =
    normalizedTranscript.includes("danger") ||
    normalizedTranscript.includes("fire") ||
    normalizedTranscript.includes("spark") ||
    normalizedTranscript.includes("short circuit") ||
    normalizedTranscript.includes("خطر") ||
    normalizedTranscript.includes("حريق") ||
    normalizedTranscript.includes("شرارة")
      ? "high"
      : category === "plumbing" && isPlumbing
        ? "high"
        : "medium";

  const technicianType =
    category === "plumbing"
      ? "plumber"
      : category === "electrical"
        ? "electrician"
        : category === "ac"
          ? "ac_technician"
          : "general_technician";

  const extractedKeywords = [
    ...(isPlumbing ? ["plumbing", "leak"] : []),
    ...(isElectrical ? ["electrical", "outlet"] : []),
    ...(isAc ? ["ac", "cooling"] : []),
  ];

  const requiresConfirmation =
    transcript.length === 0 || category === "general";

  return {
    normalizedDescription:
      transcript || "No clear repair description was provided.",
    category,
    urgency,
    technicianType,
    extractedKeywords,
    requiresConfirmation,
  };
    },
    async diagnoseProblem(input) {
  return diagnoseProblemWithEngine(input);

    },
    async estimateFairPrice(input) {
  return estimateFairPriceWithEngine(input);
},
    async matchTechnicians(candidates) {
      return candidates
        .map((candidate) => ({
          technicianId: candidate.id,
          score: Math.round(candidate.rating * 20 + candidate.completedJobs / 10 - candidate.distanceKm * 2),
          reasons: ["rating", "distance", "job_history"]
        }))
        .sort((a, b) => b.score - a.score);
    },
    async rankTechnicians(input) {
      return rankTechniciansWithEngine(input);
    },
    async generateOfferAssistant(input) {
      return generateOfferAssistantWithEngine(input);
    },
    async assessRisk(input) {
  return assessRiskWithEngine(input);
    },
}
};
