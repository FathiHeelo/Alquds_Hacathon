import type {
  DiagnosisInput,
  DiagnosisResult,
} from "../../contracts/diagnosis.types";

function createUnknownDiagnosis(
  input: DiagnosisInput,
): DiagnosisResult {
  return {
    issueTitle: "Unclear repair issue",
    probableCause:
      "The provided description is not specific enough to identify a probable cause.",
    category: input.category,
    urgency: input.urgency ?? "medium",
    recommendedTechnicianType: "general_technician",
    likelyParts: [],
    estimatedDuration: "Unknown",
    confidence: 0.25,
    confidenceLevel: "low",
    caution:
      "Manual confirmation is recommended before assigning a technician.",
    needsConfirmation: true,
    likelyIssue: "Unclear repair issue",
  };
}

export function diagnoseProblem(
  input: DiagnosisInput,
): DiagnosisResult {
  const description = input.description.trim().toLowerCase();
  const urgency = input.urgency ?? "medium";

  // Plumbing leak
  if (
    input.category === "plumbing" &&
    (
      description.includes("leak") ||
      description.includes("water") ||
      description.includes("sink") ||
      description.includes("مجلى") ||
      description.includes("مي") ||
      description.includes("ماء")
    )
  ) {
    return {
      issueTitle: "Kitchen sink water leak",
      probableCause:
        "A leaking or damaged sink supply/drain connection is likely causing the water leak.",
      category: "plumbing",
      urgency,
      recommendedTechnicianType: "plumber",
      likelyParts: [
        "drain seal",
        "flexible hose",
        "pipe connector",
      ],
      estimatedDuration: "1–2 hours",
      confidence: 0.91,
      confidenceLevel: "high",
      caution:
        "The exact failed component should be confirmed on site before replacement.",
      needsConfirmation: false,
      likelyIssue: "Kitchen sink water leak",
    };
  }

  // Electrical outlet
  if (
    input.category === "electrical" &&
    (
      description.includes("outlet") ||
      description.includes("socket") ||
      description.includes("plug") ||
      description.includes("electric") ||
      description.includes("كهرب") ||
      description.includes("فيشة") ||
      description.includes("مقبس")
    )
  ) {
    return {
      issueTitle: "Electrical outlet not working",
      probableCause:
        "A faulty outlet connection, damaged outlet, or local circuit issue is likely.",
      category: "electrical",
      urgency,
      recommendedTechnicianType: "electrician",
      likelyParts: [
        "electrical outlet",
        "terminal connector",
        "wire connector",
      ],
      estimatedDuration: "30–60 minutes",
      confidence: 0.88,
      confidenceLevel: "high",
      caution:
        "The circuit should be isolated and tested by the technician before repair.",
      needsConfirmation: false,
      likelyIssue: "Electrical outlet not working",
    };
  }

  // AC not cooling
  if (
    input.category === "ac" &&
    (
      description.includes("cooling") ||
      description.includes("not cooling") ||
      description.includes("air conditioner") ||
      description.includes("air conditioning") ||
      description.includes("ac") ||
      description.includes("مكيف") ||
      description.includes("تبريد")
    )
  ) {
    return {
      issueTitle: "AC not cooling properly",
      probableCause:
        "A refrigerant, airflow, filter, or cooling-system issue may be causing poor cooling.",
      category: "ac",
      urgency,
      recommendedTechnicianType: "ac_technician",
      likelyParts: [
        "air filter",
        "capacitor",
        "refrigerant",
      ],
      estimatedDuration: "1–2 hours",
      confidence: 0.84,
      confidenceLevel: "high",
      caution:
        "The exact cause requires on-site inspection and testing.",
      needsConfirmation: false,
      likelyIssue: "AC not cooling properly",
    };
  }

  // Washing-machine leak
  if (
    input.category === "appliances" &&
    (
      description.includes("washing machine") ||
      description.includes("washer") ||
      description.includes("غسالة")
    ) &&
    (
      description.includes("leak") ||
      description.includes("water") ||
      description.includes("مي") ||
      description.includes("ماء")
    )
  ) {
    return {
      issueTitle: "Washing-machine water leak",
      probableCause:
        "A hose, drain connection, door seal, or internal water connection may be leaking.",
      category: "appliances",
      urgency,
      recommendedTechnicianType: "appliance_technician",
      likelyParts: [
        "water inlet hose",
        "drain hose",
        "door seal",
      ],
      estimatedDuration: "1–2 hours",
      confidence: 0.89,
      confidenceLevel: "high",
      caution:
        "The technician should identify the exact leak source before replacing parts.",
      needsConfirmation: false,
      likelyIssue: "Washing-machine water leak",
    };
  }

  return createUnknownDiagnosis(input);
}