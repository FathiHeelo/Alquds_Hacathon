import { generateOfferAssistant } from "../src/engines/offer-assistant/offerAssistantEngine";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  // 1. Plumbing offer
  const plumbing = generateOfferAssistant({
    diagnosis: "Kitchen sink water leak",
    fairPriceMin: 110,
    fairPriceMax: 150,
    category: "plumbing",
    urgency: "high",
    likelyParts: [
      "drain seal",
      "flexible hose",
      "pipe connector",
    ],
    estimatedDuration: "1–2 hours",
  });

  assert(
    plumbing.suggestedPrice === 130,
    "Plumbing suggested price should be the midpoint of the range.",
  );

  assert(
    plumbing.suggestedDuration === "1–2 hours",
    "Provided diagnosis duration should be preserved.",
  );

  assert(
    plumbing.possibleParts.length === 3,
    "Provided likely parts should be preserved.",
  );

  assert(
    plumbing.suggestedMessage.includes("130"),
    "Arabic offer message should include the suggested price.",
  );

  assert(
    plumbing.suggestedMessage.includes("1–2 hours"),
    "Offer message should include the suggested duration.",
  );

  // 2. Electrical offer
  const electrical = generateOfferAssistant({
    diagnosis: "Electrical outlet not working",
    fairPriceMin: 90,
    fairPriceMax: 140,
    category: "electrical",
    urgency: "medium",
  });

  assert(
    electrical.suggestedPrice === 115,
    "Electrical suggested price should be the midpoint of the range.",
  );

  assert(
    electrical.possibleParts.length > 0,
    "Electrical offer should contain possible parts.",
  );

  assert(
    electrical.suggestedDuration === "30–60 minutes",
    "Electrical offer should use the electrical default duration.",
  );

  // 3. AC offer
  const ac = generateOfferAssistant({
    diagnosis: "AC not cooling properly",
    fairPriceMin: 130,
    fairPriceMax: 220,
    category: "ac",
    urgency: "medium",
  });

  assert(
    ac.suggestedPrice === 175,
    "AC suggested price should be the midpoint of the range.",
  );

  assert(
    ac.suggestedDuration === "1–2 hours",
    "AC offer should use the AC default duration.",
  );

  // 4. Appliance offer
  const appliance = generateOfferAssistant({
    diagnosis: "Washing-machine water leak",
    fairPriceMin: 100,
    fairPriceMax: 180,
    category: "appliances",
    urgency: "medium",
  });

  assert(
    appliance.suggestedPrice === 140,
    "Appliance suggested price should be the midpoint of the range.",
  );

  assert(
    appliance.possibleParts.length > 0,
    "Appliance offer should contain possible parts.",
  );

  // 5. Generic fallback
  const generic = generateOfferAssistant({
    diagnosis: "General repair issue",
    fairPriceMin: 80,
    fairPriceMax: 140,
    category: "general",
    urgency: "low",
  });

  assert(
    generic.suggestedPrice === 110,
    "Generic suggested price should be the midpoint of the range.",
  );

  assert(
    generic.suggestedDuration.length > 0,
    "Generic offer should contain a duration.",
  );

  assert(
    generic.suggestedMessage.length > 0,
    "Generic offer should contain a message.",
  );

  // 6. Determinism
  const first = generateOfferAssistant({
    diagnosis: "Kitchen sink water leak",
    fairPriceMin: 110,
    fairPriceMax: 150,
    category: "plumbing",
    urgency: "high",
  });

  const second = generateOfferAssistant({
    diagnosis: "Kitchen sink water leak",
    fairPriceMin: 110,
    fairPriceMax: 150,
    category: "plumbing",
    urgency: "high",
  });

  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "Offer Assistant must be deterministic.",
  );

  console.log("A05 offer assistant smoke test passed.");

  console.log({
    plumbing,
    electrical,
    ac,
    appliance,
    generic,
  });
}

void main().catch((error) => {
  console.error("A05 offer assistant smoke test failed.");
  console.error(error);
  throw error;
});