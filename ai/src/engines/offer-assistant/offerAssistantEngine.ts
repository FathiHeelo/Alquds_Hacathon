import type {
  OfferAssistantInput,
  OfferAssistantResult,
} from "../../contracts/offerAssistant.types";

function calculateSuggestedPrice(
  minPrice: number,
  maxPrice: number,
): number {
  if (
    !Number.isFinite(minPrice) ||
    !Number.isFinite(maxPrice) ||
    minPrice < 0 ||
    maxPrice < minPrice
  ) {
    return 0;
  }

  return Math.round((minPrice + maxPrice) / 2);
}

function chooseSuggestedDuration(
  input: OfferAssistantInput,
): string {
  if (input.estimatedDuration) {
    return input.estimatedDuration;
  }

  if (input.urgency === "high") {
    return "1–2 hours";
  }

  if (input.category === "electrical") {
    return "30–60 minutes";
  }

  if (input.category === "ac") {
    return "1–2 hours";
  }

  if (input.category === "appliances") {
    return "1–2 hours";
  }

  return "1–2 hours";
}

function choosePossibleParts(
  input: OfferAssistantInput,
): string[] {
  if (input.likelyParts && input.likelyParts.length > 0) {
    return [...input.likelyParts];
  }

  if (input.category === "plumbing") {
    return [
      "drain seal",
      "flexible hose",
    ];
  }

  if (input.category === "electrical") {
    return [
      "electrical outlet",
      "wire connector",
    ];
  }

  if (input.category === "ac") {
    return [
      "air filter",
      "capacitor",
    ];
  }

  if (input.category === "appliances") {
    return [
      "water inlet hose",
      "drain hose",
    ];
  }

  return [];
}

function buildExplanation(
  input: OfferAssistantInput,
  suggestedPrice: number,
  suggestedDuration: string,
  possibleParts: string[],
): string {
  const partsText =
    possibleParts.length > 0
      ? ` Possible parts: ${possibleParts.join(", ")}.`
      : "";

  const urgencyText = input.urgency
    ? ` Urgency: ${input.urgency}.`
    : "";

  return (
    `Suggested price of ${suggestedPrice} ILS is based on the provided fair-price range ` +
    `of ${input.fairPriceMin}-${input.fairPriceMax} ILS.` +
    ` Estimated duration: ${suggestedDuration}.` +
    partsText +
    urgencyText
  );
}

function buildArabicMessage(
  input: OfferAssistantInput,
  suggestedPrice: number,
  suggestedDuration: string,
): string {
  const diagnosis = input.diagnosis.trim();

  return (
    `مرحباً، بخصوص ${diagnosis}، ` +
    `أقدر أقدم الخدمة بسعر ${suggestedPrice} شيكل تقريباً، ` +
    `والمدة المتوقعة ${suggestedDuration}. ` +
    `السعر قابل للتأكيد بعد المعاينة وتحديد القطع المطلوبة.`
  );
}

export function generateOfferAssistant(
  input: OfferAssistantInput,
): OfferAssistantResult {
  const suggestedPrice = calculateSuggestedPrice(
    input.fairPriceMin,
    input.fairPriceMax,
  );

  const suggestedDuration = chooseSuggestedDuration(input);

  const possibleParts = choosePossibleParts(input);

  const explanation = buildExplanation(
    input,
    suggestedPrice,
    suggestedDuration,
    possibleParts,
  );

  const suggestedMessage = buildArabicMessage(
    input,
    suggestedPrice,
    suggestedDuration,
  );

  return {
    suggestedDuration,
    suggestedPrice,
    possibleParts,
    explanation,
    suggestedMessage,
  };
}