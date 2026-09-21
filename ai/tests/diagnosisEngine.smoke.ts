import { diagnoseProblem } from "../src/engines/diagnosis/diagnosisEngine";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  // 1. Plumbing leak
  const plumbing = diagnoseProblem({
    category: "plumbing",
    description: "There is water leaking under the kitchen sink.",
    urgency: "high",
  });

  assert(
    plumbing.category === "plumbing",
    "Plumbing case should stay in the plumbing category.",
  );

  assert(
    plumbing.recommendedTechnicianType === "plumber",
    "Plumbing case should recommend a plumber.",
  );

  assert(
    plumbing.confidenceLevel === "high",
    "Plumbing case should have high confidence.",
  );

  assert(
    plumbing.needsConfirmation === false,
    "Known plumbing case should not require confirmation.",
  );

  assert(
    plumbing.likelyParts.length > 0,
    "Plumbing case should contain likely parts.",
  );

  // 2. Electrical outlet
  const electrical = diagnoseProblem({
    category: "electrical",
    description: "The electrical outlet is not working.",
    urgency: "medium",
  });

  assert(
    electrical.category === "electrical",
    "Electrical case should stay in the electrical category.",
  );

  assert(
    electrical.recommendedTechnicianType === "electrician",
    "Electrical case should recommend an electrician.",
  );

  assert(
    electrical.confidenceLevel === "high",
    "Electrical case should have high confidence.",
  );

  // 3. AC not cooling
  const ac = diagnoseProblem({
    category: "ac",
    description: "The AC is not cooling the room.",
    urgency: "medium",
  });

  assert(
    ac.category === "ac",
    "AC case should stay in the AC category.",
  );

  assert(
    ac.recommendedTechnicianType === "ac_technician",
    "AC case should recommend an AC technician.",
  );

  assert(
    ac.confidenceLevel === "high",
    "AC case should have high confidence.",
  );

  // 4. Washing-machine leak
  const appliance = diagnoseProblem({
    category: "appliances",
    description: "The washing machine is leaking water.",
    urgency: "medium",
  });

  assert(
    appliance.category === "appliances",
    "Washing-machine case should stay in the appliances category.",
  );

  assert(
    appliance.recommendedTechnicianType === "appliance_technician",
    "Washing-machine case should recommend an appliance technician.",
  );

  assert(
    appliance.confidenceLevel === "high",
    "Washing-machine case should have high confidence.",
  );

  // 5. Unknown / insufficient information
  const unknown = diagnoseProblem({
    category: "general",
    description: "Something is wrong at home.",
  });

  assert(
    unknown.confidenceLevel === "low",
    "Unknown case should have low confidence.",
  );

  assert(
    unknown.needsConfirmation === true,
    "Unknown case should require confirmation.",
  );

  assert(
    unknown.caution !== null,
    "Unknown case should include a caution message.",
  );

  console.log("A02 diagnosis engine smoke test passed.");

  console.log({
    plumbing,
    electrical,
    ac,
    appliance,
    unknown,
  });
}

void main().catch((error) => {
  console.error("A02 diagnosis engine smoke test failed.");
  console.error(error);
  throw error;
});