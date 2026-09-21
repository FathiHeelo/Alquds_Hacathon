import type {
  FairPriceInput,
  FairPriceResult,
  OfferEvaluation,
} from "../../contracts/fairPrice.types";

import type { PriceStatus } from "../../contracts/ai.types";

interface PriceBand {
  min: number;
  max: number;
}

const PRICE_BANDS: Record<string, PriceBand> = {
  plumbing: {
    min: 110,
    max: 150,
  },
  electrical: {
    min: 90,
    max: 140,
  },
  ac: {
    min: 130,
    max: 220,
  },
  appliances: {
    min: 100,
    max: 180,
  },
  carpentry: {
    min: 100,
    max: 180,
  },
  electronics: {
    min: 90,
    max: 170,
  },
  general: {
    min: 80,
    max: 140,
  },
};

const URGENCY_ADJUSTMENT: Record<FairPriceInput["urgency"], number> = {
  low: 0,
  medium: 20,
  high: 40,
};

const DURATION_ADJUSTMENT: Record<
  NonNullable<FairPriceInput["durationBucket"]>,
  number
> = {
  short: 0,
  medium: 25,
  long: 60,
};

const PARTS_ADJUSTMENT: Record<
  NonNullable<FairPriceInput["partsBucket"]>,
  number
> = {
  none: 0,
  minor: 20,
  major: 60,
};

export function estimateFairPrice(
  input: FairPriceInput,
): FairPriceResult {
  const band = PRICE_BANDS[input.category];

  if (!band) {
    return {
      minPrice: 0,
      maxPrice: 0,
      status: "insufficient_data",
      confidence: 0,
      explanationFactors: [
        "No configured price band exists for this category.",
      ],
      min: 0,
      max: 0,
      currency: "ILS",
      rationale: "Insufficient data for a deterministic price estimate.",
    };
  }

  const urgencyAdjustment = URGENCY_ADJUSTMENT[input.urgency];

  const durationAdjustment = input.durationBucket
    ? DURATION_ADJUSTMENT[input.durationBucket]
    : 0;

  const partsAdjustment = input.partsBucket
    ? PARTS_ADJUSTMENT[input.partsBucket]
    : 0;

  const areaAdjustment = input.areaFactor
    ? Math.round((input.areaFactor - 1) * band.max)
    : 0;

  const minPrice =
    band.min +
    urgencyAdjustment +
    durationAdjustment +
    partsAdjustment +
    areaAdjustment;

  const maxPrice =
    band.max +
    urgencyAdjustment +
    durationAdjustment +
    partsAdjustment +
    areaAdjustment;

  const explanationFactors: string[] = [
    `Base category range: ${band.min}-${band.max} ILS.`,
    `Urgency adjustment: +${urgencyAdjustment} ILS.`,
  ];

  if (input.durationBucket) {
    explanationFactors.push(
      `Duration adjustment: +${durationAdjustment} ILS.`,
    );
  }

  if (input.partsBucket) {
    explanationFactors.push(
      `Parts adjustment: +${partsAdjustment} ILS.`,
    );
  }

  if (input.areaFactor !== undefined) {
    explanationFactors.push(
      `Area factor adjustment: ${areaAdjustment} ILS.`,
    );
  }

  const confidence =
    input.durationBucket !== undefined &&
    input.partsBucket !== undefined
      ? 0.9
      : 0.75;

  return {
    minPrice,
    maxPrice,
    status: "fair",
    confidence,
    explanationFactors,
    min: minPrice,
    max: maxPrice,
    currency: "ILS",
    rationale: explanationFactors.join(" "),
  };
}

export function evaluateOffer(
  price: number,
  range: Pick<FairPriceResult, "minPrice" | "maxPrice">,
): OfferEvaluation {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(range.minPrice) ||
    !Number.isFinite(range.maxPrice) ||
    range.minPrice < 0 ||
    range.maxPrice < range.minPrice
  ) {
    return {
      status: "insufficient_data",
      explanation: "The price range or offer price is invalid.",
    };
  }

  const rangeWidth = range.maxPrice - range.minPrice;
  const tolerance = Math.max(rangeWidth * 0.15, 10);

  if (price < range.minPrice - tolerance) {
    return {
      status: "low",
      explanation: "The offer is noticeably below the estimated fair range.",
    };
  }

  if (price <= range.maxPrice) {
    return {
      status: "fair",
      explanation: "The offer is within the estimated fair range.",
    };
  }

  if (price <= range.maxPrice + tolerance) {
    return {
      status: "slightly_high",
      explanation: "The offer is slightly above the estimated fair range.",
    };
  }

  return {
    status: "high",
    explanation: "The offer is significantly above the estimated fair range.",
  };
}