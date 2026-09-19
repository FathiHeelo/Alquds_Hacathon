import { rankTechnicians } from "../src/engines/matching/matchingEngine";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
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

  // Run the same input twice to verify determinism.
  const first = rankTechnicians(input);
  const second = rankTechnicians(input);

  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "Matching must be deterministic for identical input.",
  );

  // Every score must be inside the required 0–100 range.
  for (const match of first) {
    assert(
      match.score >= 0 && match.score <= 100,
      `Score for ${match.technicianId} must be between 0 and 100.`,
    );
  }

  // The strongest plumbing candidate should rank first.
  assert(
    first[0]?.technicianId === "tech-A",
    "The strongest plumbing candidate should rank first.",
  );

  assert(
    first[0]?.scoreBreakdown?.specialty === 30,
    "A full specialty match should receive the full specialty weight.",
  );

  assert(
    first[0]?.reasons.includes("specialty_match"),
    "A specialty match should include the specialty_match reason.",
  );

  assert(
    first[0]?.reasons.includes("available"),
    "An available technician should include the available reason.",
  );

  // Verify an unavailable technician is explicitly marked.
  const unavailable = first.find(
    (match) => match.technicianId === "tech-C",
  );

  assert(
    unavailable?.reasons.includes("unavailable") === true,
    "An unavailable technician should include the unavailable reason.",
  );

  // Legacy-style candidate with only the fields currently sent by the frontend.
  const legacy = rankTechnicians({
    category: "plumbing",
    candidates: [
      {
        id: "legacy-tech",
        distanceKm: 5,
        rating: 4.5,
        completedJobs: 60,
      },
    ],
  });

  assert(
    legacy.length === 1,
    "Legacy technician data should still be accepted.",
  );

  assert(
    legacy[0].score >= 0 && legacy[0].score <= 100,
    "Legacy candidate score must still be between 0 and 100.",
  );

  console.log("A04 matching engine smoke test passed.");
  console.log(first);
  console.log("Legacy candidate:", legacy);
}

void main().catch((error) => {
  console.error("A04 matching engine smoke test failed.");
  console.error(error);
  throw error;
});