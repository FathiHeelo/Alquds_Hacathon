import {
  estimateFairPrice,
  evaluateOffer,
} from "../src/engines/fair-price/priceEngine";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  // 1. Plumbing
  const plumbing = estimateFairPrice({
    category: "plumbing",
    urgency: "high",
    durationBucket: "medium",
    partsBucket: "minor",
  });

  assert(
    plumbing.minPrice < plumbing.maxPrice,
    "Plumbing range should have minPrice < maxPrice.",
  );

  assert(
    plumbing.status === "fair",
    "Normal plumbing estimate should return fair status.",
  );

  assert(
    plumbing.confidence > 0,
    "Plumbing estimate should have confidence.",
  );

  // 2. Electrical
  const electrical = estimateFairPrice({
    category: "electrical",
    urgency: "medium",
    durationBucket: "short",
    partsBucket: "none",
  });

  assert(
    electrical.minPrice < electrical.maxPrice,
    "Electrical range should have minPrice < maxPrice.",
  );

  // 3. AC
  const ac = estimateFairPrice({
    category: "ac",
    urgency: "medium",
    durationBucket: "medium",
    partsBucket: "minor",
  });

  assert(
    ac.minPrice < ac.maxPrice,
    "AC range should have minPrice < maxPrice.",
  );

  // 4. Appliances
  const appliances = estimateFairPrice({
    category: "appliances",
    urgency: "medium",
    durationBucket: "medium",
    partsBucket: "minor",
  });

  assert(
    appliances.minPrice < appliances.maxPrice,
    "Appliance range should have minPrice < maxPrice.",
  );

  // 5. Offer evaluation: fair
  const fair = evaluateOffer(130, {
    minPrice: 110,
    maxPrice: 150,
  });

  assert(
    fair.status === "fair",
    "Offer inside the range should be fair.",
  );

  // 6. Offer evaluation: slightly high
  const slightlyHigh = evaluateOffer(155, {
    minPrice: 110,
    maxPrice: 150,
  });

  assert(
    slightlyHigh.status === "slightly_high",
    "Offer just above the range should be slightly_high.",
  );

  // 7. Offer evaluation: high
  const high = evaluateOffer(200, {
    minPrice: 110,
    maxPrice: 150,
  });

  assert(
    high.status === "high",
    "Offer well above the range should be high.",
  );

  // 8. Offer evaluation: low
  const low = evaluateOffer(80, {
    minPrice: 110,
    maxPrice: 150,
  });

  assert(
    low.status === "low",
    "Offer well below the range should be low.",
  );

  // 9. Insufficient data
  const insufficient = evaluateOffer(Number.NaN, {
    minPrice: 110,
    maxPrice: 150,
  });

  assert(
    insufficient.status === "insufficient_data",
    "Invalid offer data should return insufficient_data.",
  );

  console.log("A03 price engine smoke test passed.");

  console.log({
    plumbing,
    electrical,
    ac,
    appliances,
    fair,
    slightlyHigh,
    high,
    low,
    insufficient,
  });
}

void main().catch((error) => {
  console.error("A03 price engine smoke test failed.");
  console.error(error);
  throw error;
});