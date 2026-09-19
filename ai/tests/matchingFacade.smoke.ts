import { createMockAiService } from "../src/index";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const ai = createMockAiService();

  const input = {
    category: "plumbing" as const,

    candidates: [
      {
        id: "tech-A",
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
        id: "tech-B",
        distanceKm: 8,
        rating: 4.5,
        completedJobs: 80,
        categoryIds: ["electrical"] as const,
        specialty: "Electrical",
        isAvailable: true,
        isVerified: true,
        isPro: false,
      },
      {
        id: "tech-C",
        distanceKm: 2,
        rating: 4.2,
        completedJobs: 40,
        categoryIds: ["plumbing"] as const,
        specialty: "Plumbing",
        isAvailable: false,
        isVerified: true,
        isPro: false,
      },
    ],
  };

  const first = await ai.rankTechnicians(input);
  const second = await ai.rankTechnicians(input);

  // Same input must produce exactly the same ranking.
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "Facade ranking must be deterministic.",
  );

  // The strongest plumbing candidate should rank first.
  assert(
    first[0]?.technicianId === "tech-A",
    "tech-A should rank first.",
  );

  // The score must stay inside the required 0–100 range.
  for (const match of first) {
    assert(
      match.score >= 0 && match.score <= 100,
      `Score for ${match.technicianId} must be between 0 and 100.`,
    );
  }

  // The score breakdown should prove the engine was used.
  assert(
    first[0]?.scoreBreakdown?.specialty === 30,
    "Facade should return the matching engine score breakdown.",
  );

  console.log("A04 matching facade smoke test passed.");
  console.log(first);
}

void main().catch((error) => {
  console.error("A04 matching facade smoke test failed.");
  console.error(error);
  throw error;
});