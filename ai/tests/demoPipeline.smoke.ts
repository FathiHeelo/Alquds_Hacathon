import { createMockAiService } from "../src";
import {
  getDemoScenario,
  type DemoScenarioKey,
} from "../src/scenarios/scenarioSelector";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const demoTechnicians = [
  {
    id: "demo-plumber",
    distanceKm: 3,
    rating: 4.8,
    completedJobs: 120,
    categoryIds: ["plumbing"] as const,
    specialty: "Plumbing",
    isAvailable: true,
    isVerified: true,
    isPro: true,
  },
  {
    id: "demo-electrician",
    distanceKm: 4,
    rating: 4.7,
    completedJobs: 110,
    categoryIds: ["electrical"] as const,
    specialty: "Electrical",
    isAvailable: true,
    isVerified: true,
    isPro: true,
  },
  {
    id: "demo-ac",
    distanceKm: 5,
    rating: 4.6,
    completedJobs: 95,
    categoryIds: ["ac"] as const,
    specialty: "AC Technician",
    isAvailable: true,
    isVerified: true,
    isPro: true,
  },
  {
    id: "demo-appliance",
    distanceKm: 4,
    rating: 4.7,
    completedJobs: 100,
    categoryIds: ["appliances"] as const,
    specialty: "Appliance Technician",
    isAvailable: true,
    isVerified: true,
    isPro: true,
  },
];

async function runScenario(
  ai: ReturnType<typeof createMockAiService>,
  key: DemoScenarioKey,
) {
  const scenario = getDemoScenario(key);

  const voice = await ai.structureVoiceRequest({
    transcript: scenario.transcript,
  });

  const diagnosis = await ai.diagnoseProblem({
    category: voice.category,
    description: voice.normalizedDescription,
    urgency: voice.urgency,
  });

  const durationBucket =
    diagnosis.estimatedDuration === "30–60 minutes"
      ? "short"
      : diagnosis.estimatedDuration === "1–2 hours"
        ? "medium"
        : "long";

  const partsBucket =
    diagnosis.likelyParts.length === 0
      ? "none"
      : diagnosis.likelyParts.length <= 2
        ? "minor"
        : "major";

  const fairPrice = await ai.estimateFairPrice({
    category: diagnosis.category,
    urgency: diagnosis.urgency,
    durationBucket,
    partsBucket,
  });

  const matches = await ai.rankTechnicians({
    category: diagnosis.category,
    candidates: demoTechnicians,
  });

  const offer = await ai.generateOfferAssistant({
    diagnosis: diagnosis.issueTitle,
    fairPriceMin: fairPrice.minPrice,
    fairPriceMax: fairPrice.maxPrice,
    category: diagnosis.category,
    urgency: diagnosis.urgency,
    likelyParts: diagnosis.likelyParts,
    estimatedDuration: diagnosis.estimatedDuration,
  });

  const risk = await ai.assessRisk({
    userId: `demo-${key}`,
    requestText: scenario.transcript,
    offeredPrice: offer.suggestedPrice,
    fairPriceMin: fairPrice.minPrice,
    fairPriceMax: fairPrice.maxPrice,
  });

  return {
    scenario,
    voice,
    diagnosis,
    fairPrice,
    matches,
    offer,
    risk,
  };
}

async function main(): Promise<void> {
  const ai = createMockAiService();

  const scenarioKeys: DemoScenarioKey[] = [
    "old_city_plumbing_leak",
    "electrical_outlet",
    "ac_not_cooling",
    "washing_machine_leak",
  ];

  const results = [];

  for (const key of scenarioKeys) {
    const result = await runScenario(ai, key);

    assert(
      result.voice.category === result.diagnosis.category,
      `${key}: voice and diagnosis categories should match.`,
    );

    assert(
      result.diagnosis.confidence > 0,
      `${key}: diagnosis should have confidence.`,
    );

    assert(
      result.fairPrice.minPrice < result.fairPrice.maxPrice,
      `${key}: fair price should contain a valid range.`,
    );

    assert(
      result.matches.length === demoTechnicians.length,
      `${key}: all demo technicians should be scored.`,
    );

    assert(
      result.matches[0]?.score >= 0 &&
        result.matches[0]?.score <= 100,
      `${key}: top matching score should be between 0 and 100.`,
    );

    assert(
      result.offer.suggestedPrice >= result.fairPrice.minPrice &&
        result.offer.suggestedPrice <= result.fairPrice.maxPrice,
      `${key}: suggested offer should be inside the fair-price range.`,
    );

    assert(
      result.offer.suggestedMessage.length > 0,
      `${key}: offer assistant should return a message.`,
    );

    assert(
      result.risk.riskScore >= 0 &&
        result.risk.riskScore <= 100,
      `${key}: risk score should be between 0 and 100.`,
    );

    results.push({
      key,
      scenario: result.scenario,
      voice: result.voice,
      diagnosis: result.diagnosis,
      fairPrice: result.fairPrice,
      topTechnician: result.matches[0],
      offer: result.offer,
      risk: result.risk,
    });
  }

  // Verify the complete demo pipeline is deterministic.
  const firstRun = await runScenario(
    ai,
    "old_city_plumbing_leak",
  );

  const secondRun = await runScenario(
    ai,
    "old_city_plumbing_leak",
  );

  assert(
    JSON.stringify(firstRun) === JSON.stringify(secondRun),
    "The complete demo pipeline must be deterministic.",
  );

  console.log("A07 end-to-end demo pipeline smoke test passed.");
  console.dir(results, { depth: null });
}

void main().catch((error) => {
  console.error(
    "A07 end-to-end demo pipeline smoke test failed.",
  );
  console.error(error);
  throw error;
});