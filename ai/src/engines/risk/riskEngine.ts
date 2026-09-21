import type {
  RiskInput,
  RiskResult,
  RiskSignalCode,
} from "../../contracts/risk.types";

const SIGNAL_SCORES: Record<RiskSignalCode, number> = {
  short_request_text: 25,
  repeated_request_pattern: 20,
  suspicious_pricing: 30,
  urgent_language: 15,
  insufficient_information: 20,
};

function containsUrgentLanguage(text: string): boolean {
  const urgentTerms = [
    "urgent",
    "emergency",
    "immediately",
    "danger",
    "fire",
    "smoke",
    "spark",
    "خطر",
    "طوارئ",
    "عاجل",
    "حريق",
    "دخان",
    "شرارة",
  ];

  return urgentTerms.some((term) => text.includes(term));
}

function containsInsufficientInformation(text: string): boolean {
  const vagueTerms = [
    "problem",
    "issue",
    "something wrong",
    "help",
    "مشكل",
    "مشكلة",
    "في مشكلة",
    "ساعدني",
  ];

  const hasVagueTerm = vagueTerms.some((term) =>
    text.includes(term),
  );

  return text.length < 20 && hasVagueTerm;
}

function hasSuspiciousPricing(input: RiskInput): boolean {
  if (
    input.offeredPrice === undefined ||
    input.fairPriceMax === undefined ||
    !Number.isFinite(input.offeredPrice) ||
    !Number.isFinite(input.fairPriceMax) ||
    input.fairPriceMax <= 0
  ) {
    return false;
  }

  return input.offeredPrice > input.fairPriceMax * 1.5;
}

function calculateRiskScore(signals: RiskSignalCode[]): number {
  const score = signals.reduce(
    (total, signal) => total + SIGNAL_SCORES[signal],
    0,
  );

  return Math.min(100, score);
}

function determineRiskLevel(
  riskScore: number,
): RiskResult["level"] {
  if (riskScore >= 60) {
    return "high";
  }

  if (riskScore >= 30) {
    return "medium";
  }

  return "low";
}

export function assessRisk(
  input: RiskInput,
): RiskResult {
  const requestText = input.requestText.trim().toLowerCase();

  const signals: RiskSignalCode[] = [];

  if (requestText.length < 8) {
    signals.push("short_request_text");
  }

  if (containsInsufficientInformation(requestText)) {
    signals.push("insufficient_information");
  }

  if (
    input.previousRequestCount !== undefined &&
    Number.isFinite(input.previousRequestCount) &&
    input.previousRequestCount >= 3
  ) {
    signals.push("repeated_request_pattern");
  }

  if (hasSuspiciousPricing(input)) {
    signals.push("suspicious_pricing");
  }

  if (containsUrgentLanguage(requestText)) {
    signals.push("urgent_language");
  }

  const riskScore = calculateRiskScore(signals);

  return {
    riskScore,
    level: determineRiskLevel(riskScore),
    signals,
  };
}