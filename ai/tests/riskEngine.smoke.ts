import { assessRisk } from "../src/engines/risk/riskEngine";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  // 1. Normal request → low risk
  const normal = assessRisk({
    userId: "user-1",
    requestText:
      "The kitchen sink is leaking and I need a plumber to inspect it.",
  });

  assert(
    normal.riskScore >= 0 && normal.riskScore <= 100,
    "Risk score must stay between 0 and 100.",
  );

  assert(
    normal.level === "low",
    "A normal detailed request should have low risk.",
  );

  assert(
    normal.signals.length === 0,
    "A normal request should have no risk signals.",
  );

  // 2. Very short request → medium risk
  const shortRequest = assessRisk({
    userId: "user-2",
    requestText: "help",
  });

  assert(
    shortRequest.riskScore === 45,
    "A very short vague request should score 45.",
  );

  assert(
    shortRequest.level === "medium",
    "A score of 45 should produce medium risk.",
  );

  assert(
    shortRequest.signals.includes("short_request_text"),
    "Short request should produce short_request_text.",
  );

  assert(
    shortRequest.signals.includes("insufficient_information"),
    "Vague short request should produce insufficient_information.",
  );

  // 3. Repeated request pattern
  const repeated = assessRisk({
    userId: "user-3",
    requestText:
      "I need a technician to repair the electrical outlet in my kitchen.",
    previousRequestCount: 3,
  });

  assert(
    repeated.signals.includes("repeated_request_pattern"),
    "Three or more previous requests should trigger repeated_request_pattern.",
  );

  assert(
    repeated.riskScore === 20,
    "Repeated request pattern alone should add 20 risk points.",
  );

  // 4. Suspicious pricing
  const suspiciousPrice = assessRisk({
    userId: "user-4",
    requestText:
      "The repair is complete and the technician submitted an offer.",
    offeredPrice: 300,
    fairPriceMin: 100,
    fairPriceMax: 150,
  });

  assert(
    suspiciousPrice.signals.includes("suspicious_pricing"),
    "A very high offer should trigger suspicious_pricing.",
  );

  assert(
    suspiciousPrice.riskScore === 30,
    "Suspicious pricing alone should add 30 risk points.",
  );

  assert(
    suspiciousPrice.level === "medium",
    "A score of 30 should produce medium risk.",
  );

  // 5. Urgent language
  const urgent = assessRisk({
    userId: "user-5",
    requestText:
      "There is a fire and smoke coming from the electrical outlet.",
  });

  assert(
    urgent.signals.includes("urgent_language"),
    "Urgent language should trigger urgent_language.",
  );

  assert(
    urgent.riskScore === 15,
    "Urgent language alone should add 15 risk points.",
  );

  assert(
    urgent.level === "low",
    "A score of 15 should remain low risk.",
  );

  // 6. High-risk combination
  const highRisk = assessRisk({
    userId: "user-6",
    requestText: "help",
    previousRequestCount: 5,
    offeredPrice: 300,
    fairPriceMin: 100,
    fairPriceMax: 150,
  });

  assert(
  highRisk.riskScore === 95,
  "Combined short, repeated, insufficient-information, and suspicious-pricing signals should score 95.",
  );

  assert(
    highRisk.level === "high",
    "A score of 75 should produce high risk.",
  );

  assert(
    highRisk.signals.includes("short_request_text"),
    "High-risk case should include short_request_text.",
  );

  assert(
    highRisk.signals.includes("insufficient_information"),
    "High-risk case should include insufficient_information.",
  );

  assert(
    highRisk.signals.includes("repeated_request_pattern"),
    "High-risk case should include repeated_request_pattern.",
  );

  assert(
    highRisk.signals.includes("suspicious_pricing"),
    "High-risk case should include suspicious_pricing.",
  );

  // 7. Determinism
  const first = assessRisk({
    userId: "user-7",
    requestText: "help",
    previousRequestCount: 5,
    offeredPrice: 300,
    fairPriceMin: 100,
    fairPriceMax: 150,
  });

  const second = assessRisk({
    userId: "user-7",
    requestText: "help",
    previousRequestCount: 5,
    offeredPrice: 300,
    fairPriceMin: 100,
    fairPriceMax: 150,
  });

  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "Risk assessment must be deterministic.",
  );

  console.log("A06 risk engine smoke test passed.");

  console.log({
    normal,
    shortRequest,
    repeated,
    suspiciousPrice,
    urgent,
    highRisk,
  });
}

void main().catch((error) => {
  console.error("A06 risk engine smoke test failed.");
  console.error(error);
  throw error;
});