import type { AiService } from "./AiService";
import { createSimulationAiService } from "./simulationAiService";

export function createMockAiService(): AiService {
  const simulation = createSimulationAiService();

  return {
    structureVoiceRequest: (input) =>
      simulation.structureVoiceRequest(input),

    diagnoseProblem: (input) =>
      simulation.diagnoseProblem(input),

    estimateFairPrice: (input) =>
      simulation.estimateFairPrice(input),

    matchTechnicians: (candidates) =>
      simulation.matchTechnicians(candidates),

    generateOfferAssistant: (input) =>
      simulation.generateOfferAssistant(input),

    assessRisk: (input) =>
      simulation.assessRisk(input),
  };
}