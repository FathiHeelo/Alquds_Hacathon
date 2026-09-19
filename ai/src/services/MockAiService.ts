import type { AiService } from "./AiService";
import { createSimulationAiService } from "./simulationAiService";
import { structureVoiceRequest as structureVoiceRequestWithEngine } from "../engines/voice/voiceEngine";

export function createMockAiService(): AiService {
  const simulation = createSimulationAiService();

  return {
    structureVoiceRequest: async (input) =>
        structureVoiceRequestWithEngine(input),

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