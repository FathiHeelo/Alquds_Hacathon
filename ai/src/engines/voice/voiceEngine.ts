import type {
  StructuredVoiceRequest,
  VoiceRequestInput,
} from "../../contracts/voice.types";

import { getDemoScenario } from "../../scenarios/scenarioSelector";

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
  const isPlumbing =
    normalizedTranscript.includes("leak") ||
    normalizedTranscript.includes("water") ||
    normalizedTranscript.includes("sink") ||
    normalizedTranscript.includes("faucet") ||
    normalizedTranscript.includes("pipe") ||
    normalizedTranscript.includes("مجلى") ||
    normalizedTranscript.includes("مية") ||
    normalizedTranscript.includes("مي") ||
    normalizedTranscript.includes("ماء") ||
    normalizedTranscript.includes("ماسورة") ||
    normalizedTranscript.includes("حنفية");

  // -----------------------------
  // Electrical detection
  // -----------------------------
  const isElectrical =
    normalizedTranscript.includes("electrical") ||
    normalizedTranscript.includes("electric") ||
    normalizedTranscript.includes("outlet") ||
    normalizedTranscript.includes("socket") ||
    normalizedTranscript.includes("plug") ||
    normalizedTranscript.includes("electricity") ||
    normalizedTranscript.includes("كهرب") ||
    normalizedTranscript.includes("فيشة") ||
    normalizedTranscript.includes("مقبس") ||
    normalizedTranscript.includes("قاطع");

  // -----------------------------
  // AC detection
  // -----------------------------
  const isAc =
    normalizedTranscript.includes("air conditioner") ||
    normalizedTranscript.includes("air conditioning") ||
    normalizedTranscript.includes("ac") ||
    normalizedTranscript.includes("cooling") ||
    normalizedTranscript.includes("not cooling") ||
    normalizedTranscript.includes("مكيف") ||
    normalizedTranscript.includes("تبريد") ||
    normalizedTranscript.includes("بارد");

  // -----------------------------
  // Appliance detection
  // -----------------------------
  const isAppliance =
    normalizedTranscript.includes("washing machine") ||
    normalizedTranscript.includes("washer") ||
    normalizedTranscript.includes("fridge") ||
    normalizedTranscript.includes("refrigerator") ||
    normalizedTranscript.includes("غسالة") ||
    normalizedTranscript.includes("ثلاجة");

  // -----------------------------
  // Determine category
  // -----------------------------
  let category: StructuredVoiceRequest["category"] = "general";

if (isAppliance) {
  category = "appliance";
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
  } else if (category === "appliance") {
    technicianType = "appliance_technician";
  }

  // -----------------------------
  // Extract simple deterministic keywords
  // -----------------------------
  const extractedKeywords: string[] = [];

if (category === "plumbing") {
  extractedKeywords.push("plumbing");

  if (
    normalizedTranscript.includes("leak") ||
    normalizedTranscript.includes("water") ||
    normalizedTranscript.includes("مي") ||
    normalizedTranscript.includes("ماء")
  ) {
    extractedKeywords.push("leak");
  }

  if (
    normalizedTranscript.includes("sink") ||
    normalizedTranscript.includes("مجلى")
  ) {
    extractedKeywords.push("sink");
  }
}

if (category === "electrical") {
  extractedKeywords.push("electrical");

  if (
    normalizedTranscript.includes("outlet") ||
    normalizedTranscript.includes("socket") ||
    normalizedTranscript.includes("مقبس") ||
    normalizedTranscript.includes("فيشة")
  ) {
    extractedKeywords.push("outlet");
  }
}

if (category === "ac") {
  extractedKeywords.push("ac");

  if (
    normalizedTranscript.includes("cooling") ||
    normalizedTranscript.includes("not cooling") ||
    normalizedTranscript.includes("تبريد")
  ) {
    extractedKeywords.push("cooling");
  }
}

if (category === "appliance") {
  extractedKeywords.push("appliance");

  if (
    normalizedTranscript.includes("leak") ||
    normalizedTranscript.includes("مي") ||
    normalizedTranscript.includes("ماء")
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