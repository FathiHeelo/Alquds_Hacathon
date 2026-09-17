import type { AiService } from "./AiService";

export function createSimulationAiService(): AiService {
  return {
    async structureVoiceRequest(input) {
      return {
        category: input.transcript.toLowerCase().includes("leak") ? "plumbing" : "general",
        description: input.transcript,
        urgency: input.transcript.toLowerCase().includes("water") ? "high" : "medium"
      };
    },
    async diagnoseProblem(input) {
      return {
        likelyIssue: input.category === "plumbing" ? "Kitchen sink supply or drain leak" : "General repair issue",
        confidence: 0.82,
        urgency: input.description.toLowerCase().includes("water") ? "high" : "medium"
      };
    },
    async estimateFairPrice(input) {
      const base = input.category === "plumbing" ? 180 : 120;
      const urgencyBoost = input.urgency === "high" ? 80 : input.urgency === "medium" ? 40 : 0;

      return {
        min: base + urgencyBoost,
        max: base + urgencyBoost + 120,
        currency: "ILS",
        rationale: "Deterministic MVP estimate based on category and urgency."
      };
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
    async generateOfferAssistant(input) {
      return {
        suggestedMessage: `I can help with ${input.diagnosis} today.`,
        suggestedPrice: Math.round((input.fairPriceMin + input.fairPriceMax) / 2)
      };
    },
    async assessRisk(input) {
      return {
        level: input.requestText.length < 8 ? "medium" : "low",
        signals: input.requestText.length < 8 ? ["short_request_text"] : []
      };
    }
  };
}
