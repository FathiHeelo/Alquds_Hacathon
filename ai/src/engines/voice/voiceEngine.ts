import type {
  StructuredVoiceRequest,
  VoiceRequestInput,
} from "../../contracts/voice.types";

import { getDemoScenario } from "../../scenarios/scenarioSelector";

import { plumbingVoiceFixture } from "../../fixtures/plumbing/plumbingFixtures";

import { electricalVoiceFixture } from "../../fixtures/electrical/electricalFixtures";

import { acVoiceFixture } from "../../fixtures/ac/acFixtures";

import { applianceVoiceFixture } from "../../fixtures/appliances/applianceFixtures";

function includesAny(
  text: string,
  keywords: readonly string[],
): boolean {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function structureVoiceRequest(
  input: VoiceRequestInput,
): StructuredVoiceRequest {
  // If the caller provides our known demo scenario,
  // use its fixed transcript so the demo is deterministic.
  let transcript = input.transcript?.trim() ?? "";

  if (input.scenarioKey === "old_city_plumbing_leak") {
    transcript = getDemoScenario("old_city_plumbing_leak").transcript;
  }

  const normalizedTranscript = transcript.toLowerCase();

  // -----------------------------
  // Plumbing detection
  // -----------------------------
  const isPlumbing = includesAny(
  normalizedTranscript,
  plumbingVoiceFixture.keywords,
);

  // -----------------------------
  // Electrical detection
  // -----------------------------
  const isElectrical = includesAny(
  normalizedTranscript,
  electricalVoiceFixture.keywords,
);

  // -----------------------------
  // AC detection
  // -----------------------------
  const isAc = includesAny(
  normalizedTranscript,
  acVoiceFixture.keywords,
);

  // -----------------------------
  // Appliance detection
  // -----------------------------
  const isAppliance = includesAny(
  normalizedTranscript,
  applianceVoiceFixture.keywords,
);

  // -----------------------------
  // Determine category
  // -----------------------------
  let category: StructuredVoiceRequest["category"] = "general";

if (isAppliance) {
  category = "appliances";
} else if (isAc) {
  category = "ac";
} else if (isElectrical) {
  category = "electrical";
} else if (isPlumbing) {
  category = "plumbing";
}

  // -----------------------------
  // Determine urgency
  // -----------------------------
  const isDangerous =
    normalizedTranscript.includes("fire") ||
    normalizedTranscript.includes("smoke") ||
    normalizedTranscript.includes("spark") ||
    normalizedTranscript.includes("short circuit") ||
    normalizedTranscript.includes("danger") ||
    normalizedTranscript.includes("حريق") ||
    normalizedTranscript.includes("دخان") ||
    normalizedTranscript.includes("شرارة") ||
    normalizedTranscript.includes("خطر");

  const urgency: StructuredVoiceRequest["urgency"] =
    isDangerous || category === "plumbing"
      ? "high"
      : "medium";

  // -----------------------------
  // Determine technician type
  // -----------------------------
  let technicianType: StructuredVoiceRequest["technicianType"] =
    "general_technician";

  if (category === "plumbing") {
    technicianType = "plumber";
  } else if (category === "electrical") {
    technicianType = "electrician";
  } else if (category === "ac") {
    technicianType = "ac_technician";
  } else if (category === "appliances") {
    technicianType = "appliance_technician";
  }

  // -----------------------------
  // Extract simple deterministic keywords
  // -----------------------------
  const extractedKeywords: string[] = [];

if (category === "plumbing") {
  extractedKeywords.push("plumbing");

  if (
    includesAny(
      normalizedTranscript,
      plumbingVoiceFixture.extractedKeywordMap.leak,
    )
  ) {
    extractedKeywords.push("leak");
  }

  if (
    includesAny(
      normalizedTranscript,
      plumbingVoiceFixture.extractedKeywordMap.sink,
    )
  ) {
    extractedKeywords.push("sink");
  }
}

if (category === "electrical") {
  extractedKeywords.push("electrical");

  if (
    includesAny(
      normalizedTranscript,
      electricalVoiceFixture.extractedKeywordMap.outlet,
    )
  ) {
    extractedKeywords.push("outlet");
  }
}

if (category === "ac") {
  extractedKeywords.push("ac");

  if (
    includesAny(
      normalizedTranscript,
      acVoiceFixture.extractedKeywordMap.cooling,
    )
  ) {
    extractedKeywords.push("cooling");
  }
}

if (category === "appliances") {
  extractedKeywords.push("appliance");

  if (
    includesAny(
      normalizedTranscript,
      applianceVoiceFixture.extractedKeywordMap.leak,
    )
  ) {
    extractedKeywords.push("leak");
  }
}

  // -----------------------------
  // Safe fallback
  // -----------------------------
  const requiresConfirmation =
    transcript.length === 0 || category === "general";

  return {
    normalizedDescription:
      transcript || "The repair problem could not be clearly identified.",
    category,
    urgency,
    technicianType,
    extractedKeywords,
    requiresConfirmation,
  };
}